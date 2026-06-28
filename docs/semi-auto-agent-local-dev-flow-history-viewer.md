# Semi-Auto Agent Local Dev Flow History Viewer

## Purpose

Action 989 adds a safe, local-only history viewer for semi-auto agent dev flow
events saved by Action 988.

Result status: `semi_auto_agent_local_dev_flow_history_viewer_added`

Recommended next action: Action 990 - Semi-Auto Agent Dev Flow End-to-End QA
Pass.

Follow-up status: Action 990 created
`docs/semi-auto-agent-dev-flow-end-to-end-qa.md` with result status
`semi_auto_agent_dev_flow_e2e_qa_passed_with_warnings`.

Recommended next action for the semi-auto Avanza planning track: Action 991 -
Prepare Semi-Auto Agent Real Browser Automation Feasibility Review.

Follow-up status: Action 991 created
`docs/semi-auto-agent-real-browser-automation-feasibility-review.md` with
result status
`semi_auto_agent_real_browser_automation_feasibility_review_created`.

Recommended next action for the semi-auto Avanza planning track: Action 992 -
Add Browser Automation Safety Boundary Spec.

This viewer is not Supabase persistence, not audit writer persistence, not real
Avanza/broker capture, and not a broker execution surface. It reads and clears
only browser-local history from the Action 988 localStorage-backed store.

## Viewer Source

- Viewer component:
  `components/execution/SemiAutoAgentLocalDevFlowHistoryViewer.tsx`
- Settings wiring: `app/settings/page.tsx`
- Local persistence hook:
  `hooks/execution/useExecutionLocalPersistenceViewers.ts`
- Store helper: `lib/semi-auto-agent-local-dev-flow-store.ts`
- Focused tests:
  `tests/e2e/semi-auto-agent-local-dev-flow-history-viewer.spec.ts`

Local storage key:

- `ture_semi_auto_agent_local_dev_flow_v1`

Displayed event limit:

- latest `25` events from the bounded local history.

## Viewer Behavior

- Shows an empty state when no semi-auto local dev flow history exists.
- Shows saved local events latest-first.
- Shows total saved local events, latest local event timestamp, and storage
  availability.
- Refresh re-reads only the localStorage-backed store through the helper.
- Clear removes only the semi-auto local dev flow history key through the
  helper.
- Malformed or unavailable storage behavior comes from the Action 988 store
  helper and is displayed without throwing.

## Displayed Fields

- payload id
- ticker
- action
- quantity
- dev flow state
- selected local result
- terminal local outcome
- source context
- warnings
- blocked reasons
- local/dev-only safety flags
- manual confirmation required
- automatic submit allowed/attempted false
- no Avanza order
- no broker submit
- not Supabase
- not audit
- trade/PnL mutation false

## Safety Copy

The viewer states:

- `Local dev history only`
- `Not sent to Supabase`
- `not an audit record`
- `no Avanza order`
- `no broker action`

## Safety Invariants

- No Supabase write.
- No client audit writer invocation.
- No trade/stats/PnL mutation.
- No browser automation.
- No Avanza DOM or navigation behavior.
- No broker submit/click behavior.
- No automatic order submission.
- No provider, route, scan, or live-market invocation.
- Clear affects localStorage history only.
- No migration, type generation, generated type edits, or `.env.local`
  changes.

## Validation Results

Validation for Action 989 is recorded in
`docs/execution-agent-checkpoint.md` and
`docs/execution-agent-qa-notes.md`.

Focused history viewer tests cover:

- local/dev-only label;
- empty state;
- saved event rendering;
- payload/ticker/action/quantity rendering;
- selected local result and terminal local outcome rendering;
- safety flags and safety copy;
- refresh and clear local history wiring;
- malformed and unavailable storage via the store helper;
- static scans for no Supabase write, audit writer, service-role, route,
  provider, scan, browser automation, broker submit, or automatic submit
  enablement.

## Not Performed

- No real browser automation.
- No Avanza integration.
- No broker behavior.
- No automatic submit.
- No provider call.
- No route invocation.
- No scan invocation.
- No live market scan.
- No database write.
- No Supabase manual call.
- No service-role adapter call.
- No migration.
- No type generation.
- No generated type edit.
- No `.env.local` change.
- No service-role value printed.
- No audit writer UI/browser/client invocation.
- No real trade.
- No trade/stats/PnL mutation.
