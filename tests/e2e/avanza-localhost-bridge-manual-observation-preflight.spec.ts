import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const repoRoot = process.cwd();

function readRepoFile(path: string) {
  return readFileSync(join(repoRoot, path), "utf8");
}

function manualObservationSlice(source: string) {
  const start = source.indexOf("function buildOrderFormPreflightCheck");
  const end = source.indexOf("function liveFillOnlyRunnerEnabled");

  expect(start).toBeGreaterThanOrEqual(0);
  expect(end).toBeGreaterThan(start);

  return source.slice(start, end);
}

test.describe("Avanza localhost bridge manual observation preflight", () => {
  test("documents the explicit manual observation runbook", () => {
    const doc = readRepoFile(
      "docs/first-real-avanza-fill-only-poc-manual-browser-observation-mode.md",
    );

    expect(doc).toContain(
      "first_real_avanza_fill_only_poc_manual_browser_observation_mode_added",
    );
    expect(doc).toContain("GET /preflight/avanza-order-form");
    expect(doc).toContain(
      "AVANZA_LOCALHOST_BRIDGE_MANUAL_OBSERVATION_MODE=cdp_readonly",
    );
    expect(doc).toContain("curl -sS http://127.0.0.1:47831/health");
    expect(doc).toContain("curl -sS http://127.0.0.1:47831/self-check");
    expect(doc).toContain(
      "curl -sS http://127.0.0.1:47831/preflight/avanza-order-form",
    );
    expect(doc).toContain("no field fill");
    expect(doc).toContain("no click");
    expect(doc).toContain("no order placement");
    expect(doc).toContain("no cookie read");
    expect(doc).toContain("no localStorage read");
    expect(doc).toContain("no sessionStorage read");
  });

  test("keeps the bridge endpoint GET-only and observation-only", () => {
    const source = readRepoFile("scripts/avanza-localhost-bridge-server.mjs");
    const slice = manualObservationSlice(source);

    expect(source).toContain('request.method === "GET"');
    expect(source).toContain('url.pathname === "/preflight/avanza-order-form"');
    expect(source).not.toContain(
      'request.method === "POST" && url.pathname === "/preflight/avanza-order-form"',
    );

    expect(slice).toContain("manualObservationOnly: true");
    expect(slice).toContain("noFieldFill: true");
    expect(slice).toContain("noAmountFill: true");
    expect(slice).toContain("noPriceFill: true");
    expect(slice).toContain("noClick: true");
    expect(slice).toContain("noReviewClick: true");
    expect(slice).toContain("noFinalConfirmClick: true");
    expect(slice).toContain("noBrokerSubmission: true");
    expect(slice).toContain("noCredentialsHandling: true");
    expect(slice).toContain("noCookiesRead: true");
    expect(slice).toContain("noLocalStorageRead: true");
    expect(slice).toContain("noSessionStorageRead: true");
    expect(slice).not.toMatch(/fillAmountField|fillPriceField/);
    expect(slice).not.toMatch(/\.click\s*\(|\.fill\s*\(|Bekräfta.*click/i);
    expect(slice).not.toMatch(
      /localStorage\s*\.|sessionStorage\s*\.|document\.cookie/i,
    );
  });
});
