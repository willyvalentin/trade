# Action 634 - Establish SHA-Preserving Production Release Path

## Decision

`sha_preserving_production_release_path_unavailable`

Action 634 is read-only. It does not merge PR #35, update `main`, deploy, apply a
migration, or invoke any reconciliation, provider, scheduled, or canary path.

## Verified Commit Graph

- Production branch: `main`.
- Current production head: `1182f172fc85c0bf38e4b49adbf36ec4358ad6fe`.
- Candidate and PR #35 head: `6705a3261c0c68ece64476a4d137f8a5862379a7`.
- Candidate parent and merge base are both the current production head.
- The candidate is a direct child and fast-forward descendant of `main`; its
  28-file scope excludes `deno.lock`.

## PR And Repository Evidence

PR #35 remains open with one release commit and no reported review threads or
pull-request workflow runs. Public GitHub branch-protection metadata returned an
authentication-required response. The available connector exposes a ref-update
operation but does not provide authorized branch-protection or ruleset metadata.
Action 634 cannot prove that a direct ref update would respect required checks,
protection, rulesets, or deployment policy.

## Evaluated Paths

| Path | SHA-preserving | Decision |
| --- | --- | --- |
| GitHub merge / squash | No | Rejected: creates a new commit SHA. |
| GitHub rebase merge | Not proven | Rejected: may replay commits to a new SHA. |
| Direct non-force fast-forward | Yes, if allowed | Preferred future path, pending policy proof and approval. |
| GitHub ref update with `force: false` | Yes, if allowed | Equivalent preferred path, pending policy proof and approval. |
| Temporary production branch / manual deploy | Unknown | Rejected pending a single-deploy and canonical-SHA proof. |
| Assertion for a future merge SHA | Not applicable | Rejected: the resulting SHA cannot be safely bound before deploy. |

## Required Future Operator Procedure

After an authenticated administrator has verified branch protection, rulesets,
required checks, Netlify's production branch, and its one-deploy trigger:

1. Confirm `main` is still `1182f172fc85c0bf38e4b49adbf36ec4358ad6fe`.
2. Confirm PR #35 still points to `6705a3261c0c68ece64476a4d137f8a5862379a7`.
3. Confirm the candidate's sole parent is the current `main` head.
4. Confirm the production assertion equals the candidate full SHA.
5. Confirm no deploy is running and a non-force fast-forward triggers one deploy.
6. Obtain separate explicit approval for the production branch write.
7. Perform one compare-and-swap-like, non-force ref update:

   ```bash
   git push origin 6705a3261c0c68ece64476a4d137f8a5862379a7:refs/heads/main
   ```

8. Verify `main` equals that SHA, observe one deploy, and resume Action 633's
   read-only deployment and schema verification.
9. Close PR #35 as incorporated with a release comment referencing the exact SHA;
   never merge the PR afterward.

The command is intentionally not run by Action 634. It has no force flag, wildcard,
or mutable local branch reference. A remote-head change, candidate-head change,
scope drift, missing checks, failed branch-policy proof, assertion mismatch, active
deploy, or uncertain Netlify trigger is an immediate stop condition.

## Netlify And Audit Gates

Netlify's authenticated configuration and deploy metadata are not available to this
session. The production-branch trigger, auto-publish/lock behavior, deploy identity,
and runtime `COMMIT_REF`/`NETLIFY_COMMIT_REF` must be checked before the future ref
update. No deployment is used as a test.

Required evidence: old/new branch SHA, PR state, required-check state, branch-rule
decision, assertion SHA, Netlify deploy ID/status, migration outcome, and Action 633
read-only results. This preserves the PR review trail without a second release via
its merge button.

## Pure Gate

`evaluateContinuousIntelligenceShaPreservingProductionReleasePath` is deliberately
pure and always reports no production mutation. It requires a direct-child candidate,
allowed non-force ref update, passed checks, matching assertion, verified
single-deploy trigger, and explicit branch-write approval before it can model release
availability.

## Continuation

Obtain authenticated GitHub branch-policy/ruleset and Netlify production-trigger
evidence. If both are positive, reopen Action 633 with separate approval for one
non-force ref update. The repair is renumbered to **Action 635 - Execute One
Authorized Historical Usage Reconciliation** and remains separately approved.
