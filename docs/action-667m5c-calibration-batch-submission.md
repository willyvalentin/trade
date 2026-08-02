# Action 667M.5C — Calibration batch submission

The run stopped fail-closed before any submission.

## Status

- `action_667m5c_pre_submission_admission_passed: false`
- `action_667m5c_batch_submitted: false`
- `action_667m5c_submission_scope_verified: false`
- `action_667m5c_batch_terminal_ready: false`
- `new_batch_submissions: 0`
- `support_files_downloaded: 0`
- `market_data_files_downloaded: 0`
- `download_authorized: false`
- `normalization_authorized: false`
- `replay_authorized: false`
- `canonical_binding_ready: false`

## Exact stopping point

The local M.5B evidence, scope, calendar, M.3D license evidence, M.4C
FileVault evidence, destination device, and free-space checks passed.

Three authenticated read-only calls then completed:

1. range-less `metadata.list_datasets`;
2. `metadata.list_schemas`;
3. `metadata.get_dataset_range`.

The run stopped while validating the returned entitlement range. Databento
returns explicit UTC instants with nine fractional digits. CPython 3.10.7's
`datetime.fromisoformat` rejected that nanosecond representation. The same
failure was reproduced offline without credential access or another provider
call.

This is a local parser incompatibility. No provider or scope drift was
identified.

## No-effect proof

The execution did not reach:

- publisher, condition, symbology, record-count, billable-size, or cost
  endpoints;
- the read-only prior-job catalog check;
- `batch.submit_job`;
- job-detail polling;
- any file or timeseries endpoint.

No control file or calibration directory was created. No job identity was
received or persisted. The fresh M.5B quote was not reused as a submission
quote, and no new M.5C quote or billable value is claimed.

## Next boundary

A separate `667M.5C.1` must first replace the local entitlement parser with
the existing strict lossless explicit-instant parser, or an equivalent parser
that accepts and validates nine fractional digits without truncation.

Because this Action's no-retry boundary has been reached, M.5C.1 requires an
explicit resume authorization. It must repeat the complete fresh preflight,
including the prior exact-scope job check, before it may make at most one
submission call.

Machine-readable evidence:
`docs/evidence/action-667m5c-calibration-batch-submission.json`

Evidence digest:
`22b3735acd6073f772e2e88bb056d3ba6a8473a52d59be3b7d3cd85f21335992`
