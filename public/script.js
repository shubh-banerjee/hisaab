(function () {
  // ─── i18n ────────────────────────────────────────────────────────────────
  // Two-language dictionary. Kept small on purpose: only user-visible strings
  // that appear on the result flow after a question is answered, plus the top
  // chrome. The landing page stays English (universal entry point) — the
  // response comes back in the user's language, and the surrounding UI follows.
  const I18N = {
    en: {
      'chrome.new_question': 'New question',
      'chrome.your_decisions': 'Your decisions',
      'result.what_this_means': 'What this means',
      'result.confidence.high': 'High confidence',
      'result.confidence.medium': 'Medium confidence',
      'result.confidence.low': 'Low confidence',
      'result.confidence.unknown': 'Confidence unknown',
      'result.intent.applied': "Yes, I'll try it",
      'result.intent.skipped': 'No, skipping',
      'result.intent.pending': 'Not sure yet',
      'result.intent.prompt': 'Are you going to try this?',
      'lowconf.add_data': 'Add your real data',
      'lowconf.try_different': 'Try a different question',
      'lowconf.updating': 'Updating analysis...',
      'lowconf.update_data': 'Update data',
      'data.using_this': 'Using this data',
      'data.using_this_labeled': 'Using this data: {label}',
      'decisions.title': 'Your decisions',
      'evidence.est_change': 'est change',
      'evidence.worst_case': 'worst case',
      'evidence.recent_trend': 'recent trend',
      'evidence.chart_label': 'Orders · recent history',
      'evidence.sample_tag': 'Illustrative sample — not your data',
      'evidence.earlier': 'Earlier',
      'evidence.now': 'Now',
      'data_source.sample': 'Using sample order history — no sheet connected',
      'scenarios.you_asked': 'You asked',
      'scenarios.based_on': 'Based on {months} months of your own history.',
      'scenarios.threshold_label': 'Where safe turns risky',
      'scenarios.see_details': 'Show the numbers behind this',
      'track.see_all': 'See all →',
      'track.within': 'Within {pp} points on {hits} of your last {total} calls.',
      'track.latest': 'Last time we said {predicted}, you got {actual}.',
      'checkback.eyebrow': 'Quick check-in',
      'checkback.did': 'Yes, I did it',
      'checkback.didnt': 'No, I decided not to',
      'checkback.later': 'Not yet — remind me later',
      'checkback.sub': 'Did you make the change? Your answer sharpens every future prediction.',
      'checkback.question': 'A while ago, you decided to try: {question}',
      'checkback.followup_label': 'What happened to your orders after that?',
      'checkback.went_up': 'Went up',
      'checkback.stayed_same': 'Stayed about the same',
      'checkback.went_down': 'Went down',
      'checkback.skip': 'Skip this check-in',
      'checkback.thanks': 'Thanks — saved. This now counts toward your track record.',
      'checkback.thanks_noted': 'Got it — noted that you skipped this one.',
      'path.bootstrap_link': 'Start with a simple daily sales log',
      'bootstrap.eyebrow': 'Building your history',
      'bootstrap.question': 'Roughly how many orders did you get yesterday?',
      'bootstrap.sub': 'No spreadsheet needed — just a rough number, typed or spoken. After a few weeks of this, Hisaab can answer real what-ifs for you.',
      'bootstrap.save': "Save today's number",
      'bootstrap.fee_optional': 'Current delivery fee (optional — helps test fee changes later)',
      'bootstrap.progress': '{count} of ~{total} days logged',
      'bootstrap.ready': "You have enough history now — ask a what-if question below.",
      'bootstrap.saved_today': "Saved. Come back tomorrow and log again — consistency is what makes this work.",
      'bootstrap.already_today': "You've already logged today. Come back tomorrow.",
    },
    hi: {
      'chrome.new_question': 'नया प्रश्न',
      'chrome.your_decisions': 'आपके निर्णय',
      'result.what_this_means': 'इसका क्या अर्थ है',
      'result.confidence.high': 'उच्च आत्मविश्वास',
      'result.confidence.medium': 'मध्यम आत्मविश्वास',
      'result.confidence.low': 'कम आत्मविश्वास',
      'result.confidence.unknown': 'आत्मविश्वास अज्ञात',
      'result.intent.applied': 'हाँ, मैं आजमाऊँगा',
      'result.intent.skipped': 'नहीं, छोड़ रहा हूँ',
      'result.intent.pending': 'अभी पक्का नहीं है',
      'result.intent.prompt': 'क्या आप इसे आजमाने वाले हैं?',
      'lowconf.add_data': 'अपना वास्तविक डेटा जोड़ें',
      'lowconf.try_different': 'कोई दूसरा प्रश्न पूछकर देखें',
      'lowconf.updating': 'विश्लेषण अपडेट हो रहा है...',
      'lowconf.update_data': 'डेटा अपडेट करें',
      'data.using_this': 'इस डेटा का उपयोग हो रहा है',
      'data.using_this_labeled': 'इस डेटा का उपयोग हो रहा है: {label}',
      'decisions.title': 'आपके निर्णय',
      'evidence.est_change': 'अनुमानित बदलाव',
      'evidence.worst_case': 'सबसे खराब स्थिति',
      'evidence.recent_trend': 'हाल की प्रवृत्ति',
      'evidence.chart_label': 'ऑर्डर · हाल का इतिहास',
      'evidence.sample_tag': 'उदाहरण डेटा — आपका डेटा नहीं',
      'evidence.earlier': 'पहले',
      'evidence.now': 'अभी',
      'data_source.sample': 'नमूना ऑर्डर इतिहास का उपयोग — कोई शीट कनेक्ट नहीं है',
      'scenarios.you_asked': 'आपने पूछा',
      'scenarios.based_on': 'आपके अपने {months} महीनों के इतिहास के आधार पर।',
      'scenarios.threshold_label': 'जहाँ सुरक्षित से जोखिम शुरू होता है',
      'scenarios.see_details': 'इसके पीछे के आंकड़े दिखाएं',
      'track.see_all': 'सभी देखें →',
      'track.within': 'आपके पिछले {total} में से {hits} बार {pp} अंकों के भीतर सही रहे।',
      'track.latest': 'पिछली बार हमने {predicted} बताया, आपको {actual} मिला।',
      'checkback.eyebrow': 'छोटी सी जानकारी',
      'checkback.did': 'हाँ, मैंने किया',
      'checkback.didnt': 'नहीं, मैंने न करने का फैसला किया',
      'checkback.later': 'अभी नहीं — बाद में याद दिलाएं',
      'checkback.sub': 'क्या आपने बदलाव किया? आपका जवाब हर आगे के अनुमान को बेहतर बनाता है।',
      'checkback.question': 'कुछ समय पहले, आपने यह आजमाने का फैसला किया था: {question}',
      'checkback.followup_label': 'उसके बाद आपके ऑर्डर का क्या हुआ?',
      'checkback.went_up': 'बढ़ गए',
      'checkback.stayed_same': 'लगभग वैसे ही रहे',
      'checkback.went_down': 'घट गए',
      'checkback.skip': 'इस जानकारी को छोड़ें',
      'checkback.thanks': 'धन्यवाद — सहेज लिया। यह अब आपके ट्रैक रिकॉर्ड में गिना जाएगा।',
      'checkback.thanks_noted': 'समझ गए — नोट कर लिया कि आपने इसे छोड़ दिया।',
      'path.bootstrap_link': 'एक साधारण दैनिक बिक्री लॉग से शुरू करें',
      'bootstrap.eyebrow': 'आपका इतिहास बन रहा है',
      'bootstrap.question': 'कल आपको लगभग कितने ऑर्डर मिले?',
      'bootstrap.sub': 'किसी शीट की ज़रूरत नहीं — बस एक मोटा नंबर, लिखकर या बोलकर। कुछ हफ़्तों बाद Hisaab आपके लिए असली सवालों के जवाब दे पाएगा।',
      'bootstrap.save': 'आज का नंबर सहेजें',
      'bootstrap.fee_optional': 'मौजूदा डिलीवरी शुल्क (वैकल्पिक — बाद में शुल्क बदलाव जाँचने में मदद करता है)',
      'bootstrap.progress': '~{total} में से {count} दिन दर्ज',
      'bootstrap.ready': 'अब आपके पास पर्याप्त इतिहास है — नीचे कोई what-if सवाल पूछें।',
      'bootstrap.saved_today': 'सहेज लिया। कल फिर आकर दर्ज करें — निरंतरता ही इसे कारगर बनाती है।',
      'bootstrap.already_today': 'आपने आज पहले ही दर्ज कर दिया है। कल फिर आएं।',
    },
  };

  const SUPPORTED_UI_LANGS = ['en', 'hi'];
  // Deliberately NOT persisted across page loads. UI language should always
  // reflect the CURRENT question's language, every single question — not
  // whichever language happened to fire first in a session, and not
  // whatever was left over from a previous visit. A fresh page load (before
  // any question is asked) always starts in English.
  let currentUILang = 'en';

  function t(key) {
    return (I18N[currentUILang] && I18N[currentUILang][key]) || I18N.en[key] || key;
  }

  function setUILang(lang) {
    if (!SUPPORTED_UI_LANGS.includes(lang) || lang === currentUILang) return;
    currentUILang = lang;
    applyI18nToDom();
    document.documentElement.setAttribute('lang', lang);
  }

  // Walk the DOM and swap textContent of every [data-i18n] element to the
  // current language. Called on load and whenever setUILang() flips.
  function applyI18nToDom() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (key) el.textContent = t(key);
    });
  }
  // ─── end i18n ────────────────────────────────────────────────────────────


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
  const chartSampleTag = document.getElementById('chart-sample-tag');
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
  let mediaRecorder = null;
  let mediaChunks = [];
  let recorderStopTimer = null;
  let recognizing = false;
  // Live-preview speech recognition. Runs alongside MediaRecorder to provide
  // instant "is the mic hearing me?" text feedback while the user speaks.
  // Gemini transcription replaces this text on stop for the authoritative version.
  let livePreview = null;
  let livePreviewActive = false;
  let livePreviewText = '';
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
  applyI18nToDom();
  document.documentElement.setAttribute('lang', currentUILang);
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

  pathSample.addEventListener('click', () => openDemoLesson());
  pathReal.addEventListener('click', () => openDataConnectPage());
  const pathBootstrapBtn = document.getElementById('path-bootstrap');
  if (pathBootstrapBtn) pathBootstrapBtn.addEventListener('click', () => setPath('bootstrap'));
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
    updateDcLinkStatus();
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
    updateDcLinkStatus();
    updateDcReadButtonState();
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
    btn.addEventListener('click', () => {
      // Immediate visual confirmation — same pattern as the scenario CTAs.
      document.querySelectorAll('.intent-btn.selected').forEach((el) => el.classList.remove('selected'));
      btn.classList.add('selected');
      captureIntent(btn.dataset.intent);
    });
  });
  intentRetry.addEventListener('click', () => {
    if (activeIntent) captureIntent(activeIntent);
  });
  viewInLogLink.addEventListener('click', openDecisionLog);
  openDecisions.addEventListener('click', openDecisionLog);
  const trLink = document.getElementById('tr-link');
  if (trLink) {
    trLink.addEventListener('click', (e) => {
      e.preventDefault();
      openDecisionLog();
    });
  }
  closeDecisions.addEventListener('click', closeDecisionLog);
  newQuestion.addEventListener('click', () => {
    resetToLanding();
    newQuestion.blur();
  });
  brandReset.addEventListener('mousedown', e => e.preventDefault());
  newQuestion.addEventListener('mousedown', e => e.preventDefault());
  brandReset.addEventListener('click', () => {
    if (isAnalysisPage()) resetToLanding();
    brandReset.blur();
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
  wireCheckBack();
  wireBootstrap();
  wireDemoLesson();
  wireDataConnectPage();
  checkForPendingCheckBack();
  protectComposerChrome();
  window.addEventListener('resize', alignDataPanelToSheetSlot);
  window.addEventListener('scroll', alignDataPanelToSheetSlot, { passive: true });

  function protectComposerChrome() {
    const guardedRows = [composer, document.querySelector('.refine-inline-row')].filter(Boolean);
    const allowedIds = new Set(['question-input', 'mic-btn', 'simulate-btn', 'refine-question', 'refine-send']);
    const allowedClasses = new Set(['btn-text', 'btn-loader', 'spinner']);

    const isAllowedNode = node => {
      if (node.nodeType !== Node.ELEMENT_NODE) return true;
      if (allowedIds.has(node.id)) return true;
      return [...node.classList].some(className => allowedClasses.has(className));
    };

    const removeInjectedNodes = row => {
      [...row.children].forEach(child => {
        if (!isAllowedNode(child)) child.remove();
      });
    };

    guardedRows.forEach(row => {
      removeInjectedNodes(row);
      const observer = new MutationObserver(() => removeInjectedNodes(row));
      observer.observe(row, { childList: true });
    });
  }

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
    const isBootstrap = path === 'bootstrap';
    const isSample = !isReal && !isBootstrap;
    pathSample.classList.toggle('active', isSample);
    pathReal.classList.toggle('active', isReal);
    const pathBootstrapBtn = document.getElementById('path-bootstrap');
    if (pathBootstrapBtn) pathBootstrapBtn.classList.toggle('active', isBootstrap);
    sheetSlot.classList.toggle('open', isReal);
    const bootstrapSlot = document.getElementById('bootstrap-slot');
    if (bootstrapSlot) bootstrapSlot.classList.toggle('open', isBootstrap);
    // Reveal the question composer/chips once a path has been chosen — the
    // landing view is just the two cards + link until then, matching the
    // reference design exactly.
    const askBlock = document.getElementById('ask-block');
    if (askBlock) askBlock.hidden = false;
    renderChipVisibility();
    if (isBootstrap) {
      // Entering bootstrap: refresh the progress display. Keep the active
      // dataset as sample so any question asked while bootstrapping still
      // works (backend switches to real bootstrap data automatically once
      // enough entries exist — see getSimulationData bootstrap branch).
      dataDetected.classList.remove('show');
      fetchBootstrapStatus();
      updateAwayFromLandingState();
      return;
    }
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
    updateDcLinkStatus();
    // Fresh connect: selecting a file just enables "Read data" — parsing is
    // explicit now, not automatic. The inline refresh-from-a-result flow
    // keeps its existing auto-parse-on-select behavior, unchanged.
    const isInlineRefresh = stage.classList.contains('connecting-data') && Boolean(currentResult);
    if (isInlineRefresh) {
      await parseConnectedData();
    } else {
      updateDcReadButtonState();
      const noteText = document.getElementById('pending-data-note-text');
      const note = document.getElementById('pending-data-note');
      if (noteText) noteText.textContent = `${uploadedFileName} selected — click Read data.`;
      if (note) note.hidden = false;
    }
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
    // The old static sample/real suggestion chip sets are superseded by the
    // new dynamic #dc-suggested-questions (real, contextual questions from
    // the actual connected data). Keeping this function only for backward
    // compatibility with any code that still calls it — both legacy sets
    // now stay permanently hidden rather than being toggled on.
    sampleSuggestions.hidden = true;
    realSuggestions.hidden = true;
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
    updateDcReadButtonState();
    // The fresh Add-my-data flow now requires an explicit "Read data" click
    // (see dc-read-data-btn's handler) rather than auto-parsing as the user
    // types/pastes. The inline refresh-from-a-result flow
    // (openInlineDataConnector) is a different, quieter in-place-update UX
    // and keeps its existing auto-parse-on-input behavior, unchanged.
    const isInlineRefresh = stage.classList.contains('connecting-data') && Boolean(currentResult);
    if (!isInlineRefresh) return;
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

    if (!isInlineRefresh) {
      // Fresh connect: show the loader screen, hide the upload screen
      // entirely (no old content visible behind it), cycle through the
      // reading messages.
      setDcScreen('loader');
      startReadingMessages();
      const readBtn = document.getElementById('dc-read-data-btn');
      if (readBtn) readBtn.disabled = true;

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
        stopReadingMessages();
        renderDcSummary(lastSheetSummary);
        setDcScreen('summary');
        // Data is real and parsed — promote it immediately so the
        // subsequent Ask Hisaab question actually uses it. No "Apply to
        // analysis" gate here since there's no existing result on screen
        // in this fresh-connect context.
        hideApplyDataCta();
        applyPendingDataset();
      } catch (err) {
        stopReadingMessages();
        lastSheetSummary = null;
        setDcScreen('upload');
        if (readBtn) readBtn.disabled = false;
        dcShowError(err.message);
      }
      return;
    }

    // Inline refresh (updating already-connected data while a result is on
    // screen, via openInlineDataConnector) — unchanged from before this
    // redesign, still using the dataDetected/capabilityList panel.
    detectedHeadline.textContent = 'Reading this data for your analysis...';
    detectedBody.textContent = 'I will update the result below once the columns are ready.';
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
      dataDetected.classList.add('show');
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
      dataDetected.classList.add('show');
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
    // #composer no longer exists in the redesigned Ask Hisaab screen — fall
    // back to #ask-block (its real current container) or the stage itself
    // so this never throws on a null element.
    const columnEl = isInline ? resultsSection : (composer || document.getElementById('ask-block') || stage);
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
    // Only a bare minimum client-side check now (not literally empty) —
    // genuinely open/broad questions ("what will happen in my business?")
    // used to be hard-rejected here based on keyword matching, before the
    // server ever saw them. The server now handles this properly: it
    // classifies intent via Gemini and either finds a real lever or
    // returns an honest, capability-grounded guidance message — a much
    // better answer than a client-side refusal for something we don't
    // actually know is unanswerable.
    if (!options.skipValidation && question.length < 3) {
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
    // Dismiss the check-back card if it's showing — a new question means the
    // user has moved on from the returning-visitor prompt.
    const cbCardEl = document.getElementById('checkback-card');
    if (cbCardEl) cbCardEl.hidden = true;
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
    hideGuidanceMessage();

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
      if (body.status === 'guidance') {
        // The question was genuinely too broad/unrelated for a specific
        // calculation — Gemini classified intent and wrote an honest,
        // capability-grounded redirect instead of either fabricating an
        // answer or hard-rejecting the question. Shown in-context so it's
        // actually visible from inside the Ask Hisaab modal.
        if (body.session_id) localStorage.setItem('hisaabSessionId', body.session_id);
        showGuidanceMessage(body);
        (options.isRefine ? refineQuestion : questionInput).focus();
        updateAwayFromLandingState();
        return;
      }

      renderResults(body, Date.now() - startTime, { append: options.isRefine });
    } catch (err) {
      // Same visibility fix as showError()/showMissingInputs() elsewhere:
      // writing directly to the main-stage dataDetected panel is invisible
      // if the data-connect-page overlay is still open. Route through
      // showError() instead, which already handles closing the overlay
      // when needed.
      showError(err.message);
    } finally {
      setLoading(false, options.isRefine);
      updateAwayFromLandingState();
    }
  }

  function isSpecificQuestion(question) {
    return question.length >= 12 && (decisionVocabulary.test(question) || subjectVocabulary.test(question));
  }

  // Shows the LLM-generated guidance message + real suggested questions
  // when the server determines a question is too broad to compute
  // directly. Chips fill the textarea, never auto-submit — consistent
  // with every other suggested-question chip in the app.
  function showGuidanceMessage(body) {
    const card = document.getElementById('dc-guidance-card');
    const msgEl = document.getElementById('dc-guidance-message');
    const questionsEl = document.getElementById('dc-guidance-questions');
    if (!card || !msgEl || !questionsEl) return;
    msgEl.textContent = body.guidance_message || '';
    const questions = (body.suggested_questions || []).slice(0, 3);
    questionsEl.innerHTML = questions.map((q) => `<button class="chip" type="button" data-q="${escapeHtml(q)}">${escapeHtml(q)}</button>`).join('');
    questionsEl.querySelectorAll('.chip').forEach((btn) => {
      btn.addEventListener('click', () => {
        questionInput.value = btn.dataset.q;
        resizeQuestion();
        updateQuestionState();
        hideGuidanceMessage();
        questionInput.focus();
        updateAwayFromLandingState();
      });
    });
    card.hidden = false;
  }

  function hideGuidanceMessage() {
    const card = document.getElementById('dc-guidance-card');
    if (card) card.hidden = true;
  }

  function renderResults(data, elapsed, options = {}) {
    // A real result is about to show. If either full-page overlay
    // (demo-lesson or data-connect-page) is still open, close it now —
    // otherwise the result renders correctly in #stage but stays
    // completely invisible behind the still-open, higher-z-index overlay.
    // This was a real bug: submitting a question from inside the
    // Add-my-data flow computed a real result, but nothing appeared to the
    // user because the modal never closed to reveal it.
    const demoOverlay = document.getElementById('demo-lesson');
    if (demoOverlay && !demoOverlay.hidden) closeDemoLesson();
    const dataConnectOverlay = document.getElementById('data-connect-page');
    if (dataConnectOverlay && !dataConnectOverlay.hidden) closeDataConnectPage();

    const computed = data.computed || data;
    const generated = data.generated || data;
    // The UI chrome always mirrors the CURRENT question's detected language —
    // in both directions. If this question is Hindi, switch to Hindi; if
    // it's English (or anything else we don't have UI strings for), switch
    // back to English. Each question gets a consistent single-language
    // result screen matching what was actually asked, rather than a language
    // choice "sticking" from an earlier question in the same session.
    const detected = String(generated.detected_language || data.detected_language || '').toLowerCase();
    setUILang(detected === 'hi' ? 'hi' : 'en');

    // Render the new scenarios/threshold block BEFORE the existing dense
    // stats layout. When scenarios_bundle is absent (weak data, unsupported
    // lever, etc.), this function hides the block entirely and the existing
    // UI below shows exactly as it did before — a strict superset, never a
    // regression. When present, the existing stats still render but with a
    // .with-scenarios modifier that adds top spacing; the details disclosure
    // lets the user reveal them if they want the dense view.
    renderScenariosBlock(data);

    const value = finiteNumber(computed.outcome_value);
    const low = finiteNumber(computed.range_low);
    const high = finiteNumber(computed.range_high);
    const conf = Number.isFinite(Number(computed.confidence)) ? Math.max(0, Math.min(1, Number(computed.confidence))) : null;
    const pct = conf === null ? null : Math.round(conf * 100);
    const isWeak = pct === null || pct < 35 || Boolean(computed.low_signal_warning);
    if (data.session_id) localStorage.setItem('hisaabSessionId', data.session_id);
    lastSimulationPersistence = data.persistence || null;
    activeResultId = crypto.randomUUID ? crypto.randomUUID() : `result-${Date.now()}-${Math.random().toString(16).slice(2)}`;

    const isSampleData = data.chart_meta?.is_sample === true;
    drawSparkline(data.chart_series || data.series || [], isWeak, isSampleData);

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

    // Simplify what shows inside the details disclosure when scenario
    // cards are present — per direct user feedback, the EST CHANGE /
    // WORST CASE / RECENT TREND stat grid and the separate "What this
    // means" box were "messy metrics, not adding value": the exact same
    // ranges already live on each scenario card's own "why" text, and the
    // recommendation is already covered by the plain-language summary at
    // the top of this disclosure. This runs AFTER the hidden-state
    // assignments above so it correctly wins instead of being overridden.
    // Only applies when scenarios exist — the legacy no-scenarios flow
    // (handled in renderScenariosBlock's early-return branch) restores
    // full visibility since it has no per-card why-text to lean on.
    const hasScenarios = Boolean(data.scenarios_bundle?.scenarios?.length);
    const explainBlockEl = document.querySelector('#results .explain');
    if (hasScenarios) {
      if (explainBlockEl) explainBlockEl.hidden = true;
      revenueImpact.hidden = true;
      downsideCard.hidden = true;
      trendChip.hidden = true;
      const lowConfActionsEl = document.getElementById('low-confidence-actions');
      if (lowConfActionsEl) lowConfActionsEl.classList.add('demoted');
    } else {
      if (explainBlockEl) explainBlockEl.hidden = false;
      const lowConfActionsEl = document.getElementById('low-confidence-actions');
      if (lowConfActionsEl) lowConfActionsEl.classList.remove('demoted');
    }

    confidenceBlock.classList.toggle('weak', isWeak);
    confidenceBadge.classList.toggle('weak', isWeak);
    confidenceLabel.textContent = pct === null
      ? t('result.confidence.unknown')
      : t(isWeak ? 'result.confidence.low' : pct >= 70 ? 'result.confidence.high' : 'result.confidence.medium');
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
    const isHindiUI = currentUILang === 'hi';
    chartLabel.textContent = chartMeta.label || (isHindiUI ? `कुल ऑर्डर · पिछले ${data.summary?.months || 'हाल के'} महीनों के` : `Orders · ${data.summary?.months || 'recent'} months`);
    chartSampleTag.hidden = chartMeta.is_sample !== true;
    chartSampleTag.textContent = t('evidence.sample_tag');
    chartStart.textContent = isHindiUI ? (chartMeta.start_label || t('evidence.earlier')) : (chartMeta.start_label || 'Earlier');
    chartEnd.textContent = isHindiUI ? (chartMeta.end_label || t('evidence.now')) : (chartMeta.end_label || 'Now');
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

  // Render the scenarios block from data.scenarios_bundle. If bundle is
  // missing, hide the block entirely and remove the .with-scenarios modifier
  // so existing evidence/confidence stats render exactly as they did before.
  // This function is strictly additive — it never touches any DOM outside
  // the scenarios-block/threshold-line-block/scenarios-details elements.
  function renderScenariosBlock(data) {
    const block = document.getElementById('scenarios-block');
    const grid = document.getElementById('scenario-grid');
    const thresholdBlock = document.getElementById('threshold-line-block');
    const results = document.getElementById('results');
    if (!block || !grid || !results) return;

    const bundle = data && data.scenarios_bundle;
    if (!bundle || !Array.isArray(bundle.scenarios) || bundle.scenarios.length === 0) {
      block.hidden = true;
      results.classList.remove('with-scenarios');
      grid.innerHTML = '';
      if (thresholdBlock) thresholdBlock.hidden = true;
      // If a previous render moved evidence/conf/explain INTO the details
      // disclosure, put them back where they belong so weak-data mode shows
      // them at their normal position. Order matters — the DOM order of
      // evidence → conf → explain in #results is what today's flow expects.
      const details = document.getElementById('scenarios-details');
      if (details && details.contains(document.getElementById('evidence-block'))) {
        const evidence = document.getElementById('evidence-block');
        const confBlock = document.getElementById('confidence-block');
        const explainBlock = document.querySelector('.explain');
        // Reinsert after the .result-top div, before the intent-prompt.
        const intentPromptEl = document.getElementById('intent-prompt');
        if (evidence && intentPromptEl) results.insertBefore(evidence, intentPromptEl);
        if (confBlock && intentPromptEl) results.insertBefore(confBlock, intentPromptEl);
        if (explainBlock && intentPromptEl) results.insertBefore(explainBlock, intentPromptEl);
        // Visibility (explain block, stat callouts, demoted actions) is
        // handled centrally in renderResults right after the stat elements
        // get their real hidden state — this branch only repositions.
      }
      return;
    }

    // Question echo — the exact user question, plus a "based on N months" line.
    const qText = document.getElementById('scenarios-q-text');
    const qSub = document.getElementById('scenarios-q-sub');
    if (qText) qText.textContent = lastQuestion || '';
    if (qSub) {
      const months = Number(data.summary?.months || 0);
      let subText = months > 0 ? t('scenarios.based_on').replace('{months}', months) : '';
      // When low-confidence, append the honest caption so the "rough
      // direction, not final numbers" framing sits right under the question,
      // before the cards.
      if (bundle.is_low_confidence && bundle.low_confidence_caption) {
        subText = subText
          ? `${subText} ${bundle.low_confidence_caption}`
          : bundle.low_confidence_caption;
      }
      qSub.textContent = subText;
    }

    const lowConf = bundle.is_low_confidence === true;

    // Render the three scenario cards.
    grid.innerHTML = '';
    bundle.scenarios.forEach((s) => {
      const card = document.createElement('div');
      const hasRisk = s.has_downside_risk === true;
      card.className = 'scenario' + (s.is_best_fit ? ' best' : '') + (lowConf ? ' low-conf' : '') + (hasRisk ? ' has-risk' : '');
      const revenue = Number(s.headline_revenue) || 0;
      // When low-confidence OR when this specific scenario carries real
      // downside risk (its own range straddles zero, even though the point
      // estimate is positive), don't paint the number confidently green —
      // that would hide the real chance of a loss behind a bigger, more
      // certain-looking number. Muted grey signals "directional, not a
      // guaranteed gain" in both cases. The baseline (₹0) stays neutral.
      const revenueClass = (lowConf || hasRisk) ? 'muted' : (revenue > 0 ? 'good' : revenue < 0 ? 'bad' : '');
      const symbol = bundle.currency_symbol || '₹';
      const revenueFormatted = revenue === 0
        ? `${symbol}0`
        : `${revenue > 0 ? '+' : '−'}${symbol}${Math.abs(revenue).toLocaleString('en-IN')}`;

      // Build with textContent-first, no innerHTML injection of untrusted data.
      // Every field the backend provides is treated as text, not HTML.
      const flagHtml = s.is_best_fit
        ? `<span class="best-flag">${escapeHtml(s.best_fit_label || (currentUILang === 'hi' ? 'आपके डेटा के लिए सबसे उपयुक्त' : 'Best fit for your data'))}</span>`
        : '';
      const riskBadgeHtml = hasRisk
        ? `<span class="risk-flag">${escapeHtml(currentUILang === 'hi' ? 'नुकसान का जोखिम' : 'Risk of loss')}</span>`
        : '';
      card.innerHTML = `
        ${flagHtml}
        <div class="s-label">${escapeHtml(s.label || '')}</div>
        <div class="s-action">${escapeHtml(s.action_short || '')}</div>
        <div class="s-outcome-label">${escapeHtml(currentUILang === 'hi' ? 'इस महीने, संभावित' : 'This month, likely')}</div>
        <div class="s-outcome ${revenueClass}">${revenueFormatted}</div>
        <div class="s-outcome-note">${escapeHtml(s.headline_note || '')}${riskBadgeHtml}</div>
        <div class="s-why">${escapeHtml(s.why || '')}</div>
        <button class="s-cta" type="button" data-scenario-id="${escapeHtml(s.id || '')}">${escapeHtml(s.cta || '')}</button>
      `;
      grid.appendChild(card);
    });

    // Wire scenario CTA clicks to the existing intent-capture flow. Clicking
    // "Try this" on the best-fit card is equivalent to picking "Yes, I'll try
    // it"; other scenarios do the same but log which scenario was chosen so
    // the future track-record view can distinguish them. If the intent-btn
    // handler is present, we simulate that click; otherwise the button is
    // still visible but non-functional (safe degrade — never a broken app).
    grid.querySelectorAll('.s-cta').forEach((btn) => {
      btn.addEventListener('click', () => {
        // Immediate visual confirmation the click registered — previously
        // nothing happened to the button itself on click, which read as
        // broken even though the intent was captured correctly underneath.
        grid.querySelectorAll('.s-cta.selected').forEach((el) => el.classList.remove('selected'));
        btn.classList.add('selected');

        const scenarioId = btn.getAttribute('data-scenario-id') || '';
        // Baseline "skip" scenario maps to intent = 'skipped'; every other
        // scenario maps to intent = 'applied' (the user is committing to a
        // change). This preserves the existing intent-capture semantics
        // without introducing a new intent type mid-migration.
        const targetIntent = scenarioId === 'baseline' ? 'skipped' : 'applied';
        const intentBtn = document.querySelector(`.intent-btn[data-intent="${targetIntent}"]`);
        if (intentBtn) {
          intentBtn.click();
        }
      });
    });

    // Plain-language summary shown at the TOP of the technical details
    // disclosure — even a user who opens "show the numbers" gets one clear
    // sentence before any percentage/chart jargon. Built from the same
    // real computed values the technical stats below use, not a generic
    // placeholder.
    const plainSummaryEl = document.getElementById('scenarios-plain-summary');
    if (plainSummaryEl) {
      const computedForSummary = data.computed || data;
      const monthsCount = Number(data.summary?.months) || 0;
      const confPct = Number.isFinite(computedForSummary.confidence) ? Math.round(computedForSummary.confidence * 100) : null;
      const isHi = currentUILang === 'hi';
      if (confPct !== null && confPct >= 45) {
        plainSummaryEl.textContent = isHi
          ? `सीधे शब्दों में: आपके पिछले ${monthsCount} महीनों के आधार पर, यह अनुमान भरोसेमंद है।`
          : `In plain terms: based on your last ${monthsCount} months, this estimate is fairly reliable.`;
      } else {
        plainSummaryEl.textContent = isHi
          ? `सीधे शब्दों में: आपके पिछले ${monthsCount} महीनों के डेटा में साफ पैटर्न नहीं दिख रहा, इसलिए यह सिर्फ एक मोटा अंदाज़ा है, पक्का जवाब नहीं।`
          : `In plain terms: your last ${monthsCount} months don't show a clear pattern yet, so this is a rough guess, not a firm answer.`;
      }
    }

    // Threshold line — only rendered when the backend provides one AND it
    // has a real lever_change value.
    if (thresholdBlock) {
      const t_ = bundle.threshold;
      if (t_ && Number.isFinite(Number(t_.lever_change))) {
        thresholdBlock.hidden = false;
        // Position the marker on the track: baseline (0) at left edge,
        // bigger scenario (2x asked) at right edge. Threshold marker sits
        // proportionally between them.
        const asked = Number(bundle.scenarios[1]?.projection?.lever_change) || 0;
        const bigger = asked * 2 || 1;
        const raw = Number(t_.lever_change);
        const pctPosition = Math.max(5, Math.min(95, Math.round((raw / bigger) * 100)));
        const marker = document.getElementById('threshold-marker');
        if (marker) marker.style.left = `${pctPosition}%`;
        const scaleStart = document.getElementById('threshold-scale-start');
        const scaleEnd = document.getElementById('threshold-scale-end');
        const symbol = bundle.currency_symbol || '₹';
        if (scaleStart) scaleStart.textContent = bundle.current_value != null ? `${symbol}${bundle.current_value}` : '';
        if (scaleEnd) scaleEnd.textContent = bundle.current_value != null ? `${symbol}${Math.round((bundle.current_value + bigger) * 100) / 100}` : '';
        const caption = document.getElementById('threshold-caption');
        if (caption) {
          const newValue = t_.new_lever_value != null ? `${symbol}${t_.new_lever_value}` : '';
          caption.innerHTML = currentUILang === 'hi'
            ? `आपका इतिहास <b>${escapeHtml(newValue)}</b> तक बदलाव को सुरक्षित मानता है। इससे आगे, पिछले उदाहरण दिखाते हैं कि नुकसान का जोखिम बढ़ जाता है।`
            : `Your history supports changes up to <b>${escapeHtml(newValue)}</b>. Past that, previous jumps show downside risk climbing.`;
        }
      } else {
        thresholdBlock.hidden = true;
      }
    }

    // Wrap existing evidence/confidence/explain blocks in the details
    // disclosure. Move them physically into the <details> so the summary
    // controls their visibility. We do this every render, but only if not
    // already moved (idempotent).
    const details = document.getElementById('scenarios-details');
    if (details) {
      const evidence = document.getElementById('evidence-block');
      const confBlock = document.getElementById('confidence-block');
      const explainBlock = document.querySelector('#results .explain');
      // If any of these are still direct children of #results, move them.
      [evidence, confBlock, explainBlock].forEach((el) => {
        if (el && el.parentElement && el.parentElement.id !== 'scenarios-details') {
          details.appendChild(el);
        }
      });
    }

    block.hidden = false;
    results.classList.add('with-scenarios');

    // Track-record strip removed per explicit user feedback: showing
    // "within 3 points on 1 of your last 2 calls" reads as absurd/confusing
    // for anyone without substantial genuine history, including brand-new
    // users. The underlying data/endpoint still exists (untouched) in case
    // this gets revisited with a proper minimum-sample-size gate later, but
    // it no longer renders on the result screen at all.
  }

  // Minimal HTML escape for user/backend text going into innerHTML. Never
  // pass unescaped values into innerHTML — a stray < in a Hindi phrase or a
  // user's own product name would break the whole card.
  function escapeHtml(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function drawSparkline(series, isWeak, isSampleData) {
    const svg = document.getElementById('sparkline');
    const values = (series || []).map(point => Number(point.value ?? point.orders)).filter(Number.isFinite);
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
    // Sample-data charts are always dashed and muted, regardless of
    // confidence — this is a "not your real numbers" signal, distinct from
    // the low-confidence weak-line treatment, and it applies even when the
    // computed result happens to look confident on the synthetic dataset.
    const stroke = isSampleData ? '#B8C1D6' : (isWeak ? '#B8C1D6' : 'var(--accent)');
    const dash = isSampleData ? ' stroke-dasharray="4,3"' : '';
    svg.innerHTML = `<polyline points="${pts}" fill="none" stroke="${stroke}" stroke-width="1.8" stroke-linejoin="round"${dash}/>`;
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
        <div class="tag">${escapeHtml(t('result.what_this_means'))}</div>
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

  let checkBackDecisionId = null;
  async function checkForPendingCheckBack() {
    const card = document.getElementById('checkback-card');
    if (!card) return;
    card.hidden = true;
    try {
      const res = await fetch('/api/decisions/check-back', { headers: apiHeaders() });
      if (!res.ok) return;
      const body = await readJsonResponse(res);
      if (!body || !body.pending || !body.pending.id) return;
      checkBackDecisionId = body.pending.id;
      const qEl = document.getElementById('cb-question');
      if (qEl) qEl.textContent = t('checkback.question').replace('{question}', body.pending.question || '');
      const followup = document.getElementById('cb-followup');
      const done = document.getElementById('cb-done');
      const options = document.getElementById('cb-options');
      if (followup) followup.hidden = true;
      if (done) done.hidden = true;
      if (options) options.hidden = false;
      card.hidden = false;
    } catch (_err) {
      card.hidden = true;
    }
  }

  // ── Demo lesson: guided 4-step walkthrough ──────────────────────────────
  // Purely static, canned educational content — never calls /api/simulate.
  // Independent of the real sample-data Q&A flow (setPath('sample')); this
  // is a separate explainer shown when "Try demo" is clicked, matching a
  // Duolingo-style guided-lesson pattern. Closing it (X) always returns
  // cleanly to the landing screen with no side effects on real app state.
  const DEMO_RESULTS = {
    orders_trend: {
      answer: 'For this demo shop, orders have been slowly rising over the last few months.',
      why: 'Recent months show more orders than the months before them — a mild, steady upward trend.',
      try_this: 'Keep an eye on the next 2–3 months to see if the rise continues.',
    },
    delivery_fee: {
      answer: 'For this demo shop, a small delivery fee increase looks safe to try.',
      why: 'Past fee changes did not noticeably reduce how many orders came in.',
      try_this: 'Raise the fee by a small amount and watch orders for two weeks.',
    },
    discounts: {
      answer: 'For this demo shop, discounts helped a little, but not every time.',
      why: 'Some discount months had more orders, but the pattern was not strong every month.',
      try_this: 'Run a small offer for 3–5 days and compare orders.',
    },
    repeat_customers: {
      answer: 'For this demo shop, a good share of customers are repeat buyers.',
      why: 'Several months show the same customers ordering more than once.',
      try_this: 'Try a small thank-you offer for repeat customers and see if it grows.',
    },
  };

  let demoStep = 1;
  let demoChosenQuestion = null;

  function openDemoLesson() {
    demoStep = 1;
    demoChosenQuestion = null;
    document.body.classList.add('demo-lesson-active');
    const overlay = document.getElementById('demo-lesson');
    if (overlay) overlay.hidden = false;
    renderDemoStep();
  }

  function closeDemoLesson() {
    document.body.classList.remove('demo-lesson-active');
    const overlay = document.getElementById('demo-lesson');
    if (overlay) overlay.hidden = true;
  }

  function renderDemoStep() {
    document.querySelectorAll('.demo-step').forEach((el) => {
      el.hidden = Number(el.dataset.step) !== demoStep;
    });
    const label = document.getElementById('demo-step-label');
    if (label) label.textContent = `STEP ${demoStep} OF 4`;
    document.querySelectorAll('.demo-dot').forEach((dot) => {
      dot.classList.toggle('filled', Number(dot.dataset.step) <= demoStep);
    });

    const goBack = document.getElementById('demo-go-back');
    const primary = document.getElementById('demo-primary-btn');
    if (goBack) goBack.hidden = demoStep === 1;

    if (primary) {
      if (demoStep === 1) {
        primary.hidden = false;
        primary.textContent = 'Start demo';
      } else if (demoStep === 2) {
        primary.hidden = false;
        primary.textContent = 'Continue';
      } else {
        // Steps 3 and 4 advance by picking a card / have no forward action —
        // only "Go back" is shown, matching the reference design.
        primary.hidden = true;
      }
    }

    if (demoStep === 4 && demoChosenQuestion) {
      const result = DEMO_RESULTS[demoChosenQuestion];
      const answerEl = document.getElementById('demo-result-answer');
      const whyEl = document.getElementById('demo-result-why');
      const tryEl = document.getElementById('demo-result-try');
      if (answerEl) answerEl.textContent = result.answer;
      if (whyEl) whyEl.textContent = result.why;
      if (tryEl) tryEl.textContent = result.try_this;
    }
  }

  function wireDemoLesson() {
    const closeBtn = document.getElementById('demo-close');
    const goBack = document.getElementById('demo-go-back');
    const primary = document.getElementById('demo-primary-btn');
    if (closeBtn) closeBtn.addEventListener('click', closeDemoLesson);
    if (goBack) goBack.addEventListener('click', () => {
      if (demoStep > 1) { demoStep -= 1; renderDemoStep(); }
    });
    if (primary) primary.addEventListener('click', () => {
      if (demoStep < 2) { demoStep += 1; renderDemoStep(); }
      else if (demoStep === 2) { demoStep = 3; renderDemoStep(); }
    });
    document.querySelectorAll('.demo-question-card').forEach((card) => {
      card.addEventListener('click', () => {
        demoChosenQuestion = card.getAttribute('data-demo-q');
        demoStep = 4;
        renderDemoStep();
      });
    });
    // Escape key closes the demo, matching standard modal expectations.
    document.addEventListener('keydown', (e) => {
      const overlay = document.getElementById('demo-lesson');
      if (e.key === 'Escape' && overlay && !overlay.hidden) closeDemoLesson();
    });
  }

  // ── Add-my-data full-page flow ──────────────────────────────────────────
  // Four distinct screens (upload -> loader -> summary -> ask), one visible
  // at a time. Wraps the REAL, already-working parsing logic
  // (parseConnectedData -> /api/parse-sheet) — only the presentation is new.
  // The summary screen shows ONLY facts the server actually returned
  // (date_range, orders_found, found/missing optional labels, suggested
  // questions) — never invented, never padded.
  const READING_MESSAGES = [
    'Opening your data',
    'Finding orders and dates',
    'Checking sales fields',
    'Looking for discounts, delivery fees, and customers',
    'Preparing your summary',
  ];
  let readingMessageTimer = null;

  function setDcScreen(name) {
    document.querySelectorAll('.dc-screen').forEach((el) => {
      el.hidden = el.getAttribute('data-dc-screen') !== name;
    });
  }

  function updateDcReadButtonState() {
    const btn = document.getElementById('dc-read-data-btn');
    if (!btn) return;
    const hasValidInput = Boolean(uploadedCsv) || sheetUrlInput.value.trim().length > 20;
    btn.disabled = !hasValidInput;
  }

  let dcLinkStatusTimer = null;
  function updateDcLinkStatus() {
    const statusEl = document.getElementById('dc-link-status');
    if (!statusEl) return;
    window.clearTimeout(dcLinkStatusTimer);
    const value = sheetUrlInput.value.trim();
    if (!value) {
      statusEl.hidden = true;
      statusEl.className = 'dc-link-status';
      return;
    }
    // Brief "checking" moment before settling into a verdict — purely a
    // client-side format check (no network call here; the actual read
    // only happens on the explicit "Read data" click), but gives the
    // input a moment of visible feedback rather than snapping instantly.
    statusEl.hidden = false;
    statusEl.className = 'dc-link-status checking';
    statusEl.textContent = 'Checking this Sheet link…';
    dcLinkStatusTimer = window.setTimeout(() => {
      const looksLikeSheetsUrl = /^https?:\/\/(docs\.google\.com\/spreadsheets|drive\.google\.com)/i.test(value);
      if (looksLikeSheetsUrl) {
        statusEl.className = 'dc-link-status valid';
        statusEl.textContent = 'Sheet link looks good. Ready to read.';
      } else {
        statusEl.className = 'dc-link-status invalid';
        statusEl.textContent = "This doesn't look like a Google Sheets link — check and paste again.";
      }
    }, 350);
  }

  function startReadingMessages() {
    stopReadingMessages();
    const msgEl = document.getElementById('reading-loader-msg');
    let idx = 0;
    if (msgEl) msgEl.textContent = READING_MESSAGES[0];
    readingMessageTimer = window.setInterval(() => {
      idx = (idx + 1) % READING_MESSAGES.length;
      if (!msgEl) return;
      msgEl.textContent = READING_MESSAGES[idx];
      // Restart the fade-in animation on each message change.
      msgEl.style.animation = 'none';
      void msgEl.offsetWidth; // eslint-disable-line no-void -- force reflow to restart animation
      msgEl.style.animation = '';
    }, 1100);
  }

  function stopReadingMessages() {
    if (readingMessageTimer) { window.clearInterval(readingMessageTimer); readingMessageTimer = null; }
  }

  function dcShowError(message) {
    const banner = document.getElementById('dc-error-banner');
    const msgEl = document.getElementById('dc-error-msg');
    if (msgEl) msgEl.textContent = message;
    if (banner) banner.hidden = false;
  }

  function dcHideError() {
    const banner = document.getElementById('dc-error-banner');
    if (banner) banner.hidden = true;
  }

  // Renders the honest "Data ready" summary from real sheet_summary fields
  // only. Never fabricates a value — anything not actually present is shown
  // via the missing-fields line instead.
  const DC_FOUND_CHIP_CAP = 4;

  function renderDcSummary(summary) {
    const foundChipsEl = document.getElementById('dc-found-chips');
    const moreLink = document.getElementById('dc-more-found-link');
    const moreDrawer = document.getElementById('dc-more-found-drawer');
    const missingSection = document.getElementById('dc-missing-section');
    const missingChipsEl = document.getElementById('dc-missing-chips');
    const capSection = document.getElementById('dc-capability-section');
    const capChipsEl = document.getElementById('dc-capability-chips');
    const directionalNote = document.getElementById('dc-directional-note');
    if (!foundChipsEl) return;

    // Build the full "found" list, then cap what's shown by default —
    // never a long stacked list, even with many detected fields.
    const foundItems = [];
    if (summary.date_range) foundItems.push(summary.date_range);
    if (Number.isFinite(summary.raw_rows) && summary.raw_rows > 0) {
      foundItems.push(`${summary.raw_rows} row${summary.raw_rows === 1 ? '' : 's'}`);
    }
    if (summary.orders_found) foundItems.push('Orders');
    (summary.found_optional_labels || []).forEach((label) => foundItems.push(label));

    const visibleFound = foundItems.slice(0, DC_FOUND_CHIP_CAP);
    const restFound = foundItems.slice(DC_FOUND_CHIP_CAP);
    foundChipsEl.innerHTML = visibleFound.map((f) => `
      <span class="dc-chip"><span class="dc-chip-icon" aria-hidden="true">✓</span>${escapeHtml(f)}</span>
    `).join('');

    if (restFound.length) {
      moreLink.hidden = false;
      moreLink.textContent = `+ ${restFound.length} more found`;
      moreDrawer.innerHTML = restFound.map((f) => `<div class="dc-more-drawer-item">✓ ${escapeHtml(f)}</div>`).join('');
      moreDrawer.hidden = true;
      moreLink.onclick = () => {
        const isOpen = !moreDrawer.hidden;
        moreDrawer.hidden = isOpen;
        moreLink.textContent = isOpen ? `+ ${restFound.length} more found` : 'Show less';
      };
    } else {
      moreLink.hidden = true;
      moreDrawer.hidden = true;
    }

    // Missing/limited — only shown at all if something is actually missing.
    // Framed as a gentle limitation, never as an error.
    const missingLabels = summary.missing_optional_labels || [];
    if (missingLabels.length) {
      missingSection.hidden = false;
      missingChipsEl.innerHTML = missingLabels.map((m) => `<span class="dc-chip">${escapeHtml(m)} not found</span>`).join('');
    } else {
      missingSection.hidden = true;
    }

    // Capability chips — short labels (not full questions), capped to 3,
    // drawn only from capabilities that are actually ready or limited.
    const capabilities = summary.capability_map?.capabilities || [];
    const CAP_SHORT_LABEL = {
      sales_trend: 'Order trend',
      pricing: 'Pricing changes',
      delivery_fee: 'Delivery fee impact',
      promotions: 'Promo impact',
      repeat_customers: 'Repeat customers',
    };
    const askable = capabilities.filter((c) => c.status === 'ready')
      .concat(capabilities.filter((c) => c.status === 'limited'));
    const capLabels = askable.map((c) => CAP_SHORT_LABEL[c.key]).filter(Boolean).slice(0, 3);
    const anyLimited = askable.some((c) => c.status === 'limited');
    if (capLabels.length) {
      capSection.hidden = false;
      capChipsEl.innerHTML = capLabels.map((l) => `<span class="dc-chip">${escapeHtml(l)}</span>`).join('');
      directionalNote.hidden = !anyLimited;
    } else {
      capSection.hidden = true;
    }
  }

  // Populates the Ask Hisaab screen's suggested prompts as real, clickable
  // chips (fills the textarea, never auto-submits — matching every other
  // chip in the app). Capped to 3 by the server already
  // (summarizeSheetParse's suggested_questions), so no extra capping needed
  // here.
  function renderDcSuggestedPrompts(questions) {
    const container = document.getElementById('dc-suggested-questions');
    const label = document.getElementById('dc-try-asking-label');
    if (!container) return;
    const list = (questions || []).slice(0, 3);
    if (label) label.hidden = list.length === 0;
    container.innerHTML = list.map((q) => `<button class="chip" type="button" data-q="${escapeHtml(q)}">${escapeHtml(q)}</button>`).join('');
    container.querySelectorAll('.chip').forEach((btn) => {
      btn.addEventListener('click', () => {
        questionInput.value = btn.dataset.q;
        resizeQuestion();
        updateQuestionState();
        hideValidationNudge();
        questionInput.focus();
        updateAwayFromLandingState();
      });
    });
  }

  // The ask screen's gentle "some answers may be directional" note —
  // computed from the same missing_optional_labels the summary screen
  // uses, so the two screens never disagree about what's missing.
  function renderDcAskMissingNote(summary) {
    const noteEl = document.getElementById('dc-ask-missing-note');
    if (!noteEl) return;
    const missingLabels = (summary?.missing_optional_labels || []).map((l) => l.toLowerCase());
    if (missingLabels.length) {
      noteEl.hidden = false;
      noteEl.textContent = `Some answers may be directional because ${missingLabels.join(', ')} data is missing.`;
    } else {
      noteEl.hidden = true;
    }
  }

  // When true, openDataConnectPage() was triggered from "Add your real data"
  // on an existing low-confidence RESULT (not a fresh landing-page open).
  // In that mode, the summary screen's "Ask Hisaab" CTA re-runs the
  // CURRENT question against the newly-read data instead of taking the
  // user to a blank Ask screen — this is the unification that replaces the
  // old separate inline sheet-slot upgrade experience entirely.
  let dataConnectRefreshMode = false;

  function openDataConnectPage(options = {}) {
    dataConnectRefreshMode = Boolean(options.refreshMode);
    document.body.classList.add('data-connect-active');
    const overlay = document.getElementById('data-connect-page');
    if (overlay) overlay.hidden = false;
    setPath('real');
    setDcScreen('upload');
    dcHideError();
    updateDcReadButtonState();
    updateDcLinkStatus();
  }

  function closeDataConnectPage() {
    document.body.classList.remove('data-connect-active');
    const overlay = document.getElementById('data-connect-page');
    if (overlay) overlay.hidden = true;
    stopReadingMessages();
  }

  // Maps the user-facing missing-field labels (as sent by
  // summarizeSheetParse's OPTIONAL_FIELD_LABELS) back to the technical
  // field key manualInputs/the /api/simulate payload expects.
  const DC_LABEL_TO_FIELD_KEY = {
    'Customer / repeat orders': 'repeat_orders_proxy',
    'Order value': 'avg_order_value',
    'Delivery fee': 'delivery_fee',
    'Discounts / promos': 'promo_active',
  };
  const DC_FIELD_PROMPT = {
    repeat_orders_proxy: { title: 'Add customer info', sub: 'Do most of your orders come from repeat customers? Just answer yes or no.', placeholder: 'yes or no' },
    avg_order_value: { title: 'Add order value', sub: 'Roughly what does a typical order come to?', placeholder: 'e.g. 350' },
    delivery_fee: { title: 'Add delivery fee', sub: "What's your current delivery fee?", placeholder: 'e.g. 40' },
    promo_active: { title: 'Add discount info', sub: 'Have you run any discounts or promos recently? Just answer yes or no.', placeholder: 'yes or no' },
  };
  let dcManualFieldKey = null;

  function openDcManualEntry() {
    const missingLabels = lastSheetSummary?.missing_optional_labels || [];
    const firstLabel = missingLabels[0];
    const fieldKey = firstLabel ? DC_LABEL_TO_FIELD_KEY[firstLabel] : null;
    const prompt = fieldKey ? DC_FIELD_PROMPT[fieldKey] : null;
    dcManualFieldKey = fieldKey;

    const titleEl = document.getElementById('dc-manual-title');
    const subEl = document.getElementById('dc-manual-sub');
    const input = document.getElementById('dc-manual-value-input');
    if (prompt) {
      titleEl.textContent = prompt.title;
      subEl.textContent = prompt.sub;
      input.placeholder = prompt.placeholder;
    } else {
      titleEl.textContent = 'Add missing detail';
      subEl.textContent = 'Add anything that would help Hisaab understand your business better.';
      input.placeholder = '';
    }
    input.value = '';
    setDcScreen('manual');
    input.focus();
  }

  function wireDataConnectPage() {
    const closeBtn = document.getElementById('data-connect-close');
    if (closeBtn) closeBtn.addEventListener('click', closeDataConnectPage);
    document.addEventListener('keydown', (e) => {
      const overlay = document.getElementById('data-connect-page');
      if (e.key === 'Escape' && overlay && !overlay.hidden) closeDataConnectPage();
    });

    const readBtn = document.getElementById('dc-read-data-btn');
    if (readBtn) readBtn.addEventListener('click', () => {
      dcHideError();
      parseConnectedData();
    });

    const askCtaBtn = document.getElementById('dc-ask-cta-btn');
    if (askCtaBtn) askCtaBtn.addEventListener('click', () => {
      if (dataConnectRefreshMode && currentResult?.question) {
        // Refresh mode: re-run the SAME question the user already asked,
        // now against the newly-connected data. Reuses runSimulation()
        // completely unchanged — it already reads the now-active dataset
        // via getActiveDatasetPayload(), and renderResults() already closes
        // this modal the moment a real result is ready (fixed earlier this
        // session). No parallel recompute logic needed.
        askCtaBtn.disabled = true;
        askCtaBtn.textContent = t('lowconf.updating');
        runSimulation({ questionOverride: currentResult.question, skipValidation: true })
          .finally(() => {
            askCtaBtn.disabled = false;
            askCtaBtn.textContent = 'Ask Hisaab';
          });
        return;
      }
      renderDcSuggestedPrompts(lastSheetSummary?.suggested_questions || []);
      renderDcAskMissingNote(lastSheetSummary);
      setDcScreen('ask');
      questionInput.focus();
    });

    const manualLink = document.getElementById('dc-manual-link');
    if (manualLink) manualLink.addEventListener('click', openDcManualEntry);

    const manualCancelBtn = document.getElementById('dc-manual-cancel-btn');
    if (manualCancelBtn) manualCancelBtn.addEventListener('click', () => {
      setDcScreen('summary');
    });

    const manualSaveBtn = document.getElementById('dc-manual-save-btn');
    if (manualSaveBtn) manualSaveBtn.addEventListener('click', () => {
      const input = document.getElementById('dc-manual-value-input');
      const value = input?.value.trim();
      if (value && dcManualFieldKey) {
        // Feeds the SAME manualInputs mechanism the existing missing-fields
        // resubmit flow already uses — the next /api/simulate call
        // (whichever question is asked) includes this automatically. No new
        // parsing logic, no new endpoint.
        manualInputs[dcManualFieldKey] = value;
      }
      setDcScreen('summary');
    });
  }

  function wireCheckBack() {
    const card = document.getElementById('checkback-card');
    if (!card) return;
    const did = document.getElementById('cb-did');
    const didnt = document.getElementById('cb-didnt');
    const later = document.getElementById('cb-later');
    const skip = document.getElementById('cb-skip');
    const followup = document.getElementById('cb-followup');
    const options = document.getElementById('cb-options');
    const done = document.getElementById('cb-done');

    function showCheckBackDone(message) {
      if (options) options.hidden = true;
      if (followup) followup.hidden = true;
      if (done) { done.hidden = false; done.textContent = message; }
      if (skip) skip.hidden = true;
      window.setTimeout(() => { card.hidden = true; if (skip) skip.hidden = false; }, 2600);
    }

    if (did) did.addEventListener('click', () => {
      if (options) options.hidden = true;
      if (followup) followup.hidden = false;
    });
    if (didnt) didnt.addEventListener('click', async () => {
      await submitCheckBack({ didApply: false });
      showCheckBackDone(t('checkback.thanks_noted'));
    });
    if (later) later.addEventListener('click', () => { card.hidden = true; });
    if (skip) skip.addEventListener('click', () => { card.hidden = true; });
    card.querySelectorAll('.cb-outcome').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const outcome = btn.getAttribute('data-outcome');
        await submitCheckBack({ didApply: true, outcome });
        showCheckBackDone(t('checkback.thanks'));
      });
    });
  }

  async function submitCheckBack(payload) {
    if (!checkBackDecisionId) return;
    try {
      await fetch(`/api/decisions/${encodeURIComponent(checkBackDecisionId)}/checkback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...apiHeaders() },
        body: JSON.stringify(payload),
      });
      fetchDecisionsCount();
    } catch (_err) {
      /* fail silent — card still closes, user not blocked */
    }
  }

  // ── Bootstrap (zero-data daily check-in) ────────────────────────────────
  let bootstrapMinEntries = 20;

  function wireBootstrap() {
    const saveBtn = document.getElementById('bs-save-btn');
    if (!saveBtn) return;
    saveBtn.addEventListener('click', saveBootstrapEntry);
    const ordersInput = document.getElementById('bs-orders-input');
    if (ordersInput) {
      ordersInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') { e.preventDefault(); saveBootstrapEntry(); }
      });
    }
  }

  async function fetchBootstrapStatus() {
    try {
      const res = await fetch('/api/bootstrap/status', { headers: apiHeaders() });
      if (!res.ok) return;
      const body = await readJsonResponse(res);
      if (!body) return;
      bootstrapMinEntries = Number(body.minEntries) || 20;
      renderBootstrapProgress(Number(body.entryCount) || 0, body.ready, body.loggedToday);
    } catch (_err) {
      /* fail silent */
    }
  }

  function renderBootstrapProgress(count, ready, loggedToday) {
    const progress = document.getElementById('bs-progress');
    const label = document.getElementById('bs-progress-label');
    const doneNote = document.getElementById('bs-done-note');
    if (!progress || !label) return;
    // Render dots capped at minEntries; each logged day fills one.
    const total = bootstrapMinEntries;
    const filled = Math.min(count, total);
    progress.innerHTML = '';
    for (let i = 0; i < total; i++) {
      const dot = document.createElement('div');
      dot.className = 'bs-dot' + (i < filled ? ' done' : '');
      progress.appendChild(dot);
    }
    label.textContent = t('bootstrap.progress')
      .replace('{count}', count)
      .replace('{total}', total);
    if (doneNote) {
      if (ready) {
        doneNote.hidden = false;
        doneNote.textContent = t('bootstrap.ready');
      } else if (loggedToday) {
        doneNote.hidden = false;
        doneNote.textContent = t('bootstrap.already_today');
      } else {
        doneNote.hidden = true;
      }
    }
  }

  async function saveBootstrapEntry() {
    const ordersInput = document.getElementById('bs-orders-input');
    const feeInput = document.getElementById('bs-fee-input');
    const doneNote = document.getElementById('bs-done-note');
    if (!ordersInput) return;
    const orders = Number(ordersInput.value);
    if (!Number.isFinite(orders) || orders < 0) {
      ordersInput.focus();
      return;
    }
    const payload = { orders };
    const fee = Number(feeInput?.value);
    if (Number.isFinite(fee) && fee >= 0) payload.delivery_fee = fee;
    try {
      const res = await fetch('/api/bootstrap/entry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...apiHeaders() },
        body: JSON.stringify(payload),
      });
      if (!res.ok) return;
      const body = await readJsonResponse(res);
      ordersInput.value = '';
      bootstrapMinEntries = Number(body.minEntries) || bootstrapMinEntries;
      renderBootstrapProgress(Number(body.entryCount) || 0, body.ready, true);
      if (doneNote && !body.ready) {
        doneNote.hidden = false;
        doneNote.textContent = t('bootstrap.saved_today');
      }
    } catch (_err) {
      /* fail silent */
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
    if (navigator.mediaDevices?.getUserMedia && window.MediaRecorder) {
      micBtn.title = 'Tap to speak your question — in any language';
    } else {
      micBtn.title = 'Voice input is not supported in this browser';
      micBtn.setAttribute('aria-disabled', 'true');
    }
    setupLivePreview();
  }

  // Web Speech API is used ONLY to stream interim "is the mic hearing me?" text
  // into the textarea while the user speaks. The final authoritative transcript
  // always comes from the Gemini /api/transcribe roundtrip on stop, which is
  // what handles Hindi/Bengali/Tamil/code-switched speech accurately.
  function setupLivePreview() {
    const SpeechRecognitionCtor = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionCtor) {
      livePreview = null;
      return;
    }
    try {
      livePreview = new SpeechRecognitionCtor();
    } catch (_err) {
      livePreview = null;
      return;
    }
    livePreview.continuous = true;
    livePreview.interimResults = true;
    livePreview.maxAlternatives = 1;
    // en-IN is a reasonable baseline: English speakers see accurate live text;
    // Hindi/Bengali/Tamil speakers see an English-approximation which is
    // deliberately styled as a rough preview (.live-previewing on the textarea)
    // and gets replaced by Gemini's accurate version on stop.
    livePreview.lang = 'en-IN';

    livePreview.onresult = event => {
      if (!livePreviewActive) return;
      let interim = '';
      let finalPart = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const chunk = result[0]?.transcript || '';
        if (result.isFinal) finalPart += chunk;
        else interim += chunk;
      }
      if (finalPart) livePreviewText = (livePreviewText + ' ' + finalPart).trim();
      const combined = (livePreviewText + ' ' + interim).trim();
      if (combined) {
        questionInput.value = combined;
        resizeQuestion();
        updateQuestionState();
        hideValidationNudge();
      }
    };

    livePreview.onerror = () => { /* silent — Gemini is still capturing */ };
    livePreview.onend = () => { /* end is expected on stopRecording */ };
  }

  function startLivePreview() {
    if (!livePreview) return;
    livePreviewActive = true;
    livePreviewText = '';
    questionInput.classList.add('live-previewing');
    try {
      livePreview.start();
    } catch (_err) {
      // start() throws if already running (e.g. rapid re-taps). Fine — either
      // it's already listening, or we'll just skip live feedback this round.
    }
  }

  function stopLivePreview() {
    livePreviewActive = false;
    if (!livePreview) return;
    try { livePreview.stop(); } catch (_err) { /* noop */ }
  }

  function toggleSpeech() {
    if (!(navigator.mediaDevices?.getUserMedia && window.MediaRecorder)) {
      showError('Voice input is not supported in this browser. Please type your question instead.');
      return;
    }
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      stopRecording('manual');
      return;
    }
    startRecording();
  }

  // Silence-detection tuning. We stop recording after SILENCE_MS of continuous
  // low-volume audio, but only once the speaker has actually said something
  // (crossed SPEECH_THRESHOLD at least once). This gives a Siri-like feel
  // without cutting people off before they start.
  const SPEECH_THRESHOLD = 0.015;   // normalized RMS above this = speech
  const SILENCE_THRESHOLD = 0.010;  // normalized RMS below this = silence
  const SILENCE_MS = 1500;          // how long silence must last before auto-stop
  const MAX_RECORD_MS = 15000;      // hard cap on any single recording
  const MIN_RECORD_MS = 500;        // ignore stops within the first 500ms

  let recorderCleanup = null;

  async function startRecording() {
    hideError();
    let stream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (err) {
      const denied = err && (err.name === 'NotAllowedError' || err.name === 'SecurityError');
      showError(denied
        ? 'Microphone access is blocked. Allow mic access in your browser settings, then try again.'
        : 'Could not start the microphone. Check your input device and try again.');
      return;
    }

    mediaChunks = [];
    const recorderOptions = preferredRecorderOptions();
    try {
      mediaRecorder = recorderOptions
        ? new MediaRecorder(stream, recorderOptions)
        : new MediaRecorder(stream);
    } catch (_err) {
      stopRecorderTracks(stream);
      showError('Voice recording is not supported in this browser. Please type your question instead.');
      return;
    }

    const startedAt = Date.now();
    let silenceTimer = null;
    let hasSpokenYet = false;
    let audioCtx = null;
    let rafHandle = null;

    // Analyser for silence detection. Runs off the same stream, no extra mic prompt.
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        audioCtx = new AudioCtx();
        const source = audioCtx.createMediaStreamSource(stream);
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 1024;
        source.connect(analyser);
        const buffer = new Uint8Array(analyser.fftSize);

        const tick = () => {
          if (!mediaRecorder || mediaRecorder.state !== 'recording') return;
          analyser.getByteTimeDomainData(buffer);
          // Normalized RMS around 128 (silence midpoint for 8-bit PCM).
          let sumSq = 0;
          for (let i = 0; i < buffer.length; i++) {
            const v = (buffer[i] - 128) / 128;
            sumSq += v * v;
          }
          const rms = Math.sqrt(sumSq / buffer.length);

          if (rms > SPEECH_THRESHOLD) {
            hasSpokenYet = true;
            if (silenceTimer) {
              window.clearTimeout(silenceTimer);
              silenceTimer = null;
            }
          } else if (hasSpokenYet && rms < SILENCE_THRESHOLD && !silenceTimer) {
            silenceTimer = window.setTimeout(() => {
              if (mediaRecorder && mediaRecorder.state === 'recording') {
                stopRecording('silence');
              }
            }, SILENCE_MS);
          }
          rafHandle = window.requestAnimationFrame(tick);
        };
        rafHandle = window.requestAnimationFrame(tick);
      }
    } catch (_err) {
      // If AnalyserNode setup fails, we still work — user can tap-to-stop,
      // and the hard cap below will fire regardless.
    }

    recorderCleanup = () => {
      if (silenceTimer) { window.clearTimeout(silenceTimer); silenceTimer = null; }
      if (rafHandle) { window.cancelAnimationFrame(rafHandle); rafHandle = null; }
      if (audioCtx) { audioCtx.close().catch(() => {}); audioCtx = null; }
      stopRecorderTracks(stream);
    };

    mediaRecorder.ondataavailable = event => {
      if (event.data && event.data.size > 0) mediaChunks.push(event.data);
    };
    mediaRecorder.onerror = () => {
      if (recorderCleanup) { recorderCleanup(); recorderCleanup = null; }
      stopLivePreview();
      questionInput.classList.remove('live-previewing');
      setRecordingState(false);
      showError('Voice recording failed. Try again, or type your question instead.');
    };
    mediaRecorder.onstop = async () => {
      window.clearTimeout(recorderStopTimer);
      recorderStopTimer = null;
      if (recorderCleanup) { recorderCleanup(); recorderCleanup = null; }
      stopLivePreview();
      setRecordingState(false);
      const elapsed = Date.now() - startedAt;
      if (elapsed < MIN_RECORD_MS || !hasSpokenYet) {
        mediaChunks = [];
        // Clear any live-preview leftovers if the recording was too short/empty.
        questionInput.classList.remove('live-previewing');
        if (livePreviewText) {
          livePreviewText = '';
          questionInput.value = '';
          resizeQuestion();
          updateQuestionState();
        }
        showError('I didn\'t catch anything. Tap the mic and try speaking again.');
        return;
      }
      await transcribeRecording();
    };

    mediaRecorder.start();
    setRecordingState(true);
    startLivePreview();
    // Hard cap so a stuck recording can't run forever.
    recorderStopTimer = window.setTimeout(() => {
      if (mediaRecorder && mediaRecorder.state === 'recording') {
        stopRecording('timeout');
      }
    }, MAX_RECORD_MS);
  }

  function stopRecording(_reason) {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
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
    micBtn.title = isRecording ? 'Listening... tap to stop' : 'Tap to speak your question — in English, Hindi, or Hinglish';
    const listeningNote = document.getElementById('mic-listening-note');
    if (listeningNote) listeningNote.hidden = !isRecording;
  }

  function stopRecorderTracks(stream) {
    try { stream.getTracks().forEach(track => track.stop()); } catch (_err) { /* noop */ }
  }

  async function transcribeRecording() {
    if (!mediaChunks.length) {
      questionInput.classList.remove('live-previewing');
      showError('I didn\'t catch anything. Tap the mic and try speaking again.');
      return;
    }

    const blob = new Blob(mediaChunks, { type: mediaChunks[0].type || 'audio/webm' });
    const audioBase64 = await blobToBase64(blob);
    micBtn.disabled = true;
    micBtn.classList.add('transcribing');
    micBtn.title = 'Transcribing...';
    // Keep the live-preview text visible during transcribing so the user has
    // continuity, but mark it as "being refined" via the previewing class.

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
      // Gemini's transcript is authoritative — replace whatever the live preview
      // put in the textarea. If Gemini returns empty, fall back to the preview
      // text so the user isn't left with nothing.
      const finalTranscript = (body.transcript || '').trim() || livePreviewText || '';
      questionInput.value = finalTranscript;
      resizeQuestion();
      updateQuestionState();
      hideValidationNudge();
      questionInput.focus();
    } catch (err) {
      // If Gemini failed but we do have live-preview text, keep it — better than
      // nothing, and clearly marked as preview to the user.
      if (!livePreviewText) showError(err.message);
      else showError(`Couldn't refine the transcription (${err.message}). Using the rough live preview — feel free to edit before running.`);
    } finally {
      micBtn.disabled = false;
      micBtn.classList.remove('transcribing');
      micBtn.title = 'Tap to speak your question — in any language';
      questionInput.classList.remove('live-previewing');
      livePreviewText = '';
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
    if (!questionInput.value.trim()) {
      questionInput.style.height = '';
      return;
    }
    questionInput.style.height = 'auto';
    questionInput.style.height = Math.min(questionInput.scrollHeight, 200) + 'px';
  }

  function resizeRefineQuestion() {
    refineQuestion.style.height = 'auto';
    refineQuestion.style.height = Math.min(refineQuestion.scrollHeight, 120) + 'px';
  }

  function updateQuestionState() {
    const hasText = questionInput.value.trim().length > 0;
    simulateBtn.classList.toggle('ready', hasText);
    simulateBtn.disabled = !hasText;
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
    hideGuidanceMessage();
    hideError();
    stopIntro();
    stage.scrollIntoView({ behavior: 'smooth', block: 'start' });
    updateAwayFromLandingState();
  }

  function restoreDataConnectorToHome() {
    // sheetSlot/dataDetected's real permanent home is inside the Add-my-data
    // modal's upload screen (#dc-screen-upload) — that's where they live for
    // the fresh-connect flow. openInlineDataConnector() temporarily borrows
    // them into #inline-data-mount while the user upgrades to real data
    // from directly within an existing result; this puts them back.
    //
    // The previous version of this function assumed their home was directly
    // inside <main id="stage"> (true in the pre-redesign architecture) and
    // moved them there unconditionally whenever parentElement !== stage —
    // which is ALWAYS true now, since their real home was moved into the
    // modal. That meant every "New question" reset was forcibly relocating
    // them out of the modal onto the plain landing page, visibly breaking
    // it — the exact bug reported via screenshot.
    const homeContainer = document.getElementById('dc-screen-upload');
    const dcErrorBanner = document.getElementById('dc-error-banner');
    if (homeContainer) {
      if (sheetSlot.parentElement !== homeContainer) homeContainer.insertBefore(sheetSlot, dcErrorBanner || null);
      if (dataDetected.parentElement !== homeContainer) homeContainer.insertBefore(dataDetected, dcErrorBanner || null);
    }
    // missingSection has always lived directly in <main id="stage"> (it was
    // never moved into the modal by openInlineDataConnector), so this part
    // is unrelated to the modal redesign and stays as-is.
    if (missingSection.parentElement !== stage) stage.insertBefore(missingSection, errorBanner);
  }

  function openInlineDataConnector() {
    if (!currentResult) {
      resetToComposer();
      setPath('real');
      sheetUrlInput.focus();
      return;
    }
    // Unified with the main "Add my data" experience: this used to move
    // sheetSlot/dataDetected inline directly onto the results page (a
    // second, more cluttered upload UI, duplicating the clean modal built
    // for the fresh-connect flow). Now it opens that SAME modal in refresh
    // mode — read data -> honest summary -> Ask Hisaab re-runs the current
    // question and closes automatically once the updated result is ready.
    hideError();
    openDataConnectPage({ refreshMode: true });
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
    addRealDataBtn.textContent = t('lowconf.updating');
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
    questionInput.style.height = '';
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
    // #composer no longer exists as a standalone element in the redesigned
    // Ask Hisaab screen (replaced by .dc-ask-input-wrap + a separate
    // .dc-cta-row) — `composer` is null there. This previously threw a
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
    // Also remove the scenarios-layout modifier: a subsequent weak-data
    // result should render at its normal position, not with the top-spacing
    // that scenarios-mode adds.
    resultsSection.classList.remove('with-scenarios');
    const scenariosBlock = document.getElementById('scenarios-block');
    if (scenariosBlock) scenariosBlock.hidden = true;
    if (!options.keepTrajectory) stage.classList.remove('has-result', 'connecting-data');
    intentPrompt.classList.remove('show', 'captured');
    viewInLog.hidden = true;
    intentError.hidden = true;
    window.clearTimeout(intentPromptTimer);
    // A new question should never inherit a previous answer's green
    // confirmed state.
    document.querySelectorAll('.s-cta.selected, .intent-btn.selected').forEach((el) => el.classList.remove('selected'));
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
  }

  function showValidationNudge() {
    validationNudge.hidden = false;
    validationNudge.classList.add('show');
    // The main #validation-nudge lives in <main id="stage">, which is
    // hidden behind the data-connect-page overlay (z-index 200) whenever
    // that's open. Without this, a rejected question from the Ask Hisaab
    // screen would silently refocus the textarea with zero visible
    // explanation — a real bug caught via user testing. Sync a second,
    // in-context nudge that's actually visible from inside that overlay.
    const dcNudge = document.getElementById('dc-validation-nudge');
    if (dcNudge) dcNudge.hidden = false;
    updateAwayFromLandingState();
  }

  function hideValidationNudge() {
    validationNudge.hidden = true;
    validationNudge.classList.remove('show');
    const dcNudge = document.getElementById('dc-validation-nudge');
    if (dcNudge) dcNudge.hidden = true;
    updateAwayFromLandingState();
  }

  function hideError() {
    errorBanner.hidden = true;
    errorBanner.classList.remove('show');
    errorMsg.textContent = '';
  }

  function showError(msg) {
    // Same root cause as the validation-nudge and missing-fields fixes: the
    // main error banner is hidden behind the data-connect-page overlay if
    // that's still open. An invisible error is worse than a visible one
    // that closes the modal, so close it here too.
    const dataConnectOverlay = document.getElementById('data-connect-page');
    if (dataConnectOverlay && !dataConnectOverlay.hidden) closeDataConnectPage();
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
    addRealDataBtn.textContent = connected ? t('lowconf.update_data') : t('lowconf.add_data');
    connectedDataNote.hidden = !connected;
    if (!connected) {
      connectedDataText.textContent = t('data.using_this');
      return;
    }
    const label = activeDataset.label || dataLabelFromSource(source);
    connectedDataText.textContent = t('data.using_this_labeled').replace('{label}', label);
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
    if (activeDataset.kind === 'sample') return t('data_source.sample');
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
    const isHindi = currentUILang === 'hi';
    if (value === null || low === null || high === null) {
      return isHindi
        ? 'संख्यात्मक चार्ट व्याख्या बनाने के लिए पर्याप्त विश्वसनीय इतिहास नहीं था।'
        : 'There was not enough reliable history to draw a numeric chart interpretation.';
    }
    if (isWeak || (low < 0 && high > 0)) {
      return isHindi
        ? `यह रेखा ऊपर-नीचे होती रहती है, लेकिन अभी तक कोई स्पष्ट संबंध स्थापित नहीं हो पाया है। <b>इसीलिए ऊपर दिए गए ${formatPct(value)} के आंकड़े को सावधानीपूर्वक लेना चाहिए।</b>`
        : `The line moves up and down without a clear enough relationship yet. <b>That's why the ${formatPct(value)} above should be treated carefully.</b>`;
    }
    if (isHindi) {
      const directionHi = value >= 0 ? 'बढ़े' : 'घटे';
      return `हाल का ऑर्डर पैटर्न गणना को उसकी दिशा देता है। <b>इस बदलाव से सबसे ज्यादा जुड़े महीनों में ऑर्डर ${directionHi}।</b>`;
    }
    const direction = value >= 0 ? 'rose' : 'dipped';
    return `The recent order pattern gives the calculation its direction. <b>Orders ${direction} in the months most relevant to this change.</b>`;
  }

  function rangeText(low, high, value, isWeak) {
    const isHindi = currentUILang === 'hi';
    if (low === null || high === null) {
      return isHindi
        ? 'संभावित सीमा: अज्ञात — गणना ने पर्याप्त सीमा डेटा नहीं दिया।'
        : 'Likely range: unknown — the calculation did not return enough range data.';
    }
    // A range that is flat at (or essentially at) zero on both ends is not
    // "pointing" anywhere — it means the calculation could not produce any
    // directional signal at all (e.g. an unsupported lever, or a lever with
    // no usable variation), not a genuine upward/downward skew. Calling
    // that "mostly points upward" would be a description with no real
    // basis, so it gets its own honest phrase instead of falling into the
    // directional branches below.
    const isFlatZero = Math.abs(low) < 0.05 && Math.abs(high) < 0.05;
    if (isHindi) {
      const interpretationHi = isFlatZero
        ? 'इस डेटा से कोई मापने योग्य दिशा नहीं दिखती।'
        : low < 0 && high > 0
          ? 'शून्य को पार करती है, इसलिए कोई स्पष्ट दिशा नहीं है।'
          : value !== null && value >= 0
            ? 'ज्यादातर ऊपर की ओर इशारा करती है।'
            : 'ज्यादातर नीचे की ओर इशारा करती है।';
      return `संभावित सीमा: ${formatPct(low)} से ${formatPct(high)} — ${interpretationHi}`;
    }
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
    if (!Number.isFinite(value)) return t('result.confidence.unknown');
    const pct = Math.round(value * 100);
    const key = pct >= 70 ? 'result.confidence.high' : pct >= 35 ? 'result.confidence.medium' : 'result.confidence.low';
    return `${t(key)} · ${pct}%`;
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
