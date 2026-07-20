import { createHash } from "node:crypto";

export const POST_TRADE_STAGING_MIGRATION_DEPLOYMENT_GATE_VERSION =
  "post_trade_staging_migration_deployment_gate_v1" as const;

export const POST_TRADE_STAGING_MIGRATION_FILENAME =
  "20260710000000_create_execution_authorization_consumptions.sql" as const;
export const POST_TRADE_STAGING_MIGRATION_PATH =
  "supabase/migrations/20260710000000_create_execution_authorization_consumptions.sql" as const;
export const POST_TRADE_STAGING_MIGRATION_TIMESTAMP_PREFIX =
  "20260710000000" as const;
export const POST_TRADE_STAGING_MIGRATION_TARGET_TABLE =
  "public.execution_authorization_consumptions" as const;
export const POST_TRADE_STAGING_MIGRATION_PROJECT_REF =
  "pdvzyuhykomwfqyyztru" as const;
export const POST_TRADE_STAGING_MIGRATION_REJECTED_PRODUCTION_REF =
  "ekdyopdrrkphlrsilyoo" as const;

export const POST_TRADE_STAGING_MIGRATION_IMPLEMENTATION_DECISION =
  "post_trade_durable_authorization_consumption_source_controlled_staging_migration_ready_for_static_sql_security_review" as const;
export const POST_TRADE_STAGING_MIGRATION_SQL_REVIEW_DECISION =
  "post_trade_durable_authorization_consumption_staging_migration_static_sql_security_review_ready_for_staging_deployment_gate" as const;
export const POST_TRADE_STAGING_MIGRATION_REVIEW_ARTIFACT =
  "docs/post-trade-durable-authorization-consumption-staging-migration-static-sql-security-review-no-deployment-no-execution.md" as const;
export const POST_TRADE_STAGING_MIGRATION_WORKTREE_SCOPE =
  "post_trade_staging_migration_deployment_gate_reviewed_scope_v1" as const;
export const POST_TRADE_STAGING_MIGRATION_PROJECT_EVIDENCE_VERSION =
  "post_trade_staging_migration_project_evidence_v1" as const;
export const POST_TRADE_STAGING_MIGRATION_WORKTREE_EVIDENCE_VERSION =
  "post_trade_staging_migration_worktree_evidence_v1" as const;

export const POST_TRADE_STAGING_MIGRATION_EXPECTED_COUNTS = {
  migrations: 1,
  rows: 0,
  functions: 0,
  policies: 0,
  triggers: 0,
  rpcs: 0,
  seeds: 0,
} as const;

export const POST_TRADE_STAGING_MIGRATION_RLS_EXPECTATION = {
  table: POST_TRADE_STAGING_MIGRATION_TARGET_TABLE,
  enabled: true,
  clientPolicies: 0,
} as const;

export const POST_TRADE_STAGING_MIGRATION_PRIVILEGE_REVOKE_EXPECTATION = {
  table: POST_TRADE_STAGING_MIGRATION_TARGET_TABLE,
  revokedFrom: ["anon", "authenticated"],
  privilege: "all",
} as const;

export const POST_TRADE_STAGING_MIGRATION_EXPECTED_STATEMENT_INVENTORY = {
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
} as const;

export const POST_TRADE_STAGING_MIGRATION_ALLOWED_SCOPE_FILES = [
  POST_TRADE_STAGING_MIGRATION_PATH,
  "tests/e2e/post-trade-durable-authorization-consumption-migration-static.spec.ts",
  "docs/post-trade-durable-authorization-consumption-source-controlled-staging-migration-no-deployment-no-execution.md",
  POST_TRADE_STAGING_MIGRATION_REVIEW_ARTIFACT,
  "lib/post-trade-staging-migration-deployment-gate-core.ts",
  "lib/post-trade-staging-migration-deployment-gate.ts",
  "tests/e2e/post-trade-staging-migration-deployment-gate.spec.ts",
  "docs/post-trade-explicit-source-controlled-staging-migration-deployment-gate-no-deployment.md",
  "docs/post-trade-explicit-source-controlled-staging-migration-deployment-gate-static-security-review-no-deployment.md",
  "docs/ture-agent-dev-chat-3-continuation-summary.md",
] as const;

export const POST_TRADE_STAGING_MIGRATION_UNRELATED_FILES = [
  "scripts/action-366-corrected-immutable-preview-candidate-preparation-approval-gate-verify.mjs",
  "tests/e2e/action-366-corrected-immutable-preview-candidate-preparation-approval-gate.spec.ts",
  "docs/action-367-read-only-dependency-bridge-capability-evidence.json",
  "docs/action-367-read-only-dependency-bridge-capability-verification.md",
  "scripts/action-367-read-only-dependency-bridge-capability-verification-verify.mjs",
  "tests/e2e/action-367-read-only-dependency-bridge-capability-verification.spec.ts",
  "docs/action-368-isolated-dependency-materialization-strategy-approval-gate.md",
  "scripts/action-368-isolated-dependency-materialization-strategy-approval-gate-verify.mjs",
  "tests/e2e/action-368-isolated-dependency-materialization-strategy-approval-gate.spec.ts",
  "scripts/action-318-static-replay-batch-commit-readiness-verify.mjs",
  "scripts/action-319-static-replay-batch-post-commit-verify.mjs",
  "scripts/action-320-static-replay-branch-package-verify.mjs",
] as const;

