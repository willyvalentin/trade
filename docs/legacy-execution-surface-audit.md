# Legacy Execution Surface Audit

Date: 2026-07-07

Scope: static audit of legacy execution, handoff, broker, API, persistence, script, and sensitive-boundary surfaces outside the scoped Sharp Semi Auto Execution stack.

## 1. Summary

Purpose: inventory older or potentially confusing execution surfaces so the Sharp Semi Auto path can stay locked, simple, and visually quiet.

Decision: `legacy_execution_surface_audit_passed_with_cleanup_recommendations`

Conclusion: no blocker was found. The reviewed legacy surfaces do not block the next safe planning phase, but they should be treated as production-readiness-blocked legacy/model evidence, not product execution infrastructure. Several surfaces need cleanup or hardening because names, old modal copy, localStorage stores, stale edit-conflict artifacts, and gated persistence routes can be confused with active execution. No runtime path was activated by this audit.

## 2. Method

This audit used static repo inspection only:

- `rg` searches for execution, handoff, broker, Avanza, order, submit, KÖP/SÄLJ, confirmation, persistence, API/fetch, modal, prepare, browser, smoke, bridge, invocation, cookie, session, credential, and BankID keywords.
- Targeted reads of relevant UI, API route, persistence, localStorage, bridge, smoke script, and docs files.
- No scripts were run.
- No smoke tests were run.
- No browser automation was performed.
- No API route was activated.
- No Trade UI behavior was changed.
- No runtime gate was opened.

## 3. Inventory Table

