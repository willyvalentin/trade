# Action 667M.3 — Metadata-Only Databento Quote, Entitlement and License Gate

Initial gate timestamp: `2026-07-27T11:21:18Z`

R1 resume timestamp: `2026-07-27T11:42:00Z`

R1 authenticated completion timestamp: `2026-07-27T11:48:56Z`

This is a sanitized, fail-closed decision package. It contains no credential,
account identifier, request identifier, billing identifier, market record, or
provider payload.

## Binary decisions

- `action_667m3_metadata_gate_completed: true`
- `action_667m3_entitlement_verified: true`
- `action_667m3_license_sufficient: false`
- `action_667m3_exact_quote_available: true`
- `action_667m3_dataset_acquisition_ready: false`

The metadata, entitlement, symbology, condition, record-count, billable-size,
and cost-estimate gate completed. Acquisition remains fail-closed because the
required license rights, corporate-action decision, provider build/revision,
2025 calendar extension, and M.1 nanosecond receiver extension are unresolved.

### R1 resume result

Action 667M.3R1 authorized only the credential located at the exact path
`/private/tmp/trade-action-667k/.env.local`. The first R1 check found the file
absent and stopped. On the operator's repeated R1 instruction the file existed
and passed the ignored/untracked and presence-only gates.

The credential was loaded into one process at a time and used only with the
documented `metadata.*` and `symbology.resolve` endpoints. Raw provider
responses, response headers, account identifiers, billing identifiers, and
request identifiers were not persisted. No other credential source was
searched.

## Credential and repository safety

- `.env.local` exists in this worktree.
- The path is covered by `.gitignore:39` (`.env*.local`).
- `git ls-files --error-unmatch .env.local` confirms that it is untracked.
- Only boolean key presence was reported; the key value remained process-only.
- No credential value, length, prefix, suffix, or digest was read or emitted.
- No Netlify environment was inspected.
- Authenticated calls: `16` total (`15` metadata, `1` symbology).
- Historical/live record requests, batch jobs, downloads, and purchases: `0`.
- Compatible Databento client dependencies were not installed.

## Candidate request and public product evidence

| Field | Sanitized result | Gate status |
| --- | --- | --- |
| Provider | Databento | public fact |
| Dataset | `EQUS.MINI` | authenticated dataset discovery confirmed |
| Schema | `trades` | authenticated schema discovery confirmed |
| Encoding | `dbn`; `zstd` proposed for a future batch | DBN field schema confirmed; transfer compression was not quoted |
| Input symbology | `raw_symbol` | authenticated resolution confirmed |
| Symbols | `SPY`, `QQQ`, `XLB`, `XLC`, `XLE`, `XLF`, `XLI`, `XLK`, `XLP`, `XLRE`, `XLU`, `XLV`, `XLY` | all 13 resolved fully for the candidate interval |
| Entitlement-specific trades range | `[2023-03-28T00:00:00.000000000Z, 2026-07-27T04:00:00.000000000Z)` | authenticated |
| Publisher | ID `95`, dataset `EQUS.MINI`, venue `EQUS`, “Databento US Equities Mini” | authenticated |
| Event time | `ts_event`: matching-engine-received nanoseconds since Unix epoch | public field semantics |
| Receive time | `ts_recv`: Databento capture-server-received nanoseconds since Unix epoch | public field semantics |
| Historical `trades` unit price | USD `6/GiB` | authenticated metadata |
| Exact records | pilot `516,162`; 252 candidate `34,312,819` | authenticated estimate |
| Billable bytes | pilot `24,775,776`; 252 candidate `1,647,015,312` | authenticated estimate |
| Compressed transfer bytes | unknown | metadata API does not expose the future Zstandard file size |
| Exact estimated price | pilot USD `0.138445436954`; 252 candidate USD `9.203415244818` | authenticated `metadata.get_cost` |
| Current credits | unknown | the public USD 125 new-team credit is not account evidence |
| Projected balance | unknown | credit/balance metadata is not exposed by the historical metadata API |

