const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const indexPath = path.join(root, 'public', 'index.html');
const scriptPath = path.join(root, 'public', 'script.js');
const cssPath = path.join(root, 'public', 'style.css');

function read(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

function writeIfChanged(filePath, before, after, label) {
  if (before !== after) {
    fs.writeFileSync(filePath, after, 'utf8');
    console.log(`[demo-lesson-ux] ${label}`);
  }
}

function replaceOnce(source, before, after, label) {
  if (source.includes(after)) return source;
  if (!source.includes(before)) {
    throw new Error(`Could not find demo lesson marker: ${label}`);
  }
  return source.replace(before, after);
}

function patchIndex() {
  const before = read(indexPath);
  let source = before;

  source = replaceOnce(source,
`          <div class="demo-chip-row">
            <span class="demo-chip">Orders</span>
            <span class="demo-chip">Sales</span>
            <span class="demo-chip">Delivery fee</span>
            <span class="demo-chip">Discounts</span>
            <span class="demo-chip">Repeat customers</span>
          </div>`,
`          <div class="demo-data-strip" aria-label="Demo data includes">
            <span class="demo-data-label">Data includes</span>
            <span class="demo-data-items">Orders · Sales · Delivery fee · Discounts · Repeat customers</span>
          </div>`,
    'step 1 data strip'
  );

  source = replaceOnce(source,
`          <div class="demo-card-grid">
            <div class="demo-info-card">
              <div class="demo-info-title">Orders</div>
              <div class="demo-info-body">How many orders came in over time.</div>
            </div>
            <div class="demo-info-card">
              <div class="demo-info-title">Sales</div>
              <div class="demo-info-body">Whether orders are creating more or less money.</div>
            </div>
            <div class="demo-info-card">
              <div class="demo-info-title">Delivery fee</div>
              <div class="demo-info-body">Whether fee changes moved with order changes.</div>
            </div>
            <div class="demo-info-card">
              <div class="demo-info-title">Customers</div>
              <div class="demo-info-body">Whether people are coming back again.</div>
            </div>
          </div>`,
`          <div class="demo-check-list" aria-label="What Hisaab checks">
            <div class="demo-check-row"><span aria-hidden="true">✓</span><div><b>Orders over time</b><small>Is the shop growing, slowing, or stable?</small></div></div>
            <div class="demo-check-row"><span aria-hidden="true">✓</span><div><b>Sales value</b><small>Are orders bringing in more or less money?</small></div></div>
            <div class="demo-check-row"><span aria-hidden="true">✓</span><div><b>Delivery fee changes</b><small>Did fee changes move with order changes?</small></div></div>
            <div class="demo-check-row"><span aria-hidden="true">✓</span><div><b>Repeat customers</b><small>Are people coming back again?</small></div></div>
          </div>`,
    'step 2 checklist'
  );

  source = replaceOnce(source,
`          <div class="demo-card-grid">
            <div class="demo-info-card">
              <div class="demo-info-title">Answer</div>
              <div class="demo-info-body" id="demo-result-answer"></div>
            </div>
            <div class="demo-info-card">
              <div class="demo-info-title">Why?</div>
              <div class="demo-info-body" id="demo-result-why"></div>
            </div>
            <div class="demo-info-card">
              <div class="demo-info-title">Try this</div>
              <div class="demo-info-body" id="demo-result-try"></div>
            </div>
            <div class="demo-info-card">
              <div class="demo-info-title">How sure is this?</div>
              <div class="demo-info-body">Demo only — example data, not your business.</div>
            </div>
          </div>
          <p class="demo-footnote">Demo example · Not your business data</p>`,
`          <div class="demo-result-wrap">
            <section class="demo-result-main">
              <div class="demo-result-label">Hisaab says</div>
              <p id="demo-result-answer"></p>
            </section>
            <div class="demo-result-support">
              <section>
                <div class="demo-result-label">Why</div>
                <p id="demo-result-why"></p>
              </section>
              <section>
                <div class="demo-result-label">Try this</div>
                <p id="demo-result-try"></p>
              </section>
            </div>
            <p class="demo-confidence-note">Demo only · Example data, not your business</p>
          </div>`,
    'step 4 result layout'
  );

  writeIfChanged(indexPath, before, source, 'patched public/index.html');
}

function patchScript() {
  const before = read(scriptPath);
  let source = before;
  const replacements = [
    ['For this demo shop, orders have been slowly rising over the last few months.', 'Orders are slowly rising in this example.'],
    ['Recent months show more orders than the months before them — a mild, steady upward trend.', 'Recent months had more orders than earlier months.'],
    ['Keep an eye on the next 2–3 months to see if the rise continues.', 'Watch the next few weeks before changing prices or offers.'],
    ['For this demo shop, a small delivery fee increase looks safe to try.', 'A small delivery-fee test looks safer than a big change.'],
    ['Past fee changes did not noticeably reduce how many orders came in.', 'Past fee changes did not clearly reduce orders.'],
    ['Raise the fee by a small amount and watch orders for two weeks.', 'Try a small change first, then watch orders.'],
    ['For this demo shop, discounts helped a little, but not every time.', 'Discounts helped sometimes, not always.'],
    ['Some discount months had more orders, but the pattern was not strong every month.', 'Offer months were better in some places, but not every time.'],
    ['Run a small offer for 3–5 days and compare orders.', 'Test one small offer before repeating it everywhere.'],
    ['For this demo shop, a good share of customers are repeat buyers.', 'Repeat buyers look healthy in this example.'],
    ['Several months show the same customers ordering more than once.', 'The data shows people coming back more than once.'],
    ['Try a small thank-you offer for repeat customers and see if it grows.', 'Give recent buyers a small reason to return.'],
  ];
  for (const [from, to] of replacements) {
    source = source.replace(from, to);
  }
  writeIfChanged(scriptPath, before, source, 'patched public/script.js');
}

function patchCss() {
  const before = read(cssPath);
  let source = before;
  if (!source.includes('demo-lesson-affordance-cleanup-v1')) {
    source += `

/* demo-lesson-affordance-cleanup-v1 */
.demo-lesson-header{
  display:grid;
  grid-template-columns:minmax(130px,1fr) auto minmax(130px,1fr);
  align-items:center;
  padding:28px 34px 0;
}
.demo-step-label{
  justify-self:start;
  min-width:130px;
  white-space:nowrap;
  letter-spacing:.105em;
}
.demo-progress-dots{
  justify-self:center;
  width:118px;
  max-width:118px;
  flex:none;
  gap:7px;
}
.demo-dot{
  width:22px;
  height:3px;
  flex:0 0 22px;
  opacity:.72;
}
.demo-dot.filled{ opacity:1; }
.demo-close{
  justify-self:end;
  border-radius:8px;
  background:transparent !important;
  box-shadow:none !important;
}
.demo-close:hover{
  background:transparent !important;
  color:var(--ink);
  opacity:.78;
}
.demo-data-strip{
  display:flex;
  flex-wrap:wrap;
  align-items:center;
  gap:10px;
  margin-top:4px;
  color:var(--ink-soft);
  cursor:default;
  -webkit-user-select:none;
  user-select:none;
}
.demo-data-label{
  color:var(--ink-mute);
  font-size:12px;
  font-weight:800;
  letter-spacing:.09em;
  text-transform:uppercase;
}
.demo-data-items{
  font-size:15px;
  color:var(--ink-soft);
}
.demo-chip-row,.demo-chip{ pointer-events:none; }
.demo-check-list{
  max-width:760px;
  display:grid;
  grid-template-columns:1fr 1fr;
  gap:12px;
  margin-bottom:18px;
}
.demo-check-row{
  display:flex;
  align-items:flex-start;
  gap:12px;
  padding:14px 0;
  border-top:1px solid rgba(13,24,51,.10);
  color:var(--ink-soft);
  cursor:default;
}
.demo-check-row span{
  flex:0 0 auto;
  color:var(--accent);
  font-weight:900;
  margin-top:1px;
}
.demo-check-row b{
  display:block;
  color:var(--ink);
  font-size:15px;
  line-height:1.25;
  margin-bottom:4px;
}
.demo-check-row small{
  display:block;
  color:var(--ink-soft);
  font-size:13.5px;
  line-height:1.45;
}
.demo-step-2 .demo-info-card,
#demo-step-2 .demo-info-card{
  cursor:default;
  pointer-events:none;
}
#demo-step-3 .demo-card-grid{
  grid-template-columns:1fr 1fr;
  gap:12px;
  max-width:820px;
}
#demo-step-3 .demo-question-card{
  position:relative;
  min-height:112px;
  padding:18px 20px 18px 48px;
  border-radius:18px;
  background:rgba(255,255,255,.34);
}
#demo-step-3 .demo-question-card::before{
  content:"";
  position:absolute;
  left:20px;
  top:23px;
  width:14px;
  height:14px;
  border-radius:50%;
  border:1.5px solid rgba(53,109,255,.48);
  background:#fff;
}
#demo-step-3 .demo-question-card:hover{
  border-color:var(--accent);
  background:rgba(255,255,255,.58);
  transform:translateY(-1px);
}
.demo-result-wrap{
  max-width:820px;
  display:grid;
  gap:14px;
}
.demo-result-main,
.demo-result-support section{
  border:1px solid rgba(13,24,51,.12);
  border-radius:20px;
  background:rgba(255,255,255,.36);
  cursor:default;
}
.demo-result-main{
  padding:24px 26px;
}
.demo-result-main p{
  margin:8px 0 0;
  color:var(--ink);
  font-size:25px;
  line-height:1.32;
  letter-spacing:-.02em;
  font-weight:650;
}
.demo-result-support{
  display:grid;
  grid-template-columns:1fr 1fr;
  gap:14px;
}
.demo-result-support section{
  padding:18px 20px;
}
.demo-result-support p{
  margin:6px 0 0;
  color:var(--ink-soft);
  font-size:15px;
  line-height:1.52;
}
.demo-result-label{
  color:var(--ink-mute);
  font-size:11px;
  font-weight:850;
  letter-spacing:.11em;
  text-transform:uppercase;
}
.demo-confidence-note{
  margin:0;
  color:var(--ink-mute);
  font-size:13px;
}
@media (max-width: 720px){
  .demo-lesson-header{ grid-template-columns:1fr auto 1fr; padding:20px 20px 0; }
  .demo-step-label{ min-width:0; font-size:10px; }
  .demo-progress-dots{ width:84px; max-width:84px; gap:5px; }
  .demo-dot{ width:16px; flex-basis:16px; }
  .demo-check-list,
  #demo-step-3 .demo-card-grid,
  .demo-result-support{ grid-template-columns:1fr; }
  #demo-step-3 .demo-question-card{ min-height:auto; }
  .demo-result-main p{ font-size:22px; }
}
`;
  }
  writeIfChanged(cssPath, before, source, 'patched public/style.css');
}

patchIndex();
patchScript();
patchCss();
