#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const registrationPath = path.join(
  repositoryRoot,
  "scripts",
  "action-660j-provider-free-ci-registration.json",
);

const foundationTests = [
  "tests/e2e/action-650-production-data-access-containment.spec.ts",
  "tests/e2e/action-307k-proxy-runtime-crash-isolation.spec.ts",
  "tests/e2e/action-652n-auth-route-origin-csrf-remediation.spec.ts",
  "tests/e2e/api-auth-middleware-boundary-audit.spec.ts",
  "tests/e2e/action-652b-authenticated-browser-data-migration.spec.ts",
  "tests/e2e/action-652f-server-client-containment.spec.ts",
  "tests/e2e/action-660f-dashboard-owner-relation-disambiguation.spec.ts",
  "tests/e2e/action-660g-ma15-verified-production-reclosure.spec.ts",
  "tests/e2e/action-660h-manual-ma13-merge-control.spec.ts",
  "tests/e2e/action-660i-ma13-verified-branch-protection-closure.spec.ts",
  "tests/e2e/action-660j-parallel-provider-free-verification.spec.ts",
  "tests/e2e/action-660k-cost-bounded-provider-free-verification.spec.ts",
  "tests/e2e/action-660o-merge-candidate-provenance.spec.ts",
  "tests/e2e/action-660l-next-security-release-gate.spec.ts",
  "tests/e2e/action-660m-current-production-reclosure.spec.ts",
  "tests/e2e/action-666cr-current-main-roadmap-ledger-reconciliation.spec.ts",
  "tests/e2e/action-666da-current-main-track2-milestone-b-reconciliation.spec.ts",
  "tests/e2e/action-666db-current-main-position-version-schema-reconciliation.spec.ts",
  "tests/e2e/action-666dc-position-version-schema-migration-design-and-read-only-backfill-preflight.spec.ts",
  "tests/e2e/action-666dd-authorized-position-version-read-only-backfill-inventory-execution.spec.ts",
  "tests/e2e/action-666de-deterministic-recommendation-lineage-backfill-contract.spec.ts",
  "tests/e2e/action-666df-canonical-recommendation-identity-reconciliation.spec.ts",
  "tests/e2e/action-666dg-append-only-position-version-history-decision.spec.ts",
  "tests/e2e/action-666dh-position-version-history-source-migration-design.spec.ts",
  "tests/e2e/action-666di-position-version-history-source-migration-bytes.spec.ts",
  "tests/e2e/action-666dj-position-version-history-isolated-staging-apply-and-catalog-proof.spec.ts",
  "tests/e2e/action-666dk-position-version-history-authorized-production-apply-and-catalog-proof.spec.ts",
  "tests/e2e/action-666dl-position-version-history-generated-types-and-ma09-provenance-refresh.spec.ts",
  "tests/e2e/action-666dm-market-observation-provenance.spec.ts",
  "tests/e2e/action-666dn-market-observation-readback-boundary.spec.ts",
  "tests/e2e/action-666do-market-price-attestation-boundary.spec.ts",
  "tests/e2e/action-666dp-durable-exit-queue-source-migration-design.spec.ts",
  "tests/e2e/action-666dq-transactional-recommendation-position-handoff-design.spec.ts",
  "tests/e2e/action-666dr-transactional-recommendation-position-writer-source-contract.spec.ts",
  "tests/e2e/action-666ds-transactional-recommendation-position-writer-static-implementation-boundary.spec.ts",
  "tests/e2e/action-666dt-transactional-recommendation-position-writer-implementation-preflight.spec.ts",
  "tests/e2e/action-666du-transactional-recommendation-position-writer-transaction-capability-contract.spec.ts",
  "tests/e2e/action-666dv-transactional-recommendation-position-writer-authenticated-server-owner-context-contract.spec.ts",
  "tests/e2e/action-666dw-transactional-recommendation-position-writer-durable-idempotency-storage-contract.spec.ts",
  "tests/e2e/action-666dx-transactional-recommendation-position-writer-owner-bound-position-effect-contract.spec.ts",
  "tests/e2e/action-666dy-transactional-recommendation-position-writer-commit-visible-result-contract.spec.ts",
  "tests/e2e/action-666dz-transactional-recommendation-position-writer-failure-atomicity-contract.spec.ts",
  "tests/e2e/action-666ea-transactional-recommendation-position-writer-admission-bundle-contract.spec.ts",
  "tests/e2e/action-666eb-transactional-recommendation-position-writer-implementation-authority-decision.spec.ts",
  "tests/e2e/action-666ec-transactional-recommendation-position-writer-private-server-adapter.spec.ts",
  "tests/e2e/action-666ed-transactional-recommendation-position-writer-owner-bound-command-port-preflight.spec.ts",
  "tests/e2e/action-666ee-position-version-lineage-additive-migration-package.spec.ts",
  "tests/e2e/action-666ef-position-version-lineage-isolated-staging-apply-and-catalog-proof.spec.ts",
  "tests/e2e/action-666eg-position-version-lineage-production-apply-decision-and-preflight.spec.ts",
  "tests/e2e/action-666eh-position-version-lineage-authorized-production-apply-and-catalog-proof.spec.ts",
  "tests/e2e/action-666ei-position-version-lineage-owner-bound-backfill-admission-preflight.spec.ts",
  "tests/e2e/action-666ej-position-version-lineage-control-character-projection-provenance-reconciliation.spec.ts",
  "tests/e2e/action-666ek-position-version-lineage-versioned-projection-successor-contract.spec.ts",
  "tests/e2e/action-666el-position-version-lineage-projection-contract-storage-design.spec.ts",
  "tests/e2e/action-666em-position-version-lineage-projection-contract-additive-migration-package.spec.ts",
  "tests/e2e/action-666en-position-version-lineage-projection-contract-isolated-staging-apply-catalog-proof.spec.ts",
  "tests/e2e/action-666eo-position-version-lineage-projection-contract-v2-writer-command-port-design.spec.ts",
  "tests/e2e/action-666ep-position-version-lineage-v2-writer-command-port-admission-preflight.spec.ts",
  "tests/e2e/action-666eq-position-version-lineage-v2-writer-storage-routine-package-design.spec.ts",
  "tests/e2e/action-666er-position-version-lineage-v2-writer-storage-routine-source-migration-package.spec.ts",
  "tests/e2e/action-666es-position-version-lineage-v2-writer-staging-apply-catalog-proof.spec.ts",
  "tests/e2e/action-666et-position-version-lineage-v2-writer-receipt-foreign-key-index-source-migration-package.spec.ts",
  "tests/e2e/action-666eu-position-version-lineage-v2-writer-receipt-foreign-key-index-staging-apply-catalog-proof.spec.ts",
  "tests/e2e/action-666ev-position-version-lineage-v2-writer-production-apply-decision-and-preflight.spec.ts",
  "tests/e2e/action-666ew-projection-marker-production-apply-decision-and-preflight.spec.ts",
  "tests/e2e/action-666ex-projection-marker-production-apply-and-catalog-proof.spec.ts",
  "tests/e2e/action-666ey-position-version-lineage-v2-writer-production-apply-decision-and-preflight.spec.ts",
  "tests/e2e/action-666ez-position-version-lineage-v2-writer-production-apply-and-catalog-proof.spec.ts",
  "tests/e2e/action-666fa-position-version-lineage-v2-writer-generated-types-provenance-and-runtime-binding-decision.spec.ts",
  "tests/e2e/action-666fb-position-version-lineage-v2-writer-private-command-port-runtime-binding-admission-preflight.spec.ts",
  "tests/e2e/action-666fc-position-version-lineage-v2-writer-private-non-data-api-command-port-source-contract.spec.ts",
  "tests/e2e/action-666fd-position-version-lineage-v2-writer-private-non-data-api-transport-implementation-preflight.spec.ts",
  "tests/e2e/action-666fe-position-version-lineage-v2-writer-private-non-data-api-transport-dependency-and-credential-design.spec.ts",
  "tests/e2e/action-666ff-position-version-lineage-v2-writer-private-non-data-api-transport-dependency-lockfile-source-installation.spec.ts",
  "tests/e2e/action-666fg-position-version-lineage-v2-writer-private-non-data-api-transport-credential-provisioning-and-connection-admission-preflight.spec.ts",
  "tests/e2e/action-666fh-position-version-lineage-v2-writer-private-non-data-api-transport-continuation-scope-and-evidence-admission-review.spec.ts",
  "tests/e2e/action-666fi-position-version-lineage-v2-writer-protected-server-secret-manager-capability-and-named-secret-provisioning-admission-review.spec.ts",
  "tests/e2e/action-666fj-position-version-lineage-v2-writer-protected-deployment-secret-manager-identity-and-access-scope-evidence-capture.spec.ts",
  "tests/e2e/action-666fk-position-version-lineage-v2-writer-protected-deployment-metadata-authentication-and-value-free-secret-scope-read-admission-review.spec.ts",
  "tests/e2e/action-666fl-position-version-lineage-v2-writer-protected-deployment-authentication-authority-and-audit-safe-metadata-channel-design.spec.ts",
  "tests/e2e/action-666fm-position-version-lineage-v2-writer-protected-deployment-authentication-authority-and-audit-safe-metadata-channel-implementation-admission-review.spec.ts",
  "tests/e2e/action-666fn-position-version-lineage-v2-writer-protected-deployment-metadata-receipt-schema-and-negative-disclosure-contract.spec.ts",
  "tests/e2e/action-666fo-position-version-lineage-v2-writer-protected-deployment-metadata-receipt-negative-disclosure-test-vectors.spec.ts",
  "tests/e2e/action-666fp-position-version-lineage-v2-writer-protected-deployment-metadata-receipt-negative-disclosure-coverage-reconciliation.spec.ts",
  "tests/e2e/action-666fq-position-version-lineage-v2-writer-protected-deployment-metadata-receipt-negative-disclosure-coverage-attestation-design.spec.ts",
  "tests/e2e/action-666fr-position-version-lineage-v2-writer-protected-deployment-metadata-receipt-negative-disclosure-coverage-attestation-witness-catalog-design.spec.ts",
  "tests/e2e/action-666fs-position-version-lineage-v2-writer-protected-deployment-metadata-receipt-negative-disclosure-coverage-attestation-witness-integrity-contract-design.spec.ts",
  "tests/e2e/action-666ft-position-version-lineage-v2-writer-protected-deployment-metadata-receipt-negative-disclosure-coverage-attestation-witness-consistency-proof-design.spec.ts",
  "tests/e2e/action-666fu-position-version-lineage-v2-writer-protected-deployment-metadata-receipt-negative-disclosure-coverage-attestation-witness-consistency-proof-admission-review.spec.ts",
  "tests/e2e/action-666fv-position-version-lineage-v2-writer-protected-deployment-metadata-receipt-negative-disclosure-coverage-attestation-witness-consistency-proof-source-contract.spec.ts",
  "tests/e2e/action-666fw-position-version-lineage-v2-writer-protected-deployment-metadata-receipt-security-closeout.spec.ts",
  "tests/e2e/action-666fx-post-closeout-delivery-risk-and-ci-classification.spec.ts",
  "tests/e2e/action-666fy-draft-ci-aggregate-required-check-impact-review.spec.ts",
  "tests/e2e/action-666fz-autonomous-milestone-b-product-outcome-selection.spec.ts",
  "tests/e2e/action-666ga-provider-free-exit-decision-explanation.spec.ts",
  "tests/e2e/action-666gb-exit-explanation-static-scope-review.spec.ts",
  "tests/e2e/action-666gc-exit-explanation-adversarial-input-contract.spec.ts",
];

