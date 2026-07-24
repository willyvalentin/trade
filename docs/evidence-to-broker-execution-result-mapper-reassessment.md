# Evidence-to-BrokerExecutionResult Mapper Reassessment

## 1. Purpose

Reassess the Evidence-to-BrokerExecutionResult mapper after implementation.

Action 470 created
`lib/evidence-to-broker-execution-result-mapper.ts`, a pure deterministic
mapper that returns `EvidenceToBrokerExecutionResultMapperResult` values and
only attaches a `BrokerExecutionResultCandidate` when validated Avanza
confirmation evidence, a `confirmed_candidate` confirmation result, and
`safeToConvert=true` are all present.

This action is documentation-only. It adds no runtime code, no refactor, no
behavior changes, no mapper changes, no runtime BrokerExecutionResult
creation, no execution-record creation, no persistence/write behavior, no
Supabase/localStorage behavior, no audit append, no trade mutation, no UI
wiring, no capture/OCR/browser extraction, no browser automation, and no
Avanza behavior.

## 2. Current mapper inventory

Exported API:

- `mapEvidenceToBrokerExecutionResultCandidate(...)`

Input contract:

- `EvidenceToBrokerExecutionResultMapperInput`
- Requires:
  - mapper contract version.
  - requested timestamp.
  - broker, currently `avanza`.
  - mapper mode.
  - raw Avanza confirmation evidence.
  - Avanza evidence validation result.
  - BrokerExecutionResult confirmation validation result.
  - source classification.
  - optional handoff payload fingerprint and intended context.

Output contract:

- `EvidenceToBrokerExecutionResultMapperResult`
- Includes:
  - mapper status.
  - rejection reasons.
  - warnings.
  - field mapping snapshot.
  - provenance snapshot.
  - fingerprint contribution.
  - partial-fill mapping.
  - optional `mappedCandidate`.
  - no-write/no-mutation safety flags.

Candidate shape:

- `BrokerExecutionResultCandidate`
- Candidate includes broker/source, broker references, instrument, execution,
  price, timestamps, provenance, field mapping, fingerprint input, handoff
  fingerprint, account context, partial-fill state, warnings, review flags,
  mapper provenance snapshot, and safety policy.

Rejection / review behavior:

- Non-confirmed confirmation result:
  - rejected or review-routed, depending on source status.
  - no candidate returned.
- `safeToConvert=false`:
  - rejected.
  - no candidate returned.
- Rejected evidence:
  - rejected.
  - no candidate returned.
- Needs-review evidence:
  - needs-review.
  - no candidate returned.
- Missing handoff fingerprint:
  - rejected.
  - no candidate returned.
- Missing broker reference or required fields:
  - rejected.
  - no candidate returned.
- Ambiguous partial fill:
  - `partial_fill_review`.
  - no candidate returned.

E2E coverage:

- `tests/e2e/execution-sandbox.spec.ts`
- Coverage includes:
  - valid evidence plus confirmed candidate maps to mapped candidate.
  - non-confirmed confirmation result does not map.
  - `safeToConvert=false` does not map.
  - rejected evidence does not map.
  - missing handoff fingerprint rejects.
  - missing required fields reject.
  - ambiguous partial fill returns review.
  - mapped candidate safety policy remains no-write/no-mutation.

## 3. Boundary verification

Pure mapping only:

- The mapper is deterministic and uses only its input.
- It has no network calls, storage calls, browser calls, or ambient app state.

Candidate-only output:

- The mapper returns a `BrokerExecutionResultCandidate` only through
  `mappedCandidate`.
- It does not produce runtime `BrokerExecutionResult` values.

No runtime BrokerExecutionResult creation:

- `brokerExecutionResultCreated` remains `false`.
- No runtime execution result constructors or capture APIs are called.

No execution-record creation:

- No execution-record candidate builder is called.
- No execution-record validator is called.
- No execution-record insert route or persistence path is called.

No persistence/write:

- `safeToPersist` remains `false`.
- `persistenceAttempted` remains `false`.
- No Supabase client, route write, localStorage write, or durable duplicate
  lookup is used.

No audit append:

- `auditAppendAttempted` remains `false`.
- No audit/event store or persistence writer is called.

No trade mutation:

- `safeToMutateTrade` remains `false`.
- `tradeMutationAttempted` remains `false`.
- No live/history trade state mutation or close/sell flow is touched.

No UI wiring:

- The mapper is not wired into app UI.
- No mapped candidate preview UI exists yet.

No capture/browser/Avanza behavior:

- No capture/OCR/browser extraction is implemented.
- No browser automation or Avanza behavior is implemented.
- Evidence acquisition remains a separate future boundary.

## 4. Mapping policy verification

Valid mapping requires:

- Avanza evidence validation status `valid`.
- BrokerExecutionResult confirmation status `confirmed_candidate`.
- Confirmation validation `safeToConvert=true`.
- Broker is `avanza`.
- Source classification is `production_safe_candidate`.
- Handoff payload fingerprint is present.
- Broker reference is present.
- Instrument identifier is present.
- Side is present.
- Quantity is positive and finite.
- Price is positive and finite.
- Currency is present.
- Confirmation and captured timestamps are valid.
- Evidence fingerprint is present.
- Partial-fill state is not ambiguous/review-only.

Non-confirmed confirmation result:

- does not map.
- returns `confirmation_not_confirmed_candidate`.

Rejected or needs-review evidence:

- does not map.
- returns `evidence_rejected` or `evidence_needs_review`.

Missing handoff fingerprint:

- rejects with `missing_handoff_fingerprint`.

Missing required fields:

- rejects with `missing_broker_reference` or `missing_required_field`.

Ambiguous partial fill:

- returns `partial_fill_review`.
- sets partial-fill mapping `requiresReview=true`.

Mapped candidate safety:

- A mapped candidate remains non-persistent and non-mutating.
- `safeToPersist=false`.
- `safeToMutateTrade=false`.
- The safety policy states it is not an execution record, not persistence
  approval, and not trade mutation approval.

## 5. Candidate content verification

Mapped candidate carries:

- broker/source classification:
  - broker `avanza`.
  - source classification.
  - evidence source type.
  - source page flow identifier.
  - evidence fingerprint, capture id, and request id.
- confirmation status:
  - confirmation validator status.
  - evidence validation status.
- broker order/reference fields:
  - order id / order number.
  - confirmation id / fill id / execution id / strong equivalent.
  - broker reference.
- instrument fields:
  - instrument name.
  - ticker.
  - ISIN.
  - instrument id.
  - market, venue, and instrument type.
- side and quantity.
- execution/fill price:
  - execution price.
  - price field type.
  - currency.
  - optional fee, commission, total amount, and settlement cash impact.
- timestamps:
  - confirmation timestamp.
  - captured timestamp.
- provenance snapshot:
  - capture method.
  - capture mode.
  - page identity.
  - source classification.
  - evidence fingerprint.
  - capture/request ids.
  - handoff payload fingerprint.
- field mapping snapshot:
  - broker order id.
  - status.
  - captured timestamp.
  - filled timestamp.
  - quantity.
  - average fill price.
  - raw status.
  - notes/warnings.
- fingerprint contribution/input summary:
  - confirmation fingerprint input summary.
  - mapper contribution fields.
  - evidence fingerprint.
  - broker reference fingerprint input.
  - handoff payload fingerprint.
- handoff payload fingerprint.
- warnings/review flags:
  - mapper warnings.
  - candidate warnings.
  - review flags derived from evidence warnings and partial-fill state.
- partial-fill info:
  - status.
  - filled quantity.
  - remaining quantity.
  - average fill price.
  - fill timestamp.
  - fill ids.
  - review requirement.
- safety policy:
  - `safeToPersist: false`.
  - `safeToMutateTrade: false`.
  - no execution-record creation.
  - no persistence attempt.
  - no trade mutation attempt.
  - no audit append.
  - no browser automation.

## 6. Remaining gaps before user-visible preview or persistence

No mapped candidate preview UI:

- The mapper output is not yet user-visible.
- A future preview must be read-only and clearly no-write/no-mutation.

No execution record creation integration:

- Execution-record creation remains separate.
- A future integration reassessment must decide how mapper output feeds
  creation input, if at all.

No persistence integration:

- No Supabase write path consumes mapper output.
- Persistence validator, schema application, generated types, duplicate
  lookup, and server-only write route remain separate.

No Supabase migration application:

- The execution record migration draft remains unapplied.

