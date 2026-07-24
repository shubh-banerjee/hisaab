const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const scriptPath = path.join(root, 'public', 'script.js');
const cssPath = path.join(root, 'public', 'style.css');
const htmlPath = path.join(root, 'public', 'index.html');
const serverPath = path.join(root, 'server.js');

function read(filePath) {
  return fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf8') : '';
}

function writeIfChanged(filePath, before, after, label) {
  if (after !== before) {
    fs.writeFileSync(filePath, after, 'utf8');
    console.log(`[runtime-fixes] ${label}`);
  }
}

function insertAfterOnce(source, marker, code, uniqueMarker) {
  if (source.includes(uniqueMarker)) return source;
  if (!source.includes(marker)) throw new Error(`[runtime-fixes] marker not found: ${uniqueMarker}`);
  return source.replace(marker, marker + '\n' + code);
}

function patchScript() {
  if (!fs.existsSync(scriptPath)) return;
  let source = read(scriptPath);
  const before = source;

  source = insertAfterOnce(
    source,
    '  const subjectVocabulary = /\\b(fee|fees|price|prices|promo|promotion|discount|cod|cash on delivery|delivery|shipping|orders?|repeat|customer|customers|revenue|aov|month|months)\\b/i;',
    [
      '  const CSV_MAX_BYTES = 4 * 1024 * 1024;',
      '  const CSV_TOO_LARGE_MESSAGE = \'This CSV is too large for quick upload. Use a CSV under 4 MB, or connect the data through Google Sheets.\';'
    ].join('\n'),
    'CSV_TOO_LARGE_MESSAGE'
  );

  source = insertAfterOnce(source, '  let uploadedCsv = null;', '  let uploadedCsvSize = 0;', 'uploadedCsvSize');

  const handleCsvReplacement = [
    '  async function handleCsvFile() {',
    '    const file = csvFileInput.files?.[0];',
    '    if (!file) return;',
    "    setPath('real');",
    '    dcHideError();',
    '    if (file.size > CSV_MAX_BYTES) {',
    '      uploadedCsv = null;',
    '      uploadedCsvSize = 0;',
    "      uploadedFileName = '';",
    "      csvFileInput.value = '';",
    '      renderCsvUploadState();',
    '      renderSheetUrlState();',
    '      updateDcReadButtonState();',
    "      const note = document.getElementById('pending-data-note');",
    '      if (note) note.hidden = true;',
    '      dcShowError(CSV_TOO_LARGE_MESSAGE);',
    '      return;',
    '    }',
    "    sheetUrlInput.value = '';",
    '    uploadedFileName = file.name;',
    '    uploadedCsvSize = file.size;',
    '    uploadedCsv = await file.text();',
    '    connectedDataLabel = uploadedFileName;',
    '    renderCsvUploadState();',
    '    renderSheetUrlState();',
    '    updateDcLinkStatus();',
    "    const isInlineRefresh = stage.classList.contains('connecting-data') && Boolean(currentResult);",
    '    if (isInlineRefresh) {',
    '      await parseConnectedData();',
    '    } else {',
    '      updateDcReadButtonState();',
    "      const noteText = document.getElementById('pending-data-note-text');",
    "      const note = document.getElementById('pending-data-note');",
    '      if (noteText) noteText.textContent = `${uploadedFileName} selected — click Read data.`;',
    '      if (note) note.hidden = false;',
    '    }',
    '  }'
  ].join('\n');

  source = source.replace(/  async function handleCsvFile\(\) \{[\s\S]*?\n  \}\n\n  function clearCsvUpload\(\) \{/, handleCsvReplacement + '\n\n  function clearCsvUpload() {');
  source = source.replace("  function clearCsvUpload() {\n    uploadedCsv = null;\n    uploadedFileName = '';", "  function clearCsvUpload() {\n    uploadedCsv = null;\n    uploadedCsvSize = 0;\n    uploadedFileName = '';");

  source = insertAfterOnce(
    source,
    '    if (!uploadedCsv && sheetUrl.length <= 20) return;',
    ['', '    if (uploadedCsv && uploadedCsvSize > CSV_MAX_BYTES) {', "      setDcScreen('upload');", '      dcShowError(CSV_TOO_LARGE_MESSAGE);', '      updateDcReadButtonState();', '      return;', '    }'].join('\n'),
    'uploadedCsvSize > CSV_MAX_BYTES'
  );

  if (!source.includes('throw new Error(CSV_TOO_LARGE_MESSAGE);\n        const body = await readJsonResponse(res);')) {
    source = source.replaceAll(
      '        const body = await readJsonResponse(res);\n        if (!res.ok) throw new Error(body.error || `Server error (HTTP ${res.status})`);',
      '        if (res.status === 413) throw new Error(CSV_TOO_LARGE_MESSAGE);\n        const body = await readJsonResponse(res);\n        if (!res.ok) throw new Error(body.error || `Server error (HTTP ${res.status})`);'
    );
  }
  if (!source.includes('throw new Error(CSV_TOO_LARGE_MESSAGE);\n      const body = await readJsonResponse(res);')) {
    source = source.replaceAll(
      '      const body = await readJsonResponse(res);\n      if (!res.ok) throw new Error(body.error || `Server error (HTTP ${res.status})`);',
      '      if (res.status === 413) throw new Error(CSV_TOO_LARGE_MESSAGE);\n      const body = await readJsonResponse(res);\n      if (!res.ok) throw new Error(body.error || `Server error (HTTP ${res.status})`);'
    );
  }

  source = source.replace(/  function setLoading\(isLoading, isRefine = false\) \{[\s\S]*?\n  \}\n\n  function setSubmissionLocked\(locked\) \{/, [
    '  function setLoading(isLoading, isRefine = false) {',
    '    requestInFlight = isLoading;',
    '    const text = isRefine ? refineBtnText : btnText;',
    '    const loader = isRefine ? refineBtnLoader : btnLoader;',
    '    const btn = isRefine ? refineSend : simulateBtn;',
    "    const isDcAskSubmit = !isRefine && simulateBtn.classList.contains('dc-ask-cta');",
    '',
    '    if (isDcAskSubmit) {',
    '      text.hidden = false;',
    "      text.textContent = isLoading ? 'Thinking…' : 'Ask Hisaab';",
    '      loader.hidden = !isLoading;',
    '    } else {',
    '      text.hidden = isLoading;',
    '      loader.hidden = !isLoading;',
    '    }',
    '',
    '    if (btn) {',
    "      btn.classList.toggle('loading', isLoading);",
    "      btn.setAttribute('aria-busy', isLoading ? 'true' : 'false');",
    '    }',
    '',
    "    const loadingShell = isRefine ? refineInline : (composer || document.getElementById('ask-block'));",
    "    if (loadingShell) loadingShell.classList.toggle('loading', isLoading);",
    '    setSubmissionLocked(isLoading);',
    '  }',
    '',
    '  function setSubmissionLocked(locked) {'
  ].join('\n'));

  if (!source.includes('voice-transcription-nonblocking-v1')) {
    source = source.replaceAll('Tap to speak your question — in any language', 'Tap to speak your question — in English, Hindi, or Hinglish');
    const transcribeCatchMarker = `    } catch (err) {
      // If Gemini failed but we do have live-preview text, keep it — better than
      // nothing, and clearly marked as preview to the user.
      if (!livePreviewText) showError(err.message);
      else showError(\`Couldn't refine the transcription (${err.message}). Using the rough live preview — feel free to edit before running.\`);
    } finally {`;
    const transcribeCatchReplacement = `    } catch (err) {
      // voice-transcription-nonblocking-v1: transcription is only an input helper.
      // It must never close the Ask Hisaab shell, show a global error, or block a
      // typed/rough Hinglish/Hindi question from being asked.
      const listeningNote = document.getElementById('mic-listening-note');
      if (livePreviewText) {
        questionInput.value = livePreviewText;
        resizeQuestion();
        updateQuestionState();
        hideValidationNudge();
        if (listeningNote) {
          listeningNote.hidden = false;
          listeningNote.textContent = 'I heard this roughly. Edit it if needed, then ask Hisaab.';
          window.setTimeout(() => {
            if (listeningNote && !recognizing) listeningNote.hidden = true;
          }, 4200);
        }
        questionInput.focus();
      } else if (listeningNote) {
        listeningNote.hidden = false;
        listeningNote.textContent = 'I could not hear that clearly. Try again or type the question.';
        window.setTimeout(() => {
          if (listeningNote && !recognizing) listeningNote.hidden = true;
        }, 4200);
      }
    } finally {`;
    if (!source.includes(transcribeCatchMarker)) throw new Error('transcribe catch marker not found');
    source = source.replace(transcribeCatchMarker, transcribeCatchReplacement);
  }

  if (!source.includes('dc-summary-boundary-fix')) {
    source = source.replace(
      "titleEl.textContent = \"I couldn't find much to work with\";\n        subEl.textContent = \"This sheet doesn't have enough reliable data yet for me to answer real business questions.\";",
      "titleEl.textContent = \"This doesn't look like sales data\";\n        const rowText = Number.isFinite(summary.raw_rows) && summary.raw_rows > 0 ? `I found ${summary.raw_rows} rows, but` : 'I';\n        subEl.textContent = `${rowText} could not find reliable order, sales, customer, delivery fee, or discount columns. Hisaab works best with shop sales/order data.`;"
    );

    source = source.replace(
      "    }\n  }\n\n  // Populates the Ask Hisaab screen's suggested prompts",
      [
        '    }',
        '',
        '    // dc-summary-boundary-fix: random/non-business CSVs should stop at the boundary.',
        "    const summaryAskCta = document.getElementById('dc-ask-cta-btn');",
        '    if (summaryAskCta) {',
        '      const canAskHisaab = capLabels.length > 0;',
        "      summaryAskCta.dataset.dcAction = canAskHisaab ? 'ask' : 'upload';",
        "      summaryAskCta.textContent = canAskHisaab ? 'Ask Hisaab' : 'Upload sales data';",
        '      summaryAskCta.disabled = false;',
        "      summaryAskCta.setAttribute('aria-label', canAskHisaab ? 'Ask Hisaab' : 'Upload sales data');",
        '    }',
        '  }',
        '',
        "  // Populates the Ask Hisaab screen's suggested prompts"
      ].join('\n')
    );
  }

  if (!source.includes('dc-summary-upload-action')) {
    source = source.replace(
      "    if (askCtaBtn) askCtaBtn.addEventListener('click', () => {",
      [
        "    if (askCtaBtn) askCtaBtn.addEventListener('click', () => {",
        "      // dc-summary-upload-action: non-business data returns to upload instead of opening chat.",
        "      if (askCtaBtn.dataset.dcAction === 'upload') {",
        "        questionInput.value = '';",
        "        resizeQuestion();",
        "        updateQuestionState();",
        "        hideGuidanceMessage();",
        "        dcHideError();",
        "        setDcScreen('upload');",
        "        updateDcReadButtonState();",
        "        return;",
        "      }"
      ].join('\n')
    );
  }

  writeIfChanged(scriptPath, before, source, 'patched public/script.js');
}

function patchServer() {
  if (!fs.existsSync(serverPath)) return;
  let source = read(serverPath);
  const before = source;

  if (!source.includes('hisaab-scope-guidance')) {
    const helper = [
      '// hisaab-scope-guidance: Hisaab is a small-business sales analyst, not a generic CSV chatbot.',
      'function askableCapabilitiesFromSummary(sheetSummary) {',
      '  const capabilities = sheetSummary?.capability_map?.capabilities || [];',
      "  return capabilities.filter(item => item.status === 'ready' || item.status === 'limited');",
      '}',
      '',
      'function supportedQuestionsFromSummary(sheetSummary) {',
      '  const direct = (sheetSummary?.suggested_questions || []).filter(Boolean).slice(0, 3);',
      '  if (direct.length) return direct;',
      '  const questionByKey = {',
      "    sales_trend: 'Are my orders going up or down?',",
      "    pricing: 'What happens if I change my prices?',",
      "    delivery_fee: 'Should I raise my delivery fee?',",
      "    promotions: 'Are my discounts actually working?',",
      "    repeat_customers: 'Are customers coming back?',",
      '  };',
      '  return askableCapabilitiesFromSummary(sheetSummary).map(item => questionByKey[item.key]).filter(Boolean).slice(0, 3);',
      '}',
      '',
      'function datasetLooksLikeHisaabData(data, dataSource, sheetSummary) {',
      '  if ((data || []).length > 0) return true;',
      '  if (sheetSummary?.orders_found) return true;',
      '  if (askableCapabilitiesFromSummary(sheetSummary).length > 0) return true;',
      '  const sources = dataSource?.field_sources || {};',
      "  return ['orders', 'avg_order_value', 'delivery_fee', 'promo_active', 'repeat_orders'].some(field => isSourceUsable(sources[field]));",
      '}',
      '',
      'function readableMissingField(field) {',
      "  if (field === 'orders') return 'order date or order count';",
      "  if (field === 'delivery_fee') return 'delivery fee';",
      "  if (field === 'avg_order_value') return 'sales or order value';",
      "  if (field === 'promo_active') return 'discount or promo history';",
      "  if (field === 'repeat_orders_proxy') return 'customer or repeat-order data';",
      "  return String(field || '').replace(/_/g, ' ');",
      '}',
      '',
      'function guidanceForUnsupportedDataset(sheetSummary, dataSource) {',
      '  const rows = Number(sheetSummary?.raw_rows || dataSource?.sheet_rows_used || 0);',
      "  const rowLead = rows > 0 ? ('I found ' + rows + ' rows, but') : 'I read the file, but';",
      "  return rowLead + ' this does not look like shop sales data yet. Hisaab works with orders, sales/order value, customers, delivery fees, discounts, or promos — upload that kind of data to get a real answer.';",
      '}',
      '',
      'function guidanceForMissingDataQuestion(question, missingFields, sheetSummary) {',
      "  const text = String(question || '').toLowerCase();",
      '  const suggested = supportedQuestionsFromSummary(sheetSummary);',
      "  const suffix = suggested.length ? (' I can still help with: ' + suggested.slice(0, 2).join(' or ') + '.') : ' Upload shop sales/order data to get a reliable answer.';",
      "  if (/profit|margin|cost|expense|expenses|cogs/.test(text)) return 'I cannot calculate profit honestly because cost or margin data is missing.' + suffix;",
      "  if (/product|item|sku|category/.test(text)) return 'I cannot compare products honestly because product/category data is missing.' + suffix;",
      "  if (/customer|repeat|loyal/.test(text) && missingFields.some(item => item.field === 'repeat_orders_proxy')) return 'I cannot answer repeat-customer questions honestly because customer data is missing.' + suffix;",
      "  const missingNames = missingFields.map(item => readableMissingField(item.field));",
      "  return 'I do not have reliable ' + missingNames.join(' or ') + ' data to answer that specific question yet.' + suffix;",
      '}',
      '',
      'async function sendHisaabGuidance(res, { sessionId, uploadId, question, dataSource, sheetSummary, guidanceMessage, suggestedQuestions, missingFields = [], reason = \'guidance\' }) {',
      '  const answer = guidanceMessage;',
      '  const questionPersistence = await firestoreService.saveQuestion({ sessionId, uploadId: uploadId || null, question: question.trim(), answer });',
      '  await firestoreService.saveEvent({',
      "    type: 'ask',",
      '    sessionId,',
      '    uploadId: uploadId || null,',
      '    questionId: questionPersistence.id,',
      "    metadata: { status: 'guidance', reason, missingFields: missingFields.map(item => item.field || item) },",
      '  });',
      '  return res.json({',
      '    session_id: sessionId,',
      "    status: 'guidance',",
      '    guidance_message: guidanceMessage,',
      '    suggested_questions: (suggestedQuestions || []).slice(0, 3),',
      '    detected_language: detectFallbackLanguage(question),',
      '    data_source: dataSource,',
      '    sheet_summary: sheetSummary,',
      '    persistence: { question: questionPersistence },',
      '  });',
      '}',
      ''
    ].join('\n');
    source = source.replace("app.post('/api/simulate', async (req, res) => {", helper + "\napp.post('/api/simulate', async (req, res) => {");
  }

  const guardedBlockRegex = /  if \(\(sheetUrl && String\(sheetUrl\)\.trim\(\)\) \|\| \(csvText && String\(csvText\)\.trim\(\)\)\) \{[\s\S]*?  \}\n\n  const summary = summarizeData\(data\);/;
  if (guardedBlockRegex.test(source) && !source.includes('question-scope-before-missing-fields')) {
    source = source.replace(guardedBlockRegex, String.raw`  const hasConnectedInput = Boolean((sheetUrl && String(sheetUrl).trim()) || (csvText && String(csvText).trim()));
  if (hasConnectedInput) {
    // question-scope-before-missing-fields: first validate uploaded file scope. Random CSVs must not open generic chat.
    if (!datasetLooksLikeHisaabData(data, dataSource, sheetSummary)) {
      return sendHisaabGuidance(res, {
        sessionId,
        uploadId,
        question,
        dataSource,
        sheetSummary,
        guidanceMessage: guidanceForUnsupportedDataset(sheetSummary, dataSource),
        suggestedQuestions: [],
        reason: 'unsupported_dataset',
      });
    }

    const questionText = question.trim();
    const earlyScenario = detectScenario(questionText, data);
    if (earlyScenario.hasLeverSignal) {
      const missingFields = missingCriticalFields(questionText, dataSource);
      if (missingFields.length) {
        return sendHisaabGuidance(res, {
          sessionId,
          uploadId,
          question,
          dataSource,
          sheetSummary,
          guidanceMessage: guidanceForMissingDataQuestion(questionText, missingFields, sheetSummary),
          suggestedQuestions: supportedQuestionsFromSummary(sheetSummary),
          missingFields,
          reason: 'missing_required_data',
        });
      }
    }
  }

  const summary = summarizeData(data);`);
  }

  writeIfChanged(serverPath, before, source, 'patched server.js');
}

function patchCss() {
  if (!fs.existsSync(cssPath)) return;
  let source = read(cssPath);
  const before = source;
  if (!source.includes('ask-cta-permanent-fix')) {
    source += `

/* ask-cta-permanent-fix: keep Ask Hisaab CTA stable while request is running */
.dc-ask-cta{display:inline-flex!important;align-items:center!important;justify-content:center!important;gap:8px!important;min-width:132px!important;min-height:44px!important;width:auto!important;white-space:nowrap!important;}
.dc-ask-cta .btn-text{display:inline-flex!important;align-items:center!important;justify-content:center!important;width:auto!important;height:auto!important;line-height:1!important;}
.dc-ask-cta .btn-loader{display:inline-flex!important;align-items:center!important;justify-content:center!important;width:16px!important;height:16px!important;flex:0 0 16px!important;}
.dc-ask-cta .btn-loader[hidden]{display:none!important;}
.dc-ask-cta.loading,.dc-ask-cta:disabled.loading{background:var(--accent)!important;border-color:var(--accent)!important;color:#fff!important;opacity:1!important;cursor:progress!important;}
.dc-ask-cta.loading:hover,.dc-ask-cta:disabled.loading:hover{background:var(--accent)!important;}
.dc-ask-cta.loading .spinner{width:14px!important;height:14px!important;border-width:2px!important;}
`;
  }
  writeIfChanged(cssPath, before, source, 'patched public/style.css');
}

function patchHtml() {
  if (!fs.existsSync(htmlPath)) return;
  let source = read(htmlPath);
  const before = source;
  source = source.replace('<span class="dc-dropzone-sub">CSV files only</span>', '<span class="dc-dropzone-sub">CSV files under 4 MB</span>');
  writeIfChanged(htmlPath, before, source, 'patched public/index.html');
}

function runPatch(label, fn) {
  try {
    fn();
  } catch (err) {
    console.warn(`[runtime-fixes] skipped ${label}: ${err.message}`);
  }
}

runPatch('public/script.js', patchScript);
runPatch('server.js', patchServer);
runPatch('public/style.css', patchCss);
runPatch('public/index.html', patchHtml);
