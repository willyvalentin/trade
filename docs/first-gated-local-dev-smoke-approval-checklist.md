# First Gated Local-Dev Smoke Approval Checklist

Date: 2026-07-07

## 1. Summary

Purpose: provide the final plan-only approval checklist and gate decision record before any future task may consider running the first gated local-dev smoke test for the Sharp Semi Auto Execution login/order-prep flow.

Scope: approval-checklist only. This document reviews required artifacts, human approvals, gate evidence, scenarios, stop conditions, evidence boundaries, environment placeholders, command placeholders, blockers, and warnings.

What this checklist enables: a future separate task can use it to decide whether a tightly scoped local-dev smoke execution dry-run may be approved.

What this checklist does not do: it does not approve runtime execution automatically. It does not run smoke, open gates, start browser automation, access credentials, handle cookies/session, handle BankID, prepare a live order, submit an order, click final KOP/SALJ, write Supabase execution records, activate API routes, or change Trade UI execution behavior.

Approval decision: `first_gated_local_dev_smoke_approval_ready_with_warnings`

## 2. Required Artifacts Checklist

| Artifact | Exists? | Decision | Blockers? | Warnings? | Blocks future smoke? | Required before execution? |
| --- | --- | --- | --- | --- | --- | --- |
| `docs/avanza-manual-local-dev-smoke-test-runbook.md` | Yes | Runbook present | No | No runtime smoke/browser verification yet | No, if approval task accepts plan-only limitation | Yes |
| `docs/sharp-semi-auto-pre-smoke-readiness-review.md` | Yes | `sharp_semi_auto_pre_smoke_readiness_ready_with_warnings` | No | Legacy naming/import warnings; no runtime smoke/browser verification | No | Yes |
| `docs/first-gated-local-dev-smoke-test-plan.md` | Yes | `first_gated_local_dev_smoke_test_plan_ready_with_warnings` | No | Same warning set carried forward | No | Yes |
| `docs/sharp-semi-auto-execution-safety-audit.md` | Yes | `sharp_semi_auto_execution_safety_audit_passed_with_warnings` | No | Repo-wide legacy surfaces were warning-class findings | No | Yes |
| `docs/legacy-execution-surface-audit.md` | Yes | `legacy_execution_surface_audit_passed_with_cleanup_recommendations` | No | Legacy surfaces require continued caution | No | Yes |
| `docs/legacy-execution-cleanup-plan.md` | Yes | `legacy_execution_cleanup_plan_ready_with_warnings` | No | Technical identifiers remain | No | Yes |
| `docs/stale-edit-conflict-artifact-cleanup-checkpoint.md` | Yes | `stale_edit_conflict_artifact_cleanup_complete` | No | None material | No | Yes |
| `docs/legacy-execution-wording-normalization-checkpoint.md` | Yes | `legacy_execution_wording_normalization_complete_with_warnings` | No | Technical execution/handoff terms remain | No | Yes |
| `docs/local-diagnostic-execution-records-checkpoint.md` | Yes | `local_diagnostic_execution_records_checkpoint_complete_with_warnings` | No | Local diagnostic names remain for migration-risk reasons | No | Yes |
| `docs/execution-audit-writer-route-persistence-hardening-checkpoint.md` | Yes | `execution_audit_writer_route_persistence_hardening_complete_with_warnings` | No | Route/writer names remain, but hard-disabled | No | Yes |
| `docs/execution-script-import-boundary-tests-checkpoint.md` | Yes | `execution_script_import_boundary_tests_complete_with_warnings` | No | One isolated allowlisted `child_process` use remains | No | Yes |
| `docs/legacy-modal-isolation-checkpoint.md` | Yes | `legacy_modal_isolation_checkpoint_complete_with_warnings` | No | Legacy modal naming/import warnings remain | No | Yes |

## 3. Human Approval Checklist

