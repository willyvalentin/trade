# Action 664B — Canonical Evaluation Projection Adapters

Status: local, read-only, non-live projection foundation.

The adapters project existing in-memory TypeScript values into the Action 664A
contract. They do not write data, fetch providers, deduplicate source rows, or
change recommendation behavior. A result is exactly one of `mapped`,
`conflicting`, or `unmappable`.

## Source inventory

| Source | Existing usable fields | Blocking or conflicting fields | Adapter status |
| --- | --- | --- | --- |
| `ScannerCandidate` | ticker, company, sector, plan inputs, reference provider/timestamp, indicator stale flag | no durable candidate/decision ID, decision timestamp, sample type, version bundle, batch linkage, or probability confidence | mappable only with explicit projection metadata |
| `ScannerCandidateRankingResult` / summary | ticker, rank, selected flag, bucket, tier, normalized score, summary generation time | normalized score is not probability confidence; result has no durable candidate ID or batch relation | context for scanner-candidate adapter |
| `SelectedCandidateBuildDiagnostic` | ticker, build/rejection status, rejection reason/category, setup, score/tier | no candidate ID, decision time, batch join, versions, or counterfactual eligibility | explicit rejected-candidate evidence, but not sufficient alone |
| `RecommendationScanRun` | run ID/fingerprint, timestamps, window, counts, provider statuses, payload | one run covers zero or many decisions; it is not one recommendation decision | always context-only/unmappable as a decision |
| `RecommendationBatch` | batch ID/fingerprint, observed/published time, status, serving decision, scan-run relation, snapshot membership | ordinary batches contain multiple decisions; versions and candidate lineage are absent | only `no_trade_valid` is a batch-level decision; other batches are context-only |
| `RecommendationSnapshot` | recommendation ID, snapshot ID/fingerprint, recommendation time, scan-run ID, visibility fields, plan, confidence/score, freshness, payload | legacy rows can lack recommendation ID; batch/candidate links are indirect; sample evidence can conflict; versions, regime, sector, provider contract, and confidence semantics are not first-class | primary visible/research decision adapter |
| `RecommendationOutcome` | snapshot/recommendation links, horizon, status, terminal flags/times, MFE/MAE-like fields, provider, legacy completeness | no canonical expected/observed candle coverage, candle interval boundaries, evaluator/provider versions, or durable outcome version; duplicate horizons can exist outside the database uniqueness path | projected only as rows belonging to a decision |
| Research-only snapshot metadata | `source_mode`, `data_mode`, `visibility_status`, and several payload flags | multiple overlapping encodings; visible and research evidence can coexist | mapped only when evidence resolves to one exclusive type |
| Shadow/counterfactual metadata | shadow-entry metadata and retained counterfactual candles exist in separate flows | counterfactual-ready does not itself mean the recommendation sample is `shadow`; no shared decision identity | requires explicit `shadow` sample evidence and lineage |
| Historical replay result | candidate ID, source type, analysis cutoff, plan, outcome, lookahead safety, source verification | no canonical versions/confidence/batch/snapshot relation; source type is an open string | mapped only for explicit historical-synthetic source with lookahead safety |
| No-trade state | `RecommendationBatch.status=no_trade_valid`, serving decision, batch time and scan context | no evaluable counterfactual candidate/plan or provider coverage is retained | identity can map; evaluation remains `not_evaluable` |

## Projection rules

- Source namespaces are fixed by adapters, never inferred from labels.
- Snapshot `recommendation_id` may be a producer decision ID. Snapshot row ID
  and fingerprint never substitute when it is missing.
- A normal batch or scan run never becomes a fabricated recommendation
  decision.
- Sample evidence is collected from explicit fields. More than one canonical
  sample type is `conflicting`; absence is `unmappable`.
- Ranking score and snapshot score are never treated as probability
  confidence. Numeric snapshot confidence is accepted only in `[0,1]`.
- All Action 664A version fields must be explicitly available. Missing or
  contradictory versions are not defaulted.
