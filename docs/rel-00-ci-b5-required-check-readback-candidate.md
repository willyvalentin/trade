# REL-00 CI-B5 - source-only required-check readback candidate

## Bounded objective

CI-B5 adds a pure validator for static candidate JSON that could later be used
by an independently authorized, least-privileged reader. Its module boundary
accepts only strict JSON text of at most 65,536 characters: it rejects every
object before reflecting over, enumerating or reading any of its properties.
That makes getters and Proxy traps inert at the module boundary. CI-B5 does
not perform a readback, invoke a reader, contact GitHub, receive a raw API
response, use credentials, or change any external state.

Its only positive result, shadow_readback_shape_valid, says that the proposed
future shape still matches the frozen CI-B4 proof contract. It does not say
that GitHub policy, checks, branch protection, workflow state or CI status is
currently verified. The result remains Tier 3 broad containment and requires
manual review.

## Frozen CI-B4 binding

The candidate requires CI-B4's complete static proof contract, including
willyvalentin/trade main, the unchanged workflow path, SHA-256 and blob,
GitHub Actions aggregate provider-free-verification, all six Full-CI shards,
the complete branch-protection profile, and the ordered GET-only before/after
readback protocol.

The future observation shape also binds the Ready PR, base and head SHAs,
merge candidate SHA/tree/ordered parents, workflow blob, run and attempt,
check-suite and job identifiers, artifact identity and digest. It accepts only
completed-success checks, complete pagination and empty rulesets. No raw API
body, headers, token, cookie, credential, URL or archive bytes are accepted or
returned.

## Declarative rollback boundary

The candidate is unactivated and not connected. Its only declarative rollback
is discard_unexecuted_candidate_and_require_fresh_readback. That step is one
static discard of a not-yet-executed candidate, not a GitHub mutation or claim
that an external rollback happened. It preserves the current Ready/main
six-shard Full CI, protected aggregate, required check and branch-protection
profile; CI deduplication remains unauthorized.

Every non-string, malformed, oversized, incomplete, hostile or changed input
returns broad containment with no partial proof binding, readback shape or
rollback data. The module has no GitHub client, Git, filesystem, process,
environment, network, selector, workflow, required-check, branch-protection,
deployment or runtime behavior.

## Deliberate non-activation

CI-B5 does not alter .github/workflows, the Draft selector, the six-shard
matrix, protected aggregate, required-check names, branch protection, Netlify
or runtime behavior. A real Administration:read observation remains separately
authorized work, CI-B7 remains the separate CI-policy decision point, and
CI-B8 still requires a declared real observation window.
