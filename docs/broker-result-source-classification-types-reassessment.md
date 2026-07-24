# Broker Result Source Classification Types Reassessment

## 1. Purpose

Reassess the broker result source classification types before any runtime
validation or enforcement is introduced.

This reassessment verifies that `lib/broker-result-source-classification.ts`
remains conservative, type/constant-only, and disconnected from
BrokerExecutionResult creation, capture, conversion, persistence, Supabase,
audit append, trade mutation, browser behavior, and Avanza behavior.

## 2. Current classification inventory

Module:

- `lib/broker-result-source-classification.ts`

Classifications:

- `preview_only`
- `dev_fixture`
- `mock_broker`
- `dry_run`
- `local_diagnostics`
- `broker_confirmed`
- `production_safe_candidate`

Policy metadata:

- `BROKER_RESULT_SOURCE_CLASSIFICATIONS`
- `BrokerResultSourceClassification`
- `BrokerResultSourceCapabilityFlags`
- `BrokerResultSourceClassificationRule`
- `BrokerResultSourceClassificationMetadata`
- `BROKER_RESULT_SOURCE_CLASSIFICATION_RULES`
- `BrokerResultSourceClassificationRules`

Capability flags:

- `allowsCandidatePreview`
- `allowsExecutionRecordCreation`
- `allowsPersistence`
- `allowsTradeMutation`

Intended meaning:

- `preview_only`: BrokerExecutionResult-shaped preview/display output only.
- `dev_fixture`: controlled UI QA/dev fixture source.
- `mock_broker`: dev mock broker page/result source.
- `dry_run`: dry-run route/client/UI output.
- `local_diagnostics`: local bridge, agent, audit, or Settings diagnostics.
- `broker_confirmed`: future broker-originating sanitized evidence that passed
  confirmation evidence requirements.
- `production_safe_candidate`: future confirmed candidate that passed creation,
  persistence, schema, security, idempotency, and duplicate gates.

Current usage:

- The module is currently standalone contract metadata.
- It is not wired into validators, builders, routes, UI, persistence, or trade
  mutation.

## 3. Boundary verification

Type-only/constants-only:

- The module exports literal arrays, union types, metadata types, and a policy
  rules constant.
- It contains no runtime validation, no side effects, and no helper functions.

No runtime validator:

- No classification validator was added.
- Existing validators were not changed to consume the rules.

No persistence:

- No Supabase read/write behavior was added.
- No execution-record insert behavior was added.
- No migration behavior was changed.

No trade mutation:

- `allowsTradeMutation` is false for every class.
- No trade open/close/sell/history/statistics mutation path was touched.

No conversion/capture behavior:

- No BrokerExecutionResult conversion logic was added.
- No broker confirmation capture logic was added.
- No Avanza/browser interaction was added.

No Supabase/audit/browser/Avanza behavior:

- The module imports nothing.
- It does not call Supabase, localStorage, audit append helpers, bridge clients,
  browser APIs, or Avanza-related runners.

## 4. Alignment with requirements spec

Source classes:

- The module matches the Action 449 requirements spec classes exactly:
  `preview_only`, `dev_fixture`, `mock_broker`, `dry_run`,
  `local_diagnostics`, `broker_confirmed`, and
  `production_safe_candidate`.

Candidate preview permissions:

- `preview_only`, `dev_fixture`, `mock_broker`, `broker_confirmed`, and
  `production_safe_candidate` allow candidate preview.
- `dry_run` and `local_diagnostics` do not allow candidate preview because they
  are route/diagnostic outputs, not broker-result candidate sources.

Execution record creation permissions:

- `preview_only`, `dev_fixture`, `mock_broker`, `dry_run`, and
  `local_diagnostics` are blocked.
- `broker_confirmed` and `production_safe_candidate` are marked creation-
  capable for future validation work.
- This does not create a record and does not bypass existing validators.

Persistence permissions:

- `preview_only`, `dev_fixture`, `mock_broker`, `dry_run`,
  `local_diagnostics`, and `broker_confirmed` are persistence-blocked.
- `production_safe_candidate` is the only persistence-capable class.
- This is future policy metadata only; no write path was added.

Trade mutation permissions:

- `allowsTradeMutation` is false for every class.
- This matches the requirements spec: trade mutation remains a separate
  boundary even after broker confirmation or persistence eligibility.

Production-safe candidate meaning:

- `production_safe_candidate` means a future source passed source
  classification, confirmation requirements, conversion validation, creation
  validation, persistence validation, schema/security readiness, duplicate
  checks, and idempotency gates.
- The module does not decide or assign this class at runtime.

## 5. Policy gaps and open questions

When `production_safe_candidate` can be assigned:

- Requires a future validator.
- Requires confirmed broker-originating evidence.
- Requires schema/RLS/user/account readiness.
- Requires duplicate lookup and idempotency proof.
- Requires server-only persistence approval.

What validator should enforce later:

- source classification from explicit metadata.
- preview/dev/mock/dry-run/local diagnostics rejection.
- broker-confirmed evidence requirements.
- provenance/evidence fingerprint requirements.
- production-safe candidate prerequisites.
- no trade mutation coupling.

