# Hisaab — Project Context

**Live:** hisaab-topaz.vercel.app · **Repo:** github.com/shubh-banerjee/hisaab
**Event:** Google Cloud Gen AI Academy APAC Hackathon, Top 101 finalist, refinement deadline **July 26, 2026 11:59 PM IST**
**Team:** Solo — Shubh Banerjee ("Token Titans")

---

## 1. What Hisaab is

An AI what-if business decision simulator for Indian retail SMBs (shopkeepers, not personal finance). Core philosophy, stated in the product itself and non-negotiable:

> Real regression on the user's own data does the math. Gemini only classifies columns and translates numbers into plain language. Honest over confident-sounding guesses. Never fabricate.

Stack: Node/Express (`server.js`), Gemini 2.5 flash-lite (`@google/genai`), Firestore (`firebase-admin`), Vercel, vanilla HTML/CSS/JS frontend (`public/`).

---

## 2. Where the product stood before this session

A working what-if calculator: ask a question in English/Hindi/Bengali/Tamil, get a single computed answer (percentage change, confidence, a chart) either from sample data or a connected Google Sheet/CSV.

---

## 3. What this session actually did — two distinct bodies of work

### 3a. Bug-fixing pass (bulk of early session — all shipped, verified working)

1. **Voice input rewrite** — silence-based auto-stop, live Web Speech preview layer, Gemini as authoritative transcription. Fixed the transcribe prompt to output native script (Devanagari/Bengali/Tamil) for monolingual speech, Roman script only for genuine Hinglish code-switching (previously everything came back Romanized even on success).
2. **Full English+Hindi i18n pass** — UI chrome, confidence badges, evidence labels, low-confidence explanations, chart labels/captions, intent-capture buttons. Multiple real bugs found and fixed along the way:
   - `applyManualInputs()` never handled the `orders` field — meant a user who correctly identified their order-date column via the "which column is your order date" prompt had that answer **silently discarded**, causing an unrecoverable infinite retry loop. Fixed by moving the override into classification *before* aggregation runs (the aggregation was already-baked by the time the old code tried to patch it).
   - Stale browser caching was serving half-updated UI (some strings translated, others not) — fixed via a deploy-versioned cache-busting query string on `index.html`'s asset tags (`script.js?v=<commit-sha>`), not just headers.
   - UI language was a one-way flip (only ever switched TO Hindi, never back) and was persisted across page loads via `localStorage` — meant a fresh page load could show Hindi chrome from a previous session with zero justification. Fixed: language now mirrors the *current* question's language every time, both directions, and is never persisted across loads.
   - Chart always plotted raw `orders` regardless of the actual metric being asked about (e.g., a repeat-orders question showed the same chart as an orders question). Fixed to plot whatever `outcome_metric` is actually in play.
   - Sample-data charts looked visually identical to real data (same solid line, real-looking calendar dates like "Jan '24"). Now: dashed/muted line, generic "Month 1 → Month N" labels, and an explicit "Illustrative sample — not your data" tag, specifically because a synthetic chart carrying real-data visual authority is a genuine honesty violation, not a cosmetic issue.

### 3b. Product-direction pivot — "AI Decision Engine" (this session's main effort, 4 phases, all shipped)

Triggered by the user's own critique: the product was a single-answer calculator, not a decision engine, and the result screen was too dense/statistical for the actual target persona (a low-literacy shopkeeper — explicit test used throughout: **"can a street fruit vendor use this?"**).

