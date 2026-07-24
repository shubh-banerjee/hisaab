const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const serverPath = path.join(root, 'server.js');
const scriptPath = path.join(root, 'public', 'script.js');

function read(filePath) {
  return fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf8') : '';
}

function writeIfChanged(filePath, before, after, label) {
  if (after !== before) {
    fs.writeFileSync(filePath, after, 'utf8');
    console.log(`[question-scope-fixes] ${label}`);
  }
}

function patchClient() {
  if (!fs.existsSync(scriptPath)) return;
  let source = read(scriptPath);
  const before = source;

  if (!source.includes('guidance-single-chip-source-v1')) {
    const showMarker = `  function showGuidanceMessage(body) {
    const card = document.getElementById('dc-guidance-card');
    const msgEl = document.getElementById('dc-guidance-message');
    const questionsEl = document.getElementById('dc-guidance-questions');
    if (!card || !msgEl || !questionsEl) return;
    msgEl.textContent = body.guidance_message || '';`;
    const showReplacement = `  function showGuidanceMessage(body) {
    const card = document.getElementById('dc-guidance-card');
    const msgEl = document.getElementById('dc-guidance-message');
    const questionsEl = document.getElementById('dc-guidance-questions');
    const baseSuggestions = document.getElementById('dc-suggested-questions');
    if (!card || !msgEl || !questionsEl) return;
    // guidance-single-chip-source-v1: while guidance is visible, keep only the
    // contextual chips inside the guidance card. The default chips below caused
    // duplicate options and made the Ask screen noisy.
    if (baseSuggestions) {
      baseSuggestions.dataset.hiddenByGuidance = 'true';
      baseSuggestions.hidden = true;
    }
    msgEl.textContent = body.guidance_message || '';`;

    if (!source.includes(showMarker)) throw new Error('showGuidanceMessage marker not found');
    source = source.replace(showMarker, showReplacement);

    const hideMarker = `  function hideGuidanceMessage() {
    const card = document.getElementById('dc-guidance-card');
    if (card) card.hidden = true;
  }`;
    const hideReplacement = `  function hideGuidanceMessage() {
    const card = document.getElementById('dc-guidance-card');
    if (card) card.hidden = true;
    const baseSuggestions = document.getElementById('dc-suggested-questions');
    const askScreen = document.getElementById('dc-screen-ask');
    if (baseSuggestions && baseSuggestions.dataset.hiddenByGuidance === 'true') {
      delete baseSuggestions.dataset.hiddenByGuidance;
      baseSuggestions.hidden = !(askScreen && !askScreen.hidden && baseSuggestions.children.length > 0);
    }
  }`;

    if (!source.includes(hideMarker)) throw new Error('hideGuidanceMessage marker not found');
    source = source.replace(hideMarker, hideReplacement);
  }

  writeIfChanged(scriptPath, before, source, 'patched public/script.js');
}

