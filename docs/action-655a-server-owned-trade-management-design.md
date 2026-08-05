# Action 655D.4 — Server-Owned Trade Management Canonical Design

Status: invalid-enum and raw-JSON validation-order remediation pending independent rereview; no 655B
implementation, runtime, persistence, broker, client, delivery, or production
authority.

Contract set: `action_655d4_server_owned_trade_management_v6`.

## Authority and immutable scope

This document preserves the 655A.4 total-result and queue-closure matrices and
remediates exactly 655A.5-M1, M2, and M3 in the same five Action 655A design
artifacts. It adds no source module, route,
migration, database object, queue, worker, provider adapter, client integration,
transport, broker operation, or write path.

The immediate predecessor is preservation commit
`d67fcd0637a07bc7bbdd23e05484809a4069976c`, tree
`d5ba74faa1b516fc0f5e8d45c03f7d6a5879311a`, with five-path digest
`df46b1358ad3483f49f0d368420aec4210846a95817c84630aaa8724c37c4196`.
The preserved Action 655A.4 design root remains commit
`24eab98755497a92e9162d71ecedac9179bbc768`.
The starting-main authority remains
`01ca7d27de2311482ae8de2fc9a926cd6422d67e`. Action 654U remains the sole
current readiness runtime authority, exported only as
`runAction654uExactBudgetUnitPrivatePolicy`. Action 654V and all other freeze,
review, remediation, and finding artifacts remain evidence only.

The roadmap bytes are verified at
`6712d698447677766d2d550ffcc0785a0c722d11:docs/ture-master-roadmap.md`,
SHA-256 `241f51332b5be149db1a88a7ccff1edf4b1aa5ea6a0a2f1d21996c15aa04e93d`.
That source commit is not reachable from the starting main. The discrepancy
continues to block roadmap-completion, delivery, runtime-readiness, and
production-readiness claims. It does not by itself settle whether a later
separately authorized pure local experiment may proceed.

## Canonical primitives and integer domains

All records use closed schemas and canonical JSON: UTF-8, NFC strings,
lexicographically ordered object keys, declared array order, no insignificant
whitespace, and no unknown fields. UUIDs are lowercase canonical RFC 4122 text.
Instants are UTC RFC 3339 with exactly nine fractional digits and `Z`.

Every non-policy digest frame has exactly `contract_version`, `domain`, and
`projection`. The policy frame additionally has exact `policy_id` and
`policy_identity`. `projection` is the sole permitted projection field name;
there is no compatibility alias. Raw input bytes must already equal canonical
JSON before hashing. Canonical JSON uses UTF-8 without BOM, NFC strings,
lexicographic UTF-8 key order, declared array order, no whitespace, exact JSON
booleans and null, JSON integers without quotes/fraction/exponent, and canonical
decimal strings where integer-unit strings are required. Hashes are SHA-256 and
render as exactly 64 lowercase hexadecimal characters. Missing and explicit
null are never interchangeable.

Identity text contains the declared prefix and lowercase digest. No caller
digest proves authority merely because it is internally consistent. The 25
predecessor domains remain present and unique; the new provenance domain makes
26/26 unique values. Existing recommendation, execution, confirmation,
risk, and readiness identities are reused under their original domains rather
than reissued by trade management.

Prices and quantities are never JavaScript or SQL floating-point values:

- every price is a positive canonical base-10 integer string in instrument
  `price_units`, at most `2^127-1`;
- every quantity is a positive canonical base-10 integer string in instrument
  `quantity_units`, at most `2^127-1`;
- `price_scale` and `quantity_scale` are integers from 0 through 8 and describe
  display decimals only; they never change stored integer arithmetic;
- `tick_size_price_units` and `lot_size_quantity_units` are positive integers;
- every supplied price is divisible by the tick size and every supplied
  quantity is divisible by the lot size;
- addition, subtraction, comparison, and multiplication use checked integers;
  multiplication uses a checked unsigned 256-bit intermediate;
- overflow, underflow, division by zero, missing fields, excess precision, or a
  non-representable result is a deterministic refusal; no default is inserted.

Partial quantity is exactly
`floor(remaining_quantity_units * numerator / denominator)` rounded down to the
nearest whole lot. It is permitted only when it is at least one lot and leaves
at least `minimum_remaining_lots * lot_size_quantity_units`. Otherwise the
result is `refused:quantity_rule_not_representable`. Profit protection compares
`favorable_price_delta * r_denominator >= initial_risk_price_units * r_numerator`
with checked 256-bit products. A stop move returns the entry price, which is
already tick-aligned. No implicit rounding occurs anywhere else.

## Position identity, version, and complete evaluator snapshot

`position_identity` is the durable position UUID. Each future server-owned
mutation increments the positive `position_version` exactly once in the same
transaction. A ticker, client index, recommendation label, or mutable payload
cannot create a position identity or version.

`CanonicalPositionSnapshotV3` has exactly:

- `contract_version: "action_655a6_position_snapshot_v3"`;
- `position_identity`, positive `position_version`;
- `durable_recommendation_uuid`, positive integer
  `durable_recommendation_version`, `recommendation_identity`, and
  `recommendation_normative_digest`;
- `instrument_identity`, `side: "long" | "short"`;
- `status: "open" | "exit_pending" | "partially_closed" | "closed"`;
- `opened_at`, `snapshot_at`;
- `price_scale`, `tick_size_price_units`, `quantity_scale`,
  `lot_size_quantity_units`;
- `total_quantity_units`, `remaining_quantity_units`;
- `entry_price_units`, `initial_stop_price_units`,
  `initial_risk_price_units`, `current_stop_price_units`,
  `invalidation_price_units`;
- `target_1_price_units`, `target_2_price_units`, each integer string or `null`;
- `position_snapshot_digest`.

