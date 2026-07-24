# Action 619: Scheduled Admission Foundation

## Decision

`scheduled_admission_foundation_ready`

Action 619 adds a local, dry admission foundation only. It does not declare a
cron, enable a canary, release a kill switch, call a provider, create a claim,
or write an audit or ledger entry.

## Architecture

The foundation has four boundaries:

1. `netlify/functions/scheduled-shadow-collector-canary.ts` creates a bounded,
   non-secret scheduled request from the verified calendar, deployment commit,
   and completed market range. It remains deliberately unscheduled.
2. `POST /api/automation/continuous-intelligence/shadow-collector/canary/scheduled-admission`
   authenticates before parsing or reading any admission state. It is dry: no
   claim, provider, finalization, audit, or ledger action is reachable.
3. `continuous-intelligence-shadow-canary-scheduled-admission.ts` owns the pure
   request, occurrence, authentication-category, and typed admission policy.
4. The server-only context builder performs read-only calendar, planner, schema,
   ledger-usage, active-claim, audit, and ledger checks. A later action may pass
   an `admission_ready` handoff into the existing Action 617-proven execution
   core. It must not create a parallel provider or finalization implementation.

## Contracts

The scheduled request is strictly `source: "scheduled"` and includes the
admission contract version, scheduler contract version, canonical deployment
commit, market date, 30-minute market window, cadence slot, `AAPL`, `5min`,
Action 565 planner profile, requested-at timestamp, exact `377 / 57 / 320`
policy, and a recomputed occurrence ID. Missing, malformed, manual-shaped,
secret-shaped, noncanonical, or unsupported input is rejected.

The occurrence identity is derived only from:

`deployment commit + scheduler contract + market date + completed window + slot + ticker + interval + planner profile`

It is deterministic and bounded. It contains no scheduler secret, auth header,
manual authorization, random nonce, or provider response. Retrying the same
occurrence yields the same identity. Different deployments or market windows
yield a different identity.

## Authentication Boundary

The scheduler boundary compares SHA-256 digests with `timingSafeEqual` and
returns only `scheduler_auth_missing`, `scheduler_auth_invalid`, or
`scheduler_auth_ready`. Secrets are never returned, logged, stored, or included
in an identity. Missing configuration fails closed before request parsing,
readiness, claims, providers, or persistence.

## Admission Matrix

`admission_ready` requires every condition below:

- authenticated scheduler and exact deployment identity;
- canary enabled, kill switch inactive, and all explicit schedule-state signals
  active with the duplicate-schedule signal absent;
- verified/current calendar and the exact current completed market window;
- provider, Action 565 normal-capacity planner, audit contract, and ledger
  contract ready;
- historical scheduled usage readable and below the existing two-run/two-credit
  UTC-day cap;
- no active same-occurrence or conflicting scheduled claim; and
- no unresolved finalization, audit, ledger, or usage-mismatch stop state.

Every other outcome is `blocked`. Typed blockers include the required scheduler,
deployment, flag, schedule, calendar/window, provider/planner, audit/ledger,
usage/budget, overlap, persistence, and generic unavailable categories. The
result always states that zero provider calls and zero durable writes occurred.

## Overlap and Persistence Policy

Scheduled claims are identified separately from manual claims by their execution
identity namespace. A same-occurrence active claim and any other active scheduled
claim both block a new occurrence. Terminal retries remain idempotent once a
future execution action wires the occurrence identity into the existing claim
lifecycle. Any unreadable claim state blocks.

The read-only durable-state inspection blocks future scheduled admission when a
terminal scheduled claim has no source receipt, no matching audit, no matching
ledger entry, or inconsistent terminal/audit/ledger counts. These map to
`finalization_unproven`, `audit_failed`, `ledger_failed`, and `usage_mismatch`.
No migration is required for this read-only foundation. A future Action 620 must
consider a narrow durable stop marker only if the existing records cannot carry
the operational stop state unambiguously.

## Shared-Core Integration

The admission result produces a sanitized handoff only when fully ready. Action
619 intentionally does not use that handoff to invoke the provider. A future
execution action must pass it to the existing canonical canary execution flow:
atomic claim, immediate runtime recheck, atomic begin-attempt, one provider call,
terminal finalization, linked audit, then linked ledger. Any audit or ledger
failure remains a stop condition, not an automatic retry.

## Migration and Deployment Assessment

No migration was prepared: the contracts are pure or read-only over existing
tables. No isolated PostgreSQL validation was needed. Deploy this as one scoped
application batch only after reviewing the route, Netlify wrapper, server context,
pure admission contract, tests, and manifest update. Deployment must keep the
canary disabled, kill switch active, and all schedule signals inactive/absent.

## Recommended Action 620

**Action 620 - Production Scheduled Admission Reachability Verification**

Deploy and verify the dry admission foundation with no cron. Make one explicitly
authorized authenticated dry request only after confirming all defaults remain
blocked. It must prove route authentication, canonical request parsing,
deployment identity binding, and typed `schedule_inactive` behavior with zero
provider calls, claims, audits, ledgers, or usage mutation. No scheduled
full-chain provider run is authorized by Action 620.
