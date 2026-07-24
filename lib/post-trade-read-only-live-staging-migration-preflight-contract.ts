import { createHash } from "node:crypto";

import {
  POST_TRADE_STAGING_MIGRATION_DEPLOYMENT_READINESS_ARTIFACT_ID,
  POST_TRADE_STAGING_MIGRATION_DEPLOYMENT_READINESS_ARTIFACT_VERSION,
} from "@/lib/post-trade-staging-migration-deployment-readiness-artifact-core";
import {
  POST_TRADE_STAGING_MIGRATION_EXPECTED_FINGERPRINT,
  POST_TRADE_STAGING_MIGRATION_EXPECTED_NORMALIZED_LENGTH,
  POST_TRADE_STAGING_MIGRATION_EXPECTED_STATEMENT_INVENTORY,
  POST_TRADE_STAGING_MIGRATION_FILENAME,
  POST_TRADE_STAGING_MIGRATION_PATH,
  POST_TRADE_STAGING_MIGRATION_PROJECT_REF,
  POST_TRADE_STAGING_MIGRATION_REJECTED_PRODUCTION_REF,
  POST_TRADE_STAGING_MIGRATION_TIMESTAMP_PREFIX,
  POST_TRADE_STAGING_MIGRATION_UNRELATED_FILES,
} from "@/lib/post-trade-staging-migration-deployment-gate-core";

export const POST_TRADE_READ_ONLY_LIVE_PREFLIGHT_CONTRACT_ID =
  "post_trade_read_only_live_staging_migration_preflight_contract_001" as const;
export const POST_TRADE_READ_ONLY_LIVE_PREFLIGHT_CONTRACT_VERSION =
  "post_trade_read_only_live_staging_migration_preflight_contract_v1" as const;
export const POST_TRADE_READ_ONLY_LIVE_PREFLIGHT_SOURCE_ACTION =
  "Action 505 - Design Read-Only Live Staging Migration Preflight Contract" as const;
export const POST_TRADE_READ_ONLY_LIVE_PREFLIGHT_READINESS_ARTIFACT_FINGERPRINT =
  "8f22f3544c426584587a76b1bec8393ad930c4b9d5d1e0a8b2e710128443630d" as const;
export const POST_TRADE_READ_ONLY_LIVE_PREFLIGHT_REVIEW_READY_DECISION =
  "post_trade_single_use_source_controlled_staging_migration_deployment_readiness_artifact_static_security_review_ready_for_read_only_live_preflight_design" as const;
export const POST_TRADE_READ_ONLY_LIVE_PREFLIGHT_REVIEW_RESULT =
  "post_trade_single_use_source_controlled_staging_migration_deployment_readiness_artifact_static_security_review_completed_no_deployment" as const;

export const POST_TRADE_READ_ONLY_LIVE_PREFLIGHT_TRUSTED_SOURCES = [
  "trusted_readiness_artifact_validator_v1",
  "trusted_local_migration_reader_v1",
  "trusted_local_migration_inventory_reader_v1",
  "trusted_git_status_runner_v1",
  "trusted_git_diff_runner_v1",
  "trusted_supabase_project_status_runner_v1",
  "trusted_supabase_migration_list_runner_v1",
  "trusted_supabase_catalog_reader_v1",
  "trusted_supabase_privilege_reader_v1",
  "trusted_collection_session_builder_v1",
] as const;

export const POST_TRADE_READ_ONLY_LIVE_PREFLIGHT_REJECTED_SOURCES = [
  "caller",
  "manual",
  "user",
  "expected_constant",
  "environment_only",
  "self_asserted",
  "unknown",
] as const;

export const POST_TRADE_READ_ONLY_LIVE_PREFLIGHT_FRESHNESS_MS = {
  readinessArtifact: 60 * 60 * 1000,
  localMigrationContent: 10 * 60 * 1000,
  localMigrationInventory: 10 * 60 * 1000,
  worktree: 5 * 60 * 1000,
  projectIdentity: 2 * 60 * 1000,
  remoteMigrationHistory: 2 * 60 * 1000,
  remoteCatalog: 2 * 60 * 1000,
  remotePrivilegeBaseline: 2 * 60 * 1000,
  collectionSession: 2 * 60 * 1000,
} as const;

export const POST_TRADE_READ_ONLY_LIVE_PREFLIGHT_REQUIRED_EVIDENCE_TYPES = [
  "readiness_artifact",
  "local_migration_content",
  "git_worktree",
  "local_migration_inventory",
  "supabase_project_link",
  "supabase_target_project",
  "remote_migration_history",
  "remote_catalog_schema",
  "remote_privilege_rls_baseline",
  "collection_session_freshness",
] as const;

export const POST_TRADE_READ_ONLY_LIVE_PREFLIGHT_DEPLOYMENT_UNIT_ALLOWLIST = [
  POST_TRADE_STAGING_MIGRATION_PATH,
] as const;

export const POST_TRADE_READ_ONLY_LIVE_PREFLIGHT_UNRELATED_DEPLOYMENT_DENYLIST = [
  ...POST_TRADE_STAGING_MIGRATION_UNRELATED_FILES,
  "scripts/action-366-corrected-immutable-preview-candidate-preparation-approval-gate-verify.mjs",
  "tests/e2e/action-366-corrected-immutable-preview-candidate-preparation-approval-gate.spec.ts",
  "docs/action-367-read-only-dependency-bridge-capability-evidence.json",
  "docs/action-367-read-only-dependency-bridge-capability-verification.md",
  "scripts/action-367-read-only-dependency-bridge-capability-verification-verify.mjs",
  "tests/e2e/action-367-read-only-dependency-bridge-capability-verification.spec.ts",
  "docs/action-368-isolated-dependency-materialization-strategy-approval-gate.md",
  "scripts/action-368-isolated-dependency-materialization-strategy-approval-gate-verify.mjs",
  "tests/e2e/action-368-isolated-dependency-materialization-strategy-approval-gate.spec.ts",
  "docs/action-369-copy-on-write-dependency-clone-capability-evidence.json",
  "docs/action-369-copy-on-write-dependency-clone-capability-verification.md",
  "scripts/action-369-copy-on-write-dependency-clone-capability-verification-verify.mjs",
  "tests/e2e/action-369-copy-on-write-dependency-clone-capability-verification.spec.ts",
] as const;

export type PostTradeReadOnlyLivePreflightEvidenceType =
  typeof POST_TRADE_READ_ONLY_LIVE_PREFLIGHT_REQUIRED_EVIDENCE_TYPES[number];
export type PostTradeReadOnlyLivePreflightTrustedSource =
  typeof POST_TRADE_READ_ONLY_LIVE_PREFLIGHT_TRUSTED_SOURCES[number];
export type PostTradeReadOnlyLivePreflightDecisionClassification =
  | "ready_for_explicit_staging_deployment_action"
  | "blocked"
  | "invalid"
  | "stale"
  | "ambiguous"
  | "already_applied";

export type PostTradeReadOnlyLivePreflightBlockingReason =
  | "readiness_artifact_missing"
  | "readiness_artifact_invalid"
  | "readiness_artifact_expired"
  | "readiness_artifact_consumed"
  | "artifact_fingerprint_mismatch"
  | "migration_fingerprint_mismatch"
  | "migration_content_mismatch"
  | "project_not_staging"
  | "production_project_detected"
  | "project_evidence_conflicting"
  | "worktree_scope_mismatch"
  | "reviewed_migration_missing"
  | "extra_migration_included"
  | "migration_already_applied"
  | "remote_migration_history_divergence"
  | "unexpected_remote_migration"
  | "missing_prerequisite_migration"
  | "target_relation_already_exists"
  | "conflicting_remote_object"
  | "referenced_dependency_missing"
  | "foreign_key_type_mismatch"
  | "evidence_stale"
  | "mixed_collection_sessions"
  | "source_untrusted"
  | "evidence_incomplete"
  | "evidence_not_authoritative"
  | "evidence_not_read_only"
  | "mutation_detected"
  | "unsupported_evidence_value"
  | "ambiguous_result"
  | "malformed_evidence"
  | "unsafe_path"
  | "secret_material_detected"
  | "future_dated_evidence"
  | "excessive_evidence_lifetime";

const EXPECTED_SOURCE_BY_EVIDENCE_TYPE: Record<
  PostTradeReadOnlyLivePreflightEvidenceType,
  PostTradeReadOnlyLivePreflightTrustedSource | null
> = {
  readiness_artifact: "trusted_readiness_artifact_validator_v1",
  local_migration_content: "trusted_local_migration_reader_v1",
  git_worktree: "trusted_git_status_runner_v1",
  local_migration_inventory: "trusted_local_migration_inventory_reader_v1",
  supabase_project_link: "trusted_supabase_project_status_runner_v1",
  supabase_target_project: "trusted_supabase_project_status_runner_v1",
  remote_migration_history: "trusted_supabase_migration_list_runner_v1",
  remote_catalog_schema: "trusted_supabase_catalog_reader_v1",
  remote_privilege_rls_baseline: "trusted_supabase_privilege_reader_v1",
  collection_session_freshness: "trusted_collection_session_builder_v1",
};

export type PostTradeReadOnlyLivePreflightCollectionSession = {
  preflightSessionId: string;
  preflightContractVersion: typeof POST_TRADE_READ_ONLY_LIVE_PREFLIGHT_CONTRACT_VERSION;
  collectorVersion: "post_trade_read_only_live_preflight_collector_v1";
  collectionStartedAtIso: string;
  collectionCompletedAtIso: string;
  hostClassification: "trusted_operator_workstation" | "ci_read_only_runner";
  repositoryIdentity: "ture_trade_repository";
  repositoryRootIdentity: string;
  expectedBranchIdentity: string | null;
  expectedCommitIdentity: string | null;
  expectedWorktreeBaseline: "reviewed_deployment_unit_with_unrelated_changes_excluded";
  readinessArtifactId: typeof POST_TRADE_STAGING_MIGRATION_DEPLOYMENT_READINESS_ARTIFACT_ID;
  readinessArtifactFingerprint: typeof POST_TRADE_READ_ONLY_LIVE_PREFLIGHT_READINESS_ARTIFACT_FINGERPRINT;
  migrationFilename: typeof POST_TRADE_STAGING_MIGRATION_FILENAME;
  migrationPath: typeof POST_TRADE_STAGING_MIGRATION_PATH;
  expectedMigrationFingerprint: typeof POST_TRADE_STAGING_MIGRATION_EXPECTED_FINGERPRINT;
  targetStagingProjectRef: typeof POST_TRADE_STAGING_MIGRATION_PROJECT_REF;
  rejectedProductionProjectRef: typeof POST_TRADE_STAGING_MIGRATION_REJECTED_PRODUCTION_REF;
};

