import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  buildPostTradeFirstLiveReadOnlyPreflightAuthorizationArtifact,
  buildPostTradeFirstLiveReadOnlyPreflightAuthorizationArtifactFingerprint,
  buildPostTradeFirstLiveReadOnlyPreflightFutureRunPlan,
  mapFirstLiveReadOnlyPreflightAuthorizationToRunnerCompatibility,
  POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_ACTION_505_CHECKPOINT,
  POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_ACTION_505_DECISION,
  POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_ACTION_506_CHECKPOINT,
  POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_ACTION_506_DECISION,
  POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_ACTION_507_CHECKPOINT,
  POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_ACTION_507_DECISION,
  POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_ACTION_508_CHECKPOINT,
  POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_ACTION_508_DECISION,
  POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_AUTHORIZATION_ARTIFACT_ID,
  POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_AUTHORIZATION_ARTIFACT_VERSION,
  POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_AUTHORIZATION_CONTRACT_VERSION,
  POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_POLICY_IDENTITIES,
  validatePostTradeFirstLiveReadOnlyPreflightAuthorizationArtifact,
  type PostTradeFirstLiveReadOnlyPreflightAuthorizationArtifact,
} from "../../lib/post-trade-first-live-read-only-preflight-authorization-artifact-core";
import {
  buildPostTradeReadOnlyLivePreflightRunnerPlan,
  POST_TRADE_READ_ONLY_LIVE_PREFLIGHT_RUNNER_ID,
  POST_TRADE_READ_ONLY_LIVE_PREFLIGHT_RUNNER_VERSION,
} from "../../lib/post-trade-read-only-live-staging-migration-preflight-runner-core";
import {
  POST_TRADE_READ_ONLY_LIVE_PREFLIGHT_CONTRACT_ID,
  POST_TRADE_READ_ONLY_LIVE_PREFLIGHT_CONTRACT_VERSION,
  POST_TRADE_READ_ONLY_LIVE_PREFLIGHT_READINESS_ARTIFACT_FINGERPRINT,
} from "../../lib/post-trade-read-only-live-staging-migration-preflight-contract";
import {
  POST_TRADE_STAGING_MIGRATION_DEPLOYMENT_READINESS_ARTIFACT_ID,
} from "../../lib/post-trade-staging-migration-deployment-readiness-artifact-core";
import {
  POST_TRADE_STAGING_MIGRATION_EXPECTED_FINGERPRINT,
  POST_TRADE_STAGING_MIGRATION_PATH,
  POST_TRADE_STAGING_MIGRATION_PROJECT_REF,
  POST_TRADE_STAGING_MIGRATION_REJECTED_PRODUCTION_REF,
} from "../../lib/post-trade-staging-migration-deployment-gate-core";

const evaluatedAtIso = "2026-07-14T12:01:00.000Z";
const expectedArtifactFingerprint = "447b059a40e04db875e2e29a845a21d04204f5b634df18e26a0ef1aa059144dd";

function withFingerprint(
  artifact: Partial<PostTradeFirstLiveReadOnlyPreflightAuthorizationArtifact>,
): PostTradeFirstLiveReadOnlyPreflightAuthorizationArtifact {
  const core = { ...artifact };
  delete (core as Partial<PostTradeFirstLiveReadOnlyPreflightAuthorizationArtifact>).artifactFingerprint;
  delete (core as Partial<PostTradeFirstLiveReadOnlyPreflightAuthorizationArtifact>).artifactFingerprintAlgorithm;
  return {
    ...artifact,
    artifactFingerprintAlgorithm: "sha256",
    artifactFingerprint: buildPostTradeFirstLiveReadOnlyPreflightAuthorizationArtifactFingerprint(core),
  } as PostTradeFirstLiveReadOnlyPreflightAuthorizationArtifact;
}

function artifact(
  mutate: (value: PostTradeFirstLiveReadOnlyPreflightAuthorizationArtifact) => Partial<PostTradeFirstLiveReadOnlyPreflightAuthorizationArtifact> =
    (value) => value,
) {
  return withFingerprint(mutate(buildPostTradeFirstLiveReadOnlyPreflightAuthorizationArtifact()));
}

function validate(input: unknown = artifact()) {
  return validatePostTradeFirstLiveReadOnlyPreflightAuthorizationArtifact(input, evaluatedAtIso);
}

