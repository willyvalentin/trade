# Legacy Execution Cleanup Plan

Date: 2026-07-07

Scope: docs/dev-QA planning only. This plan does not remove files, change Trade UI, activate API routes, run smoke scripts, or open runtime gates.

## 1. Summary

Purpose: turn the findings from `docs/legacy-execution-surface-audit.md` into a safe, reviewable cleanup sequence.

Cleanup is planned before runtime smoke because the repo still contains legacy execution surfaces that can create confusion during review: stale edit-conflict files, old modal wording, browser-local diagnostic execution naming, gated audit writer routes, persistence flags, and smoke/bridge script boundaries. Cleaning or hardening these surfaces first reduces the chance that a future local-dev smoke run is misread as production readiness or order-submit authority.

Recommended cleanup order:

1. Remove stale edit-conflict artifacts.
2. Normalize legacy execution wording.
3. Rename/document local diagnostic execution records.
4. Harden execution audit writer route gates and persistence flag docs.
5. Add script import boundary tests. ✅
6. Add a legacy modal isolation checkpoint. ✅

Decision: plan cleanup first, then consider any runtime smoke work only after these cleanup/hardening tasks are reviewed. This is planning, not execution.

## 2. Cleanup Principles

- Prefer docs, rename, and isolation before runtime changes.
- Prefer removing stale artifacts before modifying active code.
- Avoid Trade UI changes unless separately approved.
- Keep user-facing UI minimal and recommendation cards simple.
- Preserve all runtime gates locked.
- Do not introduce active execution paths.
- Do not expand visible execution UI.
- Do not add handoff, prepare, buy/sell, final, submit, bridge, browser, credential, session, BankID, Supabase write, or production activation behavior.

## 3. Cleanup Inventory

| ID | Source finding | Type | Risk | Proposed action | Files likely affected | Requires code change | Requires UI change | Requires runtime gate | Recommended task | Acceptance check |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| LCP-001 | LES-026 stale `# Edit conflict` artifacts | cleanup | Medium | Remove or archive stale duplicate files after confirming they are not imported and contain no user-needed content. | `app/*# Edit conflict*`, `lib/*# Edit conflict*` | Yes, deletion only | No | No | Task 339 | `find app lib components -name '*Edit conflict*'` returns no stale artifacts, tests pass, `app/trade-app.tsx` unchanged. |
| LCP-002 | LES-001 and LES-003 old modal wording | cleanup | Medium | Replace confusing Avanza preparation and final-submit-authority copy with dev diagnostics / human-final wording. | `components/execution/execution-handoff-preview-modal.tsx`, `components/execution/FutureAgentRequestPreview.tsx`, related docs/tests | Yes | Yes, copy-only if approved | No | Task 340 | Static scan shows no copy implying final submit authority for the agent; no new controls added. |
| LCP-003 | LES-008, LES-009, LES-010 local diagnostic record naming | cleanup | Low | Document browser-local execution stores as diagnostic/mock-only; defer storage-key/type rename unless a future migration task approves it. | `lib/execution-record-store.ts`, `lib/execution-event-log.ts`, `lib/execution-local-storage-helpers.ts`, docs/tests | Docs only for Task 341 | No | No | Task 341 | `docs/local-diagnostic-execution-records-checkpoint.md` inventories the stores, terminology, deferred rename/migration work, and non-authoritative boundaries. |
| LCP-004 | LES-004 visible handoff language | cleanup | Low | Rename "View handoff" style language to "View plan" or isolate it from default product surfaces. | `components/execution/live-position-handoff-controls.tsx`, `components/live-day-trades/LiveExecutionStatusSurface.tsx`, docs/tests | Yes | Yes, copy-only if approved | No | Task 340 or 344 | Default UI remains simple; no active handoff button is introduced. |
| LCP-005 | LES-013 execution audit writer route | hardening | Medium | Add route-boundary checkpoint and hard-disabled route gate proving the route cannot call the writer by default and is not called by Trade UI. | `app/api/execution/audit/writer/route.ts`, tests, docs | Yes, hardening/tests/docs | No | No | Task 342 | Route remains hard-disabled, no writer call occurs, and no Trade UI fetch to route exists. |
| LCP-006 | LES-014 and LES-015 persistence flags | hardening | Medium | Document and test flag combinations that keep Supabase audit writes locked by default. | `lib/execution-persistence-flags.ts`, audit route docs/tests | Yes, wording/docs/tests preferred | No | No | Task 342 | Default env blocks persistence/writer and production allow remains false. |
| LCP-007 | LES-001, LES-005 legacy modal isolation | hardening | Medium | Created a checkpoint inventorying legacy modal/dev diagnostics and their isolation boundaries. | `docs/legacy-modal-isolation-checkpoint.md`, `components/execution/execution-handoff-preview-modal.tsx`, product-adjacent read-only surfaces | Docs only | No | No | Task 344 | Checkpoint inventories 27 surfaces, flags remain false, no new visible execution UI was added. |
| LCP-008 | LES-018 and LES-019 script import boundary | hardening | Medium | Added static tests proving smoke/bridge scripts are not imported by app runtime or callable from UI/API. | `tests/e2e/execution-script-import-boundary.spec.ts`, `docs/execution-script-import-boundary-tests-checkpoint.md`, `scripts/*` | Yes, tests/docs only | No | No | Task 343 | Boundary test passes; app/UI/API do not import restricted terminal scripts or expose process-spawn invocation. |