| ID | File/path | Surface type | Keyword/source | Classification | Risk | Observation | Recommendation |
| --- | --- | --- | --- | --- | --- | --- | --- |
| LES-001 | `components/execution/execution-handoff-preview-modal.tsx` | Legacy UI/modal | `ExecutionHandoffPreviewModal`, historical Avanza preparation wording, bridge diagnostics | Needs cleanup | Medium | Large legacy modal includes prepare-stub and bridge diagnostics copy behind `isExecutionDevToolsEnabled()`. It is not default product UI, and the copy must not be read as permission to submit orders or click final KÖP/SÄLJ. Task 344 added `docs/legacy-modal-isolation-checkpoint.md` to classify the modal as legacy/dev-diagnostic and non-executing in the current locked state. | Keep default hidden; future task may split this modal into a stronger dev-only module boundary or reduce product-facing language. |
| LES-002 | `components/execution/SemiAutoAgentHandoffPreview.tsx` | Legacy UI/read-only preview | `Mock semi-auto agent preview` | Safe read-only UI | Low | Shows non-executing preview copy and states no order has been placed or auto-submit enabled. | Leave as read-only/dev surface; keep out of simple recommendation cards. |
| LES-003 | `components/execution/FutureAgentRequestPreview.tsx` | Legacy UI/request preview | historical final-submit-authority wording | Needs cleanup | Medium | Copy can be misread as future submit authority even when no broker agent is connected. | Rewrite copy in a separate cleanup task to state that final KÖP/SÄLJ remains human-only and forbidden for the agent. |
| LES-004 | `components/execution/live-position-handoff-controls.tsx` and `components/live-day-trades/LiveExecutionStatusSurface.tsx` | Legacy UI/handoff button | `View handoff` | Needs cleanup | Low | Read-only handoff viewer control exists for live-position surfaces. It opens inspection, not execution, but adds visible complexity. | Keep disabled/read-only where applicable; consider renaming to "View plan" or hiding from default product surfaces. |
| LES-005 | `app/trade-app.tsx` | Product UI integration | execution imports, handoff modal, localStorage | Needs hardening | Medium | Trade app imports legacy execution modal/readiness pieces and contains localStorage event/state helpers. Default Sharp flags are off, but legacy execution UI remains large and hard to reason about. Task 344 confirmed the exact false flag status for selectedRecommendation preview and passive readiness badge surfaces. | Keep app unchanged now; any stronger module isolation must be a future scoped task. |
| LES-006 | `components/execution/AvanzaTradeCardExecutionReadinessBadge.tsx` and related passive readiness components | Read-only UI | readiness badge | Safe read-only UI | Low | Passive/read-only UI surfaces are feature-flagged and explicitly non-executing. | Keep flag default-off and avoid adding card clutter. |
| LES-007 | `components/execution/AvanzaTradeUiHandoffPreview.tsx` and handoff preview fixtures | Read-only UI | handoff package preview | Safe read-only UI | Low | Displays package/readiness state only. No active submit path observed. | Keep as passive preview only. |
| LES-008 | `lib/execution-record-store.ts` | Browser local persistence | `ture_execution_records_v1` | Needs cleanup | Low | Browser localStorage stores mock/local execution records. It can be confused with production execution records. | Document as local diagnostic/mock-only; defer storage-key/type rename to a future migration task. |
| LES-009 | `lib/execution-event-log.ts` | Browser local persistence | `ture_execution_event_log_v1`, `broker_order_submitting` | Needs cleanup | Low | Local audit events include lifecycle names that sound active, but storage is browser-local and diagnostic. | Document these as local diagnostic audit entries, not broker execution or submit authority. |
| LES-010 | `lib/execution-local-storage-helpers.ts` | Browser local persistence | event/record/dev mock stores | Needs cleanup | Low | Shared localStorage helper reads/writes dev mock broker results, execution event logs, and local execution records. | Keep data sanitized; document storage keys and defer any key migration. |
| LES-011 | `lib/broker-execution-metadata.ts` | Metadata/parser | `broker_confirmed_at`, `broker_order_preview`, `execution_metadata` | Needs cleanup | Low | Metadata supports manual broker-confirmation fields and historical broker status labels such as `submitted_not_filled`. These labels are parsing/modeling evidence only, not submit authority. | Keep manual-confirmation semantics explicit; avoid using these names as active execution authority. |
| LES-012 | `app/api/execution/records/insert/route.ts` | API route/dry-run persistence | `execution_records`, `dry_run` | Safe local/dev/mock only | Low | Route is dev-tools gated and requires dry-run mode; responses state no Supabase read/write, audit append, or trade mutation occurred. | Keep disabled by default; document as dry-run route only. |
| LES-013 | `app/api/execution/audit/writer/route.ts` | API route/audit writer | writer route, auth gate, dev gate, hard-disabled route gate | Needs hardening | Medium | Route is now hard-disabled by default before auth/body parsing and cannot call the server audit writer unless a future scoped task removes or replaces that hard-disabled boundary. This is legacy audit persistence, not Avanza order execution. | Keep hard-disabled; require a separate route-level safety checkpoint before any writer or persistence flag is enabled. |
| LES-014 | `app/api/execution/audit/lifecycle-events/route.ts`, `agent-runs/route.ts`, `agent-progress-events/route.ts` | API routes/audit persistence | execution audit persistence | Needs hardening | Medium | Routes are dev-tools gated and use persistence flags; default response is stub/no-op unless explicit env gates allow persistence. | Keep flags off; document these as locked persistence surfaces. |
| LES-015 | `lib/execution-audit-persistence-route-handler.ts` and `lib/execution-persistence-flags.ts` | Persistence gate | Supabase writer flags | Needs hardening | Medium | Supabase writer can be selected only after explicit env flags and environment checks; production has an additional allow flag. | Maintain default disabled env; require separate approval before any Supabase execution/audit write. |
| LES-016 | `app/api/execution/capture/route.ts` | API route/dev capture | capture stub | Safe local/dev/mock only | Low | Dev-tools gated capture stub accepts validated request and states no Supabase write/trade mutation occurred. | Keep disabled outside dev tools. |
| LES-017 | `app/api/dev/avanza/fill-only/stub/route.ts` | Disabled API route | Avanza fill-only stub | Safe local/dev/mock only | Low | Disabled local-only stub returns disabled model and does not activate Avanza. | Leave disabled; do not link from Trade UI. |
| LES-018 | `scripts/avanza-login-smoke-test.local.ts` and `scripts/avanza-order-chain-smoke-test.local.ts` | Terminal scripts | smoke scripts | Safe local/dev/mock only | Low | Terminal-only scripts require explicit env/manual gates. This audit did not run them. Task 343 added static import-boundary tests proving app/runtime source does not import restricted terminal scripts. | Keep terminal-only; do not import into app runtime. |
| LES-019 | `scripts/avanza-localhost-bridge-server*.mjs` and `scripts/avanza-dry-run-runner-skeleton.mjs` | Local bridge/script | bridge, localhost | Needs hardening | Medium | Local bridge scripts exist for future local-dev work and must remain separate from app runtime. Task 343 added static import/spawn boundary tests and an explicit allowlist for inventory-only references. | Require manual approval runbook before any invocation; keep out of UI/runtime imports. |
| LES-020 | `lib/avanza-localhost-bridge-contract.ts` | Contract/model | localhost bridge endpoints, session detection | Needs hardening | Medium | Contract is large and models future bridge responses, including session detection, while requiring no browser/order submission metadata. | Keep as contract-only unless a future gate explicitly activates a local bridge. |
| LES-021 | `lib/avanza-secure-credential-provider.ts` and credential readiness components | Sensitive boundary | credentials, Keychain | Needs hardening | Medium | Credential provider contracts exist, but audited UI/harness copy says no credential material returned. | Keep adapter contracts dry/model-only until a separate credential approval task; never log or store credential material. |
| LES-022 | `app/mock-broker/**` and `components/execution/SandboxBrokerOrderForm.tsx` | Mock broker UI | mock broker/order ticket | Safe local/dev/mock only | Low | Mock broker pages/components are local simulation surfaces, not Avanza or live broker execution. | Keep clearly labeled mock/dev and avoid routing from product Trade UI. |
| LES-023 | `app/sandbox-broker/page.tsx` and sandbox agent helpers | Sandbox browser/mock | sandbox broker | Safe local/dev/mock only | Low | Sandbox browser/agent surfaces support mock flow QA. | Keep isolated from production navigation and live Avanza. |
| LES-024 | `lib/finalization-*`, `lib/execution-record-*validator*`, `lib/*bridge-contract*` | Contract/model | finalization, execution record bridge | Safe documentation only / model-only | Low | These files model boundaries and validators; many explicitly block write/submit/browser authority. | Keep as model-only evidence; avoid treating validation readiness as write approval. |
| LES-025 | `docs/**execution**`, `docs/**avanza**`, runbooks/checkpoints | Documentation | docs-only references | Safe documentation only | None | Many docs contain historical execution language and safety gates. They do not create runtime paths. | Leave, but prefer linking newer checkpoints to reduce confusion. |
| LES-026 | `app/trade-app (# Edit conflict ...).tsx`, `lib/*(# Edit conflict ...)*` | Stale artifacts | edit conflict duplicate files | Needs cleanup | Medium | Stale edit-conflict files contain old execution/persistence references and make static audits noisy. They are not imported as canonical runtime files. | Remove or archive these artifacts in a separate cleanup task after confirming no user-needed content remains. |
| LES-027 | `components/live-day-trades/LiveTradeDetailsModal.tsx` and history panels | Read-only UI/metadata display | broker confirmation, handoff replay | Safe read-only UI | Low | Displays audit/metadata from existing positions/trades and states guidance is advisory/no Avanza control. | Keep read-only; avoid adding controls. |
| LES-028 | `app/api/positions/update/route.ts` | Non-execution API persistence | position updates insert | Safe read-only/non-execution persistence | Low | Inserts position update records, not execution records or broker orders. | Out of execution scope; keep separate in docs. |

