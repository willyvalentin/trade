# Action 667M.4B.3 — Existing-job support-file admission

The already submitted Databento pilot job was reused without retry,
resubmission, cancellation, or a new timeseries request. It remained
terminal `done` with 516,162 records, 24,775,776 billable bytes, and an
actual cost of USD 0.1384454369545.

Exactly `condition.json`, `manifest.json`, and `metadata.json` were
downloaded to an owner-only staging directory on the FileVault-backed APFS
volume. Each file was checked against provider size and SHA-256, parsed as
JSON, and atomically promoted to the job-specific support directory. No DBN
or other market-data bytes were downloaded.

The support content binds the same in-memory job identity as the protected
control file. `metadata.json` binds `EQUS.MINI`, `trades`, `dbn`, `zstd`,
the exact 13-symbol order, and
`[2026-07-20T00:00:00Z, 2026-07-25T00:00:00Z)`. `condition.json` reports
all five dates as `available`; no degraded or partial day is present.

## Post-submission admission

The retained M.4A v2 evaluator cannot represent the actual provider size
semantics safely: Databento reports `actual_size` as 24,775,776
uncompressed bytes and `package_size` as 7,734,804 compressed transfer
bytes, while the frozen evaluator requires `actual_size <= package_size`.
Passing that evaluator would require mislabeling provider metadata.

The frozen evaluator remains byte-unchanged. The additive
`market_context_databento_existing_job_support_admission_v1` contract
separates the two size meanings, binds the prior pre-submission decision,
checks the actual support bytes and fresh inventory, and applies the
unchanged hard caps. Its result is
`ready_for_separate_market_data_download_authorization`; it does not grant
that authorization.

## Safety state

- Existing job reused: `true`
- New batch submissions: `0`
- Support files downloaded and verified: `3`
- Market-data files downloaded: `0`
- Post-submission admission passed: `true`
- Market-data download ready for a separate operator decision: `true`
- Market-data download authorized: `false`
- Normalization authorized: `false`
- Replay authorized: `false`
- Canonical binding ready: `false`
- Live ranking effect: `false`

Machine-readable evidence is stored in
`docs/evidence/action-667m4b3-existing-job-support-admission.json`.
