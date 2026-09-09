import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { expect, test } from "@playwright/test";

import {
  ACTION_666IY_B03_STAGING_CATALOG_AUDIT_RECEIPT_VERSION,
  validateAction666iyB03StagingCatalogAuditReceipt,
} from "../../lib/action-666iy-b03-staging-catalog-audit-receipt";

const root = resolve(__dirname, "../..");
const actionPath = "docs/action-666iy-b03-staging-catalog-audit.md";
const evidencePath = "docs/evidence/action-666iy-b03-staging-catalog-audit.json";
const roadmapPath = "docs/ture-master-roadmap.md";
const ledgerPath = "docs/ture-current-state-ledger.md";
const registrationPath = "scripts/action-660j-provider-free-ci-registration.json";
const runnerPath = "scripts/action-660j-run-provider-free-ci-shard.mjs";
const planPath = "tests/e2e/action-660j-parallel-provider-free-verification.spec.ts";
const thisTest = "tests/e2e/action-666iy-b03-staging-catalog-audit.spec.ts";

function source(relativePath: string) {
  return readFileSync(resolve(root, relativePath), "utf8");
}

function sha256(value: string) {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

test("666IY validates the one redacted staging catalog receipt without opening authority", () => {
  const evidenceRaw = source(evidencePath);
  const evidence = JSON.parse(evidenceRaw);
  const receipt = evidence.receipt;
  const result = validateAction666iyB03StagingCatalogAuditReceipt(receipt);

  expect(evidence.contract_version).toBe(
    "trade.action666iy.b03-staging-catalog-audit.v1",
  );
  expect(evidence.action_id).toBe("ACTION_666IY");
  expect(evidence.authorization).toEqual({
    controller: "codex_autonomous_governance_controller",
    operation: "one_staging_only_read_only_catalog_query",
    retry_authorized: false,
    raw_data_or_secret_retention: false,
  });
  expect(result).toMatchObject({
    version: ACTION_666IY_B03_STAGING_CATALOG_AUDIT_RECEIPT_VERSION,
    disposition: "staging_catalog_audit_validated_not_admitted",
    validated_receipt: receipt,
  });
  expect(Object.isFrozen(result)).toBe(true);
  expect(Object.isFrozen(result.validated_receipt)).toBe(true);
  expect(Object.isFrozen(result.validated_receipt?.observations)).toBe(true);
  expect(Object.values(result.authority)).toEqual(Array(9).fill(false));
  expect(evidence.authority_limits).toEqual({
    staging_connection_admitted: false,
    application_row_or_auth_user_read: false,
    secret_or_connection_material_read: false,
    identity_or_grant_change: false,
    migration_apply: false,
    writer_invocation: false,
    application_transport_or_runtime_binding: false,
    deployment: false,
    provider_or_broker_contact: false,
    production_access: false,
  });
  expect(evidence.decision).toMatchObject({
    staging_catalog_audit_disposition:
      "staging_catalog_audit_validated_not_admitted",
    remote_staging_admission: "not_admitted",
    observed_gap:
      "no_dedicated_least_privileged_application_writer_identity_or_private_application_transport_is_attested",
  });
  expect(sha256(evidenceRaw)).toMatch(/^[0-9a-f]{64}$/);
});

test("666IY rejects widened, malformed and authority-opening catalog receipts", () => {
  const receipt = JSON.parse(source(evidencePath)).receipt;
  const mismatch = validateAction666iyB03StagingCatalogAuditReceipt({
    ...receipt,
    observations: {
      ...receipt.observations,
      service_role_can_execute_writer: false,
    },
  });
  const expanded = validateAction666iyB03StagingCatalogAuditReceipt({
    ...receipt,
    extra: true,
  });
  const accessorReceipt = {
    ...receipt,
    observations: Object.create(Object.prototype),
  } as Record<string, unknown>;
  Object.defineProperty(accessorReceipt.observations, "private_schema_present", {
    enumerable: true,
    get() {
      throw new Error("must not evaluate accessor");
    },
  });
  const throwingProxy = new Proxy(receipt, {
    getPrototypeOf() {
      throw new Error("must not inspect proxy");
    },
  });

  expect(mismatch).toMatchObject({
    disposition: "not_admitted_catalog_receipt_mismatch",
    validated_receipt: null,
  });
  expect(expanded).toMatchObject({
    disposition: "invalid_input",
    validated_receipt: null,
  });
  expect(
    validateAction666iyB03StagingCatalogAuditReceipt(accessorReceipt),
  ).toMatchObject({ disposition: "invalid_input", validated_receipt: null });
  expect(() =>
    validateAction666iyB03StagingCatalogAuditReceipt(throwingProxy),
  ).not.toThrow();
  expect(
    validateAction666iyB03StagingCatalogAuditReceipt(throwingProxy),
  ).toMatchObject({ disposition: "invalid_input", validated_receipt: null });
});

test("666IY keeps the audit source-only and registered exactly once", () => {
  const action = source(actionPath);
  const evidence = source(evidencePath);
  const moduleSource = source(
    "lib/action-666iy-b03-staging-catalog-audit-receipt.ts",
  );
  const registration = JSON.parse(source(registrationPath)) as string[];

  expect(`${action}\n${evidence}`).toContain("single_read_only_catalog_query");
  expect(`${action}\n${evidence}`).toContain("not_admitted");
  expect(`${action}\n${evidence}`).not.toMatch(
    /https?:\/\/|sk-[A-Za-z0-9]|eyJ[a-zA-Z0-9_-]{20,}|(?:api[_ -]?key|authorization|bearer|password|credential)\s*[:=]\s*["']?\S+/i,
  );
  expect(moduleSource).not.toMatch(/\bfetch\b|process\.env|supabase|postgres/i);
  expect(source(roadmapPath)).toContain("Action 666IY");
  expect(source(ledgerPath)).toContain("ACTION 666IY");
  expect(registration.filter((entry) => entry === thisTest)).toEqual([thisTest]);
  expect(new Set(registration).size).toBe(registration.length);
  expect(source(runnerPath).split(JSON.stringify(thisTest)).length - 1).toBe(1);
  expect(source(planPath).match(new RegExp(thisTest, "g")) ?? []).toHaveLength(1);
});