export const POST_TRADE_STAGING_MIGRATION_EXPECTED_NORMALIZED_LENGTH = 9518 as const;
export const POST_TRADE_STAGING_MIGRATION_EXPECTED_FINGERPRINT =
  "4f4fbfb52a458e502441322bae873940469c89f292db464d177aa10fad9f095a" as const;

export type PostTradeStagingMigrationApprovalState =
  | "unused"
  | "consumed"
  | "invalid"
  | "expired";

export type PostTradeStagingMigrationForbiddenCapabilities = {
  productionDeployment: false;
  multipleMigrations: false;
  seedExecution: false;
  rowInsertion: false;
  databaseFunctionCreation: false;
  rpcCreation: false;
  triggerCreation: false;
  policyCreation: false;
  apiActivation: false;
  uiActivation: false;
  clientActivation: false;
  executionRuntimeActivation: false;
  authorizationSeeding: false;
  authorizationConsumption: false;
  executionRecordCreation: false;
  auditEventCreation: false;
  avanzaIntegration: false;
  browserAutomation: false;
  buyBehavior: false;
  sellBehavior: false;
  credentialAccess: false;
  sessionAccess: false;
  cookieAccess: false;
  bankIdAccess: false;
  brokerState: false;
  settlementRetrieval: false;
  liveTradeMutation: false;
  livePositionMutation: false;
  automaticRetry: false;
  migrationRepair: false;
  schemaReset: false;
  remoteDatabaseDiffApplication: false;
};

export type PostTradeStagingMigrationDeploymentApproval = {
  approvalId: string;
  approvalVersion: "post_trade_staging_migration_deployment_approval_v1";
  gateContractVersion: typeof POST_TRADE_STAGING_MIGRATION_DEPLOYMENT_GATE_VERSION;
  migrationFilename: typeof POST_TRADE_STAGING_MIGRATION_FILENAME;
  migrationPath: typeof POST_TRADE_STAGING_MIGRATION_PATH;
  migrationFingerprint: string;
  expectedTargetProjectRef: typeof POST_TRADE_STAGING_MIGRATION_PROJECT_REF;
  rejectedProductionProjectRef: typeof POST_TRADE_STAGING_MIGRATION_REJECTED_PRODUCTION_REF;
  expectedMigrationCount: 1;
  expectedRowCount: 0;
  expectedFunctionCount: 0;
  expectedPolicyCount: 0;
  expectedTriggerCount: 0;
  expectedRpcCount: 0;
  expectedSeedCount: 0;
  deploymentScope: "staging_durable_authorization_consumption_schema_only";
  stagingOnly: true;
  oneShot: true;
  retryAllowed: false;
  approvalState: PostTradeStagingMigrationApprovalState;
  issuedAtIso: string;
  expiresAtIso: string;
  action499ImplementationDecision: typeof POST_TRADE_STAGING_MIGRATION_IMPLEMENTATION_DECISION;
  action500ReviewDecision: typeof POST_TRADE_STAGING_MIGRATION_SQL_REVIEW_DECISION;
  reviewedMigrationArtifact: typeof POST_TRADE_STAGING_MIGRATION_REVIEW_ARTIFACT;
  expectedWorktreeScopeDeclaration: typeof POST_TRADE_STAGING_MIGRATION_WORKTREE_SCOPE;
  forbiddenCapabilities: PostTradeStagingMigrationForbiddenCapabilities;
};

export type PostTradeStagingMigrationProjectEvidence = {
  evidenceVersion: typeof POST_TRADE_STAGING_MIGRATION_PROJECT_EVIDENCE_VERSION;
  resolvedProjectRef: string;
  expectedProjectRef: typeof POST_TRADE_STAGING_MIGRATION_PROJECT_REF;
  rejectedProductionProjectRef: typeof POST_TRADE_STAGING_MIGRATION_REJECTED_PRODUCTION_REF;
  projectIdentitySource: "supabase_cli_link_metadata" | "operator_verified_metadata";
  identitySourceAgreement: "linked_and_environment_project_refs_match";
  linkedProjectRef: string;
  environmentProjectRef: string;
  environmentClassification: "staging";
  verifiedAtIso: string;
  verificationResult: "verified";
  ambiguous: false;
};

export type PostTradeStagingMigrationWorktreeEvidence = {
  evidenceVersion: typeof POST_TRADE_STAGING_MIGRATION_WORKTREE_EVIDENCE_VERSION;
  worktreeScopeDeclaration: typeof POST_TRADE_STAGING_MIGRATION_WORKTREE_SCOPE;
  reviewedMigrationPath: typeof POST_TRADE_STAGING_MIGRATION_PATH;
  inspectedAtIso: string;
  deploymentFiles: readonly string[];
  migrationFiles: readonly string[];
  unrelatedFilesPresent: readonly string[];
  unreviewedMigrationFiles: readonly string[];
};

export type PostTradeStagingMigrationGateInput = {
  approval?: unknown;
  projectEvidence?: unknown;
  worktreeEvidence?: unknown;
  migrationSql?: string;
  evaluatedAtIso?: string;
};

