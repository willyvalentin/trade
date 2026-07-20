import { execFileSync } from "child_process";
import { existsSync, readFileSync } from "fs";
import { join } from "path";
import { expect, test } from "@playwright/test";

type SourceIntegrity = Readonly<
  Record<
    string,
    Readonly<{
      expected: string;
      actual: string | null;
      unchanged: boolean;
    }>
  >
>;

type Action422Report = Readonly<{
  verification_status: string;
  approval_decision: string;
  approval_vocabulary: readonly string[];
  checks: Readonly<Record<string, boolean>>;
  failed_checks: readonly string[];
  passed_conditions_count: number;
  failed_conditions_count: number;
  unresolved_conditions: readonly string[];
  action421_readiness: Readonly<{
    verification_status: string;
    readiness_decision: string;
    failed_sections: readonly string[];
    failed_conditions_count: number;
    passed_conditions_count: number;
  }>;
  findings: readonly Readonly<Record<string, string>>[];
  eligible_pattern_discovery_statuses: readonly string[];
  unsupported_pattern_discovery_statuses: readonly string[];
  unsupported_status_result_policy: Readonly<{
    status: string;
    proposed_delta: null;
    proposed_calibrated_confidence: null;
    non_authoritative: boolean;
    applied: boolean;
    no_calibration_adjustment: boolean;
  }>;
  validation_order: readonly string[];
  unsupported_status_issue_contract: Readonly<{
    code: string;
    path: string;
    severity: string;
    messageKey: string;
  }>;
  warning_deduplication_policy: Readonly<{
    validate: boolean;
    canonical_sort: boolean;
    semantic_dedupe_by_exact_code: boolean;
    classify: boolean;
    attenuate_once_per_unique_warning_code: boolean;
  }>;
  result_vocabulary: readonly string[];
  action423_approved_boundary: readonly string[];
  action423_regression_requirements: readonly string[];
  source_integrity: SourceIntegrity;
  forbidden_action422_artifacts: readonly string[];
  tracked_action422_evidence_files: readonly string[];
  runtime_consumer_files: readonly string[];
  no_effect_flags: Readonly<Record<string, boolean>>;
  runtime_preview_status: string;
  runtime_preview_route_changed: boolean;
  runtime_preview_candidate_advanced: boolean;
  next_permitted_action: string;
  mandatory_followup_action: string;
  fixture_or_hash_freeze_allowed_next: boolean;
}>;

const repoRoot = process.cwd();
const docPath = join(
  repoRoot,
  "docs/action-422-pure-confidence-calibration-contract-remediation-approval-gate.md",
);
const verifierPath = join(
  repoRoot,
  "scripts/action-422-pure-confidence-calibration-contract-remediation-approval-gate-verify.mjs",
);

function readDoc() {
  return readFileSync(docPath, "utf8");
}

function runVerifier(): Action422Report {
  const output = execFileSync("node", [verifierPath], {
    cwd: repoRoot,
    encoding: "utf8",
    timeout: 120_000,
  });
  return JSON.parse(output) as Action422Report;
}

