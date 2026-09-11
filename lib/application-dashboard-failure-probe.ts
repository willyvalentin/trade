import { applicationCanonicalStagingOrigin } from "@/lib/application-platform-contract";

export const mvp01cDashboardFailureProbeQueryParameter =
  "mvp01c_dashboard_failure" as const;
export const mvp01cDashboardFailureProbeQueryValue = "first_read" as const;

const applicationDashboardPath = "/api/app/dashboard" as const;
// This is the private `ture-staging` site. The temporary probe cannot activate
// in production, a preview, or any other site even if its query is copied.
const mvp01cDedicatedStagingSiteId =
  "24f7026e-5529-4432-b640-6390c16d4671" as const;

type Environment = Record<string, string | undefined>;

export function applicationDashboardReadPath(input: Readonly<{
  origin: string;
  search: string;
}>) {
  if (input.origin !== applicationCanonicalStagingOrigin) {
    return applicationDashboardPath;
  }

  const search = new URLSearchParams(input.search);
  if (
    search.get(mvp01cDashboardFailureProbeQueryParameter) !==
    mvp01cDashboardFailureProbeQueryValue
  ) {
    return applicationDashboardPath;
  }

  return `${applicationDashboardPath}?${mvp01cDashboardFailureProbeQueryParameter}=${mvp01cDashboardFailureProbeQueryValue}`;
}

export function isMvp01cStagingDashboardFailureProbe(
  request: Request,
  environment: Environment,
) {
  if (environment.SITE_ID !== mvp01cDedicatedStagingSiteId) {
    return false;
  }

  const requestUrl = new URL(request.url);
  return (
    requestUrl.origin === applicationCanonicalStagingOrigin &&
    requestUrl.searchParams.get(mvp01cDashboardFailureProbeQueryParameter) ===
      mvp01cDashboardFailureProbeQueryValue
  );
}
