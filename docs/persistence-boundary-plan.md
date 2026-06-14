# Persistence Boundary Plan

## 1. Purpose

Plan persistence boundary work after the major UI extraction pass and the first
tiny state-hook extractions.

Persistence is the next risk-heavy domain because `app/trade-app.tsx` still
mixes localStorage helpers, Supabase reads/writes, demo/local fallbacks, trade
mutation flows, EOD acknowledgements, audit/event logs, execution metadata, and
diagnostics. This plan is documentation-only and does not move any persistence
behavior.

## 2. Current Persistence Inventory

localStorage keys and local-only persistence:

- `trade-demo-recommendations-v1`
- `trade-demo-active-positions-v1`
- `trade-demo-closed-positions-v1`
- `trade-demo-last-action-v1`
- `trade-mock-broker-latest-fill`
- `trade-dismissed-warnings`
- `trade-live-market-trial-runbook-v1`
- `trade-provider-plan-mode-v1`
- `trade-dev-preview-recommendations-hidden-v1`
- dynamic EOD acknowledgement keys:
  - `eod_acknowledged_${positionId}_${date}`
- `trade-management-events`
- `trade-risk-controls-v1`
- `ture_execution_mode`
- `trade-avanza-verification-notes-v1`
- paper-session protocol local state key.

Existing localStorage-backed modules:

- `lib/recommendation-snapshot.ts`
  - `recommendationSnapshotLocalStorageKey`
  - `readRecommendationSnapshotsFromLocalStorage`
  - `persistRecommendationSnapshotToLocalStorage`
  - `persistRecommendationSnapshot`
- `lib/recommendation-scan-run.ts`
  - `recommendationScanRunLocalStorageKey`
  - scan-run localStorage read/write fallback.
- `lib/recommendation-batch-memory.ts`
  - `recommendationBatchLocalStorageKey`
  - batch localStorage read/write fallback.
- `lib/recommendation-outcome-tracker.ts`
  - `recommendationOutcomeLocalStorageKey`
  - outcome localStorage read/write fallback.
- `lib/recommendation-outcome-evaluation-runner.ts`
  - outcome evaluation run localStorage read/write helpers.
- `lib/execution-event-log.ts`
  - `ture_execution_event_log_v1`.
- `lib/execution-record-store.ts`
  - `ture_execution_records_v1`.
- `lib/avanza-agent-run-store.ts`
  - `ture_avanza_agent_runs_v1`.
- `lib/safe-browser-action-diagnostics-store.ts`
  - safe browser action diagnostics localStorage store.
- `lib/dev-mock-broker-result-store.ts`
  - dev mock broker result localStorage store.
- `lib/avanza-agent-bridge-config.ts`
  - Avanza bridge config localStorage store.

Supabase read flows in `app/trade-app.tsx`:

- `recommendations`
- `user_settings`
- `positions` with open status.
- `positions` with closed status.
- `position_updates`
- `scheduled_scan_runs`
- `recommendation_scan_runs`
- `recommendation_batches`
- `recommendation_snapshots`
- `recommendation_outcomes`
- `market_regime_snapshots`

Supabase write/mutation flows in `app/trade-app.tsx`:

- recommendation discard/taken status updates through `recommendations`.
- ADD TRADE creates rows in `positions`.
- ADD TRADE updates recommendation status to `taken`.
- close/sell updates rows in `positions` for partial exits and full closes.
- trade mutation fallbacks omit `execution_metadata` if the column is missing.

Supabase-backed helper/module flows:

- `persistRecommendationSnapshot(...)` writes to `recommendation_snapshots` when
  Supabase is available, with localStorage fallback.
- `persistRecommendationScanRun(...)` writes to `recommendation_scan_runs` with
  localStorage fallback.
- `persistRecommendationBatch(...)` writes to `recommendation_batches` with
  localStorage fallback.
- `persistRecommendationOutcome(...)` writes to `recommendation_outcomes` with
  localStorage fallback.
- `markRecommendationSnapshotTaken(...)` can update Supabase/local metadata for
  taken recommendations.
- API routes write scheduled scan runs, generated recommendations, outcome
  evaluation rows, scanner cache, position updates, and market calendar cache.

Mutation flows:

- ADD TRADE:
  - validates selected recommendation and broker fill.
  - builds optional `execution_metadata`.
  - demo path writes demo recommendations/active positions to localStorage.
  - Supabase path inserts `positions` and updates `recommendations`.
  - optionally logs broker preview/planning local events.
- Close/sell:
  - validates broker exit confirmation.
  - computes partial/full close state.
  - demo path writes demo active/closed positions to localStorage.
  - Supabase path updates `positions`.
  - logs broker exit and trade closed local events.
- Recommendation discard:
  - updates recommendation status and keeps persistence parent-owned.

