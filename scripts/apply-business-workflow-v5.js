const fs = require('fs');
const path = require('path');
const childProcess = require('child_process');

const root = path.resolve(__dirname, '..');
const serverPath = path.join(root, 'server.js');
const clientPath = path.join(root, 'public', 'script.js');
const cssPath = path.join(root, 'public', 'style.css');

function read(file) {
  return fs.readFileSync(file, 'utf8');
}

function write(file, before, after, label) {
  if (before !== after) {
    fs.writeFileSync(file, after, 'utf8');
    console.log('[business-workflow-v5] ' + label);
  }
}

function replaceOnce(source, marker, replacement, id, required = true) {
  if (source.includes(id)) return source;
  const index = source.indexOf(marker);
  if (index < 0) {
    if (required) throw new Error('Missing marker: ' + id);
    return source;
  }
  return source.slice(0, index) + replacement + source.slice(index + marker.length);
}

function insertBefore(source, marker, code, id) {
  if (source.includes(id)) return source;
  const index = source.indexOf(marker);
  if (index < 0) throw new Error('Missing marker: ' + id);
  return source.slice(0, index) + code + source.slice(index);
}

const CLIENT = String.raw`
  // business-result-renderer-v5
  function ensureBusinessResultBlock() {
    let block = document.getElementById('business-result-block');
    if (block) return block;
    block = document.createElement('section');
    block.id = 'business-result-block';
    block.className = 'business-result-block';
    const scenarios = document.getElementById('scenarios-block');
    const results = document.getElementById('results');
    if (scenarios?.parentElement) scenarios.parentElement.insertBefore(block, scenarios);
    else results?.appendChild(block);
    return block;
  }

  function businessResultItems(bundle, currentQuestion) {
    const recommendations = Array.isArray(bundle.recommendations) ? bundle.recommendations.filter(Boolean).slice(0, 3) : [];
    const rawQuestions = Array.isArray(bundle.suggested_questions) ? bundle.suggested_questions.filter(Boolean) : [];
    const seen = new Set([String(currentQuestion || '').trim().toLowerCase()]);
    const questions = rawQuestions.filter((item) => {
      const prompt = String(item?.prompt || item || '').trim();
      const key = prompt.toLowerCase();
      if (!prompt || seen.has(key)) return false;
      seen.add(key);
      return true;
    }).slice(0, 3);
    return { recommendations, questions };
  }

  function setBusinessFollowUpLoading(block, trigger, loading) {
    block?.classList.toggle('is-followup-loading', loading);
    block?.querySelectorAll('.br-followup').forEach((button) => { button.disabled = loading; });
    if (trigger) {
      if (loading) {
        trigger.dataset.originalText = trigger.textContent;
        trigger.textContent = 'Checking…';
      } else if (trigger.dataset.originalText) {
        trigger.textContent = trigger.dataset.originalText;
        delete trigger.dataset.originalText;
      }
    }
    const status = block?.querySelector('.br-followup-status');
    if (status) {
      status.hidden = !loading;
      status.textContent = loading ? 'Hisaab is checking this against the same data…' : '';
    }
  }

  function showBusinessInlineGuidance(body) {
    const block = ensureBusinessResultBlock();
    let panel = block.querySelector('.br-inline-guidance');
    if (!panel) {
      panel = document.createElement('div');
      panel.className = 'br-inline-guidance';
      block.appendChild(panel);
    }
    const questions = (body.suggested_questions || []).filter(Boolean).slice(0, 3);
    panel.classList.remove('error');
    panel.innerHTML = '<strong>' + escapeHtml(body.guidance_message || 'I need a more specific business question.') + '</strong>'
      + (questions.length ? '<div class="br-inline-guidance-actions">' + questions.map((question) => '<button type="button" class="br-followup" data-prompt="' + escapeHtml(question) + '">' + escapeHtml(question) + '</button>').join('') + '</div>' : '');
    panel.hidden = false;
    panel.querySelectorAll('[data-prompt]').forEach((button) => button.addEventListener('click', () => runBusinessFollowUp(button.dataset.prompt, button)));
    panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  async function runBusinessFollowUp(prompt, trigger) {
    const question = String(prompt || '').trim();
    if (!question || requestInFlight) return;
    const block = ensureBusinessResultBlock();
    requestInFlight = true;
    setSubmissionLocked(true);
    setBusinessFollowUpLoading(block, trigger, true);
    hideError();
    try {
      const started = Date.now();
      const response = await fetch('/api/simulate', {
        method: 'POST',
        headers: apiHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({
          sessionId: getSessionId(),
          question,
          uploadId: lastUploadId,
          ...getActiveDatasetPayload(),
          manual_inputs: manualInputs,
        }),
      });
      const body = await readJsonResponse(response);
      if (!response.ok) throw new Error(body.error || ('Server error (HTTP ' + response.status + ')'));
      lastQuestion = question;
      questionInput.value = question;
      resizeQuestion();
      updateQuestionState();
      if (body.status === 'business_result') {
        renderBusinessResult(body, Date.now() - started, { keepScroll: true });
      } else if (body.status === 'guidance') {
        showBusinessInlineGuidance(body);
      } else if (body.status === 'needs_input') {
        showBusinessInlineGuidance({
          guidance_message: body.partial_data_summary || 'I need one more field before I can answer this reliably.',
          suggested_questions: body.suggested_questions || [],
        });
      } else {
        renderResults(body, Date.now() - started, { keepScroll: true });
      }
    } catch (error) {
      let panel = block.querySelector('.br-inline-guidance');
      if (!panel) {
        panel = document.createElement('div');
        panel.className = 'br-inline-guidance error';
        block.appendChild(panel);
      }
      panel.classList.add('error');
      panel.hidden = false;
      panel.textContent = error.message || 'I could not check that just now. Your current answer is still here.';
    } finally {
      requestInFlight = false;
      setSubmissionLocked(false);
      setBusinessFollowUpLoading(block, trigger, false);
      updateAwayFromLandingState();
    }
  }

  function renderBusinessResult(data, elapsed = 0, options = {}) {
    const demo = document.getElementById('demo-lesson');
    if (demo && !demo.hidden) closeDemoLesson();
    const connector = document.getElementById('data-connect-page');
    if (connector && !connector.hidden) closeDataConnectPage();

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
    const items = businessResultItems(bundle, data.question || lastQuestion);
    const facts = Array.isArray(bundle.found_facts) ? bundle.found_facts.filter(Boolean).slice(0, 4) : [];
    const factsHtml = facts.length
      ? '<div class="br-facts">' + facts.map((fact) => '<span>' + escapeHtml(fact) + '</span>').join('') + '</div>'
      : '';
    const limitationHtml = bundle.limitation
      ? '<div class="br-limitation">' + escapeHtml(bundle.limitation) + '</div>'
      : '';
    const recommendationsHtml = items.recommendations.length
      ? '<section class="br-recommendations"><div class="br-section-heading"><span>Recommended next steps</span><small>Start small. Change one thing at a time.</small></div><div class="br-actions">'
        + items.recommendations.map((card) => '<article class="br-action ' + escapeHtml(card.tone || '') + '"><div class="br-action-label">' + escapeHtml(card.label || '') + '</div><h4>' + escapeHtml(card.title || '') + '</h4><p>' + escapeHtml(card.body || '') + '</p></article>').join('')
        + '</div></section>'
      : '';
    const nextHtml = items.questions.length
      ? '<section class="br-next"><div class="br-section-heading"><span>Explore next</span><small>Based on this answer and your available data.</small></div><div class="br-next-actions">'
        + items.questions.map((item) => {
          const prompt = item?.prompt || item;
          const label = item?.label || prompt;
          return '<button class="br-followup" type="button" data-prompt="' + escapeHtml(prompt) + '">' + escapeHtml(label) + '</button>';
        }).join('')
        + '</div></section>'
      : '';

    block.innerHTML = '<div class="br-question"><div class="br-eyebrow">You asked</div><h2>' + escapeHtml(data.question || lastQuestion || '') + '</h2></div>'
      + '<div class="br-card br-answer"><div class="br-eyebrow">Hisaab says</div><h3>' + escapeHtml(bundle.title || 'Here is the clearest read') + '</h3><p class="br-main">' + escapeHtml(bundle.answer || '') + '</p>'
      + (bundle.subtext ? '<p class="br-sub">' + escapeHtml(bundle.subtext) + '</p>' : '')
      + factsHtml + limitationHtml + '</div>'
      + recommendationsHtml + nextHtml
      + '<div class="br-followup-status" hidden></div><div class="br-inline-guidance" hidden></div>';
    block.hidden = false;
    block.querySelectorAll('.br-followup[data-prompt]').forEach((button) => button.addEventListener('click', () => runBusinessFollowUp(button.dataset.prompt, button)));

    const resultTop = document.querySelector('#results .result-top');
    if (resultTop) resultTop.hidden = true;
    const scenarios = document.getElementById('scenarios-block');
    if (scenarios) scenarios.hidden = true;
    const evidence = document.getElementById('evidence-block');
    if (evidence) evidence.hidden = true;
    const confidence = document.getElementById('confidence-block');
    if (confidence) confidence.hidden = true;
    const explain = document.querySelector('#results .explain');
    if (explain) explain.hidden = true;
    intentPrompt.classList.remove('show', 'captured');
    intentPrompt.hidden = true;
    refineInline.hidden = true;

    activeResultId = crypto.randomUUID ? crypto.randomUUID() : 'result-' + Date.now();
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
    if (!options.keepScroll) resultsSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    updateAwayFromLandingState();
  }
`;

