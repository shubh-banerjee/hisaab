const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const scriptPath = path.join(root, 'public', 'script.js');

function read(filePath) {
  return fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf8') : '';
}

function writeIfChanged(filePath, before, after, label) {
  if (after !== before) {
    fs.writeFileSync(filePath, after, 'utf8');
    console.log(`[voice-safety-fixes] ${label}`);
  }
}

function replaceOrThrow(source, regex, replacement, label) {
  if (!regex.test(source)) {
    throw new Error(`${label} marker not found`);
  }
  return source.replace(regex, replacement);
}

function patchScript() {
  if (!fs.existsSync(scriptPath)) return;
  let source = read(scriptPath);
  const before = source;

  // Keep the copy consistent anywhere the old broad-language version still appears.
  source = source.replaceAll('Tap to speak your question — in any language', 'Tap to speak your question — in English, Hindi, or Hinglish');

  if (!source.includes('voice-soft-note-v2')) {
    const helper = `
  // voice-soft-note-v2: mic/transcription is only an input helper. It must never
  // close the Ask Hisaab shell or send the user back to the landing page.
  function showMicSoftNote(message) {
    const listeningNote = document.getElementById('mic-listening-note');
    if (!listeningNote) return;
    listeningNote.hidden = false;
    listeningNote.textContent = message;
    window.clearTimeout(showMicSoftNote.timer);
    showMicSoftNote.timer = window.setTimeout(() => {
      if (listeningNote && !recognizing) listeningNote.hidden = true;
    }, 4200);
  }
`;
    const marker = /  function stopRecorderTracks\(stream\) \{\n    try \{ stream\.getTracks\(\)\.forEach\(track => track\.stop\(\)\); \} catch \(_err\) \{ \/\* noop \*\/ \}\n  \}\n/;
    source = replaceOrThrow(source, marker, match => match + helper, 'stopRecorderTracks helper');
  }

  // Short recordings may still contain a rough Web Speech preview. Keep it and
  // show a soft note instead of clearing the box and raising a global error.
  source = source.replace(
    /      if \(elapsed < MIN_RECORD_MS \|\| !hasSpokenYet\) \{\n        mediaChunks = \[\];\n        \/\/ Clear any live-preview leftovers if the recording was too short\/empty\.\n        questionInput\.classList\.remove\('live-previewing'\);\n        if \(livePreviewText\) \{\n          livePreviewText = '';\n          questionInput\.value = '';\n          resizeQuestion\(\);\n          updateQuestionState\(\);\n        \}\n        showError\('I didn\\'t catch anything\. Tap the mic and try speaking again\.'\);\n        return;\n      \}/,
    `      if (elapsed < MIN_RECORD_MS || !hasSpokenYet) {
        mediaChunks = [];
        questionInput.classList.remove('live-previewing');
        if (livePreviewText) {
          questionInput.value = livePreviewText;
          resizeQuestion();
          updateQuestionState();
          hideValidationNudge();
          showMicSoftNote('I heard this roughly. Edit it if needed, then ask Hisaab.');
        } else {
          showMicSoftNote('I could not hear that clearly. Try again or type the question.');
        }
        questionInput.focus();
        return;
      }`
  );

  source = source.replace(
    /  async function transcribeRecording\(\) \{\n    if \(!mediaChunks\.length\) \{\n      questionInput\.classList\.remove\('live-previewing'\);\n      showError\('I didn\\'t catch anything\. Tap the mic and try speaking again\.'\);\n      return;\n    \}/,
    `  async function transcribeRecording() {
    if (!mediaChunks.length) {
      questionInput.classList.remove('live-previewing');
      showMicSoftNote('I could not hear that clearly. Try again or type the question.');
      questionInput.focus();
      return;
    }`
  );

  const oldCatchRegex = /    \} catch \(err\) \{\n      \/\/ If Gemini failed but we do have live-preview text, keep it — better than\n      \/\/ nothing, and clearly marked as preview to the user\.\n      if \(!livePreviewText\) showError\(err\.message\);\n      else showError\(`Couldn't refine the transcription \(\$\{err\.message\}\)\. Using the rough live preview — feel free to edit before running\.`\);\n    \} finally \{/;
  if (oldCatchRegex.test(source)) {
    source = source.replace(oldCatchRegex, `    } catch (_err) {
      // voice-transcription-nonblocking-v2: failed transcription should keep
      // the current/rough text in the Ask screen, not show a global error.
      const fallbackTranscript = (livePreviewText || questionInput.value || '').trim();
      if (fallbackTranscript) {
        questionInput.value = fallbackTranscript;
        resizeQuestion();
        updateQuestionState();
        hideValidationNudge();
        showMicSoftNote('I heard this roughly. Edit it if needed, then ask Hisaab.');
        questionInput.focus();
      } else {
        showMicSoftNote('I could not hear that clearly. Try again or type the question.');
        questionInput.focus();
      }
    } finally {`);
  }

  // A prior deployment may have already changed the catch comment but still
  // left showError() inside it. Remove any remaining transcription-level global
  // errors in this narrow function scope.
  source = source.replace(
    /      if \(!livePreviewText\) showError\(err\.message\);\n      else showError\(`Couldn't refine the transcription \(\$\{err\.message\}\)\. Using the rough live preview — feel free to edit before running\.`\);/,
    `      const fallbackTranscript = (livePreviewText || questionInput.value || '').trim();
      if (fallbackTranscript) {
        questionInput.value = fallbackTranscript;
        resizeQuestion();
        updateQuestionState();
        hideValidationNudge();
        showMicSoftNote('I heard this roughly. Edit it if needed, then ask Hisaab.');
      } else {
        showMicSoftNote('I could not hear that clearly. Try again or type the question.');
      }`
  );

  writeIfChanged(scriptPath, before, source, 'patched public/script.js');
}

try {
  patchScript();
} catch (err) {
  console.warn(`[voice-safety-fixes] skipped: ${err.message}`);
}
