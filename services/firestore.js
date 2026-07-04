const { applicationDefault, cert, getApps, initializeApp } = require('firebase-admin/app');
const { FieldValue, getFirestore, Timestamp } = require('firebase-admin/firestore');

const COLLECTIONS = {
  sessions: 'sessions',
  uploads: 'uploads',
  analytics: 'analytics',
  questions: 'questions',
  simulations: 'simulations',
  feedback: 'feedback',
  events: 'events',
  decisions: 'decisions',
};

let db = null;
let initError = null;

function log(level, message, details = {}) {
  const payload = Object.keys(details).length ? ` ${JSON.stringify(details)}` : '';
  console[level](`[Firestore] ${message}${payload}`);
}

function getCredentialConfig() {
  const encodedServiceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;
  if (!encodedServiceAccount) {
    return {
      credential: applicationDefault(),
      source: process.env.GOOGLE_APPLICATION_CREDENTIALS ? 'GOOGLE_APPLICATION_CREDENTIALS' : 'application_default',
    };
  }

  const serviceAccount = JSON.parse(Buffer.from(encodedServiceAccount, 'base64').toString('utf8'));
  return {
    credential: cert(serviceAccount),
    source: 'FIREBASE_SERVICE_ACCOUNT_BASE64',
  };
}

function initializeFirestore() {
  if (db) return db;
  if (initError) return null;

  try {
    const projectId = process.env.GOOGLE_CLOUD_PROJECT || process.env.GCLOUD_PROJECT;
    const credentialConfig = getCredentialConfig();
    if (!getApps().length) {
      initializeApp({
        credential: credentialConfig.credential,
        projectId,
      });
    }
    db = getFirestore();
    log('log', 'initialized', {
      projectId: projectId || '(application default)',
      credentials: credentialConfig.source,
    });
    return db;
  } catch (err) {
    initError = err;
    log('error', 'initialization failed', { message: err.message });
    return null;
  }
}

function getDb() {
  return initializeFirestore();
}

function collection(name) {
  const database = getDb();
  if (!database) {
    throw initError || new Error('Firestore is not initialized.');
  }
  return database.collection(name);
}

function now() {
  return Timestamp.now();
}

function serverTimestamp() {
  return FieldValue.serverTimestamp();
}

function docId(name) {
  return collection(name).doc().id;
}

function makeDocRef(database, name, id) {
  const col = database.collection(name);
  return id ? col.doc(String(id)) : col.doc();
}

function clean(value) {
  if (value === undefined) return undefined;
  if (value === null) return null;
  if (value instanceof Date) return value;
  if (Array.isArray(value)) {
    return value.map(clean).filter(item => item !== undefined);
  }
  if (typeof value === 'object') {
    const out = {};
    for (const [key, child] of Object.entries(value)) {
      const cleaned = clean(child);
      if (cleaned !== undefined) out[key] = cleaned;
    }
    return out;
  }
  return value;
}

async function safeWrite(operation, fallback, fn) {
  const database = getDb();
  if (!database) {
    log('warn', `${operation} skipped`, { reason: initError?.message || 'Firestore is not initialized.' });
    return fallback;
  }

  try {
    const result = await fn(database);
    log('log', `${operation} succeeded`, result?.log || {});
    return result?.value ?? result ?? fallback;
  } catch (err) {
    log('error', `${operation} failed`, { message: err.message });
    return fallback;
  }
}

async function safeRead(operation, fallback, fn) {
  const database = getDb();
  if (!database) {
    log('warn', `${operation} skipped`, { reason: initError?.message || 'Firestore is not initialized.' });
    return fallback;
  }

  try {
    const value = await fn(database);
    log('log', `${operation} succeeded`);
    return value;
  } catch (err) {
    log('error', `${operation} failed`, { message: err.message });
    return fallback;
  }
}