export type PostTradeReadOnlyLivePreflightEvidenceEnvelope = {
  evidenceId: string;
  evidenceType: PostTradeReadOnlyLivePreflightEvidenceType;
  evidenceVersion: string;
  sourceIdentity: PostTradeReadOnlyLivePreflightTrustedSource;
  collectionSessionId: string;
  observedAtIso: string;
  expiresAtIso: string;
  evidenceFingerprint: string;
  resultClassification: string;
  complete: boolean;
  authoritative: boolean;
  readOnly: boolean;
};

export type PostTradeReadOnlyLivePreflightEvidenceSet = {
  collectionSession: PostTradeReadOnlyLivePreflightCollectionSession;
  readinessArtifact: PostTradeReadOnlyLivePreflightEvidenceEnvelope & {
    evidenceType: "readiness_artifact";
    artifactId: typeof POST_TRADE_STAGING_MIGRATION_DEPLOYMENT_READINESS_ARTIFACT_ID;
    artifactVersion: typeof POST_TRADE_STAGING_MIGRATION_DEPLOYMENT_READINESS_ARTIFACT_VERSION;
    artifactFingerprint: typeof POST_TRADE_READ_ONLY_LIVE_PREFLIGHT_READINESS_ARTIFACT_FINGERPRINT;
    artifactState: "unused" | "consumed" | "expired" | "invalid";
    reviewDecision: typeof POST_TRADE_READ_ONLY_LIVE_PREFLIGHT_REVIEW_READY_DECISION;
    reviewResult: typeof POST_TRADE_READ_ONLY_LIVE_PREFLIGHT_REVIEW_RESULT;
  };
  localMigrationContent: PostTradeReadOnlyLivePreflightEvidenceEnvelope & {
    evidenceType: "local_migration_content";
    migrationPath: typeof POST_TRADE_STAGING_MIGRATION_PATH;
    migrationFilename: typeof POST_TRADE_STAGING_MIGRATION_FILENAME;
    fileByteLength: number;
    normalizedSqlByteLength: typeof POST_TRADE_STAGING_MIGRATION_EXPECTED_NORMALIZED_LENGTH;
    sha256: typeof POST_TRADE_STAGING_MIGRATION_EXPECTED_FINGERPRINT | string;
    normalizationContractVersion: "post_trade_staging_migration_sql_normalization_v1";
    statementInventory: typeof POST_TRADE_STAGING_MIGRATION_EXPECTED_STATEMENT_INVENTORY;
    fileTypeClassification: "sql_migration";
    symlinkStatus: "not_symlink" | "symlink";
    regularFileStatus: "regular_file" | "not_regular_file";
    duplicatePathStatus: "unique_path" | "duplicate_path";
  };
  worktree: PostTradeReadOnlyLivePreflightEvidenceEnvelope & {
    evidenceType: "git_worktree";
    trackedModifiedFiles: readonly string[];
    stagedFiles: readonly string[];
    unstagedFiles: readonly string[];
    untrackedFiles: readonly string[];
    deletedFiles: readonly string[];
    renamedFiles: readonly string[];
    conflictedFiles: readonly string[];
    symlinkPaths: readonly string[];
    submoduleState: "none" | "clean" | "dirty" | "ambiguous";
    currentBranch: string;
    currentCommit: string;
    repositoryRootIdentity: string;
    deploymentUnitFiles: readonly string[];
    unrelatedFilesPresentButExcluded: readonly string[];
    normalizedWorktreeFingerprint: string;
    scopeClassification:
      | "exact_reviewed_deployment_scope"
      | "unrelated_changes_present_but_excluded"
      | "reviewed_migration_missing"
      | "reviewed_migration_modified_unexpectedly"
      | "extra_migration_present"
      | "migration_rename_detected"
      | "unsafe_path_present"
      | "conflict_present"
      | "symlink_ambiguity"
      | "stale_evidence"
      | "malformed_evidence"
      | "ambiguous_evidence";
  };
  localMigrationInventory: PostTradeReadOnlyLivePreflightEvidenceEnvelope & {
    evidenceType: "local_migration_inventory";
    allMigrationFilenames: readonly string[];
    orderedMigrationTimestamps: readonly string[];
    targetMigrationPresence: "exactly_once" | "missing" | "duplicate";
    duplicateTimestamps: readonly string[];
    duplicateNames: readonly string[];
    migrationsNewerThanTarget: readonly string[];
    migrationsUnexpectedlyInsertedBeforeTarget: readonly string[];
    migrationCountInProposedDeploymentUnit: number;
    normalizedInventoryFingerprint: string;
    orderingClassification: "valid" | "invalid" | "ambiguous";
  };
  projectLink: PostTradeReadOnlyLivePreflightEvidenceEnvelope & {
    evidenceType: "supabase_project_link";
    observedProjectRef: string | null;
    linkedProjectRef: string | null;
    expectedStagingProjectRef: typeof POST_TRADE_STAGING_MIGRATION_PROJECT_REF;
    rejectedProductionProjectRef: typeof POST_TRADE_STAGING_MIGRATION_REJECTED_PRODUCTION_REF;
    environmentClassification: "staging" | "production" | "alternate" | "unknown" | "ambiguous";
    linkState: "linked" | "not_linked" | "ambiguous";
    agreementClassification:
      | "exact_staging_match"
      | "production_match"
      | "alternate_project"
      | "no_linked_project"
      | "ambiguous_project"
      | "conflicting_project_sources"
      | "malformed_evidence"
      | "stale_evidence";
    productionRejectionClassification: "production_rejected" | "production_detected" | "ambiguous";
    rawOutputFingerprint: string;
    sanitizedEvidenceFingerprint: string;
  };
  targetProject: PostTradeReadOnlyLivePreflightEvidenceEnvelope & {
    evidenceType: "supabase_target_project";
    observedProjectRef: string;
    expectedStagingProjectRef: typeof POST_TRADE_STAGING_MIGRATION_PROJECT_REF;
    rejectedProductionProjectRef: typeof POST_TRADE_STAGING_MIGRATION_REJECTED_PRODUCTION_REF;
    agreementClassification: "exact_staging_match" | "production_match" | "alternate_project" | "ambiguous_project";
    rawOutputFingerprint: string;
    sanitizedEvidenceFingerprint: string;
  };
  remoteMigrationHistory: PostTradeReadOnlyLivePreflightEvidenceEnvelope & {
    evidenceType: "remote_migration_history";
    observedProjectRef: typeof POST_TRADE_STAGING_MIGRATION_PROJECT_REF | string;
    remoteAppliedMigrationIdentifiers: readonly string[];
    targetMigrationAppliedStatus: "unapplied" | "already_applied" | "ambiguous";
    migrationDivergenceStatus: "consistent" | "diverged" | "ambiguous";
    remoteOnlyMigrationStatus: "none" | "unexpected_remote_migration" | "ambiguous";
    localOnlyMigrationStatus: "target_only" | "multiple_local_only" | "ambiguous";
    orderingConsistency: "consistent" | "missing_prerequisite" | "invalid" | "ambiguous";
    historyFingerprint: string;
    resultClassification:
      | "target_migration_unapplied_and_eligible"
      | "target_already_applied"
      | "remote_history_diverged"
      | "unexpected_remote_migration"
      | "missing_prerequisite_migration"
      | "ambiguous_history"
      | "stale_history"
      | "malformed_history";
  };
  remoteCatalog: PostTradeReadOnlyLivePreflightEvidenceEnvelope & {
    evidenceType: "remote_catalog_schema";
    observedProjectRef: typeof POST_TRADE_STAGING_MIGRATION_PROJECT_REF | string;
    targetProjectIsStaging: boolean;
    targetTableExists: boolean;
    conflictingRelationKind: "none" | "table" | "view" | "materialized_view" | "type" | "index" | "policy" | "function" | "trigger";
    targetIndexesExist: boolean;
    targetPoliciesExist: boolean;
    targetFunctionOrTriggerExists: boolean;
    referencedExecutionRecordsTableExists: boolean;
    referencedAuditEventsTableExists: boolean;
    referencedPrimaryKeyColumnsExist: boolean;
    referencedPrimaryKeyTypesMatchUuid: boolean;
    referencedObjectsInPublicSchema: boolean;
    uuidGenerationAvailable: boolean;
    catalogEvidenceFingerprint: string;
    resultClassification:
      | "expected_clean_pre_deployment_state"
      | "table_already_exists"
      | "conflicting_object_exists"
      | "dependency_missing"
      | "dependency_type_mismatch"
      | "ambiguous_catalog"
      | "stale_evidence"
      | "malformed_catalog";
  };
  remotePrivilegeBaseline: PostTradeReadOnlyLivePreflightEvidenceEnvelope & {
    evidenceType: "remote_privilege_rls_baseline";
    anonGrantsClassification: "compatible" | "too_broad" | "ambiguous";
    authenticatedGrantsClassification: "compatible" | "too_broad" | "ambiguous";
    schemaUsageContext: "compatible" | "ambiguous" | "incompatible";
    defaultPrivilegeObservations: "compatible" | "ambiguous" | "incompatible";
    expectedOwnershipContext: "compatible" | "ambiguous" | "incompatible";
    serviceRoleConsideration: "service_role_bypass_operational_risk_remains";
    rlsCapabilityAvailability: "available" | "unavailable" | "ambiguous";
    evidenceFingerprint: string;
    resultClassification: "compatible_pre_deployment_security_baseline" | "incompatible" | "ambiguous";
  };
};

export type PostTradeReadOnlyLivePreflightDecision = {
  contractId: typeof POST_TRADE_READ_ONLY_LIVE_PREFLIGHT_CONTRACT_ID;
  contractVersion: typeof POST_TRADE_READ_ONLY_LIVE_PREFLIGHT_CONTRACT_VERSION;
  decisionClassification: PostTradeReadOnlyLivePreflightDecisionClassification;
  readyForExplicitStagingDeploymentAction: boolean;
  deploymentEnabled: false;
  deploymentStatus: "not_deployed";
  remoteMutation: false;
  sqlExecuted: false;
  migrationsApplied: 0;
  rowsCreated: 0;
  blockingReasons: readonly PostTradeReadOnlyLivePreflightBlockingReason[];
  evidenceSessionId: string | null;
  evidenceFingerprint: string | null;
  futureRunnerRequired: true;
  recommendsSeparateExplicitDeploymentAction: boolean;
};

