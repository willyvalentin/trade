import { createHash } from "node:crypto";

import {
  POST_TRADE_STAGING_MIGRATION_ALLOWED_SCOPE_FILES,
  POST_TRADE_STAGING_MIGRATION_DEPLOYMENT_GATE_VERSION,
  POST_TRADE_STAGING_MIGRATION_EXPECTED_FINGERPRINT,
  POST_TRADE_STAGING_MIGRATION_EXPECTED_STATEMENT_INVENTORY,
  POST_TRADE_STAGING_MIGRATION_FILENAME,
  POST_TRADE_STAGING_MIGRATION_IMPLEMENTATION_DECISION,
  POST_TRADE_STAGING_MIGRATION_PATH,
  POST_TRADE_STAGING_MIGRATION_PROJECT_EVIDENCE_VERSION,
  POST_TRADE_STAGING_MIGRATION_PROJECT_REF,
  POST_TRADE_STAGING_MIGRATION_REJECTED_PRODUCTION_REF,
  POST_TRADE_STAGING_MIGRATION_REVIEW_ARTIFACT,
  POST_TRADE_STAGING_MIGRATION_SQL_REVIEW_DECISION,
  POST_TRADE_STAGING_MIGRATION_TARGET_TABLE,
  POST_TRADE_STAGING_MIGRATION_TIMESTAMP_PREFIX,
  POST_TRADE_STAGING_MIGRATION_UNRELATED_FILES,
  POST_TRADE_STAGING_MIGRATION_WORKTREE_EVIDENCE_VERSION,
} from "@/lib/post-trade-staging-migration-deployment-gate-core";

export const POST_TRADE_STAGING_MIGRATION_DEPLOYMENT_READINESS_ARTIFACT_ID =
  "post_trade_single_use_staging_migration_deployment_readiness_001" as const;
export const POST_TRADE_STAGING_MIGRATION_DEPLOYMENT_READINESS_ARTIFACT_VERSION =
  "post_trade_staging_migration_deployment_readiness_artifact_v1" as const;
export const POST_TRADE_STAGING_MIGRATION_DEPLOYMENT_READINESS_ARTIFACT_TYPE =
  "single_use_source_controlled_staging_migration_deployment_readiness" as const;
export const POST_TRADE_STAGING_MIGRATION_DEPLOYMENT_READINESS_CONTRACT_VERSION =
  "post_trade_staging_migration_deployment_readiness_contract_v1" as const;
export const POST_TRADE_STAGING_MIGRATION_DEPLOYMENT_READINESS_SOURCE_ACTION =
  "Action 503 - Add Single-Use Source-Controlled Staging Migration Deployment Readiness Artifact" as const;
export const POST_TRADE_STAGING_MIGRATION_DEPLOYMENT_READINESS_STATE =
  "ready_for_future_preflight" as const;
export const POST_TRADE_STAGING_MIGRATION_DEPLOYMENT_ATTEMPT_ID =
  "post_trade_staging_migration_deployment_attempt_001" as const;
export const POST_TRADE_STAGING_MIGRATION_DEPLOYMENT_OPERATION_ID =
  "post_trade_apply_execution_authorization_consumptions_schema_once_001" as const;

export const POST_TRADE_STAGING_MIGRATION_DEPLOYMENT_GATE_IMPLEMENTATION_DECISION =
  "post_trade_explicit_source_controlled_staging_migration_deployment_gate_ready_for_static_security_review" as const;
export const POST_TRADE_STAGING_MIGRATION_DEPLOYMENT_GATE_REVIEW_DECISION =
  "post_trade_explicit_source_controlled_staging_migration_deployment_gate_static_security_review_ready_for_deployment_readiness_artifact" as const;
export const POST_TRADE_STAGING_MIGRATION_DEPLOYMENT_GATE_IMPLEMENTATION_ARTIFACT =
  "docs/post-trade-explicit-source-controlled-staging-migration-deployment-gate-no-deployment.md" as const;
export const POST_TRADE_STAGING_MIGRATION_DEPLOYMENT_GATE_REVIEW_ARTIFACT =
  "docs/post-trade-explicit-source-controlled-staging-migration-deployment-gate-static-security-review-no-deployment.md" as const;
export const POST_TRADE_STAGING_MIGRATION_IMPLEMENTATION_ARTIFACT =
  "docs/post-trade-durable-authorization-consumption-source-controlled-staging-migration-no-deployment-no-execution.md" as const;
export const POST_TRADE_STAGING_MIGRATION_DEPLOYMENT_READINESS_CHECKPOINT =
  "docs/post-trade-single-use-source-controlled-staging-migration-deployment-readiness-artifact-no-deployment.md" as const;

export const POST_TRADE_STAGING_MIGRATION_DEPLOYMENT_READINESS_ALLOWED_SCOPE_FILES = [
  ...POST_TRADE_STAGING_MIGRATION_ALLOWED_SCOPE_FILES,
  "lib/post-trade-staging-migration-deployment-readiness-artifact-core.ts",
  "lib/post-trade-staging-migration-deployment-readiness-artifact.ts",
  "tests/e2e/post-trade-staging-migration-deployment-readiness-artifact.spec.ts",
  POST_TRADE_STAGING_MIGRATION_DEPLOYMENT_READINESS_CHECKPOINT,
] as const;

export const POST_TRADE_STAGING_MIGRATION_DEPLOYMENT_READINESS_UNRELATED_FILE_DENYLIST = [
  ...POST_TRADE_STAGING_MIGRATION_UNRELATED_FILES,
  "docs/action-369-copy-on-write-dependency-clone-capability-evidence.json",
  "docs/action-369-copy-on-write-dependency-clone-capability-verification.md",
  "scripts/action-369-copy-on-write-dependency-clone-capability-verification-verify.mjs",
  "tests/e2e/action-369-copy-on-write-dependency-clone-capability-verification.spec.ts",
] as const;

export const POST_TRADE_STAGING_MIGRATION_DEPLOYMENT_READINESS_SECURITY_PROHIBITIONS = {
  productionDeploymentAllowed: false,
  alternateProjectDeploymentAllowed: false,
  multipleMigrationDeploymentAllowed: false,
  rowWriteAllowed: false,
  seedAllowed: false,
  functionCreationAllowed: false,
  policyCreationAllowed: false,
  triggerCreationAllowed: false,
  rpcCreationAllowed: false,
  migrationRepairAllowed: false,
  schemaResetAllowed: false,
  destructiveRollbackAllowed: false,
  authorizationSeedingAllowed: false,
  authorizationConsumptionAllowed: false,
  executionRecordCreationAllowed: false,
  auditEventCreationAllowed: false,
  apiActivationAllowed: false,
  uiActivationAllowed: false,
  clientActivationAllowed: false,
  runtimeActivationAllowed: false,
  avanzaIntegrationAllowed: false,
  browserAutomationAllowed: false,
  buyBehaviorAllowed: false,
  sellBehaviorAllowed: false,
  credentialAccessAllowed: false,
  cookieAccessAllowed: false,
  sessionAccessAllowed: false,
  bankIdAccessAllowed: false,
  brokerStateAccessAllowed: false,
  settlementRetrievalAllowed: false,
  liveTradeMutationAllowed: false,
  livePositionMutationAllowed: false,
  automaticRetryAllowed: false,
  secondDeploymentAttemptAllowed: false,
} as const;

