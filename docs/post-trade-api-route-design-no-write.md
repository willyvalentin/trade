# Post-Trade API Route Design, No Write

## Summary

Purpose: define the future post-trade Supabase API/write-path architecture without creating routes, services, runtime paths, or writing data.

Result: API route/write-path design is ready for a later no-write route stub gate. Implementation remains blocked.

Decision: `post_trade_api_route_design_ready_no_write`.

## Target Context

- Staging environment: `ture-staging`
- Staging project ref / safe identifier: `pdvzyuhykomwfqyyztru`

Production remains blocked.

Runtime/API/UI write paths remain blocked.

Avanza/browser automation remains blocked.

## Design Inputs

Action 433 established the write-path readiness gate after staging infrastructure reached this posture:

- full staging migration chain is applied and aligned
- grant-hardening is applied and verified in staging
- expected post-trade/execution tables exist
- RLS remains enabled
- post-trade policy count remains `0`
- `anon` and `authenticated` grants are revoked for intended post-trade/execution tables
- `service_role` capability remains for future gated server-side flows

## Future Route Surface, Conceptual Only

A future route surface may be considered only under separate gates and must be:

- server-side only
- service-role only
- staging-first
- inaccessible to client-side direct writes
- fail-closed by default
- protected by explicit environment and feature gates
- isolated from Trade UI execution, browser automation, and Avanza runtime paths
- limited to post-trade persistence after validation

Conceptual route ownership:

- a server-only API boundary may receive a validated post-trade persistence request
- a server-only payload validator must reject unsafe fields before any service call
- a server-owned write service may persist allowlisted rows only after a separate staging write gate
- audit and idempotency checks must run before persistence

This action creates none of those routes or services.

## Allowed Future Payload Categories

Allowed only after separate implementation and staging write gates:

- allowlisted post-trade execution record fields
- settlement review summary fields
- cost breakdown fields
- deviation review fields
- manual review status fields
- redacted broker confirmation evidence metadata
- redacted artifact reference identifiers
- staged learning candidate metadata that cannot update learning automatically

Broker confirmation metadata may be considered only after validation and only as metadata:

- safe internal evidence id
- broker/source label
- redacted evidence artifact id
- side, ticker, quantity, execution price, currency
- extraction/review timestamp
- safe internal reviewer/actor label

Allowed payloads must remain aligned with the existing schema and payload allowlist fixtures.

## Rejected Payload Categories

The future route must reject:

- raw Avanza/browser state
- raw broker payloads
- raw settlement notes
- unredacted broker documents
- unredacted PDFs, screenshots, HTML, page text, or browser artifacts
- credentials
- passwords
- cookies
- sessions
- auth tokens
- BankID artifacts
- service role keys
- anon keys
- access tokens
- account/customer identifiers
- personal identity data
- arbitrary JSON blobs outside the allowlist
- live order intent
- final buy/sell authority
- live trade mutation authority
- live position mutation authority
- Trade UI execution markers
- browser automation markers

## Safety Checks Required Before Any Future Write

Future implementation must include:

- schema allowlist validation
- payload allowlist validation
- never-persist field rejection
- redaction status validation
- sensitive marker scan
- execution intent/result alignment
- plan-vs-actual consistency checks
- manual review status checks
- blocked classification checks
- duplicate/idempotency handling
- audit logging
- request source and actor labeling
- failure handling that stops before partial unsafe writes
- rollback/cleanup behavior for staging tests
- proof that client-side code cannot import or call the write service directly

## Required Future Implementation Gates

Before any implementation can begin, these separate gates are required:

1. API route stub, no-write.
2. Payload validator implementation.
3. Server-side write service draft, staging-only and disabled.
4. Service-role and secret-handling review.
5. Mock write test gate.
6. Staging write execution gate.
7. Post-write rollback and audit verification.
8. Runtime/API activation gate.
9. Trade UI integration gate, if ever needed.
10. Production gate, separately blocked.

## Still Forbidden

Still forbidden:

- production writes
- production connection
- client direct writes
- browser/client Supabase writes
- runtime activation
- API activation
- Trade UI execution
- Avanza/browser automation
- Avanza login
- credential/cookie/session/BankID handling
- order submission
- final buy/sell click behavior
- settlement retrieval
- raw broker data persistence
- raw broker document persistence
- test row insertion in this action
- migration apply or repair in this action
- live trade mutation
- live position mutation
- learning/statistics auto-update

## Pass Criteria To Move Toward Route Stub Design

Pass if:

- route remains design-only in this action
- future route surface is server-side only
- future persistence is service-role/server-owned only
- client direct writes are explicitly blocked
- allowed payload categories map to existing allowlist concepts
- rejected payload categories include raw broker, browser, credential, session, BankID, and arbitrary JSON content
- future safety checks include schema allowlist, payload allowlist, idempotency, audit logging, and rollback behavior
- future implementation gates remain separate
- production remains blocked

## Fail Criteria

Fail if:

- an API route is created in this action
- a service implementation is created in this action
- any Supabase write path is activated
- design requires client-side direct writes
- design accepts raw broker or browser artifacts
- design accepts credentials, cookies, sessions, BankID, tokens, or service keys
- design allows arbitrary JSON outside the allowlist
- design implies production write readiness
- design implies Trade UI execution, Avanza/browser automation, order submission, settlement retrieval, live trade mutation, or live position mutation

## Not Performed

Not run and not created:

- API route creation
- service implementation
- Supabase data write
- test row insertion
- migration apply
- migration repair
- migration marking
- production connection
- staging schema/data command
- runtime/API/UI activation
- Avanza/browser automation
- credential/session/BankID handling
- order action
- settlement retrieval
- live trade mutation
- live position mutation

## Safety Confirmation

Confirmed for Action 434:

- no production connection
- no production state touch
- no production Supabase write
- no staging data write
- no test row insertion
- no migration apply
- no migration repair
- no DB write
- no Supabase write
- no API route creation
- no service implementation
- no API activation
- no Trade UI execution
- no runtime write-path activation
- no Avanza/browser automation
- no credential/session/BankID handling
- no order behavior
- no settlement retrieval
- no real trade/broker data insertion
- no live trade mutation
- no live position mutation

## Final Decision

`post_trade_api_route_design_ready_no_write`
