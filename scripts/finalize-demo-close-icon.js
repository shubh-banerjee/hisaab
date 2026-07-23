const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const indexPath = path.join(root, 'public', 'index.html');
const stylePath = path.join(root, 'public', 'style.css');

const closeButton = '<button class="demo-close" id="demo-intro-home" type="button" aria-label="Exit demo" style="position:absolute;top:20px;right:30px;left:auto;z-index:60;width:32px;height:32px;display:grid;place-items:center;padding:0;border:0;background:transparent;border-radius:0;box-shadow:none;color:var(--ink-mute);font-size:28px;line-height:1;cursor:pointer;">×</button>';

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
.demo-lesson-frame{
  position:relative !important;
}

.demo-lesson-frame > .demo-close{
  position:absolute !important;
  top:20px !important;
  right:30px !important;
  left:auto !important;
  z-index:60 !important;
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
  color:var(--ink-mute) !important;
  font-size:28px !important;
  line-height:1 !important;
  cursor:pointer !important;
  opacity:1 !important;
  visibility:visible !important;
}

.demo-lesson-frame > .demo-close:hover,
.demo-lesson-frame > .demo-close:focus-visible{
  color:var(--ink) !important;
  background:transparent !important;
  border:0 !important;
  outline:2px solid rgba(53,109,255,.24) !important;
  outline-offset:4px !important;
}

.demo-frame-progress{
  padding-right:90px !important;
}

@media(max-width:760px){
  .demo-lesson-frame > .demo-close{
    top:17px !important;
    right:18px !important;
  }
}
/* End demo close icon final placement */
`;
}

fs.writeFileSync(indexPath, patchIndex(fs.readFileSync(indexPath, 'utf8')));
fs.writeFileSync(stylePath, patchStyle(fs.readFileSync(stylePath, 'utf8')));
