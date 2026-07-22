const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const files = {
  index: path.join(root, 'public', 'index.html'),
  style: path.join(root, 'public', 'style.css'),
};

const demoMarkup = String.raw`    <section class="demo-intro demo-lesson" id="demo-intro" hidden aria-live="polite">
      <button class="demo-close" id="demo-intro-home" type="button" aria-label="Exit demo">×</button>

      <div class="demo-progress" aria-label="Demo progress">
        <span id="demo-progress-label">Step 1 of 4</span>
        <span class="demo-progress-dots" aria-hidden="true"><i></i><i></i><i></i><i></i></span>
      </div>

      <section class="demo-step demo-step-hero" id="demo-step-intro">
        <div class="demo-lesson-visual" aria-hidden="true">
          <span class="demo-shop-icon"><svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 10h16v9H4z"/><path d="M3 10l2-5h14l2 5"/><path d="M8 19v-5h4v5"/><path d="M16 14h1"/></svg></span>
        </div>
        <div class="demo-copy-stack">
          <div class="demo-eyebrow">Demo shop</div>
          <h2>Meet a small food stall</h2>
          <p>This example shows how Hisaab reads simple sales data and turns it into a clear next step.</p>
          <div class="demo-simple-points" aria-label="What this demo includes">
            <span>Orders</span>
            <span>Sales</span>
            <span>Delivery fee</span>
            <span>Discounts</span>
            <span>Repeat customers</span>
          </div>
        </div>
        <button class="cta-primary demo-footer-primary" id="demo-start" type="button">Start demo</button>
      </section>

      <section class="demo-step" id="demo-step-found" hidden>
        <div class="demo-eyebrow">What Hisaab found</div>
        <h2>Hisaab found the basic business signals</h2>
        <p>Instead of showing a dashboard, Hisaab first checks which parts of the shop data can be trusted.</p>
        <div class="demo-found-list">
          <div><strong>Orders</strong><span>How many orders came in each day or month.</span></div>
          <div><strong>Sales</strong><span>How much money those orders created.</span></div>
          <div><strong>Delivery fee</strong><span>Whether fee changes moved with order changes.</span></div>
          <div><strong>Customers</strong><span>Whether people are coming back again.</span></div>
        </div>
        <p class="demo-example-note">This is example data only. Your answers will depend on your uploaded file or Sheet.</p>
        <button class="cta-primary demo-footer-primary" id="demo-to-questions" type="button">Continue</button>
      </section>

      <section class="demo-step" id="demo-step-questions" hidden>
        <div class="demo-eyebrow">Choose a question</div>
        <h2>Pick what the shop owner wants to understand</h2>
        <p>These are written like real questions a small business owner may ask, not analytics terms.</p>
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
      </section>

      <section class="demo-step demo-result-step" id="demo-step-result" hidden>
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
        <div class="demo-step-actions demo-result-actions-row">
          <button class="cta-secondary" id="demo-result-another" type="button">Try another question</button>
          <button class="cta-primary" id="demo-result-upload" type="button">Use my data</button>
        </div>
        <button class="demo-text-link" id="demo-result-home" type="button">Exit demo</button>
      </section>
    </section>`;

