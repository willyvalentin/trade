import { expect, test } from "@playwright/test";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const repoRoot = process.cwd();

const currentSemiAutoFiles = [
  "lib/semi-auto-agent-payload-contract.ts",
  "lib/semi-auto-agent-payload-builder.ts",
  "lib/mock-semi-auto-browser-agent-adapter.ts",
  "lib/semi-auto-agent-handoff-preview.ts",
  "lib/semi-auto-agent-result-capture-stub.ts",
  "lib/semi-auto-agent-dev-flow-state-machine.ts",
  "lib/semi-auto-agent-dev-flow-review.ts",
  "lib/semi-auto-agent-local-dev-flow-store.ts",
  "components/execution/SemiAutoAgentHandoffPreview.tsx",
  "components/execution/SemiAutoAgentResultCaptureStub.tsx",
  "components/execution/SemiAutoAgentDevFlowReviewPanel.tsx",
  "components/execution/SemiAutoAgentLocalDevFlowHistoryViewer.tsx",
] as const;

const proposedFutureFiles = [
  "app/sandbox-broker/page.tsx",
  "lib/browser-agent-safety-boundary.ts",
  "lib/sandbox-browser-agent-adapter.ts",
  "components/execution/SandboxBrokerOrderForm.tsx",
  "components/execution/SandboxBrokerAgentPanel.tsx",
] as const;

const realAvanzaFilesThatMustRemainAbsent = [
  "lib/avanza-browser-agent-adapter.ts",
  "lib/real-avanza-browser-agent-adapter.ts",
  "components/execution/AvanzaBrowserAgentPanel.tsx",
] as const;

const forbiddenExecutablePatterns = [
  /from ["']@playwright\/test["']/,
  /from ["']playwright["']/,
  /from ["']puppeteer["']/,
  /\bchromium\b/,
  /\bfirefox\b/,
  /\bwebkit\b/,
  /\.goto\s*\(/,
  /\.click\s*\(/,
  /\blocator\s*\(/,
  /avanza\.se/i,
  /SUPABASE_SERVICE_ROLE/,
  /service-role/i,
  /createClient\s*\(/,
  /\.from\s*\(/,
  /\.insert\s*\(/,
  /fetch\s*\(/,
  /run-scan/,
  /\/api\//,
  /execution-record-audit-writer/,
  /audit-writer.*from/,
  /provider/i,
  /scanner/i,
  /market-loop/i,
  /recordTrade/,
  /updateTrade/,
  /trade_stats_pnl_mutated:\s*true/,
  /automatic_submit_allowed:\s*true/,
  /automatic_submit_attempted:\s*true/,
  /agent_can_submit_order:\s*true/,
] as const;

function readRepoFile(path: string) {
  return readFileSync(join(repoRoot, path), "utf8");
}

function existingFiles(paths: readonly string[]) {
  return paths.filter((path) => existsSync(join(repoRoot, path)));
}

test.describe("browser automation safety boundary", () => {
  test("documents the static safety boundary and next sandbox action", () => {
    const spec = readRepoFile("docs/browser-automation-safety-boundary-spec.md");
    const normalizedSpec = spec.replace(/\s+/g, " ");

    expect(spec).toContain("browser_automation_safety_boundary_spec_created");
    expect(normalizedSpec).toContain(
      "Action 993 - Add Sandbox Broker Page for Semi-Auto Agent POC",
    );
    expect(normalizedSpec).toContain(
      "Action 994 - Add Local Browser Agent Adapter Against Sandbox Page",
    );
    expect(spec).toContain("sandbox_browser_agent_adapter_poc_added");
    expect(spec).toContain("Allowed Future Behavior");
    expect(spec).toContain("Forbidden Behavior");
    expect(spec).toContain("Required Invariants");
    expect(spec).toContain("Static Guard Model");
    expect(spec).toContain("Sandbox-First Requirement");
    expect(spec).toContain("Real Avanza Feasibility Gate");
    expect(spec).toContain("Full-Auto Boundary");
    expect(spec).toContain("Risk Acceptance Matrix");
  });

  test("keeps current semi-auto and proposed future namespace free of executable automation and write paths", () => {
    const filesToScan = [
      ...currentSemiAutoFiles,
      ...existingFiles(proposedFutureFiles),
    ];

    for (const path of filesToScan) {
      const source = readRepoFile(path);

      for (const pattern of forbiddenExecutablePatterns) {
        expect(
          source,
          `${path} must not contain forbidden browser-agent boundary pattern ${pattern}`,
        ).not.toMatch(pattern);
      }
    }
  });

  test("keeps real Avanza browser-agent implementation paths absent until separately approved", () => {
    for (const path of realAvanzaFilesThatMustRemainAbsent) {
      expect(existsSync(join(repoRoot, path)), `${path} should be absent`).toBe(
        false,
      );
    }
  });
});
