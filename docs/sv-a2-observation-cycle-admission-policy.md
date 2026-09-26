# SV-A.2 Observation-Cycle Admission Policy

## Product behavior

`observation_cycle_admission_v1` turns each normal quarter-hour scheduler event
into a bounded decision opportunity. The scheduler itself grants no provider
authority. Before the normal scan can reach its provider environment, atomic
credit reservation or recommendation generation, the policy evaluates:

- a provider-confirmed regular New York session and matching route clock;
- same-day durable observation freshness;
- candidate-decision coverage and candidate state;
- material change between the two latest valid decision records;
- an explicit, enforced provider-credit ceiling; and
- consecutive durable retryable failures.

A completed or honest `no_trade` cycle is eligible again after 15 minutes, the
highest cadence currently supported by the scheduler. Consecutive retryable
failures back off for 15, 30 and then at most 60 minutes. Missing or unbounded
provider budget, an unverified session, unsupported segment, clock mismatch or
future observation history rejects before normal provider work.

The policy does not lower ranking or publication thresholds and does not make
candidate volume a success criterion. `no_request`, `reject` and
`request_current_data` are all first-class, versioned results.

## Authority and route boundaries

The policy receipt explicitly has no authority to call a provider, reserve a
credit, change ranking, publish a candidate or execute a broker order. The
existing atomic Basic Free reservation remains the provider-spend authority
after admission. Manual `force` cannot bypass the normal admission decision.

The explicitly armed Basic Free catalog/capability-probe path remains a
separate reference-only operation. The older paid market-wide background path
was removed from this route: a policy `no_request` can no longer fall through
to a second provider-capable observer. Its standalone source module and
historical receipts are retained; this delivery does not erase history.

## Durable evidence and diagnostics

Every normal attempt passes the exact admission receipt into the owner-bound
generic observation-cycle receipt. The strict parser rejects malformed counts,
authority escalation, non-admissible `no_request` state, delay outside the
15–60 minute policy and inconsistent next-eligible timestamps. Market
Diagnostics exposes the decision, next eligible time, freshness, coverage,
candidate state, material-change status and retry backoff.

The v1 retry counter is deliberately limited to durable same-day
`recommendation_scan_runs`. A route failure that occurs before such a run is
persisted remains visible in scheduled-attempt evidence but does not yet extend
the policy backoff. Closing that pre-run failure gap requires a later policy
version and must not be inferred from this receipt.

## CLOSED acceptance evidence

- 23 focused admission, continuous-session and generic-receipt tests: pass;
- 64-test integrated scheduler, invocation, Basic Free budget/readback,
  ticker-cap and reference-route regression: pass;
- strict TypeScript no-emit: pass;
- changed-file ESLint and `git diff --check`: pass;
- scheduled runtime package build: pass;
- Next 16.3.4 webpack production build: pass;
- default Turbopack build: environment-blocked because this isolated worktree
  reuses `node_modules` through a symlink outside Turbopack's filesystem root.

Protected PR/CI, merge, exact-main production deployment and a bounded OPEN
cycle remain separate evidence. A later live receipt must prove the actual
policy decision, provider reservation/use, terminal trace and generic cycle
lineage together; it still cannot establish alpha from one result.