The authenticated schema list is `mbp-1`, `tbbo`, `trades`, `bbo-1s`,
`bbo-1m`, `ohlcv-1s`, `ohlcv-1m`, `ohlcv-1h`, `ohlcv-1d`, and `definition`.
The DBN trade field discovery confirms `publisher_id`, `instrument_id`,
`ts_event`, signed fixed `price`, unsigned `size`, `action`, `side`, `flags`,
`depth`, `ts_recv`, `ts_in_delta`, and unsigned `sequence`.

No time-series or batch endpoint was called.

## Frozen date packages

The last completed XNYS session before this gate is Friday `2026-07-24`.

### Tiny pilot

- sessions: `2026-07-20` through `2026-07-24`, five completed sessions;
- proposed metadata quote range:
  `[2026-07-20T00:00:00Z, 2026-07-25T00:00:00Z)`;
- exact 13-symbol universe above;
- target preparation: raw trades to regular-session one-minute candles;
- regular-session opportunities: `25,350` symbol-minute buckets plus `1,950`
  eleven-sector breadth-minute opportunities;
- estimated provider records: `516,162`;
- billable uncompressed DBN: `24,775,776` bytes (`23.628 MiB`);
- exact estimated cost: USD `0.138445436954`;
- dataset conditions: `5/5 available`, `0 degraded`;
- compressed Zstandard transfer size: not exposed;
- corporate-action state: `raw_unadjusted`, corporate actions excluded from
  the pilot, with split/dividend return distortion explicitly unresolved.

### 252-session research package

- candidate sessions: `2025-07-24` through `2026-07-24`, inclusive;
- proposed metadata quote range:
  `[2025-07-24T00:00:00Z, 2026-07-25T00:00:00Z)`;
- `252` completed XNYS sessions under the official holiday list;
- early closes inside the range: `2025-11-28` and `2025-12-24`;
- target opportunities: `1,272,960` symbol-minute buckets plus `97,920`
  eleven-sector breadth-minute opportunities;
- estimated provider records: `34,312,819`;
- billable uncompressed DBN: `1,647,015,312` bytes (`1.533903 GiB`);
- exact estimated cost: USD `9.203415244818`;
- metadata conditions across the queried weekday range: `253 available`,
  `9 degraded`;
- degraded dates: `2025-08-08`, `2025-08-13`, `2025-08-19`, `2025-08-25`,
  `2025-09-03`, `2025-09-08`, `2025-09-12`, `2025-10-10`, and `2025-10-13`;
- compressed Zstandard transfer size: not exposed;
- actual candles may be fewer because missing/no-trade minutes remain gaps.

The repository-pinned XNYS artifact currently begins in 2026. The 2025 portion
therefore requires a separately reviewed immutable calendar extension before
the 252-session dataset can satisfy the M.2C binding contract.

All thirteen symbols resolved over the full candidate interval with no partial
or not-found result. The exact authenticated raw-symbol mappings are:

| Symbol | Instrument ID |
| --- | ---: |
| `SPY` | `15144` |
| `QQQ` | `13340` |
| `XLB` | `17674` |
| `XLC` | `17675` |
| `XLE` | `17676` |
| `XLF` | `17678` |
| `XLI` | `17680` |
| `XLK` | `17681` |
| `XLP` | `17684` |
| `XLRE` | `17685` |
| `XLU` | `17690` |
| `XLV` | `17692` |
| `XLY` | `17693` |

These are metadata quote scopes, not data requests or acquisition
authorizations.

## Official public sources reviewed

- EQUS.MINI:
  <https://databento.com/docs/venues-and-datasets/equs-mini>
- Trades schema:
  <https://databento.com/docs/schemas-and-data-formats/trades>
- Common timestamp and field semantics:
  <https://databento.com/docs/standards-and-conventions/common-fields-enums-types>
- Historical metadata, cost, billable-size, range, condition, and symbology
  API reference:
  <https://databento.com/docs/api-reference-historical>
- Symbology:
  <https://databento.com/docs/standards-and-conventions/symbology>
- Usage pricing and data credits:
  <https://databento.com/docs/faqs/usage-pricing-and-data-credits>
- Current public pricing:
  <https://databento.com/pricing>
