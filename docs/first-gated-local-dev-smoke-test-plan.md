# First Gated Local-Dev Smoke Test Plan

Date: 2026-07-07

## 1. Summary

Purpose: define the first future gated local-dev smoke test plan for the Sharp Semi Auto Execution login/order-prep flow.

Scope: plan-only. This document is concrete enough for a future separate approval task to decide whether a smoke test may be run. It does not run smoke, open gates, launch browser automation, access credentials, handle cookies/session, handle BankID, prepare a live order, submit an order, click final KOP/SALJ, write Supabase execution records, activate API routes, or change Trade UI execution behavior.

What this plan enables: a future approval checklist can evaluate exact scenarios, gates, stop conditions, evidence policy, operator/reviewer responsibilities, and pass/fail criteria.

What this plan does not do: it does not authorize execution. All runtime gates remain locked.

Plan decision: `first_gated_local_dev_smoke_test_plan_ready_with_warnings`

## 2. Test Objective

A future smoke test should prove only that the local-dev-only login/order-prep flow can be evaluated according to the runbook without crossing irreversible or sensitive boundaries.

The future smoke test must prove:

- Local-dev-only login/order-prep flow can be planned according to the runbook.
- Agent/order-prep never passes review/final confirmation.
- Final KOP/SALJ is never clicked by the agent.
- Order is never submitted.
- Credentials, cookies, and sessions are never logged or exported.
- BankID is never automated.
- Supabase execution writes do not occur.
- Evidence can be stored redacted and safely.

## 3. Explicit Non-Goals

- No actual smoke execution in this task.
- No browser automation in this task.
- No Avanza login in this task.
- No BankID handling.
- No credential access.
- No cookie/session access.
- No order-prep runtime.
- No order submission.
- No final KOP/SALJ click.
- No Supabase execution persistence.
- No Trade UI execution.
- No API route activation.
- No production readiness.

## 4. Required Prior Artifacts

| Artifact | Required before future smoke? | Status | Blocking concerns | Notes |
| --- | --- | --- | --- | --- |
| `docs/avanza-manual-local-dev-smoke-test-runbook.md` | Yes | Present | None for planning | Defines operator-first smoke behavior and abort expectations. |
| `docs/sharp-semi-auto-pre-smoke-readiness-review.md` | Yes | Present; `sharp_semi_auto_pre_smoke_readiness_ready_with_warnings` | No blockers; warnings tracked | Establishes this plan as the next allowed task. |
| `docs/sharp-semi-auto-execution-safety-audit.md` | Yes | Present; passed with warnings | No blockers | Safety warnings must stay visible in approval checklist. |
| `docs/legacy-execution-surface-audit.md` | Yes | Present; cleanup recommendations documented | No blockers | Confirms legacy surfaces are not active execution infrastructure. |
| `docs/execution-audit-writer-route-persistence-hardening-checkpoint.md` | Yes | Present; complete with warnings | No blockers | Confirms writer route is hard-disabled and Supabase writes remain locked. |
| `docs/execution-script-import-boundary-tests-checkpoint.md` | Yes | Present; complete with warnings | No blockers | Confirms restricted script import boundary coverage. |
| `docs/legacy-modal-isolation-checkpoint.md` | Yes | Present; complete with warnings | No blockers for plan-only | Legacy modal warnings remain optional hardening candidates before actual smoke. |
| `docs/avanza-local-dev-bridge-contract.md` | Yes | Present | No blockers for plan-only | Bridge remains disabled/contract-only until separately approved. |
| `docs/avanza-local-dev-bridge-readiness-checkpoint.md` | Yes | Present | No blockers for plan-only | Readiness checkpoint supports future gate review only. |
| `docs/avanza-disabled-local-dev-invocation-adapter-contract.md` | Yes | Present | No blockers for plan-only | Invocation adapter remains disabled. |
| `docs/avanza-invocation-adapter-design-checkpoint.md` | Yes | Present | No blockers for plan-only | Invocation boundary is ready for approval review, not runtime use. |

## 5. Proposed Future Smoke Scenarios

### Scenario A - Login Boundary Smoke, No Automation Of Credentials

Purpose: verify that the local-dev smoke path can reach the login boundary and stop or continue only under human-supervised, approved, manual credential rules.

Preconditions:

- Separate approval task has explicitly approved local-dev bridge, terminal runner, browser automation, evidence handling, and credential boundary for this scenario.
- Human operator is present.
- `.env.local` is reviewed locally but not exposed in logs or evidence.
- No production environment is used.
- No cookie/session export is allowed.

Operator actions:

- Confirm local-dev-only context.
- Observe every browser step.
- Enter any required credential manually only if the separate approval task allows it.
- Abort immediately if unsure about credential, MFA, BankID, session, or account-data exposure.

