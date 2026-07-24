import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import vm from "node:vm";
import ts from "typescript";

import type {
  ExecutionRecordAuditEventRow,
  ExecutionRecordAuditWriterInput,
} from "../../lib/server/execution-record-audit-writer-contract";
import type {
  ExecutionRecordAuditWriterMockIntegrationInput,
  ExecutionRecordAuditWriterMockIntegrationResult,
} from "../../lib/server/execution-record-audit-writer-mock-integration-harness";

const harnessPath = join(
  process.cwd(),
  "lib/server/execution-record-audit-writer-mock-integration-harness.ts",
);
const writerPath = join(
  process.cwd(),
  "lib/server/execution-record-audit-writer.ts",
);

type RuntimeHarnessModule = {
  runExecutionRecordAuditWriterMockIntegration: (
    input: ExecutionRecordAuditWriterMockIntegrationInput,
  ) => Promise<ExecutionRecordAuditWriterMockIntegrationResult>;
};

const validInput = {
  executionRecordId: "55555555-5555-4555-8555-555555555555",
  eventType: "execution_record_created",
  source: {
    eventSource: "mock_integration_test",
    sourceSystem: "trade_app",
    sourceFingerprint: "fingerprint-harness-1",
    traceId: "trace-harness-1",
    writerVersion: "mock-integration-test",
  },
  requestId: "request-harness-1",
  idempotencyKey: "execution-record-audit:mock-harness-1",
  duplicatePreventionKey: "execution-record-audit:duplicate-harness-1",
  actor: {
    actorType: "system",
    actorId: null,
  },
  authorityMode: "server_append_only",
  payload: {
    status: "created",
  },
  evidence: {
    source: "fixture",
  },
  provenance: {
    generatedBy: "action_815_test",
  },
  occurredAt: "2026-06-22T12:30:00.000Z",
  metadata: {
    deterministic: true,
  },
} satisfies ExecutionRecordAuditWriterInput;

const auditRow = {
  actor_id: null,
  actor_type: "system",
  created_at: "2026-06-22T12:30:00.000Z",
  duplicate_prevention_key: validInput.duplicatePreventionKey,
  event_payload: validInput.payload,
  event_source: validInput.source.eventSource,
  event_status: "recorded",
  event_type: validInput.eventType,
  evidence_payload: validInput.evidence,
  execution_record_id: validInput.executionRecordId,
  id: "66666666-6666-4666-8666-666666666666",
  idempotency_key: validInput.idempotencyKey,
  metadata: validInput.metadata,
  occurred_at: validInput.occurredAt,
  request_id: validInput.requestId,
  schema_version: "1",
  source_fingerprint: validInput.source.sourceFingerprint,
  source_system: validInput.source.sourceSystem,
  trace_id: validInput.source.traceId,
  writer_version: validInput.source.writerVersion,
} satisfies ExecutionRecordAuditEventRow;

function loadRuntimeHarnessModule(): RuntimeHarnessModule {
  const moduleCache = new Map<string, Record<string, unknown>>();

  function loadTsModule(path: string): Record<string, unknown> {
    const normalizedPath = path.endsWith(".ts") ? path : `${path}.ts`;
    const cached = moduleCache.get(normalizedPath);

    if (cached) {
      return cached;
    }

    const source = readFileSync(normalizedPath, "utf8").replace(
      'import "server-only";',
      "",
    );
    const transpiled = ts.transpileModule(source, {
      compilerOptions: {
        esModuleInterop: true,
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2020,
      },
      fileName: normalizedPath,
    }).outputText;
    const sandbox = {
      Error,
      exports: {} as Record<string, unknown>,
      require: (specifier: string): Record<string, unknown> => {
        if (specifier.startsWith("@/lib/server/")) {
          return loadTsModule(join(process.cwd(), specifier.slice(2)));
        }

        if (specifier === "@/lib/supabase-database.types") {
          return {};
        }

        throw new Error(
          `Unexpected runtime require in mock integration harness test: ${specifier}`,
        );
      },
    };
    moduleCache.set(normalizedPath, sandbox.exports);
    vm.runInNewContext(transpiled, sandbox, { filename: normalizedPath });
    return sandbox.exports;
  }

  return loadTsModule(harnessPath) as RuntimeHarnessModule;
}

function expectHarnessSafety(
  result: ExecutionRecordAuditWriterMockIntegrationResult,
): void {
  expect(result.realSupabaseCalled).toBe(false);
  expect(result.serviceRoleUsed).toBe(false);
  expect(result.writePerformed).toBe(false);
  expect(result.remoteMutated).toBe(false);
  expect(result.wouldWrite).toBe(false);
  expect(result.inserted).toBe(false);
}

test("mock integration harness maps valid input and mock success without writing", async () => {
  const runtimeHarness = loadRuntimeHarnessModule();
  const result = await runtimeHarness.runExecutionRecordAuditWriterMockIntegration({
    writerInput: validInput,
    allowMockAdapter: true,
    insertAuditEventMock: (insert) => ({
      status: "success",
      ok: true,
      version: "execution_record_audit_service_role_adapter_mock_v1",
      row: { ...auditRow, idempotency_key: insert.idempotency_key },
      idempotencyKey: insert.idempotency_key,
      warnings: [],
      errors: [],
      realSupabaseCalled: false,
      serviceRoleUsed: false,
      writePerformed: false,
      remoteMutated: false,
    }),
  });

  expect(result.status).toBe("success");
  expect(result.ok).toBe(true);
  expect(result.mockAdapterInvoked).toBe(true);
  expect(result.dryRun.status).toBe("ready");
  if (result.mockAdapterInvoked) {
    expect(result.mockResult.status).toBe("success");
  }
  expectHarnessSafety(result);
});

