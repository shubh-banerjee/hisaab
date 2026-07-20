const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

process.env.HISAAB_TEST_MODE = '1';

const {
  aggregateBootstrapEntries,
  aggregateSheetRows,
  alignGeneratedWithComputed,
  app,
  assessEvidence,
  buildAnalyticsCapabilities,
  classifySheetColumnsFallback,
  comparisonCategory,
  comparisonMessage,
  computeRegressionResult,
  dataMaturity,
  detectFallbackLanguage,
  detectScenario,
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

  assert.equal(evidenceFor('What if I increase my price by 10 percent?', rowsForFees([20, 30, 40, 50]), noValue).category, 'unsupported_question');
  assert.equal(evidenceFor('Will repeat customers increase?', rowsForFees([20, 30, 40, 50]), noCustomer).category, 'unsupported_question');
  assert.equal(evidenceFor('Do discounts bring more orders?', rowsForFees([20, 30, 40, 50]), noPromo).category, 'unsupported_question');
  assert.equal(evidenceFor('What if I increase delivery fee by 5?', rowsForFees([20, 30, 40, 50]), noFee).category, 'unsupported_question');
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
