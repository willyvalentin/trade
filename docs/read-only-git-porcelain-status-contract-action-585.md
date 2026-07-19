# Action 585 - Pure Read-Only Git Porcelain Status Observation Contract Plan

## Approved Action 584 Checkpoint

Action 585 starts from:

- workspace: `/Users/willysimonsson/Dev/trade-action-534`;
- branch: `codex/action-534-live-resolver`;
- HEAD checkpoint: `ee3ca6d Add reviewed pure read-only Git observation contracts`;
- Action 584 decision: `post_trade_pure_read_only_git_simple_observation_contracts_final_security_review_approved`;
- initial worktree status: clean.

Action 584 approved only the pure simple-observation contracts for repository root, object format, HEAD object ID, and branch/detached state. It did not approve porcelain status parsing, repository inspection, runtime activation, compatibility decisions, a runner, or repository-read authority.

## Primary Source Review

Primary references reviewed:

- Git status documentation: https://git-scm.com/docs/git-status
- Action 579 capability contract: `docs/read-only-git-activation-capability-contract-action-579.md`
- Action 580 output contract architecture: `docs/read-only-git-observation-output-contracts-action-580.md`
- Action 581-584 simple-observation source, tests, reviews, remediation, and checkpoints.

Official Git status documentation establishes that porcelain format is intended for scripts and stable across Git versions/user configuration, that `-z` terminates entries with NUL and prints pathnames without quoting, that `--untracked-files=all` lists individual untracked files, that `--no-renames` disables rename detection regardless of user configuration, and that `--ignore-submodules=none` considers submodule commit, modified, and untracked changes.

## Current Approved Context

Currently approved pure observation contracts:

1. repository root: `["rev-parse", "--show-toplevel"]`;
2. object format: `["rev-parse", "--show-object-format"]`;
3. HEAD object ID: `["rev-parse", "--verify", "HEAD"]`;
4. branch or detached state: `["symbolic-ref", "--quiet", "--short", "HEAD"]`.

Planned future sequence:

1. repository root;
2. object format;
3. HEAD before;
4. branch;
5. porcelain status;
6. HEAD after.

Porcelain status is not implemented in the Action 581-584 simple-observation package. No Action 585 Git runner or runtime caller is added or authorized. Static reachability review found pre-existing dormant migration-preflight references to porcelain status in `lib/post-trade-read-only-live-staging-migration-preflight-runner-core.ts` and related tests; those references predate Action 585, were not modified, and do not implement the exact planned `-z` tuple. No repository facts enter production evidence through this plan. No aggregate repository eligibility contract exists. Required posture remains `repositoryReadAuthorityGranted:false`, `authority:none`, and `toctouEliminated:false`.

## Exact Command Contract

The only planned porcelain-status command tuple is:

```json
["status", "--porcelain=v1", "-z", "--untracked-files=all", "--no-renames", "--ignore-submodules=none"]
```

Planned capability identity:

`git_porcelain_status_v1`

Planned purpose:

`git_porcelain_status`

Flag effects:

- `status`: local worktree/index status observation only.
- `--porcelain=v1`: selects stable porcelain v1 output for scripts.
- `-z`: uses NUL termination and raw pathname bytes without C-style quoting; this also implies porcelain v1 if no other format is selected, but the contract still requires explicit `--porcelain=v1`.
- `--untracked-files=all`: includes individual files inside untracked directories.
- `--no-renames`: disables rename detection regardless of user configuration.
- `--ignore-submodules=none`: considers submodule commit, modified, and untracked changes.

The contract must require this exact order and exact argv. No omitted flags, reordered flags, caller pathspecs, caller config, ignored-file mode, rename mode, submodule mode, branch-header options, porcelain v2, human-readable output, or arbitrary status flags are allowed.

## Completion-Input Architecture

The Action 581 observation-completion input contract is text-oriented and intentionally excludes porcelain status. It assumes `stdoutText` is valid UTF-8. Porcelain `-z` pathnames are raw bytes and may include invalid UTF-8, newlines, tabs, carriage returns, quotes, backslashes, leading dashes, non-ASCII bytes, and Unicode normalization variants.

Options reviewed:

| Option | Description | Verdict |
| --- | --- | --- |
| A | Extend existing text-oriented observation-completion contract with porcelain status. | Rejected. It widens approved simple observations and cannot safely represent invalid UTF-8 or NUL-oriented output. |
| B | Create a separate pure porcelain-status completion-input contract. | Selected. It keeps byte-oriented lifecycle evidence isolated and reviewable. |
| C | Create a shared byte-preserving completion contract for future binary/NUL outputs. | Deferred. It may be useful later, but Action 586 should stay one-command scoped. |
| D | Let the parser accept arbitrary fixture bytes directly. | Prohibited. It would bypass source identity, lifecycle, and authority posture. |

