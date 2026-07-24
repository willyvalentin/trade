# Avanza BrokerExecutionResult Conversion Mapping Design

## Purpose

This document defines the future mapping from eligible Avanza broker
confirmation capture evidence to `BrokerExecutionResult`-shaped data.

This is mapping design only. It does not implement conversion code, create a
`BrokerExecutionResult`, create an execution record, write Supabase, mutate
trade state, add Avanza automation, or add Avanza selectors/URLs.

## Action 448 Reassessment

Action 448 created
`docs/broker-execution-result-confirmation-path-reassessment.md`.

Mapping boundary update:

- Current mapping output is still preview-shaped data only.
- Preview metadata must continue to block persistence and trade mutation.
- Real mapping to a production-safe BrokerExecutionResult requires a future
  confirmation requirements spec and confirmed broker-originating evidence.
- Dev/mock/dry-run/local diagnostic sources remain unsafe for persistence.

Next recommended action:

**Action 449 - Create BrokerExecutionResult Confirmation Requirements Spec**

## Action 449 Requirements Spec

Action 449 created
`docs/broker-execution-result-confirmation-requirements-spec.md`.

Mapping implications:

- Mapping output must preserve explicit source classification and provenance.
- Mapping from preview/dev/mock/dry-run/local diagnostic sources remains
  disallowed for production-safe results.
- Filled/executed evidence must be distinguished from placed, accepted, pending,
  or partially filled evidence.
- Future mapping types should depend on source classification types before a
  confirmation validator is introduced.

Next recommended action:

**Action 450 - Create Broker Result Source Classification Types**

## Action 450 Source Classification Types

Action 450 created `lib/broker-result-source-classification.ts`.

Mapping boundary update:

- Mapping policy can now refer to contract-only source classes.
- Preview/dev/mock/dry-run/local diagnostics remain blocked from persistence
  and trade mutation.
- The module adds no mapping implementation, validator, broker result creation,
  Supabase behavior, or trade mutation.

Next recommended action:

**Action 451 - Reassess Broker Result Source Classification Types**

## Action 451 Classification Reassessment

Action 451 created
`docs/broker-result-source-classification-types-reassessment.md`.

Mapping boundary update:

- Source classification types remain policy metadata only.
- Future mapping must not treat policy constants as enforcement.
- A pure source classification validator is the next safe step before mapping
  or confirmation validation logic.

Next recommended action:

**Action 452 - Create Broker Result Source Classification Validator**

## Action 415 Reassessment

Action 415 created
`docs/execution-record-creation-boundary-reassessment.md`.

Mapping boundary update:

- conversion preview mapping remains preview-only.
- preview metadata must continue to report no execution record, no Supabase
  write, and no trade mutation.
- the next execution-record step should define a creation contract, not
  implement mapping-to-record behavior.

Next recommended action:

**Action 416 - Create Execution Record Creation Contract Design**

## Action 416 Contract Design

Action 416 created
`docs/execution-record-creation-contract-design.md`.

Mapping relationship:

- mapping preview output remains insufficient for record creation.
- future record creation requires confirmed broker result evidence, a separate
  idempotency key, unambiguous trade association, and rejection handling.
- no mapping-to-record implementation, Supabase write, trade mutation, or
  Avanza behavior was added.

Next recommended action:

**Action 417 - Create Execution Record Creation Contract Types**

## Source Requirements

Mapping requires all of the following before a future conversion preview can be
considered:

- `AvanzaBrokerExecutionResultEligibilityResult.status` is `eligible`
- capture status is `confirmation_captured`
- broker order status is `filled`, or a future explicitly approved
  filled-equivalent status
- original `dryRunOrderInput`
- sanitized `brokerConfirmationReadback`
- sanitized `evidenceFingerprint`
- source request/capture identifiers when available

If any source requirement is missing, the future mapping helper should return a
blocked preview result, not a partial `BrokerExecutionResult`.

## Target Shape

The intended `BrokerExecutionResult`-shaped output should include:

- broker/provider
- action, `buy` or `sell`
- ticker
- instrument name, market, currency, and type
- quantity
- execution price or average fill price
- fees/courtage when available
- total amount when available
- broker timestamp
- broker order/reference id
- source dry-run request id
- source capture id or evidence fingerprint
- status
- warnings
- metadata

The output must preserve provenance. A future preview should make it clear which
dry-run request, capture result, and sanitized evidence fingerprint produced the
mapped fields.

## Field Mapping

