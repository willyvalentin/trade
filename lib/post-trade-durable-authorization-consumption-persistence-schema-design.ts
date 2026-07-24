import {
  POST_TRADE_DURABLE_CONSUMPTION_CONTRACT_VERSION,
} from "@/lib/post-trade-durable-one-shot-authorization-consumption-contract";
import {
  POST_TRADE_FINAL_EXECUTION_SCOPE,
  POST_TRADE_FINAL_STAGING_PROJECT_REF,
  POST_TRADE_REJECTED_PRODUCTION_PROJECT_REF,
} from "@/lib/post-trade-final-staging-execution-gate-core";

export const POST_TRADE_AUTHORIZATION_CONSUMPTION_SCHEMA_DESIGN_VERSION =
  "post_trade_durable_authorization_consumption_persistence_schema_design_v1" as const;
export const POST_TRADE_AUTHORIZATION_CONSUMPTION_TABLE_NAME =
  "execution_authorization_consumptions" as const;

export type PostTradeSchemaTypeCategory =
  | "uuid"
  | "text"
  | "timestamp"
  | "integer"
  | "boolean"
  | "state_enum";

export type PostTradeColumnMutability =
  | "immutable_after_insert"
  | "atomic_consumption_only"
  | "database_managed";

export type PostTradeDesignedState = "unused" | "consumed" | "invalid" | "expired";

export type PostTradeStateTransitionRequirement = {
  from: "insert" | PostTradeDesignedState;
  to: PostTradeDesignedState;
  allowed: true;
  mutationBoundary:
    | "initial_authorization_seed"
    | "reviewed_atomic_consumption_function"
    | "reviewed_expiry_or_invalidation_function";
};

export type PostTradeColumnSpec = {
  name: string;
  typeCategory: PostTradeSchemaTypeCategory;
  nullable: boolean;
  defaultBehavior: "database_generated" | "fixed_literal" | "caller_provided" | "null_until_consumed";
  mutability: PostTradeColumnMutability;
};

export type PostTradeUniqueConstraintSpec = {
  id: string;
  columns: readonly string[];
  scope: "global" | "within_target_project";
  required: true;
};

export type PostTradeCheckConstraintSpec = {
  id: string;
  purpose:
    | "staging_target"
    | "production_rejection"
    | "state_allowed"
    | "consumed_at_state"
    | "execution_ids_state"
    | "result_state"
    | "affected_rows_one"
    | "persistence_operation_required"
    | "expiry_after_issued"
    | "bounded_validity"
    | "no_usable_reactivation"
    | "partial_evidence_prevention"
    | "one_shot_true"
    | "retry_false"
    | "mock_only_true"
    | "expected_counts"
    | "ordered_tables"
    | "audit_dependency"
    | "safety_capability_false";
  required: true;
};

export type PostTradeForeignKeyRequirement = {
  id: string;
  column: "execution_record_id" | "execution_audit_event_id";
  targetTable: "execution_records" | "execution_record_audit_events";
  targetColumn: "id";
  requiredWhenState: "consumed";
  onDelete: "restrict" | "no_action";
  deferrable: "transaction_scoped_if_needed";
  consistencyRequirement?: "audit_event_must_reference_execution_record";
};

export type PostTradeIndexRequirement = {
  id: string;
  columns: readonly string[];
  purpose: "lookup" | "read_back" | "replay_detection" | "expiry_sweep";
};

export type PostTradePrivilegeRequirement = {
  role: "anon" | "authenticated" | "service_role" | "reviewed_database_function";
  directInsertAllowed: boolean;
  directUpdateAllowed: boolean;
  directDeleteAllowed: boolean;
  directSelectAllowed: boolean;
  executeFunctionAllowed: boolean;
};

export type PostTradeRlsRequirement = {
  enabled: true;
  clientPoliciesAllowed: false;
  clientSelectPoliciesAllowed: false;
  serviceRoleBypassRiskAcceptedOnlyBehindFunction: true;
};

