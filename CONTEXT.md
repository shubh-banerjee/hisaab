# Hisaab — Project Context and Handoff

_Last updated: 25 July 2026_

This file is the source of truth for continuing Hisaab work in a new chat or coding session. Read this before changing the product.

## 1. Product in one line

**Hisaab is a calm business analyst for small shops and SMB owners.**

It helps non-technical business owners upload sales/order data, ask questions in English, Hindi, or Hinglish, understand what the data can support, and receive simple guidance or small-test options without pretending weak data is certain.

Hisaab must not become a generic CSV chatbot or a general-purpose LLM.

## 2. Product philosophy

The experience should feel like:

> A patient business analyst explaining one useful thing at a time.

Not like:

- a BI dashboard
- a generic AI assistant
- a technical analytics product
- a spreadsheet tool
- a chat product that answers unrelated questions

Core principles:

1. **Honesty before polish** — never invent numbers, trends, confidence, causes, or recommendations.
2. **Scope discipline** — only answer questions related to connected business data and practical SMB decisions.
3. **Math first, language second** — deterministic/statistical logic computes facts; Gemini only explains those facts naturally.
4. **One screen, one clear purpose** — avoid dashboard density and endless scrolling.
5. **Plain language** — no analytics jargon, unexplained confidence scores, or fancy charts.
6. **Small steps** — recommend one measurable change rather than broad risky business advice.
7. **Consistent navigation** — users must always know how to go back, close, update data, ask another question, or inspect the explanation.

## 3. Target user

Primary persona:

- Indian small-shop or SMB owner
- not deeply technical
- may use English, Hindi, or Roman Hinglish
- may keep data in CSV/Excel/Google Sheets
- needs simple answers rather than complex analytics
- may ask broad questions such as “business kaise badhau?” or practical what-if questions such as “delivery fee ₹2 badhaun toh kya hoga?”

## 4. Brand and visual direction

Brand wordmark:

**hisaab.**

- Only the final full stop after `b` is blue.
- The dot above the `i` remains normal.
- Do not recreate the old incorrect blue dot placement.

Visual direction:

- light, calm, premium, minimal
- thin stroke borders rather than heavy filled cards
- primary CTA: blue and rounded
- secondary CTA: outlined
- no black CTAs
- no unnecessary arrows in CTA labels
- no heavy shadows or modal-like floating boxes unless the flow explicitly requires a contained stage
- stable layouts; content should not jump, shrink, or reflow unexpectedly
- use modest rounded corners and comfortable whitespace

## 5. Current repository and deployment

Repository:

`shubh-banerjee/hisaab`

Branch policy:

- Work directly on `main` unless explicitly instructed otherwise.
- Do not create a new branch for routine fixes.

Current production URL:

`https://hisaab-topaz.vercel.app`

Current latest known main commit at the time this file was created:

`77e940af8ec318d1b337073bd8a3043883e4d003`

Commit message:

`Fix Hinglish what-if routing and result language scope`

Tech stack:

- Node.js / Express backend
- browser frontend in `public/`
- Firestore for persistence
- Gemini for schema/wording assistance
- Vercel deployment
- no BigQuery for this demo

Important files:

- `server.js`
- `public/index.html`
- `public/script.js`
- `public/style.css`
- `services/business-question-workflow.js`
- `scripts/` for deterministic UI/workflow transformations
- `tests/` for evidence and edge-case checks

## 6. Core architecture

The intended architecture is:

```text
User asks a question
↓
Question scope check
↓
Business intent router
↓
Data capability check
↓
Compute what can be computed
↓
Generate plain explanation
↓
Render the correct result type
```

The product uses a two-brain model:

### Math / evidence brain

Responsible for:

- parsing uploaded data
- understanding available columns
- aggregating rows into usable periods
- calculating order/sales trends
- running supported what-if simulations
- determining whether required data exists
- producing limitations and low-signal warnings

### Language brain (Gemini)

