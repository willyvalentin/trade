#!/usr/bin/env node

import { execFileSync } from "child_process";
import { createHash } from "crypto";
import { existsSync, readdirSync, readFileSync, statSync } from "fs";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "..");
const expectedBranch = "dev/safe-post-recovery-work";
const expectedStaticBatchCommit = "9b55e5a";

const requiredFiles = [
  "docs/action-309-post-recovery-safe-development-protocol.md",
  "docs/replay-with-signal-package-result-model.md",
  "docs/replay-with-signal-package-static-simulation.md",
  "docs/replay-with-signal-package-static-fixtures.md",
  "docs/replay-with-signal-package-static-summary.md",
  "docs/replay-with-signal-package-static-inspection-report.md",
  "docs/replay-with-signal-package-static-preview.md",
  "docs/replay-with-signal-package-static-preview-golden-snapshots.md",
  "docs/action-317-post-recovery-static-replay-release-manifest.md",
  "docs/action-318-static-replay-batch-commit-readiness-checklist.md",
  "lib/replay-with-signal-package-result-model.ts",
  "lib/replay-with-signal-package-static-simulation.ts",
  "lib/replay-with-signal-package-static-fixtures.ts",
  "lib/replay-with-signal-package-static-summary.ts",
  "lib/replay-with-signal-package-static-inspection-report.ts",
  "lib/replay-with-signal-package-static-preview.ts",
  "scripts/action-309-post-recovery-safety-guard.mjs",
  "scripts/replay-with-signal-package-static-preview.mjs",
  "scripts/replay-with-signal-package-static-preview-verify-golden.mjs",
  "scripts/action-317-static-release-manifest-verify.mjs",
  "scripts/action-318-static-replay-batch-commit-readiness-verify.mjs",
  "tests/e2e/action-309-post-recovery-safe-development-protocol.spec.ts",
  "tests/e2e/replay-with-signal-package-result-model.spec.ts",
  "tests/e2e/replay-with-signal-package-static-simulation.spec.ts",
  "tests/e2e/replay-with-signal-package-static-fixtures.spec.ts",
  "tests/e2e/replay-with-signal-package-static-summary.spec.ts",
  "tests/e2e/replay-with-signal-package-static-inspection-report.spec.ts",
  "tests/e2e/replay-with-signal-package-static-preview.spec.ts",
  "tests/e2e/replay-with-signal-package-static-preview-golden.spec.ts",
  "tests/e2e/action-317-post-recovery-static-replay-release-manifest.spec.ts",
  "tests/e2e/action-318-static-replay-batch-commit-readiness-checklist.spec.ts",
  "tests/fixtures/replay-with-signal-package-static-preview.markdown.golden.md",
  "tests/fixtures/replay-with-signal-package-static-preview.json.golden.json",
];

