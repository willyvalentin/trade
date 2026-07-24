/* eslint-disable @typescript-eslint/no-explicit-any */
import { createHash } from "crypto";
import { execFileSync } from "child_process";
import { readFileSync } from "fs";

import { expect, test } from "@playwright/test";

const docPath = "docs/action-406-mapped-only-pattern-discovery-hash-freeze-and-static-shadow-approval-gate.md";
const verifierPath = "scripts/action-406-mapped-only-pattern-discovery-hash-freeze-and-static-shadow-approval-gate-verify.mjs";
const rowHashes = [
  "c541b7c12b4c93d30238d328907320f415a6593646c04b7ad9a9f117b879bf10",
  "308f97519a4779f4372adc62e6901ac385bb831c01423a7b32373c4619611412",
  "6f6aa09ac28e35b5342fc305fcaa5f97a97cdf6d6dc4af5477edee97c94b150c",
  "a73bd0365bbf8358e5746744d4774604007540160af27c67696d1474dc358854",
  "53ec6e76d02dcf552cadeb260176a0659192c5b82dca5958feff4ac36091be4f",
  "589db67304606f5e2acc7c42373cb1e49a12687cb0dafc2c25c407c815af1f77",
  "27cd78418b77f2af7d7bb6cc93334f52d862791c530a2878fa13a76c305f7da0",
  "4bd75cdac30b2f609088a4990f29bcc15558495e68691b41602a0b91334e7e41",
];

const read = (path = docPath) => readFileSync(path, "utf8");
const shaFile = (path: string) => createHash("sha256").update(readFileSync(path)).digest("hex");

