import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  avanzaHandoffPreviewSourceModes,
} from "../../lib/avanza-handoff-preview-source-mode";
import {
  buildAvanzaSelectedRecommendationPreWiringChecklist,
} from "../../lib/avanza-selected-recommendation-pre-wiring-checklist";
import {
  buildAvanzaSelectedRecommendationPreviewIntegrationGuard,
} from "../../lib/avanza-selected-recommendation-preview-integration-guard";

const repoRoot = process.cwd();

function readRepoFile(path: string) {
  return readFileSync(join(repoRoot, path), "utf8");
}

function rowById(
  checklist: ReturnType<typeof buildAvanzaSelectedRecommendationPreWiringChecklist>,
  id: string,
) {
  const row = checklist.rows.find((item) => item.id === id);

  if (!row) {
    throw new Error(`Missing checklist row ${id}`);
  }

  return row;
}

test.describe("Avanza selectedRecommendation pre-wiring checklist", () => {
  test("default checklist returns not_ready_for_wiring", () => {
    const checklist = buildAvanzaSelectedRecommendationPreWiringChecklist();

    expect(checklist.summary.status).toBe("not_ready_for_wiring");
    expect(checklist.summary.blockedCount).toBeGreaterThan(0);
    expect(checklist.summary.reason).toContain("not ready");
  });

  test("default checklist includes integration guard disabled", () => {
    const checklist = buildAvanzaSelectedRecommendationPreWiringChecklist();

    expect(rowById(checklist, "integration_guard_default_disabled")).toEqual(
      expect.objectContaining({
        label: "Integration guard default disabled",
        status: "blocked",
      }),
    );
    expect(rowById(checklist, "explicit_preview_only_flag_required")).toEqual(
      expect.objectContaining({
        status: "blocked",
      }),
    );
  });

  test("default checklist includes source mode static_fixture", () => {
    const checklist = buildAvanzaSelectedRecommendationPreWiringChecklist();

    expect(rowById(checklist, "source_mode_default_static_fixture")).toEqual(
      expect.objectContaining({
        status: "enforced",
      }),
    );
    expect(
      rowById(checklist, "selected_recommendation_preview_only_inactive_future"),
    ).toEqual(
      expect.objectContaining({
        status: "blocked",
      }),
    );
  });

  test("explicit preview-only guard can produce candidate_for_preview_only_wiring", () => {
    const checklist = buildAvanzaSelectedRecommendationPreWiringChecklist({
      integrationGuard: buildAvanzaSelectedRecommendationPreviewIntegrationGuard({
        explicitPreviewOnlyFlag: true,
      }),
      sourceMode:
        avanzaHandoffPreviewSourceModes.selected_recommendation_preview_only,
    });

    expect(checklist.summary.status).toBe("candidate_for_preview_only_wiring");
    expect(checklist.summary.blockedCount).toBe(0);
    expect(rowById(checklist, "explicit_preview_only_flag_required").status).toBe(
      "ready",
    );
    expect(
      rowById(checklist, "selected_recommendation_preview_only_inactive_future")
        .status,
    ).toBe("ready");
  });

  test("candidate still forbids bridge, local fetch, execution, and active buttons", () => {
    const checklist = buildAvanzaSelectedRecommendationPreWiringChecklist({
      integrationGuard: buildAvanzaSelectedRecommendationPreviewIntegrationGuard({
        explicitPreviewOnlyFlag: true,
      }),
      sourceMode:
        avanzaHandoffPreviewSourceModes.selected_recommendation_preview_only,
    });

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

  test("total-read remains advisory and no execution-ready copy appears", () => {
    const checklist = buildAvanzaSelectedRecommendationPreWiringChecklist({
      integrationGuard: buildAvanzaSelectedRecommendationPreviewIntegrationGuard({
        explicitPreviewOnlyFlag: true,
      }),
      sourceMode:
        avanzaHandoffPreviewSourceModes.selected_recommendation_preview_only,
    });
    const serialized = JSON.stringify(checklist);

    expect(rowById(checklist, "total_read_remains_advisory").status).toBe(
      "advisory",
    );
    expect(serialized).toMatch(/Total-read remains advisory/);
    expect(serialized).not.toMatch(/execution-ready/i);
    expect(serialized).not.toMatch(/production ready/i);
  });

  test("helper is pure and contains no app state, bridge, trigger, fill, or storage behavior", () => {
    const source = readRepoFile(
      "lib/avanza-selected-recommendation-pre-wiring-checklist.ts",
    );

    expect(source).not.toMatch(/process\.env/);
    expect(source).not.toMatch(/app\/trade-app|useState|useMemo|from ["']react["']/);
    expect(source).not.toMatch(/fetch\s*\(/);
    expect(source).toContain("No localhost fetch allowed");
    expect(source).not.toMatch(/127\.0\.0\.1/);
    expect(source).not.toMatch(/\/live-fill-only-runner\//);
    expect(source).not.toMatch(/fillQuantityField|fillPriceField|fillAmountField/);
    expect(source).not.toMatch(/FINAL LIVE EXECUTE ATTEMPT/);
    expect(source).not.toMatch(/method:\s*["']POST["']/);
    expect(source).not.toMatch(/localStorage|sessionStorage|cookie|BankID/i);
  });
});
