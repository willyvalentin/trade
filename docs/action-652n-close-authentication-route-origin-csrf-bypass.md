# Action 652N - Close Authentication Route Origin/CSRF Bypass

**Status: local remediation pending validation and separate delivery approval.**

## Scope

`/api/auth/login` and `/api/auth/logout` remain public in the Proxy only because
login has no existing session and logout must remain safe for expired sessions.
They are no longer exempt from browser-mutation origin validation: each `POST`
uses the same pure authentication-origin guard before route-specific work.

## Contract

In production, the route requires `Origin` to be one strict absolute origin
equal to `TURE_APPLICATION_ORIGIN`. The configured value must itself be a
canonical HTTPS origin. Missing, `null`, malformed, path/query/fragment-bearing,
credential-bearing, multi-origin, cross-scheme, cross-host, and cross-port
values fail closed. Preview, branch, and unobserved production contexts fail
closed. Missing or malformed production configuration returns a deterministic
redacted `503`; rejected origins return deterministic JSON `403` responses.

Local development is explicit rather than permissive: the supplied origin must
exactly equal the request URL origin. It does not accept arbitrary origins.

The response never echoes the supplied origin, host, session cookie, password,
or configuration value.

## Execution Order

The login route checks deployment context, canonical origin configuration, and
the supplied browser origin before reading the application password, reserving a
shared limiter slot, parsing credentials, or creating a session. Therefore a
rejected request cannot increment abuse-control state or perform password
verification. Logout performs the same guard before issuing its clearing cookie,
so a rejected request leaves the browser session unchanged. Logout remains POST
only and returns JSON, including when there is no valid session.

## Evidence

Focused tests cover production and local origin matrices, context denial,
deterministic redacted response categories, direct logout behavior, cookie
non-mutation on rejection, and source ordering for the login guard. Existing
session, limiter, Proxy, runtime-proof, and authenticated mutation tests remain
the surrounding regression coverage.

## No-Effect Boundary

This Action adds no migration, provider or broker interaction, deployment,
environment change, production database access, schedule, or credential
configuration. The auth routes are still session-exempt in Proxy, but route-level
origin enforcement is now their canonical CSRF boundary.
