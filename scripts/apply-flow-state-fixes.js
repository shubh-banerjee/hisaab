const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const scriptPath = path.join(root, 'public', 'script.js');

let source = fs.readFileSync(scriptPath, 'utf8');

function requiredReplace(label, find, replacement) {
  if (source.includes(replacement)) return;
  if (!source.includes(find)) {
    throw new Error(`[flow-state-fix] ${label}: expected source not found`);
  }
  source = source.replace(find, replacement);
}

function insertAfterOnce(label, marker, code, uniqueMarker) {
  if (source.includes(uniqueMarker)) return;
  if (!source.includes(marker)) {
    throw new Error(`[flow-state-fix] ${label}: insert marker not found`);
  }
  source = source.replace(marker, `${marker}\n${code}`);
}

insertAfterOnce(
  'shared flow helpers',
  `  const DC_FOUND_CHIP_CAP = 4;`,
  `

  // ── Data-connect state helpers ───────────────────────────────────────────
  // Keep upload -> reading -> missing data -> summary -> ask inside the same
  // data-connect shell. The old main-stage missing form is still retained for
  // the legacy composer, but this flow must never leak back to the home cards.
  function defaultDcQuestions(summary = lastSheetSummary) {
    const questions = [];
    const caps = summary?.capability_map?.capabilities || [];
    const has = (key) => caps.some((c) => c.key === key && (c.status === 'ready' || c.status === 'limited'));
    if (has('sales_trend') || summary?.orders_found) questions.push('Are my orders going up or down?');
    if (has('pricing')) questions.push('What happens if I change my prices?');
    if (has('delivery_fee')) questions.push('Should I raise my delivery fee?');
    if (has('promotions')) questions.push('Are my discounts actually working?');
    if (has('repeat_customers')) questions.push('Are customers coming back?');
    if (!questions.length) questions.push('What can I check with this data?');
    return questions.slice(0, 3);
  }

  function shouldShowMissingBeforeAsk(summary) {
    if (!summary) return false;
    if (!summary.orders_found) return true;
    const askable = summary.capability_map?.capabilities?.some((c) => c.status === 'ready' || c.status === 'limited');
    return !askable && !(summary.suggested_questions || []).length;
  }

  function missingFieldsFromSummary(summary) {
    const fields = [];
    if (!summary?.orders_found) {
      fields.push({
        field: 'orders',
        prompt: 'Which column contains your order date? Select or type the exact column header from your file.',
        input_type: 'text',
      });
    }
    return fields;
  }

  function showDcMissingFromSummary(summary) {
    showDcMissingInputs({
      partial_data_summary: 'Hisaab could read your file, but a few important columns are missing or unclear.',
      missing_fields: missingFieldsFromSummary(summary),
      sheet_summary: summary,
      allow_limited_guidance: Boolean(summary?.orders_found),
    });
  }

  function showDcMissingInputs(body = {}) {
    const titleEl = document.getElementById('dc-manual-title');
    const subEl = document.getElementById('dc-manual-sub');
    const inputRow = document.querySelector('.dc-manual-input-row');
    const cancelBtn = document.getElementById('dc-manual-cancel-btn');
    const saveBtn = document.getElementById('dc-manual-save-btn');
    if (!titleEl || !subEl || !inputRow || !saveBtn) return false;

    const fields = body.missing_fields || [];
    const summary = body.sheet_summary || lastSheetSummary || {};
    const headers = Array.isArray(summary.headers) ? summary.headers.filter(Boolean).slice(0, 18) : [];

    titleEl.textContent = 'I need a little more information';
    subEl.textContent = body.partial_data_summary || 'Hisaab could read your file, but a few columns are missing or unclear.';

    inputRow.innerHTML = fields.length ? fields.map((item, index) => {
      const safeField = escapeHtml(item.field || `field_${index}`);
      const inputType = item.input_type === 'number' ? 'number' : 'text';
      const headerChips = item.input_type === 'text' && headers.length
        ? `<div class="dc-header-chip-row">${headers.map((h) => `<button class="dc-header-chip" type="button" data-target="${safeField}" data-value="${escapeHtml(h)}">${escapeHtml(h)}</button>`).join('')}</div>`
        : '';
      return `
        <label class="dc-missing-field">
          <span>${escapeHtml(item.prompt || 'Add this detail')}</span>
          <input class="dc-required-input" data-field="${safeField}" type="${inputType}" ${inputType === 'number' ? 'step="0.01"' : ''}>
          ${headerChips}
        </label>
      `;
    }).join('') : '<p class="dc-gentle-note">Some answers may be directional because key details are missing, but Hisaab can still guide you with what is available.</p>';

    inputRow.querySelectorAll('.dc-header-chip').forEach((btn) => {
      btn.addEventListener('click', () => {
        const target = inputRow.querySelector(`.dc-required-input[data-field="${CSS.escape(btn.dataset.target)}"]`);
        if (target) {
          target.value = btn.dataset.value || '';
          target.focus();
        }
      });
    });

    if (cancelBtn) {
      cancelBtn.textContent = body.allow_limited_guidance ? 'Use limited guidance' : 'Back';
      cancelBtn.onclick = () => {
        if (body.allow_limited_guidance) {
          renderDcSuggestedPrompts(summary.suggested_questions || defaultDcQuestions(summary));
          renderDcAskMissingNote(summary);
          setDcScreen('ask');
          questionInput.focus();
        } else {
          setDcScreen('upload');
        }
      };
    }

    saveBtn.textContent = fields.length ? 'Continue' : 'Ask Hisaab';
    saveBtn.onclick = async () => {
      const missingValues = {};
      let hasEmptyRequired = false;
      inputRow.querySelectorAll('.dc-required-input').forEach((input) => {
        const field = input.dataset.field;
        const value = input.value.trim();
        if (!value) hasEmptyRequired = true;
        if (value) missingValues[field] = value;
      });
      if (hasEmptyRequired && fields.length) {
        subEl.textContent = 'Please fill the missing detail first, or go back and upload a clearer file.';
        return;
      }
      Object.assign(manualInputs, missingValues);
      if (questionInput.value.trim()) {
        await runSimulation({ skipValidation: true });
      } else {
        renderDcSuggestedPrompts(summary.suggested_questions || defaultDcQuestions(summary));
        renderDcAskMissingNote(summary);
        setDcScreen('ask');
        questionInput.focus();
      }
    };

    setDcScreen('manual');
    inputRow.querySelector('input')?.focus();
    return true;
  }`,
  'function defaultDcQuestions('
);

