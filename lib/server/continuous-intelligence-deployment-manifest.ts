import "server-only";

import { boundedShadowCollectorProofAuditContractVersion } from "@/lib/bounded-shadow-collector-proof-audit-contract";
import {
  continuousIntelligenceShadowCanaryActivationReadinessContractVersion,
  continuousIntelligenceShadowCanaryActivationReadinessRoutePath,
} from "@/lib/continuous-intelligence-shadow-canary-activation-readiness";
import { continuousIntelligenceCreditLedgerContractVersion } from "@/lib/continuous-intelligence-credit-ledger";
import { continuousIntelligenceShadowCanaryClaimContractVersion } from "@/lib/continuous-intelligence-shadow-canary-claim-store";
import {
  continuousIntelligenceShadowCollectorCanaryContractVersion,
  continuousIntelligenceShadowCollectorCanaryPreflightRoutePath,
  continuousIntelligenceShadowCollectorCanaryRoutePath,
} from "@/lib/continuous-intelligence-shadow-collector-canary";

export const continuousIntelligenceDeploymentManifestContractVersion =
  "continuous_intelligence_deployment_manifest_v1" as const;
export const continuousIntelligenceShadowCanaryFunctionBuildMarker =
  "continuous_intelligence_shadow_canary_function_foundation_v1" as const;

// Artifact facts only. Repository declaration absence does not prove that a
// deployed or remote platform schedule is absent.
export const continuousIntelligenceDeploymentManifest = Object.freeze({
  contract_version: continuousIntelligenceDeploymentManifestContractVersion,
  route_paths: Object.freeze([
    "/api/automation/continuous-intelligence/shadow-collector/bounded-execution-proof/audits",
    "/api/automation/continuous-intelligence/credit-ledger",
    "/api/automation/continuous-intelligence/credit-ledger/reconcile",
    continuousIntelligenceShadowCollectorCanaryRoutePath,
    continuousIntelligenceShadowCollectorCanaryPreflightRoutePath,
    continuousIntelligenceShadowCanaryActivationReadinessRoutePath,
  ]),
  function_foundations: Object.freeze([
    Object.freeze({
      source_path: "netlify/functions/scheduled-shadow-collector-canary.ts",
      build_marker: continuousIntelligenceShadowCanaryFunctionBuildMarker,
    }),
  ]),
  expected_contract_versions: Object.freeze({
    durable_audit: boundedShadowCollectorProofAuditContractVersion,
    credit_ledger: continuousIntelligenceCreditLedgerContractVersion,
    daily_claim: continuousIntelligenceShadowCanaryClaimContractVersion,
    canary: continuousIntelligenceShadowCollectorCanaryContractVersion,
    activation_readiness: continuousIntelligenceShadowCanaryActivationReadinessContractVersion,
  }),
  repository_schedule_declaration: "absent" as const,
});