export type PostTradeStagingMigrationDeploymentReadinessArtifactState =
  | "unused"
  | "consumed"
  | "invalid"
  | "expired";

export type PostTradeStagingMigrationDeploymentReadinessClassification =
  | typeof POST_TRADE_STAGING_MIGRATION_DEPLOYMENT_READINESS_STATE
  | "blocked"
  | "invalid"
  | "expired";

export type PostTradeStagingMigrationDeploymentReadinessArtifactCore = {
  artifactId: typeof POST_TRADE_STAGING_MIGRATION_DEPLOYMENT_READINESS_ARTIFACT_ID;
  artifactVersion: typeof POST_TRADE_STAGING_MIGRATION_DEPLOYMENT_READINESS_ARTIFACT_VERSION;
  artifactType: typeof POST_TRADE_STAGING_MIGRATION_DEPLOYMENT_READINESS_ARTIFACT_TYPE;
  sourceActionIdentity: typeof POST_TRADE_STAGING_MIGRATION_DEPLOYMENT_READINESS_SOURCE_ACTION;
  gateContractVersion: typeof POST_TRADE_STAGING_MIGRATION_DEPLOYMENT_GATE_VERSION;
  readinessContractVersion: typeof POST_TRADE_STAGING_MIGRATION_DEPLOYMENT_READINESS_CONTRACT_VERSION;
  issuedAtIso: string;
  expiresAtIso: string;
  readinessState: PostTradeStagingMigrationDeploymentReadinessClassification;
  artifactState: PostTradeStagingMigrationDeploymentReadinessArtifactState;
  migrationIdentity: {
    filename: typeof POST_TRADE_STAGING_MIGRATION_FILENAME;
    path: typeof POST_TRADE_STAGING_MIGRATION_PATH;
    timestampPrefix: typeof POST_TRADE_STAGING_MIGRATION_TIMESTAMP_PREFIX;
    fingerprint: typeof POST_TRADE_STAGING_MIGRATION_EXPECTED_FINGERPRINT;
    fingerprintAlgorithm: "sha256";
    targetTable: typeof POST_TRADE_STAGING_MIGRATION_TARGET_TABLE;
    expectedMigrationCount: 1;
    expectedStatementInventory: typeof POST_TRADE_STAGING_MIGRATION_EXPECTED_STATEMENT_INVENTORY;
  };
  projectIdentity: {
    expectedStagingProjectRef: typeof POST_TRADE_STAGING_MIGRATION_PROJECT_REF;
    rejectedProductionProjectRef: typeof POST_TRADE_STAGING_MIGRATION_REJECTED_PRODUCTION_REF;
    requiredProjectEvidenceVersion: typeof POST_TRADE_STAGING_MIGRATION_PROJECT_EVIDENCE_VERSION;
    requiredProjectEvidenceSources: readonly [
      "supabase_cli_link_metadata",
      "operator_verified_metadata",
    ];
    projectVerificationStatus: "not_live_verified";
    projectVerificationLive: false;
  };
  reviewBinding: {
    action499ImplementationDecision: typeof POST_TRADE_STAGING_MIGRATION_IMPLEMENTATION_DECISION;
    action500SqlReviewDecision: typeof POST_TRADE_STAGING_MIGRATION_SQL_REVIEW_DECISION;
    action501DeploymentGateImplementationDecision: typeof POST_TRADE_STAGING_MIGRATION_DEPLOYMENT_GATE_IMPLEMENTATION_DECISION;
    action502DeploymentGateReviewDecision: typeof POST_TRADE_STAGING_MIGRATION_DEPLOYMENT_GATE_REVIEW_DECISION;
    migrationImplementationCheckpoint: typeof POST_TRADE_STAGING_MIGRATION_IMPLEMENTATION_ARTIFACT;
    migrationSqlReviewCheckpoint: typeof POST_TRADE_STAGING_MIGRATION_REVIEW_ARTIFACT;
    deploymentGateImplementationCheckpoint: typeof POST_TRADE_STAGING_MIGRATION_DEPLOYMENT_GATE_IMPLEMENTATION_ARTIFACT;
    deploymentGateReviewCheckpoint: typeof POST_TRADE_STAGING_MIGRATION_DEPLOYMENT_GATE_REVIEW_ARTIFACT;
  };
  deploymentScope: {
    expectedRowCount: 0;
    expectedFunctionCount: 0;
    expectedPolicyCount: 0;
    expectedTriggerCount: 0;
    expectedRpcCount: 0;
    expectedSeedCount: 0;
    expectedTargetTableCount: 1;
    expectedCreatedTables: readonly [typeof POST_TRADE_STAGING_MIGRATION_TARGET_TABLE];
    expectedAlteredExistingTableCount: 0;
    expectedDroppedObjectCount: 0;
    expectedDestructiveStatementCount: 0;
  };
  security: typeof POST_TRADE_STAGING_MIGRATION_DEPLOYMENT_READINESS_SECURITY_PROHIBITIONS & {
    stagingOnly: true;
    oneShot: true;
    retryAllowed: false;
  };
  worktreeBinding: {
    requiredWorktreeEvidenceVersion: typeof POST_TRADE_STAGING_MIGRATION_WORKTREE_EVIDENCE_VERSION;
    reviewedDeploymentFileAllowlist: typeof POST_TRADE_STAGING_MIGRATION_DEPLOYMENT_READINESS_ALLOWED_SCOPE_FILES;
    reviewedMigrationAllowlist: readonly [typeof POST_TRADE_STAGING_MIGRATION_PATH];
    unrelatedFileDenylist: typeof POST_TRADE_STAGING_MIGRATION_DEPLOYMENT_READINESS_UNRELATED_FILE_DENYLIST;
    expectedUnappliedMigrationCount: 1;
    noExtraMigration: true;
    worktreeVerificationStatus: "not_live_verified";
    worktreeVerificationLive: false;
  };
  attemptModel: {
    deploymentAttemptId: typeof POST_TRADE_STAGING_MIGRATION_DEPLOYMENT_ATTEMPT_ID;
    deploymentOperationId: typeof POST_TRADE_STAGING_MIGRATION_DEPLOYMENT_OPERATION_ID;
    oneShotState: "single_use";
    noRetryState: "retry_disabled";
    consumptionState: "not_consumed";
    deploymentAttemptConsumed: false;
    deploymentAttemptStatus: "not_attempted";
  };
  deploymentEnabled: false;
  deploymentStatus: "not_deployed";
  remoteMutation: false;
  sqlExecuted: false;
  migrationsApplied: 0;
  rowsCreated: 0;
};

