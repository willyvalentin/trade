# SV-A.2 Observation-Cycle Receipts

## Delivered capability

The normal scan route now advances one owner-bound, versioned receipt from
route admission to its terminal result. The receipt distinguishes:

- scheduler/route trigger;
- admission;
- provider request;
- provider response;
- freshness;
- discovery and evaluation;
- publication, `no_trade`, or rejection.

The existing `scheduled_scan_attempts` claim remains the invocation and
idempotency authority. The generic receipt uses the same attempt fingerprint
and an `(owner_user_id, cycle_fingerprint)` unique key, so terminal persistence
updates the active receipt instead of creating a second cycle.

## Safety boundary

`observation_cycle_receipts` is a server-only read model. Direct privileges are
revoked from `anon` and `authenticated`; only `service_role` may select, insert
or update. Every payload is constrained to an inert authority object whose
scheduler, provider, ranking, publication, paper and broker capabilities are
all `false`.

The feature does not add a scheduler, provider request, ranking rule,
publication gate, paper action or broker path. Failure to persist the existing
attempt stops receipt persistence. Failure to persist the new read model is
reported but does not retry provider work or alter the scan result.

## Readback

The authenticated dashboard API selects receipts only for the verified owner,
strictly revalidates persisted columns against the versioned JSON payload and
reports malformed rows as partial readback. The Market Diagnostics console
shows the latest cycle stage by stage and exposes whether its authority remains
inert.

`scheduled_scan_runs` remains a compatibility surface. No historical record is
deleted or reclassified by this delivery.

## Acceptance evidence

- strict TypeScript no-emit: pass;
- changed-file ESLint: pass;
- receipt/parser/readback/wiring suite: 6/6 pass;
- existing scheduled-invocation/idempotency suite: 17/17 pass;
- scheduled runtime packaging: pass;
- PostgreSQL 17 isolated migration and transactional SQL test: pass;
- migration rollback in the SQL test: pass;
- full Next 16.3.4 webpack production build: pass;
- Turbopack build from the isolated worktree: environment-blocked because the
  worktree reuses `node_modules` through a symlink outside Turbopack's
  filesystem root.

## Production delivery

- PR #649 merged as main
  `e3f9ea435d76545a39c4343327833aa7ab8ee67f`;
- protected exact-main CI run `36234687506`: passed;
- Netlify production deploy `6ab798ba2ecf42000803665b`: `ready`, branch
  `main`, context `production`, exact merge revision;
- Supabase production migration record:
  `20260926100240_sv_a2_observation_cycle_receipts`;
- production catalog readback: RLS enabled, no `anon`/`authenticated` direct
  access, `service_role` select/insert/update only, no delete, constrained
  trigger/function and four expected indexes;
- retained production rows at verification: zero.

This establishes merged, deployed and production-schema-verified capability.
No normal market cycle has yet environment-verified the new receipt, and none
of this is evidence of improved ranking, recommendation quality or alpha.
