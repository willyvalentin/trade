import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  FIRST_LIVE_READ_ONLY_STAGING_PREFLIGHT_COMPOSITION_EVIDENCE_ORDER,
  FIRST_LIVE_READ_ONLY_STAGING_PREFLIGHT_COMPOSITION_IDENTITY,
  FIRST_LIVE_READ_ONLY_STAGING_PREFLIGHT_COMPOSITION_POLICY,
  buildAuthorizationLifecycleEvidence,
  buildCanonicalCompositionEvidenceSet,
  buildCliVersionEvidenceExpectation,
  buildDirectSpawnPlanEvidence,
  buildImmediatePreSpawnRevalidationRequirementEvidence,
  buildNoCredentialEvidence,
  buildResolverEvidenceLink,
  buildScopedObserverPlanEvidence,
  composeFirstLiveReadOnlyStagingPreflight,
  transitionFirstLiveReadOnlyStagingPreflightState,
  validateCompositionEvidenceSet,
  type CompositionEvidence,
  type CompositionEvidenceSet,
  type ResolverEvidenceLink,
} from "../../lib/post-trade-first-live-read-only-staging-preflight-composition-contract-core";
import { FIRST_LIVE_TRUSTED_RESOLVER_ADAPTER_IDENTITY } from "../../lib/post-trade-first-live-trusted-resolver-adapter-core";
import { CREDENTIAL_SOURCE_ADAPTER_BOUNDARY_IDENTITY } from "../../lib/post-trade-credential-source-adapter-boundary-core";
import { DIRECT_SPAWN_DRIVER_BOUNDARY_IDENTITY } from "../../lib/post-trade-direct-spawn-driver-boundary-core";
import { SCOPED_MACOS_PROCESS_OBSERVER_IDENTITY } from "../../lib/post-trade-scoped-macos-process-observer-core";

const repoRoot = process.cwd();
const contractPath = "lib/post-trade-first-live-read-only-staging-preflight-composition-contract-core.ts";
const liveResolverPath = "lib/post-trade-first-live-trusted-resolver-adapter.ts";
const apiPath = "app/api/post-trade/payload/validate/route.ts";
const tradeUiPath = "app/trade-app.tsx";

function source(path: string) {
  return readFileSync(join(repoRoot, path), "utf8");
}

function withEvidence(evidence: CompositionEvidenceSet["evidence"]): CompositionEvidenceSet {
  return { ...buildCanonicalCompositionEvidenceSet(), evidence } as CompositionEvidenceSet;
}

function replaceEvidence(index: number, replacement: unknown): CompositionEvidenceSet {
  const evidenceSet = buildCanonicalCompositionEvidenceSet();
  return withEvidence([
    ...evidenceSet.evidence.slice(0, index),
    replacement as CompositionEvidence,
    ...evidenceSet.evidence.slice(index + 1),
  ]);
}

