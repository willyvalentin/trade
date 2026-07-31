# Action 666BW — Non-Forgeable Issuance Independent Re-Review

## Scope and freeze

The review used `refs/codex-preservation/action-666bv` at object
`09bf4d2fb8791ad072ae71e8f3a6b2d17c8fd938` as the normative source.
Its parent is `e9cfbcc14d4fb8b8973712ed62e5fcdf5565be38`, it contains exactly
the five Action 666BV artifacts, and those bytes match the durable worktree
5/5. The canonical normative digest remained
`19779280218a4d108c18606b66246fc98ccd96d6d870d5a770b9af9e52b93386`
before regression, after regression, and after this review.

No normative artifact was changed during Action 666BW. This report, the
freeze manifest, and the threat matrix are self-excluded review evidence.

## Regression and threat evidence

- Action 666BV focused suite: 17/17 passed.
- Relevant Action 665/666 regression: 325/325 passed.
- Action 664 DB-free foundation: 161/161 passed.
- PostgreSQL: `not_applicable_db_forbidden_action`; no DB connection was made.
- Independent positive threat matrix: 8/8 passed.
- TypeScript, scoped ESLint with zero warnings, JSON/golden parity, and
  `git diff --check`: passed.
- Cross-process authority digest and predecessor-root observations: identical
  in two fresh processes.
- Server-only/live-import/write/persistence/provider/DB/migration/dependency/
  lockfile scans: no in-scope operational surface found.

The independent matrix reproduced the predecessor self-mint weakness and
confirmed the V2 pinned signature/root boundary rejects it. It reproduced the
predecessor nested-request failure class and confirmed V2 returns a structured,
sanitized failure without throwing. Alternative roots, post-callback mutation,
cross-session authority, missing/extra/renamed nested fields, depth/node/key/
array/string budgets, cycles, accessors, throwing proxies, deterministic
failure identities for the supported golden cases, verified-snapshot-only
downstream use, full BD/AX/AJ/AC/V/AQ interop, and default-off/kill-switch
zero-work were also exercised.

## Findings

### 666BW-M1 — distinct unsupported scalar inputs collide in failure evidence (major)

Two semantically different inputs, top-level `1n` and `2n`, both fail the
pre-clone bounded validator as unsupported values. The bounded observation
records only the common type (`bigint`) and common validation counters; it does
not bind the observed scalar value. Consequently both inputs produce:

- the same bounded-prefix digest
  `3d57b666ba1149c1216e9afa6575088f6df2d700d6bff7630666d8117a1a03c2`;
- the same observation digest
  `73b1ddadb69da0e8100170cfcbb696e9253ad3c63b0a9c29559c22d82295658a`;
- the same terminal issuance digest
  `38e3d98623b3888ac9ecb02abbbc22d512ca714a554092ab872b8107dc3080d8`.

This does not grant issuance, authority, persistence, or live effect, but it
violates the V2 requirement that semantically different invalid requests must
not collide when their observed material differs. It also weakens independent
forensic rebuild identity for rejected external inputs. The review therefore
classifies this as a major finding.

No remediation was made. A bounded successor Action should bind a sanitized,
type-aware representation of supported-to-observe invalid scalar material
into the invalid-request observation without exposing backend details or
weakening the existing traversal budgets.

## Decision

```text
blocker: 0
major: 1
minor: 0
nit: 0
independent_review_approved: false
local_checkpoint_ready: false
live_impact: false
```
