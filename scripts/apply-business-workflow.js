const fs = require('fs');
const path = require('path');
const childProcess = require('child_process');

const root = path.resolve(__dirname, '..');
const serverPath = path.join(root, 'server.js');
const scriptPath = path.join(root, 'public', 'script.js');
const cssPath = path.join(root, 'public', 'style.css');

function read(filePath) {
  return fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf8') : '';
}

function writeIfChanged(filePath, before, after, label) {
  if (before !== after) {
    fs.writeFileSync(filePath, after, 'utf8');
    console.log(`[business-workflow] ${label}`);
  }
}

const SERVER_HELPER = String.raw`
// hisaab-business-workflow-v2: route non-what-if SMB questions before the old what-if calculator.
function hisaabBusinessCanUse(info) {
  return ['derived', 'derived_manual', 'derived_low_confidence', 'fallback'].includes(info?.status);
}
function hisaabBusinessCanUseField(dataSource, field) {
  return hisaabBusinessCanUse(dataSource?.field_sources?.[field]);
}
function hisaabBusinessMoney(value) {
  const n = Number(value);
  return Number.isFinite(n) ? '₹' + Math.round(n).toLocaleString('en-IN') : 'not available';
}
function hisaabBusinessMetricValue(metric, value) {
  if (value === null || value === undefined || !Number.isFinite(Number(value))) return 'not enough data';
  if (metric === 'revenue') return hisaabBusinessMoney(value);
  return Math.round(Number(value)).toLocaleString('en-IN') + ' orders';
}
function hisaabBusinessSeries(rows, metric) {
  return (rows || []).map(row => {
    if (metric === 'revenue') {
      const orders = Number(row.orders);
      const aov = Number(row.avg_order_value);
      return { month: row.month, value: Number.isFinite(orders) && Number.isFinite(aov) ? orders * aov : NaN };
    }
    return { month: row.month, value: Number(row[metric]) };
  }).filter(point => point.month && Number.isFinite(point.value));
}
function hisaabBusinessCompare(rows, metric) {
  const series = hisaabBusinessSeries(rows, metric);
  if (series.length < 2) return { ok: false, series, direction: 'not_enough_history', changePct: null, recentAvg: null, earlierAvg: null };
  const split = Math.max(1, Math.floor(series.length / 2));
  const earlier = series.slice(0, split).map(p => p.value);
  const recent = series.slice(split).map(p => p.value);
  const earlierAvg = mean(earlier);
  const recentAvg = mean(recent);
  const changePct = earlierAvg ? ((recentAvg - earlierAvg) / earlierAvg) * 100 : 0;
  const direction = Math.abs(changePct) < 5 ? 'stable' : changePct > 0 ? 'up' : 'down';
  return { ok: true, series, direction, changePct: round(changePct, 1), recentAvg: round(recentAvg, 1), earlierAvg: round(earlierAvg, 1) };
}
function hisaabBusinessTrendSentence(label, stats) {
  if (!stats.ok) return 'I need more dated history before I can read ' + label.toLowerCase() + ' honestly.';
  if (stats.direction === 'up') return label + ' are going up by about ' + Math.abs(stats.changePct) + '%.';
  if (stats.direction === 'down') return label + ' are going down by about ' + Math.abs(stats.changePct) + '%.';
  return label + ' look mostly stable right now.';
}
function hisaabBusinessAvailableQuestions(sheetSummary) {
  const capabilities = sheetSummary?.capability_map?.capabilities || [];
  const usable = key => capabilities.some(item => item.key === key && ['ready', 'limited'].includes(item.status));
  const questions = [];
  if (usable('sales_trend')) questions.push('Are my orders going up or down?');
  if (usable('repeat_customers')) questions.push('Are customers coming back?');
  if (usable('pricing')) questions.push('What happens if I change my prices?');
  if (usable('delivery_fee')) questions.push('Should I raise my delivery fee?');
  if (usable('promotions')) questions.push('Are my discounts actually working?');
  if (!questions.length && sheetSummary?.orders_found) questions.push('Are my orders going up or down?', 'What can I check with this data?');
  return [...new Set(questions)].slice(0, 3);
}
function hisaabBusinessDetectType(question) {
  const text = String(question || '').trim().toLowerCase();
  const hasHindiScript = /[\u0900-\u097F]/.test(text);
  const businessTerms = /\b(order|orders|sale|sales|revenue|customer|customers|repeat|retain|retention|loyalty|business|shop|store|dukan|dukandar|bikri|vyapar|profit|margin|cost|price|pricing|delivery|fee|discount|promo|offer|cod|cash\s+on\s+delivery|grow|growth|improve|better|badha|badhau|kya\s+karu)\b/i;
  const broadBusiness = /\b(what\s+should\s+i\s+do|what\s+shall\s+i\s+do|how\s+can\s+i\s+improve|how\s+can\s+i\s+grow|next\s+step|what\s+can\s+i\s+check)\b/i;
  const hindiBusiness = /(व्यापार|बिजनेस|दुकान|बिक्री|ग्राहक|ऑर्डर|मुनाफा|छूट|डिलीवरी)/.test(text);
  const outOfScope = /\b(ronaldo|messi|football|cricket|movie|song|poem|joke|weather|bitcoin|stock\s+market|capital\s+of|history|recipe|code|programming|who\s+is|what\s+is)\b/i;
  const hasBusiness = businessTerms.test(text) || broadBusiness.test(text) || (hasHindiScript && hindiBusiness);
  if (!hasBusiness) return 'out_of_scope';
  if (outOfScope.test(text) && !hasBusiness) return 'out_of_scope';

  const asksChange = /\b(what\s+happens|change|raise|increase|decrease|lower|reduce|test|try|should\s+i|if\s+i|if\s+we|impact|effect|run|start)\b/i.test(text);
  const whatIfLever = /\b(price|prices|pricing|delivery|shipping|fee|fees|discount|promo|promotion|offer|cod|cash\s+on\s+delivery)\b/i.test(text);
  if (asksChange && whatIfLever) return 'what_if';
  if (/\b(customer|customers|repeat|returning|retain|retention|loyal|loyalty|come\s+back|coming\s+back|grahak)\b/i.test(text)) return 'customer_retention';
  if (/\b(profit|margin|cost|expense|expenses|cogs|munafa)\b/i.test(text)) return 'profit_missing';
  if (/\b(product|products|item|items|sku|category|categories|product\s+wise)\b/i.test(text)) return 'product_missing';
  if (/\b(order|orders|trend|up|down|going|growing|dropping|drop|increase|decrease|month|months|changed|change)\b/i.test(text)) return 'order_trend';
  if (/\b(sales|revenue|earning|earnings|bill|billing|aov|average\s+order|order\s+value|money|bikri)\b/i.test(text)) return 'sales_trend';
  return 'business_guidance';
}
function hisaabBusinessCard(tone, label, title, body, prompt) {
  return { tone, label, title, body, cta: 'Ask this', prompt };
}
function hisaabBuildOrderTrendAnswer(rows, dataSource, sheetSummary) {
  const stats = hisaabBusinessCompare(rows, 'orders');
  const canRead = hisaabBusinessCanUseField(dataSource, 'orders') && hisaabBusinessCanUseField(dataSource, 'trend') && stats.ok;
  return {
    answer_type: 'order_trend',
    title: canRead ? 'Here is what your orders are doing' : 'I need clearer order history',
    answer: canRead ? hisaabBusinessTrendSentence('Orders', stats) : 'I can see some rows, but not enough reliable dated order history to answer this honestly yet.',
    subtext: canRead ? 'I compared the recent part of your sheet with the earlier part.' : 'Add an order date column and order rows, then Hisaab can read the movement.',
    found_facts: stats.ok ? ['Recent average: ' + hisaabBusinessMetricValue('orders', stats.recentAvg), 'Earlier average: ' + hisaabBusinessMetricValue('orders', stats.earlierAvg), 'Change: ' + (stats.direction === 'stable' ? 'mostly stable' : Math.abs(stats.changePct) + '% ' + stats.direction)] : ['Order trend needs at least two dated periods'],
    limitation: sheetSummary?.caveat_line || '',
    action_cards: [
      hisaabBusinessCard('safe', 'Safest', 'Find the weak period', 'Check which months changed before changing prices or offers.', 'Which months were weaker for my orders?'),
      hisaabBusinessCard('moderate', 'Small test', 'Try one small improvement', 'Pick one small change for a few days, then compare orders before and after.', 'What happens if I change my prices?'),
      hisaabBusinessCard('higher', 'Be careful', 'Avoid a broad discount first', 'A large discount can hide the real reason orders changed.', 'Are my discounts actually working?'),
    ],
    suggested_questions: hisaabBusinessAvailableQuestions(sheetSummary),
    chart_series: stats.series,
  };
}
function hisaabBuildSalesTrendAnswer(rows, dataSource, sheetSummary) {
  const hasValue = hisaabBusinessCanUseField(dataSource, 'avg_order_value');
  const metric = hasValue ? 'revenue' : 'orders';
  const stats = hisaabBusinessCompare(rows, metric);
  return {
    answer_type: 'sales_trend',
    title: hasValue ? 'Here is what your sales are doing' : 'I can read orders, but sales value is missing',
    answer: hasValue ? hisaabBusinessTrendSentence('Sales', stats) : 'I can guide from order movement, but I cannot read true sales value because order value is missing.',
    subtext: hasValue ? 'I estimated sales from orders and order value in your sheet.' : 'Add order value, bill amount, or revenue to make sales answers stronger.',
    found_facts: stats.ok ? ['Recent average: ' + hisaabBusinessMetricValue(metric, stats.recentAvg), 'Earlier average: ' + hisaabBusinessMetricValue(metric, stats.earlierAvg), 'Change: ' + (stats.direction === 'stable' ? 'mostly stable' : Math.abs(stats.changePct) + '% ' + stats.direction)] : ['Sales trend needs dated order value history'],
    limitation: hasValue ? (sheetSummary?.caveat_line || '') : 'Without order value, Hisaab can only use order count as a rough signal.',
    action_cards: [
      hisaabBusinessCard('safe', 'Safest', 'Check order trend first', 'If orders are moving, sales usually need the same first diagnosis.', 'Are my orders going up or down?'),
      hisaabBusinessCard('moderate', 'Small test', 'Test one offer', 'Try one small offer and watch whether orders and value move together.', 'Are my discounts actually working?'),
      hisaabBusinessCard('higher', 'Higher risk', 'Avoid price jumps first', 'A price change without clear sales value can create risk you cannot measure yet.', 'What happens if I change my prices?'),
    ],
    suggested_questions: hisaabBusinessAvailableQuestions(sheetSummary),
    chart_series: stats.series,
  };
}
function hisaabBuildCustomerRetentionAnswer(rows, dataSource, sheetSummary) {
  const hasRepeat = hisaabBusinessCanUseField(dataSource, 'repeat_orders');
  const stats = hasRepeat ? hisaabBusinessCompare(rows, 'repeat_orders') : { ok: false, series: [] };
  return {
    answer_type: 'customer_retention',
    title: 'Here is how to think about customers',
    answer: hasRepeat && stats.ok ? hisaabBusinessTrendSentence('Repeat customer orders', stats) : 'I can guide retention, but I cannot measure repeat customers properly because customer/repeat-order data is missing or weak.',
    subtext: 'For a small shop, retention usually means bringing recent buyers back before spending heavily on new customers.',
    found_facts: hasRepeat && stats.ok ? ['Recent repeat orders: ' + hisaabBusinessMetricValue('orders', stats.recentAvg), 'Earlier repeat orders: ' + hisaabBusinessMetricValue('orders', stats.earlierAvg)] : ['Customer tracking is not reliable enough yet', 'Use this as guidance, not measurement'],
    limitation: hasRepeat ? (sheetSummary?.caveat_line || '') : 'Add customer name, phone, email, or repeat-order ID later to measure this properly.',
    action_cards: [
      hisaabBusinessCard('safe', 'Safest', 'Message recent buyers', 'Start with people who bought recently. A simple reminder is low cost and easy to track.', 'Are customers coming back?'),
      hisaabBusinessCard('moderate', 'Small test', 'Try a repeat-buyer offer', 'Give a small thank-you offer to returning buyers for a few days, then watch orders.', 'Are my discounts actually working?'),
      hisaabBusinessCard('higher', 'Higher effort', 'Start collecting customer IDs', 'Use phone number or name in your sheet so Hisaab can measure repeat customers next time.', 'What data should I add for repeat customers?'),
    ],
    suggested_questions: hisaabBusinessAvailableQuestions(sheetSummary),
    chart_series: stats.series || [],
  };
}
function hisaabBuildBroadGuidanceAnswer(rows, dataSource, sheetSummary) {
  const orderStats = hisaabBusinessCompare(rows, 'orders');
  const hasRepeat = hisaabBusinessCanUseField(dataSource, 'repeat_orders');
  const hasAov = hisaabBusinessCanUseField(dataSource, 'avg_order_value');
  const hasPromo = hisaabBusinessCanUseField(dataSource, 'promo_active');
  const focus = orderStats.ok && orderStats.direction === 'down'
    ? 'First understand why orders are dropping before making a big change.'
    : hasRepeat
      ? 'Start with your existing customers before spending on broad offers.'
      : 'Start with one measurable change: orders, sales, or repeat customers.';
  return {
    answer_type: 'business_guidance',
    title: 'Here is a practical next step',
    answer: focus,
    subtext: 'I am using what your uploaded data can support, and I will not guess beyond missing columns.',
    found_facts: [orderStats.ok ? 'Orders: ' + (orderStats.direction === 'stable' ? 'mostly stable' : orderStats.direction) : 'Order trend: needs more history', hasAov ? 'Order value: available' : 'Order value: missing', hasRepeat ? 'Customer data: available' : 'Customer data: missing'],
    limitation: sheetSummary?.caveat_line || (!hasRepeat ? 'Retention answers will be directional until customer data is added.' : ''),
    action_cards: [
      hisaabBusinessCard('safe', 'Safest', 'Understand the trend first', 'Before changing anything, confirm whether orders are rising, falling, or stable.', 'Are my orders going up or down?'),
      hisaabBusinessCard('moderate', 'Small test', hasRepeat ? 'Bring recent customers back' : 'Try one small offer', hasRepeat ? 'Target recent buyers before running a broad discount.' : 'Run a small offer for a few days and track orders.', hasPromo ? 'Are my discounts actually working?' : 'What changed in my sales?'),
      hisaabBusinessCard('higher', 'Higher risk', 'Avoid changing everything', 'A big discount or price change can hide the real issue if you cannot track it.', 'What happens if I change my prices?'),
    ],
    suggested_questions: hisaabBusinessAvailableQuestions(sheetSummary),
    chart_series: orderStats.series,
  };
}
function hisaabBuildMissingDataAnswer(type, sheetSummary) {
  const profit = type === 'profit_missing';
  return {
    answer_type: type,
    title: profit ? 'I need cost data to answer profit' : 'I need product data to answer this',
    answer: profit ? 'I can read sales movement, but I cannot calculate profit honestly without cost, margin, or expense data.' : 'I can read overall sales and orders, but I cannot compare products without product, item, SKU, or category data.',
    subtext: 'I can still guide you using the reliable parts of your sheet.',
    found_facts: hisaabBusinessAvailableQuestions(sheetSummary).length ? ['Some sales questions are still answerable'] : ['The current sheet is limited'],
    limitation: profit ? 'Add cost price, expenses, margin, or profit columns to make this accurate.' : 'Add product name, SKU, item, or category columns to make this accurate.',
    action_cards: [
      hisaabBusinessCard('safe', 'Use current data', 'Check order trend', 'This uses the data already available in your sheet.', 'Are my orders going up or down?'),
      hisaabBusinessCard('moderate', 'Improve data', profit ? 'Add cost or margin' : 'Add product/category', 'One extra column will unlock a much more accurate answer next time.', profit ? 'What data should I add to calculate profit?' : 'What data should I add to compare products?'),
    ],
    suggested_questions: hisaabBusinessAvailableQuestions(sheetSummary),
    chart_series: [],
  };
}
function hisaabRouteBusinessQuestion(question, rows, dataSource, sheetSummary) {
  const type = hisaabBusinessDetectType(question);
  if (type === 'what_if') return { status: 'what_if' };
  if (type === 'out_of_scope') {
    return {
      status: 'guidance',
      guidance_message: 'Hisaab only answers questions about your connected business data — orders, sales, prices, delivery fees, discounts, customers, profit, or products.',
      suggested_questions: hisaabBusinessAvailableQuestions(sheetSummary),
      guidance_type: 'out_of_scope',
    };
  }
  if (!rows || rows.length === 0) return { status: 'business_result', answer: hisaabBuildMissingDataAnswer('data_needed', sheetSummary) };
  if (type === 'order_trend') return { status: 'business_result', answer: hisaabBuildOrderTrendAnswer(rows, dataSource, sheetSummary) };
  if (type === 'sales_trend') return { status: 'business_result', answer: hisaabBuildSalesTrendAnswer(rows, dataSource, sheetSummary) };
  if (type === 'customer_retention') return { status: 'business_result', answer: hisaabBuildCustomerRetentionAnswer(rows, dataSource, sheetSummary) };
  if (type === 'profit_missing' || type === 'product_missing') return { status: 'business_result', answer: hisaabBuildMissingDataAnswer(type, sheetSummary) };
  return { status: 'business_result', answer: hisaabBuildBroadGuidanceAnswer(rows, dataSource, sheetSummary) };
}
async function hisaabSendBusinessGuidance(res, { sessionId, uploadId, question, route, dataSource, sheetSummary }) {
  const answer = route.guidance_message || 'Hisaab can help with questions about your connected business data.';
  const questionPersistence = await firestoreService.saveQuestion({ sessionId, uploadId: uploadId || null, question: question.trim(), answer });
  await firestoreService.saveEvent({
    type: 'ask',
    sessionId,
    uploadId: uploadId || null,
    questionId: questionPersistence.id,
    metadata: { status: 'guidance', guidanceType: route.guidance_type || 'business_scope' },
  });
  return res.json({
    session_id: sessionId,
    status: 'guidance',
    guidance_message: answer,
    suggested_questions: (route.suggested_questions || []).slice(0, 3),
    detected_language: detectFallbackLanguage(question),
    data_source: dataSource,
    sheet_summary: sheetSummary,
    persistence: { question: questionPersistence },
  });
}
async function hisaabSendBusinessResult(res, { sessionId, uploadId, question, route, rows, dataSource, sheetSummary, summary }) {
  const answerBundle = route.answer || {};
  const answer = answerBundle.answer || answerBundle.title || 'Here is what Hisaab found.';
  const questionPersistence = await firestoreService.saveQuestion({ sessionId, uploadId: uploadId || null, question: question.trim(), answer });
  await firestoreService.saveEvent({
    type: 'ask',
    sessionId,
    uploadId: uploadId || null,
    questionId: questionPersistence.id,
    metadata: { status: 'business_result', answerType: answerBundle.answer_type },
  });
  const stats = hisaabBusinessCompare(rows, answerBundle.answer_type === 'sales_trend' && hisaabBusinessCanUseField(dataSource, 'avg_order_value') ? 'revenue' : 'orders');
  return res.json({
    session_id: sessionId,
    status: 'business_result',
    question: question.trim(),
    business_result: answerBundle,
    computed: {
      outcome_metric: answerBundle.answer_type || 'business_guidance',
      outcome_value: stats.ok ? stats.changePct : null,
      range_low: null,
      range_high: null,
      confidence: stats.ok ? 0.55 : 0.28,
      monthly_revenue_impact: null,
      worst_case_revenue_impact: null,
      trend_pct: stats.ok ? stats.changePct : null,
      method: 'business_question_workflow',
      sample_size: rows.length,
      low_signal_warning: answerBundle.limitation || null,
    },
    generated: {
      recommendation: answerBundle.answer || '',
      why: answerBundle.subtext || '',
      outcome_metric_label: String(answerBundle.answer_type || '').replace(/_/g, ' '),
      detected_language: detectFallbackLanguage(question),
      source: 'business_question_workflow',
    },
    summary,
    data_source: dataSource,
    sheet_summary: sheetSummary,
    analytics_capabilities: sheetSummary?.capability_map || null,
    chart_series: (answerBundle.chart_series || []).map(point => ({ month: point.month, value: point.value, orders: point.value })),
    persistence: { question: questionPersistence },
  });
}
`;

