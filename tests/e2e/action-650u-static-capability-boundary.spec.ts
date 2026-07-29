import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { expect, test } from "@playwright/test";

const root = resolve(__dirname, "../..");
const successorModules = [
  "lib/action-650u-temporal-confirmation-policy.ts",
  "lib/action-650u-manual-confirmation.ts",
  "lib/action-650u-confirmed-execution-replay.ts",
];
const allowedImports = new Set([
  "@/lib/action-650s-confirmed-execution-replay",
  "@/lib/action-650s-execution-identity",
  "@/lib/action-650s-execution-preparation",
  "@/lib/action-650u-manual-confirmation",
  "@/lib/action-650u-temporal-confirmation-policy",
]);

test("Action 650U successor import graph remains closed over synthetic predecessors", () => {
  for (const modulePath of successorModules) {
    const source = readFileSync(resolve(root, modulePath), "utf8");
    const imports = Array.from(
      source.matchAll(/from\s+["']([^"']+)["']/g),
      (match) => match[1],
    );

    expect(source, modulePath).not.toMatch(/\bimport\s*\(|\brequire\s*\(/);
    for (const imported of imports) {
      expect(allowedImports.has(imported), `${modulePath}: ${imported}`).toBe(
        true,
      );
    }
  }
});

test("Action 650U successor has no transport, persistence, process, credential, browser, or submission invocation", () => {
  const prohibited = [
    /\bfetch\s*\(/,
    /\bWebSocket\b/,
    /\bchild_process\b/,
    /\bspawn(?:Sync)?\s*\(/,
    /\bprocess\.(?:env|argv|cwd)\b/,
    /\bsupabase\b/i,
    /\b(?:insert|update|upsert|delete)\s*\(/,
    /\bcdp\b/i,
    /\bplaywright\b/i,
    /\bpuppeteer\b/i,
    /\bavanza\b/i,
    /\b(?:credential|cookie|bankid|password|secret)\b/i,
    /\b(?:submit|placeOrder|finalBuy|finalSell)\s*\(/,
  ];

  for (const modulePath of successorModules) {
    const source = readFileSync(resolve(root, modulePath), "utf8");
    for (const pattern of prohibited) {
      expect(source, `${modulePath}: ${pattern}`).not.toMatch(pattern);
    }
  }
});

test("Action 650U hard-locks all live and write effects to zero", () => {
  const replaySource = readFileSync(
    resolve(root, "lib/action-650u-confirmed-execution-replay.ts"),
    "utf8",
  );

  expect(replaySource).toContain("broker_requests_submitted: 0");
  expect(replaySource).toContain("provider_calls: 0");
  expect(replaySource).toContain("database_writes: 0");
  expect(replaySource).toContain("trade_mutations: 0");
  expect(replaySource).toContain("real_trade_mutations: 0");
});
