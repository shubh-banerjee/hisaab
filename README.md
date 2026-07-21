# Hisaab

Hisaab is an AI-assisted what-if simulator for small retail business owners. The projected percentage is calculated from order history with simple statistics; Gemini only turns the result into plain-English guidance.

## Architecture

```
Browser (index.html)
    |  POST /api/simulate { question, sheetUrl? }
    v
Express server (server.js)
    |  getHistoricalData() <-- demo-only fixture (never used for real advice)
    |  optional Google Sheets CSV import
    |  fuzzy column matching + evidence gates for missing or weak fields
    |  regression / promo lift math computes the numeric result
    v
Google Gemini Developer API (@google/genai)
    |  receives computed numbers
    |  returns only recommendation, why, and a friendly metric label
    v
Browser renders: calculated impact + AI-written explanation
    |  X-Hisaab-Session browser UUID
    v
Firebase Firestore
    |  sessions, uploads, analytics, questions, simulations, feedback, events
```

> **BigQuery-ready data layer:** The `getHistoricalData()` function in `server.js` is isolated behind a clear comment. To connect to BigQuery in production, replace the function body with a single `bigquery.query(...)` call. Google Sheets is the near-term bridge for testing with real shop data.

## Evidence-first behavior

Hisaab separates “can calculate a number” from “has enough evidence to show it as an estimate.” Before any numeric result is shown, the server checks:

- **Source:** sample data is `demo_only`; Start Fresh is labelled self-reported; CSV and Google Sheets are labelled imported/connected data.
- **History:** too few months or bootstrap entries returns `not_enough_evidence`.
- **Required fields:** price, repeat-customer, promotion, and delivery-fee questions need the corresponding business fields.
- **Variation:** a lever that never changed cannot support a what-if estimate.
- **Range:** changes outside the observed historical range are downgraded and paired with a smaller-test suggestion.
- **Signal strength:** weak regression or promo evidence is shown as an early pattern, not a firm recommendation.

Result categories are `clear_enough`, `weak_signal`, `not_enough_evidence`, `unsupported_question`, and `demo_only`. The frontend puts the simple answer and evidence strength first; sample size, R², slope, and ranges are secondary details.

Before data is loaded, the server classifies each question into an explicit supported intent: delivery-fee change, price/average-bill change, promo/discount, repeat customers, sales trend, or COD. Unknown questions return `unsupported_question`; questions containing multiple supported changes return `clarify_intent` with simple choices. Hisaab never defaults an unclear question to delivery fee.

## What Is Calculated vs. AI-Written

The API response separates:

- `computed`: server-calculated values from historical data, including `outcome_value`, `range_low`, `range_high`, `confidence`, `monthly_revenue_impact`, `worst_case_revenue_impact`, and `trend_pct`.
- `generated`: Gemini-written language, including `recommendation`, `why`, `outcome_metric_label`, and `detected_language`.

Gemini is explicitly told not to change the numeric fields. If Gemini fails, returns malformed JSON, uses the wrong language, or reverses the calculated direction, Hisaab uses a server fallback. A fallback never replaces a missing or weak evidence result with a projection.

## Language handling

English, Devanagari Hindi, and Roman-script Hinglish have server-side fallback wording. Other languages are currently detected and safely answered in English until reviewed fallback copy is added. Wrong-language Gemini output is rejected before it reaches the user.

## Optional Google Sheets Input

The app works without a Sheet link by using the built-in demo dataset. To use real data, paste a publicly viewable Google Sheets URL into the optional field.

Expected columns can be named flexibly:

- `month` or `date`
- `orders`, `order_count`, or `total_orders`
- `repeat_orders`, `repeatorders`, or `returning_orders`
- `avg_order_value`, `average_order_value`, or `aov`
- `delivery_fee`, `shipping_fee`, or `delivery_charge`
- `promo_active`, `promo`, `promotion`, or `discount`

