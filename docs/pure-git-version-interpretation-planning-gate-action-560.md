# Action 560 - Pure Git Version Interpretation Planning Gate

## Scope

Action 560 is a documentation, architecture, and approval-gate action only. It does not implement Git-version parsing, does not modify the pure raw completion contract, does not add a live neutralization adapter, does not modify the direct-spawn wrapper, and does not execute Git or any executable.

The future boundary may consume only immutable raw completion evidence from the approved pure raw process completion evidence contract and may produce deterministic, deeply frozen, authority-free Git-version interpretation evidence. A successful interpretation must remain evidence only.

## Approved Input Checkpoint

The approved upstream checkpoint is:

`post_trade_pure_raw_process_completion_evidence_contract_final_security_review_approved`

Result status:

`post_trade_pure_raw_process_completion_evidence_contract_action_559_final_re_review_completed`

The approved raw completion contract is:

- kind: `pure_raw_process_completion_evidence_contract`;
- version: `1`;
- boundary: `ture.execution.raw-process-completion-evidence.fixture-boundary.v1`;
- source spawn contract: `ture.execution.dormant-server-only-fixed-read-only-direct-spawn-adapter.server.v1`;
- purpose: `first_live_read_only_staging_preflight`;
- platform: `macos`;
- fixture-only: true;
- observed live process: false;
- authority: `none`.

## Exact Eligibility Requirements

A future parser must reject unless every item below is satisfied:

- exact raw completion contract kind, version, boundary, identity fingerprint, policy fingerprint, evidence fingerprint, and result fingerprint are present and valid;
- exact source spawn identity, version, and fingerprint are present;
- exact session and purpose are preserved;
- tool is exactly `git`;
- canonical executable is exactly `/usr/bin/git`;
- argv identity is `git_version_argv_v1`;
- argv is exactly `["--version"]`;
- process was created and process start was observed;
- completion category is exactly `process_created_normal_zero_exit`;
- completion is terminal;
- exit was observed with `exitCode:0`;
- signal was not observed and signal fields are null;
- close was observed with compatible zero-exit facts;
- no spawn error, stream error, overflow, invalid encoding, unexpected chunk, or termination request exists;
- process death/completion semantics are compatible with ordinary close;
- `retryCount:0`;
- `fallbackAttempted:false`;
- shell use, PATH lookup, inherited environment, credentials, and network are all false;
- `cliVersionInterpreted:false`;
- `observedLiveProcess:false`;
- `authority:"none"`;
- `toctouEliminated:false`.

Any contradictory, ambiguous, expired, malformed, cloned, mutated, cross-session, cross-purpose, unsupported, authority-bearing, or live-claiming input is categorically ineligible.

## Stdout Policy

Chosen baseline:

- stdout must contain exactly one UTF-8 line;
- the line must begin with exact lowercase ASCII prefix `git version `;
- the line must contain exactly one canonical version token after the prefix;
- at most one final LF is accepted;
- no leading whitespace;
- no trailing whitespace other than the one approved final LF;
- no CR or CRLF conversion;
- no second line;
- no NUL;
- no control characters;
- no ANSI escape sequence;
- no extra text;
- no localization;
- no vendor or platform suffix unless a future review explicitly approves a narrower suffix grammar.

## Stderr Policy

Stderr must be exactly empty:

- `stderrByteCount` must be zero;
- `stderrText` must be exactly empty;
- warnings, diagnostics, update notices, localization text, prompts, and banners are rejected even when stdout appears valid.

Reason: this parser is not an interactive diagnostic interpreter. Accepting stderr would make "version observed" depend on advisory text whose semantics are outside the version grammar.

## Version Grammar Comparison

| Option | Assessment | Decision |
| --- | --- | --- |
| Exactly three numeric components, `major.minor.patch` | Matches the already reviewed fixture parser, has a small attack surface, and avoids suffix ambiguity. | Chosen baseline. |
| Two to four numeric components | Broader and may accept platform-specific aliases without a need from current evidence. | Reject for Action 561 baseline. |
| Numeric core plus suffix grammar | Useful only if a real reviewed Git variant requires it. Suffix semantics are ambiguous without a separate policy. | Defer. |
| Generic semver parser | Too broad; prerelease/build metadata, coercion, and normalization behavior would need independent review. | Reject. |

## Chosen Grammar

The future parser should use a source-controlled grammar identity such as:

`pure_git_version_interpretation_grammar_v1`

The grammar should accept only:

```text
git version <major>.<minor>.<patch>
```

Component rules:

- ASCII digits only;
- exactly three components;
- dot separators only;
- no signs;
- no whitespace inside the token;
- no empty component;
- no exponent notation;
- no decimal aliases;
- no Unicode digits;
- no suffixes;
- no leading zeros unless the component is exactly `0`;
- each component has at most six digits;
- each component value is between `0` and `999999`.

## Normalization Policy

Normalization must be minimal and versioned:

- remove exactly one final LF if present;
- no trim;
- no case folding;
- no Unicode normalization;
- no CRLF conversion;
- no whitespace collapse;
- no ANSI stripping;
- no replacement decoding;
- no repair.

The raw stdout fingerprint must be preserved before the optional final-LF removal. The normalization policy identity and version must participate in the interpretation fingerprint.

## Rejection Model

The future parser should expose a closed deterministic reason vocabulary including:

- `input_contract_rejected`;
- `source_spawn_identity_rejected`;
- `tool_rejected`;
- `executable_rejected`;
- `argv_rejected`;
- `completion_category_rejected`;
- `process_not_created`;
- `non_zero_exit`;
- `signal_termination`;
- `close_state_rejected`;
- `spawn_error_rejected`;
- `stream_error_rejected`;
- `output_overflow_rejected`;
- `invalid_encoding_rejected`;
- `unexpected_chunk_rejected`;
- `termination_state_rejected`;
- `stderr_not_empty`;
- `stdout_empty`;
- `stdout_multiple_lines`;
- `prefix_rejected`;
- `version_grammar_rejected`;
- `leading_zero_rejected`;
- `component_count_rejected`;
- `component_range_rejected`;
- `suffix_rejected`;
- `control_character_rejected`;
- `ansi_escape_rejected`;
- `nul_rejected`;
- `whitespace_rejected`;
- `authority_rejected`;
- `live_claim_rejected`;
- `retry_or_fallback_rejected`;
- `fingerprint_rejected`.

The parser must not return a best-effort version. The first implementation may return all applicable deterministic reasons in sorted source-controlled order.

## Output Evidence Model

Future output evidence should include:

- contract kind, version, boundary, and parser identity;
- source raw completion contract identity and fingerprint;
- source raw stdout fingerprint;
- session;
- purpose;
- tool `git`;
- canonical executable `/usr/bin/git`;
- argv identity and exact argv;
- interpretation status: accepted or rejected;
- deterministic reason code list;
- canonical parsed version string when accepted;
- numeric `major`, `minor`, and `patch`;
- suffix status `none`;
- parser grammar identity/version;
- normalization policy identity/version;
- evidence timestamp from explicit fixture input only;
- provenance classification `fixture_only_raw_completion_interpretation`;
- `observedLiveProcess:false`;
- `authority:"none"`;
- `toctouEliminated:false`;
- fingerprint algorithm `sha256`;
- output evidence fingerprint.

A parsed version must not grant execution, compatibility, deployment, authorization, runner, credential, network, Avanza, trading, persistence, API, or UI authority.

## Live Neutralization Separation

Actual dormant spawn lifecycle evidence still cannot enter the future pure parser directly. A separate server-only neutralization boundary is required to convert approved live spawn evidence into the reviewed raw completion evidence contract.

| Sequencing option | Assessment | Decision |
| --- | --- | --- |
| A. Implement pure parser first, then live neutralization | Keeps parsing pure and testable before any live evidence bridge exists. | Recommended. |
| B. Implement live neutralization first, then pure parser | Defers parser invariants and risks designing the bridge without a settled parser contract. | Defer. |
| C. Combine neutralization and parsing | Collapses live evidence handling and interpretation, increasing authority confusion. | Reject. |

## Non-Authorizations

This planning gate does not authorize:

- Git-version parser implementation;
- live neutralization;
- executable invocation;
- process observation;
- spawn, observer, timeout, termination, runner, API, UI, cron, or deployment activation;
- filesystem, process, environment, network, credential, Keychain, browser, Avanza, trading, order, position, settlement, persistence, or Supabase behavior;
- production readiness or staging execution readiness.

## Recommended Next Action

Recommended next Action:

Action 561 - Implement Pure Git Version Interpretation Contract

Action 561 must remain fixture-only and pure, with no server-only/process/filesystem/environment/network imports and no runtime reachability.

## Commit And Deploy

No commit is created in Action 560. No push, merge, pull request, or deployment is recommended.

## Decision

Decision: `post_trade_pure_git_version_interpretation_boundary_plan_ready`

Result status: `post_trade_pure_git_version_interpretation_action_560_planning_gate_completed`
