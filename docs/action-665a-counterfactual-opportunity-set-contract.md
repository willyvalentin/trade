# SPÅR 2 — Action 665A: Counterfactual opportunity-set contract

Status: inactive, fixture-only, no live imports.

## Scope

Action 665A defines a pure TypeScript contract for complete ranked opportunity
sets, explicit no-trade decisions, rejected-candidate decisions, deterministic
counterfactual readiness, and an inactive projection to the Action 664
evaluation/metrics types.

It does not read production data, call a provider, write a database, change a
scanner, alter ranking/thresholds, or infer a no-trade decision from an empty
publication result.

## Read-only source inventory

| Current source | Evidence available now | Blocking gap |
| --- | --- | --- |
| `lib/scanner-candidate-ranking.ts` | Rank, normalized ranking score, tier, selected flag, selection bucket, warnings and source contribution | `results` is truncated to `max(20, targetMax)`; no stable scan/candidate decision IDs; no engine/scoring/ranking build tuple; no threshold identity |
| `lib/recommendation-generator.ts` | Local score, ranking summary, selected tickers, publishable threshold, build diagnostics and aggregate no-publish reasons | Cooldown removals are free-text strings; pre-ranking removals lose rank membership; `AiResponse.no_trade` is converted to deterministic fallback and is not an explicit durable no-trade decision |
| `lib/recommendation-build-diagnostics.ts` | Structured selected-to-built rejection reasons | Only selected candidates are represented; no full opportunity set, candidate identity, outcome identity or point-in-time cutoff |
| `lib/batch-candidate-audit.ts` | Aggregate raw/ranked/selected/built/published counts and best-effort lineage | Counts can be reconciled heuristically; aggregate drop-offs cannot reproduce candidate membership or rank |
| `lib/recommendation-scan-run.ts` and `recommendation_scan_runs` | Run/fingerprint, timestamps, window, counts, provider summaries and best-effort payload | No immutable full candidate membership/digest; fingerprint is observability identity, not a canonical decision identity |
| `lib/recommendation-batch-memory.ts` and `recommendation_batches` | Batch/fingerprint, scan-run linkage and recommendation snapshot membership | Only published/built recommendation membership is durable |
| `lib/recommendation-snapshot.ts` and outcome tracker | Snapshot/recommendation identity and horizon outcomes for built recommendations | Rejected/overflow/under-threshold candidates and no-trade decisions have no snapshot/outcome identity |
| Action 664 projection/read model | Exclusive `no_trade` and `rejected_candidate` sample types and isolated counterfactual cohorts | Current adapters correctly mark no-trade counterfactual coverage not evaluable because a complete opportunity set is absent |

## Identity contract

The opportunity-set identity represents one explicit scan decision and is
derived only from:

```text
source namespace
+ stable scan identity
+ stable producer decision identity
+ exact decision timestamp
```

The full candidate-set digest is separate from the identity. Consequently,
the same identity with another candidate-set digest is an explicit semantic
conflict rather than a second opportunity set.

A separate decision-evidence digest binds that candidate-set digest to the
versions, counts, provider context, point-in-time cutoff and
`canonical_decision_semantic_binding_v1`. The semantic binding contains the
exclusive overall disposition, derived terminal disposition for every
candidate, sorted decision-lineage nodes, canonical no-trade semantics when
applicable, and separate lineage-graph and version-bundle digests. Publish,
fallback, explicit no-trade, rejection, overflow and under-threshold
terminals are therefore cryptographically distinct under one canonical
decision identity.

The immutable decision-time candidate-set digest includes every member's
stable identity, ticker, original rank/score, explicit tie-break key,
setup/context, membership status, rejection reasons, threshold/ranking
versions, eligibility, data gaps, provider timestamp, full lineage and the
expected evaluator/horizon contract. Actual outcomes are excluded from this
decision-time digest. Later outcome data is bound separately by an evaluation
digest containing the expected lineage, actual evaluator input lineage and
outcome.

Each opportunity set also binds:

- scanner and universe versions;
- engine, scoring and ranking versions;
- threshold, setup taxonomy, confidence, evaluator and provider contracts;
- `canonical_counterfactual_reason_taxonomy_v1`;
- full Git SHA and build identity;
- expected/observed candidate counts;
- provider source timestamp, freshness and positive versioned coverage;
- the verified `pre_truncation_candidate_capture_evidence_v1` digest;
- an exact point-in-time cutoff equal to the decision timestamp.

