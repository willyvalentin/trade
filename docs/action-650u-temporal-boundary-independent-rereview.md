# Action 650U — Temporal boundary remediation and independent re-review

## Decision

Action 650U is approved for a separate local checkpoint. Both Action 650T major
findings are closed, the independent re-review passed `10/10`, all focused
security suites are green, base/successor baseline equivalence is preserved,
and the successor has no new live or write capability.

No commit, push, pull request, live execution, transport, credential, browser,
Avanza, database, process, or deployment action was performed.

## Historical evidence preservation

The seven Action 650S predecessor paths remain byte-identical at combined
SHA-256:

```text
328a41a7015dfd6dd13bd5a338edd2ff244a151834d7c1123d3490d3f683589c
```

The Action 650T freeze manifest, independent review, and review test also retain
their original SHA-256 values. They were not rewritten. The Action 650U
implementation is additive.

## Successor refreeze

The six normative Action 650U paths are frozen at:

```text
80623a9d0d5a11fdea67c89875b1fd2eb60e62e6259ecabb47c610f77c9f5935
```

The refreeze manifest is
`docs/action-650u-temporal-boundary-successor-refreeze-manifest.json`.
This report and
`tests/e2e/action-650u-independent-rereview.spec.ts` are explicitly
self-excluded review artifacts.

The successor policy version is
`action_650u_temporal_confirmation_policy_v1`.

## Closed findings

### 650T-M1 — closed

The policy now enforces the exclusive upper bound:

```text
confirmation_at < session_expires_at
```

Verified at nanosecond precision:

```text
expires_at - 1 ns: accepted
expires_at: rejected as manual_confirmation_session_expired
expires_at + 1 ns: rejected as manual_confirmation_session_expired
```

Consumption at the exact expiry instant is also rejected and does not consume
the one-shot capability.

### 650T-M2 — closed

The policy derives the waiting boundary from the provenance-bound preparation
lifecycle and enforces:

```text
current lifecycle state == waiting_for_manual_confirmation
confirmation_at >= waiting_for_manual_confirmation_at
```

Verified at nanosecond precision:

```text
waiting_at - 1 ns: rejected as manual_confirmation_before_waiting_boundary
waiting_at: accepted
waiting_at + 1 ns: accepted
```

A non-waiting state is rejected as
`manual_confirmation_lifecycle_state_mismatch`. Missing or malformed waiting
timestamps are rejected as
`manual_confirmation_waiting_timestamp_invalid`.

The predecessor session-start lower bound is also preserved with
`manual_confirmation_session_not_started`.

## Digest and identity binding

The temporal policy version, waiting instant, session bounds, confirmation
instant, and proven execution identities are bound through:

- the confirmation request projection and its digest;
- the manual-confirmation capability and its digest;
- the consumption projection and receipt digests;
- replay identity;
- temporal audit evidence and result evidence;
- independent digest rebuild functions.

The authority method accepts only the three caller fields `confirmed_at`,
`confirming_actor_class`, and `session_identity`. Caller-supplied derived
temporal validity or policy fields are rejected. A cloned and
self-consistently rehashed temporal substitution remains incapable of crossing
runtime provenance.

## Preserved security boundaries

The re-review confirmed:

- one-shot consumption and non-consuming rejected attempts;
- runtime provenance;
- execution, lifecycle, handoff, payload, session, idempotency, and correlation
  binding;
- exact duplicate terminal idempotency;
- conflicting terminal routing to needs-review;
- cross-execution result rejection;
- broker progress/result denial before confirmation;
- automatic-mode rejection;
- deterministic reverse-order and timezone-equivalent evaluation;
- no dynamic import route;
- no CDP, browser automation, Avanza live-fill, credential, cookie, BankID,
  Supabase write, database persistence, localhost transport, process spawning,
  automatic execution, or real trade/position mutation reachability.

## Baseline reconciliation

The broad base and final successor selections each ran the same `3,464` tests:

```text
base:      3451 passed, 13 failed
successor: 3451 passed, 13 failed
```

Failure identity, order, and normalized error text are identical. All 13
failures remain `baseline_identical_out_of_scope`; there are zero successor
regressions, interaction risks, or unresolved failures.

The restricted live-fill comparison also remains identical:

```text
base:      22 passed, 5 failed
successor: 22 passed, 5 failed
```

The five failures are the same historical child-process allowlist and CDP-runner
source assertions documented by Action 650T. The Action 650U import graph reaches
none of those surfaces.

`action_650s_full_execution_regression_passed` therefore remains `false`.

## Verification

- Combined Action 650S/650U focused suites: `56/56 passed`.
- Additive 650T threat-suite successor: `7/7 passed`, included above.
- Independent Action 650U re-review: `10/10 passed`.
- Actions 519–533: `1,802/1,802 passed`.
- Broad base/successor: identical `3,451/3,464`.
- Restricted base/successor: identical `22/27`.
- TypeScript: passed before and after re-review.
- Scoped ESLint with zero warnings: passed.
- Production build: passed with non-secret public placeholders.
- `git diff --check` and untracked whitespace checks: passed.
- Static security, import, and capability scans: passed.
- Predecessor and successor byte parity: passed.

## Findings

```text
blocker:0
major:0
minor:0
nit:0
```

## Required flags

```text
action_650u_expiry_boundary_remediated:true
action_650u_waiting_boundary_remediated:true
action_650u_temporal_reason_taxonomy_complete:true
action_650u_confirmation_digest_binding_verified:true
action_650u_manual_confirmation_threat_matrix_passed:true
action_650u_baseline_equivalence_preserved:true
action_650u_refreeze_complete:true
action_650u_independent_rereview_approved:true
action_650u_local_checkpoint_ready:true
action_650u_progress_percent:100
track_4_progress_percent:47

action_650s_full_execution_regression_passed:false
real_broker_submission:false
avanza_live_access:false
credential_access:false
automatic_execution:false
trade_mutation:false
production_write:false
```
