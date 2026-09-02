# REL-00 CI-B6 - adversarial readback-candidate verification

## Bounded objective

CI-B6 is a source-only adversarial verification layer around the CI-B5
readback-candidate validator. It uses only frozen CI-B4 and CI-B5 fixtures and
does not authenticate, read GitHub state, invoke a reader, use a credential,
contact a provider, change CI policy, or change runtime state.

The sole positive control remains a detached
shadow_readback_shape_valid candidate. It remains Tier 3 broad containment,
requires manual review, is unactivated and cannot decide mergeability or emit
an execution plan.

## Fail-closed adversarial surface

The verification rejects drift in the frozen repository, branch, workflow,
aggregate app binding, ordered six-shard profile, branch-protection profile and
GET-only protocol. It also rejects readback shape, identity binding, pagination,
ruleset, raw-response, mutation, authority and rollback escalation.

It verifies that malformed, oversized, extra, missing, accessor-backed, Proxy,
symbol-coercing, revoked and nested hostile inputs return only frozen broad
containment with no partial proof, readback or rollback binding.

CI-B6 additionally requires duplicate semantic object-key rejection before
candidate JSON is parsed. This prevents an earlier unsafe key from being hidden
by a later safe key through ordinary JSON last-key-wins behavior. A valid
65,536-character serialized candidate remains accepted; one character above
the limit is rejected.

## Deliberate non-activation

CI-B6 adds exactly one test to the pre-existing foundation shard. It does not
alter the workflow, Draft selector, six-shard matrix, protected aggregate,
required check, branch protection, Netlify configuration or CI deduplication.

CI-B7 remains a separately authorized CI-policy decision. CI-B8 still requires
a declared real observation window; neither can be inferred from this static
test coverage.
