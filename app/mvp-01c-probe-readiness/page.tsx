import { headers } from "next/headers";
import { notFound } from "next/navigation";

import { applicationCanonicalStagingOrigin } from "@/lib/application-platform-contract";
import { requireApplicationPageSession } from "@/lib/server/application-session";

const stagingSiteId = "24f7026e-5529-4432-b640-6390c16d4671";

export const dynamic = "force-dynamic";

function isCanonicalStagingHost(requestHeaders: Headers) {
  const host = (
    requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? ""
  )
    .split(",")[0]
    .trim()
    .toLowerCase();

  return host === new URL(applicationCanonicalStagingOrigin).host;
}

// Temporary, values-free route-level diagnostic for MVP-01c. It is intentionally
// available only to the authenticated canonical staging runtime and is removed
// immediately after the environment check.
export default async function Mvp01cProbeReadinessPage() {
  await requireApplicationPageSession();

  const requestHeaders = await headers();
  const stagingSite = process.env.SITE_ID === stagingSiteId;

  if (!stagingSite || !isCanonicalStagingHost(requestHeaders)) {
    notFound();
  }

  const probeFlagEnabled =
    process.env.MVP_01C_STAGING_DASHBOARD_FAILURE_PROBE === "enabled";

  return (
    <main className="mx-auto w-full max-w-xl px-4 py-12 sm:px-6">
      <h1 className="text-xl font-semibold">MVP-01c staging probe readiness</h1>
      <p className="mt-3 text-sm text-muted-foreground">
        This temporary diagnostic returns readiness booleans only. It does not
        read application, provider, broker, or secret values.
      </p>
      <dl className="mt-6 grid grid-cols-[1fr_auto] gap-x-6 gap-y-3 text-sm">
        <dt>staging_site</dt>
        <dd>{stagingSite ? "true" : "false"}</dd>
        <dt>canonical_origin</dt>
        <dd>true</dd>
        <dt>probe_flag_enabled</dt>
        <dd>{probeFlagEnabled ? "true" : "false"}</dd>
        <dt>values_returned</dt>
        <dd>false</dd>
      </dl>
    </main>
  );
}
