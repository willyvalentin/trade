# Action 393 - Pure Mapper Literal-Normalization Bypass Remediation Approval Gate

## Purpose and scope

Action 393 freezes the exact remediation permitted for the three literal-normalization bypasses found by Action 392. This is a deterministic, static, local-only approval gate. It does not modify the mapper, fixtures, consumers, runtime, persistence, replay, scanner, ranking, confidence, Pattern Discovery, schemas, migrations, or runtime-preview chain.

Authoritative dependencies and upstream Actions: Actions 309, 335, 336, 352, 380, 381, 387, 388, 389, 390, 391, and 392. Action 390 established the first narrow mapper remediation boundary that this gate preserves.

Action 392 returned `readiness_decision: blocked`, `passed_conditions_count: 20`, `failed_conditions_count: 3`, and `unresolved_conditions_count: 0`. All seven Action 389 findings were closed, but three normalization bypasses remained.

## Three bypass findings and classifications

| Finding | Classification |
| --- | --- |
| Context state ` present ` is trimmed and accepted | `unauthorized_whitespace_normalization` |
| Freshness state ` fresh ` is trimmed and accepted | `unauthorized_whitespace_normalization` |
| Payload horizon `60M` is lowercased and accepted | `unauthorized_case_normalization` |
| Payload horizon ` 60m ` is trimmed and accepted | `unauthorized_whitespace_normalization` |

The horizon finding has two applicable classifications because both case folding and whitespace trimming bypass exact literal validation. No alias-normalization or output-schema expansion is required.

## Root cause and remediation vocabulary

The root cause is reuse of permissive text normalization before closed-literal validation. The approved remediation vocabulary is inspect, compare exactly, reject, preserve, and block. Repair, trim, lowercase, uppercase, case-fold, substitute, infer, rewrite units, coerce, or fall back to unknown are not approved for these fields.

## Permitted mapper surface

Action 394 may change only:

- `lib/snapshot-to-learning-dataset-mapper.ts`
- `docs/action-394-pure-mapper-literal-normalization-remediation.md`
- `scripts/action-394-pure-mapper-literal-normalization-remediation-verify.mjs`
- `tests/e2e/action-394-pure-mapper-literal-normalization-remediation.spec.ts`
- narrowly required compatibility updates to Actions 391-393 verifiers/tests
- minimal Actions 318-320 guard classifications

The mapper change is limited to exact literal readers/validators for context-state, freshness-state, and payload/outcome horizons, plus deterministic status selection for unsupported horizon literals versus valid horizon conflicts.

Forbidden surfaces: fixtures, new production modules, adapters, consumers, batch mapping, shadow runners, replay, runtime routes, provider/news access, Supabase, persistence, schemas/migrations, proxy, middleware, Netlify configuration, scanner, recommendation generation, ranking, confidence, Pattern Discovery, deployment artifacts, and runtime-preview files.

## Exact-literal policy

Contract-bearing closed categorical literals must match their authoritative source exactly unless Action 387 explicitly froze an equivalence for that field.

Exact matching means:

- no leading or trailing whitespace
- no internal whitespace normalization
- no case folding, lowercase conversion, or uppercase conversion
- no locale-dependent transformation
- no synonym substitution
- no fallback to `unknown`
- no automatic repair

A value differing only by whitespace, casing, padding, or alternate unit notation is invalid unless the exact alternate representation is listed in its authoritative contract.

## Whitespace policy

Whitespace is significant for context-state, freshness-state, and horizon literals. The future validator must inspect the raw string, not a trimmed derivative. ASCII spaces, tabs, newlines, carriage returns, non-breaking spaces, other Unicode space padding, internal duplicated spaces, empty strings, and whitespace-only strings do not match an authoritative literal.

No trim may occur before validation. A valid exact literal may be passed onward unchanged after validation; an invalid padded literal must block and must never become `unknown` or a canonical literal.

## Case-sensitivity policy

Context states, freshness states, and horizons are case-sensitive. `present`, `fresh`, and `60m` are distinct from `Present`, `FRESH`, `60M`, mixed-case forms, and locale-specific case variants. No lowercase, uppercase, or locale case folding is permitted before comparison.

## Unicode normalization policy

