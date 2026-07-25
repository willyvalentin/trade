# Action 652QD: Replace Runtime CONTEXT Guard With Canonical URL Guard

## Status

`action_652qd_origin_guard_fix_ready`

## Root Cause

The production authentication and mutation guard previously treated
`process.env.CONTEXT === "production"` as its runtime deployment identity.
Netlify documents `CONTEXT` as build metadata, not a serverless-function runtime
contract. In production, the missing value caused the guard to reject a valid
same-origin login before password comparison, shared-limiter admission, session
creation, or cookie issuance.

## Trust Model

Production unsafe application requests now require all of the following after
safe URL parsing and origin normalization:

1. `TURE_APPLICATION_ORIGIN` is present, HTTPS, and normalizes to Ture's
   canonical production origin.
2. Netlify's documented runtime `URL` is present, HTTPS, and normalizes to the
   same canonical origin.
3. The request `Origin` normalizes to that same canonical origin.

The guard never trusts `CONTEXT`, `DEPLOY_CONTEXT`, Host, Referer, or forwarded
headers for this decision. URL path, query, fragment, and a trailing slash do
not change an origin comparison. Credentials, malformed URLs, missing values,
wrong schemes, wrong ports, the Netlify default domain, and preview domains all
fail closed.

## Shared Boundaries

The shared guard protects the login route, logout route, and authenticated
application mutation routes. Scheduled and automation routes retain their
separate scheduler authentication contracts.

## Regression Coverage

Focused coverage proves canonical production acceptance and rejection of:

- missing or malformed configured origin, runtime URL, or request Origin;
- Netlify default and preview runtime URLs;
- wrong request or runtime scheme and port;
- old `CONTEXT=production` paired with a wrong runtime URL;
- absent `CONTEXT` paired with the correct runtime URL;
- shared protected mutation behavior; and
- normalization of safe URL decoration and host case.

## Production Gate

This change requires a normal Git-based production deploy with the existing
production-only `TURE_APPLICATION_ORIGIN` value. After deployment, one separately
authorized same-origin login retry may verify the bounded session contract. This
Action performs neither the deploy nor the retry.

Action 02000 remains out of scope and PR #44 is unchanged.
