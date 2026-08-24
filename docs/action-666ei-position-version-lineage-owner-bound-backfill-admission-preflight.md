# Action 666EI — Position-version lineage owner-bound backfill admission preflight

## Decision

Action 666EI closes the bounded
position_version_lineage_owner_bound_backfill_admission_preflight objective
with a fail-closed result: production is not admitted to the separately frozen
deterministic lineage backfill.

After Action 666EH's exact-main CI passed, the exact source-controlled,
aggregate-only query ran once through the project-scoped Supabase boundary
inside a repeatable-read, read-only transaction. It returned one JSON result
only and rolled back. It disclosed no row, owner, lineage value, connection
identifier or credential.

The physical lineage shape, all-null recommendation/position tuples,
owner-bound links, link uniqueness, RLS, required source members and lossless
numeric classes are intact. The query instead found a nonzero control-character
blocker in the frozen normative-digest source projection. Action 666DE
explicitly forbids control characters in the
projection; treating those rows as canonical, trimming them, normalizing them,
or silently omitting them would violate that contract.

The preflight also preserves the contract's owner-scoped batching requirement.
Any later implementation must retain Action 666DE's bounded, sequential
maximum of 100 rows per owner transaction. This is capacity information, not
execution authority.

## Closed authority

No DDL, DML, migration, backfill, constraint validation, type refresh, runtime
wiring, grant/policy change, deployment, provider call or broker interaction
occurred. The NOT VALID checks remain unpromoted and all durable lineage tuples
remain null.

The next bounded objective is
position_version_lineage_control_character_projection_provenance_reconciliation.
It must determine, with aggregate-only and source-contract evidence, whether
the control characters are legitimate preserved legacy content requiring a
versioned projection successor or data-quality defects requiring an explicit
remediation plan. It must not backfill or relax Action 666DE by implication.
