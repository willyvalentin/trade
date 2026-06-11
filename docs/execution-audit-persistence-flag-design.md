# Execution Audit Persistence Flag Design

Date: 2026-06-10

Status: Design and helper only. No migration was applied, no Supabase write path was added, and audit API routes remain validation-only stubs.

Related:

- `lib/execution-persistence-flags.ts`
- `lib/execution-audit-persistence-route-handler.ts`
- `lib/execution-audit-persistence-writer.ts`
- `lib/execution-audit-supabase-writer.ts`
- `docs/execution-audit-migration-apply-plan.md`
- `docs/execution-audit-apply-readiness-review.md`

## Purpose

Execution audit Supabase writes must not accidentally enable just because the migration exists or because client-side dev tools are visible. This design adds a server-only flag model for future route persistence.

The default is always off. Future audit routes should only write Supabase when a server-side flag explicitly enables persistence and the target environment passes safety checks.

## Flags

| Flag | Default | Scope | Purpose |
| --- | --- | --- | --- |
| `EXECUTION_AUDIT_SUPABASE_PERSISTENCE_ENABLED` | `false` | Server-only | Enables future Supabase writes from audit persistence routes. |
| `EXECUTION_AUDIT_SUPABASE_WRITER_ENABLED` | `false` | Server-only | Allows audit routes to call the injected-client Supabase writer when persistence is also enabled and allowed. |
| `EXECUTION_PERSISTENCE_ENVIRONMENT` | `local_dev` | Server-only | Declares the persistence environment: `local_dev`, `staging`, or `production`. Unknown values normalize to `local_dev` with a warning. |
| `EXECUTION_AUDIT_SUPABASE_ALLOW_PRODUCTION` | `false` | Server-only | Required second lock for production writes. |

Do not use `NEXT_PUBLIC_` for write enablement. Client code may call test buttons, but it must not be able to enable persistence.

## Helper Contract

Action 225B added:

- `lib/execution-persistence-flags.ts`

Helpers:

- `isExecutionAuditSupabasePersistenceEnabled(env?)`
- `getExecutionPersistenceEnvironment(env?)`
- `getExecutionPersistenceEnvironmentWarnings(env?)`
- `assertExecutionAuditPersistenceAllowed(env?)`

`assertExecutionAuditPersistenceAllowed(...)` returns:

- `ok`
- `environment`
- `persistenceEnabled`
- `productionAllowed`
- `errors`
- `warnings`

It does not throw during normal usage.

Action 226 added route branching through `lib/execution-audit-persistence-route-handler.ts`. The routes now evaluate the flag after request validation, but the enabled path still uses only the no-op writer and does not call Supabase.

Action 227 added `lib/execution-audit-supabase-writer.ts`, an injected-client Supabase writer implementation draft. It can insert mapped audit rows when a server DB client is supplied and flags allow persistence, but it is not wired into routes by default.

Action 228 wired route handler writer selection behind `EXECUTION_AUDIT_SUPABASE_WRITER_ENABLED`. Routes still default to no-op behavior. The Supabase writer is called only when both persistence and writer flags are true, the environment is allowed, and a server DB client is available.

## Environment Rules

`local_dev`:

- Allowed when `EXECUTION_AUDIT_SUPABASE_PERSISTENCE_ENABLED=true`.
- Intended for local Supabase or disposable development databases.

`staging`:

- Allowed when `EXECUTION_AUDIT_SUPABASE_PERSISTENCE_ENABLED=true`.
- Intended for staging only after the Action 219 migration has been applied and verified.

`production`:

- Blocked unless both flags are set:
  - `EXECUTION_AUDIT_SUPABASE_PERSISTENCE_ENABLED=true`
  - `EXECUTION_AUDIT_SUPABASE_ALLOW_PRODUCTION=true`
- Still not recommended yet because RLS and `user_id` ownership are unresolved.
- Emits a warning even when explicitly allowed.

Unknown environment:

- Normalizes to `local_dev`.
- Emits a warning.

Dev tools flag interaction:

- Persistence is independent of `NEXT_PUBLIC_ENABLE_EXECUTION_DEV_TOOLS`.
- If persistence is enabled while dev tools are disabled, the helper returns a warning so future server routes can make that state visible in logs or responses.

## Planned Route Behavior

Current behavior:

- Audit routes validate payloads and then evaluate the server-side persistence flags.
- With persistence disabled, routes return the existing accepted validation-stub responses.
- With persistence enabled for `local_dev` or `staging` and writer disabled, routes call the no-op writer and return an accepted response with a warning that no database write occurred.
- With persistence enabled and writer enabled, routes may call the injected-client Supabase writer if a server DB client is available.
- If the writer is enabled but no server DB client is available, routes return a failed response with a clear no-write message.
- With persistence enabled for `production` without `EXECUTION_AUDIT_SUPABASE_ALLOW_PRODUCTION=true`, routes return a blocked response and no write occurs.
- Routes use the existing server Supabase client helper only through a lazy provider and only on the explicit writer-enabled path.
- Default route behavior does not create a Supabase client and does not write database rows.

Future behavior after migration apply and explicit approval:

1. Read server-only flags.
2. Call `assertExecutionAuditPersistenceAllowed(...)`.
3. If not allowed, keep validation-only stub behavior or return a disabled response.
4. Validate the request contract.
5. If `EXECUTION_AUDIT_SUPABASE_WRITER_ENABLED` is false, use the no-op writer.
6. If writer is enabled, call `createSupabaseExecutionAuditPersistenceWriter(...)` with the lazy server DB client provider.
7. Map the request through `lib/execution-audit-persistence-writer.ts`.
8. Write the mapped payload to the matching Supabase table only on the writer-enabled path.
9. Return a stored response with the database row id when persisted.

Future route persistence should remain server-gated and disabled by default.

## Safety Boundaries

- Server-side flags only.
- No `NEXT_PUBLIC_` flag enables writes.
- No client-controlled persistence.
- No localStorage write requirement.
- No broker execution side effects.
- No Avanza automation.
- No `broker_execution_results` writes.
- No `execution_records` writes.
- No History or Statistics mutation.
- No live trade mutation.
- No production writes until RLS and `user_id` ownership are finalized.

## Environment Examples

Local development:

```bash
EXECUTION_AUDIT_SUPABASE_PERSISTENCE_ENABLED=true
EXECUTION_PERSISTENCE_ENVIRONMENT=local_dev
```

Staging:

```bash
EXECUTION_AUDIT_SUPABASE_PERSISTENCE_ENABLED=true
EXECUTION_AUDIT_SUPABASE_WRITER_ENABLED=true
EXECUTION_PERSISTENCE_ENVIRONMENT=staging
```

Production, not recommended yet:

```bash
EXECUTION_AUDIT_SUPABASE_PERSISTENCE_ENABLED=true
EXECUTION_AUDIT_SUPABASE_WRITER_ENABLED=true
EXECUTION_PERSISTENCE_ENVIRONMENT=production
EXECUTION_AUDIT_SUPABASE_ALLOW_PRODUCTION=true
```

Production should remain disabled until RLS, user ownership, retention, and server-only write policies are finalized.

## Recommended Sequence

1. Apply the audit migration in local/staging only after explicit approval.
2. Verify the tables, columns, indexes, RLS state, and zero-row baseline.
3. Keep `EXECUTION_AUDIT_SUPABASE_WRITER_ENABLED=false` until route writes are explicitly approved.
4. Enable writer only in local/staging after the migration is verified.
5. Keep production disabled.
6. Add staging-only write verification.
7. Revisit production only after RLS and ownership are solved.
