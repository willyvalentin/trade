import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  PURE_RAW_PROCESS_COMPLETION_EVIDENCE_CONTRACT_IDENTITY,
  PURE_RAW_PROCESS_COMPLETION_EVIDENCE_POLICY,
  buildCanonicalRawCompletionFixtureInput,
  buildPureRawProcessCompletionEvidence,
  validateRawProcessCompletionEvidenceInput,
  type RawProcessCompletionCategory,
  type RawProcessCompletionEvidenceInput,
  type RawProcessCompletionReason,
} from "../../lib/post-trade-pure-raw-process-completion-evidence-contract-core";

const repoRoot = process.cwd();
const corePath = "lib/post-trade-pure-raw-process-completion-evidence-contract-core.ts";
const apiPath = "app/api/post-trade/payload/validate/route.ts";
const tradeUiPath = "app/trade-app.tsx";

function source(path: string) {
  return readFileSync(join(repoRoot, path), "utf8");
}

function patch(base: RawProcessCompletionEvidenceInput, changes: Partial<RawProcessCompletionEvidenceInput> & Record<string, unknown>) {
  return { ...base, ...changes };
}

function accepted(input: RawProcessCompletionEvidenceInput) {
  const result = buildPureRawProcessCompletionEvidence(input);
  expect(result.status, JSON.stringify(result.blockingReasons)).toBe("accepted_fixture_raw_completion_evidence");
  expect(result.evidence).not.toBeNull();
  return result;
}

function blocked(input: unknown, reason: RawProcessCompletionReason) {
  const result = buildPureRawProcessCompletionEvidence(input);
  expect(result.status).toBe("blocked_fail_closed");
  expect(result.blockingReasons).toContain(reason);
  expect(result.evidence).toBeNull();
  return result;
}

