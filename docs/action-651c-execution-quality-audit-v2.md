# Action 651C — execution audit failure provenance and immutable input V2

## Additive boundary

Action 651C preserves every Action 651A and 651B byte and adds
`action_651c_execution_quality_audit_v2`. V2 remains local, in-memory,
default-off and diagnostic-only. It delegates confirmed synthetic replay to the
frozen V1 predecessor only after a bounded immutable snapshot succeeds.

V2 creates no real-broker evidence and makes no performance, causal or
execution-quality claim from synthetic data.

## Bounded single-read snapshot

After the two zero-work gate reads, the enabled path obtains root property
descriptors once. Required inputs must be data properties. Plain-data
components are copied from descriptor values, not through property access.
Before recursive inspection V2 rejects ECMAScript proxies with
`node:util.types.isProxy`.

The snapshot policy rejects:

- accessors without executing getters;
- proxies;
- cycles;
- descriptor inspection exceptions;
- functions and non-plain prototypes;
- sparse or malformed arrays;
- depth above 12;
- more than 512 nodes;
- more than 2048 properties;
- more than 65,536 UTF-8 string bytes.

Rejections expose only a closed reason, bounded path, counters and a canonical
rejection-witness digest. Rejected values and exception text are never echoed.

Timezone-equivalent instants and broker-event order are canonicalized in the
verified copy. The verified snapshot is deep-frozen. V1 receives only those
frozen diagnostic bytes together with the original frozen
provenance-authority handles needed by the 650S/650U WeakMap/WeakSet checks.

## Failure provenance V2

Every enabled result, including `failure_kind:none`, binds:

- execution, lifecycle and runtime-context identity;
- preparation trace and observed preparation digest;
- handoff, canonical payload, idempotency and correlation identity;
- confirmation request, capability and observed capability digest;
- pre-consumption state and post-consumption receipt;
- session identity, session timestamps and temporal-policy version;
- confirmed and consumed instants;
- replay trace, replay evidence and terminal digest;
- digests for every successfully observed diagnostic component;
- a sanitized rejection-witness digest when snapshotting fails.

The failure-lineage digest covers the complete projection. The failure digest
covers the failure class, closed reason, snapshot-rejection class and complete
failure lineage. Two execution lineages with the same failure class therefore
produce independently reproducible but distinct failure digests.

V2 exports independent rebuild functions for snapshot, failure lineage,
failure evidence and complete audit evidence. Runtime verification additionally
requires the original provenance-registered, deeply frozen result. A cloned
record remains rejected even if every public digest is self-consistently
recomputed.

## 651B remediation

`651B-M1` is closed by full failure-lineage binding. The focused matrix first
reproduces the V1 collision, then proves distinct V2 failure digests.

`651B-M2` is closed by descriptor inspection and immutable snapshotting. The
focused matrix first observes two V1 getter executions with a changing price,
then proves that V2 rejects the same accessor with zero getter executions.

Proxy, cycle, budget, self-consistent digest-tampering and post-verification
mutation cases are separately covered.

## Safety and effects

The V2 implementation imports only `node:util` proxy detection and the frozen
650S/650U/651A local successor graph. It has no route, UI, provider, network,
browser, CDP, credential, BankID, persistence, Supabase-write, process-spawn or
live execution edge. No dependency, migration or lockfile is introduced.

```text
diagnostic_only:true
real_broker_evidence:false
performance_eligible:false
automatic_execution_allowed:false

real_broker_submission:false
avanza_live_access:false
credential_access:false
automatic_execution:false
trade_mutation:false
production_write:false
```
