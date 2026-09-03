# Action 666JA — B-03 private PostgreSQL transport

## Bounded objective

Add the previously selected server-only PostgreSQL transport for the frozen V2
writer routine. The transport has no route, UI, queue, deployment, provider,
or broker binding.

## Containment

The transport reads only the non-public server variable
`TURE_POSITION_VERSION_LINEAGE_V2_WRITER_POSTGRES_URL` at invocation time. It
fails before constructing a client unless the value names the staging writer
role, targets exactly `ture-staging`'s direct PostgreSQL host, port and
database, and requires verified TLS. It rejects the Trade production host,
pooler ports and alternate database paths before a client can be constructed.
The implementation does not store, log, export, or commit a value for that
variable.

It permits only the literal parameterized invocation of
`private.write_owner_bound_recommendation_position_v2(uuid,uuid,text)`. It
recomputes the canonical command digest, requires one result row, decodes the
frozen result shape, returns a new immutable receipt, and closes its short-lived
client even when the database result is rejected.

## Approved staging exercise and rollback

The separately approved 3 September 2026 staging exercise temporarily enabled
LOGIN for `ture_staging_b03_writer`, granted only `USAGE` on the private schema
and `EXECUTE` on the one frozen writer routine, and created protected,
branch-deploy scoped connection and project-CA values. The transport requires
the CA value and keeps hostname-verifying TLS enabled; it does not weaken TLS
to accommodate the project certificate chain.

The isolated transport connected to staging, invoked exactly
`private.write_owner_bound_recommendation_position_v2(uuid,uuid,text)` for a
fresh synthetic owner and recommendation, and received one `created` receipt
with position version `1`. The invocation ran inside a client-owned
transaction that executed `ROLLBACK` before the client closed. It therefore
proved authenticated writer reachability and result decoding without leaving a
position, history, idempotency receipt, recommendation state change, or other
writer effect behind.

Both branch-deploy values were removed after the test; the role is again
`NOLOGIN` with neither private-schema usage nor writer execution. The
synthetic user, recommendation, position, history, and idempotency counts were
all verified as zero. The temporary IPv4 add-on was enabled only long enough
to perform this direct-connection proof and was then disabled again.

Netlify completed the normal PR preview for this branch. It did not invoke the
transport because the source delivery has no runtime caller, and no production
deployment was triggered.

## Closed authority

This source delivery has no runtime caller, route, UI, queue, deployment,
provider, or broker binding. The approved exercise did not change branch
protection, deploy an application, target production, or contact a provider or
broker. Its local verification uses an injected fake client only.

## Closed staging proof

This completes the approved staging-login, least-privileged identity, private
transport, writer-invocation, and rollback evidence for B-03. It grants no
production, route, UI, queue, provider, or broker authority.

## R-01 source hardening

The R-01 staging-runtime-admission baseline further narrows this existing,
unwired transport to the one direct `ture-staging` PostgreSQL endpoint. Its
target tests prove that a production-project host, a pooler port or an
alternate database path fails before client construction. This is source-only
hardening: it creates or reads no secret, changes no database identity or
grant, opens no connection, invokes no writer and triggers no deployment.

R-01 also adds an unwired server-only owner-context resolver. It accepts no
client-projected owner; when a later action explicitly admits a consumer, that
consumer must obtain the owner only from the existing verified application
session. The resolver is not imported by any route, UI or writer adapter in
this delivery, so it performs no session, identity-provider or database call.
