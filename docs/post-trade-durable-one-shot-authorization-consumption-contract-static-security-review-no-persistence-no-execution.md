# Action 496 - Durable One-Shot Authorization Consumption Contract Static/Security Review No Persistence No Execution

Decision: `post_trade_durable_one_shot_authorization_consumption_contract_static_security_review_ready_for_persistence_schema_design`

Result status: `post_trade_durable_one_shot_authorization_consumption_contract_static_security_review_completed_no_persistence_no_execution`

## Files Reviewed

- `lib/post-trade-durable-one-shot-authorization-consumption-contract.ts`
- `tests/e2e/post-trade-durable-one-shot-authorization-consumption-contract.spec.ts`
- `lib/post-trade-staging-execution-authorization-artifact-core.ts`
- `lib/post-trade-final-staging-execution-gate-core.ts`
- `docs/post-trade-durable-one-shot-authorization-consumption-contract-no-persistence-no-execution.md`

## Contract Scope

The contract remains a pure TypeScript model for future durable authorization consumption. It does not create persistence, migrations, SQL, database functions, Supabase clients, execution paths, API routes, UI wiring, runtime activation, staging rows, or production connections.

It models:

- strict consumption request identity
- future compare-and-set persistence planning
- authoritative evidence classification
- replay classification
- ambiguous result handling
- read-back verification
- fail-closed behavior for unsafe scope, state, identity, capability, and evidence mismatches

## State Model

The model recognizes `unused`, `consumption_pending`, `consumed`, `invalid`, `expired`, and `ambiguous`.

Only `unused -> consumed` can be a successful durable transition. `consumption_pending` and `ambiguous` remain result classifications or future reviewed persisted states; neither may allow a second attempt or execution continuation without authoritative read-back.

## Compare-And-Set Findings

The future persistence plan now carries every reviewed compare-and-set invariant:

- authorization artifact id
- artifact version
- artifact fingerprint
- execution attempt id
- execution plan id
- execution scope
- consumption operation id
- target staging project id
- reviewed execution function identity
- reviewed final gate identity
- expected current state `unused`
- requested new state `consumed`
- one-shot marker
- no-retry marker
- mock-only marker
- expected operation count `2`
- expected row count `2`
- ordered target tables
- exact audit dependency
- non-expiry check timestamp
- affected rows exactly `1`

No application-level pre-check alone is sufficient. A future implementation must verify these fields and transition the durable record atomically.

## Evidence Findings

Authoritative success requires complete evidence:

- affected row count exactly `1`
- durable consumption record id
- matching authorization artifact id
- matching artifact fingerprint
- matching execution attempt id
- matching execution plan id
- matching consumption operation id
- matching target staging project id
- previous state exactly `unused`
- new state exactly `consumed`
- valid consumed-at timestamp
- matching persistence operation identity
- result classification `transitioned_unused_to_consumed`

HTTP 200, generic success, no thrown error, non-empty response, operation submitted, unknown row count, partial response, partial identifier match, inferred state, or missing evidence do not count as success.

## Replay And Concurrency Findings

The contract classifies first valid requests, identical replays, different-operation replays, same-attempt/different-operation replays, ambiguous durable states, consumed durable states, invalid states, and expired states.

Review hardening made replay classification more conservative: even an identical replay is only detected and does not itself permit execution continuation. Execution eligibility after uncertain or replayed state must come from authoritative read-back evidence.

Concurrent behavior is modeled as:

- one future atomic transition may win
- zero-row losers cannot proceed
- different operation ids do not reset eligibility
- new attempt ids cannot bypass consumption
- no replay is treated as fresh authorization
- no automatic retry is recommended after uncertain submission

## Ambiguity Findings

Timeouts, connection loss after submission, malformed responses, unknown row counts, and partial evidence are ambiguous or blocked. Ambiguous outcomes require:

- execution remains blocked
- no automatic retry
- no new consumption operation id
- no new execution attempt id
- preservation of original identifiers
- authoritative read-back before any execution continuation

## Read-Back Findings

The read-back request binds immutable identifiers:

- authorization artifact id
- authorization fingerprint
- execution attempt id
- execution plan id
- consumption operation id
- target staging project id

Read-back distinguishes consumed by this operation, consumed by another operation, still unused, missing, invalid, expired, inconsistent, and ambiguous. Only consumed by this exact operation with complete authoritative evidence may potentially allow future execution continuation.

Review hardening made read-back require complete evidence, including durable record id, valid consumed-at timestamp, affected rows exactly `1`, persistence operation identity, and expected result classification.

## Transaction Boundary Recommendation

The reviewed recommendation remains: future durable authorization consumption and both mock inserts should run inside one staging-only atomic transaction or reviewed database function.

This is safer than:

- consuming authorization before a separate execution request
- inserting execution data before consumption
- reserving in one transaction and finalizing in another
- application-coordinated sequential writes
- compensating deletes or rollback code outside the database

The final future atomic unit should consume authorization, insert exactly one mock `execution_records` row, obtain the returned execution record id, insert exactly one dependent `execution_record_audit_events` row, and return complete authoritative evidence.

This minimizes the risk of reused authorization, duplicate rows, execution rows without durable consumption, consumed authorization without execution evidence, missing audit dependency ids, and unverifiable partial states.

## Production And Capability Findings

The contract remains staging-only. Production project `ekdyopdrrkphlrsilyoo` is rejected as a target and in nested strings, URLs, arrays, arbitrary request metadata, and request identity. The only permitted appearance is the explicit rejected-production marker required by the reviewed artifact/gate contract.

Forbidden fields and capabilities include browser, broker, Avanza, API, UI, client invocation, credentials, cookies, sessions, BankID, migration/schema behavior, trade/position/order mutation, raw broker/browser state, arbitrary JSON blobs, and production references.

## Changes Made During Review

- Added a distinct `artifact:id_mismatch` reason for authorization artifact id mismatches.
- Expanded the future compare-and-set persistence plan to carry execution scope, function identity, final gate identity, one-shot/no-retry/mock markers, operation count, row count, ordered tables, and audit dependency.
- Added evidence checks for consumed-at timestamp, evidence affected-row count, persistence operation identity, and result classification.
- Made identical replay detection non-authorizing; read-back evidence must decide continuation.
- Made read-back success require complete authoritative evidence rather than identity/state checks alone.
- Expanded focused adversarial tests for malformed timestamps, missing artifact id, state transition tampering, duplicate/extra table names, compare-and-set invariant coverage, evidence mismatches, and incomplete read-back evidence.

## Side-Effect Findings

Static review confirmed no Supabase import, no Supabase client creation, no SQL execution, no insert/update/upsert/delete/RPC/storage call, no execution function invocation, no final gate invocation, no write-capable adapter invocation, no environment-based approval, no mutable process-local durable protection, no file writes, no automatic retry path, no API route wiring, and no Trade UI/client wiring.

## Remaining Risks

The contract is still a design/model. A source-controlled persistence schema, migration design, and reviewed staging-only transaction/database function design are still required before any real durable consumption or execution can happen.

## Review Decision

The durable one-shot authorization consumption contract is ready for a separate source-controlled persistence schema design. It is not ready for persistence or execution by itself.

No migration, SQL, persistence, authorization consumption, execution, Supabase call, staging write, production connection, API/UI/runtime activation, Avanza/browser automation, credential/session/cookie/BankID handling, order behavior, settlement retrieval, live trade mutation, or live position mutation occurred.

Recommended next action:

`Action 497 - Design Source-Controlled Durable Authorization Consumption Persistence Schema, Without Migration or Execution`
