# Action 534 - First Live Trusted Resolver Adapter

Action 534 adds the first dormant server-only live trusted resolver adapter for the future read-only staging preflight chain. Action 535R later split the implementation so the core is pure and the live filesystem boundary is protected by the server-only adapter module.

## Live Behavior Added

- Reads a frozen source-controlled policy for approved absolute executable candidates from the production adapter only.
- Supports only the reviewed tool identities `git` and `supabase_cli`.
- Uses `lstat` on explicitly approved candidate paths only inside the `server-only` adapter module.
- Determines whether a candidate exists, is not a symlink, is a regular file, and has an executable permission bit.
- Returns immutable structured evidence with request, session, policy, and filesystem metadata linkage.

## Still Forbidden

- No executable was run.
- No CLI version was collected.
- No process was spawned.
- No shell was used.
- No credentials were read.
- No environment values were read.
- No network request was made.
- No Avanza interaction occurred.
- No API, UI, or runner was activated.
- No order, settlement, trade, or position behavior changed.
- No deployment occurred.

## Source-Controlled Policy

The policy is `first_live_trusted_executable_resolution_macos_v1`. It is frozen, versioned, macOS-only, and forbids caller paths, environment paths, PATH search, shell lookup, relative paths, directory search, symlinks, process-start enablement, and runner enablement. Production resolution closes over the canonical policy and does not accept caller-supplied policies, filesystems, candidate paths, or dependency objects.

## Trust Limits

Resolver success is evidence only. It is not spawn permission and does not issue a live executable capability. The result includes device, inode, size, mode, modification time, and change time so a future direct-spawn boundary can revalidate immediately before a separately reviewed execution path.

TOCTOU is not eliminated. The adapter does not claim the executable remains unchanged after inspection.

## Test Coverage

The focused Action 534/535R/535W suite uses synthetic metadata against canonical candidate IDs for pure evaluation and static assertions for the server-only `lstat` boundary. Synthetic metadata cannot claim live filesystem provenance. Only the server-only adapter can upgrade a successful resolver result to live-observed evidence, and that upgrade is tracked with private module-local provenance. The suite does not depend on the developer machine having `git` or `supabase` installed at a specific path, and it does not inspect real credentials or user configuration.

## Remaining Blockers Before Any Process Spawn

- Action 535 static/security review of this implementation.
- Controlled live resolver validation.
- Future observer adapter implementation/review.
- Future direct-spawn implementation/review.
- Future authorization-consumption and runner activation gates.
