# Mapped BrokerExecutionResult Candidate Preview Design

## 1. Purpose

Define how a mapped BrokerExecutionResult candidate could later be previewed
safely.

Action 471 verified that `mapEvidenceToBrokerExecutionResultCandidate(...)`
is pure, deterministic, candidate-only, no-write, no-mutation, and
disconnected from runtime BrokerExecutionResult creation, execution-record
creation, persistence, Supabase/localStorage, audit append, trade mutation, UI
wiring, capture/browser automation, and Avanza behavior. This design defines
the future read-only preview boundary before any UI implementation or mapper
wiring.

This action is documentation/design only. It adds no runtime code, no
refactor, no behavior changes, no UI implementation, no mapper wiring, no
BrokerExecutionResult creation beyond the existing pure candidate mapper, no
execution-record creation, no persistence/write behavior, no
Supabase/localStorage behavior, no audit append, no trade mutation, no
capture/OCR/browser extraction, no browser automation, and no Avanza behavior.

## 2. Scope

Included:

- candidate preview display.
- safety labels.
- provenance, fingerprint, and field mapping display.
- warnings and review flags.
- partial-fill display.
- dev-gated first implementation.
- read-only inspection of mapper result status and candidate metadata.

Excluded:

- actual UI implementation.
- mapper wiring into the handoff modal.
- automatic mapper execution against live broker data.
- runtime BrokerExecutionResult creation.
- execution-record creation.
- persistence.
- Supabase/localStorage writes.
- audit append.
- trade mutation.
- Avanza capture/browser automation.
- automatic mode.

## 3. Placement options

A. Execution Handoff Modal late-phase preview section

- closest to existing broker/execution-record previews.
- already dev-gated through `executionDevToolsEnabled`.
- already contains `BrokerExecutionResultPreview`,
  `ExecutionRecordCreationPreview`, and `ExecutionRecordInsertDryRunPreview`.
- provides context for comparing broker-result preview, mapped candidate
  output, execution-record creation preview, and dry-run insert preview.
- risk: dense modal UI may cause overtrust if labels are weak.

B. Separate diagnostics/dev panel

- clearly development-focused.
- safer for non-production visibility.
- less contextual because it is separated from handoff intent, broker preview,
  and existing late-phase preview state.

C. Execution QA/debug drawer

- useful if a larger diagnostics drawer is later introduced.
- not currently the established pattern for this flow.
- would require more UI structure before implementation.

Recommended first placement:

- existing execution handoff modal late-phase preview area.
- render as a separate dev-gated, collapsible/read-only section after
  `BrokerExecutionResultPreview` and before `ExecutionRecordCreationPreview`.
- title: `Mapped BrokerExecutionResult candidate preview`.

Rationale:

- The mapped candidate sits between broker-result preview/confirmation
  diagnostics and execution-record creation.
- Placing it before execution-record creation preview makes the upstream vs
  downstream boundary explicit.
- Keeping it dev-gated and collapsible reduces production exposure and modal
  noise.

## 4. Preview content

Candidate status:

- mapper status.
- candidate status when present.
- rejection reasons.
- needs-review or partial-fill-review state.

Broker/source classification:

- broker.
- source classification.
- evidence source type.
- source page flow identifier.
- evidence fingerprint.
- capture id.
- request id.

Instrument identity:

- instrument name.
- ticker.
- ISIN.
- broker instrument id.
- market.
- venue.
- instrument type.

Execution terms:

- side.
- quantity.
- execution/fill price.
- price field type.
- currency.
- order type.
- broker status/raw status.

Timestamps:

- confirmation timestamp.
- captured timestamp.
- provenance captured timestamp if different.

Broker references:

- broker order id.
- order number.
- confirmation id.
- fill id.
- execution id.
- broker reference.
- strong equivalent reference if present.

Provenance summary:

- capture method.
- capture mode.
- page identity.
- source classification.
- evidence fingerprint.
- capture id.
- request id.
- handoff payload fingerprint.
- evidence validation status.
- confirmation validation status.

Field mapping snapshot:

- mapped candidate field.
- evidence path.
- required flag.
- mapped preview value.
- field confidence.
- field-level warning.

Fingerprint contribution summary:

- confirmation fingerprint input summary.
- mapper contribution fields.
- source evidence fingerprint.
- broker reference fingerprint input.
- handoff payload fingerprint.
- candidate/conversion fingerprint draft if later available.

Partial-fill status:

- partial-fill mapping status.
- filled quantity.
- remaining quantity.
- average fill price.
- fill timestamp.
- fill ids.
- review required flag.

Warnings/review flags:

- mapper warnings.
- candidate warnings.
- evidence/confirmation warnings if surfaced.
- review flags.

Safety policy:

- `notExecutionRecord=true`.
- `notPersistenceApproval=true`.
- `notTradeMutationApproval=true`.
- `safeToPersist=false`.
- `safeToMutateTrade=false`.
- `brokerExecutionResultCreated=false`.
- `executionRecordCreated=false`.
- `persistenceAttempted=false`.
- `tradeMutationAttempted=false`.
- `auditAppendAttempted=false`.
- `browserAutomationAttempted=false`.

