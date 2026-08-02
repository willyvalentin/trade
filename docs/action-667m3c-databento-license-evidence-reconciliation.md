# Action 667M.3C — Databento license evidence reconciliation

## Boundary and decision

This Action performs no provider contact, credential access, quote, purchase,
download, normalization, replay, database operation, canonical binding, or
live integration.

The only new non-public evidence is the operator's sanitized attestation that
Databento gave a written confirmation covering three points:

1. downloaded data may be retained indefinitely;
2. that retention right survives termination of the Databento account; and
3. the same right covers all users in the operator's organization.

No provider-verbatim text, provider confirmation date, sender identity, email
address, account identifier, request identifier, or other sensitive metadata
is locally available. The evidence is therefore classified as
`operator_attested_provider_confirmation`. The three statements are preserved
as operator summaries, not as quotations attributed to Databento. No missing
wording or provenance detail is inferred.

## Public documentation reconciliation

The operator attestation is complementary to, and does not replace, the
official public documentation already recorded in the M.3 gate:

- data older than 24 hours is historical and normally does not require a
  separate exchange license for internal use without redistribution;
- historical streaming and batch interfaces support market replay;
- OHLCV can be derived from Trades;
- a paid batch is charged once and may be downloaded again for 30 days without
  a new data charge;
- EQUS.MINI uses `sequence = 0`;
- Trades carry the Trade action;
- `ts_event` and `ts_recv` are separate UNIX-nanosecond timestamps;
- flags are a documented bitmask; bad-timestamp, bad-book, unknown flag, and
  unknown publisher-specific semantics remain fail-closed;
- redistribution remains prohibited.

The exact public references and the fact-by-fact evidence binding are in
`docs/evidence/action-667m3c-license-evidence-reconciliation.json`. These
technical and public-contract facts are not treated as bespoke legal advice.

The pilot remains `raw_unadjusted`. Corporate actions are a separate product
and are explicitly excluded from the pilot. No adjustment or performance
claim is permitted.

## Formal license matrix

| Topic | Decision | Evidence boundary |
| --- | --- | --- |
| Indefinite raw retention | confirmed | operator-attested written provider confirmation |
| Retention after cancellation | confirmed | operator-attested written provider confirmation |
| Organization/team scope | confirmed | operator-attested written provider confirmation |
| Internal non-display research | supported | official historical/internal/non-redistribution documentation |
| Derived candles | creation supported; retention unresolved | official Trades/OHLCV documentation does not settle derived retention |
| Derived evidence | unresolved | written confirmation required for retention |
| Offline replay | supported | official historical replay documentation |
| Encrypted local storage | raw local storage supported | indefinite raw retention confirmation |
| Encrypted backup | unresolved | written confirmation required |
| Deletion obligations | no raw deletion obligation attested | derived/backup deletion follows the unresolved retention questions |
| Audit/log requirements | unresolved | written confirmation required |
| Redistribution | forbidden | explicit project and provider boundary |
| Corporate actions | excluded | `raw_unadjusted`, no corporate-action records |

Only three precise license questions remain:

1. Does the confirmed indefinite retention right expressly include encrypted
   backups and disaster-recovery copies?
2. May derived candles and non-reconstructive derived evidence be retained
   indefinitely, including after cancellation and for the organization?
3. What audit, access-log, evidence-retention, or provider-notification
   obligations apply?

Because those questions are not answered by the available operator attestation
or public documentation, `license_sufficient` is `false`. This is a
fail-closed contractual decision, not a negative statement about the provider.

## Technical pre-download readiness

The local M.3A pilot contract can enforce every technical item that belongs in
a future M.4 preflight or post-download verification:

- refresh quote and entitlement immediately before download;
- require all five dates to be exactly `available`;
- enforce USD `0.25`, 32 MiB billable, 32 MiB transfer, and 1 GiB local caps;
- require provider build, DBN decoder/encoder build, and immutable dataset
  revision evidence;
