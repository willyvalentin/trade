# Action 666DD — Authorized Position-Version Read-Only Backfill Inventory Execution

## Decision

Action 666DD closes only the bounded
`authorized_position_version_read_only_backfill_inventory_execution`
objective. The operator explicitly approved the exact Action 666DC SQL at
SHA-256
`eeec737109347a48d5bceaa4f1ab4ee5dcaa4303d9aaa884ef5ece94cfdff173`
for one strictly read-only execution against Supabase project `Trade`
(`ekdyopdrrkphlrsilyoo`) through the project-scoped Supabase MCP OAuth
boundary. The query returned one aggregate-only JSON result and rolled back.

No row contents, row identifiers, owner identifiers, connection string or
credential left the boundary. No DDL, DML, migration, schema change, backfill,
runtime wiring, provider configuration change or production deployment was
authorized or performed.

The exact source authority is protected GitHub `main` merge
`cb501d3ad3626be1bb13429a9791574a2040b64e`, tree
`3f4a962de0f8ee49e86e096a21b7084dedf0b27b`, with parents
`a80f3a8856121edb4260909ac1cedcf638d421b8` and
`c69aa68e08100de1df1092a0a07c75a4ce6c8daf`. Exact-main push run
`32419997618` completed successfully. Production remains the separately
verified Action 660M release at `dbeed25f2074bff4dba8cee7f6d511cb17992efc`.

## Authorized execution boundary

The execution was constrained by all of the following:

- exact project `ekdyopdrrkphlrsilyoo`, not staging or another project;
- exact source-controlled SQL hash `eeec7371…`;
- one project-scoped MCP `execute_sql` call with no exposed credential;
- `REPEATABLE READ`, `READ ONLY`, bounded statement/lock/idle timeouts;
- `row_security = off`, so an RLS-filtered partial inventory fails rather
  than being misclassified as the global inventory;
- one JSONB result containing aggregate counts and booleans only;
- explicit `ROLLBACK` in the approved SQL;
- evidence destination
  `docs/evidence/action-666dd-authorized-position-version-read-only-backfill-inventory-execution.json`.

Current Supabase guidance confirms that RLS is distinct from table privileges
and that a privileged system boundary must never expose its credential. The
query used no Data API grant and created no new relation or function.

## Clean aggregate inventory

The single result proved:

| Class | Result |
| --- | ---: |
| recommendations | 1,049 |
| positions | 8 |
| recommendation `created_at` null | 0 |
| position `created_at` null | 0 |
| position recommendation link null | 0 |
| orphaned position recommendation | 0 |
| owner-mismatched position recommendation | 0 |
| duplicate owner-bound link groups / rows | 0 / 0 |
| owner-bound positions | 8 |
| lineage-copy-eligible positions | 8 |
| lineage-copy-blocked positions | 0 |
| identity-seed-eligible recommendations | 1,049 |
| recommendations without a position | 1,041 |

The 1,041 recommendations without a position are not a lineage blocker: all
1,049 recommendations are eligible for deterministic identity seeding, while
the eight existing positions reconcile exactly to eight owner-bound,
lineage-copy-eligible recommendation links.

All catalog guards are true: the owner-bound foreign key is valid, both
relationship indexes are valid/ready and bound to their exact tables, and RLS
is enabled on both `public.recommendations` and `public.positions`.

## Closed interpretation

The clean inventory removes only unknown legacy-row classification as a
blocker. It does not define or apply the legacy identity/digest values. In
particular:

- Action 664A remains the canonical recommendation-identity authority;
- Action 655G's hash-suffix identity validator remains incompatible and must
  be reconciled before runtime wiring;
- a deterministic normative-digest projection is not yet frozen;
- no backfill SQL, migration or generated-types refresh exists here;
- append-only position-version history remains a separate design decision;
- database writes and production publication remain unauthorized.

## Remaining gates

The next bounded objective is
`deterministic_recommendation_lineage_backfill_contract`. It must freeze the
Action 664A identity inputs, exact producer/source namespace semantics,
decision instant, normative digest projection, owner-scoped batch plan,
reconciliation arithmetic and fail-closed treatment of every legacy row.

Only after that contract receives independent review may a separate migration
package add nullable columns, prove a staging apply and request distinct
production authority. Runtime, exit queue, client projection, broker and
automatic-execution authority remain separate blockers.
