# Action 660H — manual MA13 merge control

Status: **governance-only delivery candidate; accepted manual compensation,
not technical branch protection and not Milestone A completion**.

Observed on 2026-08-12 against GitHub `main` commit
`7662d3f863f8f921b816670363431df8e1ebcdea`, tree
`86a59f234b69e63b07a60833224015018be41568`, after the ordinary merge of PR
#99. Exact-main Milestone A CI run `31543202986` completed successfully for
that commit.

`roadmap_completion_authority:false`

## Decision and current GitHub boundary

The operator chose to keep `willyvalentin/trade` private on GitHub Free and to
continue without GitHub Pro. No billing, plan or repository-visibility change
was made.

Fresh authenticated readback produced the following results:

- `GET /repos/willyvalentin/trade/branches/main/protection`: HTTP 403 with the
  requirement to upgrade to GitHub Pro or make the repository public;
- `GET /repos/willyvalentin/trade/rulesets`: the same HTTP 403 plan boundary;
- GraphQL `branchProtectionRules.totalCount`: `0`; and
- repository visibility: `private`.

The earlier `unknown_current` classification is therefore resolved. MA13 is a
known technical gap with an explicitly accepted manual compensating control.
It is not `verified_current`, receives no gate credit, and leaves Milestone A
at **14/15 = 93.3%**.

## Mandatory manual control

Every future `main` mover must complete this sequence.

### Before merge

1. `[PRE-01: dedicated_branch_from_current_main]` Start from the current
   immutable `main` commit on a dedicated branch.
2. `[PRE-02: draft_until_bounded_scope_frozen]` Keep the PR Draft until its
   bounded scope is complete and frozen.
3. `[PRE-03: record_exact_head_sha]` Record the exact PR head SHA after the
   final change.
4. `[PRE-04: exact_head_provider_free_verification_success]` Require
   successful `provider-free-verification` for that exact head SHA.
5. `[PRE-05: independent_read_only_review_no_blocking_findings]` Require an
   independent read-only review with no unresolved blocking
   finding on the same exact head.
6. `[PRE-06: reconfirm_main_target_clean_mergeability_and_exact_scope]`
   Reconfirm that the PR targets `main`, remains cleanly mergeable and has not
   gained unrelated files or commits.
7. `[PRE-07: explicit_operator_approval_of_pr_and_exact_head]` Obtain explicit
   operator approval naming both the PR number and exact head SHA.
8. `[PRE-08: ordinary_pr_merge_no_direct_or_force_push]` Merge through the PR
   using an ordinary merge. Never direct-push or force-push `main`.

### After merge

9. `[POST-01: record_merge_and_verify_reviewed_scope_main_reachability]`
   Record the exact merge commit and verify that the reviewed file scope
   reached `main` without an unexpected delta.
10. `[POST-02: exact_main_ci_success]` Require successful push-triggered
    Milestone A CI for that exact main commit.
11. `[POST-03: exact_deploy_identity_and_production_smoke_when_published]` If
    Netlify publishes the commit, require exact Netlify/GitHub identity and the
    preserved anonymous plus authenticated production smoke before re-closing
    MA11 or MA15.
12. `[POST-04: preserve_bounded_delivery_evidence]` Preserve a bounded
    evidence record linking PR, reviewed head, merge, exact-main CI, deploy
    identity when applicable, and smoke result.

Any missing, stale, failed or contradictory item is fail-closed: do not merge,
or reopen the affected gate if the failure is discovered after merge. A
checkbox, comment or successful test run is evidence for this human process;
it is not equivalent to GitHub-enforced branch protection.

## Operational effect

The repository PR template now exposes the pre-merge checklist on every new
PR. Milestone A CI verifies that the decision, evidence contract, roadmap,
ledger and template remain mutually consistent. These controls reduce manual
error but cannot prevent an administrator from bypassing them.

Provider-free source planning may continue under this control. MA13 remains a
known gap, Milestone A remains formally incomplete, and no Milestone B runtime,
database, provider, broker or execution authority is created.

## Delivery condition

This candidate becomes the canonical manual-control record only after a
delivery reconciliation proves every condition below:

1. `[CAN-01: dedicated_branch_from_current_main]`
2. `[CAN-02: draft_until_bounded_scope_frozen]`
3. `[CAN-03: exact_head_sha_recorded_after_scope_freeze]`
4. `[CAN-04: exact_head_ci_success]`
5. `[CAN-05: independent_read_only_review_no_blocking_findings]`
6. `[CAN-06: base_current_cleanly_mergeable_and_exact_scope_reconfirmed]`
7. `[CAN-07: explicit_operator_approval_of_pr_and_exact_head]`
8. `[CAN-08: ordinary_pr_merge_verified]`
9. `[CAN-09: exact_reviewed_scope_merged]`
10. `[CAN-10: exact_main_ci_success]`
11. `[CAN-11: resulting_netlify_github_identity_exact_if_published]`
12. `[CAN-12: resulting_production_smoke_green_if_published]`
13. `[CAN-13: bounded_delivery_evidence_preserved]`

If Netlify publishes the documentation-only merge, the applicable deploy and
production-smoke conditions must pass before MA11 and MA15 may remain closed.
No subset of these conditions may set `all_satisfied` to true. The delivery
can record acceptance of the gap but can never mark MA13 `verified_current`
while GitHub enforcement is absent.

## Scope limits

This action changes only governance documentation, evidence, the PR template,
its provider-free regression test and CI registration. It performs no
application, database, Supabase, Auth, environment, provider, Netlify, broker,
execution-record or runtime mutation. Publishing a Draft PR is not merge or
deployment authorization.
