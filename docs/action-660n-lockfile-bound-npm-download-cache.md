# Action 660N — Lockfile-bound npm download cache

## Decision

Action 660N is a source-only follow-up to Action 660K's cost-bounded CI
scheduling. It enables `actions/setup-node`'s npm download cache for the
Draft route and each full-matrix shard, bound to the committed
`package-lock.json`.

The cache contains downloaded npm packages only. It does not cache
`node_modules`, replace or weaken `npm ci --ignore-scripts --no-audit --no-fund`,
or bypass the exact-revision or clean-tracked-source checks.

## Preserved delivery controls

- Draft remains non-protected and cannot authorize merge.
- Ready heads and every `main` push still run all six named provider-free
  shards and the fail-closed `provider-free-verification` aggregate.
- The existing exact-SHA, tracked-source, branch-protection and concurrency
  controls remain unchanged.

The baseline is protected `main` commit
`0ce325d49ad3951cc898070b005fa1d224ef118a`, tree
`5cee9a86bdf86bc0117255cb23a9be34e8631b73`.

## Authority limits

This action changes no application runtime, database, Supabase project,
Netlify configuration, deployment, branch protection or merge authority. Its
privacy-safe evidence is
`docs/evidence/action-660n-lockfile-bound-npm-download-cache.json`.
