# Action 659 — MA05 fail-closed owner foundation

Status: **source-only; draft; no production apply; no deployment; MA05 remains open**.

## What this foundation changes

Ture keeps the current shared-password login experience, but a successful login
now requires one explicit `TURE_APPLICATION_OWNER_USER_ID`. The value must be a
valid UUID, must resolve through the server-side Supabase Admin API to an actual
`auth.users` record, and is embedded in the bounded HMAC session. The signed
session becomes invalid if the configured owner is removed or changed.

Protected page and app-route data access revalidates that server principal. The
browser never supplies an owner id. User-controlled request bodies are not
trusted for row ownership.

The application data layer scopes reads and mutations for these user-owned or
owner-bound records:

- `recommendations.owner_user_id`
- `positions.owner_user_id`
- `position_updates.owner_user_id`
- `user_settings.owner_user_id`
- `recommendation_snapshots.owner_user_id`
- `execution_records.user_id`

Manual and scheduled recommendation generation also require the verified
server owner. Newly generated recommendation rows and snapshot persistence are
stamped server-side. The owner-aware position RPC checks the same owner across
the recommendation, position, and snapshot mutation.

## System-shared records

The following are deliberately classified as system-shared in this action and
are not filtered by the application owner:

- market calendar, symbol metadata, market regime, and scanner caches;
- scheduled scan run/attempt observability;
- recommendation scan-run and batch observability;
- recommendation outcome aggregates.

This classification does not grant browser or Data API access. Existing Action
650 containment remains in force. If any system-shared record later contains
account-specific or personal data, it must be reclassified before that data is
stored.

## Migration safety properties

`20260811145040_add_fail_closed_application_owner_foundation.sql` is additive:

- adds nullable owner columns without assigning any UUID;
- adds indexed foreign keys to `auth.users` as `NOT VALID`, so new invalid
  ownership is rejected while legacy rows remain explicitly unresolved;
- adds `NOT VALID` owner-required checks. They preserve legacy rows for the
  reviewed backfill but reject every new or modified unowned row immediately;
- adds composite recommendation/position/update ownership foreign keys so a
  server-side relation cannot cross owners;
- keeps `public`, `anon`, and `authenticated` table privileges revoked;
- adds authenticated RLS policies using `(select auth.uid())` for defense in
  depth without restoring direct Data API access;
- revokes the legacy unscoped open-position RPC from `service_role` and exposes
  only the new owner-aware command;
- does not add `NOT NULL`, backfill data, insert rows, or infer the sole Auth
  user as owner.

## Required activation sequence — not performed here

1. The operator explicitly confirms the canonical Auth user UUID. Never infer
   it from there currently being one Auth user.
2. Pause affected scheduled writers and enter a bounded maintenance window.
3. Apply the additive migration in a separately approved database action.
4. Backfill every legacy owned row with the confirmed UUID and independently
   reconcile row counts and relationship consistency.
5. Validate all `NOT VALID` foreign keys and owner-required checks, then add
   reviewed physical `NOT NULL` constraints for active owner columns.
6. Configure `TURE_APPLICATION_OWNER_USER_ID` in the production Functions
   scope without printing the value.
7. Run two-principal negative tests proving that owner A cannot read or mutate
   owner B data through the server routes, service-role data layer, RPC, or RLS.
8. Only after all earlier steps pass may the application code be deployed and
   MA05 be reconsidered for closure.

Until the sequence is complete, this branch and its PR must remain draft and
must not be merged or deployed.
