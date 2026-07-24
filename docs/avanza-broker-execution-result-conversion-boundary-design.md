# Avanza BrokerExecutionResult Conversion Boundary Design

## Purpose

This document defines the future boundary between Avanza broker confirmation
capture and `BrokerExecutionResult` conversion.

The goal is to separate sanitized evidence capture from execution-result
creation so Ture cannot accidentally create false execution records. A broker
confirmation capture result may show useful receipt evidence, but it is not
automatically a `BrokerExecutionResult`, not an execution record, not a
Supabase write, and not a live trade mutation.

This is documentation only. It adds no conversion code, no Avanza automation,
no selectors or URLs, no `BrokerExecutionResult`, no execution record, no
Supabase write, and no trade mutation.

## Action 448 Reassessment

Action 448 created
`docs/broker-execution-result-confirmation-path-reassessment.md`.

Conversion boundary update:

- Current BrokerExecutionResult eligibility remains an eligibility check only.
- Current BrokerExecutionResult conversion output remains preview-only and
  explicitly `notBrokerExecutionResult`.
- No current conversion source is production-safe for persistence or trade
  mutation.
- Future conversion must wait for a concrete BrokerExecutionResult
  confirmation requirements spec.

Next recommended action:

**Action 449 - Create BrokerExecutionResult Confirmation Requirements Spec**

## Action 449 Requirements Spec

Action 449 created
`docs/broker-execution-result-confirmation-requirements-spec.md`.

Conversion implications:

- A production-safe `BrokerExecutionResult` requires explicit source
  classification and broker-originating evidence.
- Preview-only conversion output remains insufficient for persistence or trade
  mutation.
- Conversion must reject preview, dev fixture, mock broker, dry-run, and local
  diagnostics sources.
- Future conversion validation should build on broker result source
  classification types.

Next recommended action:

**Action 450 - Create Broker Result Source Classification Types**

## Action 450 Source Classification Types

Action 450 created `lib/broker-result-source-classification.ts`.

Conversion boundary update:

- Future conversion work can reference contract-only source classifications
  before implementing validators.
- Preview-only conversion output remains blocked from persistence and trade
  mutation by policy metadata.
- `broker_confirmed` is not persistence-capable by itself.
- No conversion logic, broker result creation, capture behavior, persistence,
  or trade mutation was added.

Next recommended action:

**Action 451 - Reassess Broker Result Source Classification Types**

## Action 451 Classification Reassessment

Action 451 created
`docs/broker-result-source-classification-types-reassessment.md`.

Conversion boundary update:

- The classification module remains type/constant-only and is not runtime
  enforcement.
- Preview/dev/mock/dry-run/local diagnostics remain blocked from persistence
  and trade mutation.
- Future conversion work should use a pure source classification validator
  before any confirmation validator or BrokerExecutionResult creation path.

Next recommended action:

**Action 452 - Create Broker Result Source Classification Validator**

## Action 415 Reassessment

Action 415 created
`docs/execution-record-creation-boundary-reassessment.md`.

Boundary relationship:

- Action 415 confirmed this conversion boundary remains preview/eligibility
  only.
- `BrokerExecutionResult`-shaped previews are still not real broker results and
  must not create execution records.
- execution record creation needs a separate contract design before any
  creation helper, route, Supabase write, or trade mutation is added.

Next recommended action:

**Action 416 - Create Execution Record Creation Contract Design**

## Action 416 Contract Design

Action 416 created
`docs/execution-record-creation-contract-design.md`.

Boundary relationship:

- confirmed broker execution result conversion remains separate from execution
  record creation.
- execution record creation must reject preview-only and
  `notBrokerExecutionResult` data.
- conversion previews remain non-persistent and non-mutating.
- future record creation requires a separate contract/type/validator sequence.

Next recommended action:

**Action 417 - Create Execution Record Creation Contract Types**

## Boundary Principle

Broker confirmation capture and broker execution-result conversion are separate
phases.

- `confirmation_captured` is evidence, not automatically an execution record.
- `confirmation_partial` is not a completed execution.
- `placed` or `accepted` is not necessarily filled.
- `user_confirmed_unverified` is not a broker result.
- Conversion must be explicit, gated, validated, idempotent, and separately
  approved.

The capture contract may report sanitized receipt/readback evidence. A future
conversion contract must decide whether that evidence is eligible to become a
`BrokerExecutionResult`-shaped object. A later persistence phase must separately
decide whether any converted result may create an execution record, write
Supabase, update History/Statistics, or mutate live trade state.