Responsible for:

- rewriting already-computed facts in natural language
- matching the user’s language: English, Hindi, or Hinglish
- making guidance understandable for an SMB owner

Gemini must not:

- invent values
- change calculated numbers
- change recommendation meaning
- pretend missing data exists
- answer unrelated questions

## 7. Supported data behaviour

Hisaab should classify uploaded data into three broad states.

### A. Reliable business data

Examples of useful fields:

- order date
- order count / order ID
- order value / sales amount
- customer identifier
- repeat orders
- delivery fee
- discounts / promotions
- product/category
- costs/margins

The user can continue to Ask Hisaab.

### B. Partial business data

The user may continue, but Hisaab must clearly explain which answers will be limited.

Example:

- orders and dates are available
- discounts are missing
- customer identity is missing

Hisaab can answer order trends but should not claim precise promo or retention effects.

### C. Unrelated/random CSV

The normal Ask Hisaab flow should not open.

Show a clear boundary such as:

> This does not look like sales data.

Then offer:

- Upload sales data
- Start a simple daily sales log

This is a product guardrail, not merely an error.

## 8. Question scope and routes

Hisaab should support many business-related questions, but different questions require different result layouts.

### 8.1 Out-of-scope

Examples:

- Who is Ronaldo?
- Write a poem.
- What is Bitcoin?

Behaviour:

- stay inside the Ask screen
- do not navigate to results
- explain that Hisaab works with connected business data
- provide relevant contextual business questions

### 8.2 Order trend

Examples:

- Are my orders going up or down?
- Which months were weakest?
- When did orders start falling?

Result should show:

- direct verdict: up / down / stable
- recent average versus earlier average
- percentage movement when supported
- plain limitation
- recommended investigation or small test

Do not force this into price/delivery scenario cards.

### 8.3 Sales trend

Examples:

- What changed in my sales?
- Are sales increasing?
- Which period performed best?

Result should use available order-value data and show a clear comparison. If order value is missing, explain that only order movement can be read.

### 8.4 Customer retention

Examples:

- How can I retain customers?
- Are customers coming back?
- Are repeat orders improving?

If customer/repeat-order data exists:

- calculate the repeat-order direction
- use measured facts
- recommend simple retention actions

If customer data is missing:

- still guide the user
- clearly label the advice as directional
- recommend tracking customer name, phone, email, or customer ID

Possible actions:

- thank/reconnect with recent buyers
- test a limited repeat-customer offer
- track repeat customers consistently

### 8.5 Profit guidance

Examples:

- How can I increase profit?
- Am I profitable?

Important:

- revenue is not profit
- calculate profit only if reliable cost, expense, margin, or cost-of-goods data exists
- otherwise explain the missing requirement and give practical improvement guidance from current data

### 8.6 Product/category guidance

Examples:

- Which product is best?
- Which category sells most?

Only provide a product-level answer when a reliable product/item/SKU/category field exists.

### 8.7 What-if decisions

Examples:

- What happens if I change my prices?
- Should I increase delivery fee?
- Agar main delivery fee ₹2 badhaun toh kya hoga?
- What if I give a 10% discount?

These should use the numerical simulator when the required historical fields exist.

Extract:

- lever: price / delivery fee / discount / COD
- direction: increase / decrease
- amount: rupees / percentage when supplied
- language

Render:

- direct numerical answer first
- safe option
- small test / moderate option
- higher-risk option
- estimated order and revenue effect when supported
- explicit uncertainty/limitations

A slider may be added later only when the data genuinely supports testing multiple values. Never create fake precision.

### 8.8 Broad business guidance

Examples:

- What should I do with my business?
- How can I grow?
- Business kaise badhau?

Hisaab should not reject these. It should use available data to select a practical starting point and explain what is measured versus general guidance.

## 9. Language behaviour

Supported demo languages:

- English
- Hindi in Devanagari
- Roman Hinglish

Required behaviour:

- English question → English response
- Hindi question → Hindi response
- Hinglish question → natural Roman Hinglish response

Voice transcription is a helper only. It must never block the Ask flow.

If transcription refinement fails:

- keep the rough live preview in the text field
- stay on the Ask screen
- show a soft inline note
- let the user edit and continue
- never return to the homepage
- never show a global red error for a recoverable transcription failure

Known vocabulary/variation support should include:

- `agar`, `main`, `mein`, `kya hoga`
- `badha`, `badhau`, `bada`
- `ghata`, `ghatau`, `kam`, `zyada`
- transcription confusion such as `delivery free` meaning `delivery fee`

## 10. Current frontend product flow

### Landing

- Logo top-left: `hisaab.`
- Centre-aligned content
- Two equal cards:
  - See a demo shop
  - Use my sales data
- Demo CTA is secondary
- Data CTA is primary
- `No sales file yet? Start with a simple daily sales log` appears as a subtle text link, not a filled container

### Demo flow

Four-step guided lesson in a consistent outlined rectangle.

1. Meet the shop
2. What Hisaab checks
3. Choose a question
4. See the answer

Rules:

- only Step 3 should look interactive
- Steps 1, 2, and 4 must not use button-like informational cards
- Step 3 flow: select question → Ask Hisaab → Step 4
- Ask Hisaab disabled until selection
- compact centred stepper
- close icon top-right
- consistent shell dimensions across all four steps
- SMB-friendly text: one main idea, one short explanation, one clear action

### Add data

- single contained screen
- user can paste a public Google Sheet link or upload CSV without unnecessary intermediate clicks
- no meaningless stepper
- close icon returns to landing
- CTA shows clear ready/loading state
- successful link validation should show a positive inline status such as `Sheet link looks good`
- CSV limit for the demo: less than 4 MB

### Reading data

- sleek short loading state
- no long expanding analysis
- communicate progress in simple terms
- missing fields should be handled inside this data-reading/summary flow, not by throwing the user back to the landing page

### Data-ready summary

- show concise found data
- collapse long lists with a `+ N more found` pattern
- clearly separate missing/limited data
- show only supported topics
- primary CTA: Ask Hisaab
- secondary CTA: Back, returning to upload/connect so the user can replace or update data
- close exits the overall flow

### Ask Hisaab

- large textarea
- mic support
- English/Hindi/Hinglish note
- suggestions must be based on actual capabilities
- suggestions must be connected to working handlers
- do not show the same chips twice
- when contextual guidance appears, hide default chips
- CTA should show an in-button thinking loader and must not collapse

### Result pages

There is no single universal result layout.

Use result types:

- trend result
- numerical what-if result
- customer-retention result
- business-guidance result
- missing-data result
- out-of-scope guidance in Ask screen

For non-what-if business results, the current unified UI has:

- `You asked`
- `Hisaab says`
- facts
- limitation
- read-only `Recommended next steps`
- interactive `Explore next`

Important distinction:

- Recommendation cards are actions, not questions. They must not say `Ask this`.
- `Explore next` contains actual follow-up questions.
- Clicking follow-ups should use the same connected dataset and update the result inline.
- Never route result → homepage → Ask → result for a follow-up.

## 11. Important implemented work

Major completed areas:

- Splash animation and corrected blue final full stop
- Polished landing page
- Demo lesson shell and interaction cleanup
- Single-screen CSV/Google Sheet connect experience
- CSV handling below 4 MB
- reading-data transition
- data-ready summary
- summary Back button
- Ask Hisaab textarea/mic flow
- scope guard for unrelated CSVs
- scope guard for unrelated questions
- duplicate suggestion-chip cleanup
- non-blocking voice transcription error handling
- unified business question workflow
- separate business result renderer
- contextual inline follow-ups
- Hinglish what-if routing and same-language response fix

Relevant merged PRs:

