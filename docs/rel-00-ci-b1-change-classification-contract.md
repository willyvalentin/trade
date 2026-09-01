# REL-00 CI-B1 — fail-closed change-classification taxonomy

## Bounded objective

CI-B1 freezes the source-only vocabulary and adversarial fixtures for a future
risk-based CI selector. It adds a pure parser and classifier that is imported
only by its contract test and CI-B2's named source-only acquisition contract.
It does not read Git state, the filesystem, environment variables, a network,
credentials, a provider, a broker or any runtime service.

The classifier is not connected to the Draft selector or the Ready/main CI
path. Its results are evidence for CI-B2 design only; they cannot execute a
test plan, decide mergeability, alter required checks, change a workflow, or
grant deployment, staging, runtime or production authority.

## Baseline retained

CI-B0's protected-main merge is
`8127c4d294a36d0e442fa1b10df451f15cdf0c28`, with tree
`399b03831c5a2de9c5121e29603e6aeb79747505`. Exact-main run `33535472128`
passed the same six Full-CI shards, strict `provider-free-verification`, and
the post-merge provenance POC. That POC reported `matched` with no
mismatches. CI-B1 leaves that workflow and its six-shard topology unchanged.

## Fail-closed taxonomy

| Taxonomy tier | CI-B1 meaning | Operational disposition in CI-B1 |
| --- | --- | --- |
| Tier 1 | Candidate only: an added or modified documentation file with an allowlisted prose suffix may later qualify only after regular-file mode (`100644`), text content and reference absence are independently verified. | Never activated; effective Tier 3. |
| Tier 2 | Candidate only: a registered test may later qualify only with regular-file/text/reference verification, a verified import graph and a fixed owned-test mapping. | Never activated; effective Tier 3. |
| Tier 3 | Required for every control, runtime, external/data, ambiguous, deleted, renamed, copied, type-changed or metadata-insufficient record. | Manual review or broad containment. |

The parser accepts only NUL-terminated normalized `git diff --name-status -z`
records. It handles both paths of renames and copies. It rejects malformed,
truncated, non-UTF-8, absolute, traversal and otherwise ambiguous records;
nothing may be silently dropped. The parser itself does not run Git. CI-B2,
if admitted later, must acquire raw bytes separately and treat every parser
failure as a broad-containment or stop condition.

Every parser-projected record sets `metadata_verified`, `reference_verified`,
`import_graph_verified` and `owned_test_mapping_verified` to `false`.
Any later, separately admitted activation consumer would need independent proof
before it could treat a caller-supplied `true` flag as authoritative. CI-B1
itself treats every result as non-operational: even a fully supplied candidate
record remains effective Tier 3 and cannot activate a fast path. Consequently
raw name-status output cannot qualify for a candidate tier, and rename/copy or
non-regular-mode input is broad containment.
Contradictory added/deleted path-mode pairs are rejected: an added record has
no old path or old mode, while a deleted record has no new path or new mode.
ASCII and C1 control-character paths remain parseable under the NUL-safe
format but are always broad-containment input; they cannot qualify for a
candidate tier.

File suffixes are not authority. In particular, a `.txt` file under `public/`
is a public runtime asset, not documentation; a source-code suffix under
`docs/` is not allowlisted prose; and executable or non-regular file modes
are broad-containment input. `docs/evidence/`, roadmap and ledger material are
control evidence, not fast-path material. No CI-B1 record can become fast-path
eligible because name-status data cannot prove ordinary text content, a
regular-file mode, reference absence, an import graph, or lack of runtime
impact.

## Preserved authority boundary

CI-B1 does not change `.github/workflows/milestone-a-ci.yml`,
`action-660k-run-draft-ci.mjs`, job names, matrix membership, the strict
aggregate, branch protection or required checks. Ready pull requests and
`main` still require exactly these six shards:

1. `foundation`
2. `replay-lineage`
3. `snapshot-admission`
4. `snapshot-issuance`
5. `non-forgeable-authority`
6. `lossless-scalar`

The implementation is deliberately unactivated. Any later CI-policy change
remains reserved for the separately authorized CI-B7 decision, while REL-00
as a whole remains incomplete until CI-B8's declared observation window has
measured runner minutes, wait time and escaped defects.
