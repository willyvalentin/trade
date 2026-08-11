# ACTION 652 — generated-types provenance V1

This historical package pins the previously accepted Supabase V5
type-generation evidence to repository source. It binds the exact project,
read-only authority, schema, CLI version, generation command, source receipt,
validator, registry and generated output bytes. After MA05 changed the public
schema, the exact V1 output bytes were archived beside this manifest as
`supabase-database.types.v1.ts`; the canonical application target is now bound
by the successor V2 package.

The executable oracle is
`tests/e2e/action-652-generated-types-provenance-v1.spec.mjs`. It is
provider-free and fails closed on command, project, schema, source-file,
generated-output, receipt, reconciliation-base or gate-arithmetic drift.

The package does not contact Supabase, regenerate types, apply migrations,
verify RLS behavior, establish tenant ownership, deploy the application or
grant runtime/write authority.

This package is historical and superseded. It does not establish current
MA-09 parity.
