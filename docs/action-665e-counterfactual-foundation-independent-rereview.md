# SPÅR 2 — Action 665E: Counterfactual Foundation Independent Re-review

Review status: completed against the frozen Action 665A–E byte set.

No frozen Action 665A–E artifact was changed after the re-review started.
Findings below were not remediated in this Action.

## Freeze evidence

- Branch: `codex/action-665a-counterfactual-opportunity-set-contract`
- Stacked base/HEAD: `9221aa514a6c5de76ffbe7c05cad2db41a06a928`
- Frozen artifacts: 17
- Manifest:
  `docs/action-665e-counterfactual-foundation-refreeze-manifest.json`
- Aggregate algorithm:
  `sha256(path + NUL + sha256 + LF)`, paths sorted bytewise
- Before re-review:
  `e513c7bafc6848312a3111d4287d4ec11f65e566238bc578a7da732ad40ba34a`
- After re-review:
  `e513c7bafc6848312a3111d4287d4ec11f65e566238bc578a7da732ad40ba34a`

## Fresh regression

| Check | Result |
| --- | --- |
| Action 665A–E | 55/55 pass |
| Action 664 intelligence foundation | 163/163 pass |
| Disposable local PostgreSQL matrices | pass as part of Action 664 |
| Fixture JSON parity | pass |
| Input ordering, deterministic replay and immutability | pass |
| TypeScript (`npx tsc --noEmit`) | pass |
| Scoped ESLint with zero warnings | pass |
| `git diff --check` | pass |
| Live-import search | no live call-site |
| Dependency lock diff | none |
| Pre/post aggregate digest | identical |

The first direct 665 Playwright invocation was not a product failure: it
omitted the repository's required `react-server` condition. The final 55/55
run used the same documented condition and web-server bypass as the versioned
Action 664 foundation command.

## Finding-to-remediation review

| Action 665D finding | Re-review result |
| --- | --- |
| Major 1 — authoritative pre-truncation evidence | contract present and cross-checked; pass within inactive scope, with producer-boundary integration still required |
| Major 2 — exclusive decision disposition | mutual exclusion validation passes, but semantic binding remains incomplete; Major finding 1 below |
| Major 3 — outcome/evaluator lineage | pass; expected lineage is decision-bound and actual outcomes use a separate recomputed evaluation digest |
| Major 4 — full lineage graph | recommendation/batch/snapshot checks pass, but explicit no-trade identity binding remains incomplete; Major finding 2 below |
| Major 5 — positive provider coverage | pass |
| Minor 1 — closed reason taxonomy | pass |
| Minor 2 — mandatory previous-binding lookup | lookup is mandatory and fail-closed, but its compared semantic tuple is incomplete because of Major finding 1 |
| Nit — early `presentation_top_k` validation | pass |

## Independent threat review

| Threat | Result |
| --- | --- |
| Self-consistent candidate omission | contained by capture identity list and evidence digest |
| Capture evidence tampering | contained by canonical digest recomputation |
| Duplicate candidate/rank or missing tie-break | contained |
| Mixed producer versions | contained |
| Future provider data | contained |
| Future actual outcome in decision digest | excluded; separate evaluation digest required |
| Unknown/free-text reason code | unmappable |
| No-trade plus fallback | conflicting |
| Zero provider denominator for nonempty set | rejected |
| Mutable builder output | contained by recursive freeze |
| Live call-site or persistence import | none |
| Same decision identity with changed disposition/no-trade semantics | not contained; Major finding 1 |
| No-trade lineage node detached from explicit no-trade identity | not contained; Major finding 2 |

## Findings

### Major 1 — Disposition and no-trade semantics are not bound to the idempotency tuple

The completed bundle has exactly one `decision_disposition`, and contradictory
no-trade/fallback fields are rejected. However, the canonical
`decision_evidence_digest` is computed only from the opportunity-set identity,
candidate digest, versions, counts, provider context and capture-evidence
digest. It does not include:

- `decision_disposition`;
- the explicit no-trade reason/source evidence; or
- the canonical no-trade decision semantic digest.

The mandatory previous-binding lookup compares only
`full_candidate_set_digest` and `decision_evidence_digest`. Consequently, the
same producer decision identity and candidate set can change from
`publish_recommendations` to `deterministic_fallback`, or can change explicit
no-trade semantics, without necessarily producing
`same_decision_identity_different_evidence`.

Impact: the semantic collision boundary is not complete, and retry evidence
can describe a different final decision while passing the prior-binding gate.

Required remediation: introduce a versioned completed-decision semantic
binding that includes the exclusive disposition and, when applicable, the
canonical no-trade decision digest. Return and compare that binding through
the mandatory previous-binding lookup and round-trip checks.

Evidence:
`lib/canonical-counterfactual-opportunity-set.ts:961` and
`lib/server/complete-opportunity-set-evidence-builder.ts:815`.

### Major 2 — No-trade lineage node is not bound to the explicit no-trade decision identity

For `explicit_no_trade`, candidate lineage is checked against a `no_trade`
decision node, while the no-trade evidence separately checks its producer
decision identity against the bundle producer identity. The adapter does not
cross-check the no-trade node's `decision_identity` against that explicit
no-trade evidence or producer decision identity.

A caller can therefore change the no-trade node identity, all candidates'
`recommendation_decision_identity` fields and their expected/evaluation
lineage consistently while leaving the explicit no-trade evidence on the
original producer identity. The two internally consistent subgraphs are not
joined.

Impact: the required
`candidate → scan → batch → no-trade → expected outcome lineage` graph is not
fully proven and later outcome joins can target a detached decision node.

Required remediation: for `explicit_no_trade`, require exactly one no-trade
node whose identity equals the explicit no-trade producer decision identity,
and require every candidate's no-trade lineage reference to equal that node.
Add a negative golden test for a consistently renamed but detached no-trade
subgraph.

Evidence:
`lib/server/completed-scanner-bundle-opportunity-set-adapter.ts:1052` and
`lib/server/completed-scanner-bundle-opportunity-set-adapter.ts:1246`.

## Finding counts

```text
blocker: 0
major: 2
minor: 0
nit: 0
```

## Remaining integration dependencies

No live integration is authorized. After the two major findings are fixed and
re-frozen, a future producer integration must still:

1. create the capture evidence at the actual pre-truncation boundary;
2. derive identities and versions from producer state;
3. provide an atomic previous-binding lookup at the idempotency boundary;
4. preserve disposition, candidate membership and lineage graph atomically;
5. remain default-off until a separate activation decision.

## Binary decisions

```text
action_665e_findings_remediated: false
action_665e_refreeze_complete: true
action_665e_independent_review_approved: false
```

Approval is false because blocker count is zero but major count is two.

## Recommended next action

Action 665E.1 — Decision Semantic Binding and Explicit No-Trade Lineage
Remediation.

Change only the completed-decision binding, previous-binding comparison,
explicit no-trade lineage join, focused fixtures/tests and their documentation.
Then rerun Action 664/665, create a new freeze manifest and perform another
independent re-review before any local checkpoint commit.