export type PostTradeStagingMigrationDeploymentReadinessArtifact =
  PostTradeStagingMigrationDeploymentReadinessArtifactCore & {
    artifactFingerprint: string;
  };

export type PostTradeStagingMigrationDeploymentReadinessValidation = {
  valid: boolean;
  structurallyReadyForFuturePreflight: boolean;
  deploymentEnabled: false;
  deploymentStatus: "not_deployed";
  remoteMutation: false;
  sqlExecuted: false;
  migrationsApplied: 0;
  rowsCreated: 0;
  projectVerificationLive: false;
  worktreeVerificationLive: false;
  deploymentAttemptConsumed: false;
  artifactFingerprint: string | null;
  blockingReasons: string[];
};

export type PostTradeStagingMigrationDeploymentGateCompatibility = {
  compatible: boolean;
  deploymentEnabled: false;
  remoteMutation: false;
  sqlExecuted: false;
  migrationFilename: typeof POST_TRADE_STAGING_MIGRATION_FILENAME | null;
  migrationPath: typeof POST_TRADE_STAGING_MIGRATION_PATH | null;
  migrationFingerprint: typeof POST_TRADE_STAGING_MIGRATION_EXPECTED_FINGERPRINT | null;
  targetProjectRef: typeof POST_TRADE_STAGING_MIGRATION_PROJECT_REF | null;
  rejectedProductionProjectRef: typeof POST_TRADE_STAGING_MIGRATION_REJECTED_PRODUCTION_REF | null;
  action499Decision: typeof POST_TRADE_STAGING_MIGRATION_IMPLEMENTATION_DECISION | null;
  action500Decision: typeof POST_TRADE_STAGING_MIGRATION_SQL_REVIEW_DECISION | null;
  action501Decision: typeof POST_TRADE_STAGING_MIGRATION_DEPLOYMENT_GATE_IMPLEMENTATION_DECISION | null;
  action502Decision: typeof POST_TRADE_STAGING_MIGRATION_DEPLOYMENT_GATE_REVIEW_DECISION | null;
  requiredProjectEvidenceVersion: typeof POST_TRADE_STAGING_MIGRATION_PROJECT_EVIDENCE_VERSION | null;
  requiredWorktreeEvidenceVersion: typeof POST_TRADE_STAGING_MIGRATION_WORKTREE_EVIDENCE_VERSION | null;
  preservesSchemaOnlyScope: boolean;
  preservesZeroRowScope: boolean;
  preservesOneShot: boolean;
  preservesNoRetry: boolean;
  claimsLiveEvidence: false;
  blockingReasons: string[];
};

export type PostTradeStagingMigrationDeploymentPreflightPlan = {
  planStatus: "inert_future_preflight_only";
  targetProjectRef: typeof POST_TRADE_STAGING_MIGRATION_PROJECT_REF;
  migrationPath: typeof POST_TRADE_STAGING_MIGRATION_PATH;
  categories: readonly string[];
  deploymentEnabled: false;
  remoteMutation: false;
  sqlExecuted: false;
  containsSecrets: false;
  containsExecutableCommands: false;
  containsSupabaseCommand: false;
  containsShellCommand: false;
};

const CORE_KEYS = [
  "artifactId",
  "artifactVersion",
  "artifactType",
  "sourceActionIdentity",
  "gateContractVersion",
  "readinessContractVersion",
  "issuedAtIso",
  "expiresAtIso",
  "readinessState",
  "artifactState",
  "migrationIdentity",
  "projectIdentity",
  "reviewBinding",
  "deploymentScope",
  "security",
  "worktreeBinding",
  "attemptModel",
  "deploymentEnabled",
  "deploymentStatus",
  "remoteMutation",
  "sqlExecuted",
  "migrationsApplied",
  "rowsCreated",
] as const;

const ARTIFACT_KEYS = [...CORE_KEYS, "artifactFingerprint"] as const;
const MIGRATION_IDENTITY_KEYS = [
  "filename",
  "path",
  "timestampPrefix",
  "fingerprint",
  "fingerprintAlgorithm",
  "targetTable",
  "expectedMigrationCount",
  "expectedStatementInventory",
] as const;
const PROJECT_IDENTITY_KEYS = [
  "expectedStagingProjectRef",
  "rejectedProductionProjectRef",
  "requiredProjectEvidenceVersion",
  "requiredProjectEvidenceSources",
  "projectVerificationStatus",
  "projectVerificationLive",
] as const;
const REVIEW_BINDING_KEYS = [
  "action499ImplementationDecision",
  "action500SqlReviewDecision",
  "action501DeploymentGateImplementationDecision",
  "action502DeploymentGateReviewDecision",
  "migrationImplementationCheckpoint",
  "migrationSqlReviewCheckpoint",
  "deploymentGateImplementationCheckpoint",
  "deploymentGateReviewCheckpoint",
] as const;
const DEPLOYMENT_SCOPE_KEYS = [
  "expectedRowCount",
  "expectedFunctionCount",
  "expectedPolicyCount",
  "expectedTriggerCount",
  "expectedRpcCount",
  "expectedSeedCount",
  "expectedTargetTableCount",
  "expectedCreatedTables",
  "expectedAlteredExistingTableCount",
  "expectedDroppedObjectCount",
  "expectedDestructiveStatementCount",
] as const;
const SECURITY_KEYS = [
  "productionDeploymentAllowed",
  "alternateProjectDeploymentAllowed",
  "multipleMigrationDeploymentAllowed",
  "rowWriteAllowed",
  "seedAllowed",
  "functionCreationAllowed",
  "policyCreationAllowed",
  "triggerCreationAllowed",
  "rpcCreationAllowed",
  "migrationRepairAllowed",
  "schemaResetAllowed",
  "destructiveRollbackAllowed",
  "authorizationSeedingAllowed",
  "authorizationConsumptionAllowed",
  "executionRecordCreationAllowed",
  "auditEventCreationAllowed",
  "apiActivationAllowed",
  "uiActivationAllowed",
  "clientActivationAllowed",
  "runtimeActivationAllowed",
  "avanzaIntegrationAllowed",
  "browserAutomationAllowed",
  "buyBehaviorAllowed",
  "sellBehaviorAllowed",
  "credentialAccessAllowed",
  "cookieAccessAllowed",
  "sessionAccessAllowed",
  "bankIdAccessAllowed",
  "brokerStateAccessAllowed",
  "settlementRetrievalAllowed",
  "liveTradeMutationAllowed",
  "livePositionMutationAllowed",
  "automaticRetryAllowed",
  "secondDeploymentAttemptAllowed",
  "stagingOnly",
  "oneShot",
  "retryAllowed",
] as const;
const WORKTREE_BINDING_KEYS = [
  "requiredWorktreeEvidenceVersion",
  "reviewedDeploymentFileAllowlist",
  "reviewedMigrationAllowlist",
  "unrelatedFileDenylist",
  "expectedUnappliedMigrationCount",
  "noExtraMigration",
  "worktreeVerificationStatus",
  "worktreeVerificationLive",
] as const;
const ATTEMPT_MODEL_KEYS = [
  "deploymentAttemptId",
  "deploymentOperationId",
  "oneShotState",
  "noRetryState",
  "consumptionState",
  "deploymentAttemptConsumed",
  "deploymentAttemptStatus",
] as const;

