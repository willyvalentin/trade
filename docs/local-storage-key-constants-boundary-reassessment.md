# localStorage Key Constants Boundary Reassessment

## 1. Purpose

Reassess whether localStorage key constants can be safely centralized after the
persistence boundary plan. This action is documentation-only: it does not move
localStorage access, change key names, add migrations, or alter persistence
behavior.

## 2. Current Key Inventory

`app/trade-app.tsx` is about 39,691 lines and still owns several inline
localStorage keys plus the read/write helpers that use them.

Inline keys in `app/trade-app.tsx`:

| Key | Location/use | Access | Category/risk | Shared? |
| --- | --- | --- | --- | --- |
| `trade-demo-recommendations-v1` | `demoStorageKeys.recommendations`; demo recommendations fallback | read/write/delete | trade state, medium | app-local |
| `trade-demo-active-positions-v1` | `demoStorageKeys.activePositions`; demo active positions fallback | read/write/delete | trade state, medium | app-local |
| `trade-demo-closed-positions-v1` | `demoStorageKeys.closedPositions`; demo closed positions fallback | read/write/delete | trade state, medium | app-local |
| `trade-demo-last-action-v1` | `demoStorageKeys.lastAction`; demo status copy | read/write/delete | UI/dev demo, low/medium | app-local |
| `trade-mock-broker-latest-fill` | latest mock broker fill copy/readback and demo clear | read/delete | execution-adjacent mock data, medium | app-local |
| `trade-dismissed-warnings` | warning dismissal set | read/write | UI preference, low | app-local |
| `trade-live-market-trial-runbook-v1` | live-market trial runbook local state | read/write | UI/dev workflow, low/medium | app-local |
| `trade-provider-plan-mode-v1` | provider plan mode hint | read/write | UI preference, low | app-local |
| `trade-dev-preview-recommendations-hidden-v1` | dev preview recommendation visibility | read/write | UI/dev preference, low | app-local |
| `eod_acknowledged_${positionId}_${date}` | `getEndOfDayAcknowledgementKey` | read/write/delete | EOD acknowledgement, high | dynamic |
| `trade-management-events` | repeated audit/event log read/write literal | read/write | audit/event log, high | app and `lib/execution-timeline.ts` |

Imported key constants already exist outside `app/trade-app.tsx`:

| Constant/key | Module | Access pattern | Category/risk |
| --- | --- | --- | --- |
| `paperSessionProtocolStorageKey` = `trade-paper-session-protocol-v1` | `lib/paper-session-protocol.ts` | read/write in app | UI/dev workflow, low/medium |
| `RISK_CONTROLS_STORAGE_KEY` = `trade-risk-controls-v1` | `lib/risk-controls.ts` | read/write | preference/risk controls, medium |
| `EXECUTION_MODE_STORAGE_KEY` = `ture_execution_mode` | `lib/execution.ts` | read | execution preference, medium/high |
| `AVANZA_VERIFICATION_NOTES_STORAGE_KEY` | `lib/avanza-field-verification-notes.ts` | read | diagnostics/manual verification, medium |
| `brokerCostModelStorageKey` = `trade_broker_cost_model_v1` | `lib/broker-costs.ts` | read/write in module | preference/calculation input, medium |

Recommendation-learning and persistence helper keys:

| Key | Module | Access | Category/risk |
| --- | --- | --- | --- |
| `trade-recommendation-snapshots-v1` | `lib/recommendation-snapshot.ts` | read/write | recommendation learning, high |
| `trade-recommendation-scan-runs-v1` | `lib/recommendation-scan-run.ts` | read/write | recommendation learning, high |
| `trade-recommendation-batches-v1` | `lib/recommendation-batch-memory.ts` | read/write | recommendation learning, high |
| `trade-recommendation-outcomes-v1` | `lib/recommendation-outcome-tracker.ts` | read/write | recommendation learning, high |
| `trade-recommendation-outcome-evaluation-runs-v1` | `lib/recommendation-outcome-evaluation-runner.ts` | read/write | recommendation learning/evaluation, medium/high |

