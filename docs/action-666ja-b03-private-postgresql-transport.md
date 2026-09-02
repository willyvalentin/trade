# Action 666JA — B-03 private PostgreSQL transport

## Bounded objective

Add the previously selected server-only PostgreSQL transport for the frozen V2
writer routine. The transport has no route, UI, queue, deployment, provider,
or broker binding.

## Containment

The transport reads only the non-public server variable
`TURE_POSITION_VERSION_LINEAGE_V2_WRITER_POSTGRES_URL` at invocation time. It
fails before constructing a client unless the value names the staging writer
role, targets a Supabase host, and requires verified TLS. The implementation
does not store, log, export, or commit a value for that variable.

It permits only the literal parameterized invocation of
`private.write_owner_bound_recommendation_position_v2(uuid,uuid,text)`. It
recomputes the canonical command digest, requires one result row, decodes the
frozen result shape, returns a new immutable receipt, and closes its short-lived
client even when the database result is rejected.

## Closed authority

This source delivery does not create a Netlify variable, enable LOGIN on the
staging role, create a database connection, invoke the writer against staging,
bind a runtime caller, deploy, alter branch protection, or contact a provider
or broker. Its local verification uses an injected fake client only.

## Remaining staging proof

The next separately approved operation must create a protected, branch-deploy
scoped staging connection secret and make the dedicated `ture_staging_b03_writer`
role able to log in. Only then can a synthetic create/replay/rejection/rollback
proof run through this transport. No production scope is implied.