## Conversion Allowed Only When

Future conversion may be allowed only when all required evidence and safety
checks pass:

- capture result status is `confirmation_captured`
- order status indicates actual fill/execution, not merely `placed` or
  `accepted`, unless a future pending-order policy is designed separately
- action matches the dry-run request
- instrument identity matches the dry-run request
- confirmed executed quantity is present and matches policy
- execution price or average fill price is present and within policy
- timestamp is present, or a future policy allows a generated timestamp that is
  tied to the evidence timestamp
- broker reference or order id is present, or an explicit missing-id policy
  allows conversion with a warning
- no mismatch risk flags are present
- no sensitive or raw-data risk flags are present
- no `brokerResultCreationAttempted` or `tradeMutationAttempted` flag is present
- future conversion feature flag is enabled
- explicit user/dev approval exists for the first phase

The first implementation should prefer blocking over warning whenever evidence
is ambiguous. It is better to miss a conversion than to create a false execution
record.

## Conversion Blocked When

Future conversion must be blocked when any of these are true:

- capture status is `confirmation_partial`, `confirmation_mismatch`,
  `confirmation_rejected_or_cancelled`, `blocked`, `failed`,
  `manual_confirmation_not_observed`, `confirmation_page_not_found`, or
  `unavailable`
- order status is `placed` or `accepted` and fill is not confirmed
- partial fill appears before a separate partial-fill design exists
- action, ticker, instrument identity, quantity, or price mismatches the
  request
- core evidence is missing, including executed quantity, fill price, and
  required identity fields
- raw DOM, unsanitized screenshot, sensitive account data, balances, holdings,
  or personal identifiers are detected
- only `user_confirmed_unverified` exists without broker confirmation evidence
- any automatic final-confirm suspicion exists
- any conversion path would directly mutate live trades
- any conversion path would write Supabase without a separate persistence flag
  and migration approval
- any conversion path would create an execution record without a separate
  execution-record design

## Placed Vs Filled Policy

`placed` and `accepted` mean the broker may have received or queued an order.
They do not prove execution or fill.

Day-trading statistics, realized P/L, position accounting, and execution quality
should not treat a placed order as a realized execution. If Ture later needs to
track placed or pending orders, that should be modeled separately, for example
as a future `BrokerOrderPlacedResult` or pending-order lifecycle event.

The initial `BrokerExecutionResult` conversion policy should represent actual
execution/fill only. `partially_filled` needs its own partial-fill accounting
design before it can affect position state.

## Required Output Mapping

A future conversion helper should map eligible captured evidence into a
`BrokerExecutionResult`-shaped object with at least:

- broker: Avanza
- action: buy or sell
- ticker and instrument identity
- executed quantity
- execution price or average fill price
- fees when available
- currency
- broker timestamp
- broker order/reference id when available
- source dry-run request id
- source capture id or capture fingerprint
- evidence status and order status
- warnings for optional missing evidence
- explicit mock/dev/source metadata when applicable

The output must clearly preserve provenance. A converted object should be
traceable back to the dry-run request and the sanitized capture evidence that
created it.

## Idempotency And Duplicate Protection

Conversion must be deterministic and duplicate-safe.

Future conversion should use an idempotency key or source fingerprint built
from stable evidence, such as:

- broker/order reference id when available
- source dry-run request id
- source capture checked timestamp
- action
- ticker
- order status
- executed quantity
- executed price

Repeated conversion attempts for the same capture must be detectable. Local/dev
conversion should be tested first. Supabase idempotency can come later and must
not be assumed from local storage alone.

## Safety Gates

Future conversion should require all relevant gates:

- execution dev tools enabled for the first phase
- broker-result conversion feature flag enabled
- capture result validates as conversion-eligible
- no blocked risk flags
- no direct trade mutation
- no Supabase write unless a separate persistence flag is enabled
- no execution record creation unless a separate capture pipeline is approved
- explicit user approval for the initial conversion test

Production conversion is out of scope until auth, RLS, idempotency, persistence,
audit, History/Statistics, and trade-mutation boundaries are separately
reviewed.

## UI Behavior

Future UI may show:

- `Capture can be converted`
- `Conversion blocked`
- evidence summary
- warnings and blockers
- source capture status
- source order status
- no automatic trade mutation

