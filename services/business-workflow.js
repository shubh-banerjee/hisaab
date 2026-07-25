const { GoogleGenAI } = require('@google/genai');

const MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash-lite';
const USABLE = new Set(['derived', 'derived_manual', 'derived_low_confidence', 'fallback']);

function hasField(source, field) {
  return USABLE.has(source?.field_sources?.[field]?.status);
}

function mean(values) {
  const clean = values.map(Number).filter(Number.isFinite);
  return clean.length ? clean.reduce((sum, value) => sum + value, 0) / clean.length : 0;
}

function round(value, digits = 1) {
  const factor = 10 ** digits;
  return Math.round(Number(value) * factor) / factor;
}

function languageOf(question) {
  const text = String(question || '').toLowerCase();
  if (/[\u0900-\u097F]/.test(text)) return 'hi';
  if (/\b(main|mai|mein|mujhe|mera|meri|mere|kaise|kya|karu|badha|badhau|dukaan|dhandha|vyapar|bikri|grahak|daam|kimat|munafa|kharcha)\b/i.test(text)) return 'hinglish';
  return 'en';
}

function classifyQuestion(question) {
  const text = String(question || '').trim().toLowerCase();
  const business = /\b(order|orders|sale|sales|revenue|customer|customers|repeat|retain|retention|loyalty|business|shop|store|dukan|bikri|vyapar|profit|profits|margin|cost|costs|expense|price|prices|pricing|delivery|shipping|fee|fees|discount|promo|promotion|offer|cod|grow|growth|improve|product|products|item|items|sku|category|month|months|trend|munafa|grahak)\b/i.test(text)
    || (/[\u0900-\u097F]/.test(text) && /(व्यापार|बिजनेस|दुकान|बिक्री|ग्राहक|ऑर्डर|मुनाफा|छूट|डिलीवरी|कीमत|खर्च)/.test(text))
    || /\b(what should i do|what shall i do|how can i grow|how can i improve|increase profits?|next step)\b/i.test(text);
  if (!business) return 'out_of_scope';
  const change = /\b(what happens|change|raise|increase|decrease|lower|reduce|test|try|should i|if i|impact|effect|working|worth|run)\b/i.test(text);
  const lever = /\b(price|prices|pricing|delivery|shipping|fee|fees|discount|promo|promotion|offer|cod)\b/i.test(text);
  if (change && lever) return 'what_if';
  if (/\b(customer|customers|repeat|returning|retain|retention|loyal|loyalty|come back|coming back|grahak)\b/i.test(text)) return 'customer_retention';
  if (/\b(profit|profits|margin|cost|costs|expense|expenses|cogs|munafa)\b/i.test(text)) return 'profit_guidance';
  if (/\b(product|products|item|items|sku|category|categories|product wise)\b/i.test(text)) return 'product_guidance';
  if (/\b(order|orders|trend|up|down|growing|dropping|drop|month|months|weak|weaker)\b/i.test(text)) return 'order_trend';
  if (/\b(sales|revenue|earning|earnings|bill|billing|aov|average order|order value|money|bikri)\b/i.test(text)) return 'sales_trend';
  return 'business_guidance';
}

function leverFor(question) {
  const text = String(question || '').toLowerCase();
  if (/discount|promo|promotion|offer/.test(text)) return 'promo_active';
  if (/price|prices|pricing|product|aov|average order/.test(text)) return 'avg_order_value';
  if (/delivery|shipping|\bfee\b/.test(text)) return 'delivery_fee';
  if (/\bcod\b|cash on delivery/.test(text)) return 'cash_on_delivery';
  return null;
}

function series(rows, metric) {
  return (rows || []).map((row) => {
    if (metric === 'revenue') {
      const orders = Number(row.orders);
      const value = Number(row.avg_order_value);
      return { month: row.month, value: Number.isFinite(orders) && Number.isFinite(value) ? orders * value : NaN };
    }
    return { month: row.month, value: Number(row[metric]) };
  }).filter((point) => point.month && Number.isFinite(point.value));
}

