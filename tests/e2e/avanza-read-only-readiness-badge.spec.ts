import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import type { AvanzaBridgeReadinessSummary } from "../../lib/avanza-bridge-readiness-checklist";

const repoRoot = process.cwd();

function readRepoFile(path: string) {
  return readFileSync(join(repoRoot, path), "utf8");
}

function summaryFixture(
  overrides: Partial<AvanzaBridgeReadinessSummary> = {},
): AvanzaBridgeReadinessSummary {
  return {
    advisory_count: 1,
    blocked_count: 0,
    label: "Ready for read-only observation",
    ready_count: 11,
    severity: "warning",
    shortCopy:
      "Bridge and visible order-form checks are ready for read-only observation. Total-read remains advisory and this is not execution readiness.",
    status: "ready_for_read_only_observation",
    unknown_count: 0,
    ...overrides,
  };
}

test.describe("Avanza read-only readiness badge", () => {
  test("renders ready_for_read_only_observation advisory state", () => {
    const source = readRepoFile(
      "components/execution/AvanzaReadOnlyReadinessBadge.tsx",
    );
    const summary = summaryFixture();

    expect(summary.status).toBe("ready_for_read_only_observation");
    expect(summary.severity).toBe("warning");
    expect(summary.shortCopy).toContain("Total-read remains advisory");
    expect(source).toContain("Read-only readiness summary");
    expect(source).toContain("Read-only observation, not execution readiness");
    expect(source).toContain("summary.label");
    expect(source).toContain("summary.shortCopy");
    expect(source).toContain("summary.status");
    expect(source).toContain("summary.ready_count");
    expect(source).toContain("summary.blocked_count");
    expect(source).toContain("summary.advisory_count");
    expect(source).toContain("summary.unknown_count");
  });

  test("supports blocked state", () => {
    const source = readRepoFile(
      "components/execution/AvanzaReadOnlyReadinessBadge.tsx",
    );
    const summary = summaryFixture({
      blocked_count: 1,
      label: "Read-only readiness blocked",
      ready_count: 4,
      severity: "danger",
      shortCopy:
        "A required bridge, preflight, or visible order-form check is blocked.",
      status: "blocked",
      unknown_count: 2,
    });

    expect(summary.status).toBe("blocked");
    expect(summary.severity).toBe("danger");
    expect(source).toContain('severity === "danger"');
    expect(source).toContain("border-rose-300");
  });

  test("supports unknown state", () => {
    const source = readRepoFile(
      "components/execution/AvanzaReadOnlyReadinessBadge.tsx",
    );
    const summary = summaryFixture({
      advisory_count: 0,
      label: "Read-only readiness unknown",
      ready_count: 0,
      severity: "neutral",
      shortCopy:
        "There is not enough read-only bridge status data to summarize readiness.",
      status: "unknown",
      unknown_count: 12,
    });

    expect(summary.status).toBe("unknown");
    expect(summary.severity).toBe("neutral");
    expect(source).toContain("border-white/10");
  });

  test("contains no trigger, fill, or order controls", () => {
    const source = readRepoFile(
      "components/execution/AvanzaReadOnlyReadinessBadge.tsx",
    );

    expect(source).not.toMatch(/fetch\s*\(/);
    expect(source).not.toMatch(/onClick|button|role=["']button["']/);
    expect(source).not.toMatch(/\/live-fill-only-runner\//);
    expect(source).not.toMatch(/fillQuantityField|fillPriceField|fillAmountField/);
    expect(source).not.toMatch(/FINAL LIVE EXECUTE ATTEMPT/);
    expect(source).not.toMatch(
      /clickGranskaKop|openReviewModal|clickBekrafta|submitOrder|placeOrder/i,
    );
    expect(source).not.toMatch(/document\.cookie|localStorage|sessionStorage/);
    expect(source).not.toMatch(/supabase/i);
  });
});
