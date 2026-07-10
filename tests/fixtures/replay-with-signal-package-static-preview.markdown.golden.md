# Replay With Signal Package Static Preview

Scenarios:
- long_no_entry: long no_entry
- long_target_hit: long target_hit
- long_stop_hit: long stop_hit
- long_open_at_window_end: long open_at_window_end
- long_ambiguous_same_candle: long ambiguous_same_candle
- short_no_entry: short no_entry
- short_target_hit: short target_hit
- short_stop_hit: short stop_hit
- short_open_at_window_end: short open_at_window_end
- short_ambiguous_same_candle: short ambiguous_same_candle

# Replay With Signal Package Static Inspection Report

Report status: safe_report_available
Recommended next step: review_static_summary_before_any_runtime_rollout

## Safety
Severity: success

- Generated from static inputs: yes
- Production runtime touched: no
- Provider call executed: no
- Supabase write executed: no
- Synthetic outcomes persisted: no
- Scanner behavior changed: no
- Live ranking changed: no
- Recommendation rows mutated: no

## Outcome Breakdown
Severity: info

- Total results: 10
- Interpreted results: 10
- Blocked results: 0
- Failed results: 0
- Target hits: 2 (20.0%)
- Stop hits: 2 (20.0%)
- No entry: 2 (20.0%)
- Open at window end: 2 (20.0%)
- Ambiguous intrabar: 2 (20.0%)

## R Multiple Summary
Severity: info

- Average gross R: 0.4324
- Best gross R: 3.1667
- Worst gross R: -1.0000
- Replay executed count: 10

## Interpretation
Severity: success

- Report status: safe_report_available
- Summary status: safe_summary_available
- Interpretation label: ambiguity_detected
- Warnings: none
- Blockers: none

## Recommended Next Step
Severity: info

- review_static_summary_before_any_runtime_rollout

No-effect flags:
- Production runtime touched: no
- Provider call executed: no
- Supabase write executed: no
- Synthetic outcomes persisted: no
- Scanner behavior changed: no
- Live ranking changed: no
- Recommendation rows mutated: no