const demoCss = String.raw`
/* Full-page demo lesson flow */
body.view-demoIntro .stage,
body.view-demoFoundData .stage,
body.view-demoChooseQuestion .stage,
body.view-demoResult .stage{
  min-height:calc(100vh - 76px);
  justify-content:flex-start;
  align-items:center;
  padding:84px 24px 124px;
}

body.view-demoIntro .landing-intro,
body.view-demoFoundData .landing-intro,
body.view-demoChooseQuestion .landing-intro,
body.view-demoResult .landing-intro{
  display:none !important;
}

.demo-intro.demo-lesson{
  position:relative;
  width:100%;
  max-width:860px;
  min-height:520px;
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
  left:30px;
  top:96px;
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

.demo-intro.demo-lesson .demo-progress{
  width:100%;
  max-width:620px;
  margin:0 auto 42px;
  display:flex;
  align-items:center;
  justify-content:space-between;
  color:var(--ink-mute);
  font-size:11px;
  font-weight:760;
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
  background:rgba(13,24,51,0.10);
}

.demo-intro.demo-lesson .demo-progress-dots i.active{
  background:var(--accent);
}

.demo-intro.demo-lesson .demo-step{
  width:100%;
  max-width:620px;
  min-height:390px;
  margin:0 auto;
  position:relative;
  padding-bottom:84px;
}

.demo-step-hero{
  display:grid;
  grid-template-columns:104px minmax(0, 1fr);
  gap:28px;
  align-items:start;
}

.demo-lesson-visual{
  padding-top:6px;
}

.demo-shop-icon{
  width:84px;
  height:84px;
  display:grid;
  place-items:center;
  border-radius:28px;
  color:var(--accent);
  background:rgba(53,109,255,0.08);
  border:1px solid rgba(53,109,255,0.14);
}

.demo-copy-stack{
  min-width:0;
}

.demo-intro.demo-lesson .demo-eyebrow{
  margin-bottom:12px;
  color:var(--accent);
  font-size:11px;
  font-weight:820;
  letter-spacing:.10em;
  text-transform:uppercase;
}

.demo-intro.demo-lesson .demo-step h2{
  max-width:620px;
  margin:0;
  color:var(--ink);
  font-size:clamp(31px, 4vw, 42px);
  font-weight:760;
  letter-spacing:-.045em;
  line-height:1.08;
}

.demo-intro.demo-lesson .demo-step>p,
.demo-copy-stack p{
  max-width:560px;
  margin:14px 0 0;
  color:var(--ink-soft);
  font-size:17px;
  line-height:1.55;
}

.demo-simple-points{
  display:flex;
  flex-wrap:wrap;
  gap:9px;
  margin-top:22px;
}

.demo-simple-points span{
  padding:8px 11px;
  border:1px solid rgba(13,24,51,0.12);
  border-radius:999px;
  color:var(--ink-soft);
  background:rgba(255,255,255,0.30);
  font-size:13px;
  line-height:1.2;
}

.demo-footer-primary{
  position:fixed;
  right:clamp(72px, 13vw, 220px);
  bottom:50px;
  min-width:148px;
  min-height:48px;
  border-radius:16px;
  background:var(--accent);
  color:#fff;
  box-shadow:none;
}

.demo-footer-primary:hover{
  background:var(--accent-strong);
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
  min-height:96px;
  padding:18px;
  border:1px solid rgba(13,24,51,0.13);
  border-radius:18px;
  background:rgba(255,255,255,0.22);
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
  max-width:560px;
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
  border:2px solid rgba(13,24,51,0.14);
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
  font-size:16px;
  font-weight:760;
  line-height:1.35;
}

.demo-intro.demo-lesson .demo-question span{
  margin-top:6px;
  color:var(--ink-soft);
  font-size:13px;
  line-height:1.45;
}

.demo-result-grid{
  display:grid;
  grid-template-columns:repeat(2, minmax(0, 1fr));
  gap:14px;
  margin-top:28px;
}

.demo-intro.demo-lesson .demo-result-section{
  margin:0;
  padding:18px;
  border:1px solid rgba(13,24,51,0.12);
  border-radius:18px;
  background:rgba(255,255,255,0.24);
}

.demo-intro.demo-lesson .demo-result-section h3{
  margin:0 0 7px;
  color:var(--ink-mute);
  font-size:11px;
  font-weight:800;
  letter-spacing:.08em;
  text-transform:uppercase;
}

.demo-intro.demo-lesson .demo-result-section p{
  margin:0;
  color:var(--ink-soft);
  font-size:14px;
  line-height:1.52;
}

.demo-answer-block{
  grid-column:1 / -1;
}

.demo-intro.demo-lesson .demo-result-actions-row{
  display:flex;
  justify-content:flex-start;
  gap:10px;
  margin-top:24px;
}

.demo-intro.demo-lesson .demo-text-link,
.demo-intro.demo-lesson #demo-intro-home,
.demo-intro.demo-lesson #demo-found-home,
.demo-intro.demo-lesson #demo-questions-home{
  display:none !important;
}

@media (max-width:760px){
  body.view-demoIntro .stage,
  body.view-demoFoundData .stage,
  body.view-demoChooseQuestion .stage,
  body.view-demoResult .stage{
    padding:86px 18px 120px;
  }

  .demo-close{
    left:18px;
    top:84px;
  }

  .demo-intro.demo-lesson .demo-progress,
  .demo-intro.demo-lesson .demo-step{
    max-width:100%;
  }

  .demo-step-hero{
    grid-template-columns:1fr;
    gap:20px;
  }

  .demo-intro.demo-lesson .demo-found-list,
  .demo-result-grid{
    grid-template-columns:1fr;
  }

  .demo-footer-primary{
    right:24px;
    bottom:36px;
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
  if (html.includes('demo-intro demo-lesson')) return html;
  const pattern = /    <section class="demo-intro" id="demo-intro" hidden aria-live="polite">[\s\S]*?    <\/section>\n\n    <section class="data-options/;
  if (!pattern.test(html)) throw new Error('Could not find demo flow block.');
  return html.replace(pattern, `${demoMarkup}\n\n    <section class="data-options`);
}

function patchStyle(css) {
  const marker = '/* Full-page demo lesson flow */';
  const existing = css.indexOf(marker);
  if (existing !== -1) css = css.slice(0, existing).trimEnd() + '\n';
  return `${css.trimEnd()}\n\n${demoCss}\n`;
}

function main() {
  write(files.index, patchIndex(read(files.index)));
  write(files.style, patchStyle(read(files.style)));
}

if (require.main === module) main();
module.exports = { patchIndex, patchStyle };
