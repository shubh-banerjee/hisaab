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
  display:flex !important;
  justify-content:center !important;
  align-items:center !important;
  padding:48px 24px !important;
}

.data-options.upload-runtime-flow,
.data-options.upload-lesson-flow{
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

.data-options.upload-runtime-flow[hidden],
.data-options.upload-lesson-flow[hidden]{
  display:none !important;
}

.upload-lesson-close,
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
  padding:0 !important;
  border:0 !important;
  border-radius:0 !important;
  background:transparent !important;
  box-shadow:none !important;
  outline:0 !important;
  color:var(--ink-mute) !important;
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

.upload-lesson-progress{
  position:absolute !important;
  top:28px !important;
  left:52px !important;
  right:96px !important;
  z-index:30 !important;
  height:auto !important;
  display:grid !important;
  grid-template-columns:1fr auto 1fr !important;
  align-items:center !important;
  padding:0 !important;
  border:0 !important;
  background:transparent !important;
}

.upload-step-label{
  justify-self:start !important;
  white-space:nowrap !important;
  color:var(--ink-mute) !important;
  font-size:11px !important;
  font-weight:780 !important;
  letter-spacing:.08em !important;
  text-transform:uppercase !important;
}

.upload-progress-dots{
  grid-column:2 !important;
  justify-self:center !important;
  display:flex !important;
  gap:8px !important;
}

.upload-progress-dots i{
  width:30px !important;
  height:4px !important;
  border-radius:999px !important;
  background:rgba(13,24,51,.10) !important;
}

.upload-progress-dots i.is-active,
.upload-progress-dots i:first-child{
  background:var(--accent) !important;
}

.data-options.upload-runtime-flow #data-source-choice-step,
.data-options.upload-lesson-flow #data-source-choice-step{
  flex:1 !important;
  min-height:0 !important;
  display:flex !important;
  flex-direction:column !important;
  justify-content:center !important;
  padding:84px 86px 26px !important;
  overflow:hidden !important;
}

.upload-lesson-heading,
.data-source-heading.upload-lesson-heading{
  margin:0 0 26px !important;
  max-width:720px !important;
}

.upload-lesson-heading h2{
  margin:0 !important;
  color:var(--ink) !important;
  font-size:clamp(32px, 3.4vw, 42px) !important;
  font-weight:760 !important;
  line-height:1.08 !important;
  letter-spacing:-.045em !important;
}

.upload-lesson-heading p{
  margin:14px 0 0 !important;
  max-width:680px !important;
  color:var(--ink-soft) !important;
  font-size:16px !important;
  line-height:1.5 !important;
}

.upload-eyebrow{
  margin-bottom:10px !important;
  color:var(--accent) !important;
  font-size:11px !important;
  font-weight:820 !important;
  letter-spacing:.10em !important;
  text-transform:uppercase !important;
}

.upload-direct-grid{
  display:grid !important;
  grid-template-columns:repeat(2, minmax(0, 1fr)) !important;
  gap:14px !important;
  margin:0 !important;
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
  cursor:default !important;
  transition:border-color .16s ease, background .16s ease !important;
}

.upload-direct-card:hover,
.upload-direct-card:focus-within,
.upload-direct-card.selected{
  border-color:var(--accent) !important;
  background:rgba(53,109,255,.04) !important;
}

.upload-direct-top{
  display:flex !important;
  gap:14px !important;
  align-items:flex-start !important;
  margin:0 0 16px !important;
}

.upload-direct-top .source-icon{
  width:44px !important;
  height:44px !important;
  flex:0 0 auto !important;
  display:grid !important;
  place-items:center !important;
  border:1px solid rgba(53,109,255,.12) !important;
  border-radius:14px !important;
  color:var(--accent) !important;
  background:rgba(53,109,255,.07) !important;
}

.upload-direct-top strong{
  display:block !important;
  color:var(--ink) !important;
  font-size:17px !important;
  font-weight:760 !important;
  line-height:1.28 !important;
}

.upload-direct-top span:not(.source-icon){
  display:block !important;
  margin-top:5px !important;
  color:var(--ink-soft) !important;
  font-size:13px !important;
  line-height:1.42 !important;
}

.compact-upload-area,
.file-upload-area{
  flex:1 !important;
  min-height:116px !important;
  display:grid !important;
  place-items:center !important;
  padding:16px !important;
  border:1px dashed rgba(13,24,51,.20) !important;
  border-radius:16px !important;
  background:rgba(255,255,255,.22) !important;
  cursor:pointer !important;
}

.compact-upload-area:hover,
.file-upload-area:hover,
.file-upload-area.is-dragging{
  border-color:var(--accent) !important;
  background:rgba(53,109,255,.05) !important;
}

.file-upload-empty,
.file-upload-selected{
  display:grid !important;
  justify-items:center !important;
  gap:6px !important;
  text-align:center !important;
}

.file-upload-icon{ display:none !important; }

.file-upload-empty strong,
.file-upload-selected strong{
  color:var(--ink) !important;
  font-size:14px !important;
}

.file-upload-empty span,
.file-upload-selected span{
  color:var(--ink-soft) !important;
  font-size:12.5px !important;
}

