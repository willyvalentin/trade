# Action 666CK — Current-main model-improvement proposal rebuild

## Decision

PR #55 remains historical non-authority and must not be merged as-is. Its final
six normative artifacts are rebuilt additively from current-main base
`3daa36638f10ec9356811cb9f8e900e44bead3be`. No historical review, threat
matrix, refreeze, or freeze artifact is reused as current authority.

## Exact normative scope

1. `docs/action-666v-golden-model-improvement-proposal-report.json`
2. `docs/action-666v-governed-model-improvement-proposal-contract.md`
3. `lib/server/canonical-model-improvement-proposal-fixtures.ts`
4. `lib/server/canonical-model-improvement-proposal.ts`
5. `lib/server/canonical-model-improvement-upstream-verification.ts`
6. `tests/e2e/action-666v-governed-model-improvement-proposal.spec.ts`

The exact sorted-path aggregate is
`18309ccb2a3b3cb015be003061e211d66b22b2db859cdf65d3b05700badf6004`.
The machine-readable current-main binding is
`docs/evidence/action-666ck-current-main-model-improvement-proposal/foundation-freeze-manifest.json`.

The following historical PR #55 files are deliberately excluded from the
rebuilt scope and retain provenance value only:

- `docs/action-666w-improvement-foundation-freeze-manifest.json`;
- `docs/action-666w-improvement-foundation-independent-review.md`;
- `docs/action-666w-improvement-foundation-threat-matrix.json`;
- `docs/action-666x-improvement-foundation-independent-rereview.md`;
- `docs/action-666x-improvement-foundation-refreeze-manifest.json`;
- `docs/action-666x-improvement-foundation-threat-matrix.json`.

## Preserved safety boundary

The foundation remains server-only, synthetic-only, offline-only and
default-off. It adds no live consumer, provider or database access,
persistence, migration, ranking effect, model promotion, broker behavior,
experiment execution, or execution authority. External AI remains
summary-only and cannot become canonical evidence or truth authority.

## Current-main runtime remediation

The rebuilt candidate closes three runtime-boundary classes before freezing:

1. activation requires literal `enabled:true` and literal
   `kill_switch_engaged:false`; every other runtime value remains disabled with
   zero trust, lookup, request, or proposal work;
2. registry bytes and lookup method properties are captured at construction,
   validated against the separately frozen authority, and isolated from later
   caller mutation;
3. canonical runtime-surface and exact request-shape validation reject hidden,
   undefined, symbolic, accessor, sparse, extra-array, malformed boundary,
   post, payload, request, or lookup input with a structured `conflicting`
   result and never escape as runtime exceptions.

These changes do not satisfy the independent-review gate by themselves. The
new frozen head requires exact-head CI and a new read-only review.

## Delivery boundary

This rebuild does not authorize historical PR #55, a merge, a deployment, or
any provider/database action. A delivery candidate requires:

1. exact-head provider-free CI;
2. an independent read-only review of the exact frozen head with no blocking
   findings;
3. explicit operator approval naming the PR and exact head;
4. ordinary PR merge followed by exact-main CI;
5. release identity and production smoke only if a production publish occurs.

Until every applicable condition is satisfied, Spår 2 remains open and this
foundation is not current-main authority.
