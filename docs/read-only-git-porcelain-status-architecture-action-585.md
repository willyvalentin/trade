# Action 585 - Read-Only Git Porcelain Status Architecture

## Architecture Decision

Use a separate pure, fixture-only, byte-oriented porcelain-status completion-input contract before implementing a status parser.

Selected next implementation:

Action 586 - Implement Pure Byte-Oriented Porcelain Status Completion Input Contract.

Rationale:

- porcelain `-z` output is byte-oriented and may contain invalid UTF-8 path bytes;
- the Action 581 simple-observation completion contract is intentionally text-oriented and excludes status;
- status parsing has non-trivial NUL framing, XY grammar, privacy, and aggregate-summary requirements;
- separating byte completion evidence from parser interpretation keeps review boundaries smaller.

## Current Chain Position

Approved simple-observation contracts:

```text
repository root
  -> object format
  -> HEAD object ID
  -> branch/detached state
```

Planned future sequence:

```text
repository root
  -> object format
  -> HEAD before
  -> branch/detached state
  -> porcelain status
  -> HEAD after
  -> future aggregate observation contract
```

Porcelain status is not implemented in the Action 581-584 simple-observation package. No Action 585 runner or runtime caller is added or authorized. Static review found pre-existing dormant migration-preflight porcelain-status references; they remain unmodified, do not implement the exact planned `-z` tuple, and are not an Action 585 activation path. No aggregate repository eligibility contract exists. No compatibility decision exists.

## Exact Boundary Split

### Future Action 586 Boundary

Pure byte-oriented completion input only:

- exact capability `git_porcelain_status_v1`;
- exact argv `["status", "--porcelain=v1", "-z", "--untracked-files=all", "--no-renames", "--ignore-submodules=none"]`;
- exact lifecycle, exit, stderr, overflow, retry/fallback, authority, runtime, credential, network, and TOCTOU posture;
- byte-preserving `stdoutBytesHex`;
- empty `stderrBytesHex`;
- source spawn/session/purpose/platform/policy/worktree/sequence linkage;
- deterministic fingerprints;
- no parser summary.

### Later Parser Boundary

Pure porcelain status parser:

- consumes only accepted byte-oriented status completion evidence;
- validates NUL framing and XY grammar;
- rejects rename/copy, ignored, malformed, unsupported, truncated, oversized, or authority-bearing evidence;
- produces clean/dirty summary, ordered record fingerprints, and privacy-preserving path fingerprints.

### Future Aggregate Boundary

Aggregate observation evidence:

- links root, object-format, HEAD-before, branch, status, and HEAD-after;
- evaluates root match, HEAD stability, clean/dirty state, detached policy, and sequence consistency;
- grants no runtime, compatibility, staging, deployment, or repository-read authority.

## Byte Representation

Selected representation:

```text
stdoutBytesHex: lowercase even-length hex
stdoutByteCount: exact byte length
stderrBytesHex: ""
stderrByteCount: 0
```

Reasons:

- lossless for invalid UTF-8;
- deterministic canonicalization;
- no replacement decoding;
- easy byte-count verification;
- simple fixture construction;
- does not expose plaintext pathnames by default in interpreted output.

Rejected representations:

- JavaScript UTF-8 string;
- arbitrary byte arrays without a strict canonical form;
- base64 with padding/case ambiguity;
- counts-only parser input.

## Grammar Summary

Accepted clean output:

```text
<empty byte sequence>
```

Tracked/untracked non-rename record:

```text
X Y SP PATH NUL
```

Accepted initial families:

- tracked non-conflict statuses using X/Y from the documented short-status matrix, excluding clean both-space records;
- untracked `??`;
- unmerged `DD`, `AU`, `UD`, `UA`, `DU`, `AA`, `UU`.

Rejected:

- rename/copy `R` or `C` because `--no-renames` is required;
- ignored `!!` because `--ignored` is absent;
- records needing two pathnames;
- missing NUL on non-empty output;
- empty paths;
- malformed prefixes;
- unsupported XY combinations.

## Privacy Model

Parser input may inspect exact path bytes. Final interpreted evidence should not retain plaintext path bytes.

Retain:

- status code;
- path byte length;
- per-path byte fingerprint if record summaries are retained;
- ordered record fingerprints;
- aggregate path-list fingerprint;
- counts and status-code breakdown.

Do not retain:

- decoded filename;
- path byte string;
- path byte hex;
- raw output bytes in accepted parser result.

## Limits

Initial limits:

- raw stdout: 65536 bytes;
- record count: 2048;
- per-path bytes: 4096;
- cumulative path bytes: 65536;
- stderr: 0 bytes.

No truncation, repair, fallback, or count-only accepted result is allowed.

## Authority Posture

All current and planned results must preserve:

- `observedLiveProcess:false`;
- `repositoryReadAuthorityGranted:false`;
- `processAuthorityGranted:false`;
- `observerAuthorityGranted:false`;
- `cliExecutionAuthorityGranted:false`;
- `compatibilityAuthorityGranted:false`;
- `runtimeAuthorityGranted:false`;
- `stagingAuthorityGranted:false`;
- `deploymentAuthorityGranted:false`;
- `credentialAuthorityGranted:false`;
- `networkAuthorityGranted:false`;
- `mutationAuthorityGranted:false`;
- `authorizationConsumed:false`;
- `runtimeActivated:false`;
- `toctouEliminated:false`;
- `authority:none`.

Accepted fixture bytes do not prove current repository state and do not authorize later actions.

## Live Infrastructure Implications

No current live infrastructure is modified by Action 585.

Before any live status observation, a separate plan must address:

- byte-preserving spawn capture;
- invalid UTF-8 retention;
- overflow and truncation reporting;
- stream chunk neutrality;
- one-shot neutralization of byte evidence;
- no replacement decoding;
- no runner activation.

## Implementation Option Decision

Selected:

Option B - implement byte-oriented porcelain completion-input contract first, then implement the parser in a later separately reviewed Action.

Rejected:

- Option A for combining too much into one review;
- Option C for losing invalid path bytes;
- Option D for premature live runner coupling.

## Non-Authorizations

This architecture does not authorize Git repository inspection, process creation or observation, repository-read authority, porcelain-status parser implementation, runner implementation, compatibility decisions, runtime/API/UI/runner activation, credentials, environment or network access, Avanza/trading behavior, persistence, deployment, commit, push, merge, or deploy. Pre-existing dormant migration-preflight porcelain-status references remain unmodified and are not an Action 585 activation path.
