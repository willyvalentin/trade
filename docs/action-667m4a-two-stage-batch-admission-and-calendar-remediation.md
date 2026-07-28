# Action 667M.4A — Two-stage batch admission and authoritative calendar remediation

## Outcome

The M.4 blockers are remediated as an additive, dormant contract without
submitting a batch or authorizing a download.

- `action_667m4a_two_stage_admission_ready: true`
- `action_667m4a_authoritative_calendar_ready: true`
- `action_667m4a_provider_provenance_sufficient: true`
- `action_667m4a_independent_review_approved: true`
- `batch_submission_authorized: false`
- `download_authorized: false`
- `normalization_authorized: false`
- `replay_authorized: false`
- `canonical_binding_ready: false`
- `live_ranking_effect: false`

The implementation is synthetic-fixture-only. It reads no credential, imports
no provider client, and performs no provider, database, replay, capture, or live
operation.

## Two independent admission stages

`market_context_five_session_pilot_two_stage_admission_v2` separates facts that
exist before a batch job from facts that exist only after a batch job.

### `pre_submission_admission`

This stage requires the exact fixed scope, a quote and entitlement no more than
900 seconds old, all five dates marked `available`, exact record/billable/cost
estimates under the hard caps, M.3D license readiness, the authoritative
calendar, encrypted storage outside Git, at least 1 GiB free space, and pinned
SDK/decoder versions.

It returns only
`ready_for_separate_batch_submission_authorization`. It always returns
`batch_submission_authorized:false` and `download_authorized:false`.

It does not demand a provider file list, compressed package size, job manifest,
job metadata, or file identity because those do not exist until a batch job has
been submitted.

### `post_submission_pre_download_admission`

This stage binds to the immutable pre-submission decision and requires separate
operator batch-authorization evidence. It then verifies the completed job,
exact request scope, cost and billed size, `condition.json`, `manifest.json`,
`metadata.json`, every provider file name/size/SHA-256, aggregate transfer size,
and a conservative local-space calculation that reserves a second package-sized
copy for atomic download handling.

It stops before the first data file if:

- transfer bytes are absent, inconsistent, or exceed 32 MiB;
- calculated local space is absent, inconsistent, or exceeds 1 GiB;
- the support-file set or manifest is incomplete;
- job or manifest scope differs from the pre-submission scope;
- a file or data domain is unexpected;
- job cost exceeds USD 0.25 or billed size exceeds 32 MiB;
- provenance or metadata-only inspection attestations are incomplete.

A passing result is only
`ready_for_separate_file_download_authorization`. It never authorizes the
download itself.

## Provider provenance

The mapping is based on Databento's public
[Download center](https://databento.com/docs/portal/download-center),
[batch list-jobs](https://databento.com/docs/api-reference-historical/batch/batch-list-jobs),
[batch list-files](https://databento.com/docs/api-reference-historical/batch/batch-list-files),
and [DBN specification](https://databento.com/docs/standards-and-conventions/databento-binary-encoding).

The completed job exposes request scope, job state and timestamps, record count,
billed size, compressed actual/package sizes, and cost. The file listing and
`manifest.json` expose file names, sizes, and provider SHA-256 values.
`metadata.json` preserves the request description, while `condition.json`
preserves date conditions. A downloaded DBN file later provides its
self-describing DBN format version and request metadata.

The public interface does not document an internal provider software build or
an immutable internal dataset revision. Both are therefore
`not_exposed_by_provider`; neither is guessed or represented as verified.

The minimum lossless identity is:

1. exact request-scope digest;
2. hashed provider job identity and job-metadata digest;
3. canonical provider file-list digest;
4. provider file name, size, and SHA-256;
5. SDK and decoder versions;
6. later DBN-header verification;
7. later actual local file SHA-256.

Independent review finds this sufficient for pre-download identity, with the
explicit status `sufficient_pre_download_pending_local_sha256`.

## Authoritative XNYS calendar

`market_context_xnys_acquisition_calendar_2026_v1` replaces the synthetic
acquisition fixture. It was retrieved on 2026-07-27 from:

- the official [NYSE 2026 yearly trading calendar](https://www.nyse.com/publicdocs/nyse/ICE_NYSE_2026_Yearly_Trading_Calendar.pdf);
- NYSE's official [Holidays & Trading Hours](https://www.nyse.com/trade/hours-calendars).

The yearly calendar establishes that 2026-07-20 through 2026-07-24 are ordinary
trading days with no early-close marker. The hours page independently
establishes the 09:30–16:00 Eastern core session and the applicable 2026 holiday
exceptions.

July 2026 is EDT (`UTC-04:00`), so each session is bound explicitly to
13:30–20:00 UTC. The artifact contains both explicit UTC instants and canonical
UNIX-nanosecond strings. Host timezone conversion is prohibited.

Calendar canonical JSON SHA-256:

`fac1d40d9136a43680176f5d1a75b6c3a0bb69531cd6e580c4dc35f72bea2335`

M.4A decision-evidence SHA-256:

`193fb6655e7ed95a92fd8b9ff8edaa14f46e28fa5be11f715db969d1d9b5e693`

No price data or replay result was used to construct or validate the calendar.

## Rollback and no-effect policy

An unexecuted receipt can only be discarded. Any later attempt must start with
a fresh pre-submission admission; receipts cannot be edited, refreshed in
place, or used to infer missing provider metadata. No stage changes live
universe, score, ranking, recommendations, AI behavior, or publishing.

## Independent review

The review found zero blockers, majors, minors, or nits:

- pre-submission no longer contains impossible batch-only requirements;
- post-submission cannot admit a download without exact sizes, scope, manifest,
  and provider file hashes;
- internal provider revision fields are not invented;
- both operator decisions remain separate and false;
- calendar, admissions, and evidence are deterministic and fail closed;
- malformed input, tampering, array ordering, and timezone changes cannot
  silently alter an admission.

## Inactive future operator phrases

Batch submission:

> SPÅR 3 — Action 667M.4B: Jag godkänner exakt en Databento batch submission för `EQUS.MINI` / `trades`, `dbn` + `zstd`, publisher `95`, de 13 deklarerade ETF-symbolerna och intervallet `[2026-07-20T00:00:00Z, 2026-07-25T00:00:00Z)`, endast om en färsk `pre_submission_admission` passerar och all-in-priset är högst USD `0.25`, billable bytes högst `32 MiB`, licens/calendar/destination är oförändrade och ingen download sker i samma Action.

File download:

> SPÅR 3 — Action 667M.4C: Jag godkänner download av exakt filerna i det redan skapade pilotbatchjobbet endast om `post_submission_pre_download_admission` passerar med komplett `condition.json`, `manifest.json`, `metadata.json` och providerfilförteckning, sammanlagd deklarerad transfer högst `32 MiB`, beräknat lokalt totalbehov högst `1 GiB`, oförändrad scope samt pris och billable bytes inom tidigare godkända tak. Ingen normalization eller replay är godkänd.

Neither phrase is active in this Action.
