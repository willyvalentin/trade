# Action 400 - Expanded Static Mapper Shadow Execution

## Purpose And Scope

Execute the one finite 40-case local static mapper shadow package approved by Action 399. This package is synthetic, non-production, non-authoritative, non-learning, metadata-only, and disposable. It creates no Learning Dataset rows, runtime consumer, replay, persistence, external access, or feedback path.

## Action 399 Approval

Action 399 returned `approval_decision: approved` with 18 passed, 0 failed, and 0 unresolved conditions. It approved exactly 20 retained Action 397 cases followed by exactly 20 named additions. No configurable or automatic expansion was approved.

## Protected Hashes

- mapper: `7294a851ede33aadc0dbfcb68c13337cd244002b84be7cbbe40abbe91673741d`
- learning fixtures: `706bd57150914862604af70e0bba7614151f53c32abc5dbde9595c53bf4b332b`
- context fixtures: `46358cb997b4f7a431a3fee72562659da48b13219404224f4e80e08dbf8ed406`
- pattern fixtures: `db8dae9f101f710123a0a3ac6493356bd761c15f231023ab9742caefaacf8f57`
- Action 397 runner: `eaab84c16302a8e2f27ae4043e810af9b405dd5a6e818db9d4784eb4d8ca291b`
- Action 397 raw manifest: `e9afd2d63a8f0d0041e14b60ae282cabe1afc742aeb707d65bf2ae2d67ccd741`
- Action 397 canonical manifest: `79c9b8587dc9c56f9751589481a7270616909cbd5ba09c0bef7e3517a3e65e20`

All protected hashes matched before and after execution.

## Exact Case Counts And Inventory

- total: 40
- `action_397_retained`: 20, indexes 1-20
- `action_400_added`: 20, indexes 21-40

The original IDs, ordering, input construction semantics, expectations, issue arrays, and canonical input hashes are identical to Action 397. The added IDs are:

1. `expanded_valid_bearish_risk_context`
2. `expanded_valid_fda_event_context`
3. `expanded_valid_sec_event_context`
4. `expanded_valid_future_event_excluded`
5. `expanded_valid_news_unavailable_context`
6. `expanded_valid_missing_semantics_context`
7. `expanded_valid_identity_nfc_equivalent`
8. `expanded_valid_identity_percent_encoding`
9. `expanded_blocked_context_category_uppercase`
10. `expanded_blocked_freshness_unicode_padding`
11. `expanded_blocked_numeric_context_string`
12. `expanded_blocked_payload_horizon_numeric`
13. `expanded_blocked_outcome_horizon_uppercase`
14. `expanded_blocked_linkage_fingerprint`
15. `expanded_blocked_stale_complete_contradiction`
16. `expanded_blocked_anti_leakage_unknown`
17. `expanded_blocked_invalid_trading_window`
18. `expanded_precedence_identity_over_provenance`
19. `expanded_precedence_linkage_over_freshness`
20. `expanded_precedence_leakage_over_outcome`

## Coverage Families

The retained segment preserves Action 397 status coverage. Additions cover valid bearish risk, FDA/SEC events, excluded future facts, unavailable/missing context semantics, NFC and percent-encoded identities, malformed category/freshness/numeric/horizon/linkage/window values, stale/complete provenance contradiction, unknown anti-leakage, and the three approved multi-fault precedence relationships.

## Manifest Contract

`docs/action-400-expanded-static-mapper-shadow-input-manifest.json` uses `action_400_expanded_static_mapper_shadow_manifest_v1`. It contains only protected hashes, fixed safety declarations, expected counts, and 40 ordered metadata definitions. Each case contains only the Action 400 allowlisted fields. It contains no input, row, payload, context object, outcome object, timestamp generated at execution, environment value, secret, or machine path.

Expanded canonical manifest SHA-256: `6e6447311f096b99380914990ea14b353d3674ab6e72eede1b6b9937dae4a0fc`.

## Runner Boundary

