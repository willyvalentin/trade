# Action 502 - Explicit Source-Controlled Staging Migration Deployment Gate Static Security Review No Deployment

Decision: `post_trade_explicit_source_controlled_staging_migration_deployment_gate_static_security_review_ready_for_deployment_readiness_artifact`

Result status: `post_trade_explicit_source_controlled_staging_migration_deployment_gate_static_security_review_completed_no_deployment`

## Files Reviewed

- `lib/post-trade-staging-migration-deployment-gate-core.ts`
- `lib/post-trade-staging-migration-deployment-gate.ts`
- `tests/e2e/post-trade-staging-migration-deployment-gate.spec.ts`
- `supabase/migrations/20260710000000_create_execution_authorization_consumptions.sql`
- `docs/post-trade-durable-authorization-consumption-source-controlled-staging-migration-no-deployment-no-execution.md`
- `docs/post-trade-durable-authorization-consumption-staging-migration-static-sql-security-review-no-deployment-no-execution.md`
- `docs/post-trade-explicit-source-controlled-staging-migration-deployment-gate-no-deployment.md`

## Gate Architecture

The gate remains a deterministic, side-effect-free, source-controlled review boundary. The core module is pure and returns structured decisions only. The exported boundary imports `server-only`. The gate is blocked by default and even a structurally eligible approval keeps:

- `deploymentEnabled: false`
- `deploymentStatus: not_deployed`
- `remoteMutation: false`
- `sqlExecuted: false`
- `migrationsApplied: 0`
- `rowsCreated: 0`

No code path deploys a migration, executes SQL, calls Supabase, mutates Git, reads secrets, or invokes a shell.

## Changes Made During Review

- Added explicit project-evidence and worktree-evidence contract versions.
- Added deterministic stable serialization for the SHA-256 preimage.
- Extended the fingerprint preimage to bind the staging project, rejected production project, exact statement inventory, RLS expectation, and privilege-revoke expectation.
- Added exact expected SQL statement inventory checks derived from the normalized migration SQL.
- Added recursive checks for production references inside arrays and nested objects.
- Added rejection of unsupported nested values such as functions, symbols, class instances, Maps/Sets, and cyclic objects.
- Added worktree inspected timestamp freshness checks and unsafe path rejection.
- Added future-dated project-evidence rejection.
- Added stricter approval validity-window checks.
- Added the Action 502 review artifact to the reviewed worktree scope.
- Expanded adversarial tests for hash, normalization, project evidence, worktree evidence, production references, side-effect fragments, and server-only isolation.

## Migration Identity

- migration filename: `20260710000000_create_execution_authorization_consumptions.sql`
- migration path: `supabase/migrations/20260710000000_create_execution_authorization_consumptions.sql`
- target table: `public.execution_authorization_consumptions`
- approved staging project: `pdvzyuhykomwfqyyztru`
- rejected production project: `ekdyopdrrkphlrsilyoo`
- migration count: `1`
- row/function/policy/trigger/RPC/seed counts: `0`
- normalized SQL byte length: `9518`
- reviewed fingerprint: `4f4fbfb52a458e502441322bae873940469c89f292db464d177aa10fad9f095a`

## Fingerprint Findings

The reviewed fingerprint uses full SHA-256 with UTF-8 input and exact 64-character lowercase hexadecimal equality. The preimage binds:

- gate contract version
- migration filename, path, and timestamp prefix
- exact target table
- exact staging project
- rejected production project
- exact normalized SQL
- normalized byte length
- SQL-derived statement inventory
- expected migration/row/function/policy/trigger/RPC/seed counts
- RLS expectation
- anon/authenticated revoke expectation
- Action 499 implementation decision
- Action 500 SQL/security review decision
- Action 500 review artifact identity

No prefix comparison, substring comparison, fallback hash, caller-selected algorithm, weak checksum, environment override, omitted hash, empty hash, malformed hash, or uppercase hash is accepted. Arrays preserve ordering in the stable serializer. Critical `undefined` and `null` values do not collapse in the fingerprint preimage.

## SQL Normalization Findings

Normalization is narrow:

- CRLF and CR are normalized to LF.
- trailing spaces and tabs at line ends are removed.
- comments remain bound.
- final newline changes remain hash-significant.

Normalization does not hide statement-order changes, identifier changes, literal changes, comment changes, added statements, removed statements, changed constraints, changed privileges, changed RLS statements, changed project ids, changed table names, changed defaults, or changed foreign-key behavior.

## Statement Inventory Findings

The gate recomputes inventory from normalized SQL and compares it to the source-controlled expectation:

- `CREATE TABLE`: 1
- `CREATE UNIQUE INDEX`: 6
- `CREATE INDEX`: 2
- `ALTER TABLE`: 1
- `ENABLE ROW LEVEL SECURITY`: 1
- `REVOKE`: 1
- `COMMENT ON`: 6
- `INSERT`, `UPDATE`, `DELETE`, `COPY`: 0
- functions, policies, triggers, RPCs, seeds: 0

The gate does not trust a caller-supplied inventory.

## Trust Boundary Findings