const CLIENT_HELPER = String.raw`
  // business-result-renderer-v2: separate SMB-friendly result page for trends, retention, broad guidance, and missing-data answers.
  function ensureBusinessResultBlock() {
    let block = document.getElementById('business-result-block');
    if (block) return block;
    block = document.createElement('section');
    block.id = 'business-result-block';
    block.className = 'business-result-block';
    const scenariosBlock = document.getElementById('scenarios-block');
    const results = document.getElementById('results');
    if (scenariosBlock && scenariosBlock.parentElement) scenariosBlock.parentElement.insertBefore(block, scenariosBlock);
    else if (results) results.appendChild(block);
    return block;
  }

  function renderBusinessResult(data, elapsed = 0) {
    const demoOverlay = document.getElementById('demo-lesson');
    if (demoOverlay && !demoOverlay.hidden) closeDemoLesson();
    const dataConnectOverlay = document.getElementById('data-connect-page');
    if (dataConnectOverlay && !dataConnectOverlay.hidden) closeDataConnectPage();

    const bundle = data.business_result || {};
    const detected = String(data.generated?.detected_language || data.detected_language || '').toLowerCase();
    setUILang(detected === 'hi' ? 'hi' : 'en');
    if (data.session_id) localStorage.setItem('hisaabSessionId', data.session_id);
    lastSimulationPersistence = data.persistence || null;
    lastQuestion = data.question || lastQuestion;
    if (data.sheet_summary) {
      lastSheetSummary = data.sheet_summary;
      renderSheetSummary(data.sheet_summary);
    }
    renderConnectedDataState(data.data_source);
    setDataSource(data.data_source);

    const block = ensureBusinessResultBlock();
    const facts = Array.isArray(bundle.found_facts) ? bundle.found_facts.filter(Boolean).slice(0, 4) : [];
    const cards = Array.isArray(bundle.action_cards) ? bundle.action_cards.filter(Boolean).slice(0, 3) : [];
    const suggestions = Array.isArray(bundle.suggested_questions) ? bundle.suggested_questions.filter(Boolean).slice(0, 3) : [];
    block.innerHTML = `
      <div class="br-question">
        <div class="br-eyebrow">You asked</div>
        <h2>${escapeHtml(data.question || lastQuestion || '')}</h2>
      </div>
      <div class="br-card br-answer">
        <div class="br-eyebrow">Hisaab says</div>
        <h3>${escapeHtml(bundle.title || 'Here is the clearest read')}</h3>
        <p class="br-main">${escapeHtml(bundle.answer || '')}</p>
        ${bundle.subtext ? `<p class="br-sub">${escapeHtml(bundle.subtext)}</p>` : ''}
        ${facts.length ? `<div class="br-facts">${facts.map(fact => `<span>${escapeHtml(fact)}</span>`).join('')}</div>` : ''}
        ${bundle.limitation ? `<div class="br-limitation">${escapeHtml(bundle.limitation)}</div>` : ''}
      </div>
      ${cards.length ? `<div class="br-actions">${cards.map(card => `
        <article class="br-action ${escapeHtml(card.tone || '')}">
          <div class="br-action-label">${escapeHtml(card.label || '')}</div>
          <h4>${escapeHtml(card.title || '')}</h4>
          <p>${escapeHtml(card.body || '')}</p>
          ${card.prompt ? `<button class="br-action-cta" type="button" data-prompt="${escapeHtml(card.prompt)}">${escapeHtml(card.cta || 'Ask this')}</button>` : ''}
        </article>
      `).join('')}</div>` : ''}
      ${suggestions.length ? `<div class="br-next"><div class="br-eyebrow">Good next questions</div>${suggestions.map(q => `<button class="chip" type="button" data-prompt="${escapeHtml(q)}">${escapeHtml(q)}</button>`).join('')}</div>` : ''}
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

    const resultTop = document.querySelector('#results .result-top');
    if (resultTop) resultTop.hidden = true;
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

    activeResultId = crypto.randomUUID ? crypto.randomUUID() : `result-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    currentResult = makeResultSnapshot(data, elapsed, {
      id: activeResultId,
      question: data.question || lastQuestion,
      refinement: '',
      value: finiteNumber(data.computed?.outcome_value),
      isWeak: true,
    });
    stage.classList.add('has-result');
    resultsSection.hidden = false;
    resultsSection.classList.add('show');
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    updateAwayFromLandingState();
  }
`;

