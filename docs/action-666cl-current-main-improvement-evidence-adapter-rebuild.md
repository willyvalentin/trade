# Action 666CL — Current-main completed improvement-evidence adapter rebuild

## Decision

PR #57 remains historical non-authority and must not be merged as-is. Its five
normative artifacts are rebuilt additively from current-main base
`0318046d6e0350694b07ab4f35c491841d3e723b` and current-main tree
`801bc80ae5f606f81c89cc65cab729a50f850d52`. The historical PR head
`e264715d2390574c639289ab0068acbf0387899c` and its normative child
`e87bb62198b54143ea9d3456a1d7872dc81d8871` are provenance references only.
No historical freeze or review artifact is reused as current authority.

## Exact normative scope

1. `docs/action-666ac-completed-improvement-evidence-adapter.md`
2. `docs/action-666ac-golden-improvement-adapter-report.json`
3. `lib/server/canonical-model-improvement-input-adapter-fixtures.ts`
4. `lib/server/canonical-model-improvement-input-adapter.ts`
5. `tests/e2e/action-666ac-completed-improvement-evidence-adapter.spec.ts`

The exact sorted-path aggregate is
`a73d3b0020e5ca877dafcef1e50b2f92cdf98c75b45d98bacc3a566a8bce5dfb`.
The machine-readable current-main binding is
`docs/evidence/action-666cl-current-main-improvement-evidence-adapter/foundation-freeze-manifest.json`.

The following historical PR #57 files are deliberately excluded from the
rebuilt scope and retain provenance value only:

- `docs/action-666ad-improvement-adapter-foundation-freeze-manifest.json`;
- `docs/action-666ad-independent-review.md`;
- `docs/action-666ae-improvement-adapter-foundation-refreeze-manifest.json`;
- `docs/action-666ae-improvement-adapter-independent-rereview.md`.

## Preserved safety boundary

The adapter remains server-only, synthetic-only, offline-only, fixture-only,
read-only and default-off. It adds no live consumer, database or provider
access, persistence, migration, ranking effect, model training, parameter or
threshold change, model promotion, experiment execution, broker behavior, or
execution authority. Golden outputs are synthetic evidence and are not Ture
performance or publishable production evidence.

## Current-main runtime remediation

The rebuilt candidate closes the current-main runtime-boundary classes before
freezing:

1. activation requires literal `enabled: true` and literal
   `kill_switch_engaged: false`; every other runtime value remains closed with
   zero request, lookup, clone, verifier, or proposal work;
2. replay options, dependencies, requests, lookup objects, lookup returns,
   bundles, nested objects, and arrays are validated through exact enumerable
   data-property shapes with no accessors, symbols, hidden keys, cycles,
   non-finite values, sparse arrays, or extra array keys;
3. bundle snapshots clone caller-owned serializable data and retain only the
   separately frozen, module-recognized proposal-registry authority whose
   object identity is required by the upstream proposal engine;
4. lookup method properties are captured once at construction, lookup failures
   are sanitized, and later caller property mutation cannot change replay;
5. optional caller counters are copied as input snapshots and never mutated;
   execution counters remain private and only deeply frozen snapshots are
   exposed;
6. replay verification requires the original frozen, module-privately branded
   harness, rebuilds with its private canonical replay, and rejects fake,
   disabled, altered, or malformed verifier inputs without throwing.

These remediations require exact-head CI and a new independent read-only review.
No historical review result can authorize this candidate.

## Delivery boundary

This rebuild does not authorize historical PR #57, a merge, a deployment, or
any provider/database action. A delivery candidate requires:

1. exact-head provider-free CI;
2. an independent read-only review of the exact frozen head with no blocking
   findings;
3. explicit operator approval naming the PR and exact head;
4. ordinary PR merge followed by exact-main CI;
5. release identity and production smoke only if a production publish occurs.

Until every applicable condition is satisfied, Spår 2 remains open and this
adapter is not current-main authority.
