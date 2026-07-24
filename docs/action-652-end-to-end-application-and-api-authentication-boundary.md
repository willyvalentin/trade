# Action 652 - End-to-End Application And API Authentication Boundary

**Status: `action_650_compatibility_ready`; full local schema/effective-role
validation is complete, not production verified.**

## Previous Exposure Model

The application used `TRADE_APP_PASSWORD` to create a deterministic browser
cookie derived only from the shared password. Proxy passed all `/api/*` routes
through, and browser components used the public Supabase client directly for
recommendations, positions, settings, scans, snapshots, and outcomes. The
cookie was not an expiry-bound application session and did not provide a
server-owned data boundary.

This Action introduces a bounded interim single-trusted-operator session. It
does not claim per-user ownership. A future identity/ownership Action must
replace this contract before multi-user access is contemplated.

## Canonical Session Contract

| Contract item | Value |
| --- | --- |
| Cookie | `trade_auth` |
| Format | HMAC-SHA-256 signed minimal payload; no password, username, or browser-readable secret |
| Payload | version, trusted-operator role, issued-at, expiry |
| Lifetime | eight hours maximum |
| Cookie flags | `HttpOnly`, `SameSite=Lax`, `Path=/`, `Secure` in production, explicit `Max-Age` |
| Verification | signature, schema, bounded lifetime, and expiry are checked server-side on every protected route |
| Invalid/missing session | page redirect to `/login`; API JSON `401` with a redacted deterministic error |
| Logout | clears the cookie with the same cookie scope |
| Local development | no bypass: a configured `TRADE_APP_PASSWORD` is still required |

The session is deliberately distinct from `AUTOMATION_SECRET`. Automation,
scheduled functions, and service-role RPCs keep their existing authorization
contracts; an application cookie never authorizes them.

## Access Matrix

| Surface | Classification | Boundary |
| --- | --- | --- |
| `/login`, `/api/auth/login`, `/api/auth/logout` | public by design | login creates or clears only the application session |
| `/` and TradeApp history/statistics/live-trade surfaces | requires application session | Proxy optimistic redirect plus server page guard |
| `/settings` | requires application session | protected server layout and authenticated first-party settings API |
| `/mock-broker/*`, `/sandbox-broker`, `/dev/*` | requires application session | protected server layouts; still local/mock capability only |
| `/ping307h`, `/public-probe-307g`, `/route-publication-probe` | public by design | diagnostics only; no trading data |
| `/api/app/dashboard`, `/api/app/settings`, `/api/app/execution-records` | requires application session | fixed-purpose server-owned data routes |
| `/api/symbol-metadata`, `/api/market-calendar/status`, `/api/recommendations/generate`, `/api/recommendations/validate-add-trade`, `/api/positions/update` | requires application session | route-level guard in addition to Proxy |
| `/api/recommendations/evaluate-outcomes`, `/api/diagnostics/run-scan`, `/api/automation/*`, `/api/historical-backfill/*` | requires automation secret or service role | intentionally not replaced by application session |
| Netlify scheduled functions and service-role persistence/RPCs | requires service role / scheduler authorization | intentionally outside browser/session boundary |
| development/mock routes | local-development only where their existing route contract says so | never promoted by this Action |

Unknown or unclassified API paths fail closed at Proxy unless explicitly
listed as public or automation/service-role paths. Static assets remain outside
the Proxy matcher.

## Browser-To-Server Migration

Implemented server-owned data routes are intentionally fixed-purpose:

- dashboard data: recommendations, positions, position updates, scans,
  batches, snapshots, outcomes, settings, and market-regime readback;
- user settings: read, initial-row create, and bounded update fields;
- execution records: bounded read DTO only.

Settings now uses the first-party settings route and no longer imports the
browser Supabase client. The market-calendar, symbol metadata, recommendation
generation/validation, and position-update APIs require the canonical session.

### Action 652B Browser Data Migration

The original TradeApp inventory contained 16 direct browser operations against
Action 650-contained tables: dashboard reads; four outcome backfill reads;
recommendation lifecycle update; position open, partial-close, and close
updates (including legacy fallbacks); and automatic scan-run, batch, snapshot,
and outcome persistence effects. All reads now use the authenticated dashboard
or outcome-backfill routes. Recommendation and position actions now use fixed
purpose authenticated commands. There is no browser Supabase client import in
`app/trade-app.tsx` and no direct browser `SELECT`, `INSERT`, `UPDATE`,
`DELETE`, or `UPSERT` operation for the contained tables.

