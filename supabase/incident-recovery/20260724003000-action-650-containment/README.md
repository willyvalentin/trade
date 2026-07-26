# Action 661B incident-only recovery 03000

This package is not a normal Supabase migration. It is excluded from
`supabase/migrations` so normal migration discovery, deployment, and release
flows cannot apply it.

It is an incident-only, forward recovery for a documented ACL/RLS drift on the
19 Action 650 containment tables. It preserves recovery history identity
`20260724003000`, requires the exact Action 650 history record, and refuses
unknown state before making any repair mutation.

## Authorized use checklist

1. Obtain a separate incident authorization that names this package and its
   verified digest.
2. Confirm Action 650 history `20260724002000` is present and recovery history
   `20260724003000` is absent.
3. Run `readback.sql` through an approved read-only path and confirm that it
   reports a documented repairable drift for the 19 targets.
4. Use `sql-editor-bundle.sql` only after a separate execution authorization;
   execute it at most once and do not retry on uncertainty or failure.
5. Run `readback.sql` again and retain the sanitized terminal evidence.

The package does not inspect, repair, classify, or claim containment of
continuous-intelligence, historical-data, or other unrelated `public`
relations. Those domains require their own explicit security contracts.