Went through an iterative design process (multiple HTML mockups built and reviewed before any code was touched) before landing on:
- Multiple concrete **scenarios** (safe / as-asked / bigger), not one verdict
- A **threshold/breakeven line** where the data supports finding one
- Dense stats collapsed behind a **details disclosure**, not the default view
- A **track-record strip** (predicted vs. actual, in the user's own history) as a trust mechanism
- A **check-back prompt** that closes the loop (did the prediction come true?) — this is what generates the data the track record needs
- A **zero-data bootstrap path** (daily "how many orders yesterday" check-ins) as the non-OCR answer to "what if the vendor has literally nothing in Excel"

**Phase 1 + 1.1 (scenarios + threshold):** `server.js` computes a `scenarios_bundle` — baseline/as-asked/bigger scenarios with rupee projections, plus an optional threshold (linear scan for where the confidence band's lower bound crosses zero). Gate is now purely structural (numeric lever + non-zero change + finite slope), NOT confidence-based — confidence instead drives an `is_low_confidence` flag that mutes the visual treatment (grey numbers, "rough estimate" language, amber best-fit flag) rather than hiding scenarios. This was itself a mid-session correction: the original confidence≥0.45 gate meant scenarios almost never showed on sample data.

**Phase 2 (track record):** Extended the existing `/api/decisions/track-record` endpoint with `hitsInWindow`, `accuracyPct`, `latestReconciled`. New strip at the top of the scenarios block, hidden when no reconciled history exists (deliberately not seeded with fake data — flagged to the user as a real decision point, see open items below).

**Phase 3 (check-back):** New `GET /api/decisions/check-back` (finds the oldest applied-but-unreconciled decision ≥14 days old) and `POST /api/decisions/:id/checkback` (reconciles a *qualitative* outcome — went_up/stayed_same/went_down — into a usable `actualValue`, conservatively, never inventing a precise number the user didn't give). New card on the landing screen.

**Phase 4 (bootstrap):** New `bootstrap` Firestore collection, `POST /api/bootstrap/entry` / `GET /api/bootstrap/status`, and `aggregateBootstrapEntries()` which collapses daily check-in entries into the exact same monthly-row shape the sheet-aggregation pipeline produces, so a bootstrapped user is indistinguishable from a connected-sheet user downstream. Third landing-page path: "No data yet — start fresh."

All four phases were built additively — every one falls back cleanly to the pre-existing UI/behavior when its preconditions aren't met, specifically so a bug in phase N wouldn't break phases 1..N-1.

**Commits, in order:** `d59ff92` (phase 1) → `059c046` (phase 1.1 fix) → `a57a29f` (phase 2) → `5caa230` (phase 3) → `30662b0` (phase 4).

---

## 4. THE CRITICAL OPEN ISSUE — found via live user testing, NOT YET FIXED

The user tested "if I increase my product price from 10 to 12 rupees" on **sample data** and the output was fabricated-looking in a way that matters:

- **The question's actual numbers (₹10 → ₹12) were never parsed or used.** The scenario cards showed a base value of ₹407.89 — that's the sample dataset's `avg_order_value`, not anything derived from the user's question. `detectScenario()`'s money-parsing regex evidently isn't correctly extracting a "from X to Y" price pair and computing the actual delta from it.
- **"Based on 18 months of your own history"** is shown even in sample-data mode. 18 is correct (the sample dataset's length) but "your own" is a lie when the data isn't the user's.
- **The middle scenario card is unconditionally labeled "best fit for your data"** — this was never a real judgment, it's hardcoded (`is_best_fit: true` is always scenario index 1, the "as asked" one), regardless of whether it's actually the best risk-adjusted option. The user correctly noticed it doesn't track any real logic.
- Net effect: confident-looking rupee projections (+₹55,371 etc.) built on the wrong base value, mislabeled as personal history, with a fake "best fit" badge. The user's read — "this is hallucinated" — is fundamentally fair, even though the underlying regression arithmetic is real (not LLM-invented numbers); the presentation is dishonest about what the numbers represent.

### Diagnosis handed to the user, awaiting their direction on scope:
1. Fix `detectScenario()`'s value-parsing so "from 10 to 12" (or similar "X to Y" / "by N" phrasings) is correctly extracted and used as the actual lever change, instead of falling back to a sample-data average.
2. Never say "your own history" when `data_source.mode === 'demo_fallback'` — say "sample data" instead, consistently, everywhere this phrase appears (chart, scenarios question sub-text, etc.).
3. Make "best fit" reflect an actual computation (e.g., best risk-adjusted outcome given confidence band width) or remove the badge when there's no real basis for it.
4. **Open product question, not yet decided:** should sample-data scenario cards show concrete rupee projections at all, or should they be visually/textually demoted (similar to how the sample chart got the dashed/muted/"illustrative" treatment) so nobody mistakes a demo number for a real finding? Leaning toward demoting them, but this needs the user's explicit call before implementation, since it changes what the "try with sample data" demo path actually shows a judge.

**This is the immediate next task.** It's a correctness/integrity issue, not a polish item — it goes to the heart of the "no hallucination" positioning the whole hackathon submission rests on.

---

## 5. Deliberately deferred (with reasons — do not build before the deadline unless the user explicitly revisits)

- **OCR/photo ledger ingestion** — tested viable in an earlier session but needs a two-step classify-then-extract design with reconciliation checks; genuine separate milestone, not a quick add. The bootstrap daily-check-in path (Phase 4) is the interim non-OCR answer to the same underlying problem (zero-data vendors).
- **Deep vertical/seasonal customization** (e.g., mango-season-aware reasoning) — only the lightweight version is in scope: reflecting the user's own product/category name back in generated language (already partly achieved via existing column-classification + `metricDisplayName`). Full domain-specific seasonal logic is a roadmap line, not a build item.
- **Cross-shopkeeper market/trend benchmarking** ("rice generally sells at ₹X") — explicitly NOT roadmapped. This would require either fabricated numbers (a direct violation of the core philosophy) or real pooled cross-user data with consent/privacy infrastructure that doesn't exist. Flagged to the user as something to think about only much later, if at all, not as a near-term feature.
- **Track-record seeding for demo purposes** — deliberately NOT done. The strip only shows with genuine reconciled data (via the real check-back loop, using low env thresholds for demo purposes if needed) rather than fabricated history, because faking data on the one feature whose entire point is "we don't fabricate" was judged too risky. The user has not yet given final direction here beyond acknowledging the tradeoff.

---

## 6. Operational notes for continuing this work

- **Cache-busting is deploy-version-based** (`script.js?v=<commit-sha or timestamp>`), not just headers. After any push, close and reopen the browser tab (not just refresh) before testing — this was the source of several "why isn't my fix showing up" false alarms earlier in the session.
- **Demo-mode env vars for fast testing** (should be reset/removed before the actual judge demo): `HISAAB_CHECKBACK_MIN_DAYS` (default 14, lower for testing), `HISAAB_BOOTSTRAP_MIN_ENTRIES` (default 20, lower for testing).
- **GitHub push credential:** a fine-grained PAT has been used all session for direct pushes to `main` (Contents: Read/Write scope only). The user was reminded multiple times to revoke it after the session; unclear if this has been done — worth confirming/rotating before continuing if this is a new session.
- **User's standing preferences:** critique-first posture, rank suggestions by impact, ground every suggestion in "why would a judge/real shopkeeper care," test methodology is smoke-test-in-isolation before committing, always verify via `node --check` + a boot test + targeted unit tests of new math before pushing. The user does hands-on live testing in the browser after each push and reports back with screenshots — treat those reports as ground truth over any assumption.
- **The user is the final quality gate.** Several bugs in this session were only caught because the user tested rigorously and pushed back on outputs that "felt wrong," including the critical issue in §4. Don't treat a clean syntax check or a passing unit test as equivalent to a verified-working feature — it isn't, until the user confirms it live.

---

## 7. Immediate next steps, in priority order

1. **Fix the §4 issue** — question-value parsing, honest "sample data" language, real (or removed) best-fit logic, and a decision from the user on whether sample-mode scenarios should show real-looking rupee numbers at all.
2. Once §4 is resolved and confirmed working live: the user still owes a final live walkthrough of Phases 1–4 (scenarios, bootstrap, check-back → track record) end-to-end, which had not happened as of this writing.
3. Only after both of the above: consider any remaining polish (e.g., the "You asked" echo on the result screen was flagged early in the session as a minor gap and may still be relevant depending on how §4's fix reshapes that area).
