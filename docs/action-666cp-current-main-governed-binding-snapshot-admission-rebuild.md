# Action 666CP — Current-main governed binding snapshot admission rebuild

## Decision

Historical PR #67 remains an open stacked non-authority and must not be merged
as-is. Its five normative admission artifacts are rebuilt additively from
exact current-main base
`315eae107d4860b0d1fa126112eeb46d625c83e8` and tree
`6de7cb8ded4b2f0c7ba59d72f0bf5ce5c600690d`. Historical PR #67 head
`4f731a3c92c9b4fbdb1a33848a5371410d703a45` is provenance only.

Historical BE/BF freeze manifests, review reports and threat matrices are
deliberately not imported. They cannot authorize this current-main rebuild.

## Exact normative scope

1. `docs/action-666bd-golden-binding-backed-replay-report.json`
2. `docs/action-666bd-governed-binding-snapshot-admission.md`
3. `lib/server/canonical-governed-binding-snapshot-admission-fixtures.ts`
4. `lib/server/canonical-governed-binding-snapshot-admission.ts`
5. `tests/e2e/action-666bd-governed-binding-snapshot-admission.spec.ts`

Their exact per-file hashes and sorted-path aggregate are bound in
`docs/evidence/action-666cp-current-main-governed-binding-snapshot-admission/foundation-freeze-manifest.json`.

## Function in Ture

This foundation joins the current-main Spår 2 chain into one deterministic,
owner-authorized read path:

```text
external owner snapshot authority
→ bounded snapshot validation and admission
→ frozen AX binding-store projection
→ completed capture
→ evidence adapter
→ governed proposal
→ deterministic end-to-end replay and private rebuild verification
```

It lets Ture distinguish an admitted, incomplete, conflicting,
not-point-in-time-safe or unmappable binding snapshot before any downstream
proposal is interpreted. It adds no writer, publisher, database table,
filesystem store, provider call or live consumer.

## Current-main runtime remediation

The historical implementation is hardened before freezing:

1. activation requires literal `enabled:true` and literal
   `kill_switch_engaged:false`; every other runtime value closes before
   dependency reads;
2. active options, caller counters and dependencies require exact enumerable
   data-property shells with no hidden keys, symbols, accessors or proxies;
3. admission and capture authority identities/digests are independently
   pinned in the construction-time dependency snapshot;
4. complete admission-authority recognition, semantic validation and digest
   validation finish before the snapshot reader may run;
5. snapshot validation rejects cycles, proxies, accessors, symbols, sparse or
   augmented arrays, non-finite values, unsupported primitives, non-plain
   objects and budget overflow without throwing;
6. authority, snapshot, request and result bytes are isolated from later
   caller mutation;
7. entry, predecessor, snapshot and authority builders share the runtime's
   exact semantic validation and cannot mint artifacts runtime rejects;
8. duplicate identities, cross-type collisions, rollback, future evidence,
   manifest/root drift and self-consistently rehashed alternatives fail closed;
9. AX store and AQ replay use the current-main authority-pin and private-harness
   APIs introduced by Actions 666CO and 666CN;
10. replay verification accepts only a module-recognized private harness
    authority, never caller-supplied raw dependencies;
11. execution counters are module-private snapshots; caller counters are
    shape-checked but never mutated;
12. predecessor containment oracles enumerate every new server-only consumer.

## Preserved boundary

The admission chain remains server-only, synthetic-only, fixture-only,
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

Spår 2 remains open after this foundation. Historical PR #72 is the next
dependent non-authority candidate and requires a separate current-main
rebuild.