const allowedAction319ImplementationFiles = [
  "app/api/runtime-health/ping/route.ts",
  "docs/action-319-static-replay-batch-post-commit-verification.md",
  "docs/action-320-static-replay-branch-package-manifest.md",
  "docs/action-321-ture-roadmap-reconciliation-after-recovery.md",
  "docs/action-322-ture-product-roadmap-index.md",
  "docs/action-323-recommendation-engine-readiness-map.md",
  "docs/action-324-recommendation-engine-code-surface-inventory.md",
  "docs/action-325-recommendation-quality-gates-audit.md",
  "docs/action-326-setup-taxonomy-and-confidence-calibration-map.md",
  "docs/action-327-learning-backfill-runtime-rollout-plan.md",
  "docs/action-328-product-ux-surface-map.md",
  "docs/action-329-recommendation-engine-gate-test-plan.md",
  "docs/action-330-confidence-calibration-static-metric-spec.md",
  "docs/action-331-intelligence-first-roadmap-reprioritization.md",
  "docs/action-332-intelligence-data-collection-readiness-map.md",
  "docs/action-333-historical-data-backfill-existing-coverage-audit.md",
  "docs/action-334-recommendation-snapshot-completeness-audit.md",
  "docs/action-335-learning-outcome-dataset-design.md",
  "docs/action-336-intelligence-context-schema-draft.md",
  "docs/action-337-pattern-discovery-and-confidence-calibration-roadmap.md",
  "docs/action-338-runtime-ping-only-rollout-checklist.md",
  "docs/action-339-historical-backfill-cost-and-provider-capacity-plan.md",
  "docs/action-340-snapshot-field-inventory-against-existing-schema.md",
  "docs/action-341-learning-dataset-static-fixture-spec.md",
  "docs/action-342-intelligence-context-static-fixture-spec.md",
  "docs/action-343-pattern-insight-static-type-spec.md",
  "docs/action-344-runtime-ping-only-route-implementation-plan.md",
  "docs/action-345-first-tiny-provider-capacity-experiment-plan.md",
  "docs/action-346-existing-schema-compatibility-matrix.md",
  "docs/action-347-learning-dataset-static-fixture-implementation-plan.md",
  "docs/action-348-intelligence-context-static-fixture-implementation-plan.md",
  "docs/action-349-pattern-insight-static-fixture-spec.md",
  "docs/action-350-runtime-ping-only-route-approval-gate.md",
  "docs/action-351-first-tiny-provider-capacity-experiment-approval-gate.md",
  "docs/action-352-snapshot-to-learning-dataset-mapper-plan.md",
  "docs/action-353-learning-dataset-static-fixture-implementation-approval-gate.md",
  "docs/action-354-intelligence-context-static-fixture-implementation-approval-gate.md",
  "docs/action-355-pattern-insight-static-fixture-implementation-plan.md",
  "docs/action-356-pattern-insight-static-fixture-implementation-approval-gate.md",
  "docs/action-357-pattern-insight-static-fixture-implementation.md",
  "docs/action-358-runtime-ping-only-route-implementation-readiness-review.md",
  "docs/action-359-runtime-ping-only-route-implementation-approval-gate.md",
  "docs/action-360-runtime-ping-only-route-implementation.md",
  "docs/action-361-runtime-ping-only-local-implementation-verification-and-rollout-readiness-review.md",
  "docs/action-362-runtime-ping-only-preview-deploy-approval-gate.md",
  "docs/action-363-runtime-ping-preview-deployment-preflight-blocker-review-and-revision-freeze-readiness.md",
  "docs/action-364-immutable-preview-revision-preparation-approval-gate.md",
  "docs/action-365-option-b-immutable-preview-revision-preparation.md",
  "docs/action-365-preview-deployment-input-manifest.json",
  "docs/action-366-corrected-immutable-preview-candidate-preparation-approval-gate.md",
  "docs/action-367-read-only-dependency-bridge-capability-verification.md",
  "docs/action-367-read-only-dependency-bridge-capability-evidence.json",
  "docs/action-368-isolated-dependency-materialization-strategy-approval-gate.md",
  "docs/action-369-copy-on-write-dependency-clone-capability-verification.md",
  "docs/action-369-copy-on-write-dependency-clone-capability-evidence.json",
  "docs/action-370-corrected-immutable-preview-candidate-preparation.md",
  "docs/action-370-preview-deployment-input-manifest.json",
  "docs/action-370-corrected-immutable-preview-candidate-binding-evidence.json",
  "docs/action-371-exact-revision-preview-deployment-execution-approval-gate.md",
  "docs/action-372-exact-revision-preview-deployment-and-validation.md",
  "docs/action-372-exact-revision-preview-deployment-evidence.json",
  "docs/action-373-approved-preview-tooling-and-non-production-target-binding-readiness-gate.md",
  "docs/action-374-controlled-preview-tooling-materialization-approval-gate.md",
  "docs/action-375-netlify-cli-version-package-provenance-and-integrity-resolution.md",
  "docs/action-375-netlify-cli-version-package-provenance-and-integrity-evidence.json",
  "docs/action-376-controlled-netlify-cli-materialization-and-offline-capability-verification.md",
  "docs/action-376-controlled-netlify-cli-materialization-and-offline-capability-evidence.json",
  "docs/action-377-authentication-and-non-production-site-binding-approval-gate.md",
  "docs/action-378-authentication-and-non-production-target-verification.md",
  "docs/action-378-authentication-and-non-production-target-verification-evidence.json",
  "docs/action-379-operator-authorized-authentication-and-exact-non-production-target-verification.md",
  "docs/action-379-operator-authorized-authentication-and-target-evidence.json",
  "docs/action-380-learning-dataset-static-fixture-implementation.md",
  "docs/action-381-intelligence-context-static-fixture-implementation.md",
  "docs/action-382-intelligence-context-to-learning-dataset-compatibility-test-approval-gate.md",
  "docs/action-383-intelligence-context-to-learning-dataset-static-compatibility-tests.md",
  "docs/action-384-learning-dataset-to-pattern-insight-evidence-compatibility-test-approval-gate.md",
  "docs/action-385-learning-dataset-to-pattern-insight-static-evidence-compatibility-tests.md",
  "docs/action-386-static-intelligence-package-consolidation-and-mapper-readiness-review.md",
  "docs/action-387-snapshot-to-learning-dataset-mapper-implementation-approval-gate.md",
  "docs/action-388-snapshot-to-learning-dataset-mapper-implementation.md",
  "docs/action-389-pure-mapper-independent-verification-and-fixture-coverage-audit.md",
  "docs/action-390-pure-mapper-contract-remediation-approval-gate.md",
  "docs/action-391-pure-mapper-contract-remediation.md",
  "docs/action-392-independent-mapper-remediation-verification-and-shadow-use-readiness-audit.md",
  "docs/action-393-pure-mapper-literal-normalization-bypass-remediation-approval-gate.md",
  "docs/action-394-pure-mapper-literal-normalization-remediation.md",
  "docs/action-395-independent-literal-normalization-remediation-reverification-and-shadow-use-readiness-audit.md",
  "docs/action-396-static-mapper-shadow-use-approval-gate.md",
  "docs/action-397-static-mapper-shadow-input-manifest.json",
  "docs/action-397-static-mapper-shadow-use.md",
  "docs/action-398-independent-static-post-shadow-verification-and-batch-expansion-readiness-audit.md",
  "docs/action-399-expanded-static-mapper-shadow-batch-approval-gate.md",
  "docs/action-400-expanded-static-mapper-shadow-input-manifest.json",
  "docs/action-400-expanded-static-mapper-shadow-use.md",
  "docs/action-401-independent-expanded-static-shadow-verification-and-downstream-readiness-audit.md",
  "docs/action-402-pure-pattern-discovery-contract-and-mapped-only-downstream-static-shadow-approval-gate.md",
  "docs/action-403-pure-pattern-discovery-implementation-approval-gate.md",
  "docs/action-404-pure-pattern-discovery-implementation.md",
  "docs/action-405-independent-pure-pattern-discovery-verification-and-hash-audit.md",
  "docs/action-406-mapped-only-pattern-discovery-hash-freeze-and-static-shadow-approval-gate.md",
  "docs/action-407-pure-pattern-discovery-lint-remediation-approval-gate.md",
  "docs/action-408-pure-pattern-discovery-test-lint-remediation.md",
  "docs/action-409-independent-post-lint-pattern-discovery-behavioral-and-hash-verification.md",
  "docs/action-410-mapped-only-pattern-discovery-static-shadow-execution-approval-gate.md",
  "docs/action-411-mapped-only-pattern-discovery-static-shadow-input-manifest.json",
  "docs/action-411-mapped-only-pattern-discovery-static-shadow-use.md",
  "docs/action-412-independent-mapped-only-pattern-discovery-static-shadow-verification.md",
  "docs/action-413-expanded-static-pattern-discovery-coverage-package-approval-gate.md",
  "docs/action-414-expanded-static-pattern-discovery-hash-freeze.md",
  "docs/action-414-expanded-static-pattern-discovery-hash-inventory.json",
  "docs/action-415-expanded-static-pattern-discovery-shadow-execution-approval-gate.md",
  "docs/action-416-expanded-static-pattern-discovery-shadow-input-manifest.json",
  "docs/action-416-expanded-static-pattern-discovery-shadow-use.md",
  "docs/action-417-independent-expanded-static-pattern-discovery-shadow-verification.md",
  "docs/action-418-pure-confidence-calibration-contract-and-pattern-insight-compatibility-approval-gate.md",
  "docs/action-419-pure-confidence-calibration-implementation-approval-gate.md",
  "docs/action-420-pure-confidence-calibration-implementation.md",
  "docs/action-421-independent-pure-confidence-calibration-verification-and-hash-audit.md",
  "docs/action-422-pure-confidence-calibration-contract-remediation-approval-gate.md",
  "docs/action-423-pure-confidence-calibration-contract-remediation.md",
  "docs/action-424-independent-post-remediation-confidence-calibration-verification.md",
  "docs/action-425-static-confidence-calibration-fixture-and-hash-freeze-approval-gate.md",
  "docs/action-426-static-confidence-calibration-hash-freeze.md",
  "docs/action-426-static-confidence-calibration-hash-inventory.json",
  "docs/action-427-independent-static-confidence-calibration-hash-freeze-verification.md",
  "docs/action-428-static-confidence-calibration-shadow-execution-approval-gate.md",
  "docs/action-429-static-confidence-calibration-shadow-input-manifest.json",
  "docs/action-429-static-confidence-calibration-shadow-use.md",
  "docs/action-430-independent-static-confidence-calibration-shadow-verification.md",
  "docs/action-431-confidence-calibration-advisory-consumption-contract-approval-gate.md",
  "docs/action-432-confidence-calibration-advisory-adapter-implementation.md",
  "docs/action-433-independent-confidence-calibration-advisory-adapter-verification.md",
  "docs/action-434-confidence-calibration-advisory-adapter-contract-remediation-approval-gate.md",
  "docs/action-435-confidence-calibration-advisory-adapter-semantic-hash-remediation.md",
  "docs/action-436-independent-post-remediation-advisory-adapter-verification.md",
  "docs/action-437-confidence-calibration-advisory-adapter-post-audit-finding-approval-gate.md",
  "docs/action-438-confidence-calibration-advisory-adapter-complete-semantic-binding-remediation.md",
  "docs/action-439-independent-complete-semantic-binding-verification.md",
  "docs/action-440-static-confidence-calibration-advisory-fixture-and-hash-freeze-approval-gate.md",
  "docs/action-441-static-confidence-calibration-advisory-hash-freeze.md",
  "docs/action-441-static-confidence-calibration-advisory-hash-inventory.json",
  "docs/action-442-independent-static-confidence-calibration-advisory-hash-freeze-verification.md",
  "docs/action-443-static-confidence-calibration-advisory-shadow-execution-approval-gate.md",
  "docs/action-444-static-confidence-calibration-advisory-shadow-input-manifest.json",
  "docs/action-444-static-confidence-calibration-advisory-shadow-use.md",
  "docs/action-445-independent-static-confidence-calibration-advisory-shadow-verification.md",
  "docs/action-446-static-confidence-calibration-advisory-shadow-release-gate.md",
  "docs/action-447-confidence-calibration-advisory-recommendation-engine-consumption-contract-approval-gate.md",
  "docs/action-448-confidence-calibration-recommendation-advisory-projection-implementation.md",
  "docs/action-449-independent-confidence-calibration-recommendation-advisory-projection-verification.md",
  "docs/action-450-projection-advisory-status-hash-binding-remediation-approval-gate.md",
  "docs/action-451-projection-advisory-status-hash-binding-remediation.md",
  "docs/action-452-independent-post-remediation-projection-verification.md",
  "docs/action-453-static-confidence-calibration-recommendation-advisory-projection-fixture-and-hash-freeze-approval-gate.md",
  "docs/action-454-static-confidence-calibration-recommendation-advisory-projection-hash-freeze.md",
  "docs/action-454-static-confidence-calibration-recommendation-advisory-projection-hash-inventory.json",
  "docs/action-455-independent-static-confidence-calibration-recommendation-advisory-projection-hash-freeze-verification.md",
  "docs/action-456-static-confidence-calibration-recommendation-advisory-projection-shadow-execution-approval-gate.md",
  "docs/action-457-static-confidence-calibration-recommendation-advisory-projection-shadow-input-manifest.json",
  "docs/action-457-static-confidence-calibration-recommendation-advisory-projection-shadow-use.md",
  "docs/action-458-independent-static-confidence-calibration-recommendation-advisory-projection-shadow-verification.md",
  "docs/action-459-static-confidence-calibration-recommendation-advisory-projection-shadow-release-gate.md",
  "docs/action-460-confidence-calibration-recommendation-advisory-projection-runtime-preview-integration-contract-approval-gate.md",
  "docs/action-461-confidence-calibration-recommendation-advisory-projection-runtime-preview-consumer-implementation.md",
  "docs/action-462-independent-confidence-calibration-recommendation-advisory-projection-runtime-preview-consumer-verification.md",
  "docs/action-463-confidence-calibration-recommendation-advisory-projection-preview-deployment-readiness-gate.md",
  "docs/action-464-confidence-calibration-recommendation-advisory-projection-operator-input-capture-and-preview-activation-approval-gate.md",
  "docs/action-465-confidence-calibration-recommendation-advisory-projection-preview-candidate-isolation-and-operator-input-completion.md",
  "docs/action-465-confidence-calibration-recommendation-advisory-projection-preview-candidate-inventory.json",
  "docs/action-465-confidence-calibration-recommendation-advisory-projection-preview-operator-input-record.json",
  "docs/action-466-confidence-calibration-recommendation-advisory-projection-preview-candidate-materialization-and-operator-input-finalization.md",
  "docs/action-466-confidence-calibration-recommendation-advisory-projection-preview-candidate-materialization.json",
  "docs/action-466-confidence-calibration-recommendation-advisory-projection-preview-finalized-operator-input-record.json",
  "docs/action-467-confidence-calibration-recommendation-advisory-projection-operator-input-finalization-gate.md",
  "docs/action-467-confidence-calibration-recommendation-advisory-projection-preview-final-operator-decision-record.json",
  "docs/action-468-confidence-calibration-recommendation-advisory-projection-operator-input-completion-continuation.md",
  "docs/action-468-confidence-calibration-recommendation-advisory-projection-preview-continued-operator-decision-record.json",
  "docs/action-469-confidence-calibration-recommendation-advisory-projection-operator-input-validation-and-preview-deployment-execution-approval-gate.md",
  "docs/action-469-confidence-calibration-recommendation-advisory-projection-preview-validated-operator-decision-record.json",
  "docs/action-470-confidence-calibration-recommendation-advisory-projection-preview-deployment-execution-approval-gate.md",
  "docs/action-470-confidence-calibration-recommendation-advisory-projection-preview-deployment-execution-approval-record.json",
  "docs/action-471-confidence-calibration-recommendation-advisory-projection-preview-deployment-execution.md",
  "docs/action-471-confidence-calibration-recommendation-advisory-projection-preview-deployment-execution-record.json",
  "docs/action-472-confidence-calibration-recommendation-advisory-projection-preview-deployment-abort-remediation-approval-gate.md",
  "docs/action-472-confidence-calibration-recommendation-advisory-projection-preview-deployment-abort-remediation-approval-record.json",
  "docs/action-473-confidence-calibration-recommendation-advisory-projection-preview-full-candidate-construction-and-netlify-target-access-completion.md",
  "docs/action-473-confidence-calibration-recommendation-advisory-projection-preview-full-deployment-candidate-inventory.json",
  "docs/action-473-confidence-calibration-recommendation-advisory-projection-preview-netlify-target-access-record.json",
  "docs/action-474-confidence-calibration-recommendation-advisory-projection-preview-netlify-target-and-secure-access-completion.md",
  "docs/action-474-confidence-calibration-recommendation-advisory-projection-preview-netlify-target-and-secure-access-record.json",
  "docs/action-475-confidence-calibration-recommendation-advisory-projection-preview-netlify-target-validation-and-secure-access-approval-gate.md",
  "docs/action-475-confidence-calibration-recommendation-advisory-projection-preview-netlify-target-validation-and-secure-access-record.json",
  "docs/action-476-confidence-calibration-recommendation-advisory-projection-preview-secure-netlify-authentication-completion.md",
  "docs/action-476-confidence-calibration-recommendation-advisory-projection-preview-secure-netlify-authentication-record.json",
  "docs/action-477-confidence-calibration-recommendation-advisory-projection-preview-netlify-site-linking-approval-gate.md",
  "docs/action-477-confidence-calibration-recommendation-advisory-projection-preview-netlify-site-linking-approval-record.json",
  "docs/action-478-confidence-calibration-recommendation-advisory-projection-preview-netlify-site-linking-execution.md",
  "docs/action-478-confidence-calibration-recommendation-advisory-projection-preview-netlify-site-linking-execution-record.json",
  "docs/action-479-confidence-calibration-recommendation-advisory-projection-preview-deployment-retry-approval-gate.md",
  "docs/action-479-confidence-calibration-recommendation-advisory-projection-preview-deployment-retry-approval-record.json",
  "docs/action-480-confidence-calibration-recommendation-advisory-projection-preview-deployment-retry-execution.md",
  "docs/action-480-confidence-calibration-recommendation-advisory-projection-preview-deployment-retry-execution-record.json",
  "docs/action-481-confidence-calibration-recommendation-advisory-projection-preview-deployment-reconstruction-remediation-gate.md",
  "docs/action-481-confidence-calibration-recommendation-advisory-projection-preview-deployment-reconstruction-remediation-approval-record.json",
  "docs/action-482-confidence-calibration-recommendation-advisory-projection-preview-dependency-materialization-completion-gate.md",
  "docs/action-482-confidence-calibration-recommendation-advisory-projection-preview-dependency-materialization-record.json",
  "docs/action-483-confidence-calibration-recommendation-advisory-projection-preview-full-candidate-build-rehearsal.md",
  "docs/action-483-confidence-calibration-recommendation-advisory-projection-preview-full-candidate-build-rehearsal-record.json",
  "docs/action-484-confidence-calibration-recommendation-advisory-projection-preview-temporary-candidate-git-integrity-remediation-approval-gate.md",
  "docs/action-484-confidence-calibration-recommendation-advisory-projection-preview-temporary-candidate-git-integrity-remediation-approval-record.json",
  "docs/action-485-confidence-calibration-recommendation-advisory-projection-preview-full-candidate-build-rehearsal-retry.md",
  "docs/action-485-confidence-calibration-recommendation-advisory-projection-preview-full-candidate-build-rehearsal-retry-record.json",
  "docs/action-486-confidence-calibration-recommendation-advisory-projection-preview-temp-path-abort-remediation-approval-gate.md",
  "docs/action-486-confidence-calibration-recommendation-advisory-projection-preview-temp-path-abort-remediation-approval-record.json",
  "docs/action-487-confidence-calibration-recommendation-advisory-projection-preview-full-candidate-build-rehearsal-retry-after-temp-path-remediation.md",
  "docs/action-487-confidence-calibration-recommendation-advisory-projection-preview-full-candidate-build-rehearsal-retry-record.json",
  "docs/action-488-confidence-calibration-recommendation-advisory-projection-preview-source-safety-marker-classification-remediation-approval-gate.md",
  "docs/action-488-confidence-calibration-recommendation-advisory-projection-preview-source-safety-marker-remediation-approval-record.json",
  "docs/action-489-confidence-calibration-recommendation-advisory-projection-preview-full-candidate-build-rehearsal-retry-after-source-safety-remediation.md",
  "docs/action-489-confidence-calibration-recommendation-advisory-projection-preview-full-candidate-build-rehearsal-retry-record.json",
  "docs/action-490-confidence-calibration-recommendation-advisory-projection-preview-command-inventory-binding-remediation-approval-gate.md",
  "docs/action-490-confidence-calibration-recommendation-advisory-projection-preview-command-inventory-binding-remediation-approval-record.json",
  "docs/action-491-confidence-calibration-recommendation-advisory-projection-preview-candidate-runtime-dependency-completeness-remediation-gate.md",
  "docs/action-491-confidence-calibration-recommendation-advisory-projection-preview-candidate-runtime-dependency-completeness-remediation-approval-record.json",
  "docs/action-492-confidence-calibration-recommendation-advisory-projection-preview-runtime-complete-candidate-reconstruction-and-hash-freeze.md",
  "docs/action-492-confidence-calibration-recommendation-advisory-projection-preview-runtime-complete-candidate-record.json",
  "docs/action-493-confidence-calibration-recommendation-advisory-projection-preview-runtime-complete-candidate-build-rehearsal-approval-gate.md",
  "docs/action-493-confidence-calibration-recommendation-advisory-projection-preview-runtime-complete-candidate-build-rehearsal-approval-record.json",
  "docs/action-494-confidence-calibration-recommendation-advisory-projection-preview-runtime-complete-candidate-build-rehearsal.md",
  "docs/action-494-confidence-calibration-recommendation-advisory-projection-preview-runtime-complete-candidate-build-rehearsal-record.json",
  "docs/action-495-confidence-calibration-recommendation-advisory-projection-preview-flag-rehearsal-check-remediation-approval-gate.md",
  "docs/action-495-confidence-calibration-recommendation-advisory-projection-preview-flag-rehearsal-check-remediation-approval-record.json",
  "docs/action-496-confidence-calibration-recommendation-advisory-projection-preview-runtime-complete-candidate-build-rehearsal-retry-after-preview-flag-remediation.md",
  "docs/action-496-confidence-calibration-recommendation-advisory-projection-preview-runtime-complete-candidate-build-rehearsal-retry-record.json",
  "docs/action-497-confidence-calibration-recommendation-advisory-projection-preview-source-safety-checker-false-positive-remediation-approval-gate.md",
  "docs/action-497-confidence-calibration-recommendation-advisory-projection-preview-source-safety-checker-false-positive-remediation-approval-record.json",
  "docs/action-498-confidence-calibration-recommendation-advisory-projection-preview-runtime-complete-candidate-build-rehearsal-retry-after-source-safety-checker-remediation.md",
  "docs/action-498-confidence-calibration-recommendation-advisory-projection-preview-runtime-complete-candidate-build-rehearsal-retry-record.json",
  "docs/action-499-confidence-calibration-recommendation-advisory-projection-preview-source-safety-wrong-hash-rejection-remediation-approval-gate.md",
  "docs/action-499-confidence-calibration-recommendation-advisory-projection-preview-source-safety-wrong-hash-rejection-remediation-approval-record.json",
  "docs/action-500-confidence-calibration-recommendation-advisory-projection-preview-runtime-complete-candidate-build-rehearsal-retry-after-wrong-hash-rejection-remediation.md",
  "docs/action-500-confidence-calibration-recommendation-advisory-projection-preview-runtime-complete-candidate-build-rehearsal-retry-record.json",
  "docs/action-501-confidence-calibration-recommendation-advisory-projection-preview-candidate-rehearsal-build-failure-remediation-approval-gate.md",
  "docs/action-501-confidence-calibration-recommendation-advisory-projection-preview-candidate-rehearsal-build-failure-remediation-approval-record.json",
  "docs/action-502-confidence-calibration-recommendation-advisory-projection-preview-candidate-build-failure-diagnostic-evidence-completion-gate.md",
  "docs/action-502-confidence-calibration-recommendation-advisory-projection-preview-candidate-build-failure-diagnostic-evidence-completion-approval-record.json",
  "docs/action-503-confidence-calibration-recommendation-advisory-projection-preview-candidate-build-failure-bounded-diagnostic-capture.md",
  "docs/action-503-confidence-calibration-recommendation-advisory-projection-preview-candidate-build-failure-bounded-diagnostic-record.json",
  "docs/action-504-confidence-calibration-recommendation-advisory-projection-preview-candidate-build-runner-or-environment-remediation-gate.md",
  "docs/action-504-confidence-calibration-recommendation-advisory-projection-preview-candidate-build-runner-environment-remediation-approval-record.json",
  "docs/action-505-confidence-calibration-recommendation-advisory-projection-preview-runner-environment-precheck-completion-gate.md",
  "docs/action-505-confidence-calibration-recommendation-advisory-projection-preview-runner-environment-precheck-record.json",
  "docs/action-506-confidence-calibration-recommendation-advisory-projection-preview-turbopack-runner-environment-comparison-and-rehearsal-approval-record.json",
  "docs/action-506-confidence-calibration-recommendation-advisory-projection-preview-turbopack-runner-environment-comparison-and-rehearsal-gate.md",
  "docs/action-507-confidence-calibration-recommendation-advisory-projection-preview-turbopack-comparison-invocation-completion-gate.md",
  "docs/action-507-confidence-calibration-recommendation-advisory-projection-preview-turbopack-comparison-invocation-completion-record.json",
  "docs/action-508-confidence-calibration-recommendation-advisory-projection-preview-turbopack-runner-comparison-and-runtime-complete-candidate-rehearsal-record.json",
  "docs/action-508-confidence-calibration-recommendation-advisory-projection-preview-turbopack-runner-environment-comparison-and-runtime-complete-candidate-rehearsal.md",
  "docs/action-509-confidence-calibration-recommendation-advisory-projection-preview-build-failure-specific-diagnosis-or-remediation-gate.md",
  "docs/action-509-confidence-calibration-recommendation-advisory-projection-preview-build-failure-specific-diagnosis-remediation-approval-record.json",
  "docs/action-510-confidence-calibration-recommendation-advisory-projection-preview-webpack-build-failure-bounded-diagnostic-capture-gate.md",
  "docs/action-510-confidence-calibration-recommendation-advisory-projection-preview-webpack-build-failure-bounded-diagnostic-capture-approval-record.json",
  "docs/action-511-confidence-calibration-recommendation-advisory-projection-preview-webpack-build-failure-bounded-diagnostic-capture.md",
  "docs/action-511-confidence-calibration-recommendation-advisory-projection-preview-webpack-build-failure-bounded-diagnostic-record.json",
  "docs/action-512-confidence-calibration-recommendation-advisory-projection-preview-webpack-comparison-invocation-remediation-gate.md",
  "docs/action-512-confidence-calibration-recommendation-advisory-projection-preview-webpack-comparison-invocation-remediation-approval-record.json",
  "docs/action-513-confidence-calibration-recommendation-advisory-projection-preview-webpack-invocation-runtime-precheck-completion-gate.md",
  "docs/action-513-confidence-calibration-recommendation-advisory-projection-preview-webpack-invocation-runtime-precheck-record.json",
  "docs/action-514-confidence-calibration-recommendation-advisory-projection-preview-webpack-build-failure-bounded-diagnostic-retry-after-invocation-remediation.md",
  "docs/action-514-confidence-calibration-recommendation-advisory-projection-preview-webpack-build-failure-bounded-diagnostic-retry-record.json",
  "docs/action-515-confidence-calibration-recommendation-advisory-projection-preview-candidate-build-source-remediation.md",
  "docs/action-515-confidence-calibration-recommendation-advisory-projection-preview-candidate-build-source-remediation-record.json",
  "docs/action-516-confidence-calibration-recommendation-advisory-projection-preview-remediated-runtime-complete-candidate-reconstruction-and-hash-freeze.md",
  "docs/action-516-confidence-calibration-recommendation-advisory-projection-preview-remediated-runtime-complete-candidate-record.json",
  "docs/action-517-confidence-calibration-recommendation-advisory-projection-preview-candidate-reconstruction-path-set-mismatch-remediation-gate.md",
  "docs/action-517-confidence-calibration-recommendation-advisory-projection-preview-candidate-path-set-mismatch-remediation-approval-record.json",
  "docs/action-518-confidence-calibration-recommendation-advisory-projection-preview-remediated-32-file-candidate-reconstruction-and-hash-freeze.md",
  "docs/action-518-confidence-calibration-recommendation-advisory-projection-preview-remediated-32-file-candidate-record.json",
  "docs/action-519-confidence-calibration-recommendation-advisory-projection-preview-remediated-32-file-candidate-build-rehearsal-approval-gate.md",
  "docs/action-519-confidence-calibration-recommendation-advisory-projection-preview-remediated-32-file-candidate-build-rehearsal-approval-record.json",
  "docs/action-520-confidence-calibration-recommendation-advisory-projection-preview-remediated-32-file-candidate-build-rehearsal.md",
  "docs/action-520-confidence-calibration-recommendation-advisory-projection-preview-remediated-32-file-candidate-build-rehearsal-record.json",
  "docs/action-521-confidence-calibration-recommendation-advisory-projection-preview-action-520-path-safety-checker-remediation-gate.md",
  "docs/action-521-confidence-calibration-recommendation-advisory-projection-preview-action-520-path-safety-checker-remediation-approval-record.json",
  "docs/action-522-confidence-calibration-recommendation-advisory-projection-preview-remediated-32-file-candidate-build-rehearsal-retry-after-path-safety-remediation.md",
  "docs/action-522-confidence-calibration-recommendation-advisory-projection-preview-remediated-32-file-candidate-build-rehearsal-retry-record.json",
  "docs/action-523-confidence-calibration-recommendation-advisory-projection-preview-candidate-build-failure-relationship-and-remediation-approval-gate.md",
  "docs/action-523-confidence-calibration-recommendation-advisory-projection-preview-candidate-build-failure-relationship-and-remediation-approval-record.json",
  "docs/action-524-confidence-calibration-recommendation-advisory-projection-preview-turbopack-runner-environment-remediation-gate.md",
  "docs/action-524-confidence-calibration-recommendation-advisory-projection-preview-turbopack-runner-environment-remediation-approval-record.json",
  "docs/action-525-confidence-calibration-recommendation-advisory-projection-preview-candidate-build-runner-environment-precheck-completion-gate.md",
  "docs/action-525-confidence-calibration-recommendation-advisory-projection-preview-candidate-build-runner-environment-precheck-record.json",
  "docs/action-526-confidence-calibration-recommendation-advisory-projection-preview-public-build-environment-and-loopback-capability-remediation-gate.md",
  "docs/action-526-confidence-calibration-recommendation-advisory-projection-preview-public-build-environment-and-loopback-capability-remediation-approval-record.json",
  "docs/action-527-confidence-calibration-recommendation-advisory-projection-preview-public-build-signal-operator-input-and-alternate-runner-precheck-gate.md",
  "docs/action-527-confidence-calibration-recommendation-advisory-projection-preview-public-build-signal-operator-input-and-alternate-runner-precheck-record.json",
  "docs/action-528-confidence-calibration-recommendation-advisory-projection-preview-external-terminal-precheck-handoff-gate.md",
  "docs/action-528-confidence-calibration-recommendation-advisory-projection-preview-external-terminal-precheck-handoff-approval-record.json",
  "docs/action-530-confidence-calibration-recommendation-advisory-projection-preview-action-529-temp-boundary-remediation.md",
  "docs/action-530-confidence-calibration-recommendation-advisory-projection-preview-action-529-temp-boundary-remediation-record.json",
  "docs/action-531-confidence-calibration-recommendation-advisory-projection-preview-action-529-hidden-input-and-local-ipc-remediation.md",
  "docs/action-531-confidence-calibration-recommendation-advisory-projection-preview-action-529-hidden-input-and-local-ipc-remediation-record.json",
  "docs/action-532-confidence-calibration-recommendation-advisory-projection-preview-external-terminal-runner-precheck-evidence-acceptance-gate.md",
  "docs/action-532-confidence-calibration-recommendation-advisory-projection-preview-external-terminal-runner-precheck-evidence-acceptance-record.json",
  "docs/action-533-confidence-calibration-recommendation-advisory-projection-preview-external-terminal-candidate-rehearsal-handoff-gate.md",
  "docs/action-533-confidence-calibration-recommendation-advisory-projection-preview-external-terminal-candidate-rehearsal-handoff-approval-record.json",
  "docs/action-535-confidence-calibration-recommendation-advisory-projection-preview-action-534-historical-candidate-inventory-hash-exception-remediation.md",
  "docs/action-535-confidence-calibration-recommendation-advisory-projection-preview-action-534-historical-candidate-inventory-hash-exception-remediation-record.json",
  "docs/action-536-confidence-calibration-recommendation-advisory-projection-preview-action-534-command-boundary-remediation.md",
  "docs/action-536-confidence-calibration-recommendation-advisory-projection-preview-action-534-command-boundary-remediation-record.json",
  "docs/action-537-confidence-calibration-recommendation-advisory-projection-preview-action-534-runner-remediation-application-audit.md",
  "docs/action-537-confidence-calibration-recommendation-advisory-projection-preview-action-534-runner-remediation-application-audit-record.json",
  "docs/action-538-confidence-calibration-recommendation-advisory-projection-preview-action-534-turbopack-prerender-failure-and-runner-fingerprint-diagnostic-gate.md",
  "docs/action-538-confidence-calibration-recommendation-advisory-projection-preview-action-534-turbopack-prerender-failure-and-runner-fingerprint-diagnostic-record.json",
  "lib/pattern-insight-static-fixtures.ts",
  "lib/learning-dataset-static-fixtures.ts",
  "lib/intelligence-context-static-fixtures.ts",
  "lib/snapshot-to-learning-dataset-mapper.ts",
  "lib/pure-pattern-discovery.ts",
  "lib/confidence-calibration-advisory-adapter.ts",
  "lib/confidence-calibration-recommendation-advisory-projection.ts",
  "lib/confidence-calibration-recommendation-advisory-projection-preview.ts",
  "lib/confidence-calibration-recommendation-advisory-projection-preview-flag.ts",
  "components/recommendations/ConfidenceCalibrationProjectionPreview.tsx",
  "components/recommendations/RecommendationDetailsModal.tsx",
  "components/recommendations/RecommendationCardContainer.tsx",
  "docs/post-trade-one-staging-mock-write-with-source-controlled-insert-blocked.md",
  "docs/post-trade-source-controlled-staging-execution-function-approval-gate-no-write.md",
  "docs/post-trade-source-controlled-staging-insert-function-static-security-review-no-execution.md",
  "docs/ture-agent-dev-chat-3-continuation-summary.md",
  "scripts/action-318-static-replay-batch-commit-readiness-verify.mjs",
  "scripts/action-319-static-replay-batch-post-commit-verify.mjs",
  "scripts/action-320-static-replay-branch-package-verify.mjs",
  "scripts/action-321-ture-roadmap-reconciliation-verify.mjs",
  "scripts/action-322-ture-product-roadmap-index-verify.mjs",
  "scripts/action-323-recommendation-engine-readiness-map-verify.mjs",
  "scripts/action-324-recommendation-engine-code-surface-inventory-verify.mjs",
  "scripts/action-325-recommendation-quality-gates-audit-verify.mjs",
  "scripts/action-326-setup-taxonomy-and-confidence-calibration-map-verify.mjs",
  "scripts/action-327-learning-backfill-runtime-rollout-plan-verify.mjs",
  "scripts/action-328-product-ux-surface-map-verify.mjs",
  "scripts/action-329-recommendation-engine-gate-test-plan-verify.mjs",
  "scripts/action-330-confidence-calibration-static-metric-spec-verify.mjs",
  "scripts/action-331-intelligence-first-roadmap-reprioritization-verify.mjs",
  "scripts/action-332-intelligence-data-collection-readiness-map-verify.mjs",
  "scripts/action-333-historical-data-backfill-existing-coverage-audit-verify.mjs",
  "scripts/action-334-recommendation-snapshot-completeness-audit-verify.mjs",
  "scripts/action-335-learning-outcome-dataset-design-verify.mjs",
  "scripts/action-336-intelligence-context-schema-draft-verify.mjs",
  "scripts/action-337-pattern-discovery-and-confidence-calibration-roadmap-verify.mjs",
  "scripts/action-338-runtime-ping-only-rollout-checklist-verify.mjs",
  "scripts/action-339-historical-backfill-cost-and-provider-capacity-plan-verify.mjs",
  "scripts/action-340-snapshot-field-inventory-against-existing-schema-verify.mjs",
  "scripts/action-341-learning-dataset-static-fixture-spec-verify.mjs",
  "scripts/action-342-intelligence-context-static-fixture-spec-verify.mjs",
  "scripts/action-343-pattern-insight-static-type-spec-verify.mjs",
  "scripts/action-344-runtime-ping-only-route-implementation-plan-verify.mjs",
  "scripts/action-345-first-tiny-provider-capacity-experiment-plan-verify.mjs",
  "scripts/action-346-existing-schema-compatibility-matrix-verify.mjs",
  "scripts/action-347-learning-dataset-static-fixture-implementation-plan-verify.mjs",
  "scripts/action-348-intelligence-context-static-fixture-implementation-plan-verify.mjs",
  "scripts/action-349-pattern-insight-static-fixture-spec-verify.mjs",
  "scripts/action-350-runtime-ping-only-route-approval-gate-verify.mjs",
  "scripts/action-351-first-tiny-provider-capacity-experiment-approval-gate-verify.mjs",
  "scripts/action-352-snapshot-to-learning-dataset-mapper-plan-verify.mjs",
  "scripts/action-353-learning-dataset-static-fixture-implementation-approval-gate-verify.mjs",
  "scripts/action-354-intelligence-context-static-fixture-implementation-approval-gate-verify.mjs",
  "scripts/action-355-pattern-insight-static-fixture-implementation-plan-verify.mjs",
  "scripts/action-356-pattern-insight-static-fixture-implementation-approval-gate-verify.mjs",
  "scripts/action-357-pattern-insight-static-fixture-implementation-verify.mjs",
  "scripts/action-358-runtime-ping-only-route-implementation-readiness-review-verify.mjs",
  "scripts/action-359-runtime-ping-only-route-implementation-approval-gate-verify.mjs",
  "scripts/action-360-runtime-ping-only-route-implementation-verify.mjs",
  "scripts/action-361-runtime-ping-only-local-implementation-verification-and-rollout-readiness-review-verify.mjs",
  "scripts/action-362-runtime-ping-only-preview-deploy-approval-gate-verify.mjs",
  "scripts/action-363-runtime-ping-preview-deployment-preflight-blocker-review-and-revision-freeze-readiness-verify.mjs",
  "scripts/action-364-immutable-preview-revision-preparation-approval-gate-verify.mjs",
  "scripts/action-365-option-b-immutable-preview-revision-preparation-verify.mjs",
  "scripts/action-366-corrected-immutable-preview-candidate-preparation-approval-gate-verify.mjs",
  "scripts/action-367-read-only-dependency-bridge-capability-verification-verify.mjs",
  "scripts/action-368-isolated-dependency-materialization-strategy-approval-gate-verify.mjs",
  "scripts/action-369-copy-on-write-dependency-clone-capability-verification-verify.mjs",
  "scripts/action-370-corrected-immutable-preview-candidate-preparation-verify.mjs",
  "scripts/action-371-exact-revision-preview-deployment-execution-approval-gate-verify.mjs",
  "scripts/action-372-exact-revision-preview-deployment-and-validation-verify.mjs",
  "scripts/action-373-approved-preview-tooling-and-non-production-target-binding-readiness-gate-verify.mjs",
  "scripts/action-374-controlled-preview-tooling-materialization-approval-gate-verify.mjs",
  "scripts/action-375-netlify-cli-version-package-provenance-and-integrity-resolution-verify.mjs",
  "scripts/action-376-controlled-netlify-cli-materialization-and-offline-capability-verification-verify.mjs",
  "scripts/action-377-authentication-and-non-production-site-binding-approval-gate-verify.mjs",
  "scripts/action-378-authentication-and-non-production-target-verification-verify.mjs",
  "scripts/action-379-operator-authorized-authentication-and-target-verification-verify.mjs",
  "scripts/action-380-learning-dataset-static-fixture-implementation-verify.mjs",
  "scripts/action-381-intelligence-context-static-fixture-implementation-verify.mjs",
  "scripts/action-382-intelligence-context-to-learning-dataset-compatibility-test-approval-gate-verify.mjs",
  "scripts/action-383-intelligence-context-to-learning-dataset-static-compatibility-tests-verify.mjs",
  "scripts/action-384-learning-dataset-to-pattern-insight-evidence-compatibility-test-approval-gate-verify.mjs",
  "scripts/action-385-learning-dataset-to-pattern-insight-static-evidence-compatibility-tests-verify.mjs",
  "scripts/action-386-static-intelligence-package-consolidation-and-mapper-readiness-review-verify.mjs",
  "scripts/action-387-snapshot-to-learning-dataset-mapper-implementation-approval-gate-verify.mjs",
  "scripts/action-388-snapshot-to-learning-dataset-mapper-implementation-verify.mjs",
  "scripts/action-389-pure-mapper-independent-verification-and-fixture-coverage-audit-verify.mjs",
  "scripts/action-390-pure-mapper-contract-remediation-approval-gate-verify.mjs",
  "scripts/action-391-pure-mapper-contract-remediation-verify.mjs",
  "scripts/action-392-independent-mapper-remediation-verification-and-shadow-use-readiness-audit-verify.mjs",
  "scripts/action-393-pure-mapper-literal-normalization-bypass-remediation-approval-gate-verify.mjs",
  "scripts/action-394-pure-mapper-literal-normalization-remediation-verify.mjs",
  "scripts/action-395-independent-literal-normalization-remediation-reverification-and-shadow-use-readiness-audit-verify.mjs",
  "scripts/action-396-static-mapper-shadow-use-approval-gate-verify.mjs",
  "scripts/action-397-static-mapper-shadow-run.mjs",
  "scripts/action-397-static-mapper-shadow-use-verify.mjs",
  "scripts/action-398-independent-static-post-shadow-verification-and-batch-expansion-readiness-audit-verify.mjs",
  "scripts/action-399-expanded-static-mapper-shadow-batch-approval-gate-verify.mjs",
  "scripts/action-400-expanded-static-mapper-shadow-run.mjs",
  "scripts/action-400-expanded-static-mapper-shadow-use-verify.mjs",
  "scripts/action-401-independent-expanded-static-shadow-verification-and-downstream-readiness-audit-verify.mjs",
  "scripts/action-402-pure-pattern-discovery-contract-and-mapped-only-downstream-static-shadow-approval-gate-verify.mjs",
  "scripts/action-403-pure-pattern-discovery-implementation-approval-gate-verify.mjs",
  "scripts/action-404-pure-pattern-discovery-implementation-verify.mjs",
  "scripts/action-405-independent-pure-pattern-discovery-verification-and-hash-audit-verify.mjs",
  "scripts/action-406-mapped-only-pattern-discovery-hash-freeze-and-static-shadow-approval-gate-verify.mjs",
  "scripts/action-407-pure-pattern-discovery-lint-remediation-approval-gate-verify.mjs",
  "scripts/action-408-pure-pattern-discovery-test-lint-remediation-verify.mjs",
  "scripts/action-409-independent-post-lint-pattern-discovery-behavioral-and-hash-verification-verify.mjs",
  "scripts/action-410-mapped-only-pattern-discovery-static-shadow-execution-approval-gate-verify.mjs",
  "scripts/action-411-mapped-only-pattern-discovery-static-shadow-run.mjs",
  "scripts/action-411-mapped-only-pattern-discovery-static-shadow-use-verify.mjs",
  "scripts/action-412-independent-mapped-only-pattern-discovery-static-shadow-verification-verify.mjs",
  "scripts/action-413-expanded-static-pattern-discovery-coverage-package-approval-gate-verify.mjs",
  "scripts/action-414-expanded-static-pattern-discovery-hash-freeze.mjs",
  "scripts/action-414-expanded-static-pattern-discovery-hash-freeze-verify.mjs",
  "scripts/action-415-expanded-static-pattern-discovery-shadow-execution-approval-gate-verify.mjs",
  "scripts/action-416-expanded-static-pattern-discovery-shadow-run.mjs",
  "scripts/action-416-expanded-static-pattern-discovery-shadow-use-verify.mjs",
  "scripts/action-417-independent-expanded-static-pattern-discovery-shadow-verification-verify.mjs",
  "scripts/action-418-pure-confidence-calibration-contract-and-pattern-insight-compatibility-approval-gate-verify.mjs",
  "scripts/action-419-pure-confidence-calibration-implementation-approval-gate-verify.mjs",
  "scripts/action-420-pure-confidence-calibration-implementation-verify.mjs",
  "scripts/action-421-independent-pure-confidence-calibration-verification-and-hash-audit-verify.mjs",
  "scripts/action-422-pure-confidence-calibration-contract-remediation-approval-gate-verify.mjs",
  "scripts/action-423-pure-confidence-calibration-contract-remediation-verify.mjs",
  "scripts/action-424-independent-post-remediation-confidence-calibration-verification-verify.mjs",
  "scripts/action-425-static-confidence-calibration-fixture-and-hash-freeze-approval-gate-verify.mjs",
  "scripts/action-426-static-confidence-calibration-hash-freeze.mjs",
  "scripts/action-426-static-confidence-calibration-hash-freeze-verify.mjs",
  "scripts/action-427-independent-static-confidence-calibration-hash-freeze-verification-verify.mjs",
  "scripts/action-428-static-confidence-calibration-shadow-execution-approval-gate-verify.mjs",
  "scripts/action-429-static-confidence-calibration-shadow-run.mjs",
  "scripts/action-429-static-confidence-calibration-shadow-use-verify.mjs",
  "scripts/action-430-independent-static-confidence-calibration-shadow-verification-verify.mjs",
  "scripts/action-431-confidence-calibration-advisory-consumption-contract-approval-gate-verify.mjs",
  "scripts/action-432-confidence-calibration-advisory-adapter-implementation-verify.mjs",
  "scripts/action-433-independent-confidence-calibration-advisory-adapter-verification-verify.mjs",
  "scripts/action-434-confidence-calibration-advisory-adapter-contract-remediation-approval-gate-verify.mjs",
  "scripts/action-435-confidence-calibration-advisory-adapter-semantic-hash-remediation-verify.mjs",
  "scripts/action-436-independent-post-remediation-advisory-adapter-verification-verify.mjs",
  "scripts/action-437-confidence-calibration-advisory-adapter-post-audit-finding-approval-gate-verify.mjs",
  "scripts/action-438-confidence-calibration-advisory-adapter-complete-semantic-binding-remediation-verify.mjs",
  "scripts/action-439-independent-complete-semantic-binding-verification-verify.mjs",
  "scripts/action-440-static-confidence-calibration-advisory-fixture-and-hash-freeze-approval-gate-verify.mjs",
  "scripts/action-441-static-confidence-calibration-advisory-hash-freeze-verify.mjs",
  "scripts/action-441-static-confidence-calibration-advisory-hash-freeze.mjs",
  "scripts/action-442-independent-static-confidence-calibration-advisory-hash-freeze-verification-verify.mjs",
  "scripts/action-443-static-confidence-calibration-advisory-shadow-execution-approval-gate-verify.mjs",
  "scripts/action-444-static-confidence-calibration-advisory-shadow-run.mjs",
  "scripts/action-444-static-confidence-calibration-advisory-shadow-use-verify.mjs",
  "scripts/action-445-independent-static-confidence-calibration-advisory-shadow-verification-verify.mjs",
  "scripts/action-446-static-confidence-calibration-advisory-shadow-release-gate-verify.mjs",
  "scripts/action-447-confidence-calibration-advisory-recommendation-engine-consumption-contract-approval-gate-verify.mjs",
  "scripts/action-448-confidence-calibration-recommendation-advisory-projection-implementation-verify.mjs",
  "scripts/action-449-independent-confidence-calibration-recommendation-advisory-projection-verification-verify.mjs",
  "scripts/action-450-projection-advisory-status-hash-binding-remediation-approval-gate-verify.mjs",
  "scripts/action-451-projection-advisory-status-hash-binding-remediation-verify.mjs",
  "scripts/action-452-independent-post-remediation-projection-verification-verify.mjs",
  "scripts/action-453-static-confidence-calibration-recommendation-advisory-projection-fixture-and-hash-freeze-approval-gate-verify.mjs",
  "scripts/action-454-static-confidence-calibration-recommendation-advisory-projection-hash-freeze.mjs",
  "scripts/action-454-static-confidence-calibration-recommendation-advisory-projection-hash-freeze-verify.mjs",
  "scripts/action-455-independent-static-confidence-calibration-recommendation-advisory-projection-hash-freeze-verification-verify.mjs",
  "scripts/action-456-static-confidence-calibration-recommendation-advisory-projection-shadow-execution-approval-gate-verify.mjs",
  "scripts/action-457-static-confidence-calibration-recommendation-advisory-projection-shadow-run.mjs",
  "scripts/action-457-static-confidence-calibration-recommendation-advisory-projection-shadow-use-verify.mjs",
  "scripts/action-458-independent-static-confidence-calibration-recommendation-advisory-projection-shadow-verification-verify.mjs",
  "scripts/action-459-static-confidence-calibration-recommendation-advisory-projection-shadow-release-gate-verify.mjs",
  "scripts/action-460-confidence-calibration-recommendation-advisory-projection-runtime-preview-integration-contract-approval-gate-verify.mjs",
  "scripts/action-461-confidence-calibration-recommendation-advisory-projection-runtime-preview-consumer-implementation-verify.mjs",
  "scripts/action-462-independent-confidence-calibration-recommendation-advisory-projection-runtime-preview-consumer-verification-verify.mjs",
  "scripts/action-463-confidence-calibration-recommendation-advisory-projection-preview-deployment-readiness-gate-verify.mjs",
  "scripts/action-464-confidence-calibration-recommendation-advisory-projection-operator-input-capture-and-preview-activation-approval-gate-verify.mjs",
  "scripts/action-465-confidence-calibration-recommendation-advisory-projection-preview-candidate-isolation-and-operator-input-completion-verify.mjs",
  "scripts/action-466-confidence-calibration-recommendation-advisory-projection-preview-candidate-materialization-and-operator-input-finalization-verify.mjs",
  "scripts/action-467-confidence-calibration-recommendation-advisory-projection-operator-input-finalization-gate-verify.mjs",
  "scripts/action-468-confidence-calibration-recommendation-advisory-projection-operator-input-completion-continuation-verify.mjs",
  "scripts/action-469-confidence-calibration-recommendation-advisory-projection-operator-input-validation-and-preview-deployment-execution-approval-gate-verify.mjs",
  "scripts/action-470-confidence-calibration-recommendation-advisory-projection-preview-deployment-execution-approval-gate-verify.mjs",
  "scripts/action-471-confidence-calibration-recommendation-advisory-projection-preview-deployment-execution-verify.mjs",
  "scripts/action-472-confidence-calibration-recommendation-advisory-projection-preview-deployment-abort-remediation-approval-gate-verify.mjs",
  "scripts/action-473-confidence-calibration-recommendation-advisory-projection-preview-full-candidate-construction-and-netlify-target-access-completion-verify.mjs",
  "scripts/action-474-confidence-calibration-recommendation-advisory-projection-preview-netlify-target-and-secure-access-completion-verify.mjs",
  "scripts/action-475-confidence-calibration-recommendation-advisory-projection-preview-netlify-target-validation-and-secure-access-approval-gate-verify.mjs",
  "scripts/action-476-confidence-calibration-recommendation-advisory-projection-preview-secure-netlify-authentication-completion-verify.mjs",
  "scripts/action-477-confidence-calibration-recommendation-advisory-projection-preview-netlify-site-linking-approval-gate-verify.mjs",
  "scripts/action-478-confidence-calibration-recommendation-advisory-projection-preview-netlify-site-linking-execution-verify.mjs",
  "scripts/action-479-confidence-calibration-recommendation-advisory-projection-preview-deployment-retry-approval-gate-verify.mjs",
  "scripts/action-480-confidence-calibration-recommendation-advisory-projection-preview-deployment-retry-execution-verify.mjs",
  "scripts/action-481-confidence-calibration-recommendation-advisory-projection-preview-deployment-reconstruction-remediation-gate-verify.mjs",
  "scripts/action-482-confidence-calibration-recommendation-advisory-projection-preview-dependency-materialization-completion-gate-verify.mjs",
  "scripts/action-483-confidence-calibration-recommendation-advisory-projection-preview-full-candidate-build-rehearsal-verify.mjs",
  "scripts/action-484-confidence-calibration-recommendation-advisory-projection-preview-temporary-candidate-git-integrity-remediation-approval-gate-verify.mjs",
  "scripts/action-485-confidence-calibration-recommendation-advisory-projection-preview-full-candidate-build-rehearsal-retry-verify.mjs",
  "scripts/action-486-confidence-calibration-recommendation-advisory-projection-preview-temp-path-abort-remediation-approval-gate-verify.mjs",
  "scripts/action-487-confidence-calibration-recommendation-advisory-projection-preview-full-candidate-build-rehearsal-retry-after-temp-path-remediation-verify.mjs",
  "scripts/action-488-confidence-calibration-recommendation-advisory-projection-preview-source-safety-marker-classification-remediation-approval-gate-verify.mjs",
  "scripts/action-489-confidence-calibration-recommendation-advisory-projection-preview-full-candidate-build-rehearsal-retry-after-source-safety-remediation-verify.mjs",
  "scripts/action-490-confidence-calibration-recommendation-advisory-projection-preview-command-inventory-binding-remediation-approval-gate-verify.mjs",
      "scripts/action-491-confidence-calibration-recommendation-advisory-projection-preview-candidate-runtime-dependency-completeness-remediation-gate-verify.mjs",
      "scripts/action-492-confidence-calibration-recommendation-advisory-projection-preview-runtime-complete-candidate-reconstruction-and-hash-freeze-verify.mjs",
      "scripts/action-493-confidence-calibration-recommendation-advisory-projection-preview-runtime-complete-candidate-build-rehearsal-approval-gate-verify.mjs",
      "scripts/action-494-confidence-calibration-recommendation-advisory-projection-preview-runtime-complete-candidate-build-rehearsal-verify.mjs",
      "scripts/action-495-confidence-calibration-recommendation-advisory-projection-preview-flag-rehearsal-check-remediation-approval-gate-verify.mjs",
      "scripts/action-496-confidence-calibration-recommendation-advisory-projection-preview-runtime-complete-candidate-build-rehearsal-retry-after-preview-flag-remediation-verify.mjs",
      "scripts/action-497-confidence-calibration-recommendation-advisory-projection-preview-source-safety-checker-false-positive-remediation-approval-gate-verify.mjs",
      "scripts/action-498-confidence-calibration-recommendation-advisory-projection-preview-runtime-complete-candidate-build-rehearsal-retry-after-source-safety-checker-remediation-verify.mjs",
      "scripts/action-499-confidence-calibration-recommendation-advisory-projection-preview-source-safety-wrong-hash-rejection-remediation-approval-gate-verify.mjs",
      "scripts/action-500-confidence-calibration-recommendation-advisory-projection-preview-runtime-complete-candidate-build-rehearsal-retry-after-wrong-hash-rejection-remediation-verify.mjs",
      "scripts/action-501-confidence-calibration-recommendation-advisory-projection-preview-candidate-rehearsal-build-failure-remediation-approval-gate-verify.mjs",
      "scripts/action-502-confidence-calibration-recommendation-advisory-projection-preview-candidate-build-failure-diagnostic-evidence-completion-gate-verify.mjs",
      "scripts/action-503-confidence-calibration-recommendation-advisory-projection-preview-candidate-build-failure-bounded-diagnostic-capture-verify.mjs",
      "scripts/action-504-confidence-calibration-recommendation-advisory-projection-preview-candidate-build-runner-or-environment-remediation-gate-verify.mjs",
      "scripts/action-505-confidence-calibration-recommendation-advisory-projection-preview-runner-environment-precheck-completion-gate-verify.mjs",
      "scripts/action-506-confidence-calibration-recommendation-advisory-projection-preview-turbopack-runner-environment-comparison-and-rehearsal-gate-verify.mjs",
      "scripts/action-507-confidence-calibration-recommendation-advisory-projection-preview-turbopack-comparison-invocation-completion-gate-verify.mjs",
      "scripts/action-508-confidence-calibration-recommendation-advisory-projection-preview-turbopack-runner-environment-comparison-and-runtime-complete-candidate-rehearsal-verify.mjs",
      "scripts/action-509-confidence-calibration-recommendation-advisory-projection-preview-build-failure-specific-diagnosis-or-remediation-gate-verify.mjs",
      "scripts/action-510-confidence-calibration-recommendation-advisory-projection-preview-webpack-build-failure-bounded-diagnostic-capture-gate-verify.mjs",
      "scripts/action-511-confidence-calibration-recommendation-advisory-projection-preview-webpack-build-failure-bounded-diagnostic-capture-verify.mjs",
      "scripts/action-512-confidence-calibration-recommendation-advisory-projection-preview-webpack-comparison-invocation-remediation-gate-verify.mjs",
      "scripts/action-513-confidence-calibration-recommendation-advisory-projection-preview-webpack-invocation-runtime-precheck-completion-gate-verify.mjs",
      "scripts/action-514-confidence-calibration-recommendation-advisory-projection-preview-webpack-build-failure-bounded-diagnostic-retry-after-invocation-remediation-verify.mjs",
      "scripts/action-515-confidence-calibration-recommendation-advisory-projection-preview-candidate-build-source-remediation-verify.mjs",
      "scripts/action-516-confidence-calibration-recommendation-advisory-projection-preview-remediated-runtime-complete-candidate-reconstruction-and-hash-freeze-verify.mjs",
      "scripts/action-517-confidence-calibration-recommendation-advisory-projection-preview-candidate-reconstruction-path-set-mismatch-remediation-gate-verify.mjs",
      "scripts/action-518-confidence-calibration-recommendation-advisory-projection-preview-remediated-32-file-candidate-reconstruction-and-hash-freeze-verify.mjs",
      "scripts/action-519-confidence-calibration-recommendation-advisory-projection-preview-remediated-32-file-candidate-build-rehearsal-approval-gate-verify.mjs",
      "scripts/action-520-confidence-calibration-recommendation-advisory-projection-preview-remediated-32-file-candidate-build-rehearsal-verify.mjs",
      "scripts/action-521-confidence-calibration-recommendation-advisory-projection-preview-action-520-path-safety-checker-remediation-gate-verify.mjs",
      "scripts/action-522-confidence-calibration-recommendation-advisory-projection-preview-remediated-32-file-candidate-build-rehearsal-retry-after-path-safety-remediation-verify.mjs",
      "scripts/action-523-confidence-calibration-recommendation-advisory-projection-preview-candidate-build-failure-relationship-and-remediation-approval-gate-verify.mjs",
      "scripts/action-524-confidence-calibration-recommendation-advisory-projection-preview-turbopack-runner-environment-remediation-gate-verify.mjs",
      "scripts/action-525-confidence-calibration-recommendation-advisory-projection-preview-candidate-build-runner-environment-precheck-completion-gate-verify.mjs",
      "scripts/action-526-confidence-calibration-recommendation-advisory-projection-preview-public-build-environment-and-loopback-capability-remediation-gate-verify.mjs",
      "scripts/action-527-confidence-calibration-recommendation-advisory-projection-preview-public-build-signal-operator-input-and-alternate-runner-precheck-gate-verify.mjs",
      "scripts/action-528-confidence-calibration-recommendation-advisory-projection-preview-external-terminal-precheck-handoff-gate-verify.mjs",
      "scripts/action-529-confidence-calibration-recommendation-advisory-projection-preview-external-terminal-runner-precheck.mjs",
      "scripts/action-529-confidence-calibration-recommendation-advisory-projection-preview-external-terminal-runner-precheck-result-verify.mjs",
      "scripts/action-530-confidence-calibration-recommendation-advisory-projection-preview-action-529-temp-boundary-remediation-verify.mjs",
      "scripts/action-531-confidence-calibration-recommendation-advisory-projection-preview-action-529-hidden-input-and-local-ipc-remediation-verify.mjs",
      "scripts/action-532-confidence-calibration-recommendation-advisory-projection-preview-external-terminal-runner-precheck-evidence-acceptance-gate-verify.mjs",
      "scripts/action-533-confidence-calibration-recommendation-advisory-projection-preview-external-terminal-candidate-rehearsal-handoff-gate-verify.mjs",
      "scripts/action-534-confidence-calibration-recommendation-advisory-projection-preview-external-terminal-candidate-rehearsal.mjs",
      "scripts/action-534-confidence-calibration-recommendation-advisory-projection-preview-external-terminal-candidate-rehearsal-result-verify.mjs",
      "scripts/action-535-confidence-calibration-recommendation-advisory-projection-preview-action-534-historical-candidate-inventory-hash-exception-remediation-verify.mjs",
      "scripts/action-536-confidence-calibration-recommendation-advisory-projection-preview-action-534-command-boundary-remediation-verify.mjs",
      "scripts/action-537-confidence-calibration-recommendation-advisory-projection-preview-action-534-runner-remediation-application-audit-verify.mjs",
      "scripts/action-538-confidence-calibration-recommendation-advisory-projection-preview-action-534-turbopack-prerender-failure-and-runner-fingerprint-diagnostic-gate-verify.mjs",
  "tests/e2e/action-319-static-replay-batch-post-commit-verification.spec.ts",
  "tests/e2e/action-320-static-replay-branch-package-manifest.spec.ts",
  "tests/e2e/action-321-ture-roadmap-reconciliation-after-recovery.spec.ts",
  "tests/e2e/action-322-ture-product-roadmap-index.spec.ts",
  "tests/e2e/action-323-recommendation-engine-readiness-map.spec.ts",
  "tests/e2e/action-324-recommendation-engine-code-surface-inventory.spec.ts",
  "tests/e2e/action-325-recommendation-quality-gates-audit.spec.ts",
  "tests/e2e/action-326-setup-taxonomy-and-confidence-calibration-map.spec.ts",
  "tests/e2e/action-327-learning-backfill-runtime-rollout-plan.spec.ts",
  "tests/e2e/action-328-product-ux-surface-map.spec.ts",
  "tests/e2e/action-329-recommendation-engine-gate-test-plan.spec.ts",
  "tests/e2e/action-330-confidence-calibration-static-metric-spec.spec.ts",
  "tests/e2e/action-331-intelligence-first-roadmap-reprioritization.spec.ts",
  "tests/e2e/action-332-intelligence-data-collection-readiness-map.spec.ts",
  "tests/e2e/action-333-historical-data-backfill-existing-coverage-audit.spec.ts",
  "tests/e2e/action-334-recommendation-snapshot-completeness-audit.spec.ts",
  "tests/e2e/action-335-learning-outcome-dataset-design.spec.ts",
  "tests/e2e/action-336-intelligence-context-schema-draft.spec.ts",
  "tests/e2e/action-337-pattern-discovery-and-confidence-calibration-roadmap.spec.ts",
  "tests/e2e/action-338-runtime-ping-only-rollout-checklist.spec.ts",
  "tests/e2e/action-339-historical-backfill-cost-and-provider-capacity-plan.spec.ts",
  "tests/e2e/action-340-snapshot-field-inventory-against-existing-schema.spec.ts",
  "tests/e2e/action-341-learning-dataset-static-fixture-spec.spec.ts",
  "tests/e2e/action-342-intelligence-context-static-fixture-spec.spec.ts",
  "tests/e2e/action-343-pattern-insight-static-type-spec.spec.ts",
  "tests/e2e/action-344-runtime-ping-only-route-implementation-plan.spec.ts",
  "tests/e2e/action-345-first-tiny-provider-capacity-experiment-plan.spec.ts",
  "tests/e2e/action-346-existing-schema-compatibility-matrix.spec.ts",
  "tests/e2e/action-347-learning-dataset-static-fixture-implementation-plan.spec.ts",
  "tests/e2e/action-348-intelligence-context-static-fixture-implementation-plan.spec.ts",
  "tests/e2e/action-349-pattern-insight-static-fixture-spec.spec.ts",
  "tests/e2e/action-350-runtime-ping-only-route-approval-gate.spec.ts",
  "tests/e2e/action-351-first-tiny-provider-capacity-experiment-approval-gate.spec.ts",
  "tests/e2e/action-352-snapshot-to-learning-dataset-mapper-plan.spec.ts",
  "tests/e2e/action-353-learning-dataset-static-fixture-implementation-approval-gate.spec.ts",
  "tests/e2e/action-354-intelligence-context-static-fixture-implementation-approval-gate.spec.ts",
  "tests/e2e/action-355-pattern-insight-static-fixture-implementation-plan.spec.ts",
  "tests/e2e/action-356-pattern-insight-static-fixture-implementation-approval-gate.spec.ts",
  "tests/e2e/action-357-pattern-insight-static-fixture-implementation.spec.ts",
  "tests/e2e/action-358-runtime-ping-only-route-implementation-readiness-review.spec.ts",
  "tests/e2e/action-359-runtime-ping-only-route-implementation-approval-gate.spec.ts",
  "tests/e2e/action-360-runtime-ping-only-route-implementation.spec.ts",
  "tests/e2e/action-361-runtime-ping-only-local-implementation-verification-and-rollout-readiness-review.spec.ts",
  "tests/e2e/action-362-runtime-ping-only-preview-deploy-approval-gate.spec.ts",
  "tests/e2e/action-363-runtime-ping-preview-deployment-preflight-blocker-review-and-revision-freeze-readiness.spec.ts",
  "tests/e2e/action-364-immutable-preview-revision-preparation-approval-gate.spec.ts",
  "tests/e2e/action-365-option-b-immutable-preview-revision-preparation.spec.ts",
  "tests/e2e/action-366-corrected-immutable-preview-candidate-preparation-approval-gate.spec.ts",
  "tests/e2e/action-367-read-only-dependency-bridge-capability-verification.spec.ts",
  "tests/e2e/action-368-isolated-dependency-materialization-strategy-approval-gate.spec.ts",
  "tests/e2e/action-369-copy-on-write-dependency-clone-capability-verification.spec.ts",
  "tests/e2e/action-370-corrected-immutable-preview-candidate-preparation.spec.ts",
  "tests/e2e/action-371-exact-revision-preview-deployment-execution-approval-gate.spec.ts",
  "tests/e2e/action-372-exact-revision-preview-deployment-and-validation.spec.ts",
  "tests/e2e/action-373-approved-preview-tooling-and-non-production-target-binding-readiness-gate.spec.ts",
  "tests/e2e/action-374-controlled-preview-tooling-materialization-approval-gate.spec.ts",
  "tests/e2e/action-375-netlify-cli-version-package-provenance-and-integrity-resolution.spec.ts",
  "tests/e2e/action-376-controlled-netlify-cli-materialization-and-offline-capability-verification.spec.ts",
  "tests/e2e/action-377-authentication-and-non-production-site-binding-approval-gate.spec.ts",
  "tests/e2e/action-378-authentication-and-non-production-target-verification.spec.ts",
  "tests/e2e/action-379-operator-authorized-authentication-and-target-verification.spec.ts",
  "tests/e2e/action-380-learning-dataset-static-fixture-implementation.spec.ts",
  "tests/e2e/action-381-intelligence-context-static-fixture-implementation.spec.ts",
  "tests/e2e/action-382-intelligence-context-to-learning-dataset-compatibility-test-approval-gate.spec.ts",
  "tests/e2e/action-383-intelligence-context-to-learning-dataset-compatibility.spec.ts",
  "tests/e2e/action-384-learning-dataset-to-pattern-insight-evidence-compatibility-test-approval-gate.spec.ts",
  "tests/e2e/action-385-learning-dataset-to-pattern-insight-evidence-compatibility.spec.ts",
  "tests/e2e/action-386-static-intelligence-package-consolidation-and-mapper-readiness-review.spec.ts",
  "tests/e2e/action-387-snapshot-to-learning-dataset-mapper-implementation-approval-gate.spec.ts",
  "tests/e2e/action-388-snapshot-to-learning-dataset-mapper-implementation.spec.ts",
  "tests/e2e/action-389-pure-mapper-independent-verification-and-fixture-coverage-audit.spec.ts",
  "tests/e2e/action-390-pure-mapper-contract-remediation-approval-gate.spec.ts",
  "tests/e2e/action-391-pure-mapper-contract-remediation.spec.ts",
  "tests/e2e/action-392-independent-mapper-remediation-verification-and-shadow-use-readiness-audit.spec.ts",
  "tests/e2e/action-393-pure-mapper-literal-normalization-bypass-remediation-approval-gate.spec.ts",
  "tests/e2e/action-394-pure-mapper-literal-normalization-remediation.spec.ts",
  "tests/e2e/action-395-independent-literal-normalization-remediation-reverification-and-shadow-use-readiness-audit.spec.ts",
  "tests/e2e/action-396-static-mapper-shadow-use-approval-gate.spec.ts",
  "tests/e2e/action-397-static-mapper-shadow-use.spec.ts",
  "tests/e2e/action-398-independent-static-post-shadow-verification-and-batch-expansion-readiness-audit.spec.ts",
  "tests/e2e/action-399-expanded-static-mapper-shadow-batch-approval-gate.spec.ts",
  "tests/e2e/action-400-expanded-static-mapper-shadow-use.spec.ts",
  "tests/e2e/action-401-independent-expanded-static-shadow-verification-and-downstream-readiness-audit.spec.ts",
  "tests/e2e/action-402-pure-pattern-discovery-contract-and-mapped-only-downstream-static-shadow-approval-gate.spec.ts",
  "tests/e2e/action-403-pure-pattern-discovery-implementation-approval-gate.spec.ts",
  "tests/e2e/action-404-pure-pattern-discovery-implementation.spec.ts",
  "tests/e2e/action-405-independent-pure-pattern-discovery-verification-and-hash-audit.spec.ts",
  "tests/e2e/action-406-mapped-only-pattern-discovery-hash-freeze-and-static-shadow-approval-gate.spec.ts",
  "tests/e2e/action-407-pure-pattern-discovery-lint-remediation-approval-gate.spec.ts",
  "tests/e2e/action-408-pure-pattern-discovery-test-lint-remediation.spec.ts",
  "tests/e2e/action-409-independent-post-lint-pattern-discovery-behavioral-and-hash-verification.spec.ts",
  "tests/e2e/action-410-mapped-only-pattern-discovery-static-shadow-execution-approval-gate.spec.ts",
  "tests/e2e/action-411-mapped-only-pattern-discovery-static-shadow-use.spec.ts",
  "tests/e2e/action-412-independent-mapped-only-pattern-discovery-static-shadow-verification.spec.ts",
  "tests/e2e/action-413-expanded-static-pattern-discovery-coverage-package-approval-gate.spec.ts",
  "tests/e2e/action-414-expanded-static-pattern-discovery-hash-freeze.spec.ts",
  "tests/e2e/action-415-expanded-static-pattern-discovery-shadow-execution-approval-gate.spec.ts",
  "tests/e2e/action-416-expanded-static-pattern-discovery-shadow-use.spec.ts",
  "tests/e2e/action-417-independent-expanded-static-pattern-discovery-shadow-verification.spec.ts",
  "tests/e2e/action-418-pure-confidence-calibration-contract-and-pattern-insight-compatibility-approval-gate.spec.ts",
      "tests/e2e/action-419-pure-confidence-calibration-implementation-approval-gate.spec.ts",
      "tests/e2e/action-420-pure-confidence-calibration-implementation.spec.ts",
      "tests/e2e/action-421-independent-pure-confidence-calibration-verification-and-hash-audit.spec.ts",
      "tests/e2e/action-422-pure-confidence-calibration-contract-remediation-approval-gate.spec.ts",
      "tests/e2e/action-423-pure-confidence-calibration-contract-remediation.spec.ts",
      "tests/e2e/action-424-independent-post-remediation-confidence-calibration-verification.spec.ts",
      "tests/e2e/action-425-static-confidence-calibration-fixture-and-hash-freeze-approval-gate.spec.ts",
      "tests/e2e/action-426-static-confidence-calibration-hash-freeze.spec.ts",
      "tests/e2e/action-427-independent-static-confidence-calibration-hash-freeze-verification.spec.ts",
      "tests/e2e/action-428-static-confidence-calibration-shadow-execution-approval-gate.spec.ts",
      "tests/e2e/action-429-static-confidence-calibration-shadow-use.spec.ts",
      "tests/e2e/action-430-independent-static-confidence-calibration-shadow-verification.spec.ts",
      "tests/e2e/action-431-confidence-calibration-advisory-consumption-contract-approval-gate.spec.ts",
      "tests/e2e/action-432-confidence-calibration-advisory-adapter-implementation.spec.ts",
      "tests/e2e/action-433-independent-confidence-calibration-advisory-adapter-verification.spec.ts",
      "tests/e2e/action-434-confidence-calibration-advisory-adapter-contract-remediation-approval-gate.spec.ts",
      "tests/e2e/action-435-confidence-calibration-advisory-adapter-semantic-hash-remediation.spec.ts",
      "tests/e2e/action-436-independent-post-remediation-advisory-adapter-verification.spec.ts",
      "tests/e2e/action-437-confidence-calibration-advisory-adapter-post-audit-finding-approval-gate.spec.ts",
      "tests/e2e/action-438-confidence-calibration-advisory-adapter-complete-semantic-binding-remediation.spec.ts",
      "tests/e2e/action-439-independent-complete-semantic-binding-verification.spec.ts",
      "tests/e2e/action-440-static-confidence-calibration-advisory-fixture-and-hash-freeze-approval-gate.spec.ts",
      "tests/e2e/action-441-static-confidence-calibration-advisory-hash-freeze.spec.ts",
      "tests/e2e/action-442-independent-static-confidence-calibration-advisory-hash-freeze-verification.spec.ts",
      "tests/e2e/action-443-static-confidence-calibration-advisory-shadow-execution-approval-gate.spec.ts",
      "tests/e2e/action-444-static-confidence-calibration-advisory-shadow-use.spec.ts",
      "tests/e2e/action-445-independent-static-confidence-calibration-advisory-shadow-verification.spec.ts",
      "tests/e2e/action-446-static-confidence-calibration-advisory-shadow-release-gate.spec.ts",
      "tests/e2e/action-447-confidence-calibration-advisory-recommendation-engine-consumption-contract-approval-gate.spec.ts",
      "tests/e2e/action-448-confidence-calibration-recommendation-advisory-projection-implementation.spec.ts",
      "tests/e2e/action-449-independent-confidence-calibration-recommendation-advisory-projection-verification.spec.ts",
      "tests/e2e/action-450-projection-advisory-status-hash-binding-remediation-approval-gate.spec.ts",
      "tests/e2e/action-451-projection-advisory-status-hash-binding-remediation.spec.ts",
      "tests/e2e/action-452-independent-post-remediation-projection-verification.spec.ts",
      "tests/e2e/action-453-static-confidence-calibration-recommendation-advisory-projection-fixture-and-hash-freeze-approval-gate.spec.ts",
      "tests/e2e/action-454-static-confidence-calibration-recommendation-advisory-projection-hash-freeze.spec.ts",
      "tests/e2e/action-455-independent-static-confidence-calibration-recommendation-advisory-projection-hash-freeze-verification.spec.ts",
      "tests/e2e/action-456-static-confidence-calibration-recommendation-advisory-projection-shadow-execution-approval-gate.spec.ts",
      "tests/e2e/action-457-static-confidence-calibration-recommendation-advisory-projection-shadow-use.spec.ts",
      "tests/e2e/action-458-independent-static-confidence-calibration-recommendation-advisory-projection-shadow-verification.spec.ts",
      "tests/e2e/action-459-static-confidence-calibration-recommendation-advisory-projection-shadow-release-gate.spec.ts",
      "tests/e2e/action-460-confidence-calibration-recommendation-advisory-projection-runtime-preview-integration-contract-approval-gate.spec.ts",
      "tests/e2e/action-461-confidence-calibration-recommendation-advisory-projection-runtime-preview-consumer-implementation.spec.ts",
      "tests/e2e/action-462-independent-confidence-calibration-recommendation-advisory-projection-runtime-preview-consumer-verification.spec.ts",
      "tests/e2e/action-463-confidence-calibration-recommendation-advisory-projection-preview-deployment-readiness-gate.spec.ts",
      "tests/e2e/action-464-confidence-calibration-recommendation-advisory-projection-operator-input-capture-and-preview-activation-approval-gate.spec.ts",
      "tests/e2e/action-465-confidence-calibration-recommendation-advisory-projection-preview-candidate-isolation-and-operator-input-completion.spec.ts",
      "tests/e2e/action-466-confidence-calibration-recommendation-advisory-projection-preview-candidate-materialization-and-operator-input-finalization.spec.ts",
      "tests/e2e/action-467-confidence-calibration-recommendation-advisory-projection-operator-input-finalization-gate.spec.ts",
      "tests/e2e/action-468-confidence-calibration-recommendation-advisory-projection-operator-input-completion-continuation.spec.ts",
      "tests/e2e/action-469-confidence-calibration-recommendation-advisory-projection-operator-input-validation-and-preview-deployment-execution-approval-gate.spec.ts",
      "tests/e2e/action-470-confidence-calibration-recommendation-advisory-projection-preview-deployment-execution-approval-gate.spec.ts",
      "tests/e2e/action-471-confidence-calibration-recommendation-advisory-projection-preview-deployment-execution.spec.ts",
      "tests/e2e/action-472-confidence-calibration-recommendation-advisory-projection-preview-deployment-abort-remediation-approval-gate.spec.ts",
      "tests/e2e/action-473-confidence-calibration-recommendation-advisory-projection-preview-full-candidate-construction-and-netlify-target-access-completion.spec.ts",
      "tests/e2e/action-474-confidence-calibration-recommendation-advisory-projection-preview-netlify-target-and-secure-access-completion.spec.ts",
      "tests/e2e/action-475-confidence-calibration-recommendation-advisory-projection-preview-netlify-target-validation-and-secure-access-approval-gate.spec.ts",
      "tests/e2e/action-476-confidence-calibration-recommendation-advisory-projection-preview-secure-netlify-authentication-completion.spec.ts",
      "tests/e2e/action-477-confidence-calibration-recommendation-advisory-projection-preview-netlify-site-linking-approval-gate.spec.ts",
      "tests/e2e/action-478-confidence-calibration-recommendation-advisory-projection-preview-netlify-site-linking-execution.spec.ts",
      "tests/e2e/action-479-confidence-calibration-recommendation-advisory-projection-preview-deployment-retry-approval-gate.spec.ts",
      "tests/e2e/action-480-confidence-calibration-recommendation-advisory-projection-preview-deployment-retry-execution.spec.ts",
      "tests/e2e/action-481-confidence-calibration-recommendation-advisory-projection-preview-deployment-reconstruction-remediation-gate.spec.ts",
      "tests/e2e/action-482-confidence-calibration-recommendation-advisory-projection-preview-dependency-materialization-completion-gate.spec.ts",
      "tests/e2e/action-483-confidence-calibration-recommendation-advisory-projection-preview-full-candidate-build-rehearsal.spec.ts",
      "tests/e2e/action-484-confidence-calibration-recommendation-advisory-projection-preview-temporary-candidate-git-integrity-remediation-approval-gate.spec.ts",
      "tests/e2e/action-485-confidence-calibration-recommendation-advisory-projection-preview-full-candidate-build-rehearsal-retry.spec.ts",
      "tests/e2e/action-486-confidence-calibration-recommendation-advisory-projection-preview-temp-path-abort-remediation-approval-gate.spec.ts",
      "tests/e2e/action-487-confidence-calibration-recommendation-advisory-projection-preview-full-candidate-build-rehearsal-retry-after-temp-path-remediation.spec.ts",
      "tests/e2e/action-488-confidence-calibration-recommendation-advisory-projection-preview-source-safety-marker-classification-remediation-approval-gate.spec.ts",
      "tests/e2e/action-489-confidence-calibration-recommendation-advisory-projection-preview-full-candidate-build-rehearsal-retry-after-source-safety-remediation.spec.ts",
      "tests/e2e/action-490-confidence-calibration-recommendation-advisory-projection-preview-command-inventory-binding-remediation-approval-gate.spec.ts",
      "tests/e2e/action-491-confidence-calibration-recommendation-advisory-projection-preview-candidate-runtime-dependency-completeness-remediation-gate.spec.ts",
      "tests/e2e/action-492-confidence-calibration-recommendation-advisory-projection-preview-runtime-complete-candidate-reconstruction-and-hash-freeze.spec.ts",
      "tests/e2e/action-493-confidence-calibration-recommendation-advisory-projection-preview-runtime-complete-candidate-build-rehearsal-approval-gate.spec.ts",
      "tests/e2e/action-494-confidence-calibration-recommendation-advisory-projection-preview-runtime-complete-candidate-build-rehearsal.spec.ts",
      "tests/e2e/action-495-confidence-calibration-recommendation-advisory-projection-preview-flag-rehearsal-check-remediation-approval-gate.spec.ts",
      "tests/e2e/action-496-confidence-calibration-recommendation-advisory-projection-preview-runtime-complete-candidate-build-rehearsal-retry-after-preview-flag-remediation.spec.ts",
      "tests/e2e/action-497-confidence-calibration-recommendation-advisory-projection-preview-source-safety-checker-false-positive-remediation-approval-gate.spec.ts",
      "tests/e2e/action-498-confidence-calibration-recommendation-advisory-projection-preview-runtime-complete-candidate-build-rehearsal-retry-after-source-safety-checker-remediation.spec.ts",
      "tests/e2e/action-499-confidence-calibration-recommendation-advisory-projection-preview-source-safety-wrong-hash-rejection-remediation-approval-gate.spec.ts",
      "tests/e2e/action-500-confidence-calibration-recommendation-advisory-projection-preview-runtime-complete-candidate-build-rehearsal-retry-after-wrong-hash-rejection-remediation.spec.ts",
      "tests/e2e/action-501-confidence-calibration-recommendation-advisory-projection-preview-candidate-rehearsal-build-failure-remediation-approval-gate.spec.ts",
      "tests/e2e/action-502-confidence-calibration-recommendation-advisory-projection-preview-candidate-build-failure-diagnostic-evidence-completion-gate.spec.ts",
      "tests/e2e/action-503-confidence-calibration-recommendation-advisory-projection-preview-candidate-build-failure-bounded-diagnostic-capture.spec.ts",
      "tests/e2e/action-504-confidence-calibration-recommendation-advisory-projection-preview-candidate-build-runner-or-environment-remediation-gate.spec.ts",
      "tests/e2e/action-505-confidence-calibration-recommendation-advisory-projection-preview-runner-environment-precheck-completion-gate.spec.ts",
      "tests/e2e/action-506-confidence-calibration-recommendation-advisory-projection-preview-turbopack-runner-environment-comparison-and-rehearsal-gate.spec.ts",
      "tests/e2e/action-507-confidence-calibration-recommendation-advisory-projection-preview-turbopack-comparison-invocation-completion-gate.spec.ts",
      "tests/e2e/action-508-confidence-calibration-recommendation-advisory-projection-preview-turbopack-runner-environment-comparison-and-runtime-complete-candidate-rehearsal.spec.ts",
      "tests/e2e/action-509-confidence-calibration-recommendation-advisory-projection-preview-build-failure-specific-diagnosis-or-remediation-gate.spec.ts",
      "tests/e2e/action-510-confidence-calibration-recommendation-advisory-projection-preview-webpack-build-failure-bounded-diagnostic-capture-gate.spec.ts",
      "tests/e2e/action-511-confidence-calibration-recommendation-advisory-projection-preview-webpack-build-failure-bounded-diagnostic-capture.spec.ts",
      "tests/e2e/action-512-confidence-calibration-recommendation-advisory-projection-preview-webpack-comparison-invocation-remediation-gate.spec.ts",
      "tests/e2e/action-513-confidence-calibration-recommendation-advisory-projection-preview-webpack-invocation-runtime-precheck-completion-gate.spec.ts",
      "tests/e2e/action-514-confidence-calibration-recommendation-advisory-projection-preview-webpack-build-failure-bounded-diagnostic-retry-after-invocation-remediation.spec.ts",
      "tests/e2e/action-515-confidence-calibration-recommendation-advisory-projection-preview-candidate-build-source-remediation.spec.ts",
      "tests/e2e/action-516-confidence-calibration-recommendation-advisory-projection-preview-remediated-runtime-complete-candidate-reconstruction-and-hash-freeze.spec.ts",
      "tests/e2e/action-517-confidence-calibration-recommendation-advisory-projection-preview-candidate-reconstruction-path-set-mismatch-remediation-gate.spec.ts",
      "tests/e2e/action-518-confidence-calibration-recommendation-advisory-projection-preview-remediated-32-file-candidate-reconstruction-and-hash-freeze.spec.ts",
      "tests/e2e/action-519-confidence-calibration-recommendation-advisory-projection-preview-remediated-32-file-candidate-build-rehearsal-approval-gate.spec.ts",
      "tests/e2e/action-520-confidence-calibration-recommendation-advisory-projection-preview-remediated-32-file-candidate-build-rehearsal.spec.ts",
      "tests/e2e/action-521-confidence-calibration-recommendation-advisory-projection-preview-action-520-path-safety-checker-remediation-gate.spec.ts",
      "tests/e2e/action-522-confidence-calibration-recommendation-advisory-projection-preview-remediated-32-file-candidate-build-rehearsal-retry-after-path-safety-remediation.spec.ts",
      "tests/e2e/action-523-confidence-calibration-recommendation-advisory-projection-preview-candidate-build-failure-relationship-and-remediation-approval-gate.spec.ts",
      "tests/e2e/action-524-confidence-calibration-recommendation-advisory-projection-preview-turbopack-runner-environment-remediation-gate.spec.ts",
      "tests/e2e/action-525-confidence-calibration-recommendation-advisory-projection-preview-candidate-build-runner-environment-precheck-completion-gate.spec.ts",
      "tests/e2e/action-526-confidence-calibration-recommendation-advisory-projection-preview-public-build-environment-and-loopback-capability-remediation-gate.spec.ts",
      "tests/e2e/action-527-confidence-calibration-recommendation-advisory-projection-preview-public-build-signal-operator-input-and-alternate-runner-precheck-gate.spec.ts",
      "tests/e2e/action-528-confidence-calibration-recommendation-advisory-projection-preview-external-terminal-precheck-handoff-gate.spec.ts",
      "tests/e2e/action-530-confidence-calibration-recommendation-advisory-projection-preview-action-529-temp-boundary-remediation.spec.ts",
      "tests/e2e/action-531-confidence-calibration-recommendation-advisory-projection-preview-action-529-hidden-input-and-local-ipc-remediation.spec.ts",
      "tests/e2e/action-532-confidence-calibration-recommendation-advisory-projection-preview-external-terminal-runner-precheck-evidence-acceptance-gate.spec.ts",
      "tests/e2e/action-533-confidence-calibration-recommendation-advisory-projection-preview-external-terminal-candidate-rehearsal-handoff-gate.spec.ts",
      "tests/e2e/action-535-confidence-calibration-recommendation-advisory-projection-preview-action-534-historical-candidate-inventory-hash-exception-remediation.spec.ts",
      "tests/e2e/action-536-confidence-calibration-recommendation-advisory-projection-preview-action-534-command-boundary-remediation.spec.ts",
      "tests/e2e/action-537-confidence-calibration-recommendation-advisory-projection-preview-action-534-runner-remediation-application-audit.spec.ts",
      "tests/e2e/action-538-confidence-calibration-recommendation-advisory-projection-preview-action-534-turbopack-prerender-failure-and-runner-fingerprint-diagnostic-gate.spec.ts",
      "tests/e2e/post-trade-staging-insert-function-static.spec.ts",
];

