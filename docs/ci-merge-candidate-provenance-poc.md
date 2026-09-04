# Merge-candidate provenance and post-merge attestation

## Purpose

GitHub's `refs/pull/<number>/merge` candidate is the exact revision covered by
the required six-shard Ready CI. This attestation binds that successful candidate
to the merge commit that reaches protected `main`, so the same matrix is not run
a second time for an unchanged tree and workflow revision.

This does not authorize a merge by itself: the protected
`provider-free-verification` check remains the merge gate. A weekday scheduled
full CI run and a manual-dispatch route provide independent regression coverage
of `main` without adding merge-path latency.

## Candidate capture

For every non-Draft pull request that completes the six-shard
`provider-free-verification` matrix successfully, the workflow checks out
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
event. A capture failure never turns a failed matrix into a successful required
check and therefore cannot authorize the merge.

## Post-merge observation

After every `push` to `main`, a small attestation first asks GitHub for pull requests
associated with the main commit. If that endpoint returns no fully bound
merged PR, it separately examines the recent closed `main` PRs. Both paths
accept only the PR whose merge SHA, base SHA and head SHA exactly equal the
main merge commit and its two parents. The fallback is an observation-only
compatibility path for GitHub's incomplete commit-association response; it
cannot select a partial match.

It derives the only acceptable receipt name from the actual main commit's
first parent, second parent and tree SHA.

It reports `matched` only if all of the following hold:

1. the saved candidate receipt exists and its Full CI succeeded;
2. the main tree SHA equals the candidate tree SHA;
3. the main parent array equals the candidate parent array;
4. the workflow file blob on main equals the workflow file blob tested by the
   candidate; and
5. the main commit is the same two-parent merge represented by the candidate.

Any direct push, squash/rebase merge, changed PR head, changed base, changed
workflow, missing receipt, expired artifact, tree mismatch, parent mismatch or
API failure is reported as `mismatch_or_uncertain` or `uncertain_*`. These
states never claim candidate coverage; the next scheduled full CI is the
independent fallback.

An ordinary GitHub **Create a merge commit** merge is the only method eligible
to produce a `matched` POC observation. The repository's other permitted merge
methods are intentionally treated as uncertain rather than normalized or
silently accepted. This POC does not change the repository-level merge-method
configuration.

## Operational model

The Ready merge candidate is fully verified before it can satisfy the protected
check. The post-merge path is intentionally lightweight and retains provenance
for seven days. The full matrix runs on weekday schedule and can be started
manually through `workflow_dispatch`; it verifies the exact main revision that
GitHub selects for that run. This removes duplicate merge-path work while
retaining a recurring independent regression signal.