const forbiddenObjectKeys = [
  "credentials",
  "credential",
  "cookie",
  "cookies",
  "session",
  "sessions",
  "BankID",
  "bankIdData",
  "serviceRoleKey",
  "serviceRoleToken",
  "apiToken",
  "accessToken",
  "refreshToken",
  "supabaseKey",
] as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function hasExactKeys(value: Record<string, unknown>, expected: readonly string[]) {
  const actual = Object.keys(value).sort();
  const sortedExpected = [...expected].sort();
  return (
    actual.length === sortedExpected.length &&
    actual.every((key, index) => key === sortedExpected[index])
  );
}

function stableStringify(value: unknown, seen = new WeakSet<object>()): string {
  if (value === undefined) return "__undefined__";
  if (
    value === null ||
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) return `[${value.map((item) => stableStringify(item, seen)).join(",")}]`;
  if (!isRecord(value)) throw new Error("Unsupported artifact fingerprint value");
  if (seen.has(value)) throw new Error("Cyclic artifact fingerprint value");
  seen.add(value);
  const keys = Object.keys(value).sort();
  return `{${keys
    .map((key) => `${JSON.stringify(key)}:${stableStringify(value[key], seen)}`)
    .join(",")}}`;
}

function containsUnsupportedNestedValue(value: unknown, seen = new WeakSet<object>()): boolean {
  if (value === null) return false;
  if (["string", "number", "boolean", "undefined"].includes(typeof value)) return false;
  if (typeof value === "function" || typeof value === "symbol" || typeof value === "bigint") {
    return true;
  }
  if (Array.isArray(value)) return value.some((nested) => containsUnsupportedNestedValue(nested, seen));
  if (!isRecord(value)) return true;
  if (seen.has(value)) return true;
  seen.add(value);
  return Object.values(value).some((nested) => containsUnsupportedNestedValue(nested, seen));
}

function containsForbiddenObjectKey(value: unknown, seen = new WeakSet<object>()): boolean {
  if (Array.isArray(value)) return value.some((nested) => containsForbiddenObjectKey(nested, seen));
  if (!isRecord(value)) return false;
  if (seen.has(value)) return true;
  seen.add(value);
  for (const [key, nested] of Object.entries(value)) {
    if ((forbiddenObjectKeys as readonly string[]).includes(key)) return true;
    if (containsForbiddenObjectKey(nested, seen)) return true;
  }
  return false;
}

function containsProductionOutsideRejectedMarker(value: unknown, seen = new WeakSet<object>()): boolean {
  if (Array.isArray(value)) return value.some((nested) => containsProductionOutsideRejectedMarker(nested, seen));
  if (typeof value === "string") {
    return value.includes(POST_TRADE_STAGING_MIGRATION_REJECTED_PRODUCTION_REF);
  }
  if (!isRecord(value)) return false;
  if (seen.has(value)) return true;
  seen.add(value);
  for (const [key, nested] of Object.entries(value)) {
    if (key === "rejectedProductionProjectRef") continue;
    if (containsProductionOutsideRejectedMarker(nested, seen)) return true;
  }
  return false;
}

function hasUnsafePath(value: string) {
  const lower = value.toLowerCase();
  return (
    value.startsWith("/") ||
    value.startsWith("./") ||
    value.includes("..") ||
    value.includes("\\") ||
    value.includes("//") ||
    value.includes("\u2215") ||
    value.includes("\u2044") ||
    /[\u0000-\u001f\u007f]/.test(value) ||
    lower.includes("%2e") ||
    lower.includes("%2f") ||
    lower.includes("%5c") ||
    value !== lower ||
    value.trim() !== value
  );
}

function hasExactStringSet(actual: readonly string[], expected: readonly string[]) {
  const sortedActual = [...actual].sort();
  const sortedExpected = [...expected].sort();
  return (
    sortedActual.length === sortedExpected.length &&
    sortedActual.every((value, index) => value === sortedExpected[index])
  );
}

function hasDuplicates(values: readonly string[]) {
  return new Set(values).size !== values.length;
}

export function buildPostTradeStagingMigrationDeploymentReadinessArtifactFingerprint(
  artifactCore: PostTradeStagingMigrationDeploymentReadinessArtifactCore,
) {
  return createHash("sha256").update(stableStringify(artifactCore), "utf8").digest("hex");
}

