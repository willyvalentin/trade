# Action 399 - Expanded Static Mapper Shadow Batch Approval Gate

## Purpose And Scope

Decide whether one future expanded local static shadow package may add coverage without changing the mapper, Action 397, fixtures, runtime, persistence, replay, or feedback boundaries. This Action is approval-gate-only: it creates no expanded runner or manifest and executes no new shadow case.

## Authoritative Dependencies

This gate builds on Actions 309, 352, 380, 381, 387-395, 396, 397, and 398. Action 397 supplied the immutable first-batch evidence; Action 398 independently returned `readiness_decision: ready`.

## Action 397 Execution Result

Action 397 remains `shadow_passed`: 20 cases, exactly two runs, all expectations matched, identical batch hashes, metadata-only temporary evidence deleted, no tracked result, and no authoritative/persistence/replay/runtime/external-access/feedback effect.

## Action 398 Readiness Result

Action 398 returned:

- `readiness_decision: ready`
- `passed_conditions_count: 16`
- `failed_conditions_count: 0`
- `unresolved_conditions_count: 0`

It reproduced the exact status distribution and batch hash `ac9c53a650655ac088b64d517ec9bbf1005b8b3ac7d2a89430e96b3bc21585bd`.

## Protected Hashes

- mapper: `7294a851ede33aadc0dbfcb68c13337cd244002b84be7cbbe40abbe91673741d`
- learning fixtures: `706bd57150914862604af70e0bba7614151f53c32abc5dbde9595c53bf4b332b`
- context fixtures: `46358cb997b4f7a431a3fee72562659da48b13219404224f4e80e08dbf8ed406`
- pattern fixtures: `db8dae9f101f710123a0a3ac6493356bd761c15f231023ab9742caefaacf8f57`
- Action 397 runner: `eaab84c16302a8e2f27ae4043e810af9b405dd5a6e818db9d4784eb4d8ca291b`
- Action 397 raw manifest: `e9afd2d63a8f0d0041e14b60ae282cabe1afc742aeb707d65bf2ae2d67ccd741`
- Action 397 canonical manifest: `79c9b8587dc9c56f9751589481a7270616909cbd5ba09c0bef7e3517a3e65e20`

## Explicit Non-Goals

No mapper, fixture, Action 397 runner/manifest, expanded runner/manifest, expanded execution, tracked evidence, live/production/database/replay input, Supabase/provider/news access, persisted row, runtime consumer, Pattern Discovery, confidence/ranking/scanner/recommendation feedback, schema/migration, deployment, or runtime-preview advancement is permitted.

## Expansion Rationale And Current Coverage

The first 20 cases cover both success statuses, all eight blocked statuses, missing data, rich/stale/partial/conflicting contexts, aliases, identity/linkage/temporal/leakage/provenance/outcome/input failures, exact-literal rejection, deterministic evidence, and cleanup.

Action 398 identified reviewable gaps: remaining valid Action 381 contexts, broader malformed category/freshness/numeric/horizon/linkage/provenance/window cases, additional anti-leakage and multi-fault precedence, and deterministic NFC/percent-encoding identity behavior.

Expansion is approved only to close those gaps. No case exists merely to increase count.

## Expanded Count And Additive Policy

The exact total is **40 cases**: the original 20 retained cases followed by exactly 20 new cases. Forty remains small, finite, reviewable, deterministic, and independently auditable.

The expansion is additive. Original Action 397 case IDs, order indexes 1-20, source wrappers, expectations, canonical input hashes, historical result hashes, runner, and manifest remain unchanged. The new cases occupy indexes 21-40. Replacement, mutation, reordering, configurable counts, runtime-selected counts, and automatic future-fixture inclusion are forbidden.

## Allowed And Forbidden Sources

Allowed sources are exact Action 380/381 static fixtures, Action 397 test-local wrapper conventions, manually declared static invalid variants, and fixed source-controlled constants. Every source and patch must be enumerated before implementation.

Forbidden sources are production/live recommendations, Supabase/database rows, provider/news data, historical downloads, replay captures, browser/localStorage, environment-derived cases, arbitrary files/JSON, stdin, arbitrary CLI paths, directory/glob discovery, network responses, and user/runtime-selected inputs.

## Exact New Case Inventory