export type PostTradeStagingMigrationDeploymentPlan = {
  planStatus: "blocked" | "structurally_eligible_not_deployed";
  targetProjectRef: typeof POST_TRADE_STAGING_MIGRATION_PROJECT_REF;
  migrationPath: typeof POST_TRADE_STAGING_MIGRATION_PATH;
  migrationFilename: typeof POST_TRADE_STAGING_MIGRATION_FILENAME;
  expectedCommandCategory: "future_supabase_migration_apply_single_reviewed_file";
  preflightChecks: readonly string[];
  postDeployChecks: readonly string[];
  deploymentEnabled: false;
  remoteMutation: false;
  sqlExecuted: false;
  migrationsApplied: 0;
  rowsCreated: 0;
  containsSecrets: false;
  containsServiceRoleKey: false;
  performsShellCommand: false;
  performsSupabaseCall: false;
};

export type PostTradeStagingMigrationGateDecision = {
  gateContractVersion: typeof POST_TRADE_STAGING_MIGRATION_DEPLOYMENT_GATE_VERSION;
  approved: boolean;
  deploymentEnabled: false;
  deploymentStatus: "not_deployed";
  remoteMutation: false;
  sqlExecuted: false;
  migrationsApplied: 0;
  rowsCreated: 0;
  targetProjectVerified: boolean;
  migrationFingerprint: string | null;
  blockingReasons: string[];
  deploymentPlan: PostTradeStagingMigrationDeploymentPlan;
};

const APPROVAL_KEYS = [
  "approvalId",
  "approvalVersion",
  "gateContractVersion",
  "migrationFilename",
  "migrationPath",
  "migrationFingerprint",
  "expectedTargetProjectRef",
  "rejectedProductionProjectRef",
  "expectedMigrationCount",
  "expectedRowCount",
  "expectedFunctionCount",
  "expectedPolicyCount",
  "expectedTriggerCount",
  "expectedRpcCount",
  "expectedSeedCount",
  "deploymentScope",
  "stagingOnly",
  "oneShot",
  "retryAllowed",
  "approvalState",
  "issuedAtIso",
  "expiresAtIso",
  "action499ImplementationDecision",
  "action500ReviewDecision",
  "reviewedMigrationArtifact",
  "expectedWorktreeScopeDeclaration",
  "forbiddenCapabilities",
] as const;

const PROJECT_EVIDENCE_KEYS = [
  "evidenceVersion",
  "resolvedProjectRef",
  "expectedProjectRef",
  "rejectedProductionProjectRef",
  "projectIdentitySource",
  "identitySourceAgreement",
  "linkedProjectRef",
  "environmentProjectRef",
  "environmentClassification",
  "verifiedAtIso",
  "verificationResult",
  "ambiguous",
] as const;

const WORKTREE_EVIDENCE_KEYS = [
  "evidenceVersion",
  "worktreeScopeDeclaration",
  "reviewedMigrationPath",
  "inspectedAtIso",
  "deploymentFiles",
  "migrationFiles",
  "unrelatedFilesPresent",
  "unreviewedMigrationFiles",
] as const;

