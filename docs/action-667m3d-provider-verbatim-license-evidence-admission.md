# Action 667M.3D — Provider-verbatim license evidence admission

## Evidence boundary

No local provider email, screenshot, or other direct provider file was found
inside the permitted worktree evidence scope. This Action therefore preserves
the operator's exact transcription as
`operator_transcribed_provider_verbatim`. It is not represented as a direct
provider file.

No provider response date, sender, recipient, email address, account
identifier, request identifier, credential, or other sensitive provenance is
available or inferred. The Action performs no provider contact, credential
access, quote, purchase, download, normalization, replay, database operation,
commit, push, PR update, deployment, canonical binding, or live integration.

The three exact transcribed question/answer pairs are:

1. `Om indefinite retention även omfattar encrypted backup/disaster-recovery copies:`
   `Yes`
2. `Om derived candles, aggregate metrics, hashes och internal research evidence får behållas obegränsat, även efter kontoavslut och organisationsomfattande:`
   `Yes`
3. `Om särskilda audit-, logging-, notification-, evidence-retention- eller deletion requirements gäller:`
   `No.`

The new evidence is additive. The M.3C evidence and freeze remain
byte-identical.

## Reconciliation with prior written confirmation

The new exact responses are consistent with the earlier
`operator_attested_provider_confirmation`:

- all downloaded data may be retained indefinitely;
- retention survives account closure;
- the right covers all users in the operator's organization.

Together, the evidence resolves encrypted backup/disaster recovery, derived
candle and derived evidence retention, and special audit/deletion obligations.
No contradictory answer was found.

The evidence does not change the permanent boundaries:

- redistribution is forbidden;
- use is internal and non-display;
- corporate actions are excluded;
- the pilot is `raw_unadjusted`;
- no production or performance claim is permitted.

## Binary license decision

- `license_sufficient: true`
- `raw_retention_allowed: true`
- `encrypted_backup_allowed: true`
- `retention_after_account_closure_allowed: true`
- `organization_wide_internal_use_allowed: true`
- `derived_candles_retention_allowed: true`
- `derived_evidence_retention_allowed: true`
- `offline_replay_allowed: true`
- `special_audit_or_deletion_requirements: false`
- `redistribution_allowed: false`
- `corporate_actions_included: false`

The decision is scoped only to the fixed internal, non-display,
non-redistributed, raw-unadjusted pilot.

## M.4 readiness

The unchanged M.3A pilot contract still requires a future M.4 preflight to
provide:

- a quote and entitlement no more than 900 seconds old;
- all five dates exactly `available`;
- exact `EQUS.MINI` / `trades` / publisher `95`, the 13 fixed symbols, and
  `[2026-07-20T00:00:00Z, 2026-07-25T00:00:00Z)`;
- provider build, DBN decoder/encoder build, and dataset revision;
- immutable XNYS calendar evidence;
- an encrypted destination outside Git;
- hard stops at USD `0.25`, 32 MiB billable, 32 MiB transfer, and 1 GiB total
  local storage;
- batch condition, metadata, and manifest provenance;
- actual compressed and uncompressed file SHA-256 after download;
- immutable source-file identity plus record ordinal as the stable tie-break
  because EQUS.MINI `sequence` is zero.

The two-second watermark remains `empirically_unvalidated`. No normalization
or replay is permitted by M.4.

Readiness means only ready to request a separate operator authorization:

- `technical_pre_download_ready: true`
- `dataset_acquisition_ready: true`
- `operator_acquisition_authorized: false`
- `download_authorized: false`
- `normalization_authorized: false`
- `replay_authorized: false`

Accordingly:

- `action_667m3d_provider_evidence_admitted: true`
- `action_667m3d_license_sufficient: true`
- `action_667m3d_pilot_pre_download_ready: true`
- `action_667m4_dataset_acquisition_ready: true`

## Verification and findings

The fresh relevant Action 667K–667M.3D regression passed `125/125` tests,
including byte-identical UTC, Europe/Stockholm, and America/New_York child
processes. TypeScript, scoped ESLint, canonical JSON parity, predecessor-freeze
parity, and `git diff --check` passed.

Digests:

- canonical provider evidence:
  `09bc39116d3f6f87d030ff74686eeb67cbd7833597e2b62b34b5923c5e893694`;
- license/readiness decision:
  `e23925e9517acf4048702e941ef588155bb107ef9729aaa9311aa08528fefa1f`;
- aggregate K–M.3D cross-timezone evidence:
  `5ff51f6ddcde3bf531dfd3d7436cf962d043be11c7db698911005dd1d19a18e1`.

No contradictions, license blockers, implementation blockers, or major
findings were found. One transparent technical minor remains: the two-second
watermark is empirically unvalidated. The absence of a direct provider file is
recorded as a provenance limitation, but is not hidden or misclassified.

## Inactive future M.4 authorization phrase

The following exact phrase is inactive in this Action. It is a template for a
new, explicit operator authorization:

> SPÅR 3 — Action 667M.4: Jag godkänner en enda fail-closed Databento-preflight och, endast om samtliga grindar passerar, en engångsdownload av `EQUS.MINI` raw `trades`, `dbn` + `zstd`, publisher `95`, för exakt symbolerna `SPY,QQQ,XLB,XLC,XLE,XLF,XLI,XLK,XLP,XLRE,XLU,XLV,XLY` och exakt intervallet `[2026-07-20T00:00:00Z, 2026-07-25T00:00:00Z)`. Använd endast den lokalt konfigurerade credentialen i processminne utan att skriva ut eller persist credentials. Kräv en högst 900 sekunder gammal quote och entitlement, samtliga fem dagar `available`, exakt provider-/decoder-/datasetrevision, immutable XNYS-calendar och verifierad krypterad destination utanför Git. Stoppa före download om priset överstiger USD `0.25`, billable bytes överstiger `32 MiB`, transfer överstiger `32 MiB` eller lokalt totalbehov överstiger `1 GiB`. `raw_unadjusted` gäller och corporate actions ingår inte. Spara endast under `/Users/willysimonsson/Library/Application Support/trade-shadow-data/encrypted/databento/EQUS.MINI/trades/v1/raw`. Efter download får endast batchmetadata, faktiska file SHA-256, immutable file identity och record ordinal verifieras. Ingen normalization, replay, databas, canonical binding, commit, push, PR, deploy eller liveintegration är godkänd.
