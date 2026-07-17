import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  buildCompatibilitySummary,
  buildCredentialCapabilityPolicy,
  buildCwdCapabilityFingerprint,
  buildDriverDesignFingerprint,
  buildDriverLifecyclePolicy,
  buildDriverResultFingerprint,
  buildEnvironmentConstructionPolicy,
  buildExecutableCapabilityEvidence,
  buildExecutableCapabilityFingerprint,
  buildExecutableResolverPolicy,
  buildArchitectureCompatibilityPolicy,
  buildArchitecturePolicyFingerprint,
  buildInstancePolicyFingerprint,
  buildInertLiveMacosDriverImplementationPlan,
  buildLiveMacosProcessDriverDesign,
  buildOutputCapturePolicy,
  buildOutputDecoderPolicy,
  buildProcessObserverPolicy,
  buildProcessInstanceMetadataPolicy,
  buildSanitizedDriverResult,
  buildSpawnPolicy,
  buildTocTouPolicyFingerprint,
  buildTocTouRevalidationPolicy,
  buildTerminationPolicy,
  buildTimeoutMonitoringPolicy,
  buildWorkingDirectoryCapability,
  validateArchitectureCompatibilityPolicy,
  validateCompatibilitySummary,
  validateCredentialCapabilityPolicy,
  validateDriverLifecyclePolicy,
  validateDriverLifecycleTransitions,
  validateEnvironmentConstructionPolicy,
  validateExecutableCapabilityEvidence,
  validateExecutableResolverPolicy,
  validateInertLiveMacosDriverImplementationPlan,
  validateLiveMacosProcessDriverDesign,
  validateProcessInstanceMetadataPolicy,
  validateOutputCapturePolicy,
  validateOutputDecoderPolicy,
  validateProcessObserverPolicy,
  validateSanitizedDriverResult,
  validateSpawnPolicy,
  validateTocTouRevalidationPolicy,
  validateTerminationPolicy,
  validateTimeoutMonitoringPolicy,
  validateWorkingDirectoryCapability,
} from "../../lib/post-trade-live-read-only-macos-process-driver-design";

const repoRoot = process.cwd();
const designPath = "lib/post-trade-live-read-only-macos-process-driver-design.ts";
const apiPath = "app/api/post-trade/payload/validate/route.ts";
const tradeUiPath = "app/trade-app.tsx";

function source(path: string) {
  return readFileSync(join(repoRoot, path), "utf8");
}

