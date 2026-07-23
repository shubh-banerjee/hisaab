const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const indexPath = path.join(root, 'public', 'index.html');
const stylePath = path.join(root, 'public', 'style.css');
const scriptPath = path.join(root, 'public', 'script.js');

const uploadMarkup = String.raw`    <section class="data-options data-source-flow upload-lesson-flow" id="data-options" hidden aria-label="Add your sales data">
      <button class="data-source-exit upload-lesson-close" id="upload-back" type="button" aria-label="Exit to home">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg>
      </button>

      <div class="upload-lesson-progress" aria-label="Add data progress">
        <span class="upload-step-label" id="data-source-step-label">Add data</span>
        <span class="upload-progress-dots" aria-hidden="true"><i class="is-active"></i><i></i><i></i></span>
      </div>

      <div class="data-source-step upload-lesson-step" id="data-source-choice-step">
        <div class="data-source-heading upload-lesson-heading">
          <div class="demo-eyebrow upload-eyebrow">Your sales data</div>
          <h2>Where is your sales data?</h2>
          <p>Upload a CSV file or paste a Google Sheet link. Hisaab will read whichever one you provide.</p>
        </div>

        <div class="upload-direct-grid">
          <div class="data-source-card upload-direct-card upload-file-card" id="data-source-file" role="group" aria-label="Upload a sales file">
            <div class="upload-direct-top">
              <span class="source-icon" aria-hidden="true"><svg width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3h8l4 4v14H6z"/><path d="M14 3v5h5"/><path d="M9 12h6M9 16h6M9 8h2"/></svg></span>
              <div><strong>Upload a sales file</strong><span>Choose a CSV export from your orders or billing app.</span></div>
            </div>
            <div class="file-upload-area compact-upload-area" id="file-upload-area">
              <div class="file-upload-empty" id="file-upload-empty">
                <strong>Drop CSV here</strong>
                <span>or choose a file from your device</span>
                <button class="file-upload-browse" id="file-upload-browse" type="button">Choose file</button>
              </div>
              <div class="file-upload-selected" id="file-upload-selected" hidden>
                <strong id="file-upload-name"></strong>
                <span id="file-upload-meta"></span>
                <span class="file-upload-ready">Ready to read</span>
              </div>
            </div>
            <p class="file-upload-status" id="file-upload-status" role="status" aria-live="polite">CSV only · Maximum 5 MB</p>
            <div class="file-upload-actions" id="file-upload-actions" hidden>
              <button id="file-upload-replace" type="button">Replace file</button>
              <button id="file-upload-remove" type="button">Remove</button>
            </div>
          </div>

          <div class="data-source-card upload-direct-card upload-sheet-card" id="data-source-sheet" role="group" aria-label="Connect Google Sheet">
            <div class="upload-direct-top">
              <span class="source-icon" aria-hidden="true"><svg width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M8 4v16"/></svg></span>
              <div><strong>Paste Google Sheet link</strong><span>Use a Sheet that contains your orders or sales.</span></div>
            </div>
            <label class="data-source-sheet-field compact-sheet-field" for="upload-sheet-url">
              <span>Google Sheet link</span>
              <span class="data-source-sheet-input-wrap">
                <span class="data-source-sheet-icon" aria-hidden="true"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M8 4v16"/></svg></span>
                <input id="upload-sheet-url" type="url" placeholder="https://docs.google.com/spreadsheets/d/..." autocomplete="url" aria-describedby="sheet-link-support sheet-link-status">
              </span>
              <small id="sheet-link-support">Set sharing to “Anyone with the link can view”.</small>
            </label>
            <p class="data-source-sheet-status" id="sheet-link-status" role="status" aria-live="polite" hidden><span id="sheet-link-status-icon" aria-hidden="true"></span><span id="sheet-link-status-text"></span></p>
          </div>
        </div>

        <button class="upload-manual-link upload-direct-manual" id="path-bootstrap" type="button">No sales file yet? Start with a simple daily sales log</button>
      </div>

      <div class="data-source-step" id="data-source-file-step" hidden></div>
      <div class="data-source-step" id="data-source-sheet-step" hidden></div>

      <div class="data-source-footer upload-lesson-footer">
        <button class="data-source-previous" id="data-source-previous" type="button" hidden>Previous</button>
        <button class="data-source-continue" id="data-source-continue" type="button" disabled>Read data</button>
      </div>
    </section>`;

