# BrokerExecutionResult Confirmation Path Reassessment

## 1. Purpose

Reassess what qualifies as a confirmed broker execution result before enabling
execution-record persistence or trade mutation.

This reassessment verifies the current system has preview, stub, diagnostic,
and dev fixture paths, but no production-safe confirmed `BrokerExecutionResult`
path. It also documents what must be true before any broker-originating result
can be considered for persistence or trade mutation.

This action is documentation-only. It adds no runtime code, refactor, behavior
change, `BrokerExecutionResult` creation, broker confirmation capture change,
Avanza/browser behavior, Supabase write, persistence behavior, or trade
mutation.

## 2. Current broker result source inventory

Broker confirmation capture preview/stub:

- Produced by `lib/avanza-broker-confirmation-capture-contract.ts` and
  localhost bridge stub paths.
- Displayed in the dev-gated handoff modal broker confirmation capture preview.
- Labels include `Broker confirmation capture only`,
  `No BrokerExecutionResult`, `No execution record`, `No Supabase write`, and
  `No trade mutation`.
- It can provide sanitized capture evidence for eligibility/preview checks.
- It is not allowed for persistence or trade mutation.

BrokerExecutionResult eligibility:

- Produced by `lib/avanza-broker-execution-result-eligibility.ts`.
- Displayed by the dev-gated `BrokerExecutionResult eligibility preview`.
- Metadata explicitly says `eligibilityCheckOnly: true`,
  `noBrokerExecutionResultCreated: true`, `noExecutionRecordCreated: true`,
  `noSupabaseWrite: true`, and `noTradeMutation: true`.
- It can say whether capture evidence would be eligible for future conversion.
- It does not create a broker result and is not allowed for persistence or
  trade mutation.

BrokerExecutionResult preview/conversion mapping:

- Produced by `lib/avanza-broker-execution-result-preview.ts`.
- Displayed by the dev-gated `BrokerExecutionResult conversion preview`.
- Preview shape metadata explicitly says `previewOnly: true` and
  `notBrokerExecutionResult: true`.
- It can produce preview-shaped fields that look like a future
  BrokerExecutionResult.
- It is blocked by execution-record creation validation and is not allowed for
  persistence or trade mutation.

Execution-record creation dev fixture:

- Produced by `lib/execution-record-creation-dev-fixture.ts`.
- Wired into the dev-gated read-only execution-record creation preview.
- Metadata marks the source as `execution_record_creation_dev_fixture` and
  includes `noSupabaseWrite`, `noTradeMutation`, `noBrokerExecution`, and
  `noAvanzaAutomation`.
- It can produce an eligible candidate preview for UI QA.
- Candidate building keeps `safeToPersist=false`.
- It is not allowed for persistence or trade mutation.

Execution record candidate builder:

- Produced by `lib/execution-record-candidate-builder.ts`.
- Validates first with `validateExecutionRecordCreationInput(...)`.
- Returns unsafe/rejected results without a candidate.
- Eligible candidate results still keep `safeToPersist=false`.
- It is a candidate preview/construction boundary, not persistence and not
  trade mutation.

Dry-run insert route result:

- Produced by `app/api/execution/records/insert/route.ts`.
- Called by `lib/execution-record-insert-dry-run-client.ts`.
- Displayed by `ExecutionRecordInsertDryRunPreview`.
- Requires `mode: "dry_run"` and `dryRun: true`.
- Returns no-write/no-mutation safety metadata.
- It is not a broker result and cannot persist or mutate trades.

Local/dev diagnostics records:

- Includes local bridge diagnostics, dev mock broker result stores, execution
  audit diagnostics, mock broker page fixtures, and Settings diagnostics.
- Some dev mock paths can convert mock broker output into Avanza-shaped
  preview data for testing only.
- These records are local/dev diagnostics, not production broker
  confirmations.
- They are unsafe for persistence and trade mutation.

Real broker-originating data:

- No production-safe real broker-originating confirmed `BrokerExecutionResult`
  path currently exists.
- The Avanza confirmation capture phase is designed as future work after human
  manual final confirmation.
