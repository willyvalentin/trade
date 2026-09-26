# SV-A.2 Observation-Cycle Admission Policy

## Product behavior

`observation_cycle_admission_v2` turns each normal quarter-hour scheduler event
into a bounded decision opportunity. The scheduler itself grants no provider
authority. Before the normal scan can reach its provider environment, atomic
credit reservation or recommendation generation, the policy evaluates:

- a provider-confirmed regular New York session and matching route clock;
- same-day durable observation freshness;
- candidate-decision coverage and candidate state;
- material change between the two latest valid decision records;
- an explicit, enforced provider-credit ceiling; and
- consecutive durable retryable failures, including owner-bound terminal cycle
  failures that happened before a recommendation scan-run could be persisted.

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

Version 2 combines same-day recommendation scan-runs with strictly parsed,
owner-bound terminal `observation_cycle_receipts` whose failure has no linked
scan-run. Linked failures are counted once through their scan-run; manual and
diagnostic receipts never influence scheduled cadence. The newest valid event
anchors the next eligible time, a later successful scan resets the consecutive
failure chain, and unavailable, malformed or future cycle history rejects before
provider work. The receipt records the cadence anchor and whether the active
failure chain includes a pre-run failure. Persisted v1 admission receipts remain
strictly readable and retain their original scan-run-only meaning.

## Delivery evidence

Version 1 was merged through PR #650 as exact main
`d811cff18322553e622f17e78d062e7a30e1c08d`. Exact-main GitHub CI run
`36237970891` passed, including post-merge provenance, and Netlify production
deploy `6ab7a8089ea4800008ee363a` is `ready` on that revision. This establishes
source and deployment delivery only; it did not activate a scan or prove live
policy behavior.

Version 2 is a CLOSED local delivery candidate on
`codex/observation-cycle-attempt-backoff`, based on that exact main:

- 28 focused admission, continuous-session and generic-receipt tests: pass;
- 144-test integrated scheduler, invocation, Basic Free budget/readback,
  ticker-cap, freshness and reference-route regression: pass;
- strict TypeScript no-emit: pass;
- changed-file ESLint and `git diff --check`: pass;
- scheduled runtime package build: pass;
- Next 16.3.4 webpack production build: pass;

Protected PR/CI, merge, exact-main production deployment and a bounded OPEN cycle
remain separate evidence for v2. A later live receipt must prove the actual
policy decision, provider reservation/use, terminal trace and generic cycle
lineage together; it still cannot establish alpha from one result.
