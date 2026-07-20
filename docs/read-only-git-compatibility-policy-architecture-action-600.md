# Action 600 Architecture - Read-Only Git Compatibility Policy

This architecture note records the selected source-controlled compatibility-policy shape for the exact read-only Git repository-observation capability set. It is not an implementation.

## Architecture Decision

Selected option: separate generic upstream and Apple Git implementation-family handling with one shared semantic capability floor.

The future policy evaluator should be pure, deterministic, fixture-only until separately reviewed, and source-controlled. It should accept only accepted parser evidence and return a closed non-authoritative compatibility result.

## Current State

```text
raw completion evidence
  -> generic Git version parser
  -> accepted generic version evidence

raw completion evidence
  -> Apple Git version parser
  -> accepted Apple version evidence

Action 600 policy baseline
  -> future pure evaluator
  -> non-authoritative compatibility result
```

No evaluator exists today. No runner consumes the decision. No runtime path exists.

## Capability Set

Capability-set identity:

`ture.execution.read-only-git-repository-observation-capability-set.root-object-format-head-branch-status.v1`

Exact commands:

1. `["rev-parse", "--show-toplevel"]`
2. `["rev-parse", "--show-object-format"]`
3. `["rev-parse", "--verify", "HEAD"]`
4. `["symbolic-ref", "--quiet", "--short", "HEAD"]`
5. `["status", "--porcelain=v1", "-z", "--untracked-files=all", "--no-renames", "--ignore-submodules=none"]`

The runner plan executes `["rev-parse", "--verify", "HEAD"]` twice for HEAD stability, but the compatibility capability is the HEAD verification tuple itself.

## Policy Object Model

The future immutable policy object should include:

```text
policyId: ture.execution.read-only-git-compatibility-policy.v1
policyVersion: 1
capabilitySetId: ture.execution.read-only-git-repository-observation-capability-set.root-object-format-head-branch-status.v1
genericMinimumVersion: 2.39.0
genericSupportedMajors: [2]
appleMinimumUpstreamEquivalentVersion: 2.39.0
appleBuildPosture: fingerprint_bound_evidence_not_comparator
supportedFamilies: [upstream_git, apple_git]
unknownVendorPosture: rejected
prereleasePosture: rejected
futureMajorPosture: version_above_reviewed_range
authority: none
runtimeActivated: false
repositoryReadAuthorityGranted: false
laterActivationEligibility: false
toctouEliminated: false
```

No caller override, environment value, database row, feature flag, deployment setting, or runtime option may alter these values.

## Input Boundary

The future evaluator may accept only:

- accepted generic Git version interpretation result; or
- accepted Apple Git version interpretation result.

It must not accept raw stdout, stderr, raw completion evidence, direct-spawn result, semantic-version strings, vendor strings, Apple build strings, executable paths, platform values, session IDs, policy IDs, or baselines as individual caller arguments.

## Implementation-Family Detection

The evaluator should derive implementation family only from the parser contract identity:

| Parser contract | Family |
| --- | --- |
| `ture.execution.pure-git-version-interpretation-contract.fixture.v1` | `upstream_git` |
| `ture.execution.pure-apple-git-version-interpretation-contract.fixture.v1` | `apple_git` |
| any other parser or vendor suffix | reject |

Unknown vendor builds should return `implementation_unsupported`, not generic compatibility.

## Baseline Comparison

Generic upstream:

- require major `2`;
- require version >= `2.39.0`;
- reject major > `2` as `version_above_reviewed_range`;
- reject major < `2` or below floor as `version_below_baseline`.

Apple Git:

- require accepted Apple parser evidence;
- compare only upstream-equivalent major/minor/patch to the same floor;
- require major `2`;
- retain Apple build number in fingerprints and result evidence;
- do not use Apple build number as a minimum or allowlist comparator.

## Result Union

Future closed statuses:

```text
input_rejected
implementation_unsupported
version_below_baseline
version_above_reviewed_range
capability_baseline_unresolved
compatible_for_read_only_observation
```

`capability_baseline_unresolved` remains available for future policy revisions but should not occur under the Action 600 v1 baseline unless policy construction is internally inconsistent.

## Result Evidence Fields

The future result should include:

- result kind/version;
- policy identity/version;
- capability-set identity/version;
- implementation family;
- parser contract identity/version;
- source raw completion evidence fingerprint;
- source spawn fingerprint;
- executable identity;
- platform;
- session;
- parsed version;
- Apple build evidence fields when family is `apple_git`;
- selected baseline;
- status and deterministic reason;
- all authority/runtime/repository-read/deployment flags false;
- result fingerprint.

It should not embed raw stdout, raw stderr, raw process handles, direct-spawn source objects, raw paths, credentials, environment values, or parser-internal mutable references.

## Reason Precedence

Recommended precedence:

1. malformed input;
2. rejected parser result;
3. parser identity unsupported;
4. source linkage rejected;
5. authority/runtime claim rejected;
6. implementation family unsupported;
7. capability policy unresolved or mismatched;
8. prerelease/development/malformed version rejected;
9. version below baseline;
10. version above reviewed range;
11. compatible for read-only observation.

Unknown reasons remain blocking.

## Fingerprint Model

The future fingerprint must bind:

- evaluator identity and version;
- policy identity and values;
- capability-set identity;
- implementation family;
- parser evidence fingerprints;
- raw-completion/source-spawn fingerprints;
- executable/platform/session/policy linkage;
- parsed version fields;
- Apple vendor/build fields when present;
- status/reason;
- all false authority/runtime/TOCTOU flags.

Fingerprints grant no authority.

## Authority Model

The evaluator returns observation-policy evidence only. It must keep:

- `authority:"none"`;
- `compatibilityAuthorityGranted:false`;
- `runtimeActivated:false`;
- `repositoryReadAuthorityGranted:false`;
- `laterActivationEligibility:false`;
- `toctouEliminated:false`.

The positive result is necessary for later runner work but insufficient to activate the runner.

## Future Runner Dependency

The dormant runner may be planned or implemented only after:

1. Action 601 implements the pure compatibility policy contract;
2. static/security review approves it;
3. remediation and final re-review complete;
4. repository-read authorization and process authority are separately planned and reviewed.

Compatibility does not replace any of those gates.

## Test Plan for Action 601

Action 601 should include tests for:

- generic exact minimum `2.39.0`;
- generic `2.38.x` rejection;
- same-major versions above floor;
- major `3` rejection;
- Apple `2.39.5 (Apple Git-154)` acceptance;
- Apple below-floor rejection;
- Apple build mutation affects fingerprint but not comparator;
- unknown vendor suffix rejection;
- rejected parser result rejection;
- stale fingerprints and tampered parser evidence;
- wrong executable/platform/session/policy linkage;
- authority/runtime/live claim rejection;
- immutable policy and result;
- no export-surface or runtime reachability.

## Non-Authorizations

This architecture does not authorize runner implementation, Git execution, live repository inspection, process creation, process observation, repository-read authority, runtime activation, credentials, network, Avanza, trading, persistence, deployment, commit, push, merge, or broad Git support.

## Commit and Deploy

No deploy is recommended for Action 600. A source-control checkpoint commit may be considered only after the Action 600 planning diff and validation are manually inspected.
