const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const serverPath = path.join(root, 'server.js');
const scriptPath = path.join(root, 'public', 'script.js');
const cssPath = path.join(root, 'public', 'style.css');

function read(filePath) {
  return fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf8') : '';
}

function writeIfChanged(filePath, before, after, label) {
  if (after !== before) {
    fs.writeFileSync(filePath, after, 'utf8');
    console.log(`[business-router] ${label}`);
  }
}

function patchServer() {
  if (!fs.existsSync(serverPath)) return;
  let source = read(serverPath);
  const before = source;

  if (!source.includes('hisaab-business-router-v1')) {
    const helper = String.raw`
// hisaab-business-router-v1: route SMB questions into honest answer types, not one forced what-if calculator.
function sourceAvailableForBusinessRouter(dataSource, field) {
  const status = dataSource?.field_sources?.[field]?.status;
  return ['derived', 'derived_manual', 'derived_low_confidence', 'fallback'].includes(status);
}

function detectBusinessAnswerType(question) {
  const text = String(question || '').trim().toLowerCase();
  const asksChange = /\b(what\s+happens|change|raise|increase|decrease|lower|reduce|test|try|should\s+i|if\s+i|if\s+we|impact|effect)\b/i.test(text);
  const whatIfLever = /\b(price|prices|pricing|delivery|shipping|fee|fees|discount|promo|promotion|offer|cod|cash\s+on\s+delivery)\b/i.test(text);
  if (asksChange && whatIfLever) return 'what_if';
  if (/\b(order|orders)\b/i.test(text) && /\b(up|down|going|trend|growing|dropping|drop|increase|decrease|month|months|changed|change)\b/i.test(text)) return 'order_trend';
  if (/\b(sales|revenue|earning|earnings|bill|billing|aov|average\s+order|order\s+value|money)\b/i.test(text)) return 'sales_trend';
  if (/\b(customer|customers|repeat|returning|retain|retention|loyal|loyalty|come\s+back|coming\s+back)\b/i.test(text)) return 'customer_retention';
  if (/\b(profit|margin|cost|expense|expenses|cogs)\b/i.test(text)) return 'profit_missing';
  if (/\b(product|products|item|items|sku|category|categories)\b/i.test(text)) return 'product_missing';
  if (/\b(grow|growth|improve|better|what\s+should|what\s+shall|business|shop|store|next|strategy|retain|badha|badhau|kaise|kya\s+karu|karna)\b/i.test(text)) return 'business_guidance';
  return 'business_guidance';
}

function metricSeriesForBusinessRouter(rows, metric) {
  if (metric === 'revenue') {
    return (rows || [])
      .map(row => ({ month: row.month, value: Number(row.orders) * Number(row.avg_order_value) }))
      .filter(point => point.month && Number.isFinite(point.value));
  }
  return (rows || [])
    .map(row => ({ month: row.month, value: Number(row[metric]) }))
    .filter(point => point.month && Number.isFinite(point.value));
}

function compareBusinessMetric(rows, metric) {
  const series = metricSeriesForBusinessRouter(rows, metric);
  if (series.length < 2) {
    return { ok: false, series, changePct: null, direction: 'not_enough_history', recentAvg: null, earlierAvg: null };
  }
  const split = Math.max(1, Math.floor(series.length / 2));
  const earlier = series.slice(0, split).map(p => p.value);
  const recent = series.slice(split).map(p => p.value);
  const earlierAvg = mean(earlier);
  const recentAvg = mean(recent);
  const changePct = earlierAvg ? ((recentAvg - earlierAvg) / earlierAvg) * 100 : 0;
  const direction = Math.abs(changePct) < 5 ? 'stable' : changePct > 0 ? 'up' : 'down';
  return { ok: true, series, changePct: round(changePct, 1), direction, recentAvg: round(recentAvg, 1), earlierAvg: round(earlierAvg, 1) };
}

function moneyPlain(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return 'not available';
  return '₹' + Math.round(n).toLocaleString('en-IN');
}

function trendSentence(label, stats) {
  if (!stats.ok) return `I do not have enough history yet to read ${label} honestly.`;
  if (stats.direction === 'up') return `${label} are up by about ${Math.abs(stats.changePct)}% compared with the earlier period.`;
  if (stats.direction === 'down') return `${label} are down by about ${Math.abs(stats.changePct)}% compared with the earlier period.`;
  return `${label} look mostly stable compared with the earlier period.`;
}

function capabilityStatusByKey(sheetSummary, key) {
  return (sheetSummary?.capability_map?.capabilities || []).find(item => item.key === key)?.status || 'missing';
}

function buildTrendBusinessAnswer(question, rows, dataSource, sheetSummary, metric) {
  const isRevenue = metric === 'revenue';
  const stats = compareBusinessMetric(rows, metric);
  const metricLabel = isRevenue ? 'Sales' : 'Orders';
  const promptForNext = isRevenue ? 'What changed in my sales?' : 'What happens if I change my prices?';
  const foundFacts = [];
  if (stats.ok) {
    foundFacts.push(`${metricLabel}: ${stats.direction === 'stable' ? 'mostly stable' : stats.direction === 'up' ? 'going up' : 'going down'}`);
    foundFacts.push(`Recent average: ${isRevenue ? moneyPlain(stats.recentAvg) : Math.round(stats.recentAvg) + ' orders'}`);
    foundFacts.push(`Earlier average: ${isRevenue ? moneyPlain(stats.earlierAvg) : Math.round(stats.earlierAvg) + ' orders'}`);
  }
  const limitation = isRevenue && !sourceAvailableForBusinessRouter(dataSource, 'avg_order_value')
    ? 'I can read order movement, but sales amount is limited because order value is missing.'
    : sheetSummary?.caveat_line || '';
  return {
    answer_type: isRevenue ? 'sales_trend' : 'order_trend',
    title: isRevenue ? 'Here is what your sales are doing' : 'Here is what your orders are doing',
    answer: trendSentence(metricLabel, stats),
    subtext: stats.ok ? 'I compared your recent history with the earlier part of the same file.' : 'Upload more dated sales rows to make this stronger.',
    found_facts: foundFacts,
    limitation,
    action_cards: [
      { tone: 'safe', label: 'Safest next step', title: 'Check the slow period first', body: 'Look at the months where orders were weaker before changing prices or offers.', cta: 'Ask this', prompt: 'Which months were weaker for my orders?' },
      { tone: 'moderate', label: 'Small test', title: 'Try one small improvement', body: 'Pick one change for a few days, then compare orders before and after.', cta: 'Ask this', prompt: promptForNext },
      { tone: 'higher', label: 'Higher risk', title: 'Avoid a big discount first', body: 'A large discount can hide the real issue if orders are falling for another reason.', cta: 'Ask this', prompt: 'Are my discounts actually working?' },
    ],
    suggested_questions: supportedQuestionsFromSummary(sheetSummary),
  };
}

function buildCustomerBusinessAnswer(question, rows, dataSource, sheetSummary) {
  const hasRepeat = sourceAvailableForBusinessRouter(dataSource, 'repeat_orders');
  const stats = hasRepeat ? compareBusinessMetric(rows, 'repeat_orders') : { ok: false, direction: 'missing', changePct: null };
  const title = 'Here is how to think about customers';
  const answer = hasRepeat
    ? trendSentence('Repeat customer orders', stats)
    : 'I can guide retention, but I cannot measure repeat customers accurately because customer/repeat-order data is missing.';
  const foundFacts = hasRepeat && stats.ok
    ? [`Repeat orders: ${stats.direction === 'stable' ? 'mostly stable' : stats.direction === 'up' ? 'improving' : 'falling'}`, `Recent average: ${Math.round(stats.recentAvg)} repeat orders`, `Earlier average: ${Math.round(stats.earlierAvg)} repeat orders`]
    : ['Customer column: not reliable enough', 'Use this as guidance, not measurement'];
  return {
    answer_type: 'customer_retention',
    title,
    answer,
    subtext: 'For a small shop, retention usually means bringing recent buyers back before spending heavily on new customers.',
    found_facts: foundFacts,
    limitation: hasRepeat ? (sheetSummary?.caveat_line || '') : 'Add customer name, phone, email, or repeat-order ID later to measure this properly.',
    action_cards: [
      { tone: 'safe', label: 'Safest', title: 'Message recent buyers', body: 'Start with people who bought recently. A simple reminder is low cost and easy to track.', cta: 'Ask this', prompt: 'Are customers coming back?' },
      { tone: 'moderate', label: 'Small test', title: 'Try a repeat-customer offer', body: 'Give a small thank-you offer to returning buyers for a few days, then watch orders.', cta: 'Ask this', prompt: 'Are my discounts actually working?' },
      { tone: 'higher', label: 'Higher effort', title: 'Start collecting customer IDs', body: 'Use phone number or name in your sheet so Hisaab can measure repeat customers next time.', cta: 'Ask this', prompt: 'What data should I add for repeat customers?' },
    ],
    suggested_questions: supportedQuestionsFromSummary(sheetSummary),
  };
}

function buildBroadBusinessAnswer(question, rows, dataSource, sheetSummary) {
  const orderStats = compareBusinessMetric(rows, 'orders');
  const hasAov = sourceAvailableForBusinessRouter(dataSource, 'avg_order_value');
  const hasRepeat = sourceAvailableForBusinessRouter(dataSource, 'repeat_orders');
  const hasPromo = sourceAvailableForBusinessRouter(dataSource, 'promo_active');
  const facts = [];
  if (orderStats.ok) facts.push(`Orders: ${orderStats.direction === 'stable' ? 'mostly stable' : orderStats.direction === 'up' ? 'going up' : 'going down'}`);
  facts.push(hasAov ? 'Order value: available' : 'Order value: missing');
  facts.push(hasRepeat ? 'Customer data: available' : 'Customer data: missing');
  const mainFocus = orderStats.direction === 'down'
    ? 'First, understand why orders are dropping before making a big change.'
    : hasRepeat
      ? 'First, use existing customers better before spending on broad offers.'
      : 'First, make the next small test measurable: orders, sales, or repeat customers.';
  return {
    answer_type: 'business_guidance',
    title: 'Here is a practical next step',
    answer: mainFocus,
    subtext: 'I am using what your uploaded data can support, and I will not guess beyond missing columns.',
    found_facts: facts,
    limitation: sheetSummary?.caveat_line || (!hasRepeat ? 'Customer retention answers will be directional until customer data is added.' : ''),
    action_cards: [
      { tone: 'safe', label: 'Safest', title: 'Find the trend first', body: 'Before changing anything, confirm whether orders are rising, falling, or stable.', cta: 'Ask this', prompt: 'Are my orders going up or down?' },
      { tone: 'moderate', label: 'Small test', title: hasRepeat ? 'Bring recent customers back' : 'Test one small offer', body: hasRepeat ? 'Target recent buyers before running a broad discount.' : 'Run a small offer for a few days and track orders.', cta: 'Ask this', prompt: hasPromo ? 'Are my discounts actually working?' : 'What changed in my sales?' },
      { tone: 'higher', label: 'Higher risk', title: 'Avoid broad discounts first', body: 'A broad discount can reduce revenue if the real issue is price, delivery fee, or retention.', cta: 'Ask this', prompt: 'What happens if I change my prices?' },
    ],
    suggested_questions: supportedQuestionsFromSummary(sheetSummary),
  };
}

function buildMissingDataBusinessAnswer(type, question, dataSource, sheetSummary) {
  const isProfit = type === 'profit_missing';
  return {
    answer_type: type,
    title: isProfit ? 'I need cost data to answer profit' : 'I need product data to answer this',
    answer: isProfit
      ? 'I can read sales movement, but I cannot calculate profit honestly without cost, margin, or expense data.'
      : 'I can read overall sales/orders, but I cannot compare products without product, item, SKU, or category data.',
    subtext: 'I can still guide you using the reliable parts of your sheet.',
    found_facts: supportedQuestionsFromSummary(sheetSummary).length ? ['Some sales questions are still answerable'] : ['The current sheet is limited'],
    limitation: isProfit ? 'Add cost price, expenses, margin, or profit columns to make this accurate.' : 'Add product name, SKU, item, or category columns to make this accurate.',
    action_cards: [
      { tone: 'safe', label: 'Use current data', title: 'Check order trend', body: 'This uses the data already available in your sheet.', cta: 'Ask this', prompt: 'Are my orders going up or down?' },
      { tone: 'moderate', label: 'Improve data', title: isProfit ? 'Add cost or margin' : 'Add product/category', body: 'One extra column will unlock a much more accurate answer next time.', cta: 'Ask this', prompt: isProfit ? 'What data should I add to calculate profit?' : 'What data should I add to compare products?' },
    ],
    suggested_questions: supportedQuestionsFromSummary(sheetSummary),
  };
}

function buildBusinessAnswerRoute(question, rows, dataSource, sheetSummary) {
  const type = detectBusinessAnswerType(question);
  if (type === 'what_if') return null;
  if (type === 'order_trend') return buildTrendBusinessAnswer(question, rows, dataSource, sheetSummary, 'orders');
  if (type === 'sales_trend') {
    const metric = sourceAvailableForBusinessRouter(dataSource, 'avg_order_value') ? 'revenue' : 'orders';
    return buildTrendBusinessAnswer(question, rows, dataSource, sheetSummary, metric);
  }
  if (type === 'customer_retention') return buildCustomerBusinessAnswer(question, rows, dataSource, sheetSummary);
  if (type === 'profit_missing' || type === 'product_missing') return buildMissingDataBusinessAnswer(type, question, dataSource, sheetSummary);
  return buildBroadBusinessAnswer(question, rows, dataSource, sheetSummary);
}

async function sendBusinessAnswer(res, { sessionId, uploadId, question, dataSource, sheetSummary, answerBundle, rows, summary }) {
  const answer = answerBundle.answer;
  const questionPersistence = await firestoreService.saveQuestion({ sessionId, uploadId: uploadId || null, question: question.trim(), answer });
  await firestoreService.saveEvent({
    type: 'ask',
    sessionId,
    uploadId: uploadId || null,
    questionId: questionPersistence.id,
    metadata: { status: 'business_answer', answerType: answerBundle.answer_type },
  });
  const trend = compareBusinessMetric(rows, answerBundle.answer_type === 'sales_trend' && sourceAvailableForBusinessRouter(dataSource, 'avg_order_value') ? 'revenue' : 'orders');
  return res.json({
    session_id: sessionId,
    status: 'business_answer',
    question: question.trim(),
    answer_type: answerBundle.answer_type,
    business_answer: answerBundle,
    summary,
    data_source: dataSource,
    sheet_summary: sheetSummary,
    chart_series: (trend.series || []).map(point => ({ month: point.month, value: point.value, orders: point.value })),
    generated: {
      recommendation: answerBundle.answer,
      why: answerBundle.subtext || '',
      outcome_metric_label: answerBundle.answer_type.replace(/_/g, ' '),
      detected_language: detectFallbackLanguage(question),
      source: 'business_router',
    },
    computed: {
      outcome_metric: answerBundle.answer_type === 'sales_trend' ? 'revenue' : 'orders',
      outcome_value: trend.ok ? trend.changePct : null,
      range_low: null,
      range_high: null,
      confidence: 0.55,
      monthly_revenue_impact: null,
      worst_case_revenue_impact: null,
      trend_pct: trend.ok ? trend.changePct : null,
      method: 'business_question_router',
      sample_size: rows.length,
      low_signal_warning: answerBundle.limitation || null,
    },
    persistence: { question: questionPersistence },
  });
}
`;
    source = source.replace("app.post('/api/simulate', async (req, res) => {", helper + "\napp.post('/api/simulate', async (req, res) => {");
  }

  if (!source.includes('business-router-before-what-if-v1')) {
    const marker = "  const summary = summarizeData(data);\n\n  // If the question has zero real lever signal";
    const replacement = String.raw`  const summary = summarizeData(data);

  // business-router-before-what-if-v1: answer non-what-if business questions with the right result type.
  const routedBusinessAnswer = buildBusinessAnswerRoute(question.trim(), data, dataSource, sheetSummary);
  if (routedBusinessAnswer) {
    return sendBusinessAnswer(res, {
      sessionId,
      uploadId,
      question,
      dataSource,
      sheetSummary,
      answerBundle: routedBusinessAnswer,
      rows: data,
      summary,
    });
  }

  // If the question has zero real lever signal`;
    if (!source.includes(marker)) throw new Error('business router insertion marker not found');
    source = source.replace(marker, replacement);
  }

  writeIfChanged(serverPath, before, source, 'patched server.js');
}