export function buildPostTradeStagingMigrationDeploymentReadinessArtifact(input: {
  issuedAtIso?: string;
  expiresAtIso?: string;
} = {}): PostTradeStagingMigrationDeploymentReadinessArtifact {
  const core: PostTradeStagingMigrationDeploymentReadinessArtifactCore = {
    artifactId: POST_TRADE_STAGING_MIGRATION_DEPLOYMENT_READINESS_ARTIFACT_ID,
    artifactVersion: POST_TRADE_STAGING_MIGRATION_DEPLOYMENT_READINESS_ARTIFACT_VERSION,
    artifactType: POST_TRADE_STAGING_MIGRATION_DEPLOYMENT_READINESS_ARTIFACT_TYPE,
    sourceActionIdentity: POST_TRADE_STAGING_MIGRATION_DEPLOYMENT_READINESS_SOURCE_ACTION,
    gateContractVersion: POST_TRADE_STAGING_MIGRATION_DEPLOYMENT_GATE_VERSION,
    readinessContractVersion: POST_TRADE_STAGING_MIGRATION_DEPLOYMENT_READINESS_CONTRACT_VERSION,
    issuedAtIso: input.issuedAtIso ?? "2026-07-12T12:00:00.000Z",
    expiresAtIso: input.expiresAtIso ?? "2026-07-12T13:00:00.000Z",
    readinessState: POST_TRADE_STAGING_MIGRATION_DEPLOYMENT_READINESS_STATE,
    artifactState: "unused",
    migrationIdentity: {
      filename: POST_TRADE_STAGING_MIGRATION_FILENAME,
      path: POST_TRADE_STAGING_MIGRATION_PATH,
      timestampPrefix: POST_TRADE_STAGING_MIGRATION_TIMESTAMP_PREFIX,
      fingerprint: POST_TRADE_STAGING_MIGRATION_EXPECTED_FINGERPRINT,
      fingerprintAlgorithm: "sha256",
      targetTable: POST_TRADE_STAGING_MIGRATION_TARGET_TABLE,
      expectedMigrationCount: 1,
      expectedStatementInventory: POST_TRADE_STAGING_MIGRATION_EXPECTED_STATEMENT_INVENTORY,
    },
    projectIdentity: {
      expectedStagingProjectRef: POST_TRADE_STAGING_MIGRATION_PROJECT_REF,
      rejectedProductionProjectRef: POST_TRADE_STAGING_MIGRATION_REJECTED_PRODUCTION_REF,
      requiredProjectEvidenceVersion: POST_TRADE_STAGING_MIGRATION_PROJECT_EVIDENCE_VERSION,
      requiredProjectEvidenceSources: [
        "supabase_cli_link_metadata",
        "operator_verified_metadata",
      ],
      projectVerificationStatus: "not_live_verified",
      projectVerificationLive: false,
    },
    reviewBinding: {
      action499ImplementationDecision: POST_TRADE_STAGING_MIGRATION_IMPLEMENTATION_DECISION,
      action500SqlReviewDecision: POST_TRADE_STAGING_MIGRATION_SQL_REVIEW_DECISION,
      action501DeploymentGateImplementationDecision:
        POST_TRADE_STAGING_MIGRATION_DEPLOYMENT_GATE_IMPLEMENTATION_DECISION,
      action502DeploymentGateReviewDecision:
        POST_TRADE_STAGING_MIGRATION_DEPLOYMENT_GATE_REVIEW_DECISION,
      migrationImplementationCheckpoint:
        POST_TRADE_STAGING_MIGRATION_IMPLEMENTATION_ARTIFACT,
      migrationSqlReviewCheckpoint: POST_TRADE_STAGING_MIGRATION_REVIEW_ARTIFACT,
      deploymentGateImplementationCheckpoint:
        POST_TRADE_STAGING_MIGRATION_DEPLOYMENT_GATE_IMPLEMENTATION_ARTIFACT,
      deploymentGateReviewCheckpoint: POST_TRADE_STAGING_MIGRATION_DEPLOYMENT_GATE_REVIEW_ARTIFACT,
    },
    deploymentScope: {
      expectedRowCount: 0,
      expectedFunctionCount: 0,
      expectedPolicyCount: 0,
      expectedTriggerCount: 0,
      expectedRpcCount: 0,
      expectedSeedCount: 0,
      expectedTargetTableCount: 1,
      expectedCreatedTables: [POST_TRADE_STAGING_MIGRATION_TARGET_TABLE],
      expectedAlteredExistingTableCount: 0,
      expectedDroppedObjectCount: 0,
      expectedDestructiveStatementCount: 0,
    },
    security: {
      ...POST_TRADE_STAGING_MIGRATION_DEPLOYMENT_READINESS_SECURITY_PROHIBITIONS,
      stagingOnly: true,
      oneShot: true,
      retryAllowed: false,
    },
    worktreeBinding: {
      requiredWorktreeEvidenceVersion: POST_TRADE_STAGING_MIGRATION_WORKTREE_EVIDENCE_VERSION,
      reviewedDeploymentFileAllowlist:
        POST_TRADE_STAGING_MIGRATION_DEPLOYMENT_READINESS_ALLOWED_SCOPE_FILES,
      reviewedMigrationAllowlist: [POST_TRADE_STAGING_MIGRATION_PATH],
      unrelatedFileDenylist:
        POST_TRADE_STAGING_MIGRATION_DEPLOYMENT_READINESS_UNRELATED_FILE_DENYLIST,
      expectedUnappliedMigrationCount: 1,
      noExtraMigration: true,
      worktreeVerificationStatus: "not_live_verified",
      worktreeVerificationLive: false,
    },
    attemptModel: {
      deploymentAttemptId: POST_TRADE_STAGING_MIGRATION_DEPLOYMENT_ATTEMPT_ID,
      deploymentOperationId: POST_TRADE_STAGING_MIGRATION_DEPLOYMENT_OPERATION_ID,
      oneShotState: "single_use",
      noRetryState: "retry_disabled",
      consumptionState: "not_consumed",
      deploymentAttemptConsumed: false,
      deploymentAttemptStatus: "not_attempted",
    },
    deploymentEnabled: false,
    deploymentStatus: "not_deployed",
    remoteMutation: false,
    sqlExecuted: false,
    migrationsApplied: 0,
    rowsCreated: 0,
  };

  return {
    ...core,
    artifactFingerprint:
      buildPostTradeStagingMigrationDeploymentReadinessArtifactFingerprint(core),
  };
}

function pushObjectShapeReasons(
  value: unknown,
  expected: readonly string[],
  label: string,
  reasons: string[],
) {
  if (!isRecord(value)) {
    reasons.push(`${label}:required`);
    return false;
  }
  if (!hasExactKeys(value, expected)) reasons.push(`${label}:unknown_or_missing_fields`);
  return true;
}

function pushStringReasons(value: unknown, label: string, reasons: string[]) {
  if (typeof value !== "string" || value.length === 0 || value.trim() !== value) {
    reasons.push(`${label}:exact_non_empty_string_required`);
  }
}

function pushZeroReason(value: unknown, label: string, reasons: string[]) {
  if (value !== 0) reasons.push(`${label}:expected_zero`);
}