const forbiddenRuntimePaths = [
  "app/api/hb307c",
  "app/api/ping307h",
  "app/api/route-publication-diagnostic",
  "app/route-publication-probe",
  "app/public-probe-307g",
  "app/ping307h",
  "public/ping307i.txt",
  "public/ping307i.json",
  "public/ping307j.html",
  "public/action-307l-runtime-boundary-status.json",
];

const markerRootPaths = ["app", "public"];
const markerFilePaths = ["proxy.ts", "middleware.ts", "middleware.js", "netlify.toml"];
const action492PureConfidenceCalibrationBinding = {
  path: "lib/pure-confidence-calibration.ts",
  sha256: "bd913c95d04fc450f4499b18c01744da04a148e8d18cb4d9113d990ee8deaa70",
  action491Record:
    "docs/action-491-confidence-calibration-recommendation-advisory-projection-preview-candidate-runtime-dependency-completeness-remediation-approval-record.json",
  action492Record:
    "docs/action-492-confidence-calibration-recommendation-advisory-projection-preview-runtime-complete-candidate-record.json",
};
const action518EvaluateOutcomesRouteBinding = {
  path: "app/api/recommendations/evaluate-outcomes/route.ts",
  sha256: "26407a8b78625a19a48a02ecf44e03db1642998da5f1d8acc5e8d47227773265",
  action517Record:
    "docs/action-517-confidence-calibration-recommendation-advisory-projection-preview-candidate-path-set-mismatch-remediation-approval-record.json",
  action518Record:
    "docs/action-518-confidence-calibration-recommendation-advisory-projection-preview-remediated-32-file-candidate-record.json",
};
const action529SuccessfulResultBinding = {
  path:
    "docs/action-529-confidence-calibration-recommendation-advisory-projection-preview-external-terminal-runner-precheck-result.json",
  verifier:
    "scripts/action-529-confidence-calibration-recommendation-advisory-projection-preview-external-terminal-runner-precheck-result-verify.mjs",
};
const action534HistoricalAbortedResultBinding = {
  path:
    "docs/action-534-confidence-calibration-recommendation-advisory-projection-preview-external-terminal-candidate-rehearsal-result.json",
  verifier:
    "scripts/action-534-confidence-calibration-recommendation-advisory-projection-preview-external-terminal-candidate-rehearsal-result-verify.mjs",
  runner:
    "scripts/action-534-confidence-calibration-recommendation-advisory-projection-preview-external-terminal-candidate-rehearsal.mjs",
  runnerContractVersion: "action_537_action_534_runner_contract_v1",
  runnerSha256: "85233263aa79afd1a3b1cf29f8d30e9ba0f54a13a4dddfb07e074cdb68bc6554",
  blocker:
    "candidate_hash_mismatch:docs/action-465-confidence-calibration-recommendation-advisory-projection-preview-candidate-inventory.json",
  commandBoundaryDefect:
    "action_534_external_control_verifiers_misassigned_as_candidate_internal_prebuild_commands",
  staleExecutionClassification:
    "action_536_remediation_not_reflected_in_operator_executed_action_534_behavior",
};
const isolatedUnrelatedExecutionFiles = [
  "docs/post-trade-final-source-controlled-staging-execution-gate-no-execution.md",
  "docs/post-trade-final-source-controlled-staging-execution-gate-static-security-review-no-execution.md",
  "docs/post-trade-single-use-source-controlled-staging-execution-authorization-artifact-no-execution.md",
  "docs/post-trade-single-use-source-controlled-staging-execution-authorization-artifact-static-security-review-no-execution.md",
  "docs/post-trade-durable-one-shot-authorization-consumption-contract-no-persistence-no-execution.md",
  "docs/post-trade-durable-one-shot-authorization-consumption-contract-static-security-review-no-persistence-no-execution.md",
  "docs/post-trade-source-controlled-staging-execution-function-implementation-no-execution.md",
  "docs/post-trade-source-controlled-staging-execution-function-static-security-review-no-execution.md",
  "lib/post-trade-staging-execution-function.ts",
  "lib/post-trade-final-staging-execution-gate-core.ts",
  "lib/post-trade-final-staging-execution-gate.ts",
  "lib/post-trade-staging-execution-authorization-artifact-core.ts",
  "lib/post-trade-staging-execution-authorization-artifact.ts",
  "lib/post-trade-durable-one-shot-authorization-consumption-contract.ts",
  "lib/post-trade-durable-authorization-consumption-persistence-schema-design.ts",
  "lib/post-trade-staging-migration-deployment-gate-core.ts",
  "lib/post-trade-staging-migration-deployment-gate.ts",
  "docs/post-trade-durable-authorization-consumption-persistence-schema-design-static-security-review-no-migration-no-execution.md",
  "docs/post-trade-durable-authorization-consumption-source-controlled-staging-migration-no-deployment-no-execution.md",
  "docs/post-trade-durable-authorization-consumption-staging-migration-static-sql-security-review-no-deployment-no-execution.md",
  "docs/post-trade-explicit-source-controlled-staging-migration-deployment-gate-no-deployment.md",
  "docs/post-trade-explicit-source-controlled-staging-migration-deployment-gate-static-security-review-no-deployment.md",
  "docs/post-trade-read-only-live-staging-migration-preflight-contract-no-commands-no-deployment.md",
  "docs/post-trade-read-only-live-staging-migration-preflight-contract-static-security-review-no-commands-no-deployment.md",
  "docs/post-trade-single-use-source-controlled-staging-migration-deployment-readiness-artifact-no-deployment.md",
  "docs/post-trade-single-use-source-controlled-staging-migration-deployment-readiness-artifact-static-security-review-no-deployment.md",
  "lib/post-trade-read-only-live-staging-migration-preflight-contract.ts",
  "lib/post-trade-staging-migration-deployment-readiness-artifact-core.ts",
  "lib/post-trade-staging-migration-deployment-readiness-artifact.ts",
  "supabase/migrations/20260710000000_create_execution_authorization_consumptions.sql",
  "tests/e2e/post-trade-staging-execution-function-static.spec.ts",
  "tests/e2e/post-trade-final-staging-execution-gate.spec.ts",
  "tests/e2e/post-trade-staging-execution-authorization-artifact.spec.ts",
  "tests/e2e/post-trade-durable-one-shot-authorization-consumption-contract.spec.ts",
  "tests/e2e/post-trade-durable-authorization-consumption-persistence-schema-design.spec.ts",
  "tests/e2e/post-trade-durable-authorization-consumption-migration-static.spec.ts",
  "tests/e2e/post-trade-read-only-live-staging-migration-preflight-contract.spec.ts",
  "tests/e2e/post-trade-staging-migration-deployment-gate.spec.ts",
  "tests/e2e/post-trade-staging-migration-deployment-readiness-artifact.spec.ts",
];

