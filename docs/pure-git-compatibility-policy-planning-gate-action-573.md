# Action 573 - Pure Git Compatibility Policy Planning Gate

## Purpose

Action 573 plans the smallest safe pure Git compatibility policy contract for the first-live read-only staging-preflight chain. It is a documentation, architecture, and approval-gate action only.

No compatibility evaluator was implemented. No parser, orchestrator, raw-completion, neutralization, direct-spawn, revalidation, resolver, runtime, API, UI, runner, credential, Avanza, trading, persistence, deployment, or production behavior was modified.

## Current Approved Chain

The approved source-controlled chain currently ends at strict Git-version interpretation:

```text
server-only live resolver
  -> dormant live composition
  -> immediate pre-spawn revalidation
  -> fixed dormant direct spawn
  -> original production-valid direct-spawn result
  -> dormant server-only one-shot neutralization
  -> approved pure raw-completion evidence
  -> approved pure Git-version interpretation contract
  -> approved dormant neutralization-to-Git-interpretation orchestration result
```

Current explicit limits:

- no pure Git compatibility policy exists;
- no minimum supported Git version is selected;
- no maximum or future-major posture is selected;
- no staging, deployment, runtime, or execution decision exists;
- no runtime caller exists;
- parser acceptance means grammar acceptance only;
- `observedLiveProcess:false` remains required in neutral structural evidence;
- `toctouEliminated:false` remains required;
- authority remains `none`.

## Compatibility Trust Problem

The future boundary must distinguish grammar-accepted Git version evidence from a compatibility decision. A parsed `major.minor.patch` value can be compared to a source-controlled policy, but that comparison must not become process, runtime, staging, deployment, or trading authority.

The future boundary must solve only:

1. accept exact approved pure Git-version interpretation evidence;
2. validate parser identity, grammar, normalization, source raw-completion linkage, tool, executable, argv, purpose, platform, fingerprints, and no-authority posture;
3. compare parsed integer components to one closed source-controlled Git compatibility policy;
4. return immutable deterministic compatibility evidence;
5. grant no authority.

It must not infer compatibility from raw stdout, caller-supplied version strings, semver ranges, environment configuration, deployment state, or runtime reachability.

## Eligible Input

The future pure policy evaluator should accept only the exact accepted parser evidence from `buildPureGitVersionInterpretation`.

Required eligibility:

- `contractId: ture.execution.pure-git-version-interpretation-contract.fixture.v1`;
- `boundaryId: ture.execution.git-version-interpretation.fixture-boundary.v1`;
- grammar `ture.execution.git-version-grammar.strict-three-component-ascii.v1`;
- normalization `ture.execution.git-version-normalization.optional-single-final-lf.v1`;
- `status: accepted`;
- exact component count `3`;
- `suffixPresent:false`;
- `eligibleCompletion:true`;
- `stderrEmpty:true`;
- tool `git`;
- platform `macos`;
- executable `/usr/bin/git`;
- argv identity `git_version_argv_v1`;
- argv exactly `["--version"]`;
- purpose `first_live_read_only_staging_preflight`;
- valid parser result/evidence fingerprints;
- valid source raw-completion result/evidence fingerprints;
- valid source spawn fingerprint linkage;
- `authority:"none"`;
- `observedLiveProcess:false`;
- `runtimeActivated:false`;
- `toctouEliminated:false`;
- no compatibility, staging, deployment, runner, credential, network, Avanza, trading, order, position, or settlement authority.

Rejected parser results, parser-looking plain objects with inconsistent fingerprints, raw-completion evidence, direct-spawn results, stdout strings, parsed-version strings, caller-provided version objects, and parser options must be rejected.

## Policy Value Decision

Action 573 did not select a numeric minimum Git version.

Repository inspection found the current chain only requires `git --version` collection and strict parsing of `git version <major>.<minor>.<patch>`. It did not identify a reviewed inventory of future Git capabilities whose behavior depends on a specific Git version. Development validation commands and historical documentation mention other Git commands, but those are not part of the current Execution Agent runtime contract.

The selected planning outcome is:

