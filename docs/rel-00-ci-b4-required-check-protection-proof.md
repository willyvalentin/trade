# REL-00 CI-B4 — source-only required-check and branch-protection proof contract

## Bounded objective

CI-B4 freezes a pure contract for a future, authenticated readback of the
protected `main` required check and branch-protection profile. It does not
perform that readback. Its only positive result is
`contract_only_fresh_readback_required`, which is an explicit statement that a
new readback is still necessary; it is not evidence that external state is
currently verified.

The implementation has no GitHub client, Git, filesystem, process, network,
token, environment, selector, test-plan, workflow, required-check,
branch-protection, merge, deployment or runtime behavior. Every invalid,
incomplete, changed or hostile proposed contract returns broad containment.

## Frozen profile

The future proof must bind `willyvalentin/trade` `main` to the unchanged
`.github/workflows/milestone-a-ci.yml` blob
`29969e9dba4c909ae9b4695b2cd90725b0569e0e` and SHA-256
`f41f286a04b0027438aa328afe118ab6a0b8287c609807fc919c9a8ab6cf7bb5`.
It preserves all six Full-CI shardar and the one protected aggregate
`provider-free-verification` from GitHub Actions app `15368`.

Its branch profile requires strict checks; exactly that context/app binding;
PR enforcement and admin enforcement; zero required approvals with the
existing stale-review profile; resolved conversations; no force-pushes or
deletions; no linear-history or branch-lock transition; and no rulesets. An
unknown or nonempty ruleset is containment, not an equivalence claim.

## Future readback protocol

An independently authorized, least-privileged reader must obtain all values
fresh in one bounded session. It reads branch, protection,
required-status-checks and rulesets before and after its other observations;
it also reads the open Ready PR before and after. The repository, `main`, PR
state, base SHA and head SHA must be identical in both observations.

While that PR remains open, it binds `refs/pull/{pr_number}/merge`, candidate
SHA/tree and ordered parents `[base, head]`, then the workflow path/blob at the
candidate. It binds the contemporaneous POC candidate identity to one exact
Actions run, run attempt, check suite and job IDs. Each of the six shard jobs
and the aggregate must occur exactly once and be literally
`completed/success`, with the exact PR head and GitHub Actions application.
A rerun, duplicate, pagination uncertainty, missing field, neutral, skipped,
cancelled, timed-out, stale or merge-queue result is broad containment.

Candidate-SHA check-run lookup is deliberately not a proof source. GitHub's
synthetic merge candidate can have no check runs even while the PR-head run is
valid. A name-only aggregate selection is also unsafe because historical PR
heads can retain stale checks with the same name. The later readback therefore
must bind PR head SHA + run ID + attempt + check suite + job ID/details URL.

## Deliberate non-activation

CI-B4 grants no `external_state_verified`, activation, selector, execution
plan or mergeability authority. It does not alter the Draft selector, workflow
or branch protection, and does not authorize CI deduplication. Existing
Ready/main six-shard Full CI and Netlify behavior remain unchanged.

The current workflow token cannot prove the protected policy because that
readback normally requires `Administration:read`, beyond the preserved
workflow permissions. CI-B7 remains the separately authorized policy decision
after a fresh authorized readback, and CI-B8 remains the required observation
window. No staging, secret, identity, provider, broker, deployment or
production authority is created here.
