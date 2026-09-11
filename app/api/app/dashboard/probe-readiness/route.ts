import { NextResponse } from "next/server";

import { applicationCanonicalStagingOrigin } from "@/lib/application-platform-contract";
import {
  applicationSessionUnauthorizedResponse,
  requireApplicationSession,
} from "@/lib/server/application-session";

const mvp01cStagingSiteId = "24f7026e-5529-4432-b640-6390c16d4671" as const;
const mvp01cDashboardFailureProbeEnvironmentVariable =
  "MVP_01C_STAGING_DASHBOARD_FAILURE_PROBE" as const;

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const session = await requireApplicationSession();
  if (!session) return applicationSessionUnauthorizedResponse();

  const stagingSite = process.env.SITE_ID === mvp01cStagingSiteId;
  const canonicalOrigin = new URL(request.url).origin === applicationCanonicalStagingOrigin;
  if (!stagingSite || !canonicalOrigin) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const probeFlagEnabled =
    process.env.MVP_01C_STAGING_DASHBOARD_FAILURE_PROBE === "enabled";

  return NextResponse.json(
    {
      contract_version: "mvp_01c_staging_probe_readiness_v1",
      staging_site: true,
      canonical_origin: true,
      probe_flag_enabled: probeFlagEnabled,
      values_returned: false,
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