function runGit(args, options = {}) {
  return execFileSync("git", args, {
    cwd: repoRoot,
    encoding: "utf8",
    stdio: options.silent ? ["ignore", "pipe", "ignore"] : ["ignore", "pipe", "pipe"],
  }).trim();
}

function isSafeNetlifyGitignoreDiff() {
  const diff = runGit(["diff", "--", ".gitignore"]);
  if (!diff) return false;

  const bodyLines = diff
    .split("\n")
    .filter((line) => !line.startsWith("diff --git "))
    .filter((line) => !line.startsWith("index "))
    .filter((line) => !line.startsWith("--- "))
    .filter((line) => !line.startsWith("+++ "))
    .filter((line) => !line.startsWith("@@"));
  const removedLines = bodyLines.filter((line) => line.startsWith("-"));
  const addedLines = bodyLines
    .filter((line) => line.startsWith("+"))
    .map((line) => line.slice(1));
  const allowedAddedLines = ["", "# Local Netlify folder", ".netlify", ".netlify/"];

  return (
    removedLines.length === 0 &&
    addedLines.length > 0 &&
    addedLines.every((line) => allowedAddedLines.includes(line)) &&
    (addedLines.includes(".netlify") || addedLines.includes(".netlify/"))
  );
}

function gitCommandSucceeds(args) {
  try {
    runGit(args, { silent: true });
    return true;
  } catch {
    return false;
  }
}

