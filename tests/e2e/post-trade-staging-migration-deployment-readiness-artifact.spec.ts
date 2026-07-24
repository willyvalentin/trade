import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  buildPostTradeStagingMigrationDeploymentPreflightPlan,
  buildPostTradeStagingMigrationDeploymentReadinessArtifact,
  buildPostTradeStagingMigrationDeploymentReadinessArtifactFingerprint,
  mapReadinessArtifactToDeploymentGateCompatibility,
  POST_TRADE_STAGING_MIGRATION_DEPLOYMENT_ATTEMPT_ID,
  POST_TRADE_STAGING_MIGRATION_DEPLOYMENT_GATE_IMPLEMENTATION_DECISION,
  POST_TRADE_STAGING_MIGRATION_DEPLOYMENT_GATE_REVIEW_DECISION,
  POST_TRADE_STAGING_MIGRATION_DEPLOYMENT_OPERATION_ID,
  POST_TRADE_STAGING_MIGRATION_DEPLOYMENT_READINESS_ALLOWED_SCOPE_FILES,
  POST_TRADE_STAGING_MIGRATION_DEPLOYMENT_READINESS_ARTIFACT_ID,
  POST_TRADE_STAGING_MIGRATION_DEPLOYMENT_READINESS_ARTIFACT_VERSION,
  POST_TRADE_STAGING_MIGRATION_DEPLOYMENT_READINESS_CONTRACT_VERSION,
  POST_TRADE_STAGING_MIGRATION_DEPLOYMENT_READINESS_SECURITY_PROHIBITIONS,
  POST_TRADE_STAGING_MIGRATION_DEPLOYMENT_READINESS_UNRELATED_FILE_DENYLIST,
  validatePostTradeStagingMigrationDeploymentReadinessArtifact,
  type PostTradeStagingMigrationDeploymentReadinessArtifact,
} from "../../lib/post-trade-staging-migration-deployment-readiness-artifact-core";
import {
  POST_TRADE_STAGING_MIGRATION_EXPECTED_FINGERPRINT,
  POST_TRADE_STAGING_MIGRATION_FILENAME,
  POST_TRADE_STAGING_MIGRATION_IMPLEMENTATION_DECISION,
  POST_TRADE_STAGING_MIGRATION_PATH,
  POST_TRADE_STAGING_MIGRATION_PROJECT_EVIDENCE_VERSION,
  POST_TRADE_STAGING_MIGRATION_PROJECT_REF,
  POST_TRADE_STAGING_MIGRATION_REJECTED_PRODUCTION_REF,
  POST_TRADE_STAGING_MIGRATION_SQL_REVIEW_DECISION,
  POST_TRADE_STAGING_MIGRATION_TARGET_TABLE,
  POST_TRADE_STAGING_MIGRATION_WORKTREE_EVIDENCE_VERSION,
} from "../../lib/post-trade-staging-migration-deployment-gate-core";

const evaluatedAtIso = "2026-07-12T12:30:00.000Z";

function artifact(overrides: Partial<PostTradeStagingMigrationDeploymentReadinessArtifact> = {}) {
  const base = buildPostTradeStagingMigrationDeploymentReadinessArtifact();
  const next = {
    ...base,
    ...overrides,
  };
  if (Object.keys(overrides).includes("artifactFingerprint")) return next;
  const core = { ...next };
  delete (core as Partial<PostTradeStagingMigrationDeploymentReadinessArtifact>).artifactFingerprint;
  return {
    ...next,
    artifactFingerprint:
      buildPostTradeStagingMigrationDeploymentReadinessArtifactFingerprint(core),
  };
}

function validate(input: unknown = artifact()) {
  return validatePostTradeStagingMigrationDeploymentReadinessArtifact(
    input,
    evaluatedAtIso,
  );
}

