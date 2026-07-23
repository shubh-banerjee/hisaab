const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const scriptPath = path.join(root, 'public', 'script.js');

let source = fs.readFileSync(scriptPath, 'utf8');

function replaceOnce(label, find, replacement) {
  if (source.includes(replacement)) return;
  if (!source.includes(find)) {
    console.warn(`[build-fix] skipped ${label}: expected source not found`);
    return;
  }
  source = source.replace(find, replacement);
}

const styleMarker = '// ── Data-connect ask submit fix styles ──';
const stylePatch = `
  ${styleMarker}
  (function injectDataConnectAskSubmitFixStyles() {
    if (typeof document === 'undefined' || document.getElementById('dc-ask-submit-fix-style')) return;
    const style = document.createElement('style');
    style.id = 'dc-ask-submit-fix-style';
    style.textContent = ${JSON.stringify(`
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
    `)};
    document.head.appendChild(style);
  })();
`;

if (!source.includes(styleMarker)) {
  source = source.replace('(function () {\n', `(function () {\n${stylePatch}`);
}

replaceOnce(
  'post-upload ask validation gate',
  `    if (!options.skipValidation && !isSpecificQuestion(question)) {`,
  `    const dataConnectAskOpen = Boolean(document.getElementById('data-connect-page') && !document.getElementById('data-connect-page').hidden && document.getElementById('dc-screen-ask') && !document.getElementById('dc-screen-ask').hidden);
    if (!options.skipValidation && !dataConnectAskOpen && !isSpecificQuestion(question)) {`,
);

// Root-cause fix: the redesigned flow removed the old #composer element from
// the active Ask Hisaab screen, but setLoading() still tried to toggle a class
// on composer. That threw before /api/simulate could run, leaving the button in
// a half-loading state. The loading shell now falls back to #ask-block.
replaceOnce(
  'loading shell fallback',
  `    text.hidden = isLoading;
    loader.hidden = !isLoading;
    (isRefine ? refineInline : composer).classList.toggle('loading', isLoading);
    (isRefine ? refineLoadingStatus : loadingStatus).hidden = !isLoading;`,
  `    if (!isRefine && simulateBtn && simulateBtn.classList.contains('dc-ask-cta')) {
      text.hidden = false;
      text.textContent = isLoading ? 'Checking…' : 'Ask Hisaab';
      loader.hidden = !isLoading;
    } else {
      text.hidden = isLoading;
      loader.hidden = !isLoading;
    }
    if (!isRefine && simulateBtn) {
      simulateBtn.classList.toggle('is-loading', isLoading);
      simulateBtn.setAttribute('aria-busy', isLoading ? 'true' : 'false');
    }
    const loadingShell = isRefine ? refineInline : (document.getElementById('ask-block') || composer || simulateBtn);
    if (loadingShell) loadingShell.classList.toggle('loading', isLoading);
    (isRefine ? refineLoadingStatus : loadingStatus).hidden = !isLoading;`,
);

// Same underlying migration issue: a few helper paths still used composer as a
// required DOM anchor. Make those paths safe so future error/refresh/reset flows
// do not crash when the overlay-based Ask screen is active.
replaceOnce(
  'data panel column fallback',
  `    const columnEl = isInline ? resultsSection : composer;
    const columnRect = columnEl.getBoundingClientRect();`,
  `    const columnEl = isInline ? resultsSection : (composer || document.getElementById('ask-block') || document.querySelector('.data-connect-frame') || stage);
    const columnRect = columnEl.getBoundingClientRect();`,
);

replaceOnce(
  'restore data connector anchor fallback',
  `  function restoreDataConnectorToHome() {
    if (dataDetected.parentElement !== stage) stage.insertBefore(dataDetected, composer);
    if (sheetSlot.parentElement !== stage) stage.insertBefore(sheetSlot, dataDetected);
    if (missingSection.parentElement !== stage) stage.insertBefore(missingSection, errorBanner);
  }`,
  `  function restoreDataConnectorToHome() {
    const homeAnchor = composer || errorBanner || resultsSection || null;
    if (dataDetected.parentElement !== stage) stage.insertBefore(dataDetected, homeAnchor);
    if (sheetSlot.parentElement !== stage) stage.insertBefore(sheetSlot, dataDetected);
    if (missingSection.parentElement !== stage) stage.insertBefore(missingSection, errorBanner || null);
  }`,
);

replaceOnce(
  'visible ask submit errors',
  `    } catch (err) {
      dataDetected.classList.add('show');
      detectedHeadline.textContent = 'I could not update this analysis yet.';
      detectedBody.textContent = err.message;
    } finally {`,
  `    } catch (err) {
      const askOverlayOpen = Boolean(document.getElementById('data-connect-page') && !document.getElementById('data-connect-page').hidden && document.getElementById('dc-screen-ask') && !document.getElementById('dc-screen-ask').hidden);
      if (askOverlayOpen) {
        showError(err.message);
      } else {
        dataDetected.classList.add('show');
        detectedHeadline.textContent = 'I could not update this analysis yet.';
        detectedBody.textContent = err.message;
      }
    } finally {`,
);

fs.writeFileSync(scriptPath, source, 'utf8');