| BrokerExecutionResult field | Source field | Required? | Validation rule | Failure behavior | Notes |
| --- | --- | --- | --- | --- | --- |
| `broker` / `provider` | constant `avanza` | Yes | Constant must be explicit and not client-provided | Block | Existing execution stack may expect Avanza-shaped data, but this remains evidence-derived. |
| `action` | `brokerConfirmationReadback.action` | Yes | Must be `buy` or `sell` and eligibility-approved against dry-run input | Block | Do not infer action from button labels alone. |
| `ticker` | `brokerConfirmationReadback.ticker` | Yes | Must match eligible capture/instrument policy | Block | Preserve sanitized display casing. |
| `instrumentName` | `brokerConfirmationReadback.name` or dry-run instrument name | No | Prefer readback, fall back to dry-run value with warning | Warning | Missing name should not block if ticker/market/type are sufficient. |
| `market` | `brokerConfirmationReadback.market` or dry-run instrument market | No | Prefer readback, fall back with warning | Warning | Missing market may become blocking for ambiguous instruments later. |
| `currency` | readback currency or dry-run instrument currency | Yes | Must be known or policy-approved with warning | Block or warning by policy | Currency is important for amount/fee interpretation. |
| `instrumentType` | readback instrument type or dry-run instrument type | No | Prefer readback, fall back with warning | Warning | Missing type may be acceptable for first preview only. |
| `quantity` | `brokerConfirmationReadback.quantityValue` | Yes | Numeric, finite, positive, eligibility-approved | Block | Must not map missing or mismatched quantity. |
| `executedPrice` / `averageFillPrice` | `brokerConfirmationReadback.priceValue` | Yes | Numeric, finite, positive, eligibility-approved | Block | Do not use intended/limit price if readback price is missing. |
| `fees` / `courtage` | `brokerConfirmationReadback.fees` | No | Numeric when present | Warning if missing or unparsable | Preserve original sanitized display in metadata if needed. |
| `totalAmount` | `brokerConfirmationReadback.totalAmount` | No | Numeric when present | Warning if missing or unparsable | Do not recompute as authoritative unless policy exists. |
| `brokerTimestamp` | `brokerConfirmationReadback.timestamp` | Yes by default | Valid timestamp or explicitly allowed missing timestamp policy | Block by default | Generated timestamps must be warning-only provenance metadata. |
| `brokerOrderId` / `referenceId` | `brokerConfirmationReadback.orderIdSanitized` | Yes by default | Sanitized, non-empty, no sensitive account data | Block by default | Missing-id policy must be explicit and idempotency-safe. |
| `status` | `brokerConfirmationReadback.orderStatus` | Yes | Must map from `filled` only for first phase | Block | `placed`, `accepted`, and `partially_filled` remain separate. |
| `sourceDryRunRequestId` | dry-run request metadata/request id | No | Include when present | Warning if missing | Useful for tracing. |
| `sourceCaptureFingerprint` | `eligibility.evidenceFingerprint` | Yes | Non-empty deterministic fingerprint | Block | Required for duplicate detection and idempotency. |
| `warnings` | eligibility and mapping warnings | No | Preserve warning list | Continue | Warnings must not hide blockers. |
| `metadata` | eligibility/capture/dry-run provenance | Yes | Sanitized only, no raw DOM/screenshots/account data | Block if sensitive/raw data appears | Must mark conversion preview source and safety boundaries. |

## Validation Rules

Future mapping must validate the already-approved source again at the mapping
boundary:

- action, instrument, quantity, and price must already be eligibility-approved
- quantity must be numeric, finite, and positive
- price must be numeric, finite, positive, and within policy
- timestamp is required unless a future policy allows a generated timestamp
  warning
- broker order/reference id is required unless a future policy allows missing
  id with warning and a safe idempotency key
- no sensitive or raw fields are allowed
- partial, placed, accepted, rejected, cancelled, expired, unknown, blocked, or
  failed evidence must not be mapped as filled execution

The mapper should prefer blocking over warning for missing or ambiguous core
execution evidence.

## Status Mapping Policy

| Broker confirmation order status | Mapping policy |
| --- | --- |
| `filled` | Eligible for future execution-result preview if all eligibility and mapping checks pass. |
| `partially_filled` | Not mapped until a partial-fill accounting policy exists. |
| `placed` | Not mapped to an execution result. |
| `accepted` | Not mapped to an execution result. |
| `rejected` | No execution result. |
| `cancelled` | No execution result. |
| `expired` | No execution result. |
| `unknown` | No execution result. |

