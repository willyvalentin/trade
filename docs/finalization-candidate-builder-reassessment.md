# Finalization Candidate Builder Reassessment

## 1. Purpose

This document reassesses the Finalization Candidate Builder created in Action
501.

The reassessment verifies that `lib/finalization-candidate-builder.ts`
remains:

- pure and deterministic.
- candidate-only.
- conservative.
- aligned with `lib/finalization-candidate-builder-contract.ts`.
- aligned with `lib/finalization-candidate-contract.ts`.
- disconnected from finalization, persistence, execution-record creation,
  stats/PnL update, trade mutation, UI wiring, capture/browser automation, and
  Avanza behavior.

This is documentation-only. No runtime code, refactor, behavior, builder,
validator, finalization path, persistence/write behavior, Supabase/localStorage
write, audit append, execution-record creation, stats/PnL update, trade
mutation, UI wiring, capture/browser automation, or Avanza behavior was
changed.

## 2. Current Builder Inventory

Module:

- `lib/finalization-candidate-builder.ts`

Exported API:

- `buildFinalizationCandidate(input: FinalizationCandidateBuilderInput)`.

Input contract:

- `FinalizationCandidateBuilderInput`.
- Requires provisional immediate readback evidence.
- Requires final settlement note evidence.
- Requires `FinalSettlementNoteMatchingResult`.
- Requires `BrokerExecutionResultCandidate`.
- Accepts optional provisional/live trade context.
- Accepts optional handoff payload fingerprint.
- Accepts optional masked account context.
- Accepts optional execution-record candidate metadata.
- Accepts optional existing stats summary.
- Accepts optional builder policy snapshot and metadata.

Output contract:

- `FinalizationCandidateBuilderResult`.
- Includes builder status.
- Includes optional candidate status.
- Includes optional `FinalizationCandidate`.
- Includes precondition results.
- Includes warnings and rejection reasons.
- Includes policy snapshot.
- Includes settlement, fee, FX, and preview-only PnL summaries.
- Includes safety policy and explicit false authority flags.

Status behavior:

- `candidate_built` for clean exact/strong matched final notes with required
  source, provenance, compatibility, fee/FX/settlement, and handoff inputs.
- `needs_review` for review-only data gaps such as missing fee/FX or
  settlement-date review.
- `blocked` for critical failures such as missing source identity, missing
  provenance, unacceptable matching result, hard mismatches, or missing handoff
  fingerprint.
- `partial_fill_review` for partial-fill ambiguity.
- `duplicate_review` for duplicate final-note/candidate conflicts.
- `unsupported` for unsupported broker/source classification.

Precondition behavior:

- Evaluates all builder contract preconditions.
- Records each precondition as `passed`, `review_required`, `blocked`, or
  `unsupported`.
- Preserves rejection reason, warning, and details for diagnostics.

Rejection/review behavior:

- Blocks missing final note source identity.
- Blocks missing provenance.
- Blocks unacceptable matching result.
- Blocks side, instrument, quantity, date, or handoff failures.
- Reviews duplicate conflicts.
- Reviews partial-fill ambiguity.
- Reviews missing fee/commission data.
- Reviews missing FX data when FX is required.
- Reviews missing settlement date fields.

Warning behavior:

- Always includes `candidate_not_finalization_approval`.
- Adds `manual_review_required` for review paths.
- Adds `fee_data_missing_review_required` for missing fee data.
- Adds `fx_data_missing_review_required` for missing FX data.
- Adds `settlement_date_missing_review_required` for missing settlement dates.

Safety policy behavior:

- Builder result uses
  `FINALIZATION_CANDIDATE_BUILDER_DEFAULT_SAFETY_POLICY`.
- Candidate output uses
  `FINALIZATION_CANDIDATE_DEFAULT_SAFETY_POLICY` with a builder-specific
  policy reason.
- Result metadata marks output as pure, candidate-only, and not approval for
  finalization, persistence, execution-record creation, stats update, or trade
  mutation.

E2E coverage summary:

- `tests/e2e/execution-sandbox.spec.ts` covers clean candidate build.
- Covers false result and candidate safety flags.
- Covers missing final note source blocking.
- Covers missing provenance blocking.
- Covers unacceptable matching result blocking.
- Covers duplicate review.
- Covers partial-fill review.
- Covers missing fee/FX review warnings.
- Covers unsupported source classification.
- Covers no finalization, persistence, execution-record creation, stats/PnL
  update, or trade mutation authority.

## 3. Boundary Verification

Pure builder only:

- Verified. The module exports a pure function that transforms provided inputs
  into typed result metadata.
- It does not read external state.
- It does not call network, database, browser, storage, audit, UI, or broker
  APIs.
- It uses `node:crypto` only to derive a deterministic candidate id from
  stable contract/fingerprint inputs.

Candidate-only output:

- Verified. The function returns `FinalizationCandidateBuilderResult` and may
  include `FinalizationCandidate` metadata.
- It does not create finalized trade state, persisted records, statistics, or
  broker-side effects.

No finalization:

- Verified. There is no finalization validator, finalization state transition,
  finalization route, or finalization writer.
- `safeToFinalize=false` and `finalizationAttempted=false` are explicit.

No persistence/write:

- Verified. There is no Supabase, localStorage, API route, file write, or
  persistence adapter import.
- `safeToPersist=false` and `persistenceAttempted=false` are explicit.

No Supabase/localStorage:

- Verified. The module imports no Supabase clients and no storage helpers.

No audit append:

- Verified. The module imports no audit writer and sets
  `auditAppendAttempted=false`.

No execution-record creation:

- Verified. Optional execution-record candidate metadata is copied as context
  only.
- `safeToCreateExecutionRecord=false` and
  `executionRecordCreationAttempted=false` are explicit.

No stats/PnL update:

- Verified. PnL summaries are preview-only.
- `safeToUpdateStats=false` and `statsUpdateAttempted=false` are explicit.

No trade mutation:

- Verified. Trade context is metadata only.
- `safeToMutateTrade=false` and `tradeMutationAttempted=false` are explicit.

No UI wiring:

- Verified. The module imports no React, DOM, route, component, or UI helper.

No capture/browser/Avanza behavior:

- Verified. The module does not capture broker evidence, drive browser
  automation, click Avanza, read Avanza pages, submit orders, or confirm
  trades.
- `browserAutomationAttempted=false` and
  `avanzaAutomationAttempted=false` are explicit.

## 4. Builder Policy Verification

Clean exact/strong match behavior:

- Exact or strong matched final note results with source identity, provenance,
  compatibility, fee/FX/settlement data, and handoff fingerprint can produce
  `candidate_built`.
- Candidate status becomes `candidate_ready`.
- This still does not approve finalization or persistence.

Missing source/provenance behavior:

- Missing final note source identity returns `blocked`.
- Missing final note provenance returns `blocked`.
- Blocked results do not include a candidate.

Unacceptable match behavior:

- Mismatch, insufficient data, and other unacceptable matching results return
  `blocked`.
- Matching output is trusted as upstream evidence but does not become
  finalization approval.

Duplicate review behavior:

- Duplicate matching status, duplicate confidence, duplicate reasons, or
  duplicate conflict metadata returns `duplicate_review`.
- Candidate output may be present for review, but remains non-authoritative.

Partial-fill review behavior:

- Partial-fill matching ambiguity or broker candidate partial-fill review
  returns `partial_fill_review`.
- Candidate output may be present for review, but cannot finalize.

Missing fee/FX warning behavior:

- Missing commission/fee data returns review status with
  `fee_data_missing_review_required`.
- Missing FX rates when FX is required returns review status with
  `fx_data_missing_review_required`.
- These warnings do not grant authority to finalize, persist, update stats, or
  mutate trades.

Unsupported source behavior:

- Unsupported broker/source classification returns `unsupported`.
- Unsupported results do not include a candidate.

`candidate_built` remains non-authoritative:

- `candidate_built` means candidate metadata was shaped for future validation.
- It is not finalization approval.
- It is not persistence approval.
- It is not execution-record creation approval.
- It is not stats/PnL update approval.
- It is not trade mutation approval.

## 5. Safety Flag Verification

