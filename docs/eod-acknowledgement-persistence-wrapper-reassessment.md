# EOD Acknowledgement Persistence Wrapper Reassessment

## 1. Purpose

Reassess EOD acknowledgement persistence before moving read/write wrappers. This
action is documentation-only: it does not move localStorage access, dynamic key
generation, UI state, EOD safety calculation, close/sell behavior, Supabase
behavior, or execution/orchestrator behavior.

## 2. Current EOD Acknowledgement Inventory

Current location:

- `app/trade-app.tsx`

Functions:

- `getEndOfDayAcknowledgementKey(positionId, date)`
- `readEndOfDayAcknowledgement(positionId, date)`
- `writeEndOfDayAcknowledgement(positionId, date, acknowledged)`

Dynamic key format:

- `eod_acknowledged_${positionId}_${date}`

Key inputs:

- `position.id`
- `eodSafetyDate`

Read behavior:

- `readEndOfDayAcknowledgement` returns `false` when `window` is unavailable.
- it reads `window.localStorage.getItem(getEndOfDayAcknowledgementKey(...))`.
- it returns `true` only when the stored value is exactly `"true"`.
- it catches all storage/parse errors and returns `false`.

Write behavior:

- `writeEndOfDayAcknowledgement` no-ops when `window` is unavailable.
- it builds the same dynamic key.
- if `acknowledged` is `true`, it writes `"true"`.
- if `acknowledged` is `false`, it removes the key.
- it catches all errors and intentionally does not surface them because local
  acknowledgement is optional and must never hide EOD risk.

Call sites:

- `ActivePositionCard` initializes `eodRiskAcknowledged` with
  `readEndOfDayAcknowledgement(position.id, eodSafetyDate)`.
- `acknowledgeEndOfDayRisk` calls
  `writeEndOfDayAcknowledgement(position.id, eodSafetyDate, true)` and then
  sets `eodRiskAcknowledged` to `true`.
- `LiveTradeDetailsModal` receives `eodRiskAcknowledged` and
  `onAcknowledgeEndOfDayRisk`.
- `LiveDayTradeEodSafetyPanel` renders the acknowledgement button and calls the
  passed callback after `event.stopPropagation()`.

UX dependency:

- the acknowledgement only affects whether the EOD manual review button remains
  visible and whether the details panel labels the state as acknowledged.
- it does not calculate EOD safety status.
- it does not close/sell a trade.
- it does not affect execution handoff behavior.

## 3. Coupling Analysis

EOD safety status dependency:

- acknowledgement is downstream of `getEndOfDaySafetyStatus`.
- `showEodManualReview` is driven by EOD safety status, not by localStorage.
- the persistence wrapper must not move or recompute EOD safety status.

Acknowledgement state in `ActivePositionCard`:

- card-local `eodRiskAcknowledged` state is initialized from storage.
- state updates remain card-owned.
- the future wrapper should only preserve the current read/write return values.

localStorage read/write dependency:

- current helpers include `typeof window === "undefined"` guards.
- current helpers catch all localStorage failures.
- future extraction must preserve these guards and catches exactly.

Dynamic key dependency:

- key identity depends on position id and trading date.
- the date input is already computed outside the persistence helpers.
- moving the key builder is safe only if the string format is preserved exactly.

Trading day/position identity dependency:

- acknowledgement is scoped per position and date.
- wrong date or position id would either lose acknowledgements or acknowledge
  the wrong position.
- wrapper callers should continue passing `position.id` and `eodSafetyDate`
  explicitly.

e2e-visible UX behavior:

- the EOD panel button label is `Acknowledge EOD Risk`.
- acknowledged label becomes `Acknowledged`.
- future extraction must not alter these strings, the panel condition, or the
  modal close/click behavior.

Migration/data compatibility risk:

- existing localStorage keys must remain compatible.
- no migration is needed if the wrapper preserves the dynamic key format.

## 4. Proposed Wrapper Boundary

The boundary is safe to extract after this reassessment if the runtime action is
kept tiny.

Proposed module:

`lib/persistence/eod-acknowledgement-persistence.ts`

Potential exported API:

- `buildEndOfDayAcknowledgementKey(positionId: string, date: string): string`
- `readEndOfDayAcknowledgement(positionId: string, date: string): boolean`
- `writeEndOfDayAcknowledgement(positionId: string, date: string, acknowledged: boolean): void`

Extraction rules:

- preserve the key format exactly:
  `eod_acknowledged_${positionId}_${date}`.
