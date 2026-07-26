# Hisaab

"Hisaab gives small retail business owners an honest answer to their toughest business decisions - grounded in their own sales data, not guesswork."

## Architecture

```
Browser (index.html)
    |  POST /api/simulate { question, sheetUrl? }
    v
Express server (server.js)
    |  getHistoricalData() <-- synthetic JSON demo dataset
    |  optional Google Sheets / CSV import
    |  fuzzy column matching + honest guidance for missing fields
    |  question-type routing (services/business-workflow.js):
    |    - numeric what-if (price/fee/promo) -> regression engine
    |    - trend / retention / general business questions -> a
    |      separate "business result" bundle + answer-type routing
    |  regression / promo-lift math computes the numeric result
    v
Google Gemini Developer API (@google/genai)
    |  receives the already-computed numbers
    |  returns only recommendation, why, and plain-language wording
    |  (regression never asks Gemini for a number; Gemini never
    |  invents one)
    v
Browser renders: calculated impact + AI-written explanation
    |  X-Hisaab-Session browser UUID
    v
Firebase Firestore
    |  sessions, uploads, analytics, questions, simulations, feedback, events
```

> **On "BigQuery-ready":** an earlier version of this README described `getHistoricalData()` as BigQuery-ready. There is no BigQuery integration anywhere in this codebase today — that line was aspirational, not implemented, and has been removed to keep this doc honest. Firestore is the real, live data layer; Google Sheets/CSV is the real ingestion path. BigQuery would be a genuinely reasonable next step if the product ever needs to aggregate across many shops at once (cross-shop benchmarking, large-scale prediction tracking) — Firestore is not well-suited to that kind of query — but nothing here uses it today.

## What Is Calculated vs. AI-Written

The API response separates:

- `computed`: server-calculated values from historical data, including `outcome_value`, `range_low`, `range_high`, `confidence`, `monthly_revenue_impact`, `worst_case_revenue_impact`, and `trend_pct`.
- `generated`: Gemini-written language, including `recommendation`, `why`, `outcome_metric_label`, and `detected_language`.

Gemini is explicitly told not to change the numeric fields. When Gemini's rewrite call fails or times out, the server falls back to a plain templated description of the same real numbers — this is disclosed to the user (`ai-wording-note` in the UI), not hidden, so a degraded AI-wording layer never quietly presents as full confidence.

## Multilingual Questions

Be precise about what's actually true here, since an earlier draft of this README overclaimed it: the app's own UI chrome (buttons, labels) has real translations for **English and Hindi only** — not Bengali or Tamil. Gemini's own language understanding is broader than that, so a question asked in another language may still get a reasonable answer, but the surrounding product experience is not actually localized beyond English/Hindi today.

For the answer content itself, Hisaab detects the question's language (English / Hindi / Hinglish) and asks Gemini to reply in kind — this is implemented, not a future milestone. Hinglish specifically is the hardest of the three registers for a model to hit consistently on a rewrite task; the code retries once with a firmer instruction if the model's own reported language doesn't match what was asked for, and falls back to English (with a visible server-side log, not a silent failure) if it still doesn't match after the retry.

## Optional Google Sheets Input

The app works without a Sheet link by using the built-in demo dataset. To use real data, paste a publicly viewable Google Sheets URL into the optional field.

Expected columns can be named flexibly:

- `month` or `date`
- `orders`, `order_count`, or `total_orders`
- `repeat_orders`, `repeatorders`, or `returning_orders`
- `avg_order_value`, `average_order_value`, or `aov`
- `delivery_fee`, `shipping_fee`, or `delivery_charge`
- `promo_active`, `promo`, `promotion`, or `discount`

When a Sheet is provided, missing critical fields are never silently filled with demo data. If the specific question asked can't be honestly computed from what's actually in the sheet, the API returns `status: "guidance"` with a plain explanation of what's missing plus real alternative questions the data genuinely can answer — the user is never blocked behind a form demanding more data before they can get any response at all. (An earlier version of this product did exactly that — a manual-data-entry form that blocked further use until fields were filled — and it was removed this refinement phase after one of its inputs was found to be mathematically incapable of producing a real answer no matter what was typed into it.) Demo data is used only when no Sheet URL is provided at all.

Column classification is adaptive: the server sends headers and sample rows to Gemini, which classifies concepts such as order date, order ID, customer identifier, order value, delivery fee, promo flag, and order status. The server then aggregates order-level rows into monthly summaries before running regression.

This adds one extra Gemini call per Sheet-backed simulation. Classifications are not cached yet, so repeated questions against the same Sheet currently re-classify the headers each time.

## How We Verify Accuracy

The project does not ask Gemini to invent the impact number. The server first detects the likely lever in the question:

- Delivery fee or price questions use a simple linear regression against the selected result metric.
- Promo or discount questions compare promo months to non-promo months.
- The range uses a basic standard-error estimate.
- The confidence score is based on sample size and fit strength, such as R² for regression.

This is intentionally lightweight, but it is real math from the historical rows. Gemini only explains the computed result in shop-owner language.

## Installation

```bash
npm install
cp .env.example .env
```

## Environment Variables

Put these values in `.env`:

```bash
GEMINI_API_KEY=
GEMINI_MODEL=gemini-3.6-flash
PORT=8080
```

| Variable | Required | Default | Description |
| --- | --- | --- | --- |
| `GEMINI_API_KEY` | Yes | None | Gemini Developer API key from Google AI Studio |
| `GEMINI_MODEL` | No | `gemini-3.6-flash` | Gemini model used for wording only |
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
  --set-env-vars GEMINI_API_KEY=your_actual_key_here,GEMINI_MODEL=gemini-3.6-flash
```

## Tech Stack

- **Backend:** Node.js + Express
- **Math:** Plain JavaScript regression and promo lift calculations
- **Question routing:** `services/business-workflow.js` — routes trend/retention/general business questions to a separate answer-type bundle, distinct from the numeric what-if regression path in `server.js`
- **AI:** Gemini Developer API via `@google/genai` for wording only — currently `gemini-3.6-flash`
- **Frontend:** Plain HTML + CSS + JS
- **Container:** Docker on `node:20-alpine`
- **Deploy target:** Vercel