const CSS = String.raw`
/* business-result-ui-v5 */
.business-result-block{max-width:840px;margin:0 auto 28px;display:grid;gap:18px}.br-question{padding:0 2px}.br-eyebrow{font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:#8190aa;font-weight:800;margin-bottom:8px}.br-question h2{margin:0;color:var(--ink);font-size:25px;line-height:1.2;letter-spacing:-.025em}.br-card,.br-action{border:1px solid rgba(133,148,179,.32);border-radius:22px;background:transparent;box-shadow:none}.br-answer{padding:28px}.br-answer h3{margin:0;color:var(--ink);font-size:29px;line-height:1.16;letter-spacing:-.03em}.br-main{margin:13px 0 0;color:#2f3d58;font-size:18px;line-height:1.55}.br-sub{margin:9px 0 0;color:#5b6780;font-size:14px;line-height:1.55}.br-facts{display:flex;flex-wrap:wrap;gap:8px;margin-top:17px}.br-facts span{border:1px solid rgba(133,148,179,.3);border-radius:999px;padding:7px 11px;background:#fff;color:#34425f;font-size:12px;font-weight:700}.br-limitation{margin-top:17px;border-radius:14px;background:#fff8e8;border:1px solid #f3d79d;color:#7b5508;padding:11px 13px;font-size:13px;line-height:1.45}.br-recommendations,.br-next{display:grid;gap:12px}.br-section-heading{display:flex;align-items:flex-end;justify-content:space-between;gap:16px}.br-section-heading span{font-size:15px;font-weight:800;color:var(--ink)}.br-section-heading small{font-size:12px;color:var(--ink-mute);text-align:right}.br-actions{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}.br-action{padding:18px;min-height:170px}.br-action.safe{border-color:rgba(49,109,255,.38)}.br-action.moderate{border-color:rgba(133,148,179,.4)}.br-action.higher{border-color:rgba(239,177,64,.55)}.br-action-label{font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:#8190aa;font-weight:850;margin-bottom:10px}.br-action h4{margin:0;color:var(--ink);font-size:17px;line-height:1.3}.br-action p{margin:9px 0 0;color:#4b5a78;font-size:13px;line-height:1.5}.br-next{border-top:1px solid rgba(133,148,179,.2);padding-top:16px}.br-next-actions,.br-inline-guidance-actions{display:flex;flex-wrap:wrap;gap:8px}.br-followup{border:1px solid rgba(49,109,255,.3);border-radius:999px;background:transparent;color:var(--accent);font-family:var(--sans);font-size:13px;font-weight:700;padding:9px 14px;cursor:pointer}.br-followup:hover{border-color:var(--accent);background:var(--accent-soft)}.br-followup:disabled{opacity:.55;cursor:wait}.br-followup-status{font-size:13px;color:var(--ink-mute);padding:11px 2px}.br-inline-guidance{border:1px solid rgba(49,109,255,.2);background:var(--accent-soft);border-radius:15px;padding:14px 16px;color:var(--ink);font-size:13px;line-height:1.5}.br-inline-guidance.error{border-color:rgba(196,68,68,.25);background:#fff2f2;color:#8b3030}.br-inline-guidance-actions{margin-top:10px}.business-result-block.is-followup-loading .br-card,.business-result-block.is-followup-loading .br-recommendations{opacity:.72}@media(max-width:840px){.business-result-block{max-width:100%}.br-actions{grid-template-columns:1fr}.br-answer{padding:23px}.br-answer h3{font-size:25px}.br-action{min-height:auto}.br-section-heading{align-items:flex-start;flex-direction:column;gap:4px}.br-section-heading small{text-align:left}}
`;

