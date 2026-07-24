# First Controlled Local-Dev Smoke Dry-Run Package

Date: 2026-07-07

## 1. Summary

Purpose: provide a complete, reviewable package for a future first controlled local-dev smoke dry-run of the Sharp Semi Auto Execution login/order-prep flow.

Scope: package-only. This package is concrete enough for a future separate execution-authorization task to review, but it does not execute anything.

What this package enables: a future reviewer can inspect scenario order, scenario cards, gate snapshots, environment review expectations, command placeholders, operator/reviewer checklists, stop conditions, evidence/abort/result templates, post-run lock verification, risks, and package blockers.

What this package does not do: it does not run smoke, open gates, start browser automation, access credentials, handle cookies/session, handle BankID, prepare runtime orders, submit orders, click final KOP/SALJ, write Supabase execution records, activate API routes, or change Trade UI execution behavior.

Package decision: `first_controlled_local_dev_smoke_dry_run_package_ready_with_warnings`

## 2. Package Contents Checklist

- [x] Scenario order.
- [x] Required artifacts.
- [x] Gate snapshot template.
- [x] Env review template.
- [x] Command placeholders.
- [x] Operator checklist.
- [x] Reviewer checklist.
- [x] Stop condition sheet.
- [x] Evidence template.
- [x] Abort log template.
- [x] Result report template.
- [x] Post-run lock verification template.
- [x] Risk register.
- [x] Package blockers.

## 3. Required Artifacts

| Path | Required for future dry-run? | Decision | Warning impact | Blocker status |
| --- | --- | --- | --- | --- |
| `docs/avanza-manual-local-dev-smoke-test-runbook.md` | Yes | Runbook present | No runtime smoke/browser verification yet | Not blocked |
| `docs/sharp-semi-auto-pre-smoke-readiness-review.md` | Yes | `sharp_semi_auto_pre_smoke_readiness_ready_with_warnings` | Warnings carried forward | Not blocked |
| `docs/first-gated-local-dev-smoke-test-plan.md` | Yes | `first_gated_local_dev_smoke_test_plan_ready_with_warnings` | Warnings carried forward | Not blocked |
| `docs/first-gated-local-dev-smoke-approval-checklist.md` | Yes | `first_gated_local_dev_smoke_approval_ready_with_warnings` | Warnings carried forward | Not blocked |
| `docs/final-pre-execution-gate-lock-verification.md` | Yes | `final_pre_execution_gate_lock_verification_passed_with_warnings` | Warnings carried forward | Not blocked |
| `docs/sharp-semi-auto-execution-safety-audit.md` | Yes | `sharp_semi_auto_execution_safety_audit_passed_with_warnings` | Legacy warning-class findings remain tracked | Not blocked |
| `docs/execution-script-import-boundary-tests-checkpoint.md` | Yes | `execution_script_import_boundary_tests_complete_with_warnings` | One isolated allowlisted `child_process` use remains | Not blocked if boundary tests pass |
| `docs/execution-audit-writer-route-persistence-hardening-checkpoint.md` | Yes | `execution_audit_writer_route_persistence_hardening_complete_with_warnings` | Route/writer names remain but hard-disabled | Not blocked if hard-disable tests pass |
| `docs/legacy-modal-isolation-checkpoint.md` | Yes | `legacy_modal_isolation_checkpoint_complete_with_warnings` | Legacy modal naming/import warnings remain | Not blocked |

## 4. Scenario Order

Recommended future scenario order:

1. Scenario D - Abort/BankID boundary smoke.
2. Scenario A - Login boundary smoke, no credential automation.
3. Scenario B - BUY order-prep boundary smoke, stop at review/final confirmation.
4. Scenario C - SELL order-prep boundary smoke, stop at review/final confirmation.

Rationale:

- Abort/BankID comes first to prove stop/abort policy before any sensitive flow.
- Login boundary comes before order-prep.
- BUY comes before SELL because mocked/review-only recommendation input is expected to be simpler.
- SELL is last because live-position/exit context may be more complex.