`none` below means no issue is expected. All row/consumable values are frozen, not derived during execution.

| # | Case ID | Coverage family | Source fixture IDs / fixed wrapper | Expected status | Row / consumable | Primary issue / stable path | Need and Action 398 gap |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 21 | `expanded_valid_bearish_risk_context` | valid context | `intelligence_context:v1:002:bearish_risk`, Action 397 complete wrapper | `mapped` | true / true | none | Adds bearish/index-risk Action 381 coverage |
| 22 | `expanded_valid_fda_event_context` | valid context | `intelligence_context:v1:007:fda`, complete wrapper | `mapped` | true / true | none | Adds FDA/news-event variation |
| 23 | `expanded_valid_sec_event_context` | valid context | `intelligence_context:v1:008:sec`, complete wrapper | `mapped` | true / true | none | Adds SEC/news-event variation |
| 24 | `expanded_valid_future_event_excluded` | anti-leakage valid | `intelligence_context:v1:012:future_event_excluded`, complete wrapper | `mapped` | true / true | none | Proves explicitly excluded future facts remain valid |
| 25 | `expanded_valid_news_unavailable_context` | valid missing data | `intelligence_context:v1:009:news_unavailable`, complete wrapper | `mapped_with_missing_optional_data` | true / true | `unavailable_source` / `/contextSnapshot/data_provenance` | Adds unavailable freshness/provenance context |
| 26 | `expanded_valid_missing_semantics_context` | valid missing data | `intelligence_context:v1:014:missing_semantics`, complete wrapper | `mapped_with_missing_optional_data` | true / true | `partial_provenance` / `/contextSnapshot/data_provenance` | Adds unknown/explicit missing semantics |
| 27 | `expanded_valid_identity_nfc_equivalent` | deterministic identity | base fixture plus fixed decomposed fingerprint `cafe\u0301` and matching outcome fingerprint | `mapped` | true / true | none | Adds NFC-equivalent identity; row ID must equal NFC-composed expectation under frozen identity rule |
| 28 | `expanded_valid_identity_percent_encoding` | deterministic identity | base fixture plus fixed fingerprint `shadow|percent% /397` and matching outcome fingerprint | `mapped` | true / true | none | Adds percent-sensitive identity; row ID must contain `%7C`, `%25`, `%20`, and `%2F` |
| 29 | `expanded_blocked_context_category_uppercase` | malformed category | base fixture; market regime value `BULLISH` | `blocked_invalid_provenance` | false / false | `invalid_provenance` / `/contextSnapshot/context/market/market_regime/value` | Adds unsupported categorical case variant |
| 30 | `expanded_blocked_freshness_unicode_padding` | literal validation | base fixture; freshness state `fresh\u00a0` | `blocked_invalid_provenance` | false / false | `invalid_provenance` / `/contextSnapshot/freshness/state` | Adds Unicode-padding rejection |
| 31 | `expanded_blocked_numeric_context_string` | malformed numeric | base fixture; `stock_vs_spy.value = "0.5"` | `blocked_invalid_provenance` | false / false | `invalid_provenance` / `/contextSnapshot/context/relative_strength/stock_vs_spy/value` | Adds numeric-string context rejection |
| 32 | `expanded_blocked_payload_horizon_numeric` | horizon validation | base wrapper; payload horizon numeric `60` | `blocked_invalid_input` | false / false | `invalid_input` / `/recommendationSnapshot/payload_json/outcome_horizon` | Adds non-string payload horizon |
| 33 | `expanded_blocked_outcome_horizon_uppercase` | horizon validation | payload horizon absent; outcome horizon `60M` | `blocked_invalid_outcome` | false / false | `invalid_outcome` / `/outcome/horizon` | Adds outcome literal/case rejection |
| 34 | `expanded_blocked_linkage_fingerprint` | linkage | base wrapper; outcome snapshot fingerprint `snapshot_fingerprint:other` | `blocked_invalid_linkage` | false / false | `invalid_linkage` / `/outcome/snapshot_fingerprint` | Adds a second linkage-field path |
| 35 | `expanded_blocked_stale_complete_contradiction` | provenance contradiction | stale-source fixture patched to complete provenance with complete audit fields | `blocked_invalid_provenance` | false / false | `invalid_provenance` / `/contextSnapshot/data_provenance/state` | Adds stale-versus-complete contradiction |
| 36 | `expanded_blocked_anti_leakage_unknown` | anti-leakage | base fixture; `anti_leakage_status = "unknown"` | `blocked_future_leakage` | false / false | `future_leakage` / `/contextSnapshot/anti_leakage_status` | Adds non-passed anti-leakage state |
| 37 | `expanded_blocked_invalid_trading_window` | malformed input | base wrapper; recommendation window `overnight` | `blocked_invalid_input` | false / false | `invalid_input` / `/recommendationSnapshot/window` | Adds unsupported trading window |
| 38 | `expanded_precedence_identity_over_provenance` | multi-fault precedence | empty snapshot ID plus freshness state ` fresh ` | `blocked_missing_required_identity` | false / false | `missing_required_identity` / `/recommendationSnapshot/id` | Proves identity outranks provenance |
| 39 | `expanded_precedence_linkage_over_freshness` | multi-fault precedence | mismatched outcome snapshot ID plus freshness state ` fresh ` | `blocked_invalid_linkage` | false / false | `invalid_linkage` / `/outcome/snapshot_id` | Proves linkage outranks freshness |
| 40 | `expanded_precedence_leakage_over_outcome` | multi-fault precedence | anti-leakage failed plus outcome status `magic` | `blocked_future_leakage` | false / false | `future_leakage` / `/contextSnapshot/anti_leakage_status` | Proves leakage outranks invalid outcome |