function compare(rows, metric) {
  const points = series(rows, metric);
  if (points.length < 2) return { ok: false, series: points, direction: 'unknown' };
  const split = Math.max(1, Math.floor(points.length / 2));
  const earlier = mean(points.slice(0, split).map((point) => point.value));
  const recent = mean(points.slice(split).map((point) => point.value));
  const change = earlier ? ((recent - earlier) / earlier) * 100 : 0;
  return {
    ok: true,
    series: points,
    earlier: round(earlier),
    recent: round(recent),
    change: round(change),
    direction: Math.abs(change) < 5 ? 'stable' : change > 0 ? 'up' : 'down',
  };
}

function capability(summary, key) {
  return (summary?.capability_map?.capabilities || []).some((item) => item.key === key && ['ready', 'limited'].includes(item.status));
}

function rec(id, tone, label, title, body) {
  return { id, tone, label, title, body };
}

function nextQuestion(id, label, prompt) {
  return { id, label, prompt };
}

function uniqueQuestions(items, current) {
  const seen = new Set([String(current || '').trim().toLowerCase()]);
  return items.filter((item) => {
    const key = String(item.prompt || '').trim().toLowerCase();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  }).slice(0, 3);
}

function followUps(type, summary, current) {
  const items = [];
  if (type === 'order_trend') {
    items.push(nextQuestion('weak-months', 'Find weak months', 'Which months were weakest for my orders?'));
    if (capability(summary, 'repeat_customers')) items.push(nextQuestion('repeat', 'Check repeat customers', 'Are my repeat customers going up or down?'));
    if (capability(summary, 'pricing')) items.push(nextQuestion('price', 'Explore pricing', 'What happens if I change my prices?'));
    if (capability(summary, 'delivery_fee')) items.push(nextQuestion('delivery', 'Check delivery fee', 'Is my delivery fee affecting orders?'));
  } else if (type === 'sales_trend') {
    items.push(nextQuestion('orders', 'Compare orders', 'Are my orders going up or down?'));
    if (capability(summary, 'pricing')) items.push(nextQuestion('price', 'Explore pricing', 'What happens if I change my prices?'));
    if (capability(summary, 'repeat_customers')) items.push(nextQuestion('retain', 'Explore retention', 'How can I retain more customers?'));
  } else if (type === 'customer_retention') {
    items.push(nextQuestion('repeat', 'Check repeat orders', 'Are my repeat customer orders improving?'));
    if (capability(summary, 'promotions')) items.push(nextQuestion('offers', 'Check an offer', 'Are my discounts helping repeat orders?'));
    items.push(nextQuestion('sales', 'Check sales movement', 'What changed in my sales?'));
  } else if (type === 'profit_guidance') {
    items.push(nextQuestion('sales', 'Check sales first', 'What changed in my sales?'));
    items.push(nextQuestion('orders', 'Check order movement', 'Are my orders going up or down?'));
    if (capability(summary, 'pricing')) items.push(nextQuestion('price', 'Explore pricing', 'What happens if I change my prices?'));
  } else {
    items.push(nextQuestion('orders', 'Understand orders', 'Are my orders going up or down?'));
    if (capability(summary, 'repeat_customers')) items.push(nextQuestion('retain', 'Understand customers', 'How can I retain more customers?'));
    if (capability(summary, 'pricing')) items.push(nextQuestion('price', 'Explore pricing', 'What happens if I change my prices?'));
    if (capability(summary, 'promotions')) items.push(nextQuestion('offers', 'Explore offers', 'Are my discounts actually working?'));
  }
  return uniqueQuestions(items, current);
}

function numberLabel(metric, value) {
  if (!Number.isFinite(Number(value))) return 'Not enough data';
  if (metric === 'revenue') return '₹' + Math.round(Number(value)).toLocaleString('en-IN');
  return Math.round(Number(value)).toLocaleString('en-IN') + ' orders';
}