- No real Avanza capture, conversion, persistence, or trade mutation is
  implemented.

## 3. Source classification matrix

| Source | Real vs synthetic | Preview vs confirmed | Dev vs production | Allowed for candidate builder | Allowed for persistence | Allowed for trade mutation | Current safety status |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Broker confirmation capture preview/stub | Synthetic/stubbed evidence path today | Capture preview only | Dev-gated | Indirectly usable for eligibility/preview checks only | No | No | Safe as read-only diagnostics |
| BrokerExecutionResult eligibility | Derived diagnostic | Eligibility only | Dev-gated | No direct candidate; informs preview | No | No | Safe as no-result check |
| BrokerExecutionResult preview | Preview-shaped data | Preview only, not confirmed | Dev-gated | May feed preview-only rejection path | No | No | Explicitly `notBrokerExecutionResult` |
| Execution-record dev fixture | Synthetic fixture | Fixture candidate preview | Dev-only | Yes, for UI QA | No | No | `safeToPersist=false` |
| Execution record candidate builder output | Derived candidate | Candidate only | Local/dev path currently | Yes, output boundary | No while `safeToPersist=false` | No | Safe preview/candidate boundary |
| Dry-run insert route result | Route validation result | Dry-run only | Dev/sandbox path | No broker candidate source | No | No | No-write/no-mutation route |
| Local/dev diagnostics records | Synthetic/mock/dev telemetry | Diagnostics only | Dev/local | No production use | No | No | Unsafe for production persistence |
| Real Avanza broker confirmation | Not implemented | Not available | Future production path | Future only after requirements pass | Future only after validator/schema readiness | Still separate future decision | Missing |

## 4. Current conversion path

Broker confirmation capture preview:

- Begins after a human manual confirmation wait conceptually reaches
  `user_confirmed_unverified`.
- Current implementation is contract/stub/preview only.
- It does not click `Bekrafta`, submit an order, create a broker result, write
  Supabase, or mutate trades.

BrokerExecutionResult eligibility:

- Consumes capture result-shaped evidence.
- Checks whether capture status, order status, risk flags, timestamp, order id,
  duplicate fingerprint, and sensitive/raw data gates allow future conversion.
- Stops at eligibility metadata with no broker result creation.

BrokerExecutionResult preview:

- Consumes eligibility and capture result-shaped evidence.
- Produces `BrokerExecutionResult`-shaped preview fields only when eligible.
- Metadata marks it `previewOnly` and `notBrokerExecutionResult`.
- Stops before real broker result creation.

Execution record candidate builder:

- Consumes an execution-record creation input that includes a source broker
  execution result shape.
- Rejects preview-only, not-broker-result, synthetic, dev/mock, missing
  idempotency, missing broker reference, missing timestamp, placed-only,
  partial-fill, mismatched, invalid quantity/price, sensitive/raw, attempted
  Supabase write, attempted trade mutation, and automatic-mode inputs.
- Stops with `safeToPersist=false`, even when a candidate can be previewed.

Dry-run insert route:

- Consumes future insert route contract shape.
- Runs pure persistence eligibility validation.
- Returns typed dry-run route results with no-write/no-mutation metadata.
- Stops before Supabase reads/writes, audit append, trade mutation, or record
  storage.

## 5. Missing production confirmation requirements

Real Avanza confirmation capture evidence:

- A production-safe capture path must read sanitized broker confirmation or
  receipt evidence after the human final action.
- It must not infer execution from `user_confirmed_unverified` alone.
- It must not capture raw DOM, unsanitized screenshots, credentials, cookies,
  balances, holdings, account numbers, or personal identifiers.

Broker order id / confirmation id reliability:

- A stable broker order id, confirmation id, or reviewed equivalent is needed.
- Missing-id policy must be explicit and idempotency-safe.
- Duplicate detection must not rely on local diagnostics alone.

Timestamp reliability:

- Broker confirmation timestamp or evidence timestamp must be present and
  parseable.
- Generated timestamps should be provenance metadata only unless a future
  policy explicitly allows them.

Instrument/ticker matching:

- Ticker, instrument identity, market, currency, and instrument type must match
  the original handoff/dry-run request policy.
- Ambiguous instrument identity must block or require manual review.

Side/quantity/price verification:

- Buy/sell side must match the plan.
- Quantity must be positive, finite, and match the expected policy.
- Execution price or average fill price must be present, positive, and within
  the approved tolerance policy.
- Placed/accepted orders must not be treated as filled executions.
- Partial fills require a separate accounting policy.

Account/currency context:

- Currency must be known.
- Account context must be sanitized and scoped.
- User/account ownership must be compatible with future RLS/server-only write
  policy.

Idempotency/fingerprint:

- A deterministic source evidence fingerprint is required.
- An idempotency key is required.
- Broker reference, order id, timestamp, side, ticker, quantity, and price
  should contribute to duplicate protection.

User/manual confirmation boundary:

- Semi-automatic mode must retain human final confirmation.
- The agent must not click final confirmation.
- Manual confirmation evidence must remain separate from broker receipt
  evidence.

Screenshot/text/source provenance:

- If future evidence includes screenshot/text provenance, it must be sanitized,
  minimized, and traceable.
- Raw screenshots or DOM should remain blocked.

Anti-spoofing checks:

- Source must be broker-originating, not mock, fixture, preview, or local
  diagnostics.
- The capture path needs provenance metadata that proves source environment,
  capture time, evidence fingerprint, and request association.
- Preview-only and dev/mock flags must continue to block persistence.

## 6. Persistence safety rules

- No preview-only source can persist.
- No `notBrokerExecutionResult` source can persist.
- No dev fixture can persist.
- No dry-run route result can persist.
- No local diagnostics record can persist.
- No mock broker result can persist as production evidence.
- Only a confirmed broker-originating result can be considered.
- Even a confirmed broker-originating result still requires:
  - execution-record creation validation.
  - persistence validator eligibility.
  - applied schema/migration readiness.
  - RLS/user/account readiness.
  - duplicate lookup.
  - server-only write boundary.
  - audit/trade mutation separation.

## 7. Trade mutation safety rules

- `BrokerExecutionResult` confirmation does not automatically mutate trade
  state.
- Opening, closing, selling, or otherwise mutating trade state remains a
  separate boundary.
- Execution-record persistence does not imply History, Statistics, or live
  position mutation.
- Semi-auto manual confirmation remains required for any real execution path.
- Automatic mode remains out of scope until separately reviewed and approved.
- Trade mutation must require its own validator, idempotency strategy, audit
  policy, and rollback/error handling.

## 8. Candidate next actions

A. Create BrokerExecutionResult Confirmation Requirements Spec

- highest safety/payoff next step.
- turns this reassessment into concrete production confirmation requirements,
  source classifications, required evidence fields, blockers, warnings,
  provenance requirements, and anti-spoofing gates.
- remains documentation-only and avoids real broker capture or persistence.

B. Reassess Avanza Broker Confirmation Capture Readiness

- useful once the requirements spec exists.
- closer to Avanza/browser behavior, so it should wait for explicit
  confirmation requirements.

C. Create Broker Result Source Classification Types

- useful after requirements are stable.
- could encode preview/dev/mock/confirmed classifications, but type work before
  requirements may lock in the wrong model.

D. Create Broker Confirmation Evidence Contract

- valuable, but broader than source classification and should follow a
  confirmation requirements spec.

E. Pause persistence and return to Avanza runner readiness

- possible if product priority shifts to runner work.
- higher behavioral risk because runner readiness approaches browser/Avanza
  flows.

## 9. Recommended next action

**Action 449 - Create BrokerExecutionResult Confirmation Requirements Spec**

## Action 449 Follow-Up

Action 449 created
`docs/broker-execution-result-confirmation-requirements-spec.md`.

Result:

- Defined production-safe confirmed `BrokerExecutionResult` requirements.
- Specified source classes: `preview_only`, `dev_fixture`, `mock_broker`,
  `dry_run`, `local_diagnostics`, `broker_confirmed`, and
  `production_safe_candidate`.
