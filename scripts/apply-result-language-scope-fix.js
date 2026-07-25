const fs = require('fs');
const path = require('path');
const childProcess = require('child_process');

const root = path.resolve(__dirname, '..');
const clientPath = path.join(root, 'public', 'script.js');

let source = fs.readFileSync(clientPath, 'utf8');
const before = source;

function replaceIfPresent(marker, replacement, label) {
  if (!source.includes(marker)) return false;
  source = source.replace(marker, replacement);
  console.log('[result-language-scope-fix] ' + label);
  return true;
}

// Business-result renderer: answer language can be remembered locally for that
// block, but it must never call setUILang(). That would translate top chrome
// such as "Your decisions" and "New question" after a Hinglish/Hindi answer.
const businessRendererMarker = `    const detected = String(data.generated?.detected_language || data.detected_language || '').toLowerCase();\n    setUILang(detected === 'hi' ? 'hi' : 'en');`;
const businessRendererReplacement = `    // result-language-scope-fix: answer language belongs only to this result.\n    // Do not mutate the product-wide UI language from a single question.\n    const detected = String(data.generated?.detected_language || data.detected_language || '').toLowerCase();\n    blockResultLanguage = detected || blockResultLanguage || 'en';`;
replaceIfPresent(businessRendererMarker, businessRendererReplacement, 'scoped business result language');

// Classic numeric/scenario renderer: this was the remaining root cause behind
// the reported bug. Hinglish/Hindi simulation answers were still flipping the
// global UI language, so shell controls and intent actions became Hindi.
const scenarioRendererMarker = `    // The UI chrome always mirrors the CURRENT question's detected language —\n    // in both directions. If this question is Hindi, switch to Hindi; if\n    // it's English (or anything else we don't have UI strings for), switch\n    // back to English. Each question gets a consistent single-language\n    // result screen matching what was actually asked, rather than a language\n    // choice "sticking" from an earlier question in the same session.\n    const detected = String(generated.detected_language || data.detected_language || '').toLowerCase();\n    setUILang(detected === 'hi' ? 'hi' : 'en');`;
const scenarioRendererReplacement = `    // result-chrome-language-boundary: generated answer wording may follow the\n    // user's question, but the app shell and action controls stay in the\n    // product UI language. Do not call setUILang() from a result render.\n    const detected = String(generated.detected_language || data.detected_language || '').toLowerCase();`;
replaceIfPresent(scenarioRendererMarker, scenarioRendererReplacement, 'stopped scenario renderer from translating chrome');

// Keep this variable local to the business-result renderer module scope. It is
// intentionally not connected to setUILang(), localStorage, document.lang, or
// any global navigation labels.
if (!source.includes('let blockResultLanguage =')) {
  const insertMarker = '  // business-result-renderer-v5\n';
  if (source.includes(insertMarker)) {
    source = source.replace(insertMarker, insertMarker + "  let blockResultLanguage = 'en';\n");
    console.log('[result-language-scope-fix] added local business result language state');
  }
}

// Guardrail: after the two renderers are fixed, no runtime code should call
// setUILang(). The function can remain for future explicit settings, but result
// rendering must not use it implicitly.
const setUiLangCalls = (source.match(/\bsetUILang\(/g) || []).length;
const setUiLangDefinitions = (source.match(/function\s+setUILang\(/g) || []).length;
if (setUiLangCalls > setUiLangDefinitions) {
  throw new Error('Result renderers still contain a setUILang() call. Keep product chrome/actions language separate from answer language.');
}

if (source !== before) {
  fs.writeFileSync(clientPath, source, 'utf8');
  console.log('[result-language-scope-fix] kept translated answers local to answer content');
}

childProcess.execFileSync(process.execPath, ['--check', clientPath], { stdio: 'inherit' });
