# Action 604 - Pure Read-Only Git Compatibility Policy Final Re-Review

## Scope

Action 604 independently re-reviewed the complete uncommitted Action 601-603 pure read-only Git compatibility policy package. The review inspected the actual source, focused tests, Action 602 findings, Action 603 remediation, export surface, runtime reachability, prohibited-operation posture, documentation, and validation results.

No compatibility-policy behavior, parser behavior, orchestration behavior, repository-observation behavior, aggregate behavior, direct-spawn behavior, revalidation behavior, neutralization behavior, resolver behavior, composition behavior, raw-completion behavior, tests, migrations, runtime wiring, API/UI wiring, runner wiring, credentials, environment access, network access, Avanza/trading behavior, persistence, deployment behavior, commit, push, merge, or deploy was added.

Final approval does not authorize Git execution, process creation or observation, repository inspection, repository-read/process/CLI authority, runner implementation, runtime/API/UI activation, credentials, environment, network, Avanza/trading behavior, persistence, migrations, or deployment.

## Action 602 Finding Verdicts

| Finding | Original severity | Original issue | Action 603 remediation inspected | Final verdict |
| --- | --- | --- | --- | --- |
| `A602-MED-001` | Medium | Result model omitted explicit false `mutationAuthorityGranted`, `observerAuthorityGranted`, `credentialAuthorityGranted`, and `networkAuthorityGranted`. | `PureReadOnlyGitCompatibilityResult` and `buildResult` now emit all four fields plus the complete authority/security posture on every status. They are part of the `core` payload used to compute `resultFingerprint`. Focused tests assert all result categories carry the fields and reject caller/result/evidence authority forgeries. | Remediated |
| `A602-MED-002` | Medium | Nested parser arrays validated indexed values but did not reject extra own string-key properties. | The private `hasExactArrayShape` / `isExactArray` helpers now require `Array.prototype`, exact own property names, exact length, own data properties for every index, no symbols, no holes, no accessors, no inherited enumerable properties, no exotic/subclass prototypes, and exact values. The checks are applied to generic and Apple result accepted-reason arrays, evidence reason arrays, and evidence `argv` arrays. | Remediated |
| `A602-LOW-001` | Low | `implementation_unsupported` and `implementation_family_rejected` were unreachable current-v1 status/reason members. | The unreachable status/reason members were removed from current source, tests, result union, reason vocabulary, reason precedence, and current Action 601/603 docs. Historical Action 600/602 docs still mention them only as prior planning/review context. No input widening was introduced. | Resolved |

## New Findings

| Severity | Count | Notes |
| --- | ---: | --- |
| Critical | 0 | None |
| High | 0 | None |
| Medium | 0 | None |
| Low | 0 | None |
| Informational | 0 | None |

## Complete Authority Result Shape

Every current result status explicitly carries:

- `laterActivationEligibility:false`;
- `repositoryReadAuthorityGranted:false`;
- `mutationAuthorityGranted:false`;
- `processAuthorityGranted:false`;
- `observerAuthorityGranted:false`;
- `cliExecutionAuthorityGranted:false`;
- `compatibilityAuthorityGranted:false`;
- `runtimeAuthorityGranted:false`;
- `stagingAuthorityGranted:false`;
- `deploymentAuthorityGranted:false`;
- `credentialAuthorityGranted:false`;
- `networkAuthorityGranted:false`;
- `credentialsUsed:false`;
- `networkUsed:false`;
- `authorizationConsumed:false`;
- `runtimeActivated:false`;
- `toctouEliminated:false`;
- `authority:"none"`.

The inspected statuses are:

- `input_rejected`;
- `version_below_baseline`;
- `version_above_reviewed_range`;
- `compatible_for_read_only_observation`.

The fields are required by the result type, emitted by the single `buildResult` path, included in the canonical `core` result fingerprint input, asserted in tests, and documented in the Action 601/603 material. No optional authority field or missing-property default remains in the result model.

## Authority Forgery Resistance

The focused tests exercise caller-submitted compatibility-result authority mutations and recomputed parser-evidence authority/security mutations. Recomputed generic and Apple forgeries remain rejected even with fresh parser-style fingerprints. Fingerprint correctness remains necessary but insufficient because semantic authority fields are checked after fingerprint verification.

The reviewed rejection set includes true or non-none mutations for repository-read, mutation, process, observer, CLI execution, compatibility, runtime, staging, deployment, credential, network, credentials-used, network-used, authorization-consumed, runtime-activated, TOCTOU, and authority fields across the current accepted input families.

## Exact Array Schema