test.describe("pure raw process completion evidence contract", () => {
  test("contract identity policy and static imports remain pure fixture-only and inert", () => {
    const core = source(corePath);
    const api = source(apiPath);
    const tradeUi = source(tradeUiPath);
    expect(PURE_RAW_PROCESS_COMPLETION_EVIDENCE_CONTRACT_IDENTITY).toMatchObject({
      contractKind: "pure_raw_process_completion_evidence_contract",
      contractVersion: 1,
      fixtureOnly: true,
      observedLiveProcess: false,
      authoritativeLive: false,
      authority: "none",
    });
    expect(PURE_RAW_PROCESS_COMPLETION_EVIDENCE_POLICY).toMatchObject({
      stdoutMaxBytes: 16384,
      stderrMaxBytes: 16384,
      combinedMaxBytes: 32768,
      outputRepresentation: "canonical_utf8_text_only",
      cliVersionInterpretationAllowed: false,
      runtimeActivationAllowed: false,
    });
    expect(Object.isFrozen(PURE_RAW_PROCESS_COMPLETION_EVIDENCE_CONTRACT_IDENTITY)).toBe(true);
    expect(Object.isFrozen(PURE_RAW_PROCESS_COMPLETION_EVIDENCE_POLICY)).toBe(true);
    expect(core).not.toContain('import "server-only"');
    expect(core).not.toMatch(/from\s+["']server-only["']|from\s+["']node:child_process["']|from\s+["']node:fs|from\s+["']fs\/promises|spawn\(|exec\(|execFile\(|fork\(|process\.env|process\.cwd|fetch\(|axios|keychain|keytar|osascript|createClient\(|\.insert\(|\.upsert\(|\.rpc\(|setTimeout|setInterval|Avanza|BankID/u);
    expect(api).not.toContain("post-trade-pure-raw-process-completion-evidence-contract");
    expect(tradeUi).not.toContain("post-trade-pure-raw-process-completion-evidence-contract");
  });

  const validCategories: RawProcessCompletionCategory[] = [
    "spawn_failed_before_process_creation",
    "process_created_normal_zero_exit",
    "process_created_non_zero_exit",
    "process_created_signal_termination",
    "child_process_error",
    "stdout_stream_error",
    "stderr_stream_error",
    "stdout_output_limit_exceeded",
    "stderr_output_limit_exceeded",
    "combined_output_limit_exceeded",
    "invalid_output_encoding",
    "unexpected_stream_chunk",
    "process_close_without_exit",
    "internally_terminal_process_death_unconfirmed",
  ];

  for (const category of validCategories) {
    test(`valid fixture category ${category} builds immutable fixture-only evidence`, () => {
      const input = buildCanonicalRawCompletionFixtureInput(category);
      const result = accepted(input);
      expect(result.evidence?.completionCategory).toBe(category);
      expect(result.fixtureOnly).toBe(true);
      expect(result.observedLiveProcess).toBe(false);
      expect(result.authority).toBe("none");
      expect(result.cliVersionInterpreted).toBe(false);
      expect(result.runtimeActivated).toBe(false);
      expect(result.evidence?.observedLiveProcess).toBe(false);
      expect(result.evidence?.authority).toBe("none");
      expect(Object.isFrozen(result)).toBe(true);
      expect(Object.isFrozen(result.evidence)).toBe(true);
    });
  }

  test("malformed completion category is represented only as blocked evidence", () => {
    blocked(buildCanonicalRawCompletionFixtureInput("malformed_completion_evidence"), "malformed_completion_evidence");
  });

  const contradictionCases: [string, Partial<RawProcessCompletionEvidenceInput>, RawProcessCompletionReason][] = [
    ["process created false with started true", { processCreated: false, processStartedObserved: true }, "process_state_contradiction"],
    ["spawn error with ordinary success", { spawnErrorObserved: true }, "spawn_state_contradiction"],
    ["normal close without close observed", { closeObserved: false }, "exit_close_contradiction"],
    ["non terminal evidence", { completionTerminal: false }, "terminal_state_contradiction"],
    ["exit code and signal both populated", { signalObserved: true, signal: "SIGTERM" }, "signal_code_contradiction"],
    ["termination signal without termination request", { terminationSignal: "SIGKILL" }, "termination_state_contradiction"],
    ["death confirmed without source", { processDeathConfirmed: true }, "death_confirmation_contradiction"],
    ["stdout overflow category mismatch", { stdoutOverflow: true }, "overflow_state_contradiction"],
    ["stderr overflow category mismatch", { stderrOverflow: true }, "overflow_state_contradiction"],
    ["combined overflow category mismatch", { combinedOverflow: true }, "overflow_state_contradiction"],
    ["stdout stream error category mismatch", { stdoutStreamError: true }, "stream_error_contradiction"],
    ["stderr stream error category mismatch", { stderrStreamError: true }, "stream_error_contradiction"],
    ["settled more than once or never", { settledExactlyOnce: false }, "terminal_state_contradiction"],
    ["retry rejected", { retryCount: 1 as 0 }, "retry_rejected"],
    ["fallback rejected", { fallbackAttempted: true as false }, "fallback_rejected"],
    ["authority rejected", { observerAuthorityGranted: true as false }, "authority_claim_rejected"],
    ["live observation rejected", { provenanceClassification: "production_live" as never }, "production_live_claim_rejected"],
    ["toctou rejected", { toctouEliminated: true as false }, "toctou_claim_rejected"],
  ];

  for (const [name, changes, reason] of contradictionCases) {
    test(`consistency rejection: ${name}`, () => {
      blocked(patch(buildCanonicalRawCompletionFixtureInput(), changes), reason);
    });
  }

  test("schema closure rejects unknown fields inherited fields accessors symbols exotic prototypes arrays null functions and unsupported enums", () => {
    const base = buildCanonicalRawCompletionFixtureInput();
    blocked({ ...base, extra: true }, "unknown_field");
    const inherited = Object.create({ inherited: true }) as Record<string, unknown>;
    Object.assign(inherited, base);
    blocked(inherited, "input_shape_rejected");
    const accessor = { ...base };
    Object.defineProperty(accessor, "boundarySessionId", { get: () => "x", enumerable: true });
    blocked(accessor, "input_shape_rejected");
    blocked({ ...base, [Symbol("secret")]: true }, "input_shape_rejected");
    class CustomShape {
      contractKind = "pure_raw_process_completion_evidence_contract";
    }
    blocked(new CustomShape(), "input_shape_rejected");
    blocked([], "input_shape_rejected");
    blocked(null, "input_shape_rejected");
    blocked(() => base, "input_shape_rejected");
    blocked(patch(base, { completionCategory: "new_category" as never }), "invalid_enum");
    blocked(patch(base, { contractVersion: 2 as 1 }), "unsupported_version");
    blocked(patch(base, { evidenceTimestamp: "not-a-date" }), "invalid_timestamp");
    blocked(patch(base, { sourceSpawnFingerprint: "abc" }), "invalid_fingerprint");
  });

  test("Action 558 runtime primitive schema closure rejects object aliases and non-primitive field values", () => {
    const base = buildCanonicalRawCompletionFixtureInput();
    blocked(patch(base, { processCreated: "false" as never }), "input_shape_rejected");
    blocked(patch(base, { shellUsed: { shell: false } as never }), "input_shape_rejected");
    blocked(patch(base, { pathLookupUsed: { pathLookup: false } as never }), "input_shape_rejected");
    blocked(patch(base, { inheritedEnvironmentUsed: { inheritedEnvironment: false } as never }), "input_shape_rejected");
    blocked(patch(base, { credentialsUsed: { credential: "none" } as never }), "input_shape_rejected");
    blocked(patch(base, { networkUsed: { network: false } as never }), "input_shape_rejected");
    blocked(patch(base, { observerAuthorityGranted: { observer: "none" } as never }), "input_shape_rejected");
    blocked(patch(base, { terminationRequestSucceeded: "false" as never }), "input_shape_rejected");
    blocked(patch(base, { exitCode: "0" as never }), "input_shape_rejected");
    blocked(patch(base, { closeSignal: { signal: null } as never }), "input_shape_rejected");
    blocked(patch(base, { stdoutText: { retained: false } as never }), "input_shape_rejected");
    blocked(patch(base, { retryCount: Number.NaN as 0 }), "input_shape_rejected");
  });

  test("Action 558 top-level authority aliases remain rejected as unknown fields", () => {
    const base = buildCanonicalRawCompletionFixtureInput();
    for (const alias of ["canSpawn", "processHandle", "child", "observer", "terminate", "kill", "execute", "command", "runner", "credential", "network", "api", "ui", "trading", "avanza", "persistence", "deployment", "runtime", "authorized", "permissions", "capabilities"]) {
      blocked({ ...base, [alias]: false }, "unknown_field");
    }
  });

  test("Action 558 argv closure rejects extra missing malformed sparse inherited accessor symbol and subclassed arrays", () => {
    const base = buildCanonicalRawCompletionFixtureInput();
    blocked(patch(base, { argv: ["--version", "extra"] as never }), "invalid_identity_or_policy");
    blocked(patch(base, { argv: [] as never }), "invalid_identity_or_policy");
    blocked(patch(base, { argv: ["--VERSION"] as never }), "invalid_identity_or_policy");
    blocked(patch(base, { argv: [" --version"] as never }), "invalid_identity_or_policy");
    blocked(patch(base, { argv: ["--version "] as never }), "invalid_identity_or_policy");
    blocked(patch(base, { argv: ["version"] as never }), "invalid_identity_or_policy");
    blocked(patch(base, { argv: [undefined] as never }), "invalid_identity_or_policy");
    blocked(patch(base, { argv: new Array(1) as never }), "invalid_identity_or_policy");
    const named = ["--version"] as string[] & Record<string, unknown>;
    named.command = "git --version";
    blocked(patch(base, { argv: named as never }), "input_shape_rejected");
    const symbol = ["--version"] as string[] & Record<symbol, unknown>;
    symbol[Symbol("credential")] = "none";
    blocked(patch(base, { argv: symbol as never }), "input_shape_rejected");
    const accessor = [] as string[];
    Object.defineProperty(accessor, "0", { get: () => "--version", enumerable: true });
    blocked(patch(base, { argv: accessor as never }), "invalid_identity_or_policy");
    class ArgvSubclass extends Array<string> {}
    blocked(patch(base, { argv: new ArgvSubclass("--version") as never }), "invalid_identity_or_policy");
    const inherited = ["--version"];
    Object.setPrototypeOf(inherited, Object.create(Array.prototype, { hiddenObserver: { value: "none", enumerable: true } }));
    blocked(patch(base, { argv: inherited as never }), "invalid_identity_or_policy");
  });

  test("Action 558 completion reason mapping is closed and category-specific", () => {
    const base = buildCanonicalRawCompletionFixtureInput();
    blocked(patch(base, { completionReason: "unknown_reason" as never }), "invalid_enum");
    blocked(patch(base, { completionReason: "stdout_stream_error" }), "invalid_enum");
    blocked(patch(buildCanonicalRawCompletionFixtureInput("stdout_output_limit_exceeded"), { completionReason: "stderr_output_limit_exceeded" }), "invalid_enum");
    blocked(patch(buildCanonicalRawCompletionFixtureInput("stderr_stream_error"), { completionReason: "stdout_stream_error" }), "invalid_enum");
    blocked(patch(buildCanonicalRawCompletionFixtureInput("process_created_normal_zero_exit"), { completionReason: "process_created_non_zero_exit" }), "invalid_enum");
    blocked(patch(buildCanonicalRawCompletionFixtureInput("process_created_non_zero_exit"), { completionReason: "process_created_normal_zero_exit" }), "invalid_enum");
    blocked(patch(buildCanonicalRawCompletionFixtureInput("process_created_signal_termination"), { completionReason: "process_created_normal_zero_exit" }), "invalid_enum");
    blocked(patch(base, { completionCategory: "malformed_completion_evidence", completionReason: "malformed_completion_evidence", lifecycleState: "malformed_completion_evidence" }), "malformed_completion_evidence");
  });

  test("Action 558 state matrix rejects completion contradictions across process exit close signal stream overflow and termination fields", () => {
    blocked(patch(buildCanonicalRawCompletionFixtureInput("spawn_failed_before_process_creation"), { exitObserved: true }), "process_state_contradiction");
    blocked(patch(buildCanonicalRawCompletionFixtureInput("spawn_failed_before_process_creation"), { closeObserved: true }), "process_state_contradiction");
    blocked(patch(buildCanonicalRawCompletionFixtureInput("child_process_error"), { processCreated: false }), "process_state_contradiction");
    blocked(patch(buildCanonicalRawCompletionFixtureInput("process_created_normal_zero_exit"), { processStartedObserved: false }), "process_state_contradiction");
    blocked(patch(buildCanonicalRawCompletionFixtureInput("process_created_normal_zero_exit"), { spawnErrorObserved: true, spawnErrorReason: "spawn_exception" }), "spawn_state_contradiction");
    blocked(patch(buildCanonicalRawCompletionFixtureInput("process_created_normal_zero_exit"), { exitObserved: false, exitCode: 0 }), "exit_close_contradiction");
    blocked(patch(buildCanonicalRawCompletionFixtureInput("process_created_normal_zero_exit"), { closeObserved: false, closeCode: 0 }), "exit_close_contradiction");
    blocked(patch(buildCanonicalRawCompletionFixtureInput("process_created_normal_zero_exit"), { exitCode: 1 }), "exit_close_contradiction");
    blocked(patch(buildCanonicalRawCompletionFixtureInput("process_created_non_zero_exit"), { exitCode: 0, closeCode: 0 }), "exit_close_contradiction");
    blocked(patch(buildCanonicalRawCompletionFixtureInput("process_created_signal_termination"), { signalObserved: false, signal: null, closeSignal: null }), "signal_code_contradiction");
    blocked(patch(buildCanonicalRawCompletionFixtureInput("process_created_signal_termination"), { exitCode: 1 }), "signal_code_contradiction");
    blocked(patch(buildCanonicalRawCompletionFixtureInput("process_created_normal_zero_exit"), { closeCode: 2 }), "exit_close_contradiction");
    blocked(patch(buildCanonicalRawCompletionFixtureInput("process_created_signal_termination"), { closeSignal: "SIGKILL" }), "signal_code_contradiction");
    blocked(patch(buildCanonicalRawCompletionFixtureInput("process_created_normal_zero_exit"), { stdoutStreamError: true }), "stream_error_contradiction");
    blocked(patch(buildCanonicalRawCompletionFixtureInput("process_created_normal_zero_exit"), { unexpectedStreamChunk: true }), "stream_error_contradiction");
    blocked(patch(buildCanonicalRawCompletionFixtureInput("process_created_normal_zero_exit"), { stdoutOverflow: true }), "overflow_state_contradiction");
    blocked(patch(buildCanonicalRawCompletionFixtureInput("stdout_output_limit_exceeded"), { stderrOverflow: true }), "overflow_state_contradiction");
    blocked(patch(buildCanonicalRawCompletionFixtureInput("process_created_normal_zero_exit"), { terminationRequestSucceeded: true }), "termination_state_contradiction");
    blocked(patch(buildCanonicalRawCompletionFixtureInput("internally_terminal_process_death_unconfirmed"), { processDeathConfirmed: true, processDeathConfirmationSource: "close_event_after_termination" }), "death_confirmation_contradiction");
    blocked(patch(buildCanonicalRawCompletionFixtureInput("process_created_normal_zero_exit"), { lifecycleState: "process_created_terminal_error" }), "terminal_state_contradiction");
  });

  test("Action 558 malformed evidence category cannot normalize otherwise successful or authority-bearing evidence", () => {
    blocked(buildCanonicalRawCompletionFixtureInput("malformed_completion_evidence", {
      processCreated: true,
      processStartedObserved: true,
      exitObserved: true,
      exitCode: 0,
      closeObserved: true,
      closeCode: 0,
      authority: "none",
    }), "malformed_completion_evidence");
    blocked(buildCanonicalRawCompletionFixtureInput("malformed_completion_evidence", {
      observerAuthorityGranted: true as false,
      runtimeActivated: true as false,
    }), "authority_claim_rejected");
  });

  test("Action 558 output retention and multibyte byte counts are closed", () => {
    accepted(buildCanonicalRawCompletionFixtureInput("process_created_normal_zero_exit", {
      stdoutText: "åäö\n",
      stdoutByteCount: Buffer.byteLength("åäö\n", "utf8"),
      stderrText: "",
      stderrByteCount: 0,
      combinedByteCount: Buffer.byteLength("åäö\n", "utf8"),
    }));
    blocked(buildCanonicalRawCompletionFixtureInput("stdout_stream_error", {
      stdoutText: "retained",
      stdoutByteCount: Buffer.byteLength("retained", "utf8"),
      combinedByteCount: Buffer.byteLength("retained", "utf8"),
    }), "output_retention_rejected");
    blocked(buildCanonicalRawCompletionFixtureInput("combined_output_limit_exceeded", {
      stdoutText: "",
      stderrText: null,
    }), "output_retention_rejected");
  });

  test("Action 558 fingerprints bind argv category reason runtime primitives and contradiction-relevant fields", () => {
    const normal = accepted(buildCanonicalRawCompletionFixtureInput("process_created_normal_zero_exit"));
    const nonZero = accepted(buildCanonicalRawCompletionFixtureInput("process_created_non_zero_exit"));
    const signal = accepted(buildCanonicalRawCompletionFixtureInput("process_created_signal_termination"));
    const closeWithoutExit = accepted(buildCanonicalRawCompletionFixtureInput("process_close_without_exit"));
    expect(nonZero.evidence?.completionReason).toBe("process_created_non_zero_exit");
    expect(nonZero.evidence?.evidenceFingerprint).not.toBe(normal.evidence?.evidenceFingerprint);
    expect(signal.evidence?.evidenceFingerprint).not.toBe(normal.evidence?.evidenceFingerprint);
    expect(closeWithoutExit.evidence?.evidenceFingerprint).not.toBe(normal.evidence?.evidenceFingerprint);
    expect(signal.resultFingerprint).not.toBe(nonZero.resultFingerprint);
  });

  test("Action 558 static source includes explicit schema argv reason state and fingerprint closures", () => {
    const core = source(corePath);
    expect(core).toContain("validatePrimitiveSchema");
    expect(core).toContain("isExactVersionArgv");
    expect(core).toContain("CATEGORY_STATE_RULES");
    expect(core).toContain("COMPLETION_REASONS");
    expect(core).toContain("matchesOutputRule");
    expect(core).toContain("fingerprint(PURE_RAW_PROCESS_COMPLETION_FINGERPRINT_DOMAINS.evidence, core)");
  });

  test("output bounds accept exact limits and reject one byte above without matching overflow state", () => {
    accepted(buildCanonicalRawCompletionFixtureInput("process_created_normal_zero_exit", {
      stdoutText: "a".repeat(16384),
      stdoutByteCount: 16384,
      stderrText: "",
      stderrByteCount: 0,
      combinedByteCount: 16384,
    }));
    blocked(buildCanonicalRawCompletionFixtureInput("process_created_normal_zero_exit", {
      stdoutText: "a".repeat(16385),
      stdoutByteCount: 16385,
      stderrText: "",
      stderrByteCount: 0,
      combinedByteCount: 16385,
    }), "output_limit_exceeded");
    accepted(buildCanonicalRawCompletionFixtureInput("process_created_normal_zero_exit", {
      stdoutText: "",
      stdoutByteCount: 0,
      stderrText: "b".repeat(16384),
      stderrByteCount: 16384,
      combinedByteCount: 16384,
    }));
    blocked(buildCanonicalRawCompletionFixtureInput("process_created_normal_zero_exit", {
      stdoutText: "",
      stdoutByteCount: 0,
      stderrText: "b".repeat(16385),
      stderrByteCount: 16385,
      combinedByteCount: 16385,
    }), "output_limit_exceeded");
    accepted(buildCanonicalRawCompletionFixtureInput("process_created_normal_zero_exit", {
      stdoutText: "a".repeat(16384),
      stdoutByteCount: 16384,
      stderrText: "b".repeat(16384),
      stderrByteCount: 16384,
      combinedByteCount: 32768,
    }));
    blocked(buildCanonicalRawCompletionFixtureInput("process_created_normal_zero_exit", {
      stdoutText: "a".repeat(16384),
      stdoutByteCount: 16384,
      stderrText: "b".repeat(16385),
      stderrByteCount: 16385,
      combinedByteCount: 32769,
    }), "output_limit_exceeded");
  });

  test("encoded-size mismatch invalid UTF-8 contradictions and retained overflow output reject", () => {
    const base = buildCanonicalRawCompletionFixtureInput();
    blocked(patch(base, { stdoutByteCount: 1 }), "byte_count_mismatch");
    blocked(patch(base, { combinedByteCount: base.combinedByteCount + 1 }), "byte_count_mismatch");
    blocked(patch(base, { utf8Valid: false }), "invalid_utf8_state");
    blocked(patch(buildCanonicalRawCompletionFixtureInput("stdout_output_limit_exceeded"), { stdoutText: "retained" }), "output_retention_rejected");
    accepted(buildCanonicalRawCompletionFixtureInput("invalid_output_encoding"));
  });

  test("determinism fingerprint mutation deep freeze input isolation and serialization remain fixture-only", () => {
    const input = buildCanonicalRawCompletionFixtureInput();
    const first = accepted(input);
    const second = accepted(JSON.parse(JSON.stringify(input)) as RawProcessCompletionEvidenceInput);
    expect(second).toEqual(first);
    const changed = accepted(patch(input, {
      spawnAttemptId: "spawn-attempt-002",
      sourceSpawnFingerprint: "b".repeat(64),
    }));
    expect(changed.resultFingerprint).not.toBe(first.resultFingerprint);
    expect(changed.evidence?.evidenceFingerprint).not.toBe(first.evidence?.evidenceFingerprint);
    const mutable = { ...input };
    const result = accepted(mutable);
    mutable.stdoutText = "changed";
    expect(result.evidence?.stdoutText).toBe("git version 2.45.1\n");
    expect(JSON.parse(JSON.stringify(result)).observedLiveProcess).toBe(false);
    expect(JSON.parse(JSON.stringify(result)).authority).toBe("none");
  });

  test("authority posture contains no process handle observer capability CLI interpretation runtime deployment or credential/network authority", () => {
    const result = accepted(buildCanonicalRawCompletionFixtureInput());
    expect(result.evidence).toMatchObject({
      observedLiveProcess: false,
      processHandleExposed: false,
      processIdAuthority: "none",
      observerCapability: "none",
      cliVersionAuthority: "none",
      credentialAuthority: "none",
      networkAuthority: "none",
      apiAuthority: "none",
      uiAuthority: "none",
      runnerAuthority: "none",
      tradingAuthority: "none",
      avanzaAuthority: "none",
      persistenceAuthority: "none",
      deploymentAuthority: "none",
      cliVersionInterpreted: false,
      runtimeActivated: false,
      credentialsUsed: false,
      networkUsed: false,
      authorizationConsumed: false,
    });
  });

  test("validator returns deterministic reason ordering and never silently normalizes contradictory evidence", () => {
    const reasons = validateRawProcessCompletionEvidenceInput(patch(buildCanonicalRawCompletionFixtureInput(), {
      retryCount: 1 as 0,
      fallbackAttempted: true as false,
      runtimeActivated: true as false,
      toctouEliminated: true as false,
    }));
    expect(reasons).toEqual([...reasons].sort());
    expect(reasons).toEqual(expect.arrayContaining([
      "authority_claim_rejected",
      "fallback_rejected",
      "retry_rejected",
      "runtime_activation_claim_rejected",
      "toctou_claim_rejected",
    ]));
  });
});
