# Recommendation Discard Persistence Wrapper Reassessment

## 1. Purpose

Reassess recommendation discard persistence before moving any read/write
wrappers. This action checks whether the discard path has a safe localStorage
boundary similar to EOD acknowledgement, or whether it remains coupled to
recommendation status updates, Supabase persistence, metadata, and app-owned
state.

## 2. Current Discard Persistence Inventory

Key names and locations:

- No dedicated recommendation-discard localStorage key was found for the
  confirm-discard flow.
- Discard metadata is embedded in the `recommendations.reason_to_avoid` value
  using the inline marker `\n\n[discard_meta:`.
- `app/trade-app.tsx` owns `discardMetadataPrefix`,
  `parseDiscardMetadata(...)`, and `buildDiscardMetadata(...)`.
- `lib/discard-review.ts` has a parallel `discardMetadataPrefix` and writes
  reviewed discard metadata back to Supabase.
- Recommendation-learning localStorage fallback keys exist in adjacent modules,
  but those are scan/snapshot/outcome/batch learning stores, not the
  card-confirm discard persistence path.

Data shape:

- User discard writes recommendation status `ignored`.
- User discard sets `archived: true`.
- User discard appends confidence metadata and discard metadata to
  `reason_to_avoid`.
- Initial discard metadata currently includes:
  - `discarded_at`
  - `discard_review_status: "pending"`
  - `discard_reviewed_at: null`
  - `discard_outcome: null`
  - `discard_theoretical_r: null`
  - `discard_decision_quality: null`
  - `archived_reason: "user_discarded"`
  - `setup_type`

Read behavior:

- Recommendation rows are read from Supabase or demo state through the existing
  recommendation loading flow.
- `mapRecommendationRow(...)` derives discard fields from explicit row columns
  when present and falls back to `parseDiscardMetadata(reason_to_avoid)`.
- History/statistics derive discarded setup analytics from normalized
  `Recommendation` objects.

Write behavior:

- `RecommendationCardContainer` owns only the discard confirmation UI state.
- Confirming discard calls parent-owned `onIgnore(recommendation)`.
- `app/trade-app.tsx` wires that to
  `updateRecommendationStatus(item, "ignored")`.
- `updateRecommendationStatus(...)` builds the Supabase update payload, writes
  `recommendations`, and then updates in-memory `recommendations` state.

Delete/clear behavior:

- No recommendation discard localStorage delete/clear behavior was identified.
- Discard review can replace existing embedded discard metadata when it saves
  review results through `lib/discard-review.ts`.

Default and fallback behavior:

- Missing discard metadata normalizes to null review fields.
- A Supabase error sets the app message, clears saving state, and returns.
- The discard modal callback awaits the parent handler and then closes according
  to the existing component flow.

Error handling and guards:

- The confirm-discard flow does not have localStorage availability guards
  because it is not a localStorage read/write helper.
- Supabase write errors are handled in `updateRecommendationStatus(...)`.

Call sites:

- `components/recommendations/RecommendationCardContainer.tsx`
  - owns `isDiscardConfirmOpen` and `isConfirmingDiscard`.
  - renders `DiscardRecommendationModal`.
  - calls `onIgnore(recommendation)`.
- `app/trade-app.tsx`
  - passes `onIgnore={(item) => updateRecommendationStatus(item, "ignored")}`.
  - owns `updateRecommendationStatus(...)`.
  - owns discard metadata parsing/building for app display and analytics.
- `lib/discard-review.ts`
  - reads/writes discard review metadata for reviewed discarded setups.

Coupling to recommendation filtering and UI:

- Discarding changes status and archived state.
- Discarded recommendations leave the active recommendation card flow and feed
  History/Statistics discarded setup analytics.
- Discard review fields affect recommendation learning, setup feedback, and
  calibration surfaces.

## 3. Coupling Analysis

Recommendation filtering/list visibility:

- The discard path changes normalized recommendation state, archived state, and
  the set of recommendations that remain visible in the Recommendations tab.
- History and Statistics use the discarded status family
  `ignored`/`discarded`/`rejected` to build discarded setup analytics.

Discard modal confirm flow:

- Modal open/close and confirm loading state are already local to
  `RecommendationCardContainer`.
- The actual persistence and local state mutation remain parent-owned.

Learning/feedback persistence:

- Discard metadata is used by discard review, recommendation calibration, setup
  execution feedback, and statistics.
- Adjacent recommendation-learning localStorage modules are separate fallback
  stores and should not be folded into a discard wrapper.

Local/demo dependencies:

- Demo recommendation helpers exist, but the discard confirm path is not a
  simple demo localStorage wrapper.
- Any future discard persistence extraction must account for both Supabase and
  demo/local recommendation state, not just a key/value store.

