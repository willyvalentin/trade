# Legacy Modal Isolation Checkpoint

Date: 2026-07-07

## Purpose

Inventory legacy execution, handoff, broker, Avanza, readiness, and selectedRecommendation modal/preview surfaces so they are clearly classified as read-only, dev-diagnostic, model-only, mock-only, feature-flagged, or future-hardening surfaces.

This checkpoint is isolation and hardening documentation only. It does not build new execution UI, change Trade UI behavior, activate API routes, run smoke scripts, import smoke scripts, start browser automation, access credentials, handle cookies/session data, automate BankID, submit orders, click final KOP/SALJ, write Supabase execution records, or claim production readiness.

## Scope

Reviewed:

- `app/trade-app.tsx`
- `app/dev/avanza-visual-qa/page.tsx`
- `app/settings/page.tsx`
- `app/mock-broker/**`
- `app/sandbox-broker/page.tsx`
- `components/execution/**`
- `components/recommendations/**`
- `components/live-day-trades/**`
- `components/history/**`
- relevant `lib/**` model/fixture/adapters
- relevant tests and docs/checkpoints

Not changed:

- `app/trade-app.tsx`
- `.env.local`
- component runtime behavior
- API route behavior
- smoke scripts
- browser/Avanza/bridge behavior
- Supabase execution persistence

## Modal And Surface Inventory