const intelligenceTests = [
  "tests/e2e/action-664a-canonical-recommendation-evaluation.spec.ts",
  "tests/e2e/action-664b-canonical-evaluation-projection-adapters.spec.ts",
  "tests/e2e/action-664c-canonical-evaluation-persistence-contract.spec.ts",
  "tests/e2e/action-664d-additive-evaluation-storage.spec.ts",
  "tests/e2e/action-664e-canonical-capture-orchestrator.spec.ts",
  "tests/e2e/action-664f-canonical-quality-read-model.spec.ts",
  "tests/e2e/action-664g-canonical-quality-metrics.spec.ts",
  "tests/e2e/action-664h-canonical-quality-scorecard.spec.ts",
  "tests/e2e/action-664j-foundation-review-remediation.spec.ts",
];

function command(label, runner, args, nodeOptions = null) {
  return Object.freeze({
    label,
    runner,
    args: Object.freeze(args),
    node_options: nodeOptions,
  });
}

function playwright(label, tests, reactServer = true) {
  return command(
    label,
    "playwright",
    ["test", ...tests, "--workers=1"],
    reactServer ? "--conditions=react-server" : null,
  );
}

export const providerFreeVerificationShardNames = Object.freeze([
  "foundation",
  "replay-lineage",
  "snapshot-admission",
  "snapshot-issuance",
  "non-forgeable-authority",
  "lossless-scalar",
]);