test("mock integration harness maps duplicate, security, and unavailable outcomes", async () => {
  const runtimeHarness = loadRuntimeHarnessModule();
  const duplicate =
    await runtimeHarness.runExecutionRecordAuditWriterMockIntegration({
      writerInput: validInput,
      allowMockAdapter: true,
      insertAuditEventMock: (insert) => ({
        status: "conflict_idempotent_duplicate",
        ok: false,
        version: "execution_record_audit_service_role_adapter_mock_v1",
        idempotencyKey: insert.idempotency_key,
        existingAuditEventId: auditRow.id,
        warnings: ["duplicate"],
        errors: [],
        realSupabaseCalled: false,
        serviceRoleUsed: false,
        writePerformed: false,
        remoteMutated: false,
      }),
    });
  const security =
    await runtimeHarness.runExecutionRecordAuditWriterMockIntegration({
      writerInput: validInput,
      allowMockAdapter: true,
      insertAuditEventMock: () => ({
        status: "permission_security_failure",
        ok: false,
        version: "execution_record_audit_service_role_adapter_mock_v1",
        warnings: [],
        errors: ["permission_denied"],
        realSupabaseCalled: false,
        serviceRoleUsed: false,
        writePerformed: false,
        remoteMutated: false,
      }),
    });
  const unavailable =
    await runtimeHarness.runExecutionRecordAuditWriterMockIntegration({
      writerInput: validInput,
      allowMockAdapter: true,
      insertAuditEventMock: () => ({
        status: "service_unavailable",
        ok: false,
        version: "execution_record_audit_service_role_adapter_mock_v1",
        warnings: [],
        errors: ["service_unavailable"],
        realSupabaseCalled: false,
        serviceRoleUsed: false,
        writePerformed: false,
        remoteMutated: false,
      }),
    });

  expect(duplicate.status).toBe("conflict_idempotent_duplicate");
  expect(security.status).toBe("permission_security_failure");
  expect(unavailable.status).toBe("service_unavailable");

  for (const result of [duplicate, security, unavailable]) {
    expect(result.mockAdapterInvoked).toBe(true);
    expectHarnessSafety(result);
  }
});

test("mock integration harness skips adapter on invalid input and blocked flag", async () => {
  const runtimeHarness = loadRuntimeHarnessModule();
  let invalidInvocations = 0;
  let blockedInvocations = 0;
  const invalid =
    await runtimeHarness.runExecutionRecordAuditWriterMockIntegration({
      writerInput: { ...validInput, executionRecordId: "not-a-uuid" },
      allowMockAdapter: true,
      insertAuditEventMock: () => {
        invalidInvocations += 1;
        throw new Error("should not run");
      },
    });
  const blocked =
    await runtimeHarness.runExecutionRecordAuditWriterMockIntegration({
      writerInput: validInput,
      allowMockAdapter: false,
      insertAuditEventMock: () => {
        blockedInvocations += 1;
        throw new Error("should not run");
      },
    });

  expect(invalid.status).toBe("validation_failed");
  expect(invalid.mockAdapterInvoked).toBe(false);
  expect(invalidInvocations).toBe(0);
  expect(blocked.status).toBe("blocked");
  expect(blocked.mockAdapterInvoked).toBe(false);
  expect(blockedInvocations).toBe(0);
  expectHarnessSafety(invalid);
  expectHarnessSafety(blocked);
});

test("mock integration harness preserves input immutability and does not echo suspicious payload", async () => {
  const runtimeHarness = loadRuntimeHarnessModule();
  const suspiciousValue =
    "service-role-looking-value-do-not-print-or-propagate";
  const suspiciousInput = {
    ...validInput,
    payload: {
      suspiciousValue,
    },
    evidence: {
      nested: {
        suspiciousValue,
      },
    },
    metadata: {
      suspiciousValue,
    },
  } satisfies ExecutionRecordAuditWriterInput;
  const before = JSON.stringify(suspiciousInput);
  const result = await runtimeHarness.runExecutionRecordAuditWriterMockIntegration({
    writerInput: suspiciousInput,
    allowMockAdapter: true,
    insertAuditEventMock: (insert) => {
      expect(insert.event_payload).toEqual({ suspiciousValue });
      return {
        status: "permission_security_failure",
        ok: false,
        version: "execution_record_audit_service_role_adapter_mock_v1",
        warnings: [],
        errors: ["blocked_without_echoing_payload"],
        realSupabaseCalled: false,
        serviceRoleUsed: false,
        writePerformed: false,
        remoteMutated: false,
      };
    },
  });

  expect(JSON.stringify(suspiciousInput)).toBe(before);
  expect(JSON.stringify(result)).not.toContain(suspiciousValue);
  expectHarnessSafety(result);
});

test("mock integration harness source remains server-only and non-live", () => {
  const source = readFileSync(harnessPath, "utf8");
  const writerSource = readFileSync(writerPath, "utf8");

  expect(source.startsWith('import "server-only";')).toBe(true);
  expect(source).toContain("buildExecutionRecordAuditWriterDryRun");
  expect(source).toContain("runExecutionRecordAuditServiceRoleAdapterMock");
  expect(source).toContain("allowMockAdapter");
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
    "execution-record-audit-writer-mock-integration-harness",
  );
  expect(writerSource).toContain(
    "execution-record-audit-writer-service-role-adapter",
  );
  expect(writerSource).toContain("insertExecutionRecordAuditEventWithServiceRole");
  expect(writerSource).toContain("wouldWrite: false");
  expect(writerSource).not.toContain(".from(");
  expect(writerSource).not.toContain(".insert(");
});