export type PostTradeTransactionFunctionRequirement = {
  required: true;
  stagingOnly: true;
  dynamicSqlAllowed: false;
  dynamicTableNamesAllowed: false;
  broadJsonInputAllowed: false;
  callerProvidedProductionTargetAllowed: false;
  partialCommitAllowed: false;
  retryLoopAllowed: false;
  applicationSequentialWritesAllowed: false;
  genericUpsertAllowed: false;
  mustAtomicallyConsumeAuthorization: true;
  mustInsertExecutionRecord: true;
  mustInsertAuditEvent: true;
  mustReturnStrictEvidence: true;
};

export type PostTradeMigrationPlan = {
  createsMigrationNow: false;
  target: "staging_only";
  createDedicatedTable: true;
  createConstraints: true;
  createIndexes: true;
  enableRls: true;
  revokeClientAccess: true;
  clientPolicyCreationAllowed: false;
  seedRows: false;
  seedAuthorizationRows: false;
  seedExecutionRows: false;
  createExecutionFunctionNow: false;
  productionDeploymentAllowed: false;
  rollbackRequired: true;
  destructiveRollbackWithRowsAllowed: false;
  cascadeRollbackAllowed: false;
  runtimeApiOrUiWiringAllowed: false;
};

export type PostTradeVerificationRequirement = {
  id: string;
  purpose:
    | "table_exists_staging_only"
    | "table_absent_production"
    | "columns_exact"
    | "data_types_exact"
    | "nullability_exact"
    | "unknown_columns_absent"
    | "constraints_present"
    | "uniqueness_present"
    | "indexes_present"
    | "rls_enabled"
    | "no_client_policies"
    | "no_client_grants"
    | "production_unchanged"
    | "zero_rows_after_migration"
    | "zero_authorization_rows"
    | "no_execution_records_created"
    | "no_audit_events_created"
    | "direct_client_insert_rejected"
    | "direct_client_update_rejected"
    | "direct_client_delete_rejected";
};

export type PostTradeAuthorizationConsumptionPersistenceSchemaDesign = {
  designVersion: typeof POST_TRADE_AUTHORIZATION_CONSUMPTION_SCHEMA_DESIGN_VERSION;
  tableName: typeof POST_TRADE_AUTHORIZATION_CONSUMPTION_TABLE_NAME;
  contractVersion: typeof POST_TRADE_DURABLE_CONSUMPTION_CONTRACT_VERSION;
  targetProjectRef: typeof POST_TRADE_FINAL_STAGING_PROJECT_REF;
  rejectedProductionProjectRef: typeof POST_TRADE_REJECTED_PRODUCTION_PROJECT_REF;
  executionScope: typeof POST_TRADE_FINAL_EXECUTION_SCOPE;
  allowedStates: readonly PostTradeDesignedState[];
  recommendedInitialState: "unused";
  persistAmbiguousState: false;
  allowedTransitions: readonly PostTradeStateTransitionRequirement[];
  columns: readonly PostTradeColumnSpec[];
  uniqueConstraints: readonly PostTradeUniqueConstraintSpec[];
  checkConstraints: readonly PostTradeCheckConstraintSpec[];
  foreignKeys: readonly PostTradeForeignKeyRequirement[];
  indexes: readonly PostTradeIndexRequirement[];
  rls: PostTradeRlsRequirement;
  privileges: readonly PostTradePrivilegeRequirement[];
  transactionFunction: PostTradeTransactionFunctionRequirement;
  migrationPlan: PostTradeMigrationPlan;
  verificationPlan: readonly PostTradeVerificationRequirement[];
  appendOnlyLedgerRecommendation: "not_initially_required";
};

