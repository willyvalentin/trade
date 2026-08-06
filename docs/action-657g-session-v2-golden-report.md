# Action 657I.6R2B1E-R10.2-R3.2-R1 — Session V2 revoked-Proxy boundary candidate

Generated from this external candidate's actual source bytes and executed local oracle outputs. This remains a default-off five-path candidate only; it is not a repository-delivery artifact.

- Revoked-Proxy boundary oracle: 29/29; uncontrolled throws 0; passed true.
- Fixture oracle: 69/69; uncontrolled throws 0; passed true.
- R10/R9/R8.1/R7/V3/shape/graph clean-room regressions: passed.
- Strict TypeScript: passed.
- Canonical scoped ESLint: passed with zero lint-rule warnings.
- Normative R10 formal-precedence registry SHA-256: `7cc1ef133f7ac2d7befb4e1282f85ec5e274030fe8cdd945773457a26e24a2d6`.
- Normative R10 crypto-projection registry SHA-256: `3f3d24ad52df951643a1e4ac9a803113b96fffc94c8b6a3b11f3a054235a0814`.
- Four non-report candidate source-record digest: `96b34482aaf67250002c0398ab3a4240438f3f82cb5c89c5e010d77e96cc1c77`.

## Actual source records

| Path | Bytes | SHA-256 |
| --- | ---: | --- |
| `lib/auth/session-v2-contract.ts` | 8658 | `055ae9d443a25a5eb73bd3daae3231fd92fa5aa1c81116d582e951185f4b6d80` |
| `lib/auth/session-v2-verification.ts` | 9416 | `c7c722de4454f196773e7c1caeef9bf1952a0ed43cce018d367221607f4f75ef` |
| `tests/unit/session-v2.fixtures.ts` | 2660 | `13ba5b3abc06e430b91029be605667595368427f689bb7831e2c6e2e2c650882` |
| `tests/unit/session-v2.spec.ts` | 14220 | `0880a6f107f5fbe11b0a7e614c28e355d6bb40db5ba0aa6340aa3a3b2667da20` |

All potentially abrupt reflection on untrusted values is now operation-locally guarded. In particular, `Array.isArray`, `Object.getPrototypeOf`, `Reflect.ownKeys` and descriptor lookup each have a dedicated fail-closed result path. Inherited values, accessors, malformed key material, throwing Proxy traps and revoked Proxies cannot escape the evaluator boundary.

The candidate remains pure and default-off: `verifySession` returns `authority_unavailable`. It has no token minting, caller-minted principal, route, cookie, proxy/runtime wiring, database, migration, credential, broker, dependency or delivery capability. Independent R10.2-R3.2-R2 rereview remains mandatory before any local preservation decision.
