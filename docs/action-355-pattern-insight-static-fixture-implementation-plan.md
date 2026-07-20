# Action 355: Pattern Insight Static Fixture Implementation Plan

## Purpose

- implementation_plan_status: pattern_insight_static_fixture_implementation_plan_ready
- future_fixture_implementation_approved: false
- pattern_insight_fixture_implementation_done: false
- pattern_discovery_implementation_done: false
- confidence_calibration_implementation_done: false
- runtime_work_done: false
- persistence_work_done: false
- provider_or_news_access_done: false
- deploy_readiness: false
- main_push_allowed: false
- branch: dev/safe-post-recovery-work
- rollback deploy protected: 6a501645908e4100088b7396
- clean base commit: 512a0c5

This document defines how a future minimal Pattern Insight static fixture package could be implemented. It is a static implementation plan only. It does not implement Pattern Insight fixtures, Pattern Discovery, statistical inference, confidence calibration, runtime behavior, persistence, provider access, news access, Supabase access, replay, scanner integration, ranking integration, or deployment behavior.

## Scope

The future scope is a deterministic fixture package containing representative Pattern Insight objects that conform to the Action 343 type specification and the Action 349 fixture specification.

Future fixtures would be known examples for contract tests. They would not be derived from real Learning Dataset rows, would not calculate insights, and would not act as Pattern Discovery output.

## Authoritative Dependencies

- Ture Produktspecifikation.md
- rollback deploy: 6a501645908e4100088b7396
- clean base commit: 512a0c5
- production recovery rule: runtime remains blocked until separately approved

## Upstream Action Dependencies

- Action 309: Post-Recovery Safe Development Protocol
- Action 331: Intelligence First Roadmap
- Action 335: Learning Outcome Dataset Design
- Action 337: Pattern Discovery and Confidence Calibration Roadmap
- Action 343: Pattern Insight Static Type Spec
- Action 349: Pattern Insight Static Fixture Spec
- Action 352: Snapshot-to-Learning Dataset Mapper Plan
- Action 353: Learning Dataset Static Fixture Implementation Approval Gate
- Action 354: Intelligence Context Static Fixture Implementation Approval Gate

## Explicit Non-Goals

- no Pattern Insight fixtures in Action 355
- no Pattern Discovery algorithms
- no learning aggregation
- no statistical inference
- no confidence calibration
- no confidence mutation
- no recommendation reranking
- no mapper implementation
- no Learning Dataset fixtures
- no Intelligence Context fixtures
- no runtime validation
- no production deployment
- no preview deployment
- no app/api routes
- no proxy.ts changes
- no middleware changes
- no netlify.toml changes
- no migrations
- no database schema changes
- no Supabase reads or writes
- no provider calls
- no news API calls
- no replay execution
- no scanner behavior changes
- no recommendation generation changes
- no ranking changes
- no persistence
- no runtime environment reads
- no deployment configuration

## Current Pattern Insight Contract Summary

Future fixtures must map to these Action 343 fields:

- insight_id
- insight_version
- generated_from_dataset_version
- generated_at_label
- pattern_dimension
- segment_key
- segment_description
- sample_size
- minimum_sample_requirement
- sample_window
- setup_family
- trading_window
- market_regime
- sector
- industry
- relative_strength_profile
- catalyst_type
- confidence_bucket
- outcome_summary
- confidence_summary
- effect_direction
- evidence_strength
- stability_score
- overfitting_risk
- data_quality_notes
- anti_leakage_status
- recommended_action_type
- mutation_allowed
- blocked_reason
- review_status

If a desired field is not supported by Action 343, it must be documented as deferred rather than added through a parallel fixture type.

## Future Fixture Package Boundary

Future static fixtures should model Pattern Insight contract examples only. They may represent positive, negative, neutral, weak, stale, superseded, contradictory, insufficient, and malformed cases, but they must not calculate those cases from source rows.

The package boundary is:

- hard-coded deterministic Pattern Insight literals
- optional pure validation of fixture literals
- stable fixture ordering
- documentation and static tests

The package must not become a Pattern Discovery implementation, a confidence calibration engine, a ranking input, or a runtime data source.

## Allowed Future Implementation Surfaces

When separately approved, a future implementation may add only:

- `lib/pattern-insight-static-fixtures.ts`
- optional pure fixture validation helper
- focused documentation
- focused static tests

Allowed future implementation surfaces must remain local-only, deterministic, read-only during verification, provider-free, news-free, Supabase-free, persistence-free, runtime-free, scanner-free, ranking-free, and confidence-mutation-free.

## Forbidden Implementation Surfaces

