# Action 660D — MA09 post-MA05 generated-types reconciliation

## Outcome

The production `public` schema was captured in an explicit read-only
transaction and `lib/supabase-database.types.ts` was regenerated from the
canonical Ture project. The new output contains all eight MA05
`owner_user_id` columns plus `app_open_owned_position_transaction` and its
`p_owner_user_id` argument.

This action is a delivery candidate, not a gate closure. It changes no
database object, applies no migration, deploys nothing and grants no runtime,
broker or execution authority.

## Exact production binding

- Project ref: `ekdyopdrrkphlrsilyoo`
- Database-bound observation: `2026-08-11T19:27:19.850135Z`
- Catalog access: Supabase Management API
- Linked-project attestation SHA-256:
  `97ba08912db8b3965c85f03ca33dbeae6642e4a2b4eaba5a43775e02d75c805c`
- Effective SQL role: `postgres`
- Transaction read-only: `on`
- Default transaction read-only: `off`
- CLI: `2.107.0`
- Schema set: `public`
- Catalog counts: 1 schema, 30 tables, 0 views, 653 columns, 30 primary
  keys, 28 foreign keys, 22 functions, 0 enums and 0 composites
- Catalog receipt SHA-256:
  `7fe0c253404fea6c175ae36fad3fd16699b3acdf06351c6929c694e54d75f530`
- Generated output SHA-256:
  `f23c3702ffd931cb5d81f13e19a8515125817717e9a3fad7ac85e40795729029`

The query began with `BEGIN TRANSACTION READ ONLY` and returned
`transaction_timestamp()` in the same catalog row, binding the observation
time to the database transaction. The Management API role
could not assume `supabase_read_only_user`; PostgreSQL rejected that attempt.
The receipt therefore states the actual authority instead of claiming the
stronger role. No statement from the failed attempt is part of the evidence.

## Drift resolution

The historical output SHA-256 was
`5a74e8de579628387d90e414fb434a80d8481fcd53526310e9b3a8e3754d8a6c`.
Its exact bytes are archived in the V1 evidence package. V2 replaces the
canonical application target and binds it to the applied MA05 migration whose
source SHA-256 is
`fd8330d8156d454a79721126f1cc054d07e893452e70a7a9616cdf72ec5219f7`.

## Delivery ordering and gate arithmetic

This action is stacked on the exact Draft PR #95 head
`e0b71ddbb4774e0b87ba3c7eabb2f4680179f43c`. PR #95 must merge first.

If independent review finds no issue and all recorded delivery conditions
succeed, MA09 may move from the PR #95 state of 13/15 to 14/15. MA13 remains
unknown. Milestone A therefore remains incomplete.

## Closure conditions still required

1. Independent review reports no findings.
2. PR #95 merges before this stacked action.
3. The exact reviewed scope merges.
4. Receipt, manifest and generated output are byte-identical and reachable
   from `main`.
5. CI passes on that exact `main` commit.