function patchScript() {
  if (!fs.existsSync(scriptPath)) return;
  let source = read(scriptPath);
  const before = source;

  if (!source.includes('business-answer-renderer-v1')) {
    const helper = String.raw`
  // business-answer-renderer-v1: simple SMB-friendly result page for insight/guidance questions.
  function ensureBusinessAnswerBlock() {
    let block = document.getElementById('business-answer-block');
    if (block) return block;
    block = document.createElement('div');
    block.id = 'business-answer-block';
    block.className = 'business-answer-block';
    const scenarioBlock = document.getElementById('scenarios-block');
    const results = document.getElementById('results');
    if (scenarioBlock && scenarioBlock.parentElement) scenarioBlock.parentElement.insertBefore(block, scenarioBlock);
    else if (results) results.appendChild(block);
    return block;
  }

  function renderBusinessAnswer(data, elapsed = 0) {
    const demoOverlay = document.getElementById('demo-lesson');
    if (demoOverlay && !demoOverlay.hidden) closeDemoLesson();
    const dataConnectOverlay = document.getElementById('data-connect-page');
    if (dataConnectOverlay && !dataConnectOverlay.hidden) closeDataConnectPage();

    const bundle = data.business_answer || {};
    const detected = String(data.generated?.detected_language || data.detected_language || '').toLowerCase();
    setUILang(detected === 'hi' ? 'hi' : 'en');
    if (data.session_id) localStorage.setItem('hisaabSessionId', data.session_id);
    lastSimulationPersistence = data.persistence || null;
    setDataSource(data.data_source);
    renderConnectedDataState(data.data_source);
    if (data.sheet_summary) {
      lastSheetSummary = data.sheet_summary;
      renderSheetSummary(data.sheet_summary);
    }

    const block = ensureBusinessAnswerBlock();
    const facts = Array.isArray(bundle.found_facts) ? bundle.found_facts.filter(Boolean).slice(0, 4) : [];
    const cards = Array.isArray(bundle.action_cards) ? bundle.action_cards.filter(Boolean).slice(0, 3) : [];
    const suggestions = Array.isArray(bundle.suggested_questions) ? bundle.suggested_questions.filter(Boolean).slice(0, 3) : [];
    block.innerHTML = `
      <div class="business-answer-question">
        <div class="business-eyebrow">You asked</div>
        <h2>${escapeHtml(data.question || lastQuestion || '')}</h2>
        <p>${escapeHtml(bundle.subtext || 'I looked at what your uploaded data can honestly support.')}</p>
      </div>
      <div class="business-answer-card">
        <div class="business-eyebrow">Hisaab says</div>
        <h3>${escapeHtml(bundle.title || 'Here is the clearest read')}</h3>
        <p class="business-answer-main">${escapeHtml(bundle.answer || '')}</p>
        ${facts.length ? `<div class="business-facts">${facts.map(fact => `<span>${escapeHtml(fact)}</span>`).join('')}</div>` : ''}
        ${bundle.limitation ? `<div class="business-limitation">${escapeHtml(bundle.limitation)}</div>` : ''}
      </div>
      ${cards.length ? `<div class="business-action-grid">${cards.map(card => `
        <div class="business-action-card ${escapeHtml(card.tone || '')}">
          <div class="business-card-label">${escapeHtml(card.label || '')}</div>
          <h4>${escapeHtml(card.title || '')}</h4>
          <p>${escapeHtml(card.body || '')}</p>
          ${card.prompt ? `<button class="business-card-cta" type="button" data-prompt="${escapeHtml(card.prompt)}">${escapeHtml(card.cta || 'Ask this')}</button>` : ''}
        </div>
      `).join('')}</div>` : ''}
      ${suggestions.length ? `<div class="business-next-questions"><div class="business-eyebrow">Good next questions</div>${suggestions.map(q => `<button class="chip" type="button" data-prompt="${escapeHtml(q)}">${escapeHtml(q)}</button>`).join('')}</div>` : ''}
    `;
    block.hidden = false;
    block.querySelectorAll('[data-prompt]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const prompt = btn.getAttribute('data-prompt') || '';
        if (!prompt) return;
        questionInput.value = prompt;
        resizeQuestion();
        updateQuestionState();
        await runSimulation({ questionOverride: prompt, skipValidation: true });
      });
    });

    const scenariosBlock = document.getElementById('scenarios-block');
    if (scenariosBlock) scenariosBlock.hidden = true;
    const evidenceBlock = document.getElementById('evidence-block');
    if (evidenceBlock) evidenceBlock.hidden = true;
    const confidenceBlockEl = document.getElementById('confidence-block');
    if (confidenceBlockEl) confidenceBlockEl.hidden = true;
    const explainBlockEl = document.querySelector('#results .explain');
    if (explainBlockEl) explainBlockEl.hidden = true;
    intentPrompt.classList.remove('show', 'captured');
    intentPrompt.hidden = true;
    refineInline.hidden = true;

    stage.classList.add('has-result');
    resultsSection.hidden = false;
    resultsSection.classList.add('show');
    currentResult = makeResultSnapshot(data, elapsed, {
      id: crypto.randomUUID ? crypto.randomUUID() : `result-${Date.now()}`,
      question: data.question || lastQuestion,
      refinement: '',
      value: finiteNumber(data.computed?.outcome_value),
      isWeak: true,
    });
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    updateAwayFromLandingState();
  }
`;
    const marker = '  function renderResults(data, elapsed, options = {}) {';
    if (!source.includes(marker)) throw new Error('renderResults marker not found');
    source = source.replace(marker, helper + '\n' + marker);
  }

  if (!source.includes('business-answer-status-v1')) {
    const marker = `      if (body.status === 'guidance') {`;
    const replacement = `      if (body.status === 'business_answer') {
        if (body.session_id) localStorage.setItem('hisaabSessionId', body.session_id);
        renderBusinessAnswer(body, Date.now() - startTime);
        return;
      }
      // business-answer-status-v1
      if (body.status === 'guidance') {`;
    if (!source.includes(marker)) throw new Error('guidance status marker not found');
    source = source.replace(marker, replacement);
  }

  if (!source.includes('hide-business-answer-block-v1')) {
    const marker = `    if (scenariosBlock) scenariosBlock.hidden = true;`;
    const replacement = `    if (scenariosBlock) scenariosBlock.hidden = true;
    const businessAnswerBlock = document.getElementById('business-answer-block');
    if (businessAnswerBlock) businessAnswerBlock.hidden = true;
    // hide-business-answer-block-v1`;
    if (!source.includes(marker)) throw new Error('hideResults marker not found');
    source = source.replace(marker, replacement);
  }

  writeIfChanged(scriptPath, before, source, 'patched public/script.js');
}

