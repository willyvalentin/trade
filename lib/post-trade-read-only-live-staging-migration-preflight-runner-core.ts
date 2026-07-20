import {
  buildPostTradeReadOnlyLivePreflightCanonicalEvidence,
  buildPostTradeReadOnlyLivePreflightCatalogObservationFingerprint,
  buildPostTradeReadOnlyLivePreflightHistoryObservationFingerprint,
  buildPostTradeReadOnlyLivePreflightInventoryObservationFingerprint,
  buildPostTradeReadOnlyLivePreflightProjectObservationFingerprint,
  buildPostTradeReadOnlyLivePreflightTargetProjectObservationFingerprint,
  buildPostTradeReadOnlyLivePreflightWorktreeObservationFingerprint,
  evaluatePostTradeReadOnlyLiveStagingMigrationPreflight,
  POST_TRADE_READ_ONLY_LIVE_PREFLIGHT_CONTRACT_VERSION,
  type PostTradeReadOnlyLivePreflightBlockingReason,
  type PostTradeReadOnlyLivePreflightDecision,
  type PostTradeReadOnlyLivePreflightEvidenceSet,
} from "@/lib/post-trade-read-only-live-staging-migration-preflight-contract";
import {
  POST_TRADE_STAGING_MIGRATION_EXPECTED_FINGERPRINT,
  POST_TRADE_STAGING_MIGRATION_EXPECTED_NORMALIZED_LENGTH,
  POST_TRADE_STAGING_MIGRATION_FILENAME,
  POST_TRADE_STAGING_MIGRATION_PATH,
  POST_TRADE_STAGING_MIGRATION_PROJECT_REF,
  POST_TRADE_STAGING_MIGRATION_REJECTED_PRODUCTION_REF,
  POST_TRADE_STAGING_MIGRATION_TIMESTAMP_PREFIX,
} from "@/lib/post-trade-staging-migration-deployment-gate-core";

export const POST_TRADE_READ_ONLY_LIVE_PREFLIGHT_RUNNER_ID =
  "post_trade_allowlisted_read_only_live_staging_migration_preflight_runner_001" as const;
export const POST_TRADE_READ_ONLY_LIVE_PREFLIGHT_RUNNER_VERSION =
  "post_trade_allowlisted_read_only_live_staging_migration_preflight_runner_v1" as const;
export const POST_TRADE_READ_ONLY_LIVE_PREFLIGHT_RUNNER_COLLECTOR_VERSION =
  "post_trade_read_only_live_preflight_collector_v1" as const;
export const POST_TRADE_READ_ONLY_LIVE_PREFLIGHT_RUNNER_EXPECTED_WORKDIR =
  "ture_trade_repository_root" as const;

export type PostTradeReadOnlyLivePreflightCommandFamily =
  | "git_repository_root"
  | "git_current_commit"
  | "git_current_branch"
  | "git_porcelain_status"
  | "git_staged_files"
  | "git_unstaged_files"
  | "git_untracked_files"
  | "local_migration_content"
  | "local_migration_inventory"
  | "local_file_metadata"
  | "supabase_linked_project"
  | "supabase_migration_history";

export type PostTradeReadOnlyLivePreflightCatalogQueryIdentity =
  | "target_relation_absence"
  | "target_schema_object_conflict_scan"
  | "referenced_table_existence"
  | "referenced_pk_type_verification"
  | "uuid_generation_capability"
  | "target_policy_index_function_trigger_absence"
  | "anon_authenticated_grants"
  | "schema_privilege_baseline"
  | "ownership_rls_capability";

export type PostTradeReadOnlyLivePreflightEvidenceCategoryStatus =
  | "not_collected"
  | "collected"
  | "blocked"
  | "ambiguous";

export type PostTradeReadOnlyLivePreflightRunnerStatus =
  | "not_run"
  | "ready_for_explicit_staging_deployment_action"
  | "blocked"
  | "ambiguous"
  | "invalid"
  | "stale"
  | "already_applied";

export type PostTradeReadOnlyLivePreflightCommandSpec = {
  readonly operationId: string;
  readonly family: PostTradeReadOnlyLivePreflightCommandFamily;
  readonly executable: "git" | "supabase" | "internal_file_reader" | "internal_migration_inventory_reader";
  readonly args: readonly string[];
  readonly workingDirectoryIdentity: typeof POST_TRADE_READ_ONLY_LIVE_PREFLIGHT_RUNNER_EXPECTED_WORKDIR;
  readonly timeoutMs: number;
  readonly readOnly: true;
  readonly expectedOutputClassification:
    | "single_line"
    | "porcelain_status"
    | "name_status"
    | "migration_content_metadata"
    | "migration_inventory"
    | "supabase_project_status"
    | "supabase_migration_history";
  readonly maxStdoutBytes: number;
  readonly maxStderrBytes: number;
  readonly environmentPolicy: "minimal_non_secret_no_color_no_pager";
  readonly stdinPolicy: "closed";
  readonly evidenceCategory:
    | "worktree"
    | "migration_content"
    | "migration_inventory"
    | "project"
    | "history";
  readonly parserIdentity: string;
};

export type PostTradeReadOnlyLivePreflightCatalogQuerySpec = {
  readonly queryId: PostTradeReadOnlyLivePreflightCatalogQueryIdentity;
  readonly targetProjectRef: typeof POST_TRADE_STAGING_MIGRATION_PROJECT_REF;
  readonly readOnly: true;
  readonly acceptsRawSql: false;
  readonly acceptsCallerProvidedSql: false;
  readonly acceptsArbitraryTable: false;
  readonly acceptsArbitrarySchema: false;
  readonly permitsMutation: false;
  readonly permitsRpc: false;
  readonly permitsTransactionControl: false;
  readonly permitsMultipleStatements: false;
  readonly timeoutMs: number;
};

export type PostTradeReadOnlyLivePreflightCommandExecutionResult = {
  readonly operationId: string;
  readonly exitClassification: "success" | "nonzero" | "timeout" | "signal" | "missing" | "blocked";
  readonly exitCode: number | null;
  readonly timedOut: boolean;
  readonly signalClassification: "none" | "terminated" | "unknown";
  readonly stdoutFingerprint: string;
  readonly stderrFingerprint: string;
  readonly stdoutByteCount: number;
  readonly stderrByteCount: number;
  readonly stdoutTruncated: boolean;
  readonly stderrTruncated: boolean;
  readonly parserStatus: "not_parsed" | "parsed" | "malformed" | "ambiguous" | "blocked";
  readonly observedAtIso: string;
  readonly transientStdout?: string;
  readonly transientStderr?: string;
};

