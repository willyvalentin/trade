# Action 660I — verified MA13 branch-protection closure

Status: **GitHub enforcement verified; repository-governance delivery
candidate; Milestone A closure requires exact-main delivery**.

Observed on 2026-08-17 against private repository `willyvalentin/trade`. The
protected pre-delivery `main` base is
`cdf03e545cf25c0988627ef192d50acb1d72ba72`, tree
`f39ffe5f27d707b804f06273bd1732bb136e05b5`. That commit is the ordinary
merge of PR #113 at exact reviewed head
`daab530de6e512ae21b9aa38913fc176495774c0`; exact-main Milestone A CI run
`32045093016` completed successfully.

`roadmap_completion_authority:false_until_exact_main_delivery_verified`

## Authorized transition

The operator upgraded the account to GitHub Pro and explicitly instructed the
project to close MA-13. Authenticated readback changed from the former plan
boundary to available GitHub enforcement:

- before configuration, branch protection returned HTTP 404 `Branch not
  protected`, `main.protected` was false and GraphQL reported zero protection
  rules;
- repository rulesets returned HTTP 200 with an empty list, proving that the
  former GitHub Free HTTP 403 plan boundary no longer applied;
- the authorized branch-protection PUT succeeded; and
- after configuration, branch protection returned HTTP 200,
  `main.protected` was true and GraphQL reported exactly one rule matching
  `main`.

The only external mutation was the explicitly authorized GitHub repository
configuration change. No application, database, Supabase, Auth, Netlify,
runtime, broker or production-deployment mutation was performed.

## Verified protection profile

The exact enforced profile is:

1. changes to `main` require a pull request;
2. `provider-free-verification` from GitHub Actions app `15368` is required;
3. required checks are strict, so the PR head must include current `main`;
4. enforcement applies to everyone, including repository administrators;
5. force pushes and branch deletion are forbidden;
6. all review conversations must be resolved;
7. stale approvals are dismissed; and
8. the required approval count is zero.

Zero required approvals is intentional for the single-owner repository: the
owner cannot approve their own pull request. Action 660H remains mandatory
defense in depth and still requires a fresh independent read-only review plus
explicit operator approval naming the PR and exact head SHA. GitHub now
enforces the PR and exact required-check subset; the manual control continues
to enforce the stronger project-specific evidence sequence.

## Fail-closed enforcement and delivery proof

Immediately after protection was enabled, Draft PR #113 at exact head
`daab530de6e512ae21b9aa38913fc176495774c0` remained cleanly mergeable but
GraphQL classified its merge state as `BLOCKED`. That bounded observation
proved that an open Draft could not move `main` merely because its branch was
mergeable.

PR #113 later satisfied exact-head CI, fresh independent no-findings review and
the operator's exact PR/head approval. GitHub then permitted an ordinary merge
to `cdf03e545cf25c0988627ef192d50acb1d72ba72`; exact reviewed tree
`f39ffe5f27d707b804f06273bd1732bb136e05b5` reached `main` without file delta,
and push run `32045093016` succeeded. Post-merge readback still reported the
same required check, strictness, administrator enforcement, PR requirement,
review settings and force-push/deletion/conversation controls.

## Gate reconciliation

The technical MA-13 classification changes from `known_gap` to
`verified_current`. Conditional on this exact closure package reaching `main`
through the protected PR process and successful exact-main CI, Milestone A
becomes **15/15 = 100%** with no partial credit.

The former Action 660H record remains historically true for the GitHub Free
period but is superseded as the current technical classification. Any drift in
the required check, app identity, strictness, administrator enforcement, PR
requirement, force-push/deletion prohibition or conversation-resolution rule
reopens MA-13 immediately.

## Delivery condition

This repository package becomes canonical only after all conditions below are
true for its final exact head:

1. the package is based on protected `main` after the verified PR #113 merge;
2. roadmap and ledger record current main, Track 2 and MA-13 consistently;
3. exact-head `provider-free-verification` succeeds;
4. a fresh independent read-only review reports no blocking finding;
5. the operator explicitly approves the package PR and exact head SHA;
6. GitHub permits an ordinary PR merge under the protection rule;
7. the exact reviewed scope reaches `main` without unexpected delta;
8. exact-main push CI succeeds; and
9. post-merge readback proves the same protection profile remains active.

Until those conditions are met, GitHub enforcement is technically active but
the roadmap/ledger Milestone A closure remains a delivery candidate. No
production deployment is authorized or required.

## Scope limits

Action 660I changes only bounded governance documentation, evidence, tests and
CI registration. The already-completed GitHub configuration mutation is
recorded, not repeated. This package adds no application runtime, database
contract, provider data access, model/ranking effect, training, promotion,
broker or execution authority.
