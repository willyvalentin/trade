# Action 666BQ governed binding snapshot issuance successor

## Scope

`canonical_governed_binding_snapshot_issuance_successor_v3` is a new
successor implementation. It does not claim to recover the lost BK, BL, BM or
BO bytes. Their previously reported hashes remain historical commitments only.

The contract is server-only, synthetic-fixture-only and default-off. It has no
writer, persistence, database, provider, route, scheduler or live call site.

## Authority and issuance

The request contains an issuance identity and the completed BD replay request.
It cannot contain an expected root, trusted authority payload, epoch, owner
approval or lookup result. A separately injected owner dependency supplies one
recognized, immutable issuer authority. The authority binds:

- external owner, issuer identity, implementation version and authority anchor;
- registry manifest/root and semantic scope;
- nanosecond issuance, evidence-cutoff and effective instants;
- publication sequence, epoch and exact predecessor;
- a closed previous-binding/capture-binding lookup plan;
- the expected issuance identity.

The authority is read once. A self-consistent caller replacement is not in the
recognized authority set and fails closed.

## Bounded validation

Before `structuredClone`, digesting or any AX/BD work, the request passes the
iterative BD bounded validator. The version-bound policy covers maximum depth,
nodes, own keys per container, array length, per-string UTF-8 bytes and total
string bytes. Cycles, accessors, proxies, symbols, unsupported values and
non-plain prototypes fail closed without exposing exception text.

Failures contain a sanitized observed-request envelope. It binds the rejection
stage, closed reasons, available request identity, top-level type, traversal
counters, first rejected path, the fixed budget digest and a bounded structural
prefix digest. It never calls this prefix a complete payload digest.

## Read-only binding observation

The issuer constructs the verified AX store only through its owner-controlled
read dependency. It invokes only:

- `lookup_previous_binding`;
- `lookup_capture_binding`.

Observed snapshot identity/digest, lookup-result digest, expected/observed
binding digest and status are bound into each observation and into a sorted
inventory digest. No write, append, update, delete, approval or rotation method
is exposed.

## Terminal taxonomy

The closed terminal statuses are:

- `issued`;
- `incomplete`;
- `conflicting`;
- `not_point_in_time_safe`;
- `rollback_rejected`.

Only `issued` contains an immutable external snapshot that subsequently passes
BD admission. `issued` does not mean approval, promotion, publication or live
activation.

## End-to-end verification

For an issued fixture the implementation:

1. verifies owner authority and bounded request bytes;
2. observes AX read-only bindings;
3. builds the external immutable snapshot;
4. creates the separately recognized BD admission authority;
5. runs BD admission and AX store construction;
6. runs AJ → AC → V → AQ;
7. independently rebuilds the binding-backed result.

The issuance terminal digest binds the request, issuer authority, semantic
scope, lookup observations, snapshot, admission authority and rebuilt replay.

## Safety

Every result binds:

```text
shadow_only:true
live_ranking_effect:false
live_impact:false
persistence_performed:false
automatic_training_allowed:false
automatic_parameter_change_allowed:false
automatic_threshold_change_allowed:false
automatic_model_change_allowed:false
automatic_promotion_allowed:false
external_ai_canonical_truth_authority:false
causal_improvement_claimed:false
synthetic_evidence:true
not_publishable:true
```

Disabled or kill-switched factories return before request reads, cloning,
authority reads, store construction, lookups, snapshot construction, BD replay
or digest work.
