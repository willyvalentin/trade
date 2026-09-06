import { expect, test } from "@playwright/test";
import { createHash } from "node:crypto";
import { execFileSync, spawn, spawnSync } from "node:child_process";
import { once } from "node:events";
import { access, chmod, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

const repositoryRoot = path.resolve(__dirname, "../..");
const workflowPath = ".github/workflows/milestone-a-ci.yml";
const runnerPath = "scripts/action-660j-run-provider-free-ci-shard.mjs";
const registrationPath =
  "scripts/action-660j-provider-free-ci-registration.json";
const contractPath = "docs/action-660j-parallel-provider-free-verification.md";
const cacheContractPath = "docs/action-660n-lockfile-bound-npm-download-cache.md";
const cacheEvidencePath =
  "docs/evidence/action-660n-lockfile-bound-npm-download-cache.json";
const cancellationContractPath = "docs/ci-cancellation-reliability.md";
const contractSha256 =
  "816d1353541e3a703791644c2354a2edf7e47252fd656eba420e98a1792cec40";

type PlannedCommand = {
  label: string;
  runner: "node" | "npm" | "playwright" | "tsc";
  args: string[];
  node_options: string | null;
};

function command(
  label: string,
  runner: PlannedCommand["runner"],
  args: string[],
  nodeOptions: string | null = null,
): PlannedCommand {
  return { label, runner, args, node_options: nodeOptions };
}

function playwright(label: string, files: string[], reactServer = true) {
  return command(
    label,
    "playwright",
    ["test", ...files, "--workers=1"],
    reactServer ? "--conditions=react-server" : null,
  );
}

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
  "tests/e2e/rel-00-ci-b7-docs-only-ready-activation.spec.ts",
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
  "tests/e2e/action-666gd-immutable-exit-explanation-contract.spec.ts",
  "tests/e2e/action-666ge-canonical-rejected-result-contract.spec.ts",
  "tests/e2e/action-666gf-accepted-rejected-partition-contract.spec.ts",
  "tests/e2e/action-666gg-static-explanation-table-integrity.spec.ts",
  "tests/e2e/action-666gh-result-detachment-contract.spec.ts",
  "tests/e2e/action-666gi-accessibility-contract-selection.spec.ts",
  "tests/e2e/action-666gj-provider-free-exit-explanation-presentation-key.spec.ts",
  "tests/e2e/action-666gk-presentation-key-static-containment.spec.ts",
  "tests/e2e/action-666gl-advisory-accessibility-presentation-selection.spec.ts",
  "tests/e2e/action-666gm-provider-free-accessibility-announcement-metadata.spec.ts",
  "tests/e2e/action-666gn-accessibility-announcement-metadata-static-containment.spec.ts",
  "tests/e2e/action-666go-accessibility-announcement-metadata-partition-review.spec.ts",
  "tests/e2e/action-666gp-accessibility-announcement-metadata-rejected-result-review.spec.ts",
  "tests/e2e/action-666gq-accessibility-announcement-metadata-accepted-result-review.spec.ts",
  "tests/e2e/action-666gr-accessibility-announcement-metadata-cross-result-detachment-review.spec.ts",
  "tests/e2e/action-666gs-autonomous-milestone-b-v2-command-digest-selection.spec.ts",
  "tests/e2e/action-666gt-position-version-lineage-v2-writer-canonical-command-digest-builder.spec.ts",
  "tests/e2e/action-666gu-position-version-lineage-v2-command-digest-containment-review.spec.ts",
  "tests/e2e/action-666gv-autonomous-milestone-b-v2-committed-result-decoder-selection.spec.ts",
  "tests/e2e/action-666gw-position-version-lineage-v2-writer-strict-committed-result-decoder.spec.ts",
  "tests/e2e/action-666gx-position-version-lineage-v2-committed-result-decoder-containment-review.spec.ts",
  "tests/e2e/action-666gy-autonomous-milestone-b-v2-committed-result-receipt-selection.spec.ts",
  "tests/e2e/action-666gz-position-version-lineage-v2-writer-immutable-committed-result-receipt.spec.ts",
  "tests/e2e/action-666ha-position-version-lineage-v2-committed-result-receipt-containment-review.spec.ts",
  "tests/e2e/action-666hb-autonomous-milestone-b-v2-committed-result-receipt-detachment-selection.spec.ts",
  "tests/e2e/action-666hc-position-version-lineage-v2-committed-result-receipt-cross-result-detachment-review.spec.ts",
  "tests/e2e/action-666hd-autonomous-milestone-b-v2-committed-result-receipt-equivalence-selection.spec.ts",
  "tests/e2e/action-666he-position-version-lineage-v2-committed-result-receipt-equivalence-comparator.spec.ts",
  "tests/e2e/action-666hf-position-version-lineage-v2-committed-result-receipt-equivalence-comparator-review.spec.ts",
  "tests/e2e/action-666hg-autonomous-milestone-b-v2-committed-result-receipt-equivalence-scalar-isolation-selection.spec.ts",
  "tests/e2e/action-666hh-position-version-lineage-v2-committed-result-receipt-scalar-isolation-review.spec.ts",
  "tests/e2e/action-666hi-autonomous-milestone-b-v2-committed-result-receipt-repeated-verdict-detachment-selection.spec.ts",
  "tests/e2e/action-666hj-position-version-lineage-v2-committed-result-receipt-repeated-verdict-detachment-review.spec.ts",
  "tests/e2e/action-666hk-position-version-lineage-v2-committed-result-receipt-rejected-error-detachment-selection.spec.ts",
  "tests/e2e/action-666hl-position-version-lineage-v2-committed-result-receipt-rejected-error-detachment-review.spec.ts",
  "tests/e2e/action-666hm-position-version-lineage-v2-committed-result-receipt-cross-invocation-detachment-selection.spec.ts",
  "tests/e2e/action-666hn-position-version-lineage-v2-committed-result-receipt-cross-invocation-detachment-review.spec.ts",
  "tests/e2e/action-666ho-position-version-lineage-v2-committed-result-receipt-object-fault-rejection-selection.spec.ts",
  "tests/e2e/action-666hp-position-version-lineage-v2-committed-result-receipt-object-fault-rejection-review.spec.ts",
  "tests/e2e/action-666hq-position-version-lineage-v2-committed-result-receipt-accessor-fault-rejection-selection.spec.ts",
  "tests/e2e/action-666hr-position-version-lineage-v2-committed-result-receipt-accessor-fault-rejection-review.spec.ts",
  "tests/e2e/action-666hs-position-version-lineage-v2-committed-result-receipt-scalar-coercion-fault-rejection-selection.spec.ts",
  "tests/e2e/action-666ht-position-version-lineage-v2-committed-result-receipt-scalar-coercion-fault-rejection-review.spec.ts",
  "tests/e2e/action-666hu-position-version-lineage-v2-committed-result-receipt-cross-realm-rejection-selection.spec.ts",
  "tests/e2e/action-666hv-position-version-lineage-v2-committed-result-receipt-cross-realm-rejection-policy-implementation.spec.ts",
  "tests/e2e/action-666hw-position-version-lineage-v2-committed-result-receipt-cross-realm-rejection-policy-review.spec.ts",
  "tests/e2e/action-666hx-position-version-lineage-v2-committed-result-receipt-null-prototype-rejection-selection.spec.ts",
  "tests/e2e/action-666hy-position-version-lineage-v2-committed-result-receipt-null-prototype-rejection-review.spec.ts",
  "tests/e2e/action-666hz-position-version-lineage-v2-committed-result-receipt-non-enumerable-own-data-rejection-selection.spec.ts",
  "tests/e2e/action-666ia-position-version-lineage-v2-committed-result-receipt-non-enumerable-own-data-rejection-review.spec.ts",
  "tests/e2e/action-666ib-position-version-lineage-v2-committed-result-receipt-non-enumerable-extra-own-data-rejection-selection.spec.ts",
  "tests/e2e/action-666ic-position-version-lineage-v2-committed-result-receipt-non-enumerable-extra-own-data-rejection-review.spec.ts",
  "tests/e2e/action-666id-position-version-lineage-v2-committed-result-receipt-wrong-name-substitution-rejection-selection.spec.ts",
  "tests/e2e/action-666ie-position-version-lineage-v2-committed-result-receipt-wrong-name-substitution-rejection-review.spec.ts",
  "tests/e2e/action-666if-position-version-lineage-v2-committed-result-receipt-omitted-canonical-own-data-rejection-selection.spec.ts",
  "tests/e2e/action-666ig-position-version-lineage-v2-committed-result-receipt-omitted-canonical-own-data-rejection-review.spec.ts",
  "tests/e2e/action-666ih-position-version-lineage-v2-committed-result-receipt-omitted-disposition-own-data-rejection-selection.spec.ts",
  "tests/e2e/action-666ii-position-version-lineage-v2-committed-result-receipt-omitted-disposition-own-data-rejection-review.spec.ts",
  "tests/e2e/action-666ij-position-version-lineage-v2-committed-result-receipt-omitted-initial-history-identity-own-data-rejection-selection.spec.ts",
  "tests/e2e/action-666ik-position-version-lineage-v2-committed-result-receipt-omitted-initial-history-identity-own-data-rejection-review.spec.ts",
  "tests/e2e/action-666il-position-version-lineage-v2-committed-result-receipt-omitted-position-id-own-data-rejection-selection.spec.ts",
  "tests/e2e/action-666im-position-version-lineage-v2-committed-result-receipt-omitted-position-id-own-data-rejection-review.spec.ts",
  "tests/e2e/action-666in-position-version-lineage-v2-committed-result-receipt-omitted-position-version-own-data-rejection-selection.spec.ts",
  "tests/e2e/action-666io-position-version-lineage-v2-committed-result-receipt-omitted-position-version-own-data-rejection-review.spec.ts",
  "tests/e2e/action-666ip-position-version-lineage-v2-committed-result-receipt-undefined-canonical-command-digest-own-data-rejection-selection.spec.ts",
  "tests/e2e/action-666iq-position-version-lineage-v2-committed-result-receipt-undefined-canonical-command-digest-own-data-rejection-review.spec.ts",
  "tests/e2e/action-666ir-position-version-lineage-v2-committed-result-receipt-undefined-disposition-own-data-rejection-selection.spec.ts",
  "tests/e2e/action-666is-position-version-lineage-v2-committed-result-receipt-undefined-disposition-own-data-rejection-review.spec.ts",
  "tests/e2e/action-666it-milestone-b-reconciliation-closeout-decision.spec.ts",
  "tests/e2e/action-666iu-b03-local-sandbox-v2-writer-capability-proof.spec.ts",
  "tests/e2e/action-666iv-b03-remote-staging-admission.spec.ts",
  "tests/e2e/action-666iw-b03-staging-principal-scope-attestation-availability.spec.ts",
  "tests/e2e/action-666ix-milestone-b-local-sandbox-acceptance-closeout.spec.ts",
  "tests/e2e/action-666ja-b03-private-postgresql-transport.spec.ts",
  "tests/e2e/rel-00-ci-b0-baseline-and-charter.spec.ts",
  "tests/e2e/rel-00-ci-b1-change-classification.spec.ts",
  "tests/e2e/rel-00-ci-b2-raw-name-status-acquisition.spec.ts",
  "tests/e2e/rel-00-ci-b3-shadow-reconciliation.spec.ts",
  "tests/e2e/rel-00-ci-b4-required-check-protection-proof.spec.ts",
  "tests/e2e/rel-00-ci-b5-required-check-readback-candidate.spec.ts",
  "tests/e2e/rel-00-ci-b6-adversarial-verification.spec.ts",
];

