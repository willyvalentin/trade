import { expect, test } from "@playwright/test";
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const root = process.cwd();
const adapterPath = join(
  root,
  "lib/server/execution-record-audit-writer-service-role-adapter.ts",
);
const fixturePath = join(
  root,
  "lib/server/execution-record-audit-writer-service-role-adapter-fixtures.ts",
);
const mockIntegrationHarnessPath = join(
  root,
  "lib/server/execution-record-audit-writer-mock-integration-harness.ts",
);
const writerPath = join(root, "lib/server/execution-record-audit-writer.ts");
const runtimeRoots = ["app", "components", "hooks", "lib"].map((path) =>
  join(root, path),
);

function read(path: string): string {
  return readFileSync(path, "utf8");
}

function listSourceFiles(dir: string): string[] {
  if (!existsSync(dir)) {
    return [];
  }

  return readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry);
    const stats = statSync(path);

    if (stats.isDirectory()) {
      if (entry === "node_modules" || entry === ".next") {
        return [];
      }

      return listSourceFiles(path);
    }

    if (!/\.(tsx?|jsx?|mjs|cjs)$/.test(entry)) {
      return [];
    }

    return [path];
  });
}

function trackedFiles(): string[] {
  return execFileSync("git", ["ls-files"], {
    cwd: root,
    encoding: "utf8",
  })
    .split("\n")
    .filter(Boolean)
    .map((path) => join(root, path));
}

test("service-role adapter keeps a server-only typed live boundary", () => {
  const source = read(adapterPath);

  expect(source.startsWith('import "server-only";')).toBe(true);
  expect(source).toContain(
    'import type { Database } from "@/lib/supabase-database.types";',
  );
  expect(source).toContain('import { getServerSupabaseClient } from "@/lib/supabase-server";');
  expect(source).toContain(
    'Database["public"]["Tables"]["execution_record_audit_events"]',
  );
  expect(source).toContain(
    "createExecutionRecordAuditServiceRoleClientAdapter",
  );
  expect(source).toContain("insertExecutionRecordAuditEventWithServiceRole");
  expect(source).toContain('targetTable: "public.execution_record_audit_events"');
  expect(source).toContain('operation: "insert"');

  expect(source).not.toMatch(/\bcreateClient\b/);
  expect(source).not.toMatch(/\bprocess\.env\b/);
  expect(source).not.toContain("../../lib/supabase-server");
});

test("service-role adapter remains insert-only and keeps dry-run blocked flags", () => {
  const source = read(adapterPath);

  expect(source).toContain('status: "skeleton_blocked"');
  expect(source).toContain("ok: false");
  expect(source).toContain("clientCreated: false");
  expect(source).toContain("queryPerformed: false");
  expect(source).toContain("writePerformed: false");
  expect(source).toContain("serviceRoleValuePrinted: false");
  expect(source).toContain('.from("execution_record_audit_events")');
  expect(source).toContain(".insert(input.insert)");

  for (const forbidden of [
    ".select(",
    ".update(",
    ".delete(",
    ".upsert(",
    "fetch(",
    "localStorage",
    "sessionStorage",
  ]) {
    expect(source).not.toContain(forbidden);
  }
});

test("service-role adapter is imported only by approved server-only writer boundary", () => {
  const adapterImport = "execution-record-audit-writer-service-role-adapter";
  const runtimeMatches = runtimeRoots
    .flatMap(listSourceFiles)
    .filter((path) => path !== adapterPath)
    .filter((path) => path !== writerPath)
    .filter((path) => path !== fixturePath)
    .filter((path) => path !== mockIntegrationHarnessPath)
    .filter((path) => read(path).includes(adapterImport))
    .map((path) => relative(root, path));

  expect(runtimeMatches).toEqual([]);

  const writerSource = read(writerPath);
  expect(writerSource).toContain(adapterImport);
  expect(writerSource).toContain("insertExecutionRecordAuditEventWithServiceRole");
  expect(writerSource).not.toContain(".from(");
  expect(writerSource).not.toContain(".insert(");
  expect(writerSource).toContain("wouldWrite: false");
});

test("tracked source does not expose public service-role env assignments", () => {
  const publicPrefix = "NEXT" + "_PUBLIC_";
  const serviceRolePattern = new RegExp(
    `${publicPrefix}[A-Z0-9_]*SERVICE|SERVICE[A-Z0-9_]*${publicPrefix}|${publicPrefix}.*SERVICE_ROLE|SERVICE_ROLE.*${publicPrefix}`,
    "i",
  );
  const secretAssignmentPattern = new RegExp(
    [
      "SUPABASE" + "_SERVICE_ROLE_KEY",
      "SUPABASE" + "_SERVICE_ROLE",
      "SUPABASE" + "_SERVICE_ROLE_SECRET",
      "service" + "_role_key",
    ]
      .map((name) => `${name}\\s*=`)
      .join("|"),
  );
  const matches = trackedFiles()
    .filter((path) => !path.includes("/node_modules/"))
    .filter((path) => /\.(tsx?|jsx?|mjs|cjs|md|txt)$/.test(path))
    .flatMap((path) => {
      const source = read(path);

      if (
        serviceRolePattern.test(source) ||
        secretAssignmentPattern.test(source)
      ) {
        return [relative(root, path)];
      }

      return [];
    });

  expect(matches).toEqual([]);
});

test("service-role adapter source avoids broker, Avanza, and automatic references", () => {
  const source = read(adapterPath);

  expect(source).not.toMatch(new RegExp("br" + "oker", "i"));
  expect(source).not.toMatch(new RegExp("Av" + "anza", "i"));
  expect(source).not.toMatch(new RegExp("automatic", "i"));
});
