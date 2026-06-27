import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import vm from "node:vm";
import ts from "typescript";

import type {
  ExecutionRecordAuditWriterMockIntegrationPreviewFixture,
} from "../../lib/server/execution-record-audit-writer-mock-integration-preview-fixtures";

const fixturePath = join(
  process.cwd(),
  "lib/server/execution-record-audit-writer-mock-integration-preview-fixtures.ts",
);
const writerPath = join(
  process.cwd(),
  "lib/server/execution-record-audit-writer.ts",
);

type RuntimeFixtureModule = {
  getAuditWriterMockIntegrationPreviewFixtures: () => readonly ExecutionRecordAuditWriterMockIntegrationPreviewFixture[];
};

function loadRuntimeFixtureModule(): RuntimeFixtureModule {
  const source = readFileSync(fixturePath, "utf8").replace(
    'import "server-only";',
    "",
  );
  const transpiled = ts.transpileModule(source, {
    compilerOptions: {
      esModuleInterop: true,
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
    },
    fileName: fixturePath,
  }).outputText;
  const sandbox = {
    exports: {} as Partial<RuntimeFixtureModule>,
    require: (specifier: string): never => {
      throw new Error(
        `Unexpected runtime require in mock integration preview fixture test: ${specifier}`,
      );
    },
  };
  vm.runInNewContext(transpiled, sandbox, { filename: fixturePath });
  return sandbox.exports as RuntimeFixtureModule;
}

function expectFixtureSafety(
  fixture: ExecutionRecordAuditWriterMockIntegrationPreviewFixture,
): void {
  expect(fixture.fixtureOnly).toBe(true);
  expect(fixture.liveWriterBlocked).toBe(true);
  expect(fixture.approvalImplied).toBe(false);
  expect(fixture.result.realSupabaseCalled).toBe(false);
  expect(fixture.result.serviceRoleUsed).toBe(false);
  expect(fixture.result.writePerformed).toBe(false);
  expect(fixture.result.remoteMutated).toBe(false);
  expect(fixture.result.wouldWrite).toBe(false);
  expect(fixture.result.inserted).toBe(false);
}

test("mock integration preview fixtures cover all required statuses", () => {
  const { getAuditWriterMockIntegrationPreviewFixtures } =
    loadRuntimeFixtureModule();
  const fixtures = getAuditWriterMockIntegrationPreviewFixtures();
  const statuses = fixtures.map((fixture) => fixture.status);

  expect(statuses).toEqual([
    "success",
    "conflict_idempotent_duplicate",
    "permission_security_failure",
    "service_unavailable",
    "unknown_error",
    "validation_failed",
    "blocked",
  ]);
  expect(fixtures).toHaveLength(7);

  for (const fixture of fixtures) {
    expect(fixture.title).toBe("Audit Writer Mock Integration Preview");
    expectFixtureSafety(fixture);
  }
});

test("mock integration preview fixtures preserve adapter invocation boundaries", () => {
  const { getAuditWriterMockIntegrationPreviewFixtures } =
    loadRuntimeFixtureModule();
  const fixtures = getAuditWriterMockIntegrationPreviewFixtures();
  const invalid = fixtures.find(
    (fixture) => fixture.status === "validation_failed",
  );
  const blocked = fixtures.find((fixture) => fixture.status === "blocked");
  const mapped = fixtures.filter(
    (fixture) =>
      fixture.status !== "validation_failed" && fixture.status !== "blocked",
  );

  expect(invalid?.result.mockAdapterInvoked).toBe(false);
  expect(blocked?.result.mockAdapterInvoked).toBe(false);

  for (const fixture of mapped) {
    expect(fixture.result.mockAdapterInvoked).toBe(true);
  }
});

test("mock integration preview fixtures do not expose raw suspicious payloads", () => {
  const { getAuditWriterMockIntegrationPreviewFixtures } =
    loadRuntimeFixtureModule();
  const serialized = JSON.stringify(
    getAuditWriterMockIntegrationPreviewFixtures(),
  );

  expect(serialized).not.toContain(
    "service-role-looking-value-do-not-print-or-propagate",
  );
  const serviceRoleAssignmentPattern = new RegExp(
    [
      "SUPABASE" + "_SERVICE_ROLE_KEY",
      "SUPABASE" + "_SERVICE_ROLE",
      "SUPABASE" + "_SERVICE_ROLE_SECRET",
      "service" + "_role_key",
    ]
      .map((name) => `${name}\\s*=`)
      .join("|"),
  );
  expect(serialized).not.toMatch(serviceRoleAssignmentPattern);
});

test("mock integration preview fixture source remains server-only and non-live", () => {
  const source = readFileSync(fixturePath, "utf8");
  const writerSource = readFileSync(writerPath, "utf8");

  expect(source.startsWith('import "server-only";')).toBe(true);
  expect(source).toContain("getAuditWriterMockIntegrationPreviewFixtures");
  expect(source).toContain("realSupabaseCalled: false");
  expect(source).toContain("serviceRoleUsed: false");
  expect(source).toContain("writePerformed: false");
  expect(source).toContain("remoteMutated: false");
  expect(source).toContain("wouldWrite: false");

  expect(source).not.toContain("createClient");
  expect(source).not.toContain("supabase-server");
  expect(source).not.toContain("process.env");
  expect(source).not.toMatch(new RegExp("SUPABASE" + "_SERVICE_ROLE"));
  expect(source).not.toContain(".from(");
  expect(source).not.toContain(".insert(");
  expect(source).not.toContain(".update(");
  expect(source).not.toContain(".delete(");
  expect(source).not.toContain(".upsert(");
  expect(source).not.toContain("fetch(");
  expect(source).not.toContain("localStorage");
  expect(source).not.toContain("sessionStorage");
  expect(source).not.toMatch(new RegExp("br" + "oker", "i"));
  expect(source).not.toMatch(new RegExp("Av" + "anza", "i"));
  expect(source).not.toMatch(new RegExp("automatic", "i"));

  expect(writerSource).not.toContain(
    "execution-record-audit-writer-mock-integration-preview-fixtures",
  );
  expect(writerSource).toContain(
    "execution-record-audit-writer-service-role-adapter",
  );
  expect(writerSource).toContain("insertExecutionRecordAuditEventWithServiceRole");
  expect(writerSource).toContain("wouldWrite: false");
  expect(writerSource).not.toContain(".from(");
  expect(writerSource).not.toContain(".insert(");
});

test("mock integration preview fixtures remain deterministic", () => {
  const source = readFileSync(fixturePath, "utf8");

  expect(source).not.toContain("Date.now");
  expect(source).not.toContain("Math.random");
  expect(source).not.toContain("crypto.randomUUID");
  expect(source).not.toContain("writeFile");
  expect(source).not.toContain("appendFile");
});