const immutableIdentityColumns = [
  "authorization_artifact_id",
  "authorization_artifact_version",
  "authorization_fingerprint",
  "authorization_type",
  "source_action_identity",
  "execution_attempt_id",
  "execution_plan_id",
  "consumption_operation_id",
  "execution_scope",
  "target_project_id",
  "rejected_production_project_id",
  "execution_function_name",
  "execution_function_contract_version",
  "execution_function_implementation_decision",
  "execution_function_review_decision",
  "final_gate_identity",
  "final_gate_implementation_decision",
  "final_gate_review_decision",
  "expected_operation_count",
  "expected_row_count",
  "first_target_table",
  "second_target_table",
  "audit_dependency_identity",
  "mock_only",
  "one_shot",
  "retry_allowed",
  "issued_at",
  "expires_at",
  "staging_only",
  "server_only",
  "source_controlled",
  "execution_disabled_before_consumption",
  "production_access_allowed",
  "api_invocation_allowed",
  "ui_invocation_allowed",
  "client_invocation_allowed",
  "browser_automation_allowed",
  "broker_interaction_allowed",
  "avanza_interaction_allowed",
  "credential_handling_allowed",
  "session_handling_allowed",
  "bankid_handling_allowed",
  "migration_capability_allowed",
  "schema_mutation_allowed",
  "trade_mutation_allowed",
  "position_mutation_allowed",
  "order_mutation_allowed",
] as const;

const atomicConsumptionColumns = [
  "authorization_state",
  "consumed_at",
  "execution_record_id",
  "execution_audit_event_id",
  "affected_authorization_row_count",
  "persistence_operation_identity",
  "result_classification",
  "updated_at",
] as const;

const databaseManagedColumns = ["id", "created_at"] as const;

function column(
  name: string,
  typeCategory: PostTradeSchemaTypeCategory,
  nullable: boolean,
  defaultBehavior: PostTradeColumnSpec["defaultBehavior"],
  mutability: PostTradeColumnMutability,
): PostTradeColumnSpec {
  return { name, typeCategory, nullable, defaultBehavior, mutability };
}

