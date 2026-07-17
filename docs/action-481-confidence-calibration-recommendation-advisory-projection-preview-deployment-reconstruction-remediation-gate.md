# Action 481: Preview Deployment Reconstruction Remediation Gate

Action 480 aborted before creating a temporary candidate or invoking Netlify. That was the correct stop: the full deployment candidate was still conditional, because dependency materialization or reuse had not been approved and the full build/test suite had not run inside an isolated candidate.

Action 481 is a static approval gate for the next reconstruction rehearsal only. It does not deploy, activate, modify environment variables, touch Netlify, call providers or Supabase, run replay, persist anything, apply confidence, create feedback, or mutate recommendation behavior.

## Action 480 Abort

- Deployment result: `deployment_aborted`
- Deployment attempts: `0`
- Temporary candidate: not created
- Production changed: no
- Environment modified: no
- Preview activated: no
- Runtime preview state: `runtime_preview_waiting_for_operator_inputs`

The blocker was not candidate intent. The blocker was proof: deployment cannot proceed from inventory/hash evidence alone, and it cannot use the broad dirty working tree as source.

## Candidate Binding

The future rehearsal must reconstruct exactly:

- Clean base: `15f9923c24ed1f3cf82d34656eeacbfd98a0d347`
- Approved change candidate: `7a11d9c6697a9d89ffb3e762dd15185fda225bc8e39c80a212cd3729d05857f6`
- Full-candidate inventory: `cc6a97c5797a1fa76a6bebe9be1497fe88819f1b73992b271c142ff61d3bc2f0`
- Candidate file count: `30`

No broad working-tree copy is allowed. No unrelated post-trade files, `.env*`, credentials, `.netlify/`, deployment output, or unclassified files may enter the candidate.

## Dependency Policy

Preferred method A is approved for a future rehearsal with one condition: immutable local dependency reuse must be proven inside the isolated candidate.

The allowed shape is:

- construct the temporary full candidate from clean base plus exact overlay;
- make the existing verified dependency tree available without modifying it;
- verify `package.json` and lockfile hashes first;
- do not upgrade packages;
- do not rewrite the lockfile;
- do not install arbitrary packages;
- do not copy dependency state from an untrusted source;
- do not include dependencies in tracked candidate inventory.

Alternative method B is a frozen-lockfile install. It requires separate bounded network approval and is not authorized by Action 481.

## Manifest And Config Binding

The future rehearsal must verify these SHA-256 hashes before dependency reuse or build:

| File | SHA-256 |
| --- | --- |
| `package.json` | `7ff6ae8890b52d4879ce88248c22f152fffab327e8a5ef3a92eccccad217ef58` |
| `package-lock.json` | `859f498ee4d7d64259ad07d6117e25e284a29bd7d7169126100564fe90943657` |
| `next.config.ts` | `614bce25b089c3f19b1e17a6346c74b858034040154c6621e7d35303004767cc` |
| `tsconfig.json` | `83b460dca7c269a562dba8f46d08de45397869b7ddbf31101eabca1a975eaa82` |
| `eslint.config.mjs` | `53065bd014f2b6fb89dc5f1a84cd37053217cbec71be6f15c3958a3b3bc4143c` |
| `netlify.toml` | `7cc579b1e99306abc9f21c0340c5b7e94309567d7b86e2757ba996d2b414b1b7` |

Any manifest, lockfile, config, or package-version drift blocks rehearsal.

## Temporary Path

Use one Action-specific temporary path equivalent to:

`<system-temp>/ture/action-482-confidence-calibration-projection-preview-full-candidate-rehearsal/`

The path must be outside the active repository, outside HOME/config, outside application data, absent or empty before use, free of symlink targets and parent-chain symlinks, traversal-safe, unrelated-file-free, and serially owned. Do not reuse Action 466 or Action 467 paths.

## Rehearsal Commands

Action 482 may run these only after dependency access is proven:

- candidate integrity check equivalent to `git diff --check`
- `npx next typegen`
- `npx tsc --noEmit`
- `npm run build`
- `npm run lint`
- `node scripts/action-309-post-recovery-safety-guard.mjs`
- Action 461 preview-consumer tests
- Action 462 independent preview-consumer tests
- Recommendation details regression tests
- exact runtime-facing projection call-site count: `1`
- preview flag absent or disabled
- production activation absent
- no route, persistence, replay, provider/Supabase integration, feedback, confidence application, ranking/scanner/publication/execution/Add Trade/risk/sizing effect

All temporary-candidate-sensitive checks must run serially. No same-action repair run is allowed.

## Result Vocabulary

Future rehearsal result values are exactly:

- `full_candidate_rehearsal_passed`
- `full_candidate_rehearsal_failed`
- `full_candidate_rehearsal_aborted`

Use `passed` only when reconstruction, dependencies, commands, hashes, disabled flag, no-side-effect checks, and cleanup all pass. Use `aborted` when dependencies, candidate identity, network approval, or temp path safety prevent execution. Use `failed` when checks begin and fail, source mutates, the lockfile changes, unexpected files appear, or cleanup fails.

## Evidence Boundary

Permitted evidence is bounded metadata only: base identifier, candidate hashes, package/lockfile/config hashes, dependency method classification, dependency-integrity result, command summaries, projection call-site count, flag state, source-mutation result, cleanup result, and final decision.

Do not retain source contents, dependency contents, build logs with secrets, environment values, credentials, recommendation data, or projection data.

## Cleanup

The future rehearsal must remove the temporary candidate and any copied temporary dependency tree, verify the temp directory is absent or empty, retain no build output in the repository, retain no credentials or environment values, and preserve the active working tree unchanged. Cleanup failure blocks readiness.

## Approval Decision

Decision: `approved_with_conditions`

The reconstruction and rehearsal procedure is frozen, but immutable local dependency reuse still has to be proven in the isolated candidate. A frozen-lockfile install would require a separate bounded network approval.

Next action: `action_482_dependency_materialization_completion_gate`

If that condition is completed, the next execution action is `action_482_full_candidate_build_rehearsal`.

Runtime preview remains `runtime_preview_waiting_for_operator_inputs`.
