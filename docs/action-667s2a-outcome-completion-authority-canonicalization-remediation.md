# Action 667S.2A — Outcome completion authority and canonicalization V2

Status: additive diagnostic successor. The S.1 implementation and the S.2
freeze/review remain immutable historical evidence.

## Contract identity

- Contract: `repository_owned_recommendation_outcome_evidence_completion_v2`
- Authority:
  `repository_owned_recommendation_outcome_evidence_authority_v2`
- Authority snapshot:
  `repository_owned_recommendation_outcome_evidence_authority_snapshot_v2`
- Observed-input provenance:
  `repository_owned_recommendation_outcome_evidence_provenance_v2`
- Validator:
  `repository_owned_recommendation_outcome_evidence_bounded_validator_v2`

V1 outputs do not implicitly satisfy V2. A caller must invoke the V2 entry
point with an externally owned V2 authority. V2 uses the frozen V1 semantic
completion core only after V2 has independently snapshotted authority,
bounded and sanitized all observed material, and canonicalized the gap
closure set.

## Authority boundary

The V2 entry point returns before reading its request or authority when
disabled or kill-switched. When enabled, it:

1. validates the closed request;
2. reads the authority object's own descriptors without invoking accessors;
3. copies the authority anchor to bounded plain data and deep-freezes it;
4. retains the callback descriptor separately;
5. invokes that callback exactly once;
6. never consults the mutable authority or original anchor again.

Accessor properties, hostile introspection/proxy traps, callback exceptions
and non-plain authority state return sanitized terminal results. Exception
messages and raw rejected payloads never enter evidence.

## Bounded validation

All request, authority-anchor and material observations use an iterative
worklist. Recursion is prohibited. Fixed V2 limits are:

- depth: 64;
- nodes: 20,000;
- total object keys: 50,000;
- array length: 4,096;
- aggregate UTF-8 key/string bytes: 1,048,576.

Cycles, repeated references, accessors, symbols, sparse arrays, unexpected
prototypes, unsupported runtime values, non-finite numbers and failed runtime
introspection are rejected with deterministic reason codes. The sanitized
plain-data projection—not the original object—is digest-bound and is the only
representation used downstream.

## Closure-set semantics

`gap_closures` is a semantic set. V2 enforces:

- the exact closed five-field closure schema;
- one closure per known V1 gap code;
- no duplicate or unknown gap;
- exactly all 18 gap codes;
- deterministic lexical sorting by `gap_code`;
- serialization and digesting only after sorting.

Consequently, reordered but semantically identical closures produce the same
completed projection, V1-core result, V2 result and golden digest.

## Failure provenance

Every observed completion material has four closed provenance sections:

- completion material;
- completion registry;
- repository row;
- evidence bundle.

Present material rejected before or by the V1 semantic core is marked
`present_rejected`. Each section binds its sanitized observed digest.
Actually absent sections use a namespace-specific sentinel digest. Terminal
failure identity binds the request, authority snapshot, all four observed
sections and sorted reason codes. Different rejected row or bundle bytes
therefore cannot collapse to one failure identity.

## Historical finding closure

- `S2-001`: the pre-callback authority snapshot prevents callback mutation
  from repairing or replacing the verified anchor; proxy/accessor failures
  are sanitized.
- `S2-002`: the iterative validator stops deep, cyclic or oversized inputs at
  explicit budgets without recursive exceptions.
- `S2-003`: gap closures are a closed, unique, sorted semantic set.
- `S2-004`: early registry/core rejections preserve actual observed row and
  bundle identities as `present_rejected`.

The V1 adversarial suite remains retained and continues to reproduce the
historical defects. The V2 suite proves the successor closes them.

## Diagnostic boundary

The synthetic successful chain remains:

`V2 completed → R.2 bindable → Q.1 ready → P.2A captured → O.2A joined`.

This does not authorize or perform real source access. Every V2 output keeps:

```text
diagnostic_only: true
canonical_performance_eligible: false
automatic_model_input_allowed: false
live_ranking_effect: false
```

No database, provider, writer, persistence, canonical binding or live path is
introduced.
