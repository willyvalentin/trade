# Execution Record Creation Dev Fixture Reassessment

## 1. Purpose

Reassess the execution record creation dev fixture added in Action 422. The
goal is to verify that the fixture remains dev-only, read-only, clearly labeled
as fixture data, and disconnected from production execution-record creation,
persistence, trade mutation, broker automation, and Avanza/browser behavior
before choosing the next safe execution-record step.

## 2. Current dev fixture inventory

Action 422 added
`lib/execution-record-creation-dev-fixture.ts`.

Fixture builder API:

- exports `EXECUTION_RECORD_CREATION_DEV_FIXTURE_SOURCE`.
- exports `ExecutionRecordCreationDevFixtureOptions`.
- exports `buildExecutionRecordCreationDevFixtureInput(...)`.
- returns an `ExecutionRecordCreationInput` only; it does not build, persist,
  store, or mutate anything by itself.

Metadata fields:

- `sourceEnvironment: "local_dev"`.
- `auditContext.createdBy: "dev_stub"`.
- deterministic fixture order, confirmation, source fingerprint, broker
  fingerprint, idempotency key, capture id, and request id.
- source broker result metadata includes `fixtureOnly: true`,
  `source: "execution_record_creation_dev_fixture"`,
  `noSupabaseWrite: true`, `noTradeMutation: true`, `noBrokerExecution: true`,
  and `noAvanzaAutomation: true`.
- the fixture intentionally does not set the validator-blocked synthetic/mock
  flags to true, because its purpose is to exercise the eligible preview
  branch without weakening the validator.

How it satisfies the validator/builder:

- supplies a filled source broker execution result shape.
- supplies broker order id, confirmation id, confirmation timestamp, positive
  quantity, positive price, expected instrument, expected action, idempotency
  key, source evidence fingerprint, and broker result fingerprint.
- uses the existing pure `buildExecutionRecordCandidate(...)` path, so
  `safeToPersist` remains false and no candidate is produced if validation
  becomes unsafe later.

Dev-gated preview wiring:

- `hooks/execution/useLatePhasePreviewState.ts` creates the fixture only inside
  the existing `executionDevToolsEnabled` preview path.
- the fixture is used only when a selected execution intent exists and there is
  no broker-result preview shape yet.
- once broker-result preview diagnostics exist, that preview source overrides
  the fixture display and remains blocked/rejected when it is preview-only.
- `app/trade-app.tsx` passes the preview result, source label, and source
  description into the existing handoff modal composition.
- `components/execution/ExecutionRecordCreationPreview.tsx` labels fixture
  output as `Source: Dev fixture candidate` and displays the read-only/no-write
  copy.

E2E coverage:

- `tests/e2e/execution-sandbox.spec.ts` has pure builder coverage showing the
  dev fixture can produce an eligible candidate while `safeToPersist=false`.
- the handoff modal fixture test asserts the dev fixture candidate preview is
  visible before broker-result preview diagnostics exist.
- the same flow later asserts broker-result preview diagnostics override the
  fixture and show blocked/rejected preview-only metadata.
- the test continues to assert there is no execution/create/persist style
  action button in the modal.

## 3. Boundary verification

Dev-only:

- the fixture source is explicitly named
  `execution_record_creation_dev_fixture`.
- the fixture source environment is `local_dev`.
- the fixture is wired only through the existing execution dev-tools preview
  path.
- it is not connected to production scans, production broker confirmation, or
  execution-record persistence.

Read-only:

- the fixture module returns input data only.
- the preview component renders the pure builder result only.
- no button, route call, store append, persistence helper, or mutation helper
  is introduced by the fixture path.

Fixture-labeled:

- the preview displays `Source: Dev fixture candidate`.
- the preview source description states that the result is for read-only UI
  coverage only, is not broker evidence, and has no persistence or trade
  mutation.
- source broker metadata includes `fixtureOnly: true` and the fixture source
  identifier.

No persistence:

- no Supabase write was added.
- no localStorage write was added.
- no execution record storage was added.
- `safeToPersist=false` remains the displayed and returned state.

No trade mutation:

- no trade add, close, update, History, Statistics, position, or
  recommendation mutation path consumes the fixture candidate.

No audit append:

- no execution audit/event append path was added.
- fixture audit/source metadata is displayed only through the read-only result
  path.

No broker result creation:

- the fixture does not create a real `BrokerExecutionResult`.
- it creates contract input for preview QA only.
- preview-only broker-result diagnostics remain blocked/rejected and override
  the fixture display when present.

No browser/Avanza behavior:

- no bridge request was added.
- no browser action was added.
- no Avanza page, order form, confirmation capture, or broker automation path
  changed.

