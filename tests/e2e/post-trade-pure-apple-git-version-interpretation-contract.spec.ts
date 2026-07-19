import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  buildCanonicalRawCompletionFixtureInput,
  buildPureRawProcessCompletionEvidence,
  type RawProcessCompletionCategory,
  type RawProcessCompletionEvidenceInput,
  type RawProcessCompletionResult,
} from "../../lib/post-trade-pure-raw-process-completion-evidence-contract-core";
import {
  buildPureGitVersionInterpretation,
} from "../../lib/post-trade-pure-git-version-interpretation-contract-core";
import {
  PURE_APPLE_GIT_VERSION_INTERPRETATION_CONTRACT_IDENTITY,
  PURE_APPLE_GIT_VERSION_INTERPRETATION_POLICY,
  buildPureAppleGitVersionInterpretation,
  type PureAppleGitVersionInterpretationReason,
} from "../../lib/post-trade-pure-apple-git-version-interpretation-contract-core";

const repoRoot = process.cwd();
const appleCorePath = "lib/post-trade-pure-apple-git-version-interpretation-contract-core.ts";
const genericCorePath = "lib/post-trade-pure-git-version-interpretation-contract-core.ts";
const apiPath = "app/api/post-trade/payload/validate/route.ts";
const tradeUiPath = "app/trade-app.tsx";

function source(path: string) {
  return readFileSync(join(repoRoot, path), "utf8");
}

function rawResult(stdoutText = "git version 2.39.5 (Apple Git-154)\n", patch: Partial<RawProcessCompletionEvidenceInput> = {}): RawProcessCompletionResult {
  const stdoutByteCount = Buffer.byteLength(stdoutText, "utf8");
  const stderrText = typeof patch.stderrText === "string" ? patch.stderrText : "";
  const stderrByteCount = typeof patch.stderrByteCount === "number" ? patch.stderrByteCount : Buffer.byteLength(stderrText, "utf8");
  return buildPureRawProcessCompletionEvidence(buildCanonicalRawCompletionFixtureInput("process_created_normal_zero_exit", {
    stdoutText,
    stdoutByteCount,
    stderrText,
    stderrByteCount,
    combinedByteCount: stdoutByteCount + stderrByteCount,
    ...patch,
  }));
}

function rawCategory(category: RawProcessCompletionCategory) {
  return buildPureRawProcessCompletionEvidence(buildCanonicalRawCompletionFixtureInput(category, {
    stdoutText: "git version 2.39.5 (Apple Git-154)\n",
    stdoutByteCount: Buffer.byteLength("git version 2.39.5 (Apple Git-154)\n", "utf8"),
  }));
}

function accepted(input: unknown) {
  const result = buildPureAppleGitVersionInterpretation(input);
  expect(result.status, JSON.stringify(result.blockingReasons)).toBe("accepted_fixture_apple_git_version_interpretation");
  expect(result.blockingReasons).toEqual(["accepted"]);
  expect(result.evidence.status).toBe("accepted");
  expect(result.evidence.authority).toBe("none");
  expect(result.evidence.observedLiveProcess).toBe(false);
  return result;
}

function blocked(input: unknown, reason: PureAppleGitVersionInterpretationReason) {
  const result = buildPureAppleGitVersionInterpretation(input);
  expect(result.status).toBe("blocked_fail_closed");
  expect(result.blockingReasons).toContain(reason);
  expect(result.evidence.status).toBe("rejected");
  expect(result.evidence.authority).toBe("none");
  expect(result.evidence.observedLiveProcess).toBe(false);
  return result;
}

function tamperResult(result: RawProcessCompletionResult, path: "result" | "evidence", changes: Record<string, unknown>) {
  if (path === "result") return { ...result, ...changes };
  return { ...result, evidence: { ...result.evidence, ...changes } };
}

