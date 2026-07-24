# Action 486: Temp Path Abort Remediation Approval Gate

Action 486 is a static approval gate for the Action 485 temporary-path abort. It does not run a rehearsal, create a source candidate, copy dependencies, deploy, activate preview behavior, call providers, write persistence, or alter scanner/ranking behavior.

## Scope

This approval covers exactly one remediation for the future Action 487 rehearsal: canonicalize the trusted temp root and candidate paths consistently, then use path-aware containment checks instead of string-prefix-only comparison.

The approval decision is `approved`.

Next action: `action_487_full_candidate_build_rehearsal_retry_after_temp_path_remediation`.

Runtime preview state: `runtime_preview_waiting_for_operator_inputs`.

## Action 485 Abort

Action 485 attempted exactly one rehearsal retry and aborted before source construction.

- Rehearsal decision: `full_candidate_rehearsal_aborted`
- Abort reason: `unsafe_temp_path`
- Failure reason: `temporary_path_realpath_prefix_mismatch`
- Command count: `0`
- Source candidate created: `false`
- Dependency copy created: `false`
- Deployment: `false`
- Activation: `false`
- Cleanup: `temporary_boundary_absent`

The candidate itself was not shown defective. The abort happened before candidate source or dependency construction.

## Root Cause

Root-cause classification:

`temporary_candidate_realpath_comparison_used_noncanonical_prefix_boundary`

The requested Action-specific path was intended to be below the system temp root. The safety check compared path representations that were not canonicalized consistently. On macOS, `/var/...` may canonicalize to `/private/var/...`, so comparing unresolved `/var` text to canonical `/private/var` text can report a false outside-temp result.

No command executed, no source candidate was created, no dependency copy was created, and no cleanup failure occurred.

## Canonical Root Policy

Action 487 must derive the system temp root from the runtime/platform API, canonicalize that root, derive the fixed Action-specific candidate path, canonicalize the candidate parent, and canonicalize the created candidate target before source construction.

All containment and forbidden-root comparisons must use canonical absolute paths.

Do not compare unresolved paths to canonical paths, relative paths to absolute paths, `/var/...` text directly to `/private/var/...` text, or raw strings without path-boundary semantics.

## Path-Aware Containment

Action 487 must use a containment check equivalent to `path.relative(canonicalTempRoot, canonicalCandidatePath)`.

Accept only when:

- the candidate is under the canonical temp root;
- the candidate is not equal to the temp root;
- the relative path is not `..`;
- the relative path does not begin with `../`;
- the relative path is not absolute;
- the candidate is under the exact Action-specific subtree.

String-prefix-only checks are rejected. Prefix-confusion siblings such as `/private/var/folders-safe-evil` and `/tmp/ture-action-487-evil` must be rejected.

## Action-Specific Location

Action 487 must use one fixed child:

`<canonical-system-temp>/ture/action-487-confidence-calibration-projection-preview-full-candidate-rehearsal/`

No caller-supplied path, CLI path argument, environment override, stdin path, external random location, or reused Action 466/467/473/483/485 path is allowed.

## Symlink Policy

Before use, Action 487 must inspect every existing parent component below the trusted canonical system-temp root.

Reject:

- target symlink;
- dangling target symlink;
- parent-chain symlink inside the Action-specific subtree;
- symlink resolving outside the canonical system-temp root;
- symlink resolving into repository, HOME/config, application data, build output, credentials, or source `node_modules`.

The operating system's canonical temp root may resolve through a platform-defined alias such as `/var` to `/private/var`. That platform temp-root alias is not treated as an unsafe user-created symlink when both sides are canonicalized through the trusted runtime temp-root source.

## Forbidden Roots

The canonical candidate path must not be equal to or inside:

- active repository root;
- repository parent selected as deployment source;
- HOME;
- HOME configuration directories;
- application support/data directories;
- Netlify local metadata directory;
- source `node_modules`;
- build output directories;
- credential stores.

All forbidden roots must also be canonicalized before comparison.

## Creation Sequence

Action 487 must follow this order:

1. obtain trusted system temp root;
2. canonicalize trusted root;
3. derive the fixed Action-specific path;
4. verify parent containment and forbidden-root separation;
5. verify no unsafe existing target or parent-chain symlink;
6. require target absent or empty;
7. create the Action-specific directory;
8. canonicalize the created target;
9. repeat containment and forbidden-root checks;
10. begin source construction only after all checks pass.

If any check fails, the result must be `full_candidate_rehearsal_aborted`.

## Cleanup Sequence

Cleanup may remove only the exact canonical Action-specific subtree.

Before deletion, Action 487 must repeat canonical containment, Action-specific suffix identity, forbidden-root separation, and symlink rejection.

Cleanup must never recursively delete the system temp root, repository, HOME, parent directory, shared `ture` temp root unless empty and explicitly safe, or source `node_modules`. Cleanup must be idempotent and bounded.

## Test Matrix

Future tests must accept:

- canonical temp child;
- macOS `/var` input resolving to `/private/var`;
- already canonical `/private/var` representation;
- absent target;
- empty safe target.

Future tests must reject:

- candidate equals temp root;
- sibling textual-prefix path;
- `../` traversal;
- absolute escape;
- repository path;
- HOME path;
- config path;
- application-data path;
- source `node_modules` path;
- target symlink;
- dangling symlink;
- nested parent symlink;
- non-empty target;
- wrong Action number/path;
- caller-controlled path override;
- cleanup target outside approved subtree.

## Rehearsal Policy Preservation

Action 487 must retain the existing candidate bindings and policies:

- clean base `15f9923c24ed1f3cf82d34656eeacbfd98a0d347`;
- approved 30-file change candidate `7a11d9c6697a9d89ffb3e762dd15185fda225bc8e39c80a212cd3729d05857f6`;
- full-candidate inventory `cc6a97c5797a1fa76a6bebe9be1497fe88819f1b73992b271c142ff61d3bc2f0`;
- `baseline_plus_overlay_manifest_integrity`;
- source-only integrity before dependencies;
- `temporary_verified_node_modules_copy`;
- five extraneous packages excluded;
- no network, install, or update;
- serial command inventory;
- exactly one rehearsal attempt;
- preview flag disabled;
- no deployment or activation.

Action 486 does not reopen those decisions.

## Safety Outcome

Deployment authorized: `false`

Activation authorized: `false`

Rehearsal performed: `false`

Preview flag enabled: `false`

Production changed: `false`

Confidence applied: `false`

Persistence/replay/provider/Supabase/feedback/downstream effects: `false`
