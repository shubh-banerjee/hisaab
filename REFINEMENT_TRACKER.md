# Hisaab Refinement Tracker

Last audited: 2026-07-20
Repository: `shubh-banerjee/hisaab`
Branch: `main`
Latest audited commit: `30662b0` — `phase 4: zero-data bootstrap — build history from daily check-ins, no spreadsheet`

## Product rules

Hisaab is an evidence-first decision assistant for small shop owners. It must help users understand what their data can and cannot prove.

The primary rule for every result is:

> If Hisaab cannot answer honestly, it must say “not enough evidence” and help the user collect the missing data.

The product must never show confident-looking projections from:

- synthetic sample data;
- missing fields;
- insufficient history;
- weak or ambiguous relationships;
- unsupported business levers;
- extrapolation beyond the observed data without a clear warning.

## Audit scope

The following files were inspected before creating this tracker:

- `server.js`
- `public/index.html`
- `public/script.js`
- `public/style.css`
- `services/firestore.js`
- `README.md`

No product code was changed as part of this audit. This tracker is the only planned artifact from this step.

## Current product problems found

### Data integrity and evidence

- Before Phase 1, Start Fresh fell through to the hardcoded demo dataset when bootstrap history was not yet sufficient. This was fixed in the current implementation; the remaining risk is covered by the Phase 1 automated-test task.
- `getHistoricalData()` still provides an 18-month synthetic fallback for normal no-data use.
- Sample results can still contain numeric projections, ranges, confidence values, and rupee impacts even though those values are not about the user’s business.
- Some wording still uses phrases such as “your history” or “uploaded data” in contexts where the source may be demo data or self-reported bootstrap data.
- Bootstrap history is user-reported and rough, but it is passed into much of the same calculation path as imported order data. Its lower measurement quality is not yet reflected strongly enough in the result contract.
- A spreadsheet column can be classified by Gemini or local regex fallback. A wrong classification can produce valid arithmetic from the wrong business field.
- There is no explicit user confirmation step for all detected columns before calculation.
- Regression is observational correlation, not causal inference. Current copy can still sound like the change will cause the result.
- Confidence is a custom score based on sample size, variation, fit, t-score, and effect size. It is not a calibrated probability, yet the UI calls values above a threshold “High confidence.”
- The current range is based on slope standard error. It is not a complete forecast interval and does not include all uncertainty sources.
- The displayed “worst case” is the lower range bound converted into revenue; it is not a true worst-case or stress scenario.
- Promo analysis compares promo and non-promo averages but does not control for seasonality, trend, holidays, inventory, promo depth, or selection bias.
- The question parser uses keyword matching and broad numeric extraction. Complex questions can select the wrong lever or interpret dates/quantities as currency changes.
- There is no systematic extrapolation gate for requested changes outside the observed lever range.
- Some edge cases can still produce misleading values, including short history, zero baselines, sparse variation, missing monthly periods, and negative or unusual inputs.

### User experience and clarity

- The current result area contains scenarios, confidence, ranges, estimated revenue change, downside, trend, chart, explanation, intent capture, refinement, and decision-journal actions. This is more information than a non-technical owner needs for the first answer.
- The result screen still exposes technical concepts such as confidence percentages, R²-derived implications, and ranges without explaining their practical meaning in the simplest possible language.
- Missing-column handling exists, but the CSV flow can require multiple prompts and manual inputs before the user understands what is missing and why it matters.
- The product has separate sample, sheet, CSV, bootstrap, pending-data, and applied-data states. These states need a single, obvious source-of-truth label in every result.
- The sample path and real-data path are visually related enough that users may assume sample results are recommendations.
- Decision journal and check-back functionality exists, but saved, pending, skipped, applied, compared, and demo states require careful copy and QA to avoid confusing examples with personal history.

### Language and AI wording

