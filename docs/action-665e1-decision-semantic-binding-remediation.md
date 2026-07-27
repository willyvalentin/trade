# SPÅR 2 — Action 665E.1: Decision Semantic Binding Remediation

Status: implemented locally, inactive and fixture-only.

## Scope

This remediation closes only the two major findings from the Action 665E
re-review and completes the prior-binding tuple. It changes no scanner,
generator, route, provider, persistence path, migration, feature
configuration, writer or live call-site.

## Canonical decision semantic binding

`canonical_decision_semantic_binding_v1` is derived inside the canonical
opportunity-set builder. Caller-supplied terminal aliases are not accepted.
The binding contains:

- one exclusive overall disposition:
  `publish_recommendations`, `explicit_no_trade` or
  `deterministic_fallback`;
- one derived terminal disposition per candidate, including published,
  fallback-published, rejected, overflow, under-threshold and explicit
  no-trade terminals;
- the sorted decision-lineage node graph;
- canonical explicit no-trade semantics or `null`;
- candidate-set, lineage-graph and version-bundle digests;
- its own canonical semantic digest.

The binding digest is included in `decision_evidence_digest`. The canonical
opportunity-set verifier reconstructs the binding from stored candidates,
lineage, versions and no-trade semantics before accepting replay.

## Explicit no-trade join

An explicit no-trade decision requires:

```text
bundle producer decision identity
= explicit no-trade evidence producer identity
= exactly one no-trade lineage-node identity
= every candidate no-trade lineage reference
= every expected outcome no-trade lineage reference
```

The node must have null candidate and snapshot identities. Coordinated
renaming of the candidate, outcome/evaluator and decision-node subgraph cannot
detach it from the explicit producer decision.

A rejected-candidate decision can only be built when the candidate's derived
terminal binding is rejected, overflow or under-threshold under a publish or
fallback disposition. It cannot be emitted from an explicit no-trade binding,
preventing one canonical decision identity from acquiring two sample types.

## Complete previous-binding tuple

The mandatory previous-binding lookup compares:

- producer decision identity;
- exclusive decision disposition;
- explicit no-trade producer identity or `null`;
- full candidate-set digest;
- decision-evidence digest;
- decision-semantic-binding digest;
- lineage-graph digest;
- version-bundle digest.

An identical retry produces byte-identical evidence. Any changed disposition,
candidate membership, no-trade identity, decision graph, expected evaluator
lineage or version bundle under the same producer identity returns
`identity_conflict`.

## Golden evidence

Focused synthetic tests cover:

- identical retry/no effect and byte-identical replay;
- publish → fallback and publish → no-trade;
- no-trade → publish and fallback → no-trade;
- changed no-trade producer identity;
- coordinated no-trade lineage renaming;
- changed expected evaluator lineage;
- unchanged disposition with changed candidate membership;
- changed version bundle;
- cryptographic separation of all supported candidate terminal classes.

These fixtures are contract evidence only, not Ture production performance.

## Remaining producer integration

A future separately authorized producer change must create the existing
pre-truncation capture evidence at the real capture boundary, derive
identities and versions from producer state, and implement the previous
binding lookup atomically with any future persistence. This Action does none
of those integrations.