The builder result is not finalization approval.

The builder result is not persistence approval.

The builder result is not execution-record creation approval.

The builder result is not stats/PnL update approval.

The builder result is not trade mutation approval.

Builder result flags:

- `safeToFinalize=false`
- `safeToPersist=false`
- `safeToCreateExecutionRecord=false`
- `safeToUpdateStats=false`
- `safeToMutateTrade=false`
- `finalizationAttempted=false`
- `persistenceAttempted=false`
- `executionRecordCreationAttempted=false`
- `statsUpdateAttempted=false`
- `tradeMutationAttempted=false`
- `auditAppendAttempted=false`
- `browserAutomationAttempted=false`
- `avanzaAutomationAttempted=false`

Candidate flags:

- `safeToFinalize=false`
- `safeToPersist=false`
- `safeToCreateExecutionRecord=false`
- `safeToUpdateStats=false`
- `safeToMutateTrade=false`
- `finalizationAttempted=false`
- `persistenceAttempted=false`
- `executionRecordCreationAttempted=false`
- `statsUpdateAttempted=false`
- `tradeMutationAttempted=false`
- `auditAppendAttempted=false`
- `browserAutomationAttempted=false`
- `avanzaAutomationAttempted=false`

## 6. Remaining Gaps Before Finalization Work

Remaining gaps:

- no finalization validator.
- no finalization state transition implementation.
- no finalization candidate dev preview.
- no execution-record integration.
- no persistence integration.
- no stats/PnL update integration.
- no trade mutation integration.
- no production agent/browser workflow.

These gaps are intentional. The builder creates candidate metadata only.

## 7. Candidate Next Actions

A. Create Finalization Candidate Dev Preview Design

- Highest-value next step.
- Documents how humans can inspect builder output without adding finalization or
  persistence authority.
- Keeps UI/preview work design-only before wiring runtime surfaces.

B. Create Finalization Validator Design

- Useful after preview design or in parallel.
- Defines validation semantics before any future state transition boundary.

C. Create Finalization Candidate Dev Preview

- Useful after preview design.
- Must remain read-only, explicit-trigger-only, and non-persistent.

D. Create Provisional Trade State Design

- Useful later, after preview and validation boundaries are clearer.
- Premature before candidate review/validator surfaces are documented.

## 8. Recommended Next Action

Recommended Action 503:

**Action 503 - Create Finalization Candidate Dev Preview Design**

Reason:

- The pure builder exists and has tests.
- The next safest step is documenting a read-only preview surface that can show
  candidate output, warnings, rejection reasons, and false safety flags without
  adding finalization, persistence, execution-record creation, stats/PnL update,
  trade mutation, UI wiring, capture/browser automation, or Avanza behavior.

## 9. Risk Assessment

`candidate_built` mistaken for finalization:

- Risk: future code treats `candidate_built` as final approval.
- Control: builder and candidate flags keep `safeToFinalize=false`, and
  warnings include not-finalization language.

`candidate_built` mistaken for persistence approval:

- Risk: future code persists builder output as an approved record.
- Control: `safeToPersist=false`, `persistenceAttempted=false`, and no write
  implementation exists.

`candidate_built` mistaken for stats/PnL update approval:

- Risk: preview-only PnL summaries are applied to live statistics.
- Control: PnL summary is preview-only and keeps `safeToUpdateStats=false`.

Builder output overtrusted:

- Risk: future consumers skip validator/finalization boundaries.
- Control: candidate output always carries manual-review and false authority
  signals.

Future UI overtrust:

- Risk: future preview UI presents candidate output as actionable approval.
- Control: next preview design must show status, warnings, rejection reasons,
  and false safety flags.

Premature execution-record coupling:

- Risk: optional execution-record candidate metadata is treated as creation
  approval.
- Control: execution-record metadata remains context only with
  `safeToCreateExecutionRecord=false`.

Premature trade mutation/finalization coupling:

- Risk: builder output is wired directly to trade close/finalize behavior.
- Control: builder has no mutation calls and exposes
  `safeToMutateTrade=false`.

## 10. Verification

Verification for this documentation-only reassessment:

- `git diff --check`

No runtime code changes were made. No refactor, behavior change, builder
change, validator, finalization implementation, persistence/write behavior,
Supabase/localStorage write, audit append, execution-record creation,
stats/PnL update, trade mutation, UI wiring, capture/browser automation, or
Avanza behavior was added.

## Action 503 Follow-Up - Finalization Candidate Dev Preview Design Created

Action 503 created `docs/finalization-candidate-dev-preview-design.md`.

Builder reassessment impact:

- The future preview is designed to visualize
  `buildFinalizationCandidate(...)` output safely.
- The preview is dev-gated, read-only, and non-authoritative.
- It must show builder status, candidate status, summaries, review flags,
  warnings, rejection reasons, precondition results, policy snapshot, and
  safety policy.
- It must show visible labels for candidate-only output and all false safety
  flags.
- No runtime code changes, UI implementation, finalization, persistence,
  execution-record creation, stats/PnL update, trade mutation,
  capture/browser automation, or Avanza behavior was added.

Next recommended action:

**Action 504 - Create Finalization Candidate Dev Preview**

## Action 504 Follow-Up - Finalization Candidate Dev Preview Created

Action 504 created a dev-gated, read-only Finalization Candidate Preview.

Builder reassessment impact:

- The preview calls only `buildFinalizationCandidate(...)` through controlled
  fixture data.
- The builder's candidate-id helper was kept deterministic and made
  browser-safe for the client dev preview.
- The preview does not use live Avanza data.
- The preview does not capture evidence, run browser automation, persist,
  finalize, create execution records, update stats/PnL, or mutate trades.
- Builder result and candidate safety flags remain visible and false.

Next recommended action:

**Action 505 - Reassess Finalization Candidate Dev Preview**

## Action 505 Follow-Up - Finalization Candidate Dev Preview Reassessed

Action 505 created
`docs/finalization-candidate-dev-preview-reassessment.md`.

Builder reassessment impact:

- The preview still calls only pure `buildFinalizationCandidate(...)` through
  controlled fixture data.
- The explicit trigger, dev gate, fixture-only boundary, and read-only display
  boundary were verified.
- The browser-safe deterministic candidate-id helper remains deterministic and
  side-effect-free.
- Candidate output remains non-authoritative metadata with false finalization,
  persistence, execution-record, stats/PnL, and trade-mutation safety flags.
- No runtime code changes, builder changes, UI changes, fixture changes,
  finalization, persistence/write behavior, execution-record creation,
  stats/PnL update, trade mutation, capture/browser automation, Avanza
  behavior, or broker behavior was added.

Next recommended action:

**Action 506 - Create Finalization Validator Design**

## Action 506 Follow-Up - Finalization Validator Design Created

Action 506 created `docs/finalization-validator-design.md`.

Builder reassessment impact:

- The builder remains pure candidate construction.
- The future validator is documented as a separate consumer of builder result
  and candidate metadata.
- Builder output does not authorize finalization, persistence,
  execution-record creation, stats/PnL update, or trade mutation.
- No runtime code changes, builder changes, validator implementation,
  finalization implementation, persistence/write behavior, browser/Avanza
  behavior, or broker behavior was added.

Next recommended action:

**Action 507 - Create Finalization Validator Contract Types**

## Action 507 Follow-Up - Finalization Validator Contract Types Created

Action 507 created `lib/finalization-validator-contract.ts`.

Builder reassessment impact:

- The builder remains pure candidate construction.
- The validator contract can reference builder result types as type-only input.
- No builder behavior, validator logic, finalization, persistence,
  execution-record creation, stats/PnL update, trade mutation, UI wiring,
  browser/Avanza behavior, or broker behavior was added.

Next recommended action:

**Action 508 - Reassess Finalization Validator Contract Types**

## Action 508 Follow-Up - Finalization Validator Contract Reassessed

Action 508 created
`docs/finalization-validator-contract-reassessment.md`.

Builder reassessment impact:

- The validator contract remains downstream of the pure candidate builder.
- The contract can reference builder results but does not change builder
  behavior.
- The contract remains type-only/constants-only and carries no validation
  implementation.