- Portal billing and credit display:
  <https://databento.com/docs/portal/billing>
- Corporate actions:
  <https://databento.com/docs/venues-and-datasets/corporate-actions>
- NYSE holidays and early closes:
  <https://www.nyse.com/markets/hours-calendars>

Public documentation was read and only the authenticated historical metadata
and symbology endpoints listed above were called. Portal pages requiring an
account remained untouched.

## Price, fee, credit, and repeat-delivery rules

Authenticated metadata reports USD `6/GiB` for historical `trades`.
Historical data is billed by uncompressed DBN bytes. HTTP/FTP delivery does not
add a delivery charge. Public material describes EQUS.MINI historical access as
having no exchange license fee, but tax, currency conversion, and any separate
reference-product fee were not exposed.

`metadata.get_cost` is a request estimate; the provider documents that final
billing is based on bytes actually sent and that estimates can over-report for
non-discrete time ranges. No public quote-expiration guarantee was found, so a
quote must be refreshed immediately before any acquisition authorization.

- repeated historical streaming is charged again for bytes sent;
- a paid batch can be downloaded repeatedly for 30 days without an additional
  data charge;
- no batch was submitted in this Action.

No quote-validity period was returned. The estimate must be refreshed
immediately before acquisition. The public USD 125 signup-credit statement
cannot establish this team's remaining credit. Current credits and projected
post-request balance are portal facts and remain unknown.

## License and usage-right decision

Public documentation generally describes data older than 24 hours as
historical and says historical access normally does not require a direct
exchange license when there is no redistribution. It also says dataset-specific
publisher restrictions pass through and directs users to the Data Catalog or
License Manager.

No dataset-specific license document or machine-readable rights object was
exposed by the authenticated historical API. The following therefore remain
`written_confirmation_required`:

1. indefinite or explicit-term local raw retention;
2. encrypted local backup and disaster recovery;
3. private internal deterministic research and replay;
4. derived one-minute candle creation and retention;
5. normalized data and non-live evidence retention;
6. internal audit/reproducibility access;
7. deletion duties after account closure or entitlement expiry;
8. permitted team/device scope;
9. prohibition and definition of external redistribution;
10. whether derived diagnostics may be committed when they contain no provider
    records and cannot reconstruct the source.

Until these are explicit, `license_sufficient` remains false.

## Corporate actions and adjustment policy

Databento publicly offers a separate point-in-time corporate-actions product
covering dividends, splits, and adjustment factors with approximately six
years of history. Its current exact account price and entitlement were not
exposed; the public path requires a separate quote/contact-sales decision.
Pricing is therefore `written_quote_required`. No corporate-action record was
requested.

The pilot proposal is explicitly `raw_unadjusted` and may be used only for
pipeline diagnostics, never for performance claims. The 252-session package
must receive a separate operator choice:

- acquire licensed point-in-time corporate actions under a separate exact
  quote; or
- remain raw-only and accept documented split/dividend discontinuities.

## Required provider provenance

A future admissible raw package must preserve, without inference:

- Databento dataset ID, schema, encoding, compression, and DBN version;
- exact request parameters and symbology mappings;
- publisher IDs and publisher metadata;
- client-library name/version and historical API version;
- entitlement-specific dataset/schema range;
- per-session dataset condition and `last_modified_date`;
- quote timestamp and exact estimated billable bytes/cost;
- acquisition timestamp and immutable raw-file digests;
- provider product/build/revision identifiers.

Authenticated provenance now includes dataset/schema range, publisher `95`,
DBN trade field types, exact symbology intervals, request scopes, per-day
condition/`last_modified_date`, record estimates, billable bytes, unit price,
and cost estimates. The candidate condition query returned `253 available` and
`9 degraded` weekday entries.

The API did not expose a provider build identifier, DBN encoder build, dataset
revision ID, or immutable revision token. Written confirmation of stable
reproduction fields remains required; a guessed or locally invented build must
not satisfy the M.1 adapter.

Publisher identity is known, but publisher-specific action/flag eligibility,
sale-condition treatment, zero/reused sequence behavior, stable raw-record
tie-break construction, and the two-second watermark remain empirically
unvalidated.

