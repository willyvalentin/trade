import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  buildBoundaryReadinessInputFingerprint,
  buildBoundarySession,
  buildBoundarySessionFingerprint,
  buildCanonicalBoundaryReadinessInput,
  buildCanonicalCredentialBoundaryEvidence,
  buildCanonicalProcessResultEvidence,
  buildCanonicalVersionEvidenceSet,
  buildCliVersionRequirements,
  buildCredentialBoundaryEvidenceFingerprint,
  buildCredentialBoundaryRequirements,
  buildInertFutureExecutionBoundaryPlan,
  buildProcessExecutionRequirements,
  buildProcessPolicyFingerprint,
  buildVersionEvidenceSetFingerprint,
  classifyProcessResultEvidence,
  evaluateCombinedBoundaryReadiness,
  evaluateVersionEvidenceSet,
  mapAuthorizationCompatibilityToExecutionBoundary,
  validateBoundarySession,
  validateCredentialBoundaryEvidence,
  validateProcessExecutionPolicy,
  POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_CREDENTIAL_HANDLE_ID,
  POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_RECOMMENDED_CREDENTIAL_PROVIDER,
} from "../../lib/post-trade-first-live-read-only-preflight-execution-boundary-contract";
import {
  POST_TRADE_STAGING_MIGRATION_PROJECT_REF,
  POST_TRADE_STAGING_MIGRATION_REJECTED_PRODUCTION_REF,
} from "../../lib/post-trade-staging-migration-deployment-gate-core";

function credentialWithFingerprint(input: ReturnType<typeof buildCanonicalCredentialBoundaryEvidence>) {
  const core = { ...input };
  delete (core as Partial<typeof input>).evidenceFingerprint;
  delete (core as Partial<typeof input>).evidenceFingerprintAlgorithm;
  return {
    ...input,
    evidenceFingerprintAlgorithm: "sha256" as const,
    evidenceFingerprint: buildCredentialBoundaryEvidenceFingerprint(core),
  };
}

function versionSetWithFingerprint(input: ReturnType<typeof buildCanonicalVersionEvidenceSet>) {
  const core = { ...input };
  delete (core as Partial<typeof input>).evidenceFingerprint;
  delete (core as Partial<typeof input>).evidenceFingerprintAlgorithm;
  return {
    ...input,
    evidenceFingerprintAlgorithm: "sha256" as const,
    evidenceFingerprint: buildVersionEvidenceSetFingerprint(core),
  };
}

function processPolicyWithFingerprint(input: ReturnType<typeof buildProcessExecutionRequirements>) {
  const core = { ...input };
  delete (core as Partial<typeof input>).policyFingerprint;
  delete (core as Partial<typeof input>).policyFingerprintAlgorithm;
  return {
    ...input,
    policyFingerprintAlgorithm: "sha256" as const,
    policyFingerprint: buildProcessPolicyFingerprint(core),
  };
}

function sessionWithFingerprint(input: ReturnType<typeof buildBoundarySession>) {
  const core = { ...input };
  delete (core as Partial<typeof input>).sessionFingerprint;
  delete (core as Partial<typeof input>).sessionFingerprintAlgorithm;
  return {
    ...input,
    sessionFingerprintAlgorithm: "sha256" as const,
    sessionFingerprint: buildBoundarySessionFingerprint(core),
  };
}

function readinessWithFingerprint(input: ReturnType<typeof buildCanonicalBoundaryReadinessInput>) {
  const core = { ...input };
  delete (core as Partial<typeof input>).inputFingerprint;
  delete (core as Partial<typeof input>).inputFingerprintAlgorithm;
  return {
    ...input,
    inputFingerprintAlgorithm: "sha256" as const,
    inputFingerprint: buildBoundaryReadinessInputFingerprint(core),
  };
}

