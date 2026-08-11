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

1. Start from the current immutable `main` commit on a dedicated branch.
2. Keep the PR Draft until its bounded scope is complete and frozen.
3. Record the exact PR head SHA after the final change.
4. Require successful `provider-free-verification` for that exact head SHA.
5. Require an independent read-only review with no unresolved blocking
   finding on the same exact head.
6. Reconfirm that the PR targets `main`, remains cleanly mergeable and has not
   gained unrelated files or commits.
7. Obtain explicit operator approval naming both the PR number and exact head
   SHA.
8. Merge through the PR using an ordinary merge. Never direct-push or
   force-push `main`.

### After merge

9. Record the exact merge commit and verify that the reviewed file scope
   reached `main` without an unexpected delta.
10. Require successful push-triggered Milestone A CI for that exact main
    commit.
11. If Netlify publishes the commit, require exact Netlify/GitHub identity and
    the preserved anonymous plus authenticated production smoke before
    re-closing MA11 or MA15.
12. Preserve a bounded evidence record linking PR, reviewed head, merge,
    exact-main CI, deploy identity when applicable, and smoke result.

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

This candidate becomes the canonical manual-control record only after its
exact reviewed scope reaches `main` and push-triggered exact-main CI succeeds.
If Netlify publishes the documentation-only merge, exact deploy identity and
the required production smoke must also pass before MA11 and MA15 may remain
closed. The delivery can record acceptance of the gap but can never mark MA13
`verified_current` while GitHub enforcement is absent.

## Scope limits

This action changes only governance documentation, evidence, the PR template,
its provider-free regression test and CI registration. It performs no
application, database, Supabase, Auth, environment, provider, Netlify, broker,
execution-record or runtime mutation. Publishing a Draft PR is not merge or
deployment authorization.