| ID | File/path | Surface name | Visible in current product UI? | Feature-flag gated? | Read-only/dev-only/model-only? | Fetch/API/polling trigger? | Browser automation? | Supabase execution write? | Submit/final KOP/SALJ? | Risk | Recommended action |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| LMI-001 | `components/execution/execution-handoff-preview-modal.tsx` | `ExecutionHandoffPreviewModal` | Dev-tools gated legacy modal; imported by Trade UI but guarded by `isExecutionDevToolsEnabled()` | Dev-tools boundary | Dev diagnostic with local model/capture helpers | Can model bridge/audit flows but not default product path | No default automation | Browser-local diagnostic writes only unless separately gated legacy routes are enabled | No final click/submit authority | Medium | Keep isolated; future task can split into dev-only module or remove from product bundle. |
| LMI-002 | `components/execution/ExecutionHandoffModalShell.tsx` | Handoff modal shell | Only as composition shell for legacy modal | Inherits caller gate | Presentational shell | No | No | No | No | Low | Safe as-is; keep presentational. |
| LMI-003 | `components/execution/ExecutionHandoffModalComposition.tsx` | Modal composition | Only inside legacy modal | Inherits caller gate | Presentational/model display | No direct trigger | No | No | No | Low | Safe as-is; keep behind legacy modal boundary. |
| LMI-004 | `components/execution/FutureAgentRequestPreview.tsx` | Future agent request preview | Legacy/dev preview surface | Dev/diagnostic usage | Read-only preview after Task 340 wording normalization | No | No | No | No | Low | Safe with current wording; keep human-final/manual review language. |
| LMI-005 | `components/execution/SemiAutoAgentHandoffPreview.tsx` | Semi-auto handoff preview | Legacy/dev preview surface | Dev/diagnostic usage | Read-only/model-only | No | No | No | No | Low | Safe as-is; keep out of default recommendation-card complexity. |
| LMI-006 | `components/execution/live-position-handoff-controls.tsx` | Live-position handoff viewer control | Visible where live-position details expose inspection controls | Not the Avanza preview flags | Read-only inspection | No direct Avanza/API execution trigger | No | No | No | Low/Medium | Future copy cleanup may rename "handoff" to "plan" if product clarity requires it. |
| LMI-007 | `components/live-day-trades/LiveExecutionStatusSurface.tsx` | Live execution status surface | Product live-position status/readback surface | Existing product state | Read-only status | No active Avanza execution trigger | No | No | No | Low | Safe as read-only status; avoid adding controls. |
| LMI-008 | `components/live-day-trades/LiveTradeDetailsModal.tsx` | Live trade details modal | Product details modal | Existing product state | Read-only details/audit display | No Avanza execution trigger | No | No | No | Low | Safe as-is. |
| LMI-009 | `components/history/ClosedTradeDetailsModal.tsx` | Closed trade details modal | Product history details | Existing product state | Read-only historical display | No | No | No | No | Low | Safe as-is. |
| LMI-010 | `components/execution/AvanzaTradeCardExecutionReadinessBadge.tsx` | Trade-card readiness badge | Not visible by default | `ENABLE_PASSIVE_TRADE_CARD_EXECUTION_READINESS_BADGE = false` | Passive/read-only | No | No | No | No | Low | Keep flag false unless separately planned. |
| LMI-011 | `components/execution/AvanzaTradeUiReadOnlySelectedRecommendationPreview.tsx` | Trade UI read-only selectedRecommendation preview | Not visible by default | `ENABLE_READ_ONLY_SELECTED_RECOMMENDATION_PREVIEW = false` | Passive/read-only | No | No | No | No | Low | Keep flag false unless separately planned. |
| LMI-012 | `components/execution/AvanzaPrepareHandoffPreviewShell.tsx` | Prepare handoff preview shell | Hidden behind false selectedRecommendation preview branch | `ENABLE_READ_ONLY_SELECTED_RECOMMENDATION_PREVIEW = false` | Hard-disabled shell/read-only metadata | No | No | No | No | Low | Safe while flag remains false. |
| LMI-013 | `components/execution/AvanzaPassiveDisabledPrepareShell.tsx` | Passive disabled prepare shell | Hidden/default-off | False selectedRecommendation preview branch/dev harnesses | Disabled display only | No | No | No | No | Low | Safe; no active control. |
| LMI-014 | `components/execution/AvanzaPassiveDisabledActionShell.tsx` | Passive disabled action shell | Hidden/default-off | False selectedRecommendation preview branch/dev harnesses | Disabled display only | No | No | No | No | Low | Safe; no active action. |
| LMI-015 | `components/execution/AvanzaTradeUiHandoffPreview.tsx` | Trade UI handoff preview | Hidden/default-off | False selectedRecommendation preview branch/dev harnesses | Read-only package preview | No | No | No | No | Low | Safe while not default-rendered. |
| LMI-016 | `components/execution/AvanzaHandoffPackagePreviewCard.tsx` | Handoff package preview card | Dev QA/hidden branch usage | Dev/harness/default-off usage | Read-only package display | No | No | No | No | Low | Safe as model-only preview. |
| LMI-017 | `components/execution/AvanzaDevVisibleSelectedRecommendationPreviewSurface*.tsx` | Dev-only selectedRecommendation preview gallery/surface | Dev QA route only | Dev route/model guard | Fixture-only/dev-only | No | No | No | No | Low | Safe as fixture-only QA surface; keep unlinked from main navigation. |
| LMI-018 | `app/dev/avanza-visual-qa/page.tsx` | Dev-only Avanza visual QA route | Route exists but is not linked from main navigation | Dev-only/fixture-model route | Fixture/model-only harness gallery | No execution trigger; route may render model fixtures | No live browser control | No | No | Medium | Keep unlinked and fixture/model-only; do not treat as production UI. |
| LMI-019 | `components/execution/AvanzaBridgeStatusPanel.tsx` and `LocalhostBridgeControls.tsx` | Bridge status/controls surfaces | Dev/diagnostic surfaces | Existing dev/harness usage | Read-only/disabled diagnostics | No default Trade UI bridge call | No | No | No | Medium | Keep out of default product UI; preserve bridge boundary tests. |
| LMI-020 | `components/execution/execution-audit-log-viewer.tsx`, `execution-local-records-viewer.tsx`, `execution-dev-mock-broker-results-panel.tsx` | Local diagnostic viewers | Dev/settings/diagnostic surfaces | Dev/settings usage | Browser-local diagnostic readbacks | Local browser storage only | No | No Supabase execution writes | No | Low/Medium | Keep documented as local diagnostic/mock-only. |
| LMI-021 | `components/execution/ExecutionBrokerCaptureStubPanel.tsx`, `SemiAutoAgentResultCaptureStub.tsx` | Broker capture/result stubs | Dev/diagnostic | Dev/model usage | Mock/stub only | No live broker trigger | No | No | No | Low | Safe as mock/stub. |
| LMI-022 | `components/execution/stub-previews/**` | Avanza/broker stub previews | Dev/diagnostic | Dev/model usage | Stub/model-only | No | No | No | No | Low | Safe as model previews. |
| LMI-023 | `app/mock-broker/**` and `components/execution/SandboxBrokerOrderForm.tsx` | Mock broker pages/forms | Mock/sandbox routes | Mock/sandbox route isolation | Mock-only | Can write mock/dev result locally when explicitly used | No Avanza browser automation | No Supabase execution writes by default | No Avanza final KOP/SALJ | Low/Medium | Keep mock labels clear; not production broker UI. |
| LMI-024 | `app/sandbox-broker/page.tsx`, sandbox browser-agent components | Sandbox broker route | Sandbox route | Sandbox/dev isolation | Mock/sandbox-only | Mock flow only | No live Avanza | No | No | Low | Safe as sandbox route. |
| LMI-025 | `components/execution/AvanzaSettingsPassiveExecutionReadinessPanel.tsx` and `AvanzaExecutionSettingsProfilePanel.tsx` | Settings execution readiness/profile panels | Settings-only passive readbacks | Settings route/context | Read-only/profile model | No active execution trigger | No | No | No | Low | Safe in Settings; avoid adding refresh/polling outside Settings. |
| LMI-026 | `components/execution/AvanzaReadOnlyReadinessBadge.tsx`, `AvanzaTradeCardExecutionReadinessVisualPreview.tsx` | Readiness badge visual QA | Dev QA/harness; badge flag false in Trade UI | Feature flag/dev harness | Read-only visual preview | No | No | No | No | Low | Safe; keep flag false in Trade UI. |
| LMI-027 | `components/recommendations/RecommendationDetailsModal.tsx`, `DiscardRecommendationModal.tsx` | Recommendation product modals | Product UI | Existing product state | Non-execution details/discard | No Avanza execution | No | No | No | Low | Out of execution scope; safe. |

