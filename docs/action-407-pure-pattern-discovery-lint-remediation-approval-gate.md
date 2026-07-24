# Action 407 - Pure Pattern Discovery Lint Remediation Approval Gate

## Purpose

Freeze exactly how the existing Action 404 `no-explicit-any` lint debt may be remediated without changing pure Pattern Discovery behavior, public API, validation ordering, aggregation, canonicalization, hashes, or downstream Action 406 hash-freeze expectations.

## Scope

This is a static, local-only, read-only approval gate. It inventories the current lint errors and approves only narrow type-safe remediation for a later Action 408. It does not modify `lib/pure-pattern-discovery.ts`, tests, ESLint configuration, TypeScript configuration, runtime routes, replay, persistence, providers, Supabase, ranking, scanner, recommendations, or runtime preview.

## Authoritative Dependencies

- Action 309 post-recovery safe development protocol.
- Action 402 pure Pattern Discovery contract.
- Action 403 implementation approval gate.
- Action 404 pure Pattern Discovery implementation.
- Action 405 independent implementation audit.
- Action 406 mapped-only hash freeze and shadow approval gate.

## Action 404 Implementation State

`lib/pure-pattern-discovery.ts` remains the approved pure implementation with runtime export `discoverPatterns` and seven type exports. Its SHA-256 is `48b7667c8690a1d8d56b819a3727e37ea73af7710a45131eb3debab48627191c`.

## Action 405 Audit State

Action 405 returned `ready_with_conditions` with 17 passed, 0 failed, and 1 unresolved condition. Its remaining condition was to freeze Action 400 reconstructed-row, evidence, and group hashes before downstream shadow execution.

## Action 406 Hash-Freeze State

Action 406 returned `approved_with_conditions`. It froze the ten mapped-only rows, duplicate inventory, group key, evidence-set hash, group hash, and expected result hash. Its remaining condition is repository lint blocked by pre-existing Action 404 `no-explicit-any` debt.

## Exact Current Implementation Hash

- `lib/pure-pattern-discovery.ts`: `48b7667c8690a1d8d56b819a3727e37ea73af7710a45131eb3debab48627191c`

The implementation hash must remain unchanged during Action 407.

## Exact Lint Failure Summary

Current `npm run lint` reports six `@typescript-eslint/no-explicit-any` errors attributable to the Action 404 regression suite:

- `tests/e2e/action-404-pure-pattern-discovery-implementation.spec.ts:37:33`
- `tests/e2e/action-404-pure-pattern-discovery-implementation.spec.ts:57:66`
- `tests/e2e/action-404-pure-pattern-discovery-implementation.spec.ts:57:140`
- `tests/e2e/action-404-pure-pattern-discovery-implementation.spec.ts:81:38`
- `tests/e2e/action-404-pure-pattern-discovery-implementation.spec.ts:96:51`
- `tests/e2e/action-404-pure-pattern-discovery-implementation.spec.ts:109:147`

`lib/pure-pattern-discovery.ts` currently has zero explicit `any` occurrences. Action 408 must preserve that.

## Explicit No-Explicit-Any Error Inventory

| Location | Current construct | Classification | Approved replacement | Public API affected | Behavioral impact |
| --- | --- | --- | --- | --- | --- |
| `tests/e2e/action-404-pure-pattern-discovery-implementation.spec.ts:37:33` | `clone(fixture) as any` | `mutable_fixture_clone` | private mutable test-row structural type based on Action335LearningDatasetRow | no | none |
| `tests/e2e/action-404-pure-pattern-discovery-implementation.spec.ts:57:66` | `apply: (row: any) => void` | `mutator_callback_parameter` | private mutable learning-row structural type | no | none |
| `tests/e2e/action-404-pure-pattern-discovery-implementation.spec.ts:57:140` | `clone(value) as any` | `mutable_envelope_clone` | private mutable envelope test type | no | none |
| `tests/e2e/action-404-pure-pattern-discovery-implementation.spec.ts:81:38` | `clone(config) as any` | `invalid_configuration_fixture_mutation` | private mutable partial configuration type or narrowed Record<string, unknown> | no | none |
| `tests/e2e/action-404-pure-pattern-discovery-implementation.spec.ts:96:51` | `clone(envelope("changed")) as any` | `invalid_lineage_fixture_mutation` | private mutable envelope test type | no | none |
| `tests/e2e/action-404-pure-pattern-discovery-implementation.spec.ts:109:147` | `clone(envelope(...)) as any` | `invalid_numeric_fixture_mutation` | private mutable envelope test type | no | none |