No real Avanza capture/readback implementation:

- The mapper assumes validated evidence already exists.
- Capture/readback, browser extraction, and Avanza readiness remain separate.

No trade mutation integration:

- Trade mutation remains blocked and separate from broker-result mapping.

No automatic mode:

- Automatic mode remains out of scope for confirmation and mapping.

## 7. Candidate next actions

A. Create Mapped BrokerExecutionResult Candidate Preview Design

- Safest next step.
- Lets the project define read-only UI placement, labels, inputs, outputs,
  safety copy, and tests before wiring mapper output into any UI.

B. Create Mapped BrokerExecutionResult Candidate Dev Preview

- Useful, but should follow a design pass to avoid overtrust or accidental
  production-looking UI.

C. Reassess Avanza Broker Confirmation Capture Readiness

- Important for real evidence acquisition, but higher risk because it moves
  toward capture/readback and browser/Avanza readiness.

D. Create Execution Record Creation Integration Reassessment

- Valuable later, but persistence/trade boundaries are still intentionally
  downstream and should not be pulled forward before preview boundaries are
  clear.

## 8. Recommended next action

Recommended next action:

**Action 472 - Create Mapped BrokerExecutionResult Candidate Preview Design**

Rationale:

- The mapper is pure and tested, but not user-visible.
- A design-only preview step keeps the next move safe by deciding where and
  how to display mapped candidates without adding writes, execution-record
  creation, audit append, trade mutation, capture/browser, or Avanza behavior.

## 9. Risk assessment

Mapped candidate mistaken for persisted execution:

- high. The mapped candidate carries broker-like execution fields, so future
  UI must label it as candidate-only and no-write.

Mapped candidate mistaken for execution record:

- high. Execution-record creation remains separate and must not be skipped.

Mapped candidate mistaken for trade mutation approval:

- high. `safeToMutateTrade=false` must stay visible in future preview and
  integration work.

`safeToConvert` overtrusted:

- medium/high. `safeToConvert=true` permits candidate mapping only; it does not
  approve persistence or mutation.

Preview UI overtrust risk:

- high. A mapped candidate preview could appear authoritative unless copy and
  tests emphasize no persistence/no mutation.

Partial-fill ambiguity:

- high. Partial fills remain review-only until accounting and duplicate policy
  exists.

Provenance/fingerprint loss:

- medium/high. Future consumers must preserve mapper provenance and
  fingerprint contribution rather than reducing candidates to thin broker
  result fields.

Future integration coupling risk:

- high. Execution-record creation, persistence, audit append, and trade
  mutation should stay separate until each boundary is reassessed.

## 10. Verification

Verification for this documentation-only reassessment:

- `git diff --check`

No runtime code changes were made. No mapper changes, runtime
BrokerExecutionResult creation, execution-record creation, persistence/write
behavior, Supabase/localStorage behavior, audit append, trade mutation, UI
wiring, capture/OCR/browser extraction, browser automation, or Avanza behavior
was added.

## Action 472 Follow-Up

Action 472 created
`docs/mapped-broker-execution-result-candidate-preview-design.md`.

Design result:

- Defined a future dev-gated, read-only mapped candidate preview.
- Recommended placement in the execution handoff modal late-phase preview
  area, after broker-result preview diagnostics and before execution-record
  creation preview.
- Documented preview content, safety labels, dependencies, interaction model,
  error/review display, and separation from execution-record creation and
  trade mutation.

Next recommended action:

**Action 473 - Create Mapped BrokerExecutionResult Candidate Dev Preview**

## Action 473 Follow-Up

Action 473 created a dev-gated mapped candidate preview using controlled
fixture data only.

Mapper impact:

- The UI trigger calls only pure validators and
  `mapEvidenceToBrokerExecutionResultCandidate(...)`.
- No live broker data, capture/browser behavior, persistence, audit append,
  trade mutation, or execution-record creation was added.
- Mapper output remains candidate-only and no-write/no-mutation.

Next recommended action:

**Action 474 - Reassess Mapped BrokerExecutionResult Candidate Dev Preview**

## Action 474 Follow-Up

Action 474 created
`docs/mapped-broker-execution-result-candidate-dev-preview-reassessment.md`.

Mapper boundary result:

- The dev preview still calls `mapEvidenceToBrokerExecutionResultCandidate(...)`
  only through controlled fixture data.
- The fixture path still calls pure validators before mapping.
- No mapper behavior, live broker data path, runtime BrokerExecutionResult
  creation, execution-record creation, persistence, audit append, trade
  mutation, capture/browser extraction, browser automation, or Avanza behavior
  was added.

Next recommended action:

**Action 475 - Reassess Avanza Broker Confirmation Capture Readiness**

## Action 475 Follow-Up

Action 475 created
`docs/avanza-broker-confirmation-capture-readiness-reassessment.md`.

Mapper impact:

- The mapper remains downstream of validated evidence and confirmed-candidate
  validation.
- Capture/readback is not implementation-ready because real Avanza final
  confirmation and order-history fields remain unknown.
- Manual QA should happen before any live evidence feeds the mapper.

Next recommended action:

**Action 476 - Create Avanza Confirmation Capture Manual QA Checklist**

## Action 476 Follow-Up

Action 476 created
`docs/avanza-confirmation-capture-manual-qa-checklist.md`.

Mapper impact:

- The checklist gathers the real field availability needed before live Avanza
  evidence can safely feed the mapper.
- The mapper remains pure and disconnected from capture/readback.
- Manual QA findings should be reassessed before any capture-to-mapper
  integration design.

Next recommended action:

**Action 477 - Reassess Manual QA Findings**

## Action 477 Follow-Up

Action 477 created
`docs/avanza-confirmation-capture-manual-qa-findings-reassessment.md`.

Mapper impact:

- Manual findings are not sufficient for live evidence mapping.
- Existing Avanza observations are pre-submit/order-flow observations only.
- The mapper remains pure and fixture/dev-preview-only until real final/history
  findings exist.

Next recommended action:

**Action 478 - Create Manual QA Findings Template**

## Action 478 Follow-Up

Action 478 created
`docs/avanza-confirmation-capture-manual-qa-findings-template.md`.

Mapper impact:

- The template gives future QA a place to record the real final/history fields
  needed before mapper integration.
- The mapper remains pure and disconnected from live capture.

Next recommended action:

**Action 479 - Fill Manual QA Findings Template**

## Action 485 Follow-Up - Two-Stage Mapper Reassessment

Action 485 created
`docs/two-stage-broker-evidence-flow-design.md`.

Mapper reassessment update:

- The pure mapper should eventually receive evidence-stage metadata.
- Immediate readback should remain provisional and final-note-pending.
- Final settlement-note evidence should provide official fees, totals,
  settlement dates, ISIN, and note/reference metadata when available.
- The mapper must not imply persistence, audit append, execution-record
  creation, or trade mutation from either stage.
- Finalization requires a separate matching/finalization boundary.

Next recommended action:

**Action 486 - Create Two-Stage Broker Evidence Contract Types**

## Action 486 Follow-Up - Two-Stage Contract Types

Action 486 created `lib/two-stage-broker-evidence-contract.ts`.

Mapper reassessment impact:

- The mapper can later consume stage-aware evidence types without treating
  immediate readback as final official evidence.
- Immediate readback remains provisional and final-note-pending.
- Final settlement-note evidence can carry official settlement fields and
  matching candidate metadata.
- No mapper implementation, matching logic, conversion behavior, persistence,
  execution-record creation, audit append, or trade mutation was added.

Next recommended action:

**Action 487 - Reassess Two-Stage Broker Evidence Contract Types**

## Action 487 Follow-Up - Two-Stage Contract Reassessment

Action 487 created
`docs/two-stage-broker-evidence-contract-reassessment.md`.

Mapper reassessment impact:

- The reassessment confirms the mapper should not treat immediate readback as
  final official evidence.
- The mapper should wait for a final settlement note matching design before any
  stage-aware mapping behavior is considered.
- No mapper implementation, matching behavior, BrokerExecutionResult creation,
  execution-record creation, persistence, audit append, or trade mutation was
  added.

Next recommended action:

**Action 488 - Create Final Settlement Note Matching Design**

## Action 488 Follow-Up - Final Settlement Note Matching Design

Action 488 created `docs/final-settlement-note-matching-design.md`.

Mapper reassessment impact:

- Future mapper behavior should not consume final note evidence as final unless
  a separate matching boundary has accepted the note/provisional-trade
  relationship.
