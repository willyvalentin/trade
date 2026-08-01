# Action 664I — Intelligence Foundation Freeze and Independent Review

Track: **SPÅR 2**

Review date: 2026-07-26

Branch: `codex/action-664a-evaluation-contract`

Baseline/HEAD: `f578dd5bedeccb0f95b58c4f15ba2cb3dc1eea33`

## Binary decisions

- `action_664i_foundation_frozen: true`
- `action_664i_independent_review_approved: false`

The freeze is valid: all 41 Action 664A–H files retained the same digest before
and after every regression and PostgreSQL run.

Independent approval is false because blocker count is zero but major count is
five. No finding was remediated in Action 664I.

## Freeze evidence

Canonical manifest:
`docs/action-664i-foundation-freeze-manifest.json`

- frozen files: 41
- every frozen file: untracked, as required by the no-commit boundary
- digest algorithm: `sha256_of_sorted_shasum_lines_v1`
- pre-test digest:
  `ddd86aff397b099f1b9742fd886e003ab9b53d7f48b38295ed77cc571815fbe2`
- post-test digest:
  `ddd86aff397b099f1b9742fd886e003ab9b53d7f48b38295ed77cc571815fbe2`
- changed frozen files during verification: zero

The manifest includes relative path, Action owner, artifact type, SHA-256, and
Git status for every A–H artifact.

Migration `20260726001000` has digest
`0f27d93ca5ecd42968468fc2b12a21bb266b87dc1ce840d206b3f8a985ba4291`.
It is distinct from Track 1's immediately preceding local reservation
`20260726000000`. Current baseline and Track 2 contain exactly one
`20260726001000` migration. No collision was found.

## Fresh regression

Dependency state was recreated with `npm ci --ignore-scripts` from an absent
worktree `node_modules`.

| Check | Result |
| --- | --- |
| Clean default Playwright invocation | **failed before collection** |
| Conditioned A–H fixture matrix | 142/142 passed |
| Action 664D disposable PostgreSQL | 13/13 scenarios passed |
| Action 664E disposable PostgreSQL | 1/1 passed |
| Action 664F disposable PostgreSQL | 1/1 passed |
| TypeScript `--noEmit --incremental false` | passed |
| Scoped ESLint over all A–H TypeScript/MJS | passed, zero warnings |
| `git diff --check` | passed |
| `deno.lock`, `package.json`, `package-lock.json` | unchanged |
| Disposable Action 664 containers after run | zero |

The default clean command fails because the installed `server-only@0.0.1`
package selects its throwing default export in the Playwright Node process.
The full matrix passes without modifying dependencies or A–H artifacts when
run with:

```text
PLAYWRIGHT_SKIP_WEB_SERVER=true
NODE_OPTIONS=--conditions=react-server
```

That condition is not present in the repository's current `test:e2e` command
or Playwright configuration. This is recorded as `MAJOR-005`; the successful
conditioned rerun does not erase the clean default failure.

## Independent contract review

| Review area | Result | Evidence |
| --- | --- | --- |
| Canonical identity and sample separation | pass | scalar six-type validator, producer decision ID, identity-format tests |
| Horizon and leakage policy | pass | 60m→30m→15m, overlap cutoff, duplicate horizon fail-closed, same-candle ambiguity |
| Lineage, envelope, semantic digest | pass with minor defense-in-depth finding | C/D round-trip, writer digest, read-model parity |
| Migration owner/RLS/ACL/append-only | pass | owner postgres, RLS enabled, zero policies, browser denial, service role SELECT/INSERT |
| Flag and kill switch before client construction | pass | writer and orchestrator return before factory/default client |
| Idempotency and semantic conflict | pass | identity unique, same digest no-effect, different digest conflict |
| Read-only read model | pass | bounded SELECT-only interface; no mutation methods |
| Cohort and denominator isolation | pass through 664G; conditional in 664H | unique identity denominator and cohort filters; H provenance findings remain |
| Statistical uncertainty and `not_measurable_yet` | pass with minor labeling finding | Wilson, seeded day bootstrap, explicit null/status |
| Scorecard comparability and causal-claim prohibition | **major findings** | causal claim remains false, but documented comparability evidence is not bound |
| Automatic promotion prohibition | pass | all scorecards/comparisons/gates explicitly false/advisory |
| Rollback metadata and placeholders | pass with dependency | previous/candidate versions, evidence digests, triggers; owner remains `UNASSIGNED` |

