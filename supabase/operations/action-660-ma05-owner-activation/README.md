# Action 660 — MA05 owner activation package

Status: **source-only; reviewed draft; never executed by this action**.

This directory is the bounded operator package for activating the owner
foundation from Action 659. It does not contain a real Auth UUID and it must
not be run until the canonical `auth.users.id` has been explicitly confirmed.
The placeholder UUIDs are deliberately invalid so an unedited script fails
before persistent data is changed.

## Required order

1. Explicitly confirm the canonical production Auth UUID outside these files.
   Do not select or infer the only row in `auth.users`.
2. Pause every affected application and scheduled writer. Keep them paused
   until activation and readback are both green.
3. Edit only the operator-input CTE in `preflight.sql`, set
   `writers_paused` to `true`, and run it. It is read-only and must report
   `ready_for_migration = true`.
4. In the same bounded maintenance window, apply migration
   `20260811145040_add_fail_closed_application_owner_foundation.sql` through
   the normal reviewed migration workflow.
5. Immediately edit only the three values in the temporary operator-input row
   at the top of `activate.sql`, then run the complete file once. Any failed
   assertion aborts and rolls back the backfill transaction.
6. Run `readback.sql` with the same explicitly confirmed UUID. All booleans
   must be true, all null/foreign-owner counts must be zero, every named
   constraint must be validated, and direct `anon`/`authenticated` table
   privileges must remain absent.
7. Run `two-principal-negative-test.sql` only in a disposable local or staging
   database with two pre-created test Auth users. It temporarily grants SELECT
   inside a transaction and always ends in `ROLLBACK`. Never run it in
   production.
8. Configure `TURE_APPLICATION_OWNER_USER_ID` in the production Functions
   scope without logging it. Keep the PR draft until route, data-layer, RPC,
   and RLS two-principal tests pass.

The additive migration adds `NOT VALID` owner-required checks. PostgreSQL
enforces those checks for new and modified rows immediately, even before
validation. That is why the writer pause and immediate activation step are
mandatory.

## Failure and recovery

If `activate.sql` fails before `COMMIT`, leave writers paused. The backfill and
physical `NOT NULL` changes roll back, but the separately applied additive
migration remains present. Correct the reported precondition and rerun the
same activation transaction.

After a successful commit, do not erase owner IDs or drop the ownership
constraints as a rollback. Owner assignment is durable lineage. Application
rollback means keeping the new code undeployed or rolling code forward while
the database ownership boundary remains intact.
