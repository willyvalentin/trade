# Action 666CO — Current-main frozen improvement binding store rebuild

## Decision

Historical PR #63 remains an open stacked non-authority and must not be merged
as-is. Its five normative binding-store artifacts are rebuilt additively from
exact current-main base
`0a40ed49184fd5e6fd0b0b2996002e0d3ca027b0` and tree
`294673813b4bcc6bab6e951a2d44355e100c6f7b`. Historical PR #63 head
`bc554c4f1211c6b0acbf846ec34d57325253014a` is provenance only.

Historical AY/AZ.1 freeze manifests and review reports are deliberately not
imported. They cannot authorize this current-main rebuild.

## Exact normative scope

1. `docs/action-666ax-golden-improvement-binding-store-report.json`
2. `docs/action-666ax-improvement-binding-store-contract.md`
3. `lib/server/canonical-improvement-binding-store-fixtures.ts`
4. `lib/server/canonical-improvement-binding-store.ts`
5. `tests/e2e/action-666ax-improvement-binding-store.spec.ts`

Their exact per-file hashes and sorted-path aggregate are bound in
`docs/evidence/action-666co-current-main-frozen-improvement-binding-store/foundation-freeze-manifest.json`.

## Function in Ture

This foundation supplies the first immutable, owner-authorized read boundary
for the current-main Spår 2 chain:

```text
external owner snapshot authority
→ frozen previous/capture binding snapshot
→ read-only lookup adapters
→ completed capture
→ evidence adapter
→ governed proposal
→ deterministic end-to-end replay
```

It lets Ture prove that a proposal, experiment or capture identity is either
absent, already bound to the same semantic digest, conflicting, not yet
effective or backed by an invalid snapshot. It adds no writer, publisher,
database table, filesystem store, provider call or live consumer.

## Current-main runtime remediation

The historical implementation is hardened before freezing:

1. activation requires literal `enabled:true` and literal
   `kill_switch_engaged:false`; every other value closes before dependency
   reads;
2. active options, caller counters and owner dependencies require exact,
   enumerable data-property shells with no hidden keys, symbols, accessors or
   proxies;
3. owner reader methods are captured at construction and their returned
   authority/snapshot values are recursively validated before cloning;
4. snapshots reject cycles, proxies, accessors, symbols, sparse arrays, extra
   array keys, non-finite values and non-plain objects;
5. authority and snapshot bytes are cloned once and isolated from later
   caller mutation;
6. predecessor objects and every entry require exact closed schemas, including
   under self-consistent recomputed snapshot and authority digests;
7. lookup requests are recursively snapshotted and malformed runtime surfaces
   return a deterministic conflict instead of throwing;
8. lookup adapters capture both store methods and `as_of` at construction;
9. execution counters are module-private snapshots; optional caller counters
   are shape-checked but never mutated;
10. predecessor containment oracles enumerate every new server-only consumer.
11. cloned authority bytes complete full semantic and cryptographic validation
    before the snapshot reader can run, so every authority drift observes zero
    snapshot reads and zero snapshot clones;
12. expected owner/snapshot identities require canonical runtime types, format
    and derivation; self-consistent rehashing cannot authorize malformed
    identities.
13. the owner dependency supplies descriptor-safe immutable authority identity
    and digest pins, checked before the returned authority can read a snapshot;
14. every digest/root/pin field requires an actual full-hash string throughout
    builders and trust validation, preventing implicit regular-expression
    coercion of arrays or other runtime types.

## Preserved boundary

The binding store remains server-only, synthetic-only, fixture-only,
read-only, default-off and runtime-unwired. It cannot append, update, delete,
approve, rotate, promote or persist a binding. It cannot execute an
experiment, train or promote a model, change ranking, parameters or
thresholds, or publish performance.

The golden report is synthetic contract evidence, not actual Ture performance.
External AI has no canonical-truth authority.

## Delivery boundary

This rebuild creates candidate evidence only. It does not authorize merge,
production deployment, provider/database activity or activation.

Delivery requires all of:

1. exact-head CI on the frozen candidate;
2. fresh independent read-only review with no blocking finding;
3. explicit operator approval naming the PR and exact head;
4. ordinary PR merge without direct or force push;
5. exact reviewed scope and bytes reachable from `main`;
6. successful push-triggered exact-main CI;
7. exact production identity and required smoke only if a later release is
   separately authorized.

Spår 2 remains open after this foundation. Historical PR #67 is the next
dependent non-authority candidate and requires a separate current-main
rebuild.