Semantic literal validation must compare the raw JavaScript string to the ASCII authoritative literal. NFC, NFD, NFKC, NFKD, Unicode whitespace folding, and confusable-character replacement are forbidden before semantic validation.

NFC normalization remains permitted only after semantic validation for deterministic row-identity components, as frozen by Action 387. Percent encoding remains permitted only for row-identity serialization. These operations cannot make an invalid semantic literal valid.

## Representation-safe versus semantic normalization

Representation-safe normalization preserves already validated meaning:

- NFC normalization of deterministic row-identity components
- percent encoding of row-identity serialization
- frozen timestamp parsing/ISO serialization for timestamp aliases

Semantic normalization changes how an input is interpreted:

- trimming or whitespace folding
- case conversion or case folding
- synonym/alias substitution
- duration or unit rewriting
- fallback to unknown

Semantic normalization is forbidden for context state, freshness, and horizons.

Previously approved semantic equivalences remain narrowly preserved and do not transfer to other fields:

- Side: `long` equals `buy`; `short` equals `sell`.
- Confidence: `[0,1]` normalized units and `(1,100]` percentage conversion.

Action 394 must not alter setup/timestamp alias precedence or any other Action 387 behavior outside the three approved findings.

## Context-state policy

The authoritative Action 380/381 context-state literals are exactly:

- `present`
- `explicit_null`
- `unavailable`
- `unknown`

Only exact raw matches pass. These must block: ` present `, `Present`, `PRESENT`, `present `, ` present`, tab/newline/carriage-return padding, non-breaking-space padding, mixed case, internal duplicated spaces, empty string, whitespace-only string, synonyms, and free-form values.

Unsupported context-state literals return `blocked_invalid_provenance` with `invalid_provenance`, error severity, and the exact state path such as `/contextSnapshot/context/market/market_regime/state`. No new status or issue code is approved.

## Freshness-literal policy

The authoritative freshness literals are exactly:

- `fresh`
- `stale`
- `unknown`
- `unavailable`

Only exact raw matches pass. Padded forms, title/upper/mixed case, empty/whitespace-only values, and synonyms such as `current`, `old`, or `missing` block. No trim, case conversion, synonym mapping, or fallback is allowed.

Unsupported freshness returns `blocked_invalid_provenance` with `invalid_provenance`, error severity, and `/contextSnapshot/freshness/state`. Existing valid freshness consistency rules remain unchanged.

## Horizon-literal policy

The authoritative mapper/learning horizon literals are exactly:

- `15m`
- `30m`
- `60m`

There are no case, whitespace, numeric, duration, unit, or synonym equivalences. These are invalid: `60M`, ` 60m `, `60m `, ` 60m`, `060m`, `60 min`, `1h`, numeric `60`, ISO duration values, tabs/newlines, empty strings, and whitespace-only values.

Payload and outcome horizons must be validated independently as raw values before semantic linkage comparison:

- Unsupported payload horizon: `blocked_invalid_input`, `invalid_input`, `/recommendationSnapshot/payload_json/outcome_horizon`.
- Unsupported outcome horizon: `blocked_invalid_outcome`, `invalid_outcome`, `/outcome/horizon`.
- Two individually valid but different horizons: `blocked_invalid_linkage`, `invalid_linkage`, with deterministic issues for `/recommendationSnapshot/payload_json/outcome_horizon` and `/outcome/horizon`.
- Two exact equal valid horizons: pass.
- Null outcome: existing pending semantics remain; a supported exact payload horizon is required.

No horizon is trimmed, case-folded, converted between minutes/hours, inferred from timestamps or holding duration, or rewritten before comparison.

## Alias-equivalence and canonicalization boundary

Only aliases/equivalences already frozen by Action 387 remain. Side and confidence equivalences remain; timestamp alias precedence and deterministic timestamp representation remain. They do not authorize trimming/case normalization for context state, freshness, or horizons.

The canonicalization boundary is after successful semantic validation. Row-ID NFC and percent encoding operate only on validated identity components. They cannot serve as a parser, validator, repair mechanism, or source of semantic equivalence.

## Validation-stage placement

The Action 387 order remains:

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

Horizon literal validity is a precondition within the linkage stage:

1. inspect raw payload and outcome horizon literals
2. unsupported payload literal returns `blocked_invalid_input`
3. unsupported outcome literal returns `blocked_invalid_outcome`
4. compare only individually valid literals
5. two valid differing literals return `blocked_invalid_linkage`

