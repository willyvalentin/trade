# Action 635 - Verify Authenticated GitHub And Netlify Release Controls

## Decision

`sha_preserving_release_blocked_by_missing_authenticated_release_metadata`

Action 635 made only read-only control-plane checks. It did not merge PR #35,
update a ref, deploy, change an environment value, apply a migration, or invoke
any reconciliation, provider, scheduled, canary, or production mutation path.

## Authentication Contexts

- The GitHub connector is authenticated enough to create and inspect PR metadata,
  review threads, and pull-request workflow runs.
- It does not expose authenticated branch-protection or repository-ruleset reads.
- The public GitHub branch-protection endpoint correctly returned an
  authentication-required result.
- No `GITHUB_TOKEN`, `GH_TOKEN`, `NETLIFY_AUTH_TOKEN`, or `NETLIFY_SITE_ID` is
  present in this execution environment. Values were never read or recorded.
- No authenticated Netlify control plane is available in this session.

## Candidate And PR State

- Candidate: `6705a3261c0c68ece64476a4d137f8a5862379a7`.
- Production branch: `main` at `1182f172fc85c0bf38e4b49adbf36ec4358ad6fe`.
- The candidate parent and merge base both equal the current production head.
- PR #35 remains open and points to the candidate with one release commit.
- No PR workflow runs or review threads were reported by the connector.

## Control Findings

| Control | Result |
| --- | --- |
| GitHub branch protection / rulesets | Unavailable without authenticated administrative metadata. |
| Required checks / PR merge requirement | Unverified. |
| Non-force ref-update permission | Unverified; no bypass is permitted. |
| Netlify production branch and Git trigger | Unverified. |
| Single-deploy behavior | Unverified. |
| Environment-update behavior | Unverified. |
| Canonical runtime SHA for a candidate branch update | Unverified. |

Accordingly, no safe conclusion can be drawn about whether a direct non-force
fast-forward is allowed, whether it would bypass a PR rule, or whether it would
produce exactly one Netlify production deploy of the candidate SHA.

## Modeled Release Gate

The pure release evaluator now distinguishes missing GitHub metadata, missing
Netlify metadata, PR-merge requirements, required-check failures, branch-policy
blocks, production-branch mismatch, multi-deploy risk, and environment updates that
would create a second deploy. It remains fail-closed and performs no release.

## Future Operator Runbook

An authenticated administrator must read, without mutation:

1. Effective `main` branch protection and rulesets, including PR, check, queue,
   bypass, force-push, and direct-push policy.
2. Required-check status for PR #35 and whether it remains valid for an exact
   non-force ref update.
3. Netlify production branch, auto-build/auto-publish trigger, pending deploys,
   deploy hooks, retries, and environment-update deployment behavior.
4. The exact assertion configuration scope and proof that setting the assertion to
   the candidate does not itself create a deployment.

Only if those reads prove a non-force fast-forward is policy-compliant, auditable,
and produces one deploy of `6705a3261c0c68ece64476a4d137f8a5862379a7` may a later
Action 633 continuation seek separate explicit approval for the immutable ref update.
That later action must recheck the current `main` head, PR head, ancestry, checks,
assertion, and deploy-in-progress state immediately before its one write.

## Non-Goals And Continuation

No deployment assertion was changed and PR #35 remains unmerged. The production
reconciliation remains a later separately approved **Action 636 - Execute One
Authorized Historical Usage Reconciliation**. The recommended next step is to
provide an authenticated read-only GitHub administrative session and an authenticated
read-only Netlify control-plane session, then repeat this evidence collection.
