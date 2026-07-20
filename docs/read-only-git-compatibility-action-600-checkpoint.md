# Action 600 Checkpoint - Read-Only Git Compatibility Baseline Decision

## Action

Action 600 - Complete Read-Only Git Compatibility Baseline Decision.

## Environment

- workspace: `/Users/willysimonsson/Dev/trade-action-534`;
- branch: `codex/action-534-live-resolver`;
- baseline HEAD at start: `9ebcace Add dormant Git repository observation runner planning`;
- initial worktree: clean.

## Files Created

- `docs/read-only-git-compatibility-baseline-decision-action-600.md`;
- `docs/read-only-git-compatibility-policy-architecture-action-600.md`;
- `docs/read-only-git-compatibility-action-600-checkpoint.md`.

## Files Modified

- `docs/ture-agent-dev-chat-3-continuation-summary.md`.

## Approved Baseline

Generic Git parser, Apple Git parser, exact read-only Git capability tuples, pure simple observation contracts, byte-oriented porcelain-status completion, porcelain-status interpretation, pure aggregate repository observation, and dormant repository-observation runner planning are complete and reviewed.

No compatibility evaluator, runtime compatibility consumer, repository-read authority, live repository-observation chain, API/UI caller, runner activation, or deployment path exists.

## Previous Unresolved Issue

Earlier actions could not decide a baseline because Apple `/usr/bin/git` emitted a vendor suffix and because the repository-observation capability set had not yet been exact or fully interpreted. Those blockers are resolved sufficiently for a source-controlled baseline decision.

## Selected Decision

Option B - approve separate generic upstream and Apple Git policies with a shared semantic capability floor.

## Baseline

- generic upstream Git minimum: `2.39.0`;
- generic supported major family: `2`;
- Apple Git minimum upstream-equivalent version: `2.39.0`;
- Apple build posture: fingerprint-bound evidence only, not primary comparator;
- prerelease/development/custom vendor versions: rejected;
- future major versions: `version_above_reviewed_range`;
- unknown vendor suffixes: rejected.

## Capability Matrix Result

The complete exact capability set is covered by reviewed official documentation at or before Git `2.39.0`. `--no-renames` is the strictest reviewed flag because Action 600 has exact official-version documentation for it at Git `2.39.0`. Earlier existence is not needed for the selected conservative baseline.

## Result Model

Future closed statuses:

- `input_rejected`;
- `implementation_unsupported`;
- `version_below_baseline`;
- `version_above_reviewed_range`;
- `capability_baseline_unresolved`;
- `compatible_for_read_only_observation`.

Positive compatibility remains non-authoritative and exact-scope only.

## Authority Posture

All future compatibility results must retain authority `none`, `compatibilityAuthorityGranted:false`, `runtimeActivated:false`, `repositoryReadAuthorityGranted:false`, `laterActivationEligibility:false`, and `toctouEliminated:false`.

## Evidence Gaps

No blocking evidence gap remains for the initial baseline decision. Non-blocking limitations remain for historically earliest flag versions, Apple build monotonicity, future Git major versions, unknown vendors, evaluator implementation, and runner implementation.

## Next Action

Action 601 - Implement Pure Read-Only Git Compatibility Policy Contract.

## Validation

- `./node_modules/.bin/tsc --noEmit`: passed;
- generic Git parser, Apple Git parser, and Git-version orchestrator suite: passed, 146 tests;
- aggregate, porcelain-status, byte-completion, and simple-observation suite: passed, 172 tests;
- neutralization, raw-completion, direct-spawn, revalidation, dormant composition, and pure composition suite: passed, 143 tests;
- resolver/security and Action 533 suite: passed, 672 tests;
- broad dormant/process/credential/CLI/authorization suite: passed, 887 tests;
- scoped ESLint on changed TS/JS files: not applicable because no TypeScript or JavaScript files changed;
- static production-source diff review: passed, no TypeScript or JavaScript files changed;
- static capability-evidence review: passed, Action 600 matrix records exact reviewed capability evidence;
- static baseline-decision review: passed, selected Option B with `2.39.0` semantic floor;
- static policy-identity review: passed, future immutable policy IDs are documented;
- static export-surface review: passed, no app/lib/test/package references to Action 600 policy module;
- static runtime-reachability review: passed, no runtime/API/UI/runner caller added;
- static prohibited-operation review: passed, documentation-only prohibition references only and no changed production source;
- migration-suite baseline limitation check: `supabase/migrations/20260710000000_create_execution_authorization_consumptions.sql` remains absent; unrelated baseline limitation only;
- `git diff --check`: passed;
- quiet `.env.local` diff guard: passed;
- `find docs -type f -size 0`: passed.

Playwright emitted existing `[DEP0205] module.register()` and `NO_COLOR`/`FORCE_COLOR` warnings during suites; these were not failures.

## Decision

Decision: `post_trade_read_only_git_compatibility_baseline_decision_ready`

Result status: `post_trade_read_only_git_compatibility_action_600_decision_gate_completed`

Recommended next Action: Action 601 - Implement Pure Read-Only Git Compatibility Policy Contract.

No deploy is recommended for Action 600. Do not describe the system as repository-inspection-ready, Git-compatible, runtime-ready, staging-ready, execution-ready, observer-ready, credential-ready, Avanza-ready, deployment-ready, or production-ready.