test.describe("Action 422 pure confidence calibration contract remediation approval gate", () => {
  let report: Action422Report;

  test.beforeAll(() => {
    report = runVerifier();
  });

  test("documents the static approval gate and the three Action 421 findings", () => {
    expect(existsSync(docPath)).toBe(true);
    const doc = readDoc();

    expect(doc).toContain("Action 421 result:");
    expect(doc).toContain("`readiness_decision`: `blocked`");
    expect(doc).toContain("Unsupported Pattern Discovery status mapped to wrong calibration status");
    expect(doc).toContain("Known blocked Pattern Discovery statuses mapped to wrong calibration status");
    expect(doc).toContain("Duplicate warnings attenuate more than once");
    expect(doc).toContain("incorrect_status_mapping");
    expect(doc).toContain("eligibility_status_contract_violation");
    expect(doc).toContain("duplicate_warning_attenuation");
    expect(doc).toContain("Approval decision: `approved`");
    expect(doc).toContain("Action 424 - Independent Post-Remediation Confidence Calibration Verification");
  });

  test("approves exactly the frozen remediation contract", () => {
    expect(report.verification_status).toBe("passed");
    expect(report.approval_decision).toBe("approved");
    expect(report.approval_vocabulary).toEqual([
      "approved",
      "approved_with_conditions",
      "blocked",
    ]);
    expect(report.passed_conditions_count).toBe(28);
    expect(report.failed_conditions_count).toBe(0);
    expect(report.failed_checks).toEqual([]);
    expect(report.unresolved_conditions).toEqual([]);
    expect(Object.values(report.checks).every(Boolean)).toBe(true);
  });

  test("freezes unsupported Pattern Discovery status handling", () => {
    expect(report.eligible_pattern_discovery_statuses).toEqual([
      "discovered",
      "discovered_with_warnings",
    ]);
    expect(report.unsupported_pattern_discovery_statuses).toEqual([
      "insufficient_evidence",
      "blocked_invalid_input",
      "blocked_invalid_configuration",
      "blocked_invalid_lineage",
      "blocked_future_leakage",
      "blocked_non_consumable_row",
      "blocked_nondeterministic_grouping",
      "unsupported arbitrary strings",
    ]);
    expect(report.unsupported_status_result_policy).toEqual({
      status: "blocked_unsupported_insight",
      proposed_delta: null,
      proposed_calibrated_confidence: null,
      non_authoritative: true,
      applied: false,
      no_calibration_adjustment: true,
    });
    expect(report.unsupported_status_issue_contract).toEqual({
      code: "ineligible_pattern_discovery_status",
      path: "/insights/0/pattern_discovery_status",
      severity: "error",
      messageKey: "confidence_calibration.ineligible_pattern_discovery_status",
    });
  });

  test("preserves validation order and precedence requirements", () => {
    expect(report.validation_order).toHaveLength(17);
    expect(report.validation_order[5]).toBe("Pattern Discovery status eligibility");

    const doc = readDoc();
    expect(doc).toContain("unsupported Pattern Discovery status must outrank");
    expect(doc).toContain("lineage failure");
    expect(doc).toContain("leakage failure");
    expect(doc).toContain("warning contradiction");
    expect(doc).toContain("overlap conflict");
  });

  test("freezes semantic warning deduplication before attenuation", () => {
    expect(report.warning_deduplication_policy).toEqual({
      validate: true,
      canonical_sort: true,
      semantic_dedupe_by_exact_code: true,
      classify: true,
      attenuate_once_per_unique_warning_code: true,
    });

    const doc = readDoc();
    expect(doc).toContain("apply attenuation once per unique warning code");
    expect(doc).toContain("Repeated warning codes must not:");
    expect(doc).toContain("Duplicate contradictory warnings must produce one deterministic blocking issue");
    expect(doc).toContain("Multiple instances of the same warning code must not combine multiplicatively");
  });

  test("keeps Action 423 narrow and makes Action 424 mandatory", () => {
    expect(report.action423_approved_boundary).toEqual([
      "lib/pure-confidence-calibration.ts",
      "docs/action-423-pure-confidence-calibration-contract-remediation.md",
      "scripts/action-423-pure-confidence-calibration-contract-remediation-verify.mjs",
      "tests/e2e/action-423-pure-confidence-calibration-contract-remediation.spec.ts",
      "narrowly required Action 420-422 verifier/test compatibility updates",
      "minimal Actions 318-320 guard updates",
    ]);
    expect(report.next_permitted_action).toBe(
      "Action 423 - Pure Confidence Calibration Contract Remediation",
    );
    expect(report.mandatory_followup_action).toBe(
      "Action 424 - Independent Post-Remediation Confidence Calibration Verification",
    );
    expect(report.fixture_or_hash_freeze_allowed_next).toBe(false);
  });

  test("preserves current source hashes and avoids runtime consumers", () => {
    expect(Object.values(report.source_integrity).every((item) => item.unchanged)).toBe(true);
    expect(report.forbidden_action422_artifacts).toEqual([]);
    expect(report.tracked_action422_evidence_files).toEqual([]);
    expect(report.runtime_consumer_files).toEqual([]);
    expect(report.runtime_preview_status).toBe("runtime_preview_waiting_for_operator_inputs");
    expect(report.runtime_preview_route_changed).toBe(false);
    expect(report.runtime_preview_candidate_advanced).toBe(false);
  });

  test("keeps all no-effect flags false", () => {
    expect(report.no_effect_flags).toEqual({
      provider_call_executed: false,
      provider_call_attempted: false,
      supabase_read_executed: false,
      supabase_write_executed: false,
      persistence_executed: false,
      replay_executed: false,
      runtime_integration_executed: false,
      calibration_execution_executed: false,
      calibration_shadow_executed: false,
      recommendation_mutation_executed: false,
      feedback_executed: false,
      scanner_behavior_changed: false,
      live_ranking_changed: false,
      runtime_preview_advanced: false,
    });
  });

  test("keeps the verifier static and read-only", () => {
    const verifierSource = readFileSync(verifierPath, "utf8");

    expect(verifierSource).not.toContain("from \"child_process\"");
    expect(verifierSource).not.toContain("from 'child_process'");
    expect(verifierSource).not.toContain("await import(");
    expect(verifierSource).not.toContain("calibrateConfidence(");
    expect(verifierSource).not.toContain("@supabase");
    expect(verifierSource).not.toContain("process.env");
  });
});
