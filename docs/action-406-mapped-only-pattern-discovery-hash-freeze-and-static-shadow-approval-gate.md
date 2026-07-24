# Action 406 - Mapped-Only Pattern Discovery Hash Freeze And Static Shadow Approval Gate

## Purpose

Freeze the exact mapped-only Pattern Discovery hash inputs for the ten Action 402-approved rows and decide whether a separate static downstream Pattern Discovery shadow execution may be implemented.

## Scope

This is a static, local-only, deterministic, bounded, non-authoritative approval gate. It reconstructs rows in memory through the pure mapper only for hash-freeze verification. It does not execute Pattern Discovery shadow, persist anything, replay anything, call providers, read Supabase, add runtime routes, or create feedback.

## Authoritative Dependencies

- Action 309 post-recovery safe development protocol.
- Action 335 Learning Dataset design.
- Action 357 Pattern Insight static fixtures.
- Action 380 Learning Dataset static fixtures.
- Action 381 Intelligence Context static fixtures.
- Action 385 Learning-to-Pattern compatibility.
- Actions 387-401 mapper implementation and static shadow chain.
- Action 402 pure Pattern Discovery contract.
- Action 403 Pattern Discovery implementation approval gate.
- Action 404 pure Pattern Discovery implementation.
- Action 405 independent Pattern Discovery verification.

## Action 405 Readiness Result

Action 405 returned `ready_with_conditions`: 17 passed, 0 failed, and 1 unresolved condition.

## Remaining Action 405 Condition

Exact reconstructed Action 400 row hashes, evidence-set hash, and group hash must be frozen through a separate mapped-only gate before downstream shadow execution. This document and verifier satisfy that hash-freeze gate without executing `discoverPatterns`.

## Known Action 404 Lint Debt

`npm run lint` remains blocked by pre-existing Action 404 `no-explicit-any` errors and existing warnings. Action 406 does not remediate those errors. A later shadow execution may be designed, but must not be classified as fully repository-validated until lint passes in a separate remediation.

## Explicit Non-Goals

This action does not modify the mapper, modify pure Pattern Discovery, fix Action 404 lint errors, add a downstream runner, add a downstream execution manifest, execute Pattern Discovery shadow, generate full Pattern Insights, use missing/blocked mapper outputs, add cases, use runtime inputs, use replay, use Supabase, access providers/news, persist rows, persist insights, modify calibration, modify ranking/scanner/confidence/recommendations, modify schemas/migrations, or advance runtime preview.

## Protected-Source Inventory

- Mapper: `lib/snapshot-to-learning-dataset-mapper.ts` = `7294a851ede33aadc0dbfcb68c13337cd244002b84be7cbbe40abbe91673741d`
- Pure Pattern Discovery: `lib/pure-pattern-discovery.ts` = `48b7667c8690a1d8d56b819a3727e37ea73af7710a45131eb3debab48627191c`
- Learning fixtures: `lib/learning-dataset-static-fixtures.ts` = `706bd57150914862604af70e0bba7614151f53c32abc5dbde9595c53bf4b332b`
- Context fixtures: `lib/intelligence-context-static-fixtures.ts` = `46358cb997b4f7a431a3fee72562659da48b13219404224f4e80e08dbf8ed406`
- Pattern fixtures: `lib/pattern-insight-static-fixtures.ts` = `db8dae9f101f710123a0a3ac6493356bd761c15f231023ab9742caefaacf8f57`
- Action 400 runner: `scripts/action-400-expanded-static-mapper-shadow-run.mjs` = `a1123e1416df78a51645321cb9a273095c2a338febd8021265c4e3ee972d5b05`
- Action 400 manifest: `docs/action-400-expanded-static-mapper-shadow-input-manifest.json` = `e0a2646492da2038bf156c0060c48eb8144e78ff0d57cda92a60d3ca36c95319`

## Exact Eligible-Case Inventory

Only these ten case IDs are eligible:

1. `valid_complete_mapping`
2. `valid_rich_context`
3. `valid_equivalent_aliases`
4. `valid_normalized_confidence`
5. `expanded_valid_bearish_risk_context`
6. `expanded_valid_fda_event_context`
7. `expanded_valid_sec_event_context`
8. `expanded_valid_future_event_excluded`
9. `expanded_valid_identity_nfc_equivalent`
10. `expanded_valid_identity_percent_encoding`

## Exact Excluded-Case Policy