Rules:

- Scenarios are not run in this task.
- Future execution requires separate approval.
- Any scenario may be skipped if risk is unclear.
- Any uncertainty means abort.

## 5. Scenario Cards

### Scenario D - Abort/BankID Boundary Smoke

Scenario ID: `scenario_d_abort_bankid_boundary`

Name: Abort/BankID boundary smoke.

Objective: verify abort policy before any sensitive flow.

Preconditions:

- Separate future approval exists.
- Operator and reviewer are present.
- Stop conditions are acknowledged.
- No BankID automation is allowed.

Required gate state before:

- All gates locked/blocked except any gate explicitly approved in the future task.
- BankID automation blocked.
- Credential/cookie/session handling locked.
- Order submission and final KOP/SALJ blocked.

Allowed operator actions:

- Observe every step.
- Abort immediately on BankID/MFA/credential uncertainty.
- Record redacted stop reason only.

Allowed system/agent actions:

- Detect prompt/boundary state.
- Stop and report redacted status.

Forbidden actions:

- Automating BankID.
- Capturing BankID evidence.
- Capturing credentials, cookies, sessions, browser storage, or account data.
- Continuing past uncertainty.

Stop condition:

- BankID/MFA/credential uncertainty appears.

Evidence allowed:

- Redacted scenario id, timestamp, stop reason, gate state, operator/reviewer sign-off.

Evidence forbidden:

- BankID data, credentials, screenshots containing sensitive prompts, cookies/session/browser storage.

Pass criteria:

- Abort/manual-only policy is followed exactly and no sensitive evidence is retained.

Fail criteria:

- BankID/MFA/credentials are automated or captured.

Block criteria:

- Operator/reviewer cannot classify the prompt safely.

Abort criteria:

- Any sensitive prompt appears unexpectedly.

Post-scenario lock verification:

- All gates locked/blocked.
- No sensitive evidence retained.
- No order path reached.

### Scenario A - Login Boundary Smoke

Scenario ID: `scenario_a_login_boundary`

Name: Login boundary smoke, no credential automation.

Objective: verify login boundary can be approached only under manual operator control.

Preconditions:

- Separate future approval exists.
- Operator and reviewer are present.
- Credential boundary policy is manual-only/no logging.
- Cookie/session export is forbidden.

Required gate state before:

- Browser/local-dev gates locked unless explicitly approved in the future task.
- Credential access locked/manual-only/no logging.
- Cookies/session locked/no export.

Allowed operator actions:

- Observe every step.
- Manually decide whether to continue or abort within future approval scope.
- Abort on credential/MFA/BankID uncertainty.

Allowed system/agent actions:

- Navigate only within explicitly approved local-dev flow.
- Detect login boundary and stop conditions.
- Record redacted page-state summary.

Forbidden actions:

- Credential automation.
- Credential logging.
- Cookie/session export.
- BankID automation.

Stop condition:

- Credential, MFA, BankID, cookie/session, or account-data uncertainty appears.

Evidence allowed:

- Redacted status, scenario id, timestamp, gate state before/after.

Evidence forbidden:

- Credentials, cookies/session, browser storage, personal/account data, sensitive screenshots.

Pass criteria:

- Login boundary is reached and handled without automation or sensitive evidence leakage.

Fail criteria:

- Any credential/cookie/session/BankID boundary is crossed.

Block criteria:

- The boundary cannot be approached without sensitive ambiguity.

Abort criteria:

- Any uncertainty around credentials/MFA/BankID/session.

Post-scenario lock verification:

- Credential/session/browser gates locked or closed.
- No sensitive evidence retained.

### Scenario B - BUY Order-Prep Boundary Smoke

Scenario ID: `scenario_b_buy_order_prep_boundary`

Name: BUY order-prep boundary smoke.

Objective: verify future BUY order-prep can stop at review/final confirmation.

