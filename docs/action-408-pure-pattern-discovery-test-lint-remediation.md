# Action 408 - Pure Pattern Discovery Test Lint Remediation

## Purpose

Remove the six Action 404 regression-suite `@typescript-eslint/no-explicit-any` errors approved by Action 407 without changing production Pattern Discovery behavior, public API, hashes, assertions, or fixture semantics.

## Scope

This is a test-only lint remediation. It changes `tests/e2e/action-404-pure-pattern-discovery-implementation.spec.ts` and adds Action 408 documentation, verifier, and focused tests. It does not modify `lib/pure-pattern-discovery.ts`, production modules, fixtures, runtime routes, proxy, middleware, schemas, migrations, provider access, Supabase access, replay, persistence, ranking, scanner, recommendations, or runtime preview.

## Action 407 Approval

Action 407 approved remediation of exactly six explicit-any usages in the Action 404 test file. It did not approve implementation changes, suppressions, config weakening, runners, manifests, or shadow execution.

## Exact Six Remediated Locations

| Original location | Original construct category | Replacement strategy |
| --- | --- | --- |
| `37:33` | mutable fixture clone | `Mutable<Action335LearningDatasetRow>` private test-local structural type |
| `57:66` | mutator callback parameter | `(row: MutableLearningDatasetRow) => void` |
| `57:140` | mutable envelope clone | `MutablePatternDiscoveryRowEnvelope` private test-local structural type |
| `81:38` | invalid configuration fixture mutation | `Record<string, unknown>` malformed boundary plus `as never` call-site preservation |
| `96:51` | invalid lineage fixture mutation | `MutablePatternDiscoveryRowEnvelope` private test-local structural type |
| `109:147` | invalid numeric fixture mutation | `MutablePatternDiscoveryRowEnvelope` private test-local structural type |

## Replacement Type Strategy

The remediation uses an imported authoritative row type, a private recursive `Mutable<T>` helper, `MutableLearningDatasetRow`, and `MutablePatternDiscoveryRowEnvelope`. The intentionally malformed configuration remains a `Record<string, unknown>` and is passed as `never` only at the invalid-input call boundary.

## Malformed-Input Preservation

The invalid runtime values are preserved:

- missing `numeric_scale` configuration
- changed row identity ticker with stale canonical hash
- `failed` and `unknown` anti-leakage values
- invalid `setup_family`
- incomplete outcome availability
- non-finite and unscalable numeric metrics

Malformed literal mutations use `Object.assign` so TypeScript does not coerce them into valid production literals.

## Assertion Preservation

No assertions were removed, skipped, merged, weakened, or converted to truthiness-only assertions. Expected statuses, issue codes, warning codes, grouping, support counts, aggregation values, hashes, immutability checks, and determinism checks remain intact.

## Test-Count Preservation

The Action 404 regression suite remains 15 tests with the same test names and order.

## Production-Source Immutability

`lib/pure-pattern-discovery.ts` remains unchanged with SHA-256:

`48b7667c8690a1d8d56b819a3727e37ea73af7710a45131eb3debab48627191c`

## Public-API Immutability

The pure module still exports runtime `discoverPatterns` and exactly seven type exports:

- `PatternDiscoveryRowEnvelope`
- `FrozenPatternDiscoveryConfiguration`
- `PatternDiscoveryResult`
- `PatternDiscoveryIssue`
- `PatternDiscoveryWarning`
- `PatternDiscoveryGroupResult`
- `PatternDiscoveryEvidenceSummary`

## Semantic-Hash Preservation

Action 406 hashes remain unchanged:

- Evidence-set: `f1f0053264c85d640d46b61da0ce7120e491309e3070132fe74a69a68438cbd8`
- Group: `aa2ae3f39146ce1c6fc1f6ed73e19e96b02b7866b34e75b61c471a8277a1122e`
- Expected result: `e911709a784159c684a350de490fd56446ee23c23b3bf5ea2fbb70378ebf253c`

## No-Suppression Guarantee

No `eslint-disable`, `ts-ignore`, `ts-expect-error`, explicit `any`, ESLint configuration change, or TypeScript configuration change was added.

## Lint Result

Action 408 requires `npm run lint` to pass with zero errors. Existing unrelated warnings are acceptable only if the command exits successfully under the repository lint policy.

## Regression Results

Required regression coverage:

- Action 404 regression suite
- Action 405 independent suite and verifier
- Action 406 hash-freeze suite and verifier
- Action 407 approval verifier
- Action 408 focused suite and verifier

## Runtime-Preview Paused State

Runtime preview remains `runtime_preview_waiting_for_operator_inputs`.

## Mandatory Action 409 Independent Audit

Action 409 remains mandatory after this remediation. It must independently verify the post-lint behavior and hashes before any mapped-only Pattern Discovery shadow execution is approved.