function trendBundle(questionText, rows, source, summary, metric) {
  const stats = compare(rows, metric);
  const sales = metric === 'revenue';
  const type = sales ? 'sales_trend' : 'order_trend';
  const supported = stats.ok && hasField(source, 'orders') && hasField(source, 'trend') && (!sales || hasField(source, 'avg_order_value'));
  const directionText = !stats.ok
    ? 'I need more dated history before I can read this honestly.'
    : stats.direction === 'stable'
      ? (sales ? 'Sales look mostly stable right now.' : 'Orders look mostly stable right now.')
      : (sales ? 'Sales' : 'Orders') + ' are going ' + stats.direction + ' by about ' + Math.abs(stats.change) + '%.';
  const recommendations = stats.direction === 'down'
    ? [
        rec('inspect', 'safe', 'Start here', 'Find where the drop began', 'Check the weakest period before changing prices or offers.'),
        rec('small-test', 'moderate', 'Small test', 'Change one thing for a few days', 'Use a small test so you can see what actually helped.'),
        rec('avoid-big-change', 'higher', 'Avoid', 'Do not change everything together', 'Large changes make it harder to understand the real cause.'),
      ]
    : [
        rec('protect', 'safe', 'Safest', 'Protect what is already working', 'Keep the current approach while watching the next period.'),
        rec('repeat', 'moderate', 'Small test', 'Repeat one successful pattern', 'Try the same approach on one similar day or customer group.'),
        rec('scale-carefully', 'higher', 'Be careful', 'Scale only after another good period', 'One strong period is useful, but not enough for a large rollout.'),
      ];
  return {
    answer_type: type,
    title: supported ? (sales ? 'Here is what your sales are doing' : 'Here is what your orders are doing') : 'I need clearer dated history',
    answer: supported ? directionText : (sales ? 'I can discuss order movement, but true sales value needs a reliable order-value column.' : 'I found rows, but not enough reliable dated orders to call a trend.'),
    subtext: supported ? 'I compared the recent part of your data with the earlier part.' : 'Update the missing field and Hisaab can give a stronger read.',
    found_facts: stats.ok
      ? ['Recent: ' + numberLabel(metric, stats.recent), 'Earlier: ' + numberLabel(metric, stats.earlier), 'Movement: ' + (stats.direction === 'stable' ? 'mostly stable' : Math.abs(stats.change) + '% ' + stats.direction)]
      : ['Needs at least two dated periods'],
    limitation: summary?.caveat_line || '',
    recommendations,
    suggested_questions: followUps(type, summary, questionText),
    chart_series: stats.series,
  };
}

function retentionBundle(questionText, rows, source, summary) {
  const available = hasField(source, 'repeat_orders');
  const stats = available ? compare(rows, 'repeat_orders') : { ok: false, series: [] };
  const recommendations = available && stats.direction === 'down'
    ? [
        rec('recent-buyers', 'safe', 'Safest', 'Reach recent buyers first', 'Send a simple reminder or thank-you message to recent customers.'),
        rec('small-offer', 'moderate', 'Small test', 'Try a limited repeat-buyer offer', 'Run it for a few days and compare repeat orders.'),
        rec('loyalty', 'higher', 'Higher effort', 'Start simple loyalty tracking', 'Track customer ID or phone number consistently before a bigger programme.'),
      ]
    : [
        rec('thank-you', 'safe', 'Safest', 'Thank recent customers', 'A simple follow-up is low cost and easy to understand.'),
        rec('repeat-offer', 'moderate', 'Small test', 'Test one repeat-customer offer', 'Keep the offer small and watch whether customers return.'),
        rec('track', 'higher', 'Build the signal', 'Track customer identity consistently', 'Customer IDs make future retention advice much stronger.'),
      ];
  return {
    answer_type: 'customer_retention',
    title: available && stats.ok ? 'Here is what repeat customers are doing' : 'Here is a practical retention plan',
    answer: available && stats.ok
      ? (stats.direction === 'stable' ? 'Repeat customer orders look mostly stable.' : 'Repeat customer orders are going ' + stats.direction + ' by about ' + Math.abs(stats.change) + '%.')
      : 'I can guide customer retention, but I cannot measure it precisely without reliable customer identifiers.',
    subtext: 'For a small shop, start with recent buyers before spending on a broad campaign.',
    found_facts: available && stats.ok
      ? ['Recent repeat orders: ' + numberLabel('orders', stats.recent), 'Earlier repeat orders: ' + numberLabel('orders', stats.earlier)]
      : ['Repeat-customer measurement is limited', 'Guidance is directional, not a measured result'],
    limitation: available ? (summary?.caveat_line || '') : 'Add customer name, phone, email, or customer ID to measure retention properly.',
    recommendations,
    suggested_questions: followUps('customer_retention', summary, questionText),
    chart_series: stats.series || [],
  };
}