function patchCss() {
  if (!fs.existsSync(cssPath)) return;
  let source = read(cssPath);
  const before = source;
  if (!source.includes('business-answer-ui-v1')) {
    source += `

/* business-answer-ui-v1: plain, calm analyst result for non-what-if questions */
.business-answer-block{max-width:760px;margin:0 auto 28px;display:grid;gap:18px;}
.business-answer-question{padding:0 0 2px;}
.business-eyebrow{font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#8190aa;font-weight:800;margin-bottom:8px;}
.business-answer-question h2{margin:0;color:var(--ink);font-size:26px;line-height:1.15;letter-spacing:-.03em;}
.business-answer-question p{margin:8px 0 0;color:var(--muted);font-size:15px;line-height:1.55;max-width:680px;}
.business-answer-card,.business-action-card{border:1px solid rgba(133,148,179,.28);border-radius:22px;background:rgba(255,255,255,.54);box-shadow:none;}
.business-answer-card{padding:28px;}
.business-answer-card h3{margin:0;color:var(--ink);font-size:30px;line-height:1.12;letter-spacing:-.04em;}
.business-answer-main{margin:14px 0 0;color:#34425f;font-size:18px;line-height:1.6;}
.business-facts{display:flex;flex-wrap:wrap;gap:8px;margin-top:18px;}
.business-facts span{border:1px solid rgba(133,148,179,.28);border-radius:999px;padding:8px 12px;background:#fff;color:#34425f;font-size:13px;font-weight:700;}
.business-limitation{margin-top:18px;border-radius:16px;background:#fff8e8;border:1px solid #f3d79d;color:#8a5b00;padding:12px 14px;font-size:14px;line-height:1.45;}
.business-action-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px;}
.business-action-card{padding:20px;min-height:220px;display:flex;flex-direction:column;align-items:flex-start;}
.business-card-label{font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:#8190aa;font-weight:900;margin-bottom:12px;}
.business-action-card.safe{border-color:#8fb4ff;}
.business-action-card.moderate{border-color:rgba(133,148,179,.34);}
.business-action-card.higher{border-color:#f0c77b;}
.business-action-card h4{margin:0;color:var(--ink);font-size:18px;line-height:1.25;letter-spacing:-.02em;}
.business-action-card p{margin:10px 0 18px;color:#4b5a78;font-size:14px;line-height:1.5;}
.business-card-cta{margin-top:auto;border:1px solid rgba(49,109,255,.35);border-radius:999px;background:#fff;color:var(--accent);font-weight:800;padding:10px 16px;min-width:112px;}
.business-card-cta:hover{border-color:var(--accent);}
.business-next-questions{border-top:1px solid rgba(133,148,179,.18);padding-top:16px;display:flex;flex-wrap:wrap;gap:8px;align-items:center;}
.business-next-questions .business-eyebrow{width:100%;margin-bottom:0;}
@media (max-width: 820px){.business-answer-block{max-width:100%;}.business-action-grid{grid-template-columns:1fr;}.business-answer-card{padding:22px}.business-answer-card h3{font-size:24px}.business-answer-question h2{font-size:22px}}
`;
  }
  writeIfChanged(cssPath, before, source, 'patched public/style.css');
}

function runPatch(label, fn) {
  try { fn(); } catch (err) { console.warn(`[business-router] skipped ${label}: ${err.message}`); }
}

runPatch('server.js', patchServer);
runPatch('public/script.js', patchScript);
runPatch('public/style.css', patchCss);
