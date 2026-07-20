require('dotenv').config({ quiet: true });

const express = require('express');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { ApiError, GoogleGenAI, Type } = require('@google/genai');
const firestoreService = require('./services/firestore');

const app = express();
const PORT = process.env.PORT || 8080;

// ─────────────────────────────────────────────────────────────────────────────
// PROCESS-LEVEL SAFETY NET.
// Firestore/gRPC clients (and other async libs) can reject promises that
// never touch our own try/catch blocks — e.g. lazy credential resolution
// deep inside google-auth-library firing after the request that triggered
// it has already returned a response. Without these handlers, that kind of
// failure crashes the entire Node process, taking down every other
// in-flight and future request with it. A Firestore write failure must
// never be allowed to do that: it should be logged and the app should keep
// serving traffic. This is a deliberate last-resort guard on top of the
// try/catch already inside services/firestore.js — not a replacement for it.
// ─────────────────────────────────────────────────────────────────────────────
process.on('unhandledRejection', (reason) => {
  console.error('[UnhandledRejection] Caught to keep the server alive:', reason?.stack || reason?.message || reason);
});
process.on('uncaughtException', (err) => {
  console.error('[UncaughtException] Caught to keep the server alive:', err?.stack || err?.message || err);
});

const config = {
  geminiApiKey: process.env.GEMINI_API_KEY,
  geminiModel: process.env.GEMINI_MODEL || 'gemini-2.5-flash-lite',
  compareMinDays: Number(process.env.HISAAB_COMPARE_MIN_DAYS || process.env.DECISION_COMPARE_MIN_DAYS || 20),
  defaultPromoDiscountPct: Number(process.env.HISAAB_DEFAULT_PROMO_DISCOUNT_PCT || 10),
};
const DEMO_USER_ID = 'hisaab-demo-user';
firestoreService.initializeFirestore();

const simulationResponseSchema = {
  type: Type.OBJECT,
  properties: {
    recommendation: { type: Type.STRING },
    why: { type: Type.STRING },
    outcome_metric_label: { type: Type.STRING },
    detected_language: { type: Type.STRING },
  },
  required: [
    'recommendation',
    'why',
    'detected_language',
  ],
};

function createGeminiClient() {
  return new GoogleGenAI({ apiKey: config.geminiApiKey });
}

function logJson(label, value) {
  console.log(`[${new Date().toISOString()}] ${label}:`, JSON.stringify(value, null, 2));
}

function getGeminiResponseText(response) {
  if (!response) {
    return '';
  }

  if (typeof response.text === 'string') {
    return response.text;
  }

  const parts = response.candidates?.[0]?.content?.parts || [];
  return parts
    .map(part => part.text || '')
    .filter(Boolean)
    .join('');
}

function stripMarkdownCodeFence(text) {
  const trimmed = String(text || '').trim();
  const fenceMatch = trimmed.match(/^```(?:json|javascript|js)?\s*([\s\S]*?)\s*```$/i);
  return fenceMatch ? fenceMatch[1].trim() : trimmed;
}

function extractBalancedJson(text) {
  const source = stripMarkdownCodeFence(text);
  const start = source.search(/[\[{]/);

  if (start === -1) {
    return source;
  }

  const opening = source[start];
  const closing = opening === '{' ? '}' : ']';
  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let i = start; i < source.length; i += 1) {
    const char = source[i];

    if (escaped) {
      escaped = false;
      continue;
    }

    if (char === '\\') {
      escaped = true;
      continue;
    }

    if (char === '"') {
      inString = !inString;
      continue;
    }

    if (inString) {
      continue;
    }

    if (char === opening) {
      depth += 1;
    } else if (char === closing) {
      depth -= 1;
      if (depth === 0) {
        return source.slice(start, i + 1).trim();
      }
    }
  }

  return source.slice(start).trim();
}

function parseSimulationResponse(rawText) {
  if (!rawText || !String(rawText).trim()) {
    return {
      ok: false,
      cleanedText: '',
      error: 'Gemini returned an empty response.',
    };
  }

  const cleanedText = extractBalancedJson(rawText);

  try {
    let parsed = JSON.parse(cleanedText);

    if (typeof parsed === 'string') {
      parsed = JSON.parse(extractBalancedJson(parsed));
    }

    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return {
        ok: false,
        cleanedText,
        error: 'Gemini returned JSON, but it was not an object.',
      };
    }

    return { ok: true, cleanedText, value: parsed };
  } catch (err) {
    return {
      ok: false,
      cleanedText,
      error: `Could not parse Gemini response as JSON: ${err.message}`,
    };
  }
}

function normalizeGeneratedResponse(parsed) {
  const normalized = { ...parsed };
  normalized.recommendation = String(normalized.recommendation || 'Review this change carefully before using it in your shop.');
  normalized.why = String(normalized.why || 'The wording could not be generated, but the calculated number is still available.');
  normalized.outcome_metric_label = normalized.outcome_metric_label ? String(normalized.outcome_metric_label) : undefined;
  normalized.detected_language = String(normalized.detected_language || 'en').trim() || 'en';

  return normalized;
}

function detectFallbackLanguage(question) {
  const text = String(question || '').toLowerCase();
  // Only Hindi and English are launch-ready in the fallback wording layer.
  // Other Indian scripts (Tamil/Bengali/Telugu/Kannada) can be detected in
  // the input, but the safety-net wording falls back to English until those
  // languages are added to fallbackGeneratedResponse with native-speaker
  // review — matching our stated scope of "shipping fewer languages well
  // rather than more languages poorly."
  if (/[\u0900-\u097F]/.test(text) || /\b(agar|main|badha|doon|toh|kya|asar|padega|hoga|nahi|dukandar)\b/.test(text)) {
    return 'hi';
  }
  return 'en';
}

function fallbackGeneratedResponse(computed, language = 'en') {
  const metric = computed.outcome_metric === 'repeat_orders' ? 'repeat customer orders' : 'total orders';
  const metricHi = computed.outcome_metric === 'repeat_orders' ? 'दोहराए जाने वाले ग्राहक ऑर्डर' : 'कुल ऑर्डर';
  const smallEffect = Math.abs(computed.outcome_value) < 1 || computed.confidence < 0.45;
  const isHindi = language === 'hi';

  if (smallEffect) {
    return {
      recommendation: isHindi
        ? 'इस पैटर्न के आधार पर अभी कोई बड़ा निर्णय न लें।'
        : 'Do not make a big decision from this pattern yet.',
      why: isHindi
        ? `आपके अपलोड किए गए डेटा में अभी तक इस बदलाव से ${metricHi} पर कोई विश्वसनीय असर नहीं दिख रहा है, इसलिए इसे पूरी तरह लागू करने से पहले एक छोटा नियंत्रित परीक्षण करें।`
        : `Your uploaded data does not yet show a reliable ${metric} effect from this lever, so use a small controlled test before rollout.`,
      outcome_metric_label: isHindi ? metricHi : metric,
      detected_language: language,
      source: 'server_fallback_for_low_confidence',
    };
  }

  if (computed.outcome_value < 0) {
    const magnitude = Math.abs(computed.outcome_value);
    return {
      recommendation: isHindi
        ? 'इस बदलाव को सावधानी से जांचें; ऑर्डर घट सकते हैं।'
        : 'Be careful with this change; the data points to fewer orders.',
      why: isHindi
        ? `आपके इतिहास के अनुसार इस बदलाव से ${metricHi} में लगभग ${magnitude}% की कमी आ सकती है।`
        : `Your history links this lever with about ${magnitude}% fewer ${metric}.`,
      outcome_metric_label: isHindi ? metricHi : metric,
      detected_language: language,
      source: 'server_fallback',
    };
  }

  return {
    recommendation: isHindi
      ? 'इस बदलाव को पहले एक छोटे परीक्षण से आजमाएं, फिर व्यापक रूप से लागू करें।'
      : 'This change looks worth a small test before rolling it out widely.',
    why: isHindi
      ? `आपके इतिहास के अनुसार इस बदलाव से ${metricHi} में लगभग ${computed.outcome_value}% की बढ़ोतरी हो सकती है।`
      : `Your history links this lever with about ${computed.outcome_value}% more ${metric}.`,
    outcome_metric_label: isHindi ? metricHi : metric,
    detected_language: language,
    source: 'server_fallback',
  };
}

function alignGeneratedWithComputed(generated, computed, expectedLanguage = 'en') {
  const text = `${generated.recommendation} ${generated.why}`.toLowerCase();
  const saysDecrease = /decreas|drop|fewer|lower|declin|lose|reduc/.test(text);
  const saysIncrease = /increas|grow|lift|more|higher|gain|boost/.test(text);
  const smallEffect = Math.abs(computed.outcome_value) < 1 || computed.confidence < 0.45;
  const language = String(generated.detected_language || 'en').toLowerCase();
  const expected = String(expectedLanguage || 'en').toLowerCase();
  // Detect language drift in the actual generated text — not just what Gemini
  // *claims* it produced via detected_language. If we asked for Hindi and got
  // no Devanagari characters back, the "language brain" silently reverted to
  // English despite the prompt instruction — treat that as a mismatch.
  const combinedText = `${generated.recommendation || ''} ${generated.why || ''}`;
  const hasDevanagari = /[\u0900-\u097F]/.test(combinedText);
  const languageMismatch =
    (expected === 'en' && !['en', 'eng', 'english'].includes(language)) ||
    (expected === 'hi' && !hasDevanagari);

  if (smallEffect || languageMismatch || (computed.outcome_value > 0 && saysDecrease) || (computed.outcome_value < 0 && saysIncrease)) {
    return fallbackGeneratedResponse(computed, expected);
  }

  return generated;
}

function toNumber(value) {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  const parsed = Number(String(value).replace(/[^0-9.-]/g, ''));
  return Number.isFinite(parsed) ? parsed : undefined;
}

function toBool(value) {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  const normalized = String(value).trim().toLowerCase();
  if (['true', 'yes', 'y', '1', 'promo', 'active'].includes(normalized)) {
    return true;
  }
  if (['false', 'no', 'n', '0', 'none', 'inactive'].includes(normalized)) {
    return false;
  }
  return undefined;
}

function mean(values) {
  return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
}

function variance(values) {
  if (values.length < 2) {
    return 0;
  }

  const avg = mean(values);
  return values.reduce((sum, value) => sum + Math.pow(value - avg, 2), 0) / (values.length - 1);
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function round(value, digits = 1) {
  const factor = Math.pow(10, digits);
  return Math.round(value * factor) / factor;
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];

    if (char === '"' && inQuotes && next === '"') {
      field += '"';
      i += 1;
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      row.push(field);
      field = '';
    } else if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && next === '\n') {
        i += 1;
      }
      row.push(field);
      if (row.some(cell => cell.trim() !== '')) {
        rows.push(row);
      }
      row = [];
      field = '';
    } else {
      field += char;
    }
  }

  row.push(field);
  if (row.some(cell => cell.trim() !== '')) {
    rows.push(row);
  }

  return rows;
}

function normalizeHeader(header) {
  return String(header || '').toLowerCase().replace(/^\uFEFF/, '').replace(/[^a-z0-9]/g, '');
}

// Finds the actual sheet header that best matches a user-typed column name
// (e.g. from the "Which column is your order date?" manual-input prompt).
// Tries exact match first, then normalized (case/punctuation-insensitive)
// match, then a normalized substring match in both directions — someone
// might type "order date" when the real header is "Order Date (IST)".
function findMatchingHeader(headers, typedValue) {
  const typed = String(typedValue || '').trim();
  if (!typed) return null;
  const exact = headers.find(h => h === typed);
  if (exact) return exact;
  const normalizedTyped = normalizeHeader(typed);
  if (!normalizedTyped) return null;
  const normalizedExact = headers.find(h => normalizeHeader(h) === normalizedTyped);
  if (normalizedExact) return normalizedExact;
  const substringMatch = headers.find(h => {
    const nh = normalizeHeader(h);
    return nh.includes(normalizedTyped) || normalizedTyped.includes(nh);
  });
  return substringMatch || null;
}

function getSheetCsvUrl(sheetUrl) {
  if (!sheetUrl || !String(sheetUrl).trim()) {
    return null;
  }

  const text = String(sheetUrl).trim();
  if (/^https:\/\/docs\.google\.com\/spreadsheets\/d\/e\//.test(text) && text.includes('/pub?')) {
    return text.replace('/pub?', '/pub?output=csv&');
  }

  const id = text.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/)?.[1];
  if (!id) {
    if (/docs\.google\.com\/document\//.test(text)) {
      throw new Error("That looks like a Google Doc link, not a Google Sheet. Copy the link from a Sheets file (docs.google.com/spreadsheets/...) instead.");
    }
    if (/docs\.google\.com\/(presentation|forms)\//.test(text)) {
      throw new Error('That looks like a Google Slides/Forms link, not a Google Sheet. Copy the link from a Sheets file instead.');
    }
    if (/^https?:\/\//.test(text)) {
      throw new Error("That doesn't look like a Google Sheets link. Paste the URL from a Google Sheets file (it should contain /spreadsheets/d/...).");
    }
    throw new Error("That doesn't look like a valid URL. Paste the full link to a Google Sheets file, starting with https://.");
  }

  const gid = text.match(/[?&]gid=([0-9]+)/)?.[1];
  return `https://docs.google.com/spreadsheets/d/${id}/export?format=csv${gid ? `&gid=${gid}` : ''}`;
}

function rowsToObjects(rows) {
  const headers = rows[0] || [];
  return rows.slice(1).map(row => {
    const item = {};
    headers.forEach((header, index) => {
      item[header] = row[index] || '';
    });
    return item;
  });
}

