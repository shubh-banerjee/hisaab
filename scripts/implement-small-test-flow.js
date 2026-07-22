const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const files = {
  index: path.join(root, 'public', 'index.html'),
  script: path.join(root, 'public', 'script.js'),
  style: path.join(root, 'public', 'style.css'),
  server: path.join(root, 'server.js'),
};

function read(file) {
  return fs.readFileSync(file, 'utf8');
}

function write(file, content) {
  fs.writeFileSync(file, content, 'utf8');
}

function replaceOnce(source, search, replacement, label) {
  if (!source.includes(search)) {
    throw new Error(`Could not find insertion point: ${label}`);
  }
  return source.replace(search, replacement);
}

function insertBefore(source, needle, insertion, label) {
  if (source.includes(insertion.trim().slice(0, 48))) return source;
  return replaceOnce(source, needle, `${insertion}\n${needle}`, label);
}

function insertAfter(source, needle, insertion, label) {
  if (source.includes(insertion.trim().slice(0, 48))) return source;
  return replaceOnce(source, needle, `${needle}\n${insertion}`, label);
}

function patchIndex() {
  let html = read(files.index);
  const section = `    <section class="test-setup-view guided-view" id="test-setup-view" hidden aria-labelledby="test-setup-title">
      <div class="guided-card test-setup-card">
        <div class="guided-top-row">
          <button class="guided-close" id="test-setup-exit" type="button" aria-label="Exit to home">×</button>
          <div class="guided-progress-label">Small test</div>
        </div>

        <div class="test-setup-body">
          <div class="setup-kicker">Run a small test</div>
          <h1 id="test-setup-title">Set up this test</h1>
          <p class="test-setup-subtitle" id="test-setup-subtitle">Try the change for a short time, then compare what happened.</p>

          <div class="test-plan-summary" aria-label="Test preview">
            <div>
              <span>Change</span>
              <strong id="test-change-copy">Small change</strong>
            </div>
            <div>
              <span>Watch</span>
              <strong id="test-watch-copy">Daily orders</strong>
            </div>
            <div>
              <span>Evidence</span>
              <strong id="test-evidence-copy">Useful direction — test first</strong>
            </div>
          </div>

          <div class="test-form-grid">
            <label class="test-field" for="test-start-date">
              <span>Start date</span>
              <input id="test-start-date" type="date">
            </label>
            <label class="test-field" for="test-duration-days">
              <span>Duration</span>
              <select id="test-duration-days">
                <option value="7">7 days</option>
                <option value="14">14 days</option>
                <option value="30">30 days</option>
              </select>
            </label>
            <label class="test-field" for="test-watch-metric">
              <span>Measure</span>
              <select id="test-watch-metric">
                <option value="orders">Daily orders</option>
                <option value="sales">Daily sales</option>
                <option value="repeat_customers">Repeat customers</option>
              </select>
            </label>
          </div>

          <div class="test-honesty-note" id="test-honesty-note">
            Hisaab will save this as a planned test. When newer data is available, it can help compare the direction honestly.
          </div>

          <div class="test-save-status" id="test-save-status" role="status" aria-live="polite" hidden></div>
        </div>

        <div class="guided-footer test-setup-footer">
          <button class="cta-secondary" id="test-setup-back" type="button">Previous</button>
          <button class="cta-primary" id="test-setup-save" type="button">Save test</button>
        </div>
      </div>
    </section>
`;
  html = insertBefore(html, '    <section class="decision-log" id="decision-log" hidden>', section, 'test setup before decision log');
  write(files.index, html);
}

