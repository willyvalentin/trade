# SPÅR 2 — Action 665C: Complete Opportunity-Set Evidence Builder

Status: server-only, default-off, in-memory and fixture-only.

## Purpose

`complete_opportunity_set_evidence_builder_v1` converts explicit producer
evidence captured before ranking-summary truncation into exactly the completed
bundle consumed by Action 665B.

The module starts with `import "server-only"` and the factory defaults to:

```text
enabled: false
build: null
```

Fixtures must opt in with `enabled: true`. There is no live call-site, feature
configuration, route, provider access, persistence relation, writer, database
client or migration.

An enabled factory additionally requires a
`CompleteOpportunitySetPreviousBindingLookup`. Without that interface it
remains disabled. This makes semantic-collision lookup mandatory at the future
idempotency boundary rather than optional caller data.

## Required input

The builder requires:

- source namespace, stable scan ID and producer decision ID;
- decision timestamp and an equal point-in-time cutoff;
- explicit full-membership declaration plus expected and observed counts;
- verified `pre_truncation_candidate_capture_evidence_v1` from the fixed
  `scanner-full-ranking-boundary-v1` capture boundary;
- every uncropped candidate with stable identity, original rank, normalized
  score and globally unique deterministic tie-break key;
- exclusive `selected`, `rejected`, `overflow` or `under_threshold`
  membership and canonical reason codes;
- scanner, universe, threshold, engine, scoring, ranking and setup versions
  per candidate, matching the complete bundle version tuple;
- confidence, evaluator, provider, build and full Git identities needed by the
  downstream 665A/664 contracts;
- provider source timestamps, freshness, positive versioned
  expected/observed coverage and canonical coverage reasons;
- scan-run, optional batch and candidate lineage;
- explicit recommendation/rejection/no-trade decision lineage nodes;
- a decision-time expected outcome lineage namespace/version, evaluator
  contract/version, intended horizon policy and candidate/decision keys;
- exactly one decision disposition: `publish_recommendations`,
  `explicit_no_trade` or `deterministic_fallback`;
- explicit no-trade evidence only for `explicit_no_trade`.

Free text is retained only as diagnostic input. It never supplies an identity,
reason code, membership decision or no-trade decision.

## Result status and precedence

The enabled builder returns exactly:

1. `identity_conflict`
2. `incomplete_membership`
3. `rank_conflict`
4. `version_conflict`
5. `reason_code_conflict`
6. `not_point_in_time_safe`
7. `provider_coverage_incomplete`
8. `no_trade_evidence_missing`
9. `ready`

The first failing category wins and includes sorted reason codes. Invalid
results contain no completed bundle and never call Action 665B.

## Full ranking and publication separation

`presentation_top_k` is presentation metadata only. The builder always emits:

```text
ranking_summary.candidates_ranked
  = ranking_summary.results.length
  = candidates.length
  = expected_candidate_count
  = observed_candidate_count
```

`ranking.selected` records scanner selection. Canonical opportunity membership
records the later decision as one of the four exclusive membership statuses.
For example, a scanner-selected candidate may remain `rejected` after an
explicit build or policy decision. No publication state is reconstructed from
candidate rank.

## Digest and replay contract

For an otherwise valid bundle the builder:

1. projects through the Action 665B adapter;
2. takes the canonical `full_candidate_set_digest`,
   `decision_evidence_digest` and decision-semantic binding calculated by the
   665A contract;
3. looks up the mandatory previous decision binding through the injected
   idempotency-boundary interface;
4. deep-freezes the complete bundle;
5. replays the frozen bundle through 665B;
6. requires identical canonical identity, candidate digest, decision digest,
   semantic-binding digest, lineage-graph digest and version-bundle digest.

The previous-binding tuple contains producer identity, exclusive disposition,
explicit no-trade producer identity when applicable, candidate-set digest,
decision-evidence digest, semantic-binding digest, lineage-graph digest and
version-bundle digest. Any changed field for the same producer decision ID is
`identity_conflict`; it is never an overwrite or silent new sample.

## No-trade contract

No-trade requires a recorded explicit decision whose producer decision ID and
timestamp match the opportunity set and whose reason is canonical. Model
`no_trade`, deterministic fallback, zero publications, cooldown prose or an
empty result are not substitutes.

The three decision dispositions are mutually exclusive. A bundle carrying
both explicit no-trade and fallback evidence is a conflict.

## Synthetic readiness report

The deterministic fixture report is
`docs/action-665c-fixture-readiness-report.json`.

| Status | Count |
| --- | ---: |
| ready | 8 |
| incomplete_membership | 1 |
| rank_conflict | 3 |
| identity_conflict | 1 |
| version_conflict | 1 |
| reason_code_conflict | 1 |
| not_point_in_time_safe | 1 |
| provider_coverage_incomplete | 1 |
| no_trade_evidence_missing | 1 |
| total | 18 |

All eight ready fixtures pass two `mapped` 665B projections and preserve the
full ranking. The evidence is synthetic contract evidence and contains no
performance metric.

## Remaining live producer changes

No current live producer supplies this input atomically. A future, separately
authorized implementation must still:

1. allocate stable scan, decision and candidate IDs before ranking;
2. retain the full ranked list before the presentation summary is capped;
3. capture per-candidate producer versions and tie-break keys;
4. emit canonical policy reason codes at the actual selection/rejection site;
5. bind the complete list to scan run, batch and later outcome identities;
6. record explicit no-trade at the policy decision site;
7. expose point-in-time provider timestamps and coverage counts;
8. decide whether and where the inactive evidence may be persisted.

Action 665C makes none of these live changes.

## Recommended next action

**Action 665D — Counterfactual Opportunity-Set Foundation Freeze and
Independent Review**

Freeze Actions 665A–C, create a path/SHA-256 manifest and independently review
identity collision, candidate-set completeness, rank/tie determinism,
publication separation, reason-code provenance, no-trade evidence,
point-in-time safety, digest replay, deep-freeze behavior, default-off
containment and absence of live imports. Run fresh 664/665A–C regressions and
classify findings without remediating them in the same action.