The final four effects were removed rather than proxied:

| Logical entity | Former browser trigger | Decision | Authoritative owner |
| --- | --- | --- | --- |
| scan run | derived visible scan state | duplicate removed | scheduled/manual server scan routes |
| recommendation batch | derived batch state | duplicate removed | scheduled/manual server scan routes |
| recommendation snapshot | visible recommendation snapshot change | duplicate removed | scheduled/manual server scan routes |
| recommendation outcome | visible outcome change | duplicate removed | server outcome evaluation route |

The browser no longer treats localStorage as durable fallback for these four
entities. It reads the server-owned dashboard model and keeps only transient
in-memory evaluation output until the next authoritative refresh. A failed
authoritative read is surfaced in island diagnostics rather than represented as
a successful local persistence result.

The browser-side count for all Action 650-contained table operations is now:

| Operation | Count |
| --- | ---: |
| direct production browser `SELECT` | 0 |
| direct production browser `INSERT` | 0 |
| direct production browser `UPDATE` | 0 |
| direct production browser `DELETE` | 0 |
| direct production browser `UPSERT` | 0 |

The affected Action 650 table inventory is classified as follows:

| Table/group | Classification |
| --- | --- |
| recommendations, positions, position_updates, user_settings | move behind authenticated server route now |
| scanner_cache, market_calendar_cache, market_regime_snapshots, symbol_metadata | bounded authenticated read / server refresh only |
| recommendation_batches, recommendation_outcomes, recommendation_scan_runs, recommendation_snapshots, scheduled_scan_runs, scheduled_scan_attempts | dashboard read route now; scheduled/service writer only |
| execution_records | authenticated server DTO read only |
| execution_agent_runs, execution_agent_progress_events, execution_lifecycle_events, execution_record_audit_events | server/service-role only; no browser table access |

### Action 652C Transactional Open-Position Command

`POST /api/app/positions` now invokes only
`public.app_open_position_transaction(...)`. The function is a narrow
`SECURITY DEFINER` command with `search_path = pg_catalog, public`; execution is
revoked from `PUBLIC`, `anon`, and `authenticated`, and granted only to
`service_role`.

Its deterministic idempotency identity is the locked recommendation ID plus
the complete canonical command payload. A retry with exactly the same ticker,
company, prices, quantity, targets, stop, metadata, and command version returns
the existing position as `reused`. A changed payload, multiple existing linked
positions, an already-taken recommendation without a matching position, or a
conflicting snapshot linkage fails closed. No token, arbitrary table, filter,
or client-generated idempotency key enters the command.

After success, the invariant is:

1. exactly one open position is linked to the intended recommendation;
2. the recommendation is `taken`;
3. every matching snapshot is marked `taken` and linked to that same position;
4. entry, size, stop, targets, and execution metadata match the admitted
   command; and
5. unrelated recommendations, positions, and snapshots are unchanged.

The single PostgreSQL transaction locks the recommendation before checking an
existing position, then inserts the position, transitions the recommendation,
and links snapshots. Any exception, including a failure after the insert or a
snapshot-link conflict, rolls back every change. The disposable PostgreSQL
harness covers successful commit, idempotent retry, forced post-insert rollback,
snapshot-link rollback, and anonymous-role denial.

Migration order is fixed:

1. apply `20260724001500_create_transactional_open_position_command.sql`;
2. deploy the Action 652 application/session and server-route boundary;
3. verify an authenticated open-position command against the canonical server
   read model;
4. apply Action 650 containment; and
5. verify anon denial and server/scheduled functionality through the containment
   effective-role suite.

### Action 652D Full-Schema Effective-Role Validation

A disposable complete-schema replay assembled from current `origin/main`, the
read-only Action 650 PR artifact at
`055002ebf6af420a1e8fdd6246bb7df96aceff32`, and this Action's forward migration
passed. The ordered local replay was:

1. current-main contained-table migrations;
2. `20260724001500_create_transactional_open_position_command.sql`; and
3. `20260724002000_contain_production_trading_data_access.sql`.

The initial `20260724003000` local filename was discovered to sort after Action
650 and was corrected before any migration application. No remote migration was
changed or applied.