- bind immutable XNYS calendar evidence for all pilot sessions;
- capture batch `condition.json`, `metadata.json`, and manifest provenance;
- compute actual compressed and uncompressed raw-file SHA-256 values;
- construct the stable record identity from immutable source-file identity and
  record ordinal because EQUS.MINI `sequence` is always zero;
- retain `ts_event` and `ts_recv` losslessly as UNIX-nanosecond strings;
- reject unknown actions, flags, sale conditions, and unsafe timestamp/book
  states;
- keep the two-second watermark `empirically_unvalidated` and uncalibrated;
- prohibit normalization admission and replay until the later post-download
  and calibration gates succeed.

This means `technical_pre_download_ready` is `true`: the contract can receive
and validate future evidence without inference. It does not mean the currently
stale quote or past availability result is reusable, and it does not authorize
any acquisition.

## Readiness statuses

- `license_sufficient: false`
- `technical_pre_download_ready: true`
- `operator_acquisition_authorized: false`
- `dataset_acquisition_ready: false`
- `download_authorized: false`

Accordingly:

- `action_667m3c_license_evidence_reconciled: true`
- `action_667m3c_license_sufficient: false`
- `action_667m3c_pilot_pre_download_ready: true`
- `action_667m4_dataset_acquisition_ready: false`

## Verification and findings

The fresh relevant Action 667A–M.3C regression passed `162/162` tests. Its
child-process timezone matrices were byte-identical under UTC,
Europe/Stockholm, and America/New_York. TypeScript, scoped ESLint, JSON parity,
freeze parity, and `git diff --check` passed. No dependency or `deno.lock`
change exists.

The reconciliation evidence digest is
`91b010295e44595c6b4c68adb3bc12b8cd7e03322db8351cca9a0a17839674a6`.
The aggregate cross-timezone digest is
`dbbb2449a220896bbca43d9603b5dcb1c5b0d3401c84de29da657de38f8f2323`.

Implementation review found zero blockers and zero majors. The watermark
remains one transparent technical minor because it is empirically unvalidated;
replay remains prohibited before a separate calibration/admission. The three
precise license questions above are external acquisition blockers, not hidden
implementation fallbacks.

## Inactive future M.4 authorization phrase

The following phrase is a template only. It is inactive while
`license_sufficient:false` and must not be interpreted as authorization in this
Action:

> SPÅR 3 — Action 667M.4: Jag godkänner en enda fail-closed preflight och, endast om den passerar, en engångsdownload av Databento `EQUS.MINI` raw `trades`, `dbn` + `zstd`, publisher `95`, för exakt symbolerna `SPY,QQQ,XLB,XLC,XLE,XLF,XLI,XLK,XLP,XLRE,XLU,XLV,XLY` och exakt intervallet `[2026-07-20T00:00:00Z, 2026-07-25T00:00:00Z)`. Auktorisationen gäller endast efter att en ny M.3C-evidens visar `license_sufficient:true`, `technical_pre_download_ready:true`, en högst 900 sekunder gammal quote och entitlement, samtliga fem dagar `available`, dokumenterade provider-/encoder-/datasetrevisioner, immutable XNYS-calendar, samt verifierad krypterad destination utanför Git. Stoppa före download om priset överstiger USD `0.25`, billable bytes överstiger `32 MiB`, transfer överstiger `32 MiB` eller lokalt totalbehov överstiger `1 GiB`. `raw_unadjusted` gäller; corporate actions ingår inte. Spara endast under `/Users/willysimonsson/Library/Application Support/trade-shadow-data/encrypted/databento/EQUS.MINI/trades/v1/raw`. Efter download får endast batchmetadata, immutable file identity, record ordinal och faktiska SHA-256-evidens verifieras. Ingen normalization, replay, databas, canonical binding, commit, push, PR, deploy eller liveintegration är godkänd.
