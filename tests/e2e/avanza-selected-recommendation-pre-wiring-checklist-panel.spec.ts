import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  avanzaSelectedRecommendationPreWiringDefaultChecklist,
  avanzaSelectedRecommendationPreWiringPreviewOnlyCandidateChecklist,
} from "../../lib/avanza-selected-recommendation-pre-wiring-checklist";

const repoRoot = process.cwd();

function readRepoFile(path: string) {
  return readFileSync(join(repoRoot, path), "utf8");
}

function rowById(
  checklist: typeof avanzaSelectedRecommendationPreWiringDefaultChecklist,
  id: string,
) {
  const row = checklist.rows.find((item) => item.id === id);

  if (!row) {
    throw new Error(`Missing checklist row ${id}`);
  }

  return row;
}

test.describe("Avanza selectedRecommendation pre-wiring checklist panel", () => {
  test("default not_ready_for_wiring summary can render", () => {
    const source = readRepoFile(
      "components/execution/AvanzaSelectedRecommendationPreWiringChecklistPanel.tsx",
    );

    expect(avanzaSelectedRecommendationPreWiringDefaultChecklist.summary.status).toBe(
      "not_ready_for_wiring",
    );
    expect(source).toContain("Pre-wiring checklist");
    expect(source).toContain("checklist.summary.status");
    expect(source).toContain("checklist.summary.label");
    expect(source).toContain("checklist.summary.reason");
  });

  test("integration guard disabled and static fixture rows are available", () => {
    const checklist = avanzaSelectedRecommendationPreWiringDefaultChecklist;
    const source = readRepoFile(
      "components/execution/AvanzaSelectedRecommendationPreWiringChecklistPanel.tsx",
    );

    expect(rowById(checklist, "integration_guard_default_disabled")).toEqual(
      expect.objectContaining({
        label: "Integration guard default disabled",
        status: "blocked",
      }),
    );
    expect(rowById(checklist, "source_mode_default_static_fixture")).toEqual(
      expect.objectContaining({
        label: "Source mode default static_fixture",
        status: "enforced",
      }),
    );
    expect(source).toContain("checklist.rows.map");
    expect(source).toContain("row.label");
    expect(source).toContain("row.detail");
  });

  test("safety copy renders no bridge, local fetch, execution, and disabled controls", () => {
    const source = readRepoFile(
      "components/execution/AvanzaSelectedRecommendationPreWiringChecklistPanel.tsx",
    );

    expect(source).toContain("Preview-only wiring is not active");
    expect(source).toContain("No bridge calls");
    expect(source).toContain("No localhost fetch");
    expect(source).toContain("No execution");
    expect(source).toContain("Controls must remain disabled");
  });

  test("candidate_for_preview_only_wiring fixture can render safely", () => {
    const checklist =
      avanzaSelectedRecommendationPreWiringPreviewOnlyCandidateChecklist;

    expect(checklist.summary.status).toBe("candidate_for_preview_only_wiring");
    expect(checklist.summary.blockedCount).toBe(0);
    expect(rowById(checklist, "no_bridge_calls_allowed").status).toBe(
      "enforced",
    );
    expect(rowById(checklist, "no_localhost_fetch_allowed").status).toBe(
      "enforced",
    );
    expect(rowById(checklist, "no_execution_allowed").status).toBe("enforced");
    expect(rowById(checklist, "no_active_button_allowed").status).toBe(
      "enforced",
    );
    expect(
      rowById(checklist, "pre_activation_gate_must_remain_locked").status,
    ).toBe("enforced");
  });

  test("panel is isolated from Trade UI and has no active controls", () => {
    const source = readRepoFile(
      "components/execution/AvanzaSelectedRecommendationPreWiringChecklistPanel.tsx",
    );
    const tradeSource = readRepoFile("app/trade-app.tsx");

    expect(tradeSource).not.toContain(
      "AvanzaSelectedRecommendationPreWiringChecklistPanel",
    );
    expect(source).not.toContain("<button");
    expect(source).not.toMatch(/onClick\s*=/);
    expect(source).not.toMatch(/href=/i);
  });

  test("panel source has no bridge, trigger, fill, or app-state behavior", () => {
    const source = readRepoFile(
      "components/execution/AvanzaSelectedRecommendationPreWiringChecklistPanel.tsx",
    );

    expect(source).not.toMatch(/app\/trade-app|useState|useMemo/);
    expect(source).not.toMatch(/fetch\s*\(/);
    expect(source).not.toMatch(/127\.0\.0\.1/);
    expect(source).not.toMatch(/\/live-fill-only-runner\//);
    expect(source).not.toMatch(/fillQuantityField|fillPriceField|fillAmountField/);
    expect(source).not.toMatch(/FINAL LIVE EXECUTE ATTEMPT/);
    expect(source).not.toMatch(/method:\s*["']POST["']/);
    expect(source).not.toMatch(/localStorage|sessionStorage|cookie|BankID/i);
  });
});
