# Action 660 MA09 — generated-types provenance V2

This package binds Ture's post-MA05 generated TypeScript types to an exact
Supabase provider response without changing the database.

## Provider-bound execution

provider-execution-envelope-v2.json records three project-scoped Supabase
Management API operations:

1. project lookup for ekdyopdrrkphlrsilyoo;
2. execution of the committed catalog query against that exact project; and
3. TypeScript generation for that exact project.

The corresponding project, catalog and type-generation responses are frozen
as repository artifacts and hashed by the executable oracle. The project
response identifies Trade in Valentin Labs. The catalog request binds the
requested project, exact query digest and raw database response digest. The
SQL response itself does not assert a project label.

## Exact generated-output parity

provider-typegen-response-v2.json is the archived provider generation
response. Its types value is extracted byte-for-byte to
provider-typescript-response-v2.ts. The oracle requires those bytes to be
identical to lib/supabase-database.types.ts, including the final newline.
This provider-response parity is the semantic authority for the generated
types; the supporting catalog snapshot is not used as a reimplementation of
Supabase's generator rules.

## Catalog scope

The catalog query runs inside BEGIN TRANSACTION READ ONLY, returns its
database transaction timestamp in the same row and selects the explicit schema
set [public]. The receipt claims only that all selected schemas were
enumerated. It does not claim to discover every schema configured for the
Supabase Data API.

The artifacts contain schema metadata only. They contain no owner UUID,
credential, application row data or database connection URL.

A canonical owner identifier appeared transiently in an earlier Draft commit.
It is treated as disclosed and is removed from the revised branch history; it
must never be treated as a credential or reused as secret material.

The V1 bytes remain preserved in the historical V1 package. The provider-free
oracle is
tests/e2e/action-660-ma09-generated-types-provenance-v2.spec.mjs.

Status: repository-pinned delivery candidate awaiting independent re-review.
MA09 remains open until that review, PR #95 ordering, exact-scope merge, main
reachability and exact-main CI all succeed.
