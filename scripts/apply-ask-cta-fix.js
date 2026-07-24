const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const scriptPath = path.join(root, 'public', 'script.js');
const cssPath = path.join(root, 'public', 'style.css');

function patchScript() {
  if (!fs.existsSync(scriptPath)) return;
  let source = fs.readFileSync(scriptPath, 'utf8');

  const marker = 'const isDcAskSubmit = !isRefine && simulateBtn.classList.contains';
  if (source.includes(marker)) return;

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

  if (!source.includes(current)) {
    throw new Error('[apply-ask-cta-fix] setLoading source block not found; refusing to guess.');
  }

  source = source.replace(current, replacement);
  fs.writeFileSync(scriptPath, source, 'utf8');
  console.log('[apply-ask-cta-fix] Patched public/script.js setLoading');
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

patchScript();
patchCss();
