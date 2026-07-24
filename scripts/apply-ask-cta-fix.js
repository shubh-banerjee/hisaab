const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const scriptPath = path.join(root, 'public', 'script.js');
const cssPath = path.join(root, 'public', 'style.css');
const htmlPath = path.join(root, 'public', 'index.html');

function replaceRequired(source, label, find, replacement) {
  if (source.includes(replacement)) return source;
  if (!source.includes(find)) {
    throw new Error(`[apply-ask-cta-fix] ${label}: expected source block not found`);
  }
  return source.replace(find, replacement);
}

function insertAfterOnce(source, label, marker, code, uniqueMarker) {
  if (source.includes(uniqueMarker)) return source;
  if (!source.includes(marker)) {
    throw new Error(`[apply-ask-cta-fix] ${label}: insert marker not found`);
  }
  return source.replace(marker, `${marker}\n${code}`);
}

function patchAskCta(source) {
  const marker = 'const isDcAskSubmit = !isRefine && simulateBtn.classList.contains';
  if (source.includes(marker)) return source;

  const current = `  function setLoading(isLoading, isRefine = false) {
    requestInFlight = isLoading;
    const text = isRefine ? refineBtnText : btnText;
    const loader = isRefine ? refineBtnLoader : btnLoader;
    text.hidden = isLoading;
    loader.hidden = !isLoading;
    const btn = isRefine ? refineSend : simulateBtn;
    if (btn) btn.classList.toggle('loading', isLoading);
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
    // Every trigger is locked together, not just the one that started the
    // request — this is what prevents a second click/chip/refine-submit
    // while a request is pending from firing an overlapping second call.
    setSubmissionLocked(isLoading);
  }`;

  const replacement = `  function setLoading(isLoading, isRefine = false) {
    requestInFlight = isLoading;
    const text = isRefine ? refineBtnText : btnText;
    const loader = isRefine ? refineBtnLoader : btnLoader;
    const btn = isRefine ? refineSend : simulateBtn;
    const isDcAskSubmit = !isRefine && simulateBtn.classList.contains('dc-ask-cta');

    if (isDcAskSubmit) {
      // The Ask Hisaab CTA is a full pill button, not the older circular
      // icon-send button. Keep its label visible while loading so the button
      // never collapses into a tiny spinner-only blob.
      text.hidden = false;
      text.textContent = isLoading ? 'Thinking…' : 'Ask Hisaab';
      loader.hidden = !isLoading;
    } else {
      text.hidden = isLoading;
      loader.hidden = !isLoading;
    }

    if (btn) {
      btn.classList.toggle('loading', isLoading);
      btn.setAttribute('aria-busy', isLoading ? 'true' : 'false');
    }

    const loadingShell = isRefine ? refineInline : (composer || document.getElementById('ask-block'));
    if (loadingShell) loadingShell.classList.toggle('loading', isLoading);
    setSubmissionLocked(isLoading);
  }`;

  return replaceRequired(source, 'setLoading CTA fix', current, replacement);
}