function sessionPayload(sessionId, extra = {}) {
  return clean({
    sessionId,
    createdAt: serverTimestamp(),
    lastActiveAt: serverTimestamp(),
    ...extra,
  });
}

async function createSession(sessionId, extra = {}) {
  if (!sessionId) return { ok: false, sessionId: null };
  return safeWrite('createSession', { ok: false, sessionId }, async database => {
    await database.collection(COLLECTIONS.sessions).doc(sessionId).set(sessionPayload(sessionId, extra), { merge: true });
    return { value: { ok: true, sessionId }, log: { sessionId } };
  });
}

async function getSession(sessionId) {
  if (!sessionId) return null;
  return safeRead('getSession', null, async database => {
    const doc = await database.collection(COLLECTIONS.sessions).doc(sessionId).get();
    return doc.exists ? { id: doc.id, ...doc.data() } : null;
  });
}

async function touchSession(sessionId, extra = {}) {
  if (!sessionId) return { ok: false, sessionId: null };
  return safeWrite('touchSession', { ok: false, sessionId }, async database => {
    await database.collection(COLLECTIONS.sessions).doc(sessionId).set(clean({
      sessionId,
      createdAt: serverTimestamp(),
      lastActiveAt: serverTimestamp(),
      ...extra,
    }), { merge: true });
    return { value: { ok: true, sessionId }, log: { sessionId } };
  });
}

async function saveEvent(payload = {}) {
  return safeWrite('saveEvent', { ok: false, id: null }, async database => {
    const ref = makeDocRef(database, COLLECTIONS.events, payload.eventId);
    await ref.set(clean({
      eventId: ref.id,
      type: payload.type,
      sessionId: payload.sessionId || null,
      uploadId: payload.uploadId || null,
      questionId: payload.questionId || null,
      simulationId: payload.simulationId || null,
      feedbackId: payload.feedbackId || null,
      metadata: payload.metadata || {},
      createdAt: serverTimestamp(),
    }), { merge: true });
    return { value: { ok: true, id: ref.id }, log: { id: ref.id, type: payload.type } };
  });
}

async function saveUpload(payload = {}) {
  return safeWrite('saveUpload', { ok: false, id: null }, async database => {
    const ref = makeDocRef(database, COLLECTIONS.uploads, payload.uploadId);
    await ref.set(clean({
      uploadId: ref.id,
      sessionId: payload.sessionId || null,
      filename: payload.filename || 'connected-data',
      source: payload.source || 'unknown',
      sheetUrlUsed: Boolean(payload.sheetUrlUsed),
      csvUsed: Boolean(payload.csvUsed),
      extractedSummary: payload.extractedSummary || null,
      createdAt: serverTimestamp(),
    }), { merge: true });
    return { value: { ok: true, id: ref.id }, log: { id: ref.id, sessionId: payload.sessionId } };
  });
}

async function saveAnalytics(payload = {}) {
  return safeWrite('saveAnalytics', { ok: false, id: null }, async database => {
    const ref = makeDocRef(database, COLLECTIONS.analytics, payload.analyticsId);
    await ref.set(clean({
      analyticsId: ref.id,
      sessionId: payload.sessionId || null,
      uploadId: payload.uploadId || null,
      simulationId: payload.simulationId || null,
      capabilityMap: payload.capabilityMap || null,
      detectedMetrics: payload.detectedMetrics || null,
      recommendations: payload.recommendations || null,
      dataSource: payload.dataSource || null,
      createdAt: serverTimestamp(),
    }), { merge: true });
    return { value: { ok: true, id: ref.id }, log: { id: ref.id, sessionId: payload.sessionId } };
  });
}

