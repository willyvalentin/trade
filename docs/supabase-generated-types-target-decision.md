# Supabase Generated Types Target Decision

## 1. Purpose

Action 794 resolves the canonical target path for generated Supabase database types.

This action does not run Supabase type generation, does not create or populate the generated type file, does not implement an audit writer, and does not add any route or runtime write path.

## 2. Current Blocker

Action 793 stopped safely with status `audit_table_typegen_target_unknown` because no established generated Supabase database type destination exists in the repository.

No generated type file was created in Action 793. No random type target was invented. Type generation remains blocked until a canonical target path is selected and recorded.

## 3. Repo Inventory

Searched areas:

- repository root
- `lib/`
- `app/`
- `hooks/`
- `tests/`
- `supabase/`
- `docs/`
- TypeScript and Next.js config files

Existing generated Supabase type files found:

- none

Existing `Database` imports found:

- none

Existing Supabase client type conventions:

- `lib/supabase.ts` exports an untyped browser/client Supabase client from `@supabase/supabase-js`.
- `lib/supabase-server.ts` exports untyped server Supabase helpers from `@supabase/supabase-js`.
- Runtime imports use `@/lib/supabase` and `@/lib/supabase-server`.
- No helper currently imports generated database types.

Other references:

- `tests/e2e/execution-sandbox.spec.ts` contains scenario fixture text with `generated/supabase/types.ts`; this is test data, not an existing project convention.
- `docs/supabase-execution-records-generated-types-plan.md` previously recorded that no generated DB type destination exists and proposed `lib/supabase-database.types.ts` as a fallback location if no convention exists.

Conflicts or ambiguities:

- There is no existing generated type file to preserve.
- There is no existing import convention for generated Supabase `Database` types.
- Multiple plausible paths are possible, so the decision must be explicit before type generation.

## 4. Candidate Target Paths

| Path | Pros | Cons | Matches current convention | Recommended |
| --- | --- | --- | --- | --- |
| `types/supabase.ts` | Short and clearly type-oriented | No `types/` directory currently exists; name does not clearly mark generated DB output | no | no |
| `types/database.ts` | Generic database type location | No `types/` directory currently exists; could collide with non-Supabase database types later | no | no |
| `lib/database.types.ts` | Common Supabase CLI example path; easy `@/lib/...` import | Less explicit that file is Supabase-generated; audit plan used it as an example, not an existing convention | partial | no |
| `lib/supabase/database.types.ts` | Clear grouping under Supabase namespace | No `lib/supabase/` directory currently exists; would require creating a new folder | no | no |
| `supabase/database.types.ts` | Close to Supabase project files | May blur generated app types with Supabase CLI/migration directory; runtime imports from `supabase/` are less established | no | no |
| `generated/supabase/types.ts` | Appears in one e2e fixture string | Only fixture data; no generated directory exists; less aligned with app import conventions | no | no |
| `lib/supabase-database.types.ts` | Previously proposed fallback; easy to import with `@/lib/supabase-database.types`; clearly Supabase/database-specific; keeps generated DB types separate from handwritten domain contracts | Lives in busy `lib/` directory, so header and commit discipline must clearly mark it generated | yes, as documented fallback | yes |

## 5. Decision

Selected canonical target path:

- `lib/supabase-database.types.ts`

Why this target was selected:

- It matches the fallback path already proposed in `docs/supabase-execution-records-generated-types-plan.md`.
- It is easy to import from app and library code through the existing `@/*` TypeScript path alias.
- The filename clearly identifies the file as Supabase database types.
- It avoids colliding with handwritten execution-record, audit-writer, bridge, validator, or persistence contracts.
- It avoids creating an otherwise unused `types/`, `generated/`, or `lib/supabase/` directory solely for this one file.

Current file existence:

- `lib/supabase-database.types.ts` does not exist yet.

Generation timing:

- The file should be created by Supabase type generation in the next explicit action.
- This action does not create an empty placeholder.

Future import changes:

- No import changes are needed in Action 794.
- Later actions may add type-only imports after generated types are produced, reviewed, and compile cleanly.

## 6. Proposed Typegen Command For Next Action

Command template for Action 795:

```bash
supabase gen types typescript --linked --schema public > lib/supabase-database.types.ts
```

This command was not executed in Action 794.

## 7. Not Performed

- no type generation run
- no generated type file created
- no generated type file edited
- no migrations
- no broad `supabase db push`
- no service-role code
- no audit writer
- no audit route
- no route calls
- no runtime persistence/write path
- no Supabase/localStorage write code
- no audit append implementation
- no broker/Avanza/automatic behavior

## 8. Result Status

Status: `supabase_generated_types_target_selected`.

Next action: Action 795 - Generate Supabase Types To Selected Target.

## 9. Remaining Blockers

- generated audit table types proof
- server-only/service-role proof
- route/auth proof
- audit writer implementation
- audit route/write path
- production insert route/write path

## 10. Safety Boundaries

- Target decision is not generated types proof.
- Target decision is not writer implementation.
- Target decision is not write-path approval.
- Target decision is not audit append approval.
- Target decision is not server-only proof.
- Target decision is not route/auth proof.
- Downstream behavior remains unauthorized.
- Broker/Avanza/automatic behavior remains unauthorized.

## 11. Validation

Required validation for Action 794:

- runtime import check for denial harnesses
- `git diff --check`
- `find docs -type f -size 0`
- `./node_modules/.bin/tsc --noEmit`
- `npm run lint`

## Action 795 - Typegen To Selected Target

- Supabase type generation was run against the linked project ref `ekdyopdrrkphlrsilyoo`.
- Command: `supabase gen types typescript --linked --schema public > lib/supabase-database.types.ts`.
- Selected target before Action 795: `lib/supabase-database.types.ts`.
- Target existed before Action 795: no.
- Target exists after Action 795: yes.
- Generated file is non-empty.
- Verification confirmed `Database`, `execution_records`, `execution_record_audit_events`, and audit table `Row`, `Insert`, and `Update` types are present.
- Proof artifacts:
  - `docs/proofs/execution-record-audit-table-generated-types-output.txt`
  - `docs/proofs/execution-record-audit-table-generated-types-verification.txt`
- No runtime client import changes were made.
- Status: `audit_table_generated_types_verified`.
- Recommended next action: Action 796 - Prove Audit Writer Server-Only Service-Role Boundary.