`policy_value_unresolved_until_reviewed_git_capability_inventory`

This means Action 574 should first inventory the exact Git capabilities the first-live staging preflight will require before any numeric compatibility floor is encoded.

## Policy Shape Options

| Option | Shape | Benefit | Risk | Verdict |
| --- | --- | --- | --- | --- |
| A | Minimum version only | Simple integer comparison. | Accepts all future major versions even if output or behavior changes incompatibly. | Rejected as too broad. |
| B | Inclusive minimum and maximum | Bounded today. | Requires a maximum without evidence and can force unnecessary churn. | Not selected. |
| C | Exact allowlist | Maximum closure. | Too brittle for patch-level Git updates unless every patch is reviewed. | Not selected for routine local tooling. |
| D | Supported major set plus per-major minimum | Blocks unreviewed future majors while allowing reviewed patch movement inside a major. | Requires a capability inventory before choosing values. | Preferred shape. |
| E | Generic semver/range expression | Familiar syntax. | Broad parser surface, range ambiguity, prerelease/build semantics, and dependency risk. | Rejected. |

Recommended shape for future implementation: a frozen source-controlled policy with an exact supported-major set and per-major integer minimum components. The numeric values remain unresolved until Action 574 derives them from reviewed capability requirements.

## Policy Provenance

The future policy must be:

- source-controlled;
- frozen/deeply immutable;
- identity-versioned;
- closed to exactly Git compatibility for first-live read-only staging preflight;
- independent from parser grammar policy;
- fingerprinted with SHA-256 over canonical policy fields;
- free of environment, database, API, UI, local storage, remote configuration, package metadata, feature flags, and user input;
- unavailable for caller mutation, merge, override, fallback, or reordering.

No external configuration may add supported majors, adjust minimums, or convert unresolved policy into compatible.

## Result Model

The future result should be a closed union:

- `input_rejected`;
- `policy_unresolved`;
- `incompatible`;
- `compatible`.

Required fields:

- contract kind, id, version, and boundary id;
- status and closed reason;
- policy id, version, posture, and fingerprint;
- source parser result/evidence fingerprints;
- source raw result/evidence fingerprints;
- source spawn fingerprint;
- session, purpose, tool, platform, executable, argv, grammar, and normalization linkage;
- parsed `major`, `minor`, `patch`, and parsed-version fingerprint when accepted;
- selected policy baseline or `null` when unresolved;
- comparison method `integer_component_lexicographic`;
- `authority:"none"`;
- `runtimeActivated:false`;
- `compatibilityAuthorityGranted:false`;
- `deploymentAuthorityGranted:false`;
- `stagingReadinessGranted:false`;
- `executionAuthorityGranted:false`;
- `toctouEliminated:false`;
- deterministic result fingerprint.

No result may return partial compatibility fields after input rejection. `compatible` means only that parser evidence matched the reviewed policy comparison; it does not authorize execution or deployment.

## Reason Model

Closed reasons should include:

- `input_contract_rejected`;
- `input_identity_rejected`;
- `input_fingerprint_rejected`;
- `input_status_rejected`;
- `input_consistency_rejected`;
- `source_linkage_rejected`;
- `tool_rejected`;
- `executable_rejected`;
- `argv_rejected`;
- `authority_rejected`;
- `runtime_claim_rejected`;
- `toctou_claim_rejected`;
- `policy_identity_rejected`;
- `policy_fingerprint_rejected`;
- `policy_unresolved`;
- `version_below_minimum`;
- `unsupported_major`;
- `compatible`;
- `unexpected_internal_failure`.

`version_above_maximum` is not needed for the preferred supported-major/per-major-minimum shape unless a future reviewed policy adds an explicit maximum.

Precedence:

1. input shape and parser identity;
2. parser result/evidence fingerprint verification;
3. accepted parser status and field consistency;
4. source raw/spawn linkage;
5. tool, platform, executable, argv, purpose, grammar, and normalization;
6. authority, runtime, deployment, and TOCTOU false-claim posture;
7. policy identity and fingerprint;
8. unresolved policy;
9. supported major check;
10. integer component comparison;
11. result construction;
12. unexpected internal failure.

