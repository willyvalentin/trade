# Action 655D.4 — Server-Owned Trade Management Threat Model

Contract set: `action_655d4_server_owned_trade_management_v6`.

This is design evidence only. It performs and authorizes no implementation,
runtime, database, migration, provider, client, execution, broker, transport,
delivery, or production work.

## Trust boundaries

Every caller value, authenticated request, copied digest, policy-shaped object,
timestamp, recommendation identity, projection, callback, accessor, and
self-consistent clone is untrusted. A supplied digest proves consistency, not
authority. The private policy registry establishes policy provenance. Durable
persistence will establish recommendation/position versions only in later
Actions. The total evaluator produces non-authoritative evidence only.

## Finding-resolution matrix

| Finding | Frozen closure | Mandatory evidence |
| --- | --- | --- |
| 655A.5-M1 | Exact provenance, decision-identity, decision-digest, and result-digest frames/projections; decision digest present for all four variants | independent canonical rebuild, altered recommendation/policy/observation/request/discriminator vectors, omitted-null and reordered-raw rejection |
| 655A.5-M2 | Six-member cancellation enum with exact origin/status applicability and fail-closed unknown handling | 11 valid status/reason pairs and unknown/missing/deprecated/wrong-type/inapplicable negatives |
| 655A.5-M3 | Sole policy frame key `projection`, exact five-field frame and rebuilt allowlist digest | positive rebuild plus alternate-name, reordered-raw and altered-projection negatives |
| 655A.3-M1 | Four-variant total result union; exact successful rule/status/reason/integer-priority mapping; invalid variant without fabricated provenance; closed noneligible/refused results; side-aware favorable delta; total target-nullability matrix | exhaustiveness, per-variant presence, rule mapping, invalid/missing input, favorable-delta vectors, target matrix, independent serialization/digest rebuild |
| 655A.3-M2 | Six queue statuses with exact field-presence matrix; exact attempt/cancellation matrices; terminal kind to queue/position mapping; immutable repeated/conflicting terminal behavior | status-product negative matrix, terminal mapping, cancellation prior-state matrix, exact-repeat and conflict immutability |
| 655A.1-M1 | Public policy data remains absent; exact private allowlist unchanged | caller policy mint/clone/selector rejection and policy digest rebuild |
| 655A.1-M3 | Observation and market-data freshness remain bound to every exact request | delayed replay, cross-request substitution, future and strict age boundaries |
| 655A.1-M5 | Durable recommendation UUID/version/decision identity/digest and exact row lock remain mandatory | missing/stale/substituted UUID and exact-retry/conflict matrices |

## Total-result adversarial matrix

| Attack or boundary | Required result |
| --- | --- |
| Valid eligible input with one or several rules true | Exactly one `decision` payload according to priority 1–7; other union payloads null |
| Valid `exit_pending` position | `noneligible:position_exit_pending`; full verified provenance; no decision fields |
| Valid `closed` position | `noneligible:position_closed`; full verified provenance; no decision fields |
| Missing required field | `invalid:missing_required_input` with deterministic RFC 6901 path and no fabricated provenance |
| Unknown field or wrong primitive/schema | `invalid:schema_invalid` using fixed first-error order |
| Invalid integer, tick, lot, risk, side geometry, or target-2-only | `invalid:numeric_domain_invalid` at exact field path |
| Policy registry integrity failure | `invalid:policy_registry_integrity_failure`, path null, no caller provenance |
| Identity mismatch | `refused:identity_conflict`; only canonical input digest and request instant retained |
| No private policy match | `refused:authority_unavailable`; verified input provenance, policy tuple null |
| Stale/future/effective-window refusal | `refused` with all verified provenance and exact causal path |
| Arithmetic overflow | `refused:arithmetic_overflow`; no lower-priority evaluation |
| Partial quantity not representable | `refused:quantity_rule_not_representable`; no fallback |
| Long favorable price | checked `current-entry`; below-entry becomes zero |
| Short favorable price | checked `entry-current`; above-entry becomes zero |
| Price equals entry | favorable delta exactly zero |
| Neither target | valid, no target rule |
| Target 1 only | valid, partial rule only |
| Targets 1 and 2 | valid only with side-aware strict ordering |
| Target 2 without target 1 | invalid at target-2 path |
| Payload discriminator mismatch or multiple non-null payloads | schema-invalid result object; never emitted by conforming evaluator |