## Findings

### Blocker

None.

### Major

#### MAJOR-001 — Scorecard version provenance is not bound to metric evidence

`assembleCanonicalQualityScorecard` accepts engine/scoring/ranking/evaluator/
provider versions as independent caller metadata. The 664G comparison evidence
contains identity, day, ticker, outcome, probability, Brier loss, and ranking
observations, but no per-row version tuple. Assembly only checks that the
caller-provided version strings are non-empty.

Impact: the same computed 664G metrics can be labeled as an arbitrary engine,
scoring, or ranking version and receive a valid scorecard digest. The digest
proves what was assembled, not that the version tuple produced the evidence.

Evidence:

- `lib/canonical-quality-metrics.ts:134-155`
- `lib/canonical-quality-scorecard.ts:324-370`
- `lib/canonical-quality-scorecard.ts:436-466`

Required future remediation: make 664G evidence carry a single validated
version tuple or a version-set conflict, then derive—not accept—the scorecard
version tuple.

#### MAJOR-002 — Coverage and reproducibility rates are not arithmetically reconciled

Assembly validates count non-negativity and rate range, but it does not require
coverage/reproducibility rates to equal their counts, and it does not reconcile
expected identities against eligible, missing, incomplete, ambiguous,
non-reproducible, parity-mismatch, and conflicting counts.

Impact: a scorecard can claim `coverage_rate=1` and
`reproducibility_rate=1` while carrying incompatible exclusion counts. The
comparability gate trusts those rates.

Evidence:

- `lib/canonical-quality-scorecard.ts:68-79`
- `lib/canonical-quality-scorecard.ts:388-411`
- `lib/canonical-quality-scorecard.ts:565-597`

Required future remediation: derive rates from one exclusive count partition
and fail closed on overlap or arithmetic mismatch.

#### MAJOR-003 — Documented comparability evidence is not bound to the scorecard pair

The documented-comparability override requires a non-empty ID, any syntactically
valid SHA-256, and a boolean. It does not bind the evidence digest to baseline
and candidate scorecard digests, periods, denominator digests, opportunity-set
digests, or evaluator/provider version pairs.

Impact: stale or unrelated evidence can mark different periods, denominators,
opportunity sets, evaluator contracts, or provider contracts comparable.

Evidence:

- `lib/canonical-quality-scorecard.ts:486-502`
- `lib/canonical-quality-scorecard.ts:504-557`
- the insufficient-sample fixture demonstrates that the override removes
  structural denominator/opportunity-set conflicts before sample checks.

Required future remediation: define a signed/content-addressed comparability
envelope containing both scorecard digests and every exact compared field.

#### MAJOR-004 — No-trade gate bypasses the main comparability contract

The no-trade opportunity-cost gate verifies scorecard digests and cohort names,
then subtracts two metric values. It does not require equal metrics policy,
period, denominator/opportunity set, evaluator/provider contract, coverage, or
reproducibility.

Impact: incomparable no-trade scorecards can pass or fail a model-change gate.

Evidence:

- `lib/canonical-quality-scorecard.ts:1071-1109`

Required future remediation: produce a dedicated no-trade comparison through
the same comparability gate and consume only that comparison's delta.

#### MAJOR-005 — A clean standard regression command is not self-contained

After a fresh `npm ci`, the normal Playwright invocation fails before D–H test
collection because `server-only` selects its throwing default export. The
matrix passes only when the undocumented Node `react-server` export condition
is supplied.

Impact: a reviewer or CI job following the repository's `test:e2e` command
cannot reproduce the A–H green matrix from a clean dependency state.

