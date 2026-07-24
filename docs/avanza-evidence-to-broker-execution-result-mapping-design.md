# Avanza Evidence-to-BrokerExecutionResult Mapping Design

## 1. Purpose

Define how validated Avanza confirmation evidence could later map to a
`BrokerExecutionResult`.

This is documentation/design only. It does not implement mapping code, create
`BrokerExecutionResult` values, capture or extract evidence, persist records,
write Supabase, append audit events, mutate trades, automate browsers, or touch
Avanza.

## 2. Scope

Included:

- evidence-to-result mapping rules.
- field-level mapping from `AvanzaConfirmationEvidence`.
- required preconditions before mapping.
- rejection and needs-review handling.
- partial-fill considerations.
- idempotency and provenance mapping.
- relationship to execution records and trade mutation.

Excluded:

- implementation.
- capture/OCR/browser extraction.
- `BrokerExecutionResult` creation.
- persistence.
- Supabase reads or writes.
- audit append.
- trade mutation.
- automatic mode.

## 3. Preconditions before mapping

Future mapping may be considered only when all of these are true:

- Evidence passes `validateAvanzaConfirmationEvidence(...)`.
- The evidence validator status is `valid`.
- Source classification is acceptable for conversion and does not represent
  preview/dev/mock/dry-run/local diagnostics.
- Source type is `final_confirmation` or `account_order_history`.
- Source type is not `order_form`, `order_preview`, or
  `manual_user_provided` alone.
- Provenance is present with an evidence fingerprint.
- Broker order id, confirmation id, fill id, execution id, broker reference,
  or reviewed strong equivalent exists.
- Side is present and valid.
- Instrument identity is present.
- Quantity is positive and finite.
- Price is positive and finite.
- Confirmation timestamp is present and plausible.
- Captured timestamp is present.
- Partial-fill state is absent/clear, or explicitly routed to
  `needs_review`.
- No privacy metadata indicates raw credentials, cookies/tokens, account
  numbers, balances/holdings, raw DOM, or raw sensitive data.

Passing these preconditions would not itself persist records, append audit, or
mutate trades.

## 4. Field mapping table

| BrokerExecutionResult field | Avanza evidence source | Required? | Mapping rule | Failure behavior |
| --- | --- | --- | --- | --- |
| `broker` / `provider` | `evidence.broker` | Yes | Must be `avanza`. | Reject conversion. |
| `brokerOrderId` | `evidence.brokerReferences.orderId` or `orderNumber` | Yes by default | Prefer broker order id, fall back to reviewed order number. | Reject or needs-review if strong equivalent is missing. |
| `brokerConfirmationId` | `confirmationId`, `fillId`, `executionId`, or strong equivalent | Yes by default | Prefer confirmation/fill/execution id; preserve equivalent label in metadata. | Reject or needs-review if no equivalent exists. |
| `brokerReference` | `brokerReference` / strong equivalent | No | Preserve as supplemental reference. | Warning if missing when order id is present. |
| `instrumentName` | `evidence.instrument.instrumentName` | Yes | Preserve sanitized broker display name. | Reject if no instrument identifier exists. |
| `ticker` | `ticker` | Preferred | Preserve sanitized ticker when available. | Use ISIN/instrument id with warning if ticker missing. |
| `isin` | `isin` | No | Preserve for idempotency and identity confidence. | Warning only. |
| `instrumentId` | `instrumentId` | No | Preserve Avanza/broker instrument id when available. | Warning only. |
| `market` / `venue` | `market`, `venue` | No | Preserve sanitized market/venue. | Warning only unless instrument is ambiguous. |
| `side` | `evidence.side` | Yes | Map `buy`/`sell` directly. | Reject conversion. |
| `quantity` | `evidence.quantity` | Yes | Numeric, finite, positive. | Reject conversion. |
| `executionPrice` | `evidence.price.value` | Yes | Use only positive finite broker evidence price. | Reject conversion. |
| `priceType` | `evidence.price.fieldType` | Yes | Preserve execution/average-fill/filled/limit/accepted distinction. | Needs-review if the type is not execution/fill-equivalent. |
| `currency` | `evidence.currency` / `evidence.price.currency` | Yes | Values should agree or require review. | Reject or needs-review if missing/mismatched. |
| `orderType` | `evidence.orderType` | No | Preserve sanitized order type. | Warning only. |
| `status` | `evidence.orderStatus` | Yes | `filled`/`executed` map to confirmed; partial maps to partial/needs-review. | Reject/needs-review for placed, accepted, pending, unknown, rejected, cancelled. |
| `confirmationTimestamp` | `evidence.confirmationTimestamp` | Yes | Use broker evidence timestamp. | Reject conversion. |
| `capturedTimestamp` | `evidence.capturedTimestamp` / provenance capturedAt | Yes | Preserve capture/readback timestamp. | Needs-review if missing/inconsistent. |
| `sourceClassification` | evidence/provenance source classification | Yes | Preserve source classification and validator result. | Reject if unsafe. |
| `handoffPayloadFingerprint` | evidence/provenance handoff fingerprint | Preferred | Preserve for traceability. | Warning if missing. |
| `provenanceMetadata` | `evidence.provenance` | Yes | Carry sanitized capture method, mode, page identity, confidence, hashes, ids. | Reject if missing fingerprint/provenance. |
| `warnings` | evidence warnings + validator warnings | No | Preserve warning list. | Warnings must not hide blockers. |
| `rejectionReasons` | evidence validator reasons | No | Preserve for rejected/needs-review previews only. | Rejected evidence must not produce persistence-safe result. |

