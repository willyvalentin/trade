# Execution Record Audit Writer Runtime Persistence Cleanup/Backout Approval Request

## Action 891 Project Handoff Summary

Action 891 created
`docs/execution-record-audit-writer-runtime-persistence-project-handoff-summary.md`
as a documentation-only project handoff summary for the audit writer runtime
persistence track.

Status:
`audit_writer_runtime_persistence_project_handoff_summary_created`

Recommended next action: Action 892 - Resume Execution Lifecycle UX/State
Refactor Planning.

## Action 890 Cleanup/Backout Decision

Action 890 created
`docs/execution-record-audit-writer-runtime-persistence-cleanup-backout-decision.md`
as a documentation-only cleanup/backout decision record.

Decision: no cleanup/backout now; retain proof/smoke rows as audit evidence;
keep rollout state unchanged.

Status:
`audit_writer_runtime_persistence_cleanup_backout_decision_retain_proof_rows`

Recommended next action: Action 891 - Create Audit Writer Runtime Persistence
Project Handoff Summary.

## 1. Purpose

Action 889 requests explicit approval for optional cleanup/backout actions
related to audit writer runtime persistence proof data and rollout state.

This action is documentation-only. It does not perform cleanup, perform
backout, change rollout flags, delete/update rows, run a select/query/remote
SQL command, call the service-role adapter, run a live proof, run a live
insert, mutate data, add runtime invocation paths, run migrations, run type
generation, edit generated types, modify `.env.local`, or print service-role
values.

## 2. Current Rollout/Proof State

- Approved server-only rollout completed for the audit writer runtime
  persistence path.
- Post-rollout monitoring review exists at
  `docs/execution-record-audit-writer-runtime-persistence-post-rollout-monitoring-review.md`.
- Proof/smoke data exists from the controlled runtime proof chain.
- Audit event row id remains unconfirmed without a separately approved narrow
  select.
- No cleanup/backout is currently approved.

## 3. Possible Future Cleanup Scopes

- Proof/smoke row cleanup from `public.execution_record_audit_events`.
- Controlled execution record seed cleanup from `public.execution_records`.
- Narrow select/read to identify proof row ids.
- Rollout flag backout or disabling approval gates.
- Docs-only archival with no database cleanup.

## 4. Proposed Cleanup/Backout Options

| Option | Allowed operation | Risk | Prerequisites | Approval needed | Recommendation |
| --- | --- | --- | --- | --- | --- |
| Option A - no cleanup | Retain proof rows and rollout state. | Proof/smoke rows remain in staging. | None. | No database approval needed. | Recommended default. |
| Option B - narrow select-only proof row identification | Read only the minimum identifying fields needed to locate proof/smoke rows. | Could expose row metadata if scoped poorly. | Exact filters and fields; no broad dump. | Explicit read-only approval. | Recommended first step if cleanup is desired. |
| Option C - cleanup proof/smoke audit rows only | Delete exact pre-identified proof/smoke rows from `public.execution_record_audit_events`. | Loss of audit evidence; accidental deletion if ids are wrong. | Known row ids; max row count; reviewer confirmation. | Explicit delete approval. | Not recommended unless there is a clear cleanup reason. |
| Option D - cleanup controlled execution record seed only | Delete the controlled seed from `public.execution_records` only if safe. | FK constraints may block or evidence may be lost. | Known seed id; FK impact checked; no audit row dependency risk. | Explicit delete approval. | Not recommended before Option B and C decisions. |
| Option E - backout rollout flags/gates only | Revert or gate rollout metadata/approval flags. | Runtime audit persistence could stop for the approved server-only path. | Exact code/module targets and rollback rationale. | Explicit code-change approval. | Use only if monitoring indicates rollout should be disabled. |
| Option F - combined cleanup/backout sequence | Sequence narrow read, optional row cleanup, and optional flag/gate backout. | Highest operational complexity and evidence-loss risk. | Approved sequence, row ids, max counts, and rollback plan. | Explicit combined approval. | Not recommended by default. |

