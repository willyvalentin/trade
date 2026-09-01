# REL-00 CI-B0 — Post-B CI baseline and admission reconciliation

## Bounded objective

At the user's explicit request to start REL-00 after the qualified Milestone B
closeout, freeze the current protected-main CI baseline and reconcile the
proposed transition with the authoritative roadmap and its safety constraints.
This is the CI-B0 source-only slice. It does not implement a selector, change
a workflow, alter branch protection, or activate a runtime capability.

## Authority boundary

This record is limited to repository-source evidence and an explicit delivery
decision. It grants no authority to change GitHub Actions triggers, job names,
matrix membership, required checks, branch protection, deployment, Netlify,
staging, database, provider, broker, secret, transport, writer, route/UI or
production behavior.

The qualified Milestone B closeout remains exactly
`complete_under_local_sandbox_acceptance_profile_v1`. It does not complete the
former live server-owned trade-management outcome: B-01 and B-05 through B-12
remain deferred, unverified runtime work, and remote staging remains
`not_admitted`.

## Frozen CI baseline

The reviewed protected-main revision is
`7814f677c5992535957e8e2765660fafa894db80` with tree
`7221ee7a8a130bb4db2ac60f8d77597b9cf56d0e`. It is the ordinary merge of
PR #289, whose head was `704532f2cc692014ef0dea26935e349396f00a90` and
whose base was `8decbb5fe4643cc43af480897f1aca30da13a811`.

| Evidence | Frozen result |
| --- | --- |
| Ready Full CI `33520256853` | The six named provider-free shards, strict aggregate and merge-candidate provenance POC succeeded. |
| exact-main Full CI `33523670033` | The same six named shards, strict aggregate and post-merge provenance POC succeeded. |
| Post-merge provenance | `matched`; no mismatches; the exact candidate/main tree is `7221ee7a8a130bb4db2ac60f8d77597b9cf56d0e`. |

The preserved Full-CI matrix is exactly:

1. `foundation`
2. `replay-lineage`
3. `snapshot-admission`
4. `snapshot-issuance`
5. `non-forgeable-authority`
6. `lossless-scalar`

The current workflow deliberately uses a low-cost Draft-only job,
`draft-provider-free-verification`, while every Ready pull request and every
push to `main` runs all six shards and the strict
`provider-free-verification` aggregate. The lockfile-bound npm download cache,
locked `npm ci --ignore-scripts`, exact revision checks, clean-tree checks and
PR/SHA concurrency cancellation are already delivered controls. The known
Draft fast-green/matrix-skipped/aggregate-failed shape remains an expected
workflow semantic and is not a rerun trigger.

CI-B0 itself merged as PR #290 commit
`8127c4d294a36d0e442fa1b10df451f15cdf0c28`. Its Ready run `33532291412` and
exact-main run `33535472128` both passed. The latter retained all six shards
and strict aggregate; its post-merge POC reported `matched` for tree
`399b03831c5a2de9c5121e29603e6aeb79747505` with no mismatches and no CI
deduplication.

## Transition status

REL-00 is in progress. CI-B0 is verified on exact main and CI-B1 is its
current source-only taxonomy phase. This record does not claim that the
complete cost-and-throughput transition is finished. CI-B1 through CI-B6
require their own deterministic design and shadow evidence; CI-B7 requires an
explicitly authorized workflow or branch-protection activation decision; CI-B8
requires a declared observation window and measured reconciliation.

The request to begin REL-00 does not re-open deferred Milestone B runtime
work, staging, protected material, privileged identity, provider, broker,
deployment or production activity. It also does not itself change any CI policy
or control.

## CI-B0 completion criteria

- The protected-main revision, Ready and exact-main evidence above are captured
  in the adjacent machine-readable baseline.
- The six-shard names, Draft behavior, Ready/main triggers, strict aggregate
  and provenance jobs are verified unchanged by focused local contracts.
- The master roadmap and current-state ledger state the admission result without
  turning the qualified Milestone B closeout into live-runtime completion.
- No workflow, required-check, branch-protection or external-system change is
  included in this slice.

## Future boundary

A future, separately authorized decision is required before CI-B7 can alter a
workflow, required check or branch-protection rule. CI-B8 can complete only
after a declared observation window produces measurable runner-minute,
wait-time and escaped-defect evidence. Any ambiguous change must escalate, and
Ready/main Full CI must remain the unchanged six-shard safety gate unless a
separate policy explicitly changes that constraint with equivalent or stronger
independently verified evidence.