- pattern mining
- grouping algorithms
- clustering
- statistical testing
- significance calculation
- confidence recalibration
- recommendation mutation
- ranking mutation
- runtime reads
- runtime routes
- app/api routes
- app page routes
- proxy.ts
- middleware
- netlify.toml
- persistence
- database access
- Supabase reads
- Supabase writes
- migrations
- provider calls
- news calls
- replay execution
- scanner integration
- broker or execution integration

## Fixture Identity Strategy

Future fixture IDs should be deterministic and derived from explicit static inputs:

- fixture ID format: `pi_fixture:<schema_version>:<fixture_family>:<case_slug>`
- insight ID format: `pi_insight:<schema_version>:<pattern_dimension>:<segment_key>:<case_slug>`
- pattern key format: `<pattern_dimension>/<setup_family>/<segment_key>`
- segment key format: stable lowercase tokens joined with `|`
- source dataset reference format: `learning_dataset_fixture:<dataset_version>:<window_slug>`
- no random IDs
- same input -> same fixture output

## Deterministic Timestamp Strategy

Future fixtures must use fixed timestamp strings checked into source:

- generated_at_label should be a static label such as `static_fixture_generation_2026_07_11`
- first observed timestamp should be fixed
- last observed timestamp should be fixed
- dataset window start and end should be fixed
- no Date.now
- no new Date
- no wall-clock reads
- no timezone-dependent runtime formatting

## Provenance Strategy

Future fixtures should include static provenance fields that identify the fixture source and contract lineage:

- source: `static_fixture`
- generated_by: `action_355_future_fixture_plan`
- contract_source: `Action 343 Pattern Insight Static Type Spec`
- fixture_spec_source: `Action 349 Pattern Insight Static Fixture Spec`
- learning_dataset_reference: static reference only
- context_fixture_reference: static reference only when needed
- provenance_completeness: complete, partial, unknown, or invalid

Provenance must not claim a real production learning run unless a future action explicitly supplies audited static fixture rows.

## Source Dataset Reference Strategy

Future fixtures may point to a static dataset reference string but must not load or aggregate source rows. The source reference is trace metadata, not an execution dependency.

Example format:

- `learning_dataset_fixture:v1:morning_momentum_bullish_context`
- `learning_dataset_fixture:v1:partial_provenance_negative_context`
- `learning_dataset_fixture:v1:invalid_temporal_range_case`

## Sample-Size Representation

Future fixtures should represent sample size as a fixed finite integer:

- insufficient sample: under 20
- weak signal: 20-50
- moderate signal: 50-100
- strong signal candidate: 100 or more with stability
- validated signal example: fixed large sample plus explicit repeatability metadata

Sample size must be represented, not calculated.

## Support-Count Representation

Support counts should be static and explicit:

- total_samples
- eligible_samples
- excluded_samples
- visible_samples
- research_only_samples
- context_complete_samples
- context_gap_samples

Counts must be internally plausible but must not be derived during fixture construction.

## Outcome Metric Representation

Outcome metrics should be static values conforming to the Action 343 outcome_summary fields:

- target_hit_rate
- stop_hit_rate
- no_entry_rate
- open_at_window_end_rate
- ambiguous_intrabar_rate
- average_gross_r_multiple
- median_gross_r_multiple
- expectancy_r
- max_favorable_excursion_avg_r
- max_adverse_excursion_avg_r
- sample_size
- outcome_quality

No fixture helper may calculate win rate, expectancy, profit factor, median return, average return, adverse excursion, or drawdown from rows.

## Uncertainty Representation

Uncertainty should be static and advisory:

- uncertainty: low, medium, high, or unknown
- uncertainty_reason: sample size, conflicting windows, missing context, stale dataset, or invalid temporal range
- overfitting_risk: high, medium, low, or unknown

Uncertainty must not be converted into confidence mutation.

## Effect-Strength Representation

Effect direction and magnitude should be fixed categorical fields:

- effect_direction: positive, negative, neutral, mixed, or unknown
- effect_magnitude: small, moderate, large, none, or unknown
- evidence_strength: insufficient_sample, weak_signal, moderate_signal, strong_signal, or validated_signal

Effect strength must not be inferred from outcome metric values during fixture construction.

## Confidence Representation

Future fixtures may include Action 343 confidence_summary fields:

- confidence_bucket
- confidence_bucket_hit_rate
- confidence_bucket_expectancy_r
- overconfidence_gap
- underconfidence_gap
- calibration_stability_score
- confidence_sample_size
- confidence_interpretation

These fields are static research examples only. They must not mutate recommendation confidence, confidence buckets, thresholds, ranking, scanner behavior, visible cards, or Add Trade eligibility.

## Quality And Readiness Representation

Future fixtures should represent:

- evidence_quality
- data_quality_notes
- provenance_completeness
- review_status
- calibration_readiness
- recommended_action_type
- blocked_reason
- mutation_allowed: false

