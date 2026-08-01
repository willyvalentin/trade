# Action 650T — Execution successor freeze and independent review

## Decision

The seven Action 650S normative paths are frozen at combined SHA-256
`328a41a7015dfd6dd13bd5a338edd2ff244a151834d7c1123d3490d3f683589c`.
The digest is identical before regression, after regression, and after the
independent review.

Baseline reconciliation is complete. The broad base and successor selections
each produced `3,451 passed, 13 failed` from `3,464` tests. The restricted
live-fill selections each produced `22 passed, 5 failed` from `27` tests.
Failure identity, order, normalized error text, and relevant source bytes are
identical. The closed Action 650S import graph reaches none of those failing
surfaces, so every broad and restricted failure is classified
`baseline_identical_out_of_scope`.

The successor is nevertheless **not ready for a local checkpoint**. Independent
review found two major temporal-authority defects. No remediation was performed.

## Findings

```text
blocker:0
major:2
minor:0
nit:0
```

### Major 1 — exact expiry boundary remains authorized

The manual-confirmation boundary accepts a confirmation whose `confirmed_at`
equals `session_expires_at`. The review treats expiry as an exclusive upper
bound: authority is no longer valid at the expiry instant.

Evidence:

- `tests/e2e/action-650t-independent-threat-review.spec.ts:141`
- `lib/action-650s-manual-confirmation.ts:244` uses `>` for the upper-bound
  comparison, so equality passes.
- Observed result: capability issued.
- Required result: `{ ok: false, reason: "confirmation_expired" }`.

Severity is major rather than blocker because the successor graph is synthetic,
permits no real submission, and cannot reach broker, browser, credential,
process, persistence, or production-write surfaces. It still violates the
manual-authority temporal contract and independently prevents checkpoint
approval.

### Major 2 — confirmation can predate the waiting state

A confirmation at `09:59:30Z` is accepted for a preparation whose
`prepared`/`waiting_for_manual_confirmation` events occur at `10:00:00Z`.
Session membership is checked, but the confirmation instant is not checked
against the preparation lifecycle instant.

Evidence:

- `tests/e2e/action-650t-independent-threat-review.spec.ts:150`
- `lib/action-650s-execution-preparation.ts:270` and `:276` bind both preparation
  events to the observed preparation instant.
- `lib/action-650s-manual-confirmation.ts:244` checks only the manual session
  bounds.
- Observed result: capability issued.
- Required result: `{ ok: false, reason: "confirmation_invalid" }`.

Severity is major for the same containment reason as Major 1. The defect breaks
the ordering invariant for human authority and independently prevents
checkpoint approval.

## Adversarial review outcome

The independent review additionally confirmed:

- broker progress and terminal results remain blocked before confirmation;
- caller-built, spread, JSON, structured-cloned, prototype-derived, proxy, and
  cross-execution capabilities are rejected;
- one-shot consumption has no accessor hook and rejects reuse;
- automatic-mode structural substitution is rejected;
- execution, lifecycle, runtime, handoff, payload, session, request,
  idempotency, correlation, ticker, side, quantity, price, and order-type drift
  are rejected by the focused suite;
- duplicate terminal results are idempotent, conflicting terminal results route
  to needs-review, and cross-execution results are blocked;
- restart/retry traces remain deterministic;
- self-consistently recomputed structural tampering is rejected;
- the complete successor import graph contains no indirect or dynamic load
  route and reaches no CDP, browser automation, Avanza live-fill, credentials,
  cookies, sessions, BankID, Supabase write, database persistence, localhost
  transport, process spawning, automatic execution, or real mutation surface.

The relevant Actions 647–649 successor comparison passed.

## Baseline reconciliation

The exact base was `f578dd5bedeccb0f95b58c4f15ba2cb3dc1eea33`.
Both disposable checkouts used that commit; the successor checkout added only
the seven frozen normative files. Both broad suites ran the same sorted set of
126 spec files with one worker and without the browser-backed execution sandbox.

| Order | Broad failing test | Relevant source | Classification |
| ---: | --- | --- | --- |
| 1 | Avanza bridge UI executable-path guard | `app/settings/page.tsx` | `baseline_identical_out_of_scope` |
| 2 | controlled live proof public-service-role scan | `lib/post-trade-service-client-factory.ts` | `baseline_identical_out_of_scope` |
| 3 | in-memory proof append intent | in-memory proof harness | `baseline_identical_out_of_scope` |
| 4 | in-memory proof deterministic metadata | in-memory proof harness | `baseline_identical_out_of_scope` |
| 5 | live adapter service-role exposure assertion | service-role adapter | `baseline_identical_out_of_scope` |
| 6 | writer route auth-source assertion | writer route | `baseline_identical_out_of_scope` |
| 7 | route harness missing-auth status | writer route | `baseline_identical_out_of_scope` |
| 8 | route harness typed response | writer route | `baseline_identical_out_of_scope` |
| 9 | writer/adapter-contract disconnection assertion | audit writer | `baseline_identical_out_of_scope` |
| 10 | writer/adapter-fixture disconnection assertion | audit writer | `baseline_identical_out_of_scope` |
| 11 | mock mapping stale writer marker | audit writer | `baseline_identical_out_of_scope` |
| 12 | tracked public-service-role assignment scan | identical 19-path match set | `baseline_identical_out_of_scope` |
| 13 | child-process allowlist | two existing post-trade process-boundary files | `baseline_identical_out_of_scope` |

The restricted comparison repeated broad failure 13 and four stale CDP-runner
source assertions against the byte-identical
`scripts/avanza-localhost-bridge-server.mjs`. The full test identities, SHA-256
bindings, source-byte comparison, and classifications are recorded in
`docs/action-650t-execution-successor-freeze-manifest.json`.

Because the broad suite is not fully green,
`action_650s_full_execution_regression_passed` remains `false`.

## Verification

- Action 650S focused: `26/26 passed`.
- Actions 519–533: `1,802/1,802 passed`.
- Relevant Actions 647–649 comparison: `1/1 passed`.
- Broad base/successor: identical `3,451/3,464`.
- Restricted base/successor: identical `22/27`.
- Independent review: `5/7 passed`; the two failures are the major findings.
- TypeScript: passed.
- Scoped ESLint with zero warnings: passed.
- Production build: passed using non-secret public placeholder configuration.
- `git diff --check` and untracked whitespace checks: passed.
- Static security/import/capability scans: passed.
- Normative byte parity: passed.

## Required flags

```text
action_650t_execution_successor_frozen:true
action_650t_manual_confirmation_authority_verified:false
action_650t_identity_and_idempotency_verified:true
action_650t_cdp_browser_and_write_exclusion_verified:true
action_650t_baseline_failures_reconciled:true
action_650t_independent_review_approved:false
action_650t_local_checkpoint_ready:false
action_650t_progress_percent:100
track_4_progress_percent:45

action_650s_full_execution_regression_passed:false
real_broker_submission:false
avanza_live_access:false
credential_access:false
automatic_execution:false
trade_mutation:false
production_write:false
```

## Scope and delivery boundary

The freeze manifest, this report, and the Action 650T threat-review spec are
review artifacts and are explicitly excluded from the normative digest. No
finding was remediated. Nothing was staged, committed, pushed, submitted as a
pull request, deployed, or exercised against live, credential, browser, Avanza,
database, or process surfaces.