- English, Hindi, and fallback language logic are implemented, but the supported-language behavior is inconsistent: the prompt asks for several languages while current server instructions intentionally return English for languages other than Hindi and English/Hinglish.
- Fallback language detection is heuristic and may misclassify Romanized Indian language questions.
- AI wording is checked for some direction and language mismatches, but it can still give a polished recommendation when the underlying evidence is weak or the source is synthetic.
- Gemini is intended to write wording only, but the product still needs a stricter server-owned evidence message so the model cannot turn a weak association into an action recommendation.

### Engineering and QA

- There is no automated test suite for the calculation functions.
- There are no fixture tests for CSV parsing, column classification, aggregation, bootstrap history, or missing-field prompts.
- There are no browser-level regression tests for the major user paths.
- Firestore read/write failures are handled softly, but the UI needs to distinguish “calculated” from “saved successfully.”
- Full prompt/response logging should be reviewed for privacy and production observability.

## Implementation status

### Already completed before this tracker

- Phase 1 prototype decision-engine result screen and scenario view.
- Low-confidence downgrade behavior in the calculation and result flow.
- Sample-data source labels and sample chart labelling were introduced.
- Connected sheet/CSV parsing with adaptive column classification exists.
- Missing critical fields can return `status: "needs_input"` instead of silently filling sheet data with demo fields.
- Decision journal, track-record, applied/skipped/pending states, and later comparison endpoints exist.
- Check-back prompt and quick outcome capture exist.
- Zero-data bootstrap path exists with daily order check-ins, optional fee/AOV, Firestore storage, and monthly aggregation.
- Gemini output is separated from server-calculated numeric fields.
- Gemini failures have server fallback wording.
- English/Hindi/localization strings and language-aware result rendering have been started.

These existing features are partial foundations, not proof that the corresponding refinement phase is complete.

### Completed in this implementation step

- Phase 1 server-side Start Fresh gate implemented.
- Start Fresh now sends an explicit `dataMode: "bootstrap"` to `/api/simulate`.
- Insufficient bootstrap history returns `status: "needs_bootstrap_history"` and never uses `getHistoricalData()`.
- The response reports the current entry count and minimum threshold.
- The frontend now shows a dedicated “Not enough evidence yet” state with progress.
- The Start Fresh gate has `Add today’s sales` and `See demo example` actions.
- Mature bootstrap results are labelled `Self-reported daily history`.
- Bootstrap scenario copy no longer says “your own history.”
- Bootstrap decisions retain `bootstrap` as their data-source kind instead of being normalized as sample decisions.
- This tracker now includes the Phase 1 implementation and QA notes.
- Phase 2 data maturity levels implemented for sample, bootstrap, connected order, sales/value, customer, and promo data.
- Phase 2 evidence categories implemented: `clear_enough`, `weak_signal`, `not_enough_evidence`, `unsupported_question`, and `demo_only`.
- Sample mode now returns `demo_only` before Gemini wording or numeric simulation output.
- Minimum-history, required-field, lever-variation, extrapolation, and weak-signal gates now run before Gemini/scenario generation.
- Connected CSV/sheet results now identify imported CSV or connected Google Sheet data.
- Phase 3 structured CSV mapping metadata added: detected columns, ambiguous columns, confidence, missing concepts, and available/unavailable capabilities.
- CSV summaries now use plain business language such as `Total bill amount`, `Customer name, phone, or ID`, and `Discount or offer details`.
- Users can select detected headers from dropdowns instead of typing exact column names.
- Missing total bill amount supports `I don’t have this data`, `Use my usual average bill`, and a user-provided amount.
- User-provided average bill values are sent as `user_provided_average_order_value` and labelled in result source text.
- Missing customer and promo capabilities now offer explicit choices without silently adding sample data.
- Phase 4 result hierarchy added: simple answer, evidence strength, reason, next action, and data used now appear before technical output.
- Scenario cards are no longer promoted into the primary result view.
- Confidence percentages, ranges, charts, regression metrics, and calculation output are behind `Show calculation details`.
- Main result language now uses `Strong evidence`, `Medium evidence`, `Weak evidence`, `Not enough evidence`, and `Demo only` instead of confidence-first copy.
- `Worst case` is now labelled `Lower estimate` in the calculation details.
- Phase 5 sample mode now uses an explicit `source_type: demo` and always returns the `demo_only` evidence category.
- The demo dataset now represents a small Indian shop: roughly 360–720 monthly orders, ₹220–₹390 average bills, ₹20–₹80 delivery fees, and occasional promos.
- Demo copy is separated from real-business copy, with `Demo example` and `Illustrative demo — not your data` labels.
- Demo decisions are blocked at the API boundary, excluded from personal decisions and track record, and cannot be compared with real data.
- Sample-mode generated wording is sanitized in the frontend as a final guard against real-business phrasing.