.file-upload-browse{
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

.file-upload-status{
  min-height:20px !important;
  margin:10px 0 0 !important;
  color:var(--ink-mute) !important;
  font-size:12.5px !important;
}

.file-upload-actions{
  display:flex !important;
  gap:10px !important;
  margin-top:8px !important;
}

.file-upload-actions[hidden]{ display:none !important; }

.file-upload-actions button{
  padding:0 !important;
  border:0 !important;
  background:transparent !important;
  color:var(--accent) !important;
  font:inherit !important;
  font-size:12.5px !important;
  font-weight:700 !important;
  cursor:pointer !important;
}

.compact-sheet-field,
.data-source-sheet-field{
  display:grid !important;
  gap:9px !important;
  margin:6px 0 0 !important;
}

.data-source-sheet-field > span:first-child{
  color:var(--ink) !important;
  font-size:13px !important;
  font-weight:760 !important;
}

.data-source-sheet-input-wrap{
  min-height:52px !important;
  border:1.5px solid rgba(13,24,51,.14) !important;
  border-radius:16px !important;
  background:rgba(255,255,255,.22) !important;
}

.data-source-sheet-input-wrap:focus-within{
  border-color:var(--accent) !important;
  background:rgba(53,109,255,.04) !important;
}

.data-source-sheet-field input{
  height:50px !important;
  font-size:14px !important;
}

.data-source-sheet-field small,
.data-source-sheet-status{
  color:var(--ink-mute) !important;
  font-size:12.5px !important;
}

.upload-direct-manual,
.upload-manual-link{
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

.upload-direct-manual:hover,
.upload-manual-link:hover{
  text-decoration:underline !important;
  text-underline-offset:3px !important;
}

.upload-lesson-footer,
.data-source-footer{
  height:82px !important;
  flex:0 0 82px !important;
  display:flex !important;
  justify-content:flex-end !important;
  align-items:center !important;
  padding:17px 56px !important;
  border-top:1px solid rgba(13,24,51,.10) !important;
}

.data-source-previous{
  display:none !important;
}

.data-source-continue{
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

.data-source-continue:disabled{
  border-color:rgba(13,24,51,.10) !important;
  background:rgba(13,24,51,.06) !important;
  color:var(--ink-mute) !important;
}

#data-source-file-step,
#data-source-sheet-step,
.data-source-nav,
.upload-runtime-grid{
  display:none !important;
}

@media(max-height:820px) and (min-width:761px){
  .data-options.upload-runtime-flow,
  .data-options.upload-lesson-flow{
    height:min(660px, calc(100svh - 48px)) !important;
    min-height:620px !important;
  }
  .upload-lesson-progress{ top:22px !important; }
  .data-options.upload-runtime-flow #data-source-choice-step,
  .data-options.upload-lesson-flow #data-source-choice-step{
    padding-top:74px !important;
    padding-bottom:22px !important;
  }
  .upload-direct-card{ min-height:230px !important; }
}

@media(max-width:760px){
  body.upload-view-active .stage{ padding:24px 14px !important; }
  .data-options.upload-runtime-flow,
  .data-options.upload-lesson-flow{
    width:calc(100vw - 28px) !important;
    height:min(720px, calc(100svh - 48px)) !important;
    min-height:640px !important;
  }
  .upload-lesson-close{ top:18px !important; right:18px !important; }
  .upload-lesson-progress{ top:24px !important; left:18px !important; right:64px !important; }
  .data-options.upload-runtime-flow #data-source-choice-step,
  .data-options.upload-lesson-flow #data-source-choice-step{
    padding:82px 22px 24px !important;
    justify-content:flex-start !important;
    overflow:auto !important;
  }
  .upload-direct-grid{ grid-template-columns:1fr !important; }
  .upload-direct-card{ min-height:auto !important; }
  .upload-lesson-footer,
  .data-source-footer{ height:auto !important; min-height:86px !important; flex-basis:auto !important; padding:14px 18px !important; }
  .data-source-continue{ width:100% !important; }
}`;

  function injectStyle() {
    if (document.getElementById(styleId)) return;
    const tag = document.createElement('style');
    tag.id = styleId;
    tag.textContent = style;
    document.head.appendChild(tag);
  }

  function syncUploadState() {
    const dataOptions = document.getElementById('data-options');
    if (!dataOptions) return;

    dataOptions.classList.add('upload-runtime-flow');

    const label = document.getElementById('data-source-step-label');
    if (label) label.textContent = 'Add data';

    const previousBtn = document.getElementById('data-source-previous');
    if (previousBtn) previousBtn.hidden = true;

    const continueBtn = document.getElementById('data-source-continue');
    if (continueBtn && continueBtn.textContent !== 'Reading…') continueBtn.textContent = 'Read data';

    const fileStep = document.getElementById('data-source-file-step');
    const sheetStep = document.getElementById('data-source-sheet-step');
    if (fileStep) fileStep.hidden = true;
    if (sheetStep) sheetStep.hidden = true;

    const fileCard = document.getElementById('data-source-file');
    const sheetCard = document.getElementById('data-source-sheet');
    const hasFile = Boolean(document.getElementById('file-upload-name')?.textContent?.trim());
    const hasSheetInput = Boolean(document.getElementById('upload-sheet-url')?.value?.trim());
    const sheetValid = document.getElementById('sheet-link-status')?.classList.contains('is-valid');
    fileCard?.classList.toggle('selected', hasFile);
    sheetCard?.classList.toggle('selected', hasSheetInput || sheetValid);
    if (continueBtn) continueBtn.disabled = !(hasFile || sheetValid);
  }

  function tick() {
    injectStyle();
    if (document.body.classList.contains('upload-view-active')) syncUploadState();
  }

  injectStyle();
  document.addEventListener('DOMContentLoaded', tick);
  new MutationObserver(tick).observe(document.body, { attributes: true, attributeFilter: ['class'] });
  window.addEventListener('click', () => window.setTimeout(tick, 0), true);
  window.addEventListener('input', () => window.setTimeout(tick, 0), true);
})();
