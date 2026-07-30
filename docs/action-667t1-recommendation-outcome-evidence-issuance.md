# Action 667T.1 — Recommendation outcome evidence issuance

## Status

`repository_owned_recommendation_outcome_evidence_issuance_v1` is a
default-off, read-only and diagnostic-only contract. It issues a synthetic
immutable evidence envelope that the already versioned S.2A completion
contract can consume. It does not read a provider, database, repository
writer, production outcome source or persistence layer.

The closed terminal taxonomy is:

```text
issued
incomplete
conflicting
not_point_in_time_safe
unmappable
```

Only `issued` exposes `completion_material`. Every other terminal state
returns `issuance_envelope:null`, so it cannot enter S.2A, R.2, Q.1, P.2A or
O.2A.

## External authority

The public request names only the issuance, repository row and evidence
bundle identities. It cannot supply issuer authority, finality, verifier
outcomes or trust roots. The issuer authority is dependency-injected and
binds:

- issuer identity and version;
- authority-anchor and registry digests;
- trust-root digest;
- minimum monotonic issuer epoch;
- exact predecessor issuance digest;
- one read-only material callback.

The authority object and anchor use closed schemas. Property descriptors are
inspected without invoking getters. The bounded S.2A plain-data canonicalizer
creates the anchor snapshot before the material callback is invoked. The
callback is invoked exactly once, and only the snapshotted anchor bytes are
used downstream. Accessors, proxies, cycles, unsupported values and budget
violations fail closed with sanitized reason codes.

## Issued envelope

An issued envelope binds:

- issuer identity, version, epoch, predecessor and authority anchor;
- repository row identity and observed digest;
- evidence bundle identity and observed digest;
- source, bundle and trust-root digests;
- all 18 exact S.2A closure-evidence records;
- nanosecond source, receive, finalization and evaluation instants;
- immutable opportunity-set membership;
- model, evaluator, outcome and explanation lineage;
- completion and finality proofs;
- terminal issuance identity and digest.

Before issuance, the embedded completion material is executed through
`repository_owned_recommendation_outcome_evidence_completion_v2`. An envelope
is issued only when that result is exactly `completed`. The handoff therefore
does not special-case or weaken S.2A.

Issuer epochs are unsigned decimal integer strings. An observed epoch below
the externally anchored minimum is rejected as rollback. The predecessor
digest must match exactly even if a caller recomputes a self-consistent
registry digest.

## Failure provenance

Every failure binds canonical, sanitized observations for:

```text
issuance_material
issuer_registry
completion_registry
repository_row
evidence_bundle
```

Absent values use a canonical sentinel. Present rejected values retain their
own recomputed digest. Raw rejected payloads, stack traces and exception
messages are never returned. Consequently, different rejected row or bundle
observations produce different provenance, failure-identity and terminal
digests even when taxonomy and reason codes are identical.

## Default-off boundary

When disabled or killed, the contract returns before inspecting the request
or authority. It performs no callback, cloning, authority lookup, S.2A work
or input-dependent digest work.

All results preserve:

```text
diagnostic_only: true
shadow_only: true
read_only: true
real_outcome_source_accessed: false
canonical_performance_eligible: false
automatic_model_input_allowed: false
automatic_training_allowed: false
automatic_promotion_allowed: false
causal_claimed: false
live_ranking_effect: false
```

## Synthetic validation

The synthetic matrix covers all five terminal states, all 18 closures,
authority and registry substitution, epoch rollback, predecessor drift,
point-in-time failure, malformed runtime values, failure collisions,
default-off and kill-switch behavior. It contains no real outcome row or
private identity.

The positive fixture proves the unchanged chain:

```text
T.1 issued
→ S.2A completed
→ R.2 bindable
→ Q.1 ready
→ P.2A captured
→ O.2A joined
```

UTC, Europe/Stockholm and America/New_York produce byte-identical canonical
matrix output. Reversing scenario input order also produces the same output.

This contract does not authorize a real source, canonical binding, automatic
model input, live ranking, persistence or performance claims.
