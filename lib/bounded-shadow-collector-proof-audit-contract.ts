export const boundedShadowCollectorProofAuditContractVersion =
  "bounded_shadow_collector_proof_audit_v1" as const;
export const boundedShadowCollectorProofAuditTableName =
  "bounded_shadow_collector_proof_audits" as const;
export const boundedShadowCollectorProofAuditFlagName =
  "TURE_BOUNDED_PROOF_DURABLE_AUDIT_ENABLED" as const;

export type BoundedShadowCollectorProofAuditDiagnostics = {
  contract_version: typeof boundedShadowCollectorProofAuditContractVersion;
  table_name: typeof boundedShadowCollectorProofAuditTableName;
  migration_expected: true;
  persistence_feature_flag: typeof boundedShadowCollectorProofAuditFlagName;
  feature_flag_state_client_side: "unknown";
  status: "not_observed";
  latest_durable_audit: null;
  browser_route_invocation: false;
  durable_readback_route_present: true;
  import_route_present: true;
  provider_call_inferred_by_client: false;
  token_present_in_diagnostics: false;
  candle_payload_persisted: false;
};

export function buildBoundedShadowCollectorProofAuditDiagnostics(): BoundedShadowCollectorProofAuditDiagnostics {
  return {
    contract_version: boundedShadowCollectorProofAuditContractVersion,
    table_name: boundedShadowCollectorProofAuditTableName,
    migration_expected: true,
    persistence_feature_flag: boundedShadowCollectorProofAuditFlagName,
    feature_flag_state_client_side: "unknown",
    status: "not_observed",
    latest_durable_audit: null,
    browser_route_invocation: false,
    durable_readback_route_present: true,
    import_route_present: true,
    provider_call_inferred_by_client: false,
    token_present_in_diagnostics: false,
    candle_payload_persisted: false,
  };
}
