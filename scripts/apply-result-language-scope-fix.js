const fs = require('fs');
const path = require('path');
const childProcess = require('child_process');

const root = path.resolve(__dirname, '..');
const clientPath = path.join(root, 'public', 'script.js');

let source = fs.readFileSync(clientPath, 'utf8');
const before = source;

const marker = `    const detected = String(data.generated?.detected_language || data.detected_language || '').toLowerCase();\n    setUILang(detected === 'hi' ? 'hi' : 'en');`;
const replacement = `    // result-language-scope-fix: answer language belongs only to this result.\n    // Do not mutate the product-wide UI language from a single question.\n    const detected = String(data.generated?.detected_language || data.detected_language || '').toLowerCase();\n    blockResultLanguage = detected || blockResultLanguage || 'en';`;

if (!source.includes('result-language-scope-fix')) {
  if (!source.includes(marker)) {
    throw new Error('Could not find business-result language switch marker');
  }
  source = source.replace(marker, replacement);
}

// Keep this variable local to the business-result renderer module scope. It is
// intentionally not connected to setUILang(), localStorage, document.lang, or
// any global navigation labels.
if (!source.includes('let blockResultLanguage =')) {
  const insertMarker = '  // business-result-renderer-v5\n';
  if (!source.includes(insertMarker)) {
    throw new Error('Could not find business-result renderer marker');
  }
  source = source.replace(insertMarker, insertMarker + "  let blockResultLanguage = 'en';\n");
}

if (source !== before) {
  fs.writeFileSync(clientPath, source, 'utf8');
  console.log('[result-language-scope-fix] kept translated answers local to result UI');
}

childProcess.execFileSync(process.execPath, ['--check', clientPath], { stdio: 'inherit' });
