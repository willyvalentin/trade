# Action 655G — Deterministic First-Error Traversal Remediation Contract

Status: isolated, default-off evaluator checkpoint. Action 666DF is the only
successor change: it reconciles the evaluator's position
`recommendation_identity` predicate with the already-canonical Action 664A
identity grammar. It grants no branch, pull-request, delivery, merge,
runtime-integration, persistence, execution, provider, broker, database,
roadmap-completion, or production authority.

## Frozen authority and scope

The unchanged normative contract authority is Action 655D.4 preservation commit `1ea4c7f2d179b17238eab73d3d8b08e0a2c63698`, tree `450f259b2241556d2970d1c1e8e9f2fbc73a40d8`, and five-artifact digest `a494df1633689e5cffa3044437cc925bd770741ce80e6e3c81cbd42c3bf00bb7`. This successor is based directly on Action 655E preservation commit `9e3120b47e06d0dec0dd4ae286a05c72da633b71`, tree `8eadfb9e90fa7435919936a287832c8503a77eb5`, and five-artifact digest `47bcefa5e4ee35f5245db278d3bf9148eaf792f82d51eb29307b71b47fa2c346`. Action 655F findings `655F-M1` and `655F-M2` are historical negative evidence and contribute no authority.

Exactly five files constitute Action 655G: the evaluator, independent synthetic fixtures, focused/adversarial tests, this contract, and the golden report. All Action 654 and Action 655D.4 bytes remain unchanged. Action 654U remains the sole delivered readiness runtime authority; Action 654V and all Action 655 review artifacts are evidence only.

## Action 666DF canonical recommendation-identity reconciliation

The former hash-suffix-only predicate
`rec_decision:v1:<64 lowercase hexadecimal characters>` is not accepted. At
stage 11, `position_snapshot.recommendation_identity` must instead be exactly
the Action 664A `canonical_recommendation_identity_v1` output:

```text
rec_decision:v1:<encoded source namespace>:<encoded decision id>:<decision epoch milliseconds>
```

The evaluator decodes the two encoded components, requires a canonical source
namespace and canonical NFC decision ID, requires a safe exact epoch integer
that reconstructs to a valid UTC ISO instant, then reconstructs the five
segments with `encodeURIComponent` and the canonical epoch. A permitted
four-digit Action 664A input whose offset crosses a UTC year boundary may
canonically reconstruct with an extended UTC year. The epoch must nevertheless
fall within the exact Action 664A-emittable interval
`-62167305540000` through `253402387140000`, inclusive; the upper endpoint
comes from Action 664A's permitted terminal `24:00:00.000` local time. The
rebuilt text must equal the supplied text byte-for-byte. Thus unescaped separators,
lowercase or malformed percent escapes, noncanonical whitespace/control text,
leading-zero epoch values, out-of-range dates and all legacy hash-suffix
values fail at `/position_snapshot/recommendation_identity` before identity or
policy work. The reconciliation does not infer a decision from a ticker,
position, current time, hash, client value or database row.

## Public operation boundary

The module has exactly one runtime value export:

```ts
evaluateAction655bCanonicalExitDecision(
  canonicalInputJson: unknown,
  localEvaluationEnabled?: unknown,
): Action655bCanonicalExitDecisionResult
```

The first argument must be one primitive ECMAScript string. Before any property read, reflection, enumeration, coercion, parsing, hashing, or policy work, every other value is rejected at `/`. This includes arrays, ordinary objects, functions, proxies, boxed strings, `Buffer`, typed arrays, `ArrayBuffer`, and `DataView`; their contents and traps are never observed. The optional boolean gate is local, private-policy-independent, defaults off, and cannot choose or mint authority.

Malformed external UTF-8 is not an evaluator input. A future byte adapter must use strict fatal decoding and return the bounded `action_655d4_strict_UTF8_boundary_rejection_v1` non-evaluator record on failure. This checkpoint adds no adapter or runtime entry point.

## Total raw-input pipeline

The evaluator performs the frozen fourteen stages in order:

1. primitive-string type;
2. one complete UTF-16 scalar scan with a nonallocating lossless UTF-8 counter saturated at 65,537;
3. a 65,536-byte raw-input limit;
4. initial BOM rejection;
5. strict RFC 8259 tokenization without `JSON.parse`, recovery, extensions, or object materialization;
6. exact document end, so every trailing code unit including whitespace is rejected;
7. decoded scalar and NFC validation in source-token order without normalization;
8. second-occurrence duplicate-key rejection before materialization;
9. source-order number-lexeme validation, then unsigned UTF-8 key ordering, minimal escaping, and exact raw equality;
10. closed schemas, required fields, nullability, versions, and exact JSON primitive categories without coercion;
11. UUID, enum, digest, instant, exact integer, safe/range, tick/lot, geometry, and target domains;
12. position, observation, request, and input identity/digest rebuilding;
13. private-policy integrity and provenance;
14. eligibility, freshness, checked arithmetic, and priorities 1–7.