export const providerFreeVerificationPlan = Object.freeze({
  foundation: Object.freeze([
    command("Lint", "npm", ["run", "lint", "--", "--max-warnings=8"]),
    command("TypeScript", "tsc", ["--noEmit", "--incremental", "false"]),
    command("Production dependency audit", "npm", [
      "audit",
      "--audit-level=high",
      "--no-fund",
    ]),
    command("Production build", "npm", ["run", "build"]),
    playwright("Browser and server containment", foundationTests, false),
    playwright(
      "Authenticated boundary",
      ["tests/e2e/action-652-authentication-boundary.spec.ts"],
      false,
    ),
    command("Catalog and migration evidence contract V5", "node", [
      "tests/e2e/action-652-current-catalog-migration-evidence-contract-v5.spec.ts",
    ]),
    command("Catalog evidence independent oracle", "node", [
      "tests/e2e/action-652-current-catalog-migration-evidence-contract-v5-independent.spec.ts",
    ]),
    command("Catalog evidence portability oracle", "node", [
      "tests/e2e/action-652-current-catalog-migration-evidence-contract-v5-portability.spec.ts",
    ]),
    command("Generated-types provenance V1", "node", [
      "tests/e2e/action-652-generated-types-provenance-v1.spec.mjs",
    ]),
    command("Generated-types provenance V2", "node", [
      "tests/e2e/action-660-ma09-generated-types-provenance-v2.spec.mjs",
    ]),
    playwright("Provider-free intelligence contract", intelligenceTests),
    playwright("Predictive explanation foundation", [
      "tests/e2e/action-666m-predictive-outcome-explanation.spec.ts",
      "tests/e2e/action-666cj-current-main-predictive-explanation-freeze.spec.ts",
    ]),
    playwright("Model-improvement proposal foundation", [
      "tests/e2e/action-666v-governed-model-improvement-proposal.spec.ts",
      "tests/e2e/action-666ck-current-main-model-improvement-proposal-freeze.spec.ts",
    ]),
    playwright("Completed improvement evidence adapter", [
      "tests/e2e/action-666ac-completed-improvement-evidence-adapter.spec.ts",
      "tests/e2e/action-666cl-current-main-improvement-evidence-adapter-freeze.spec.ts",
    ]),
    playwright("Completed improvement evidence capture", [
      "tests/e2e/action-666aj-completed-improvement-evidence-capture.spec.ts",
      "tests/e2e/action-666cm-current-main-completed-improvement-evidence-capture-freeze.spec.ts",
    ]),
    playwright("Frozen improvement binding store", [
      "tests/e2e/action-666ax-improvement-binding-store.spec.ts",
      "tests/e2e/action-666co-current-main-frozen-improvement-binding-store-freeze.spec.ts",
    ]),
  ]),
  "replay-lineage": Object.freeze([
    playwright("Governed improvement end-to-end replay", [
      "tests/e2e/action-666aq-governed-improvement-end-to-end-replay.spec.ts",
      "tests/e2e/action-666cn-current-main-governed-improvement-end-to-end-replay-freeze.spec.ts",
    ]),
    playwright("Provenance-bound observation verification", [
      "tests/e2e/action-666cu-current-main-provenance-bound-observation-verification.spec.ts",
      "tests/e2e/action-666cu-current-main-provenance-bound-observation-verification-freeze.spec.ts",
    ]),
    playwright("Private atomic observation authority", [
      "tests/e2e/action-666cv-current-main-private-atomic-observation-authority.spec.ts",
      "tests/e2e/action-666cv-current-main-private-atomic-observation-authority-freeze.spec.ts",
    ]),
    playwright("Integrity and provenance separation", [
      "tests/e2e/action-666cw-current-main-integrity-provenance-separated-observation-authority.spec.ts",
      "tests/e2e/action-666cw-current-main-integrity-provenance-separated-observation-authority-freeze.spec.ts",
    ]),
    playwright("Callback-free atomic observation", [
      "tests/e2e/action-666cx-current-main-callback-free-atomic-observation.spec.ts",
      "tests/e2e/action-666cx-current-main-callback-free-atomic-observation-freeze.spec.ts",
    ]),
    playwright("Lossless immutable byte snapshot", [
      "tests/e2e/action-666cy-current-main-lossless-immutable-byte-snapshot.spec.ts",
      "tests/e2e/action-666cy-current-main-lossless-immutable-byte-snapshot-freeze.spec.ts",
    ]),
    playwright("Lossless immutable byte snapshot authority", [
      "tests/e2e/action-666cz-current-main-lossless-immutable-byte-snapshot-authority.spec.ts",
      "tests/e2e/action-666cz-current-main-lossless-immutable-byte-snapshot-authority-freeze.spec.ts",
    ]),
  ]),
  "snapshot-admission": Object.freeze([
    playwright("Governed binding snapshot admission", [
      "tests/e2e/action-666bd-governed-binding-snapshot-admission.spec.ts",
      "tests/e2e/action-666cp-current-main-governed-binding-snapshot-admission-freeze.spec.ts",
    ]),
  ]),
  "snapshot-issuance": Object.freeze([
    playwright("Governed binding snapshot issuance", [
      "tests/e2e/action-666bq-governed-binding-snapshot-issuance-successor.spec.ts",
      "tests/e2e/action-666cq-current-main-governed-binding-snapshot-issuance-freeze.spec.ts",
    ]),
  ]),
  "non-forgeable-authority": Object.freeze([
    playwright("Non-forgeable observation authority", [
      "tests/e2e/action-666cs-current-main-non-forgeable-observation-authority.spec.ts",
      "tests/e2e/action-666cs-current-main-non-forgeable-observation-authority-freeze.spec.ts",
    ]),
  ]),
  "lossless-scalar": Object.freeze([
    playwright("Lossless invalid-scalar observation", [
      "tests/e2e/action-666ct-current-main-lossless-invalid-scalar-observation.spec.ts",
      "tests/e2e/action-666ct-current-main-lossless-invalid-scalar-observation-freeze.spec.ts",
    ]),
  ]),
});

