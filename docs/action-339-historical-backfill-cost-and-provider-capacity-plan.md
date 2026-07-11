# Action 339: Historical Backfill Cost and Provider Capacity Plan

## Plan Status

- historical_backfill_cost_capacity_status: plan_ready
- branch: dev/safe-post-recovery-work
- rollback deploy protected: 6a501645908e4100088b7396
- clean base commit: 512a0c5

This is cost/capacity planning only, not provider integration, news integration, runtime implementation, Supabase persistence, scanner mutation, ranking mutation, deploy readiness, or main-push authorization.

## Purpose

Ture needs enough historical and daily data to learn patterns across recommendation snapshots, outcomes, candles, market regime, sector/industry context, relative strength, news/catalysts, calendar events, and provenance.

Data collection must be paced to provider capacity and cost. Broad backfill should not start before tiny scoped backfill is proven. Recommendation-linked tickers and context symbols should be prioritized before broad universe collection. News/catalyst data should be planned separately because it may have different provider, licensing, rate-limit, and cost constraints.

## Provider Capacity Dimensions

- request_limit_per_minute: maximum safe request cadence without throttling
- request_limit_per_day: daily quota available for historical and daily collection work
- symbols_per_request: whether a request can include one symbol or a batch of symbols
- candles_per_request: maximum rows returned per symbol/request
- supported_intervals: available intervals such as 1m, 5m, 15m, 30m, 60m, daily
- historical_depth: how far back the provider can return intraday and daily data
- adjusted_vs_unadjusted_support: whether adjusted and unadjusted prices are available and clearly labeled
- intraday_delay_or_realtime_status: whether data is real time, delayed, or end-of-day only
- response_size: expected payload size per symbol/day/window
- retry_policy: retry limits, backoff, and idempotency requirements
- failure_rate_tracking: provider error, missing candle, timeout, and partial response tracking
- cost_per_plan: subscription and feature limits for the selected provider plan
- overage_risk: chance of extra fees, throttling, suspension, or silent truncation
- provider_terms_constraints: licensing, redistribution, retention, and use-case limits

## Data Volume Dimensions

- symbol_count: number of tickers and context symbols included
- trading_days: number of historical trading days requested
- interval: candle interval selected for backfill
- candles_per_day: expected rows per symbol per trading day
- rows_per_symbol: candles_per_day multiplied by trading_days
- total_candle_rows: rows_per_symbol multiplied by symbol_count and context multipliers
- raw_response_storage_size: size of retained provider payloads if raw retention is enabled
- normalized_storage_size: size of validated OHLCV rows after normalization
- index/context_symbol_multiplier: additional SPY/QQQ/IWM and market context symbols
- sector/peer_multiplier: additional ETF and peer-group symbols required for context
- news/catalyst_record_count: expected records from headline/catalyst collection
- audit/readback_metadata_size: fetch-run, validation, source, and diagnostic metadata volume

## Universe Tiers And Collection Priority

### Tier 0: already recommended tickers

- purpose: learn from tickers Ture already selected or published
- expected value: highest link between recommendation snapshots and outcomes
- backfill priority: first
- cost/risk: low symbol count, high learning relevance
- recommended start scope: one to five recently recommended tickers

### Tier 1: active scan universe

- purpose: cover tickers Ture actively considers during scans
- expected value: supports counterfactual learning and candidate quality review
- backfill priority: second
- cost/risk: moderate symbol count and provider usage
- recommended start scope: smallest current scan subset after Tier 0 proves safe

### Tier 2: index context symbols SPY/QQQ/IWM

- purpose: provide market regime and benchmark context
- expected value: high value for anti-leakage-safe market context
- backfill priority: first alongside Tier 0
- cost/risk: very low symbol count, strong contextual value
- recommended start scope: SPY only first, then SPY/QQQ/IWM

### Tier 3: sector ETFs

- purpose: support sector/industry context and relative strength comparisons
- expected value: helps explain sector-supported and sector-divergent outcomes
- backfill priority: after Tier 0 and Tier 2
- cost/risk: moderate additional requests depending on ETF coverage
- recommended start scope: only ETFs linked to recommended tickers

### Tier 4: peer groups for recommended tickers

- purpose: confirm whether peers support or contradict a recommendation
- expected value: useful for setup validation and false-breakout detection
- backfill priority: after sector ETFs
- cost/risk: can expand quickly if peer sets are broad
- recommended start scope: one peer group for one recommendation-linked ticker

### Tier 5: high-liquidity US large/mid caps

