# Semi-Auto Agent Dev Flow Review Panel

## Purpose

Action 987 adds a safe, read-only/local-only review panel for the current
semi-auto dev flow.

Result status: `semi_auto_agent_dev_flow_review_panel_added`

Recommended next action: Action 988 - Add Semi-Auto Agent Local Dev Flow
Persistence.

Follow-up status: Action 988 added
`docs/semi-auto-agent-local-dev-flow-persistence.md`,
`lib/semi-auto-agent-local-dev-flow-store.ts`, and
`tests/e2e/semi-auto-agent-local-dev-flow-persistence.spec.ts` with result
status `semi_auto_agent_local_dev_flow_persistence_added`.

Recommended next action for the semi-auto Avanza planning track: Action 989 -
Add Semi-Auto Agent Local Dev Flow History Viewer.

Follow-up status: Action 989 added the local-only dev flow history viewer with
result status `semi_auto_agent_local_dev_flow_history_viewer_added`.

Recommended next action for the semi-auto Avanza planning track: Action 990 -
Semi-Auto Agent Dev Flow End-to-End QA Pass.

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

This is not real Avanza or broker automation. It is a dev/local review surface
for inspecting the existing semi-auto payload, mock prepare, manual waiting,
local result capture, and terminal local outcome chain.

## UI And Helper Source

- Review helper: `lib/semi-auto-agent-dev-flow-review.ts`
- State machine: `lib/semi-auto-agent-dev-flow-state-machine.ts`
- Review panel:
  `components/execution/SemiAutoAgentDevFlowReviewPanel.tsx`
- Modal composition:
  `components/execution/ExecutionHandoffModalComposition.tsx`
- Handoff modal:
  `components/execution/execution-handoff-preview-modal.tsx`
- Result capture stub:
  `components/execution/SemiAutoAgentResultCaptureStub.tsx`
- Focused tests:
  `tests/e2e/semi-auto-agent-dev-flow-review-panel.spec.ts`

## Panel Behavior

The panel is rendered inside the existing execution handoff modal near the
semi-auto preview and local result capture stub.

For a valid semi-auto handoff preview, it displays:

- current dev flow state;
- payload id;
- ticker;
- action;
- quantity;
- mock adapter status;
- whether the state is waiting for manual confirmation;
- selected local result, when one has been selected in the local stub;
- terminal local outcome, when the local stub result is terminal;
- warnings;
- blocked/stale/invalid reasons.

If there is no active handoff preview, the panel shows a quiet empty state. If
the preview is stale, invalid, blocked, automatic-mode, or otherwise unsafe,
the panel shows a blocked state and reason rather than a waiting state.

## Safety Checklist Display

The panel displays a safety invariant checklist:

- semi-auto mode only;
- manual final confirmation required;
- automatic submit allowed false;
- automatic submit attempted false;
- no Avanza order placed;
- no broker submit by Ture;
- local-only review.

The copy explicitly says:

- dev/local review only;
- no Avanza order was placed;
- no broker submit was attempted;
- final confirmation remains manual.

## Local Result Reflection

The existing result capture stub now accepts optional controlled `result` and
`onResultChange` props. The handoff modal owns that selected local result only
as React/modal state and passes it to the review panel.

This does not add persistence. It does not write to Supabase, call routes, call
providers, invoke the audit writer, or mutate trades/stats/PnL.

## Safety Invariants

- No Supabase write.
- No client audit writer invocation.
- No trade/stats/PnL mutation.
- No browser automation.
- No Avanza DOM or navigation behavior.
- No broker submit/click behavior.
- No automatic order submission.
- No provider, route, scan, or live-market invocation.
- No credential/env/service-role access.
- No payload/state/result persistence.
- The review helper is pure and non-executing.
- Action 988 adds manual browser-local-only snapshot persistence from the
  review panel. It is not Supabase persistence and not an audit record.

## No-Automation Confirmation

Action 987 did not add:

- real browser automation;
- Playwright/Puppeteer automation against Avanza;
- Avanza integration;
- broker behavior;
- broker submit/click behavior;
- automatic order submission;
- automatic mode enablement;
- provider, route, scan, or live-market invocation;
- Supabase query/write behavior;
- service-role adapter calls;
- audit writer UI/browser/client invocation;
- trade/stats/PnL mutation;
- migration, type generation, generated type edits, or `.env.local` changes.

## Validation Results

Validation for Action 987 is recorded in
`docs/execution-agent-checkpoint.md` and
`docs/execution-agent-qa-notes.md`.

The focused review panel tests cover:

- waiting-for-manual-confirmation review state;
- dev/local/review-only panel copy;
- payload id/ticker/action/quantity display data;
- manual final confirmation required;
- automatic submit allowed false;
- automatic submit attempted false;
- no Avanza order placed;
- no broker submit by Ture;
- selected local result and terminal local outcome;
- blocked/stale preview reasons;
- quiet empty state;
- source scans for no fetch, Supabase, service-role, env, route, provider,
  scan, browser automation, broker submit, or persistence behavior.

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
