(() => {
  const styleId = 'upload-data-runtime-style';
  const style = `
body.upload-view-active .brand,
body.upload-view-active .top-actions,
body.upload-view-active .landing-intro,
body.reading-view-active .brand,
body.reading-view-active .top-actions,
body.reading-view-active .landing-intro{
  display:none !important;
}

body.upload-view-active .stage,
body.reading-view-active .stage{
  min-height:100svh !important;
  display:flex !important;
  align-items:center !important;
  justify-content:center !important;
  padding:48px 24px !important;
}

.data-options.upload-runtime-flow,
.data-options.upload-lesson-flow{
  position:relative !important;
  width:min(860px, calc(100vw - 72px)) !important;
  min-height:auto !important;
  height:auto !important;
  margin:0 auto !important;
  padding:0 !important;
  overflow:visible !important;
  border:0 !important;
  border-radius:0 !important;
  background:transparent !important;
  box-shadow:none !important;
  backdrop-filter:none !important;
}

.data-options.upload-runtime-flow[hidden],
.data-options.upload-lesson-flow[hidden]{ display:none !important; }

.upload-lesson-close,
.data-options.upload-runtime-flow .data-source-exit{
  position:absolute !important;
  top:18px !important;
  right:18px !important;
  left:auto !important;
  z-index:50 !important;
  width:34px !important;
  height:34px !important;
  display:grid !important;
  place-items:center !important;
  padding:0 !important;
  border:0 !important;
  border-radius:0 !important;
  background:transparent !important;
  color:var(--ink-mute) !important;
  box-shadow:none !important;
  outline:0 !important;
  cursor:pointer !important;
}

.upload-lesson-close:hover,
.upload-lesson-close:focus-visible,
.data-options.upload-runtime-flow .data-source-exit:hover,
.data-options.upload-runtime-flow .data-source-exit:focus-visible{
  color:var(--ink) !important;
  background:transparent !important;
  border:0 !important;
  box-shadow:none !important;
  outline:0 !important;
}

.upload-lesson-progress,
.data-source-nav,
.upload-progress-dots,
.upload-step-label,
.data-source-progress,
.data-source-step-label,
.upload-direct-grid,
.data-source-cards,
#data-source-file-step,
#data-source-sheet-step,
.data-source-previous{
  display:none !important;
}

.data-options.upload-runtime-flow #data-source-choice-step,
.data-options.upload-lesson-flow #data-source-choice-step{
  display:block !important;
  min-height:0 !important;
  padding:0 !important;
  overflow:visible !important;
}

.upload-single-card{
  position:relative;
  width:100%;
  padding:34px 36px 30px;
  border:1px solid rgba(13,24,51,.11);
  border-radius:24px;
  background:rgba(255,255,255,.72);
  box-shadow:0 22px 80px rgba(13,24,51,.08);
}

.upload-single-copy{
  margin:0 48px 18px 0;
  color:var(--ink-soft);
  font-size:16px;
  line-height:1.5;
}

.upload-single-input-row{
  display:flex;
  align-items:center;
  gap:12px;
  min-height:58px;
  padding:0 16px;
  border:1.5px solid rgba(53,109,255,.42);
  border-radius:16px;
  background:rgba(53,109,255,.06);
  transition:border-color .16s ease, background .16s ease;
}

.upload-single-input-row:focus-within{
  border-color:var(--accent);
  background:#fff;
}

.upload-single-icon{
  width:26px;
  height:26px;
  flex:0 0 auto;
  display:grid;
  place-items:center;
  color:var(--accent);
}

.upload-single-input-row input{
  width:100% !important;
  min-width:0 !important;
  height:56px !important;
  padding:0 !important;
  border:0 !important;
  background:transparent !important;
  color:var(--ink) !important;
  font-size:16px !important;
  outline:0 !important;
}

.upload-single-input-row input::placeholder{ color:rgba(13,24,51,.42) !important; }

.upload-single-clear{
  flex:0 0 auto;
  width:28px;
  height:28px;
  display:grid;
  place-items:center;
  border:0;
  background:transparent;
  color:var(--ink-mute);
  font-size:22px;
  line-height:1;
  cursor:pointer;
}

.upload-single-clear:hover{ color:var(--ink); }

.upload-single-feedback{
  min-height:22px;
  margin:10px 0 0;
  color:var(--ink-mute);
  font-size:13px;
  line-height:1.35;
}

.upload-single-feedback.is-valid{ color:#16794c; }
.upload-single-feedback.is-invalid{ color:#b42318; }
.upload-single-feedback.is-checking{ color:var(--accent); }

.upload-single-or{
  display:flex;
  align-items:center;
  gap:12px;
  margin:18px 0 0;
  color:var(--ink-mute);
  font-size:15px;
}

.upload-single-or span:first-child{
  color:var(--ink-mute);
}

.upload-single-file-link{
  display:inline-flex !important;
  align-items:center;
  justify-content:center;
  min-height:36px;
  padding:0 !important;
  border:0 !important;
  border-radius:0 !important;
  background:transparent !important;
  color:var(--accent) !important;
  font:inherit !important;
  font-weight:760 !important;
  cursor:pointer !important;
}

.upload-single-file-link:hover{ text-decoration:underline; text-underline-offset:3px; }

.upload-single-file-state{
  margin:10px 0 0;
  color:var(--ink-mute);
  font-size:13px;
}

.upload-single-file-state.is-ready{ color:#16794c; }

.upload-single-manual,
.upload-direct-manual,
.upload-manual-link{
  display:block !important;
  width:max-content !important;
  max-width:100% !important;
  margin:20px auto 0 !important;
  padding:0 !important;
  border:0 !important;
  background:transparent !important;
  color:var(--accent) !important;
  font-size:13.5px !important;
  font-weight:700 !important;
  text-decoration:none !important;
  cursor:pointer !important;
}

.upload-single-manual:hover,
.upload-direct-manual:hover,
.upload-manual-link:hover{ text-decoration:underline !important; text-underline-offset:3px !important; }

.upload-lesson-footer,
.data-source-footer{
  display:flex !important;
  justify-content:flex-end !important;
  align-items:center !important;
  height:auto !important;
  min-height:0 !important;
  flex:0 0 auto !important;
  padding:20px 0 0 !important;
  border:0 !important;
}

.data-source-continue{
  min-width:148px !important;
  min-height:46px !important;
  padding:0 22px !important;
  border:1px solid var(--accent) !important;
  border-radius:14px !important;
  background:var(--accent) !important;
  color:#fff !important;
  font-weight:740 !important;
  box-shadow:none !important;
}

.data-source-continue:disabled{
  border-color:rgba(13,24,51,.10) !important;
  background:rgba(13,24,51,.07) !important;
  color:var(--ink-mute) !important;
}

/* Reading screen cleanup */
body.reading-view-active #reading-view{
  display:grid !important;
  place-items:center !important;
  width:100% !important;
  min-height:100svh !important;
}

body.reading-view-active .reading-stage{
  position:relative !important;
  width:min(540px, calc(100vw - 48px)) !important;
  min-height:360px !important;
  display:grid !important;
  place-items:center !important;
  padding:44px 42px !important;
  border:1px solid rgba(13,24,51,.10) !important;
  border-radius:24px !important;
  background:rgba(255,255,255,.78) !important;
  box-shadow:0 22px 80px rgba(13,24,51,.08) !important;
}

body.reading-view-active .reading-exit{
  position:absolute !important;
  top:20px !important;
  right:22px !important;
  left:auto !important;
  width:32px !important;
  height:32px !important;
  display:grid !important;
  place-items:center !important;
  border:0 !important;
  background:transparent !important;
  color:var(--ink-mute) !important;
  box-shadow:none !important;
}

body.reading-view-active .reading-exit:hover{ color:var(--ink) !important; }

body.reading-view-active .reading-content{
  width:100% !important;
  max-width:360px !important;
  display:grid !important;
  justify-items:center !important;
  text-align:center !important;
  gap:0 !important;
  margin:0 !important;
  padding:0 !important;
}

body.reading-view-active .reading-wordmark{
  margin:0 0 20px !important;
  color:var(--ink) !important;
  font-size:18px !important;
  font-weight:760 !important;
  letter-spacing:-.04em !important;
}

body.reading-view-active .reading-period{ color:var(--accent) !important; }

body.reading-view-active .reading-content h2{
  margin:0 !important;
  color:var(--ink) !important;
  font-size:26px !important;
  line-height:1.15 !important;
  letter-spacing:-.04em !important;
}

body.reading-view-active .reading-content > p{
  margin:10px 0 0 !important;
  color:var(--ink-soft) !important;
  font-size:14px !important;
  line-height:1.45 !important;
}

body.reading-view-active .reading-progress{
  display:flex !important;
  align-items:center !important;
  justify-content:center !important;
  gap:10px !important;
  margin:28px 0 0 !important;
  color:var(--ink) !important;
}

body.reading-view-active .reading-step-mark{
  width:16px !important;
  height:16px !important;
  border:2px solid rgba(53,109,255,.22) !important;
  border-top-color:var(--accent) !important;
  border-radius:50% !important;
  animation:readingSpin .8s linear infinite !important;
}

body.reading-view-active .reading-step{
  margin:0 !important;
  color:var(--ink) !important;
  font-size:14px !important;
  font-weight:700 !important;
  line-height:1.3 !important;
}

body.reading-view-active .reading-progress-label{
  margin:10px 0 0 !important;
  color:var(--ink-mute) !important;
  font-size:12px !important;
}

body.reading-view-active .reading-long-message{
  margin-top:12px !important;
  font-size:13px !important;
}

@keyframes readingSpin{ to{ transform:rotate(360deg); } }

@media(max-width:760px){
  body.upload-view-active .stage,
  body.reading-view-active .stage{ padding:24px 14px !important; }
  .data-options.upload-runtime-flow,
  .data-options.upload-lesson-flow{ width:calc(100vw - 28px) !important; }
  .upload-single-card{ padding:30px 22px 24px; border-radius:22px; }
  .upload-single-copy{ margin-right:42px; font-size:15px; }
  .upload-single-input-row{ min-height:54px; }
  .upload-single-input-row input{ height:52px !important; font-size:15px !important; }
  .data-source-continue{ width:100% !important; }
  body.reading-view-active .reading-stage{ width:calc(100vw - 28px) !important; min-height:340px !important; padding:40px 24px !important; }
}`;

  function injectStyle() {
    const existing = document.getElementById(styleId);
    if (existing) {
      if (existing.textContent !== style) existing.textContent = style;
      return;
    }
    const tag = document.createElement('style');
    tag.id = styleId;
    tag.textContent = style;
    document.head.appendChild(tag);
  }

  function sheetIcon() {
    return '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M8 4v16"/></svg>';
  }

  function ensureSingleUploadCard() {
    const dataOptions = document.getElementById('data-options');
    const choiceStep = document.getElementById('data-source-choice-step');
    const sheetField = document.querySelector('.data-source-sheet-field');
    const sheetInput = document.getElementById('upload-sheet-url');
    const sheetStatus = document.getElementById('sheet-link-status');
    const fileArea = document.getElementById('file-upload-area');
    const fileStatus = document.getElementById('file-upload-status');
    const fileActions = document.getElementById('file-upload-actions');
    const fileBrowse = document.getElementById('file-upload-browse');
    const oldFileCard = document.getElementById('data-source-file');
    const oldSheetCard = document.getElementById('data-source-sheet');
    const continueBtn = document.getElementById('data-source-continue');
    const previousBtn = document.getElementById('data-source-previous');
    const manual = document.getElementById('path-bootstrap');

    if (!dataOptions || !choiceStep || !sheetField || !sheetInput || !fileArea) return;

    dataOptions.classList.add('upload-runtime-flow');
    if (previousBtn) previousBtn.hidden = true;
    if (continueBtn && continueBtn.textContent !== 'Reading…') continueBtn.textContent = 'Read data';

    let card = choiceStep.querySelector('.upload-single-card');
    if (!card) {
      card = document.createElement('div');
      card.className = 'upload-single-card';
      card.innerHTML = `
        <p class="upload-single-copy">Paste a public Google Sheets link. Hisaab reads whatever columns exist.</p>
        <div class="upload-single-input-row">
          <span class="upload-single-icon">${sheetIcon()}</span>
          <div class="upload-single-sheet-slot"></div>
          <button class="upload-single-clear" type="button" aria-label="Clear Google Sheet link">×</button>
        </div>
        <p class="upload-single-feedback" role="status" aria-live="polite">Set sharing to “Anyone with the link can view”.</p>
        <div class="upload-single-or"><span>or</span><button class="upload-single-file-link" type="button">upload a CSV file</button></div>
        <p class="upload-single-file-state"></p>
        <div class="upload-single-file-area-slot" hidden></div>
        <div class="upload-single-file-actions-slot"></div>
      `;
      choiceStep.prepend(card);
    }

    const sheetSlot = card.querySelector('.upload-single-sheet-slot');
    const fileAreaSlot = card.querySelector('.upload-single-file-area-slot');
    const fileActionsSlot = card.querySelector('.upload-single-file-actions-slot');
    const feedback = card.querySelector('.upload-single-feedback');
    const fileState = card.querySelector('.upload-single-file-state');
    const fileLink = card.querySelector('.upload-single-file-link');
    const clear = card.querySelector('.upload-single-clear');

    if (sheetSlot && !sheetSlot.contains(sheetInput)) sheetSlot.append(sheetInput);
    sheetField.hidden = true;
    sheetField.style.display = 'contents';
    if (sheetStatus) sheetStatus.hidden = true;
    if (fileAreaSlot && !fileAreaSlot.contains(fileArea)) fileAreaSlot.append(fileArea);
    if (fileActionsSlot && fileActions && !fileActionsSlot.contains(fileActions)) fileActionsSlot.append(fileActions);
    if (manual && manual.parentElement !== choiceStep) choiceStep.append(manual);
    manual?.classList.add('upload-single-manual');

    const selectedFile = Boolean(document.getElementById('file-upload-name')?.textContent?.trim());
    const sheetValue = sheetInput.value.trim();
    const sheetValid = sheetStatus?.classList.contains('is-valid');
    const sheetInvalid = sheetStatus?.classList.contains('is-invalid');
    const sheetChecking = sheetStatus?.classList.contains('is-checking') || sheetStatus?.classList.contains('is-loading');

    if (feedback) {
      feedback.classList.toggle('is-valid', Boolean(sheetValid));
      feedback.classList.toggle('is-invalid', Boolean(sheetInvalid));
      feedback.classList.toggle('is-checking', Boolean(sheetChecking));
      if (sheetValid) feedback.textContent = 'Sheet link looks good. Ready to read.';
      else if (sheetInvalid) feedback.textContent = sheetStatus?.textContent?.trim() || 'This does not look like a public Google Sheet link.';
      else if (sheetValue) feedback.textContent = 'Checking this Sheet link…';
      else feedback.textContent = 'Set sharing to “Anyone with the link can view”.';
    }

    if (fileState) {
      fileState.classList.toggle('is-ready', selectedFile);
      fileState.textContent = selectedFile
        ? `CSV ready: ${document.getElementById('file-upload-name')?.textContent?.trim() || 'selected file'}`
        : '';
    }

    if (continueBtn) continueBtn.disabled = !(selectedFile || sheetValid);

    if (!dataOptions.dataset.singleUploadWired) {
      dataOptions.dataset.singleUploadWired = 'true';
      fileLink?.addEventListener('click', () => {
        oldFileCard?.click();
        fileBrowse?.click();
      });
      fileArea?.addEventListener('click', () => oldFileCard?.click(), true);
      sheetInput.addEventListener('focus', () => oldSheetCard?.click());
      sheetInput.addEventListener('input', () => oldSheetCard?.click());
      clear?.addEventListener('click', () => {
        sheetInput.value = '';
        sheetInput.dispatchEvent(new Event('input', { bubbles: true }));
        sheetInput.focus();
      });
      dataOptions.addEventListener('click', event => {
        if (event.target !== continueBtn || continueBtn.dataset.singleUploadBypass === 'true') return;
        const hasSelectedFile = Boolean(document.getElementById('file-upload-name')?.textContent?.trim());
        const hasValidSheet = document.getElementById('sheet-link-status')?.classList.contains('is-valid');
        if (!hasSelectedFile && !hasValidSheet) return;
        if (hasSelectedFile) oldFileCard?.click();
        else oldSheetCard?.click();
      }, true);
    }
  }

  function syncReadingState() {
    const reading = document.getElementById('reading-view');
    const isReading = Boolean(reading && !reading.hidden);
    document.body.classList.toggle('reading-view-active', isReading);
  }

  function tick() {
    injectStyle();
    if (document.body.classList.contains('upload-view-active')) ensureSingleUploadCard();
    syncReadingState();
  }

  injectStyle();
  document.addEventListener('DOMContentLoaded', tick);
  new MutationObserver(tick).observe(document.body, { attributes: true, attributeFilter: ['class'] });
  const reading = () => document.getElementById('reading-view');
  window.setInterval(tick, 400);
  window.addEventListener('click', () => window.setTimeout(tick, 0), true);
  window.addEventListener('input', () => window.setTimeout(tick, 0), true);
})();
