# Action 666JB — B-03 private-transport path decision

## Decision

Ture retains the literal private-transport requirement for the future B-03
remote writer proof. It does not reinterpret TLS, a direct public database
host, or IP allowlisting as private application transport.

The selected future architecture is Supabase PrivateLink backed by an AWS VPC
in the same region as `ture-staging`. Supabase documents that path as requiring
a Team or Enterprise subscription together with a same-region AWS VPC and a
PrivateLink or VPC-Lattice endpoint. This is the only reviewed path that meets
the existing literal-private-transport requirement without weakening it.

```text
action_or_decision_id: ACTION_666JB / B03_PRIVATE_TRANSPORT_PATH_DECISION
selected_runtime_requirement: literal_private_database_transport
selected_future_architecture: Supabase_PrivateLink_plus_same_region_AWS_VPC
provisioning_state: deferred_pending_external_subscription_and_AWS_provisioning
remote_staging_admission: not_admitted
```

## Why this is the smallest safe decision

Action 666IZ proved only a public direct-port preflight and stopped before an
authenticated session. The current Pro subscription cannot enable Supabase
PrivateLink. Network Restrictions are public-IP allowlisting, not a routing
change. Treating either control as private transport would make the B-03
rollback proof claim more than its evidence establishes.

The alternative of relaxing the requirement is rejected for this roadmap
state. That would change the approved security property rather than implement
it, and must not be inferred from an implementation constraint.

## Deferred external work

This decision intentionally does **not** purchase or upgrade a Supabase plan,
create an AWS account, VPC, endpoint or private DNS record, change a Supabase
or Netlify setting, create or expose a secret, contact a database, deploy a
function, invoke the writer, or alter production or broker behaviour. Those
are external and potentially billable actions and remain outside this
repository decision.

When the selected infrastructure is explicitly provisioned, a new narrow
staging-only admission must first verify the non-public path without sending a
credential. Only after that evidence may another separately reviewed operation
use one secret-safe server caller to make exactly one dedicated-principal
writer call in an unconditional rollback transaction, followed by an
independent zero-row readback. No previous proof, token, fixture or credential
may be reused.

## Status and authority

This is a roadmap decision, not an implementation or an admission. B-03 stays
`not_admitted`, Milestone B remains complete only under
`milestone_b_local_sandbox_acceptance_profile_v1`, and B-01 plus B-05 through
B-12 remain deferred runtime work. No runtime, deployment, provider, broker
or production authority follows.

Provider references: [Supabase PrivateLink](https://supabase.com/docs/guides/platform/privatelink)
and [Supabase Network Restrictions](https://supabase.com/docs/guides/platform/network-restrictions).
