# Action 580 - Read-Only Git Observation Output Architecture

## Architecture Decision

Use separate top-level pure output contracts for each command, with small shared primitive validators only when semantics are identical.

The five planned contracts are:

1. repository root output;
2. object-format output;
3. HEAD object-ID output;
4. branch/detached output;
5. porcelain status output.

No generic Git-output dispatcher is approved.

## Shared Primitive Candidates

Allowed shared primitives:

- exact optional single final LF normalizer for line outputs;
- ASCII enum validator;
- lowercase hex object-ID validator;
- narrow absolute POSIX path text validator;
- narrow branch-ref text validator;
- fixed SHA-256 fingerprint helper;
- deep-freeze helper.

Not approved as shared primitives:

- generic stdout parser;
- generic Git status parser;
- generic path parser with caller options;
- generic refname parser;
- semver/range parser;
- generic command-capability dispatcher.

## Contract Dependency Graph

```text
raw completion for root argv
  -> root output contract

raw completion for object-format argv
  -> object-format output contract
  -> HEAD output contract

raw completion for HEAD argv
  -> HEAD output contract

raw completion for symbolic-ref argv
  -> branch/detached output contract

raw completion for status argv
  -> porcelain status output contract

root + object-format + HEAD-before + branch + status + HEAD-after
  -> future aggregate observation contract
```

The HEAD contract depends on accepted object-format evidence from the same sequence. The aggregate contract depends on all command-specific outputs and rejects sequence, session, worktree, or HEAD drift.

## Raw-Completion Prerequisite

The current raw-completion evidence contract is not yet a repository-observation raw evidence contract. It is intentionally bound to Git version collection. Future implementation must first establish a safe raw-completion input shape for the five exact read-only Git tuples.

This prerequisite may be solved by:

- a versioned extension of the raw-completion contract with exact fixed argv identities; or
- command-specific raw wrappers that preserve source spawn fingerprints and output text/byte posture.

It must not be solved by weakening `git_version_argv_v1` or accepting arbitrary argv.

## Exit And Stderr Design

One generic exit-code model is rejected.

Command-specific accepted states:

- root: exit `0`, stderr empty;
- object-format: exit `0`, stderr empty;
- HEAD: exit `0`, stderr empty;
- branch: exit `0` attached or exit `1` detached, stderr empty;
- status: exit `0`, stderr empty.

All warnings, diagnostics, signal exits, stream errors, overflow, invalid encoding, retry, fallback, and termination claims reject.

## Output Privacy

Repository paths, branch names, and filenames can disclose local development structure. Planned retention:

- root: exact path may be retained inside pure evidence only until aggregate comparison; final runtime surfaces should prefer fingerprints/redacted classifications;
- branch: branch name may be retained only if future review approves it as non-sensitive enough for local evidence; otherwise retain fingerprint and policy classification;
- status: retain counts, class breakdown, and path-list fingerprint; do not expose filenames by default;
- HEAD: retain full object ID only if approved as source identity evidence; otherwise retain exact fingerprint and length/object-format summary.

No output contract may log stdout/stderr or error details.

## Porcelain Status Scope

The status contract is deferred because it must answer:

- whether invalid UTF-8 path bytes are unsupported or require byte-level raw evidence;
- whether path names are retained, fingerprinted, or discarded;
- how to classify unmerged records;
- how to handle submodule `M` with `--ignore-submodules=none`;
- whether rename/copy records are impossible with `--no-renames` or merely rejected if observed;
- whether ignored records are always rejected because `--ignored` is absent;
- how record count and byte limits interact.

The first implementation should not include status unless these questions are fully resolved.

## Sequence And Aggregate Design

The future aggregate observation should use:

```text
root -> object format -> HEAD-before -> branch -> status -> HEAD-after
```

The aggregate should reject if:

- root does not match approved worktree identity;
- object format is unsupported;
- HEAD-before and HEAD-after differ;
- branch is detached when an attached branch is required;
- status is dirty;
- status contains unmerged/conflict records;
- any command-specific result is rejected or ambiguous;
- session, sequence, worktree, policy, executable, or argv linkage mismatches.

Aggregate success remains non-authoritative. It does not authorize runtime activation or deployment.

## Implementation Order

Selected implementation order:

1. Implement root, object-format, HEAD, and branch output contracts together.
2. Static/security review those four contracts.
3. Remediate and re-review as needed.
4. Plan/implement porcelain status separately.
5. Plan aggregate observation evidence.
6. Only then resume compatibility-baseline derivation.

This keeps the first implementation reviewable while establishing enough shared primitives and linkage rules for later status parsing.

## Compatibility Notes

The output-contract plan does not select a numeric Git baseline.

Known future evidence needs:

- earliest supported `--show-object-format`;
- current and historical behavior of `symbolic-ref --quiet --short HEAD` exit `1` for detached HEAD and `128` for other errors;
- porcelain v1 `-z` stability and status-code grammar;
- support/version posture for `--no-renames` and `--ignore-submodules=none`;
- Apple `/usr/bin/git` package/build posture if compatibility policy binds Apple provenance.

## Explicit Non-Authorizations

No Git command execution, repository inspection, output parser implementation, compatibility evaluation, production policy module, runtime/API/UI/runner wiring, credential/environment/network access, Avanza/trading behavior, persistence, deployment, commit, push, merge, or deploy is authorized.