Required invariants are exact. Remaining quantity is no greater than total
quantity. Initial risk equals the absolute entry/initial-stop difference and is
strictly positive. For a long position, initial stop and invalidation are below
entry and non-null targets are above entry in ascending order. For a short,
the comparisons reverse and targets descend. Every price and quantity is
positive, in range, scale-compatible, and tick/lot aligned. Only `open` or
`partially_closed` is eligible for pure exit evaluation. Any absent, null where
not explicitly nullable, inconsistent, or non-representable field refuses
before rule evaluation.

## Monitor observation and request-bound freshness

`CanonicalMonitorObservationV2` has exactly:

- `contract_version: "action_655a2_monitor_observation_v2"`;
- `observation_identity`;
- position identity, version, snapshot digest, and instrument identity;
- `observed_at`;
- market-data contract version, observation identity, observed-at instant,
  and digest;
- `current_price_units` and closed `session_state`;
- `observation_digest`.

Age limits are not supplied by the observation. They come only from the private
policy registry. The evaluation request has exactly one
`decision_requested_at` and one selected observation. Its
`evaluation_request_identity` binds the request instant, observation identity,
observation digest, position identity/version/digest, and the privately
resolved policy tuple.

Freshness is accepted only when:

1. `market_data_observed_at <= observed_at <= decision_requested_at`;
2. `decision_requested_at - observed_at < maximum_observation_age_ns`;
3. `decision_requested_at - market_data_observed_at < maximum_market_data_age_ns`;
4. both subtractions and nanosecond conversions are exact checked integers;
5. policy `maximum_future_skew_ns` is zero, so every future timestamp is refused.

Equality at either maximum is stale. A once-fresh observation may be reused for
a later request only if it independently passes both strict bounds; its later
request identity and decision identity are necessarily different. Cross-request
or cross-observation substitution fails digest/identity binding before rules.

## Private server-owned policy provenance

The public `CanonicalExitEvaluationInputV4` contains exactly:

- `contract_version: "action_655a6_exit_evaluation_input_v4"`;
- `position_snapshot` using the V3 position contract, including the durable
  recommendation version required by provenance binding;
- `monitor_observation` using the unchanged V2 observation contract;
- `decision_requested_at`;
- `evaluation_request_identity`;
- `input_digest`.

It contains no policy object, policy identifier, selector, callback, registry,
factory, mint, constructor, or authority handle. Unknown policy-like fields are
closed-schema failures before any policy lookup.

A future 655B module may contain one compile-time, deep-frozen, unexported
registry. Its sole allowlisted policy tuple is now exactly
`server_primary_exit_policy`, version `2`, identity
`tm_exit_policy:v3:server_primary_exit_policy:2`, and digest
`746fb35346a353752cc01a38d76a2b6e5593b41f8e7e078d746ebfd221c496cf`.
The policy semantics remain the predecessor V2 projection; only its previously
ambiguous digest frame is replaced. Resolution occurs inside a private
composition boundary. Zero or multiple matches return `refused:authority_unavailable`;
registry tuple or digest mismatch returns
`invalid:policy_registry_integrity_failure`. A caller cannot select, mint,
clone, replace, mutate, register, or bootstrap policy authority. No test hook
may export the registry or alternate policies.

The policy digest frame has exactly five fields:
`contract_version:"action_655a6_exit_policy_digest_frame_v3"`,
`domain:"trade_management_exit_policy_v2"`, exact `policy_id`, exact
`policy_identity`, and `projection`. Canonical serialization of the manifest's
positive frame rebuilds the published digest above. The old documented
`canonical_unsigned_projection` spelling rebuilds a different digest
`660e5d41b8a2268c461e5f0a2385dc807e2564201f7f630db380300ab17a1717`
and is rejected as an unknown field; reordered raw bytes are noncanonical and
are rejected before digest comparison.

The predecessor mismatch is preserved as a separate reconstruction: its
declared `canonical_unsigned_projection` frame hashes to
`7f340292bf4d9d7fb312c367c39411ebd630c1079aa2d4ffff64ccba6310153c`,
while the predecessor's frozen digest
`9036332001231ba7fa8b46af46c0e2dbaeb852cf5139e14f1f82925a635712e9`
is obtained only with the undeclared `projection` spelling. Neither predecessor
frame is accepted by the V3 policy frame.

## Normative provenance digest

`provenance_digest` is SHA-256 of an exact
`action_655a6_exit_provenance_digest_v1` frame in domain
`trade_management_exit_provenance_digest_v1`. Its `projection` contains every
one of these verified, non-null fields:

1. `decision_requested_at`;
2. `durable_recommendation_uuid` and positive JSON-integer
   `durable_recommendation_version`;
3. `evaluation_request_identity` and `input_digest`;
4. `instrument_identity`;
5. market-data contract version, observation identity, observed-at instant,
   and digest;
6. monitor observation identity, observed-at instant, and digest;
7. policy ID, JSON-integer version, identity, and digest;
8. position identity, JSON-integer version, and snapshot digest;
9. recommendation identity and normative digest.

The manifest lists the exact field names and canonical order. Raw price and
quantity displays, localized labels, client projections, decision authority,
decision/result fields, recommendations, and side-effect flags are excluded;
authoritative position values remain transitively bound by the verified
position-snapshot digest. Missing or null projection fields prevent digest
construction. Invalid, identity-conflict, and authority-unavailable results use
top-level `provenance_digest:null`; no identity is invented.

The positive manifest vector rebuilds
`e0f6ab5441083bcaa1e0f257a013409aa813d3f8bd6033a9e786b2ff21813dcd`.
Changing recommendation UUID or version, policy digest, observation identity,
or request instant yields the five distinct negative digests frozen in the
manifest.

## Total deterministic evaluation result

`CanonicalExitEvaluationResultV4` is one closed discriminated union. Every
variant has exactly these top-level fields:

- `contract_version: "action_655a6_exit_evaluation_result_v4"`;
- `result_kind: "decision" | "noneligible" | "invalid" | "refused"`;
- `provenance_digest`, present only after the complete provenance projection is
  verified and otherwise exactly `null`;
