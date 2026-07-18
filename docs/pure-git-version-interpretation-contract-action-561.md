# Action 561 - Pure Git Version Interpretation Contract

## Scope

Action 561 implemented a pure, fixture-only Git-version interpretation contract:

- `lib/post-trade-pure-git-version-interpretation-contract-core.ts`
- `tests/e2e/post-trade-pure-git-version-interpretation-contract.spec.ts`

No server-only adapter was added. No live direct-spawn wrapper was modified. No pure raw completion contract behavior was changed. No executable was run, no live process was observed, no live neutralization occurred, and no runtime/API/UI/runner path was activated.

## Contract Identity

- contract kind: `pure_git_version_interpretation_contract`
- contract id: `ture.execution.pure-git-version-interpretation-contract.fixture.v1`
- contract version: `1`
- boundary id: `ture.execution.git-version-interpretation.fixture-boundary.v1`
- parser grammar id: `ture.execution.git-version-grammar.strict-three-component-ascii.v1`
- parser grammar version: `1`
- normalization id: `ture.execution.git-version-normalization.optional-single-final-lf.v1`
- normalization version: `1`

## Relationship To Raw Completion

The parser accepts only the approved raw completion result object produced by the pure raw process completion evidence contract. It extracts the embedded raw evidence input fields, rebuilds the raw completion result through `buildPureRawProcessCompletionEvidence`, and requires exact evidence/result fingerprint equality before considering completion eligibility.

Plain completion-looking objects, blocked raw completion results, malformed shapes, extra fields, accessors, inherited properties, symbols, class instances, parser options, caller regexes, caller grammar, and caller normalization controls fail closed.

## Eligible Input State

Interpretation proceeds only for raw completion evidence with:

- tool `git`;
- platform `macos`;
- canonical executable `/usr/bin/git`;
- argv identity `git_version_argv_v1`;
- argv exactly `["--version"]`;
- completion category and reason `process_created_normal_zero_exit`;
- process created and started;
- spawn attempted with no spawn error;
- exit observed with code `0`;
- close observed with code `0`;
- no signal;
- no child-process, stdout, stderr, overflow, encoding, unexpected-chunk, or termination fault;
- terminal close lifecycle and deterministic event order;
- `settledExactlyOnce:true`;
- `retryCount:0`;
- `fallbackAttempted:false`;
- shell, PATH lookup, inherited environment, credentials, network, authorization consumption, and runtime activation all false;
- `observedLiveProcess:false`;
- `authority:"none"`;
- `toctouEliminated:false`.

Any incompatible state is rejected before stdout parsing.

## Stdout And Stderr Policy

Stderr must be exactly empty:

- byte count `0`;
- text `""`;
- no stderr stream error or overflow.

Stdout must be one exact UTF-8 line:

- exact lowercase prefix `git version `;
- exact ASCII version token;
- optional exactly one final LF;
- no CR;
- no second line;
- no leading whitespace;
- no trailing whitespace except the optional final LF;
- no tab;
- no NUL;
- no C0/C1 control character;
- no ANSI escape sequence;
- no extra diagnostic text;
- no localization;
- no suffix, prerelease, vendor, or build metadata.

The only permitted normalization is removing exactly one final LF.

## Version Grammar

The grammar is:

```text
major.minor.patch
```

Rules:

- exactly three numeric components;
- exactly two dots;
- ASCII digits only;
- no signs;
- no whitespace;
- no empty component;
- no fourth component;
- no suffix;
- no prerelease;
- no build metadata;
- no exponent;
- no Unicode digits;
- no leading zero unless the component is exactly `0`;
- maximum five digits per component;
- maximum numeric value `65535` per component.

No generic semantic-version dependency is used.

## Validation Precedence

The builder evaluates in deterministic order:

1. raw result object/schema validation;
2. raw contract identity/version/boundary validation;
3. raw result and evidence fingerprint reconstruction;
4. fixture/live and authority posture;
5. tool/executable/argv;
6. eligible completion state;
7. stderr policy;
8. stdout byte-count consistency;
9. NUL, control, ANSI, CR, and multi-line checks;
10. prefix and whitespace checks;
11. optional single-final-LF normalization;
12. version grammar;
13. leading-zero, component-length, and component-range checks;
14. immutable interpretation evidence construction.