export type PostTradeReadOnlyLivePreflightPlan = {
  planStatus: "pure_future_runner_plan_only";
  containsExecutableCommands: false;
  containsSecrets: false;
  deploymentEnabled: false;
  remoteMutation: false;
  sqlExecuted: false;
  runnerMayCollectReadOnlyEvidenceLater: true;
  runnerMustNotDeployInSameAction: true;
  steps: readonly string[];
  futureRunnerAllowedCategories: readonly string[];
  futureRunnerForbiddenCategories: readonly string[];
};

const ENVELOPE_KEYS = [
  "evidenceId",
  "evidenceType",
  "evidenceVersion",
  "sourceIdentity",
  "collectionSessionId",
  "observedAtIso",
  "expiresAtIso",
  "evidenceFingerprint",
  "resultClassification",
  "complete",
  "authoritative",
  "readOnly",
] as const;

const SESSION_KEYS = [
  "preflightSessionId",
  "preflightContractVersion",
  "collectorVersion",
  "collectionStartedAtIso",
  "collectionCompletedAtIso",
  "hostClassification",
  "repositoryIdentity",
  "repositoryRootIdentity",
  "expectedBranchIdentity",
  "expectedCommitIdentity",
  "expectedWorktreeBaseline",
  "readinessArtifactId",
  "readinessArtifactFingerprint",
  "migrationFilename",
  "migrationPath",
  "expectedMigrationFingerprint",
  "targetStagingProjectRef",
  "rejectedProductionProjectRef",
] as const;

const EVIDENCE_SET_KEYS = [
  "collectionSession",
  "readinessArtifact",
  "localMigrationContent",
  "worktree",
  "localMigrationInventory",
  "projectLink",
  "targetProject",
  "remoteMigrationHistory",
  "remoteCatalog",
  "remotePrivilegeBaseline",
] as const;

