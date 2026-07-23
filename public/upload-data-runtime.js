(() => {
  const styleId = 'upload-data-runtime-style';
  const style = `
body.upload-view-active .brand,
body.upload-view-active .top-actions,
body.upload-view-active .landing-intro,
body:has(#reading-view:not([hidden])) .brand,
body:has(#reading-view:not([hidden])) .top-actions,
body:has(#reading-view:not([hidden])) .landing-intro{
  display:none !important;
}

body.upload-view-active .stage,
body:has(#reading-view:not([hidden])) .stage{
  min-height:100svh !important;
  display:flex !important;
  justify-content:center !important;
  align-items:center !important;
  padding:48px 24px !important;
}

.data-options.upload-single-flow{
  position:relative !important;
  width:100% !important;
  max-width:760px !important;
  min-height:0 !important;
  height:auto !important;
  display:flex !important;
  justify-content:center !important;
  margin:0 auto !important;
  padding:0 !important;
  overflow:visible !important;
  border:0 !important;
  border-radius:0 !important;
  background:transparent !important;
  box-shadow:none !important;
  backdrop-filter:none !important;
}

.data-options.upload-single-flow[hidden]{
  display:none !important;
}

.data-options.upload-single-flow > :not(.upload-single-card){
  display:none !important;
}

.upload-single-card{
  position:relative;
  width:min(760px, calc(100vw - 48px));
  padding:30px 32px 28px;
  border:1px solid rgba(13,24,51,.11);
  border-radius:24px;
  background:rgba(255,255,255,.72);
  box-shadow:0 24px 80px rgba(34,64,118,.10);
  color:var(--ink);
}

.upload-single-close{
  position:absolute !important;
  top:22px !important;
  right:24px !important;
  z-index:5 !important;
  width:28px !important;
  height:28px !important;
  display:grid !important;
  place-items:center !important;
  padding:0 !important;
  border:0 !important;
  border-radius:0 !important;
  background:transparent !important;
  box-shadow:none !important;
  outline:0 !important;
  color:var(--ink-mute) !important;
  cursor:pointer !important;
}

.upload-single-close:hover,
.upload-single-close:focus-visible{
  color:var(--ink) !important;
  background:transparent !important;
  border:0 !important;
  box-shadow:none !important;
  outline:0 !important;
}

.upload-single-copy{
  margin:0 42px 18px 0;
  color:var(--ink-soft);
  font-size:16px;
  line-height:1.5;
}

.upload-single-field-wrap{
  position:relative;
}

.upload-single-card .data-source-sheet-field{
  display:block !important;
  margin:0 !important;
}

.upload-single-card .data-source-sheet-field > span:first-child,
.upload-single-card .data-source-sheet-field small{
  display:none !important;
}

.upload-single-card .data-source-sheet-input-wrap{
  min-height:58px !important;
  width:100% !important;
  display:flex !important;
  align-items:center !important;
  gap:12px !important;
  padding:0 44px 0 18px !important;
  border:1.5px solid rgba(53,109,255,.36) !important;
  border-radius:16px !important;
  background:rgba(53,109,255,.045) !important;
  box-shadow:0 0 0 1px rgba(53,109,255,.05) !important;
}

.upload-single-card .data-source-sheet-input-wrap:focus-within{
  border-color:var(--accent) !important;
  background:rgba(53,109,255,.07) !important;
  box-shadow:0 0 0 3px rgba(53,109,255,.10) !important;
}

.upload-single-card .data-source-sheet-icon{
  color:var(--accent) !important;
  flex:0 0 auto !important;
}

.upload-single-card #upload-sheet-url{
  min-width:0 !important;
  width:100% !important;
  height:56px !important;
  border:0 !important;
  outline:0 !important;
  background:transparent !important;
  color:var(--ink) !important;
  font-size:17px !important;
  line-height:1.3 !important;
}

.upload-single-card #upload-sheet-url::placeholder{
  color:rgba(72,86,118,.62) !important;
}

.upload-single-clear{
  position:absolute;
  top:50%;
  right:14px;
  transform:translateY(-50%);
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
.upload-single-clear[hidden]{ display:none !important; }

.upload-single-status{
  min-height:21px;
  margin:10px 0 0;
  color:var(--ink-mute);
  font-size:13px;
  line-height:1.45;
}

.upload-single-status.is-checking{ color:var(--ink-soft); }
.upload-single-status.is-valid{ color:#117642; }
.upload-single-status.is-invalid{ color:#b42318; }

.upload-single-alternate{
  display:flex;
  align-items:center;
  gap:14px;
  margin-top:24px;
  color:var(--ink-mute);
  font-size:16px;
}

.upload-single-upload-link,
.upload-single-manual{
  padding:0;
  border:0;
  background:transparent;
  color:var(--accent);
  font:inherit;
  font-weight:740;
  cursor:pointer;
  text-decoration:none;
}

.upload-single-upload-link:hover,
.upload-single-manual:hover{
  text-decoration:underline;
  text-underline-offset:3px;
}

.upload-single-file-panel{
  margin-top:16px;
  padding:16px;
  border:1px solid rgba(13,24,51,.10);
  border-radius:18px;
  background:rgba(255,255,255,.48);
}

.upload-single-file-panel[hidden]{ display:none !important; }

.upload-single-card .file-upload-area{
  min-height:118px !important;
  display:grid !important;
  place-items:center !important;
  padding:18px !important;
  border:1.3px dashed rgba(13,24,51,.20) !important;
  border-radius:16px !important;
  background:transparent !important;
  cursor:pointer !important;
}

.upload-single-card .file-upload-area:hover,
.upload-single-card .file-upload-area.is-dragging{
  border-color:var(--accent) !important;
  background:rgba(53,109,255,.04) !important;
}

.upload-single-card .file-upload-empty,
.upload-single-card .file-upload-selected{
  display:grid !important;
  justify-items:center !important;
  gap:6px !important;
  text-align:center !important;
}

.upload-single-card .file-upload-icon{ display:none !important; }
.upload-single-card .file-upload-empty strong,
.upload-single-card .file-upload-selected strong{
  color:var(--ink) !important;
  font-size:14px !important;
}

.upload-single-card .file-upload-empty span,
.upload-single-card .file-upload-selected span{
  color:var(--ink-soft) !important;
  font-size:13px !important;
}

.upload-single-card .file-upload-browse{
  min-height:36px !important;
  margin-top:6px !important;
  padding:0 16px !important;
  border:1px solid rgba(53,109,255,.34) !important;
  border-radius:999px !important;
  color:var(--accent) !important;
  background:transparent !important;
  font-weight:740 !important;
  cursor:pointer !important;
}

.upload-single-card .file-upload-status{
  min-height:20px !important;
  margin:10px 0 0 !important;
  color:var(--ink-mute) !important;
  font-size:13px !important;
}

.upload-single-card .file-upload-status.is-error{ color:#b42318 !important; }
.upload-single-card .file-upload-status.is-success{ color:#117642 !important; }

.upload-single-card .file-upload-actions{
  display:flex !important;
  gap:12px !important;
  margin-top:8px !important;
}
.upload-single-card .file-upload-actions[hidden]{ display:none !important; }
.upload-single-card .file-upload-actions button{
  padding:0 !important;
  border:0 !important;
  background:transparent !important;
  color:var(--accent) !important;
  font:inherit !important;
  font-size:13px !important;
  font-weight:740 !important;
  cursor:pointer !important;
}

.upload-single-bottom{
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:18px;
  margin-top:24px;
  padding-top:22px;
  border-top:1px solid rgba(13,24,51,.08);
}

.upload-single-card .upload-single-manual{
  color:var(--ink-mute);
  font-size:14px;
  font-weight:650;
}
.upload-single-card .upload-single-manual strong{
  color:var(--accent);
  font-weight:760;
}

.upload-single-card .data-source-continue{
  min-width:136px !important;
  min-height:46px !important;
  padding:0 22px !important;
  border:1px solid var(--accent) !important;
  border-radius:15px !important;
  background:var(--accent) !important;
  color:#fff !important;
  font-weight:760 !important;
  box-shadow:none !important;
}

.upload-single-card .data-source-continue:disabled{
  border-color:rgba(13,24,51,.10) !important;
  background:rgba(13,24,51,.06) !important;
  color:var(--ink-mute) !important;
  cursor:not-allowed !important;
}

#data-source-file-step,
#data-source-sheet-step,
.data-source-nav,
.upload-lesson-progress,
.upload-lesson-heading,
.upload-direct-grid,
.upload-lesson-footer,
.upload-runtime-grid{
  display:none !important;
}

body:has(#reading-view:not([hidden])) #reading-view{
  width:100%;
  display:flex !important;
  justify-content:center;
  align-items:center;
}

body:has(#reading-view:not([hidden])) #reading-view .reading-stage{
  position:relative;
  width:min(520px, calc(100vw - 48px));
  min-height:340px;
  display:grid;
  place-items:center;
  padding:54px 48px 48px;
  border:1px solid rgba(13,24,51,.10);
  border-radius:24px;
  background:rgba(255,255,255,.78);
  box-shadow:0 24px 80px rgba(34,64,118,.10);
}

body:has(#reading-view:not([hidden])) #reading-view .reading-exit{
  position:absolute !important;
  top:22px !important;
  right:22px !important;
  left:auto !important;
  width:28px !important;
  height:28px !important;
  display:grid !important;
  place-items:center !important;
  padding:0 !important;
  border:0 !important;
  background:transparent !important;
  color:var(--ink-mute) !important;
  box-shadow:none !important;
}

body:has(#reading-view:not([hidden])) #reading-view .reading-exit:hover{
  color:var(--ink) !important;
}

body:has(#reading-view:not([hidden])) #reading-view .reading-content{
  width:100%;
  max-width:360px;
  display:grid;
  justify-items:center;
  text-align:center;
}

body:has(#reading-view:not([hidden])) #reading-view .reading-wordmark{
  margin:0 0 18px;
  color:var(--ink);
  font-size:18px;
  font-weight:760;
  letter-spacing:-.04em;
}

body:has(#reading-view:not([hidden])) #reading-view .reading-period{
  color:var(--accent);
}

body:has(#reading-view:not([hidden])) #reading-view h2{
  margin:0;
  color:var(--ink);
  font-size:28px;
  line-height:1.15;
  letter-spacing:-.035em;
}

body:has(#reading-view:not([hidden])) #reading-view .reading-content > p:not(.reading-step):not(.reading-progress-label):not(.reading-long-message){
  margin:10px 0 30px;
  color:var(--ink-soft);
  font-size:14px;
  line-height:1.45;
}

body:has(#reading-view:not([hidden])) #reading-view .reading-progress{
  width:100%;
  display:flex;
  align-items:center;
  justify-content:center;
  gap:10px;
  margin:0;
}

body:has(#reading-view:not([hidden])) #reading-view .reading-step-mark{
  width:18px;
  height:18px;
  border-radius:999px;
  border:2px solid rgba(13,24,51,.10);
  border-top-color:var(--accent);
  animation:hisaabReadingSpin .9s linear infinite;
}

body:has(#reading-view:not([hidden])) #reading-view .reading-step{
  margin:0;
  color:var(--ink);
  font-size:14px;
  font-weight:720;
  line-height:1.4;
}

body:has(#reading-view:not([hidden])) #reading-view .reading-progress-label{
  margin:14px 0 0;
  color:var(--ink-mute);
  font-size:12px;
}

body:has(#reading-view:not([hidden])) #reading-view .reading-long-message{
  margin:14px 0 0;
  color:var(--ink-soft);
  font-size:13px;
}

@keyframes hisaabReadingSpin{ to{ transform:rotate(360deg); } }

@media(max-width:760px){
  body.upload-view-active .stage,
  body:has(#reading-view:not([hidden])) .stage{ padding:24px 14px !important; }
  .upload-single-card{ width:calc(100vw - 28px); padding:28px 22px 24px; border-radius:22px; }
  .upload-single-copy{ margin-right:34px; font-size:15px; }
  .upload-single-bottom{ align-items:stretch; flex-direction:column; }
  .upload-single-card .data-source-continue{ width:100% !important; }
  body:has(#reading-view:not([hidden])) #reading-view .reading-stage{ width:calc(100vw - 28px); min-height:320px; padding:50px 26px 42px; }
}`;

  function injectStyle() {
    let tag = document.getElementById(styleId);
    if (!tag) {
      tag = document.createElement('style');
      tag.id = styleId;
      document.head.appendChild(tag);
    }
    tag.textContent = style;
  }

  function icon(type) {
    if (type === 'sheet') {
      return '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M8 4v16"/></svg>';
    }
    return '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3h8l4 4v14H6z"/><path d="M14 3v5h5"/><path d="M9 12h6M9 16h6M9 8h2"/></svg>';
  }

  function ensureUploadSingleCard() {
    const dataOptions = document.getElementById('data-options');
    const close = document.getElementById('upload-back') || dataOptions?.querySelector('.data-source-exit');
    const choiceStep = document.getElementById('data-source-choice-step');
    const sheetField = document.querySelector('.data-source-sheet-field');
    const sheetWrap = document.querySelector('.data-source-sheet-input-wrap');
    const sheetInput = document.getElementById('upload-sheet-url');
    const sheetStatus = document.getElementById('sheet-link-status');
    const sheetStatusText = document.getElementById('sheet-link-status-text');
    const fileArea = document.getElementById('file-upload-area');
    const fileStatus = document.getElementById('file-upload-status');
    const fileActions = document.getElementById('file-upload-actions');
    const continueBtn = document.getElementById('data-source-continue');
    const manual = document.getElementById('path-bootstrap');
    const previousBtn = document.getElementById('data-source-previous');

    if (!dataOptions || !choiceStep || !sheetField || !sheetInput || !fileArea || !continueBtn) return;
    dataOptions.classList.add('upload-single-flow');
    if (previousBtn) previousBtn.hidden = true;
    continueBtn.textContent = continueBtn.textContent === 'Reading…' ? 'Reading…' : 'Read data';

    let card = dataOptions.querySelector('.upload-single-card');
    if (!card) {
      card = document.createElement('section');
      card.className = 'upload-single-card';
      card.setAttribute('aria-label', 'Add your sales data');
      card.innerHTML = `
        <p class="upload-single-copy">Paste a public Google Sheets link. Hisaab reads whatever columns exist.</p>
        <div class="upload-single-field-wrap"></div>
        <p class="upload-single-status" id="upload-single-status">Set sharing to “Anyone with the link can view”.</p>
        <div class="upload-single-alternate"><span>or</span><button class="upload-single-upload-link" type="button">upload a CSV file</button></div>
        <div class="upload-single-file-panel" hidden></div>
        <div class="upload-single-bottom"><button class="upload-single-manual" type="button">No sales file yet? <strong>Start with a simple daily sales log</strong></button><span class="upload-single-continue-slot"></span></div>
      `;
      dataOptions.append(card);
    }

    if (close && !card.contains(close)) {
      close.classList.add('upload-single-close');
      card.prepend(close);
    }

    const fieldWrap = card.querySelector('.upload-single-field-wrap');
    if (fieldWrap && !fieldWrap.contains(sheetField)) fieldWrap.append(sheetField);

    let clearButton = card.querySelector('.upload-single-clear');
    if (!clearButton) {
      clearButton = document.createElement('button');
      clearButton.type = 'button';
      clearButton.className = 'upload-single-clear';
      clearButton.setAttribute('aria-label', 'Clear Google Sheet link');
      clearButton.textContent = '×';
      fieldWrap?.append(clearButton);
      clearButton.addEventListener('click', () => {
        sheetInput.value = '';
        sheetInput.dispatchEvent(new Event('input', { bubbles: true }));
        sheetInput.focus();
        window.setTimeout(syncUploadState, 0);
      });
    }

    const filePanel = card.querySelector('.upload-single-file-panel');
    if (filePanel && !filePanel.contains(fileArea)) filePanel.append(fileArea);
    if (filePanel && fileStatus && !filePanel.contains(fileStatus)) filePanel.append(fileStatus);
    if (filePanel && fileActions && !filePanel.contains(fileActions)) filePanel.append(fileActions);

    const continueSlot = card.querySelector('.upload-single-continue-slot');
    if (continueSlot && !continueSlot.contains(continueBtn)) continueSlot.append(continueBtn);

    const manualProxy = card.querySelector('.upload-single-manual');
    if (manual && manualProxy && !manualProxy.dataset.wired) {
      manualProxy.dataset.wired = 'true';
      manualProxy.addEventListener('click', () => manual.click());
    }

    const uploadLink = card.querySelector('.upload-single-upload-link');
    if (uploadLink && !uploadLink.dataset.wired) {
      uploadLink.dataset.wired = 'true';
      uploadLink.addEventListener('click', () => {
        if (filePanel) filePanel.hidden = false;
        const browse = document.getElementById('file-upload-browse');
        if (browse) browse.click();
        else fileArea.click();
        window.setTimeout(syncUploadState, 0);
      });
    }

    if (!dataOptions.dataset.singleUploadWired) {
      dataOptions.dataset.singleUploadWired = 'true';
      sheetInput.addEventListener('input', () => window.setTimeout(syncUploadState, 80));
      sheetInput.addEventListener('blur', () => window.setTimeout(syncUploadState, 80));
      dataOptions.addEventListener('click', () => window.setTimeout(syncUploadState, 0), true);
      new MutationObserver(syncUploadState).observe(dataOptions, { subtree: true, attributes: true, childList: true, characterData: true });
    }

    syncUploadState();
  }

  function syncUploadState() {
    const card = document.querySelector('.upload-single-card');
    const sheetInput = document.getElementById('upload-sheet-url');
    const nativeStatus = document.getElementById('sheet-link-status');
    const nativeStatusText = document.getElementById('sheet-link-status-text');
    const status = document.getElementById('upload-single-status');
    const clearButton = document.querySelector('.upload-single-clear');
    const continueBtn = document.getElementById('data-source-continue');
    const filePanel = document.querySelector('.upload-single-file-panel');
    const hasFile = Boolean(document.getElementById('file-upload-name')?.textContent?.trim());
    const value = sheetInput?.value?.trim() || '';
    const isValid = nativeStatus?.classList.contains('is-valid');
    const isInvalid = nativeStatus?.classList.contains('is-invalid');
    const isChecking = Boolean(value) && !isValid && !isInvalid;

    if (!card || !sheetInput || !status) return;
    if (clearButton) clearButton.hidden = !value;
    if (filePanel && hasFile) filePanel.hidden = false;

    status.className = 'upload-single-status';
    if (!value && !hasFile) {
      status.textContent = 'Set sharing to “Anyone with the link can view”.';
    } else if (isValid) {
      status.classList.add('is-valid');
      status.textContent = 'Sheet link looks good. Ready to read.';
      if (nativeStatusText) nativeStatusText.textContent = status.textContent;
    } else if (isInvalid) {
      status.classList.add('is-invalid');
      status.textContent = nativeStatusText?.textContent || 'This does not look like a Google Sheet link.';
    } else if (value) {
      status.classList.add('is-checking');
      status.textContent = 'Checking this Sheet link…';
    } else if (hasFile) {
      status.classList.add('is-valid');
      status.textContent = 'CSV file is ready. Hisaab can read it now.';
    }

    if (continueBtn && continueBtn.textContent !== 'Reading…') {
      continueBtn.textContent = 'Read data';
      continueBtn.disabled = !(isValid || hasFile);
    }
  }

  function tick() {
    injectStyle();
    if (document.body.classList.contains('upload-view-active')) ensureUploadSingleCard();
  }

  injectStyle();
  document.addEventListener('DOMContentLoaded', tick);
  new MutationObserver(tick).observe(document.body, { attributes: true, attributeFilter: ['class'] });
  window.addEventListener('click', () => window.setTimeout(tick, 0), true);
  window.addEventListener('input', () => window.setTimeout(tick, 0), true);
})();
