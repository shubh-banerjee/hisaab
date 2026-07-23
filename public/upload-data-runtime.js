(() => {
  const styleId = 'upload-data-runtime-style';
  const style = `
body.upload-view-active .brand,
body.upload-view-active .top-actions,
body.upload-view-active .landing-intro{
  display:none !important;
}
body.upload-view-active .stage{
  min-height:100svh !important;
  justify-content:center !important;
  align-items:center !important;
  padding:48px 24px !important;
}
.data-options.upload-runtime-flow{
  position:relative !important;
  width:min(1120px, calc(100vw - 72px)) !important;
  height:min(720px, calc(100svh - 72px)) !important;
  min-height:660px !important;
  display:flex !important;
  flex-direction:column !important;
  margin:0 auto !important;
  padding:0 !important;
  overflow:hidden !important;
  border:1.5px solid rgba(13,24,51,.16) !important;
  border-radius:24px !important;
  background:rgba(255,255,255,.14) !important;
  box-shadow:none !important;
  backdrop-filter:none !important;
}
.data-options.upload-runtime-flow .data-source-nav{
  height:72px !important;
  flex:0 0 72px !important;
  display:grid !important;
  grid-template-columns:1fr auto 1fr !important;
  align-items:center !important;
  padding:0 96px 0 52px !important;
  border-bottom:1px solid rgba(13,24,51,.10) !important;
}
.data-options.upload-runtime-flow .data-source-exit{
  position:absolute !important;
  top:22px !important;
  right:32px !important;
  left:auto !important;
  z-index:80 !important;
  width:32px !important;
  height:32px !important;
  display:grid !important;
  place-items:center !important;
  border:0 !important;
  background:transparent !important;
  box-shadow:none !important;
  outline:0 !important;
  color:var(--ink-mute) !important;
}
.data-options.upload-runtime-flow .data-source-exit:hover,
.data-options.upload-runtime-flow .data-source-exit:focus,
.data-options.upload-runtime-flow .data-source-exit:focus-visible{
  color:var(--ink) !important;
  background:transparent !important;
  border:0 !important;
  box-shadow:none !important;
  outline:0 !important;
}
.data-options.upload-runtime-flow .data-source-progress{
  grid-column:2 !important;
  display:flex !important;
  justify-content:center !important;
  gap:8px !important;
}
.data-options.upload-runtime-flow .data-source-progress span{
  width:30px !important;
  height:4px !important;
  border-radius:999px !important;
  background:rgba(13,24,51,.10) !important;
}
.data-options.upload-runtime-flow .data-source-progress span.is-active{
  background:var(--accent) !important;
}
.data-options.upload-runtime-flow .data-source-step-label{
  justify-self:start !important;
  white-space:nowrap !important;
  color:var(--ink-mute) !important;
  font-size:11px !important;
  font-weight:780 !important;
  letter-spacing:.08em !important;
  text-transform:uppercase !important;
}
.data-options.upload-runtime-flow #data-source-choice-step{
  flex:1 !important;
  display:flex !important;
  flex-direction:column !important;
  justify-content:center !important;
  min-height:0 !important;
  padding:40px 86px 28px !important;
  overflow:hidden !important;
}
.data-options.upload-runtime-flow .data-source-heading{
  margin:0 0 26px !important;
  max-width:720px !important;
}
.data-options.upload-runtime-flow .data-source-heading::before{
  content:'YOUR SALES DATA';
  display:block;
  margin-bottom:10px;
  color:var(--accent);
  font-size:12px;
  font-weight:800;
  letter-spacing:.16em;
}
.data-options.upload-runtime-flow .data-source-heading h2{
  margin:0 !important;
  color:var(--ink) !important;
  font-size:clamp(32px, 3.4vw, 42px) !important;
  font-weight:760 !important;
  line-height:1.08 !important;
  letter-spacing:-.045em !important;
}
.data-options.upload-runtime-flow .data-source-heading p{
  margin:14px 0 0 !important;
  max-width:680px !important;
  color:var(--ink-soft) !important;
  font-size:16px !important;
  line-height:1.5 !important;
}
.data-options.upload-runtime-flow .data-source-cards{
  display:none !important;
}
.upload-runtime-grid{
  display:grid;
  grid-template-columns:repeat(2, minmax(0, 1fr));
  gap:14px;
}
.upload-runtime-card{
  min-height:260px;
  display:flex;
  flex-direction:column;
  padding:20px;
  border:1.5px solid rgba(13,24,51,.14);
  border-radius:18px;
  background:transparent;
  transition:border-color .16s ease, background .16s ease;
}
.upload-runtime-card:hover,
.upload-runtime-card:focus-within,
.upload-runtime-card.is-active{
  border-color:var(--accent);
  background:rgba(53,109,255,.04);
}
.upload-runtime-card-head{
  display:flex;
  gap:14px;
  align-items:flex-start;
  margin-bottom:16px;
}
.upload-runtime-icon{
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
.upload-runtime-card strong{
  display:block;
  color:var(--ink);
  font-size:17px;
  font-weight:760;
  line-height:1.28;
}
.upload-runtime-card .upload-runtime-card-sub{
  display:block;
  margin-top:5px;
  color:var(--ink-soft);
  font-size:13px;
  line-height:1.42;
}
.upload-runtime-card .file-upload-area{
  flex:1;
  min-height:116px !important;
  display:grid !important;
  place-items:center !important;
  padding:16px !important;
  border:1px dashed rgba(13,24,51,.20) !important;
  border-radius:16px !important;
  background:rgba(255,255,255,.22) !important;
  cursor:pointer !important;
}
.upload-runtime-card .file-upload-area:hover,
.upload-runtime-card .file-upload-area.is-dragging{
  border-color:var(--accent) !important;
  background:rgba(53,109,255,.05) !important;
}
.upload-runtime-card .file-upload-empty,
.upload-runtime-card .file-upload-selected{
  display:grid !important;
  justify-items:center !important;
  gap:6px !important;
  text-align:center !important;
}
.upload-runtime-card .file-upload-icon{ display:none !important; }
.upload-runtime-card .file-upload-empty strong,
.upload-runtime-card .file-upload-selected strong{
  color:var(--ink) !important;
  font-size:14px !important;
}
.upload-runtime-card .file-upload-empty span,
.upload-runtime-card .file-upload-selected span{
  color:var(--ink-soft) !important;
  font-size:12.5px !important;
}
.upload-runtime-card .file-upload-browse{
  min-height:36px !important;
  margin-top:6px !important;
  padding:0 16px !important;
  border:1px solid rgba(53,109,255,.34) !important;
  border-radius:999px !important;
  color:var(--accent) !important;
  background:transparent !important;
  font-weight:700 !important;
  cursor:pointer !important;
}
.upload-runtime-card .file-upload-status{
  min-height:20px !important;
  margin:10px 0 0 !important;
  color:var(--ink-mute) !important;
  font-size:12.5px !important;
}
.upload-runtime-card .file-upload-actions{
  display:flex !important;
  gap:10px !important;
  margin-top:8px !important;
}
.upload-runtime-card .file-upload-actions button{
  padding:0 !important;
  border:0 !important;
  background:transparent !important;
  color:var(--accent) !important;
  font:inherit !important;
  font-size:12.5px !important;
  font-weight:700 !important;
  cursor:pointer !important;
}
.upload-runtime-card .data-source-sheet-field{
  display:grid !important;
  gap:9px !important;
  margin:6px 0 0 !important;
}
.upload-runtime-card .data-source-sheet-field > span:first-child{
  color:var(--ink) !important;
  font-size:13px !important;
  font-weight:760 !important;
}
.upload-runtime-card .data-source-sheet-input-wrap{
  min-height:52px !important;
  border:1.5px solid rgba(13,24,51,.14) !important;
  border-radius:16px !important;
  background:rgba(255,255,255,.22) !important;
}
.upload-runtime-card .data-source-sheet-input-wrap:focus-within{
  border-color:var(--accent) !important;
  background:rgba(53,109,255,.04) !important;
}
.upload-runtime-card .data-source-sheet-field input{
  height:50px !important;
  font-size:14px !important;
}
.upload-runtime-card .data-source-sheet-field small,
.upload-runtime-card .data-source-sheet-status{
  color:var(--ink-mute) !important;
  font-size:12.5px !important;
}
.data-options.upload-runtime-flow .upload-manual-link{
  align-self:center !important;
  margin:22px 0 0 !important;
  padding:0 !important;
  border:0 !important;
  background:transparent !important;
  color:var(--accent) !important;
  font-size:13.5px !important;
  font-weight:650 !important;
  text-decoration:none !important;
}
.data-options.upload-runtime-flow .upload-manual-link:hover{
  text-decoration:underline !important;
  text-underline-offset:3px !important;
}
.data-options.upload-runtime-flow .data-source-footer{
  height:82px !important;
  flex:0 0 82px !important;
  display:flex !important;
  justify-content:flex-end !important;
  align-items:center !important;
  padding:17px 56px !important;
  border-top:1px solid rgba(13,24,51,.10) !important;
}
.data-options.upload-runtime-flow .data-source-previous{
  display:none !important;
}
.data-options.upload-runtime-flow .data-source-continue{
  min-width:148px !important;
  min-height:48px !important;
  padding:0 22px !important;
  border:1px solid var(--accent) !important;
  border-radius:16px !important;
  background:var(--accent) !important;
  color:#fff !important;
  font-weight:740 !important;
  box-shadow:none !important;
}
.data-options.upload-runtime-flow .data-source-continue:disabled{
  border-color:rgba(13,24,51,.10) !important;
  background:rgba(13,24,51,.06) !important;
  color:var(--ink-mute) !important;
}
#data-source-file-step,
#data-source-sheet-step{
  display:none !important;
}
@media(max-width:760px){
  body.upload-view-active .stage{ padding:24px 14px !important; }
  .data-options.upload-runtime-flow{
    width:calc(100vw - 28px) !important;
    height:min(720px, calc(100svh - 48px)) !important;
    min-height:640px !important;
  }
  .data-options.upload-runtime-flow .data-source-nav{ padding-left:18px !important; padding-right:64px !important; }
  .data-options.upload-runtime-flow .data-source-exit{ top:18px !important; right:18px !important; }
  .data-options.upload-runtime-flow #data-source-choice-step{ padding:30px 22px 24px !important; justify-content:flex-start !important; overflow:auto !important; }
  .upload-runtime-grid{ grid-template-columns:1fr; }
  .upload-runtime-card{ min-height:auto; }
  .data-options.upload-runtime-flow .data-source-footer{ height:auto !important; min-height:86px !important; flex-basis:auto !important; padding:14px 18px !important; }
  .data-options.upload-runtime-flow .data-source-continue{ width:100% !important; }
}`;

  function injectStyle() {
    if (document.getElementById(styleId)) return;
    const tag = document.createElement('style');
    tag.id = styleId;
    tag.textContent = style;
    document.head.appendChild(tag);
  }

  function icon(type) {
    if (type === 'sheet') {
      return '<svg width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M8 4v16"/></svg>';
    }
    return '<svg width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3h8l4 4v14H6z"/><path d="M14 3v5h5"/><path d="M9 12h6M9 16h6M9 8h2"/></svg>';
  }

  function ensureUploadGrid() {
    const dataOptions = document.getElementById('data-options');
    const choiceStep = document.getElementById('data-source-choice-step');
    const cards = choiceStep?.querySelector('.data-source-cards');
    const manual = document.getElementById('path-bootstrap');
    const oldFileCard = document.getElementById('data-source-file');
    const oldSheetCard = document.getElementById('data-source-sheet');
    const fileArea = document.getElementById('file-upload-area');
    const fileStatus = document.getElementById('file-upload-status');
    const fileActions = document.getElementById('file-upload-actions');
    const sheetField = document.querySelector('.data-source-sheet-field');
    const sheetStatus = document.getElementById('sheet-link-status');
    const footer = dataOptions?.querySelector('.data-source-footer');
    const continueBtn = document.getElementById('data-source-continue');
    const previousBtn = document.getElementById('data-source-previous');
    const stepLabel = document.getElementById('data-source-step-label');
    const heading = choiceStep?.querySelector('.data-source-heading');
    const fileStep = document.getElementById('data-source-file-step');
    const sheetStep = document.getElementById('data-source-sheet-step');

    if (!dataOptions || !choiceStep || !fileArea || !sheetField) return;
    injectStyle();
    dataOptions.classList.add('upload-runtime-flow');
    if (stepLabel) stepLabel.textContent = 'Add data';
    if (heading) {
      const p = heading.querySelector('p');
      if (p) p.textContent = 'Upload a CSV file or paste a Google Sheet link. Hisaab will read whichever one you provide.';
    }
    if (previousBtn) previousBtn.hidden = true;
    if (fileStep) fileStep.hidden = true;
    if (sheetStep) sheetStep.hidden = true;
    if (continueBtn) continueBtn.textContent = 'Read data';

    let grid = choiceStep.querySelector('.upload-runtime-grid');
    if (!grid) {
      grid = document.createElement('div');
      grid.className = 'upload-runtime-grid';
      const filePanel = document.createElement('div');
      filePanel.className = 'upload-runtime-card upload-runtime-file';
      filePanel.innerHTML = `<div class="upload-runtime-card-head"><span class="upload-runtime-icon" aria-hidden="true">${icon('file')}</span><div><strong>Upload a sales file</strong><span class="upload-runtime-card-sub">Choose a CSV export from your orders or billing app.</span></div></div>`;
      const sheetPanel = document.createElement('div');
      sheetPanel.className = 'upload-runtime-card upload-runtime-sheet';
      sheetPanel.innerHTML = `<div class="upload-runtime-card-head"><span class="upload-runtime-icon" aria-hidden="true">${icon('sheet')}</span><div><strong>Paste Google Sheet link</strong><span class="upload-runtime-card-sub">Use a Sheet that contains your orders or sales.</span></div></div>`;
      grid.append(filePanel, sheetPanel);
      if (cards) cards.insertAdjacentElement('afterend', grid);
      else choiceStep.appendChild(grid);
    }

    const filePanel = grid.querySelector('.upload-runtime-file');
    const sheetPanel = grid.querySelector('.upload-runtime-sheet');
    if (filePanel && !filePanel.contains(fileArea)) filePanel.append(fileArea);
    if (filePanel && fileStatus && !filePanel.contains(fileStatus)) filePanel.append(fileStatus);
    if (filePanel && fileActions && !filePanel.contains(fileActions)) filePanel.append(fileActions);
    if (sheetPanel && !sheetPanel.contains(sheetField)) sheetPanel.append(sheetField);
    if (sheetPanel && sheetStatus && !sheetPanel.contains(sheetStatus)) sheetPanel.append(sheetStatus);
    if (manual && footer && manual.parentElement !== choiceStep) choiceStep.append(manual);

    const updateActive = () => {
      const selectedFile = Boolean(document.getElementById('file-upload-name')?.textContent?.trim());
      const sheetValid = document.getElementById('sheet-link-status')?.classList.contains('is-valid');
      filePanel?.classList.toggle('is-active', selectedFile);
      sheetPanel?.classList.toggle('is-active', sheetValid || Boolean(document.getElementById('upload-sheet-url')?.value?.trim()));
      if (continueBtn) continueBtn.disabled = !(selectedFile || sheetValid);
    };
    updateActive();

    if (!dataOptions.dataset.uploadRuntimeWired) {
      dataOptions.dataset.uploadRuntimeWired = 'true';
      fileArea.addEventListener('click', () => oldFileCard?.click(), true);
      sheetField.addEventListener('input', () => oldSheetCard?.click(), true);
      sheetField.addEventListener('focusin', () => oldSheetCard?.click(), true);
      dataOptions.addEventListener('click', (event) => {
        if (event.target !== continueBtn || continueBtn.dataset.bypassRuntime === 'true') return;
        const selectedFile = Boolean(document.getElementById('file-upload-name')?.textContent?.trim());
        const sheetValid = document.getElementById('sheet-link-status')?.classList.contains('is-valid');
        if (!selectedFile && !sheetValid) return;
        event.preventDefault();
        event.stopImmediatePropagation();
        const runNativeClick = () => {
          continueBtn.dataset.bypassRuntime = 'true';
          continueBtn.click();
          window.setTimeout(() => { continueBtn.dataset.bypassRuntime = 'false'; }, 0);
        };
        if (selectedFile) oldFileCard?.click();
        else oldSheetCard?.click();
        runNativeClick();
        window.setTimeout(runNativeClick, 30);
      }, true);
      const observer = new MutationObserver(updateActive);
      observer.observe(dataOptions, { subtree: true, childList: true, attributes: true, characterData: true });
      document.getElementById('upload-sheet-url')?.addEventListener('input', () => window.setTimeout(updateActive, 420));
    }
  }

  function tick() {
    if (document.body.classList.contains('upload-view-active')) ensureUploadGrid();
  }

  injectStyle();
  document.addEventListener('DOMContentLoaded', tick);
  new MutationObserver(tick).observe(document.body, { attributes: true, attributeFilter: ['class'] });
  window.addEventListener('click', () => window.setTimeout(tick, 0), true);
})();