- Documented required broker confirmation evidence, Avanza-specific evidence
  expectations, field validation rules, anti-spoofing/provenance requirements,
  execution-record creation relationship, trade mutation relationship, and
  rejection reason mapping.
- Confirmed preview/dev/dry-run/mock/local diagnostics remain blocked from
  persistence and trade mutation.

Next recommended action:

**Action 450 - Create Broker Result Source Classification Types**

## Action 450 Follow-Up

Action 450 created `lib/broker-result-source-classification.ts`.

Confirmation-path impact:

- Source classifications are now represented by contract-only TypeScript
  types/constants.
- Policy metadata keeps preview-only, dev fixture, mock broker, dry-run, and
  local diagnostics sources blocked from persistence and trade mutation.
- `broker_confirmed` is modeled as a future creation candidate source, not a
  persistence-ready result by itself.
- `production_safe_candidate` is the only class marked persistence-capable, and
  trade mutation remains false for all classes.

Next recommended action:

**Action 451 - Reassess Broker Result Source Classification Types**

## Action 451 Follow-Up

Action 451 created
`docs/broker-result-source-classification-types-reassessment.md`.

Confirmation-path impact:

- Source classification policy metadata remains conservative and type-only.
- Runtime enforcement has not been added yet.
- Preview/dev/mock/dry-run/local diagnostics remain blocked from persistence
  and trade mutation.
- The next safe implementation step is a pure source classification validator.

Next recommended action:

**Action 452 - Create Broker Result Source Classification Validator**

## Action 452 Follow-Up

Action 452 created `lib/broker-result-source-classification-validator.ts`.

Confirmation-path impact:

- Source classifications now have a pure usage validator.
- The validator is not wired into production flows.
- It returns policy metadata, warnings, and rejection reasons only.
- It preserves the boundary that source classification does not create
  BrokerExecutionResults, execution records, persistence, or trade mutation.

Next recommended action:

**Action 453 - Reassess Broker Result Source Classification Validator**

Rationale:

- no current source is production-safe for persistence or trade mutation.
- the system already has many preview/stub/dev boundaries; the next gap is a
  precise definition of what a real confirmed broker result must prove.
- a requirements spec can preserve the current no-write/no-mutation posture
  while preparing future capture, conversion, and persistence work.

## 10. Risk assessment

Spoofed result risk:

- high. Preview-shaped data, dev fixtures, and local diagnostics can look like
  execution data if provenance is ignored.

Preview mistaken for confirmation risk:

- high. Existing preview metadata blocks this today; future UI and persistence
  code must keep honoring `previewOnly` and `notBrokerExecutionResult`.

Dev fixture persistence risk:

- high. Dev fixtures intentionally create eligible-looking candidates for UI
  QA but keep `safeToPersist=false`.

Incorrect instrument/side/quantity/price risk:

- high. Any mismatch can create a false trade record or wrong position state.

Duplicate record risk:

- high. Broker references, timestamps, fingerprints, and idempotency keys must
  be deterministic and checked against durable storage before writes.

Trade mutation coupling risk:

- high. Broker confirmation, execution-record persistence, and trade mutation
  must remain separate phases.

Audit provenance risk:

- medium/high. Future confirmed results need source evidence, fingerprint,
  capture timestamp, request association, and sanitized provenance.

Avanza UI fragility risk:

- high. Broker UI wording, order states, partial fills, and confirmation pages
  can vary. Capture must block or require review on ambiguity.

## 11. Verification

Verification for this documentation-only reassessment:

- `git diff --check`

No runtime code changes were made. No `BrokerExecutionResult` creation, broker
confirmation capture change, Avanza/browser behavior, Supabase change,
persistence/write behavior, audit append, or trade mutation was added.

## Action 459 Follow-Up

Action 459 created
`docs/avanza-evidence-to-broker-execution-result-mapping-design.md`.

Confirmation-path impact:

- Validated Avanza evidence now has a future mapping design to
  BrokerExecutionResult-shaped fields.
- The mapping design remains documentation-only and does not create broker
  results, records, writes, audit events, trade mutations, or Avanza/browser
  behavior.
