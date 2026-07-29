import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { expect, test } from "@playwright/test";

const root = resolve(__dirname, "../..");
const successorModules = [
  "lib/action-650s-execution-identity.ts",
  "lib/action-650s-execution-preparation.ts",
  "lib/action-650s-manual-confirmation.ts",
  "lib/action-650s-confirmed-execution-replay.ts",
] as const;

function read(relativePath: string) {
  return readFileSync(resolve(root, relativePath), "utf8");
}

function importedSpecifiers(source: string) {
  return Array.from(
    source.matchAll(
      /(?:from\s+|import\s*\(\s*|require\s*\(\s*)["']([^"']+)["']/g,
    ),
    (match) => match[1],
  );
}

test("Action 650S successor imports only its closed synthetic module graph", () => {
  const allowed = new Set([
    "node:crypto",
    "@/lib/action-650s-execution-identity",
    "@/lib/action-650s-execution-preparation",
    "@/lib/action-650s-manual-confirmation",
  ]);

  for (const relativePath of successorModules) {
    const specifiers = importedSpecifiers(read(relativePath));

    expect(specifiers, relativePath).not.toEqual([]);
    for (const specifier of specifiers) {
      expect(allowed.has(specifier), `${relativePath}: ${specifier}`).toBe(true);
      expect(specifier).not.toMatch(
        /avanza|cdp|browser|playwright|puppeteer|localhost|bridge|credential|bankid|cookie|supabase|database|prisma|drizzle|child_process/i,
      );
    }
  }
});

test("Action 650S successor has no dynamic transport, persistence, process, or submission invocation", () => {
  const forbiddenInvocations = [
    /\bfetch\s*\(/,
    /\bXMLHttpRequest\b/,
    /\bWebSocket\b/,
    /\bEventSource\b/,
    /\bcreateClient\s*\(/,
    /\b(?:exec|execFile|spawn|fork)\s*\(/,
    /\bprocess\.(?:env|argv|cwd)\b/,
    /\brequire\s*\(/,
    /\bimport\s*\(/,
    /\.(?:insert|upsert|delete)\s*\(/,
    /\bsubmitOrder\s*\(/,
    /\bplaceOrder\s*\(/,
    /\bexecuteTrade\s*\(/,
    /https?:\/\//,
    /\/api\//,
  ] as const;

  for (const relativePath of successorModules) {
    const source = read(relativePath);

    for (const forbidden of forbiddenInvocations) {
      expect(source, `${relativePath}: ${String(forbidden)}`).not.toMatch(
        forbidden,
      );
    }
  }
});

test("Action 650S source graph contains no production entrypoint or framework surface", () => {
  expect(successorModules.every((path) => path.startsWith("lib/"))).toBe(true);
  expect(successorModules).not.toContainEqual(
    expect.stringMatching(/app\/|pages\/|route\.ts|component|script/i),
  );

  for (const relativePath of successorModules) {
    expect(read(relativePath)).not.toMatch(
      /["']use (?:client|server)["']|NextRequest|NextResponse|server-only/i,
    );
  }
});