Preconditions:

- Separate future approval exists.
- Safe mocked/review-only recommendation contract is selected.
- No real order intent exists.
- No-submit/no-final-click pledge is acknowledged.

Required gate state before:

- Order submission blocked.
- Final KOP/SALJ by agent blocked.
- Supabase writes locked.
- API route activation blocked.

Allowed operator actions:

- Observe every step.
- Confirm stop at review/final confirmation or earlier.
- Abort on ambiguity.

Allowed system/agent actions:

- Use only explicitly approved local-dev order-prep steps.
- Stop before irreversible action.
- Record redacted field-level summary.

Forbidden actions:

- Final KOP click.
- Order submit.
- Supabase execution write.
- Sensitive evidence capture.

Stop condition:

- Review/final confirmation appears or any submit/final action would be next.

Evidence allowed:

- Redacted safe contract reference, stop boundary reached, gate state, no-submit confirmation.

Evidence forbidden:

- Account/customer ids, sensitive confirmation ids, credentials, cookies/session, raw storage.

Pass criteria:

- BUY prep reaches approved boundary with no final click, submit, or sensitive evidence.

Fail criteria:

- Final KOP click, submit, Supabase write, or sensitive capture occurs.

Block criteria:

- Broker UI ambiguity makes the next action unclear.

Abort criteria:

- Any uncertainty about whether next action submits.

Post-scenario lock verification:

- No order submitted.
- No final KOP clicked.
- Supabase writes locked.
- All gates locked/blocked.

### Scenario C - SELL Order-Prep Boundary Smoke

Scenario ID: `scenario_c_sell_order_prep_boundary`

Name: SELL order-prep boundary smoke.

Objective: verify future SELL order-prep can stop at review/final confirmation.

Preconditions:

- Separate future approval exists.
- Safe mocked/review-only live position/exit contract is selected.
- No real order intent exists.
- No-submit/no-final-click pledge is acknowledged.

Required gate state before:

- Order submission blocked.
- Final KOP/SALJ by agent blocked.
- Supabase writes locked.
- API route activation blocked.

Allowed operator actions:

- Observe every step.
- Confirm stop at review/final confirmation or earlier.
- Abort on ambiguity.

Allowed system/agent actions:

- Use only explicitly approved local-dev order-prep steps.
- Stop before irreversible action.
- Record redacted field-level summary.

Forbidden actions:

- Final SALJ click.
- Order submit.
- Supabase execution write.
- Sensitive evidence capture.

Stop condition:

- Review/final confirmation appears or any submit/final action would be next.

Evidence allowed:

- Redacted safe contract reference, stop boundary reached, gate state, no-submit confirmation.

Evidence forbidden:

- Account/customer ids, sensitive confirmation ids, credentials, cookies/session, raw storage.

Pass criteria:

- SELL prep reaches approved boundary with no final click, submit, or sensitive evidence.

Fail criteria:

- Final SALJ click, submit, Supabase write, or sensitive capture occurs.

Block criteria:

- Broker UI ambiguity makes the next action unclear.

Abort criteria:

- Any uncertainty about whether next action submits.

Post-scenario lock verification:

- No order submitted.
- No final SALJ clicked.
- Supabase writes locked.
- All gates locked/blocked.

## 6. Gate Snapshot Template

Before:

| Gate | Required state before future dry-run |
| --- | --- |
| Invocation boundary | Locked |
| Local-dev bridge gate | Locked unless explicitly approved in future task |
| Smoke runner invocation | Locked unless explicitly approved in future task |
| Terminal script invocation | Locked unless explicitly approved in future task |
| Browser automation | Locked unless explicitly approved in future task |
| Credential access | Locked/manual-only/no logging |
| Cookies/session | Locked/no export |
| BankID automation | Forbidden |
| Order submission | Forbidden |
| Final KOP/SALJ by agent | Forbidden |
| Supabase writes | Locked |
| Trade UI execution | Locked |
| API route activation | Blocked |
| Production readiness | Blocked |

