# Execution Record Insert Dry-Run UI Preview Design

## 1. Purpose

Define a future read-only UI preview for the execution record insert dry-run
route before wiring any UI. The preview should let a dev-gated/sandbox user
inspect the typed dry-run route result while making it unmistakable that no
record was persisted and no trade, audit, broker, Supabase, or browser action
occurred.

This action is documentation/design only. It adds no runtime code, refactor,
behavior change, UI wiring, route/client invocation from UI, Supabase
read/write, localStorage access, audit append, trade mutation, execution
record storage, broker result creation, Avanza/browser behavior, or
automatic-mode behavior.

## 2. Scope

Future UI should:

- be dev-gated/sandbox-only.
- call the dry-run client helper only.
- show the typed `ExecutionRecordInsertRouteResponse`.
- show no-write/no-mutation safety metadata.
- show rejection, duplicate, needs-review, error, or eligible dry-run status.
- never show a persist, save, create, or insert button.
- never imply a real record was created.
- preserve the existing dry-run client helper boundary.
- preserve the existing dry-run route boundary.

Future UI should not:

- call production insert behavior.
- call Supabase directly.
- mutate trades, positions, recommendations, History, or Statistics.
- append audit events.
- create broker results.
- control browser/Avanza behavior.
- enable automatic mode.

## 3. Placement

Candidate placements:

A. Existing execution handoff modal late phase preview

- closest to the current read-only execution-record creation preview.
- already dev-gated and already communicates staged execution diagnostics.
- has access to the existing late-phase preview state and selected execution
  intent context.
- best place to compare creation-preview output with route dry-run output.

B. Execution sandbox/dev diagnostics area

- safe and clearly development-focused.
- less contextual because it is farther from the execution handoff flow and
  selected intent/candidate details.

C. Separate collapsible section

- useful as a UI pattern inside either A or B.
- should be used to reduce visual noise and keep the route dry-run preview
  below creation/broker preview diagnostics.

Recommended placement:

- place the future preview in the existing execution handoff modal late-phase
  preview area, as a separate collapsible/read-only section after the existing
  `ExecutionRecordCreationPreview`.
- keep it visible only when execution dev tools are enabled.
- keep it disabled/unavailable until a valid dry-run route request can be
  built from safe dev/sandbox inputs.

Rationale:

- the handoff modal already owns the safest nearby execution-record preview
  context.
- keeping the route dry-run preview adjacent to creation preview makes it
  easier to understand the difference between candidate building and route
  dry-run validation.
- a separate section prevents users from mistaking candidate availability for
  persisted record creation.

## 4. Inputs

Potential input source:

- use the existing execution-record creation preview result as the starting
  point only when it produces a safe candidate for dry-run diagnostics.
- prefer the controlled dev fixture candidate for the first UI implementation.
- do not use preview-only broker-result diagnostics as eligible persistence
  inputs.
- do not fabricate production-looking broker confirmation input.

Initial input recommendation:

- use dev fixture candidate data only for the first UI preview.
- label the input as `Dev fixture / sandbox only`.
- build an `ExecutionRecordInsertRouteRequest` with:
  - `mode: "dry_run"`.
  - `dryRun: true`.
  - persistence input built from already-derived candidate fields.
  - explicit safety checklist.
  - no-write audit metadata.
  - schema reference marked as planned/dry-run only.

Missing input behavior:

- show a disabled state instead of calling the helper.
- copy: `Dry-run route preview unavailable: no eligible sandbox execution record request is available.`
- do not auto-build from unsafe or preview-only data.

Preview-only input behavior:

- show blocked/rejected state.
- copy should explain that preview-only broker data cannot be used for future
  persistence validation.

## 5. Output display

Planned read-only fields:

- route status.
- HTTP/client outcome if available.
- validation/rejection reasons.
- warnings.
- duplicate simulation metadata:
  - match type.
  - simulated existing record id.
  - conflict review flag.
- idempotency key.
- record fingerprint.
- source fingerprint if present.
- route path.
- evaluated timestamp.
- safety metadata:
  - `dryRun=true`.
  - `wroteToSupabase=false` or `supabaseWriteAttempted=false`.
  - `mutatedTrade=false` or `tradeMutationAttempted=false`.
  - `appendedAudit=false` or `auditAppendAttempted=false`.
  - `insertAttempted=false`.
- no persisted record id.
- errors from helper fallback responses.

Status display guidance:

- `dry_run`: show as a successful dry-run only, not a successful insert.
- `rejected`: show rejection reasons and no-write metadata.
- `duplicate`: show as simulated/route dry-run duplicate metadata only.
- `needs_review`: show manual review language and no-write metadata.
- `error`: show helper/route error with no-write metadata.

## 6. User copy / safety labels

Required labels:

- `Dry-run only`.
- `No Supabase write`.
- `No trade mutation`.
- `No audit append`.
- `No record persisted`.
- `Dev fixture / sandbox only` when the input is fixture-backed.

Suggested panel title:

- `Execution record insert dry-run preview`

Suggested body copy:

- `Read-only dry-run of the future insert route. This does not persist an execution record, write to Supabase, append audit events, or mutate trades.`

Suggested success copy:

- `Dry-run accepted. No execution record was created.`

Suggested rejected copy:

- `Dry-run rejected by validation. No execution record was created.`

Suggested duplicate copy:

- `Dry-run duplicate simulation. No database lookup was performed and no persisted record was returned.`

Suggested unavailable copy:

- `Dry-run route preview unavailable until a safe sandbox execution record request is available.`

Forbidden button/copy terms:

- `Persist`.
- `Save`.
- `Create record`.
- `Insert`.
- `Write`.
- `Commit`.

