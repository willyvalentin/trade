# Supabase Migration Tooling Setup Plan

## Action 702 - Audit Append Writer Dry-Run Result Contract Reassessment

- Created docs/execution-record-audit-append-writer-dry-run-result-contract-reassessment.md as a documentation-only reassessment of lib/execution-record-audit-append-writer-dry-run-result-contract.ts.
- Verified the contract remains type-only/constants-only, contract-only, dry-run-contract-only, future-boundary-only, and disconnected from dry-run logic, writer logic, audit append execution, route calls, execution-record creation, persistence/write behavior, Supabase/localStorage writes, audit writes, downstream actions, broker/Avanza behavior, and automatic mode.
- Reconfirmed dry-run result success is not audit write approval, audit append execution, route call approval, record creation approval, persistence/write approval, Supabase/localStorage write approval, security proof, server-only proof, schema/table proof, generated-types proof, migration proof, RLS/security proof, downstream approval, or full workflow completion; all action authority flags remain false.
- Reconfirmed audit schema/table proof, generated audit table types, migration proof, RLS/security proof, server-only proof, service-role proof, route/auth boundary proof, writer implementation, dry-run implementation, production insert route, and production insert/write path remain absent/unproven blockers.
- Validation: git diff --check passed; find docs -type f -size 0 returned 0.
- Recommended next action: Action 703 - Create Audit Append Writer Dry-Run Validator Design.


Date: 2026-06-10

Status: Documentation-only setup plan. No tool was installed, no Supabase command was run, no migration was applied, no credential was added to the repo, and no database state was modified.

Related:

- `supabase/migrations/20260610000000_execution_audit_foundation.sql`
- `docs/execution-audit-migration-apply-plan.md`
- `docs/execution-audit-apply-readiness-review.md`
- `docs/execution-audit-persistence-flag-design.md`
- `docs/execution-agent-checkpoint.md`
- `docs/execution-agent-qa-notes.md`

## Current Blocker

Action 229 attempted to apply the execution audit foundation migration to the approved staging/dev target and correctly stopped before applying it.

The workspace does not currently have a safe Supabase migration execution path:

- no Supabase CLI
- no `psql`
- no `supabase/config.toml`
- no linked staging/dev project config
- no service-role key, database URL, or admin SQL credential available in the shell environment

This was the expected safe outcome. The migration remains unapplied:

- `supabase/migrations/20260610000000_execution_audit_foundation.sql`

No production project was targeted. No Supabase write occurred. No route persistence flag was enabled.

## Recommended Path A: Local Supabase

Use this path when the goal is to validate migration shape, rollback SQL, and app behavior without touching any remote Supabase project.

Setup requirements:

- Install the Supabase CLI outside this action.
- Add or initialize local Supabase config only after confirming the project convention.
- Run the local Supabase stack.
- Apply the migration locally.
- Run the verification SQL from `docs/execution-audit-migration-apply-plan.md`.
- Keep production credentials completely out of the local setup.

Suggested flow:

1. Confirm local tooling is allowed on the machine.
2. Install Supabase CLI using the developer's preferred package manager.
3. Confirm the CLI version.
4. Initialize local Supabase config if the repo intentionally owns that config.
5. Start the local Supabase stack.
6. Apply migrations locally.
7. Verify the three audit tables, columns, indexes, RLS state, and row counts.
8. Keep route persistence flags off.

Pros:

- Lowest risk target.
- No remote database state is modified.
- Good for validating SQL syntax, table shape, rollback commands, and app tests.
- Does not require staging service-role credentials.

Cons:

- Does not prove remote staging permissions, extensions, or project-specific database settings.
- Local config may need to be added carefully if the repo does not already track Supabase project config.
- Local database reset commands can drop local data, so the target must be clear.

## Recommended Path B: Staging/Dev Supabase

Use this path when the goal is to verify the migration against the real non-production Supabase project that will eventually host execution audit rows.

Setup requirements:

- Confirm the staging/dev project ref in the Supabase dashboard.
- Confirm the staging/dev project is not production.
- Configure either a linked Supabase CLI project or a safe `psql` connection.
- Store staging-only credentials outside the repo.
- Confirm backup/snapshot availability.
- Apply only the reviewed migration.
- Run verification SQL.

Suggested flow:

1. Identify the staging/dev Supabase project by name and project ref.
2. Cross-check that the project is not production.
3. Configure Supabase CLI link or a staging/dev database URL outside the repo.
4. Confirm rollback SQL is reviewed.
5. Apply the migration to staging/dev.
6. Verify tables, columns, indexes, RLS state, and row counts.
7. Document commands and results in the apply/readiness docs.
8. Keep route persistence flags off unless a separate approved writer smoke test is planned.

Pros:

- Proves the migration works against the intended remote non-production environment.
- Catches project-specific permissions, extension, schema, and compatibility issues.
- Creates the best evidence before any future persistence writer action.

Cons:

- Requires careful credential handling.
- Modifies remote non-production database state.
- Needs a confirmed rollback owner and backup/snapshot plan.
- Mistargeting risk is higher than local, so project ref verification is mandatory.

## Required Secrets and Safety

Secrets must never be committed to the repo:

- service-role keys
- database connection strings
- database passwords
- Supabase access tokens
- production project refs when paired with credentials

Use one of these storage paths instead:

- `.env.local`, only if it is ignored and local to the developer machine
- a password manager
- the Supabase CLI's local auth/link storage
- an approved secret manager for staging/dev

Safety rules:

- Do not use a production project for Action 229 retry.
- Label staging/dev projects clearly before applying.
- Confirm the project ref in the Supabase dashboard before running `db push` or equivalent.
- Keep `EXECUTION_AUDIT_SUPABASE_PERSISTENCE_ENABLED` unset or `false` during migration apply.
- Keep `EXECUTION_AUDIT_SUPABASE_WRITER_ENABLED` unset or `false` during migration apply.
- Do not place service-role keys or database URLs in committed docs, source files, migrations, or tests.

## Tooling Choices

### Supabase CLI

Recommended default for repeatable migration work.

Use it when:

- the project has or will have a `supabase/config.toml`
- the target project can be linked by project ref
- migration history should be managed by Supabase's migration tooling

Benefits:

- repeatable commands
- project-aware migration flow
- easier local stack support
- less manual SQL copy/paste risk

### psql

Useful for direct SQL verification or controlled one-off applies when the database URL is known.

Use it when:

- a staging/dev database URL is available outside the repo
- the team prefers direct SQL execution for this migration
- verification SQL needs to be run without dashboard copy/paste

Risks:

- connection string handling is sensitive
- easy to target the wrong database if environment variables are unclear
- migration history may need separate tracking

### Supabase Dashboard SQL Editor

Acceptable only as a manual fallback for staging/dev when CLI or `psql` is unavailable.

Use it when:

- the user explicitly chooses dashboard execution
- the project is confirmed staging/dev
- the SQL is copied from the reviewed migration file
- verification SQL and rollback SQL are ready

Risks:

- manual copy/paste error
- weaker repeatability
- command history may be harder to audit in the repo

Recommendation:

- Prefer Supabase CLI for repeatability.
- Use `psql` for verification and controlled direct SQL only when credentials are safely managed.
- Use the dashboard SQL editor only for explicit manual staging/dev execution when CLI setup is unavailable.

## Preflight Checklist Before Retrying Action 229

- Target path selected: local Supabase or staging/dev Supabase.
- Target environment confirmed non-production.
- Supabase command path exists:
  - `supabase`, or
  - `psql`, or
  - approved dashboard SQL runner.
- Credentials are stored outside the repo.
- Project ref is verified as non-production.
- Backup/snapshot availability is confirmed for remote staging/dev.
- Rollback SQL is reviewed.
- Migration SQL is reviewed:
  - `supabase/migrations/20260610000000_execution_audit_foundation.sql`
- Git state is clean or expected.
- Route persistence flags remain off.
- No app write path is expected to run during apply.