function parseOrderDate(value) {
  const raw = String(value || '').trim();
  if (!raw) return null;

  const cleaned = raw.replace(/\bIST\b/i, '').replace(/^[A-Za-z]{3},\s*/, '').trim();
  const parsed = new Date(cleaned);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed;
  }

  const monthNames = {
    jan: 0, january: 0, feb: 1, february: 1, mar: 2, march: 2, apr: 3, april: 3,
    may: 4, jun: 5, june: 5, jul: 6, july: 6, aug: 7, august: 7, sep: 8, sept: 8,
    september: 8, oct: 9, october: 9, nov: 10, november: 10, dec: 11, december: 11,
  };
  const match = cleaned.match(/(\d{1,2})\s+([A-Za-z]+),?\s+(\d{4})/);
  if (!match) return null;
  const month = monthNames[match[2].toLowerCase()];
  if (month === undefined) return null;
  return new Date(Number(match[3]), month, Number(match[1]));
}

function monthKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function getColumnByConcept(classification, concept, minConfidence = 0.55) {
  const candidates = Object.entries(classification || {})
    .filter(([, details]) => details.classification === concept && Number(details.confidence) >= minConfidence)
    .sort((a, b) => Number(b[1].confidence) - Number(a[1].confidence));
  return candidates[0]?.[0];
}

function normalizeClassification(parsed, headers) {
  const normalized = {};
  const source = Array.isArray(parsed?.columns) ? parsed.columns : Object.entries(parsed || {}).map(([header, value]) => ({ header, ...value }));

  for (const item of source) {
    const header = item.header || item.column || item.name;
    if (!headers.includes(header)) continue;
    normalized[header] = {
      classification: String(item.classification || item.concept || 'none_of_these'),
      confidence: clamp(Number(item.confidence) || 0, 0, 1),
    };
  }

  for (const header of headers) {
    if (!normalized[header]) {
      normalized[header] = { classification: 'none_of_these', confidence: 0 };
    }
  }

  return normalized;
}

async function classifySheetColumns(headers, samples) {
  const prompt = `Here are column headers and sample rows from a small business's order data spreadsheet.

Headers:
${JSON.stringify(headers, null, 2)}

Sample rows:
${JSON.stringify(samples, null, 2)}

For each column, classify what real-world concept it most likely represents. Choose exactly one classification from:
- order_date
- order_count_identifier (a unique ID per order, NOT a count)
- order_value_or_price
- shipping_or_delivery_fee
- promotional_flag
- customer_identifier
- order_status
- none_of_these

Respond with ONLY raw JSON in this shape:
{
  "columns": [
    { "header": "<original header>", "classification": "<one allowed classification>", "confidence": <0 to 1> }
  ]
}

Be conservative. If a column's purpose is ambiguous or does not clearly fit one of the concepts, classify it as none_of_these rather than guessing.`;

  const client = createGeminiClient();
  const response = await client.models.generateContent({
    model: config.geminiModel,
    contents: prompt,
    config: {
      maxOutputTokens: 2048,
      responseMimeType: 'application/json',
      thinkingConfig: { thinkingBudget: 0 },
      systemInstruction: 'You classify spreadsheet columns for small-business order data. Always return valid JSON only.',
    },
  });

  const parseResult = parseSimulationResponse(getGeminiResponseText(response));
  if (!parseResult.ok) {
    throw new Error(parseResult.error);
  }

  return normalizeClassification(parseResult.value, headers);
}

function classifySheetColumnsFallback(headers) {
  const normalized = {};
  for (const header of headers) {
    const key = normalizeHeader(header);
    let classification = 'none_of_these';
    let confidence = 0.35;
    if (/date|soldat|created/.test(key)) [classification, confidence] = ['order_date', 0.7];
    else if (/orderno|orderid|invoice|receipt/.test(key)) [classification, confidence] = ['order_count_identifier', 0.75];
    else if (/buyer|customer|client|phone|email/.test(key)) [classification, confidence] = ['customer_identifier', 0.7];
    else if (/ship|delivery|courier|freight/.test(key) && /fee|charge|cost|amount/.test(key)) [classification, confidence] = ['shipping_or_delivery_fee', 0.72];
    else if (/price|total|amount|revenue|sales/.test(key)) [classification, confidence] = ['order_value_or_price', 0.65];
    else if (/coupon|promo|discount|sale/.test(key)) [classification, confidence] = ['promotional_flag', 0.65];
    else if (/^(order)?status$|orderstate/.test(key)) [classification, confidence] = ['order_status', 0.65];
    normalized[header] = { classification, confidence };
  }
  return normalized;
}

async function parseSheetData(csvText, manualOrderColumn = null) {
  const rows = parseCsv(csvText);
  if (rows.length < 2) {
    return {
      headers: rows[0] || [],
      rawRows: [],
      classification: {},
      classification_source: 'none',
      monthlyRows: [],
      metricSources: {},
    };
  }

  const headers = rows[0];
  const rawRows = rowsToObjects(rows);
  const samples = rawRows.slice(0, 10);
  let classification;
  let classificationSource = 'gemini';

  try {
    classification = await classifySheetColumns(headers, samples);
  } catch (err) {
    console.error('Sheet classification error:', err.message);
    classification = classifySheetColumnsFallback(headers);
    classificationSource = 'local_fallback_after_gemini_error';
  }

  // If the user manually identified their order-date column (because
  // automatic classification couldn't find one confidently), force that
  // column's classification to order_date at full confidence BEFORE
  // aggregation runs. This has to happen here, not as a post-aggregation
  // patch — aggregateSheetRows buckets every row by month using whichever
  // column is classified as order_date, so fixing this after the fact is
  // structurally too late; the monthly rows would already be empty.
  let manualColumnMatch = null;
  let manualColumnUnmatched = null;
  if (manualOrderColumn) {
    const matchedHeader = findMatchingHeader(headers, manualOrderColumn);
    if (matchedHeader) {
      classification[matchedHeader] = { classification: 'order_date', confidence: 1, source: 'manual' };
      manualColumnMatch = matchedHeader;
    } else {
      // The typed value didn't match any real header — this is worth
      // surfacing distinctly from "we still can't find order data at all",
      // since the fix here is "check your spelling," not "add more data."
      manualColumnUnmatched = manualOrderColumn;
    }
  }

  const monthly = aggregateSheetRows(rawRows, classification);
  return {
    headers,
    rawRows,
    classification,
    classification_source: manualColumnMatch ? 'manual_override' : classificationSource,
    monthlyRows: monthly.rows,
    metricSources: monthly.metricSources,
    columns: monthly.columns,
    manual_column_match: manualColumnMatch,
    manual_column_unmatched: manualColumnUnmatched,
  };
}

async function getUserSheetData(sheetUrl, manualInputs = {}, csvText = '') {
  const manualOrderColumn = typeof manualInputs?.orders === 'string' && manualInputs.orders.trim()
    ? manualInputs.orders.trim()
    : null;

  if (csvText && String(csvText).trim()) {
    const parsed = await parseSheetData(String(csvText), manualOrderColumn);
    applyManualInputs(parsed.monthlyRows, parsed.metricSources, manualInputs);
    return { parsed, error: null };
  }

  const csvUrl = getSheetCsvUrl(sheetUrl);
  if (!csvUrl) {
    return { parsed: null, error: null };
  }

  let response;
  try {
    response = await fetch(csvUrl);
  } catch (err) {
    // Raw fetch/network errors (DNS failure, timeout, connection refused,
    // etc.) surface from Node as terse, non-actionable strings like "fetch
    // failed" — never show that to the user directly.
    throw new Error("Couldn't reach that Google Sheet. Check your internet connection and that the link is correct, then try again.");
  }

  if (response.status === 401 || response.status === 403) {
    throw new Error("Couldn't read that sheet — it looks private. Make sure it's shared as \"Anyone with the link can view\" in Google Sheets, then try again.");
  }
  if (!response.ok) {
    throw new Error(`Could not fetch the Google Sheet CSV export (HTTP ${response.status}). Make sure the sheet is publicly viewable.`);
  }

  const contentType = response.headers.get('content-type') || '';
  const text = await response.text();
  // A private or restricted sheet doesn't fail the HTTP request — Google
  // responds 200 with an HTML sign-in/access-request page instead of a CSV.
  // Detect that before trying to parse it as data, so the user gets an
  // honest "this looks private" message instead of a confusing "0 months
  // found" result from garbage-parsed HTML.
  const looksLikeHtml = contentType.includes('text/html') || /^\s*<(!doctype|html)/i.test(text);
  if (looksLikeHtml) {
    throw new Error("Couldn't read that sheet — it looks private or restricted. Make sure it's shared as \"Anyone with the link can view\" in Google Sheets, then try again.");
  }

  const parsed = await parseSheetData(text, manualOrderColumn);
  applyManualInputs(parsed.monthlyRows, parsed.metricSources, manualInputs);
  return { parsed, error: null };
}

function aggregateSheetRows(rawRows, classification) {
  const columns = {
    order_date: getColumnByConcept(classification, 'order_date'),
    order_count_identifier: getColumnByConcept(classification, 'order_count_identifier'),
    order_value_or_price: getColumnByConcept(classification, 'order_value_or_price'),
    shipping_or_delivery_fee: getColumnByConcept(classification, 'shipping_or_delivery_fee'),
    promotional_flag: getColumnByConcept(classification, 'promotional_flag'),
    customer_identifier: getColumnByConcept(classification, 'customer_identifier'),
    order_status: getColumnByConcept(classification, 'order_status'),
  };
  const buckets = new Map();
  const seenCustomers = new Set();
  const customerCounts = new Map();
  const datedRows = rawRows
    .map(row => ({ row, date: parseOrderDate(row[columns.order_date]) }))
    .filter(item => item.date)
    .sort((a, b) => a.date - b.date);

  for (const { row, date } of datedRows) {
    const key = monthKey(date);
    if (!buckets.has(key)) {
      buckets.set(key, {
        month: key,
        orderIds: new Set(),
        rowCount: 0,
        orderValues: [],
        deliveryFees: [],
        promoValues: [],
        repeatOrders: 0,
      });
    }

    const bucket = buckets.get(key);
    const orderId = columns.order_count_identifier ? String(row[columns.order_count_identifier] || '').trim() : '';
    const customer = columns.customer_identifier ? String(row[columns.customer_identifier] || '').trim().toLowerCase() : '';
    const status = columns.order_status ? String(row[columns.order_status] || '').toLowerCase() : '';
    if (/cancel|refund|return/.test(status)) continue;

    bucket.rowCount += 1;
    if (orderId) bucket.orderIds.add(orderId);

    const value = columns.order_value_or_price ? toNumber(row[columns.order_value_or_price]) : undefined;
    if (value !== undefined) bucket.orderValues.push(value);

    const fee = columns.shipping_or_delivery_fee ? toNumber(row[columns.shipping_or_delivery_fee]) : undefined;
    if (fee !== undefined) bucket.deliveryFees.push(fee);

    const promo = columns.promotional_flag ? toBool(row[columns.promotional_flag]) : undefined;
    if (promo !== undefined) bucket.promoValues.push(promo);

    if (customer) {
      if (seenCustomers.has(customer)) bucket.repeatOrders += 1;
      seenCustomers.add(customer);
      customerCounts.set(customer, (customerCounts.get(customer) || 0) + 1);
    }
  }

  const totalCustomerValues = [...customerCounts.values()].reduce((sum, count) => sum + count, 0);
  const uniqueCustomerCount = [...customerCounts.values()].filter(count => count === 1).length;
  const uniqueBuyerFraction = totalCustomerValues ? uniqueCustomerCount / totalCustomerValues : 1;
  const repeatSignalIsSparse = columns.customer_identifier && uniqueBuyerFraction > 0.85;

  const rows = [...buckets.values()].map(bucket => ({
    month: bucket.month,
    orders: bucket.orderIds.size || bucket.rowCount,
    repeat_orders: columns.customer_identifier ? bucket.repeatOrders : undefined,
    avg_order_value: bucket.orderValues.length ? mean(bucket.orderValues) : undefined,
    delivery_fee: bucket.deliveryFees.length ? mean(bucket.deliveryFees) : undefined,
    promo_active: bucket.promoValues.length ? bucket.promoValues.some(Boolean) : undefined,
  })).sort((a, b) => a.month.localeCompare(b.month));

  const metricSources = {
    orders: { status: rows.length && columns.order_date ? 'derived' : 'unavailable', source: 'sheet', column: columns.order_count_identifier || '(row count)', confidence: columns.order_count_identifier ? classification[columns.order_count_identifier].confidence : 0.6 },
    repeat_orders: {
      status: columns.customer_identifier ? repeatSignalIsSparse ? 'derived_low_confidence' : 'derived' : 'unavailable',
      source: columns.customer_identifier ? 'sheet' : null,
      column: columns.customer_identifier || null,
      confidence: columns.customer_identifier ? repeatSignalIsSparse ? Math.min(0.3, classification[columns.customer_identifier].confidence) : classification[columns.customer_identifier].confidence : 0,
      unique_buyer_fraction: round(uniqueBuyerFraction, 3),
      repeat_customer_count: totalCustomerValues - uniqueCustomerCount,
    },
    avg_order_value: { status: columns.order_value_or_price ? 'derived' : 'unavailable', source: columns.order_value_or_price ? 'sheet' : null, column: columns.order_value_or_price || null, confidence: columns.order_value_or_price ? classification[columns.order_value_or_price].confidence : 0 },
    delivery_fee: { status: columns.shipping_or_delivery_fee ? 'derived' : 'unavailable', source: columns.shipping_or_delivery_fee ? 'sheet' : null, column: columns.shipping_or_delivery_fee || null, confidence: columns.shipping_or_delivery_fee ? classification[columns.shipping_or_delivery_fee].confidence : 0 },
    promo_active: { status: columns.promotional_flag ? 'derived' : 'unavailable', source: columns.promotional_flag ? 'sheet' : null, column: columns.promotional_flag || null, confidence: columns.promotional_flag ? classification[columns.promotional_flag].confidence : 0 },
    trend: { status: rows.length >= 2 ? 'derived' : 'unavailable', source: rows.length >= 2 ? 'sheet' : null, column: columns.order_date || null, confidence: columns.order_date ? classification[columns.order_date].confidence : 0 },
  };

  return { rows, metricSources, columns };
}