export type PostTradeReadOnlyLivePreflightCatalogAdapterResult = {
  readonly queryId: PostTradeReadOnlyLivePreflightCatalogQueryIdentity;
  readonly resultClassification: "success" | "missing" | "timeout" | "malformed" | "ambiguous" | "blocked";
  readonly observedAtIso: string;
  readonly evidenceFingerprint: string;
  readonly targetRelationAbsent?: boolean;
  readonly conflictingRelationKind?: "none" | "table" | "view" | "materialized_view" | "type" | "index" | "policy" | "function" | "trigger";
  readonly targetIndexesExist?: boolean;
  readonly targetPoliciesExist?: boolean;
  readonly targetFunctionOrTriggerExists?: boolean;
  readonly referencedExecutionRecordsTableExists?: boolean;
  readonly referencedAuditEventsTableExists?: boolean;
  readonly referencedPrimaryKeyColumnsExist?: boolean;
  readonly referencedPrimaryKeyTypesMatchUuid?: boolean;
  readonly referencedObjectsInPublicSchema?: boolean;
  readonly uuidGenerationAvailable?: boolean;
  readonly anonGrantsClassification?: "compatible" | "too_broad" | "ambiguous";
  readonly authenticatedGrantsClassification?: "compatible" | "too_broad" | "ambiguous";
  readonly schemaUsageContext?: "compatible" | "ambiguous" | "incompatible";
  readonly defaultPrivilegeObservations?: "compatible" | "ambiguous" | "incompatible";
  readonly expectedOwnershipContext?: "compatible" | "ambiguous" | "incompatible";
  readonly serviceRoleConsideration?: "service_role_bypass_operational_risk_remains";
  readonly rlsCapabilityAvailability?: "available" | "unavailable" | "ambiguous";
};

export type PostTradeReadOnlyLivePreflightCommandExecutor = (
  spec: PostTradeReadOnlyLivePreflightCommandSpec,
) => Promise<PostTradeReadOnlyLivePreflightCommandExecutionResult>;

export type PostTradeReadOnlyLivePreflightCatalogAdapter = (
  spec: PostTradeReadOnlyLivePreflightCatalogQuerySpec,
) => Promise<PostTradeReadOnlyLivePreflightCatalogAdapterResult>;

export type PostTradeReadOnlyLivePreflightRunnerPlan = {
  readonly runnerId: typeof POST_TRADE_READ_ONLY_LIVE_PREFLIGHT_RUNNER_ID;
  readonly runnerVersion: typeof POST_TRADE_READ_ONLY_LIVE_PREFLIGHT_RUNNER_VERSION;
  readonly runnerStatus: "not_run";
  readonly evidenceCollected: false;
  readonly liveProjectVerified: false;
  readonly liveWorktreeVerified: false;
  readonly deploymentEnabled: false;
  readonly deploymentStatus: "not_deployed";
  readonly remoteMutation: false;
  readonly sqlExecuted: false;
  readonly migrationsApplied: 0;
  readonly rowsCreated: 0;
  readonly operations: readonly PostTradeReadOnlyLivePreflightCommandSpec[];
  readonly catalogQueries: readonly PostTradeReadOnlyLivePreflightCatalogQuerySpec[];
};

export type PostTradeReadOnlyLivePreflightRunnerResult = {
  readonly runnerId: typeof POST_TRADE_READ_ONLY_LIVE_PREFLIGHT_RUNNER_ID;
  readonly runnerVersion: typeof POST_TRADE_READ_ONLY_LIVE_PREFLIGHT_RUNNER_VERSION;
  readonly runnerStatus: PostTradeReadOnlyLivePreflightRunnerStatus;
  readonly collectionSessionId: string | null;
  readonly evidenceCollected: boolean;
  readonly evidenceCategoryStatuses: Readonly<Record<string, PostTradeReadOnlyLivePreflightEvidenceCategoryStatus>>;
  readonly sanitizedBlockingReasons: readonly PostTradeReadOnlyLivePreflightBlockingReason[];
  readonly ambiguityReasons: readonly string[];
  readonly preflightDecision: PostTradeReadOnlyLivePreflightDecision | null;
  readonly commandExecutionCount: number;
  readonly catalogQueryCount: number;
  readonly readOnlyConfirmed: boolean;
  readonly mutationDetected: false;
  readonly deploymentEnabled: false;
  readonly deploymentStatus: "not_deployed";
  readonly remoteMutation: false;
  readonly sqlExecuted: false;
  readonly migrationsApplied: 0;
  readonly rowsCreated: 0;
  readonly liveProjectVerified: boolean;
  readonly liveWorktreeVerified: boolean;
};

const operationSpecs: readonly PostTradeReadOnlyLivePreflightCommandSpec[] = [
  command("git_repository_root", "git", ["rev-parse", "--show-toplevel"], "single_line", "worktree"),
  command("git_current_commit", "git", ["rev-parse", "HEAD"], "single_line", "worktree"),
  command("git_current_branch", "git", ["branch", "--show-current", "--no-color"], "single_line", "worktree"),
  command("git_porcelain_status", "git", ["status", "--porcelain=v1", "--untracked-files=all", "--no-renames"], "porcelain_status", "worktree"),
  command("git_staged_files", "git", ["diff", "--cached", "--name-status", "--no-ext-diff"], "name_status", "worktree"),
  command("git_unstaged_files", "git", ["diff", "--name-status", "--no-ext-diff"], "name_status", "worktree"),
  command("git_untracked_files", "git", ["ls-files", "--others", "--exclude-standard"], "name_status", "worktree"),
  command("local_file_metadata", "internal_file_reader", ["metadata", POST_TRADE_STAGING_MIGRATION_PATH], "migration_content_metadata", "migration_content"),
  command("local_migration_content", "internal_file_reader", ["read-reviewed-migration", POST_TRADE_STAGING_MIGRATION_PATH], "migration_content_metadata", "migration_content"),
  command("local_migration_inventory", "internal_migration_inventory_reader", ["list", "supabase/migrations"], "migration_inventory", "migration_inventory"),
  command("supabase_linked_project", "supabase", ["status", "--linked", "--output", "json"], "supabase_project_status", "project"),
  command("supabase_migration_history", "supabase", ["migration", "list", "--linked", "--output", "json"], "supabase_migration_history", "history"),
];

const catalogQuerySpecs: readonly PostTradeReadOnlyLivePreflightCatalogQuerySpec[] = [
  "target_relation_absence",
  "target_schema_object_conflict_scan",
  "referenced_table_existence",
  "referenced_pk_type_verification",
  "uuid_generation_capability",
  "target_policy_index_function_trigger_absence",
  "anon_authenticated_grants",
  "schema_privilege_baseline",
  "ownership_rls_capability",
].map((queryId) => ({
  queryId: queryId as PostTradeReadOnlyLivePreflightCatalogQueryIdentity,
  targetProjectRef: POST_TRADE_STAGING_MIGRATION_PROJECT_REF,
  readOnly: true,
  acceptsRawSql: false,
  acceptsCallerProvidedSql: false,
  acceptsArbitraryTable: false,
  acceptsArbitrarySchema: false,
  permitsMutation: false,
  permitsRpc: false,
  permitsTransactionControl: false,
  permitsMultipleStatements: false,
  timeoutMs: 10_000,
}));

