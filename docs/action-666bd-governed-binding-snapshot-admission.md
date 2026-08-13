# Action 666BD — Governed Binding Snapshot Admission

## Status and scope

`canonical_improvement_binding_snapshot_admission_v1` and
`canonical_binding_backed_improvement_replay_v1` are server-only,
default-off, synthetic-fixture contracts. They do not introduce a
writer, persistence, a database relation, a provider call, a real
snapshot source, or a live call-site.

The inactive chain is:

```text
externally owned frozen snapshot
→ canonical admission
→ Action 666AX read-only store
→ Action 666AJ capture
→ Action 666AC adapter
→ Action 666V proposal
→ Action 666AQ replay
```

## Authority and admission boundary

The replay request contains no snapshot bytes, expected authority root,
trusted registry payload, lookup result, approval flag, or terminal
claim. Two separately injected owner dependencies expose:

- the expected immutable admission authority;
- the untrusted external snapshot candidate.

The authority is read exactly once. It binds owner and registry
identities, frozen manifest and root digests, snapshot identity and
digest, publication sequence/epoch, and predecessor digest. The
admission layer also requires the root, manifest, and registry identity
to match the already recognized Action 666AJ capture authority.
Consequently, a caller cannot replace both snapshot and authority with
a self-consistent alternative root.

The active harness accepts only literal `enabled:true` and literal
`kill_switch_engaged:false`. Its option, counter and dependency shells
use exact enumerable data properties: hidden keys, symbols, accessors,
proxies, sparse arrays, unexpected keys and runtime type coercion are
rejected. Both admission-authority identity/digest and capture-authority
identity/digest are independently pinned in the snapshotted dependency
boundary. Full admission-authority recognition and semantic validation
complete before the snapshot reader can run. Every rejected authority
therefore observes zero snapshot reads and zero snapshot clones.

Before cloning or hashing a snapshot,
`canonical_bounded_snapshot_validator_v1` walks the candidate with an
explicit iterative stack. It never recursively traverses caller-owned
data. The source-controlled
`canonical_bounded_snapshot_budget_policy_v1` is:

```text
max_depth:             128
max_nodes:             131072
max_keys_per_container: 4096
max_array_length:       2048
max_string_bytes:      65536
max_total_string_bytes: 8388608
```

The immutable policy and its canonical digest are bound to every
admission result. The limits exceed the synthetic golden snapshot
inventory with substantial margin: the ordinary snapshot currently
uses depth 2 and 35 observed nodes.

Untrusted runtime snapshot input enters only through the module-recognized
JSON source factory. The raw UTF-8 payload is capped at 1,048,576 bytes before
`JSON.parse`; the parsed plain object is iteratively deep-frozen, privately
branded, and stored behind a module-owned reader. Runtime performs an O(1)
brand check before traversal. An unbranded caller object or copied source shell
cannot reach the snapshot reader. A future live adapter must apply the same
raw-byte bound before parsing and cannot issue the private brand itself.

The recursive validator then provides semantic and forensic defense-in-depth
over that already byte-bounded JSON value. It reads descriptors without
evaluating property values. Hidden and symbol keys are rejected as
non-source defense-in-depth. Array
length is validated against policy before own keys are enumerated, and array
shape is then checked index-by-index without constructing an attacker-sized
expected-key list. UTF-8 accounting includes both property keys and string
values and stops as soon as the applicable per-string or remaining-total byte
budget is crossed; it never materializes a full encoded byte copy. Property
keys must pass both individual and cumulative semantic bounds before canonical
sorting or collation. No pre-allocation guarantee is claimed for arbitrary
caller-created JavaScript objects outside the branded raw-JSON source path.
Pre-sort key-budget failures use normalized container-level counters, so
equivalent key/value sets produce identical bounded evidence regardless of
insertion order.
Oversized keys use a bounded index/byte-count path label so failure
reporting cannot reproduce attacker-sized key bytes.
Accessors, symbols, cycles, custom prototypes, unsupported primitives,
descriptor/proxy failures, unknown fields, malformed closed schemas,
duplicate identities, cross-type collisions, and contradictory
observed/expected digests fail closed. A candidate is cloned only after
the bounded traversal succeeds; clone failures are sanitized too.

