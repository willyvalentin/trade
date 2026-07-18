# Action 535R - First Live Trusted Resolver Blocker Remediation

Action 535R remediated the two high-severity Action 535 blockers without activating the adapter or adding any observer, spawn, credential, runner, API, UI, browser, Avanza, order, position, settlement, network, environment, or process-execution behavior.

## Remediated Blockers

### A535-H1 - Server-Only Trust Boundary

The first-live resolver core is now pure. It imports no `node:fs`, `fs`, `fs/promises`, `child_process`, process-execution primitive, network primitive, credential primitive, or `server-only` runtime primitive. It contains only types, constants, canonical policy, pure validation, synthetic observation evaluation, immutable result construction, and fingerprint helpers.

The live filesystem operation now lives only in `lib/post-trade-first-live-trusted-resolver-adapter.ts`, whose first import is `import "server-only";`. That module is the only reviewed first-live resolver module that imports `node:fs/promises` and invokes `lstat`.

### A535-H2 - Closed Source-Controlled Policy Contract

Production resolution now closes over `getFirstLiveTrustedResolverPolicy()` and does not accept caller-supplied policy, filesystem, candidate path, or dependency-injection objects. The generic exported policy builder that accepted arbitrary candidate arrays was removed.

The canonical production policy remains frozen, versioned, macOS-only, deterministic, source-controlled, and limited to `git` and `supabase_cli` candidate paths:

- `/usr/bin/git`
- `/opt/homebrew/bin/supabase`
- `/usr/local/bin/supabase`

Environment variables, PATH, user config, runtime config, request input, and external files cannot alter candidate paths or ordering.

## Testability Model

Tests remain machine-independent through a pure synthetic observation seam. The seam evaluates already-collected metadata against canonical candidate IDs and never invokes live filesystem behavior. After Action 535W, the pure seam cannot construct `server_only_lstat` provenance and synthetic success never claims `observedLiveFilesystem: true`.

The production adapter remains the only code path that can perform live `lstat`, and it remains dormant and unwired. It is also the only module that can upgrade successful evidence to live-observed provenance, using private module-local WeakSet tracking that plain objects, spreads, and serialized data cannot regain.

## Preserved Safety

- No executable was run.
- No CLI version was collected.
- No process was spawned.
- No shell was used.
- No environment value was read.
- No credentials were read.
- No network request occurred.
- No API, UI, runner, observer, spawn, or credential boundary was activated.
- No Avanza interaction occurred.
- No order, settlement, trade, or position behavior changed.
- No deployment occurred.

## Remaining Gate

This remediation does not approve the live resolver. It prepares the implementation for a separate independent re-review.

## Decision

`post_trade_first_live_trusted_resolver_adapter_blockers_remediated_ready_for_re_review`

## Result Status

`post_trade_first_live_trusted_resolver_adapter_action_535r_remediation_completed`