Any future conversion control must be a separate explicit button after a future
design and contract action. It must not be added by this action. It must not be
named or styled like an Avanza run/start/capture button. It must not imply
submission, persistence, or trade mutation.

## Diagnostics

Future conversion diagnostics should include:

- `conversionAttempted`
- `conversionAllowed`
- `conversionBlockedReason`
- `sourceCaptureStatus`
- `sourceOrderStatus`
- `evidenceFingerprint`
- `noTradeMutation`
- `noSupabaseWrite` unless a later persistence flag is explicitly enabled
- `noExecutionRecord` unless a later execution-record capture path is
  explicitly enabled
- warnings and validation errors

Diagnostics should remain separate from broker results and execution records
until a later persistence design explicitly changes that boundary.

## Test Plan

Before implementation:

- pure conversion eligibility contract tests
- filled capture -> convertible
- placed/accepted partial -> blocked
- partially filled -> blocked until partial-fill design exists
- mismatch -> blocked
- rejected/cancelled/expired -> blocked
- sensitive/raw evidence -> blocked
- broker-result creation attempt -> blocked
- trade-mutation attempt -> blocked
- missing core evidence -> blocked
- duplicate fingerprint -> blocked or idempotent
- no trade mutation
- no Supabase write
- no execution record creation

## Recommended Next Action

Recommended:

- `Action 305 - BrokerExecutionResult Conversion Eligibility Contract`

That action should implement pure TypeScript eligibility helpers only. It should
not create a `BrokerExecutionResult`, execution record, Supabase write, or trade
mutation.

## Action 305 Eligibility Contract

Action 305 added `lib/avanza-broker-execution-result-eligibility.ts`, a pure
TypeScript eligibility contract for future `BrokerExecutionResult` conversion.
It evaluates an `AvanzaBrokerConfirmationCaptureResult` and returns eligibility
metadata only.

The contract models:

- `eligible`
- `not_eligible`
- `partial_only`
- `duplicate_risk`
- `blocked`
- `failed`

It builds a deterministic sanitized evidence fingerprint, detects duplicate
fingerprint risk, separates placed/accepted and partial-fill evidence from
filled execution, blocks mismatch/rejected/cancelled/blocked captures, blocks
missing required action/instrument/quantity/price/timestamp/order-id evidence by
default, and blocks sensitive/raw evidence, broker-result-creation attempts, and
trade-mutation attempts.

The result labels every check as eligibility-only with no
`BrokerExecutionResult`, no execution record, no Supabase write, and no trade
mutation. It does not create or return a `BrokerExecutionResult`.

## Recommended Next Action After 305

Recommended:

- `Action 306 - BrokerExecutionResult Conversion Eligibility Bridge Stub Integration`

That action should expose eligibility diagnostics through the localhost bridge
only. It must not create a `BrokerExecutionResult`, persist execution records,
write Supabase, update History/Statistics, or mutate trades.

## Action 306 - Eligibility Bridge Stub Integration

Action 306 added a non-executing localhost bridge endpoint:

- `POST /broker-execution-result-eligibility`

The endpoint accepts optional sanitized broker-confirmation capture evidence,
existing sanitized evidence fingerprints, and eligibility options. It returns
`AvanzaBrokerExecutionResultEligibilityResult`-compatible metadata from explicit
stub modes, including eligible filled evidence, placed/accepted/partial evidence,
mismatch, missing price/quantity, sensitive evidence, broker-result-attempt,
trade-mutation-attempt, duplicate fingerprint, and missing-capture states.

Safety result:

- Eligibility check only.
- No `BrokerExecutionResult` was created.
- No execution record was created.
- No Supabase write was added.
- No trade state was mutated.
- No Avanza automation, selector, URL, browser control, `Bekrafta`, or order
  submission was added.

## Action 453 Follow-Up

Action 453 created
`docs/broker-result-source-classification-validator-reassessment.md`.

Conversion-boundary impact:

- Source classification validation is now reassessed as policy-only and
  no-write.
- It can inform future conversion gates, but it does not convert Avanza
  evidence into a BrokerExecutionResult.
- Future conversion work still needs an Avanza evidence contract and
  confirmation validator before any production-safe result can exist.

Next recommended action:

**Action 454 - Create Avanza Broker Confirmation Evidence Contract**

## Action 454 Follow-Up

Action 454 created
`docs/avanza-broker-confirmation-evidence-contract.md`.

Conversion-boundary impact:

- Avanza evidence requirements are now defined before conversion work.
- Future conversion must consume evidence from final confirmation/readback or
  account/order history, not forms/previews.
