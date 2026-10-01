# Provider-credit allocation live experiment

`scanner_provider_credit_allocation_live_experiment_contract_v1` freezes the
first prospective comparison of the current serial provider-credit allocator
and `candidate_breadth_first_provider_budget_v1`. The contract is a CLOSED,
provider-free admission boundary. It does not activate the scheduler, call
Twelve Data or change scanner behavior by itself.

## Frozen switchback

The original `provider_credit_allocation_switchback_2026_10_01_v1` was
disarmed before its first slot after the two-failure versus three-failure
runtime-stop mismatch was found. It remains `no_go`, with zero attempts or
credits; its declared times were 13:45Z/14:00Z, 15:15Z/15:30Z and 17:00Z/17:15Z.
Do not blend that original declaration with the replacement below.

The replacement `provider_credit_allocation_switchback_2026_10_01_v2` is
bound to the regular 2026-10-01 US session and six declared
15-minute scheduler slots. Three time pairs reverse arm order to reduce a simple
early/late ordering bias:

| Pair | Baseline slot | Challenger slot |
| --- | --- | --- |
| 1 | 14:30Z | 14:45Z |
| 2 | 15:45Z | 15:30Z |
| 3 | 17:00Z | 17:15Z |

The first replacement slot is 16:30 CEST / 10:30 America/New_York, not a
product restriction to a named publication window. Activation is conditional
on green protected CI, a ready exact-revision production deployment, fresh
provider-free authenticated preflight and verified remaining daily capacity.
The activation deploy must be ready by 14:15Z, one full scheduler interval
before the first slot; otherwise this entire replacement is `no_go`, not a
partially collected comparison. No retry or manual route is allowed. Freeze
the final published revision/deploy identity in the ledger before activation,
keep it unchanged through collection and cleanup, and do not merge a later
reader or unrelated delivery during that period.

Every attempt retains the existing Basic Free ceiling: six scanner credits and
eight total known provider credits. The whole series is therefore capped at six
attempts and 48 credits. The deterministic decision strategy, rotating symbol
selection policy and expected eight-candidate denominator are frozen. Each
attempt must persist its exact population fingerprint, and failed or
non-terminal attempts remain in the denominator.

## Decision rule and limits

Primary data-fitness metrics are the rankable-candidate fraction, number of
candidates receiving a provider credit and late-index candidates left wholly
unfunded. Credit use, rate limits/timeouts, terminal receipts and any stale or
incomplete publication are guardrails. Fully rankable coverage and canonical
outcome coverage are secondary diagnostics.

The experiment is not recommendation-quality evidence. It cannot lower a
threshold, change ranking/publication, force a candidate or authorize a broker
action. Promotion requires a later complete quality-charter comparison against
canonical outcomes.

## Fail-closed activation and rollback

The pure resolver is disabled unless it receives the exact experiment ID,
declared slot, active 15-minute window and matching 40-character expected and
deployed revisions. Drift returns the baseline policy and no allocation-policy
authority. `scanner_provider_credit_allocation_plan_v1` is the shared,
fingerprinted semantic planner used by both shadow and future runtime. The
runtime-admission layer additionally requires the exact durable Netlify
scheduled-invocation receipt and carries the selected policy into active trace
and the owner-bound observation-cycle receipt. That receipt grants policy
selection only: it cannot call a provider, reserve a credit, change ranking or
publication, lower a threshold, publish a candidate or reach a broker.

The execution path uses
`scanner_provider_credit_allocation_execution_plan_v2`: it snapshots the whole
candidate denominator's cache demand before mutation and respects both the
frozen total scanner cap and the existing independent intraday cap. It is
enforced only for an `admitted` runtime receipt. Exact successful reservations
are reconciled against the frozen plan and persisted in active trace plus the
owner-bound observation-cycle receipt; missing or unexpected allocations are
explicit divergence. This does not activate the experiment or prove improved
data fitness.

The activation path uses
`scanner_provider_credit_allocation_activation_v1`. A read-only authenticated
preflight binds the complete 48-credit observation-series window, exact
packaged production revision, inert current configuration and disabled
competing workers. When activation is requested, the scheduled-function guard
admits only the six slots in the frozen table; every intermediate 15-minute
tick returns before database, route or provider I/O. Configuration, revision or
time drift fails closed. The preflight cannot mutate configuration, arm the
scheduler, call a provider, reserve a credit, rank, publish, create paper state
or reach a broker.

PR [#715](https://github.com/willyvalentin/trade/pull/715) merged this activation
path as `40d671b93a6ca9aa6acf2a40c6949a10663d7d2f`; production deploy
`6abd9e7360059f00081666de` is `ready` on the exact revision. Authenticated
production preflight was `ready` with zero prior reservations/attempts and the
full six-attempt/48-credit window available while the global scheduler disable
remained enabled.

## Provider-free evaluation

`scanner_provider_credit_allocation_live_evaluation_v2` is the strict,
side-effect-free readback boundary for the resulting six observation-cycle
receipts. It rejects malformed, unattributed, undeclared, duplicate, drifted or
lineage-inconsistent evidence; joins every cycle to the durable Basic Free
reservation/finalization receipt for the same attempt, slot, site, deploy and
revision; retains missing and active slots; and applies the frozen series cap
and consecutive-failure stop. The reservation receipt proves the full
eight-credit attempt budget while the cycle receipt independently proves actual
scanner allocations. Completed slots must bind the exact runtime admission,
arm, policy, candidate population, execution plan and reservation
reconciliation.

Two consecutive attributable operational failures terminate an incomplete
comparison as `inconclusive`, not as evidence that either allocation policy
failed scientifically. This stop remains latched after a later completed slot,
and all failed-attempt credits remain counted. A supplied allocation
reconciliation that diverges is instead an integrity `fail`, including when
its cycle has already failed operationally. Integrity failures take precedence
over the operational-stop classification. Neither result permits promotion.
Evidence with a scheduled, received or finalized timestamp later than the
evaluation clock also fails integrity admission; an invalid clock cannot
produce an accepted comparison. Such credits remain counted conservatively,
but future terminal receipts never contribute observed completed coverage.

Only a complete three-pair series may produce a descriptive data-fitness
signal. That signal compares rankable-candidate fraction, funded candidate
breadth and late unfunded candidates. It always reports recommendation quality
as unproven, grants no runtime authority and requires canonical-outcome review
before any policy promotion.

OPEN execution remains separate work.
After expiry, an incomplete evaluation directs evidence review before any new
experiment; it must not suggest completing or retrying the expired frozen series.
The local expiry-guidance correction passed all eight evaluator/readback tests,
changed-file lint and the Next 16.3.8 production build on 2026-10-01. It is not
part of the frozen observation revision and does not authorize another attempt.
The authenticated `GET /api/app/provider-credit-allocation-live-evaluation`
reads the fixed experiment window independently of current activation flags.
It uses count-checked database reads, validates persisted cycle metadata and
owner identity, and pins the observation revision to
`8e243b67a9819eb3f7901b0468cdb3651e099a79`, frozen before the first v2 slot.
The original v1/40d671 observation remains no-go and is not pooled into v2.
Read failures return HTTP 503
with no evaluation; invalid experiment evidence returns HTTP 422; a readable
evaluation returns HTTP 200, including honest incomplete/in-progress results.
Responses are uncached. This route is locally built and fixture-tested;
production integration follows the frozen observation's cleanup.

Any credit breach, lineage/population mismatch, stale/incomplete publication,
revision drift, plan-versus-actual divergence or two consecutive operational
failures stops the series. Rollback is always
`serial_shared_provider_budget_v1`.
