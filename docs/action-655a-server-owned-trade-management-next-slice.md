# Action 655A.6 — Proposed Next Slice: Action 655B

Contract set: `action_655d4_server_owned_trade_management_v6`.

Authorization status: **not authorized pending Action 655D.4 independent rereview**. This
artifact freezes only the maximum local design-compatible scope. It grants no
implementation, delivery, PR, merge, runtime, persistence, provider, broker,
roadmap-completion, or production authority.

## Exact proposed scope

Action 655B may create exactly five artifacts:

1. `lib/action-655b-canonical-exit-evaluator.ts` — pure production module;
2. `tests/fixtures/action-655b-canonical-exit-evaluator-fixtures.ts` — plain
   synthetic fixtures;
3. `tests/e2e/action-655b-canonical-exit-evaluator.spec.ts` — focused and
   adversarial tests;
4. `docs/action-655b-canonical-exit-evaluator-contract.md` — contract;
5. `docs/action-655b-canonical-exit-evaluator-golden-report.json` — synthetic
   golden report.

The operation would accept `action_655a6_exit_evaluation_input_v4` and return
the total `action_655a6_exit_evaluation_result_v4` union. Production runtime
exports may contain only `evaluateAction655bCanonicalExitDecision` plus erased
plain input/result types needed to call it.

## Required total result behavior

The operation must emit exactly one of `decision`, `noneligible`, `invalid`, or
`refused`, using the common top-level field set and one-hot payload matrix. It
must implement the manifest's exact:

- rule to status/reason/integer-priority mapping;
- recommended quantity/stop presence matrix;
- `exit_pending` and `closed` noneligible outcomes;
- invalid error codes, deterministic first-error path, and absence of invented
  provenance;
- refusal reason groups and provenance presence matrix;
- exact nullable top-level provenance digest and always-present decision digest;
- exact `projection` frames and manifest rebuild vectors;
- side-aware favorable-price delta and checked overflow behavior;
- four-row target-nullability matrix;
- canonical V4 result digest.

Two conforming implementations must emit identical canonical bytes and digests
for every input. No exception, fallback status, implicit default, undocumented
nullability, or lower-priority continuation after refusal is permitted.

## Private policy composition

The public input has no policy field or selector. The production module may
contain exactly one deep-frozen, unexported registry entry matching policy ID
`server_primary_exit_policy`, version `2`, identity
`tm_exit_policy:v3:server_primary_exit_policy:2`, and digest
`746fb35346a353752cc01a38d76a2b6e5593b41f8e7e078d746ebfd221c496cf`.
It exports no registry, allowlist, resolver, mint,
factory, bootstrap, alternate test policy, counter, or privileged hook. Caller
policy-shaped fields are schema-invalid before private resolution.

## Required pure operation order

1. Capture one primitive caller string exactly once without hooks or coercion.
2. Execute the complete Action 655D.2 raw scalar, lossless UTF-8 budget, BOM,
   strict JSON, trailing, NFC, duplicate-key, and canonical-byte pipeline in its
   frozen fourteen-stage order.
3. Validate contract version, closed schema, exact JSON primitive types,
   canonical strings, instants, integers, scales, tick/lot alignment, side
   geometry, risk equality, and target matrix.
4. Rebuild and verify caller-carried position, observation, request, and input
   identities/digests; do not construct a result or decision yet.
5. Resolve the exact private policy allowlist.
6. Bind position/observation/instrument/version, durable recommendation
   UUID/version, request identity, and construct provenance only when its entire
   verified projection is available.
7. Enforce both strict request-time age limits and zero future skew.
8. Enforce the policy effective interval.
9. Return noneligible before successful rule evaluation when status is
   `exit_pending` or `closed`.
10. Apply checked integer arithmetic and priorities 1 through 7; construct a
    decision identity only for the selected successful decision.
11. Construct the exact sixteen-field decision-digest projection for the chosen
    result variant, including every explicit null, and rebuild its digest.
12. Construct exactly one deep-frozen union payload, then independently rebuild
    its result digest, with `side_effects_performed:false`.

It receives no clock and uses no mutable global state, cache, store, map, weak
collection, random source, locale, environment, filesystem, process, network,
provider, database, queue, client, execution system, transport, or broker.

## Required focused matrix

- all four union variants and every one-hot payload combination;
- missing/unknown/wrong-type fields and deterministic first-error paths;
- invalid variants proving unavailable provenance fields do not exist;
- all seven exact successful rule mappings and output nullability;
- open/partially-closed eligibility and exit-pending/closed noneligibility;
- long/short favorable, equal, and unfavorable deltas;
- checked subtraction/product overflow and unrepresentable partial quantity;
- all four target-nullability combinations and side-aware ordering;
- policy clone/field/selector/factory/callback rejection and digest rebuild;
- policy frame alternate-name/reordered-raw/altered-projection rejection;
- provenance changes for recommendation UUID/version, policy,
  position/observation/market-data, and request substitution;
- all four decision-digest vectors plus omitted-null, reordered-raw, altered
  provenance and altered discriminator negatives;
- request freshness maximum−1/exact/+1 ns, future evidence, delayed replay, and
  cross-request/observation/position/version/instrument substitution;
- exact duplicate, fresh-process and UTC/Stockholm/New York byte equality;
- getter/proxy/callback/symbol/cycle/post-capture mutation rejection;
- independent result and decision digest rebuilding;
- source/runtime export and capability inventories.

Queue, attempt, cancellation, terminal, recommendation transaction, monitor,
and client contracts are not implementation scope. Tests may reference their
names only to prove imports, exports, and effects are absent.