## 5. BrokerExecutionResult status model

Future result statuses should distinguish:

`confirmed`:

- evidence validator status is `valid`.
- order status is `filled` or `executed`.
- required broker references, instrument, side, quantity, price, timestamps, and
  provenance are present.
- still not persistence approval.

`rejected`:

- evidence validator status is `rejected`.
- source is order form/preview/manual-only.
- broker references, provenance, timestamp, instrument, quantity, or price are
  missing/invalid.
- order status is rejected/cancelled or otherwise incompatible with execution.

`needs_review`:

- evidence validator status is `needs_review`.
- low confidence, ambiguous partial fill, uncertain timestamps, currency
  mismatch, or ambiguous broker reference exists.
- may support review-only UI preview but not persistence-safe result.

`partial_fill`:

- Avanza evidence indicates partial or multiple fills.
- must remain separate from full confirmed execution until partial-fill
  accounting exists.

`unsupported`:

- evidence status/source/page/price type cannot be mapped by current policy.
- includes placed, accepted, pending, unknown, and unreviewed equivalent states.

## 6. Partial-fill mapping

Full fill:

- `filled` or `executed` status with complete quantity/price/reference data may
  map to future `confirmed` result semantics after converter implementation and
  confirmation validation exist.

Partial fill:

- `partially_filled` or `partialFill.status` of `partial`,
  `multiple_fills`, or `unclear` must not map to a full-fill result.
- future mapping must preserve filled quantity, remaining quantity, average
  fill price, fill timestamp, fill ids, and order id.

Single vs multiple records:

- unresolved. One order with multiple fills may need one aggregate result or
  one result per fill.
- fee allocation, duplicate handling, and remaining quantity accounting must be
  designed before implementation.

Ambiguous fallback:

- ambiguous partial-fill evidence should map to `needs_review` or
  `partial_fill`, never `confirmed`.

Conservative default:

- if partial-fill status is unclear, block persistence-safe conversion.

## 7. Idempotency/fingerprint mapping

Future fingerprints should include stable, sanitized evidence fields:

- evidence fingerprint.
- broker order id / order number.
- confirmation id / fill id / execution id / strong equivalent.
- broker reference.
- instrument identity: ticker, ISIN, instrument id, and instrument name.
- side.
- quantity.
- execution/filled/average price.
- currency.
- confirmation timestamp.
- handoff payload fingerprint.
- capture id / request id when present.
- source screenshot/text hash if later available under a privacy-safe design.