function registeredTestPaths() {
  const parsed = JSON.parse(readFileSync(registrationPath, "utf8"));
  if (
    !Array.isArray(parsed) ||
    parsed.some(
      (entry) =>
        typeof entry !== "string" ||
        !entry.startsWith("tests/") ||
        !/\.(?:ts|mjs)$/.test(entry),
    )
  ) {
    throw new Error("Invalid provider-free verification registration manifest");
  }
  if (new Set(parsed).size !== parsed.length) {
    throw new Error("Duplicate provider-free verification registration");
  }
  return parsed;
}

function assertRegisteredCoverage() {
  const plannedTestPaths = Object.values(providerFreeVerificationPlan)
    .flat()
    .flatMap((plannedCommand) =>
      plannedCommand.args.filter((argument) => argument.startsWith("tests/")),
    );
  const registered = registeredTestPaths();
  if (
    plannedTestPaths.length !== registered.length ||
    plannedTestPaths.some((entry, index) => entry !== registered[index])
  ) {
    throw new Error(
      "Provider-free verification plan does not match its registration manifest",
    );
  }
}

function executableFor(runner) {
  switch (runner) {
    case "node":
      return process.execPath;
    case "npm":
      return "npm";
    case "playwright":
      return path.join(repositoryRoot, "node_modules", ".bin", "playwright");
    case "tsc":
      return path.join(repositoryRoot, "node_modules", ".bin", "tsc");
    default:
      throw new Error(`Unsupported runner: ${runner}`);
  }
}