requiredReplace(
  'parse success missing-state routing',
  `        renderDcSummary(lastSheetSummary);
        setDcScreen('summary');
        // Data is real and parsed — promote it immediately so the
        // subsequent Ask Hisaab question actually uses it. No "Apply to
        // analysis" gate here since there's no existing result on screen
        // in this fresh-connect context.
        hideApplyDataCta();
        applyPendingDataset();`,
  `        // Data is real and parsed — promote it immediately so the
        // subsequent Ask Hisaab question actually uses it. No "Apply to
        // analysis" gate here since there's no existing result on screen
        // in this fresh-connect context.
        hideApplyDataCta();
        applyPendingDataset();
        if (shouldShowMissingBeforeAsk(lastSheetSummary)) {
          showDcMissingFromSummary(lastSheetSummary);
        } else {
          renderDcSummary(lastSheetSummary);
          setDcScreen('summary');
        }`
);

requiredReplace(
  'suggestion prompts with fallback',
  `  function renderDcSuggestedPrompts(questions) {
    const container = document.getElementById('dc-suggested-questions');
    const label = document.getElementById('dc-try-asking-label');
    if (!container) return;
    const list = (questions || []).slice(0, 3);
    if (label) label.hidden = list.length === 0;
    container.innerHTML = list.map((q) => \`<button class="chip" type="button" data-q="\${escapeHtml(q)}">\${escapeHtml(q)}</button>\`).join('');`,
  `  function renderDcSuggestedPrompts(questions) {
    const container = document.getElementById('dc-suggested-questions');
    const label = document.getElementById('dc-try-asking-label');
    if (!container) return;
    const merged = [];
    [...(questions || []), ...defaultDcQuestions(lastSheetSummary)].forEach((q) => {
      if (q && !merged.includes(q)) merged.push(q);
    });
    const list = merged.slice(0, 3);
    if (label) label.hidden = list.length === 0;
    container.innerHTML = list.map((q) => \`<button class="chip" type="button" data-q="\${escapeHtml(q)}">\${escapeHtml(q)}</button>\`).join('');`
);

