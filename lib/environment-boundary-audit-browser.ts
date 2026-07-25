import type { EnvironmentBoundaryAuditSummary } from "@/lib/environment-boundary-audit";

const expectedProductionUrl = "https://trade.valentinlabs.com" as const;
const expectedProductionSupabaseRef = "ekdyopdrrkphlrsilyoo" as const;
const knownStagingSupabaseRef = "pdvzyuhykomwfqyyztru" as const;
const firstTinyFetchRouteExpectedMarker =
  "action_276_api_auth_middleware_boundary_audit" as const;

export function buildBrowserEnvironmentBoundaryAudit(): EnvironmentBoundaryAuditSummary {
  return {
    advisory_only: true,
    environment_audit_only: true,
    app_runtime: {
      node_env: null,
      vercel_env: null,
      netlify_context: null,
      deploy_url_present: false,
      site_url_present: false,
      production_url_expected: expectedProductionUrl,
    },
    supabase_refs: {
      public_supabase_url_present: false,
      public_supabase_project_ref: null,
      expected_production_ref: expectedProductionSupabaseRef,
      known_staging_ref: knownStagingSupabaseRef,
      points_to_production: "unknown",
      points_to_staging: "unknown",
    },
    secrets_presence: {
      automation_secret_present: false,
      automation_secret_length: null,
      twelve_data_api_key_present: false,
      twelve_data_api_key_length: null,
      supabase_service_role_present: false,
      supabase_service_role_length: null,
    },
    route_versions: {
      app_build_marker: null,
      first_tiny_fetch_route_expected_marker: firstTinyFetchRouteExpectedMarker,
      diagnostics_route_marker_present: "unknown",
    },
    safety: {
      no_secret_values_returned: true,
      no_secret_hashes_returned: true,
      provider_fetch_added: false,
      provider_call_executed: false,
      candles_persisted: false,
      fetch_run_persisted: false,
      replay_executed: false,
      scanner_behavior_changed: false,
    },
    blockers: [],
    warnings: ["server_environment_audit_not_observed_in_browser"],
    recommended_next_steps: [
      "Use the authenticated server diagnostics route for environment evidence.",
    ],
  };
}