function applyManualInputs(rows, metricSources, manualInputs = {}) {
  for (const [field, rawValue] of Object.entries(manualInputs || {})) {
    if (field === 'repeat_orders_proxy' && toBool(rawValue)) {
      for (const row of rows) row.repeat_orders = row.orders;
      metricSources.repeat_orders = { status: 'derived_manual', source: 'manual_proxy', column: null, confidence: 0.45 };
      continue;
    }
    if (!['delivery_fee', 'avg_order_value', 'promo_active'].includes(field)) continue;
    const value = field === 'promo_active' ? toBool(rawValue) : toNumber(rawValue);
    if (value === undefined) continue;
    for (const row of rows) row[field] = value;
    metricSources[field] = { status: 'derived_manual', source: 'manual', column: null, confidence: 1 };
  }
}

function metricDisplayName(field, language = 'en') {
  const labels = {
    orders: 'Orders per month',
    repeat_orders: 'Repeat orders',
    avg_order_value: 'Order value',
    delivery_fee: 'Delivery fee',
    promo_active: 'Promotions',
    trend: 'Date trend',
  };
  const labelsHi = {
    orders: 'प्रति माह ऑर्डर',
    repeat_orders: 'दोहराए जाने वाले ऑर्डर',
    avg_order_value: 'ऑर्डर की राशि',
    delivery_fee: 'डिलीवरी शुल्क',
    promo_active: 'प्रमोशन',
    trend: 'दिनांक प्रवृत्ति',
  };
  if (language === 'hi') return labelsHi[field] || field.replace(/_/g, ' ');
  return labels[field] || field.replace(/_/g, ' ');
}

function isSourceUsable(info) {
  return ['derived', 'derived_manual', 'derived_low_confidence', 'fallback'].includes(info?.status);
}

function capabilityStatus(requiredSources, months, options = {}) {
  const missing = requiredSources
    .filter(item => !isSourceUsable(item.source))
    .map(item => item.label);

  if (missing.length) {
    return {
      status: 'missing',
      reason: `Needs ${missing.join(', ')} before Hisaab can calculate this honestly.`,
    };
  }

  const weakSource = requiredSources.find(item => item.source?.status === 'derived_low_confidence');
  if (weakSource) {
    return {
      status: 'limited',
      reason: `${weakSource.label} is present, but the signal is weak in this sheet.`,
    };
  }

  if (options.requiresVariation && !options.hasVariation) {
    return {
      status: 'limited',
      reason: `${options.variationLabel || 'This lever'} exists, but there is not enough before/after variation yet.`,
    };
  }

  if (months < (options.minMonths || 4)) {
    return {
      status: 'limited',
      reason: `Only ${months} month${months === 1 ? '' : 's'} of history found; use this as a directional read.`,
    };
  }

  return {
    status: 'ready',
    reason: 'Ready for directional what-if analysis.',
  };
}

function buildAnalyticsCapabilities(parsed) {
  const sources = parsed.metricSources || {};
  const rows = parsed.monthlyRows || [];
  const months = rows.length;
  const promoValues = rows.map(row => row.promo_active).filter(value => value !== undefined);
  const hasPromoVariation = new Set(promoValues).size > 1;

  const capabilities = [
    {
      key: 'sales_trend',
      label: 'Orders and sales trend',
      ...capabilityStatus([
        { label: 'order date', source: sources.trend },
        { label: 'order count', source: sources.orders },
      ], months, { minMonths: 2 }),
    },
    {
      key: 'pricing',
      label: 'Pricing changes',
      ...capabilityStatus([
        { label: 'order value or price', source: sources.avg_order_value },
        { label: 'order count', source: sources.orders },
      ], months),
    },
    {
      key: 'delivery_fee',
      label: 'Delivery fee changes',
      ...capabilityStatus([
        { label: 'delivery fee', source: sources.delivery_fee },
        { label: 'order count', source: sources.orders },
      ], months),
    },
    {
      key: 'promotions',
      label: 'Promos and discounts',
      ...capabilityStatus([
        { label: 'promo or discount flag', source: sources.promo_active },
        { label: 'order count', source: sources.orders },
      ], months, {
        requiresVariation: true,
        hasVariation: hasPromoVariation,
        variationLabel: 'Promo history',
      }),
    },
    {
      key: 'repeat_customers',
      label: 'Repeat customers',
      ...capabilityStatus([
        { label: 'customer identifier', source: sources.repeat_orders },
        { label: 'order count', source: sources.orders },
      ], months),
    },
  ];

  const ready = capabilities.filter(item => item.status === 'ready');
  const limited = capabilities.filter(item => item.status === 'limited');
  const missing = capabilities.filter(item => item.status === 'missing');

  return {
    capabilities,
    ready_count: ready.length,
    limited_count: limited.length,
    missing_count: missing.length,
    ready_labels: ready.map(item => item.label),
    limited_labels: limited.map(item => item.label),
    missing_labels: missing.map(item => item.label),
  };
}

function summarizeSheetParse(parsed) {
  const sources = parsed.metricSources || {};
  const months = parsed.monthlyRows?.length || 0;
  const capabilityMap = buildAnalyticsCapabilities(parsed);
  const importantMissing = Object.entries(sources)
    .filter(([field, info]) => ['repeat_orders', 'avg_order_value', 'delivery_fee', 'promo_active'].includes(field) && info.status === 'unavailable')
    .map(([field]) => metricDisplayName(field).toLowerCase());
  const available = Object.entries(sources)
    .filter(([, info]) => ['derived', 'derived_manual', 'derived_low_confidence'].includes(info.status))
    .map(([field]) => metricDisplayName(field).toLowerCase());
  const hasPrice = ['derived', 'derived_manual', 'derived_low_confidence'].includes(sources.avg_order_value?.status);
  const hasFee = ['derived', 'derived_manual', 'derived_low_confidence'].includes(sources.delivery_fee?.status);
  const hasPromo = ['derived', 'derived_manual', 'derived_low_confidence'].includes(sources.promo_active?.status);

  const readyLabels = capabilityMap.ready_labels.map(label => label.toLowerCase());
  let bodyLine = readyLabels.length
    ? `Ready for ${readyLabels.join(', ')}.`
    : available.length
      ? `I can use ${available.join(', ')}, but the analytics will be limited until more history or columns are available.`
      : 'I found the sheet, but not enough reliable business columns yet.';
  if (hasPrice && hasFee && hasPromo && months >= 4) {
    bodyLine = 'Enough to look at pricing, delivery fees, and promos honestly.';
  }

  const firstLimited = capabilityMap.capabilities.find(item => item.status === 'limited');
  const firstMissing = capabilityMap.capabilities.find(item => item.status === 'missing');

  const details = Object.entries(sources).map(([field, info]) => {
    if (info.status === 'derived') {
      return `${metricDisplayName(field)} — matched from your ${info.column} column`;
    }
    if (info.status === 'derived_low_confidence') {
      return `${metricDisplayName(field)} — matched from your ${info.column} column, but the signal is weak`;
    }
    if (info.status === 'derived_manual') {
      return `${metricDisplayName(field)} — provided by you`;
    }
    if (info.status === 'fallback') {
      return `${metricDisplayName(field)} — using sample data`;
    }
    return `${metricDisplayName(field)} — unavailable in this sheet`;
  });

  return {
    months,
    raw_rows: parsed.rawRows?.length || 0,
    headers: parsed.headers || [],
    matched_columns: parsed.columns || {},
    classification_source: parsed.classification_source,
    body_line: bodyLine,
    caveat_line: importantMissing.length
      ? `${importantMissing[0]} isn't in this sheet, so I'll flag it if that matters for your question.`
      : firstLimited
        ? `${firstLimited.label.toLowerCase()} is limited: ${firstLimited.reason}`
        : firstMissing
          ? `${firstMissing.label.toLowerCase()} is not available yet: ${firstMissing.reason}`
          : '',
    capability_map: capabilityMap,
    capability_line: `${capabilityMap.ready_count} ready · ${capabilityMap.limited_count} limited · ${capabilityMap.missing_count} missing`,
    details,
  };
}

function chartSeries(data, metric = 'orders') {
  // Plot whatever metric the question is actually about. Previously this
  // always plotted raw order counts regardless of outcome_metric, so a
  // question about repeat orders or order value showed the exact same chart
  // as a question about total orders — misleading for a tool whose whole
  // premise is "reckoned from your own numbers." avg_order_value isn't always
  // present per-row in every data path, so fall back to orders if the
  // requested metric isn't actually populated on this dataset. Output key is
  // always 'value' (plus 'orders' for backward compatibility) so the
  // frontend doesn't need per-metric field-name logic.
  const hasMetric = data.some(row => Number.isFinite(Number(row[metric])));
  const field = hasMetric ? metric : 'orders';
  return data
    .map(row => ({ month: row.month, value: Number(row[field]), orders: Number(row.orders) }))
    .filter(point => point.month && Number.isFinite(point.value));
}