## Phase-wise implementation checklist

## Phase 1: Stop fake/sample fallback in Start Fresh

Goal: Start Fresh must never answer from synthetic sample data.

Checklist:

- [x] Identify the selected path at the API boundary and pass it explicitly to `/api/simulate`.
- [x] Separate `bootstrap`, `sample`, `sheet`, and `csv` as distinct data-source modes for simulation requests.
- [x] If Start Fresh has fewer than the required minimum entries, return `status: "needs_bootstrap_history"`.
- [x] Do not call `getHistoricalData()` for the Start Fresh path.
- [x] Do not render scenarios, percentages, ranges, revenue impact, or confidence for insufficient bootstrap history.
- [x] Show exactly how many entries exist and the minimum threshold.
- [x] Provide `Add today’s sales` and `See demo example` actions from the evidence gate.
- [ ] Add a server-side test proving no sample rows are used for Start Fresh.

Likely files:

- `server.js`
- `public/script.js`
- `public/index.html`
- `public/style.css`
- `services/firestore.js`

Manual QA:

- Choose “No data yet — start fresh” with zero entries; ask a question; confirm no numeric answer appears.
- Add one daily entry; ask a question; confirm the answer is blocked with a progress message.
- Add enough entries to pass the threshold; confirm the source says self-reported/bootstrap history.
- Switch from Start Fresh to sample mode; confirm the user explicitly sees that sample mode is illustrative.
- Refresh the page and confirm the selected data path is not silently changed.

Phase 1 implementation QA notes:

- [ ] Start Fresh with 0 entries: ask “What if I increase delivery fee by ₹5?”; verify `Not enough evidence yet`, `0 of 20 daily entries`, no chart, no confidence, no range, no revenue, and no scenario cards.
- [ ] Start Fresh with 1–19 entries: verify the exact count appears and no sample result is returned.
- [ ] Start Fresh with 20+ entries across at least two months: verify the simulation can run and the source says `Self-reported daily history`.
- [ ] Start Fresh with 20+ entries in one month only: verify later evidence gates still apply and entry count alone does not imply sufficient variation.
- [ ] Click `Add today’s sales`: verify the user returns to the bootstrap diary and the orders field is focused.
- [ ] Click `See demo example`: verify the same question runs only in explicit sample mode and is visibly marked as demo data.
- [ ] Sample mode still works separately and continues to use the demo path only after the user explicitly chooses it.
- [ ] Connected CSV mode still works separately and does not receive `needs_bootstrap_history`.

## Phase 2: Add data maturity and evidence gates

Goal: The calculation engine must decide whether an answer is supportable before producing a projection.

Checklist:

- [x] Define maturity levels for sample, self-reported, imported, and reconciled data.
- [x] Define minimum history requirements by analysis type.
- [x] Define minimum distinct lever values and minimum observations.
- [x] Add a no-variation gate before regression.
- [x] Add a small-sample gate before promo comparison.
- [x] Add an extrapolation gate when the requested change is outside observed values.
- [ ] Add a zero/near-zero baseline gate.
- [ ] Add a data-quality gate for duplicate, cancelled, returned, invalid-date, and negative-value rows.
- [x] Add evidence categories: `clear_enough`, `weak_signal`, `not_enough_evidence`, `unsupported_question`, and `demo_only`.
- [ ] Rename or remove “worst case” in clear-enough results.
- [x] Ensure the server returns an evidence explanation with every gated result.
- [x] Ensure Gemini cannot override the evidence category or gate decision.
- [ ] Add automated tests for all Phase 2 evidence gates.

Likely files:

- `server.js`
- `public/script.js`
- `public/index.html`
- `public/style.css`
- `README.md`

Manual QA:

- Test 1–3 months of data; confirm no strong projection appears.
- Test a lever with one unique value; confirm “not enough evidence.”
- Test a requested change inside and outside the observed range.
- Test a dataset with zero orders or zero revenue baseline.
- Test a range crossing zero; confirm the result says no clear direction.
- Test promo data with only one promo month.
- Test a negative price/fee input; confirm validation blocks it.
- Confirm every result identifies source, date range, method, and limitation.

Phase 2 implementation QA notes:

- [x] No-data/sample delivery-fee question returns `demo_only` and no numeric prediction.
- [x] Bootstrap below threshold remains blocked by the Phase 1 `needs_bootstrap_history` gate.
- [x] CSV missing order value returns `unsupported_question`/`needs_input` before calculation.
- [x] CSV missing customer ID + repeat question returns `unsupported_question` with the customer identifier requirement.
- [ ] CSV missing promo flag + discount question should return `unsupported_question` with the promo-period requirement.
- [x] Constant delivery-fee history returns `not_enough_evidence` and explains that the fee never changed.
- [x] Requested delivery-fee change outside the observed range returns `weak_signal` and suggests a smaller test.
- [ ] Weak R² relationship should return `weak_signal` and never show a best-option scenario card.
- [x] Sample mode is distinct from connected-data mode and cannot produce real recommendation language.

## Phase 3: Improve CSV missing-column flow

Goal: A non-technical user should understand what is missing and resolve it with the fewest possible steps.

Checklist:

- [x] Show that the file was read and report detected row/month counts immediately.
- [x] Show detected columns in plain language with confidence metadata available in the structured response.
- [x] Show selectable detected headers instead of forcing exact column-name typing.
- [x] Show missing capabilities in business language.
- [x] Ask only for fields relevant to the current question when simulation is attempted.
- [x] Provide explicit choices for missing bill, promo, and customer data.
- [x] Make user-provided average bill values clearly labelled as an estimate.
- [x] Prevent missing fields from being filled with sample/demo data.
- [x] Preserve CSV, mappings, choices, and manual values across the current flow without re-uploading.
- [ ] Add invalid date, invalid number, empty file, header-only file, and duplicate-row handling.
- [ ] Add a final “This is what I will use” confirmation before simulation.
- [ ] Add automated frontend/API tests for mapping choices.

Likely files:

- `server.js`
- `public/script.js`
- `public/index.html`
- `public/style.css`

Manual QA:

- Upload a valid CSV with all required columns.
- Upload a CSV missing delivery fee and ask a fee question.
- Upload a CSV missing customer ID and ask a repeat-order question.
- Upload a header-only CSV.
- Upload a CSV with malformed dates and currency strings.
- Confirm that manual inputs are visibly marked as assumptions.
- Confirm a second question reuses the parsed data without forcing another upload.

Phase 3 implementation QA notes:

- [ ] CSV with date and orders only: verify `I read your file`, found items, missing bill/fee/customer/promo capabilities, and selectable choices.
- [ ] CSV with date, orders, and sales: verify total bill amount is shown as found and pricing capability becomes available.
- [ ] CSV with delivery fee but no sales: verify delivery-fee capability is available while pricing remains unavailable.
- [ ] CSV with customer name but no customer ID: verify customer details are recognized as a selectable customer column.
- [x] CSV with discount column named `coupon`: verify it is shown as `Discount or offer details`.
- [x] CSV with ambiguous columns such as `amount`: verify it is offered as an ambiguous selectable option, not silently used.
- [ ] User selects `I don’t have this data`: verify compatible questions continue and the missing capability remains unavailable.
- [ ] User enters average bill amount: verify `user_provided_average_order_value` is sent and future results say `Sales estimate uses your average bill amount, not exact order values.`
- [ ] User asks unsupported question after continuing: verify a limitation state explains the missing capability.
- [ ] Messy CSV with unrelated columns: verify no sample/demo fields are added and the user receives a plain missing-data explanation.

## Phase 4: Simplify result screen for non-technical users

Goal: Give one clear answer, one reason, one limitation, and one next action.

Checklist:

- [x] Make the primary result a plain-language evidence conclusion.
- [x] Hide technical details by default.
- [x] Replace “High confidence” with evidence language users can understand.
- [x] Keep numeric ranges as calculation details rather than the primary answer.
- [x] Rename “worst case” to “lower estimate.”
- [ ] Avoid showing rupee projections unless the baseline and evidence support them.
- [x] Show source, history used, and data quality near the answer.
- [x] Show “not enough evidence” as a complete result state, not an error state.
- [x] Keep the practical next action directly below the reason.
- [x] Keep decision journal and refinement actions below the main answer and calculation details.
- [x] Add a mobile-first stacked answer, trust, action, and data-used layout.

Likely files:

- `public/index.html`
- `public/script.js`
- `public/style.css`
- `server.js`

Manual QA:

- View supported, weak, unsupported, sample, bootstrap, and missing-data results.
- Confirm the first screenful answers: what the data shows, how strong it is, and what to do next.
- Confirm no card implies certainty when the range crosses zero.
- Confirm the result is understandable without knowing regression, R², or t-score.
- Test narrow mobile viewport and desktop viewport.

Phase 4 implementation QA notes:

- [ ] Strong evidence result: answer and `Strong evidence` appear before details.
- [ ] Weak signal result: `Weak evidence` / early-pattern wording appears without scenario cards.
- [ ] Not enough evidence result: limitation state shows missing evidence and collection action.
- [ ] Unsupported question result: limitation state explains the required field in plain language.
- [ ] Demo-only result: demo label appears and no real recommendation language is used.
- [ ] Mobile result layout: Answer → Trust → Action remains the first visible sequence.
- [ ] Advanced details expanded: chart, confidence percentage, range, and calculation metrics are available.
- [ ] Advanced details collapsed: technical metrics are not visible in the first view.
- [ ] Start Fresh below threshold still uses the dedicated bootstrap gate.
- [ ] CSV missing important fields still uses the limitation state and does not show numeric projections.

## Phase 5: Make sample mode demo-only

Goal: Sample mode teaches the product but never behaves like a real business recommendation.

Checklist:

- [x] Keep sample mode as an explicit demo path.
- [x] Add persistent `Demo example` treatment to the result.
- [x] Suppress sample results before numeric recommendation output and keep the sample dataset illustrative.
- [x] Disable demo save/apply behavior with an explicit not-saved message.
- [x] Do not save sample decisions into the user’s real decision journal.
- [x] Separate demo decision history and track-record queries from personal history.
- [x] Ensure demo wording uses example-data language rather than personal history language.
- [x] Ensure charts and source labels remain visibly synthetic.

Likely files:

- `server.js`
- `public/script.js`
- `public/index.html`
- `public/style.css`
- `services/firestore.js`

Manual QA:

- Run every sample suggestion chip.
- Confirm every result says it is a demo.
- Confirm no sample result is presented as a recommendation for the user’s shop.
- Open the decisions journal after a sample run; confirm demo entries cannot be mistaken for personal decisions.
- Compare sample mode with connected data mode side by side.

