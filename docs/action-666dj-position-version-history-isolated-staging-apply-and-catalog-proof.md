# Action 666DJ — Position-Version History Isolated Staging Apply and Catalog Proof

## Decision

Action 666DJ closes only the bounded
`position_version_history_isolated_staging_apply_and_catalog_proof` objective.
Under the operator's explicit three-part authorization, it applied the exact
Action 666DI migration bytes once to the designated isolated `ture-staging`
project, ran aggregate-only catalog preflight/readback, and ran disposable
behavioural fixtures inside one explicit rollback-only transaction.

The evidence binds the protected `main` predecessor
`16bf7504a7651bcbd0e1991e46580298cc6f03d0`, tree
`8409ee13dd81e8d8bc1374c1801c5701040b1fca`, with parents
`b80584dca0c2b2f1c7f2dd8793d59ac63dbafe6b` and
`0e2e4defb6679e25a71466aee40fd3824e3862f0`. Its push-triggered exact-main CI
run `32566129762` completed successfully before the isolated staging action.

No row, owner, connection or credential identifier is recorded. All database
readbacks are aggregated booleans/counts. The temporary fixtures existed only
inside the rolled-back transaction; the post-rollback row count is zero.

## Exact staging scope and results

The source file
`supabase/migrations/20260821194333_create_position_version_history.sql` was
pinned at SHA-256
`aaf0d677da73316355e30bb3d613d0274244ed896fb4c3bf266bb8b045fd177f` before
application. Preflight proved that both owner-bound parent targets were
present, immediate, valid and eligible, and that the history table did not yet
exist.

The migration applied successfully. The aggregated catalog proof confirms:

- empty `public.position_version_history`, enabled RLS and zero client policy;
- revoked `anon` and `authenticated` table privileges;
- exact composite primary key, two restrictive owner-bound foreign keys, six
  named checks and the recommendation-owner lookup index;
- a `SECURITY INVOKER` append-only trigger with revoked client execution; and
- no persistent fixture data after rollback.

The rollback-only behavioural transaction proved 14/14 checks: valid insert,
duplicate rejection, cross-owner foreign-key rejection, minimum/maximum range
rejection, digest and JSON-object checks, a higher-version retry,
update/delete rejection, restrictive parent deletion, and denied reads for
both `anon` and `authenticated`.

## Closed authority

This is evidence of one isolated staging DDL application and rollback-only
fixtures—not a production authorization. It does not apply anything to
production, backfill existing rows, validate or alter production constraints,
refresh generated types, add a reader or writer, wire runtime code, change
RLS/grants outside the reviewed migration, change provider configuration or
publish a deployment.

Any production application, data backfill, generated-type refresh, reader,
writer, runtime wiring or production release needs a separate exact-scope
authorization and review.