test.describe("post-trade staging migration deployment readiness artifact", () => {
  test("canonical readiness artifact is source-controlled staging-only and deployment-disabled", () => {
    const canonical = artifact();
    const decision = validate(canonical);

    expect(decision.valid).toBe(true);
    expect(decision.structurallyReadyForFuturePreflight).toBe(true);
    expect(canonical.artifactId).toBe(POST_TRADE_STAGING_MIGRATION_DEPLOYMENT_READINESS_ARTIFACT_ID);
    expect(canonical.artifactVersion).toBe(
      POST_TRADE_STAGING_MIGRATION_DEPLOYMENT_READINESS_ARTIFACT_VERSION,
    );
    expect(canonical.readinessContractVersion).toBe(
      POST_TRADE_STAGING_MIGRATION_DEPLOYMENT_READINESS_CONTRACT_VERSION,
    );
    expect(canonical.projectIdentity.expectedStagingProjectRef).toBe(
      POST_TRADE_STAGING_MIGRATION_PROJECT_REF,
    );
    expect(canonical.projectIdentity.rejectedProductionProjectRef).toBe(
      POST_TRADE_STAGING_MIGRATION_REJECTED_PRODUCTION_REF,
    );
    expect(canonical.security.stagingOnly).toBe(true);
    expect(canonical.security.oneShot).toBe(true);
    expect(canonical.security.retryAllowed).toBe(false);
    expect(decision.deploymentEnabled).toBe(false);
    expect(decision.deploymentStatus).toBe("not_deployed");
    expect(decision.remoteMutation).toBe(false);
    expect(decision.sqlExecuted).toBe(false);
    expect(decision.migrationsApplied).toBe(0);
    expect(decision.rowsCreated).toBe(0);
    expect(decision.projectVerificationLive).toBe(false);
    expect(decision.worktreeVerificationLive).toBe(false);
    expect(decision.deploymentAttemptConsumed).toBe(false);
  });

  test("canonical artifact binds exact migration identity and reviewed SHA-256", () => {
    const canonical = artifact();

    expect(canonical.migrationIdentity.filename).toBe(POST_TRADE_STAGING_MIGRATION_FILENAME);
    expect(canonical.migrationIdentity.path).toBe(POST_TRADE_STAGING_MIGRATION_PATH);
    expect(canonical.migrationIdentity.fingerprint).toBe(
      POST_TRADE_STAGING_MIGRATION_EXPECTED_FINGERPRINT,
    );
    expect(canonical.migrationIdentity.fingerprint).toMatch(/^[a-f0-9]{64}$/);
    expect(canonical.migrationIdentity.fingerprintAlgorithm).toBe("sha256");
    expect(canonical.migrationIdentity.targetTable).toBe(
      POST_TRADE_STAGING_MIGRATION_TARGET_TABLE,
    );
    expect(canonical.migrationIdentity.expectedMigrationCount).toBe(1);
    expect(canonical.deploymentScope.expectedCreatedTables).toEqual([
      POST_TRADE_STAGING_MIGRATION_TARGET_TABLE,
    ]);
  });

  test("artifact fingerprint binds critical identities and rejects hash variants", () => {
    const canonical = artifact();
    const changedCases = [
      artifact({ artifactId: "other" as never }),
      artifact({ artifactVersion: "other" as never }),
      artifact({ artifactType: "other" as never }),
      artifact({ sourceActionIdentity: "other" as never }),
      artifact({ gateContractVersion: "other" as never }),
      artifact({ readinessContractVersion: "other" as never }),
      artifact({
        migrationIdentity: {
          ...canonical.migrationIdentity,
          filename: "20260710000000_other.sql" as never,
        },
      }),
      artifact({
        migrationIdentity: {
          ...canonical.migrationIdentity,
          path: "supabase/migrations/20260710000000_other.sql" as never,
        },
      }),
      artifact({
        migrationIdentity: {
          ...canonical.migrationIdentity,
          timestampPrefix: "20260710000001" as never,
        },
      }),
      artifact({
        migrationIdentity: {
          ...canonical.migrationIdentity,
          fingerprint: "a".repeat(64) as never,
        },
      }),
      artifact({
        migrationIdentity: {
          ...canonical.migrationIdentity,
          targetTable: "public.other" as never,
        },
      }),
      artifact({
        migrationIdentity: {
          ...canonical.migrationIdentity,
          expectedStatementInventory: {
            ...canonical.migrationIdentity.expectedStatementInventory,
            comment: 5,
          } as never,
        },
      }),
      artifact({
        projectIdentity: {
          ...canonical.projectIdentity,
          expectedStagingProjectRef: "aaaaaaaaaaaaaaaaaaaa" as never,
        },
      }),
      artifact({
        projectIdentity: {
          ...canonical.projectIdentity,
          rejectedProductionProjectRef: "aaaaaaaaaaaaaaaaaaaa" as never,
        },
      }),
      artifact({
        projectIdentity: {
          ...canonical.projectIdentity,
          requiredProjectEvidenceVersion: "other" as never,
        },
      }),
      artifact({
        worktreeBinding: {
          ...canonical.worktreeBinding,
          requiredWorktreeEvidenceVersion: "other" as never,
        },
      }),
      artifact({
        reviewBinding: {
          ...canonical.reviewBinding,
          action502DeploymentGateReviewDecision: "wrong" as never,
        },
      }),
      artifact({
        reviewBinding: {
          ...canonical.reviewBinding,
          migrationImplementationCheckpoint: "docs/other.md" as never,
        },
      }),
      artifact({
        reviewBinding: {
          ...canonical.reviewBinding,
          migrationSqlReviewCheckpoint: "docs/other.md" as never,
        },
      }),
      artifact({
        reviewBinding: {
          ...canonical.reviewBinding,
          deploymentGateImplementationCheckpoint: "docs/other.md" as never,
        },
      }),
      artifact({
        reviewBinding: {
          ...canonical.reviewBinding,
          deploymentGateReviewCheckpoint: "docs/other.md" as never,
        },
      }),
      artifact({
        attemptModel: {
          ...canonical.attemptModel,
          deploymentAttemptId: "other" as never,
        },
      }),
      artifact({
        attemptModel: {
          ...canonical.attemptModel,
          deploymentOperationId: "other" as never,
        },
      }),
      artifact({
        worktreeBinding: {
          ...canonical.worktreeBinding,
          reviewedDeploymentFileAllowlist:
            canonical.worktreeBinding.reviewedDeploymentFileAllowlist.slice(1) as never,
        },
      }),
      artifact({
        worktreeBinding: {
          ...canonical.worktreeBinding,
          unrelatedFileDenylist:
            canonical.worktreeBinding.unrelatedFileDenylist.slice(1) as never,
        },
      }),
      artifact({
        deploymentScope: {
          ...canonical.deploymentScope,
          expectedRowCount: 1 as never,
        },
      }),
      artifact({
        deploymentScope: {
          ...canonical.deploymentScope,
          expectedCreatedTables: ["public.other"] as never,
        },
      }),
    ];

    for (const changed of changedCases) {
      expect(changed.artifactFingerprint).not.toBe(canonical.artifactFingerprint);
      expect(validate(changed).valid).toBe(false);
    }

    for (const changedTimestamp of [
      artifact({ issuedAtIso: "2026-07-12T12:01:00.000Z" }),
      artifact({ expiresAtIso: "2026-07-12T12:59:00.000Z" }),
    ]) {
      expect(changedTimestamp.artifactFingerprint).not.toBe(canonical.artifactFingerprint);
      expect(validate(changedTimestamp).valid).toBe(true);
    }

    for (const badFingerprint of [
      "",
      canonical.artifactFingerprint.slice(0, 12),
      canonical.artifactFingerprint.toUpperCase(),
      "z".repeat(64),
    ]) {
      expect(validate({ ...canonical, artifactFingerprint: badFingerprint }).valid).toBe(false);
    }
  });

  test("artifact shape timing state and deployment status fail closed", () => {
    const canonical = artifact();
    const badArtifacts = [
      null,
      { ...canonical, unexpected: true },
      { ...canonical, artifactId: "" },
      { ...canonical, artifactId: null },
      artifact({ issuedAtIso: "bad" }),
      artifact({ expiresAtIso: "bad" }),
      artifact({ issuedAtIso: "2026-07-12T12:10:00.000Z", expiresAtIso: "2026-07-12T12:09:00.000Z" }),
      artifact({ issuedAtIso: "2026-07-12T09:00:00.000Z", expiresAtIso: "2026-07-12T13:00:00.000Z" }),
      artifact({ issuedAtIso: "2026-07-12T12:40:01.000Z" }),
      artifact({ expiresAtIso: "2026-07-12T12:29:59.000Z" }),
      artifact({ artifactState: "consumed" }),
      artifact({ artifactState: "invalid" }),
      artifact({ artifactState: "expired" }),
      artifact({ readinessState: "blocked" }),
      artifact({ deploymentEnabled: true as never }),
      artifact({ deploymentStatus: "deployed" as never }),
      artifact({ remoteMutation: true as never }),
      artifact({ sqlExecuted: true as never }),
      artifact({ migrationsApplied: 1 as never }),
      artifact({ rowsCreated: 1 as never }),
    ];

    for (const badArtifact of badArtifacts) {
      expect(validate(badArtifact).valid).toBe(false);
    }
  });

  test("project review and deployment scope cannot broaden", () => {
    const canonical = artifact();
    const badArtifacts = [
      artifact({
        projectIdentity: {
          ...canonical.projectIdentity,
          expectedStagingProjectRef: POST_TRADE_STAGING_MIGRATION_REJECTED_PRODUCTION_REF as never,
        },
      }),
      artifact({
        projectIdentity: {
          ...canonical.projectIdentity,
          projectVerificationLive: true as never,
        },
      }),
      artifact({
        reviewBinding: {
          ...canonical.reviewBinding,
          action499ImplementationDecision: "wrong" as never,
        },
      }),
      artifact({
        reviewBinding: {
          ...canonical.reviewBinding,
          action500SqlReviewDecision: "wrong" as never,
        },
      }),
      artifact({
        reviewBinding: {
          ...canonical.reviewBinding,
          action501DeploymentGateImplementationDecision: "wrong" as never,
        },
      }),
      artifact({
        deploymentScope: {
          ...canonical.deploymentScope,
          expectedRowCount: 1 as never,
        },
      }),
      artifact({
        deploymentScope: {
          ...canonical.deploymentScope,
          expectedTargetTableCount: 2 as never,
        },
      }),
      artifact({
        deploymentScope: {
          ...canonical.deploymentScope,
          expectedCreatedTables: [
            POST_TRADE_STAGING_MIGRATION_TARGET_TABLE,
            "public.extra",
          ] as never,
        },
      }),
      artifact({
        deploymentScope: {
          ...canonical.deploymentScope,
          expectedAlteredExistingTableCount: 1 as never,
        },
      }),
      artifact({
        deploymentScope: {
          ...canonical.deploymentScope,
          expectedDroppedObjectCount: 1 as never,
        },
      }),
      artifact({
        deploymentScope: {
          ...canonical.deploymentScope,
          expectedDestructiveStatementCount: 1 as never,
        },
      }),
      artifact({
        deploymentScope: {
          ...canonical.deploymentScope,
          expectedFunctionCount: 1 as never,
        },
      }),
      artifact({
        deploymentScope: {
          ...canonical.deploymentScope,
          expectedPolicyCount: 1 as never,
        },
      }),
      artifact({
        deploymentScope: {
          ...canonical.deploymentScope,
          expectedTriggerCount: 1 as never,
        },
      }),
      artifact({
        deploymentScope: {
          ...canonical.deploymentScope,
          expectedRpcCount: 1 as never,
        },
      }),
      artifact({
        deploymentScope: {
          ...canonical.deploymentScope,
          expectedSeedCount: 1 as never,
        },
      }),
    ];

    for (const badArtifact of badArtifacts) {
      expect(validate(badArtifact).valid).toBe(false);
    }
  });

  test("forbidden security capabilities are rejected individually", () => {
    const canonical = artifact();
    for (const key of Object.keys(POST_TRADE_STAGING_MIGRATION_DEPLOYMENT_READINESS_SECURITY_PROHIBITIONS)) {
      expect(
        validate(
          artifact({
            security: {
              ...canonical.security,
              [key]: true,
            },
          }),
        ).valid,
      ).toBe(false);
    }
    expect(
      validate(artifact({ security: { ...canonical.security, oneShot: false } as never })).valid,
    ).toBe(false);
    expect(
      validate(artifact({ security: { ...canonical.security, retryAllowed: true } as never })).valid,
    ).toBe(false);
  });

  test("worktree binding requires exact allowlist denylist and safe paths", () => {
    const canonical = artifact();

    expect(POST_TRADE_STAGING_MIGRATION_DEPLOYMENT_READINESS_ALLOWED_SCOPE_FILES).toContain(
      "lib/post-trade-staging-migration-deployment-readiness-artifact-core.ts",
    );
    expect(canonical.worktreeBinding.unrelatedFileDenylist).toEqual(
      POST_TRADE_STAGING_MIGRATION_DEPLOYMENT_READINESS_UNRELATED_FILE_DENYLIST,
    );
    expect(canonical.worktreeBinding.unrelatedFileDenylist).toContain(
      "docs/action-369-copy-on-write-dependency-clone-capability-evidence.json",
    );

    const badArtifacts = [
      artifact({
        worktreeBinding: {
          ...canonical.worktreeBinding,
          reviewedDeploymentFileAllowlist:
            POST_TRADE_STAGING_MIGRATION_DEPLOYMENT_READINESS_ALLOWED_SCOPE_FILES.slice(1) as never,
        },
      }),
      artifact({
        worktreeBinding: {
          ...canonical.worktreeBinding,
          reviewedDeploymentFileAllowlist: [
            ...POST_TRADE_STAGING_MIGRATION_DEPLOYMENT_READINESS_ALLOWED_SCOPE_FILES,
            POST_TRADE_STAGING_MIGRATION_DEPLOYMENT_READINESS_ALLOWED_SCOPE_FILES[0],
          ] as never,
        },
      }),
      artifact({
        worktreeBinding: {
          ...canonical.worktreeBinding,
          reviewedDeploymentFileAllowlist: [
            ...POST_TRADE_STAGING_MIGRATION_DEPLOYMENT_READINESS_ALLOWED_SCOPE_FILES,
            "./relative-prefix.sql",
          ] as never,
        },
      }),
      artifact({
        worktreeBinding: {
          ...canonical.worktreeBinding,
          reviewedDeploymentFileAllowlist: [
            ...POST_TRADE_STAGING_MIGRATION_DEPLOYMENT_READINESS_ALLOWED_SCOPE_FILES,
            "docs/%2e%2e/encoded.sql",
          ] as never,
        },
      }),
      artifact({
        worktreeBinding: {
          ...canonical.worktreeBinding,
          reviewedDeploymentFileAllowlist: [
            ...POST_TRADE_STAGING_MIGRATION_DEPLOYMENT_READINESS_ALLOWED_SCOPE_FILES,
            "docs/action\u0000nul.md",
          ] as never,
        },
      }),
      artifact({
        worktreeBinding: {
          ...canonical.worktreeBinding,
          reviewedDeploymentFileAllowlist: [
            ...POST_TRADE_STAGING_MIGRATION_DEPLOYMENT_READINESS_ALLOWED_SCOPE_FILES,
            "docs/action\u001fcontrol.md",
          ] as never,
        },
      }),
      artifact({
        worktreeBinding: {
          ...canonical.worktreeBinding,
          reviewedDeploymentFileAllowlist: [
            ...POST_TRADE_STAGING_MIGRATION_DEPLOYMENT_READINESS_ALLOWED_SCOPE_FILES,
            "Docs/case-variant.md",
          ] as never,
        },
      }),
      artifact({
        worktreeBinding: {
          ...canonical.worktreeBinding,
          reviewedDeploymentFileAllowlist: [
            ...POST_TRADE_STAGING_MIGRATION_DEPLOYMENT_READINESS_ALLOWED_SCOPE_FILES,
            "docs/action\u2215unicode-slash.md",
          ] as never,
        },
      }),
      artifact({
        worktreeBinding: {
          ...canonical.worktreeBinding,
          reviewedMigrationAllowlist: [
            POST_TRADE_STAGING_MIGRATION_PATH,
            "supabase/migrations/20260711000000_extra.sql",
          ] as never,
        },
      }),
      artifact({
        worktreeBinding: {
          ...canonical.worktreeBinding,
          reviewedDeploymentFileAllowlist: [
            ...POST_TRADE_STAGING_MIGRATION_DEPLOYMENT_READINESS_ALLOWED_SCOPE_FILES,
            "/tmp/absolute.sql",
          ] as never,
        },
      }),
      artifact({
        worktreeBinding: {
          ...canonical.worktreeBinding,
          reviewedDeploymentFileAllowlist: [
            ...POST_TRADE_STAGING_MIGRATION_DEPLOYMENT_READINESS_ALLOWED_SCOPE_FILES,
            "../escape.sql",
          ] as never,
        },
      }),
      artifact({
        worktreeBinding: {
          ...canonical.worktreeBinding,
          reviewedDeploymentFileAllowlist: [
            ...POST_TRADE_STAGING_MIGRATION_DEPLOYMENT_READINESS_ALLOWED_SCOPE_FILES,
            POST_TRADE_STAGING_MIGRATION_DEPLOYMENT_READINESS_UNRELATED_FILE_DENYLIST[0],
          ] as never,
        },
      }),
      artifact({
        worktreeBinding: {
          ...canonical.worktreeBinding,
          unrelatedFileDenylist: [] as never,
        },
      }),
      artifact({
        worktreeBinding: {
          ...canonical.worktreeBinding,
          expectedUnappliedMigrationCount: 2 as never,
        },
      }),
      artifact({
        worktreeBinding: {
          ...canonical.worktreeBinding,
          worktreeVerificationLive: true as never,
        },
      }),
    ];

    for (const badArtifact of badArtifacts) {
      expect(validate(badArtifact).valid).toBe(false);
    }
  });

  test("secret fields unsupported values cycles and production references are rejected", () => {
    const canonical = artifact();
    const cyclic: Record<string, unknown> = { ...canonical };
    cyclic.self = cyclic;

    for (const badArtifact of [
      { ...canonical, credentials: "x" },
      { ...canonical, cookie: "x" },
      { ...canonical, session: "x" },
      { ...canonical, BankID: "x" },
      { ...canonical, nested: { project: POST_TRADE_STAGING_MIGRATION_REJECTED_PRODUCTION_REF } },
      { ...canonical, nested: [`https://${POST_TRADE_STAGING_MIGRATION_REJECTED_PRODUCTION_REF}.supabase.co`] },
      { ...canonical, nested: new Map([["x", "y"]]) },
      { ...canonical, nested: () => true },
      cyclic,
    ]) {
      expect(validate(badArtifact).valid).toBe(false);
    }

    expect(() =>
      buildPostTradeStagingMigrationDeploymentReadinessArtifactFingerprint(
        cyclic as never,
      ),
    ).toThrow();
    expect(() =>
      buildPostTradeStagingMigrationDeploymentReadinessArtifactFingerprint(
        { ...canonical, nested: new Map() } as never,
      ),
    ).toThrow();
  });

  test("gate compatibility mapping preserves readiness data and remains inert", () => {
    const canonical = artifact();
    const compatibility = mapReadinessArtifactToDeploymentGateCompatibility(canonical);

    expect(compatibility.compatible).toBe(true);
    expect(compatibility.migrationFilename).toBe(POST_TRADE_STAGING_MIGRATION_FILENAME);
    expect(compatibility.migrationPath).toBe(POST_TRADE_STAGING_MIGRATION_PATH);
    expect(compatibility.migrationFingerprint).toBe(
      POST_TRADE_STAGING_MIGRATION_EXPECTED_FINGERPRINT,
    );
    expect(compatibility.targetProjectRef).toBe(POST_TRADE_STAGING_MIGRATION_PROJECT_REF);
    expect(compatibility.rejectedProductionProjectRef).toBe(
      POST_TRADE_STAGING_MIGRATION_REJECTED_PRODUCTION_REF,
    );
    expect(compatibility.action499Decision).toBe(
      POST_TRADE_STAGING_MIGRATION_IMPLEMENTATION_DECISION,
    );
    expect(compatibility.action500Decision).toBe(
      POST_TRADE_STAGING_MIGRATION_SQL_REVIEW_DECISION,
    );
    expect(compatibility.action501Decision).toBe(
      POST_TRADE_STAGING_MIGRATION_DEPLOYMENT_GATE_IMPLEMENTATION_DECISION,
    );
    expect(compatibility.action502Decision).toBe(
      POST_TRADE_STAGING_MIGRATION_DEPLOYMENT_GATE_REVIEW_DECISION,
    );
    expect(compatibility.requiredProjectEvidenceVersion).toBe(
      POST_TRADE_STAGING_MIGRATION_PROJECT_EVIDENCE_VERSION,
    );
    expect(compatibility.requiredWorktreeEvidenceVersion).toBe(
      POST_TRADE_STAGING_MIGRATION_WORKTREE_EVIDENCE_VERSION,
    );
    expect(compatibility.preservesSchemaOnlyScope).toBe(true);
    expect(compatibility.preservesZeroRowScope).toBe(true);
    expect(compatibility.preservesOneShot).toBe(true);
    expect(compatibility.preservesNoRetry).toBe(true);
    expect(compatibility.claimsLiveEvidence).toBe(false);
    expect(compatibility.deploymentEnabled).toBe(false);
    expect(compatibility.remoteMutation).toBe(false);
    expect(compatibility.sqlExecuted).toBe(false);
    expect(mapReadinessArtifactToDeploymentGateCompatibility({ ...canonical, artifactId: "bad" }).compatible).toBe(false);
  });

  test("future preflight plan is inert and contains no executable command material", () => {
    const plan = buildPostTradeStagingMigrationDeploymentPreflightPlan(artifact());
    const planText = JSON.stringify(plan);

    expect(plan.planStatus).toBe("inert_future_preflight_only");
    expect(plan.targetProjectRef).toBe(POST_TRADE_STAGING_MIGRATION_PROJECT_REF);
    expect(plan.migrationPath).toBe(POST_TRADE_STAGING_MIGRATION_PATH);
    expect(plan.deploymentEnabled).toBe(false);
    expect(plan.remoteMutation).toBe(false);
    expect(plan.sqlExecuted).toBe(false);
    expect(plan.containsSecrets).toBe(false);
    expect(plan.containsExecutableCommands).toBe(false);
    expect(plan.containsSupabaseCommand).toBe(false);
    expect(plan.containsShellCommand).toBe(false);
    expect(planText).not.toContain("service_role");
    expect(planText).not.toContain("supabase db");
    expect(planText).not.toContain("sh -");
    expect(planText).not.toContain(POST_TRADE_STAGING_MIGRATION_REJECTED_PRODUCTION_REF);
    expect(plan.categories).toEqual([
      "verify_artifact_fingerprint",
      "verify_migration_fingerprint",
      "gather_authoritative_worktree_evidence",
      "gather_authoritative_project_evidence",
      "confirm_exact_staging_project",
      "confirm_production_rejection",
      "confirm_one_unapplied_migration",
      "confirm_no_unrelated_migration",
      "confirm_schema_only_zero_row_scope",
      "confirm_readiness_artifact_unused_and_unexpired",
      "evaluate_deployment_gate_as_inert_preflight",
      "require_separate_explicit_deployment_action",
    ]);
  });

  test("repeated validation and mapping are side-effect free", () => {
    const canonical = artifact();

    expect(validate(canonical)).toEqual(validate(canonical));
    expect(mapReadinessArtifactToDeploymentGateCompatibility(canonical)).toEqual(
      mapReadinessArtifactToDeploymentGateCompatibility(canonical),
    );
    expect(buildPostTradeStagingMigrationDeploymentPreflightPlan(canonical)).toEqual(
      buildPostTradeStagingMigrationDeploymentPreflightPlan(canonical),
    );
  });

  test("source boundary has no Supabase shell SQL deployment or UI wiring fragments", () => {
    const coreSource = readFileSync(
      join(process.cwd(), "lib/post-trade-staging-migration-deployment-readiness-artifact-core.ts"),
      "utf8",
    );
    const boundarySource = readFileSync(
      join(process.cwd(), "lib/post-trade-staging-migration-deployment-readiness-artifact.ts"),
      "utf8",
    );
    const tradeUiSource = readFileSync(join(process.cwd(), "app/trade-app.tsx"), "utf8");

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
    expect(coreSource).not.toContain("supabase db");
    expect(coreSource).not.toContain("execute sql");
    expect(tradeUiSource).not.toContain("post-trade-staging-migration-deployment-readiness-artifact");
  });

  test("canonical attempt model is exact single-use unused not-attempted", () => {
    const canonical = artifact();

    expect(canonical.attemptModel.deploymentAttemptId).toBe(
      POST_TRADE_STAGING_MIGRATION_DEPLOYMENT_ATTEMPT_ID,
    );
    expect(canonical.attemptModel.deploymentOperationId).toBe(
      POST_TRADE_STAGING_MIGRATION_DEPLOYMENT_OPERATION_ID,
    );
    expect(canonical.attemptModel.oneShotState).toBe("single_use");
    expect(canonical.attemptModel.noRetryState).toBe("retry_disabled");
    expect(canonical.attemptModel.consumptionState).toBe("not_consumed");
    expect(canonical.attemptModel.deploymentAttemptConsumed).toBe(false);
    expect(canonical.attemptModel.deploymentAttemptStatus).toBe("not_attempted");
    expect(canonical.reviewBinding.action502DeploymentGateReviewDecision).toBe(
      POST_TRADE_STAGING_MIGRATION_DEPLOYMENT_GATE_REVIEW_DECISION,
    );
  });
});