Raw lone surrogates fail stage 2 even after the byte counter saturates. Valid-scalar 65,537-byte inputs fail stage 3 before BOM, parse, NFC, digest, capsule, policy, or rule work. Escaped lone or reversed surrogates fail stage 5. Decoded strings must already be NFC. Duplicate comparison is over exact decoded keys, and RFC 6901 escaping determines error pointers.

Stages 10 and 11 use private, explicit, frozen manifests. At stage 10 the root contract version is required, typed, and checked first. The position field is then required and traversed completely in its manifest order, starting with its contract version, before the later monitor sibling is examined. The monitor is traversed completely before the three later root scalars. Missing fields and exact JSON types are checked at their manifest position; unknown fields are selected only after all required fields at that object depth and use canonical unsigned UTF-8 order. Object insertion order, `Object.keys` enumeration order, and generic recursive traversal never select a failure.

Stage 11 repeats the same explicit depth-first value-domain order: every position field, including `price_scale` and `quantity_scale`, precedes every monitor field, including `position_version`; the three root value domains follow the monitor. Raw integer tokens remain exact until all manifest-ordered numeric checks finish. Only then are safe host numbers materialized for the pre-existing digest and decision pipeline.

Canonical object keys compare their unsigned UTF-8 bytes, byte by byte, with shorter-prefix-first ordering. Locale, normalization during sorting, code-point ordering, and JavaScript UTF-16 `.sort()` are forbidden. U+E000 therefore precedes U+10000 at root, nested, and repeated-prefix boundaries.

## Exact number tokens

The tokenizer retains every number lexeme and its exact pointer through stage 9. It never materializes a host number first. Canonical integer spellings are only `0` and optional-minus nonzero decimal integers without leading zeroes. Fractions and exponents are syntactically valid but noncanonical.

Every negative-zero coefficient, including `-0`, `-0.0`, `-0e0`, and `-0E+0`, canonicalizes mathematically to `0` and is rejected at its exact pointer before whole-document comparison, schema, numeric-domain, identity, or rules. Canonical decimal text continues to stage 11, where exact `BigInt` arithmetic enforces positivity, safe-integer, and declared ranges. Thus `9007199254740992` reaches `numeric_domain_invalid` without rounding.

Trailing data wins before duplicate detection; duplicate detection wins before negative-zero canonicalization; otherwise the first number token in source order wins before root canonical comparison.

## Private policy and decisions

The sole private deep-frozen policy remains `server_primary_exit_policy` version 2 with identity `tm_exit_policy:v3:server_primary_exit_policy:2` and digest `746fb35346a353752cc01a38d76a2b6e5593b41f8e7e078d746ebfd221c496cf`. No registry, resolver, policy selector, factory, counter, or test hook is exported.

All exact integer-unit strings are bounded by `2^127-1`; intermediates are checked in an unsigned 256-bit domain. Profit protection is purely rule-derived: when the threshold is met it emits priority 6 and recommends the entry stop even when the observed current stop already equals entry. It does not infer idempotency from current stop state.

The result remains a deeply frozen, one-hot `decision`, `noneligible`, `invalid`, or `refused` union. The invalid enum is exactly `schema_invalid`, `missing_required_input`, `canonical_form_invalid`, `input_budget_exceeded`, `numeric_domain_invalid`, `unsupported_contract_version`, and `policy_registry_integrity_failure`. Invalid evidence has null provenance. All results have deterministic decision and result digests and `side_effects_performed:false`.

## Fixture independence and validation

Fixtures use a test-only reference canonicalizer based on Node byte buffers and literal frozen digest expectations. They import no production comparator, parser, canonicalizer, or private policy surface. The production implementation instead uses its own scalar-to-byte comparator and strict tokenizer. The test oracle and production path therefore share neither code nor helper state.

The fixture owns a literal, independently frozen stage-10/stage-11 pointer matrix and imports no production validator or manifest. The focused suite covers the original positive/replay/freshness/digest matrix plus the four exact Action 655F oracle cases, direct execution of those cases against preserved Action 655E bytes, stage-10 and stage-11 pairwise/triple-invalid matrices, non-string and hook attacks, raw and escaped surrogate matrices, malformed strict UTF-8 boundary vectors, 65,535/65,536/65,537 byte vectors, BOM precedence, malformed/trailing/NFC/duplicate order, negative-zero pointers, unsafe integers, exact JSON type substitution, unsigned UTF-8 key order, and stop-at-entry behavior. Action 654 parity is asserted for all 48 delivered paths.

## Capability and dependency gates

This evaluator is pure, deterministic, default-off, side-effect-free, and non-persistent. It adds no route, monitor adapter, queue, database, migration, client integration, execution or readiness authority, transport, network, filesystem, process, timer, credential, browser/CDP, order, submission, fill, trade mutation, or production write.

Action 650 execution authority, Action 652 risk authority, Tracks 2 and 3, persistence design/migrations, database ownership, monitor/queue workflows, recommendation-to-position transaction, client projection, and roadmap provenance/reachability remain unresolved. `full_execution_regression_passed:false` remains mandatory. A separate independent source review is required before any further authorization.
