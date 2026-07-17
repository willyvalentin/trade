import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  POST_TRADE_AUTHORIZATION_CONSUMPTION_SCHEMA_DESIGN,
  POST_TRADE_AUTHORIZATION_CONSUMPTION_TABLE_NAME,
  validatePostTradeAuthorizationConsumptionPersistenceSchemaDesign,
  type PostTradeAuthorizationConsumptionPersistenceSchemaDesign,
} from "../../lib/post-trade-durable-authorization-consumption-persistence-schema-design";
import {
  POST_TRADE_FINAL_STAGING_PROJECT_REF,
  POST_TRADE_REJECTED_PRODUCTION_PROJECT_REF,
} from "../../lib/post-trade-final-staging-execution-gate-core";

function design(
  overrides: Partial<PostTradeAuthorizationConsumptionPersistenceSchemaDesign> = {},
) {
  return {
    ...POST_TRADE_AUTHORIZATION_CONSUMPTION_SCHEMA_DESIGN,
    ...overrides,
  };
}

function expectInvalid(candidate: unknown) {
  expect(
    validatePostTradeAuthorizationConsumptionPersistenceSchemaDesign(candidate)
      .valid,
  ).toBe(false);
}

function withColumn(
  columnName: string,
  patch: Record<string, unknown>,
): PostTradeAuthorizationConsumptionPersistenceSchemaDesign["columns"] {
  return POST_TRADE_AUTHORIZATION_CONSUMPTION_SCHEMA_DESIGN.columns.map(
    (column) => (column.name === columnName ? { ...column, ...patch } : column),
  );
}

