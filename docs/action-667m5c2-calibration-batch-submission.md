# Action 667M.5C.2 — Calibration batch submission

The fresh pre-submission admission passed and exactly one authorized Databento
batch job was created. The provider scope matched the fixed fifteen-session
calibration package. After the bounded two-minute polling window, the same job
remained queued and was left intact for a separate read-only resume.

## Status

- `action_667m5c2_pre_submission_admission_passed: true`
- `action_667m5c2_batch_submitted: true`
- `action_667m5c2_submission_scope_verified: true`
- `action_667m5c2_batch_terminal_ready: false`
- `new_batch_submissions: 1`
- `support_files_downloaded: 0`
- `market_data_files_downloaded: 0`
- `download_authorized: false`
- `normalization_authorized: false`
- `replay_authorized: false`
- `canonical_binding_ready: false`

## Fresh admission

Range-less exact ASCII membership, `trades`, DBN with Zstandard, publisher 95,
all thirteen symbols, the frozen fifteen-session XNYS calendar, and all
fifteen `available` conditions passed. The prior M.5C control state was absent
and the complete provider job catalog contained no prior exact-scope job.

The fresh estimate was:

- 1,903,887 records;
- 91,386,576 billable DBN bytes;
- USD 0.510662287474 estimated cost.

The quote age at submission was 813,222,000 nanoseconds (0.813222 seconds).
The entitlement snapshot age was 19,856,522,000 nanoseconds (19.856522
seconds). Both were evaluated through
`databento_explicit_nanosecond_instant_parser_v1` and were below the exact
900-second limit.

The estimate remained below USD 0.75 and 128 MiB. Future compressed transfer
and local-total gates remain deferred to a post-submission admission and retain
their 64 MiB and 2 GiB hard stops.

## Submission and containment

The client made one submission call and zero automatic retries. Provider scope
was exact. The real job identity exists only in the owner-only control file on
the verified encrypted volume. The file is `0600`; the calibration, raw, and
control directories are `0700`.

Seven read-only job-detail observations were made at 20-second intervals.
The final sanitized state was `queued`, so terminal readiness remains false.
No files endpoint, support-file download, market-data download, timeseries
request, stream, normalization, replay, database, commit, push, PR, or deploy
occurred.

The next Action may only resume polling this existing job. It must not submit
or retry another job.

Machine-readable evidence:
`docs/evidence/action-667m5c2-calibration-batch-submission.json`

Evidence digest:
`a5fa94a2edbf6c9161034c54f3f45e39bc85288df28846818498a7eb2fa1de1d`
