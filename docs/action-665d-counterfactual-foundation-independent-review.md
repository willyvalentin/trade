# SPÅR 2 — Action 665D: Counterfactual Foundation Independent Review

Review status: completed against the frozen Action 665A–C byte set.

No Action 665A–C artifact was changed after review start. Findings below were
not remediated in this Action.

## Freeze evidence

- Branch: `codex/action-665a-counterfactual-opportunity-set-contract`
- Stacked base/HEAD: `9221aa514a6c5de76ffbe7c05cad2db41a06a928`
- Frozen artifacts: 14
- Manifest:
  `docs/action-665d-counterfactual-foundation-freeze-manifest.json`
- Aggregate algorithm:
  `sha256(path + NUL + sha256 + LF)`, paths sorted bytewise
- Before regression:
  `89570104844bdf8fe069b4ff077b517d5dd1c18219721dc24a248a34b338b5b0`
- After regression:
  `89570104844bdf8fe069b4ff077b517d5dd1c18219721dc24a248a34b338b5b0`

## Fresh regression

| Check | Result |
| --- | --- |
| Action 665A–C | 45/45 pass |
| Action 664 intelligence foundation | 163/163 pass |
| Disposable local PostgreSQL matrices | pass as part of 664 |
| Fixture JSON parity | pass |
| Input ordering and replay determinism | pass |
| Input immutability and deep-freeze fixture | pass |
| TypeScript | pass |
| Scoped ESLint | pass |
| `git diff --check` | pass |
| Live-import search | no live call-site |
| Dependency lock diff | none |
| Pre/post aggregate digest | identical |

## Independent review summary

| Area | Result |
| --- | --- |
| Identity format and same-identity semantic comparison | pass with integration dependency |
| Full candidate membership | major finding |
| Top-K/truncation fail-closed | partial; explicit mismatch passes, self-consistent omission does not |
| Rank continuity and tie-break | pass |
| Membership status separation | pass |
| Canonical reason codes | minor finding |
| Explicit no-trade | major finding |
| AI fallback isolation | partial; normal fixture passes, contradictory flags do not |
| Point-in-time cutoff | pass |
| Provider coverage | major finding |
| Version tuple consistency | pass; live provenance remains external |
| Outcome lineage | major finding |
| Candidate/evidence digests | pass for fields included; lineage boundary has major finding |
| Default-off and no live effect | pass |
| Synthetic evidence labelling | pass |

## Findings

### Major 1 — Complete membership is self-attested

`membershipReasons` compares `expected_candidate_count`,
`observed_candidate_count` and `candidates.length`, but does not bind those
values to an independent producer-side pre-truncation count or source digest.
It does not compare against `scan_run.raw_candidate_count`,
`scan_run.scanned_ticker_count` or another authoritative capture field.

Consequently, removing a candidate and changing all three caller-supplied
counts consistently can still produce `ready`. The ordinary truncated fixture
is rejected only because its counts disagree.

Impact: candidate omission can silently lower the counterfactual denominator
and alter no-trade opportunity cost.

Required remediation: bind the builder to an independently produced
pre-truncation membership count and preferably a producer candidate-set
digest; define how pre-ranking, ranked and filtered counts relate.

Evidence:
`lib/server/complete-opportunity-set-evidence-builder.ts:302`.

### Major 2 — Contradictory fallback/no-trade evidence can pass

No-trade validation rejects AI fallback only when
`explicit_decision_recorded` is false. A payload with:

```text
explicit_decision_recorded = true
deterministic_fallback_used = true
```

and otherwise matching IDs/reason can become a canonical no-trade decision.
The 665B adapter has the same semantic gap.

Impact: a fallback publication path can be relabelled as no-trade and enter a
counterfactual cohort.

Required remediation: define mutually exclusive final-decision evidence and
reject no-trade whenever fallback replaced the model/no-trade response, unless
a separately identified later policy decision proves the final state.

Evidence:
`lib/server/complete-opportunity-set-evidence-builder.ts:519` and
`lib/server/completed-scanner-bundle-opportunity-set-adapter.ts:759`.

### Major 3 — Future outcome lineage is not fully digest-bound

The builder validates syntax and uniqueness of
`future_outcome_lineage`, but:

- does not require its evaluator-input/intended-outcome identities to match an
  already supplied `outcome_lineage`;
- prefers the existing `outcome_lineage` and drops the separate future
  evidence during 665B bundle construction;
- the 665B-to-665A projection does not include evaluator-input lineage in the
  canonical candidate-set or decision-evidence digest.

Changing a future evaluator-input identity can therefore leave both reported
digests unchanged.

Impact: later outcome joins can drift without a decision-time digest conflict.

Required remediation: define one canonical outcome-lineage identity, verify
future/current parity and include that identity in the decision-time candidate
payload or a separately bound lineage digest.