test.describe("pure Apple Git version interpretation contract", () => {
  test("identity policy and source remain pure fixture-only inert and runtime-unreachable", () => {
    const appleCore = source(appleCorePath);
    const genericCore = source(genericCorePath);
    const api = source(apiPath);
    const tradeUi = source(tradeUiPath);
    expect(PURE_APPLE_GIT_VERSION_INTERPRETATION_CONTRACT_IDENTITY).toMatchObject({
      contractId: "ture.execution.pure-apple-git-version-interpretation-contract.fixture.v1",
      boundaryId: "ture.execution.apple-git-version-interpretation.fixture-boundary.v1",
      parserGrammarId: "ture.execution.apple-git-version-grammar.exact-upstream-three-component-apple-build-integer.v1",
      normalizationId: "ture.execution.apple-git-version-normalization.optional-single-final-lf.v1",
      vendorIdentity: "apple-git",
      fixtureOnly: true,
      observedLiveProcess: false,
      authority: "none",
    });
    expect(PURE_APPLE_GIT_VERSION_INTERPRETATION_POLICY).toMatchObject({
      acceptedTool: "git",
      acceptedPlatform: "macos",
      acceptedExecutable: "/usr/bin/git",
      acceptedArgv: ["--version"],
      acceptedVendorLabel: "Apple Git",
      upstreamMaxComponentDigits: 5,
      upstreamMaxComponentValue: 65535,
      appleBuildMaxDigits: 8,
      appleBuildMaxValue: 99999999,
    });
    expect(Object.isFrozen(PURE_APPLE_GIT_VERSION_INTERPRETATION_CONTRACT_IDENTITY)).toBe(true);
    expect(Object.isFrozen(PURE_APPLE_GIT_VERSION_INTERPRETATION_POLICY)).toBe(true);
    expect(appleCore).not.toContain('import "server-only"');
    expect(appleCore).not.toMatch(/from\s+["']server-only["']|from\s+["']node:child_process["']|from\s+["']node:fs|from\s+["']fs\/promises|spawn\(|exec\(|execFile\(|fork\(|process\.env|process\.cwd|fetch\(|axios|keychain|keytar|osascript|createClient\(|\.insert\(|\.upsert\(|\.rpc\(|setTimeout|setInterval|Avanza|BankID/u);
    expect(appleCore).toContain("node:crypto");
    expect(genericCore).toContain("suffixAllowed: false");
    expect(api).not.toContain("post-trade-pure-apple-git-version-interpretation-contract");
    expect(tradeUi).not.toContain("post-trade-pure-apple-git-version-interpretation-contract");
  });

  for (const [stdout, version, major, minor, patch, build] of [
    ["git version 2.39.5 (Apple Git-154)", "2.39.5", 2, 39, 5, 154],
    ["git version 2.39.5 (Apple Git-154)\n", "2.39.5", 2, 39, 5, 154],
    ["git version 0.0.0 (Apple Git-0)", "0.0.0", 0, 0, 0, 0],
    ["git version 65535.65535.65535 (Apple Git-99999999)", "65535.65535.65535", 65535, 65535, 65535, 99999999],
  ] as const) {
    test(`accepted Apple form ${JSON.stringify(stdout)} parses upstream and vendor metadata`, () => {
      const result = accepted(rawResult(stdout));
      expect(result.evidence.upstreamVersionString).toBe(version);
      expect(result.evidence.upstreamMajor).toBe(major);
      expect(result.evidence.upstreamMinor).toBe(minor);
      expect(result.evidence.upstreamPatch).toBe(patch);
      expect(result.evidence.upstreamComponentCount).toBe(3);
      expect(result.evidence.upstreamSuffixPresent).toBe(false);
      expect(result.evidence.vendorSuffixPresent).toBe(true);
      expect(result.evidence.appleVendorLabel).toBe("Apple Git");
      expect(result.evidence.appleBuildString).toBe(String(build));
      expect(result.evidence.appleBuildNumber).toBe(build);
      expect(result.evidence.appleBuildComponentCount).toBe(1);
      expect(result.evidence.finalLfRemoved).toBe(stdout.endsWith("\n"));
      expect(result.evidence.originalRawStdoutByteCount).toBe(Buffer.byteLength(stdout, "utf8"));
      expect(result.evidence.normalizedStdoutByteCount).toBe(Buffer.byteLength(stdout.endsWith("\n") ? stdout.slice(0, -1) : stdout, "utf8"));
      expect(result.evidence.compatibilityAuthorityGranted).toBe(false);
      expect(result.evidence.runtimeAuthorityGranted).toBe(false);
      expect(result.evidence.stagingAuthorityGranted).toBe(false);
      expect(result.evidence.deploymentAuthorityGranted).toBe(false);
      expect(result.evidence.toctouEliminated).toBe(false);
      expect(Object.isFrozen(result)).toBe(true);
      expect(Object.isFrozen(result.evidence)).toBe(true);
    });
  }

  test("generic and Apple parser outputs remain separated", () => {
    blocked(rawResult("git version 2.39.5\n"), "parentheses_rejected");
    expect(buildPureGitVersionInterpretation(rawResult("git version 2.39.5 (Apple Git-154)\n")).status).toBe("blocked_fail_closed");
    expect(buildPureGitVersionInterpretation(rawResult("git version 2.39.5\n")).status).toBe("accepted_fixture_git_version_interpretation");
    for (const stdout of [
      "git version 2.39.5 (Other Git-154)\n",
      "git version 2.39.5 (apple git-154)\n",
      "git version 2.39.5 (Apple git-154)\n",
    ]) blocked(rawResult(stdout), "vendor_label_rejected");
  });

  for (const [name, stdout, reason] of [
    ["empty stdout", "", "stdout_empty"],
    ["missing prefix", "version 2.39.5 (Apple Git-154)", "prefix_rejected"],
    ["wrong prefix case", "Git version 2.39.5 (Apple Git-154)", "prefix_rejected"],
    ["leading whitespace", " git version 2.39.5 (Apple Git-154)", "prefix_rejected"],
    ["trailing whitespace", "git version 2.39.5 (Apple Git-154) ", "whitespace_rejected"],
    ["tab", "git version 2.39.5\t(Apple Git-154)", "whitespace_rejected"],
    ["CRLF", "git version 2.39.5 (Apple Git-154)\r\n", "carriage_return_rejected"],
    ["bare CR", "git version 2.39.5 (Apple Git-154)\r", "carriage_return_rejected"],
    ["multiple lines", "git version 2.39.5 (Apple Git-154)\nextra", "stdout_multiple_lines"],
    ["two final LF", "git version 2.39.5 (Apple Git-154)\n\n", "stdout_multiple_lines"],
    ["missing opening parenthesis", "git version 2.39.5 Apple Git-154)", "parentheses_rejected"],
    ["missing closing parenthesis", "git version 2.39.5 (Apple Git-154", "parentheses_rejected"],
    ["extra parenthesis", "git version 2.39.5 ((Apple Git-154))", "unexpected_extra_text"],
    ["missing required space", "git version 2.39.5(Apple Git-154)", "apple_suffix_rejected"],
    ["extra spaces", "git version 2.39.5  (Apple Git-154)", "apple_suffix_rejected"],
    ["text after closing parenthesis", "git version 2.39.5 (Apple Git-154) extra", "unexpected_extra_text"],
    ["NUL", "git version 2.39.5 (Apple Git-154)\0", "nul_rejected"],
    ["ANSI", "\u001b[32mgit version 2.39.5 (Apple Git-154)\u001b[0m", "ansi_escape_rejected"],
    ["control character", "git version 2.39.5 (Apple Git-154)\u0007", "control_character_rejected"],
  ] as const) {
    test(`stdout shape rejects ${name}`, () => {
      blocked(rawResult(stdout), reason);
    });
  }

  for (const [name, stdout, reason] of [
    ["two upstream components", "git version 2.39 (Apple Git-154)", "upstream_version_grammar_rejected"],
    ["four upstream components", "git version 2.39.5.1 (Apple Git-154)", "upstream_version_grammar_rejected"],
    ["empty upstream component", "git version 2..5 (Apple Git-154)", "upstream_version_grammar_rejected"],
    ["signed upstream", "git version +2.39.5 (Apple Git-154)", "unexpected_extra_text"],
    ["unicode upstream digits", "git version ٢.٣٩.٥ (Apple Git-154)", "unexpected_extra_text"],
    ["upstream leading zero", "git version 02.39.5 (Apple Git-154)", "upstream_leading_zero_rejected"],
    ["upstream above max", "git version 65536.39.5 (Apple Git-154)", "upstream_component_range_rejected"],
    ["upstream too many digits", "git version 100000.39.5 (Apple Git-154)", "upstream_component_digit_length_rejected"],
    ["upstream suffix", "git version 2.39.5-rc1 (Apple Git-154)", "unexpected_extra_text"],
    ["upstream build metadata", "git version 2.39.5+build (Apple Git-154)", "unexpected_extra_text"],
  ] as const) {
    test(`upstream grammar rejects ${name}`, () => {
      blocked(rawResult(stdout), reason);
    });
  }

  for (const [name, stdout, reason] of [
    ["missing Apple", "git version 2.39.5 (Git-154)", "vendor_label_rejected"],
    ["missing Git", "git version 2.39.5 (Apple-154)", "vendor_label_rejected"],
    ["wrong case", "git version 2.39.5 (APPLE Git-154)", "vendor_label_rejected"],
    ["wrong hyphen", "git version 2.39.5 (Apple Git:154)", "apple_suffix_rejected"],
    ["empty build", "git version 2.39.5 (Apple Git-)", "apple_build_grammar_rejected"],
    ["signed build", "git version 2.39.5 (Apple Git-+154)", "apple_build_grammar_rejected"],
    ["unicode build", "git version 2.39.5 (Apple Git-١٥٤)", "apple_build_grammar_rejected"],
    ["leading zero build", "git version 2.39.5 (Apple Git-0154)", "apple_build_leading_zero_rejected"],
    ["dotted build", "git version 2.39.5 (Apple Git-154.1)", "apple_build_grammar_rejected"],
    ["alphabetic build", "git version 2.39.5 (Apple Git-154a)", "apple_build_grammar_rejected"],
    ["whitespace build", "git version 2.39.5 (Apple Git-154 1)", "apple_build_grammar_rejected"],
    ["too many build digits", "git version 2.39.5 (Apple Git-100000000)", "apple_build_digit_length_rejected"],
    ["build above max", "git version 2.39.5 (Apple Git-999999999)", "apple_build_digit_length_rejected"],
    ["second suffix", "git version 2.39.5 (Apple Git-154) (x)", "unexpected_extra_text"],
    ["arbitrary parenthetical", "git version 2.39.5 (Apple Git-154-custom)", "apple_build_grammar_rejected"],
  ] as const) {
    test(`Apple build grammar rejects ${name}`, () => {
      blocked(rawResult(stdout), reason);
    });
  }

  for (const [name, input, reason] of [
    ["wrong category", rawCategory("process_created_non_zero_exit"), "input_status_rejected"],
    ["non-zero exit", rawCategory("process_created_non_zero_exit"), "input_status_rejected"],
    ["signal", rawCategory("process_created_signal_termination"), "input_status_rejected"],
    ["stream error", rawCategory("stdout_stream_error"), "input_status_rejected"],
    ["overflow", rawCategory("stdout_output_limit_exceeded"), "input_status_rejected"],
    ["invalid encoding", rawCategory("invalid_output_encoding"), "input_status_rejected"],
    ["unexpected chunk", rawCategory("unexpected_stream_chunk"), "input_status_rejected"],
    ["termination", rawCategory("internally_terminal_process_death_unconfirmed"), "input_status_rejected"],
    ["non-empty stderr", rawResult("git version 2.39.5 (Apple Git-154)\n", { stderrText: "warning\n" }), "stderr_not_empty"],
  ] as const) {
    test(`completion/source eligibility rejects ${name}`, () => {
      blocked(input, reason);
    });
  }

  test("tampered raw identities fingerprints platform tool executable argv and authority fail closed", () => {
    const base = rawResult();
    blocked(tamperResult(base, "result", { contractId: "other" }), "input_identity_rejected");
    blocked(tamperResult(base, "result", { status: "blocked_fail_closed" }), "input_status_rejected");
    blocked(tamperResult(base, "evidence", { evidenceFingerprint: "b".repeat(64) }), "input_fingerprint_rejected");
    blocked(tamperResult(base, "evidence", { sourceSpawnFingerprint: "b".repeat(64) }), "input_fingerprint_rejected");
    blocked(tamperResult(base, "evidence", { platform: "linux" }), "input_contract_rejected");
    blocked(tamperResult(base, "evidence", { toolIdentity: "supabase_cli" }), "input_contract_rejected");
    blocked(tamperResult(base, "evidence", { canonicalExecutablePath: "/opt/homebrew/bin/git" }), "input_contract_rejected");
    blocked(tamperResult(base, "evidence", { argv: ["status"] }), "input_contract_rejected");
    blocked(tamperResult(base, "evidence", { authority: "spawn" }), "input_contract_rejected");
    blocked(tamperResult(base, "evidence", { runtimeActivated: true }), "input_contract_rejected");
    blocked(tamperResult(base, "evidence", { observedLiveProcess: true }), "input_fingerprint_rejected");
    blocked(tamperResult(base, "evidence", { toctouEliminated: true }), "input_contract_rejected");
  });

  test("schema closure rejects unknown fields accessors symbols classes functions arrays and parser injection", () => {
    const base = rawResult();
    blocked({ ...base, extra: true }, "input_contract_rejected");
    blocked(tamperResult(base, "evidence", { parserOptions: { trim: true } }), "input_contract_rejected");
    blocked(tamperResult(base, "evidence", { vendorLabel: "Apple Git" }), "input_contract_rejected");
    blocked(tamperResult(base, "evidence", { normalization: "strip_suffix" }), "input_contract_rejected");
    const inherited = Object.create({ inherited: true }) as Record<string, unknown>;
    Object.assign(inherited, base);
    blocked(inherited, "input_contract_rejected");
    const accessor = { ...base };
    Object.defineProperty(accessor, "resultFingerprint", { get: () => base.resultFingerprint, enumerable: true });
    blocked(accessor, "input_contract_rejected");
    blocked({ ...base, [Symbol("secret")]: true }, "input_contract_rejected");
    class CustomInput {}
    blocked(new CustomInput(), "input_contract_rejected");
    blocked(() => base, "input_contract_rejected");
    blocked([base], "input_contract_rejected");
  });

  test("rejected result contains no partial parsed output or vendor metadata", () => {
    const result = blocked(rawResult("git version 2.39.5 (Apple Git-154.1)\n"), "apple_build_grammar_rejected");
    expect(result.evidence.upstreamVersionString).toBeNull();
    expect(result.evidence.upstreamMajor).toBeNull();
    expect(result.evidence.appleVendorLabel).toBeNull();
    expect(result.evidence.appleBuildString).toBeNull();
    expect(result.evidence.appleBuildNumber).toBeNull();
    expect(result.evidence.appleBuildMetadataFingerprint).toBeNull();
    expect(result.evidence.compatibilityAuthorityGranted).toBe(false);
  });

  test("fingerprints are deterministic and bind upstream Apple build source session and LF posture", () => {
    const first = accepted(rawResult("git version 2.39.5 (Apple Git-154)\n"));
    const second = accepted(rawResult("git version 2.39.5 (Apple Git-154)\n"));
    const changedPatch = accepted(rawResult("git version 2.39.6 (Apple Git-154)\n"));
    const changedBuild = accepted(rawResult("git version 2.39.5 (Apple Git-155)\n"));
    const changedSource = accepted(rawResult("git version 2.39.5 (Apple Git-154)\n", { sourceSpawnFingerprint: "b".repeat(64) }));
    const changedSession = accepted(rawResult("git version 2.39.5 (Apple Git-154)\n", { boundarySessionId: "raw-completion-session-002" }));
    const noLf = accepted(rawResult("git version 2.39.5 (Apple Git-154)"));
    expect(second.resultFingerprint).toBe(first.resultFingerprint);
    expect(changedPatch.resultFingerprint).not.toBe(first.resultFingerprint);
    expect(changedBuild.resultFingerprint).not.toBe(first.resultFingerprint);
    expect(changedSource.resultFingerprint).not.toBe(first.resultFingerprint);
    expect(changedSession.resultFingerprint).not.toBe(first.resultFingerprint);
    expect(noLf.resultFingerprint).not.toBe(first.resultFingerprint);
    expect(first.evidence.appleBuildMetadataFingerprint).not.toBeNull();
    expect(first.evidence.compatibilityAuthorityGranted).toBe(false);
  });

  test("output is deeply frozen and input mutation cannot alter result", () => {
    const input = rawResult("git version 2.39.5 (Apple Git-154)\n");
    const result = accepted(input);
    const fingerprint = result.resultFingerprint;
    expect(() => {
      (input.evidence as unknown as { stdoutText: string }).stdoutText = "git version 9.9.9 (Apple Git-999)\n";
    }).toThrow(TypeError);
    expect(result.resultFingerprint).toBe(fingerprint);
    expect(result.evidence.upstreamVersionString).toBe("2.39.5");
    expect(Object.isFrozen(result)).toBe(true);
    expect(Object.isFrozen(result.evidence)).toBe(true);
    expect(Object.isFrozen(result.evidence.reasons)).toBe(true);
    expect(JSON.parse(JSON.stringify(result)).evidence.authority).toBe("none");
  });
});