async function saveQuestion(payload = {}) {
  return safeWrite('saveQuestion', { ok: false, id: null }, async database => {
    const ref = makeDocRef(database, COLLECTIONS.questions, payload.questionId);
    await ref.set(clean({
      questionId: ref.id,
      sessionId: payload.sessionId || null,
      uploadId: payload.uploadId || null,
      simulationId: payload.simulationId || null,
      question: payload.question || '',
      answer: payload.answer || null,
      createdAt: serverTimestamp(),
    }), { merge: true });
    return { value: { ok: true, id: ref.id }, log: { id: ref.id, sessionId: payload.sessionId } };
  });
}

async function saveSimulation(payload = {}) {
  return safeWrite('saveSimulation', { ok: false, id: null }, async database => {
    const ref = makeDocRef(database, COLLECTIONS.simulations, payload.simulationId);
    await ref.set(clean({
      simulationId: ref.id,
      sessionId: payload.sessionId || null,
      uploadId: payload.uploadId || null,
      questionId: payload.questionId || null,
      assumptions: payload.assumptions || null,
      calculatedOutput: payload.calculatedOutput || null,
      recommendation: payload.recommendation || null,
      answer: payload.answer || null,
      dataSource: payload.dataSource || null,
      createdAt: serverTimestamp(),
    }), { merge: true });
    return { value: { ok: true, id: ref.id }, log: { id: ref.id, sessionId: payload.sessionId } };
  });
}

async function saveFeedback(payload = {}) {
  return safeWrite('saveFeedback', { ok: false, id: null }, async database => {
    const ref = makeDocRef(database, COLLECTIONS.feedback, payload.feedbackId);
    await ref.set(clean({
      feedbackId: ref.id,
      sessionId: payload.sessionId || null,
      simulationId: payload.simulationId || null,
      questionId: payload.questionId || null,
      userIntent: payload.userIntent || null,
      try: Boolean(payload.try),
      skip: Boolean(payload.skip),
      unsure: Boolean(payload.unsure),
      success: payload.success ?? null,
      createdAt: serverTimestamp(),
    }), { merge: true });
    return { value: { ok: true, id: ref.id }, log: { id: ref.id, intent: payload.userIntent } };
  });
}

async function saveUploadAnalysis(payload = {}) {
  return safeWrite('saveUploadAnalysis', {
    ok: false,
    uploadId: null,
    analyticsId: null,
    eventId: null,
  }, async database => {
    const uploadRef = makeDocRef(database, COLLECTIONS.uploads, payload.uploadId);
    const analyticsRef = database.collection(COLLECTIONS.analytics).doc();
    const uploadEventRef = database.collection(COLLECTIONS.events).doc();
    const analyzeEventRef = database.collection(COLLECTIONS.events).doc();
    const batch = database.batch();

    batch.set(database.collection(COLLECTIONS.sessions).doc(payload.sessionId), clean({
      sessionId: payload.sessionId,
      createdAt: serverTimestamp(),
      lastActiveAt: serverTimestamp(),
    }), { merge: true });
    batch.set(uploadRef, clean({
      uploadId: uploadRef.id,
      sessionId: payload.sessionId || null,
      filename: payload.filename || 'connected-data',
      source: payload.source || 'unknown',
      sheetUrlUsed: Boolean(payload.sheetUrlUsed),
      csvUsed: Boolean(payload.csvUsed),
      extractedSummary: payload.extractedSummary || null,
      createdAt: serverTimestamp(),
    }), { merge: true });
    batch.set(analyticsRef, clean({
      analyticsId: analyticsRef.id,
      sessionId: payload.sessionId || null,
      uploadId: uploadRef.id,
      capabilityMap: payload.capabilityMap || null,
      detectedMetrics: payload.detectedMetrics || null,
      recommendations: payload.recommendations || null,
      dataSource: payload.dataSource || null,
      createdAt: serverTimestamp(),
    }));
    batch.set(uploadEventRef, clean({
      eventId: uploadEventRef.id,
      type: 'upload',
      sessionId: payload.sessionId || null,
      uploadId: uploadRef.id,
      metadata: payload.eventMetadata || {},
      createdAt: serverTimestamp(),
    }));
    batch.set(analyzeEventRef, clean({
      eventId: analyzeEventRef.id,
      type: 'analyze',
      sessionId: payload.sessionId || null,
      uploadId: uploadRef.id,
      metadata: {
        readyCount: payload.capabilityMap?.ready_count,
        limitedCount: payload.capabilityMap?.limited_count,
        missingCount: payload.capabilityMap?.missing_count,
      },
      createdAt: serverTimestamp(),
    }));

    await batch.commit();
    return {
      value: {
        ok: true,
        uploadId: uploadRef.id,
        analyticsId: analyticsRef.id,
        eventIds: [uploadEventRef.id, analyzeEventRef.id],
      },
      log: { uploadId: uploadRef.id, analyticsId: analyticsRef.id },
    };
  });
}

