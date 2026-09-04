# B-03 — Staging-admission attestation candidate

This source-only contract turns the five blocked B-03 remote-admission inputs
into an exact, value-free candidate shape. It is a preparation artifact for a
future independent review, not an attestation, connection, credential source
or runtime admission.

## Accepted input

The candidate requires exactly these opaque-reference fields:

1. a staging scope reference;
2. a staging principal reference;
3. a protected-material provenance reference;
4. a writer grant-matrix reference;
5. private transport criteria and a rollback/containment-plan reference.

Every reference has a fixed field prefix followed by an opaque `ref_` token.
URLs, secret values, connection strings, environment variable names and raw
grant or transport contents are not accepted. `target_environment` is exactly
`staging`; production is rejected.

## Default-deny result

Even a valid candidate always returns:

- `remote_staging_admission: not_admitted`;
- `review_status: candidate_requires_independent_review`; and
- `not_authorized` for remote connection, writer invocation, runtime binding
  and production.

The module imports `server-only` and has no Supabase client, network request,
environment lookup, route, UI, transport, writer, secret or deployment code.
It cannot itself satisfy the B-03 remote-admission prerequisites.

## Next evidence gate

An independently supplied non-secret attestation must still be reviewed
against the exact staging scope before any separate decision may consider a
connection-admission slice. That later decision requires its own authority and
does not follow automatically from this candidate contract.
