# Action 664J — Foundation Review Finding Remediation

Track: **SPÅR 2**

Date: 2026-07-26

Branch: `codex/action-664a-evaluation-contract`

Baseline/HEAD: `f578dd5bedeccb0f95b58c4f15ba2cb3dc1eea33`

Starting freeze digest:
`ddd86aff397b099f1b9742fd886e003ab9b53d7f48b38295ed77cc571815fbe2`.

Status: all five major and two minor Action 664I findings are remediated in
the inactive fixture-only foundation. No live consumer, database, route,
scanner, provider, scoring, ranking, publishing, or promotion path is enabled.

## Finding-to-contract mapping

| Finding | Contract remediation | Positive and negative evidence |
| --- | --- | --- |
| MAJOR-001 version provenance | `canonical_quality_comparison_evidence_v1` carries the per-identity version tuple. Scorecard assembly derives one tuple and `sha256_sorted_metric_version_evidence_v1`; no caller version input exists. Missing, mixed, or ranking-conflicting evidence fails closed. | `action-664j-foundation-review-remediation.spec.ts`: derived tuple ignores a runtime override; missing/mixed tuples conflict. Existing H deterministic scorecard tests remain green. |
| MAJOR-002 coverage arithmetic | Assembly accepts counts only. `eligible + missing + incomplete + ambiguous + conflicting + excluded` must equal `expected`; every count is a non-negative integer. Coverage and reproducibility rates are derived. | J tests verify a valid 125-row partition and reject negative and over-counted partitions. Caller-supplied rate-shaped properties cannot affect the result. |
| MAJOR-003 pair-bound comparability | `deriveCanonicalPairBoundComparabilityEvidence` derives a digest-bound object from both verified scorecards. It binds both scorecard digests, cohort, period, policy, denominator, opportunity set, evaluator/provider, coverage, and reproducibility. The comparison API accepts no documented override. | J tests verify the positive pair object and show that a forged standalone override cannot bypass a changed period; tampering the embedded evidence invalidates the comparison digest. |
| MAJOR-004 no-trade comparability | No-trade opportunity cost is a normal comparison delta over decision-bound counterfactual evidence. Shadow gates accept only a digest-valid no-trade `CanonicalQualityVersionComparison` that passed the same main comparability gate. | J tests verify a comparable 120-identity no-trade pair and prove that a period mismatch becomes `not_evaluable`, never advisory pass. |
| MAJOR-005 reproducible command | `npm run test:intelligence-foundation` invokes versioned runner `action_664_foundation_test_command_v1`, sets `NODE_OPTIONS=--conditions=react-server` and `PLAYWRIGHT_SKIP_WEB_SERVER=true`, enumerates Action 664A–J specs, and uses one worker. | The contract test proves the unconditioned `server-only` import fails while the conditioned import succeeds. After `npm ci --ignore-scripts`, the standard command passed 156/156 tests. |
| MINOR-001 Wilson label | Conservative candidate-minus-baseline bounds use `conservative_wilson_interval_difference_v1`; single-proportion Wilson results retain `wilson_score_interval_v1`. | J test asserts the separate identifier and rejects the single-interval label for a delta. |
| MINOR-002 SQL/application digest boundary | PostgreSQL validates digest shape plus normalized/envelope parity only. The server recomputes canonical JSON SHA-256 immediately before insert and after each identity readback. No SQL canonicalizer was added. | J tests verify valid preinsert/readback digests and detect digest tampering before insert and envelope tampering after readback. The disposable PostgreSQL matrix still passes 13/13. |

## Standard clean-install command

```text
npm ci --ignore-scripts
npm run test:intelligence-foundation
```

No manual environment edit is required. The runner owns the required
`react-server` condition and keeps the existing environment otherwise intact.

## Verification before re-freeze

| Check | Result |
| --- | --- |
| Action 664A–J standard command | 156/156 passed |
| Action 664D disposable PostgreSQL matrix | 13/13 passed |
| Action 664E disposable PostgreSQL integration | passed within standard command |
| Action 664F disposable PostgreSQL integration | passed within standard command |
| TypeScript `--noEmit --incremental false` | passed |
| Scoped ESLint | passed, zero warnings |
| `git diff --check` | passed |
| Remaining Action 664 Docker containers | zero |
| `deno.lock` | unchanged |

Migration `20260726001000` now has SHA-256
`212296f6cd3c22bf775fc969ee569c359bf80b32bb9aac78ec1592ba6d7bbcd1`;
the change is documentation of the SQL/application digest trust boundary.
It remains distinct from Track 1's reserved `20260726000000`.

## Live-effect boundary

The foundation remains default-off and fixture-only. Existing live routes,
generators, scanners, ranking/scoring code, snapshot/outcome writers, UI, and
learning jobs do not import the new foundation. No migration was applied
outside disposable local PostgreSQL. No commit, push, PR, deployment,
production read, activation, dual-write, or backfill occurred.