All top-level results have the same exact field set, exactly one non-null payload,
an always-present decision digest, reason-dependent nullable provenance digest,
`side_effects_performed:false`, and a rebuilt V4 result digest. Invalid payloads
never invent position, observation, request, input, policy, or decision IDs.

## Digest-frame adversarial matrix

| Attack | Required result |
| --- | --- |
| Policy frame uses `canonical_unsigned_projection` or any alias | closed-schema rejection before hashing |
| Policy, provenance, or decision raw keys reordered | reject noncanonical raw bytes before digest comparison |
| Required explicit-null decision field omitted | reject missing projection field; do not hash |
| Policy projection, ID, identity, or version altered | rebuilt digest differs from sole allowlist; integrity failure |
| Recommendation UUID or positive version altered | provenance digest differs |
| Position identity/version/snapshot digest altered | provenance digest differs |
| Observation or market-data identity/digest/time altered | provenance digest differs |
| Request identity/instant or input digest altered | provenance digest differs |
| Policy tuple or policy digest altered | provenance digest differs |
| Result discriminator altered with old payload fields | decision digest differs and presence matrix rejects contradiction |
| Provenance digest embedded as raw bytes or uppercase text | schema rejection; only lowercase hexadecimal JSON text is valid |
| Integer version/priority quoted, fractional, exponent, or reordered by locale | schema or canonical-byte rejection |

## Queue adversarial matrix

| Attack or contradiction | Mandatory rejection or containment |
| --- | --- |
| Lease tuple outside `leased` | reject contradictory queue item |
| Missing active attempt while leased | reject; leased always starts one exact attempt |
| Active attempt on pending/retry/terminal/cancelled | reject |
| Terminal result on pending/leased/retry | reject |
| Missing terminal result on succeeded/failed_terminal | reject |
| Cancellation record outside cancelled | reject |
| Terminal result plus cancellation record | reject |
| Pending attempt count nonzero | reject |
| Retry wait without last retryable outcome | reject |
| Succeeded with terminal failure | reject |
| Failed terminal with applied result | reject |
| Applied result without execution identity/receipt | reject |
| Terminal failure with execution/effect fields | reject |
| Cancellation from leased or terminal state | reject |
| Cancellation from pending with attempt evidence | reject |
| Cancellation from retry wait without retryable evidence | reject |
| Unknown, missing, deprecated, wrong-case or wrong-type cancellation reason | reject before identity/digest or state work |
| `retry_budget_exhausted` from pending | reject as status-inapplicable |
| Caller claims an enum origin as cancellation authority | reject; origin is audit classification only |
| Identical terminal repeat | return existing bytes; no audit/conflict append or position mutation |
| Conflicting terminal repeat | preserve first result/status/position; append one immutable conflict record and audit link only |
| Identical cancellation repeat | return existing bytes |
| Conflicting cancellation repeat | preserve first cancellation/position effect; append immutable conflict evidence only |
| Retry after terminal/cancelled | reject; terminal statuses have no outgoing transition |
| Readiness result as terminal fill | reject structurally; Action 654U is transport-inert |

Decision position version N, queue-created exit-pending version N+1, and every
permitted terminal/cancellation position effect at N+2 are explicit. Terminal
failure is the sole no-transition result and leaves exit-pending N+1 unchanged.

## Preserved adversarial boundaries

- Policy-shaped caller fields, selectors, factories, callbacks, and authority
  handles fail closed before registry resolution.
- Observation reuse is re-evaluated against each exact request; strict maximum
  equality is stale and future skew is zero.
- Durable recommendation UUID alone or `rec_decision:v1` alone is insufficient;
  UUID/version/identity/digest must match the locked row.
- Getters, proxies, functions, symbols, cycles, unsafe integers, locale numbers,
  timezone-less instants, audit truncation, restricted material, and automatic
  activation remain rejected.

## Validation order and residual gates

The future boundary validates schema/size, canonical primitives, digests,
identities, private policy, request freshness, checked arithmetic, then constructs
the total union. Invalid/refused results perform zero persistence, queue,
execution, broker, client, or production work.

Roadmap provenance remains unreachable from starting main. Position version,
durable queue/audit persistence, recommendation reopen semantics, authenticated
writer rollout, Tracks 2/3, and broker terminal/transport gates remain unresolved.
Action 654U remains the sole readiness runtime authority; Action 654V and all
review/remediation artifacts remain non-authority evidence. Action 655B remains
unauthorized until a separate independent rereview verifies all three 655A.5
closures and approves this freeze.