function exists(relativePath) {
  return existsSync(join(repoRoot, relativePath));
}

function sha256(relativePath) {
  return createHash("sha256").update(readFileSync(join(repoRoot, relativePath))).digest("hex");
}

function readJson(relativePath) {
  return JSON.parse(readFileSync(join(repoRoot, relativePath), "utf8"));
}

function isBoundAction492PureConfidenceCalibrationFile(relativePath) {
  if (relativePath !== action492PureConfidenceCalibrationBinding.path) return false;
  if (!exists(relativePath)) return false;
  if (sha256(relativePath) !== action492PureConfidenceCalibrationBinding.sha256) return false;
  if (
    !exists(action492PureConfidenceCalibrationBinding.action491Record) ||
    !exists(action492PureConfidenceCalibrationBinding.action492Record)
  ) {
    return false;
  }

  const action491 = readJson(action492PureConfidenceCalibrationBinding.action491Record);
  const action492 = readJson(action492PureConfidenceCalibrationBinding.action492Record);
  const action492Entry = action492.new_changed_file_inventory?.find(
    (entry) => entry.path === relativePath,
  );

  return (
    action491.approval_decision === "approved" &&
    action491.first_missing_runtime_path === relativePath &&
    action491.runtime_dependency_inventory?.some(
      (entry) =>
        entry.path === relativePath &&
        entry.expected_sha256 === action492PureConfidenceCalibrationBinding.sha256,
    ) &&
    action492.approved_by_action === 491 &&
    action492.added_runtime_path === relativePath &&
    action492.added_runtime_path_hash === action492PureConfidenceCalibrationBinding.sha256 &&
    action492Entry?.classification === "runtime_required_build_dependency" &&
    action492Entry?.provenance ===
      "action_420_action_423_action_426_action_491_approved_runtime_completion"
  );
}

