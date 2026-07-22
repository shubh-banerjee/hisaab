const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const files = {
  index: path.join(root, 'public', 'index.html'),
  script: path.join(root, 'public', 'script.js'),
  style: path.join(root, 'public', 'style.css'),
};

function read(file) {
  return fs.readFileSync(file, 'utf8');
}

function write(file, content) {
  fs.writeFileSync(file, content, 'utf8');
}

function assertChanged(before, after, label) {
  if (before === after) {
    throw new Error(`Splash rebuild did not change ${label}.`);
  }
  return after;
}

function patchIndex(html) {
  if (html.includes('class="splash-logo-word"') && html.includes('class="splash-logo-period"')) {
    return html;
  }

  const cleanWordmark = `      <div class="hisaab-wordmark splash-wordmark" id="intro-logo" role="img" aria-label="Hisaab">
        <span class="splash-logo-word" aria-hidden="true">hisaab</span><span class="splash-logo-period" id="intro-period" aria-hidden="true">.</span>
      </div>`;

  const next = html.replace(
    /      <div class="hisaab-wordmark splash-wordmark" id="intro-logo" role="img" aria-label="Hisaab">[\s\S]*?      <\/div>/,
    cleanWordmark,
  );

  return assertChanged(html, next, 'index splash wordmark');
}

function patchScript(js) {
  let next = js;

  next = next.replace(
    `  const introLogo = document.getElementById('intro-logo');
  const introLetters = introLogo ? [...introLogo.querySelectorAll('[data-letter]')] : [];
  const introPeriod = document.getElementById('intro-period');`,
    `  const introLogo = document.getElementById('intro-logo');
  const introWord = introLogo ? introLogo.querySelector('.splash-logo-word') : null;
  const introLetters = introLogo ? [...introLogo.querySelectorAll('[data-letter]')] : [];
  const introPeriod = document.getElementById('intro-period');`,
  );

  const cleanIntroFunctions = `  function revealIntroWordmark() {
    introWord?.classList.add('is-visible');
    introLetters.forEach(letter => letter.classList.add('is-typed'));
    introPeriod?.classList.add('show');
  }

  function resetIntroWordmark() {
    introWord?.classList.remove('is-visible');
    introLetters.forEach(letter => letter.classList.remove('is-typed'));
    introPeriod?.classList.remove('show');
  }

  function playIntroLoader() {
    if (!introLoader || !introLogo) {
      completeIntro();
      return;
    }

    splashCompleted = false;

    if (!SPLASH_FORCE_REPLAY && splashWasSeen()) {
      revealIntroWordmark();
      completeIntro();
      return;
    }

    markSplashSeen();
    clearSplashTimers();
    document.body.classList.add('intro-loading');
    document.body.classList.remove('intro-done');
    introLoader.hidden = false;
    introLoader.classList.remove('hide');
    introLoader.classList.remove('exit');
    resetIntroWordmark();

    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) {
      revealIntroWordmark();
      introTimers.push(window.setTimeout(completeIntro, 520));
      return;
    }

    if (introWord) {
      introTimers.push(window.setTimeout(() => introWord.classList.add('is-visible'), 90));
      introTimers.push(window.setTimeout(() => introPeriod?.classList.add('show'), 520));
      introTimers.push(window.setTimeout(() => introLoader.classList.add('exit'), 1120));
      introTimers.push(window.setTimeout(completeIntro, 1120 + SPLASH_EXIT_DURATION));
      introTimers.push(window.setTimeout(completeIntro, SPLASH_MAX_DURATION));
      return;
    }

    introLetters.forEach((letter, index) => {
      introTimers.push(window.setTimeout(() => letter.classList.add('is-typed'), index * SPLASH_LETTER_DELAY));
    });
    const wordCompleteAt = introLetters.length * SPLASH_LETTER_DELAY + 80;
    introTimers.push(window.setTimeout(() => introPeriod?.classList.add('show'), wordCompleteAt));
    const exitAt = wordCompleteAt + 590;
    introTimers.push(window.setTimeout(() => introLoader.classList.add('exit'), exitAt));
    introTimers.push(window.setTimeout(completeIntro, Math.min(SPLASH_MAX_DURATION, exitAt + SPLASH_EXIT_DURATION)));
    introTimers.push(window.setTimeout(completeIntro, SPLASH_MAX_DURATION));
  }

  function stopIntro() {
    clearSplashTimers();
    if (!introLoader) return;
    revealIntroWordmark();
    completeIntro();
    greet.style.opacity = '1';
    greet.textContent = pageGreetingPhrases[0];
    subtitle.classList.add('show');
  }

`;

  next = next.replace(
    /  function playIntroLoader\(\) \{[\s\S]*?  function renderView\(\) \{/,
    `${cleanIntroFunctions}  function renderView() {`,
  );

  return assertChanged(js, next, 'script splash animation');
}

function patchStyle(css) {
  const marker = '/* Clean splash wordmark rebuild */';
  if (css.includes(marker)) return css;

  return `${css}

${marker}
.splash-wordmark{
  display:inline-flex;
  align-items:flex-end;
  justify-content:center;
  gap:.018em;
  color:var(--ink);
  font-size:clamp(62px, 11vw, 118px);
  font-weight:700;
  letter-spacing:-.045em;
  line-height:1;
  transform-origin:center;
}

.splash-logo-word{
  display:inline-block;
  color:var(--ink);
  line-height:1;
  opacity:0;
  clip-path:inset(0 100% 0 0);
  transform:translateY(.08em);
  transition:opacity .2s ease, clip-path .58s cubic-bezier(.2,.8,.2,1), transform .28s cubic-bezier(.2,.8,.2,1);
}

.splash-logo-word.is-visible{
  opacity:1;
  clip-path:inset(0 0 0 0);
  transform:translateY(0);
}

.splash-logo-period{
  display:inline-block;
  color:var(--accent);
  font-size:.68em;
  font-weight:700;
  line-height:.8;
  margin-left:-.035em;
  opacity:0;
  transform:translateY(.04em) scale(.82);
  transform-origin:center bottom;
}

.splash-logo-period.show{
  animation:splashCleanPeriodIn .38s cubic-bezier(.2,.8,.2,1) both;
}

@keyframes splashCleanPeriodIn{
  0%{ opacity:0; transform:translateY(.04em) scale(.82); }
  58%{ opacity:1; transform:translateY(.04em) scale(1.08); filter:drop-shadow(0 0 6px rgba(53,109,255,.22)); }
  100%{ opacity:1; transform:translateY(.04em) scale(1); filter:none; }
}

.splash-wordmark .hisaab-word,
.splash-wordmark .intro-letter,
.splash-wordmark .intro-period:not(.splash-logo-period){
  display:none !important;
}

@media (prefers-reduced-motion: reduce){
  .splash-logo-word{
    opacity:1;
    clip-path:inset(0 0 0 0);
    transform:none;
    transition:none;
  }

  .splash-logo-period.show{
    animation:none;
    opacity:1;
    transform:translateY(.04em) scale(1);
    filter:none;
  }
}
`;
}

function main() {
  write(files.index, patchIndex(read(files.index)));
  write(files.script, patchScript(read(files.script)));
  write(files.style, patchStyle(read(files.style)));
}

if (require.main === module) main();
module.exports = { patchIndex, patchScript, patchStyle };