## File And Line Inventory

The Action 408 remediation boundary is limited to the Action 404 test file unless a later verifier proves a corresponding private type helper must live next to that test. No production module edits are approved by this gate.

## Current Construct Classification

The current explicit `any` uses are test-local mutation conveniences for intentionally malformed fixtures. They are not part of the runtime implementation, public API, exported type surface, or production behavior.

## Approved Replacement Strategy Per Error

Use private test-local structural types for mutable fixture construction. Prefer existing authoritative types first, then private mutable variants with only the fields touched by tests. Invalid-shape tests may use `Record<string, unknown>` after explicit narrowing.

## Unknown Versus Generic Versus Narrow Structural Type Policy

External or deliberately invalid inputs should begin as `unknown`. Mutable valid fixtures should use narrow structural types. Generics are allowed only for pure clone helpers where the generic preserves the input type and does not bypass validation.

## Type-Guard Policy

Any unknown value must be narrowed with object, array, primitive, and own-property checks before property access. No prototype-dependent access, coercion, mutation of unknown input, or broad assertion bypass is approved.

Action 408 must use an explicit object check, explicit array check, own-property inspection, explicit primitive checks, no coercion, and no mutation before accessing unknown input.

## Indexed-Access Policy

Indexed access must be against known readonly key unions or narrowed records. Enumeration semantics, key sorting, symbol exclusion, and inherited-property exclusion must remain unchanged.

## JSON-Like Input Validation Policy

Invalid arrays, nulls, primitives, malformed objects, missing keys, and prototype-bearing objects must continue to produce the same statuses and issue paths. The remediation may not introduce coercion or defaulting.

## Canonicalization Helper Typing Policy

If canonical serialization typing is touched, use a private non-exported recursive JSON/canonical value type that preserves current runtime support: null, boolean, string, number, bigint where currently supported, readonly arrays, and readonly records. Undefined and unsupported values must remain rejected.

## Error-Catch Typing Policy

Catch values must be `unknown`. Narrow with `instanceof Error` or safe structural checks if needed. Do not expose dynamic error text, rejected values, or stack traces in Pattern Discovery issues.

## No-Runtime-Change Requirement

Action 408 may only change types and test-local helper typing. Runtime behavior must remain byte-for-byte equivalent at the output level.

## No-Export-Change Requirement

No new exported runtime functions or exported helper types are approved. The module path and public export inventory must remain exact.

## No-Signature-Change Requirement

`discoverPatterns` must keep its current call signature and synchronous return behavior.

## No-Result-Change Requirement

All statuses, issue codes, warning codes, result shape, insight shape, and no-effect flags must remain unchanged.

## No-Hash-Change Requirement

The source-module hash may change only if Action 408 actually edits `lib/pure-pattern-discovery.ts`, which this gate does not approve. Semantic/output hashes must not change. Action 406 hashes must remain:

- Evidence-set: `f1f0053264c85d640d46b61da0ce7120e491309e3070132fe74a69a68438cbd8`
- Group: `aa2ae3f39146ce1c6fc1f6ed73e19e96b02b7866b34e75b61c471a8277a1122e`
- Expected result: `e911709a784159c684a350de490fd56446ee23c23b3bf5ea2fbb70378ebf253c`

## No-Ordering-Change Requirement

Validation phases, issue ordering, warning ordering, lexical key ordering, group ordering, and input-order determinism must remain unchanged.

## No-Mutation-Change Requirement

Input immutability and repeated/interleaved determinism must remain unchanged.