Context-state exactness and freshness exactness remain provenance-stage checks. Earlier identity, linkage-independent input shape, alias, temporal, and leakage failures retain their frozen precedence. Multi-fault results and issue ordering must remain deterministic.

## Result-status and issue-code compatibility

No result status or issue code is added. Both success statuses and all eight blocked statuses remain. Existing issue shape `{ code, path, severity, messageKey }`, RFC 6901 paths, error/warning severity, fixed message keys, deterministic ordering and deduplication, and redaction remain unchanged.

Issue mapping is frozen:

| Invalid condition | Status | Code | Path |
| --- | --- | --- | --- |
| Context state literal | `blocked_invalid_provenance` | `invalid_provenance` | exact `/contextSnapshot/context/.../state` |
| Freshness literal | `blocked_invalid_provenance` | `invalid_provenance` | `/contextSnapshot/freshness/state` |
| Payload horizon literal | `blocked_invalid_input` | `invalid_input` | `/recommendationSnapshot/payload_json/outcome_horizon` |
| Outcome horizon literal | `blocked_invalid_outcome` | `invalid_outcome` | `/outcome/horizon` |
| Valid horizon conflict | `blocked_invalid_linkage` | `invalid_linkage` | both populated horizon paths |

Rejected raw values never appear in issues or messages.

## Backwards compatibility and regression requirements

Action 394 must preserve:

- all 15 Action 381 valid contexts
- exact fresh/stale/unknown/unavailable behavior
- exact 15m/30m/60m behavior
- Action 388 original tests
- Action 391 remediation tests
- Action 392 valid-domain checks
- both success and all eight blocked statuses
- all 14 issue codes and exact issue shape
- side/confidence equivalences
- timestamp/setup alias precedence
- NFC and percent-encoded row identity
- missing-data distinctions, temporal validation, provenance, and anti-leakage monotonicity
- input immutability and deterministic output
- no consumers, runtime, or persistence

Invalid-variant tests must include ASCII and Unicode padding, tabs/newlines, empty strings, case variants, mixed case, synonyms, numeric horizons, unit aliases, ISO durations, invalid payload with valid outcome, valid payload with invalid outcome, and valid-but-conflicting horizons.

Multi-fault tests must prove deterministic placement and preserve earlier validation precedence. Test-local malformed wrappers are permitted; no production schema or fixture may be invented or changed.

## Input immutability, output determinism, no repair, and no inference

Action 394 must deep-freeze and serialize valid/invalid inputs before and after calls. Repeated/interleaved outputs, rows, IDs, issues, issue order, and serialization must remain identical. No clock, randomness, global cache, mutation, trim-based repair, case repair, unknown fallback, horizon inference, or unit conversion is permitted.

## Acceptance and rejection criteria

Accept Action 394 only if all three bypass classes and their variants block exactly, valid behavior remains green, unsupported and conflicting horizons are distinguished, no status/code/schema/fixture change occurs, precedence remains deterministic, and the mapper stays pure and consumer-free.

Reject Action 394 if it retains any unauthorized normalization, removes approved side/confidence behavior, broadens aliases, changes fixtures, adds a parser/module/consumer, changes schemas, weakens validation, or touches runtime/persistence/scanner/ranking/confidence/Pattern Discovery.

## Approval vocabulary and deterministic gate conditions

Use exactly `approved`, `approved_with_conditions`, and `blocked`.

Approval requires exact rules for all three bypasses, identifiable authoritative literals, an explicit semantic-normalization boundary, deterministic status/issue/path behavior, unchanged schemas/fixtures/statuses/issues, preserved valid aliases, pure mapper scope, and the narrow Action 394 surface.

`approval_decision: approved`

`passed_conditions_count: 17`

`failed_conditions_count: 0`

`unresolved_conditions_count: 0`

All literals, ownership distinctions, statuses, issue codes, paths, precedence placement, and regression variants are frozen. No condition remains for Action 394 to invent.

## Next permitted Action

The next permitted Action is Action 394 - Pure Mapper Literal-Normalization Remediation, limited exactly to the three bypass classes and boundary above. Shadow-use approval remains blocked until Action 394 is independently verified.

Runtime preview remains `runtime_preview_waiting_for_operator_inputs`.