## Rejection Reasons

The contract uses a closed deterministic reason vocabulary:

`input_contract_rejected`, `input_fingerprint_rejected`, `source_spawn_identity_rejected`, `tool_rejected`, `executable_rejected`, `argv_rejected`, `completion_category_rejected`, `process_not_created`, `process_not_started`, `spawn_error_rejected`, `non_zero_exit`, `signal_termination`, `close_state_rejected`, `child_process_error_rejected`, `stdout_stream_error_rejected`, `stderr_stream_error_rejected`, `output_overflow_rejected`, `invalid_encoding_rejected`, `unexpected_chunk_rejected`, `termination_state_rejected`, `retry_or_fallback_rejected`, `security_posture_rejected`, `authority_rejected`, `live_claim_rejected`, `stderr_not_empty`, `stdout_empty`, `stdout_multiple_lines`, `prefix_rejected`, `whitespace_rejected`, `carriage_return_rejected`, `control_character_rejected`, `ansi_escape_rejected`, `nul_rejected`, `version_grammar_rejected`, `component_count_rejected`, `leading_zero_rejected`, `component_digit_length_rejected`, `component_range_rejected`, `suffix_rejected`, `output_byte_count_rejected`, `timestamp_rejected`, and `unsupported_contract_identity`.

No free-form reason is emitted.

## Output Schema

The result contains immutable evidence with:

- contract, boundary, grammar, and normalization identities;
- source raw completion identity and fingerprints;
- source spawn fingerprint;
- session, purpose, tool, platform, policy, executable, argv, and timestamp linkage;
- accepted or rejected status;
- deterministic primary reason and reason list;
- original stdout fingerprint;
- normalized stdout fingerprint when accepted;
- raw stdout byte count;
- final-LF removal flag;
- parsed version and bounded `major`, `minor`, `patch` integers when accepted;
- suffix status `false`;
- `stderrEmpty:true` and `eligibleCompletion:true` only when accepted;
- all authority and live-action flags false or `none`;
- SHA-256 evidence and result fingerprints.

## Fingerprinting

SHA-256 fingerprints are domain-separated for:

- contract identity;
- parser policy;
- source linkage;
- original stdout;
- normalized stdout;
- interpretation evidence;
- builder result.

Fingerprints bind trust-relevant fields but do not create provenance or authority.

## Fixture/Live Separation And Authority

The contract remains pure and fixture-only. It imports only `node:crypto` and the approved pure raw completion core. It imports no server-only, filesystem, child-process, process environment, network, credential, timer, signal, browser, Supabase, Avanza, trading, persistence, API, UI, runner, cron, or deployment primitive.

Accepted interpretation does not imply Git compatibility, live observation, executable safety, spawn permission, observer permission, runner readiness, deployment readiness, staging readiness, execution readiness, credential readiness, Avanza readiness, or production readiness.

## Test Coverage

The focused suite covers accepted forms, completion eligibility, stderr policy, stdout shape, grammar, schema attacks, fingerprint binding, deterministic output, immutability, static imports, and runtime non-wiring.

## Remaining Blockers

Before live neutralization:

- independent static/security review of this pure parser;
- remediation if findings are found;
- final re-review if remediation occurs;
- separate live neutralization design and implementation gate.

Before compatibility or deployment decisions:

- live neutralization review;
- version compatibility policy review;
- observer/timeout/termination review;
- runner activation approval;
- deployment approval.

## Safety Confirmation

No executable was run. No Git version was collected from a live process. No process was observed. No live neutralization occurred. No credentials, environment, network, Avanza, trading, persistence, API/UI/runner, or deployment behavior occurred.

## Decision

Decision: `post_trade_pure_git_version_interpretation_contract_ready_for_static_security_review`

Result status: `post_trade_pure_git_version_interpretation_contract_action_561_implemented_fixture_only`

Recommended next Action: Action 562 - Static Security and Contract Review of Pure Git Version Interpretation Contract.