## Proposed encrypted local paths

These paths were not created or inspected:

- raw:
  `/Users/willysimonsson/Library/Application Support/trade-shadow-data/encrypted/databento/EQUS.MINI/trades/v1/raw`
- normalized:
  `/Users/willysimonsson/Library/Application Support/trade-shadow-data/encrypted/databento/EQUS.MINI/trades/v1/normalized`

Before use, the operator must verify that the parent is outside Git, accessible
only to the intended local user, backed by encrypted APFS/FileVault or an
equivalent encrypted volume, and covered by the approved retention/deletion
policy.

## Exact proposed ceilings

These are fail-safe operator ceilings, not provider estimates:

| Scope | Provider cost | Billable uncompressed DBN | Compressed transfer | Combined encrypted local raw/normalized/evidence |
| --- | ---: | ---: | ---: | ---: |
| Metadata-only gate | USD `0.00` incremental paid charge | `0` market-data bytes | `0` | `0` provider-data bytes |
| Five-session pilot | USD `0.25` all-in maximum | `32 MiB` | `32 MiB` | `1 GiB` |
| 252-session package | USD `12.00` all-in maximum | `2 GiB` | `2 GiB` | `16 GiB` |

Exceeding any ceiling must stop before batch submission or streaming. The
252-session ceilings must not be treated as evidence that the actual package
will fit.

## Remaining blockers

1. Dataset-specific retention, backup, internal research/replay, derived-data,
   audit, deletion, and redistribution terms are not captured.
2. Corporate-action entitlement, exact price, and final 252-session policy are
   unresolved.
3. Provider build/revision semantics are incomplete.
4. Publisher-specific action/flag/sale-condition and sequence/tie-break
   semantics remain unvalidated.
5. Nine candidate-range dates are marked `degraded` and need explicit
   admission treatment.
6. Compressed transfer size, tax, current credits, and projected post-request
   balance are not exposed.
7. The immutable XNYS calendar artifact does not cover the 2025 portion of the
   252-session range.
8. The M.1 nanosecond receiver extension remains unimplemented.
9. The two-second watermark remains empirically unvalidated.

## Next authorization phrase

The following phrase is intentionally conditional and is not usable while any
667M.3 binary gate above is false:

> SPÅR 3 — Action 667M.4: Jag godkänner endast en engångsanskaffning av
> Databento `EQUS.MINI` raw `trades`, `dbn` + `zstd`, för exakt symbolerna
> `SPY,QQQ,XLB,XLC,XLE,XLF,XLI,XLK,XLP,XLRE,XLU,XLV,XLY` och exakt intervallet
> `[2026-07-20T00:00:00Z, 2026-07-25T00:00:00Z)`, endast efter att en ny
> signerad 667M.3-evidens visar
> `entitlement_verified:true`, `license_sufficient:true`,
> `exact_quote_available:true` och `dataset_acquisition_ready:true`.
> `raw_unadjusted` gäller och corporate actions ingår inte. Stoppa före
> anskaffning om all-in-priset överstiger USD `0.25`, billable DBN överstiger
> `32 MiB`, komprimerad transfer överstiger `32 MiB` eller lokalt totalbehov
> överstiger `1 GiB`. Spara endast under
> `/Users/willysimonsson/Library/Application Support/trade-shadow-data/encrypted/databento/EQUS.MINI/trades/v1/raw`.
> Ingen normalization, replay, databas, canonical binding, commit, push, PR,
> deploy eller liveintegration är godkänd.

## Activity attestation

- authenticated metadata calls: `15`
- authenticated symbology calls: `1`
- unauthenticated official-document reads: performed
- market-data records received: `0`
- batch jobs submitted: `0`
- provider files generated/downloaded: `0`
- purchases, credits consumed, or account changes: `0`
- corporate-action records received: `0`
- normalization/replay/database/capture/persistence: `0`
- commits/pushes/PR/deploys: `0`
- frozen v1/v2 preparation artifacts modified: `false`
- `canonical_binding_ready: false`
- `shadow_only: true`
- `live_ranking_effect: false`