- Future conversion must preserve provenance, source classification, handoff
  matching, and partial-fill uncertainty.
- No conversion implementation, BrokerExecutionResult creation, persistence,
  Supabase write, audit append, trade mutation, browser, or Avanza behavior
  was added.

Next recommended action:

**Action 455 - Create Avanza Broker Confirmation Evidence Types**

## Action 455 Follow-Up

Action 455 created
`lib/avanza-broker-confirmation-evidence-contract.ts`.

Conversion-boundary impact:

- Future conversion can reference typed Avanza confirmation evidence contracts.
- Evidence types model final confirmation/readback and account/order history
  sources separately from form, preview, and manual-only sources.
- Partial-fill ambiguity and privacy metadata remain explicit inputs to future
  validation.
- No conversion implementation, BrokerExecutionResult creation, persistence,
  Supabase behavior, audit append, trade mutation, browser, or Avanza behavior
  was added.

Next recommended action:

**Action 456 - Reassess Avanza Broker Confirmation Evidence Types**

## Action 456 Follow-Up

Action 456 created
`docs/avanza-broker-confirmation-evidence-types-reassessment.md`.

Conversion-boundary impact:

- Evidence types are confirmed to be aligned with the contract but not
  validated.
- Typed evidence must not be converted to `BrokerExecutionResult` until a pure
  evidence validator and confirmation validator exist.
- No conversion, BrokerExecutionResult creation, persistence, Supabase, audit,
  trade mutation, browser, or Avanza behavior was added.

Next recommended action:

**Action 457 - Create Avanza Broker Confirmation Evidence Validator**

## Action 457 Follow-Up

Action 457 created
`lib/avanza-broker-confirmation-evidence-validator.ts`.

Conversion-boundary impact:

- Avanza evidence can now be checked by a pure validator before any future
  conversion design consumes it.
- The validator does not create or convert `BrokerExecutionResult` values.
- Conversion remains blocked until the validator is reassessed and a
  confirmation-validator/mapping design is created.

Next recommended action:

**Action 458 - Reassess Avanza Broker Confirmation Evidence Validator**

## Action 458 Follow-Up

Action 458 created
`docs/avanza-broker-confirmation-evidence-validator-reassessment.md`.

Conversion-boundary impact:

- Validated evidence remains evidence-only and is not a BrokerExecutionResult.
- The next boundary should define how evidence fields map to a future result
  shape without implementing conversion.
- Conversion, persistence, audit append, trade mutation, browser, and Avanza
  behavior remain out of scope.

Next recommended action:

**Action 459 - Create Evidence-to-BrokerExecutionResult Mapping Design**

## Action 459 Follow-Up

Action 459 created
`docs/avanza-evidence-to-broker-execution-result-mapping-design.md`.

Conversion-boundary impact:

- The boundary now has an evidence-first mapping design based on
  `AvanzaConfirmationEvidence` and `validateAvanzaConfirmationEvidence(...)`.
- Mapping remains future-only and design-only.
- Conversion implementation, BrokerExecutionResult creation, persistence,
  audit append, trade mutation, browser behavior, and Avanza behavior remain
  out of scope.

Next recommended action:

**Action 460 - Create BrokerExecutionResult Confirmation Validator Design**

## Action 460 Follow-Up

Action 460 created
`docs/broker-execution-result-confirmation-validator-design.md`.

Conversion-boundary impact:

- Conversion remains downstream of confirmation validation.
- Mapper implementation must not run on rejected evidence.
- Confirmed candidate output remains non-persistent and non-mutating.
- No conversion implementation or BrokerExecutionResult creation was added.

Next recommended action:

**Action 461 - Create BrokerExecutionResult Confirmation Validator Contract Types**

## Action 309 - Conversion Preview Contract

Action 309 added `lib/avanza-broker-execution-result-preview.ts`, a pure
TypeScript preview contract for mapping eligible filled capture evidence into a
`BrokerExecutionResult`-shaped preview object.

The contract still does not create a real `BrokerExecutionResult`, execution
record, Supabase write, History/Statistics update, trade mutation, Avanza
automation, selector, URL, browser control, `Bekrafta`, or order submission.
Ineligible, partial-only, duplicate-risk, blocked, and failed evidence returns
no preview object.

## Action 310 - Conversion Preview Bridge Stub