Audit/event persistence:

- `trade-management-events` is written by many best-effort local event helpers in
  `app/trade-app.tsx`.
- execution audit local stores exist in `lib/execution-event-log.ts`,
  `lib/execution-record-store.ts`, and `lib/avanza-agent-run-store.ts`.
- execution audit Supabase contracts/writers exist, but are gated by explicit
  environment flags and disabled/stubbed by default.

Execution metadata persistence:

- `execution_metadata` is embedded in `positions`.
- add/close flows include fallback writes when the column is unavailable.
- localhost bridge and handoff previews explicitly report no Supabase write/no
  trade mutation for current preview/eligibility paths.

Fallback/demo/dev diagnostics flows:

- demo recommendations/live/closed trades are localStorage-only.
- mock broker fill import reads `trade-mock-broker-latest-fill`.
- safe browser action diagnostics, dev mock broker results, and Avanza bridge
  config are local dev/diagnostics persistence.

## 3. Risk Classification

Low-risk UI preferences:

- dismissed warnings.
- provider plan mode hint.
- dev-preview recommendations hidden flag.
- execution mode preference.
- risk control UI settings.
- paper-session/live-market-trial local checklist state.

Medium-risk local-only UX persistence:

- demo recommendations/active/closed positions.
- demo last action.
- latest mock broker fill.
- Avanza verification notes.
- safe browser action diagnostics.
- dev mock broker results.

High-risk trade state persistence:

- ADD TRADE position creation.
- recommendation status update to `taken`.
- close/sell partial update.
- close/sell full close update.
- demo active/closed trade mutation mirrors.

High-risk Supabase writes:

- `positions` inserts/updates.
- `recommendations` status updates.
- recommendation snapshot/batch/scan-run/outcome persistence.
- scheduled scan run/recommendation generation API writes.

Execution-critical persistence:

- `execution_metadata` embedded in position rows.
- execution audit lifecycle/agent run/progress contracts and writers.
- execution record local store.
- Avanza agent run local store.

Audit/idempotency-critical persistence:

- `trade-management-events`.
- execution audit Supabase writer tables:
  - `execution_lifecycle_events`
  - `execution_agent_runs`
  - `execution_agent_progress_events`
- recommendation outcome dedupe/backfill metadata.
- snapshot taken metadata.

## 4. Ownership Principles

- Do not move persistence without a clear input/output contract.
- Do not move trade mutation code without an idempotency plan.
- Do not write execution metadata without an audit trail and no-write
  verification for preview paths.
- LocalStorage helpers can be isolated before behavior changes, but first only
  for constants and non-critical wrappers.
- Supabase boundaries should be explicit, typed, and tested before replacing
  inline reads/writes.
- Execution persistence should remain disabled/stubbed until execution record
  creation and audit record boundaries are stable.
- Demo/local persistence must stay clearly labelled as local-only and must not
  affect real Supabase records.
- Persistence fallbacks must never hide failed real writes in trade mutation
  flows.

## 5. Candidate Boundary Modules/Hooks

`lib/persistence/local-storage-keys.ts`

- Risk: low.
- Purpose: centralize key constants only.
- Safe if no read/write behavior moves.

`lib/persistence/trade-app-local-storage.ts`

- Risk: medium.
- Purpose: typed localStorage read/write wrappers for non-critical UI/dev data.
- Should start with dev/demo/UI preferences, not trades.

`lib/persistence/trade-persistence-contract.ts`

- Risk: high.
- Purpose: document typed contracts for add/open/close trade persistence before
  moving behavior.
- Should include idempotency keys, expected rows, and failure modes.

`lib/persistence/recommendation-discard-persistence.ts`

- Risk: medium/high.
- Purpose: isolate recommendation status update later.
- Must preserve discard/taken semantics and Supabase errors.

`lib/persistence/eod-acknowledgement-persistence.ts`

- Risk: medium.
- Purpose: isolate EOD acknowledgement key/read/write behavior.
- Safe only after a dedicated boundary reassessment because the dynamic key and
  safety semantics must remain exact.

`lib/persistence/execution-audit-persistence.ts`

- Risk: high.
- Purpose: consolidate existing execution audit client/local/writer boundaries.
- Must keep flags, no-write preview protections, and production blocks.

`lib/persistence/supabase-trade-persistence.ts`

- Risk: very high.
- Purpose: future Supabase add/partial/full close persistence.
- Must wait for idempotency, audit, and e2e coverage.

## 6. Safe First Extraction Candidates

A. Document/export localStorage key constants:

- safest next runtime candidate.
- no behavior should move.
- should start with keys currently defined inline in `app/trade-app.tsx`.

B. Extract pure localStorage read/write wrappers for non-critical UI/dev data:

- safe only after constants are centralized.
- start with preferences/dev diagnostics, not trade data.

C. Extract EOD acknowledgement persistence wrapper:

- medium risk because it is safety-related and dynamic by position/date.
- should get a dedicated reassessment first.

D. Extract recommendation discard persistence wrapper:

- medium/high risk because it changes recommendation status and affects visible
  lists/history.
- should wait until low-risk localStorage constants/wrappers are done.

E. Supabase/trade persistence later:

- high/very high risk.
- requires idempotency and audit plan.

F. Execution metadata persistence much later:

- very high risk.
- keep disabled/stubbed and no-write protected until execution record boundary
  planning is complete.

## 7. What Must Not Move Yet

- trade add/open/close mutations.
- Supabase writes for `positions`.
- Supabase writes for `recommendations` status changes.
- execution result/record persistence.
- audit-critical writes.
- `trade-management-events` write semantics.
- active/live monitoring persistence and refresh flows.
- recommendation outcome/snapshot/batch persistence behavior.
- any behavior without an idempotency strategy.

## 8. Proposed Implementation Sequence

1. Action 401: Reassess localStorage Key Constants Boundary.
2. Action 402: Extract localStorage Key Constants.
3. Action 403: Reassess localStorage Key Constants Extraction.
4. Action 404: Reassess EOD acknowledgement persistence wrapper.
5. Action 405: Extract EOD acknowledgement persistence wrapper.
6. Action 406: Reassess EOD acknowledgement persistence wrapper extraction.
7. Action 407: Reassess recommendation discard persistence wrapper.
8. Action 408: Reassess dev/diagnostics localStorage wrapper.
9. Later: create Supabase trade persistence boundary plan.
10. Later: create execution record creation boundary plan.

## 9. Recommended Next Action

Recommended next action:

**Action 401 - Reassess localStorage Key Constants Boundary**

Why:

- key constants are the lowest-risk persistence boundary.
- no behavior needs to move.
- a reassessment should confirm which inline keys can be centralized without
  changing dynamic keys, existing helper-module exports, or compatibility with
  stored data.

## 10. Risk Assessment

Data loss risk:

- high for trade mutations and Supabase writes.
- medium for demo/local data.
- low for key-constant documentation if key strings are preserved exactly.

Duplicate write risk:

- high for trade add/close, recommendation outcome, snapshot, and execution
  audit writes without idempotency.

Stale localStorage risk:

- medium/high for demo data, EOD acknowledgements, mock fills, and diagnostic
  stores.

Supabase consistency risk:

- high for `positions`, `recommendations`, and recommendation learning tables.

Idempotency risk:

- high for every write that can be retried after partial success.

Audit trail risk:

- high for trade mutation and execution metadata persistence.

Execution safety risk:

- very high for any execution record/result persistence or broker-related
  metadata write.

E2E coverage reliance:

- high for trade lifecycle flows, History/Statistics readbacks, demo flow, and
  execution sandbox guarantees.

## 11. Verification

Verification for this documentation-only action:

- `git diff --check`

No runtime code changes are expected.

## Action 401 Result

Action 401 added
`docs/local-storage-key-constants-boundary-reassessment.md`.

Result:

- Inventoried inline `app/trade-app.tsx` localStorage keys, existing
  helper-module key constants, recommendation-learning keys, execution/audit
  keys, diagnostics keys, demo keys, and the dynamic EOD acknowledgement key.
- Confirmed localStorage key centralization is safe only as a constants-only
  extraction with exact string preservation.
- Confirmed no read/write helpers, migrations, default values, dynamic EOD key
  generation, Supabase persistence, trade mutations, recommendation-learning
  persistence, or execution/orchestrator persistence should move in the next
  action.

Next recommended action:

**Action 402 - Extract localStorage Key Constants**

## Action 402 Result

Action 402 created `lib/persistence/local-storage-keys.ts`.

Result:

- Extracted exact static localStorage key constants for demo storage, mock
  broker latest fill, dismissed warnings, live market trial runbook, provider
  plan mode, dev preview visibility, and trade management events.
- Updated `app/trade-app.tsx` and `lib/execution-timeline.ts` to use the
  centralized constants.
- Kept dynamic EOD key generation, read/write helpers, migrations, Supabase
  behavior, trade mutations, execution persistence, recommendation-learning
  persistence, and existing helper-module key ownership unchanged.

Next recommended action:

**Action 403 - Reassess localStorage Key Constants Extraction**

## Action 403 Result

Action 403 added
`docs/local-storage-key-constants-post-extraction-reassessment.md`.

Result:

- Verified the Action 402 constants extraction stayed within the intended
  boundary.
- Confirmed the constants module has no read/write helpers, dynamic builders,
  migrations, defaults, Supabase behavior, trade mutations, recommendation
  persistence, or execution/orchestrator persistence.