When a Sheet or CSV is provided, missing critical fields are not filled with demo data. The API returns `status: "needs_input"` or an evidence limitation with detected columns, missing business concepts, and compatible capabilities. Users can continue without a capability, choose a detected column, or provide a clearly labelled average bill amount. Demo data is used only in explicit Demo example mode.

Column classification is adaptive: the server sends headers and sample rows to Gemini, which classifies concepts such as order date, order ID, customer identifier, order value, delivery fee, promo flag, and order status. The server then aggregates order-level rows into monthly summaries before running regression.

This adds one extra Gemini call per Sheet-backed simulation. Classifications are not cached yet, so repeated questions against the same Sheet currently re-classify the headers each time.

## How We Verify Accuracy

The project does not ask Gemini to invent the impact number. The server first detects the likely lever in the question:

- Delivery fee or price questions use a simple linear regression against the selected result metric.
- Promo or discount questions compare promo months to non-promo months.
- The range uses a basic standard-error estimate.
- The confidence score is based on sample size and fit strength, such as R² for regression.

This is intentionally lightweight, but it is real math from the historical rows. Gemini only explains the computed result in shop-owner language. The calculations are directional estimates, not guarantees or causal proof.

## Installation

```bash
npm install
cp .env.example .env
```

## Environment Variables

Put these values in `.env`:

```bash
GEMINI_API_KEY=
GEMINI_MODEL=gemini-2.5-flash-lite
PORT=8080
```

| Variable | Required | Default | Description |
| --- | --- | --- | --- |
| `GEMINI_API_KEY` | Yes | None | Gemini Developer API key from Google AI Studio |
| `GEMINI_MODEL` | No | `gemini-2.5-flash-lite` | Gemini model used for wording only |
| `PORT` | No | `8080` | Port the Express server listens on |
| `GOOGLE_APPLICATION_CREDENTIALS` | Local only | ADC | Absolute path to a Google Cloud service-account JSON key with Firestore access |
| `FIREBASE_SERVICE_ACCOUNT_BASE64` | Vercel only | None | Base64-encoded Firebase service-account JSON for hosts without ADC or mounted files |
| `GOOGLE_CLOUD_PROJECT` | Usually local | ADC project | Firestore project ID if it cannot be inferred from credentials |

## Get a Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/apikey).
2. Sign in with your Google account.
3. Create an API key.
4. Paste it into `.env` as `GEMINI_API_KEY=your_key_here`.

This project uses the Gemini Developer API through `@google/genai`. Persistence uses Firebase Admin SDK with Google Application Default Credentials.

## Firebase Firestore Storage

Create a Firestore database in Native mode in your Google Cloud project, then run the server with Application Default Credentials:

```bash
export GOOGLE_APPLICATION_CREDENTIALS=/absolute/path/to/service-account.json
export GOOGLE_CLOUD_PROJECT=your-firestore-project-id
```

On Cloud Run, grant the service account Firestore access and omit `GOOGLE_APPLICATION_CREDENTIALS`; the default runtime identity is used automatically.

On Vercel, set `FIREBASE_SERVICE_ACCOUNT_BASE64` instead because serverless functions cannot rely on a local key file or attached GCP runtime identity.

The browser creates a stable `hisaabSessionId` in `localStorage` and sends it as `X-Hisaab-Session` on API requests. There are no accounts or passwords.

Main collections:

- `sessions`
- `uploads`
- `analytics`
- `questions`
- `simulations`
- `feedback`
- `events`
- `decisions` for the legacy decision endpoints

Decision endpoints:

```bash
GET /api/decisions
POST /api/decisions
PATCH /api/decisions/:id
GET /api/decisions/track-record
```

If Firestore credentials are missing or rejected, these endpoints return HTTP 503 and do not fall back to in-memory data.

Seed demo history for pitch demos:

```bash
npm run seed:demo-decisions
```

Then the frontend's empty decision log can load demo entries through `/api/decisions?demo=true`. Demo entries are returned with `isDemo: true` and are badged in the UI.

