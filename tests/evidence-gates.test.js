const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

process.env.HISAAB_TEST_MODE = '1';

const {
  aggregateBootstrapEntries,
  aggregateBootstrapDailyEntries,
  aggregateSheetRows,
  alignGeneratedWithComputed,
  app,
  assessEvidence,
  buildAnalyticsCapabilities,
  classifySheetColumnsFallback,
  comparisonCategory,
  comparisonMessage,
  computeRegressionResult,
  classifyQuestionIntent,
  dataMaturity,
  detectFallbackLanguage,
  detectScenario,
  demoGeneratedResponse,
  fallbackGeneratedResponse,
  getHistoricalData,
  isDemoDecision,
  linearRegression,
  missingCriticalFields,
  normalizeGeneratedResponse,
  normalizeHeader,
  parseCsv,
  parseSimulationResponse,
  sourceLabelForDecision,
  summarizeData,
  unsupportedQuestionGuidance,
} = require('../server');

const fixture = name => fs.readFileSync(path.join(__dirname, 'fixtures', name), 'utf8');

function source(overrides = {}) {
  return {
    mode: 'sheet',
    source_type: 'connected',
    csv_used: true,
    sheet_url_used: false,
    field_sources: {
      orders: { status: 'derived', source: 'sheet' },
      avg_order_value: { status: 'derived', source: 'sheet' },
      delivery_fee: { status: 'derived', source: 'sheet' },
      promo_active: { status: 'derived', source: 'sheet' },
      repeat_orders: { status: 'derived', source: 'sheet' },
      trend: { status: 'derived', source: 'sheet' },
    },
    ...overrides,
  };
}

function rowsForFees(fees, orders = fees.map((_, i) => 300 + i * 12)) {
  return fees.map((delivery_fee, i) => ({
    month: `2025-${String(i + 1).padStart(2, '0')}`,
    orders: orders[i],
    repeat_orders: Math.round(orders[i] * 0.3),
    avg_order_value: 220 + i * 4,
    delivery_fee,
    promo_active: i % 3 === 0,
  }));
}

function evidenceFor(question, rows, dataSource = source()) {
  const summary = summarizeData(rows);
  const computed = computeRegressionResult(question, rows, summary);
  return assessEvidence(question, rows, summary, dataSource, computed);
}

test('Express app is available for API smoke testing without opening a port in restricted CI', () => {
  assert.equal(typeof app, 'function');
});

test('data source maturity distinguishes demo, self-reported, and imported data', () => {
  assert.equal(assessEvidence('What if I increase delivery fee by 5?', getHistoricalData(), summarizeData(getHistoricalData()), { mode: 'demo_fallback' }, null).category, 'demo_only');
  assert.deepEqual(dataMaturity({ mode: 'bootstrap' }, rowsForFees([20, 30])), {
    level: 1,
    label: 'Self-reported daily data',
    source_kind: 'bootstrap',
  });
  assert.equal(dataMaturity(source(), rowsForFees([20, 30])).source_kind, 'csv');
  assert.equal(sourceLabelForDecision({ dataSource: 'bootstrap' }), 'Self-reported daily history');
  assert.equal(sourceLabelForDecision({ dataSource: 'sheet', csvUsed: true }), 'Imported CSV');
});

test('required field gates explain missing business data', () => {
  const noValue = source({ field_sources: { ...source().field_sources, avg_order_value: { status: 'unavailable' } } });
  const noCustomer = source({ field_sources: { ...source().field_sources, repeat_orders: { status: 'unavailable' } } });
  const noPromo = source({ field_sources: { ...source().field_sources, promo_active: { status: 'unavailable' } } });
  const noFee = source({ field_sources: { ...source().field_sources, delivery_fee: { status: 'unavailable' } } });

  assert.equal(evidenceFor('What if I increase my price by 10 percent?', rowsForFees([20, 30, 40, 50]), noValue).category, 'needs_more_data');
  assert.equal(evidenceFor('Will repeat customers increase?', rowsForFees([20, 30, 40, 50]), noCustomer).category, 'needs_more_data');
  assert.equal(evidenceFor('Do discounts bring more orders?', rowsForFees([20, 30, 40, 50]), noPromo).category, 'needs_more_data');
  assert.equal(evidenceFor('What if I increase delivery fee by 5?', rowsForFees([20, 30, 40, 50]), noFee).category, 'needs_more_data');
});

