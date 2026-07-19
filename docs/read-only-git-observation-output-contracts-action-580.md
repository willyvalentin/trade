# Action 580 - Read-Only Git Observation Output Contracts

## Approved Action 579 Capability Contract

Action 580 starts from:

- workspace: `/Users/willysimonsson/Dev/trade-action-534`;
- branch: `codex/action-534-live-resolver`;
- HEAD checkpoint: `2830605 Define read-only Git activation capability contract`;
- initial worktree status: clean.

Action 579 approved a documentation-only capability contract for five future read-only Git observation tuples:

1. `["rev-parse", "--show-toplevel"]`
2. `["rev-parse", "--show-object-format"]`
3. `["rev-parse", "--verify", "HEAD"]`
4. `["symbolic-ref", "--quiet", "--short", "HEAD"]`
5. `["status", "--porcelain=v1", "-z", "--untracked-files=all", "--no-renames", "--ignore-submodules=none"]`

No runner exists. No output parser for these commands exists. No repository facts have entered production evidence. No repository-read authority exists. No compatibility policy exists. No runtime caller exists. Authority remains `none`, and `toctouEliminated:false` remains required.

## Output-Contract Architecture Comparison

| Option | Description | Verdict |
| --- | --- | --- |
| A - one generic Git observation output contract | One output type selected by capability ID. | Rejected. A generic dispatcher would enlarge parser surface, blur exit semantics, and risk accidental cross-command acceptance. |
| B - one pure contract per command | Separate contracts for root, object format, HEAD, branch, and status. | Safe but may duplicate small primitive checks. |
| C - small shared primitives plus command-specific wrappers | Separate top-level contracts with only tiny shared primitives for identical semantics. | Selected. Keeps command-specific identity/version/reasons while avoiding duplicate primitive validators. |

Selected architecture: separate top-level pure contract per command, with only source-controlled primitive validators where semantics are identical. No caller parser configuration and no generic capability/output dispatcher are approved.

## Common Raw-Completion Eligibility

Every future output contract must accept only reviewed raw-completion evidence for its corresponding exact Git capability tuple.

Common requirements:

- exact raw contract kind/version/boundary;
- accepted raw-completion result;
- complete raw fingerprint verification by rebuilding or validating through the approved raw mechanism;
- exact source spawn identity/version/fingerprint;
- exact session;
- exact capability purpose;
- exact tool `git`;
- exact executable `/usr/bin/git`;
- exact argv for the specific output contract;
- reviewed platform `macos`;
- fixture/synthetic-compatible provenance;
- `observedLiveProcess:false`;
- `authority:none`;
- `runtimeActivated:false`;
- `authorizationConsumed:false`;
- `credentialsUsed:false`;
- `networkUsed:false`;
- `toctouEliminated:false`.

Current prerequisite: the existing pure raw-completion contract is intentionally shaped around `fixedArgvIdentity: "git_version_argv_v1"` and `argv: ["--version"]`. A future implementation must not stretch that contract silently. It must either introduce a reviewed versioned raw-completion evidence contract for read-only repository observations or wrap command-specific raw evidence under exact identities before these output contracts can be implemented.

Each output contract must reject raw evidence for another approved command. Raw-completion-looking plain objects must not be trusted directly.

## Common Security Posture

All output contracts must:

- remain pure and fixture-only;
- import no `server-only`, process, filesystem, environment, network, credential, Keychain, timer, signal, Supabase, browser, Avanza, or persistence primitive;
- capture no internal timestamp;
- perform no import-time work beyond frozen constants;
- produce deeply frozen deterministic evidence;
- grant no repository-read authority;
- grant no runtime, staging, deployment, compatibility, or mutation authority;
- retain no process handle;
- expose no executable capability;
- remain runtime-unreachable.

Accepted output means only that neutral structural evidence matched one reviewed grammar.

## Capability A - Repository Root Output

Command tuple:

`["rev-parse", "--show-toplevel"]`

Future contract identity:

`ture.execution.read-only-git-root-output-contract.fixture.v1`

Expected raw state:

- exit code `0`;
- close code `0`;
- no signal;
- no spawn/stream/overflow/encoding errors;
- stderr byte count `0`;
- stdout byte count within the root limit;
- stdout is exactly one path line, with optional one final LF.

Accepted path grammar:

- absolute POSIX path beginning with `/`;
- not exactly `/`;
- UTF-8 text only for the initial contract;
- no NUL, CR, LF except the optional final LF terminator, tab, ANSI, or other control characters;
- no empty component, `.` component, `..` component, repeated slash, or trailing slash;
- component length and total length bounded;
- non-ASCII components are initially rejected until a Unicode normalization policy exists.

The contract must not access the filesystem and must not prove canonicality, symlink posture, existence, ownership, or case behavior. It should retain the exact normalized path string, a component count, an exact path fingerprint, and a source raw-output fingerprint. A later aggregate contract compares this output to the approved worktree path evidence.

Rejected examples include relative paths, `//repo`, `/repo/`, `/repo/../x`, `/repo/./x`, `/repo//x`, `/`, paths with NUL, CRLF, tabs, control characters, ANSI, or multiple lines.

## Capability B - Object-Format Output

Command tuple:

`["rev-parse", "--show-object-format"]`

Future contract identity:

`ture.execution.read-only-git-object-format-output-contract.fixture.v1`

Initial policy: accept a versioned closed union of exact storage-format outputs:

- `sha1`;
- `sha256`.

The contract should reject arbitrary algorithm names, multiple algorithms, space-separated transition output, empty output, uppercase output, qualifiers, and unsupported formats. Action 579 selected `--show-object-format` with no qualifier, whose documented default is storage format; input/output/compat multi-format variants are not approved for this tuple.

Expected raw state:

- exit code `0`;
- stderr empty;
- stdout exactly `sha1` or `sha256` with optional one final LF;
- very small byte limit.

The interpreted result constrains HEAD parsing:

- `sha1` means HEAD output must be exactly 40 lowercase hex characters;
- `sha256` means HEAD output must be exactly 64 lowercase hex characters.

## Capability C - HEAD Object-ID Output

Command tuple:

`["rev-parse", "--verify", "HEAD"]`

Future contract identity:

`ture.execution.read-only-git-head-object-output-contract.fixture.v1`

Preferred architecture: one parser requiring explicit object-format evidence as prior input. This avoids assuming SHA-1 and avoids separate SHA-1/SHA-256 contract drift.

Input must include a fingerprint-linked accepted object-format interpretation result from the same session, purpose, policy, executable, working directory, and sequence.

Expected raw state:

- exit code `0` for accepted HEAD identity;
- stderr empty;
- stdout one object ID line with optional one final LF;
- no signal, stream error, overflow, invalid encoding, retry, or fallback.

Legitimate non-zero states such as unborn branch, missing HEAD, invalid repository, or ambiguous revision are rejected in this initial parser. A later aggregate can use closed rejected reasons, but non-zero HEAD verification does not become an accepted repository-observation state.

Rejected output:

- abbreviated IDs;
- uppercase hex;
- non-hex;
- incorrect length for linked object format;
- all-zero object ID;
- multiple IDs;
- symbolic names;
- prefixes or suffixes;
- whitespace beyond optional final LF;
- CRLF, NUL, ANSI, or control characters.

The result should retain object ID only if approved as non-sensitive source identity evidence; otherwise retain an exact object fingerprint and a redacted object-length summary. In either case, aggregate evidence must bind the raw-output fingerprint and object-format evidence fingerprint.

## Capability D - Branch Or Detached Output

Command tuple:

`["symbolic-ref", "--quiet", "--short", "HEAD"]`

Future contract identity:

