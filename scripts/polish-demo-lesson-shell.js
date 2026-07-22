const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const indexPath = path.join(root, 'public', 'index.html');
const stylePath = path.join(root, 'public', 'style.css');
const scriptPath = path.join(root, 'public', 'script.js');

const demoMarkup = `    <section class="demo-intro demo-lesson" id="demo-intro" hidden aria-live="polite">
      <button class="demo-close" id="demo-intro-home" type="button" aria-label="Exit demo">×</button>
      <div class="demo-lesson-frame" aria-label="Hisaab demo lesson">
        <div class="demo-frame-progress" aria-label="Demo progress">
          <span id="demo-progress-label">Step 1 of 4</span>
          <span class="demo-progress-dots" aria-hidden="true"><i></i><i></i><i></i><i></i></span>
        </div>

        <section class="demo-step demo-step-intro" id="demo-step-intro">
          <div class="demo-step-content demo-step-content-narrow">
            <div class="demo-eyebrow">Demo shop</div>
            <h2>Meet a small food stall</h2>
            <p>This example shows how Hisaab reads everyday sales data and explains one useful next step in plain language.</p>
            <div class="demo-simple-points" aria-label="What this demo includes">
              <span>Orders</span><span>Sales</span><span>Delivery fee</span><span>Discounts</span><span>Repeat customers</span>
            </div>
          </div>
          <div class="demo-step-footer demo-step-footer-end">
            <button class="cta-primary demo-nav-primary" id="demo-start" type="button">Start demo</button>
          </div>
        </section>

        <section class="demo-step" id="demo-step-found" hidden>
          <div class="demo-step-content">
            <div class="demo-eyebrow">What Hisaab checks</div>
            <h2>First, Hisaab checks what data can be trusted</h2>
            <p>Before answering, Hisaab looks for the basic signals a shop owner actually understands.</p>
            <div class="demo-found-list">
              <div><strong>Orders</strong><span>How many orders came in over time.</span></div>
              <div><strong>Sales</strong><span>Whether orders are creating more or less money.</span></div>
              <div><strong>Delivery fee</strong><span>Whether fee changes moved with order changes.</span></div>
              <div><strong>Customers</strong><span>Whether people are coming back again.</span></div>
            </div>
            <p class="demo-example-note">This is example data only. With your data, Hisaab will only answer what your file or Sheet can support.</p>
          </div>
          <div class="demo-step-footer">
            <button class="demo-nav-secondary" id="demo-found-home" type="button">Go back</button>
            <button class="cta-primary demo-nav-primary" id="demo-to-questions" type="button">Continue</button>
          </div>
        </section>

        <section class="demo-step" id="demo-step-questions" hidden>
          <div class="demo-step-content">
            <div class="demo-eyebrow">Choose a question</div>
            <h2>Pick what the shop owner wants to understand</h2>
            <p>These are written like real questions, not analytics terms.</p>
            <div class="demo-question-list">
              <button class="demo-question" type="button" data-demo-question="trend"><strong>Are orders going up or down?</strong><span>Check whether the shop is growing, slowing, or just having a normal month.</span></button>
              <button class="demo-question" type="button" data-demo-question="delivery"><strong>Should this shop increase delivery fee?</strong><span>See whether a higher delivery fee may reduce orders.</span></button>
              <button class="demo-question" type="button" data-demo-question="discount"><strong>Did discounts actually help?</strong><span>Compare offer days with normal days before repeating the offer.</span></button>
              <button class="demo-question" type="button" data-demo-question="repeat"><strong>Are customers coming back?</strong><span>Understand whether the shop is getting repeat orders.</span></button>
            </div>
          </div>
          <div class="demo-step-footer">
            <button class="demo-nav-secondary" id="demo-questions-home" type="button">Go back</button>
          </div>
        </section>

        <section class="demo-step demo-result-step" id="demo-step-result" hidden>
          <div class="demo-step-content">
            <div class="demo-eyebrow">Demo answer</div>
            <h2 id="demo-result-title">Answer</h2>
            <div class="demo-result-grid">
              <div class="demo-result-section demo-answer-block"><h3>Answer</h3><p id="demo-result-answer"></p></div>
              <div class="demo-result-section"><h3>Why?</h3><p id="demo-result-why"></p></div>
              <div class="demo-result-section"><h3>Try this</h3><p id="demo-result-action"></p></div>
              <div class="demo-result-section"><h3>How sure is this?</h3><p id="demo-result-strength"></p></div>
            </div>
            <p class="demo-example-note">Demo example · Not your business data</p>
          </div>
          <div class="demo-step-footer">
            <button class="demo-nav-secondary" id="demo-result-home" type="button">Go back</button>
            <div class="demo-result-actions-row">
              <button class="demo-nav-secondary" id="demo-result-another" type="button">Try another question</button>
              <button class="cta-primary demo-nav-primary" id="demo-result-upload" type="button">Use my data</button>
            </div>
          </div>
        </section>
      </div>
    </section>`;