## Membership and rank policy

Membership status is exclusive:

- `selected`
- `rejected`
- `overflow`
- `under_threshold`

Non-selected members require explicit rejection reason codes. Selected
members cannot carry rejection reason codes. Candidate lineage keeps the scan,
optional batch, optional recommendation/rejection decision, and optional
snapshot identity. Codes outside the closed versioned taxonomy are
unmappable; well-formed free text is not accepted as a code.

Ranks must start at 1 with no missing rank groups. A duplicated original rank
is accepted only when every member of the tied group has a unique explicit
tie-break key. Canonical order is then deterministic by original rank and the
explicit tie-break key. Ticker order is never invented as a hidden tie-break.

## No-trade policy

A no-trade decision exists only when `explicit_no_trade_decision` is true and
the producer decision ID, timestamp and source namespace join the opportunity
set. The reason code and decision source must be explicit.

An empty recommendation list, an OpenAI response, a fallback path, a cooldown,
or an aggregate no-publish reason is never promoted to no-trade semantics by
this contract.

Completed evidence carries one exclusive disposition:
`publish_recommendations`, `explicit_no_trade` or
`deterministic_fallback`. No-trade and fallback evidence cannot coexist. An
explicit no-trade set requires exactly one no-trade lineage node whose
identity is the producer decision identity; every candidate and expected
outcome lineage must reference that exact node. The bound reason, detail,
source and producer identity must also match any canonical no-trade decision
built from the opportunity set.

## Counterfactual readiness

Readiness is exclusive and fail-closed:

1. `conflicting`
2. `not_point_in_time_safe`
3. `incomplete_opportunity_set`
4. `rank_gap`
5. `provider_gap`
6. `candidate_outcome_missing`
7. `non_reproducible`
8. `evaluable`

The order above is deterministic precedence when multiple defects coexist.
No-trade precision, precision@K or opportunity cost can be projected as
complete only for `evaluable` sets. Every candidate must be present, ranked,
point-in-time safe and have a complete reproducible outcome.

## Inactive Action 664 projection

The projection produces:

- an Action 664 canonical recommendation decision with sample type
  `no_trade` or `rejected_candidate`;
- an exact `CanonicalRankingOpportunitySet`;
- an exact `CanonicalCounterfactualOpportunitySet`.

No categorical confidence is converted to a probability. Counterfactual
decisions use explicit null numeric/label confidence. No persistence relation,
writer, capture orchestrator, route or UI imports the projection.

## Golden evidence

Synthetic fixtures cover:

- complete selected/rejected membership;
- explicit no-trade and rejected-candidate projection;
- truncated top-K;
- missing and duplicate ranks;
- explicit deterministic rank ties;
- overflow and under-threshold members;
- missing/non-reproducible outcomes;
- provider gaps and stale data;
- post-cutoff leakage;
- mixed ranking versions;
- input-order determinism;
- same identity with another candidate-set digest;
- absence of an explicit no-trade decision;
- digest tampering and input immutability.

These fixtures are contract evidence, not Ture performance evidence.

## Remaining data gaps

Full projection from current live artifacts remains impossible until a later
inactive capture layer can receive, without heuristics:

1. a stable scan decision ID and stable candidate IDs before filtering;
2. the complete untruncated ranked membership, including cooldown removals,
   overflow and under-threshold candidates;
3. explicit scanner/universe/engine/scoring/ranking/threshold/build versions;
4. structured rejection reason codes instead of aggregate/free-text reasons;
5. provider timestamps and candidate-level freshness at the decision cutoff;
6. an explicit no-trade decision event distinct from zero publication;
7. outcome identities and reproducible evaluator inputs for every candidate;
8. durable scan → batch → candidate → decision/snapshot/outcome lineage.

## Proposed Action 665B

Create a default-off, server-only capture adapter for exactly one source:
completed scanner ranking/build diagnostic bundles. It should project existing
payloads into `mapped`, `conflicting` or `unmappable` readiness diagnostics,
prove that truncated legacy summaries remain non-evaluable, and produce an
in-memory 665A envelope only when all explicit fields are present.

Action 665B must not add a migration, writer, live call-site, provider request,
backfill or production-data read.