test.describe("post-trade durable authorization consumption persistence schema design", () => {
  test("canonical schema specification is valid and table identity is exact", () => {
    const validation =
      validatePostTradeAuthorizationConsumptionPersistenceSchemaDesign(
        POST_TRADE_AUTHORIZATION_CONSUMPTION_SCHEMA_DESIGN,
      );

    expect(validation.valid).toBe(true);
    expect(POST_TRADE_AUTHORIZATION_CONSUMPTION_SCHEMA_DESIGN.tableName).toBe(
      POST_TRADE_AUTHORIZATION_CONSUMPTION_TABLE_NAME,
    );
    expect(POST_TRADE_AUTHORIZATION_CONSUMPTION_SCHEMA_DESIGN.targetProjectRef).toBe(
      POST_TRADE_FINAL_STAGING_PROJECT_REF,
    );
    expect(
      POST_TRADE_AUTHORIZATION_CONSUMPTION_SCHEMA_DESIGN.rejectedProductionProjectRef,
    ).toBe(POST_TRADE_REJECTED_PRODUCTION_PROJECT_REF);
    expect(POST_TRADE_AUTHORIZATION_CONSUMPTION_SCHEMA_DESIGN.persistAmbiguousState).toBe(false);
    expect(
      POST_TRADE_AUTHORIZATION_CONSUMPTION_SCHEMA_DESIGN.allowedTransitions.map(
        (transition) =>
          `${transition.from}->${transition.to}:${transition.mutationBoundary}`,
      ),
    ).toEqual([
      "insert->unused:initial_authorization_seed",
      "unused->consumed:reviewed_atomic_consumption_function",
      "unused->invalid:reviewed_expiry_or_invalidation_function",
      "unused->expired:reviewed_expiry_or_invalidation_function",
    ]);
  });

  test("required identity lifecycle evidence and safety columns exist with correct mutability", () => {
    const columns = new Map(
      POST_TRADE_AUTHORIZATION_CONSUMPTION_SCHEMA_DESIGN.columns.map((column) => [
        column.name,
        column,
      ]),
    );

    for (const column of [
      "authorization_artifact_id",
      "authorization_artifact_version",
      "authorization_fingerprint",
      "execution_attempt_id",
      "execution_plan_id",
      "consumption_operation_id",
      "execution_scope",
      "target_project_id",
      "execution_function_name",
      "final_gate_identity",
      "expected_operation_count",
      "expected_row_count",
      "first_target_table",
      "second_target_table",
      "audit_dependency_identity",
      "one_shot",
      "retry_allowed",
      "mock_only",
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
      "trade_mutation_allowed",
      "position_mutation_allowed",
      "order_mutation_allowed",
    ]) {
      expect(columns.get(column)?.mutability).toBe("immutable_after_insert");
    }

    for (const column of [
      "authorization_state",
      "consumed_at",
      "execution_record_id",
      "execution_audit_event_id",
      "affected_authorization_row_count",
      "persistence_operation_identity",
      "result_classification",
    ]) {
      expect(columns.get(column)?.mutability).toBe("atomic_consumption_only");
    }

    expect(columns.get("consumed_at")?.nullable).toBe(true);
    expect(columns.get("execution_record_id")?.nullable).toBe(true);
    expect(columns.get("execution_audit_event_id")?.nullable).toBe(true);
  });

  test("uniqueness constraints prevent duplicate artifacts attempts plans and operation ids", () => {
    const uniqueIds = new Set(
      POST_TRADE_AUTHORIZATION_CONSUMPTION_SCHEMA_DESIGN.uniqueConstraints.map(
        (constraint) => constraint.id,
      ),
    );

    expect(uniqueIds).toEqual(
      new Set([
        "uniq_authorization_artifact_id",
        "uniq_authorization_fingerprint",
        "uniq_execution_attempt_id",
        "uniq_execution_plan_id",
        "uniq_consumption_operation_id",
        "uniq_artifact_plan_pair",
      ]),
    );
    for (const constraint of POST_TRADE_AUTHORIZATION_CONSUMPTION_SCHEMA_DESIGN.uniqueConstraints) {
      expect(constraint.scope).toBe("within_target_project");
      expect(constraint.columns[0]).toBe("target_project_id");
    }
  });

  test("check constraints pin staging production state timestamps counts table order audit dependency and safety markers", () => {
    const purposes = new Set(
      POST_TRADE_AUTHORIZATION_CONSUMPTION_SCHEMA_DESIGN.checkConstraints.map(
        (constraint) => constraint.purpose,
      ),
    );

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
      expect(purposes.has(purpose as never)).toBe(true);
    }
  });

  test("foreign keys preserve execution record and dependent audit event evidence", () => {
    expect(POST_TRADE_AUTHORIZATION_CONSUMPTION_SCHEMA_DESIGN.foreignKeys).toEqual([
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
    ]);
  });

  test("RLS privileges and function boundary prohibit client access direct mutation dynamic SQL partial commits and retry loops", () => {
    const designSpec = POST_TRADE_AUTHORIZATION_CONSUMPTION_SCHEMA_DESIGN;
    const anon = designSpec.privileges.find((item) => item.role === "anon");
    const authenticated = designSpec.privileges.find(
      (item) => item.role === "authenticated",
    );
    const serviceRole = designSpec.privileges.find(
      (item) => item.role === "service_role",
    );

    expect(designSpec.rls.enabled).toBe(true);
    expect(designSpec.rls.clientPoliciesAllowed).toBe(false);
    expect(designSpec.rls.clientSelectPoliciesAllowed).toBe(false);
    expect(anon?.directInsertAllowed).toBe(false);
    expect(anon?.directUpdateAllowed).toBe(false);
    expect(anon?.directDeleteAllowed).toBe(false);
    expect(authenticated?.directInsertAllowed).toBe(false);
    expect(authenticated?.directUpdateAllowed).toBe(false);
    expect(authenticated?.directDeleteAllowed).toBe(false);
    expect(serviceRole?.directInsertAllowed).toBe(false);
    expect(serviceRole?.directUpdateAllowed).toBe(false);
    expect(serviceRole?.directDeleteAllowed).toBe(false);
    expect(designSpec.transactionFunction.required).toBe(true);
    expect(designSpec.transactionFunction.stagingOnly).toBe(true);
    expect(designSpec.transactionFunction.dynamicSqlAllowed).toBe(false);
    expect(designSpec.transactionFunction.partialCommitAllowed).toBe(false);
    expect(designSpec.transactionFunction.retryLoopAllowed).toBe(false);
    expect(designSpec.transactionFunction.applicationSequentialWritesAllowed).toBe(false);
    expect(designSpec.transactionFunction.genericUpsertAllowed).toBe(false);
  });

  test("migration and verification plans are staging-only no-row no-production plans", () => {
    const migration = POST_TRADE_AUTHORIZATION_CONSUMPTION_SCHEMA_DESIGN.migrationPlan;
    const verificationPurposes = new Set(
      POST_TRADE_AUTHORIZATION_CONSUMPTION_SCHEMA_DESIGN.verificationPlan.map(
        (item) => item.purpose,
      ),
    );

    expect(migration.createsMigrationNow).toBe(false);
    expect(migration.target).toBe("staging_only");
    expect(migration.seedRows).toBe(false);
    expect(migration.seedAuthorizationRows).toBe(false);
    expect(migration.seedExecutionRows).toBe(false);
    expect(migration.productionDeploymentAllowed).toBe(false);
    expect(migration.rollbackRequired).toBe(true);
    expect(migration.destructiveRollbackWithRowsAllowed).toBe(false);
    expect(migration.cascadeRollbackAllowed).toBe(false);
    expect(migration.runtimeApiOrUiWiringAllowed).toBe(false);
    expect(verificationPurposes.has("table_absent_production")).toBe(true);
    expect(verificationPurposes.has("unknown_columns_absent")).toBe(true);
    expect(verificationPurposes.has("data_types_exact")).toBe(true);
    expect(verificationPurposes.has("nullability_exact")).toBe(true);
    expect(verificationPurposes.has("zero_rows_after_migration")).toBe(true);
    expect(verificationPurposes.has("zero_authorization_rows")).toBe(true);
    expect(verificationPurposes.has("no_execution_records_created")).toBe(true);
    expect(verificationPurposes.has("no_audit_events_created")).toBe(true);
    expect(verificationPurposes.has("rls_enabled")).toBe(true);
    expect(verificationPurposes.has("no_client_grants")).toBe(true);
    expect(verificationPurposes.has("production_unchanged")).toBe(true);
    expect(verificationPurposes.has("direct_client_insert_rejected")).toBe(true);
    expect(verificationPurposes.has("direct_client_update_rejected")).toBe(true);
    expect(verificationPurposes.has("direct_client_delete_rejected")).toBe(true);
  });

  test("validator rejects unknown or missing columns altered type nullability and mutability weakening", () => {
    const withoutColumn = design({
      columns: POST_TRADE_AUTHORIZATION_CONSUMPTION_SCHEMA_DESIGN.columns.filter(
        (column) => column.name !== "authorization_artifact_id",
      ),
    });
    const withUnknownColumn = design({
      columns: [
        ...POST_TRADE_AUTHORIZATION_CONSUMPTION_SCHEMA_DESIGN.columns,
        {
          name: "arbitrary_metadata",
          typeCategory: "text",
          nullable: true,
          defaultBehavior: "caller_provided",
          mutability: "atomic_consumption_only",
        },
      ],
    } as never);
    const alteredType = design({
      columns: POST_TRADE_AUTHORIZATION_CONSUMPTION_SCHEMA_DESIGN.columns.map(
        (column) =>
          column.name === "authorization_artifact_id"
            ? { ...column, typeCategory: "uuid" as const }
            : column,
      ),
    });
    const alteredNullability = design({
      columns: POST_TRADE_AUTHORIZATION_CONSUMPTION_SCHEMA_DESIGN.columns.map(
        (column) =>
          column.name === "consumed_at" ? { ...column, nullable: false } : column,
      ),
    });
    const alteredMutability = design({
      columns: POST_TRADE_AUTHORIZATION_CONSUMPTION_SCHEMA_DESIGN.columns.map(
        (column) =>
          column.name === "authorization_fingerprint"
            ? { ...column, mutability: "atomic_consumption_only" as const }
            : column,
      ),
    });

    for (const candidate of [
      withoutColumn,
      withUnknownColumn,
      alteredType,
      alteredNullability,
      alteredMutability,
    ]) {
      expectInvalid(candidate);
    }
  });

  test("validator rejects weakened uniqueness checks staging production state counts table order audit foreign keys and privileges", () => {
    const cases = [
      design({ uniqueConstraints: [] }),
      design({ checkConstraints: [] }),
      design({ foreignKeys: [] }),
      design({ targetProjectRef: POST_TRADE_REJECTED_PRODUCTION_PROJECT_REF as never }),
      design({ rejectedProductionProjectRef: "missing" as never }),
      design({ allowedStates: ["unused", "consumed", "ambiguous"] as never }),
      design({ persistAmbiguousState: true as never }),
      design({
        rls: {
          ...POST_TRADE_AUTHORIZATION_CONSUMPTION_SCHEMA_DESIGN.rls,
          enabled: false as never,
        },
      }),
      design({
        rls: {
          ...POST_TRADE_AUTHORIZATION_CONSUMPTION_SCHEMA_DESIGN.rls,
          clientPoliciesAllowed: true as never,
        },
      }),
      design({
        privileges: POST_TRADE_AUTHORIZATION_CONSUMPTION_SCHEMA_DESIGN.privileges.map(
          (privilege) =>
            privilege.role === "authenticated"
              ? { ...privilege, directInsertAllowed: true }
              : privilege,
        ),
      }),
      design({
        privileges: POST_TRADE_AUTHORIZATION_CONSUMPTION_SCHEMA_DESIGN.privileges.map(
          (privilege) =>
            privilege.role === "service_role"
              ? { ...privilege, directUpdateAllowed: true }
              : privilege,
        ),
      }),
      design({
        transactionFunction: {
          ...POST_TRADE_AUTHORIZATION_CONSUMPTION_SCHEMA_DESIGN.transactionFunction,
          dynamicSqlAllowed: true as never,
        },
      }),
      design({
        transactionFunction: {
          ...POST_TRADE_AUTHORIZATION_CONSUMPTION_SCHEMA_DESIGN.transactionFunction,
          partialCommitAllowed: true as never,
        },
      }),
      design({
        migrationPlan: {
          ...POST_TRADE_AUTHORIZATION_CONSUMPTION_SCHEMA_DESIGN.migrationPlan,
          seedRows: true as never,
        },
      }),
      design({
        migrationPlan: {
          ...POST_TRADE_AUTHORIZATION_CONSUMPTION_SCHEMA_DESIGN.migrationPlan,
          productionDeploymentAllowed: true as never,
        },
      }),
      design({ verificationPlan: [] }),
    ];

    for (const candidate of cases) {
      expectInvalid(candidate);
    }
  });

  test("validator rejects nullable critical identities and weakened unique constraint shapes", () => {
    for (const column of [
      "authorization_artifact_id",
      "authorization_fingerprint",
      "execution_attempt_id",
      "execution_plan_id",
      "consumption_operation_id",
    ]) {
      expectInvalid(design({ columns: withColumn(column, { nullable: true }) }));
    }

    expectInvalid(
      design({
        uniqueConstraints:
          POST_TRADE_AUTHORIZATION_CONSUMPTION_SCHEMA_DESIGN.uniqueConstraints.filter(
            (constraint) => constraint.id !== "uniq_authorization_artifact_id",
          ),
      }),
    );
    expectInvalid(
      design({
        uniqueConstraints:
          POST_TRADE_AUTHORIZATION_CONSUMPTION_SCHEMA_DESIGN.uniqueConstraints.map(
            (constraint) =>
              constraint.id === "uniq_execution_plan_id"
                ? { ...constraint, columns: ["execution_plan_id"] }
                : constraint,
          ),
      }),
    );
    expectInvalid(
      design({
        uniqueConstraints:
          POST_TRADE_AUTHORIZATION_CONSUMPTION_SCHEMA_DESIGN.uniqueConstraints.map(
            (constraint) =>
              constraint.id === "uniq_consumption_operation_id"
                ? { ...constraint, scope: "global" as const }
                : constraint,
          ),
      }),
    );
  });

  test("validator rejects unsafe state transition models and persisted ambiguous or retryable states", () => {
    expectInvalid(design({ allowedTransitions: [] }));
    expectInvalid(
      design({
        allowedTransitions: [
          ...POST_TRADE_AUTHORIZATION_CONSUMPTION_SCHEMA_DESIGN.allowedTransitions,
          {
            from: "consumed",
            to: "unused",
            allowed: true,
            mutationBoundary: "reviewed_expiry_or_invalidation_function",
          },
        ] as never,
      }),
    );
    expectInvalid(
      design({
        allowedTransitions:
          POST_TRADE_AUTHORIZATION_CONSUMPTION_SCHEMA_DESIGN.allowedTransitions.filter(
            (transition) => transition.to !== "expired",
          ),
      }),
    );
    expectInvalid(design({ allowedStates: ["unused", "pending", "consumed"] as never }));
    expectInvalid(design({ allowedStates: ["unused", "reserved", "consumed"] as never }));
    expectInvalid(design({ allowedStates: ["unused", "ambiguous", "consumed"] as never }));
  });

  test("validator rejects removed evidence constraints and partial evidence bypasses", () => {
    for (const purpose of [
      "affected_rows_one",
      "persistence_operation_required",
      "partial_evidence_prevention",
      "consumed_at_state",
      "execution_ids_state",
      "result_state",
      "expected_counts",
      "ordered_tables",
      "audit_dependency",
      "one_shot_true",
      "retry_false",
      "mock_only_true",
      "expiry_after_issued",
      "bounded_validity",
      "no_usable_reactivation",
    ]) {
      expectInvalid(
        design({
          checkConstraints:
            POST_TRADE_AUTHORIZATION_CONSUMPTION_SCHEMA_DESIGN.checkConstraints.filter(
              (constraint) => constraint.purpose !== purpose,
            ),
        }),
      );
    }
  });

  test("validator rejects foreign key cascade deletion and missing audit ownership consistency", () => {
    expectInvalid(
      design({
        foreignKeys:
          POST_TRADE_AUTHORIZATION_CONSUMPTION_SCHEMA_DESIGN.foreignKeys.map(
            (foreignKey) =>
              foreignKey.id === "fk_consumption_execution_record"
                ? { ...foreignKey, onDelete: "cascade" as never }
                : foreignKey,
          ),
      }),
    );
    expectInvalid(
      design({
        foreignKeys:
          POST_TRADE_AUTHORIZATION_CONSUMPTION_SCHEMA_DESIGN.foreignKeys.map(
            (foreignKey) =>
              foreignKey.id === "fk_consumption_audit_event"
                ? {
                    ...foreignKey,
                    consistencyRequirement: undefined,
                  }
                : foreignKey,
          ),
      }),
    );
  });

  test("validator rejects client policies grants direct deletes broad function behavior and rollback hazards", () => {
    expectInvalid(
      design({
        rls: {
          ...POST_TRADE_AUTHORIZATION_CONSUMPTION_SCHEMA_DESIGN.rls,
          clientSelectPoliciesAllowed: true as never,
        },
      }),
    );
    expectInvalid(
      design({
        privileges: POST_TRADE_AUTHORIZATION_CONSUMPTION_SCHEMA_DESIGN.privileges.map(
          (privilege) =>
            privilege.role === "anon"
              ? { ...privilege, directDeleteAllowed: true }
              : privilege,
        ),
      }),
    );
    expectInvalid(
      design({
        privileges: POST_TRADE_AUTHORIZATION_CONSUMPTION_SCHEMA_DESIGN.privileges.map(
          (privilege) =>
            privilege.role === "service_role"
              ? { ...privilege, directDeleteAllowed: true }
              : privilege,
        ),
      }),
    );
    expectInvalid(
      design({
        transactionFunction: {
          ...POST_TRADE_AUTHORIZATION_CONSUMPTION_SCHEMA_DESIGN.transactionFunction,
          broadJsonInputAllowed: true as never,
        },
      }),
    );
    expectInvalid(
      design({
        transactionFunction: {
          ...POST_TRADE_AUTHORIZATION_CONSUMPTION_SCHEMA_DESIGN.transactionFunction,
          dynamicTableNamesAllowed: true as never,
        },
      }),
    );
    expectInvalid(
      design({
        transactionFunction: {
          ...POST_TRADE_AUTHORIZATION_CONSUMPTION_SCHEMA_DESIGN.transactionFunction,
          applicationSequentialWritesAllowed: true as never,
        },
      }),
    );
    expectInvalid(
      design({
        transactionFunction: {
          ...POST_TRADE_AUTHORIZATION_CONSUMPTION_SCHEMA_DESIGN.transactionFunction,
          genericUpsertAllowed: true as never,
        },
      }),
    );
    expectInvalid(
      design({
        migrationPlan: {
          ...POST_TRADE_AUTHORIZATION_CONSUMPTION_SCHEMA_DESIGN.migrationPlan,
          seedAuthorizationRows: true as never,
        },
      }),
    );
    expectInvalid(
      design({
        migrationPlan: {
          ...POST_TRADE_AUTHORIZATION_CONSUMPTION_SCHEMA_DESIGN.migrationPlan,
          seedExecutionRows: true as never,
        },
      }),
    );
    expectInvalid(
      design({
        migrationPlan: {
          ...POST_TRADE_AUTHORIZATION_CONSUMPTION_SCHEMA_DESIGN.migrationPlan,
          destructiveRollbackWithRowsAllowed: true as never,
        },
      }),
    );
    expectInvalid(
      design({
        migrationPlan: {
          ...POST_TRADE_AUTHORIZATION_CONSUMPTION_SCHEMA_DESIGN.migrationPlan,
          cascadeRollbackAllowed: true as never,
        },
      }),
    );
  });

  test("validator rejects missing verification for production absence zero rows client writes and exact schema", () => {
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
      expectInvalid(
        design({
          verificationPlan:
            POST_TRADE_AUTHORIZATION_CONSUMPTION_SCHEMA_DESIGN.verificationPlan.filter(
              (item) => item.purpose !== purpose,
            ),
        }),
      );
    }
  });

  test("schema design source performs no SQL Supabase persistence migration or execution", () => {
    const source = readFileSync(
      join(
        process.cwd(),
        "lib/post-trade-durable-authorization-consumption-persistence-schema-design.ts",
      ),
      "utf8",
    );

    expect(source).not.toContain("@supabase/supabase-js");
    expect(source).not.toContain("createClient");
    expect(source).not.toContain(".insert(");
    expect(source).not.toContain(".update(");
    expect(source).not.toContain(".upsert(");
    expect(source).not.toContain(".delete(");
    expect(source).not.toContain(".rpc(");
    expect(source).not.toContain(".storage");
    expect(source).not.toContain("CREATE TABLE");
    expect(source).not.toContain("ALTER TABLE");
    expect(source).not.toContain("CREATE INDEX");
    expect(source).not.toContain("CREATE FUNCTION");
    expect(source).not.toContain("buildPostTradeStagingExecutionFunction(");
    expect(source).not.toContain("evaluatePostTradeFinalStagingExecutionGate(");
    expect(source).not.toContain("process.env");
    expect(source).not.toContain("writeFileSync");
  });
});
