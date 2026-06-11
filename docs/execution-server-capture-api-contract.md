# Execution Server Capture API Contract

Date: 2026-06-10

Status: Contract plus dev-only route stub and dev-only Settings tester. No Supabase migration, database code, persistence, localStorage write, broker automation, broker order, trade mutation, History/Statistics update, or Supabase write is implemented.

## Purpose

Action 215 defined the typed contract for a future trusted server-side execution capture path. Action 216 added a dev-gated route stub that exercises validation only. Action 217 added a frontend-safe client helper and a manual Settings test button for the route stub.

The TypeScript contract lives in `lib/execution-server-capture-contract.ts`. The dev-only route stub lives at `app/api/execution/capture/route.ts`. The frontend-safe client helper lives at `lib/execution-server-capture-client.ts`.

## Route Stub

Route:

```text
POST /api/execution/capture
```

Current Action 216 behavior:

- Enabled only when `NEXT_PUBLIC_ENABLE_EXECUTION_DEV_TOOLS=true`.
- Parses JSON request bodies.
- Validates the body with `validateExecutionServerCaptureRequest(...)`.
- Returns a contract-shaped accepted/rejected response.
- Returns 403 when execution dev tools are disabled.
- Returns 400 for malformed JSON or invalid capture requests.
- Returns 202 for valid requests.
- Does not call `buildTureExecutionRecord(...)`.
- Does not write Supabase.
- Does not write localStorage.
- Does not write files or a database.
- Does not mutate trades, History, or Statistics.
- Does not call external services.

Future intended responsibility, not implemented yet:

- Receive a server-capture request.
- Validate version, source, environment, intent, broker result, and idempotency key.
- Enforce trust boundaries and RLS/user ownership.
- Reject client-spoofed real filled executions.
- Eventually persist broker evidence and normalized execution records after migrations exist.

## Contract Version

```ts
EXECUTION_SERVER_CAPTURE_CONTRACT_VERSION = "execution_server_capture_v1"
```

Every request and response must include this version.

## Request Shape

```ts
type ExecutionServerCaptureRequest = {
  version: "execution_server_capture_v1";
  submittedAt: string;
  environment: "local_dev" | "staging" | "production";
  source: "manual" | "agent" | "bridge" | "mock" | "import";
  isMock: boolean;
  isDev: boolean;
  idempotencyKey: string;
  intent: ExecutionIntent;
  brokerResult: BrokerExecutionResult;
  agentRequest?: AvanzaAgentRequest;
  agentResult?: AvanzaAgentResult;
  bridgeEnvelope?: AvanzaAgentBridgeEnvelope;
  authoritySnapshot?: unknown;
  safetyChecks?: unknown[];
  metadata?: Record<string, unknown>;
};
```

Example local/dev mock-shaped request:

```json
{
  "version": "execution_server_capture_v1",
  "submittedAt": "2026-06-10T12:00:00.000Z",
  "environment": "local_dev",
  "source": "mock",
  "isMock": true,
  "isDev": true,
  "idempotencyKey": "execution_server_capture_v1:local_dev:mock:mock:dev:avanza:mock-order-123:intent-123:buy:aapl:10:filled",
  "intent": {
    "intent_version": "1.0",
    "intent_id": "intent-123",
    "created_at": "2026-06-10T11:59:00.000Z",
    "mode": "semi_automatic",
    "broker_hint": "AVANZA"
  },
  "brokerResult": {
    "broker_hint": "AVANZA",
    "status": "filled",
    "captured_at": "2026-06-10T12:00:00.000Z",
    "broker_order_id": "mock-order-123"
  }
}
```

The example is intentionally abbreviated for readability. Real `ExecutionIntent` and `BrokerExecutionResult` values must satisfy their full TypeScript contracts.

## Response Shape

```ts
type ExecutionServerCaptureResponse = {
  version: "execution_server_capture_v1";
  receivedAt: string;
  status: "accepted" | "duplicate" | "rejected" | "invalid" | "stored" | "failed";
  idempotencyKey: string | null;
  captureStatus?: BrokerExecutionCaptureStatus;
  record?: TureExecutionRecord;
  errors?: string[];
  warnings?: string[];
  message: string;
};
```

Example validation rejection:

```json
{
  "version": "execution_server_capture_v1",
  "receivedAt": "2026-06-10T12:00:01.000Z",
  "status": "invalid",
  "idempotencyKey": null,
  "errors": ["Execution server capture idempotencyKey is missing."],
  "warnings": [],
  "message": "Execution server capture request was rejected."
}
```

Example accepted response before storage exists:

```json
{
  "version": "execution_server_capture_v1",
  "receivedAt": "2026-06-10T12:00:01.000Z",
  "status": "accepted",
  "idempotencyKey": "execution_server_capture_v1:production:agent:real:nondev:avanza:order-123:intent-123:buy:aapl:10:filled",
  "warnings": ["Production real captures must be accepted only through a trusted server validation path."],
  "message": "Execution server capture request was accepted."
}
```

## Idempotency Strategy

`buildExecutionServerCaptureIdempotencyKey(...)` builds a deterministic key from non-sensitive normalized fields:

- contract version
- environment
- source
- mock/dev flags
- broker
- broker order id when present
- intent id
- action
- ticker
- quantity
- broker status

Rules:

- Prefer broker plus broker order id when available.
- Never include raw broker payloads, account identifiers, cookies, credentials, or page dumps.
- Real `broker_execution_results` should eventually require a unique idempotency key.
- Real captures should also have a unique `broker + broker_order_id` constraint when `broker_order_id` exists.
- Dev/mock duplicate keys must remain separate from real broker dedupe.
- Partial fills may require several broker observations for one broker order, so final database constraints need partial-fill semantics before migration.

## Validation Rules

`validateExecutionServerCaptureRequest(...)` checks:

- request exists
- contract version matches
- `submittedAt` is a valid timestamp
- `source` is one of `manual`, `agent`, `bridge`, `mock`, or `import`
- `environment` is one of `local_dev`, `staging`, or `production`
- `isMock` and `isDev` are explicit booleans
- `idempotencyKey` exists
- execution intent passes existing `validateExecutionIntent(...)`
- broker result has valid broker, status, and capture timestamp
- intent broker matches broker result broker
- filled quantity does not contradict intent quantity where possible
- mock source uses `isMock=true`
- production capture rejects mock/dev data unless explicitly allowed for a dev/test path
- production real capture emits a warning unless the future route marks it as trusted server capture

Validation does not write anything.

## Trust Boundary

Untrusted:

- Browser UI state.
- LocalStorage diagnostics.
- Dev mock broker result records.
- Client-submitted claims that a real order is filled.

Semi-trusted:

- Localhost bridge output.
- Local mock-agent output.
- Agent parser output before server validation.
- Bridge envelopes and progress diagnostics.

Trusted only after future server validation:

- Real broker result evidence accepted by a server route.
- Idempotency checks performed by the server.
- User ownership and RLS enforcement.
- Server-created normalized execution records.

Important boundary:

- The frontend should not directly insert real filled execution records.
- Local/mock capture remains dev-only.
- The future capture route must validate and decide whether broker evidence can be accepted.

## RLS And Security Notes

- No broker credentials or Avanza credentials should be stored.
- Do not store browser cookies, session data, passwords, 2FA material, or full raw page dumps.
- Use minimized raw payloads and normalized fields.
- Real inserts should be server-only.
- Clients may read their own records after RLS is designed.
- Service-role writes should be least-privilege and route-scoped.
- Production reads should hide `isMock=true`, `isDev=true`, and non-production `source_environment` data by default.

## Relation To Future Supabase Tables

The contract maps to the proposal in `docs/execution-persistence-schema-proposal.md`:

- `intent` maps to `execution_intents`.
- `brokerResult` maps to `broker_execution_results`.
- accepted normalized output maps to `execution_records`.
- `agentRequest`, `agentResult`, and `bridgeEnvelope` map to `agent_runs`, `agent_progress_events`, and `broker_handoffs`.
- `authoritySnapshot` and `safetyChecks` map to `authority_snapshot`, `safety_checks`, or `execution_safety_checks`.
- `idempotencyKey`, `environment`, `source`, `isMock`, and `isDev` support dedupe and dev/mock separation.

No table writes exist yet. The route stub validates only.

## Test Fixtures

Action 218 added shared Playwright/e2e fixtures in `tests/e2e/helpers/execution-server-capture-fixtures.ts`.

Fixtures:

- `buildValidDevMockExecutionServerCaptureRequest()`
- `buildInvalidExecutionServerCaptureRequestMissingIntent()`
- `buildInvalidExecutionServerCaptureRequestMissingBrokerResult()`
- `buildMismatchedExecutionServerCaptureRequest()`
- `buildProductionMockExecutionServerCaptureRequest()`

The fixtures use `buildExecutionServerCaptureRequest(...)` where a complete request can be built safely. They keep timestamps, ids, broker order ids, tickers, quantities, and idempotency keys deterministic so route and contract assertions stay stable.

## Validation Matrix

| Case | Expected route result | Contract behavior |
| --- | --- | --- |
| Valid `local_dev` mock request | `202 accepted` when dev tools are enabled | Validates `ok: true`, deterministic idempotency key, no record returned. |
| Missing intent | `400 invalid` | Error includes `Execution server capture intent is missing.` |
| Missing broker result | `400 invalid` | Error includes `Broker execution result is missing.` |
| Mismatched broker action/ticker/quantity | `400 invalid` | Errors include action, ticker, quantity, and filled quantity mismatch. |
| Production mock/dev request | `400 invalid` | Error includes `Production execution capture cannot be mock/dev data.` |
| Malformed JSON | `400 invalid` | Error includes `Execution capture request body must be valid JSON.` |
| Dev tools disabled | `403 invalid` | Message is `Execution capture stub is disabled in this build.` |

## Contract Hardening

Action 218 tightened validation:

- Broker result `action`, when present, must be `buy` or `sell`.
- Broker result `action`, when present, must match the execution intent action.
- Broker result `ticker`, when present, must match the execution intent ticker case-insensitively.
- Broker result `quantity`, when present, must match the execution intent quantity.
- Filled quantity must still match the intent quantity for `filled` results.
- Partial fill quantity must not exceed the intent quantity.
- `source` and `environment` must be known contract values.
- `production` plus `isMock` or `isDev` is invalid by default.
- `idempotencyKey` is required and must match `buildExecutionServerCaptureIdempotencyKey(...)`.

Production mock behavior is intentionally strict: production capture requests cannot be mock/dev data unless a future explicitly reviewed test-only pathway changes that with separate gating.

## Settings Tester

Action 217 added a dev-only manual tester in Settings under `Dev Mock Broker Results`.

The `Test server capture stub` button:

- Converts the selected `DevMockBrokerExecutionResult` to a mock `BrokerExecutionResult`-shaped object.
- Builds the matching dev mock `ExecutionIntent`.
- Builds an `ExecutionServerCaptureRequest` with `environment: "local_dev"`, `source: "mock"`, `isMock: true`, and `isDev: true`.
- Runs local validation before POSTing.
- POSTs through `postExecutionServerCaptureRequest(...)`.
- Displays accepted/rejected/disabled response status, HTTP status, idempotency key, message, errors, and warnings.
- Does not append execution records.
- Does not append audit events.
- Does not write Supabase or localStorage.
- Does not update trades, History, or Statistics.

The button is explicit and manual. No request is sent on render.

## Open Questions

- What auth/user ownership model should the future route use?
- What exact process is trusted to submit real broker evidence?
- Should the route accept only broker results, or should it atomically create broker result and execution record rows?
- How should partial fills be represented before `execution_records` exists?
- Should `authoritySnapshot` be required for all non-dev captures?
- Which safety checks are required for `automatic` mode?
- Should local/dev mock capture ever be accepted by a server route, or remain local-only forever?
- What retention policy applies to request metadata and minimized raw payloads?

## Action 216 Route Stub

Action 216 added the dev-only route stub at `POST /api/execution/capture`.

The stub validates request shape and returns accepted/rejected contract responses. It remains disabled outside execution dev tools and performs no persistence.

## Action 217 Client And Settings Tester

Action 217 added:

- `lib/execution-server-capture-client.ts`
- Settings `Dev Mock Broker Results` button: `Test server capture stub`
- E2E coverage for the UI-driven accepted stub response

The route remains validation-only and dev-gated.

## Action 218 Fixtures And Contract Hardening

Action 218 added shared fixtures and broader validation coverage for the execution server capture contract and route stub. It did not add persistence.

## Recommended Action 219

Preferred next action:

- Action 219 - Execution Capture Stub Error State Hardening

This should polish timeout, disabled, malformed response, and local validation display without adding persistence.

Alternative:

- Action 219 - Minimal Supabase Migration Draft

Only choose this after the dev-only route and UI tester have been reviewed.