async function saveSimulationFlow(payload = {}) {
  return safeWrite('saveSimulationFlow', {
    ok: false,
    simulationId: null,
    questionId: null,
    analyticsId: null,
    eventId: null,
  }, async database => {
    const simulationRef = makeDocRef(database, COLLECTIONS.simulations, payload.simulationId);
    const questionRef = database.collection(COLLECTIONS.questions).doc();
    const analyticsRef = database.collection(COLLECTIONS.analytics).doc();
    const eventRef = database.collection(COLLECTIONS.events).doc();
    const batch = database.batch();

    batch.set(database.collection(COLLECTIONS.sessions).doc(payload.sessionId), clean({
      sessionId: payload.sessionId,
      createdAt: serverTimestamp(),
      lastActiveAt: serverTimestamp(),
    }), { merge: true });
    batch.set(simulationRef, clean({
      simulationId: simulationRef.id,
      sessionId: payload.sessionId || null,
      uploadId: payload.uploadId || null,
      questionId: questionRef.id,
      assumptions: payload.assumptions || null,
      calculatedOutput: payload.calculatedOutput || null,
      recommendation: payload.recommendation || null,
      answer: payload.answer || null,
      dataSource: payload.dataSource || null,
      createdAt: serverTimestamp(),
    }));
    batch.set(questionRef, clean({
      questionId: questionRef.id,
      sessionId: payload.sessionId || null,
      uploadId: payload.uploadId || null,
      simulationId: simulationRef.id,
      question: payload.question || '',
      answer: payload.answer || null,
      createdAt: serverTimestamp(),
    }));
    batch.set(analyticsRef, clean({
      analyticsId: analyticsRef.id,
      sessionId: payload.sessionId || null,
      uploadId: payload.uploadId || null,
      simulationId: simulationRef.id,
      capabilityMap: payload.capabilityMap || null,
      detectedMetrics: payload.detectedMetrics || null,
      recommendations: payload.recommendations || null,
      dataSource: payload.dataSource || null,
      createdAt: serverTimestamp(),
    }));
    batch.set(eventRef, clean({
      eventId: eventRef.id,
      type: 'simulate',
      sessionId: payload.sessionId || null,
      uploadId: payload.uploadId || null,
      questionId: questionRef.id,
      simulationId: simulationRef.id,
      metadata: payload.eventMetadata || {},
      createdAt: serverTimestamp(),
    }));

    await batch.commit();
    return {
      value: {
        ok: true,
        simulationId: simulationRef.id,
        questionId: questionRef.id,
        analyticsId: analyticsRef.id,
        eventId: eventRef.id,
      },
      log: { simulationId: simulationRef.id, questionId: questionRef.id },
    };
  });
}

module.exports = {
  COLLECTIONS,
  initializeFirestore,
  getDb,
  collection,
  now,
  docId,
  clean,
  createSession,
  getSession,
  touchSession,
  saveUpload,
  saveAnalytics,
  saveQuestion,
  saveSimulation,
  saveFeedback,
  saveEvent,
  saveUploadAnalysis,
  saveSimulationFlow,
};
