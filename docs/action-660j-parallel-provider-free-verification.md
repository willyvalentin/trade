# Action 660J — parallel provider-free verification

Status: **provider-free CI acceleration candidate; no reduction of required
coverage and no production authority**.

The frozen baseline is protected GitHub `main`
`960b88f85f3ad7be10c4b848c40127d63a21390b`, tree
`40b6384cfe95ee8a9e46980d5a5f861f6dc062a1`, after the ordinary merge of PR
#115. Push-triggered exact-main run `32196042641`, job `95900159342`, completed
successfully. Its single `provider-free-verification` job ran from
`2026-08-18T23:10:41Z` through `2026-08-19T01:15:41Z`: 125 minutes of serial
wall-clock verification.

`production_deployment_authority:false`

## Bounded objective

Preserve every locked dependency install, lint/type check, provider-free
oracle, Track 2 test pair, exact-revision assertion and clean-tree assertion,
while allowing independent groups to execute concurrently. The current
required-check identity remains exactly `provider-free-verification` from the
GitHub Actions app. No branch-protection configuration change is required.

The six frozen shard identities are:

1. `foundation`;
2. `replay-lineage`;
3. `snapshot-admission`;
4. `snapshot-issuance`;
5. `non-forgeable-authority`; and
6. `lossless-scalar`.

Every shard independently checks out the exact event revision with persisted
credentials disabled, asserts `HEAD` against the event SHA, installs the locked
dependency graph with scripts disabled, runs its static command plan without a
shell and proves that tracked source remains unchanged. Existing Playwright
pairs remain separate child processes with one worker, preserving the prior
process-isolation boundary.

The shard split is based on exact timings from run `32196042641`. The longest
historical group is approximately 28 minutes before runner/setup overhead,
compared with 125 minutes serially. This is a planning estimate only; observed
exact-head and exact-main runs are required before any wall-clock improvement
is claimed as verified.

## Fail-closed required-check architecture

The matrix job is intentionally not the protected status. A final job has the
exact protected name `provider-free-verification`, depends on the complete
matrix and uses `always()` so dependency failure cannot silently skip the
required check. It succeeds only when the matrix result is exactly `success`.
A failed, cancelled, timed-out or incomplete shard therefore leaves the
required check non-successful.

The delivered Action 660J matrix uses `fail-fast: false` so every shard runs to
completion and all results remain visible after an early failure. Action 660K
preserves that behavior for every full Ready/main run. A failure, cancellation,
timeout, skipped full matrix, workflow parse failure or missing required job
remains fail-closed because the protected context cannot report success.

Action 660K also adds a distinct quick Draft job. The six-shard job is skipped
on Draft and the protected aggregate therefore fails deliberately; quick Draft
success can never satisfy branch protection. Converting the PR to Ready, every
later push while Ready and every push to `main` automatically run the complete
six-shard matrix before the protected aggregate may succeed.

This architecture follows GitHub's documented pattern for a required job that
depends on other jobs: the dependent job uses `always()` and inspects its
dependency result. No path filter, conditional test omission, mutable external
artifact, provider credential or production secret participates.

## Coverage and maintenance contract

The shard runner exposes one closed static plan and refuses to print or execute
it unless its ordered test paths exactly match the tracked machine-readable
registration manifest. Historical freeze oracles read that same manifest, so a
comment or unused path string cannot preserve false registration. The
provider-free contract test requires:

- exactly the six shard identities above, in workflow and runner;
- exact one-time coverage of every test and oracle from the former serial job;
- exact equality between the executable plan and registration manifest;
- lint and TypeScript in the foundation shard;
- `--workers=1` and the existing React Server condition for every applicable
  Playwright command;
- no shell execution for runner commands;
- an exact-revision assertion and clean-tree assertion in every shard; and
- the unchanged final required-check name and fail-closed aggregate rule.

Future Actions add tests by extending the closed runner plan, its registration
manifest and its oracle. Historical registration assertions remain bound to
that executable manifest. They do not create a second protected context and do
not weaken or bypass an existing shard.

## Delivery condition

This candidate is not complete until its final exact head has successful
parallel CI, independent read-only review reports no blocking finding, the
operator explicitly approves the exact PR and head SHA, an ordinary protected
PR merge reaches `main` without unexpected delta and push-triggered exact-main
CI succeeds. The first exact-head and exact-main parallel runs must record job
identity, all six shard conclusions, final aggregate conclusion and observed
wall-clock time.

Until then, the serial workflow on protected `main` remains authoritative.
Production deployment is neither required nor authorized.

## Scope limits

Action 660J changes only the provider-free GitHub Actions workflow, its static
local runner and registration manifest, this contract, its regression oracle,
two provider-free live-import detectors and historical test-registration
assertions. It performs no application runtime, Supabase/database/Auth,
Netlify configuration, provider data, broker, execution, training, promotion
or production-deployment mutation. Parallel execution changes scheduling, not
test meaning or product authority.