export function validatePostTradeStagingMigrationDeploymentReadinessArtifact(
  artifact: unknown,
  evaluatedAtIso = "2026-07-12T12:30:00.000Z",
): PostTradeStagingMigrationDeploymentReadinessValidation {
  const reasons: string[] = [];
  const evaluatedAt = Date.parse(evaluatedAtIso);

  if (!pushObjectShapeReasons(artifact, ARTIFACT_KEYS, "artifact", reasons)) {
    return baseValidation(null, reasons);
  }
  if (containsUnsupportedNestedValue(artifact)) reasons.push("artifact:unsupported_nested_value");
  if (containsForbiddenObjectKey(artifact)) reasons.push("artifact:forbidden_secret_or_credential_field");
  if (containsProductionOutsideRejectedMarker(artifact)) {
    reasons.push("artifact:production_ref_outside_rejection_metadata");
  }

  const typed = artifact as Partial<PostTradeStagingMigrationDeploymentReadinessArtifact>;
  pushStringReasons(typed.artifactId, "artifactId", reasons);
  if (typed.artifactId !== POST_TRADE_STAGING_MIGRATION_DEPLOYMENT_READINESS_ARTIFACT_ID) {
    reasons.push("artifact:id_mismatch");
  }
  if (typed.artifactVersion !== POST_TRADE_STAGING_MIGRATION_DEPLOYMENT_READINESS_ARTIFACT_VERSION) {
    reasons.push("artifact:version_mismatch");
  }
  if (typed.artifactType !== POST_TRADE_STAGING_MIGRATION_DEPLOYMENT_READINESS_ARTIFACT_TYPE) {
    reasons.push("artifact:type_mismatch");
  }
  if (typed.sourceActionIdentity !== POST_TRADE_STAGING_MIGRATION_DEPLOYMENT_READINESS_SOURCE_ACTION) {
    reasons.push("artifact:source_action_mismatch");
  }
  if (typed.gateContractVersion !== POST_TRADE_STAGING_MIGRATION_DEPLOYMENT_GATE_VERSION) {
    reasons.push("artifact:gate_contract_mismatch");
  }
  if (typed.readinessContractVersion !== POST_TRADE_STAGING_MIGRATION_DEPLOYMENT_READINESS_CONTRACT_VERSION) {
    reasons.push("artifact:readiness_contract_mismatch");
  }
  if (typed.readinessState !== POST_TRADE_STAGING_MIGRATION_DEPLOYMENT_READINESS_STATE) {
    reasons.push("artifact:readiness_state_mismatch");
  }
  if (typed.artifactState !== "unused") reasons.push("artifact:unused_state_required");

  const issuedAt = Date.parse(String(typed.issuedAtIso));
  const expiresAt = Date.parse(String(typed.expiresAtIso));
  if (!Number.isFinite(issuedAt)) reasons.push("artifact:issued_at_invalid");
  if (!Number.isFinite(expiresAt)) reasons.push("artifact:expires_at_invalid");
  if (Number.isFinite(issuedAt) && Number.isFinite(evaluatedAt) && issuedAt > evaluatedAt + 5 * 60 * 1000) {
    reasons.push("artifact:future_issued_outside_tolerance");
  }
  if (Number.isFinite(expiresAt) && Number.isFinite(evaluatedAt) && expiresAt <= evaluatedAt) {
    reasons.push("artifact:expired");
  }
  if (Number.isFinite(issuedAt) && Number.isFinite(expiresAt) && expiresAt <= issuedAt) {
    reasons.push("artifact:expires_before_issued");
  }
  if (Number.isFinite(issuedAt) && Number.isFinite(expiresAt) && expiresAt - issuedAt > 2 * 60 * 60 * 1000) {
    reasons.push("artifact:validity_window_too_long");
  }

  pushMigrationIdentityReasons(typed.migrationIdentity, reasons);
  pushProjectIdentityReasons(typed.projectIdentity, reasons);
  pushReviewBindingReasons(typed.reviewBinding, reasons);
  pushDeploymentScopeReasons(typed.deploymentScope, reasons);
  pushSecurityReasons(typed.security, reasons);
  pushWorktreeBindingReasons(typed.worktreeBinding, reasons);
  pushAttemptModelReasons(typed.attemptModel, reasons);

  if (typed.deploymentEnabled !== false) reasons.push("artifact:deployment_enabled_blocked");
  if (typed.deploymentStatus !== "not_deployed") reasons.push("artifact:not_deployed_status_required");
  if (typed.remoteMutation !== false) reasons.push("artifact:remote_mutation_blocked");
  if (typed.sqlExecuted !== false) reasons.push("artifact:sql_execution_blocked");
  if (typed.migrationsApplied !== 0) reasons.push("artifact:migrations_applied_must_be_zero");
  if (typed.rowsCreated !== 0) reasons.push("artifact:rows_created_must_be_zero");

  const core = { ...(typed as PostTradeStagingMigrationDeploymentReadinessArtifact) };
  delete (core as Partial<PostTradeStagingMigrationDeploymentReadinessArtifact>).artifactFingerprint;
  const derivedFingerprint =
    isRecord(core) && !containsUnsupportedNestedValue(core)
      ? buildPostTradeStagingMigrationDeploymentReadinessArtifactFingerprint(
          core as PostTradeStagingMigrationDeploymentReadinessArtifactCore,
        )
      : null;
  if (
    typeof typed.artifactFingerprint !== "string" ||
    !/^[a-f0-9]{64}$/.test(typed.artifactFingerprint)
  ) {
    reasons.push("artifact:fingerprint_full_sha256_required");
  }
  if (derivedFingerprint !== typed.artifactFingerprint) {
    reasons.push("artifact:fingerprint_mismatch");
  }

  return baseValidation(
    typeof typed.artifactFingerprint === "string" ? typed.artifactFingerprint : null,
    reasons,
  );
}

function baseValidation(
  artifactFingerprint: string | null,
  blockingReasons: string[],
): PostTradeStagingMigrationDeploymentReadinessValidation {
  return {
    valid: blockingReasons.length === 0,
    structurallyReadyForFuturePreflight: blockingReasons.length === 0,
    deploymentEnabled: false,
    deploymentStatus: "not_deployed",
    remoteMutation: false,
    sqlExecuted: false,
    migrationsApplied: 0,
    rowsCreated: 0,
    projectVerificationLive: false,
    worktreeVerificationLive: false,
    deploymentAttemptConsumed: false,
    artifactFingerprint,
    blockingReasons,
  };
}

function pushMigrationIdentityReasons(value: unknown, reasons: string[]) {
  if (!pushObjectShapeReasons(value, MIGRATION_IDENTITY_KEYS, "migrationIdentity", reasons)) return;
  const typed = value as PostTradeStagingMigrationDeploymentReadinessArtifactCore["migrationIdentity"];
  if (typed.filename !== POST_TRADE_STAGING_MIGRATION_FILENAME) reasons.push("migrationIdentity:filename_mismatch");
  if (typed.path !== POST_TRADE_STAGING_MIGRATION_PATH) reasons.push("migrationIdentity:path_mismatch");
  if (typed.timestampPrefix !== POST_TRADE_STAGING_MIGRATION_TIMESTAMP_PREFIX) {
    reasons.push("migrationIdentity:timestamp_prefix_mismatch");
  }
  if (typed.fingerprint !== POST_TRADE_STAGING_MIGRATION_EXPECTED_FINGERPRINT) {
    reasons.push("migrationIdentity:fingerprint_mismatch");
  }
  if (!/^[a-f0-9]{64}$/.test(String(typed.fingerprint))) {
    reasons.push("migrationIdentity:full_sha256_required");
  }
  if (typed.fingerprintAlgorithm !== "sha256") reasons.push("migrationIdentity:sha256_required");
  if (typed.targetTable !== POST_TRADE_STAGING_MIGRATION_TARGET_TABLE) {
    reasons.push("migrationIdentity:target_table_mismatch");
  }
  if (typed.expectedMigrationCount !== 1) reasons.push("migrationIdentity:one_migration_required");
  if (stableStringify(typed.expectedStatementInventory) !== stableStringify(POST_TRADE_STAGING_MIGRATION_EXPECTED_STATEMENT_INVENTORY)) {
    reasons.push("migrationIdentity:statement_inventory_mismatch");
  }
}

