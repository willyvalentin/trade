# ACTION 657I.6R2B1E-R15-R2-R1-A3 — Session V2 schema-first source candidate

This report describes an external-only, default-off five-path source candidate. It is not a repository-delivery artifact and does not authorize mutation of Draft PR #85.

## Closed review findings

- R15-M1: all source/test imports are repository-compatible extensionless specifiers; unchanged repository `tsc --noEmit` passes.
- R15-M2: transition inputs are materialized through the registry-owned exact runtime schemas before any predicate runs. Exact types, enums, descriptors and record prototypes are enforced while ordinal first-error precedence remains unchanged.
- R15-M3: runtime strings, Buffer values, subclasses and incorrectly sized arrays are rejected before HMAC. Only a guarded, copied, same-realm 32-byte `Uint8Array` reaches HMAC.
- A2-R2-M1: complete binding/provenance schema and grammar validation precedes binding SHA-256 and HMAC; schema failures reach both crypto operations zero times.
- A2-R2-M2: root, binding and provenance use `Object.prototype`, exact own field sets and enumerable own data descriptors. Null prototypes, inherited fields, symbols, accessors and hostile/revoked Proxies fail closed.

## Golden values

- Binding SHA-256: `0293b1dbee15164176cbe11c5c4e18087a395f2555e6564868bfdd3b629dd53f`
- Provenance HMAC-SHA-256: `868b2b8545316134d3a204f1daa2a596a3de07a281b7395b79f4aeb6e4c707b6`
- Normative R10 formal-precedence registry SHA-256: `7cc1ef133f7ac2d7befb4e1282f85ec5e274030fe8cdd945773457a26e24a2d6`
- Normative R10 crypto-projection registry SHA-256: `3f3d24ad52df951643a1e4ac9a803113b96fffc94c8b6a3b11f3a054235a0814`

## Source records

| Path | Bytes | SHA-256 |
| --- | ---: | --- |
| `lib/auth/session-v2-contract.ts` | 13,433 | `adf60b59d83d4ffc67559a837a9eeda130fee2ad3aaf3fe24411c6217d8e6ac7` |
| `lib/auth/session-v2-verification.ts` | 16,321 | `bbb770fc2364d5ab60f9542902f4eba0e12d2660465b5e0ac04684958a9800ad` |
| `tests/unit/session-v2.fixtures.ts` | 3,356 | `0930e5baba70c86031f8b6d1ad07ab147ecd869aafbe2bdee91754c16cb8b736` |
| `tests/unit/session-v2.spec.ts` | 14,211 | `eb2a2c9063bac195b71e91af551b81b68a808b9471e26a428d8f612b65ae3356` |

## Executed gates

- Repository TypeScript: passed.
- Scoped ESLint: passed with zero warnings.
- Candidate fixture regression: 69/69, zero throws.
- Independent source/contract oracle: 29/29, zero throws.
- Schema-first authority oracle: 30/30, zero throws.
- A2-R1 regression: 8/8 structural and 16/16 vectors.
- A1 claims-integrity regression: 24/24.

The candidate remains pure and default-off: `verifySession` returns `authority_unavailable`. It has no route, cookie, proxy/runtime wiring, database, migration, credential, broker, dependency, provider or delivery capability. Independent source rereview remains mandatory.