All other Action 400 cases are excluded: mapped-with-missing-optional-data cases, every `blocked_*` case, pending outcomes, incomplete outcomes, stale rows, partial rows, conflicting rows, unknown rows, unavailable rows, externally supplied rows, persisted rows, unverified lineage, and any case not named in the ten-case allowlist.

## Mapper Reconstruction Boundary

Action 406 imports the Action 400 case builder and invokes `mapSnapshotToLearningDataset` only for the ten allowed cases. Rows exist in memory only and are not written as full rows to tracked docs, manifests, or temporary evidence.

## Deterministic Wrapper Policy

The wrapper uses fixed Action 400 IDs, timestamps, horizons, fixture references, and expected mapper results. It does not use current time, randomness, environment-derived inputs, stdin, arbitrary CLI input, or directory discovery.

## Canonical Mapper-Input Policy

The canonical mapper input hash is the Action 400 canonical input SHA-256 for each allowlisted case. These hashes are verified against the Action 400 manifest.

## Reconstructed-Row Contract

Each reconstructed row must have mapper status `mapped`, row present `true`, `consumable: true`, no mapper issues, `anti_leakage_status: passed`, setup family `momentum_continuation`, outcome horizon `60m`, and outcome status `target_hit`.

## Row-Lineage Contract

Each future Pattern Discovery envelope must include the frozen mapper hash, Learning fixture hash, Context fixture hash, Pattern fixture hash, canonical mapper input hash, mapper row ID, canonical row hash, and all no-effect flags set to true.

## Row-ID Inventory

The exact ordered case membership for Pattern Discovery is lexical by source case ID:

| Case ID | Mapper Row ID |
| --- | --- |
| `expanded_valid_bearish_risk_context` | `learning_row:v1:learning_dataset_static_fixture_v1|snapshot_fingerprint%3Ashadow397%3A001|60m|outcome%3Ashadow397%3A001` |
| `expanded_valid_fda_event_context` | `learning_row:v1:learning_dataset_static_fixture_v1|snapshot_fingerprint%3Ashadow397%3A001|60m|outcome%3Ashadow397%3A001` |
| `expanded_valid_future_event_excluded` | `learning_row:v1:learning_dataset_static_fixture_v1|snapshot_fingerprint%3Ashadow397%3A001|60m|outcome%3Ashadow397%3A001` |
| `expanded_valid_identity_nfc_equivalent` | `learning_row:v1:learning_dataset_static_fixture_v1|caf%C3%A9|60m|outcome%3Ashadow397%3A001` |
| `expanded_valid_identity_percent_encoding` | `learning_row:v1:learning_dataset_static_fixture_v1|shadow%7Cpercent%25%20%2F397|60m|outcome%3Ashadow397%3A001` |
| `expanded_valid_sec_event_context` | `learning_row:v1:learning_dataset_static_fixture_v1|snapshot_fingerprint%3Ashadow397%3A001|60m|outcome%3Ashadow397%3A001` |
| `valid_complete_mapping` | `learning_row:v1:learning_dataset_static_fixture_v1|snapshot_fingerprint%3Ashadow397%3A001|60m|outcome%3Ashadow397%3A001` |
| `valid_equivalent_aliases` | `learning_row:v1:learning_dataset_static_fixture_v1|snapshot_fingerprint%3Ashadow397%3A001|60m|outcome%3Ashadow397%3A001` |
| `valid_normalized_confidence` | `learning_row:v1:learning_dataset_static_fixture_v1|snapshot_fingerprint%3Ashadow397%3A001|60m|outcome%3Ashadow397%3A001` |
| `valid_rich_context` | `learning_row:v1:learning_dataset_static_fixture_v1|snapshot_fingerprint%3Ashadow397%3A001|60m|outcome%3Ashadow397%3A001` |

## Canonical Row-Hash Inventory