function patchScript() {
  let js = read(files.script);

  js = insertAfter(js,
    "  const decisionLog = document.getElementById('decision-log');",
    `  const testSetupView = document.getElementById('test-setup-view');
  const testSetupExit = document.getElementById('test-setup-exit');
  const testSetupBack = document.getElementById('test-setup-back');
  const testSetupSave = document.getElementById('test-setup-save');
  const testSetupSubtitle = document.getElementById('test-setup-subtitle');
  const testChangeCopy = document.getElementById('test-change-copy');
  const testWatchCopy = document.getElementById('test-watch-copy');
  const testEvidenceCopy = document.getElementById('test-evidence-copy');
  const testStartDate = document.getElementById('test-start-date');
  const testDurationDays = document.getElementById('test-duration-days');
  const testWatchMetric = document.getElementById('test-watch-metric');
  const testHonestyNote = document.getElementById('test-honesty-note');
  const testSaveStatus = document.getElementById('test-save-status');`,
    'test setup DOM refs');

  js = js.replace('    resultsSection,\n    decisionLog,', '    resultsSection,\n    testSetupView,\n    decisionLog,');
  js = js.replace("    'result',\n    'demoIntro',", "    'result',\n    'testSetup',\n    'demoIntro',");
  js = js.replace("    } else if (currentView === 'decisionLog') {\n      reveal(decisionLog);", "    } else if (currentView === 'testSetup') {\n      reveal(testSetupView);\n    } else if (currentView === 'decisionLog') {\n      reveal(decisionLog);");
  js = js.replace("    if (askView) askView.hidden = view !== 'ask';", "    if (askView) askView.hidden = view !== 'ask';\n    if (testSetupView) testSetupView.hidden = view !== 'testSetup';");
  js = js.replace("    const transitionView = view === 'reading' || view === 'dataReady' || view === 'error';", "    const transitionView = view === 'reading' || view === 'dataReady' || view === 'error' || view === 'testSetup';");
  js = js.replace("    if (transitionView || view === 'ask' || view === 'home' || view === 'demo' || view === 'fixData') {", "    if (transitionView || view === 'ask' || view === 'home' || view === 'demo' || view === 'fixData' || view === 'testSetup') {");
  js = js.replace("    if (transitionView || view === 'ask' || view === 'fixData') {", "    if (transitionView || view === 'ask' || view === 'fixData' || view === 'testSetup') {");

  js = insertAfter(js,
    "  if (askBackDataReady) askBackDataReady.addEventListener('click', backToDataReady);",
    `  if (testSetupExit) testSetupExit.addEventListener('click', resetToLanding);
  if (testSetupBack) testSetupBack.addEventListener('click', () => {
    setCurrentView('result');
    if (resultsSection) {
      resultsSection.hidden = false;
      resultsSection.classList.add('show');
    }
  });
  if (testSetupSave) testSetupSave.addEventListener('click', saveSmallTestPlan);`,
    'test setup event listeners');

  js = js.replace("primary: isDemo ? null : { label: 'Track this decision', handler: showTrackPrompt },", "primary: isDemo ? null : { label: 'Set up this test', handler: openSmallTestSetup },");
  js = js.replace("primary: { label: 'Track this decision', handler: showTrackPrompt },", "primary: { label: 'Set up this test', handler: openSmallTestSetup },");

  js = insertBefore(js,
    "  function showTrackPrompt() {",
    `  function metricLabelForTest(metric) {
    const normalized = String(metric || '').toLowerCase();
    if (normalized.includes('repeat')) return 'Repeat customers';
    if (normalized.includes('sales') || normalized.includes('revenue') || normalized.includes('value')) return 'Daily sales';
    return 'Daily orders';
  }

  function leverLabelForTest(lever) {
    const normalized = String(lever || '').toLowerCase();
    if (normalized.includes('delivery')) return 'delivery fee';
    if (normalized.includes('price') || normalized.includes('avg_order_value')) return 'average bill';
    if (normalized.includes('promo') || normalized.includes('discount')) return 'discount or offer';
    if (normalized.includes('cod')) return 'cash-on-delivery setting';
    return 'the change';
  }

  function buildSmallTestPlan(snapshot = currentResult) {
    const computed = snapshot?.computed || {};
    const data = snapshot?.data || {};
    const evidence = snapshot?.evidenceStrength || evidenceStrength(snapshot?.resultCategory, snapshot?.confidence);
    const lever = computed.lever || data.lever || '';
    const change = finiteNumber(computed.assumed_change ?? computed.lever_change);
    const currentValue = finiteNumber(computed.current_value ?? computed.current_lever_value ?? data.scenarios_bundle?.current_value);
    const leverLabel = leverLabelForTest(lever);
    const metricLabel = metricLabelForTest(snapshot?.predictedMetric || computed.outcome_metric || data.outcome_metric);
    let changeCopy = data.evidence?.next_action || snapshot?.suggestedAction || 'Try the recommended change with a small group first.';

    if (Number.isFinite(currentValue) && Number.isFinite(change)) {
      const next = Math.round((currentValue + change) * 100) / 100;
      const sign = change > 0 ? '+' : change < 0 ? '−' : '';
      changeCopy = `${leverLabel}: ₹${currentValue} → ₹${next} (${sign}₹${Math.abs(change)})`;
    } else if (Number.isFinite(change)) {
      const sign = change > 0 ? '+' : change < 0 ? '−' : '';
      changeCopy = `${leverLabel}: ${sign}${Math.abs(change)} change`;
    }

    return {
      changeCopy,
      metricLabel,
      evidence,
      lever,
      predictedMetric: snapshot?.predictedMetric || computed.outcome_metric || '',
      predictedValue: snapshot?.predictedValue ?? computed.outcome_value ?? null,
      predictedRange: snapshot?.predictedRange || { low: computed.range_low ?? null, high: computed.range_high ?? null },
    };
  }

  function setTodayIfEmpty(input) {
    if (!input || input.value) return;
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    input.value = `${yyyy}-${mm}-${dd}`;
  }

  function openSmallTestSetup() {
    if (!currentResult) {
      showTrackPrompt();
      return;
    }
    const plan = buildSmallTestPlan(currentResult);
    if (testChangeCopy) testChangeCopy.textContent = plan.changeCopy;
    if (testWatchCopy) testWatchCopy.textContent = plan.metricLabel || 'Daily orders';
    if (testEvidenceCopy) testEvidenceCopy.textContent = plan.evidence || 'Useful direction — test first';
    if (testWatchMetric) {
      const metric = String(plan.predictedMetric || '').toLowerCase();
      testWatchMetric.value = metric.includes('repeat') ? 'repeat_customers' : metric.includes('sales') || metric.includes('revenue') ? 'sales' : 'orders';
    }
    setTodayIfEmpty(testStartDate);
    if (testSaveStatus) {
      testSaveStatus.hidden = true;
      testSaveStatus.textContent = '';
      testSaveStatus.classList.remove('error', 'success');
    }
    if (testSetupSave) {
      testSetupSave.disabled = currentResult.dataSourceKind === 'sample';
      testSetupSave.textContent = currentResult.dataSourceKind === 'sample' ? 'Use real data first' : 'Save test';
    }
    if (testHonestyNote) {
      testHonestyNote.textContent = currentResult.dataSourceKind === 'sheet'
        ? 'Because this is a connected Sheet, Hisaab can re-check later when newer rows are available.'
        : currentResult.dataSourceKind === 'bootstrap'
          ? 'Hisaab will use your future daily entries to compare this test later.'
          : 'Demo tests are not saved. Use real data when you want to track an actual change.';
    }
    if (testSetupSubtitle) testSetupSubtitle.textContent = 'Try the change for a short time, then compare what happened.';
    setCurrentView('testSetup');
  }

  function buildSmallTestPayload() {
    const plan = buildSmallTestPlan(currentResult);
    return {
      change: plan.changeCopy,
      durationDays: Number(testDurationDays?.value) || 7,
      watchMetric: testWatchMetric?.value || 'orders',
      watchLabel: testWatchCopy?.textContent || plan.metricLabel || 'Daily orders',
      evidence: testEvidenceCopy?.textContent || plan.evidence || '',
      note: 'Created from Hisaab result action: Set up this test.',
    };
  }

  async function saveSmallTestPlan() {
    if (!currentResult || !testSetupSave) return;
    if (currentResult.dataSourceKind === 'sample') {
      if (testSaveStatus) {
        testSaveStatus.hidden = false;
        testSaveStatus.classList.add('error');
        testSaveStatus.textContent = 'Demo tests are not saved. Use your own data first.';
      }
      return;
    }
    testSetupSave.disabled = true;
    testSetupSave.textContent = 'Saving…';
    if (testSaveStatus) {
      testSaveStatus.hidden = false;
      testSaveStatus.classList.remove('error', 'success');
      testSaveStatus.textContent = 'Saving this test…';
    }
    try {
      const payload = decisionPayload(currentResult, 'applied', {
        startedAt: testStartDate?.value || new Date().toISOString(),
        testPlan: buildSmallTestPayload(),
      });
      const res = await fetch('/api/decisions', {
        method: 'POST',
        headers: apiHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(payload),
      });
      const saved = await readJsonResponse(res);
      if (!res.ok) throw new Error(saved.error || `Server error (HTTP ${res.status})`);
      lastSavedDecisionId = saved.id;
      const wasKnown = savedDecisions.some(item => item.id === saved.id);
      savedDecisions = [saved, ...savedDecisions.filter(item => item.id !== saved.id)];
      decisionsCountValue = wasKnown ? decisionsCountValue : decisionsCountValue + 1;
      renderDecisionCount(decisionsCountValue || 1);
      if (testSaveStatus) {
        testSaveStatus.classList.add('success');
        testSaveStatus.textContent = 'Saved. Hisaab will help compare this test when newer data is available.';
      }
      testSetupSave.textContent = 'Saved';
      viewInLog.hidden = false;
    } catch (err) {
      if (testSaveStatus) {
        testSaveStatus.classList.add('error');
        testSaveStatus.textContent = err.message || 'Could not save this test. Try again.';
      }
      testSetupSave.disabled = false;
      testSetupSave.textContent = 'Save test';
    }
  }
`,
    'small test functions');

  js = js.replace('  function decisionPayload(snapshot, intent) {', '  function decisionPayload(snapshot, intent, extras = {}) {');
  js = js.replace("      actualValue: null,\n    };\n  }\n\n  async function saveIntentStartDate()", "      actualValue: null,\n      ...extras,\n    };\n  }\n\n  async function saveIntentStartDate()");

  write(files.script, js);
}