- Candidate, batch, scan-run, snapshot, recommendation, and outcome relations
  are retained separately. Contradictory joins are `conflicting`.
- Only `15m`, `30m`, and `60m` outcome rows enter the Action 664A primary
  selector. Other horizons remain unsupported diagnostics.
- Duplicate supported horizons remain in output and make the projection
  `conflicting`; no row is silently removed.
- Provider gaps and incomplete coverage can coexist with a mapped decision,
  but primary evaluation remains incomplete.
- No-trade without complete counterfactual coverage remains mapped as a
  decision and explicitly `not_evaluable`.

## Fixture coverage

The deterministic fixture matrix contains twelve projection attempts:

| Fixture group | Total | Mapped | Conflicting | Unmappable |
| --- | ---: | ---: | ---: | ---: |
| All fixtures | 12 | 7 | 2 | 3 |
| Visible | 5 | 2 | 1 | 2 |
| Research-only | 1 | 1 | 0 | 0 |
| Shadow | 1 | 1 | 0 | 0 |
| Historical synthetic | 1 | 1 | 0 | 0 |
| Rejected candidate | 2 | 1 | 0 | 1 |
| No-trade | 1 | 1 | 0 | 0 |
| Unknown due to sample conflict | 1 | 0 | 1 | 0 |

The seven mapped attempts are the six exclusive sample types plus a visible
provider-gap case whose decision maps while evaluation remains incomplete.

## Fields Action 664C must persist or normalize

### Decision identity

- immutable producer `decision_id`;
- exact `decided_at` instant with timezone;
- fixed producer namespace;
- one exclusive canonical `sample_type`;
- durable candidate ID before ranking and build decisions;
- explicit no-trade and rejected-candidate decision IDs.

### Lineage

- candidate ID on ranking and build diagnostics;
- candidate-to-scan-run and candidate-to-batch links;
- batch ID/fingerprint on snapshots;
- snapshot and recommendation identity on every outcome;
- explicit rejected-candidate membership, not aggregate counts only;
- explicit no-trade candidate-set/counterfactual relation.

### Confidence and versions

- probability confidence in `[0,1]`, separate from score and tier;
- categorical confidence label and the source of both values;
- engine, scoring, ranking, setup-taxonomy, confidence-contract, evaluator,
  and provider-contract versions;
- full Git commit and build identity.

### Context and coverage

- regime and sector captured at decision time;
- provider identity and source timestamp;
- freshness classification and age at decision time;
- expected and observed candle counts per horizon;
- candle interval start/end semantics;
- provider gap, stale, incomplete, and malformed reason codes;
- evaluator version and deterministic evaluation input identity.

### Normalization conflicts

- `is_visible`, status, source mode, data mode, visibility flags, and learning
  flags must normalize to one sample type or an explicit conflict;
- legacy confidence values above one must not be divided by 100 without a
  source contract;
- shadow metadata and counterfactual-ready outcomes must not be conflated;
- historical replay source strings must normalize to an explicit synthetic
  classification;
- duplicate horizon rows require an explicit remediation policy and audit,
  not projection-time deduplication.

## Proposed bounded Action 664C

Implement a canonical evaluation persistence and lineage contract without
activating learning or changing ranking:

1. define additive nullable storage fields/envelopes for decision identity,
   exclusive sample type, complete versions, confidence, lineage, context, and
   provider coverage;
2. add pure write-payload builders and round-trip fixtures for candidate,
   batch, snapshot, and outcome boundaries;
3. add conflict-first normalization for legacy payloads, producing a dry-run
   migration-readiness report rather than mutating existing rows;
4. prove deterministic readback into the 664B adapters;
5. keep all writers disabled until schema review, rollback design, and a
   separate explicit migration/activation action.

Action 664C should not backfill production data, activate collectors, or alter
scoring, ranking, thresholds, publication, or learning.

## Live boundary

No current generator, scanner, ranking, route, persistence module, statistics
consumer, or learning consumer imports the projection adapters. The only
imports are fixtures and deterministic tests.
