# Execution Record Creation Preview UI Reassessment

## 1. Purpose

Reassess the read-only execution record creation preview UI added in Action
420. The goal is to verify that the preview stayed dev-gated, display-only,
and disconnected from persistence, trade mutation, broker automation, and
execution behavior before choosing the next execution-record step.

## 2. Current preview UI inventory

Action 420 added
`components/execution/ExecutionRecordCreationPreview.tsx`.

Component props/display:

- accepts `ExecutionRecordCreationResult | null`.
- renders status, eligibility, `safeToPersist`, candidate presence,
  idempotency key, record fingerprint, no-Supabase metadata, and no-trade
  mutation metadata.
- renders candidate fields when `recordCandidate` is present, including record
  id, broker, side, ticker, quantity, price, currency, phase, confirmation
  timestamp, broker order id, recommendation id, and position id.
- renders rejection reasons and warnings as read-only lists.
- includes explicit read-only copy: no persistence, no Supabase write, no audit
  append, no trade mutation, and no execution record storage.

Hook integration:

- `hooks/execution/useLatePhasePreviewState.ts` derives
  `executionRecordCreationPreviewResult` with `useMemo`.
- the hook uses `buildExecutionRecordCandidate(...)`, which first runs the pure
  validator.
- the source input is built only from already-present
  `localhostBrokerExecutionPreviewShape` data and selected execution intent
  metadata.
- when there is no broker-result preview shape, the result is `null`.
- the integration is gated by `executionDevToolsEnabled`.

Modal composition integration:

- `components/execution/ExecutionHandoffModalComposition.tsx` receives
  `executionRecordCreationPreviewProps`.
- the panel renders only inside the existing `executionDevToolsEnabled` block.
- `app/trade-app.tsx` passes the derived result into the modal composition.

E2E coverage:

- `tests/e2e/execution-sandbox.spec.ts` now asserts the handoff modal displays
  `Execution record creation preview` after the broker-result preview stub.
- the test confirms preview-only sources show blocked creation metadata.
- the test checks the `Safe to persist` row is visible.
- existing no-action button checks still assert there are no controls for
  creating, persisting, running, or executing records.

## 3. Boundary verification

Read-only only:

- the preview component has no buttons.
- it receives a precomputed result and renders values only.
- it does not call routes, stores, state setters, or mutation helpers.

No persistence:

- no Supabase write was added.
- no localStorage write was added.
- no execution record store append was added.
- no persistence function is imported by the preview component.

No trade mutation:

- no trade add/close/update path was touched.
- no History or Statistics mutation path was added.
- no execution-record candidate is used to mutate positions.

No audit append:

- no execution audit/event append path was added.
- audit metadata is displayed as part of the result only.

No `BrokerExecutionResult` creation:

- the preview uses existing broker-result preview-shaped data.
- it does not create a real `BrokerExecutionResult`.
- preview-only metadata remains visible and blocks creation.

No bridge/browser/Avanza behavior:

- no bridge request was added.
- no browser action was added.
- no Avanza page, order form, or confirmation behavior changed.

No automatic mode behavior:

- automatic mode remains rejected by the validator/builder path.
- the preview does not add an automatic-mode override.

`safeToPersist=false`:

- Action 419 kept candidate builder results conservative.
- Action 420 displays the `Safe to persist` value.
- no persistence boundary exists, so the preview must continue treating
  candidates as not safe to persist.

## 4. Preview limitations

- The current UI uses existing broker-result preview data, not a real confirmed
  broker result.
- The normal source is preview-only and therefore rejected/blocked by the
  creation validator.
- There is no real confirmed broker result path yet.
- There is no Supabase execution-record schema or write target yet.
- There is no persisted idempotency lookup for execution-record creation.
- There is no duplicate check against a production execution-record table.
- There is no trade association mutation path and no position/history update
  path.
- The preview can show candidate fields only when given an eligible creation
  result; the existing live modal path should not fabricate that eligibility
  from preview-only data.

## 5. Candidate next actions

A. Create Execution Record Creation Result Fixture/Dev Input for eligible
candidate preview

- Safest next step.
- Allows the UI to show the eligible/candidate branch without pretending the
  existing broker-result preview is a real confirmed broker result.
- Can stay test/dev-only and preserve `safeToPersist=false`.

B. Create Execution Record Persistence Boundary Plan

- Useful soon, but lower safety until the preview can display both eligible
  and rejected branches clearly.
- Must define storage targets, idempotency lookup, duplicate behavior, audit
  append ordering, and rollback/error policy.

C. Create Supabase Execution Record Schema Plan

