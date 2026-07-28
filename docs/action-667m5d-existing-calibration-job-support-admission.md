# Action 667M.5D — Existing calibration job support-file admission

The existing terminal calibration job was reused. One fresh job-detail call
and exactly one `list_files` call returned an exact inventory of fifteen
market-data files and the three allowlisted support files. No job was created,
retried, cancelled, or resubmitted.

## Status

- `action_667m5d_existing_job_reused: true`
- `action_667m5d_file_inventory_verified: true`
- `action_667m5d_support_files_downloaded: true`
- `action_667m5d_support_files_verified: true`
- `action_667m5d_post_submission_admission_passed: true`
- `action_667m5e_market_data_download_ready: true`
- `new_batch_submissions: 0`
- `market_data_files_downloaded: 0`
- `download_authorized: false`
- `normalization_authorized: false`
- `replay_authorized: false`
- `canonical_binding_ready: false`

M.5E readiness permits only a separate operator decision. No market-data
download is authorized by this Action.

## Inventory and caps

| Measure | Value | Gate |
| --- | ---: | --- |
| Support files | 3 | exact |
| Market-data files | 15 | exact |
| Support transfer | 11,263 bytes | verified |
| Market-data transfer | 28,219,780 bytes | below 64 MiB |
| Total package | 28,231,043 bytes | exact provider package size |
| Calculated local total | 56,462,086 bytes | below 2 GiB |
| Actual cost | USD 0.51066228747368 | below USD 0.75 |
| Billable DBN | 91,386,576 bytes | below 128 MiB |

The market inventory contains exactly one
`equs-mini-YYYYMMDD.trades.dbn.zst` file for each of the fifteen frozen XNYS
sessions. None was downloaded.

## Verified support files

| File | Bytes | SHA-256 |
| --- | ---: | --- |
| `condition.json` | 1,922 | `d711471388ad6e841c412edebe62722bdd0676a6b468853bcd450afee718c988` |
| `manifest.json` | 8,424 | `5536e9ebc701ad93d665a77f33c09fd6d00ba1766d5e54d1bfd40975f83929df` |
| `metadata.json` | 917 | `896115b7ab76025854afcf66eef4f594eaf7727a46a190ce9e9b2a10072dd03f` |

Provider and local SHA-256 values match. Provider and local sizes match. All
three files are valid JSON, owner-only `0600`, and were promoted atomically
into a `0700` job-specific support directory on the same FileVault volume.

The manifest and metadata identities match the protected control identity.
Metadata binds the exact dataset, schema, encoding, compression, symbol order,
and nanosecond interval. `condition.json` contains all fifteen official
sessions as `available`, plus the already documented non-session date
2026-07-03 as `available`. There are no degraded, partial, missing, or unknown
official sessions.

## No-effect boundary

There were zero market-data downloads, submissions, retries, cancellations,
normalizations, replays, database operations, canonical bindings, commits,
pushes, PRs, deploys, or live effects. Credential and real job identity are
absent from repository evidence.

Machine-readable evidence:
`docs/evidence/action-667m5d-existing-calibration-job-support-admission.json`

Evidence digest:
`37635791f5c67bccaf79c5882c47c0ef48fe5b1ed2a1cda28b98e0de8bc6abe6`
