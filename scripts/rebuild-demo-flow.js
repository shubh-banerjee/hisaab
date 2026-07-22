const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const files = {
  index: path.join(root, 'public', 'index.html'),
  script: path.join(root, 'public', 'script.js'),
  style: path.join(root, 'public', 'style.css'),
};

const demoMarkup = String.raw`    <section class="demo-intro demo-lesson" id="demo-intro" hidden aria-live="polite" aria-label="Hisaab demo lesson">
      <button class="demo-close" id="demo-intro-home" type="button" aria-label="Exit demo">×</button>

      <div class="demo-lesson-frame">
        <div class="demo-progress" aria-label="Demo progress">
          <span id="demo-progress-label">Step 1 of 4</span>
          <span class="demo-progress-dots" aria-hidden="true"><i></i><i></i><i></i><i></i></span>
        </div>

        <section class="demo-step demo-step-hero" id="demo-step-intro">
          <div class="demo-step-content demo-two-column">
            <div class="demo-lesson-visual" aria-hidden="true">
              <span class="demo-shop-icon"><svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 10h16v9H4z"/><path d="M3 10l2-5h14l2 5"/><path d="M8 19v-5h4v5"/><path d="M16 14h1"/></svg></span>
            </div>
            <div class="demo-copy-stack">
              <div class="demo-eyebrow">Demo shop</div>
              <h2>Meet a small food stall</h2>
              <p>This example shows how Hisaab reads everyday sales data and explains one useful next step in plain language.</p>
              <div class="demo-simple-points" aria-label="What this demo includes">
                <span>Orders</span>
                <span>Sales</span>
                <span>Delivery fee</span>
                <span>Discounts</span>
                <span>Repeat customers</span>
              </div>
            </div>
          </div>
          <div class="demo-frame-footer">
            <span></span>
            <button class="cta-primary demo-frame-primary" id="demo-start" type="button">Start demo</button>
          </div>
        </section>

        <section class="demo-step" id="demo-step-found" hidden>
          <div class="demo-step-content">
            <div class="demo-eyebrow">What Hisaab checks first</div>
            <h2>Hisaab checks what the shop data can safely explain</h2>
            <p>Before answering, it looks for simple business signals a shop owner already understands.</p>
            <div class="demo-found-list">
              <div><strong>Orders</strong><span>Are more people ordering, fewer people ordering, or is it mostly stable?</span></div>
              <div><strong>Sales</strong><span>Is the shop making more money, or only getting more small orders?</span></div>
              <div><strong>Delivery fee</strong><span>Did order volume change when delivery fee changed?</span></div>
              <div><strong>Customers</strong><span>Are people coming back again or mostly ordering once?</span></div>
            </div>
            <p class="demo-example-note">This is demo data only. With your data, Hisaab will only answer what your file or Sheet supports.</p>
          </div>
          <div class="demo-frame-footer">
            <button class="cta-secondary demo-frame-secondary" id="demo-found-home" type="button">Go back</button>
            <button class="cta-primary demo-frame-primary" id="demo-to-questions" type="button">Continue</button>
          </div>
        </section>

        <section class="demo-step" id="demo-step-questions" hidden>
          <div class="demo-step-content">
            <div class="demo-eyebrow">Choose one question</div>
            <h2>Pick what the shop owner wants to understand</h2>
            <p>These questions are written like a real owner would ask, not like an analytics dashboard.</p>
            <div class="demo-question-list">
              <button class="demo-question" type="button" data-demo-question="trend">
                <strong>Are orders going up or down?</strong>
                <span>Check whether the shop is growing, slowing, or just having a normal month.</span>
              </button>
              <button class="demo-question" type="button" data-demo-question="delivery">
                <strong>Should this shop increase delivery fee?</strong>
                <span>See whether a higher delivery fee may reduce orders.</span>
              </button>
              <button class="demo-question" type="button" data-demo-question="discount">
                <strong>Did discounts actually help?</strong>
                <span>Compare offer days with normal days before repeating the offer.</span>
              </button>
              <button class="demo-question" type="button" data-demo-question="repeat">
                <strong>Are customers coming back?</strong>
                <span>Understand whether the shop is getting repeat orders.</span>
              </button>
            </div>
          </div>
          <div class="demo-frame-footer">
            <button class="cta-secondary demo-frame-secondary" id="demo-questions-home" type="button">Go back</button>
            <span class="demo-footer-hint">Choose a question to continue</span>
          </div>
        </section>

        <section class="demo-step demo-result-step" id="demo-step-result" hidden>
          <div class="demo-step-content">
            <div class="demo-eyebrow">Demo answer</div>
            <h2 id="demo-result-title">Answer</h2>
            <div class="demo-result-grid">
              <div class="demo-result-section demo-answer-block">
                <h3>Answer</h3>
                <p id="demo-result-answer"></p>
              </div>
              <div class="demo-result-section">
                <h3>Why?</h3>
                <p id="demo-result-why"></p>
              </div>
              <div class="demo-result-section">
                <h3>Try this</h3>
                <p id="demo-result-action"></p>
              </div>
              <div class="demo-result-section">
                <h3>How sure is this?</h3>
                <p id="demo-result-strength"></p>
              </div>
            </div>
            <p class="demo-example-note">Demo example · Not your business data</p>
          </div>
          <div class="demo-frame-footer">
            <button class="cta-secondary demo-frame-secondary" id="demo-result-home" type="button">Go back</button>
            <button class="cta-primary demo-frame-primary" id="demo-result-upload" type="button">Use my data</button>
          </div>
        </section>
      </div>
    </section>`;

