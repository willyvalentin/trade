# Action 495 - Durable One-Shot Authorization Consumption Contract No Persistence No Execution

Decision: `post_trade_durable_one_shot_authorization_consumption_contract_ready_for_static_security_review`

Result status: `post_trade_durable_one_shot_authorization_consumption_contract_added_no_persistence_no_execution`

## Problem

The Action 493 authorization artifact is logically one-shot, but it is source-controlled static data. Without durable atomic consumption, two independent processes could validate the same `unused` artifact before either records that the authorization has been consumed. That time-of-check/time-of-use race must be closed before any real staging write can rely on the artifact.

Process-local locks, module globals, browser storage, filesystem flags, environment variables, and application-only pre-checks are not sufficient. They do not protect across processes, workers, deploys, retries, crashes, or network ambiguity.

## Contract Added

Action 495 adds a typed, side-effect-free durable consumption contract:

- `lib/post-trade-durable-one-shot-authorization-consumption-contract.ts`
- `tests/e2e/post-trade-durable-one-shot-authorization-consumption-contract.spec.ts`

The contract defines:

- authorization consumption request
- expected authorization identity
- durable authorization state
- compare-and-set transition model
- future persistence operation plan
- authoritative evidence model
- ambiguous result model
- replay classification
- read-back verification request/result classification
- fail-closed blocking reasons

It does not create a migration, table, SQL function, API route, runtime path, Supabase client, execution adapter call, execution function call, or persistent consumption record.

## Durable State Model

The model recognizes these states:

- `unused`
- `consumption_pending`
- `consumed`
- `invalid`
- `expired`
- `ambiguous`

Recommended persisted states for the first implementation are `unused`, `consumed`, `invalid`, and `expired`. `consumption_pending` and `ambiguous` are safest as result classifications or read-back classifications unless a later reviewed persistence design defines exact recovery semantics. They must not permit a second execution attempt without authoritative verification.

The only successful transition is:

`unused -> consumed`

## Atomic Compare-And-Set Semantics

The future persistence implementation must atomically:

1. Locate exactly one authorization-consumption record by immutable authorization identity.
2. Confirm current state is `unused`.
3. Confirm artifact fingerprint matches.
4. Confirm artifact version matches.
5. Confirm execution attempt id matches.
6. Confirm execution plan id matches.
7. Confirm execution scope matches.
8. Confirm staging project id is `pdvzyuhykomwfqyyztru`.
9. Confirm authorization has not expired.
10. Confirm one-shot, no-retry, mock-only, exactly two operations, exactly two rows, exact table order, and exact audit dependency.
11. Atomically update state to `consumed`.
12. Record consumed-at timestamp.
13. Record immutable durable consumption record id.
14. Record consumption operation id.
15. Return authoritative evidence with affected row count exactly `1`.

Zero matching rows, more than one matching row, zero rows updated, more than one row updated, unknown affected-row count, missing returned identity, malformed response, partial response, mismatched evidence, timeout after possible commit, or connection loss after submission are blocked or ambiguous.

## Request Contract

A valid consumption request must include:

- authorization artifact id
- authorization artifact version
- authorization fingerprint
- execution attempt id
- execution plan id
- execution scope
- target staging project id
- rejected production project marker
- reviewed execution function identity
- reviewed final gate identity
- expected current state `unused`
- requested new state `consumed`
- requested consumption timestamp
- consumption operation id
- no-retry marker
- one-shot marker
- mock-only marker
- expected operation count `2`
- expected row count `2`
- ordered target tables: `execution_records`, `execution_record_audit_events`
- audit dependency: `execution_record_audit_events.execution_record_id_from_execution_records.id`

No arbitrary metadata, raw JSON, credentials, cookies, sessions, BankID material, raw broker/browser state, Avanza state, or production target aliases are accepted.

## Evidence Contract

A successful result requires complete authoritative evidence:

- durable consumption record id
- authorization artifact id
- previous state exactly `unused`
- new state exactly `consumed`
- consumed-at timestamp
- authorization fingerprint
- execution attempt id
- execution plan id
- consumption operation id
- target staging project id
- affected-row count exactly `1`
- persistence operation identity
- result classification

No success may be inferred from generic `ok`, HTTP 200, absence of an error, or partial evidence.

## Replay Prevention

The model handles:

- first valid request: may build a future compare-and-set operation, but does not execute it
- identical replay after consumed: detected as already consumed by same operation; automatic retry remains false
- replay with different operation id: detected as already consumed by another operation and blocked
- replay with same attempt id but different operation id: blocked unless read-back proves the original operation
- replay with different attempt id: blocked by identity mismatch
- replay after timeout or connection loss: ambiguous and requires read-back
- concurrent requests: exactly one compare-and-set winner may transition; losers see zero rows updated or consumed state
- consumption after expiry: blocked