The compatibility module has a private exact-array validator. It verifies actual arrays, exact `Array.prototype`, exact length, every required index as an own data property, no holes, no symbols, no accessors, no inherited enumerable properties, no subclassed/exotic arrays, no extra own string keys, no noncanonical numeric-looking keys such as `01`, `-1`, `1.0`, or `4294967295`, no shadowed `constructor`, `map`, or `filter` properties, no attached functions, and exact element values.

The helper is applied to every nested array accepted by the compatibility contract:

- generic parser result `blockingReasons`;
- Apple parser result `blockingReasons`;
- generic parser evidence `reasons`;
- Apple parser evidence `reasons`;
- generic parser evidence `argv`;
- Apple parser evidence `argv`.

The immutable source-controlled policy capability-set arrays are emitted by the compatibility policy itself and are not accepted from caller parser evidence.

## Array Attack and Valid-Array Regression

The focused suite includes the required array-attack matrix against generic evidence `argv`, Apple evidence `argv`, and accepted-reason arrays. The attacks cover enumerable and non-enumerable string keys, symbols, accessors, sparse holes, inherited enumerable properties, exotic prototypes, subclassed arrays, shadowed constructor/map/filter properties, noncanonical numeric keys, altered length, appended elements, deleted elements, and attached functions.

Canonical generic and Apple parser outputs still pass. Ordinary canonical arrays with `Array.prototype` remain accepted; valid source evidence is not rejected by the stricter closure.

## Enum Cleanup and Result Union

The current source and focused tests contain no current-v1 `implementation_unsupported` status or `implementation_family_rejected` reason. The final closed result union is exact:

- `input_rejected`;
- `version_below_baseline`;
- `version_above_reviewed_range`;
- `compatible_for_read_only_observation`.

Unknown or unsupported vendor inputs are not accepted to preserve old enum members. Future vendor-family expansion requires a new reviewed policy or contract version.

## Fingerprint Review

The result fingerprint binds contract and policy identities, capability-set identity, implementation family, parser identity and fingerprints, completion and spawn linkage, executable, platform, session, source policy, semantic version, Apple build evidence, baseline, range/minimum booleans, status, reason, capability scope, runtime posture, TOCTOU posture, and every explicit authority/security field.

Changing a new authority field changes the canonical result-fingerprint input. Missing fields cannot be emitted by the builder, caller-submitted compatibility-result objects are rejected by top-level exact schema closure, array properties are rejected before fingerprint acceptance, stale copied fingerprints reject, and recomputed semantic/security forgeries remain rejected.

## Contract Version

Retaining v1 is justified. The Action 601-603 package remains uncommitted, has no runtime consumer, has no external compatibility obligation, and Action 603 completed the originally intended v1 authority and schema closure before first checkpoint. Documentation and tests describe the final v1 contract.

## Policy Regression

No regression was found in:

- baseline `2.39.0`;
- supported major family `2`;
- generic upstream policy;
- Apple policy;
- Apple build evidence-only posture;
- stable-release requirement;
- future-major rejection;
- unknown-vendor rejection;
- semantic-version comparison;
- accepted parser evidence families;
- capability scope;
- authority posture.

Representative results remain: generic `2.39.0` accepted, generic `2.38.x` below baseline, generic `3.0.0` above reviewed range, Apple `2.39.5 (Apple Git-154)` accepted, and changed Apple build changes fingerprints without changing the semantic outcome.

## Test Quality

The focused compatibility suite contains 133 tests. The Action 603 additions materially cover complete result authority fields, authority forgeries, every array-attack category, generic and Apple arrays, accepted-reason arrays, exact deterministic rejection reasons, deep freeze, deterministic fingerprints, valid-array regression, enum removal, policy regression, and runtime reachability. The tests exercise production builder/validator paths and do not add production test hooks, dependency injection, caller policy configuration, runtime adapters, or trust mint/reset helpers.

## Pure Boundary and Export Surface

The compatibility core remains pure and does not import `server-only`, filesystem, `child_process`, process environment, network, credential, timer, observer, runner, Supabase, Avanza, trading, persistence, migration, or deployment primitives. `node:crypto` is used only for deterministic SHA-256 fingerprints.

The export surface remains limited to immutable identity/policy/fingerprint constants, closed types, and the pure compatibility builder. The exact-array helper is private. Static reachability found imports only from the focused test suite; no app, API, UI, component, runner, cron, worker, resolver, revalidation adapter, direct-spawn adapter, neutralizer, composition module, credential boundary, or observer boundary imports the compatibility core.

## Migration Baseline Limitation

The file `supabase/migrations/20260710000000_create_execution_authorization_consumptions.sql` remains absent. Action 601-603 did not modify migrations, authorization tests, persistence, migration imports, or test discovery. The limitation predates this package and is unrelated to the compatibility policy remediation. No migration was created or modified in Action 604.

## Validation

