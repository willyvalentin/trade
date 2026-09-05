# CI cancellation reliability boundary

Status: **source-only throughput reliability increment; the six-shard Full CI
suite and its required aggregate are unchanged**.

## Objective

When GitHub cancels a superseded workflow run, the provider-free shard runner
must forward `SIGINT` or `SIGTERM` to the one command it is currently running,
wait for that command to stop, and exit without beginning a later command in
the same shard.

The runner still executes the existing closed command plan serially within each
of the same six shard identities. It still uses a direct executable with
`shell: false`, preserves each command's isolated environment, and treats a
non-zero or signal-terminated command as unsuccessful.

## Non-goals and retained controls

This change does not alter the workflow's concurrency group, required-check
name, event triggers, matrix identities, fail-closed aggregate, branch
protection, command registration, test selection, Netlify, application
runtime, Supabase, provider, broker, secret, staging, deployment, or
production behavior. It creates no CI deduplication path.

The regression test uses a disposable local fake `npm` executable only to hold
the first foundation command until it receives a signal. It verifies that the
child is terminated, the runner reports the normal signal-derived exit status,
and the next command never starts. It makes no network request and does not
run the real CI plan.
