# Action 667U.2A — Lossless malformed-input failure identity successor

## Status and boundary

`repository_owned_recommendation_outcome_evidence_admission_v2` is an
additive, diagnostic-only successor to the frozen U.1 admission contract. It
closes finding `U2-001` without changing any U.1 or U.2 byte.

The contract is default-off, read-only, synthetic-only, and non-promotable:

```text
diagnostic_only: true
shadow_only: true
read_only: true
real_outcome_source_accessed: false
official_ohlcv: false
canonical_performance_eligible: false
automatic_model_input_allowed: false
automatic_training_allowed: false
automatic_promotion_allowed: false
causal_claimed: false
live_ranking_effect: false
```

It does not provide canonical binding, persistence, provider access, database
access, writers, performance evidence, or live-ranking input.

## Why U.1 is retained

U.1 correctly failed closed and sanitized malformed JSON. Its rejected-input
snapshot, however, was canonical `null`. Two different malformed candidate
strings therefore shared the same failure and terminal digests; the same was
true for malformed authority strings. U.2 documented that behavior as
`U2-001`. U.1 and its U.2 freeze/review remain immutable historical evidence.

V2 changes only the failure-observation boundary. A malformed observed string
is never represented by canonical `null`.

## Pre-parse observation contract

Each input has a closed, domain-separated role:

```text
candidate
authority
```

Before JSON parsing, V2 binds:

- the role;
- primitive type tag;
- exactly one input read;
- exact JavaScript string code-unit length;
- exact UTF-8 byte length;
- SHA-256 of the exact UTF-8 encoding;
- SHA-256 of the exact ordered UTF-16 code units;
- Unicode scalar well-formedness;
- parse stage;
- deterministic sanitized reason codes;
- the canonical observation digest.

The code-unit digest is additional lossless evidence for unpaired-surrogate
inputs. Such strings have no valid Unicode scalar encoding and multiple
different code-unit sequences can map to the same UTF-8 replacement bytes.
V2 rejects them before JSON parsing but retains their distinct observation
identity without retaining the raw input.

Candidate and authority observations use different digest domains. Identical
bytes in different roles therefore share the exact-byte SHA-256 but never the
observation digest.

## Parse and budget policy

The only accepted runtime input representation is a primitive string.
Objects, accessors, proxies, coercion hooks, and callbacks are not traversed or
executed.

The candidate limit is 1,500,000 UTF-8 bytes and 1,500,000 string code units.
The authority limit is 262,144 UTF-8 bytes and 262,144 string code units. The
exact limit is accepted; limit plus one fails at `pre_parse`. JSON parser
exceptions are reduced to a fixed role-specific
`malformed_json_sanitized` reason. Raw text, exception messages, and stacks
never enter the result.

Successfully parsed values pass the existing bounded, iterative V3
plain-data canonicalizer. Its fixed depth, node, key, array, and aggregate
string budgets remain in force; depth exhaustion is covered in the synthetic
matrix. Only the resulting parser-owned, deeply frozen canonical snapshot can
reach U.1 verification.

## Failure provenance

Every non-admitted result binds:

- closed taxonomy and evidence identity;
- candidate and authority observation digests;
- each observation's role, parse stage, and sanitized reasons;
- the predecessor result digest when one exists;
- sorted terminal reason codes.

The result digest then binds the complete terminal result. Independent
rebuilders recompute observation, failure-identity, and result digests without
accepting caller-supplied replacements.

Consequences:

- different malformed strings have different observation, failure, and
  terminal digests;
- identical candidate/authority bytes remain role-distinct;
- absent authority is an explicit `not_observed` sentinel;
- malformed input is never silently collapsed to canonical `null`;
- parser-controlled detail is sanitized, while exact observed-byte identity is
  retained cryptographically.

## Downstream and compatibility behavior

Non-issued candidates stop before authority observation, admission request
construction, T V4 rebuild, and downstream digest work. Default-off and the
kill switch stop before either input is observed.

Only final T V4 `issued` evidence can reach authority observation and the
unchanged U.1 verifier. The existing eighteen-gap binding, temporal finality,
membership, lineage, and authority checks remain authoritative. A valid
synthetic path remains:

```text
T V4 issued
→ U.2A admitted
→ S.2A completed
→ R.2 bindable
→ Q.1 ready
→ P.2A captured
→ O.2A joined
```

This is contract interoperability evidence only. It is not a real outcome
join, outcome claim, model input, or live effect.

## Synthetic verification matrix

The closed synthetic matrix covers empty, truncated and invalid JSON; the
historical collision pair; role substitution; valid JSON with invalid schema;
NFC/NFD distinctions; embedded NUL; raw and escaped invalid surrogates; byte
budget minus one/exact/plus one for both candidate and authority; bounded parse
depth exhaustion; distinct malformed authorities; non-issued zero-work; digest
tampering; default-off; and kill-switch behavior.

The canonical golden result must be byte-identical across repeat processes,
UTC, Europe/Stockholm, America/New_York, and reversed fixture order.