function formatMonthLabel(month) {
  const date = new Date(`${month}-01T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return month || '';
  return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit', timeZone: 'UTC' }).replace(' ', " '");
}

async function getSimulationData(sheetUrl, manualInputs = {}, csvText = '') {
  const fallback = getHistoricalData();
  let sheetError = null;

  if ((!sheetUrl || !String(sheetUrl).trim()) && (!csvText || !String(csvText).trim())) {
    return {
      data: fallback,
      dataSource: {
        mode: 'demo_fallback',
        sheet_url_used: false,
        sheet_rows_used: 0,
        fallback_rows_used: fallback.length,
        field_sources: Object.fromEntries(['orders', 'repeat_orders', 'avg_order_value', 'delivery_fee', 'promo_active', 'trend'].map(field => [field, { status: 'fallback', source: 'demo' }])),
        warning: null,
      },
    };
  }

  try {
    const sheetData = await getUserSheetData(sheetUrl, manualInputs, csvText);
    const sheetSummary = summarizeSheetParse(sheetData.parsed);
    return {
      data: sheetData.parsed.monthlyRows,
      sheetSummary,
      dataSource: {
        mode: 'sheet',
        sheet_url_used: Boolean(sheetUrl && String(sheetUrl).trim()),
        csv_used: Boolean(csvText && String(csvText).trim()),
        sheet_rows_used: sheetData.parsed.rawRows.length,
        aggregated_rows_used: sheetData.parsed.monthlyRows.length,
        classification_source: sheetData.parsed.classification_source,
        classification: sheetData.parsed.classification,
        columns: sheetData.parsed.columns,
        field_sources: sheetData.parsed.metricSources,
        manual_column_match: sheetData.parsed.manual_column_match || null,
        manual_column_unmatched: sheetData.parsed.manual_column_unmatched || null,
        warning: null,
      },
    };
  } catch (err) {
    sheetError = err.message;
  }

  return {
    data: [],
    sheetSummary: null,
    dataSource: {
      sheet_url_used: Boolean(sheetUrl && String(sheetUrl).trim()),
      sheet_rows_used: 0,
      fallback_rows_used: 0,
      field_sources: {},
      warning: sheetError,
    },
  };
}

function summarizeData(data) {
  const totalOrders = data.reduce((s, r) => s + (Number(r.orders) || 0), 0);
  const totalRepeat = data.reduce((s, r) => s + (Number(r.repeat_orders) || 0), 0);
  const last = data[data.length - 1];
  const avgOrderValues = data.map(r => r.avg_order_value).filter(Number.isFinite);
  const avgOrderValue = avgOrderValues.length ? mean(avgOrderValues) : 0;
  const promoRows = data.filter(r => r.promo_active);
  const nonPromoRows = data.filter(r => !r.promo_active);
  const avgPromoOrders = promoRows.length ? Math.round(mean(promoRows.map(r => r.orders).filter(Number.isFinite))) : 0;
  const avgNonPromoOrders = nonPromoRows.length ? Math.round(mean(nonPromoRows.map(r => r.orders).filter(Number.isFinite))) : 0;
  const peakMonth = data.reduce((best, r) => r.orders > best.orders ? r : best, data[0]);

  return {
    months: data.length,
    avg_orders: data.length ? Math.round(totalOrders / data.length) : 0,
    avg_repeat_rate_pct: totalOrders ? ((totalRepeat / totalOrders) * 100).toFixed(1) : '0.0',
    avg_order_value: avgOrderValue.toFixed(2),
    current_delivery_fee: last?.delivery_fee,
    promo_months_count: promoRows.length,
    fee_raised_twice: new Set(data.map(row => row.delivery_fee).filter(Number.isFinite)).size > 1,
    baseline_monthly_revenue: Math.round((data.length ? totalOrders / data.length : 0) * avgOrderValue),
    peak_month: peakMonth?.month,
    peak_month_orders: peakMonth?.orders,
    historical_promo_lift_pct: avgNonPromoOrders
      ? (((avgPromoOrders - avgNonPromoOrders) / avgNonPromoOrders) * 100).toFixed(1) : 0,
  };
}

function detectScenario(question, data) {
  const text = question.toLowerCase();
  const last = data[data.length - 1] || {};
  const isCod = /\bcod\b|cash\s+on\s+delivery/.test(text);
  const isPromo = /promo|promotion|discount|sale/.test(text);
  const isPrice = /price|product|aov|average order|avg order/.test(text);
  const lever = isCod ? 'cash_on_delivery' : isPromo ? 'promo_active' : isPrice ? 'avg_order_value' : 'delivery_fee';
  const outcomeMetric = /repeat|returning|loyal/.test(text) ? 'repeat_orders' : 'orders';

  const percentMatch = text.match(/(?:by|increase|raise|up)\s*(\d+(?:\.\d+)?)\s*%/) || text.match(/(\d+(?:\.\d+)?)\s*%/);
  const moneyValues = [...question.matchAll(/[₹$]?\s*(\d+(?:\.\d+)?)/g)].map(match => Number(match[1])).filter(Number.isFinite);
  let delta = 0;
  let discountDepthPct = null;
  let promoScale = 1;

  if (lever === 'promo_active') {
    delta = 1;
    if (percentMatch) {
      discountDepthPct = Number(percentMatch[1]);
      const baselineDepth = Number.isFinite(config.defaultPromoDiscountPct) && config.defaultPromoDiscountPct > 0
        ? config.defaultPromoDiscountPct
        : 10;
      promoScale = clamp(discountDepthPct / baselineDepth, 0.1, 2);
    }
  } else if (lever === 'cash_on_delivery') {
    delta = 0;
  } else {
    const current = Number(lever === 'avg_order_value' ? last.avg_order_value : last.delivery_fee) || 0;
    if (moneyValues.length >= 2 && /from/i.test(question) && /to/i.test(question)) {
      delta = moneyValues[moneyValues.length - 1] - moneyValues[0];
    } else if (percentMatch) {
      delta = current * (Number(percentMatch[1]) / 100);
    } else if (moneyValues.length) {
      delta = moneyValues[moneyValues.length - 1];
    } else {
      delta = current * 0.1;
    }
  }

  return { lever, outcomeMetric, delta, discountDepthPct, promoScale };
}

function missingCriticalFields(question, dataSource) {
  const scenario = detectScenario(question, []);
  const sources = dataSource.field_sources || {};
  const missing = [];

  function isAvailable(field) {
    return ['derived', 'derived_manual', 'fallback'].includes(sources[field]?.status);
  }

  if (!isAvailable('orders')) {
    let prompt;
    if (dataSource.manual_column_unmatched) {
      // The user already typed something, but it didn't match any real
      // header in this sheet — the fix is "check the spelling," not "we
      // still don't have enough data," so say that plainly instead of
      // repeating the original generic prompt verbatim.
      prompt = `We couldn't find a column named "${dataSource.manual_column_unmatched}" in your sheet. Please type the exact column header for your order date (check spelling/spacing).`;
    } else if (dataSource.manual_column_match) {
      // We found the column they named and used it, but no dates could
      // actually be parsed from it — this is a different, more specific
      // problem than "we don't know which column to use."
      prompt = `We used "${dataSource.manual_column_match}" as your order date column, but couldn't read any valid dates from it. Please check that column contains real dates, or type a different column name.`;
    } else {
      prompt = 'Which column contains your order date? Type the exact column header from your sheet (for example: "Order Date").';
    }
    missing.push({ field: 'orders', prompt, input_type: 'text' });
  }
  if (!isAvailable(scenario.lever)) {
    const prompt = scenario.lever === 'delivery_fee'
      ? "What's your current delivery/shipping fee? We couldn't find a reliable fee column in your sheet."
      : scenario.lever === 'avg_order_value'
        ? "What's your typical order value? We couldn't find a reliable price or revenue column in your sheet."
        : 'Were there any past discount or promotion periods? We could not find this in your sheet.';
    missing.push({ field: scenario.lever, prompt, input_type: scenario.lever === 'promo_active' ? 'boolean' : 'number' });
  }
  if (scenario.outcomeMetric === 'repeat_orders' && !isAvailable('repeat_orders')) {
    const repeatSource = sources.repeat_orders;
    const prompt = repeatSource?.status === 'derived_low_confidence'
      ? `Repeat customer tracking looks too sparse in this sheet (${Math.round((repeatSource.unique_buyer_fraction || 0) * 100)}% of buyers appear only once). Use total orders as a rough proxy instead?`
      : 'We could not identify repeat customers. Use total orders as a rough proxy for this answer?';
    missing.push({ field: 'repeat_orders_proxy', prompt, input_type: 'boolean' });
  }

  return missing;
}

function partialDataSummary(dataSource) {
  const sources = dataSource.field_sources || {};
  const found = Object.entries(sources)
    .filter(([, details]) => details.status === 'derived' || details.status === 'derived_manual')
    .map(([field]) => field.replace(/_/g, ' '));
  const missing = Object.entries(sources)
    .filter(([, details]) => details.status === 'unavailable')
    .map(([field]) => field.replace(/_/g, ' '));

  return `We found ${found.length ? found.join(', ') : 'no reliable metrics'} from your sheet${missing.length ? `, but still need ${missing.join(', ')}.` : '.'}`;
}

function linearRegression(rows, xField, yField) {
  const points = rows
    .map(row => ({ x: Number(row[xField]), y: Number(row[yField]) }))
    .filter(point => Number.isFinite(point.x) && Number.isFinite(point.y));
  const n = points.length;
  const avgX = mean(points.map(point => point.x));
  const avgY = mean(points.map(point => point.y));
  const sxx = points.reduce((sum, point) => sum + Math.pow(point.x - avgX, 2), 0);
  const sxy = points.reduce((sum, point) => sum + ((point.x - avgX) * (point.y - avgY)), 0);
  const slope = sxx > 1e-9 ? sxy / sxx : 0;
  const intercept = avgY - slope * avgX;
  const predictions = points.map(point => intercept + slope * point.x);
  const sse = points.reduce((sum, point, index) => sum + Math.pow(point.y - predictions[index], 2), 0);
  const sst = points.reduce((sum, point) => sum + Math.pow(point.y - avgY, 2), 0);
  const r2 = sst ? Math.max(0, 1 - (sse / sst)) : 0;
  const mse = n > 2 ? sse / (n - 2) : 0;
  const slopeStdError = sxx > 1e-9 && n > 2 ? Math.sqrt(mse / sxx) : 0;

  return { n, avgY, slope, r2, slopeStdError };
}

function uniqueFiniteCount(values) {
  return new Set(values.filter(Number.isFinite).map(value => String(round(value, 4)))).size;
}

function regressionEvidence(rows, leverField, outcomeField, model, language = 'en') {
  const xValues = rows.map(row => Number(row[leverField])).filter(Number.isFinite);
  const yValues = rows.map(row => Number(row[outcomeField])).filter(Number.isFinite);
  const uniqueX = uniqueFiniteCount(xValues);
  const xRange = xValues.length ? Math.max(...xValues) - Math.min(...xValues) : 0;
  const yMean = Math.abs(mean(yValues)) || 0;
  const effectSize = yMean ? Math.abs(model.slope) * xRange / yMean : 0;
  const tScore = model.slopeStdError ? Math.abs(model.slope) / model.slopeStdError : 0;
  const sampleScore = clamp((model.n - 3) / 9, 0, 1);
  const variationScore = clamp((uniqueX - 1) / 4, 0, 1);
  const fitScore = clamp(model.r2 / 0.55, 0, 1);
  const significanceScore = clamp(tScore / 2.5, 0, 1);
  const effectScore = clamp(effectSize / 0.12, 0, 1);
  const confidence = clamp(
    0.12
      + (sampleScore * 0.24)
      + (variationScore * 0.24)
      + (fitScore * 0.18)
      + (significanceScore * 0.14)
      + (effectScore * 0.08),
    0.12,
    0.92,
  );

  const reasons = [];
  if (model.n < 6) reasons.push(`only ${model.n} usable month${model.n === 1 ? '' : 's'} for this comparison`);
  if (uniqueX < 3) reasons.push(`the ${metricDisplayName(leverField, language).toLowerCase()} barely changes in this history`);
  if (tScore < 1.5) reasons.push('the relationship is weak compared with the month-to-month noise');
  if (model.r2 < 0.18) reasons.push('the lever explains very little of the movement in outcomes');

  return {
    confidence,
    uniqueX,
    xRange,
    tScore: round(tScore, 2),
    effectSize: round(effectSize * 100, 1),
    reasons,
  };
}

// The `reasons` array is a small, bounded set of English phrase templates
// produced by regressionEvidence() (see the 4 `reasons.push(...)` call sites
// above). Rather than touch the confidence math to make it language-aware,
// we translate the known output patterns here — presentation-layer only.
function translateReasonToHindi(reason) {
  const monthMatch = reason.match(/^only (\d+) usable months? for this comparison$/);
  if (monthMatch) {
    return `इस तुलना के लिए केवल ${monthMatch[1]} महीनों का उपयोग करने योग्य डेटा है`;
  }
  const leverMatch = reason.match(/^the (.+) barely changes in this history$/);
  if (leverMatch) {
    return `इस इतिहास में ${leverMatch[1]} शायद ही बदलता है`;
  }
  if (reason === 'the relationship is weak compared with the month-to-month noise') {
    return 'महीने-दर-महीने के उतार-चढ़ाव की तुलना में यह संबंध कमज़ोर है';
  }
  if (reason === 'the lever explains very little of the movement in outcomes') {
    return 'यह बदलाव परिणामों में हलचल का बहुत कम हिस्सा बताता है';
  }
  return reason; // Unknown pattern — surface the English fragment rather than nothing.
}

function lowSignalMessage({ leverLabel, reasons }, language = 'en') {
  if (language === 'hi') {
    const lead = `आपके अपलोड किए गए डेटा में अभी तक ${leverLabel} और परिणामों के बीच कोई विश्वसनीय संबंध नहीं दिखता है।`;
    if (!reasons.length) return `${lead} इसे केवल प्रारंभिक दिशा-निर्देश के रूप में उपयोग करें, निर्णायक पूर्वानुमान के रूप में नहीं।`;
    const translatedReason = translateReasonToHindi(reasons[0]);
    return `${lead} ${translatedReason.charAt(0).toUpperCase()}${translatedReason.slice(1)}। इसे केवल प्रारंभिक दिशा-निर्देश के रूप में उपयोग करें, निर्णायक पूर्वानुमान के रूप में नहीं।`;
  }
  const lead = `Your uploaded data does not yet show a reliable relationship between ${leverLabel} and results.`;
  if (!reasons.length) return `${lead} Hisaab is showing this as an early directional read, not a decision-grade forecast.`;
  return `${lead} ${reasons[0].charAt(0).toUpperCase()}${reasons[0].slice(1)}. Use this as an early directional read, not a decision-grade forecast.`;
}

function computePromoLift(data, outcomeMetric, scenario = {}) {
  const promo = data.filter(row => row.promo_active).map(row => row[outcomeMetric]);
  const nonPromo = data.filter(row => !row.promo_active).map(row => row[outcomeMetric]);
  const promoMean = mean(promo);
  const nonPromoMean = mean(nonPromo);
  const diff = promoMean - nonPromoMean;
  const se = Math.sqrt((variance(promo) / Math.max(1, promo.length)) + (variance(nonPromo) / Math.max(1, nonPromo.length)));
  const baseline = nonPromoMean || mean(data.map(row => row[outcomeMetric]));
  const basePct = baseline ? (diff / baseline) * 100 : 0;
  const baseMargin = baseline ? (1.96 * se / baseline) * 100 : 0;
  const scale = Number.isFinite(Number(scenario.promoScale)) ? Number(scenario.promoScale) : 1;
  const pct = basePct * scale;
  const margin = baseMargin * scale;
  const sampleScore = Math.min(1, Math.min(promo.length, nonPromo.length) / 6);
  const depthAssumptionPenalty = scenario.discountDepthPct === null || scenario.discountDepthPct === undefined ? 0 : 0.08;
  const promoSpread = Math.abs(basePct);
  const separationScore = clamp(promoSpread / 12, 0, 1);
  const balanceScore = clamp(Math.min(promo.length, nonPromo.length) / 4, 0, 1);
  const confidence = clamp(
    0.18 + (sampleScore * 0.3) + (balanceScore * 0.22) + (separationScore * 0.18) - depthAssumptionPenalty,
    0.18,
    0.82,
  );

  return {
    pct,
    low: pct - margin,
    high: pct + margin,
    confidence,
    method: scenario.discountDepthPct === null || scenario.discountDepthPct === undefined
      ? 'promo_vs_non_promo_average'
      : 'promo_vs_non_promo_average_scaled_by_discount_depth',
    sampleSize: promo.length + nonPromo.length,
  };
}