| Role | 19 contained tables | Transactional RPC |
| --- | --- | --- |
| `PUBLIC` | no direct read or write privileges | denied |
| `anon` | select/insert/update/delete denied | denied |
| `authenticated` | select/insert/update/delete denied | denied |
| `service_role` | required server/scheduled table access retained | allowed |

The original full Action 650 local effective-role harness passed with all 19
tables, RLS enabled, no `PUBLIC` grant, and append-only execution event tables
rejecting update/delete. The Action 652C transactional harness also passed under
the corrected order: atomic commit, idempotent reuse, forced post-insert
rollback, snapshot-link rollback, and anonymous denial. A separate combined
replay proved Action 650 does not prevent the `service_role` RPC from completing
the bounded command.

Application and scheduled behavior remains locally covered by the Action 652
session/API tests and scheduled outcome regressions. This is local evidence
only: authenticated browser smoke against a deployed environment and production
catalog verification remain explicit rollout gates.

### Action 652F Containment Remediation

Action 652E found that several server and scheduled modules still imported the
browser Supabase client. Action 652F removes that compatibility path. Every
contained-table server path now acquires the explicit server-only service-role
client and treats missing credentials as unavailable; `getServerSupabaseReadClient`
is retained only as a compatibility name and no longer downgrades to `anon`.

| Former path | Replacement boundary |
| --- | --- |
| scheduled scan runs, attempts, recommendation archival | automation route + service role |
| manual generation and position monitoring | application session route + service role |
| scanner, intraday indicator, calendar, symbol metadata caches | server-only service role |
| discard review and outcome snapshot fallback | server-only service role |
| scan-log parsing | pure `scan-log-core` module |
| scan-log persistence | server-only `scan-log-persistence` module |

The browser graph test now recursively follows runtime imports from
`app/trade-app.tsx`; a transitive import of the browser client, a server module,
or a persistence helper is a test failure. Parsing scan-log messages is pure and
cannot write data.

Session-authenticated mutations have a shared Origin guard. Unsafe methods must
present an exact same-origin `Origin`; production requires the deployment-owned
`TURE_APPLICATION_ORIGIN` and fails closed when that configuration is absent.
Automation-secret and scheduled routes retain their separate authorization
models.

### Action 652G Shared Abuse Control And Origin Readiness

Production login now reserves every attempt through two service-role-only
PostgreSQL RPCs backed by a digest-only bucket table. One coarse global bucket
and one SHA-256 client bucket share a fixed fifteen-minute window. A successful
login finalizes one reservation; failed attempts retain it. Production login
fails closed if the shared store is unavailable. Process-local protection is
development-only defense in depth and is never the production primary control.

The trusted production identity source is Netlify's
`x-nf-client-connection-ip`; `X-Forwarded-For` is never trusted. If the trusted
identity is missing, the global bucket still applies while no per-client bucket
is created. No raw address, password, token, cookie, or session is persisted.

`TURE_APPLICATION_ORIGIN` is required for production unsafe session requests.
It must be one exact canonical HTTPS origin with no credentials, path, query, or
fragment. A missing or malformed value fails closed. The safe origin readiness
helper exposes only configured/valid/expected-host-match booleans.

No new position uniqueness index is added. The schema permits historical closed
positions and does not prove that one position ever per recommendation is a
valid invariant. The bounded RPC remains the sole supported open-position
writer; a database-wide uniqueness rule is deferred until reopen semantics are
explicitly defined.

## Action 650 Dependency And Rollout

Action 650 must **not** be applied while a production browser flow still needs
the public Supabase client. The safe sequence is:

1. review and merge Action 652 before Action 650;
2. apply the Action 652 transactional migration;
3. deploy Action 652 and verify authenticated server-route flows;
4. merge and apply Action 650 only with explicit production approval;
5. verify production catalog denial, server/scheduled persistence, and browser
   authenticated flows without restoring anonymous access.

Rollback is a forward fix through the authenticated server contract. Anonymous
database access must not be restored as a compatibility shortcut.

## No-Effect Boundaries

This Action adds only the bounded local/forward transactional migration. It does
not change providers, brokers, scans, rankings, learning, scheduled execution,
production configuration, or production database data. It does not grant
application sessions automation or service-role authority.
