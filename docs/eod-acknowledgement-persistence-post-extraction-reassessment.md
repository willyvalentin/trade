# EOD Acknowledgement Persistence Post-Extraction Reassessment

## 1. Purpose

Reassess the EOD acknowledgement persistence extraction from Action 405. This
confirms the wrapper stayed within the intended tiny persistence boundary and
recommends the next safe persistence-boundary step.

## 2. Current Wrapper Inventory

Wrapper module:

- `lib/persistence/eod-acknowledgement-persistence.ts`

Exported API:

- `buildEndOfDayAcknowledgementKey(positionId, date)`
- `readEndOfDayAcknowledgement(positionId, date)`
- `writeEndOfDayAcknowledgement(positionId, date, acknowledged)`

Dynamic key format:

- `eod_acknowledged_${positionId}_${date}`

Read semantics:

- returns `false` when `window` is unavailable.
- reads `window.localStorage.getItem(buildEndOfDayAcknowledgementKey(...))`.
- returns `true` only when the stored value is exactly `"true"`.
- returns `false` for missing keys or any value other than `"true"`.
- catches localStorage errors and returns `false`.

Write semantics:

- no-ops when `window` is unavailable.
- builds the same dynamic key from explicit `positionId` and `date`.
- writes `"true"` when `acknowledged` is `true`.
- removes the key when `acknowledged` is `false`.
- catches and swallows localStorage errors.

Files using the wrapper:

- `app/trade-app.tsx`

Call-site ownership:

- `ActivePositionCard` still initializes `eodRiskAcknowledged` from
  `readEndOfDayAcknowledgement(position.id, eodSafetyDate)`.
- `ActivePositionCard` still writes via
  `writeEndOfDayAcknowledgement(position.id, eodSafetyDate, true)` inside
  `acknowledgeEndOfDayRisk`.
- `ActivePositionCard` still owns the subsequent
  `setEodRiskAcknowledged(true)` UI state update.

## 3. Boundary Verification

Exact key format unchanged:

- wrapper still returns `eod_acknowledged_${positionId}_${date}`.

Stored value unchanged:

- writes still store `"true"` for acknowledged positions.

False fallback unchanged:

- reads still return `false` on server/no-window.
- reads still return `false` on missing keys.
- reads still return `false` when localStorage throws.

Server/no-window behavior unchanged:

- reads return `false`.
- writes no-op.

Remove-on-false unchanged:

- writes still call `window.localStorage.removeItem(key)` when
  `acknowledged` is `false`.

localStorage errors swallowed:

- read errors return `false`.
- write errors are swallowed with the same safety comment.

No behavior moved:

- no EOD safety calculation moved.
- no `eodSafetyDate` calculation moved.
- no `eodRiskAcknowledged` UI state moved.
- no acknowledgement handler wiring moved.
- no Live Day Trades rendering moved.
- no close/sell/exit behavior moved.
- no active position monitoring moved.
- no Supabase behavior moved.
- no trade mutation behavior moved.
- no execution/handoff/orchestrator behavior moved.

## 4. Test Status

Action 405 checks:

- `./node_modules/.bin/tsc --noEmit` passed.
- `npm run lint` passed.
- `git diff --check` passed.

Action 405 e2e status:

- `npm run test:e2e` remains environment-blocked in this sandbox.
- default run cannot bind `0.0.0.0:3010` due to `listen EPERM`.
- localhost-bound workaround starts the dev server at `127.0.0.1:3010`.
- Chromium then fails before app test logic with macOS sandbox
  `MachPortRendezvousServer... Permission denied`.

No known app regression was observed from the available checks.

## 5. Remaining Persistence Candidates

Ranked by safety and payoff:

1. Reassess recommendation discard persistence wrapper.
2. Reassess dev/diagnostics localStorage wrappers.
3. Reassess execution audit/event log persistence wrappers.
4. Supabase/trade persistence later.
5. Execution metadata persistence much later.

Recommendation discard persistence is the best next reassessment target because:

- the recommendations UI/component extraction is already mostly complete.
- discard behavior is narrower than Supabase/trade persistence.
- it is still behavior-sensitive because it touches selected recommendation
  state, discard status, persistence, and e2e-visible card behavior.

## 6. Recommended Next Action

Recommended next action:

**Action 407 - Reassess Recommendation Discard Persistence Wrapper**

Reason:

- EOD wrapper extraction stayed within the intended boundary.
- discard persistence is the next app-owned local persistence area with a
  potentially extractable wrapper.
- dev/diagnostics wrappers can wait until user-impacting persistence wrappers
  are reassessed.

## 7. Risk Assessment

Stale acknowledgement risk:

- unchanged from Action 405. Existing acknowledgements remain scoped by exact
  position/date keys.

Wrong key identity risk:

- reduced by centralizing the builder, but still important for future callers.
- callers must continue passing the correct position id and trading date.

Trading-day rollover risk:

- unchanged. The wrapper intentionally does not derive the date.

localStorage unavailable risk:

- unchanged. The wrapper preserves false/no-op fallback behavior.

E2E environment limitation:

- current sandbox cannot complete Playwright because of server binding and
  Chromium launch permissions.
- EOD UI should be rechecked in a normal browser-capable environment after
  runtime persistence work.

Future wrapper extraction risk:

- recommendation discard persistence has higher risk than EOD acknowledgement
  because it can affect card visibility, status, learning data, and selected
  recommendation flows.

## 8. Verification

Verification for this documentation-only action:

- `git diff --check`

No runtime code changes are expected.

## Action 407 Follow-Up

Action 407 created
`docs/recommendation-discard-persistence-wrapper-reassessment.md`.

Result:

- Recommendation discard persistence is not safe to extract as a localStorage
  wrapper right now.
- The confirm-discard path is Supabase/status/metadata coupled, with local
  in-memory recommendation state mutation in `app/trade-app.tsx`.
- `RecommendationCardContainer` already owns only the discard confirmation UI
  state.
- Recommendation-learning localStorage stores are adjacent but are not the
  confirm-discard persistence path.

Next recommended action:

**Action 408 - Reassess Dev/Diagnostics localStorage Wrapper**

## Action 408 Follow-Up

Action 408 added
`docs/dev-diagnostics-local-storage-wrapper-reassessment.md`.

Result:

- Confirmed EOD acknowledgement remains verified and unchanged.
- Reassessed lower-risk dev/diagnostics localStorage usage.
- Recommended extracting only app-local dev/preference helper behavior next,
  while leaving execution audit/event stores and existing diagnostics store
  modules untouched.

## Action 409 Follow-Up

Action 409 added
`lib/persistence/dev-diagnostics-local-storage.ts`.

Result:

- EOD acknowledgement persistence stayed unchanged.
- Dev/diagnostics helper extraction did not touch EOD acknowledgement keys,
  read/write behavior, UI state, EOD calculations, close/sell behavior, or
  execution behavior.

Next recommended action:

**Action 410 - Reassess Dev/Diagnostics localStorage Wrapper Extraction**

## Action 410 Follow-Up

Action 410 added
`docs/dev-diagnostics-local-storage-post-extraction-reassessment.md`.

Result:

- Confirmed EOD acknowledgement persistence remains unchanged.
- Confirmed the dev/diagnostics wrapper did not move EOD, Supabase, trade,
  close/sell, or execution behavior.

Next recommended action:

**Action 411 - Reassess Live Market Trial Runbook Persistence Wrapper**

## Action 411 Follow-Up

Action 411 added
`docs/live-market-trial-runbook-persistence-wrapper-reassessment.md`.

Result:

- Confirmed EOD acknowledgement persistence remains unchanged.
- Confirmed the live market trial runbook reassessment did not move EOD
  acknowledgement keys, read/write behavior, UI state, EOD calculations,
  close/sell behavior, Supabase behavior, or execution behavior.
- Identified live market trial runbook persistence as the next safe wrapper
  only if exact key/default/normalization/read/write behavior is preserved.

Next recommended action:

**Action 412 - Extract Live Market Trial Runbook Persistence Wrapper**