export const POST_TRADE_AUTHORIZATION_CONSUMPTION_SCHEMA_DESIGN =
  {
    designVersion: POST_TRADE_AUTHORIZATION_CONSUMPTION_SCHEMA_DESIGN_VERSION,
    tableName: POST_TRADE_AUTHORIZATION_CONSUMPTION_TABLE_NAME,
    contractVersion: POST_TRADE_DURABLE_CONSUMPTION_CONTRACT_VERSION,
    targetProjectRef: POST_TRADE_FINAL_STAGING_PROJECT_REF,
    rejectedProductionProjectRef: POST_TRADE_REJECTED_PRODUCTION_PROJECT_REF,
    executionScope: POST_TRADE_FINAL_EXECUTION_SCOPE,
    allowedStates: ["unused", "consumed", "invalid", "expired"],
    recommendedInitialState: "unused",
    persistAmbiguousState: false,
    allowedTransitions: [
      {
        from: "insert",
        to: "unused",
        allowed: true,
        mutationBoundary: "initial_authorization_seed",
      },
      {
        from: "unused",
        to: "consumed",
        allowed: true,
        mutationBoundary: "reviewed_atomic_consumption_function",
      },
      {
        from: "unused",
        to: "invalid",
        allowed: true,
        mutationBoundary: "reviewed_expiry_or_invalidation_function",
      },
      {
        from: "unused",
        to: "expired",
        allowed: true,
        mutationBoundary: "reviewed_expiry_or_invalidation_function",
      },
    ],
    columns: [
      column("id", "uuid", false, "database_generated", "database_managed"),
      ...immutableIdentityColumns.map((name) =>
        column(
          name,
          name.endsWith("_count") ? "integer" : name.endsWith("_allowed") || ["mock_only", "one_shot", "retry_allowed", "staging_only", "server_only", "source_controlled", "execution_disabled_before_consumption"].includes(name) ? "boolean" : name.endsWith("_at") ? "timestamp" : "text",
          false,
          "caller_provided",
          "immutable_after_insert",
        ),
      ),
      column("authorization_state", "state_enum", false, "fixed_literal", "atomic_consumption_only"),
      column("consumed_at", "timestamp", true, "null_until_consumed", "atomic_consumption_only"),
      column("created_at", "timestamp", false, "database_generated", "database_managed"),
      column("updated_at", "timestamp", false, "database_generated", "atomic_consumption_only"),
      column("execution_record_id", "uuid", true, "null_until_consumed", "atomic_consumption_only"),
      column("execution_audit_event_id", "uuid", true, "null_until_consumed", "atomic_consumption_only"),
      column("affected_authorization_row_count", "integer", true, "null_until_consumed", "atomic_consumption_only"),
      column("persistence_operation_identity", "text", true, "null_until_consumed", "atomic_consumption_only"),
      column("result_classification", "text", true, "null_until_consumed", "atomic_consumption_only"),
    ],
    uniqueConstraints: [
      { id: "uniq_authorization_artifact_id", columns: ["target_project_id", "authorization_artifact_id"], scope: "within_target_project", required: true },
      { id: "uniq_authorization_fingerprint", columns: ["target_project_id", "authorization_fingerprint"], scope: "within_target_project", required: true },
      { id: "uniq_execution_attempt_id", columns: ["target_project_id", "execution_attempt_id"], scope: "within_target_project", required: true },
      { id: "uniq_execution_plan_id", columns: ["target_project_id", "execution_plan_id"], scope: "within_target_project", required: true },
      { id: "uniq_consumption_operation_id", columns: ["target_project_id", "consumption_operation_id"], scope: "within_target_project", required: true },
      { id: "uniq_artifact_plan_pair", columns: ["target_project_id", "authorization_artifact_id", "execution_plan_id"], scope: "within_target_project", required: true },
    ],
    checkConstraints: [
      { id: "chk_target_project_is_staging", purpose: "staging_target", required: true },
      { id: "chk_rejected_production_marker_only", purpose: "production_rejection", required: true },
      { id: "chk_state_allowed", purpose: "state_allowed", required: true },
      { id: "chk_consumed_at_matches_state", purpose: "consumed_at_state", required: true },
      { id: "chk_execution_ids_match_state", purpose: "execution_ids_state", required: true },
      { id: "chk_result_matches_state", purpose: "result_state", required: true },
      { id: "chk_affected_rows_one", purpose: "affected_rows_one", required: true },
      { id: "chk_persistence_operation_required", purpose: "persistence_operation_required", required: true },
      { id: "chk_expiry_after_issued", purpose: "expiry_after_issued", required: true },
      { id: "chk_validity_window_bounded", purpose: "bounded_validity", required: true },
      { id: "chk_no_usable_reactivation", purpose: "no_usable_reactivation", required: true },
      { id: "chk_partial_evidence_prevention", purpose: "partial_evidence_prevention", required: true },
      { id: "chk_one_shot_true", purpose: "one_shot_true", required: true },
      { id: "chk_retry_false", purpose: "retry_false", required: true },
      { id: "chk_mock_only_true", purpose: "mock_only_true", required: true },
      { id: "chk_expected_counts", purpose: "expected_counts", required: true },
      { id: "chk_ordered_tables", purpose: "ordered_tables", required: true },
      { id: "chk_audit_dependency", purpose: "audit_dependency", required: true },
      { id: "chk_safety_capabilities_false", purpose: "safety_capability_false", required: true },
    ],
    foreignKeys: [
      {
        id: "fk_consumption_execution_record",
        column: "execution_record_id",
        targetTable: "execution_records",
        targetColumn: "id",
        requiredWhenState: "consumed",
        onDelete: "restrict",
        deferrable: "transaction_scoped_if_needed",
      },
      {
        id: "fk_consumption_audit_event",
        column: "execution_audit_event_id",
        targetTable: "execution_record_audit_events",
        targetColumn: "id",
        requiredWhenState: "consumed",
        onDelete: "restrict",
        deferrable: "transaction_scoped_if_needed",
        consistencyRequirement: "audit_event_must_reference_execution_record",
      },
    ],
    indexes: [
      { id: "idx_consumption_artifact_lookup", columns: ["target_project_id", "authorization_artifact_id"], purpose: "lookup" },
      { id: "idx_consumption_read_back", columns: ["target_project_id", "authorization_artifact_id", "authorization_fingerprint", "execution_attempt_id", "execution_plan_id", "consumption_operation_id"], purpose: "read_back" },
      { id: "idx_consumption_replay_detection", columns: ["target_project_id", "execution_attempt_id", "consumption_operation_id"], purpose: "replay_detection" },
      { id: "idx_consumption_expiry", columns: ["authorization_state", "expires_at"], purpose: "expiry_sweep" },
    ],
    rls: {
      enabled: true,
      clientPoliciesAllowed: false,
      clientSelectPoliciesAllowed: false,
      serviceRoleBypassRiskAcceptedOnlyBehindFunction: true,
    },
    privileges: [
      {
        role: "anon",
        directInsertAllowed: false,
        directUpdateAllowed: false,
        directDeleteAllowed: false,
        directSelectAllowed: false,
        executeFunctionAllowed: false,
      },
      {
        role: "authenticated",
        directInsertAllowed: false,
        directUpdateAllowed: false,
        directDeleteAllowed: false,
        directSelectAllowed: false,
        executeFunctionAllowed: false,
      },
      {
        role: "service_role",
        directInsertAllowed: false,
        directUpdateAllowed: false,
        directDeleteAllowed: false,
        directSelectAllowed: true,
        executeFunctionAllowed: false,
      },
      {
        role: "reviewed_database_function",
        directInsertAllowed: true,
        directUpdateAllowed: true,
        directDeleteAllowed: false,
        directSelectAllowed: true,
        executeFunctionAllowed: true,
      },
    ],
    transactionFunction: {
      required: true,
      stagingOnly: true,
      dynamicSqlAllowed: false,
      dynamicTableNamesAllowed: false,
      broadJsonInputAllowed: false,
      callerProvidedProductionTargetAllowed: false,
      partialCommitAllowed: false,
      retryLoopAllowed: false,
      applicationSequentialWritesAllowed: false,
      genericUpsertAllowed: false,
      mustAtomicallyConsumeAuthorization: true,
      mustInsertExecutionRecord: true,
      mustInsertAuditEvent: true,
      mustReturnStrictEvidence: true,
    },
    migrationPlan: {
      createsMigrationNow: false,
      target: "staging_only",
      createDedicatedTable: true,
      createConstraints: true,
      createIndexes: true,
      enableRls: true,
      revokeClientAccess: true,
      clientPolicyCreationAllowed: false,
      seedRows: false,
      seedAuthorizationRows: false,
      seedExecutionRows: false,
      createExecutionFunctionNow: false,
      productionDeploymentAllowed: false,
      rollbackRequired: true,
      destructiveRollbackWithRowsAllowed: false,
      cascadeRollbackAllowed: false,
      runtimeApiOrUiWiringAllowed: false,
    },
    verificationPlan: [
      { id: "verify_table_exists_staging_only", purpose: "table_exists_staging_only" },
      { id: "verify_table_absent_production", purpose: "table_absent_production" },
      { id: "verify_columns_exact", purpose: "columns_exact" },
      { id: "verify_data_types_exact", purpose: "data_types_exact" },
      { id: "verify_nullability_exact", purpose: "nullability_exact" },
      { id: "verify_unknown_columns_absent", purpose: "unknown_columns_absent" },
      { id: "verify_constraints_present", purpose: "constraints_present" },
      { id: "verify_uniqueness_present", purpose: "uniqueness_present" },
      { id: "verify_indexes_present", purpose: "indexes_present" },
      { id: "verify_rls_enabled", purpose: "rls_enabled" },
      { id: "verify_no_client_policies", purpose: "no_client_policies" },
      { id: "verify_no_client_grants", purpose: "no_client_grants" },
      { id: "verify_production_unchanged", purpose: "production_unchanged" },
      { id: "verify_zero_rows_after_migration", purpose: "zero_rows_after_migration" },
      { id: "verify_zero_authorization_rows", purpose: "zero_authorization_rows" },
      { id: "verify_no_execution_records_created", purpose: "no_execution_records_created" },
      { id: "verify_no_audit_events_created", purpose: "no_audit_events_created" },
      { id: "verify_direct_client_insert_rejected", purpose: "direct_client_insert_rejected" },
      { id: "verify_direct_client_update_rejected", purpose: "direct_client_update_rejected" },
      { id: "verify_direct_client_delete_rejected", purpose: "direct_client_delete_rejected" },
    ],
    appendOnlyLedgerRecommendation: "not_initially_required",
  } as const satisfies PostTradeAuthorizationConsumptionPersistenceSchemaDesign;

