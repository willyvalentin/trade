# Action 484: Temporary Candidate Git Integrity Remediation Approval Gate

Action 484 approves a static remediation to the temporary full-candidate integrity-check procedure. It does not rerun the rehearsal, deploy, activate the preview, call Netlify, install dependencies, update dependencies, modify environment values, access providers or Supabase, persist data, run replay, apply confidence, create feedback, or change recommendation behavior.

## Purpose

Action 483 constructed the isolated full candidate from clean base `15f9923c24ed1f3cf82d34656eeacbfd98a0d347` plus the approved 30-file overlay `7a11d9c6697a9d89ffb3e762dd15185fda225bc8e39c80a212cd3729d05857f6`. The full candidate inventory remained `cc6a97c5797a1fa76a6bebe9be1497fe88819f1b73992b271c142ff61d3bc2f0`.

The rehearsal failed before build and test commands started. This gate freezes the root cause and approves one deterministic fix for the next rehearsal.

## Action 483 Failure

Root-cause classification: `temporary_candidate_git_integrity_pathspec_invalid`

The candidate itself was not shown invalid. The dependency copy was not shown invalid. Git rejected the integrity command syntax because the temporary Git index setup attempted to exclude ignored `node_modules` through an invalid pathspec. No build, typecheck, lint, or Playwright command ran. No source mutation occurred. Cleanup succeeded.

## Approved Strategy

Approved integrity strategy: `baseline_plus_overlay_manifest_integrity`

Action 485 must verify the source candidate directly before dependency materialization:

1. Construct the clean base.
2. Overlay exactly the 30 approved candidate files.
3. Verify every approved overlay hash directly.
4. Enumerate a bounded repository-relative source inventory.
5. Compare that inventory against the expected clean-base-plus-overlay inventory.
6. Run source-only Git integrity checks before `node_modules` is copied, or use a safe temporary Git repository/index where dependency contents are never staged.
7. Avoid any `node_modules` exclusion pathspec entirely.

The allowed alternative is source-only Git integrity before dependency copy, followed by bounded source hashing after dependency copy. This is equivalent when it never stages `node_modules` and keeps source drift detectable.

## Execution Phases

Action 485 must use this order:

1. Source-only candidate: create temp source candidate, verify clean base, apply exact 30-file overlay, verify candidate hashes, run source-only Git integrity, and run bounded source inventory comparison.
2. Dependency materialization: copy temporary `node_modules`, verify dependency boundary, and verify the five known extraneous packages remain excluded.
3. Serial build/test rehearsal: run the approved command inventory in order.
4. Final checks and cleanup: rerun bounded source/config hashes and remove temporary candidate plus dependencies.

`node_modules` must not be copied before the source-only Git/index integrity phase if that creates Git ambiguity.

## Source Inventory Boundary

The inventory must include repository files required to build and test Ture, including `app`, `components`, `lib`, `tests`, approved `docs`, `scripts`, package manifests, lockfile, configuration, and static assets.

Exclude only exact relative paths or prefixes:

- `.git/`
- `node_modules/`
- `.next/`
- coverage output
- temporary test output
- `.netlify/`
- `.env*`
- logs
- OS/editor metadata

The exclusion rules must not hide application source, docs required by the approved candidate, scripts, config, package files, or static assets.

## Direct Hashes

All 30 approved overlay files require exact path, exact content SHA-256, and exact Action classification. The protected files must keep bounded hashes for `package.json`, `package-lock.json`, `next.config.ts`, `tsconfig.json`, `eslint.config.mjs`, and `netlify.toml`. Any mismatch aborts before rehearsal commands.

## Unexpected Files

Action 485 must abort before commands if an unexpected source file appears, an unapproved source file differs from clean base, an approved overlay is missing, a baseline file is deleted unexpectedly, an environment file appears, a secret-like file appears, a merge-conflict marker appears, or `node_modules` enters tracked candidate inventory. No same-action repair is allowed.

## Dependency Preservation

Dependency method remains `temporary_verified_node_modules_copy`. There is no install, no network, no update, no lockfile modification, and no package manifest modification. The five known extraneous packages remain excluded:

- `@emnapi/core`
- `@emnapi/runtime`
- `@emnapi/wasi-threads`
- `@napi-rs/wasm-runtime`
- `@tybys/wasm-util`

The dependency copy is created only after source integrity passes and is removed during cleanup.

## Rehearsal Commands

Action 485 must still run serially:

- candidate integrity validation
- `npx next typegen`
- `npx tsc --noEmit`
- `npm run build`
- `npm run lint`
- Action 309 safety guard
- Action 461 preview-consumer suite
- Action 462 independent preview-consumer suite
- Recommendation details regression suite
- focused Actions 481-485 suites

The runtime-facing projection call-site count remains exactly `1`. No route, persistence, replay, provider/Supabase preview integration, feedback, confidence application, ranking, scanner, publication, execution, Add Trade, or risk sizing effect is authorized.

## Decision

Result vocabulary: `approved`, `approved_with_conditions`, `blocked`

Approval decision: `approved`

No unresolved conditions remain for the remediation strategy. Action 485 must perform exactly one new full rehearsal using this remediated integrity procedure and must not deploy or activate.

Runtime preview remains `runtime_preview_waiting_for_operator_inputs`. The preview flag `CONFIDENCE_CALIBRATION_PROJECTION_PREVIEW_ENABLED` remains absent or disabled.

Next action: `action_485_full_candidate_build_rehearsal_retry`
