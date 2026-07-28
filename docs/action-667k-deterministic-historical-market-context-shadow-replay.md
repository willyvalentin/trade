# Action 667K — Deterministic Historical Market-Context Shadow Replay

## Boundary

`market_context_shadow_replay_v1` is an offline-only replay contract for
running the frozen `market_context_intelligence_v1` and
`market_context_intelligence_v2` engines over caller-supplied point-in-time
market-context datasets.

This Action contains synthetic repository fixtures only. It performs no
provider access, database access, capture, persistence, canonical binding,
scanner run, recommendation run, or live integration.

The fixed runtime assertions are:

- `shadow_only: true`
- `live_ranking_effect: false`
- `canonical_binding_ready: false`
- `capture_enabled: false`
- `persistence_enabled: false`
- `database_relation: null`

## Versioned artifacts

- Replay contract: `market_context_shadow_replay_v1`
- Canonical serialization:
  `market_context_shadow_replay_canonical_json_v1`
- Replay bridge export:
  `market_context_shadow_replay_bridge_export_v1`
- Synthetic sessions:
  `market_context_shadow_replay_synthetic_sessions_v1`
- Context v1: `market_context_intelligence_v1`
- Context v2: `market_context_intelligence_v2`
- Existing lossless bridge:
  `market_context_canonical_bridge_schema_v1`

## Input contract

Each replay requires:

- a non-empty replay ID;
- a dataset identity, version, and source kind;
- a caller-supplied SHA-256 dataset digest;
- one or more decision records with decision ID, ticker, session label, and
  the complete v2 context input;
- all nine producer/build/provider version fields required by the 667D
  bridge.

The dataset digest is SHA-256 over canonical JSON containing only dataset
identity and decisions. Canonicalization:

- validates every decision, observation, provider-source, and
  provider-received timestamp with
  `market_context_explicit_instant_parser_v1`;
- converts offset-equivalent timestamps to UTC ISO strings;
- sorts decisions, benchmarks, observation arrays, sector/industry arrays,
  and sector-universe identity;
- preserves duplicate observations but orders them by byte-stable content;
- sorts object keys recursively.

A malformed digest, digest mismatch, duplicate decision identity, naive
timestamp, non-JSON value, or missing required producer version fails closed.

## Point-in-time and immutability rules

The replay engine:

1. validates and canonicalizes explicit instants before evaluation;
2. runs v1 and v2 separately on independent structured clones;
3. lets each frozen engine exclude future observations and future provider
   source timestamps;
4. independently inventories observation time, provider source time, and
   provider received time;
5. reconciles replay-boundary leakage counters with both engine outputs;
6. fingerprints the caller input before evaluation and rejects any internal
   mutation;
7. never substitutes neutral for insufficient or conflicting context.

Provider received time remains observation metadata. It is preserved and
marked when it lies after the decision instant, but it is not used as
decision-time evidence.

## Decision output

Every decision emits:

- replay and dataset identity;
- dataset, canonical-input, and evidence digests;
- v1 version, classification, dimensions, evidence, and reason codes;
- v2 version, classification, every dimension, full sector/industry
  collection, provider timestamps, freshness, coverage, evidence, and reason
  codes;
- explicit v1/v2 agreement or change;
- separate observation/provider time audits;
- replay, v1, and v2 leakage counters;
- threshold-boundary IDs;
- verified input immutability;
- fixed shadow-only/no-live-effect assertions.

## Diagnostics

The aggregate output includes:

- a chronological v2 regime-transition matrix per ticker;
- a separate v1/v2 version-comparison matrix;
- regime classification counts and measurable coverage;
- sector classification, coverage, ranked, and not-rankable counts;
- insufficient, conflicting, and provider-gap counts;
- decision frequency for all 21 v2 threshold registry entries, including
  explicit zero-effect reporting for the two `reserved_inactive` entries;
- unique decision, UTC-day, and ticker counts.

The chronological transition matrix must not be confused with version drift.
The synthetic transition fixture moves from `risk_on_trending` to
`risk_off_orderly` across two historical decision instants while v1 and v2
agree at both instants. V2 classification parity is therefore preserved.

No win rate, expectancy, or precision@K value is computed. Performance claims
remain forbidden until decision records can be joined point-in-time to an
approved canonical outcome contract.

## Synthetic historical golden sessions

The repository fixtures cover:

1. clear risk-on day;
2. clear risk-off day;
3. volatile/choppy day;
4. SPY/QQQ disagreement;
5. sector rotation;
6. stale index plus provider gap;
7. incomplete sector universe;
8. DST/explicit-offset session;
9. future candle in the dataset;
10. out-of-order and duplicate observations;
11. input-order determinism;
12. v1/v2 agreement plus an intentional chronological regime transition.

These fixtures are synthetic and are not production, staging, provider, or
historical market data.

## Standalone 667D-compatible export

`market_context_shadow_replay_bridge_export_v1` contains one existing,
lossless `market_context_canonical_bridge_schema_v1` envelope per decision.
The collection is intentionally:

- `binding_status: inactive_unbound`;
- `actual_canonical_binding: null`;
- `canonical_binding_ready: false`.

No Spår 2 code is imported and no receiver or persistence contract is
duplicated. A bridge-ready record means only that the replay result can be
represented losslessly by the frozen 667D bridge schema.

## Action 667L gate

Recommended next Action:
**Action 667L — Approved Local Historical Dataset Admission Gate**.

667L should be a separate, read-only admission review before any local
historical replay. It should require:

- explicit operator approval for the exact local dataset paths;
- dataset provenance, license, identity, version, and SHA-256;
- proof that every source is point-in-time and contains no revised/future
  observations relative to each decision;
- explicit timezone and exchange-session policy;
- provider-source and received-time semantics;
- coverage/missingness inventory;
- secret and production-identifier scan;
- a dry validation that computes only dataset/replay eligibility metadata;
- a hard stop before replay when canonical outcomes are absent or unapproved.

667L must not fetch provider data, upload data, persist replay results, bind
to Spår 2, compute performance metrics, or change any live consumer.