test('minimum history gate blocks too few months and allows mature history when other gates pass', () => {
  assert.equal(evidenceFor('What if I increase delivery fee by 5?', rowsForFees([20, 30, 40])).category, 'not_enough_evidence');
  assert.notEqual(evidenceFor('What if I change delivery fee from 80 to 70?', rowsForFees([20, 30, 40, 50, 60, 70, 80])).category, 'not_enough_evidence');
});

test('lever variation gate blocks a delivery fee that never changed', () => {
  const result = evidenceFor('What if I increase delivery fee by 5?', rowsForFees([50, 50, 50, 50, 50, 50]));
  assert.equal(result.category, 'not_enough_evidence');
  assert.match(result.message, /did not change|cannot know/i);
});

test('price variation and promo balance gates do not turn flat or one-sided data into estimates', () => {
  const flatPrice = rowsForFees([20, 30, 40, 50, 60, 70]).map(row => ({ ...row, avg_order_value: 250 }));
  assert.equal(evidenceFor('What if I increase my price by 10 percent?', flatPrice).category, 'not_enough_evidence');

  const promoRows = rowsForFees([20, 30, 40, 50, 60, 70]).map(row => ({ ...row, promo_active: true }));
  assert.equal(evidenceFor('Do discounts bring more orders?', promoRows).category, 'not_enough_evidence');
});

test('extrapolation gate warns outside the observed range and suggests a smaller test', () => {
  const result = evidenceFor('What if I increase delivery fee from 40 to 100?', rowsForFees([20, 20, 30, 30, 40, 40]));
  assert.equal(result.category, 'weak_signal');
  assert.deepEqual(result.observed_range, { min: 20, max: 40 });
  assert.match(result.next_action, /smaller change/i);
});

test('weak regression signal is downgraded and never treated as a firm recommendation', () => {
  const rows = rowsForFees([20, 30, 40, 50, 60, 70], [400, 360, 410, 370, 405, 375]);
  const computed = computeRegressionResult('What if I increase delivery fee by 5?', rows, summarizeData(rows));
  const evidence = assessEvidence('What if I increase delivery fee by 5?', rows, summarizeData(rows), source(), computed);
  assert.equal(evidence.category, 'weak_signal');
  assert.ok(computed.r2 < 0.18 || computed.low_signal_warning);
  assert.doesNotMatch(fallbackGeneratedResponse({ ...computed, confidence: 0.2 }).recommendation, /best|guaranteed|will happen/i);
});

test('sample wording is explicitly demo-only and demo decisions are not real decisions', () => {
  const demo = demoGeneratedResponse({ lever: 'delivery_fee', outcome_metric: 'orders', outcome_value: -2.4 });
  assert.match(`${demo.recommendation} ${demo.why}`, /demo shop|illustrative only/i);
  assert.doesNotMatch(`${demo.recommendation} ${demo.why}`, /your history|your shop|your business/i);
  const result = assessEvidence('What if I increase delivery fee by 5?', getHistoricalData(), summarizeData(getHistoricalData()), { mode: 'demo_fallback' }, null);
  assert.equal(result.category, 'demo_only');
  assert.match(`${result.title} ${result.message}`, /demo|example|illustrative/i);
  assert.doesNotMatch(`${result.title} ${result.message}`, /your data|your shop/i);
  assert.equal(isDemoDecision({ sourceType: 'demo', dataSource: 'sample' }), true);
  assert.equal(isDemoDecision({ sourceType: 'real', dataSource: 'sheet' }), false);
});

test('language detection and Gemini fallback reject wrong-language or directionally wrong wording', () => {
  assert.equal(detectFallbackLanguage('What if I increase delivery fee by ₹5?'), 'en');
  assert.equal(detectFallbackLanguage('अगर डिलीवरी फीस बढ़ाऊँ तो क्या होगा?'), 'hi');
  assert.equal(detectFallbackLanguage('Agar delivery fee badha doon toh kya asar padega?'), 'hinglish');

  const computed = { outcome_metric: 'orders', outcome_value: 8, confidence: 0.8 };
  const normalized = normalizeGeneratedResponse({ recommendation: 'Orders will decrease.', why: 'They may drop.', detected_language: 'en' });
  const aligned = alignGeneratedWithComputed(normalized, computed, 'hi');
  assert.equal(aligned.detected_language, 'hi');
  assert.match(aligned.recommendation, /[\u0900-\u097F]/);

  const hinglish = alignGeneratedWithComputed({ recommendation: 'Orders will increase.', why: 'They may grow.', detected_language: 'en' }, computed, 'hinglish');
  assert.equal(hinglish.detected_language, 'hinglish');
  assert.match(hinglish.recommendation, /\b(try|test|change|decision)\b/i);
});

