import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  buildCanonicalPorcelainStatusCompletionInput,
  buildPureByteOrientedPorcelainStatusCompletion,
  type PorcelainStatusCompletionInput,
  type PorcelainStatusCompletionResult,
} from "../../lib/post-trade-pure-byte-oriented-porcelain-status-completion-contract-core";
import {
  PURE_READ_ONLY_GIT_PORCELAIN_STATUS_ACCEPTED_STATUS_TABLE,
  PURE_READ_ONLY_GIT_PORCELAIN_STATUS_INTERPRETATION_CONTRACT_IDENTITY,
  PURE_READ_ONLY_GIT_PORCELAIN_STATUS_INTERPRETATION_POLICY,
  buildPureReadOnlyGitPorcelainStatusInterpretation,
  canonicalize,
  identityFingerprint,
  policyFingerprint,
  type PureGitPorcelainStatusInterpretationReason,
} from "../../lib/post-trade-pure-read-only-git-porcelain-status-interpretation-contract-core";

const repoRoot = process.cwd();
const modulePath = "lib/post-trade-pure-read-only-git-porcelain-status-interpretation-contract-core.ts";

function source(path: string) {
  return readFileSync(join(repoRoot, path), "utf8");
}

function hex(bytes: readonly number[]) {
  return bytes.map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function asciiBytes(value: string) {
  return [...value].map((item) => item.charCodeAt(0));
}

function record(statusPair: string, pathBytes: readonly number[]) {
  return [...asciiBytes(statusPair), 0x20, ...pathBytes, 0x00];
}

function stdoutHex(records: readonly (readonly number[])[]) {
  return hex(records.flatMap((item) => [...item]));
}

function buildCompletion(stdoutBytesHex = "", patch: Partial<PorcelainStatusCompletionInput> = {}) {
  return buildPureByteOrientedPorcelainStatusCompletion(buildCanonicalPorcelainStatusCompletionInput(stdoutBytesHex, patch));
}

function interpret(stdoutBytesHex = "", patch: Partial<PorcelainStatusCompletionInput> = {}) {
  return buildPureReadOnlyGitPorcelainStatusInterpretation(buildCompletion(stdoutBytesHex, patch));
}

function accepted(status: "accepted_clean" | "accepted_dirty", stdoutBytesHex = "", patch: Partial<PorcelainStatusCompletionInput> = {}) {
  const first = interpret(stdoutBytesHex, patch);
  const second = interpret(stdoutBytesHex, patch);
  expect(first).toEqual(second);
  expect(first.status, JSON.stringify(first.blockingReasons)).toBe(status);
  expect(first.evidence).not.toBeNull();
  expect(first.reason).toBe(status === "accepted_clean" ? "clean" : "dirty");
  expect(first.blockingReasons).toEqual([first.reason]);
  expect(first.authority).toBe("none");
  expect(first.observedLiveProcess).toBe(false);
  expect(first.runtimeActivated).toBe(false);
  expect(first.compatibilityAuthorityGranted).toBe(false);
  expect(first.repositoryReadAuthorityGranted).toBe(false);
  expect(first.deploymentAuthorityGranted).toBe(false);
  expect(first.resultFingerprint).toMatch(/^[a-f0-9]{64}$/u);
  expectFrozenDeep(first);
  return first;
}

function rejected(reason: PureGitPorcelainStatusInterpretationReason, stdoutBytesHex = "", patch: Partial<PorcelainStatusCompletionInput> = {}) {
  const first = interpret(stdoutBytesHex, patch);
  const second = interpret(stdoutBytesHex, patch);
  expect(first).toEqual(second);
  expect(first.status).toBe("rejected");
  expect(first.reason).toBe(reason);
  expect(first.blockingReasons[0]).toBe(reason);
  expect(first.evidence).toBeNull();
  expect(first.authority).toBe("none");
  expect(first.observedLiveProcess).toBe(false);
  expect(first.runtimeActivated).toBe(false);
  expect(first.compatibilityAuthorityGranted).toBe(false);
  expect(first.repositoryReadAuthorityGranted).toBe(false);
  expect(first.deploymentAuthorityGranted).toBe(false);
  expect(first.resultFingerprint).toMatch(/^[a-f0-9]{64}$/u);
  expect(first).not.toHaveProperty("recordSummaries");
  expect(first).not.toHaveProperty("statusCodeBreakdown");
  expect(first).not.toHaveProperty("parsedPaths");
  expectFrozenDeep(first);
  return first;
}

function expectFrozenDeep(value: unknown) {
  expect(Object.isFrozen(value)).toBe(true);
  if (value && typeof value === "object") {
    for (const child of Object.values(value)) {
      if (child && typeof child === "object") expect(Object.isFrozen(child)).toBe(true);
    }
  }
}

function mutateCompletionResult(result: PorcelainStatusCompletionResult, evidencePatch: Partial<NonNullable<PorcelainStatusCompletionResult["evidence"]>>) {
  expect(result.evidence).not.toBeNull();
  return {
    ...result,
    evidence: {
      ...result.evidence,
      ...evidencePatch,
    },
  };
}

test.describe("pure read-only Git porcelain status interpretation contract", () => {
  test("identity policy and accepted status tables are immutable fixture-only contracts", () => {
    expect(PURE_READ_ONLY_GIT_PORCELAIN_STATUS_INTERPRETATION_CONTRACT_IDENTITY).toMatchObject({
      contractKind: "pure_read_only_git_porcelain_status_interpretation_contract",
      contractId: "ture.execution.pure-read-only-git-porcelain-status-interpretation-contract.fixture.v1",
      boundaryId: "ture.execution.read-only-git-porcelain-status-interpretation.fixture-boundary.v1",
      capabilityIdentity: "git_porcelain_status_v1",
      capabilityPurpose: "git_porcelain_status",
      fixtureOnly: true,
      observedLiveProcess: false,
      authority: "none",
    });
    expect(PURE_READ_ONLY_GIT_PORCELAIN_STATUS_INTERPRETATION_POLICY.argv).toEqual([
      "status",
      "--porcelain=v1",
      "-z",
      "--untracked-files=all",
      "--no-renames",
      "--ignore-submodules=none",
    ]);
    expect(PURE_READ_ONLY_GIT_PORCELAIN_STATUS_INTERPRETATION_POLICY.maxRecordCount).toBe(2048);
    expect(PURE_READ_ONLY_GIT_PORCELAIN_STATUS_INTERPRETATION_POLICY.maxPathBytesPerRecord).toBe(4096);
    expect(PURE_READ_ONLY_GIT_PORCELAIN_STATUS_INTERPRETATION_POLICY.renameCopyAccepted).toBe(false);
    expect(PURE_READ_ONLY_GIT_PORCELAIN_STATUS_INTERPRETATION_POLICY.ignoredRecordsAccepted).toBe(false);
    expect(Object.isFrozen(PURE_READ_ONLY_GIT_PORCELAIN_STATUS_INTERPRETATION_CONTRACT_IDENTITY)).toBe(true);
    expect(Object.isFrozen(PURE_READ_ONLY_GIT_PORCELAIN_STATUS_INTERPRETATION_POLICY)).toBe(true);
    expect(Object.isFrozen(PURE_READ_ONLY_GIT_PORCELAIN_STATUS_ACCEPTED_STATUS_TABLE.ordinary)).toBe(true);
    expect(identityFingerprint()).toMatch(/^[a-f0-9]{64}$/u);
    expect(policyFingerprint()).toMatch(/^[a-f0-9]{64}$/u);
  });

  test("production module remains pure and has no live side-effect dependency or caller wiring", () => {
    const text = source(modulePath);
    expect(text).not.toContain('import "server-only"');
    expect(text).not.toMatch(/from\s+["']node:fs|from\s+["']fs\/promises|from\s+["']node:child_process|spawn\(|exec\(|execFile\(|fork\(|process\.env|fetch\(|axios|keychain|keytar|osascript|createClient\(|\.insert\(|\.upsert\(|\.rpc\(|setTimeout|setInterval|TextDecoder|Buffer\.from/u);
    expect(text).not.toMatch(/decodeURIComponent|Intl\.|new URL|require\(/u);
    expect(source("app/trade-app.tsx")).not.toContain("post-trade-pure-read-only-git-porcelain-status-interpretation");
    expect(source("app/api/post-trade/payload/validate/route.ts")).not.toContain("post-trade-pure-read-only-git-porcelain-status-interpretation");
  });

  test("accepts empty stdout as clean without authority or live provenance", () => {
    const result = accepted("accepted_clean", "");
    expect(result.evidence?.clean).toBe(true);
    expect(result.evidence?.recordCount).toBe(0);
    expect(result.evidence?.recordSummaries).toEqual([]);
    expect(result.evidence?.orderedRecordFingerprint).toMatch(/^[a-f0-9]{64}$/u);
    expect(result.evidence?.rawByteCount).toBe(0);
    expect(result.evidence?.observedLiveProcess).toBe(false);
    expect(result.evidence?.toctouEliminated).toBe(false);
    expect(result.evidence?.repositoryReadAuthorityGranted).toBe(false);
    expect(result.evidence?.compatibilityAuthorityGranted).toBe(false);
  });

  test("accepts ordinary staged unstaged added deleted and type-change records as dirty summaries", () => {
    const output = stdoutHex([
      record("M ", asciiBytes("staged.txt")),
      record(" M", asciiBytes("unstaged.txt")),
      record("A ", asciiBytes("added.txt")),
      record(" D", asciiBytes("deleted.txt")),
      record("T ", asciiBytes("type.txt")),
    ]);
    const result = accepted("accepted_dirty", output);
    expect(result.evidence?.clean).toBe(false);
    expect(result.evidence?.recordCount).toBe(5);
    expect(result.evidence?.stagedChangeCount).toBe(3);
    expect(result.evidence?.unstagedChangeCount).toBe(2);
    expect(result.evidence?.untrackedCount).toBe(0);
    expect(result.evidence?.unmergedCount).toBe(0);
    expect(result.evidence?.statusCodeBreakdown["M "]).toBe(1);
    expect(result.evidence?.statusCodeBreakdown[" M"]).toBe(1);
  });

  test("accepts every reviewed ordinary tracked status pair from the closed table", () => {
    const output = stdoutHex(PURE_READ_ONLY_GIT_PORCELAIN_STATUS_ACCEPTED_STATUS_TABLE.ordinary.map((pair, index) => record(pair, asciiBytes(`ordinary-${index}`))));
    const result = accepted("accepted_dirty", output);
    expect(result.evidence?.recordCount).toBe(PURE_READ_ONLY_GIT_PORCELAIN_STATUS_ACCEPTED_STATUS_TABLE.ordinary.length);
    for (const pair of PURE_READ_ONLY_GIT_PORCELAIN_STATUS_ACCEPTED_STATUS_TABLE.ordinary) {
      expect(result.evidence?.statusCodeBreakdown[pair]).toBe(1);
    }
    expect(result.evidence?.untrackedCount).toBe(0);
    expect(result.evidence?.unmergedCount).toBe(0);
  });

  test("accepts untracked records without converting path bytes to text", () => {
    const output = stdoutHex([record("??", [0xff, 0xfe, 0x00 + 0x61])]);
    const result = accepted("accepted_dirty", output);
    const summary = result.evidence?.recordSummaries[0];
    expect(summary).toMatchObject({
      statusPair: "??",
      untracked: true,
      stagedChange: false,
      unstagedChange: false,
      unmerged: false,
      pathByteCount: 3,
    });
    expect(summary?.pathBytesFingerprint).toMatch(/^[a-f0-9]{64}$/u);
    expect(JSON.stringify(result)).not.toContain("fffea");
    expect(JSON.stringify(result)).not.toContain("�");
  });

  test("preserves privacy for spaces tabs newlines carriage returns quotes slashes leading dash controls and duplicate path bytes", () => {
    const strangePath = [
      ...asciiBytes("-leading dash"),
      0x09,
      ...asciiBytes("tab"),
      0x0a,
      ...asciiBytes("line"),
      0x0d,
      ...asciiBytes("\"quote\""),
      0x5c,
      ...asciiBytes("slash"),
      0x01,
      0x7f,
    ];
    const first = accepted("accepted_dirty", stdoutHex([
      record("M ", strangePath),
      record("M ", strangePath),
    ]));
    const reversed = accepted("accepted_dirty", stdoutHex([record("M ", [...strangePath].reverse())]));
    expect(first.evidence?.recordCount).toBe(2);
    expect(first.evidence?.recordSummaries[0]?.pathBytesFingerprint).toBe(first.evidence?.recordSummaries[1]?.pathBytesFingerprint);
    expect(first.evidence?.recordSummaries[0]?.recordFingerprint).not.toBe(first.evidence?.recordSummaries[1]?.recordFingerprint);
    expect(first.evidence?.recordSummaries[0]?.pathBytesFingerprint).not.toBe(reversed.evidence?.recordSummaries[0]?.pathBytesFingerprint);
    const serialized = JSON.stringify(first);
    expect(serialized).not.toContain("-leading dash");
    expect(serialized).not.toContain("quote");
    expect(serialized).not.toContain(hex(strangePath));
  });

  test("accepts every reviewed unmerged status pair as unmerged-only", () => {
    const pairs = ["DD", "AU", "UD", "UA", "DU", "AA", "UU"];
    const output = stdoutHex(pairs.map((pair, index) => record(pair, asciiBytes(`conflict-${index}`))));
    const result = accepted("accepted_dirty", output);
    expect(result.evidence?.recordCount).toBe(7);
    expect(result.evidence?.unmergedCount).toBe(7);
    expect(result.evidence?.stagedChangeCount).toBe(0);
    expect(result.evidence?.unstagedChangeCount).toBe(0);
    for (const pair of pairs) expect(result.evidence?.statusCodeBreakdown[pair as keyof NonNullable<typeof result.evidence>["statusCodeBreakdown"]]).toBe(1);
  });

  test("preserves deterministic record ordering in the ordered-record fingerprint", () => {
    const first = accepted("accepted_dirty", stdoutHex([
      record("M ", asciiBytes("a")),
      record(" M", asciiBytes("b")),
    ]));
    const second = accepted("accepted_dirty", stdoutHex([
      record(" M", asciiBytes("b")),
      record("M ", asciiBytes("a")),
    ]));
    expect(first.evidence?.orderedRecordFingerprint).not.toBe(second.evidence?.orderedRecordFingerprint);
    expect(first.resultFingerprint).not.toBe(second.resultFingerprint);
  });

  test("path byte fingerprints change when path bytes change while summaries stay path-private", () => {
    const first = accepted("accepted_dirty", stdoutHex([record("M ", asciiBytes("same-a"))]));
    const second = accepted("accepted_dirty", stdoutHex([record("M ", asciiBytes("same-b"))]));
    expect(first.evidence?.recordSummaries[0]?.pathBytesFingerprint).not.toBe(second.evidence?.recordSummaries[0]?.pathBytesFingerprint);
    expect(JSON.stringify(first)).not.toContain("same-a");
    expect(JSON.stringify(second)).not.toContain("same-b");
  });

  test("rejects rename and copy status bytes because the approved command uses no-renames", () => {
    for (const pair of ["R ", " R", "C ", " C", "RC"]) rejected("rename_or_copy_rejected", stdoutHex([record(pair, asciiBytes("renamed"))]));
  });

  test("rejects ignored records because the approved command does not request ignored output", () => {
    rejected("ignored_record_rejected", stdoutHex([record("!!", asciiBytes("ignored"))]));
  });

  test("rejects malformed NUL framing, empty records, short records, bad separators, empty paths, and unsupported prefixes", () => {
    rejected("malformed_nul_termination", hex([...asciiBytes("M "), 0x20, ...asciiBytes("a")]));
    rejected("empty_record_rejected", hex([0x00]));
    rejected("empty_record_rejected", hex([...record("M ", asciiBytes("a")), 0x00]));
    rejected("truncated_record", hex([0x4d, 0x00]));
    rejected("malformed_separator", hex([0x4d, 0x20, 0x09, 0x61, 0x00]));
    rejected("path_empty", hex([0x4d, 0x20, 0x20, 0x00]));
    rejected("malformed_status_prefix", hex([0x01, 0x20, 0x20, 0x61, 0x00]));
    rejected("unsupported_status_code", hex([0x5a, 0x20, 0x20, 0x61, 0x00]));
    rejected("impossible_status_combination", stdoutHex([record("  ", asciiBytes("not-clean-record"))]));
  });

  test("enforces record count and per-record path-byte limits", () => {
    const exactRecords = Array.from({ length: 2048 }, () => record("M ", asciiBytes("a")));
    expect(accepted("accepted_dirty", stdoutHex(exactRecords)).evidence?.recordCount).toBe(2048);
    const tooMany = Array.from({ length: 2049 }, () => record("M ", asciiBytes("a")));
    rejected("too_many_records", stdoutHex(tooMany));
    expect(accepted("accepted_dirty", stdoutHex([record("M ", Array.from({ length: 4096 }, () => 0x61))])).evidence?.recordSummaries[0]?.pathByteCount).toBe(4096);
    rejected("path_too_long", stdoutHex([record("M ", Array.from({ length: 4097 }, () => 0x61))]));
  });

  test("maps upstream rejected completion states to closed interpretation rejections", () => {
    rejected("output_overflow_rejected", "", { stderrBytesHex: "65", stderrByteCount: 1, combinedByteCount: 1 });
    rejected("output_overflow_rejected", "00", { stdoutOverflow: true as false });
    rejected("truncated_output_rejected", "00", { stdoutTruncated: true as false });
    rejected("stream_error_rejected", "00", { stdoutStreamError: true as false });
    rejected("completion_state_rejected", "00", { exitCode: 1 as 0 });
    rejected("termination_state_rejected", "00", { terminationAttempted: true as false });
    rejected("retry_or_fallback_rejected", "00", { retryCount: 1 as 0 });
  });

  test("rejects wrong identity, linkage, capability, platform, tool, executable, argv, authority, runtime, live, and TOCTOU claims", () => {
    rejected("input_identity_rejected", "", { boundaryId: "wrong" as PorcelainStatusCompletionInput["boundaryId"] });
    rejected("source_spawn_identity_rejected", "", { sourceSpawnContractId: "wrong" as PorcelainStatusCompletionInput["sourceSpawnContractId"] });
    rejected("source_linkage_rejected", "", { boundarySessionId: "" });
    rejected("capability_rejected", "", { capabilityPurpose: "wrong" as PorcelainStatusCompletionInput["capabilityPurpose"] });
    rejected("platform_rejected", "", { platform: "linux" as PorcelainStatusCompletionInput["platform"] });
    rejected("tool_rejected", "", { toolIdentity: "supabase" as PorcelainStatusCompletionInput["toolIdentity"] });
    rejected("executable_rejected", "", { canonicalExecutablePath: "/opt/homebrew/bin/git" as PorcelainStatusCompletionInput["canonicalExecutablePath"] });
    rejected("argv_rejected", "", { argv: ["status"] });
    rejected("authority_rejected", "", { repositoryReadAuthorityGranted: true as false });
    rejected("runtime_claim_rejected", "", { runtimeActivated: true as false });
    rejected("live_claim_rejected", "", { observedLiveProcess: true as false });
    rejected("toctou_claim_rejected", "", { toctouEliminated: true as false });
  });

  test("rejects stale copied fingerprints and altered accepted source evidence", () => {
    const sourceResult = buildCompletion(stdoutHex([record("M ", asciiBytes("a"))]));
    expect(sourceResult.status).toBe("accepted_fixture_byte_oriented_porcelain_status_completion");
    const staleResultFingerprint = buildPureReadOnlyGitPorcelainStatusInterpretation({
      ...sourceResult,
      resultFingerprint: "0".repeat(64),
    });
    expect(staleResultFingerprint.status).toBe("rejected");
    expect(staleResultFingerprint.reason).toBe("input_fingerprint_rejected");
    const alteredEvidence = buildPureReadOnlyGitPorcelainStatusInterpretation(mutateCompletionResult(sourceResult, {
      stdoutBytesHex: stdoutHex([record(" M", asciiBytes("b"))]),
      stdoutByteCount: 4,
      combinedByteCount: 4,
    }));
    expect(alteredEvidence.status).toBe("rejected");
    expect(alteredEvidence.reason).toBe("input_contract_rejected");
    const staleLink = buildPureReadOnlyGitPorcelainStatusInterpretation(mutateCompletionResult(sourceResult, {
      sourceSpawnFingerprint: "0".repeat(64),
    }));
    expect(staleLink.status).toBe("rejected");
    expect(staleLink.reason).toBe("input_fingerprint_rejected");
  });

  test("rejects malformed direct inputs and null without throwing", () => {
    for (const input of [null, undefined, true, "M a\0", { status: "accepted" }, []]) {
      const result = buildPureReadOnlyGitPorcelainStatusInterpretation(input);
      expect(result.status).toBe("rejected");
      expect(result.reason).toBe("input_contract_rejected");
      expect(result.evidence).toBeNull();
      expectFrozenDeep(result);
    }
  });

  test("result evidence links source fingerprints, policy, operation, session, and argv exactly", () => {
    const sourceResult = buildCompletion(stdoutHex([record("M ", asciiBytes("a"))]), {
      boundarySessionId: "session-action-592",
      workingDirectoryFingerprint: "e".repeat(64),
      observationSequenceIdentity: "sequence-action-592",
    });
    const result = buildPureReadOnlyGitPorcelainStatusInterpretation(sourceResult);
    expect(result.status).toBe("accepted_dirty");
    expect(result.evidence?.sourceCompletionResultFingerprint).toBe(sourceResult.resultFingerprint);
    expect(result.evidence?.sourceCompletionEvidenceFingerprint).toBe(sourceResult.evidence?.evidenceFingerprint);
    expect(result.evidence?.sourceSpawnFingerprint).toBe(sourceResult.evidence?.sourceSpawnFingerprint);
    expect(result.evidence?.boundarySessionId).toBe("session-action-592");
    expect(result.evidence?.workingDirectoryFingerprint).toBe("e".repeat(64));
    expect(result.evidence?.observationSequenceIdentity).toBe("sequence-action-592");
    expect(result.evidence?.argv).toEqual(PURE_READ_ONLY_GIT_PORCELAIN_STATUS_INTERPRETATION_POLICY.argv);
  });

  test("accepted evidence never exposes raw path bytes, raw paths, or decoded path strings", () => {
    const privatePath = asciiBytes("secret/local/path with spaces");
    const result = accepted("accepted_dirty", stdoutHex([record("M ", privatePath)]));
    const serialized = JSON.stringify(result);
    expect(serialized).not.toContain("secret/local/path");
    expect(serialized).not.toContain(hex(privatePath));
    expect(result.evidence?.recordSummaries[0]).not.toHaveProperty("path");
    expect(result.evidence?.recordSummaries[0]).not.toHaveProperty("pathBytes");
    expect(result.evidence?.recordSummaries[0]).not.toHaveProperty("pathBytesHex");
    expect(result.evidence?.recordSummaries[0]).not.toHaveProperty("decodedPath");
  });

  test("accepted evidence carries no ignored or submodule-specific claims", () => {
    const result = accepted("accepted_dirty", stdoutHex([record("M ", asciiBytes("submodule-like"))]));
    expect(result.evidence?.ignoredCount).toBe(0);
    expect(result.evidence?.submoduleChangeCount).toBe(0);
    expect(result.evidence?.recordSummaries[0]?.ignored).toBe(false);
    expect(result.evidence?.recordSummaries[0]?.submoduleChange).toBe(false);
  });

  test("changing trust-critical source fields changes the downstream result fingerprint", () => {
    const first = accepted("accepted_dirty", stdoutHex([record("M ", asciiBytes("a"))]), {
      sourceSpawnFingerprint: "a".repeat(64),
    });
    const second = accepted("accepted_dirty", stdoutHex([record("M ", asciiBytes("a"))]), {
      sourceSpawnFingerprint: "f".repeat(64),
    });
    expect(first.resultFingerprint).not.toBe(second.resultFingerprint);
    expect(first.evidence?.evidenceFingerprint).not.toBe(second.evidence?.evidenceFingerprint);
  });

  test("same input remains deterministic and independent of invocation order", () => {
    const output = stdoutHex([record("A ", asciiBytes("a")), record("??", asciiBytes("b"))]);
    const first = interpret(output);
    const noise = interpret(stdoutHex([record(" M", asciiBytes("noise"))]));
    const second = interpret(output);
    expect(noise.status).toBe("accepted_dirty");
    expect(first).toEqual(second);
    expect(canonicalize(first)).toBe(canonicalize(second));
  });

  test("input mutation after interpretation cannot alter the completed result", () => {
    const sourceResult = buildCompletion(stdoutHex([record("M ", asciiBytes("a"))]));
    const result = buildPureReadOnlyGitPorcelainStatusInterpretation(sourceResult);
    const mutableSource = sourceResult as { reason: string };
    expect(() => {
      mutableSource.reason = "changed";
    }).toThrow();
    expect(result.status).toBe("accepted_dirty");
    expect(result.evidence?.recordCount).toBe(1);
  });

  test("accepted result and nested evidence are deeply frozen", () => {
    const result = accepted("accepted_dirty", stdoutHex([record("M ", asciiBytes("a"))]));
    expect(() => {
      (result as { status: string }).status = "rejected";
    }).toThrow();
    expect(() => {
      (result.evidence?.recordSummaries[0] as { statusPair: string }).statusPair = "??";
    }).toThrow();
  });

  test("rejected result remains minimal and does not expose partial summaries", () => {
    const result = rejected("rename_or_copy_rejected", stdoutHex([record("R ", asciiBytes("private-rename-target"))]));
    expect(result.evidence).toBeNull();
    expect(JSON.stringify(result)).not.toContain("pathBytesFingerprint");
    expect(JSON.stringify(result)).not.toContain("statusCodeBreakdown");
    expect(JSON.stringify(result)).not.toContain("private-rename-target");
  });
});