function computeRegressionResult(question, data, summary) {
  const scenario = detectScenario(question, data);
  const lang = detectFallbackLanguage(question);
  let outcome;

  if (scenario.lever === 'cash_on_delivery') {
    return {
      lever: scenario.lever,
      outcome_metric: scenario.outcomeMetric,
      outcome_value: 0,
      range_low: 0,
      range_high: 0,
      confidence: 0.2,
      monthly_revenue_impact: 0,
      worst_case_revenue_impact: 0,
      trend_pct: 0,
      method: 'unsupported_lever_no_cod_signal',
      sample_size: data.length,
      r2: 0,
      slope: 0,
      assumed_change: 0,
      low_signal_warning: lang === 'hi'
        ? 'इस डेटा में कैश-ऑन-डिलीवरी का इतिहास शामिल नहीं है, इसलिए Hisaab अभी ईमानदारी से इस बदलाव का अनुमान नहीं लगा सकता।'
        : 'This data does not include cash-on-delivery history, so Hisaab cannot honestly estimate that change yet.',
    };
  }

  if (scenario.lever === 'promo_active') {
    outcome = computePromoLift(data, scenario.outcomeMetric, scenario);
  } else {
    const model = linearRegression(data, scenario.lever, scenario.outcomeMetric);
    const evidence = regressionEvidence(data, scenario.lever, scenario.outcomeMetric, model, lang);
    const baseline = model.avgY || mean(data.map(row => row[scenario.outcomeMetric]));
    // When the lever has essentially no real-world variation (it never
    // changed across the history, or changed only once), the regression
    // cannot estimate a slope at all — sxx is ~0, so slope and
    // slopeStdError both correctly resolve to exactly 0 (see the epsilon
    // guard in linearRegression). But reporting that as pct:0, margin:0 —
    // "+0.0% to +0.0%" — looks like a precise, confident null result ("we
    // are sure there is no effect"), when the honest truth is "we have no
    // basis to estimate this at all". Those are different claims. Treat
    // this the same way the UI already treats missing range data: unknown,
    // not a fabricated zero.
    const cannotEstimate = evidence.uniqueX <= 1;
    const projectedChange = model.slope * scenario.delta;
    const pct = cannotEstimate ? null : baseline ? (projectedChange / baseline) * 100 : 0;
    const margin = cannotEstimate ? null : baseline ? (1.96 * model.slopeStdError * Math.abs(scenario.delta) / baseline) * 100 : 0;
    outcome = {
      pct,
      low: cannotEstimate ? null : pct - margin,
      high: cannotEstimate ? null : pct + margin,
      confidence: evidence.confidence,
      method: cannotEstimate ? 'unsupported_lever_no_variance' : 'simple_linear_regression',
      sampleSize: model.n,
      r2: round(model.r2, 3),
      slope: round(model.slope, 3),
      tScore: evidence.tScore,
      uniqueX: evidence.uniqueX,
      evidenceReasons: evidence.reasons,
    };
  }

  const cannotEstimateOutcome = outcome.pct === null || outcome.low === null || outcome.high === null;
  const width = cannotEstimateOutcome ? 0 : Math.abs(outcome.high - outcome.low);
  const pointAbs = cannotEstimateOutcome ? 0 : Math.abs(outcome.pct);
  const straddlesZero = !cannotEstimateOutcome && outcome.low < 0 && outcome.high > 0;
  const hasEvidenceGap = Array.isArray(outcome.evidenceReasons) && outcome.evidenceReasons.length > 0;
  const rangeIsTooWide = cannotEstimateOutcome || width > Math.max(3 * pointAbs, 10) || (straddlesZero && width > Math.max(2 * pointAbs, 10)) || hasEvidenceGap;
  const leverLabel = metricDisplayName(scenario.lever, lang).toLowerCase();
  const lowSignalWarning = cannotEstimateOutcome
    ? (lang === 'hi'
      ? `आपके अपलोड किए गए इतिहास में ${leverLabel} नहीं बदलता, इसलिए Hisaab अभी ईमानदारी से इसका अनुमान नहीं लगा सकता। इसे केवल प्रारंभिक दिशा-निर्देश के रूप में उपयोग करें, निर्णायक पूर्वानुमान के रूप में नहीं।`
      : `${leverLabel.charAt(0).toUpperCase()}${leverLabel.slice(1)} does not change in your uploaded history, so Hisaab cannot honestly estimate this yet. Use this as an early directional read, not a decision-grade forecast.`)
    : rangeIsTooWide
      ? lowSignalMessage({ leverLabel, reasons: outcome.evidenceReasons || [] }, lang)
      : null;
  if (rangeIsTooWide) {
    outcome.confidence = Math.min(outcome.confidence, 0.28);
  }

  const monthlyRevenueImpact = cannotEstimateOutcome ? null : Math.round(summary.baseline_monthly_revenue * (outcome.pct / 100));
  const worstCaseRevenueImpact = cannotEstimateOutcome ? null : Math.round(summary.baseline_monthly_revenue * (outcome.low / 100));
  const recent3 = data.slice(-3).reduce((s, r) => s + r.orders, 0) / 3;
  const prior3 = data.slice(-6, -3).reduce((s, r) => s + r.orders, 0) / 3;

  return {
    lever: scenario.lever,
    outcome_metric: scenario.outcomeMetric,
    outcome_value: cannotEstimateOutcome ? null : round(outcome.pct),
    range_low: cannotEstimateOutcome ? null : round(outcome.low),
    range_high: cannotEstimateOutcome ? null : round(outcome.high),
    confidence: round(outcome.confidence, 2),
    monthly_revenue_impact: monthlyRevenueImpact,
    worst_case_revenue_impact: worstCaseRevenueImpact,
    trend_pct: Number(((recent3 - prior3) / prior3 * 100).toFixed(1)),
    method: outcome.method,
    sample_size: outcome.sampleSize,
    r2: outcome.r2,
    slope: outcome.slope,
    t_score: outcome.tScore,
    unique_lever_values: outcome.uniqueX,
    assumed_change: scenario.lever === 'promo_active' && scenario.discountDepthPct !== null && scenario.discountDepthPct !== undefined
      ? scenario.discountDepthPct
      : scenario.delta,
    promo_scale: scenario.lever === 'promo_active' ? scenario.promoScale : undefined,
    low_signal_warning: lowSignalWarning,
  };
}

function decisionsCollection() {
  return firestoreService.collection(firestoreService.COLLECTIONS.decisions);
}

function firestoreUnavailable(res, err) {
  const message = err?.message || 'Firestore is unreachable.';
  console.error('Firestore error:', message);
  return res.status(503).json({
    error: 'Decision storage is unavailable. Check Google Cloud Firestore credentials and project configuration.',
    details: message,
  });
}

function getRequestUserId(req) {
  const raw = req.get('X-Hisaab-User') || req.get('X-Sahi-User');
  const userId = String(raw || '').trim();
  return userId || null;
}

function getRequestSessionId(req) {
  const raw = req.get('X-Hisaab-Session') || req.body?.sessionId || req.query?.sessionId;
  const sessionId = String(raw || '').trim();
  return sessionId || crypto.randomUUID();
}

function getDecisionUserId(req) {
  return req.query.demo === 'true' ? DEMO_USER_ID : getRequestUserId(req);
}

function getDecisionOwner(req) {
  const userId = getDecisionUserId(req);
  const sessionId = getRequestSessionId(req);
  return { userId, sessionId };
}