- Matching design runs before finalization and before any future execution
  record candidate or persistence boundary.
- No mapper implementation, matching implementation, BrokerExecutionResult
  creation, execution-record creation, persistence, audit append, or trade
  mutation was added.

Next recommended action:

**Action 489 - Create Final Settlement Note Matching Contract Types**

## Action 489 Follow-Up - Matching Contract Types Created

Action 489 created `lib/final-settlement-note-matching-contract.ts`.

Mapper reassessment impact:

- Future mapper work can refer to a typed final settlement note matching result
  without implementing matching inside the mapper.
- A match result remains separate from `BrokerExecutionResultCandidate`
  creation.
- No mapper implementation, matching implementation, BrokerExecutionResult
  creation, execution-record creation, persistence, audit append, or trade
  mutation was added.

Next recommended action:

**Action 490 - Reassess Final Settlement Note Matching Contract Types**

## Action 490 Follow-Up - Matching Contract Reassessment

Action 490 created
`docs/final-settlement-note-matching-contract-reassessment.md`.

Mapper reassessment impact:

- Matching result contracts remain separate from mapper behavior.
- A future mapper should consume only validated/reviewed match outputs from a
  separate matching validator boundary.
- No mapper, matching, persistence, execution-record, audit, or trade mutation
  behavior was added.

Next recommended action:

**Action 491 - Create Final Settlement Note Matching Validator**

## Action 491 Follow-Up - Matching Validator Created

Action 491 created
`lib/final-settlement-note-matching-validator.ts`.

Mapper reassessment impact:

- The mapper remains separate from final settlement-note matching.
- Future mapper work can consume a validator result only after a separate
  matching boundary has produced it.
- The validator does not create `BrokerExecutionResultCandidate`, execution
  records, persistence payloads, audit events, or trade mutations.
- `safeToPersist=false`, `safeToFinalize=false`, and
  `safeToMutateTrade=false` remain explicit on match results.

Next recommended action:

**Action 492 - Reassess Final Settlement Note Matching Validator**

## Action 492 Follow-Up - Matching Validator Reassessed

Action 492 created
`docs/final-settlement-note-matching-validator-reassessment.md`.

Mapper reassessment impact:

- The mapper remains downstream and separate from matching validation.
- The matching validator returns metadata only; it does not map to
  `BrokerExecutionResultCandidate`, create execution records, persist anything,
  append audit, or mutate trades.
- Future mapper work should consume only reviewed/accepted matching outputs
  from a separate boundary.

Next recommended action:

**Action 493 - Create Final Settlement Note Match Dev Preview Design**

## Action 493 Follow-Up - Match Dev Preview Design Created

Action 493 created
`docs/final-settlement-note-match-dev-preview-design.md`.

Mapper reassessment impact:

- The final note match preview design is visually near but separate from the
  mapped BrokerExecutionResult candidate preview.
- The design explicitly prevents a match preview from implying mapper output,
  runtime BrokerExecutionResult creation, execution-record creation,
  persistence, audit append, or trade mutation.
- Future mapper work remains downstream of separately reviewed match results.

Next recommended action:

**Action 494 - Create Final Settlement Note Match Dev Preview**

## Action 494 Follow-Up - Match Dev Preview Created

Action 494 created the final settlement note match preview near the mapped
BrokerExecutionResult candidate preview.

Mapper reassessment impact:

- The match preview remains visually separate from mapped candidate output.
- It does not create or imply a `BrokerExecutionResultCandidate`.
- It does not run the mapper, create execution records, persist rows, append
  audit, mutate trades, or interact with Avanza.
- Future mapper work remains downstream of separately reviewed match results.

Next recommended action:

**Action 495 - Reassess Final Settlement Note Match Dev Preview**

## Action 495 Follow-Up - Match Dev Preview Reassessed

Action 495 created
`docs/final-settlement-note-match-dev-preview-reassessment.md`.

Mapper reassessment impact:

- The final note match preview remains visually near but separate from the
  mapped BrokerExecutionResult candidate preview.
- It does not run the mapper or create mapped candidates.
- Mapper integration remains downstream of separately reviewed match/finalization
  boundaries.

Next recommended action:

**Action 496 - Create Finalization Candidate Contract Types**
