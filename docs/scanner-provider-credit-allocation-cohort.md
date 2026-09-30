# IF-2b provider-credit allocation cohort readback

## Purpose

This CLOSED capability turns exact persisted
`scanner_provider_credit_allocation_shadow_v1` cycle receipts into one
versioned, read-only cohort assessment. It answers only whether the frozen
`candidate_breadth_first_provider_budget_v1` counterfactual repeatedly projects
better candidate breadth than `serial_shared_provider_budget_v1` under the same
fully exercised provider-credit cap.

Candidate breadth and late-index unfunded candidates are data-fitness proxies.
They do not establish recommendation quality, calibration, expectancy or alpha.

## Admission and classification

`scanner_provider_credit_allocation_cohort_v1`:

- retains every input cycle and exact baseline/challenger policy version;
- fails closed when any cycle is invalid or observed cycles use different caps;
- remains `insufficient_evidence` until at least two cycles are `observed`;
- recomputes all aggregate counts from the retained cycle receipts;
- classifies `consistent_breadth_improvement_projected` only when every observed
  cycle projects a positive breadth delta and a negative late-unfunded delta;
- classifies a non-positive aggregate breadth delta with no late-index reduction
  as `no_projected_improvement`;
- leaves all other complete evidence as `mixed_projection`.

Its readback parser recomputes the cohort and rejects count, cap, reason-lineage
or assessment drift. The underlying v1 shadow parser also rejects inconsistent
reason lineage, impossible unfunded-deficit bounds and duplicate same-class
allocations.

## Decision boundary

A consistent projection may select only
`prepare_separate_reversible_live_experiment_contract`. That is a planning
result, not activation authority. The separate experiment must freeze its own
revision, policy, population, provider budget, rollback and OPEN acceptance
before changing live allocation. Mixed or incomplete evidence selects more
shadow evidence; no projected gain rejects the challenger.

The cohort can never call a provider, reserve credits, change live allocation,
ranking or publication, lower a threshold, publish a candidate or reach a
broker. `recommendation_quality` is always `unproven` until canonical outcomes
are compared under the complete quality charter.

## Verification

Acceptance requires focused adversarial tests for one-cycle insufficiency,
same-cap aggregation, cap mismatch, aggregate and reason-lineage tampering,
explicit no-gain rejection and observation-series integration. It also requires
TypeScript, lint, the provider-free intelligence regression, scheduled-runtime
packaging and a complete production build.

OPEN evidence remains separate: exact owner-bound terminal receipts from a
frozen regular-session series must populate at least two observed shadows before
the cohort can select the next data-fitness experiment.
