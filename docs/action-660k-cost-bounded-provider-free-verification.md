# Action 660K — cost-bounded provider-free verification

Status: **Ready-gated CI cost-control candidate; the protected full check is
never satisfied by Draft verification**.

The frozen baseline is protected `main`
`466e95318a6feb1418ec60bfced98703183ccc54`, tree
`cdd83c876aee0096fd7d903c20e8e3b7ef4f6d82`, after the ordinary merge of PR
#121. Push-triggered exact-main run `32359092838` completed successfully with
all six Action 660J shards, the exact protected aggregate and every clean-tree
step green.

`production_deployment_authority:false`

## Observed cost problem

GitHub billing readback for 2026-08-19 showed 15 workflow runs, 105 runner
jobs and 1,825 rounded billable Ubuntu minutes, approximately USD 10.95 at the
published USD 0.006/minute two-core Linux rate. Four cancelled runs still
consumed 403 rounded minutes (approximately USD 2.42). Five exact-main runs
consumed 640 rounded minutes (approximately USD 3.84). The operator raised the
Actions budget ceiling to USD 30 but explicitly requested lower recurring
spend; the ceiling is not a spending target.

## Closed scheduling model

The workflow keeps the same strict GitHub Actions check identity
`provider-free-verification` from app `15368` and does not change branch
protection.

While a pull request is Draft:

1. `draft-provider-free-verification` checks out the exact Draft head;
2. it runs lint, TypeScript and the complete browser/server containment group;
3. it additionally runs every registered Action 660J command group containing
   a test changed between the pull request merge base and exact head;
4. it proves tracked source is unchanged; and
5. the six-shard job is skipped, so the protected aggregate receives
   `SHARD_RESULT=skipped` and fails closed.

The Draft check has a distinct non-protected name. It cannot produce, replace,
skip or satisfy the protected check. Converting a pull request to Draft starts
this route and cancels an in-progress full run for the same pull request.

When a pull request becomes Ready, or a new commit is pushed while it remains
Ready, the full six-shard Action 660J matrix starts automatically on the exact
head. The Draft job is skipped. The protected aggregate succeeds only when the
complete matrix result is exactly `success`.

Every push to `main` continues to run the full six-shard matrix and protected
aggregate on exact `github.sha`. No Draft path exists for `main`.

Workflow concurrency is keyed by the pull-request number for pull-request
events and by exact `github.sha` for `main` pushes. `cancel-in-progress:true`
therefore cancels stale Draft/Ready work only within the same pull request.
Every distinct `main` SHA has a distinct concurrency group, so a later merge or
push cannot cancel or replace an earlier exact-main full run before all six
shards and its protected aggregate have completed.

The full matrix retains `fail-fast:false`, so every one of the six required
shards runs to completion on Ready heads and `main`, even after an early shard
failure. `always()` still runs the protected aggregate and requires the matrix
result to equal `success`. Failure, cancellation, timeout, skipped work or an
incomplete matrix therefore remains non-successful and cannot authorize merge.
Cost control comes from withholding the full matrix on Draft pushes, never from
reducing a required full run.

## Draft selector boundary

The Draft runner accepts only two lowercase 40-character Git SHAs and requires
the checked-out `HEAD` to equal the expected head. It resolves a merge base via
`git` with `shell:false`, reads only `ACMR` changed paths and selects commands
from Action 660J's tracked static plan. It does not invent commands, use a
shell, fetch provider data, read secrets or mutate tracked source.

The always-run set is exactly:

- `Lint`;
- `TypeScript`; and
- `Browser and server containment`.

Additional selection occurs only when a changed test path is an exact member
of a registered Action 660J command. A command is selected at most once and
retains its original runner, arguments, `--workers=1` and React Server
condition. This is fast feedback, not delivery authority; final Ready-head and
exact-main full CI remain mandatory.

## Delivery condition

This candidate is incomplete until its exact final head has:

- a green Draft quick job while the protected aggregate demonstrably fails on
  Draft because the full matrix is skipped;
- an automatic Ready transition that runs all six shards and produces a green
  protected aggregate on the same exact head;
- independent read-only review with no blocking finding;
- explicit operator approval naming the exact PR and head;
- an ordinary protected merge with no unexpected tree delta; and
- green push-triggered exact-main full CI.

If any scheduling, event, job-name, exact-SHA, selector, aggregate or
branch-protection invariant is not proven, delivery remains blocked.

## Scope limits

Action 660K changes only provider-free GitHub Actions scheduling, its local
Draft selector, registration/oracles and governance documentation. It performs
no application runtime, Supabase/database/Auth, Netlify configuration,
provider data, broker, execution, training, promotion or production-deployment
mutation. Production deployment is neither required nor authorized.