After:

- All gates returned to locked/blocked.
- No order submitted.
- No final KOP/SALJ clicked.
- No Supabase execution write.
- No sensitive evidence retained.

## 7. Env Review Template

Env review rules:

- `.env.local` must not be committed.
- No secrets in docs/logs.
- No values printed.
- Future operator may verify key presence/absence manually.
- Forbidden flags must not be true.
- Do not modify `.env.local` in this task.
- Do not document env values.

Forbidden or must-remain-false flags:

- `ENABLE_ORDER_SUBMISSION`
- `ENABLE_FINAL_BUY_SELL_CLICK`
- `ENABLE_BANKID_AUTOMATION`
- `ENABLE_COOKIE_SESSION_EXPORT`
- `ENABLE_SUPABASE_EXECUTION_WRITES`
- Production readiness flags.
- Any unknown execution enablement flag.

Future-gated flags that may only be true in a separate approved dry-run task if explicitly allowed:

- `ENABLE_LOCAL_DEV_SMOKE_TEST`
- `ENABLE_AVANZA_LOCAL_DEV_BRIDGE`
- `ENABLE_BROWSER_ORDER_PREP_DRY_RUN`

## 8. Command Placeholders

No command in this section may be run in this task.

| Command ID | Purpose | Current status | Required future gate | Required flags | Required stop mode | Required evidence policy | Forbidden effects |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `cmd_local_dev_bridge_preflight` | Verify bridge preflight only | Placeholder only | Local-dev bridge gate | Future-gated local-dev bridge flag only if approved | No-submit, no-final-click | Redacted-only | No bridge beyond approved preflight; no credentials/cookies/session. |
| `cmd_login_boundary_dry_run` | Future login boundary dry-run | Placeholder only | Browser, terminal, credential boundary gates | Future-gated smoke/browser flags only if approved | Abort on credential/MFA/BankID uncertainty | Redacted-only | No credential automation, no cookie/session export. |
| `cmd_buy_order_prep_dry_run` | Future BUY order-prep dry-run | Placeholder only | Browser/order-prep gates | Future-gated smoke/browser flags only if approved | Stop-at-review | Redacted-only | No final KOP, no submit, no Supabase write. |
| `cmd_sell_order_prep_dry_run` | Future SELL order-prep dry-run | Placeholder only | Browser/order-prep gates | Future-gated smoke/browser flags only if approved | Stop-at-review | Redacted-only | No final SALJ, no submit, no Supabase write. |
| `cmd_post_run_gate_lock_verification` | Future post-run lock check | Placeholder only | Verification gate | No runtime enablement needed | Verify closed/locked | Redacted-only | No runtime action, no sensitive data. |

Every future command must be dry-run/no-submit, stop at review, must not automate BankID, must not export cookies/session, must not click final KOP/SALJ, must not submit order, and must not write Supabase execution records.

## 9. Operator Checklist

Before:

- Read runbook.
- Read approval checklist.
- Confirm local-dev only.
- Confirm no production account/test if possible.
- Confirm no-final-click/no-submit pledge.
- Confirm abort authority.
- Confirm redaction policy.
- Confirm stop conditions.

During:

- Keep human eyes on every step.
- Do not enter credentials into automated flows.
- Do not allow BankID automation.
- Stop at review/final confirmation.
- Abort on uncertainty.
- Record only redacted evidence.

After:

- Confirm no order submitted.
- Confirm no final KOP/SALJ clicked.
- Confirm no Supabase write.
- Confirm no cookies/session exported.
- Confirm no credentials logged.
- Confirm all gates locked.
- Complete result report.

## 10. Reviewer Checklist

Reviewer must:

- Verify scenario preconditions.
- Verify gates before.
- Verify command is approved.
- Verify evidence policy.
- Observe stop condition.
- Confirm no-submit/no-final-click.
- Verify gates after.
- Approve or reject result report.
- Require abort if anything is unclear.

