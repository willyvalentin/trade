# D-01.1 — Server Supabase credential-alias boundary

Status: source-only, fail-closed prerequisite hardening. No remote client is
created unless exactly one non-empty service-role environment alias is present.

## Decision record

| Field | Record |
| --- | --- |
| Decision ID and workstream | `D-01.1`, canonical-outcome data readiness |
| Autonomous controller and verifier | Codex autonomous governance controller; focused Playwright contract tests plus TypeScript/lint verification |
| Evidence revision | This branch's `lib/supabase-server.ts` and `tests/e2e/d01-server-supabase-credential-alias-boundary.spec.ts` |
| Alternatives considered | Preserve historical first-alias precedence, or reject an ambiguous environment. The second is selected. |
| Residual risk | Deferred: a single configured alias still needs its own target, privilege and runtime-admission proof before it may access staging. |
| Decision | Accept exactly one non-empty alias from `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_SERVICE_ROLE`, or `SUPABASE_SERVICE_ROLE_SECRET`; return no client for zero or multiple aliases. |
| Next product outcome | A future staging D-01 capture can identify one deliberate server credential without silently selecting among conflicting configuration. |
| Rollback/containment | Remove a duplicate alias from the isolated runtime configuration; no database call is made when the ambiguity is detected. |

## Boundary

The module remains `server-only`. It does not load `.env.local`, log a
credential, open a connection during resolution, add a route, enable the
canonical writer, or grant staging, production, provider, broker or deployment
authority. `NEXT_PUBLIC_SUPABASE_URL` remains public configuration, but a
service-role value remains server-only and is never returned by the resolver.

This aligns the shared server client with the existing staging-diagnostic
preflight rule: ambiguous service-role aliases are a stop condition, not a
precedence decision.