function patchStyle() {
  let css = read(files.style);
  if (css.includes('.test-setup-card')) return;
  css += `

/* Small test setup flow */
.test-setup-view {
  width: 100%;
  display: flex;
  justify-content: center;
}

.test-setup-card {
  width: min(780px, calc(100vw - 32px));
  min-height: 540px;
  display: flex;
  flex-direction: column;
}

.test-setup-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 22px;
}

.setup-kicker {
  color: var(--accent);
  font-weight: 700;
  font-size: 0.82rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.test-setup-body h1 {
  margin: 0;
  font-size: clamp(2rem, 5vw, 3rem);
  line-height: 1.05;
}

.test-setup-subtitle {
  margin: -12px 0 0;
  color: var(--muted);
  max-width: 560px;
}

.test-plan-summary {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.test-plan-summary > div {
  border: 1px solid var(--line);
  border-radius: 20px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.72);
}

.test-plan-summary span,
.test-field span {
  display: block;
  color: var(--muted);
  font-size: 0.78rem;
  font-weight: 700;
  margin-bottom: 8px;
}

.test-plan-summary strong {
  display: block;
  color: var(--text);
  line-height: 1.25;
}

.test-form-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.test-field {
  border: 1px solid var(--line);
  border-radius: 18px;
  padding: 14px;
  background: #fff;
}

.test-field input,
.test-field select {
  width: 100%;
  min-height: 44px;
  border: 1px solid var(--line);
  border-radius: 12px;
  padding: 0 12px;
  font: inherit;
  background: #fff;
  color: var(--text);
}

.test-honesty-note,
.test-save-status {
  border-radius: 18px;
  padding: 14px 16px;
  background: rgba(37, 99, 235, 0.07);
  color: var(--muted);
  line-height: 1.5;
}

.test-save-status.success {
  background: rgba(22, 163, 74, 0.1);
  color: #166534;
}

.test-save-status.error {
  background: rgba(220, 38, 38, 0.08);
  color: #991b1b;
}

.test-setup-footer {
  margin-top: 24px;
}

@media (max-width: 760px) {
  .test-setup-card {
    min-height: auto;
  }

  .test-plan-summary,
  .test-form-grid {
    grid-template-columns: 1fr;
  }
}
`;
  write(files.style, css);
}

