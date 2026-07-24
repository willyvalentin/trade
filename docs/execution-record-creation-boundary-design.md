# Execution Record Creation Boundary Design

## Purpose

This document defines the future boundary from a validated broker result into a
local execution record.

It separates four different concepts:

- `BrokerExecutionResult` conversion
- local execution record creation
- Supabase persistence
- live trade mutation

This is documentation only. It does not create a `BrokerExecutionResult`, create
an execution record, write Supabase, mutate trades, add Avanza automation, add
selectors/URLs, control a browser, or submit orders.

## Action 415 Reassessment

Action 415 created
`docs/execution-record-creation-boundary-reassessment.md`.

Updated finding:

- broker-result eligibility and preview boundaries exist.
- execution-record eligibility exists.
- local/dev `TureExecutionRecord` creation exists only for explicit mock/stub
  diagnostics paths.
- no production-safe real execution record creation boundary exists yet.
- no Supabase execution-record write path exists.
- no trade mutation should be coupled to record creation.

Next recommended action:

**Action 416 - Create Execution Record Creation Contract Design**

## Action 416 Contract Design

Action 416 created
`docs/execution-record-creation-contract-design.md`.

Design update:

- proposed `ExecutionRecordCreationInput`.
- proposed `ExecutionRecordCreationResult`.
- defined canonical execution record candidate fields.
- defined validation and rejection reason requirements.
- defined idempotency and audit requirements.
- preserved this document's core separation: creation design still does not
  write Supabase, mutate trades, create broker results, or automate Avanza.

Next recommended action:

**Action 417 - Create Execution Record Creation Contract Types**

## Boundary Principle

A `BrokerExecutionResult` is not automatically an execution record.

An execution record is not automatically persisted.

A persisted execution record is not automatically a trade mutation.

Every boundary must be explicit, gated, validated, idempotent, and auditable:

- broker evidence may become a broker result only through a separate conversion
  gate
- broker result may become a local execution record only through a separate
  record-creation gate
- local execution record may be persisted only through a separate Supabase
  persistence gate
- persisted or local record data may affect live trades only through a separate
  trade-mutation gate

The first implementation should prefer blocking over guessing. A skipped or
manual-review record is safer than a false execution record.

## Creation Allowed Only When

Future local execution record creation may be allowed only when all required
checks pass:

- a valid future `BrokerExecutionResult` exists
- source evidence fingerprint is present
- broker result is not preview-only
- broker result is not marked `notBrokerExecutionResult`
- duplicate evidence fingerprint is not already recorded
- duplicate broker order/reference id is not already recorded
- action is present and valid
- instrument identity is present and complete enough for the current policy
- quantity is present, numeric, finite, and positive
- execution price is present, numeric, finite, and positive
- timestamp is present
- broker reference/order id is present, or an explicit missing-id policy allows
  creation with a warning and a safe idempotency key
- source dry-run request id is available where possible
- source capture id is available where possible
- source broker result id or fingerprint is available
- no sensitive/raw account, balance, holding, DOM, or screenshot data flags are
  present
- no broker-result preview-only flag remains
- no trade mutation attempt is bundled with record creation
- no Supabase write attempt is bundled with record creation
- future record-creation feature flag is enabled
- explicit user/dev approval exists for the first local-only phase

## Creation Blocked When

Future local execution record creation must be blocked when any of these are
true:

- broker result is preview-only
- broker result is marked `notBrokerExecutionResult`
- core execution fields are missing
- action, instrument, quantity, or price mismatch remains unresolved
- duplicate evidence fingerprint exists
- duplicate broker order/reference exists
- broker result status is placed or accepted but not filled
- broker result is partial and no partial-fill accounting policy exists
- result was rejected, cancelled, expired, blocked, or failed
- sensitive/raw account, balance, holding, DOM, screenshot, or personal data is
  present
- request attempts Supabase persistence at the same time
- request attempts live trade mutation at the same time
- request tries to update History or Statistics directly
- source request/capture provenance is missing and policy does not allow it
- creation feature flag is disabled
- production creation is attempted before production policy exists

## Record Target Shape

The intended local execution record should include:

- record id
- broker/provider
- action
- ticker
- instrument name
- market
- currency
- instrument type
- quantity
- execution price
- fees/courtage
- total amount
- broker timestamp
- broker order/reference id
- source evidence fingerprint
- source dry-run request id
- source capture id
- source broker result id or broker result fingerprint
- execution status
- warnings
- metadata

Metadata should preserve provenance and safety decisions, including:

- source phase
- creation contract version
- idempotency key
- duplicate check outcome
- `noSupabaseWrite`
- `noTradeMutation`
- `persistenceNotAttempted`
- `tradeMutationNotAttempted`

The local execution record should not contain raw DOM, screenshots, credentials,
account numbers, balances, holdings, or personal identifiers.

## Idempotency Policy

Execution record creation must be deterministic and duplicate-safe.

Future helpers should build a record fingerprint from stable broker-result
evidence, for example:

- broker/provider
- broker order/reference id when present
- source evidence fingerprint
- source broker result fingerprint
- action
- ticker/instrument identity
- execution quantity
- execution price
- broker timestamp
- execution status

Policy:

- duplicate detection runs before creation
- the same broker reference cannot create multiple records
- the same source evidence fingerprint should link to at most one local record
- repeated attempts should return an existing/duplicate state, not append again
- missing broker id can be allowed only with an explicit warning policy and a
  stronger source fingerprint
- local idempotency does not replace future Supabase idempotency

## Separation From Persistence

Local execution record creation is separate from Supabase persistence.

Creating or previewing a local execution record must not write Supabase. A
future Supabase write path requires:

- migration readiness
- RLS/user-id review
- server-only persistence flag
- production lock for production writes
- idempotent insert/upsert policy
- audit diagnostics
- rollback/retention policy

Supabase persistence must be its own explicit action and must not be implied by
record creation.

## Separation From Trade Mutation

Execution record creation does not automatically:

- open a live trade
- close a live trade
- resize a live trade
- update History
- update Statistics
- update PnL
- update recommendation outcome
- update position accounting

Trade mutation must be a separate explicit phase with its own validation,
authority checks, idempotency, rollback/audit strategy, and user-visible
diagnostics.

The first local execution record phase should set `noTradeMutation` and
`tradeMutationNotAttempted` explicitly.

## UI Behavior

Future UI may show:

- `Execution record eligibility`
- `Execution record preview`
- source broker result fingerprint
- source evidence fingerprint
- duplicate detection status
- warnings and blockers
- `no Supabase write`
- `no trade mutation`

A future `Create local execution record` button may be considered only after a
separate contract action. It must be:

- dev-gated for the first phase
- explicit and manual
- disabled for preview-only broker results
- disabled for duplicate-risk results
- disabled for partial/placed/accepted results unless a later policy exists
- clear that it is local-only
- clear that it does not write Supabase
- clear that it does not mutate live trades

No UI should imply Avanza execution, broker submission, persistence, History or
Statistics update, or live trade mutation.

## Diagnostics

Future diagnostics must include:

- `recordCreationAttempted`
- `recordCreationAllowed`
- `recordCreationBlocked`
- `recordCreationBlockedReason`
- `duplicateDetected`
- `sourceBrokerResultFingerprint`
- `sourceEvidenceFingerprint`
- `sourceDryRunRequestId`
- `sourceCaptureId`
- `createdRecordId` when creation is allowed
- `noSupabaseWrite`
- `noTradeMutation`
- `persistenceNotAttempted`
- `tradeMutationNotAttempted`
- validation errors
- warnings

Diagnostics should remain local/dev-only until a separate persistence design is
approved.

## Test Plan

Before implementation, add pure contract coverage for:

- eligible real broker result allows local record eligibility
- preview-only broker result is blocked
- `notBrokerExecutionResult` metadata is blocked
- missing action is blocked
- missing ticker/instrument identity is blocked
- missing quantity is blocked
- missing price is blocked
- missing timestamp is blocked by default
- missing broker reference is blocked by default or warned by explicit policy
- placed/accepted result is blocked
- partial result is blocked without partial-fill policy
- duplicate evidence fingerprint is blocked or returned as duplicate
- duplicate broker reference is blocked or returned as duplicate
- sensitive/raw data flags are blocked
- Supabase write attempt is blocked
- trade mutation attempt is blocked
- History/Statistics update attempt is blocked
- successful eligibility returns `noSupabaseWrite` and `noTradeMutation`

## Action 313 - Execution Record Eligibility Contract

Action 313 implemented
[`lib/execution-record-eligibility.ts`](../lib/execution-record-eligibility.ts),
a pure TypeScript eligibility contract for the future transition from a
sanitized broker-result-like candidate to a local execution record.

The helper layer evaluates only whether a candidate is eligible. It returns
status, reasons, blockers, warnings, safety labels, and a deterministic
candidate fingerprint. It does not create an execution record.