const commandSpecKeys = new Set([
  "operationId",
  "family",
  "executable",
  "args",
  "workingDirectoryIdentity",
  "timeoutMs",
  "readOnly",
  "expectedOutputClassification",
  "maxStdoutBytes",
  "maxStderrBytes",
  "environmentPolicy",
  "stdinPolicy",
  "evidenceCategory",
  "parserIdentity",
]);

const catalogQuerySpecKeys = new Set([
  "queryId",
  "targetProjectRef",
  "readOnly",
  "acceptsRawSql",
  "acceptsCallerProvidedSql",
  "acceptsArbitraryTable",
  "acceptsArbitrarySchema",
  "permitsMutation",
  "permitsRpc",
  "permitsTransactionControl",
  "permitsMultipleStatements",
  "timeoutMs",
]);

const catalogResultKeys = new Set([
  "queryId",
  "resultClassification",
  "observedAtIso",
  "evidenceFingerprint",
  "targetRelationAbsent",
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
  "anonGrantsClassification",
  "authenticatedGrantsClassification",
  "schemaUsageContext",
  "defaultPrivilegeObservations",
  "expectedOwnershipContext",
  "serviceRoleConsideration",
  "rlsCapabilityAvailability",
]);

function command(
  family: PostTradeReadOnlyLivePreflightCommandFamily,
  executable: PostTradeReadOnlyLivePreflightCommandSpec["executable"],
  args: readonly string[],
  expectedOutputClassification: PostTradeReadOnlyLivePreflightCommandSpec["expectedOutputClassification"],
  evidenceCategory: PostTradeReadOnlyLivePreflightCommandSpec["evidenceCategory"],
): PostTradeReadOnlyLivePreflightCommandSpec {
  return {
    operationId: `preflight_${family}`,
    family,
    executable,
    args,
    workingDirectoryIdentity: POST_TRADE_READ_ONLY_LIVE_PREFLIGHT_RUNNER_EXPECTED_WORKDIR,
    timeoutMs: executable === "supabase" ? 15_000 : 5_000,
    readOnly: true,
    expectedOutputClassification,
    maxStdoutBytes: executable === "supabase" ? 32_768 : 16_384,
    maxStderrBytes: 8_192,
    environmentPolicy: "minimal_non_secret_no_color_no_pager",
    stdinPolicy: "closed",
    evidenceCategory,
    parserIdentity: `${family}_parser_v1`,
  };
}

export function buildPostTradeReadOnlyLivePreflightRunnerPlan(): PostTradeReadOnlyLivePreflightRunnerPlan {
  return {
    runnerId: POST_TRADE_READ_ONLY_LIVE_PREFLIGHT_RUNNER_ID,
    runnerVersion: POST_TRADE_READ_ONLY_LIVE_PREFLIGHT_RUNNER_VERSION,
    runnerStatus: "not_run",
    evidenceCollected: false,
    liveProjectVerified: false,
    liveWorktreeVerified: false,
    deploymentEnabled: false,
    deploymentStatus: "not_deployed",
    remoteMutation: false,
    sqlExecuted: false,
    migrationsApplied: 0,
    rowsCreated: 0,
    operations: operationSpecs,
    catalogQueries: catalogQuerySpecs,
  };
}

export function buildPostTradeReadOnlyLivePreflightRunnerDefaultResult(): PostTradeReadOnlyLivePreflightRunnerResult {
  return result({
    runnerStatus: "not_run",
    sessionId: null,
    evidenceCollected: false,
    commandExecutionCount: 0,
    catalogQueryCount: 0,
  });
}

export function validatePostTradeReadOnlyLivePreflightCommandSpec(spec: unknown): readonly string[] {
  const errors: string[] = [];
  if (!isRecord(spec)) return ["command_spec_not_object"];
  for (const key of Object.keys(spec)) {
    if (!commandSpecKeys.has(key)) errors.push(`unknown_command_spec_key:${key}`);
  }
  const family = spec.family;
  const executable = spec.executable;
  const args = Array.isArray(spec.args) ? spec.args : null;
  const known = operationSpecs.find((item) => item.family === family);
  if (!known) errors.push("unknown_command_family");
  if (known && executable !== known.executable) errors.push("unknown_executable");
  if (!args) {
    errors.push("arguments_not_array");
  } else if (known) {
    if (!args.every((arg) => typeof arg === "string" && arg.length > 0 && arg.trim() === arg)) {
      errors.push("unsafe_argument");
    }
    if (args.length !== known.args.length || args.some((arg, index) => arg !== known.args[index])) {
      errors.push("unknown_subcommand_or_argument");
    }
    if (hasDuplicateFlags(args)) errors.push("duplicate_flag");
    if (args.some(hasDangerousToken)) errors.push("unsafe_argument");
    if (args.some((arg) => arg.includes(POST_TRADE_STAGING_MIGRATION_REJECTED_PRODUCTION_REF))) {
      errors.push("production_project_argument");
    }
    if (args.some((arg) => isProjectRef(arg) && arg !== POST_TRADE_STAGING_MIGRATION_PROJECT_REF)) {
      errors.push("alternate_project_argument");
    }
  }
  if (spec.workingDirectoryIdentity !== POST_TRADE_READ_ONLY_LIVE_PREFLIGHT_RUNNER_EXPECTED_WORKDIR) {
    errors.push("invalid_working_directory");
  }
  if (spec.readOnly !== true) errors.push("not_read_only");
  if (spec.stdinPolicy !== "closed") errors.push("stdin_not_closed");
  if (spec.environmentPolicy !== "minimal_non_secret_no_color_no_pager") errors.push("unsafe_environment_policy");
  if (known && spec.operationId !== known.operationId) errors.push("unknown_operation_id");
  if (known && spec.timeoutMs !== known.timeoutMs) errors.push("invalid_timeout");
  if (known && spec.maxStdoutBytes !== known.maxStdoutBytes) errors.push("invalid_stdout_limit");
  if (known && spec.maxStderrBytes !== known.maxStderrBytes) errors.push("invalid_stderr_limit");
  if (known && spec.expectedOutputClassification !== known.expectedOutputClassification) {
    errors.push("invalid_expected_output_classification");
  }
  if (known && spec.parserIdentity !== known.parserIdentity) errors.push("invalid_parser_identity");
  if (known && spec.evidenceCategory !== known.evidenceCategory) errors.push("invalid_evidence_category");
  return errors;
}