test.describe("post-trade live read-only macOS process driver design", () => {
  test("canonical design is valid, macOS-only, staging-only, no-run, read-only, one-process, no-retry, and contains no public runtime material", () => {
    const design = buildLiveMacosProcessDriverDesign();
    expect(validateLiveMacosProcessDriverDesign(design).valid).toBe(true);
    expect(design).toMatchObject({
      platform: "macos",
      genericCrossPlatformDriver: false,
      targetStagingProjectRef: "pdvzyuhykomwfqyyztru",
      rejectedProductionProjectRef: "ekdyopdrrkphlrsilyoo",
      directSpawnOnly: true,
      shellDisabled: true,
      detached: false,
      stdinClosed: true,
      ttyDisabled: true,
      pseudoTtyDisabled: true,
      automaticRetryAllowed: false,
      oneProcessAtATime: true,
      oneBoundarySession: true,
      globalProcessEnumerationAllowed: false,
      arbitraryExecutableAllowed: false,
      arbitraryArgumentsAllowed: false,
      arbitraryEnvironmentAllowed: false,
      deploymentCapability: false,
      noRunInDesign: true,
      environmentSelectedDriverAllowed: false,
      callerSelectedDriverAllowed: false,
      automaticPlatformFallbackAllowed: false,
      liveExecutableVerificationClaim: false,
      liveFilesystemIdentityClaim: false,
      liveProcessStartedClaim: false,
      liveProcessObservedClaim: false,
      liveContainmentVerifiedClaim: false,
      liveTerminationVerifiedClaim: false,
      liveCleanupVerifiedClaim: false,
      commandBehaviorProvenReadOnlyClaim: false,
    });
    expect(JSON.stringify(design)).not.toMatch(/executablePath|cwdPath|\/Users\/|processGroupId|pid|credential|secret|rawStdout|rawStderr/i);

    for (const patch of [
      { platform: "linux" },
      { genericCrossPlatformDriver: true },
      { noRunInDesign: false },
      { targetStagingProjectRef: "ekdyopdrrkphlrsilyoo" },
      { shellDisabled: false },
      { detached: true },
      { stdinClosed: false },
      { ttyDisabled: false },
      { pseudoTtyDisabled: false },
      { automaticRetryAllowed: true },
      { globalProcessEnumerationAllowed: true },
      { arbitraryExecutableAllowed: true },
      { arbitraryArgumentsAllowed: true },
      { arbitraryEnvironmentAllowed: true },
      { deploymentCapability: true },
      { environmentSelectedDriverAllowed: true },
      { callerSelectedDriverAllowed: true },
      { automaticPlatformFallbackAllowed: true },
      { liveExecutableVerificationClaim: true },
      { liveFilesystemIdentityClaim: true },
      { liveProcessStartedClaim: true },
      { liveProcessObservedClaim: true },
      { liveContainmentVerifiedClaim: true },
      { liveTerminationVerifiedClaim: true },
      { liveCleanupVerifiedClaim: true },
      { commandBehaviorProvenReadOnlyClaim: true },
      { designId: "reviewed_macos_read_only_preflight_process_driver_v1_suffix" },
      { designId: "REVIEWED_MACOS_READ_ONLY_PREFLIGHT_PROCESS_DRIVER_V1" },
    ]) {
      expect(validateLiveMacosProcessDriverDesign({ ...design, ...patch }).valid, JSON.stringify(patch)).toBe(false);
    }
  });

  test("architecture policy and TOCTOU policy reject generic architecture, unknown translation, fallback, and complete-elimination claims", () => {
    const architecture = buildArchitectureCompatibilityPolicy();
    const toctou = buildTocTouRevalidationPolicy();
    expect(validateArchitectureCompatibilityPolicy(architecture).valid).toBe(true);
    expect(validateTocTouRevalidationPolicy(toctou).valid).toBe(true);
    expect(architecture).toMatchObject({
      platform: "macos",
      supportedHostArchitectures: ["arm64", "x64"],
      supportedExecutableArchitectures: ["arm64", "x64", "universal"],
      rosettaTranslatedExecutionRequiresReview: true,
      unknownArchitectureAllowed: false,
      unknownTranslationAllowed: false,
      genericArchitectureAllowed: false,
      architectureFallbackAllowed: false,
    });
    for (const patch of [
      { platform: "linux" },
      { platform: "windows" },
      { supportedHostArchitectures: ["arm64", "x64", "any"] },
      { supportedExecutableArchitectures: ["arm64", "x64", "universal", "any"] },
      { hostArchitectureEvidenceRequired: false },
      { executableArchitectureEvidenceRequired: false },
      { translationClassificationRequired: false },
      { rosettaTranslatedExecutionRequiresReview: false },
      { unknownArchitectureAllowed: true },
      { unknownTranslationAllowed: true },
      { genericArchitectureAllowed: true },
      { architectureFallbackAllowed: true },
    ]) {
      expect(validateArchitectureCompatibilityPolicy({ ...architecture, ...patch }).valid, JSON.stringify(patch)).toBe(false);
    }
    for (const patch of [
      { stableFileIdentityRecheckRequired: false },
      { sizeRecheckRequired: false },
      { modificationStateRecheckRequired: false },
      { ownershipRecheckRequired: false },
      { fileTypeRecheckRequired: false },
      { architectureRecheckRequired: false },
      { optionalDigestRecheckWhenAvailable: false },
      { sameBoundarySessionRequired: false },
      { sameDriverInstanceRequired: false },
      { cwdIdentityRecheckRequired: false },
      { operationRegistryRecheckRequired: false },
      { processPolicyRecheckRequired: false },
      { completeEliminationClaimed: true },
      { raceStillPossible: false },
    ]) {
      expect(validateTocTouRevalidationPolicy({ ...toctou, ...patch }).valid, JSON.stringify(patch)).toBe(false);
    }
    expect(buildArchitecturePolicyFingerprint({ ...architecture, architectureFingerprint: undefined })).not.toBe(architecture.architectureFingerprint);
    expect(buildTocTouPolicyFingerprint({ ...toctou, toctouFingerprint: undefined })).not.toBe(toctou.toctouFingerprint);
  });

  test("source remains pure design only: no process, filesystem, env, Git, Supabase, SQL, deployment, API, UI, Avanza, or browser automation wiring", () => {
    const designSource = source(designPath);
    const apiAndUi = `${source(apiPath)}\n${source(tradeUiPath)}`;
    expect(designSource).not.toMatch(/node:child_process|from ["']child_process["']|require\(["']child_process["']\)|spawn\(|exec\(|execFile|execSync|spawnSync|process\.env|readFileSync|readdir|statSync|lstatSync|realpathSync|@supabase|createClient\(|\.insert\(|\.upsert\(|\.rpc\(|storage\.|supabase\s+--version|git\s+--version|ps\s+-|kill\(|osascript|open\s+/i);
    expect(designSource).not.toMatch(/from ["']@\/app|from ["']@\/components|trade-app|avanza|browser automation/i);
    expect(apiAndUi).not.toContain("post-trade-live-read-only-macos-process-driver-design");
  });

  test("executable resolver and capability design rejects aliases, wrappers, shell functions, script proxies, symlinks, multiple matches, writable locations, production wrappers, unsupported architecture, stale or changed capabilities, and public paths", () => {
    const resolver = buildExecutableResolverPolicy();
    expect(validateExecutableResolverPolicy(resolver).valid).toBe(true);
    expect(resolver.executableIdentities).toEqual(["git_cli", "supabase_cli"]);
    for (const patch of [
      { callerSelectedPathAllowed: true },
      { inheritedPathOnlyAllowed: true },
      { shellAliasAllowed: true },
      { shellFunctionAllowed: true },
      { wrapperAllowed: true },
      { scriptProxyAllowed: true },
      { unreviewedSymlinkAllowed: true },
      { multipleMatchesAllowed: true },
      { worldWritableExecutableAllowed: true },
      { worldWritableDirectoryAllowed: true },
      { productionWrapperAllowed: true },
      { publicAbsolutePathAllowed: true },
      { deviceInodePublicEvidenceAllowed: true },
      { shellLookupAllowed: true },
      { whichLookupAllowed: true },
      { commandVLookupAllowed: true },
      { packageManagerShimAllowedWithoutReview: true },
    ]) {
      expect(validateExecutableResolverPolicy({ ...resolver, ...patch }).valid, JSON.stringify(patch)).toBe(false);
    }

    const git = buildExecutableCapabilityEvidence("git_cli");
    const supabase = buildExecutableCapabilityEvidence("supabase_cli");
    expect(validateExecutableCapabilityEvidence(git).valid).toBe(true);
    expect(validateExecutableCapabilityEvidence(supabase).valid).toBe(true);
    expect(git.expectedBasename).toBe("git");
    expect(supabase.expectedBasename).toBe("supabase");
    expect(JSON.stringify([git, supabase])).not.toMatch(/\/Users\/|executablePath"\s*:|credentialValue|secretValue/i);

    for (const patch of [
      { status: "blocked_ambiguous" },
      { status: "blocked_changed_before_spawn" },
      { status: "blocked_stale" },
      { observedAtIso: "2026-07-16T09:59:00.000Z" },
      { observedAtIso: "2026-07-16T10:01:00.000Z" },
      { publicAbsolutePathAbsent: false },
      { personalPathAbsent: false },
      { regularExecutable: false },
      { shellFunction: true },
      { shellAlias: true },
      { wrapperScript: true },
      { scriptProxy: true },
      { unreviewedSymlink: true },
      { multipleMatches: true },
      { callerSelectedPath: true },
      { worldWritableExecutable: true },
      { worldWritableDirectory: true },
      { productionWrapper: true },
      { translationUnknown: true },
      { translationClassification: "translation_unknown_blocked" },
      { ownershipClassification: "ambiguous" },
      { fileTypeClassification: "wrapper_script" },
      { architectureSupport: "unsupported" },
      { hostArchitectureEvidenceRequired: false },
      { executableArchitectureEvidenceRequired: false },
      { sizeChangedBeforeSpawn: true },
      { mtimeChangedBeforeSpawn: true },
      { symlinkTargetChangedBeforeSpawn: true },
      { containingDirectoryChangedBeforeSpawn: true },
      { executableChangedBeforeSpawn: true },
      { pathChangedAfterVerification: true },
      { replacedAfterVerification: true },
      { reusableAcrossSessions: true },
      { reusableAcrossOperations: true },
      { clonedCapability: true },
      { executablePath: "/Users/example/bin/git" },
    ]) {
      expect(validateExecutableCapabilityEvidence({ ...git, ...patch }).valid, JSON.stringify(patch)).toBe(false);
    }
  });

  test("spawn and working-directory capabilities require direct argument-array spawn shape, reviewed cwd capability, no shell, no command string, no inherited stdio, no arbitrary cwd/env, no background or GUI launch", () => {
    const spawn = buildSpawnPolicy();
    const cwd = buildWorkingDirectoryCapability();
    expect(validateSpawnPolicy(spawn).valid).toBe(true);
    expect(validateWorkingDirectoryCapability(cwd).valid).toBe(true);
    expect(cwd.workdirIdentity).toBe("ture_trade_repository_root");
    expect(JSON.stringify(cwd)).not.toMatch(/\/Users\/|cwdPath"\s*:|absolutePath"\s*:/i);

    for (const patch of [
      { directExecutableRequired: false },
      { argumentArrayRequired: false },
      { shellFalseRequired: false },
      { detachedFalseRequired: false },
      { stdinIgnoredOrClosedRequired: false },
      { inheritedStdioAllowed: true },
      { commandStringAllowed: true },
      { shellCommandAllowed: true },
      { commandConcatenationAllowed: true },
      { pipesRedirectionAllowed: true },
      { commandSubstitutionAllowed: true },
      { shellExpansionAllowed: true },
      { interactiveTerminalAllowed: true },
      { backgroundLaunchAllowed: true },
      { guiLaunchAllowed: true },
      { arbitraryCwdAllowed: true },
      { arbitraryEnvironmentAllowed: true },
      { genericSpawnOptionsObjectAllowed: true },
      { multipleOperationsAllowed: true },
      { multipleExecutableCapabilitiesAllowed: true },
      { callerSuppliedPidAllowed: true },
    ]) {
      expect(validateSpawnPolicy({ ...spawn, ...patch }).valid, JSON.stringify(patch)).toBe(false);
    }

    for (const patch of [
      { verifiedRepositoryRoot: false },
      { symlinkRoot: true },
      { nestedUnrelatedRepository: true },
      { productionCheckout: true },
      { callerSelectedPath: true },
      { publicAbsolutePathAbsent: false },
      { personalPathAbsent: false },
      { boundarySession: "other_session" },
      { reusableAcrossSessions: true },
      { repositoryIdentityChanged: true },
    ]) {
      expect(validateWorkingDirectoryCapability({ ...cwd, ...patch }).valid, JSON.stringify(patch)).toBe(false);
    }
  });

  test("environment and opaque credential policies start empty, contain fixed non-secret entries only, never expose credential names or values, and require one-use cleanup", () => {
    const environment = buildEnvironmentConstructionPolicy();
    const credential = buildCredentialCapabilityPolicy();
    expect(validateEnvironmentConstructionPolicy(environment).valid).toBe(true);
    expect(validateCredentialCapabilityPolicy(credential).valid).toBe(true);
    expect(environment.fixedNonSecretEntries).toEqual(["LC_ALL=C.UTF-8", "LANG=C.UTF-8", "NO_COLOR=1", "PAGER=", "EDITOR=", "GIT_TERMINAL_PROMPT=0", "SUPABASE_NON_INTERACTIVE=1"]);
    expect(credential.credentialRequiredOperations).toEqual(["preflight_supabase_linked_project", "preflight_supabase_migration_history"]);
    expect(JSON.stringify({ environment, credential })).not.toMatch(/SUPABASE_STAGING_SERVICE_ROLE_KEY|password|secret value|cookie|session|bankid/i);

    for (const patch of [
      { startsFromEmptyEnvironment: false },
      { inheritedEnvironmentAllowed: true },
      { pathDumpAllowed: true },
      { homeAllowed: true },
      { userAllowed: true },
      { shellConfigAllowed: true },
      { arbitraryGitConfigAllowed: true },
      { arbitrarySupabaseConfigAllowed: true },
      { secretValuesPubliclyRepresentable: true },
      { credentialHandoffPubliclyRepresentable: true },
      { credentialVariableNamePubliclySelected: true },
    ]) {
      expect(validateEnvironmentConstructionPolicy({ ...environment, ...patch }).valid, JSON.stringify(patch)).toBe(false);
    }
    for (const patch of [
      { opaqueCapabilityOnly: false },
      { oneOperationOnly: false },
      { reuseAllowed: true },
      { publicSecretSlotValueAllowed: true },
      { publicEnvironmentVariableNameAllowed: true },
      { cleanupRequiredAfterSuccess: false },
      { cleanupRequiredAfterFailure: false },
      { cleanupRequiredAfterTimeout: false },
      { cleanupRequiredAfterPrompt: false },
      { cleanupRequiredAfterSecretDetection: false },
      { cleanupRequiredAfterOverflow: false },
      { cleanupRequiredAfterContainmentFailure: false },
      { cleanupRequiredAfterObserverAmbiguity: false },
      { cleanupRequiredAfterTerminationAmbiguity: false },
      { cleanupAmbiguityBlocksResult: false },
      { exportAllowed: true },
      { serializationAllowed: true },
      { loggingAllowed: true },
      { commandArgumentAllowed: true },
      { stdinAllowed: true },
      { configFileAllowed: true },
    ]) {
      expect(validateCredentialCapabilityPolicy({ ...credential, ...patch }).valid, JSON.stringify(patch)).toBe(false);
    }
  });

  test("output capture and decoder policies are bounded, transient, parser-gated, prompt/secret-first, disposal-required, and do not claim guaranteed zeroization", () => {
    const output = buildOutputCapturePolicy();
    const decoder = buildOutputDecoderPolicy();
    expect(validateOutputCapturePolicy(output).valid).toBe(true);
    expect(validateOutputDecoderPolicy(decoder).valid).toBe(true);
    expect(output.zeroizationGuaranteed).toBe(false);

    for (const patch of [
      { stdoutLimitBytesGit: output.stdoutLimitBytesGit + 1 },
      { stdoutLimitBytesSupabase: output.stdoutLimitBytesSupabase + 1 },
      { stderrLimitBytes: output.stderrLimitBytes + 1 },
      { callerMayRaiseLimits: true },
      { separateStdoutStderrBuffers: false },
      { byteCountBeforeParserAuthority: false },
      { overflowBlocksAuthority: false },
      { truncationBlocksAuthority: false },
      { rawOutputLoggingAllowed: true },
      { inheritedOutputAllowed: true },
      { fileOutputAllowed: true },
      { persistentBufferAllowed: true },
      { promptDetectionBeforeParser: false },
      { secretDetectionBeforeParser: false },
      { byteLevelSecretScanBeforeDecode: false },
      { rawBufferDisposalRequired: false },
      { minimalCopiesRequired: false },
      { mutableBufferOverwriteWherePractical: false },
      { referencesDroppedAfterClassification: false },
      { snapshottingAllowed: true },
      { rawOutputInExceptionAllowed: true },
      { zeroizationGuaranteed: true },
    ]) {
      expect(validateOutputCapturePolicy({ ...output, ...patch }).valid, JSON.stringify(patch)).toBe(false);
    }
    for (const patch of [
      { utf8Only: false },
      { nulRejected: false },
      { controlCharactersRejected: false },
      { unicodeSeparatorsRejected: false },
      { ansiRejected: false },
      { promptAndBannerDetectionRequired: false },
      { lineCountEnforced: false },
      { parserHandoffRequiresCleanClassification: false },
      { byteLevelPreDecodeScreeningRequired: false },
      { perfectDetectionClaimed: true },
    ]) {
      expect(validateOutputDecoderPolicy({ ...decoder, ...patch }).valid, JSON.stringify(patch)).toBe(false);
    }
  });

  test("process instance metadata stays private and rejects public PIDs, handles, registries, reusable instances, overlap, and second operations", () => {
    const instance = buildProcessInstanceMetadataPolicy();
    expect(validateProcessInstanceMetadataPolicy(instance).valid).toBe(true);
    expect(instance).toMatchObject({
      privatePidAllowed: true,
      privateProcessGroupIdAllowed: true,
      publicPidAllowed: false,
      publicProcessGroupIdAllowed: false,
      publicProcessHandleAllowed: false,
      globalRegistryAllowed: false,
      reusableProcessInstanceAllowed: false,
      secondOperationAllowed: false,
      crossSessionUseAllowed: false,
    });
    for (const patch of [
      { privatePidAllowed: false },
      { privateProcessGroupIdAllowed: false },
      { publicPidAllowed: true },
      { publicProcessGroupIdAllowed: true },
      { publicProcessHandleAllowed: true },
      { globalRegistryAllowed: true },
      { moduleGlobalCacheAllowed: true },
      { reusableProcessInstanceAllowed: true },
      { secondOperationAllowed: true },
      { crossSessionUseAllowed: true },
      { overlappingLeaseAllowed: true },
      { overlappingObserverAllowed: true },
      { secondProcessBeforeOutputDisposalAllowed: true },
      { secondProcessBeforeCredentialCleanupAllowed: true },
    ]) {
      expect(validateProcessInstanceMetadataPolicy({ ...instance, ...patch }).valid, JSON.stringify(patch)).toBe(false);
    }
    expect(buildInstancePolicyFingerprint({ ...instance, instanceFingerprint: undefined })).not.toBe(instance.instanceFingerprint);
  });

  test("macOS observer and containment design models parent children descendants groups helpers browser GUI URL opener daemon unknown child and rejects broad process listing or generic booleans", () => {
    const observer = buildProcessObserverPolicy();
    expect(validateProcessObserverPolicy(observer).valid).toBe(true);
    for (const key of [
      "parentStateRequired",
      "directChildStateRequired",
      "descendantStateRequired",
      "processGroupStateRequired",
      "detachedDescendantDetectionRequired",
      "processGroupEscapeDetectionRequired",
      "browserChildDetectionRequired",
      "guiChildDetectionRequired",
      "urlOpenerDetectionRequired",
      "credentialHelperDetectionRequired",
      "daemonDetectionRequired",
      "unknownChildDetectionRequired",
    ] as const) {
      expect(observer[key]).toBe(true);
      expect(validateProcessObserverPolicy({ ...observer, [key]: false }).valid, key).toBe(false);
    }
    expect(validateProcessObserverPolicy({ ...observer, unrestrictedGlobalProcessListingAllowed: true }).valid).toBe(false);
    expect(validateProcessObserverPolicy({ ...observer, genericContainmentBooleanAllowed: true }).valid).toBe(false);
    for (const patch of [
      { genericTerminationBooleanAllowed: true },
      { arbitraryPidQueryAllowed: true },
      { signalCapabilityAllowed: true },
      { rawCommandLineOutputAllowed: true },
      { environmentOutputAllowed: true },
      { personalPathOutputAllowed: true },
      { expectedChildrenAllowedForFirstRun: true },
    ]) {
      expect(validateProcessObserverPolicy({ ...observer, ...patch }).valid, JSON.stringify(patch)).toBe(false);
    }
  });

  test("timeout and termination policies use monotonic timing, bounded grace/force/containment windows, exact target capability, no arbitrary PID or signal API, no retry, and no detached certainty claim", () => {
    const timeout = buildTimeoutMonitoringPolicy();
    const termination = buildTerminationPolicy();
    expect(validateTimeoutMonitoringPolicy(timeout).valid).toBe(true);
    expect(validateTerminationPolicy(termination).valid).toBe(true);

    for (const patch of [
      { monotonicTimeRequired: false },
      { wallClockOnlyAllowed: true },
      { callerOverrideAllowed: true },
      { sessionInvalidatedAtTimeout: false },
      { retryAllowed: true },
    ]) {
      expect(validateTimeoutMonitoringPolicy({ ...timeout, ...patch }).valid, JSON.stringify(patch)).toBe(false);
    }
    for (const patch of [
      { knownProcessOrGroupTargetRequired: false },
      { arbitraryPidSignalAllowed: true },
      { unrestrictedSignalApiAllowed: true },
      { sessionInvalidatedBeforeSignal: false },
      { stopFutureOperationsBeforeSignal: false },
      { gracefulWaitBounded: false },
      { forceWaitBounded: false },
      { containmentObservationAfterGraceful: false },
      { containmentObservationAfterForce: false },
      { parentOnlyExitSufficient: true },
      { signalDeliverySuccessSufficient: true },
      { processGroupExitAloneSufficientWhenEscapeUnknown: true },
      { forceKillClaimsDetachedCertainty: true },
      { cleanupAfterFinalClassification: false },
      { operationRetryAllowed: true },
    ]) {
      expect(validateTerminationPolicy({ ...termination, ...patch }).valid, JSON.stringify(patch)).toBe(false);
    }
  });

  test("driver lifecycle accepts exact success and timeout paths and rejects reuse, retry, ambiguous-to-starting, timeout second-start, overflow/prompt/secret to completed, and cleanup ambiguity completion", () => {
    const lifecycle = buildDriverLifecyclePolicy();
    expect(validateDriverLifecyclePolicy(lifecycle).valid).toBe(true);
    expect(validateDriverLifecycleTransitions(["not_initialized->initialized", "initialized->executable_resolving", "output_disposing->completed", "completed->disposed"]).valid).toBe(true);
    expect(validateDriverLifecycleTransitions(["process_running->timeout_detected", "timeout_detected->termination_planning", "force_wait->containment_verifying", "output_disposing->terminated", "terminated->disposed"]).valid).toBe(true);
    for (const transition of [
      "completed->process_running",
      "disposed->process_starting",
      "failed->process_starting",
      "ambiguous->process_starting",
      "timeout_detected->process_starting",
      "output_disposing->process_running",
      "completed->completed",
    ]) {
      expect(validateDriverLifecycleTransitions([transition as never]).valid, transition).toBe(false);
    }
    for (const patch of [
      { secondStartAllowed: true },
      { disposedReuseAllowed: true },
      { failedRetryAllowed: true },
      { ambiguousRetryAllowed: true },
      { cleanupAmbiguityToCompletedAllowed: true },
    ]) {
      expect(validateDriverLifecyclePolicy({ ...lifecycle, ...patch }).valid, JSON.stringify(patch)).toBe(false);
    }
  });

  test("sanitized driver result excludes raw output paths PIDs process groups environment credentials and requires containment output disposal cleanup and zero mutation for completed-read-only", () => {
    const result = buildSanitizedDriverResult();
    expect(validateSanitizedDriverResult(result).valid).toBe(true);
    expect(JSON.stringify(result)).not.toMatch(/rawStdout|rawStderr|executablePath|cwdPath|pid"\s*:|processGroupId|environmentValue|credential"\s*:|keychain|\/Users\//i);
    for (const patch of [
      { containmentClassification: "ambiguous" },
      { mutationDetected: true },
      { outputDisposed: false },
      { credentialHandoffUsed: true, credentialCleanupConfirmed: false },
      { exitClassification: "nonzero" },
      { promptDetected: true },
      { secretDetected: true },
      { overflow: true },
      { truncation: true },
      { rawStdout: "safe text" },
      { executablePath: "/Users/example/bin/git" },
      { pid: 123 },
      { processGroupId: 456 },
      { environmentValue: "NO_COLOR=1" },
      { credential: "redacted" },
    ]) {
      expect(validateSanitizedDriverResult({ ...result, ...patch }).valid, JSON.stringify(patch)).toBe(false);
    }
    expect(validateSanitizedDriverResult(buildSanitizedDriverResult({ resultClassification: "interactive_prompt_detected", promptDetected: true })).valid).toBe(true);
    expect(validateSanitizedDriverResult(buildSanitizedDriverResult({ resultClassification: "unexpected_descendant", childClassification: "unexpected", containmentClassification: "unexpected_descendant" })).valid).toBe(true);
  });

  test("compatibility stays pure against executor collector credential authorization runner boundaries and inert plan contains no runnable material", () => {
    const compatibility = buildCompatibilitySummary();
    const plan = buildInertLiveMacosDriverImplementationPlan();
    expect(validateCompatibilitySummary(compatibility).valid).toBe(true);
    expect(validateInertLiveMacosDriverImplementationPlan(plan).valid).toBe(true);
    expect(plan).toMatchObject({
      containsExecutablePath: false,
      containsCwdPath: false,
      containsCommandString: false,
      containsCredential: false,
      containsSecretEnvironmentValue: false,
      containsRawOutput: false,
      containsPid: false,
      containsShell: false,
      containsSql: false,
      containsDeployment: false,
      containsRetry: false,
      liveCommandsExecuted: 0,
      processStarted: false,
      executableResolved: false,
      pathInspected: false,
      environmentRead: false,
      credentialAccessed: false,
    });
    for (const patch of [
      { preservesNoShell: false },
      { preservesNoTty: false },
      { preservesClosedStdin: false },
      { preservesDetachedFalse: false },
      { preservesOneProcessAtATime: false },
      { preservesOneRunnerInvocation: false },
      { preservesNoRetry: false },
      { deploymentCount: 1 },
      { sqlMutationCount: 1 },
      { dataMutationCount: 1 },
    ]) {
      expect(validateCompatibilitySummary({ ...compatibility, ...patch }).valid, JSON.stringify(patch)).toBe(false);
    }
    for (const key of ["containsExecutablePath", "containsCwdPath", "containsCommandString", "containsCredential", "containsRawOutput", "containsPid", "containsSql", "containsDeployment", "containsRetry", "processStarted", "executableResolved", "pathInspected", "environmentRead", "credentialAccessed"] as const) {
      expect(validateInertLiveMacosDriverImplementationPlan({ ...plan, [key]: true }).valid, key).toBe(false);
    }
  });

  test("fingerprints are deterministic and reject changed fields partial prefix malformed unsupported cyclic nested production and secret-like material", () => {
    const design = buildLiveMacosProcessDriverDesign();
    const executable = buildExecutableCapabilityEvidence("git_cli");
    const cwd = buildWorkingDirectoryCapability();
    const result = buildSanitizedDriverResult();
    expect(buildDriverDesignFingerprint({ ...design, designFingerprint: undefined })).not.toBe(design.designFingerprint);
    expect(buildExecutableCapabilityFingerprint({ ...executable, sanitizedExecutableFingerprint: undefined })).not.toBe(executable.sanitizedExecutableFingerprint);
    expect(buildCwdCapabilityFingerprint({ ...cwd, cwdFingerprint: undefined })).not.toBe(cwd.cwdFingerprint);
    expect(buildDriverResultFingerprint({ ...result, resultFingerprint: undefined })).not.toBe(result.resultFingerprint);
    expect(validateLiveMacosProcessDriverDesign({ ...design, designFingerprint: design.designFingerprint.slice(0, 12) }).blockingReasons).toContain("driver_design_fingerprint_invalid");
    expect(validateLiveMacosProcessDriverDesign({ ...design, designFingerprint: `z${design.designFingerprint.slice(1)}` }).blockingReasons).toContain("driver_design_fingerprint_invalid");
    expect(validateLiveMacosProcessDriverDesign({ ...design, targetStagingProjectRef: "ekdyopdrrkphlrsilyoo" }).valid).toBe(false);
    expect(validateExecutableCapabilityEvidence({ ...executable, note: "postgres://user:pass@example.invalid/db" }).blockingReasons).toContain("sensitive_material_present");
    const cyclic: Record<string, unknown> = {};
    cyclic.self = cyclic;
    expect(() => buildDriverDesignFingerprint(cyclic)).toThrow(/cyclic/);
  });
});