const FORBIDDEN_CAPABILITY_KEYS = [
  "productionDeployment",
  "multipleMigrations",
  "seedExecution",
  "rowInsertion",
  "databaseFunctionCreation",
  "rpcCreation",
  "triggerCreation",
  "policyCreation",
  "apiActivation",
  "uiActivation",
  "clientActivation",
  "executionRuntimeActivation",
  "authorizationSeeding",
  "authorizationConsumption",
  "executionRecordCreation",
  "auditEventCreation",
  "avanzaIntegration",
  "browserAutomation",
  "buyBehavior",
  "sellBehavior",
  "credentialAccess",
  "sessionAccess",
  "cookieAccess",
  "bankIdAccess",
  "brokerState",
  "settlementRetrieval",
  "liveTradeMutation",
  "livePositionMutation",
  "automaticRetry",
  "migrationRepair",
  "schemaReset",
  "remoteDatabaseDiffApplication",
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

function hasExactStringSet(actual: readonly string[], expected: readonly string[]) {
  const sortedActual = [...actual].sort();
  const sortedExpected = [...expected].sort();
  return (
    sortedActual.length === sortedExpected.length &&
    sortedActual.every((value, index) => value === sortedExpected[index])
  );
}

function containsForbiddenObjectKey(value: unknown, seen = new WeakSet<object>()): boolean {
  if (Array.isArray(value)) {
    return value.some((nested) => containsForbiddenObjectKey(nested, seen));
  }
  if (!isRecord(value)) return false;
  if (seen.has(value)) return true;
  seen.add(value);

  for (const [key, nested] of Object.entries(value)) {
    if ((forbiddenObjectKeys as readonly string[]).includes(key)) return true;
    if (containsForbiddenObjectKey(nested, seen)) return true;
  }

  return false;
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

function containsProductionOutsideRejectedMarker(value: unknown, seen = new WeakSet<object>()): boolean {
  if (Array.isArray(value)) {
    return value.some((nested) => containsProductionOutsideRejectedMarker(nested, seen));
  }
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
  return (
    value.startsWith("/") ||
    value.includes("..") ||
    value.includes("\\") ||
    value.includes("//") ||
    value.trim() !== value
  );
}

function stableStringify(value: unknown): string {
  if (value === undefined) return "__undefined__";
  if (value === null || typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    return `[${value.map((nested) => stableStringify(nested)).join(",")}]`;
  }
  if (!isRecord(value)) {
    throw new Error("Unsupported fingerprint preimage value");
  }
  const keys = Object.keys(value).sort();
  return `{${keys
    .map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`)
    .join(",")}}`;
}

export function normalizePostTradeStagingMigrationSql(sql: string) {
  return sql
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .split("\n")
    .map((line) => line.replace(/[ \t]+$/g, ""))
    .join("\n");
}

function buildStatementInventory(normalizedSql: string) {
  return {
    createTable: (normalizedSql.match(/\bcreate\s+table\b/gi) ?? []).length,
    createUniqueIndex: (normalizedSql.match(/\bcreate\s+unique\s+index\b/gi) ?? [])
      .length,
    createIndex: (normalizedSql.match(/\bcreate\s+index\b/gi) ?? []).length,
    alterTable: (normalizedSql.match(/\balter\s+table\b/gi) ?? []).length,
    enableRowLevelSecurity: (normalizedSql.match(/\benable\s+row\s+level\s+security\b/gi) ?? [])
      .length,
    revoke: (normalizedSql.match(/\brevoke\b/gi) ?? []).length,
    comment: (normalizedSql.match(/\bcomment\s+on\b/gi) ?? []).length,
    insert: (normalizedSql.match(/\binsert\s+into\b/gi) ?? []).length,
    update: (normalizedSql.match(/\bupdate\b/gi) ?? []).length,
    delete: (normalizedSql.match(/\bdelete\s+from\b/gi) ?? []).length,
    copy: (normalizedSql.match(/\bcopy\b/gi) ?? []).length,
    function: (normalizedSql.match(/\bcreate\s+(?:or\s+replace\s+)?function\b/gi) ?? [])
      .length,
    policy: (normalizedSql.match(/\bcreate\s+policy\b/gi) ?? []).length,
    trigger: (normalizedSql.match(/\bcreate\s+trigger\b/gi) ?? []).length,
    rpc: (normalizedSql.match(/\brpc\b/gi) ?? []).length,
    seed: (normalizedSql.match(/\bseed\b/gi) ?? []).length,
  };
}

export function buildPostTradeStagingMigrationFingerprint(input: {
  migrationFilename: string;
  migrationPath: string;
  sql: string;
}) {
  const normalizedSql = normalizePostTradeStagingMigrationSql(input.sql);
  const preimage = {
    gateContractVersion: POST_TRADE_STAGING_MIGRATION_DEPLOYMENT_GATE_VERSION,
    migrationFilename: input.migrationFilename,
    migrationPath: input.migrationPath,
    migrationTimestampPrefix: POST_TRADE_STAGING_MIGRATION_TIMESTAMP_PREFIX,
    targetTable: POST_TRADE_STAGING_MIGRATION_TARGET_TABLE,
    stagingProjectRef: POST_TRADE_STAGING_MIGRATION_PROJECT_REF,
    rejectedProductionProjectRef: POST_TRADE_STAGING_MIGRATION_REJECTED_PRODUCTION_REF,
    normalizedSql,
    normalizedLength: Buffer.byteLength(normalizedSql, "utf8"),
    statementInventory: buildStatementInventory(normalizedSql),
    expectedStatementInventory: POST_TRADE_STAGING_MIGRATION_EXPECTED_STATEMENT_INVENTORY,
    expectedCounts: POST_TRADE_STAGING_MIGRATION_EXPECTED_COUNTS,
    rlsExpectation: POST_TRADE_STAGING_MIGRATION_RLS_EXPECTATION,
    privilegeRevokeExpectation: POST_TRADE_STAGING_MIGRATION_PRIVILEGE_REVOKE_EXPECTATION,
    implementationDecision: POST_TRADE_STAGING_MIGRATION_IMPLEMENTATION_DECISION,
    reviewDecision: POST_TRADE_STAGING_MIGRATION_SQL_REVIEW_DECISION,
    reviewArtifact: POST_TRADE_STAGING_MIGRATION_REVIEW_ARTIFACT,
  };

  return createHash("sha256")
    .update(stableStringify(preimage), "utf8")
    .digest("hex");
}

function defaultDeploymentPlan(
  status: PostTradeStagingMigrationDeploymentPlan["planStatus"],
): PostTradeStagingMigrationDeploymentPlan {
  return {
    planStatus: status,
    targetProjectRef: POST_TRADE_STAGING_MIGRATION_PROJECT_REF,
    migrationPath: POST_TRADE_STAGING_MIGRATION_PATH,
    migrationFilename: POST_TRADE_STAGING_MIGRATION_FILENAME,
    expectedCommandCategory: "future_supabase_migration_apply_single_reviewed_file",
    preflightChecks: [
      "verify_exact_staging_project_ref",
      "verify_single_reviewed_migration_pending",
      "verify_migration_fingerprint",
      "verify_no_unreviewed_migrations",
      "verify_no_production_target",
    ],
    postDeployChecks: [
      "verify_table_exists_in_staging",
      "verify_zero_rows_created",
      "verify_rls_enabled",
      "verify_no_client_policies",
      "verify_anon_authenticated_revoked",
    ],
    deploymentEnabled: false,
    remoteMutation: false,
    sqlExecuted: false,
    migrationsApplied: 0,
    rowsCreated: 0,
    containsSecrets: false,
    containsServiceRoleKey: false,
    performsShellCommand: false,
    performsSupabaseCall: false,
  };
}

function baseDecision(
  reasons: string[],
  fingerprint: string | null,
  targetProjectVerified: boolean,
): PostTradeStagingMigrationGateDecision {
  const approved = reasons.length === 0;
  return {
    gateContractVersion: POST_TRADE_STAGING_MIGRATION_DEPLOYMENT_GATE_VERSION,
    approved,
    deploymentEnabled: false,
    deploymentStatus: "not_deployed",
    remoteMutation: false,
    sqlExecuted: false,
    migrationsApplied: 0,
    rowsCreated: 0,
    targetProjectVerified,
    migrationFingerprint: fingerprint,
    blockingReasons: reasons,
    deploymentPlan: defaultDeploymentPlan(
      approved ? "structurally_eligible_not_deployed" : "blocked",
    ),
  };
}

export function buildPostTradeStagingMigrationDeploymentApproval(input: {
  approvalId: string;
  issuedAtIso: string;
  expiresAtIso: string;
  migrationFingerprint?: string;
}): PostTradeStagingMigrationDeploymentApproval {
  return {
    approvalId: input.approvalId,
    approvalVersion: "post_trade_staging_migration_deployment_approval_v1",
    gateContractVersion: POST_TRADE_STAGING_MIGRATION_DEPLOYMENT_GATE_VERSION,
    migrationFilename: POST_TRADE_STAGING_MIGRATION_FILENAME,
    migrationPath: POST_TRADE_STAGING_MIGRATION_PATH,
    migrationFingerprint:
      input.migrationFingerprint ?? POST_TRADE_STAGING_MIGRATION_EXPECTED_FINGERPRINT,
    expectedTargetProjectRef: POST_TRADE_STAGING_MIGRATION_PROJECT_REF,
    rejectedProductionProjectRef: POST_TRADE_STAGING_MIGRATION_REJECTED_PRODUCTION_REF,
    expectedMigrationCount: 1,
    expectedRowCount: 0,
    expectedFunctionCount: 0,
    expectedPolicyCount: 0,
    expectedTriggerCount: 0,
    expectedRpcCount: 0,
    expectedSeedCount: 0,
    deploymentScope: "staging_durable_authorization_consumption_schema_only",
    stagingOnly: true,
    oneShot: true,
    retryAllowed: false,
    approvalState: "unused",
    issuedAtIso: input.issuedAtIso,
    expiresAtIso: input.expiresAtIso,
    action499ImplementationDecision: POST_TRADE_STAGING_MIGRATION_IMPLEMENTATION_DECISION,
    action500ReviewDecision: POST_TRADE_STAGING_MIGRATION_SQL_REVIEW_DECISION,
    reviewedMigrationArtifact: POST_TRADE_STAGING_MIGRATION_REVIEW_ARTIFACT,
    expectedWorktreeScopeDeclaration: POST_TRADE_STAGING_MIGRATION_WORKTREE_SCOPE,
    forbiddenCapabilities: Object.fromEntries(
      FORBIDDEN_CAPABILITY_KEYS.map((key) => [key, false]),
    ) as PostTradeStagingMigrationForbiddenCapabilities,
  };
}

export function buildPostTradeStagingMigrationProjectEvidence(input: {
  verifiedAtIso: string;
}): PostTradeStagingMigrationProjectEvidence {
  return {
    evidenceVersion: POST_TRADE_STAGING_MIGRATION_PROJECT_EVIDENCE_VERSION,
    resolvedProjectRef: POST_TRADE_STAGING_MIGRATION_PROJECT_REF,
    expectedProjectRef: POST_TRADE_STAGING_MIGRATION_PROJECT_REF,
    rejectedProductionProjectRef: POST_TRADE_STAGING_MIGRATION_REJECTED_PRODUCTION_REF,
    projectIdentitySource: "supabase_cli_link_metadata",
    identitySourceAgreement: "linked_and_environment_project_refs_match",
    linkedProjectRef: POST_TRADE_STAGING_MIGRATION_PROJECT_REF,
    environmentProjectRef: POST_TRADE_STAGING_MIGRATION_PROJECT_REF,
    environmentClassification: "staging",
    verifiedAtIso: input.verifiedAtIso,
    verificationResult: "verified",
    ambiguous: false,
  };
}

export function buildPostTradeStagingMigrationWorktreeEvidence(input: {
  inspectedAtIso?: string;
} = {}): PostTradeStagingMigrationWorktreeEvidence {
  return {
    evidenceVersion: POST_TRADE_STAGING_MIGRATION_WORKTREE_EVIDENCE_VERSION,
    worktreeScopeDeclaration: POST_TRADE_STAGING_MIGRATION_WORKTREE_SCOPE,
    reviewedMigrationPath: POST_TRADE_STAGING_MIGRATION_PATH,
    inspectedAtIso: input.inspectedAtIso ?? "2026-07-12T11:55:00.000Z",
    deploymentFiles: POST_TRADE_STAGING_MIGRATION_ALLOWED_SCOPE_FILES,
    migrationFiles: [POST_TRADE_STAGING_MIGRATION_PATH],
    unrelatedFilesPresent: [],
    unreviewedMigrationFiles: [],
  };
}

function pushApprovalReasons(
  approval: unknown,
  reasons: string[],
  evaluatedAt: Date,
) {
  if (!isRecord(approval)) {
    reasons.push("approval:required");
    return;
  }
  if (containsUnsupportedNestedValue(approval)) reasons.push("approval:unsupported_nested_value");
  if (!hasExactKeys(approval, APPROVAL_KEYS)) reasons.push("approval:unknown_or_missing_fields");
  if (containsForbiddenObjectKey(approval)) reasons.push("approval:forbidden_secret_or_credential_field");
  if (containsProductionOutsideRejectedMarker(approval)) {
    reasons.push("approval:production_ref_outside_rejection_metadata");
  }

  const typed = approval as Partial<PostTradeStagingMigrationDeploymentApproval>;
  if (typeof typed.approvalId !== "string" || typed.approvalId.trim() !== typed.approvalId) {
    reasons.push("approval:approval_id_must_be_exact_string");
  }
  if (typed.approvalId === "") reasons.push("approval:approval_id_required");
  if (typed.approvalVersion !== "post_trade_staging_migration_deployment_approval_v1") {
    reasons.push("approval:version_mismatch");
  }
  if (typed.gateContractVersion !== POST_TRADE_STAGING_MIGRATION_DEPLOYMENT_GATE_VERSION) {
    reasons.push("approval:gate_contract_version_mismatch");
  }
  if (typed.migrationFilename !== POST_TRADE_STAGING_MIGRATION_FILENAME) {
    reasons.push("approval:migration_filename_mismatch");
  }
  if (typed.migrationPath !== POST_TRADE_STAGING_MIGRATION_PATH) {
    reasons.push("approval:migration_path_mismatch");
  }
  if (typed.migrationFingerprint !== POST_TRADE_STAGING_MIGRATION_EXPECTED_FINGERPRINT) {
    reasons.push("approval:migration_fingerprint_mismatch");
  }
  if (
    !typed.migrationFingerprint ||
    typed.migrationFingerprint.length !== 64 ||
    !/^[a-f0-9]{64}$/.test(typed.migrationFingerprint)
  ) {
    reasons.push("approval:migration_fingerprint_full_sha256_required");
  }
  if (typed.expectedTargetProjectRef !== POST_TRADE_STAGING_MIGRATION_PROJECT_REF) {
    reasons.push("approval:target_project_mismatch");
  }
  if (
    String(typed.expectedTargetProjectRef) ===
    POST_TRADE_STAGING_MIGRATION_REJECTED_PRODUCTION_REF
  ) {
    reasons.push("approval:production_target_blocked");
  }
  if (typed.expectedMigrationCount !== 1) reasons.push("approval:expected_one_migration_required");
  if (typed.expectedRowCount !== 0) reasons.push("approval:expected_zero_rows_required");
  if (typed.expectedFunctionCount !== 0) reasons.push("approval:expected_zero_functions_required");
  if (typed.expectedPolicyCount !== 0) reasons.push("approval:expected_zero_policies_required");
  if (typed.expectedTriggerCount !== 0) reasons.push("approval:expected_zero_triggers_required");
  if (typed.expectedRpcCount !== 0) reasons.push("approval:expected_zero_rpcs_required");
  if (typed.expectedSeedCount !== 0) reasons.push("approval:expected_zero_seeds_required");
  if (typed.deploymentScope !== "staging_durable_authorization_consumption_schema_only") {
    reasons.push("approval:deployment_scope_mismatch");
  }
  if (typed.stagingOnly !== true) reasons.push("approval:staging_only_required");
  if (typed.oneShot !== true) reasons.push("approval:one_shot_required");
  if (typed.retryAllowed !== false) reasons.push("approval:retry_forbidden");
  if (typed.approvalState !== "unused") reasons.push("approval:unused_state_required");
  if (typed.action499ImplementationDecision !== POST_TRADE_STAGING_MIGRATION_IMPLEMENTATION_DECISION) {
    reasons.push("approval:action_499_decision_mismatch");
  }
  if (typed.action500ReviewDecision !== POST_TRADE_STAGING_MIGRATION_SQL_REVIEW_DECISION) {
    reasons.push("approval:action_500_decision_mismatch");
  }
  if (typed.reviewedMigrationArtifact !== POST_TRADE_STAGING_MIGRATION_REVIEW_ARTIFACT) {
    reasons.push("approval:review_artifact_mismatch");
  }
  if (typed.expectedWorktreeScopeDeclaration !== POST_TRADE_STAGING_MIGRATION_WORKTREE_SCOPE) {
    reasons.push("approval:worktree_scope_mismatch");
  }

  const issuedAt = Date.parse(String(typed.issuedAtIso));
  const expiresAt = Date.parse(String(typed.expiresAtIso));
  if (!Number.isFinite(issuedAt)) reasons.push("approval:issued_at_invalid");
  if (!Number.isFinite(expiresAt)) reasons.push("approval:expires_at_invalid");
  if (Number.isFinite(issuedAt) && issuedAt > evaluatedAt.getTime() + 5 * 60 * 1000) {
    reasons.push("approval:future_issued_outside_tolerance");
  }
  if (Number.isFinite(expiresAt) && expiresAt <= evaluatedAt.getTime()) {
    reasons.push("approval:expired");
  }
  if (Number.isFinite(issuedAt) && Number.isFinite(expiresAt) && expiresAt <= issuedAt) {
    reasons.push("approval:expires_before_issued");
  }
  if (Number.isFinite(issuedAt) && Number.isFinite(expiresAt) && expiresAt - issuedAt > 2 * 60 * 60 * 1000) {
    reasons.push("approval:validity_window_too_long");
  }

  if (!isRecord(typed.forbiddenCapabilities)) {
    reasons.push("approval:forbidden_capabilities_required");
    return;
  }
  if (!hasExactKeys(typed.forbiddenCapabilities, FORBIDDEN_CAPABILITY_KEYS)) {
    reasons.push("approval:forbidden_capabilities_unknown_or_missing");
  }
  for (const key of FORBIDDEN_CAPABILITY_KEYS) {
    if (typed.forbiddenCapabilities[key] !== false) {
      reasons.push(`approval:capability_${key}_blocked`);
    }
  }
}

function pushProjectReasons(projectEvidence: unknown, reasons: string[], evaluatedAt: Date) {
  if (!isRecord(projectEvidence)) {
    reasons.push("project:verification_evidence_required");
    return false;
  }
  if (containsUnsupportedNestedValue(projectEvidence)) {
    reasons.push("project:unsupported_nested_value");
  }
  if (!hasExactKeys(projectEvidence, PROJECT_EVIDENCE_KEYS)) {
    reasons.push("project:unknown_or_missing_fields");
  }
  if (containsProductionOutsideRejectedMarker(projectEvidence)) {
    reasons.push("project:production_ref_outside_rejection_metadata");
  }

  const typed = projectEvidence as Partial<PostTradeStagingMigrationProjectEvidence>;
  if (typed.evidenceVersion !== POST_TRADE_STAGING_MIGRATION_PROJECT_EVIDENCE_VERSION) {
    reasons.push("project:evidence_version_mismatch");
  }
  if (!/^[a-z0-9]{20}$/.test(String(typed.resolvedProjectRef))) {
    reasons.push("project:resolved_project_ref_malformed");
  }
  const exactStaging =
    typed.resolvedProjectRef === POST_TRADE_STAGING_MIGRATION_PROJECT_REF &&
    typed.expectedProjectRef === POST_TRADE_STAGING_MIGRATION_PROJECT_REF &&
    typed.linkedProjectRef === POST_TRADE_STAGING_MIGRATION_PROJECT_REF &&
    typed.environmentProjectRef === POST_TRADE_STAGING_MIGRATION_PROJECT_REF;

  if (!exactStaging) reasons.push("project:exact_staging_project_required");
  if (
    typed.projectIdentitySource !== "supabase_cli_link_metadata" &&
    typed.projectIdentitySource !== "operator_verified_metadata"
  ) {
    reasons.push("project:unknown_identity_source");
  }
  if (typed.identitySourceAgreement !== "linked_and_environment_project_refs_match") {
    reasons.push("project:identity_source_agreement_required");
  }
  if (
    typed.resolvedProjectRef === POST_TRADE_STAGING_MIGRATION_REJECTED_PRODUCTION_REF ||
    typed.linkedProjectRef === POST_TRADE_STAGING_MIGRATION_REJECTED_PRODUCTION_REF ||
    typed.environmentProjectRef === POST_TRADE_STAGING_MIGRATION_REJECTED_PRODUCTION_REF
  ) {
    reasons.push("project:production_target_blocked");
  }
  if (typed.environmentClassification !== "staging") {
    reasons.push("project:staging_environment_required");
  }
  if (typed.verificationResult !== "verified" || typed.ambiguous !== false) {
    reasons.push("project:unambiguous_verified_result_required");
  }

  const verifiedAt = Date.parse(String(typed.verifiedAtIso));
  if (!Number.isFinite(verifiedAt)) {
    reasons.push("project:verified_at_invalid");
  } else if (evaluatedAt.getTime() - verifiedAt > 30 * 60 * 1000) {
    reasons.push("project:verification_stale");
  } else if (verifiedAt > evaluatedAt.getTime() + 5 * 60 * 1000) {
    reasons.push("project:verification_future_dated");
  }

  return exactStaging && typed.verificationResult === "verified" && typed.ambiguous === false;
}

function pushWorktreeReasons(worktreeEvidence: unknown, reasons: string[], evaluatedAt: Date) {
  if (!isRecord(worktreeEvidence)) {
    reasons.push("worktree:evidence_required");
    return;
  }
  if (containsUnsupportedNestedValue(worktreeEvidence)) {
    reasons.push("worktree:unsupported_nested_value");
  }
  if (!hasExactKeys(worktreeEvidence, WORKTREE_EVIDENCE_KEYS)) {
    reasons.push("worktree:unknown_or_missing_fields");
  }
  if (containsForbiddenObjectKey(worktreeEvidence)) {
    reasons.push("worktree:forbidden_secret_or_credential_field");
  }

  const typed = worktreeEvidence as Partial<PostTradeStagingMigrationWorktreeEvidence>;
  if (typed.evidenceVersion !== POST_TRADE_STAGING_MIGRATION_WORKTREE_EVIDENCE_VERSION) {
    reasons.push("worktree:evidence_version_mismatch");
  }
  if (typed.worktreeScopeDeclaration !== POST_TRADE_STAGING_MIGRATION_WORKTREE_SCOPE) {
    reasons.push("worktree:scope_declaration_mismatch");
  }
  if (typed.reviewedMigrationPath !== POST_TRADE_STAGING_MIGRATION_PATH) {
    reasons.push("worktree:reviewed_migration_missing");
  }
  if (!hasExactStringSet(typed.deploymentFiles ?? [], POST_TRADE_STAGING_MIGRATION_ALLOWED_SCOPE_FILES)) {
    reasons.push("worktree:deployment_files_mismatch");
  }
  for (const file of [...(typed.deploymentFiles ?? []), ...(typed.migrationFiles ?? [])]) {
    if (typeof file !== "string" || hasUnsafePath(file)) {
      reasons.push("worktree:unsafe_path");
      break;
    }
  }
  if (!hasExactStringSet(typed.migrationFiles ?? [], [POST_TRADE_STAGING_MIGRATION_PATH])) {
    reasons.push("worktree:exactly_one_reviewed_migration_required");
  }
  if ((typed.unreviewedMigrationFiles ?? []).length > 0) {
    reasons.push("worktree:unreviewed_migration_files_blocked");
  }
  const unrelated = typed.unrelatedFilesPresent ?? [];
  if (unrelated.length > 0) {
    reasons.push("worktree:unrelated_files_in_deployment_scope_blocked");
  }
  for (const file of unrelated) {
    if ((POST_TRADE_STAGING_MIGRATION_UNRELATED_FILES as readonly string[]).includes(file)) {
      reasons.push(`worktree:unrelated_file_blocked:${file}`);
    }
  }
  const inspectedAt = Date.parse(String(typed.inspectedAtIso));
  if (!Number.isFinite(inspectedAt)) {
    reasons.push("worktree:inspected_at_invalid");
  } else if (evaluatedAt.getTime() - inspectedAt > 30 * 60 * 1000) {
    reasons.push("worktree:evidence_stale");
  } else if (inspectedAt > evaluatedAt.getTime() + 5 * 60 * 1000) {
    reasons.push("worktree:evidence_future_dated");
  }
}

function pushMigrationSqlReasons(sql: unknown, reasons: string[]) {
  if (typeof sql !== "string" || sql.length === 0) {
    reasons.push("migrationSql:required");
    return null;
  }

  const normalized = normalizePostTradeStagingMigrationSql(sql);
  const fingerprint = buildPostTradeStagingMigrationFingerprint({
    migrationFilename: POST_TRADE_STAGING_MIGRATION_FILENAME,
    migrationPath: POST_TRADE_STAGING_MIGRATION_PATH,
    sql,
  });

  if (Buffer.byteLength(normalized, "utf8") !== POST_TRADE_STAGING_MIGRATION_EXPECTED_NORMALIZED_LENGTH) {
    reasons.push("migrationSql:normalized_length_mismatch");
  }
  if (fingerprint !== POST_TRADE_STAGING_MIGRATION_EXPECTED_FINGERPRINT) {
    reasons.push("migrationSql:fingerprint_mismatch");
  }
  const inventory = buildStatementInventory(normalized);
  if (stableStringify(inventory) !== stableStringify(POST_TRADE_STAGING_MIGRATION_EXPECTED_STATEMENT_INVENTORY)) {
    reasons.push("migrationSql:statement_inventory_mismatch");
  }
  if (!normalized.includes("create table if not exists public.execution_authorization_consumptions")) {
    reasons.push("migrationSql:expected_table_missing");
  }
  if (/\binsert\s+into\b/i.test(sql)) reasons.push("migrationSql:insert_blocked");
  if (/\bupdate\b/i.test(sql)) reasons.push("migrationSql:update_blocked");
  if (/\bdelete\s+from\b/i.test(sql)) reasons.push("migrationSql:delete_blocked");
  if (/\bcopy\b/i.test(sql)) reasons.push("migrationSql:copy_blocked");
  if (/create\s+(?:or\s+replace\s+)?function/i.test(sql)) {
    reasons.push("migrationSql:function_blocked");
  }
  if (/create\s+policy/i.test(sql)) reasons.push("migrationSql:policy_blocked");
  if (/create\s+trigger/i.test(sql)) reasons.push("migrationSql:trigger_blocked");
  if (/\brpc\b/i.test(sql)) reasons.push("migrationSql:rpc_blocked");

  return fingerprint;
}

export function evaluatePostTradeStagingMigrationDeploymentGate(
  input: PostTradeStagingMigrationGateInput = {},
): PostTradeStagingMigrationGateDecision {
  const evaluatedAt = new Date(input.evaluatedAtIso ?? new Date(0).toISOString());
  const reasons: string[] = [];

  pushApprovalReasons(input.approval, reasons, evaluatedAt);
  const targetProjectVerified = pushProjectReasons(input.projectEvidence, reasons, evaluatedAt);
  pushWorktreeReasons(input.worktreeEvidence, reasons, evaluatedAt);
  const fingerprint = pushMigrationSqlReasons(input.migrationSql, reasons);

  return baseDecision(reasons, fingerprint, targetProjectVerified);
}
