# Action 660B — MA05 production read-only preflight

Status: **read-only; no production mutation; no Auth change; no merge; no
deploy**.

Observed at: `2026-08-11T15:44:52Z`.

## Identity and activation state

- PostgreSQL server version: `17.6` (`server_version_num = 170006`).
- Auth user count: `1`.
- Owner UUID read or inferred: **no**.
- MA05 migration-history rows: `0`.
- Owner columns present: `1/9`; the one existing field is the legacy nullable
  `execution_records.user_id` column.
- Expected MA05 constraints present/validated: `0/20`.
- Writer pause confirmed: **no**. Zero recent writer rows and zero active
  target-table sessions are point-in-time evidence only; they are not a pause.

## Current containment

All nine target tables existed, had RLS enabled, had zero policies, and denied
SELECT to both `anon` and `authenticated`. This matches the intentional
server-only Action 650 containment state. The Supabase security advisor's
informational `rls_enabled_no_policy` notices are therefore expected before
MA05 owner-select policies are applied.

| Table | Rows | Total bytes |
| --- | ---: | ---: |
| `execution_records` | 1 | 237,568 |
| `position_updates` | 76 | 114,688 |
| `positions` | 8 | 32,768 |
| `recommendation_batches` | 8,721 | 128,311,296 |
| `recommendation_outcomes` | 3,732 | 12,509,184 |
| `recommendation_scan_runs` | 838 | 9,412,608 |
| `recommendation_snapshots` | 2,900 | 25,239,552 |
| `recommendations` | 910 | 2,564,096 |
| `user_settings` | 1 | 32,768 |

The batch table is the largest target at about 128 MB. The migration and
backfill must therefore remain inside the reviewed maintenance window with
writers paused and the existing lock/statement timeouts intact.

## Relationship quality

- All 8 positions reference an existing recommendation.
- All 76 position updates reference an existing position.
- The single execution record has a null `user_id`, exactly as expected before
  explicit owner backfill.
- Historical best-effort lineage contains 3 snapshots and 3 batches whose scan
  fingerprints are no longer present, plus 4 outcomes whose snapshot
  fingerprints are no longer present. The reviewed activation does not add
  foreign keys for those best-effort derived links, so these rows do not block
  the owner backfill. Every derived table is still assigned and filtered by the
  same explicitly confirmed owner.

## Advisor finding remediated in the Draft PR

The performance advisor reported that the existing child foreign-key columns
`positions.recommendation_id` and `position_updates.position_id` lacked
covering indexes. The MA05 composite ownership foreign keys would otherwise
retain that deficiency.

The source migration now adds and the readback now verifies:

- `positions_recommendation_owner_idx` on
  `(recommendation_id, owner_user_id)`;
- `position_updates_position_owner_idx` on
  `(position_id, owner_user_id)`.

The advisor also reports leaked-password protection as disabled. That is a
separate Supabase Auth hardening item and does not authorize an Auth settings
change in this action.

## Exact remaining gate

The next mutating action is blocked until the operator explicitly provides and
confirms the intended canonical `auth.users.id` and the affected Netlify
scheduled writers are actually paused. The single Auth row must never be used
as an inferred owner.
