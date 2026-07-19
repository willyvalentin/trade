import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  GIT_OBSERVATION_CAPABILITY_DEFINITIONS,
  PURE_READ_ONLY_GIT_OBSERVATION_COMPLETION_CONTRACT_IDENTITY,
  PURE_READ_ONLY_GIT_OBSERVATION_COMPLETION_FINGERPRINT_DOMAINS,
  PURE_READ_ONLY_GIT_OBSERVATION_COMPLETION_POLICY,
  buildCanonicalGitObservationCompletionInput,
  canonicalize,
  buildPureReadOnlyGitObservationCompletion,
  sha256,
  validateGitObservationCompletionResult,
  type GitObservationCapabilityIdentity,
  type GitObservationCompletionEvidence,
  type GitObservationCompletionInput,
  type GitObservationCompletionReason,
  type GitObservationCompletionResult,
} from "../../lib/post-trade-pure-read-only-git-observation-completion-contract-core";
import {
  PURE_READ_ONLY_GIT_BRANCH_STATE_CONTRACT_IDENTITY,
  buildPureGitBranchStateInterpretation,
  type PureGitBranchStateReason,
} from "../../lib/post-trade-pure-read-only-git-branch-state-interpretation-contract-core";
import {
  PURE_READ_ONLY_GIT_HEAD_OBJECT_ID_CONTRACT_IDENTITY,
  buildPureGitHeadObjectIdInterpretation,
  type PureGitHeadObjectIdReason,
} from "../../lib/post-trade-pure-read-only-git-head-object-id-interpretation-contract-core";
import {
  PURE_READ_ONLY_GIT_OBJECT_FORMAT_CONTRACT_IDENTITY,
  buildPureGitObjectFormatInterpretation,
  type PureGitObjectFormatResult,
  type PureGitObjectFormatReason,
} from "../../lib/post-trade-pure-read-only-git-object-format-interpretation-contract-core";
import {
  PURE_READ_ONLY_GIT_REPOSITORY_ROOT_CONTRACT_IDENTITY,
  buildPureGitRepositoryRootInterpretation,
  type PureGitRepositoryRootReason,
} from "../../lib/post-trade-pure-read-only-git-repository-root-interpretation-contract-core";

const repoRoot = process.cwd();
const modulePaths = [
  "lib/post-trade-pure-read-only-git-observation-completion-contract-core.ts",
  "lib/post-trade-pure-read-only-git-repository-root-interpretation-contract-core.ts",
  "lib/post-trade-pure-read-only-git-object-format-interpretation-contract-core.ts",
  "lib/post-trade-pure-read-only-git-head-object-id-interpretation-contract-core.ts",
  "lib/post-trade-pure-read-only-git-branch-state-interpretation-contract-core.ts",
] as const;

function source(path: string) {
  return readFileSync(join(repoRoot, path), "utf8");
}

function completion(capabilityIdentity: GitObservationCapabilityIdentity, stdoutText: string, patch: Partial<GitObservationCompletionInput> = {}): GitObservationCompletionResult {
  return buildPureReadOnlyGitObservationCompletion(buildCanonicalGitObservationCompletionInput(capabilityIdentity, stdoutText, patch));
}

function acceptedCompletion(capabilityIdentity: GitObservationCapabilityIdentity, stdoutText: string, patch: Partial<GitObservationCompletionInput> = {}) {
  const result = completion(capabilityIdentity, stdoutText, patch);
  expect(result.status, JSON.stringify(result.blockingReasons)).toBe("accepted_fixture_git_observation_completion");
  expect(result.blockingReasons).toEqual(["accepted"]);
  expect(result.evidence).not.toBeNull();
  expect(result.authority).toBe("none");
  expect(result.observedLiveProcess).toBe(false);
  expect(result.runtimeActivated).toBe(false);
  return result;
}

function blockedCompletion(capabilityIdentity: GitObservationCapabilityIdentity, stdoutText: string, reason: GitObservationCompletionReason, patch: Partial<GitObservationCompletionInput> = {}) {
  const result = completion(capabilityIdentity, stdoutText, patch);
  expect(result.status).toBe("blocked_fail_closed");
  expect(result.blockingReasons).toContain(reason);
  expect(result.evidence).toBeNull();
  expect(result.authority).toBe("none");
  expect(result.observedLiveProcess).toBe(false);
  return result;
}

function root(stdoutText = "/Users/willysimonsson/Dev/trade-action-534\n", patch: Partial<GitObservationCompletionInput> = {}) {
  return acceptedCompletion("git_repository_root_v1", stdoutText, patch);
}

function objectFormat(stdoutText = "sha1\n", patch: Partial<GitObservationCompletionInput> = {}) {
  return acceptedCompletion("git_object_format_v1", stdoutText, patch);
}