Placed or accepted orders may need a future pending-order model, but they must
not become realized execution results.

## Currency And Fees Policy

Currency should come from sanitized readback when available, otherwise from the
dry-run instrument identity. Missing currency should be blocking or a strong
warning depending on the future conversion preview policy.

Fees/courtage and total amount are optional for the first mapping preview, but
missing or unparsable values should be warnings. They should not prevent a filled
execution preview if all core execution evidence is present.

Foreign exchange, converted values, and multiple-currency summaries should be
preserved as sanitized metadata only until a dedicated FX policy exists.

## Idempotency

The source evidence fingerprint must be included in every future conversion
preview. Duplicate detection remains the responsibility of the eligibility
layer and must not be bypassed by mapping.

A future execution record should use the evidence fingerprint, broker order id,
and source request/capture metadata for idempotency. Local preview conversion
must not assume Supabase idempotency or localStorage dedupe is enough for
production persistence.

## Safety Boundaries

This mapping design does not:

- create a `BrokerExecutionResult`
- create an execution record
- write Supabase
- mutate trade state
- update History or Statistics
- imply realized PnL
- control a browser
- touch Avanza
- click `Bekrafta`
- submit orders

Mapping is a future transformation boundary only. Persistence, execution-record
creation, History/Statistics integration, and live trade mutation remain
separate phases requiring separate design and approval.

## UI Behavior

Future UI may show a read-only `BrokerExecutionResult conversion preview` with:

- mapped fields
- source evidence fingerprint
- missing optional evidence warnings
- blocked required evidence errors
- source capture and eligibility status
- explicit no-persistence and no-trade-mutation labels

This design does not add a create/convert button. Any future button must be
designed separately and must not imply Avanza order execution, broker
submission, persistence, or trade mutation.

## Future Contract Test Plan

Before any implementation can be considered complete, the pure mapping contract
should cover:

- eligible filled mapping preview
- missing optional fees warning
- missing optional total amount warning
- missing required action/ticker/quantity/price blocked
- missing timestamp blocked by default
- missing order id blocked by default
- partial, placed, accepted, rejected, cancelled, expired, unknown blocked
- duplicate fingerprint blocked by eligibility before mapping
- sensitive/raw metadata blocked
- no `BrokerExecutionResult` persistence side effect
- no execution record side effect
- no Supabase write side effect
- no trade mutation side effect

## Recommended Next Action

Recommended:

- `Action 309 - BrokerExecutionResult Conversion Preview Contract`

That action should implement pure TypeScript preview helpers that produce a
`BrokerExecutionResult`-shaped preview object only. It must still not create a
real `BrokerExecutionResult`, create an execution record, write Supabase, mutate
trades, control a browser, touch Avanza, or submit orders.

## Action 309 - Conversion Preview Contract

Action 309 added `lib/avanza-broker-execution-result-preview.ts`, a pure
TypeScript preview contract that maps eligible filled broker-confirmation
capture evidence into a `BrokerExecutionResult`-shaped preview object.

The contract exposes:

- `AvanzaBrokerExecutionResultPreviewStatus`
- `AvanzaBrokerExecutionResultPreviewField`
- `AvanzaBrokerExecutionResultPreviewShape`
- `AvanzaBrokerExecutionResultPreviewResult`
- `buildAvanzaBrokerExecutionResultPreview(...)`
- `summarizeAvanzaBrokerExecutionResultPreview(...)`
- `getAvanzaBrokerExecutionResultPreviewLabels(...)`
- `isAvanzaBrokerExecutionResultPreviewAvailable(...)`

The preview helper evaluates eligibility when needed, returns no preview for
partial-only, duplicate-risk, blocked, failed, or not-eligible evidence, and
marks all successful preview shapes with `previewOnly`,
`notBrokerExecutionResult`, `noExecutionRecord`, `noSupabaseWrite`, and
`noTradeMutation` metadata.

Recommended next action:

- `Action 310 - BrokerExecutionResult Conversion Preview Bridge Stub`

That action should expose preview-only metadata through the localhost bridge
without creating a real `BrokerExecutionResult`, execution record, Supabase
write, trade mutation, Avanza automation, browser control, or order submission.

## Action 310 - Conversion Preview Bridge Stub