function guidanceBundle(questionText, rows, source, summary) {
  const stats = compare(rows, 'orders');
  const repeat = hasField(source, 'repeat_orders');
  const orderValue = hasField(source, 'avg_order_value');
  const focus = stats.ok && stats.direction === 'down'
    ? 'Start by understanding why orders are falling before making a large change.'
    : repeat
      ? 'Start with existing customers before spending on a broad offer.'
      : 'Start with one measurable area: orders, sales, or repeat customers.';
  return {
    answer_type: 'business_guidance',
    title: 'Here is the clearest next step',
    answer: focus,
    subtext: 'I am using only what your uploaded data can support.',
    found_facts: [stats.ok ? 'Orders: ' + stats.direction : 'Order trend: needs more history', orderValue ? 'Order value: available' : 'Order value: missing', repeat ? 'Customer data: available' : 'Customer data: missing'],
    limitation: summary?.caveat_line || (!repeat ? 'Customer advice remains directional until customer identifiers are added.' : ''),
    recommendations: [
      rec('understand', 'safe', 'Safest', 'Understand the current trend', 'Confirm what is changing before acting.'),
      rec('test', 'moderate', 'Small test', repeat ? 'Bring recent customers back' : 'Try one small offer', repeat ? 'Target recent buyers before a broad discount.' : 'Run a short offer and track orders.'),
      rec('avoid', 'higher', 'Avoid', 'Do not change everything together', 'One change at a time gives you a clearer answer.'),
    ],
    suggested_questions: followUps('business_guidance', summary, questionText),
    chart_series: stats.series,
  };
}

function profitBundle(questionText, rows, source, summary) {
  const stats = compare(rows, hasField(source, 'avg_order_value') ? 'revenue' : 'orders');
  return {
    answer_type: 'profit_guidance',
    title: 'Sales are not the same as profit',
    answer: 'I can read sales and order movement, but profit needs reliable cost, margin, or expense data.',
    subtext: 'Until costs are added, use this as improvement guidance rather than a profit calculation.',
    found_facts: [hasField(source, 'avg_order_value') ? 'Sales value: available' : 'Sales value: limited', 'Cost or margin: not found'],
    limitation: 'Add cost price, expenses, margin, or profit columns to calculate profit honestly.',
    recommendations: [
      rec('costs', 'safe', 'Start here', 'Track one cost field', 'Begin with cost per order or total monthly expenses.'),
      rec('sales', 'moderate', 'Use current data', 'Improve sales without claiming profit', 'Check orders and sales while keeping the limitation visible.'),
      rec('avoid', 'higher', 'Avoid', 'Do not call revenue profit', 'Revenue can rise while profit falls if costs rise faster.'),
    ],
    suggested_questions: followUps('profit_guidance', summary, questionText),
    chart_series: stats.series,
  };
}

function productBundle(questionText, rows, summary) {
  const stats = compare(rows, 'orders');
  return {
    answer_type: 'product_guidance',
    title: 'I need product-level data for this',
    answer: 'I can read overall orders and sales, but I cannot rank products without a product, item, SKU, or category column.',
    subtext: 'Add one consistent product label per order to unlock product comparisons.',
    found_facts: ['Overall orders: available', 'Product breakdown: not found'],
    limitation: 'Any product recommendation without product-level rows would be a guess.',
    recommendations: [
      rec('product-field', 'safe', 'Best next step', 'Add a product or category field', 'Use the same product label consistently.'),
      rec('overall', 'moderate', 'Use current data', 'Check overall sales movement', 'This still helps while product data is being improved.'),
      rec('avoid', 'higher', 'Avoid', 'Do not name a best product yet', 'Total sales cannot prove which product caused the result.'),
    ],
    suggested_questions: followUps('product_guidance', summary, questionText),
    chart_series: stats.series,
  };
}