const css = `
/* Hisaab demo lesson v3 */
body.view-demo-intro .brand,body.view-demo-found-data .brand,body.view-demo-questions .brand,body.view-demo-result .brand,body.view-demo-intro .top-actions,body.view-demo-found-data .top-actions,body.view-demo-questions .top-actions,body.view-demo-result .top-actions{display:none!important;}
body.view-demo-intro .stage,body.view-demo-found-data .stage,body.view-demo-questions .stage,body.view-demo-result .stage{min-height:100svh;justify-content:center;align-items:center;padding:72px 24px 56px;}
body.view-demo-intro .landing-intro,body.view-demo-found-data .landing-intro,body.view-demo-questions .landing-intro,body.view-demo-result .landing-intro{display:none!important;}
.demo-intro.demo-lesson{position:relative;width:100%;max-width:980px;margin:0 auto;padding:0;border:0;border-radius:0;background:transparent;box-shadow:none;text-align:left;animation:slideIn .16s ease;}
.demo-close{position:fixed;left:28px;top:28px;z-index:1000;width:44px;height:44px;display:grid;place-items:center;border:0;border-radius:50%;background:transparent;color:var(--ink-mute);font-size:34px;line-height:1;cursor:pointer;transition:color .16s ease,background .16s ease;}
.demo-close:hover,.demo-close:focus-visible{color:var(--ink);background:rgba(13,24,51,.06);outline:none;}
.demo-lesson-frame{width:min(980px,calc(100vw - 64px));min-height:640px;display:flex;flex-direction:column;overflow:hidden;border:1.5px solid rgba(13,24,51,.15);border-radius:24px;background:rgba(255,255,255,.16);box-shadow:none;}
.demo-frame-progress{height:76px;display:flex;align-items:center;justify-content:space-between;gap:18px;padding:0 58px;border-bottom:1px solid rgba(13,24,51,.10);color:var(--ink-mute);font-size:11px;font-weight:780;letter-spacing:.08em;text-transform:uppercase;}
.demo-progress-dots{display:flex;gap:8px;}.demo-progress-dots i{width:30px;height:4px;border-radius:999px;background:rgba(13,24,51,.10);}.demo-progress-dots i.active{background:var(--accent);}
.demo-lesson-frame .demo-step{flex:1;min-height:564px;display:flex;flex-direction:column;}.demo-lesson-frame .demo-step[hidden]{display:none!important;}
.demo-step-content{flex:1;display:flex;flex-direction:column;justify-content:center;padding:54px 72px 46px;}.demo-step-content-narrow{max-width:700px;align-self:center;width:100%;}
.demo-lesson .demo-eyebrow{margin-bottom:12px;color:var(--accent);font-size:11px;font-weight:820;letter-spacing:.10em;text-transform:uppercase;}
.demo-lesson .demo-step h2{max-width:760px;margin:0;color:var(--ink);font-size:clamp(34px,4vw,46px);font-weight:760;letter-spacing:-.045em;line-height:1.08;}
.demo-lesson .demo-step p{max-width:650px;margin:16px 0 0;color:var(--ink-soft);font-size:17px;line-height:1.56;}
.demo-simple-points{display:flex;flex-wrap:wrap;gap:9px;margin-top:26px;}.demo-simple-points span{padding:8px 12px;border:1px solid rgba(13,24,51,.14);border-radius:999px;color:var(--ink-soft);background:transparent;font-size:13px;line-height:1.2;}
.demo-found-list{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px;margin:30px 0 0;padding:0;list-style:none;}.demo-found-list div,.demo-result-section{border:1px solid rgba(13,24,51,.13);border-radius:18px;background:transparent;}.demo-found-list div{min-height:104px;padding:18px;}.demo-found-list strong{display:block;color:var(--ink);font-size:15px;line-height:1.3;}.demo-found-list span{display:block;margin-top:8px;color:var(--ink-soft);font-size:13px;line-height:1.45;}
.demo-example-note{color:var(--ink-mute)!important;font-size:13px!important;font-style:normal!important;}
.demo-question-list{display:grid;grid-template-columns:1fr;gap:13px;margin-top:30px;}.demo-question{min-height:80px;padding:18px 20px;border:1.5px solid rgba(13,24,51,.15);border-radius:17px;background:transparent;color:var(--ink);text-align:left;box-shadow:none;transition:border-color .16s ease,background .16s ease,transform .16s ease;}.demo-question:hover,.demo-question:focus-visible{border-color:var(--accent);background:rgba(53,109,255,.05);transform:translateY(-1px);outline:none;}.demo-question strong,.demo-question span{display:block;}.demo-question strong{color:var(--ink);font-size:15px;font-weight:720;line-height:1.35;}.demo-question span{margin-top:6px;color:var(--ink-soft);font-size:13px;line-height:1.42;}
.demo-result-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px;margin-top:28px;}.demo-result-section{margin:0;padding:18px;}.demo-result-section h3{margin:0 0 7px;color:var(--ink);font-size:13px;font-weight:780;}.demo-result-section p{margin:0;color:var(--ink-soft);font-size:14px;line-height:1.5;}.demo-answer-block{grid-column:1/-1;}
.demo-step-footer{min-height:86px;display:flex;align-items:center;justify-content:space-between;gap:16px;padding:20px 54px;border-top:1px solid rgba(13,24,51,.10);}.demo-step-footer-end{justify-content:flex-end;}.demo-result-actions-row{display:flex;align-items:center;gap:12px;}
.demo-nav-primary,.demo-lesson .cta-primary{min-width:148px;min-height:48px;padding:0 22px;border:1px solid var(--accent)!important;border-radius:16px;background:var(--accent)!important;color:#fff!important;box-shadow:none!important;font-weight:740;}.demo-nav-primary:hover,.demo-lesson .cta-primary:hover{background:var(--accent-strong)!important;border-color:var(--accent-strong)!important;}
.demo-nav-secondary,.demo-lesson .cta-secondary{min-width:118px;min-height:46px;padding:0 18px;border:1px solid rgba(13,24,51,.14);border-radius:16px;background:transparent;color:var(--ink-soft);font:inherit;font-weight:680;cursor:pointer;}.demo-nav-secondary:hover,.demo-lesson .cta-secondary:hover{border-color:var(--accent);color:var(--accent);background:rgba(53,109,255,.05);}
.demo-text-link,.demo-shop-icon,.demo-lesson-visual{display:none!important;}
@media(max-width:760px){body.view-demo-intro .stage,body.view-demo-found-data .stage,body.view-demo-questions .stage,body.view-demo-result .stage{padding:76px 14px 28px;}.demo-close{left:16px;top:18px;}.demo-lesson-frame{width:calc(100vw - 28px);min-height:620px;border-radius:22px;}.demo-frame-progress{height:68px;padding:0 22px;}.demo-progress-dots i{width:20px;}.demo-step-content{padding:34px 22px 30px;}.demo-lesson .demo-step h2{font-size:31px;}.demo-lesson .demo-step p{font-size:15px;}.demo-found-list,.demo-result-grid{grid-template-columns:1fr;}.demo-step-footer,.demo-result-actions-row{flex-direction:column-reverse;align-items:stretch;}.demo-nav-primary,.demo-nav-secondary,.demo-lesson .cta-primary,.demo-lesson .cta-secondary{width:100%;}}
/* End Hisaab demo lesson v3 */`;

