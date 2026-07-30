# Action 667T.2A — Issued-only downstream invocation remediation

## Decision

`repository_owned_recommendation_outcome_evidence_issuance_v2` is the
additive successor to the historical T.1 contract. It closes finding
`T2-001` by completing a T-native pre-downstream admission before any S.2A
request construction, invocation, or result-digest binding.

T.1 and the T.2 freeze/review remain immutable historical evidence. A T.1
result is not implicitly upgraded to T.2A.

## Status-before-downstream boundary

The V2 verifier performs these phases in order:

1. Return immediately for default-off or kill-switch mode.
2. Validate the closed public request without accepting caller authority,
   finality, or trust claims.
3. Atomically snapshot the externally supplied issuer authority.
4. Read and bounded-canonicalize the issuance material once.
5. Validate registry, epoch/predecessor, identities, digests, the complete
   18-gap closure set, nanosecond temporal ordering, and the externally
   anchored pre-downstream admission.
6. Select one closed T taxonomy.
7. Only when that taxonomy is `issued`, construct and invoke S.2A and bind
   its result digest.

The four non-issued taxonomies return before step 7:

- `incomplete`
- `conflicting`
- `not_point_in_time_safe`
- `unmappable`

Their results have three zero counters:

```text
s2a_request_construction_count: 0
s2a_call_count: 0
s2a_result_digest_work_count: 0
```

They omit `s2a_completion_result_digest`; a `null` placeholder is not used.
Failure identity continues to bind the request, authority snapshot, observed
rejected material sections, terminal taxonomy, and deterministic reason
codes. No downstream result is manufactured for a failure.

## T2-001 reproduction and closure

The historical V1 probe intentionally supplies a material with one missing
gap closure. It returns `incomplete` after S.2A has already run and therefore
exposes an S.2A result digest. This reproduces `T2-001` without changing V1.

The corresponding V2 probe returns `incomplete` with:

- no S.2A request;
- no S.2A call;
- no downstream digest work;
- no S.2A result field.

Instrumented step observations separately cover valid `issued`, missing
closure, conflicting registry, unsafe temporal ordering, malformed material,
default-off, and kill-switch paths.

## Compatibility

V2 uses a versioned issuer registry and
`repository_owned_recommendation_outcome_evidence_pre_downstream_admission_v2`.
The admission binds:

- the canonical completion-material digest;
- the canonical sorted gap-closure-set digest;
- expected S.2A terminal taxonomy `completed`;
- V2 verifier identity and version;
- its own canonical digest.

On the `issued` path, the completion material remains byte-equivalent to the
predecessor’s verified S.2A input. The synthetic interoperability proof
therefore remains:

```text
T.2A issued
→ S.2A completed
→ R.2 bindable
→ Q.1 ready
→ P.2A captured
→ O.2A joined
```

No special-case adapter, actual outcome source, provider, database, writer,
canonical binding, model input, training, promotion, or live path is added.

## Frozen diagnostic boundary

All outputs preserve:

```text
diagnostic_only: true
shadow_only: true
real_outcome_source_accessed: false
canonical_performance_eligible: false
automatic_model_input_allowed: false
automatic_training_allowed: false
automatic_promotion_allowed: false
causal_claimed: false
live_ranking_effect: false
```

The golden matrix is entirely synthetic. It contains 12 scenarios:

- 2 `issued`;
- 3 `incomplete`;
- 5 `conflicting`;
- 1 `not_point_in_time_safe`;
- 1 `unmappable`.

Reversed closure order and reversed scenario construction produce the same
canonical result digest.