export type PostTradePersistenceSchemaDesignValidation = {
  valid: boolean;
  blockingReasons: string[];
};

const requiredColumnNames = [
  ...databaseManagedColumns,
  ...immutableIdentityColumns,
  ...atomicConsumptionColumns,
] as const;

const nonNullableUniqueIdentityColumns = [
  "target_project_id",
  "authorization_artifact_id",
  "authorization_fingerprint",
  "execution_attempt_id",
  "execution_plan_id",
  "consumption_operation_id",
] as const;

const requiredUniqueColumns = {
  uniq_authorization_artifact_id: ["target_project_id", "authorization_artifact_id"],
  uniq_authorization_fingerprint: ["target_project_id", "authorization_fingerprint"],
  uniq_execution_attempt_id: ["target_project_id", "execution_attempt_id"],
  uniq_execution_plan_id: ["target_project_id", "execution_plan_id"],
  uniq_consumption_operation_id: ["target_project_id", "consumption_operation_id"],
  uniq_artifact_plan_pair: [
    "target_project_id",
    "authorization_artifact_id",
    "execution_plan_id",
  ],
} as const;

const requiredTransitionSignatures = [
  "insert->unused:initial_authorization_seed",
  "unused->consumed:reviewed_atomic_consumption_function",
  "unused->invalid:reviewed_expiry_or_invalidation_function",
  "unused->expired:reviewed_expiry_or_invalidation_function",
] as const;