- [ ] Operator identified.
- [ ] Reviewer identified.
- [ ] Local-dev-only environment confirmed.
- [ ] No production environment confirmed.
- [ ] No real order intent confirmed.
- [ ] Safe test input contract selected.
- [ ] BUY scenario reviewed.
- [ ] SELL scenario reviewed.
- [ ] BankID/MFA policy reviewed.
- [ ] Stop conditions reviewed.
- [ ] Evidence policy reviewed.
- [ ] No-submit pledge acknowledged.
- [ ] No-final-click pledge acknowledged.
- [ ] Redaction requirements acknowledged.
- [ ] Gate state before/after documentation required.
- [ ] Abort authority assigned to operator.
- [ ] Abort authority assigned to reviewer.

This checklist is not complete until every item is explicitly acknowledged in a separate future approval task.

## 4. Gate Approval Matrix

| Gate | Current state | Approval required before future execution | Allowed in this task? | Required evidence before opening in future task | Required evidence after future task | Must return to locked? | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Local-dev bridge gate | Locked | Explicit local-dev bridge approval | No | Local-dev proof, scope, rollback/close plan | Gate closed record and redacted result | Yes | No bridge opens here. |
| Smoke runner invocation | Locked | Explicit runner approval | No | Scenario id, exact command, no-submit pledge | Exit status, stop condition, no-submit confirmation | Yes | No runner invocation here. |
| Terminal script invocation | Locked | Explicit terminal-only approval | No | Exact command, redacted env review, no secrets | Redacted output and gate closure | Yes | No script is run or imported here. |
| Browser automation, local-dev-only | Locked | Explicit local-dev browser approval | No | Browser scope, stop conditions, evidence rules | Browser closed, no storage export, redacted evidence | Yes | No browser automation here. |
| Credential boundary, manual-only/no logging | Locked | Explicit manual credential boundary approval | No | Manual entry policy and no logging policy | No credentials logged/stored confirmation | Yes | No credential access here. |
| BankID boundary, manual-only/no automation or abort | Blocked | Explicit manual-only or abort decision | No | BankID policy selected before run | No automation and no sensitive evidence confirmation | Yes | BankID automation remains forbidden. |
| Evidence handling gate | Locked | Explicit evidence policy approval | No | Redaction rules and storage destination | Evidence review and redaction/deletion status | Yes | No sensitive evidence here. |
| No-submit gate | Locked | Affirmation required; never opened for submit | No | No-submit pledge | No order submitted confirmation | Yes | This is a prohibition gate. |
| No-final-click gate | Locked | Affirmation required; never opened for final click | No | No final KOP/SALJ pledge | No final click confirmation | Yes | Human final action only. |
| Supabase write lock | Locked | Must remain locked | No | Confirm no write gate/flag enabled | Confirm no execution write | Yes | No Supabase execution write. |
| Trade UI no-execution confirmation | Locked | Must remain locked | No | Confirm no active Trade UI execution path | Confirm Trade UI remains unchanged for smoke | Yes | No Trade UI execution. |
| API route activation remains blocked | Blocked | Must remain blocked | No | Confirm disabled route remains disabled | Confirm no route activation | Yes | No API activation. |
| Production readiness remains blocked | Blocked | Must remain blocked | No | Confirm local-dev-only scope | Confirm no production claim | Yes | No production readiness. |

## 5. Scenario Approval Checklist

### Scenario A - Login Boundary Smoke

- [ ] Preconditions approved.
- [ ] Operator steps approved.
- [ ] Agent/system allowed actions approved.
- [ ] Credential/BankID/MFA stop conditions approved.
- [ ] Evidence restrictions approved.
- [ ] Pass/fail criteria approved.

### Scenario B - BUY Order-Prep Boundary Smoke

- [ ] Safe mocked/review-only recommendation contract approved.
- [ ] Stop-at-review/final-confirmation approved.
- [ ] No final KOP approved.
- [ ] No order submit approved.
- [ ] Evidence restrictions approved.
- [ ] Pass/fail criteria approved.

### Scenario C - SELL Order-Prep Boundary Smoke