test.describe.serial("Action 406 mapped-only Pattern Discovery hash freeze approval gate", () => {
  test("documentation includes the required approval-gate sections", () => {
    const doc = read();
    for (const section of [
      "Purpose", "Scope", "Authoritative Dependencies", "Action 405 Readiness Result",
      "Remaining Action 405 Condition", "Known Action 404 Lint Debt", "Explicit Non-Goals",
      "Protected-Source Inventory", "Exact Eligible-Case Inventory", "Exact Excluded-Case Policy",
      "Mapper Reconstruction Boundary", "Canonical Row-Hash Inventory", "Evidence-Set Hash",
      "Group Hash", "Expected Result Hash Policy", "Future Shadow Runner Boundary",
      "Lint-Readiness Policy", "Approval Decision", "Next Permitted Action",
    ]) expect(doc).toContain(`## ${section}`);
  });

  test("protected source hashes remain frozen", () => {
    expect(shaFile("lib/snapshot-to-learning-dataset-mapper.ts")).toBe("7294a851ede33aadc0dbfcb68c13337cd244002b84be7cbbe40abbe91673741d");
    expect(shaFile("lib/pure-pattern-discovery.ts")).toBe("48b7667c8690a1d8d56b819a3727e37ea73af7710a45131eb3debab48627191c");
    expect(shaFile("lib/learning-dataset-static-fixtures.ts")).toBe("706bd57150914862604af70e0bba7614151f53c32abc5dbde9595c53bf4b332b");
    expect(shaFile("lib/intelligence-context-static-fixtures.ts")).toBe("46358cb997b4f7a431a3fee72562659da48b13219404224f4e80e08dbf8ed406");
    expect(shaFile("lib/pattern-insight-static-fixtures.ts")).toBe("db8dae9f101f710123a0a3ac6493356bd761c15f231023ab9742caefaacf8f57");
    expect(shaFile("scripts/action-400-expanded-static-mapper-shadow-run.mjs")).toBe("a1123e1416df78a51645321cb9a273095c2a338febd8021265c4e3ee972d5b05");
    expect(shaFile("docs/action-400-expanded-static-mapper-shadow-input-manifest.json")).toBe("e0a2646492da2038bf156c0060c48eb8144e78ff0d57cda92a60d3ca36c95319");
  });

  test("ten allowed cases and thirty excluded cases are frozen", () => {
    const report = JSON.parse(execFileSync("node", [verifierPath], { encoding: "utf8" })) as Record<string, any>;
    expect(report.eligible_case_ids).toEqual([
      "expanded_valid_bearish_risk_context",
      "expanded_valid_fda_event_context",
      "expanded_valid_future_event_excluded",
      "expanded_valid_identity_nfc_equivalent",
      "expanded_valid_identity_percent_encoding",
      "expanded_valid_sec_event_context",
      "valid_complete_mapping",
      "valid_equivalent_aliases",
      "valid_normalized_confidence",
      "valid_rich_context",
    ]);
    expect(report.excluded_case_count).toBe(30);
    expect(report.checks.eligible_case_inventory_exact).toBe(true);
    expect(report.checks.excluded_case_policy_exact).toBe(true);
  });

  test("row hash inventory and duplicate counts are exact", () => {
    const report = JSON.parse(execFileSync("node", [verifierPath], { encoding: "utf8" })) as Record<string, any>;
    expect(report.row_hash_inventory).toHaveLength(10);
    for (const hash of rowHashes) expect(JSON.stringify(report.row_hash_inventory)).toContain(hash);
    expect(report.duplicate_inventory).toEqual({
      case_support_count: 10,
      unique_mapper_row_count: 3,
      shared_mapper_row_id_count: 8,
    });
  });

  test("evidence-set group and result hashes are frozen", () => {
    const report = JSON.parse(execFileSync("node", [verifierPath], { encoding: "utf8" })) as Record<string, any>;
    expect(report.configuration_sha256).toBe("501271173e3e14dcb46f30a6c2df9e1d12637fd4ee8b526e29ae4394181a8bd1");
    expect(report.input_sha256).toBe("ff39876e60275557f7d19ba79a3433910cccbf118e1666b4b6f6e70c009c953c");
    expect(report.evidence_set_sha256).toBe("f1f0053264c85d640d46b61da0ce7120e491309e3070132fe74a69a68438cbd8");
    expect(report.group_sha256).toBe("aa2ae3f39146ce1c6fc1f6ed73e19e96b02b7866b34e75b61c471a8277a1122e");
    expect(report.expected_result_sha256).toBe("e911709a784159c684a350de490fd56446ee23c23b3bf5ea2fbb70378ebf253c");
    expect(report.checks.hash_change_sensitivity).toBe(true);
  });

  test("expected insufficient evidence result contract is frozen", () => {
    const report = JSON.parse(execFileSync("node", [verifierPath], { encoding: "utf8" })) as Record<string, any>;
    expect(report.expected_result_contract).toMatchObject({
      status: "insufficient_evidence",
      group_count: 1,
      group_status: "insufficient_evidence",
      insight_count: 0,
    });
    expect(report.expected_result_contract.evidence).toMatchObject({
      case_support_count: 10,
      unique_mapper_row_count: 3,
      completed_outcome_count: 10,
      positive_count: 10,
      negative_count: 0,
      neutral_count: 0,
    });
    expect(report.expected_result_contract.warning_codes).toEqual([
      "minimum_total_support_not_met",
      "minimum_completed_outcomes_not_met",
      "duplicate_mapper_row_identity",
    ]);
  });

  test("does not execute discoverPatterns or create runtime side effects", () => {
    const source = read(verifierPath);
    expect(source).not.toContain("discoverPatterns(");
    expect(source).not.toContain("from \"@/lib/pure-pattern-discovery\"");
    expect(source).not.toMatch(/process\.stdin|JSON\.parse\(process\.argv|process\.env|fetch\(|@supabase|next\/server|writeFile|rmSync|mkdirSync|Date\.now|Math\.random/);
    const report = JSON.parse(execFileSync("node", [verifierPath], { encoding: "utf8" })) as Record<string, any>;
    expect(report.no_effect_flags.discover_patterns_executed).toBe(false);
    expect(report.no_effect_flags.pattern_discovery_shadow_executed).toBe(false);
    expect(report.no_effect_flags.persistence_executed).toBe(false);
    expect(report.no_effect_flags.replay_executed).toBe(false);
    expect(report.no_effect_flags.runtime_integration_executed).toBe(false);
  });

  test("approval is approved_with_conditions due lint debt and runtime preview remains paused", () => {
    const report = JSON.parse(execFileSync("node", [verifierPath], { encoding: "utf8" })) as Record<string, any>;
    expect(report.verification_status).toBe("passed");
    expect(report.approval_decision).toBe("approved_with_conditions");
    expect(report.failed_conditions_count).toBe(0);
    expect(report.unresolved_conditions_count).toBe(2);
    expect(report.lint_readiness).toBe("blocked_by_pre_existing_action_404_no_explicit_any");
    expect(report.runtime_preview_status).toBe("runtime_preview_waiting_for_operator_inputs");
    expect(report.recommended_next_action).toBe("action_407_mapped_only_pattern_discovery_static_shadow_execution_approval_gate");
  });
});
