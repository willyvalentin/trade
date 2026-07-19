# Action 573 - Pure Git Compatibility Policy Architecture

## Boundary Position

The planned compatibility policy boundary sits after the approved dormant neutralization-to-Git-interpretation orchestrator and before any future staging-readiness, runner, or deployment logic.

```text
original production-valid direct-spawn result
  -> one-shot neutralization
  -> pure raw-completion evidence
  -> pure Git-version interpretation
  -> dormant orchestration result
  -> future pure Git compatibility policy
  -> non-authoritative compatibility evidence only
```

Transitions from compatibility evidence to staging readiness, runtime execution, runner activation, deployment, and production behavior do not exist.

## Exact Trust Boundary

The future pure evaluator must treat the parser evidence as untrusted until it verifies:

- exact parser contract identity and version;
- exact grammar and normalization identity;
- exact accepted status;
- exact parsed integer component fields;
- exact source raw-completion and spawn linkage;
- exact Git tool, `/usr/bin/git`, and `["--version"]`;
- exact purpose and platform;
- exact no-authority and no-runtime posture;
- exact result/evidence fingerprints.

No direct-spawn result, raw-completion evidence, stdout string, version string, caller version object, parser option, policy option, or runtime configuration is valid input.

## Policy Contract

Recommended future policy identity shape:

- contract kind: `pure_git_compatibility_policy_contract`;
- policy family: first-live read-only staging preflight Git compatibility;
- policy mode: pure source-controlled comparison;
- posture: supported major set plus per-major minimum;
- policy value: unresolved until Action 574 inventory derives it.

The policy should be a frozen source-controlled constant with:

- policy id;
- policy version;
- purpose;
- tool;
- platform;
- executable identity and path;
- argv identity and exact argv;
- parser contract id/version;
- grammar id/version;
- normalization id/version;
- supported major versions;
- per-major minimum components once approved;
- unresolved marker until approved;
- comparison method;
- authority and readiness false fields;
- policy fingerprint.

## Source Eligibility Options

| Option | Description | Result |
| --- | --- | --- |
| Parser evidence only | Accept accepted pure Git parser evidence. | Preferred. It preserves neutralization and parsing as prerequisites. |
| Orchestrator result | Accept the dormant orchestrator result and extract parser evidence. | Rejected for Action 573 planning because it couples compatibility to orchestration shape and may duplicate stage validation. |
| Raw completion | Accept raw-completion evidence directly. | Rejected because it bypasses parser grammar and normalization. |
| Stdout or version string | Accept caller-supplied output/version. | Rejected because caller input becomes trust-bearing. |
| Generic CLI evidence | Accept tool-agnostic parsed version evidence. | Rejected because the initial boundary is Git-only. |

## Comparison Model

Use only integer component lexicographic comparison over `major`, `minor`, and `patch`. The parser already rejects suffixes, prerelease/build metadata, Unicode digits, fourth components, malformed components, leading zero ambiguity, and overlarge values.

The compatibility boundary must not add semver, range expression, string comparison, locale comparison, Unicode normalization, broad trim, or repair behavior.

## Closed Result Union

The planned result union:

- `input_rejected`: evidence cannot be trusted or is not an accepted parser result;
- `policy_unresolved`: evidence is valid but no reviewed numeric compatibility baseline exists;
- `incompatible`: evidence is valid and reviewed policy values exist, but the version is outside policy;
- `compatible`: evidence is valid and reviewed policy values exist, and the version is inside policy.

`policy_unresolved` is the only correct result while the policy has no reviewed numeric baseline.

## Reason Precedence

The planned precedence keeps authority checks ahead of compatibility:

1. reject malformed or non-parser input;
2. reject parser identity, fingerprint, or consistency mismatch;
3. reject non-accepted parser status;
4. reject source linkage mismatch;
5. reject wrong tool, executable, argv, purpose, platform, grammar, or normalization;
6. reject authority, runtime, deployment, staging, execution, or TOCTOU claims;
7. validate policy identity and fingerprint;
8. return `policy_unresolved` if the numeric policy is not approved;
9. reject unsupported major;
10. reject below per-major minimum;
11. accept compatible evidence.

## Evidence And Fingerprints

The future evidence should embed the smallest complete audit model:

- parser evidence/result fingerprints rather than raw full stdout;
- parsed integer components;
- source raw and spawn fingerprints;
- policy id/version/fingerprint;
- comparison method;
- closed status and reason;
- authority and readiness false fields;
- final compatibility result fingerprint.

It should not embed raw stdout, stderr, process handles, direct-spawn objects, neutralizer source objects, credentials, environment values, Node error text, or deployment context.

## Authority Lattice

Only `none` is reachable in the planned boundary.

```text
none
  - planned compatibility evidence

future_live_process_start_authority
future_live_observation_authority
future_live_runner_authority
future_staging_readiness_authority
future_deployment_authority
```

No edge exists from compatibility evidence to any future authority.

## Architecture Options

| Option | Description | Assessment |
| --- | --- | --- |
| A | Pure policy module plus pure evaluator. | Preferred: smallest, testable, source-controlled, no runtime reachability. |
| B | Parser invokes compatibility. | Rejected: grammar parsing and compatibility policy would become coupled. |
| C | Orchestrator invokes compatibility. | Rejected: orchestration would expand beyond neutralization-to-interpretation. |
| D | Policy from environment or local config. | Rejected: mutable trust source and runtime configuration risk. |
| E | Semver/range library. | Rejected: unnecessary parser surface and range ambiguity. |
| F | Runtime runner compatibility. | Rejected: premature activation. |

## Test Strategy

Future focused tests should cover:

- accepted parser evidence with unresolved policy returns `policy_unresolved`;
- malformed parser-looking input rejects;
- rejected parser result rejects;
- parser fingerprint mismatch rejects;
- source raw/spawn linkage mismatch rejects;
- wrong tool/executable/argv/purpose/platform rejects;
- authority/runtime/staging/deployment/TOCTOU claims reject;
- supported-major and below-minimum comparisons once Action 574 derives values;
- future major rejects until reviewed;
- lexicographic integer comparison beats string comparison pitfalls;
- prerelease/suffix/fourth-component input cannot enter;
- policy mutation fails;
- result is deeply frozen;
- fingerprints change on policy, version, parser, source, status, or reason mutation;
- no runtime/API/UI/runner reachability;
- no prohibited operation imports.

## Non-Authoritative Semantics

Even after future implementation, a `compatible` result must mean only:

- exact accepted pure Git parser evidence was verified;
- exact source-controlled policy was applied;
- integer parsed components matched the policy.

It must not mean:

- Git is currently installed;
- the binary remains unchanged;
- `git` can be executed safely;
- process spawning is allowed;
- staging preflight is ready;
- deployment is allowed;
- TOCTOU was eliminated;
- Avanza/trading/order/position/settlement behavior is authorized.

## Recommended Next Action

Action 574 should inventory the exact Git capabilities required by the first-live read-only staging preflight and derive a reviewed compatibility baseline before implementation.
