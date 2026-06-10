# Avanza Agent Bridge Transport Decision

Date: 2026-06-09

## Decision

The first real external bridge prototype should be a local process bridge exposed to Ture through localhost HTTP or WebSocket, initially targeting a mock order page only.

This is not an Avanza integration decision. Avanza remains out of scope until the local bridge contract, progress stream, cancellation behavior, mock order automation, and broker-result capture model are stable and manually verified.

Recommended next action: Action 191 - Localhost Bridge Server Stub Contract.

## Current State

Ture now has the typed execution-agent sandbox needed to hand off an execution candidate safely:

- `ExecutionIntent`
- `AvanzaExecutionHandoff`
- `AvanzaAgentRequest`
- `AvanzaAgentBridgeEnvelope`
- bridge and runner contracts
- progress event mapping
- local run/audit diagnostics

Two diagnostics bridges exist:

- `none`: no-op bridge, reports unavailable and never creates broker effects.
- `echo`: dev-only bridge, validates the protocol path locally, emits progress events, and returns an `AvanzaAgentResult` without a `brokerResult`.

Echo validates request/progress/result plumbing only. No real Avanza integration exists. Ture does not open Avanza, control a broker page, store broker credentials, prepare live broker orders, submit orders, or create real broker confirmations.

## Requirements

The first real bridge direction must support:

- Local-first development, so the agent can be tested without production infrastructure.
- Strong safety boundaries between Ture, the browser automation agent, and the broker session.
- No broker credentials in the Ture frontend.
- Human final confirmation for `semi_automatic` mode, where Ture may prepare order details but the user manually presses final KOP/SALJ.
- `automatic` mode remaining separately gated, disabled by default, and allowed only after explicit opt-in and safety checks.
- Progress events back to Ture for visibility and lifecycle mapping.
- Broker result return back to Ture after a real confirmation exists.
- Testing against a mock order page before any Avanza research or live broker interaction.
- Abort/cancel support for in-flight agent runs.
- Clear auditability for requests, progress events, results, safety checks, and final state.

## Options Compared

### A. Local Process + Localhost HTTP/WebSocket

Description: Ture talks to a local agent process over localhost. The process owns browser automation, session checks, progress events, and result parsing.

Pros:

- Keeps browser automation outside the Ture frontend.
- Keeps broker credentials out of Ture.
- Easy to run locally during development.
- Can start with a stub server that only echoes requests and progress.
- Can later target a mock order page before any Avanza page.
- Supports streaming progress naturally with WebSocket or server-sent events.
- Supports cancellation with request IDs and explicit cancel endpoints.
- Clear security boundary: typed request in, typed progress/result out.

Cons:

- Requires users/developers to run a separate local process.
- Needs local installation, versioning, health checks, and diagnostics.
- HTTP requires polling or SSE for progress unless WebSocket is used.
- WebSocket adds connection lifecycle complexity.

Risks:

- Localhost exposure must be tightly scoped.
- Future authentication between Ture and the local process may be needed.
- A poorly implemented local process could still automate the wrong browser context.

Fit for prototype:

- Best fit. It gives the strongest iteration path with clear boundaries and no need to package a browser extension yet. The first implementation should be a localhost bridge server stub that accepts typed requests and returns echo/progress only.

### B. Browser Extension

Description: A browser extension receives requests from Ture or a local connector and interacts with broker pages in the user's browser.

Pros:

- Can operate in the actual browser context where the user is logged in.
- Avoids storing broker credentials in Ture.
- Can provide visible user-controlled browser behavior.
- May integrate well with semi-automatic final confirmation flows.

Cons:

- Requires extension packaging, permissions, installation, signing, and update flow.
- Browser security rules complicate messaging and page access.
- Harder to test early than a local process stub.
- More UI/permission surface before the protocol is stable.

Risks:

- Extension permissions are sensitive and must be minimal.
- Page scripting mistakes could affect real broker pages.
- Different browsers and extension APIs add support complexity.

Fit for prototype:

- Good future candidate, but not first. It should wait until the bridge contract, mock-page automation, and progress/result semantics are stable.

### C. Native Messaging

Description: A browser extension communicates with a native local process through the browser's native messaging mechanism.

Pros:

- Stronger browser-sanctioned bridge between extension and local process.
- Can combine extension page context with local process isolation.
- Avoids exposing a raw localhost server.

Cons:

- Requires both extension and native host installation.
- Platform-specific setup is heavier.
- Debugging and distribution are more complex.
- Too much packaging work before the agent protocol is proven.

Risks:

- Native host registration can be brittle across macOS, Windows, and Linux.
- Security review burden is high because the local process can do powerful things.

Fit for prototype:

- Not first. It may become attractive after a local process and/or extension path proves the core behavior.

### D. Direct In-Browser Automation From Ture Frontend

Description: The Ture frontend directly automates a broker page or browser surface.

Pros:

- Fewer moving parts in the very short term.
- Could reuse Ture UI state directly.

Cons:

- Weak safety boundary.
- Browser automation from a normal web frontend is constrained and fragile.
- Encourages mixing trading decisions, UI, credentials/session assumptions, and execution mechanics.
- Hard to keep broker credentials and broker page control out of the app.
- Poor fit for cancellation, auditability, and controlled permissioning.

Risks:

- Highest risk of accidental live broker interaction.
- Increased chance of credential/session leakage.
- Difficult to prove that real execution cannot happen unexpectedly.

Fit for prototype:

- Poor fit. This option should be avoided. Browser automation should live outside the Ture frontend.

### E. Cloud/Service Bridge

Description: Ture sends requests to a hosted service that runs the agent or coordinates execution.

Pros:

- Centralized deployment and observability.
- Easier to version for multiple clients after maturity.
- Can scale beyond one local machine if a supported broker integration eventually exists.

Cons:

- Not local-first.
- Creates sensitive questions about broker sessions, credentials, and user trust.
- Adds network, hosting, authentication, and compliance complexity early.
- Harder to use with an interactive logged-in broker browser session.

Risks:

- Could imply custody or handling of broker credentials/session data.
- Much higher security and compliance burden.
- Dangerous to prototype before the local safety model is proven.

Fit for prototype:

- Not fit for the first prototype. Cloud/service work should be avoided until there is a supported, secure, and explicitly approved broker integration model.

## Recommendation

Use a local process bridge with localhost WebSocket or HTTP for the first real prototype.

Recommended shape:

- Ture sends a typed `AvanzaAgentRequest`.
- The bridge server validates the request and returns typed health/capability information.
- The bridge server emits typed `AvanzaAgentProgressEvent` objects.
- The bridge server returns a typed `AvanzaAgentResult`.
- The browser automation agent lives outside the Ture frontend.
- Initial runs target a mock order page only.
- Avanza stays out of scope until mock flow is stable.
- No real `brokerResult` is produced until a real broker confirmation has been manually and visually verified.

Transport detail:

- Start with localhost HTTP for health and request submission if the implementation is simpler.
- Add WebSocket or server-sent events when progress streaming needs to be continuous.
- Keep the typed envelope stable so HTTP and WebSocket can share the same payload contract.

## Proposed Phased Plan

### Phase 1 - Local Echo / Bridge Protocol

Status: done.

- No-op bridge exists.
- Dev-only echo bridge exists.
- Ture can build requests, envelopes, progress events, results, local runs, and diagnostics.
- No Avanza, no external transport, no broker result.

### Phase 2 - Localhost Bridge Server Stub

- Define localhost bridge server endpoints and message contract.
- Add health/capabilities endpoint.
- Add request submission endpoint.
- Add progress event return path.
- Add cancel endpoint or cancellation contract.
- Return echo/progress only.
- Do not open a browser.
- Do not connect to Avanza.
- Do not create `brokerResult`.

### Phase 3 - Mock Order Page Automation

- Build a local mock order page.
- Let the external agent fill a fake order form from an `AvanzaAgentRequest`.
- For `semi_automatic`, stop before final submit and require manual confirmation.
- For `automatic`, keep final submit disabled unless the test harness explicitly enables it.
- No Avanza.
- No real broker behavior.

### Phase 4 - Mock Confirmation Result Parsing

- Add a mock confirmation page.
- Parse fake submitted/filled/rejected/cancelled outcomes from the mock page.
- Return typed `AvanzaAgentResult` with mock-only result data.
- Clearly label all outputs as mock.
- Verify Ture's result capture and audit trail without real broker data.

### Phase 5 - Avanza UI Research / Manual Mapping

- Research Avanza UI manually.
- Document selectors, page states, safety checks, and failure modes.
- Do not perform automatic live trading.
- Do not store credentials in Ture.
- Do not submit real orders.

### Phase 6 - Semi-Automatic Avanza Preparation Only

- Allow a real bridge prototype to prepare Avanza order details only after explicit approval.
- Keep final KOP/SALJ manual.
- Require visible user confirmation.
- Capture progress and final observed broker status when available.
- Keep automatic submit disabled.

### Phase 7 - Automatic Mode Hardening

- Consider automatic submit only after:
  - explicit feature gate
  - explicit user opt-in
  - complete safety checks
  - audited request/progress/result logs
  - tested cancellation/failure handling
  - manual review of real broker result capture
  - clear rollback and incident response plan

## Safety Boundaries

- Ture must not store Avanza credentials.
- Ture must not directly control a broker page.
- No direct broker API should be used unless it is official, supported, and explicitly approved.
- No automatic production trading is enabled by default.
- Final submit remains disabled unless `automatic` mode is enabled and safety checks pass.
- Dev/prototype work must not touch live Avanza until specifically approved.
- The next prototype phase must target a mock page or echo-only localhost server.
- Every real broker result must be captured, normalized, and logged.
- Every run must be auditable from request through progress events to final result.
- The bridge must support cancellation or a documented safe-stop behavior.
- All diagnostics must clearly distinguish local/mock/prototype data from real broker confirmations.

## Recommended Next Action

Action 191 - Localhost Bridge Server Stub Contract.

This should define the localhost bridge server health, capabilities, request submission, progress, cancellation, and result contracts without adding browser automation or Avanza access.