test('CSV parsing and mapping expose ambiguity instead of silently guessing', () => {
  const rows = parseCsv(fixture('ambiguous-columns.csv'));
  assert.deepEqual(rows[0].slice(0, 4), ['date', 'amount', 'final price', 'subtotal']);
  assert.equal(normalizeHeader('Final Price'), 'finalprice');
  const classification = classifySheetColumnsFallback(rows[0]);
  assert.equal(classification.amount.classification, 'order_value_or_price');
  assert.ok(classification.amount.confidence < 0.55);

  const mapped = aggregateSheetRows(rows.slice(1).map(row => Object.fromEntries(rows[0].map((h, i) => [h, row[i]]))), {
    date: { classification: 'order_date', confidence: 1 },
    orders: { classification: 'order_count_identifier', confidence: 1 },
  });
  assert.equal(mapped.rows.length, 4);
  const capabilities = buildAnalyticsCapabilities({ monthlyRows: mapped.rows, metricSources: mapped.metricSources });
  assert.ok(capabilities.missing_count > 0);
});

test('average bill fallback is visibly labelled and missing-field choices stay non-technical', () => {
  const wording = fallbackGeneratedResponse({
    outcome_metric: 'orders',
    outcome_value: 4,
    confidence: 0.7,
    uses_user_provided_average_bill: true,
  }, 'en');
  assert.match(wording.why, /average bill amount, not exact order values/i);
  const script = fs.readFileSync(path.join(__dirname, '..', 'public', 'script.js'), 'utf8');
  assert.match(script, /I don.t have this data/);
  assert.match(script, /estimated from your average bill amount/i);
});

test('bootstrap aggregation labels self-reported data and ignores malformed dates', () => {
  const result = aggregateBootstrapEntries([
    { date: '2025-01-01', orders: '12', delivery_fee: '₹30', avg_order_value: '220' },
    { date: 'not-a-date', orders: '999', delivery_fee: '30' },
    { date: '2025-02-01', orders: '14', delivery_fee: '40', avg_order_value: '240' },
  ]);
  assert.equal(result.rows.length, 2);
  assert.equal(result.rows[0].orders, 12);
  assert.equal(result.metricSources.delivery_fee.source, 'bootstrap');
});

test('comparison categories stay neutral and do not claim right or wrong', () => {
  assert.equal(comparisonCategory(4, 6), 'matched_direction');
  assert.equal(comparisonCategory(4, -2), 'opposite_direction');
  assert.equal(comparisonCategory(4, 0), 'no_clear_change');
  assert.equal(comparisonCategory(undefined, undefined), 'not_enough_new_data');
  assert.doesNotMatch(comparisonMessage('matched_direction'), /right|wrong|accurate/i);
  assert.match(comparisonMessage('not_enough_new_data'), /not enough new data/i);
});

test('regression edge cases remain finite for zero and negative baselines', () => {
  const zeroBaseline = rowsForFees([20, 30, 40, 50], [0, 0, 0, 0]);
  const negativeBaseline = rowsForFees([20, 30, 40, 50], [-10, -8, -7, -5]);
  const zeroModel = linearRegression(zeroBaseline, 'delivery_fee', 'orders');
  const negativeModel = linearRegression(negativeBaseline, 'delivery_fee', 'orders');
  assert.ok(Number.isFinite(zeroModel.r2));
  assert.ok(Number.isFinite(negativeModel.slope));
  assert.ok(Number.isFinite(computeRegressionResult('What if I increase delivery fee by 5?', zeroBaseline, summarizeData(zeroBaseline)).confidence));
});

