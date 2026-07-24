# Post-Trade API Route To Service Plan Wiring, No Write

## Summary

Purpose: wire the no-write post-trade API validation route to the no-write service-plan module so valid payloads return a sanitized dry-run persistence plan.

Result: route-to-service-plan wiring is ready. The route remains no-write and returns dry-run plan metadata only after successful validation.

Decision: `post_trade_api_route_service_plan_wiring_ready_no_write`.

## Updated Files

- `app/api/post-trade/payload/validate/route.ts`
- `tests/e2e/post-trade-api-route-stub.spec.ts`
- `tests/e2e/post-trade-persistence-service-plan.spec.ts`

Related files:

- `lib/post-trade-payload-validator.ts`
- `lib/post-trade-persistence-service-plan.ts`

## Route Behavior

The route now:

- parses JSON
- validates the payload with `validatePostTradePersistencePayload`
- calls `buildPostTradePersistenceDryRunPlan` only when validation succeeds
- returns sanitized dry-run plan metadata under `persistencePlan`
- returns `persistencePlan: null` for invalid or malformed payloads

The route still does not:

- return `acceptedPayload`
- echo raw rejected payload values
- import a Supabase client
- use `service_role`
- import or call a write service
- perform DB/Supabase writes
- activate API/runtime/UI write paths
- wire into Trade UI

## Sanitized Dry-Run Plan

For valid payloads, the route may return:

- `status: dry_run_only`
- `mode: no_write`
- target tables
- planned operation types marked `dry_run_planned_insert`
- operation mode marked `no_write_plan_only`
- idempotency key
- duplicate prevention key when present
- audit event plan summary with `wouldWrite: false`
- service-plan safety flags

The route does not return internal trade IDs, raw broker/browser material, credentials, cookies, sessions, BankID artifacts, unredacted broker documents, or arbitrary raw payload blobs.

## Test Coverage

Updated tests cover:

- valid payload returns sanitized dry-run plan
- invalid payload returns no dry-run plan
- raw broker/credential/session/BankID rejection returns no dry-run plan
- malformed JSON returns no dry-run plan
- response does not expose `acceptedPayload`
- response does not expose raw rejected payload values
- route imports no Supabase client
- route uses no service-role authority
- route has no write-service or DB/Supabase write fragments
- service plan is wired only into the API validation route
- Trade UI remains unwired

## Safety Confirmation

Confirmed for Action 441:

- no production connection
- no production state touch
- no production Supabase write
- no staging data write
- no test row insertion
- no migration apply
- no migration repair
- no DB write
- no Supabase write
- no Supabase client import
- no service-role usage
- no write service creation
- no write service call
- no API write behavior
- no API/UI activation
- no Trade UI execution
- no runtime write-path activation
- no Avanza/browser automation
- no credential/session/BankID handling
- no order behavior
- no settlement retrieval
- no real trade/broker data insertion
- no live trade mutation
- no live position mutation

## Remaining Gate

Future route-to-write-service work remains blocked until a separate write-service design and staging-only gate. Production writes, staging application writes, runtime activation, Trade UI execution, Avanza/browser automation, order behavior, settlement retrieval, and live trade/position mutation remain forbidden.

## Final Decision

`post_trade_api_route_service_plan_wiring_ready_no_write`
