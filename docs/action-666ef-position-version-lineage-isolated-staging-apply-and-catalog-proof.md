# Action 666EF — Position-version lineage isolated staging apply and catalog proof

## Decision

Action 666EF closes only the bounded
`position_version_lineage_isolated_staging_apply_and_catalog_proof` objective.
It applied the exact, already-reviewed Action 666EE migration once to the
designated isolated staging project, then performed aggregate-only catalog
readbacks and one rollback-only legacy-v1 fixture.

The predecessor is protected-main commit
`7dea60d4dd70a49ca59abf11e6288a4964023520`. Its exact push CI run
`32677913942` completed successfully before this isolated apply began.

## Staging result

The source migration
`supabase/migrations/20260824000000_add_position_version_lineage_columns.sql`
was pinned at SHA-256
`66fa75933f341fb672b223e2699e558c33e8b9c934e9765ba1ef70e15fbc77a0`.
Preflight confirmed the two target tables and the server-only v1 command were
present, while all seven target columns and all nine named checks were absent.

The application succeeded on `ture-staging`. Aggregate-only catalog proof then
confirmed all seven columns have their exact nullable type, all nine checks
exist and remain `NOT VALID`, existing RLS/client-deny boundaries are
unchanged, and the legacy v1 command remains `SECURITY DEFINER` with execution
limited to its server role.

The isolated project contained no recommendation or position rows before or
after the proof. A disposable fixture therefore created an auth owner and
recommendation only inside a PL/pgSQL exception subtransaction, called the
legacy v1 command, confirmed its newly created position retained an all-null
lineage tuple, and intentionally rolled all fixture writes back. No row,
owner, connection or credential identifier is recorded.

Post-apply Supabase security and performance advisors reported no finding
targeting either changed relation. Existing unrelated advisory findings are
outside this migration's scope.

## Closed authority

This is one isolated staging DDL application and rollback-only behavioural
proof. It does not apply the migration to production, backfill data, validate
the `NOT VALID` checks, activate physical `NOT NULL`, refresh generated types,
add a v2 writer, wire runtime code, change grants or policies, publish a
deployment, or contact a market-data/provider/broker service.

The next bounded objective is
`position_version_lineage_production_apply_decision_and_preflight`: decide and
prove the exact production scope separately before any production DDL, then
keep backfill, validation and writer activation as later independent gates.
