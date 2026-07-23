const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const scriptPath = path.join(root, 'public', 'script.js');

let source = fs.readFileSync(scriptPath, 'utf8');

const styleMarker = '// ── Data-connect ask submit fix styles ──';
const stylePatch = `
  ${styleMarker}
  (function injectDataConnectAskSubmitFixStyles() {
    if (typeof document === 'undefined' || document.getElementById('dc-ask-submit-fix-style')) return;
    const style = document.createElement('style');
    style.id = 'dc-ask-submit-fix-style';
    style.textContent = ` + JSON.stringify(`
      #simulate-btn.dc-ask-cta{
        min-width:132px !important;
        min-height:42px !important;
        display:inline-flex !important;
        align-items:center !important;
        justify-content:center !important;
        gap:8px !important;
        flex-shrink:0 !important;
        white-space:nowrap !important;
      }
      #simulate-btn.dc-ask-cta .btn-text{
        width:auto !important;
        height:auto !important;
        display:inline-flex !important;
        align-items:center !important;
        justify-content:center !important;
      }
      #simulate-btn.dc-ask-cta .btn-text[hidden],
      #simulate-btn.dc-ask-cta .btn-loader[hidden]{
        display:none !important;
      }
      #simulate-btn.dc-ask-cta .btn-loader{
        width:18px !important;
        height:18px !important;
        align-items:center !important;
        justify-content:center !important;
      }
      .dc-validation-nudge:not([hidden]){
        display:block !important;
      }
    `) + `;
    document.head.appendChild(style);
  })();
`;

if (!source.includes(styleMarker)) {
  source = source.replace('(function () {\n', `(function () {\n${stylePatch}`);
}

const validationOld = `    if (!options.skipValidation && !isSpecificQuestion(question)) {`;
const validationNew = `    const dataConnectAskOpen = Boolean(document.getElementById('data-connect-page') && !document.getElementById('data-connect-page').hidden && document.getElementById('dc-screen-ask') && !document.getElementById('dc-screen-ask').hidden);
    if (!options.skipValidation && !dataConnectAskOpen && !isSpecificQuestion(question)) {`;
if (source.includes(validationOld) && !source.includes('const dataConnectAskOpen = Boolean(document.getElementById')) {
  source = source.replace(validationOld, validationNew);
}

const loadingOld = `    text.hidden = isLoading;
    loader.hidden = !isLoading;`;
const loadingNew = `    text.hidden = isLoading;
    loader.hidden = !isLoading;
    if (!isRefine && simulateBtn) {
      simulateBtn.classList.toggle('is-loading', isLoading);
      simulateBtn.setAttribute('aria-busy', isLoading ? 'true' : 'false');
    }`;
if (source.includes(loadingOld) && !source.includes("simulateBtn.setAttribute('aria-busy'")) {
  source = source.replace(loadingOld, loadingNew);
}

fs.writeFileSync(scriptPath, source, 'utf8');