## Supported data formats

Hisaab accepts:

- CSV uploads with a date/month column and an order ID or order count. Optional columns include total bill amount, delivery fee, customer name/phone/email, customer ID, discount/promo flag, and order status.
- Public Google Sheets links that export as CSV.
- Start Fresh daily entries containing order count and optional delivery fee or average bill amount.
- Explicit Demo example data, which is illustrative only and never saved as a real decision.

Column names do not need to match exactly. Hisaab shows detected columns and asks the user to choose when a business meaning is ambiguous. Cancelled, refunded, and returned rows are excluded when an order-status field is available.

## First-run experience

The first screen has two clear choices: **Try demo** or **Use my data**. Demo is explicitly example data and is not treated as the shop owner's history. Choosing **Use my data** then offers three simple paths: upload a sales file, connect a public Google Sheet, or add today's sales manually. File-reading, missing-data, and capability details appear only after the user chooses a data path and provides data.

The interface uses everyday business language such as orders, sales, delivery fee, offers, small test, and not enough data. Technical details remain available only where they help explain a result.

## Tests

Run the lightweight built-in Node test suite:

```bash
npm test
```

The suite covers source labels, evidence gates, minimum history, missing fields, lever variation, extrapolation, weak signals, sample wording, language fallback, CSV mapping, bootstrap aggregation, comparison categories, zero/negative baselines, and save-failure copy. It does not require Gemini calls or a network listener.

Trend questions use a dedicated server-owned path: imported monthly data compares recent versus previous periods, while a mature daily diary compares the latest 7 days with the previous 7. Trend answers do not run price or delivery-fee regression and do not show prediction ranges. If total bill amount is missing, Hisaab answers order trend only and says what is needed for a sales-value trend.

## Current limitations

- Evidence is directional and statistical; it cannot prove that a lever caused an outcome.
- A connected sheet must be publicly readable as CSV. Private sheets and malformed exports are rejected.
- Repeat-customer analysis needs a usable customer identifier and can be weak when most customers appear once.
- Promo analysis needs both promo and non-promo periods; discount depth and other simultaneous changes may confound it.
- Start Fresh needs at least 20 daily entries and still supports fewer capabilities than order-level data.
- Question intent is deterministic keyword/phrase classification, not a general-purpose natural-language understanding model. Unclear or multi-intent questions are stopped rather than guessed.
- Trend analysis needs at least two usable monthly periods, or 14 daily entries for the daily diary path. A short file cannot support an honest trend comparison.
- No automated browser end-to-end suite or CI workflow is configured yet; the primary flows still need manual QA before a public demo.

## Run the Project

```bash
npm run dev
```

Open [http://localhost:8080](http://localhost:8080).

For production-style local execution:

```bash
npm start
```

Both `npm run dev` and `npm start` load `.env` automatically.

## Smoke Test the API

```bash
curl http://localhost:8080/health

curl -X POST http://localhost:8080/api/simulate \
  -H "Content-Type: application/json" \
  -d '{"question":"If I raise the delivery fee by 10%, what happens to repeat orders?"}'
```

With a public Google Sheet:

```bash
curl -X POST http://localhost:8080/api/simulate \
  -H "Content-Type: application/json" \
  -d '{"question":"If I raise the delivery fee by 10%, what happens to repeat orders?","sheetUrl":"https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/edit"}'
```

## Deploy to Google Cloud Run

```bash
gcloud run deploy hisaab \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars GEMINI_API_KEY=your_actual_key_here,GEMINI_MODEL=gemini-2.5-flash-lite
```

## Tech Stack

- **Backend:** Node.js + Express
- **Math:** Plain JavaScript regression and promo lift calculations
- **AI:** Gemini Developer API via `@google/genai` for wording only
- **Frontend:** Plain HTML + CSS + JS
- **Container:** Docker on `node:20-alpine`
- **Deploy target:** Vercel