Evidence:

- `package.json:15`
- `playwright.config.ts:1-43`
- fresh unconditioned run: failed before collection
- conditioned clean run: 142/142 passed

Required future remediation: add a reviewed, canonical server-only test command
or loader/alias and prove it from a clean install.

### Minor

#### MINOR-001 — Proportion delta interval is mislabeled as a Wilson score interval

Win-rate and precision deltas use a conservative subtraction of two Wilson
interval bounds, but the returned method identifier remains
`wilson_score_interval_v1`. Reason codes describe the subtraction, but the
machine-readable method can be misread as a Wilson interval directly computed
for the delta.

Evidence:

- `lib/canonical-quality-scorecard.ts:712-727`
- `lib/canonical-quality-scorecard.ts:880-890`
- `lib/canonical-quality-scorecard.ts:919-934`

#### MINOR-002 — SQL validates digest shape but cannot recompute canonical digest

The migration enforces a lowercase 64-hex digest and envelope/normalized-column
parity, but it does not recompute the TypeScript canonical JSON digest inside
PostgreSQL. A direct service-role insert can therefore persist a false digest
if all other constraints pass.

The writer computes the digest and the read model recomputes it before
eligibility, so this is defense-in-depth rather than a current quality-metrics
bypass.

Evidence:

- `supabase/migrations/20260726001000_create_canonical_evaluation_decisions.sql:89-90`
- `lib/server/canonical-evaluation-storage-writer.ts:255-311`
- `lib/server/canonical-evaluation-quality-read-model.ts:545-551`

### Nit

None.

## Threat/failure review

| Threat | Result |
| --- | --- |
| Identity collision | contained by canonical identity uniqueness and semantic conflict |
| Envelope tampering | contained before eligibility by digest and normalized parity |
| Normalized/envelope mismatch | contained by SQL constraints and read-model parity |
| Feature-flag bypass | no bypass found; explicit `true` still represents future activation authority |
| Kill-switch bypass | no bypass found; anything except exact `false` is engaged |
| Duplicate horizons | contained fail-closed |
| Sample/cohort mixing | contained through 664G; H metadata provenance remains MAJOR-001 |
| Denominator inflation | canonical identities deduplicated; H comparability override remains MAJOR-003 |
| Stale/provider gaps | excluded from quality eligibility |
| Publishing with insufficient evidence | 664G contained; false H coverage claims remain MAJOR-002 |
| Semantic overwrite | contained by append-only table, unique identity, and no-overwrite writer |
| Synthetic data mistaken for production | all golden artifacts carry synthetic and `production_baseline=false` markers |

## Live isolation

No Action 664A–H implementation is imported by existing `app`, `components`,
routes, generators, scanners, or UI. The only Action 664 script is the local
Docker PostgreSQL harness.

No production or staging connection, provider request, scanner, collector,
replay, learning job, migration application outside disposable Docker,
activation, dual-write, backfill, commit, push, PR, or deploy occurred.

## Remaining dependencies

1. Resolve and re-review all five major findings.
2. Replace rollback kill-switch owner `UNASSIGNED`.
3. Define an owned evaluator/provider compatibility registry.
4. Produce a comparable no-trade counterfactual scorecard pair.
5. Keep canonical capture and writer default-off.
6. Coordinate migration ordering only at a later reviewed commit checkpoint;
   Track 1's `20260726000000` remains a distinct preceding reservation.

## Recommended next Action

**Action 664J — Foundation Review Finding Remediation and Re-freeze**

Scope should be limited to the five major findings and two minor findings
above, with one test per finding, a new clean-install runner proof, fresh
PostgreSQL matrices, and a new A–H digest. It must remain default-off and must
not activate capture or compute a production baseline.

No commit Action should begin until a subsequent independent re-review has
zero blocker and zero major findings. After that approval, a separate
**Action 664K — Controlled Commit Package and Cross-Track Migration Ordering
Review** can prepare, but not deploy, the commit.