Calibration readiness states are static labels only:

- not_ready
- collecting
- shadow_eligible
- review_required
- calibration_candidate

## Segment And Filter Representation

Segment keys should stay compatible with existing setup and context vocabularies:

- setup taxonomy
- market regime
- sector and industry
- relative strength
- news or event context
- time-of-day window
- confidence bucket
- data freshness
- risk/reward profile

Filters must be represented as static labels, not executable query builders.

## Missing-Data Semantics

Missing optional values should be represented explicitly through:

- missing_data_reasons
- data_quality_notes
- provenance_completeness
- outcome_quality
- blocked_reason when required

Missing optional context can still produce a fixture if the case is explicitly about partial evidence.

## Unknown-Value Semantics

Unknown means the system cannot classify the value from the static fixture. Unknown must be different from missing, unavailable, stale, or invalid.

Unknown categorical values should be represented as `unknown` and should not be silently coerced into neutral evidence.

## Insufficient-Evidence Semantics

Insufficient evidence should use:

- evidence_strength: insufficient_sample
- review_status: unreviewed or reviewed_no_action
- recommended_action_type: block_until_more_data
- mutation_allowed: false

Insufficient evidence must not be promoted into confidence calibration.

## Contradictory-Evidence Semantics

Contradictory evidence should represent conflicts between windows, metrics, regimes, or provenance. It should use:

- effect_direction: mixed
- evidence_quality: contradictory
- uncertainty: high
- recommended_action_type: investigate or block_until_more_data
- mutation_allowed: false

## Stale-Insight Semantics

Stale insight fixtures should show a source dataset or last observed timestamp that is too old for calibration readiness. Stale insight fixtures may remain useful for contract testing but must be blocked from calibration candidate status.

## Superseded-Insight Semantics

Superseded fixtures should include a static superseded_by reference and a review_status showing the older insight is no longer current. Superseded fixtures must not disappear from tests because consumers need stable handling of historical insight records.

## Anti-Leakage Constraints

Future fixtures must:

- preserve observation-window boundaries
- distinguish source recommendation time from outcome time
- distinguish dataset window from insight generation time
- never embed future outcomes into recommendation-time context
- never claim causal inference from correlation
- never represent retrospective knowledge as live knowledge
- never mutate recommendation confidence
- never act as runtime Pattern Discovery output
- keep anti_leakage_status explicit

## No-Inference Constraints

The future fixture module must not calculate Pattern Insights from Learning Dataset rows.

It may only return hard-coded, deterministic fixture objects conforming to the existing Pattern Insight contract. Any helper may validate or normalize fixture literals only.

It must not:

- aggregate rows
- calculate win rate
- calculate expectancy
- calculate significance
- compare cohorts
- rank patterns
- infer effects
- generate confidence recommendations

## No-Live-Mutation Constraints

Future fixtures must keep:

- mutation_allowed: false
- scanner_behavior_changed: false
- live_ranking_changed: false
- confidence_mutation_allowed: false
- recommendation_mutation_allowed: false
- visible_card_mutation_allowed: false

Fixtures are advisory static research examples only.

## Adapter-First Constraints

Future fixtures should adapt to:

- Action 343 Pattern Insight fields
- Action 349 fixture scenarios
- Action 335 Learning Outcome Dataset concepts
- Action 336 Intelligence Context concepts
- Action 352 mapper compatibility expectations
- Action 353 and Action 354 future static fixture gates

The package should prefer adapters over new data models when existing contracts are sufficient.

## No-Parallel-System Constraints

Future fixtures must not create:

- a parallel Pattern Insight type
- a parallel Pattern Discovery pipeline
- a parallel Learning Dataset model
- a parallel Intelligence Context model
- a parallel confidence calibration system
- a parallel recommendation scoring system
- a parallel history or outcome system

## Deterministic Fixture Construction Rules

- fixture literals are sorted by fixture_id
- nested arrays are sorted by stable keys
- object serialization is stable
- IDs are derived from explicit strings
- timestamps are fixed strings
- schema version is fixed
- fixture version is fixed
- same input -> same fixture output
- no random IDs
- no Date.now
- no new Date
- no Math.random
- no runtime environment reads

## Minimum Fixture Families

Positive evidence:

- setup performs better in bullish market regime
- setup performs better with sector alignment
- setup performs better with positive relative strength
- setup performs better when news catalyst is present
- setup performs better during trend days

Negative evidence:

- setup performs worse during chop days
- setup performs worse against index direction
- setup performs worse with weak sector context
- setup performs worse near high-impact macro events
- setup performs worse when data freshness is low

Neutral or weak evidence:

- no meaningful difference detected
- small sample with promising direction
- sufficient sample but weak effect
- conflicting metrics
- inconsistent outcome across windows

Evidence-quality states:

- insufficient sample
- partial provenance
- stale source dataset
- low completeness
- unknown segment value
- missing optional context
- contradictory evidence
- superseded insight
- invalid temporal range
- malformed source reference

Calibration readiness:

- not ready
- collecting
- shadow eligible
- review required
- calibration candidate

These statuses remain static examples only and must not trigger confidence changes.

## Malformed Fixture Cases

Malformed future cases should test validators and consumers, not production behavior:

- missing insight_id
- missing segment_key
- invalid sample_window ordering
- negative sample_size
- non-finite metric value
- invalid evidence_strength
- mutation_allowed true
- unsupported recommended_action_type
- malformed source reference
- invalid temporal range

## Boundary Cases

Boundary cases should include:

- sample size 0
- sample size 19
- sample size 20
- sample size 50
- sample size 51
- sample size 100
- effect exactly neutral
- high uncertainty with positive effect
- low sample with positive metrics
- complete provenance with weak effect
- partial provenance with strong-looking metrics
- stale insight with historical usefulness
- superseded insight with valid replacement pointer

## Validation Strategy

A future pure validation layer may check fixture literals for:

- required identity fields
- supported categorical values
- sample-size bounds
- finite numeric metrics
- date ordering
- dataset window ordering
- provenance shape
- readiness state
- contradictory status combinations
- effect direction and magnitude consistency
- missing-data semantics
- stable serialization
- stable ordering
- schema version compatibility

No validator implementation is allowed in Action 355.

## Testing Strategy

Future tests should cover:

- fixture package exports deterministic arrays
- fixture IDs are stable
- fixture ordering is stable
- every fixture maps to Action 343 fields
- every fixture keeps mutation_allowed false
- positive, negative, neutral, evidence-quality, and readiness families exist
- malformed cases are isolated from normal fixtures
- no runtime, provider, news, Supabase, persistence, scanner, ranking, or confidence mutation surface is imported
- no statistical inference is implemented

## Phased Future Implementation Sequence

1. Approval gate for static Pattern Insight fixture implementation.
2. Add `lib/pattern-insight-static-fixtures.ts` with hard-coded fixture literals only.
3. Add optional pure validation helper if needed.
4. Add static tests for contract coverage, determinism, and no-mutation flags.
5. Add documentation linking fixture families to Action 343 and Action 349.
6. Keep Pattern Discovery, mapper execution, runtime integration, confidence calibration, and persistence blocked until separately approved.

## Acceptance Criteria

- plan document exists
- deterministic verifier exists
- focused static tests exist
- future implementation boundary is narrow
- fixture implementation remains absent
- Pattern Discovery remains absent
- statistical inference remains absent
- confidence mutation remains blocked
- ranking mutation remains blocked
- runtime remains blocked
- provider/news/Supabase remain blocked
- persistence remains blocked
- no schema or migration changes are made
- anti-leakage constraints are explicit
- no-inference constraints are explicit
- next approval gate is required before implementation

## Rejection Criteria

Reject a future fixture implementation if it:

- calculates Pattern Insights from Learning Dataset rows
- aggregates rows
- computes statistical significance
- calculates confidence calibration
- mutates confidence, ranking, scanner behavior, visible cards, recommendations, Add Trade, broker, execution, or risk
- reads runtime environment values
- calls providers or news APIs
- reads or writes Supabase
- persists fixtures or outcomes
- adds app/api routes, page routes, proxy.ts, middleware, netlify.toml, migrations, or schema changes
- creates a parallel Pattern Insight, Pattern Discovery, Learning Dataset, Intelligence Context, or confidence system

## Blocked Work

- Pattern Insight fixture implementation is blocked
- Pattern Discovery implementation is blocked
- confidence calibration is blocked
- recommendation reranking is blocked
- mapper implementation is blocked
- Learning Dataset fixture implementation is blocked
- Intelligence Context fixture implementation is blocked
- runtime validation is blocked
- production deployment is blocked
- preview deployment is blocked
- provider/news/Supabase access is blocked
- persistence is blocked
- schema and migration work is blocked
- replay execution is blocked

## Next Approval Gate Required Before Implementation

The next approval gate must explicitly approve future static Pattern Insight fixture implementation before any fixture code is added.

That approval gate must still keep these false unless separately authorized:

- pattern_discovery_implementation_approved: false
- statistical_inference_approved: false
- confidence_calibration_approved: false
- confidence_mutation_approved: false
- ranking_mutation_approved: false
- runtime_integration_approved: false
- provider_or_news_access_approved: false
- supabase_access_approved: false
- persistence_approved: false
- deployment_approved: false
