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
  PURE_GIT_VERSION_INTERPRETATION_CONTRACT_IDENTITY,
  PURE_GIT_VERSION_INTERPRETATION_POLICY,
  buildPureGitVersionInterpretation,
  type PureGitVersionInterpretationReason,
} from "../../lib/post-trade-pure-git-version-interpretation-contract-core";

const repoRoot = process.cwd();
const corePath = "lib/post-trade-pure-git-version-interpretation-contract-core.ts";
const rawCorePath = "lib/post-trade-pure-raw-process-completion-evidence-contract-core.ts";
const apiPath = "app/api/post-trade/payload/validate/route.ts";
const tradeUiPath = "app/trade-app.tsx";

function source(path: string) {
  return readFileSync(join(repoRoot, path), "utf8");
}

function rawResult(stdoutText = "git version 2.45.1\n", patch: Partial<RawProcessCompletionEvidenceInput> = {}): RawProcessCompletionResult {
  const stdoutByteCount = Buffer.byteLength(stdoutText, "utf8");
  const stderrText = typeof patch.stderrText === "string" ? patch.stderrText : "";
  const stderrByteCount = typeof patch.stderrByteCount === "number" ? patch.stderrByteCount : Buffer.byteLength(stderrText, "utf8");
  const input = buildCanonicalRawCompletionFixtureInput("process_created_normal_zero_exit", {
    stdoutText,
    stdoutByteCount,
    stderrText,
    stderrByteCount,
    combinedByteCount: stdoutByteCount + stderrByteCount,
    ...patch,
  });
  return buildPureRawProcessCompletionEvidence(input);
}

function rawCategory(category: RawProcessCompletionCategory) {
  return buildPureRawProcessCompletionEvidence(buildCanonicalRawCompletionFixtureInput(category));
}

function accepted(input: unknown) {
  const result = buildPureGitVersionInterpretation(input);
  expect(result.status, JSON.stringify(result.blockingReasons)).toBe("accepted_fixture_git_version_interpretation");
  expect(result.blockingReasons).toEqual(["accepted"]);
  expect(result.evidence.status).toBe("accepted");
  expect(result.evidence.authority).toBe("none");
  expect(result.evidence.observedLiveProcess).toBe(false);
  return result;
}

