# Action 666CM — Current-main completed-improvement evidence-capture rebuild

## Decision

PR #58 remains historical non-authority and must not be merged as-is. Its five
normative artifacts are rebuilt additively from current-main base
`7bdb119f45293a7d237aeb879c1f3ec9160a230f` and current-main tree
`6d8e90469e16da210720948fd9c09cd6e002a1a4`. Historical PR #58 head
`df644a2df08db4baa62b172ef578df868af5bf04` is a provenance reference only.
No historical freeze or review artifact is reused as current authority.

## Exact normative scope

1. `docs/action-666aj-completed-improvement-evidence-capture.md`
2. `docs/action-666aj-golden-completed-improvement-capture-report.json`
3. `lib/server/canonical-completed-improvement-evidence-capture-fixtures.ts`
4. `lib/server/canonical-completed-improvement-evidence-capture.ts`
5. `tests/e2e/action-666aj-completed-improvement-evidence-capture.spec.ts`

The exact sorted-path aggregate is
`6e35b56435ef0f416fc459e66dcedcac5fe1cc011869fe4833b37a1d4e3921ee` and is recorded in
`docs/evidence/action-666cm-current-main-completed-improvement-evidence-capture/foundation-freeze-manifest.json`.

The following historical PR #58 files are deliberately excluded and retain
provenance value only:

- `docs/action-666ak-completed-evidence-capture-foundation-freeze-manifest.json`;
- `docs/action-666ak-completed-evidence-capture-independent-review.md`;
- `docs/action-666al-completed-evidence-capture-foundation-refreeze-manifest.json`;
- `docs/action-666al-completed-evidence-capture-independent-rereview.md`.

## Preserved safety boundary

The capture remains server-only, synthetic-only, fixture-only, read-only and
default-off. It has no live consumer, database or provider access, persistence,
migration, ranking effect, model training, parameter or threshold change,
model promotion, experiment execution, broker behavior, or execution authority.
Golden outputs are synthetic evidence and are neither production evidence nor
claims about Ture's performance.

## Current-main runtime remediation

The rebuilt candidate closes the historical runtime-boundary classes before
freezing:

1. activation requires literal `enabled: true` and literal
   `kill_switch_engaged: false`, before any dependency or caller-counter read;
2. options, counters, authority shells, lookup objects, lookup returns,
   requests, upstream structures, nested objects, results, and arrays use exact
   descriptor-safe runtime validation without accessors, symbols, hidden or
   extra keys, cycles, non-finite values, sparse arrays, or extra array keys;
3. authority creation snapshots caller-owned registry bytes while retaining
   only the separately frozen, module-recognized registry-authority identity;
4. lookup methods are captured once at construction and later caller property
   mutation cannot alter the computation;
5. optional caller counters are copied and never mutated; execution counters
   remain private and are exposed only as deeply frozen snapshots;
6. malformed requests return sanitized deterministic diagnostics without
   throwing and have no canonical verification authority;
7. verification requires the original frozen, module-privately branded harness
   and its private canonical capture function; copies and forgeries fail closed;
8. the recursive upstream shape is bound to the recognized authority snapshot,
   while semantic drift remains a canonical `conflicting` result.

The first independent review of exact head
`4df14617542fea40ffce97b042104ef54de469f3` found four additional fail-open or
closure cases. The replacement candidate also requires:

9. successful canonical snapshots of both requests and results before private
   verification, so Proxy values and shared malformed diagnostics cannot gain
   or cross-share canonical authority;
10. exact boundary, registry, post, and canonical payload reconstruction before
    a capture authority is module-branded;
11. empty authority arrays to accept only empty request arrays, rather than
    losing their element contract through exemplar inference;
12. every new server-only proposal consumer to be explicitly enumerated in the
    predecessor foundation's containment oracle.

These remediations require exact-head CI and a new independent read-only review.
No historical review result can authorize this candidate.

## Delivery boundary

This rebuild does not authorize historical PR #58, a merge, a production
deployment, or any provider/database action. A delivery candidate requires:

1. exact-head provider-free CI;
2. an independent read-only review of the exact frozen head with no blocking
   findings;
3. explicit operator approval naming the PR and exact head;
4. ordinary PR merge followed by exact-main CI;
5. release identity and production smoke only if a production publish occurs.

Until every applicable condition is satisfied, Spår 2 remains open and this
capture is not current-main authority.