function isBoundAction518EvaluateOutcomesRoute(relativePath) {
  if (relativePath !== action518EvaluateOutcomesRouteBinding.path) return false;
  if (!exists(relativePath)) return false;
  if (sha256(relativePath) !== action518EvaluateOutcomesRouteBinding.sha256) return false;
  if (
    !exists(action518EvaluateOutcomesRouteBinding.action517Record) ||
    !exists(action518EvaluateOutcomesRouteBinding.action518Record)
  ) {
    return false;
  }

  const routeSource = readFileSync(join(repoRoot, relativePath), "utf8");
  const exportedFunctions = [
    ...routeSource.matchAll(/^export\s+(?:async\s+)?function\s+([A-Za-z0-9_]+)/gm),
  ].map((match) => match[1]);
  const action517 = readJson(action518EvaluateOutcomesRouteBinding.action517Record);
  const action518 = readJson(action518EvaluateOutcomesRouteBinding.action518Record);
  const action518Entry = action518.new_changed_file_inventory?.find(
    (entry) => entry.path === relativePath,
  );

  return (
    action517.approval_decision === "approved" &&
    action517.missing_required_path === relativePath &&
    action517.missing_required_path_hash === action518EvaluateOutcomesRouteBinding.sha256 &&
    action518.candidate_reconstruction_result ===
      "remediated_32_file_candidate_reconstructed_and_frozen" &&
    action518.added_route_path === relativePath &&
    action518.added_route_hash === action518EvaluateOutcomesRouteBinding.sha256 &&
    action518.added_route_classification === "required_build_source_path_addition" &&
    JSON.stringify(action518.route_export_surface) === JSON.stringify(["POST"]) &&
    JSON.stringify(exportedFunctions) === JSON.stringify(["POST"]) &&
    routeSource.includes("function buildOutcomeEligibility") &&
    !routeSource.includes("export function buildOutcomeEligibility") &&
    action518Entry?.classification === "required_build_source_path_addition" &&
    action518Entry?.provenance ===
      "action_514_action_515_action_516_action_517_approved_build_source_remediation"
  );
}