export function validatePostTradeReadOnlyLivePreflightCatalogQuerySpec(spec: unknown): readonly string[] {
  const errors: string[] = [];
  if (!isRecord(spec)) return ["catalog_query_not_object"];
  for (const key of Object.keys(spec)) {
    if (!catalogQuerySpecKeys.has(key)) errors.push(`unknown_catalog_query_key:${key}`);
  }
  if (!catalogQuerySpecs.some((item) => item.queryId === spec.queryId)) errors.push("unknown_query_identity");
  if (spec.targetProjectRef !== POST_TRADE_STAGING_MIGRATION_PROJECT_REF) errors.push("non_staging_catalog_target");
  for (const key of [
    "acceptsRawSql",
    "acceptsCallerProvidedSql",
    "acceptsArbitraryTable",
    "acceptsArbitrarySchema",
    "permitsMutation",
    "permitsRpc",
    "permitsTransactionControl",
    "permitsMultipleStatements",
  ]) {
    if (spec[key] !== false) errors.push(`unsafe_catalog_${key}`);
  }
  if (spec.readOnly !== true) errors.push("catalog_not_read_only");
  const known = catalogQuerySpecs.find((item) => item.queryId === spec.queryId);
  if (known && spec.timeoutMs !== known.timeoutMs) errors.push("invalid_catalog_timeout");
  return errors;
}

export async function runPostTradeReadOnlyLiveStagingMigrationPreflightWithInjectedDependencies(input: {
  readonly executor: PostTradeReadOnlyLivePreflightCommandExecutor;
  readonly catalogAdapter: PostTradeReadOnlyLivePreflightCatalogAdapter;
  readonly evaluatedAtIso?: string;
  readonly sessionId?: string;
}): Promise<PostTradeReadOnlyLivePreflightRunnerResult> {
  const plan = buildPostTradeReadOnlyLivePreflightRunnerPlan();
  const sessionId = input.sessionId ?? "post_trade_read_only_live_preflight_session_001";
  const evaluatedAtIso = input.evaluatedAtIso ?? "2026-07-12T12:00:30.000Z";
  const commandResults: PostTradeReadOnlyLivePreflightCommandExecutionResult[] = [];
  const catalogResults: PostTradeReadOnlyLivePreflightCatalogAdapterResult[] = [];
  const ambiguityReasons = new Set<string>();
  const statuses = createCategoryStatus();

  for (const spec of plan.operations) {
    const specErrors = validatePostTradeReadOnlyLivePreflightCommandSpec(spec);
    if (specErrors.length > 0) {
      mark(statuses, spec.evidenceCategory, "blocked");
      ambiguityReasons.add(specErrors[0] ?? "invalid_command_spec");
      return finishBlocked(sessionId, commandResults.length, catalogResults.length, statuses, ambiguityReasons, null);
    }
    const execution = await input.executor(spec);
    commandResults.push(execution);
    const issue = validateExecutionResult(spec, execution);
    if (issue) {
      mark(statuses, spec.evidenceCategory, classifyRunnerBoundaryIssue(issue));
      ambiguityReasons.add(`${spec.operationId}:${issue}`);
      return finishBlocked(sessionId, commandResults.length, catalogResults.length, statuses, ambiguityReasons, null);
    }
    mark(statuses, spec.evidenceCategory, "collected");
  }

  for (const spec of plan.catalogQueries) {
    const specErrors = validatePostTradeReadOnlyLivePreflightCatalogQuerySpec(spec);
    if (specErrors.length > 0) {
      mark(statuses, "catalog", "blocked");
      ambiguityReasons.add(specErrors[0] ?? "invalid_catalog_query_spec");
      return finishBlocked(sessionId, commandResults.length, catalogResults.length, statuses, ambiguityReasons, null);
    }
    const catalog = await input.catalogAdapter(spec);
    catalogResults.push(catalog);
    const issue = validateCatalogResult(spec, catalog);
    if (issue) {
      mark(
        statuses,
        spec.queryId.includes("grant") || spec.queryId.includes("privilege") || spec.queryId.includes("ownership") ? "privilege" : "catalog",
        classifyRunnerBoundaryIssue(issue),
      );
      ambiguityReasons.add(`${spec.queryId}:${issue}`);
      return finishBlocked(sessionId, commandResults.length, catalogResults.length, statuses, ambiguityReasons, null);
    }
  }
  mark(statuses, "catalog", "collected");
  mark(statuses, "privilege", "collected");

  const evidence = buildEvidenceFromParsedResults(sessionId, commandResults, catalogResults);
  const decision = evaluatePostTradeReadOnlyLiveStagingMigrationPreflight(evidence, evaluatedAtIso);
  const runnerStatus = decision.decisionClassification === "invalid" ? "blocked" : decision.decisionClassification;
  return result({
    runnerStatus,
    sessionId,
    evidenceCollected: decision.readyForExplicitStagingDeploymentAction,
    commandExecutionCount: commandResults.length,
    catalogQueryCount: catalogResults.length,
    statuses,
    ambiguityReasons: [...ambiguityReasons].sort(),
    preflightDecision: decision,
    liveProjectVerified: decision.readyForExplicitStagingDeploymentAction,
    liveWorktreeVerified: decision.readyForExplicitStagingDeploymentAction,
  });
}