requiredReplace(
  'summary ask uses fallback suggestions',
  `      renderDcSuggestedPrompts(lastSheetSummary?.suggested_questions || []);
      renderDcAskMissingNote(lastSheetSummary);
      setDcScreen('ask');
      questionInput.focus();`,
  `      renderDcSuggestedPrompts(lastSheetSummary?.suggested_questions || defaultDcQuestions(lastSheetSummary));
      renderDcAskMissingNote(lastSheetSummary);
      setDcScreen('ask');
      questionInput.focus();`
);

requiredReplace(
  'stable ask loading state',
  `  function setLoading(isLoading, isRefine = false) {
    requestInFlight = isLoading;
    const text = isRefine ? refineBtnText : btnText;
    const loader = isRefine ? refineBtnLoader : btnLoader;
    text.hidden = isLoading;
    loader.hidden = !isLoading;
    // #composer no longer exists as a standalone element in the redesigned
    // Ask Hisaab screen (replaced by .dc-ask-input-wrap + a separate
    // .dc-cta-row) — \`composer\` is null there. This previously threw a
    // TypeError on every single non-refine submission (composer.classList
    // on null), silently killing runSimulation() before it ever reached
    // the actual /api/simulate call. #ask-block is the real, current
    // container for that screen and is always present when a question is
    // being submitted from it.
    const loadingShell = isRefine ? refineInline : (composer || document.getElementById('ask-block'));
    if (loadingShell) loadingShell.classList.toggle('loading', isLoading);
    (isRefine ? refineLoadingStatus : loadingStatus).hidden = !isLoading;
    // Every trigger is locked together, not just the one that started the
    // request — this is what prevents a second click/chip/refine-submit
    // while a request is pending from firing an overlapping second call.
    setSubmissionLocked(isLoading);
  }`,
  `  function setLoading(isLoading, isRefine = false) {
    requestInFlight = isLoading;
    const text = isRefine ? refineBtnText : btnText;
    const loader = isRefine ? refineBtnLoader : btnLoader;
    const isDcAsk = !isRefine && simulateBtn.classList.contains('dc-ask-cta');
    if (isDcAsk) {
      text.hidden = false;
      text.textContent = isLoading ? 'Checking…' : 'Ask Hisaab';
      loader.hidden = true;
    } else {
      text.hidden = isLoading;
      loader.hidden = !isLoading;
    }
    simulateBtn.classList.toggle('is-loading', isLoading && !isRefine);
    simulateBtn.setAttribute('aria-busy', isLoading && !isRefine ? 'true' : 'false');
    const loadingShell = isRefine ? refineInline : (composer || document.getElementById('ask-block') || simulateBtn);
    if (loadingShell) loadingShell.classList.toggle('loading', isLoading);
    (isRefine ? refineLoadingStatus : loadingStatus).hidden = !isLoading;
    setSubmissionLocked(isLoading);
  }`
);

requiredReplace(
  'overlay-aware missing inputs',
  `  function showMissingInputs(body) {
    // The missing-fields form lives in the main stage, hidden behind the
    // data-connect-page overlay if that's still open. Rather than
    // duplicate this whole dynamic form inside the modal too, close the
    // overlay so the user actually sees it — same root cause as the
    // validation-nudge fix, proportionate fix for a rarer path.
    const dataConnectOverlay = document.getElementById('data-connect-page');
    if (dataConnectOverlay && !dataConnectOverlay.hidden) closeDataConnectPage();

    missingSummary.textContent = body.partial_data_summary || 'We need a little more information before calculating this.';
    missingFields.innerHTML = '';
    (body.missing_fields || []).forEach(item => {
      const label = document.createElement('label');
      label.className = 'missing-field';
      label.textContent = item.prompt;
      const input = document.createElement('input');
      input.dataset.field = item.field;
      input.type = item.input_type === 'number' ? 'number' : item.input_type === 'boolean' ? 'checkbox' : 'text';
      if (item.input_type === 'number') input.step = '0.01';
      label.appendChild(input);
      missingFields.appendChild(label);
    });
    missingSection.hidden = false;
    missingSection.classList.add('show');
    missingSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    updateAwayFromLandingState();
  }`,
  `  function showMissingInputs(body) {
    const dataConnectOverlay = document.getElementById('data-connect-page');
    if (dataConnectOverlay && !dataConnectOverlay.hidden) {
      if (body.sheet_summary) lastSheetSummary = body.sheet_summary;
      if (showDcMissingInputs(body)) return;
    }

    missingSummary.textContent = body.partial_data_summary || 'We need a little more information before calculating this.';
    missingFields.innerHTML = '';
    (body.missing_fields || []).forEach(item => {
      const label = document.createElement('label');
      label.className = 'missing-field';
      label.textContent = item.prompt;
      const input = document.createElement('input');
      input.dataset.field = item.field;
      input.type = item.input_type === 'number' ? 'number' : item.input_type === 'boolean' ? 'checkbox' : 'text';
      if (item.input_type === 'number') input.step = '0.01';
      label.appendChild(input);
      missingFields.appendChild(label);
    });
    missingSection.hidden = false;
    missingSection.classList.add('show');
    missingSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    updateAwayFromLandingState();
  }`
);