const BUSINESS_CSS = String.raw`

/* business-result-ui-v2: calm SMB analyst result layouts for non-what-if answers */
.business-result-block{max-width:820px;margin:0 auto 28px;display:grid;gap:18px;}
.br-question{padding:0 2px;}
.br-eyebrow{font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#8190aa;font-weight:850;margin-bottom:8px;}
.br-question h2{margin:0;color:var(--ink);font-size:26px;line-height:1.15;letter-spacing:-.03em;}
.br-card,.br-action{border:1px solid rgba(133,148,179,.30);border-radius:24px;background:rgba(255,255,255,.62);box-shadow:none;}
.br-answer{padding:30px;}
.br-answer h3{margin:0;color:var(--ink);font-size:32px;line-height:1.1;letter-spacing:-.04em;}
.br-main{margin:14px 0 0;color:#2f3d58;font-size:19px;line-height:1.55;}
.br-sub{margin:10px 0 0;color:#5b6780;font-size:15px;line-height:1.55;}
.br-facts{display:flex;flex-wrap:wrap;gap:8px;margin-top:18px;}
.br-facts span{border:1px solid rgba(133,148,179,.30);border-radius:999px;padding:8px 12px;background:#fff;color:#34425f;font-size:13px;font-weight:750;}
.br-limitation{margin-top:18px;border-radius:16px;background:#fff8e8;border:1px solid #f3d79d;color:#8a5b00;padding:12px 14px;font-size:14px;line-height:1.45;}
.br-actions{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px;}
.br-action{padding:20px;min-height:220px;display:flex;flex-direction:column;align-items:flex-start;}
.br-action.safe{border-color:rgba(49,109,255,.36);} .br-action.moderate{border-color:rgba(133,148,179,.36);} .br-action.higher{border-color:rgba(239,177,64,.52);}
.br-action-label{font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:#8190aa;font-weight:900;margin-bottom:12px;}
.br-action h4{margin:0;color:var(--ink);font-size:18px;line-height:1.25;letter-spacing:-.02em;}
.br-action p{margin:10px 0 18px;color:#4b5a78;font-size:14px;line-height:1.5;}
.br-action-cta{margin-top:auto;border:1px solid rgba(49,109,255,.35);border-radius:999px;background:#fff;color:var(--accent);font-weight:850;padding:10px 16px;min-width:112px;cursor:pointer;}
.br-action-cta:hover{border-color:var(--accent);}
.br-next{border-top:1px solid rgba(133,148,179,.18);padding-top:16px;display:flex;flex-wrap:wrap;gap:8px;align-items:center;}
.br-next .br-eyebrow{width:100%;margin-bottom:0;}
@media (max-width:840px){.business-result-block{max-width:100%;}.br-actions{grid-template-columns:1fr;}.br-answer{padding:24px;}.br-answer h3{font-size:27px;}.br-action{min-height:auto;}}
`;