`ture.execution.read-only-git-branch-state-output-contract.fixture.v1`

This contract has a closed accepted union:

1. `attached_branch`
   - exit code `0`;
   - stdout one short branch ref line with optional one final LF;
   - stderr empty.
2. `detached_head`
   - exit code `1`;
   - stdout empty;
   - stderr empty, because `--quiet` suppresses detached diagnostics.

Exit code `128` and every other non-zero exit are rejected. Non-empty stderr is rejected for both accepted states.

Short branch grammar should be a narrow subset of Git refname rules, not a full generic ref parser:

- slash-separated ASCII components;
- components may contain letters, digits, `.`, `_`, and `-`;
- no spaces, tabs, backslash, NUL, CR, LF, control characters, ANSI, or Unicode in the initial contract;
- no leading slash, trailing slash, consecutive slash, leading dot component, component ending `.lock`, `..`, `@{`, single `@`, or full `refs/heads/` prefix;
- bounded total length and component count.

Rejected output includes empty stdout with exit `0`, branch names with unsafe ref syntax, full refs, multiple lines, CRLF, and arbitrary diagnostics.

## Capability E - Porcelain Status Output

Command tuple:

`["status", "--porcelain=v1", "-z", "--untracked-files=all", "--no-renames", "--ignore-submodules=none"]`

Future contract identity:

`ture.execution.read-only-git-porcelain-status-output-contract.fixture.v1`

This is materially more complex than the other four contracts and should be implemented separately.

Expected raw state:

- exit code `0`;
- stderr empty;
- stdout within a status-specific aggregate byte limit;
- no stream error, truncation, overflow, invalid encoding claim, signal, retry, or fallback.

Official porcelain v1 posture:

- porcelain v1 is stable for scripts and independent of user color/status-relative path configuration;
- `-z` uses NUL termination and does not quote or backslash-escape filenames;
- status field remains two bytes, followed by a space before the first filename.

Representation options:

| Option | Verdict |
| --- | --- |
| A - UTF-8 text only | Acceptable for first implementation only if invalid UTF-8 fails closed. Loses ability to inspect arbitrary byte filenames. |
| B - lossless byte arrays | Best fidelity but requires raw-completion byte retention not currently available. |
| C - base64-encoded bytes | Reviewable bridge if future raw evidence keeps bytes without exposing names as text. |
| D - record fingerprints plus counts | Preferred output summary once records are parsed, but parser still needs byte-safe input. |

Initial planned policy: accept only valid UTF-8 status output from the current raw-completion posture, fail closed on invalid encoding, parse NUL-delimited records, and retain counts plus path fingerprints rather than full paths. This is a deliberate first-scope limitation, not a claim that all valid Git repositories are supported.

Status record grammar:

- empty stdout means clean repository;
- non-empty stdout must be a sequence of NUL-terminated records;
- every record must have exact `XY SP path` shape after NUL splitting;
- `X` and `Y` must be from the closed porcelain v1 status code set;
- untracked records are `?? path`;
- ignored records are not expected because `--ignored` is not passed; reject `!!` if observed;
- unmerged/conflict records are recognized and produce `unmergedCount > 0` with aggregate ineligible status;
- rename/copy records should be rejected despite `--no-renames` if observed;
- two-path records are rejected in the initial contract;
- malformed or truncated records are rejected.

Neutral summary fields:

- `clean`;
- `recordCount`;
- `stagedChangeCount`;
- `unstagedChangeCount`;
- `untrackedCount`;
- `unmergedCount`;
- `ignoredCount`;
- `renameOrCopyCount`;
- `statusCodeBreakdown`;
- `pathListFingerprint`;
- `rawOutputFingerprint`;
- `truncated:false`;
- `authority:none`.

Clean eligibility can be decided without retaining filenames by requiring `recordCount === 0`. Dirty summaries can retain counts and fingerprints only.

## Exit-Code Model

Command-specific exit model:

| Contract | Accepted exit codes | Notes |
| --- | --- | --- |
| root | `0` only | Any non-zero rejected. |
| object format | `0` only | Any non-zero rejected. |
| HEAD | `0` only for accepted identity | Non-zero states rejected with closed reasons. |
| branch | `0` attached, `1` detached | `128` and other codes rejected. |
| status | `0` only | Any non-zero rejected. |

All contracts reject signal termination, child-process error, stream error, output overflow, invalid output encoding where text is required, close/exit contradictions, termination request, retry, and fallback.

## Stderr Model

Accepted states require empty stderr:

- root success: empty;
- object-format success: empty;
- HEAD success: empty;
- branch attached: empty;
- branch detached: empty;
- status success: empty.

Warnings and diagnostics reject even when stdout appears valid. No stderr trimming or ignore list is approved.

## Normalization

Line-based outputs may remove exactly one final LF under command-specific normalization identities:

- root optional final LF normalization;
- object-format optional final LF normalization;
- HEAD optional final LF normalization;
- branch optional final LF normalization for attached branch.

Detached branch state has empty stdout and no normalization.

Status output has no normalization. NUL-delimited bytes/text are preserved exactly; records are not reordered, deduplicated, trimmed, Unicode-normalized, CRLF-converted, or repaired.

## Byte Limits

Planned narrow limits:

| Output | Limit |
| --- | --- |
| root stdout | 1024 bytes |
| object-format stdout | 8 bytes |
| HEAD stdout | 65 bytes for SHA-256 plus LF; 41 bytes for SHA-1 plus LF, enforced after object-format linkage |
| branch stdout | 256 bytes |
| status stdout | 16384 bytes initial cap, with overflow producing ineligible/ambiguous evidence rather than truncation |
| stderr | 0 bytes for accepted states |

The 16 KiB status cap may be insufficient for large dirty repositories. Exceeding it should reject initial eligibility or return overflow evidence; no count-only fallback is approved.

## Cross-Command Linkage

Every result must bind:

- output contract identity/version;
- source raw-completion fingerprint;
- source spawn fingerprint;
- session;
- purpose;
- platform;
- policy;
- executable;
- exact argv;
- working-directory fingerprint;
- observation sequence identity;
- explicit fixture evidence timestamp copied from raw evidence;
- `authority:none`;
- `toctouEliminated:false`.

HEAD interpretation additionally binds object-format evidence. Root evidence later must match approved worktree path evidence. All observations in a future sequence must share session, worktree identity, policy identity, executable identity, and sequence identity.

Changing an earlier observation invalidates downstream aggregate evidence.

## Sequencing

Selected future sequencing model: Option C.

```text
root
  -> object format
  -> HEAD before
  -> branch
  -> status
  -> HEAD after
```

Reject if the two HEAD observations differ. Root may also be repeated later if a future TOCTOU review requires it, but Action 580 does not require a second root observation for the initial output-contract plan.

This sequence reduces obvious source-state drift but does not eliminate TOCTOU.

## Aggregate Evidence Design

A later pure aggregate contract should combine command-specific outputs into a closed, non-authoritative repository-observation result.

Suggested statuses:

- `observation_rejected`;
- `repository_identity_mismatch`;
- `head_changed_during_observation`;
- `detached_head`;
- `repository_dirty`;
- `repository_clean_and_stable`;
- `unsupported_object_format`.

Minimum fields:

- aggregate contract identity/version;
- sequence identity;
- root evidence fingerprint;
- object-format evidence fingerprint;
- HEAD-before fingerprint;
- branch evidence fingerprint;
- status evidence fingerprint;
- HEAD-after fingerprint;
- worktree path fingerprint;
- clean boolean or null;
- detached boolean or null;
- HEAD stable boolean or null;
- deterministic reason;
- `authority:none`;
- `runtimeActivated:false`;
- `repositoryReadAuthorityGranted:false`;
- `toctouEliminated:false`.

