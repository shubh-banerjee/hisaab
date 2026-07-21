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
      'result.confidence.high': 'You can trust this more',
      'result.confidence.medium': 'Useful direction, but test first',
      'result.confidence.low': 'Early signal only',
      'result.confidence.unknown': 'Not enough data yet',
      'result.intent.applied': 'Yes, I tried it',
      'result.intent.skipped': 'No, I skipped it',
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
      'evidence.lower_estimate': 'lower estimate',
      'evidence.recent_trend': 'recent trend',
      'evidence.chart_label': 'Orders · recent history',
      'evidence.sample_tag': 'Illustrative demo — not your data',
      'evidence.earlier': 'Earlier',
      'evidence.now': 'Now',
      'data_source.sample': 'Demo example',
      'scenarios.you_asked': 'You asked',
      'scenarios.based_on': 'Based on {months} months of your own history.',
      'scenarios.threshold_label': 'Where safe turns risky',
      'scenarios.see_details': 'Show the numbers behind this',
      'track.see_all': 'See all →',
      'track.within': 'Within {pp} points on {hits} of your last {total} calls.',
      'track.latest': 'After the last change, you got {actual}.',
      'checkback.eyebrow': 'Quick check-in',
      'checkback.did': 'Yes, I tried it',
      'checkback.didnt': 'No, I skipped it',
      'checkback.later': 'Not sure yet',
      'checkback.sub': 'Did you try this?',
      'checkback.question': 'A while ago, you decided to try: {question}',
      'checkback.followup_label': 'What happened to your orders after that?',
      'checkback.went_up': 'Went up',
      'checkback.stayed_same': 'Stayed about the same',
      'checkback.went_down': 'Went down',
      'checkback.skip': 'Skip this check-in',
      'checkback.thanks': 'Thanks — saved. This now counts toward your track record.',
      'checkback.thanks_noted': 'Got it — noted that you skipped this one.',
      'path.bootstrap': 'Add today’s sales manually',
      'bootstrap.eyebrow': 'Building your history',
      'bootstrap.question': 'Roughly how many orders did you get yesterday?',
      'bootstrap.sub': 'No spreadsheet needed — just a rough number, typed or spoken. After a few weeks of this, Hisaab can answer real what-ifs for you.',
      'bootstrap.save': "Save today's number",
      'bootstrap.fee_optional': 'Current delivery fee (optional — helps test fee changes later)',
      'bootstrap.progress': '{count} of ~{total} days logged',
      'bootstrap.ready': "You have enough history now — ask a what-if question below.",
      'bootstrap.saved_today': "Saved. Come back tomorrow and log again — consistency is what makes this work.",
      'bootstrap.already_today': "You've already logged today. Come back tomorrow.",
      'bootstrap_gate.eyebrow': 'Not enough evidence yet',
      'bootstrap_gate.title': 'Hisaab needs a little more daily sales history.',
      'bootstrap_gate.copy': 'You have not added enough daily sales history for Hisaab to estimate this honestly.',
      'bootstrap_gate.add': 'Add today’s sales',
      'bootstrap_gate.demo': 'See demo example',
      'scenarios.based_on_bootstrap': 'Based on {months} months of self-reported daily history.',
    },
    hi: {
      'chrome.new_question': 'नया प्रश्न',
      'chrome.your_decisions': 'आपके निर्णय',
      'result.what_this_means': 'इसका क्या अर्थ है',
      'result.confidence.high': 'इस पर ज़्यादा भरोसा कर सकते हैं',
      'result.confidence.medium': 'दिशा उपयोगी है, पहले जाँचें',
      'result.confidence.low': 'अभी शुरुआती संकेत है',
      'result.confidence.unknown': 'अभी पर्याप्त डेटा नहीं है',
      'result.intent.applied': 'हाँ, मैंने आजमाया',
      'result.intent.skipped': 'नहीं, मैंने छोड़ दिया',
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
      'evidence.lower_estimate': 'निचला अनुमान',
      'evidence.recent_trend': 'हाल की प्रवृत्ति',
      'evidence.chart_label': 'ऑर्डर · हाल का इतिहास',
      'evidence.sample_tag': 'डेमो उदाहरण — आपका डेटा नहीं',
      'evidence.earlier': 'पहले',
      'evidence.now': 'अभी',
      'data_source.sample': 'डेमो उदाहरण',
      'scenarios.you_asked': 'आपने पूछा',
      'scenarios.based_on': 'आपके अपने {months} महीनों के इतिहास के आधार पर।',
      'scenarios.threshold_label': 'जहाँ सुरक्षित से जोखिम शुरू होता है',
      'scenarios.see_details': 'इसके पीछे के आंकड़े दिखाएं',
      'track.see_all': 'सभी देखें →',
      'track.within': 'आपके पिछले {total} में से {hits} बार {pp} अंकों के भीतर सही रहे।',
      'track.latest': 'पिछली बार बदलाव के बाद आपको {actual} मिला।',
      'checkback.eyebrow': 'छोटी सी जानकारी',
      'checkback.did': 'हाँ, मैंने आजमाया',
      'checkback.didnt': 'नहीं, मैंने छोड़ दिया',
      'checkback.later': 'अभी पक्का नहीं है',
      'checkback.sub': 'क्या आपने इसे आजमाया?',
      'checkback.question': 'कुछ समय पहले, आपने यह आजमाने का फैसला किया था: {question}',
      'checkback.followup_label': 'उसके बाद आपके ऑर्डर का क्या हुआ?',
      'checkback.went_up': 'बढ़ गए',
      'checkback.stayed_same': 'लगभग वैसे ही रहे',
      'checkback.went_down': 'घट गए',
      'checkback.skip': 'इस जानकारी को छोड़ें',
      'checkback.thanks': 'धन्यवाद — सहेज लिया। यह अब आपके ट्रैक रिकॉर्ड में गिना जाएगा।',
      'checkback.thanks_noted': 'समझ गए — नोट कर लिया कि आपने इसे छोड़ दिया।',
      'path.bootstrap': 'आज की बिक्री हाथ से जोड़ें',
      'bootstrap.eyebrow': 'आपका इतिहास बन रहा है',
      'bootstrap.question': 'कल आपको लगभग कितने ऑर्डर मिले?',
      'bootstrap.sub': 'किसी शीट की ज़रूरत नहीं — बस एक मोटा नंबर, लिखकर या बोलकर। कुछ हफ़्तों बाद Hisaab आपके लिए असली सवालों के जवाब दे पाएगा।',
      'bootstrap.save': 'आज का नंबर सहेजें',
      'bootstrap.fee_optional': 'मौजूदा डिलीवरी शुल्क (वैकल्पिक — बाद में शुल्क बदलाव जाँचने में मदद करता है)',
      'bootstrap.progress': '~{total} में से {count} दिन दर्ज',
      'bootstrap.ready': 'अब आपके पास पर्याप्त इतिहास है — नीचे कोई what-if सवाल पूछें।',
      'bootstrap.saved_today': 'सहेज लिया। कल फिर आकर दर्ज करें — निरंतरता ही इसे कारगर बनाती है।',
      'bootstrap.already_today': 'आपने आज पहले ही दर्ज कर दिया है। कल फिर आएं।',
      'bootstrap_gate.eyebrow': 'अभी पर्याप्त सबूत नहीं हैं',
      'bootstrap_gate.title': 'Hisaab को थोड़े और रोज़ के बिक्री इतिहास की ज़रूरत है।',
      'bootstrap_gate.copy': 'Hisaab ईमानदारी से अनुमान लगाने के लिए आपके रोज़ के बिक्री इतिहास में अभी पर्याप्त जानकारी नहीं है।',
      'bootstrap_gate.add': 'आज की बिक्री जोड़ें',
      'bootstrap_gate.demo': 'डेमो उदाहरण देखें',
      'scenarios.based_on_bootstrap': 'आपके द्वारा दर्ज किए गए रोज़ के इतिहास के {months} महीनों के आधार पर।',
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
  const heroSupport = document.getElementById('hero-support');
  const pathChooser = document.getElementById('path-chooser');
  const homeNote = document.getElementById('home-note');
  const checkbackCard = document.getElementById('checkback-card');
  const questionInput = document.getElementById('question-input');
  const sheetUrlInput = document.getElementById('sheet-url-input');
  const uploadSheetUrlInput = document.getElementById('upload-sheet-url');
  const clearSheetUrl = document.getElementById('clear-sheet-url');
  const csvUploadLink = document.getElementById('csv-upload-link');
  const csvFileInput = document.getElementById('csv-file-input');
  const pathSample = document.getElementById('path-sample');
  const pathUseData = document.getElementById('path-use-data');
  const demoIntro = document.getElementById('demo-intro');
  const demoUseData = document.getElementById('demo-use-data');
  const demoAnotherQuestion = document.getElementById('demo-another-question');
  const demoStart = document.getElementById('demo-start');
  const demoIntroHome = document.getElementById('demo-intro-home');
  const demoToQuestions = document.getElementById('demo-to-questions');
  const demoFoundHome = document.getElementById('demo-found-home');
  const demoQuestionsHome = document.getElementById('demo-questions-home');
  const demoResultAnother = document.getElementById('demo-result-another');
  const demoResultUpload = document.getElementById('demo-result-upload');
  const demoResultHome = document.getElementById('demo-result-home');
  const demoProgressLabel = document.getElementById('demo-progress-label');
  const demoResultTitle = document.getElementById('demo-result-title');
  const demoResultAnswer = document.getElementById('demo-result-answer');
  const demoResultWhy = document.getElementById('demo-result-why');
  const demoResultAction = document.getElementById('demo-result-action');
  const demoResultStrength = document.getElementById('demo-result-strength');
  const pathReal = document.getElementById('path-real');
  const pathSheet = document.getElementById('path-sheet');
  const pathBootstrap = document.getElementById('path-bootstrap');
  const uploadBack = document.getElementById('upload-back');
  const dataOptions = document.getElementById('data-options');
  const readingView = document.getElementById('reading-view');
  const readingStep = document.getElementById('reading-step');
  const readingProgressBar = document.getElementById('reading-progress-bar');
  const dataReadyView = document.getElementById('data-ready-view');
  const dataReadyCopy = document.getElementById('data-ready-copy');
  const dataReadyFoundSection = document.getElementById('data-ready-found-section');
  const dataReadyFound = document.getElementById('data-ready-found');
  const dataReadyMissingSection = document.getElementById('data-ready-missing-section');
  const dataReadyMissing = document.getElementById('data-ready-missing');
  const dataReadyAllFound = document.getElementById('data-ready-all-found');
  const dataReadyQuestionSection = document.getElementById('data-ready-question-section');
  const dataReadyQuestions = document.getElementById('data-ready-questions');
  const dataReadyAsk = document.getElementById('data-ready-ask');
  const dataReadyFix = document.getElementById('data-ready-fix');
  const dataReadyUpload = document.getElementById('data-ready-upload');
  const fixDataView = document.getElementById('fix-data-view');
  const fixDataBack = document.getElementById('fix-data-back');
  const fixDataTitle = document.getElementById('fix-data-title');
  const fixDataSubtitle = document.getElementById('fix-data-subtitle');
  const fixDataItems = document.getElementById('fix-data-items');
  const fixDataSuccess = document.getElementById('fix-data-success');
  const fixDataEmpty = document.getElementById('fix-data-empty');
  const fixDataDifferentQuestion = document.getElementById('fix-data-different-question');
  const fixDataDone = document.getElementById('fix-data-done');
  const dataErrorView = document.getElementById('data-error-view');
  const dataErrorRetry = document.getElementById('data-error-retry');
  const dataErrorUpload = document.getElementById('data-error-upload');
  const askView = document.getElementById('ask-view');
  const askBackDataReady = document.getElementById('ask-back-data-ready');
  const askExample = document.getElementById('ask-example');
  const askSuggestions = document.getElementById('ask-suggestions');
  const askQuestionList = document.getElementById('ask-question-list');
  const askCategoryList = document.getElementById('ask-category-list');
  const askCategoryQuestions = document.getElementById('ask-category-questions');
  const sheetSlot = document.getElementById('sheet-slot');
  const dataDetected = document.getElementById('data-detected');
  const detectedHeadline = document.getElementById('detected-headline');
  const detectedBody = document.getElementById('detected-body');
  const mappingPanel = document.getElementById('mapping-panel');
  const mappingFoundGroup = document.getElementById('mapping-found-group');
  const mappingFound = document.getElementById('mapping-found');
  const mappingMissingGroup = document.getElementById('mapping-missing-group');
  const mappingMissing = document.getElementById('mapping-missing');
  const mappingCapabilities = document.getElementById('mapping-capabilities');
  const mappingNext = document.getElementById('mapping-next');
  const mappingAvailableQuestions = document.getElementById('mapping-available-questions');
  const mappingLaterList = document.getElementById('mapping-later-list');
  const mappingContinue = document.getElementById('mapping-continue');
  const mappingFix = document.getElementById('mapping-fix');
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
  const langNote = document.querySelector('.lang-note');
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
  const bootstrapGate = document.getElementById('bootstrap-gate');
  const bootstrapGateProgress = document.getElementById('bootstrap-gate-progress');
  const bootstrapGateAdd = document.getElementById('bootstrap-gate-add');
  const bootstrapGateDemo = document.getElementById('bootstrap-gate-demo');
  const evidenceLimitation = document.getElementById('evidence-limitation');
  const evidenceLimitationEyebrow = document.getElementById('evidence-limitation-eyebrow');
  const evidenceLimitationTitle = document.getElementById('evidence-limitation-title');
  const evidenceLimitationCopy = document.getElementById('evidence-limitation-copy');
  const evidenceLimitationDetail = document.getElementById('evidence-limitation-detail');
  const intentChoiceList = document.getElementById('intent-choice-list');
  const evidenceLimitationPrimary = document.getElementById('evidence-limitation-primary');
  const evidenceLimitationSecondary = document.getElementById('evidence-limitation-secondary');
  const evidenceLimitationTertiary = document.getElementById('evidence-limitation-tertiary');
  const resultOverview = document.getElementById('result-overview');
  const overviewAnswer = document.getElementById('overview-answer');
  const overviewStrength = document.getElementById('overview-strength');
  const overviewWhy = document.getElementById('overview-why');
  const overviewAction = document.getElementById('overview-action');
  const overviewChoices = document.getElementById('overview-choices');
  const overviewData = document.getElementById('overview-data');
  const resultPrimaryAction = document.getElementById('result-primary-action');
  const resultSecondaryAction = document.getElementById('result-secondary-action');
  const resultTertiaryAction = document.getElementById('result-tertiary-action');
  const resultDetailsCopy = document.getElementById('result-details-copy');
  const trendResult = document.getElementById('trend-result');
  const trendSimpleAnswer = document.getElementById('trend-simple-answer');
  const trendChange = document.getElementById('trend-change');
  const trendRecentLabel = document.getElementById('trend-recent-label');
  const trendRecentAverage = document.getElementById('trend-recent-average');
  const trendPreviousLabel = document.getElementById('trend-previous-label');
  const trendPreviousAverage = document.getElementById('trend-previous-average');
  const trendBestPeriod = document.getElementById('trend-best-period');
  const trendWorstPeriod = document.getElementById('trend-worst-period');
  const trendEvidenceStrength = document.getElementById('trend-evidence-strength');
  const trendWhy = document.getElementById('trend-why');
  const trendNextAction = document.getElementById('trend-next-action');
  const trendDetailsCopy = document.getElementById('trend-details-copy');
  const calculationDetails = document.getElementById('calculation-details');
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
  const intentStartDateRow = document.getElementById('intent-start-date-row');
  const intentStartDate = document.getElementById('intent-start-date');
  const intentStartDateSave = document.getElementById('intent-start-date-save');
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

  const pageGreetingPhrases = ['Hisaab'];
  const loaderPhrases = ['Hello', 'नमस्ते', 'নমস্কার', 'வணக்கம்'];
  const decisionVocabulary = /\b(raise|raised|raising|lower|lowered|change|changed|add|added|remove|removed|stop|start|increase|increased|decrease|decreased|run|running|try|offer|offering|reduce|reduced|cut|discount)\b/i;
  const subjectVocabulary = /\b(fee|fees|price|prices|promo|promotion|discount|cod|cash on delivery|delivery|shipping|orders?|repeat|customer|customers|revenue|aov|month|months)\b/i;

  let activePath = 'sample';
  let currentView = 'home';
  let fixDataContext = 'general';
  let missingFieldTarget = '';
  let fixDataReturnView = 'dataReady';
  let fixDataReturnQuestion = '';
  let demoStep = 'intro';
  let selectedDemoQuestion = '';
  let readingTimer = null;
  let askExampleTimer = null;
  let readingStepIndex = 0;
  const readingSteps = [
    'Reading your file...',
    'Finding orders...',
    'Checking sales amount...',
    'Checking delivery fees...',
    'Checking discounts...',
    'Preparing simple summary...',
  ];
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
  let manualMappings = {};
  let mappingChoices = {};
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
  let activeDecisionFilter = 'all';
  let lastSavedDecisionId = null;

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

  pathSample.addEventListener('click', () => openDemoIntro());
  document.querySelectorAll('.demo-question').forEach(button => {
    button.addEventListener('click', () => selectDemoQuestion(button.dataset.demoQuestion || 'trend'));
  });
  if (demoUseData) demoUseData.addEventListener('click', () => {
    openUploadOptions();
  });
  if (demoAnotherQuestion) demoAnotherQuestion.addEventListener('click', () => {
    hideResults();
    setDemoStep('chooseQuestion');
  });
  if (demoStart) demoStart.addEventListener('click', () => setDemoStep('foundData'));
  if (demoIntroHome) demoIntroHome.addEventListener('click', resetToLanding);
  if (demoToQuestions) demoToQuestions.addEventListener('click', () => setDemoStep('chooseQuestion'));
  if (demoFoundHome) demoFoundHome.addEventListener('click', resetToLanding);
  if (demoQuestionsHome) demoQuestionsHome.addEventListener('click', resetToLanding);
  if (demoResultAnother) demoResultAnother.addEventListener('click', () => setDemoStep('chooseQuestion'));
  if (demoResultUpload) demoResultUpload.addEventListener('click', openUploadOptions);
  if (demoResultHome) demoResultHome.addEventListener('click', resetToLanding);
  if (pathUseData) pathUseData.addEventListener('click', () => {
    openUploadOptions();
  });
  if (uploadBack) uploadBack.addEventListener('click', () => resetToLanding());
  if (dataReadyAsk) dataReadyAsk.addEventListener('click', () => {
    dataDetected.classList.remove('show');
    showQuestionComposer();
    questionInput.focus();
  });
  if (dataReadyFix) dataReadyFix.addEventListener('click', openDataFixFlow);
  if (dataReadyUpload) dataReadyUpload.addEventListener('click', openUploadOptions);
  if (fixDataBack) fixDataBack.addEventListener('click', returnFromFixData);
  if (fixDataDone) fixDataDone.addEventListener('click', returnFromFixData);
  if (fixDataDifferentQuestion) fixDataDifferentQuestion.addEventListener('click', () => {
    fixDataReturnView = 'ask';
    fixDataReturnQuestion = '';
    showQuestionComposer();
    questionInput.focus();
  });
  if (askBackDataReady) askBackDataReady.addEventListener('click', backToDataReady);
  if (dataErrorRetry) dataErrorRetry.addEventListener('click', () => {
    if (uploadedCsv || sheetUrlInput.value.trim()) {
      startReadingView(uploadedCsv ? 'file' : 'sheet');
      parseConnectedData();
    } else {
      openUploadOptions();
    }
  });
  if (dataErrorUpload) dataErrorUpload.addEventListener('click', openUploadOptions);
  pathReal.addEventListener('click', () => {
    document.body.classList.add('upload-view-active');
    setPath('real');
    sheetSlot.classList.remove('open');
    csvFileInput.click();
  });
  if (pathSheet) pathSheet.addEventListener('click', () => {
    const value = uploadSheetUrlInput?.value.trim() || '';
    if (!value) {
      uploadSheetUrlInput?.focus();
      return;
    }
    document.body.classList.add('upload-view-active');
    sheetUrlInput.value = value;
    window.clearTimeout(parseTimer);
    setPath('real');
    sheetSlot.classList.remove('open');
    parseConnectedData();
  });
  if (pathBootstrap) pathBootstrap.addEventListener('click', () => {
    document.body.classList.remove('upload-view-active');
    showQuestionComposer();
    setPath('bootstrap');
    closeDataOptions();
  });
  if (bootstrapGateAdd) bootstrapGateAdd.addEventListener('click', () => {
    hideBootstrapGate();
    hideResults();
    setPath('bootstrap');
    document.getElementById('bootstrap-slot')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    document.getElementById('bs-orders-input')?.focus();
  });
  if (bootstrapGateDemo) bootstrapGateDemo.addEventListener('click', async () => {
    const demoQuestion = lastQuestion || questionInput.value.trim();
    hideBootstrapGate();
    hideResults();
    setPath('sample');
    if (demoQuestion) await runSimulation({ questionOverride: demoQuestion, skipValidation: true });
  });
  if (evidenceLimitationPrimary) evidenceLimitationPrimary.addEventListener('click', () => {
    hideEvidenceLimitation();
    hideResults();
    if (evidenceLimitationPrimary.dataset.action === 'question') {
      if (evidenceLimitationPrimary.dataset.prompt) {
        questionInput.value = evidenceLimitationPrimary.dataset.prompt;
        hideResults();
        runSimulation({ skipValidation: true });
        return;
      }
      questionInput.focus();
      return;
    }
    setPath('real');
    sheetUrlInput.focus();
  });
  if (evidenceLimitationSecondary) evidenceLimitationSecondary.addEventListener('click', () => {
    hideEvidenceLimitation();
    hideResults();
      if (evidenceLimitationSecondary.dataset.action === 'question') {
        if (evidenceLimitationSecondary.dataset.prompt) {
          questionInput.value = evidenceLimitationSecondary.dataset.prompt;
          hideResults();
          runSimulation({ skipValidation: true });
          return;
        }
        questionInput.focus();
        return;
    }
    setPath('bootstrap');
    document.getElementById('bootstrap-slot')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });
  if (evidenceLimitationTertiary) evidenceLimitationTertiary.addEventListener('click', () => {
    hideEvidenceLimitation();
    hideResults();
    setPath('sample');
    questionInput.focus();
  });
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
  if (uploadSheetUrlInput) uploadSheetUrlInput.addEventListener('input', () => {
    if (sheetUrlInput.value && sheetUrlInput.value !== uploadSheetUrlInput.value) {
      sheetUrlInput.value = '';
      renderSheetUrlState();
    }
  });
  sheetUrlInput.addEventListener('input', () => {
    clearCsvUpload();
    manualMappings = {};
    mappingChoices = {};
    manualInputs = {};
    lastUploadId = null;
    connectedDataLabel = sheetUrlInput.value.trim() ? dataLabelFromSheetUrl(sheetUrlInput.value.trim()) : '';
    renderSheetUrlState();
    hideApplyDataCta();
    scheduleSheetParse();
  });
  clearSheetUrl.addEventListener('click', () => {
    sheetUrlInput.value = '';
    manualMappings = {};
    mappingChoices = {};
    manualInputs = {};
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
  if (mappingContinue) mappingContinue.addEventListener('click', () => {
    dataDetected.classList.remove('show');
    alignDataPanelToSheetSlot();
    questionInput.focus();
    updateAwayFromLandingState();
  });
  if (mappingFix) mappingFix.addEventListener('click', () => {
    mappingPanel.classList.add('editing');
    mappingFix.hidden = true;
    mappingContinue.textContent = 'Done';
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
  if (intentStartDateSave) intentStartDateSave.addEventListener('click', saveIntentStartDate);
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
  wireDecisionFilters();
  wireBootstrap();
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

  function setCurrentView(view) {
    currentView = view;
    const viewClasses = ['view-home', 'view-upload', 'view-reading', 'view-data-ready', 'view-fix-data', 'view-demo', 'view-ask', 'view-result', 'view-error'];
    document.body.classList.remove(...viewClasses);
    document.body.classList.add(`view-${view.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`)}`);

    if (readingView) readingView.hidden = view !== 'reading';
    if (dataReadyView) dataReadyView.hidden = view !== 'dataReady';
    if (fixDataView) fixDataView.hidden = view !== 'fixData';
    if (dataErrorView) dataErrorView.hidden = view !== 'error';
    if (askView) askView.hidden = view !== 'ask';
    if (view !== 'ask') stopAskExampleRotation();

    const transitionView = view === 'reading' || view === 'dataReady' || view === 'error';
    if (transitionView || view === 'ask' || view === 'home' || view === 'demo' || view === 'fixData') {
      dataOptions.hidden = true;
      dataOptions.classList.remove('open');
      document.body.classList.remove('upload-view-active');
    }

    if (transitionView || view === 'ask' || view === 'fixData') {
      sheetSlot.classList.remove('open');
      dataDetected.classList.remove('show');
      demoIntro.hidden = true;
      demoIntro.classList.remove('open');
      sampleSuggestions.hidden = true;
      realSuggestions.hidden = true;
      if (langNote) langNote.hidden = view !== 'ask';
    }

    if (transitionView || view === 'fixData') {
      composer.hidden = true;
      pathChooser.hidden = true;
      if (homeNote) homeNote.hidden = true;
      hideResults();
      hideMissingInputs();
      hideValidationNudge();
      hideError();
    }
  }

  function stopReadingProgress() {
    if (readingTimer) {
      window.clearInterval(readingTimer);
      readingTimer = null;
    }
  }

  function renderReadingStep(index) {
    readingStepIndex = Math.max(0, Math.min(index, readingSteps.length - 1));
    if (readingStep) readingStep.textContent = readingSteps[readingStepIndex];
    if (readingProgressBar) {
      const progress = ((readingStepIndex + 1) / readingSteps.length) * 100;
      readingProgressBar.style.width = `${progress}%`;
    }
  }

  function startReadingView(source = 'file') {
    stopReadingProgress();
    setCurrentView('reading');
    renderReadingStep(source === 'sheet' ? 0 : 0);
    readingTimer = window.setInterval(() => {
      if (readingStepIndex < readingSteps.length - 1) renderReadingStep(readingStepIndex + 1);
    }, 700);
  }

  function showDataReady(summary) {
    stopReadingProgress();
    if (readingProgressBar) readingProgressBar.style.width = '100%';
    renderDataReadySummary(summary);
    setCurrentView('dataReady');
  }

  const dataReadyConcepts = {
    order_count_identifier: { label: 'Orders', found: true },
    order_date: { label: 'Dates', found: true },
    order_value_or_price: { label: 'Sales amount', found: true },
    shipping_or_delivery_fee: { label: 'Delivery fee', found: true },
    promotional_flag: { label: 'Discount or offer details', found: true },
    customer_identifier: { label: 'Customer name or phone', found: true },
  };

  const dataReadyMissingCopy = {
    order_value_or_price: {
      label: 'Sales amount',
      reason: 'Needed to estimate money impact.',
    },
    promotional_flag: {
      label: 'Discount or offer details',
      reason: 'Needed to check if offers worked.',
    },
    customer_identifier: {
      label: 'Customer name or phone',
      reason: 'Needed to check repeat customers.',
    },
  };

  function buildAskQuestionSet(summary) {
    const mapping = summary?.column_mapping || {};
    const availableKeys = new Set((mapping.available_capabilities || []).map(item => item.key));
    const foundConcepts = new Set(
      (mapping.found || [])
        .map(item => item.concept)
        .filter(concept => dataReadyConcepts[concept]),
    );
    if (availableKeys.has('sales_trend')) {
      foundConcepts.add('order_count_identifier');
      foundConcepts.add('order_date');
    }
    if (availableKeys.has('pricing')) foundConcepts.add('order_value_or_price');
    if (availableKeys.has('delivery_fee')) foundConcepts.add('shipping_or_delivery_fee');
    if (availableKeys.has('promotions')) foundConcepts.add('promotional_flag');
    if (availableKeys.has('repeat_customers')) foundConcepts.add('customer_identifier');
    ['order_value_or_price', 'shipping_or_delivery_fee', 'promotional_flag', 'customer_identifier'].forEach(concept => {
      if (fieldIsUnavailable(concept)) foundConcepts.delete(concept);
    });

    const hasOrders = foundConcepts.has('order_count_identifier');
    const hasDates = foundConcepts.has('order_date');
    const questions = [];
    const categories = [];
    const addCategory = (key, label, items) => {
      if (!items.length) return;
      categories.push({ key, label, questions: items });
      questions.push(...items);
    };

    if (hasOrders && hasDates) {
      addCategory('orders', 'Orders', [
        { label: 'Are my orders going up or down?', query: 'Are my orders going up or down?' },
        { label: 'Which month had the most orders?', query: 'Which month had the most orders?' },
      ]);
    }
    if (foundConcepts.has('order_value_or_price') && hasOrders && hasDates) {
      addCategory('sales', 'Sales', [
        { label: 'Are my sales going up or down?', query: 'Are my sales going up or down?' },
        { label: 'Which month had the highest sales?', query: 'Which month had the highest sales?' },
      ]);
    }
    if (foundConcepts.has('shipping_or_delivery_fee') && hasOrders) {
      questions.push(
        { label: 'Should I increase delivery fee?', query: 'Should I increase delivery fee?' },
        { label: 'What if I reduce delivery fee?', query: 'What if I reduce delivery fee?' },
      );
    }
    if (foundConcepts.has('promotional_flag') && hasOrders) {
      addCategory('discounts', 'Discounts', [
        { label: 'Did discounts help?', query: 'Did discounts help?' },
        { label: 'Should I run an offer?', query: 'Should I run an offer?' },
      ]);
    }
    if (foundConcepts.has('customer_identifier') && hasOrders) {
      addCategory('customers', 'Customers', [
        { label: 'Are customers coming back?', query: 'Are customers coming back?' },
      ]);
    }
    return {
      questions: [...new Map(questions.map(item => [item.query, item])).values()],
      categories,
    };
  }

  function renderAskQuestionScreen() {
    const questionSet = buildAskQuestionSet(lastSheetSummary);
    if (askQuestionList) {
      askQuestionList.innerHTML = questionSet.questions
        .map(item => `<button type="button" class="ask-question" data-question="${escapeHtml(item.query)}">${escapeHtml(item.label)}</button>`)
        .join('');
      askQuestionList.querySelectorAll('[data-question]').forEach(button => {
        button.addEventListener('click', () => {
          questionInput.value = button.dataset.question || '';
          resizeQuestion();
          updateQuestionState();
          hideValidationNudge();
          questionInput.focus();
        });
      });
    }
    if (askSuggestions) askSuggestions.hidden = !questionSet.questions.length;
    if (askCategoryList) {
      askCategoryList.innerHTML = questionSet.categories
        .map(category => `<button type="button" class="ask-category" data-category="${escapeHtml(category.key)}">${escapeHtml(category.label)}</button>`)
        .join('');
      askCategoryList.querySelectorAll('[data-category]').forEach(button => {
        button.addEventListener('click', () => {
          const category = questionSet.categories.find(item => item.key === button.dataset.category);
          if (!category || !askCategoryQuestions) return;
          askCategoryList.querySelectorAll('.ask-category').forEach(item => item.classList.toggle('active', item === button));
          askCategoryQuestions.hidden = false;
          askCategoryQuestions.innerHTML = category.questions
            .map(item => `<button type="button" class="ask-category-question" data-question="${escapeHtml(item.query)}">${escapeHtml(item.label)}</button>`)
            .join('');
          askCategoryQuestions.querySelectorAll('[data-question]').forEach(questionButton => {
            questionButton.addEventListener('click', () => {
              questionInput.value = questionButton.dataset.question || '';
              resizeQuestion();
              updateQuestionState();
              hideValidationNudge();
              questionInput.focus();
            });
          });
        });
      });
    }
    if (askCategoryQuestions) askCategoryQuestions.hidden = true;
  }

  function startAskExampleRotation() {
    window.clearInterval(askExampleTimer);
    if (!askExample) return;
    const examples = [
      'Try: Orders kam ho rahe hain kya?',
      'Try: Delivery fee badhaun toh kya hoga?',
      'Try: Discount dena chahiye kya?',
      'Try: Customers wapas aa rahe hain kya?',
    ];
    let index = 0;
    askExample.textContent = examples[index];
    askExampleTimer = window.setInterval(() => {
      index = (index + 1) % examples.length;
      askExample.textContent = examples[index];
    }, 3000);
  }

  function stopAskExampleRotation() {
    window.clearInterval(askExampleTimer);
    askExampleTimer = null;
  }

  function renderDataReadySummary(summary) {
    const mapping = summary?.column_mapping || {};
    const availableKeys = new Set((mapping.available_capabilities || []).map(item => item.key));
    const foundConcepts = new Set(
      (mapping.found || [])
        .map(item => item.concept)
        .filter(concept => dataReadyConcepts[concept]),
    );
    if (availableKeys.has('sales_trend')) {
      foundConcepts.add('order_count_identifier');
      foundConcepts.add('order_date');
    }
    if (availableKeys.has('pricing')) foundConcepts.add('order_value_or_price');
    if (availableKeys.has('delivery_fee')) foundConcepts.add('shipping_or_delivery_fee');
    if (availableKeys.has('promotions')) foundConcepts.add('promotional_flag');
    if (availableKeys.has('repeat_customers')) foundConcepts.add('customer_identifier');
    ['order_value_or_price', 'shipping_or_delivery_fee', 'promotional_flag', 'customer_identifier'].forEach(concept => {
      if (fieldIsUnavailable(concept)) foundConcepts.delete(concept);
    });
    const missingConcepts = new Set(
      (mapping.missing || [])
        .map(item => item.concept)
        .filter(concept => dataReadyMissingCopy[concept]),
    );
    const hasOrders = foundConcepts.has('order_count_identifier');
    const hasDates = foundConcepts.has('order_date');
    const hasSales = foundConcepts.has('order_value_or_price');
    const hasDeliveryFee = foundConcepts.has('shipping_or_delivery_fee');
    const hasDiscounts = foundConcepts.has('promotional_flag');
    const hasCustomers = foundConcepts.has('customer_identifier');
    const foundOrder = [
      'order_count_identifier',
      'order_date',
      'order_value_or_price',
      'shipping_or_delivery_fee',
      'promotional_flag',
      'customer_identifier',
    ].filter(concept => foundConcepts.has(concept));
    const questions = [];

    if (hasOrders && hasDates) {
      questions.push(
        { label: 'Are my orders going up or down?', query: 'Are my orders going up or down?' },
        { label: 'Which month had the most orders?', query: 'Which month had the most orders?' },
      );
    }
    if (hasSales && hasOrders && hasDates) {
      questions.push(
        { label: 'Are my sales going up or down?', query: 'Are my sales going up or down?' },
        { label: 'Which month had the highest sales?', query: 'Which month had the highest sales?' },
      );
    }
    if (hasDeliveryFee && hasOrders) {
      questions.push({ label: 'Should I change delivery fee?', query: 'Should I change delivery fee?' });
    }
    if (hasDiscounts && hasOrders) {
      questions.push({ label: 'Did discounts help?', query: 'Did discounts help?' });
    }
    if (hasCustomers && hasOrders) {
      questions.push({ label: 'Are customers coming back?', query: 'Are customers coming back?' });
    }

    const uniqueQuestions = [...new Map(questions.map(item => [item.query, item])).values()];
    if (dataReadyFound) {
      dataReadyFound.innerHTML = foundOrder
        .map(concept => `<li><span class="data-ready-check" aria-hidden="true">✓</span>${escapeHtml(dataReadyConcepts[concept].label)}</li>`)
        .join('');
    }
    if (dataReadyFoundSection) dataReadyFoundSection.hidden = !foundConcepts.size;

    if (dataReadyMissing) {
      dataReadyMissing.innerHTML = [...missingConcepts]
        .map(concept => {
          const item = dataReadyMissingCopy[concept];
          return `<li><span class="data-ready-missing-mark" aria-hidden="true">i</span><span><b>${escapeHtml(item.label)}</b><small>${escapeHtml(item.reason)}</small></span></li>`;
        })
        .join('');
    }
    if (dataReadyMissingSection) dataReadyMissingSection.hidden = !missingConcepts.size;
    if (dataReadyAllFound) dataReadyAllFound.hidden = Boolean(missingConcepts.size);

    if (dataReadyQuestions) {
      dataReadyQuestions.innerHTML = uniqueQuestions
        .map(item => `<button type="button" class="data-ready-question" data-question="${escapeHtml(item.query)}">${escapeHtml(item.label)}</button>`)
        .join('');
      dataReadyQuestions.querySelectorAll('[data-question]').forEach(button => {
        button.addEventListener('click', () => {
          questionInput.value = button.dataset.question || '';
          resizeQuestion();
          updateQuestionState();
          showQuestionComposer();
          questionInput.focus();
        });
      });
    }
    if (dataReadyQuestionSection) dataReadyQuestionSection.hidden = !uniqueQuestions.length;
    if (dataReadyCopy) dataReadyCopy.textContent = 'I read your sales data and checked what Hisaab can answer.';
  }

  function openDataFixFlow() {
    fixDataContext = 'general';
    missingFieldTarget = '';
    fixDataReturnView = 'dataReady';
    fixDataReturnQuestion = '';
    renderFixDataView();
  }

  const fixFieldCopy = {
    order_value_or_price: {
      label: 'Sales amount',
      plainLabel: 'total bill amount',
      reason: 'Needed to estimate money impact.',
      choose: 'Choose sales amount column',
      unavailable: 'I don’t have this',
    },
    promotional_flag: {
      label: 'Discount or offer details',
      plainLabel: 'discount or offer details',
      reason: 'Needed to check if offers worked.',
      choose: 'Choose discount column',
      unavailable: 'I don’t track discounts',
    },
    customer_identifier: {
      label: 'Customer name or phone',
      plainLabel: 'customer name or phone',
      reason: 'Needed to check repeat customers.',
      choose: 'Choose customer column',
      unavailable: 'I don’t have customer details',
    },
    shipping_or_delivery_fee: {
      label: 'Delivery fee',
      plainLabel: 'delivery fee',
      reason: 'Needed to check delivery fee changes.',
      choose: 'Choose delivery fee column',
      unavailable: 'I don’t have this',
    },
    order_date: {
      label: 'Order date',
      plainLabel: 'order date',
      reason: 'Needed to compare different periods.',
      choose: 'Choose order date column',
      unavailable: 'I don’t have this',
    },
    order_count_identifier: {
      label: 'Order number',
      plainLabel: 'order number',
      reason: 'Needed to count your orders.',
      choose: 'Choose order column',
      unavailable: 'I don’t have this',
    },
  };

  function fixConceptForField(field) {
    return {
      orders: 'order_count_identifier',
      order_date: 'order_date',
      avg_order_value: 'order_value_or_price',
      delivery_fee: 'shipping_or_delivery_fee',
      promo_active: 'promotional_flag',
      customer_identifier: 'customer_identifier',
      repeat_orders: 'customer_identifier',
    }[field] || field;
  }

  function fixCopyForConcept(concept) {
    return fixFieldCopy[concept] || {
      label: 'This data',
      plainLabel: 'this data',
      reason: 'Needed for this question.',
      choose: 'Choose column',
      unavailable: 'I don’t have this',
    };
  }

  function fieldIsUnavailable(concept) {
    return ['unavailable', 'skip_repeat', 'manual_later'].includes(mappingChoices[concept]);
  }

  function fixDataOptions(item) {
    const mapping = lastSheetSummary?.column_mapping || {};
    const options = Array.isArray(item.options) ? item.options : [];
    if (options.length) return options;
    return (mapping.headers || []).map(column => ({ column, samples: [] }));
  }

  function sampleValuesForOption(option) {
    return (Array.isArray(option.samples) ? option.samples : [])
      .filter(value => String(value ?? '').trim() !== '')
      .slice(0, 5);
  }

  function setFixDataSuccess(message = 'Got it. Hisaab can use this now.') {
    fixDataSuccess.textContent = message;
    fixDataSuccess.hidden = false;
  }

  function updateLocalSummaryForMapping(concept, column) {
    const mapping = lastSheetSummary?.column_mapping;
    if (!mapping) return;
    mapping.found = Array.isArray(mapping.found) ? mapping.found : [];
    mapping.missing = Array.isArray(mapping.missing) ? mapping.missing : [];
    mapping.ambiguous = Array.isArray(mapping.ambiguous) ? mapping.ambiguous : [];
    const copy = fixCopyForConcept(concept);
    mapping.found = mapping.found.filter(item => item.concept !== concept);
    mapping.found.push({ concept, label: copy.label, column, confidence: 1 });
    mapping.missing = mapping.missing.filter(item => item.concept !== concept);
    mapping.ambiguous = mapping.ambiguous.filter(item => item.column !== column);
  }

  function updateLocalSummaryForAverageBill() {
    updateLocalSummaryForMapping('order_value_or_price', 'Usual average bill amount');
  }

  function updateAskAndDataReadyAfterFix() {
    renderDataReadySummary(lastSheetSummary || {});
  }

  function returnFromFixData() {
    if (fixDataContext === 'general') {
      updateAskAndDataReadyAfterFix();
      if (lastSheetSummary) showDataReady(lastSheetSummary);
      else openUploadOptions();
      return;
    }
    if (fixDataReturnView === 'ask') {
      showQuestionComposer();
      questionInput.value = fixDataReturnQuestion || '';
      resizeQuestion();
      updateQuestionState();
      questionInput.focus();
      return;
    }
    if (fixDataReturnQuestion) {
      runSimulation({ questionOverride: fixDataReturnQuestion, skipValidation: true });
      return;
    }
    showQuestionComposer();
  }

  function completeFixData(mode, concept, column = '') {
    if (mode === 'mapped') {
      manualMappings[concept] = column;
      mappingChoices[concept] = 'mapped';
      updateLocalSummaryForMapping(concept, column);
    } else if (mode === 'average_bill') {
      mappingChoices.order_value_or_price = 'average_bill';
      updateLocalSummaryForAverageBill();
    } else if (mode === 'unavailable') {
      mappingChoices[concept] = concept === 'customer_identifier' ? 'skip_repeat' : 'unavailable';
      delete manualMappings[concept];
    }

    setFixDataSuccess();
    if (fixDataContext === 'general') {
      renderFixDataView();
      return;
    }
    window.setTimeout(returnFromFixData, 450);
  }

  function renderFixDataItem(item, index, { reminderOnly = false } = {}) {
    const concept = item.concept || fixConceptForField(item.field);
    const copy = fixCopyForConcept(concept);
    const options = fixDataOptions(item);
    const wrapper = document.createElement('section');
    wrapper.className = 'fix-data-item';
    wrapper.dataset.concept = concept;

    const heading = document.createElement('h3');
    heading.textContent = reminderOnly ? `I still need ${copy.plainLabel} to answer this honestly.` : copy.label;
    wrapper.appendChild(heading);
    const reason = document.createElement('p');
    reason.textContent = reminderOnly
      ? `You chose not to track ${copy.plainLabel}. Hisaab will not guess without it.`
      : (item.reason || copy.reason);
    wrapper.appendChild(reason);
    if (reminderOnly) return wrapper;

    const actions = document.createElement('div');
    actions.className = 'fix-data-item-actions';
    const choose = document.createElement('button');
    choose.type = 'button';
    choose.className = 'fix-data-choice';
    choose.textContent = copy.choose;
    actions.appendChild(choose);

    const unavailable = document.createElement('button');
    unavailable.type = 'button';
    unavailable.className = 'fix-data-choice';
    unavailable.textContent = copy.unavailable;
    actions.appendChild(unavailable);

    let averagePanel = null;
    if (concept === 'order_value_or_price') {
      const average = document.createElement('button');
      average.type = 'button';
      average.className = 'fix-data-choice';
      average.textContent = 'Use usual average bill amount';
      actions.appendChild(average);
      averagePanel = document.createElement('div');
      averagePanel.className = 'fix-data-inline-panel';
      averagePanel.hidden = true;
      const averageLabel = document.createElement('label');
      averageLabel.textContent = 'What is your usual average bill amount?';
      const averageInput = document.createElement('input');
      averageInput.type = 'number';
      averageInput.min = '0';
      averageInput.step = '0.01';
      averageInput.inputMode = 'decimal';
      averageInput.placeholder = 'Example: 250';
      averageInput.className = 'fix-data-input';
      averageLabel.appendChild(averageInput);
      const averageSave = document.createElement('button');
      averageSave.type = 'button';
      averageSave.className = 'cta-primary';
      averageSave.textContent = 'Save average bill';
      averageSave.addEventListener('click', () => {
        const value = Number(averageInput.value);
        if (!Number.isFinite(value) || value < 0) {
          averageInput.focus();
          return;
        }
        manualInputs.user_provided_average_order_value = value;
        completeFixData('average_bill', concept);
      });
      averagePanel.append(averageLabel, averageSave);
      wrapper.appendChild(averagePanel);
      average.addEventListener('click', () => { averagePanel.hidden = !averagePanel.hidden; if (!averagePanel.hidden) averageInput.focus(); });
    }

    const columnPanel = document.createElement('div');
    columnPanel.className = 'fix-data-inline-panel';
    columnPanel.hidden = true;
    const columnLabel = document.createElement('label');
    columnLabel.textContent = 'Choose a column from your file';
    const select = document.createElement('select');
    select.className = 'fix-data-select';
    const placeholder = document.createElement('option');
    placeholder.value = '';
    placeholder.textContent = 'Choose a column…';
    select.appendChild(placeholder);
    options.forEach(option => {
      const optionEl = document.createElement('option');
      optionEl.value = option.column || '';
      optionEl.textContent = option.column || '';
      select.appendChild(optionEl);
    });
    const preview = document.createElement('div');
    preview.className = 'fix-data-preview';
    preview.hidden = true;
    select.addEventListener('change', () => {
      const chosen = options.find(option => option.column === select.value);
      const samples = chosen ? sampleValuesForOption(chosen) : [];
      preview.textContent = samples.length ? `Example values: ${samples.join(' · ')}` : 'No sample values available.';
      preview.hidden = !select.value;
    });
    columnLabel.appendChild(select);
    const confirm = document.createElement('button');
    confirm.type = 'button';
    confirm.className = 'cta-primary';
    confirm.textContent = 'Use this column';
    confirm.addEventListener('click', () => {
      if (!select.value) { select.focus(); return; }
      completeFixData('mapped', concept, select.value);
    });
    columnPanel.append(columnLabel, preview, confirm);
    wrapper.append(actions, columnPanel);

    choose.addEventListener('click', () => { columnPanel.hidden = !columnPanel.hidden; if (!columnPanel.hidden) select.focus(); });
    unavailable.addEventListener('click', () => completeFixData('unavailable', concept));
    return wrapper;
  }

  function fixDataMissingItems() {
    const mapping = lastSheetSummary?.column_mapping || {};
    const missing = Array.isArray(mapping.missing) ? mapping.missing : [];
    return missing.filter(item => !fieldIsUnavailable(item.concept));
  }

  function renderFixDataView({ reminderOnly = false, item = null } = {}) {
    setCurrentView('fixData');
    dataOptions.hidden = true;
    dataDetected.classList.remove('show');
    mappingPanel.hidden = true;
    fixDataItems.innerHTML = '';
    fixDataSuccess.hidden = true;
    fixDataEmpty.hidden = true;
    fixDataDifferentQuestion.hidden = fixDataContext !== 'question';
    fixDataDifferentQuestion.textContent = 'Ask a different question';
    fixDataDone.textContent = fixDataContext === 'question' ? 'Back to question' : 'Back to data summary';

    if (reminderOnly) {
      fixDataTitle.textContent = `I still need ${fixCopyForConcept(missingFieldTarget).plainLabel} for this`;
      fixDataSubtitle.textContent = 'I will not guess without the information needed for this question.';
      fixDataItems.appendChild(renderFixDataItem(item || { concept: missingFieldTarget }, 0, { reminderOnly: true }));
      return;
    }

    if (fixDataContext === 'question') {
      const copy = fixCopyForConcept(missingFieldTarget);
      fixDataTitle.textContent = `I need ${copy.plainLabel} for this`;
      fixDataSubtitle.textContent = `I can check this, but I don’t see ${copy.plainLabel} in your file.`;
      fixDataItems.appendChild(renderFixDataItem(item || { concept: missingFieldTarget, reason: copy.reason }, 0));
      return;
    }

    fixDataTitle.textContent = 'Fix data';
    fixDataSubtitle.textContent = 'Help Hisaab understand your file better.';
    const items = fixDataMissingItems();
    if (!items.length) {
      fixDataEmpty.hidden = false;
      return;
    }
    items.forEach((item, index) => fixDataItems.appendChild(renderFixDataItem(item, index)));
  }

  function openContextualFixData(body) {
    const first = body?.missing_fields?.[0] || body?.evidence?.required_fields?.[0] || {};
    const concept = fixConceptForField(first.field || missingFieldTarget || '');
    fixDataContext = 'question';
    missingFieldTarget = concept;
    fixDataReturnView = currentView === 'ask' ? 'ask' : 'result';
    fixDataReturnQuestion = lastQuestion || questionInput.value.trim();
    if (fieldIsUnavailable(concept)) {
      renderFixDataView({ reminderOnly: true, item: { ...first, concept } });
      return;
    }
    renderFixDataView({ item: { ...first, concept } });
  }

  function showDataReadError(err) {
    stopReadingProgress();
    console.error('[Hisaab] Data reading failed:', err);
    setCurrentView('error');
  }

  function openUploadOptions() {
    hideResults();
    setCurrentView('upload');
    document.body.classList.remove('home-landing');
    document.body.classList.add('upload-view-active');
    composer.hidden = true;
    if (langNote) langNote.hidden = true;
    dataDetected.classList.remove('show');
    pathChooser.hidden = true;
    if (homeNote) homeNote.hidden = true;
    demoIntro.hidden = true;
    demoIntro.classList.remove('open');
    dataOptions.hidden = false;
    dataOptions.classList.add('open');
    pathUseData.classList.add('active');
    renderChipVisibility();
    heroSupport.textContent = 'Choose how you want to add your sales. You can change this later.';
    dataOptions.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  const demoResults = {
    trend: {
      answer: 'This demo shop’s orders are slightly improving.',
      why: 'In this demo shop, recent months had more orders than earlier months.',
      action: 'Keep tracking orders and check if the increase continues next month.',
      strength: 'Demo only — example data, not your business.',
    },
    delivery: {
      answer: 'This demo shop should not increase delivery fee for everyone yet.',
      why: 'In this demo shop, orders were lower when the delivery fee was higher.',
      action: 'Test the higher fee for a few days first.',
      strength: 'Demo only — example data, not your business.',
    },
    discount: {
      answer: 'For this demo shop, discounts helped a little, but not every time.',
      why: 'Some discount months had more orders, but the pattern was not strong every month.',
      action: 'Run a small offer for 3–5 days and compare orders.',
      strength: 'Demo only — example data, not your business.',
    },
    repeat: {
      answer: 'This demo shop has some customers coming back.',
      why: 'The example data shows repeat orders from the same customers.',
      action: 'Give returning customers a small reason to order again.',
      strength: 'Demo only — example data, not your business.',
    },
  };

  function setDemoStep(step) {
    const steps = ['intro', 'foundData', 'chooseQuestion', 'result'];
    demoStep = steps.includes(step) ? step : 'intro';
    setCurrentView('demo');
    hideResults();
    hideMissingInputs();
    hideValidationNudge();
    hideError();
    stopIntro();
    if (checkbackCard) checkbackCard.hidden = true;
    document.body.classList.remove('home-landing', 'upload-view-active');
    pathChooser.hidden = true;
    dataOptions.hidden = true;
    dataOptions.classList.remove('open');
    composer.hidden = true;
    if (langNote) langNote.hidden = true;
    dataDetected.classList.remove('show');
    demoIntro.hidden = false;
    demoIntro.classList.add('open');

    const stepIds = {
      intro: 'demo-step-intro',
      foundData: 'demo-step-found',
      chooseQuestion: 'demo-step-questions',
      result: 'demo-step-result',
    };
    Object.entries(stepIds).forEach(([key, id]) => {
      const stepEl = document.getElementById(id);
      if (stepEl) stepEl.hidden = key !== demoStep;
    });
    const stepNumber = steps.indexOf(demoStep) + 1;
    if (demoProgressLabel) demoProgressLabel.textContent = `Step ${stepNumber} of 4`;
    demoIntro.querySelectorAll('.demo-progress-dots i').forEach((dot, index) => {
      dot.classList.toggle('active', index < stepNumber);
    });
    if (demoStep === 'result') renderDemoResult(selectedDemoQuestion || 'trend');
    demoIntro.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function selectDemoQuestion(question) {
    selectedDemoQuestion = demoResults[question] ? question : 'trend';
    setDemoStep('result');
  }

  function renderDemoResult(question) {
    const result = demoResults[question] || demoResults.trend;
    if (demoResultTitle) demoResultTitle.textContent = 'Demo result';
    if (demoResultAnswer) demoResultAnswer.textContent = result.answer;
    if (demoResultWhy) demoResultWhy.textContent = result.why;
    if (demoResultAction) demoResultAction.textContent = result.action;
    if (demoResultStrength) demoResultStrength.textContent = result.strength;
  }

  function setPath(path) {
    activePath = path;
    const isReal = path === 'real';
    const isBootstrap = path === 'bootstrap';
    const isSample = !isReal && !isBootstrap;
    if (demoIntro) demoIntro.hidden = !isSample || !demoIntro.classList.contains('open');
    subtitle.textContent = isSample
      ? 'Your simple business analyst for small shops.'
      : 'Your data stays yours. Hisaab will tell you clearly what it can and cannot answer.';
    heroSupport.textContent = isSample
      ? 'Understand orders, sales, delivery fees, discounts, and customers — without confusing reports.'
      : 'Choose how you want to add your sales. You can change this later.';
    pathSample.classList.toggle('active', isSample);
    if (pathUseData) pathUseData.classList.toggle('active', isReal || isBootstrap || !dataOptions.hidden);
    pathReal.classList.toggle('active', isReal);
    const pathBootstrapBtn = document.getElementById('path-bootstrap');
    if (pathBootstrapBtn) pathBootstrapBtn.classList.toggle('active', isBootstrap);
    if (dataOptions) {
      dataOptions.hidden = isSample;
      dataOptions.classList.toggle('open', !isSample);
    }
    if (pathChooser) pathChooser.hidden = isSample && demoIntro?.classList.contains('open');
    sheetSlot.classList.toggle('open', isReal);
    const bootstrapSlot = document.getElementById('bootstrap-slot');
    if (bootstrapSlot) bootstrapSlot.classList.toggle('open', isBootstrap);
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

  function openDemoIntro() {
    selectedDemoQuestion = '';
    if (homeNote) homeNote.hidden = true;
    setPath('sample');
    sampleSuggestions.hidden = true;
    setDemoStep('intro');
  }

  function showQuestionComposer() {
    setCurrentView('ask');
    document.body.classList.remove('home-landing');
    renderAskQuestionScreen();
    startAskExampleRotation();
    composer.hidden = false;
    if (langNote) langNote.hidden = false;
  }

  function backToDataReady() {
    if (lastSheetSummary) {
      showDataReady(lastSheetSummary);
      return;
    }
    resetToLanding();
  }

  function closeDataOptions() {
    dataOptions.hidden = true;
    dataOptions.classList.remove('open');
    document.body.classList.remove('upload-view-active');
  }

  async function handleCsvFile() {
    const file = csvFileInput.files?.[0];
    if (!file) return;
    setPath('real');
    startReadingView('file');
    manualMappings = {};
    mappingChoices = {};
    manualInputs = {};
    sheetUrlInput.value = '';
    if (uploadSheetUrlInput) uploadSheetUrlInput.value = '';
    try {
      uploadedFileName = file.name;
      uploadedCsv = await file.text();
      connectedDataLabel = uploadedFileName;
      renderCsvUploadState();
      renderSheetUrlState();
      await parseConnectedData();
    } catch (err) {
      showDataReadError(err);
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
      dataMode: activePath,
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
    const isDataChooserOpen = dataOptions && !dataOptions.hidden;
    const demoTourOpen = demoIntro?.classList.contains('open');
    sampleSuggestions.hidden = isReal || isDataChooserOpen || !demoTourOpen;
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

    const stagedUploadRead = currentView === 'upload' || currentView === 'reading';
    if (currentView === 'upload') {
      startReadingView(uploadedCsv ? 'file' : 'sheet');
    }

    hideError();
    const isInlineRefresh = stage.classList.contains('connecting-data') && Boolean(currentResult);
    detectedHeadline.textContent = isInlineRefresh ? 'Reading this data for your analysis...' : 'Reading your order data...';
    detectedBody.textContent = isInlineRefresh ? 'I will update the result below once the columns are ready.' : 'Checking the columns before I use them.';
    capabilityList.hidden = true;
    capabilityList.innerHTML = '';
    mappingPanel.hidden = true;
    mappingPanel.classList.remove('editing');
    mappingFix.hidden = false;
    mappingContinue.textContent = 'Ask a question';
    detectedCaveat.hidden = true;
    detectedDetails.innerHTML = '';
    hideApplyDataCta();
    if (!stagedUploadRead) {
      dataDetected.classList.add('show');
      alignDataPanelToSheetSlot();
      updateAwayFromLandingState();
    }

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
      if (stagedUploadRead) showDataReady(lastSheetSummary);
    } catch (err) {
      if (stagedUploadRead) {
        showDataReadError(err);
        return;
      }
      lastSheetSummary = null;
      detectedHeadline.textContent = 'I could not read that sheet yet.';
      detectedBody.textContent = err.message;
      capabilityList.hidden = true;
      capabilityList.innerHTML = '';
      mappingPanel.hidden = true;
      detectedCaveat.hidden = true;
      detectedDetails.innerHTML = '';
      hideApplyDataCta();
      alignDataPanelToSheetSlot();
      updateAwayFromLandingState();
    }
  }

  function renderSheetSummary(summary) {
    const months = Number(summary.months) || 0;
    detectedHeadline.textContent = 'I read your file.';
    detectedBody.textContent = months
      ? `I found ${summary.raw_rows || 0} rows across ${months} month${months === 1 ? '' : 's'}.`
      : 'I found the file, but not enough usable order history yet.';
    renderColumnMapping(summary.column_mapping || {});
    capabilityList.hidden = true;
    capabilityList.innerHTML = '';

    if (summary.caveat_line) {
      detectedCaveat.innerHTML = `<b>Heads up:</b> ${escapeHtml(summary.caveat_line)}`;
      detectedCaveat.hidden = false;
    } else {
      detectedCaveat.hidden = true;
    }

    detectedDetails.classList.remove('open');
    detectedToggle.textContent = 'See what I read from your sheet ↓';
    const mapping = summary.column_mapping || {};
    const mappingDetails = [
      ...(mapping.found || []).map(item => `${item.label} — ${item.column}`),
      ...(mapping.missing || []).map(item => `${item.label} — not found yet`),
    ];
    detectedDetails.innerHTML = mappingDetails.map(item => `<div>· ${escapeHtml(item)}</div>`).join('');
    detectedToggle.hidden = !mappingDetails.length;
  }

  function renderColumnMapping(mapping) {
    if (!mappingPanel) return;
    const editing = mappingPanel.classList.contains('editing');
    const found = mapping.found || [];
    const missing = mapping.missing || [];
    mappingPanel.hidden = false;
    mappingPanel.classList.toggle('editing', editing);
    mappingFoundGroup.hidden = !found.length;
    mappingMissingGroup.hidden = !missing.length;
    mappingFound.innerHTML = found.map(item => `
      <div class="mapping-row found">
        <span class="mapping-status-dot"></span>
        <span class="mapping-label">${escapeHtml(friendlyFoundLabel(item))}</span>
        <span class="mapping-column">${escapeHtml(item.column)}</span>
      </div>
    `).join('');
    mappingMissing.innerHTML = missing.map(item => renderMissingMapping(item)).join('');
    renderMappingSummary(mapping, missing);
    wireMappingControls();
  }

  function friendlyFoundLabel(item) {
    const labels = {
      order_date: 'Dates',
      order_count_identifier: 'Orders',
      order_value_or_price: 'Sales amount',
      shipping_or_delivery_fee: 'Delivery fee',
      customer_identifier: 'Customer details',
      promotional_flag: 'Discount details',
      order_status: 'Order status',
    };
    return labels[item.concept] || item.label;
  }

  function friendlyMissingLabel(item) {
    const labels = {
      order_value_or_price: 'Total sales amount',
      promotional_flag: 'Discount details',
      customer_identifier: 'Customer details',
      shipping_or_delivery_fee: 'Delivery fee history',
      order_date: 'Dates',
      order_count_identifier: 'Orders',
    };
    return labels[item.concept] || item.label;
  }

  function friendlyMissingReason(item) {
    const reasons = {
      order_value_or_price: 'Needed to estimate sales impact.',
      promotional_flag: 'Needed to check if offers worked.',
      customer_identifier: 'Needed to check repeat customers.',
      shipping_or_delivery_fee: 'Needed to check delivery fee changes.',
      order_date: 'Needed to compare different periods.',
      order_count_identifier: 'Needed to count your orders.',
    };
    return reasons[item.concept] || item.reason || 'Can be added later for a better answer.';
  }

  function renderMappingSummary(mapping, missing) {
    const available = mapping.available_capabilities || [];
    const later = missing
      .map(item => friendlyMissingLabel(item))
      .filter(label => !['Dates', 'Orders'].includes(label));
    mappingNext.hidden = false;
    mappingAvailableQuestions.innerHTML = available.length
      ? available.map(item => `<button type="button" class="mapping-question" data-q="${escapeHtml(item.label)}">${escapeHtml(item.label)}</button>`).join('')
      : '<span class="mapping-empty">Add more data later to unlock more questions.</span>';
    mappingLaterList.innerHTML = later.length
      ? [...new Set(later)].map(label => `<span class="mapping-later-item">${escapeHtml(label)}</span>`).join('')
      : '<span class="mapping-empty">Nothing else is needed for the questions available now.</span>';
    mappingAvailableQuestions.querySelectorAll('[data-q]').forEach(button => {
      button.addEventListener('click', () => {
        questionInput.value = button.dataset.q;
        mappingContinue.click();
        resizeQuestion();
        updateQuestionState();
        questionInput.focus();
      });
    });
  }

  function renderMissingMapping(item) {
    const options = item.options || [];
    const selected = manualMappings[item.concept] || '';
    const choice = mappingChoices[item.concept] || '';
    const optionHtml = options.map(option => `<option value="${escapeHtml(option.column)}" ${selected === option.column ? 'selected' : ''}>${escapeHtml(option.column)}</option>`).join('');
    let controls = '';
    if (options.length) {
      controls += `<label class="mapping-choice-label">Choose a column from your file
        <select class="mapping-select" data-concept="${escapeHtml(item.concept)}">
          <option value="">Choose a column…</option>${optionHtml}
        </select>
      </label>`;
    }
    if (item.concept === 'order_value_or_price') {
      controls += `<div class="mapping-choice-actions">
        <button type="button" class="mapping-choice-btn ${choice === 'unavailable' ? 'selected' : ''}" data-choice="unavailable" data-concept="${escapeHtml(item.concept)}">I don’t have this data</button>
        <button type="button" class="mapping-choice-btn ${choice === 'average_bill' ? 'selected' : ''}" data-choice="average_bill" data-concept="${escapeHtml(item.concept)}">Use my usual average bill</button>
      </div>
      <div class="average-bill-control" data-average-control="${escapeHtml(item.concept)}" ${choice === 'average_bill' ? '' : 'hidden'}>
        <label>What is your usual average bill amount?
          <input type="number" min="0" step="0.01" data-average-bill-input placeholder="e.g. 450" value="${escapeHtml(manualInputs.user_provided_average_order_value || '')}">
        </label>
      </div>`;
    } else if (item.concept === 'promotional_flag') {
      controls += `<div class="mapping-choice-actions">
        <button type="button" class="mapping-choice-btn ${choice === 'unavailable' ? 'selected' : ''}" data-choice="unavailable" data-concept="${escapeHtml(item.concept)}">I don’t track discounts</button>
        <button type="button" class="mapping-choice-btn ${choice === 'manual_later' ? 'selected' : ''}" data-choice="manual_later" data-concept="${escapeHtml(item.concept)}">Mark promo months later</button>
      </div>`;
    } else if (item.concept === 'customer_identifier') {
      controls += `<div class="mapping-choice-actions">
        <button type="button" class="mapping-choice-btn ${choice === 'unavailable' ? 'selected' : ''}" data-choice="unavailable" data-concept="${escapeHtml(item.concept)}">I don’t have customer details</button>
        <button type="button" class="mapping-choice-btn ${choice === 'skip_repeat' ? 'selected' : ''}" data-choice="skip_repeat" data-concept="${escapeHtml(item.concept)}">Continue without repeat-customer analysis</button>
      </div>`;
    }
    return `<div class="mapping-row missing">
      <div class="mapping-missing-title"><span class="mapping-status-dot"></span><span>${escapeHtml(friendlyMissingLabel(item))}</span></div>
      <div class="mapping-missing-reason">${escapeHtml(friendlyMissingReason(item))}</div>
      <div class="mapping-control">${controls}</div>
    </div>`;
  }

  function wireMappingControls() {
    mappingPanel.querySelectorAll('.mapping-select').forEach(select => {
      select.addEventListener('change', () => {
        const concept = select.dataset.concept;
        if (select.value) {
          manualMappings[concept] = select.value;
          mappingChoices[concept] = 'mapped';
        } else {
          delete manualMappings[concept];
          delete mappingChoices[concept];
        }
        renderMappingControlsState();
      });
    });
    mappingPanel.querySelectorAll('.mapping-choice-btn').forEach(button => {
      button.addEventListener('click', () => {
        const concept = button.dataset.concept;
        const choice = button.dataset.choice;
        mappingChoices[concept] = choice;
        delete manualMappings[concept];
        if (choice !== 'average_bill') delete manualInputs.user_provided_average_order_value;
        renderMappingControlsState();
      });
    });
    mappingPanel.querySelectorAll('[data-average-bill-input]').forEach(input => {
      input.addEventListener('input', () => {
        const value = Number(input.value);
        if (Number.isFinite(value) && value >= 0) {
          manualInputs.user_provided_average_order_value = value;
          mappingChoices.order_value_or_price = 'average_bill';
        }
      });
    });
  }

  function renderMappingControlsState() {
    const mapping = lastSheetSummary?.column_mapping;
    if (mapping) renderColumnMapping(mapping);
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
            <span class="capability-label">${escapeHtml(plainCapabilityLabel(item))}</span>
            <span class="capability-reason">${escapeHtml(capabilityStatusText(item))}</span>
          </span>
        </div>
      `)
      .join('');
    capabilityList.hidden = false;
  }

  function capabilityStatusText(item) {
    if (item.status === 'ready') return 'Ready';
    if (item.status === 'limited') return `Limited · ${plainCapabilityReason(item.reason || 'needs more signal')}`;
    return `Missing · ${plainCapabilityReason(item.reason || 'needs another column')}`;
  }

  function plainCapabilityLabel(item) {
    const labels = {
      'Pricing changes': 'Price changes',
      'Promos and discounts': 'Discounts and offers',
      'Repeat customers': 'Repeat customers',
      'Orders and sales trend': 'Orders going up or down',
      'Delivery fee changes': 'Delivery fee changes',
    };
    return labels[item.label] || item.label || 'Business data';
  }

  function plainCapabilityReason(reason) {
    return String(reason || '')
      .replace(/order value or price/gi, 'total bill amount')
      .replace(/promo or discount flag/gi, 'discount or offer details')
      .replace(/customer identifier/gi, 'customer name, phone, or ID')
      .replace(/order count/gi, 'order count or ID');
  }

  function plainResultCopy(value) {
    return String(value || '')
      .replace(/R\²|R2/gi, 'fit measure')
      .replace(/t[- ]score/gi, 'signal check')
      .replace(/regression/gi, 'calculation')
      .replace(/confidence score/gi, 'evidence strength')
      .replace(/statistical confidence/gi, 'evidence strength')
      .replace(/confidence/gi, 'evidence strength')
      .replace(/prediction interval/gi, 'likely range')
      .replace(/predictions?/gi, 'estimate')
      .replace(/p[- ]value/gi, 'signal check')
      .replace(/slope/gi, 'direction')
      .replace(/forecast interval/gi, 'likely range')
      .replace(/lower bound/gi, 'lower estimate')
      .replace(/upper bound/gi, 'upper estimate')
      .replace(/scenario model/gi, 'business comparison')
      .replace(/data maturity/gi, 'what Hisaab can answer')
      .replace(/evidence gate/gi, 'data check')
      .replace(/order value/gi, 'total bill amount')
      .replace(/promo flag/gi, 'discount or offer details')
      .replace(/customer identifier/gi, 'customer name or phone');
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
          manual_mappings: manualMappings,
          mapping_choices: mappingChoices,
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

      if (body.status === 'needs_bootstrap_history') {
        renderBootstrapGate(body);
        return;
      }

      if (body.status === 'evidence_limited') {
        renderEvidenceLimitation(body);
        return;
      }

      const nonDirectCategories = ['unsupported_question', 'clarify_intent', 'clarify_question', 'guided_answer', 'broad_guidance', 'needs_more_data', 'demo_only'];
      if (nonDirectCategories.includes(body.status) || nonDirectCategories.includes(body.result_category) || nonDirectCategories.includes(body.evidence_category)) {
        renderEvidenceLimitation(body);
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
    const broadQuestionVocabulary = /\b(hire|staff|worker|employee|team|helper|outlet|branch|shop|business|profit|why|wrong|should i|what should i do|open another|second|kaise|badhau|badhega|kam ho|chahiye)\b/i;
    const naturalBusinessVocabulary = /\b(kam|badh|badhe|badhaun|badhau|badhega|gir|raha|rahi|rahe|bikri|sales?|daam|rate|paisa|paise|chhoot|lagau|wapas|grahak|honge|karu|dena|kyun|problem)\b/i;
    return question.length >= 8 && (/[ऀ-ॿ]/.test(question) || decisionVocabulary.test(question) || subjectVocabulary.test(question) || broadQuestionVocabulary.test(question) || naturalBusinessVocabulary.test(question));
  }

  function renderResults(data, elapsed, options = {}) {
    setCurrentView('result');
    hideBootstrapGate();
    hideEvidenceLimitation();
    if (data.intent === 'trend') {
      renderTrendResults(data, elapsed, options);
      return;
    }
    const computed = data.computed || data;
    let generated = data.generated || data;
    const isSampleData = data.chart_meta?.is_sample === true || data.data_source?.source_type === 'demo';
    if (isSampleData) generated = sanitizeDemoGenerated(generated);
    // The UI chrome always mirrors the CURRENT question's detected language —
    // in both directions. If this question is Hindi, switch to Hindi; if
    // it's English (or anything else we don't have UI strings for), switch
    // back to English. Each question gets a consistent single-language
    // result screen matching what was actually asked, rather than a language
    // choice "sticking" from an earlier question in the same session.
    const detected = String(generated.detected_language || data.detected_language || '').toLowerCase();
    setUILang(detected === 'hi' ? 'hi' : 'en');

    renderSimpleOverview(data, computed, generated);

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

    const demoActions = document.getElementById('demo-result-actions');
    if (demoActions) demoActions.hidden = true;
    if (isSampleData) intentPrompt.classList.remove('show', 'captured');
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

  function renderTrendResults(data, elapsed, options = {}) {
    setCurrentView('result');
    const summary = data.computed?.trend_summary || {};
    const generated = data.generated || {};
    const isDemo = data.chart_meta?.is_sample === true || data.data_source?.source_type === 'demo';
    const change = Number(summary.change_pct);
    const metric = summary.metric === 'sales' ? 'sales value' : 'orders';
    const average = value => summary.metric === 'sales' ? formatMoney(value) : Number(value || 0).toLocaleString('en-IN');
    const direction = !Number.isFinite(change) || Math.abs(change) < 1 ? 'mostly stable' : change > 0 ? 'slightly up' : 'slightly down';
    const evidence = evidenceStrength(data.evidence_category || data.evidence?.category, data.computed?.confidence);
    const salesMissing = summary.sales_requested && !summary.sales_available;
    const source = resultDataUsed(data, data.computed || {}, data.evidence_category || data.evidence?.category);
    const answer = generated.recommendation || `${metric[0].toUpperCase()}${metric.slice(1)} are ${direction}.`;
    trendChange.textContent = `${summary.recent_label || 'Recent period'} average: ${average(summary.recent_average)}. ${summary.previous_label || 'Previous period'} average: ${average(summary.previous_average)}. That is around ${Math.abs(change || 0).toFixed(1)}% ${change > 0 ? 'higher' : change < 0 ? 'lower' : 'different'}.`;
    trendRecentLabel.textContent = summary.recent_label || 'Recent period';
    trendRecentAverage.textContent = average(summary.recent_average);
    trendPreviousLabel.textContent = summary.previous_label || 'Previous period';
    trendPreviousAverage.textContent = average(summary.previous_average);
    trendBestPeriod.textContent = summary.best_period?.label || 'Not enough history';
    trendWorstPeriod.textContent = summary.worst_period?.label || 'Not enough history';
    trendEvidenceStrength.textContent = evidence;
    trendWhy.textContent = generated.why || (salesMissing ? 'This answers order trend only because total bill amount is not available.' : 'This compares the recent period with the previous period.');
    trendNextAction.textContent = salesMissing
      ? 'Keep recording orders. Add total bill amount later if you want Hisaab to check sales value too.'
      : 'Keep recording the same data and check again after the next period; this is a trend, not a prediction.';
    trendDetailsCopy.textContent = `${summary.metric === 'sales' ? 'Sales value' : 'Order count'} trend using ${summary.granularity === 'daily' ? '7 daily entries versus the previous 7' : 'the recent 3 months versus the previous 3 where available'}. ${salesMissing ? 'Total bill amount is missing, so this result uses orders only.' : ''}`;
    renderAnalystOverview({
      answer,
      why: generated.why || (salesMissing
        ? 'This checks order trend because total bill amount is not available.'
        : 'This compares the recent period with the previous period.'),
      action: salesMissing
        ? 'Keep recording orders. Add total bill amount later if you want to check sales value too.'
        : 'Keep recording the same data and check again after the next period; this is a trend, not a prediction.',
      strength: isDemo ? 'Demo only' : evidence,
      category: isDemo ? 'demo_only' : (data.evidence_category || data.evidence?.category || 'clear_enough'),
      dataUsed: [['Source', source.sourceLabel], ['History used', source.history], ['Measure', metric === 'sales value' ? 'Total bill amount' : 'Orders']],
      primary: isDemo ? null : { label: 'Track this decision', handler: showTrackPrompt },
      details: trendDetailsCopy.textContent,
      showDetails: true,
    });
    lastSimulationPersistence = data.persistence || null;
    setDataSource(data.data_source);
    if (!options.keepScroll) resultOverview.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    updateAwayFromLandingState();
  }

  function evidenceStrength(category, confidence) {
    if (category === 'weak_signal') return 'Early signal only';
    if (category === 'not_enough_evidence' || category === 'needs_more_data' || category === 'unsupported_question') return 'Not enough data yet';
    if (category === 'demo_only') return 'Demo only';
    return Number(confidence) >= 0.7 ? 'You can trust this more' : 'Useful direction, but test first';
  }

  function resultDataUsed(data, computed, category) {
    const source = data.data_source || {};
    const isDemo = source?.mode === 'demo_fallback' || data.chart_meta?.is_sample || category === 'demo_only';
    const sourceLabel = source?.mode === 'bootstrap'
      ? 'Self-reported daily history'
      : isDemo
        ? 'Demo shop example'
        : source?.csv_used ? 'Imported CSV'
          : source?.sheet_url_used ? 'Connected Google Sheet'
            : 'Connected data';
    const months = Number(data.summary?.months);
    const rows = Number(source.sheet_rows_used || source.bootstrap_entries_used || computed?.sample_size);
    const history = isDemo
      ? 'Example data only'
      : Number.isFinite(months) && months > 0
        ? `${months} month${months === 1 ? '' : 's'}${Number.isFinite(rows) && rows > 0 ? ` · ${rows} rows/entries` : ''}`
      : Number.isFinite(rows) && rows > 0 ? `${rows} rows/entries` : 'Limited history';
    return { sourceLabel, history };
  }

  function showAnotherQuestion() {
    hideResults();
    showQuestionComposer();
    questionInput.focus();
  }

  function showQuestionWithPrompt(prompt) {
    questionInput.value = prompt || '';
    resizeQuestion();
    updateQuestionState();
    showAnotherQuestion();
  }

  function showBackToDataSummary() {
    if (lastSheetSummary) {
      showDataReady(lastSheetSummary);
      return;
    }
    openUploadOptions();
  }

  function showTrackPrompt() {
    intentPrompt.classList.add('show');
    intentPrompt.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function showResultDataFix() {
    if (lastSheetSummary) {
      openDataFixFlow();
      return;
    }
    openUploadOptions();
  }

  function renderAnalystOverview({
    answer,
    why,
    action,
    strength,
    category = 'clear_enough',
    dataUsed = [],
    choices = [],
    primary = null,
    secondary = null,
    details = '',
    showDetails = false,
  }) {
    if (!resultOverview) return;
    setCurrentView('result');
    hideBootstrapGate();
    if (evidenceLimitation) evidenceLimitation.hidden = true;
    if (trendResult) trendResult.hidden = true;
    document.getElementById('scenarios-block')?.setAttribute('hidden', '');
    document.getElementById('evidence-block')?.toggleAttribute('hidden', !showDetails);
    confidenceBlock.hidden = !showDetails;
    document.querySelector('.explain')?.toggleAttribute('hidden', !showDetails);
    if (calculationDetails) {
      calculationDetails.hidden = !showDetails;
      calculationDetails.open = false;
    }
    if (resultDetailsCopy) {
      resultDetailsCopy.textContent = details;
      resultDetailsCopy.hidden = !details;
    }
    const demoActions = document.getElementById('demo-result-actions');
    if (demoActions) demoActions.hidden = true;
    if (dataSourceNote) dataSourceNote.hidden = true;
    intentPrompt.classList.remove('show', 'captured');
    viewInLog.hidden = true;

    overviewAnswer.textContent = plainResultCopy(answer || 'I can help you check this step by step.');
    overviewWhy.textContent = plainResultCopy(why || 'I need a little more information before I can say this honestly.');
    overviewAction.textContent = plainResultCopy(action || 'Choose a next step below.');
    overviewStrength.textContent = strength || 'Not enough data yet';
    overviewStrength.className = `overview-strength ${category}`;
    overviewData.innerHTML = '';
    dataUsed.forEach(([label, value]) => {
      const item = document.createElement('div');
      item.className = 'overview-data-item';
      item.innerHTML = `<span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong>`;
      overviewData.appendChild(item);
    });

    overviewChoices.innerHTML = '';
    overviewChoices.hidden = !choices.length;
    choices.forEach(choice => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'overview-choice';
      button.textContent = choice.label || choice.prompt || '';
      button.addEventListener('click', () => {
        questionInput.value = choice.prompt || choice.label || '';
        resizeQuestion();
        updateQuestionState();
        showAnotherQuestion();
      });
      overviewChoices.appendChild(button);
    });

    resultPrimaryAction.hidden = !primary;
    resultPrimaryAction.textContent = primary?.label || '';
    resultPrimaryAction.onclick = primary?.handler || null;
    resultSecondaryAction.hidden = false;
    resultSecondaryAction.textContent = secondary?.label || 'Ask another question';
    resultSecondaryAction.onclick = secondary?.handler || showAnotherQuestion;
    resultTertiaryAction.onclick = showBackToDataSummary;
    resultOverview.hidden = false;
    resultsSection.hidden = false;
    resultsSection.classList.add('show');
    stage.classList.add('has-result');
    currentResult = null;
    updateAwayFromLandingState();
  }

  function renderSimpleOverview(data, computed, generated) {
    if (!resultOverview) return;
    const category = data.evidence_category || data.evidence?.category || 'clear_enough';
    const isWeak = category === 'weak_signal';
    const source = resultDataUsed(data, computed, category);
    const quality = category === 'clear_enough'
      ? 'Enough for a cautious test'
      : isWeak ? 'Limited — early pattern only' : 'Missing key fields';
    const usesAverageBill = Boolean(computed.uses_user_provided_average_bill)
      || data.data_source?.field_sources?.avg_order_value?.source === 'user_provided_average_order_value';
    renderAnalystOverview({
      answer: isWeak
        ? 'This is an early signal only — test it before changing it for everyone.'
        : generated.recommendation || 'Use this as a cautious test, not a guarantee.',
      why: generated.why || data.evidence?.message || 'The available history gives a directional signal, but it is not a guarantee.',
      action: data.evidence?.next_action || (isWeak
        ? 'Try a small change for 3–5 days and compare orders before changing it for everyone.'
        : 'Use this as a cautious test, then record what actually happens.'),
      strength: evidenceStrength(category, computed.confidence),
      category,
      dataUsed: [
        ['Source', source.sourceLabel],
        ['History used', source.history],
        ['Data quality', quality],
        ...(usesAverageBill ? [['Note', 'Sales estimate uses your average bill amount, not exact bill values.']] : []),
      ],
      primary: { label: 'Track this decision', handler: showTrackPrompt },
      showDetails: true,
      details: 'The details below show the calculation method, sample size, mapped columns, range, chart, and other supporting metrics.',
    });
  }

  function renderBootstrapGate(data) {
    if (!bootstrapGate || !bootstrapGateProgress) return;
    setCurrentView('result');
    const entryCount = Number(data.bootstrap?.entry_count ?? data.data_source?.bootstrap_entries_used) || 0;
    const minimum = Number(data.bootstrap?.minimum_entries ?? data.data_source?.bootstrap_min_entries) || 20;
    bootstrapGateProgress.textContent = `You have ${entryCount} of ${minimum} daily entries.`;
    renderAnalystOverview({
      answer: 'I can’t estimate this honestly yet.',
      why: `Hisaab has ${entryCount} of ${minimum} daily entries. A little more history is needed before this answer is useful.`,
      action: 'Add more daily sales entries, then ask the question again.',
      strength: 'Not enough data yet',
      category: 'needs_more_data',
      dataUsed: [['Source', 'Your daily sales entries'], ['History used', `${entryCount} of ${minimum} entries`]],
      primary: { label: 'Add today’s sales', handler: () => bootstrapGateAdd.click() },
      showDetails: false,
    });
    lastSimulationPersistence = data.persistence || null;
    dataSourceNote.classList.remove('demo');
    dataSourceText.textContent = 'Self-reported daily history is still being built';
    updateAwayFromLandingState();
    resultOverview.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function hideBootstrapGate() {
    if (!bootstrapGate) return;
    bootstrapGate.hidden = true;
    document.getElementById('evidence-block')?.removeAttribute('hidden');
    confidenceBlock.hidden = false;
    document.querySelector('.explain')?.removeAttribute('hidden');
    if (calculationDetails) calculationDetails.hidden = false;
  }

  function renderEvidenceLimitation(data) {
    if (!evidenceLimitation) return;
    setCurrentView('result');
    const evidence = data.evidence || {};
    const category = data.evidence_category || data.result_category || evidence.category || 'not_enough_evidence';
    const isDemo = category === 'demo_only';
    const isClarify = category === 'clarify_intent' || category === 'clarify_question';
    const isBroad = ['guided_answer', 'broad_guidance'].includes(category);
    const isNeedsData = ['unsupported_question', 'needs_more_data', 'evidence_limited', 'not_enough_evidence'].includes(category);
    const source = resultDataUsed(data, data.computed || {}, category);
    const choices = Array.isArray(evidence.choices) ? evidence.choices : [];
    const missing = Array.isArray(evidence.missing_fields) ? evidence.missing_fields : (Array.isArray(data.missing_fields) ? data.missing_fields : []);
    const missingText = missing.length ? `Missing: ${missing.map(item => item.label || item.prompt || item).join(', ')}` : '';

    let answer = evidence.title || 'I can guide you, but I should not guess from the data I have.';
    let why = evidence.message || 'The available information is not enough for an honest estimate yet.';
    let action = evidence.next_action || 'Choose a useful next step below.';
    let strength = 'Not enough data yet';
    let primary = null;
    let secondary = null;

    if (isDemo) {
      answer = 'This is an example answer from the demo shop.';
      why = evidence.message || 'The demo uses example data to show how Hisaab explains a business question.';
      action = evidence.next_action || 'Try the same question with your own data when you are ready.';
      strength = 'Demo only';
      primary = { label: 'Upload my data', handler: openUploadOptions };
      secondary = { label: 'Try another demo question', handler: openDemoIntro };
    } else if (isClarify) {
      answer = 'I want to understand what you want to check first.';
      why = evidence.message || 'This question could mean more than one business check.';
      action = 'Choose one question below so I can give you a useful answer.';
    } else if (isBroad) {
      answer = 'I can guide you, but I should not guess from this data alone.';
      why = evidence.message || 'This is a bigger business decision than the current numbers can support on their own.';
      action = evidence.next_action || 'Check order trend first, then use that as one part of the decision.';
      strength = 'Not enough data for a direct estimate.';
      primary = { label: 'Check order trend', handler: () => showQuestionWithPrompt('Are orders going up or down?') };
    } else if (isNeedsData) {
      answer = 'I can’t estimate this honestly yet.';
      why = evidence.message || 'Some information needed for this question is not available yet.';
      action = evidence.next_action || 'Add the missing information, then try this question again.';
      primary = {
        label: lastSheetSummary ? 'Fix detected data' : 'Add data',
        handler: () => lastSheetSummary
          ? openContextualFixData({ missing_fields: evidence.required_fields || data.missing_fields || [], evidence })
          : openUploadOptions(),
      };
    }

    renderAnalystOverview({
      answer,
      why,
      action,
      strength,
      category: isDemo ? 'demo_only' : category,
      dataUsed: [['Source', isDemo ? 'Demo shop example' : source.sourceLabel], ['History used', isDemo ? 'Example data only' : source.history], ...(missingText ? [['Still needed', missingText.replace(/^Missing: /, '')]] : [])],
      choices: isClarify ? choices : [],
      primary,
      secondary,
      showDetails: false,
    });
    evidenceLimitation.hidden = true;
    evidenceLimitationEyebrow.textContent = '';
    evidenceLimitationTitle.textContent = '';
    evidenceLimitationCopy.textContent = '';
    evidenceLimitationDetail.textContent = '';
    updateAwayFromLandingState();
    resultOverview.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function hideEvidenceLimitation() {
    if (!evidenceLimitation) return;
    evidenceLimitation.hidden = true;
    document.getElementById('evidence-block')?.removeAttribute('hidden');
    confidenceBlock.hidden = false;
    document.querySelector('.explain')?.removeAttribute('hidden');
    if (calculationDetails) calculationDetails.hidden = false;
    if (evidenceLimitationTertiary) evidenceLimitationTertiary.hidden = true;
    if (intentChoiceList) {
      intentChoiceList.hidden = true;
      intentChoiceList.innerHTML = '';
    }
  }

  // Render the scenarios block from data.scenarios_bundle. If bundle is
  // missing, hide the block entirely and remove the .with-scenarios modifier
  // so existing evidence/confidence stats render exactly as they did before.
  // This function is strictly additive — it never touches any DOM outside
  // the scenarios-block/threshold-line-block/scenarios-details elements.
  function renderScenariosBlock(data) {
    const block = document.getElementById('scenarios-block');
    const results = document.getElementById('results');
    if (!block || !results) return;

    // Phase 4 keeps scenario cards out of the first screen. They present
    // polished choices before the owner has seen the evidence strength and
    // next action, so the simple overview is now the primary result.
    block.hidden = true;
    results.classList.remove('with-scenarios');
    return;

    /* Legacy scenario-card renderer retained below for reference while the
       simpler result hierarchy is being rolled out. */
    const grid = document.getElementById('scenario-grid');
    const thresholdBlock = document.getElementById('threshold-line-block');
    const bundle = data && data.scenarios_bundle;

    // Question echo — the exact user question, plus a "based on N months" line.
    const qText = document.getElementById('scenarios-q-text');
    const qSub = document.getElementById('scenarios-q-sub');
    if (qText) qText.textContent = lastQuestion || '';
    if (qSub) {
      const months = Number(data.summary?.months || 0);
      const basedOnKey = data.data_source?.mode === 'bootstrap' ? 'scenarios.based_on_bootstrap' : 'scenarios.based_on';
      let subText = months > 0 ? t(basedOnKey).replace('{months}', months) : '';
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
      card.className = 'scenario' + (s.is_best_fit ? ' best' : '') + (lowConf ? ' low-conf' : '');
      const revenue = Number(s.headline_revenue) || 0;
      // When low-confidence, don't paint the number green/red — muted grey
      // signals "directional, not a firm gain/loss". The baseline (₹0) is
      // always neutral regardless.
      const revenueClass = lowConf ? 'muted' : (revenue > 0 ? 'good' : revenue < 0 ? 'bad' : '');
      const symbol = bundle.currency_symbol || '₹';
      const revenueFormatted = revenue === 0
        ? `${symbol}0`
        : `${revenue > 0 ? '+' : '−'}${symbol}${Math.abs(revenue).toLocaleString('en-IN')}`;

      // Build with textContent-first, no innerHTML injection of untrusted data.
      // Every field the backend provides is treated as text, not HTML.
      const flagHtml = s.is_best_fit
        ? `<span class="best-flag">${escapeHtml(t('scenarios.best_fit') !== 'scenarios.best_fit' ? t('scenarios.best_fit') : (currentUILang === 'hi' ? 'आपके डेटा के लिए सबसे उपयुक्त' : 'Best fit for your data'))}</span>`
        : '';
      card.innerHTML = `
        ${flagHtml}
        <div class="s-label">${escapeHtml(s.label || '')}</div>
        <div class="s-action">${escapeHtml(s.action_short || '')}</div>
        <div class="s-outcome-label">${escapeHtml(currentUILang === 'hi' ? 'इस महीने, संभावित' : 'This month, likely')}</div>
        <div class="s-outcome ${revenueClass}">${revenueFormatted}</div>
        <div class="s-outcome-note">${escapeHtml(s.headline_note || '')}</div>
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

    // Fetch and render the track-record strip asynchronously — never blocks
    // the scenarios from showing. Hidden by default; only appears if the user
    // has reconciled decisions to show.
    fetchAndRenderTrackStrip();
  }

  // Fetch the track record and populate the strip at the top of the scenarios
  // block. Runs async and fails silent — a network hiccup or a brand-new user
  // with no history simply leaves the strip hidden, never an error state on
  // the result screen. Uses the same demo flag the decisions log uses so the
  // seeded demo history shows during sample-data runs.
  async function fetchAndRenderTrackStrip() {
    const strip = document.getElementById('track-record-strip');
    if (!strip) return;
    // Hide first — if this render is for a user with no history, it stays hidden.
    strip.hidden = true;
    try {
      const useDemo = activeDataset.kind === 'sample';
      const url = '/api/decisions/track-record' + (useDemo ? '?demo=true' : '');
      const res = await fetch(url, { headers: apiHeaders() });
      if (!res.ok) return;
      const body = await readJsonResponse(res);
      // Need at least one reconciled decision to show anything honest.
      if (!body || !Number.isFinite(Number(body.matchedCount)) || body.matchedCount < 1) return;
      if (!body.latestReconciled) return;

      const ringFg = document.getElementById('tr-ring-fg');
      const ringLabel = document.getElementById('tr-ring-label');
      const textBody = document.getElementById('tr-text-body');
      if (!ringFg || !ringLabel || !textBody) return;

      // Ring: accuracyPct maps to stroke-dashoffset. Circumference = 2πr,
      // r=18.5 → ~116. offset = circumference * (1 - pct/100).
      const pct = Number.isFinite(Number(body.accuracyPct)) ? Number(body.accuracyPct) : null;
      const circumference = 116;
      if (pct !== null) {
        ringFg.setAttribute('stroke-dashoffset', String(Math.round(circumference * (1 - pct / 100))));
        ringLabel.textContent = `${pct}%`;
      } else {
        ringFg.setAttribute('stroke-dashoffset', String(circumference));
        ringLabel.textContent = '';
      }

      // Text: "Last time we said X, you got Y." + "within N pts on H of last T".
      const latest = body.latestReconciled;
      const fmtPp = (v) => {
        const n = Number(v);
        if (!Number.isFinite(n)) return '';
        const sign = n > 0 ? '+' : n < 0 ? '−' : '';
        return `${sign}${Math.abs(n).toFixed(1)}%`;
      };
      const latestSentence = t('track.latest')
        .replace('{predicted}', fmtPp(latest.predictedValue))
        .replace('{actual}', fmtPp(latest.actualValue));
      const withinSentence = (Number(body.recentWindowCount) >= 1)
        ? ' ' + t('track.within')
            .replace('{pp}', body.hitThresholdPp)
            .replace('{hits}', body.hitsInWindow)
            .replace('{total}', body.recentWindowCount)
        : '';
      // Build with escaped values; only the bolded numbers use markup.
      textBody.innerHTML = escapeHtml(latestSentence) + escapeHtml(withinSentence);

      strip.hidden = false;
    } catch (_err) {
      // Fail silent — the strip is an enhancement, never a blocker.
      strip.hidden = true;
    }
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

  function sanitizeDemoGenerated(generated = {}) {
    const sanitize = value => String(value || '')
      .replace(/best fit for your data/gi, 'best fit in this example')
      .replace(/your (data|history|shop|business|orders)/gi, 'this demo shop’s example data')
      .replace(/your/gi, 'the demo shop’s')
      .replace(/prediction/gi, 'illustrative estimate');
    return {
      ...generated,
      recommendation: sanitize(generated.recommendation),
      why: sanitize(generated.why),
    };
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
    const source = data.data_source || {};
    const resultCategory = data.evidence_category || computed.evidence_category || data.evidence?.category || null;
    const sourceCsv = source.csv_used === true || activeDataset.kind === 'csv';
    const simpleAnswer = generated.recommendation || data.recommendation || '';
    const sourceLabel = source.mode === 'bootstrap'
      ? 'Self-reported daily history'
      : sourceCsv ? 'Imported CSV'
        : source.mode === 'sheet' ? 'Google Sheet'
          : 'Demo example';
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
      resultCategory,
      evidenceCategory: resultCategory,
      evidenceStrength: evidenceStrength(resultCategory, confidence),
      simpleAnswer,
      suggestedAction: data.evidence?.next_action || 'Record what happens after you try it.',
      explanation: generated.why || data.why || '',
      dataMaturity: data.data_maturity || data.evidence?.maturity || null,
      sourceLabel,
      csvUsed: sourceCsv,
      bootstrapEntries: Number(source.bootstrap_entries_used) || 0,
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
    if (currentResult.dataSourceKind === 'sample') {
      intentPrompt.classList.add('captured');
      intentMsg.textContent = 'Demo decision not saved.';
      intentSub.textContent = 'Demo decisions are not saved because this is not real business data.';
      return;
    }
    activeIntent = intent;
    if (intentStartDateRow) intentStartDateRow.hidden = true;
    if (intentStartDate) intentStartDate.value = '';
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
      if (saved.demo_only || saved.saved === false) {
        throw new Error('Demo decisions are not saved because this is not real business data.');
      }
      lastSavedDecisionId = saved.id;
      const wasKnown = savedDecisions.some(item => item.id === saved.id);
      savedDecisions = [saved, ...savedDecisions.filter(item => item.id !== saved.id)];
      decisionsCountValue = wasKnown ? decisionsCountValue : decisionsCountValue + 1;
      renderDecisionCount(decisionsCountValue || 1);
      intentPrompt.classList.add('captured');
      if (intent === 'applied') {
        intentMsg.textContent = 'Saved · marked as tried.';
        intentSub.textContent = 'Hisaab will help check what happened when newer data is available.';
        if (intentStartDateRow) intentStartDateRow.hidden = false;
      } else if (intent === 'skipped') {
        intentMsg.textContent = 'Saved · marked as skipped.';
        intentSub.textContent = 'Hisaab will not ask for an outcome for this decision.';
      } else {
        intentMsg.textContent = 'Saved · marked as unsure.';
        intentSub.textContent = 'You can come back after a few days.';
      }
      viewInLog.hidden = false;
    } catch (err) {
      intentPrompt.classList.remove('captured');
      intentError.hidden = false;
      intentError.querySelector('span').textContent = err.message || "Calculated, but this decision was not saved. Try again?";
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
      resultCategory: snapshot.resultCategory,
      evidenceCategory: snapshot.resultCategory,
      evidenceStrength: snapshot.evidenceStrength,
      simpleAnswer: snapshot.simpleAnswer,
      suggestedAction: snapshot.suggestedAction,
      explanation: snapshot.explanation,
      dataMaturity: snapshot.dataMaturity,
      sourceLabel: snapshot.sourceLabel,
      csvUsed: snapshot.csvUsed,
      bootstrapEntries: snapshot.bootstrapEntries,
      dataSource: snapshot.dataSourceKind,
      sourceType: snapshot.dataSourceKind === 'sample' ? 'demo' : 'real',
      sheetUrl: snapshot.sheetUrl,
      status: intent,
      askedAt: snapshot.askedAt,
      intentSetAt: new Date().toISOString(),
      actualValue: null,
    };
  }

  async function saveIntentStartDate() {
    if (!lastSavedDecisionId || !intentStartDate?.value) return;
    try {
      const res = await fetch(`/api/decisions/${encodeURIComponent(lastSavedDecisionId)}`, {
        method: 'PATCH',
        headers: apiHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ startedAt: intentStartDate.value }),
      });
      const body = await readJsonResponse(res);
      if (!res.ok) throw new Error(body.error || 'Could not save the start date.');
      intentSub.textContent = 'Start date saved. Hisaab will help check what happened when newer data is available.';
      intentStartDateSave.textContent = 'Saved';
      intentStartDateSave.disabled = true;
    } catch (err) {
      intentSub.textContent = err.message || 'The decision was calculated, but the start date was not saved.';
    }
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
      const saved = await submitCheckBack({ didApply: false });
      showCheckBackDone(saved ? t('checkback.thanks_noted') : 'Could not save this update. Please try again.');
    });
    if (later) later.addEventListener('click', () => { card.hidden = true; });
    if (skip) skip.addEventListener('click', () => { card.hidden = true; });
    card.querySelectorAll('.cb-outcome').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const outcome = btn.getAttribute('data-outcome');
        const saved = await submitCheckBack({ didApply: true, outcome });
        showCheckBackDone(saved ? t('checkback.thanks') : 'Could not save this update. Please try again.');
      });
    });
  }

  async function submitCheckBack(payload) {
    if (!checkBackDecisionId) return false;
    try {
      const res = await fetch(`/api/decisions/${encodeURIComponent(checkBackDecisionId)}/checkback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...apiHeaders() },
        body: JSON.stringify(payload),
      });
      const body = await readJsonResponse(res);
      if (!res.ok) throw new Error(body.error || `Server error (HTTP ${res.status})`);
      fetchDecisionsCount();
      return true;
    } catch (_err) {
      return false;
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
      decisionLogSub.textContent = "This is where your saved decisions live. When you tell me what happened, I'll compare it with the earlier estimate.";
      return;
    }
    const avg = Number(track.averageAbsoluteDifference).toFixed(1);
    trackRecord.hidden = false;
    decisionLogSub.textContent = 'See what happened after past decisions. Demo examples are not included.';
    trackRecordText.innerHTML = `<span class="num-hi">${count} outcome${count === 1 ? '' : 's'} recorded</span> — past estimates differed from outcomes by an average of <span class="num-hi">${avg} pp</span>.`;
  }

  function renderDecisionList(decisions) {
    const visible = decisions.filter(decision => decisionFilterMatches(decision, activeDecisionFilter));
    if (!visible.length) {
      decisionList.innerHTML = '<div class="log-empty-note">No decisions in this view yet.</div>';
      return;
    }
    decisionList.innerHTML = visible.map(decision => decisionCardHtml(decision)).join('');
    decisionList.querySelectorAll('[data-compare-id]').forEach(btn => {
      btn.addEventListener('click', () => compareDecision(btn.dataset.compareId));
    });
    decisionList.querySelectorAll('[data-manual-id]').forEach(form => {
      form.addEventListener('submit', event => submitManualOutcome(event, form.dataset.manualId));
    });
  }

  function decisionCardHtml(decision) {
    const status = decision.status || 'pending';
    const hasActual = decision.actualValue !== null && decision.actualValue !== undefined;
    const evidence = decision.evidenceStrength || evidenceStrength(decision.resultCategory, decision.confidence);
    const source = decisionSourceLabel(decision);
    return `
      <div class="dl-card" id="decision-${escapeHtml(decision.id)}">
        <div class="top-row">
          <div class="q">${escapeHtml(decision.question)}</div>
          <div class="when">${escapeHtml(relativeDate(decision.askedAt))}</div>
        </div>
        <div class="status-row">
          <span class="status-badge status-${escapeHtml(status)}">${escapeHtml(statusLabel(status, hasActual))}</span>
          <span class="intent-tag">${escapeHtml(intentTag(status))}</span>
        </div>
        <div class="dl-answer"><span>Simple answer</span><strong>${escapeHtml(decision.simpleAnswer || 'A cautious test was suggested.')}</strong></div>
        <div class="dl-meta-row"><span class="evidence-pill">${escapeHtml(evidence)}</span><span class="source-pill">${escapeHtml(source)}</span></div>
        <div class="dl-explanation">${escapeHtml(decision.explanation || '')}</div>
        ${hasActual ? comparisonHtml(decision, false) : decisionActionHtml(decision)}
      </div>
    `;
  }

  function decisionActionHtml(decision) {
    if (decision.status === 'applied' && decision.dataSource === 'sheet' && decision.sheetUrl && decision.compareEligible) {
      return `
        <div class="dl-actions">
          <div class="new-data-cta">
            <div class="msg">Newer sales data is available.</div>
            <button data-compare-id="${escapeHtml(decision.id)}" type="button">Check what happened</button>
          </div>
        </div>
      `;
    }
    if (decision.status === 'applied') {
      return '<div class="dl-waiting">We need newer sales data to check what actually happened.</div>';
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
          actions.innerHTML = '<div class="log-empty-note">We need newer sales data to check what actually happened.</div>';
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
    micBtn.title = isRecording ? 'Listening... tap to stop' : 'Tap to speak your question — in any language';
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
    brandReset.hidden = !inAnalysis;
    brandReset.classList.toggle('is-resettable', inAnalysis);
    brandReset.setAttribute('aria-disabled', inAnalysis ? 'false' : 'true');
    brandReset.tabIndex = inAnalysis ? 0 : -1;
  }

  function resetToComposer() {
    showQuestionComposer();
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
          manual_mappings: manualMappings,
          mapping_choices: mappingChoices,
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
    stopReadingProgress();
    setCurrentView('home');
    demoStep = 'intro';
    selectedDemoQuestion = '';
    const sessionId = getSessionId();
    const userId = getUserId();
    window.clearTimeout(parseTimer);
    window.clearTimeout(intentPromptTimer);
    manualInputs = {};
    manualMappings = {};
    mappingChoices = {};
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
    if (uploadSheetUrlInput) uploadSheetUrlInput.value = '';
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
    document.body.classList.remove('upload-view-active');
    document.body.classList.add('home-landing');
    composer.hidden = true;
    if (langNote) langNote.hidden = true;
    sampleSuggestions.hidden = true;
    realSuggestions.hidden = true;
    if (homeNote) homeNote.hidden = false;
    setPath('sample');
    if (demoIntro) {
      demoIntro.hidden = true;
      demoIntro.classList.remove('open');
    }
    if (pathChooser) pathChooser.hidden = false;
    renderChipVisibility();
    document.getElementById('demo-result-actions')?.setAttribute('hidden', '');
    dataDetected.classList.remove('show');
    detectedHeadline.textContent = '';
    detectedBody.textContent = '';
    capabilityList.hidden = true;
    capabilityList.innerHTML = '';
    mappingPanel.hidden = true;
    mappingPanel.classList.remove('editing');
    mappingFix.hidden = false;
    mappingContinue.textContent = 'Ask a question';
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
    hideBootstrapGate();
    hideEvidenceLimitation();
    resultsSection.hidden = true;
    resultsSection.classList.remove('show');
    // Also remove the scenarios-layout modifier: a subsequent weak-data
    // result should render at its normal position, not with the top-spacing
    // that scenarios-mode adds.
    resultsSection.classList.remove('with-scenarios');
    if (trendResult) trendResult.hidden = true;
    const scenariosBlock = document.getElementById('scenarios-block');
    if (scenariosBlock) scenariosBlock.hidden = true;
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
    openContextualFixData(body);
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
    if (source?.mode === 'bootstrap') return 'bootstrap';
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
    if (source?.mode === 'bootstrap') return 'Self-reported daily history';
    if (activeDataset.kind === 'sample') return t('data_source.sample');
    // activeDataset says this is a real sheet/CSV, but we don't have a
    // server response with the full field list yet (e.g. right after a
    // home-screen auto-apply, before the first question is asked).
    if (!source) return 'Using your sheet';
    if (source.warning) return `Sheet note: ${source.warning}`;
    if (source.mode === 'sheet') {
      const fields = realFieldList(source);
      const origin = source.csv_used ? 'Using imported CSV data' : 'Using connected Google Sheet data';
      const averageBill = source.field_sources?.avg_order_value?.source === 'user_provided_average_order_value'
        ? ' · Estimated from your average bill amount, not exact order values'
        : '';
      return `${origin}${fields ? ` · ${fields}` : ''}${averageBill}`;
    }
    return 'Using connected data';
  }

  function realFieldList(source) {
    const fieldLabels = {
      orders: 'orders',
      order_date: 'dates',
      avg_order_value: 'total bill amount',
      delivery_fee: 'delivery fee',
      promo_active: 'discount or offer details',
      repeat_orders: 'customer details',
      customer_identifier: 'customer name or phone',
    };
    const labels = Object.entries(source.field_sources || {})
      .filter(([, info]) => ['derived', 'derived_manual', 'derived_low_confidence'].includes(info.status))
      .map(([field]) => fieldLabels[field] || field.replace(/_/g, ' '));
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
        : 'Estimate range: unknown — the calculation did not return enough range data.';
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
    return `Estimate range: ${formatPct(low)} to ${formatPct(high)} — ${isWeak ? interpretation : interpretation}`;
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
    return t(key);
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
    if (hasActual) return 'Compared';
    if (status === 'applied') return 'Waiting for outcome';
    if (status === 'skipped') return 'Skipped';
    return 'Not recorded';
  }

  function intentTag(status) {
    if (status === 'applied') return 'Tried';
    if (status === 'skipped') return 'Skipped';
    return 'Unsure';
  }

  function decisionFilterMatches(decision, filter) {
    const hasActual = decision.actualValue !== null && decision.actualValue !== undefined;
    if (filter === 'tried') return decision.status === 'applied';
    if (filter === 'waiting') return decision.status === 'applied' && !hasActual;
    if (filter === 'compared') return hasActual;
    if (filter === 'skipped') return decision.status === 'skipped';
    return true;
  }

  function decisionSourceLabel(decision) {
    if (decision.sourceLabel) return decision.sourceLabel;
    if (decision.dataSource === 'bootstrap') return 'Self-reported daily history';
    if (decision.dataSource === 'sheet') return decision.csvUsed ? 'Imported CSV' : 'Google Sheet';
    return 'Connected data';
  }

  function wireDecisionFilters() {
    document.querySelectorAll('.decision-filter').forEach(button => {
      button.addEventListener('click', () => {
        activeDecisionFilter = button.dataset.filter || 'all';
        document.querySelectorAll('.decision-filter').forEach(item => item.classList.toggle('active', item === button));
        renderDecisionList(savedDecisions);
      });
    });
  }

  function comparisonHtml(decision, fresh) {
    const category = decision.comparisonCategory || comparisonCategoryClient(decision.predictedValue, decision.actualValue);
    const message = decision.comparisonMessage || comparisonMessageClient(category, decision.predictedMetric);
    return `
      <div class="comparison-wrap">
        ${fresh ? '<div class="fresh-badge"><span class="dot"></span>Checked against newer sales data</div>' : ''}
        <div class="dl-comparison">
          <div class="dl-cell"><div class="lbl">Hisaab estimated</div><div class="v">${escapeHtml(formatPct(decision.predictedValue))}</div></div>
          <div class="dl-arrow">→</div>
          <div class="dl-cell"><div class="lbl">After the change</div><div class="v">${escapeHtml(formatPct(decision.actualValue))}</div></div>
        </div>
        <div class="dl-verdict ${escapeHtml(category)}"><span class="dot"></span>${escapeHtml(message)}</div>
      </div>
    `;
  }

  function comparisonCategoryClient(predictedValue, actualValue) {
    const predicted = Number(predictedValue);
    const actual = Number(actualValue);
    if (!Number.isFinite(predicted) || !Number.isFinite(actual)) return 'not_enough_new_data';
    if (Math.abs(actual) < 0.5) return 'no_clear_change';
    return Math.sign(predicted) === Math.sign(actual) ? 'matched_direction' : 'opposite_direction';
  }

  function comparisonMessageClient(category, metric) {
    const label = plainMetricLabel(metric || 'orders').toLowerCase();
    if (category === 'matched_direction') return `The result matched the direction for ${label}.`;
    if (category === 'opposite_direction') return `The result did not clearly match: ${label} moved in the other direction.`;
    if (category === 'no_clear_change') return `After the change, ${label} were mostly stable.`;
    return 'There is not enough new data to compare.';
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
