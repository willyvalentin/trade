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

## Approved staging exercise and rollback

The separately approved 3 September 2026 staging exercise temporarily enabled
LOGIN for `ture_staging_b03_writer` and created the protected, branch-deploy
scoped `TURE_POSITION_VERSION_LINEAGE_V2_WRITER_POSTGRES_URL` secret. Both
were removed after the test; the role is again `NOLOGIN`, and all synthetic
owner, recommendation, position, history, and idempotency records were
verified absent.

The isolated runtime probe reached neither an authenticated database session
nor the writer routine: its redacted result was a pre-connection
`network_or_tls` failure from this workstation. This is not treated as a
successful writer invocation, replay, rejection, or database rollback proof.

Netlify completed the normal PR preview for this branch. It did not invoke the
transport because the source delivery has no runtime caller, and no production
deployment was triggered.

## Closed authority

This source delivery has no runtime caller, route, UI, queue, deployment,
provider, or broker binding. The approved exercise did not change branch
protection, deploy an application, target production, or contact a provider or
broker. Its local verification uses an injected fake client only.

## Remaining staging proof

Completing a live writer invocation requires separately approved execution
from an environment with direct, verified-TLS reachability to staging
PostgreSQL. That future proof must again use a temporary branch-deploy scoped
secret and least-privileged login identity, then revoke both and verify the
rollback. No production scope is implied.