Phase 5 implementation QA notes:

- [ ] Sample prompt result does not say `your` in demo-specific answer copy.
- [ ] Sample charts show `Illustrative demo — not your data`.
- [ ] Demo result cannot be saved into personal decisions.
- [ ] Track record ignores demo results.
- [ ] Gemini failure/fallback still leaves the demo-only label intact.
- [ ] Sample values stay within the small-shop fixture ranges.
- [ ] `Add my own data`, `Start daily entry`, and `Try another demo question` work from the demo state.

## Phase 6: Fix language consistency

Goal: The visible UI, generated explanation, fallback message, metric labels, and limitations must use one consistent language policy.

Checklist:

- [ ] Define the supported language policy explicitly.
- [ ] Align frontend translation strings with server Gemini instructions.
- [ ] Ensure English/Hinglish questions return consistent English behavior.
- [ ] Ensure Hindi questions return consistent Devanagari Hindi in both AI and fallback paths.
- [ ] Decide and document behavior for Tamil, Bengali, Telugu, Marathi, Kannada, and unsupported languages.
- [ ] Localize evidence limitations, source labels, validation errors, bootstrap copy, and decision-journal copy consistently.
- [ ] Prevent fallback wording from switching language unexpectedly.
- [ ] Add language fixtures for question parsing and response alignment.

Likely files:

- `server.js`
- `public/script.js`
- `public/index.html`
- `README.md`

Manual QA:

- Ask the same question in English, Romanized Hinglish, Devanagari Hindi, and one unsupported language.
- Force Gemini failure and verify fallback language.
- Trigger missing-data, weak-evidence, and unsupported-lever states in each supported language.
- Confirm metric labels and buttons do not revert to English unexpectedly.

## Phase 7: Polish decision journal and check-back loop

Goal: The journal should help users learn from real decisions without overstating prediction accuracy.

Checklist:

- [x] Separate demo entries from bootstrap, CSV, and sheet decisions in the journal; demo decisions are excluded from the real journal and track record.
- [x] Make saved/not-saved status explicit, including a visible “Calculated, but this decision was not saved” failure state.
- [x] Make Tried, Skipped, Unsure, Waiting for outcome, and Compared states easy to understand.
- [x] Ensure check-back uses neutral comparison language and does not claim causality from a before/after observation.
- [x] Show the source and evidence strength saved at the time of each decision.
- [x] Clarify that the track record describes past outcomes and is not a guarantee of future accuracy.
- [x] Add All, Tried, Waiting, Compared, and Skipped filters.
- [x] Reduce clicks: save intent directly, optionally add a start date, and compare when newer sheet data is available.

Likely files:

- `server.js`
- `public/script.js`
- `public/index.html`
- `public/style.css`
- `services/firestore.js`

Manual QA:

- [ ] Demo result cannot be saved.
- [ ] Clear-enough CSV result can be saved.
- [ ] Bootstrap result below threshold cannot be saved as a real decision.
- [ ] Bootstrap result above threshold can be saved.
- [ ] Tried, skipped, and unsure states save correctly; optional start date is retained.
- [ ] Decision card shows source and evidence level.
- [ ] New data comparison shows Matched direction, Opposite direction, No clear change, or Not enough new data without claiming right/wrong.
- [ ] No-new-data comparison explains that newer sales data is needed.
- [ ] Firestore save failure shows calculated-but-not-saved, with no false success message.
- [ ] Decision journal remains readable on mobile and filters remain usable.

## Phase 8: Add calculation and edge-case tests

Goal: Make evidence rules executable and protect the product from regressions.

Checklist:

- [x] Add a lightweight built-in Node test runner and `npm test` script.
- [x] Expose pure functions for parsing, aggregation, maturity gates, scenario detection, regression, language fallback, comparison, and decision provenance.
- [x] Add fixtures for sample, order-only, daily summary, missing-field, flat-lever, extrapolation, weak-signal, and ambiguous-column data.
- [x] Test sample data is demo-only and Start Fresh maturity/source labels are explicit.
- [x] Test insufficient history returns an evidence limitation.
- [x] Test no lever variation returns no estimate.
- [x] Test zero and negative baselines remain finite.
- [x] Test out-of-range requested changes return a warning and smaller-test action.
- [x] Test missing promo/customer/order-value capabilities are reported rather than guessed.
- [x] Test malformed dates during bootstrap aggregation are ignored.
- [x] Test language fallback, Hinglish handling, and direction alignment.
- [x] Test neutral outcome-comparison categories and save-failure/demo-save copy.
- [ ] Add API integration tests for `/api/parse-sheet`, `/api/bootstrap/status`, `/api/bootstrap/entry`, and `/api/simulate` with Firestore/Gemini mocked.
- [ ] Add browser QA or end-to-end tests for the primary flows.
- [ ] Add CI execution for tests before pushing changes.
- [ ] Add browser QA or end-to-end tests for the primary flows.
- [ ] Add CI execution for tests before pushing changes.

Likely files:

- `package.json`
- `server.js`
- `tests/evidence-gates.test.js`
- `tests/fixtures/*.csv`
- `README.md`

Implemented test command:

```bash
npm test
```

Current automated result: 16 tests passing locally. Remaining coverage is integration-level API mocking, browser flows, and CI execution.

Manual QA before demo submission:

- [ ] `npm start` serves the app successfully.
- [ ] Demo question shows Demo example and cannot create a real journal entry.
- [ ] Start Fresh at 0 and 1–19 entries shows Not enough evidence with progress and no projection.
- [ ] Start Fresh at 20+ entries remains labelled Self-reported daily history.
- [ ] CSV with missing order value offers column choice, no-data continuation, or average bill amount.
- [ ] CSV with missing customer or promo data clearly disables only those capabilities.
- [ ] Flat delivery-fee history does not produce a numeric estimate.
- [ ] Out-of-range changes suggest a smaller test.
- [ ] Weak signals show an early pattern rather than a strong recommendation.
- [ ] English, Hindi, and Hinglish questions keep the expected language.
- [ ] Firestore save failure says calculated but not saved.
- [ ] Result screen remains Answer → Evidence → Action before technical details on mobile.
- `public/script.js`
- new `test/` or `tests/` fixtures and test files
- CI configuration if introduced

Manual QA:

- Run the complete automated suite.
- Run the primary flows in a clean browser session.
- Verify no console errors on initial load, sample mode, Start Fresh, CSV upload, and result rendering.
- Verify API responses contain explicit source and evidence status.
- Verify a failed AI call never changes numeric output or evidence status.

## Recommended implementation order

1. Phase 1 — eliminate the dangerous Start Fresh fallback.
2. Phase 2 — establish the evidence contract and gates.
3. Phase 5 — make sample mode unmistakably demo-only.
4. Phase 3 — simplify CSV missing-column handling around the evidence contract.
5. Phase 4 — simplify the result screen around supported evidence states.
6. Phase 6 — align all language and fallback behavior.
7. Phase 7 — polish journal and check-back semantics.
8. Phase 8 — lock the rules down with automated tests.

## Definition of done

The refinement is complete when:

- no real-looking projection is produced from sample data;
- Start Fresh never falls back to sample rows;
- every numeric answer has an explicit source, date range, method, maturity, and evidence status;
- insufficient evidence is a first-class answer;
- missing CSV fields are resolved with a short, understandable flow;
- the result screen is usable without statistical knowledge;
- language and fallback behavior are consistent;
- sample, self-reported, imported, and measured outcomes are visibly distinct;
- journal/check-back states do not imply unsupported causality;
- automated tests cover the calculation and edge-case rules.