function toFirestoreTimestamp(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function serializeTimestamp(value) {
  if (!value) return null;
  if (typeof value.toDate === 'function') return value.toDate().toISOString();
  if (value instanceof Date) return value.toISOString();
  return value;
}

function serializeDecision(doc, isDemo = false) {
  const data = doc.data();
  const askedAt = serializeTimestamp(data.askedAt);
  const ageMs = askedAt ? Date.now() - new Date(askedAt).getTime() : 0;
  const compareEligible = data.status === 'applied'
    && data.dataSource === 'sheet'
    && Boolean(data.sheetUrl)
    && (data.actualValue === null || data.actualValue === undefined)
    && ageMs >= config.compareMinDays * 86400000;
  return {
    id: doc.id,
    userId: data.userId,
    sessionId: data.sessionId,
    simulationId: data.simulationId || null,
    questionId: data.questionId || null,
    question: data.question,
    askedAt,
    predictedValue: data.predictedValue,
    predictedMetric: data.predictedMetric,
    predictedRange: data.predictedRange || { low: null, high: null },
    confidence: data.confidence,
    dataSource: data.dataSource,
    sheetUrl: data.sheetUrl || '',
    status: data.status,
    appliedAt: serializeTimestamp(data.appliedAt),
    intentSetAt: serializeTimestamp(data.intentSetAt),
    actualValue: data.actualValue ?? null,
    actualNote: data.actualNote || '',
    outcomeRecordedAt: serializeTimestamp(data.outcomeRecordedAt),
    differencePp: data.differencePp ?? null,
    verdict: data.verdict || '',
    compareEligible,
    compareMinDays: config.compareMinDays,
    isDemo,
  };
}

function normalizeDecisionPayload(body) {
  const predictedRange = body.predictedRange || {};
  const status = body.status === 'applied' || body.status === 'skipped' ? body.status : 'pending';
  return {
    question: String(body.question || '').trim(),
    predictedValue: Number(body.predictedValue),
    predictedMetric: String(body.predictedMetric || '').trim(),
    predictedRange: {
      low: Number(predictedRange.low),
      high: Number(predictedRange.high),
    },
    confidence: Number(body.confidence),
    dataSource: body.dataSource === 'sheet' ? 'sheet' : 'sample',
    sheetUrl: String(body.sheetUrl || '').trim(),
    status,
    askedAt: toFirestoreTimestamp(body.askedAt) || firestoreService.now(),
    intentSetAt: toFirestoreTimestamp(body.intentSetAt) || firestoreService.now(),
    simulationId: body.simulationId ? String(body.simulationId) : null,
    questionId: body.questionId ? String(body.questionId) : null,
  };
}

function detectedMetricsFromDataSource(dataSource = {}) {
  return Object.entries(dataSource.field_sources || {}).map(([metric, details]) => ({
    metric,
    status: details.status,
    source: details.source,
    column: details.column || null,
    confidence: details.confidence ?? null,
  }));
}

function uploadFilename({ sheetUrl, csvText, fileName } = {}) {
  if (fileName) return String(fileName);
  if (csvText && String(csvText).trim()) return 'uploaded-orders.csv';
  if (sheetUrl && String(sheetUrl).trim()) {
    try {
      const url = new URL(String(sheetUrl));
      return url.hostname === 'docs.google.com' ? 'google-sheet' : url.hostname;
    } catch (_err) {
      return 'connected-sheet';
    }
  }
  return 'connected-data';
}

function sourceLabel({ sheetUrl, csvText } = {}) {
  if (csvText && String(csvText).trim()) return 'csv';
  if (sheetUrl && String(sheetUrl).trim()) return 'google_sheet';
  return 'sample';
}

app.use(express.json({ limit: '8mb' }));

// ─────────────────────────────────────────────────────────────────────────────
// DATA LAYER — swap this function for a BigQuery query in production.
// Example: const [rows] = await bigquery.query('SELECT * FROM retail.monthly_metrics');
// Returns: array of { month, orders, repeat_orders, avg_order_value, delivery_fee, promo_active }
// ─────────────────────────────────────────────────────────────────────────────
function getHistoricalData() {
  return [
    { month: '2024-01', orders: 1240, repeat_orders: 412, avg_order_value: 385, delivery_fee: 40, promo_active: false },
    { month: '2024-02', orders: 1180, repeat_orders: 390, avg_order_value: 372, delivery_fee: 40, promo_active: false },
    { month: '2024-03', orders: 1310, repeat_orders: 445, avg_order_value: 398, delivery_fee: 40, promo_active: true  },
    { month: '2024-04', orders: 1420, repeat_orders: 498, avg_order_value: 412, delivery_fee: 40, promo_active: true  },
    { month: '2024-05', orders: 1380, repeat_orders: 476, avg_order_value: 405, delivery_fee: 40, promo_active: false },
    { month: '2024-06', orders: 1290, repeat_orders: 437, avg_order_value: 391, delivery_fee: 45, promo_active: false },
    { month: '2024-07', orders: 1210, repeat_orders: 388, avg_order_value: 382, delivery_fee: 45, promo_active: false },
    { month: '2024-08', orders: 1190, repeat_orders: 371, avg_order_value: 379, delivery_fee: 45, promo_active: false },
    { month: '2024-09', orders: 1350, repeat_orders: 459, avg_order_value: 403, delivery_fee: 45, promo_active: false },
    { month: '2024-10', orders: 1480, repeat_orders: 521, avg_order_value: 426, delivery_fee: 45, promo_active: true  },
    { month: '2024-11', orders: 1620, repeat_orders: 584, avg_order_value: 451, delivery_fee: 45, promo_active: true  },
    { month: '2024-12', orders: 1890, repeat_orders: 680, avg_order_value: 523, delivery_fee: 45, promo_active: true  },
    { month: '2025-01', orders: 1260, repeat_orders: 428, avg_order_value: 392, delivery_fee: 50, promo_active: false },
    { month: '2025-02', orders: 1190, repeat_orders: 401, avg_order_value: 384, delivery_fee: 50, promo_active: false },
    { month: '2025-03', orders: 1340, repeat_orders: 462, avg_order_value: 407, delivery_fee: 50, promo_active: true  },
    { month: '2025-04', orders: 1410, repeat_orders: 488, avg_order_value: 419, delivery_fee: 50, promo_active: false },
    { month: '2025-05', orders: 1370, repeat_orders: 471, avg_order_value: 411, delivery_fee: 50, promo_active: false },
    { month: '2025-06', orders: 1300, repeat_orders: 446, avg_order_value: 402, delivery_fee: 50, promo_active: false },
  ];
}

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.post('/api/decisions', async (req, res) => {
  const userId = getRequestUserId(req);
  const sessionId = getRequestSessionId(req);

  const payload = normalizeDecisionPayload(req.body || {});
  if (
    !payload.question ||
    !payload.predictedMetric ||
    !Number.isFinite(payload.predictedValue) ||
    !Number.isFinite(payload.predictedRange.low) ||
    !Number.isFinite(payload.predictedRange.high) ||
    !Number.isFinite(payload.confidence)
  ) {
    return res.status(400).json({ error: 'question, predictedValue, predictedMetric, predictedRange, and confidence are required.' });
  }

  try {
    let ref = null;
    if (payload.simulationId) {
      const existing = await decisionsCollection()
        .where('sessionId', '==', sessionId)
        .where('simulationId', '==', payload.simulationId)
        .limit(1)
        .get();
      ref = existing.empty ? decisionsCollection().doc() : existing.docs[0].ref;
    } else {
      ref = decisionsCollection().doc();
    }

    await ref.set({
      userId,
      sessionId,
      simulationId: payload.simulationId,
      questionId: payload.questionId,
      question: payload.question,
      askedAt: payload.askedAt,
      predictedValue: payload.predictedValue,
      predictedMetric: payload.predictedMetric,
      predictedRange: payload.predictedRange,
      confidence: clamp(payload.confidence, 0, 1),
      dataSource: payload.dataSource,
      sheetUrl: payload.dataSource === 'sheet' ? payload.sheetUrl : '',
      status: payload.status,
      appliedAt: payload.status === 'applied' ? payload.intentSetAt : null,
      intentSetAt: payload.intentSetAt,
      actualValue: null,
      actualNote: '',
      outcomeRecordedAt: null,
      differencePp: null,
      verdict: '',
      updatedAt: firestoreService.now(),
      createdAt: firestoreService.now(),
    }, { merge: true });
    const saved = await ref.get();
    return res.status(201).json(serializeDecision(saved));
  } catch (err) {
    return firestoreUnavailable(res, err);
  }
});

app.get('/api/decisions', async (req, res) => {
  const isDemo = req.query.demo === 'true';
  const { userId, sessionId } = getDecisionOwner(req);

  try {
    let query = decisionsCollection();
    query = userId ? query.where('userId', '==', userId) : query.where('sessionId', '==', sessionId);
    const snapshot = await query.get();
    const docs = snapshot.docs.sort((a, b) => {
      const aTime = a.data().askedAt?.toDate ? a.data().askedAt.toDate().getTime() : new Date(a.data().askedAt || 0).getTime();
      const bTime = b.data().askedAt?.toDate ? b.data().askedAt.toDate().getTime() : new Date(b.data().askedAt || 0).getTime();
      return bTime - aTime;
    });
    if (req.query.countOnly === 'true') {
      return res.json({ count: snapshot.size, isDemo });
    }
    return res.json({
      decisions: docs.map(doc => serializeDecision(doc, isDemo)),
      count: snapshot.size,
      isDemo,
    });
  } catch (err) {
    return firestoreUnavailable(res, err);
  }
});

app.patch('/api/decisions/:id', async (req, res) => {
  const userId = getRequestUserId(req);
  const sessionId = getRequestSessionId(req);

  const allowedStatuses = new Set(['pending', 'applied', 'skipped']);
  const updates = {};
  const status = req.body?.status;
  const hasActual = Object.prototype.hasOwnProperty.call(req.body || {}, 'actualValue');

  if (status !== undefined) {
    if (!allowedStatuses.has(status)) {
      return res.status(400).json({ error: 'status must be pending, applied, or skipped.' });
    }
    updates.status = status;
    if (status === 'applied') updates.appliedAt = firestoreService.now();
    if (status === 'skipped') updates.appliedAt = null;
  }

  if (hasActual) {
    const actualValue = Number(req.body.actualValue);
    if (!Number.isFinite(actualValue)) {
      return res.status(400).json({ error: 'actualValue must be a number.' });
    }
    updates.actualValue = actualValue;
    updates.actualNote = String(req.body.actualNote || '').trim();
    updates.outcomeRecordedAt = firestoreService.now();
    updates.status = 'applied';
    updates.appliedAt = toFirestoreTimestamp(req.body.appliedAt) || firestoreService.now();
  }

  if (!Object.keys(updates).length) {
    return res.status(400).json({ error: 'No supported decision updates provided.' });
  }

  try {
    const ref = decisionsCollection().doc(req.params.id);
    const doc = await ref.get();
    if (!doc.exists) {
      return res.status(404).json({ error: 'Decision not found.' });
    }
    const data = doc.data();
    if ((userId && data.userId !== userId) || (!userId && data.sessionId !== sessionId)) {
      return res.status(404).json({ error: 'Decision not found.' });
    }

    await ref.update(updates);
    const updated = await ref.get();
    return res.json(serializeDecision(updated));
  } catch (err) {
    return firestoreUnavailable(res, err);
  }
});

app.get('/api/decisions/track-record', async (req, res) => {
  const isDemo = req.query.demo === 'true';
  const { userId, sessionId } = getDecisionOwner(req);

  try {
    let query = decisionsCollection();
    query = userId ? query.where('userId', '==', userId) : query.where('sessionId', '==', sessionId);
    const snapshot = await query.get();
    const matched = snapshot.docs
      .map(doc => serializeDecision(doc, isDemo))
      .filter(decision => decision.actualValue !== null
        && decision.actualValue !== undefined
        && Number.isFinite(Number(decision.predictedValue))
        && Number.isFinite(Number(decision.actualValue)));
    const differences = matched.map(decision => Math.abs(Number(decision.actualValue) - Number(decision.predictedValue)));
    const averageAbsoluteDifference = differences.length ? round(mean(differences), 1) : null;
    const notableOffCases = matched
      .map(decision => ({
        id: decision.id,
        question: decision.question,
        predictedValue: decision.predictedValue,
        actualValue: decision.actualValue,
        difference: round(Number(decision.actualValue) - Number(decision.predictedValue), 1),
        absoluteDifference: round(Math.abs(Number(decision.actualValue) - Number(decision.predictedValue)), 1),
        isDemo,
      }))
      .filter(item => item.absoluteDifference >= 5)
      .sort((a, b) => b.absoluteDifference - a.absoluteDifference)
      .slice(0, 3);

    return res.json({
      matchedCount: matched.length,
      averageAbsoluteDifference,
      notableOffCases,
      isDemo,
    });
  } catch (err) {
    return firestoreUnavailable(res, err);
  }
});

function monthStartDate(month) {
  const date = new Date(`${month}-01T00:00:00Z`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function hasNewMonthSince(rows, askedAt) {
  const asked = askedAt?.toDate ? askedAt.toDate() : new Date(askedAt);
  if (Number.isNaN(asked.getTime())) return rows.length > 0;
  return rows.some(row => {
    const date = monthStartDate(row.month);
    return date && date > asked;
  });
}

function comparisonVerdict(predictedValue, actualValue, confidence) {
  const diff = Math.abs(Number(actualValue) - Number(predictedValue));
  const directionRight = Math.sign(Number(actualValue)) === Math.sign(Number(predictedValue)) || Math.abs(Number(actualValue)) < 0.5;
  const conf = Number(confidence);
  if (diff <= 2 && directionRight) return 'Close call, direction was right.';
  if (diff <= 5 && directionRight) return 'Direction was right, size was a little different.';
  if (directionRight) return conf < 0.45 ? 'Direction was right, but confidence was low at the time.' : 'Direction was right, but the size landed differently.';
  return conf < 0.45 ? 'Prediction missed direction, and confidence was low at the time.' : 'Prediction was off directionally; worth reviewing the underlying change.';
}

app.post('/api/decisions/:id/compare', async (req, res) => {
  const userId = getRequestUserId(req);
  const sessionId = getRequestSessionId(req);

  try {
    const ref = decisionsCollection().doc(req.params.id);
    const doc = await ref.get();
    if (!doc.exists) return res.status(404).json({ error: 'Decision not found.' });

    const decision = doc.data();
    if ((userId && decision.userId !== userId) || (!userId && decision.sessionId !== sessionId)) {
      return res.status(404).json({ error: 'Decision not found.' });
    }
    if (decision.status !== 'applied') {
      return res.status(400).json({ error: 'Only applied decisions can be compared.' });
    }
    if (decision.dataSource !== 'sheet' || !decision.sheetUrl) {
      return res.status(400).json({ error: 'This decision does not have a stored public sheet URL to re-fetch.' });
    }

    const sheetData = await getUserSheetData(decision.sheetUrl, {}, '');
    const rows = sheetData.parsed?.monthlyRows || [];
    if (!hasNewMonthSince(rows, decision.askedAt)) {
      return res.status(409).json({ error: 'No new data since this was saved yet.' });
    }

    const summary = summarizeData(rows);
    const actualComputed = computeRegressionResult(decision.question, rows, summary);
    const actualValue = Number(actualComputed.outcome_value);
    const predictedValue = Number(decision.predictedValue);
    const differencePp = round(actualValue - predictedValue, 1);
    const verdict = comparisonVerdict(predictedValue, actualValue, decision.confidence);

    await ref.update({
      actualValue,
      actualNote: 'Recalculated from stored public sheet URL.',
      outcomeRecordedAt: firestoreService.now(),
      differencePp,
      verdict,
      updatedAt: firestoreService.now(),
    });

    return res.json({
      predictedValue,
      actualValue,
      differencePp,
      verdict,
    });
  } catch (err) {
    if (/Google Sheet CSV export|Sheets URL|fetch/i.test(err.message || '')) {
      return res.status(502).json({ error: err.message || 'Could not reach your sheet just now.' });
    }
    return firestoreUnavailable(res, err);
  }
});

app.post('/api/transcribe', async (req, res) => {
  const { audioBase64, mimeType } = req.body || {};

  if (!config.geminiApiKey) {
    return res.status(500).json({ error: 'GEMINI_API_KEY is not configured on the server' });
  }
  if (!audioBase64 || typeof audioBase64 !== 'string') {
    return res.status(400).json({ error: 'audioBase64 is required' });
  }

  const safeMimeType = typeof mimeType === 'string' && mimeType.startsWith('audio/')
    ? mimeType
    : 'audio/webm';

  try {
    const client = createGeminiClient();
    const response = await client.models.generateContent({
      model: config.geminiModel,
      contents: [{
        role: 'user',
        parts: [
          {
            text: 'Transcribe this short retail-business what-if question. Return only the spoken words, with no explanation and no quotation marks.\n\nScript rules — these matter:\n- If the speech is purely in Hindi, write it in Devanagari script (हिन्दी), not Roman/Latin letters.\n- If the speech is purely in Bengali, write it in Bengali script (বাংলা).\n- If the speech is purely in Tamil, write it in Tamil script (தமிழ்).\n- If the speech is English, write it in Roman script as normal.\n- If the speech is genuinely code-switched Hinglish (a Hindi speaker naturally mixing in English words mid-sentence, e.g. "mera repeat order kam ho gaya"), write it in natural Roman script exactly as people actually text it — do not force it into Devanagari, since that is not how real code-switched speech is conventionally written.\n\nUse your judgment on which of these five cases applies based on what is actually spoken.',
          },
          {
            inlineData: {
              mimeType: safeMimeType,
              data: audioBase64,
            },
          },
        ],
      }],
      config: {
        maxOutputTokens: 256,
        thinkingConfig: { thinkingBudget: 0 },
      },
    });

    const transcript = getGeminiResponseText(response).trim().replace(/^["']|["']$/g, '');
    if (!transcript) {
      return res.status(422).json({ error: 'Could not hear a question in that recording.' });
    }
    return res.json({ transcript });
  } catch (err) {
    const message = (err.message || '').split('\n')[0];
    console.error('Gemini transcription error:', message);
    if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
      return res.status(403).json({ error: 'Invalid or missing GEMINI_API_KEY.' });
    }
    return res.status(502).json({ error: 'Voice transcription failed. Try again or type the question.', details: message });
  }
});

app.post('/api/parse-sheet', async (req, res) => {
  const { sheetUrl, csvText, fileName } = req.body || {};
  const sessionId = getRequestSessionId(req);

  if ((!sheetUrl || !String(sheetUrl).trim()) && (!csvText || !String(csvText).trim())) {
    return res.status(400).json({ error: 'sheetUrl or csvText is required' });
  }

  try {
    const sheetData = await getUserSheetData(sheetUrl, {}, csvText);
    const sheetSummary = summarizeSheetParse(sheetData.parsed);
    const dataSource = {
      mode: 'sheet',
      sheet_url_used: Boolean(sheetUrl && String(sheetUrl).trim()),
      csv_used: Boolean(csvText && String(csvText).trim()),
      sheet_rows_used: sheetData.parsed.rawRows.length,
      aggregated_rows_used: sheetData.parsed.monthlyRows.length,
      classification_source: sheetData.parsed.classification_source,
      classification: sheetData.parsed.classification,
      columns: sheetData.parsed.columns,
      field_sources: sheetData.parsed.metricSources,
      warning: null,
    };
    const persistence = await firestoreService.saveUploadAnalysis({
      sessionId,
      filename: uploadFilename({ sheetUrl, csvText, fileName }),
      source: sourceLabel({ sheetUrl, csvText }),
      sheetUrlUsed: Boolean(sheetUrl && String(sheetUrl).trim()),
      csvUsed: Boolean(csvText && String(csvText).trim()),
      extractedSummary: sheetSummary,
      capabilityMap: sheetSummary.capability_map,
      detectedMetrics: detectedMetricsFromDataSource(dataSource),
      recommendations: null,
      dataSource,
      eventMetadata: {
        rawRows: sheetData.parsed.rawRows.length,
        aggregatedRows: sheetData.parsed.monthlyRows.length,
      },
    });
    return res.json({
      session_id: sessionId,
      sheet_summary: sheetSummary,
      analytics_capabilities: sheetSummary.capability_map,
      data_source: dataSource,
      persistence,
    });
  } catch (err) {
    return res.status(422).json({ error: err.message || 'Could not parse the sheet.' });
  }
});

app.post('/api/simulate', async (req, res) => {
  // Everything below is wrapped in one top-level try/catch. Without this,
  // any unexpected exception here (a bug in the regression math, a bad
  // request shape, anything) would reject this async handler's promise
  // with nothing attached to send a response — Express 4 does not do that
  // for you. The request would just hang forever from the client's
  // perspective (an infinite "Reckoning..." spinner), and the only trace
  // would be the global unhandledRejection log. This guarantees the client
  // always gets an honest, distinct error instead of a silent hang or a
  // fabricated result.
  try {
    await handleSimulate(req, res);
  } catch (err) {
    console.error('[/api/simulate] Unexpected server error:', err?.stack || err?.message || err);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Something went wrong while calculating this. Please try again.', kind: 'server_error' });
    }
  }
});

async function handleSimulate(req, res) {
  const { question, sheetUrl, csvText, uploadId, manual_inputs: manualInputs = {} } = req.body;
  const sessionId = getRequestSessionId(req);

  if (!question || typeof question !== 'string' || question.trim().length === 0) {
    return res.status(400).json({ error: 'question is required', kind: 'bad_request' });
  }

  if (!config.geminiApiKey) {
    return res.status(500).json({ error: 'GEMINI_API_KEY is not configured on the server', kind: 'server_error' });
  }

  const { data, dataSource, sheetSummary } = await getSimulationData(sheetUrl, manualInputs, csvText);

  if ((sheetUrl && String(sheetUrl).trim()) || (csvText && String(csvText).trim())) {
    const missingFields = missingCriticalFields(question.trim(), dataSource);
    if (!data.length || missingFields.length) {
      const answer = partialDataSummary(dataSource);
      const questionPersistence = await firestoreService.saveQuestion({
        sessionId,
        uploadId: uploadId || null,
        question: question.trim(),
        answer,
      });
      await firestoreService.saveEvent({
        type: 'ask',
        sessionId,
        uploadId: uploadId || null,
        questionId: questionPersistence.id,
        metadata: {
          status: 'needs_input',
          missingFields: missingFields.map(item => item.field),
        },
      });
      return res.json({
        session_id: sessionId,
        status: 'needs_input',
        missing_fields: missingFields.length ? missingFields : [
          { field: 'orders', prompt: 'We could not build monthly order history from this sheet. Which column identifies an order?', input_type: 'text' },
        ],
        partial_data_summary: answer,
        data_source: dataSource,
        sheet_summary: sheetSummary,
        analytics_capabilities: sheetSummary?.capability_map || null,
        persistence: {
          question: questionPersistence,
        },
      });
    }
  }

  const summary = summarizeData(data);
  const computed = computeRegressionResult(question.trim(), data, summary);
  const fallbackLanguage = detectFallbackLanguage(question);

  const userPrompt = `The business owner asks: "${question.trim()}"

Historical data summary (${summary.months} months):
${JSON.stringify(summary, null, 2)}

Server-computed result from real math:
${JSON.stringify(computed, null, 2)}

Important: Do NOT change, reinterpret, round, or replace any numeric fields. The server already calculated them from historical data. Your only job is to write a clear recommendation and a short explanation for a small shop owner.

Detect the language the user's question is written in. If the question is in English (including Hinglish written in Roman script), respond in English. If the question is in Hindi (Devanagari script), respond in natural everyday Hindi that a small shop owner would actually use — not stiff literal translation, and always in Devanagari script (never romanized Hinglish). For any other language (Tamil, Bengali, Telugu, Marathi, Kannada, or anything else), respond in clear plain English for now — do not attempt other languages. All programmatic fields and numeric fields stay in English/numeric on the server. If the computed outcome_value is close to 0 or confidence is low, say in the response language that the data does not show a clear effect. Never call a positive computed outcome a decrease, and never call a negative computed outcome an increase.

This business operates in India. If you mention any money amount in the recommendation or why fields, always use the ₹ (Indian Rupee) symbol and Indian digit grouping (e.g. ₹1,03,000 or ₹45,000 — lakh/crore style), never $ or USD and never Western digit grouping like ₹103,000.

Respond with ONLY a raw JSON object — no markdown, no code fences. Exactly these keys:
{
  "recommendation": "<one concise action sentence, 18 words or fewer>",
  "why": "<one sentence explaining the calculated result in plain language, 35 words or fewer>",
  "outcome_metric_label": "<plain-language label for the affected metric>",
  "detected_language": "<ISO 639-1 language code like en, hi, ta, bn, te, mr, kn, or language name if unsure>"
}`;

  const client = createGeminiClient();
  logJson('Prompt sent to Gemini', {
    model: config.geminiModel,
    prompt: userPrompt,
  });

  let generated;
  try {
    const response = await client.models.generateContent({
      model: config.geminiModel,
      contents: userPrompt,
      config: {
        maxOutputTokens: 2048,
        responseMimeType: 'application/json',
        responseSchema: simulationResponseSchema,
        thinkingConfig: {
          thinkingBudget: 0,
        },
        systemInstruction: 'You are a retail analytics AI assistant. Always respond with valid JSON only — no markdown, no code fences, no text outside the JSON object. Localize only the recommendation and why fields to the user question language.',
      },
    });
    const text = getGeminiResponseText(response);
    const finishReason = response.candidates?.[0]?.finishReason;
    logJson('Raw Gemini response', {
      text,
      candidates: response.candidates,
      finishReason,
      promptFeedback: response.promptFeedback,
      usageMetadata: response.usageMetadata,
    });

    if (finishReason === 'MAX_TOKENS') {
      console.error('Gemini generation stopped before completing JSON:', finishReason);
      generated = fallbackGeneratedResponse(computed, fallbackLanguage);
      generated.source = 'server_fallback_after_gemini_truncation';
    } else {
      const parseResult = parseSimulationResponse(text);
      logJson('Cleaned Gemini response', parseResult.cleanedText);

      if (!parseResult.ok) {
        console.error('Gemini parsing error:', parseResult.error);
        generated = fallbackGeneratedResponse(computed, fallbackLanguage);
        generated.source = 'server_fallback_after_gemini_parse_error';
      } else {
        generated = alignGeneratedWithComputed(normalizeGeneratedResponse(parseResult.value), computed, fallbackLanguage);
        generated.source = generated.source || 'gemini';
      }
    }
    logJson('Parsed Gemini object', generated);
  } catch (err) {
    const message = (err.message || '').split('\n')[0];
    const status = err instanceof ApiError ? err.status : undefined;

    console.error('Gemini API error:', message);

    if (status === 401 || status === 403) {
      // The regression already ran and produced a genuine result — an
      // invalid Gemini API key is an AI-wording-layer problem, not a
      // reason to withhold an honest, already-computed answer. Fall
      // through to the same computed-driven fallback wording as any other
      // Gemini failure, tagged distinctly so the frontend can tell the
      // user the AI service specifically was unreachable.
      generated = fallbackGeneratedResponse(computed, fallbackLanguage);
      generated.source = 'server_fallback_after_gemini_auth_error';
      logJson('Parsed Gemini object', generated);
    } else if (err instanceof ApiError) {
      generated = fallbackGeneratedResponse(computed, fallbackLanguage);
      generated.source = 'server_fallback_after_gemini_error';
    } else {
      generated = fallbackGeneratedResponse(computed, fallbackLanguage);
      generated.source = 'server_fallback_after_unexpected_error';
    }
    logJson('Parsed Gemini object', generated);
  }

  const isSampleData = dataSource.mode === 'demo_fallback';
  const chartMetaLabel = `${generated.outcome_metric_label || metricDisplayName(computed.outcome_metric, generated.detected_language)} · ${generated.detected_language === 'hi' ? `पिछले ${data.length} महीनों के` : `last ${data.length} months`}`;

  // ────────────────────────────────────────────────────────────────────────
  // Compute the three-scenario decision-engine view. Only included in the
  // response when the underlying regression is strong enough to make three
  // scenarios genuinely comparable — otherwise the frontend falls back to
  // today's single-answer weak-data flow, unchanged. This is the honest
  // default: three scenarios dressed up on weak data would just be three
  // guesses in a row, which is exactly what the product exists NOT to do.
  //
  // Preconditions for showing scenarios:
  //   - confidence >= 0.45 (matches the isWeak threshold used everywhere else)
  //   - |outcome_value| >= 1 (matches the smallEffect guard)
  //   - assumed_change is a real non-zero number
  //   - the lever is one we can project extra magnitudes for (numeric levers
  //     — delivery_fee, avg_order_value; NOT promo_active or cash_on_delivery,
  //     which are binary/unsupported and don't have a "2x" that makes sense)
  //
  // The three scenarios are structural, not user-typed:
  //   [0] Baseline — no change (always 0)
  //   [1] As asked — the assumed_change from the current question (this is
  //       the existing computed result, unchanged; we're presenting it, not
  //       recomputing). Marked best-fit.
  //   [2] Bigger — 2x the assumed_change, projected linearly using the same
  //       slope. Range widens because we're extrapolating beyond the middle
  //       of the observed data.
  //
  // Threshold: where does the projected revenue impact cross from positive
  // to negative? Only meaningful when scenarios themselves are supported AND
  // the slope has a real sign; if the slope is ~0 there is no crossover to
  // find and returning any threshold would be a made-up precision.
  // ────────────────────────────────────────────────────────────────────────
  // Scenarios are the DEFAULT result view for any numeric-lever question,
  // not a reward for strong data. The gate here is purely STRUCTURAL — is
  // this the kind of question we can lay out as three concrete options at
  // all? — not a confidence judgement. Confidence is handled separately
  // below via isLowConfidenceScenarios, which drives an honest visual
  // downgrade (muted numbers, a "rough directional read" tone) rather than
  // hiding the scenarios entirely. A fruit vendor is better served by three
  // concrete options with an honest "we're not sure yet" flag than by being
  // dropped into the denser stats screen.
  //
  // We still fully bail out (scenariosBundle = null -> old UI) when the
  // question genuinely isn't a numeric-lever what-if: unsupported levers
  // (promo_active, cash_on_delivery), a zero/File assumed change, or a
  // non-finite slope. Those aren't "low confidence scenarios", they're
  // "not scenarios at all".
  const scenariosSupported =
    Number.isFinite(computed.assumed_change) && Math.abs(computed.assumed_change) > 0 &&
    ['delivery_fee', 'avg_order_value'].includes(computed.lever) &&
    Number.isFinite(computed.slope) &&
    Number.isFinite(computed.outcome_value);

  // Low-confidence scenarios still render, but with muted numbers and honest
  // "directional read" language instead of confident rupee projections. Same
  // threshold the rest of the app uses for "weak" (0.45 / low_signal_warning).
  const isLowConfidenceScenarios =
    !Number.isFinite(computed.confidence) || computed.confidence < 0.45 ||
    Boolean(computed.low_signal_warning) ||
    (Number(computed.range_low) < 0 && Number(computed.range_high) > 0);

  let scenariosBundle = null;
  if (scenariosSupported) {
    const isHindi = generated.detected_language === 'hi';
    const asked = computed.assumed_change;
    const bigger = asked * 2;
    const currentValue = computed.lever === 'delivery_fee'
      ? Number(summary.current_delivery_fee) || 0
      : Number(summary.avg_order_value) || 0;
    const baselineRevenue = Number(summary.baseline_monthly_revenue) || 0;
    const currencySymbol = '₹';

    // Project outcome for an arbitrary lever change using the fitted slope.
    // slope is expressed per unit of the lever, so slope * change gives the
    // percentage-point change in the outcome metric. We keep the sign as-is
    // and compute the revenue impact using the same baseline the primary
    // result uses, so the numbers reconcile with the top-line computed result.
    const projectFor = (leverChange) => {
      const pctChange = computed.slope * leverChange;
      const revenueImpact = Math.round(baselineRevenue * (pctChange / 100));
      // Range widens with distance from the asked change — we're less certain
      // the further we extrapolate. This is expressed as a ± band on the
      // revenue impact, scaled from the existing range_low/range_high spread
      // seen at the asked change. Zero lever change = zero band: "no change"
      // is exact, not a range.
      const askedSpread = Math.abs(
        (Number(computed.range_high) - Number(computed.range_low)) / 2
      );
      const distanceFactor = Math.abs(leverChange) / Math.max(Math.abs(asked), 1);
      const bandPct = leverChange === 0 ? 0 : askedSpread * Math.max(1, distanceFactor);
      const bandRevenue = Math.round(baselineRevenue * (bandPct / 100));
      return {
        lever_change: leverChange,
        new_lever_value: Number.isFinite(currentValue) ? Math.round((currentValue + leverChange) * 100) / 100 : null,
        pct_change: Math.round(pctChange * 10) / 10,
        revenue_impact: revenueImpact,
        revenue_low: revenueImpact - bandRevenue,
        revenue_high: revenueImpact + bandRevenue,
      };
    };

    const baseline = { lever_change: 0, new_lever_value: currentValue || null, pct_change: 0, revenue_impact: 0, revenue_low: 0, revenue_high: 0 };
    const askedResult = projectFor(asked);
    const biggerResult = projectFor(bigger);

    // Threshold: linear projection of where revenue impact = 0. Only include
    // when the slope has a real sign — |slope| effectively > 0 in a way the
    // range doesn't itself already cross zero at the asked change (which
    // would mean the direction isn't reliably established at all).
    let threshold = null;
    const rangeCrossesZero = Number(computed.range_low) < 0 && Number(computed.range_high) > 0;
    if (!rangeCrossesZero && Math.abs(computed.slope) > 0.001) {
      // Find lever_change where projected revenue crosses 0. Since revenue
      // impact is linear in lever_change under our model, this is analytical
      // rather than a search: it's the point where pct_change equals the
      // opposite sign — but since our baseline already IS zero, revenue only
      // crosses zero if the effect changes direction, which under a single
      // linear slope it doesn't. What CAN cross zero is the LOWER bound of
      // the confidence band — that's the honest "past here, downside dips
      // into losing money" line. Compute the lever_change where the band's
      // lower bound hits zero.
      const askedBandLowerRevenue = askedResult.revenue_low;
      if ((askedResult.revenue_impact > 0 && askedBandLowerRevenue > 0) || (askedResult.revenue_impact < 0 && askedBandLowerRevenue < 0)) {
        // Confidence band doesn't yet cross zero at the asked change; find
        // the lever_change where it would. Linear scan is fine here — cheap
        // and easy to reason about vs closed-form for a confidence band.
        const step = asked / 40;
        for (let mult = 1; mult <= 4; mult += 0.05) {
          const trial = projectFor(asked * mult);
          const bandCrosses = (askedResult.revenue_impact > 0 && trial.revenue_low <= 0) ||
                              (askedResult.revenue_impact < 0 && trial.revenue_high >= 0);
          if (bandCrosses) {
            threshold = {
              lever_change: Math.round(asked * mult * 100) / 100,
              new_lever_value: Number.isFinite(currentValue) ? Math.round((currentValue + asked * mult) * 100) / 100 : null,
              direction: askedResult.revenue_impact > 0 ? 'gain_turns_uncertain' : 'loss_turns_uncertain',
            };
            break;
          }
        }
      }
    }

    scenariosBundle = {
      currency_symbol: currencySymbol,
      current_value: Number.isFinite(currentValue) ? currentValue : null,
      lever_label: metricDisplayName(computed.lever, generated.detected_language).toLowerCase(),
      is_low_confidence: isLowConfidenceScenarios,
      confidence_pct: Number.isFinite(computed.confidence) ? Math.round(computed.confidence * 100) : null,
      scenarios: [
        {
          id: 'baseline',
          label: isHindi ? 'सुरक्षित रहें' : 'Play it safe',
          action_short: isHindi
            ? (Number.isFinite(currentValue) ? `${currencySymbol}${currentValue} पर रखें` : 'कोई बदलाव नहीं')
            : (Number.isFinite(currentValue) ? `Keep at ${currencySymbol}${currentValue}` : 'No change'),
          headline_revenue: 0,
          headline_note: isHindi ? 'कोई बदलाव नहीं' : 'No change to revenue',
          why: isHindi
            ? 'ऑर्डर अपनी जगह पर बने रहते हैं। न कोई जोखिम, न कोई फायदा।'
            : 'Orders stay where they are. No risk, no gain.',
          cta: isHindi ? 'रहने दें' : 'Skip · keep as is',
          is_best_fit: false,
          projection: baseline,
        },
        {
          id: 'as_asked',
          label: isHindi ? 'आपने जो पूछा' : 'As you asked',
          action_short: isHindi
            ? (Number.isFinite(currentValue)
                ? `${currencySymbol}${Math.round((currentValue + asked) * 100) / 100} पर करें`
                : `${asked > 0 ? '+' : ''}${currencySymbol}${asked} बदलें`)
            : (Number.isFinite(currentValue)
                ? `Change to ${currencySymbol}${Math.round((currentValue + asked) * 100) / 100}`
                : `Change by ${asked > 0 ? '+' : ''}${currencySymbol}${asked}`),
          headline_revenue: askedResult.revenue_impact,
          headline_note: isHindi
            ? `${currencySymbol}${Math.abs(askedResult.revenue_low).toLocaleString('en-IN')} से ${currencySymbol}${Math.abs(askedResult.revenue_high).toLocaleString('en-IN')} के बीच`
            : `Could vary ${currencySymbol}${Math.abs(askedResult.revenue_low).toLocaleString('en-IN')} to ${currencySymbol}${Math.abs(askedResult.revenue_high).toLocaleString('en-IN')}`,
          why: generated.recommendation || (isHindi ? 'आपके इतिहास के अनुसार यह पैटर्न टिकाऊ रहा है।' : 'Your history shows this pattern has held up.'),
          cta: isHindi ? 'यही आजमाएं' : 'Try this',
          is_best_fit: true,
          projection: askedResult,
        },
        {
          id: 'bigger',
          label: isHindi ? 'बड़ी छलांग' : 'Push further',
          action_short: isHindi
            ? (Number.isFinite(currentValue)
                ? `${currencySymbol}${Math.round((currentValue + bigger) * 100) / 100} पर करें`
                : `${bigger > 0 ? '+' : ''}${currencySymbol}${bigger} बदलें`)
            : (Number.isFinite(currentValue)
                ? `Change to ${currencySymbol}${Math.round((currentValue + bigger) * 100) / 100}`
                : `Change by ${bigger > 0 ? '+' : ''}${currencySymbol}${bigger}`),
          headline_revenue: biggerResult.revenue_impact,
          headline_note: isHindi
            ? `${currencySymbol}${Math.abs(biggerResult.revenue_low).toLocaleString('en-IN')} से ${currencySymbol}${Math.abs(biggerResult.revenue_high).toLocaleString('en-IN')} के बीच`
            : `Could vary ${currencySymbol}${Math.abs(biggerResult.revenue_low).toLocaleString('en-IN')} to ${currencySymbol}${Math.abs(biggerResult.revenue_high).toLocaleString('en-IN')}`,
          why: isHindi
            ? 'यह आपके अब तक देखे गए बदलावों से बड़ा है — पूर्वानुमान का दायरा भी बड़ा है।'
            : 'This goes beyond changes you\'ve tried before — the range of outcomes widens accordingly.',
          cta: isHindi ? 'फिर भी आजमाएं' : 'Try anyway',
          is_best_fit: false,
          projection: biggerResult,
        },
      ],
      threshold,
    };

    // When confidence is low, the rupee projections are real arithmetic but
    // rest on a weak signal — presenting them as crisp "+₹3,200" numbers
    // would overclaim. Downgrade honestly: keep the numbers (they're the
    // best directional estimate we have) but relabel them as a rough read,
    // and add a bundle-level caption the frontend shows above the cards.
    // The baseline card stays exact (no change really is no change).
    if (isLowConfidenceScenarios) {
      scenariosBundle.low_confidence_caption = isHindi
        ? 'आपका डेटा अभी इतना मजबूत नहीं है कि पक्का बताया जा सके — ये केवल एक शुरुआती दिशा हैं, अंतिम आंकड़े नहीं।'
        : 'Your data isn\'t strong enough for a firm answer yet — treat these as a rough direction, not final numbers.';
      scenariosBundle.scenarios.forEach((s) => {
        if (s.id === 'baseline') return;
        s.headline_note = isHindi ? 'मोटा अनुमान — पक्का नहीं' : 'Rough estimate — not certain';
      });
    }
  }

  const responseBody = {
    session_id: sessionId,
    computed,
    generated,
    summary,
    data_source: dataSource,
    sheet_summary: sheetSummary,
    analytics_capabilities: sheetSummary?.capability_map || null,
    scenarios_bundle: scenariosBundle,
    chart_series: chartSeries(data, computed.outcome_metric),
    chart_meta: {
      label: chartMetaLabel,
      is_sample: isSampleData,
      // Sample-mode charts must never show real-looking calendar dates —
      // "Jan '24 to Jun '25" reads as this business's actual recent history,
      // which is exactly the false impression a synthetic demo dataset must
      // not create. Generic "Month 1 / Month N" labels keep the demo mechanic
      // (an 18-month trend, ups and downs) intact while making it impossible
      // to mistake for a real finding. Real connected data keeps true dates.
      start_label: isSampleData
        ? (generated.detected_language === 'hi' ? 'महीना 1' : 'Month 1')
        : formatMonthLabel(data[0]?.month),
      end_label: isSampleData
        ? (generated.detected_language === 'hi' ? `महीना ${data.length}` : `Month ${data.length}`)
        : formatMonthLabel(data[data.length - 1]?.month),
    },
    lever: computed.lever,
    outcome_metric: computed.outcome_metric,
    outcome_metric_label: generated.outcome_metric_label || computed.outcome_metric.replace(/_/g, ' '),
    detected_language: generated.detected_language || 'en',
    outcome_value: computed.outcome_value,
    range_low: computed.range_low,
    range_high: computed.range_high,
    confidence: computed.confidence,
    recommendation: generated.recommendation,
    why: generated.why,
    monthly_revenue_impact: computed.monthly_revenue_impact,
    worst_case_revenue_impact: computed.worst_case_revenue_impact,
    trend_pct: computed.trend_pct,
    low_signal_warning: computed.low_signal_warning,
  };

  // Persistence failures (bad Firestore credentials, network issues, etc.)
  // must never take down the request or the process. saveSimulationFlow
  // already fails soft internally (services/firestore.js safeWrite), but we
  // wrap the call site too as defense-in-depth against anything that
  // escapes that internal handling (e.g. lazy credential resolution
  // rejecting asynchronously). Worst case: persistence is null and the
  // simulation result still reaches the user.
  let persistence = { ok: false, simulationId: null, questionId: null, analyticsId: null, eventId: null };
  try {
    persistence = await firestoreService.saveSimulationFlow({
      sessionId,
      uploadId: uploadId || null,
      question: question.trim(),
      answer: generated.why,
      assumptions: {
        lever: computed.lever,
        outcome_metric: computed.outcome_metric,
        assumed_change: computed.assumed_change,
        method: computed.method,
        sample_size: computed.sample_size,
        manual_inputs: manualInputs,
      },
      calculatedOutput: computed,
      recommendation: generated.recommendation,
      capabilityMap: sheetSummary?.capability_map || null,
      detectedMetrics: detectedMetricsFromDataSource(dataSource),
      recommendations: {
        recommendation: generated.recommendation,
        why: generated.why,
        source: generated.source,
      },
      dataSource,
      eventMetadata: {
        confidence: computed.confidence,
        outcomeValue: computed.outcome_value,
        source: dataSource.mode,
      },
    });
  } catch (err) {
    console.error('[Firestore] saveSimulationFlow threw synchronously/rejected past internal handling:', err?.message || err);
  }
  responseBody.persistence = persistence;

  res.json(responseBody);
}

app.post('/api/feedback', async (req, res) => {
  const sessionId = getRequestSessionId(req);
  const intent = String(req.body?.intent || req.body?.userIntent || '').trim();
  const allowed = new Set(['applied', 'try', 'skipped', 'skip', 'pending', 'unsure', 'success']);

  if (!allowed.has(intent)) {
    return res.status(400).json({ error: 'intent must be try, skip, unsure, or success.' });
  }

  const normalizedIntent = intent === 'applied' ? 'try'
    : intent === 'skipped' ? 'skip'
      : intent === 'pending' ? 'unsure'
        : intent;

  const feedback = await firestoreService.saveFeedback({
    sessionId,
    simulationId: req.body?.simulationId || null,
    questionId: req.body?.questionId || null,
    userIntent: normalizedIntent,
    try: normalizedIntent === 'try',
    skip: normalizedIntent === 'skip',
    unsure: normalizedIntent === 'unsure',
    success: normalizedIntent === 'success' ? true : null,
  });
  const event = await firestoreService.saveEvent({
    type: 'feedback',
    sessionId,
    simulationId: req.body?.simulationId || null,
    questionId: req.body?.questionId || null,
    feedbackId: feedback.id,
    metadata: { intent: normalizedIntent },
  });

  return res.json({
    session_id: sessionId,
    feedback,
    event,
  });
});

// Serve index.html dynamically with a deploy-specific version query on its
// script/style tags. Cache-Control headers alone weren't reliably preventing
// a stale page in already-open browser tabs/windows (confirmed via live
// testing: the same code correctly showed full Hindi localization in a fresh
// Incognito window, but an existing regular-window tab kept showing a mix of
// old and new behavior). A version query makes script.js?v=abc123 a genuinely
// different URL every deploy, which the browser cannot serve from any old
// cache entry regardless of header behavior or CDN-layer caching quirks.
const deployVersion = process.env.VERCEL_GIT_COMMIT_SHA
  ? process.env.VERCEL_GIT_COMMIT_SHA.slice(0, 8)
  : String(Date.now());

app.get(['/', '/index.html'], (req, res) => {
  fs.readFile(path.join(__dirname, 'public', 'index.html'), 'utf8', (err, html) => {
    if (err) {
      console.error('Failed to read index.html:', err.message);
      return res.status(500).send('Internal server error');
    }
    const versioned = html
      .replace('href="style.css"', `href="style.css?v=${deployVersion}"`)
      .replace('src="script.js"', `src="script.js?v=${deployVersion}"`);
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(versioned);
  });
});

app.use(express.static(path.join(__dirname, 'public'), {
  setHeaders: (res, filePath) => {
    // index.html must never be served stale — this is what determines which
    // script.js/data-i18n markup a visitor actually gets. A cached HTML page
    // referencing an old bundle is exactly the kind of silent bug that's easy
    // to miss until someone (a judge, a shopkeeper) hits it live.
    if (filePath.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    } else {
      // JS/CSS/assets: short-lived cache, always revalidate with the server
      // before trusting a cached copy. Not a long-lived immutable cache since
      // these files aren't content-hashed. The version query on the tags
      // pointing to these files (added above) is the primary defense; this
      // header is a secondary safety net for any direct asset requests.
      res.setHeader('Cache-Control', 'no-cache, max-age=0, must-revalidate');
    }
  },
}));

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Hisaab running on http://localhost:${PORT}`);
});