const READINESS_ARTIFACT_KEYS = [
  ...ENVELOPE_KEYS,
  "artifactId",
  "artifactVersion",
  "artifactFingerprint",
  "artifactState",
  "reviewDecision",
  "reviewResult",
] as const;
const LOCAL_MIGRATION_CONTENT_KEYS = [
  ...ENVELOPE_KEYS,
  "migrationPath",
  "migrationFilename",
  "fileByteLength",
  "normalizedSqlByteLength",
  "sha256",
  "normalizationContractVersion",
  "statementInventory",
  "fileTypeClassification",
  "symlinkStatus",
  "regularFileStatus",
  "duplicatePathStatus",
] as const;
const WORKTREE_KEYS = [
  ...ENVELOPE_KEYS,
  "trackedModifiedFiles",
  "stagedFiles",
  "unstagedFiles",
  "untrackedFiles",
  "deletedFiles",
  "renamedFiles",
  "conflictedFiles",
  "symlinkPaths",
  "submoduleState",
  "currentBranch",
  "currentCommit",
  "repositoryRootIdentity",
  "deploymentUnitFiles",
  "unrelatedFilesPresentButExcluded",
  "normalizedWorktreeFingerprint",
  "scopeClassification",
] as const;
const LOCAL_MIGRATION_INVENTORY_KEYS = [
  ...ENVELOPE_KEYS,
  "allMigrationFilenames",
  "orderedMigrationTimestamps",
  "targetMigrationPresence",
  "duplicateTimestamps",
  "duplicateNames",
  "migrationsNewerThanTarget",
  "migrationsUnexpectedlyInsertedBeforeTarget",
  "migrationCountInProposedDeploymentUnit",
  "normalizedInventoryFingerprint",
  "orderingClassification",
] as const;
const PROJECT_LINK_KEYS = [
  ...ENVELOPE_KEYS,
  "observedProjectRef",
  "linkedProjectRef",
  "expectedStagingProjectRef",
  "rejectedProductionProjectRef",
  "environmentClassification",
  "linkState",
  "agreementClassification",
  "productionRejectionClassification",
  "rawOutputFingerprint",
  "sanitizedEvidenceFingerprint",
] as const;
const TARGET_PROJECT_KEYS = [
  ...ENVELOPE_KEYS,
  "observedProjectRef",
  "expectedStagingProjectRef",
  "rejectedProductionProjectRef",
  "agreementClassification",
  "rawOutputFingerprint",
  "sanitizedEvidenceFingerprint",
] as const;
const REMOTE_MIGRATION_HISTORY_KEYS = [
  ...ENVELOPE_KEYS,
  "observedProjectRef",
  "remoteAppliedMigrationIdentifiers",
  "targetMigrationAppliedStatus",
  "migrationDivergenceStatus",
  "remoteOnlyMigrationStatus",
  "localOnlyMigrationStatus",
  "orderingConsistency",
  "historyFingerprint",
] as const;
const REMOTE_CATALOG_KEYS = [
  ...ENVELOPE_KEYS,
  "observedProjectRef",
  "targetProjectIsStaging",
  "targetTableExists",
  "conflictingRelationKind",
  "targetIndexesExist",
  "targetPoliciesExist",
  "targetFunctionOrTriggerExists",
  "referencedExecutionRecordsTableExists",
  "referencedAuditEventsTableExists",
  "referencedPrimaryKeyColumnsExist",
  "referencedPrimaryKeyTypesMatchUuid",
  "referencedObjectsInPublicSchema",
  "uuidGenerationAvailable",
  "catalogEvidenceFingerprint",
] as const;
const REMOTE_PRIVILEGE_BASELINE_KEYS = [
  ...ENVELOPE_KEYS,
  "anonGrantsClassification",
  "authenticatedGrantsClassification",
  "schemaUsageContext",
  "defaultPrivilegeObservations",
  "expectedOwnershipContext",
  "serviceRoleConsideration",
  "rlsCapabilityAvailability",
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
  "password",
  "env",
  "environmentDump",
  "rawEnvironment",
  "connectionString",
  "authorizationHeader",
  "privateKey",
  "homePath",
  "username",
  "token",
  "databasePassword",
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
  if (!isRecord(value)) throw new Error("Unsupported evidence value");
  if (seen.has(value)) throw new Error("Cyclic evidence value");
  seen.add(value);
  return `{${Object.keys(value)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${stableStringify(value[key], seen)}`)
    .join(",")}}`;
}

function fingerprint(value: unknown) {
  return createHash("sha256").update(stableStringify(value), "utf8").digest("hex");
}

function isFingerprint(value: unknown): value is string {
  return typeof value === "string" && /^[a-f0-9]{64}$/.test(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim() === value && value.length > 0;
}

function isProjectRef(value: unknown): value is string {
  return typeof value === "string" && /^[a-z0-9]{20}$/.test(value);
}

function parseIso(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function containsUnsupportedNestedValue(value: unknown, seen = new WeakSet<object>()): boolean {
  if (value === null) return false;
  if (["string", "number", "boolean", "undefined"].includes(typeof value)) return false;
  if (typeof value === "function" || typeof value === "symbol" || typeof value === "bigint") return true;
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

function containsForbiddenStringValue(value: unknown, seen = new WeakSet<object>()): boolean {
  if (typeof value === "string") {
    const lower = value.toLowerCase();
    return (
      lower.includes("postgres://") ||
      lower.includes("postgresql://") ||
      lower.includes("authorization: bearer") ||
      lower.includes("private key") ||
      value.startsWith("/Users/") ||
      value.startsWith("/home/")
    );
  }
  if (Array.isArray(value)) return value.some((nested) => containsForbiddenStringValue(nested, seen));
  if (!isRecord(value)) return false;
  if (seen.has(value)) return true;
  seen.add(value);
  return Object.values(value).some((nested) => containsForbiddenStringValue(nested, seen));
}

function containsProductionOutsideRejectedMarker(value: unknown, seen = new WeakSet<object>()): boolean {
  if (Array.isArray(value)) return value.some((nested) => containsProductionOutsideRejectedMarker(nested, seen));
  if (typeof value === "string") {
    return value.includes(POST_TRADE_STAGING_MIGRATION_REJECTED_PRODUCTION_REF) ||
      /^https?:\/\/.*(?:prod|production)/i.test(value);
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

function addReason(
  reasons: Set<PostTradeReadOnlyLivePreflightBlockingReason>,
  reason: PostTradeReadOnlyLivePreflightBlockingReason,
) {
  reasons.add(reason);
}

function addStructuredFingerprintMismatch(
  reasons: Set<PostTradeReadOnlyLivePreflightBlockingReason>,
  currentFingerprint: unknown,
  buildExpected: () => string,
) {
  try {
    if (currentFingerprint !== buildExpected()) {
      addReason(reasons, "malformed_evidence");
    }
  } catch {
    addReason(reasons, "unsupported_evidence_value");
  }
}

function buildEnvelopeFingerprintPreimage(evidence: Record<string, unknown>) {
  return {
    evidenceId: evidence.evidenceId,
    evidenceType: evidence.evidenceType,
    evidenceVersion: evidence.evidenceVersion,
    sourceIdentity: evidence.sourceIdentity,
    collectionSessionId: evidence.collectionSessionId,
    observedAtIso: evidence.observedAtIso,
    expiresAtIso: evidence.expiresAtIso,
    resultClassification: evidence.resultClassification,
    complete: evidence.complete,
    authoritative: evidence.authoritative,
    readOnly: evidence.readOnly,
  };
}

export function buildPostTradeReadOnlyLivePreflightWorktreeObservationFingerprint(worktree: {
  trackedModifiedFiles?: readonly string[];
  stagedFiles?: readonly string[];
  unstagedFiles?: readonly string[];
  untrackedFiles?: readonly string[];
  deletedFiles?: readonly string[];
  renamedFiles?: readonly string[];
  conflictedFiles?: readonly string[];
  symlinkPaths?: readonly string[];
  submoduleState?: unknown;
  currentBranch?: unknown;
  currentCommit?: unknown;
  repositoryRootIdentity?: unknown;
  deploymentUnitFiles?: readonly string[];
  unrelatedFilesPresentButExcluded?: readonly string[];
  scopeClassification?: unknown;
}) {
  return fingerprint({
    trackedModifiedFiles: worktree.trackedModifiedFiles ?? [],
    stagedFiles: worktree.stagedFiles ?? [],
    unstagedFiles: worktree.unstagedFiles ?? [],
    untrackedFiles: worktree.untrackedFiles ?? [],
    deletedFiles: worktree.deletedFiles ?? [],
    renamedFiles: worktree.renamedFiles ?? [],
    conflictedFiles: worktree.conflictedFiles ?? [],
    symlinkPaths: worktree.symlinkPaths ?? [],
    submoduleState: worktree.submoduleState,
    currentBranch: worktree.currentBranch,
    currentCommit: worktree.currentCommit,
    repositoryRootIdentity: worktree.repositoryRootIdentity,
    deploymentUnitFiles: worktree.deploymentUnitFiles ?? [],
    unrelatedFilesPresentButExcluded: worktree.unrelatedFilesPresentButExcluded ?? [],
    scopeClassification: worktree.scopeClassification,
  });
}

export function buildPostTradeReadOnlyLivePreflightInventoryObservationFingerprint(inventory: {
  allMigrationFilenames?: readonly string[];
  orderedMigrationTimestamps?: readonly string[];
  targetMigrationPresence?: unknown;
  duplicateTimestamps?: readonly string[];
  duplicateNames?: readonly string[];
  migrationsNewerThanTarget?: readonly string[];
  migrationsUnexpectedlyInsertedBeforeTarget?: readonly string[];
  migrationCountInProposedDeploymentUnit?: unknown;
  orderingClassification?: unknown;
}) {
  return fingerprint({
    allMigrationFilenames: inventory.allMigrationFilenames ?? [],
    orderedMigrationTimestamps: inventory.orderedMigrationTimestamps ?? [],
    targetMigrationPresence: inventory.targetMigrationPresence,
    duplicateTimestamps: inventory.duplicateTimestamps ?? [],
    duplicateNames: inventory.duplicateNames ?? [],
    migrationsNewerThanTarget: inventory.migrationsNewerThanTarget ?? [],
    migrationsUnexpectedlyInsertedBeforeTarget:
      inventory.migrationsUnexpectedlyInsertedBeforeTarget ?? [],
    migrationCountInProposedDeploymentUnit: inventory.migrationCountInProposedDeploymentUnit,
    orderingClassification: inventory.orderingClassification,
  });
}

export function buildPostTradeReadOnlyLivePreflightProjectObservationFingerprint(project: {
  observedProjectRef?: unknown;
  linkedProjectRef?: unknown;
  expectedStagingProjectRef?: unknown;
  rejectedProductionProjectRef?: unknown;
  environmentClassification?: unknown;
  linkState?: unknown;
  agreementClassification?: unknown;
  productionRejectionClassification?: unknown;
}) {
  return fingerprint(project);
}

export function buildPostTradeReadOnlyLivePreflightTargetProjectObservationFingerprint(project: {
  observedProjectRef?: unknown;
  expectedStagingProjectRef?: unknown;
  rejectedProductionProjectRef?: unknown;
  agreementClassification?: unknown;
}) {
  return fingerprint(project);
}

export function buildPostTradeReadOnlyLivePreflightHistoryObservationFingerprint(history: {
  observedProjectRef?: unknown;
  remoteAppliedMigrationIdentifiers?: readonly string[];
  targetMigrationAppliedStatus?: unknown;
  migrationDivergenceStatus?: unknown;
  remoteOnlyMigrationStatus?: unknown;
  localOnlyMigrationStatus?: unknown;
  orderingConsistency?: unknown;
  resultClassification?: unknown;
}) {
  return fingerprint({
    observedProjectRef: history.observedProjectRef,
    remoteAppliedMigrationIdentifiers: history.remoteAppliedMigrationIdentifiers ?? [],
    targetMigrationAppliedStatus: history.targetMigrationAppliedStatus,
    migrationDivergenceStatus: history.migrationDivergenceStatus,
    remoteOnlyMigrationStatus: history.remoteOnlyMigrationStatus,
    localOnlyMigrationStatus: history.localOnlyMigrationStatus,
    orderingConsistency: history.orderingConsistency,
    resultClassification: history.resultClassification,
  });
}

export function buildPostTradeReadOnlyLivePreflightCatalogObservationFingerprint(catalog: {
  observedProjectRef?: unknown;
  targetProjectIsStaging?: unknown;
  targetTableExists?: unknown;
  conflictingRelationKind?: unknown;
  targetIndexesExist?: unknown;
  targetPoliciesExist?: unknown;
  targetFunctionOrTriggerExists?: unknown;
  referencedExecutionRecordsTableExists?: unknown;
  referencedAuditEventsTableExists?: unknown;
  referencedPrimaryKeyColumnsExist?: unknown;
  referencedPrimaryKeyTypesMatchUuid?: unknown;
  referencedObjectsInPublicSchema?: unknown;
  uuidGenerationAvailable?: unknown;
  resultClassification?: unknown;
}) {
  return fingerprint({
    observedProjectRef: catalog.observedProjectRef,
    targetProjectIsStaging: catalog.targetProjectIsStaging,
    targetTableExists: catalog.targetTableExists,
    conflictingRelationKind: catalog.conflictingRelationKind,
    targetIndexesExist: catalog.targetIndexesExist,
    targetPoliciesExist: catalog.targetPoliciesExist,
    targetFunctionOrTriggerExists: catalog.targetFunctionOrTriggerExists,
    referencedExecutionRecordsTableExists: catalog.referencedExecutionRecordsTableExists,
    referencedAuditEventsTableExists: catalog.referencedAuditEventsTableExists,
    referencedPrimaryKeyColumnsExist: catalog.referencedPrimaryKeyColumnsExist,
    referencedPrimaryKeyTypesMatchUuid: catalog.referencedPrimaryKeyTypesMatchUuid,
    referencedObjectsInPublicSchema: catalog.referencedObjectsInPublicSchema,
    uuidGenerationAvailable: catalog.uuidGenerationAvailable,
    resultClassification: catalog.resultClassification,
  });
}

function validateEnvelope(
  evidence: unknown,
  expectedType: PostTradeReadOnlyLivePreflightEvidenceType,
  expectedSessionId: string,
  evaluatedAtIso: string,
  maxAgeMs: number,
  sessionStartedAt: Date | null,
  sessionCompletedAt: Date | null,
  reasons: Set<PostTradeReadOnlyLivePreflightBlockingReason>,
) {
  if (!isRecord(evidence)) {
    addReason(reasons, "malformed_evidence");
    return;
  }
  for (const key of ENVELOPE_KEYS) {
    if (!(key in evidence)) addReason(reasons, "evidence_incomplete");
    if (evidence[key] === null) addReason(reasons, "evidence_incomplete");
  }
  if (evidence.evidenceType !== expectedType) addReason(reasons, "malformed_evidence");
  if (evidence.collectionSessionId !== expectedSessionId) addReason(reasons, "mixed_collection_sessions");
  if (!isNonEmptyString(evidence.evidenceId)) addReason(reasons, "evidence_incomplete");
  if (!isNonEmptyString(evidence.evidenceVersion)) addReason(reasons, "evidence_incomplete");
  if (!(POST_TRADE_READ_ONLY_LIVE_PREFLIGHT_TRUSTED_SOURCES as readonly string[]).includes(String(evidence.sourceIdentity))) {
    addReason(reasons, "source_untrusted");
  }
  if (evidence.sourceIdentity !== EXPECTED_SOURCE_BY_EVIDENCE_TYPE[expectedType]) {
    addReason(reasons, "source_untrusted");
  }
  if ((POST_TRADE_READ_ONLY_LIVE_PREFLIGHT_REJECTED_SOURCES as readonly string[]).includes(String(evidence.sourceIdentity))) {
    addReason(reasons, "source_untrusted");
  }
  if (evidence.complete !== true) addReason(reasons, "evidence_incomplete");
  if (evidence.authoritative !== true) addReason(reasons, "evidence_not_authoritative");
  if (evidence.readOnly !== true) addReason(reasons, "evidence_not_read_only");
  if (!isFingerprint(evidence.evidenceFingerprint)) addReason(reasons, "malformed_evidence");
  if (
    isFingerprint(evidence.evidenceFingerprint) &&
    evidence.evidenceFingerprint !== fingerprint(buildEnvelopeFingerprintPreimage(evidence))
  ) {
    addReason(reasons, "malformed_evidence");
  }

  const observed = typeof evidence.observedAtIso === "string" ? parseIso(evidence.observedAtIso) : null;
  const expires = typeof evidence.expiresAtIso === "string" ? parseIso(evidence.expiresAtIso) : null;
  const evaluated = parseIso(evaluatedAtIso);
  if (!observed || !expires || !evaluated) {
    addReason(reasons, "malformed_evidence");
    return;
  }
  if (observed.getTime() > evaluated.getTime()) addReason(reasons, "future_dated_evidence");
  if (expires.getTime() < observed.getTime()) addReason(reasons, "malformed_evidence");
  if (expires.getTime() < evaluated.getTime()) addReason(reasons, "evidence_stale");
  if (expires.getTime() - observed.getTime() > maxAgeMs) addReason(reasons, "excessive_evidence_lifetime");
  if (sessionStartedAt && observed.getTime() < sessionStartedAt.getTime()) addReason(reasons, "mixed_collection_sessions");
  if (sessionCompletedAt && observed.getTime() > sessionCompletedAt.getTime()) addReason(reasons, "mixed_collection_sessions");
}

function classifyDecision(reasons: Set<PostTradeReadOnlyLivePreflightBlockingReason>) {
  if (reasons.has("migration_already_applied")) return "already_applied";
  if (reasons.has("ambiguous_result")) return "ambiguous";
  if (reasons.has("evidence_stale") || reasons.has("future_dated_evidence")) return "stale";
  if (reasons.has("malformed_evidence") || reasons.has("unsupported_evidence_value")) return "invalid";
  return reasons.size === 0 ? "ready_for_explicit_staging_deployment_action" : "blocked";
}

export function buildPostTradeReadOnlyLivePreflightEvidenceFingerprint(value: unknown) {
  return fingerprint(value);
}

export function buildPostTradeReadOnlyLivePreflightPlan(): PostTradeReadOnlyLivePreflightPlan {
  return {
    planStatus: "pure_future_runner_plan_only",
    containsExecutableCommands: false,
    containsSecrets: false,
    deploymentEnabled: false,
    remoteMutation: false,
    sqlExecuted: false,
    runnerMayCollectReadOnlyEvidenceLater: true,
    runnerMustNotDeployInSameAction: true,
    steps: [
      "load_and_validate_readiness_artifact",
      "create_single_collection_session",
      "collect_local_migration_content_evidence",
      "collect_local_migration_inventory_evidence",
      "collect_authoritative_worktree_evidence",
      "collect_authoritative_project_identity_evidence",
      "collect_remote_migration_history_evidence",
      "collect_remote_catalog_schema_evidence",
      "collect_remote_privilege_rls_baseline_evidence",
      "validate_all_evidence_envelopes",
      "confirm_one_collection_session",
      "evaluate_final_read_only_preflight_decision",
      "emit_sanitized_report",
      "stop_without_deployment",
    ],
    futureRunnerAllowedCategories: [
      "allowlisted_read_only_versioned_worktree_observations",
      "allowlisted_read_only_versioned_project_identity_observations",
      "allowlisted_read_only_versioned_migration_history_observations",
      "allowlisted_read_only_versioned_catalog_metadata_observations",
      "sanitized_structured_evidence_envelopes",
    ],
    futureRunnerForbiddenCategories: [
      "deployment",
      "database_mutation",
      "schema_mutation",
      "migration_repair",
      "migration_reset",
      "seed_data",
      "database_function_creation",
      "arbitrary_process_execution",
      "secret_capture",
      "readiness_artifact_consumption",
    ],
  };
}

function envelope(input: {
  id: string;
  type: PostTradeReadOnlyLivePreflightEvidenceType;
  source: PostTradeReadOnlyLivePreflightTrustedSource;
  sessionId: string;
  observedAtIso: string;
  expiresAtIso: string;
  classification: string;
}): PostTradeReadOnlyLivePreflightEvidenceEnvelope {
  const core = {
    evidenceId: input.id,
    evidenceType: input.type,
    evidenceVersion: `${input.type}_v1`,
    sourceIdentity: input.source,
    collectionSessionId: input.sessionId,
    observedAtIso: input.observedAtIso,
    expiresAtIso: input.expiresAtIso,
    resultClassification: input.classification,
    complete: true,
    authoritative: true,
    readOnly: true,
  };
  return {
    ...core,
    evidenceFingerprint: fingerprint(core),
  };
}

export function buildPostTradeReadOnlyLivePreflightCanonicalEvidence(input: {
  sessionId?: string;
  observedAtIso?: string;
  expiresAtIso?: string;
} = {}): PostTradeReadOnlyLivePreflightEvidenceSet {
  const collectionSessionId = input.sessionId ?? "post_trade_read_only_live_preflight_session_001";
  const observedAtIso = input.observedAtIso ?? "2026-07-12T12:00:00.000Z";
  const expiresAtIso = input.expiresAtIso ?? "2026-07-12T12:01:30.000Z";
  const session: PostTradeReadOnlyLivePreflightCollectionSession = {
    preflightSessionId: collectionSessionId,
    preflightContractVersion: POST_TRADE_READ_ONLY_LIVE_PREFLIGHT_CONTRACT_VERSION,
    collectorVersion: "post_trade_read_only_live_preflight_collector_v1",
    collectionStartedAtIso: observedAtIso,
    collectionCompletedAtIso: observedAtIso,
    hostClassification: "trusted_operator_workstation",
    repositoryIdentity: "ture_trade_repository",
    repositoryRootIdentity: "repo_root_identity_redacted",
    expectedBranchIdentity: null,
    expectedCommitIdentity: null,
    expectedWorktreeBaseline: "reviewed_deployment_unit_with_unrelated_changes_excluded",
    readinessArtifactId: POST_TRADE_STAGING_MIGRATION_DEPLOYMENT_READINESS_ARTIFACT_ID,
    readinessArtifactFingerprint:
      POST_TRADE_READ_ONLY_LIVE_PREFLIGHT_READINESS_ARTIFACT_FINGERPRINT,
    migrationFilename: POST_TRADE_STAGING_MIGRATION_FILENAME,
    migrationPath: POST_TRADE_STAGING_MIGRATION_PATH,
    expectedMigrationFingerprint: POST_TRADE_STAGING_MIGRATION_EXPECTED_FINGERPRINT,
    targetStagingProjectRef: POST_TRADE_STAGING_MIGRATION_PROJECT_REF,
    rejectedProductionProjectRef: POST_TRADE_STAGING_MIGRATION_REJECTED_PRODUCTION_REF,
  };

  return {
    collectionSession: session,
    readinessArtifact: {
      ...envelope({
        id: "readiness_artifact_evidence_001",
        type: "readiness_artifact",
        source: "trusted_readiness_artifact_validator_v1",
        sessionId: collectionSessionId,
        observedAtIso,
        expiresAtIso,
        classification: "canonical_readiness_artifact_valid_unused_unexpired",
      }),
      evidenceType: "readiness_artifact",
      artifactId: POST_TRADE_STAGING_MIGRATION_DEPLOYMENT_READINESS_ARTIFACT_ID,
      artifactVersion: POST_TRADE_STAGING_MIGRATION_DEPLOYMENT_READINESS_ARTIFACT_VERSION,
      artifactFingerprint:
        POST_TRADE_READ_ONLY_LIVE_PREFLIGHT_READINESS_ARTIFACT_FINGERPRINT,
      artifactState: "unused",
      reviewDecision: POST_TRADE_READ_ONLY_LIVE_PREFLIGHT_REVIEW_READY_DECISION,
      reviewResult: POST_TRADE_READ_ONLY_LIVE_PREFLIGHT_REVIEW_RESULT,
    },
    localMigrationContent: {
      ...envelope({
        id: "local_migration_content_evidence_001",
        type: "local_migration_content",
        source: "trusted_local_migration_reader_v1",
        sessionId: collectionSessionId,
        observedAtIso,
        expiresAtIso,
        classification: "exact_reviewed_migration_content",
      }),
      evidenceType: "local_migration_content",
      migrationPath: POST_TRADE_STAGING_MIGRATION_PATH,
      migrationFilename: POST_TRADE_STAGING_MIGRATION_FILENAME,
      fileByteLength: POST_TRADE_STAGING_MIGRATION_EXPECTED_NORMALIZED_LENGTH,
      normalizedSqlByteLength: POST_TRADE_STAGING_MIGRATION_EXPECTED_NORMALIZED_LENGTH,
      sha256: POST_TRADE_STAGING_MIGRATION_EXPECTED_FINGERPRINT,
      normalizationContractVersion: "post_trade_staging_migration_sql_normalization_v1",
      statementInventory: POST_TRADE_STAGING_MIGRATION_EXPECTED_STATEMENT_INVENTORY,
      fileTypeClassification: "sql_migration",
      symlinkStatus: "not_symlink",
      regularFileStatus: "regular_file",
      duplicatePathStatus: "unique_path",
    },
    worktree: {
      ...envelope({
        id: "worktree_evidence_001",
        type: "git_worktree",
        source: "trusted_git_status_runner_v1",
        sessionId: collectionSessionId,
        observedAtIso,
        expiresAtIso,
        classification: "exact_reviewed_deployment_scope",
      }),
      evidenceType: "git_worktree",
      trackedModifiedFiles: [],
      stagedFiles: [],
      unstagedFiles: [],
      untrackedFiles: [],
      deletedFiles: [],
      renamedFiles: [],
      conflictedFiles: [],
      symlinkPaths: [],
      submoduleState: "none",
      currentBranch: "reviewed_branch_redacted",
      currentCommit: "reviewed_commit_redacted",
      repositoryRootIdentity: "repo_root_identity_redacted",
      deploymentUnitFiles: [POST_TRADE_STAGING_MIGRATION_PATH],
      unrelatedFilesPresentButExcluded: [],
      normalizedWorktreeFingerprint: buildPostTradeReadOnlyLivePreflightWorktreeObservationFingerprint({
        trackedModifiedFiles: [],
        stagedFiles: [],
        unstagedFiles: [],
        untrackedFiles: [],
        deletedFiles: [],
        renamedFiles: [],
        conflictedFiles: [],
        symlinkPaths: [],
        submoduleState: "none",
        currentBranch: "reviewed_branch_redacted",
        currentCommit: "reviewed_commit_redacted",
        repositoryRootIdentity: "repo_root_identity_redacted",
        deploymentUnitFiles: [POST_TRADE_STAGING_MIGRATION_PATH],
        unrelatedFilesPresentButExcluded: [],
        scopeClassification: "exact_reviewed_deployment_scope",
      }),
      scopeClassification: "exact_reviewed_deployment_scope",
    },
    localMigrationInventory: {
      ...envelope({
        id: "local_migration_inventory_evidence_001",
        type: "local_migration_inventory",
        source: "trusted_local_migration_inventory_reader_v1",
        sessionId: collectionSessionId,
        observedAtIso,
        expiresAtIso,
        classification: "target_exists_once_only_deployment_unit",
      }),
      evidenceType: "local_migration_inventory",
      allMigrationFilenames: [POST_TRADE_STAGING_MIGRATION_FILENAME],
      orderedMigrationTimestamps: [POST_TRADE_STAGING_MIGRATION_TIMESTAMP_PREFIX],
      targetMigrationPresence: "exactly_once",
      duplicateTimestamps: [],
      duplicateNames: [],
      migrationsNewerThanTarget: [],
      migrationsUnexpectedlyInsertedBeforeTarget: [],
      migrationCountInProposedDeploymentUnit: 1,
      normalizedInventoryFingerprint: buildPostTradeReadOnlyLivePreflightInventoryObservationFingerprint({
        allMigrationFilenames: [POST_TRADE_STAGING_MIGRATION_FILENAME],
        orderedMigrationTimestamps: [POST_TRADE_STAGING_MIGRATION_TIMESTAMP_PREFIX],
        targetMigrationPresence: "exactly_once",
        duplicateTimestamps: [],
        duplicateNames: [],
        migrationsNewerThanTarget: [],
        migrationsUnexpectedlyInsertedBeforeTarget: [],
        migrationCountInProposedDeploymentUnit: 1,
        orderingClassification: "valid",
      }),
      orderingClassification: "valid",
    },
    projectLink: {
      ...envelope({
        id: "project_link_evidence_001",
        type: "supabase_project_link",
        source: "trusted_supabase_project_status_runner_v1",
        sessionId: collectionSessionId,
        observedAtIso,
        expiresAtIso,
        classification: "exact_staging_match",
      }),
      evidenceType: "supabase_project_link",
      observedProjectRef: POST_TRADE_STAGING_MIGRATION_PROJECT_REF,
      linkedProjectRef: POST_TRADE_STAGING_MIGRATION_PROJECT_REF,
      expectedStagingProjectRef: POST_TRADE_STAGING_MIGRATION_PROJECT_REF,
      rejectedProductionProjectRef: POST_TRADE_STAGING_MIGRATION_REJECTED_PRODUCTION_REF,
      environmentClassification: "staging",
      linkState: "linked",
      agreementClassification: "exact_staging_match",
      productionRejectionClassification: "production_rejected",
      rawOutputFingerprint: "c".repeat(64),
      sanitizedEvidenceFingerprint: buildPostTradeReadOnlyLivePreflightProjectObservationFingerprint({
        observedProjectRef: POST_TRADE_STAGING_MIGRATION_PROJECT_REF,
        linkedProjectRef: POST_TRADE_STAGING_MIGRATION_PROJECT_REF,
        expectedStagingProjectRef: POST_TRADE_STAGING_MIGRATION_PROJECT_REF,
        rejectedProductionProjectRef: POST_TRADE_STAGING_MIGRATION_REJECTED_PRODUCTION_REF,
        environmentClassification: "staging",
        linkState: "linked",
        agreementClassification: "exact_staging_match",
        productionRejectionClassification: "production_rejected",
      }),
    },
    targetProject: {
      ...envelope({
        id: "target_project_evidence_001",
        type: "supabase_target_project",
        source: "trusted_supabase_project_status_runner_v1",
        sessionId: collectionSessionId,
        observedAtIso,
        expiresAtIso,
        classification: "exact_staging_match",
      }),
      evidenceType: "supabase_target_project",
      observedProjectRef: POST_TRADE_STAGING_MIGRATION_PROJECT_REF,
      expectedStagingProjectRef: POST_TRADE_STAGING_MIGRATION_PROJECT_REF,
      rejectedProductionProjectRef: POST_TRADE_STAGING_MIGRATION_REJECTED_PRODUCTION_REF,
      agreementClassification: "exact_staging_match",
      rawOutputFingerprint: "e".repeat(64),
      sanitizedEvidenceFingerprint: buildPostTradeReadOnlyLivePreflightTargetProjectObservationFingerprint({
        observedProjectRef: POST_TRADE_STAGING_MIGRATION_PROJECT_REF,
        expectedStagingProjectRef: POST_TRADE_STAGING_MIGRATION_PROJECT_REF,
        rejectedProductionProjectRef: POST_TRADE_STAGING_MIGRATION_REJECTED_PRODUCTION_REF,
        agreementClassification: "exact_staging_match",
      }),
    },
    remoteMigrationHistory: {
      ...envelope({
        id: "remote_migration_history_evidence_001",
        type: "remote_migration_history",
        source: "trusted_supabase_migration_list_runner_v1",
        sessionId: collectionSessionId,
        observedAtIso,
        expiresAtIso,
        classification: "target_migration_unapplied_and_eligible",
      }),
      evidenceType: "remote_migration_history",
      observedProjectRef: POST_TRADE_STAGING_MIGRATION_PROJECT_REF,
      remoteAppliedMigrationIdentifiers: [],
      targetMigrationAppliedStatus: "unapplied",
      migrationDivergenceStatus: "consistent",
      remoteOnlyMigrationStatus: "none",
      localOnlyMigrationStatus: "target_only",
      orderingConsistency: "consistent",
      historyFingerprint: buildPostTradeReadOnlyLivePreflightHistoryObservationFingerprint({
        observedProjectRef: POST_TRADE_STAGING_MIGRATION_PROJECT_REF,
        remoteAppliedMigrationIdentifiers: [],
        targetMigrationAppliedStatus: "unapplied",
        migrationDivergenceStatus: "consistent",
        remoteOnlyMigrationStatus: "none",
        localOnlyMigrationStatus: "target_only",
        orderingConsistency: "consistent",
        resultClassification: "target_migration_unapplied_and_eligible",
      }),
      resultClassification: "target_migration_unapplied_and_eligible",
    },
    remoteCatalog: {
      ...envelope({
        id: "remote_catalog_evidence_001",
        type: "remote_catalog_schema",
        source: "trusted_supabase_catalog_reader_v1",
        sessionId: collectionSessionId,
        observedAtIso,
        expiresAtIso,
        classification: "expected_clean_pre_deployment_state",
      }),
      evidenceType: "remote_catalog_schema",
      observedProjectRef: POST_TRADE_STAGING_MIGRATION_PROJECT_REF,
      targetProjectIsStaging: true,
      targetTableExists: false,
      conflictingRelationKind: "none",
      targetIndexesExist: false,
      targetPoliciesExist: false,
      targetFunctionOrTriggerExists: false,
      referencedExecutionRecordsTableExists: true,
      referencedAuditEventsTableExists: true,
      referencedPrimaryKeyColumnsExist: true,
      referencedPrimaryKeyTypesMatchUuid: true,
      referencedObjectsInPublicSchema: true,
      uuidGenerationAvailable: true,
      catalogEvidenceFingerprint: buildPostTradeReadOnlyLivePreflightCatalogObservationFingerprint({
        observedProjectRef: POST_TRADE_STAGING_MIGRATION_PROJECT_REF,
        targetProjectIsStaging: true,
        targetTableExists: false,
        conflictingRelationKind: "none",
        targetIndexesExist: false,
        targetPoliciesExist: false,
        targetFunctionOrTriggerExists: false,
        referencedExecutionRecordsTableExists: true,
        referencedAuditEventsTableExists: true,
        referencedPrimaryKeyColumnsExist: true,
        referencedPrimaryKeyTypesMatchUuid: true,
        referencedObjectsInPublicSchema: true,
        uuidGenerationAvailable: true,
        resultClassification: "expected_clean_pre_deployment_state",
      }),
      resultClassification: "expected_clean_pre_deployment_state",
    },
    remotePrivilegeBaseline: {
      ...envelope({
        id: "remote_privilege_evidence_001",
        type: "remote_privilege_rls_baseline",
        source: "trusted_supabase_privilege_reader_v1",
        sessionId: collectionSessionId,
        observedAtIso,
        expiresAtIso,
        classification: "compatible_pre_deployment_security_baseline",
      }),
      evidenceType: "remote_privilege_rls_baseline",
      anonGrantsClassification: "compatible",
      authenticatedGrantsClassification: "compatible",
      schemaUsageContext: "compatible",
      defaultPrivilegeObservations: "compatible",
      expectedOwnershipContext: "compatible",
      serviceRoleConsideration: "service_role_bypass_operational_risk_remains",
      rlsCapabilityAvailability: "available",
      resultClassification: "compatible_pre_deployment_security_baseline",
    },
  };
}

export function evaluatePostTradeReadOnlyLiveStagingMigrationPreflight(
  evidence: unknown,
  evaluatedAtIso = "2026-07-12T12:00:30.000Z",
): PostTradeReadOnlyLivePreflightDecision {
  const reasons = new Set<PostTradeReadOnlyLivePreflightBlockingReason>();

  if (!isRecord(evidence)) {
    addReason(reasons, "malformed_evidence");
    return decision(reasons, null, null);
  }
  if (!hasExactKeys(evidence, EVIDENCE_SET_KEYS)) addReason(reasons, "malformed_evidence");
  if (containsUnsupportedNestedValue(evidence)) addReason(reasons, "unsupported_evidence_value");
  if (containsForbiddenObjectKey(evidence)) addReason(reasons, "secret_material_detected");
  if (containsForbiddenStringValue(evidence)) addReason(reasons, "secret_material_detected");
  if (containsProductionOutsideRejectedMarker(evidence)) addReason(reasons, "production_project_detected");

  const session = evidence.collectionSession;
  if (!isRecord(session) || !hasExactKeys(session, SESSION_KEYS)) {
    addReason(reasons, "malformed_evidence");
    return decision(reasons, null, null);
  }
  const sessionId = String(session.preflightSessionId);
  const sessionStartedAt =
    typeof session.collectionStartedAtIso === "string" ? parseIso(session.collectionStartedAtIso) : null;
  const sessionCompletedAt =
    typeof session.collectionCompletedAtIso === "string" ? parseIso(session.collectionCompletedAtIso) : null;
  const evaluatedAt = parseIso(evaluatedAtIso);
  if (!isNonEmptyString(session.preflightSessionId)) addReason(reasons, "malformed_evidence");
  if (session.collectorVersion !== "post_trade_read_only_live_preflight_collector_v1") {
    addReason(reasons, "malformed_evidence");
  }
  if (!sessionStartedAt || !sessionCompletedAt || !evaluatedAt) {
    addReason(reasons, "malformed_evidence");
  } else {
    if (sessionCompletedAt.getTime() < sessionStartedAt.getTime()) {
      addReason(reasons, "malformed_evidence");
    }
    if (sessionStartedAt.getTime() > evaluatedAt.getTime()) {
      addReason(reasons, "future_dated_evidence");
    }
    if (evaluatedAt.getTime() - sessionCompletedAt.getTime() > POST_TRADE_READ_ONLY_LIVE_PREFLIGHT_FRESHNESS_MS.collectionSession) {
      addReason(reasons, "evidence_stale");
    }
    if (sessionCompletedAt.getTime() - sessionStartedAt.getTime() > POST_TRADE_READ_ONLY_LIVE_PREFLIGHT_FRESHNESS_MS.collectionSession) {
      addReason(reasons, "excessive_evidence_lifetime");
    }
  }
  if (!isNonEmptyString(session.repositoryRootIdentity) || session.repositoryRootIdentity.startsWith("/")) {
    addReason(reasons, "malformed_evidence");
  }
  if (session.preflightContractVersion !== POST_TRADE_READ_ONLY_LIVE_PREFLIGHT_CONTRACT_VERSION) {
    addReason(reasons, "malformed_evidence");
  }
  if (session.readinessArtifactId !== POST_TRADE_STAGING_MIGRATION_DEPLOYMENT_READINESS_ARTIFACT_ID) {
    addReason(reasons, "readiness_artifact_invalid");
  }
  if (session.readinessArtifactFingerprint !== POST_TRADE_READ_ONLY_LIVE_PREFLIGHT_READINESS_ARTIFACT_FINGERPRINT) {
    addReason(reasons, "artifact_fingerprint_mismatch");
  }
  if (session.migrationPath !== POST_TRADE_STAGING_MIGRATION_PATH || session.migrationFilename !== POST_TRADE_STAGING_MIGRATION_FILENAME) {
    addReason(reasons, "reviewed_migration_missing");
  }
  if (session.expectedMigrationFingerprint !== POST_TRADE_STAGING_MIGRATION_EXPECTED_FINGERPRINT) {
    addReason(reasons, "migration_fingerprint_mismatch");
  }
  if (session.targetStagingProjectRef !== POST_TRADE_STAGING_MIGRATION_PROJECT_REF) {
    addReason(reasons, "project_not_staging");
  }
  if (session.rejectedProductionProjectRef !== POST_TRADE_STAGING_MIGRATION_REJECTED_PRODUCTION_REF) {
    addReason(reasons, "production_project_detected");
  }

  validateEnvelope(evidence.readinessArtifact, "readiness_artifact", sessionId, evaluatedAtIso, POST_TRADE_READ_ONLY_LIVE_PREFLIGHT_FRESHNESS_MS.readinessArtifact, sessionStartedAt, sessionCompletedAt, reasons);
  validateEnvelope(evidence.localMigrationContent, "local_migration_content", sessionId, evaluatedAtIso, POST_TRADE_READ_ONLY_LIVE_PREFLIGHT_FRESHNESS_MS.localMigrationContent, sessionStartedAt, sessionCompletedAt, reasons);
  validateEnvelope(evidence.worktree, "git_worktree", sessionId, evaluatedAtIso, POST_TRADE_READ_ONLY_LIVE_PREFLIGHT_FRESHNESS_MS.worktree, sessionStartedAt, sessionCompletedAt, reasons);
  validateEnvelope(evidence.localMigrationInventory, "local_migration_inventory", sessionId, evaluatedAtIso, POST_TRADE_READ_ONLY_LIVE_PREFLIGHT_FRESHNESS_MS.localMigrationInventory, sessionStartedAt, sessionCompletedAt, reasons);
  validateEnvelope(evidence.projectLink, "supabase_project_link", sessionId, evaluatedAtIso, POST_TRADE_READ_ONLY_LIVE_PREFLIGHT_FRESHNESS_MS.projectIdentity, sessionStartedAt, sessionCompletedAt, reasons);
  validateEnvelope(evidence.targetProject, "supabase_target_project", sessionId, evaluatedAtIso, POST_TRADE_READ_ONLY_LIVE_PREFLIGHT_FRESHNESS_MS.projectIdentity, sessionStartedAt, sessionCompletedAt, reasons);
  validateEnvelope(evidence.remoteMigrationHistory, "remote_migration_history", sessionId, evaluatedAtIso, POST_TRADE_READ_ONLY_LIVE_PREFLIGHT_FRESHNESS_MS.remoteMigrationHistory, sessionStartedAt, sessionCompletedAt, reasons);
  validateEnvelope(evidence.remoteCatalog, "remote_catalog_schema", sessionId, evaluatedAtIso, POST_TRADE_READ_ONLY_LIVE_PREFLIGHT_FRESHNESS_MS.remoteCatalog, sessionStartedAt, sessionCompletedAt, reasons);
  validateEnvelope(evidence.remotePrivilegeBaseline, "remote_privilege_rls_baseline", sessionId, evaluatedAtIso, POST_TRADE_READ_ONLY_LIVE_PREFLIGHT_FRESHNESS_MS.remotePrivilegeBaseline, sessionStartedAt, sessionCompletedAt, reasons);

  const exactEvidenceShapes: readonly [unknown, readonly string[]][] = [
    [evidence.readinessArtifact, READINESS_ARTIFACT_KEYS],
    [evidence.localMigrationContent, LOCAL_MIGRATION_CONTENT_KEYS],
    [evidence.worktree, WORKTREE_KEYS],
    [evidence.localMigrationInventory, LOCAL_MIGRATION_INVENTORY_KEYS],
    [evidence.projectLink, PROJECT_LINK_KEYS],
    [evidence.targetProject, TARGET_PROJECT_KEYS],
    [evidence.remoteMigrationHistory, REMOTE_MIGRATION_HISTORY_KEYS],
    [evidence.remoteCatalog, REMOTE_CATALOG_KEYS],
    [evidence.remotePrivilegeBaseline, REMOTE_PRIVILEGE_BASELINE_KEYS],
  ];
  for (const [candidate, expectedKeys] of exactEvidenceShapes) {
    if (!isRecord(candidate) || !hasExactKeys(candidate, expectedKeys)) {
      addReason(reasons, "malformed_evidence");
    }
  }

  const readiness = (isRecord(evidence.readinessArtifact) ? evidence.readinessArtifact : {}) as Partial<PostTradeReadOnlyLivePreflightEvidenceSet["readinessArtifact"]>;
  if (!isRecord(evidence.readinessArtifact)) addReason(reasons, "readiness_artifact_missing");
  if (readiness.artifactState === "invalid") addReason(reasons, "readiness_artifact_invalid");
  if (readiness.artifactState === "expired") addReason(reasons, "readiness_artifact_expired");
  if (readiness.artifactState === "consumed") addReason(reasons, "readiness_artifact_consumed");
  if (readiness.artifactFingerprint !== POST_TRADE_READ_ONLY_LIVE_PREFLIGHT_READINESS_ARTIFACT_FINGERPRINT) {
    addReason(reasons, "artifact_fingerprint_mismatch");
  }

  const migration = (isRecord(evidence.localMigrationContent) ? evidence.localMigrationContent : {}) as Partial<PostTradeReadOnlyLivePreflightEvidenceSet["localMigrationContent"]>;
  if (migration.migrationPath !== POST_TRADE_STAGING_MIGRATION_PATH || migration.migrationFilename !== POST_TRADE_STAGING_MIGRATION_FILENAME) {
    addReason(reasons, "reviewed_migration_missing");
  }
  if (typeof migration.migrationPath !== "string" || hasUnsafePath(migration.migrationPath)) {
    addReason(reasons, "unsafe_path");
  }
  if (migration.sha256 !== POST_TRADE_STAGING_MIGRATION_EXPECTED_FINGERPRINT) addReason(reasons, "migration_fingerprint_mismatch");
  if (
    migration.fileByteLength !== POST_TRADE_STAGING_MIGRATION_EXPECTED_NORMALIZED_LENGTH ||
    migration.normalizedSqlByteLength !== POST_TRADE_STAGING_MIGRATION_EXPECTED_NORMALIZED_LENGTH ||
    migration.normalizationContractVersion !== "post_trade_staging_migration_sql_normalization_v1" ||
    JSON.stringify(migration.statementInventory) !== JSON.stringify(POST_TRADE_STAGING_MIGRATION_EXPECTED_STATEMENT_INVENTORY)
  ) {
    addReason(reasons, "migration_content_mismatch");
  }
  if (migration.symlinkStatus !== "not_symlink" || migration.regularFileStatus !== "regular_file" || migration.duplicatePathStatus !== "unique_path") {
    addReason(reasons, "unsafe_path");
  }

  const worktree = (isRecord(evidence.worktree) ? evidence.worktree : {}) as Partial<PostTradeReadOnlyLivePreflightEvidenceSet["worktree"]>;
  const deploymentUnitFiles = Array.isArray(worktree.deploymentUnitFiles) ? worktree.deploymentUnitFiles : [];
  if (
    deploymentUnitFiles.length !== 1 ||
    deploymentUnitFiles[0] !== POST_TRADE_STAGING_MIGRATION_PATH
  ) {
    addReason(reasons, "worktree_scope_mismatch");
  }
  const worktreePaths = [
    ...deploymentUnitFiles,
    ...(Array.isArray(worktree.trackedModifiedFiles) ? worktree.trackedModifiedFiles : []),
    ...(Array.isArray(worktree.stagedFiles) ? worktree.stagedFiles : []),
    ...(Array.isArray(worktree.unstagedFiles) ? worktree.unstagedFiles : []),
    ...(Array.isArray(worktree.untrackedFiles) ? worktree.untrackedFiles : []),
    ...(Array.isArray(worktree.deletedFiles) ? worktree.deletedFiles : []),
    ...(Array.isArray(worktree.renamedFiles) ? worktree.renamedFiles : []),
    ...(Array.isArray(worktree.symlinkPaths) ? worktree.symlinkPaths : []),
  ].filter((path): path is string => typeof path === "string");
  if (worktreePaths.some(hasUnsafePath)) addReason(reasons, "unsafe_path");
  if (new Set(worktreePaths).size !== worktreePaths.length) addReason(reasons, "worktree_scope_mismatch");
  if ((worktree.conflictedFiles?.length ?? 0) > 0) addReason(reasons, "worktree_scope_mismatch");
  if ((worktree.deletedFiles ?? []).includes(POST_TRADE_STAGING_MIGRATION_PATH)) addReason(reasons, "reviewed_migration_missing");
  if ((worktree.renamedFiles ?? []).some((path) => path.includes(POST_TRADE_STAGING_MIGRATION_TIMESTAMP_PREFIX))) addReason(reasons, "worktree_scope_mismatch");
  if ((worktree.symlinkPaths?.length ?? 0) > 0 || worktree.submoduleState === "ambiguous") addReason(reasons, "ambiguous_result");
  addStructuredFingerprintMismatch(
    reasons,
    worktree.normalizedWorktreeFingerprint,
    () => buildPostTradeReadOnlyLivePreflightWorktreeObservationFingerprint(worktree),
  );
  if (deploymentUnitFiles.some((path) => (POST_TRADE_READ_ONLY_LIVE_PREFLIGHT_UNRELATED_DEPLOYMENT_DENYLIST as readonly string[]).includes(path))) {
    addReason(reasons, "worktree_scope_mismatch");
  }
  if (worktree.scopeClassification !== "exact_reviewed_deployment_scope" && worktree.scopeClassification !== "unrelated_changes_present_but_excluded") {
    addReason(reasons, worktree.scopeClassification === "ambiguous_evidence" ? "ambiguous_result" : "worktree_scope_mismatch");
  }

  const inventory = (isRecord(evidence.localMigrationInventory) ? evidence.localMigrationInventory : {}) as Partial<PostTradeReadOnlyLivePreflightEvidenceSet["localMigrationInventory"]>;
  if (inventory.targetMigrationPresence !== "exactly_once") addReason(reasons, "reviewed_migration_missing");
  if ((inventory.duplicateTimestamps?.length ?? 0) > 0 || (inventory.duplicateNames?.length ?? 0) > 0) addReason(reasons, "extra_migration_included");
  if (inventory.migrationCountInProposedDeploymentUnit !== 1) addReason(reasons, "extra_migration_included");
  if ((inventory.migrationsNewerThanTarget?.length ?? 0) > 0 || (inventory.migrationsUnexpectedlyInsertedBeforeTarget?.length ?? 0) > 0) {
    addReason(reasons, "extra_migration_included");
  }
  if (
    !Array.isArray(inventory.allMigrationFilenames) ||
    inventory.allMigrationFilenames.filter((filename) => filename === POST_TRADE_STAGING_MIGRATION_FILENAME).length !== 1
  ) {
    addReason(reasons, "reviewed_migration_missing");
  }
  if (
    !Array.isArray(inventory.orderedMigrationTimestamps) ||
    inventory.orderedMigrationTimestamps.filter((timestamp) => timestamp === POST_TRADE_STAGING_MIGRATION_TIMESTAMP_PREFIX).length !== 1
  ) {
    addReason(reasons, "extra_migration_included");
  }
  addStructuredFingerprintMismatch(
    reasons,
    inventory.normalizedInventoryFingerprint,
    () => buildPostTradeReadOnlyLivePreflightInventoryObservationFingerprint(inventory),
  );
  if (inventory.orderingClassification !== "valid") addReason(reasons, inventory.orderingClassification === "ambiguous" ? "ambiguous_result" : "extra_migration_included");

  const projectLink = (isRecord(evidence.projectLink) ? evidence.projectLink : {}) as Partial<PostTradeReadOnlyLivePreflightEvidenceSet["projectLink"]> & { sourceIdentity?: string };
  const targetProject = (isRecord(evidence.targetProject) ? evidence.targetProject : {}) as Partial<PostTradeReadOnlyLivePreflightEvidenceSet["targetProject"]>;
  const projectLinkSourceIdentity = String(projectLink.sourceIdentity ?? "");
  if (projectLinkSourceIdentity === "environment_only") addReason(reasons, "source_untrusted");
  if (!isFingerprint(projectLink.rawOutputFingerprint) || !isFingerprint(projectLink.sanitizedEvidenceFingerprint)) {
    addReason(reasons, "malformed_evidence");
  }
  if (!isProjectRef(projectLink.observedProjectRef) || !isProjectRef(projectLink.linkedProjectRef)) {
    addReason(reasons, "malformed_evidence");
  }
  addStructuredFingerprintMismatch(
    reasons,
    projectLink.sanitizedEvidenceFingerprint,
    () => buildPostTradeReadOnlyLivePreflightProjectObservationFingerprint({
      observedProjectRef: projectLink.observedProjectRef,
      linkedProjectRef: projectLink.linkedProjectRef,
      expectedStagingProjectRef: projectLink.expectedStagingProjectRef,
      rejectedProductionProjectRef: projectLink.rejectedProductionProjectRef,
      environmentClassification: projectLink.environmentClassification,
      linkState: projectLink.linkState,
      agreementClassification: projectLink.agreementClassification,
      productionRejectionClassification: projectLink.productionRejectionClassification,
    }),
  );
  if (projectLink.agreementClassification !== "exact_staging_match" || projectLink.linkState !== "linked") {
    addReason(reasons, projectLink.agreementClassification === "ambiguous_project" ? "ambiguous_result" : "project_not_staging");
  }
  if (projectLink.observedProjectRef !== POST_TRADE_STAGING_MIGRATION_PROJECT_REF || projectLink.linkedProjectRef !== POST_TRADE_STAGING_MIGRATION_PROJECT_REF) {
    addReason(reasons, projectLink.observedProjectRef === POST_TRADE_STAGING_MIGRATION_REJECTED_PRODUCTION_REF ? "production_project_detected" : "project_not_staging");
  }
  if (targetProject.agreementClassification !== "exact_staging_match" || targetProject.observedProjectRef !== POST_TRADE_STAGING_MIGRATION_PROJECT_REF) {
    addReason(reasons, targetProject.observedProjectRef === POST_TRADE_STAGING_MIGRATION_REJECTED_PRODUCTION_REF ? "production_project_detected" : "project_not_staging");
  }
  if (!isFingerprint(targetProject.rawOutputFingerprint) || !isFingerprint(targetProject.sanitizedEvidenceFingerprint)) {
    addReason(reasons, "malformed_evidence");
  }
  if (!isProjectRef(targetProject.observedProjectRef)) {
    addReason(reasons, "malformed_evidence");
  }
  addStructuredFingerprintMismatch(
    reasons,
    targetProject.sanitizedEvidenceFingerprint,
    () => buildPostTradeReadOnlyLivePreflightTargetProjectObservationFingerprint({
      observedProjectRef: targetProject.observedProjectRef,
      expectedStagingProjectRef: targetProject.expectedStagingProjectRef,
      rejectedProductionProjectRef: targetProject.rejectedProductionProjectRef,
      agreementClassification: targetProject.agreementClassification,
    }),
  );
  if (projectLink.observedProjectRef !== targetProject.observedProjectRef) addReason(reasons, "project_evidence_conflicting");

  const history = (isRecord(evidence.remoteMigrationHistory) ? evidence.remoteMigrationHistory : {}) as Partial<PostTradeReadOnlyLivePreflightEvidenceSet["remoteMigrationHistory"]>;
  if (history.targetMigrationAppliedStatus === "already_applied" || history.resultClassification === "target_already_applied") addReason(reasons, "migration_already_applied");
  if (history.migrationDivergenceStatus === "diverged" || history.resultClassification === "remote_history_diverged") addReason(reasons, "remote_migration_history_divergence");
  if (history.remoteOnlyMigrationStatus === "unexpected_remote_migration" || history.resultClassification === "unexpected_remote_migration") addReason(reasons, "unexpected_remote_migration");
  if (history.orderingConsistency === "missing_prerequisite" || history.resultClassification === "missing_prerequisite_migration") addReason(reasons, "missing_prerequisite_migration");
  if (history.resultClassification === "ambiguous_history" || history.orderingConsistency === "ambiguous") addReason(reasons, "ambiguous_result");
  if (history.resultClassification !== "target_migration_unapplied_and_eligible") {
    addReason(reasons, history.resultClassification === "target_already_applied" ? "migration_already_applied" : "remote_migration_history_divergence");
  }
  if (!isFingerprint(history.historyFingerprint)) addReason(reasons, "malformed_evidence");
  if (history.observedProjectRef !== POST_TRADE_STAGING_MIGRATION_PROJECT_REF) addReason(reasons, "project_not_staging");
  addStructuredFingerprintMismatch(
    reasons,
    history.historyFingerprint,
    () => buildPostTradeReadOnlyLivePreflightHistoryObservationFingerprint(history),
  );

  const catalog = (isRecord(evidence.remoteCatalog) ? evidence.remoteCatalog : {}) as Partial<PostTradeReadOnlyLivePreflightEvidenceSet["remoteCatalog"]>;
  if (catalog.targetProjectIsStaging !== true || catalog.observedProjectRef !== POST_TRADE_STAGING_MIGRATION_PROJECT_REF) addReason(reasons, "project_not_staging");
  if (catalog.targetTableExists) addReason(reasons, "target_relation_already_exists");
  if (catalog.conflictingRelationKind && catalog.conflictingRelationKind !== "none") addReason(reasons, "conflicting_remote_object");
  if (catalog.targetIndexesExist || catalog.targetPoliciesExist || catalog.targetFunctionOrTriggerExists) addReason(reasons, "conflicting_remote_object");
  if (!catalog.referencedExecutionRecordsTableExists || !catalog.referencedAuditEventsTableExists || !catalog.referencedObjectsInPublicSchema || !catalog.uuidGenerationAvailable) {
    addReason(reasons, "referenced_dependency_missing");
  }
  if (!catalog.referencedPrimaryKeyColumnsExist) addReason(reasons, "referenced_dependency_missing");
  if (!catalog.referencedPrimaryKeyTypesMatchUuid) addReason(reasons, "foreign_key_type_mismatch");
  if (catalog.resultClassification === "ambiguous_catalog") addReason(reasons, "ambiguous_result");
  if (catalog.resultClassification !== "expected_clean_pre_deployment_state") {
    addReason(reasons, catalog.resultClassification === "table_already_exists" ? "target_relation_already_exists" : "conflicting_remote_object");
  }
  if (!isFingerprint(catalog.catalogEvidenceFingerprint)) addReason(reasons, "malformed_evidence");
  addStructuredFingerprintMismatch(
    reasons,
    catalog.catalogEvidenceFingerprint,
    () => buildPostTradeReadOnlyLivePreflightCatalogObservationFingerprint(catalog),
  );

  const privilege = (isRecord(evidence.remotePrivilegeBaseline) ? evidence.remotePrivilegeBaseline : {}) as Partial<PostTradeReadOnlyLivePreflightEvidenceSet["remotePrivilegeBaseline"]>;
  if (
    privilege.anonGrantsClassification !== "compatible" ||
    privilege.authenticatedGrantsClassification !== "compatible" ||
    privilege.schemaUsageContext !== "compatible" ||
    privilege.defaultPrivilegeObservations !== "compatible" ||
    privilege.expectedOwnershipContext !== "compatible" ||
    privilege.rlsCapabilityAvailability !== "available" ||
    privilege.resultClassification !== "compatible_pre_deployment_security_baseline"
  ) {
    addReason(reasons, privilege.resultClassification === "ambiguous" ? "ambiguous_result" : "conflicting_remote_object");
  }
  if (privilege.serviceRoleConsideration !== "service_role_bypass_operational_risk_remains") {
    addReason(reasons, "conflicting_remote_object");
  }

  return decision(reasons, sessionId, reasons.size === 0 ? fingerprint(evidence) : null);
}

function decision(
  reasons: Set<PostTradeReadOnlyLivePreflightBlockingReason>,
  evidenceSessionId: string | null,
  evidenceFingerprint: string | null,
): PostTradeReadOnlyLivePreflightDecision {
  const decisionClassification = classifyDecision(reasons);
  const ready = decisionClassification === "ready_for_explicit_staging_deployment_action";
  return {
    contractId: POST_TRADE_READ_ONLY_LIVE_PREFLIGHT_CONTRACT_ID,
    contractVersion: POST_TRADE_READ_ONLY_LIVE_PREFLIGHT_CONTRACT_VERSION,
    decisionClassification,
    readyForExplicitStagingDeploymentAction: ready,
    deploymentEnabled: false,
    deploymentStatus: "not_deployed",
    remoteMutation: false,
    sqlExecuted: false,
    migrationsApplied: 0,
    rowsCreated: 0,
    blockingReasons: [...reasons].sort(),
    evidenceSessionId,
    evidenceFingerprint,
    futureRunnerRequired: true,
    recommendsSeparateExplicitDeploymentAction: ready,
  };
}
