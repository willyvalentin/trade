# Replay With Signal Package Static Summary

## Purpose

This static summary evaluator aggregates one or more `ReplayWithSignalPackageResult` objects into in-memory metrics for future replay/backfill review. It is designed for deterministic fixture and simulation output, not production execution.

This summary evaluator is pure/in-memory and does not execute replay in production, call providers, read/write Supabase, persist synthetic outcomes, mutate recommendations, or affect scanner/ranking.

## Input And Result Relationship

Input:

- `ReplayWithSignalPackageResult[]`

Output:

- `ReplayWithSignalPackageStaticSummary`

The summary keeps total counts, interpreted counts, blocked/failed counts, unsafe input counts, replay dry-run counts, outcome breakdowns, R multiple aggregates, no-effect safety flags, blockers, warnings, and a stable interpretation label.

## Outcome Breakdown

The breakdown includes counts for:

- `total_results`
- `counterfactual_results_available`
- `no_entry_triggered`
- `target_hit`
- `stop_hit`
- `open_at_window_end`
- `ambiguous_intrabar_conservative_stop`
- `blocked`
- `failed`

Blocked and failed results are excluded from `interpreted_results`.

## R Multiple Aggregation

R multiple aggregation uses only finite numeric `gross_r_multiple` values:

- `average_gross_r_multiple`
- `best_gross_r_multiple`
- `worst_gross_r_multiple`

Null, undefined, and non-finite values are ignored. If no finite R values exist, the aggregate values are `null`.

## Rate Calculation

Rates use `interpreted_results` as the denominator when available:

- `target_hit_rate`
- `stop_hit_rate`
- `no_entry_rate`
- `open_at_window_end_rate`
- `ambiguity_rate`

When there are no interpreted results, rates are `null`.

## Safety And No-Effect Aggregation

The summary marks input unsafe if any result has one of these flags set:

- `provider_call_executed`
- `supabase_write_executed`
- `synthetic_outcomes_persisted`
- `scanner_behavior_changed`
- `live_ranking_changed`
- `recommendation_rows_mutated`

`all_no_effect_flags_safe` is true only when all of those flags are false across all input results.

`replay_executed_count` counts only safe completed counterfactual dry-run style results.

## Summary Statuses

- `empty`: no input results.
- `safe_summary_available`: at least one interpreted result and no unsafe flags.
- `blocked`: results exist, but all are blocked or failed.
- `unsafe_input_detected`: one or more unsafe no-effect flags were true.

## Interpretation Labels

Stable labels:

- `no_results`
- `unsafe_summary`
- `all_blocked_or_failed`
- `target_positive_sample`
- `stop_negative_sample`
- `mixed_sample`
- `mostly_no_entry`
- `mostly_open_at_window_end`
- `ambiguity_detected`

The labels are advisory only and do not change scoring, ranking, scanner behavior, recommendations, persistence, or execution behavior.

## No-Effect Guarantee

This evaluator does not:

- call Twelve Data.
- fetch candles.
- read Supabase.
- write Supabase.
- persist candles.
- persist raw responses.
- persist fetch-run rows.
- persist synthetic outcomes.
- execute live replay.
- add API routes.
- add page routes.
- alter `proxy.ts`.
- alter middleware.
- alter `netlify.toml`.
- mutate recommendations.
- change scanner universe.
- change ranking.
- change thresholds.
- change visible recommendations.
- change outcome evaluation persistence.
- change Learning Acceleration.
- affect Add Trade.
- affect broker, execution, or risk.