Action 400 may implement only these exact 20 additions and fixed patches. It may not substitute or discover cases.

## Coverage Policies

### Status Coverage

Both success statuses and all eight blocked statuses must remain represented. Original counts remain historical; additions are predetermined below.

### Valid And Malformed Domains

Valid additions cover bearish risk, FDA, SEC, explicitly excluded future facts, unavailable news, missing semantics, and identity encoding. Malformed additions cover category casing, Unicode freshness, numeric strings, horizon type/case, linkage fingerprint, provenance contradiction, anti-leakage unknown, and invalid windows.

### Context, Outcome, Provenance, And Anti-Leakage

Only the named Action 381 fixtures and fixed patches are allowed. Outcome changes are limited to the named horizon, fingerprint, and invalid-status wrappers. Provenance contradiction and unknown anti-leakage cases must preserve their exact primary paths.

### Alias, Literal, And Precedence

Original alias cases remain. New literal cases add Unicode freshness and payload/outcome horizon forms. The three named multi-fault cases freeze identity-over-provenance, linkage-over-freshness, and leakage-over-outcome precedence. Broader precedence remains a future separately gated concern.

### Deterministic Identity And Unicode

NFC and percent-encoding wrappers use fixed strings and matching linkage fields. Action 400 must freeze their canonical input hashes and expected row-ID assertions in the expanded manifest before executing. It may not learn identity expectations from actual run output.

## Expanded Manifest Contract

The future manifest path is `docs/action-400-expanded-static-mapper-shadow-input-manifest.json`. It must use a new versioned schema and contain exactly 40 ordered cases, references to the immutable original 20 definitions/hashes, the exact new 20 definitions, all protected hashes, Action 397 runner/raw/canonical manifest hashes, static/non-production/non-authoritative/no-replay/no-persistence/no-runtime/no-feedback declarations, case IDs/indexes, source IDs, wrapper classifications, expected statuses, row/consumable values, issue expectations, identity assertions where applicable, and canonical input hashes.

No full row, input, payload, context, outcome, secret, environment value, dynamic timestamp, or machine path is allowed. The original Action 397 manifest must not be modified.

## Separate Runner Boundary

The future runner path is `scripts/action-400-expanded-static-mapper-shadow-run.mjs`. It must be separate from and must not modify or turn Action 397 into an extensible input engine. Conceptual reuse is allowed only within a new fixed implementation.

The runner may verify hashes, load only the fixed expanded manifest, validate exactly 40 cases, construct explicit wrappers, invoke the mapper, compare frozen expectations, capture bounded metadata, execute exactly twice, compare deterministic results, write one Action-specific temp artifact, verify it, remove it, recheck integrity, and exit.