test('decision storage contract distinguishes calculated data from saved data', () => {
  const demoPayload = { sourceType: 'demo', dataSource: 'sample' };
  assert.equal(isDemoDecision(demoPayload), true);
  assert.equal(sourceLabelForDecision(demoPayload), 'Demo example');
  // The frontend uses this exact copy when Firestore returns an error; keep it
  // in the test so a future copy edit cannot imply a failed save succeeded.
  const script = fs.readFileSync(path.join(__dirname, '..', 'public', 'script.js'), 'utf8');
  assert.match(script, /Calculated, but this decision was not saved/);
  assert.match(script, /Demo decisions are not saved/);
});

test('question routing never defaults to delivery fee', () => {
  assert.equal(classifyQuestionIntent('What if I increase delivery fee by ₹5?').intent, 'delivery_fee_change');
  assert.equal(classifyQuestionIntent('Delivery charge badhega toh orders kam honge kya?').intent, 'delivery_fee_change');
  assert.equal(classifyQuestionIntent('What if I increase price by 10%?').intent, 'price_or_bill_change');
  assert.equal(classifyQuestionIntent('Average bill ₹250 se ₹280 karu toh kya hoga?').intent, 'price_or_bill_change');
  assert.equal(classifyQuestionIntent('Should I run a 10% discount?').intent, 'discount_or_offer');
  assert.equal(classifyQuestionIntent('Are customers coming back?').intent, 'repeat_customers');
  assert.equal(classifyQuestionIntent('Are my sales going up?').intent, 'trend_sales');
  assert.equal(classifyQuestionIntent('Which month was best?').intent, 'trend_orders');
  assert.equal(classifyQuestionIntent('What if I enable cash on delivery?').intent, 'cod');
  assert.equal(classifyQuestionIntent('Should I hire another worker?').status, 'broad_guidance');
  assert.equal(classifyQuestionIntent('What if I increase delivery fee by ₹10 and also run discount?').status, 'clarify_question');
  assert.equal(classifyQuestionIntent('Are my sales going up?').matches.includes('discount_or_offer'), false);
  assert.equal(classifyQuestionIntent('Should I run a sale discount?').intent, 'discount_or_offer');

  const languageCases = [
    ['Orders kam ho rahe hain kya?', 'trend_orders', 'hinglish'],
    ['Sales gir rahi hai kya?', 'trend_sales', 'hinglish'],
    ['Delivery charge badhaun toh kya hoga?', 'delivery_fee_change', 'hinglish'],
    ['Discount dena chahiye kya?', 'discount_or_offer', 'hinglish'],
    ['Customers wapas aa rahe hain kya?', 'repeat_customers', 'hinglish'],
    ['Business kaise badhau?', 'broad_guidance', 'hinglish'],
    ['ऑर्डर कम हो रहे हैं क्या?', 'trend_orders', 'hi'],
    ['बिक्री कम हो रही है क्या?', 'trend_sales', 'hi'],
    ['डिलीवरी फीस बढ़ाऊं तो क्या होगा?', 'delivery_fee_change', 'hi'],
    ['डिस्काउंट देना चाहिए क्या?', 'discount_or_offer', 'hi'],
    ['ग्राहक वापस आ रहे हैं क्या?', 'repeat_customers', 'hi'],
    ['व्यापार कैसे बढ़ाऊं?', 'broad_guidance', 'hi'],
    ['दुकान खोलूं?', 'broad_guidance', 'hi'],
  ];
  for (const [question, intent, language] of languageCases) {
    const result = classifyQuestionIntent(question);
    assert.equal(result.intent, intent, question);
    assert.equal(result.language, language, question);
    assert.ok(Array.isArray(result.matchedTerms), question);
  }
  assert.equal(classifyQuestionIntent('Delivery fee badhaun aur discount bhi du?').status, 'clarify_question');
  assert.equal(classifyQuestionIntent('Delivery fee badhaun aur discount bhi du?').needsClarification, true);
  assert.equal(classifyQuestionIntent('Is my shop okay?').status, 'clarify_question');
});

test('broad questions return analyst guidance and a safe next step', () => {
  const staff = unsupportedQuestionGuidance('Should I hire another worker?');
  assert.equal(staff.category, 'broad_guidance');
  assert.match(staff.message, /daily orders|staff cost/i);
  assert.equal(staff.primary_prompt, 'Are my orders going up or down?');
  assert.equal(unsupportedQuestionGuidance('Why are my orders down?').category, 'guided_answer');
  assert.equal(unsupportedQuestionGuidance('Should I open a second shop?').category, 'broad_guidance');
});