Action 310 added a non-executing localhost bridge stub at
`POST /broker-execution-result-preview`. The bridge accepts optional sanitized
capture evidence, eligibility metadata, existing fingerprints, and preview
options, then returns `AvanzaBrokerExecutionResultPreviewResult`-compatible
metadata from explicit stub modes.

The endpoint can report preview availability, missing optional evidence
warnings, partial-only evidence, blocked mismatch/sensitive evidence,
duplicate-risk evidence, or unavailable/not-eligible states. Preview-available
responses may include a `BrokerExecutionResult`-shaped preview object, but it
is explicitly marked `previewOnly` and `notBrokerExecutionResult`; every other
state returns no preview object.

The boundary remains intact:

- No real `BrokerExecutionResult` is created.
- No execution record is created.
- No Supabase write is performed.
- No trade state is mutated.
- No Avanza automation, selector, URL, browser control, `Bekrafta`, or order
  submission is added.

## Action 312 - Execution Record Creation Boundary Design

Action 312 added
[`docs/execution-record-creation-boundary-design.md`](execution-record-creation-boundary-design.md),
a documentation-only design for the future boundary after a real
`BrokerExecutionResult` exists.

The design separates broker-result conversion from local execution record
creation, Supabase persistence, and live trade mutation. It defines that a
future broker result may become a local execution record only after explicit
feature gating, validation, duplicate checks, provenance checks, and user/dev
approval for the first local-only phase.

It also documents blocked cases, including preview-only broker results,
duplicates, missing core execution fields, placed/accepted/not-filled states,
partial fills without policy, sensitive/raw data, bundled Supabase writes, and
bundled trade mutation attempts.

No runtime behavior changed. No real `BrokerExecutionResult`, execution record,
Supabase write, trade mutation, Avanza automation, selector/URL, browser
control, `Bekrafta`, or order submission was added.

## Action 315 - Execution Record Eligibility UI Preview

Action 315 added a dev-gated, read-only Execution Handoff Preview Modal panel
for the localhost `POST /execution-record-eligibility` stub.

The panel uses the latest BrokerExecutionResult-shaped preview candidate when
available and preserves `previewOnly` / `notBrokerExecutionResult` metadata so
default eligibility remains blocked for preview-only data. If no candidate is
available, the panel still permits a stub check with an explicit warning that
real eligibility requires a non-preview broker-result candidate.

The UI displays eligible, blocked, not-eligible, duplicate-risk, and failed
states plus record fingerprint, reasons, blockers, warnings, and safety
metadata. It remains preview-only:

- No real `BrokerExecutionResult` is created.
- No execution record is created.
- No Supabase write is performed.
- No trade state is mutated.
- No Avanza automation, selector, URL, browser control, `Bekrafta`, or order
  submission is added.

## Action 308 - Conversion Mapping Design

Action 308 added
[`docs/avanza-broker-execution-result-conversion-mapping-design.md`](avanza-broker-execution-result-conversion-mapping-design.md),
a documentation-only design for how future eligible broker confirmation capture
evidence should map into `BrokerExecutionResult`-shaped preview data.

The mapping design defines source requirements, target field shape, a field
mapping table, validation rules, filled-vs-partial/placed/rejected status
policy, currency/fees policy, idempotency requirements, UI expectations, and a
future pure-contract test plan.

It still does not implement conversion code, create a `BrokerExecutionResult`,
create an execution record, write Supabase, mutate trades, control a browser,
touch Avanza, or submit orders.

## Action 307 - Eligibility UI Preview

Action 307 added a dev-gated, read-only BrokerExecutionResult eligibility
preview to the Execution Handoff Preview Modal. The preview calls only the
localhost `POST /broker-execution-result-eligibility` stub through
`checkLocalhostBridgeBrokerExecutionResultEligibility(...)` and displays:

- normalized summary/status/HTTP/elapsed metadata
- sanitized evidence fingerprint
- eligibility reasons, blockers, errors, and warnings
- eligible, partial-only, blocked/not-eligible, duplicate-risk, and failed
  callouts
- safety labels for eligibility-only behavior

The preview can run with the latest broker-confirmation capture result when one
exists. If no capture result is available, the UI warns that real eligibility
requires broker confirmation evidence and treats the response as synthetic local
stub metadata.

Safety result:

- Eligibility check only.
- No `BrokerExecutionResult` was created.
- No execution record was created.
- No Supabase write was added.
- No trade state was mutated.
- No Avanza automation, selector, URL, browser control, `Bekrafta`, or order
  submission was added.