- `decision_digest`, always present as lowercase hexadecimal evidence;
- `decision`, `noneligible`, `invalid`, `refused`;
- `side_effects_performed: false`;
- `result_digest`.

Exactly the payload named by `result_kind` is a non-null object; the other three
payload fields are exactly `null`. `result_digest` is SHA-256 over the complete
unsigned union in domain `trade_management_exit_evaluation_result_digest_v3`.
It is evidence consistency, never authority.

`decision_digest` is a separate SHA-256 function with contract version
`action_655a6_exit_decision_digest_v4`, stable domain
`trade_management_exit_decision_digest_v3`, and exact `projection`. All sixteen
projection fields are mandatory. The projection binds `result_kind`, nullable
provenance digest as lowercase hexadecimal text, decision authority/identity,
status, reason, JSON-integer priority, quantity/stop outputs, noneligible
position status/reason, invalid code/path, refusal reason/path, and literal
`side_effects_performed:false`. Inapplicable values are explicit JSON `null`;
omitting a null is invalid. This makes the digest total across all four result
variants without inventing provenance.

The four positive decision-digest vectors are, respectively:

- decision: `69601e20d9146ef507d76782d0cecc3dbce5aa4c23e64c953765cae952306d25`;
- noneligible: `629bcc3a96664dafe7903b12c83ecf6f9eb36fbcf3c55a03990c145eb56b95ef`;
- invalid: `c0eb00743c9739fcec72858ad19e957830faf479320c4aa4c3da2062a3cffd42`;
- refused: `cc9d34e76a2efd180a8b9d2aea385506a9fb48ffcea62371f23ae7070603c4ef`.

The manifest also freezes reordered-field, omitted-null, altered provenance,
altered policy/observation/request/recommendation binding, and altered
discriminator negative vectors. Raw field reordering is rejected as
noncanonical; a semantic value change produces a distinct digest and can never
validate against the original.

### Decision payload and exact rule mapping

The `decision` payload has all V3 position, V2 observation, request, input, and
private policy provenance; `decision_identity`,
`decision_status`, `decision_reason`, `decision_priority`,
`recommended_quantity_units`, and `recommended_stop_price_units`.
`decision_priority` is a JSON integer, never a string or decimal. The mapping is
total and immutable:

| Priority | Rule | Status | Reason | Quantity | Stop |
| ---: | --- | --- | --- | --- | --- |
| 1 | inclusive hard stop | `exit_full` | `hard_stop` | exact remaining quantity | `null` |
| 2 | inclusive invalidation | `exit_full` | `invalidation` | exact remaining quantity | `null` |
| 3 | session `closing` or `closed` | `exit_full` | `session_close` | exact remaining quantity | `null` |
| 4 | inclusive final target | `exit_full` | `final_target` | exact remaining quantity | `null` |
| 5 | inclusive first target | `exit_partial` | `first_target_partial` | exact computed lot-rounded partial quantity | `null` |
| 6 | profit protection | `move_stop` | `profit_protection_stop_move` | `null` | exact entry price units |
| 7 | no prior rule | `hold` | `hold` | `null` | `null` |

No other status/reason/priority combination is valid. The decision identity
frame binds result kind, provenance digest, and this exact mapping. Its positive
identity is
`tm_exit_decision:v4:eb3c2554f646508c49ad4409429fe27697572bae1c760a8e6b417288c216605b`.
The separate top-level decision digest then binds that identity and the complete
variant projection.

### Noneligible payload

The `noneligible` payload is permitted only for a structurally and numerically
valid, digest-verified input whose position status is not evaluator-eligible.
It contains all verified position, observation, request, input, and policy
provenance plus `position_status` and `noneligible_reason`:

| Position status | Reason |
| --- | --- |
| `exit_pending` | `position_exit_pending` |
| `closed` | `position_closed` |

`open` and `partially_closed` can never produce this variant. The payload has
no decision identity, decision status, recommendation quantity, or stop.

### Invalid payload

The `invalid` payload contains exactly `error_code` and `error_path`. It contains
no position, observation, request, input, policy, or decision provenance fields,
and therefore invents no unavailable identity. `error_path` is the RFC 6901 JSON
Pointer of the first failure in the fixed validation order, or `null` only for
`policy_registry_integrity_failure`. Codes are closed:

- `schema_invalid`;
- `missing_required_input`;
- `canonical_form_invalid`;
- `input_budget_exceeded`;
- `numeric_domain_invalid`;
- `unsupported_contract_version`;
- `policy_registry_integrity_failure`.

Field validation order is contract version first, then the manifest field order
depth-first; within any object not otherwise ordered, canonical UTF-8 key order.
Unknown fields are checked after required fields at the same object depth. Thus
two implementations select the same first error. Different invalid inputs may
produce the same non-authoritative invalid payload; no cryptographic input
binding is claimed.

### Refused payload

The `refused` payload has exact fields `refusal_reason`, `error_path`, the
position/observation/request/input provenance fields, and the four policy tuple
fields. Presence is reason-dependent and closed:

| Reason group | Error path | Position/observation/request/input | Policy tuple |
| --- | --- | --- | --- |
| `identity_conflict` | exact mismatched field | only `decision_requested_at` and canonical `input_digest` present; every other provenance field `null` | all `null` |
| `authority_unavailable` | `null` | all verified position/observation/request/input fields present | all `null` |
| `disabled`, `stale_position_version`, `unverified_position_version`, `stale_observation`, `future_observation`, `future_market_data`, `expired_policy`, `policy_not_effective`, `quantity_rule_not_representable`, `arithmetic_overflow` | exact causal field, except `disabled` uses `null` | all present | all present |

No other nullable combination is valid. Refusal produces no decision identity
or recommended mutation.

### Exact arithmetic and target matrix

Long favorable delta is `current_price_units - entry_price_units` only when
current price is greater than or equal to entry; otherwise it is exactly zero.
Short favorable delta is `entry_price_units - current_price_units` only when
current price is less than or equal to entry; otherwise it is exactly zero.
Equality therefore yields zero. The nonnegative subtraction is checked; the R
comparison uses checked unsigned 256-bit products. Overflow returns
`refused:arithmetic_overflow` and no lower-priority rule is evaluated.