test.describe("post-trade first live read-only preflight authorization artifact", () => {
  test("canonical authorization artifact is valid, source-controlled, staging-only, read-only, one-shot, no-retry, and inert", () => {
    const canonical = artifact();
    const decision = validate(canonical);

    expect(decision.valid).toBe(true);
    expect(decision.structurallyReadyForFirstLiveReadOnlyPreflightAuthorization).toBe(true);
    expect(canonical.authorizationArtifactId).toBe(POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_AUTHORIZATION_ARTIFACT_ID);
    expect(canonical.artifactVersion).toBe(POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_AUTHORIZATION_ARTIFACT_VERSION);
    expect(canonical.artifactFingerprint).toBe(expectedArtifactFingerprint);
    expect(canonical.authorizationContractVersion).toBe(POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_AUTHORIZATION_CONTRACT_VERSION);
    expect(canonical.authorizationState).toBe("unused");
    expect(canonical.preflightRunStatus).toBe("not_run");
    expect(canonical.runnerExecutionEnabled).toBe(false);
    expect(canonical.liveEvidenceCollected).toBe(false);
    expect(canonical.deploymentEnabled).toBe(false);
    expect(canonical.deploymentStatus).toBe("not_deployed");
    expect(canonical.remoteMutation).toBe(false);
    expect(canonical.gitMutation).toBe(false);
    expect(canonical.sqlExecuted).toBe(false);
    expect(canonical.migrationsApplied).toBe(0);
    expect(canonical.rowsCreated).toBe(0);
    expect(canonical.authorizationConsumed).toBe(false);
    expect(canonical.automaticRetryAllowed).toBe(false);
    expect(canonical.oneShot).toBe(true);
    expect(canonical.readOnly).toBe(true);
    expect(canonical.stagingOnly).toBe(true);
  });

  test("canonical artifact binds readiness, migration, staging, production rejection, Actions 505-508, and runner identities", () => {
    const canonical = artifact();

    expect(canonical.readinessBinding.readinessArtifactId).toBe(POST_TRADE_STAGING_MIGRATION_DEPLOYMENT_READINESS_ARTIFACT_ID);
    expect(canonical.readinessBinding.readinessArtifactFingerprint).toBe(POST_TRADE_READ_ONLY_LIVE_PREFLIGHT_READINESS_ARTIFACT_FINGERPRINT);
    expect(canonical.migrationBinding.reviewedMigrationPath).toBe(POST_TRADE_STAGING_MIGRATION_PATH);
    expect(canonical.migrationBinding.reviewedMigrationFingerprint).toBe(POST_TRADE_STAGING_MIGRATION_EXPECTED_FINGERPRINT);
    expect(canonical.projectBinding.exactStagingProjectRef).toBe(POST_TRADE_STAGING_MIGRATION_PROJECT_REF);
    expect(canonical.projectBinding.rejectedProductionProjectRef).toBe(POST_TRADE_STAGING_MIGRATION_REJECTED_PRODUCTION_REF);
    expect(canonical.reviewBinding.action505Decision).toBe(POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_ACTION_505_DECISION);
    expect(canonical.reviewBinding.action506Decision).toBe(POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_ACTION_506_DECISION);
    expect(canonical.reviewBinding.action507Decision).toBe(POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_ACTION_507_DECISION);
    expect(canonical.reviewBinding.action508Decision).toBe(POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_ACTION_508_DECISION);
    expect(canonical.reviewBinding.action505Checkpoint).toBe(POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_ACTION_505_CHECKPOINT);
    expect(canonical.reviewBinding.action506Checkpoint).toBe(POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_ACTION_506_CHECKPOINT);
    expect(canonical.reviewBinding.action507Checkpoint).toBe(POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_ACTION_507_CHECKPOINT);
    expect(canonical.reviewBinding.action508Checkpoint).toBe(POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_ACTION_508_CHECKPOINT);
    expect(canonical.preflightContractId).toBe(POST_TRADE_READ_ONLY_LIVE_PREFLIGHT_CONTRACT_ID);
    expect(canonical.preflightContractVersion).toBe(POST_TRADE_READ_ONLY_LIVE_PREFLIGHT_CONTRACT_VERSION);
    expect(canonical.runnerPlanBinding.runnerId).toBe(POST_TRADE_READ_ONLY_LIVE_PREFLIGHT_RUNNER_ID);
    expect(canonical.runnerPlanBinding.runnerVersion).toBe(POST_TRADE_READ_ONLY_LIVE_PREFLIGHT_RUNNER_VERSION);
  });

  test("canonical artifact binds exact runner operation plan, allowlists, parser registry, evidence categories, policies, and counts", () => {
    const canonical = artifact();
    const plan = buildPostTradeReadOnlyLivePreflightRunnerPlan();

    expect(canonical.runnerPlanBinding.commandOperationIdentities).toEqual(plan.operations.map((item) => item.operationId));
    expect(canonical.runnerPlanBinding.commandFamilies).toEqual(plan.operations.map((item) => item.family));
    expect(canonical.runnerPlanBinding.catalogQueryIdentities).toEqual(plan.catalogQueries.map((item) => item.queryId));
    expect(canonical.runnerPlanBinding.parserIdentities).toEqual(plan.operations.map((item) => item.parserIdentity));
    expect(canonical.runnerPlanBinding.evidenceCategories).toEqual([
      "catalog",
      "history",
      "migration_content",
      "migration_inventory",
      "privilege",
      "project",
      "worktree",
    ]);
    expect(canonical.expectedCounts.commandExecutorOperations).toBe(12);
    expect(canonical.expectedCounts.catalogAdapterOperations).toBe(9);
    expect(canonical.expectedCounts.evidenceCategories).toBe(7);
    expect(canonical.expectedCounts.commandExecutorOperations).toBe(plan.operations.length);
    expect(canonical.expectedCounts.catalogAdapterOperations).toBe(plan.catalogQueries.length);
    expect(canonical.expectedCounts.collectionSessions).toBe(1);
    expect(canonical.expectedCounts.runnerInvocations).toBe(1);
    expect(canonical.expectedCounts.deploymentOperations).toBe(0);
    expect(canonical.expectedCounts.sqlOperations).toBe(0);
    expect(canonical.expectedCounts.mutationOperations).toBe(0);
    expect(canonical.expectedCounts.migrationApplications).toBe(0);
    expect(canonical.expectedCounts.expectedRowsCreated).toBe(0);
    expect(canonical.policyBinding).toEqual(POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_POLICY_IDENTITIES);
  });

  test("canonical artifact keeps live-verification limitations false and records future boundary requirements", () => {
    const canonical = artifact();
    expect(canonical.liveVerificationLimitations).toEqual({
      credentialBoundaryVerified: false,
      processTerminationVerified: false,
      cliVersionCompatibilityVerified: false,
      liveProjectContextVerified: false,
      liveWorktreeContextVerified: false,
      liveRemoteReachabilityVerified: false,
      cliVersionsLiveVerified: false,
    });
    expect(canonical.processTerminationRequirement.noDetachedProcessesRequired).toBe(true);
    expect(canonical.processTerminationRequirement.noSurvivingChildProcessRequired).toBe(true);
    expect(canonical.cliVersionRequirement.cliVersionsLiveVerified).toBe(false);
    expect(canonical.toctouRestrictions.oneCollectionSessionOnly).toBe(true);
    expect(canonical.toctouRestrictions.ambiguousRunnerResultInvalidatesAuthorization).toBe(true);
  });

  test("artifact fingerprint is complete lowercase SHA-256 and changes when critical fields change", () => {
    const canonical = artifact();
    expect(canonical.artifactFingerprint).toMatch(/^[a-f0-9]{64}$/);

    const changedCases = [
      artifact((value) => ({ ...value, authorizationArtifactId: "other" as never })),
      artifact((value) => ({ ...value, artifactVersion: "other" as never })),
      artifact((value) => ({ ...value, preflightRunId: "other" as never })),
      artifact((value) => ({ ...value, preflightOperationId: "other" as never })),
      artifact((value) => ({ ...value, runnerPlanBinding: { ...value.runnerPlanBinding, runnerId: "other" as never } })),
      artifact((value) => ({ ...value, reviewBinding: { ...value.reviewBinding, action508Decision: "other" as never } })),
      artifact((value) => ({ ...value, reviewBinding: { ...value.reviewBinding, action508Checkpoint: "docs/other.md" as never } })),
      artifact((value) => ({
        ...value,
        runnerPlanBinding: {
          ...value.runnerPlanBinding,
          commandOperationIdentities: value.runnerPlanBinding.commandOperationIdentities.slice(1),
        },
      })),
      artifact((value) => ({
        ...value,
        runnerPlanBinding: {
          ...value.runnerPlanBinding,
          commandOperationIdentities: [...value.runnerPlanBinding.commandOperationIdentities, "extra_operation"],
        },
      })),
      artifact((value) => ({
        ...value,
        runnerPlanBinding: {
          ...value.runnerPlanBinding,
          commandOperationIdentities: [...value.runnerPlanBinding.commandOperationIdentities].reverse(),
        },
      })),
      artifact((value) => ({
        ...value,
        runnerPlanBinding: {
          ...value.runnerPlanBinding,
          commandOperationIdentities: ["different_operation", ...value.runnerPlanBinding.commandOperationIdentities.slice(1)],
        },
      })),
      artifact((value) => ({
        ...value,
        runnerPlanBinding: {
          ...value.runnerPlanBinding,
          catalogQueryIdentities: value.runnerPlanBinding.catalogQueryIdentities.slice(1),
        },
      })),
      artifact((value) => ({
        ...value,
        runnerPlanBinding: {
          ...value.runnerPlanBinding,
          catalogQueryIdentities: [...value.runnerPlanBinding.catalogQueryIdentities, "extra_catalog_query" as never],
        },
      })),
      artifact((value) => ({
        ...value,
        runnerPlanBinding: {
          ...value.runnerPlanBinding,
          evidenceCategories: value.runnerPlanBinding.evidenceCategories.slice(1),
        },
      })),
      artifact((value) => ({
        ...value,
        runnerPlanBinding: {
          ...value.runnerPlanBinding,
          evidenceCategories: [...value.runnerPlanBinding.evidenceCategories, "extra_evidence"],
        },
      })),
      artifact((value) => ({
        ...value,
        runnerPlanBinding: {
          ...value.runnerPlanBinding,
          parserIdentities: ["different_parser", ...value.runnerPlanBinding.parserIdentities.slice(1)],
        },
      })),
      artifact((value) => ({
        ...value,
        expectedCounts: { ...value.expectedCounts, commandExecutorOperations: 999 },
      })),
      artifact((value) => ({
        ...value,
        runnerPlanBinding: {
          ...value.runnerPlanBinding,
          commandOperationIdentities: ["different_operation", ...value.runnerPlanBinding.commandOperationIdentities.slice(1)],
        },
        expectedCounts: { ...value.expectedCounts },
      })),
      artifact((value) => ({ ...value, policyBinding: { ...value.policyBinding, timeoutPolicy: "other" } as never })),
      artifact((value) => ({ ...value, policyBinding: { ...value.policyBinding, outputLimitPolicy: "other" } as never })),
      artifact((value) => ({ ...value, policyBinding: { ...value.policyBinding, argumentPolicy: "other" } as never })),
      artifact((value) => ({ ...value, policyBinding: { ...value.policyBinding, environmentPolicy: "other" } as never })),
      artifact((value) => ({ ...value, policyBinding: { ...value.policyBinding, workingDirectoryPolicy: "other" } as never })),
      artifact((value) => ({ ...value, policyBinding: { ...value.policyBinding, stdinPolicy: "open" } as never })),
      artifact((value) => ({ ...value, policyBinding: { ...value.policyBinding, promptDetectionPolicy: "other" } as never })),
      artifact((value) => ({ ...value, policyBinding: { ...value.policyBinding, secretScanningPolicy: "other" } as never })),
      artifact((value) => ({ ...value, policyBinding: { ...value.policyBinding, parserRegistry: "other" } as never })),
      artifact((value) => ({ ...value, policyBinding: { ...value.policyBinding, evidenceSourceRegistry: "other" } as never })),
      artifact((value) => ({
        ...value,
        runnerPlanBinding: {
          ...value.runnerPlanBinding,
          timeoutMsByOperation: {
            ...value.runnerPlanBinding.timeoutMsByOperation,
            [value.runnerPlanBinding.commandOperationIdentities[0] ?? "missing"]: 999999,
          },
        },
      })),
      artifact((value) => ({
        ...value,
        runnerPlanBinding: {
          ...value.runnerPlanBinding,
          maxStdoutBytesByOperation: {
            ...value.runnerPlanBinding.maxStdoutBytesByOperation,
            [value.runnerPlanBinding.commandOperationIdentities[0] ?? "missing"]: 999999,
          },
        },
      })),
      artifact((value) => ({
        ...value,
        runnerPlanBinding: {
          ...value.runnerPlanBinding,
          maxStderrBytesByOperation: {
            ...value.runnerPlanBinding.maxStderrBytesByOperation,
            [value.runnerPlanBinding.commandOperationIdentities[0] ?? "missing"]: 999999,
          },
        },
      })),
    ];

    for (const changed of changedCases) {
      expect(changed.artifactFingerprint).not.toBe(canonical.artifactFingerprint);
      expect(validate(changed).valid).toBe(false);
    }
  });

  test("fingerprint variants and unknown algorithm are rejected", () => {
    const canonical = artifact();
    expect(validate({ ...canonical, artifactFingerprint: canonical.artifactFingerprint.slice(0, 16) }).valid).toBe(false);
    expect(validate({ ...canonical, artifactFingerprint: `${canonical.artifactFingerprint.slice(0, 63)}x` }).valid).toBe(false);
    expect(validate({ ...canonical, artifactFingerprint: canonical.artifactFingerprint.toUpperCase() }).valid).toBe(false);
    expect(validate({ ...canonical, artifactFingerprintAlgorithm: "sha1" }).valid).toBe(false);
  });

  const rejectionCases: { name: string; mutate: (value: PostTradeFirstLiveReadOnlyPreflightAuthorizationArtifact) => unknown }[] = [
    { name: "missing field rejected", mutate: (value) => { const next = { ...value }; delete (next as Partial<typeof value>).preflightRunId; return next; } },
    { name: "unknown top-level field rejected", mutate: (value) => ({ ...value, unknown: true }) },
    { name: "unknown nested field rejected", mutate: (value) => ({ ...value, runnerPlanBinding: { ...value.runnerPlanBinding, unknown: true } }) },
    { name: "null critical value rejected", mutate: (value) => ({ ...value, preflightRunId: null }) },
    { name: "empty critical string rejected", mutate: (value) => ({ ...value, preflightRunId: "" }) },
    { name: "malformed count rejected", mutate: (value) => ({ ...value, expectedCounts: { ...value.expectedCounts, commandExecutorOperations: 1.5 } }) },
    { name: "negative count rejected", mutate: (value) => ({ ...value, expectedCounts: { ...value.expectedCounts, commandExecutorOperations: -1 } }) },
    { name: "non-finite count rejected", mutate: (value) => ({ ...value, expectedCounts: { ...value.expectedCounts, commandExecutorOperations: Number.POSITIVE_INFINITY } }) },
    { name: "malformed issued timestamp rejected", mutate: (value) => ({ ...value, issuedAtIso: "bad" }) },
    { name: "malformed expiry timestamp rejected", mutate: (value) => ({ ...value, expiresAtIso: "bad" }) },
    { name: "expiry-before-issuance rejected", mutate: (value) => ({ ...value, expiresAtIso: "2026-07-14T11:59:00.000Z" }) },
    { name: "excessive validity rejected", mutate: (value) => ({ ...value, expiresAtIso: "2026-07-14T12:30:01.000Z" }) },
    { name: "future-issued artifact rejected", mutate: (value) => ({ ...value, issuedAtIso: "2026-07-14T12:02:00.000Z", expiresAtIso: "2026-07-14T12:03:00.000Z" }) },
    { name: "expired artifact rejected", mutate: (value) => ({ ...value, expiresAtIso: "2026-07-14T12:00:30.000Z" }) },
    { name: "consumed state rejected", mutate: (value) => ({ ...value, authorizationState: "consumed" }) },
    { name: "invalid state rejected", mutate: (value) => ({ ...value, authorizationState: "invalid" }) },
    { name: "one-shot false rejected", mutate: (value) => ({ ...value, oneShot: false }) },
    { name: "retry true rejected", mutate: (value) => ({ ...value, automaticRetryAllowed: true }) },
    { name: "read-only false rejected", mutate: (value) => ({ ...value, readOnly: false }) },
    { name: "runner execution enabled rejected", mutate: (value) => ({ ...value, runnerExecutionEnabled: true }) },
    { name: "live evidence collected true rejected", mutate: (value) => ({ ...value, liveEvidenceCollected: true }) },
    { name: "preflight status changed rejected", mutate: (value) => ({ ...value, preflightRunStatus: "complete" }) },
    { name: "authorization consumed true rejected", mutate: (value) => ({ ...value, authorizationConsumed: true }) },
    { name: "non-zero deployment operation rejected", mutate: (value) => ({ ...value, expectedCounts: { ...value.expectedCounts, deploymentOperations: 1 } }) },
    { name: "non-zero SQL operation rejected", mutate: (value) => ({ ...value, expectedCounts: { ...value.expectedCounts, sqlOperations: 1 } }) },
    { name: "non-zero mutation operation rejected", mutate: (value) => ({ ...value, expectedCounts: { ...value.expectedCounts, mutationOperations: 1 } }) },
    { name: "non-zero migration count rejected", mutate: (value) => ({ ...value, migrationsApplied: 1 }) },
    { name: "non-zero row count rejected", mutate: (value) => ({ ...value, rowsCreated: 1 }) },
    { name: "alternate project rejected", mutate: (value) => ({ ...value, projectBinding: { ...value.projectBinding, exactStagingProjectRef: "aaaaaaaaaaaaaaaaaaaa" } }) },
    { name: "production target rejected", mutate: (value) => ({ ...value, projectBinding: { ...value.projectBinding, exactStagingProjectRef: POST_TRADE_STAGING_MIGRATION_REJECTED_PRODUCTION_REF } }) },
    { name: "production reference nested in object rejected", mutate: (value) => ({ ...value, nested: { project: POST_TRADE_STAGING_MIGRATION_REJECTED_PRODUCTION_REF } }) },
    { name: "production URL rejected", mutate: (value) => ({ ...value, sourceActionIdentity: `https://${POST_TRADE_STAGING_MIGRATION_REJECTED_PRODUCTION_REF}.supabase.co` }) },
    { name: "production ref in array rejected", mutate: (value) => ({ ...value, runnerPlanBinding: { ...value.runnerPlanBinding, commandOperationIdentities: [POST_TRADE_STAGING_MIGRATION_REJECTED_PRODUCTION_REF] } }) },
    { name: "credential boundary falsely verified rejected", mutate: (value) => ({ ...value, liveVerificationLimitations: { ...value.liveVerificationLimitations, credentialBoundaryVerified: true } }) },
    { name: "termination boundary falsely verified rejected", mutate: (value) => ({ ...value, liveVerificationLimitations: { ...value.liveVerificationLimitations, processTerminationVerified: true } }) },
    { name: "CLI compatibility falsely verified rejected", mutate: (value) => ({ ...value, liveVerificationLimitations: { ...value.liveVerificationLimitations, cliVersionCompatibilityVerified: true } }) },
    { name: "project context falsely verified rejected", mutate: (value) => ({ ...value, liveVerificationLimitations: { ...value.liveVerificationLimitations, liveProjectContextVerified: true } }) },
    { name: "worktree context falsely verified rejected", mutate: (value) => ({ ...value, liveVerificationLimitations: { ...value.liveVerificationLimitations, liveWorktreeContextVerified: true } }) },
    { name: "remote reachability falsely verified rejected", mutate: (value) => ({ ...value, liveVerificationLimitations: { ...value.liveVerificationLimitations, liveRemoteReachabilityVerified: true } }) },
    { name: "access token field rejected", mutate: (value) => ({ ...value, accessToken: "x" }) },
    { name: "refresh token field rejected", mutate: (value) => ({ ...value, refreshToken: "x" }) },
    { name: "service-role key field rejected", mutate: (value) => ({ ...value, serviceRoleKey: "x" }) },
    { name: "anon key field rejected", mutate: (value) => ({ ...value, anonKey: "x" }) },
    { name: "database password field rejected", mutate: (value) => ({ ...value, databasePassword: "x" }) },
    { name: "connection string rejected", mutate: (value) => ({ ...value, connectionString: "postgres://example" }) },
    { name: "authorization header rejected", mutate: (value) => ({ ...value, authorizationHeader: "Authorization: Bearer x" }) },
    { name: "cookie field rejected", mutate: (value) => ({ ...value, cookie: "x" }) },
    { name: "session field rejected", mutate: (value) => ({ ...value, session: "x" }) },
    { name: "private key field rejected", mutate: (value) => ({ ...value, privateKey: "x" }) },
    { name: "client secret field rejected", mutate: (value) => ({ ...value, clientSecret: "x" }) },
    { name: "environment dump rejected", mutate: (value) => ({ ...value, rawEnvironment: "x" }) },
    { name: "personal path rejected", mutate: (value) => ({ ...value, sourceActionIdentity: "/Users/example/project" }) },
    { name: "unsupported nested value rejected", mutate: (value) => ({ ...value, nested: new Map() }) },
  ];

  for (const item of rejectionCases) {
    test(item.name, () => {
      const input = item.mutate(artifact());
      const next = typeof input === "object" && input && !(input instanceof Map)
        ? withFingerprint(input as Partial<PostTradeFirstLiveReadOnlyPreflightAuthorizationArtifact>)
        : input;
      expect(validate(next).valid).toBe(false);
    });
  }

  test("cyclic input rejected without fingerprinting", () => {
    const cyclic: Record<string, unknown> = { ...artifact() };
    cyclic.self = cyclic;
    const decision = validatePostTradeFirstLiveReadOnlyPreflightAuthorizationArtifact(cyclic, evaluatedAtIso);
    expect(decision.valid).toBe(false);
    expect(decision.blockingReasons).toContain("unsupported_nested_value");
  });

  test("all forbidden capabilities are false and individual forbidden capability flips are rejected", () => {
    const canonical = artifact();
    for (const [key, value] of Object.entries(canonical.forbiddenCapabilities)) {
      expect(value, key).toBe(false);
      const changed = withFingerprint({
        ...canonical,
        forbiddenCapabilities: { ...canonical.forbiddenCapabilities, [key]: true },
      } as never);
      expect(validate(changed).valid).toBe(false);
    }
  });

  test("runner compatibility is pure, preserves exact plan and allowlists, and does not enable execution", () => {
    const canonical = artifact();
    const first = mapFirstLiveReadOnlyPreflightAuthorizationToRunnerCompatibility(canonical);
    const second = mapFirstLiveReadOnlyPreflightAuthorizationToRunnerCompatibility(canonical);

    expect(first).toEqual(second);
    expect(first.compatible).toBe(true);
    expect(first.preservesExactPlan).toBe(true);
    expect(first.preservesExactCommandAllowlist).toBe(true);
    expect(first.preservesExactCatalogAllowlist).toBe(true);
    expect(first.preservesExactParserRegistry).toBe(true);
    expect(first.preservesExactTimeouts).toBe(true);
    expect(first.preservesExactOutputLimits).toBe(true);
    expect(first.preservesExactPolicies).toBe(true);
    expect(first.preservesExpectedCounts).toBe(true);
    expect(first.preservesNoRetry).toBe(true);
    expect(first.preservesNoMutation).toBe(true);
    expect(first.runnerExecutionEnabled).toBe(false);
    expect(first.createsCollectionSession).toBe(false);
    expect(first.createsLiveEvidence).toBe(false);
    expect(first.consumesAuthorization).toBe(false);
    expect(first.persistsState).toBe(false);
    expect(first.invokesRunner).toBe(false);
    expect(first.invokesExecutor).toBe(false);
    expect(first.invokesCatalogAdapter).toBe(false);
  });

  test("runner compatibility fails closed on operation, parser, timeout, output, policy, and count mismatches", () => {
    const canonical = artifact();
    const mismatches = [
      {
        expectedFlag: "preservesExactPlan",
        artifact: artifact((value) => ({
          ...value,
          runnerPlanBinding: {
            ...value.runnerPlanBinding,
            commandOperationIdentities: value.runnerPlanBinding.commandOperationIdentities.slice(1),
          },
        })),
      },
      {
        expectedFlag: "preservesExactParserRegistry",
        artifact: artifact((value) => ({
          ...value,
          runnerPlanBinding: {
            ...value.runnerPlanBinding,
            parserIdentities: ["different_parser", ...value.runnerPlanBinding.parserIdentities.slice(1)],
          },
        })),
      },
      {
        expectedFlag: "preservesExactTimeouts",
        artifact: artifact((value) => ({
          ...value,
          runnerPlanBinding: {
            ...value.runnerPlanBinding,
            timeoutMsByOperation: {
              ...value.runnerPlanBinding.timeoutMsByOperation,
              [value.runnerPlanBinding.commandOperationIdentities[0] ?? "missing"]: 999999,
            },
          },
        })),
      },
      {
        expectedFlag: "preservesExactOutputLimits",
        artifact: artifact((value) => ({
          ...value,
          runnerPlanBinding: {
            ...value.runnerPlanBinding,
            maxStdoutBytesByOperation: {
              ...value.runnerPlanBinding.maxStdoutBytesByOperation,
              [value.runnerPlanBinding.commandOperationIdentities[0] ?? "missing"]: 999999,
            },
          },
        })),
      },
      {
        expectedFlag: "preservesExactPolicies",
        artifact: artifact((value) => ({ ...value, policyBinding: { ...value.policyBinding, parserRegistry: "other" } as never })),
      },
      {
        expectedFlag: "preservesExpectedCounts",
        artifact: artifact((value) => ({
          ...value,
          expectedCounts: { ...value.expectedCounts, commandExecutorOperations: value.expectedCounts.commandExecutorOperations + 1 },
        })),
      },
    ] as const;

    expect(mapFirstLiveReadOnlyPreflightAuthorizationToRunnerCompatibility(canonical).compatible).toBe(true);
    for (const mismatch of mismatches) {
      const result = mapFirstLiveReadOnlyPreflightAuthorizationToRunnerCompatibility(mismatch.artifact);
      expect(result.compatible).toBe(false);
      expect(result[mismatch.expectedFlag]).toBe(false);
      expect(result.runnerExecutionEnabled).toBe(false);
      expect(result.invokesRunner).toBe(false);
      expect(result.invokesExecutor).toBe(false);
      expect(result.invokesCatalogAdapter).toBe(false);
      expect(result.createsLiveEvidence).toBe(false);
      expect(result.consumesAuthorization).toBe(false);
      expect(result.persistsState).toBe(false);
    }
  });

  test("future first-run plan is inert and contains no credentials, command strings, SQL, deployment, or consumption", () => {
    const plan = buildPostTradeFirstLiveReadOnlyPreflightFutureRunPlan();
    const serialized = JSON.stringify(plan);

    expect(plan.planStatus).toBe("inert_future_first_live_read_only_preflight_only");
    expect(plan.targetProjectRef).toBe(POST_TRADE_STAGING_MIGRATION_PROJECT_REF);
    expect(plan.runnerInvocationCount).toBe(1);
    expect(plan.collectionSessionCount).toBe(1);
    expect(plan.deploymentEnabled).toBe(false);
    expect(plan.remoteMutation).toBe(false);
    expect(plan.gitMutation).toBe(false);
    expect(plan.sqlExecuted).toBe(false);
    expect(plan.containsCredentials).toBe(false);
    expect(plan.containsCommandStrings).toBe(false);
    expect(plan.containsShellStrings).toBe(false);
    expect(plan.containsSql).toBe(false);
    expect(plan.containsDeployment).toBe(false);
    expect(plan.consumesAuthorization).toBe(false);
    expect(serialized).not.toMatch(/postgres:\/\/|service_role|access token|supabase db|git\s+(status|diff|rev-parse)|select\s+\*|insert\s+into|deploy\s+--/i);
  });

  test("source files do not execute Git, Supabase, shell, SQL, deployment, persistence, consumption, API, UI, Avanza, or browser automation", () => {
    const core = readFileSync(
      join(process.cwd(), "lib/post-trade-first-live-read-only-preflight-authorization-artifact-core.ts"),
      "utf8",
    );
    const boundary = readFileSync(
      join(process.cwd(), "lib/post-trade-first-live-read-only-preflight-authorization-artifact.ts"),
      "utf8",
    );
    const api = readFileSync(join(process.cwd(), "app/api/post-trade/payload/validate/route.ts"), "utf8");
    const tradeUi = readFileSync(join(process.cwd(), "app/trade-app.tsx"), "utf8");
    const source = `${core}\n${boundary}`;

    expect(boundary).toContain('import "server-only"');
    expect(source).not.toMatch(/child_process|node:child_process|spawn\(|exec\(|execFile\(|createClient\(|\.from\([^)]*\)\.(insert|update|delete|upsert)\(|\.rpc\(|supabase db|migration up|migration repair|db reset|deployMigration\(|consumeReadiness\(|persistEvidence\(|consumeAuthorization\(|runAvanza|launchBrowser|browser\.newPage/i);
    expect(api).not.toContain("post-trade-first-live-read-only-preflight-authorization-artifact");
    expect(tradeUi).not.toContain("post-trade-first-live-read-only-preflight-authorization-artifact");
  });
});
