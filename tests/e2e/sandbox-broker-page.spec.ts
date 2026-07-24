import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const componentPath = join(
  process.cwd(),
  "components/execution/SandboxBrokerOrderForm.tsx",
);
const pagePath = join(process.cwd(), "app/sandbox-broker/page.tsx");

function read(path: string) {
  return readFileSync(path, "utf8");
}

test.describe("sandbox broker page for semi-auto agent POC", () => {
  test("wires the sandbox route to the local-only order form", () => {
    const pageSource = read(pagePath);

    expect(pageSource).toContain("SandboxBrokerOrderForm");
    expect(pageSource).not.toContain("fetch(");
    expect(pageSource).not.toContain("supabase");
    expect(pageSource).not.toContain("service-role");
  });

  test("renders sandbox labels, fake order fields, and local safety checklist", () => {
    const source = read(componentPath);

    for (const copy of [
      "Sandbox broker",
      "Fake order form",
      "No real broker connection",
      "No Avanza order",
      "No order will be placed",
      "Ticker",
      "Side/action",
      "Quantity",
      "Order type",
      "Limit/entry price",
      "Stop",
      "Target",
      "Planned risk",
      "Payload id",
      "Safety checklist",
      "Semi-auto only",
      "Manual final confirmation required",
      "Automatic submit allowed",
      "Automatic submit attempted",
      "Local sandbox only",
    ]) {
      expect(source).toContain(copy);
    }
  });

  test("uses local component state and disabled non-submitting final control only", () => {
    const source = read(componentPath);

    expect(source).toContain('"use client"');
    expect(source).toContain("useState<SandboxBrokerOrderState>");
    expect(source).toContain("setOrder((current)");
    expect(source).toContain('type="button"');
    expect(source).toContain("disabled");
    expect(source).toContain("Disabled fake");
    expect(source).toContain("KÖP");
    expect(source).toContain("SÄLJ");
    expect(source).not.toContain("<form");
    expect(source).not.toContain("action=");
  });

  test("keeps implementation free of external calls, persistence, and real broker automation", () => {
    const combinedSource = `${read(pagePath)}\n${read(componentPath)}`;

    for (const forbidden of [
      "fetch(",
      "supabase",
      "createClient",
      ".from(",
      ".insert(",
      "execution-record-audit-writer",
      "audit-writer",
      "service-role",
      "SUPABASE_SERVICE_ROLE",
      "process.env",
      "localStorage",
      "sessionStorage",
      "run-scan",
      "/api/",
      "provider",
      "scanner",
      "market-loop",
      "avanza.se",
      "puppeteer",
      "chromium",
      "firefox",
      "webkit",
      ".goto(",
      ".click(",
      "automatic_submit_allowed: true",
      "automatic_submit_attempted: true",
      "agent_can_submit_order: true",
      "recordTrade",
      "updateTrade",
      "trade_stats_pnl_mutated: true",
    ]) {
      expect(combinedSource).not.toContain(forbidden);
    }
  });
});
