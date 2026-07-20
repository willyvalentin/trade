# Replay With Signal Package Static Fixtures

## Purpose

This fixture pack provides deterministic in-memory signal packages and candle arrays for the pure replay-with-signal-package simulation engine. It makes long and short replay cases easy to inspect without touching production runtime, providers, Supabase, routes, proxy, middleware, or Netlify config.

These fixtures are static in-memory test data only. They do not fetch provider data, read/write Supabase, execute replay in production, persist synthetic outcomes, or affect scanner/ranking.

## Selected AAPL Candidate Fixture

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

The short fixture uses the same candidate identity and analysis cutoff with short risk geometry:

```json
{
  "direction": "short",
  "planned_entry": 304.86,
  "planned_stop": 314.1,
  "planned_target": 275.6
}
```

## Fixture Kinds

`buildLongFixtureSimulationInput(kind)` and `buildShortFixtureSimulationInput(kind)` support:

- `no_entry`
- `target_hit`
- `stop_hit`
- `open_at_window_end`
- `ambiguous_same_candle`

## Expected Outcomes

Long fixtures:

- `longNoEntryCandlesFixture` -> `no_entry_triggered`
- `longTargetHitCandlesFixture` -> `target_hit`
- `longStopHitCandlesFixture` -> `stop_hit`
- `longOpenAtWindowEndCandlesFixture` -> `open_at_window_end`
- `longAmbiguousSameCandleCandlesFixture` -> `ambiguous_intrabar_conservative_stop`

Short fixtures:

- `shortNoEntryCandlesFixture` -> `no_entry_triggered`
- `shortTargetHitCandlesFixture` -> `target_hit`
- `shortStopHitCandlesFixture` -> `stop_hit`
- `shortOpenAtWindowEndCandlesFixture` -> `open_at_window_end`
- `shortAmbiguousSameCandleCandlesFixture` -> `ambiguous_intrabar_conservative_stop`

Lookahead fixture:

- `preCutoffIgnoredCandlesFixture` contains pre-cutoff and exactly-at-cutoff candles that would otherwise touch entry, stop, and target. The only post-cutoff candle does not touch entry, so the expected result is `no_entry_triggered`.

## Lookahead Safety Note

The fixtures include timestamps before and after `analysis_cutoff`. Pre-cutoff candles are intentionally extreme in several fixtures so tests can prove the simulation engine ignores them. Only candles strictly after `analysis_cutoff` may determine entry, target, stop, or close-based R.

## No-Effect Guarantee

This fixture pack does not:

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