function patchServer() {
  let js = read(files.server);

  js = insertBefore(js,
    'function normalizeDecisionPayload(body) {',
    `function normalizeTestPlanPayload(raw = {}) {
  if (!raw || typeof raw !== 'object') return null;
  const durationDays = Number(raw.durationDays);
  return {
    change: String(raw.change || '').trim().slice(0, 240),
    durationDays: Number.isFinite(durationDays) && durationDays > 0 ? durationDays : 7,
    watchMetric: String(raw.watchMetric || 'orders').trim().slice(0, 80),
    watchLabel: String(raw.watchLabel || 'Daily orders').trim().slice(0, 120),
    evidence: String(raw.evidence || '').trim().slice(0, 160),
    note: String(raw.note || '').trim().slice(0, 240),
  };
}

`,
    'normalize test plan helper');

  js = js.replace('    sheetUrl: String(body.sheetUrl || \'\').trim(),\n    status,', '    sheetUrl: String(body.sheetUrl || \'\').trim(),\n    testPlan: normalizeTestPlanPayload(body.testPlan),\n    status,');
  js = js.replace('    sourceType: isDemoDecision(data) ? \'demo\' : (data.sourceType || \'real\'),\n    sheetUrl: data.sheetUrl || \'\',', '    sourceType: isDemoDecision(data) ? \'demo\' : (data.sourceType || \'real\'),\n    sheetUrl: data.sheetUrl || \'\',\n    testPlan: data.testPlan || null,');
  js = js.replace('      sheetUrl: payload.dataSource === \'sheet\' ? payload.sheetUrl : \'\',\n      status: payload.status,', '      sheetUrl: payload.dataSource === \'sheet\' ? payload.sheetUrl : \'\',\n      testPlan: payload.testPlan,\n      status: payload.status,');

  write(files.server, js);
}

function main() {
  patchIndex();
  patchScript();
  patchStyle();
  patchServer();
}

main();
