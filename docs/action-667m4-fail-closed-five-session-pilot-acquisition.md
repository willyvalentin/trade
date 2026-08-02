# Action 667M.4 — Fail-closed five-session pilot acquisition

## Outcome

The authorized metadata-only preflight ran once and failed closed before batch
submission.

- `action_667m4_preflight_passed: false`
- `action_667m4_batch_submitted: false`
- `action_667m4_dataset_acquired: false`
- `action_667m4_post_download_verified: false`
- `action_667m4_cost_ceiling_respected: true`
- `action_667m4_storage_ceiling_respected: false`
- `dataset_acquisition_ready: false`
- `normalization_authorized: false`
- `replay_authorized: false`
- `canonical_binding_ready: false`
- `live_ranking_effect: false`

`storage_ceiling_respected:false` means the ceiling could not be proven because
the provider did not expose a declared compressed transfer size before batch
submission. It does not mean the ceiling was exceeded.

No batch request, timeseries request, streaming request, file generation,
download, redownload, purchase retry, normalization, replay, database
operation, commit, push, PR update, deploy, or live integration occurred.

## Frozen and local gates

The M.2A/v1 and M.2C/v2 freezes are exact. The M.3B historical freeze remains
valid through its documented portable-test successor in M.3C. M.3C and M.3D
are exact. M.3D confirms:

- `license_sufficient:true`;
- `dataset_acquisition_ready:true` before this Action's fresh preflight;
- internal non-display use;
- organization scope;
- indefinite raw and derived retention;
- encrypted backup and post-cancellation retention;
- offline replay rights;
- no special audit/log/deletion requirements;
- redistribution forbidden;
- corporate actions excluded.

The credential file is Git-ignored and untracked. The credential was loaded
only inside the metadata-preflight process and was never emitted or persisted.
No Netlify environment was inspected.

The approved destination is:

`/Users/willysimonsson/Library/Application Support/trade-shadow-data/encrypted/databento/EQUS.MINI/trades/v1/raw`

It is outside the repository. The destination was not created because
preflight failed. Its underlying APFS Data volume reported `Encrypted = Yes`.
Free space at preflight was `14,707,425,280` bytes, approximately `13.697 GiB`.

The decoder was installed only in a temporary venv outside the repository:

- `databento 0.82.0`;
- `databento-dbn 0.63.0`;
- repository dependency changes: `0`.

The repository's five-session calendar boundaries are immutable and tested,
but their acquisition fixture explicitly identifies itself as synthetic. It
therefore cannot serve as independent real-acquisition XNYS evidence. Calendar
gate 17 failed closed.

## Fresh metadata-only preflight

The preflight ran from
`2026-07-27T14:05:29.693898Z` through
`2026-07-27T14:05:46.101782Z`. The maximum quote/entitlement age at the
preflight decision was `16.408` seconds, below the 900-second limit.

Verified scope:

- dataset/schema: `EQUS.MINI` / `trades`;
- encoding/compression: `dbn` / `zstd`;
- publisher: `95`;
- symbols: all 13 requested symbols, no partial, unresolved, or extra symbol;
- interval:
  `[2026-07-20T00:00:00Z, 2026-07-25T00:00:00Z)`;
- entitlement:
  `[2023-03-28T00:00:00.000000000Z, 2026-07-27T04:00:00.000000000Z)`;
- all five dates: `available`;
- record estimate: `516,162`;
- billable bytes: `24,775,776` (`23.628 MiB`);
- estimated price: USD `0.138445436954`;
- files: `0`, because no batch was submitted;
- provider-declared transfer bytes: unavailable before submission;
- actual local data bytes: `0`.

The price and billable-byte estimates are below USD `0.25` and 32 MiB.

## Failed gates

Batch submission was prohibited because the following mandatory facts could
not be proven before submission:

1. provider-declared aggregate compressed transfer size at or below 32 MiB;
2. exact provider build;
3. immutable dataset revision;
4. pre-submission batch metadata/manifest;
5. exact total local requirement, because transfer size was unavailable;
6. independent non-synthetic immutable XNYS calendar evidence for the five
   pilot sessions.

The first five limitations are structural to the exposed metadata interface:
the relevant file list, transfer size, and batch manifest exist only after a
batch job is created, while this authorization required them before batch
submission. No assumption or estimated compression ratio was substituted.

## Sanitized evidence

The raw authenticated responses were not copied into the worktree. The
machine-readable evidence contains only scope, non-sensitive aggregates,
boolean gates, public product versions, and sanitized digests.

- metadata-preflight digest:
  `8356adec14eec98e211d5a1d7c2b442e8412486f05ff4f5256d6b55817054970`;
- M.4 decision-evidence digest:
  `1b896d2387af207fa03b59172bfeed38be17a19daedb23395e66f73b6474ce8d`.