## Suggested Command Placeholders

These are placeholders only. Do not run them until the target and credential path are confirmed.

Check CLI availability:

```bash
supabase --version
```

Link a staging/dev project:

```bash
supabase link --project-ref <STAGING_PROJECT_REF>
```

Apply migrations to a linked non-production project:

```bash
supabase db push
```

Run a local Supabase stack, if local config is intentionally set up:

```bash
supabase start
```

Apply or reset local migrations, depending on project convention:

```bash
supabase db reset
```

Direct `psql` shape, only with a staging/dev database URL stored outside the repo:

```bash
psql "<STAGING_DEV_DATABASE_URL>" -f supabase/migrations/20260610000000_execution_audit_foundation.sql
```

Verification SQL remains in `docs/execution-audit-migration-apply-plan.md`.

## Next Recommended Action

Choose one path before retrying migration apply:

- Action 231A - Configure Local Supabase Tooling
- Action 231B - Configure Staging Supabase Link

Recommended default:

- Use Action 231A if the goal is lowest-risk SQL validation.
- Use Action 231B if the user is ready to identify a specific staging/dev Supabase project ref and manage staging-only credentials safely.

After either path is configured, retry:

- Action 229 retry - Apply Audit Migration Local/Staging and Verify

Production remains no-go until RLS, `user_id`, ownership, retention, and server-only write policy decisions are resolved.

## Action 231A Local Tooling Discovery

Date: 2026-06-10

Target path: local Supabase only.

Result: local setup remains blocked until Supabase tooling is installed and initialized intentionally.

Discovery performed:

- `supabase/migrations/` exists.
- `supabase/migrations/20260610000000_execution_audit_foundation.sql` remains the intended audit foundation migration.
- `supabase/config.toml` does not exist.
- `package.json` has no Supabase CLI scripts.
- `.gitignore` ignores `.env*` and `.env*.local`, so local-only credential files are not committed by default.
- `supabase --version` failed because the Supabase CLI is not installed.
- `which supabase` found no CLI binary.
- `which psql` found no `psql` binary.
- Existing docs mention the Action 229 blocker, but no project-specific local Supabase command convention exists yet.

No local Supabase services were started. No migration command was run. No remote Supabase project was contacted.

### Current Local Blocker

The repo has migration files but not the local Supabase tooling envelope needed to run them safely:

- no Supabase CLI binary
- no `psql`
- no `supabase/config.toml`
- no local Supabase stack status to inspect

Because `supabase/config.toml` is missing, `supabase init` or an equivalent project setup step is needed before local Supabase commands such as `supabase start`, `supabase status`, `supabase db reset`, or local migration apply can be used in a repeatable way.

Do not run `supabase init` blindly if the repo's Supabase config should be generated with project-specific ports, auth settings, schemas, or seed behavior. The minimal safe setup decision is whether this repo should commit a generated `supabase/config.toml` for local development.

### Local Install Options

No install was performed in Action 231A.

Possible local CLI install paths:

```bash
brew install supabase/tap/supabase
```

Alternative npm-style checks may be possible if the project chooses that approach, but verify the current Supabase CLI packaging before using it:

```bash
npx supabase --version
```

If `psql` is preferred for local-only verification, install PostgreSQL client tooling through the developer's local package manager, then keep all connection strings outside the repo.

### Minimal Next Local Step

Recommended next local-only command, after the user approves installing or using the CLI:

```bash
supabase --version
```

If the CLI is available and the repo owner approves creating local Supabase config:

```bash
supabase init
```

After config exists, inspect it before starting services:

```bash
supabase status
```

Only after the local stack is clearly configured and running should a later action consider local migration apply:

```bash
supabase db reset
```

That later migration apply still needs a separate explicit approval because it modifies the local database.

### Recommended Next Action

Preferred:

- Action 231A follow-up - Install/Use Supabase CLI Locally and Initialize Config

Then:

- Action 229 retry - Apply Audit Migration Local and Verify

Keep staging/dev and production out of the local tooling path.
