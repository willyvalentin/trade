# Broker Result Source Classification Validator Reassessment

## 1. Purpose

Reassess the broker result source classification validator after Action 452.
The goal is to verify that `validateBrokerResultSourceForUsage(...)` remains
pure, conservative, policy-based, and disconnected from runtime persistence,
conversion, capture, Supabase, audit, trade mutation, browser, and Avanza
flows.

## 2. Current validator inventory

Validator module:

- `lib/broker-result-source-classification-validator.ts`

Exported API:

- `validateBrokerResultSourceForUsage(input)`
- `BROKER_RESULT_SOURCE_USAGES`
- `BrokerResultSourceUsage`
- `BROKER_RESULT_SOURCE_CLASSIFICATION_REJECTION_REASONS`
- `BrokerResultSourceClassificationRejectionReason`
- `BROKER_RESULT_SOURCE_CLASSIFICATION_WARNINGS`
- `BrokerResultSourceClassificationWarning`
- `ValidateBrokerResultSourceForUsageInput`
- `BrokerResultSourceClassificationValidationResult`

Intended usage inputs:

- `candidate_preview`
- `execution_record_creation`
- `persistence`
- `trade_mutation`

Output shape:

- `allowed`
- normalized `classification`
- `intendedUsage`
- `rejectionReasons`
- `warnings`
- `policyRule`
- `capabilityFlags`
- source `metadata`

Rejection reasons:

- `unsupported_source_classification`
- `policy_metadata_missing`
- `source_not_candidate_preview_capable`
- `source_not_creation_capable`
- `source_not_persistence_capable`
- `source_not_trade_mutation_capable`

Warnings:

- `policy_metadata_only_not_runtime_enforcement`
- `allowed_does_not_enable_persistence`
- `allowed_does_not_enable_trade_mutation`
- `broker_confirmed_requires_additional_persistence_gates`
- `production_safe_candidate_requires_server_write_boundary`
- `source_metadata_missing`

Policy snapshot:

- The validator returns the matching
  `BROKER_RESULT_SOURCE_CLASSIFICATION_RULES[classification]`.
- The validator returns the matching capability flags snapshot.
- Unsupported source values return `policyRule: null` and
  `capabilityFlags: null`.

E2E coverage:

- `tests/e2e/execution-sandbox.spec.ts` includes pure-helper coverage for
  broker result source classification policy.
- Covered cases include unsafe sources rejected for persistence, trade
  mutation rejected for every source class, `broker_confirmed` rejected for
  persistence, `production_safe_candidate` allowed only as persistence policy
  metadata with no-write warnings, and unsupported source classifications
  rejected conservatively.

## 3. Boundary verification

Pure only:

- The validator imports only source classification policy constants and types.
- It is deterministic and returns a value based on input plus static policy.
- It does not read time, environment, storage, network, or app state.

Policy-only:

- The validator checks whether a source class allows a requested usage.
- It does not validate Avanza evidence, broker confirmations, order ids,
  positions, quantities, prices, account identity, or screenshots.
- It does not assign `production_safe_candidate`.

No runtime wiring:

- The validator is covered by tests but is not wired into UI, route, bridge,
  execution, broker, or persistence flows.

No persistence/write:

- No Supabase client is imported.
- No localStorage is accessed.
- No execution record is stored.
- No insert route or write path is called.

No conversion/capture:

- No `BrokerExecutionResult` is created or converted.
- No Avanza capture path is changed.
- No browser selectors, URLs, automation, or confirmation capture behavior is
  introduced.

No Supabase/audit/trade/browser/Avanza behavior:

- The validator does not append audit events.
- The validator does not mutate trades.
- The validator does not control or inspect browser state.
- The validator does not add Avanza behavior.

## 4. Policy enforcement verification

Unsafe source classes rejected for persistence:

- `preview_only`
- `dev_fixture`
- `mock_broker`
- `dry_run`
- `local_diagnostics`

Trade mutation rejected for all classes:

- Every current class has `allowsTradeMutation: false`.
- `validateBrokerResultSourceForUsage(..., "trade_mutation")` rejects all
  current classes with `source_not_trade_mutation_capable`.

`broker_confirmed` not persistence-capable:

- `broker_confirmed` allows future candidate preview and execution record
  creation policy checks.
- It remains rejected for persistence.
- It carries a warning that additional persistence gates are required.

`production_safe_candidate` policy allowance:

- `production_safe_candidate` is the only class currently marked
  persistence-capable.
- The validator returns warnings that policy allowance does not enable writes
  and still requires a server write boundary.
- This allowance does not create a record, write Supabase, append audit, or
  mutate trades.

Unsupported source rejection:

- Unknown classifications are rejected with
  `unsupported_source_classification`.
- Unsupported sources return no policy rule and no capability flags.

## 5. Remaining gaps before broker confirmation enforcement

- No Avanza confirmation evidence contract exists yet.
- No `BrokerExecutionResult` confirmation validator exists yet.
- No real broker confirmation capture path exists.
- No provenance or evidence validation exists beyond optional metadata fields.
- No persistence integration is connected to source classification validation.
- No trade mutation integration exists, and trade mutation must remain a
  separate boundary.
- No policy exists for when `production_safe_candidate` may be assigned by a
  future trusted server-side flow.

## 6. Candidate next actions

A. Create Avanza Broker Confirmation Evidence Contract

- safest next broker-confirmation step.
- defines the evidence/provenance shape needed before confirming broker
  results.
- remains type-only if implemented carefully.
- helps prevent source classification policy from being mistaken for complete
  validation.