## 5. Safety labels

Required labels:

- `Preview only`.
- `Candidate only`.
- `Not a runtime BrokerExecutionResult`.
- `Not an execution record`.
- `Not persisted`.
- `Does not mutate trade state`.
- `safeToPersist=false`.
- `safeToMutateTrade=false`.
- `Semi-auto/manual confirmation boundary still applies`.

Suggested panel intro:

`Read-only preview of the mapped broker-result candidate. This does not create a runtime BrokerExecutionResult, persist an execution record, append audit events, mutate trades, or interact with Avanza.`

Suggested success copy:

`Mapped candidate available. No record was persisted and no trade state was changed.`

Suggested rejected copy:

`Mapping rejected. No candidate was created, persisted, or used to mutate trades.`

Suggested review copy:

`Mapping requires review. Partial or uncertain evidence remains non-persistent and non-mutating.`

Forbidden copy/buttons:

- `Persist`.
- `Save`.
- `Create execution record`.
- `Mark trade opened`.
- `Mark trade closed`.
- `Send to broker`.
- `Execute`.
- `Confirm order`.

## 6. State and data dependencies

Future preview needs:

- `EvidenceToBrokerExecutionResultMapperResult`.
- optional `BrokerExecutionResultCandidate`.
- mapper rejection reasons, warnings, field mapping, provenance, fingerprint,
  and partial-fill mapping.

Initial data source:

- use a controlled/dev fixture or explicit dry-run-style trigger first.
- do not run the mapper automatically against live broker data.
- do not treat existing preview-only broker result stubs as production-safe
  mapped candidates.

Allowed first implementation data path:

- dev-gated fixture-backed Avanza evidence.
- validated evidence result.
- confirmed-candidate confirmation validator result.
- explicit user/developer action to run preview.

Disallowed dependencies:

- no Supabase/localStorage writes.
- no audit append.
- no execution-record creation.
- no dry-run insert route call from this preview.
- no trade mutation.
- no browser/Avanza capture.
- no automatic mode.

## 7. Interaction model

Panel behavior:

- read-only.
- dev-gated.
- collapsible.
- default collapsed if modal density becomes too high.

Trigger behavior:

- first implementation should use a manual button.
- suggested label: `Run mapped candidate preview`.
- button must not say save, persist, create, execute, or send.
- disabled when:
  - execution dev tools are disabled.
  - no safe fixture/dry-run-style input is available.
  - source is preview-only/dev mock without an explicit fixture label.
  - a preview calculation is in progress.

Auto-run:

- not recommended for the first implementation.
- manual interaction makes the diagnostic nature clearer and avoids silent
  mapper execution against changing context.

Loading state:

- show `Running mapped candidate preview...`.
- keep no-write/no-mutation labels visible.

Error state:

- show typed rejection/error metadata where available.
- copy: `Mapped candidate preview failed safely. No BrokerExecutionResult, execution record, audit event, or trade mutation occurred.`

No side effects:

- retry may recompute or rerun the pure mapper.
- retry must not persist, append audit, mutate trades, or call broker/browser
  behavior.

## 8. Error/review display

Rejected mapping display:

- status.
- rejection reasons.
- missing required fields.
- source classification blockers.
- no candidate created.
- safety labels.

Needs-review display:

- status.
- review reasons.
- evidence/confirmation warnings.
- field confidence warnings.
- manual review copy.
- safety labels.

Partial-fill-review display:

- partial-fill mapping status.
- filled quantity.
- remaining quantity.
- average fill price.
- fill timestamp.
- fill ids.
- review required flag.
- note that partial-fill accounting is unresolved.

Missing provenance/fingerprint display:

- missing evidence fingerprint.
- missing handoff payload fingerprint.
- missing capture/request ids if optional.
- explain that provenance gaps block safe downstream use.

Field confidence warnings:

- display confidence values near mapped fields.
- do not let confidence warnings hide hard blockers.
- low confidence should use review styling, not success styling.

## 9. Relationship to execution record creation

- The preview is upstream of execution-record candidate builder.
- The preview must not call execution-record creation.
- The preview must not call execution-record persistence validation.
- The preview must not call the dry-run insert route.
- The preview must not imply a record id or persisted execution exists.
- A future handoff from mapped candidate to execution-record creation requires
  a separate action and reassessment.

Future integration questions:

- which mapped candidate fields map into `ExecutionRecordCreationInput`.
- how to preserve provenance/fingerprint.
- how to keep preview-only/dev fixture sources blocked.
- how to keep persistence eligibility and trade mutation separate.

## 10. Relationship to trade mutation

- The preview does not open live trades.
- The preview does not close/sell positions.
- The preview does not update History.
- The preview does not update Statistics.
- The preview does not change recommendation status.
- Exit/entry trade mutation remains a separate future boundary.
- Automatic mode remains out of scope.

Any future trade mutation requires:

- confirmed broker result boundary.
- execution-record creation/persistence boundary.
- trade mutation boundary design.
- explicit user-visible approval model.
- separate tests.