## No-Performance-Driven Rewrite

No performance rewrite, refactor, or simplification is approved. Action 408 must be a targeted lint remediation.

## Implementation Boundary

Approved Action 408 files:

- `tests/e2e/action-404-pure-pattern-discovery-implementation.spec.ts`
- `docs/action-408-pure-pattern-discovery-lint-remediation.md`
- `scripts/action-408-pure-pattern-discovery-lint-remediation-verify.mjs`
- `tests/e2e/action-408-pure-pattern-discovery-lint-remediation.spec.ts`
- narrowly required Action 404-407 compatibility updates
- minimal Actions 318-320 guard updates

Not approved: production modules, runners, manifests, downstream shadow execution, runtime integration, persistence, replay, provider access, Supabase access, feedback integration, ESLint config changes, TypeScript config changes, suppressions, or broad unsafe assertions.

The remediation may not add `eslint-disable`, file-level lint suppression, `ts-ignore`, `ts-expect-error`, ESLint rule weakening, TypeScript rule weakening, or broad assertion bypasses.

## Regression Requirements

Action 408 must run and preserve Action 404, Action 405, and Action 406 suites and verifiers. It must add focused tests for unknown boundary narrowing, invalid arrays/objects/null/primitives, prototype-bearing objects, canonical recursive structures, BigInt serialization, deterministic object-key ordering, invalid canonical values, unchanged validation precedence, unchanged issue/warning output, unchanged representative hashes, unchanged Action 406 hashes, immutability, and repeated/interleaved determinism.

It must preserve all nine statuses, the 14-phase validation order, duplicate warnings, BigInt summation, four-decimal rounding, minimum thresholds 20/20, and canonical row hashes.

## Hash-Regression Requirements

Action 408 must prove unchanged representative Action 404/405 hashes and unchanged Action 406 constants: evidence-set `f1f0053264c85d640d46b61da0ce7120e491309e3070132fe74a69a68438cbd8`, group `aa2ae3f39146ce1c6fc1f6ed73e19e96b02b7866b34e75b61c471a8277a1122e`, expected result `e911709a784159c684a350de490fd56446ee23c23b3bf5ea2fbb70378ebf253c`.

## Lint Acceptance Requirements

Action 408 succeeds only if `npm run lint` has zero errors, no `any` remains in the Action 404 test file or pure module, no suppression comment is added, ESLint config is unchanged, TypeScript config is unchanged, and no new Action 408 warnings are introduced.

## Independent Post-Remediation Audit Requirement

Action 409 is mandatory after Action 408. It must not modify `lib/pure-pattern-discovery.ts`; it must independently verify behavior, Action 406 hashes, lint pass status, and absence of hidden lint bypasses before any mapped-only Pattern Discovery shadow execution is approved.

## Approval Vocabulary

Allowed decisions are exactly `approved`, `approved_with_conditions`, and `blocked`.

## Deterministic Gate Conditions

The gate passes only if the current lint inventory is exact, replacement strategies are narrow and type-safe, public API preservation is frozen, hash and behavior invariants are frozen, Action 408 is separately bounded, and Action 409 remains mandatory.

## Approval Decision

`approved`

All lint errors are inventoried, all replacements can be narrow and type-safe, no public API change is required, no semantic change is required, canonical serialization can remain byte-identical, hash outputs can remain identical, lint can pass without suppressions, the implementation boundary is narrow, and Action 409 is mandatory.

## Passed Conditions

- Six Action 404 `no-explicit-any` lint errors inventoried.
- `lib/pure-pattern-discovery.ts` explicit-any count is zero.
- Pure implementation hash remains unchanged.
- Action 406 downstream hashes remain frozen.
- Runtime preview remains paused.
- No remediation was performed.

## Failed Conditions

None.

## Unresolved Conditions

Action 408 must perform the approved targeted remediation and prove `npm run lint` passes. Action 409 must independently audit the post-remediation result before shadow execution.

## Next Permitted Action

`action_408_pure_pattern_discovery_lint_remediation`