Selected architecture: a separate pure porcelain-status completion-input contract with one exact command tuple, byte-oriented stdout evidence, fixture-only provenance, no live claim, `authority:none`, and no runtime reachability.

## Raw-Byte Representation

Representation options reviewed:

| Option | Representation | Verdict |
| --- | --- | --- |
| A | JavaScript string requiring valid UTF-8. | Rejected as lossy and invalid for arbitrary path bytes. |
| B | Immutable byte array. | Strongly lossless but awkward for deterministic JSON-ish canonicalization unless represented as exact integer arrays. |
| C | Lowercase hex string. | Selected for fixture completion input. Lossless, canonical, deterministic, no replacement decoding, easy to fingerprint, and testable. |
| D | Base64 string. | Acceptable but less visually strict; padding/case variants add review surface. |
| E | Record-level hashes and aggregate counts only. | Good final retention posture, but insufficient at parser input because grammar must inspect exact bytes. |

Selected canonical fixture representation:

- `stdoutBytesHex`: lowercase even-length hex string;
- `stdoutByteCount`: exact byte length derived from hex length;
- `stderrBytesHex`: must be empty hex;
- raw-output fingerprint over exact bytes, not decoded text.

No invalid byte is replaced. No Unicode normalization is performed. No plaintext filename is logged or retained in final accepted summaries.

## Porcelain V1 `-z` Grammar

The exact parser is byte-oriented.

Clean output:

- zero bytes;
- no final NUL.

Ordinary non-rename tracked/untracked record shape:

```text
X Y SP PATH NUL
```

Byte positions:

- byte 0: X status;
- byte 1: Y status;
- byte 2: ASCII space `0x20`;
- bytes 3 through before next NUL: path bytes;
- final byte for the record: NUL `0x00`.

Rename/copy record shape in porcelain v1 `-z` differs from non-`-z`: Git omits `->`, reverses pathname order, and separates the two pathnames with NUL. Because `--no-renames` is mandatory, any `R` or `C` status code or second pathname posture is rejected as inconsistent with the command policy.

Ignored records `!!` are not expected because `--ignored` is absent. If observed, reject as inconsistent rather than counting ignored paths.

Valid initial XY sets:

- ordinary tracked, non-conflict, non-rename/copy: X in space/M/T/A/D and Y in space/M/T/D, excluding both-space clean records;
- untracked: `??`;
- unmerged/conflict: `DD`, `AU`, `UD`, `UA`, `DU`, `AA`, `UU`.

Rejected:

- malformed status prefixes;
- missing ASCII space;
- missing NUL on non-empty output;
- empty path;
- `R` or `C` in either status slot;
- `!!`;
- unsupported or undocumented XY combinations;
- any record that requires a second pathname.

## Status Semantics

X and Y are interpreted separately only after XY validation.

Summary contribution:

- staged change: X in `M`, `T`, `A`, `D`;
- unstaged change: Y in `M`, `T`, `D`;
- untracked: `??`;
- unmerged: one of `DD`, `AU`, `UD`, `UA`, `DU`, `AA`, `UU`;
- ignored: always zero under this command; `!!` rejects;
- submodule: v1 `-z` reports submodule changes as `M`, not `m` or `?`, so no trustworthy submodule-specific count is derivable from this contract alone.

One record may increment both staged and unstaged counts when both X and Y represent changes. Unmerged records increment only `unmergedCount` and do not also increment staged/unstaged counts in the initial summary.

No best-effort categorization is allowed.

## Clean And Dirty Model

Accepted clean:

- zero-exit completion;
- empty stdout bytes;
- empty stderr;
- `clean:true`;
- `recordCount:0`;
- every count zero;
- ordered record fingerprint for the empty sequence;
- raw-output fingerprint for empty bytes.

Accepted dirty:

- zero-exit completion;
- one or more valid NUL-framed records;
- empty stderr;
- `clean:false`;
- deterministic counts and status-code breakdown;
- ordered record fingerprints;
- aggregate path-list fingerprint;
- no repository-read authority.

Valid dirty parsing does not imply repository eligibility. HEAD stability, root matching, detached eligibility, and aggregate sequence validity remain future aggregate-contract responsibilities.

## Path-Evidence Policy

Output retention options:

| Option | Policy | Verdict |
| --- | --- | --- |
| A | Retain exact path bytes for every record. | Rejected for final evidence privacy. |
| B | Retain encoded path bytes. | Rejected for final evidence privacy; acceptable only in transient parser input. |
| C | Retain per-path fingerprint plus status code. | Selected for per-record summaries if needed. |
| D | Retain aggregate path-list fingerprint and counts only. | Selected as the minimum final result shape. |
| E | Retain counts only. | Rejected because it weakens auditability and mutation detection. |

