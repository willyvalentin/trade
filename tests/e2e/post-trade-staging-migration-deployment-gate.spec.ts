import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  buildPostTradeStagingMigrationDeploymentApproval,
  buildPostTradeStagingMigrationFingerprint,
  buildPostTradeStagingMigrationProjectEvidence,
  buildPostTradeStagingMigrationWorktreeEvidence,
  evaluatePostTradeStagingMigrationDeploymentGate,
  normalizePostTradeStagingMigrationSql,
  POST_TRADE_STAGING_MIGRATION_ALLOWED_SCOPE_FILES,
  POST_TRADE_STAGING_MIGRATION_EXPECTED_FINGERPRINT,
  POST_TRADE_STAGING_MIGRATION_EXPECTED_NORMALIZED_LENGTH,
  POST_TRADE_STAGING_MIGRATION_EXPECTED_STATEMENT_INVENTORY,
  POST_TRADE_STAGING_MIGRATION_FILENAME,
  POST_TRADE_STAGING_MIGRATION_PATH,
  POST_TRADE_STAGING_MIGRATION_PROJECT_EVIDENCE_VERSION,
  POST_TRADE_STAGING_MIGRATION_PROJECT_REF,
  POST_TRADE_STAGING_MIGRATION_REJECTED_PRODUCTION_REF,
  POST_TRADE_STAGING_MIGRATION_RLS_EXPECTATION,
  POST_TRADE_STAGING_MIGRATION_UNRELATED_FILES,
  POST_TRADE_STAGING_MIGRATION_WORKTREE_EVIDENCE_VERSION,
  type PostTradeStagingMigrationDeploymentApproval,
  type PostTradeStagingMigrationProjectEvidence,
  type PostTradeStagingMigrationWorktreeEvidence,
} from "../../lib/post-trade-staging-migration-deployment-gate-core";

const migrationSql = readFileSync(
  join(process.cwd(), POST_TRADE_STAGING_MIGRATION_PATH),
  "utf8",
);
const coreSource = readFileSync(
  join(process.cwd(), "lib/post-trade-staging-migration-deployment-gate-core.ts"),
  "utf8",
);
const boundarySource = readFileSync(
  join(process.cwd(), "lib/post-trade-staging-migration-deployment-gate.ts"),
  "utf8",
);
const tradeUiSource = readFileSync(join(process.cwd(), "app/trade-app.tsx"), "utf8");
const evaluatedAtIso = "2026-07-12T12:00:00.000Z";
const issuedAtIso = "2026-07-12T11:00:00.000Z";
const expiresAtIso = "2026-07-12T13:00:00.000Z";
const verifiedAtIso = "2026-07-12T11:55:00.000Z";

function approval(
  overrides: Partial<PostTradeStagingMigrationDeploymentApproval> = {},
) {
  return {
    ...buildPostTradeStagingMigrationDeploymentApproval({
      approvalId: "action-501-single-use-approval",
      issuedAtIso,
      expiresAtIso,
    }),
    ...overrides,
  };
}

function projectEvidence(
  overrides: Partial<PostTradeStagingMigrationProjectEvidence> = {},
) {
  return {
    ...buildPostTradeStagingMigrationProjectEvidence({ verifiedAtIso }),
    ...overrides,
  };
}

function worktreeEvidence(
  overrides: Partial<PostTradeStagingMigrationWorktreeEvidence> = {},
) {
  return {
    ...buildPostTradeStagingMigrationWorktreeEvidence(),
    ...overrides,
  };
}

function evaluate(input: {
  approval?: unknown;
  projectEvidence?: unknown;
  worktreeEvidence?: unknown;
  migrationSql?: string;
} = {}) {
  return evaluatePostTradeStagingMigrationDeploymentGate({
    approval: input.approval === undefined ? approval() : input.approval,
    projectEvidence:
      input.projectEvidence === undefined ? projectEvidence() : input.projectEvidence,
    worktreeEvidence:
      input.worktreeEvidence === undefined ? worktreeEvidence() : input.worktreeEvidence,
    migrationSql: input.migrationSql === undefined ? migrationSql : input.migrationSql,
    evaluatedAtIso,
  });
}

