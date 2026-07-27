# SPÅR 2 — Action 665E.1: Counterfactual Foundation Independent Re-review

Review status: approved against the frozen Action 665A–E.1 byte set.

No frozen Action 665A–E.1 artifact was changed after the re-review started.

## Freeze evidence

- Branch: `codex/action-665a-counterfactual-opportunity-set-contract`
- Stacked base/HEAD: `9221aa514a6c5de76ffbe7c05cad2db41a06a928`
- Frozen artifacts: 19
- Manifest:
  `docs/action-665e1-counterfactual-foundation-refreeze-manifest.json`
- Aggregate algorithm:
  `sha256(path + NUL + sha256 + LF)`, paths sorted bytewise
- Before re-review:
  `3847cd5d3e371fe090269f11b0657544c496c73179a4f36d971108507c56c4c4`
- After re-review:
  `3847cd5d3e371fe090269f11b0657544c496c73179a4f36d971108507c56c4c4`

## Fresh regression

| Check | Result |
| --- | --- |
| Action 665A–E.1 | 63/63 pass |
| Action 664 intelligence foundation | 163/163 pass |
| Disposable local PostgreSQL matrices | pass as part of Action 664 |
| Fixture JSON parity | pass |
| Input ordering, deterministic replay and immutability | pass |
| Identical retry byte parity | pass |
| TypeScript (`npx tsc --noEmit`) | pass |
| Scoped ESLint with zero warnings | pass |
| `git diff --check` and untracked whitespace scan | pass |
| Live-import search | no live call-site |
| Dependency lock diff | none |
| Pre/post aggregate digest | identical |

## Original Action 665D finding review

| Finding | Final result |
| --- | --- |
| Major 1 — authoritative pre-truncation evidence | pass within inactive scope; capture is versioned, identity-list-bound and independently verified |
| Major 2 — exclusive decision disposition | pass; overall and per-candidate terminals are derived, mutually exclusive and digest-bound |
| Major 3 — outcome/evaluator lineage | pass; expected lineage is decision-bound while future outcomes remain separately evaluation-digest-bound |
| Major 4 — full lineage graph | pass; candidate, scan, batch, decision node, snapshot/no-trade and expected evaluator lineage are joined |
| Major 5 — positive provider coverage | pass |
| Minor 1 — closed reason taxonomy | pass |
| Minor 2 — mandatory semantic collision boundary | pass; full prior-binding tuple is mandatory and fail-closed |
| Nit — early `presentation_top_k` validation | pass |

## Action 665E residual-major review

### Decision disposition and idempotency binding

Pass.

`canonical_decision_semantic_binding_v1` derives and binds:

- the exclusive overall disposition;
- one terminal disposition per candidate;
- the sorted decision-node graph;
- canonical no-trade semantics or `null`;
- candidate-set, lineage-graph and version-bundle digests.

Its semantic digest is included in `decision_evidence_digest`. The mandatory
previous-binding tuple additionally compares disposition, explicit no-trade
producer identity, candidate digest, decision digest, semantic-binding
digest, lineage digest and version digest. Identical retry produces
byte-identical output; publish/fallback/no-trade transitions and changes to
membership, expected evaluator lineage, no-trade semantics or versions
conflict under the same producer decision identity.

### Explicit no-trade lineage join

Pass.

An explicit no-trade set requires exactly one no-trade node whose identity is
the producer decision identity. All candidate and expected outcome references
must join that node. Coordinated subgraph renaming conflicts. Canonical
no-trade decisions must match the bound reason, detail, source, timestamp and
producer identity.

A rejected-candidate decision cannot be built or verified from an explicit
no-trade terminal binding, preventing one canonical decision identity from
acquiring both `no_trade` and `rejected_candidate` sample semantics.

## Threat review

| Threat | Result |
| --- | --- |
| Same identity, changed disposition | contained |
| Same identity, changed no-trade identity or semantics | contained |
| Same identity, changed candidate membership | contained |
| Same identity, changed version bundle | contained |
| Coordinated no-trade lineage renaming | contained |
| Detached candidate/batch/snapshot node | contained |
| Duplicate candidate/rank/lineage node | contained |
| Truncated or self-consistently omitted membership | contained |
| Fallback represented as no-trade | contained |
| Rejected-candidate sample emitted from no-trade binding | contained |
| Future provider data | contained |
| Future outcome included in decision digest | excluded by design |
| Tampered actual outcome/evaluator evidence | separate evaluation digest is recomputed |
| Unknown reason code | unmappable |
| Zero provider denominator for nonempty set | rejected |
| Mutable output | contained by recursive freeze |
| Live call-site, persistence or provider access | absent |

## Finding counts

```text
blocker: 0
major: 0
minor: 0
nit: 0
```

## Remaining producer-integration gaps

These are inactive integration dependencies, not review findings:

1. the real producer must create capture evidence at the actual
   pre-truncation boundary;
2. identities, version tuple, reason codes, provider timestamps and lineage
   must be derived from producer state rather than fixture input;
3. any future previous-binding lookup must be atomic with the future
   idempotency/persistence boundary;
4. rejected/overflow/under-threshold outcomes still require a separately
   authorized producer and evaluator capture path;
5. activation, persistence, backfill and production evaluation remain
   separately prohibited.

## Binary decisions

```text
action_665e1_decision_semantic_binding_remediated: true
action_665e1_explicit_no_trade_lineage_remediated: true
action_665e1_refreeze_complete: true
action_665e1_independent_review_approved: true
```

Approval is true because blocker and major counts are both zero.

## Recommended next bounded action

Action 665F — Frozen Counterfactual Foundation Local Checkpoint and
Stacked-Base Reconciliation.

Verify the exact 19-artifact freeze plus its manifest/re-review evidence
against stacked base `9221aa514a6c5de76ffbe7c05cad2db41a06a928`, stage only
the approved paths, rerun the staged-tree checks and create one local
checkpoint commit. Do not push or update PR #50 without separate explicit
authorization and cross-track dependency reconciliation.