Idempotency rules:

- evidence fingerprint should be required for conversion.
- broker references should participate in duplicate detection.
- generated fingerprints must not rely on raw screenshots, raw DOM, account
  numbers, credentials, cookies, tokens, balances, or holdings.
- mapping preview must not assume local duplicate checks are enough for
  production persistence.

## 8. Provenance mapping

Carry forward:

- capture method.
- capture mode.
- page identity.
- source classification.
- captured timestamp.
- evidence fingerprint.
- extraction confidence.
- field confidence.
- user confirmation checkpoint.
- capture id.
- request id.
- handoff payload fingerprint.
- sanitized browser/session label if useful.
- screenshot/text hash if later privacy design allows it.

Minimize/redact:

- raw URL; prefer URL pattern classification.
- raw screenshots.
- raw page text.
- raw DOM.
- account identifiers; use masked id or sanitized account label.
- balances, holdings, credentials, cookies, tokens, and 2FA material.

Confidence handling:

- low extraction or field confidence should map to `needs_review`.
- field confidence should be preserved in metadata for review UI but should not
  override hard blockers.

## 9. Rejection and needs-review mapping

Rejected evidence:

- must not convert to a `BrokerExecutionResult`.
- may produce a rejected mapping preview for diagnostics only.
- must preserve rejection reasons.

Needs-review evidence:

- may produce review-only preview metadata.
- must not be persistence-safe.
- must preserve warnings/reasons and clear `safeToPersist=false`-style
  metadata if represented later.

Valid evidence:

- may produce a `BrokerExecutionResult` candidate only after a converter exists.
- still does not imply execution-record creation, Supabase persistence, audit
  append, or trade mutation.

Mapping boundary:

- mapping should prefer no output over partial/ambiguous execution output.
- warning-only output must not hide blockers.

## 10. Relationship to execution records

- A future `BrokerExecutionResult` candidate is not an execution record.
- The execution record candidate builder still runs separately.
- The execution record creation validator still runs separately.
- The persistence validator still runs separately.
- Supabase migration/application remains separate.
- Server-only write boundaries remain separate.
- This mapping design enables no write path.

## 11. Relationship to trade mutation

- `BrokerExecutionResult` conversion does not mutate trade state.
- Opening/closing live/history trade state remains a separate future boundary.
- Semi-automatic manual confirmation remains required for this broker path.
- Automatic mode remains out of scope.
- Trade mutation needs its own validator, idempotency strategy, audit policy,
  and explicit approval.

## 12. Candidate next actions

A. Create BrokerExecutionResult Confirmation Validator Design

- safest next design step after evidence mapping.
- can define how evidence validation, mapping policy, source classification,
  result statuses, and non-persistence safety metadata combine.
- remains design-only if scoped carefully.

B. Create Evidence-to-BrokerExecutionResult Mapper Contract Types

- useful after validator design if the mapper contract is ready to become
  type-checkable.
- should remain type-only before implementation.

C. Reassess Avanza Broker Confirmation Capture Readiness

- useful later, but closer to browser/Avanza behavior.
- should wait until confirmation validator design exists.

D. Create Avanza Confirmation Capture Manual QA Checklist

- useful for manual review and QA.
- less foundational than result confirmation validator design.

## 13. Recommended next action

**Action 460 - Create BrokerExecutionResult Confirmation Validator Design**

Rationale:

- Evidence validation and evidence-to-result mapping design now define the
  upstream inputs and field mapping.
- The next safe step is a design for the future confirmation validator that
  decides whether mapped evidence can become a confirmed BrokerExecutionResult
  candidate.
- This stays documentation-only and avoids capture, conversion implementation,
  persistence, Supabase, audit append, trade mutation, browser automation, and
  Avanza behavior.

## 14. Risk assessment

Valid evidence mistaken for persistence approval:

- high. Valid evidence and future mapped result candidates are not execution
  records and do not authorize writes.

Conversion false-positive:

- high. Mapping must not turn merely field-sane evidence into a confirmed
  execution without confirmation validator checks.