- No finalization, persistence/write behavior, execution-record creation,
  stats/PnL update, trade mutation, UI wiring, browser/Avanza behavior, or
  broker behavior was added.

Next recommended action:

**Action 509 - Create Finalization Validator**

## Action 509 Follow-Up - Pure Finalization Validator Created

Action 509 created `lib/finalization-validator.ts`.

Builder reassessment impact:

- The validator is downstream of `buildFinalizationCandidate(...)`.
- The builder remains unchanged.
- The validator can inspect builder result/candidate metadata without mutating
  it.
- No finalization, persistence/write behavior, execution-record creation,
  stats/PnL update, trade mutation, UI wiring, capture/browser/Avanza behavior,
  broker behavior, or production runtime behavior was added.

Next recommended action:

**Action 510 - Reassess Finalization Validator**

## Action 510 Follow-Up - Finalization Validator Reassessed

Action 510 created `docs/finalization-validator-reassessment.md`.

Builder reassessment impact:

- The validator remains downstream of `buildFinalizationCandidate(...)`.
- The builder remains unchanged.
- Validation output does not mutate builder output or candidate metadata.
- No finalization, persistence/write behavior, execution-record creation,
  stats/PnL update, trade mutation, UI wiring, capture/browser/Avanza behavior,
  broker behavior, or production runtime behavior was added.

Next recommended action:

**Action 511 - Create Finalization State Transition Design**

## Action 511 Follow-Up - Finalization State Transition Design Created

Action 511 created `docs/finalization-state-transition-design.md`.

Builder relationship:

- The builder remains upstream candidate construction.
- Transition design starts after candidate validation and explicit future
  review/approval boundaries.
- Builder output does not apply transition states.
- No builder change, finalization implementation, persistence/write behavior,
  execution-record creation, stats/PnL update, trade mutation, UI wiring,
  capture/browser/Avanza behavior, or broker behavior was added.

Next recommended action:

**Action 512 - Create Finalization State Transition Contract Types**

## Action 512 Follow-Up - Finalization State Transition Contract Types Created

Action 512 created `lib/finalization-state-transition-contract.ts`.

Builder reassessment impact:

- The transition contract can reference builder result types as type-only
  context.
- The candidate builder remains unchanged and upstream.
- The transition contract does not apply target states or mutate candidates.
- No builder change, transition implementation, finalization,
  persistence/write behavior, execution-record creation, stats/PnL update,
  trade mutation, UI wiring, capture/browser/Avanza behavior, or broker
  behavior was added.

Next recommended action:

**Action 513 - Reassess Finalization State Transition Contract Types**

## Action 513 Follow-Up - Finalization State Transition Contract Reassessed

Action 513 created
`docs/finalization-state-transition-contract-reassessment.md`.

Builder reassessment impact:

- The transition contract remains downstream of candidate building and
  validation.
- Builder results and provisional trade context remain type-only context for a
  future transition boundary.
- The reassessment confirms the transition contract does not mutate candidates,
  apply target state, finalize, persist, create execution records, update
  stats/PnL, or mutate trades.
- No builder change, transition implementation, finalization implementation,
  persistence/write behavior, execution-record creation, stats/PnL update,
  trade mutation, UI wiring, capture/browser/Avanza behavior, or broker
  behavior was added.

Next recommended action:

**Action 514 - Create Finalization State Transition Validator Design**

## Action 514 Follow-Up - Finalization State Transition Validator Design Created

Action 514 created
`docs/finalization-state-transition-validator-design.md`.

Builder reassessment impact:

- The transition validator design remains downstream of candidate building and
  finalization validation.
- Builder output may be input context for future transition validation only.
- The validator design does not mutate candidates, apply target state,
  finalize, persist, create execution records, update stats/PnL, or mutate
  trades.
- No builder change, transition validator implementation, state transition
  implementation, finalization implementation, persistence/write behavior,
  execution-record creation, stats/PnL update, trade mutation, UI wiring,
  capture/browser/Avanza behavior, or broker behavior was added.

Next recommended action:

**Action 515 - Create Finalization State Transition Validator Contract Types**