Surfaces inventoried: 28.

## 4. Legacy UI Surfaces

Older execution UI exists, especially `ExecutionHandoffPreviewModal`, semi-auto previews, live-position handoff viewers, execution sandbox fixtures, and passive readiness badges. The active product recommendation card should remain simple: ticker/logo, company name, confidence, entry, stop, target, reward:risk, confidence score, and Make Trade button.

Findings:

- No blocker UI path was found that clicks final KÖP/SÄLJ or submits an order.
- The biggest UI risk is visual and conceptual complexity, not runtime activation.
- `ExecutionHandoffPreviewModal` includes local prepare-stub and bridge diagnostics language behind `isExecutionDevToolsEnabled()`.
- Passive Trade card readiness and selectedRecommendation previews are default-off/read-only.
- Live-position handoff controls are inspection-oriented, but the wording can still feel like active execution.

Recommended cleanup:

- Rename old handoff/modal surfaces to emphasize dev diagnostics.
- Reduce product-facing Avanza preparation wording unless the surface is strictly dev-only, hard-disabled, and explicit that final KÖP/SÄLJ is human-only.
- Keep recommendation cards visually simple and do not add more execution readbacks there.
- Task 344 completed a modal isolation checkpoint covering 27 modal/preview/handoff/readiness surfaces, with no app code changes and no new visible execution UI.