## Action 655D remediation threat cases

These cases are governed by
`action_655d_exit_evaluator_remediation_contract_v1`.

The following cases supplement every prior threat and do not relax earlier
closures:

| Threat | Mandatory containment | Frozen detection |
| --- | --- | --- |
| One-element array impersonates UUID, status, session state, identity, enum, or digest | exact JSON primitive-type failure before value syntax, identity, policy, provenance, arithmetic, or rules; `invalid:schema_invalid` at exact path | five wrong-type array vectors; rejected 655B must emit a decision for at least its reproduced vulnerable cases and the successor must emit none |
| Validator uses `String(...)`, interpolation, concatenation, loose equality, or implicit comparison coercion | forbidden by source scan and runtime probes | production source deny scan plus array/object/number/boolean/null matrix |
| Closed position or closing session encoded as array bypasses eligibility/priority | invalid before all rules | `["closed"]` and `["closing"]` must never yield hold or any decision |
| Stop already equals entry suppresses a matched profit threshold | current stop is irrelevant to priority-6 predicate | long and short stop-at-entry threshold equal/above vectors remain `move_stop` |
| Hidden stop-state optimization changes pure evidence | prohibited undocumented rule predicate | below/equal/above matrix for both sides |
| UTF-16 key sorting disagrees with UTF-8 canonical order | unsigned UTF-8 byte comparator only | U+E000 precedes U+10000 at root, nested object, and repeated prefix; exact first-error paths frozen |
| Locale, normalization, or code-point collation affects order | no locale/collation; validate existing NFC rule before byte comparison | cross-process, locale, and timezone comparator probes |
| JavaScript code-unit length is treated as byte budget | raw caller serialization measured in lossless UTF-8 bytes | ASCII, BMP, and supplementary exact-boundary vectors with distinct code-unit counts |
| Oversized text is parsed or hashed before rejection | checked UTF-8 length precedes parse/schema/normalization/input digests | 65,537-byte vector maps to bounded invalid evidence with null provenance |
| Literal or JSON-escaped lone surrogate silently becomes UTF-8 replacement bytes | reject canonical form; never replace; validate parsed strings as scalar sequences before NFC | literal and escaped high/low lone-surrogate vectors |
| Production and fixture share the same canonicalizer defect | independent test-only oracle with literal expected bytes/digests | mutation/direct-probe requirement detects all four 655C majors against rejected 655B |
| Remediation reuses rejected implementation as authority | successor contract commit is sole design basis; rejected bytes are negative evidence only | lineage manifest and new implementation digest required |

The exact budget result is `invalid/input_budget_exceeded` at `/`, with null
provenance, one-hot invalid payload, decision digest
`9215e974a247735bd623db224f08b04791822adedc549baa91f1e714020062e9`,
and result digest
`1fd98c51aed5a917650244ad64e3f9949fa5f474bdc1a3d847ba4ce6dfb2ee62`.
It does not claim input binding. All live, database, persistence, queue,
transport, credential, broker, trade, client-write, and production capabilities
remain absent.

## Action 655D.2 raw-validation threat closure

The seven-member invalid enum in the manifest is the sole authority. The
earlier six-member list is superseded; `input_budget_exceeded` is neither an
alias nor a fallback for malformed input.

| Threat | Mandatory containment | First-error stage |
| --- | --- | ---: |
| Non-string, boxed string, object, array, function, proxy, symbol, number, boolean, or null | hook-free primitive-type refusal; no coercion | 1 |
| Raw unpaired high/low surrogate | reject before replacement encoding or byte-budget decision | 2 |
| Valid-scalar input exceeds 65,536 raw UTF-8 bytes | bounded `input_budget_exceeded` at `/`; no parse/digest/policy work | 3 |
| BOM is silently stripped by host parser | count its three bytes, then reject initial U+FEFF | 4 |
| Truncated JSON, invalid escape/number, unexpected token, comment extension | strict RFC 8259 syntax rejection at `/` | 5 |
| Parser accepts second value or trailing whitespace/token/comment/NUL | reject everything after the root value | 6 |
| Parser or normalizer replaces escaped lone surrogate | reject decoded invalid scalar without U+FFFD | 5 |
| Decomposed string or key is normalized silently | reject non-NFC exact input; never modify it | 7 |
| Two distinct keys normalize to one | reject the first non-NFC key before duplicate insertion | 7 |
| Duplicate key uses last-write-wins | retain occurrences and reject second decoded NFC key | 8 |
| `"a"` and `"\u0061"` evade duplicate comparison | compare after escape decoding | 8 |
| Locale/UTF-16/noncanonical key order or whitespace changes canonical bytes | independent unsigned UTF-8 canonical rebuild and byte equality | 9 |
| Wrong JSON type is coerced before schema validation | exact primitive matrix and no coercion | 10 |
| Invalid enum reason is unknown, wrong-case, array, null, or deprecated | reject purported result before digest work | result validation |
| Malformed and oversized input chooses parser error | budget stage wins for every valid-scalar 65,537-byte input | 3 |

