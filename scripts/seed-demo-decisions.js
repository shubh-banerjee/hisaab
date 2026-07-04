require('dotenv').config({ quiet: true });
const firestoreService = require('../services/firestore');

const DEMO_USER_ID = 'hisaab-demo-user';

const decisions = [
  {
    question: 'If I raise my delivery fee by ₹20, what happens to repeat orders?',
    askedAt: '2026-06-05T10:00:00.000Z',
    predictedValue: -6.8,
    predictedMetric: 'repeat_orders',
    predictedRange: { low: -9.4, high: -4.1 },
    confidence: 0.81,
    dataSource: 'sheet',
    status: 'pending',
    appliedAt: null,
    actualValue: null,
    actualNote: '',
    outcomeRecordedAt: null,
  },
  {
    question: 'If I run a promotional discount in April, what lift can I expect?',
    askedAt: '2026-04-03T09:30:00.000Z',
    predictedValue: 12.4,
    predictedMetric: 'orders',
    predictedRange: { low: 8.1, high: 16.9 },
    confidence: 0.78,
    dataSource: 'sheet',
    status: 'applied',
    appliedAt: '2026-04-04T09:30:00.000Z',
    actualValue: 14.1,
    actualNote: 'April campaign completed.',
    outcomeRecordedAt: '2026-05-02T09:30:00.000Z',
  },
  {
    question: 'If I add COD as a payment option, what happens to total orders?',
    askedAt: '2026-02-10T11:15:00.000Z',
    predictedValue: 3.2,
    predictedMetric: 'orders',
    predictedRange: { low: -1.8, high: 8.4 },
    confidence: 0.42,
    dataSource: 'sheet',
    status: 'applied',
    appliedAt: '2026-02-12T11:15:00.000Z',
    actualValue: -0.5,
    actualNote: 'COD added for one month.',
    outcomeRecordedAt: '2026-03-15T11:15:00.000Z',
  },
  {
    question: 'If I stop offering free shipping, what happens to total orders?',
    askedAt: '2026-01-22T14:45:00.000Z',
    predictedValue: -18.2,
    predictedMetric: 'orders',
    predictedRange: { low: -24.5, high: -12.3 },
    confidence: 0.73,
    dataSource: 'sheet',
    status: 'skipped',
    appliedAt: null,
    actualValue: null,
    actualNote: '',
    outcomeRecordedAt: null,
  },
];

function timestamp(value) {
  return value ? new Date(value) : null;
}

async function main() {
  const firestore = firestoreService.getDb();
  if (!firestore) {
    throw new Error('Firestore is not initialized. Check GOOGLE_APPLICATION_CREDENTIALS and GOOGLE_CLOUD_PROJECT.');
  }

  const existing = await firestoreService.collection(firestoreService.COLLECTIONS.decisions)
    .where('userId', '==', DEMO_USER_ID)
    .limit(1)
    .get();

  if (!existing.empty) {
    console.log('Demo decisions already exist; skipping seed.');
    return;
  }

  const batch = firestore.batch();
  for (const decision of decisions) {
    const ref = firestoreService.collection(firestoreService.COLLECTIONS.decisions).doc();
    batch.set(ref, {
      ...decision,
      userId: DEMO_USER_ID,
      askedAt: timestamp(decision.askedAt),
      appliedAt: timestamp(decision.appliedAt),
      outcomeRecordedAt: timestamp(decision.outcomeRecordedAt),
    });
  }

  await batch.commit();
  console.log(`Seeded ${decisions.length} demo decisions for ${DEMO_USER_ID}.`);
}

main().catch(err => {
  console.error(err);
  process.exitCode = 1;
});
