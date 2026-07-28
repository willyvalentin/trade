# Action 667M.5C.3 — Existing calibration job terminal reconciliation

The existing M.5C.2 calibration job was reused and returned terminal status
`done` on the first read-only job-detail call. No new job, retry, cancellation,
file inventory, or download was performed.

## Status

- `action_667m5c3_existing_job_reused: true`
- `action_667m5c3_terminal_status_reconciled: true`
- `action_667m5c3_batch_terminal_ready: true`
- `action_667m5c3_actual_cost_within_cap: true`
- `action_667m5d_support_file_gate_ready: true`
- `new_batch_submissions: 0`
- `support_files_downloaded: 0`
- `market_data_files_downloaded: 0`
- `download_authorized: false`
- `normalization_authorized: false`
- `replay_authorized: false`
- `canonical_binding_ready: false`

M.5D readiness means only that a separate operator decision may authorize a
support-file gate. It does not authorize `list_files` or any download.

## Control and scope

The owner-only control file remained `0600`; the calibration, raw, and control
directories remained `0700`. Its exact schema, M.5C.2 control version,
submission state, job-identity hash binding, and scope digest were verified
before the provider call. The real job identity was used only in process
memory and was not written to this evidence.

The provider job details matched `EQUS.MINI`, `trades`, DBN with Zstandard,
all thirteen symbols, and
`[2026-06-26T00:00:00Z, 2026-07-20T00:00:00Z)`. Publisher 95 remains bound
through the frozen M.5C.2 preflight because job details do not expose a
separate publisher field.

## Terminal values

| Measure | Estimated | Actual | Result |
| --- | ---: | ---: | --- |
| Records | 1,903,887 | 1,903,887 | exact |
| Billable bytes | 91,386,576 | 91,386,576 | exact and below 128 MiB |
| Cost, USD | 0.510662287474 | 0.51066228747368 | below USD 0.75 |
| Actual size | — | 91,386,576 bytes | recorded |
| Package size | — | 28,231,043 bytes | recorded |

The terminal timestamp was
`2026-07-27T22:10:21.039461000Z`, canonically
`1785190221039461000` Unix nanoseconds.

Package size is below the future 64 MiB compressed-transfer cap, but it is not
treated as a verified file inventory. That remains a separate support-file
admission.

## Provider and no-effect boundary

Exactly one `get_job_details` request was made. There were zero `list_jobs`,
`list_files`, metadata-estimate, submission, cancellation, or download calls.
No normalization, replay, database operation, canonical binding, commit, push,
PR, deploy, or live effect occurred.

Machine-readable evidence:
`docs/evidence/action-667m5c3-existing-calibration-job-terminal-reconciliation.json`

Evidence digest:
`1892b1991917249915da45a66a31e936574c8e88ddd4ae500a226490f9d9a61e`
