# Action 652G - Shared Login Abuse Control And Production Origin Readiness

**Status: locally implemented; production configuration intentionally unchanged.**

## Threat Model

The application uses a single trusted-operator password. Process-local rate
limits cannot protect multiple serverless instances, so password failures must
be admitted by a shared, atomic server-side control before session creation.
Cross-origin browser mutations must also fail before a protected route reaches
its service boundary.

## Selected Model

The primary production limiter is the Action 652G Supabase migration:

- `application_login_abuse_buckets` stores only a global key or a SHA-256
  client-identity digest key;
- `app_login_abuse_reserve` atomically reserves a global and optional client
  attempt under advisory locks;
- `app_login_abuse_finalize_success` releases one reservation after a valid
  password; and
- only `service_role` may access the table or RPCs.

The policy is five attempts per identity and 100 globally per fifteen-minute
window. A limit returns deterministic `429` with `Retry-After`. Expired rows
are reset on use and bounded cleanup removes stale records. Missing RPC/table/
service-role availability returns `503`; production never downgrades to local
memory.

The process-local limiter is retained only for non-production development and
test ergonomics. It is not evidence of cross-instance protection.

## Client Identity

Production accepts only the Netlify connection-IP header
`x-nf-client-connection-ip`, normalized as a single valid IPv4 or IPv6 value.
`X-Forwarded-For` is deliberately ignored because callers can spoof it. A
missing trusted identity still reserves the coarse global bucket, without
storing a client bucket. The database receives only a SHA-256 digest, never a
raw address.

Before rollout, Netlify must be verified to provide that header at the Next.js
login route. If the deployment boundary changes, the resolver must be reviewed
before production use.

## Origin Contract

`TURE_APPLICATION_ORIGIN` is a required production configuration value. It must
be exactly one canonical HTTPS origin: no path, query, fragment, credentials,
whitespace, wildcard, or alternate host. Protected unsafe requests require both
the request URL origin and `Origin` header to equal it. Configuration failure
returns a deterministic unavailable result. The readiness helper reports only:

- `configured`
- `valid`
- `expected_host_match`

No environment value is emitted.

## Required Production Configuration

1. Apply `20260724001600_create_shared_login_abuse_control.sql` after
   Action 652's `20260724001500` and before Action 650's `20260724002000`.
2. Confirm both RPCs are visible to service role and denied to PUBLIC, anon,
   and authenticated.
3. Set the single canonical `TURE_APPLICATION_ORIGIN` value.
4. Verify Netlify supplies the trusted connection-IP header at login.
5. Deploy Action 652 and verify good login, bad-password throttling across
   instances, same-origin mutation, and cross-origin denial.
6. Only then merge/apply Action 650 and verify its 19-table role matrix.
7. Run an independent combined security review before revisiting canary work.

If the migration exists without the app deploy, no route behavior changes. If
the app deploys without the migration or service-role access, login fails closed.
If origin configuration is invalid, unsafe session mutations fail closed. The
safe recovery is a forward configuration or deployment fix; restoring anonymous
database access is forbidden.

This action does not touch production, deploy, configure Netlify, apply a
migration remotely, call providers or brokers, or create a canary attempt.