Target presence is total:

| Target 1 | Target 2 | Classification |
| --- | --- | --- |
| `null` | `null` | valid; both target rules absent |
| present | `null` | valid; first-target partial rule only |
| present | present | valid only with the V2 side-aware strict ordering; both rules available |
| `null` | present | `invalid:numeric_domain_invalid` at `/position_snapshot/target_2_price_units` |

Missing fields are never treated as `null`. Partial quantity is the declared
checked floor-and-round-down-to-lot expression. A result below one lot or
leaving less than the minimum remainder returns
`refused:quantity_rule_not_representable`; no lower rule is selected. These
tables, canonical JSON, and domain-separated digests require byte-identical
results from any conforming implementation.

## Queue workflow, presence, and terminal closure

Position status remains exactly `open`, `exit_pending`, `partially_closed`, or
`closed`; it never contains `review_required`. `CanonicalExitQueueItemV3` has
queue status exactly `pending`, `leased`, `retry_wait`, `succeeded`,
`failed_terminal`, or `cancelled` and binds:

- decision position status/version N and snapshot digest;
- exit-pending position version N+1;
- lease tuple;
- active attempt identity/number;
- attempt count, last closed attempt identity/number/outcome;
- terminal result, cancellation record;
- an always-present append-only immutable conflict-evidence array;
- audit-chain head and queue-item digest.

The only transitions are:

```text
pending -> leased | cancelled
leased -> retry_wait | succeeded | failed_terminal
retry_wait -> leased | cancelled
```

The exact queue-item presence matrix is:

| Status | Lease tuple | Active attempt | Last closed attempt/outcome | Terminal result | Cancellation | Conflict array |
| --- | --- | --- | --- | --- | --- | --- |
| `pending` | all `null` | all `null` | all `null`; count 0 | `null` | `null` | present, initially empty |
| `leased` | all present | identity/number present and number equals attempt count | `null` when count 1; otherwise prior retryable outcome present | `null` | `null` | present |
| `retry_wait` | all `null` | all `null` | identity/number/retryable outcome present and number equals attempt count | `null` | `null` | present |
| `succeeded` | all `null` | all `null` | identity/number/terminal-candidate outcome present | required applied terminal result | `null` | present |
| `failed_terminal` | all `null` | all `null` | identity/number/terminal-candidate outcome present | required `terminal_failure` | `null` | present |
| `cancelled` | all `null` | all `null` | all `null` when cancelled from pending; prior retryable outcome present when cancelled from retry wait | `null` | required | present |

No terminal queue status has an outgoing transition. An active lease on a
closed item, a terminal result on a nonterminal item, an absent terminal result
on success/failure, simultaneous terminal and cancellation records, or a
cancellation without its permitted prior state is schema-invalid.

### Attempt outcome matrix

Every leased attempt closes once as `retryable_failure` or
`terminal_candidate`. All attempt outcomes require queue item, attempt identity,
attempt number, retry number, lease identity, outcome instant, sanitized
evidence digest, and outcome digest.

| Outcome | Execution identity/receipt | Terminal candidate digest | Queue effect |
| --- | --- | --- | --- |
| `retryable_failure` | both `null` | `null` | close attempt, clear lease/active attempt, enter `retry_wait`; retry allowed only by a new lease/attempt number |
| `terminal_candidate` for applied result | both present and provenance-verified | present | atomic terminal mapping below |
| `terminal_candidate` for terminal failure | both `null` | present | atomic terminal mapping below |

Any other presence combination is invalid. Attempt number is positive and
retry number is exactly attempt number minus one. The lease interval remains
`leased_at <= attempt_started_at < lease_expires_at`.

### Cancellation matrix

Cancellation is never an attempt or terminal result. Its record always contains
queue item, exact prior status, cancellation instant/reason, evidence digest,
and cancellation digest, with no lease or execution fields.

`cancellation_reason` is exactly one case-sensitive string from this closed
enum. The origin column is audit classification only and grants no authority:

| Serialized reason | Origin | Permitted prior queue status |
| --- | --- | --- |
| `operator_requested` | operator | `pending`, `retry_wait` |
| `policy_disabled` | policy | `pending`, `retry_wait` |
| `position_version_conflict` | conflict | `pending`, `retry_wait` |
| `retry_budget_exhausted` | lease | `retry_wait` only |
| `superseded_decision` | system | `pending`, `retry_wait` |
| `system_shutdown` | system | `pending`, `retry_wait` |

Missing, null, wrong-type, wrong-case, deprecated, unknown, or status-inapplicable
values are schema-invalid before cancellation identity/digest, queue, position,
audit, or conflict work. No alias is accepted. Cancellation identity and digest
bind the exact serialized enum member.

| Prior status | Attempt fields | Position effect |
| --- | --- | --- |
| `pending` | count 0; last attempt/outcome `null` | exit-pending N+1 -> decision position status at N+2 |
| `retry_wait` | last retryable attempt/outcome required | exit-pending N+1 -> decision position status at N+2 |

No other prior status may cancel. An identical cancellation is exact replay. A
different cancellation after closure preserves the original record and appends
immutable conflict evidence without another position transition.

### Terminal result closure mapping

| Result kind | Final queue status | Position effect | Applied fields | Retry | Audit/conflict behavior |
| --- | --- | --- | --- | --- | --- |
| `partial_exit_applied` | `succeeded` | exit-pending N+1 -> `partially_closed` N+2 with exact remaining reduction | execution identity/receipt, affected quantity and effective price present; stop `null` | prohibited | append one terminal audit record |
| `full_exit_applied` | `succeeded` | exit-pending N+1 -> `closed` N+2; affected quantity equals remaining quantity | execution identity/receipt, affected quantity and effective price present; stop `null` | prohibited | append one terminal audit record |
| `stop_change_applied` | `succeeded` | exit-pending N+1 -> `open` N+2 with exact new stop | execution identity/receipt and effective stop present; quantity/price `null` | prohibited | append one terminal audit record |
| `terminal_failure` | `failed_terminal` | explicit no-transition; position remains `exit_pending` N+1 | execution identity/receipt and all effect fields `null` | prohibited | append one terminal-failure audit record |

