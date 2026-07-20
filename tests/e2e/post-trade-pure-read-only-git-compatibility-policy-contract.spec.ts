import { expect, test } from "@playwright/test";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  buildPureAppleGitVersionInterpretation,
} from "../../lib/post-trade-pure-apple-git-version-interpretation-contract-core";
import {
  buildPureGitVersionInterpretation,
} from "../../lib/post-trade-pure-git-version-interpretation-contract-core";
import {
  PURE_READ_ONLY_GIT_COMPATIBILITY_FINGERPRINT_DOMAINS,
  PURE_READ_ONLY_GIT_COMPATIBILITY_POLICY,
  PURE_READ_ONLY_GIT_COMPATIBILITY_POLICY_CONTRACT_IDENTITY,
  buildPureReadOnlyGitCompatibilityPolicy,
  type PureReadOnlyGitCompatibilityReason,
} from "../../lib/post-trade-pure-read-only-git-compatibility-policy-contract-core";
import {
  buildCanonicalRawCompletionFixtureInput,
  buildPureRawProcessCompletionEvidence,
  type RawProcessCompletionEvidenceInput,
} from "../../lib/post-trade-pure-raw-process-completion-evidence-contract-core";

const repoRoot = process.cwd();
const corePath = "lib/post-trade-pure-read-only-git-compatibility-policy-contract-core.ts";
const apiPath = "app/api/post-trade/payload/validate/route.ts";
const tradeUiPath = "app/trade-app.tsx";
const authorityFalseFields = [
  "laterActivationEligibility",
  "repositoryReadAuthorityGranted",
  "mutationAuthorityGranted",
  "processAuthorityGranted",
  "observerAuthorityGranted",
  "cliExecutionAuthorityGranted",
  "compatibilityAuthorityGranted",
  "runtimeAuthorityGranted",
  "stagingAuthorityGranted",
  "deploymentAuthorityGranted",
  "credentialAuthorityGranted",
  "networkAuthorityGranted",
  "credentialsUsed",
  "networkUsed",
  "authorizationConsumed",
  "runtimeActivated",
  "toctouEliminated",
] as const;

function source(path: string) {
  return readFileSync(join(repoRoot, path), "utf8");
}