No retry, third run, discovery, arbitrary input, suppression, manifest rewrite, persistence, external communication, runtime import, or output consumer is approved.

## Expected Status Distribution

| Status | Original 20 | Added 20 | Expanded 40 |
| --- | ---: | ---: | ---: |
| `mapped` | 4 | 6 | 10 |
| `mapped_with_missing_optional_data` | 6 | 2 | 8 |
| `blocked_missing_required_identity` | 1 | 1 | 2 |
| `blocked_invalid_linkage` | 2 | 2 | 4 |
| `blocked_conflicting_aliases` | 1 | 0 | 1 |
| `blocked_temporal_violation` | 1 | 0 | 1 |
| `blocked_future_leakage` | 1 | 2 | 3 |
| `blocked_invalid_provenance` | 1 | 4 | 5 |
| `blocked_invalid_outcome` | 1 | 1 | 2 |
| `blocked_invalid_input` | 2 | 2 | 4 |
| **Total** | **20** | **20** | **40** |

Action 400 must compare against this distribution. It may not derive or rewrite expected counts from actual outputs.

## Metadata-Only Output Boundary

Per-case evidence is limited to case ID, status, row ID where present, row-present, consumable, ordered issue codes/paths/severities, and canonical result hash. Batch evidence is limited to protected/original/expanded manifest hashes, 40-case count/order/statuses, two batch hashes, repeat/integrity/cleanup/no-effect results, authoritative-data false, and final decision.

Full rows and inputs are forbidden. Output remains synthetic/static-derived, local, disposable, non-authoritative, non-production, non-learning, non-persisted, not replay/backfill/live intelligence, and ineligible for Pattern Discovery, calibration, ranking, scanner, recommendation, or Learning Engine feedback.

## Determinism And Hash Requirements

Exactly two runs are required. Case order, statuses, row IDs, row/consumable flags, issue arrays/order, result hashes, status counts, and batch hashes must match. Per-input, per-result, original manifest, expanded manifest, and both batch SHA-256 values are required. Any mismatch returns `shadow_failed`; a third repair run is forbidden.

## Temporary Path And Cleanup

The only output category is `<system-temp>/ture/action-400-expanded-static-mapper-shadow/`. It must remain outside repository, immutable candidate, application data, and HOME/config paths. Repository traversal, dangling/resolved/parent-chain symlinks, unsafe files, and non-empty directories must fail closed.

The metadata artifact must be read back, deleted, and the dedicated path verified absent. No tracked result evidence or stale temp file may remain.

## Hard No-Effect Requirements

- persistence/Supabase/database writes: none
- replay: none
- runtime/routes/jobs: none
- provider/news/network access: none
- Pattern Discovery/calibration/ranking/scanner/recommendation feedback: none
- event/queue/analytics output: none
- authoritative data created: false

## Stop Conditions

Action 400 must return `shadow_aborted` before mapping if mapper/fixture/Action 397 runner/manifest hashes differ, the expanded manifest/count/order/hash is invalid, a case is unapproved, arbitrary input/discovery appears, a production consumer appears, temp path is unsafe, or runtime/provider/Supabase/replay imports appear.

It must return `shadow_failed` after mapping if expectations/status counts/runs differ, cleanup or source integrity fails, full rows are retained, external access/persistence/feedback occurs, or authoritative data is created. No same-Action repair or retry is allowed.

Future execution vocabulary is exactly `shadow_passed`, `shadow_passed_with_conditions`, `shadow_failed`, and `shadow_aborted`. Success remains static evidence only.

## Approval Vocabulary And Decision

Action 399 vocabulary is exactly `approved`, `approved_with_conditions`, and `blocked`.

Deterministic approval requires Action 398 ready, exact count and inventory, static sources, immutable Action 397, predetermined distribution, metadata-only/two-run/temp-cleanup boundaries, no persistence/replay/runtime/external access/feedback, no authoritative data, and a narrow implementation package.

- `approval_decision: approved`
- `passed_conditions_count: 18`
- `failed_conditions_count: 0`
- `unresolved_conditions_count: 0`

## Next Permitted Action

The next permitted Action is Action 400: implement and execute only this exact 40-case expanded static package. It must add a new manifest and separate runner, retain Action 397 unchanged, and must not advance `runtime_preview_waiting_for_operator_inputs`.