Action 310 added `POST /broker-execution-result-preview` to the localhost
bridge contract/server stub plus
`checkLocalhostBridgeBrokerExecutionResultPreview(...)` and
`summarizeLocalhostBrokerExecutionResultPreviewBridgeResponse(...)` in the
frontend-safe bridge client.

The endpoint accepts optional broker-confirmation capture evidence, eligibility
metadata, sanitized existing fingerprints, and preview options. It returns
synthetic `AvanzaBrokerExecutionResultPreviewResult` metadata for explicit
stub modes:

- `preview_available_filled`
- `preview_available_missing_optional`
- `partial_only_placed`
- `partial_only_partially_filled`
- `blocked_mismatch`
- `blocked_rejected`
- `blocked_sensitive`
- `duplicate_risk`
- `not_eligible_capture_missing`
- `unavailable`

Only `preview_available` responses may include the
`BrokerExecutionResult`-shaped preview object, and that object remains marked
`previewOnly` and `notBrokerExecutionResult`. Blocked, duplicate-risk,
partial-only, failed, and not-eligible responses return no preview object.

Smoke and e2e/client coverage now exercise preview-available,
missing-optional warnings, partial-only, blocked mismatch/sensitive,
duplicate-risk, default unavailable/not-eligible, malformed JSON, and invalid
response normalization.

Safety remains unchanged: no real `BrokerExecutionResult`, execution record,
Supabase write, trade mutation, Avanza automation, selector/URL, browser
control, `Bekrafta`, or order submission is created.

## Action 311 - Conversion Preview UI

Action 311 added a dev-gated, read-only `BrokerExecutionResult conversion
preview` panel to the Execution Handoff Preview Modal.

The panel calls `checkLocalhostBridgeBrokerExecutionResultPreview(...)` and
passes the latest broker-confirmation capture result and eligibility result
when either is available. If no evidence exists, the panel still allows a stub
check but warns that real preview conversion requires eligible broker
confirmation capture evidence.

The UI displays:

- preview summary, status, HTTP result, and elapsed time
- preview-available, partial-only, blocked, duplicate-risk, not-eligible, and
  failed states
- preview-shaped fields for broker, action, ticker, quantity, price, fees,
  total amount, timestamp, broker order id, and source capture fingerprint
- `previewOnly`, `notBrokerExecutionResult`, `noExecutionRecord`,
  `noSupabaseWrite`, and `noTradeMutation` metadata
- warnings, blockers, errors, and safety labels

The panel also adds informational readiness rows for preview status,
preview-available, partial-only, duplicate-risk, no real
`BrokerExecutionResult`, no execution record, no Supabase write, and no trade
mutation.

It does not enable conversion, create a real `BrokerExecutionResult`, create an
execution record, write Supabase, mutate trades, control a browser, touch
Avanza, add selectors/URLs, or submit orders.

## Action 312 - Execution Record Creation Boundary Design

Action 312 added
[`docs/execution-record-creation-boundary-design.md`](execution-record-creation-boundary-design.md),
a documentation-only design for the future boundary between a real
`BrokerExecutionResult` and local execution record creation.

The design makes the next boundary explicit:

- `BrokerExecutionResult` is not automatically an execution record.
- execution record creation is not automatically Supabase persistence.
- Supabase persistence is not automatically live trade mutation.
- every step must be explicit, gated, validated, idempotent, and auditable.

It defines future allowed and blocked record-creation criteria, target local
record fields, idempotency policy, persistence separation, trade mutation
separation, UI expectations, diagnostics, and the pure-contract test plan for
`Action 313 - Execution Record Eligibility Contract`.

No code behavior changed. No real `BrokerExecutionResult`, execution record,
Supabase write, trade mutation, Avanza automation, selector/URL, browser
control, `Bekrafta`, or order submission was added.

## Action 313 - Execution Record Eligibility Contract

Action 313 added
[`lib/execution-record-eligibility.ts`](../lib/execution-record-eligibility.ts),
a generic, sanitized eligibility layer for deciding whether a future
broker-result-like candidate may become a local execution record.

This layer is intentionally downstream of the Avanza conversion preview:

- preview-only candidates are blocked by default
- missing action, ticker, quantity, price, timestamp, broker reference, or
  source fingerprint is blocked unless a specific warning-only option applies
- non-filled statuses are blocked by default
- sensitive/raw data flags are blocked
- Supabase write, trade mutation, and record-creation attempts are blocked
- duplicate source fingerprints or broker references return `duplicate_risk`