Selected final evidence:

- parser consumes exact bytes;
- final accepted result does not retain plaintext path bytes;
- per-record summary, if included, contains status code, path-byte fingerprint, and path byte length only;
- aggregate evidence retains ordered record fingerprints, counts, cumulative path bytes, and path-list fingerprint.

No path bytes are logged.

## Limits

Planned source-controlled limits:

- maximum raw stdout bytes: 65536 bytes;
- maximum record count: 2048;
- maximum path bytes per record: 4096;
- maximum cumulative path bytes: 65536;
- maximum stderr bytes: 0;
- maximum result evidence size: bounded by record count and summary-only retention.

Rationale:

- 16 KiB is likely too small for a realistic repository with untracked files;
- 64 KiB keeps fixture review manageable and fail-closed;
- no truncation, no count-only fallback, and no overflow repair are allowed.

Overflow produces deterministic rejection.

## Exit, Stderr, Lifecycle, And Normalization

Accepted status interpretation requires:

- ordinary zero-exit completion;
- close/exit consistency;
- no signal;
- no child-process error;
- no stream error;
- no overflow;
- exact byte retention;
- no termination;
- no retry or fallback;
- settled exactly once;
- empty stderr.

No legitimate non-zero accepted state is defined.

Normalization policy:

- no normalization;
- no trim;
- no appending/removing NUL;
- no newline conversion;
- no Unicode normalization;
- no sorting, deduplication, or repair;
- no invalid UTF-8 replacement.

Fingerprint exact bytes.

## Result Model

Closed result union:

1. `accepted_clean`;
2. `accepted_dirty`;
3. `rejected`.

Required fields:

- contract kind/version/boundary;
- grammar identity/version;
- normalization identity/version;
- capability identity;
- status and deterministic reason;
- source porcelain-completion contract identity/version/boundary;
- source evidence fingerprint;
- source spawn identity/version/fingerprint;
- session, purpose, platform, policy, executable, exact argv;
- working-directory fingerprint;
- observation-sequence identity;
- source timestamp;
- raw byte length and raw output fingerprint;
- `stderrEmpty`;
- `eligibleCompletion`;
- record count;
- cumulative path byte count;
- `truncated:false`;
- clean boolean;
- staged, unstaged, untracked, ignored, unmerged, submodule, and unsupported counts;
- ordered record fingerprint;
- status-code breakdown;
- record summaries or null according to final privacy policy;
- full authority/runtime false posture;
- final evidence fingerprint.

Rejected results retain no partial accepted summary and no path bytes.

## Reason Model And Precedence

Closed reasons include:

- `input_contract_rejected`;
- `input_identity_rejected`;
- `input_fingerprint_rejected`;
- `source_spawn_identity_rejected`;
- `source_linkage_rejected`;
- `capability_rejected`;
- `platform_rejected`;
- `tool_rejected`;
- `executable_rejected`;
- `argv_rejected`;
- `completion_state_rejected`;
- `exit_state_rejected`;
- `signal_rejected`;
- `stderr_not_empty`;
- `output_overflow_rejected`;
- `stream_error_rejected`;
- `termination_state_rejected`;
- `retry_or_fallback_rejected`;
- `authority_rejected`;
- `runtime_claim_rejected`;
- `live_claim_rejected`;
- `toctou_claim_rejected`;
- `malformed_nul_termination`;
- `truncated_record`;
- `malformed_status_prefix`;
- `unsupported_status_code`;
- `rename_or_copy_rejected`;
- `ignored_record_rejected`;
- `path_empty`;
- `path_too_long`;
- `too_many_records`;
- `cumulative_path_limit_rejected`;
- `clean`;
- `dirty`.

Validation precedence:

1. input schema closure;
2. contract identity/version/boundary;
3. capability/purpose/argv;
4. source identity/linkage;
5. lifecycle/security posture;
6. byte-count and fingerprint validation;
7. stderr;
8. raw byte limit;
9. empty-output clean handling;
10. NUL framing;
11. record prefix and length;
12. XY status validation;
13. rename/copy consistency;
14. path-byte validation and limits;
15. record-count and cumulative limits;
16. summary derivation;
17. cross-field consistency;
18. immutable accepted result construction.

## Fingerprinting

Fingerprint domains must be separate and SHA-256 based.

Fingerprints bind:

- contract identities;
- capability and exact argv;
- source completion linkage;
- session, purpose, platform, policy, path, and sequence;
- raw bytes;
- ordered record boundaries;
- XY codes;
- per-path byte fingerprints;
- counts;
- status-code breakdown;
- clean/dirty state;
- status and reason;
- all authority/runtime/TOCTOU fields;
- final result.