function isBoundSuccessfulAction529Result(relativePath) {
  if (relativePath !== action529SuccessfulResultBinding.path) return false;
  if (!exists(relativePath) || !exists(action529SuccessfulResultBinding.verifier)) return false;

  try {
    execFileSync("node", [action529SuccessfulResultBinding.verifier], {
      cwd: repoRoot,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    });
  } catch {
    return false;
  }

  const result = readJson(relativePath);
  const signals = result.required_public_build_signals ?? [];
  return (
    result.schema_version === "action_529_external_terminal_runner_precheck_result_v1" &&
    result.precheck_result === "external_terminal_runner_precheck_passed" &&
    result.operator_attempt_number === 2 &&
    result.cleanup_result === "passed" &&
    result.raw_environment_values_recorded === false &&
    result.environment_values_hashed === false &&
    result.external_network_used === false &&
    result.supabase_accessed === false &&
    result.provider_called === false &&
    result.build_performed === false &&
    result.candidate_reconstructed === false &&
    result.rehearsal_performed === false &&
    result.deployment_performed === false &&
    result.preview_activated === false &&
    signals.length === 2 &&
    signals.every((signal) => signal.value_recorded === false)
  );
}

function isBoundHistoricalAbortedAction534Result(relativePath) {
  if (relativePath !== action534HistoricalAbortedResultBinding.path) return false;
  if (!exists(relativePath) || !exists(action534HistoricalAbortedResultBinding.verifier)) return false;

  try {
    execFileSync("node", [action534HistoricalAbortedResultBinding.verifier], {
      cwd: repoRoot,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    });
  } catch {
    return false;
  }

  const result = readJson(relativePath);
  const historicalAborted =
    result.schema_version === "action_534_external_terminal_candidate_rehearsal_result_v1" &&
    result.operator_rehearsal_attempt_number === 1 &&
    result.candidate_rehearsal_result === "external_terminal_candidate_rehearsal_aborted" &&
    result.authoritative_build_attempt_count === 0 &&
    result.webpack_diagnostic_attempt_count === 0 &&
    result.authoritative_error_class === action534HistoricalAbortedResultBinding.blocker &&
    result.cleanup_result === "passed" &&
    result.deployment_performed === false &&
    result.preview_activated === false;
  const commandStatus = (commandPath) =>
    (Array.isArray(result.prebuild_command_results) ? result.prebuild_command_results : []).find(
      (entry) => typeof entry?.command === "string" && entry.command.includes(commandPath),
    )?.status;
  const externalControlStatus = (commandPath) =>
    (Array.isArray(result.external_control_results) ? result.external_control_results : []).find(
      (entry) => typeof entry?.command === "string" && entry.command.includes(commandPath),
    )?.status;
  const boundaryDefectFailed =
    result.schema_version === "action_534_external_terminal_candidate_rehearsal_result_v1" &&
    result.candidate_rehearsal_result === "external_terminal_candidate_rehearsal_failed" &&
    result.authoritative_build_attempt_count === 0 &&
    result.candidate_reconstruction_result === "exact_candidate_reconstructed" &&
    result.runtime_dependency_closure_result === "complete" &&
    result.source_integrity_result === "baseline_plus_overlay_manifest_integrity" &&
    result.source_safety_result === "source_safety_passed" &&
    result.preview_flag_verification_result === "preview_flag_disabled_verified" &&
    result.dependency_materialization_result === "temporary_verified_node_modules_copy" &&
    commandStatus("scripts/action-518-confidence-calibration-recommendation-advisory-projection-preview-remediated-32-file-candidate-reconstruction-and-hash-freeze-verify.mjs") === "failed" &&
    commandStatus("scripts/action-532-confidence-calibration-recommendation-advisory-projection-preview-external-terminal-runner-precheck-evidence-acceptance-gate-verify.mjs") === "failed" &&
    commandStatus("npx next typegen") === "passed" &&
    commandStatus("npx tsc --noEmit") === "passed" &&
    result.cleanup_result === "passed" &&
    result.deployment_performed === false &&
    result.preview_activated === false;
  const remediatedBuildFailed =
    result.schema_version === "action_534_external_terminal_candidate_rehearsal_result_v1" &&
    result.runner_contract_version === action534HistoricalAbortedResultBinding.runnerContractVersion &&
    result.runner_script_sha256 === action534HistoricalAbortedResultBinding.runnerSha256 &&
    exists(action534HistoricalAbortedResultBinding.runner) &&
    sha256(action534HistoricalAbortedResultBinding.runner) ===
      action534HistoricalAbortedResultBinding.runnerSha256 &&
    result.result_written_at_classification === "fresh_action_534_result_object_created" &&
    result.fresh_result_object_created === true &&
    result.prior_command_results_reused === false &&
    result.atomic_result_replacement_enabled === true &&
    result.operator_rehearsal_attempt_number === 4 &&
    result.historical_operator_attempt_count === 3 &&
    result.operator_invocation_count === 3 &&
    result.valid_runner_attempt_count === 2 &&
    result.prior_attempt_result === "external_terminal_candidate_rehearsal_failed" &&
    result.prior_attempt_blocker === action534HistoricalAbortedResultBinding.staleExecutionClassification &&
    result.command_boundary_remediation_applied === true &&
    result.previous_blocker_classification ===
      action534HistoricalAbortedResultBinding.commandBoundaryDefect &&
    result.stale_execution_classification ===
      action534HistoricalAbortedResultBinding.staleExecutionClassification &&
    result.candidate_reconstruction_result === "exact_candidate_reconstructed" &&
    result.runtime_dependency_closure_result === "complete" &&
    result.source_integrity_result === "baseline_plus_overlay_manifest_integrity" &&
    result.source_safety_result === "source_safety_passed" &&
    result.preview_flag_verification_result === "preview_flag_disabled_verified" &&
    result.dependency_materialization_result === "temporary_verified_node_modules_copy" &&
    commandStatus("npx next typegen") === "passed" &&
    commandStatus("npx tsc --noEmit") === "passed" &&
    result.authoritative_build_attempt_count === 1 &&
    result.authoritative_build_result === "failed" &&
    result.authoritative_build_phase === "authoritative_build" &&
    result.authoritative_error_class === "command_failed" &&
    result.webpack_diagnostic_attempt_count === 1 &&
    result.webpack_diagnostic_result === "passed" &&
    externalControlStatus("scripts/action-518-confidence-calibration-recommendation-advisory-projection-preview-remediated-32-file-candidate-reconstruction-and-hash-freeze-verify.mjs") === "passed" &&
    externalControlStatus("scripts/action-532-confidence-calibration-recommendation-advisory-projection-preview-external-terminal-runner-precheck-evidence-acceptance-gate-verify.mjs") === "passed" &&
    externalControlStatus("scripts/action-533-confidence-calibration-recommendation-advisory-projection-preview-external-terminal-candidate-rehearsal-handoff-gate-verify.mjs") === "passed" &&
    externalControlStatus("scripts/action-535-confidence-calibration-recommendation-advisory-projection-preview-action-534-historical-candidate-inventory-hash-exception-remediation-verify.mjs") === "passed" &&
    externalControlStatus("scripts/action-536-confidence-calibration-recommendation-advisory-projection-preview-action-534-command-boundary-remediation-verify.mjs") === "passed" &&
    result.external_evidence_result === "passed" &&
    result.external_controls_can_establish_readiness_without_build === false &&
    result.build_performed === true &&
    result.rehearsal_performed === true &&
    result.cleanup_result === "passed" &&
    result.deployment_performed === false &&
    result.preview_activated === false &&
    result.raw_environment_values_recorded === false &&
    result.environment_values_hashed === false &&
    result.credential_values_recorded === false &&
    result.external_network_used === false &&
    result.supabase_accessed === false &&
    result.provider_called === false &&
    result.persistence_created === false &&
    result.replay_created === false &&
    result.feedback_created === false &&
    result.confidence_applied === false &&
    result.downstream_behavior_changed === false &&
    result.candidate_rehearsal_result === "external_terminal_candidate_rehearsal_failed" &&
    result.overall_readiness === "blocked" &&
    result.next_action === "action_534_external_terminal_candidate_rehearsal_failure_diagnostic_gate";
  return historicalAborted || boundaryDefectFailed || remediatedBuildFailed;
}