requiredReplace(
  'overlay-aware errors',
  `  function showError(msg) {
    // Same root cause as the validation-nudge and missing-fields fixes: the
    // main error banner is hidden behind the data-connect-page overlay if
    // that's still open. An invisible error is worse than a visible one
    // that closes the modal, so close it here too.
    const dataConnectOverlay = document.getElementById('data-connect-page');
    if (dataConnectOverlay && !dataConnectOverlay.hidden) closeDataConnectPage();
    errorMsg.textContent = msg;
    errorBanner.hidden = false;
    errorBanner.classList.add('show');
  }`,
  `  function showError(msg) {
    const dataConnectOverlay = document.getElementById('data-connect-page');
    if (dataConnectOverlay && !dataConnectOverlay.hidden) {
      const dcNudge = document.getElementById('dc-validation-nudge');
      if (dcNudge) {
        dcNudge.textContent = msg || 'Something went wrong. Please try again.';
        dcNudge.hidden = false;
        return;
      }
    }
    errorMsg.textContent = msg;
    errorBanner.hidden = false;
    errorBanner.classList.add('show');
  }`
);

insertAfterOnce(
  'ask submit stability styles',
  `(function () {`,
  `
  // Build-applied UI guardrails for the data-connect ask/missing flow.
  (function injectFlowStateStyles() {
    if (typeof document === 'undefined' || document.getElementById('flow-state-fix-style')) return;
    const style = document.createElement('style');
    style.id = 'flow-state-fix-style';
    style.textContent = ${JSON.stringify(`
      #simulate-btn.dc-ask-cta{
        min-width:132px !important;
        width:auto !important;
        min-height:44px !important;
        display:inline-flex !important;
        align-items:center !important;
        justify-content:center !important;
        white-space:nowrap !important;
      }
      #simulate-btn.dc-ask-cta .btn-text{
        display:inline-flex !important;
        width:auto !important;
        height:auto !important;
        line-height:1 !important;
      }
      #simulate-btn.dc-ask-cta.is-loading{
        opacity:.92;
        cursor:progress;
      }
      .dc-missing-field{
        display:block;
        margin:0 0 16px;
        color:#17213a;
        font-weight:650;
      }
      .dc-missing-field input{
        width:100%;
        margin-top:10px;
        min-height:44px;
        border:1px solid rgba(15,23,42,.18);
        border-radius:14px;
        padding:0 14px;
        font:inherit;
        background:white;
      }
      .dc-header-chip-row{
        display:flex;
        flex-wrap:wrap;
        gap:8px;
        margin-top:10px;
      }
      .dc-header-chip{
        border:1px solid rgba(15,23,42,.12);
        border-radius:999px;
        background:#fff;
        padding:7px 10px;
        font:inherit;
        font-size:12px;
        color:#526179;
        cursor:pointer;
      }
      .dc-header-chip:hover{
        border-color:#2f6df6;
        color:#2f6df6;
      }
    `)};
    document.head.appendChild(style);
  })();`,
  'injectFlowStateStyles'
);

fs.writeFileSync(scriptPath, source, 'utf8');
console.log('[flow-state-fix] applied data-connect flow fixes');
