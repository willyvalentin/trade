# REL-00 CI-B7 proof candidate

This is an inert, documentation-only marker for a fresh CI-B7 GET-only
readback candidate.

It changes no workflow, CI selector, six-shard matrix, required check, branch
protection, Netlify configuration, runtime, provider, broker, deployment or
production behavior. It contains no credential, API response, policy assertion
or activation decision.

The pull request remains open after Ready Full CI succeeds so the independently
authorized readback can bind its exact head, GitHub merge candidate and
unchanged CI provenance. If any binding is missing or drifts, the readback
fails closed and this pull request is not merged through CI-B7.