function stripBlock(input, start, end) {
  const s = input.indexOf(start);
  if (s === -1) return input;
  const e = input.indexOf(end, s);
  return e === -1 ? input.slice(0, s).trimEnd() + '\n' : (input.slice(0, s) + input.slice(e + end.length)).trimEnd() + '\n';
}

function patchIndex(html) {
  return html.replace(/    <section class="demo-intro[\s\S]*?    <section class="data-options/, `${demoMarkup}\n\n    <section class="data-options`);
}

function patchStyle(style) {
  style = stripBlock(style, '/* Hisaab demo lesson v3 */', '/* End Hisaab demo lesson v3 */');
  style = stripBlock(style, '/* Full-page demo lesson flow */', '/* End full-page demo lesson flow */');
  style = stripBlock(style, '/* Demo lesson shell polish */', '/* End demo lesson shell polish */');
  return style.trimEnd() + '\n\n' + css + '\n';
}

function patchScript(script) {
  return script
    .replace("if (demoFoundHome) demoFoundHome.addEventListener('click', resetToLanding);", "if (demoFoundHome) demoFoundHome.addEventListener('click', () => setDemoStep('intro'));")
    .replace("if (demoQuestionsHome) demoQuestionsHome.addEventListener('click', resetToLanding);", "if (demoQuestionsHome) demoQuestionsHome.addEventListener('click', () => setDemoStep('foundData'));")
    .replace("if (demoResultHome) demoResultHome.addEventListener('click', resetToLanding);", "if (demoResultHome) demoResultHome.addEventListener('click', () => setDemoStep('chooseQuestion'));");
}

fs.writeFileSync(indexPath, patchIndex(fs.readFileSync(indexPath, 'utf8')));
fs.writeFileSync(stylePath, patchStyle(fs.readFileSync(stylePath, 'utf8')));
fs.writeFileSync(scriptPath, patchScript(fs.readFileSync(scriptPath, 'utf8')));
