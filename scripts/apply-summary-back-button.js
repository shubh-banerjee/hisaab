const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const indexPath = path.join(root, 'public', 'index.html');
const scriptPath = path.join(root, 'public', 'script.js');
const cssPath = path.join(root, 'public', 'style.css');

function read(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

function writeIfChanged(filePath, before, after, label) {
  if (before !== after) {
    fs.writeFileSync(filePath, after, 'utf8');
    console.log(`[summary-back-button] ${label}`);
  }
}

function replaceOnce(source, before, after, label) {
  if (source.includes(after)) return source;
  if (!source.includes(before)) {
    throw new Error(`Could not find marker: ${label}`);
  }
  return source.replace(before, after);
}

function patchIndex() {
  const before = read(indexPath);
  let source = before;
  source = replaceOnce(source,
`        <div class="dc-cta-row">
          <button class="dc-ask-cta" id="dc-ask-cta-btn" type="button">Ask Hisaab</button>
        </div>`,
`        <div class="dc-cta-row dc-summary-actions">
          <button class="dc-btn-outline" id="dc-summary-back-btn" type="button">Back</button>
          <button class="dc-ask-cta" id="dc-ask-cta-btn" type="button">Ask Hisaab</button>
        </div>`,
    'summary back button'
  );
  writeIfChanged(indexPath, before, source, 'patched public/index.html');
}

function patchScript() {
  const before = read(scriptPath);
  let source = before;
  source = replaceOnce(source,
`    const askCtaBtn = document.getElementById('dc-ask-cta-btn');
    if (askCtaBtn) askCtaBtn.addEventListener('click', () => {`,
`    const summaryBackBtn = document.getElementById('dc-summary-back-btn');
    if (summaryBackBtn) summaryBackBtn.addEventListener('click', () => {
      dcHideError();
      hideValidationNudge();
      hideGuidanceMessage();
      setDcScreen('upload');
      updateDcReadButtonState();
      updateDcLinkStatus();
      const focusTarget = uploadedCsv ? document.getElementById('csv-upload-link') : sheetUrlInput;
      if (focusTarget && typeof focusTarget.focus === 'function') focusTarget.focus();
    });

    const askCtaBtn = document.getElementById('dc-ask-cta-btn');
    if (askCtaBtn) askCtaBtn.addEventListener('click', () => {`,
    'wire summary back button'
  );
  writeIfChanged(scriptPath, before, source, 'patched public/script.js');
}

function patchCss() {
  const before = read(cssPath);
  let source = before;
  if (!source.includes('summary-back-button-v1')) {
    source += `

/* summary-back-button-v1 */
.dc-summary-actions{
  justify-content:space-between;
  align-items:center;
  gap:12px;
}
.dc-summary-actions .dc-btn-outline{
  min-width:96px;
}
.dc-summary-actions .dc-ask-cta{
  min-width:124px;
}
@media (max-width: 720px){
  .dc-summary-actions{
    flex-direction:column-reverse;
    align-items:stretch;
  }
  .dc-summary-actions .dc-btn-outline,
  .dc-summary-actions .dc-ask-cta{
    width:100%;
  }
}
`;
  }
  writeIfChanged(cssPath, before, source, 'patched public/style.css');
}

patchIndex();
patchScript();
patchCss();
