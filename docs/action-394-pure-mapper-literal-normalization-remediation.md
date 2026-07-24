# Action 394 - Pure Mapper Literal-Normalization Remediation

## Purpose

Action 394 closes exactly the three literal-normalization bypasses found by the independent Action 392 audit and approved by Action 393. The pure mapper remains disconnected from runtime, persistence, providers, and consumers.

## Scope

Changed surfaces are limited to the mapper, this document, the Action 394 verifier and focused tests, narrow historical compatibility in Actions 391-393, and the Actions 318-320 package guards. Fixtures, schemas, migrations, proxy, middleware, Netlify configuration, runtime routes, and deployment artifacts are outside scope.

## Findings And Approval

Action 392 found that context state ` present `, freshness state ` fresh `, and payload horizons such as `60M` and ` 60m ` could pass after semantic normalization. Action 393 returned `approval_decision: approved`, with 17 passed, 0 failed, and 0 unresolved conditions.

## Exact-Literal Policy

Context state accepts only `present`, `explicit_null`, `unavailable`, and `unknown` as exact raw strings. Freshness accepts only `fresh`, `stale`, `unknown`, and `unavailable`. Horizon accepts only `15m`, `30m`, and `60m`. These fields are validated without trim, case folding, unit conversion, numeric coercion, synonym mapping, repair, or invalid-to-unknown fallback.

ASCII whitespace, tabs, newlines, non-breaking-space padding, case variants, empty values, whitespace-only values, and unsupported synonyms are rejected. Rejected raw values are never copied into issues.

## Context-State Remediation

The original `state` value is checked directly against the authoritative context-state set. Invalid states use the existing `blocked_invalid_provenance` status and `invalid_provenance` issue at the existing RFC 6901 state path.

## Freshness Remediation

The original freshness `state` is checked directly before age and contradiction checks. Invalid freshness uses the existing `blocked_invalid_provenance` status and `invalid_provenance` issue at `/contextSnapshot/freshness/state`. No current-time calculation or freshness inference was added.

## Horizon Remediation

Payload and outcome horizon literals are validated after required identity and before semantic linkage comparison:

- unsupported payload horizon: `blocked_invalid_input` with `invalid_input` at `/recommendationSnapshot/payload_json/outcome_horizon`
- unsupported outcome horizon: `blocked_invalid_outcome` with `invalid_outcome` at `/outcome/horizon`
- individually valid but conflicting horizons: `blocked_invalid_linkage` with the existing `invalid_linkage` issues

A missing optional payload/outcome relationship retains the prior pending and incomplete behavior.

## Permitted Normalization Boundary

Previously approved semantic equivalences remain unchanged: `long` equals `buy`, `short` equals `sell`, confidence `[0,1]` remains normalized, and confidence `(1,100]` remains percentage-converted. Representation-safe NFC normalization and percent encoding remain limited to deterministic row identity. Existing timestamp and valid setup alias rules remain unchanged. None of these permissions extends to context state, freshness, horizon, setup vocabulary, or trading-window vocabulary.

## Validation Placement

The frozen pipeline remains input shape, required identity, horizon literal precondition, linkage, alias conflicts, timestamp/temporal, future leakage, provenance, outcome, optional completeness, and construction. Literal prevalidation is the approved Action 393 refinement to the linkage boundary. Identity still wins over literal errors; alias conflicts still win over later provenance checks; temporal and future-leakage checks retain their established precedence after linkage and aliases.

## Status And Issue Contract

No status or issue code was added. Issues retain exactly `code`, `path`, `severity`, and `messageKey`; paths remain RFC 6901; severity remains `error` or `warning`; ordering and deduplication remain deterministic; messages remain static and redact rejected values.

## Regression Coverage

Focused coverage includes exact valid context/freshness/horizon domains, ASCII and Unicode padding, casing, tabs/newlines, unsupported units and types, payload/outcome/conflict status distinctions, pending outcomes, all 15 Action 381 contexts, aliases, confidence conversion, identity encoding, multi-fault precedence, issue ordering, deep immutability, and repeat-call determinism. Action 388 and Action 391 regressions remain required; Action 392 retains its historical blocked audit conclusion; Action 393 retains its approved gate conclusion.

## Guarantees

- Input immutability: deep-frozen valid and invalid inputs remain byte-identical.
- Output determinism: repeated and interleaved calls retain stable serialization and issue order.
- No fixture change: Action 380, Action 381, and Pattern Insight fixture modules are unchanged.
- No consumer: mapper consumers remain absent.
- No runtime: no route, page, provider, scanner, ranking, replay, or shadow runner imports the mapper.
- No persistence: no Supabase read/write or persistence path exists.
- Runtime preview: `runtime_preview_waiting_for_operator_inputs`; the chain remains paused and untouched.

## Files

- `lib/snapshot-to-learning-dataset-mapper.ts`
- `docs/action-394-pure-mapper-literal-normalization-remediation.md`
- `scripts/action-394-pure-mapper-literal-normalization-remediation-verify.mjs`
- `tests/e2e/action-394-pure-mapper-literal-normalization-remediation.spec.ts`
- narrow Actions 391-393 compatibility files
- minimal Actions 318-320 guard updates

## Source Hashes

- mapper: `7294a851ede33aadc0dbfcb68c13337cd244002b84be7cbbe40abbe91673741d`
- learning fixture: `706bd57150914862604af70e0bba7614151f53c32abc5dbde9595c53bf4b332b`
- context fixture: `46358cb997b4f7a431a3fee72562659da48b13219404224f4e80e08dbf8ed406`
- pattern fixture: `db8dae9f101f710123a0a3ac6493356bd761c15f231023ab9742caefaacf8f57`

## Next Independent Audit

The recommended next Action is an independent Action 395 audit of the exact Action 394 revision. It must remain static and must not advance runtime preview.