| Case ID | Canonical Mapper Input SHA-256 | Canonical Row SHA-256 |
| --- | --- | --- |
| `expanded_valid_bearish_risk_context` | `fec17679ec57889b72bdb6e60851f2791ec04901a84127c3aa2a37dc8f620ec9` | `c541b7c12b4c93d30238d328907320f415a6593646c04b7ad9a9f117b879bf10` |
| `expanded_valid_fda_event_context` | `416817eb4359264bae6bcd70b2b8aca225954ebc7c9a2df7378004b1b1692ad3` | `308f97519a4779f4372adc62e6901ac385bb831c01423a7b32373c4619611412` |
| `expanded_valid_future_event_excluded` | `f7f4298adedab046a69cb5e7cdb506ee59acc87008733d51a44cbcc41002aaf2` | `6f6aa09ac28e35b5342fc305fcaa5f97a97cdf6d6dc4af5477edee97c94b150c` |
| `expanded_valid_identity_nfc_equivalent` | `b3966931a62cd588feec62dbea7012e810a95f0a59b6fe7707ebef14c8cfd95e` | `a73bd0365bbf8358e5746744d4774604007540160af27c67696d1474dc358854` |
| `expanded_valid_identity_percent_encoding` | `eddbdf862ddeba42df34e8185552b7718a3b348b535b6e9a5c0c8dcddbdccf88` | `53ec6e76d02dcf552cadeb260176a0659192c5b82dca5958feff4ac36091be4f` |
| `expanded_valid_sec_event_context` | `cd94475fe9243e681042e9adbe20e23086020c85127b29673c380ecd680dde6a` | `589db67304606f5e2acc7c42373cb1e49a12687cb0dafc2c25c407c815af1f77` |
| `valid_complete_mapping` | `3b88963b293bb6212cc37c474d4fd21560cb99cb7edb9ee581ab24659aa79eda` | `27cd78418b77f2af7d7bb6cc93334f52d862791c530a2878fa13a76c305f7da0` |
| `valid_equivalent_aliases` | `96ab5d0b9f5c71b2f6bc6f057d32fc3aaa4507cd627347a307b7722b81072ff4` | `27cd78418b77f2af7d7bb6cc93334f52d862791c530a2878fa13a76c305f7da0` |
| `valid_normalized_confidence` | `40a0414237ce721261ba56bcb193cd6d5aa35f545d16b901f6bed03b4e7a032a` | `27cd78418b77f2af7d7bb6cc93334f52d862791c530a2878fa13a76c305f7da0` |
| `valid_rich_context` | `e5b4967d79f406272fdea2a45b5cc47a3ed5d23bc09ce0cca9d1eaabe8240601` | `4bd75cdac30b2f609088a4990f29bcc15558495e68691b41602a0b91334e7e41` |

## Duplicate-Row Identity Inventory

There are ten case-level observations and three unique mapper row IDs. The shared snapshot mapper row ID appears eight times and must produce `duplicate_mapper_row_identity`.

## Case-Level Versus Unique-Row Inventory

- `case_support_count`: 10
- `unique_mapper_row_count`: 3
- `completed_outcome_count`: 10

Case-level evidence must not be deduplicated away, and unique-row count must not substitute for case support.

## Group-Membership Inventory

All ten cases belong to exactly one group:

`pattern_group:v1|setup_family=momentum_continuation`

Expected counts: positive 10, negative 0, neutral 0.

## Canonical Group-Key Contract

The canonical group key is exact raw setup family `momentum_continuation`, after validation, serialized as `pattern_group:v1|setup_family=momentum_continuation`.

## Evidence-Set Canonicalization

Evidence-set canonicalization uses:

- schema `pattern_evidence_set:v1`
- configuration version `pattern_discovery_setup_family_v1`
- group key `pattern_group:v1|setup_family=momentum_continuation`
- horizon `60m`
- ordered source case IDs
- ordered mapper row IDs
- ordered canonical row hashes

It excludes current time, execution time, machine paths, warning count, output position, calculated effect metrics, mutable aggregation values, and randomness.

## Evidence-Set Hash

`f1f0053264c85d640d46b61da0ce7120e491309e3070132fe74a69a68438cbd8`

## Group Canonicalization

Group canonicalization uses schema `pattern_group_hash:v1`, configuration SHA-256, canonical group key, and evidence-set SHA-256.

## Group Hash

`aa2ae3f39146ce1c6fc1f6ed73e19e96b02b7866b34e75b61c471a8277a1122e`

## Expected Pattern Discovery Result Contract

For these ten reconstructed rows:

- top-level status: `insufficient_evidence`
- group count: 1
- group status: `insufficient_evidence`
- case support: 10
- unique mapper rows: 3
- completed outcomes: 10
- positive: 10
- negative: 0
- neutral: 0
- minimum support: 20
- minimum completed: 20
- full insight count: 0
- duplicate warning: present
- non-authoritative: true

## Expected Result Hash Policy

Action 406 independently derives the future Pattern Discovery envelope input hash and expected canonical result hash without calling `discoverPatterns`.

- configuration SHA-256: `501271173e3e14dcb46f30a6c2df9e1d12637fd4ee8b526e29ae4394181a8bd1`
- future envelope input SHA-256: `ff39876e60275557f7d19ba79a3433910cccbf118e1666b4b6f6e70c009c953c`
- expected canonical result SHA-256: `e911709a784159c684a350de490fd56446ee23c23b3bf5ea2fbb70378ebf253c`