## 5. Legacy Persistence Surfaces

Persistence surfaces fall into three groups:

- Browser-local diagnostic stores: `ture_execution_records_v1`, `ture_execution_event_log_v1`, and `ture_dev_mock_broker_results_v1`.
- Dry-run execution record route: `/api/execution/records/insert`, which requires dev tools and dry-run mode and states no Supabase read/write occurs.
- Execution audit persistence routes and writer contracts, which are dev/auth/env-gated and can be wired to no-op or Supabase writer depending on explicit flags.

No blocker Supabase execution write path was found in the default locked state. The risk is that old names like `execution_records`, `broker_order_preview`, `broker_confirmed_at`, and `broker_order_submitting` can be confused with production execution records.

Recommended hardening:

- Keep `EXECUTION_AUDIT_SUPABASE_PERSISTENCE_ENABLED`, `EXECUTION_AUDIT_SUPABASE_WRITER_ENABLED`, and production allow flags disabled unless a separate approval task opens them.
- Add a future persistence-boundary checklist before any audit writer route is used beyond no-op/dry-run.
- Document localStorage record stores as diagnostic/mock-only now; defer any rename/storage migration to a separate migration-safe task.

## 6. Legacy API/Fetch Surfaces

Execution-related API routes found:

- `/api/dev/avanza/fill-only/stub`: disabled stub.
- `/api/execution/records/insert`: dev-tools gated dry-run stub.
- `/api/execution/capture`: dev-tools gated capture stub.
- `/api/execution/audit/writer`: hard-disabled audit writer route with dev-tools/auth gates preserved behind the disabled boundary.
- `/api/execution/audit/lifecycle-events`, `/agent-runs`, `/agent-progress-events`: dev-tools gated audit persistence routes.

Trade UI still contains unrelated app fetches for market calendar, symbol metadata, recommendations, and positions. No Avanza execution/handoff API fetch from default Trade UI was identified in the static scan.

Recommended hardening:

- Document audit writer and audit persistence routes as locked legacy surfaces.
- Keep disabled Avanza route unlinked from main navigation and Trade UI.
- Do not add polling or refresh behavior for execution routes.

## 7. Legacy Script/Smoke/Bridge Surfaces

Script surfaces found:

- `scripts/avanza-login-smoke-test.local.ts`
- `scripts/avanza-order-chain-smoke-test.local.ts`
- `scripts/avanza-localhost-bridge-server.mjs`
- `scripts/avanza-localhost-bridge-server-smoke.mjs`
- `scripts/avanza-dry-run-runner-skeleton.mjs`
- `scripts/mock-order-page-agent-runner.mjs`

