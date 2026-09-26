import { NextResponse } from "next/server";

import {
  buildObservationSeriesActivationManifest,
  evaluateObservationSeriesActivationDatabasePreflight,
  observationSeriesActivationBuildIdentityFromUnknown,
  observationSeriesActivationEnvironmentFrom,
} from "@/lib/observation-series-activation-preflight";
import { observationSeriesControlFromEnvironment } from "@/lib/observation-series-control";
import {
  applicationSessionUnauthorizedResponse,
  requireApplicationSession,
} from "@/lib/server/application-session";
import { readObservationSeriesActivationPreflight } from "@/lib/server/observation-series-activation-preflight-readback";
import packagedDeploymentIdentity from "@/lib/generated/scheduled-scan-deployment-identity.json";

export const dynamic = "force-dynamic";

function requestedControl(request: Request) {
  const query = new URL(request.url).searchParams;
  const values = new Map<string, string>([
    ["TURE_OBSERVATION_SERIES_ENABLED", "true"],
    ["TURE_OBSERVATION_SERIES_DATE", query.get("trading_date") ?? ""],
    [
      "TURE_OBSERVATION_SERIES_START_SLOT_UTC",
      query.get("starts_at_utc") ?? "",
    ],
    [
      "TURE_OBSERVATION_SERIES_EXPIRES_AT_UTC",
      query.get("expires_at_utc") ?? "",
    ],
    ["TURE_OBSERVATION_SERIES_MAX_ATTEMPTS", query.get("max_attempts") ?? ""],
    [
      "TURE_OBSERVATION_SERIES_MAX_PROVIDER_CREDITS",
      query.get("max_provider_credits") ?? "",
    ],
  ]);
  return observationSeriesControlFromEnvironment({
    get: (name) => values.get(name),
  });
}

export async function GET(request: Request) {
  const session = await requireApplicationSession();
  if (!session) return applicationSessionUnauthorizedResponse();

  const control = requestedControl(request);
  if (control.status !== "ready") {
    return NextResponse.json(
      {
        status: "invalid_request",
        reason_codes: control.reason_codes,
        authority: {
          mutates_configuration: false,
          arms_scheduler: false,
          calls_provider: false,
          reserves_provider_credits: false,
          publishes_candidate: false,
          executes_broker_order: false,
        },
      },
      { status: 400, headers: { "Cache-Control": "no-store" } },
    );
  }

  const readback = await readObservationSeriesActivationPreflight({
    owner_user_id: session.owner_user_id,
    control,
  });
  const databasePreflight =
    evaluateObservationSeriesActivationDatabasePreflight(readback);
  const runtimeEnvironment = {
    get: (name: string) => process.env[name],
  };
  const manifest = buildObservationSeriesActivationManifest({
    control,
    database_preflight: databasePreflight,
    environment:
      observationSeriesActivationEnvironmentFrom(runtimeEnvironment),
    build_identity:
      observationSeriesActivationBuildIdentityFromUnknown(
        packagedDeploymentIdentity,
      ),
    now: new Date(),
  });

  return NextResponse.json(manifest, {
    status: manifest.status === "unavailable" ? 503 : 200,
    headers: { "Cache-Control": "no-store" },
  });
}
