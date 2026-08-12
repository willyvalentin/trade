# Action 666CJ — Current-main predictive-explanation rebuild

## Decision

PR #54 remains historical non-authority and must not be merged as-is. Its final
five normative artifacts are rebuilt additively from current-main base
`a8a4990a81aa30484caf6112d0810161c1e86214`. No historical review or freeze
artifact is reused as current authority.

## Exact normative scope

1. `docs/action-666m-golden-predictive-explanation-report.json`
2. `docs/action-666m-predictive-outcome-explanation.md`
3. `lib/server/canonical-predictive-outcome-explanation-fixtures.ts`
4. `lib/server/canonical-predictive-outcome-explanation.ts`
5. `tests/e2e/action-666m-predictive-outcome-explanation.spec.ts`

The exact sorted-path aggregate is
`2d18fa5c9cd04b34aa80c9ac61721fd1cda2dec8030dfa4ed9d8833f0c89a6e9`.
The machine-readable current-main binding is
`docs/evidence/action-666cj-current-main-predictive-explanation/foundation-freeze-manifest.json`.

## Preserved safety boundary

The foundation remains server-only, synthetic-only, offline-only and
default-off. It adds no live consumer, provider or database access,
persistence, migration, ranking effect, model promotion, broker behavior or
execution authority. External AI remains summary-only and cannot become
canonical evidence or truth authority.

## Independent-review remediation

The first current-head review of commit
`247223cae3649d73c966a09691cca98a24731534` found three blocking runtime
boundary defects. The remediated candidate must prove all three properties:

1. activation requires the literal boolean `kill_switch:false`; all other
   runtime values remain disabled with zero trust reads and zero work;
2. the trust boundary is cloned, validated and deep-frozen at construction so
   later caller mutations cannot change a post while retaining an old root;
3. exact recursive runtime-shape validation rejects missing, null, wrong-type
   and unexpected nested fields with a structured failure and never throws.

These changes do not satisfy the independent-review gate by themselves. The
new frozen head requires exact-head CI and a new read-only review.

## Delivery boundary

This rebuild does not authorize the historical PR, a merge, a deployment or
any provider/database action. A delivery candidate requires:

1. exact-head provider-free CI;
2. an independent read-only review of the exact frozen head with no blocking
   findings;
3. explicit operator approval naming the PR and exact head;
4. ordinary PR merge followed by exact-main CI;
5. release identity and production smoke only if a production publish occurs.

Until every applicable condition is satisfied, Spår 2 remains open and this
foundation is not current-main authority.