## 11. Candidate next actions

A. Create Mapped BrokerExecutionResult Candidate Dev Preview

- highest direct follow-up.
- should remain dev-gated, read-only, and fixture-backed first.
- should not call Supabase, localStorage, audit append, trade mutation,
  execution-record creation, capture/browser, or Avanza behavior.

B. Reassess Avanza Broker Confirmation Capture Readiness

- important for real evidence acquisition.
- higher risk because it moves toward browser/capture readiness.

C. Create Execution Record Creation Integration Reassessment

- useful after mapped candidate preview exists.
- should not happen before UI and safety copy are proven.

D. Create Mapped Candidate Preview Component Contract

- possible intermediate step if implementation details feel too broad.
- lower payoff than a tightly scoped dev preview if this design remains
  sufficient.

## 12. Recommended next action

Recommended next action:

**Action 473 - Create Mapped BrokerExecutionResult Candidate Dev Preview**

Rationale:

- The mapper is pure and reassessed.
- A dev-gated read-only preview is the next smallest user-visible step.
- The preview can use controlled fixture/dry-run-style data and preserve the
  no-write/no-mutation boundary.

## 13. Risk assessment

Preview mistaken for persisted execution:

- high. The panel must repeat that no record was persisted and no runtime
  BrokerExecutionResult was created.

Preview mistaken for execution record:

- high. The candidate is upstream of execution-record creation and must not
  show record-id semantics.

Preview mistaken for trade mutation approval:

- high. `safeToMutateTrade=false` must be visible.

`safeToConvert` overtrust:

- medium/high. `safeToConvert=true` permits candidate mapping only and does
  not approve persistence or mutation.

Dev fixture overtrust:

- medium/high. Fixture-backed preview must be labeled as dev/sandbox data.

Provenance/fingerprint omission:

- high. Preview must show provenance/fingerprint gaps prominently.

UI overtrust risk:

- high. Success styling should remain restrained and diagnostic, not final or
  transactional.

Future integration coupling risk:

- high. Execution-record creation, persistence, audit append, and trade
  mutation must stay separate until individually reassessed.

## 14. Verification

Verification for this documentation/design action:

- `git diff --check`

No runtime code changes were made. No UI implementation, mapper wiring,
runtime BrokerExecutionResult creation, execution-record creation,
persistence/write behavior, Supabase/localStorage behavior, audit append,
trade mutation, capture/OCR/browser extraction, browser automation, or Avanza
behavior was added.

## Action 473 Follow-Up

Action 473 created:

- `components/execution/MappedBrokerExecutionResultCandidatePreview.tsx`
- `lib/mapped-broker-execution-result-candidate-dev-fixture.ts`

Implementation result:

- Added a dev-gated, read-only mapped candidate preview to the existing
  execution handoff modal late-phase preview path.
- The preview uses an explicit `Run mapped candidate preview` trigger.
- The trigger uses controlled fixture data only.
- The fixture calls only pure validators and the pure mapper:
  - `validateAvanzaConfirmationEvidence(...)`
  - `validateBrokerExecutionResultConfirmation(...)`
  - `mapEvidenceToBrokerExecutionResultCandidate(...)`
- The preview displays mapper status, candidate summary, safety policy,
  provenance/fingerprint metadata, partial-fill state, warnings, review flags,
  and rejection reasons.

Safety result:

- No live broker data is used.
- No runtime BrokerExecutionResult is created.
- No execution record is created.
- No persistence/write behavior was added.
- No Supabase/localStorage write behavior was added.
- No audit append was added.
- No trade mutation was added.
- No capture/OCR/browser extraction, browser automation, or Avanza behavior
  was added.

Next recommended action:

**Action 474 - Reassess Mapped BrokerExecutionResult Candidate Dev Preview**

## Action 474 Follow-Up

Action 474 created
`docs/mapped-broker-execution-result-candidate-dev-preview-reassessment.md`.

Reassessment result:

- Verified the mapped candidate preview remains dev-gated, fixture-only,
  explicit-trigger-only, and read-only.
- Verified the trigger still calls only pure validators and the pure mapper via
  controlled fixture data.
- Verified no live broker data, runtime BrokerExecutionResult creation,
  execution-record creation, persistence/write behavior, Supabase/localStorage
  write behavior, audit append, trade mutation, capture/OCR/browser extraction,
  browser automation, or Avanza behavior was added.
- Verified safety labels and forbidden-action absence remain explicit.

Next recommended action:

**Action 475 - Reassess Avanza Broker Confirmation Capture Readiness**

## Action 475 Follow-Up

Action 475 created
`docs/avanza-broker-confirmation-capture-readiness-reassessment.md`.

Preview-design impact:

- The mapped candidate preview remains downstream of real evidence capture.
- Capture readiness is not implementation-ready because real Avanza
  confirmation/history fields and privacy constraints still need manual QA.
- No preview, mapper, persistence, execution-record, trade mutation, browser,
  or Avanza behavior changed.

Next recommended action:

**Action 476 - Create Avanza Confirmation Capture Manual QA Checklist**
