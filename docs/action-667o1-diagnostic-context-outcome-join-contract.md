# Action 667O.1 — Diagnostic Context-to-Outcome Join Contract

## Scope

`market_context_diagnostic_context_outcome_join_v1` is a server-only,
fixture-only and default-off boundary for associating an externally verified
Action 667N.2A decision-time context snapshot with a separately verified
outcome bundle after its outcome window has completed.

This Action creates no real historical join. It imports no Action 665/666
implementation and has no provider, database, persistence, canonical, model,
training, promotion or live consumer.

## Public request versus external authority

The public request contains only:

- the join-contract version;
- an external join identity;
- context-snapshot and outcome references;
- decision, instrument and opportunity-set references.

It cannot contain a trusted payload, expected root or verification outcome.
Recursive caller assertions including `canonical`, `verified`,
`point_in_time_safe`, `complete`, `out_of_sample`, `profitable` and `causal`
fail closed.

The dependency-injected authority independently supplies:

- an expected registry anchor;
- the anchored context and outcome registry;
- a verified N.2A snapshot handoff;
- a verified outcome handoff.

Registry content is self-digested and must match the independently injected
anchor. Handoff contents must match their registry entries. Self-consistent
caller or payload substitution therefore cannot establish authority.

Default-off and the kill switch run before request inspection, cloning,
registry reads, verifier calls or join construction.

## Closed taxonomy

Every evaluated request ends in exactly one of:

```text
joined
insufficient_context
incomplete_outcome
conflicting
not_point_in_time_safe
unmappable
```

`joined` means only that an offline diagnostic association can be represented.
It is not evidence of performance, probability, causality, canonical
eligibility or model-input eligibility.

## Identity and projections

The join identity binds the canonical decision and timestamp, instrument,
complete opportunity membership, context snapshot and N.2A registry,
finalized-bucket policy, baseline/candidate/evaluator versions, outcome window
and completion, target/stop/horizon definitions, cost/slippage provenance,
provider/evaluator lineage, period, cohort, dataset and join-contract version.

Predictor and label data are separate:

- `predictor_projection` contains only decision-time context and source roots;
- `label_projection` contains only the later completed outcome and its lineage;
- each projection has its own digest;
- `diagnostic_association` binds those digests without copying label data into
  the predictor projection.

Duplicates and self-consistent identity collisions fail closed.

## Temporal boundary

The contract enforces:

```text
context observations
≤ latest finalized bucket
≤ decision instant
< outcome interval
≤ outcome completion
≤ evaluation/capture instant
```

N.2A point-in-time and finalization counters must remain zero. Its latest
finalized bucket must remain exactly bound to the externally registered
watermark. Provider source and receive timestamps are checked separately.
Pending outcomes never produce labels.

Outcome RFC 3339 instants accept only the strict explicit-instant parser.
They canonicalize losslessly to Unix nanoseconds before bundle, label and
result digests are computed. Offset-equivalent instants therefore produce
byte-identical results, and one-nanosecond boundary differences remain exact.

## Diagnostic boundary

Every result binds:

```text
diagnostic_only: true
shadow_only: true
official_ohlcv: false
canonical_performance_eligible: false
automatic_model_input_allowed: false
automatic_training_allowed: false
automatic_promotion_allowed: false
causal_claimed: false
live_ranking_effect: false
```

The result also distinguishes observed context, canonical-derived identifiers,
later observed outcome, diagnostic association and an explicitly untested
research hypothesis. Probability mapping and performance publication are
false.

## Synthetic evidence

The golden matrix covers valid, insufficient, conflicting, incomplete,
not-yet-complete, future-context, unfinalized-bucket, identity, evaluator
lineage, timestamp, duplicate, default-off and kill-switch cases.

The existing 60 N.2A snapshot identities are read only for interface
compatibility. No real outcome row is created, inferred or joined.

## No-effect and rollback

The implementation has no live importer and is unreachable unless a caller
explicitly injects `enabled:true`, `kill_switch:false` and a valid external
authority. Rollback is deletion of the five O.1 foundation artifacts; no
database, migration, provider or external-data reversal is required.
