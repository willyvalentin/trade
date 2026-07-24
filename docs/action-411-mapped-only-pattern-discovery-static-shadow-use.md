# Action 411 - Mapped-Only Pattern Discovery Static Shadow Use

## Purpose

Action 411 performs one bounded, local-only, mapped-only Pattern Discovery static shadow execution. It proves the pure snapshot-to-learning mapper output can feed the pure Pattern Discovery module without creating authoritative learning data, Pattern Insights, runtime consumers, persistence, replay, external access, or feedback.

## Scope

The package reconstructs exactly ten approved mapper inputs from the Action 400 static shadow fixture builder, maps them with `mapSnapshotToLearningDataset`, verifies mapped row identity and canonical row hashes, wraps exactly ten `PatternDiscoveryRowEnvelope` objects, calls `discoverPatterns`, verifies frozen semantic hashes, repeats the full process exactly once, writes temporary metadata-only evidence, verifies it, deletes it, and exits.

## Action 410 Approval

Action 410 approved this exact downstream boundary and left runtime preview paused at `runtime_preview_waiting_for_operator_inputs`. Action 411 does not modify or advance the runtime-preview chain.

## Package Boundary

Added package files:

- `docs/action-411-mapped-only-pattern-discovery-static-shadow-input-manifest.json`
- `scripts/action-411-mapped-only-pattern-discovery-static-shadow-run.mjs`
- `docs/action-411-mapped-only-pattern-discovery-static-shadow-use.md`
- `scripts/action-411-mapped-only-pattern-discovery-static-shadow-use-verify.mjs`
- `tests/e2e/action-411-mapped-only-pattern-discovery-static-shadow-use.spec.ts`

Narrow compatibility updates are limited to Action 410 recognition and Actions 318-320 guard classification. No production consumer, runtime adapter, API route, background job, persistence module, replay runner, Supabase repository, provider adapter, calibration consumer, ranking integration, or recommendation integration is added.

## Protected Hashes

- mapper: `7294a851ede33aadc0dbfcb68c13337cd244002b84be7cbbe40abbe91673741d`
- Pattern Discovery: `48b7667c8690a1d8d56b819a3727e37ea73af7710a45131eb3debab48627191c`
- learning fixture: `706bd57150914862604af70e0bba7614151f53c32abc5dbde9595c53bf4b332b`
- context fixture: `46358cb997b4f7a431a3fee72562659da48b13219404224f4e80e08dbf8ed406`
- pattern fixture: `db8dae9f101f710123a0a3ac6493356bd761c15f231023ab9742caefaacf8f57`
- Action 400 runner: `a1123e1416df78a51645321cb9a273095c2a338febd8021265c4e3ee972d5b05`
- Action 400 manifest: `e0a2646492da2038bf156c0060c48eb8144e78ff0d57cda92a60d3ca36c95319`

## Ten-Case Inventory

Lexical evidence order:

1. `expanded_valid_bearish_risk_context`
2. `expanded_valid_fda_event_context`
3. `expanded_valid_future_event_excluded`
4. `expanded_valid_identity_nfc_equivalent`
5. `expanded_valid_identity_percent_encoding`
6. `expanded_valid_sec_event_context`
7. `valid_complete_mapping`
8. `valid_equivalent_aliases`
9. `valid_normalized_confidence`
10. `valid_rich_context`

No case may be added, removed, renamed, reordered, substituted, dynamically discovered, or accepted from user input.

## Exclusions

The runner aborts before Pattern Discovery for any manifest or reconstructed input outside the exact ten-case manifest, including `mapped_with_missing_optional_data`, any `blocked_*` mapper result, pending, incomplete, stale, partial, conflicting, unknown, unavailable, lineage-unverified, externally supplied, persisted, runtime-derived, or environment-derived inputs.

## Mapper Reconstruction

The runner calls the Action 400 static fixture builder, selects only the exact ordered case IDs, verifies each case's source fixture IDs and canonical mapper input hash, calls `mapSnapshotToLearningDataset`, and checks that the original input did not mutate.

## Row Verification

Every mapped result must be:

- status: `mapped`
- row present: `true`
- consumable: `true`
- setup family: `momentum_continuation`
- horizon: `60m`
- outcome classification: `target_hit`
- anti-leakage status: `passed`

Expected canonical row hashes are frozen in the manifest. Duplicate row identity is expected: ten case observations collapse to three unique mapper row IDs, with the shared snapshot row appearing eight times.

## Pattern Discovery Configuration

The runtime configuration is explicit:

- contract version: `pure_pattern_discovery_contract_v1`
- configuration version: `pattern_discovery_setup_family_v1`
- grouping dimension: `setup_family`
- allowed setup family: `momentum_continuation`
- horizon: `60m`
- minimum total support: `20`
- minimum completed outcomes: `20`
- numeric scale: `1000000`
- output decimal places: `4`
- rounding mode: `half_away_from_zero`
- evidence unit: `action_400_case_lineage`
- group key schema: `pattern_group:v1`
- static-only: `true`
- non-authoritative: `true`
- no persistence/replay/runtime/feedback: `true`

The manifest additionally records grouping key version `v1`, taxonomy version `pattern_discovery_setup_family_v1`, and stable sorting policy `lexical_source_case_id_then_mapper_row_id`.

## Expected Result

- top-level status: `insufficient_evidence`
- group count: `1`
- group key: `pattern_group:v1|setup_family=momentum_continuation`
- group status: `insufficient_evidence`
- case support count: `10`
- unique mapper row count: `3`
- completed outcomes: `10`
- positive: `10`
- negative: `0`
- neutral: `0`
- warnings: `minimum_total_support_not_met`, `minimum_completed_outcomes_not_met`, `duplicate_mapper_row_identity`
- insight count: `0`
- non-authoritative: `true`

## Semantic Hashes

- evidence-set hash: `f1f0053264c85d640d46b61da0ce7120e491309e3070132fe74a69a68438cbd8`
- group hash: `aa2ae3f39146ce1c6fc1f6ed73e19e96b02b7866b34e75b61c471a8277a1122e`
- result hash: `e911709a784159c684a350de490fd56446ee23c23b3bf5ea2fbb70378ebf253c`

## Actual Result

The local Action 411 run returned:

- final shadow decision: `shadow_passed`
- case count: `10`
- mapper reconstruction: `passed`
- row ID/hash verification: `passed`
- duplicate inventory: `passed`
- Pattern Discovery status: `insufficient_evidence`
- group status: `insufficient_evidence`
- support counts: `10` case support, `3` unique mapper rows
- outcome counts: `10` completed, `10` positive, `0` negative, `0` neutral
- warning codes: `minimum_total_support_not_met`, `minimum_completed_outcomes_not_met`, `duplicate_mapper_row_identity`
- insight count: `0`

## Repeat-Run Determinism

The complete mapper-to-Pattern-Discovery process executes exactly twice. Both runs returned identical mapper statuses, row IDs, row hashes, duplicate inventory, group ordering, evidence ordering, semantic hashes, statuses, counts, warnings, insight count, and batch hash.

- run 1 batch hash: `bad2ba397af95ace6883e2ea45bbd046bd4d6ad23264103aef34184468853be3`
- run 2 batch hash: `bad2ba397af95ace6883e2ea45bbd046bd4d6ad23264103aef34184468853be3`

No third execution or retry is allowed.

## Metadata-Only Evidence

Temporary evidence contains only case ID, mapper status, mapper row ID, canonical row hash, consumable flag, group key, semantic hashes, statuses, support counts, outcome counts, warning codes, insight count, canonical result hash, manifest hash, protected source hashes, fixture hashes, Action 400 hashes, both batch hashes, cleanup status, final decision, and no-effect declarations.

It must not retain full mapper inputs, full rows, full snapshots, full contexts, full outcomes, full Pattern Discovery result objects, full insights, credentials, environment values, dynamic timestamps, random run IDs, or permanent machine paths.

## Path Safety

The only temporary output path is:

`<system-temp>/ture/action-411-mapped-only-pattern-discovery-shadow/`

The runner requires the path to be outside the repository, outside immutable preview candidate paths, outside home/config/application data locations, free of path traversal, free of symlinks in the target or parent chain, and absent or empty before execution.

## Cleanup

The runner writes `metadata-evidence.json`, verifies canonical readback, deletes the dedicated temporary directory, verifies it no longer exists, and verifies source status did not change. Cleanup failure returns `shadow_failed`.

## Integrity

Source integrity, fixture integrity, and Action 400 historical integrity are rechecked before and after execution. Protected hashes remained unchanged.

## No Effects

- persistence result: `none`
- replay result: `none`
- runtime result: `none`
- external access result: `none`
- feedback result: `none`
- authoritative data created: `false`
- provider calls: `false`
- Supabase reads/writes: `false`
- scanner behavior changed: `false`
- live ranking changed: `false`
- recommendations mutated: `false`

## Classification

This Action is static-only, local-only, non-production, non-authoritative, non-learning, metadata-only, and bounded to the approved Action 411 package.

## Runtime Preview

Runtime preview remains paused at:

`runtime_preview_waiting_for_operator_inputs`

## Final Shadow Decision

`shadow_passed`

## Next Independent Audit Action

The next permitted action is an independent Action 412 audit: `action_412_independent_mapped_only_pattern_discovery_static_shadow_verification_and_hash_audit`.