The smoke scripts are terminal-only and require explicit env/manual gates. A targeted import scan found no app-runtime import of the terminal smoke scripts. This audit did not run any scripts.

Recommended hardening:

- Keep smoke and bridge scripts terminal-only.
- Require the manual local-dev smoke test runbook before any run.
- Do not add UI buttons or API routes that invoke these scripts.
- Preserve `tests/e2e/execution-script-import-boundary.spec.ts` so app/runtime imports and UI/API process-spawn paths fail fast if restricted scripts are accidentally wired.

## 8. Sensitive Boundary Surfaces

Sensitive boundaries reviewed:

- Credentials: credential provider contracts exist; no credential material path was exercised.
- Cookies/session: bridge/invocation contracts model session detection but forbid cookie/session export and browser actions by default.
- BankID: docs and contracts keep BankID manual-only/forbidden for automation.
- Browser storage: localStorage stores are diagnostic/mock-only, but should be named and documented clearly.
- Account/person data: execution metadata and route payloads can include account/session IDs as model fields; no new handling was added.
- Order confirmation data: broker confirmation metadata is manual/read-only and must not become order submission authority.

No active sensitive path was found that should be classified as a blocker in the default locked state.

## 9. Recommendations

Cleanup tasks:

- Remove or archive stale `# Edit conflict` files after confirming no user-needed content remains.
- Document legacy localStorage stores/docs to emphasize local diagnostic/mock-only behavior; do not rename keys without a migration-safe task.
- Rewrite confusing modal copy that can imply Avanza preparation or final submit authority; use dev diagnostics, manual review, and human-final wording instead.
- Keep recommendation cards visually simple and avoid adding more execution panels there.

Hardening tasks:

- Add a dedicated route-boundary checkpoint for `/api/execution/audit/writer` and audit persistence routes before any persistence flag is enabled.
- Add a legacy modal isolation task that keeps `ExecutionHandoffPreviewModal` behind a single explicit dev-only boundary.
- Task 344 completed the legacy modal isolation checkpoint; future hardening can still split legacy modal diagnostics into a stronger dev-only module boundary if approved.
- Add a script boundary test ensuring smoke scripts and localhost bridge scripts are never imported by app runtime.
- Task 343 completed the script boundary test in `tests/e2e/execution-script-import-boundary.spec.ts`; keep it in the required validation set for future execution-surface changes.
- Add a persistence naming checklist distinguishing local diagnostic records from Supabase execution records.

Blocker fixes:

- None identified.

Recommended next safe phase: perform the cleanup planning task for stale edit-conflict artifacts and legacy modal wording. Activate nothing.

## 10. Gate State

| Gate | State |
| --- | --- |
| Invocation boundary | Locked |
| Local-dev bridge gate | Locked |
| Smoke runner invocation | Locked |
| Terminal script invocation | Locked |
| Browser automation | Locked |
| Credential access | Locked |
| Cookies/session | Forbidden |
| BankID automation | Forbidden |
| Order submission | Forbidden |
| Final KÖP/SÄLJ by agent | Forbidden |
| Supabase writes | Locked |
| Trade UI execution | Locked |
| API route activation | Locked |
| Production readiness | Blocked |

## 11. Final Audit Decision

Final decision: `legacy_execution_surface_audit_passed_with_cleanup_recommendations`

The legacy execution surface audit passed with cleanup recommendations. No blockers were found. Legacy surfaces are mostly docs-only, read-only UI, local/dev/mock-only, or gated model/contract code. The main risks are confusion and future misuse: old modal language, browser-local execution record naming, gated audit writer routes, and stale edit-conflict artifacts.

No runtime gates were opened. No smoke scripts were run or imported. No browser automation, credential access, cookie/session handling, BankID automation, order submission, final KÖP/SÄLJ, Supabase write, API route activation, Trade UI execution, or production readiness was introduced.
