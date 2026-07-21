import "server-only";

import {
  continuousIntelligenceShadowCanaryReadinessProbeContractVersion,
  continuousIntelligenceShadowCanaryReadinessProbeRpcName,
  type ContinuousIntelligenceShadowCanarySchemaFacts,
} from "@/lib/continuous-intelligence-shadow-canary-activation-readiness";
import { getServerSupabaseClient } from "@/lib/supabase-server";

type ProbeRow = Omit<
  ContinuousIntelligenceShadowCanarySchemaFacts,
  "probe_status" | "probe_contract_version"
> & {
  probe_contract_version: string;
};

const booleanKeys = [
  "audit_table_available",
  "ledger_table_available",
  "claim_table_available",
  "claim_rpc_available",
  "begin_attempt_rpc_available",
  "finalize_attempt_rpc_available",
  "lifecycle_rpcs_public_executable",
  "lifecycle_rpcs_anon_executable",
  "lifecycle_rpcs_authenticated_executable",
  "lifecycle_rpcs_service_role_executable",
  "audit_canary_entry_kind_constrained",
  "audit_no_effect_constraint_available",
  "ledger_canary_entry_kind_constrained",
  "ledger_zero_reserve_constraint_available",
  "claim_status_constraint_available",
] as const satisfies readonly (keyof ProbeRow)[];

function unavailable(
  probeStatus: Exclude<ContinuousIntelligenceShadowCanarySchemaFacts["probe_status"], "available">,
): ContinuousIntelligenceShadowCanarySchemaFacts {
  return {
    probe_status: probeStatus,
    probe_contract_version: null,
    audit_table_available: null,
    ledger_table_available: null,
    claim_table_available: null,
    claim_rpc_available: null,
    begin_attempt_rpc_available: null,
    finalize_attempt_rpc_available: null,
    lifecycle_rpcs_public_executable: null,
    lifecycle_rpcs_anon_executable: null,
    lifecycle_rpcs_authenticated_executable: null,
    lifecycle_rpcs_service_role_executable: null,
    audit_canary_entry_kind_constrained: null,
    audit_no_effect_constraint_available: null,
    ledger_canary_entry_kind_constrained: null,
    ledger_zero_reserve_constraint_available: null,
    claim_status_constraint_available: null,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseProbeRow(value: unknown): ContinuousIntelligenceShadowCanarySchemaFacts | null {
  if (!isRecord(value) || value.probe_contract_version !== continuousIntelligenceShadowCanaryReadinessProbeContractVersion) return null;
  if (!booleanKeys.every((key) => typeof value[key] === "boolean")) return null;
  const row = value as ProbeRow;
  return {
    probe_status: "available",
    probe_contract_version: row.probe_contract_version,
    audit_table_available: row.audit_table_available,
    ledger_table_available: row.ledger_table_available,
    claim_table_available: row.claim_table_available,
    claim_rpc_available: row.claim_rpc_available,
    begin_attempt_rpc_available: row.begin_attempt_rpc_available,
    finalize_attempt_rpc_available: row.finalize_attempt_rpc_available,
    lifecycle_rpcs_public_executable: row.lifecycle_rpcs_public_executable,
    lifecycle_rpcs_anon_executable: row.lifecycle_rpcs_anon_executable,
    lifecycle_rpcs_authenticated_executable: row.lifecycle_rpcs_authenticated_executable,
    lifecycle_rpcs_service_role_executable: row.lifecycle_rpcs_service_role_executable,
    audit_canary_entry_kind_constrained: row.audit_canary_entry_kind_constrained,
    audit_no_effect_constraint_available: row.audit_no_effect_constraint_available,
    ledger_canary_entry_kind_constrained: row.ledger_canary_entry_kind_constrained,
    ledger_zero_reserve_constraint_available: row.ledger_zero_reserve_constraint_available,
    claim_status_constraint_available: row.claim_status_constraint_available,
  };
}

function failureCategory(code: string | undefined) {
  if (code === "PGRST202" || code === "42883" || code === "42P01") return "schema_unavailable" as const;
  if (code === "42501" || code === "PGRST301" || code === "401" || code === "403") return "auth_failure" as const;
  return "unknown" as const;
}

export async function readContinuousIntelligenceShadowCanarySchemaReadiness(): Promise<ContinuousIntelligenceShadowCanarySchemaFacts> {
  const supabase = getServerSupabaseClient();
  if (!supabase.client) {
    return unavailable(
      supabase.unavailable_reason === "supabase_service_role_missing"
        ? "auth_failure"
        : "unknown",
    );
  }
  try {
    const { data, error } = await supabase.client.rpc(
      continuousIntelligenceShadowCanaryReadinessProbeRpcName,
    );
    if (error) return unavailable(failureCategory(error.code));
    const parsed = parseProbeRow(Array.isArray(data) ? data[0] : data);
    return parsed ?? unavailable("unknown");
  } catch {
    return unavailable("unknown");
  }
}