Every terminal mapping atomically clears all lease and active-attempt fields,
stores the immutable terminal bytes, updates audit head, and closes retry. An
identical terminal submission returns the existing item byte-for-byte and adds
no audit/conflict entry. A different terminal submission is rejected, never
changes queue status or position, never overwrites the first terminal result,
and appends one domain-separated immutable conflict-evidence record plus its
audit link. `manual_review_required` is only the conflict record's disposition,
never a position or queue status.

Each conflict-evidence record has exactly contract version, queue-item identity,
positive monotonic conflict sequence, conflict kind (`terminal_result_conflict`
or `cancellation_conflict`), the preserved first-record digest, the distinct
conflicting-record digest, literal disposition `manual_review_required`, and
`conflict_evidence_digest`. The digest domain is
`trade_management_exit_conflict_evidence_digest_v3`. The array is append-only;
no conflict record may replace or delete prior terminal, cancellation, conflict,
position, or audit bytes.

The closed schemas, per-status matrices, transition set, closure table, replay
rules, canonical JSON, and digest domains leave no implementation choice: two
conforming queue implementations must accept and reject the same states and
serialize every accepted queue item, outcome, cancellation, terminal result,
and conflict record to identical bytes.

## Durable recommendation-to-position binding

`CanonicalRecommendationPositionCommandV2` requires all of:

- `durable_recommendation_uuid`;
- positive `durable_recommendation_version`;
- `recommendation_identity` using `rec_decision:v1`;
- `recommendation_normative_digest`;
- the exact server-reserved position identity and canonical position inputs;
- execution identity/receipt digest both present or both null;
- command request instant, idempotency identity, and command digest.

The future transaction locks exactly the recommendation row selected by
`durable_recommendation_uuid` using an equivalent of `SELECT ... FOR UPDATE`.
It then requires the locked row UUID, version, canonical recommendation
identity, and normative digest to equal the command. `rec_decision:v1` alone is
never sufficient. It verifies eligibility and exact command bytes before any
position write.

The idempotency identity binds durable UUID/version, recommendation identity,
normative digest, position identity, and canonical command digest. An exact
retry for the same UUID returns the original `replayed` result. The same UUID
with changed version, identity, digest, position, or bytes is `conflict` or
`stale_recommendation_version` without writes. A different UUID with reused
recommendation identity, normative digest, idempotency identity, or position
identity is `recommendation_binding_conflict`. Missing or substituted UUIDs
fail closed. The transaction either locks, validates, creates position v1,
marks the same recommendation row taken, links snapshots, appends audit, and
commits, or rolls back every effect.

No migration or database writer is authorized by this design.

## Client non-authority and ownership

The client receives only an authenticated read projection. It never receives
policy material, registry access, authority handles, leases, credentials,
mutable commands, or terminal provenance. A projection cannot authorize a
transition; a server must re-read the exact durable position and recommendation
versions. Optimistic state is display-only.

The pure domain may validate, perform checked integer arithmetic, select the
private policy, and derive evidence. It may not read a clock, filesystem,
network, provider, database, queue, client, execution system, or broker.
Persistence, execution authority, transport, and client projection remain
separate, later, explicitly reviewed boundaries.

## Dependency and implementation gate

All unresolved Action 650/652, position-version, durable queue, market
observation, Tracks 2/3, roadmap reachability, and broker terminal/transport
gates remain unresolved in the dependency artifact.

Action 655B remains limited to a pure, deterministic, default-off canonical
exit evaluator with a private compile-time policy registry and no integration.
This remediation does not authorize its implementation. A separate independent
rereview must first verify closure of 655A.5-M1, M2, and M3, continued closure
of all previously closed findings, and issue a narrowly bounded local
implementation authorization. It cannot grant delivery, PR, merge, roadmap
completion, runtime, database, broker, or production authority.

## Action 655D exit-evaluator remediation overlay

This section is the normative `action_655d_exit_evaluator_remediation_contract_v1`
overlay on the otherwise unchanged Action 655A.6 contract set. It closes only
the four Action 655C major contract gaps and the fixture-oracle minor gap. The
rejected Action 655B implementation commit
`08e593a58fc18473d6a6212c10f72cae8b7587ce` is evidence, never authority.

### Exact JSON primitive types

Every UUID, position status, session state, identity, enum, digest, instant,
integer, boolean, and nullable field is validated as its declared JSON primitive
before value syntax or rule evaluation. Arrays, objects, numbers, booleans, and
null are never converted to strings. `String(value)`, template interpolation,
concatenation, loose equality, or any implicit comparison coercion is prohibited
as validation. A wrong JSON primitive type returns the `invalid` variant with
`error_code:"schema_invalid"`, the exact RFC 6901 field path, null provenance,
and no decision. The non-serialized diagnostic classification is
`wrong_json_primitive_type`; it does not add a field to the frozen result union.

Closed-schema/type validation completes before identity rebuilding, private
policy resolution, provenance, arithmetic, or any decision rule. Caller policy
fields remain forbidden. In particular, one-element arrays containing an
otherwise valid durable recommendation UUID, position status, session state,
policy identity, or digest can never produce a decision.

### Exact profit-protection rule

Priority 6 is selected solely when the checked comparison
`favorable_price_delta * profit_protection_r_denominator >=
initial_risk_price_units * profit_protection_r_numerator` is true after priorities
1–5 do not match. Its result is always `move_stop`, reason
`profit_protection_stop_move`, priority integer `6`, null quantity, and exact
entry price as the recommended stop. Current stop equal to entry does not
suppress the result. No current-stop state, idempotency inference, or other
undocumented exception may change this pure decision evidence.

