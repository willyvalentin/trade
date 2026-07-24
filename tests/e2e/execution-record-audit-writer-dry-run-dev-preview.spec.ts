import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  getAuditWriterDryRunDevPreviewFixtures,
} from "../../lib/execution-record-audit-writer-dry-run-dev-preview-fixture";

const fixturePath = join(
  process.cwd(),
  "lib/execution-record-audit-writer-dry-run-dev-preview-fixture.ts",
);

test("audit writer dry-run dev preview fixtures expose required read-only states", () => {
  const fixtures = getAuditWriterDryRunDevPreviewFixtures();
  const ready = fixtures.find((fixture) => fixture.status === "ready");
  const validationFailed = fixtures.find(
    (fixture) => fixture.status === "validation_failed",
  );
  const blocked = fixtures.find((fixture) => fixture.status === "blocked");

  expect(fixtures).toHaveLength(3);
  expect(ready).toBeTruthy();
  expect(validationFailed).toBeTruthy();
  expect(blocked).toBeTruthy();

  for (const fixture of fixtures) {
    expect(fixture.title).toBe("Audit Writer Dry-Run Preview");
    expect(fixture.badges).toEqual([
      "Fixture only",
      "No write performed",
      "Writer blocked",
    ]);
    expect(fixture.wouldWrite).toBe(false);
    expect(fixture.notWritten).toBe(true);
    expect(fixture.approvalImplied).toBe(false);
  }

  expect(ready?.severity).toBe("info");
  expect(ready?.insertPreview?.eventType).toBe("execution_record_created");
  expect(ready?.insertPreview?.eventSource).toBe("dry_run_dev_preview_fixture");
  expect(ready?.insertPreview?.authorityMode).toBe("server_append_only");
  expect(ready?.insertPreview?.executionRecordId).toBe(
    "11111111-1111-4111-8111-111111111111",
  );
  expect(ready?.insertPreview?.requestId).toBe("audit-dev-preview-request-1");
  expect(ready?.insertPreview?.idempotencyKey).toBe(
    "execution-record-audit:dev-preview-request-1",
  );
  expect(ready?.insertPreview?.wouldWrite).toBe(false);
  expect(ready?.insertPreview?.payloadSummary.kind).toBe("object");
  expect(ready?.insertPreview?.evidenceSummary.redactedKeys).toContain(
    "maskedAccount",
  );
  expect(ready?.insertPreview?.provenanceSummary.preview).toMatchObject({
    fixtureOnly: true,
  });

  expect(validationFailed?.severity).toBe("error");
  expect(validationFailed?.insertPreview).toBeNull();
  expect(validationFailed?.validation.errors).toEqual([
    "execution_record_id_invalid_uuid",
  ]);

  expect(blocked?.severity).toBe("warning");
  expect(blocked?.insertPreview).toBeNull();
  expect(blocked?.validation.warnings).toEqual(["writer_implementation_absent"]);
});

test("audit writer dry-run dev preview fixture source has no runtime boundary crossings", () => {
  const source = readFileSync(fixturePath, "utf8");

  expect(source).not.toContain("server-only");
  expect(source).not.toContain("@/lib/server");
  expect(source).not.toContain("../../lib/server");
  expect(source).not.toContain("createClient");
  expect(source).not.toContain("process.env");
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
});

test("audit writer dry-run dev preview fixture does not expose action prompts", () => {
  const serialized = JSON.stringify(getAuditWriterDryRunDevPreviewFixtures());
  const blockedPromptTerms = [
    "sub" + "mit",
    "ap" + "pend" + " " + "audit",
    "ap" + "pend" + " " + "event",
    "se" + "nd",
    "run" + " " + "writer",
    "write" + " " + "event",
  ];

  for (const term of blockedPromptTerms) {
    expect(serialized.toLowerCase()).not.toContain(term);
  }
});

test("audit writer dry-run dev preview fixture remains deterministic", () => {
  const source = readFileSync(fixturePath, "utf8");

  expect(source).not.toContain("Date.now");
  expect(source).not.toContain("Math.random");
  expect(source).not.toContain("crypto.randomUUID");
  expect(source).not.toContain("writeFile");
  expect(source).not.toContain("appendFile");
});