test('trend and repeat intents use dedicated non-delivery calculations', () => {
  const rows = [
    { month: '2025-01', orders: 100, repeat_orders: 20, avg_order_value: 200, delivery_fee: 30 },
    { month: '2025-02', orders: 110, repeat_orders: 22, avg_order_value: 200, delivery_fee: 30 },
    { month: '2025-03', orders: 140, repeat_orders: 35, avg_order_value: 200, delivery_fee: 30 },
    { month: '2025-04', orders: 150, repeat_orders: 40, avg_order_value: 200, delivery_fee: 30 },
  ];
  const trend = computeRegressionResult('Are my orders going up?', rows, summarizeData(rows));
  const repeat = computeRegressionResult('Are customers coming back?', rows, summarizeData(rows));
  assert.equal(trend.method, 'recent_3_months_vs_previous_3_months');
  assert.equal(trend.lever, 'trend');
  assert.equal(repeat.method, 'recent_3_months_vs_previous_3_months');
  assert.equal(repeat.lever, 'repeat_customer');
  assert.equal(repeat.outcome_metric, 'repeat_orders');
});

test('trend path compares monthly windows and does not expose regression ranges', () => {
  const rows = Array.from({ length: 6 }, (_, i) => ({
    month: `2025-${String(i + 1).padStart(2, '0')}`,
    orders: 400 + i * 40,
    avg_order_value: 250,
  }));
  const result = computeRegressionResult('Are my sales increasing?', rows, summarizeData(rows));
  assert.equal(result.trend_summary.metric, 'sales');
  assert.equal(result.trend_summary.recent_label, 'Recent 3 months');
  assert.ok(result.trend_summary.recent_average > result.trend_summary.previous_average);
  assert.equal(result.range_low, null);
  assert.equal(result.range_high, null);
  assert.equal(result.r2, null);
});

test('trend without bill amounts answers orders only and explains the limitation', () => {
  const rows = Array.from({ length: 6 }, (_, i) => ({ month: `2025-${String(i + 1).padStart(2, '0')}`, orders: 300 + i * 10 }));
  const result = computeRegressionResult('Are my sales increasing?', rows, summarizeData(rows));
  assert.equal(result.trend_summary.metric, 'orders');
  assert.equal(result.trend_summary.sales_requested, true);
  assert.equal(result.trend_summary.sales_available, false);
});

test('bootstrap trend path keeps daily periods for a 7-day comparison', () => {
  const entries = Array.from({ length: 14 }, (_, i) => ({
    date: `2025-01-${String(i + 1).padStart(2, '0')}`,
    orders: 20 + i,
  }));
  const daily = aggregateBootstrapDailyEntries(entries);
  const result = computeRegressionResult('Are my orders going up?', daily.rows, summarizeData(daily.rows));
  assert.equal(daily.rows.length, 14);
  assert.equal(result.method, 'recent_7_days_vs_previous_7_days');
  assert.equal(result.trend_summary.granularity, 'daily');
  assert.equal(result.trend_summary.recent_label, 'Recent 7 days');
});

test('stabilized experience keeps primary paths and technical detail secondary', () => {
  const html = fs.readFileSync(path.join(__dirname, '..', 'public', 'index.html'), 'utf8');
  const script = fs.readFileSync(path.join(__dirname, '..', 'public', 'script.js'), 'utf8');
  assert.match(html, /class="path-title">Try Demo<\/span>/);
  assert.match(html, /class="path-title">Upload Your Data<\/span>/);
  assert.match(html, /Your simple business analyst for small shops\./);
  assert.match(html, /without confusing reports\./);
  assert.match(html, /No spreadsheet yet\? You can add daily sales manually after choosing Upload Your Data\./);
  assert.match(html, /<div class="overview-eyebrow">Answer<\/div>/);
  assert.match(html, />Why\?<\/h2>/);
  assert.match(html, />Try this<\/h2>/);
  assert.match(html, /How sure is this\?/);
  assert.match(html, />Data used<\/h2>/);
  assert.match(html, /<summary>Details<\/summary>/);
  assert.doesNotMatch(html, /id="threshold-marker"[^>]*>.*id="threshold-marker"/s);
  assert.match(script, /sampleSuggestions\.hidden = isReal \|\| isDataChooserOpen \|\| !demoTourOpen/);
  assert.match(script, /Choose discount column/);
  assert.match(script, /Ask a different question/);
});
