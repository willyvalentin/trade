# Action 667M.5E — calibration raw integrity

Action 667M.5E reused the existing terminal calibration job and downloaded
exactly the 15 market-data files admitted by Action 667M.5D. It created no
batch job and did not download support files, decode DBN records, decompress,
normalize, replay, persist to a database, or bind canonical consumers.

The pre-download gate reverified the owner-only control file, all three support
file SHA-256 values, the M.5D evidence and post-submission-admission digests,
the exact 13-symbol scope, the 15 official sessions, the absence of a
2026-07-03 market file, all hard caps, FileVault, same-volume staging, and more
than twice the calculated local requirement as free space.

The downloader used only the 15 exact HTTPS URLs in the verified provider
manifest. Redirects, retries, wildcard discovery, alternate names, path
traversal, symlinks, duplicate names, and files outside the allowlist were
rejected. All files were written to an owner-only staging directory, checked
against provider size and SHA-256 twice, then atomically promoted as one
directory. The final directory is `0700`; every raw file is `0600`.

## Result

- Files: 15
- Total compressed bytes: `28219780`
- Raw integrity digest:
  `7f539ff24f709cb21098558e0531a3f6526438b932f111e5ce7aa1f333af1a7a`
- Actual cost already associated with the existing job:
  `USD 0.51066228747368`
- Billable DBN bytes: `91386576`
- New batch submissions: `0`
- DBN records decoded: `0`
- Normalization, replay, canonical binding, and live effect remain disabled.

The machine-readable evidence is
`docs/evidence/action-667m5e-calibration-raw-integrity.json`. It contains only
the public scope, sanitized file inventory, sizes, SHA-256 values, gate
results, and authorization status. It contains no credential, job identity,
account, billing, or request identifier.
