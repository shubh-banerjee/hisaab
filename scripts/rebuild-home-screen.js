const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const files = {
  index: path.join(root, 'public', 'index.html'),
  style: path.join(root, 'public', 'style.css'),
};

const homeMarkup = String.raw`    <div class="path-chooser" id="path-chooser">
      <button class="path landing-path path-demo" id="path-sample" type="button" aria-label="See a demo shop">
        <span class="landing-card-visual demo-card-visual" aria-hidden="true">
          <span class="landing-icon-orb demo-shop-mark"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M4 10h16v9H4z"/><path d="M3 10l2-5h14l2 5"/><path d="M8 19v-5h4v5"/><path d="M16 14h1"/></svg></span>
        </span>
        <span class="path-body">
          <span class="path-title">See a demo shop</span>
          <span class="path-sub">Explore a sample shop and see how Hisaab turns sales data into clear guidance.</span>
          <span class="path-cta path-cta-secondary">View demo <span aria-hidden="true">→</span></span>
        </span>
      </button>
      <button class="path path-use-data landing-path path-primary" id="path-use-data" type="button" aria-label="Use my sales data">
        <span class="landing-card-visual data-card-visual" aria-hidden="true">
          <span class="landing-icon-orb data-file-mark"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3h8l4 4v14H6z"/><path d="M14 3v5h5"/><path d="M9 12h6M9 16h6M9 8h2"/></svg></span>
        </span>
        <span class="path-body">
          <span class="path-title">Use my sales data</span>
          <span class="path-sub">Upload a sales file or connect a Google Sheet to understand your own numbers.</span>
          <span class="path-cta path-cta-primary">Add my data <span aria-hidden="true">→</span></span>
        </span>
      </button>
    </div>
    <p class="home-note" id="home-note"><span>No sales file yet?</span> <button class="daily-log-link" id="daily-log-link" type="button">Start with a simple daily sales log</button></p>`;

const homeCss = String.raw`
/* Hisaab home screen redesign */
.home-landing .stage{
  justify-content:flex-start;
  align-items:center;
  padding:132px 24px 96px;
}

.home-landing .landing-intro{
  width:100%;
  max-width:860px;
  margin:0 auto 34px;
  text-align:center;
}

.landing-heading{
  margin:0;
  color:var(--ink);
  font-size:clamp(34px, 4.5vw, 52px);
  font-weight:760;
  line-height:1.08;
  letter-spacing:-0.045em;
}

.landing-support{
  max-width:620px;
  margin:14px auto 0;
  color:var(--ink-soft);
  font-size:17px;
  line-height:1.55;
}

.home-landing .path-chooser{
  display:grid;
  grid-template-columns:repeat(2, minmax(0, 1fr));
  gap:24px;
  width:100%;
  max-width:900px;
  margin:0 auto;
}

.home-landing .path{
  min-height:292px;
  display:flex;
  flex-direction:column;
  align-items:center;
  min-width:0;
  padding:30px 30px 28px;
  border:1px solid rgba(13,24,51,0.10);
  border-radius:20px;
  background:rgba(255,255,255,0.82);
  color:inherit;
  text-align:center;
  box-shadow:0 1px 2px rgba(13,24,51,0.03), 0 18px 44px rgba(36,67,126,0.08);
  backdrop-filter:blur(16px);
  transition:border-color .2s ease, background .2s ease, box-shadow .2s ease, transform .2s ease;
}

.home-landing .path:hover{
  transform:translateY(-2px);
  border-color:rgba(53,109,255,0.28);
  background:#fff;
  box-shadow:0 2px 4px rgba(13,24,51,0.04), 0 24px 54px rgba(36,67,126,0.12);
}

.home-landing .path:active{ transform:translateY(0); }

.home-landing .path:focus-visible{
  outline:3px solid rgba(53,109,255,0.22);
  outline-offset:4px;
  border-color:var(--accent);
}

.home-landing .path.active{
  border-color:rgba(13,24,51,0.10);
  background:rgba(255,255,255,0.82);
  box-shadow:0 1px 2px rgba(13,24,51,0.03), 0 18px 44px rgba(36,67,126,0.08);
}

.landing-card-visual{
  display:flex;
  align-items:center;
  justify-content:center;
  width:100%;
  min-height:78px;
  padding:0;
  border-radius:0;
  background:transparent;
  color:var(--accent);
}

.landing-icon-orb,
.demo-shop-mark,
.data-file-mark{
  width:64px;
  height:64px;
  display:grid;
  flex:0 0 auto;
  place-items:center;
  border-radius:50%;
  color:var(--accent);
  background:linear-gradient(180deg, #F8FAFF 0%, #EEF4FF 100%);
  border:1px solid rgba(53,109,255,0.10);
  box-shadow:inset 0 1px 0 rgba(255,255,255,0.95), 0 10px 24px rgba(53,109,255,0.10);
}

.demo-mini-stats,
.data-mini-rows{
  display:none !important;
}

.home-landing .path-body{
  display:flex;
  flex:1;
  flex-direction:column;
  align-items:center;
  min-width:0;
  width:100%;
  margin-top:22px;
}

.home-landing .path-title{
  color:var(--ink);
  font-size:22px;
  font-weight:760;
  line-height:1.18;
  letter-spacing:-0.025em;
}

.home-landing .path-sub{
  max-width:340px;
  min-height:66px;
  margin-top:10px;
  color:var(--ink-soft);
  font-size:15px;
  line-height:1.48;
}

.home-landing .path-helper{
  display:none;
}

.home-landing .path-cta{
  display:inline-flex;
  align-items:center;
  justify-content:center;
  gap:7px;
  min-height:44px;
  margin-top:auto;
  padding:0 18px;
  border-radius:999px;
  font-size:14px;
  font-weight:720;
  line-height:1.2;
  transition:background .18s ease, border-color .18s ease, color .18s ease, transform .18s ease, box-shadow .18s ease;
}

.home-landing .path-cta span{
  transition:transform .18s ease;
}

.home-landing .path:hover .path-cta span{ transform:translateX(3px); }

.home-landing .path-cta-secondary{
  color:var(--accent);
  background:#fff;
  border:1px solid rgba(53,109,255,0.22);
  box-shadow:0 1px 2px rgba(13,24,51,0.03);
}

.home-landing .path-cta-primary{
  color:#fff;
  background:var(--accent);
  border:1px solid var(--accent);
  box-shadow:0 10px 24px rgba(53,109,255,0.22);
}

.home-landing .path:hover .path-cta-secondary{
  border-color:rgba(53,109,255,0.40);
  background:#F8FAFF;
}

.home-landing .path:hover .path-cta-primary{
  background:var(--accent-strong);
  border-color:var(--accent-strong);
  box-shadow:0 12px 28px rgba(53,109,255,0.28);
}

.home-landing .home-note{
  width:fit-content;
  max-width:min(900px, calc(100vw - 48px));
  margin:20px auto 0;
  padding:10px 14px;
  border:1px solid rgba(13,24,51,0.08);
  border-radius:999px;
  background:rgba(255,255,255,0.56);
  color:var(--ink-mute);
  font-size:13.5px;
  line-height:1.35;
  text-align:center;
  backdrop-filter:blur(14px);
}

.daily-log-link{
  appearance:none;
  padding:0;
  border:0;
  color:var(--accent);
  background:none;
  font:inherit;
  font-weight:650;
  text-decoration:none;
  cursor:pointer;
}

.daily-log-link:hover{
  text-decoration:underline;
  text-underline-offset:3px;
}

.daily-log-link:focus-visible{
  outline:2px solid var(--accent);
  outline-offset:4px;
  border-radius:999px;
}

`;

