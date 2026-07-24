# Execution Record Audit Writer Dev Preview UI Boundary Decision

## 1. Purpose

Action 803 resolves the UI boundary decision for displaying audit writer dry-run preview diagnostics in development.

This action does not implement an audit writer, add a route, approve a write path, append audit rows, call Supabase, use service-role credentials, or add production behavior.

## 2. Current Preview State

Action 802 created a fixture-only preview adapter:

- `lib/execution-record-audit-writer-dry-run-dev-preview-fixture.ts`
- `tests/e2e/execution-record-audit-writer-dry-run-dev-preview.spec.ts`
- `docs/execution-record-audit-writer-dry-run-dev-preview.md`

The preview fixture data is read-only and includes:

- `wouldWrite: false`
- `notWritten: true`
- `approvalImplied: false`
- `ready`, `validation_failed`, and `blocked` states
- sanitized payload/evidence/provenance summaries
- visible `Fixture only`, `No write performed`, and `Writer blocked` labels

The server-only preview adapter remains at `lib/server/execution-record-audit-writer-dry-run-preview.ts` and must not be imported into client components.

## 3. Existing UI/Diagnostics Inventory

Files inspected:

- `app/trade-app.tsx`
- `components/execution/ExecutionHandoffModalComposition.tsx`
- `components/execution/ExecutionRecordPersistenceValidatorIntegrationPreview.tsx`
- `components/execution/ExecutionRecordCandidateBuilderIntegrationPreview.tsx`
- `components/execution/ExecutionRecordCandidateBuilderInvocationPreview.tsx`
- `components/execution/FinalizationExecutionRecordBridgePreview.tsx`
- `lib/execution-record-audit-writer-dry-run-dev-preview-fixture.ts`
- `lib/server/execution-record-audit-writer-dry-run-preview.ts`

Inventory findings:

- `app/trade-app.tsx` starts with `use client`; anything imported through the active app shell must be client-safe.
- `ExecutionHandoffModalComposition.tsx` is a React composition layer for many diagnostics preview components and is used by the client app shell.
- Existing preview components use serializable fixture/result props and type imports from non-server fixture modules.
- `ExecutionRecordPersistenceValidatorIntegrationPreview.tsx` contains audit diagnostics sections, but it is not currently imported by the composition/app path found in this action.
- The existing preview pattern can display static fixture data later, but any UI integration must avoid server-only imports and runtime route/data calls.
- No existing server-rendered diagnostics boundary was found that is already wired and proven safe for importing the server-only preview adapter.

## 4. Boundary Options

### A. Server-rendered diagnostics imports server-only preview builder

Decision: not selected for this action.

Risks:

- No existing server-rendered diagnostics boundary was found.
- The active app shell is client-side.
- Adding a server boundary could become route/runtime work.

Requirements before use:

- A proven server-rendered diagnostics boundary.
- Static fixture or server-only preview data passed as serialized props.
- No route calls, no Supabase calls, no env reads, and no write authority.

### B. Client diagnostics imports static serializable fixture only

Decision: selected as the safest future path.

Why allowed later:

- The Action 802 fixture module has no `server-only` import.
- It has no Supabase client import.
- It has no env read.
- It has no route call.
- It has no storage write.
- It exports static serializable display data only.

Requirements:

- Import only `lib/execution-record-audit-writer-dry-run-dev-preview-fixture.ts`.
- Do not import `lib/server/*`.
- Render labels that clearly say fixture-only and no-write.
- Render no write/submit/append/send/run-writer controls.

### C. Dev-only API route supplies preview data

Decision: not allowed for this action and not recommended next.

Risks:

- Adds route surface area.
- Can be mistaken for runtime behavior.
- Requires separate auth and route-boundary proof.

Requirements before consideration:

- Explicit route/auth boundary approval.
- Separate tests proving no Supabase, service-role, write, or route-to-writer behavior.

### D. Keep docs/test-only preview, no UI wiring

Decision: allowed fallback, but not the preferred next step now that a safe static fixture path exists.

Benefits:

- Lowest runtime risk.
- Already covered by Action 802 tests.

Limitations:

- Does not provide in-app visual diagnostics.

### E. Inline preview into production UI

Decision: not allowed.

Risks:

- Could imply production readiness.
- Could confuse fixture data with runtime audit state.
- Could introduce unwanted user-facing workflow changes.

Requirements:

- None for this trail; this option remains rejected.

## 5. Recommended Boundary

Recommended boundary: client diagnostics may later import the static serializable fixture only.

The later UI action should:

- create or use a client-safe diagnostics component
- import only the Action 802 fixture module
- avoid `lib/server/*`
- avoid Supabase clients
- avoid env reads
- avoid routes and route calls
- avoid localStorage/sessionStorage writes
- avoid any write/submit/append/send/run-writer control
- keep the preview visibly fixture-only and no-write

No UI wiring was added in Action 803.

## 6. Required Safeguards For Future UI Wiring

Future fixture-only UI wiring must verify:

- no server-only imports in the client bundle
- no Supabase client
- no env read
- no route calls
- no write/submit/append/send/run-writer control
- no localStorage/sessionStorage writes
- no broker/Avanza/automatic references
- `Fixture only` label is visible
- `No write performed` label is visible
- `Writer blocked` label is visible
- `wouldWrite: false` is displayed
- `notWritten: true` is displayed
- `approvalImplied: false` is displayed
- no sensitive payload dumps are rendered

## 7. Result Status

Status: `audit_writer_dev_preview_ui_boundary_safe_fixture_path_selected`.

Server-only UI wiring remains blocked. Fixture-only client diagnostics are selected as the safe future path.

## 8. Recommended Next Action

Action 804 - Add Fixture-Only Audit Writer Dev Preview UI.

## Action 804 - Writer Skeleton Follow-Up

- Created `lib/server/execution-record-audit-writer.ts` as a server-only write-blocked implementation skeleton.
- The UI boundary decision remains valid: client UI must still use only static fixture data and must not import the server-only skeleton.
- The skeleton composes validation and dry-run and returns blocked dry-run-only results; it does not write or expose UI behavior.
- No UI wiring, route, route call, Supabase client, env read, service-role code, runtime write path, audit append, live writer implementation, broker/Avanza behavior, or automatic mode was added.
- Status: `audit_writer_implementation_skeleton_created_write_blocked`.
- Recommended next action: Action 805 - Prove Audit Writer Service-Role Env Readiness.

## 9. Remaining Blockers

- Audit writer implementation skeleton.
- Audit writer dry-run execution tests.
- Service-role env proof.
- Route/auth proof.
- Audit route/write path.
- Production insert route/write path.
- Fixture-only UI wiring remains future work.
- Server-only preview adapter UI wiring remains blocked.

## 10. Safety Boundaries

- UI boundary decision is not writer implementation.
- UI boundary decision is not route implementation.
- UI boundary decision is not write-path approval.
- UI boundary decision is not audit append approval.
- UI boundary decision is not server-only service-role env proof.
- Downstream behavior remains unauthorized.
- Broker/Avanza/automatic behavior remains unauthorized.

## 11. Validation

Required validation for this documentation-only boundary decision:

- existing dev preview fixture spec
- preview adapter test
- dry-run test
- validation helper test
- contract test
- runtime denial harness import check
- dev preview client/runtime import search
- `NEXT_PUBLIC_*SERVICE*` exposure search
- preview/dev UI/test env/client/write search
- `git diff --check`
- `find docs -type f -size 0`
- `./node_modules/.bin/tsc --noEmit`
- `npm run lint`
