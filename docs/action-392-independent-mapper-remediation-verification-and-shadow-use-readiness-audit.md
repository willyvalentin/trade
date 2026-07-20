# Action 392 - Independent Mapper Remediation Verification and Shadow-Use Readiness Audit

## Purpose and scope

Action 392 independently verifies the Action 391 pure mapper remediation against the Action 389 findings and the Action 390 approval boundary. It is local-only, static, test-oriented, and review-only. It does not modify the mapper, fixtures, consumers, runtime, persistence, replay, scanner, ranking, confidence, Pattern Discovery, schema, migration, or runtime-preview chain.

Authoritative dependencies: Actions 309, 335, 336, 352, 380, 381, 383, 386, 387, 388, 389, 390, and 391.

Action 389 found seven gaps and returned `blocked`. Action 390 approved their narrow remediation. Action 391 implemented category, freshness, contradiction, numeric, window, horizon-linkage, and anti-leakage validation without adding statuses, issue codes, consumers, runtime, or persistence.

## Source integrity and remediation scope

Action 392 baseline and final hashes:

| Source | Before Action 392 | After Action 392 |
| --- | --- | --- |
| `lib/snapshot-to-learning-dataset-mapper.ts` | `e6c0053b9030b342b6090816b77cd57ee878e5a703bbd5ac7b32e42b93fea47b` | same |
| `lib/learning-dataset-static-fixtures.ts` | `706bd57150914862604af70e0bba7614151f53c32abc5dbde9595c53bf4b332b` | same |
| `lib/intelligence-context-static-fixtures.ts` | `46358cb997b4f7a431a3fee72562659da48b13219404224f4e80e08dbf8ed406` | same |
| `lib/pattern-insight-static-fixtures.ts` | `db8dae9f101f710123a0a3ac6493356bd761c15f231023ab9742caefaacf8f57` | same |

Action 392 changes only this document, its verifier, its focused tests, and minimal Actions 318-320 guard classifications. Mapper source modifications: none. Fixture modifications: none.

## Seven-finding closure matrix

| Original Action 389 finding | Expected result | Independent actual result | Closed |
| --- | --- | --- | --- |
| Unsupported context category | `blocked_invalid_provenance`, exact value path | matched | yes |
| Invalid freshness state | `blocked_invalid_provenance`, `/contextSnapshot/freshness/state` | matched | yes |
| Stale/fresh contradiction | `blocked_invalid_provenance`, no repair | matched | yes |
| Non-finite context metric | `blocked_invalid_provenance`, exact metric path | matched | yes |
| Unsupported trading window | `blocked_invalid_input`, `/recommendationSnapshot/window` | matched | yes |
| Payload/outcome horizon disagreement | `blocked_invalid_linkage`, no row, non-consumable | matched | yes |
| Failed anti-leakage marker | `blocked_future_leakage`, no row, non-consumable | matched | yes |

All seven original examples are independently closed.

## Bypass-variant matrix

The audit also tested alternate paths, casing, spacing, aliases, marker combinations, and wrong primitive types.

| Variant | Expected | Actual | Result |
| --- | --- | --- | --- |
| Alternate market direction value `sideways` | blocked | blocked | passed |
| Uppercase catalyst type `EARNINGS` | blocked | blocked | passed |
| Spaced event-risk value ` high ` | blocked | blocked | passed |
| Context missing-state literal ` present ` | blocked; no normalization approved | **mapped** | failed bypass |
| Freshness state `Fresh` | blocked | blocked | passed |
| Freshness state ` fresh ` | blocked; no normalization approved | **mapped** | failed bypass |
| Stale plus `fresh: true` | blocked | blocked | passed |
| Fresh plus `stale: true` | blocked | blocked | passed |
| Fresh plus unavailable/stale provenance markers | blocked | blocked | passed |
| Numeric strings, NaN, positive/negative Infinity, boolean at numeric paths | blocked | blocked | passed |
| Window case, spacing, `power hour`, `lunch`, `close` | blocked | blocked | passed |
| Payload horizon `60M` with outcome `60m` | blocked; exact literals only | **mapped** | failed bypass |
| Payload horizon ` 60m ` with outcome `60m` | blocked; exact literals only | **mapped** | same horizon bypass |
| Failed/unknown/missing anti-leakage with rich context | blocked | blocked | passed |
| Nested `available_at_snapshot_time: false` | blocked | blocked | passed |
| Failed leakage plus invalid provenance/outcome | leakage blocks first | matched | passed |

Three deterministic failed conditions remain: whitespace normalization of context-state literals, whitespace normalization of freshness literals, and case/whitespace normalization of payload horizons. No repair was attempted in Action 392.

## Valid-domain regression matrix

| Domain | Coverage | Result |
| --- | --- | --- |
| Action 381 contexts | 15/15 | accepted with prior statuses |
| Nullable context | explicit null context and pending outcome | accepted |
| Rich context | complete and conflicting/partial fixtures | accepted |
| Freshness | fresh, stale, unknown, unavailable | accepted according to contract |
| Windows | morning, midday, power_hour, unknown | accepted |
| Finite metrics | all supported numeric paths | accepted |
| Equivalent exact horizons | payload and outcome 15m/30m/60m agreement | accepted |
| Pending outcome | null outcome with supported payload horizon | accepted |
| Passed leakage evidence | explicit passed marker | preserved as passed |
| Excluded future facts | `included_in_snapshot_context: false` | accepted and retained excluded |

No valid-domain regression was found.

## Malformed-domain regression matrix

Malformed categories, freshness case variants, contradictory markers, non-finite values, numeric strings, wrong primitive types, unsupported windows, horizon disagreement, failed leakage, unknown leakage, missing leakage, nested availability failure, and multi-fault inputs were exercised. All blocked as designed except the three normalization bypass conditions above.

