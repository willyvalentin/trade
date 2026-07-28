# Action 667M.4C — Existing pilot raw integrity

The existing terminal Databento pilot job was reused without submission,
retry, resubmission, or cancellation. Its fresh job and file inventory
matched the authorized `EQUS.MINI` / `trades` / `dbn` + `zstd` scope,
the exact 13 symbols, and
`[2026-07-20T00:00:00Z, 2026-07-25T00:00:00Z)`.

All three support-file SHA-256 values were reverified before download. The
M.4B.3 post-submission admission remained green, all cost and size caps
passed, the destination remained FileVault-backed, and free space exceeded
twice the calculated local requirement.

Exactly five provider-manifest market-data files were downloaded once each
to an owner-only staging directory. Redirects and automatic retries were
disabled. Each file's actual byte count and local SHA-256 matched the
provider manifest before the complete directory was atomically promoted to
`raw/market-data/action-667m4b2`.

The files were treated as opaque bytes. No DBN record was decoded, no
normalization or trade-to-candle preparation ran, and no replay or
persistence occurred.

## Result

- Existing job reused: `true`
- Market-data files downloaded: `5`
- Actual compressed bytes: `7,729,852`
- Raw inventory verified: `true`
- Provider hashes verified: `true`
- Post-download integrity passed: `true`
- New batch submissions: `0`
- Automatic retries: `0`
- Redirects followed: `0`
- DBN records decoded: `0`
- Additional or repeat download authorized: `false`
- Normalization authorized: `false`
- Replay authorized: `false`
- Canonical binding ready: `false`
- Live ranking effect: `false`

Machine-readable evidence is stored in
`docs/evidence/action-667m4c-existing-pilot-raw-integrity.json`. It contains
file names, sizes, hashes, scope digests, and verification results, but no
credential, provider job identity, account, billing, user, or request
identifier.