function isAllowedAction319ImplementationFile(relativePath) {
  return (
    isBoundSuccessfulAction529Result(relativePath) ||
    isBoundHistoricalAbortedAction534Result(relativePath) ||
    allowedAction319ImplementationFiles.includes(relativePath) ||
    isBoundAction492PureConfidenceCalibrationFile(relativePath) ||
    isBoundAction518EvaluateOutcomesRoute(relativePath)
  );
}

function collectFiles(relativePath) {
  const absolutePath = join(repoRoot, relativePath);
  if (!existsSync(absolutePath)) return [];
  const stat = statSync(absolutePath);
  if (stat.isFile()) return [relativePath];
  if (!stat.isDirectory()) return [];

  return readdirSync(absolutePath)
    .flatMap((entry) => collectFiles(join(relativePath, entry)))
    .sort();
}

function statusFiles() {
  const output = execFileSync("git", ["status", "--short", "--untracked-files=all"], {
    cwd: repoRoot,
    encoding: "utf8",
  });
  if (!output) return [];

  return output
    .trimEnd()
    .split("\n")
    .map((line) => line.slice(3).trim())
    .map((path) => (path.includes(" -> ") ? path.split(" -> ").at(-1) ?? path : path))
    .sort();
}

function markerFound(marker) {
  const files = [
    ...markerFilePaths,
    ...markerRootPaths.flatMap((relativePath) => collectFiles(relativePath)),
  ];

  return files.some((relativePath) => {
    const absolutePath = join(repoRoot, relativePath);
    if (!existsSync(absolutePath)) return false;
    return readFileSync(absolutePath, "utf8").includes(marker);
  });
}

function isForbiddenChangedFile(relativePath) {
  if (relativePath === ".gitignore" && isSafeNetlifyGitignoreDiff()) return false;
  if (isAllowedAction319ImplementationFile(relativePath)) return false;
  if (relativePath.startsWith("app/")) return true;
  if (relativePath.startsWith("supabase/")) return true;
  if (["proxy.ts", "middleware.ts", "middleware.js", "netlify.toml"].includes(relativePath)) {
    return true;
  }
  if (relativePath.includes("provider") && !relativePath.startsWith("docs/")) return true;
  if (relativePath.includes("scanner") && !relativePath.startsWith("docs/")) return true;
  if (relativePath.includes("ranking") && !relativePath.startsWith("docs/")) return true;
  if (relativePath.includes("broker") && !relativePath.startsWith("docs/")) return true;
  if (relativePath.includes("execution") && !relativePath.startsWith("docs/")) return true;
  return forbiddenRuntimePaths.includes(relativePath);
}

const currentBranch = runGit(["branch", "--show-current"]);
const changedFiles = statusFiles();
const isolatedChangedFiles = changedFiles.filter((relativePath) =>
  isolatedUnrelatedExecutionFiles.includes(relativePath),
);
const actionChangedFiles = changedFiles.filter(
  (relativePath) => !isolatedUnrelatedExecutionFiles.includes(relativePath),
);
const workingTreeClean = changedFiles.length === 0;
const uncommittedAction319Only =
  actionChangedFiles.length > 0 &&
  actionChangedFiles.every((relativePath) =>
    isAllowedAction319ImplementationFile(relativePath) ||
      (relativePath === ".gitignore" && isSafeNetlifyGitignoreDiff()),
  );
const unexpectedUncommittedFiles = actionChangedFiles.filter(
  (relativePath) =>
    !isAllowedAction319ImplementationFile(relativePath) &&
    !(relativePath === ".gitignore" && isSafeNetlifyGitignoreDiff()),
);
const requiredFilesMissing = requiredFiles.filter((relativePath) => !exists(relativePath));
const forbiddenRuntimeChanges = actionChangedFiles.filter(isForbiddenChangedFile);
const forbiddenRuntimeArtifacts = forbiddenRuntimePaths.filter(exists);
const forbiddenMarkersFound = [
  "action_307k_proxy_runtime_crash_isolation",
].filter(markerFound);
const staticBatchCommitFound = gitCommandSucceeds([
  "merge-base",
  "--is-ancestor",
  expectedStaticBatchCommit,
  "HEAD",
]);

const passed =
  currentBranch === expectedBranch &&
  staticBatchCommitFound &&
  (workingTreeClean || uncommittedAction319Only) &&
  unexpectedUncommittedFiles.length === 0 &&
  requiredFilesMissing.length === 0 &&
  forbiddenRuntimeChanges.length === 0 &&
  forbiddenRuntimeArtifacts.length === 0 &&
  forbiddenMarkersFound.length === 0;

const result = {
  verification_status: passed ? "passed" : "failed",
  current_branch: currentBranch,
  expected_branch: expectedBranch,
  static_batch_commit_found: staticBatchCommitFound,
  expected_static_batch_commit: expectedStaticBatchCommit,
  working_tree_clean: workingTreeClean,
  uncommitted_action_319_files_allowed: uncommittedAction319Only,
  uncommitted_files: changedFiles,
  unexpected_uncommitted_files: unexpectedUncommittedFiles,
  isolated_unrelated_execution_files: isolatedChangedFiles,
  isolated_unrelated_execution_files_are_action_artifacts: false,
  post_commit_verification_only: true,
  deploy_readiness: false,
  main_push_allowed: false,
  runtime_route_changes_allowed: false,
  proxy_changes_allowed: false,
  required_files_found: requiredFilesMissing.length === 0,
  required_files_missing: requiredFilesMissing,
  forbidden_runtime_changes_detected:
    forbiddenRuntimeChanges.length > 0 || forbiddenRuntimeArtifacts.length > 0,
  forbidden_runtime_changed_files: forbiddenRuntimeChanges,
  forbidden_runtime_artifacts_found: forbiddenRuntimeArtifacts,
  forbidden_markers_found: forbiddenMarkersFound,
  no_effect_flags: {
    provider_call_executed: false,
    provider_call_attempted: false,
    supabase_read_executed: false,
    supabase_write_executed: false,
    candles_persisted: false,
    raw_response_persisted: false,
    fetch_run_persisted: false,
    synthetic_outcomes_persisted: false,
    replay_executed: false,
    scanner_behavior_changed: false,
    live_ranking_changed: false,
    recommendation_rows_mutated: false,
  },
  recommended_next_step: passed
    ? "continue_static_local_development_do_not_deploy_or_push_main"
    : "restore_clean_static_batch_state_before_continuing",
};

process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
if (!passed) process.exitCode = 1;