const uploadCss = String.raw`
/* Unified upload data lesson flow */
body.upload-view-active .brand,
body.upload-view-active .top-actions,
body.upload-view-active .landing-intro{
  display:none !important;
}

body.upload-view-active .stage{
  min-height:100svh;
  justify-content:center;
  align-items:center;
  padding:48px 24px;
}

.upload-lesson-flow{
  position:relative !important;
  width:min(1120px, calc(100vw - 72px)) !important;
  height:min(720px, calc(100svh - 72px)) !important;
  min-height:660px !important;
  display:flex !important;
  flex-direction:column !important;
  overflow:hidden !important;
  margin:0 auto !important;
  padding:0 !important;
  border:1.5px solid rgba(13,24,51,.16) !important;
  border-radius:24px !important;
  background:rgba(255,255,255,.14) !important;
  box-shadow:none !important;
  text-align:left !important;
}

.upload-lesson-close{
  position:absolute !important;
  top:22px !important;
  right:32px !important;
  left:auto !important;
  z-index:80 !important;
  width:32px !important;
  height:32px !important;
  display:grid !important;
  place-items:center !important;
  padding:0 !important;
  border:0 !important;
  background:transparent !important;
  box-shadow:none !important;
  outline:0 !important;
  color:var(--ink-mute) !important;
  cursor:pointer !important;
}

.upload-lesson-close:hover,
.upload-lesson-close:focus,
.upload-lesson-close:focus-visible{
  color:var(--ink) !important;
  background:transparent !important;
  border:0 !important;
  box-shadow:none !important;
  outline:0 !important;
}

.upload-lesson-progress{
  height:72px;
  flex:0 0 72px;
  display:grid;
  grid-template-columns:1fr auto 1fr;
  align-items:center;
  gap:18px;
  padding:0 96px 0 52px;
  border-bottom:1px solid rgba(13,24,51,.10);
  color:var(--ink-mute);
  font-size:11px;
  font-weight:780;
  letter-spacing:.08em;
  text-transform:uppercase;
}

.upload-step-label{
  white-space:nowrap;
  min-width:max-content;
}

.upload-progress-dots{
  grid-column:2;
  display:flex;
  justify-content:center;
  gap:8px;
}

.upload-progress-dots i{
  width:30px;
  height:4px;
  border-radius:999px;
  background:rgba(13,24,51,.10);
}

.upload-progress-dots i.is-active{ background:var(--accent); }

.upload-lesson-step{
  flex:1;
  min-height:0;
  display:flex;
  flex-direction:column;
  justify-content:center;
  padding:40px 86px 28px;
  overflow:hidden;
}

.upload-lesson-heading{
  margin:0 0 26px !important;
  max-width:720px !important;
}

.upload-eyebrow{
  margin-bottom:10px;
}

.upload-lesson-heading h2{
  margin:0 !important;
  color:var(--ink) !important;
  font-size:clamp(32px, 3.4vw, 42px) !important;
  font-weight:760 !important;
  letter-spacing:-.045em !important;
  line-height:1.08 !important;
}

.upload-lesson-heading p{
  margin:14px 0 0 !important;
  max-width:680px;
  color:var(--ink-soft) !important;
  font-size:16px !important;
  line-height:1.5 !important;
}

.upload-direct-grid{
  display:grid;
  grid-template-columns:repeat(2, minmax(0, 1fr));
  gap:14px;
}

.upload-direct-card{
  min-height:260px !important;
  display:flex !important;
  flex-direction:column !important;
  padding:20px !important;
  border:1.5px solid rgba(13,24,51,.14) !important;
  border-radius:18px !important;
  background:transparent !important;
  box-shadow:none !important;
  text-align:left !important;
  transition:border-color .16s ease, background .16s ease;
}

.upload-direct-card:hover,
.upload-direct-card.selected,
.upload-direct-card:focus-within{
  border-color:var(--accent) !important;
  background:rgba(53,109,255,.04) !important;
}

.upload-direct-top{
  display:flex;
  gap:14px;
  align-items:flex-start;
  margin-bottom:16px;
}

.upload-direct-top .source-icon{
  width:44px;
  height:44px;
  flex:0 0 auto;
  display:grid;
  place-items:center;
  border:1px solid rgba(53,109,255,.12);
  border-radius:14px;
  color:var(--accent);
  background:rgba(53,109,255,.07);
}

.upload-direct-top strong{
  display:block;
  color:var(--ink);
  font-size:17px;
  font-weight:760;
  line-height:1.28;
}

.upload-direct-top span:not(.source-icon){
  display:block;
  margin-top:5px;
  color:var(--ink-soft);
  font-size:13px;
  line-height:1.42;
}

.compact-upload-area{
  flex:1;
  min-height:116px !important;
  display:grid;
  place-items:center;
  padding:16px !important;
  border:1px dashed rgba(13,24,51,.20) !important;
  border-radius:16px !important;
  background:rgba(255,255,255,.22) !important;
  cursor:pointer;
}

.compact-upload-area:hover,
.compact-upload-area.is-dragging{
  border-color:var(--accent) !important;
  background:rgba(53,109,255,.05) !important;
}

.compact-upload-area .file-upload-empty,
.compact-upload-area .file-upload-selected{
  display:grid;
  justify-items:center;
  gap:6px;
  text-align:center;
}

.compact-upload-area .file-upload-empty strong,
.compact-upload-area .file-upload-selected strong{
  color:var(--ink);
  font-size:14px;
}

.compact-upload-area .file-upload-empty span,
.compact-upload-area .file-upload-selected span{
  color:var(--ink-soft);
  font-size:12.5px;
}

.compact-upload-area .file-upload-browse{
  min-height:36px;
  margin-top:6px;
  padding:0 16px;
  border:1px solid rgba(53,109,255,.34);
  border-radius:999px;
  color:var(--accent);
  background:transparent;
  font-weight:700;
  cursor:pointer;
}

.file-upload-status{
  min-height:20px;
  margin:10px 0 0 !important;
  color:var(--ink-mute) !important;
  font-size:12.5px !important;
}

.file-upload-status.is-error{ color:#b42318 !important; }
.file-upload-status.is-success{ color:#166534 !important; }

.file-upload-actions{
  display:flex;
  gap:10px;
  margin-top:8px;
}

.file-upload-actions button{
  padding:0;
  border:0;
  background:transparent;
  color:var(--accent);
  font:inherit;
  font-size:12.5px;
  font-weight:700;
  cursor:pointer;
}

.compact-sheet-field{
  display:grid !important;
  gap:9px !important;
  margin-top:6px;
}

.compact-sheet-field > span:first-child{
  color:var(--ink);
  font-size:13px;
  font-weight:760;
}

.compact-sheet-field .data-source-sheet-input-wrap{
  min-height:52px;
  border:1.5px solid rgba(13,24,51,.14);
  border-radius:16px;
  background:rgba(255,255,255,.22);
}

.compact-sheet-field .data-source-sheet-input-wrap:focus-within{
  border-color:var(--accent);
  background:rgba(53,109,255,.04);
}

.compact-sheet-field input{
  height:50px !important;
  font-size:14px !important;
}

.compact-sheet-field small{
  color:var(--ink-mute);
  font-size:12.5px;
}

.upload-sheet-card .data-source-sheet-status{
  margin:12px 0 0 !important;
  font-size:12.5px !important;
}

.upload-direct-manual{
  align-self:center;
  margin:22px 0 0 !important;
  padding:0 !important;
  border:0 !important;
  background:transparent !important;
  color:var(--accent) !important;
  font-size:13.5px !important;
  font-weight:650 !important;
  text-decoration:none !important;
}

.upload-direct-manual:hover{
  text-decoration:underline !important;
  text-underline-offset:3px;
}

.upload-lesson-footer{
  height:82px !important;
  flex:0 0 82px !important;
  display:flex !important;
  justify-content:flex-end !important;
  align-items:center !important;
  padding:17px 56px !important;
  border-top:1px solid rgba(13,24,51,.10) !important;
}

.upload-lesson-footer .data-source-previous{
  display:none !important;
}

.upload-lesson-footer .data-source-continue{
  min-width:148px !important;
  min-height:48px !important;
  padding:0 22px !important;
  border:1px solid var(--accent) !important;
  border-radius:16px !important;
  background:var(--accent) !important;
  color:#fff !important;
  box-shadow:none !important;
  font-weight:740 !important;
}

.upload-lesson-footer .data-source-continue:disabled{
  border-color:rgba(13,24,51,.10) !important;
  background:rgba(13,24,51,.06) !important;
  color:var(--ink-mute) !important;
}

.upload-lesson-footer .data-source-continue:not(:disabled):hover{
  background:var(--accent-strong) !important;
  border-color:var(--accent-strong) !important;
}

@media(max-height:820px) and (min-width:761px){
  .upload-lesson-flow{
    height:min(660px, calc(100svh - 48px)) !important;
    min-height:620px !important;
  }
  .upload-lesson-step{ padding-top:28px; padding-bottom:22px; }
  .upload-direct-card{ min-height:238px !important; }
}

@media(max-width:760px){
  body.upload-view-active .stage{ padding:24px 14px; }
  .upload-lesson-flow{
    width:calc(100vw - 28px) !important;
    height:min(720px, calc(100svh - 48px)) !important;
    min-height:640px !important;
  }
  .upload-lesson-close{ top:18px !important; right:18px !important; }
  .upload-lesson-progress{ padding-left:18px; padding-right:64px; }
  .upload-lesson-step{ padding:30px 22px 24px; justify-content:flex-start; overflow:auto; }
  .upload-direct-grid{ grid-template-columns:1fr; }
  .upload-direct-card{ min-height:auto !important; }
  .upload-lesson-footer{ height:auto !important; min-height:86px !important; flex-basis:auto !important; padding:14px 18px !important; }
  .upload-lesson-footer .data-source-continue{ width:100%; }
}
/* End unified upload data lesson flow */`;

