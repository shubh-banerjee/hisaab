const fs = require('fs');
const path = require('path');

const stylePath = path.resolve(__dirname, '..', 'public', 'style.css');

function replaceOnce(source, search, replacement, label) {
  if (!source.includes(search)) {
    throw new Error(`Could not find splash CSS block: ${label}`);
  }
  return source.replace(search, replacement);
}

function patchSplashWordmark(css) {
  css = replaceOnce(css, `.hisaab-wordmark{\n  display:inline-flex;\n  align-items:baseline;\n  white-space:nowrap;\n}`, `.hisaab-wordmark{\n  display:inline-flex;\n  align-items:flex-end;\n  white-space:nowrap;\n  font-kerning:normal;\n}`, 'wordmark container');

  css = replaceOnce(css, `.splash-wordmark{\n  gap:0;\n  color:var(--ink);\n  font-size:clamp(62px, 11vw, 118px);\n  font-weight:700;\n  letter-spacing:-.045em;\n  line-height:.86;\n  transform-origin:center;\n}`, `.splash-wordmark{\n  gap:0;\n  color:var(--ink);\n  font-size:clamp(62px, 11vw, 118px);\n  font-weight:700;\n  letter-spacing:-.045em;\n  line-height:1;\n  transform-origin:center;\n}`, 'splash wordmark');

  css = replaceOnce(css, `.hisaab-word{\n  display:inline-flex;\n  align-items:baseline;\n  white-space:nowrap;\n}`, `.hisaab-word{\n  display:inline-flex;\n  align-items:flex-end;\n  white-space:nowrap;\n  line-height:1;\n}`, 'word container');

  css = replaceOnce(css, `.intro-letter{\n  position:relative;\n  display:inline-block;\n  width:.58em;\n  height:1em;\n  color:transparent;\n  opacity:0;\n  transform:translateY(.12em);\n  transition:opacity .16s ease, transform .16s cubic-bezier(.2,.8,.2,1), color .16s ease;\n}`, `.intro-letter{\n  position:relative;\n  display:inline-block;\n  width:.58em;\n  height:1em;\n  line-height:1;\n  color:transparent;\n  opacity:0;\n  transform:translateY(.12em);\n  transition:opacity .16s ease, transform .16s cubic-bezier(.2,.8,.2,1), color .16s ease;\n}`, 'intro letter');

  css = replaceOnce(css, `.intro-letter::after{\n  content:attr(data-letter);\n  position:absolute;\n  inset:0;\n  color:inherit;\n  text-align:center;\n}`, `.intro-letter::after{\n  content:attr(data-letter);\n  position:absolute;\n  inset:0;\n  color:inherit;\n  text-align:center;\n  line-height:1;\n}`, 'intro letter glyph');

  css = replaceOnce(css, `.intro-period{\n  display:inline-block;\n  align-self:baseline;\n  width:auto;\n  /* Cancel the font's left side-bearing so the dot follows b like normal punctuation. */\n  margin-left:-.037em;\n  opacity:0;\n  color:var(--accent);\n  font-size:1em;\n  line-height:inherit;\n  /* The splash letters are individually positioned boxes, so their visible\n     glyph baseline sits slightly above an ordinary inline period. */\n  position:relative;\n  top:-.04em;\n  transform:scale(.7);\n  transform-origin:center bottom;\n  transition:opacity .16s ease, transform .16s cubic-bezier(.2,.8,.2,1);\n}`, `.intro-period{\n  display:inline-flex;\n  align-items:flex-end;\n  justify-content:center;\n  align-self:flex-end;\n  width:.18em;\n  height:1em;\n  margin-left:-.055em;\n  padding-bottom:.02em;\n  opacity:0;\n  color:var(--accent);\n  font-size:1em;\n  line-height:1;\n  position:relative;\n  top:0;\n  transform:translateY(0) scale(.7);\n  transform-origin:center 82%;\n  transition:opacity .16s ease, transform .16s cubic-bezier(.2,.8,.2,1);\n}`, 'intro period');

  css = replaceOnce(css, `.intro-period.hisaab-period{\n  margin-left:-.037em;\n}`, `.intro-period.hisaab-period{\n  margin-left:-.055em;\n}`, 'intro period override');

  css = replaceOnce(css, `@keyframes splashPeriodIn{\n  0%{ opacity:0; transform:scale(.7); }\n  45%{ opacity:1; transform:scale(1.08); filter:drop-shadow(0 0 6px rgba(53,109,255,.24)); }\n  100%{ opacity:1; transform:scale(1); filter:none; }\n}`, `@keyframes splashPeriodIn{\n  0%{ opacity:0; transform:translateY(0) scale(.7); }\n  45%{ opacity:1; transform:translateY(0) scale(1.08); filter:drop-shadow(0 0 6px rgba(53,109,255,.24)); }\n  100%{ opacity:1; transform:translateY(0) scale(1); filter:none; }\n}`, 'period animation');

  css = replaceOnce(css, `  .intro-period.show{\n    animation:none;\n    opacity:1;\n    transform:scale(1);\n    filter:none;\n  }`, `  .intro-period.show{\n    animation:none;\n    opacity:1;\n    transform:translateY(0) scale(1);\n    filter:none;\n  }`, 'reduced motion period');

  return css;
}

function main() {
  const css = fs.readFileSync(stylePath, 'utf8');
  fs.writeFileSync(stylePath, patchSplashWordmark(css), 'utf8');
}

if (require.main === module) main();
module.exports = { patchSplashWordmark };