const intelligenceTests = [
  "tests/e2e/ai-00.1-ture-setup-analyst-contract-freeze.spec.ts",
  "tests/e2e/ai-00.2-ture-setup-analyst-read-only-context-boundary.spec.ts",
  "tests/e2e/ai-00.3-ture-setup-analyst-shadow-trace-contract.spec.ts",
  "tests/e2e/ai-00.4-ture-setup-analyst-in-process-shadow-runner.spec.ts",
  "tests/e2e/ai-00.5-ture-setup-analyst-fixture-evaluation-harness.spec.ts",
  "tests/e2e/ai-00.6-ture-setup-analyst-promotion-evidence-review.spec.ts",
  "tests/e2e/ai-01.1-ture-setup-analyst-multi-fixture-baseline-comparison.spec.ts",
  "tests/e2e/ai-01.2-ture-setup-analyst-multi-fixture-baseline-adversarial-review.spec.ts",
  "tests/e2e/ai-01.3-ture-setup-analyst-fixture-identity-collision-review.spec.ts",
  "tests/e2e/ai-01.4-ture-setup-analyst-issued-fixture-admission.spec.ts",
  "tests/e2e/ai-02.1-ture-setup-analyst-canonical-outcome-projection.spec.ts",
  "tests/e2e/ai-02.2-ture-setup-analyst-canonical-outcome-issuer.spec.ts",
  "tests/e2e/ai-02.3-ture-setup-analyst-canonical-outcome-cohort-preflight.spec.ts",
  "tests/e2e/ai-02.4-ture-setup-analyst-legacy-evidence-quality-assessment.spec.ts",
  "tests/e2e/ai-02.5-ture-setup-analyst-canonical-evidence-source-selection.spec.ts",
  "tests/e2e/ai-02.6-ture-setup-analyst-canonical-evidence-receipt-profile.spec.ts",
  "tests/e2e/ai-02.8-ture-setup-analyst-staging-evidence-creation-admission.spec.ts",
  "tests/e2e/ai-02.10-ture-setup-analyst-active-evidence-contract.spec.ts",
  "tests/e2e/cat-00.2-sec-edgar-evidence-receipt.spec.ts",
  "tests/e2e/cat-00.3-sec-edgar-filing-content.spec.ts",
  "tests/e2e/cat-00.4-sec-edgar-retrieval-evidence.spec.ts",
  "tests/e2e/cat-00.5-sec-edgar-read-operation-plan.spec.ts",
  "tests/e2e/cat-00.6-sec-edgar-pre-read-authorization.spec.ts",
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

const shardNames = [
  "foundation",
  "replay-lineage",
  "snapshot-admission",
  "snapshot-issuance",
  "non-forgeable-authority",
  "lossless-scalar",
];

const expectedPlan: Record<string, PlannedCommand[]> = {
  foundation: [
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
  ],
  "replay-lineage": [
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
  ],
  "snapshot-admission": [
    playwright("Governed binding snapshot admission", [
      "tests/e2e/action-666bd-governed-binding-snapshot-admission.spec.ts",
      "tests/e2e/action-666cp-current-main-governed-binding-snapshot-admission-freeze.spec.ts",
    ]),
  ],
  "snapshot-issuance": [
    playwright("Governed binding snapshot issuance", [
      "tests/e2e/action-666bq-governed-binding-snapshot-issuance-successor.spec.ts",
      "tests/e2e/action-666cq-current-main-governed-binding-snapshot-issuance-freeze.spec.ts",
    ]),
  ],
  "non-forgeable-authority": [
    playwright("Non-forgeable observation authority", [
      "tests/e2e/action-666cs-current-main-non-forgeable-observation-authority.spec.ts",
      "tests/e2e/action-666cs-current-main-non-forgeable-observation-authority-freeze.spec.ts",
    ]),
  ],
  "lossless-scalar": [
    playwright("Lossless invalid-scalar observation", [
      "tests/e2e/action-666ct-current-main-lossless-invalid-scalar-observation.spec.ts",
      "tests/e2e/action-666ct-current-main-lossless-invalid-scalar-observation-freeze.spec.ts",
    ]),
  ],
};

async function source(relativePath: string) {
  return readFile(path.join(repositoryRoot, relativePath), "utf8");
}

function blockBetween(text: string, start: string, end?: string) {
  const startMarker = `  ${start}:`;
  const endMarker = end ? `  ${end}:` : null;
  const startIndex = text.indexOf(startMarker);
  const endIndex = endMarker ? text.indexOf(endMarker) : text.length;
  if (startIndex < 0 || endIndex <= startIndex) {
    throw new Error(`Missing or reordered job block: ${start}`);
  }
  return text.slice(startIndex, endIndex);
}

function occurrenceCount(text: string, needle: string) {
  return text.split(needle).length - 1;
}

test("preserves exact serial coverage in six closed static shard plans", async () => {
  const rawPlan = execFileSync(
    process.execPath,
    [path.join(repositoryRoot, runnerPath), "--plan"],
    { encoding: "utf8" },
  );
  const plan = JSON.parse(rawPlan) as Record<string, PlannedCommand[]>;

  expect(Object.keys(plan)).toEqual(shardNames);
  expect(plan).toEqual(expectedPlan);

  const referencedFiles = Object.values(plan)
    .flat()
    .flatMap((plannedCommand) =>
      plannedCommand.args.filter((argument) => argument.startsWith("tests/")),
    );
  const registeredFiles = JSON.parse(
    await source(registrationPath),
  ) as string[];
  expect(registeredFiles).toEqual(referencedFiles);
  expect(new Set(referencedFiles).size).toBe(referencedFiles.length);
  for (const relativePath of referencedFiles) {
    await expect(access(path.join(repositoryRoot, relativePath))).resolves.toBeUndefined();
  }

  for (const plannedCommand of Object.values(plan).flat()) {
    expect(["node", "npm", "playwright", "tsc"]).toContain(
      plannedCommand.runner,
    );
    if (plannedCommand.runner === "playwright") {
      expect(plannedCommand.args.at(-1)).toBe("--workers=1");
      expect(plannedCommand.node_options).toBe(
        plannedCommand.label === "Browser and server containment" ||
          plannedCommand.label === "Authenticated boundary"
          ? null
          : "--conditions=react-server",
      );
    } else {
      expect(plannedCommand.node_options).toBeNull();
    }
  }

  const invalid = spawnSync(
    process.execPath,
    [path.join(repositoryRoot, runnerPath), "unexpected-shard"],
    { encoding: "utf8" },
  );
  expect(invalid.status).toBe(2);
  expect(invalid.stderr).toContain(
    "Unknown provider-free verification shard: unexpected-shard",
  );

  const runner = await source(runnerPath);
  expect(runner).toContain('import { spawn } from "node:child_process"');
  expect(runner).not.toContain("spawnSync");
  expect(runner).toContain('process.on(signal, handler)');
  expect(runner).toContain('activeChild.kill(signal)');
  expect(runner).toContain('exitStatusForCancellation(signal)');
  expect(runner).toContain("shell: false");
});

test("forwards cancellation to the active command and exits before another command can start", async () => {
  const fixtureDirectory = await mkdtemp(
    path.join(os.tmpdir(), "ture-ci-cancellation-"),
  );
  const fakeNpmPath = path.join(fixtureDirectory, "npm");
  await writeFile(
    fakeNpmPath,
    "#!/bin/sh\nprintf 'fake-npm-started\\n'\ntrap \"printf 'fake-npm-terminated\\n'; exit 0\" TERM INT\nwhile :; do sleep 1; done\n",
  );
  await chmod(fakeNpmPath, 0o700);

  const runner = spawn(
    process.execPath,
    [path.join(repositoryRoot, runnerPath), "foundation"],
    {
      cwd: repositoryRoot,
      env: {
        ...process.env,
        PATH: `${fixtureDirectory}${path.delimiter}${process.env.PATH ?? ""}`,
      },
      stdio: ["ignore", "pipe", "pipe"],
    },
  );
  let output = "";
  let startSignal!: () => void;
  let rejectStart!: (error: Error) => void;
  const started = new Promise<void>((resolve, reject) => {
    startSignal = resolve;
    rejectStart = reject;
  });
  const timeout = setTimeout(
    () => rejectStart(new Error("Timed out waiting for the fake command to start")),
    10_000,
  );
  runner.stdout?.on("data", (chunk) => {
    output += chunk.toString();
    if (output.includes("fake-npm-started")) {
      startSignal();
    }
  });
  runner.stderr?.on("data", (chunk) => {
    output += chunk.toString();
  });
  runner.once("error", rejectStart);

  try {
    await started;
    const closed = once(runner, "close");
    expect(runner.kill("SIGTERM")).toBe(true);
    const [status, signal] = (await closed) as [number | null, NodeJS.Signals | null];

    expect(status).toBe(143);
    expect(signal).toBeNull();
    expect(output).toContain("fake-npm-started");
    expect(output).toContain("fake-npm-terminated");
    expect(output).not.toContain("::group::TypeScript");
  } finally {
    clearTimeout(timeout);
    if (runner.exitCode === null && runner.signalCode === null) {
      runner.kill("SIGKILL");
      await once(runner, "close");
    }
    await rm(fixtureDirectory, { force: true, recursive: true });
  }
});

test("records cancellation forwarding as a source-only reliability boundary", async () => {
  const contract = await source(cancellationContractPath);
  expect(contract).toContain("the six-shard Full CI\nsuite and its required aggregate are unchanged");
  expect(contract).toContain("forward `SIGINT` or `SIGTERM`");
  expect(contract).toContain("without beginning a later command");
  expect(contract).toContain("`shell: false`");
  expect(contract).toContain("It creates no CI deduplication path.");
  expect(contract).toContain("Netlify, application\nruntime, Supabase");
});

test("keeps the protected aggregate identity fail-closed over every shard", async () => {
  const workflow = await source(workflowPath);
  const jobsStart = workflow.indexOf("\njobs:\n");
  expect(jobsStart).toBeGreaterThanOrEqual(0);
  const jobIds = workflow
    .slice(jobsStart + 1)
    .split("\n")
    .filter((line) => /^  [a-z0-9-]+:$/.test(line))
    .map((line) => line.trim().slice(0, -1));
  expect(jobIds).toEqual([
    "draft-provider-free-verification",
    "ready-docs-only-classification",
    "provider-free-verification-shard",
    "provider-free-verification",
    "merge-candidate-provenance",
    "post-merge-candidate-provenance",
  ]);

  const draftJob = blockBetween(
    workflow,
    "draft-provider-free-verification",
    "ready-docs-only-classification",
  );

  const docsOnlyJob = blockBetween(
    workflow,
    "ready-docs-only-classification",
    "provider-free-verification-shard",
  );

  const shardJob = blockBetween(
    workflow,
    "provider-free-verification-shard",
    "provider-free-verification",
  );
  const aggregateJob = blockBetween(workflow, "provider-free-verification");

  expect(shardJob).toContain(
    "name: provider-free-verification / ${{ matrix.shard }}",
  );
  expect(draftJob).toContain("name: draft-provider-free-verification");
  expect(draftJob).toContain(
    "if: ${{ github.event_name == 'pull_request' && github.event.pull_request.draft == true }}",
  );
  expect(shardJob).toContain("needs.ready-docs-only-classification.outputs.disposition != 'docs_only'");
  expect(shardJob).toContain("github.event_name == 'schedule'");
  expect(shardJob).toContain("github.event_name == 'workflow_dispatch'");
  expect(shardJob).not.toContain("github.event_name == 'push'");
  expect(shardJob).toContain("needs:\n      - ready-docs-only-classification");
  expect(shardJob).toContain("timeout-minutes: 60");
  expect(shardJob).toContain("fail-fast: false");
  const workflowShards = shardJob
    .split("\n")
    .filter((line) => /^          - [a-z0-9-]+$/.test(line))
    .map((line) => line.trim().slice(2));
  expect(workflowShards).toEqual(shardNames);

  for (const required of [
    "ref: ${{ github.sha }}",
    "EXPECTED_REVISION: ${{ github.sha }}",
    'run: test "$(git rev-parse HEAD)" = "$EXPECTED_REVISION"',
    "persist-credentials: false",
    "node-version: 24.19.0",
    "cache: npm",
    "cache-dependency-path: package-lock.json",
    "run: npm ci --ignore-scripts --no-audit --no-fund",
    'run: node scripts/action-660j-run-provider-free-ci-shard.mjs "${{ matrix.shard }}"',
    "git diff --exit-code",
    "git diff --cached --exit-code",
  ]) {
    expect(occurrenceCount(shardJob, required)).toBe(1);
  }

  expect(aggregateJob).toContain("name: provider-free-verification");
  expect(aggregateJob).toContain("if: ${{ always() }}");
  expect(aggregateJob).toContain("- ready-docs-only-classification");
  expect(aggregateJob).toContain("- provider-free-verification-shard");
  expect(aggregateJob).toContain(
    "READY_DOCS_ONLY_RESULT: ${{ needs.ready-docs-only-classification.result }}",
  );
  expect(aggregateJob).toContain(
    "READY_DOCS_ONLY_DISPOSITION: ${{ needs.ready-docs-only-classification.outputs.disposition }}",
  );
  expect(aggregateJob).toContain(
    "SHARD_RESULT: ${{ needs.provider-free-verification-shard.result }}",
  );
  expect(aggregateJob).toContain('test "$READY_DOCS_ONLY_RESULT" = "success"');
  expect(aggregateJob).toContain('test "$SHARD_RESULT" = "success"');
  expect(aggregateJob).toContain('if [ "$EVENT_NAME" = "push" ]; then');
  expect(aggregateJob).toContain('test "$SHARD_RESULT" = "skipped"');
  expect(aggregateJob).not.toContain("continue-on-error");
  expect(docsOnlyJob).toContain("ref: ${{ github.sha }}");
  expect(docsOnlyJob).toContain("EXPECTED_REF: refs/pull/${{ github.event.pull_request.number }}/merge");
  expect(docsOnlyJob).toContain("fetch-depth: 0");
  expect(docsOnlyJob).toContain("persist-credentials: false");
  expect(docsOnlyJob).toContain("node-version: 24.19.0");
  expect(docsOnlyJob).toContain("rel-00-ci-b7-docs-only-classifier.mjs --github-output");

  for (const result of ["failure", "cancelled", "skipped", "timed_out"]) {
    const shellCheck = spawnSync(
      "/bin/sh",
      ["-c", 'test "$SHARD_RESULT" = "success"'],
      { env: { ...process.env, SHARD_RESULT: result } },
    );
    expect(shellCheck.status).not.toBe(0);
  }
  expect(
    spawnSync("/bin/sh", ["-c", 'test "$SHARD_RESULT" = "success"'], {
      env: { ...process.env, SHARD_RESULT: "success" },
    }).status,
  ).toBe(0);
});

test("binds npm download caching to the committed lockfile without weakening verification", async () => {
  const workflow = await source(workflowPath);
  const draftJob = blockBetween(
    workflow,
    "draft-provider-free-verification",
    "ready-docs-only-classification",
  );
  const shardJob = blockBetween(
    workflow,
    "provider-free-verification-shard",
    "provider-free-verification",
  );
  const [cacheContract, cacheEvidenceRaw] = await Promise.all([
    source(cacheContractPath),
    source(cacheEvidencePath),
  ]);
  const cacheEvidence = JSON.parse(cacheEvidenceRaw);
  const packageLockSha256 = createHash("sha256")
    .update(await source("package-lock.json"))
    .digest("hex");
  const workflowSha256 = createHash("sha256").update(workflow).digest("hex");

  expect(cacheEvidence).toEqual({
    contract_version: "action_660n_lockfile_bound_npm_download_cache_v1",
    authority: {
      base_main_commit: "0ce325d49ad3951cc898070b005fa1d224ef118a",
      base_main_tree: "5cee9a86bdf86bc0117255cb23a9be34e8631b73",
      branch_protection_change: false,
      production_deployment_authority: false,
    },
    lockfile_binding: {
      setup_action: "actions/setup-node@820762786026740c76f36085b0efc47a31fe5020",
      cache_input: "npm",
      cache_dependency_path: "package-lock.json",
      package_lock_sha256: packageLockSha256,
      workflow_sha256: workflowSha256,
      cached_material: "npm_download_cache_only",
      node_modules_cached: false,
      locked_install_command: "npm ci --ignore-scripts --no-audit --no-fund",
    },
    routes: {
      draft_job: "draft-provider-free-verification",
      full_matrix_job: "provider-free-verification-shard",
      draft_and_full_use_same_lockfile_binding: true,
      full_matrix_shard_count: 6,
      protected_aggregate: "provider-free-verification",
    },
    preserved_controls: {
      draft_vs_ready_gating: true,
      exact_revision_identity_checks: true,
      clean_tree_checks: true,
      npm_ci_ignore_scripts: true,
      fail_closed_aggregate: true,
      branch_protection_behavior: true,
    },
    delivery: {
      cache_hit_observed: false,
      draft_ci_observed: false,
      ready_exact_head_ci_observed: false,
      exact_main_ci_observed: false,
      production_deployment_authorized: false,
    },
  });
  expect(cacheContract).toContain("Action 660N");
  expect(cacheContract).toContain(cacheEvidencePath);
  expect(cacheContract).toContain(cacheEvidence.authority.base_main_commit);
  expect(cacheContract).toContain(cacheEvidence.authority.base_main_tree);
  expect(cacheContract).toContain("does not cache\n`node_modules`");

  for (const job of [draftJob, shardJob]) {
    expect(occurrenceCount(job, "cache: npm")).toBe(1);
    expect(occurrenceCount(job, "cache-dependency-path: package-lock.json")).toBe(1);
    expect(job).not.toContain("package-manager-cache: false");
    expect(occurrenceCount(job, "npm ci --ignore-scripts --no-audit --no-fund")).toBe(1);
    expect(job.indexOf("cache: npm")).toBeLessThan(
      job.indexOf("npm ci --ignore-scripts --no-audit --no-fund"),
    );
    expect(job.indexOf("Verify exact")).toBeLessThan(job.indexOf("cache: npm"));
    expect(job.indexOf("npm ci --ignore-scripts --no-audit --no-fund")).toBeLessThan(
      job.indexOf("Verify tracked source remained unchanged"),
    );
  }

  const aggregateJob = blockBetween(workflow, "provider-free-verification");
  expect(aggregateJob).toContain('test "$SHARD_RESULT" = "success"');
  expect(aggregateJob).not.toContain("continue-on-error");
});

test("freezes the bounded baseline and forbids production authority", async () => {
  const contract = await source(contractPath);
  expect(createHash("sha256").update(contract).digest("hex")).toBe(
    contractSha256,
  );
  expect(contract).toContain(
    "`960b88f85f3ad7be10c4b848c40127d63a21390b`, tree",
  );
  expect(contract).toContain(
    "`40b6384cfe95ee8a9e46980d5a5f861f6dc062a1`",
  );
  expect(contract).toContain(
    "Push-triggered exact-main run `32196042641`, job `95900159342`",
  );
  expect(contract).toContain("125 minutes of serial");
  expect(contract).toContain("`production_deployment_authority:false`");
  expect(contract).toContain(
    "Production deployment is neither required nor authorized.",
  );
  expect(contract).toContain("No branch-protection configuration change");
  expect(contract).toContain(
    "exact protected name `provider-free-verification`",
  );

  for (const text of [contract, await source(runnerPath)]) {
    expect(text).not.toMatch(
      /\b[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\b/i,
    );
    for (const prohibitedFragment of [
      ["gh", "p_"].join(""),
      ["github", "_pat_"].join(""),
      ["post", "gres://"].join(""),
      ["postgres", "ql://"].join(""),
    ]) {
      expect(text).not.toContain(prohibitedFragment);
    }
    expect(text).not.toMatch(
      new RegExp(`${["Bear", "er"].join("")}\\s+`, "i"),
    );
  }
});