function buildEvidenceFromParsedResults(
  sessionId: string,
  commandResults: readonly PostTradeReadOnlyLivePreflightCommandExecutionResult[],
  catalogResults: readonly PostTradeReadOnlyLivePreflightCatalogAdapterResult[],
): PostTradeReadOnlyLivePreflightEvidenceSet {
  const evidence = buildPostTradeReadOnlyLivePreflightCanonicalEvidence({ sessionId });
  const byOperation = new Map(commandResults.map((item) => [item.operationId, item]));
  const root = parseSingleLine(byOperation.get("preflight_git_repository_root")?.transientStdout);
  const commit = parseSingleLine(byOperation.get("preflight_git_current_commit")?.transientStdout);
  const branch = parseSingleLine(byOperation.get("preflight_git_current_branch")?.transientStdout);
  const statusPaths = parsePorcelainStatus(byOperation.get("preflight_git_porcelain_status")?.transientStdout ?? "");
  const staged = parseNameStatus(byOperation.get("preflight_git_staged_files")?.transientStdout ?? "");
  const unstaged = parseNameStatus(byOperation.get("preflight_git_unstaged_files")?.transientStdout ?? "");
  const untracked = parsePlainPaths(byOperation.get("preflight_git_untracked_files")?.transientStdout ?? "");
  const migration = parseMigrationMetadata(byOperation.get("preflight_local_migration_content")?.transientStdout ?? "");
  const metadata = parseMigrationMetadata(byOperation.get("preflight_local_file_metadata")?.transientStdout ?? "");
  const inventory = parseInventory(byOperation.get("preflight_local_migration_inventory")?.transientStdout ?? "");
  const project = parseJson(byOperation.get("preflight_supabase_linked_project")?.transientStdout ?? "{}");
  const history = parseJson(byOperation.get("preflight_supabase_migration_history")?.transientStdout ?? "{}");

  evidence.collectionSession.repositoryRootIdentity = root;
  evidence.collectionSession.preflightContractVersion = POST_TRADE_READ_ONLY_LIVE_PREFLIGHT_CONTRACT_VERSION;
  evidence.collectionSession.collectorVersion = POST_TRADE_READ_ONLY_LIVE_PREFLIGHT_RUNNER_COLLECTOR_VERSION;

  evidence.worktree.repositoryRootIdentity = root;
  evidence.worktree.currentCommit = commit;
  evidence.worktree.currentBranch = branch;
  evidence.worktree.stagedFiles = staged;
  evidence.worktree.unstagedFiles = unstaged;
  evidence.worktree.untrackedFiles = [...new Set([...untracked, ...statusPaths.untracked])];
  evidence.worktree.deletedFiles = statusPaths.deleted;
  evidence.worktree.renamedFiles = statusPaths.renamed;
  evidence.worktree.trackedModifiedFiles = statusPaths.modified;
  evidence.worktree.scopeClassification =
    staged.length === 0 && unstaged.length === 0 && evidence.worktree.untrackedFiles.length === 0
      ? "exact_reviewed_deployment_scope"
      : "unrelated_changes_present_but_excluded";
  evidence.worktree.normalizedWorktreeFingerprint =
    buildPostTradeReadOnlyLivePreflightWorktreeObservationFingerprint(evidence.worktree);

  evidence.localMigrationContent.fileByteLength =
    (metadata.fileByteLength || migration.fileByteLength) as typeof POST_TRADE_STAGING_MIGRATION_EXPECTED_NORMALIZED_LENGTH;
  evidence.localMigrationContent.normalizedSqlByteLength =
    migration.normalizedSqlByteLength as typeof POST_TRADE_STAGING_MIGRATION_EXPECTED_NORMALIZED_LENGTH;
  evidence.localMigrationContent.sha256 = migration.sha256;
  evidence.localMigrationContent.symlinkStatus = metadata.symlinkStatus;
  evidence.localMigrationContent.regularFileStatus = metadata.regularFileStatus;

  evidence.localMigrationInventory.allMigrationFilenames = inventory.allMigrationFilenames;
  evidence.localMigrationInventory.orderedMigrationTimestamps = inventory.orderedMigrationTimestamps;
  evidence.localMigrationInventory.targetMigrationPresence = inventory.targetMigrationPresence;
  evidence.localMigrationInventory.duplicateTimestamps = inventory.duplicateTimestamps;
  evidence.localMigrationInventory.duplicateNames = inventory.duplicateNames;
  evidence.localMigrationInventory.migrationsNewerThanTarget = inventory.migrationsNewerThanTarget;
  evidence.localMigrationInventory.migrationsUnexpectedlyInsertedBeforeTarget =
    inventory.migrationsUnexpectedlyInsertedBeforeTarget;
  evidence.localMigrationInventory.migrationCountInProposedDeploymentUnit =
    inventory.migrationCountInProposedDeploymentUnit;
  evidence.localMigrationInventory.orderingClassification = inventory.orderingClassification;
  evidence.localMigrationInventory.normalizedInventoryFingerprint =
    buildPostTradeReadOnlyLivePreflightInventoryObservationFingerprint(evidence.localMigrationInventory);

  const projectRef = getString(project, "linkedProjectRef") || getString(project, "projectRef");
  evidence.projectLink.observedProjectRef = projectRef;
  evidence.projectLink.linkedProjectRef = projectRef;
  evidence.projectLink.environmentClassification = projectRef === POST_TRADE_STAGING_MIGRATION_PROJECT_REF ? "staging" : projectRef === POST_TRADE_STAGING_MIGRATION_REJECTED_PRODUCTION_REF ? "production" : "alternate";
  evidence.projectLink.agreementClassification = projectRef === POST_TRADE_STAGING_MIGRATION_PROJECT_REF ? "exact_staging_match" : projectRef === POST_TRADE_STAGING_MIGRATION_REJECTED_PRODUCTION_REF ? "production_match" : "alternate_project";
  evidence.projectLink.linkState = projectRef ? "linked" : "not_linked";
  evidence.projectLink.sanitizedEvidenceFingerprint =
    buildPostTradeReadOnlyLivePreflightProjectObservationFingerprint({
      observedProjectRef: evidence.projectLink.observedProjectRef,
      linkedProjectRef: evidence.projectLink.linkedProjectRef,
      expectedStagingProjectRef: evidence.projectLink.expectedStagingProjectRef,
      rejectedProductionProjectRef: evidence.projectLink.rejectedProductionProjectRef,
      environmentClassification: evidence.projectLink.environmentClassification,
      linkState: evidence.projectLink.linkState,
      agreementClassification: evidence.projectLink.agreementClassification,
      productionRejectionClassification: evidence.projectLink.productionRejectionClassification,
    });
  evidence.targetProject.observedProjectRef = projectRef;
  evidence.targetProject.agreementClassification = evidence.projectLink.agreementClassification === "exact_staging_match" ? "exact_staging_match" : evidence.projectLink.agreementClassification === "production_match" ? "production_match" : "alternate_project";
  evidence.targetProject.sanitizedEvidenceFingerprint =
    buildPostTradeReadOnlyLivePreflightTargetProjectObservationFingerprint({
      observedProjectRef: evidence.targetProject.observedProjectRef,
      expectedStagingProjectRef: evidence.targetProject.expectedStagingProjectRef,
      rejectedProductionProjectRef: evidence.targetProject.rejectedProductionProjectRef,
      agreementClassification: evidence.targetProject.agreementClassification,
    });

  const applied = getStringArray(history, "remoteAppliedMigrationIdentifiers");
  evidence.remoteMigrationHistory.remoteAppliedMigrationIdentifiers = applied;
  evidence.remoteMigrationHistory.observedProjectRef = getString(history, "observedProjectRef") || projectRef;
  evidence.remoteMigrationHistory.targetMigrationAppliedStatus = applied.includes(POST_TRADE_STAGING_MIGRATION_TIMESTAMP_PREFIX) ? "already_applied" : "unapplied";
  evidence.remoteMigrationHistory.resultClassification =
    evidence.remoteMigrationHistory.targetMigrationAppliedStatus === "already_applied"
      ? "target_already_applied"
      : "target_migration_unapplied_and_eligible";
  evidence.remoteMigrationHistory.historyFingerprint =
    buildPostTradeReadOnlyLivePreflightHistoryObservationFingerprint(evidence.remoteMigrationHistory);

  const catalog = mergeCatalog(catalogResults);
  evidence.remoteCatalog.targetTableExists = !catalog.targetRelationAbsent;
  evidence.remoteCatalog.conflictingRelationKind = catalog.conflictingRelationKind ?? "none";
  evidence.remoteCatalog.targetIndexesExist = catalog.targetIndexesExist ?? false;
  evidence.remoteCatalog.targetPoliciesExist = catalog.targetPoliciesExist ?? false;
  evidence.remoteCatalog.targetFunctionOrTriggerExists = catalog.targetFunctionOrTriggerExists ?? false;
  evidence.remoteCatalog.referencedExecutionRecordsTableExists = catalog.referencedExecutionRecordsTableExists ?? true;
  evidence.remoteCatalog.referencedAuditEventsTableExists = catalog.referencedAuditEventsTableExists ?? true;
  evidence.remoteCatalog.referencedPrimaryKeyColumnsExist = catalog.referencedPrimaryKeyColumnsExist ?? true;
  evidence.remoteCatalog.referencedPrimaryKeyTypesMatchUuid = catalog.referencedPrimaryKeyTypesMatchUuid ?? true;
  evidence.remoteCatalog.referencedObjectsInPublicSchema = catalog.referencedObjectsInPublicSchema ?? true;
  evidence.remoteCatalog.uuidGenerationAvailable = catalog.uuidGenerationAvailable ?? true;
  evidence.remoteCatalog.resultClassification = evidence.remoteCatalog.targetTableExists
    ? "table_already_exists"
    : "expected_clean_pre_deployment_state";
  evidence.remoteCatalog.catalogEvidenceFingerprint =
    buildPostTradeReadOnlyLivePreflightCatalogObservationFingerprint(evidence.remoteCatalog);

  evidence.remotePrivilegeBaseline.anonGrantsClassification = catalog.anonGrantsClassification ?? "compatible";
  evidence.remotePrivilegeBaseline.authenticatedGrantsClassification =
    catalog.authenticatedGrantsClassification ?? "compatible";
  evidence.remotePrivilegeBaseline.schemaUsageContext = catalog.schemaUsageContext ?? "compatible";
  evidence.remotePrivilegeBaseline.defaultPrivilegeObservations =
    catalog.defaultPrivilegeObservations ?? "compatible";
  evidence.remotePrivilegeBaseline.expectedOwnershipContext =
    catalog.expectedOwnershipContext ?? "compatible";
  evidence.remotePrivilegeBaseline.rlsCapabilityAvailability =
    catalog.rlsCapabilityAvailability ?? "available";

  return evidence;
}

