# Action 667M.4B.1 — Databento dataset discovery diagnosis

Date: 2026-07-27

## Result

The contradiction is resolved as a local `contractimplementation bug`:
`range_filtered_discovery_used_as_catalog_membership`.

Databento SDK `0.82.0` and DBN decoder `0.63.0` were used for one bounded
metadata-only experiment. The SDK transport source was inspected before the
experiment and uses direct Requests calls with no configured automatic retry.

Exactly nine authenticated operations were made:

1. SDK `metadata.list_datasets()` without parameters;
2. SDK `metadata.list_datasets(start_date="2026-07-20",
   end_date="2026-07-25")`;
3. one raw HTTP ranged `metadata.list_datasets` comparison;
4. `list_schemas("EQUS.MINI")`;
5. `get_dataset_range("EQUS.MINI")`;
6. `get_dataset_condition` for the five pilot dates;
7. exact 13-symbol symbology resolution;
8. cost estimate;
9. billable-size estimate.

There were zero retries, batch calls, timeseries calls, downloads, streams or
purchases.

## Discovery evidence

| Variant | HTTP | Runtime | Count | Exact `EQUS.MINI` | Sanitized list digest |
| --- | ---: | --- | ---: | --- | --- |
| SDK range-less | 200 | `list[str]` | 29 | yes | `8163a0ea289713a94756ea7ff7e191b340e6bf6d5f185e81eebf12032c52bbe8` |
| SDK ranged | 200 | `list[str]` | 4 | no | `425afc43a384fddbdcc2b7eab409e07d6f7da9a78b8a92c046c934c1a4b84929` |
| raw HTTP ranged | 200 | `list[str]` | 4 | no | `425afc43a384fddbdcc2b7eab409e07d6f7da9a78b8a92c046c934c1a4b84929` |

Range-less `EQUS.MINI` is exact ASCII with no surrounding whitespace:
`U+0045 U+0051 U+0055 U+0053 U+002E U+004D U+0049 U+004E U+0049`.
No normalized-near candidate appeared in either ranged response.

SDK and raw HTTP therefore agree. The issue was not parameter formatting,
timestamps, Unicode, SDK normalization, provider transient behavior or an
SDK/HTTP mismatch. The local M.4B runtime check incorrectly treated the
ranged/filtering response as the catalog-membership authority.

Databento documents range-less `metadata.list_datasets()` as the operation
that lists all valid dataset IDs. Its optional dates are inclusive-start and
exclusive-end bare-date filters. Catalog membership and point-in-time
entitlement/availability are different questions.

## Remediation

`market_context_databento_dataset_discovery_admission_v1` now requires:

- range-less `metadata.list_datasets()` with both date parameters absent;
- an HTTP-success response that is exactly a list of unique canonical strings;
- exactly one exact ASCII `EQUS.MINI`;
- rejection of whitespace, compatibility-normalized lookalikes, duplicates and
  malformed responses;
- failure on SDK/raw HTTP disagreement whenever a raw comparison is supplied;
- separate `get_dataset_range` and `get_dataset_condition` gates.

Dataset-specific endpoint success remains corroborating evidence only. It
cannot override missing catalog membership, and no caller-supplied membership
boolean is accepted.

The fresh dataset-specific evidence remained green: `trades` schema, full
entitlement range, five `available` dates, 13/13 symbols, USD
`0.138445436954` estimate and 24,775,776 billable bytes.

## Independent read-only review

The re-review found zero blockers, majors, minors or nits. Exact membership was
retained, range and entitlement remain separate, malformed and disagreement
paths fail closed, input ordering is deterministic, and no credential,
provider client, batch, timeseries, database, replay or live integration exists
in the normative module.

Evidence digest:
`a83e835b63a0d334ed289fee461c192399e0fa74868a5b9b2a5f9614657c4fb1`.

Statuses:

- `action_667m4b1_discovery_root_cause_identified: true`
- `action_667m4b1_dataset_membership_verified: true`
- `action_667m4b1_discovery_contract_remediated: true`
- `action_667m4b1_independent_review_approved: true`
- `action_667m4b2_batch_submission_ready: true`
- `batch_submission_authorized: false`
- `download_authorized: false`
- `normalization_authorized: false`
- `replay_authorized: false`

`action_667m4b2_batch_submission_ready` means only that the corrected local
contract is ready for a new, separately authorized Action with a fresh quote,
entitlement, conditions, range-less membership and all M.4A gates. It is not
submission authorization.