## 7. Interaction model

Recommended interaction:

- manual button click, not auto-run.
- button label: `Run dry-run preview`.
- button should be disabled when:
  - execution dev tools are disabled.
  - no safe sandbox request exists.
  - a dry-run request is already in flight.
  - the candidate source is preview-only or unsafe.

Why manual:

- avoids silent route calls.
- makes the diagnostic intent explicit.
- avoids giving the impression that persistence is part of the normal flow.

Loading state:

- button text: `Running dry-run preview...`.
- panel copy should continue to show `No persistence` labels.

Error state:

- show typed helper fallback response fields.
- copy: `Dry-run route preview failed safely. No write, mutation, or audit append occurred.`

Retry behavior:

- a retry may call the dry-run helper again.
- retry must not change state beyond the preview result.
- retry must not perform persistence or mutation.

## 8. Non-goals

- no persistence.
- no Supabase read/write.
- no audit append.
- no trade mutation.
- no production insert.
- no execution record storage.
- no migration application.
- no generated DB types.
- no production broker confirmation capture.
- no broker result creation.
- no Avanza/browser behavior.
- no automatic mode.
- no replacement for existing execution-record creation preview.

## 9. Test strategy

Future implementation should test:

- preview appears only when execution dev tools/dev-gated path is enabled.
- button/copy is dry-run only.
- no persist/create/save/insert button exists.
- disabled state appears when no safe request exists.
- eligible dry-run displays `status: "dry_run"` and no-write metadata.
- rejected input displays rejection reasons.
- duplicate simulation displays simulated duplicate metadata.
- network/helper fallback displays typed error/no-write metadata.
- preview-only source remains blocked.
- no Supabase write/read, audit append, trade mutation, broker result
  creation, or Avanza/browser behavior is triggered.

Expected future verification:

- `./node_modules/.bin/tsc --noEmit`.
- `npm run lint`.
- `git diff --check`.
- focused e2e coverage around the dev-gated modal preview.
- full `npm run test:e2e` when the sandbox/browser environment permits it.

## 10. Candidate next actions

A. Implement Read-Only Dry-Run Route UI Preview

- highest payoff after this design.
- safe if limited to dev-gated UI, manual dry-run button, helper call, and
  read-only result display.

B. Reassess BrokerExecutionResult Confirmation Path

- required before production persistence.
- higher risk than UI preview because it approaches trusted broker evidence.

C. Create Supabase Migration Application Checklist

- important before real insert.
- less immediate because dry-run UI does not require the table or migration.

## 11. Recommended next action

**Action 445 - Implement Read-Only Dry-Run Route UI Preview**

Rationale:

- the route, client helper, and UI design now define a narrow dev-gated path.
- implementation can remain read-only and manual.
- the UI should use existing preview conventions and avoid persistence
  language.
- real persistence, Supabase migration, broker confirmation, audit append, and
  trade mutation remain blocked.

## 12. Risk assessment

Dry-run mistaken for real persistence risk:

- high. The UI must make `No record persisted` visible near status and action
  controls.

Confusing button copy risk:

- high. The button must say `Run dry-run preview` or equivalent and must not
  use save/create/persist/insert wording.

Accidental production exposure risk:

- medium/high. Preview should stay behind execution dev tools or equivalent
  sandbox gating.

Network fallback confusion:

- medium. Fallback responses must be displayed as failed dry-run diagnostics,
  not route success.

False confidence risk:

- medium/high. A successful dry-run means contract validation only, not
  persistence readiness.

E2e coverage reliance:

- medium. Future UI wiring must include focused tests because the safety
  boundary depends heavily on visible copy and absent persist affordances.

## 13. Verification

Verification for this documentation-only design:

- `git diff --check`

No runtime code changes were made. No UI wiring, route/client invocation from
UI, Supabase read/write, localStorage, audit append, trade mutation, execution
record storage, broker result creation, Avanza/browser behavior, or
automatic-mode behavior was added.

## Action 445 Implementation Note

Action 445 implemented the read-only dry-run route UI preview from this design.

Implemented scope:

- Created `components/execution/ExecutionRecordInsertDryRunPreview.tsx`.
- Placed it in the existing execution handoff modal late-phase preview area as
  a dev-gated section immediately after the execution-record creation preview.
- Wired it to `requestExecutionRecordInsertDryRun(...)` through
  `useLatePhasePreviewState`.
- Kept the trigger copy as `Run dry-run preview`.
- Displayed route status, rejection reasons, warnings, validation errors,
  duplicate simulation metadata, idempotency/fingerprint values, and explicit
  no-write/no-mutation safety metadata.

Boundary preserved:

- No persist/save/create button was added.
- No Supabase read/write, localStorage, audit append, trade mutation,
  execution record storage, broker result creation, Avanza/browser behavior, or
  automatic-mode behavior was added.
- The preview remains dev-gated/read-only and uses the existing dry-run route
  client helper only.

Next recommended action:

**Action 446 - Reassess Read-Only Dry-Run Route UI Preview**

## Action 446 Follow-Up

Action 446 created
`docs/execution-record-insert-dry-run-ui-preview-reassessment.md`.

Result:

- Verified the Action 445 preview remains dev-gated, read-only, and dry-run
  only.
- Confirmed the only action is `Run dry-run preview`.
- Confirmed no persist/save/create button, Supabase/localStorage write, audit
  append, trade mutation, execution record storage, broker result creation,
  Avanza/browser behavior, or production insert behavior was added.
- Documented current e2e coverage and remaining blockers before real insert.

Next recommended action:

**Action 447 - Create Supabase Migration Application Checklist**
