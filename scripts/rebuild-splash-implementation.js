const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const files = {
  index: path.join(root, 'public', 'index.html'),
  script: path.join(root, 'public', 'script.js'),
  style: path.join(root, 'public', 'style.css'),
};

const cleanSplashMarkup = String.raw`      <div class="hisaab-wordmark splash-wordmark clean-splash-wordmark" id="intro-logo" role="img" aria-label="Hisaab">
        <span class="splash-word-text" id="intro-word" aria-hidden="true">hisaab</span><span class="hisaab-period splash-period" id="intro-period" aria-hidden="true">.</span>
      </div>`;

function read(file) {
  return fs.readFileSync(file, 'utf8');
}

function write(file, content) {
  fs.writeFileSync(file, content, 'utf8');
}

function patchIndex(html) {
  if (html.includes('clean-splash-wordmark')) return html;

  const oldMarkup = String.raw`      <div class="hisaab-wordmark splash-wordmark" id="intro-logo" role="img" aria-label="Hisaab">
        <span class="hisaab-word" aria-hidden="true"><span class="intro-letter" data-letter="h"></span><span class="intro-letter" data-letter="i"></span><span class="intro-letter" data-letter="s"></span><span class="intro-letter" data-letter="a"></span><span class="intro-letter" data-letter="a"></span><span class="intro-letter" data-letter="b"></span></span><span class="hisaab-period intro-period" id="intro-period" aria-hidden="true">.</span>
      </div>`;

  if (!html.includes(oldMarkup)) {
    throw new Error('Could not find old splash wordmark markup.');
  }

  return html.replace(oldMarkup, cleanSplashMarkup);
}

