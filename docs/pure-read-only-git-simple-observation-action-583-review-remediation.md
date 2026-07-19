# Action 583 - Pure Read-Only Git Simple Observation Review Remediation

## Scope

Action 583 remediates only the Action 582 findings for the pure read-only Git simple observation contracts:

- `A582-MED-001`;
- `A582-MED-002`;
- `A582-MED-003`;
- `A582-MED-004`.

No capability architecture redesign, argv widening, porcelain status, Git runner, server-only wrapper, runtime/API/UI/runner wiring, credentials, environment access, network access, Avanza/trading behavior, persistence, deployment, commit, push, merge, or deploy is authorized by this action.

## Exact Action 582 Findings

Action 582 found:

- `A582-MED-001`: accepted completion-result validation trusted recomputable fingerprints without revalidating every evidence lifecycle, security, authority, and output field;
- `A582-MED-002`: HEAD object-ID interpretation did not fully validate supplied object-format interpretation result/evidence before using it;
- `A582-MED-003`: repository-root grammar rejected C0 controls and DEL but not C1 controls U+0080 through U+009F;
- `A582-MED-004`: focused tests were insufficient for forged fingerprints, schema closure, byte limits, C1 controls, object-format linkage/security, and contradictory security states.

## Finding-To-Remediation Matrix

| Finding | Severity | Affected Symbol | Original Failure Scenario | Production Code Changes | Test Additions | Validation Proving Closure | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `A582-MED-001` | Medium | `validateGitObservationCompletionResult` | Recomputed accepted completion evidence with contradictory fields such as `observedLiveProcess:true` could be accepted downstream. | Added full accepted-evidence semantic revalidation, including schema, accepted reason/status, identity, contract/policy fingerprints, lifecycle, capability/argv, security posture, byte/source-output consistency, detached branch stdout state, and result/evidence fingerprints. | Added recomputed-forgery tests for live, authority, runtime, status, identity, source-output, stdout-limit, stderr, and eligible-completion changes. | Focused suite 53 passed; parser/orchestrator group 263 passed; `tsc` passed. | Remediated. |
| `A582-MED-002` | Medium | `validateObjectFormatEvidence` inside HEAD interpretation | HEAD trusted object-format status/objectFormat/fingerprints without requiring the complete object-format result and evidence schema/security posture. | Added exact top-level and nested key checks, identity/version/boundary/grammar/normalization checks, accepted reason consistency, source/linkage field validation, object-format byte/fingerprint consistency, derived object-ID lengths, security posture, and recomputed fingerprints. | Added HEAD/object-format forged-result tests for unknown fields, authority/runtime/live changes, wrong IDs, wrong reasons, wrong derived lengths, byte/fingerprint tampering, malformed source linkage, wrong argv, and invalid timestamps. | Focused suite 53 passed; direct-spawn/revalidation/composition/resolver/Action 533 group 1124 passed. | Remediated. |
| `A582-MED-003` | Medium | Repository-root grammar | C1 controls such as U+0085 could be accepted in `repositoryRootPath`. | Extended control-character rejection to include U+0080 through U+009F under existing `control_character_rejected` reason. | Added U+0080, U+0085, U+009F rejection tests and an accepted ordinary non-ASCII path test. | Focused suite 53 passed. | Remediated. |
| `A582-MED-004` | Medium | Focused suite coverage | The 44-test suite did not catch the three implementation gaps or enough byte/schema/linkage edges. | No production-only behavior change beyond findings above. | Expanded focused suite from 44 to 53 tests covering forged fingerprints, schema attacks, byte boundaries, C1 controls, object-format linkage/security, and detached branch completion semantics. | Focused suite 53 passed. | Remediated. |

## Completion-Validator Changes

Accepted completion-result validation now requires:

- exact result/evidence schemas;
- exact accepted result status and blocking reason;
- original input field projection to pass the same lifecycle, identity, capability, source-linkage, byte-count, security, authority, runtime, credential, network, and TOCTOU validation as freshly built completion input;
- exact contract identity and policy fingerprints;
- exact command-specific stdout limit;
- exact source-output fingerprint;
- `stderrEmpty:true`;
- exact evidence and result fingerprints after semantic checks.

Detached `symbolic-ref` exit-code-one completion now requires empty stdout at the completion boundary.

## Object-Format Evidence Validator Changes

HEAD object-ID interpretation now validates object-format interpretation evidence before using it. Validation checks exact result/evidence keys, object-format contract identity, result version, boundary, grammar, normalization, accepted reason/status, source completion and spawn fingerprints, session/linkage fields, exact argv, timestamp, stdout fingerprints and byte counts, object-format-derived object-ID lengths, `transitionFormat:false`, `stderrEmpty:true`, `eligibleCompletion:true`, authority `none`, false runtime/live/repository-read posture, and both object-format evidence and result fingerprints.