test.describe("post-trade first-live read-only preflight execution boundary contract", () => {
  test("canonical hypothetical boundary evidence is structurally ready while keeping execution disabled and no-write", () => {
    const input = buildCanonicalBoundaryReadinessInput();
    const decision = evaluateCombinedBoundaryReadiness(input);

    expect(decision.decision).toBe("ready_for_first_live_read_only_preflight_gate");
    expect(decision.ready).toBe(true);
    expect(decision.runnerExecutionEnabled).toBe(false);
    expect(decision.preflightRunStatus).toBe("not_run");
    expect(decision.deploymentEnabled).toBe(false);
    expect(decision.deploymentStatus).toBe("not_deployed");
    expect(decision.remoteMutation).toBe(false);
    expect(decision.gitMutation).toBe(false);
    expect(decision.sqlExecuted).toBe(false);
    expect(decision.migrationsApplied).toBe(0);
    expect(decision.rowsCreated).toBe(0);
    expect(decision.recommendsSeparateFinalLiveRunGate).toBe(true);
  });

  test("credential requirements recommend an opaque staging provider and exact Supabase operation scope only", () => {
    const requirements = buildCredentialBoundaryRequirements();
    expect(requirements.credentialProviderRecommendation).toBe(POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_RECOMMENDED_CREDENTIAL_PROVIDER);
    expect(requirements.allowedCommandOperationIdentities).toEqual([
      "preflight_supabase_linked_project",
      "preflight_supabase_migration_history",
    ]);
    expect(requirements.allowedCommandOperationIdentities.some((operation) => operation.includes("git"))).toBe(false);
    expect(requirements.environmentPolicy.startsFromEmptyEnvironment).toBe(true);
    expect(requirements.environmentPolicy.arbitraryEnvironmentPassthrough).toBe(false);
    expect(requirements.environmentPolicy.secretSerialization).toBe(false);
    expect(requirements.rejectedProviderIdentities).toEqual(expect.arrayContaining([
      "caller",
      "manual",
      "pasted_token",
      "raw_environment",
      "source_control",
      "browser_login",
      "interactive_login",
      "unknown",
    ]));
  });

  test("canonical credential evidence uses only opaque non-secret metadata", () => {
    const evidence = buildCanonicalCredentialBoundaryEvidence();
    const serialized = JSON.stringify(evidence);

    expect(validateCredentialBoundaryEvidence(evidence).valid).toBe(true);
    expect(evidence.credentialHandleId).toBe(POST_TRADE_FIRST_LIVE_READ_ONLY_PREFLIGHT_CREDENTIAL_HANDLE_ID);
    expect(evidence.targetStagingProjectRef).toBe(POST_TRADE_STAGING_MIGRATION_PROJECT_REF);
    expect(evidence.secretValueAbsent).toBe(true);
    expect(evidence.nonExportable).toBe(true);
    expect(evidence.nonLoggable).toBe(true);
    expect(evidence.noInteractiveAuth).toBe(true);
    expect(evidence.browserLoginAllowed).toBe(false);
    expect(evidence.deviceCodeAuthAllowed).toBe(false);
    expect(evidence.cleanupRequired).toBe(true);
    expect(serialized).not.toMatch(/token[:=]|service_role|password|postgres:\/\/|authorization:\s*bearer|cookie[:=]|session[:=]|private key|client secret|bankid/i);
    expect(serialized).not.toContain("SUPABASE_ACCESS_TOKEN");
    expect(serialized).not.toContain("process.env");
  });

  test("credential boundary rejects secret material, unsafe providers, broad scope, production target, env-name drift, and unsafe lifecycle flags", () => {
    const canonical = buildCanonicalCredentialBoundaryEvidence();
    const cases = [
      { name: "raw token", input: { ...canonical, rawToken: "access token value" } },
      { name: "service-role key", input: { ...canonical, serviceRoleKey: "x" } },
      { name: "password", input: { ...canonical, databasePassword: "x" } },
      { name: "connection string", input: { ...canonical, connectionString: "postgres://example" } },
      { name: "authorization header", input: { ...canonical, authorizationHeader: "Authorization: Bearer abc" } },
      { name: "cookie", input: { ...canonical, cookie: "cookie=value" } },
      { name: "session", input: { ...canonical, sessionToken: "x" } },
      { name: "private key", input: { ...canonical, privateKey: "x" } },
      { name: "client secret", input: { ...canonical, clientSecret: "x" } },
      { name: "raw environment", input: { ...canonical, rawEnvironment: "x" } },
      { name: "source-control provider", input: credentialWithFingerprint({ ...canonical, credentialProviderIdentity: "source_control" as never }) },
      { name: "caller provider", input: credentialWithFingerprint({ ...canonical, credentialProviderIdentity: "caller" as never }) },
      { name: "pasted-token provider", input: credentialWithFingerprint({ ...canonical, credentialProviderIdentity: "pasted_token" as never }) },
      { name: "interactive-login provider", input: credentialWithFingerprint({ ...canonical, credentialProviderIdentity: "interactive_login" as never }) },
      { name: "browser-login provider", input: credentialWithFingerprint({ ...canonical, credentialProviderIdentity: "browser_login" as never }) },
      { name: "unknown provider", input: credentialWithFingerprint({ ...canonical, credentialProviderIdentity: "unknown" as never }) },
      { name: "expired", input: credentialWithFingerprint({ ...canonical, expiresAtIso: "2026-07-14T11:59:00.000Z" as never }) },
      { name: "revoked", input: credentialWithFingerprint({ ...canonical, revoked: true as never }) },
      { name: "production target", input: credentialWithFingerprint({ ...canonical, targetStagingProjectRef: POST_TRADE_STAGING_MIGRATION_REJECTED_PRODUCTION_REF as never }) },
      { name: "alternate project", input: credentialWithFingerprint({ ...canonical, targetStagingProjectRef: "aaaaaaaaaaaaaaaaaaaa" as never }) },
      { name: "broad scope", input: credentialWithFingerprint({ ...canonical, allowedCommandOperationIdentities: [...canonical.allowedCommandOperationIdentities, "preflight_git_current_branch"] }) },
      { name: "exportable", input: credentialWithFingerprint({ ...canonical, nonExportable: false as never }) },
      { name: "loggable", input: credentialWithFingerprint({ ...canonical, nonLoggable: false as never }) },
      { name: "missing cleanup", input: credentialWithFingerprint({ ...canonical, cleanupRequired: false as never }) },
      { name: "multiple session", input: credentialWithFingerprint({ ...canonical, singleSession: false as never }) },
      { name: "broad env", input: credentialWithFingerprint({ ...canonical, environmentPassthrough: "inherit" as never }) },
      { name: "caller selected env name", input: credentialWithFingerprint({ ...canonical, environmentEntryClassifications: { ...canonical.environmentEntryClassifications, CALLER_SELECTED_SECRET_ENV: "opaque_secret_injection" } }) },
      { name: "concrete access token env name", input: credentialWithFingerprint({ ...canonical, environmentEntryClassifications: { ...canonical.environmentEntryClassifications, CALLER_SELECTED_ACCESS_TOKEN_ENV: "opaque_secret_injection" } }) },
      { name: "generic ready boolean", input: { ...canonical, ready: true } },
      { name: "authentication success claim", input: { ...canonical, authenticationSuccess: true } },
      { name: "remote reachability claim", input: { ...canonical, remoteReachabilityVerified: true } },
    ];

    for (const item of cases) {
      expect(validateCredentialBoundaryEvidence(item.input).valid, item.name).toBe(false);
    }
  });

  test("CLI version policy is exact, conservative, and rejects ambiguous or unreviewed evidence", () => {
    const requirements = buildCliVersionRequirements();
    const canonical = buildCanonicalVersionEvidenceSet();
    expect(evaluateVersionEvidenceSet(canonical).valid).toBe(true);
    expect(requirements.noLatest).toBe(true);
    expect(requirements.noWildcardMajorVersion).toBe(true);
    expect(requirements.noUnboundedSemver).toBe(true);
    expect(requirements.noBuildMetadataAmbiguity).toBe(true);
    expect(requirements.noLexicalVersionComparison).toBe(true);
    expect(requirements.noCallerSelectedRange).toBe(true);
    expect(requirements.noEnvironmentOverride).toBe(true);
    expect(requirements.noPrereleaseAcceptance).toBe(true);
    expect(requirements.noImplicitNewerVersionAcceptance).toBe(true);
    expect(requirements.componentVersionPolicy.supabase_cli).toBe("exact_reviewed_version_required_initially");
    expect(requirements.componentVersionPolicy.git).toBe("narrow_reviewed_range_allowed_after_static_review");
    expect(requirements.components).toHaveLength(7);

    const first = canonical.evidence[0]!;
    const cases = [
      { name: "unknown git version", patch: { observedVersion: "unknown", compatibilityClassification: "unknown" } },
      { name: "unknown supabase version", patch: { componentIdentity: "supabase_cli", compatibilityClassification: "unknown" } },
      { name: "newer unreviewed", patch: { observedVersion: "supabase-cli-latest", compatibilityClassification: "unknown" } },
      { name: "wildcard major", patch: { observedVersion: "supabase-cli-2.x", compatibilityClassification: "unknown" } },
      { name: "unbounded range", patch: { observedVersion: ">=2", compatibilityClassification: "unknown" } },
      { name: "build metadata ambiguous", patch: { observedVersion: "supabase-cli-2.33+caller-build", compatibilityClassification: "ambiguous" } },
      { name: "lexical bypass", patch: { observedVersion: "supabase-cli-10-lexical-bypass", compatibilityClassification: "unknown" } },
      { name: "older unsupported", patch: { observedVersion: "supabase-cli-0.1", compatibilityClassification: "incompatible" } },
      { name: "prerelease", patch: { prerelease: true } },
      { name: "malformed", patch: { compatibilityClassification: "malformed" } },
      { name: "multiple lines", patch: { multipleVersionLines: true } },
      { name: "warning banner", patch: { warningBannerDetected: true } },
      { name: "truncated", patch: { truncated: true, compatibilityClassification: "ambiguous" } },
      { name: "wrapper", patch: { shellWrapper: true } },
      { name: "alias", patch: { alias: true } },
      { name: "caller selected path", patch: { callerSelectedPath: true } },
      { name: "parser mismatch", patch: { parserIdentity: "wrong_parser" } },
      { name: "collector mismatch", patch: { componentIdentity: "runner_collector", observedVersion: "wrong_collector" } },
      { name: "command registry mismatch", patch: { componentIdentity: "command_registry", observedVersion: "wrong_command_registry" } },
      { name: "catalog adapter mismatch", patch: { componentIdentity: "catalog_adapter", observedVersion: "wrong_catalog_adapter" } },
    ];

    for (const item of cases) {
      const changed = versionSetWithFingerprint({
        ...canonical,
        evidence: [{ ...first, ...item.patch } as never, ...canonical.evidence.slice(1)],
      });
      expect(evaluateVersionEvidenceSet(changed).valid, item.name).toBe(false);
    }
  });

  test("process policy is direct, bounded, no-shell, no-stdin, no-TTY, contained, and no-retry", () => {
    const policy = buildProcessExecutionRequirements();
    expect(validateProcessExecutionPolicy(policy).valid).toBe(true);
    expect(policy.shellDisabled).toBe(true);
    expect(policy.stdinClosed).toBe(true);
    expect(policy.ttyDisabled).toBe(true);
    expect(policy.detached).toBe(false);
    expect(policy.processGroupContainmentRequired).toBe(true);
    expect(policy.processTreeTerminationRequired).toBe(true);
    expect(policy.automaticRetryAllowed).toBe(false);
    expect(policy.allowedLifecycleTransitions).toEqual(expect.arrayContaining([
      "not_started->starting",
      "starting->running",
      "running->exited",
      "running->timed_out",
      "timed_out->termination_requested",
    ]));
    expect(policy.rejectedLifecycleTransitions).toEqual(expect.arrayContaining([
      "not_started->terminated",
      "exited->running",
      "terminated->running",
      "timed_out->starting",
      "ambiguous->completed_read_only",
      "interactive_prompt_detected->completed_read_only",
      "output_overflow->completed_read_only",
    ]));
    expect(policy.runnerInvocationCount).toBe(1);
    expect(policy.collectionSessionCount).toBe(1);
    expect(policy.deploymentOperations).toBe(0);
    expect(policy.sqlOperations).toBe(0);
    expect(policy.mutationOperations).toBe(0);
  });

  test("process policy rejects caller-raised limits, shell/TTY/stdin/detached mode, retry, extra sessions, and mutation scope", () => {
    const policy = buildProcessExecutionRequirements();
    const firstOperation = Object.keys(policy.timeoutMsByOperation)[0]!;
    const cases = [
      { name: "shell", input: processPolicyWithFingerprint({ ...policy, shellDisabled: false as never }) },
      { name: "stdin", input: processPolicyWithFingerprint({ ...policy, stdinClosed: false as never }) },
      { name: "tty", input: processPolicyWithFingerprint({ ...policy, ttyDisabled: false as never }) },
      { name: "detached", input: processPolicyWithFingerprint({ ...policy, detached: true as never }) },
      { name: "containment", input: processPolicyWithFingerprint({ ...policy, processTreeTerminationRequired: false as never }) },
      { name: "timeout", input: processPolicyWithFingerprint({ ...policy, timeoutMsByOperation: { ...policy.timeoutMsByOperation, [firstOperation]: 999999 } }) },
      { name: "stdout limit", input: processPolicyWithFingerprint({ ...policy, maxStdoutBytesByOperation: { ...policy.maxStdoutBytesByOperation, [firstOperation]: 999999 } }) },
      { name: "stderr limit", input: processPolicyWithFingerprint({ ...policy, maxStderrBytesByOperation: { ...policy.maxStderrBytesByOperation, [firstOperation]: 999999 } }) },
      { name: "lifecycle allowlist drift", input: processPolicyWithFingerprint({ ...policy, allowedLifecycleTransitions: [...policy.allowedLifecycleTransitions, "exited->running" as never] }) },
      { name: "lifecycle reject list drift", input: processPolicyWithFingerprint({ ...policy, rejectedLifecycleTransitions: policy.rejectedLifecycleTransitions.filter((transition) => transition !== "exited->running") }) },
      { name: "retry", input: processPolicyWithFingerprint({ ...policy, automaticRetryAllowed: true as never }) },
      { name: "multiple invocations", input: processPolicyWithFingerprint({ ...policy, runnerInvocationCount: 2 as never }) },
      { name: "multiple sessions", input: processPolicyWithFingerprint({ ...policy, collectionSessionCount: 2 as never }) },
      { name: "deployment", input: processPolicyWithFingerprint({ ...policy, deploymentOperations: 1 as never }) },
      { name: "sql", input: processPolicyWithFingerprint({ ...policy, sqlOperations: 1 as never }) },
      { name: "mutation", input: processPolicyWithFingerprint({ ...policy, mutationOperations: 1 as never }) },
    ];
    for (const item of cases) {
      expect(validateProcessExecutionPolicy(item.input).valid, item.name).toBe(false);
    }
  });

  test("process result evidence contains only fingerprints and blocks ambiguous output, prompts, secrets, and child processes", () => {
    const canonical = buildCanonicalProcessResultEvidence();
    expect(classifyProcessResultEvidence(canonical).valid).toBe(true);
    expect(canonical.rawStdoutPresent).toBe(false);
    expect(canonical.rawStderrPresent).toBe(false);
    expect(canonical.parentProcessExited).toBe(true);
    expect(canonical.directChildrenExited).toBe(true);
    expect(canonical.processGroupExited).toBe(true);
    expect(canonical.noDetachedDescendantsKnown).toBe(true);

    const cases = [
      { name: "timeout", input: { ...canonical, timeout: true, lifecycleState: "timed_out", resultClassification: "timed_out_termination_unconfirmed" } },
      { name: "completed with timeout", input: { ...canonical, timeout: true, resultClassification: "completed_read_only" } },
      { name: "graceful unconfirmed", input: { ...canonical, terminationConfirmed: false, resultClassification: "ambiguous" } },
      { name: "parent only termination", input: { ...canonical, directChildrenExited: false } },
      { name: "process group unconfirmed", input: { ...canonical, processGroupExited: false } },
      { name: "detached descendants unknown", input: { ...canonical, noDetachedDescendantsKnown: false } },
      { name: "wrong containment authority", input: { ...canonical, containmentAuthority: "parent_pid_only" } },
      { name: "wrong verification source", input: { ...canonical, terminationVerificationSource: "caller_asserted" } },
      { name: "child unconfirmed", input: { ...canonical, processTreeTerminationConfirmed: false, resultClassification: "ambiguous" } },
      { name: "detached child", input: { ...canonical, detached: true, resultClassification: "unexpected_child_process" } },
      { name: "surviving child", input: { ...canonical, childProcessCountClassification: "unknown", resultClassification: "ambiguous" } },
      { name: "browser child", input: { ...canonical, browserChildProcess: true, resultClassification: "unexpected_child_process" } },
      { name: "credential helper", input: { ...canonical, credentialHelperChildProcess: true, resultClassification: "unexpected_child_process" } },
      { name: "daemon", input: { ...canonical, daemonizationDetected: true, resultClassification: "unexpected_child_process" } },
      { name: "background", input: { ...canonical, backgroundChildDetected: true, resultClassification: "unexpected_child_process" } },
      { name: "login prompt", input: { ...canonical, promptDetected: true, resultClassification: "interactive_prompt_detected" } },
      { name: "gui", input: { ...canonical, guiLaunchDetected: true, resultClassification: "interactive_prompt_detected" } },
      { name: "url opener", input: { ...canonical, urlOpenerDetected: true, resultClassification: "interactive_prompt_detected" } },
      { name: "overflow", input: { ...canonical, outputOverflow: true, resultClassification: "output_overflow" } },
      { name: "truncation", input: { ...canonical, truncation: true, resultClassification: "ambiguous" } },
      { name: "secret", input: { ...canonical, secretDetected: true, resultClassification: "secret_material_detected" } },
      { name: "raw stdout", input: { ...canonical, rawStdoutPresent: true } },
      { name: "invalid timestamps", input: { ...canonical, startedAtIso: "2026-07-14T12:01:01.000Z", endedAtIso: "2026-07-14T12:01:00.000Z" } },
      { name: "personal path", input: { ...canonical, executableIdentity: "/Users/example/bin/supabase" } },
    ];
    for (const item of cases) {
      expect(classifyProcessResultEvidence(item.input).valid, item.name).toBe(false);
    }
  });

  test("boundary session and authorization compatibility reject mixed sessions and mismatched authorization metadata", () => {
    const input = buildCanonicalBoundaryReadinessInput();
    expect(validateBoundarySession(input.boundarySession).valid).toBe(true);
    expect(mapAuthorizationCompatibilityToExecutionBoundary(input).valid).toBe(true);

    const cases = [
      { name: "mixed sessions", input: readinessWithFingerprint({ ...input, versionEvidenceSet: versionSetWithFingerprint({ ...input.versionEvidenceSet, boundarySessionId: "other" as never }) }) },
      { name: "stale session", input: readinessWithFingerprint({ ...input, boundarySession: sessionWithFingerprint({ ...input.boundarySession, expiresAtIso: "2026-07-14T11:59:00.000Z" as never }) }) },
      { name: "future session", input: readinessWithFingerprint({ ...input, boundarySession: sessionWithFingerprint({ ...input.boundarySession, startedAtIso: "2026-07-14T12:02:00.000Z" as never }) }) },
      { name: "authorization mismatch", input: readinessWithFingerprint({ ...input, authorizationArtifact: { ...input.authorizationArtifact, authorizationArtifactId: "other" as never } }) },
      { name: "run mismatch", input: readinessWithFingerprint({ ...input, authorizationArtifact: { ...input.authorizationArtifact, preflightRunId: "other" as never } }) },
      { name: "operation mismatch", input: readinessWithFingerprint({ ...input, authorizationArtifact: { ...input.authorizationArtifact, preflightOperationId: "other" as never } }) },
      { name: "staging mismatch", input: readinessWithFingerprint({ ...input, boundarySession: sessionWithFingerprint({ ...input.boundarySession, stagingProjectRef: "aaaaaaaaaaaaaaaaaaaa" as never }) }) },
      { name: "production target", input: readinessWithFingerprint({ ...input, boundarySession: sessionWithFingerprint({ ...input.boundarySession, stagingProjectRef: POST_TRADE_STAGING_MIGRATION_REJECTED_PRODUCTION_REF as never }) }) },
      { name: "one shot false", input: readinessWithFingerprint({ ...input, authorizationArtifact: { ...input.authorizationArtifact, oneShot: false as never } }) },
      { name: "retry true", input: readinessWithFingerprint({ ...input, authorizationArtifact: { ...input.authorizationArtifact, automaticRetryAllowed: true as never } }) },
      { name: "invocation count", input: readinessWithFingerprint({ ...input, authorizationArtifact: { ...input.authorizationArtifact, expectedCounts: { ...input.authorizationArtifact.expectedCounts, runnerInvocations: 2 as never } } }) },
      { name: "collection count", input: readinessWithFingerprint({ ...input, authorizationArtifact: { ...input.authorizationArtifact, expectedCounts: { ...input.authorizationArtifact.expectedCounts, collectionSessions: 2 as never } } }) },
      { name: "deployment scope", input: readinessWithFingerprint({ ...input, authorizationArtifact: { ...input.authorizationArtifact, expectedCounts: { ...input.authorizationArtifact.expectedCounts, deploymentOperations: 1 as never } } }) },
      { name: "sql scope", input: readinessWithFingerprint({ ...input, authorizationArtifact: { ...input.authorizationArtifact, expectedCounts: { ...input.authorizationArtifact.expectedCounts, sqlOperations: 1 as never } } }) },
      { name: "mutation scope", input: readinessWithFingerprint({ ...input, authorizationArtifact: { ...input.authorizationArtifact, expectedCounts: { ...input.authorizationArtifact.expectedCounts, mutationOperations: 1 as never } } }) },
    ];
    for (const item of cases) {
      expect(evaluateCombinedBoundaryReadiness(item.input).ready, item.name).toBe(false);
    }
  });

  test("production references, unsupported values, cyclic input, partial fingerprints, and prefix fingerprints are rejected", () => {
    const input = buildCanonicalBoundaryReadinessInput();
    const cyclic: Record<string, unknown> = { ...input };
    cyclic.self = cyclic;

    const cases = [
      { name: "nested production ref", input: { ...input, nested: { project: POST_TRADE_STAGING_MIGRATION_REJECTED_PRODUCTION_REF } } },
      { name: "production URL", input: readinessWithFingerprint({ ...input, boundarySession: sessionWithFingerprint({ ...input.boundarySession, runnerContractIdentity: `https://${POST_TRADE_STAGING_MIGRATION_REJECTED_PRODUCTION_REF}.supabase.co` as never }) }) },
      { name: "production array", input: { ...input, refs: [POST_TRADE_STAGING_MIGRATION_REJECTED_PRODUCTION_REF] } },
      { name: "unsupported", input: { ...input, nested: new Map() } },
      { name: "cyclic", input: cyclic },
      { name: "partial fingerprint", input: { ...input, inputFingerprint: input.inputFingerprint.slice(0, 16) } },
      { name: "prefix fingerprint", input: { ...input, inputFingerprint: `${input.inputFingerprint.slice(0, 63)}x` } },
      { name: "malformed fingerprint", input: { ...input, inputFingerprint: "not-a-fingerprint" } },
    ];
    for (const item of cases) {
      expect(evaluateCombinedBoundaryReadiness(item.input).ready, item.name).toBe(false);
    }
  });

  test("fingerprints are deterministic and bind credential, version, process, session, and readiness fields", () => {
    const credential = buildCanonicalCredentialBoundaryEvidence();
    const versions = buildCanonicalVersionEvidenceSet();
    const policy = buildProcessExecutionRequirements();
    const session = buildBoundarySession();
    const input = buildCanonicalBoundaryReadinessInput();

    expect(buildCredentialBoundaryEvidenceFingerprint(credentialWithFingerprint(credential))).not.toBe(credential.evidenceFingerprint);
    expect(buildCredentialBoundaryEvidenceFingerprint({ ...credential, credentialPurpose: "other" })).not.toBe(credential.evidenceFingerprint);
    expect(buildVersionEvidenceSetFingerprint({ ...versions, evidence: versions.evidence.slice(1) })).not.toBe(versions.evidenceFingerprint);
    expect(buildProcessPolicyFingerprint({ ...policy, shellDisabled: false })).not.toBe(policy.policyFingerprint);
    expect(buildBoundarySessionFingerprint({ ...session, boundarySessionId: "other" })).not.toBe(session.sessionFingerprint);
    expect(buildBoundaryReadinessInputFingerprint({ ...input, inputId: "other" })).not.toBe(input.inputFingerprint);
    expect(credential.evidenceFingerprint).toMatch(/^[a-f0-9]{64}$/);
    expect(versions.evidenceFingerprint).toMatch(/^[a-f0-9]{64}$/);
    expect(policy.policyFingerprint).toMatch(/^[a-f0-9]{64}$/);
    expect(session.sessionFingerprint).toMatch(/^[a-f0-9]{64}$/);
    expect(input.inputFingerprint).toMatch(/^[a-f0-9]{64}$/);
  });

  test("validation and planning are side-effect free and the future plan is inert", () => {
    const input = buildCanonicalBoundaryReadinessInput();
    expect(evaluateCombinedBoundaryReadiness(input)).toEqual(evaluateCombinedBoundaryReadiness(input));
    expect(validateCredentialBoundaryEvidence(input.credentialEvidence)).toEqual(validateCredentialBoundaryEvidence(input.credentialEvidence));
    expect(evaluateVersionEvidenceSet(input.versionEvidenceSet)).toEqual(evaluateVersionEvidenceSet(input.versionEvidenceSet));
    expect(validateProcessExecutionPolicy(input.processPolicy)).toEqual(validateProcessExecutionPolicy(input.processPolicy));
    expect(classifyProcessResultEvidence(input.processResultEvidence)).toEqual(classifyProcessResultEvidence(input.processResultEvidence));

    const plan = buildInertFutureExecutionBoundaryPlan();
    const serialized = JSON.stringify(plan);
    expect(plan.runnerExecutionEnabled).toBe(false);
    expect(plan.containsCommandStrings).toBe(false);
    expect(plan.containsCredentials).toBe(false);
    expect(plan.containsSql).toBe(false);
    expect(plan.containsDeployment).toBe(false);
    expect(plan.containsRetry).toBe(false);
    expect(serialized).not.toMatch(/git\s+(status|diff|rev-parse)|supabase\s+(db|migration|link|status)|select\s+\*|insert\s+into|deploy\s+--|service_role|postgres:\/\//i);
  });

  test("source files do not read environment, access credentials, spawn processes, run commands, deploy, persist, consume, or wire API/UI", () => {
    const source = readFileSync(
      join(process.cwd(), "lib/post-trade-first-live-read-only-preflight-execution-boundary-contract.ts"),
      "utf8",
    );
    const api = readFileSync(join(process.cwd(), "app/api/post-trade/payload/validate/route.ts"), "utf8");
    const tradeUi = readFileSync(join(process.cwd(), "app/trade-app.tsx"), "utf8");

    expect(source).not.toMatch(/process\.env|node:child_process|from ["']child_process["']|spawn\(|exec\(|execFile\(|createClient\(|\.from\([^)]*\)\.(insert|update|delete|upsert)\(|\.rpc\(|supabase\s+(db|migration|link|status)|git\s+(status|diff|rev-parse)|select\s+\*|insert\s+into|deployMigration\(|consumeReadiness\(|consumeAuthorization\(|persist(State|Evidence)?\(|localStorage|sessionStorage|runAvanza|launchBrowser|browser\.newPage/i);
    expect(api).not.toContain("post-trade-first-live-read-only-preflight-execution-boundary-contract");
    expect(tradeUi).not.toContain("post-trade-first-live-read-only-preflight-execution-boundary-contract");
  });
});
