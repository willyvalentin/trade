# Post-Trade Execution Record Prerequisite Command Design No Write

Action: 475  
Date: 2026-07-09  
Decision: `post_trade_execution_record_prerequisite_command_design_ready_no_write`

## Scope

This checkpoint designs the future prerequisite command path for `public.execution_records` so a later isolated staging mock write can safely provide the required `execution_record_id` before writing `public.execution_record_audit_events`.

This action does not execute writes, modify adapter execution behavior, create API write behavior, wire anything into Trade UI, activate runtime write paths, or perform any DB/Supabase write.

## Schema Evidence

`public.execution_records` requires a normalized execution record with, at minimum:

- `broker`
- `ticker`
- `side`
- `execution_phase`
- `execution_mode`
- `quantity`
- `price`
- `confirmed_at`
- `idempotency_key`
- `record_fingerprint`
- `source_fingerprint`
- `source_environment`
- `validation_status`

Important constraints:

- `side in ('buy', 'sell')`
- `execution_phase in ('entry', 'exit')`
- `execution_mode in ('semi_automatic', 'automatic')`
- `broker in ('avanza')`
- `source_environment in ('local_dev', 'staging', 'production')`
- `validation_status in ('eligible', 'persisted', 'duplicate', 'needs_review', 'rejected')`
- `quantity > 0`
- `price > 0`
- unique `idempotency_key`
- unique `record_fingerprint`

`public.execution_record_audit_events` requires:

- `execution_record_id uuid not null references public.execution_records(id)`
- `event_type`
- `event_source`
- `event_status`
- `source_system`
- `idempotency_key`

Important constraints:

- `event_status in ('attempted', 'succeeded', 'failed', 'blocked', 'duplicate', 'unknown')`
- unique `idempotency_key`
- optional unique `duplicate_prevention_key`

## Future Command Sequence

The future reviewed command sequence for one isolated staging mock write should be:

1. Build a sanitized mock `execution_records` command.
2. Execute or safely resolve that command under the one-shot staging gate.
3. Capture the resulting `execution_records.id`.
4. Build the dependent `execution_record_audit_events` command using that `execution_record_id`.
5. Execute the audit event command in the same isolated staging flow.
6. Execute the intended post-trade persistence command(s) only if their own gate checks still pass.
7. Verify all intended rows and no extra table touches where possible.

The audit event must not be written without a reviewed `execution_record_id`.

## Options

Option A: create one mock `execution_records` row and one audit event in the same isolated flow.

- Safer default because the dependency is explicit, controlled, test-scoped, and verified in the same gate.
- Requires one additional reviewed mock prerequisite command.
- Must stay staging-only and one-shot.

Option B: use a reviewed lookup for an existing mock execution record.

- Acceptable only if a separate read-only lookup gate proves the row exists, is mock/test-scoped, belongs to staging, contains no raw/sensitive material, and has an idempotency/fingerprint posture compatible with this test.
- Higher ambiguity risk because existing state may be stale or from an unrelated test.

Recommendation: Option A is the safer/default approach for this project. Create exactly one mock `execution_records` row and its dependent audit event in the same isolated staging flow, under a separately implemented and reviewed one-shot execution gate.

## Sanitized Mock Execution Record Command

A future mock `execution_records` command should include only sanitized mock/test metadata.

Required command fields:

- `broker: 'avanza'`
- `ticker: 'TURMOCK'` or another clearly fake test ticker
- `side: 'buy'` or `'sell'` using the lower-case schema enum
- `execution_phase: 'entry'` or `'exit'`
- `execution_mode: 'semi_automatic'`
- `quantity: 1`
- `price: positive mock value`
- `confirmed_at: fixed test timestamp`
- `idempotency_key: test-scoped unique key`
- `record_fingerprint: test-scoped unique fingerprint`
- `source_fingerprint: test-scoped unique source fingerprint`
- `source_environment: 'staging'`
- `is_mock: true`
- `is_dev: true`
- `validation_status: 'eligible'` or `'persisted'` as explicitly reviewed for the test
- `metadata: sanitized object`
- `audit_metadata: sanitized object`

Optional fields should remain null unless specifically needed and reviewed. Broker order IDs, broker confirmation IDs, account IDs, user IDs, and source production references should be omitted/null for the mock flow unless separately justified.

## Forbidden Material

The prerequisite command path must reject:

- raw broker/browser payloads
- raw Avanza/browser state
- credentials
- cookies
- sessions
- tokens
- BankID material
- unredacted broker documents
- arbitrary JSON/blob values
- real broker/Avanza data
- settlement retrieval outputs
- order behavior outputs
- live trade or position mutation data

## Idempotency Expectations

Future implementation must require:

- test-scoped unique `execution_records.idempotency_key`
- test-scoped unique `execution_records.record_fingerprint`
- test-scoped `execution_records.source_fingerprint`
- separate test-scoped `execution_record_audit_events.idempotency_key`
- no broad repeated writes
- no blind retry
- safe duplicate handling only after explicit review

If a duplicate is encountered, the future execution action must stop or use a separately reviewed duplicate-resolution path. It must not blindly retry or switch keys after failure.

## Audit Dependency Expectations

The audit event command must:

- require a reviewed `execution_record_id`
- reference only the mock execution record created or selected under the approved gate
- use sanitized event payload and evidence payload
- avoid raw broker/browser content and secrets
- avoid direct SQL/manual dashboard writes

## Future Gates

Required gates after this design:

- execution-record write-command implementation no execution
- execution-record prerequisite static/security review
- one-shot execution-unblock implementation no write
- final one staging mock write execution retry
- post-write verification

## Not Authorized

This design does not authorize:

- production connection
- production Supabase write
- staging write
- test row insertion
- migration action
- adapter execution unblock
- API write behavior
- Trade UI/runtime activation
- Avanza/browser automation
- settlement retrieval
- order behavior
- live trade mutation
- live position mutation

## Safety Confirmation

This action did not perform:

- production connection
- production Supabase write
- staging data write
- test row insertion
- migration action
- DB/Supabase write
- write command execution
- adapter execution behavior change
- API write behavior
- runtime write-path activation
- Trade UI execution
- browser automation
- Avanza login
- credential/cookie/session/BankID handling
- order action
- settlement retrieval
- live trade mutation
- live position mutation

Production remains blocked. Runtime/API/UI write paths remain blocked. Avanza/browser automation remains blocked.

