# Action 664A — Canonical Recommendation Evaluation Contract

Status: local, backward-compatible, non-live foundation.

This action adds pure TypeScript contracts and golden fixtures. It does not
connect them to recommendation generation, scanning, ranking, publication,
storage, provider fetching, or production data.

## Canonical decision identity

One identity represents exactly one recommendation decision:

```text
rec_decision:v1:<encoded source namespace>:<encoded producer decision id>:<decision epoch milliseconds>
```

The producer must issue a stable `decision_id`. `decided_at` must be an ISO
instant with `Z` or an explicit UTC offset. Ticker, sample type, horizon,
snapshot row ID, and outcome are deliberately excluded: changing any of those
must not create a second identity for the same decision.

The identity builder rejects implicit timezones, surrounding whitespace,
non-NFC text, control characters, and noncanonical namespaces.

## Exclusive sample type

`sample_type` is one required scalar and must be exactly one of:

- `visible`
- `research_only`
- `shadow`
- `historical_synthetic`
- `rejected_candidate`
- `no_trade`

No aliases are accepted. Existing values such as `official`, `learning_only`,
or multiple boolean flags require an explicit Action 664B mapping decision.

## Confidence

`numeric_confidence` is nullable but, when present, must be a probability in
the closed interval `[0, 1]`. `confidence_label` is a separate nullable
`low | medium | high` field. Scores, ranking tiers, and categorical labels are
never inferred as numeric confidence.

## Version metadata

Every canonical decision requires first-class versions for:

- engine
- scoring
- ranking
- setup taxonomy
- confidence contract
- evaluator
- provider contract
- full 40-character Git commit
- build identity

Missing versions fail validation. Payload aliases do not satisfy the contract.

## Primary outcome and horizons

The primary outcome is selected once per canonical recommendation identity:

1. complete `60m`;
2. otherwise complete `30m`;
3. otherwise complete `15m`;
4. otherwise explicit `incomplete`.

All non-primary horizon rows are diagnostic only. Duplicate rows for the same
horizon fail closed as incomplete; the selector never picks a duplicate
arbitrarily.

## Candle cutoff and outcome policy

- Candles must carry explicit `start_at` and `end_at`.
- A candle with `start_at < decided_at` is excluded in full, including a
  candle that overlaps the decision instant. Aggregate OHLC cannot prove which
  prices occurred before versus after the recommendation.
- A candle beginning exactly at the decision instant is eligible.
- Invalid or duplicate intervals fail coverage rather than being silently
  reused.
- For `immediate_at_recommendation`, entry exists before the first eligible
  candle.
- For `touch_after_recommendation`, entry must be touched by an eligible
  candle. If entry and a terminal level share that candle, sequencing is
  ambiguous.
- Target and stop touched in the same candle is
  `ambiguous_same_candle`; neither side is assumed to have occurred first.
- Complete coverage with no entry touch is `no_entry`.
- Complete coverage with entry but no terminal event is `neither`.
- Provider gaps, stale data, incomplete candle coverage, malformed candles,
  missing plans, and evaluator blockers cannot produce a canonical terminal
  outcome.

## Action 664B integration boundary

Action 664B should add explicit adapters, without changing the contract, for:

1. recommendation generator decisions and no-trade decisions;
2. selected, rejected, and overflow scanner candidates;
3. recommendation snapshots and batches;
4. persisted 15m/30m/60m outcomes;
5. recommendation performance statistics and Daily Learning Review;
6. snapshot-to-learning-dataset mapping.

The adapters must surface conflicts instead of inferring:

- a durable producer `decision_id`;
- exactly one canonical `sample_type`;
- numeric probability confidence versus score/label;
- complete first-class version metadata;
- candle interval boundaries and provider coverage;
- duplicate horizon rows;
- links among candidate, batch, snapshot, recommendation, and no-trade
  decisions.

Action 664B must remain read-only/advisory until coverage reports prove that
legacy rows can be mapped without changing live scoring, ranking, thresholds,
scanner behavior, AI prompts, no-trade policy, or publication.

## Flows not using this contract after Action 664A

The following remain unchanged and do not import this module:

- `lib/recommendation-generator.ts`
- `lib/scanner.ts`
- `lib/scanner-candidate-ranking.ts`
- `app/api/automation/run-scan/route.ts`
- `app/api/recommendations/generate/route.ts`
- `lib/recommendation-snapshot.ts`
- `lib/recommendation-outcome-tracker.ts`
- `lib/recommendation-outcome-evaluation-runner.ts`
- `app/api/recommendations/evaluate-outcomes/route.ts`
- `lib/recommendation-performance-statistics.ts`
- `lib/daily-learning-review.ts`
- all persistence and migration code
