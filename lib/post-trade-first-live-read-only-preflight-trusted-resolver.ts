import "server-only";

import {
  buildTrustedResolverInertPlan,
  validateFixtureAdapterShape,
  type TrustedResolverFixtureAdapter,
  type ValidationResult,
} from "@/lib/post-trade-first-live-read-only-preflight-trusted-resolver-core";

export const POST_TRADE_TRUSTED_RESOLVER_BOUNDARY_ID =
  "post_trade_first_live_read_only_preflight_trusted_resolver_server_boundary_v1" as const;

export type TrustedResolverBoundary = {
  boundaryId: typeof POST_TRADE_TRUSTED_RESOLVER_BOUNDARY_ID;
  serverOnly: true;
  defaultLiveResolverPresent: false;
  fixtureAdaptersOnly: true;
  callsAdapterOnImport: false;
  callsAdapterOnConstruction: false;
  exposesArbitraryPathInterface: false;
  exposesFilesystemObjectPublicly: false;
  canResolveLiveExecutable: false;
  canInspectPath: false;
  canInspectFilesystem: false;
  canReadEnvironment: false;
  canAccessCredential: false;
  canSpawnProcess: false;
  inertPlan: ReturnType<typeof buildTrustedResolverInertPlan>;
};

export function buildTrustedResolverBoundary(): TrustedResolverBoundary {
  return {
    boundaryId: POST_TRADE_TRUSTED_RESOLVER_BOUNDARY_ID,
    serverOnly: true,
    defaultLiveResolverPresent: false,
    fixtureAdaptersOnly: true,
    callsAdapterOnImport: false,
    callsAdapterOnConstruction: false,
    exposesArbitraryPathInterface: false,
    exposesFilesystemObjectPublicly: false,
    canResolveLiveExecutable: false,
    canInspectPath: false,
    canInspectFilesystem: false,
    canReadEnvironment: false,
    canAccessCredential: false,
    canSpawnProcess: false,
    inertPlan: buildTrustedResolverInertPlan(),
  };
}

export function validateTrustedResolverFixtureAdapter(adapter: unknown): ValidationResult {
  return validateFixtureAdapterShape(adapter);
}

export function createFixtureOnlyTrustedResolverBoundary(adapter: TrustedResolverFixtureAdapter) {
  const validation = validateTrustedResolverFixtureAdapter(adapter);
  if (!validation.valid) {
    return {
      ready: false,
      boundary: buildTrustedResolverBoundary(),
      validation,
      adapterAccepted: false,
      liveResolutionEnabled: false,
    } as const;
  }

  return {
    ready: true,
    boundary: buildTrustedResolverBoundary(),
    validation,
    adapterAccepted: true,
    liveResolutionEnabled: false,
    collectExecutableCandidateFixtureObservations: adapter.collectExecutableCandidateFixtureObservations,
    collectRepositoryFixtureObservation: adapter.collectRepositoryFixtureObservation,
    collectFixtureRevalidationObservation: adapter.collectFixtureRevalidationObservation,
    disposeFixtureTransientMetadata: adapter.disposeFixtureTransientMetadata,
  } as const;
}
