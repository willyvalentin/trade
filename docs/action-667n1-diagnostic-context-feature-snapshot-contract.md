# Action 667N.1 — diagnostic decision-time context feature snapshots

## Contract

`market_context_diagnostic_decision_time_context_feature_snapshot_v1` is a
default-off, offline-only projection of an already completed diagnostic replay
decision. It does not read candles, execute market-context evaluation, join an
outcome, or call a provider.

The caller supplies an external decision identity, an exact Unix-nanosecond
decision instant, decision-source contract/version, normalized and replay
identities, an immutable XNYS calendar identity, and an external trust-root
digest. The trust root binds the normalized roots, replay roots, calendar,
decision-source version, and canonical source-decision digest. The read-only
fixture adapter additionally verifies the 84-file replay tree and every
provider-manifest file hash before constructing any input.

The only output states are:

- `mapped`
- `insufficient_data`
- `conflicting`
- `not_point_in_time_safe`

No neutral fallback exists. `insufficient_data` and `conflicting` preserve the
source regime semantics rather than converting them to `mapped`.

## Point-in-time boundary

The implementation verifies the exact schedule identity and nanosecond instant,
all observation/source/receive timestamps, the latest finalized bucket, zero
future inputs passed to the evaluator, zero finalization violations, and the
absence of current-session full-day aggregation. Future candles, future gaps,
and later-session rows remain excluded counts in the snapshot.

Explicit gaps remain explicit. There is no forward fill, interpolation, or
conversion of pending buckets into missing buckets. Provider timestamps after
the decision, an invalid or zero watermark, schedule drift, or a finalization
violation yields `not_point_in_time_safe`.

Caller fields that declare point-in-time safety, completeness, sufficiency,
canonical status, performance eligibility, official OHLCV, or outcome
explanation are forbidden. Digest, calendar, replay, dataset, coverage, gap, or
trust-root drift yields `conflicting`.

## Feature material

A mapped snapshot binds regime classification, deterministic evidence strength
with `calibrated_probability:false`, all regime dimensions, the lossless
11-sector collection and rankability, volatility/intraday/multi-day context,
SPY/QQQ agreement, freshness, coverage, explicit gaps, provider timestamps,
available finalized candle window, source roots, policy versions, diagnostic
quality flags, and a feature-snapshot digest.

Breadth is always the eleven-sector-ETF diagnostic proxy and is permanently
marked `not_full_market_breadth:true`.

Every output states:

```text
diagnostic_only: true
official_ohlcv: false
canonical_performance_eligible: false
causal_claimed: false
outcome_explanation_claimed: false
live_ranking_effect: false
automatic_model_input_allowed: false
```

## Neutral intelligence boundary

`market_context_diagnostic_context_feature_envelope_v1` is a standalone,
versioned envelope. It imports no Action 665/666 code and requires independent
verification before consumption. It is not a canonical binding and cannot be an
automatic model input.

The existing 60 replay decisions are used as immutable read-only fixtures.
Their result is 31 mapped, 7 insufficient, 22 conflicting, and zero
not-point-in-time-safe snapshots. UTC A/B, Stockholm with reversed input, and
New York produce the same canonical digest. No replay or normalization is
performed by this Action.

## Future gate

Any join to real decision/outcome bundles requires a separate shadow-only
contract and explicit authorization. This Action makes no performance,
probability, causality, or outcome-explanation claim.