Changing record order changes the fingerprint. Fingerprints grant no provenance or authority.

## Cross-Command Linkage

Future aggregate linkage must require shared:

- session;
- platform;
- policy;
- executable;
- working-directory fingerprint;
- observation-sequence identity;
- source spawn lineage.

Status evidence later links with root, object-format, HEAD-before, branch, and HEAD-after evidence, but the status contract itself does not decide root match, HEAD stability, detached eligibility, clean eligibility, aggregate repository eligibility, or compatibility.

## Live Infrastructure Implications

Current direct-spawn/neutralization infrastructure is centered on existing output contracts and should not be stretched silently. Future live status support requires separate planning for:

- byte-preserving direct-spawn output capture;
- invalid UTF-8 retention;
- exact byte limits and overflow reporting;
- stream chunk boundary neutrality;
- no replacement decoding;
- server-only neutralization that preserves original-object provenance and one-shot semantics.

The next implementation must remain pure fixture-only. It must not connect to live neutralization or a runner.

## Test Strategy

Future tests must cover:

- accepted clean empty bytes;
- accepted staged-only, unstaged-only, staged plus unstaged, untracked, unmerged, and multi-record dirty outputs;
- filenames containing spaces, tabs, newlines, carriage returns, quotes, backslashes, leading dashes, non-ASCII bytes, invalid UTF-8 bytes, and Unicode normalization variants;
- ordered-record fingerprint sensitivity;
- missing final NUL on non-empty output;
- empty path;
- short status prefix;
- invalid or impossible XY;
- `R` or `C` under `--no-renames`;
- `!!` without `--ignored`;
- too many records;
- per-path and cumulative path limit failures;
- raw output limit failure;
- non-empty stderr;
- non-zero exit;
- signal, overflow, stream error, lifecycle contradiction, authority/live/runtime/TOCTOU claim;
- schema attacks;
- stale and recomputed forged fingerprints;
- exact reasons, counts, fingerprints, nullability, freeze, and mutation isolation.

## Implementation Options

| Option | Description | Verdict |
| --- | --- | --- |
| A | Implement pure byte-oriented completion input plus status parser in one Action. | Rejected for now. It combines a new byte evidence boundary with a non-trivial NUL parser. |
| B | Implement byte-oriented porcelain completion-input contract first, then parser separately. | Selected. It isolates the most important prerequisite before grammar parsing. |
| C | Extend text-oriented observation completion and reject invalid UTF-8. | Rejected as lossy and contrary to porcelain `-z` raw path semantics. |
| D | Implement live runner and parser together. | Rejected as unsafe and premature. |

Recommended next Action:

Action 586 - Implement Pure Byte-Oriented Porcelain Status Completion Input Contract.

## Compatibility Impact

The planned status contract introduces requirements for:

- porcelain v1;
- `-z`;
- `--untracked-files=all`;
- `--no-renames`;
- `--ignore-submodules=none`.

Git status documentation shows these options in the current manual and records no manual changes across many recent versions on the docs page. Action 585 does not finalize a numeric Git compatibility baseline. Compatibility derivation should resume after the pure byte-oriented completion-input and status parser contracts are implemented and reviewed.

## Future Review Gates

1. Byte-representation review.
2. Completion-input schema review.
3. Exact argv review.
4. Lifecycle/exit/stderr review.
5. NUL-framing review.
6. XY status-code review.
7. Rename/copy posture review.
8. Unmerged/submodule review.
9. Path-byte safety review.
10. Invalid UTF-8 review.
11. Byte and record limit review.
12. Privacy/retention review.
13. Summary-consistency review.
14. Fingerprint review.
15. Determinism/immutability review.
16. Cross-command linkage review.
17. Authority/no-runtime review.
18. Export-surface review.
19. Runtime-reachability review.
20. Independent static security review.
21. Remediation and final re-review.
22. Separate live byte-capture planning.
23. Separate runner planning.
24. Separate runtime activation approval.
25. Separate deployment approval.

## Explicit Non-Authorizations

This plan does not authorize Git repository inspection, process creation or observation, repository-read authority, porcelain-status parser implementation, runner implementation, compatibility decisions, runtime/API/UI/runner activation, credentials, environment or network access, Avanza/trading behavior, persistence, deployment, commit, push, merge, or deploy. Pre-existing dormant migration-preflight porcelain-status references remain unmodified and are not an Action 585 activation path.

## Decision

`post_trade_read_only_git_porcelain_status_observation_contract_plan_ready`

## Result Status

`post_trade_read_only_git_porcelain_status_action_585_planning_gate_completed`

## Commit / Deploy

No commit, push, merge, or deploy occurred. No deploy is recommended for Action 585.