function stripBlock(input, start, end) {
  const s = input.indexOf(start);
  if (s === -1) return input;
  const e = input.indexOf(end, s);
  return e === -1 ? input.slice(0, s).trimEnd() + '\n' : (input.slice(0, s) + input.slice(e + end.length)).trimEnd() + '\n';
}

function patchIndex(html) {
  return html.replace(/    <section class="data-options[\s\S]*?    <section class="reading-view"/, `${uploadMarkup}\n\n    <section class="reading-view"`);
}

function patchStyle(css) {
  css = stripBlock(css, '/* Unified upload data lesson flow */', '/* End unified upload data lesson flow */');
  return css.trimEnd() + '\n\n' + uploadCss + '\n';
}

function patchScript(script) {
  let out = script;
  out = out.replace(
    "if (dataSourceContinue && currentView === 'sheetConnect') {",
    "if (dataSourceContinue && ['dataSource', 'sheetConnect'].includes(currentView)) {",
  );
  out = out.replace(
    "if (dataSourceContinue && currentView === 'fileUpload') {",
    "if (dataSourceContinue && ['dataSource', 'fileUpload'].includes(currentView)) {",
  );
  out = out.replace(
    "selectedSalesFile = { file, text: result.text };\n    renderSelectedSalesFile();",
    "selectedSalesFile = { file, text: result.text };\n    selectDataSource('file');\n    renderDataSourceStep('source');\n    renderSelectedSalesFile();",
  );
  out = out.replace(
    "function renderDataSourceStep(step) {\n    const sourceStep = step === 'source';\n    const fileStep = step === 'file';\n    dataSourceChoiceStep.hidden = !sourceStep;\n    dataSourceFileStep.hidden = !fileStep;\n    dataSourceSheetStep.hidden = sourceStep || fileStep;\n    const stepNumber = sourceStep ? 1 : 2;\n    if (dataSourceStepLabel) dataSourceStepLabel.textContent = `Step ${stepNumber} of 3`;\n    if (dataSourceProgress) {\n      dataSourceProgress.setAttribute('aria-label', `Progress: step ${stepNumber} of 3`);\n      dataSourceProgress.querySelectorAll('span').forEach((dot, index) => dot.classList.toggle('is-active', index < stepNumber));\n    }\n    if (dataSourcePrevious) dataSourcePrevious.textContent = sourceStep ? 'Previous' : 'Back';\n    if (dataSourceContinue) {\n      dataSourceContinue.textContent = sourceStep ? 'Continue' : 'Continue';\n      dataSourceContinue.disabled = sourceStep\n        ? !selectedDataSource\n        : fileStep\n          ? !selectedSalesFile || fileReadInFlight\n          : sheetConnection.status !== 'valid' || sheetReadInFlight;\n    }\n    if (fileStep) renderSelectedSalesFile();\n    if (!sourceStep && !fileStep) setSheetConnectionState(sheetConnection.status, sheetConnection.message);\n  }",
    "function renderDataSourceStep(_step) {\n    if (dataSourceChoiceStep) dataSourceChoiceStep.hidden = false;\n    if (dataSourceFileStep) dataSourceFileStep.hidden = true;\n    if (dataSourceSheetStep) dataSourceSheetStep.hidden = true;\n    if (dataSourceStepLabel) dataSourceStepLabel.textContent = 'Add data';\n    if (dataSourceProgress) {\n      dataSourceProgress.setAttribute('aria-label', 'Add your sales data');\n      dataSourceProgress.querySelectorAll('span').forEach((dot, index) => dot.classList.toggle('is-active', index === 0));\n    }\n    if (dataSourcePrevious) dataSourcePrevious.hidden = true;\n    if (dataSourceContinue) {\n      const hasFile = Boolean(selectedSalesFile) && !fileReadInFlight;\n      const hasSheet = sheetConnection.status === 'valid' && !sheetReadInFlight;\n      dataSourceContinue.textContent = fileReadInFlight || sheetReadInFlight ? 'Reading…' : 'Read data';\n      dataSourceContinue.disabled = !(hasFile || hasSheet);\n    }\n    renderSelectedSalesFile();\n    setSheetConnectionState(sheetConnection.status, sheetConnection.message);\n  }",
  );
  out = out.replace(
    "function previousDataSourceStep() {\n    if (currentView === 'dataSource') {\n      clearDataSourceSelection();\n      resetToLanding();\n      return;\n    }\n    setCurrentView('dataSource');\n    renderDataSourceStep('source');\n  }",
    "function previousDataSourceStep() {\n    clearDataSourceSelection();\n    resetToLanding();\n  }",
  );
  out = out.replace(
    "function continueDataSourceFlow() {\n    if (currentView === 'dataSource') {\n      if (!selectedDataSource) return;\n      if (selectedDataSource === 'file') {\n        setCurrentView('fileUpload');\n        renderDataSourceStep('file');\n      } else {\n        setCurrentView('sheetConnect');\n        renderDataSourceStep('sheet');\n        window.setTimeout(() => uploadSheetUrlInput?.focus(), 0);\n      }\n      return;\n    }\n\n    if (currentView === 'fileUpload') {\n      startSelectedSalesFileRead();\n      return;\n    }\n\n    if (currentView === 'sheetConnect') {\n      if (sheetConnection.status !== 'valid' || sheetReadInFlight) {\n        validateSheetLink();\n        uploadSheetUrlInput?.focus();\n        return;\n      }\n      startSheetConnectionRead();\n    }\n  }",
    "function continueDataSourceFlow() {\n    if (selectedSalesFile) {\n      selectDataSource('file');\n      startSelectedSalesFileRead();\n      return;\n    }\n    if (sheetConnection.status === 'valid') {\n      selectDataSource('googleSheet');\n      startSheetConnectionRead();\n      return;\n    }\n    validateSheetLink();\n    uploadSheetUrlInput?.focus();\n  }",
  );
  out = out.replace(
    "if (uploadSheetUrlInput) {\n    uploadSheetUrlInput.addEventListener('input', () => scheduleSheetLinkValidation());",
    "if (uploadSheetUrlInput) {\n    uploadSheetUrlInput.addEventListener('input', () => { selectDataSource('googleSheet'); clearSelectedSalesFile(); scheduleSheetLinkValidation(); renderDataSourceStep('source'); });",
  );
  out = out.replace(
    "if (fileUploadRemove) fileUploadRemove.addEventListener('click', clearSelectedSalesFile);",
    "if (fileUploadRemove) fileUploadRemove.addEventListener('click', () => { clearSelectedSalesFile(); renderDataSourceStep('source'); });",
  );
  return out;
}

fs.writeFileSync(indexPath, patchIndex(fs.readFileSync(indexPath, 'utf8')));
fs.writeFileSync(stylePath, patchStyle(fs.readFileSync(stylePath, 'utf8')));
fs.writeFileSync(scriptPath, patchScript(fs.readFileSync(scriptPath, 'utf8')));
