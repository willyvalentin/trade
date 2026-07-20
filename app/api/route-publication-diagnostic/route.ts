import { NextResponse } from "next/server";

import { hb307cCanaryRouteBuildMarker } from "@/app/api/hb307c/ping/route";
import { firstTinyReplayWithSignalPackageDryRunExecuteBuildMarker } from "@/lib/first-tiny-historical-replay-with-signal-package-dry-run-execute";
import { firstTinyHistoricalReplaySignalPackageDiscoveryReadbackMarker } from "@/lib/first-tiny-historical-replay-signal-package-discovery-readback";

export const dynamic = "force-dynamic";

const routePublicationDiagnosticBuildMarker =
  "action_307c_route_publication_diagnostic";

const noStoreHeaders = {
  "Cache-Control": "no-store",
};

const noEffectResponse = {
  provider_call_executed: false,
  provider_call_attempted: false,
  candles_persisted: false,
  raw_response_persisted: false,
  fetch_run_persisted: false,
  synthetic_outcomes_persisted: false,
  replay_executed: false,
  scanner_behavior_changed: false,
  live_ranking_changed: false,
  recommendation_rows_mutated: false,
  supabase_write_executed: false,
} as const;

function textOrNull(value: string | undefined) {
  const text = value?.trim() ?? "";
  return text.length > 0 ? text : null;
}

function deploymentTimestamp() {
  return (
    textOrNull(process.env.BUILD_TIMESTAMP) ??
    textOrNull(process.env.NEXT_PUBLIC_BUILD_TIMESTAMP) ??
    textOrNull(process.env.NETLIFY_BUILD_TIMESTAMP) ??
    textOrNull(process.env.DEPLOY_TIMESTAMP) ??
    null
  );
}

export async function GET() {
  return NextResponse.json(
    {
      ok: true,
      route_publication_diagnostic: true,
      route_build_marker: routePublicationDiagnosticBuildMarker,
      purpose: "production_route_publication_boundary_diagnostic",
      deployment_timestamp: deploymentTimestamp(),
      route_groups: [
        {
          action: "action_303_discovery_readback_route",
          build_marker:
            firstTinyHistoricalReplaySignalPackageDiscoveryReadbackMarker,
          expected_paths: [
            "/api/historical-backfill/first-tiny-signal-package-discovery-readback",
            "/api/historical-backfill/first-tiny-signal-package-discovery-readback/ping",
          ],
        },
        {
          action: "action_307_original_route",
          build_marker:
            firstTinyReplayWithSignalPackageDryRunExecuteBuildMarker,
          expected_paths: [
            "/api/historical-backfill/first-tiny-replay-with-signal-package-dry-run",
            "/api/historical-backfill/first-tiny-replay-with-signal-package-dry-run/ping",
          ],
        },
        {
          action: "action_307_alias_route",
          build_marker:
            firstTinyReplayWithSignalPackageDryRunExecuteBuildMarker,
          expected_paths: [
            "/api/historical-backfill/first-tiny-signal-replay-dry-run",
            "/api/historical-backfill/first-tiny-signal-replay-dry-run/ping",
          ],
        },
        {
          action: "action_307c_hb307c_canary_route",
          build_marker: hb307cCanaryRouteBuildMarker,
          expected_paths: ["/api/hb307c", "/api/hb307c/ping"],
        },
      ],
      ...noEffectResponse,
    },
    { headers: noStoreHeaders },
  );
}