Partial-fill ambiguity:

- high. Partial fills remain unresolved and must not map to full execution
  results.

Provenance loss:

- high. Dropping capture method, evidence fingerprint, source classification,
  or handoff fingerprint weakens auditability and idempotency.

Idempotency mismatch:

- high. Broker references, timestamps, handoff fingerprints, and evidence
  hashes must align, or duplicate detection can fail.

Avanza UI drift:

- medium/high. Changed wording or page flows can mislabel evidence source or
  status.

Field confidence overtrust:

- high. Confidence metadata is not proof. Low confidence should block or
  require review.

Trade mutation coupling risk:

- high. Mapping must not open, close, settle, or otherwise mutate live/history
  trade state.

## 15. Verification

Verification for this documentation-only design:

- `git diff --check`

No runtime code changes were made. No mapping implementation,
`BrokerExecutionResult` creation, capture/OCR/browser extraction,
persistence/write behavior, Supabase behavior, audit append, trade mutation,
browser behavior, or Avanza behavior was added.

## Action 460 Follow-Up

Action 460 created
`docs/broker-execution-result-confirmation-validator-design.md`.

Result:

- Defined the future BrokerExecutionResult confirmation validator boundary.
- Documented validator inputs, outputs, validation layers, rejection reasons,
  needs-review behavior, partial-fill handling, idempotency/fingerprint
  requirements, and relationships to mapper, execution records, and trade
  mutation.
- Confirmed the design is documentation-only and adds no validator, mapper,
  BrokerExecutionResult creation, capture, persistence, Supabase, audit,
  trade mutation, browser, or Avanza behavior.

Next recommended action:

**Action 461 - Create BrokerExecutionResult Confirmation Validator Contract Types**

## Action 461 Follow-Up

Action 461 created
`lib/broker-execution-result-confirmation-validator-contract.ts`.

Mapping-design impact:

- The future mapper now has an upstream confirmation validator contract to
  depend on before any evidence-to-BrokerExecutionResult conversion occurs.
- The contract models evidence snapshot references and fingerprint input
  summaries that a later mapper can consume without owning validation.
- The contract keeps mapping implementation, BrokerExecutionResult creation,
  persistence, audit append, trade mutation, browser behavior, and Avanza
  behavior out of scope.

Next recommended action:

**Action 462 - Reassess BrokerExecutionResult Confirmation Validator Contract Types**

## Action 462 Follow-Up

Action 462 created
`docs/broker-execution-result-confirmation-validator-contract-reassessment.md`.

Mapping-design impact:

- The upstream confirmation validator contract was verified before any mapper
  contract or mapper implementation.
- `confirmed_candidate` remains mapper eligibility only, not persistence or
  trade mutation approval.
- Mapper implementation remains absent and must wait for successful
  confirmation validation.

Next recommended action:

**Action 463 - Create BrokerExecutionResult Confirmation Validator**

## Action 463 Follow-Up

Action 463 created
`lib/broker-execution-result-confirmation-validator.ts`.

Mapping-design impact:

- The upstream pure confirmation validator now exists.
- Mapping still does not exist and must remain downstream of a
  `confirmed_candidate` result.
- The validator returns `safeToConvert=true` only for confirmed candidates,
  while keeping persistence and trade mutation false.
- No BrokerExecutionResult creation or mapping behavior was added.

Next recommended action:

**Action 464 - Reassess BrokerExecutionResult Confirmation Validator**

## Action 464 Follow-Up

Action 464 created
`docs/broker-execution-result-confirmation-validator-reassessment.md`.

Mapping-design impact:

- The confirmation validator was reassessed and verified as the upstream gate
  before mapping.
- No mapper contract types or mapper implementation exist yet.
- The next safe step is to define mapper contract types before any
  BrokerExecutionResult creation path.

Next recommended action:

**Action 465 - Create Evidence-to-BrokerExecutionResult Mapper Contract Types**

## Action 465 Follow-Up

Action 465 created
`lib/evidence-to-broker-execution-result-mapper-contract.ts`.