function runShard(shardName) {
  if (!providerFreeVerificationShardNames.includes(shardName)) {
    process.stderr.write(`Unknown provider-free verification shard: ${shardName}\n`);
    return 2;
  }

  for (const plannedCommand of providerFreeVerificationPlan[shardName]) {
    process.stdout.write(`::group::${plannedCommand.label}\n`);
    const environment = { ...process.env };
    if (plannedCommand.node_options === null) {
      delete environment.NODE_OPTIONS;
    } else {
      environment.NODE_OPTIONS = plannedCommand.node_options;
    }
    const result = spawnSync(
      executableFor(plannedCommand.runner),
      plannedCommand.args,
      {
        cwd: repositoryRoot,
        env: environment,
        shell: false,
        stdio: "inherit",
      },
    );
    process.stdout.write("::endgroup::\n");
    if (result.error) {
      process.stderr.write(`${result.error.message}\n`);
      return 1;
    }
    if (result.signal || result.status !== 0) {
      return result.status ?? 1;
    }
  }
  return 0;
}

function main() {
  assertRegisteredCoverage();
  if (process.argv[2] === "--plan") {
    process.stdout.write(`${JSON.stringify(providerFreeVerificationPlan)}\n`);
    return 0;
  }
  return runShard(process.argv[2]);
}

const invokedPath = process.argv[1]
  ? pathToFileURL(path.resolve(process.argv[1])).href
  : null;
if (invokedPath === import.meta.url) {
  process.exitCode = main();
}