- PR #1: evidence gates and edge-case tests
- PR #2: refined data flow screens
- PR #3: small-test setup flow implementation
- PR #4: Hinglish what-if routing and response language

## 12. Current known risks

1. **Patch-script accumulation**
   - Several changes have historically been applied through scripts in `scripts/`.
   - Avoid adding another narrow patch for every bug.
   - Prefer consolidating logic into real source modules and reducing competing startup transformations.

2. **Frontend/backend contract drift**
   - Suggested questions must map to supported backend routes.
   - Backend statuses and answer types must be rendered explicitly by the frontend.
   - Do not let the frontend promise a capability the backend cannot answer.

3. **What-if versus guidance routing**
   - A concrete what-if with amount/direction must reach the numerical simulator.
   - Broad questions should not be forced into scenario maths.

4. **Language scope**
   - Backend can detect `hinglish`; frontend must not collapse all non-Hindi output to English.
   - Keep language metadata consistent through API response and renderer.

5. **Confidence and evidence**
   - Confidence must be derived from measurable data quality/statistics, not Gemini.
   - Avoid polished percentages when evidence is weak.

6. **Synthetic/demo data leakage**
   - Demo data must remain clearly demo-only.
   - Real uploaded CSV/Sheet answers must never silently use sample history.

7. **Deployment stability**
   - Vercel may mark a deployment `Ready` even if a serverless function later crashes.
   - Always test the live homepage and a core `/api/simulate` flow after deployment.

## 13. Validation required after every meaningful change

Run:

```bash
node --check server.js
node --check public/script.js
npm test
```

Also perform live smoke tests:

1. Open production homepage.
2. Run demo Steps 1–4.
3. Upload a valid sales CSV.
4. Upload an unrelated CSV and confirm the scope boundary.
5. Ask an order-trend question.
6. Ask a customer-retention question.
7. Ask a concrete what-if question.
8. Ask an unrelated question.
9. Test English, Hindi, and Hinglish.
10. Test a result-page follow-up and confirm there is no homepage jump.

Representative questions:

```text
Are my orders going up or down?
What changed in my sales?
How can I retain my customers?
How can I increase profit?
What happens if I change my prices?
Agar main delivery fee ₹2 badhaun toh kya hoga?
Who is Ronaldo?
```

## 14. Immediate next task

The latest work fixed Hinglish what-if routing and response-language scope.

The next session should begin by auditing the production behaviour of this exact case:

```text
Agar main delivery fee ₹2 badhaun toh kya hoga?
```

Expected behaviour:

1. Recognise Roman Hinglish.
2. Normalise transcription variations such as `delivery free` → `delivery fee`.
3. Classify as a delivery-fee what-if.
4. Extract the ₹2 increase.
5. Use the numerical simulator if the uploaded data supports delivery-fee history.
6. Respond in natural Hinglish.
7. Show numeric estimated impact and scenario/test options.
8. If the data is insufficient, show an honest small-test recommendation rather than generic customer-retention cards.

After verifying this, the next product refinement should be:

### Data-backed what-if explorer

Design and implement a contextual value tester for supported what-if routes:

- direct answer remains first
- optional slider/input appears only when evidence supports it
- changing the value updates estimated orders/revenue
- show uncertainty and sample strength
- never expose a slider when history cannot support the estimate

Do not implement the slider until the current numerical what-if route is verified end to end.

## 15. Instructions for the next assistant/developer

- Read this file before modifying code.
- Inspect current `main`; do not assume an earlier chat description exactly matches the latest files.
- Do not use exposed access tokens or store secrets in this file/repository.
- Push routine work directly to `main` only when explicitly requested.
- Diagnose the root cause before editing.
- Avoid patch-on-patch fixes.
- Keep changes narrowly scoped but architecturally clean.
- Preserve all working flows while fixing one area.
- Never claim deployment success without checking commit/deployment status and doing a live smoke test when possible.
- Keep Hisaab focused on SMB business data and honest guidance.