function patchScript(js) {
  js = js.replace(
    "  const introLetters = introLogo ? [...introLogo.querySelectorAll('[data-letter]')] : [];\n  const introPeriod = document.getElementById('intro-period');",
    "  const introWord = document.getElementById('intro-word');\n  const introLetters = [];\n  const introPeriod = document.getElementById('intro-period');",
  );

  if (js.includes('function revealSplashWordmark()')) return js;

  const cleanIntroFunctions = String.raw`  function revealSplashWordmark() {
    if (introLogo) introLogo.classList.add('is-visible');
    if (introWord) introWord.classList.add('is-visible');
    introPeriod?.classList.add('show');
  }

  function resetSplashWordmark() {
    introLogo?.classList.remove('is-visible');
    introWord?.classList.remove('is-visible');
    introPeriod?.classList.remove('show');
  }

  function playIntroLoader() {
    if (!introLoader || !introLogo) {
      completeIntro();
      return;
    }

    splashCompleted = false;

    if (!SPLASH_FORCE_REPLAY && splashWasSeen()) {
      revealSplashWordmark();
      completeIntro();
      return;
    }

    markSplashSeen();
    clearSplashTimers();
    document.body.classList.add('intro-loading');
    document.body.classList.remove('intro-done');
    introLoader.hidden = false;
    introLoader.classList.remove('hide', 'exit');
    resetSplashWordmark();

    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) {
      revealSplashWordmark();
      introTimers.push(window.setTimeout(completeIntro, 520));
      return;
    }

    introTimers.push(window.setTimeout(() => {
      introLogo.classList.add('is-visible');
      introWord?.classList.add('is-visible');
    }, 90));
    introTimers.push(window.setTimeout(() => introPeriod?.classList.add('show'), 430));

    const exitAt = 1040;
    introTimers.push(window.setTimeout(() => introLoader.classList.add('exit'), exitAt));
    introTimers.push(window.setTimeout(completeIntro, Math.min(SPLASH_MAX_DURATION, exitAt + SPLASH_EXIT_DURATION)));
    introTimers.push(window.setTimeout(completeIntro, SPLASH_MAX_DURATION));
  }

  function stopIntro() {
    clearSplashTimers();
    if (!introLoader) return;
    revealSplashWordmark();
    completeIntro();
    greet.style.opacity = '1';
    greet.textContent = pageGreetingPhrases[0];
    subtitle.classList.add('show');
  }

`;

  const introBlockPattern = /  function playIntroLoader\(\) \{[\s\S]*?\n\n  function renderView\(\) \{/;
  if (!introBlockPattern.test(js)) {
    throw new Error('Could not find intro loader function block.');
  }

  return js.replace(introBlockPattern, `${cleanIntroFunctions}  function renderView() {`);
}

function removeMarkedBlock(css, startMarker, endMarker) {
  const start = css.indexOf(startMarker);
  if (start === -1) return css;
  const end = css.indexOf(endMarker, start);
  if (end === -1) return css.slice(0, start).trimEnd() + '\n';
  return (css.slice(0, start) + css.slice(end + endMarker.length)).trimEnd() + '\n';
}

function patchStyle(css) {
  css = removeMarkedBlock(css, '/* Canonical splash wordmark implementation */', '/* End canonical splash wordmark implementation */');

  const cleanSplashCss = String.raw`

/* Canonical splash wordmark implementation */
.splash-wordmark.clean-splash-wordmark{
  display:inline-flex;
  align-items:baseline;
  gap:0;
  color:var(--ink);
  font-size:clamp(62px, 11vw, 118px);
  font-weight:700;
  letter-spacing:-.045em;
  line-height:1;
  white-space:nowrap;
  transform-origin:center;
  font-kerning:normal;
}

.clean-splash-wordmark .splash-word-text{
  display:inline-block;
  color:var(--ink);
  line-height:1;
  opacity:0;
  transform:translateY(.08em);
  transition:opacity .34s cubic-bezier(.2,.8,.2,1), transform .34s cubic-bezier(.2,.8,.2,1);
}

.clean-splash-wordmark.is-visible .splash-word-text,
.clean-splash-wordmark .splash-word-text.is-visible{
  opacity:1;
  transform:translateY(0);
}

.clean-splash-wordmark .splash-period{
  display:inline-block;
  color:var(--accent);
  font-size:1em;
  font-weight:700;
  line-height:1;
  margin-left:-.032em;
  opacity:0;
  transform:translateY(.015em) scale(.82);
  transform-origin:center 78%;
  transition:opacity .22s ease, transform .28s cubic-bezier(.2,.8,.2,1);
}

.clean-splash-wordmark .splash-period.show{
  animation:splashPeriodPunctuationIn .38s cubic-bezier(.2,.8,.2,1) both;
}

@keyframes splashPeriodPunctuationIn{
  0%{ opacity:0; transform:translateY(.015em) scale(.82); }
  56%{ opacity:1; transform:translateY(.015em) scale(1.08); filter:drop-shadow(0 0 6px rgba(53,109,255,.20)); }
  100%{ opacity:1; transform:translateY(.015em) scale(1); filter:none; }
}

.intro-loader.exit .clean-splash-wordmark{
  animation:splashWordExit .62s cubic-bezier(.72,0,.16,1) both;
}

@media (prefers-reduced-motion: reduce){
  .clean-splash-wordmark .splash-word-text,
  .clean-splash-wordmark.is-visible .splash-word-text,
  .clean-splash-wordmark .splash-word-text.is-visible{
    opacity:1;
    transform:none;
    transition:none;
  }

  .clean-splash-wordmark .splash-period.show{
    animation:none;
    opacity:1;
    transform:translateY(.015em) scale(1);
    filter:none;
  }
}
/* End canonical splash wordmark implementation */
`;

  return css.trimEnd() + cleanSplashCss + '\n';
}

function main() {
  const indexHtml = patchIndex(read(files.index));
  const scriptJs = patchScript(read(files.script));
  const styleCss = patchStyle(read(files.style));

  write(files.index, indexHtml);
  write(files.script, scriptJs);
  write(files.style, styleCss);
}

if (require.main === module) main();
module.exports = { patchIndex, patchScript, patchStyle };
