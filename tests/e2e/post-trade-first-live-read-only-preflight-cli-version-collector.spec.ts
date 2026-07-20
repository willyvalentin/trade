import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  buildCanonicalFixtureVersionEvidenceSet,
  buildCliVersionCollectorDefaultState,
  buildCliVersionComponentRegistry,
  buildCliVersionComponentRegistryFingerprint,
  buildCliVersionPolicyRegistry,
  buildCliVersionPolicyRegistryFingerprint,
  buildExecutableIdentityEvidence,
  buildExecutableIdentityFingerprint,
  buildInertCliVersionCollectionPlan,
  buildVersionEvidenceFromFixture,
  buildVersionEvidenceSet,
  buildVersionEvidenceSetFingerprint,
  buildVersionObservationRequest,
  buildVersionObservationRequestFingerprint,
  buildVersionObservationRequests,
  collectCliVersionEvidenceFromInjectedFixtureAdapter,
  evaluateVersionEvidenceSetBlockingReasons,
  parseGitVersionFixture,
  parseSupabaseVersionFixture,
  validateCliVersionCollectorAuthorizationCompatibility,
  validateCliVersionCollectorCredentialDesignCompatibility,
  validateCliVersionCollectorExecutionBoundaryCompatibility,
  validateCliVersionCollectorRunnerCompatibility,
  validateCliVersionComponentRegistry,
  validateCliVersionPolicyRegistry,
  validateExecutableIdentityEvidence,
  validateFixtureVersionObservation,
  validateVersionEvidence,
  validateVersionEvidenceSet,
  validateVersionObservationRequest,
  type ComponentIdentity,
  type FixtureVersionObservation,
  type VersionObservationRequest,
} from "../../lib/post-trade-first-live-read-only-preflight-cli-version-collector-core";

const repoRoot = process.cwd();
const corePath = "lib/post-trade-first-live-read-only-preflight-cli-version-collector-core.ts";
const boundaryPath = "lib/post-trade-first-live-read-only-preflight-cli-version-collector.ts";
const apiPath = "app/api/post-trade/payload/validate/route.ts";
const tradeUiPath = "app/trade-app.tsx";

function source(path: string) {
  return readFileSync(join(repoRoot, path), "utf8");
}

function withRegistryFingerprint(input: Record<string, unknown>) {
  const core = { ...input };
  delete core.registryFingerprint;
  delete core.registryFingerprintAlgorithm;
  return { ...input, registryFingerprintAlgorithm: "sha256" as const, registryFingerprint: buildCliVersionComponentRegistryFingerprint(core) };
}

function withPolicyFingerprint(input: Record<string, unknown>) {
  const core = { ...input };
  delete core.policyFingerprint;
  delete core.policyFingerprintAlgorithm;
  return { ...input, policyFingerprintAlgorithm: "sha256" as const, policyFingerprint: buildCliVersionPolicyRegistryFingerprint(core) };
}

function withRequestFingerprint(input: Record<string, unknown>) {
  const core = { ...input };
  delete core.requestFingerprint;
  delete core.requestFingerprintAlgorithm;
  return { ...input, requestFingerprintAlgorithm: "sha256" as const, requestFingerprint: buildVersionObservationRequestFingerprint(core) };
}

function withExecutableFingerprint(input: Record<string, unknown>) {
  const core = { ...input };
  delete core.evidenceFingerprint;
  delete core.evidenceFingerprintAlgorithm;
  return { ...input, evidenceFingerprintAlgorithm: "sha256" as const, evidenceFingerprint: buildExecutableIdentityFingerprint(core) };
}