Compound precedence is immutable: stage number wins across categories. This
prevents JavaScript, Rust, Go, Java, or database JSON parsers from selecting
different errors. The raw tokenizer, duplicate table, normalization rejection,
canonical comparator, schema walker, and digest frames must be independently
testable. Fixture expectations are literal and cannot share production helpers.

Action 655D.2 changes no implementation, route, migration, database, provider,
queue, transport, broker, client, or production surface. It remains pending
independent rereview and grants no Action 655B remediation authority.

## Action 655D.4 boundary and number-token threat closure

These cases are governed by
`action_655d4_utf8_negative_zero_closure_v1`.

| Threat | Mandatory containment | Frozen outcome |
| --- | --- | --- |
| Malformed bytes are treated as an evaluator string | malformed UTF-8 is unrepresentable at the primitive-string evaluator boundary; a separate strict decoder rejects first | upstream `rejected_before_evaluator:malformed_utf8`; evaluator false; all digests null |
| Decoder inserts U+FFFD or ignores invalid bytes | replacement, recovery, lossy decode, and normalization are forbidden | boundary failure; evaluator and side effects remain zero |
| Literal U+FFFD is confused with replacement history | evaluator treats literal U+FFFD as an ordinary scalar but makes no origin claim | canonical root string reaches schema-invalid; upstream replacement remains prohibited |
| Valid Buffer/Uint8Array is decoded implicitly | stage 1 uses only primitive runtime type and reads zero container contents | `invalid:schema_invalid` at `/` with schema-root digests |
| Malformed Buffer/Uint8Array changes evaluator result based on its bytes | all byte containers are identically non-string regardless of contents | same stage-1 schema-invalid result; bytes read zero |
| Raw lone UTF-16 surrogate is replacement-encoded | complete scalar scan rejects before byte-budget or parsing | stage-2 canonical-form-invalid root digests |
| `JSON.parse` or host number materialization erases `-0` | retain raw number lexeme and pointer through stage 9 | negative zero is canonical-form-invalid at exact pointer |
| Default serializer disagrees about `-0` | mathematical negative zero has sole canonical spelling `0` | `-0`, `-0.0`, `-0e0`, and `-0E+0` all fail stage 9 |
| Fraction or exponent is silently accepted as canonical integer | canonical integer grammar excludes fraction and exponent | stage-9 canonical-form-invalid at number pointer |
| Huge integer is rounded before domain checking | preserve exact decimal token text through canonical validation | stage 11 exact numeric-domain-invalid when outside declared bounds |
| Numeric-domain error masks negative zero | stage 9 precedes stages 10–14 | canonical-form-invalid wins |
| Duplicate or trailing syntax is hidden by number handling | unchanged stage ordering remains authoritative | trailing stage 6; duplicate stage 8; number canonical stage 9 |

The strict UTF-8 boundary rejection is not an evaluator result and claims no
input-binding digest. No adapter is created by this Action. The evaluator has
total outcomes for every runtime value: scalar-valid primitive string
continues, unpaired-surrogate primitive string is stage-2 invalid, and every
non-string is stage-1 invalid.

Stage 9 first walks number tokens in source order and reports their exact RFC
6901 pointer, then performs the existing whole-document canonical byte check.
This suborder removes dependence on JavaScript Number, floating point, locale,
or serializer behavior. Pointer-specific decision/result digests are frozen in
the manifest.

All seven invalid reasons, 14 stages, 65,536-byte budget, prior finding
closures, dependency gates, Action 654 bytes and export allowlist, and safety
false values remain intact. Action 655D.4 remains design evidence pending
independent rereview and authorizes no implementation, route, queue, database,
migration, broker, credential, provider, or production capability.