function dataNeeded(questionText, summary, message, field) {
  return {
    answer_type: 'data_needed',
    title: 'I need one more piece of data',
    answer: message,
    subtext: 'I can still guide you with what is available, but I will not invent a precise result.',
    found_facts: [field + ': missing or unreliable'],
    limitation: 'This keeps Hisaab focused on trustworthy business guidance.',
    recommendations: [
      rec('update', 'safe', 'Best next step', 'Update the missing field', 'A clean field is more useful than a forced answer.'),
      rec('available', 'moderate', 'Use current data', 'Ask about a capability already found', 'Hisaab can answer the supported parts now.'),
      rec('avoid', 'higher', 'Avoid', 'Do not make a large change yet', 'Use a small test or wait for a clearer signal.'),
    ],
    suggested_questions: followUps('business_guidance', summary, questionText),
    chart_series: [],
  };
}

function missingWhatIf(questionText, source, summary) {
  const lever = leverFor(questionText);
  if (!hasField(source, 'orders') || !hasField(source, 'trend')) return dataNeeded(questionText, summary, 'I need dated order history before I can test a business change.', 'Order history');
  if (lever === 'avg_order_value' && !hasField(source, 'avg_order_value')) return dataNeeded(questionText, summary, 'I need order value or price history before I can test a price change.', 'Order value');
  if (lever === 'delivery_fee' && !hasField(source, 'delivery_fee')) return dataNeeded(questionText, summary, 'I need delivery-fee history before I can test a fee change.', 'Delivery fee');
  if (lever === 'promo_active' && !hasField(source, 'promo_active')) return dataNeeded(questionText, summary, 'I need discount or promotion history before I can measure an offer.', 'Discount history');
  if (lever === 'cash_on_delivery') return dataNeeded(questionText, summary, 'This version does not have reliable cash-on-delivery history to test that change.', 'Cash on delivery');
  return null;
}

function scopeGuidance(questionText, summary) {
  const language = languageOf(questionText);
  let message = 'Hisaab is built for questions about your connected business data — orders, sales, customers, prices, delivery fees, discounts, products, costs, and profit.';
  if (language === 'hi') message = 'Hisaab आपके जुड़े हुए business data के सवालों के लिए है — orders, sales, customers, prices, delivery fee, discounts, products, costs और profit.';
  if (language === 'hinglish') message = 'Hisaab aapke connected business data ke questions ke liye hai — orders, sales, customers, prices, delivery fee, discounts, products, costs aur profit.';
  return {
    status: 'guidance',
    guidance_message: message,
    suggested_questions: followUps('business_guidance', summary, questionText).map((item) => item.prompt),
    detected_language: language,
    guidance_type: 'out_of_scope',
  };
}

function extractJson(text) {
  const value = String(text || '').trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');
  const start = value.indexOf('{');
  const end = value.lastIndexOf('}');
  return start >= 0 && end > start ? value.slice(start, end + 1) : value;
}

