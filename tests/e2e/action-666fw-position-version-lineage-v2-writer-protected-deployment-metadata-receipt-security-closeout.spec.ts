import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

import { expect, test } from "@playwright/test";

const root = resolve(__dirname, "../..");
const actionPath =
  "docs/action-666fw-position-version-lineage-v2-writer-protected-deployment-metadata-receipt-security-closeout.md";
const evidencePath =
  "docs/evidence/action-666fw-position-version-lineage-v2-writer-protected-deployment-metadata-receipt-security-closeout.json";
const governancePath = "docs/security-closeout-governance.md";
const roadmapPath = "docs/ture-master-roadmap.md";
const ledgerPath = "docs/ture-current-state-ledger.md";
const registrationPath = "scripts/action-660j-provider-free-ci-registration.json";
const runnerPath = "scripts/action-660j-run-provider-free-ci-shard.mjs";
const metadataChannelPath =
  "lib/server/position-version-lineage-v2-writer-deployment-metadata-channel.ts";
const metadataRoutePath =
  "app/api/position-version-lineage-v2-writer/deployment-metadata/route.ts";
const plannedTransportPath =
  "lib/server/position-version-lineage-v2-writer-private-postgresql-transport.ts";
const thisTest =
  "tests/e2e/action-666fw-position-version-lineage-v2-writer-protected-deployment-metadata-receipt-security-closeout.spec.ts";

function source(relativePath: string) {
  return readFileSync(resolve(root, relativePath), "utf8");
}

function sha256(value: string) {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

test("666FW records a bounded static-workstream closeout against exact main", () => {
  const raw = source(evidencePath);
  const evidence = JSON.parse(raw);

  expect(evidence.contract_version).toBe(
    "trade.action666fw.position-version-lineage-v2-writer-protected-deployment-metadata-receipt-security-closeout.v1",
  );
  expect(evidence.action_id).toBe("ACTION_666FW");
  expect(evidence.decision_id).toBe("SECURITY_CLOSEOUT_666FW");
  expect(evidence.reviewed_revision).toEqual({
    protected_main_commit: "e0df5a2e9bdb37b4924d204519f84fe7dece747b",
    protected_main_tree: "ad3a1cd5b2378de855a0464e5584ab0d9cc713b0",
    exact_main_ci_run: 33026964955,
    exact_main_ci_conclusion: "success",
    focused_verification:
      "tests/e2e/action-666fv-position-version-lineage-v2-writer-protected-deployment-metadata-receipt-negative-disclosure-coverage-attestation-witness-consistency-proof-source-contract.spec.ts",
    predecessor_evidence: [
      "docs/evidence/action-666fu-position-version-lineage-v2-writer-protected-deployment-metadata-receipt-negative-disclosure-coverage-attestation-witness-consistency-proof-admission-review.json",
      "docs/evidence/action-666fv-position-version-lineage-v2-writer-protected-deployment-metadata-receipt-negative-disclosure-coverage-attestation-witness-consistency-proof-source-contract.json",
    ],
  });
  expect(evidence.roles).toEqual({
    product_owner: "Codex (appointed by user in task on 2026-08-27)",
    delivery_owner: "Codex",
    independent_reviewer:
      "Willy Simonsson (designated by user in task on 2026-08-27)",
  });
  expect(evidence.decision).toMatchObject({
    type: "close_static_workstream",
    runtime_activation_authorized: false,
    future_static_extension_authorized: false,
  });
  expect(evidence.protected_runtime_prerequisites).toEqual({
    secret_manager: "blocked",
    least_privileged_identity: "blocked",
    private_transport: "blocked",
    writer_invocation: "blocked",
    route_ui_binding: "blocked",
  });
  expect(sha256(raw)).toMatch(/^[a-f0-9]{64}$/);
});

test("666FW retains every fail-closed boundary and provider-free CI registration", () => {
  const documentation = [source(actionPath), source(evidencePath)].join("\n");
  const registration = JSON.parse(source(registrationPath)) as string[];

  expect(existsSync(resolve(root, metadataChannelPath))).toBe(false);
  expect(existsSync(resolve(root, metadataRoutePath))).toBe(false);
  expect(existsSync(resolve(root, plannedTransportPath))).toBe(false);
  expect(documentation).toMatch(/close_static_workstream/i);
  expect(documentation).toMatch(/no runtime capability/i);
  expect(source(governancePath)).toMatch(/close_static_workstream/i);
  expect(source(governancePath)).toMatch(/action 666fw/i);
  expect(source(roadmapPath)).toMatch(/action 666fw/i);
  expect(source(ledgerPath)).toMatch(/action 666fw/i);
  expect(registration.filter((entry) => entry === thisTest)).toEqual([thisTest]);
  expect(new Set(registration).size).toBe(registration.length);
  expect(source(runnerPath).split(JSON.stringify(thisTest)).length - 1).toBe(1);
});
