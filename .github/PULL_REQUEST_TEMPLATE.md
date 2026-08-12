## Summary

<!-- Describe the bounded change and why it is needed. -->

## Manual merge safety checklist

GitHub Free cannot enforce branch protection for this private repository. The
following checks are therefore mandatory operator controls; completing them
does not close MA13 or make Milestone A complete.

- [ ] Work started from the current immutable `main` commit on a dedicated branch.
- [ ] The PR remained Draft until its bounded scope was complete and frozen.
- [ ] The PR targets `main` and contains only the intended bounded scope.
- [ ] The exact head SHA is recorded after the scope is frozen.
- [ ] `provider-free-verification` is successful for that exact head SHA.
- [ ] Independent read-only review has no unresolved blocking finding.
- [ ] The PR is cleanly mergeable and its base is current.
- [ ] The operator has explicitly approved this PR number and exact head SHA.
- [ ] The merge will use an ordinary PR merge; no direct push or force-push.

After an approved merge, record and verify the exact merge commit, successful
exact-main CI, and—when Netlify publishes it—exact deploy identity plus the
required production smoke. Any missing or stale item stops the merge or
reopens the affected gate.

## Scope and safety

<!-- State application, database, Auth, provider, runtime and release impact. -->

## Validation

<!-- List the checks run and link the exact-head CI run. -->