- [ ] Safe mocked/review-only live position/exit contract approved.
- [ ] Stop-at-review/final-confirmation approved.
- [ ] No final SALJ approved.
- [ ] No order submit approved.
- [ ] Evidence restrictions approved.
- [ ] Pass/fail criteria approved.

### Scenario D - Abort/BankID Boundary Smoke

- [ ] Immediate abort or manual-only BankID policy approved.
- [ ] No BankID automation approved.
- [ ] No sensitive evidence approved.
- [ ] Pass/fail criteria approved.

## 6. Stop Condition Approval

| Stop condition | Approved as hard stop? | Operator action | Reviewer action | Evidence allowed? | Evidence forbidden? |
| --- | --- | --- | --- | --- | --- |
| BankID prompt appears | Required before execution | Stop or handle manually only if separately approved | Confirm abort/manual-only branch | Redacted stop reason | BankID data/screenshots |
| Credential entry required | Required before execution | Stop unless explicit manual-only approval exists | Confirm no logging/storage | Redacted stop reason | Credentials |
| MFA required | Required before execution | Stop unless explicit manual-only approval exists | Confirm no automation | Redacted stop reason | MFA details |
| Cookie/session export requested | Required before execution | Abort | Confirm no export | Redacted stop reason | Cookies/session tokens |
| Browser storage access detected | Required before execution | Abort | Confirm no storage read/export | Redacted stop reason | Raw storage |
| Avanza final KOP/SALJ confirmation visible | Required before execution | Stop immediately | Confirm no final click | Redacted boundary reached | Sensitive confirmation ids |
| Any submit/final action would be next | Required before execution | Stop immediately | Confirm no submit/final click | Redacted boundary reached | Order confirmation details |
| Unexpected navigation to live order execution | Required before execution | Abort | Confirm state and gate closure | Redacted route/state summary | Sensitive page data |
| Attempt to write Supabase execution data | Required before execution | Abort | Confirm no write occurred | Redacted failure summary | Service keys/payload secrets |
| API route/bridge gate unexpectedly active | Required before execution | Abort | Confirm gate state | Redacted gate state | Secrets/env values |
| Unredacted sensitive data appears in logs | Required before execution | Abort and redact/delete | Review evidence handling | Redacted incident summary | Original sensitive logs |
| Uncertainty about whether next step submits an order | Required before execution | Stop immediately | Confirm blocked state | Redacted uncertainty reason | Sensitive screenshots |
| Evidence artifact risks exposing account/person/session/auth data | Required before execution | Do not save artifact | Confirm deletion/redaction | Redacted artifact type | Original sensitive artifact |

## 7. Evidence Approval Checklist

Allowed future evidence:

- Redacted text logs.
- Test scenario id.
- Timestamp.
- Gate state before/after.
- Stop condition reached.
- Safe contract/plan summary.
- Human operator sign-off.
- Reviewer sign-off.
- Screenshots only if fully redacted and without sensitive data.

Forbidden future evidence:

- Credentials.
- BankID data.
- Cookies.
- Session tokens.
- Raw browser storage.
- Network dumps.
- Avanza account/customer ids.
- Saldo, holdings, or account numbers.
- Full personal data.
- Sensitive order confirmation ids.
- Supabase service keys.
- Env secrets.

## 8. Future Env Approval Checklist

`.env.local` is not changed by this task.

Placeholder flags from the plan:

| Placeholder flag | Must remain false in this task | Requires separate future approval | Must never be true for forbidden capabilities |
| --- | --- | --- | --- |
| `ENABLE_LOCAL_DEV_SMOKE_TEST=false` | Yes | Yes | Not a production flag. |
| `ENABLE_AVANZA_LOCAL_DEV_BRIDGE=false` | Yes | Yes | Not outside local-dev. |
| `ENABLE_BROWSER_ORDER_PREP_DRY_RUN=false` | Yes | Yes | Not without no-submit/stop-at-review. |
| `ENABLE_ORDER_SUBMISSION=false` | Yes | Yes | Must never authorize order submission by agent. |
| `ENABLE_FINAL_BUY_SELL_CLICK=false` | Yes | Yes | Must never authorize final BUY/SELL click by agent. |
| `ENABLE_BANKID_AUTOMATION=false` | Yes | Yes | Must never authorize BankID automation. |
| `ENABLE_COOKIE_SESSION_EXPORT=false` | Yes | Yes | Must never authorize cookie/session export. |
| `ENABLE_SUPABASE_EXECUTION_WRITES=false` | Yes | Yes | Must never authorize writes without a separate Supabase gate. |

## 9. Future Command Approval Checklist

Future command placeholders are not run in this task.

| Future command type | Do not run in this task | Requires separate approval | Dry-run/no-submit | Stop at review | No cookie/session export | No BankID automation | No final KOP/SALJ | No order submit | Redacted-only evidence |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Local-dev-only smoke runner | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Yes |
| Dry-run runner | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Yes |
| Bridge server | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Yes |
| Login boundary check | Yes | Yes | Yes | Not applicable unless order page reached | Yes | Yes | Yes | Yes | Yes |
| Order-prep boundary check | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Yes |

## 10. Approval Blockers

Future smoke execution is blocked if any of the following is true:

- Required artifact is missing.
- Any prior checkpoint has an unresolved blocker.
- Any gate is not locked before the future task.
- `.env.local` contains unexpected live/smoke enablement.
- Trade UI execution path exists.
- API route activation exists.
- Smoke script import boundary fails.
- Audit writer route hard-disabled check fails.
- Operator or reviewer is not assigned.
- Stop conditions are not accepted.
- Evidence policy is not accepted.
- No-submit/no-final-click pledges are not accepted.
- Any ambiguity exists around BankID, credentials, cookies/session, or final submit.
- Any uncertainty exists about whether the test could place an order.

Current blocker assessment for this approval-checklist task: no blockers found.

## 11. Approval Warnings

| Warning | Severity | Why not blocker | Required mitigation | Must monitor during future task? |
| --- | --- | --- | --- | --- |
| Legacy execution/handoff terms remain as technical identifiers | Low | Wording is normalized as locked/blocked/future-gated | Keep future docs explicit about no active execution | Yes |
| Local diagnostic names remain for migration-risk reasons | Low | Names do not grant write authority | Do not treat diagnostic records as Supabase execution writes | Yes |
| One isolated allowlisted `child_process` usage remains | Medium | Boundary tests cover the allowlist | Rerun import boundary tests before future approval | Yes |
| Legacy modal naming/import warnings remain | Medium | Feature flags/dev-tools checks keep the legacy surface non-executing | Consider structural hardening if confusion risk rises | Yes |
| No runtime smoke/browser verification has been performed | Medium | This task is intentionally no-execution | Future execution task must state this is the first runtime verification attempt | Yes |

## 12. Approval Decision

`first_gated_local_dev_smoke_approval_ready_with_warnings`

Recommended next task:

`Task 348 - Final pre-execution gate lock verification, no execution`

This stricter next task is preferred before any execution dry-run approval. It should verify every gate is still locked and every approval input is still valid. It must not run smoke, open runtime gates, launch browser automation, access credentials, handle cookies/session, touch BankID, submit orders, click final KOP/SALJ, write Supabase execution records, activate API routes, or change Trade UI execution behavior.

Only after that stricter verification should the project consider a separate task such as `Task 349 - First gated local-dev smoke execution dry-run approval, no live order`, and that later task may only open exactly the gates explicitly approved then.

## 13. Out Of Scope

- No local-dev smoke execution.
- No browser automation execution.
- No Avanza login.
- No BankID handling.
- No credential access.
- No cookie/session handling.
- No order-prep runtime.
- No final KOP/SALJ.
- No order submission.
- No Supabase execution write.
- No Trade UI execution.
- No API route activation.
- No production readiness.