- Important but not the immediate next runtime step.
- Requires schema ownership, RLS, migrations, idempotency constraints, and
  production write policy.

D. Reassess BrokerExecutionResult Confirmation Path

- Needed before real creation, but higher risk because it touches broker
  confirmation evidence and source authenticity.

E. Reassess Avanza Broker Confirmation Capture Readiness

- Highest risk among these candidates because it gets closer to real broker
  capture and execution-adjacent behavior.

## 6. Recommended next action

**Action 422 - Create Execution Record Creation Result Fixture/Dev Input**

Recommended scope:

- create a dev/test-only fixture or helper input that produces an eligible
  `ExecutionRecordCreationResult` for preview coverage.
- do not use the fixture as production evidence.
- do not add persistence or mutation.
- keep `safeToPersist=false`.
- use it only to validate display of the candidate branch and to support future
  read-only QA.

## 7. Risk assessment

Accidental persistence UI risk:

- low after Action 420 because the panel has no buttons, but future actions
  must avoid adding persist/create controls before a persistence boundary.

False eligibility risk:

- medium if preview-only broker-result-shaped data is mistaken for confirmed
  broker execution evidence.
- the current UI blocks preview-only sources and should keep doing so.

Spoofed broker result risk:

- medium/high until the confirmed broker result path and source evidence rules
  are formalized.

Idempotency gap risk:

- high for real persistence because there is no persisted duplicate lookup or
  idempotency constraint yet.

Supabase schema gap risk:

- high because no execution-record table/schema/write policy exists.

Trade mutation coupling risk:

- high if future record creation is bundled with opening/closing positions or
  History/Statistics changes.

E2E coverage reliance:

- medium. The handoff modal test confirms the read-only preview and blocked
  preview-only path, but eligible candidate display needs a dedicated dev
  fixture/input before UI coverage is complete.

## 8. Verification

Verification for this documentation-only reassessment:

- `git diff --check`

No runtime code changes were made.

## Action 422 Follow-Up

Action 422 created
`lib/execution-record-creation-dev-fixture.ts`.

Fixture outcome:

- Added an explicit dev-only fixture input builder for
  `ExecutionRecordCreationInput`.
- The fixture uses `sourceEnvironment: "local_dev"`, `createdBy: "dev_stub"`,
  deterministic fixture ids/fingerprints, and fixture-only source metadata.
- The fixture satisfies the pure validator/builder enough to produce an
  eligible `ExecutionRecordCandidate` for read-only UI coverage.
- The handoff preview uses the fixture only behind existing execution dev-tools
  gating and only when no broker-result preview shape is available.
- Once broker-result preview data exists, the preview-only source continues to
  show blocked/rejected creation metadata.
- The preview UI labels its source as either `Dev fixture candidate` or
  `Broker-result preview diagnostics`.
- `safeToPersist` remains false.
- No persistence, Supabase write, localStorage write, audit append, trade
  mutation, execution record storage, BrokerExecutionResult creation, bridge
  automation, Avanza/browser behavior, or automatic-mode behavior was added.

Next recommended action:

**Action 423 - Reassess Execution Record Creation Dev Fixture**

## Action 423 Follow-Up

Action 423 created
`docs/execution-record-creation-dev-fixture-reassessment.md`.

Reassessment outcome:

- Verified the Action 422 fixture is explicitly local/dev and fixture-labeled.
- Verified it is wired only through the existing execution-dev-tools handoff
  modal preview path.
- Verified it exists to exercise the eligible read-only candidate branch and
  keeps `safeToPersist=false`.
- Verified broker-result preview diagnostics still override the fixture and
  remain blocked/rejected when preview-only.
- Confirmed no persistence UI, Supabase write, localStorage write, audit
  append, trade mutation, BrokerExecutionResult creation, bridge automation,
  Avanza/browser behavior, or automatic-mode behavior was added.
- Documented the key limitation: fixture eligibility is not production broker
  confirmation evidence.

Next recommended action:

**Action 424 - Create Execution Record Persistence Boundary Plan**

## Action 424 Follow-Up

Action 424 created
`docs/execution-record-persistence-boundary-plan.md`.

Result:

- Documented the future persistence boundary that must exist after the
  read-only preview and dev fixture work.
- Confirmed the preview remains pre-persistence and `safeToPersist=false`.
- Defined future gates preventing preview-only and dev fixture candidates from
  being persisted.
- Confirmed no runtime persistence UI, write path, audit append, trade
  mutation, broker result creation, bridge automation, Avanza/browser behavior,
  or automatic-mode behavior was added.

Next recommended action:

**Action 425 - Reassess Supabase Execution Record Schema Boundary**