B. Create BrokerExecutionResult Confirmation Validator Design

- useful before implementing a full confirmation validator.
- should depend on evidence contracts and source classification validation.
- higher risk than evidence contracts because validation semantics may imply
  production readiness.

C. Reassess Avanza Broker Confirmation Capture Readiness

- useful but closer to browser/Avanza behavior.
- should wait until evidence contracts and validator design are clearer.

D. Create Broker Result Source Enforcement Integration Plan

- useful later when classification validation is ready to enter runtime paths.
- too early before evidence contracts and confirmation validation.

## 7. Recommended next action

**Action 454 - Create Avanza Broker Confirmation Evidence Contract**

Rationale:

- Source classification policy and validation now exist, but they do not prove
  broker confirmation.
- The next safest step is a contract-only evidence shape for Avanza broker
  confirmation provenance.
- This keeps browser capture, conversion, persistence, Supabase writes, audit
  append, and trade mutation out of scope.

## 8. Risk assessment

Policy mistaken for complete validation risk:

- high. The validator enforces source classification policy only. It does not
  prove broker evidence, idempotency, trade association, or persistence
  readiness.

`production_safe_candidate` misuse risk:

- high. The class is persistence-capable as policy metadata, but no current
  runtime path should assign it or treat it as write permission.

Preview mistaken for confirmed risk:

- high. Preview-shaped values can resemble broker results. The validator
  correctly blocks preview/dev/mock/dry-run/local sources for persistence.

Provenance gap risk:

- high. Metadata is returned and surfaced but not validated as sufficient
  evidence. A future Avanza evidence contract should define required fields.

Future enforcement integration risk:

- medium/high. Wiring this validator into runtime flows too early could create
  false confidence unless evidence, creation, persistence, and write boundaries
  remain separate.

Trade mutation coupling risk:

- high. Trade mutation remains false for all classes. Future trade mutation
  requires its own boundary, validator, idempotency model, and audit plan.

## 9. Verification

Verification for this documentation-only reassessment:

- `git diff --check`

No runtime code changes were made. No runtime wiring, BrokerExecutionResult
creation, conversion/capture behavior, persistence/write behavior, Supabase
behavior, audit append, trade mutation, browser behavior, or Avanza behavior
was added.

## Action 454 Follow-Up

Action 454 created
`docs/avanza-broker-confirmation-evidence-contract.md`.

Result:

- Defined required and optional Avanza confirmation evidence fields.
- Defined allowed/disallowed evidence source types.
- Documented provenance metadata, validation prerequisites, partial-fill
  handling, rejection/uncertainty flags, privacy requirements, and relationship
  to future `BrokerExecutionResult` confirmation.
- Confirmed the evidence contract is documentation-only and adds no capture,
  conversion, persistence, Supabase, audit, trade mutation, browser, or Avanza
  behavior.

Next recommended action:

**Action 455 - Create Avanza Broker Confirmation Evidence Types**

## Action 455 Follow-Up

Action 455 created
`lib/avanza-broker-confirmation-evidence-contract.ts`.

Source-classification impact:

- Avanza evidence types now reference `BrokerResultSourceClassification` as
  type-only metadata.
- The evidence types do not validate or enforce source classification policy.
- The source classification validator remains separate and pure.
- No runtime wiring, persistence, conversion, capture, Supabase behavior, audit
  append, trade mutation, browser behavior, or Avanza behavior was added.

Next recommended action:

**Action 456 - Reassess Avanza Broker Confirmation Evidence Types**

## Action 456 Follow-Up

Action 456 created
`docs/avanza-broker-confirmation-evidence-types-reassessment.md`.

Source-classification impact:

- Evidence types were reassessed as type/constant-only and aligned with the
  Avanza evidence contract.
- The source classification validator remains separate from evidence typing.
- No source/provenance enforcement has been wired into runtime flows.
- The next safe step is a pure evidence validator that can consume both the
  evidence types and source classification policy without capture/conversion
  or persistence.

Next recommended action:

**Action 457 - Create Avanza Broker Confirmation Evidence Validator**

## Action 457 Follow-Up

Action 457 created
`lib/avanza-broker-confirmation-evidence-validator.ts`.

Source-classification impact:

- The Avanza evidence validator uses
  `validateBrokerResultSourceForUsage(...)` as a pure source policy check for
  execution-record creation usage.
- Source classification remains policy-only and separate from capture,
  conversion, persistence, and trade mutation.
- Unsafe source classification results cause the evidence validator to reject
  conservatively without runtime wiring.

Next recommended action:

**Action 458 - Reassess Avanza Broker Confirmation Evidence Validator**

## Action 458 Follow-Up

Action 458 created
`docs/avanza-broker-confirmation-evidence-validator-reassessment.md`.

Source-classification impact:

- The evidence validator's source classification check remains pure policy
  usage only.
- Source policy does not create BrokerExecutionResults or authorize
  persistence.
- Future mapping must preserve the distinction between source policy,
  evidence validation, broker result confirmation, persistence, and trade
  mutation.

Next recommended action:

**Action 459 - Create Evidence-to-BrokerExecutionResult Mapping Design**

## Action 460 Follow-Up

Action 460 created
`docs/broker-execution-result-confirmation-validator-design.md`.

Source-classification impact:

- Source classification is one validation layer in the future confirmation
  validator design.
- Source classification remains necessary but insufficient for confirmation,
  persistence, or trade mutation.
- Contract types are the next safe step before implementation.

Next recommended action:

**Action 461 - Create BrokerExecutionResult Confirmation Validator Contract Types**