## 4. Preview limitations

- The fixture is not a real broker confirmation.
- The fixture is intentionally eligible only so the read-only UI can exercise
  the candidate display branch.
- The fixture should never be treated as production broker evidence.
- There is still no production confirmed broker result path.
- There is still no Supabase execution-record schema or write target.
- There is still no persisted idempotency lookup or duplicate-prevention
  constraint.
- There is still no trade association mutation or position/history update path.
- This is not automatic-mode ready.

## 5. Candidate next actions

A. Create Execution Record Persistence Boundary Plan

- Best next step.
- The contract, validator, builder, read-only preview, and dev fixture now make
  the pre-persistence boundary visible.
- Planning should define storage targets, idempotency lookup, duplicate
  behavior, audit ordering, failure handling, and explicit non-goals before
  any write path exists.

B. Create Supabase Execution Record Schema Plan

- Important, but slightly narrower than the persistence boundary plan.
- Needs table shape, unique constraints, RLS, migration strategy, idempotency
  fields, and write policy.
- Should follow or be nested inside the broader persistence boundary.

C. Reassess BrokerExecutionResult Confirmation Path

- Necessary before production-safe creation.
- Higher risk than planning because it touches confirmation evidence and
  source authenticity.

D. Reassess Avanza Broker Confirmation Capture Readiness

- Higher risk because it is close to real broker capture and browser-adjacent
  behavior.
- Should wait until persistence and confirmation boundaries are clearer.

E. Create execution-record candidate UI test fixtures only

- Low risk, but lower payoff now that Action 422 already covers the eligible
  and preview-only display branches.

## 6. Recommended next action

**Action 424 - Create Execution Record Persistence Boundary Plan**

## Action 424 Follow-Up

Action 424 created
`docs/execution-record-persistence-boundary-plan.md`.

Planning outcome:

- Defined prerequisites before any `ExecutionRecordCandidate` can be persisted.
- Proposed future persistence input/output concepts without implementing them.
- Documented Supabase schema, idempotency, duplicate protection, audit, and
  rollback needs.
- Explicitly separated execution-record persistence from trade mutation.
- Added safety gates that block preview-only, dev fixture, synthetic/mock,
  ambiguous, missing-idempotency, automatic-mode, and `safeToPersist=false`
  candidates.
- Added no persistence, Supabase write, localStorage write, audit append, trade
  mutation, broker result creation, bridge automation, Avanza/browser behavior,
  or runtime execution behavior.

Next recommended action:

**Action 425 - Reassess Supabase Execution Record Schema Boundary**

## Action 425 Follow-Up

Action 425 created
`docs/supabase-execution-record-schema-boundary-reassessment.md`.

Result:

- Confirmed no Supabase execution-record table exists today.
- Confirmed the Action 422 dev fixture remains pre-persistence and must be
  blocked by any future production persistence gate.
- Documented future schema and RLS requirements before any fixture, preview, or
  candidate can be persisted.
- Confirmed no migration, Supabase write, localStorage write, audit append,
  trade mutation, broker result creation, bridge automation, Avanza/browser
  behavior, or runtime behavior was added.

Next recommended action:

**Action 426 - Create Supabase Execution Record Schema Plan**

Recommended scope:

- document where execution records could be persisted later.
- define idempotency and duplicate rules before any write path is implemented.
- define Supabase schema needs at the boundary level.
- define audit/event ordering and rollback/error policy.
- keep all work documentation-only; do not add persistence, Supabase writes,
  localStorage writes, audit append, trade mutation, broker result creation, or
  browser/Avanza behavior.

## 7. Risk assessment

Fixture mistaken for production risk:

- medium. The UI and metadata are explicit, but the fixture intentionally
  satisfies validator requirements. Future work must preserve the
  fixture-only labels and avoid using it as broker evidence.

False eligibility risk:

- medium. The fixture proves the eligible branch renders; it does not prove a
  real broker confirmation path is eligible.

Spoofed broker result risk:

- high for future production work until confirmed broker result authenticity is
  reassessed and enforced.

Idempotency gap risk:

- high for real persistence because there is no persisted duplicate lookup or
  database uniqueness policy yet.

Supabase schema gap risk:

- high because no execution-record table, migration, RLS policy, or write
  target exists.

Trade mutation coupling risk:

- high if future record creation is bundled with opening/closing positions or
  history/statistics updates.

E2E coverage reliance:

- medium. Current e2e coverage confirms the dev fixture candidate branch and
  preview-only rejection branch, but it does not cover a real production
  broker confirmation path.

## 8. Verification

Verification for this documentation-only reassessment:

- `git diff --check`

No runtime code changes were made.