const demoCss = String.raw`
/* Outlined demo lesson flow */
body.view-demo-intro .brand,
body.view-demo-found-data .brand,
body.view-demo-questions .brand,
body.view-demo-result .brand,
body.view-demo-intro .top-actions,
body.view-demo-found-data .top-actions,
body.view-demo-questions .top-actions,
body.view-demo-result .top-actions{
  display:none !important;
}

body.view-demo-intro .stage,
body.view-demo-found-data .stage,
body.view-demo-questions .stage,
body.view-demo-result .stage{
  min-height:100vh;
  justify-content:center;
  align-items:center;
  padding:72px 24px;
}

body.view-demo-intro .landing-intro,
body.view-demo-found-data .landing-intro,
body.view-demo-questions .landing-intro,
body.view-demo-result .landing-intro,
body.view-demo-intro #path-chooser,
body.view-demo-found-data #path-chooser,
body.view-demo-questions #path-chooser,
body.view-demo-result #path-chooser,
body.view-demo-intro #home-note,
body.view-demo-found-data #home-note,
body.view-demo-questions #home-note,
body.view-demo-result #home-note{
  display:none !important;
}

.demo-intro.demo-lesson{
  position:relative;
  width:100%;
  max-width:860px;
  margin:0 auto;
  padding:0;
  border:0;
  border-radius:0;
  background:transparent;
  box-shadow:none;
  animation:slideIn .18s ease;
  text-align:left;
}

.demo-close{
  position:fixed;
  left:28px;
  top:28px;
  width:44px;
  height:44px;
  display:grid;
  place-items:center;
  border:0;
  border-radius:50%;
  background:transparent;
  color:var(--ink-mute);
  font-size:34px;
  line-height:1;
  cursor:pointer;
  z-index:20;
}

.demo-close:hover{
  color:var(--ink);
  background:rgba(13,24,51,0.05);
}

.demo-lesson-frame{
  width:100%;
  min-height:560px;
  display:flex;
  flex-direction:column;
  border:1.5px solid rgba(13,24,51,0.16);
  border-radius:28px;
  background:rgba(255,255,255,0.18);
  overflow:hidden;
}

.demo-intro.demo-lesson .demo-progress{
  min-height:72px;
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:16px;
  padding:0 48px;
  border-bottom:1px solid rgba(13,24,51,0.10);
  color:var(--ink-mute);
  font-size:11px;
  font-weight:780;
  letter-spacing:.08em;
  text-transform:uppercase;
}

.demo-intro.demo-lesson .demo-progress-dots{
  display:flex;
  gap:8px;
}

.demo-intro.demo-lesson .demo-progress-dots i{
  width:28px;
  height:4px;
  border-radius:999px;
  background:rgba(13,24,51,0.12);
}

.demo-intro.demo-lesson .demo-progress-dots i.active{
  background:var(--accent);
}

.demo-intro.demo-lesson .demo-step{
  flex:1;
  min-height:488px;
  display:flex;
  flex-direction:column;
}

.demo-step-content{
  flex:1;
  width:100%;
  padding:56px 64px 36px;
}

.demo-two-column{
  display:grid;
  grid-template-columns:112px minmax(0, 1fr);
  gap:32px;
  align-items:start;
}

.demo-lesson-visual{
  padding-top:4px;
}

.demo-shop-icon{
  width:88px;
  height:88px;
  display:grid;
  place-items:center;
  border-radius:28px;
  color:var(--accent);
  background:rgba(53,109,255,0.08);
  border:1px solid rgba(53,109,255,0.14);
}

.demo-copy-stack{ min-width:0; }

.demo-intro.demo-lesson .demo-eyebrow{
  margin-bottom:12px;
  color:var(--accent);
  font-size:11px;
  font-weight:820;
  letter-spacing:.10em;
  text-transform:uppercase;
}

.demo-intro.demo-lesson .demo-step h2{
  max-width:650px;
  margin:0;
  color:var(--ink);
  font-size:clamp(31px, 4vw, 42px);
  font-weight:760;
  letter-spacing:-.045em;
  line-height:1.08;
}

.demo-intro.demo-lesson .demo-step>p,
.demo-copy-stack p,
.demo-step-content>p{
  max-width:610px;
  margin:14px 0 0;
  color:var(--ink-soft);
  font-size:17px;
  line-height:1.55;
}

.demo-simple-points{
  display:flex;
  flex-wrap:wrap;
  gap:9px;
  margin-top:24px;
}

.demo-simple-points span{
  padding:8px 11px;
  border:1px solid rgba(13,24,51,0.12);
  border-radius:999px;
  color:var(--ink-soft);
  background:transparent;
  font-size:13px;
  line-height:1.2;
}

.demo-frame-footer{
  min-height:86px;
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:16px;
  padding:18px 48px;
  border-top:1px solid rgba(13,24,51,0.10);
}

.demo-frame-primary,
.demo-frame-secondary{
  min-width:148px;
  min-height:48px;
  border-radius:16px;
  box-shadow:none;
}

.demo-frame-primary{
  background:var(--accent);
  color:#fff;
}

.demo-frame-primary:hover{
  background:var(--accent-strong);
}

.demo-frame-secondary{
  background:transparent;
  color:var(--ink-soft);
  border:1px solid rgba(13,24,51,0.16);
}

.demo-frame-secondary:hover{
  border-color:var(--accent);
  color:var(--accent);
  background:rgba(53,109,255,0.05);
}

.demo-footer-hint{
  color:var(--ink-mute);
  font-size:13px;
}

.demo-intro.demo-lesson .demo-found-list{
  display:grid;
  grid-template-columns:repeat(2, minmax(0, 1fr));
  gap:12px;
  margin:28px 0 0;
  padding:0;
  list-style:none;
}

.demo-intro.demo-lesson .demo-found-list div{
  min-height:112px;
  padding:18px;
  border:1px solid rgba(13,24,51,0.13);
  border-radius:18px;
  background:transparent;
}

.demo-intro.demo-lesson .demo-found-list strong{
  display:block;
  color:var(--ink);
  font-size:15px;
  line-height:1.3;
}

.demo-intro.demo-lesson .demo-found-list span{
  display:block;
  margin-top:7px;
  color:var(--ink-soft);
  font-size:13px;
  line-height:1.45;
}

.demo-intro.demo-lesson .demo-example-note{
  max-width:610px;
  margin-top:18px !important;
  color:var(--ink-mute) !important;
  font-size:13px !important;
  font-style:normal;
}

.demo-intro.demo-lesson .demo-question-list{
  display:grid;
  grid-template-columns:1fr;
  gap:13px;
  margin-top:28px;
}

.demo-intro.demo-lesson .demo-question{
  min-height:78px;
  padding:18px 20px;
  border:1.5px solid rgba(13,24,51,0.15);
  border-radius:17px;
  background:transparent;
  color:var(--ink);
  text-align:left;
  box-shadow:none;
  transition:border-color .16s ease, background .16s ease, transform .16s ease;
}

.demo-intro.demo-lesson .demo-question:hover{
  border-color:var(--accent);
  background:rgba(53,109,255,0.05);
  transform:translateY(-1px);
}

.demo-intro.demo-lesson .demo-question strong,
.demo-intro.demo-lesson .demo-question span{
  display:block;
}

.demo-intro.demo-lesson .demo-question strong{
  color:var(--ink);
  font-size:15px;
  font-weight:720;
  line-height:1.35;
}

.demo-intro.demo-lesson .demo-question span{
  margin-top:6px;
  color:var(--ink-mute);
  font-size:13px;
  line-height:1.4;
}

.demo-result-grid{
  display:grid;
  grid-template-columns:repeat(2, minmax(0, 1fr));
  gap:12px;
  margin-top:28px;
}

.demo-result-section{
  min-height:112px;
  margin:0;
  padding:18px;
  border:1px solid rgba(13,24,51,0.13);
  border-radius:18px;
  background:transparent;
}

.demo-result-section h3{
  margin:0 0 7px;
  color:var(--ink);
  font-size:13px;
  font-weight:780;
}

.demo-result-section p{
  margin:0;
  color:var(--ink-soft);
  font-size:13.5px;
  line-height:1.5;
}

.demo-answer-block{
  border-color:rgba(53,109,255,0.26);
  background:rgba(53,109,255,0.04);
}

.demo-result-actions-row,
.demo-result-details,
.demo-text-link,
.demo-result-buttons,
.demo-result-actions{
  display:none !important;
}

@media (max-width:760px){
  body.view-demo-intro .stage,
  body.view-demo-found-data .stage,
  body.view-demo-questions .stage,
  body.view-demo-result .stage{
    padding:76px 16px 32px;
    justify-content:flex-start;
  }

  .demo-close{
    left:14px;
    top:18px;
  }

  .demo-lesson-frame{
    min-height:auto;
    border-radius:22px;
  }

  .demo-intro.demo-lesson .demo-progress,
  .demo-frame-footer{
    padding-left:20px;
    padding-right:20px;
  }

  .demo-step-content{
    padding:32px 20px 28px;
  }

  .demo-two-column{
    grid-template-columns:1fr;
    gap:20px;
  }

  .demo-shop-icon{
    width:72px;
    height:72px;
    border-radius:24px;
  }

  .demo-intro.demo-lesson .demo-step h2{
    font-size:30px;
  }

  .demo-intro.demo-lesson .demo-step>p,
  .demo-copy-stack p,
  .demo-step-content>p{
    font-size:15px;
  }

  .demo-intro.demo-lesson .demo-found-list,
  .demo-result-grid{
    grid-template-columns:1fr;
  }

  .demo-frame-footer{
    flex-wrap:wrap;
  }

  .demo-frame-primary,
  .demo-frame-secondary{
    min-width:132px;
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
  const pattern = /    <section class="demo-intro[\s\S]*?    <section class="data-options data-source-flow"/;
  if (!pattern.test(html)) {
    throw new Error('Could not find demo flow block.');
  }
  return html.replace(pattern, `${demoMarkup}\n\n    <section class="data-options data-source-flow"`);
}

function patchScript(js) {
  return js
    .replace("if (demoFoundHome) demoFoundHome.addEventListener('click', resetToLanding);", "if (demoFoundHome) demoFoundHome.addEventListener('click', () => setDemoStep('intro'));" )
    .replace("if (demoQuestionsHome) demoQuestionsHome.addEventListener('click', resetToLanding);", "if (demoQuestionsHome) demoQuestionsHome.addEventListener('click', () => setDemoStep('foundData'));" )
    .replace("if (demoResultHome) demoResultHome.addEventListener('click', resetToLanding);", "if (demoResultHome) demoResultHome.addEventListener('click', () => setDemoStep('chooseQuestion'));" );
}

function removeExistingDemoCss(css) {
  const start = css.indexOf('/* Full-page demo lesson flow */');
  if (start !== -1) {
    const end = css.indexOf('.data-options .path:focus-visible', start);
    if (end !== -1) css = css.slice(0, start) + css.slice(end);
  }
  const nextStart = css.indexOf('/* Outlined demo lesson flow */');
  if (nextStart !== -1) {
    const end = css.indexOf('.data-options .path:focus-visible', nextStart);
    if (end !== -1) css = css.slice(0, nextStart) + css.slice(end);
    else css = css.slice(0, nextStart).trimEnd() + '\n';
  }
  return css;
}

function patchStyle(css) {
  css = removeExistingDemoCss(css);
  const anchor = '.data-options .path:focus-visible';
  const index = css.indexOf(anchor);
  if (index === -1) return `${css.trimEnd()}\n\n${demoCss}\n`;
  return `${css.slice(0, index).trimEnd()}\n${demoCss}\n${css.slice(index)}`;
}

function main() {
  write(files.index, patchIndex(read(files.index)));
  write(files.script, patchScript(read(files.script)));
  write(files.style, patchStyle(read(files.style)));
}

if (require.main === module) main();
module.exports = { patchIndex, patchScript, patchStyle };
