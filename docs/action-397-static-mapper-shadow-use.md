# Action 397 - Static Mapper Shadow Use

## Purpose And Scope

Execute the one finite local static mapper shadow package approved by Action 396. The package maps exactly 20 predeclared fixture-derived/test-local inputs twice, compares bounded metadata, verifies temporary evidence, deletes it, and exits. It creates no authoritative Learning Dataset data.

## Action 396 Approval And Package Boundary

Action 396 returned `approval_decision: approved`, with 15 passed, 0 failed, and 0 unresolved conditions. Action 397 adds only:

- `scripts/action-397-static-mapper-shadow-run.mjs`
- `docs/action-397-static-mapper-shadow-use.md`
- `docs/action-397-static-mapper-shadow-input-manifest.json`
- `scripts/action-397-static-mapper-shadow-use-verify.mjs`
- `tests/e2e/action-397-static-mapper-shadow-use.spec.ts`
- minimal Actions 318-320 guard updates

No production `lib/` consumer, route, job, service, repository, replay runner, provider adapter, or tracked output evidence exists.

## Exact Manifest And Input Sources

Manifest schema is `action_397_static_mapper_shadow_manifest_v1`. The exact ordered cases are:

1. `valid_complete_mapping`
2. `valid_rich_context`
3. `valid_missing_optional_context`
4. `valid_pending_outcome`
5. `valid_incomplete_outcome`
6. `valid_stale_context`
7. `valid_partial_context`
8. `valid_conflicting_context`
9. `valid_equivalent_aliases`
10. `valid_normalized_confidence`
11. `blocked_missing_required_identity`
12. `blocked_invalid_linkage`
13. `blocked_conflicting_aliases`
14. `blocked_temporal_violation`
15. `blocked_future_leakage`
16. `blocked_invalid_provenance`
17. `blocked_invalid_outcome`
18. `blocked_invalid_input`
19. `blocked_unsupported_literal_variant`
20. `blocked_horizon_conflict`

Inputs use only Action 381 context fixtures and fixed test-local Recommendation Snapshot/Outcome wrappers. Wrappers have fixed IDs, timestamps, horizons, and values; they use no current time, randomness, environment input, arbitrary JSON, automatic discovery, database, browser, API, provider, news, downloaded market data, or replay input. Wrappers remain inside the local runner and tests and are not production contracts.

## Mapper Invocation And Expected-Value Verification

The runner verifies protected hashes and the manifest before mapping. It deep-freezes each wrapper, calls `mapSnapshotToLearningDataset`, proves the input serialization did not change, and compares status, row presence, consumable, issue codes, and stable issue paths against the frozen manifest. Blocked results are retained without filtering, retry, repair, or downgrade.

All 20 expected results matched.

## Protected Source Hashes

- mapper: `7294a851ede33aadc0dbfcb68c13337cd244002b84be7cbbe40abbe91673741d`
- learning fixtures: `706bd57150914862604af70e0bba7614151f53c32abc5dbde9595c53bf4b332b`
- context fixtures: `46358cb997b4f7a431a3fee72562659da48b13219404224f4e80e08dbf8ed406`
- pattern fixtures: `db8dae9f101f710123a0a3ac6493356bd761c15f231023ab9742caefaacf8f57`
- canonical manifest: `79c9b8587dc9c56f9751589481a7270616909cbd5ba09c0bef7e3517a3e65e20`

Mapper and fixture integrity passed before execution, after both runs, and after cleanup. Repository source status remained byte-identical across execution.

## Canonical Serialization And Determinism

Canonical JSON recursively sorts object keys, preserves array order, uses UTF-8 JSON with no insignificant whitespace, preserves null, and includes no dynamic fields. It applies no semantic categorical normalization. The same rule produces input, result, manifest, and batch SHA-256 hashes.

The batch ran exactly twice in each execution. Ordered IDs, statuses, row IDs, row-presence flags, consumable flags, issue arrays/order, result hashes, and batch hashes were identical.

- run 1 batch SHA-256: `ac9c53a650655ac088b64d517ec9bbf1005b8b3ac7d2a89430e96b3bc21585bd`
- run 2 batch SHA-256: `ac9c53a650655ac088b64d517ec9bbf1005b8b3ac7d2a89430e96b3bc21585bd`
- repeat run identical: true

## Status Counts

| Status | Count |
| --- | ---: |
| `mapped` | 4 |
| `mapped_with_missing_optional_data` | 6 |
| `blocked_missing_required_identity` | 1 |
| `blocked_invalid_linkage` | 2 |
| `blocked_conflicting_aliases` | 1 |
| `blocked_temporal_violation` | 1 |
| `blocked_future_leakage` | 1 |
| `blocked_invalid_provenance` | 1 |
| `blocked_invalid_outcome` | 1 |
| `blocked_invalid_input` | 2 |

## Metadata-Only Evidence Contract

Temporary per-case records contained only case ID, status, row ID or null, row-present, consumable, ordered issue codes/paths/severities, and canonical result hash. The batch record contained only bound hashes, counts, ordering, repeat comparison, integrity/no-effect results, classifications, and decision. No full rows, full inputs, payloads, credentials, environment values, current timestamps, random IDs, machine paths, or production identifiers were retained.

Output was classified local, disposable, synthetic/static-input-derived, non-authoritative, non-persisted, non-production, and non-learning. It is not eligible for Pattern Discovery, confidence calibration, ranking, recommendation feedback, or any production use.

## Temporary Filesystem And Cleanup Result

The runner resolved the dedicated path under `<system-temp>/ture/action-397-static-mapper-shadow/`, rejected paths outside system temp, repository paths, protected home configuration roots, symlinks, non-directories, and non-empty directories. It wrote one metadata-only `evidence.json`, read it back byte-identically, removed the dedicated directory, and verified it no longer existed.

- temporary output classification: `system_temp_disposable`
- temporary evidence deleted: true
- repository output retained: none
- application data output retained: none

## No-Effect Results

- persistence result: `none`
- replay result: `none`
- runtime result: `none`
- external-access result: `none`
- feedback result: `none`
- authoritative data created: false
- mapper consumers outside approved runner/tests: 0

No Supabase, provider, news, replay, runtime, scanner, ranking, confidence, recommendation, Pattern Discovery, or Learning Engine path was called or changed.

## Shadow Decision

- `final_shadow_decision: shadow_passed`
- case count: 20
- expected results match: true
- repeat run identical: true
- metadata only: true
- cleanup passed: true

`shadow_passed` is local static evidence only. It does not imply runtime, production, replay, persistence, calibration, Pattern Discovery, ranking, or Recommendation Engine readiness.

## Blocked Downstream Work

Production/runtime mapper consumers, persisted Learning Dataset rows, Supabase, providers/news, replay, scanner integration, Pattern Discovery, confidence calibration, ranking/recommendation feedback, authoritative evidence, background jobs, API routes, and deployment remain blocked.

## Runtime Preview And Next Permitted Action

Runtime preview remains `runtime_preview_waiting_for_operator_inputs` and was not modified or advanced.

The next permitted Action is an independent static post-shadow verification/readiness audit. It may inspect this bounded package and execution contract, but may not introduce runtime, persistence, replay, feedback, or production consumers.
