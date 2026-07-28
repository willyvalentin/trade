# Action 667M.4B — Operator-authorized pilot batch submission

Date: 2026-07-27

Result: fail-closed before submission.

The frozen M.4A admission, authoritative XNYS calendar, provider-provenance
policy, M.3D license decision, encrypted destination outside Git and minimum
free-space gate were verified before any authenticated operation.

One fresh authenticated metadata preflight was then run for the exact
authorized `EQUS.MINI` / `trades`, `dbn` + `zstd`, publisher `95`, 13-symbol
scope and interval `[2026-07-20T00:00:00Z,
2026-07-25T00:00:00Z)`.

The preflight verified:

- 13 of 13 requested symbols, with no partial or extra symbol;
- entitlement spanning the complete requested interval;
- five of five dates marked `available`, with no degraded date;
- 516,162 estimated records;
- 24,775,776 billable bytes, below the 32 MiB hard cap;
- estimated cost USD 0.138445436954, below the USD 0.25 hard cap;
- Databento SDK `0.82.0` and DBN decoder `0.63.0`.

The explicit dataset-discovery membership gate nevertheless returned
`dataset_not_available`. Per the operator's fail-closed instruction, execution
stopped immediately. There was no second metadata preflight, no retry and no
batch submission.

Consequences:

- batch submission attempts: `0`;
- provider batch jobs created: `0`;
- batch-submission charge: USD `0`;
- the USD `0.138445436954` value remained an uncommitted estimate;
- no job identity or control file exists;
- `get_job_details` and `list_files` were not called;
- no provider file metadata or digests were received;
- no support file or market-data byte was downloaded.

Had a batch been submitted, provider charging could apply even if later batch
processing failed. That scenario did not occur in this Action.

Machine-readable evidence:
`docs/evidence/action-667m4b-pilot-batch-submission.json`.
Evidence digest:
`2641491b3ee3394edb9eecd82c364c7032203c1a944f7d7cd964f909b53eb79e`.

Statuses:

- `action_667m4b_pre_submission_admission_passed: false`
- `action_667m4b_batch_submitted: false`
- `action_667m4b_batch_terminal_ready: false`
- `action_667m4b_file_inventory_available: false`
- `action_667m4b_declared_transfer_within_cap: false`
- `action_667m4c_download_gate_ready: false`
- `download_authorized: false`
- `normalization_authorized: false`
- `replay_authorized: false`
- `canonical_binding_ready: false`
- `live_ranking_effect: false`