The design never recommends blind retry. A request with uncertain commit status must preserve the original operation id and attempt id until authoritative read-back resolves it.

## Ambiguous Outcome Handling

Ambiguous outcomes include:

- network timeout after submission
- connection loss after submission
- malformed response
- unknown affected-row count
- partial response
- unable to verify returned identity

For ambiguous outcomes:

- do not execute the staging execution function
- do not retry automatically
- do not create a second consumption operation id
- do not assume authorization remains unused
- require authoritative read-back by immutable identifiers
- keep the future execution blocked until resolved

## Read-Back Verification

The read-back request preserves:

- authorization artifact id
- authorization fingerprint
- execution attempt id
- execution plan id
- consumption operation id
- target project id

Read-back may classify:

- `authoritatively_consumed_by_this_operation`
- `consumed_by_another_operation`
- `still_unused`
- `missing`
- `invalid`
- `expired`
- `inconsistent`
- `ambiguous`

Only `authoritatively_consumed_by_this_operation` may potentially allow a later execution flow to continue.

## Persistence Alternatives

1. Dedicated authorization-consumption table

Best baseline option. It provides unique authorization identity, unique attempt identity, unique consumption operation identity, atomic compare-and-set, authoritative read-back, and auditability. It keeps consumption state separate from execution row data.

2. Add consumption fields to an existing execution-related table

Riskier. It couples authorization state to execution data, makes pre-execution consumption harder to represent, and increases partial-state ambiguity if inserts fail.

3. Append-only consumption ledger

Useful for audit, but insufficient alone unless paired with uniqueness constraints or a transactional function that guarantees only one accepted consumption event per artifact/attempt.

4. Transaction or database function wrapping consumption and the two mock inserts

Safest final execution shape when reviewed and implemented: one server-side transactional unit can consume authorization, insert `execution_records`, capture the returned id, insert dependent `execution_record_audit_events`, and return complete evidence.

## Recommendation

Use a dedicated durable authorization-consumption table plus a reviewed staging-only database function or transaction boundary for the eventual execution action.

The preferred final atomic unit should include:

- authorization consumption compare-and-set
- mock `execution_records` insert
- returned execution record id
- dependent `execution_record_audit_events` insert
- final execution evidence

This minimizes duplicate rows, reused authorization, execution data without durable consumption, and consumed authorization without execution evidence.

## Transaction Boundary

Recommended boundary: consume authorization and perform the two mock inserts in the same transaction/database function.

Reasoning:

- Consume-before-inserts risks consumed authorization without execution evidence if the first insert fails.
- Inserts-before-consume risks execution data without durable authorization if consumption fails.
- Reserve-then-finalize adds a recovery state that can accidentally permit second execution unless very carefully reviewed.
- One transaction/database function gives the clearest all-or-nothing behavior and authoritative evidence.

Failure cases must still be handled:

- if the transaction commits but the client times out, classify ambiguous and require read-back
- if both inserts succeed but response is lost, read-back must identify the original operation and execution evidence
- if audit dependency cannot be resolved, the transaction must fail with no partial rows
- if duplicate attempt is submitted, compare-and-set/uniqueness blocks the second attempt

## Fail-Closed Rules

The contract blocks when target is not staging, production appears outside the rejection marker, artifact is not unused, authorization is expired, identity differs, fingerprint differs, attempt id differs, plan id differs, operation id is missing, one-shot is false, retry is enabled, mock-only is false, operation count or row count differs, table order differs, audit dependency differs, unsafe capabilities exist, sensitive material appears, prior result is ambiguous, persistence evidence is incomplete, affected rows is not exactly one, returned identifiers differ, or execution would continue after unresolved timeout.

## No-Execution Confirmation

Action 495 performed no persistence and no execution. It did not create or modify migrations, execute SQL, create/alter tables, call Supabase, invoke the source-controlled execution function, invoke the write-capable adapter, execute the final gate, consume the authorization artifact, create staging rows, connect to production, wire API/UI/client code, activate runtime behavior, implement browser/Avanza integration, access credentials/cookies/sessions/BankID, alter BUY/SELL behavior, mutate trades/positions/orders, retrieve settlement, add mutable process-local durable protection, or add automatic retries.

## Remaining Implementation Steps

1. Static/security review of this durable consumption contract.
2. No-write migration/table design for the durable consumption record.
3. No-write database function or transactional execution design.
4. Static/security review of the persistence design.
5. Separate staging-only apply gate if a migration is ever drafted.
6. Separate execution gate after durable consumption is implemented and verified.

Recommended next action:

`Action 496 - Perform Static and Security Review of Durable One-Shot Authorization Consumption Contract`
