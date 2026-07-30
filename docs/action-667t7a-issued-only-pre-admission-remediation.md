# Action 667T.7A — Issued-only pre-admission successor

## Decision

`repository_owned_recommendation_outcome_evidence_issuance_v3` is an
additive, diagnostic-only successor to the published T.2A V2 contract. It
closes finding `T7-001` without modifying any T.1, T.2, or T.2A artifact.

The V2 boundary checked its issuance wrapper before calling S.2A, but did not
fully reproduce S.2A's closed completion-material schemas. A caller could add
an unknown field to `completion_material`, recompute the locally visible
digests and authority fixture, and cause V2 to construct an S.2A request and
call S.2A before S.2A rejected the payload. V3 classifies the entire observed
completion material first.

## Mandatory ordering

The V3 pipeline is:

1. Return immediately when disabled or kill-switched.
2. Validate the V3 request.
3. Snapshot the V2 external issuer anchor without evaluating accessors.
4. Read the issuance material exactly once.
5. Produce a bounded plain-data projection.
6. Validate all issuance and completion schemas, identities, roots, digests,
   gap closures, temporal ordering, membership, finality, completeness,
   lineage, original R.2 gap contract, and completed R.2 projection.
7. Establish `issued` or a non-issued terminal status.
8. Only for locally established `issued`, construct the predecessor request
   and invoke the unchanged T.2A/S.2A path using the frozen observed bytes.

For every non-issued result:

```text
s2a_request_constructed:false
s2a_called:false
downstream_digest_work:false
```

No S.2A result field exists.

## Canonical and adversarial boundaries

All nested objects use closed schemas. Gap closures are treated as a semantic
set: the exact 18 codes must be unique and canonicalized by gap code before
attestation comparison. Unknown, missing, duplicate, or invalid closure
members fail closed. A closure that is genuinely re-issued by the external
authority with a new evidence identity remains admissible; caller-side
substitution without the authority-bound digests does not.

The pre-admission canonicalizer is iterative and bounded by explicit depth,
node, key, array, and string budgets. It rejects accessors, non-plain
prototypes, proxies that prevent safe introspection, cycles, symbols,
unsupported runtime values, sparse arrays, and over-budget structures with
sanitized reason codes.

Failure identity binds the closed taxonomy, sorted reason codes, and digests
of the actually observed issuance material, issuer registry, completion
material, completion registry, repository row, and evidence bundle.
Different rejected observed bytes therefore do not collapse to the same
failure identity.

## T7-001 regression

The frozen synthetic attack adds:

```text
completion_material.unexpected_self_consistent_field = "x"
```

and recomputes the predecessor admission and registry digests. V2 reaches
`s2a_request_constructed` and `s2a_called` before its sanitized divergence
error. V3 returns `unmappable` with
`completion_material:closed_schema_violation` and records zero downstream
work.

## Safety status

```text
diagnostic_only:true
shadow_only:true
real_outcome_source_accessed:false
canonical_binding_ready:false
automatic_model_input_allowed:false
live_ranking_effect:false
```

The artifacts and fixtures contain synthetic evidence only. There is no
provider, database, writer, persistence, deployment, or real outcome-source
activity.