function patchServer() {
  let source = read(serverPath);
  const before = source;
  source = replaceOnce(
    source,
    "const firestoreService = require('./services/firestore');",
    "const firestoreService = require('./services/firestore');\nconst businessWorkflow = require('./services/business-workflow'); // business-workflow-service-v5",
    'business-workflow-service-v5'
  );
  if (!source.includes('business-workflow-router-v5')) {
    const marker = '  const { data, dataSource, sheetSummary } = await getSimulationData(sheetUrl, manualInputs, csvText, bootstrapOwner);';
    const route = marker + `

  // business-workflow-router-v5: one router coordinates scope, intent, capability and result type.
  const workflow = await businessWorkflow.answerQuestion({
    question: question.trim(),
    rows: data,
    dataSource,
    sheetSummary,
  });
  if (workflow.status === 'guidance' || workflow.status === 'business_result') {
    let savedQuestion = null;
    try {
      savedQuestion = await firestoreService.saveQuestion({
        sessionId,
        uploadId: uploadId || null,
        question: question.trim(),
        answer: workflow.status === 'guidance'
          ? workflow.guidance_message
          : (workflow.business_result?.answer || workflow.business_result?.title || ''),
      });
      await firestoreService.saveEvent({
        type: 'ask',
        sessionId,
        uploadId: uploadId || null,
        questionId: savedQuestion?.id || null,
        metadata: {
          status: workflow.status,
          answerType: workflow.business_result?.answer_type || workflow.guidance_type || null,
        },
      });
    } catch (error) {
      console.error('[business-workflow-v5] persistence failed softly:', error?.message || error);
    }
    return res.json({
      ...workflow,
      session_id: sessionId,
      data_source: dataSource,
      sheet_summary: sheetSummary,
      analytics_capabilities: sheetSummary?.capability_map || null,
      persistence: { question: savedQuestion },
    });
  }
  // A supported what-if question falls through to the existing regression engine.`;
    source = replaceOnce(source, marker, route, 'business-workflow-router-v5');
  }
  write(serverPath, before, source, 'patched server router');
}