No future shadow runner may derive expected result hash from its actual execution output.

## Minimum-Support Result

Because case support and completed outcomes are both 10, the result is `insufficient_evidence`, not discovered.

## Issue/Warning Expectations

Expected issues: none.

Expected warning codes:

- `minimum_total_support_not_met`
- `minimum_completed_outcomes_not_met`
- `duplicate_mapper_row_identity`

## Duplicate Warning Expectation

The duplicate warning path must identify the shared mapper row ID under the canonical group path.

## Non-Authoritative Classification

All frozen evidence remains static-only and non-authoritative. It is not a production signal, calibration update, ranking input, or feedback input.

## Future Shadow Manifest Requirements

A future action may add at most one Action-specific mapped-only input/hash manifest, one local static downstream runner, one execution report, one deterministic verifier, one focused test suite, and minimal guard updates.

## Future Shadow Runner Boundary

The future runner may verify protected hashes, reconstruct exactly the ten mapper rows, verify frozen row hashes, construct Pattern Discovery envelopes, invoke `discoverPatterns`, compare against frozen expectations, run exactly twice, compare deterministic results, capture temporary metadata-only evidence, delete all evidence, and exit.

## Evidence Boundary

Future temporary evidence may contain only case IDs, mapper row IDs, canonical row hashes, group key, evidence-set hash, group hash, Pattern Discovery status, group status, support counts, warning codes, insight count, canonical result hash, two batch/run hashes, integrity results, and cleanup results.

## Repeat-Run Determinism

Future execution must run exactly twice. Both runs must produce identical row IDs, row hashes, evidence ordering, evidence-set hash, group key, group hash, statuses, counts, warnings, insight count, result hash, and full batch hash.

## Temporary-Path Policy

Action 406 writes no temporary evidence. A future runner may write metadata-only evidence only under a validated system temp path and must delete it before exit.

## Cleanup Policy

No tracked evidence and no temporary evidence may remain after future execution.

## No-Persistence Requirement

No row, insight, result, or evidence may be persisted to application storage, Supabase, or tracked runtime artifacts.

## No-Replay Requirement

No replay is executed.

## No-Runtime Requirement

No runtime route, API route, page route, proxy, middleware, service, worker, or background job is added.

## No-External-Access Requirement

No provider, news, network, Supabase, or environment-derived source is accessed.

## No-Feedback Requirement

No calibration, ranking, scanner, recommendation, Learning Acceleration, broker, Add Trade, execution, or risk behavior is changed.

## Lint-Readiness Policy

Behavioral/hash readiness is separate from repository-quality readiness. Because Action 404 lint debt remains, this action returns `approved_with_conditions`, not fully `approved`.

## Stop Conditions

Stop and return blocked or aborted readiness if a protected hash differs, eligible case count differs, an unapproved case appears, a mapper result is not `mapped`, a row is absent or non-consumable, lineage is incomplete, row hash differs, duplicate inventory differs, group membership differs, evidence-set hash is nondeterministic, group hash is nondeterministic, an excluded row is included, runtime/provider/Supabase/replay import appears, persistence appears, or feedback appears.

## Approval Vocabulary

Approval vocabulary is exactly `approved`, `approved_with_conditions`, and `blocked`.

## Deterministic Gate Conditions

The gate must verify source hashes, exactly ten eligible cases, exactly thirty excluded cases, exact row hashes, exact duplicate clusters, exact evidence-set hash, exact group hash, expected result hash policy, no Pattern Discovery shadow execution, no persistence, no replay, no runtime, no external access, no feedback, and runtime preview paused.

## Approval Decision

`approved_with_conditions`

## Passed Conditions

- Ten mapped rows reconstructed in memory through the pure mapper.
- Thirty non-allowlisted cases excluded.
- Row IDs, row hashes, group key, evidence-set hash, group hash, and expected result hash policy frozen.
- Duplicate identity inventory frozen at ten cases and three unique mapper row IDs.
- Expected Pattern Discovery result contract frozen as `insufficient_evidence`.
- No `discoverPatterns` call executed.
- No persistence, replay, runtime, provider, Supabase, or feedback path added.

## Failed Conditions

None.

## Unresolved Conditions

- Action 404 lint debt remains.
- A future static downstream runner still requires a separate approval action and must compare against these frozen constants.

## Next Permitted Action

`action_407_mapped_only_pattern_discovery_static_shadow_execution_approval_gate`

Runtime preview remains `runtime_preview_waiting_for_operator_inputs`.
