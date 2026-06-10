# Avanza Localhost Bridge Contract

Date: 2026-06-09

## Purpose

This document defines the first localhost bridge server contract for a future external Avanza execution agent.

The contract describes how Ture will communicate with a local process bridge. It does not implement browser automation, Avanza page interaction, broker execution, broker confirmation, Supabase write, or trade-state mutation.

The matching TypeScript contract lives in `lib/avanza-localhost-bridge-contract.ts`.

## Current Status

Status: contract plus local no-op/echo server stub.

Current bridge/runtime behavior remains diagnostics-only:

- `none`: no-op bridge, unavailable, no broker effects.
- `echo`: dev-only bridge, local protocol test only, no broker effects.

A manually started localhost bridge server stub exists at `scripts/avanza-localhost-bridge-server.mjs`. It is not started by the Next.js app. Ture can call it only through explicit dev-only health, dry-run, and cancel diagnostics.

Settings can perform an explicit dev-only health check against `GET /health`.
The Execution Handoff Preview Modal can perform an explicit dev-only dry-run
echo request against `POST /run` and an explicit dev-only cancel contract test
against `POST /cancel`.

A separate dev-only mock order ticket exists at `/mock-broker/order`. It is not
Avanza and cannot submit or capture orders. Its selector/fill-plan contract
lives in `lib/mock-order-page-agent-contract.ts`. The localhost bridge dry-run
`/run` response can now include a mock order fill plan and relative mock page
URL for local testing only.

By default, the bridge still does not open a browser, fill the page, submit an
order, or create a broker result. For local QA only, `/run` can optionally carry
`enableMockAgentRun: true` and a localhost `mockPageBaseUrl`. That explicit
mode imports the manual mock-page runner, opens only localhost
`/mock-broker/order`, fills the mock ticket from the generated fill plan, clicks
only `Review mock order`, and verifies the disabled final submit remains
disabled. It never opens Avanza and never creates `brokerResult`.

## Constants

Contract version:

```text
avanza_localhost_bridge_v1
```

Default port:

```text
47831
```

Default base URL:

```text
http://127.0.0.1:47831
```

Endpoint paths:

```text
GET  /health
POST /run
POST /cancel
GET  /events/:requestId
WS   /events
```

`GET /events/:requestId` is reserved for future polling or server-sent-event style progress. `WS /events` is reserved for future websocket progress. Neither transport is implemented yet.

## Local Stub Server

Run the stub manually:

```bash
npm run bridge:localhost
```

By default it binds to `127.0.0.1:47831`. Override the port for local testing:

```bash
AVANZA_LOCALHOST_BRIDGE_PORT=47832 npm run bridge:localhost
```

Run the local smoke check:

```bash
npm run bridge:localhost:smoke
```

The smoke check starts the stub on a test port, checks `/health`, sends one
valid dry-run `/run`, confirms the default path does not attempt the mock-agent
runner, sends one explicit mock-agent `/run` with a non-local mock page base URL
to verify safe failure metadata, sends one invalid `/run`, checks `/cancel`, and
verifies the run result does not include `brokerResult`.

From Settings, use `Check localhost stub` to verify whether the manually
started stub is reachable. This button performs a health check only and never
sends a run or cancel request.

From the Execution Handoff Preview Modal, use `Run localhost bridge echo` to
send the current future-agent request and bridge envelope to the local stub.
This is dev-only and manual. It calls `POST /run` with `dryRun: true`, displays
the echo response, and may save local diagnostics. It does not create a
`TureExecutionRecord`, broker confirmation, Supabase row, or trade-state change.

Use `Cancel localhost bridge run` to test the local `/cancel` contract. This is
also dev-only and manual. It acknowledges a local stub request id only and does
not cancel a real Avanza session, browser action, broker order, or trade.

The stub is local development tooling only:

- It binds to `127.0.0.1`, not `0.0.0.0`.
- It uses Node's built-in `http` module.
- It has no Avanza URL, credential field, browser automation, external call, Supabase write, or broker-result creation.
- It returns echo/protocol progress only.

## Health

`GET /health` should return a `LocalhostBridgeHealthResponse`.

Abbreviated example:

```json
{
  "version": "avanza_localhost_bridge_v1",
  "bridgeName": "Ture Localhost Bridge Stub",
  "bridgeStatus": "available",
  "transport": "http",
  "serverTime": "2026-06-09T10:00:00.000Z",
  "message": "Localhost bridge stub is available for dry-run diagnostics only.",
  "health": {
    "status": "available",
    "transport": "local_process",
    "checkedAt": "2026-06-09T10:00:00.000Z",
    "message": "Localhost bridge stub is running. No Avanza connection exists."
  },
  "capabilities": {
    "transport": "local_process",
    "supportsProgressEvents": true,
    "supportsCancellation": true,
    "supportsAutomaticSubmit": false,
    "supportsManualConfirmationWait": true,
    "supportsBrokerResultReturn": false,
    "supportsRealBrokerAutomation": false,
    "maxConcurrentRuns": 1,
    "version": "avanza_localhost_bridge_v1"
  }
}
```

Safety expectations:

- `supportsRealBrokerAutomation` must stay `false` for the first stub.
- `supportsBrokerResultReturn` must stay `false` until the mock broker-result phase.
- The health response must not imply an Avanza session is connected.

Curl example:

```bash
curl http://127.0.0.1:47831/health
```

## Run Request

`POST /run` should accept a `LocalhostBridgeRunRequest`.

Example:

```json
{
  "version": "avanza_localhost_bridge_v1",
  "dryRun": true,
  "envelope": {
    "envelopeId": "avanza_agent_bridge_request_2026-06-09T10_00_00_000Z_000001",
    "createdAt": "2026-06-09T10:00:00.000Z",
    "version": "avanza_agent_bridge_v1",
    "type": "request",
    "requestId": "avanza_agent_request_2026-06-09T10_00_00_000Z_000001",
    "transport": "local_process",
    "payload": {
      "requestId": "avanza_agent_request_2026-06-09T10_00_00_000Z_000001",
      "version": "avanza_agent_request_v1",
      "broker": "avanza"
    },
    "metadata": {
      "local_diagnostics_only": true
    }
  },
  "request": {
    "requestId": "avanza_agent_request_2026-06-09T10_00_00_000Z_000001",
    "createdAt": "2026-06-09T10:00:00.000Z",
    "version": "avanza_agent_request_v1",
    "broker": "avanza",
    "handoff": null,
    "mode": "semi_automatic",
    "action": "sell",
    "authority": null,
    "safetyChecks": [],
    "requireManualFinalConfirmation": true,
    "allowAutomaticFinalSubmit": false
  },
  "enableMockAgentRun": false,
  "mockPageBaseUrl": "http://localhost:3000",
  "mockAgentHeaded": false,
  "metadata": {
    "source": "ture_execution_sandbox",
    "mock_order_page_only": true
  }
}
```

Contract rules:

- `dryRun` must be `true`.
- `envelope.type` must be `request`.
- `envelope.requestId`, `envelope.payload.requestId`, and `request.requestId` must match when present.
- The bridge must validate the embedded `AvanzaAgentRequest`; real contract payloads must include a ready handoff and pass `validateAvanzaAgentRequest(...)`.
- `enableMockAgentRun` is optional and defaults to `false`. When false or omitted, `/run` must not open a browser.
- `mockPageBaseUrl` is optional and must be a localhost HTTP(S) URL when provided.
- `mockAgentHeaded` is optional and local QA only.
- The bridge must not prepare, submit, simulate, or execute a real broker order.
- The default localhost server path should return echo/progress only and must not launch the mock-page runner.

Curl example:

```bash
curl -X POST http://127.0.0.1:47831/run \
  -H 'Content-Type: application/json' \
  -d '{
    "version": "avanza_localhost_bridge_v1",
    "dryRun": true,
    "envelope": {
      "envelopeId": "avanza_agent_bridge_request_local_example",
      "createdAt": "2026-06-09T10:00:00.000Z",
      "version": "avanza_agent_bridge_v1",
      "type": "request",
      "requestId": "avanza_agent_request_local_example",
      "transport": "local_process",
      "payload": {
        "requestId": "avanza_agent_request_local_example",
        "version": "avanza_agent_request_v1",
        "broker": "avanza"
      }
    },
    "request": {
      "requestId": "avanza_agent_request_local_example",
      "createdAt": "2026-06-09T10:00:00.000Z",
      "version": "avanza_agent_request_v1",
      "broker": "avanza",
      "handoff": null,
      "mode": "semi_automatic",
      "action": "sell",
      "authority": null,
      "safetyChecks": [],
      "requireManualFinalConfirmation": true,
      "allowAutomaticFinalSubmit": false
    }
  }'
```