`scripts/action-400-expanded-static-mapper-shadow-run.mjs` is separate from Action 397. It verifies all protected hashes, loads only the fixed manifest, reconstructs only approved wrappers, rejects production consumers and unsafe temp paths, maps exactly 40 cases twice, compares frozen expectations and counts, writes one metadata-only temp artifact, reads it back, deletes it, and verifies source integrity.

It accepts no case path, arbitrary JSON, stdin input, environment-derived mapper input, dynamic discovery, configurable count, retry, third run, or output consumer.

## Expected And Actual Status Distribution

| Status | Expected | Actual |
| --- | ---: | ---: |
| `mapped` | 10 | 10 |
| `mapped_with_missing_optional_data` | 8 | 8 |
| `blocked_missing_required_identity` | 2 | 2 |
| `blocked_invalid_linkage` | 4 | 4 |
| `blocked_conflicting_aliases` | 1 | 1 |
| `blocked_temporal_violation` | 1 | 1 |
| `blocked_future_leakage` | 3 | 3 |
| `blocked_invalid_provenance` | 5 | 5 |
| `blocked_invalid_outcome` | 2 | 2 |
| `blocked_invalid_input` | 4 | 4 |
| **Total** | **40** | **40** |

Blocked results were retained as bounded metadata and were not suppressed.

## Expected Result And Identity Verification

Every case matched its frozen status, row-presence, consumable, issue-code, and stable issue-path expectation. The NFC case produced the composed `caf%C3%A9` identity component. The percent-sensitive case produced `%7C`, `%25`, `%20`, and `%2F` in the expected row ID. `expected_results_match: true`.

## Metadata-Only Evidence

Per-case temporary evidence was limited to case ID, status, optional row ID, row-present, consumable, ordered issue codes/paths/severities, and canonical result hash. Batch evidence was limited to hashes, counts, ordered IDs, results metadata, integrity/no-effect outcomes, and the decision. No full row or input was retained.

## Repeat-Run Determinism

The complete batch ran exactly twice with no retry or third run.

- run 1: `95418ba1a63b6c1ec13bcd9ea4849e7b59523d9013c7c9890647d3a64f622cc4`
- run 2: `95418ba1a63b6c1ec13bcd9ea4849e7b59523d9013c7c9890647d3a64f622cc4`
- repeat-run identical: true

Case ordering, statuses, row IDs, row/consumable flags, issue metadata, result hashes, counts, and batch hashes matched.

## Integrity Results

- source integrity: passed
- fixture integrity: passed
- Action 397 historical integrity: passed
- production mapper consumers outside the approved runner/test boundary: none
- mapper or fixture mutation: none
- Action 397 runner, manifest, documentation, or expected-result mutation: none

## Temporary Path And Cleanup Result

The only output location was `<system-temp>/ture/action-400-expanded-static-mapper-shadow/`. Repository, HOME/config, immutable preview candidate, traversal, file, non-empty directory, target symlink, dangling symlink, resolved symlink, and parent-chain symlink conditions fail closed.

- path safety: passed
- metadata artifact readback: passed
- temporary evidence deleted: true
- dedicated output path absent after cleanup: true
- tracked execution evidence: none

## No-Effect Results

- persistence result: none
- Supabase/database read or write: none
- replay result: none
- runtime result: none
- provider/news/network access result: none
- feedback result: none
- Pattern Discovery/calibration/ranking/scanner/recommendation input: none
- authoritative data created: false

The output classification remains local, disposable, synthetic/static-derived, non-authoritative, non-production, non-learning, non-persisted, and ineligible for downstream use.

## Final Shadow Decision

`final_shadow_decision: shadow_passed`

All protected hashes, case definitions, expected results, exact status counts, deterministic runs, metadata bounds, path safety, cleanup, integrity checks, and no-effect requirements passed without conditions.

## Runtime Preview And Next Independent Audit

Runtime preview remains `runtime_preview_waiting_for_operator_inputs`; no preview route, candidate, deployment artifact, or rollout state changed.

The recommended next Action is an independent Action 401 post-expansion verification and downstream-readiness audit. It must remain separately gated and must not infer runtime approval from this static result.