- Recorded the Action 402 e2e status: static checks passed, while Playwright
  e2e was blocked by sandbox server/browser permissions before app test logic.

Next recommended action:

**Action 404 - Reassess EOD Acknowledgement Persistence Wrapper**

## Action 404 Result

Action 404 added
`docs/eod-acknowledgement-persistence-wrapper-reassessment.md`.

Result:

- Inventoried `getEndOfDayAcknowledgementKey`,
  `readEndOfDayAcknowledgement`, `writeEndOfDayAcknowledgement`, and their
  `ActivePositionCard` call sites.
- Confirmed the wrapper boundary is safe if the extraction preserves the exact
  dynamic key format, return defaults, localStorage guards, write/remove
  semantics, and swallowed errors.
- Confirmed EOD safety calculation, UI state, Live Day Trades rendering,
  close/sell behavior, Supabase behavior, and execution/orchestrator behavior
  remain outside the wrapper.

Next recommended action:

**Action 405 - Extract EOD Acknowledgement Persistence Wrapper**

## Action 405 Result

Action 405 created
`lib/persistence/eod-acknowledgement-persistence.ts`.

Result:

- Moved only the EOD acknowledgement key builder and read/write helpers.
- Preserved exact dynamic key format and localStorage fallback/error behavior.
- Left EOD safety calculation, card-local acknowledgement state, close/sell
  behavior, Supabase behavior, trade mutations, and execution/orchestrator
  behavior untouched.

Next recommended action:

**Action 406 - Reassess EOD Acknowledgement Persistence Wrapper Extraction**

## Action 406 Result

Action 406 added
`docs/eod-acknowledgement-persistence-post-extraction-reassessment.md`.

Result:

- Verified the EOD acknowledgement wrapper preserves the dynamic key format,
  read/write semantics, fallbacks, and error swallowing.
- Confirmed no UI state, EOD safety calculation, close/sell behavior,
  Supabase/trade behavior, or execution behavior moved.
- Documented the Action 405 e2e sandbox limitation as environment-limited.

Next recommended action:

**Action 407 - Reassess Recommendation Discard Persistence Wrapper**

## Action 407 Result

Action 407 added
`docs/recommendation-discard-persistence-wrapper-reassessment.md`.

Result:

- Inventoried recommendation discard persistence and found no dedicated
  confirm-discard localStorage key/read/write wrapper.
- Confirmed the active discard path is a Supabase `recommendations` status and
  metadata update plus local in-memory recommendation state mutation.
- Confirmed `RecommendationCardContainer` already owns only discard modal UI
  state.
- Confirmed recommendation-learning localStorage stores are adjacent but are
  not the confirm-discard persistence path.

Next recommended action:

**Action 408 - Reassess Dev/Diagnostics localStorage Wrapper**

## Action 408 Result

Action 408 added
`docs/dev-diagnostics-local-storage-wrapper-reassessment.md`.

Result:

- Inventoried app-local dev/diagnostics localStorage usage and existing
  diagnostics store modules.
- Confirmed existing safe-browser diagnostics, dev mock broker result, bridge
  config, execution record, execution event log, and Avanza agent run stores
  should remain module-owned for now.
- Identified a safe next wrapper target for exact app-local dev/preference
  helpers such as dismissed warnings, dev-preview visibility, provider plan
  hint, live market trial runbook, and mock broker latest fill access.

Next recommended action:

**Action 409 - Extract Dev/Diagnostics localStorage Wrapper**

## Action 409 Result

Action 409 created
`lib/persistence/dev-diagnostics-local-storage.ts`.

Result:

- Extracted exact app-local dev/preference localStorage helpers for provider
  plan mode, dev-preview recommendation visibility, dismissed warnings, and
  latest mock broker fill access/removal.
- Updated `app/trade-app.tsx` to import those helpers.
- Preserved static key strings through `lib/persistence/local-storage-keys.ts`.
- Left live market trial runbook persistence inline because it is coupled to
  local runbook defaults and normalization.
- Left diagnostics stores, execution audit/event stores, and execution record
  stores module-owned.

Next recommended action:

**Action 410 - Reassess Dev/Diagnostics localStorage Wrapper Extraction**

## Action 410 Result

Action 410 added
`docs/dev-diagnostics-local-storage-post-extraction-reassessment.md`.

Result:

- Verified Action 409 stayed within the app-local dev/preference wrapper
  boundary.
- Confirmed provider plan mode, dev-preview visibility, dismissed warnings,
  and latest mock broker fill helpers preserve exact semantics.
- Confirmed live market trial runbook persistence remains inline and is the
  next localStorage boundary to reassess.

Next recommended action:

**Action 411 - Reassess Live Market Trial Runbook Persistence Wrapper**
