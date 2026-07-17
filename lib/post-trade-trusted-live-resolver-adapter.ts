import "server-only";

import {
  TRUSTED_LIVE_RESOLVER_ADAPTER_IDENTITY,
  buildTrustedLiveResolverFixtureAdapter,
  buildTrustedLiveResolverFuturePlan,
  validateTrustedResolverIdentity,
  type TrustedLiveResolverFixtureAdapter,
  type ValidationResult,
} from "@/lib/post-trade-trusted-live-resolver-adapter-core";

export const TRUSTED_LIVE_RESOLVER_ADAPTER_SERVER_BOUNDARY_ID =
  "post_trade_trusted_live_resolver_adapter_server_fixture_boundary_v1" as const;

export type TrustedLiveResolverAdapterServerBoundary = Readonly<{
  boundaryId: typeof TRUSTED_LIVE_RESOLVER_ADAPTER_SERVER_BOUNDARY_ID;
  serverOnly: true;
  fixtureOnly: true;
  observedLive: false;
  authoritativeLive: false;
  defaultLiveResolverPresent: false;
  ambientAuthorityPresent: false;
  exposesPathLookup: false;
  exposesFilesystemReader: false;
  exposesExecutableLookup: false;
  exposesRepositoryDiscovery: false;
  canReadEnvironment: false;
  canInspectPath: false;
  canInspectFilesystem: false;
  canResolveSymlink: false;
  canSpawnProcess: false;
  canRunGit: false;
  canRunSupabase: false;
  enablesProcessStart: false;
  enablesPreflightRunner: false;
  futurePlan: ReturnType<typeof buildTrustedLiveResolverFuturePlan>;
}>;

export function buildTrustedLiveResolverAdapterServerBoundary(): TrustedLiveResolverAdapterServerBoundary {
  return {
    boundaryId: TRUSTED_LIVE_RESOLVER_ADAPTER_SERVER_BOUNDARY_ID,
    serverOnly: true,
    fixtureOnly: true,
    observedLive: false,
    authoritativeLive: false,
    defaultLiveResolverPresent: false,
    ambientAuthorityPresent: false,
    exposesPathLookup: false,
    exposesFilesystemReader: false,
    exposesExecutableLookup: false,
    exposesRepositoryDiscovery: false,
    canReadEnvironment: false,
    canInspectPath: false,
    canInspectFilesystem: false,
    canResolveSymlink: false,
    canSpawnProcess: false,
    canRunGit: false,
    canRunSupabase: false,
    enablesProcessStart: false,
    enablesPreflightRunner: false,
    futurePlan: buildTrustedLiveResolverFuturePlan(),
  } as const;
}

export function createTrustedLiveResolverFixtureBoundary(): Readonly<{
  boundary: TrustedLiveResolverAdapterServerBoundary;
  adapter: TrustedLiveResolverFixtureAdapter;
  identityValidation: ValidationResult<typeof TRUSTED_LIVE_RESOLVER_ADAPTER_IDENTITY>;
  liveResolutionEnabled: false;
}> {
  const adapter = buildTrustedLiveResolverFixtureAdapter();
  return {
    boundary: buildTrustedLiveResolverAdapterServerBoundary(),
    adapter,
    identityValidation: validateTrustedResolverIdentity(adapter.identity),
    liveResolutionEnabled: false,
  } as const;
}
