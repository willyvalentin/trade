# Action 666AJ — Completed Improvement Evidence Capture Contract

This package is an inactive, server-only producer boundary for completed
governed-improvement evidence. It creates the exact in-memory bundle consumed by
the Action 666AC adapter. It has no live call-site, persistence boundary,
provider access, database access, or automatic change path.

## Contract

`canonical_completed_improvement_evidence_capture_v2` has exactly three
terminal states:

- `captured`: every required producer output is complete, canonically verified,
  joinable, point-in-time safe, authority-bound, and collision-free.
- `conflicting`: canonical verification proves a contradiction, semantic drift,
  authority substitution, or identity collision.
- `incomplete`: an explicit producer output or joinable lineage is absent. No
  field is inferred.

The caller provides explicit completed outputs, but cannot attest that they are
verified, complete, comparable, out-of-sample, point-in-time safe, or
reproducible. Those properties come only from the existing Action 664–666
canonical verifier chain. The governed proposal registry/root is supplied
through a separately recognized authority object. Previous proposal,
experiment, and capture bindings are read through dependency-injected,
read-only lookup interfaces.

Action 666AL adds
`canonical_completed_improvement_lookup_observation_v1`. Every lookup records
its contract, namespace, capture-request identity, queried binding identity,
expected digest, observed `absent | matching | conflicting | lookup_failed`
status, observed digest when available, sanitized failure class, and a
content-addressed observation digest. Conflict evidence has a separate
collision identity/digest. No exception message, stack trace, or backend detail
is retained.

## Bound evidence

The canonical capture binds the capture and producer identities, cohort and
period, full opportunity membership, baseline/candidate version tuples,
quality/protected metric inventories, paired shadow evidence, frozen OOS
learning evidence, canonical explanations, evaluator/outcome lineage,
provider/context provenance, point-in-time evidence, all external roots, source
namespace digests, the Action 666AC bundle digest, and a final capture digest.

Every terminal result also uses
`canonical_completed_improvement_terminal_result_v1`. Its digest binds the
canonical sorted lookup-observation inventory in addition to the status,
request identity/input digest, reason codes, safety flags, and captured bundle
when present. Thus `absent` and `matching` retries remain separately auditable,
different collisions cannot share failure evidence, and every terminal result
can be rebuilt independently.

The completion instant must be an explicit instant and cannot precede any
verified upstream outcome/evaluation completion. A prior identity with different
semantics fails closed.

## Default-off producer harness

The default is `enabled=false` with the kill switch engaged. Activation requires
literal `enabled: true` and literal `kill_switch_engaged: false`; every omitted,
undefined, null, numeric, string, object, array, accessor, or otherwise
non-literal value remains closed. Both gates are checked before authority,
lookup, or caller-counter access and before request reads, cloning, registry
lookup, upstream verification, bundle construction, or digest work.

The active harness accepts only exact enumerable data-property option and
dependency shapes. It snapshots the recognized authority and lookup method
properties once at construction. Caller-owned counters are copied, never
mutated, and only deeply frozen private snapshots are exposed. Requests,
results, nested objects, and arrays reject accessors, symbols, hidden or extra
keys, cycles, non-finite values, sparse arrays, and extra array properties.
Authority snapshots require exact boundary, registry, post, and canonical
payload bytes. Empty authority arrays remain empty, so they cannot erase their
element contract. Requests and results must also survive canonical cloning;
transparent, stateful, or throwing Proxy values therefore have no evidence
authority. Malformed runtime input returns a sanitized, deterministic,
never-throw diagnostic that cannot be verified as canonical evidence.

Verification requires the original module-privately branded frozen harness and
its private canonical capture function. A copied, forged, disabled, malformed,
or unavailable harness has no verification authority. The harness performs no
persistence or write and exposes no activation call-site.

A `captured` bundle is passed directly to
`projectCanonicalCompletedImprovementEvidence` from Action 666AC. No adapter
special case or caller-supplied eligibility flag is used.

All outputs are:

```text
shadow_only: true
live_ranking_effect: false
persistence_performed: false
automatic_training_allowed: false
automatic_change_allowed: false
automatic_promotion_allowed: false
```

Golden evidence is synthetic fixture evidence only. It is not publishable and
does not describe Ture's production performance.
