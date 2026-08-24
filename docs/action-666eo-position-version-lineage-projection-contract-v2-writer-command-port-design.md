# Action 666EO — Position-version lineage projection-contract v2 writer command-port design

## Decision

Action 666EO closes the source-only
`position_version_lineage_projection_contract_v2_writer_command_port_design`
objective after Action 666EN's green protected-main delivery. It freezes the
minimum private command-port design for a future v2 position writer without
implementing, binding or invoking it.

The future port obtains the owner only from an authenticated server context and
passes that context to a service-role-only `SECURITY DEFINER` routine with a
fixed search path. That routine locks the requested recommendation in the same
owner scope before it derives any position lineage. A caller cannot supply,
replace or select the authoritative recommendation version, identity, normative
digest or projection-contract marker.

## Required v2 transaction shape

The future routine must lock the owner-scoped recommendation with `FOR UPDATE`
and require this complete tuple before any durable position effect:

- `recommendation_version`
- `recommendation_identity`
- `recommendation_normative_digest`
- `recommendation_projection_contract`, exactly
  `legacy_recommendation_normative_projection_v2`

An all-NULL legacy tuple, a partial tuple, a different marker or an owner
mismatch is refused. The routine must not infer values, upgrade a row or run a
backfill as a side effect.

In one private transaction, the routine must derive the complete v2 tuple from
that locked source; insert the position with `position_version = 1`; and append
its initial owner-scoped position-version-history row. It returns `created`
only after the transaction commits. An exception rolls the entire effect back,
including the current position and its history; no partial position, orphaned
history or visible pre-commit success is allowed.

## Retry and authority rules

The future idempotency record must bind the server owner, recommendation id,
recommendation version, identity, normative digest, marker, position identity
and canonical command digest. An exact retry replays the original committed
result. A missing, partial or different binding returns a conflict or refusal;
it may not create another position.

The existing v1 private adapter remains a non-v2, injected boundary. This
design neither changes its route surface nor grants it v2 writer authority.
Concrete SQL/RPC bytes, grants, RLS, migrations, generated types, runtime
wiring, deploys, database calls, provider calls and broker calls are explicitly
outside this action.

## Closed authority and next bounded objective

Action 666EO is a design receipt, not a writer admission. It authorizes no
production change, row read or write, backfill, routine creation or runtime
activation. The next bounded objective is
`position_version_lineage_projection_contract_v2_writer_command_port_admission_preflight`:
an independently reviewed, read-only check of whether a concrete private port
can be introduced. It may not apply DDL/DML, bind the writer or target
production.