async function naturalize(questionText, bundle) {
  const fallback = { ...bundle, detected_language: languageOf(questionText), wording_source: 'deterministic' };
  if (!process.env.GEMINI_API_KEY) return fallback;
  try {
    const safe = {
      question: questionText,
      answer_type: bundle.answer_type,
      title: bundle.title,
      answer: bundle.answer,
      subtext: bundle.subtext,
      facts: bundle.found_facts,
      limitation: bundle.limitation,
      recommendations: bundle.recommendations,
    };
    const prompt = 'Rewrite this already-computed Hisaab answer as a calm human business analyst for a small shop owner. Match English, Hindi in Devanagari, or natural Roman Hinglish. Keep all facts, numbers, limitations, recommendation IDs, and meaning unchanged. Do not invent data. Return JSON only with title, answer, subtext, recommendations (id,label,title,body), detected_language. Input: ' + JSON.stringify(safe);
    const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await client.models.generateContent({
      model: MODEL,
      contents: prompt,
      config: { maxOutputTokens: 1200, responseMimeType: 'application/json', thinkingConfig: { thinkingBudget: 0 } },
    });
    const text = typeof response.text === 'string'
      ? response.text
      : (response.candidates?.[0]?.content?.parts || []).map((part) => part.text || '').join('');
    const parsed = JSON.parse(extractJson(text));
    const byId = new Map((parsed.recommendations || []).map((item) => [item.id, item]));
    return {
      ...bundle,
      title: String(parsed.title || bundle.title),
      answer: String(parsed.answer || bundle.answer),
      subtext: String(parsed.subtext || bundle.subtext),
      recommendations: bundle.recommendations.map((item) => ({ ...item, ...(byId.get(item.id) || {}), id: item.id, tone: item.tone })),
      detected_language: String(parsed.detected_language || languageOf(questionText)),
      wording_source: 'gemini_grounded',
    };
  } catch (error) {
    console.error('[business-workflow] wording fallback:', error?.message || error);
    return fallback;
  }
}

function payload(questionText, bundle, rows, source) {
  const metric = bundle.answer_type === 'sales_trend' && hasField(source, 'avg_order_value') ? 'revenue' : 'orders';
  const stats = compare(rows, metric);
  return {
    status: 'business_result',
    question: String(questionText).trim(),
    business_result: bundle,
    computed: {
      outcome_metric: bundle.answer_type,
      outcome_value: stats.ok ? stats.change : null,
      range_low: null,
      range_high: null,
      confidence: stats.ok ? 0.55 : 0.28,
      trend_pct: stats.ok ? stats.change : null,
      method: 'business_question_workflow_v5',
      sample_size: rows.length,
      low_signal_warning: bundle.limitation || null,
    },
    generated: {
      recommendation: bundle.answer,
      why: bundle.subtext,
      outcome_metric_label: bundle.answer_type.replace(/_/g, ' '),
      detected_language: bundle.detected_language || languageOf(questionText),
      source: bundle.wording_source || 'business_question_workflow_v5',
    },
    chart_series: (bundle.chart_series || []).map((point) => ({ month: point.month, value: point.value, orders: point.value })),
  };
}

async function answerQuestion({ question: questionText, rows = [], dataSource = {}, sheetSummary = null }) {
  const type = classifyQuestion(questionText);
  if (type === 'out_of_scope') return scopeGuidance(questionText, sheetSummary);
  if (!rows.length) {
    const bundle = await naturalize(questionText, dataNeeded(questionText, sheetSummary, 'I found the file, but I could not build reliable dated business history from it.', 'Dated orders'));
    return payload(questionText, bundle, rows, dataSource);
  }
  if (type === 'what_if') {
    const missing = missingWhatIf(questionText, dataSource, sheetSummary);
    if (!missing) return { status: 'what_if' };
    return payload(questionText, await naturalize(questionText, missing), rows, dataSource);
  }
  let bundle;
  if (type === 'order_trend') bundle = trendBundle(questionText, rows, dataSource, sheetSummary, 'orders');
  else if (type === 'sales_trend') bundle = trendBundle(questionText, rows, dataSource, sheetSummary, hasField(dataSource, 'avg_order_value') ? 'revenue' : 'orders');
  else if (type === 'customer_retention') bundle = retentionBundle(questionText, rows, dataSource, sheetSummary);
  else if (type === 'profit_guidance') bundle = profitBundle(questionText, rows, dataSource, sheetSummary);
  else if (type === 'product_guidance') bundle = productBundle(questionText, rows, sheetSummary);
  else bundle = guidanceBundle(questionText, rows, dataSource, sheetSummary);
  return payload(questionText, await naturalize(questionText, bundle), rows, dataSource);
}

module.exports = { answerQuestion, classifyQuestion };