function patchClient() {
  let source = read(clientPath);
  const before = source;
  source = insertBefore(source, '  function renderResults(data, elapsed, options = {}) {', CLIENT + '\n', 'business-result-renderer-v5');

  if (!source.includes('business-result-status-v5')) {
    const marker = "      if (body.status === 'guidance') {";
    const replacement = "      if (body.status === 'business_result') {\n        if (body.session_id) localStorage.setItem('hisaabSessionId', body.session_id);\n        renderBusinessResult(body, Date.now() - startTime);\n        return;\n      }\n      // business-result-status-v5\n" + marker;
    source = replaceOnce(source, marker, replacement, 'business-result-status-v5');
  }

  if (!source.includes('business-result-normal-reset-v5')) {
    const marker = '    const computed = data.computed || data;';
    const replacement = "    const previousBusinessResult = document.getElementById('business-result-block');\n    if (previousBusinessResult) previousBusinessResult.hidden = true;\n    const resultTopForNormal = document.querySelector('#results .result-top');\n    if (resultTopForNormal) resultTopForNormal.hidden = false;\n    const evidenceForNormal = document.getElementById('evidence-block');\n    if (evidenceForNormal) evidenceForNormal.hidden = false;\n    const confidenceForNormal = document.getElementById('confidence-block');\n    if (confidenceForNormal) confidenceForNormal.hidden = false;\n    const explainForNormal = document.querySelector('#results .explain');\n    if (explainForNormal) explainForNormal.hidden = false;\n    if (intentPrompt) intentPrompt.hidden = false;\n    // business-result-normal-reset-v5\n" + marker;
    source = replaceOnce(source, marker, replacement, 'business-result-normal-reset-v5');
  }

  if (!source.includes('business-result-hide-v5')) {
    const marker = "    if (scenariosBlock) scenariosBlock.hidden = true;";
    source = replaceOnce(
      source,
      marker,
      marker + "\n    const businessResultBlock = document.getElementById('business-result-block');\n    if (businessResultBlock) businessResultBlock.hidden = true;\n    // business-result-hide-v5",
      'business-result-hide-v5',
      false
    );
  }

  if (!source.includes('guidance-single-source-v5')) {
    const marker = `  function showGuidanceMessage(body) {
    const card = document.getElementById('dc-guidance-card');
    const msgEl = document.getElementById('dc-guidance-message');
    const questionsEl = document.getElementById('dc-guidance-questions');
    if (!card || !msgEl || !questionsEl) return;
    msgEl.textContent = body.guidance_message || '';`;
    const replacement = `  function showGuidanceMessage(body) {
    const card = document.getElementById('dc-guidance-card');
    const msgEl = document.getElementById('dc-guidance-message');
    const questionsEl = document.getElementById('dc-guidance-questions');
    const baseSuggestions = document.getElementById('dc-suggested-questions');
    if (!card || !msgEl || !questionsEl) return;
    // guidance-single-source-v5
    if (baseSuggestions) {
      baseSuggestions.dataset.hiddenByGuidance = 'true';
      baseSuggestions.hidden = true;
    }
    msgEl.textContent = body.guidance_message || '';`;
    source = replaceOnce(source, marker, replacement, 'guidance-single-source-v5', false);
  }

  if (!source.includes('guidance-restore-v5')) {
    const marker = `  function hideGuidanceMessage() {
    const card = document.getElementById('dc-guidance-card');
    if (card) card.hidden = true;
  }`;
    const replacement = `  function hideGuidanceMessage() {
    const card = document.getElementById('dc-guidance-card');
    if (card) card.hidden = true;
    const baseSuggestions = document.getElementById('dc-suggested-questions');
    const askScreen = document.getElementById('dc-screen-ask');
    if (baseSuggestions && baseSuggestions.dataset.hiddenByGuidance === 'true') {
      delete baseSuggestions.dataset.hiddenByGuidance;
      baseSuggestions.hidden = !(askScreen && !askScreen.hidden && baseSuggestions.children.length > 0);
    }
    // guidance-restore-v5
  }`;
    source = replaceOnce(source, marker, replacement, 'guidance-restore-v5', false);
  }

  if (!source.includes('guidance-hide-on-suggestion-v5')) {
    const marker = '        questionInput.value = btn.dataset.q;\n        resizeQuestion();';
    const replacement = "        questionInput.value = btn.dataset.q;\n        hideGuidanceMessage();\n        // guidance-hide-on-suggestion-v5\n        resizeQuestion();";
    source = replaceOnce(source, marker, replacement, 'guidance-hide-on-suggestion-v5', false);
  }

  write(clientPath, before, source, 'patched coordinated result UI');
}

function patchCss() {
  const before = read(cssPath);
  let source = before;
  if (!source.includes('business-result-ui-v5')) source += CSS;
  write(cssPath, before, source, 'added business result styles');
}

patchServer();
patchClient();
patchCss();
for (const file of [serverPath, clientPath]) {
  childProcess.execFileSync(process.execPath, ['--check', file], { stdio: 'inherit' });
}