function validateExecutionResult(
  spec: PostTradeReadOnlyLivePreflightCommandSpec,
  execution: PostTradeReadOnlyLivePreflightCommandExecutionResult,
): string | null {
  if (execution.operationId !== spec.operationId) return "missing";
  if (containsSensitiveMaterial(execution)) return "secret_material";
  if (execution.timedOut || execution.exitClassification === "timeout") return "ambiguous";
  if (execution.stdoutTruncated || execution.stderrTruncated) return "ambiguous";
  if (execution.stdoutByteCount > spec.maxStdoutBytes || execution.stderrByteCount > spec.maxStderrBytes) {
    return "ambiguous";
  }
  if (execution.exitClassification !== "success" || execution.exitCode !== 0) return "blocked";
  if (execution.parserStatus === "ambiguous") return "ambiguous";
  if (execution.parserStatus === "malformed") return "parser_malformed";
  if (execution.parserStatus === "blocked") return "parser_blocked";
  if (spec.expectedOutputClassification === "single_line" && !isSingleNonEmptyLine(execution.transientStdout)) {
    return "invalid_single_line_output";
  }
  if (
    ["porcelain_status", "name_status"].includes(spec.expectedOutputClassification) &&
    typeof execution.transientStdout === "string" &&
    execution.transientStdout.split(/\n/).some((line) => {
      const path = line.replace(/^[A-Z? ]{1,3}\s*/, "").trim();
      return path.length > 0 && hasUnsafePath(path);
    })
  ) {
    return "unsafe_path";
  }
  if (containsInteractivePrompt(execution.transientStdout) || containsInteractivePrompt(execution.transientStderr)) {
    return "blocked";
  }
  if (containsRejectedProjectRef(execution.transientStdout) || containsRejectedProjectRef(execution.transientStderr)) {
    return "rejected_project_ref";
  }
  if (containsUnsafeOutput(execution.transientStdout) || containsUnsafeOutput(execution.transientStderr)) {
    return "unsafe_output";
  }
  return null;
}

function classifyRunnerBoundaryIssue(issue: string): PostTradeReadOnlyLivePreflightEvidenceCategoryStatus {
  if (["invalid_single_line_output", "unsafe_path", "rejected_project_ref"].includes(issue)) {
    return "blocked";
  }
  return "ambiguous";
}

function validateCatalogResult(
  spec: PostTradeReadOnlyLivePreflightCatalogQuerySpec,
  resultValue: PostTradeReadOnlyLivePreflightCatalogAdapterResult,
): string | null {
  if (resultValue.queryId !== spec.queryId) return "missing";
  if (containsSensitiveMaterial(resultValue)) return "secret_material";
  if (Object.keys(resultValue).some((key) => !catalogResultKeys.has(key))) return "unknown_catalog_result_key";
  if (resultValue.resultClassification === "timeout" || resultValue.resultClassification === "ambiguous") {
    return "ambiguous";
  }
  if (resultValue.resultClassification !== "success") return "blocked";
  if (!hasRequiredCatalogObservation(spec, resultValue)) return "catalog_observation_missing";
  return null;
}

function hasRequiredCatalogObservation(
  spec: PostTradeReadOnlyLivePreflightCatalogQuerySpec,
  resultValue: PostTradeReadOnlyLivePreflightCatalogAdapterResult,
): boolean {
  switch (spec.queryId) {
    case "target_relation_absence":
      return typeof resultValue.targetRelationAbsent === "boolean";
    case "target_schema_object_conflict_scan":
      return typeof resultValue.conflictingRelationKind === "string" &&
        typeof resultValue.targetIndexesExist === "boolean" &&
        typeof resultValue.targetPoliciesExist === "boolean" &&
        typeof resultValue.targetFunctionOrTriggerExists === "boolean";
    case "referenced_table_existence":
      return typeof resultValue.referencedExecutionRecordsTableExists === "boolean" &&
        typeof resultValue.referencedAuditEventsTableExists === "boolean" &&
        typeof resultValue.referencedObjectsInPublicSchema === "boolean";
    case "referenced_pk_type_verification":
      return typeof resultValue.referencedPrimaryKeyColumnsExist === "boolean" &&
        typeof resultValue.referencedPrimaryKeyTypesMatchUuid === "boolean";
    case "uuid_generation_capability":
      return typeof resultValue.uuidGenerationAvailable === "boolean";
    case "target_policy_index_function_trigger_absence":
      return typeof resultValue.targetIndexesExist === "boolean" &&
        typeof resultValue.targetPoliciesExist === "boolean" &&
        typeof resultValue.targetFunctionOrTriggerExists === "boolean";
    case "anon_authenticated_grants":
      return typeof resultValue.anonGrantsClassification === "string" &&
        typeof resultValue.authenticatedGrantsClassification === "string";
    case "schema_privilege_baseline":
      return typeof resultValue.schemaUsageContext === "string" &&
        typeof resultValue.defaultPrivilegeObservations === "string";
    case "ownership_rls_capability":
      return typeof resultValue.expectedOwnershipContext === "string" &&
        resultValue.serviceRoleConsideration === "service_role_bypass_operational_risk_remains" &&
        typeof resultValue.rlsCapabilityAvailability === "string";
  }
}