Agent/system allowed actions:

- Navigate only within the approved local-dev smoke path.
- Detect page state and stop conditions.
- Record redacted status logs.

Stop conditions:

- Credential prompt appears and the approval does not explicitly allow manual operator entry.
- MFA or BankID appears.
- Cookie/session export is requested.
- Sensitive account/person/session/auth data appears.
- Any unexpected route or runtime gate activates.

Evidence allowed:

- Scenario id, timestamp, gate states, redacted page-state summary, stop condition reached, operator sign-off.

Evidence forbidden:

- Credentials, BankID data, cookies, session tokens, browser storage, network dumps, account/customer ids, personal data, screenshots containing sensitive data.

Pass/fail criteria:

- Pass if the login boundary is reached and handled according to approved manual/no-automation rules without sensitive evidence leakage.
- Fail if credentials, cookies, sessions, BankID, or browser storage are automated, logged, exported, or captured.
- Blocked if the boundary cannot be reached without unsafe ambiguity.

### Scenario B - BUY Order-Prep Boundary Smoke, Stop At Review/Final Confirmation

Purpose: verify that a safe mocked/review-only BUY recommendation can be carried through order-prep only up to review/final confirmation or earlier.

Preconditions:

- Scenario A preconditions are satisfied as needed.
- Separate approval task explicitly approves BUY order-prep boundary smoke.
- Test input is a safe mocked/review-only recommendation contract.
- No live recommendation, account id, credential, cookie/session, or Supabase write is required.

Test input:

- Safe mocked/review-only recommendation contract with ticker, side `BUY`, quantity, order type, limit price if required, and redacted source id.

Operator actions:

- Confirm input is non-secret and review-only.
- Observe every browser step.
- Stop before any irreversible submit/final click.

Agent/system allowed actions:

- Use only approved local-dev order-prep steps.
- Fill or inspect fields only if separately approved for this future smoke.
- Stop at review/final confirmation or earlier.
- Record redacted field-level status.

Stop condition:

- Avanza review/final confirmation becomes visible.
- Any step before irreversible submit is reached where next action could submit.
- Any ambiguity exists about whether the next action submits the order.

Explicitly forbidden:

- No final KOP click.
- No order submit.
- No Supabase execution write.

Pass/fail criteria:

- Pass if BUY order-prep reaches the approved stop boundary without final click, submit, sensitive evidence, or Supabase write.
- Fail if the agent clicks final KOP, submits, captures sensitive data, or continues past the stop boundary.
- Blocked if the broker UI is ambiguous.

### Scenario C - SELL Order-Prep Boundary Smoke, Stop At Review/Final Confirmation

Purpose: verify that a safe mocked/review-only SELL live-position/exit contract can be carried through order-prep only up to review/final confirmation or earlier.

Preconditions:

- Scenario A preconditions are satisfied as needed.
- Separate approval task explicitly approves SELL order-prep boundary smoke.
- Test input is a safe mocked/review-only live position/exit contract.
- No account id, credential, cookie/session, or Supabase write is required.

Test input:

- Safe mocked/review-only live position/exit contract with ticker, side `SELL`, quantity, order type, limit price if required, and redacted source id.

Operator actions:

- Confirm input is non-secret and review-only.
- Observe every browser step.
- Stop before any irreversible submit/final click.

Agent/system allowed actions:

- Use only approved local-dev order-prep steps.
- Fill or inspect fields only if separately approved for this future smoke.
- Stop at review/final confirmation or earlier.
- Record redacted field-level status.

Stop condition:

- Avanza review/final confirmation becomes visible.
- Any step before irreversible submit is reached where next action could submit.
- Any ambiguity exists about whether the next action submits the order.

Explicitly forbidden:

- No final SALJ click.
- No order submit.
- No Supabase execution write.

Pass/fail criteria:

- Pass if SELL order-prep reaches the approved stop boundary without final click, submit, sensitive evidence, or Supabase write.
- Fail if the agent clicks final SALJ, submits, captures sensitive data, or continues past the stop boundary.
- Blocked if the broker UI is ambiguous.

### Scenario D - Abort/BankID Boundary Smoke

Purpose: verify that BankID, MFA, credential uncertainty, or sensitive prompt detection aborts the run safely.

If BankID/MFA/credential prompt appears:

- Manual-only if the separate approval task explicitly allows manual operator handling.
- Otherwise immediate abort.
- No automation.
- No screenshot or evidence containing sensitive prompt content.
- No cookie/session/browser storage access.

Pass/fail criteria:

- Pass if the run aborts immediately or hands control to the human operator exactly as approved, with no sensitive evidence captured.
- Fail if the agent automates BankID/MFA/credentials or captures sensitive data.
- Blocked if the operator cannot determine the prompt sensitivity safely.

