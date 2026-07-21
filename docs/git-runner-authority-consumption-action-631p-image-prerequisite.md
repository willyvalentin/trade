# Action 631P - Disposable Postgres Image Prerequisite

Decision: `post_trade_git_runner_authority_consumption_disposable_postgres_runtime_prerequisite_ready`

Result status: `post_trade_git_runner_authority_consumption_action_631p_runtime_prerequisite_resolved`

Recommended next Action: Action 631 - Implement Disposable Postgres Validation Harness for Git Runner Authority Consumption Migrations

## Original Blocker

Action 631 stopped before implementation because Action 630 selected a disposable plain Postgres harness architecture but did not bind the future harness to one exact locally available image identity. Action 631P resolves only that runtime prerequisite.

This action did not start Docker, run a container, pull an image, contact a registry, connect to a database, execute SQL, apply migrations, alter migrations, implement the harness, add tests, modify production TypeScript/JavaScript, or add runtime/API/UI/runner reachability.

## Candidate Images

The blocked Action 631 precondition gate had already captured the following local image metadata:

| Candidate | Local metadata | Verdict |
| --- | --- | --- |
| `postgres:16` | `sha256:4b7183ac05f8ef417db21fd72d71047a4238340c261d3cc3ddb6d579ab5071ae`, linux/arm64 | Selected |
| `public.ecr.aws/supabase/postgres:17.6.1.121` | `sha256:69e57a409628a809e3778a4d176eb97e32d7c961131ac025b77ad094c0b2d49e`, linux/arm64 | Rejected for v1 harness |
| `redis:7` | Not a Postgres image | Rejected |

No Action 631 container existed in the captured precondition check. Action 631P did not re-run `docker ps`, `docker inspect`, `docker pull`, `docker run`, `docker create`, or any registry command.

## Migration Compatibility Inventory

The Action 622 storage migration and Action 626 RPC migration use ordinary Postgres features:

- `uuid` primary keys with `gen_random_uuid()`;
- `timestamptz`, text, integer, bigint, boolean, and smallint columns;
- regex-backed `CHECK` constraints;
- foreign keys, unique constraints, and indexes;
- row-level security enabled with no permissive policies;
- PL/pgSQL functions;
- `SECURITY DEFINER`;
- fixed `set search_path = pg_catalog, public`;
- `RETURNS TABLE`;
- `select ... for update`;
- exception handling;
- explicit `REVOKE EXECUTE` statements;
- function and table comments;
- transaction, row-lock, CAS, and NULL/UNKNOWN semantics that require database execution in Action 631.

The reviewed migrations do not require Supabase-specific schemas, PostgREST, `auth`, `storage`, `realtime`, `pg_net`, `vault`, remote project metadata, Supabase hooks, or Supabase credentials. They require `pgcrypto` or an equivalent local UUID generation prerequisite for `gen_random_uuid()`.

## Version Target

No source-controlled production/Supabase Postgres major version was found in the reviewed Action 621, 622, 625, 626, 629, or 630 materials. Therefore Action 631P selects the narrowest locally available image that supports the reviewed migration feature set and minimizes hidden state: plain Postgres 16.

Production-version equivalence remains unresolved. A later staging/deployment path must compare against the actual deployment Postgres major before any staging or production claim.

## Selected Image

Action 631 must use exactly:

- tag: `postgres:16`;
- immutable image identity: `sha256:4b7183ac05f8ef417db21fd72d71047a4238340c261d3cc3ddb6d579ab5071ae`;
- repo digest: `postgres@sha256:4b7183ac05f8ef417db21fd72d71047a4238340c261d3cc3ddb6d579ab5071ae`;
- platform: `linux/arm64`.

The tag alone is not sufficient. Action 631 must verify the tag and full immutable identifier before creating harness files or starting a container. If the local image is absent, mismatched, ambiguous, or requires emulation, Action 631 must stop.

## Rejected Alternative

`public.ecr.aws/supabase/postgres:17.6.1.121` is not selected for v1 because the migrations do not require Supabase-specific database services, and the Supabase image expands hidden state and entrypoint complexity. It may be useful in a later compatibility pass if a reviewed source-controlled production-major or Supabase-specific requirement is established.

## Extension And Role Posture

Action 631 bootstrap must create only the required `pgcrypto` extension before applying the storage migration. If `pgcrypto` is unavailable in the selected local image, the harness must fail before applying either migration.

Action 631 must create or verify only local disposable roles:

- `anon`;
- `authenticated`;
- optional `service_role` for negative ACL verification;
- `git_runner_validation_executor`;
- one unprivileged validation role.

No Supabase pre-created role or remote credential may be trusted.

## No-Fallback Policy

Action 631 may not use automatic fallback from the selected image to another image, tag, major version, architecture, Supabase CLI local stack, or registry lookup. No image pull is allowed. A mismatch must produce a blocked prerequisite result and no harness execution.

## Updated Action 631 Preconditions

Before creating harness files or starting a container, Action 631 must verify:

- worktree is `/Users/willysimonsson/Dev/trade-action-534`;
- branch is `codex/action-534-live-resolver`;
- git status is clean;
- both reviewed migrations exist;
- Docker CLI exists;
- Docker daemon is accessible locally;
- selected image tag is exactly `postgres:16`;
- selected immutable image identity is exactly `sha256:4b7183ac05f8ef417db21fd72d71047a4238340c261d3cc3ddb6d579ab5071ae`;
- selected repo digest is exactly `postgres@sha256:4b7183ac05f8ef417db21fd72d71047a4238340c261d3cc3ddb6d579ab5071ae`;
- selected platform is `linux/arm64`;
- no Action 631 container name collision exists;
- no image pull, registry lookup, published port, inherited database URL, Supabase credential, Supabase CLI fallback, or automatic substitution occurs.

## Validation Performed

Action 631P performed static migration compatibility, version-target, Supabase-dependency, image-candidate, immutable-identity, platform, extension, role-bootstrap, no-fallback, Action 631 precondition, runtime-reachability, and prohibited-operation reviews. It used only source-controlled files and local image metadata already captured by the blocked Action 631 gate.

## Remaining Limitations

No database execution occurred. `pgcrypto` availability, SQL parser acceptance, catalog signatures, constraints, RLS/ACL execution, function behavior, concurrency, rollback, and cleanup remain for Action 631.

## Commit And Deploy

No deploy is recommended for Action 631P.

Do not commit until the complete diff has been manually inspected.