Action 580 does not implement this aggregate.

## Schema And Reason Models

Each command-specific contract must define:

- exact closed result union;
- accepted and rejected statuses;
- deterministic reason enum;
- validation precedence;
- accepted/rejected field consistency;
- source linkage;
- output fingerprints;
- no-authority posture.

Common reasons, narrowed per contract:

- `input_contract_rejected`;
- `input_identity_rejected`;
- `input_fingerprint_rejected`;
- `source_linkage_rejected`;
- `capability_rejected`;
- `argv_rejected`;
- `exit_state_rejected`;
- `signal_rejected`;
- `stderr_not_empty`;
- `output_overflow_rejected`;
- `invalid_encoding_rejected`;
- `malformed_output`;
- `unexpected_multiple_records`;
- `path_grammar_rejected`;
- `object_format_rejected`;
- `object_id_rejected`;
- `branch_ref_rejected`;
- `status_record_rejected`;
- `status_truncated`;
- `authority_rejected`;
- `runtime_claim_rejected`;
- `live_claim_rejected`;
- `toctou_claim_rejected`.

No free-form reasons are approved.

## Implementation-Order Comparison

| Option | Verdict |
| --- | --- |
| 1 - implement all five together | Rejected. The status parser is much larger and would make review too broad. |
| 2 - implement root, object-format, HEAD, and branch first; status separately | Selected. Establishes primitive/linkage shape while deferring path-byte complexity. |
| 3 - implement one at a time | Safe but slow and duplicates review ceremony. |
| 4 - implement status first | Rejected. Status has the highest parser and byte-safety risk. |

Recommended next Action:

Action 581 - Implement Pure Read-Only Git Root, Object-Format, HEAD, and Branch Observation Contracts.

## Compatibility-Baseline Impact

Output-contract planning should precede final compatibility derivation.

Feature-version requirements still need primary evidence for:

- `rev-parse --show-toplevel`;
- `rev-parse --show-object-format`;
- `rev-parse --verify HEAD`;
- `symbolic-ref --quiet --short`;
- porcelain v1 `-z`;
- `--untracked-files=all`;
- `--no-renames`;
- `--ignore-submodules=none`.

The likely strictest version floor may be `--show-object-format`, because SHA-256 repository support and object-format reporting are newer than the older root, symbolic-ref, and porcelain v1 features. Action 580 does not finalize a numeric baseline.

## Future Review Gates

1. Per-command necessity review.
2. Exact argv review.
3. Raw-completion input review.
4. Exit-code review.
5. Stderr review.
6. Output grammar review.
7. Encoding review.
8. Byte-limit review.
9. Path/ref/object-ID safety review.
10. Porcelain record review.
11. Cross-command linkage review.
12. Sequence/TOCTOU review.
13. Aggregate evidence review.
14. Fingerprint review.
15. Determinism/immutability review.
16. Authority/no-runtime review.
17. Export-surface review.
18. Runtime-reachability review.
19. Independent static security review.
20. Remediation and final re-review.
21. Separate runner planning.
22. Separate runtime activation approval.
23. Separate deployment approval.

## Non-Authorizations

Action 580 grants no process execution authority, repository-read authority, filesystem authority, mutation authority, compatibility authority, runtime authority, staging authority, deployment authority, credential authority, network authority, API/UI/runner authority, Avanza/trading authority, persistence authority, order behavior, position behavior, or settlement behavior.

## Decision

Decision: `post_trade_read_only_git_observation_output_contracts_plan_ready`

Result status: `post_trade_read_only_git_observation_output_action_580_planning_gate_completed`

Recommended next Action: Action 581 - Implement Pure Read-Only Git Root, Object-Format, HEAD, and Branch Observation Contracts.

## Commit / Deploy

No deploy is recommended for Action 580. No commit, push, merge, or deploy occurred.
