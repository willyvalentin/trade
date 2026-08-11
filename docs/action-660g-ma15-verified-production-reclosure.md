# Action 660G — MA15 verified production reclosure

Status: **documentation-only delivery candidate; no database, Auth, provider,
runtime or release mutation**.

Observed on 2026-08-11 against GitHub `main` commit
`f463644ddeb7f49fa8b80924d9103ea8970ccae4`, tree
`b0c8eae01c22d3f720e4cc5fc4ed5424a24bdcad`, after the ordinary merge of PR
#98. This record deliberately contains no canonical owner UUID, credential,
application row or execution-record value.

This record becomes canonical only after its exact reviewed scope reaches
`main`, exact-main CI succeeds and the resulting documentation-only Netlify
release preserves the production smoke described below.

`roadmap_completion_authority:false_until_main_verified`

## Reclosure outcome

MA15 moves from `known_gap` to `verified_current`. The owner-bound PostgREST
relationship correction from Action 660F is reachable from `main`, exact-main
CI passed and Netlify published the exact merge commit. Anonymous boundaries,
the protected application and the required server-owned reads then passed.

The resulting gate arithmetic is:

`13 + MA15 = 14/15 = 93.3%`

MA13 remains `unknown_current`; Milestone A therefore remains incomplete.

## Exact source, merge and release identity

- PR #98 was reviewed at exact head
  `790151d098ad8b9d930c2dba3b168cf5e6f2e61a`.
- It merged by ordinary merge as
  `f463644ddeb7f49fa8b80924d9103ea8970ccae4` with no reviewed-head-to-merge
  file delta.
- Exact-main Milestone A CI run `31541394848` completed successfully for that
  merge commit.
- Netlify published deploy `6a7b9e45ceb7e100087c55fa` for the same full
  commit. Build, deploy, cleanup and post-processing completed without error.

## Read-only production verification

The release-bound smoke preserved the anonymous boundary: the production root
and immutable deploy permalink redirected to login, while the protected
dashboard API returned HTTP 401 without an application session.

With the existing application session, the protected application, dashboard,
settings and market-calendar state rendered. No form was submitted and no
application mutation route was called.

Supabase API logs for the production project provide the decisive relation
readback:

- four owner-bound `positions` requests used
  `recommendations!positions_recommendation_owner_fkey(...)` and all returned
  HTTP 200;
- none of those owner-bound requests returned HTTP 300;
- the four earlier unqualified requests remain visible as the historical
  HTTP-300 control from Action 660F; and
- two `execution_records` reads returned HTTP 200 with no 5xx response.

Only request counts, status classes, relation-hint presence and bounded
timestamps are recorded. URLs, owner identifiers, row identifiers and payload
values are not recorded.

The current Supabase joins guide continues to require `!foreign_key`
disambiguation when multiple foreign keys match an embedded relation. The
current breaking-change changelog contains no change that invalidates this
contract.

## Fail-closed delivery condition

The production recovery conditions that Action 660F required are satisfied at
the reconciliation base: exact fix merge, exact-main CI, exact
Netlify/GitHub identity, anonymous boundaries and authenticated required reads.

This documentation branch does not merge or deploy itself. Its final
canonicalization additionally requires:

1. exact reviewed scope merged to `main`;
2. exact-main CI success for that merge commit;
3. exact Netlify/GitHub identity for the resulting documentation-only release;
4. the same anonymous and authenticated production smoke remaining green; and
5. no form submission or application mutation route during verification.

If any condition fails, MA15 reopens immediately and this candidate cannot be
used as closure authority.

## Scope limits

This reconciliation records already completed, read-only verification. It
does not change application source, schema, migration, RLS, Auth, environment
variables, provider artifacts, execution records, broker boundaries or runtime
authority. Publishing a Draft PR is not merge or deployment authorization.