The contract returns only eligibility metadata, blockers, warnings, labels, and
a deterministic candidate fingerprint. It does not create a real
`BrokerExecutionResult`, execution record, Supabase write, trade mutation,
browser action, Avanza action, or order submission.

## Action 453 Follow-Up

Action 453 created
`docs/broker-result-source-classification-validator-reassessment.md`.

Mapping-design impact:

- The source classification validator remains a pure policy gate only.
- Preview/dev/mock/dry-run/local diagnostics remain blocked from persistence
  and trade mutation.
- Mapping output must still preserve provenance and should not be treated as
  confirmed broker evidence without a future evidence contract and
  confirmation validator.

Next recommended action:

**Action 454 - Create Avanza Broker Confirmation Evidence Contract**

## Action 454 Follow-Up

Action 454 created
`docs/avanza-broker-confirmation-evidence-contract.md`.

Mapping-design impact:

- The mapping design now has a prerequisite evidence contract for Avanza
  confirmation/readback fields.
- Mapping should not treat order form, order preview, manual-only, dev, mock,
  dry-run, or local diagnostic sources as confirmed execution evidence.
- Mapping should preserve provenance, field confidence, broker references,
  handoff fingerprint links, and partial-fill uncertainty for future
  validators.
- No mapping implementation, conversion, persistence, Supabase behavior, audit
  append, trade mutation, browser, or Avanza behavior was added.

Next recommended action:

**Action 455 - Create Avanza Broker Confirmation Evidence Types**

## Action 455 Follow-Up

Action 455 created
`lib/avanza-broker-confirmation-evidence-contract.ts`.

Mapping-design impact:

- Mapping can now target typed Avanza confirmation evidence before any
  conversion implementation.
- Source type, price field type, order status, provenance, confidence, privacy,
  and partial-fill evidence are explicit type contracts.
- The mapping still must not treat typed evidence as validated confirmation
  without future validator work.

Next recommended action:

**Action 456 - Reassess Avanza Broker Confirmation Evidence Types**

## Action 456 Follow-Up

Action 456 created
`docs/avanza-broker-confirmation-evidence-types-reassessment.md`.

Mapping-design impact:

- Evidence-to-result mapping remains blocked until evidence validation exists.
- Typed source, provenance, privacy, confidence, and partial-fill fields are
  available for future mapper design, but they are not proof of confirmation.
- No mapping/conversion implementation or persistence/trade mutation behavior
  was added.

Next recommended action:

**Action 457 - Create Avanza Broker Confirmation Evidence Validator**

## Action 457 Follow-Up

Action 457 created
`lib/avanza-broker-confirmation-evidence-validator.ts`.

Mapping-design impact:

- Evidence-to-result mapping can now depend on a pure evidence validation
  result in future design work.
- The validator returns `valid`, `rejected`, and `needs_review`, but does not
  map evidence to BrokerExecutionResult fields.
- Mapping and conversion remain out of scope.

Next recommended action:

**Action 458 - Reassess Avanza Broker Confirmation Evidence Validator**

## Action 458 Follow-Up

Action 458 created
`docs/avanza-broker-confirmation-evidence-validator-reassessment.md`.

Mapping-design impact:

- The current mapping design predates typed evidence validation.
- A new evidence-to-BrokerExecutionResult mapping design should define how
  validated evidence fields, source classification results, confidence, and
  partial-fill uncertainty map to future BrokerExecutionResult preview/result
  semantics.
- No mapping implementation was added.

Next recommended action:

**Action 459 - Create Evidence-to-BrokerExecutionResult Mapping Design**

## Action 459 Follow-Up

Action 459 created
`docs/avanza-evidence-to-broker-execution-result-mapping-design.md`.

Mapping-design impact:

- The newer Action 459 design supersedes this earlier preview-era mapping
  design for validated Avanza evidence.
- The Action 459 design maps typed evidence fields, validation statuses,
  provenance, idempotency inputs, partial-fill states, and no-write boundaries.
- No mapping implementation or BrokerExecutionResult creation was added.

Next recommended action:

**Action 460 - Create BrokerExecutionResult Confirmation Validator Design**

## Action 460 Follow-Up

Action 460 created
`docs/broker-execution-result-confirmation-validator-design.md`.

Mapping-design impact:

- Future mapping must be gated by confirmation validator output.
- Rejected or needs-review evidence should not produce persistence-safe result
  candidates.
- The next safe step is type-only confirmation validator contracts.

Next recommended action:

**Action 461 - Create BrokerExecutionResult Confirmation Validator Contract Types**