Surfaces inventoried: 27.

## Feature Flag Status

`app/trade-app.tsx` currently contains exact hardcoded false flags:

- `const ENABLE_READ_ONLY_SELECTED_RECOMMENDATION_PREVIEW = false;`
- `const ENABLE_PASSIVE_TRADE_CARD_EXECUTION_READINESS_BADGE = false;`

Observed behavior:

- `buildRecommendationTradeCardExecutionReadiness(...)` returns `null` when `ENABLE_PASSIVE_TRADE_CARD_EXECUTION_READINESS_BADGE` is false.
- `buildLivePositionTradeCardExecutionReadiness(...)` returns `null` when `ENABLE_PASSIVE_TRADE_CARD_EXECUTION_READINESS_BADGE` is false.
- The selectedRecommendation preview branch is guarded by `ENABLE_READ_ONLY_SELECTED_RECOMMENDATION_PREVIEW`; the default false state prevents default Trade UI rendering.

No runtime env path, visible toggle, route link, or production enablement was added by this checkpoint.

## Isolation Assessment

Safe as-is:

- Product recommendation/history/live details modals that are read-only and non-execution.
- Presentational modal shell/composition components.
- Passive badge/preview components while hardcoded flags remain false.
- Mock/sandbox broker surfaces when clearly treated as mock routes.
- Settings passive readiness/profile panels when kept as read-only settings surfaces.

Needs wording/docs clarification:

- Legacy handoff wording in older modal/control names can still be conceptually noisy.
- Live-position "handoff" wording may eventually be clearer as "plan" or "review" wording.
- Historical docs still contain many execution/Avanza terms and should be read through newer checkpoints.

