# SPÅR 2 — Action 665B: Completed Scanner Bundle Projection

Status: inactive, server-only, fixture-only.

## Contract

`completed_scanner_bundle_opportunity_set_adapter_v1` accepts a completed
scanner bundle and returns exactly one of:

- `mapped`: all decision-time identity, complete membership, version,
  point-in-time, provider, reason-code and requested outcome-lineage evidence
  is explicit and internally consistent.
- `conflicting`: two or more explicit source facts disagree.
- `unmappable`: required evidence is absent or the source is structurally
  incomplete.

The adapter creates only an in-memory
`canonical_counterfactual_opportunity_set_v1` envelope. It has no database
client, writer, provider access, route, scanner call-site, persistence
relation, feature flag or side effect.

## Read-only source inventory

| Existing source | What exists | Projection status in isolation | Blocking evidence |
| --- | --- | --- | --- |
| `ScannerCandidateRankingSummary` | ranks, scores, tiers, selection and aggregate counts | `unmappable` | `results` is deliberately capped at `max(20, targetMax)`; no stable candidate IDs, complete-set attestation, versions or lineage |
| `RecommendationScanRun` | run ID/fingerprint, lifecycle timestamps, counts and provider summaries | `unmappable` | no full candidate membership, producer decision ID, version tuple or candidate outcomes |
| `RecommendationBatch` | batch/scan relation and published snapshot identities | `unmappable` | represents built/published recommendations, not every rejected/overflow/under-threshold candidate |
| `SelectedCandidateBuildDiagnostic[]` | selected-candidate build result and canonical build-rejection enum | `unmappable` | selected candidates only; no full ranking, stable candidate identity or counterfactual outcome lineage |
| ranking `selection` and summary counts | selected tickers, target status, overflow count | `unmappable` | aggregate/top-K evidence cannot reconstruct missing members |
| generator cooldown/build messages | free-text reasons and selected build diagnostics | `unmappable` unless an explicit canonical reason code is also supplied | free text is not normalized by this adapter |
| OpenAI `no_trade`/fallback diagnostics | model response and deterministic fallback flags | `unmappable` as no-trade | the current flow replaces model no-trade/empty output with fallback; this is not an explicit durable no-trade decision |
| snapshot/outcome records | lineage for built recommendations | `unmappable` for full counterfactual evaluation | rejected/overflow/under-threshold candidate outcomes are not joinable today |
| explicit completed 665B fixture bundle | all preceding sources plus full membership evidence | `mapped` | none |

The adapter reuses the existing source types without aliases that conceal these
semantic gaps. It requires a verified
`pre_truncation_candidate_capture_evidence_v1` produced at the declared full
ranking boundary, then independently checks its sorted stable identity list,
count, digest, scan/decision identity, cutoff and producer versions against
the completed bundle. Caller-supplied counts alone cannot make a top-K source
complete.

## Fail-closed rules

- A ranking summary with `candidates_ranked !== results.length` is
  `unmappable` with `ranking_summary_truncated`.
- Missing identities or requested outcome lineage is `unmappable`; no IDs are
  synthesized.
- Duplicate candidates, rank gaps, rank ties without unique tie-break keys,
  mixed versions or lineage contradictions are `conflicting`.
- Raw rejection prose never becomes a canonical reason code.
- Unknown codes are rejected against
  `canonical_counterfactual_reason_taxonomy_v1`.
- Provider gaps and stale data may preserve a decision-time opportunity set,
  but its 665A readiness remains non-evaluable.
- Nonempty membership requires a positive versioned provider-coverage
  denominator; observed coverage cannot exceed expected coverage.
- `no_trade` is emitted only from explicit decision evidence whose identity and
  timestamp match the opportunity set. An OpenAI no-trade followed by fallback
  is not a no-trade decision.
- Candidate → scan → batch → explicit recommendation/rejection/no-trade
  decision node → snapshot-or-no-trade → expected outcome lineage is
  cross-validated as a graph. Orphaned or duplicate nodes conflict.
- An explicit no-trade graph has exactly one no-trade node, and its identity
  must equal both the bundle producer decision identity and explicit no-trade
  evidence identity. Coordinated renaming of candidate, evaluator, outcome or
  no-trade lineage cannot detach that node.
- The adapter passes the exclusive disposition, complete sorted decision-node
  graph and canonical no-trade semantics into
  `canonical_decision_semantic_binding_v1`; its digest is included in the
  canonical `decision_evidence_digest`.
- Expected evaluator/horizon lineage is decision-bound. Actual outcomes are
  validated against a separate replay/evaluation digest and cannot change the
  decision evidence digest.
- Counterfactual evaluation requested by the caller requires explicit,
  candidate-bound outcome lineage for every member and an `evaluable` 665A
  readiness result.

## Fixture coverage

The fixture matrix contains 18 synthetic cases covering all requested
scenario classes (provider gap and stale data are split into separate cases).
The deterministic report is in
`docs/action-665b-fixture-coverage-report.json`.

| Classification | Count |
| --- | ---: |
| mapped | 9 |
| conflicting | 5 |
| unmappable | 4 |
| complete opportunity sets | 9 |
| counterfactual-evaluable sets | 7 |

These counts are contract evidence only. The report contains no win rate,
expectancy or other performance value and is not Ture production evidence.

## Remaining producer fields

Full projection of real completed runs is blocked until a producer preserves,
at the decision boundary:

1. stable producer decision and candidate identities;
2. the complete uncropped ranked membership and explicit completeness count;
3. deterministic tie-break evidence;
4. scanner, universe, threshold, engine, scoring, ranking, setup, confidence,
   evaluator, provider, build and full Git versions;
5. one explicit point-in-time cutoff and provider source/coverage evidence;
6. exclusive membership status and canonical reason codes for every candidate;
7. explicit no-trade decision evidence rather than absence of publication or
   model/fallback text;
8. candidate-bound evaluator-input/outcome lineage for all rejected,
   overflow and under-threshold members when counterfactual evaluation is
   requested.

## Action 665C proposal

Create a default-off, server-only **completed opportunity-set evidence
builder** that receives the producer's full in-memory ranked candidates before
summary truncation and emits the exact 665B input contract. It should:

- require caller-provided stable IDs, timestamps and version tuple;
- capture canonical reason codes at the policy decision site;
- bind every member to scan and batch lineage;
- prove full-set counts and deterministic tie-break order;
- produce diagnostics only when counterfactual outcomes are not yet present;
- remain without a live call-site, database relation, writer or migration.

Action 665C should not activate capture or persist evidence.