## C1 Control Rejection

Repository-root interpretation now rejects C1 controls U+0080 through U+009F with `control_character_rejected`. Ordinary non-ASCII UTF-8 outside C1 remains accepted when the rest of the root grammar passes.

## Focused Test Additions

The focused suite increased from 44 tests to 53 tests. New coverage includes:

- recomputed forged completion fingerprints;
- recomputed forged object-format fingerprints;
- exact schema closure attacks using unknown fields, symbols, accessors, and exotic prototypes;
- byte-limit exact maximum and one-byte-over cases;
- negative, non-integer, non-finite, and mismatched byte counts;
- C1 controls and ordinary non-ASCII root paths;
- object-format identity, reason, linkage, byte, parsed-value, and security posture forgeries;
- detached branch stdout rejection at the completion boundary.

## Forged-Fingerprint Coverage

Regression tests recompute evidence and result fingerprints after attacker-selected field changes. The validators now reject those recomputed objects on semantic grounds before accepting the fingerprints as sufficient.

## Schema-Attack Coverage

Regression tests cover unknown top-level and nested fields, symbols, accessors/getters, and exotic prototypes. Object-format evidence supplied to HEAD must be an exact plain object result/evidence pair.

## Byte-Limit Coverage

The focused suite covers exact maximum and one-byte-over completion input for repository root, object format, HEAD, and branch capabilities, plus negative, non-integer, non-finite, and mismatched byte counts.

## Validation Precedence

Completion evidence validation follows:

1. schema/plain-object closure;
2. contract identity/version/boundary;
3. capability/purpose/argv;
4. source identity/linkage;
5. lifecycle consistency;
6. security/authority posture;
7. output byte/text consistency;
8. fingerprint recomputation;
9. accepted completion construction.

Object-format evidence validation in HEAD follows:

1. schema/plain-object closure;
2. contract identity/version/boundary;
3. grammar/normalization identity;
4. accepted status/reason consistency;
5. security/authority posture;
6. source linkage;
7. output and parsed-value consistency;
8. fingerprint recomputation;
9. HEAD/object-format cross-linkage;
10. HEAD output parsing.

Repository-root output validation follows:

1. input completion validation;
2. stderr;
3. byte count;
4. NUL/C0/DEL/C1/ANSI/CR/multiline;
5. optional final-LF normalization;
6. path grammar;
7. accepted construction.

## Production API Confirmation

No production API was added or widened. The pure modules remain callable contracts only; no app route, UI component, runner, observer, direct-spawn adapter, credential boundary, compatibility policy, or runtime module imports the Action 581/583 simple-observation modules.

## Authority And Runtime Posture

Accepted results remain grammar/evidence only. They grant no repository-read, process, observer, CLI-execution, compatibility, runtime, staging, deployment, credential, network, mutation, authorization-consumption, Avanza, trading, persistence, or deployment authority.

## Remaining Limitations

- This is not final approval; Action 584 must independently re-review the remediation.
- No Git compatibility policy was implemented.
- No porcelain-status parser was implemented.
- No Git repository-inspection command was run through production behavior.
- The known migration-suite baseline limitation remains: `supabase/migrations/20260710000000_create_execution_authorization_consumptions.sql` is absent in this worktree.

## Validation

- `./node_modules/.bin/tsc --noEmit`: passed.
- `npx playwright test tests/e2e/post-trade-pure-read-only-git-simple-observation-contracts.spec.ts --reporter=dot`: first sandbox attempt hit known Playwright `EPERM` on `test-results/.last-run.json`; escalated rerun passed, 53 tests.
- Parser/orchestrator/neutralization/raw-completion group: 263 passed.
- Direct-spawn/revalidation/composition/resolver/security/Action 533 group: 1124 passed.
- Broad dormant/process/credential/CLI/authorization group: 871 passed.
- `./node_modules/.bin/eslint` on changed TypeScript/test files: passed.
- Static production pure-import/prohibited-operation scan: passed.
- Static runtime-reachability scan: passed.

## Non-Authorizations

This remediation does not authorize:

- Git execution;
- process creation, observation, control, or termination;
- repository filesystem inspection;
- porcelain status;
- compatibility decisions;
- runtime/API/UI/runner activation;
- credentials, environment values, network access, Avanza, trading, persistence, deployment, commit, push, merge, or deploy.

## Re-Review Recommendation

Recommended next Action:

Action 584 - Independent Final Re-Review of Pure Read-Only Git Simple Observation Contract Remediation.

## Commit / Deploy Recommendation

No deploy is recommended for Action 583. No commit, push, merge, or deploy occurred.