function blocked(input: unknown, reason: PureGitVersionInterpretationReason) {
  const result = buildPureGitVersionInterpretation(input);
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

test.describe("pure Git version interpretation contract", () => {
  test("identity policy and source remain pure fixture-only inert and runtime-unreachable", () => {
    const core = source(corePath);
    const rawCore = source(rawCorePath);
    const api = source(apiPath);
    const tradeUi = source(tradeUiPath);
    expect(PURE_GIT_VERSION_INTERPRETATION_CONTRACT_IDENTITY).toMatchObject({
      contractId: "ture.execution.pure-git-version-interpretation-contract.fixture.v1",
      contractVersion: 1,
      boundaryId: "ture.execution.git-version-interpretation.fixture-boundary.v1",
      parserGrammarId: "ture.execution.git-version-grammar.strict-three-component-ascii.v1",
      normalizationId: "ture.execution.git-version-normalization.optional-single-final-lf.v1",
      fixtureOnly: true,
      observedLiveProcess: false,
      authority: "none",
    });
    expect(PURE_GIT_VERSION_INTERPRETATION_POLICY).toMatchObject({
      acceptedTool: "git",
      acceptedExecutable: "/usr/bin/git",
      acceptedArgv: ["--version"],
      exactComponentCount: 3,
      maxComponentDigits: 5,
      maxComponentValue: 65535,
      stderrMustBeEmpty: true,
      suffixAllowed: false,
      semverDependencyAllowed: false,
    });
    expect(Object.isFrozen(PURE_GIT_VERSION_INTERPRETATION_CONTRACT_IDENTITY)).toBe(true);
    expect(Object.isFrozen(PURE_GIT_VERSION_INTERPRETATION_POLICY)).toBe(true);
    expect(core).not.toContain('import "server-only"');
    expect(core).not.toMatch(/from\s+["']server-only["']|from\s+["']node:child_process["']|from\s+["']node:fs|from\s+["']fs\/promises|spawn\(|exec\(|execFile\(|fork\(|process\.env|process\.cwd|fetch\(|axios|keychain|keytar|osascript|createClient\(|\.insert\(|\.upsert\(|\.rpc\(|setTimeout|setInterval|Avanza|BankID/u);
    expect(core).toContain("node:crypto");
    expect(rawCore).toContain("buildPureRawProcessCompletionEvidence");
    expect(api).not.toContain("post-trade-pure-git-version-interpretation-contract");
    expect(tradeUi).not.toContain("post-trade-pure-git-version-interpretation-contract");
  });

  for (const [stdout, version, major, minor, patch] of [
    ["git version 0.0.0", "0.0.0", 0, 0, 0],
    ["git version 2.45.1", "2.45.1", 2, 45, 1],
    ["git version 65535.65535.65535", "65535.65535.65535", 65535, 65535, 65535],
    ["git version 2.45.1\n", "2.45.1", 2, 45, 1],
  ] as const) {
    test(`accepted form ${JSON.stringify(stdout)} parses immutable fixture evidence`, () => {
      const result = accepted(rawResult(stdout));
      expect(result.evidence.parsedVersion).toBe(version);
      expect(result.evidence.major).toBe(major);
      expect(result.evidence.minor).toBe(minor);
      expect(result.evidence.patch).toBe(patch);
      expect(result.evidence.componentCount).toBe(3);
      expect(result.evidence.suffixPresent).toBe(false);
      expect(result.evidence.stderrEmpty).toBe(true);
      expect(result.evidence.eligibleCompletion).toBe(true);
      expect(result.evidence.finalLfRemoved).toBe(stdout.endsWith("\n"));
      expect(result.evidence.cliVersionAuthorityGranted).toBe(false);
      expect(result.evidence.compatibilityAuthorityGranted).toBe(false);
      expect(result.evidence.runtimeActivated).toBe(false);
      expect(result.evidence.toctouEliminated).toBe(false);
      expect(Object.isFrozen(result)).toBe(true);
      expect(Object.isFrozen(result.evidence)).toBe(true);
    });
  }

  const completionCases: [string, unknown, PureGitVersionInterpretationReason][] = [
    ["wrong category", rawCategory("process_created_non_zero_exit"), "completion_category_rejected"],
    ["process not created", rawCategory("spawn_failed_before_process_creation"), "completion_category_rejected"],
    ["process not started", tamperResult(rawResult(), "evidence", { processStartedObserved: false }), "input_contract_rejected"],
    ["spawn error", rawCategory("child_process_error"), "completion_category_rejected"],
    ["non-zero exit", rawCategory("process_created_non_zero_exit"), "non_zero_exit"],
    ["signal termination", rawCategory("process_created_signal_termination"), "signal_termination"],
    ["close missing", rawCategory("process_close_without_exit"), "completion_category_rejected"],
    ["stdout stream error", rawCategory("stdout_stream_error"), "completion_category_rejected"],
    ["stderr stream error", rawCategory("stderr_stream_error"), "completion_category_rejected"],
    ["stdout overflow", rawCategory("stdout_output_limit_exceeded"), "completion_category_rejected"],
    ["stderr overflow", rawCategory("stderr_output_limit_exceeded"), "completion_category_rejected"],
    ["combined overflow", rawCategory("combined_output_limit_exceeded"), "completion_category_rejected"],
    ["invalid encoding", rawCategory("invalid_output_encoding"), "completion_category_rejected"],
    ["unexpected chunk", rawCategory("unexpected_stream_chunk"), "completion_category_rejected"],
    ["termination requested", rawCategory("internally_terminal_process_death_unconfirmed"), "completion_category_rejected"],
    ["retry/fallback tamper", tamperResult(rawResult(), "evidence", { retryCount: 1 }), "input_contract_rejected"],
    ["authority tamper", tamperResult(rawResult(), "evidence", { authority: "spawn" }), "input_contract_rejected"],
    ["live claim tamper", tamperResult(rawResult(), "evidence", { observedLiveProcess: true }), "input_fingerprint_rejected"],
    ["wrong tool tamper", tamperResult(rawResult(), "evidence", { toolIdentity: "supabase" }), "input_contract_rejected"],
    ["wrong path tamper", tamperResult(rawResult(), "evidence", { canonicalExecutablePath: "/opt/git" }), "input_contract_rejected"],
    ["wrong argv tamper", tamperResult(rawResult(), "evidence", { argv: ["status"] }), "input_contract_rejected"],
  ];

  for (const [name, input, reason] of completionCases) {
    test(`completion eligibility rejects ${name}`, () => {
      blocked(input, reason);
    });
  }

  const stderrCases: [string, Partial<RawProcessCompletionEvidenceInput>, PureGitVersionInterpretationReason][] = [
    ["one byte stderr", { stderrText: "x" }, "stderr_not_empty"],
    ["whitespace stderr", { stderrText: " " }, "stderr_not_empty"],
    ["warning stderr", { stderrText: "warning: ignored config\n" }, "stderr_not_empty"],
    ["stderr byte text mismatch tamper", { stderrText: "x", stderrByteCount: 0 }, "input_contract_rejected"],
  ];

  for (const [name, patch, reason] of stderrCases) {
    test(`stderr policy rejects ${name}`, () => {
      blocked(rawResult("git version 2.45.1\n", patch), reason);
    });
  }

  const outputCases: [string, string, PureGitVersionInterpretationReason][] = [
    ["empty stdout", "", "stdout_empty"],
    ["missing prefix", "version 2.45.1", "prefix_rejected"],
    ["wrong prefix case", "Git version 2.45.1", "prefix_rejected"],
    ["leading whitespace", " git version 2.45.1", "prefix_rejected"],
    ["trailing whitespace", "git version 2.45.1 ", "whitespace_rejected"],
    ["tab", "git version 2.45.1\t", "whitespace_rejected"],
    ["CRLF", "git version 2.45.1\r\n", "carriage_return_rejected"],
    ["bare CR", "git version 2.45.1\r", "carriage_return_rejected"],
    ["multiple lines", "git version 2.45.1\nextra", "stdout_multiple_lines"],
    ["two final LF", "git version 2.45.1\n\n", "stdout_multiple_lines"],
    ["NUL", "git version 2.45.1\0", "nul_rejected"],
    ["ANSI", "\u001b[32mgit version 2.45.1\u001b[0m", "ansi_escape_rejected"],
    ["control characters", "git version 2.45.1\u0007", "control_character_rejected"],
    ["extra text", "git version 2.45.1 extra", "suffix_rejected"],
  ];

  for (const [name, stdout, reason] of outputCases) {
    test(`stdout policy rejects ${name}`, () => {
      blocked(rawResult(stdout), reason);
    });
  }

  const grammarCases: [string, string, PureGitVersionInterpretationReason][] = [
    ["two components", "git version 2.45", "component_count_rejected"],
    ["four components", "git version 2.45.1.1", "component_count_rejected"],
    ["empty component", "git version 2..1", "version_grammar_rejected"],
    ["major leading zero", "git version 02.45.1", "leading_zero_rejected"],
    ["minor leading zero", "git version 2.045.1", "leading_zero_rejected"],
    ["patch leading zero", "git version 2.45.01", "leading_zero_rejected"],
    ["sign", "git version +2.45.1", "version_grammar_rejected"],
    ["unicode digits", "git version ٢.٤٥.١", "version_grammar_rejected"],
    ["suffix", "git version 2.45.1.windows.1", "suffix_rejected"],
    ["prerelease", "git version 2.45.1-rc1", "suffix_rejected"],
    ["build metadata", "git version 2.45.1+build", "suffix_rejected"],
    ["component above max", "git version 65536.1.1", "component_range_rejected"],
    ["component over five digits", "git version 100000.1.1", "component_digit_length_rejected"],
  ];

  for (const [name, stdout, reason] of grammarCases) {
    test(`grammar rejects ${name}`, () => {
      blocked(rawResult(stdout), reason);
    });
  }

  test("exact upper bound is accepted", () => {
    const result = accepted(rawResult("git version 65535.65535.65535"));
    expect(result.evidence.parsedVersion).toBe("65535.65535.65535");
  });

  test("schema closure rejects unknown keys inherited accessors symbols classes functions and parser injection", () => {
    const base = rawResult();
    blocked({ ...base, extra: true }, "input_contract_rejected");
    blocked(tamperResult(base, "evidence", { parserOptions: { trim: true } }), "input_contract_rejected");
    blocked(tamperResult(base, "evidence", { regex: ".*" }), "input_contract_rejected");
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
  });

  test("unsupported contract identities and malformed fingerprints fail closed", () => {
    const base = rawResult();
    blocked(tamperResult(base, "result", { contractId: "other" }), "unsupported_contract_identity");
    blocked(tamperResult(base, "result", { resultVersion: 2 }), "unsupported_contract_identity");
    blocked(tamperResult(base, "result", { resultFingerprint: "abc" }), "input_contract_rejected");
    blocked(tamperResult(base, "evidence", { evidenceFingerprint: "b".repeat(64) }), "input_fingerprint_rejected");
  });

  test("fingerprints are deterministic and bind stdout source fingerprint session purpose and policy", () => {
    const first = accepted(rawResult("git version 2.45.1\n"));
    const second = accepted(rawResult("git version 2.45.1\n"));
    const changedStdout = accepted(rawResult("git version 2.45.2\n"));
    const changedSource = accepted(rawResult("git version 2.45.1\n", { sourceSpawnFingerprint: "b".repeat(64) }));
    const changedSession = accepted(rawResult("git version 2.45.1\n", { boundarySessionId: "raw-completion-session-002" }));
    expect(second.resultFingerprint).toBe(first.resultFingerprint);
    expect(changedStdout.resultFingerprint).not.toBe(first.resultFingerprint);
    expect(changedSource.resultFingerprint).not.toBe(first.resultFingerprint);
    expect(changedSession.resultFingerprint).not.toBe(first.resultFingerprint);
    expect(first.evidence.sourceRawCompletionEvidenceFingerprint).toBe(rawResult("git version 2.45.1\n").evidence?.evidenceFingerprint);
    expect(first.evidence.spawnAuthorityGranted).toBe(false);
    expect(first.evidence.cliVersionAuthorityGranted).toBe(false);
  });

  test("input mutation cannot alter output and JSON clone remains fixture-only structural input", () => {
    const input = rawResult();
    const result = accepted(input);
    const cloned = JSON.parse(JSON.stringify(input)) as RawProcessCompletionResult;
    const clonedResult = accepted(cloned);
    expect(clonedResult.resultFingerprint).toBe(result.resultFingerprint);
    const mutable = input as RawProcessCompletionResult & { evidence: NonNullable<RawProcessCompletionResult["evidence"]> };
    expect(() => {
      (mutable.evidence as unknown as { stdoutText: string }).stdoutText = "git version 9.9.9";
    }).toThrow();
    expect(result.evidence.parsedVersion).toBe("2.45.1");
    expect(() => {
      (result.evidence as unknown as { parsedVersion: string }).parsedVersion = "9.9.9";
    }).toThrow();
  });
});