const responsiveMarker = '/* Hisaab home responsive polish */';
const responsiveCss = String.raw`
${responsiveMarker}
@media (max-width:680px){
  .home-landing .stage{
    align-items:center;
    padding:104px 16px 56px;
  }

  .home-landing .landing-intro{
    margin-bottom:28px;
  }

  .landing-heading{ font-size:32px; }
  .landing-support{ font-size:15px; }

  .home-landing .path-chooser{
    grid-template-columns:1fr;
    gap:14px;
    max-width:520px;
  }

  .home-landing .path{
    min-height:270px;
    padding:24px 20px 22px;
  }

  .home-landing .path-sub{
    min-height:0;
  }

  .home-landing .home-note{
    width:auto;
    max-width:520px;
    border-radius:18px;
    font-size:12.5px;
  }
}
`;

function read(file) {
  return fs.readFileSync(file, 'utf8');
}

function write(file, content) {
  fs.writeFileSync(file, content, 'utf8');
}

function patchIndex(html) {
  if (html.includes('path-cta-primary') && html.includes('landing-icon-orb')) return html;

  const pattern = /    <div class="path-chooser" id="path-chooser">[\s\S]*?    <p class="home-note" id="home-note">[\s\S]*?<\/p>/;
  if (!pattern.test(html)) {
    throw new Error('Could not find landing cards and home note block.');
  }
  return html.replace(pattern, homeMarkup);
}

function patchStyle(css) {
  const start = css.indexOf('.home-landing .stage{');
  const end = css.indexOf('/* The landing state is intentionally a two-choice screen.', start);
  if (start === -1 || end === -1) {
    throw new Error('Could not find landing CSS section.');
  }
  css = css.slice(0, start) + homeCss + css.slice(end);

  const responsiveStart = css.indexOf(responsiveMarker);
  if (responsiveStart !== -1) {
    css = css.slice(0, responsiveStart).trimEnd() + '\n';
  }
  return css.trimEnd() + '\n\n' + responsiveCss + '\n';
}

function main() {
  write(files.index, patchIndex(read(files.index)));
  write(files.style, patchStyle(read(files.style)));
}

if (require.main === module) main();
module.exports = { patchIndex, patchStyle };