function patchServer() {
  if (!fs.existsSync(serverPath)) return;
  let source = read(serverPath);
  const before = source;

  if (!source.includes('hisaab-question-scope-v2')) {
    const helper = [
      '// hisaab-question-scope-v2: Hisaab answers business questions about the connected sales data only.',
      'function defaultHisaabQuestions(sheetSummary) {',
      '  const fromSummary = typeof supportedQuestionsFromSummary === \'function\' ? supportedQuestionsFromSummary(sheetSummary) : [];',
      '  const fallback = [',
      "    'Are my orders going up or down?',",
      "    'What happens if I change my prices?',",
      "    'Should I raise my delivery fee?',",
      '  ];',
      '  return (fromSummary.length ? fromSummary : fallback).slice(0, 3);',
      '}',
      '',
      'function questionLooksLikeHisaabQuestion(question) {',
      '  const text = String(question || \'\').trim().toLowerCase();',
      '  if (!text) return { inScope: false, reason: \'empty\' };',
      '  const businessSignal = /\\b(order|orders|sale|sales|revenue|business|shop|store|customer|customers|repeat|price|prices|pricing|delivery|shipping|fee|fees|discount|promo|promotion|offer|cod|cash on delivery|month|monthly|trend|grow|growth|profit|margin|cost|expense|expenses|product|products|item|items|sku|category|bill|billing|aov|average order|average bill)\\b/i;',
      '  const hindiBusinessSignal = /[\\u0900-\\u097F]*(ऑर्डर|बिक्री|दुकान|ग्राहक|कीमत|डिलीवरी|छूट|मुनाफा|खर्च|बिल|महीना)[\\u0900-\\u097F]*/i;',
      '  const hinglishBusinessSignal = /\\b(dukaan|dhandha|vyapar|bech|bikri|grahak|daam|kimat|munafa|kharcha|order|delivery|discount)\\b/i;',
      '  if (businessSignal.test(text) || hindiBusinessSignal.test(text) || hinglishBusinessSignal.test(text)) {',
      '    return { inScope: true, reason: \'business_data_question\' };',
      '  }',
      '  return { inScope: false, reason: \'not_about_sales_data\' };',
      '}',
      '',
      'function guidanceForUnsupportedQuestion(question, sheetSummary) {',
      '  const examples = defaultHisaabQuestions(sheetSummary);',
      "  const exampleText = examples.length ? ' Try asking: ' + examples.slice(0, 2).join(' or ') + '.' : '';",
      "  return 'I can’t answer that in Hisaab because it is not about your connected sales data. Ask about orders, sales, prices, delivery fees, discounts, customers, or profit/margin if those columns exist.' + exampleText;",
      '}',
      ''
    ].join('\n');
    source = source.replace("app.post('/api/simulate', async (req, res) => {", helper + "\napp.post('/api/simulate', async (req, res) => {");
  }

  if (!source.includes('hisaab-question-scope-guard-v2')) {
    const marker = '  const { data, dataSource, sheetSummary } = await getSimulationData(sheetUrl, manualInputs, csvText, bootstrapOwner);';
    const guard = [
      marker,
      '',
      '  // hisaab-question-scope-guard-v2: valid sales data does not make Hisaab a generic chatbot.',
      '  // Reject unrelated questions before any fallback can silently turn them into price/delivery scenarios.',
      '  const questionScope = questionLooksLikeHisaabQuestion(question.trim());',
      '  if (!questionScope.inScope) {',
      '    return sendHisaabGuidance(res, {',
      '      sessionId,',
      '      uploadId,',
      '      question,',
      '      dataSource,',
      '      sheetSummary,',
      '      guidanceMessage: guidanceForUnsupportedQuestion(question.trim(), sheetSummary),',
      '      suggestedQuestions: defaultHisaabQuestions(sheetSummary),',
      "      reason: 'unsupported_question',",
      '    });',
      '  }'
    ].join('\n');
    if (!source.includes(marker)) throw new Error('simulate data marker not found');
    source = source.replace(marker, guard);
  }

  if (!source.includes('hisaab-classifier-fail-closed-v2')) {
    const catchRegex = /    } catch \(err\) \{\n      \/\/ Classification failed \(network\/parse error\)[\s\S]*?console\.error\('\[classifyQuestionIntentWithGemini\] failed, falling back to regex scenario:', err\?\.message \|\| err\);\n    \}/;
    const failClosed = [
      '    } catch (err) {',
      '      // hisaab-classifier-fail-closed-v2: never turn an unclear question into a default delivery-fee result.',
      "      console.error('[classifyQuestionIntentWithGemini] failed, returning guidance instead of defaulting to a scenario:', err?.message || err);",
      '      return sendHisaabGuidance(res, {',
      '        sessionId,',
      '        uploadId,',
      '        question,',
      '        dataSource,',
      '        sheetSummary,',
      '        guidanceMessage: guidanceForUnsupportedQuestion(question.trim(), sheetSummary),',
      '        suggestedQuestions: defaultHisaabQuestions(sheetSummary),',
      "        reason: 'intent_classifier_failed',",
      '      });',
      '    }'
    ].join('\n');

    if (catchRegex.test(source)) {
      source = source.replace(catchRegex, failClosed);
    } else {
      console.warn('[question-scope-fixes] classifier fallback block not found; skipped fail-closed replacement');
    }
  }

  writeIfChanged(serverPath, before, source, 'patched server.js');
}

try {
  patchClient();
  patchServer();
} catch (err) {
  console.warn(`[question-scope-fixes] skipped: ${err.message}`);
}
