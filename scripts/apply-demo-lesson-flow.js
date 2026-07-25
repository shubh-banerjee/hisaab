const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const scriptPath = path.join(root, 'public', 'script.js');
const cssPath = path.join(root, 'public', 'style.css');

function read(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

function writeIfChanged(filePath, before, after, label) {
  if (before !== after) {
    fs.writeFileSync(filePath, after, 'utf8');
    console.log(`[demo-lesson-flow] ${label}`);
  }
}

function patchScript() {
  const before = read(scriptPath);
  let source = before;

  const renderReplacement = `function renderDemoStep() {
    document.querySelectorAll('.demo-step').forEach((el) => {
      el.hidden = Number(el.dataset.step) !== demoStep;
    });

    const label = document.getElementById('demo-step-label');
    if (label) label.textContent = ` + "`STEP ${demoStep} OF 4`" + `;

    document.querySelectorAll('.demo-dot').forEach((dot) => {
      dot.classList.toggle('filled', Number(dot.dataset.step) <= demoStep);
    });

    document.querySelectorAll('.demo-question-card').forEach((card) => {
      const isSelected = card.getAttribute('data-demo-q') === demoChosenQuestion;
      card.classList.toggle('selected', isSelected);
      card.setAttribute('aria-pressed', isSelected ? 'true' : 'false');
    });

    const goBack = document.getElementById('demo-go-back');
    const primary = document.getElementById('demo-primary-btn');
    if (goBack) goBack.hidden = demoStep === 1;

    if (primary) {
      primary.disabled = false;
      if (demoStep === 1) {
        primary.hidden = false;
        primary.textContent = 'Start demo';
      } else if (demoStep === 2) {
        primary.hidden = false;
        primary.textContent = 'Continue';
      } else if (demoStep === 3) {
        primary.hidden = false;
        primary.textContent = 'Ask Hisaab';
        primary.disabled = !demoChosenQuestion;
      } else {
        primary.hidden = true;
      }
    }

    if (demoStep === 4 && demoChosenQuestion) {
      const result = DEMO_RESULTS[demoChosenQuestion];
      const answerEl = document.getElementById('demo-result-answer');
      const whyEl = document.getElementById('demo-result-why');
      const tryEl = document.getElementById('demo-result-try');
      if (answerEl) answerEl.textContent = result.answer;
      if (whyEl) whyEl.textContent = result.why;
      if (tryEl) tryEl.textContent = result.try_this;
    }
  }

  function wireDemoLesson() {
    const closeBtn = document.getElementById('demo-close');
    const goBack = document.getElementById('demo-go-back');
    const primary = document.getElementById('demo-primary-btn');

    if (closeBtn && !closeBtn.dataset.demoFlowWired) {
      closeBtn.dataset.demoFlowWired = 'true';
      closeBtn.addEventListener('click', closeDemoLesson);
    }

    if (goBack && !goBack.dataset.demoFlowWired) {
      goBack.dataset.demoFlowWired = 'true';
      goBack.addEventListener('click', () => {
        if (demoStep > 1) {
          demoStep -= 1;
          renderDemoStep();
        }
      });
    }

    if (primary && !primary.dataset.demoFlowWired) {
      primary.dataset.demoFlowWired = 'true';
      primary.addEventListener('click', () => {
        if (demoStep === 1) {
          demoStep = 2;
          renderDemoStep();
          return;
        }
        if (demoStep === 2) {
          demoStep = 3;
          renderDemoStep();
          return;
        }
        if (demoStep === 3 && demoChosenQuestion) {
          demoStep = 4;
          renderDemoStep();
        }
      });
    }

    document.querySelectorAll('.demo-question-card').forEach((card) => {
      if (card.dataset.demoFlowWired) return;
      card.dataset.demoFlowWired = 'true';
      card.setAttribute('aria-pressed', 'false');
      card.addEventListener('click', () => {
        demoChosenQuestion = card.getAttribute('data-demo-q');
        renderDemoStep();
      });
    });

    if (!document.body.dataset.demoEscapeWired) {
      document.body.dataset.demoEscapeWired = 'true';
      document.addEventListener('keydown', (e) => {
        const overlay = document.getElementById('demo-lesson');
        if (e.key === 'Escape' && overlay && !overlay.hidden) closeDemoLesson();
      });
    }
  }`;

  const demoFunctionPattern = /function renderDemoStep\(\) \{[\s\S]*?\n  \}\n\n  function wireDemoLesson\(\) \{[\s\S]*?\n  \}\n\n  \/\/ ── Add-my-data full-page flow/;
  if (!demoFunctionPattern.test(source)) {
    throw new Error('Could not find demo lesson render/wire function block');
  }
  source = source.replace(demoFunctionPattern, `${renderReplacement}\n\n  // ── Add-my-data full-page flow`);

  writeIfChanged(scriptPath, before, source, 'patched public/script.js');
}

function patchCss() {
  const before = read(cssPath);
  let source = before;
  if (!source.includes('demo-lesson-flow-polish-v2')) {
    source += `

/* demo-lesson-flow-polish-v2 */
.demo-lesson-frame{
  max-width:940px;
  min-height:620px;
}
.demo-lesson-header{
  padding:26px 30px 0;
}
.demo-lesson-body{
  padding:34px 56px 34px;
}
.demo-lesson-footer{
  padding:20px 30px;
}
.demo-title{
  font-size:34px;
  line-height:1.18;
  max-width:780px;
}
.demo-desc{
  max-width:680px;
  margin-bottom:28px;
}
.demo-progress-dots{
  width:92px;
  max-width:92px;
  gap:6px;
}
.demo-dot{
  width:17px;
  flex-basis:17px;
  height:3px;
}
#demo-step-3 .demo-card-grid{
  max-width:780px;
  gap:12px;
}
#demo-step-3 .demo-question-card{
  min-height:104px;
  padding:16px 18px 16px 46px;
  cursor:pointer;
}
#demo-step-3 .demo-question-card.selected{
  border-color:var(--accent);
  background:rgba(255,255,255,.64);
  box-shadow:0 0 0 1px rgba(53,109,255,.12) inset;
}
#demo-step-3 .demo-question-card.selected::before{
  border-color:var(--accent);
  background:var(--accent);
  box-shadow:inset 0 0 0 4px #fff;
}
#demo-step-3 .demo-info-title{
  font-size:15.5px;
}
#demo-step-3 .demo-info-body{
  font-size:13.5px;
}
.demo-result-wrap{
  max-width:780px;
}
.demo-result-main{
  padding:22px 24px;
}
.demo-result-main p{
  font-size:23px;
}
.demo-result-support section{
  padding:16px 18px;
}
.demo-btn-filled:disabled{
  opacity:.42;
  cursor:not-allowed;
  background:var(--accent);
  border-color:var(--accent);
}
.demo-btn-filled:disabled:hover{
  background:var(--accent);
}
@media (max-width: 720px){
  .demo-lesson-frame{ max-width:100%; min-height:0; }
  .demo-lesson-body{ padding:22px 22px 28px; }
  .demo-title{ font-size:26px; }
  .demo-result-wrap{ max-width:100%; }
}
`;
  }
  writeIfChanged(cssPath, before, source, 'patched public/style.css');
}

patchScript();
patchCss();