## 11. Stop Condition Sheet

Immediate abort if:

- BankID prompt appears unexpectedly.
- Credential entry required in an automated context.
- MFA required unexpectedly.
- Cookie/session export requested.
- Browser storage access detected.
- Avanza final KOP/SALJ confirmation visible.
- Any submit/final action would be next.
- Any unexpected navigation to live order execution.
- Any attempt to write Supabase execution data.
- Any API route/bridge gate unexpectedly active.
- Any unredacted sensitive data appears in logs.
- Any uncertainty about whether the next step submits an order.
- Any evidence artifact risks exposing account/person/session/auth data.

## 12. Evidence Template

- Scenario ID:
- Timestamp:
- Operator:
- Reviewer:
- Gate state before:
- Gate state after:
- Safe input contract reference:
- Stop condition reached:
- Result: pass / pass with warnings / failed / blocked / aborted
- Redacted logs attached: yes/no
- Screenshots attached: yes/no, must be fully redacted
- Sensitive data captured: must be no
- No-submit confirmation:
- No-final-click confirmation:
- Supabase-write-lock confirmation:
- Notes:

## 13. Abort Log Template

- Abort ID:
- Scenario:
- Timestamp:
- Trigger:
- Operator action:
- Reviewer action:
- Evidence retained:
- Sensitive data risk:
- Gates after abort:
- Follow-up required:
- Final abort decision:

## 14. Result Report Template

- Run package version:
- Scenario(s) attempted:
- Scenario(s) skipped:
- Overall result:
- Pass/fail/block/abort summary:
- Evidence summary:
- Gate before/after summary:
- No-submit/no-final-click confirmation:
- Sensitive boundary confirmation:
- Supabase write confirmation:
- Follow-up tasks:
- Reviewer sign-off:

## 15. Post-Run Lock Verification Template

- `.env.local` unchanged or restored.
- `app/trade-app.tsx` unchanged.
- No API route activation left on.
- No browser automation still running.
- No bridge process still running.
- No smoke runner still running.
- No credentials/cookies/session artifacts retained.
- No Supabase writes.
- Boundary tests pass.
- Typecheck/lint pass.
- Docs/result report saved redacted only.

## 16. Risk Register

| Risk | Severity | Mitigation | Stop condition | Evidence rule | Future follow-up |
| --- | --- | --- | --- | --- | --- |
| Accidental final click | Critical | No-final-click gate, operator observation, stop at review/final confirmation | Any final action would be next | Redacted boundary reached only | Add operator verbal confirmation if future task proceeds. |
| Broker UI ambiguity | High | Abort on uncertainty | Any uncertainty about submit/final action | Redacted uncertainty reason | Add safe page-state examples if possible. |
| BankID/MFA prompt | High | Manual-only or abort policy | BankID/MFA appears | No sensitive prompt evidence | Refine abort script. |
| Credential leakage | High | Manual-only/no logging boundary | Credential entry required in automated context | No credential evidence | Verify logs before result sign-off. |
| Cookie/session leakage | High | No export, no storage access | Cookie/session export requested | No cookie/session evidence | Verify no artifacts retained. |
| Screenshot sensitive data | High | Prefer text-only redacted evidence | Sensitive data visible | Do not retain screenshot | Use redacted summaries. |
| Supabase write regression | High | Audit writer remains hard-disabled | Any write attempt | Redacted failure summary only | Block until route/write lock is restored. |
| API route accidental activation | High | Route hard-disable checks | Any API route gate active | Redacted route state | Block until disabled. |
| Script import regression | Medium | Boundary tests | Runtime imports restricted script | Test output only | Fix import boundary before future task. |
| Legacy modal confusion | Medium | Keep legacy warnings visible | Operator cannot distinguish legacy/dev-only surface | Redacted confusion note | Consider structural hardening. |
| Operator fatigue/misread | Medium | Checklist and reviewer stop authority | Operator cannot restate stop conditions | Redacted blocked reason | Pause and reschedule. |
| Live account risk | High | Local-dev-only, no real order intent | Live/production context detected | Redacted environment state | Abort and re-scope. |