function patchCsvLimit(source) {
  source = insertAfterOnce(
    source,
    'CSV max constants',
    `  const subjectVocabulary = /\\b(fee|fees|price|prices|promo|promotion|discount|cod|cash on delivery|delivery|shipping|orders?|repeat|customer|customers|revenue|aov|month|months)\\b/i;`,
    `
  const CSV_MAX_BYTES = 4 * 1024 * 1024;
  const CSV_MAX_MB = 4;
  const CSV_TOO_LARGE_MESSAGE = 'This CSV is too large for quick upload. Use a CSV under 4 MB, or connect the data through Google Sheets.';`,
    'CSV_TOO_LARGE_MESSAGE'
  );

  source = insertAfterOnce(
    source,
    'uploaded CSV size state',
    `  let uploadedCsv = null;`,
    `  let uploadedCsvSize = 0;`,
    'uploadedCsvSize'
  );

  const currentHandleCsv = `  async function handleCsvFile() {
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
      if (noteText) noteText.textContent = \`${uploadedFileName} selected — click Read data.\`;
      if (note) note.hidden = false;
    }
  }`;

  const replacementHandleCsv = `  async function handleCsvFile() {
    const file = csvFileInput.files?.[0];
    if (!file) return;
    setPath('real');
    dcHideError();
    if (file.size > CSV_MAX_BYTES) {
      uploadedCsv = null;
      uploadedCsvSize = 0;
      uploadedFileName = '';
      csvFileInput.value = '';
      renderCsvUploadState();
      renderSheetUrlState();
      updateDcReadButtonState();
      dcShowError(CSV_TOO_LARGE_MESSAGE);
      return;
    }
    sheetUrlInput.value = '';
    uploadedFileName = file.name;
    uploadedCsvSize = file.size;
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
      if (noteText) noteText.textContent = \`${uploadedFileName} selected — click Read data.\`;
      if (note) note.hidden = false;
    }
  }`;

  source = replaceRequired(source, 'CSV file size guard', currentHandleCsv, replacementHandleCsv);

  source = replaceRequired(
    source,
    'clear CSV size state',
    `  function clearCsvUpload() {
    uploadedCsv = null;
    uploadedFileName = '';
    csvFileInput.value = '';`,
    `  function clearCsvUpload() {
    uploadedCsv = null;
    uploadedCsvSize = 0;
    uploadedFileName = '';
    csvFileInput.value = '';`
  );

  source = insertAfterOnce(
    source,
    'parse CSV size guard',
    `    if (!uploadedCsv && sheetUrl.length <= 20) return;`,
    `
    if (uploadedCsv && uploadedCsvSize > CSV_MAX_BYTES) {
      setDcScreen('upload');
      dcShowError(CSV_TOO_LARGE_MESSAGE);
      updateDcReadButtonState();
      return;
    }`,
    'uploadedCsvSize > CSV_MAX_BYTES'
  );

  const parseResponseMarker = `        });
        const body = await readJsonResponse(res);
        if (!res.ok) throw new Error(body.error || \`Server error (HTTP ${res.status})\`);`;
  const parseResponseReplacement = `        });
        if (res.status === 413) throw new Error(CSV_TOO_LARGE_MESSAGE);
        const body = await readJsonResponse(res);
        if (!res.ok) throw new Error(body.error || \`Server error (HTTP ${res.status})\`);`;
  if (source.includes(parseResponseMarker)) {
    source = source.split(parseResponseMarker).join(parseResponseReplacement);
  }

  return source;
}

function patchScript() {
  if (!fs.existsSync(scriptPath)) return;
  let source = fs.readFileSync(scriptPath, 'utf8');
  const before = source;
  source = patchAskCta(source);
  source = patchCsvLimit(source);
  if (source !== before) {
    fs.writeFileSync(scriptPath, source, 'utf8');
    console.log('[apply-ask-cta-fix] Patched public/script.js');
  }
}

function patchCss() {
  if (!fs.existsSync(cssPath)) return;
  let source = fs.readFileSync(cssPath, 'utf8');
  const marker = 'ask-cta-permanent-fix';
  if (source.includes(marker)) return;

  source += `

/* ask-cta-permanent-fix: keep Ask Hisaab CTA stable while request is running */
.dc-ask-cta{
  display:inline-flex !important;
  align-items:center !important;
  justify-content:center !important;
  gap:8px !important;
  min-width:132px !important;
  min-height:44px !important;
  width:auto !important;
  white-space:nowrap !important;
}

.dc-ask-cta .btn-text{
  display:inline-flex !important;
  align-items:center !important;
  justify-content:center !important;
  width:auto !important;
  height:auto !important;
  line-height:1 !important;
}

.dc-ask-cta .btn-loader{
  display:inline-flex !important;
  align-items:center !important;
  justify-content:center !important;
  width:16px !important;
  height:16px !important;
  flex:0 0 16px !important;
}

.dc-ask-cta .btn-loader[hidden]{
  display:none !important;
}

.dc-ask-cta.loading,
.dc-ask-cta:disabled.loading{
  background:var(--accent) !important;
  border-color:var(--accent) !important;
  color:#fff !important;
  opacity:1 !important;
  cursor:progress !important;
}

.dc-ask-cta.loading:hover,
.dc-ask-cta:disabled.loading:hover{
  background:var(--accent) !important;
}

.dc-ask-cta.loading .spinner{
  width:14px !important;
  height:14px !important;
  border-width:2px !important;
}
`;

  fs.writeFileSync(cssPath, source, 'utf8');
  console.log('[apply-ask-cta-fix] Appended stable CTA CSS');
}

function patchHtml() {
  if (!fs.existsSync(htmlPath)) return;
  let source = fs.readFileSync(htmlPath, 'utf8');
  const before = source;
  source = source.replace('<span class="dc-dropzone-sub">CSV files only</span>', '<span class="dc-dropzone-sub">CSV files under 4 MB</span>');
  if (source !== before) {
    fs.writeFileSync(htmlPath, source, 'utf8');
    console.log('[apply-ask-cta-fix] Added CSV size hint');
  }
}

patchScript();
patchCss();
patchHtml();
