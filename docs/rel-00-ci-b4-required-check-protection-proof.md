# REL-00 CI-B4 — source-only required-check and branch-protection proof contract

## Bounded objective

CI-B4 v3 freezes a pure contract for a future, authenticated readback of the
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

An independently authorized, least-privileged observer must obtain all values
fresh in one bounded logical session. The normal path remains one source using
the individual `GET /repos/{owner}/{repo}/check-runs/{check_run_id}` endpoint,
where `check_run_id` is parsed from the bound attempt job's `check_run_url`.
The v3 fallback is deliberately narrower: it is available only after the
`Administration:read` policy source records a `403` from that endpoint for one
attempt-job-bound check run, and it then uses exactly one check-run evidence
source for every target job.

The fallback permits two explicitly labelled, GET-only sources without
claiming that the collection source's underlying scope can be introspected.
The policy source is authoritative only for the branch, protection,
required-status-checks, rulesets and Ready-PR before/after reads. The
collection source independently reads the Ready PR before and after, candidate,
workflow, run, attempt, jobs, artifact and the check-run collection. Both
sources must observe the same repository, open Ready PR number, base SHA and
head SHA before and after; the policy source's `main` must equal that PR base.
Any source mismatch, source-label omission or state drift is broad containment.

While that PR remains open, the collection source binds
`refs/pull/{pr_number}/merge`, candidate SHA/tree and ordered parents
`[base, head]`, then the workflow path/blob at the candidate. It binds the
contemporaneous POC candidate identity to one exact Actions run, **attempt 1**,
check suite and job IDs. The attempt-jobs listing is first-page
`per_page=100&page=1` and must be complete. A rerun, duplicate, pagination
uncertainty, missing field, neutral, skipped, cancelled, timed-out, stale or
merge-queue result is broad containment.

The sole collection fallback is
`GET /repos/{owner}/{repo}/commits/{pr_head_sha}/check-runs?filter=all&per_page=100&page=1`.
Its `pr_head_sha` is the exact Ready-PR head, never candidate SHA, `main` or a
branch ref. It must return HTTP 200 with an integer `total_count` at most 100
and exactly that many returned records. Non-target records are allowed only as
counted records; they cannot satisfy a target. `filter=all` prevents a latest-
only response from hiding a rerun or duplicate.

For each six-shard check-run name and `provider-free-verification`, exactly one
collection record of that name must exist **within the bound run's
check-suite**, and it must be `completed/success`, have that PR head, the bound
check-suite, GitHub Actions app `15368` / `github-actions`, and be linked to
its exact attempt job. Records with a target name in a different check-suite
remain counted but can never satisfy a target; duplicate target records within
the bound check-suite are containment. The link is two-sided:
`attempt_job.check_run_url` equals the collection record's API URL,
`attempt_job.html_url` equals its exact canonical details URL
`https://github.com/{owner}/{repo}/actions/runs/{run_id}/job/{job_id}`, and
the collection record's `check_suite.id` equals the run's bound check-suite ID.
`check_run.id` and Actions `job.id` are never assumed equal. This fallback
proves only the current PR-head and bound run, never historical check suites.

Candidate-SHA check-run lookup is deliberately not a proof source. GitHub's
synthetic merge candidate can have no check runs even while the PR-head run is
valid. A name-only aggregate selection is also unsafe because historical PR
heads can retain stale checks with the same name.

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