Source-controlled constants define migration identity, project identity, expected counts, review decisions, and forbidden capabilities. Migration SQL evidence is caller-supplied but must exactly reproduce the reviewed normalized content and fingerprint. Project and worktree evidence are modeled inputs but must be versioned, exact, fresh, and unambiguous. The review documents that future deployment-readiness work must gather those evidence objects from authoritative Git/Supabase-target inspection rather than from a broad boolean or environment-only assertion.

## Project Evidence Findings

Project evidence must bind the exact resolved project ref, expected staging ref, rejected production ref, identity source, linked project ref, environment project ref, staging classification, verification timestamp, verification result, evidence version, and identity-source agreement. The gate blocks missing, malformed, alternate, production, whitespace/case variant, stale, future-dated, ambiguous, mismatched linked/environment refs, unknown identity source, generic `verified: true`, and generic `isStaging: true` evidence.

This action did not perform live project verification.

## Worktree Evidence Findings

Worktree evidence must match the reviewed deployment unit exactly, including the migration, gate files, gate tests, Action 499/500 checkpoints, Action 501 checkpoint, this Action 502 checkpoint, and continuation summary. It blocks missing reviewed migration, changed scope, second migration, unknown migration, unreviewed migration, unrelated Action 366-369 files, Action 318-320 files, duplicate scope entries, absolute paths, traversal paths, backslash paths, double-slash paths, stale evidence, and future-dated evidence.

Future deployment-readiness work must derive this from authoritative source-controlled worktree inspection.

## Approval Contract Findings

The approval object requires exact id, approval version, gate version, migration identity, reviewed fingerprint, staging project, rejected production project, counts, deployment scope, one-shot marker, retry-disabled marker, unused state, issued/expires timestamps, Action 499/500 decisions, reviewed migration artifact, reviewed worktree scope, and explicit false forbidden-capability map.

The gate rejects unknown top-level fields, unknown nested forbidden-capability fields, missing fields, null/malformed critical fields, malformed counts, non-zero side-effect counts, future issuance outside tolerance, expiry before issuance, excessive validity, consumed/invalid/expired state, one-shot false, and retry true.

## Production Reference Findings

Production ref `ekdyopdrrkphlrsilyoo` is allowed only in explicit rejected-production metadata. Recursive scanning blocks it in nested strings, URLs, arrays, project evidence, worktree evidence, and arbitrary nested objects. Unsupported prototypes and cyclic inputs fail closed.

## One-Shot And Retry Findings

The gate enforces logical one-shot approval: only `unused` is structurally eligible and retry must be false. Evaluation is pure and does not consume approval, write markers, use module-global mutable state, write local storage, or touch the filesystem.

Remaining risk: this logical one-shot gate does not itself prevent two future deployment runners from attempting the same deployment. A durable deployment-attempt consumption or equivalent single-use deployment-readiness artifact remains required before any actual staging deployment action.

## Deployment Plan Findings

The modeled plan is inert data only. It contains one exact migration, one exact staging project, expected preflight categories, expected post-deploy checks, zero rows/seeds/functions/policies/triggers/RPCs, no production, no repair/reset/retry, and no runtime activation. It contains no executable callback, shell execution, arbitrary command flags, service-role key, database password, access token, Supabase token, or raw environment dump.

## Dependency Boundary Findings

The core imports only `node:crypto` for hashing. The server boundary imports `server-only`. Static tests confirm no Supabase client import, no `createClient`, no child-process import, no write-call fragments, no filesystem write API, no API route wiring, and no Trade UI import.

## Tests Added Or Strengthened

The deployment-gate suite now covers:

- default blocked/no deployment state
- canonical structural eligibility remains no-deployment
- exact reviewed fingerprint and SQL byte length
- deterministic hash changes for statement order, literals, comments, constraints, path, filename, and target metadata
- CRLF and trailing-whitespace normalization limits
- final newline and broad semantic changes remain hash-significant
- full lowercase SHA-256 requirement
- partial, prefix, uppercase, malformed, empty, and mismatched hashes
- exact project evidence, stale/future evidence, generic boolean evidence, source mismatch, and production target rejection
- exact worktree evidence, stale/future evidence, duplicates, unsafe paths, unrelated files, and extra migrations
- forbidden capability toggles
- recursive secret/credential and production-reference rejection
- inert deployment plan content
- repeated deterministic evaluation
- server-only and no-side-effect static source scans

## Remaining Risks

- No migration has been deployed.
- No live staging catalog proof exists for this migration.
- Future deployment-readiness must still perform authoritative local target verification and worktree inspection.
- A durable single-use deployment-attempt consumption mechanism is still required before actual deployment.
- Post-deployment catalog verification remains required after any separate approved deployment.

## No-Deployment Confirmation

No SQL was executed. No migration was deployed. No Supabase CLI command or remote Supabase call was run. No staging or production connection occurred. No live schema was inspected or mutated. No rows were created. No database function, RPC, trigger, policy, seed, authorization, authorization consumption, persistence, adapter, final execution gate, API/UI/client/runtime path, Avanza/browser automation, credential/session/cookie/BankID handling, order behavior, settlement retrieval, live trade mutation, or live position mutation occurred.

Unrelated Action 366-369 files and pre-existing Action 318-320 script changes were not modified.

Recommended next action:

`Action 503 - Add Single-Use Source-Controlled Staging Migration Deployment Readiness Artifact, Without Deployment`