Whether `broker_confirmed` should ever be creation-eligible:

- The current metadata marks it creation-capable but persistence-blocked.
- This is reasonable for future candidate creation only.
- A later reassessment should confirm whether creation-capable should mean
  "candidate builder may run" or a stricter "record creation may proceed".

How source metadata links to provenance/evidence:

- `BrokerResultSourceClassificationMetadata` includes optional source
  environment, provenance label, evidence fingerprint, capture id, request id,
  broker order id, and broker confirmation id.
- It does not yet define required fields per classification.
- A future evidence contract should define required provenance fields.

How to prevent policy metadata from being mistaken for enforcement:

- The module comment explicitly says the constants do not enforce validation,
  persistence, capture, conversion, or trade mutation behavior.
- Docs should continue to state that runtime enforcement requires a future
  validator.
- UI and routes should not infer write eligibility from these constants alone.

## 6. Candidate next actions

A. Create Broker Result Source Classification Validator

- highest immediate follow-up if the next step is implementation-adjacent.
- would turn the metadata into pure deterministic checks.
- should remain no-write/no-capture/no-conversion.
- risk: validator semantics must be careful not to imply persistence readiness.

B. Create Avanza Broker Confirmation Evidence Contract

- strong next step because classification metadata needs typed evidence to
  become useful.
- can remain contract-only and define required Avanza evidence/provenance
  fields.
- lower risk than validator enforcement if evidence fields are still unsettled.

C. Reassess Avanza Broker Confirmation Capture Readiness

- useful but closer to Avanza/browser behavior.
- should wait until evidence contract and source classification validator are
  clearer.

D. Create BrokerExecutionResult Confirmation Validator Design

- useful design step before validator implementation.
- should follow either a classification validator or evidence contract.

## 7. Recommended next action

**Action 452 - Create Broker Result Source Classification Validator**

## Action 452 Follow-Up

Action 452 created `lib/broker-result-source-classification-validator.ts`.

Result:

- Added a pure deterministic `validateBrokerResultSourceForUsage(...)`
  validator.
- Validator uses `BROKER_RESULT_SOURCE_CLASSIFICATION_RULES` policy metadata.
- Validator supports intended usages:
  - `candidate_preview`
  - `execution_record_creation`
  - `persistence`
  - `trade_mutation`
- Unsafe sources are rejected for persistence and trade mutation.
- `broker_confirmed` remains rejected for persistence.
- `production_safe_candidate` is policy-allowed for persistence but receives
  warnings that this does not enable writes and still requires a server write
  boundary.
- Unknown/unsupported source classifications reject conservatively.

Boundary:

- No runtime wiring was added.
- No persistence, conversion, capture, Supabase, audit append, trade mutation,
  browser, or Avanza behavior was added.

Next recommended action:

**Action 453 - Reassess Broker Result Source Classification Validator**

Rationale:

- the source classification types are now stable and conservative.
- a pure validator can enforce obvious no-write source gates without touching
  capture, conversion, persistence, Supabase, browser, Avanza, or trade
  mutation behavior.
- the validator should remain deterministic and return classification metadata
  only, not create broker results or records.

## 8. Risk assessment

Policy mistaken for enforcement risk:

- medium/high. Constants are easy to import and misuse as proof of eligibility.
  A future validator should make enforcement explicit.

Over-permissive source classification risk:

- medium. `broker_confirmed` allows future creation but not persistence. Future
  validators must keep that distinction.

Preview mistaken for confirmed risk:

- high. Preview-shaped objects can resemble broker results. The classification
  validator must block `preview_only` sources.

Dev fixture persistence risk:

- high. Dev fixtures can produce eligible-looking candidates but must remain
  blocked from persistence.

Trade mutation coupling risk:

- high. Trade mutation is false for all classes and must remain a separate
  boundary.

Provenance gap risk:

- medium/high. The metadata type allows provenance fields but does not require
  them. Future evidence contracts and validators must define required fields.

## 9. Verification

Verification for this documentation-only reassessment:

- `git diff --check`

No runtime code changes were made. No validator, conversion/capture behavior,
persistence/write behavior, Supabase behavior, audit append, trade mutation,
broker/browser behavior, or Avanza behavior was added.

## Action 453 Follow-Up

Action 453 created
`docs/broker-result-source-classification-validator-reassessment.md`.

Result:

- Verified `validateBrokerResultSourceForUsage(...)` remains pure,
  deterministic, and policy-only.
- Confirmed unsafe sources remain rejected for persistence.
- Confirmed trade mutation remains rejected for every current source class.
- Confirmed `broker_confirmed` is not persistence-capable.
- Confirmed `production_safe_candidate` is only a policy allowance and does
  not imply Supabase writes, audit append, trade mutation, or runtime
  persistence.
- Documented remaining gaps before broker confirmation enforcement.

Next recommended action:

**Action 454 - Create Avanza Broker Confirmation Evidence Contract**
