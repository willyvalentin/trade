# ACTION 652 — generated-types provenance V1

This package pins the previously accepted Supabase V5 type-generation evidence
to repository source. It binds the exact project, read-only authority, schema,
CLI version, generation command, source receipt, validator, registry and
generated output bytes.

The executable oracle is
`tests/e2e/action-652-generated-types-provenance-v1.spec.mjs`. It is
provider-free and fails closed on command, project, schema, source-file,
generated-output, receipt, reconciliation-base or gate-arithmetic drift.

The package does not contact Supabase, regenerate types, apply migrations,
verify RLS behavior, establish tenant ownership, deploy the application or
grant runtime/write authority.

MA-09 remains a delivery candidate until independent review, exact-scope
merge, main reachability and exact-main CI have all succeeded.