Mapping-design impact:

- The mapping design now has a type/constant-only contract module.
- The contract models mapper input/output shape, field snapshots, provenance,
  fingerprint contribution, partial-fill mapping, and a draft candidate shape
  without implementing conversion.
- No mapper function, BrokerExecutionResult creation, persistence, audit append,
  trade mutation, UI wiring, capture/browser extraction, browser automation, or
  Avanza behavior was added.

Next recommended action:

**Action 466 - Reassess Evidence-to-BrokerExecutionResult Mapper Contract Types**

## Action 466 Follow-Up

Action 466 created
`docs/evidence-to-broker-execution-result-mapper-contract-reassessment.md`.

Mapping-design impact:

- The mapper contract was verified against this design before runtime mapper
  work.
- The reassessment confirmed the current contract remains type-only and uses a
  draft candidate shape rather than creating a runtime BrokerExecutionResult.
- The next safe step is to reassess the BrokerExecutionResult candidate
  type/shape before mapper implementation.

Next recommended action:

**Action 467 - Create BrokerExecutionResult Candidate Type/Shape Reassessment**

## Action 467 Follow-Up

Action 467 created
`docs/broker-execution-result-candidate-shape-reassessment.md`.

Mapping-design impact:

- The mapper target shape has been reassessed before runtime mapper work.
- Existing runtime, preview, dev mock, and execution-record shapes are not
  suitable as the mapper target.
- A dedicated BrokerExecutionResult candidate contract is recommended before
  mapper implementation.

Next recommended action:

**Action 468 - Create BrokerExecutionResult Candidate Contract Types**

## Action 468 Follow-Up

Action 468 created
`lib/broker-execution-result-candidate-contract.ts`.

Mapping-design impact:

- The future evidence-to-result mapper target now has explicit type-only
  candidate contracts.
- The candidate contract models Avanza evidence-derived broker references,
  instrument identity, execution/price fields, provenance, field mappings,
  fingerprint input, partial-fill data, and safety policy.
- No mapper implementation or runtime BrokerExecutionResult creation was
  added.

Next recommended action:

**Action 469 - Reassess BrokerExecutionResult Candidate Contract Types**

## Action 469 Follow-Up

Action 469 created
`docs/broker-execution-result-candidate-contract-reassessment.md`.

Mapping-design impact:

- The candidate contract was verified against this mapping design before
  mapper implementation.
- The contract can represent confirmed, needs-review, partial-fill-review, and
  unsupported outcomes without implying persistence or trade mutation.
- The next safe implementation step is a pure mapper only.

Next recommended action:

**Action 470 - Create Evidence-to-BrokerExecutionResult Mapper**

## Action 470 Follow-Up

Action 470 created
`lib/evidence-to-broker-execution-result-mapper.ts`.

Mapping-design impact:

- The mapping design now has a pure mapper implementation.
- The mapper only produces a candidate for valid evidence plus
  `confirmed_candidate` confirmation output.
- Unsafe inputs are rejected or routed to review, and partial-fill ambiguity
  remains review-only.
- Persistence, audit append, trade mutation, UI wiring, capture/browser, and
  Avanza behavior remain out of scope.

Next recommended action:

**Action 471 - Reassess Evidence-to-BrokerExecutionResult Mapper**

## Action 471 Follow-Up

Action 471 created
`docs/evidence-to-broker-execution-result-mapper-reassessment.md`.

Mapping-design impact:

- The pure mapper was reassessed against this design.
- Valid evidence plus confirmed candidate output maps to candidate-only
  results.
- Rejected, needs-review, incomplete, missing-handoff, and partial-fill paths
  remain blocked or review-routed.

Next recommended action:

**Action 472 - Create Mapped BrokerExecutionResult Candidate Preview Design**

## Action 472 Follow-Up

Action 472 created
`docs/mapped-broker-execution-result-candidate-preview-design.md`.

Mapping-design impact:

- The future mapped candidate preview has a documented placement, content
  model, interaction model, and safety copy.
