# Action 660C — MA05, MA06 and MA08 verified closure reconciliation

Status: **documentation-only delivery candidate; no database, Auth, provider,
runtime or release mutation**.

Observed on 2026-08-11 against GitHub `main` commit
`490e3607d1dfb85046be5ce70c787f897b5d939e` and production Supabase project
`ekdyopdrrkphlrsilyoo`. The canonical owner UUID is deliberately not recorded
in this document or its machine-readable evidence.

This record becomes canonical only after independent review, an exact
four-path merge, main reachability and exact-main CI.

`roadmap_completion_authority:false_until_main_verified`

## Delivery and release identity

- PR #94 merged by ordinary merge as `490e3607d1dfb85046be5ce70c787f897b5d939e`.
- GitHub `main` and the published Netlify production release identify that
  same full commit.
- GitHub Actions run `31513617560` completed successfully for that exact
  merge commit.
- `trade-vl` was re-enabled only after the ready deployment and final
  application smoke checks were green.

## MA05 — tenant-owner principal binding

The separately approved maintenance window used one explicitly confirmed
Supabase Auth owner. It never inferred ownership from Auth row count and never
recorded the UUID in repository evidence.

Production readback established:

- all nine owner-bound tables have reconciled owner data;
- all nine owner fields are physically `NOT NULL`;
- all 20 reviewed constraints exist and are validated;
- all nine tables have RLS enabled and exactly one owner-select policy of the
  reviewed shape;
- `anon` and `authenticated` table access remains revoked;
- both composite relationship indexes exist, are valid and ready;
- the owner-aware open-position RPC is executable only by `service_role`.

The Functions-scoped owner value is stored as a masked Netlify production
value. Protected sessions, server routes and every identified service-role
data path derive ownership from that verified server principal. The browser
does not provide the owner id.

Disposable staging proof used two Auth principals. Each principal observed
one own recommendation and zero rows belonging to the other principal. A
cross-owner open-position command failed with
`owned_recommendation_not_found`; the same-owner command returned `created`,
created one correctly owned position and left the other owner's
recommendation unchanged. Both proofs ran inside rollback transactions.

The four focused authentication, owner-boundary, activation-package and
transactional-RPC suites passed 23/23. No disposable row, Auth user or Auth
identity remained, and `ture-staging` returned to `INACTIVE`.

**Decision:** MA05 changes from `known_gap` to `verified_current` when this
reconciliation becomes exact-main authority.

## MA06 — production RLS, Data API and ordinary-role behavior

MA06 is intentionally split into the two layers documented by Supabase:
object grants decide whether a role can reach a table, while RLS decides which
rows that role may observe after access is granted.

Production behavior was verified read-only:

- an actual anonymous REST request to
  `/rest/v1/recommendations?select=id&limit=1` returned HTTP 401 and Postgres
  code `42501`, `permission denied for table recommendations`;
- an actual read-only query after `SET LOCAL ROLE authenticated`, carrying the
  canonical owner claim, failed with the same `42501` permission denial;
- catalog readback confirms all nine client grants remain revoked and all
  nine owner policies remain installed as defense in depth.

The rollback-only staging test temporarily granted read access and exercised
the RLS predicates with two real Auth principals, proving one-own/zero-other
behavior in both directions. Production therefore proves the intended
server-only Data API boundary; staging proves the owner predicate that would
apply if a reviewed grant were ever introduced.

**Decision:** MA06 changes from `unknown_current` to `verified_current` when
this reconciliation becomes exact-main authority.

## MA08 — production migration application/source parity

Production migration history contains exactly one statement for:

- version: `20260811163228`
- name: `add_fail_closed_application_owner_foundation`
- statement bytes: `21658`
- MD5: `83e413b3d95cc26106444cc159c0105b`

The reviewed repository migration has the same byte count and MD5. This is an
exact byte-for-byte source/application match, not a filename or semantic-only
comparison.

Staging contains every production migration name through MA05 plus two
pre-existing staging-only draft migrations. The 19 synchronized migrations
received staging-generated history timestamps from the apply mechanism, so
staging history is explicitly classified as behaviorally synchronized rather
than version-identical. That staging limitation does not weaken the direct
production-to-source hash proof above.

**Decision:** MA08 changes from `unknown_current` to `verified_current` when
this reconciliation becomes exact-main authority.

## Fail-closed MA09 drift finding

MA05 changed the production public schema after the V5 generated-types
receipt. PR #94 did not regenerate `lib/supabase-database.types.ts` or replace
its pinned catalog/provenance evidence. The file still has SHA-256
`5a74e8de579628387d90e414fb434a80d8481fcd53526310e9b3a8e3754d8a6c`
and does not contain the new owner fields or owner-aware RPC signature.

The existing MA09 closure rule says that a later schema, receipt, command,
source-binding or generated-output change requires reconciliation. MA09 must
therefore reopen as `known_gap`; closing MA05, MA06 and MA08 does not permit
the stale generated-types claim to remain closed.

## Net gate result

Starting from 11/15, this action closes three gates and reopens one:

`11 + MA05 + MA06 + MA08 - MA09 = 13/15 = 86.7%`

MA09 and MA13 remain open. Milestone A remains incomplete. The next bounded
action is a fresh read-only production catalog/type generation and
repository-pinned provenance reconciliation for MA09. MA13 remains
`unknown_current` under the private-repository plan's HTTP 403 policy API
boundary.
