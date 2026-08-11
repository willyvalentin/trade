# Action 660D — MA09 post-MA05 generated-types reconciliation

## Outcome

Supabase generated TypeScript types for the canonical Ture project, and the
exact provider response is archived in the repository. Its extracted type
bytes are identical to lib/supabase-database.types.ts. The output contains
all eight MA05 owner_user_id columns plus
app_open_owned_position_transaction and its p_owner_user_id argument.

This action is a delivery candidate, not a gate closure. It changes no
database object, applies no migration, deploys nothing and grants no runtime,
broker or execution authority.

## Exact production and response binding

- Project ref: ekdyopdrrkphlrsilyoo
- Provider project status: ACTIVE_HEALTHY
- Database-bound catalog observation: 2026-08-11T19:53:38.618457Z
- Catalog access: project-scoped Supabase Management API request
- Effective SQL role: postgres
- Transaction read-only: on
- Default transaction read-only: off
- Selected catalog schema set: [public]
- Catalog counts: 1 schema, 30 tables, 0 views, 653 columns, 30 primary
  keys, 28 foreign keys, 22 functions, 0 enums and 0 composites
- Provider execution-envelope SHA-256:
  40f9fc28dd196c5a2b7a7e2ed07a3bcd23b3bbc0286507c42941a2454cb80d37
- Catalog receipt SHA-256:
  f3f9424a42a72e5a2f1e3ba21a8fb2fe538a2225587ec7fa734a85b4858f0fea
- Raw type-generation response SHA-256:
  d585cce5a5911611d691589d2574330c909495ce28041fafc9caac1dbb45194e
- Extracted provider types and repository output SHA-256:
  f23c3702ffd931cb5d81f13e19a8515125817717e9a3fad7ac85e40795729029

The execution envelope binds the provider project lookup, catalog request and
type-generation request to the same project ref. The catalog query no longer
emits a hard-coded project identity. Its raw database payload is archived and
must match the receipt. The raw provider generation response is separately
archived, extracted and compared byte-for-byte with the application output;
therefore the catalog does not need to reproduce Supabase's internal
relationship or RPC-normalization rules.

The catalog completeness claim is limited to the explicitly selected public
schema. It does not claim that every schema exposed through the Supabase Data
API was discovered.

## Drift resolution

The historical output SHA-256 was
5a74e8de579628387d90e414fb434a80d8481fcd53526310e9b3a8e3754d8a6c.
Its exact bytes are archived in the V1 evidence package. V2 replaces the
canonical application target and binds it to the applied MA05 migration whose
source SHA-256 is
fd8330d8156d454a79721126f1cc054d07e893452e70a7a9616cdf72ec5219f7.

## Delivery ordering and gate arithmetic

This action is stacked on exact Draft PR #95 head
e0b71ddbb4774e0b87ba3c7eabb2f4680179f43c. PR #95 must merge first.

An initial independent review found two major provenance gaps and one minor
scope overstatement. This revision addresses them, but the independent
no-findings condition remains unsatisfied until the reviewer accepts the exact
new head.

A canonical owner identifier also appeared transiently in an earlier Draft
commit. It is treated as disclosed and is removed from the revised branch
history; it is not a credential and must never be reused as secret material.

If re-review finds no issue and every recorded delivery condition succeeds,
MA09 may move from the PR #95 state of 13/15 to 14/15. MA13 remains unknown.
Milestone A therefore remains incomplete.

## Closure conditions still required

1. Independent re-review reports no findings on the exact revised head.
2. PR #95 merges before this stacked action.
3. The exact reviewed scope merges.
4. Receipt, manifest, provider responses and generated output are
   byte-identical and reachable from main.
5. CI passes on that exact main commit.