Budget exhaustion returns `snapshot_validation_budget_exceeded` with
the first rejected path, exact budget kind, bounded traversal counters,
policy version/digest, request identity, expected authority/root
identity, and:

```text
full_snapshot_digest_computed: false
full_snapshot_digest: null
```

Its `bounded_observation_digest` covers only this closed bounded
projection. It is explicitly not represented as a full payload digest.
Admission, lineage, and terminal digests bind it, and independent replay
rebuild recomputes it from the original candidate and external
authority. No exception text, stack trace, proxy error, or accessor
value enters canonical output.

The exported entry, snapshot and authority builders use the same closed
semantic validators as runtime admission. A public constructor cannot
mint an artifact that the trust boundary would later reject.

## Point-in-time and rollback policy

All instants use the canonical explicit-instant parser and nanosecond
precision. Admission requires:

- canonical explicit capture, evidence-cutoff, effective, entry, and
  lookup instants;
- evidence cutoff and effective instant no later than capture;
- every entry effective no later than the evidence cutoff;
- capture no later than lookup `as_of`;
- deterministic genesis or linked-predecessor semantics;
- exact externally expected sequence, epoch, and predecessor digest.

Future snapshots, evidence after cutoff, epoch rollback, and predecessor
drift are never repaired or inferred.

## Immutable AX projection

An admitted source snapshot is cloned once into canonical plain data,
deep-frozen, and deterministically projected into an AX snapshot. The
AX snapshot and projection digest are embedded in the admission result.
The AX store is constructed only from those frozen bytes and exposes
only `previous_binding` and `capture_binding` lookups. A second store is
built from the same projection and its closed observation is compared
before downstream execution.

## End-to-end replay and rebuild

The AX lookup adapters are the actual binding source for all four AQ
dependencies:

- AJ previous-binding lookup;
- AJ capture-binding lookup;
- AC previous-binding lookup;
- V proposal/experiment previous-binding lookup.

AQ canonically runs and verifies AJ, AC, and V. BD additionally rebuilds
admission, the AX store observation, and the AQ terminal result. The
terminal lineage binds the request, source and AX snapshot identities
and digests, authority/root, store observation, AQ digest, proposal
status, and rebuild decisions.

Replay verification is available only through the module-recognized
private harness authority that snapshotted the request, dependencies and
result. Callers cannot substitute raw dependencies or turn a
self-consistently rehashed alternative result into canonical evidence.
Execution counters are private snapshots; an optional caller counter
object is validated but never mutated.

The closed terminal taxonomy is:

```text
admitted
incomplete
conflicting
not_point_in_time_safe
unmappable
```

`admitted` can carry `proposal_ready`, `no_change`, `research_only`, or
`insufficient_evidence`. It never means operational approval,
promotion, training, or activation.

## Default-off and interpretation safety

The feature flag defaults to false and the kill switch defaults to
engaged. Any non-literal gate value returns before dependency access, request reads,
snapshot reads, cloning, authority verification, hashing, store
construction, lookups, or AJ/AC/V/AQ work.

Every result declares:

```text
shadow_only: true
live_ranking_effect: false
live_impact: false
persistence_performed: false
automatic_training_allowed: false
automatic_parameter_change_allowed: false
automatic_threshold_change_allowed: false
automatic_model_change_allowed: false
automatic_promotion_allowed: false
external_ai_canonical_truth_authority: false
causal_improvement_claimed: false
synthetic_evidence: true
not_publishable: true
```

The golden report is test evidence only. It is not Ture performance and
must not be published as a production scorecard.