Execution/audit/diagnostics keys:

| Key | Module | Access | Category/risk |
| --- | --- | --- | --- |
| `ture_execution_event_log_v1` | `lib/execution-event-log.ts` | read/write | execution audit, high |
| `ture_execution_records_v1` | `lib/execution-record-store.ts` | read/write | execution records, high |
| `ture_avanza_agent_runs_v1` | `lib/avanza-agent-run-store.ts` | read/write | execution/Avanza run metadata, high |
| `ture_safe_browser_action_diagnostics_v1` | `lib/safe-browser-action-diagnostics-store.ts` | read/write/delete | diagnostics, medium/high |
| `ture_dev_mock_broker_results_v1` | `lib/dev-mock-broker-result-store.ts` | read/write/delete | dev mock execution diagnostics, medium |
| `ture_avanza_agent_bridge_config_v1` | `lib/avanza-agent-bridge-config.ts` | read/write/delete | bridge config, medium/high |

## 3. Risk Classification

Safe constants-only candidates:

- `trade-dismissed-warnings`
- `trade-provider-plan-mode-v1`
- `trade-dev-preview-recommendations-hidden-v1`
- `trade-live-market-trial-runbook-v1`
- `trade-paper-session-protocol-v1`, if re-exported without changing the
  owning module contract
- demo key strings, if moved as constants only and read/write helpers stay
  unchanged

Medium-risk keys:

- `trade-mock-broker-latest-fill`
- `trade_broker_cost_model_v1`
- `trade-risk-controls-v1`
- `ture_execution_mode`
- Avanza/manual verification and bridge configuration keys
- dev/mock broker and browser-action diagnostics keys

High-risk trade/execution/audit keys:

- `trade-management-events`
- `eod_acknowledged_${positionId}_${date}`
- `ture_execution_event_log_v1`
- `ture_execution_records_v1`
- `ture_avanza_agent_runs_v1`
- recommendation snapshot, scan-run, batch, outcome, and evaluation-run keys

Dev-only diagnostics keys:

- `trade-dev-preview-recommendations-hidden-v1`
- `trade-live-market-trial-runbook-v1`
- `ture_dev_mock_broker_results_v1`
- `ture_safe_browser_action_diagnostics_v1`

Keys that should not be renamed or behavior-moved yet:

- every key listed above.
- especially dynamic EOD acknowledgement keys, `trade-management-events`,
  execution record/event stores, and recommendation-learning stores.

## 4. Proposed Constants Module

Centralizing constants is safe only as a constants-only step.

Proposed module:

`lib/persistence/local-storage-keys.ts`

Potential contents:

- exported constants only.
- exact same key strings.
- no read/write helpers.
- no parsing helpers.
- no migration logic.
- no default values.
- no Supabase or execution imports.

Recommended initial scope:

- move app-local static key strings first.
- keep dynamic EOD key generation in `app/trade-app.tsx` until an EOD
  acknowledgement persistence wrapper is reassessed.
- keep recommendation-learning and execution-store constants in their current
  modules initially, or re-export them only after confirming import direction
  does not create cycles.
- replace repeated `"trade-management-events"` with a constant only if the
  exact string is preserved and both `app/trade-app.tsx` and
  `lib/execution-timeline.ts` import the same constant without moving log
  behavior.

## 5. What Should Not Happen

- no key renames.
- no localStorage read/write helper extraction.
- no migration or backfill.
- no default value changes.
- no localStorage access movement.
- no Supabase movement.
- no trade add/close mutation movement.
- no execution/orchestrator persistence movement.
- no recommendation-learning persistence behavior movement.
- no EOD acknowledgement wrapper extraction in the constants action.

## 6. Recommended Next Action

Recommended next action:

**Action 402 - Extract localStorage Key Constants**

Scope for Action 402:

- create `lib/persistence/local-storage-keys.ts`.
- move exact static key strings only.
- start with app-local static keys and the repeated trade-management event log
  key if import direction remains simple.
- leave dynamic EOD key generation, persistence helpers, Supabase writes,
  trade mutations, execution stores, and recommendation-learning write behavior
  untouched.

## 7. Risk Assessment

Key typo risk:

- medium/high. A one-character typo would strand existing local data.

Data loss risk:

- low if constants are copied exactly and no read/write behavior moves.
- high if any key is renamed, migrated incorrectly, or cleared.

Stale key risk:

- medium. Several keys preserve demo, warning, EOD, diagnostics, and learning
  history across sessions.

Duplicate key risk:

- medium. Centralization can reduce duplicated literals, especially
  `trade-management-events`, but only if imports remain acyclic.

Test coverage limitations:

- e2e coverage can catch visible regressions, but it may not detect local data
  compatibility breaks for existing browser profiles.

Production/local data compatibility:

- exact key strings must remain compatible with existing localStorage data.
- no migration should be introduced in the constants-only action.

## 8. Verification

Verification for this documentation-only action:

- `git diff --check`

No runtime code changes are expected.

## Action 402 Result

Action 402 created `lib/persistence/local-storage-keys.ts`.

Centralized static keys:

- demo storage keys:
  - `trade-demo-recommendations-v1`
  - `trade-demo-active-positions-v1`
  - `trade-demo-closed-positions-v1`
  - `trade-demo-last-action-v1`
- `trade-mock-broker-latest-fill`
- `trade-dismissed-warnings`
- `trade-live-market-trial-runbook-v1`
- `trade-provider-plan-mode-v1`
- `trade-dev-preview-recommendations-hidden-v1`
- `trade-management-events`

Updated runtime usage:

- `app/trade-app.tsx` now imports the centralized constants while retaining
  the existing local read/write helpers, helper names, and storage behavior.
- `lib/execution-timeline.ts` now reads `trade-management-events` through the
  same exact exported key constant.

Stayed inline or in existing modules:

- dynamic EOD acknowledgement key generation stays in `app/trade-app.tsx`.
- recommendation-learning storage keys stay in their current helper modules.
- execution record/event/Avanza run store keys stay in their current modules.
- risk controls, execution mode, paper session protocol, broker costs, and
  verification-note keys stay in their existing owning modules.

Behavior preservation:

- no key strings changed.
- no localStorage reads, writes, deletes, helpers, migrations, defaults,
  Supabase behavior, trade mutations, execution/orchestrator behavior, or
  dynamic key builders moved.

Next recommended action:

**Action 403 - Reassess localStorage Key Constants Extraction**

## Action 403 Result

Action 403 added
`docs/local-storage-key-constants-post-extraction-reassessment.md`.

Result:

- Reassessed the constants-only extraction after Action 402.
- Confirmed exact key strings are preserved.
- Confirmed `lib/persistence/local-storage-keys.ts` contains constants only and
  no localStorage reads, writes, deletes, helpers, migrations, defaults, or
  dynamic builders.
- Confirmed EOD acknowledgement, recommendation-learning persistence,
  Supabase behavior, trade mutations, and execution/orchestrator persistence
  remain untouched.
- Documented the Action 402 e2e sandbox limitation as an environment issue.

Next recommended action:

**Action 404 - Reassess EOD Acknowledgement Persistence Wrapper**

## Action 404 Result

Action 404 added
`docs/eod-acknowledgement-persistence-wrapper-reassessment.md`.

Result:

- Reassessed the first read/write wrapper candidate after constants extraction.
- Confirmed EOD acknowledgement wrapper extraction is safe if it moves only the
  exact dynamic key builder and read/write helpers.
- Confirmed EOD UX state, EOD safety calculation, close/sell behavior,
  Supabase behavior, trade mutations, and execution behavior must stay put.

Next recommended action:

**Action 405 - Extract EOD Acknowledgement Persistence Wrapper**