For both sides with entry 100, initial risk 10, and current stop exactly 100,
the frozen below/equal/above current prices are long 109/110/111 and short
91/90/89. Below returns priority-7 hold. Equal and above return priority-6
move-stop to 100. The exact input and output digests are frozen in the manifest.

### Language-neutral canonical object-key comparator

Canonical object keys are ordered by lexicographic comparison of their exact
UTF-8 byte sequences after the already-required NFC/string validity checks.
Compare unsigned bytes left to right; at the first difference the lower byte
sorts first; if all shared bytes are equal, the shorter byte sequence sorts
first; equal byte sequences are equal keys and duplicates are rejected by JSON
parsing/canonical-form validation. Locale, collation, normalization during sort,
Unicode code-point order, and JavaScript default UTF-16 `.sort()` are forbidden.

U+E000 encodes as `EE 80 80` and sorts before U+10000, which encodes as
`F0 90 80 80`. The same ordering applies under nested objects and after repeated
ASCII or multibyte prefixes. With both as unknown root keys the first error is
`/\uE000`; under `position_snapshot` it is
`/position_snapshot/\uE000`; for `prefix`-prefixed keys it is
`/position_snapshot/prefix\uE000`. These rules do not normalize input or change
any previously frozen digest frame; they define the comparator those frames
already required.

### Normative input budget

The sole maximum is **65,536 bytes**. The unit is the exact lossless UTF-8 byte
length of the raw caller primitive-string serialization, including every JSON
punctuation, escape, key, value, and whitespace byte as supplied. The value is
captured once. Before JSON parsing, schema validation, normalization, canonical
serialization, identity/digest construction, policy resolution, provenance, or
rules, a language-neutral scanner validates a Unicode-scalar sequence and sums
UTF-8 bytes with checked arithmetic: U+0000–007F costs 1, U+0080–07FF costs 2,
U+0800–FFFF excluding surrogates costs 3, and U+10000–10FFFF costs 4. A valid
surrogate pair denotes one supplementary scalar; a lone surrogate is
`invalid:canonical_form_invalid` at `/`. Addition stops fail-closed before
overflow or once byte 65,537 is established; no replacement encoding is used.
After parsing, every JSON string is independently required to be a Unicode
scalar sequence before NFC validation, so an ASCII `\ud800`/`\udfff` escape
cannot introduce a lone surrogate into an accepted value.

Lengths 65,535 and 65,536 proceed to ordinary parse/schema/canonical/digest
validation. Length 65,537 returns `invalid` with
`error_code:"input_budget_exceeded"`, `error_path:"/"`, null provenance and
all other union payloads null. It constructs only the bounded invalid
decision/result digest frames: decision digest
`9215e974a247735bd623db224f08b04791822adedc549baa91f1e714020062e9`
and result digest
`1fd98c51aed5a917650244ad64e3f9949fa5f474bdc1a3d847ba4ce6dfb2ee62`.
The oversized caller text is not echoed or cryptographically claimed as bound.

ASCII, BMP `é`, and supplementary-plane `😀` exact-boundary vectors are frozen
in the manifest. All are counted as UTF-8 bytes, never JavaScript code units,
so conforming implementations in different languages cannot disagree.

### Independent fixture oracle and future boundary

Any remediation of Action 655B must use a test-only, independent reference
canonicalizer that neither imports, copies, shares, nor mechanically mirrors the
production comparator/canonicalizer. Expected canonical bytes, SHA-256 values,
decision identities, and result bytes are literal fixture data. Direct probes
must first fail against rejected 655B for array coercion, stop-at-entry,
UTF-16 ordering, and code-unit budget measurement, then pass only against a new
five-path implementation successor.

A future implementation remediation may modify only the same five Action 655B
paths and must be based on this overlay, receive a new commit and digest, and
undergo a separate independent source review. This design grants no current
implementation, delivery, PR, merge, runtime, persistence, roadmap-completion,
provider, broker, database, or production authority. All dependency gates,
Action 654 byte parity, Action 654U sole runtime authority, and the runtime
export allowlist remain unchanged.

## Action 655D.2 invalid-enum and raw-JSON closure

This section is the normative
`action_655d2_raw_json_validation_closure_v1` successor to the Action 655D
overlay. It closes 655D.1-M1 and 655D.1-M2 by changing no runtime or
implementation bytes. For invalid codes and raw-input processing it supersedes
the earlier prose; every unrelated Action 655A.6 and 655D closure remains.

### One closed invalid-reason enum

The only invalid reason values are these seven exact case-sensitive JSON
strings:

1. `schema_invalid`;
2. `missing_required_input`;
3. `canonical_form_invalid`;
4. `input_budget_exceeded`;
5. `numeric_domain_invalid`;
6. `unsupported_contract_version`;
7. `policy_registry_integrity_failure`.

`input_budget_exceeded` is valid only after the captured primitive string has
passed raw Unicode-scalar validation and its checked lossless UTF-8 count is
proved greater than 65,536. It is never used for a wrong runtime type, BOM,
malformed JSON, trailing data, duplicate key, non-NFC text, schema/type error,
or identity failure. Misspelled, wrong-case, deprecated, null, array, number,
boolean, or object reason values are not result variants: result validation
stops before digest or authority work. The exact oversized result remains
invalid at `/`, with null provenance, decision digest
`9215e974a247735bd623db224f08b04791822adedc549baa91f1e714020062e9`,
and result digest
`1fd98c51aed5a917650244ad64e3f9949fa5f474bdc1a3d847ba4ce6dfb2ee62`.

### Total raw-input validation order

The operation receives one primitive string whose captured UTF-16 code units
represent the exact caller JSON text. Other host languages must expose the same
lossless scalar sequence and raw bytes. Processing order is total:

| Stage | Validation | Exact failure |
| ---: | --- | --- |
| 1 | Runtime value is a primitive string; no coercion, property read, reflection, or boxing | `invalid:schema_invalid` at `/`, null provenance |
| 2 | One complete pass validates every raw UTF-16 pair and uses a nonallocating checked UTF-8 counter saturated at 65,537 | `invalid:canonical_form_invalid` at `/`, null provenance |
| 3 | After the complete scalar pass, reject a saturated 65,537 count | `invalid:input_budget_exceeded` at `/`, null provenance |
| 4 | Reject an initial U+FEFF; its three bytes have already counted | `invalid:canonical_form_invalid` at `/`, null provenance |
| 5 | Strict RFC 8259 lexical/syntax scan with no comments, extensions, recovery, NaN, or Infinity; decode escapes without materializing an object | `invalid:canonical_form_invalid` at `/`, null provenance |
| 6 | Require document end immediately after one root value; trailing JSON whitespace is noncanonical | `invalid:canonical_form_invalid` at `/`, null provenance |
| 7 | Validate every decoded key and value as a scalar sequence and exact NFC, in source-token order; never normalize | `invalid:canonical_form_invalid` at the exact representable pointer, otherwise `/`; null provenance |
| 8 | Reject the second exact decoded NFC key occurrence per object before last-write-wins materialization | `invalid:canonical_form_invalid` at the second key's decoded RFC 6901 pointer; null provenance |
| 9 | Rebuild minimal JSON with unsigned lexicographic UTF-8 key order and no whitespace; require raw byte equality | `invalid:canonical_form_invalid` at `/`, null provenance |
| 10 | Closed schema, required/unknown/nullability, version, and exact JSON primitive types in manifest order | declared invalid code and exact pointer; null provenance |
| 11 | UUID, enum, digest, instant, integer, tick/lot, geometry, and target value domains | declared invalid code and exact pointer; null provenance |
| 12 | Rebuild position, observation, request, and input identities/digests | `refused:identity_conflict` with its frozen presence matrix |
| 13 | Resolve private policy, verify its digest, then build complete provenance | frozen authority/integrity result |
| 14 | Apply eligibility, freshness, arithmetic, and priorities 1–7 | one total noneligible, refused, or decision variant |

Scalar/NFC validation precedes duplicate insertion so distinct keys are never
normalized into one. Duplicate comparison is over exact decoded NFC scalar
sequences: `"a"` and `"\u0061"` are duplicates, while a decomposed key fails
stage 7 before it could collide with a precomposed key. The second occurrence
in source order supplies the pointer after RFC 6901 escaping.

The tokenizer retains key occurrences and document-end position. It never
delegates duplicates to `JSON.parse` and never accepts last-write-wins.
Truncated objects/arrays, invalid escapes, invalid numbers, and unexpected
tokens fail stage 5. A second value, token, comment, NUL, or trailing space
fails stage 6. Leading or internal whitespace can be lexically valid but fails
the canonical-byte comparison at stage 9.

An initial BOM is forbidden. It is a valid scalar and costs three raw bytes, so
BOM plus enough bytes to exceed the budget fails stage 3 before stage 4. This
lets the budget gate prevent parser work for every valid-scalar oversized
string.

A raw unpaired host surrogate fails stage 2 before TextEncoder-like replacement.
An ASCII JSON escape for a lone high, lone low, or reversed pair passes the raw
scan but fails strict escape/scalar decoding at stage 5, at `/`. A valid escaped
pair decodes one supplementary scalar but fails stage 9 because canonical JSON
emits the scalar directly. A literal valid pair costs four UTF-8 bytes and
continues. U+FFFD is accepted only when literally supplied, never as replacement.

The raw scan completes scalar validation even after its byte counter saturates;
the counter performs no further addition or allocation. Therefore invalid raw
encoding anywhere in the captured string wins over the budget condition, while
every fully valid-scalar oversized string reaches stage 3. This supersedes the
earlier early-return wording and is required because `input_budget_exceeded`
is forbidden for invalid encoding.

Keys and values must already be NFC. Precomposed U+00E9 is preserved;
decomposed U+0065 U+0301 is rejected after its exact three raw bytes count. The
manifest freezes 65,535/65,536/65,537-byte combining vectors: the in-budget
inputs reach NFC rejection at
`/monitor_observation/market_data_contract_version`; the oversized input stops
first with `input_budget_exceeded` at `/`.

### Compound precedence and digest closure

Stage number, not parser preference or source position across categories,
selects one result. Raw lone surrogate anywhere beats budget; budget beats BOM; BOM beats
syntax; syntax beats trailing/duplicate; trailing beats duplicate; non-NFC
beats duplicate; duplicate beats schema; canonical-byte failure beats schema;
schema/type and numeric failure beat identity; identity failure beats rules.

Malformed, BOM, trailing, escaped-surrogate, and root canonical failures share
the explicit non-input-binding invalid evidence digests
`f6fc201f287e1584970cf87b8a9adff50a55acf229aea8380e789b2e62851155`
and `edecfcddcb593a00c72007fd3ba121490f116a461d13e55b93d39d40b0b51056`.
Duplicate and NFC failures use the same total frames with exact pointers; all
results are frozen in the manifest. Policy, provenance, decision, accepted
budget, and prior result vectors remain byte-identical.

The fixture oracle must implement this tokenizer and comparator without
importing, sharing, copying, or mechanically mirroring production logic.
Literal raw bytes, SHA-256 values, pointers, decision digests, and result
digests are external expectations. A later implementation may touch only the
same five 655B paths, requires a new commit/digest and independent source
review, and remains unauthorized until this design receives independent
rereview.

## Action 655D.4 malformed UTF-8 and negative-zero closure

This section is the normative
`action_655d4_utf8_negative_zero_closure_v1` successor to Action 655D.2. It
remediates only 655D.3-M1 and 655D.3-M2. Every unrelated Action 655A.6, 655D,
and 655D.2 rule remains byte-semantic authority.

### Exact evaluator and upstream byte boundaries