function patchServer() {
  if (!fs.existsSync(serverPath)) return;
  let source = read(serverPath);
  const before = source;

  if (!source.includes('hisaab-business-workflow-v2')) {
    const marker = "app.post('/api/simulate', async (req, res) => {";
    if (!source.includes(marker)) throw new Error('simulate route marker not found');
    source = source.replace(marker, `${SERVER_HELPER}\n${marker}`);
  }

  if (!source.includes('business-workflow-router-entry-v2')) {
    const marker = "  const { data, dataSource, sheetSummary } = await getSimulationData(sheetUrl, manualInputs, csvText, bootstrapOwner);\n\n  if ((sheetUrl && String(sheetUrl).trim()) || (csvText && String(csvText).trim())) {";
    const replacement = `  const { data, dataSource, sheetSummary } = await getSimulationData(sheetUrl, manualInputs, csvText, bootstrapOwner);

  // business-workflow-router-entry-v2: non-what-if SMB questions use the analyst router before old what-if missing-field logic.
  const routedBusinessQuestion = hisaabRouteBusinessQuestion(question.trim(), data, dataSource, sheetSummary);
  if (routedBusinessQuestion.status === 'guidance') {
    return hisaabSendBusinessGuidance(res, { sessionId, uploadId, question, route: routedBusinessQuestion, dataSource, sheetSummary });
  }
  if (routedBusinessQuestion.status === 'business_result') {
    const summaryForBusinessAnswer = summarizeData(data);
    return hisaabSendBusinessResult(res, { sessionId, uploadId, question, route: routedBusinessQuestion, rows: data, dataSource, sheetSummary, summary: summaryForBusinessAnswer });
  }

  if ((sheetUrl && String(sheetUrl).trim()) || (csvText && String(csvText).trim())) {`;
    if (!source.includes(marker)) throw new Error('business workflow insertion marker not found');
    source = source.replace(marker, replacement);
  }

  writeIfChanged(serverPath, before, source, 'patched server.js');
}