- `./node_modules/.bin/tsc --noEmit`: passed.
- First focused Playwright attempt: failed after execution with known sandbox `EPERM` on `test-results/.last-run.json`.
- `npx playwright test tests/e2e/post-trade-pure-read-only-git-compatibility-policy-contract.spec.ts --reporter=dot`: passed on minimal filesystem-escalated rerun, 133 tests.
- `npx playwright test tests/e2e/post-trade-pure-git-version-interpretation-contract.spec.ts tests/e2e/post-trade-pure-apple-git-version-interpretation-contract.spec.ts tests/e2e/post-trade-dormant-server-only-neutralization-to-git-interpretation-orchestrator.spec.ts --reporter=dot`: passed, 146 tests.
- `npx playwright test tests/e2e/post-trade-pure-aggregate-read-only-git-repository-observation-contract.spec.ts tests/e2e/post-trade-pure-read-only-git-porcelain-status-interpretation-contract.spec.ts tests/e2e/post-trade-pure-byte-oriented-porcelain-status-completion-contract.spec.ts tests/e2e/post-trade-pure-read-only-git-simple-observation-contracts.spec.ts --reporter=dot`: passed, 172 tests.
- `npx playwright test tests/e2e/post-trade-dormant-server-only-spawn-to-raw-completion-neutralization-adapter.spec.ts tests/e2e/post-trade-pure-raw-process-completion-evidence-contract.spec.ts tests/e2e/post-trade-dormant-server-only-fixed-read-only-direct-spawn-adapter.spec.ts tests/e2e/post-trade-dormant-server-only-immediate-pre-spawn-revalidation-adapter.spec.ts tests/e2e/post-trade-dormant-server-only-first-live-staging-preflight-composition-adapter.spec.ts tests/e2e/post-trade-first-live-read-only-staging-preflight-composition-contract.spec.ts --reporter=dot`: passed, 143 tests.
- `npx playwright test tests/e2e/post-trade-trusted-live-resolver-adapter.spec.ts tests/e2e/post-trade-trusted-live-resolver-adapter-security-review.spec.ts tests/e2e/post-trade-execution-agent-cross-boundary-integration-readiness-review.spec.ts --reporter=dot`: passed, 672 tests.
- `npx playwright test tests/e2e/post-trade-scoped-macos-process-observer.spec.ts tests/e2e/post-trade-scoped-macos-process-observer-security-review.spec.ts tests/e2e/post-trade-credential-source-adapter-boundary.spec.ts tests/e2e/post-trade-credential-source-adapter-boundary-security-review.spec.ts tests/e2e/post-trade-first-live-read-only-preflight-credential-provider.spec.ts tests/e2e/post-trade-first-live-read-only-preflight-cli-version-collector.spec.ts tests/e2e/post-trade-first-live-read-only-preflight-process-executor.spec.ts tests/e2e/post-trade-first-live-read-only-preflight-authorization-artifact.spec.ts tests/e2e/post-trade-staging-execution-authorization-artifact.spec.ts tests/e2e/post-trade-durable-one-shot-authorization-consumption-contract.spec.ts tests/e2e/post-trade-durable-authorization-consumption-persistence-schema-design.spec.ts --reporter=dot`: passed, 887 tests.
- `./node_modules/.bin/eslint lib/post-trade-pure-read-only-git-compatibility-policy-contract-core.ts tests/e2e/post-trade-pure-read-only-git-compatibility-policy-contract.spec.ts`: passed.
- `git diff --check`: passed.
- Static complete-authority comparison: passed.
- Static authority-forgery review: passed.
- Static exact-array schema review: passed.
- Static nested-array coverage review: passed.
- Static array-attack review: passed.
- Static valid-array regression review: passed.
- Static enum-cleanup review: passed.
- Static result-union review: passed.
- Static fingerprint review: passed.
- Static contract-version review: passed.
- Static policy-regression review: passed.
- Static focused-test-quality review: passed.
- Static determinism/immutability review: passed.
- Static export-surface review: passed.
- Static runtime-reachability review: passed.
- Static prohibited-operation review: passed.
- Migration-suite baseline limitation check: unrelated missing migration baseline reconfirmed.
- `git diff -- .env.local --exit-code`: passed.
- `find docs -type f -size 0`: passed.

Playwright emitted existing `[DEP0205] module.register()` and `NO_COLOR` / `FORCE_COLOR` warnings; these were not failures.

## Decision

Decision: `post_trade_pure_read_only_git_compatibility_policy_contract_final_security_review_approved`

Result status: `post_trade_pure_read_only_git_compatibility_policy_action_604_final_re_review_completed`

Recommended next Action: Action 605 - Plan Repository-Read and Process Authority for Dormant Git Observation Runner.

No deploy is recommended for Action 604. A source-control checkpoint commit may be considered only after the complete Action 601-604 diff has been manually inspected.
