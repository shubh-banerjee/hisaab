const fs = require('fs');
const path = require('path');
const childProcess = require('child_process');

const root = path.resolve(__dirname, '..');
const scriptPath = path.join(root, 'public', 'script.js');
const stylePath = path.join(root, 'public', 'style.css');

function patchScript() {
  let source = fs.readFileSync(scriptPath, 'utf8');
  const before = source;

  // Product decision: the aggregate "Your Hisaab so far" score card is not useful
  // on the decisions page until there is a proper mature-history story. Keep the
  // saved decisions list, count chip, compare/check-back APIs, and cards untouched.
  const marker = 'function renderTrackRecord(track) {';
  const replacement = `function renderTrackRecord(track) {\n    // decision-track-strip-removed: hide the aggregate score strip on the decisions page.\n    if (trackRecord) trackRecord.hidden = true;\n    if (decisionLogSub) {\n      decisionLogSub.textContent = "This is where your saved decisions live. When you tell me what happened, I'll compare it with the earlier estimate.";\n    }\n    return;`;

  if (!source.includes('decision-track-strip-removed')) {
    if (!source.includes(marker)) {
      throw new Error('[remove-decision-track-strip] Could not find renderTrackRecord() marker.');
    }
    source = source.replace(marker, replacement);
  }

  if (source !== before) {
    fs.writeFileSync(scriptPath, source, 'utf8');
    console.log('[remove-decision-track-strip] Disabled decisions-page aggregate score strip.');
  } else {
    console.log('[remove-decision-track-strip] Already applied in script.js.');
  }
}

function patchStyle() {
  let source = fs.readFileSync(stylePath, 'utf8');
  const css = `\n/* decision-track-strip-removed: the aggregate score strip is intentionally hidden. */\n#track-record,\n.track-record {\n  display: none !important;\n}\n`;

  if (!source.includes('decision-track-strip-removed')) {
    source += css;
    fs.writeFileSync(stylePath, source, 'utf8');
    console.log('[remove-decision-track-strip] Added CSS fallback hide.');
  } else {
    console.log('[remove-decision-track-strip] Already applied in style.css.');
  }
}

patchScript();
patchStyle();

childProcess.execFileSync(process.execPath, ['--check', scriptPath], { stdio: 'inherit' });
childProcess.execFileSync(process.execPath, ['--check', path.join(root, 'server.js')], { stdio: 'inherit' });
