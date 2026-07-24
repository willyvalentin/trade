# Live Market Trial Runbook Persistence Wrapper Reassessment

## 1. Purpose

Reassess live market trial runbook persistence before moving any read/write
wrapper out of `app/trade-app.tsx`.

This is a documentation-only boundary review. No runtime code, state, effects,
localStorage access, Supabase behavior, trade mutation behavior, execution
behavior, or live market workflow behavior changed in this action.

## 2. Current Runbook Persistence Inventory

Location:

- `app/trade-app.tsx`

Storage key:

- local constant: `liveMarketTrialRunbookStorageKey`
- value: `TRADE_LIVE_MARKET_TRIAL_RUNBOOK_STORAGE_KEY`
- exact key string from `lib/persistence/local-storage-keys.ts`:
  `trade-live-market-trial-runbook-v1`

Type/data shape:

- `LiveMarketTrialRunbookLocalState` from
  `lib/live-market-trial-runbook.ts`
- shape:
  - `trial_date: string`
  - `selected_mode: LiveMarketTrialRunbookMode`
  - `checklist_completion: Record<string, boolean>`
  - `notes: string`
  - `trial_outcome: LiveMarketTrialRunbookOutcome`
  - `ended_at: string | null`

Default behavior:

- `createDefaultLiveMarketTrialRunbookState(now = new Date())`
- `trial_date` defaults to `getNewYorkDateString(now)`.
- `selected_mode` defaults to `observation_only`.
- `checklist_completion` defaults to `{}`.
- `notes` defaults to an empty string.
- `trial_outcome` defaults to `none`.
- `ended_at` defaults to `null`.

Validation/normalization:

- `normalizeLiveMarketTrialRunbookMode(...)`
  - accepts only `observation_only`, `recommendation_logging`, and
    `optional_manual_paper_tracking`.
  - falls back to `observation_only`.
- `normalizeLiveMarketTrialRunbookOutcome(...)`
  - accepts only `no_trade_valid`, `recommendations_logged`,
    `paper_trade_completed`, `blocked`, `needs_review`, and `none`.
  - falls back to `none`.
- `normalizeLiveMarketTrialRunbookState(...)`
  - falls back to the default state when storage is missing, malformed, or not
    an object.
  - keeps only non-empty checklist ids.
  - coerces checklist values to `completed === true`.
  - normalizes `trial_date` through the shared `text(...)` helper.
  - truncates notes to 2000 characters.
  - normalizes `ended_at` to text-or-null.

Read behavior:

- `readLiveMarketTrialRunbookState()`
- returns the default state when `window` is unavailable.
- reads `window.localStorage.getItem(liveMarketTrialRunbookStorageKey)`.
- parses JSON when a stored value exists.
- normalizes parsed state through `normalizeLiveMarketTrialRunbookState(...)`.
- returns the default state when no stored value exists.
- catches all localStorage/JSON errors and returns the default state.

Write behavior:

- implemented in a `useEffect` in `app/trade-app.tsx`.
- guarded by `hasLoadedLiveMarketTrialRunbookRef.current`.
- writes `JSON.stringify(liveMarketTrialRunbookState)` to the same key.
- catches and swallows localStorage errors with the existing comment:
  local trial runbook notes must never block the app.
- there is no delete/remove behavior in the current runbook path.

Call sites:

- initial state:
  `useState<LiveMarketTrialRunbookLocalState>(() => createDefaultLiveMarketTrialRunbookState())`
- initial hydration effect:
  `setLiveMarketTrialRunbookState(readLiveMarketTrialRunbookState())`
- write effect:
  persists `liveMarketTrialRunbookState` after hydration.
- reset button:
  `createDefaultLiveMarketTrialRunbookState(currentTime)`
- summary construction:
  `buildLiveMarketTrialRunbookSummary({ local_state: liveMarketTrialRunbookState, ... })`
- UI panel:
  `LiveMarketTrialRunbookPanel` receives state plus parent-owned update
  callbacks.

Visibility/criticality:

- production-visible app UI state, not dev-only.
- live-market-workflow-adjacent, but local checklist/notes state only.
- not a Supabase, trade mutation, execution, broker, or orchestrator
  persistence path.

## 3. Coupling Analysis

Local typed/default behavior:

- The read helper, default builder, and normalizer are tightly coupled. Moving
  only the localStorage read/write calls would make the boundary less clear.
- The safest extraction is to move the exact default builder, mode/outcome
  normalizers, state normalizer, read helper, and write helper together as a
  tiny persistence module.

Runbook UI dependency:

- The UI depends on the normalized `LiveMarketTrialRunbookLocalState` shape and
  existing defaults.
- The UI update callbacks, reset action, mode/outcome controls, checklist
  toggles, notes editing, and end-trial behavior should remain parent-owned.

Live market workflow dependency:

- The state influences the runbook panel summary and checklist completion, but
  does not trigger scans, ranking, recommendation publishing, ADD TRADE,
  close/sell behavior, or execution handoff.
- Because the runbook is workflow-adjacent, default and compatibility behavior
  must be preserved exactly.

Dev/prod visibility:

- This is production-visible local UI state.
- It should not be treated as a dev-only preference wrapper.

localStorage compatibility risk:

- Existing stored JSON must remain readable.
- The exact key string, accepted enum values, checklist coercion, notes
  truncation, and default fallback must not change.

e2e-visible UX behavior:

- A stored checklist, selected mode, notes, outcome, and ended timestamp can be
  visible in the Market/Runbook UI.
- A wrapper extraction should preserve hydration timing and the
  post-hydration write guard to avoid overwriting stored state with defaults on
  initial render.

Wrapper clarity:

- A dedicated wrapper would improve clarity if it owns the full persistence
  contract.
- It would reduce clarity if only the storage key or raw `getItem`/`setItem`
  calls move while defaults and normalization remain split.

## 4. Proposed Wrapper Boundary

Safe proposed module:

- `lib/persistence/live-market-trial-runbook-persistence.ts`

Proposed exported API:

- `createDefaultLiveMarketTrialRunbookState(now?: Date)`
- `normalizeLiveMarketTrialRunbookMode(value: unknown)`
- `normalizeLiveMarketTrialRunbookOutcome(value: unknown)`
- `normalizeLiveMarketTrialRunbookState(value: unknown)`
- `readLiveMarketTrialRunbookState()`
- `writeLiveMarketTrialRunbookState(state: LiveMarketTrialRunbookLocalState)`

Boundary requirements:

- import the existing `LiveMarketTrialRunbookLocalState`,
  `LiveMarketTrialRunbookMode`, and `LiveMarketTrialRunbookOutcome` types from
  `lib/live-market-trial-runbook.ts`.
- import `getNewYorkDateString` from `lib/intraday-scan-window`.
- import `TRADE_LIVE_MARKET_TRIAL_RUNBOOK_STORAGE_KEY` from
  `lib/persistence/local-storage-keys.ts`.
- preserve server/no-window fallback exactly.
- preserve swallowed read/write errors exactly.
- preserve JSON parse/normalize behavior exactly.
- preserve notes truncation at 2000 characters.
- preserve no delete/remove behavior.

Extraction readiness:

- This boundary is safe to extract next if it remains a tiny wrapper and keeps
  the parent write-effect guard in `app/trade-app.tsx`.
- The wrapper should not own React state, effects, UI callbacks, runbook
  summary construction, or live market workflow logic.

## 5. What Should Remain Parent/Module-Owned

Keep in `app/trade-app.tsx`:

- `liveMarketTrialRunbookState`
- `setLiveMarketTrialRunbookState`
- `hasLoadedLiveMarketTrialRunbookRef`
- hydration effect timing
- write effect timing and dependency on `liveMarketTrialRunbookState`
- runbook UI callbacks for mode, checklist, notes, outcome, end time, and reset
- `LiveMarketTrialRunbookPanel` rendering and props
- `buildLiveMarketTrialRunbookSummary(...)` call composition

Keep elsewhere:

- live market scanning behavior
- provider/data behavior
- recommendation generation/ranking/publishing behavior
- Supabase persistence
- trade mutations
- execution/handoff/orchestrator behavior
- broker/Avanza/browser behavior

## 6. What Should Not Happen

- no key name changes.
- no data shape changes.
- no default changes.
- no validation or normalization behavior changes.
- no migration.
- no delete/remove behavior added.
- no UI state movement.
- no effect timing changes.
- no live market behavior changes.
- no Supabase behavior movement.
- no trade mutation movement.
- no execution/trading behavior movement.

## 7. Risk Assessment

Typed/default drift risk:

- medium. The state shape is small, but the accepted mode/outcome values,
  `trial_date` default, notes truncation, and checklist coercion must remain
  byte-for-byte compatible in behavior.

Stale localStorage risk:

- medium. Existing stored values must continue to normalize instead of being
  discarded.

Dev/prod visibility risk:

- medium. Unlike dev-preview or dismissed-warning preferences, the runbook is
  production-visible and live-market-workflow-adjacent.

Live market workflow risk:

- low/medium if the wrapper remains persistence-only. It becomes higher if
  state/effects, runbook summary logic, scan behavior, or execution behavior
  move with it.

e2e coverage limitation:

- e2e coverage can catch visible UI regressions, but may not catch every
  localStorage compatibility edge case. Runtime extraction should also rely on
  focused code review of key/default/normalization semantics.

Future wrapper extraction risk:

- lower than execution audit/event, Supabase/trade persistence, or execution
  metadata persistence.
- higher than constants-only or dev-only preference wrappers.

## 8. Recommended Next Action

Recommended next action:

**Action 412 - Extract Live Market Trial Runbook Persistence Wrapper**

Reason:

- the persistence contract is small and app-local.
- the key is already centralized.
- the data shape is explicit and typed.
- extraction can be safe if the exact default/normalization/read/write
  behavior moves together.
- execution audit/event log, Supabase/trade persistence, and execution
  metadata persistence remain riskier and should wait.

## 9. Verification

Verification for this documentation-only action:

- `git diff --check`

No runtime code changes were made.

## Action 412 Follow-Up

Action 412 created
`lib/persistence/live-market-trial-runbook-persistence.ts`.

Extraction result:

- Moved the live market trial runbook default builder, mode/outcome
  normalization, state normalization, read helper, and write helper into the
  dedicated persistence wrapper.
- Preserved the exact key constant value:
  `trade-live-market-trial-runbook-v1`.
- Preserved typed state shape, default values, enum fallback behavior,
  checklist completion coercion, notes truncation, ended-at text/null behavior,
  read fallback behavior, JSON write behavior, server/no-window behavior, and
  swallowed localStorage errors.
- Kept `app/trade-app.tsx` as the owner of runbook UI state,
  hydration/write-effect guards, UI callbacks, live market workflow,
  provider/data behavior, Supabase behavior, trade mutations, and
  execution/orchestrator behavior.

Verification:

- `./node_modules/.bin/tsc --noEmit` passed.
- `npm run lint` passed.
- default sandbox `npm run test:e2e` was blocked before app test logic by
  `listen EPERM: operation not permitted 0.0.0.0:3010`.
- escalated `npm run test:e2e` passed: 64 tests.

Next recommended action:

**Action 413 - Reassess Live Market Trial Runbook Persistence Wrapper Extraction**

## Action 413 Follow-Up

Action 413 created
`docs/live-market-trial-runbook-persistence-post-extraction-reassessment.md`.

Post-extraction result:

- Verified `lib/persistence/live-market-trial-runbook-persistence.ts` exports
  only the intended default, normalization, read, and write helpers.
- Confirmed the key, type shape, defaults, normalization, read fallback, JSON
  write behavior, server/no-window behavior, and swallowed localStorage errors
  remain unchanged.
- Confirmed `app/trade-app.tsx` still owns runbook UI state,
  hydration/write-effect guards, callbacks, live market workflow,
  provider/data behavior, Supabase/trade behavior, and
  execution/orchestrator behavior.

Next recommended action:

**Action 414 - Reassess Execution Audit/Event Log Persistence Boundary**