- purpose: expand learning coverage beyond current recommendation-linked names
- expected value: improves generalization once core mechanics are proven
- backfill priority: later
- cost/risk: high provider and storage risk
- recommended start scope: disabled until tiny and Tier 0/Tier 2 collection are proven

### Tier 6: broader universe later

- purpose: broad market discovery and future universe expansion
- expected value: long-term research only
- backfill priority: last
- cost/risk: highest cost, quota, storage, and maintenance risk
- recommended start scope: not suitable for first implementation

## Backfill Windows And Expected Cost Risk

### last 5 trading days

- learning value: validates mechanics and near-term outcome reconstruction
- provider request risk: low
- storage risk: low
- recommended universe tier: Tier 0 and Tier 2
- suitable for first implementation: yes, after no-write proof

### last 20 trading days

- learning value: early calibration and recent-regime coverage
- provider request risk: moderate
- storage risk: low to moderate
- recommended universe tier: Tier 0, Tier 2, and small Tier 3
- suitable for first implementation: not first, but good second step

### last 60 trading days

- learning value: better pattern stability for common setups
- provider request risk: moderate to high
- storage risk: moderate
- recommended universe tier: Tier 0 plus selected Tier 1/Tier 2
- suitable for first implementation: no

### last 120 trading days

- learning value: stronger seasonal and regime comparison
- provider request risk: high
- storage risk: moderate to high
- recommended universe tier: proven Tier 0/Tier 1 scope only
- suitable for first implementation: no

### last 252 trading days

- learning value: one-year coverage and broader calibration
- provider request risk: high
- storage risk: high
- recommended universe tier: only after capacity math and storage readback are proven
- suitable for first implementation: no

### multi-year later

- learning value: long-term research and rare-regime comparison
- provider request risk: very high
- storage risk: very high
- recommended universe tier: carefully sampled tiers only
- suitable for first implementation: no

## Daily Collection Cadence

Future daily cadence:

- premarket context collection
- scan-window candle collection
- recommendation snapshot persistence
- market regime snapshot
- sector/industry snapshot
- relative strength snapshot
- news/catalyst snapshot
- end-of-day outcome reconstruction
- daily data quality audit

This daily collection cadence is future planning only and not implementation.

## News/Catalyst Provider Planning

- news provider may be separate from candle provider
- catalyst timestamp matters for anti-leakage
- headline summaries must be snapshot-time safe
- news volume/context may be useful
- provider cost/limits may be high
- start with catalyst presence/type before full NLP
- no news API calls yet

## Storage And Retention Planning

- normalized candle storage: validated OHLCV rows keyed by provider, ticker, interval, timestamp, and adjusted status
- raw response retention policy: keep raw responses only when approved and bounded by retention rules
- audit/readback rows: record fetch-run status, validation counts, skip reasons, and source metadata
- context snapshot storage: store anti-leakage-safe context linked to recommendation snapshots
- news/catalyst storage: store timestamped catalyst presence/type and minimal safe metadata before richer text
- outcome dataset storage: keep recommendation/outcome/context join keys stable
- retention tiers: distinguish short-term raw payloads, medium-term audit rows, and long-term normalized data
- compression/aggregation considerations: aggregate only after preserving required learning detail
- avoid duplicate storage of same candle/provider rows

## First Safe Capacity Experiment Design

Future experiment:

- one provider
- one symbol
- one interval
- one trading day
- no writes first
- then tiny write/readback only after approval
- no broad universe
- no news calls
- no scanner/ranking mutation
- rollback-ready

## Blocked Implementation Work

- no provider calls yet
- no news API calls yet
- no Supabase writes yet
- no runtime routes yet
- no broad backfill jobs yet
- no scanner/ranking mutation yet
- no confidence threshold changes yet
- no deploy
- no main push

This plan does not authorize deploys, main pushes, runtime route changes, provider calls, news API calls, Supabase reads, Supabase writes, broad backfill jobs, replay execution, synthetic outcome persistence, pattern persistence, context persistence, dataset persistence, snapshot persistence changes, candle persistence, raw response persistence, fetch-run persistence, recommendation mutation, scanner mutations, ranking mutations, confidence threshold changes, proxy changes, middleware changes, Netlify config changes, visible recommendation changes, outcome persistence changes, Learning Acceleration changes, Add Trade changes, broker changes, execution changes, or risk changes.

## Recommended Next Actions

- Action 340: Snapshot Field Inventory Against Existing Schema
- Action 341: Learning Dataset Static Fixture Spec
- Action 342: Intelligence Context Static Fixture Spec
- Action 343: Pattern Insight Static Type Spec
- Action 344: Runtime Ping-Only Route Implementation Plan
- Action 345: First Tiny Provider Capacity Experiment Plan