function finishBlocked(
  sessionId: string,
  commandExecutionCount: number,
  catalogQueryCount: number,
  statuses: Record<string, PostTradeReadOnlyLivePreflightEvidenceCategoryStatus>,
  ambiguityReasons: Set<string>,
  decisionValue: PostTradeReadOnlyLivePreflightDecision | null,
) {
  const hasBlockedCategory = Object.values(statuses).some((status) => status === "blocked");
  return result({
    runnerStatus: hasBlockedCategory ? "blocked" : "ambiguous",
    sessionId,
    evidenceCollected: false,
    commandExecutionCount,
    catalogQueryCount,
    statuses,
    ambiguityReasons: [...ambiguityReasons].sort(),
    preflightDecision: decisionValue,
  });
}

function result(input: {
  runnerStatus: PostTradeReadOnlyLivePreflightRunnerStatus;
  sessionId: string | null;
  evidenceCollected: boolean;
  commandExecutionCount: number;
  catalogQueryCount: number;
  statuses?: Record<string, PostTradeReadOnlyLivePreflightEvidenceCategoryStatus>;
  ambiguityReasons?: readonly string[];
  preflightDecision?: PostTradeReadOnlyLivePreflightDecision | null;
  liveProjectVerified?: boolean;
  liveWorktreeVerified?: boolean;
}): PostTradeReadOnlyLivePreflightRunnerResult {
  return {
    runnerId: POST_TRADE_READ_ONLY_LIVE_PREFLIGHT_RUNNER_ID,
    runnerVersion: POST_TRADE_READ_ONLY_LIVE_PREFLIGHT_RUNNER_VERSION,
    runnerStatus: input.runnerStatus,
    collectionSessionId: input.sessionId,
    evidenceCollected: input.evidenceCollected,
    evidenceCategoryStatuses: input.statuses ?? createCategoryStatus(),
    sanitizedBlockingReasons: input.preflightDecision?.blockingReasons ?? [],
    ambiguityReasons: input.ambiguityReasons ?? [],
    preflightDecision: input.preflightDecision ?? null,
    commandExecutionCount: input.commandExecutionCount,
    catalogQueryCount: input.catalogQueryCount,
    readOnlyConfirmed: true,
    mutationDetected: false,
    deploymentEnabled: false,
    deploymentStatus: "not_deployed",
    remoteMutation: false,
    sqlExecuted: false,
    migrationsApplied: 0,
    rowsCreated: 0,
    liveProjectVerified: input.liveProjectVerified ?? false,
    liveWorktreeVerified: input.liveWorktreeVerified ?? false,
  };
}

function createCategoryStatus(): Record<string, PostTradeReadOnlyLivePreflightEvidenceCategoryStatus> {
  return {
    readinessArtifact: "not_collected",
    worktree: "not_collected",
    migration_content: "not_collected",
    migration_inventory: "not_collected",
    project: "not_collected",
    history: "not_collected",
    catalog: "not_collected",
    privilege: "not_collected",
  };
}

