import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  PURE_BYTE_ORIENTED_PORCELAIN_STATUS_COMPLETION_CONTRACT_IDENTITY,
  PURE_BYTE_ORIENTED_PORCELAIN_STATUS_COMPLETION_FINGERPRINT_DOMAINS,
  PURE_BYTE_ORIENTED_PORCELAIN_STATUS_COMPLETION_POLICY,
  buildCanonicalPorcelainStatusCompletionInput,
  buildPureByteOrientedPorcelainStatusCompletion,
  canonicalize,
  sha256,
  validatePureByteOrientedPorcelainStatusCompletionResult,
  type PorcelainStatusCompletionEvidence,
  type PorcelainStatusCompletionInput,
  type PorcelainStatusCompletionReason,
  type PorcelainStatusCompletionResult,
  type PorcelainStatusRejectedInputEvidence,
} from "../../lib/post-trade-pure-byte-oriented-porcelain-status-completion-contract-core";

const repoRoot = process.cwd();
const modulePath = "lib/post-trade-pure-byte-oriented-porcelain-status-completion-contract-core.ts";

function source(path: string) {
  return readFileSync(join(repoRoot, path), "utf8");
}

function hex(bytes: readonly number[]) {
  return bytes.map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function build(stdoutBytesHex = "", patch: Partial<PorcelainStatusCompletionInput> = {}) {
  return buildPureByteOrientedPorcelainStatusCompletion(buildCanonicalPorcelainStatusCompletionInput(stdoutBytesHex, patch));
}

function accepted(stdoutBytesHex = "", patch: Partial<PorcelainStatusCompletionInput> = {}) {
  const result = build(stdoutBytesHex, patch);
  expect(result.status, JSON.stringify(result.blockingReasons)).toBe("accepted_fixture_byte_oriented_porcelain_status_completion");
  expect(result.reason).toBe("accepted");
  expect(result.blockingReasons).toEqual(["accepted"]);
  expect(result.evidence).not.toBeNull();
  expect(result.rejectedInputEvidence).toBeNull();
  expect(result.authority).toBe("none");
  expect(result.observedLiveProcess).toBe(false);
  expect(result.runtimeActivated).toBe(false);
  return result;
}

function rejected(reason: PorcelainStatusCompletionReason, stdoutBytesHex = "", patch: Partial<PorcelainStatusCompletionInput> = {}) {
  const result = build(stdoutBytesHex, patch);
  expect(result.status).toBe("blocked_fail_closed");
  expect(result.blockingReasons).toContain(reason);
  expect(result.evidence).toBeNull();
  expect(result.authority).toBe("none");
  expect(result.observedLiveProcess).toBe(false);
  return result;
}

function rejectedExact(reason: PorcelainStatusCompletionReason, stdoutBytesHex = "", patch: Partial<PorcelainStatusCompletionInput> = {}) {
  const first = build(stdoutBytesHex, patch);
  const second = build(stdoutBytesHex, patch);
  expect(first).toEqual(second);
  expect(first.status).toBe("blocked_fail_closed");
  expect(first.reason).toBe(reason);
  expect(first.blockingReasons[0]).toBe(reason);
  expect(first.evidence).toBeNull();
  expectRejectedSummary(first, reason);
  expect(first).not.toHaveProperty("stdoutBytesHex");
  expect(first.authority).toBe("none");
  expect(first.observedLiveProcess).toBe(false);
  expect(first.runtimeActivated).toBe(false);
  expect(first.resultFingerprint).toBe(second.resultFingerprint);
  expectFrozenDeep(first);
  return first;
}

function expectRejectedSummary(result: PorcelainStatusCompletionResult, reason: PorcelainStatusCompletionReason) {
  expect(result.rejectedInputEvidence).not.toBeNull();
  const summary = result.rejectedInputEvidence as PorcelainStatusRejectedInputEvidence;
  expect(summary.evidenceKind).toBe("pure_byte_oriented_porcelain_status_rejected_input_evidence");
  expect(summary.validationStage).toBe("safe_output_retention_state");
  expect(summary.selectedReason).toBe(reason);
  expect(summary.eligibleCompletion).toBe(false);
  expect(summary.authority).toBe("none");
  expect(summary.observedLiveProcess).toBe(false);
  expect(summary.runtimeActivated).toBe(false);
  expect(summary.repositoryReadAuthorityGranted).toBe(false);
  expect(summary.toctouEliminated).toBe(false);
  expect(summary.rejectedInputFingerprint).toMatch(/^[a-f0-9]{64}$/u);
  expect(summary).not.toHaveProperty("stdoutBytesHex");
  expect(summary).not.toHaveProperty("stderrBytesHex");
  expectFrozenDeep(summary);
  return summary;
}

function expectFrozenDeep(value: unknown) {
  expect(Object.isFrozen(value)).toBe(true);
  if (value && typeof value === "object") {
    for (const child of Object.values(value)) {
      if (child && typeof child === "object") expect(Object.isFrozen(child)).toBe(true);
    }
  }
}

function recomputeResult(base: PorcelainStatusCompletionResult, evidencePatch: Partial<PorcelainStatusCompletionEvidence> = {}, resultPatch: Partial<PorcelainStatusCompletionResult> = {}) {
  expect(base.evidence).not.toBeNull();
  const evidenceBase = { ...base.evidence, ...evidencePatch, evidenceFingerprint: undefined };
  delete evidenceBase.evidenceFingerprint;
  const evidence = {
    ...evidenceBase,
    evidenceFingerprint: sha256(PURE_BYTE_ORIENTED_PORCELAIN_STATUS_COMPLETION_FINGERPRINT_DOMAINS.evidence, canonicalize(evidenceBase)),
  } as PorcelainStatusCompletionEvidence;
  const resultBase = { ...base, ...resultPatch, evidence, resultFingerprint: "" };
  return {
    ...resultBase,
    resultFingerprint: sha256(PURE_BYTE_ORIENTED_PORCELAIN_STATUS_COMPLETION_FINGERPRINT_DOMAINS.result, canonicalize(resultBase)),
  } as PorcelainStatusCompletionResult;
}

function invalidReasons(result: ReturnType<typeof validatePureByteOrientedPorcelainStatusCompletionResult>) {
  expect(result.valid).toBe(false);
  return result.valid ? [] : result.reasons;
}

test.describe("pure byte-oriented porcelain status completion contract", () => {
  test("identity policy and exact status argv are immutable fixture-only contracts", () => {
    expect(PURE_BYTE_ORIENTED_PORCELAIN_STATUS_COMPLETION_CONTRACT_IDENTITY).toMatchObject({
      contractKind: "pure_byte_oriented_porcelain_status_completion_contract",
      contractId: "ture.execution.pure-read-only-git-porcelain-status-completion-contract.fixture.v1",
      boundaryId: "ture.execution.read-only-git-porcelain-status-completion.fixture-boundary.v1",
      byteRepresentationId: "ture.execution.byte-representation.lowercase-even-hex.v1",
      capabilityIdentity: "git_porcelain_status_v1",
      capabilityPurpose: "git_porcelain_status",
      fixtureOnly: true,
      observedLiveProcess: false,
      authority: "none",
    });
    expect(PURE_BYTE_ORIENTED_PORCELAIN_STATUS_COMPLETION_POLICY.argv).toEqual([
      "status",
      "--porcelain=v1",
      "-z",
      "--untracked-files=all",
      "--no-renames",
      "--ignore-submodules=none",
    ]);
    expect(PURE_BYTE_ORIENTED_PORCELAIN_STATUS_COMPLETION_POLICY.stdoutLimitBytes).toBe(65536);
    expect(PURE_BYTE_ORIENTED_PORCELAIN_STATUS_COMPLETION_POLICY.stderrLimitBytes).toBe(0);
    expect(PURE_BYTE_ORIENTED_PORCELAIN_STATUS_COMPLETION_POLICY.combinedLimitBytes).toBe(65536);
    expect(PURE_BYTE_ORIENTED_PORCELAIN_STATUS_COMPLETION_POLICY.parserAllowed).toBe(false);
    expect(PURE_BYTE_ORIENTED_PORCELAIN_STATUS_COMPLETION_POLICY.statusInterpretationAllowed).toBe(false);
    expect(Object.isFrozen(PURE_BYTE_ORIENTED_PORCELAIN_STATUS_COMPLETION_CONTRACT_IDENTITY)).toBe(true);
    expect(Object.isFrozen(PURE_BYTE_ORIENTED_PORCELAIN_STATUS_COMPLETION_POLICY)).toBe(true);
    expect(Object.isFrozen(PURE_BYTE_ORIENTED_PORCELAIN_STATUS_COMPLETION_POLICY.argv)).toBe(true);
  });

  test("production module remains pure and has no live side-effect dependency or parser implementation", () => {
    const text = source(modulePath);
    expect(text).not.toContain('import "server-only"');
    expect(text).not.toMatch(/from\s+["']node:fs|from\s+["']fs\/promises|from\s+["']node:child_process["']|spawn\(|exec\(|execFile\(|fork\(|process\.env|fetch\(|axios|keychain|keytar|osascript|createClient\(|\.insert\(|\.upsert\(|\.rpc\(|setTimeout|setInterval|TextDecoder|decodeURIComponent|Buffer\.from/u);
    expect(text).not.toMatch(/recordCount|clean|dirty|statusCodeBreakdown|pathBytes|pathFingerprint|split\(|NUL record|XY/u);
    expect(source("app/trade-app.tsx")).not.toContain("post-trade-pure-byte-oriented-porcelain-status-completion");
    expect(source("app/api/post-trade/payload/validate/route.ts")).not.toContain("post-trade-pure-byte-oriented-porcelain-status-completion");
  });

  test("accepts empty stdout bytes as an exact zero-exit byte completion without authority", () => {
    const result = accepted("");
    expect(result.evidence?.stdoutBytesHex).toBe("");
    expect(result.evidence?.stdoutByteCount).toBe(0);
    expect(result.evidence?.stderrBytesHex).toBe("");
    expect(result.evidence?.stderrByteCount).toBe(0);
    expect(result.evidence?.stderrEmpty).toBe(true);
    expect(result.evidence?.eligibleCompletion).toBe(true);
    expect(result.evidence?.truncated).toBe(false);
    expect(result.evidence?.repositoryReadAuthorityGranted).toBe(false);
    expect(result.evidence?.processAuthorityGranted).toBe(false);
    expect(result.evidence?.compatibilityAuthorityGranted).toBe(false);
    expect(result.evidence?.toctouEliminated).toBe(false);
    expect(validatePureByteOrientedPorcelainStatusCompletionResult(result).valid).toBe(true);
    expectFrozenDeep(result);
  });

  test("accepts arbitrary raw bytes by lowercase hex without decoding or interpreting them", () => {
    const raw = hex([0x20, 0x4d, 0x20, 0x61, 0x00, 0xff, 0xfe, 0x0a, 0x09, 0x0d, 0x27, 0x22, 0x5c, 0x2d]);
    const result = accepted(raw);
    expect(result.evidence?.stdoutBytesHex).toBe(raw);
    expect(result.evidence?.stdoutByteCount).toBe(14);
    expect(result.evidence).not.toHaveProperty("stdoutText");
    expect(result.evidence).not.toHaveProperty("recordCount");
    expect(result.evidence).not.toHaveProperty("clean");
    expect(result.evidence).not.toHaveProperty("pathBytes");
  });

  test("same canonical input is deterministic and input mutation cannot alter completed output", () => {
    const input = buildCanonicalPorcelainStatusCompletionInput("003f");
    const first = buildPureByteOrientedPorcelainStatusCompletion(input);
    const second = buildPureByteOrientedPorcelainStatusCompletion(input);
    expect(first).toEqual(second);
    expect(first.resultFingerprint).toBe(second.resultFingerprint);
    const mutable = { ...input, stdoutBytesHex: "ff", stdoutByteCount: 1, combinedByteCount: 1 };
    const completed = buildPureByteOrientedPorcelainStatusCompletion(mutable);
    mutable.stdoutBytesHex = "";
    expect(completed.evidence?.stdoutBytesHex).toBe("ff");
  });

  for (const [name, argv] of [
    ["reordered", ["status", "-z", "--porcelain=v1", "--untracked-files=all", "--no-renames", "--ignore-submodules=none"]],
    ["omitted flag", ["status", "--porcelain=v1", "-z", "--untracked-files=all", "--ignore-submodules=none"]],
    ["extra pathspec", ["status", "--porcelain=v1", "-z", "--untracked-files=all", "--no-renames", "--ignore-submodules=none", "."]],
    ["porcelain v2", ["status", "--porcelain=v2", "-z", "--untracked-files=all", "--no-renames", "--ignore-submodules=none"]],
    ["non NUL mode", ["status", "--porcelain=v1", "--untracked-files=all", "--no-renames", "--ignore-submodules=none"]],
    ["different untracked mode", ["status", "--porcelain=v1", "-z", "--untracked-files=no", "--no-renames", "--ignore-submodules=none"]],
    ["rename enabled", ["status", "--porcelain=v1", "-z", "--untracked-files=all", "--renames", "--ignore-submodules=none"]],
    ["different submodule mode", ["status", "--porcelain=v1", "-z", "--untracked-files=all", "--no-renames", "--ignore-submodules=all"]],
    ["branch header", ["status", "--porcelain=v1", "-z", "--branch", "--untracked-files=all", "--no-renames", "--ignore-submodules=none"]],
    ["config argument", ["-c", "status.renames=true", "status", "--porcelain=v1", "-z", "--untracked-files=all", "--no-renames", "--ignore-submodules=none"]],
    ["unicode lookalike", ["status", "--porcelain=v1", "-z", "--untracked-files=all", "--no-renames", "--ignore-submodules＝none"]],
  ] as const) {
    test(`rejects ${name} argv`, () => {
      rejected("argv_rejected", "", { argv });
    });
  }

  test("rejects wrong capability purpose tool executable platform and policy linkage", () => {
    rejected("capability_rejected", "", { capabilityIdentity: "git_branch_state_v1" as never });
    rejected("capability_rejected", "", { capabilityPurpose: "git_status" as never });
    rejected("tool_rejected", "", { toolIdentity: "supabase" as never });
    rejected("executable_rejected", "", { canonicalExecutablePath: "git" as never });
    rejected("platform_rejected", "", { platform: "linux" as never });
    rejected("source_spawn_identity_rejected", "", { sourceSpawnFingerprint: "not-a-fingerprint" });
    rejected("source_linkage_rejected", "", { workingDirectoryFingerprint: "not-a-fingerprint" });
  });

  for (const [name, stdoutBytesHex, reason] of [
    ["uppercase", "AF", "stdout_hex_grammar_rejected"],
    ["odd length", "abc", "stdout_hex_odd_length_rejected"],
    ["non hex", "0g", "stdout_hex_grammar_rejected"],
    ["prefix", "0x00", "stdout_hex_grammar_rejected"],
    ["whitespace", "00 01", "stdout_hex_grammar_rejected"],
    ["sign", "-1", "stdout_hex_grammar_rejected"],
    ["unicode", "００", "stdout_hex_grammar_rejected"],
  ] as const) {
    test(`rejects stdout hex ${name}`, () => {
      rejected(reason, stdoutBytesHex);
    });
  }

  test("rejects byte-count mismatches non-integer counts and overflow", () => {
    rejected("stdout_byte_count_rejected", "00", { stdoutByteCount: 2, combinedByteCount: 2 });
    rejected("stdout_byte_count_rejected", "00", { stdoutByteCount: -1, combinedByteCount: -1 });
    rejected("stdout_byte_count_rejected", "00", { stdoutByteCount: 0.5, combinedByteCount: 0.5 });
    rejected("stdout_byte_count_rejected", "00", { stdoutByteCount: Number.NaN, combinedByteCount: Number.NaN });
    rejected("stdout_byte_count_rejected", "00", { stdoutByteCount: Number.POSITIVE_INFINITY, combinedByteCount: Number.POSITIVE_INFINITY });
    rejected("stdout_overflow_rejected", "00".repeat(65537));
    rejected("combined_overflow_rejected", "00".repeat(65537));
    const max = accepted("00".repeat(65536));
    expect(max.evidence?.stdoutByteCount).toBe(65536);
  });

  test("rejects any stderr byte malformed stderr hex and combined mismatch", () => {
    rejected("stderr_not_empty", "", { stderrBytesHex: "00", stderrByteCount: 1, combinedByteCount: 1 });
    rejected("stderr_hex_grammar_rejected", "", { stderrBytesHex: "GG" as never });
    rejected("stderr_hex_odd_length_rejected", "", { stderrBytesHex: "0", stderrByteCount: 0 });
    rejected("stderr_byte_count_rejected", "", { stderrBytesHex: "", stderrByteCount: 1, combinedByteCount: 1 });
    rejected("combined_byte_count_rejected", "00", { combinedByteCount: 2 });
    rejected("stderr_overflow_rejected", "", { stderrByteCount: 1, combinedByteCount: 1 });
  });

  test("maps output-retention overflow and truncation flags to exact deterministic reasons", () => {
    expect(rejectedExact("stdout_overflow_rejected", "", { stdoutOverflow: true as false }).rejectedInputEvidence?.stdoutOverflow).toBe(true);
    expect(rejectedExact("stderr_overflow_rejected", "", { stderrOverflow: true as false }).rejectedInputEvidence?.stderrOverflow).toBe(true);
    expect(rejectedExact("combined_overflow_rejected", "", { combinedOverflow: true as false }).rejectedInputEvidence?.combinedOverflow).toBe(true);
    expect(rejectedExact("truncated_output_rejected", "", { stdoutTruncated: true as false }).rejectedInputEvidence?.truncated).toBe(true);
  });

  for (const [name, patch, expected] of [
    ["stdout plus stderr overflow", { stdoutOverflow: true as false, stderrOverflow: true as false }, "stdout_overflow_rejected"],
    ["stdout plus combined overflow", { stdoutOverflow: true as false, combinedOverflow: true as false }, "stdout_overflow_rejected"],
    ["stderr plus combined overflow", { stderrOverflow: true as false, combinedOverflow: true as false }, "stderr_overflow_rejected"],
    ["all overflow flags", { stdoutOverflow: true as false, stderrOverflow: true as false, combinedOverflow: true as false }, "stdout_overflow_rejected"],
    ["truncation plus stdout overflow", { stdoutOverflow: true as false, stdoutTruncated: true as false }, "stdout_overflow_rejected"],
    ["truncation plus stderr overflow", { stderrOverflow: true as false, stderrTruncated: true as false }, "stderr_overflow_rejected"],
    ["truncation plus combined overflow", { combinedOverflow: true as false, combinedTruncated: true as false }, "combined_overflow_rejected"],
  ] as const) {
    test(`uses documented precedence for ${name}`, () => {
      rejectedExact(expected, "", patch);
    });
  }

  test("rejected result fingerprints bind same-reason overflow and truncation flags", () => {
    const cases = [
      ["stdout overflow only", { stdoutOverflow: true as false }, "stdout_overflow_rejected"],
      ["stdout and stderr overflow", { stdoutOverflow: true as false, stderrOverflow: true as false }, "stdout_overflow_rejected"],
      ["stdout and combined overflow", { stdoutOverflow: true as false, combinedOverflow: true as false }, "stdout_overflow_rejected"],
      ["all overflow", { stdoutOverflow: true as false, stderrOverflow: true as false, combinedOverflow: true as false }, "stdout_overflow_rejected"],
      ["stdout overflow and truncation", { stdoutOverflow: true as false, stdoutTruncated: true as false }, "stdout_overflow_rejected"],
      ["all overflow and truncation", { stdoutOverflow: true as false, stderrOverflow: true as false, combinedOverflow: true as false, combinedTruncated: true as false }, "stdout_overflow_rejected"],
      ["stderr overflow only", { stderrOverflow: true as false }, "stderr_overflow_rejected"],
      ["stderr and combined overflow", { stderrOverflow: true as false, combinedOverflow: true as false }, "stderr_overflow_rejected"],
      ["stderr overflow and truncation", { stderrOverflow: true as false, stderrTruncated: true as false }, "stderr_overflow_rejected"],
      ["stderr combined overflow and truncation", { stderrOverflow: true as false, combinedOverflow: true as false, combinedTruncated: true as false }, "stderr_overflow_rejected"],
      ["combined overflow only", { combinedOverflow: true as false }, "combined_overflow_rejected"],
      ["combined overflow and truncation", { combinedOverflow: true as false, combinedTruncated: true as false }, "combined_overflow_rejected"],
      ["truncation only", { stdoutTruncated: true as false }, "truncated_output_rejected"],
    ] as const;
    const results = cases.map(([, patch, reason]) => rejectedExact(reason, "", patch));
    expect(new Set(results.map((result) => result.resultFingerprint)).size).toBe(cases.length);
    expect(new Set(results.map((result) => result.rejectedInputEvidence?.rejectedInputFingerprint)).size).toBe(cases.length);
    const truncationOnly = results.at(-1);
    expect(truncationOnly?.reason).toBe("truncated_output_rejected");
    expect(truncationOnly?.rejectedInputEvidence?.truncated).toBe(true);
  });

  test("rejected summaries bind counts and safe byte fingerprints without retaining raw payload", () => {
    const base = rejectedExact("stdout_overflow_rejected", "00", { stdoutOverflow: true as false });
    const changedCount = rejectedExact("stdout_overflow_rejected", "0001", { stdoutOverflow: true as false });
    const changedPayload = rejectedExact("stdout_overflow_rejected", "02", { stdoutOverflow: true as false });
    expect(base.rejectedInputEvidence?.stdoutByteCount).toBe(1);
    expect(changedCount.rejectedInputEvidence?.stdoutByteCount).toBe(2);
    expect(base.rejectedInputEvidence?.stdoutBytesFingerprint).toMatch(/^[a-f0-9]{64}$/u);
    expect(base.rejectedInputEvidence?.stdoutBytesFingerprint).not.toBe(changedPayload.rejectedInputEvidence?.stdoutBytesFingerprint);
    expect(base.resultFingerprint).not.toBe(changedCount.resultFingerprint);
    expect(base.resultFingerprint).not.toBe(changedPayload.resultFingerprint);
    expect(base.rejectedInputEvidence).not.toHaveProperty("stdoutBytesHex");
    expect(base.rejectedInputEvidence).not.toHaveProperty("stderrBytesHex");

    const countMismatch = rejectedExact("stdout_overflow_rejected", "00", {
      stdoutByteCount: 2,
      combinedByteCount: 2,
      stdoutOverflow: true as false,
    });
    expect(countMismatch.rejectedInputEvidence?.stdoutBytesFingerprint).toBeNull();
    expect(countMismatch.rejectedInputEvidence?.rawOutputFingerprint).toBeNull();

    const malformedHex = rejectedExact("stdout_overflow_rejected", "zz", { stdoutByteCount: 1, combinedByteCount: 1, stdoutOverflow: true as false });
    expect(malformedHex.rejectedInputEvidence?.stdoutBytesFingerprint).toBeNull();
    expect(malformedHex.rejectedInputEvidence?.rawOutputFingerprint).toBeNull();
  });

  test("early malformed inputs do not receive trusted rejected summaries but remain deterministic", () => {
    const valid = buildCanonicalPorcelainStatusCompletionInput("");
    const unknownField = buildPureByteOrientedPorcelainStatusCompletion({ ...valid, callerLimitBytes: 5 });
    const malformedIdentity = buildPureByteOrientedPorcelainStatusCompletion({ ...valid, boundaryId: "wrong", stdoutOverflow: true });
    const malformedNumeric = buildPureByteOrientedPorcelainStatusCompletion({ ...valid, stdoutOverflow: true, stdoutByteCount: Number.NaN, combinedByteCount: Number.NaN });
    const malformedNumericAgain = buildPureByteOrientedPorcelainStatusCompletion({ ...valid, stdoutOverflow: true, stdoutByteCount: Number.NaN, combinedByteCount: Number.NaN });
    expect(unknownField.rejectedInputEvidence).toBeNull();
    expect(malformedIdentity.rejectedInputEvidence).toBeNull();
    expect(malformedNumeric.rejectedInputEvidence).toBeNull();
    expect(malformedNumeric.resultFingerprint).toBe(malformedNumericAgain.resultFingerprint);
    expect(unknownField).not.toHaveProperty("stdoutBytesHex");
    expect(malformedIdentity).not.toHaveProperty("stdoutBytesHex");
  });

  test("validator rejects recomputed accepted-evidence overflow and truncation forgeries", () => {
    const good = accepted("");
    for (const [patch, expected] of [
      [{ stdoutOverflow: true as false }, "stdout_overflow_rejected"],
      [{ stderrOverflow: true as false }, "stderr_overflow_rejected"],
      [{ combinedOverflow: true as false }, "combined_overflow_rejected"],
      [{ stdoutTruncated: true as false }, "truncated_output_rejected"],
      [{ stdoutOverflow: true as false, stderrOverflow: true as false }, "stdout_overflow_rejected"],
      [{ stdoutOverflow: true as false, combinedOverflow: true as false }, "stdout_overflow_rejected"],
      [{ stderrOverflow: true as false, combinedOverflow: true as false }, "stderr_overflow_rejected"],
      [{ stdoutOverflow: true as false, stderrOverflow: true as false, combinedOverflow: true as false }, "stdout_overflow_rejected"],
      [{ stdoutOverflow: true as false, stdoutTruncated: true as false }, "stdout_overflow_rejected"],
      [{ stderrOverflow: true as false, stderrTruncated: true as false }, "stderr_overflow_rejected"],
      [{ combinedOverflow: true as false, combinedTruncated: true as false }, "combined_overflow_rejected"],
    ] as const) {
      const reasons = invalidReasons(validatePureByteOrientedPorcelainStatusCompletionResult(recomputeResult(good, patch)));
      expect(reasons[0]).toBe(expected);
    }
  });

  test("rejects all non-normal lifecycle and stream states", () => {
    rejected("completion_state_rejected", "", { spawnAttempted: false as true });
    rejected("completion_state_rejected", "", { processCreated: false as true });
    rejected("completion_state_rejected", "", { processStartedObserved: false as true });
    rejected("completion_state_rejected", "", { spawnErrorObserved: true as false });
    rejected("completion_state_rejected", "", { completionCategory: "spawn_failed" as never });
    rejected("completion_state_rejected", "", { completionReason: "nonzero_exit" as never });
    rejected("exit_state_rejected", "", { exitCode: 1 as 0 });
    rejected("exit_state_rejected", "", { closeCode: 1 as 0 });
    rejected("signal_rejected", "", { signalObserved: true as false });
    rejected("signal_rejected", "", { signal: "SIGTERM" as unknown as null });
    rejected("stream_error_rejected", "", { stdoutStreamError: true as false });
    rejected("stream_error_rejected", "", { stderrStreamError: true as false });
    rejected("stream_error_rejected", "", { decodedStdoutTextPresent: true as false });
    rejected("stream_error_rejected", "", { replacementDecodingUsed: true as false });
    rejected("termination_state_rejected", "", { terminationRequested: true as false });
    rejected("retry_or_fallback_rejected", "", { retryCount: 1 as 0 });
    rejected("retry_or_fallback_rejected", "", { fallbackAttempted: true as false });
  });

  test("rejects authority runtime live toctou credential network and shell claims", () => {
    rejected("authority_rejected", "", { authority: "fixture_structural_only" as never });
    rejected("authority_rejected", "", { repositoryReadAuthorityGranted: true as false });
    rejected("authority_rejected", "", { processAuthorityGranted: true as false });
    rejected("authority_rejected", "", { compatibilityAuthorityGranted: true as false });
    rejected("runtime_claim_rejected", "", { runtimeActivated: true as false });
    rejected("runtime_claim_rejected", "", { shellUsed: true as false });
    rejected("runtime_claim_rejected", "", { pathLookupUsed: true as false });
    rejected("runtime_claim_rejected", "", { inheritedEnvironmentUsed: true as false });
    rejected("runtime_claim_rejected", "", { credentialsUsed: true as false });
    rejected("runtime_claim_rejected", "", { networkUsed: true as false });
    rejected("runtime_claim_rejected", "", { authorizationConsumed: true as false });
    rejected("live_claim_rejected", "", { observedLiveProcess: true as false });
    rejected("toctou_claim_rejected", "", { toctouEliminated: true as false });
  });

  test("validator rejects forged accepted results even when their fingerprints are recomputed", () => {
    const good = accepted(hex([0x00, 0x01]));
    expect(invalidReasons(validatePureByteOrientedPorcelainStatusCompletionResult(recomputeResult(good, { observedLiveProcess: true as false })))).toContain("live_claim_rejected");
    expect(invalidReasons(validatePureByteOrientedPorcelainStatusCompletionResult(recomputeResult(good, { processAuthorityGranted: true as false })))).toContain("authority_rejected");
    expect(invalidReasons(validatePureByteOrientedPorcelainStatusCompletionResult(recomputeResult(good, { runtimeActivated: true as false })))).toContain("runtime_claim_rejected");
    expect(invalidReasons(validatePureByteOrientedPorcelainStatusCompletionResult(recomputeResult(good, { stdoutBytesHex: "ff", stdoutByteCount: 1, combinedByteCount: 1 })))).toContain("input_fingerprint_rejected");
    expect(invalidReasons(validatePureByteOrientedPorcelainStatusCompletionResult({ ...good, resultFingerprint: "0".repeat(64) }))).toContain("input_fingerprint_rejected");
  });

  test("rejects unknown inherited accessor symbol class array and function shaped inputs", () => {
    const valid = buildCanonicalPorcelainStatusCompletionInput("");
    rejected("input_contract_rejected", "", { callerLimitBytes: 5 } as never);
    const inherited = Object.create({ hidden: true }) as PorcelainStatusCompletionInput;
    Object.assign(inherited, valid);
    expect(buildPureByteOrientedPorcelainStatusCompletion(inherited).blockingReasons).toContain("input_contract_rejected");
    const accessor = { ...valid };
    Object.defineProperty(accessor, "stdoutBytesHex", { get: () => "" });
    expect(buildPureByteOrientedPorcelainStatusCompletion(accessor).blockingReasons).toContain("input_contract_rejected");
    const symbolInput = { ...valid, [Symbol("secret")]: "value" };
    expect(buildPureByteOrientedPorcelainStatusCompletion(symbolInput).blockingReasons).toContain("input_contract_rejected");
    class Wrapped {
      contractKind = "pure_byte_oriented_porcelain_status_completion_contract";
    }
    expect(buildPureByteOrientedPorcelainStatusCompletion(new Wrapped()).blockingReasons).toContain("input_contract_rejected");
    expect(buildPureByteOrientedPorcelainStatusCompletion([]).blockingReasons).toContain("input_contract_rejected");
    expect(buildPureByteOrientedPorcelainStatusCompletion(() => valid).blockingReasons).toContain("input_contract_rejected");
  });

  test("fingerprints bind byte order source linkage worktree sequence timestamp identities and false live flags", () => {
    const base = accepted("0001");
    const byteOrder = accepted("0100");
    const source = accepted("0001", { sourceSpawnFingerprint: "f".repeat(64) });
    const worktree = accepted("0001", { workingDirectoryFingerprint: "e".repeat(64) });
    const sequence = accepted("0001", { observationSequenceIdentity: "git-porcelain-status-sequence-002" });
    const timestamp = accepted("0001", { evidenceTimestamp: "2026-07-19T12:01:00.000Z" });
    expect(new Set([
      base.resultFingerprint,
      byteOrder.resultFingerprint,
      source.resultFingerprint,
      worktree.resultFingerprint,
      sequence.resultFingerprint,
      timestamp.resultFingerprint,
    ]).size).toBe(6);
    expect(base.evidence?.stdoutBytesFingerprint).not.toBe(byteOrder.evidence?.stdoutBytesFingerprint);
  });

  test("rejected outputs retain no partial accepted stdout byte payload", () => {
    const result = rejected("stdout_hex_grammar_rejected", "zz");
    expect(result.evidence).toBeNull();
    expect(result).not.toHaveProperty("stdoutBytesHex");
    expect(result).not.toHaveProperty("stdoutByteCount");
    expect(result.authoritativeLive).toBe(false);
    expectFrozenDeep(result);
  });

  test("no runtime API UI runner neutralizer parser or migration caller imports the byte completion contract", () => {
    const hits = [
      "app/trade-app.tsx",
      "app/api/post-trade/payload/validate/route.ts",
      "lib/post-trade-dormant-server-only-neutralization-to-git-interpretation-orchestrator-core.ts",
      "lib/post-trade-dormant-server-only-spawn-to-raw-completion-neutralization-adapter-core.ts",
      "lib/post-trade-dormant-server-only-fixed-read-only-direct-spawn-adapter.ts",
      "lib/post-trade-dormant-server-only-first-live-staging-preflight-composition-adapter-core.ts",
    ].map((path) => source(path).includes("post-trade-pure-byte-oriented-porcelain-status-completion"));
    expect(hits.every((hit) => hit === false)).toBe(true);
  });
});