Needs feature flag confirmation:

- `ENABLE_READ_ONLY_SELECTED_RECOMMENDATION_PREVIEW` must remain false until a separately approved Trade UI preview task.
- `ENABLE_PASSIVE_TRADE_CARD_EXECUTION_READINESS_BADGE` must remain false until separately approved.

Needs future hardening:

- Consider moving legacy execution modal diagnostics into a stronger dev-only module boundary if product bundle clarity becomes a priority.
- Consider transitive import tests for dev QA route surfaces if that route ever receives real state.

Blockers:

- None found in this checkpoint.

## Trade UI Minimalism Confirmation

- Recommendation cards remain conceptually simple: ticker/logo, company name, confidence, entry, stop, target, reward:risk, confidence score, and Make Trade button.
- No new visible execution complexity was introduced.
- No new prepare/execute/handoff CTA was added.
- "Make Trade" retains the current product role; this checkpoint does not change its behavior.
- Execution logic remains under the surface and locked behind existing false flags/dev diagnostics.

## Changes Made

- Added this checkpoint doc.
- Updated the cleanup plan and legacy surface audit to mark Task 344 complete.
- Updated the script import boundary checkpoint to note that the modal isolation follow-up is now complete.

No app code or runtime behavior was changed.

## Deferred Actions

- Optional future copy cleanup for legacy "handoff" labels in product-adjacent read-only surfaces.
- Optional future extraction of `ExecutionHandoffPreviewModal` into a clearly dev-only module boundary.
- Optional future tests that assert selected modal/surface imports remain behind known false flags/dev boundaries.
- Optional historical docs cleanup to reduce outdated execution wording.

## Static Search Notes

The broad static search for modal/preview/handoff/prepare/execution/broker/Avanza/confirmation/submit/manual/KOP/SALJ/BUY/SELL/readiness/badge terms returns many intentional hits across:

- docs/checkpoints/runbooks
- tests and static safety assertions
- dev QA route harnesses
- model-only Avanza contract helpers
- legacy diagnostic modal components
- product read-only history/live/recommendation details

These hits are expected. The checkpoint classifies the risky surfaces by boundary rather than trying to erase technical terms from a large legacy codebase.

## Validation Commands

Run for this checkpoint:

```bash
PLAYWRIGHT_SKIP_WEB_SERVER=true npx playwright test tests/e2e/execution-script-import-boundary.spec.ts tests/e2e/execution-record-audit-writer-route-boundary.spec.ts tests/e2e/execution-record-audit-writer-route-auth-hardening.spec.ts --reporter=line
git diff --check
git diff -- .env.local --exit-code
git diff -- app/trade-app.tsx --exit-code
find docs -type f -size 0
./node_modules/.bin/tsc --noEmit
npm run lint
```

Results:

- boundary plus audit-writer route hardening specs: `27 passed`
- `git diff --check`: passed
- `git diff -- .env.local --exit-code`: passed
- `git diff -- app/trade-app.tsx --exit-code`: passed
- `find docs -type f -size 0`: passed with no output
- `./node_modules/.bin/tsc --noEmit`: passed
- `npm run lint`: passed

## Safety Confirmations

- No runtime gates were opened.
- No new visible Trade UI execution surface was added.
- No disabled API route was activated.
- No smoke scripts were run or imported.
- No browser automation was added.
- No credential access was added.
- No cookie/session handling was added.
- No BankID automation was added.
- No order submission was added.
- No final KOP/SALJ click was added.
- No Supabase execution write was added.
- No Trade UI execution was introduced.
- No production readiness was introduced.

## Final Decision

`legacy_modal_isolation_checkpoint_complete_with_warnings`

The legacy modal isolation checkpoint is complete. Warnings remain because older modal/control/component names still contain execution and handoff terminology, and the legacy modal remains imported by Trade UI behind existing dev-tools checks. No blocker was found, and no runtime path was activated.
