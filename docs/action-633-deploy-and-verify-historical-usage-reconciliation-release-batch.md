# Action 633 - Deploy And Verify Historical Usage Reconciliation Release Batch

## Decision

`historical_usage_reconciliation_release_blocked_by_deployment_configuration`

Action 633 stopped before merge and deployment. The release is validated and gated in
PR #35, but the exact production deployment-identity assertion cannot be set in this
execution environment before the one permitted Git-triggered production deployment.

## Approval Scope And Boundary

The authorized release scope was Actions 626 through 632. It deploys capability and
schema only; it does not authorize historical reconciliation. In particular, this
action did not call `ci_hur_issue` or `ci_hur_reconcile`, issue a reconciliation
authorization, create a reconciliation record or audit, call a provider, run a
scheduled dry-run/live-shadow, or alter canary, kill-switch, or schedule state.

## Git And Release Gate

- Source branch: `codex/actions-572-574-durable-audit-credit-ledger-shadow-canary`.
- Source checkpoint for Action 632: `0d244a7` (`Prepare historical usage
  reconciliation production readiness`).
- Production base at release construction: `origin/main` `1182f172fc85c0bf38e4b49adbf36ec4358ad6fe`.
- Clean release commit: `6705a3261c0c68ece64476a4d137f8a5862379a7`
  (`Deploy historical usage reconciliation release batch`).
- Release branch: `release/action-633-historical-usage-reconciliation`.
- PR: #35, open, base `main`, one commit, 28 changed files.

The clean candidate contains the Actions 626--632 implementation, documentation,
tests, and exactly one migration:
`20260723002000_create_historical_usage_reconciliation_persistence.sql`.
It excludes `deno.lock`, credentials, Docker artifacts, and unrelated release files.

## Candidate Validation

The exact clean candidate passed:

- `npx next typegen`
- `npx tsc --noEmit`
- scoped ESLint
- focused Actions 618--632 Playwright coverage: 68 passed
- `npm run build`
- `git diff --check`

The migration and isolated PostgreSQL acceptance are part of the reviewed batch;
no production migration was attempted here.

## Deployment Identity Blocker

The release requires `TURE_CONTINUOUS_INTELLIGENCE_DEPLOYMENT_COMMIT` to equal the
canonical full deployed SHA. The candidate is based directly on the production base,
so a rebase merge can preserve the exact release SHA
`6705a3261c0c68ece64476a4d137f8a5862379a7` for the one deploy.

This session has no authenticated Netlify configuration surface or non-secret
automation credential capable of setting the production assertion before merge.
Merging first would trigger the single approved deployment while retaining an
unverified or stale assertion, which the release contract defines as a hard
`deployment_configuration_conflict`. Action 633 therefore did not merge PR #35,
did not trigger a deployment, and did not attempt the migration.

## Production Verification Status

Not run because the release has not deployed. Consequently, the following remain
unverified for this release and must be read back only after the assertion is set and
the one Git-triggered deploy completes:

- migration registration and `ci_hur_*` schema/RPC catalog;
- service-role-only grants, RLS, append-only protections, and adapter signatures;
- empty reconciliation authorization/record/audit state;
- Action 609 target pre-state `2 / 1 / 0 / 1` and fail-closed disagreement;
- exact runtime platform SHA, assertion SHA, and deployed manifest identity;
- scheduled execution, canary, kill switch, and schedule safe defaults.

No production repair occurred, and Action 634 is not authorized by this result.

## Required Continuation

1. Use the authenticated Netlify production configuration surface to set
   `TURE_CONTINUOUS_INTELLIGENCE_DEPLOYMENT_COMMIT` to the full release SHA
   `6705a3261c0c68ece64476a4d137f8a5862379a7` in the production context.
2. Confirm the PR can use rebase merge so that exact SHA is the deployed revision.
3. Merge PR #35 once, allowing only the Git-triggered Netlify deployment.
4. Apply the single approved migration through the established production migration
   process, then perform the Action 633 read-only verification. Do not run either
   reconciliation RPC during that verification.

## Final Assessment

The release candidate and PR are ready, but production deployment is intentionally
blocked before the single deploy rather than consuming it with an identity mismatch.

## Resume After External Configuration Remediation

The operator reported that the production assertion had been configured to the
release SHA. The release-side evidence was rechecked without deploying:

- PR #35 remains open and points to
  `6705a3261c0c68ece64476a4d137f8a5862379a7`.
- The PR has one release commit and the same 28-file scoped delta; `deno.lock` is
  absent.
- The candidate is a direct child of the current production base
  `1182f172fc85c0bf38e4b49adbf36ec4358ad6fe`.
- No PR review thread or pull-request workflow run was reported by the available
  GitHub evidence.

The required identity-preserving merge proof failed safely. A direct Git
fast-forward would preserve the candidate SHA, but the available GitHub PR merge
methods are `merge`, `squash`, and `rebase`. A merge or squash necessarily creates
a new SHA; rebase is not a demonstrated SHA-preserving operation and the approved
procedure requires stopping if it could replay to a new SHA. Therefore no merge was
attempted and no deployment was triggered.

The externally remediated assertion cannot be verified from production runtime
evidence until a deploy exists. Starting that deploy through a merge method that
changes the candidate identity would knowingly invalidate its assertion. This is a
release-system limitation, not a schema, migration, reconciliation, or runtime
safety failure.

### Required New Explicit Decision

Choose one release procedure that supplies an assertion for the *actual* resulting
commit before its only production deploy, for example an approved direct
fast-forward release process or a new identity configuration procedure for the PR
merge result. Do not merge PR #35 under the current SHA-bound assertion.

### Resume Decision

`release_commit_identity_would_change_before_deployment`

No migration, reconciliation authorization, reconciliation record/audit, provider
call, scheduled execution, flag change, or production deployment occurred during
the resumed verification.
