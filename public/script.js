(function () {
  const stage = document.getElementById('stage');
  const introLoader = document.getElementById('intro-loader');
  const introGreeting = document.getElementById('intro-greeting');
  const introLogo = document.getElementById('intro-logo');
  const brandReset = document.getElementById('brand-reset');
  const greet = document.getElementById('greet');
  const subtitle = document.getElementById('subtitle');
  const questionInput = document.getElementById('question-input');
  const sheetUrlInput = document.getElementById('sheet-url-input');
  const clearSheetUrl = document.getElementById('clear-sheet-url');
  const csvUploadLink = document.getElementById('csv-upload-link');
  const csvFileInput = document.getElementById('csv-file-input');
  const pathSample = document.getElementById('path-sample');
  const pathReal = document.getElementById('path-real');
  const sheetSlot = document.getElementById('sheet-slot');
  const dataDetected = document.getElementById('data-detected');
  const detectedHeadline = document.getElementById('detected-headline');
  const detectedBody = document.getElementById('detected-body');
  const capabilityList = document.getElementById('capability-list');
  const detectedCaveat = document.getElementById('detected-caveat');
  const applyDataBtn = document.getElementById('apply-data-btn');
  const pendingDataNote = document.getElementById('pending-data-note');
  const pendingDataNoteText = document.getElementById('pending-data-note-text');
  const dataPanelClose = document.getElementById('data-panel-close');
  const detectedToggle = document.getElementById('detected-toggle');
  const detectedDetails = document.getElementById('detected-details');
  const sampleSuggestions = document.getElementById('sample-suggestions');
  const realSuggestions = document.getElementById('real-suggestions');
  const composer = document.getElementById('composer');
  const micBtn = document.getElementById('mic-btn');
  const simulateBtn = document.getElementById('simulate-btn');
  const btnText = simulateBtn.querySelector('.btn-text');
  const btnLoader = simulateBtn.querySelector('.btn-loader');
  const validationNudge = document.getElementById('validation-nudge');
  const missingSection = document.getElementById('missing-input-section');
  const missingSummary = document.getElementById('missing-summary');
  const missingFields = document.getElementById('missing-fields');
  const missingSubmitBtn = document.getElementById('missing-submit-btn');
  const errorBanner = document.getElementById('error-banner');
  const errorMsg = document.getElementById('error-msg');
  const resultsSection = document.getElementById('results');
  const dataSourceNote = document.getElementById('data-source-note');
  const dataSourceText = document.getElementById('data-source-text');
  const metricValue = document.getElementById('metric-value');
  const metricLabel = document.getElementById('metric-label');
  const revenueImpact = document.getElementById('revenue-impact');
  const revenueValue = document.getElementById('revenue-value');
  const downsideCard = document.getElementById('downside-card');
  const downsideValue = document.getElementById('downside-value');
  const trendChip = document.getElementById('trend-chip');
  const trendArrow = document.getElementById('trend-arrow');
  const trendText = document.getElementById('trend-text');
  const confidenceBlock = document.getElementById('confidence-block');
  const confidenceBadge = document.getElementById('confidence-badge');
  const confidenceLabel = document.getElementById('confidence-label');
  const confidencePct = document.getElementById('confidence-pct');
  const rangeLine = document.getElementById('range-line');
  const lowSignalWarning = document.getElementById('low-signal-warning');
  const aiWordingNote = document.getElementById('ai-wording-note');
  const lowConfidenceActions = document.getElementById('low-confidence-actions');
  const inlineDataMount = document.getElementById('inline-data-mount');
  const connectedDataNote = document.getElementById('connected-data-note');
  const connectedDataText = document.getElementById('connected-data-text');
  const addRealDataBtn = document.getElementById('add-real-data-btn');
  const tryDifferentBtn = document.getElementById('try-different-btn');
  const chartLabel = document.getElementById('chart-label');
  const chartStart = document.getElementById('chart-start');
  const chartEnd = document.getElementById('chart-end');
  const chartCaption = document.getElementById('chart-caption');
  const recommendText = document.getElementById('recommendation-text');
  const whyText = document.getElementById('why-text');
  const intentPrompt = document.getElementById('intent-prompt');
  const refineRow = document.getElementById('refine-row');
  const refineLink = document.getElementById('refine-link');
  const intentMsg = document.getElementById('intent-msg');
  const intentSub = document.getElementById('intent-sub');
  const intentError = document.getElementById('intent-error');
  const intentRetry = document.getElementById('intent-retry');
  const viewInLog = document.getElementById('view-in-log');
  const viewInLogLink = document.getElementById('view-in-log-link');
  const openDecisions = document.getElementById('open-decisions');
  const newQuestion = document.getElementById('new-question');
  const closeDecisions = document.getElementById('close-decisions');
  const decisionCount = document.getElementById('decision-count');
  const decisionLog = document.getElementById('decision-log');
  const decisionList = document.getElementById('decision-list');
  const decisionLogSub = document.getElementById('decision-log-sub');
  const trackRecord = document.getElementById('track-record');
  const trackRecordText = document.getElementById('track-record-text');
  const trajectory = document.getElementById('trajectory');
  const refineInline = document.getElementById('refine-inline');
  const refineQuestion = document.getElementById('refine-question');
  const refineSend = document.getElementById('refine-send');
  const refineBtnText = refineSend.querySelector('.btn-text');
  const refineBtnLoader = refineSend.querySelector('.btn-loader');
  const loadingStatus = document.getElementById('loading-status');
  const refineLoadingStatus = document.getElementById('refine-loading-status');

  const pageGreetingPhrases = [
    'What would you like to change?',
    'आप क्या बदलना चाहते हैं?',
    'আপনি কী পরিবর্তন করতে চান?',
    'நீங்கள் என்ன மாற்ற விரும்புகிறீர்கள்?',
    'What would you like to change?',
  ];
  const loaderPhrases = ['Hello', 'नमस्ते', 'নমস্কার', 'வணக்கம்'];
  const decisionVocabulary = /\b(raise|raised|raising|lower|lowered|change|changed|add|added|remove|removed|stop|start|increase|increased|decrease|decreased|run|running|try|offer|offering|reduce|reduced|cut|discount)\b/i;
  const subjectVocabulary = /\b(fee|fees|price|prices|promo|promotion|discount|cod|cash on delivery|delivery|shipping|orders?|repeat|customer|customers|revenue|aov|month|months)\b/i;

  let activePath = 'sample';
  // The ONE dataset that /api/simulate calls actually use. This is distinct
  // from whatever is currently typed/uploaded in the composer inputs
  // (uploadedCsv / sheetUrlInput.value), which is merely "pending" until it
  // is promoted here. See getActiveDatasetPayload() / applyPendingDataset().
  let activeDataset = { kind: 'sample', sheetUrl: '', csvText: '', fileName: '', label: '' };
  // Single global lock covering every /api/simulate entry point (main
  // composer, refine composer, missing-fields resubmit, "Apply to
  // analysis"). Only one of these may be in flight at a time — see
  // runQuestionSubmission() / setSubmissionLocked().
  let requestInFlight = false;
  let manualInputs = {};
  let recognition = null;
  let mediaRecorder = null;
  let mediaChunks = [];
  let recorderStopTimer = null;
  let recognizing = false;
  let introTimers = [];
  let subtitleTimer = null;
  let intentPromptTimer = null;
  let parseTimer = null;
  let lastSheetSummary = null;
  let uploadedCsv = null;
  let uploadedFileName = '';
  let connectedDataLabel = '';
  let lastUploadId = null;
  let lastSimulationPersistence = null;
  let lastQuestion = '';
  let lastRefinement = '';
  let currentResult = null;
  let trajectoryItems = [];
  let activeIntent = null;
  let activeResultId = null;
  let savedDecisions = [];
  let decisionsCountValue = 0;

  setupIntro();
  setupSpeech();
  resizeQuestion();
  updateQuestionState();
  updateNavScrollState();
  window.addEventListener('scroll', updateNavScrollState, { passive: true });
  updateAwayFromLandingState();
  renderChipVisibility();

  document.querySelectorAll('.chip').forEach(btn => {
    btn.addEventListener('click', () => {
      questionInput.value = btn.dataset.q;
      resizeQuestion();
      updateQuestionState();
      hideValidationNudge();
      questionInput.focus();
      updateAwayFromLandingState();
    });
  });

  pathSample.addEventListener('click', () => setPath('sample'));
  pathReal.addEventListener('click', () => setPath('real'));
  csvUploadLink.addEventListener('click', () => {
    if (uploadedCsv) {
      clearCsvUpload();
      hideApplyDataCta();
      reconcilePendingDataset();
      scheduleSheetParse();
      return;
    }
    csvFileInput.click();
  });
  csvFileInput.addEventListener('change', handleCsvFile);
  sheetUrlInput.addEventListener('input', () => {
    clearCsvUpload();
    lastUploadId = null;
    connectedDataLabel = sheetUrlInput.value.trim() ? dataLabelFromSheetUrl(sheetUrlInput.value.trim()) : '';
    renderSheetUrlState();
    hideApplyDataCta();
    scheduleSheetParse();
  });
  clearSheetUrl.addEventListener('click', () => {
    sheetUrlInput.value = '';
    connectedDataLabel = '';
    lastSheetSummary = null;
    lastUploadId = null;
    renderSheetUrlState();
    hideApplyDataCta();
    dataDetected.classList.remove('show');
    reconcilePendingDataset();
    sheetUrlInput.focus();
    updateAwayFromLandingState();
  });
  applyDataBtn.addEventListener('click', refreshAnalysisWithConnectedData);
  dataPanelClose.addEventListener('click', () => {
    dataDetected.classList.remove('show');
    alignDataPanelToSheetSlot();
    updateAwayFromLandingState();
  });
  detectedToggle.addEventListener('click', () => {
    const open = detectedDetails.classList.toggle('open');
    detectedToggle.textContent = open ? 'Hide details ↑' : 'See what I read from your sheet ↓';
  });

  questionInput.addEventListener('focus', stopIntro, { once: true });
  questionInput.addEventListener('input', () => {
    resizeQuestion();
    updateQuestionState();
    hideValidationNudge();
    updateAwayFromLandingState();
  });
  questionInput.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      simulateBtn.click();
    }
  });

  simulateBtn.addEventListener('click', async () => {
    manualInputs = {};
    await runSimulation();
  });

  missingSubmitBtn.addEventListener('click', async () => {
    missingFields.querySelectorAll('[data-field]').forEach(input => {
      manualInputs[input.dataset.field] = input.type === 'checkbox' ? input.checked : input.value;
    });
    await runSimulation({ skipValidation: true });
  });

  tryDifferentBtn.addEventListener('click', resetToComposer);
  addRealDataBtn.addEventListener('click', openInlineDataConnector);
  micBtn.addEventListener('click', toggleSpeech);
  refineLink.addEventListener('click', () => {
    if (!lastRefinement || !currentResult) return;
    beginRefinement(currentResult, lastRefinement);
  });
  document.querySelectorAll('.intent-btn').forEach(btn => {
    btn.addEventListener('click', () => captureIntent(btn.dataset.intent));
  });
  intentRetry.addEventListener('click', () => {
    if (activeIntent) captureIntent(activeIntent);
  });
  viewInLogLink.addEventListener('click', openDecisionLog);
  openDecisions.addEventListener('click', openDecisionLog);
  closeDecisions.addEventListener('click', closeDecisionLog);
  newQuestion.addEventListener('click', resetToLanding);
  brandReset.addEventListener('click', () => {
    if (isAnalysisPage()) resetToLanding();
  });
  refineQuestion.addEventListener('input', resizeRefineQuestion);
  refineQuestion.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submitRefinement();
    }
  });
  refineSend.addEventListener('click', submitRefinement);
  fetchDecisionsCount();
  window.addEventListener('resize', alignDataPanelToSheetSlot);
  window.addEventListener('scroll', alignDataPanelToSheetSlot, { passive: true });

  function setupIntro() {
    greet.textContent = pageGreetingPhrases[0];
    subtitle.classList.remove('show');
    playIntroLoader();
  }

  function playIntroLoader() {
    if (!introLoader || !introGreeting || !introLogo) {
      document.body.classList.remove('intro-loading');
      document.body.classList.add('intro-done');
      subtitleTimer = window.setTimeout(() => subtitle.classList.add('show'), 600);
      return;
    }

    introTimers.forEach(timer => window.clearTimeout(timer));
    introTimers = [];
    clearTimeout(subtitleTimer);
    document.body.classList.add('intro-loading');
    document.body.classList.remove('intro-done');
    introLoader.hidden = false;
    introLoader.classList.remove('hide');
    introGreeting.classList.remove('show', 'exit');
    introLogo.classList.remove('show', 'zoom');
    introGreeting.textContent = loaderPhrases[0];

    loaderPhrases.forEach((phrase, index) => {
      const base = index * 820;
      introTimers.push(window.setTimeout(() => {
        introGreeting.classList.remove('exit');
        introGreeting.textContent = phrase;
        window.requestAnimationFrame(() => introGreeting.classList.add('show'));
      }, base));
      introTimers.push(window.setTimeout(() => {
        introGreeting.classList.add('exit');
      }, base + 610));
    });

    const logoStart = loaderPhrases.length * 820 + 240;
    introTimers.push(window.setTimeout(() => {
      introGreeting.classList.remove('show', 'exit');
      introLogo.classList.add('show');
    }, logoStart));
    introTimers.push(window.setTimeout(() => {
      introLogo.classList.add('zoom');
    }, logoStart + 1280));
    introTimers.push(window.setTimeout(() => {
      document.body.classList.remove('intro-loading');
      document.body.classList.add('intro-done');
      introLoader.classList.add('hide');
      subtitleTimer = window.setTimeout(() => subtitle.classList.add('show'), 600);
    }, logoStart + 2100));
    introTimers.push(window.setTimeout(() => {
      introLoader.hidden = true;
    }, logoStart + 2900));
  }

  function stopIntro() {
    introTimers.forEach(timer => window.clearTimeout(timer));
    introTimers = [];
    clearTimeout(subtitleTimer);
    if (introLoader) introLoader.hidden = true;
    document.body.classList.remove('intro-loading');
    document.body.classList.add('intro-done');
    greet.style.opacity = '1';
    greet.textContent = pageGreetingPhrases[0];
    subtitle.classList.add('show');
  }

  function setPath(path) {
    activePath = path;
    const isReal = path === 'real';
    pathSample.classList.toggle('active', !isReal);
    pathReal.classList.toggle('active', isReal);
    sheetSlot.classList.toggle('open', isReal);
    renderChipVisibility();
    if (!isReal) {
      dataDetected.classList.remove('show');
      clearCsvUpload();
      lastSheetSummary = null;
      lastUploadId = null;
      connectedDataLabel = '';
      hideApplyDataCta();
      // Switching back to "sample" is itself a pending-input change — it
      // goes through the same gate as everything else, so on the analysis
      // screen it doesn't revert the active dataset until Apply is clicked.
      reconcilePendingDataset();
    } else {
      scheduleSheetParse();
    }
    updateAwayFromLandingState();
  }

  async function handleCsvFile() {
    const file = csvFileInput.files?.[0];
    if (!file) return;
    setPath('real');
    sheetUrlInput.value = '';
    uploadedFileName = file.name;
    uploadedCsv = await file.text();
    connectedDataLabel = uploadedFileName;
    renderCsvUploadState();
    renderSheetUrlState();
    await parseConnectedData();
  }

  function clearCsvUpload() {
    uploadedCsv = null;
    uploadedFileName = '';
    csvFileInput.value = '';
    renderCsvUploadState();
    renderSheetUrlState();
    updateAwayFromLandingState();
  }

  function renderCsvUploadState() {
    if (uploadedCsv && uploadedFileName) {
      csvUploadLink.textContent = uploadedFileName;
      csvUploadLink.classList.add('has-file');
      csvUploadLink.title = 'Remove selected CSV';
    } else {
      csvUploadLink.textContent = 'upload a CSV file';
      csvUploadLink.classList.remove('has-file');
      csvUploadLink.title = '';
    }
  }

  function renderSheetUrlState() {
    const hasValue = Boolean(sheetUrlInput.value.trim());
    clearSheetUrl.hidden = !hasValue;
    sheetUrlInput.classList.toggle('has-clear', hasValue);
  }

  // ───────────────────────────────────────────────────────────────────────
  // SINGLE SOURCE OF TRUTH for what data an /api/simulate call uses.
  //
  // "Pending" data is whatever is currently typed in the sheet URL box or
  // sitting in uploadedCsv — it may or may not be usable yet. "Active" data
  // (activeDataset) is what every /api/simulate call actually sends. Every
  // call site — main composer, refine composer, missing-fields resubmit,
  // "Apply to analysis", and any future entry point — MUST read the payload
  // via getActiveDatasetPayload() instead of touching sheetUrlInput/
  // uploadedCsv directly. That is what makes it structurally impossible for
  // an unapplied dataset to leak into an answer, regardless of which UI
  // element triggered the call.
  //
  // On the HOME screen (no result on screen yet, or the analysis screen's
  // gate isn't open) pending is promoted to active automatically — no
  // button, no gate. On the ANALYSIS screen (a result is showing AND the
  // inline data connector is open) pending is only promoted when the user
  // explicitly clicks "Apply to analysis".
  // ───────────────────────────────────────────────────────────────────────

  function getActiveDatasetPayload() {
    return {
      sheetUrl: activeDataset.kind === 'sheet' ? activeDataset.sheetUrl : '',
      csvText: activeDataset.kind === 'csv' ? activeDataset.csvText : '',
    };
  }

  function pendingDatasetFromInputs() {
    if (uploadedCsv) {
      return { kind: 'csv', sheetUrl: '', csvText: uploadedCsv, fileName: uploadedFileName, label: uploadedFileName || 'uploaded CSV' };
    }
    const url = sheetUrlInput.value.trim();
    if (activePath === 'real' && url) {
      return { kind: 'sheet', sheetUrl: url, csvText: '', fileName: '', label: dataLabelFromSheetUrl(url) };
    }
    return { kind: 'sample', sheetUrl: '', csvText: '', fileName: '', label: '' };
  }

  // True only on the analysis screen: a result already exists AND the
  // inline data connector is open. This is the one place the "no auto-apply"
  // rule applies; everywhere else behaves like the home screen.
  function isAnalysisScreenGated() {
    return stage.classList.contains('connecting-data') && Boolean(currentResult);
  }

  // Promotes whatever is currently pending to active. Safe to call any time;
  // it is a no-op in terms of correctness if pending === active already.
  // `source` is an optional server-shaped data_source object (from a
  // /api/parse-sheet or /api/simulate response) used to render a richer
  // "Using this data" label immediately; if omitted, a basic label is shown
  // and gets refined the next time a real response arrives for this dataset.
  function applyPendingDataset(source) {
    activeDataset = pendingDatasetFromInputs();
    renderConnectedDataState(source || null);
    setDataSource(source || null);
    renderChipVisibility();
  }

  // Real-data suggestion chips ("Where can I safely raise prices?", etc.)
  // must never be reachable unless there is an actual active dataset behind
  // them — otherwise clicking one silently answers from demo data. So on
  // the "Connect my order data" path they stay hidden (no chips at all,
  // real or sample) until activeDataset actually becomes a sheet/csv. The
  // "Try with sample data" path is untouched: its chips show immediately,
  // since that path is explicitly the demo experience.
  function renderChipVisibility() {
    const isReal = activePath === 'real';
    sampleSuggestions.hidden = isReal;
    realSuggestions.hidden = !(isReal && activeDataset.kind !== 'sample');
  }

  // Call after any pending-input change (parse success/failure, path switch,
  // clearing the sheet URL, removing a CSV). On the home screen this
  // instantly promotes pending to active (unchanged auto-apply behavior).
  // On the analysis screen it does nothing here — the Apply CTA's own
  // show/hide calls are what communicate the pending state; active is only
  // ever changed by an explicit "Apply to analysis" click.
  function reconcilePendingDataset() {
    if (isAnalysisScreenGated()) return;
    applyPendingDataset();
  }

  function getSessionId() {
    let id = localStorage.getItem('hisaabSessionId');
    if (!id) {
      id = crypto.randomUUID ? crypto.randomUUID() : `hisaab-${Date.now()}-${Math.random().toString(16).slice(2)}`;
      localStorage.setItem('hisaabSessionId', id);
    }
    return id;
  }

  function getUserId() {
    let id = localStorage.getItem('hisaabUserId');
    if (!id) {
      id = crypto.randomUUID ? crypto.randomUUID() : `hisaab-user-${Date.now()}-${Math.random().toString(16).slice(2)}`;
      localStorage.setItem('hisaabUserId', id);
    }
    return id;
  }

  function apiHeaders(extra = {}) {
    return {
      'X-Hisaab-Session': getSessionId(),
      'X-Hisaab-User': getUserId(),
      ...extra,
    };
  }

  function scheduleSheetParse() {
    window.clearTimeout(parseTimer);
    if (activePath !== 'real') return;
    const value = sheetUrlInput.value.trim();
    if (!uploadedCsv && value.length <= 20) {
      dataDetected.classList.remove('show');
      updateAwayFromLandingState();
      return;
    }
    parseTimer = window.setTimeout(parseConnectedData, 450);
  }

  async function parseConnectedData() {
    if (activePath !== 'real') return;
    const sheetUrl = sheetUrlInput.value.trim();
    if (!uploadedCsv && sheetUrl.length <= 20) return;

    hideError();
    const isInlineRefresh = stage.classList.contains('connecting-data') && Boolean(currentResult);
    detectedHeadline.textContent = isInlineRefresh ? 'Reading this data for your analysis...' : 'Reading your order data...';
    detectedBody.textContent = isInlineRefresh ? 'I will update the result below once the columns are ready.' : 'Checking the columns before I use them.';
    capabilityList.hidden = true;
    capabilityList.innerHTML = '';
    detectedCaveat.hidden = true;
    detectedDetails.innerHTML = '';
    hideApplyDataCta();
    dataDetected.classList.add('show');
    alignDataPanelToSheetSlot();
    updateAwayFromLandingState();

    try {
      const res = await fetch('/api/parse-sheet', {
        method: 'POST',
        headers: apiHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(uploadedCsv ? { csvText: uploadedCsv, fileName: uploadedFileName } : { sheetUrl }),
      });
      const body = await readJsonResponse(res);
      if (!res.ok) throw new Error(body.error || `Server error (HTTP ${res.status})`);
      if (body.session_id) localStorage.setItem('hisaabSessionId', body.session_id);
      lastUploadId = body.persistence?.uploadId || lastUploadId;
      lastSheetSummary = body.sheet_summary || body;
      renderSheetSummary(lastSheetSummary);
      alignDataPanelToSheetSlot();
      if (isAnalysisScreenGated()) {
        // Analysis screen: newly parsed data is shown but stays PENDING —
        // it does not become active until "Apply to analysis" is clicked.
        showApplyDataCta();
      } else {
        // Home screen (or no result on screen yet): no gate, promote
        // immediately so the very next question uses this data.
        hideApplyDataCta();
        applyPendingDataset();
      }
    } catch (err) {
      lastSheetSummary = null;
      detectedHeadline.textContent = 'I could not read that sheet yet.';
      detectedBody.textContent = err.message;
      capabilityList.hidden = true;
      capabilityList.innerHTML = '';
      detectedCaveat.hidden = true;
      detectedDetails.innerHTML = '';
      hideApplyDataCta();
      alignDataPanelToSheetSlot();
      updateAwayFromLandingState();
    }
  }

  function renderSheetSummary(summary) {
    const months = Number(summary.months) || 0;
    detectedHeadline.textContent = months
      ? `Got it — ${months} month${months === 1 ? '' : 's'} of your orders.`
      : 'Got it — I found rows, but not monthly order history yet.';
    detectedBody.textContent = summary.body_line || 'I found your sheet, but need clearer order columns before calculating.';
    renderCapabilities(summary.capability_map);

    if (summary.caveat_line) {
      detectedCaveat.innerHTML = `<b>Heads up:</b> ${escapeHtml(summary.caveat_line)}`;
      detectedCaveat.hidden = false;
    } else {
      detectedCaveat.hidden = true;
    }

    detectedDetails.classList.remove('open');
    detectedToggle.textContent = 'See what I read from your sheet ↓';
    detectedDetails.innerHTML = (summary.details || [])
      .map(item => `<div>· ${escapeHtml(item)}</div>`)
      .join('');
    detectedToggle.hidden = !(summary.details || []).length;
  }

  // SINGLE SOURCE OF TRUTH for naming the currently-active dataset. This is
  // the exact same activeDataset state (and the exact same
  // dataLabelFromSource() helper) that drives the top-of-result
  // "Using sample order history.../Using your sheet..." label — no separate
  // guess, no second code path that could disagree with it. No LLM call is
  // involved: this is plain conditional logic over deterministic client
  // state.
  function activeDatasetDisplayName() {
    if (activeDataset.kind === 'sample') return 'sample data';
    return dataLabelFromSource(null);
  }

  function showApplyDataCta() {
    applyDataBtn.hidden = false;
    applyDataBtn.disabled = false;
    applyDataBtn.textContent = 'Apply to analysis';
    pendingDataNoteText.textContent = `New data detected — not used yet. You're still using ${activeDatasetDisplayName()} until you apply this.`;
    pendingDataNote.hidden = false;
  }

  function hideApplyDataCta() {
    applyDataBtn.hidden = true;
    applyDataBtn.disabled = false;
    applyDataBtn.textContent = 'Apply to analysis';
    pendingDataNote.hidden = true;
  }

  function alignDataPanelToSheetSlot() {
    if (!dataDetected.classList.contains('show')) {
      dataDetected.classList.remove('stacked');
      dataDetected.style.removeProperty('--data-panel-top');
      dataDetected.style.removeProperty('--data-panel-left');
      dataDetected.style.removeProperty('--data-panel-width');
      return;
    }

    const isCompact = window.matchMedia('(max-width: 980px)').matches;
    if (isCompact) {
      dataDetected.classList.add('stacked');
      dataDetected.style.removeProperty('--data-panel-top');
      dataDetected.style.removeProperty('--data-panel-left');
      dataDetected.style.removeProperty('--data-panel-width');
      return;
    }

    // Dock relative to the RIGHT EDGE OF THE MAIN CONTENT COLUMN, not the
    // raw viewport edge and not the sheet input itself. `.stage` spans the
    // full viewport width, but its actual content (composer, results, etc.)
    // is a centered column capped at max-width:720px — anchoring to the
    // viewport edge left a large, inconsistent gap between that column and
    // the panel on wide windows. Anchoring to the input itself was the
    // earlier bug (see git history): a wide column left "no room" beside it
    // and forced an unwanted full-width stacked fallback. Anchoring to the
    // column's own bounding box gives a small, constant gap that looks
    // attached to the content regardless of window width.
    const isInline = stage.classList.contains('connecting-data') && sheetSlot.parentElement === inlineDataMount;
    const panelWidth = isInline ? 300 : 360;
    const columnGap = 20;
    const viewportMargin = 24;

    // On the analysis screen the visible column is the results card; on the
    // home screen it's the composer. Both are centered, max-width:720px
    // elements — whichever is actually on screen defines "the column".
    const columnEl = isInline ? resultsSection : composer;
    const columnRect = columnEl.getBoundingClientRect();
    const slotRect = sheetSlot.getBoundingClientRect();

    dataDetected.classList.remove('stacked');
    const top = Math.max(92, Math.round(slotRect.top));
    let left = Math.round(columnRect.right + columnGap);
    // Clamp so the panel never runs off the right edge of the viewport on
    // narrower-but-not-quite-compact windows.
    left = Math.min(left, window.innerWidth - panelWidth - viewportMargin);
    dataDetected.style.setProperty('--data-panel-top', `${top}px`);
    dataDetected.style.setProperty('--data-panel-left', `${left}px`);
    dataDetected.style.setProperty('--data-panel-width', `${panelWidth}px`);
  }

  function renderCapabilities(capabilityMap) {
    const capabilities = capabilityMap?.capabilities || [];
    if (!capabilities.length) {
      capabilityList.hidden = true;
      capabilityList.innerHTML = '';
      return;
    }

    capabilityList.innerHTML = capabilities
      .map(item => `
        <div class="capability-item ${escapeHtml(item.status)}">
          <span class="capability-dot"></span>
          <span class="capability-text">
            <span class="capability-label">${escapeHtml(item.label)}</span>
            <span class="capability-reason">${escapeHtml(capabilityStatusText(item))}</span>
          </span>
        </div>
      `)
      .join('');
    capabilityList.hidden = false;
  }

  function capabilityStatusText(item) {
    if (item.status === 'ready') return 'Ready';
    if (item.status === 'limited') return `Limited · ${item.reason || 'needs more signal'}`;
    return `Missing · ${item.reason || 'needs another column'}`;
  }

  async function runSimulation(options = {}) {
    // Reentrancy guard: if a /api/simulate call is already in flight (from
    // ANY entry point — main composer, refine composer, missing-fields
    // resubmit, or "Apply to analysis", which shares this same flag), a
    // second trigger is a hard no-op. It does not queue, does not fire a
    // second request, and does not render a second result.
    if (requestInFlight) return;
    const question = String(options.questionOverride || questionInput.value).trim();
    if (!options.skipValidation && !isSpecificQuestion(question)) {
      hideResults();
      hideMissingInputs();
      hideError();
      showValidationNudge();
      (options.isRefine ? refineQuestion : questionInput).focus();
      updateAwayFromLandingState();
      return;
    }

    const startTime = Date.now();
    lastQuestion = question;
    setLoading(true, options.isRefine);
    if (!options.isRefine) {
      trajectoryItems = [];
      renderTrajectory();
      refineInline.hidden = true;
    }
    hideResults({ keepTrajectory: options.isRefine });
    hideMissingInputs();
    hideError();
    hideValidationNudge();

    try {
      detectedHeadline.textContent = 'Updating this analysis with your data...';
      detectedBody.textContent = 'Keeping the current result on screen while I recalculate it.';
      const res = await fetch('/api/simulate', {
        method: 'POST',
        headers: apiHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({
          sessionId: getSessionId(),
          question,
          uploadId: lastUploadId,
          // Every entry point (main composer, refine composer, missing-fields
          // resubmit) goes through getActiveDatasetPayload() — this is what
          // makes it impossible for pending/unapplied data on the analysis
          // screen to leak into an answer, no matter which button triggered it.
          ...getActiveDatasetPayload(),
          manual_inputs: manualInputs,
        }),
      });
      const body = await readJsonResponse(res);

      if (!res.ok) {
        throw new Error(body.error || `Server error (HTTP ${res.status})`);
      }
      if (body.status === 'needs_input') {
        if (body.session_id) localStorage.setItem('hisaabSessionId', body.session_id);
        if (body.sheet_summary) renderSheetSummary(body.sheet_summary);
        showMissingInputs(body);
        updateAwayFromLandingState();
        return;
      }

      renderResults(body, Date.now() - startTime, { append: options.isRefine });
    } catch (err) {
      dataDetected.classList.add('show');
      detectedHeadline.textContent = 'I could not update this analysis yet.';
      detectedBody.textContent = err.message;
    } finally {
      setLoading(false, options.isRefine);
      updateAwayFromLandingState();
    }
  }

  function isSpecificQuestion(question) {
    return question.length >= 12 && (decisionVocabulary.test(question) || subjectVocabulary.test(question));
  }

  function renderResults(data, elapsed, options = {}) {
    const computed = data.computed || data;
    const generated = data.generated || data;
    const value = finiteNumber(computed.outcome_value);
    const low = finiteNumber(computed.range_low);
    const high = finiteNumber(computed.range_high);
    const conf = Number.isFinite(Number(computed.confidence)) ? Math.max(0, Math.min(1, Number(computed.confidence))) : null;
    const pct = conf === null ? null : Math.round(conf * 100);
    const isWeak = pct === null || pct < 35 || Boolean(computed.low_signal_warning);
    if (data.session_id) localStorage.setItem('hisaabSessionId', data.session_id);
    lastSimulationPersistence = data.persistence || null;
    activeResultId = crypto.randomUUID ? crypto.randomUUID() : `result-${Date.now()}-${Math.random().toString(16).slice(2)}`;

    drawSparkline(data.chart_series || data.series || [], isWeak);

    metricValue.textContent = value === null ? 'Unknown' : formatPct(value);
    metricValue.className = `num ${isWeak || value === null ? 'weak' : value >= 0 ? 'good' : 'bad'}`;
    metricLabel.textContent = generated.outcome_metric_label || data.outcome_metric_label || plainMetricLabel(computed.outcome_metric);

    const rev = finiteNumber(computed.monthly_revenue_impact);
    if (rev !== null && rev !== 0) {
      revenueValue.textContent = formatMoney(rev);
      revenueValue.className = `v ${rev >= 0 ? 'good' : 'bad'}`;
      revenueImpact.hidden = false;
    } else {
      revenueImpact.hidden = true;
    }

    const worst = finiteNumber(computed.worst_case_revenue_impact);
    if (worst !== null && worst !== 0) {
      downsideValue.textContent = formatMoney(worst);
      downsideValue.className = `v ${worst >= 0 ? 'good' : 'bad'}`;
      downsideCard.hidden = false;
    } else {
      downsideCard.hidden = true;
    }

    const trend = finiteNumber(computed.trend_pct);
    if (trend !== null && Math.abs(trend) > 1) {
      trendArrow.textContent = trend > 0 ? '↑' : '↓';
      trendText.textContent = `${Math.abs(trend).toFixed(1)}%`;
      trendChip.hidden = false;
    } else {
      trendChip.hidden = true;
    }

    confidenceBlock.classList.toggle('weak', isWeak);
    confidenceBadge.classList.toggle('weak', isWeak);
    confidenceLabel.textContent = pct === null ? 'Confidence unknown' : `${isWeak ? 'Low' : pct >= 70 ? 'High' : 'Medium'} confidence`;
    confidencePct.textContent = pct === null ? '' : `· ${pct}%`;
    rangeLine.textContent = rangeText(low, high, value, isWeak);
    lowSignalWarning.textContent = computed.low_signal_warning || '';
    lowSignalWarning.hidden = !computed.low_signal_warning;
    lowConfidenceActions.hidden = !isWeak;
    // This is a SEPARATE, distinctly-styled notice from lowSignalWarning
    // above. lowSignalWarning means "the regression genuinely ran and the
    // relationship is weak" (a data-quality fact, computed server-side
    // independent of Gemini). aiWordingNote means "the AI wording layer
    // specifically failed/was skipped" (an infrastructure fact) — the
    // computed numbers are still real either way. They must never be
    // conflated or shown with the same styling/wording.
    const wordingSource = generated.source || '';
    const aiWordingFailed = wordingSource.startsWith('server_fallback_after_gemini') || wordingSource === 'server_fallback_after_unexpected_error';
    aiWordingNote.hidden = !aiWordingFailed;
    renderConnectedDataState(data.data_source);

    const chartMeta = data.chart_meta || {};
    chartLabel.textContent = chartMeta.label || `Orders · ${data.summary?.months || 'recent'} months`;
    chartStart.textContent = chartMeta.start_label || 'Earlier';
    chartEnd.textContent = chartMeta.end_label || 'Now';
    chartCaption.innerHTML = chartSummary(isWeak, low, high, value);

    recommendText.textContent = generated.recommendation || 'No recommendation available.';
    whyText.textContent = generated.why || '';
    setDataSource(data.data_source);
    if (data.sheet_summary) {
      lastSheetSummary = data.sheet_summary;
      renderSheetSummary(data.sheet_summary);
    }
    lastRefinement = generateRefinement(lastQuestion);
    refineLink.textContent = lastRefinement;
    refineRow.hidden = !lastRefinement;
    intentPrompt.classList.remove('show', 'captured');
    window.clearTimeout(intentPromptTimer);
    intentPromptTimer = window.setTimeout(() => intentPrompt.classList.add('show'), 900);

    stage.classList.add('has-result');
    resultsSection.hidden = false;
    resultsSection.classList.add('show');
    refineInline.hidden = true;
    currentResult = makeResultSnapshot(data, elapsed, {
      id: activeResultId,
      question: lastQuestion,
      refinement: lastRefinement,
      value,
      isWeak,
    });
    if (!options.keepScroll) {
      resultsSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
    updateAwayFromLandingState();
  }

  function drawSparkline(series, isWeak) {
    const svg = document.getElementById('sparkline');
    const values = (series || []).map(point => Number(point.orders ?? point.value)).filter(Number.isFinite);
    if (values.length < 2) {
      svg.innerHTML = '';
      return;
    }
    const min = Math.min(...values);
    const max = Math.max(...values);
    const spread = max - min || 1;
    const pts = values.map((v, i) => {
      const x = (i / (values.length - 1)) * 300;
      const y = 58 - ((v - min) / spread) * 52;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(' ');
    const stroke = isWeak ? '#B8C1D6' : 'var(--accent)';
    svg.innerHTML = `<polyline points="${pts}" fill="none" stroke="${stroke}" stroke-width="1.8" stroke-linejoin="round"/>`;
  }

  function makeResultSnapshot(data, elapsed, meta) {
    const computed = data.computed || data;
    const generated = data.generated || data;
    const confidence = Number.isFinite(Number(computed.confidence)) ? Number(computed.confidence) : null;
    return {
      id: meta.id,
      question: meta.question,
      askedAt: new Date().toISOString(),
      elapsed,
      data,
      computed,
      generated,
      persistence: data.persistence || null,
      value: meta.value,
      isWeak: meta.isWeak,
      refinement: meta.refinement,
      dataSourceKind: sourceKind(data.data_source),
      // Recorded from activeDataset (what was actually sent for this
      // specific call via getActiveDatasetPayload()), not from whatever
      // happens to be sitting in the composer inputs right now — those may
      // have already changed to a different pending dataset by the time
      // this snapshot is read later (e.g. when saving a decision).
      sheetUrl: activeDataset.kind === 'sheet' ? activeDataset.sheetUrl : '',
      predictedValue: finiteNumber(computed.outcome_value),
      predictedMetric: computed.outcome_metric || data.outcome_metric || '',
      predictedRange: {
        low: finiteNumber(computed.range_low),
        high: finiteNumber(computed.range_high),
      },
      confidence,
    };
  }

  function resultSummaryHtml(snapshot) {
    const valueClass = snapshot.isWeak || snapshot.value === null ? 'weak' : snapshot.value >= 0 ? 'good' : 'bad';
    return `
      <div class="traj-row-content">
        <span class="traj-q">${escapeHtml(snapshot.question)}</span>
        <span class="traj-a ${valueClass}">${escapeHtml(formatPct(snapshot.value))}</span>
      </div>
    `;
  }

  function beginRefinement(snapshot, refinedText) {
    if (!trajectoryItems.some(item => item.id === snapshot.id)) {
      trajectoryItems.push({ ...snapshot, expanded: false });
    }
    renderTrajectory();
    resultsSection.hidden = true;
    resultsSection.classList.remove('show');
    intentPrompt.classList.remove('show', 'captured');
    window.clearTimeout(intentPromptTimer);
    refineQuestion.value = refinedText;
    resizeRefineQuestion();
    refineInline.hidden = false;
    stage.classList.add('has-result');
    window.setTimeout(() => refineQuestion.focus(), 0);
    updateAwayFromLandingState();
  }

  async function submitRefinement() {
    const question = refineQuestion.value.trim();
    if (!question) return;
    await runSimulation({ questionOverride: question, isRefine: true });
  }

  function renderTrajectory() {
    trajectory.innerHTML = '';
    trajectory.hidden = trajectoryItems.length === 0;
    if (!trajectoryItems.length) return;

    const earlier = trajectoryItems.slice(0, Math.max(0, trajectoryItems.length - 3));
    const visible = trajectoryItems.slice(Math.max(0, trajectoryItems.length - 3));

    if (earlier.length) {
      const entry = document.createElement('div');
      entry.className = 'traj-entry';
      const btn = document.createElement('button');
      btn.className = 'traj-earlier';
      btn.type = 'button';
      btn.textContent = `+${earlier.length} earlier question${earlier.length === 1 ? '' : 's'}`;
      const expanded = earlier.some(item => item.earlierExpanded);
      btn.addEventListener('click', () => {
        const next = !expanded;
        earlier.forEach(item => { item.earlierExpanded = next; });
        renderTrajectory();
      });
      entry.appendChild(btn);
      if (expanded) {
        const earlierList = document.createElement('div');
        earlierList.className = 'traj-earlier-list';
        earlier.forEach(item => earlierList.appendChild(createTrajectoryEntry(item)));
        entry.appendChild(earlierList);
      }
      trajectory.appendChild(entry);
    }

    visible.forEach(item => trajectory.appendChild(createTrajectoryEntry(item)));
  }

  function createTrajectoryEntry(item) {
    const wrapper = document.createElement('div');
    wrapper.className = 'traj-entry';
    const row = document.createElement('button');
    row.className = 'traj-row';
    row.type = 'button';
    const q = document.createElement('span');
    q.className = 'traj-q';
    q.textContent = item.question;
    const a = document.createElement('span');
    a.className = `traj-a ${item.isWeak || item.value === null ? 'weak' : item.value >= 0 ? 'good' : 'bad'}`;
    a.textContent = formatPct(item.value);
    row.append(q, a);
    row.addEventListener('click', () => {
      item.expanded = !item.expanded;
      renderTrajectory();
    });
    wrapper.appendChild(row);
    if (item.expanded) {
      const expanded = document.createElement('div');
      expanded.className = 'traj-expanded';
      expanded.innerHTML = renderResultCardHtml(item, { compact: true });
      wrapper.appendChild(expanded);
    }
    return wrapper;
  }

  function renderResultCardHtml(snapshot) {
    const computed = snapshot.computed || {};
    const generated = snapshot.generated || {};
    const value = finiteNumber(computed.outcome_value);
    const valueClass = snapshot.isWeak || value === null ? 'weak' : value >= 0 ? 'good' : 'bad';
    return `
      <div class="evidence">
        <div class="ev-left">
          <div class="num ${valueClass}">${escapeHtml(formatPct(value))}</div>
          <div class="num-label">${escapeHtml(generated.outcome_metric_label || plainMetricLabel(computed.outcome_metric))}</div>
        </div>
        <div class="ev-right">
          <div class="chart-caption">${escapeHtml(rangeText(finiteNumber(computed.range_low), finiteNumber(computed.range_high), value, snapshot.isWeak))}</div>
        </div>
      </div>
      <div class="conf ${snapshot.isWeak ? 'weak' : ''}">
        <div class="conf-badge ${snapshot.isWeak ? 'weak' : ''}"><span class="dot"></span>${escapeHtml(confidenceText(computed.confidence))}</div>
      </div>
      <div class="explain">
        <div class="tag">What this means</div>
        <p class="rec">${escapeHtml(generated.recommendation || 'No recommendation available.')}</p>
        <p class="why">${escapeHtml(generated.why || '')}</p>
      </div>
    `;
  }

  async function captureIntent(intent) {
    if (!currentResult) return;
    activeIntent = intent;
    intentError.hidden = true;
    viewInLog.hidden = true;
    document.querySelectorAll('.intent-btn').forEach(btn => { btn.disabled = true; });
    try {
      const [decisionRes] = await Promise.all([
        fetch('/api/decisions', {
          method: 'POST',
          headers: apiHeaders({ 'Content-Type': 'application/json' }),
          body: JSON.stringify(decisionPayload(currentResult, intent)),
        }),
        fetch('/api/feedback', {
          method: 'POST',
          headers: apiHeaders({ 'Content-Type': 'application/json' }),
          body: JSON.stringify({
            sessionId: getSessionId(),
            intent,
            simulationId: currentResult.persistence?.simulationId || null,
            questionId: currentResult.persistence?.questionId || null,
          }),
        }).catch(() => null),
      ]);
      const saved = await readJsonResponse(decisionRes);
      if (!decisionRes.ok) throw new Error(saved.error || `Server error (HTTP ${decisionRes.status})`);
      const wasKnown = savedDecisions.some(item => item.id === saved.id);
      savedDecisions = [saved, ...savedDecisions.filter(item => item.id !== saved.id)];
      decisionsCountValue = wasKnown ? decisionsCountValue : decisionsCountValue + 1;
      renderDecisionCount(decisionsCountValue || 1);
      intentPrompt.classList.add('captured');
      if (intent === 'applied') {
        intentMsg.textContent = "Saved · noted you'll try it.";
        intentSub.textContent = 'Hisaab will check the outcome next month.';
      } else if (intent === 'skipped') {
        intentMsg.textContent = "Saved · noted you're not trying it.";
        intentSub.textContent = 'You can revisit this later.';
      } else {
        intentMsg.textContent = "Saved · we'll ask again later.";
        intentSub.textContent = '';
      }
      viewInLog.hidden = false;
    } catch (err) {
      intentPrompt.classList.remove('captured');
      intentError.hidden = false;
      intentError.querySelector('span').textContent = err.message || "Couldn't save that — try again?";
    } finally {
      document.querySelectorAll('.intent-btn').forEach(btn => { btn.disabled = false; });
    }
  }

  function decisionPayload(snapshot, intent) {
    return {
      sessionId: getSessionId(),
      simulationId: snapshot.persistence?.simulationId || null,
      questionId: snapshot.persistence?.questionId || null,
      question: snapshot.question,
      predictedValue: snapshot.predictedValue,
      predictedMetric: snapshot.predictedMetric,
      predictedRange: snapshot.predictedRange,
      confidence: snapshot.confidence,
      dataSource: snapshot.dataSourceKind,
      sheetUrl: snapshot.sheetUrl,
      status: intent,
      askedAt: snapshot.askedAt,
      intentSetAt: new Date().toISOString(),
      actualValue: null,
    };
  }

  async function fetchDecisionsCount() {
    try {
      const res = await fetch('/api/decisions?countOnly=true', { headers: apiHeaders() });
      const body = await readJsonResponse(res);
      if (!res.ok) throw new Error(body.error || `Server error (HTTP ${res.status})`);
      decisionsCountValue = Number(body.count) || 0;
      renderDecisionCount(decisionsCountValue);
    } catch (_err) {
      renderDecisionCount(0);
    }
  }

  function renderDecisionCount(count) {
    decisionCount.textContent = String(count);
    openDecisions.hidden = count <= 0;
    updateAwayFromLandingState();
  }

  async function openDecisionLog() {
    hideError();
    stage.classList.add('has-log');
    decisionLog.hidden = false;
    updateAwayFromLandingState();
    decisionList.innerHTML = '<div class="log-empty-note">Loading your decisions...</div>';
    try {
      const [decisionsRes, trackRes] = await Promise.all([
        fetch('/api/decisions', { headers: apiHeaders() }),
        fetch('/api/decisions/track-record', { headers: apiHeaders() }),
      ]);
      const decisionsBody = await readJsonResponse(decisionsRes);
      const trackBody = await readJsonResponse(trackRes);
      if (!decisionsRes.ok) throw new Error(decisionsBody.error || `Server error (HTTP ${decisionsRes.status})`);
      savedDecisions = decisionsBody.decisions || [];
      decisionsCountValue = Number(decisionsBody.count) || savedDecisions.length;
      renderDecisionCount(decisionsCountValue);
      renderTrackRecord(trackBody);
      renderDecisionList(savedDecisions);
    } catch (err) {
      decisionList.innerHTML = `<div class="log-empty-note">${escapeHtml(err.message)}</div>`;
    }
  }

  function closeDecisionLog() {
    stage.classList.remove('has-log');
    decisionLog.hidden = true;
    updateAwayFromLandingState();
  }

  function renderTrackRecord(track) {
    const count = Number(track?.matchedCount) || 0;
    if (!count) {
      trackRecord.hidden = true;
      decisionLogSub.textContent = "This is where your saved decisions live. When you tell me what actually happened, I'll compare it with what I predicted.";
      return;
    }
    const avg = Number(track.averageAbsoluteDifference).toFixed(1);
    trackRecord.hidden = false;
    decisionLogSub.textContent = 'Every prediction Hisaab has made for you, and what actually happened after.';
    trackRecordText.innerHTML = `<span class="num-hi">${count} outcome${count === 1 ? '' : 's'} recorded</span> — Hisaab's predictions were off by an average of <span class="num-hi">${avg} pp</span>.`;
  }

  function renderDecisionList(decisions) {
    if (!decisions.length) {
      decisionList.innerHTML = '<div class="log-empty-note">This is where your saved decisions live. When you tell me what actually happened, I\'ll compare it with what I predicted.</div>';
      return;
    }
    decisionList.innerHTML = decisions.map(decision => decisionCardHtml(decision)).join('');
    decisionList.querySelectorAll('[data-compare-id]').forEach(btn => {
      btn.addEventListener('click', () => compareDecision(btn.dataset.compareId));
    });
    decisionList.querySelectorAll('[data-manual-id]').forEach(form => {
      form.addEventListener('submit', event => submitManualOutcome(event, form.dataset.manualId));
    });
  }

  function decisionCardHtml(decision) {
    const status = decision.status || 'pending';
    const valueClass = Number(decision.predictedValue) >= 0 ? 'good' : 'bad';
    const hasActual = decision.actualValue !== null && decision.actualValue !== undefined;
    return `
      <div class="dl-card" id="decision-${escapeHtml(decision.id)}">
        <div class="top-row">
          <div class="q">${escapeHtml(decision.question)}</div>
          <div class="when">${escapeHtml(relativeDate(decision.askedAt))}</div>
        </div>
        <div class="status-row">
          <span class="status-badge status-${escapeHtml(status)}">${escapeHtml(statusLabel(status, hasActual))}</span>
          <span class="intent-tag">· ${escapeHtml(intentTag(status))}</span>
        </div>
        <div class="dl-pred">Predicted <span class="num ${valueClass}">${escapeHtml(formatPct(decision.predictedValue))}</span> ${escapeHtml(plainMetricLabel(decision.predictedMetric))} · <b>${escapeHtml(confidenceText(decision.confidence))}</b></div>
        ${hasActual ? comparisonHtml(decision, false) : decisionActionHtml(decision)}
      </div>
    `;
  }

  function decisionActionHtml(decision) {
    if (decision.status === 'applied' && decision.dataSource === 'sheet' && decision.sheetUrl && decision.compareEligible) {
      return `
        <div class="dl-actions">
          <div class="new-data-cta">
            <div class="msg">Ready to compare with the latest sheet data?</div>
            <button data-compare-id="${escapeHtml(decision.id)}" type="button">Compare with actual</button>
          </div>
        </div>
      `;
    }
    if (decision.status === 'applied' && decision.dataSource === 'sample') {
      return `
        <form class="manual-outcome" data-manual-id="${escapeHtml(decision.id)}">
          <span>What actually happened?</span>
          <select name="direction" aria-label="Direction">
            <option value="up">Up</option>
            <option value="down">Down</option>
            <option value="flat">Flat</option>
          </select>
          <input name="magnitude" type="number" step="0.1" min="0" placeholder="Rough %" aria-label="Rough magnitude">
          <button type="submit">Save outcome</button>
        </form>
      `;
    }
    return '';
  }

  async function compareDecision(id) {
    const card = document.getElementById(`decision-${CSS.escape(id)}`);
    const actions = card.querySelector('.dl-actions');
    actions.innerHTML = '<div class="compare-loading"><div class="spinner"></div><div class="txt">Comparing with your sheet...</div></div>';
    try {
      const res = await fetch(`/api/decisions/${encodeURIComponent(id)}/compare`, {
        method: 'POST',
        headers: apiHeaders({ 'Content-Type': 'application/json' }),
      });
      const body = await readJsonResponse(res);
      if (!res.ok) {
        if (res.status === 409) {
          actions.innerHTML = '<div class="log-empty-note">No new data since you saved this — check back once your sheet has a new month of orders.</div>';
          return;
        }
        throw new Error(body.error || `Server error (HTTP ${res.status})`);
      }
      const decision = savedDecisions.find(item => item.id === id) || {};
      actions.outerHTML = comparisonHtml({ ...decision, ...body, actualValue: body.actualValue }, true);
    } catch (err) {
      actions.innerHTML = `<div class="log-empty-note">Couldn't reach your sheet just now — try again? <button data-compare-id="${escapeHtml(id)}" type="button">Retry</button></div>`;
      actions.querySelector('button')?.addEventListener('click', () => compareDecision(id));
    }
  }

  async function submitManualOutcome(event, id) {
    event.preventDefault();
    const form = event.currentTarget;
    const direction = form.elements.direction.value;
    const magnitude = Number(form.elements.magnitude.value || 0);
    const actualValue = direction === 'down' ? -Math.abs(magnitude) : direction === 'flat' ? 0 : Math.abs(magnitude);
    try {
      const res = await fetch(`/api/decisions/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        headers: apiHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ actualValue, actualNote: `Self-reported ${direction}` }),
      });
      const body = await readJsonResponse(res);
      if (!res.ok) throw new Error(body.error || `Server error (HTTP ${res.status})`);
      await openDecisionLog();
    } catch (err) {
      form.innerHTML += `<span class="bad"> ${escapeHtml(err.message)}</span>`;
    }
  }

  function setupSpeech() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      if (navigator.mediaDevices?.getUserMedia && window.MediaRecorder) {
        micBtn.title = 'Record your question';
        return;
      }
      micBtn.title = 'Voice input is not supported in this browser';
      micBtn.setAttribute('aria-disabled', 'true');
      return;
    }
    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    recognition.lang = navigator.language || 'en-IN';
    recognition.onstart = () => {
      recognizing = true;
      micBtn.classList.add('recording');
      micBtn.title = 'Listening...';
      hideError();
    };
    recognition.onresult = e => {
      const transcript = Array.from(e.results)
        .map(result => result[0]?.transcript || '')
        .join('')
        .trim();
      if (!transcript) return;
      questionInput.value = transcript;
      resizeQuestion();
      updateQuestionState();
      hideValidationNudge();
    };
    recognition.onerror = e => {
      const message = speechErrorMessage(e.error);
      recognizing = false;
      micBtn.classList.remove('recording');
      micBtn.title = 'Speak your question in any language';
      if (message) showError(message);
    };
    recognition.onend = () => {
      recognizing = false;
      micBtn.classList.remove('recording');
      micBtn.title = 'Speak your question in any language';
    };
  }

  function toggleSpeech() {
    if (!recognition && navigator.mediaDevices?.getUserMedia && window.MediaRecorder) {
      toggleRecordedSpeech();
      return;
    }
    if (!recognition) {
      showError('Voice input is not supported in this browser.');
      return;
    }
    if (recognizing) {
      recognition.stop();
    } else {
      try {
        recognition.start();
      } catch (_err) {
        recognizing = false;
        micBtn.classList.remove('recording');
        showError('Voice input could not start. Try again, or type your question instead.');
      }
    }
  }

  async function toggleRecordedSpeech() {
    hideError();
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaChunks = [];
      const recorderOptions = preferredRecorderOptions();
      mediaRecorder = recorderOptions ? new MediaRecorder(stream, recorderOptions) : new MediaRecorder(stream);
      mediaRecorder.ondataavailable = event => {
        if (event.data && event.data.size > 0) mediaChunks.push(event.data);
      };
      mediaRecorder.onerror = () => {
        stopRecorderTracks(stream);
        setRecordingState(false);
        showError('Voice recording failed. Try again, or type your question instead.');
      };
      mediaRecorder.onstop = async () => {
        window.clearTimeout(recorderStopTimer);
        stopRecorderTracks(stream);
        setRecordingState(false);
        await transcribeRecording();
      };
      mediaRecorder.start();
      setRecordingState(true);
      recorderStopTimer = window.setTimeout(() => {
        if (mediaRecorder && mediaRecorder.state === 'recording') mediaRecorder.stop();
      }, 10000);
    } catch (err) {
      setRecordingState(false);
      const denied = err && (err.name === 'NotAllowedError' || err.name === 'SecurityError');
      showError(denied ? 'Microphone access is blocked. Open the app at localhost, allow mic access in the browser, then try again.' : 'Could not start the microphone. Check your input device and try again.');
    }
  }

  function preferredRecorderOptions() {
    const options = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4'];
    const mimeType = options.find(type => MediaRecorder.isTypeSupported(type));
    return mimeType ? { mimeType } : undefined;
  }

  function setRecordingState(isRecording) {
    recognizing = isRecording;
    micBtn.classList.toggle('recording', isRecording);
    micBtn.title = isRecording ? 'Recording... tap to stop' : 'Record your question';
  }

  function stopRecorderTracks(stream) {
    stream.getTracks().forEach(track => track.stop());
  }

  async function transcribeRecording() {
    if (!mediaChunks.length) {
      showError('I did not catch anything. Tap the mic and try speaking again.');
      return;
    }

    const blob = new Blob(mediaChunks, { type: mediaChunks[0].type || 'audio/webm' });
    const audioBase64 = await blobToBase64(blob);
    micBtn.disabled = true;
    micBtn.title = 'Transcribing...';

    try {
      const res = await fetch('/api/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          audioBase64,
          mimeType: blob.type || 'audio/webm',
        }),
      });
      const body = await readJsonResponse(res);
      if (!res.ok) throw new Error(body.error || `Server error (HTTP ${res.status})`);
      questionInput.value = body.transcript || '';
      resizeQuestion();
      updateQuestionState();
      hideValidationNudge();
      questionInput.focus();
    } catch (err) {
      showError(err.message);
    } finally {
      micBtn.disabled = false;
      micBtn.title = 'Record your question';
      mediaChunks = [];
    }
  }

  function blobToBase64(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(String(reader.result || '').split(',')[1] || '');
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  function speechErrorMessage(error) {
    if (error === 'no-speech') return 'I did not catch anything. Tap the mic and try speaking again.';
    if (error === 'not-allowed' || error === 'service-not-allowed') return 'Microphone access is blocked. Open the app at localhost, allow mic access in the browser, then try again.';
    if (error === 'audio-capture') return 'No microphone was found. Check your input device and try again.';
    if (error === 'network') return 'Voice recognition needs a working browser speech service connection.';
    return error ? `Voice input stopped: ${error}.` : '';
  }

  function readJsonResponse(res) {
    return res.text().then(text => {
      if (!text.trim()) throw new Error('The server returned an empty response.');
      try {
        return JSON.parse(text);
      } catch (_err) {
        throw new Error('The server returned an invalid response. Check server logs for details.');
      }
    });
  }

  function resizeQuestion() {
    questionInput.style.height = 'auto';
    questionInput.style.height = Math.min(questionInput.scrollHeight, 200) + 'px';
  }

  function resizeRefineQuestion() {
    refineQuestion.style.height = 'auto';
    refineQuestion.style.height = Math.min(refineQuestion.scrollHeight, 120) + 'px';
  }

  function updateQuestionState() {
    simulateBtn.classList.toggle('ready', questionInput.value.trim().length > 0);
  }

  function updateNavScrollState() {
    document.body.classList.toggle('nav-scrolled', window.scrollY > 8);
  }

  function isAnalysisPage() {
    return stage.classList.contains('has-result')
      && !stage.classList.contains('has-log')
      && !resultsSection.hidden;
  }

  function updateAwayFromLandingState() {
    const inAnalysis = isAnalysisPage();
    newQuestion.hidden = !inAnalysis;
    brandReset.classList.toggle('is-resettable', inAnalysis);
    brandReset.setAttribute('aria-disabled', inAnalysis ? 'false' : 'true');
    brandReset.tabIndex = inAnalysis ? 0 : -1;
  }

  function resetToComposer() {
    restoreDataConnectorToHome();
    hideResults();
    hideMissingInputs();
    hideValidationNudge();
    hideError();
    stopIntro();
    stage.scrollIntoView({ behavior: 'smooth', block: 'start' });
    updateAwayFromLandingState();
  }

  function restoreDataConnectorToHome() {
    if (dataDetected.parentElement !== stage) stage.insertBefore(dataDetected, composer);
    if (sheetSlot.parentElement !== stage) stage.insertBefore(sheetSlot, dataDetected);
    if (missingSection.parentElement !== stage) stage.insertBefore(missingSection, errorBanner);
  }

  function openInlineDataConnector() {
    if (!currentResult) {
      resetToComposer();
      setPath('real');
      sheetUrlInput.focus();
      return;
    }
    hideError();
    stage.classList.add('connecting-data');
    inlineDataMount.append(sheetSlot, dataDetected);
    setPath('real');
    window.requestAnimationFrame(alignDataPanelToSheetSlot);
    window.setTimeout(() => {
      sheetUrlInput.focus();
      alignDataPanelToSheetSlot();
    }, 0);
    inlineDataMount.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    updateAwayFromLandingState();
  }

  async function refreshAnalysisWithConnectedData() {
    if (!currentResult) return;
    // Shares the SAME global lock as runSimulation() — an "Apply to
    // analysis" recompute is still an /api/simulate call, and must not be
    // allowed to overlap with a main-composer or refine-composer submit,
    // or vice versa.
    if (requestInFlight) return;
    requestInFlight = true;
    setSubmissionLocked(true);
    const question = currentResult.question;
    const startTime = Date.now();
    lowConfidenceActions.classList.add('refreshing-data');
    addRealDataBtn.disabled = true;
    addRealDataBtn.textContent = 'Updating analysis...';
    tryDifferentBtn.disabled = true;
    applyDataBtn.disabled = true;
    applyDataBtn.textContent = 'Applying...';
    hideError();
    let applied = false;
    // This IS the explicit "Apply to analysis" click — the one and only
    // moment on the analysis screen where pending data is allowed to become
    // active. Every /api/simulate call below reads it back out through
    // getActiveDatasetPayload(), same as every other entry point.
    applyPendingDataset();
    try {
      const res = await fetch('/api/simulate', {
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
      const body = await readJsonResponse(res);
      if (!res.ok) throw new Error(body.error || `Server error (HTTP ${res.status})`);
      if (body.status === 'needs_input') {
        if (body.session_id) localStorage.setItem('hisaabSessionId', body.session_id);
        if (body.sheet_summary) renderSheetSummary(body.sheet_summary);
        renderConnectedDataState(body.data_source);
        setDataSource(body.data_source);
        inlineDataMount.append(missingSection);
        showMissingInputs(body);
        applied = true;
        return;
      }
      hideMissingInputs();
      lastQuestion = question;
      renderResults(body, Date.now() - startTime, { keepScroll: true });
      stage.classList.remove('connecting-data');
      restoreDataConnectorToHome();
      resultsSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      applied = true;
    } catch (err) {
      showError(err.message);
      // The dataset is still applied (the user did click Apply) even though
      // this particular recompute failed — refresh the indicator from
      // activeDataset alone rather than leaving it pointed at the old result.
      renderConnectedDataState(null);
      setDataSource(null);
    } finally {
      lowConfidenceActions.classList.remove('refreshing-data');
      addRealDataBtn.disabled = false;
      tryDifferentBtn.disabled = false;
      if (applied || !stage.classList.contains('connecting-data')) {
        hideApplyDataCta();
      } else {
        showApplyDataCta();
      }
      requestInFlight = false;
      setSubmissionLocked(false);
      updateAwayFromLandingState();
    }
  }

  function resetToLanding() {
    const sessionId = getSessionId();
    const userId = getUserId();
    window.clearTimeout(parseTimer);
    window.clearTimeout(intentPromptTimer);
    manualInputs = {};
    lastSheetSummary = null;
    connectedDataLabel = '';
    lastUploadId = null;
    lastSimulationPersistence = null;
    lastQuestion = '';
    lastRefinement = '';
    currentResult = null;
    trajectoryItems = [];
    activeIntent = null;
    activeResultId = null;
    localStorage.setItem('hisaabSessionId', sessionId);
    localStorage.setItem('hisaabUserId', userId);

    questionInput.value = '';
    sheetUrlInput.value = '';
    refineQuestion.value = '';
    resizeQuestion();
    resizeRefineQuestion();
    updateQuestionState();

    hideResults();
    closeDecisionLog();
    hideMissingInputs();
    hideValidationNudge();
    hideError();
    restoreDataConnectorToHome();
    clearCsvUpload();
    setPath('sample');
    dataDetected.classList.remove('show');
    detectedHeadline.textContent = '';
    detectedBody.textContent = '';
    capabilityList.hidden = true;
    capabilityList.innerHTML = '';
    detectedCaveat.hidden = true;
    detectedDetails.classList.remove('open');
    detectedDetails.innerHTML = '';
    detectedToggle.hidden = false;
    detectedToggle.textContent = 'See what I read from your sheet ↓';
    connectedDataNote.hidden = true;
    connectedDataText.textContent = 'Using this data';
    trajectoryItems = [];
    renderTrajectory();
    refineInline.hidden = true;
    intentPrompt.classList.remove('show', 'captured');
    viewInLog.hidden = true;
    intentError.hidden = true;
    document.querySelectorAll('.intent-btn').forEach(btn => { btn.disabled = false; });

    stage.classList.remove('has-result', 'has-log', 'connecting-data');
    stopIntro();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    updateAwayFromLandingState();
  }

  function setLoading(isLoading, isRefine = false) {
    requestInFlight = isLoading;
    const text = isRefine ? refineBtnText : btnText;
    const loader = isRefine ? refineBtnLoader : btnLoader;
    text.hidden = isLoading;
    loader.hidden = !isLoading;
    (isRefine ? refineInline : composer).classList.toggle('loading', isLoading);
    (isRefine ? refineLoadingStatus : loadingStatus).hidden = !isLoading;
    // Every trigger is locked together, not just the one that started the
    // request — this is what prevents a second click/chip/refine-submit
    // while a request is pending from firing an overlapping second call.
    setSubmissionLocked(isLoading);
  }

  function setSubmissionLocked(locked) {
    simulateBtn.disabled = locked;
    refineSend.disabled = locked;
    missingSubmitBtn.disabled = locked;
    // "Apply to analysis" also triggers /api/simulate (it re-runs the
    // current question against the newly applied dataset) — it must not be
    // clickable while a different trigger's request is already in flight.
    // Only touch it here when it isn't already mid-apply itself (that path
    // manages its own "Applying..." label independently).
    if (!applyDataBtn.hidden) applyDataBtn.disabled = locked;
    document.querySelectorAll('.chip').forEach(btn => { btn.disabled = locked; });
  }

  function hideResults(options = {}) {
    resultsSection.hidden = true;
    resultsSection.classList.remove('show');
    if (!options.keepTrajectory) stage.classList.remove('has-result', 'connecting-data');
    intentPrompt.classList.remove('show', 'captured');
    viewInLog.hidden = true;
    intentError.hidden = true;
    window.clearTimeout(intentPromptTimer);
    updateAwayFromLandingState();
  }

  function hideMissingInputs() {
    missingSection.hidden = true;
    missingSection.classList.remove('show');
    missingFields.innerHTML = '';
    missingSummary.textContent = '';
    updateAwayFromLandingState();
  }

  function showMissingInputs(body) {
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
  }

  function showValidationNudge() {
    validationNudge.hidden = false;
    validationNudge.classList.add('show');
    updateAwayFromLandingState();
  }

  function hideValidationNudge() {
    validationNudge.hidden = true;
    validationNudge.classList.remove('show');
    updateAwayFromLandingState();
  }

  function hideError() {
    errorBanner.hidden = true;
    errorBanner.classList.remove('show');
    errorMsg.textContent = '';
  }

  function showError(msg) {
    errorMsg.textContent = msg;
    errorBanner.hidden = false;
    errorBanner.classList.add('show');
  }

  // NOTE: these two indicators are intentionally driven by activeDataset,
  // never by the live sheetUrlInput/uploadedCsv values. That is what makes
  // it impossible for them to silently reflect data that hasn't been
  // applied yet — they only change inside applyPendingDataset() (home-screen
  // auto-apply, or an explicit "Apply to analysis" click), never merely
  // because the user typed/uploaded something new.
  function setDataSource(source) {
    dataSourceText.textContent = sourceNote(source);
    dataSourceNote.classList.toggle('demo', activeDataset.kind === 'sample');
  }

  function renderConnectedDataState(source) {
    const connected = activeDataset.kind !== 'sample';
    addRealDataBtn.textContent = connected ? 'Update data' : 'Add your real data';
    connectedDataNote.hidden = !connected;
    if (!connected) {
      connectedDataText.textContent = 'Using this data';
      return;
    }
    const label = activeDataset.label || dataLabelFromSource(source);
    connectedDataText.textContent = `Using this data: ${label}`;
  }

  function sourceKind(source) {
    return source && source.mode === 'sheet' ? 'sheet' : 'sample';
  }

  function dataLabelFromSource(source) {
    if (activeDataset.kind === 'csv') return activeDataset.fileName || 'uploaded CSV';
    if (activeDataset.kind === 'sheet') return dataLabelFromSheetUrl(activeDataset.sheetUrl);
    if (source?.csv_used) return uploadedFileName || 'uploaded CSV';
    if (source?.sheet_url_used) return dataLabelFromSheetUrl(sheetUrlInput.value.trim());
    return 'connected data';
  }

  function dataLabelFromSheetUrl(value) {
    if (!value) return 'Google Sheet';
    try {
      const url = new URL(value);
      return url.hostname === 'docs.google.com' ? 'Google Sheet' : url.hostname;
    } catch (_err) {
      return 'connected sheet';
    }
  }

  function sourceNote(source) {
    if (activeDataset.kind === 'sample') return 'Using sample order history — no sheet connected';
    // activeDataset says this is a real sheet/CSV, but we don't have a
    // server response with the full field list yet (e.g. right after a
    // home-screen auto-apply, before the first question is asked).
    if (!source) return 'Using your sheet';
    if (source.warning) return `Sheet note: ${source.warning}`;
    if (source.mode === 'sheet') {
      const fields = realFieldList(source);
      return `Using your sheet${fields ? ` · ${fields}` : ''}`;
    }
    return 'Using your sheet';
  }

  function realFieldList(source) {
    const labels = Object.entries(source.field_sources || {})
      .filter(([, info]) => ['derived', 'derived_manual', 'derived_low_confidence'].includes(info.status))
      .map(([field]) => field.replace(/_/g, ' '));
    return labels.length ? labels.join(', ') : '';
  }

  function chartSummary(isWeak, low, high, value) {
    if (value === null || low === null || high === null) {
      return 'There was not enough reliable history to draw a numeric chart interpretation.';
    }
    if (isWeak || (low < 0 && high > 0)) {
      return `The line moves up and down without a clear enough relationship yet. <b>That's why the ${formatPct(value)} above should be treated carefully.</b>`;
    }
    const direction = value >= 0 ? 'rose' : 'dipped';
    return `The recent order pattern gives the calculation its direction. <b>Orders ${direction} in the months most relevant to this change.</b>`;
  }

  function rangeText(low, high, value, isWeak) {
    if (low === null || high === null) return 'Likely range: unknown — the calculation did not return enough range data.';
    // A range that is flat at (or essentially at) zero on both ends is not
    // "pointing" anywhere — it means the calculation could not produce any
    // directional signal at all (e.g. an unsupported lever, or a lever with
    // no usable variation), not a genuine upward/downward skew. Calling
    // that "mostly points upward" would be a description with no real
    // basis, so it gets its own honest phrase instead of falling into the
    // directional branches below.
    const isFlatZero = Math.abs(low) < 0.05 && Math.abs(high) < 0.05;
    const interpretation = isFlatZero
      ? 'shows no measurable direction from this data.'
      : low < 0 && high > 0
        ? 'crosses zero, so no clear direction.'
        : value !== null && value >= 0
          ? 'mostly points upward.'
          : 'mostly points downward.';
    return `Likely range: ${formatPct(low)} to ${formatPct(high)} — ${isWeak ? interpretation : interpretation}`;
  }

  function generateRefinement(question) {
    const q = String(question || '');
    const percent = q.match(/(\d+(?:\.\d+)?)\s*%/);
    if (percent) {
      const half = Number(percent[1]) / 2;
      return q.replace(percent[0], `${trimNumber(half)}%`).replace(/\bby\s+by\b/i, 'by');
    }

    const money = q.match(/₹\s*(\d+(?:\.\d+)?)/);
    if (money) {
      const half = Number(money[1]) / 2;
      return q.replace(money[0], `₹${trimNumber(half)}`);
    }

    const discount = q.match(/\bdiscount\b|\bpromo(?:tion)?\b/i);
    if (discount) {
      return 'What if I ran a smaller 10% promotion instead?';
    }

    return '';
  }

  function confidenceText(confidence) {
    const value = Number(confidence);
    if (!Number.isFinite(value)) return 'Confidence unknown';
    const pct = Math.round(value * 100);
    return `${pct >= 70 ? 'High' : pct >= 35 ? 'Medium' : 'Low'} confidence · ${pct}%`;
  }

  function relativeDate(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    const days = Math.floor((Date.now() - date.getTime()) / 86400000);
    if (days <= 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 31) return `${days} days ago`;
    const months = Math.floor(days / 30);
    return `${months} month${months === 1 ? '' : 's'} ago`;
  }

  function statusLabel(status, hasActual) {
    if (hasActual) return 'Applied · outcome recorded';
    if (status === 'applied') return 'Applied';
    if (status === 'skipped') return 'Skipped';
    return 'Pending';
  }

  function intentTag(status) {
    if (status === 'applied') return "You said you'll try it";
    if (status === 'skipped') return "You said you're skipping it";
    return 'You were not sure yet';
  }

  function comparisonHtml(decision, fresh) {
    const actualClass = Number(decision.actualValue) >= 0 ? 'good' : 'bad';
    const predictedClass = Number(decision.predictedValue) >= 0 ? 'good' : 'bad';
    const diff = finiteNumber(decision.differencePp ?? (Number(decision.actualValue) - Number(decision.predictedValue)));
    const verdict = decision.verdict || `Off by ${formatPp(Math.abs(diff || 0))}.`;
    return `
      <div class="comparison-wrap">
        ${fresh ? '<div class="fresh-badge"><span class="dot"></span>Just recalculated from your sheet</div>' : ''}
        <div class="dl-comparison">
          <div class="dl-cell"><div class="lbl">Predicted</div><div class="v ${predictedClass}">${escapeHtml(formatPct(decision.predictedValue))}</div></div>
          <div class="dl-arrow">→</div>
          <div class="dl-cell"><div class="lbl">Actually happened</div><div class="v ${actualClass}">${escapeHtml(formatPct(decision.actualValue))}</div></div>
        </div>
        <div class="dl-verdict"><span class="dot"></span>${escapeHtml(verdict)}</div>
      </div>
    `;
  }

  function formatPp(value) {
    const number = Number(value);
    return Number.isFinite(number) ? `${Math.abs(number).toFixed(1)} pp` : 'unknown';
  }

  function finiteNumber(value) {
    // Number(null) is 0 — which IS finite, so without this explicit check
    // a genuinely "we don't know" server value (null) would silently
    // become the number 0 here and render as a fake confident "+0.0%"
    // instead of "Unknown".
    if (value === null || value === undefined || value === '') return null;
    const number = Number(value);
    return Number.isFinite(number) ? number : null;
  }

  function formatPct(n) {
    const value = Number(n);
    if (!Number.isFinite(value)) return 'unknown';
    const sign = value >= 0 ? '+' : '−';
    return sign + Math.abs(value).toFixed(1) + '%';
  }

  function formatMoney(n) {
    const value = Number(n);
    if (!Number.isFinite(value)) return 'unknown';
    const sign = value >= 0 ? '+' : '−';
    // 'en-IN' locale gives correct Indian digit grouping (lakh/crore —
    // e.g. 1,03,000 not 103,000) automatically, no manual grouping logic
    // needed.
    return sign + '₹' + Math.abs(Math.round(value)).toLocaleString('en-IN');
  }

  function trimNumber(value) {
    return Number(value).toFixed(2).replace(/\.?0+$/, '');
  }

  function plainMetricLabel(metric) {
    if (metric === 'repeat_orders') return 'repeat customer orders';
    if (metric === 'orders') return 'total orders';
    return String(metric || 'shop result').replace(/_/g, ' ');
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
})();