function pushProjectIdentityReasons(value: unknown, reasons: string[]) {
  if (!pushObjectShapeReasons(value, PROJECT_IDENTITY_KEYS, "projectIdentity", reasons)) return;
  const typed = value as PostTradeStagingMigrationDeploymentReadinessArtifactCore["projectIdentity"];
  if (typed.expectedStagingProjectRef !== POST_TRADE_STAGING_MIGRATION_PROJECT_REF) {
    reasons.push("projectIdentity:staging_project_mismatch");
  }
  if (String(typed.expectedStagingProjectRef) === POST_TRADE_STAGING_MIGRATION_REJECTED_PRODUCTION_REF) {
    reasons.push("projectIdentity:production_target_blocked");
  }
  if (typed.rejectedProductionProjectRef !== POST_TRADE_STAGING_MIGRATION_REJECTED_PRODUCTION_REF) {
    reasons.push("projectIdentity:rejected_production_marker_mismatch");
  }
  if (typed.requiredProjectEvidenceVersion !== POST_TRADE_STAGING_MIGRATION_PROJECT_EVIDENCE_VERSION) {
    reasons.push("projectIdentity:evidence_version_mismatch");
  }
  if (!hasExactStringSet(typed.requiredProjectEvidenceSources ?? [], [
    "supabase_cli_link_metadata",
    "operator_verified_metadata",
  ])) {
    reasons.push("projectIdentity:evidence_sources_mismatch");
  }
  if (typed.projectVerificationStatus !== "not_live_verified" || typed.projectVerificationLive !== false) {
    reasons.push("projectIdentity:live_verification_false_required");
  }
}

function pushReviewBindingReasons(value: unknown, reasons: string[]) {
  if (!pushObjectShapeReasons(value, REVIEW_BINDING_KEYS, "reviewBinding", reasons)) return;
  const typed = value as PostTradeStagingMigrationDeploymentReadinessArtifactCore["reviewBinding"];
  if (typed.action499ImplementationDecision !== POST_TRADE_STAGING_MIGRATION_IMPLEMENTATION_DECISION) {
    reasons.push("reviewBinding:action_499_mismatch");
  }
  if (typed.action500SqlReviewDecision !== POST_TRADE_STAGING_MIGRATION_SQL_REVIEW_DECISION) {
    reasons.push("reviewBinding:action_500_mismatch");
  }
  if (typed.action501DeploymentGateImplementationDecision !== POST_TRADE_STAGING_MIGRATION_DEPLOYMENT_GATE_IMPLEMENTATION_DECISION) {
    reasons.push("reviewBinding:action_501_mismatch");
  }
  if (typed.action502DeploymentGateReviewDecision !== POST_TRADE_STAGING_MIGRATION_DEPLOYMENT_GATE_REVIEW_DECISION) {
    reasons.push("reviewBinding:action_502_mismatch");
  }
  if (typed.migrationImplementationCheckpoint !== POST_TRADE_STAGING_MIGRATION_IMPLEMENTATION_ARTIFACT) {
    reasons.push("reviewBinding:migration_implementation_checkpoint_mismatch");
  }
  if (typed.migrationSqlReviewCheckpoint !== POST_TRADE_STAGING_MIGRATION_REVIEW_ARTIFACT) {
    reasons.push("reviewBinding:migration_sql_review_checkpoint_mismatch");
  }
  if (typed.deploymentGateImplementationCheckpoint !== POST_TRADE_STAGING_MIGRATION_DEPLOYMENT_GATE_IMPLEMENTATION_ARTIFACT) {
    reasons.push("reviewBinding:gate_implementation_checkpoint_mismatch");
  }
  if (typed.deploymentGateReviewCheckpoint !== POST_TRADE_STAGING_MIGRATION_DEPLOYMENT_GATE_REVIEW_ARTIFACT) {
    reasons.push("reviewBinding:gate_review_checkpoint_mismatch");
  }
}

function pushDeploymentScopeReasons(value: unknown, reasons: string[]) {
  if (!pushObjectShapeReasons(value, DEPLOYMENT_SCOPE_KEYS, "deploymentScope", reasons)) return;
  const typed = value as PostTradeStagingMigrationDeploymentReadinessArtifactCore["deploymentScope"];
  pushZeroReason(typed.expectedRowCount, "deploymentScope:row_count", reasons);
  pushZeroReason(typed.expectedFunctionCount, "deploymentScope:function_count", reasons);
  pushZeroReason(typed.expectedPolicyCount, "deploymentScope:policy_count", reasons);
  pushZeroReason(typed.expectedTriggerCount, "deploymentScope:trigger_count", reasons);
  pushZeroReason(typed.expectedRpcCount, "deploymentScope:rpc_count", reasons);
  pushZeroReason(typed.expectedSeedCount, "deploymentScope:seed_count", reasons);
  pushZeroReason(typed.expectedAlteredExistingTableCount, "deploymentScope:altered_table_count", reasons);
  pushZeroReason(typed.expectedDroppedObjectCount, "deploymentScope:dropped_object_count", reasons);
  pushZeroReason(typed.expectedDestructiveStatementCount, "deploymentScope:destructive_statement_count", reasons);
  if (typed.expectedTargetTableCount !== 1) reasons.push("deploymentScope:one_target_table_required");
  if (
    !Array.isArray(typed.expectedCreatedTables) ||
    typed.expectedCreatedTables.length !== 1 ||
    typed.expectedCreatedTables[0] !== POST_TRADE_STAGING_MIGRATION_TARGET_TABLE
  ) {
    reasons.push("deploymentScope:exact_created_table_required");
  }
}

function pushSecurityReasons(value: unknown, reasons: string[]) {
  if (!pushObjectShapeReasons(value, SECURITY_KEYS, "security", reasons)) return;
  const typed = value as Record<string, unknown>;
  for (const [key, expected] of Object.entries(POST_TRADE_STAGING_MIGRATION_DEPLOYMENT_READINESS_SECURITY_PROHIBITIONS)) {
    if (typed[key] !== expected) reasons.push(`security:${key}_blocked`);
  }
  if (typed.stagingOnly !== true) reasons.push("security:staging_only_required");
  if (typed.oneShot !== true) reasons.push("security:one_shot_required");
  if (typed.retryAllowed !== false) reasons.push("security:retry_forbidden");
}

