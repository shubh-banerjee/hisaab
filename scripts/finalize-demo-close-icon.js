const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const indexPath = path.join(root, 'public', 'index.html');
const stylePath = path.join(root, 'public', 'style.css');

const closeButton = '<button class="demo-close" id="demo-intro-home" type="button" aria-label="Exit demo" style="position:absolute;top:22px;right:32px;left:auto;z-index:80;width:32px;height:32px;display:grid;place-items:center;padding:0;border:0;background:transparent;border-radius:0;box-shadow:none;outline:none;color:var(--ink-mute);font-size:28px;line-height:1;cursor:pointer;">×</button>';

function stripBlock(input, start, end) {
  const s = input.indexOf(start);
  if (s === -1) return input;
  const e = input.indexOf(end, s);
  return e === -1 ? input.slice(0, s).trimEnd() + '\n' : (input.slice(0, s) + input.slice(e + end.length)).trimEnd() + '\n';
}

function patchIndex(html) {
  return html.replace(/<button class="demo-close" id="demo-intro-home" type="button" aria-label="Exit demo"(?: style="[^"]*")?>×<\/button>/, closeButton);
}

function patchStyle(css) {
  css = stripBlock(css, '/* Demo close icon final placement */', '/* End demo close icon final placement */');
  return css.trimEnd() + `

/* Demo close icon final placement */
body.view-demo-intro #data-options,
body.view-demo-found-data #data-options,
body.view-demo-questions #data-options,
body.view-demo-result #data-options,
.data-options.upload-runtime-flow[hidden]{
  display:none !important;
  visibility:hidden !important;
  pointer-events:none !important;
}

.demo-intro.demo-lesson{
  max-width:1120px !important;
}

.demo-lesson-frame{
  position:relative !important;
  width:min(1120px, calc(100vw - 72px)) !important;
  height:min(720px, calc(100svh - 72px)) !important;
  min-height:660px !important;
}

.demo-lesson-frame > .demo-close{
  position:absolute !important;
  top:22px !important;
  right:32px !important;
  left:auto !important;
  z-index:80 !important;
  width:32px !important;
  height:32px !important;
  min-width:32px !important;
  min-height:32px !important;
  display:grid !important;
  place-items:center !important;
  padding:0 !important;
  border:0 !important;
  border-radius:0 !important;
  background:transparent !important;
  box-shadow:none !important;
  outline:0 !important;
  color:var(--ink-mute) !important;
  font-size:28px !important;
  line-height:1 !important;
  cursor:pointer !important;
  opacity:1 !important;
  visibility:visible !important;
}

.demo-lesson-frame > .demo-close:hover,
.demo-lesson-frame > .demo-close:focus,
.demo-lesson-frame > .demo-close:focus-visible{
  color:var(--ink) !important;
  background:transparent !important;
  border:0 !important;
  box-shadow:none !important;
  outline:0 !important;
}

.demo-frame-progress{
  position:absolute !important;
  top:28px !important;
  left:52px !important;
  right:96px !important;
  z-index:30 !important;
  height:auto !important;
  min-height:0 !important;
  flex:0 0 auto !important;
  padding:0 !important;
  border-bottom:0 !important;
  background:transparent !important;
}

#demo-progress-label{
  white-space:nowrap !important;
  min-width:max-content !important;
}

.demo-step-content{
  padding-left:86px !important;
  padding-right:86px !important;
  padding-top:84px !important;
}

.demo-step-content-narrow{
  max-width:720px !important;
}

.demo-step-content-questions,
.demo-step-content-result{
  justify-content:center !important;
}

.demo-found-list,
.demo-question-list,
.demo-result-grid{
  display:grid !important;
  grid-template-columns:repeat(2, minmax(0, 1fr)) !important;
  grid-template-rows:repeat(2, minmax(0, auto)) !important;
  gap:12px !important;
}

.demo-found-list div{
  min-height:92px !important;
  padding:16px 18px !important;
}

.demo-question{
  min-height:96px !important;
  padding:15px 18px !important;
}

.demo-result-section,
.demo-answer-block{
  grid-column:auto !important;
  min-height:116px !important;
  padding:15px 18px !important;
}

.demo-step-footer{
  padding-left:56px !important;
  padding-right:56px !important;
}

@media(max-height:820px) and (min-width:761px){
  .demo-lesson-frame{
    height:min(660px, calc(100svh - 48px)) !important;
    min-height:620px !important;
  }
  .demo-frame-progress{
    top:22px !important;
  }
  .demo-step-content{
    padding-top:74px !important;
    padding-bottom:22px !important;
  }
  .demo-question{
    min-height:84px !important;
  }
  .demo-result-section{
    min-height:98px !important;
  }
}

@media(max-width:760px){
  .demo-intro.demo-lesson{
    max-width:100% !important;
  }
  .demo-lesson-frame{
    width:calc(100vw - 28px) !important;
    height:min(700px, calc(100svh - 48px)) !important;
    min-height:620px !important;
  }
  .demo-lesson-frame > .demo-close{
    top:18px !important;
    right:18px !important;
  }
  .demo-frame-progress{
    top:24px !important;
    left:18px !important;
    right:64px !important;
  }
  .demo-step-content{
    padding-left:22px !important;
    padding-right:22px !important;
    padding-top:82px !important;
  }
  .demo-found-list,
  .demo-question-list,
  .demo-result-grid{
    grid-template-columns:1fr !important;
    grid-template-rows:auto !important;
  }
}
/* End demo close icon final placement */
`;
}

fs.writeFileSync(indexPath, patchIndex(fs.readFileSync(indexPath, 'utf8')));
fs.writeFileSync(stylePath, patchStyle(fs.readFileSync(stylePath, 'utf8')));
