# Action 660 MA09 — generated-types provenance V2

This package binds Ture's post-MA05 production catalog to regenerated
TypeScript output without changing the database.

The catalog capture ran through the Supabase Management API inside an explicit
`READ ONLY` transaction. The API login role is `postgres`; its default is not
read-only, so the committed query and receipt deliberately record both the
effective role and the transaction-local read-only state. An attempted local
switch to `supabase_read_only_user` was denied by PostgreSQL and was not used
as evidence.

The receipt contains the complete `public` catalog snapshot, deterministic
per-dimension hashes, an aggregate hash, the exact project ref, CLI version,
generation command and generated-output digest. It contains schema metadata
only and no owner UUID or application row data.

The V1 bytes are preserved in the historical V1 package. The executable V2
oracle is `tests/e2e/action-660-ma09-generated-types-provenance-v2.spec.mjs`.

Status: repository-pinned delivery candidate. MA09 remains open until
independent review, PR #95 ordering, exact-scope merge, main reachability and
exact-main CI all succeed.
