import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const repoRoot = process.cwd();

const uiFacingFiles = [
  "app/settings/page.tsx",
  "components/execution/AvanzaBridgeStatusPanel.tsx",
  "components/execution/AvanzaReadOnlyReadinessBadge.tsx",
  "lib/avanza-bridge-readiness-checklist.ts",
  "lib/avanza-local-bridge-readonly-fetcher.ts",
  "lib/avanza-local-bridge-status.ts",
] as const;

const allowedReadOnlyEndpointPaths = [
  "/health",
  "/self-check",
  "/preflight/avanza-order-form",
] as const;

const forbiddenLiteralFragments = [
  "/live-fill-only-runner/run-approved-quantity-based-fill-only-trigger",
  "/live-fill-only-runner/fill-quantity",
  "/live-fill-only-runner/fill-price",
  "/live-fill-only-runner/fill-amount",
  "FINAL LIVE EXECUTE ATTEMPT EXPLICIT INVOCATION TRIGGER",
  "I explicitly request the final live fill-only execute attempt trigger now",
  "Bekräfta köp/sälj",
] as const;

const forbiddenExecutablePatterns = [
  /\bonClick\s*=\s*{[^}]*Granska\s+k[oö]p/i,
  /\b(click|press|tap)(Granska|Review|Bekrafta|Bekräfta|Confirm|Submit|Order)/i,
  /\b(openReviewModal|clickReview|clickConfirm|clickBekrafta|clickBekr[aä]fta)\b/i,
  /\b(submitOrder|placeOrder|confirmOrder|executeOrder|sendOrder)\b/i,
  /\bmethod\s*:\s*["']POST["']/i,
] as const;

function readRepoFile(path: string) {
  return readFileSync(join(repoRoot, path), "utf8");
}

test.describe("Avanza bridge UI safety guard", () => {
  test("UI-facing bridge files do not contain live runner endpoints or trigger phrase", () => {
    for (const file of uiFacingFiles) {
      const source = readRepoFile(file);

      for (const fragment of forbiddenLiteralFragments) {
        expect(source, `${file} must not contain ${fragment}`).not.toContain(
          fragment,
        );
      }
    }
  });

  test("UI-facing bridge files do not contain executable review/final/submit/order paths", () => {
    for (const file of uiFacingFiles) {
      const source = readRepoFile(file);

      for (const pattern of forbiddenExecutablePatterns) {
        expect(source, `${file} must not match ${pattern}`).not.toMatch(pattern);
      }
    }
  });

  test("read-only fetcher allowlist contains only permitted GET endpoints", () => {
    const source = readRepoFile("lib/avanza-local-bridge-readonly-fetcher.ts");

    for (const endpoint of allowedReadOnlyEndpointPaths) {
      expect(source).toContain(endpoint);
    }

    expect(source).toContain('method: "GET"');
    expect(source).toContain('credentials: "omit"');
    expect(source).not.toContain('"POST"');
    expect(source).not.toMatch(/\/live-fill-only-runner\//);
  });

  test("safety copy may mention review/submit boundaries without adding actions", () => {
    const panelSource = readRepoFile(
      "components/execution/AvanzaBridgeStatusPanel.tsx",
    );

    expect(panelSource).toContain("Ture will not click Granska köp");
    expect(panelSource).toContain("Ture will not submit an order");
    expect(panelSource).toContain("Manual review required in Avanza");
    expect(panelSource).toContain("No order can be placed from this panel");
    expect(panelSource).not.toMatch(/\/live-fill-only-runner\//);
    expect(panelSource).not.toMatch(/fetch\s*\(/);
  });

  test("guard is documented in Avanza bridge data-layer plan", () => {
    const doc = readRepoFile(
      "docs/avanza-bridge-read-only-status-data-layer-plan.md",
    );

    expect(doc).toContain("avanza_bridge_ui_static_safety_guard_added");
    expect(doc).toContain("tests/e2e/avanza-bridge-ui-safety-guard.spec.ts");
    expect(doc).toContain("forbidden live runner endpoints");
    expect(doc).toContain("exact trigger phrase");
  });
});