Evidence:
`lib/server/complete-opportunity-set-evidence-builder.ts:263`,
`lib/server/complete-opportunity-set-evidence-builder.ts:625`,
`lib/server/completed-scanner-bundle-opportunity-set-adapter.ts:871`, and
`lib/canonical-counterfactual-opportunity-set.ts:376`.

### Major 4 — Direct 665B batch/snapshot lineage is under-validated

The 665B adapter checks that the batch points to the scan run, but does not
verify:

- each candidate `batch_identity` against `batch.id`;
- selected candidate snapshot identities against
  `batch.recommendation_snapshot_ids`;
- recommendation-decision/snapshot membership against the batch.

Action 665C adds a candidate-to-batch check, but still does not bind selected
snapshots to the batch, and callers can use the 665B adapter directly.

Impact: a completed bundle with contradictory batch/snapshot lineage can map.

Required remediation: add exact candidate → batch → snapshot relation checks
in 665B and corresponding positive/negative fixtures.

Evidence:
`lib/server/completed-scanner-bundle-opportunity-set-adapter.ts:274`,
`lib/server/completed-scanner-bundle-opportunity-set-adapter.ts:889`, and
`lib/server/complete-opportunity-set-evidence-builder.ts:280`.

### Major 5 — Zero-observation provider coverage can be “complete”

Provider validation permits:

```text
freshness = fresh
expected_observation_count = 0
observed_observation_count = 0
coverage_reason_codes = []
```

for a non-empty candidate set. Equality is treated as complete without a
positive denominator or a defined relationship to candidate/candle coverage.

Impact: a non-empty set can become counterfactual-ready with no demonstrated
provider observations.

Required remediation: version the coverage unit and require a positive
expected denominator for non-empty sets, or explicitly prove why zero is
valid for the relevant provider contract.

Evidence:
`lib/server/complete-opportunity-set-evidence-builder.ts:495`,
`lib/server/completed-scanner-bundle-opportunity-set-adapter.ts:239`, and
`lib/canonical-counterfactual-opportunity-set.ts:764`.

### Minor 1 — “Canonical” reason codes are syntax-only

Reason codes are checked against a slug pattern but not a versioned taxonomy
or allowlist. Arbitrary well-formed strings can fragment diagnostics while
appearing canonical.

Required remediation: bind a reason-taxonomy version and validate known codes,
with an explicit versioned extension mechanism if needed.

### Minor 2 — Same-decision collision detection is caller-dependent

The builder's `prior_decision_binding` is optional. Without it, changed
membership under the same decision ID can return `ready`; conflict is detected
only when the caller invokes the comparison helper or supplies prior binding.

This is acceptable for the current stateless fixture package but must become a
mandatory idempotency-boundary check before any persistence or capture
integration.

### Nit 1 — Presentation validation occurs after canonical replay

An invalid `presentation_top_k` is rejected only after two successful 665B
projections. There is no side effect, so this is an efficiency/diagnostic
ordering issue only.

## Threat-case disposition

| Threat | Disposition |
| --- | --- |
| Same decision ID, different membership | conditional: caught with prior binding/comparison; Minor 2 |
| Candidate omission | not fully contained; Major 1 |
| Duplicate candidate/rank | contained |
| Mixed versions | internally contained; live provenance pending |
| Future data | contained |
| Free-text normalization | contained; taxonomy remains Minor 1 |
| No-trade inference | normal case contained; contradictory flags remain Major 2 |
| Truncated ranking presented as complete | count mismatch contained; self-consistent omission remains Major 1 |
| Mutable builder output | contained by recursive freeze |
| Digest tampering | canonical payload contained; future-lineage boundary remains Major 3 |
| Live call-site/persistence import | none found |

## Remaining producer integrations

No live integration is authorized. Before any integration, the producer must
provide:

1. authoritative pre-truncation count/digest;
2. final mutually exclusive publish/no-trade decision evidence;
3. versioned reason-code taxonomy;
4. digest-bound evaluator-input/outcome lineage;
5. exact candidate/batch/snapshot relation;
6. versioned non-zero provider-coverage semantics;
7. mandatory retry/idempotency comparison against prior decision evidence;
8. producer-derived engine/scoring/ranking/setup version provenance.

## Binary decisions

```text
action_665d_foundation_frozen: true
action_665d_independent_review_approved: false
```

Approval is false because blocker count is 0 but major count is 5.

## Recommended next action

Action 665E — Counterfactual Foundation Finding Remediation and Re-freeze.

Remediate only the five major and two minor findings, add positive/negative
tests for each, rerun the complete 664/665A–E matrix, create a new manifest and
perform a fresh review. A local checkpoint commit should be considered only
after a re-review reports zero blockers and zero majors.
