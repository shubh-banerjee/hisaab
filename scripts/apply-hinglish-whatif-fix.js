const fs = require('fs');
const path = require('path');
const childProcess = require('child_process');

const root = path.resolve(__dirname, '..');
const workflowPath = path.join(root, 'services', 'business-workflow.js');

function replaceRequired(source, before, after, label) {
  if (source.includes(after)) return source;
  if (!source.includes(before)) {
    throw new Error(`[hinglish-whatif-fix] Missing expected marker: ${label}`);
  }
  return source.replace(before, after);
}

const before = fs.readFileSync(workflowPath, 'utf8');
let source = before;

source = replaceRequired(
  source,
  "  if (/\\b(main|mai|mein|mujhe|mera|meri|mere|kaise|kya|karu|badha|badhau|dukaan|dhandha|vyapar|bikri|grahak|daam|kimat|munafa|kharcha)\\b/i.test(text)) return 'hinglish';",
  "  if (/\\b(agar|main|mai|mein|mujhe|mera|meri|mere|kaise|kya|kyu|karu|karun|badha|bada|badhau|badhana|ghata|ghatau|kam|zyada|rupaye|rupee|dukaan|dhandha|vyapar|bikri|grahak|daam|kimat|munafa|kharcha|hoga|toh)\\b/i.test(text)) return 'hinglish';",
  'language detector',
);

source = replaceRequired(
  source,
  "  const change = /\\b(what happens|change|raise|increase|decrease|lower|reduce|test|try|should i|if i|impact|effect|working|worth|run)\\b/i.test(text);",
  "  const change = /\\b(what happens|what will happen|change|raise|increase|decrease|lower|reduce|test|try|should i|if i|impact|effect|working|worth|run|agar|kya hoga|kya hoga agar|badha|bada|badhau|badhana|ghata|ghatau|kam karu|kam karun|zyada karu|zyada karun)\\b/i.test(text);",
  'what-if intent detector',
);

source = replaceRequired(
  source,
  "    const prompt = 'Rewrite this already-computed Hisaab answer as a calm human business analyst for a small shop owner. Match English, Hindi in Devanagari, or natural Roman Hinglish. Keep all facts, numbers, limitations, recommendation IDs, and meaning unchanged. Do not invent data. Return JSON only with title, answer, subtext, recommendations (id,label,title,body), detected_language. Input: ' + JSON.stringify(safe);",
  "    const targetLanguage = languageOf(questionText);\n    const languageInstruction = targetLanguage === 'hinglish'\n      ? 'The user wrote in Roman Hinglish. Every user-facing string must be natural Roman Hinglish, not English and not Devanagari Hindi.'\n      : targetLanguage === 'hi'\n        ? 'The user wrote in Hindi. Every user-facing string must be Hindi in Devanagari.'\n        : 'The user wrote in English. Every user-facing string must remain English.';\n    const prompt = 'Rewrite this already-computed Hisaab answer as a calm human business analyst for a small shop owner. ' + languageInstruction + ' Keep all facts, numbers, limitations, recommendation IDs, and meaning unchanged. Do not invent data. Return JSON only with title, answer, subtext, recommendations (id,label,title,body), detected_language. Input: ' + JSON.stringify(safe);",
  'language-locked naturalisation prompt',
);

if (source !== before) {
  fs.writeFileSync(workflowPath, source, 'utf8');
  console.log('[hinglish-whatif-fix] Patched Hinglish detection and what-if routing.');
} else {
  console.log('[hinglish-whatif-fix] Already applied.');
}

childProcess.execFileSync(process.execPath, ['--check', workflowPath], { stdio: 'inherit' });

const classifyProbe = childProcess.execFileSync(
  process.execPath,
  ['-e', "const w=require('./services/business-workflow'); const cases=['Agar main do rupaye delivery fee mein bada du to kya hoga','Agar delivery fee 2 rupaye badhau toh kya hoga']; for (const q of cases) { if (w.classifyQuestion(q) !== 'what_if') { console.error(q, w.classifyQuestion(q)); process.exit(1); } }"],
  { cwd: root, encoding: 'utf8' },
);
if (classifyProbe) process.stdout.write(classifyProbe);
