const fs = require('fs');
const path = require('path');

const stylePath = path.resolve(__dirname, '..', 'public', 'style.css');

function replaceBlock(source, selector, replacement) {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(`${escaped}\\s*\\{[\\s\\S]*?\\n\\}`, 'm');
  if (!re.test(source)) {
    throw new Error(`Could not find CSS block: ${selector}`);
  }
  return source.replace(re, replacement);
}

function upsertBlock(source, selector, block) {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(`${escaped}\\s*\\{[\\s\\S]*?\\n\\}`, 'm');
  if (re.test(source)) return source.replace(re, block);
  return `${source.trimEnd()}\n\n${block}\n`;
}

function patchSplashWordmark(css) {
  css = replaceBlock(css, '.hisaab-wordmark', `.hisaab-wordmark{
  display:inline-flex;
  align-items:flex-end;
  white-space:nowrap;
  font-kerning:normal;
}`);

  css = replaceBlock(css, '.splash-wordmark', `.splash-wordmark{
  gap:0;
  color:var(--ink);
  font-size:clamp(62px, 11vw, 118px);
  font-weight:700;
  letter-spacing:-.045em;
  line-height:1;
  transform-origin:center;
}`);

  css = replaceBlock(css, '.hisaab-word', `.hisaab-word{
  display:inline-flex;
  align-items:flex-end;
  white-space:nowrap;
  line-height:1;
}`);

  css = replaceBlock(css, '.intro-letter', `.intro-letter{
  position:relative;
  display:inline-block;
  width:.58em;
  height:1em;
  line-height:1;
  color:transparent;
  opacity:0;
  transform:translateY(.12em);
  transition:opacity .16s ease, transform .16s cubic-bezier(.2,.8,.2,1), color .16s ease;
}`);

  css = replaceBlock(css, '.intro-letter::after', `.intro-letter::after{
  content:attr(data-letter);
  position:absolute;
  inset:0;
  color:inherit;
  text-align:center;
  line-height:1;
}`);

  css = replaceBlock(css, '.intro-period', `.intro-period{
  display:inline-block;
  align-self:flex-end;
  width:.14em;
  height:1em;
  margin-left:-.02em;
  opacity:0;
  color:transparent;
  font-size:1em;
  line-height:1;
  position:relative;
  top:0;
  transform:translateY(0) scale(.7);
  transform-origin:center 82%;
  transition:opacity .16s ease, transform .16s cubic-bezier(.2,.8,.2,1);
}`);

  css = upsertBlock(css, '.intro-period::after', `.intro-period::after{
  content:"";
  position:absolute;
  left:50%;
  bottom:.115em;
  width:.14em;
  height:.14em;
  border-radius:999px;
  background:var(--accent);
  transform:translateX(-50%);
}`);

  css = replaceBlock(css, '.hisaab-period', `.hisaab-period{
  color:var(--accent);
  line-height:1;
  margin-left:0;
  transform-origin:center;
}`);

  css = replaceBlock(css, '.intro-period.hisaab-period', `.intro-period.hisaab-period{
  margin-left:-.02em;
}`);

  css = css.replace(/@keyframes splashPeriodIn\s*\{[\s\S]*?\n\}/m, `@keyframes splashPeriodIn{
  0%{ opacity:0; transform:translateY(0) scale(.7); }
  45%{ opacity:1; transform:translateY(0) scale(1.08); filter:drop-shadow(0 0 6px rgba(53,109,255,.24)); }
  100%{ opacity:1; transform:translateY(0) scale(1); filter:none; }
}`);

  css = css.replace(/\.intro-period\.show\{\s*animation:none;\s*opacity:1;\s*transform:[^;]+;\s*filter:none;\s*\}/m, `.intro-period.show{
    animation:none;
    opacity:1;
    transform:translateY(0) scale(1);
    filter:none;
  }`);

  return css;
}

function main() {
  const css = fs.readFileSync(stylePath, 'utf8');
  fs.writeFileSync(stylePath, patchSplashWordmark(css), 'utf8');
}

if (require.main === module) main();
module.exports = { patchSplashWordmark };