function patchClient() {
  if (!fs.existsSync(scriptPath)) return;
  let source = read(scriptPath);
  const before = source;

  if (!source.includes('business-result-renderer-v2')) {
    const marker = '  function renderResults(data, elapsed, options = {}) {';
    if (!source.includes(marker)) throw new Error('renderResults marker not found');
    source = source.replace(marker, `${CLIENT_HELPER}\n${marker}`);
  }

  if (!source.includes('business-result-status-v2')) {
    const marker = "      if (body.status === 'guidance') {";
    const replacement = `      if (body.status === 'business_result') {
        if (body.session_id) localStorage.setItem('hisaabSessionId', body.session_id);
        renderBusinessResult(body, Date.now() - startTime);
        return;
      }
      // business-result-status-v2
      if (body.status === 'guidance') {`;
    if (!source.includes(marker)) throw new Error('guidance marker not found');
    source = source.replace(marker, replacement);
  }

  if (!source.includes('business-result-hide-v2')) {
    const marker = "    if (scenariosBlock) scenariosBlock.hidden = true;";
    const replacement = `    if (scenariosBlock) scenariosBlock.hidden = true;
    const businessResultBlock = document.getElementById('business-result-block');
    if (businessResultBlock) businessResultBlock.hidden = true;
    const resultTopForReset = document.querySelector('#results .result-top');
    if (resultTopForReset) resultTopForReset.hidden = false;
    const evidenceForReset = document.getElementById('evidence-block');
    if (evidenceForReset) evidenceForReset.hidden = false;
    const confidenceForReset = document.getElementById('confidence-block');
    if (confidenceForReset) confidenceForReset.hidden = false;
    const explainForReset = document.querySelector('#results .explain');
    if (explainForReset) explainForReset.hidden = false;
    // business-result-hide-v2`;
    if (!source.includes(marker)) throw new Error('hideResults marker not found');
    source = source.replace(marker, replacement);
  }

  if (!source.includes('business-result-normal-reset-v2')) {
    const marker = '    const computed = data.computed || data;';
    const replacement = `    const previousBusinessResult = document.getElementById('business-result-block');
    if (previousBusinessResult) previousBusinessResult.hidden = true;
    const resultTopForNormal = document.querySelector('#results .result-top');
    if (resultTopForNormal) resultTopForNormal.hidden = false;
    const computed = data.computed || data;
    // business-result-normal-reset-v2`;
    if (!source.includes(marker)) throw new Error('renderResults reset marker not found');
    source = source.replace(marker, replacement);
  }

  if (!source.includes('business-result-stable-cta-v2')) {
    const marker = `    text.hidden = isLoading;
    loader.hidden = !isLoading;
    const btn = isRefine ? refineSend : simulateBtn;`;
    const replacement = `    const btn = isRefine ? refineSend : simulateBtn;
    if (!isRefine && btn) {
      text.hidden = false;
      text.textContent = isLoading ? 'Thinking…' : 'Ask Hisaab';
      loader.hidden = !isLoading;
    } else {
      text.hidden = isLoading;
      loader.hidden = !isLoading;
    }
    // business-result-stable-cta-v2`;
    if (!source.includes(marker)) throw new Error('setLoading marker not found');
    source = source.replace(marker, replacement);
  }

  writeIfChanged(scriptPath, before, source, 'patched public/script.js');
}

function patchCss() {
  if (!fs.existsSync(cssPath)) return;
  const before = read(cssPath);
  let source = before;
  if (!source.includes('business-result-ui-v2')) source += BUSINESS_CSS;
  writeIfChanged(cssPath, before, source, 'patched public/style.css');
}

patchServer();
patchClient();
patchCss();

for (const file of [serverPath, scriptPath]) {
  try {
    childProcess.execFileSync(process.execPath, ['--check', file], { stdio: 'pipe' });
  } catch (err) {
    const detail = err.stderr?.toString() || err.message;
    throw new Error(`Syntax check failed for ${path.basename(file)}: ${detail}`);
  }
}
