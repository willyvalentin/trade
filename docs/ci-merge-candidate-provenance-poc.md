# Merge-candidate provenance POC

## Purpose

This POC measures whether GitHub's `refs/pull/<number>/merge` candidate can
later be bound to the commit that reaches protected `main`. It is evidence
collection only. It does not reduce, skip, replace, or authorize any existing
Full CI, required check, branch-protection rule, Draft-CI check, Netlify check,
or deployment gate.

## Candidate capture

For every non-Draft pull request that completes the unchanged six-shard
`provider-free-verification` matrix successfully, the POC checks out
`github.sha`. For a `pull_request` event, GitHub provides that SHA on its
synthetic `refs/pull/<number>/merge` ref.

The candidate receipt records only non-secret identifiers:

- PR number, base SHA and head SHA;
- candidate SHA, tree SHA and both parent SHAs;
- workflow commit SHA and the workflow file blob SHA;
- successful Full-CI run ID, attempt, each shard conclusion and duration; and
- a deterministic artifact name containing the PR, base, head and tree IDs.

The capture refuses a candidate whose checked-out SHA, merge ref, parents,
workflow identity, six-shard set or shard outcomes do not exactly match the
event. Such a capture failure cannot weaken the existing protected aggregate;
the normal post-merge exact-main Full CI still runs.

## Post-merge observation

After every `push` to `main`, the existing six-shard Full CI runs first and is
not conditional on this POC. The POC then attempts to find a merged PR whose
merge commit has exactly two parents. It derives the only acceptable receipt
name from the actual main commit's first parent, second parent and tree SHA.

It reports `matched` only if all of the following hold:

1. the saved candidate receipt exists and its Full CI succeeded;
2. the main tree SHA equals the candidate tree SHA;
3. the main parent array equals the candidate parent array;
4. the workflow file blob on main equals the workflow file blob tested by the
   candidate; and
5. the unchanged exact-main aggregate succeeded.

Any direct push, squash/rebase merge, changed PR head, changed base, changed
workflow, missing receipt, expired artifact, tree mismatch, parent mismatch,
API failure or failed exact-main run is reported as `mismatch_or_uncertain` or
`uncertain_*`. During the POC those states have no cost-saving effect because
Full exact-main CI has already run.

An ordinary GitHub **Create a merge commit** merge is the only method eligible
to produce a `matched` POC observation. The repository's other permitted merge
methods are intentionally treated as uncertain rather than normalized or
silently accepted. This POC does not change the repository-level merge-method
configuration.

## Required evidence before considering deduplication

No later proposal may reduce exact-main Full CI until several ordinary
protected merge-commit merges have produced `matched` receipts and separate
controlled observations have shown the fail-closed states for head change,
base change, competing PRs, non-merge methods, workflow drift and missing
provenance. The final evidence must include runner durations from both the
candidate and exact-main six-shard runs.
