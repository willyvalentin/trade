# Live Position Handoff Controls Extraction

## Purpose

Action 934 extracted the narrow live position handoff CTA/control surface into a
dedicated client-safe presentational component. This extraction only moves the
`View handoff` control UI; it does not extract the full live position panel and
does not change lifecycle, modal, prepare/capture, close/reset, or mutation
behavior.

## Extracted Component

- New component:
  `components/execution/live-position-handoff-controls.tsx`
- Export:
  `LivePositionHandoffControls`
- Props:
  - `onViewHandoff`: parent-owned callback invoked by the button.
  - `disabled`: optional button disabled state, defaulting to `false`.
  - `label`: optional button label, defaulting to `View handoff`.

The component preserves the existing button class names, `type="button"`,
`event.stopPropagation()`, and `View handoff` label. It does not own modal
state, orchestrator state, lifecycle state, prepare/capture state, or
position/trade/PnL mutation callbacks.

`app/trade-app.tsx` now passes `openExecutionPreviewModal` to
`LivePositionHandoffControls` from inside the existing
`LivePositionExecutionStatusSurface` `footerAction` slot. Parent ownership of
modal open/close state and callback logic remains unchanged.

`components/live-day-trades/LiveExecutionStatusSurface.tsx` remains a
compatibility wrapper for sandbox fixture usage and now delegates its optional
handoff button to `LivePositionHandoffControls`.

## Behavior Preservation

- Rendered CTA/control output remains unchanged.
- Visibility remains parent-owned through the existing
  `liveExecutionStatus?.visible` status-surface rendering condition.
- The `View handoff` button still stops event propagation before invoking the
  provided callback.
- Modal open/close behavior remains in `ActivePositionCard`.
- Prepare/capture behavior remains inside the existing handoff modal flow.
- Close/reset and position/trade/PnL mutation-adjacent logic remain
  parent-owned.
- Manual and semi-automatic boundaries remain unchanged.
- No broker, Avanza, or automatic order submission behavior was added.

## Scope Preserved

- The full live position panel was not extracted.
- `LivePositionExecutionStatusSurface` from Action 933 remains the read-only
  status surface.
- Existing extracted sandbox, handoff modal, settings, audit log, and local
  records components remain intact.
- Modal helper wiring, local persistence helper wiring, settings persistence
  helper wiring, and lifecycle UI adapter wiring were not changed.
- Audit writer runtime persistence and rollout flags were not changed.

## Boundaries Verified

- No `server-only` import was added to the new client-safe control component.
- No audit writer server import was added.
- No Supabase, service-role, or env helper usage was added.
- No route or `fetch` call was added.
- No localStorage or sessionStorage usage was added.
- No broker/Avanza behavior or automatic order submission behavior was added.
- Audit writer rollout remains untouched.

## Tests

- Updated `tests/e2e/live-position-execution-ui-baseline.spec.ts`.
- Updated `tests/e2e/execution-ui-component-extraction-baseline.spec.ts`.
- Updated `tests/e2e/execution-modal-open-path-baseline.spec.ts`.

Focused validation passed:

```text
npx playwright test tests/e2e/live-position-execution-ui-baseline.spec.ts tests/e2e/execution-ui-component-extraction-baseline.spec.ts tests/e2e/execution-modal-open-path-baseline.spec.ts
26 passed
```

## Not Performed

- No broad live position panel extraction.
- No runtime behavior change beyond JSX relocation.
- No handler, effect, or state mutation behavior change.
- No modal helper wiring change.
- No local persistence helper wiring change.
- No settings persistence helper wiring change.
- No lifecycle UI adapter broadening.
- No audit writer path change.
- No database query, remote SQL, live proof, or live insert.
- No migration, type generation, or generated type edit.
- No `.env.local` change.

## Result Status

`live_position_handoff_controls_extracted`

## Recommended Next Action

Action 935 - Create Live Position Execution UI Extraction Summary.

## Action 935 Follow-Up

- Created `docs/live-position-execution-ui-extraction-summary.md`.
- Summarized Actions 931-934, the current live-position component map,
  parent-owned state/callback boundaries, safety boundaries, remaining gaps, and
  recommended next refactor direction.
- Status: `live_position_execution_ui_extraction_summary_created`.
- Recommended next action: Action 936 - Create Dev Mock Broker Controls
  Coupling Inventory.