The evaluator's sole public input is one primitive ECMAScript string captured
exactly once. Such a string is a sequence of UTF-16 code units. The evaluator
never accepts, inspects, decodes, enumerates, reflects on, or coerces a byte
container. `Buffer`, `Uint8Array`, `ArrayBuffer`, arrays, boxed strings,
functions, proxies, and all other objects are non-strings and fail stage 1 as
`invalid:schema_invalid` at `/`. Their contents are read zero times. The result
has null decision priority and provenance, decision digest
`1267a5ba3b03eb9d804c388e2532f369308e667b735468f5eecbaa525d31bbd6`,
and result digest
`e7b89abfc29b88e52690d9e2b2b325237658ff85bceb73312e2e5ed1b230fe2c`.

A primitive string whose UTF-16 units encode only Unicode scalar values
continues through the existing full scalar scan and lossless UTF-8 budget. A
primitive string containing an unpaired high or low surrogate fails stage 2 as
`invalid:canonical_form_invalid` at `/`, with null priority and provenance,
decision digest
`f6fc201f287e1584970cf87b8a9adff50a55acf229aea8380e789b2e62851155`,
and result digest
`edecfcddcb593a00c72007fd3ba121490f116a461d13e55b93d39d40b0b51056`.

Malformed UTF-8 bytes cannot be represented as an evaluator string. When an
external byte source exists, a separate upstream boundary must strictly decode
UTF-8 before evaluator invocation. It may neither replace malformed input with
U+FFFD, ignore bytes, recover, normalize, nor call the evaluator after a decode
failure. Valid decoding produces one primitive string and invokes the evaluator
once. Malformed decoding produces exactly the bounded non-evaluator outcome:

- `boundary_contract_version`:
  `action_655d4_strict_UTF8_boundary_rejection_v1`;
- `outcome:"rejected_before_evaluator"`;
- `reason:"malformed_utf8"`;
- null error path, decision priority, decision digest, result digest, and
  provenance digest;
- `evaluator_invoked:false`, `replacement_performed:false`,
  `side_effects_performed:false`, and `input_binding_claimed:false`.

This record is not a `CanonicalExitEvaluationResultV4`; it cannot claim an
evaluator result or digest. Action 655D.4 creates no decoder, adapter, route, or
runtime integration.

Literal U+FFFD in a caller-supplied primitive string is a valid scalar and is
treated only according to the JSON/canonical/schema stages. For the canonical
root JSON string `"�"`, stage 10 returns `invalid:schema_invalid` at `/` with
the schema-root digests. This does not authorize replacement decoding. Once an
upstream component has lossily replaced bytes, the evaluator cannot recover
their origin; strict upstream rejection is therefore a mandatory boundary
precondition, not an evaluator heuristic.

The manifest freezes ASCII, precomposed multibyte, BMP, astral, literal U+FFFD,
raw lone-surrogate, direct Buffer/Uint8Array, valid strict-decode, overlong,
invalid-continuation, encoded-surrogate, invalid-four-byte, and truncated-byte
vectors. Direct byte containers always receive the stage-1 evaluator result;
malformed external byte streams always receive the no-digest upstream result.

### Language-neutral raw number-token model

The strict tokenizer retains every raw JSON number lexeme and its exact JSON
Pointer until canonical stage 9. It does not materialize a JavaScript `Number`,
perform floating-point conversion, or call a default JSON serializer first.
Canonical number processing is lexical and language-neutral.

The only canonical integer token spellings are:

- `0`; or
- an optional `-`, one digit from `1` through `9`, then zero or more digits.

Fractions and exponent forms are syntactically valid JSON but noncanonical for
this contract. A negative-zero token is any token with a leading minus whose
coefficient digits are all zero, regardless of fraction or exponent. Its
mathematical canonical serialization is exactly `0`; therefore every negative
zero spelling, including `-0`, `-0.0`, `-0e0`, and `-0E+0`, is noncanonical.

Stage 9 has a fixed internal order. It first walks retained number tokens in
source-token order, derives each canonical lexeme without host numeric
materialization, and rejects a mismatch at that token's exact pointer. Only
after all number tokens pass does it rebuild the complete document and perform
the existing root byte-equality check. Thus `-0` at `/n`, `/0`, or
`/position_snapshot/position_version` returns
`invalid:canonical_form_invalid` at that exact pointer, with null decision
priority and provenance. It never reaches schema, numeric-domain, identity, or
rule validation.

Canonical integer lexemes are carried as decimal token text through stage 9.
Stage 10 determines the declared JSON primitive type without coercion. Stage 11
performs positivity, safe-integer, and declared range checks using exact decimal
arithmetic. An unsafe or out-of-range canonical integer therefore fails
`numeric_domain_invalid` at its declared pointer; it is never rounded by a host
number type.

The manifest freezes raw hashes and outcomes for zero, negative-zero variants,
fractional zero, exponent zero, one, fractional/exponent nonzero, negative
nonzero, unsafe integer, out-of-range integer, nested object, and array cases.
It also freezes exact pointer-dependent decision/result digests.

### Negative-zero compound precedence

The unchanged 14-stage order applies. Trailing data at stage 6 wins over a
negative-zero token. A duplicate key at stage 8 wins before its value's stage-9
canonical mismatch. Otherwise negative zero at stage 9 wins over closed-schema,
numeric-domain, identity/digest, and evaluator-rule failures. Within stage 9,
the source-order number-token check precedes whole-document canonical byte
comparison. `numeric_domain_invalid` can never win for the same negative-zero
token.

The invalid enum remains exactly seven members, the byte budget remains 65,536,
and every BOM, malformed JSON, trailing, duplicate, NFC, surrogate, type,
profit-protection, UTF-8 key order, digest, queue, recommendation, freshness,
private-policy, dependency, roadmap, and Action 654 closure remains unchanged.

This design remains pending independent rereview. It grants no Action 655B
implementation remediation, branch, PR, delivery, runtime, route, queue,
database, migration, broker, credential, provider, roadmap-completion, or
production authority.