## 5. Recommended Default

Default recommendation:

- perform no cleanup by default;
- retain proof rows as audit evidence unless there is a clear reason to delete
  them;
- if cleanup is desired, start with a narrow select/read approval only;
- do not delete/update without known row ids and explicit approval.

## 6. Required Approval Fields

| Field | Required value |
| --- | --- |
| target project/ref/environment | Required |
| cleanup/backout option | Required |
| target table/module | Required |
| operation allowed | Required |
| max row count | Required for any data cleanup |
| select allowed yes/no | Required |
| delete allowed yes/no | Required |
| update allowed yes/no | Required |
| rollout flag changes allowed yes/no | Required |
| cleanup proof ids known yes/no | Required |
| rollback/backout reviewed yes/no | Required |
| approving operator | Required |
| approval timestamp | Required |
| verification reviewer | Required |
| exact approval statement | Required |

## 7. Exact Approval Statement Templates

### Template A - Narrow Proof Row Identification Only

"Approve Action 890A to perform one narrow read-only proof row identification
for audit writer proof/smoke data. Allowed scope: select only the minimum
identifying fields needed to locate proof rows related to the controlled audit
writer runtime proof, with no update/delete/upsert/insert, no broad table dump,
no service-role value exposure, no UI/browser/client invocation, no
market/scanner invocation, and no production rollout change."

### Template B - Proof Row Cleanup

"Approve Action 890B to delete explicitly identified proof/smoke audit rows
only. Allowed scope: delete only the exact pre-identified proof/smoke row ids
from public.execution_record_audit_events, with max row count explicitly
stated, no broad delete, no update/upsert/insert, no UI/browser/client
invocation, no market/scanner invocation, no service-role value exposure, and
no rollout flag change."

### Template C - Rollout Flag Backout

"Approve Action 890C to back out the audit writer runtime persistence rollout
flags/gates only. Allowed scope: disable the approved server-only audit writer
runtime persistence rollout path by reverting or gating
productionRolloutApproved / productionRolloutApproval, with no database
mutation, no proof row cleanup, no UI/browser/client invocation, no
market/scanner invocation, no broker/Avanza behavior, and no automatic mode."

## 8. Decision

Approval is absent.

Status:
`audit_writer_runtime_persistence_cleanup_backout_approval_requested_blocked`

Next action: Action 890 - Decide Cleanup/Backout Path.

If a specific approval is later present, the status and next action depend on
the selected option:

- `audit_writer_cleanup_narrow_read_approval_recorded` - Action 890A:
  Identify Proof Rows With Narrow Read;
- `audit_writer_proof_row_cleanup_approval_recorded` - Action 890B: Delete
  Approved Proof Rows;
- `audit_writer_rollout_backout_approval_recorded` - Action 890C: Back Out
  Runtime Persistence Rollout Flags.

## 9. Safety Boundaries

- This approval request is not cleanup execution.
- This approval request is not database operation approval by itself.
- This approval request is not rollout change approval by itself.
- This approval request is not UI/browser approval.
- This approval request is not market/scanner approval.
- Broker/Avanza/automatic behavior remains unauthorized.
- The semi-auto model remains intact.

## 10. Validation

Required validation for Action 889:

- runtime denial harness import check;
- runtime writer/adapter/mock/fixture/harness/production caller/lifecycle
  hook/lifecycle caller/transition boundary/proof harness/monitoring import
  search;
- route invocation search;
- UI import/search for route invocation, lifecycle hook, lifecycle caller,
  transition boundary, proof harnesses, monitoring, cleanup, and rollout terms;
- market-loop/scanner import search;
- `NEXT_PUBLIC_*SERVICE*` exposure search;
- service-role leakage search;
- broad env/client/write scan;
- `git diff --check`;
- touched-file trailing whitespace scan;
- `find docs -type f -size 0`;
- `./node_modules/.bin/tsc --noEmit`;
- `npm run lint`.
