# Action 667P.2A — Immutable registry snapshot boundary

Status: additive diagnostic successor. The Action 667P.1 implementation and
Action 667P.2 freeze/review remain historical, byte-identical evidence.

## Finding remediated

`P2-001` identified a time-of-check/time-of-use boundary in V1. V1 validated
the registry returned by `read_registry`, then invoked five later
`read_source` callbacks while retaining the originally observed registry
object. A callback could mutate that object after its digest had been checked.
The clean-room probe reproduced a `captured` result whose decision instrument
had changed while the result still carried the original registry digest.

V2 does not reinterpret V1 as safe. It introduces:

- `diagnostic_decision_outcome_handoff_capture_v2`
- `diagnostic_outcome_source_registry_v2`
- `diagnostic_outcome_source_authority_v2`
- `diagnostic_outcome_authority_material_v2`
- `diagnostic_outcome_registry_snapshot_v1`

## Atomic authority boundary

One evaluation invokes exactly one externally supplied callback:
`read_capture_material()`. It must return one closed plain-data object
containing the registry and all five registered source payloads. Async
authorities are unsupported.

The implementation then performs this ordered sequence without another
callback:

1. Receive the raw authority material.
2. Inspect property descriptors without invoking accessors.
3. Reject accessors, symbols, functions, bigint, non-finite numbers, cycles,
   sparse arrays, unexpected prototypes, and unsupported runtime values.
4. Copy values into a new canonical plain-data tree with sorted object keys.
5. Deep-freeze the new tree.
6. Compute the registry snapshot digest and complete authority-material
   digest from the frozen tree.
7. Verify registry identity, version, and snapshot digest against the
   dependency-injected external anchor.
8. Verify every source payload digest and run all capture semantics using only
   the frozen snapshot.

The raw object is not returned, retained in output, or read by downstream
validation. There is no source or verifier callback after snapshot creation.

## Provenance and identity

Every terminal result binds:

- registry version and identity;
- `registry_snapshot_digest`;
- `authority_material_digest`;
- external expected registry-root digest;
- snapshot disposition;
- all five exact registered source-entry digests;
- observed source provenance;
- failure identity when non-captured;
- terminal capture digest.

Mutation of a source and its registry entry remains insufficient: the
independently owned expected registry root no longer matches. Different
rejected frozen inputs bind different observed-material/provenance and terminal
digests.

## Compatibility

Successful V2 capture continues to produce the existing
`market_context_diagnostic_outcome_bundle_handoff_v1`, allowing the frozen O.2A
join verifier to consume the handoff without an Action 665/666 implementation
import. Predictor and label projections remain separate.

V1 and V2 results are distinct contracts. A V1 result is not implicitly
upgraded to V2. Historical V1 evidence remains useful for reproducing
`P2-001`; only a V2 result carrying a verified immutable snapshot binding is
covered by this remediation.

## Default-off and safety

Default-off and kill-switch checks occur before request inspection or
authority access. They use precomputed, deeply frozen terminal sentinels.

All terminal results preserve:

```text
diagnostic_only: true
shadow_only: true
canonical_performance_eligible: false
automatic_model_input_allowed: false
automatic_training_allowed: false
automatic_promotion_allowed: false
causal_claimed: false
live_ranking_effect: false
```

The fixtures and evidence are synthetic. No real outcome capture, provider
call, database access, persistence write, canonical binding, or live effect
occurs.

## Rollback and no-effect policy

V2 is add-only and default-off. Rollback means ceasing to instantiate V2;
there is no persistence, migration, provider, model, ranking, or publication
state to reverse. V1 must not be re-enabled as a substitute for V2 because its
historical TOCTOU finding remains intentionally preserved.