Implemented checks include:

- missing candidate -> `not_eligible`
- preview-only or `notBrokerExecutionResult` metadata -> blocked by default
- missing action, ticker/instrument, quantity, price, timestamp, broker
  reference, or source fingerprint -> blocked unless an explicit option allows
  the timestamp/reference warning case
- not-filled status -> blocked when filled status is required
- sensitive/raw data flags -> blocked
- Supabase write, trade mutation, or execution-record creation attempts ->
  blocked
- duplicate source fingerprint or broker reference -> `duplicate_risk`
- complete filled sanitized candidate -> `eligible`

All results carry explicit metadata:

- `eligibilityOnly`
- `noExecutionRecordCreated`
- `noSupabaseWrite`
- `noTradeMutation`

The next phase may add an execution-record preview contract, but it must remain
separate from real record creation, Supabase persistence, and trade mutation.

## Action 314 - Localhost Eligibility Bridge Stub

Action 314 added a localhost bridge contract/stub for the same eligibility
boundary:

- `POST /execution-record-eligibility`
- `buildLocalhostBridgeExecutionRecordEligibilityRequest(...)`
- `validateLocalhostBridgeExecutionRecordEligibilityRequest(...)`
- `validateLocalhostBridgeExecutionRecordEligibilityResponse(...)`
- `checkLocalhostBridgeExecutionRecordEligibility(...)`
- `summarizeLocalhostExecutionRecordEligibilityBridgeResponse(...)`

The endpoint returns synthetic `ExecutionRecordEligibilityResult` metadata for
explicit stub modes such as eligible filled candidates, preview-only blockers,
missing price/quantity/timestamp/reference blockers, not-filled blockers,
sensitive/raw data blockers, Supabase/trade/record-creation attempt blockers,
and duplicate source/broker-reference risks.

It is still a diagnostics endpoint only. It does not create a
`BrokerExecutionResult`, execution record, Supabase write, trade mutation,
browser action, Avanza action, or order submission.

## Action 315 - Execution Record Eligibility UI Preview

Action 315 surfaced the localhost eligibility stub in the Execution Handoff
Preview Modal as a dev-gated, read-only panel:

- Button: `Check execution-record eligibility stub`
- Source candidate: latest BrokerExecutionResult-shaped preview data when
  available
- Preview-only metadata is preserved so default eligibility remains blocked for
  preview-only candidates
- Missing candidate still allows a synthetic stub check with an explicit UI
  warning
- Displayed states: `eligible`, `blocked`, `not_eligible`, `duplicate_risk`,
  and `failed`

The panel also adds informational readiness rows for eligibility status,
eligibility, duplicate risk, no `BrokerExecutionResult`, no execution record,
no Supabase write, and no trade mutation.

This remains UI diagnostics only. It does not create an execution record,
persist anything, update History/Statistics, mutate trades, create a real
`BrokerExecutionResult`, control a browser, touch Avanza, or submit orders.

## Action 417 - Execution Record Creation Contract Types

Action 417 added the first production-safe creation contract artifact:

- `lib/execution-record-creation-contract.ts`

The module is type/constant only. It defines the proposed creation input,
creation result, canonical candidate, idempotency input, source broker result
reference, audit metadata, statuses, rejection reason codes, and warning codes
from the Action 416 design.

No runtime creation path was introduced. The existing eligibility bridge,
preview diagnostics, local/dev `TureExecutionRecord` paths, Supabase behavior,
trade mutation behavior, audit/event persistence, broker result creation, and
Avanza/browser behavior remain unchanged.

Next recommended action:

**Action 418 - Create Execution Record Creation Pure Validator**

## Action 418 - Execution Record Creation Pure Validator

Action 418 added the first pure validation artifact for the production-safe
creation boundary:

- `lib/execution-record-creation-validator.ts`

The validator evaluates `ExecutionRecordCreationInput` and returns typed
`ExecutionRecordCreationResult` metadata only. It rejects unsafe or incomplete
inputs with explicit reason codes and can mark a complete input as eligible for
future candidate building without constructing the candidate yet.

No runtime creation path was introduced. The existing eligibility bridge,
preview diagnostics, local/dev `TureExecutionRecord` paths, Supabase behavior,
trade mutation behavior, audit/event persistence, broker result creation, UI
wiring, bridge wiring, and Avanza/browser behavior remain unchanged.

Next recommended action:

**Action 419 - Create Execution Record Candidate Builder**

## Action 419 - Execution Record Candidate Builder

Action 419 added the pure candidate builder layer:

- `lib/execution-record-candidate-builder.ts`

The builder calls the pure validator first and only maps a candidate when the
input is already eligible. It returns validator rejection/needs-review results
unchanged for unsafe inputs and keeps `safeToPersist=false` because no
persistence boundary exists yet.

No runtime creation path was introduced. The existing eligibility bridge,
preview diagnostics, local/dev `TureExecutionRecord` paths, Supabase behavior,
trade mutation behavior, audit/event persistence, broker result creation, UI
wiring, bridge wiring, and Avanza/browser behavior remain unchanged.

Next recommended action:

**Action 420 - Create Read-Only Execution Record Creation Preview UI**

## Action 420 - Read-Only Execution Record Creation Preview UI

Action 420 added the first read-only UI surface for the creation contract:

- `components/execution/ExecutionRecordCreationPreview.tsx`

The panel is presentational and dev-gated through the existing handoff modal
composition. It displays the pure builder/validator result, including status,
rejection reasons, warnings, idempotency/fingerprint metadata,
`safeToPersist`, no-write/no-mutation metadata, and candidate fields when
available.

No creation action was introduced. There is no persist button, Supabase write,
localStorage write, audit append, trade mutation, execution record storage,
BrokerExecutionResult creation, bridge automation, Avanza/browser behavior, or
automatic-mode behavior.

Next recommended action:

**Action 421 - Reassess Execution Record Creation Preview UI**

## Action 421 - Preview UI Reassessment

Action 421 created
`docs/execution-record-creation-preview-ui-reassessment.md`.

The reassessment verified that the Action 420 UI remains read-only, dev-gated,
and disconnected from persistence, trade mutation, audit append,
BrokerExecutionResult creation, bridge automation, and Avanza/browser behavior.
It also documented that existing broker-result preview data is preview-only, so
the creation preview should continue showing blocked/rejected metadata unless a
separate dev/test fixture supplies an eligible creation result.

Next recommended action:

**Action 422 - Create Execution Record Creation Result Fixture/Dev Input**

## Action 422 - Execution Record Creation Dev Fixture

Action 422 added a controlled local/dev input fixture:

- `lib/execution-record-creation-dev-fixture.ts`

The fixture is for read-only UI coverage and candidate branch QA only. It uses
local/dev source metadata, deterministic fixture ids/fingerprints, and the
existing pure builder to produce an eligible candidate preview with
`safeToPersist=false`.

It does not represent real broker evidence, does not persist anything, and does
not add Supabase writes, localStorage writes, audit append, trade mutation,
execution record storage, BrokerExecutionResult creation, bridge automation,
Avanza/browser behavior, or automatic-mode behavior.

Next recommended action:

**Action 423 - Reassess Execution Record Creation Dev Fixture**

## Action 423 - Execution Record Creation Dev Fixture Reassessment

Action 423 created
`docs/execution-record-creation-dev-fixture-reassessment.md`.

The reassessment verified that the Action 422 dev fixture remains a read-only
preview aid, not production evidence. It is explicitly fixture-labeled,
local/dev scoped, and gated through the existing execution-dev-tools handoff
modal path. It keeps `safeToPersist=false`, and preview-only broker-result
diagnostics still override the fixture and remain blocked/rejected.

No persistence boundary was introduced. There are still no Supabase
execution-record writes, localStorage execution-record writes, audit/event
appends, trade mutations, execution record storage, BrokerExecutionResult
creation flows, bridge automation, Avanza/browser behavior, or automatic-mode
behavior.

Next recommended action:

**Action 424 - Create Execution Record Persistence Boundary Plan**

## Action 424 - Execution Record Persistence Boundary Plan

Action 424 created
`docs/execution-record-persistence-boundary-plan.md`.

The plan defines what must exist before execution-record persistence can be
implemented: real confirmed broker evidence, schema and RLS design,
idempotency and duplicate protection, audit ordering, rollback behavior,
association confidence, and strict separation from trade mutation.

It also defines safety gates that block preview-only data, dev fixture data,
synthetic/mock data, ambiguous associations, missing idempotency, automatic
mode without later review, and all candidates where `safeToPersist=false`.

No runtime persistence behavior was added. There are still no Supabase
execution-record writes, localStorage execution-record writes, audit/event
appends, trade mutations, execution record storage, BrokerExecutionResult
creation flows, bridge automation, Avanza/browser behavior, or automatic-mode
behavior.

Next recommended action:

**Action 425 - Reassess Supabase Execution Record Schema Boundary**