function head(stdoutText = "1234567890abcdef1234567890abcdef12345678\n", patch: Partial<GitObservationCompletionInput> = {}) {
  return acceptedCompletion("git_head_object_v1", stdoutText, patch);
}

function branch(stdoutText = "main\n", patch: Partial<GitObservationCompletionInput> = {}) {
  return acceptedCompletion("git_branch_state_v1", stdoutText, patch);
}

function expectFrozenDeep(value: unknown) {
  expect(Object.isFrozen(value)).toBe(true);
  if (value && typeof value === "object") {
    for (const child of Object.values(value)) {
      if (child && typeof child === "object") expect(Object.isFrozen(child)).toBe(true);
    }
  }
}

function recomputeCompletionResult(base: GitObservationCompletionResult, evidencePatch: Partial<GitObservationCompletionEvidence> = {}, resultPatch: Partial<GitObservationCompletionResult> = {}) {
  expect(base.evidence).not.toBeNull();
  const evidenceBase = { ...base.evidence, ...evidencePatch, evidenceFingerprint: undefined };
  delete evidenceBase.evidenceFingerprint;
  const evidence = {
    ...evidenceBase,
    evidenceFingerprint: sha256(PURE_READ_ONLY_GIT_OBSERVATION_COMPLETION_FINGERPRINT_DOMAINS.evidence, canonicalize(evidenceBase)),
  } as GitObservationCompletionEvidence;
  const resultBase = { ...base, ...resultPatch, evidence, resultFingerprint: "" };
  return {
    ...resultBase,
    resultFingerprint: sha256(PURE_READ_ONLY_GIT_OBSERVATION_COMPLETION_FINGERPRINT_DOMAINS.result, canonicalize(resultBase)),
  } as GitObservationCompletionResult;
}

const OBJECT_FORMAT_FINGERPRINT_DOMAINS = {
  evidence: "ture:pure-read-only-git-object-format:evidence:v1",
  result: "ture:pure-read-only-git-object-format:result:v1",
} as const;

function recomputeObjectFormatResult(base: PureGitObjectFormatResult, evidencePatch: Partial<PureGitObjectFormatResult["evidence"]> = {}, resultPatch: Partial<PureGitObjectFormatResult> = {}) {
  const evidenceBase = { ...base.evidence, ...evidencePatch, evidenceFingerprint: undefined };
  delete evidenceBase.evidenceFingerprint;
  const evidence = {
    ...evidenceBase,
    evidenceFingerprint: sha256(OBJECT_FORMAT_FINGERPRINT_DOMAINS.evidence, canonicalize(evidenceBase)),
  } as PureGitObjectFormatResult["evidence"];
  const resultBase = { ...base, ...resultPatch, evidence, resultFingerprint: "" };
  return {
    ...resultBase,
    resultFingerprint: sha256(OBJECT_FORMAT_FINGERPRINT_DOMAINS.result, canonicalize(resultBase)),
  } as PureGitObjectFormatResult;
}