function transitionSignature(transition: PostTradeStateTransitionRequirement) {
  return `${transition.from}->${transition.to}:${transition.mutationBoundary}`;
}

function hasExactStringSet(actual: readonly string[], expected: readonly string[]) {
  const sortedActual = [...actual].sort();
  const sortedExpected = [...expected].sort();
  return (
    sortedActual.length === sortedExpected.length &&
    sortedActual.every((value, index) => value === sortedExpected[index])
  );
}

export function validatePostTradeAuthorizationConsumptionPersistenceSchemaDesign(
  design: unknown,
): PostTradePersistenceSchemaDesignValidation {
  const blockingReasons: string[] = [];
  if (!design || typeof design !== "object" || Array.isArray(design)) {
    return { valid: false, blockingReasons: ["design:required"] };
  }

  const candidate =
    design as Partial<PostTradeAuthorizationConsumptionPersistenceSchemaDesign>;

  if (candidate.tableName !== POST_TRADE_AUTHORIZATION_CONSUMPTION_TABLE_NAME) {
    blockingReasons.push("tableName:exact_required");
  }
  if (candidate.targetProjectRef !== POST_TRADE_FINAL_STAGING_PROJECT_REF) {
    blockingReasons.push("targetProjectRef:staging_required");
  }
  if (candidate.rejectedProductionProjectRef !== POST_TRADE_REJECTED_PRODUCTION_PROJECT_REF) {
    blockingReasons.push("rejectedProductionProjectRef:required");
  }
  if (candidate.persistAmbiguousState !== false) {
    blockingReasons.push("state:ambiguous_not_persisted");
  }
  if (!hasExactStringSet(candidate.allowedStates ?? [], ["unused", "consumed", "invalid", "expired"])) {
    blockingReasons.push("state:allowed_states_mismatch");
  }
  const transitionSignatures = (candidate.allowedTransitions ?? []).map(
    transitionSignature,
  );
  if (!hasExactStringSet(transitionSignatures, requiredTransitionSignatures)) {
    blockingReasons.push("state:transition_model_mismatch");
  }

  const columns = candidate.columns ?? [];
  const columnNames = columns.map((item) => item.name);
  if (!hasExactStringSet(columnNames, requiredColumnNames)) {
    blockingReasons.push("columns:exact_inventory_required");
  }
  const columnByName = new Map(columns.map((item) => [item.name, item]));

  for (const name of immutableIdentityColumns) {
    if (columnByName.get(name)?.mutability !== "immutable_after_insert") {
      blockingReasons.push(`column.${name}:immutable_required`);
    }
  }
  for (const name of atomicConsumptionColumns) {
    if (columnByName.get(name)?.mutability !== "atomic_consumption_only") {
      blockingReasons.push(`column.${name}:atomic_consumption_only_required`);
    }
  }
  for (const name of databaseManagedColumns) {
    if (columnByName.get(name)?.mutability !== "database_managed") {
      blockingReasons.push(`column.${name}:database_managed_required`);
    }
  }
  if (columnByName.get("consumed_at")?.nullable !== true) {
    blockingReasons.push("column.consumed_at:null_until_consumed_required");
  }
  if (columnByName.get("execution_record_id")?.nullable !== true) {
    blockingReasons.push("column.execution_record_id:null_until_consumed_required");
  }
  if (columnByName.get("execution_audit_event_id")?.nullable !== true) {
    blockingReasons.push("column.execution_audit_event_id:null_until_consumed_required");
  }
  if (columnByName.get("authorization_artifact_id")?.typeCategory !== "text") {
    blockingReasons.push("column.authorization_artifact_id:text_required");
  }
  for (const name of nonNullableUniqueIdentityColumns) {
    if (columnByName.get(name)?.nullable !== false) {
      blockingReasons.push(`column.${name}:non_nullable_unique_identity_required`);
    }
  }

  const uniqueById = new Map(
    (candidate.uniqueConstraints ?? []).map((item) => [item.id, item]),
  );
  for (const [id, columns] of Object.entries(requiredUniqueColumns)) {
    const unique = uniqueById.get(id);
    if (!unique) {
      blockingReasons.push(`unique.${id}:required`);
      continue;
    }
    if (unique.scope !== "within_target_project") {
      blockingReasons.push(`unique.${id}:staging_scope_required`);
    }
    if (!hasExactStringSet(unique.columns, columns)) {
      blockingReasons.push(`unique.${id}:exact_columns_required`);
    }
  }

  const checkPurposes = new Set((candidate.checkConstraints ?? []).map((item) => item.purpose));
  for (const purpose of [
    "staging_target",
    "production_rejection",
    "state_allowed",
    "consumed_at_state",
    "execution_ids_state",
    "result_state",
    "affected_rows_one",
    "persistence_operation_required",
    "expiry_after_issued",
    "bounded_validity",
    "no_usable_reactivation",
    "partial_evidence_prevention",
    "one_shot_true",
    "retry_false",
    "mock_only_true",
    "expected_counts",
    "ordered_tables",
    "audit_dependency",
    "safety_capability_false",
  ]) {
    if (!checkPurposes.has(purpose as PostTradeCheckConstraintSpec["purpose"])) {
      blockingReasons.push(`check.${purpose}:required`);
    }
  }

  const foreignKeysById = new Map(
    (candidate.foreignKeys ?? []).map((item) => [item.id, item]),
  );
  const executionRecordFk = foreignKeysById.get("fk_consumption_execution_record");
  const auditEventFk = foreignKeysById.get("fk_consumption_audit_event");
  if (!executionRecordFk) {
    blockingReasons.push("foreignKey.execution_record:required");
  } else if (
    executionRecordFk.onDelete !== "restrict" &&
    executionRecordFk.onDelete !== "no_action"
  ) {
    blockingReasons.push("foreignKey.execution_record:no_cascade_required");
  }
  if (!auditEventFk) {
    blockingReasons.push("foreignKey.audit_event:required");
  } else if (
    auditEventFk.onDelete !== "restrict" &&
    auditEventFk.onDelete !== "no_action"
  ) {
    blockingReasons.push("foreignKey.audit_event:no_cascade_required");
  }
  if (
    auditEventFk?.consistencyRequirement !==
    "audit_event_must_reference_execution_record"
  ) {
    blockingReasons.push("foreignKey.audit_event:execution_record_consistency_required");
  }

  if (candidate.rls?.enabled !== true) blockingReasons.push("rls:enabled_required");
  if (candidate.rls?.clientPoliciesAllowed !== false) {
    blockingReasons.push("rls:no_client_policies_required");
  }
  if (candidate.rls?.clientSelectPoliciesAllowed !== false) {
    blockingReasons.push("rls:no_client_select_policies_required");
  }
  if (candidate.rls?.serviceRoleBypassRiskAcceptedOnlyBehindFunction !== true) {
    blockingReasons.push("rls:service_role_function_boundary_required");
  }

  for (const role of ["anon", "authenticated"] as const) {
    const privilege = (candidate.privileges ?? []).find((item) => item.role === role);
    if (
      !privilege ||
      privilege.directInsertAllowed ||
      privilege.directUpdateAllowed ||
      privilege.directDeleteAllowed ||
      privilege.directSelectAllowed ||
      privilege.executeFunctionAllowed
    ) {
      blockingReasons.push(`privilege.${role}:client_access_denied_required`);
    }
  }
  const serviceRole = (candidate.privileges ?? []).find(
    (item) => item.role === "service_role",
  );
  if (
    !serviceRole ||
    serviceRole.directInsertAllowed ||
    serviceRole.directUpdateAllowed ||
    serviceRole.directDeleteAllowed
  ) {
    blockingReasons.push("privilege.service_role:direct_mutation_denied_required");
  }

  const tx = candidate.transactionFunction;
  if (!tx?.required) blockingReasons.push("function:required");
  if (tx?.stagingOnly !== true) blockingReasons.push("function:staging_only_required");
  if (tx?.dynamicSqlAllowed !== false) blockingReasons.push("function:no_dynamic_sql_required");
  if (tx?.dynamicTableNamesAllowed !== false) blockingReasons.push("function:no_dynamic_tables_required");
  if (tx?.broadJsonInputAllowed !== false) blockingReasons.push("function:no_broad_json_required");
  if (tx?.partialCommitAllowed !== false) blockingReasons.push("function:no_partial_commit_required");
  if (tx?.retryLoopAllowed !== false) blockingReasons.push("function:no_retry_loop_required");
  if (tx?.applicationSequentialWritesAllowed !== false) {
    blockingReasons.push("function:no_application_sequential_writes_required");
  }
  if (tx?.genericUpsertAllowed !== false) {
    blockingReasons.push("function:no_generic_upsert_required");
  }
  if (tx?.mustAtomicallyConsumeAuthorization !== true) {
    blockingReasons.push("function:atomic_consumption_required");
  }
  if (tx?.mustInsertExecutionRecord !== true || tx?.mustInsertAuditEvent !== true) {
    blockingReasons.push("function:both_execution_rows_required");
  }

  const migration = candidate.migrationPlan;
  if (migration?.createsMigrationNow !== false) blockingReasons.push("migration:no_file_now_required");
  if (migration?.target !== "staging_only") blockingReasons.push("migration:staging_only_required");
  if (migration?.seedRows !== false) blockingReasons.push("migration:no_seed_rows_required");
  if (migration?.seedAuthorizationRows !== false) {
    blockingReasons.push("migration:no_authorization_rows_required");
  }
  if (migration?.seedExecutionRows !== false) {
    blockingReasons.push("migration:no_execution_rows_required");
  }
  if (migration?.productionDeploymentAllowed !== false) {
    blockingReasons.push("migration:production_blocked_required");
  }
  if (migration?.rollbackRequired !== true) blockingReasons.push("migration:rollback_required");
  if (migration?.destructiveRollbackWithRowsAllowed !== false) {
    blockingReasons.push("migration:no_destructive_rollback_with_rows_required");
  }
  if (migration?.cascadeRollbackAllowed !== false) {
    blockingReasons.push("migration:no_cascade_rollback_required");
  }
  if (migration?.runtimeApiOrUiWiringAllowed !== false) {
    blockingReasons.push("migration:no_runtime_wiring_required");
  }

  const verificationPurposes = new Set((candidate.verificationPlan ?? []).map((item) => item.purpose));
  for (const purpose of [
    "table_absent_production",
    "unknown_columns_absent",
    "data_types_exact",
    "nullability_exact",
    "zero_rows_after_migration",
    "zero_authorization_rows",
    "no_execution_records_created",
    "no_audit_events_created",
    "rls_enabled",
    "no_client_grants",
    "production_unchanged",
    "direct_client_insert_rejected",
    "direct_client_update_rejected",
    "direct_client_delete_rejected",
  ]) {
    if (!verificationPurposes.has(purpose as PostTradeVerificationRequirement["purpose"])) {
      blockingReasons.push(`verification.${purpose}:required`);
    }
  }

  return {
    valid: blockingReasons.length === 0,
    blockingReasons,
  };
}