## Run Response

`POST /run` should return a `LocalhostBridgeRunResponse`.

Example:

```json
{
  "version": "avanza_localhost_bridge_v1",
  "requestId": "avanza_agent_request_2026-06-09T10_00_00_000Z_000001",
  "accepted": true,
  "message": "Dry-run request accepted by localhost bridge stub. No browser was opened.",
  "mockOrderPageAvailable": true,
  "mockOrderPageUrl": "/mock-broker/order?ticker=QA.TEST&action=sell&quantity=12&orderType=limit&limitPrice=42.25&targetPrice=48.75&stopLossPrice=39.5&mode=semi_automatic&requireManualFinalConfirmation=true&allowAutomaticFinalSubmit=false&requestId=avanza_agent_request_2026-06-09T10_00_00_000Z_000001&intentId=execution_intent_2026-06-09T10_00_00_000Z_000001",
  "mockOrderPageMessage": "Mock order fill plan generated for local testing only. No browser was opened.",
  "mockOrderFillPlanValid": true,
  "mockOrderFillPlanErrors": [],
  "mockOrderFillPlan": {
    "version": "mock_order_page_fill_plan_v1",
    "targetPath": "/mock-broker/order",
    "source": "avanza_agent_request",
    "requestId": "avanza_agent_request_2026-06-09T10_00_00_000Z_000001",
    "intentId": "execution_intent_2026-06-09T10_00_00_000Z_000001",
    "intentIdExpected": true,
    "values": [
      {
        "fieldKey": "ticker",
        "selector": {
          "fieldKey": "ticker",
          "testId": "mock-order-ticker",
          "dataAgentField": "mock-order-ticker"
        },
        "value": "QA.TEST"
      }
    ]
  },
  "mockAgentRunAttempted": false,
  "warnings": [
    "No Avanza connection exists.",
    "No broker result will be created by this stub.",
    "Mock order fill plan metadata is dry-run payload only; no browser was opened."
  ],
  "result": {
    "requestId": "avanza_agent_request_2026-06-09T10_00_00_000Z_000001",
    "createdAt": "2026-06-09T10:00:00.000Z",
    "status": "unknown",
    "progressEvents": [],
    "rawSummary": "Localhost bridge stub completed dry-run protocol test. No broker result was created."
  }
}
```

Contract rules:

- `accepted` means the local bridge accepted the dry-run protocol request. It does not mean a broker order exists.
- `mockOrderFillPlan` and `mockOrderPageUrl` are response-level dry-run metadata only. They are not `brokerResult`.
- `mockOrderPageUrl` is relative and manual-only. Ture and the bridge must not auto-open it.
- `mockOrderFillPlanValid=false` can be returned while `accepted=true` if the bridge request is valid but the embedded agent request lacks enough mock-page field data.
- `mockAgentRunAttempted`, `mockAgentRunOk`, `mockAgentRunMessage`, `mockAgentRunErrors`, `mockAgentRunStartedAt`, and `mockAgentRunCompletedAt` are response-level metadata for the explicit local mock-agent run mode only.
- If `enableMockAgentRun=true` and the local app is unavailable, the URL is invalid, or the mock page cannot be reviewed, `accepted` may still be `true` for a valid bridge request while `mockAgentRunOk=false` reports the local mock-agent failure.
- `result.brokerResult` must remain undefined until the mock broker-result phase.
- Any real broker result in a future phase must be captured, normalized, and audited.

## Cancel

`POST /cancel` should accept a `LocalhostBridgeCancelRequest`.

Example request:

```json
{
  "version": "avanza_localhost_bridge_v1",
  "requestId": "avanza_agent_request_2026-06-09T10_00_00_000Z_000001",
  "reason": "User closed the handoff preview modal."
}
```

Example response:

```json
{
  "version": "avanza_localhost_bridge_v1",
  "requestId": "avanza_agent_request_2026-06-09T10_00_00_000Z_000001",
  "cancelled": true,
  "message": "Dry-run request cancelled. No broker action occurred."
}
```

Curl example:

```bash
curl -X POST http://127.0.0.1:47831/cancel \
  -H 'Content-Type: application/json' \
  -d '{
    "version": "avanza_localhost_bridge_v1",
    "requestId": "avanza_agent_request_local_example",
    "reason": "Local test finished."
  }'
```

## Event Stream

Future polling, SSE, or websocket progress should use `LocalhostBridgeEventStreamMessage`.

Progress message:

```json
{
  "version": "avanza_localhost_bridge_v1",
  "type": "progress",
  "requestId": "avanza_agent_request_2026-06-09T10_00_00_000Z_000001",
  "createdAt": "2026-06-09T10:00:01.000Z",
  "progressEvent": {
    "eventId": "avanza_agent_progress_2026-06-09T10_00_01_000Z_000001",
    "requestId": "avanza_agent_request_2026-06-09T10_00_00_000Z_000001",
    "createdAt": "2026-06-09T10:00:01.000Z",
    "type": "agent_started",
    "message": "Localhost bridge dry-run started. No broker page opened."
  }
}
```

Result message:

```json
{
  "version": "avanza_localhost_bridge_v1",
  "type": "result",
  "requestId": "avanza_agent_request_2026-06-09T10_00_00_000Z_000001",
  "createdAt": "2026-06-09T10:00:02.000Z",
  "result": {
    "requestId": "avanza_agent_request_2026-06-09T10_00_00_000Z_000001",
    "createdAt": "2026-06-09T10:00:02.000Z",
    "status": "unknown",
    "progressEvents": [],
    "rawSummary": "Dry-run complete. No broker result was created."
  }
}
```

Heartbeat message:

```json
{
  "version": "avanza_localhost_bridge_v1",
  "type": "heartbeat",
  "createdAt": "2026-06-09T10:00:03.000Z"
}
```

## Validation Helpers

The TypeScript contract exports:

- `validateLocalhostBridgeHealthResponse(...)`
- `validateLocalhostBridgeRunRequest(...)`
- `validateLocalhostBridgeRunResponse(...)`
- `validateLocalhostBridgeCancelRequest(...)`
- `validateLocalhostBridgeCancelResponse(...)`
- `validateLocalhostBridgeEventStreamMessage(...)`
- `buildLocalhostBridgeRunRequest(...)`

`buildLocalhostBridgeRunRequest(...)` is a pure builder. It does not send anything. It always produces `dryRun: true` and rejects mismatched envelope/request IDs.

## Safety Rules

- `dryRun` is true by default and required in v1.
- No Avanza page is in scope for the first localhost server prototype.
- The mock order page exists for dev QA only. The localhost bridge may return a mock fill plan and relative mock page URL by default, but it must not auto-open, auto-fill, submit, or capture anything.
- `scripts/mock-order-page-agent-runner.mjs` can manually consume a local fill plan for mock-page QA.
- The bridge may import that runner only when `/run` explicitly sets `enableMockAgentRun=true`; that mode is localhost-only, mock-page-only, and review-only.
- No credentials are accepted by this contract.
- No automatic final submit is allowed in the first localhost bridge stub.
- No real broker order may be prepared, submitted, simulated, or executed.
- `brokerResult` must remain undefined until the mock broker-result phase.
- All future real broker results must be captured and logged.
- All future runs must be auditable from request to progress to result.
- The local bridge must expose cancellation or a documented safe-stop behavior.

## Versioning Rules

- `avanza_localhost_bridge_v1` is additive-only while the contract is in sandbox development.
- Breaking changes require a new version string.
- Endpoint paths should remain stable for v1.
- Event stream messages must include `version`, `type`, and `createdAt`.
- Request-scoped messages must include `requestId`.

## Recommended Next Action

Recommended next action: exercise the Action 202 explicit local mock-agent run
mode against a dev server when local mock-page browser-control QA is needed.

Any future proof of concept should still avoid Avanza access, real broker
execution, broker-result creation, Supabase writes, and trade mutation.