## 4. Recommended Task Split

### Task 339 - Remove Stale Edit-Conflict Artifacts

Remove or archive stale duplicate files matching `*# Edit conflict*` after verifying they are not imported and are not the canonical runtime source.

### Task 340 - Normalize Legacy Execution Wording

Update confusing legacy copy to clarify dev diagnostics, read-only preview, human-final confirmation, and no submit authority for the agent.

### Task 341 - Rename/Document Local Diagnostic Execution Records

Clarify browser-local execution stores as diagnostic/mock-only and avoid confusion with Supabase execution records. Prefer documentation over renaming because current type names and storage keys are already wired into tests and helper boundaries.

### Task 342 - Harden Execution Audit Writer Route Gates

Add route-boundary tests/docs for audit writer routes and Supabase persistence flags. Keep all writes disabled by default.

### Task 343 - Add Script Import Boundary Tests

Added static tests that terminal smoke scripts and localhost bridge scripts are not imported by app runtime and cannot be invoked from UI/API.

Completion checkpoint: `docs/execution-script-import-boundary-tests-checkpoint.md`.

Decision: `execution_script_import_boundary_tests_complete_with_warnings`.

Warnings remain because one isolated legacy local-dev runner library still contains `child_process` capability and one model/checkpoint library mentions restricted script paths as inventory text. Both are explicit allowlist entries in the new static test; no app, API, component, or Trade UI file is allowlisted to import or spawn restricted scripts.

### Task 344 - Legacy Modal Isolation Checkpoint

Documented legacy modal diagnostics and related preview/readiness/handoff surfaces behind their current boundaries. Avoided default Trade UI changes.

Completion checkpoint: `docs/legacy-modal-isolation-checkpoint.md`.

Decision: `legacy_modal_isolation_checkpoint_complete_with_warnings`.

Warnings remain because older modal/control/component names still contain execution and handoff terminology, and the legacy modal remains imported by Trade UI behind existing dev-tools checks. No blocker was found and no runtime path was activated.

## 5. First Cleanup Task Details

Recommended first task: Task 339 - Remove Stale Edit-Conflict Artifacts.

Why first:

- It is the lowest-runtime-risk cleanup.
- It reduces audit noise before touching active code.
- It avoids visual UI changes.
- It makes future `rg` scans more reliable.

How to find artifacts:

```bash
find app lib components -name '*Edit conflict*' -type f | sort
```

How to decide whether they can be removed:

- Confirm each file path is not the canonical import target.
- Confirm no active imports reference the exact filename.
- Confirm the canonical file exists, for example `app/trade-app.tsx`.
- Treat these as stale generated conflict artifacts unless user-specific content is identified.

How to avoid touching active runtime:

- Do not edit `app/trade-app.tsx`.
- Do not alter active imports.
- Do not change env flags.
- Delete or archive only the stale conflict artifact files.
- Run static validation after deletion.

Suggested validation:

- `git diff --check`
- `git diff -- .env.local --exit-code`
- `git diff -- app/trade-app.tsx --exit-code`
- `find docs -type f -size 0`
- `./node_modules/.bin/tsc --noEmit`
- `npm run lint`
- `find app lib components -name '*Edit conflict*' -type f`

Required final report:

- Files removed.
- Confirmation no active runtime file was edited.
- Confirmation no imports broke.
- Confirmation no gates opened.
- Validation results.

## 6. Hardening Task Details

### Execution Audit Writer Routes

Why needed: `/api/execution/audit/writer` and related audit persistence routes are gated, but their names and writer capability can be misread as production execution write approval.

Must not:

- Enable the route by default.
- Add Trade UI fetches.
- Enable Supabase writes.
- Add production readiness.

Safe effect:

- Clear docs/tests prove route calls are dev/auth/env gated and unavailable from default Trade UI.

Acceptance criteria:

- Default route state is blocked without gates.
- No Trade UI fetch/polling path exists.
- No Supabase write occurs in tests.

### Persistence Flags

Why needed: `EXECUTION_AUDIT_SUPABASE_PERSISTENCE_ENABLED`, `EXECUTION_AUDIT_SUPABASE_WRITER_ENABLED`, and production allow flags are powerful and should remain clearly locked.

Must not:

- Change `.env.local`.
- Turn on writer flags.
- Add runtime config.

Safe effect:

- Flag matrix documents default disabled behavior and production block.

Acceptance criteria:

- Default flag model blocks persistence/writer.
- Production writes remain blocked unless a separate explicit approval exists.

### Legacy Modal Isolation

Why needed: legacy modal diagnostics are large, visually complex, and include prepare/bridge language that can distract from Ture's simple product UI.

Must not:

- Add new visible execution UI.
- Add active prepare/handoff controls.
- Open Avanza/browser/bridge behavior.

Safe effect:

- Modal remains dev/diagnostic only, with clearer naming and isolated boundary.

Acceptance criteria:

- Default recommendation cards remain unchanged.
- No active handoff/prepare/buy/sell CTA is added.
- Copy emphasizes diagnostics and human-final confirmation.
- Task 344 added `docs/legacy-modal-isolation-checkpoint.md`, inventorying 27 modal/preview/handoff/readiness surfaces and confirming `ENABLE_READ_ONLY_SELECTED_RECOMMENDATION_PREVIEW = false` and `ENABLE_PASSIVE_TRADE_CARD_EXECUTION_READINESS_BADGE = false`.

### Script Import Boundary Tests

Why needed: terminal smoke scripts and bridge scripts must never become app-runtime imports.

Must not:

- Run smoke scripts.
- Import scripts in app/components/lib.
- Add UI/API invocation.

Safe effect:

- Static tests prevent accidental runtime import paths.

Acceptance criteria:

- Tests fail if app runtime imports terminal smoke scripts.
- Tests fail if UI/API invokes bridge scripts.
- Task 343 added `tests/e2e/execution-script-import-boundary.spec.ts`, which scans app/components/hooks/lib import specifiers and UI/API spawn-capability boundaries without importing or running scripts.

## 7. Gates and Non-Goals

Gate state remains:

| Gate | State |
| --- | --- |
| Invocation boundary | Locked |
| Local-dev bridge gate | Locked |
| Smoke runner invocation | Locked |
| Terminal script invocation | Locked |
| Browser automation | Locked |
| Credential access | Locked |
| Cookies/session | Forbidden |
| BankID automation | Forbidden |
| Order submission | Forbidden |
| Final KÖP/SÄLJ by agent | Forbidden |
| Supabase writes | Locked |
| Trade UI execution | Locked |
| API route activation | Locked |
| Production readiness | Blocked |

Non-goals:

- No local-dev smoke test.
- No browser automation.
- No Avanza login.
- No BankID handling.
- No order-prep runtime.
- No Supabase execution persistence.
- No new execution UI.

## 8. Validation Strategy

Use safe static validation for each cleanup task:

- `git diff --check`
- `git diff -- .env.local --exit-code`
- `git diff -- app/trade-app.tsx --exit-code` when the task does not intentionally touch Trade UI
- `find docs -type f -size 0`
- `./node_modules/.bin/tsc --noEmit`
- `npm run lint`

Use static `rg`/`find` checks for:

- `# Edit conflict`
- `handoff`
- `execution`
- `submit`
- `KÖP`
- `SÄLJ`
- `BankID`
- `cookie`
- `session`
- `credential`
- `browser`
- `bridge`
- `invocation`

Never use validation as a reason to run smoke scripts or open browser automation in cleanup tasks.

## 9. Cleanup Readiness Decision

Decision: `legacy_execution_cleanup_plan_ready_with_warnings`

Warnings:

- Cleanup may touch many stale artifacts, so Task 339 should be a deletion-only PR/task with careful file listing.
- Modal wording cleanup may touch visible UI copy, so it needs separate approval and screenshot/test review.
- Persistence hardening must stay docs/tests-first and must not enable any Supabase execution writes.

Next recommended task: Task 339 - Remove Stale Edit-Conflict Artifacts.

No runtime gate is opened by this plan. No smoke script is run or imported. No browser automation, credential access, cookie/session handling, BankID automation, order submission, final KÖP/SÄLJ, Supabase write, API route activation, Trade UI execution, or production readiness is introduced.