Blocked results contain no row and are non-consumable. No unsupported value is converted in the output except the accepted whitespace/case normalization paths identified as blockers.

## Result-status matrix

Success statuses remain exactly:

- `mapped`
- `mapped_with_missing_optional_data`

Blocked statuses remain exactly:

- `blocked_missing_required_identity`
- `blocked_invalid_linkage`
- `blocked_conflicting_aliases`
- `blocked_temporal_violation`
- `blocked_future_leakage`
- `blocked_invalid_provenance`
- `blocked_invalid_outcome`
- `blocked_invalid_input`

No status was added or removed.

## Issue-code matrix

The exact issue vocabulary remains:

`missing_required_identity`, `invalid_linkage`, `conflicting_aliases`, `invalid_timestamp`, `temporal_violation`, `future_leakage`, `invalid_provenance`, `invalid_outcome`, `invalid_input`, `missing_optional_context`, `missing_optional_outcome`, `unknown_setup`, `unavailable_source`, and `partial_provenance`.

Issue shape remains exactly `{ code, path, severity, messageKey }`. RFC 6901 paths, deterministic ordering, deterministic deduplication, stable message keys, error/warning severity, and redaction checks pass.

## Validation-precedence audit

Multi-fault inputs confirm the frozen order:

1. input shape
2. required identity
3. linkage
4. alias conflicts
5. timestamp/temporal ordering
6. future leakage
7. provenance
8. outcome
9. optional completeness
10. construction

Identity outranks context errors; linkage outranks horizon-independent provenance; aliases outrank context validation; temporal violations outrank provenance; future leakage outranks provenance/outcome; provenance outranks outcome. Issue sorting and deduplication remain deterministic.

## Domain audits

### Category validation

Alternate closed-category paths and case/space value variants reject correctly. The context missing-state wrapper still trims whitespace before vocabulary validation, so ` present ` bypasses the exact literal contract.

### Freshness and consistency

All four exact states remain valid in their authoritative forms. Invalid casing blocks. Whitespace around the state is trimmed and accepted, which is an unapproved bypass. Stale/fresh aliases and unavailable/stale provenance contradictions block without repair.

### Finite numbers

Both relative-strength metric paths, freshness age, source confidence, and completeness reject NaN, infinities, numeric strings, and wrong primitive types. Valid finite metrics pass.

### Trading windows

All four exact windows pass. Casing, leading/trailing spacing, unsupported synonyms, and alternate labels block without inference.

### Horizon linkage

Exact disagreements block with no row and `consumable: false`. Exact equivalent values pass. Payload horizon values are currently trimmed and lowercased, allowing `60M` and ` 60m ` to bypass exact-literal validation when the outcome is `60m`.

### Anti-leakage monotonicity

Passed remains passed only with explicit valid evidence. Failed, unknown, missing, and nested unavailable-at-snapshot evidence block. Excluded future facts pass only when explicitly excluded. No blocked leakage result contains a row or reports consumable. No failed or unknown state appears as passed in output.

## Alias and row-identity regression

Timestamp, side, setup, and confidence precedence remain unchanged. Approved equivalents pass and material conflicts block. Same identity inputs produce the same ID; changed fingerprint, valid horizon, or outcome ID changes it; confidence, setup, and context changes do not. No clock or random component exists.

## Missing-data, provenance, and temporal regression

Nullable context, pending outcomes, incomplete outcomes, explicit null, unknown, unavailable, stale, partial, and valid conflicting context remain representable. Provenance bounds and consistency checks pass. Temporal and future-exclusion rules remain deterministic. No valid missing-data behavior regressed.

## Input immutability and deterministic output

Deep-frozen wrappers, snapshots, payloads, contexts, provenance, outcomes, arrays, aliases, and nested values remain byte-identical. Repeated and interleaved valid/blocked calls produce identical results, rows, IDs, issues, issue ordering, and serialization. No global-state contamination exists.

## Consumer, inference, repair, runtime, and persistence audits

- Mapper consumers: none
- Hidden category/window/freshness inference: none beyond the three unapproved string normalizations recorded above
- Hidden malformed-data repair: none beyond those normalizations
- Runtime imports/state: none
- Provider/news access: none
- Supabase access: none
- Persistence/replay: none
- Scanner/ranking/confidence/Pattern Discovery feedback: none

## Unsupported and deferred gaps

Peer group remains unsupported optional. Provider-specific lineage, persistence shape, batch mapping, Pattern Discovery, confidence calibration, and all runtime use remain deferred and blocked.

## Shadow-use risk review

A future static shadow-use process could be designed to accept only explicitly supplied static inputs, produce disposable local evidence, avoid replay/persistence/Supabase/providers/news, avoid ranking/confidence/recommendation feedback, remain deterministic, and be deletable/non-authoritative.

Action 392 does not approve shadow use. Because three malformed literal-normalization bypasses remain, even a separate shadow-use approval gate is not yet permitted.

## Readiness decision

Vocabulary: `ready`, `ready_with_conditions`, `blocked`.

`readiness_decision: blocked`

`passed_conditions_count: 20`

`failed_conditions_count: 3`

`unresolved_conditions_count: 0`

The seven original findings are closed and valid-domain behavior is intact, but bypass variants remain reproducible. This meets the blocked criterion.

## Next permitted Action

The next permitted Action is a separate narrow mapper literal-normalization bypass remediation approval gate. A shadow-use approval gate remains blocked until the three findings are remediated and independently reverified.

Runtime preview remains `runtime_preview_waiting_for_operator_inputs`.
