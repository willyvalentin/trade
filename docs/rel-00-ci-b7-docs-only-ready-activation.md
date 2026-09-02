# REL-00 CI-B7 — bounded docs-only Ready activation

## Authorized scope

CI-B7 activates only a strict Tier-1 route for a **Ready** pull request whose
merge candidate changes plain documentation and nothing else. It does not
activate Draft routing, test-only routing, a runtime route, Netlify, a
provider, a broker, a deployment, a secret or branch-protection change.

The protected required check remains named `provider-free-verification` and
branch protection is unchanged. Every push to `main`, including every merged
docs-only pull request, still executes the existing six Full-CI shards:
`foundation`, `replay-lineage`, `snapshot-admission`, `snapshot-issuance`,
`non-forgeable-authority`, and `lossless-scalar`. There is no Ready/main
deduplication.

## Fail-closed admission

The Ready classifier checks out GitHub's exact merge candidate and accepts
only a nonempty NUL-safe `git diff` set in which every record is an added or
modified regular (`100644`) prose file under `docs/`. It excludes `docs/evidence/`,
`docs/ture-*`, and `docs/rel-00-*`; only `md`, `mdx`, `rst`, `adoc`, and `txt`
suffixes are eligible. It rejects deletions, renames, copies, executable or
nonregular modes, binary numstat output, malformed paths, missing revisions,
ambiguous Git output, whitespace errors and static references outside `docs/`.

Any uncertainty emits `full`, so all six Ready Full-CI shards run. An
unavailable or failed classifier also resolves to that full path rather than a
docs-only result. The activation PR changes workflow and control paths and
therefore also receives the ordinary full Ready suite.

The merge-candidate provenance POC still captures only Ready runs that
executed the unchanged six-shard suite. For a successfully admitted docs-only
Ready run it is intentionally skipped; the exact-main POC still runs after its
unchanged six-shard verification and records the missing candidate artifact as
uncertain rather than treating it as an equivalence or a cost-saving proof.

## CI-B8 observation boundary

The real observation starts only after this activation is merged. CI-B8 may
make no keep/adjust/rollback decision before both conditions are met:

1. 14 calendar days have elapsed; and
2. at least 10 eligible merged plain-documentation pull requests have been
   observed.

For each eligible pull request, the record must retain its classification
disposition, Ready job outcomes and runner time, exact-main six-shard outcome
and runner time, queue/wait data when available, and any escaped defect or
rollback. A classifier uncertainty, Ready aggregate failure, exact-main
failure, defect, workflow drift or branch-protection drift is fail-closed and
requires the full path or an explicit rollback decision. No observation entry
authorizes runtime, provider, broker, deployment or production activity.