- preserve `false` as the read fallback.
- preserve no-op behavior when `window` is unavailable.
- preserve write value `"true"`.
- preserve key removal when `acknowledged` is `false`.
- preserve swallowed localStorage errors.
- do not add logging, migrations, schemas, expiry, or defaults.

## 5. What Should Remain Parent/Card-Owned

- EOD safety calculation.
- `eodSafetyDate` calculation.
- `eodRiskAcknowledged` UI state.
- acknowledgement handler wiring.
- `LiveDayTradeEodSafetyPanel` rendering.
- `LiveTradeDetailsModal` rendering.
- close/sell/exit behavior.
- active position monitoring.
- unrelated Supabase/localStorage behavior.
- execution/handoff/orchestrator behavior.

## 6. What Should Not Happen

- no key format changes.
- no default behavior changes.
- no migration.
- no localStorage key cleanup.
- no Supabase behavior.
- no EOD safety calculation movement.
- no UI state movement.
- no close/sell behavior movement.
- no execution/handoff behavior movement.
- no EOD panel copy/design changes.

## 7. Risk Assessment

Stale acknowledgement risk:

- medium. A stale acknowledgement can hide the acknowledgement button for the
  same position/date, though it does not suppress EOD safety calculation.

Wrong key identity risk:

- high. A changed key format, position id, or date input would strand existing
  acknowledgements or apply them to the wrong position/date.

Trading-day rollover risk:

- medium/high. The date input scopes acknowledgement per trading day; the
  wrapper must not derive its own date.

localStorage unavailable risk:

- low if current fallback behavior is preserved.
- higher if future extraction adds throwing behavior or logging side effects.

Data compatibility risk:

- medium. Existing browser data depends on the exact dynamic key format and
  stored value `"true"`.

e2e coverage limitation:

- current sandbox cannot complete Playwright e2e because Chromium launch is
  blocked by macOS sandbox permissions.
- this UX should be verified in a normal browser-capable environment after any
  runtime extraction.

## 8. Recommended Next Action

Recommended next action:

**Action 405 - Extract EOD Acknowledgement Persistence Wrapper**

Reason:

- the helper cluster is small and isolated.
- current behavior is easy to preserve exactly.
- extraction can move only the dynamic key builder and read/write helpers while
  leaving UI state, EOD safety calculation, close/sell flows, Supabase behavior,
  and execution behavior in place.

## 9. Verification

Verification for this documentation-only action:

- `git diff --check`

No runtime code changes are expected.

## Action 405 Result

Action 405 created
`lib/persistence/eod-acknowledgement-persistence.ts`.

Extracted wrapper API:

- `buildEndOfDayAcknowledgementKey(positionId, date)`
- `readEndOfDayAcknowledgement(positionId, date)`
- `writeEndOfDayAcknowledgement(positionId, date, acknowledged)`

Preserved behavior:

- key format remains `eod_acknowledged_${positionId}_${date}`.
- reads return `false` on server/no-window.
- reads return `false` for missing keys.
- reads return `true` only when the stored value is exactly `"true"`.
- reads swallow localStorage errors and return `false`.
- writes no-op on server/no-window.
- writes store `"true"` when `acknowledged` is `true`.
- writes remove the key when `acknowledged` is `false`.
- writes swallow localStorage errors.

Updated runtime usage:

- `app/trade-app.tsx` now imports the EOD acknowledgement read/write helpers.
- `ActivePositionCard` still owns `eodRiskAcknowledged` state,
  acknowledgement handler wiring, EOD safety calculation inputs, Live Day Trades
  rendering, close/sell behavior, active position monitoring, Supabase behavior,
  and execution/handoff behavior.

No behavior moved:

- no EOD safety calculation moved.
- no UI state moved.
- no close/sell behavior moved.
- no Supabase behavior moved.
- no trade mutation behavior moved.
- no execution/orchestrator behavior moved.

Next recommended action:

**Action 406 - Reassess EOD Acknowledgement Persistence Wrapper Extraction**

## Action 406 Result

Action 406 added
`docs/eod-acknowledgement-persistence-post-extraction-reassessment.md`.

Result:

- Verified the EOD acknowledgement wrapper stayed within the intended tiny
  persistence boundary.
- Confirmed exact key format, `"true"` value, `false` fallback, server/no-window
  behavior, remove-on-false behavior, and swallowed localStorage errors are
  preserved.
- Confirmed `ActivePositionCard` still owns UI state, acknowledgement handler
  wiring, EOD safety calculation, close/sell behavior, Supabase behavior, trade
  mutations, and execution/handoff behavior.
- Documented the Action 405 e2e sandbox limitation.

Next recommended action:

**Action 407 - Reassess Recommendation Discard Persistence Wrapper**
