const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const scriptPath = path.join(root, 'public', 'script.js');
const cssPath = path.join(root, 'public', 'style.css');
const htmlPath = path.join(root, 'public', 'index.html');

function read(filePath) {
  return fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf8') : '';
}

function writeIfChanged(filePath, before, after, label) {
  if (after !== before) {
    fs.writeFileSync(filePath, after, 'utf8');
    console.log(`[runtime-fixes] ${label}`);
  }
}

function insertAfterOnce(source, marker, code, uniqueMarker) {
  if (source.includes(uniqueMarker)) return source;
  if (!source.includes(marker)) throw new Error(`[runtime-fixes] marker not found: ${uniqueMarker}`);
  return source.replace(marker, marker + '\n' + code);
}

function patchScript() {
  if (!fs.existsSync(scriptPath)) return;
  let source = read(scriptPath);
  const before = source;

  source = insertAfterOnce(
    source,
    '  const subjectVocabulary = /\\b(fee|fees|price|prices|promo|promotion|discount|cod|cash on delivery|delivery|shipping|orders?|repeat|customer|customers|revenue|aov|month|months)\\b/i;',
    [
      '  const CSV_MAX_BYTES = 4 * 1024 * 1024;',
      '  const CSV_TOO_LARGE_MESSAGE = \'This CSV is too large for quick upload. Use a CSV under 4 MB, or connect the data through Google Sheets.\';'
    ].join('\n'),
    'CSV_TOO_LARGE_MESSAGE'
  );

  source = insertAfterOnce(
    source,
    '  let uploadedCsv = null;',
    '  let uploadedCsvSize = 0;',
    'uploadedCsvSize'
  );

  const handleCsvReplacement = [
    '  async function handleCsvFile() {',
    '    const file = csvFileInput.files?.[0];',
    '    if (!file) return;',
    "    setPath('real');",
    '    dcHideError();',
    '    if (file.size > CSV_MAX_BYTES) {',
    '      uploadedCsv = null;',
    '      uploadedCsvSize = 0;',
    "      uploadedFileName = '';",
    "      csvFileInput.value = '';",
    '      renderCsvUploadState();',
    '      renderSheetUrlState();',
    '      updateDcReadButtonState();',
    '      const note = document.getElementById(\'pending-data-note\');',
    '      if (note) note.hidden = true;',
    '      dcShowError(CSV_TOO_LARGE_MESSAGE);',
    '      return;',
    '    }',
    "    sheetUrlInput.value = '';",
    '    uploadedFileName = file.name;',
    '    uploadedCsvSize = file.size;',
    '    uploadedCsv = await file.text();',
    '    connectedDataLabel = uploadedFileName;',
    '    renderCsvUploadState();',
    '    renderSheetUrlState();',
    '    updateDcLinkStatus();',
    '    const isInlineRefresh = stage.classList.contains(\'connecting-data\') && Boolean(currentResult);',
    '    if (isInlineRefresh) {',
    '      await parseConnectedData();',
    '    } else {',
    '      updateDcReadButtonState();',
    '      const noteText = document.getElementById(\'pending-data-note-text\');',
    '      const note = document.getElementById(\'pending-data-note\');',
    '      if (noteText) noteText.textContent = `${uploadedFileName} selected — click Read data.`;',
    '      if (note) note.hidden = false;',
    '    }',
    '  }'
  ].join('\n');

  source = source.replace(/  async function handleCsvFile\(\) \{[\s\S]*?\n  \}\n\n  function clearCsvUpload\(\) \{/,
    handleCsvReplacement + '\n\n  function clearCsvUpload() {');

  source = source.replace(
    "  function clearCsvUpload() {\n    uploadedCsv = null;\n    uploadedFileName = '';",
    "  function clearCsvUpload() {\n    uploadedCsv = null;\n    uploadedCsvSize = 0;\n    uploadedFileName = '';"
  );

  source = insertAfterOnce(
    source,
    '    if (!uploadedCsv && sheetUrl.length <= 20) return;',
    [
      '',
      '    if (uploadedCsv && uploadedCsvSize > CSV_MAX_BYTES) {',
      "      setDcScreen('upload');",
      '      dcShowError(CSV_TOO_LARGE_MESSAGE);',
      '      updateDcReadButtonState();',
      '      return;',
      '    }'
    ].join('\n'),
    'uploadedCsvSize > CSV_MAX_BYTES'
  );

  source = source.replaceAll(
    '        const body = await readJsonResponse(res);\n        if (!res.ok) throw new Error(body.error || `Server error (HTTP ${res.status})`);',
    '        if (res.status === 413) throw new Error(CSV_TOO_LARGE_MESSAGE);\n        const body = await readJsonResponse(res);\n        if (!res.ok) throw new Error(body.error || `Server error (HTTP ${res.status})`);'
  );

  source = source.replaceAll(
    '      const body = await readJsonResponse(res);\n      if (!res.ok) throw new Error(body.error || `Server error (HTTP ${res.status})`);',
    '      if (res.status === 413) throw new Error(CSV_TOO_LARGE_MESSAGE);\n      const body = await readJsonResponse(res);\n      if (!res.ok) throw new Error(body.error || `Server error (HTTP ${res.status})`);'
  );

  source = source.replace(/  function setLoading\(isLoading, isRefine = false\) \{[\s\S]*?\n  \}\n\n  function setSubmissionLocked\(locked\) \{/, [
    '  function setLoading(isLoading, isRefine = false) {',
    '    requestInFlight = isLoading;',
    '    const text = isRefine ? refineBtnText : btnText;',
    '    const loader = isRefine ? refineBtnLoader : btnLoader;',
    '    const btn = isRefine ? refineSend : simulateBtn;',
    "    const isDcAskSubmit = !isRefine && simulateBtn.classList.contains('dc-ask-cta');",
    '',
    '    if (isDcAskSubmit) {',
    '      text.hidden = false;',
    "      text.textContent = isLoading ? 'Thinking…' : 'Ask Hisaab';",
    '      loader.hidden = !isLoading;',
    '    } else {',
    '      text.hidden = isLoading;',
    '      loader.hidden = !isLoading;',
    '    }',
    '',
    '    if (btn) {',
    "      btn.classList.toggle('loading', isLoading);",
    "      btn.setAttribute('aria-busy', isLoading ? 'true' : 'false');",
    '    }',
    '',
    "    const loadingShell = isRefine ? refineInline : (composer || document.getElementById('ask-block'));",
    "    if (loadingShell) loadingShell.classList.toggle('loading', isLoading);",
    '    setSubmissionLocked(isLoading);',
    '  }',
    '',
    '  function setSubmissionLocked(locked) {'
  ].join('\n'));

  writeIfChanged(scriptPath, before, source, 'patched public/script.js');
}

function patchCss() {
  if (!fs.existsSync(cssPath)) return;
  let source = read(cssPath);
  const before = source;
  if (!source.includes('ask-cta-permanent-fix')) {
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
.dc-ask-cta .btn-loader[hidden]{ display:none !important; }
.dc-ask-cta.loading,
.dc-ask-cta:disabled.loading{
  background:var(--accent) !important;
  border-color:var(--accent) !important;
  color:#fff !important;
  opacity:1 !important;
  cursor:progress !important;
}
.dc-ask-cta.loading:hover,
.dc-ask-cta:disabled.loading:hover{ background:var(--accent) !important; }
.dc-ask-cta.loading .spinner{
  width:14px !important;
  height:14px !important;
  border-width:2px !important;
}
`;
  }
  writeIfChanged(cssPath, before, source, 'patched public/style.css');
}

function patchHtml() {
  if (!fs.existsSync(htmlPath)) return;
  let source = read(htmlPath);
  const before = source;
  source = source.replace('<span class="dc-dropzone-sub">CSV files only</span>', '<span class="dc-dropzone-sub">CSV files under 4 MB</span>');
  writeIfChanged(htmlPath, before, source, 'patched public/index.html');
}

patchScript();
patchCss();
patchHtml();