- A BrokerExecutionResult confirmation validator design is the next safe
  broker-confirmation step.

Next recommended action:

**Action 460 - Create BrokerExecutionResult Confirmation Validator Design**

## Action 460 Follow-Up

Action 460 created
`docs/broker-execution-result-confirmation-validator-design.md`.

Confirmation-path impact:

- The path now has a documentation-only design for the future validator that
  decides whether evidence can become a confirmed BrokerExecutionResult
  candidate.
- The design does not implement validation, mapping, conversion, persistence,
  audit append, trade mutation, browser behavior, or Avanza behavior.

Next recommended action:

**Action 461 - Create BrokerExecutionResult Confirmation Validator Contract Types**

## Action 453 Follow-Up

Action 453 created
`docs/broker-result-source-classification-validator-reassessment.md`.

Result:

- Confirmed the source classification validator is pure, deterministic, and
  disconnected from broker capture/conversion/runtime flows.
- Confirmed it enforces policy-only source gates for candidate preview,
  execution-record creation, persistence, and trade mutation usage checks.
- Confirmed it does not create BrokerExecutionResults, persist records, append
  audit events, mutate trades, control browsers, or touch Avanza.

Next recommended action:

**Action 454 - Create Avanza Broker Confirmation Evidence Contract**

## Action 454 Follow-Up

Action 454 created
`docs/avanza-broker-confirmation-evidence-contract.md`.

Confirmation-path impact:

- The path now has a prose contract for Avanza-originating broker evidence.
- It clarifies that pre-submit/order-preview sources are not confirmed
  execution evidence.
- It requires final confirmation/readback or account/order history evidence,
  provenance, broker references or strong equivalents, plausible timestamps,
  and handoff matching before future validation.
- It keeps conversion, capture, persistence, audit append, trade mutation,
  browser, and Avanza behavior out of scope.

Next recommended action:

**Action 455 - Create Avanza Broker Confirmation Evidence Types**

## Action 461 Follow-Up

Action 461 created
`lib/broker-execution-result-confirmation-validator-contract.ts`.

Confirmation-path impact:

- The broker confirmation path now has type-only contracts for the future
  BrokerExecutionResult confirmation validator.
- Preview/dev/mock/dry-run/local diagnostic sources remain outside production
  confirmation by policy, and trade mutation remains disabled by contract.
- No runtime validator, capture, conversion, persistence, Supabase, audit
  append, trade mutation, browser, or Avanza behavior was added.

Next recommended action:

**Action 462 - Reassess BrokerExecutionResult Confirmation Validator Contract Types**

## Action 462 Follow-Up

Action 462 created
`docs/broker-execution-result-confirmation-validator-contract-reassessment.md`.

Confirmation-path impact:

- The confirmation validator contract boundary was reassessed as conservative,
  type-only, and disconnected from runtime validation and conversion.
- `confirmed_candidate` remains separated from persistence and trade mutation.
- The next safe step is a pure confirmation validator, not capture,
  persistence, or trade mutation.

Next recommended action:

**Action 463 - Create BrokerExecutionResult Confirmation Validator**

## Action 463 Follow-Up

Action 463 created
`lib/broker-execution-result-confirmation-validator.ts`.

Confirmation-path impact:

- The path now includes a pure confirmation validator after evidence
  validation and source classification.
- It returns typed eligibility/review/rejection metadata only.
- No BrokerExecutionResult conversion, persistence, audit append, trade
  mutation, capture, browser, or Avanza behavior was added.

Next recommended action:

**Action 464 - Reassess BrokerExecutionResult Confirmation Validator**

## Action 464 Follow-Up

Action 464 created
`docs/broker-execution-result-confirmation-validator-reassessment.md`.

Confirmation-path impact:

- The implemented confirmation validator was reassessed as pure,
  conservative, and disconnected from mapping, persistence, trade mutation,
  capture, browser automation, and Avanza behavior.
- The path is ready for mapper contract type design, not mapper implementation
  yet.

Next recommended action:

**Action 465 - Create Evidence-to-BrokerExecutionResult Mapper Contract Types**

## Action 465 Follow-Up

Action 465 created
`lib/evidence-to-broker-execution-result-mapper-contract.ts`.

Confirmation-path impact:

- The path now has type-only mapper contracts after confirmation validation.
- The mapper remains unimplemented and cannot create BrokerExecutionResults.
- Persistence, audit append, trade mutation, capture/browser automation, and
  Avanza behavior remain out of scope.

Next recommended action:

**Action 466 - Reassess Evidence-to-BrokerExecutionResult Mapper Contract Types**

## Action 466 Follow-Up

Action 466 created
`docs/evidence-to-broker-execution-result-mapper-contract-reassessment.md`.

Confirmation-path impact:

- The path now has a verified mapper contract reassessment.
- The contract is still not runtime conversion and still creates no
  BrokerExecutionResult.
- Candidate shape should be reassessed before mapper implementation.

Next recommended action:

**Action 467 - Create BrokerExecutionResult Candidate Type/Shape Reassessment**

## Action 467 Follow-Up

Action 467 created
`docs/broker-execution-result-candidate-shape-reassessment.md`.

Confirmation-path impact:

- The BrokerExecutionResult target shape was reassessed before mapper
  implementation.
- No existing runtime/preview/dev/execution-record shape is suitable as-is.
- The next safe step is a type-only candidate contract.

Next recommended action:

**Action 468 - Create BrokerExecutionResult Candidate Contract Types**

## Action 468 Follow-Up

Action 468 created
`lib/broker-execution-result-candidate-contract.ts`.

Confirmation-path impact:

- The path now has a dedicated type-only BrokerExecutionResult candidate
  contract after confirmation validation and before mapper implementation.
- The contract is not a runtime conversion step and does not produce a
  BrokerExecutionResult.
- Persistence, audit append, trade mutation, capture/browser automation, and
  Avanza behavior remain out of scope.

Next recommended action:

**Action 469 - Reassess BrokerExecutionResult Candidate Contract Types**

## Action 469 Follow-Up

Action 469 created
`docs/broker-execution-result-candidate-contract-reassessment.md`.

Confirmation-path impact:

- The candidate contract is verified as a type-only boundary between
  confirmation validation and future mapping.
- The path still has no runtime BrokerExecutionResult creation, persistence,
  audit append, trade mutation, capture/browser automation, or Avanza
  behavior.
- A pure mapper is the next safe step.

Next recommended action:

**Action 470 - Create Evidence-to-BrokerExecutionResult Mapper**

## Action 470 Follow-Up

Action 470 created
`lib/evidence-to-broker-execution-result-mapper.ts`.

Confirmation-path impact:

- The path now has a pure mapper after evidence validation and confirmation
  validation.
- The mapper outputs candidates only and does not create runtime
  BrokerExecutionResults.
- Execution-record creation, persistence, audit append, trade mutation,
  capture/browser automation, and Avanza behavior remain separate.

Next recommended action:

**Action 471 - Reassess Evidence-to-BrokerExecutionResult Mapper**

## Action 471 Follow-Up

Action 471 created
`docs/evidence-to-broker-execution-result-mapper-reassessment.md`.

Confirmation-path impact:

- The pure mapper has been reassessed after implementation.
- The path still has no runtime BrokerExecutionResult creation, execution
  record creation, persistence, audit append, trade mutation, capture/browser,
  or Avanza behavior.
- The next safe step is preview design only.

Next recommended action:

**Action 472 - Create Mapped BrokerExecutionResult Candidate Preview Design**

## Action 472 Follow-Up

Action 472 created
`docs/mapped-broker-execution-result-candidate-preview-design.md`.

Confirmation-path impact:

- The path now has a design for previewing pure mapped candidates safely.
- The design remains dev-gated/read-only and adds no runtime behavior.
- Execution-record creation, persistence, audit append, trade mutation,
  capture/browser, and Avanza behavior remain separate.

Next recommended action:

**Action 473 - Create Mapped BrokerExecutionResult Candidate Dev Preview**