## 6. Future Gate Requirements

| Gate | Current state | Required future approval | Who/what must approve | Evidence required before opening | Evidence required after closing | Must remain closed in this task |
| --- | --- | --- | --- | --- | --- | --- |
| Local-dev bridge gate | Locked | Explicit local-dev bridge approval | Human operator and reviewer | Scope, local-dev environment proof, rollback/close plan | Gate closed record and redacted result | Yes |
| Smoke runner invocation | Locked | Explicit smoke runner approval | Human operator and reviewer | Scenario id, command dry-run text, no-submit pledge | Exit status, stop condition, no-submit confirmation | Yes |
| Terminal script invocation | Locked | Explicit terminal-only invocation approval | Human operator and reviewer | Exact command, env review, no secrets in command | Redacted output and gate closure | Yes |
| Browser automation, local-dev-only | Locked | Explicit local-dev browser approval | Human operator and reviewer | Browser scope, stop conditions, evidence rules | Browser closed, no storage export, redacted evidence | Yes |
| Credential boundary, manual-only/no logging | Locked | Explicit manual credential boundary approval | Human operator only, reviewer records decision | Manual entry policy, no logging policy | Confirmation no credentials logged/stored | Yes |
| BankID boundary, manual-only/no automation or abort | Blocked | Explicit manual-only or abort decision | Human operator | BankID policy selected before run | Confirmation no automation and no sensitive evidence | Yes |
| Evidence handling gate | Locked | Explicit evidence policy approval | Reviewer | Redaction rules and storage destination | Evidence review and deletion/redaction status | Yes |
| No-submit gate | Locked | Must be affirmed, not opened | Human operator and reviewer | Stop-before-submit pledge | No order submitted confirmation | Yes |
| No-final-click gate | Locked | Must be affirmed, not opened | Human operator and reviewer | No final KOP/SALJ pledge | No final click confirmation | Yes |
| Supabase write lock confirmation | Locked | Must remain locked | Reviewer | Confirm no write gate/flag enabled | Confirm no execution write | Yes |
| Trade UI no-execution confirmation | Locked | Must remain locked | Reviewer | Confirm no new Trade UI execution path | Confirm Trade UI unchanged for smoke | Yes |
| API route activation | Blocked | Must remain blocked | Reviewer | Confirm disabled route remains disabled | Confirm no route activation | Yes |

## 7. Future Env Flag Plan

This task does not change `.env.local` and does not add runtime config. Future approval tasks may define placeholder flags, but all must default false and be local-dev-only where relevant.

Placeholder flag types:

- `ENABLE_LOCAL_DEV_SMOKE_TEST=false`
- `ENABLE_AVANZA_LOCAL_DEV_BRIDGE=false`
- `ENABLE_BROWSER_ORDER_PREP_DRY_RUN=false`
- `ENABLE_ORDER_SUBMISSION=false`
- `ENABLE_FINAL_BUY_SELL_CLICK=false`
- `ENABLE_BANKID_AUTOMATION=false`
- `ENABLE_COOKIE_SESSION_EXPORT=false`
- `ENABLE_SUPABASE_EXECUTION_WRITES=false`

Rules:

- Default false.
- Local-dev-only where relevant.
- No production.
- No secrets in docs.
- No runtime activation in this task.
- If actual flags already exist, document them without changing `.env.local` and without activating anything.

Observed existing false-guarded Trade UI flags from prior checkpoints:

- `ENABLE_READ_ONLY_SELECTED_RECOMMENDATION_PREVIEW = false`
- `ENABLE_PASSIVE_TRADE_CARD_EXECUTION_READINESS_BADGE = false`

## 8. Future Command Plan

No command in this section may be run in this task. All commands are future placeholders and require a separate approval task.

Future command principles:

- Dry-run where possible.
- No-submit.
- Stop-at-review.
- Local-dev-only.
- Redacted logs.
- No secrets in command text or output.
- No cookie/session export.
- Must stop before final KOP/SALJ.
- Must not submit orders.

Example placeholder shape:

```bash
# Do not run in this task.
# Requires separate approval task.
# Must stop before final KOP/SALJ.
# Must not submit orders.
npm run avanza:local-dev-smoke -- --scenario=<scenario-id> --local-dev-only --dry-run --no-submit --stop-at-review --redacted-logs
```

## 9. Stop Conditions

Absolute stop conditions:

- BankID prompt appears.
- Credential entry is required outside explicit manual approval.
- MFA is required.
- Cookie/session export is requested.
- Browser storage access is detected.
- Avanza final KOP/SALJ confirmation is visible.
- Any submit/final action would be next.
- Unexpected navigation to live order execution occurs.
- Attempt to write Supabase execution data occurs.
- API route/bridge gate is unexpectedly active.
- Unredacted sensitive data appears in logs.
- Any uncertainty exists about whether the next step submits an order.
- Evidence artifact risks exposing account/person/session/auth data.

