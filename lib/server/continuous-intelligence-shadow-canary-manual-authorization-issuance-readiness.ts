import "server-only";

import {
  continuousIntelligenceShadowCanaryManualAuthorizationIssuanceReadinessProbeRpcName,
  type ContinuousIntelligenceShadowCanaryManualAuthorizationIssuanceReadinessProbe,
} from "@/lib/continuous-intelligence-shadow-canary-manual-authorization-issuance-readiness";
import { getServerSupabaseClient } from "@/lib/supabase-server";

const booleanKeys = [
  "authorization_table_available",
  "lease_table_available",
  "authorization_table_rls_enabled",
  "lease_table_rls_enabled",
  "authorization_issue_rpc_available",
  "authorization_issue_rpc_signature_valid",
  "authorization_issue_rpc_service_role_executable",
  "authorization_issue_rpc_public_executable",
  "authorization_issue_rpc_anon_executable",
  "authorization_issue_rpc_authenticated_executable",
  "lease_issue_rpc_available",
  "lease_issue_rpc_signature_valid",
  "lease_issue_rpc_service_role_executable",
  "lease_issue_rpc_public_executable",
  "lease_issue_rpc_anon_executable",
  "lease_issue_rpc_authenticated_executable",
  "transaction_prerequisites_valid",
] as const;

function unavailable(
  probe_status: ContinuousIntelligenceShadowCanaryManualAuthorizationIssuanceReadinessProbe["probe_status"],
): ContinuousIntelligenceShadowCanaryManualAuthorizationIssuanceReadinessProbe {
  return {
    probe_status,
    authorization_table_available: null,
    lease_table_available: null,
    authorization_table_rls_enabled: null,
    lease_table_rls_enabled: null,
    authorization_issue_rpc_available: null,
    authorization_issue_rpc_signature_valid: null,
    authorization_issue_rpc_service_role_executable: null,
    authorization_issue_rpc_public_executable: null,
    authorization_issue_rpc_anon_executable: null,
    authorization_issue_rpc_authenticated_executable: null,
    lease_issue_rpc_available: null,
    lease_issue_rpc_signature_valid: null,
    lease_issue_rpc_service_role_executable: null,
    lease_issue_rpc_public_executable: null,
    lease_issue_rpc_anon_executable: null,
    lease_issue_rpc_authenticated_executable: null,
    transaction_prerequisites_valid: null,
    active_issued_authorization_count: null,
    active_issued_lease_count: null,
  };
}

function parse(value: unknown): ContinuousIntelligenceShadowCanaryManualAuthorizationIssuanceReadinessProbe | null {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const row = raw as Record<string, unknown>;
  if (!booleanKeys.every((key) => typeof row[key] === "boolean")) return null;
  if (
    typeof row.active_issued_authorization_count !== "number" ||
    typeof row.active_issued_lease_count !== "number" ||
    row.active_issued_authorization_count < 0 ||
    row.active_issued_lease_count < 0
  ) return null;
  return {
    probe_status: "available",
    ...Object.fromEntries(booleanKeys.map((key) => [key, row[key]])),
    active_issued_authorization_count: row.active_issued_authorization_count,
    active_issued_lease_count: row.active_issued_lease_count,
  } as ContinuousIntelligenceShadowCanaryManualAuthorizationIssuanceReadinessProbe;
}

export async function readContinuousIntelligenceShadowCanaryManualAuthorizationIssuanceReadiness() {
  const supabase = getServerSupabaseClient();
  if (!supabase.client) return unavailable("environment_configuration_missing");
  try {
    const { data, error } = await supabase.client.rpc(
      continuousIntelligenceShadowCanaryManualAuthorizationIssuanceReadinessProbeRpcName,
    );
    if (error) return unavailable("unknown");
    return parse(data) ?? unavailable("unknown");
  } catch {
    return unavailable("unknown");
  }
}
