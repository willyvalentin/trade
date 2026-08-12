# Action 666CN — Current-main governed-improvement end-to-end replay rebuild

## Decision

Historical PR #60 remains open stacked non-authority and must not be merged as
is. Its five normative replay artifacts are rebuilt additively from exact
current-main base `a5aa598de7b10a36e3e026ef98df81219559a09c` and tree
`929e6e3fcee63b9dcec3232e378d75f254ecba12`. Historical PR #60 head
`1d82cb1bc45ce02e6a9f793e53c815f17e15dab7` is provenance only.

The historical AR/AS freeze manifests and review reports are deliberately not
imported. They cannot authorize this current-main rebuild.

## Exact normative scope

1. `docs/action-666aq-golden-governed-improvement-end-to-end-report.json`
2. `docs/action-666aq-governed-improvement-end-to-end-replay.md`
3. `lib/server/canonical-governed-improvement-end-to-end-replay-fixtures.ts`
4. `lib/server/canonical-governed-improvement-end-to-end-replay.ts`
5. `tests/e2e/action-666aq-governed-improvement-end-to-end-replay.spec.ts`

Their exact per-file hashes and sorted-path aggregate are bound in
`docs/evidence/action-666cn-current-main-governed-improvement-end-to-end-replay/foundation-freeze-manifest.json`.

## Function in Ture

This foundation composes the four current-main Spår 2 stages:

```text
completed upstream evidence
→ completed-improvement capture
→ evidence adapter
→ governed improvement proposal
→ deterministic end-to-end replay evidence
```

It proves that an improvement proposal can be reconstructed from the original
captured evidence and that every intermediate trust root, lookup observation,
lineage identity and terminal result still agrees. It grants no permission to
train, change, promote, execute or publish anything.

## Current-main runtime remediation

The historical v1 implementation is upgraded to v2 before freezing:

1. literal `enabled: true` plus literal `kill_switch_engaged: false` is the only
   active state, with zero dependency reads on every closed-gate variant;
2. active option and dependency shells require exact enumerable data keys;
3. lookup and projection methods are captured at construction so later caller
   mutation cannot alter replay;
4. request and result runtime surfaces reject cycles, symbols, hidden keys,
   accessors, sparse arrays, extra array keys, non-finite values and
   Proxy/uncloneable surfaces;
5. the outer request requires all three namespace/version/capture keys and
   permits no unexpected keys, while its five historical caller-authority
   names remain explicitly classified as conflicts;
6. execution counters are private and exposed only through frozen snapshots;
   caller counters are never mutated;
7. capture, adapter and proposal verification use their current private
   harness/engine authorities rather than re-supplied caller dependencies;
8. the end-to-end verifier requires its original module-recognized harness;
   copied or forged harnesses fail closed;
9. previous-binding lookup returns require exact descriptor-safe
   `{ semantic_digest } | null` shapes and failures are sanitized;
10. a capture request that current-main capture cannot independently verify is
    rejected rather than credited as incomplete;
11. every new server-only replay import is enumerated by the predecessor
    proposal, adapter and capture containment oracles.
12. final result verification requires recursive exact equality, including
    every own key and explicit `undefined`; matching JSON digests alone are
    insufficient.

## Preserved boundary

The replay remains server-only, synthetic-only, fixture-only, read-only,
default-off and runtime-unwired. It adds no live consumer, route, provider or
database access, persistence, migration, production data, model/ranking effect,
training, parameter/threshold change, promotion, experiment execution, broker
behavior or execution authority. Golden outputs are not Ture performance or
causal evidence.

## Delivery boundary

This rebuild authorizes neither historical PR #60 nor a merge, deployment,
provider action or database action. Delivery requires exact-head provider-free
CI, a fresh independent read-only review with no blocking finding,
explicit operator approval naming the PR and exact head, ordinary merge, and
exact-main CI. Production identity and smoke are required only if a later
production publish is separately authorized.

Until those gates pass, Spår 2 remains open and this replay is not current-main
authority.