function pushWorktreeBindingReasons(value: unknown, reasons: string[]) {
  if (!pushObjectShapeReasons(value, WORKTREE_BINDING_KEYS, "worktreeBinding", reasons)) return;
  const typed = value as PostTradeStagingMigrationDeploymentReadinessArtifactCore["worktreeBinding"];
  if (typed.requiredWorktreeEvidenceVersion !== POST_TRADE_STAGING_MIGRATION_WORKTREE_EVIDENCE_VERSION) {
    reasons.push("worktreeBinding:evidence_version_mismatch");
  }
  if (!hasExactStringSet(typed.reviewedDeploymentFileAllowlist ?? [], POST_TRADE_STAGING_MIGRATION_DEPLOYMENT_READINESS_ALLOWED_SCOPE_FILES)) {
    reasons.push("worktreeBinding:allowlist_mismatch");
  }
  if (!hasExactStringSet(typed.reviewedMigrationAllowlist ?? [], [POST_TRADE_STAGING_MIGRATION_PATH])) {
    reasons.push("worktreeBinding:migration_allowlist_mismatch");
  }
  if (!hasExactStringSet(typed.unrelatedFileDenylist ?? [], POST_TRADE_STAGING_MIGRATION_DEPLOYMENT_READINESS_UNRELATED_FILE_DENYLIST)) {
    reasons.push("worktreeBinding:denylist_mismatch");
  }
  for (const path of [
    ...(typed.reviewedDeploymentFileAllowlist ?? []),
    ...(typed.reviewedMigrationAllowlist ?? []),
    ...(typed.unrelatedFileDenylist ?? []),
  ]) {
    if (typeof path !== "string" || hasUnsafePath(path)) {
      reasons.push("worktreeBinding:unsafe_path");
      break;
    }
  }
  if (hasDuplicates(typed.reviewedDeploymentFileAllowlist ?? [])) {
    reasons.push("worktreeBinding:duplicate_allowlist_path");
  }
  if (typed.expectedUnappliedMigrationCount !== 1) {
    reasons.push("worktreeBinding:one_unapplied_migration_required");
  }
  if (typed.noExtraMigration !== true) reasons.push("worktreeBinding:no_extra_migration_required");
  if (typed.worktreeVerificationStatus !== "not_live_verified" || typed.worktreeVerificationLive !== false) {
    reasons.push("worktreeBinding:live_verification_false_required");
  }
}

function pushAttemptModelReasons(value: unknown, reasons: string[]) {
  if (!pushObjectShapeReasons(value, ATTEMPT_MODEL_KEYS, "attemptModel", reasons)) return;
  const typed = value as PostTradeStagingMigrationDeploymentReadinessArtifactCore["attemptModel"];
  if (typed.deploymentAttemptId !== POST_TRADE_STAGING_MIGRATION_DEPLOYMENT_ATTEMPT_ID) {
    reasons.push("attemptModel:attempt_id_mismatch");
  }
  if (typed.deploymentOperationId !== POST_TRADE_STAGING_MIGRATION_DEPLOYMENT_OPERATION_ID) {
    reasons.push("attemptModel:operation_id_mismatch");
  }
  if (typed.oneShotState !== "single_use") reasons.push("attemptModel:single_use_required");
  if (typed.noRetryState !== "retry_disabled") reasons.push("attemptModel:retry_disabled_required");
  if (typed.consumptionState !== "not_consumed" || typed.deploymentAttemptConsumed !== false) {
    reasons.push("attemptModel:not_consumed_required");
  }
  if (typed.deploymentAttemptStatus !== "not_attempted") {
    reasons.push("attemptModel:not_attempted_required");
  }
}

export function mapReadinessArtifactToDeploymentGateCompatibility(
  artifact: unknown,
): PostTradeStagingMigrationDeploymentGateCompatibility {
  const validation = validatePostTradeStagingMigrationDeploymentReadinessArtifact(artifact);
  if (!validation.valid || !isRecord(artifact)) {
    return {
      compatible: false,
      deploymentEnabled: false,
      remoteMutation: false,
      sqlExecuted: false,
      migrationFilename: null,
      migrationPath: null,
      migrationFingerprint: null,
      targetProjectRef: null,
      rejectedProductionProjectRef: null,
      action499Decision: null,
      action500Decision: null,
      action501Decision: null,
      action502Decision: null,
      requiredProjectEvidenceVersion: null,
      requiredWorktreeEvidenceVersion: null,
      preservesSchemaOnlyScope: false,
      preservesZeroRowScope: false,
      preservesOneShot: false,
      preservesNoRetry: false,
      claimsLiveEvidence: false,
      blockingReasons: validation.blockingReasons,
    };
  }
  const typed = artifact as PostTradeStagingMigrationDeploymentReadinessArtifact;
  return {
    compatible: true,
    deploymentEnabled: false,
    remoteMutation: false,
    sqlExecuted: false,
    migrationFilename: typed.migrationIdentity.filename,
    migrationPath: typed.migrationIdentity.path,
    migrationFingerprint: typed.migrationIdentity.fingerprint,
    targetProjectRef: typed.projectIdentity.expectedStagingProjectRef,
    rejectedProductionProjectRef: typed.projectIdentity.rejectedProductionProjectRef,
    action499Decision: typed.reviewBinding.action499ImplementationDecision,
    action500Decision: typed.reviewBinding.action500SqlReviewDecision,
    action501Decision: typed.reviewBinding.action501DeploymentGateImplementationDecision,
    action502Decision: typed.reviewBinding.action502DeploymentGateReviewDecision,
    requiredProjectEvidenceVersion: typed.projectIdentity.requiredProjectEvidenceVersion,
    requiredWorktreeEvidenceVersion: typed.worktreeBinding.requiredWorktreeEvidenceVersion,
    preservesSchemaOnlyScope:
      typed.deploymentScope.expectedFunctionCount === 0 &&
      typed.deploymentScope.expectedPolicyCount === 0 &&
      typed.deploymentScope.expectedTriggerCount === 0 &&
      typed.deploymentScope.expectedRpcCount === 0 &&
      typed.deploymentScope.expectedSeedCount === 0,
    preservesZeroRowScope: typed.deploymentScope.expectedRowCount === 0,
    preservesOneShot: typed.security.oneShot === true,
    preservesNoRetry: typed.security.retryAllowed === false,
    claimsLiveEvidence: false,
    blockingReasons: [],
  };
}

export function buildPostTradeStagingMigrationDeploymentPreflightPlan(
  artifact: unknown,
): PostTradeStagingMigrationDeploymentPreflightPlan {
  const compatibility = mapReadinessArtifactToDeploymentGateCompatibility(artifact);
  return {
    planStatus: "inert_future_preflight_only",
    targetProjectRef:
      compatibility.targetProjectRef ?? POST_TRADE_STAGING_MIGRATION_PROJECT_REF,
    migrationPath: POST_TRADE_STAGING_MIGRATION_PATH,
    categories: [
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
    ],
    deploymentEnabled: false,
    remoteMutation: false,
    sqlExecuted: false,
    containsSecrets: false,
    containsExecutableCommands: false,
    containsSupabaseCommand: false,
    containsShellCommand: false,
  };
}
