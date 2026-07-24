# Dev Mock Broker Controls Baseline Tests

## Purpose

Action 937 added baseline tests before extracting the dev/mock broker controls.
Action 938 then moved the tested panel/row UI behind an extracted component
boundary without changing runtime behavior.

## Selected Seam

The selected seam was the inline `DevMockBrokerResultsPanel` in
`app/settings/page.tsx`. It is now extracted to
`components/execution/execution-dev-mock-broker-results-panel.tsx`.

This is the smallest safe next seam because it is isolated to the Settings dev
tools surface, already receives parent-owned refresh/clear/capture-complete
callbacks, and reads helper-backed dev mock broker result data. Full
live-position panel extraction remains deferred.

## Current Baseline Scope

The new baseline locks:

- panel title, buttons, count labels, storage labels, parse-state copy, and
  empty-state copy
- local-only and dev-only boundary copy
- result row summary fields and detail sections
- server capture route stub copy and local capture copy
- local-only/server-audit distinction
- refresh, clear, and capture-complete callback ownership by the Settings page
- dev mock broker result store helper behavior
- existing extracted component boundaries remaining intact
- absence of broker/Avanza automation and automatic order submission behavior
- absence of audit writer route/client invocation, service-role usage, and
  Supabase live audit persistence from the dev/mock controls seam

## Test Approach

Created:

- `tests/e2e/dev-mock-broker-controls-baseline.spec.ts`

The test approach now uses source-characterization assertions for the extracted
UI plus parent wiring assertions in `app/settings/page.tsx`. It also imports the
existing dev mock broker result store helpers with an in-memory
`window.localStorage` fixture to lock helper behavior without changing
production code.

No fixture-local UI replica was needed. The only fixture added is an in-memory
storage object inside the test file.

## Coverage Map

| Area | Coverage |
| --- | --- |
| Panel surface | Title, refresh/clear buttons, totals, latest result, storage, parse error, discarded count, message, empty state |
| Result row | Status badges, detail fields, server capture stub, local capture test, raw details, BrokerExecutionResult preview |
| Store/helper | Append, read, filter by request/intent/position/recommendation, malformed JSON, clear/remove behavior |
| Parent callbacks | `onRefresh`, `onClear`, and `onCaptureComplete` remain passed from `app/settings/page.tsx` |
| Safety boundary | No audit writer route literal, service-role env, server-only import, Supabase live audit table, or automatic submit authority in the seam |
| Existing extractions | Settings panel, audit log viewer, local records viewer, sandbox fixture card, handoff modal, live position status surface, and live position handoff controls remain intact |

## Boundaries Verified

- No audit writer server import was added.
- No service-role/env/Supabase live audit persistence was added.
- No route/fetch access was added beyond existing documented app behavior.
- No broker/Avanza behavior was added.
- No automatic order submission enablement was added.
- No trade/stats/PnL mutation behavior was changed.
- No runtime behavior was changed.
- No `.env.local`, migration, typegen, or generated type edit was performed.

## Gaps And Limitations

- Row-local click flows remain characterized by source and helper boundaries;
  richer component-level event assertions can be added separately if needed.
- The server capture route stub remains existing app behavior and is not invoked
  by these tests.
- The extracted row keeps the existing row-local manual local diagnostic capture
  and server capture stub handlers; the Settings page still owns store state and
  refresh/clear/capture-complete callbacks.

## Result Status

`dev_mock_broker_controls_baseline_tests_added`

## Recommended Next Action

Action 938 - Extract Dev Mock Broker Results Panel Component.
## Action 938 — Dev Mock Broker Results Panel Extraction

Status: `dev_mock_broker_results_panel_extracted`

- Extracted the Settings dev mock broker results panel and result row UI into
  `components/execution/execution-dev-mock-broker-results-panel.tsx`.
- Kept `app/settings/page.tsx` as the owner of dev mock broker result store
  state, visible result selection, latest timestamp, messages, refresh/clear
  callbacks, and capture-complete refresh callback.
- Preserved existing panel labels, row fields, local-only diagnostics copy,
  server capture route stub copy, and broker-result preview copy.
- Did not add audit writer route invocation, service-role code, Supabase table
  access, broker/Avanza behavior, automatic mode, migrations, type generation,
  generated type edits, or `.env.local` changes.
- Added extraction proof in
  `docs/dev-mock-broker-results-panel-extraction.md`.
- Recommended next action: Action 939 — Create Dev Mock Broker Controls
  Extraction Summary.
## Action 939 — Dev Mock Broker Controls Extraction Summary

Status: `dev_mock_broker_controls_extraction_summary_created`

- Created `docs/dev-mock-broker-controls-extraction-summary.md` as a
  documentation-only summary of Actions 936-938.
- Summarized the dev/mock broker controls coupling inventory, baseline tests,
  extracted panel/row component map, parent ownership, test coverage, safety
  boundaries, remaining gaps, and next refactor direction.
- Confirmed no runtime code, JSX, handlers, effects, state mutation, helper
  wiring, audit writer runtime path, rollout flags, broker/Avanza behavior,
  automatic mode behavior, migrations, type generation, generated types,
  live proof/query/insert, service-role adapter call, or `.env.local` changes
  were performed for Action 939.
- Recommended next action: Action 940 — Create Execution State/Effects
  Coupling Inventory.

