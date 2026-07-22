# Action 591 - Runtime Deployment Identity Configuration and Verification

## Purpose

Provide the canonical manual-authorization and manual-execution routes with one non-secret, revision-bound deployment identity without depending on Netlify build-only identifiers at request time.

## Runtime Contract

`TURE_CONTINUOUS_INTELLIGENCE_DEPLOYMENT_COMMIT` is the explicit production runtime variable. It must be the full, lowercase 40-character Git commit SHA for the deployed production revision. The server-only resolver rejects missing, malformed, or non-canonical values, then falls back to `COMMIT_REF` and `NETLIFY_COMMIT_REF` only when either also satisfies that exact SHA contract.

The resolved identity is used by the shared server-side manual authorization context, so issuance and canonical manual execution bind to the same revision identity. The value is non-secret, bounded, and is never returned by the public readiness response.

## Production Configuration Plan

The authoritative production deployment revision is `5e58bfffa7a0d35f15744e7f2839da979bda129c`. Configure the explicit runtime variable to that value for the production runtime, deploy the code that reads it, then perform one authenticated GET-only issuance-readiness verification.

## Safety Boundaries

This action does not issue or consume an authorization or lease; invoke manual execution; call a provider; create a claim; write audit or ledger records; alter canary or kill-switch defaults; or activate a schedule.