test.describe("pure read-only Git simple observation contracts", () => {
  test("completion identity policy and exact argv registry are frozen closed and fixture-only", () => {
    expect(PURE_READ_ONLY_GIT_OBSERVATION_COMPLETION_CONTRACT_IDENTITY).toMatchObject({
      contractId: "ture.execution.pure-read-only-git-observation-completion-contract.fixture.v1",
      boundaryId: "ture.execution.read-only-git-observation-completion.fixture-boundary.v1",
      sourceSpawnContractId: "ture.execution.dormant-server-only-fixed-read-only-direct-spawn-adapter.server.v1",
      purpose: "first_live_read_only_staging_preflight",
      platform: "macos",
      fixtureOnly: true,
      observedLiveProcess: false,
      authority: "none",
    });
    expect(PURE_READ_ONLY_GIT_OBSERVATION_COMPLETION_POLICY.supportedCapabilities).toEqual([
      "git_repository_root_v1",
      "git_object_format_v1",
      "git_head_object_v1",
      "git_branch_state_v1",
    ]);
    expect(GIT_OBSERVATION_CAPABILITY_DEFINITIONS.git_repository_root_v1.argv).toEqual(["rev-parse", "--show-toplevel"]);
    expect(GIT_OBSERVATION_CAPABILITY_DEFINITIONS.git_object_format_v1.argv).toEqual(["rev-parse", "--show-object-format"]);
    expect(GIT_OBSERVATION_CAPABILITY_DEFINITIONS.git_head_object_v1.argv).toEqual(["rev-parse", "--verify", "HEAD"]);
    expect(GIT_OBSERVATION_CAPABILITY_DEFINITIONS.git_branch_state_v1.argv).toEqual(["symbolic-ref", "--quiet", "--short", "HEAD"]);
    expect(PURE_READ_ONLY_GIT_OBSERVATION_COMPLETION_POLICY.runtimeActivationAllowed).toBe(false);
    expect(PURE_READ_ONLY_GIT_OBSERVATION_COMPLETION_POLICY.repositoryReadAuthorityAllowed).toBe(false);
    expect(PURE_READ_ONLY_GIT_OBSERVATION_COMPLETION_POLICY.compatibilityAuthorityAllowed).toBe(false);
    expect(PURE_READ_ONLY_GIT_OBSERVATION_COMPLETION_POLICY.retryAllowed).toBe(false);
    expect(Object.isFrozen(PURE_READ_ONLY_GIT_OBSERVATION_COMPLETION_CONTRACT_IDENTITY)).toBe(true);
    expect(Object.isFrozen(PURE_READ_ONLY_GIT_OBSERVATION_COMPLETION_POLICY)).toBe(true);
    expect(Object.isFrozen(GIT_OBSERVATION_CAPABILITY_DEFINITIONS)).toBe(true);
  });

  test("all simple interpretation identities are distinct fixture-only contracts", () => {
    const identities = [
      PURE_READ_ONLY_GIT_REPOSITORY_ROOT_CONTRACT_IDENTITY,
      PURE_READ_ONLY_GIT_OBJECT_FORMAT_CONTRACT_IDENTITY,
      PURE_READ_ONLY_GIT_HEAD_OBJECT_ID_CONTRACT_IDENTITY,
      PURE_READ_ONLY_GIT_BRANCH_STATE_CONTRACT_IDENTITY,
    ];
    expect(new Set(identities.map((item) => item.contractId)).size).toBe(4);
    expect(new Set(identities.map((item) => item.boundaryId)).size).toBe(4);
    for (const identity of identities) {
      expect(identity.fixtureOnly).toBe(true);
      expect(identity.authority).toBe("none");
      expect(Object.isFrozen(identity)).toBe(true);
      expect(identity.contractId).toContain(".fixture.v1");
    }
  });

  test("production modules remain pure and contain no live side-effect imports or runtime wiring", () => {
    for (const path of modulePaths) {
      const text = source(path);
      expect(text).not.toContain('import "server-only"');
      expect(text).not.toMatch(/from\s+["']node:fs|from\s+["']fs\/promises|from\s+["']node:child_process["']|spawn\(|exec\(|execFile\(|fork\(|process\.env|process\.cwd|fetch\(|axios|keychain|keytar|osascript|createClient\(|\.insert\(|\.upsert\(|\.rpc\(|setTimeout|setInterval|Avanza|BankID/u);
      expect(text).toContain("authority");
      expect(text).toContain("none");
    }
    expect(source("app/api/post-trade/payload/validate/route.ts")).not.toContain("post-trade-pure-read-only-git");
    expect(source("app/trade-app.tsx")).not.toContain("post-trade-pure-read-only-git");
  });

  test("completion contract accepts only exact command metadata and non-authoritative fixture completion", () => {
    const result = root();
    expect(result.evidence?.argv).toEqual(["rev-parse", "--show-toplevel"]);
    expect(result.evidence?.toolIdentity).toBe("git");
    expect(result.evidence?.canonicalExecutablePath).toBe("/usr/bin/git");
    expect(result.evidence?.fixtureLiveClassification).toBe("fixture_only_not_live_observation");
    expect(result.evidence?.observedLiveProcess).toBe(false);
    expect(result.evidence?.repositoryReadAuthorityGranted).toBe(false);
    expect(result.evidence?.compatibilityAuthorityGranted).toBe(false);
    expect(result.evidence?.toctouEliminated).toBe(false);
    expectFrozenDeep(result);
  });

  test("completion contract rejects arbitrary argv relative executable platform and authority changes", () => {
    blockedCompletion("git_repository_root_v1", "/repo\n", "argv_rejected", { argv: ["status", "--porcelain=v1"] });
    blockedCompletion("git_repository_root_v1", "/repo\n", "argv_rejected", { fixedArgvIdentity: "caller_supplied" as never });
    blockedCompletion("git_repository_root_v1", "/repo\n", "executable_rejected", { canonicalExecutablePath: "git" as never });
    blockedCompletion("git_repository_root_v1", "/repo\n", "platform_rejected", { platform: "linux" as never });
    blockedCompletion("git_repository_root_v1", "/repo\n", "authority_rejected", { repositoryReadAuthorityGranted: true as false });
    blockedCompletion("git_repository_root_v1", "/repo\n", "runtime_claim_rejected", { runtimeActivated: true as false });
    blockedCompletion("git_repository_root_v1", "/repo\n", "live_claim_rejected", { observedLiveProcess: true as false });
    blockedCompletion("git_repository_root_v1", "/repo\n", "toctou_claim_rejected", { toctouEliminated: true as false });
  });

  test("completion contract rejects stderr overflow stream errors retries signals and timestamp/source defects", () => {
    blockedCompletion("git_repository_root_v1", "/repo\n", "stderr_not_empty", { stderrText: "warning", stderrByteCount: 7, combinedByteCount: Buffer.byteLength("/repo\nwarning", "utf8") });
    blockedCompletion("git_repository_root_v1", "/repo\n", "output_overflow_rejected", { stdoutOverflow: true });
    blockedCompletion("git_repository_root_v1", "/repo\n", "invalid_encoding_rejected", { utf8Valid: false });
    blockedCompletion("git_repository_root_v1", "/repo\n", "stream_error_rejected", { stdoutStreamError: true });
    blockedCompletion("git_repository_root_v1", "/repo\n", "retry_or_fallback_rejected", { retryCount: 1 as never });
    blockedCompletion("git_repository_root_v1", "/repo\n", "signal_rejected", { signalObserved: true });
    blockedCompletion("git_repository_root_v1", "/repo\n", "timestamp_rejected", { evidenceTimestamp: "not-a-date" });
    blockedCompletion("git_repository_root_v1", "/repo\n", "source_spawn_identity_rejected", { sourceSpawnFingerprint: "not-a-fingerprint" });
  });

  test("repository root parser accepts a single absolute normalized line without granting authority", () => {
    const result = buildPureGitRepositoryRootInterpretation(root("/Users/willysimonsson/Dev/trade-action-534\n"));
    expect(result.status, JSON.stringify(result.blockingReasons)).toBe("accepted_fixture_git_repository_root");
    expect(result.evidence.repositoryRootPath).toBe("/Users/willysimonsson/Dev/trade-action-534");
    expect(result.evidence.absolutePath).toBe(true);
    expect(result.evidence.canonicalFilesystemPathClaimed).toBe(false);
    expect(result.evidence.repositoryReadAuthorityGranted).toBe(false);
    expect(result.evidence.authority).toBe("none");
    expectFrozenDeep(result);
  });

  for (const [name, stdout, reason] of [
    ["relative", "repo\n", "path_not_absolute"],
    ["root", "/\n", "path_root_rejected"],
    ["trailing slash", "/tmp/repo/\n", "path_trailing_slash_rejected"],
    ["repeated slash", "/tmp//repo\n", "path_repeated_slash_rejected"],
    ["dot component", "/tmp/./repo\n", "path_dot_component_rejected"],
    ["parent component", "/tmp/../repo\n", "path_parent_component_rejected"],
    ["multiple lines", "/tmp/repo\nextra\n", "stdout_multiple_lines"],
    ["leading whitespace", " /tmp/repo\n", "whitespace_rejected"],
    ["carriage return", "/tmp/repo\r\n", "carriage_return_rejected"],
    ["nul", "/tmp/repo\0\n", "nul_rejected"],
  ] as const) {
    test(`repository root parser rejects ${name}`, () => {
      const result = buildPureGitRepositoryRootInterpretation(root(stdout));
      expect(result.status).toBe("blocked_fail_closed");
      expect(result.blockingReasons).toContain(reason as PureGitRepositoryRootReason);
      expect(result.evidence.repositoryRootPath).toBeNull();
      expect(result.evidence.authority).toBe("none");
    });
  }

  test("object-format parser accepts sha1 and sha256 and returns exact object-id lengths", () => {
    const sha1 = buildPureGitObjectFormatInterpretation(objectFormat("sha1\n"));
    const sha256 = buildPureGitObjectFormatInterpretation(objectFormat("sha256\n"));
    expect(sha1.status).toBe("accepted_fixture_git_object_format");
    expect(sha1.evidence.objectFormat).toBe("sha1");
    expect(sha1.evidence.objectIdHexLength).toBe(40);
    expect(sha1.evidence.transitionFormat).toBe(false);
    expect(sha256.status).toBe("accepted_fixture_git_object_format");
    expect(sha256.evidence.objectFormat).toBe("sha256");
    expect(sha256.evidence.objectIdHexLength).toBe(64);
    expectFrozenDeep(sha256);
  });

  for (const [name, stdout, reason] of [
    ["empty", "", "stdout_empty"],
    ["uppercase", "SHA1\n", "object_format_rejected"],
    ["transition", "sha1 x\n", "whitespace_rejected"],
    ["qualifier", "in:sha1\n", "object_format_rejected"],
    ["unknown", "blake3\n", "object_format_rejected"],
    ["multiple lines", "x\ny\n", "stdout_multiple_lines"],
  ] as const) {
    test(`object-format parser rejects ${name}`, () => {
      const result = buildPureGitObjectFormatInterpretation(objectFormat(stdout));
      expect(result.status).toBe("blocked_fail_closed");
      expect(result.blockingReasons).toContain(reason as PureGitObjectFormatReason);
      expect(result.evidence.objectFormat).toBeNull();
    });
  }

  test("HEAD parser binds to accepted object-format evidence for sha1 and sha256", () => {
    const sha1Format = buildPureGitObjectFormatInterpretation(objectFormat("sha1\n"));
    const sha1Head = buildPureGitHeadObjectIdInterpretation(head("1234567890abcdef1234567890abcdef12345678\n"), sha1Format);
    expect(sha1Head.status).toBe("accepted_fixture_git_head_object_id");
    expect(sha1Head.evidence.objectFormat).toBe("sha1");
    expect(sha1Head.evidence.headObjectIdHexLength).toBe(40);
    const sha256Format = buildPureGitObjectFormatInterpretation(objectFormat("sha256\n"));
    const sha256Head = buildPureGitHeadObjectIdInterpretation(head("1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef\n"), sha256Format);
    expect(sha256Head.status).toBe("accepted_fixture_git_head_object_id");
    expect(sha256Head.evidence.objectFormat).toBe("sha256");
    expect(sha256Head.evidence.headObjectIdHexLength).toBe(64);
    expect(sha256Head.evidence.fullObjectId).toBe(true);
    expect(sha256Head.evidence.authority).toBe("none");
  });

  test("HEAD parser rejects missing object-format evidence cross-session linkage and stale format fingerprints", () => {
    const format = buildPureGitObjectFormatInterpretation(objectFormat("sha1\n"));
    expect(buildPureGitHeadObjectIdInterpretation(head(), null).blockingReasons).toContain("object_format_evidence_rejected");
    expect(buildPureGitHeadObjectIdInterpretation(head(), { ...format, evidence: { ...format.evidence, evidenceFingerprint: "c".repeat(64) } }).blockingReasons).toContain("object_format_evidence_rejected");
    const mismatched = buildPureGitObjectFormatInterpretation(objectFormat("sha1\n", { boundarySessionId: "other-session" }));
    expect(buildPureGitHeadObjectIdInterpretation(head(), mismatched).blockingReasons).toContain("object_format_linkage_rejected");
  });

  for (const [name, stdout, reason] of [
    ["short", "1234\n", "object_id_length_rejected"],
    ["uppercase", "1234567890ABCDEF1234567890abcdef12345678\n", "object_id_case_rejected"],
    ["non-hex", "1234567890abcdef1234567890abcdef1234567z\n", "object_id_grammar_rejected"],
    ["all zero", "0000000000000000000000000000000000000000\n", "object_id_all_zero_rejected"],
    ["multiple lines", "1234567890abcdef1234567890abcdef12345678\nx\n", "stdout_multiple_lines"],
  ] as const) {
    test(`HEAD parser rejects ${name}`, () => {
      const result = buildPureGitHeadObjectIdInterpretation(head(stdout), buildPureGitObjectFormatInterpretation(objectFormat("sha1\n")));
      expect(result.status).toBe("blocked_fail_closed");
      expect(result.blockingReasons).toContain(reason as PureGitHeadObjectIdReason);
      expect(result.evidence.headObjectId).toBeNull();
    });
  }

  test("branch parser accepts attached branch and detached exit-code-one state", () => {
    const attached = buildPureGitBranchStateInterpretation(branch("feature/action-581\n"));
    expect(attached.status).toBe("accepted_fixture_git_branch_state");
    expect(attached.evidence.branchState).toBe("attached");
    expect(attached.evidence.branchName).toBe("feature/action-581");
    expect(attached.evidence.exactExitCode).toBe(0);
    const detached = buildPureGitBranchStateInterpretation(branch("", { exitCode: 1, closeCode: 1 }));
    expect(detached.status).toBe("accepted_fixture_git_branch_state");
    expect(detached.evidence.branchState).toBe("detached");
    expect(detached.evidence.branchName).toBeNull();
    expect(detached.evidence.exactExitCode).toBe(1);
    expect(detached.evidence.authority).toBe("none");
  });

  for (const [name, stdout, reason] of [
    ["full ref prefix", "refs/heads/main\n", "branch_ref_prefix_rejected"],
    ["reserved sequence", "feature@{1}\n", "branch_ref_reserved_sequence_rejected"],
    ["parent sequence", "feature..main\n", "branch_ref_reserved_sequence_rejected"],
    ["leading slash", "/main\n", "branch_ref_component_rejected"],
    ["suffix lock", "main.lock\n", "branch_ref_suffix_rejected"],
    ["space", "feature branch\n", "whitespace_rejected"],
    ["colon", "feature:branch\n", "branch_ref_character_rejected"],
  ] as const) {
    test(`branch parser rejects ${name}`, () => {
      const result = buildPureGitBranchStateInterpretation(branch(stdout));
      expect(result.status).toBe("blocked_fail_closed");
      expect(result.blockingReasons).toContain(reason as PureGitBranchStateReason);
      expect(result.evidence.branchState).toBeNull();
    });
  }

  test("branch detached completion rejects stdout and unsupported exit code", () => {
    blockedCompletion("git_branch_state_v1", "main\n", "exit_state_rejected", { exitCode: 1, closeCode: 1 });
    blockedCompletion("git_branch_state_v1", "", "exit_state_rejected", { exitCode: 2, closeCode: 2 });
  });

  test("cross-contract completion substitution is rejected fail-closed", () => {
    expect(buildPureGitRepositoryRootInterpretation(objectFormat("sha1\n")).blockingReasons).toContain("input_contract_rejected");
    expect(buildPureGitObjectFormatInterpretation(root("/tmp/repo\n")).blockingReasons).toContain("input_contract_rejected");
    expect(buildPureGitBranchStateInterpretation(head()).blockingReasons).toContain("input_contract_rejected");
  });

  test("result fingerprints are deterministic and change when trust-critical source fields change", () => {
    const first = buildPureGitRepositoryRootInterpretation(root("/tmp/repo\n"));
    const second = buildPureGitRepositoryRootInterpretation(root("/tmp/repo\n"));
    const changed = buildPureGitRepositoryRootInterpretation(root("/tmp/other\n"));
    expect(first).toEqual(second);
    expect(first.resultFingerprint).toBe(second.resultFingerprint);
    expect(first.resultFingerprint).not.toBe(changed.resultFingerprint);
    expect(first.evidence.sourceCompletionEvidenceFingerprint).not.toBe(changed.evidence.sourceCompletionEvidenceFingerprint);
  });

  test("completion result rejects tampered evidence and result fingerprints", () => {
    const result = root();
    expect(buildPureGitRepositoryRootInterpretation({ ...result, resultFingerprint: "d".repeat(64) }).blockingReasons).toContain("input_contract_rejected");
    expect(buildPureGitRepositoryRootInterpretation({ ...result, evidence: { ...result.evidence, evidenceFingerprint: "e".repeat(64) } }).blockingReasons).toContain("input_contract_rejected");
  });

  test("completion result validation rejects recomputed forged live authority fields", () => {
    const forgedLive = recomputeCompletionResult(root(), { observedLiveProcess: true as false });
    expect(validateGitObservationCompletionResult(forgedLive, "git_repository_root_v1")).toEqual({ valid: false, reasons: ["live_claim_rejected"] });
    expect(buildPureGitRepositoryRootInterpretation(forgedLive).blockingReasons).toContain("input_contract_rejected");
    const forgedAuthority = recomputeCompletionResult(root(), { processAuthorityGranted: true as false });
    expect(validateGitObservationCompletionResult(forgedAuthority, "git_repository_root_v1")).toEqual({ valid: false, reasons: ["authority_rejected"] });
    const forgedRuntime = recomputeCompletionResult(root(), { runtimeActivated: true as false });
    expect(validateGitObservationCompletionResult(forgedRuntime, "git_repository_root_v1")).toEqual({ valid: false, reasons: ["runtime_claim_rejected"] });
  });

  test("completion result validation rejects recomputed accepted-result schema and linkage forgeries", () => {
    expect(validateGitObservationCompletionResult(recomputeCompletionResult(root(), {}, { blockingReasons: ["accepted", "input_contract_rejected"] }), "git_repository_root_v1")).toEqual({ valid: false, reasons: ["input_status_rejected"] });
    expect(validateGitObservationCompletionResult(recomputeCompletionResult(root(), { contractIdentityFingerprint: "f".repeat(64) }), "git_repository_root_v1")).toEqual({ valid: false, reasons: ["input_identity_rejected"] });
    expect(validateGitObservationCompletionResult(recomputeCompletionResult(root(), { sourceOutputFingerprint: "0".repeat(64) }), "git_repository_root_v1")).toEqual({ valid: false, reasons: ["input_fingerprint_rejected"] });
    expect(validateGitObservationCompletionResult(recomputeCompletionResult(root(), { stdoutLimitBytes: 999 }), "git_repository_root_v1")).toEqual({ valid: false, reasons: ["stdout_byte_count_rejected"] });
    expect(validateGitObservationCompletionResult(recomputeCompletionResult(root(), { stderrEmpty: false }), "git_repository_root_v1")).toEqual({ valid: false, reasons: ["stderr_not_empty"] });
    expect(validateGitObservationCompletionResult(recomputeCompletionResult(root(), { eligibleCompletion: false }), "git_repository_root_v1")).toEqual({ valid: false, reasons: ["completion_state_rejected"] });
  });

  test("completion result validation rejects unknown fields getters exotic prototypes and symbol keys", () => {
    const result = root();
    expect(validateGitObservationCompletionResult({ ...result, extra: true }, "git_repository_root_v1")).toEqual({ valid: false, reasons: ["input_contract_rejected"] });
    expect(validateGitObservationCompletionResult(recomputeCompletionResult(root(), { extra: true } as never), "git_repository_root_v1")).toEqual({ valid: false, reasons: ["input_contract_rejected"] });
    const getterResult = { ...result };
    Object.defineProperty(getterResult, "status", { get: () => result.status, enumerable: true });
    expect(validateGitObservationCompletionResult(getterResult, "git_repository_root_v1")).toEqual({ valid: false, reasons: ["input_contract_rejected"] });
    expect(validateGitObservationCompletionResult(Object.assign(Object.create({ inherited: true }), result), "git_repository_root_v1")).toEqual({ valid: false, reasons: ["input_contract_rejected"] });
    const symbolResult = { ...result, [Symbol("hidden")]: true };
    expect(validateGitObservationCompletionResult(symbolResult, "git_repository_root_v1")).toEqual({ valid: false, reasons: ["input_contract_rejected"] });
  });

  test("completion byte limits reject exactly one byte over every approved capability", () => {
    expect(completion("git_repository_root_v1", "a".repeat(1024)).status).toBe("accepted_fixture_git_observation_completion");
    blockedCompletion("git_repository_root_v1", "a".repeat(1025), "stdout_byte_count_rejected");
    expect(completion("git_object_format_v1", "a".repeat(8)).status).toBe("accepted_fixture_git_observation_completion");
    blockedCompletion("git_object_format_v1", "a".repeat(9), "stdout_byte_count_rejected");
    expect(completion("git_head_object_v1", `${"a".repeat(64)}\n`).status).toBe("accepted_fixture_git_observation_completion");
    blockedCompletion("git_head_object_v1", `${"a".repeat(65)}\n`, "stdout_byte_count_rejected");
    expect(completion("git_branch_state_v1", `${"a".repeat(255)}\n`).status).toBe("accepted_fixture_git_observation_completion");
    blockedCompletion("git_branch_state_v1", `${"a".repeat(256)}\n`, "stdout_byte_count_rejected");
  });

  test("completion byte counts reject negative noninteger nonfinite and mismatched counts", () => {
    blockedCompletion("git_repository_root_v1", "/repo\n", "stdout_byte_count_rejected", { stdoutByteCount: -1 });
    blockedCompletion("git_repository_root_v1", "/repo\n", "stdout_byte_count_rejected", { stdoutByteCount: 1.5 });
    blockedCompletion("git_repository_root_v1", "/repo\n", "stdout_byte_count_rejected", { stdoutByteCount: Number.NaN });
    blockedCompletion("git_repository_root_v1", "/repo\n", "stderr_byte_count_rejected", { combinedByteCount: 999 });
  });

  test("repository root parser rejects C1 controls while preserving ordinary non-ASCII path text", () => {
    for (const control of ["\u0080", "\u0085", "\u009f"]) {
      const result = buildPureGitRepositoryRootInterpretation(root(`/tmp/repo${control}x\n`));
      expect(result.status).toBe("blocked_fail_closed");
      expect(result.blockingReasons).toContain("control_character_rejected");
      expect(result.evidence.repositoryRootPath).toBeNull();
    }
    const accepted = buildPureGitRepositoryRootInterpretation(root("/tmp/répo/東京\n"));
    expect(accepted.status).toBe("accepted_fixture_git_repository_root");
    expect(accepted.evidence.repositoryRootPath).toBe("/tmp/répo/東京");
  });

  test("object-format evidence validator rejects recomputed schema and live-posture forgeries before HEAD linkage", () => {
    const format = buildPureGitObjectFormatInterpretation(objectFormat("sha1\n"));
    const headInput = head();
    expect(buildPureGitHeadObjectIdInterpretation(headInput, recomputeObjectFormatResult(format, { observedLiveProcess: true as false })).blockingReasons).toContain("object_format_evidence_rejected");
    expect(buildPureGitHeadObjectIdInterpretation(headInput, recomputeObjectFormatResult(format, { repositoryReadAuthorityGranted: true as false })).blockingReasons).toContain("object_format_evidence_rejected");
    expect(buildPureGitHeadObjectIdInterpretation(headInput, recomputeObjectFormatResult(format, { runtimeActivated: true as false })).blockingReasons).toContain("object_format_evidence_rejected");
    expect(buildPureGitHeadObjectIdInterpretation(headInput, recomputeObjectFormatResult(format, { authority: "fixture_structural_only" as "none" })).blockingReasons).toContain("object_format_evidence_rejected");
    expect(buildPureGitHeadObjectIdInterpretation(headInput, recomputeObjectFormatResult(format, { extra: true } as never)).blockingReasons).toContain("object_format_evidence_rejected");
    expect(buildPureGitHeadObjectIdInterpretation(headInput, recomputeObjectFormatResult(format, {}, { extra: true } as never)).blockingReasons).toContain("object_format_evidence_rejected");
  });

  test("object-format evidence validator rejects recomputed identity reason and byte-count forgeries", () => {
    const format = buildPureGitObjectFormatInterpretation(objectFormat("sha256\n"));
    const headInput = head("1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef\n");
    expect(buildPureGitHeadObjectIdInterpretation(headInput, recomputeObjectFormatResult(format, { boundaryId: "wrong" as never })).blockingReasons).toContain("object_format_evidence_rejected");
    expect(buildPureGitHeadObjectIdInterpretation(headInput, recomputeObjectFormatResult(format, { grammarId: "wrong" as never })).blockingReasons).toContain("object_format_evidence_rejected");
    expect(buildPureGitHeadObjectIdInterpretation(headInput, recomputeObjectFormatResult(format, { primaryReason: "stdout_empty" as never, reasons: ["accepted"] })).blockingReasons).toContain("object_format_evidence_rejected");
    expect(buildPureGitHeadObjectIdInterpretation(headInput, recomputeObjectFormatResult(format, { reasons: ["accepted", "stdout_empty"] as never })).blockingReasons).toContain("object_format_evidence_rejected");
    expect(buildPureGitHeadObjectIdInterpretation(headInput, recomputeObjectFormatResult(format, { objectIdHexLength: 40 })).blockingReasons).toContain("object_format_evidence_rejected");
    expect(buildPureGitHeadObjectIdInterpretation(headInput, recomputeObjectFormatResult(format, { originalStdoutByteCount: 999 })).blockingReasons).toContain("object_format_evidence_rejected");
    expect(buildPureGitHeadObjectIdInterpretation(headInput, recomputeObjectFormatResult(format, { originalStdoutFingerprint: "1".repeat(64) })).blockingReasons).toContain("object_format_evidence_rejected");
  });

  test("object-format evidence validator rejects malformed source linkage shapes", () => {
    const format = buildPureGitObjectFormatInterpretation(objectFormat("sha1\n"));
    const headInput = head();
    expect(buildPureGitHeadObjectIdInterpretation(headInput, recomputeObjectFormatResult(format, { sourceSpawnFingerprint: "not-a-fingerprint" })).blockingReasons).toContain("object_format_evidence_rejected");
    expect(buildPureGitHeadObjectIdInterpretation(headInput, recomputeObjectFormatResult(format, { sourceCompletionEvidenceFingerprint: "not-a-fingerprint" })).blockingReasons).toContain("object_format_evidence_rejected");
    expect(buildPureGitHeadObjectIdInterpretation(headInput, recomputeObjectFormatResult(format, { workingDirectoryFingerprint: "not-a-fingerprint" })).blockingReasons).toContain("object_format_evidence_rejected");
    expect(buildPureGitHeadObjectIdInterpretation(headInput, recomputeObjectFormatResult(format, { argv: ["rev-parse", "HEAD"] as never })).blockingReasons).toContain("object_format_evidence_rejected");
    expect(buildPureGitHeadObjectIdInterpretation(headInput, recomputeObjectFormatResult(format, { evidenceTimestamp: "not-a-date" })).blockingReasons).toContain("object_format_evidence_rejected");
  });

  test("porcelain status remains deliberately unimplemented and unsupported", () => {
    expect(PURE_READ_ONLY_GIT_OBSERVATION_COMPLETION_POLICY.supportedCapabilities).not.toContain("git_porcelain_status_v1" as never);
    expect(Object.keys(GIT_OBSERVATION_CAPABILITY_DEFINITIONS)).not.toContain("git_porcelain_status_v1");
    blockedCompletion("git_repository_root_v1", "", "argv_rejected", { argv: ["status", "--porcelain=v1", "-z"] });
    for (const path of modulePaths) expect(source(path)).not.toContain("porcelain");
  });
});
