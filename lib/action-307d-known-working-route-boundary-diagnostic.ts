export const action307dKnownWorkingRouteBoundaryDiagnosticMarker =
  "action_307d_known_working_route_boundary_injection";

export const action307dKnownWorkingRouteBoundaryDiagnostic = {
  route_boundary_diagnostic_marker:
    action307dKnownWorkingRouteBoundaryDiagnosticMarker,
  deployed_after_307c: true,
  diagnostic_purpose: "known_working_route_deploy_and_boundary_check",
} as const;

export const action307dEmbeddedRoutePublicationDiagnostic = {
  marker: "action_307d_embedded_route_publication_diagnostic",
  action_307_original_expected_paths: [
    "/api/historical-backfill/first-tiny-replay-with-signal-package-dry-run",
    "/api/historical-backfill/first-tiny-replay-with-signal-package-dry-run/ping",
  ],
  action_307_alias_expected_paths: [
    "/api/historical-backfill/first-tiny-signal-replay-dry-run",
    "/api/historical-backfill/first-tiny-signal-replay-dry-run/ping",
  ],
  action_307c_canary_expected_paths: [
    "/api/hb307c",
    "/api/hb307c/ping",
    "/api/route-publication-diagnostic",
  ],
  interpretation: {
    if_this_marker_appears_and_new_routes_400:
      "latest_deploy_reached_existing_routes_but_new_route_publication_or_proxy_path_matching_is_failing",
    if_this_marker_missing: "stale_deploy_or_existing_route_not_updated",
    if_existing_route_400: "broader_api_boundary_regression",
  },
} as const;