- The design keeps mapped candidate display separate from runtime
  BrokerExecutionResult creation, execution-record creation, persistence, and
  trade mutation.
- The recommended next step is a dev-gated read-only preview.

Next recommended action:

**Action 473 - Create Mapped BrokerExecutionResult Candidate Dev Preview**

## Action 473 Follow-Up

Action 473 implemented the mapped candidate preview as a dev-gated fixture
preview.

Mapping-design impact:

- The preview demonstrates mapped candidate output without live broker data.
- It uses pure validation and mapper functions only.
- It keeps capture/OCR/browser extraction, Avanza behavior, persistence, audit
  append, and trade mutation out of scope.

Next recommended action:

**Action 474 - Reassess Mapped BrokerExecutionResult Candidate Dev Preview**

## Action 474 Follow-Up

Action 474 created
`docs/mapped-broker-execution-result-candidate-dev-preview-reassessment.md`.

Mapping-design result:

- Verified the mapped candidate preview remains a controlled fixture preview,
  not a live Avanza evidence integration.
- Confirmed capture/OCR/browser extraction, Avanza behavior, persistence,
  audit append, execution-record creation, and trade mutation remain out of
  scope.
- The next blocker is trustworthy Avanza confirmation capture readiness, not
  mapper display plumbing.

Next recommended action:

**Action 475 - Reassess Avanza Broker Confirmation Capture Readiness**

## Action 475 Follow-Up

Action 475 created
`docs/avanza-broker-confirmation-capture-readiness-reassessment.md`.

Mapping-design impact:

- Mapping remains downstream of evidence validation and confirmation
  validation.
- Real capture/readback is not implementation-ready because Avanza final
  confirmation/history field availability remains unverified.
- The next step should manually inventory Avanza readback fields before any
  capture-to-mapper integration plan.

Next recommended action:

**Action 476 - Create Avanza Confirmation Capture Manual QA Checklist**

## Action 476 Follow-Up

Action 476 created
`docs/avanza-confirmation-capture-manual-qa-checklist.md`.

Mapping-design impact:

- The checklist asks manual QA to identify which Avanza fields can reliably map
  to broker references, instrument identity, side, quantity, price, currency,
  timestamps, status, fees, and partial fills.
- Mapper implementation remains unchanged and should not consume live evidence
  until manual findings are reassessed.

Next recommended action:

**Action 477 - Reassess Manual QA Findings**

## Action 477 Follow-Up

Action 477 created
`docs/avanza-confirmation-capture-manual-qa-findings-reassessment.md`.

Mapping-design impact:

- No actual final confirmation/account-history findings exist to change mapper
  assumptions.
- Existing pre-submit/order-flow research remains useful for dry-run/readback
  planning but not broker-result mapping.
- Mapper integration with live evidence remains blocked.

Next recommended action:

**Action 478 - Create Manual QA Findings Template**

## Action 478 Follow-Up

Action 478 created
`docs/avanza-confirmation-capture-manual-qa-findings-template.md`.

Mapping-design impact:

- The template captures the field availability needed before live Avanza
  evidence can map to BrokerExecutionResult candidates.
- Mapper assumptions remain unchanged until real findings are recorded and
  reassessed.

Next recommended action:

**Action 479 - Fill Manual QA Findings Template**

## Action 485 Follow-Up - Two-Stage Mapping Boundary

Action 485 created
`docs/two-stage-broker-evidence-flow-design.md`.

Mapping-design impact:

- The mapper should preserve evidence stage rather than collapsing immediate
  readback and final settlement note into one confirmation concept.
- Immediate readback can map only to a provisional candidate shape unless a
  separate approved boundary allows more.
- Final settlement-note evidence is the preferred source for official
  BrokerExecutionResultCandidate final details after validation and matching.
- Partial matches, note mismatches, duplicate note candidates, and missing final
  notes must block finalization or require review.
- No mapper behavior, persistence, execution-record creation, or trade mutation
  changes are enabled by this design update.

Next recommended action:

**Action 486 - Create Two-Stage Broker Evidence Contract Types**