function raw(stdoutText: string, patch: Partial<RawProcessCompletionEvidenceInput> = {}) {
  const stderrText = typeof patch.stderrText === "string" ? patch.stderrText : "";
  const stdoutByteCount = Buffer.byteLength(stdoutText, "utf8");
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

function generic(stdout = "git version 2.39.0\n") {
  return buildPureGitVersionInterpretation(raw(stdout));
}

function apple(stdout = "git version 2.39.5 (Apple Git-154)\n") {
  return buildPureAppleGitVersionInterpretation(raw(stdout));
}

function accepted(input: unknown) {
  const result = buildPureReadOnlyGitCompatibilityPolicy(input);
  expect(result.status, JSON.stringify(result.reasons)).toBe("compatible_for_read_only_observation");
  expect(result.reason).toBe("compatible_for_read_only_observation");
  expect(result.readOnlyObservationCapabilitySetSatisfied).toBe(true);
  expectNoAuthority(result);
  return result;
}

function blocked(input: unknown, status: string, reason: PureReadOnlyGitCompatibilityReason) {
  const result = buildPureReadOnlyGitCompatibilityPolicy(input);
  expect(result.status).toBe(status);
  expect(result.reason).toBe(reason);
  expect(result.reasons).toContain(reason);
  expect(result.readOnlyObservationCapabilitySetSatisfied).toBe(false);
  expectNoAuthority(result);
  return result;
}

function tamper(input: unknown, target: "result" | "evidence", patch: Record<string, unknown>) {
  const result = input as { evidence?: Record<string, unknown> };
  if (target === "result") return { ...(input as Record<string, unknown>), ...patch };
  return { ...(input as Record<string, unknown>), evidence: { ...result.evidence, ...patch } };
}

function expectNoAuthority(result: Record<string, unknown>) {
  expect(result.authority).toBe("none");
  for (const field of authorityFalseFields) {
    expect(result).toHaveProperty(field, false);
  }
}

test.describe("pure read-only Git compatibility policy contract", () => {
  test("identity policy and source are pure fixture-only and runtime-unreachable", () => {
    const core = source(corePath);
    const api = source(apiPath);
    const tradeUi = source(tradeUiPath);
    expect(PURE_READ_ONLY_GIT_COMPATIBILITY_POLICY_CONTRACT_IDENTITY).toMatchObject({
      contractId: "ture.execution.pure-read-only-git-compatibility-policy-contract.fixture.v1",
      contractVersion: 1,
      boundaryId: "ture.execution.read-only-git-compatibility-policy.fixture-boundary.v1",
      fixtureOnly: true,
      observedLiveProcess: false,
      authority: "none",
    });
    expect(PURE_READ_ONLY_GIT_COMPATIBILITY_POLICY).toMatchObject({
      policyId: "ture.execution.read-only-git-observation-compatibility-policy.v1",
      minimumVersion: { major: 2, minor: 39, patch: 0 },
      supportedMajorFamily: 2,
      stableReleaseRequired: true,
      futureMajorAllowed: false,
      unknownVendorAllowed: false,
      authority: "none",
      runtimeActivated: false,
    });
    expect(Object.isFrozen(PURE_READ_ONLY_GIT_COMPATIBILITY_POLICY)).toBe(true);
    expect(Object.isFrozen(PURE_READ_ONLY_GIT_COMPATIBILITY_POLICY.capabilitySet)).toBe(true);
    expect(PURE_READ_ONLY_GIT_COMPATIBILITY_FINGERPRINT_DOMAINS.result).toContain("compatibility-policy-contract");
    expect(core).not.toContain('import "server-only"');
    expect(core).not.toMatch(/from\s+["']server-only["']|from\s+["']node:child_process["']|from\s+["']node:fs|from\s+["']fs\/promises|spawn\(|exec\(|execFile\(|fork\(|process\.env|process\.cwd|fetch\(|axios|keychain|keytar|osascript|createClient\(|\.insert\(|\.upsert\(|\.rpc\(|setTimeout|setInterval|Avanza|BankID/u);
    expect(core).toContain("node:crypto");
    expect(core).not.toContain("implementation_unsupported");
    expect(core).not.toContain("implementation_family_rejected");
    expect(api).not.toContain("post-trade-pure-read-only-git-compatibility-policy-contract");
    expect(tradeUi).not.toContain("post-trade-pure-read-only-git-compatibility-policy-contract");
  });

  for (const stdout of ["git version 2.39.0\n", "git version 2.39.1\n", "git version 2.40.0\n", "git version 2.99.99\n"]) {
    test(`generic upstream ${stdout.trim()} satisfies major-2 baseline`, () => {
      const result = accepted(generic(stdout));
      expect(result.implementationFamily).toBe("upstream_git");
      expect(result.appleBuild).toBeNull();
      expect(result.minimumMajor).toBe(2);
      expect(result.minimumMinor).toBe(39);
      expect(result.maximumReviewedMajor).toBe(2);
      expect(result.meetsMinimum).toBe(true);
      expect(result.withinReviewedRange).toBe(true);
      expect(result.generalGitCompatibility).toBe(false);
      expect(result.writeCommandCompatibility).toBe(false);
    });
  }

  for (const stdout of ["git version 2.38.9\n", "git version 1.99.99\n"]) {
    test(`generic upstream ${stdout.trim()} is below baseline`, () => {
      const result = blocked(generic(stdout), "version_below_baseline", "version_below_baseline");
      expect(result.implementationFamily).toBe("upstream_git");
      expect(result.meetsMinimum).toBe(false);
      expect(result.withinReviewedRange).toBe(true);
    });
  }

  test("generic upstream major 3 fails above reviewed range", () => {
    const result = blocked(generic("git version 3.0.0\n"), "version_above_reviewed_range", "version_above_reviewed_range");
    expect(result.implementationFamily).toBe("upstream_git");
    expect(result.withinReviewedRange).toBe(false);
  });

  test("generic parser rejection never becomes compatibility", () => {
    blocked(buildPureGitVersionInterpretation(raw("git version 2.39.0-rc1\n")), "input_rejected", "parser_result_rejected");
    blocked(buildPureGitVersionInterpretation(raw("git version 2.39\n")), "input_rejected", "parser_result_rejected");
    blocked(buildPureGitVersionInterpretation(raw("git version 2.39.0.dirty\n")), "input_rejected", "parser_result_rejected");
  });

  test("Apple 2.39.5 build 154 and exact 2.39.0 satisfy baseline with build as evidence only", () => {
    const first = accepted(apple("git version 2.39.5 (Apple Git-154)\n"));
    const exact = accepted(apple("git version 2.39.0 (Apple Git-1)\n"));
    const changedBuild = accepted(apple("git version 2.39.5 (Apple Git-155)\n"));
    expect(first.implementationFamily).toBe("apple_git");
    expect(first.appleBuild).toBe(154);
    expect(first.appleBuildComparisonMode).toBe("evidence_only");
    expect(exact.meetsMinimum).toBe(true);
    expect(changedBuild.resultFingerprint).not.toBe(first.resultFingerprint);
    expect(changedBuild.status).toBe(first.status);
  });

  test("Apple below baseline and future major fail closed", () => {
    blocked(apple("git version 2.38.9 (Apple Git-154)\n"), "version_below_baseline", "version_below_baseline");
    blocked(apple("git version 3.0.0 (Apple Git-154)\n"), "version_above_reviewed_range", "version_above_reviewed_range");
  });

  test("Apple parser rejects missing malformed or arbitrary vendor build before policy evaluation", () => {
    blocked(buildPureAppleGitVersionInterpretation(raw("git version 2.39.5\n")), "input_rejected", "parser_result_rejected");
    blocked(buildPureAppleGitVersionInterpretation(raw("git version 2.39.5 (Apple Git-0154)\n")), "input_rejected", "parser_result_rejected");
    blocked(buildPureAppleGitVersionInterpretation(raw("git version 2.39.5 (Other Git-154)\n")), "input_rejected", "parser_result_rejected");
  });

  test("generic and Apple parser evidence are not interchangeable or caller selectable", () => {
    blocked(tamper(generic(), "result", { contractId: "ture.execution.pure-apple-git-version-interpretation-contract.fixture.v1" }), "input_rejected", "input_identity_rejected");
    blocked(tamper(apple(), "result", { contractId: "ture.execution.pure-git-version-interpretation-contract.fixture.v1" }), "input_rejected", "input_identity_rejected");
    blocked({ ...generic(), implementationFamily: "apple_git" }, "input_rejected", "input_contract_rejected");
    blocked({ version: "2.39.0", family: "upstream_git" }, "input_rejected", "input_contract_rejected");
  });

  test("rejected parser results and malformed result identities fail before version comparison", () => {
    blocked(tamper(generic(), "result", { status: "blocked_fail_closed", cliVersionInterpreted: false }), "input_rejected", "parser_result_rejected");
    blocked(tamper(generic(), "result", { resultKind: "other" }), "input_rejected", "input_identity_rejected");
    blocked(tamper(apple(), "result", { appleGitVersionInterpreted: false }), "input_rejected", "parser_result_rejected");
  });

  test("stale parser fingerprints and copied result fingerprints are rejected", () => {
    blocked(tamper(generic(), "evidence", { patch: 1 }), "input_rejected", "input_fingerprint_rejected");
    blocked(tamper(apple(), "evidence", { appleBuildNumber: 155 }), "input_rejected", "input_fingerprint_rejected");
    blocked(tamper(generic(), "result", { resultFingerprint: "0".repeat(64) }), "input_rejected", "input_fingerprint_rejected");
  });

  test("source executable platform session and policy linkage are revalidated", () => {
    blocked(tamper(generic(), "evidence", { canonicalExecutablePath: "/opt/git" }), "input_rejected", "input_fingerprint_rejected");
    blocked(tamper(generic(), "evidence", { platform: "linux" }), "input_rejected", "input_fingerprint_rejected");
    blocked(tamper(apple(), "evidence", { boundarySessionId: "" }), "input_rejected", "input_fingerprint_rejected");
    blocked(tamper(apple(), "evidence", { policyId: "other" }), "input_rejected", "input_fingerprint_rejected");
  });

  for (const [field, value, reason] of [
    ["observedLiveProcess", true, "live_claim_rejected"],
    ["runtimeActivated", true, "runtime_claim_rejected"],
    ["toctouEliminated", true, "toctou_claim_rejected"],
    ["compatibilityAuthorityGranted", true, "authority_rejected"],
    ["credentialsUsed", true, "authority_rejected"],
    ["networkUsed", true, "authority_rejected"],
    ["authorizationConsumed", true, "authority_rejected"],
    ["authority", "spawn", "authority_rejected"],
  ] as const) {
    test(`recomputed generic security forgery rejects ${field}`, () => {
      const forged = recomputeGenericEvidence({ [field]: value });
      blocked(forged, "input_rejected", reason);
    });
  }

  for (const [field, value, reason] of [
    ["processAuthorityGranted", true, "authority_rejected"],
    ["cliExecutionAuthorityGranted", true, "authority_rejected"],
    ["runtimeAuthorityGranted", true, "authority_rejected"],
    ["deploymentAuthorityGranted", true, "authority_rejected"],
    ["observedLiveProcess", true, "live_claim_rejected"],
    ["runtimeActivated", true, "runtime_claim_rejected"],
    ["toctouEliminated", true, "toctou_claim_rejected"],
  ] as const) {
    test(`recomputed Apple security forgery rejects ${field}`, () => {
      const forged = recomputeAppleEvidence({ [field]: value });
      blocked(forged, "input_rejected", reason);
    });
  }

  test("result fingerprints bind version family source linkage and Apple build", () => {
    const base = accepted(generic("git version 2.39.0\n"));
    const patch = accepted(generic("git version 2.39.1\n"));
    const appleBase = accepted(apple("git version 2.39.5 (Apple Git-154)\n"));
    const appleBuild = accepted(apple("git version 2.39.5 (Apple Git-155)\n"));
    expect(patch.resultFingerprint).not.toBe(base.resultFingerprint);
    expect(appleBase.resultFingerprint).not.toBe(base.resultFingerprint);
    expect(appleBuild.resultFingerprint).not.toBe(appleBase.resultFingerprint);
    expect(appleBuild.versionEvidenceFingerprint).not.toBe(appleBase.versionEvidenceFingerprint);
  });

  test("results are deterministic deeply frozen and non-authoritative after serialization", () => {
    const first = accepted(generic("git version 2.40.0\n"));
    const second = accepted(generic("git version 2.40.0\n"));
    expect(second).toEqual(first);
    expect(Object.isFrozen(first)).toBe(true);
    expect(JSON.parse(JSON.stringify(first)).authority).toBe("none");
    expect(first.laterActivationEligibility).toBe(false);
    expect(first.capabilityScopeFingerprint).toMatch(/^[a-f0-9]{64}$/u);
  });

  test("schema attacks and caller overrides fail closed", () => {
    blocked({ ...generic(), extra: true }, "input_rejected", "input_contract_rejected");
    blocked(Object.assign(Object.create({ inherited: true }), generic()), "input_rejected", "input_contract_rejected");
    const accessor = { ...generic() };
    Object.defineProperty(accessor, "status", { get: () => "accepted_fixture_git_version_interpretation", enumerable: true });
    blocked(accessor, "input_rejected", "input_contract_rejected");
    blocked([generic()], "input_rejected", "input_contract_rejected");
    blocked(new (class Fake { resultKind = "pure_git_version_interpretation_result"; })(), "input_rejected", "input_contract_rejected");
    blocked({ ...generic(), baseline: "1.0.0" }, "input_rejected", "input_contract_rejected");
    blocked({ ...generic(), policy: PURE_READ_ONLY_GIT_COMPATIBILITY_POLICY }, "input_rejected", "input_contract_rejected");
  });

  test("every result category carries the complete explicit non-authoritative posture", () => {
    const inputs = [
      {},
      generic("git version 2.38.9\n"),
      generic("git version 3.0.0\n"),
      generic("git version 2.39.0\n"),
      apple("git version 2.39.5 (Apple Git-154)\n"),
    ];
    for (const input of inputs) {
      expectNoAuthority(buildPureReadOnlyGitCompatibilityPolicy(input) as unknown as Record<string, unknown>);
    }
  });

  for (const field of authorityFalseFields) {
    test(`result schema rejects caller-submitted compatibility result with ${field} true`, () => {
      const result = accepted(generic("git version 2.39.0\n")) as unknown as Record<string, unknown>;
      blocked({ ...result, [field]: true }, "input_rejected", "input_contract_rejected");
    });
  }

  for (const [field, value, reason] of [
    ["spawnAuthorityGranted", true, "authority_rejected"],
    ["observerAuthorityGranted", true, "authority_rejected"],
    ["cliExecutionAuthorityGranted", true, "authority_rejected"],
    ["cliVersionAuthorityGranted", true, "authority_rejected"],
    ["compatibilityAuthorityGranted", true, "authority_rejected"],
    ["credentialsUsed", true, "authority_rejected"],
    ["networkUsed", true, "authority_rejected"],
    ["authorizationConsumed", true, "authority_rejected"],
    ["deploymentAuthorityGranted", true, "authority_rejected"],
    ["authority", "spawn", "authority_rejected"],
  ] as const) {
    test(`recomputed generic authority forgery rejects ${field}`, () => {
      blocked(recomputeGenericEvidence({ [field]: value }), "input_rejected", reason);
    });
  }

  for (const [field, value, reason] of [
    ["processAuthorityGranted", true, "authority_rejected"],
    ["observerAuthorityGranted", true, "authority_rejected"],
    ["cliExecutionAuthorityGranted", true, "authority_rejected"],
    ["gitVersionAuthorityGranted", true, "authority_rejected"],
    ["compatibilityAuthorityGranted", true, "authority_rejected"],
    ["runtimeAuthorityGranted", true, "authority_rejected"],
    ["stagingAuthorityGranted", true, "authority_rejected"],
    ["deploymentAuthorityGranted", true, "authority_rejected"],
    ["credentialAuthorityGranted", true, "authority_rejected"],
    ["networkAuthorityGranted", true, "authority_rejected"],
    ["authorizationConsumed", true, "authority_rejected"],
    ["authority", "spawn", "authority_rejected"],
  ] as const) {
    test(`recomputed Apple authority forgery rejects ${field}`, () => {
      blocked(recomputeAppleEvidence({ [field]: value }), "input_rejected", reason);
    });
  }

  for (const attack of buildArrayAttacks()) {
    test(`generic evidence argv rejects ${attack.name}`, () => {
      blocked(recomputeGenericEvidence({ argv: attack.apply(["--version"]) }), "input_rejected", "input_contract_rejected");
    });

    test(`Apple evidence argv rejects ${attack.name}`, () => {
      blocked(recomputeAppleEvidence({ argv: attack.apply(["--version"]) }), "input_rejected", "input_contract_rejected");
    });

    test(`accepted reason arrays reject ${attack.name}`, () => {
      blocked(recomputeGenericResult({ blockingReasons: attack.apply(["accepted"]) }), "input_rejected", "input_contract_rejected");
    });
  }

  test("canonical nested arrays still pass after exact-array closure", () => {
    accepted(generic("git version 2.39.0\n"));
    accepted(apple("git version 2.39.5 (Apple Git-154)\n"));
  });

  test("unreachable implementation-family states are removed from v1 current result vocabulary", () => {
    const core = source(corePath);
    expect(core).not.toContain("implementation_unsupported");
    expect(core).not.toContain("implementation_family_rejected");
    expect(buildPureReadOnlyGitCompatibilityPolicy({ implementationFamily: "unsupported_vendor_git" }).status).toBe("input_rejected");
  });
});

function buildArrayAttacks() {
  return [
  {
    name: "extra enumerable own string property",
    apply: (values: readonly string[]) => Object.assign([...values], { extra: "unexpected" }),
  },
  {
    name: "extra non-enumerable own string property",
    apply: (values: readonly string[]) => {
      const array = [...values];
      Object.defineProperty(array, "metadata", { value: "unexpected" });
      return array;
    },
  },
  {
    name: "symbol property",
    apply: (values: readonly string[]) => {
      const array = [...values];
      Object.defineProperty(array, Symbol("metadata"), { value: "unexpected" });
      return array;
    },
  },
  {
    name: "accessor property",
    apply: (values: readonly string[]) => {
      const array = [...values];
      Object.defineProperty(array, "metadata", { get: () => "unexpected" });
      return array;
    },
  },
  {
    name: "sparse array hole",
    apply: (values: readonly string[]) => {
      const array = [...values];
      delete array[0];
      return array;
    },
  },
  {
    name: "inherited enumerable property",
    apply: (values: readonly string[]) => {
      const array = [...values];
      const proto = Object.create(Array.prototype) as Record<string, unknown>;
      Object.defineProperty(proto, "metadata", { value: "unexpected", enumerable: true });
      Object.setPrototypeOf(array, proto);
      return array;
    },
  },
  {
    name: "exotic prototype",
    apply: (values: readonly string[]) => {
      const array = [...values];
      Object.setPrototypeOf(array, Object.create(Array.prototype));
      return array;
    },
  },
  {
    name: "subclassed Array",
    apply: (values: readonly string[]) => new (class ContractArray extends Array<string> {})(...values),
  },
  {
    name: "overridden constructor property",
    apply: (values: readonly string[]) => Object.assign([...values], { constructor: "unexpected" }),
  },
  {
    name: "overridden map property",
    apply: (values: readonly string[]) => Object.assign([...values], { map: "unexpected" }),
  },
  {
    name: "overridden filter property",
    apply: (values: readonly string[]) => Object.assign([...values], { filter: "unexpected" }),
  },
  {
    name: "non-canonical numeric key 01",
    apply: (values: readonly string[]) => Object.assign([...values], { "01": "unexpected" }),
  },
  {
    name: "negative numeric-looking key",
    apply: (values: readonly string[]) => Object.assign([...values], { "-1": "unexpected" }),
  },
  {
    name: "floating numeric-looking key",
    apply: (values: readonly string[]) => Object.assign([...values], { "1.0": "unexpected" }),
  },
  {
    name: "out-of-range numeric-looking key",
    apply: (values: readonly string[]) => Object.assign([...values], { "4294967295": "unexpected" }),
  },
  {
    name: "altered length",
    apply: (values: readonly string[]) => {
      const array = [...values];
      array.length = 0;
      return array;
    },
  },
  {
    name: "appended extra element",
    apply: (values: readonly string[]) => [...values, "unexpected"],
  },
  {
    name: "deleted required element",
    apply: (values: readonly string[]) => {
      const array = [...values];
      delete array[0];
      return array;
    },
  },
  {
    name: "function attached as property",
    apply: (values: readonly string[]) => Object.assign([...values], { extra: () => "unexpected" }),
  },
] as const;
}

function recomputeGenericEvidence(patch: Record<string, unknown>) {
  const result = generic() as unknown as Record<string, unknown> & { evidence: Record<string, unknown> };
  const evidence = { ...result.evidence, ...patch };
  evidence.evidenceFingerprint = parserFingerprint("ture:pure-git-version-interpretation-contract:evidence:v1", omit(evidence, ["evidenceFingerprintAlgorithm", "evidenceFingerprint"]));
  const changed: Record<string, unknown> = { ...result, evidence };
  changed.resultFingerprint = parserFingerprint("ture:pure-git-version-interpretation-contract:result:v1", omit(changed, ["resultFingerprintAlgorithm", "resultFingerprint"]));
  return changed;
}

function recomputeGenericResult(patch: Record<string, unknown>) {
  const result = { ...(generic() as unknown as Record<string, unknown>), ...patch };
  result.resultFingerprint = parserFingerprint("ture:pure-git-version-interpretation-contract:result:v1", omit(result, ["resultFingerprintAlgorithm", "resultFingerprint"]));
  return result;
}

function recomputeAppleEvidence(patch: Record<string, unknown>) {
  const result = apple() as unknown as Record<string, unknown> & { evidence: Record<string, unknown> };
  const evidence = { ...result.evidence, ...patch };
  evidence.evidenceFingerprint = parserFingerprint("ture:pure-apple-git-version-interpretation-contract:evidence:v1", omit(evidence, ["evidenceFingerprintAlgorithm", "evidenceFingerprint"]));
  const changed: Record<string, unknown> = { ...result, evidence };
  changed.resultFingerprint = parserFingerprint("ture:pure-apple-git-version-interpretation-contract:result:v1", omit(changed, ["resultFingerprintAlgorithm", "resultFingerprint"]));
  return changed;
}

function omit(input: Record<string, unknown>, keys: readonly string[]) {
  const blocked = new Set(keys);
  return Object.fromEntries(Object.entries(input).filter(([key]) => !blocked.has(key)));
}

function parserFingerprint(domain: string, input: unknown): string {
  return createHash("sha256").update(`${domain}:${JSON.stringify(parserCanonicalize(input))}`).digest("hex");
}

function parserCanonicalize(input: unknown): unknown {
  if (Array.isArray(input)) return Array.from({ length: input.length }, (_, index) => parserCanonicalize(input[index]));
  if (input && typeof input === "object") {
    return Object.fromEntries(Object.entries(input as Record<string, unknown>).sort(([a], [b]) => a.localeCompare(b)).map(([key, value]) => [key, parserCanonicalize(value)]));
  }
  return input;
}