## Explicit exclusions and authorization gate

The slice must not add routes, authentication, Supabase clients, SQL,
migrations, schemas, generated types, persistence writers, market-data reads,
queues, workers, clocks, timers, schedules, clients, Actions 650/652/653/654
changes, execution authority, readiness, dispatch, transport, broker, Avanza,
order, trade, fill, credentials, browser/CDP, network, build, deployment, or
production configuration.

A separate independent Action must verify closure of 655A.5-M1/M2/M3,
continued closure of all original M1–M5 findings, exact five-path preservation
bytes, dependency gates,
Action 654 parity, and capability exclusion before it may authorize an isolated
local implementation checkpoint. Even that review cannot authorize delivery or
runtime integration.

## Action 655D successor constraint after rejected Action 655B

Action 655C rejected commit `08e593a58fc18473d6a6212c10f72cae8b7587ce`.
No implementation authority survives that review. A future local remediation is
limited to the same five paths listed above and must use the independently
reviewed `action_655d_exit_evaluator_remediation_contract_v1` overlay as its
design authority.

The remediation must, without adding any sixth path:

1. enforce exact JSON primitive types without string coercion;
2. implement priority 6 solely from the checked favorable/risk comparison,
   including current-stop-equals-entry cases;
3. use the frozen unsigned UTF-8 byte comparator for canonical object keys and
   deterministic first errors;
4. measure the raw primitive input serialization at exactly 65,536 lossless
   UTF-8 bytes before parsing, reject literal or parsed escaped lone surrogates
   without replacement, and return the frozen oversized invalid result;
5. replace the shared/duplicated fixture canonicalizer with a genuinely
   independent test-only oracle and literal expected bytes/digests;
6. add direct probes which fail against rejected 655B and cover all four major
   findings plus the fixture-independence finding;
7. preserve every prior result/digest, dependency, capability, Action 654 byte,
   and export-allowlist closure not explicitly superseded by Action 655D.

The exact ASCII budget-vector field lengths for
`monitor_observation.market_data_contract_version` are 63,208/63,209/63,210
bytes, producing complete raw inputs of 65,535/65,536/65,537 bytes. Exact BMP
and supplementary boundary constructions and hashes are in the manifest.

The future remediation requires a new commit, tree, five-path digest,
implementation digest, preservation ref, and separate independent source review.
It remains non-deliverable. This Action grants no implementation remediation,
branch, PR, merge, runtime integration, persistence, provider, roadmap,
database, broker, or production authority.

## Action 655D.2 superseding implementation constraint

The future operation's invalid reason is one of exactly seven case-sensitive
strings, now including `input_budget_exceeded`. That value is valid only for a
lossless raw UTF-8 count greater than 65,536 after raw scalar validation; it is
not a generic malformed-input reason.

Before any identity, digest, private policy, provenance, or evaluator work, the
successor must implement the manifest's exact stages: primitive type; raw scalar
scan and checked UTF-8 count; budget; forbidden initial BOM; strict RFC 8259
tokenization; single-root/trailing rejection; decoded scalar and NFC rejection;
duplicate-key rejection before object materialization; canonical raw byte
equality; schema/type; value domains. It must retain duplicate key occurrences
and cannot rely on `JSON.parse` last-write-wins behavior.

The focused suite must consume the literal malformed, BOM, duplicate, trailing,
normalization, surrogate, combining-boundary, compound-precedence, enum-negative,
decision-digest, and result-digest vectors frozen by Action 655D.2. The oracle
remains structurally independent of production. Action 655D.2 is pending a
separate independent rereview and grants no current implementation authority.

## Action 655D.4 superseding boundary and number-token constraint

The sole current design overlay is
`action_655d4_utf8_negative_zero_closure_v1`.

The future public evaluator accepts only one primitive ECMAScript string.
`Buffer`, `Uint8Array`, `ArrayBuffer`, arrays, boxed strings, proxies, and all
other objects are stage-1 `schema_invalid` inputs and their contents are never
read. A primitive string containing an unpaired UTF-16 surrogate is stage-2
`canonical_form_invalid`.

Malformed UTF-8 bytes are not evaluator inputs. Any future external-byte
adapter must strictly decode before calling the evaluator. A malformed stream
is rejected as
`action_655d4_strict_UTF8_boundary_rejection_v1` with
`outcome:rejected_before_evaluator`, `reason:malformed_utf8`, evaluator not
invoked, replacement false, all decision/result/provenance digests null, and no
side effects or input-binding claim. No byte adapter or route is authorized by
this design.

The tokenizer must retain every number lexeme through canonical stage 9. It
must not use JavaScript `Number`, floating point, or default `JSON.stringify`
as canonical authority. Canonical integer spellings are only `0` or an optional
minus followed by a nonzero digit and further digits. Fractions and exponents
are noncanonical. Every mathematical negative-zero spelling canonicalizes to
`0`, so `-0`, `-0.0`, `-0e0`, and `-0E+0` fail stage 9 at the number's exact
JSON Pointer before schema, numeric-domain, identity, or rule work.

Canonical integer lexemes remain exact decimal text until stage-11 range and
safe-integer checks. Unsafe and out-of-range values are never rounded. The
manifest's byte, Unicode, number-token, pointer-digest, and compound-precedence
vectors are mandatory literal expectations for any future implementation.

Action 655D.4 is design-only and pending separate independent rereview. It
grants no implementation remediation, branch, PR, delivery, runtime wiring,
route, queue, database, migration, dependency, lockfile, broker, credential,
provider, roadmap-completion, or production authority.