Reasons must never include raw Node errors, stacks, paths beyond source-controlled identities already present in evidence, stdout, stderr, process details, secrets, or environment values.

## Version Comparison

The future evaluator must compare parsed integer components only:

- compare major, then minor, then patch;
- reject non-integer, nonfinite, negative, string, bigint, fourth-component, suffix, prerelease, build metadata, Unicode digit, or repaired values through parser-evidence validation;
- use no semver dependency;
- use no string comparison;
- use no locale or Unicode normalization;
- use no caller-provided grammar or options.

## Fingerprints

The future compatibility result fingerprint must bind:

- compatibility contract identity and version;
- policy identity, version, posture, and fingerprint;
- parser result/evidence fingerprints;
- raw completion result/evidence fingerprints;
- source spawn fingerprint;
- session, purpose, tool, platform, executable, argv, grammar, and normalization;
- parsed integer components;
- policy baseline values or unresolved marker;
- status and reason;
- all authority, runtime, staging, deployment, execution, TOCTOU, and compatibility-authority false fields.

Fingerprints are linkage only. They grant no provenance, live claim, runtime activation, staging readiness, execution authority, or deployment authority.

## Authority Limits

The future boundary must grant no:

- process creation, observation, control, or termination authority;
- CLI execution authority;
- Git-version collection authority;
- compatibility authority outside the returned non-authoritative evidence;
- staging readiness;
- runtime/API/UI/runner authority;
- credential, environment, filesystem, network, Avanza, trading, order, position, settlement, persistence, authorization-consumption, deployment, or production authority.

Even a future `compatible` result means only that accepted pure parser evidence matched a reviewed source-controlled policy.

## Architecture Recommendation

Preferred architecture: a new pure compatibility policy module plus a pure evaluator.

Rejected alternatives:

- adding compatibility inside the Git parser, because grammar acceptance and compatibility policy must stay separate;
- adding compatibility inside the dormant orchestrator, because orchestration must remain neutralization-to-interpretation only;
- reading compatibility from environment, package metadata, local Git config, database, API, UI, or remote config;
- using a semver/range library;
- adding runtime, runner, deployment, or staging gate behavior.

## Future Implementation Constraints

The future implementation must:

- remain pure and deterministic;
- accept only approved parser evidence;
- define no runtime caller;
- read no files, environment values, credentials, network, process state, or external config;
- execute no command;
- use no current process PATH;
- expose no override, injection, test mode, or reset hook in production;
- return a closed frozen result union;
- preserve source and fingerprint linkage;
- preserve `authority:"none"`;
- preserve all runtime, staging, deployment, execution, and TOCTOU false fields;
- receive independent static review, remediation if needed, and final re-review before any activation planning.

## Review Gates

Required future gates:

1. focused compatibility-policy tests;
2. parser-evidence eligibility review;
3. policy identity/version review;
4. policy-value derivation review;
5. integer comparison review;
6. future-major posture review;
7. result-union review;
8. reason-precedence review;
9. fingerprint-linkage review;
10. authority/no-readiness review;
11. export-surface review;
12. runtime-reachability review;
13. prohibited-operation review;
14. independent static security review;
15. remediation and final re-review;
16. separate runtime activation planning;
17. separate deployment approval.

## Recommended Next Action

Recommended next Action:

`Action 574 - Inventory Required Git Capabilities and Derive Compatibility Policy Baseline`

This should occur before implementing a numeric compatibility policy so the policy floor is derived from reviewed requirements, not guessed from local tooling.

## Non-Authorizations

Action 573 does not authorize compatibility implementation, compatibility evaluation, staging readiness, runtime activation, Git execution, process creation, process observation, process control, process termination, credential access, environment access, network access, API/UI/runner wiring, Avanza/trading behavior, order behavior, position behavior, settlement retrieval, persistence, deployment, commit, push, merge, or production readiness.

## Decision

Decision: `post_trade_pure_git_compatibility_policy_boundary_plan_ready`

Result status: `post_trade_pure_git_compatibility_policy_action_573_planning_gate_completed`
