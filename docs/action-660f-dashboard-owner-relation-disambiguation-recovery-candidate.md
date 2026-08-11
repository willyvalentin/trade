# Action 660F — dashboard owner-relation disambiguation recovery candidate

Status: **source-only recovery candidate; no database, Auth, provider, merge or
deployment mutation**.

Observed on 2026-08-11 after Netlify published GitHub `main` commit
`9e2f64a17c3851529beade0685ababb582eac320`, tree
`0a5440b75b562da512427a50e05d65ad1fb0aa2f`, through deploy
`6a7b9745ed0bbf0009b90a35`. This record contains no canonical owner UUID,
credential, application row or execution-record value.

`roadmap_completion_authority:false_until_main_verified`

## Production finding

The post-PR #97 authenticated smoke rendered the protected application,
settings, market calendar and the dedicated execution-record JSON route.
Dashboard refresh nevertheless failed closed with the sanitized
`application_data_unavailable` response.

Supabase API logs showed both dashboard `positions` requests returning HTTP
300 while the parallel owner-filtered reads returned HTTP 200. The failing
queries embedded `recommendations` without selecting one of the two foreign
keys now present between `positions` and `recommendations`.

The generated schema records both:

- `positions_recommendation_id_fkey`, using `recommendation_id`;
- `positions_recommendation_owner_fkey`, using
  `recommendation_id, owner_user_id`.

PostgREST requires `!<foreign-key>` disambiguation when multiple foreign
keys connect the same tables. The Supabase joins guide and current PostgREST
resource-embedding reference confirm this contract. The current Supabase
changelog contains no change that invalidates it.

## Bounded source correction

Both dashboard position reads now select:

`recommendations!positions_recommendation_owner_fkey(...)`

The composite owner relationship is intentional. It preserves the tenant
binding already enforced by the surrounding `owner_user_id` filter instead
of selecting the legacy ID-only relationship.

A focused provider-free regression test:

1. requires the owner-bound hint for open and closed positions;
2. rejects the two formerly ambiguous selects;
3. rejects use of the legacy ID-only hint;
4. confirms the generated types still contain both relationships; and
5. preserves the route's sanitized fail-closed 503 behavior.

The test was observed failing against the exact production source before the
correction and passing 4/4 after it.

## Fail-closed gate decision

The new production deploy and required dashboard-read failure trigger the
preserved MA15 reopening rule.

**Decision:** MA15 is `known_gap`. Formal Milestone A status is therefore
`13/15 = 86.7%`, with MA13 still `unknown_current`.

This source correction does not close MA15. Closure requires a separately
approved exact-scope merge and deployment followed by:

- exact-main CI success;
- exact Netlify/GitHub commit identity;
- anonymous login redirect and dashboard denial;
- authenticated protected application rendering;
- successful dashboard, settings, market-calendar and execution-record reads;
- no form submission or application mutation route; and
- a later, bounded governance reconciliation recording the green production
  evidence.

## Scope limits

This action changes no schema, migration, RLS policy, Auth user, environment
variable, provider artifact, execution record, broker boundary or runtime
authority. Publishing a Draft PR is not merge or deployment authorization.
MA15 must remain open until the post-deploy evidence above exists.
