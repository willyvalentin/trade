import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  avanzaDevOnlyPreviewEnablementCandidateChecklist,
  avanzaDevOnlyPreviewEnablementDefaultChecklist,
} from "../../lib/avanza-dev-only-preview-enablement-checklist";

const repoRoot = process.cwd();

function readRepoFile(path: string) {
  return readFileSync(join(repoRoot, path), "utf8");
}

function rowById(
  checklist: typeof avanzaDevOnlyPreviewEnablementDefaultChecklist,
  id: string,
) {
  const row = checklist.rows.find((item) => item.id === id);

  if (!row) {
    throw new Error(`Missing checklist row ${id}`);
  }

  return row;
}

test.describe("Avanza dev-only preview enablement checklist panel", () => {
  test("default not_allowed summary can render", () => {
    const source = readRepoFile(
      "components/execution/AvanzaDevOnlyPreviewEnablementChecklistPanel.tsx",
    );

    expect(avanzaDevOnlyPreviewEnablementDefaultChecklist.status).toBe(
      "not_allowed",
    );
    expect(source).toContain("Dev-only preview checklist");
    expect(source).toContain("checklist.status");
    expect(source).toContain("checklist.label");
    expect(source).toContain("checklist.reason");
  });

  test("default reason renders static fixture, false flag, and disabled guard", () => {
    const checklist = avanzaDevOnlyPreviewEnablementDefaultChecklist;

    expect(checklist.reason).toContain("Default static_fixture remains active");
    expect(checklist.reason).toContain("explicitPreviewOnlyFlag is false");
    expect(checklist.reason).toContain("integration guard is disabled");
    expect(rowById(checklist, "default_static_fixture_remains_active")).toEqual(
      expect.objectContaining({ status: "enforced" }),
    );
    expect(rowById(checklist, "explicit_preview_only_flag_default_false")).toEqual(
      expect.objectContaining({ status: "enforced" }),
    );
    expect(
      rowById(checklist, "selected_recommendation_preview_disabled_by_default"),
    ).toEqual(expect.objectContaining({ status: "enforced" }));
  });

  test("candidate_for_dev_preview fixture can render", () => {
    const checklist = avanzaDevOnlyPreviewEnablementCandidateChecklist;
    const source = readRepoFile(
      "components/execution/AvanzaDevOnlyPreviewEnablementChecklistPanel.tsx",
    );

    expect(checklist.status).toBe("candidate_for_dev_preview");
    expect(source).toContain("candidate_for_dev_preview");
    expect(rowById(checklist, "integration_guard_must_allow_preview_only").status).toBe(
      "ready",
    );
    expect(rowById(checklist, "pre_wiring_candidate_required").status).toBe(
      "ready",
    );
  });

  test("candidate still shows no bridge, local fetch, and execution", () => {
    const checklist = avanzaDevOnlyPreviewEnablementCandidateChecklist;
    const source = readRepoFile(
      "components/execution/AvanzaDevOnlyPreviewEnablementChecklistPanel.tsx",
    );

    expect(source).toContain("No bridge calls");
    expect(source).toContain("No localhost fetch");
    expect(source).toContain("No execution");
    expect(rowById(checklist, "no_bridge_calls").status).toBe("enforced");
    expect(rowById(checklist, "no_localhost_fetch").status).toBe("enforced");
    expect(rowById(checklist, "no_click_review_final_submit_order").status).toBe(
      "enforced",
    );
  });

  test("candidate still shows disabled controls and locked gate", () => {
    const checklist = avanzaDevOnlyPreviewEnablementCandidateChecklist;
    const source = readRepoFile(
      "components/execution/AvanzaDevOnlyPreviewEnablementChecklistPanel.tsx",
    );

    expect(source).toContain("Controls must remain disabled");
    expect(source).toContain("Gate must remain locked");
    expect(rowById(checklist, "controls_must_remain_disabled").status).toBe(
      "enforced",
    );
    expect(rowById(checklist, "pre_activation_gate_must_remain_locked").status).toBe(
      "enforced",
    );
  });

  test("total-read advisory remains visible", () => {
    const checklist = avanzaDevOnlyPreviewEnablementCandidateChecklist;
    const source = readRepoFile(
      "components/execution/AvanzaDevOnlyPreviewEnablementChecklistPanel.tsx",
    );

    expect(source).toContain("checklist.advisories.map");
    expect(rowById(checklist, "total_read_advisory")).toEqual(
      expect.objectContaining({
        label: "Total-read advisory",
        status: "advisory",
      }),
    );
    expect(checklist.advisories).toContain("Total-read advisory");
  });

  test("panel is isolated from Trade UI and has no active controls", () => {
    const source = readRepoFile(
      "components/execution/AvanzaDevOnlyPreviewEnablementChecklistPanel.tsx",
    );
    const tradeSource = readRepoFile("app/trade-app.tsx");

    expect(tradeSource).not.toContain(
      "AvanzaDevOnlyPreviewEnablementChecklistPanel",
    );
    expect(source).not.toContain("<button");
    expect(source).not.toMatch(/onClick\s*=/);
    expect(source).not.toMatch(/href=/i);
  });

  test("panel source has no live endpoints, trigger phrase, bridge, or app-state behavior", () => {
    const source = readRepoFile(
      "components/execution/AvanzaDevOnlyPreviewEnablementChecklistPanel.tsx",
    );

    expect(source).not.toMatch(/app\/trade-app|useState|useMemo/);
    expect(source).not.toMatch(/fetch\s*\(/);
    expect(source).toContain("No localhost fetch");
    expect(source).not.toMatch(/https?:\/\/localhost|127\.0\.0\.1/);
    expect(source).not.toMatch(/\/live-fill-only-runner\//);
    expect(source).not.toMatch(/fillQuantityField|fillPriceField|fillAmountField/);
    expect(source).not.toMatch(/FINAL LIVE EXECUTE ATTEMPT/);
    expect(source).not.toMatch(/method:\s*["']POST["']/);
    expect(source).not.toMatch(/localStorage|sessionStorage|document\.cookie/i);
  });
});