function mark(
  statuses: Record<string, PostTradeReadOnlyLivePreflightEvidenceCategoryStatus>,
  category: string,
  status: PostTradeReadOnlyLivePreflightEvidenceCategoryStatus,
) {
  statuses[category] = status;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isProjectRef(value: string) {
  return /^[a-z0-9]{20}$/.test(value);
}

function hasDuplicateFlags(args: readonly string[]) {
  const flags = args.filter((arg) => arg.startsWith("-"));
  return new Set(flags).size !== flags.length;
}

function hasDangerousToken(value: string) {
  return /[;\n\r\u0000`<>|*?\u2028\u2029]/.test(value) ||
    value.includes("&&") ||
    value.includes("||") ||
    value.includes("$(") ||
    value.includes("${") ||
    value.startsWith("~") ||
    /^https?:\/\//i.test(value) ||
    /(access|refresh|service[_-]?role|password|secret|token|cookie|session|bankid)/i.test(value);
}

function containsInteractivePrompt(value: unknown) {
  if (typeof value !== "string") return false;
  return /login required|browser authentication|device code|password:|access token|confirm|link project|apply migration|multi-factor|mfa|press enter|select an option|open .*browser|https?:\/\/\S*(login|auth|token)/i.test(value);
}

function containsUnsafeOutput(value: unknown) {
  if (typeof value !== "string") return false;
  return /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]|\u001b\[[0-9;?]*[ -/]*[@-~]|^warning[:\s]/im.test(value) ||
    /postgres(?:ql)?:\/\//i.test(value);
}

function containsRejectedProjectRef(value: unknown) {
  return typeof value === "string" && value.includes(POST_TRADE_STAGING_MIGRATION_REJECTED_PRODUCTION_REF);
}

function containsSensitiveMaterial(value: unknown, seen = new WeakSet<object>()): boolean {
  if (typeof value === "string") {
    return /access[_ -]?token|refresh[_ -]?token|personal access token|service[_ -]?role[_ -]?(key|token|secret)|anon[_ -]?key|database[_ -]?password|connection[_ -]?string|authorization:\s*bearer|bearer\s+[a-z0-9._-]+|private key|client[_ -]?secret|cookie|session|bankid|rawEnvironment|\/Users\/|\/home\/|eyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+/i.test(value);
  }
  if (Array.isArray(value)) return value.some((item) => containsSensitiveMaterial(item, seen));
  if (!isRecord(value)) return false;
  if (seen.has(value)) return true;
  seen.add(value);
  return Object.entries(value).some(([key, nested]) =>
    /accessToken|refreshToken|serviceRoleKey|anonKey|databasePassword|connectionString|authorizationHeader|privateKey|clientSecret|cookie|session|BankID|rawEnvironment|username/i.test(key) ||
    containsSensitiveMaterial(nested, seen),
  );
}

function parseSingleLine(value: unknown) {
  if (typeof value !== "string") return "";
  const lines = value.trim().split(/\n/);
  return lines.length === 1 ? lines[0] ?? "" : "";
}

function parsePlainPaths(value: string) {
  return value.trim() ? value.trim().split(/\n/).filter((line) => line.length > 0 && !hasUnsafePath(line)) : [];
}

function parseNameStatus(value: string) {
  return value.trim()
    ? value.trim().split(/\n/).map((line) => line.replace(/^[A-Z?]+\s+/, "")).filter((path) => path && !hasUnsafePath(path))
    : [];
}

function parsePorcelainStatus(value: string) {
  const parsed = { modified: [] as string[], deleted: [] as string[], renamed: [] as string[], untracked: [] as string[] };
  for (const line of value.trim() ? value.trim().split(/\n/) : []) {
    const code = line.slice(0, 2);
    const path = line.slice(3);
    if (!path || hasUnsafePath(path)) continue;
    if (code === "??") parsed.untracked.push(path);
    else if (code.includes("D")) parsed.deleted.push(path);
    else if (code.includes("R")) parsed.renamed.push(path);
    else if (/^[ MADRCU?!]{2}$/.test(code)) parsed.modified.push(path);
  }
  return parsed;
}

function parseMigrationMetadata(value: string) {
  const parsed = parseJson(value);
  return {
    sha256: getString(parsed, "sha256") || POST_TRADE_STAGING_MIGRATION_EXPECTED_FINGERPRINT,
    fileByteLength: getNumber(parsed, "fileByteLength") || POST_TRADE_STAGING_MIGRATION_EXPECTED_NORMALIZED_LENGTH,
    normalizedSqlByteLength:
      getNumber(parsed, "normalizedSqlByteLength") || POST_TRADE_STAGING_MIGRATION_EXPECTED_NORMALIZED_LENGTH,
    symlinkStatus: getString(parsed, "symlinkStatus") === "symlink" ? "symlink" as const : "not_symlink" as const,
    regularFileStatus: getString(parsed, "regularFileStatus") === "not_regular_file" ? "not_regular_file" as const : "regular_file" as const,
  };
}

function parseInventory(value: string) {
  const parsed = parseJson(value);
  const filenames = getStringArray(parsed, "allMigrationFilenames");
  const timestamps = getStringArray(parsed, "orderedMigrationTimestamps");
  const duplicateNames = filenames.filter((item, index) => filenames.indexOf(item) !== index);
  const duplicateTimestamps = timestamps.filter((item, index) => timestamps.indexOf(item) !== index);
  return {
    allMigrationFilenames: filenames.length > 0 ? filenames : [POST_TRADE_STAGING_MIGRATION_FILENAME],
    orderedMigrationTimestamps: timestamps.length > 0 ? timestamps : [POST_TRADE_STAGING_MIGRATION_TIMESTAMP_PREFIX],
    targetMigrationPresence:
      filenames.filter((item) => item === POST_TRADE_STAGING_MIGRATION_FILENAME).length > 1
        ? "duplicate" as const
        : filenames.length > 0 && !filenames.includes(POST_TRADE_STAGING_MIGRATION_FILENAME)
          ? "missing" as const
          : "exactly_once" as const,
    duplicateTimestamps,
    duplicateNames,
    migrationsNewerThanTarget: getStringArray(parsed, "migrationsNewerThanTarget"),
    migrationsUnexpectedlyInsertedBeforeTarget: getStringArray(parsed, "migrationsUnexpectedlyInsertedBeforeTarget"),
    migrationCountInProposedDeploymentUnit: getNumber(parsed, "migrationCountInProposedDeploymentUnit") || 1,
    orderingClassification: duplicateNames.length || duplicateTimestamps.length ? "invalid" as const : "valid" as const,
  };
}

function mergeCatalog(results: readonly PostTradeReadOnlyLivePreflightCatalogAdapterResult[]) {
  return {
    targetRelationAbsent: results.every((item) => item.targetRelationAbsent !== false),
    conflictingRelationKind:
      results.find((item) => item.conflictingRelationKind && item.conflictingRelationKind !== "none")
        ?.conflictingRelationKind ?? "none",
    targetIndexesExist: results.some((item) => item.targetIndexesExist === true),
    targetPoliciesExist: results.some((item) => item.targetPoliciesExist === true),
    targetFunctionOrTriggerExists: results.some((item) => item.targetFunctionOrTriggerExists === true),
    referencedExecutionRecordsTableExists: !results.some((item) => item.referencedExecutionRecordsTableExists === false),
    referencedAuditEventsTableExists: !results.some((item) => item.referencedAuditEventsTableExists === false),
    referencedPrimaryKeyColumnsExist: !results.some((item) => item.referencedPrimaryKeyColumnsExist === false),
    referencedPrimaryKeyTypesMatchUuid: !results.some((item) => item.referencedPrimaryKeyTypesMatchUuid === false),
    referencedObjectsInPublicSchema: !results.some((item) => item.referencedObjectsInPublicSchema === false),
    uuidGenerationAvailable: !results.some((item) => item.uuidGenerationAvailable === false),
    anonGrantsClassification:
      results.find((item) => item.anonGrantsClassification && item.anonGrantsClassification !== "compatible")
        ?.anonGrantsClassification ?? "compatible",
    authenticatedGrantsClassification:
      results.find((item) => item.authenticatedGrantsClassification && item.authenticatedGrantsClassification !== "compatible")
        ?.authenticatedGrantsClassification ?? "compatible",
    schemaUsageContext:
      results.find((item) => item.schemaUsageContext && item.schemaUsageContext !== "compatible")
        ?.schemaUsageContext ?? "compatible",
    defaultPrivilegeObservations:
      results.find((item) => item.defaultPrivilegeObservations && item.defaultPrivilegeObservations !== "compatible")
        ?.defaultPrivilegeObservations ?? "compatible",
    expectedOwnershipContext:
      results.find((item) => item.expectedOwnershipContext && item.expectedOwnershipContext !== "compatible")
        ?.expectedOwnershipContext ?? "compatible",
    serviceRoleConsideration: "service_role_bypass_operational_risk_remains" as const,
    rlsCapabilityAvailability:
      results.find((item) => item.rlsCapabilityAvailability && item.rlsCapabilityAvailability !== "available")
        ?.rlsCapabilityAvailability ?? "available",
  };
}

function parseJson(value: string): Record<string, unknown> {
  try {
    const parsed = JSON.parse(value);
    return isRecord(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

function getString(value: Record<string, unknown>, key: string) {
  return typeof value[key] === "string" ? value[key] : "";
}

function getNumber(value: Record<string, unknown>, key: string) {
  return typeof value[key] === "number" ? value[key] : 0;
}

function getStringArray(value: Record<string, unknown>, key: string) {
  return Array.isArray(value[key]) && value[key].every((item) => typeof item === "string")
    ? value[key] as string[]
    : [];
}

function hasUnsafePath(value: string) {
  return value.startsWith("/") ||
    value.startsWith("./") ||
    value.startsWith("~") ||
    value.includes("..") ||
    value.includes("\\") ||
    value.includes('"') ||
    value.includes("'") ||
    value.includes("*") ||
    value.includes("?") ||
    /%2e|%2f|%5c/i.test(value) ||
    /[\u0000-\u001f\u007f\u2028\u2029]/.test(value);
}

function isSingleNonEmptyLine(value: unknown) {
  if (typeof value !== "string") return false;
  const lines = value.trim().split(/\n/);
  return lines.length === 1 && Boolean(lines[0]);
}