test.describe("first-live read-only staging preflight composition contract Action 537", () => {
  test("identity and policy are frozen versioned distinct and exact", () => {
    expect(FIRST_LIVE_READ_ONLY_STAGING_PREFLIGHT_COMPOSITION_IDENTITY).toMatchObject({
      compositionId: "ture.execution.first-live-read-only-staging-preflight-composition.fixture.v1",
      implementationMode: "fixture_only_pure_contract",
      purpose: "first_live_read_only_staging_preflight",
      liveResolverInvoked: false,
      processSpawned: false,
      enablesExecution: false,
    });
    expect(FIRST_LIVE_READ_ONLY_STAGING_PREFLIGHT_COMPOSITION_IDENTITY.compositionId).not.toBe(FIRST_LIVE_TRUSTED_RESOLVER_ADAPTER_IDENTITY.resolverId);
    expect(FIRST_LIVE_READ_ONLY_STAGING_PREFLIGHT_COMPOSITION_IDENTITY.compositionId).not.toBe(DIRECT_SPAWN_DRIVER_BOUNDARY_IDENTITY.driverId);
    expect(FIRST_LIVE_READ_ONLY_STAGING_PREFLIGHT_COMPOSITION_IDENTITY.compositionId).not.toBe(SCOPED_MACOS_PROCESS_OBSERVER_IDENTITY.observerId);
    expect(FIRST_LIVE_READ_ONLY_STAGING_PREFLIGHT_COMPOSITION_IDENTITY.compositionId).not.toBe(CREDENTIAL_SOURCE_ADAPTER_BOUNDARY_IDENTITY.adapterId);
    expect(FIRST_LIVE_READ_ONLY_STAGING_PREFLIGHT_COMPOSITION_POLICY.supportedToolIdentities).toEqual(["git", "supabase_cli"]);
    expect(FIRST_LIVE_READ_ONLY_STAGING_PREFLIGHT_COMPOSITION_POLICY.supportedOperations).toEqual(["collect_git_version", "collect_supabase_cli_version"]);
    expect(FIRST_LIVE_READ_ONLY_STAGING_PREFLIGHT_COMPOSITION_POLICY.compositionMayExecute).toBe(false);
    expect(Object.isFrozen(FIRST_LIVE_READ_ONLY_STAGING_PREFLIGHT_COMPOSITION_IDENTITY)).toBe(true);
    expect(Object.isFrozen(FIRST_LIVE_READ_ONLY_STAGING_PREFLIGHT_COMPOSITION_POLICY.evidenceOrder)).toBe(true);
  });

  test("valid fixture evidence composes deterministically without authority", () => {
    const evidenceSet = buildCanonicalCompositionEvidenceSet("git");
    const result = composeFirstLiveReadOnlyStagingPreflight({ evidenceSet });
    const repeated = composeFirstLiveReadOnlyStagingPreflight({ evidenceSet });

    expect(result.state).toBe("composition_complete");
    expect(result.compositionComplete).toBe(true);
    expect(result.evidenceSet?.canonicalOrder).toEqual(FIRST_LIVE_READ_ONLY_STAGING_PREFLIGHT_COMPOSITION_EVIDENCE_ORDER);
    expect(result.resultFingerprint).toBe(repeated.resultFingerprint);
    expect(result).toMatchObject({
      fixtureOnly: true,
      executionAuthority: "none",
      filesystemAuthority: "none",
      spawnAuthority: "none",
      observerAuthority: "none",
      credentialAuthority: "none",
      networkAuthority: "none",
      runnerAuthority: "none",
      apiAuthority: "none",
      uiAuthority: "none",
      tradingAuthority: "none",
      avanzaAuthority: "none",
      deploymentAuthority: "none",
      liveResolverInvoked: false,
      filesystemOperationPerformed: false,
      cliVersionCollected: false,
      processSpawned: false,
      shellUsed: false,
      credentialAccessed: false,
      networkAccessed: false,
      retryAllowed: false,
      toctouEliminated: false,
    });
    expect(Object.isFrozen(result)).toBe(true);
    expect(Object.isFrozen(result.evidenceSet?.evidence[0])).toBe(true);
  });

  test("resolver linkage requires immediate pre-spawn revalidation and rejects stale metadata", () => {
    const resolver = buildResolverEvidenceLink({ toolIdentity: "supabase_cli" });
    const revalidation = buildImmediatePreSpawnRevalidationRequirementEvidence(resolver);
    expect(revalidation.revalidationRequiredBeforeSpawn).toBe(true);
    expect(revalidation.revalidationOperationImplemented).toBe(false);
    expect(revalidation.toctouEliminated).toBe(false);

    const staleRevalidation = buildImmediatePreSpawnRevalidationRequirementEvidence(resolver, {
      expectedMetadata: { ...resolver.metadata, mode: 0o100700 },
    });
    const staleSet = withEvidence([
      resolver,
      staleRevalidation,
      buildDirectSpawnPlanEvidence({ toolIdentity: "supabase_cli" }),
      buildScopedObserverPlanEvidence({ toolIdentity: "supabase_cli" }),
      buildNoCredentialEvidence({ toolIdentity: "supabase_cli" }),
      buildCliVersionEvidenceExpectation({ toolIdentity: "supabase_cli" }),
      buildAuthorizationLifecycleEvidence({ toolIdentity: "supabase_cli" }),
    ]);
    expect(validateCompositionEvidenceSet(staleSet)).toContain("stale_resolver_evidence");

    const skipped = withEvidence([
      resolver,
      buildDirectSpawnPlanEvidence({ toolIdentity: "supabase_cli" }),
      buildScopedObserverPlanEvidence({ toolIdentity: "supabase_cli" }),
      buildNoCredentialEvidence({ toolIdentity: "supabase_cli" }),
      buildCliVersionEvidenceExpectation({ toolIdentity: "supabase_cli" }),
      buildAuthorizationLifecycleEvidence({ toolIdentity: "supabase_cli" }),
    ] as unknown as CompositionEvidenceSet["evidence"]);
    expect(validateCompositionEvidenceSet(skipped)).toEqual(expect.arrayContaining(["missing_evidence", "evidence_order_invalid"]));
  });

  test("malformed cloned mutated wrong-session expired and cross-boundary evidence fail closed", () => {
    const evidenceSet = buildCanonicalCompositionEvidenceSet();
    expect(validateCompositionEvidenceSet({})).toContain("missing_evidence");

    const clonedResolver = { ...evidenceSet.evidence[0] };
    expect(validateCompositionEvidenceSet(withEvidence([clonedResolver, ...evidenceSet.evidence.slice(1)] as CompositionEvidenceSet["evidence"]))).toContain("provenance_mismatch");

    const mutatedResolver = { ...evidenceSet.evidence[0], evidenceFingerprint: "0".repeat(64) };
    expect(validateCompositionEvidenceSet(withEvidence([mutatedResolver, ...evidenceSet.evidence.slice(1)] as CompositionEvidenceSet["evidence"]))).toContain("fingerprint_mismatch");

    const wrongSession = buildResolverEvidenceLink({ boundarySessionId: "other_session" as never });
    expect(validateCompositionEvidenceSet(withEvidence([wrongSession, ...evidenceSet.evidence.slice(1)] as CompositionEvidenceSet["evidence"]))).toContain("wrong_session");

    const expired = buildResolverEvidenceLink({ expiresAt: "2026-07-17T10:49:00.000Z" as never });
    expect(validateCompositionEvidenceSet(withEvidence([expired, ...evidenceSet.evidence.slice(1)] as CompositionEvidenceSet["evidence"]))).toContain("expired_evidence");

    const crossBoundary = { ...buildNoCredentialEvidence(), evidenceKind: "trusted_resolver_evidence_link" };
    expect(validateCompositionEvidenceSet(withEvidence([crossBoundary, ...evidenceSet.evidence.slice(1)] as CompositionEvidenceSet["evidence"]))).toContain("provenance_mismatch");
  });

  test("authority claims are rejected at evidence level without normalization", () => {
    for (const flag of ["enablesFilesystemAuthority", "enablesObserverAuthority", "enablesNetworkAccess"] as const) {
      const evidence = buildResolverEvidenceLink({ [flag]: true } as never);
      expect(evidence[flag]).toBe(true);
      expect(validateCompositionEvidenceSet(replaceEvidence(0, evidence)), flag).toContain("authority_claim_rejected");
    }

    for (const flag of [
      "enablesSpawnAuthority",
      "enablesRunnerAuthority",
      "enablesCredentialAuthority",
      "enablesExecutionAuthority",
      "enablesCliExecution",
      "enablesAuthorizationConsumption",
      "enablesApiAccess",
      "enablesUiAccess",
      "enablesTradingAuthority",
      "enablesAvanzaAuthority",
      "enablesOrderMutation",
      "enablesPositionMutation",
      "enablesSettlementAuthority",
      "enablesPersistence",
      "enablesDeployment",
    ]) {
      const evidence = { ...buildResolverEvidenceLink(), [flag]: true };
      expect(validateCompositionEvidenceSet(replaceEvidence(0, evidence)), flag).toContain("authority_claim_rejected");
    }
  });

  test("nested resolver metadata authority and unknown shapes fail closed", () => {
    const resolver = buildCanonicalCompositionEvidenceSet().evidence[0] as ResolverEvidenceLink;
    const validMetadata = resolver.metadata;

    for (const metadata of [
      { ...validMetadata, enablesFilesystemAuthority: true },
      { ...validMetadata, nested: { enablesObserverAuthority: true } },
      { ...validMetadata, authority: { filesystemAuthority: "future_live" } },
      { ...validMetadata, permissions: { network: true } },
      { ...validMetadata, grants: { capabilities: { enablesNetworkAccess: true } } },
      { ...validMetadata, capabilities: {} },
      { ...validMetadata, access: "filesystem" },
      { ...validMetadata, privileges: [] },
    ]) {
      expect(() => buildResolverEvidenceLink({ metadata } as never), JSON.stringify(metadata)).toThrow("resolver_metadata_schema_rejected");
      expect(validateCompositionEvidenceSet(replaceEvidence(0, { ...resolver, metadata })), JSON.stringify(metadata)).toContain("resolver_metadata_schema_rejected");
    }
  });

  test("resolver metadata schema rejects unknown keys prototypes accessors symbols and malformed values", () => {
    const resolver = buildCanonicalCompositionEvidenceSet().evidence[0] as ResolverEvidenceLink;
    const validMetadata = resolver.metadata;
    const withSymbol = { ...validMetadata } as Record<PropertyKey, unknown>;
    withSymbol[Symbol("authority")] = true;
    const withAccessor = { ...validMetadata } as Record<string, unknown>;
    Object.defineProperty(withAccessor, "extra", { enumerable: true, get: () => true });
    const inherited = Object.create({ inheritedUnknown: true }) as Record<string, unknown>;
    Object.assign(inherited, validMetadata);
    const protoInjection = { ...validMetadata } as Record<string, unknown>;
    Object.defineProperty(protoInjection, "__proto__", { enumerable: true, value: { polluted: true } });
    class MetadataRecord {
      deviceId = validMetadata.deviceId;
      inode = validMetadata.inode;
      sizeBytes = validMetadata.sizeBytes;
      mode = validMetadata.mode;
      modifiedTimeMs = validMetadata.modifiedTimeMs;
    }

    for (const [label, metadata] of [
      ["null", null],
      ["array", []],
      ["class", new MetadataRecord()],
      ["symbol", withSymbol],
      ["accessor", withAccessor],
      ["inherited", inherited],
      ["unknown scalar", { ...validMetadata, unknownScalar: "x" }],
      ["unknown array", { ...validMetadata, unknownArray: [] }],
      ["proto", protoInjection],
      ["constructor", { ...validMetadata, constructor: "bad" }],
      ["prototype", { ...validMetadata, prototype: "bad" }],
      ["nan", { ...validMetadata, sizeBytes: Number.NaN }],
      ["infinity", { ...validMetadata, mode: Number.POSITIVE_INFINITY }],
      ["wrong mtime", { ...validMetadata, modifiedTimeMs: "1000" }],
      ["wrong device", { ...validMetadata, deviceId: 123 }],
      ["missing inode", { ...validMetadata, inode: undefined }],
      ["alternate file id", { ...validMetadata, fileId: validMetadata.inode }],
      ["missing modified time", { deviceId: validMetadata.deviceId, inode: validMetadata.inode, sizeBytes: validMetadata.sizeBytes, mode: validMetadata.mode }],
    ] as const) {
      expect(() => buildResolverEvidenceLink({ metadata } as never), label).toThrow("resolver_metadata_schema_rejected");
      expect(validateCompositionEvidenceSet(replaceEvidence(0, { ...resolver, metadata })), label).toContain("resolver_metadata_schema_rejected");
    }

    const emitted = buildResolverEvidenceLink().metadata;
    expect(Object.isFrozen(emitted)).toBe(true);
    expect(validateCompositionEvidenceSet(replaceEvidence(0, buildResolverEvidenceLink({ metadata: emitted })))).not.toContain("resolver_metadata_schema_rejected");
  });

  test("live-observation resolver claims are rejected by the pure fixture composition", () => {
    const liveClaim = buildResolverEvidenceLink({ observedLiveFilesystem: true });
    expect(liveClaim.observedLiveFilesystem).toBe(true);
    expect(validateCompositionEvidenceSet(replaceEvidence(0, liveClaim))).toContain("live_observation_claim_rejected");

    for (const patch of [
      { source: "server_only_lstat" },
      { observationSource: "server_only_lstat" },
      { filesystemObservationSource: "server_only_lstat" },
      { observedLiveFilesystem: true, resolvedAbsolutePath: "/usr/bin/git", metadata: buildResolverEvidenceLink().metadata },
    ]) {
      const liveLooking = { ...buildResolverEvidenceLink(), ...patch };
      expect(validateCompositionEvidenceSet(replaceEvidence(0, liveLooking)), JSON.stringify(patch)).toEqual(expect.arrayContaining(["live_observation_claim_rejected", "provenance_mismatch"]));
      const jsonClone = JSON.parse(JSON.stringify(liveLooking)) as CompositionEvidence;
      expect(validateCompositionEvidenceSet(replaceEvidence(0, jsonClone)), JSON.stringify(patch)).toContain("provenance_mismatch");
    }

    const synthetic = buildCanonicalCompositionEvidenceSet();
    expect(synthetic.evidence[0]).toMatchObject({ evidenceKind: "trusted_resolver_evidence_link", observedLiveFilesystem: false });
    expect(composeFirstLiveReadOnlyStagingPreflight({ evidenceSet: synthetic })).toMatchObject({ state: "composition_complete", liveResolverInvoked: false, filesystemAuthority: "none" });
  });

  test("identity version purpose tool platform order and ambiguity cases fail closed", () => {
    const evidenceSet = buildCanonicalCompositionEvidenceSet();
    const resolver = evidenceSet.evidence[0];

    expect(validateCompositionEvidenceSet(withEvidence([...evidenceSet.evidence, buildAuthorizationLifecycleEvidence()] as CompositionEvidenceSet["evidence"]))).toEqual(expect.arrayContaining(["ambiguous_evidence", "evidence_order_invalid"]));
    expect(validateCompositionEvidenceSet(withEvidence([evidenceSet.evidence[1], resolver, ...evidenceSet.evidence.slice(2)] as CompositionEvidenceSet["evidence"]))).toContain("evidence_order_invalid");
    expect(validateCompositionEvidenceSet(withEvidence([resolver, resolver, ...evidenceSet.evidence.slice(2)] as CompositionEvidenceSet["evidence"]))).toContain("duplicate_evidence");
    expect(validateCompositionEvidenceSet(replaceEvidence(0, { ...resolver, resolverAdapterId: "wrong_resolver" }))).toContain("wrong_identity");
    expect(validateCompositionEvidenceSet(replaceEvidence(0, { ...resolver, evidenceVersion: 2 }))).toContain("wrong_capability_version");
    expect(validateCompositionEvidenceSet(replaceEvidence(0, { ...resolver, purpose: "other_purpose" }))).toContain("wrong_purpose");
    expect(validateCompositionEvidenceSet(replaceEvidence(0, { ...resolver, toolIdentity: "node" }))).toContain("wrong_tool");
    expect(validateCompositionEvidenceSet(replaceEvidence(0, { ...resolver, platform: "linux" }))).toContain("wrong_platform");
    expect(validateCompositionEvidenceSet(replaceEvidence(0, { ...resolver, fixtureOnly: false, authoritativeLive: true }))).toContain("fixture_live_authority_confusion");
  });

  test("credential posture rejects credential token cookie BankID Avanza and Supabase-auth material", () => {
    const evidenceSet = buildCanonicalCompositionEvidenceSet();
    for (const patch of [
      { credentialMaterialPresent: true },
      { tokenPresent: true },
      { cookiePresent: true },
      { keychainAccessed: true },
      { browserStateAccessed: true },
      { bankIdPresent: true },
      { avanzaSessionPresent: true },
      { supabaseAuthenticationPresent: true },
    ]) {
      const badCredential = { ...buildNoCredentialEvidence(), ...patch };
      const badSet = withEvidence([...evidenceSet.evidence.slice(0, 4), badCredential, ...evidenceSet.evidence.slice(5)] as CompositionEvidenceSet["evidence"]);
      expect(validateCompositionEvidenceSet(badSet), JSON.stringify(patch)).toContain("unexpected_credentials");
    }
  });

  test("process plan permits only exact reviewed version operations and remains unexecuted", () => {
    const gitPlan = buildDirectSpawnPlanEvidence({ toolIdentity: "git" });
    expect(gitPlan).toMatchObject({ operation: "collect_git_version", argv: ["--version"], shellAllowed: false, retryPolicy: "none", attempt: 1, executionStarted: false, processSpawned: false });

    const evidenceSet = buildCanonicalCompositionEvidenceSet();
    for (const patch of [
      { argv: ["--version", "--bad"] },
      { argv: ["--version; rm"] },
      { shellAllowed: true },
      { retryPolicy: "retry_once" },
      { attempt: 2 },
      { executionStarted: true },
      { processSpawned: true },
      { operation: "collect_node_version" },
    ]) {
      const badPlan = { ...buildDirectSpawnPlanEvidence(), ...patch };
      const badSet = withEvidence([...evidenceSet.evidence.slice(0, 2), badPlan, ...evidenceSet.evidence.slice(3)] as CompositionEvidenceSet["evidence"]);
      expect(composeFirstLiveReadOnlyStagingPreflight({ evidenceSet: badSet }).state, JSON.stringify(patch)).toBe("blocked");
    }
  });

  test("state model transitions are deterministic and invalid transitions block", () => {
    expect(transitionFirstLiveReadOnlyStagingPreflightState("uninitialized", "start")).toBe("resolver_evidence_required");
    expect(transitionFirstLiveReadOnlyStagingPreflightState("resolver_evidence_required", "accept_resolver")).toBe("resolver_evidence_accepted");
    expect(transitionFirstLiveReadOnlyStagingPreflightState("resolver_evidence_accepted", "require_revalidation")).toBe("immediate_revalidation_required");
    expect(transitionFirstLiveReadOnlyStagingPreflightState("immediate_revalidation_required", "accept_spawn_plan")).toBe("spawn_plan_required");
    expect(transitionFirstLiveReadOnlyStagingPreflightState("spawn_plan_required", "accept_observer_plan")).toBe("observer_plan_required");
    expect(transitionFirstLiveReadOnlyStagingPreflightState("observer_plan_required", "accept_no_credential")).toBe("no_credential_evidence_required");
    expect(transitionFirstLiveReadOnlyStagingPreflightState("no_credential_evidence_required", "accept_cli_version")).toBe("cli_version_evidence_required");
    expect(transitionFirstLiveReadOnlyStagingPreflightState("cli_version_evidence_required", "complete")).toBe("composition_complete");
    expect(transitionFirstLiveReadOnlyStagingPreflightState("uninitialized", "complete")).toBe("blocked");
    expect(transitionFirstLiveReadOnlyStagingPreflightState("resolver_evidence_required", "expire")).toBe("expired");
  });

  test("static security keeps composition pure dormant and unwired", () => {
    const contractSource = source(contractPath);
    expect(contractSource).not.toMatch(/server-only|node:fs|from ["']fs["']|fs\/promises|\blstat\(|\bstat\(|child_process|\bspawn\(|\bexec\(|\bexecFile\(|\bfork\(|process\.env|fetch\(|from ["']node:net["']|from ["']node:tls["']|@supabase|createClient\(|keychain\(|keytar|document\.cookie|cookies\(|localStorage|sessionStorage|bankid\(|avanza\(/iu);
    expect(contractSource).not.toContain("resolveFirstLiveTrustedExecutable");
    expect(contractSource).not.toContain("buildScopedMacosFixtureObserverAdapter");
    expect(contractSource).not.toContain("buildDirectSpawnFixtureDriverAdapter");
    expect(contractSource).not.toContain("createCredentialSourceFixtureBoundary");
    expect(source(liveResolverPath)).not.toContain("post-trade-first-live-read-only-staging-preflight-composition-contract");
    expect(source(apiPath)).not.toContain("post-trade-first-live-read-only-staging-preflight-composition-contract");
    expect(source(tradeUiPath)).not.toContain("post-trade-first-live-read-only-staging-preflight-composition-contract");
  });
});
