import { NextResponse } from "next/server";

import {
  evaluateObservationSeriesActivationDatabasePreflight,
  observationSeriesActivationBuildIdentityFromUnknown,
} from "@/lib/observation-series-activation-preflight";
import {
  buildScannerProviderCreditAllocationActivationManifest,
  scannerProviderCreditAllocationActivationEnvironmentFrom,
  scannerProviderCreditAllocationExpectedObservationSeriesControl,
} from "@/lib/scanner-provider-credit-allocation-activation";
import {
  applicationSessionUnauthorizedResponse,
  requireApplicationSession,
} from "@/lib/server/application-session";
import { readObservationSeriesActivationPreflight } from "@/lib/server/observation-series-activation-preflight-readback";
import packagedDeploymentIdentity from "@/lib/generated/scheduled-scan-deployment-identity.json";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await requireApplicationSession();
  if (!session) return applicationSessionUnauthorizedResponse();

  const control =
    scannerProviderCreditAllocationExpectedObservationSeriesControl();
  const readback = await readObservationSeriesActivationPreflight({
    owner_user_id: session.owner_user_id,
    control,
  });
  const databasePreflight =
    evaluateObservationSeriesActivationDatabasePreflight(readback);
  const environment = {
    get: (name: string) => process.env[name],
  };
  const manifest = buildScannerProviderCreditAllocationActivationManifest({
    database_preflight: databasePreflight,
    environment:
      scannerProviderCreditAllocationActivationEnvironmentFrom(environment),
    build_identity: observationSeriesActivationBuildIdentityFromUnknown(
      packagedDeploymentIdentity,
    ),
    now: new Date(),
  });

  return NextResponse.json(manifest, {
    status: manifest.status === "unavailable" ? 503 : 200,
    headers: { "Cache-Control": "no-store" },
  });
}
