# Action 667A — Market Context Intelligence Shadow Lab

## Boundary

`market_context_intelligence_v1` is a deterministic, versioned, pure
calculation contract. It accepts only already supplied, time-bound data. It
does not fetch provider data, read environment variables, access persistence,
call a scanner, write a snapshot, or participate in recommendation generation.

Every output is marked:

- `shadow_only: true`
- `live_ranking_effect: false`

The implementation lives only in
`lib/market-context-intelligence-lab/`. No live consumer imports it.

## Versioned contract

- Context version: `market_context_intelligence_v1`
- Threshold version:
  `market_context_intelligence_thresholds_2026_07_26_v1`
- Inactive adapter version:
  `market_context_shadow_evaluation_adapter_v1`

Inputs contain a decision timestamp plus already supplied SPY/QQQ intraday and
multi-day metric points. Each point can contain close, returns, short and long
moving averages, momentum, trend slope, realized volatility, and range.
Optional market breadth and sector/industry benchmark series use the same
point-in-time boundary. Relative benchmark inputs declare `context_level` as
`sector` or `industry`; an industry also carries its parent `sector_id`.
Provider metadata supplies source/received timestamps, expected and observed
points, missing points, and coverage.

Sector identity is supplied by `sector_id` and `benchmark_symbol`. A static
ticker-to-sector mapping can be used upstream to establish identity, but this
lab never interprets mapping identity as measured sector strength.

## Lab thresholds

All percentages below are percentage points, not fractions.

| Dimension | Threshold |
| --- | --- |
| Intraday freshness | at most 30 minutes |
| Multi-day freshness | at most 2,160 minutes |
| Essential SPY/QQQ coverage | at least 0.80 |
| Breadth coverage | at least 0.70 |
| Sector coverage | at least 0.80 |
| Strong trend return | absolute return at least 2.0% |
| Directional trend return | absolute return at least 0.5% |
| Strong momentum | absolute momentum at least 1.0% |
| Directional momentum | absolute momentum at least 0.25% |
| Directional slope | absolute slope at least 0.05% |
| Low realized volatility | below 0.8% |
| Normal realized volatility | 0.8% to below 1.5% |
| Elevated realized volatility | 1.5% to below 2.5% |
| High realized volatility | at least 2.5% |
| Broad breadth | advancing and above-short-average fractions at least 0.60 |
| Weak breadth | advancing and above-short-average fractions at most 0.40 |
| Short sector relative strength | absolute SPY-relative return at least 0.5% |
| Medium sector relative strength | absolute SPY-relative return at least 1.5% |
| Sector acceleration/deceleration | short minus medium relative return at least ±0.5% |

These are lab rules, not calibrated production thresholds. Changing one
requires a new threshold version and updated golden fixtures.

## Regime dimensions and terminal classifications

The output keeps these dimensions separate:

- trend state
- risk state
- volatility state
- breadth state
- SPY/QQQ agreement
- intraday context
- multi-day context
- data-quality state

Terminal classifications are restricted to:

- `risk_on_trending`
- `risk_on_fragile`
- `neutral_balanced`
- `choppy_high_volatility`
- `risk_off_orderly`
- `risk_off_stressed`
- `insufficient_data`
- `conflicting_context`

Missing, stale, provider-gap, disagreement, and leaking-input states are
explicit. They are never silently converted to neutral.

`confidence.label` is a categorical summary of deterministic rule evidence.
It is always accompanied by `calibrated_probability: false` and
`basis: deterministic_rule_evidence_not_probability`. It must not be read as a
probability estimate.

## Sector intelligence and ranking

Each sector output reports:

- short and medium SPY-relative return
- short and medium relative-strength states
- trend agreement
- acceleration/deceleration
- freshness, coverage, and missingness
- measured sector classification
- rank state and reason codes

Ranking is emitted only when `sector_universe.expected_sector_ids` exactly
matches the supplied, fresh, sufficiently covered and measurable sector set.
Otherwise every sector is explicitly `not_rankable` with a null rank. A
one-sector declared universe is technically complete and therefore rankable,
although its comparison count remains visible.

Industry contexts report the same relative-strength evidence but are always
`not_rankable` for sector rank and carry
`industry_context_not_sector_rankable`.

## Point-in-time and leakage policy

The decision timestamp is the hard boundary.

- Points after the decision timestamp are excluded before calculation.
- Future provider source timestamps are excluded and treated as provider gaps.
- Invalid timestamps are excluded.
- Exclusion counts and reason codes are returned.
- Remaining eligible points are sorted canonically; input order cannot change
  the output.
- If exclusion leaves an essential horizon unavailable, the terminal result is
  `insufficient_data`.

The engine performs no wall-clock reads. The same input returns the same
output.

## Inactive shadow-evaluation boundary

`shadow-evaluation-adapter-v1.ts` describes a future binding surface for a
canonical evaluation envelope. It intentionally has:

- `binding_status: inactive_unbound`
- `canonical_evaluation_envelope_binding: null`
- `capture_enabled: false`
- `persistence_enabled: false`
- `database_relation: null`

It does not import untracked Spår 2 files, duplicate persistence logic, create
a database relation, or activate capture.

When a later action provides an approved canonical envelope, evaluation should
compare:

- expectancy in R per regime
- precision@K per sector context
- calibration per regime
- no-trade opportunity cost
- coverage and missingness
- stability across trading days

No production values are calculated in Action 667A.

## Difference from the current live regime

The existing `lib/market-regime.ts`:

- calls the daily market-data provider for 60 SPY and QQQ candles
- derives MA20, MA50, and five-day change
- emits only `risk_on`, `neutral`, or `risk_off`
- has no separate volatility, breadth, horizon, agreement, or data-quality
  dimensions
- has a neutral fallback when regime data is unavailable

The live recommendation generator consumes that result in candidate scoring,
pre-market scoring, OpenAI prompt/selectivity, recommendation payloads, and
`market_regime_snapshots` persistence.

The Action 667A lab does none of those things. It accepts pre-supplied data,
expresses uncertainty directly, provides sector-relative context, and remains
unbound.

## Golden fixture coverage

The deterministic suite covers:

1. clear risk-on trend
2. clear risk-off trend
3. SPY/QQQ disagreement
4. choppy high volatility
5. low-volatility neutral market
6. stale index data
7. missing candles
8. insufficient breadth
9. strong sector relative to a weak market
10. weak sector in a strong market
11. incomplete sector universe
12. input-order determinism
13. future point after decision timestamp
14. provider gap

Additional assertions cover future provider timestamps, confidence semantics,
inactive adapter flags, absence of provider/persistence dependencies, and the
absence of live imports.

## Proposed Action 667B

Run an offline, fixture-only threshold sensitivity and contract-stability
study. Define a version-bump policy, exercise boundary values around every
threshold, add property-based permutation and timestamp tests, and specify the
approval checklist for a future canonical-envelope binding. Keep capture,
persistence, live consumers, provider calls, and production data disabled.