## 17. Package Blockers

This package or any future execution authorization is blocked if any of the following is true:

- Required artifact missing.
- Prior blocker discovered.
- Gate not locked.
- Forbidden env flag true.
- Boundary tests failing.
- Typecheck/lint failing.
- Trade UI execution path detected.
- API route activation detected.
- Smoke script import detected.
- Browser automation path active.
- Credential/cookie/session handling active.
- BankID automation path active.
- Order submission path active.
- Final KOP/SALJ click path active.
- Supabase execution write path active.
- Evidence policy incomplete.
- Operator/reviewer checklist incomplete.
- Stop conditions incomplete.

Current package blocker assessment: no blockers found after validation.

## 18. Validation And Static Search Classification

Validation results:

| Command | Result | Notes |
| --- | --- | --- |
| `PLAYWRIGHT_SKIP_WEB_SERVER=true npx playwright test tests/e2e/execution-script-import-boundary.spec.ts tests/e2e/execution-record-audit-writer-route-boundary.spec.ts tests/e2e/execution-record-audit-writer-route-auth-hardening.spec.ts --reporter=line` | Passed on 2026-07-07; 27 passed | Boundary coverage only; not a smoke test. |
| `./node_modules/.bin/tsc --noEmit` | Passed on 2026-07-07 | Compile only. |
| `npm run lint` | Passed on 2026-07-07 | Lint only. |
| `git diff --check` | Passed on 2026-07-07 | Whitespace/conflict marker hygiene. |
| `git diff -- .env.local --exit-code` | Passed on 2026-07-07 | `.env.local` unchanged; values were not printed. |
| `git diff -- app/trade-app.tsx --exit-code` | Passed on 2026-07-07 | Trade UI unchanged. |
| `find docs -type f -size 0` | Passed on 2026-07-07 | No empty docs files reported. |

Static search command:

```bash
rg -l "dry-run|smoke|bridge|invocation|browser|credential|cookie|session|BankID|submit|submitted|KOP|SALJ|KÖP|SÄLJ|Supabase|production readiness|Trade UI execution|API route activation|final click|no-submit|stop-at-review|ENABLE_" docs app lib scripts tests | cut -d/ -f1 | sort | uniq -c
```

Observed path-count summary:

- `docs`: 932 files.
- `lib`: 420 files.
- `tests`: 136 files.
- `app`: 22 files.
- `scripts`: 8 files.

Classification:

- Docs-only hits: expected for planning, approval, verification, runbook, safety, and checkpoint material.
- Tests-only hits: expected for boundary and safety assertions.
- Locked/blocked hits: expected for disabled bridge/invocation/browser/credential/session/order/Supabase states.
- Allowlisted hits: expected for known isolated script/process references covered by boundary tests.
- Future-gated hits: expected for local-dev smoke package text and prior approval/verification docs.
- App hits: expected pre-existing Settings diagnostics and `app/trade-app.tsx` false flags; `app/trade-app.tsx` was unchanged.
- Script hits: expected local-dev/mock/diagnostic scripts; no script was run or imported by this task.
- Blocker hits: none found in this validation pass.

## 19. Final Decision

`first_controlled_local_dev_smoke_dry_run_package_ready_with_warnings`

Recommended next task:

`Task 350 - Dry-run package review sign-off, no execution`

This stricter next task is preferred before any controlled execution authorization. If a later Task 351 considers actual dry-run execution, it must be separate and may only authorize an exactly bounded dry-run if all no-submit, no-final-click, sensitive-boundary, local-dev-only, human-operated, redacted-evidence, and gate-lock conditions are satisfied.

## 20. Out Of Scope

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