## 10. Evidence Policy

Allowed evidence:

- Redacted text logs.
- Test scenario id.
- Timestamp.
- Gate state before/after.
- Stop condition reached.
- Safe contract/plan summary.
- Human operator sign-off.
- Reviewer sign-off.
- Screenshots only if fully redacted and without sensitive data.

Forbidden evidence:

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

## 11. Operator/Reviewer Checklist

Before:

- Confirm local-dev only.
- Confirm no production environment.
- Confirm all relevant gates are explicitly approved in a separate task.
- Confirm `.env.local` is reviewed locally but not exposed.
- Confirm no secrets in logs.
- Confirm runbook is open.
- Confirm stop conditions are understood.
- Confirm no-submit/no-final-click pledge.

During:

- Operator observes every step.
- Stop at review/final confirmation.
- Abort on BankID/MFA/credential uncertainty.
- Do not capture sensitive evidence.
- Do not allow final KOP/SALJ.
- Do not allow submit.

After:

- Confirm no order submitted.
- Confirm no final KOP/SALJ clicked.
- Confirm no Supabase write.
- Confirm no credentials/cookies/session logged.
- Confirm evidence redacted.
- Confirm gates returned to locked.
- Document pass/fail/blocked.

## 12. Pass/Fail/Blocked Criteria

Pass:

- Stop condition was reached correctly.
- No order was submitted.
- Agent never clicked final KOP/SALJ.
- Sensitive boundaries were respected.
- Supabase writes remained locked.
- Evidence is redacted.
- Gates returned to locked.

Pass with warnings:

- Core safety requirements passed, but non-sensitive ambiguity or documentation follow-up remains.
- Warnings are recorded with owner and follow-up.

Blocked:

- The scenario cannot proceed safely because of BankID/MFA/credential uncertainty, broker UI ambiguity, missing approval, missing operator, missing evidence policy, or gate uncertainty.

Failed:

- Any final KOP/SALJ click occurred.
- Any order was submitted.
- Any sensitive data was logged/exported/captured.
- Any Supabase execution write occurred.
- Any runtime gate opened without explicit separate approval.

## 13. Risk Review

| Risk | Severity | Mitigation | Stop condition | Future follow-up |
| --- | --- | --- | --- | --- |
| Broker UI ambiguity | High | Human operator observes every step and stop-before-submit rule is absolute | Any uncertainty about whether next step submits | Add screenshot-free/redacted page-state examples if safe. |
| BankID/MFA prompt | High | Manual-only or immediate abort policy selected before run | BankID/MFA appears | Add explicit operator script for abort/manual-only branch. |
| Accidental final click | Critical | No-final-click gate and stop at review/final confirmation | Any final action would be next | Require operator verbal confirmation in future approval checklist. |
| Sensitive screenshot/log capture | High | Redaction policy and screenshot-minimization | Evidence risks exposing sensitive data | Prefer text-only redacted evidence. |
| Misconfigured env flags | High | All flags default false and local-dev-only; gate state before/after captured | Any unexpected active gate/flag | Add pre-run flag dump with secrets redacted. |
| Legacy modal confusion | Medium | Legacy modal remains warning-class and optional hardening candidate | Operator cannot distinguish legacy/dev-only surface | Consider structural dev-only modal boundary hardening before execution. |
| Script/import boundary regression | Medium | Run boundary tests before approval | Restricted script import appears in runtime | Fix boundary tests/imports before smoke. |
| Supabase write regression | High | Audit writer route remains hard-disabled and write lock confirmed | Any write attempt or route activation | Block smoke until route/write lock is proven closed. |
| Operator misunderstanding | High | Checklist requires runbook open and no-submit/no-final-click pledge | Operator cannot restate stop conditions | Do not run; revise checklist. |

## 14. Next Allowed Task

Recommended next task if this plan is accepted:

`Task 347 - First gated local-dev smoke approval checklist, no execution`

Task 347 must still be approval-checklist/gate-decision only. It must not run the smoke test, open runtime gates, launch browser automation, access credentials, handle cookies/session, touch BankID, submit orders, click final KOP/SALJ, write Supabase execution records, activate API routes, or change Trade UI execution behavior.

If this plan is considered blocked, the next task should fix the blocking concern before any approval checklist is created.

## 15. Out Of Scope

- No local-dev smoke execution.
- No browser automation.
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

## 16. Final Decision

`first_gated_local_dev_smoke_test_plan_ready_with_warnings`

This plan is ready for a future approval-checklist task. The warnings from the pre-smoke readiness review remain relevant but do not block plan-only progress. No runtime execution is authorized by this document.
