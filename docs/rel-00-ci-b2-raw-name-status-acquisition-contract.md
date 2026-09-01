# REL-00 CI-B2 — fail-closed raw name-status acquisition

## Bounded objective

CI-B2 adds an unactivated, read-only seam that can acquire the raw bytes of an
exact-revision `git diff --name-status -z`. It binds an explicitly supplied
base commit and expected commit to one verified merge base, preserves a digest
and byte length, and passes the bytes to CI-B1's parser only to prove that the
result stays effective Tier 3. It emits no test command, selector result,
mergeability decision, workflow input or runtime capability.

The module is not imported by the Draft selector, the Ready/main workflow, a
route, a build, or an executor. A direct caller can obtain only an ephemeral
source-level observation; every result has `fast_path_eligible: false`,
`activation_eligible: false`, `selector_connected: false`,
`execution_plan_emitted: false`, and `mergeability_decision: false`.

## Verified baseline

CI-B1 merged as PR #291 commit
`7ca4543c3c4eea5503f047d1df4865e29b8b9ee2`, whose tree is
`b122ec34ff947ceabcd5957a52e7049b624961eb`. Its Ready Full CI run
`33542525164` and exact-main run `33545954916` passed the unchanged six
shards and strict `provider-free-verification` aggregate. The exact-main
post-merge POC reported `matched` with no mismatches.

CI-B2 neither changes nor relaxes `.github/workflows/milestone-a-ci.yml`,
`scripts/action-660k-run-draft-ci.mjs`, the six Full-CI shard names, the strict
aggregate, required checks, branch protection, concurrency controls, Netlify,
or CI deduplication. It grants no staging, secret, identity, transport,
provider, broker, deployment or production authority.

## Exact acquisition protocol

Inputs must be two canonical immutable commit OIDs: exactly 40 lowercase hex
characters each. Getter, Proxy or runner-result access failures fail closed.
There are no refs, `HEAD`, working-tree paths, index paths, diff filters,
caller-selected commands or shell strings. From the fixed repository root
relative to this module, the adapter invokes trusted `/usr/bin/git` with a
newly constructed environment rather than inherited process state: it omits
ambient `GIT_*` redirection/configuration variables, disables system/global
Git configuration and prompts, normalizes locale and disallows optional locks.
The adapter invokes only these shell-free Git argument vectors:

1. `git --no-pager --no-replace-objects rev-parse --verify --quiet <revision>^{commit}` for each input and the derived merge base.
2. `git --no-pager --no-replace-objects merge-base --all <base> <expected>`.
3. `git --no-pager --no-replace-objects diff --no-ext-diff --no-textconv --no-renames --name-status -z <merge-base> <expected> --`.

The single merge base must itself be a canonical commit OID. `--all` rejects a
multiple-base ambiguity, and `--no-renames` prevents local configuration from
turning an add/delete pair into an under-specified rename or copy. The raw
diff is held as bytes: it is never decoded before CI-B1, trimmed, line split,
Unicode-normalized, case folded, filtered, or replaced by a `--name-only`
fallback. The observation exposes a new detached byte copy on each read, so
caller mutation cannot change the retained digest or parsed records.

The adapter caps stdout at 1 MiB. A spawn error, signal, timeout, nonzero
exit, unexpected result type, stdout that is not bytes, output cap breach,
unresolved revision, ambiguous merge base, empty stream, missing terminal NUL
or CI-B1 parser/classification failure returns `broad_containment_required`.
No partial bytes or optimistic empty change set are returned. Valid raw bytes retain all CI-B1
verification flags as `false`, including `metadata_verified`,
`reference_verified`, `import_graph_verified` and
`owned_test_mapping_verified`.

## Deliberate non-activation

Name-status output cannot prove file mode, content kind, references, import
reachability or an owned-test mapping. CI-B2 therefore forces every acquired
result to the effective Tier-3/broad-containment disposition even when the
CI-B1 parser recognizes a path. It records only exact revision identity, raw
byte length and SHA-256 digest, plus the ephemeral parsed records needed for
the source-only contract test. It does not serialize a PR artifact, compare
the legacy Draft selector, infer an affected-test plan or make a CI policy
recommendation.

CI-B3 may consume this closed observation only to create an unactivated shadow
reconciliation receipt. CI-B7 remains the separately authorized decision
point for any selector, workflow, required-check or branch-protection change,
and CI-B8 still needs its declared real observation window.