Supabase/localStorage boundaries:

- The primary discard write is a Supabase `recommendations.update(...)`.
- There is no current static localStorage key or localStorage data shape for
  discarded recommendations to wrap.

ADD TRADE/execution handoff independence:

- ADD TRADE and execution handoff behavior are separate from discard confirm,
  but they share recommendation identity and card wiring.
- A discard wrapper must not touch `openTradeModal`, selected TradeModal state,
  or execution handoff creation.

E2E-visible UX behavior:

- The discard button, confirmation modal, saving disabled state, and card/list
  update are all user-visible.
- Metadata changes can later alter History/Statistics copy and analytics.

Migration/data compatibility risk:

- The inline metadata marker and JSON fields are compatibility-sensitive.
- Changing the marker, status, archived flag, or metadata defaults could make
  older discarded recommendations parse differently.

## 4. Proposed Wrapper Boundary

Do not extract `lib/persistence/recommendation-discard-persistence.ts` yet.

Reason:

- There is no dedicated recommendation discard localStorage read/write behavior
  to move.
- The discard path is a Supabase status/metadata update plus app state mutation.
- The metadata builder is coupled to `Recommendation`, confidence metadata, and
  discard review compatibility.
- Extracting now would create either a misleading localStorage wrapper or a
  broader Supabase command boundary before the inputs and state semantics are
  documented enough.

Possible later boundaries after another reassessment:

- a pure discard metadata display/parser helper boundary.
- a pure discard update payload builder.
- a recommendation status persistence command boundary.
- a local state reducer/mapper for applying discarded recommendation updates.

Those are not safe to move in this action.

## 5. What Should Remain Parent/Component-Owned

- discard confirmation UI state in `RecommendationCardContainer`.
- discard handler orchestration in `app/trade-app.tsx`.
- `updateRecommendationStatus(...)`.
- Supabase `recommendations` update behavior.
- local in-memory recommendation state mutation.
- recommendation data construction/filtering.
- discard metadata compatibility until a focused metadata-boundary plan exists.
- ADD TRADE validation and `openTradeModal`.
- selected TradeModal state.
- execution handoff creation.
- recommendation-learning diagnostics and fallback stores.

## 6. What Should Not Happen

- no key name changes.
- no data shape changes.
- no migration.
- no Supabase behavior movement.
- no localStorage wrapper extraction for a flow that is not localStorage-backed.
- no recommendation filtering behavior changes.
- no discard metadata marker changes.
- no discard review metadata changes.
- no ADD TRADE behavior changes.
- no execution behavior changes.

## 7. Risk Assessment

Stale discarded recommendation risk:

- moving the write path too early could desynchronize Supabase results,
  in-memory state, and History/Statistics analytics.

Wrong recommendation identity risk:

- discard writes are scoped by recommendation id. A wrapper with insufficient
  context could update the wrong row or update local state inconsistently.

Data shape compatibility risk:

- `reason_to_avoid` embedded metadata remains compatibility-sensitive.
- `lib/discard-review.ts` expects the same marker and related fields.

localStorage unavailable risk:

- not directly applicable to the confirm-discard flow, because it is not
  currently backed by localStorage.
- introducing a localStorage wrapper here would add a misleading failure mode.

Learning feedback coupling risk:

- discarded setups feed calibration, setup execution feedback, review summaries,
  and statistics.
- changing defaults such as `discard_review_status` could affect those surfaces.

E2E coverage limitation:

- discard confirmation, list visibility, and downstream History/Statistics
  effects are e2e-visible.
- recent e2e runs have been sandbox-blocked before app test logic, so future
  runtime changes need browser-capable verification.

## 8. Recommended Next Action

Recommended next action:

**Action 408 - Reassess Dev/Diagnostics localStorage Wrapper**

Reason:

- recommendation discard persistence is not safe as the next wrapper because it
  is not a simple localStorage boundary.
- dev/diagnostics localStorage wrappers are more likely to have isolated
  read/write helper shapes and lower user-data risk.
- recommendation discard work should resume only after a dedicated Supabase
  recommendation status/update boundary plan.

## 9. Verification

Verification for this documentation-only action:

- `git diff --check`

No runtime code changes are expected.

## Action 408 Follow-Up

Action 408 created
`docs/dev-diagnostics-local-storage-wrapper-reassessment.md`.

Result:

- Dev/diagnostics localStorage was inventoried after recommendation discard
  persistence was deferred.
- Several diagnostics stores already have dedicated modules and should stay
  module-owned.
- The safest next wrapper target is a small app-local dev/preferences wrapper
  for exact localStorage helper behavior.

Next recommended action:

**Action 409 - Extract Dev/Diagnostics localStorage Wrapper**