function fixture(
  request: VersionObservationRequest,
  output: string,
  patch: Partial<FixtureVersionObservation> = {},
): FixtureVersionObservation {
  const external = request.componentIdentity === "git_cli" || request.componentIdentity === "supabase_cli";
  const executableComponent = request.componentIdentity as "git_cli" | "supabase_cli";
  return {
    requestId: request.requestId,
    componentIdentity: request.componentIdentity,
    executableIdentity: external ? buildExecutableIdentityEvidence(executableComponent) : null,
    stdoutFingerprint: "a".repeat(64),
    stderrFingerprint: "b".repeat(64),
    stdoutByteCount: output.length,
    stderrByteCount: 0,
    stdoutTruncated: false,
    stderrTruncated: false,
    timedOut: false,
    outputOverflow: false,
    promptDetected: false,
    warningBannerDetected: false,
    observedAtIso: "2026-07-15T10:00:30.000Z",
    parserInputClassification: external ? "fixture_transient_output" : "source_controlled_internal_identity",
    fixtureOutput: output,
    ...patch,
  };
}

test.describe("post-trade first-live CLI-version evidence collector contract", () => {
  test("default collector and imports remain not-run, server-only at boundary, and no live command capable", () => {
    const state = buildCliVersionCollectorDefaultState();
    const coreSource = source(corePath);
    const boundarySource = source(boundaryPath);
    const apiSource = source(apiPath);
    const tradeUiSource = source(tradeUiPath);

    expect(state.collectorStatus).toBe("not_run");
    expect(state.versionCommandsExecuted).toBe(0);
    expect(state.versionsObservedLive).toBe(false);
    expect(state.executableIdentitiesVerifiedLive).toBe(false);
    expect(state.runnerExecutionEnabled).toBe(false);
    expect(state.preflightRunStatus).toBe("not_run");
    expect(state.deploymentEnabled).toBe(false);
    expect(state.remoteMutation).toBe(false);
    expect(state.sqlExecuted).toBe(false);
    expect(state.migrationsApplied).toBe(0);
    expect(state.rowsCreated).toBe(0);
    expect(boundarySource).toContain('import "server-only"');
    expect(coreSource).not.toMatch(/process\.env|child_process|spawn\(|exec\(|execFile\(|execSync|spawnSync|git --version|supabase --version|which |where |readFile|readdir|createClient\(|insert\s*\(|upsert\s*\(|rpc\s*\(/);
    expect(boundarySource).not.toMatch(/child_process|spawn\(|exec\(|createClient\(|insert\s*\(|upsert\s*\(|rpc\s*\(/);
    expect(apiSource).not.toContain("post-trade-first-live-read-only-preflight-cli-version-collector");
    expect(tradeUiSource).not.toContain("post-trade-first-live-read-only-preflight-cli-version-collector");
  });

  test("injected fixture adapter is narrow, is not called on import or construction, and rejects self-asserted or raw fields", async () => {
    let calls = 0;
    const requests = buildVersionObservationRequests();
    const byComponent = new Map<ComponentIdentity, string>([
      ["git_cli", "git version 2.45.1\n"],
      ["supabase_cli", "0.0.0\n"],
    ]);
    expect(calls).toBe(0);
    const result = await collectCliVersionEvidenceFromInjectedFixtureAdapter(async (request) => {
      calls += 1;
      const componentVersion = buildCliVersionComponentRegistry().components.find((item) => item.componentIdentity === request.componentIdentity)?.componentContractVersion;
      return fixture(request, byComponent.get(request.componentIdentity) ?? `${componentVersion}\n`);
    });
    expect(calls).toBe(requests.length);
    expect(result.valid).toBe(true);
    expect(result.adapterInvoked).toBe(true);
    expect(result.versionCommandsExecuted).toBe(0);
    expect(result.observedLive).toBe(false);
    expect(result.evidenceSet?.versionsObservedLive).toBe(false);
    expect(result.evidenceSet?.compatibilityClassification).toBe("unresolved");

    const git = buildVersionObservationRequest("git_cli");
    const canonicalFixture = fixture(git, "git version 2.45.1\n");
    expect(validateFixtureVersionObservation(git, canonicalFixture).valid).toBe(true);
    expect(validateFixtureVersionObservation(git, { ...canonicalFixture, extra: true }).blockingReasons).toContain("unknown_fixture_field:extra");
    expect(validateFixtureVersionObservation(git, { ...canonicalFixture, authoritative: true }).blockingReasons).toContain("self_asserted_authority_or_compatibility");
    expect(validateFixtureVersionObservation(git, { ...canonicalFixture, rawStdout: "git version 2.45.1\n" }).blockingReasons).toContain("unknown_fixture_field:rawStdout");
    expect(validateFixtureVersionObservation(git, { ...canonicalFixture, executablePath: "/Users/local/bin/git" }).blockingReasons).toContain("secret_or_sensitive_material_present");
  });

  test("canonical component and policy registries are exact and reject unknown, duplicate, broad, latest, wildcard, environment override, and caller range policy", () => {
    const registry = buildCliVersionComponentRegistry();
    const policy = buildCliVersionPolicyRegistry();
    expect(validateCliVersionComponentRegistry(registry).valid).toBe(true);
    expect(validateCliVersionPolicyRegistry(policy).valid, JSON.stringify(validateCliVersionPolicyRegistry(policy).blockingReasons)).toBe(true);
    expect(registry.components.map((item) => item.componentIdentity)).toEqual([
      "git_cli",
      "supabase_cli",
      "preflight_collector",
      "runner_contract",
      "runner_implementation",
      "parser_registry",
      "command_registry",
      "catalog_adapter_contract",
      "normalization_policy",
      "evidence_source_registry",
      "process_executor_contract",
    ]);
    expect(policy.policies.find((item) => item.componentIdentity === "supabase_cli")?.policyState).toBe("unresolved");
    expect(policy.policies.find((item) => item.componentIdentity === "git_cli")?.policyState).toBe("reviewed_narrow_range");

    expect(validateCliVersionComponentRegistry(withRegistryFingerprint({ ...registry, components: registry.components.slice(1) })).valid).toBe(false);
    expect(validateCliVersionComponentRegistry(withRegistryFingerprint({ ...registry, components: [...registry.components, registry.components[0]!] })).valid).toBe(false);
    expect(validateCliVersionComponentRegistry({ ...registry, components: [...registry.components, { componentIdentity: "unknown", componentKind: "external_executable" }] }).valid).toBe(false);

    const unsafePolicies = [
      { latestAllowed: true },
      { wildcardAllowed: true },
      { openEndedRangeAllowed: true },
      { callerSuppliedRangeAllowed: true },
      { environmentOverrideAllowed: true },
      { lexicalComparisonAllowed: true },
      { automaticNewerAcceptanceAllowed: true },
      { prereleaseAllowed: true },
      { buildMetadataAllowed: true },
      { exactVersion: "latest" },
      { exactVersion: "2.x" },
      { exactVersion: ">=2" },
      { exactVersion: "1.2.3+build" },
      { exactVersion: "1.2.3-beta" },
    ];
    for (const patch of unsafePolicies) {
      const policies = policy.policies.map((item, index) => index === 0 ? { ...item, ...patch } : item);
      expect(validateCliVersionPolicyRegistry(withPolicyFingerprint({ ...policy, policies })).valid, JSON.stringify(patch)).toBe(false);
    }
    expect(validateCliVersionPolicyRegistry(withPolicyFingerprint({ ...policy, fallbackPolicyAllowed: true })).valid).toBe(false);
    const invalidRangePolicies = policy.policies.map((item) => item.componentIdentity === "git_cli" ? { ...item, minVersionInclusive: "2.50.0", maxVersionExclusive: "2.39.0" } : item);
    expect(validateCliVersionPolicyRegistry(withPolicyFingerprint({ ...policy, policies: invalidRangePolicies })).blockingReasons).toContain("invalid_narrow_range_order");
  });

  test("version requests are read-only exact metadata and reject command strings, arbitrary flags, executable paths, and unsafe execution surfaces", () => {
    const requests = buildVersionObservationRequests();
    const git = buildVersionObservationRequest("git_cli");
    expect(requests).toHaveLength(11);
    expect(validateVersionObservationRequest(git).valid, JSON.stringify(validateVersionObservationRequest(git).blockingReasons)).toBe(true);
    expect(git.rawCommandStringAbsent).toBe(true);
    expect(git.executablePathAbsent).toBe(true);
    expect(git.arbitraryFlagsAllowed).toBe(false);
    expect(git.readOnly).toBe(true);
    expect(git.stdinClosed).toBe(true);
    expect(git.ttyDisabled).toBe(true);
    expect(git.shellDisabled).toBe(true);
    expect(JSON.stringify(git)).not.toMatch(/git --version|supabase --version|\/Users\/|\/home\/|PATH=|process\.env/i);

    const cases = [
      { command: "git --version" },
      { args: ["--version"] },
      { executablePath: "/Users/local/bin/git" },
      { rawCommandStringAbsent: false },
      { executablePathAbsent: false },
      { arbitraryFlagsAllowed: true },
      { readOnly: false },
      { stdinClosed: false },
      { ttyDisabled: false },
      { shellDisabled: false },
      { unknownField: true },
      { timeoutPolicyIdentity: "caller_raised_timeout" },
      { outputLimitPolicyIdentity: "caller_raised_output_limit" },
      { multipleOperations: ["git_cli", "supabase_cli"] },
    ];
    for (const patch of cases) {
      expect(validateVersionObservationRequest(withRequestFingerprint({ ...git, ...patch })).valid, JSON.stringify(patch)).toBe(false);
    }
  });

  test("executable identities reject aliases, shell functions, wrappers, script proxies, caller paths, symlink uncertainty, production wrappers, and public paths", () => {
    const identity = buildExecutableIdentityEvidence("git_cli");
    expect(validateExecutableIdentityEvidence(identity).valid).toBe(true);
    expect(identity.sanitizedResolvedIdentityFingerprint).toMatch(/^[a-f0-9]{64}$/);
    expect(JSON.stringify(identity)).not.toMatch(/\/Users\/|\/home\/|PATH=|alias |function /i);

    for (const classification of ["alias", "shell_function", "wrapper", "script_proxy", "caller_selected_path", "unknown_symlink", "production_wrapper", "malformed", "ambiguous"] as const) {
      expect(validateExecutableIdentityEvidence(withExecutableFingerprint({ ...identity, resolvedIdentityClassification: classification })).valid, classification).toBe(false);
    }
    expect(validateExecutableIdentityEvidence({ ...identity, executablePath: "/Users/local/bin/git" }).valid).toBe(false);
    expect(validateExecutableIdentityEvidence({ ...identity, pathContents: "PATH=/secret/bin" }).valid).toBe(false);
  });

  test("Git and Supabase fixture parsers accept only exact single-line semver formats and reject prompts, URLs, warnings, ANSI, control chars, prerelease, build metadata, and lexical bypasses", () => {
    expect(parseGitVersionFixture("git version 2.45.1\n").valid).toBe(true);
    expect(parseSupabaseVersionFixture("2.33.7\n").valid).toBe(true);
    const gitBad = [
      "",
      "git 2.45.1\n",
      "git version 2.45.1\nextra\n",
      "warning: git version 2.45.1\n",
      "\u001b[31mgit version 2.45.1\n",
      "git version 2.45.1\u0000\n",
      "git version 2.45.1 https://example.test\n",
      "git version 2.45.1 /usr/local/bin/git\n",
      " git version 2.45.1\n",
      "git version 2.45.1 \n",
      "git version 2.45.1\u2028\n",
      "git version access token value\n",
      "git version eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjMifQ.signature\n",
      "git version 2.45.1-beta\n",
      "git version 2.45.1+build\n",
      "git version 2.045.1\n",
      "git version 10.x.1\n",
      "git version -1.2.3\n",
      "git version +1.2.3\n",
      "git version 1.2\n",
      "git version 1.2.3.4\n",
      "git version 1.two.3\n",
      "git version 10000.2.3\n",
      `git version ${"1".repeat(33)}.2.3\n`,
      `${"git version 2.45.1 ".repeat(8)}\n`,
    ];
    for (const item of gitBad) expect(parseGitVersionFixture(item).valid, item).toBe(false);
    const supabaseBad = [
      "",
      "supabase 2.33.7\n",
      "2.33.7\nupdate available\n",
      "warning 2.33.7\n",
      "login required\n",
      "token prompt\n",
      "2.33.7 https://example.test\n",
      "2.33.7 /usr/local/bin/supabase\n",
      "v2.33.7\n",
      "2.33.7-beta\n",
      "2.33.7+build\n",
      "2.033.7\n",
      "2.x.7\n",
      "2.33\n",
      "2.33.7.1\n",
    ];
    for (const item of supabaseBad) expect(parseSupabaseVersionFixture(item).valid, item).toBe(false);
  });

  test("fixture evidence is sanitized, non-live, deterministic, and unresolved Supabase policy blocks future readiness", () => {
    const set = buildCanonicalFixtureVersionEvidenceSet();
    expect(validateVersionEvidenceSet(set).valid, JSON.stringify(validateVersionEvidenceSet(set).blockingReasons)).toBe(true);
    expect(set.collectorStatus).toBe("fixture_evaluated");
    expect(set.versionsObservedLive).toBe(false);
    expect(set.executableIdentitiesVerifiedLive).toBe(false);
    expect(set.runnerExecutionEnabled).toBe(false);
    expect(set.deploymentEnabled).toBe(false);
    expect(set.remoteMutation).toBe(false);
    expect(set.sqlExecuted).toBe(false);
    expect(set.migrationsApplied).toBe(0);
    expect(set.rowsCreated).toBe(0);
    expect(set.compatibilityClassification).toBe("unresolved");
    expect(set.blockingReasons).toContain("unresolved_external_policy");
    expect(JSON.stringify(set)).not.toMatch(/rawStdout|rawStderr|\/Users\/|\/home\/|PATH=|service[_ -]?role|password|postgres:\/\//i);
    for (const evidence of set.evidence) {
      expect(evidence.observedLive).toBe(false);
      expect(evidence.versionCommandsExecuted).toBe(0);
      expect(validateVersionEvidence(evidence).valid, evidence.componentIdentity).toBe(true);
    }
    expect(buildVersionEvidenceSetFingerprint(set)).toBe(buildVersionEvidenceSetFingerprint(buildCanonicalFixtureVersionEvidenceSet()));
    expect(validateVersionEvidenceSet({ ...set, evidenceFingerprint: set.evidenceFingerprint.slice(0, 16) }).valid).toBe(false);
    expect(validateVersionEvidenceSet({ ...set, evidenceFingerprint: `${set.evidenceFingerprint.slice(0, 63)}x` }).valid).toBe(false);
  });

  test("ambiguous observations, missing components, mixed sessions, incompatible components, and sensitive fields block readiness without majority vote", () => {
    const gitRequest = buildVersionObservationRequest("git_cli");
    const gitEvidence = buildVersionEvidenceFromFixture(gitRequest, fixture(gitRequest, "git version 2.45.1\n"));
    const timeoutEvidence = buildVersionEvidenceFromFixture(gitRequest, fixture(gitRequest, "git version 2.45.1\n", { timedOut: true }));
    expect(timeoutEvidence.compatibilityClassification).toBe("ambiguous");
    const truncatedEvidence = buildVersionEvidenceFromFixture(gitRequest, fixture(gitRequest, "git version 2.45.1\n", { stdoutTruncated: true }));
    expect(truncatedEvidence.compatibilityClassification).toBe("ambiguous");
    const wrapperEvidence = buildVersionEvidenceFromFixture(gitRequest, fixture(gitRequest, "git version 2.45.1\n", {
      executableIdentity: buildExecutableIdentityEvidence("git_cli", "wrapper"),
    }));
    expect(wrapperEvidence.compatibilityClassification).toBe("ambiguous");

    const canonical = buildCanonicalFixtureVersionEvidenceSet();
    expect(evaluateVersionEvidenceSetBlockingReasons(canonical.evidence.filter((item) => item.componentIdentity !== "git_cli"))).toContain("missing_component:git_cli");
    expect(evaluateVersionEvidenceSetBlockingReasons([...canonical.evidence, canonical.evidence[0]!])).toContain("duplicate_component_evidence:git_cli");
    expect(evaluateVersionEvidenceSetBlockingReasons(canonical.evidence.map((item, index) => index === 0 ? { ...item, boundarySessionId: "other" as never } : item))).toContain("mixed_boundary_sessions");
    expect(evaluateVersionEvidenceSetBlockingReasons(canonical.evidence.map((item, index) => index === 0 ? { ...item, compatibilityClassification: "incompatible" as const } : item))).toContain("component_not_compatible:git_cli");
    expect(evaluateVersionEvidenceSetBlockingReasons(canonical.evidence.map((item, index) => index === 0 ? { ...item, compatibilityClassification: "stale" as const } : item))).toContain("stale_component:git_cli");
    expect(evaluateVersionEvidenceSetBlockingReasons(canonical.evidence.map((item, index) => index === 0 ? { ...item, compatibilityClassification: "malformed" as const } : item))).toContain("malformed_component:git_cli");
    expect(evaluateVersionEvidenceSetBlockingReasons(canonical.evidence.map((item, index) => index === 0 ? { ...item, compatibilityClassification: "ambiguous" as const } : item))).toContain("ambiguous_component:git_cli");
    expect(buildVersionEvidenceSet([...canonical.evidence, canonical.evidence[0]!]).compatibilityClassification).toBe("incompatible");
    expect(validateVersionEvidence({ ...gitEvidence, serviceRoleKey: "x" }).valid).toBe(false);
    expect(validateVersionEvidence({ ...gitEvidence, pathDump: "PATH=/Users/local/bin" }).valid).toBe(false);
    expect(parseSupabaseVersionFixture("1.2.3\n").valid).toBe(true);
  });

  test("compatibility validators preserve authorization, execution boundary, runner, and credential-design bindings without live access", () => {
    expect(validateCliVersionCollectorAuthorizationCompatibility().valid).toBe(true);
    expect(validateCliVersionCollectorExecutionBoundaryCompatibility().valid).toBe(true);
    expect(validateCliVersionCollectorRunnerCompatibility().valid).toBe(true);
    expect(validateCliVersionCollectorCredentialDesignCompatibility().valid).toBe(true);
  });

  test("inert future plan contains no command string, executable path, secret, SQL, deployment, retry, environment, or persistence", () => {
    const plan = buildInertCliVersionCollectionPlan();
    const serialized = JSON.stringify(plan);
    expect(plan.containsCommandString).toBe(false);
    expect(plan.containsExecutablePath).toBe(false);
    expect(plan.containsCredential).toBe(false);
    expect(plan.containsSql).toBe(false);
    expect(plan.containsDeployment).toBe(false);
    expect(plan.containsRetry).toBe(false);
    expect(plan.inspectsPath).toBe(false);
    expect(plan.readsEnvironment).toBe(false);
    expect(plan.spawnsProcess).toBe(false);
    expect(plan.runsGit).toBe(false);
    expect(plan.runsSupabase).toBe(false);
    expect(plan.consumesAuthorization).toBe(false);
    expect(plan.persistsEvidence).toBe(false);
    expect(serialized).not.toMatch(/git --version|supabase --version|\/Users\/|\/home\/|PATH=|service[_ -]?role|password|postgres:\/\/|select\s+\*|insert\s+into|deploy\s+|deploy\(|retry\s+|retry\(/i);
  });
});