test.describe("post-trade staging migration deployment gate", () => {
  test("default gate is blocked and performs no deployment", () => {
    const decision = evaluatePostTradeStagingMigrationDeploymentGate();

    expect(decision.approved).toBe(false);
    expect(decision.deploymentEnabled).toBe(false);
    expect(decision.deploymentStatus).toBe("not_deployed");
    expect(decision.remoteMutation).toBe(false);
    expect(decision.sqlExecuted).toBe(false);
    expect(decision.migrationsApplied).toBe(0);
    expect(decision.rowsCreated).toBe(0);
    expect(decision.targetProjectVerified).toBe(false);
  });

  test("canonical approval is structurally eligible but still no-deployment", () => {
    const decision = evaluate();

    expect(decision.approved).toBe(true);
    expect(decision.deploymentEnabled).toBe(false);
    expect(decision.deploymentStatus).toBe("not_deployed");
    expect(decision.remoteMutation).toBe(false);
    expect(decision.sqlExecuted).toBe(false);
    expect(decision.migrationsApplied).toBe(0);
    expect(decision.rowsCreated).toBe(0);
    expect(decision.targetProjectVerified).toBe(true);
    expect(decision.deploymentPlan.planStatus).toBe(
      "structurally_eligible_not_deployed",
    );
  });

  test("fingerprint binds exact path filename normalized SQL length and statement order", () => {
    const normalized = normalizePostTradeStagingMigrationSql(migrationSql);
    const fingerprint = buildPostTradeStagingMigrationFingerprint({
      migrationFilename: POST_TRADE_STAGING_MIGRATION_FILENAME,
      migrationPath: POST_TRADE_STAGING_MIGRATION_PATH,
      sql: migrationSql,
    });

    expect(Buffer.byteLength(normalized, "utf8")).toBe(
      POST_TRADE_STAGING_MIGRATION_EXPECTED_NORMALIZED_LENGTH,
    );
    expect(fingerprint).toBe(POST_TRADE_STAGING_MIGRATION_EXPECTED_FINGERPRINT);
    expect(POST_TRADE_STAGING_MIGRATION_EXPECTED_FINGERPRINT).toMatch(/^[a-f0-9]{64}$/);
    expect(POST_TRADE_STAGING_MIGRATION_EXPECTED_STATEMENT_INVENTORY).toMatchObject({
      createTable: 1,
      createUniqueIndex: 6,
      createIndex: 2,
      alterTable: 1,
      enableRowLevelSecurity: 1,
      revoke: 1,
      comment: 6,
      insert: 0,
      update: 0,
      delete: 0,
      copy: 0,
      function: 0,
      policy: 0,
      trigger: 0,
      rpc: 0,
      seed: 0,
    });
    expect(POST_TRADE_STAGING_MIGRATION_RLS_EXPECTATION).toMatchObject({
      enabled: true,
      clientPolicies: 0,
    });
    expect(
      buildPostTradeStagingMigrationFingerprint({
        migrationFilename: POST_TRADE_STAGING_MIGRATION_FILENAME,
        migrationPath: POST_TRADE_STAGING_MIGRATION_PATH,
        sql: migrationSql.replace("enable row level security", "-- moved\n"),
      }),
    ).not.toBe(fingerprint);
    expect(
      buildPostTradeStagingMigrationFingerprint({
        migrationFilename: POST_TRADE_STAGING_MIGRATION_FILENAME,
        migrationPath: POST_TRADE_STAGING_MIGRATION_PATH,
        sql: migrationSql.replace("pdvzyuhykomwfqyyztru", "aaaaaaaaaaaaaaaaaaaa"),
      }),
    ).not.toBe(fingerprint);
  });

  test("normalization binds comments literals constraints and only permits reviewed whitespace normalization", () => {
    const fingerprint = buildPostTradeStagingMigrationFingerprint({
      migrationFilename: POST_TRADE_STAGING_MIGRATION_FILENAME,
      migrationPath: POST_TRADE_STAGING_MIGRATION_PATH,
      sql: migrationSql,
    });
    const crlfSql = migrationSql.replace(/\n/g, "\r\n");
    const trailingWhitespaceSql = migrationSql
      .split("\n")
      .map((line) => `${line}   \t`)
      .join("\n");

    expect(
      buildPostTradeStagingMigrationFingerprint({
        migrationFilename: POST_TRADE_STAGING_MIGRATION_FILENAME,
        migrationPath: POST_TRADE_STAGING_MIGRATION_PATH,
        sql: crlfSql,
      }),
    ).toBe(fingerprint);
    expect(
      buildPostTradeStagingMigrationFingerprint({
        migrationFilename: POST_TRADE_STAGING_MIGRATION_FILENAME,
        migrationPath: POST_TRADE_STAGING_MIGRATION_PATH,
        sql: trailingWhitespaceSql,
      }),
    ).toBe(fingerprint);
    expect(
      buildPostTradeStagingMigrationFingerprint({
        migrationFilename: POST_TRADE_STAGING_MIGRATION_FILENAME,
        migrationPath: POST_TRADE_STAGING_MIGRATION_PATH,
        sql: `${migrationSql}\n`,
      }),
    ).not.toBe(fingerprint);
    expect(
      buildPostTradeStagingMigrationFingerprint({
        migrationFilename: POST_TRADE_STAGING_MIGRATION_FILENAME,
        migrationPath: POST_TRADE_STAGING_MIGRATION_PATH,
        sql: migrationSql.replace("on delete restrict", "on delete cascade"),
      }),
    ).not.toBe(fingerprint);
    expect(
      buildPostTradeStagingMigrationFingerprint({
        migrationFilename: POST_TRADE_STAGING_MIGRATION_FILENAME,
        migrationPath: POST_TRADE_STAGING_MIGRATION_PATH,
        sql: migrationSql.replace("Do not add direct client", "Do not add indirect client"),
      }),
    ).not.toBe(fingerprint);
  });

  test("migration filename path and full fingerprint are exact", () => {
    for (const badApproval of [
      approval({ migrationFilename: "20260710000001_other.sql" as never }),
      approval({ migrationPath: "supabase/migrations/other.sql" as never }),
      approval({ migrationFingerprint: "" }),
      approval({ migrationFingerprint: POST_TRADE_STAGING_MIGRATION_EXPECTED_FINGERPRINT.toUpperCase() }),
      approval({ migrationFingerprint: POST_TRADE_STAGING_MIGRATION_EXPECTED_FINGERPRINT.slice(0, 12) }),
      approval({ migrationFingerprint: "z".repeat(64) }),
      approval({
        migrationFingerprint: `${POST_TRADE_STAGING_MIGRATION_EXPECTED_FINGERPRINT.slice(0, 63)}0`,
      }),
    ]) {
      expect(evaluate({ approval: badApproval }).approved).toBe(false);
    }
  });

  test("project verification must be exact fresh unambiguous staging evidence", () => {
    for (const evidence of [
      null,
      { ...projectEvidence(), verified: true },
      { ...projectEvidence(), isStaging: true },
      projectEvidence({ evidenceVersion: "wrong" as never }),
      projectEvidence({ resolvedProjectRef: ` ${POST_TRADE_STAGING_MIGRATION_PROJECT_REF}` }),
      projectEvidence({ projectIdentitySource: "unknown" as never }),
      projectEvidence({ identitySourceAgreement: "caller_asserted" as never }),
      projectEvidence({ resolvedProjectRef: POST_TRADE_STAGING_MIGRATION_REJECTED_PRODUCTION_REF }),
      projectEvidence({ resolvedProjectRef: "alternate-project" }),
      projectEvidence({ linkedProjectRef: "alternate-project" }),
      projectEvidence({ environmentProjectRef: "alternate-project" }),
      projectEvidence({ environmentClassification: "production" as never }),
      projectEvidence({ verificationResult: "missing" as never }),
      projectEvidence({ ambiguous: true as never }),
      projectEvidence({ verifiedAtIso: "2026-07-12T10:00:00.000Z" }),
      projectEvidence({ verifiedAtIso: "2026-07-12T12:10:01.000Z" }),
    ]) {
      expect(evaluate({ projectEvidence: evidence }).approved).toBe(false);
    }
  });

  test("approval state timing one-shot retry and counts fail closed", () => {
    for (const badApproval of [
      approval({ approvalState: "consumed" }),
      approval({ approvalState: "invalid" }),
      approval({ approvalState: "expired" }),
      approval({ issuedAtIso: "2026-07-12T12:10:01.000Z" }),
      approval({ expiresAtIso: "2026-07-12T11:59:59.000Z" }),
      approval({ issuedAtIso: "2026-07-12T12:30:00.000Z", expiresAtIso: "2026-07-12T12:29:00.000Z" }),
      approval({ issuedAtIso: "2026-07-12T08:00:00.000Z", expiresAtIso: "2026-07-12T13:00:00.000Z" }),
      approval({ oneShot: false as never }),
      approval({ retryAllowed: true as never }),
      approval({ expectedMigrationCount: 2 as never }),
      approval({ expectedRowCount: 1 as never }),
      approval({ expectedFunctionCount: 1 as never }),
      approval({ expectedPolicyCount: 1 as never }),
      approval({ expectedTriggerCount: 1 as never }),
      approval({ expectedRpcCount: 1 as never }),
      approval({ expectedSeedCount: 1 as never }),
    ]) {
      expect(evaluate({ approval: badApproval }).approved).toBe(false);
    }
  });

  test("unknown fields missing ids and decision mismatches are blocked", () => {
    expect(evaluate({ approval: { ...approval(), unexpected: true } }).approved).toBe(false);
    expect(evaluate({ approval: { ...approval(), callback: () => true } }).approved).toBe(false);
    expect(
      evaluate({
        approval: {
          ...approval(),
          forbiddenCapabilities: {
            ...approval().forbiddenCapabilities,
            unexpectedNested: false,
          },
        },
      }).approved,
    ).toBe(false);
    expect(evaluate({ approval: approval({ approvalId: "" }) }).approved).toBe(false);
    expect(
      evaluate({
        approval: approval({
          action499ImplementationDecision: "wrong" as never,
        }),
      }).approved,
    ).toBe(false);
    expect(
      evaluate({
        approval: approval({
          action500ReviewDecision: "wrong" as never,
        }),
      }).approved,
    ).toBe(false);
    expect(
      evaluate({
        approval: approval({
          reviewedMigrationArtifact: "docs/other.md" as never,
        }),
      }).approved,
    ).toBe(false);
  });

  test("worktree scope must contain only the reviewed deployment unit", () => {
    expect(
      evaluate({
        worktreeEvidence: worktreeEvidence({
          evidenceVersion: "wrong" as never,
        }),
      }).approved,
    ).toBe(false);
    expect(
      evaluate({
        worktreeEvidence: worktreeEvidence({
          inspectedAtIso: "2026-07-12T10:00:00.000Z",
        }),
      }).approved,
    ).toBe(false);
    expect(
      evaluate({
        worktreeEvidence: worktreeEvidence({
          inspectedAtIso: "2026-07-12T12:10:01.000Z",
        }),
      }).approved,
    ).toBe(false);
    expect(
      evaluate({
        worktreeEvidence: worktreeEvidence({
          deploymentFiles: POST_TRADE_STAGING_MIGRATION_ALLOWED_SCOPE_FILES.slice(1),
        }),
      }).approved,
    ).toBe(false);
    expect(
      evaluate({
        worktreeEvidence: worktreeEvidence({
          deploymentFiles: [
            ...POST_TRADE_STAGING_MIGRATION_ALLOWED_SCOPE_FILES,
            POST_TRADE_STAGING_MIGRATION_ALLOWED_SCOPE_FILES[0],
          ],
        }),
      }).approved,
    ).toBe(false);
    for (const unsafePath of [
      "/tmp/absolute.sql",
      "../supabase/migrations/escape.sql",
      "supabase\\migrations\\windows.sql",
      "supabase//migrations/double.sql",
      " supabase/migrations/spaced.sql",
    ]) {
      expect(
        evaluate({
          worktreeEvidence: worktreeEvidence({
            deploymentFiles: [
              ...POST_TRADE_STAGING_MIGRATION_ALLOWED_SCOPE_FILES,
              unsafePath,
            ],
          }),
        }).approved,
      ).toBe(false);
    }
    expect(
      evaluate({
        worktreeEvidence: worktreeEvidence({
          migrationFiles: [
            POST_TRADE_STAGING_MIGRATION_PATH,
            "supabase/migrations/20260711000000_unreviewed.sql",
          ],
        }),
      }).approved,
    ).toBe(false);
    expect(
      evaluate({
        worktreeEvidence: worktreeEvidence({
          unreviewedMigrationFiles: ["supabase/migrations/20260711000000_unreviewed.sql"],
        }),
      }).approved,
    ).toBe(false);
    for (const unrelatedFile of POST_TRADE_STAGING_MIGRATION_UNRELATED_FILES) {
      expect(
        evaluate({
          worktreeEvidence: worktreeEvidence({
            unrelatedFilesPresent: [unrelatedFile],
          }),
        }).approved,
      ).toBe(false);
    }
  });

  test("forbidden deployment capabilities are blocked individually", () => {
    const canonical = approval();
    for (const key of Object.keys(canonical.forbiddenCapabilities)) {
      expect(
        evaluate({
          approval: {
            ...canonical,
            forbiddenCapabilities: {
              ...canonical.forbiddenCapabilities,
              [key]: true,
            },
          },
        }).approved,
      ).toBe(false);
    }
  });

  test("secret and production fields outside explicit rejection metadata are blocked", () => {
    expect(evaluate({ approval: { ...approval(), credentials: "x" } }).approved).toBe(false);
    expect(evaluate({ approval: { ...approval(), cookie: "x" } }).approved).toBe(false);
    expect(evaluate({ approval: { ...approval(), session: "x" } }).approved).toBe(false);
    expect(evaluate({ approval: { ...approval(), BankID: "x" } }).approved).toBe(false);
    expect(
      evaluate({
        approval: {
          ...approval(),
          expectedTargetProjectRef: POST_TRADE_STAGING_MIGRATION_REJECTED_PRODUCTION_REF,
        },
      }).approved,
    ).toBe(false);
  });

  test("migration SQL evidence must match reviewed content and remain safe", () => {
    for (const sql of [
      "",
      migrationSql.replace("authorization_state text not null default 'unused'", ""),
      `${migrationSql}\ninsert into public.execution_authorization_consumptions default values;`,
      `${migrationSql}\ncreate function public.bad() returns void language sql as $$ select 1 $$;`,
      `${migrationSql}\ncreate policy p on public.execution_authorization_consumptions using (true);`,
      `${migrationSql}\ncreate trigger t after insert on public.execution_authorization_consumptions execute function public.bad();`,
      `${migrationSql}\n-- rpc`,
    ]) {
      expect(evaluate({ migrationSql: sql }).approved).toBe(false);
    }
  });

  test("production references and unsupported nested values are recursively blocked", () => {
    expect(
      evaluate({
        projectEvidence: {
          ...projectEvidence(),
          metadata: [`https://${POST_TRADE_STAGING_MIGRATION_REJECTED_PRODUCTION_REF}.supabase.co`],
        },
      }).approved,
    ).toBe(false);
    expect(
      evaluate({
        worktreeEvidence: {
          ...worktreeEvidence(),
          metadata: { project: POST_TRADE_STAGING_MIGRATION_REJECTED_PRODUCTION_REF },
        },
      }).approved,
    ).toBe(false);
    expect(
      evaluate({
        approval: {
          ...approval(),
          metadata: new Map([["project", POST_TRADE_STAGING_MIGRATION_PROJECT_REF]]),
        },
      }).approved,
    ).toBe(false);
  });

  test("future deployment plan remains one-migration staging-only and inert", () => {
    const plan = evaluate().deploymentPlan;

    expect(plan.targetProjectRef).toBe(POST_TRADE_STAGING_MIGRATION_PROJECT_REF);
    expect(plan.migrationPath).toBe(POST_TRADE_STAGING_MIGRATION_PATH);
    expect(plan.deploymentEnabled).toBe(false);
    expect(plan.remoteMutation).toBe(false);
    expect(plan.sqlExecuted).toBe(false);
    expect(plan.migrationsApplied).toBe(0);
    expect(plan.rowsCreated).toBe(0);
    expect(plan.containsSecrets).toBe(false);
    expect(plan.containsServiceRoleKey).toBe(false);
    expect(plan.performsShellCommand).toBe(false);
    expect(plan.performsSupabaseCall).toBe(false);
    expect(JSON.stringify(plan)).not.toContain("service_role");
    expect(JSON.stringify(plan)).not.toContain("ekdyopdrrkphlrsilyoo");
  });

  test("repeated evaluation is deterministic and side-effect free", () => {
    const first = evaluate();
    const second = evaluate();

    expect(second).toEqual(first);
  });

  test("server-only boundary and core contain no deployment side-effect fragments", () => {
    expect(boundarySource).toContain('import "server-only"');
    expect(coreSource).not.toContain("process.env");
    expect(coreSource).not.toContain("child_process");
    expect(coreSource).not.toContain("exec(");
    expect(coreSource).not.toContain("spawn(");
    expect(coreSource).not.toContain("@supabase/supabase-js");
    expect(coreSource).not.toContain("createClient");
    expect(coreSource).not.toContain(".insert(");
    expect(coreSource).not.toContain(".upsert(");
    expect(coreSource).not.toContain(".delete(");
    expect(coreSource).not.toContain(".rpc(");
    expect(coreSource).not.toContain("writeFileSync");
    expect(coreSource).not.toContain("git ");
    expect(tradeUiSource).not.toContain("post-trade-staging-migration-deployment-gate");
  });

  test("evidence builders emit versioned source-controlled contracts", () => {
    expect(projectEvidence().evidenceVersion).toBe(
      POST_TRADE_STAGING_MIGRATION_PROJECT_EVIDENCE_VERSION,
    );
    expect(worktreeEvidence().evidenceVersion).toBe(
      POST_TRADE_STAGING_MIGRATION_WORKTREE_EVIDENCE_VERSION,
    );
  });
});
