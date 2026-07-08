import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  assertPostTradeSchemaAllowlistAligned,
  getPostTradeSchemaColumnAlignmentViolations,
  postTradeSchemaAllowedPayloadFieldSet,
  postTradeSchemaAllowlistAlignmentFixtures,
  type PostTradeSchemaTableFixture,
} from "../fixtures/post-trade-schema-allowlist-alignment-fixtures";
import {
  postTradePersistenceAllowedFields,
  postTradePersistenceNeverPersistFields,
} from "../fixtures/post-trade-persistence-payload-allowlist-fixtures";

const repoRoot = process.cwd();
const fixturePath = "tests/fixtures/post-trade-schema-allowlist-alignment-fixtures.ts";
const specPath = "tests/e2e/post-trade-schema-allowlist-alignment.spec.ts";

function readSource(path: string) {
  return readFileSync(join(repoRoot, path), "utf8");
}

function unsafeTable(
  table: PostTradeSchemaTableFixture,
  patch: Partial<PostTradeSchemaTableFixture>,
) {
  return {
    ...table,
    ...patch,
  } as PostTradeSchemaTableFixture;
}

test.describe("post-trade schema allowlist alignment tests", () => {
  test("schema table fixtures represent the docs-only post-trade table areas", () => {
    expect(postTradeSchemaAllowlistAlignmentFixtures.map((table) => table.tableName)).toEqual([
      "execution_confirmation_evidence",
      "execution_settlement_reviews",
      "execution_cost_breakdowns",
      "execution_deviation_reviews",
      "execution_learning_candidates",
      "execution_redacted_artifacts",
    ]);

    for (const table of postTradeSchemaAllowlistAlignmentFixtures) {
      expect(getPostTradeSchemaColumnAlignmentViolations(table), table.tableName).toEqual([]);
      expect(() => assertPostTradeSchemaAllowlistAligned(table)).not.toThrow();
      expect(table.allowedColumns.length, table.tableName).toBeGreaterThan(0);
      expect(table.requiredColumns.length, table.tableName).toBeGreaterThan(0);
    }
  });

  test("schema columns align to payload allowlist or explicit schema-only metadata", () => {
    expect(postTradePersistenceAllowedFields).toContain("internalTradeId");
    expect(postTradePersistenceAllowedFields).toContain("redactedEvidenceArtifactId");
    expect(postTradeSchemaAllowedPayloadFieldSet.has("schemaVersion")).toBe(true);
    expect(postTradeSchemaAllowedPayloadFieldSet.has("storageReferenceSafe")).toBe(true);

    for (const table of postTradeSchemaAllowlistAlignmentFixtures) {
      for (const column of table.allowedColumns) {
        expect(
          postTradeSchemaAllowedPayloadFieldSet.has(column.payloadField),
          `${table.tableName}.${column.columnName} -> ${column.payloadField}`,
        ).toBe(true);
      }
    }
  });

  test("required schema columns are safe and present in the allowed column list", () => {
    for (const table of postTradeSchemaAllowlistAlignmentFixtures) {
      const allowedColumnNames = new Set(table.allowedColumns.map((column) => column.columnName));

      for (const requiredColumn of table.requiredColumns) {
        expect(allowedColumnNames.has(requiredColumn), `${table.tableName}.${requiredColumn}`).toBe(
          true,
        );
        expect(table.forbiddenColumns).not.toContain(requiredColumn);
      }
    }
  });

  test("unknown schema columns fail unless explicitly schema-safe", () => {
    const table = unsafeTable(postTradeSchemaAllowlistAlignmentFixtures[0], {
      allowedColumns: [
        ...postTradeSchemaAllowlistAlignmentFixtures[0].allowedColumns,
        {
          columnName: "unexpected_dump",
          payloadField: "unexpectedDump",
          required: false,
        },
      ],
    });

    expect(getPostTradeSchemaColumnAlignmentViolations(table)).toContain(
      "execution_confirmation_evidence.unexpected_dump maps to non-allowlisted field unexpectedDump",
    );
    expect(() => assertPostTradeSchemaAllowlistAligned(table)).toThrow(
      /Unsafe post-trade schema fixture/u,
    );
  });

  test("never-store schema fields are blocked from all table fixtures", () => {
    const requiredNeverStoreFields = [
      "credentials",
      "password",
      "BankID",
      "MFA",
      "cookie",
      "session",
      "rawBrowserStorage",
      "networkDump",
      "envSecret",
      "supabaseServiceKey",
      "apiToken",
      "personalIdentityNumber",
      "customerId",
      "accountNumber",
      "accountBalance",
      "unrelatedHoldings",
      "rawPdf",
      "rawScreenshot",
      "rawHtml",
      "rawBrokerPage",
      "unredactedSettlementNote",
      "unredactedBrokerConfirmation",
      "serviceRoleKey",
      "accessToken",
      "refreshToken",
    ];

    expect(postTradePersistenceNeverPersistFields).toEqual(
      expect.arrayContaining(requiredNeverStoreFields.filter((field) => !["serviceRoleKey", "accessToken", "refreshToken"].includes(field))),
    );

    for (const table of postTradeSchemaAllowlistAlignmentFixtures) {
      const allowedNames = table.allowedColumns.map((column) => column.columnName);
      const payloadFields = table.allowedColumns.map((column) => column.payloadField);

      for (const blocked of requiredNeverStoreFields) {
        expect(table.forbiddenColumns, `${table.tableName}.${blocked}`).toContain(blocked);
        expect(allowedNames, `${table.tableName}.${blocked}`).not.toContain(blocked);
        expect(payloadFields, `${table.tableName}.${blocked}`).not.toContain(blocked);
      }
    }
  });

  test("authority and persistence escalation fields are blocked", () => {
    const blockedAuthorityFields = [
      "orderSubmissionAuthority",
      "finalBuyAuthority",
      "finalSellAuthority",
      "brokerAuthority",
      "accountBinding",
      "liveOrderIntent",
      "liveTradeMutationAuthority",
      "livePositionMutationAuthority",
      "supabaseWriteAuthority",
      "productionPersistenceAllowed",
      "rawArtifactStored",
      "learningAutoUpdateAllowed",
      "learningAutoPromotionAllowed",
      "apiRouteActivation",
      "tradeUiExecution",
      "browserAutomation",
      "avanzaBridgeSession",
      "cookieSessionExport",
      "bankIdAutomation",
    ];

    for (const table of postTradeSchemaAllowlistAlignmentFixtures) {
      expect(table.productionWriteAllowed, table.tableName).toBe(false);
      expect(table.rawArtifactStorageAllowed, table.tableName).toBe(false);
      expect(table.learningAutoPromotionAllowed, table.tableName).toBe(false);

      for (const blocked of blockedAuthorityFields) {
        expect(table.forbiddenColumns, `${table.tableName}.${blocked}`).toContain(blocked);
      }
    }
  });

  test("RLS and gate metadata are required for every schema fixture", () => {
    for (const table of postTradeSchemaAllowlistAlignmentFixtures) {
      expect(table.rlsRequired, table.tableName).toBe(true);
      expect(table.writeGateRequired, table.tableName).toBe(true);
      expect(table.productionWriteAllowed, table.tableName).toBe(false);
      expect(table.serviceRoleClientAllowed, table.tableName).toBe(false);
      expect(table.clientDirectWriteAllowed, table.tableName).toBe(false);
      expect(table.rollbackRequired, table.tableName).toBe(true);
      expect(table.redactionGateRequired, table.tableName).toBe(true);
      expect(table.payloadAllowlistRequired, table.tableName).toBe(true);
    }
  });

  test("unsafe RLS and gate metadata fails alignment", () => {
    const table = unsafeTable(postTradeSchemaAllowlistAlignmentFixtures[1], {
      rlsRequired: false as true,
      productionWriteAllowed: true as false,
      serviceRoleClientAllowed: true as false,
      clientDirectWriteAllowed: true as false,
      rollbackRequired: false as true,
    });

    expect(getPostTradeSchemaColumnAlignmentViolations(table)).toEqual(
      expect.arrayContaining([
        "execution_settlement_reviews must require RLS",
        "execution_settlement_reviews must block production writes",
        "execution_settlement_reviews must block service role client usage",
        "execution_settlement_reviews must block client direct writes",
        "execution_settlement_reviews must require rollback",
      ]),
    );
  });

  test("learning candidate schema remains staged and cannot auto-promote", () => {
    const learningTable = postTradeSchemaAllowlistAlignmentFixtures.find(
      (table) => table.tableName === "execution_learning_candidates",
    );

    expect(learningTable).toBeDefined();
    expect(learningTable?.learningCandidateRules).toMatchObject({
      stagedOnly: true,
      requiresSeparateLearningGate: true,
      automaticPromotionAllowed: false,
      blockedDeviationEligible: false,
      sensitiveDataEligible: false,
      partialFillRequiresManualReview: true,
      outcomeEligibleDefault: false,
    });
    expect(learningTable?.requiredColumns).toEqual(
      expect.arrayContaining([
        "learning_candidate_status",
        "outcome_eligible",
        "requires_separate_learning_gate",
        "manual_review_status",
        "redaction_status",
        "sensitive_data_present",
      ]),
    );
  });

  test("optional redacted artifact table stores metadata only and no raw artifact columns", () => {
    const artifactTable = postTradeSchemaAllowlistAlignmentFixtures.find(
      (table) => table.tableName === "execution_redacted_artifacts",
    );

    expect(artifactTable).toBeDefined();
    expect(artifactTable?.optional).toBe(true);
    expect(artifactTable?.artifactMetadataRules).toMatchObject({
      metadataOnly: true,
      rawArtifactStorageAllowed: false,
      redactionStatusRequired: true,
      sensitiveDataPresent: false,
    });
    expect(artifactTable?.requiredColumns).toEqual(
      expect.arrayContaining(["artifact_kind", "redaction_status", "storage_reference_safe"]),
    );

    const artifactColumnFields = artifactTable?.allowedColumns.map((column) => column.payloadField) ?? [];

    for (const blocked of ["rawPdf", "rawScreenshot", "rawHtml", "rawBrokerPage"]) {
      expect(artifactColumnFields).not.toContain(blocked);
    }
  });

  test("schema alignment fixture and spec sources stay isolated from runtime and write modules", () => {
    const fixtureSource = readSource(fixturePath);
    const specSource = readSource(specPath);
    const forbiddenImportFragments = [
      "@/lib/supabase",
      "supabase-server",
      "createClient(",
      "app/api/",
      "app/trade-app",
      "app/dev/avanza-visual-qa/page",
      "scripts/",
      "avanza-localhost-bridge",
      "avanza-login-smoke-test",
      "avanza-order-chain-smoke-test",
      "avanza-dry-run-runner",
      "safe-browser-action",
      "credential",
      "session",
      "process.env",
      "fetch(",
      "localStorage",
      "sessionStorage",
      "child_process",
    ];

    for (const [label, source] of [
      [fixturePath, fixtureSource],
      [specPath, specSource],
    ] as const) {
      const importLines = source
        .split("\n")
        .filter((line) => line.trim().startsWith("import "));
      const violations = forbiddenImportFragments.filter((fragment) =>
        importLines.some((line) => line.includes(fragment)),
      );

      expect(violations, `${label}\n${violations.join("\n")}`).toEqual([]);
    }
  });
});
