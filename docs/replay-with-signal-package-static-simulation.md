# Replay With Signal Package Static Simulation

## Purpose

This document describes the pure in-memory replay-with-signal-package simulation engine. The engine accepts supplied candles plus a fixed signal package, applies deterministic long/short rules, and returns a `ReplayWithSignalPackageResult`.

This simulation engine is pure/in-memory and does not execute replay in production, call providers, read/write Supabase, persist synthetic outcomes, or affect scanner/ranking.

## Lookahead Safety

- The caller must provide candles as function input.
- The caller must provide `analysis_cutoff`.
- Only candles strictly after `analysis_cutoff` may influence the simulated outcome.
- Candles before or exactly at `analysis_cutoff` are ignored for entry, target, stop, and close-based R.
- The engine does not fetch candles, read Supabase, call providers, or inspect wall-clock time.

## Long Simulation Rules

- Entry is touched when a post-cutoff candle has `high >= planned_entry`.
- After entry, stop is touched when `low <= planned_stop`.
- After entry, target is touched when `high >= planned_target`.
- If no entry is touched, outcome is `no_entry_triggered`.
- If entry is touched and neither target nor stop is touched, outcome is `open_at_window_end`.
- If target is touched first, outcome is `target_hit`.
- If stop is touched first, outcome is `stop_hit`.

Long R math:

- Risk = `planned_entry - planned_stop`.
- Target reward = `planned_target - planned_entry`.
- Stop hit returns `gross_r_multiple = -1`.
- Target hit returns `target reward / risk`.
- Open at window end returns close-based R using the last post-cutoff candle close.

## Short Simulation Rules

- Entry is touched when a post-cutoff candle has `low <= planned_entry`.
- After entry, stop is touched when `high >= planned_stop`.
- After entry, target is touched when `low <= planned_target`.
- If no entry is touched, outcome is `no_entry_triggered`.
- If entry is touched and neither target nor stop is touched, outcome is `open_at_window_end`.
- If target is touched first, outcome is `target_hit`.
- If stop is touched first, outcome is `stop_hit`.

Short R math:

- Risk = `planned_stop - planned_entry`.
- Target reward = `planned_entry - planned_target`.
- Stop hit returns `gross_r_multiple = -1`.
- Target hit returns `target reward / risk`.
- Open at window end returns close-based R using the last post-cutoff candle close.

## Same-Candle Ambiguity Rule

The engine does not fabricate intrabar sequence. If stop and target are both touched in the same candle after entry, the result is:

```text
ambiguous_intrabar_conservative_stop
```

The conservative R multiple is `-1`.

## Invalid Or Blocked Inputs

- No candles: `blocked_missing_candles`.
- Missing analysis cutoff: `blocked_missing_analysis_cutoff`.
- Candle row count mismatch: `blocked_candle_verification_failed`.
- Invalid or zero risk geometry: `blocked_signal_package_validation_failed`.
- No post-cutoff candles: `blocked_missing_candles`.

## Example AAPL Signal Package

```json
{
  "candidate_id": "recommendation_row:7dd59e66-7e54-4d35-92f9-5cc1ae11c557",
  "source_type": "recommendation_row",
  "source_row_id": "7dd59e66-7e54-4d35-92f9-5cc1ae11c557",
  "ticker": "AAPL",
  "interval": "5min",
  "trading_day": "2026-07-08",
  "analysis_cutoff": "2026-07-08T13:49:19.521608+00:00",
  "direction": "long",
  "planned_entry": 304.86,
  "planned_stop": 295.62,
  "planned_target": 334.12
}
```

## No-Effect Guarantee

The simulation helper does not:

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
