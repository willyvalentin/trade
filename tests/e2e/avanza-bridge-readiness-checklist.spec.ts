import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  buildAvanzaBridgeReadinessChecklist,
  summarizeAvanzaBridgeReadinessChecklist,
  type AvanzaBridgeReadinessRefreshMetadataInput,
} from "../../lib/avanza-bridge-readiness-checklist";
import type { AvanzaLocalBridgeStatusSummary } from "../../lib/avanza-local-bridge-status";

const repoRoot = process.cwd();

function readRepoFile(path: string) {
  return readFileSync(join(repoRoot, path), "utf8");
}

function statusFixture(
  overrides: Partial<AvanzaLocalBridgeStatusSummary> = {},
): AvanzaLocalBridgeStatusSummary {
  return {
    status: "preflight_ready",
    bridgeAvailable: true,
    selfCheckAvailable: true,
    preflightReady: true,
    manualObservationReady: true,
    checkedAt: "2026-07-03T10:00:00.000Z",
    endpoints: {
      health: "ok",
      selfCheck: "ok",
      preflight: "ok",
    },
    safeMessage: "Avanza order-form preflight is ready.",
    blockers: [],
    warnings: ["total_read_unresolved_advisory"],
    ...overrides,
  };
}

function refreshMetadataFixture(
  overrides: Partial<AvanzaBridgeReadinessRefreshMetadataInput["endpointSummary"]> = {},
): AvanzaBridgeReadinessRefreshMetadataInput {
  return {
    endpointSummary: {
      health: "available",
      selfCheck: "available",
      preflight: "ready",
      ...overrides,
    },
  };
}

const evidenceFixture = {
  accountVerified: "Valentin Labs KF",
  instrumentVerified: "GameStop",
  orderFormVisible: true,
  totalReadStatus: "unresolved_advisory" as const,
};

const milestoneFixture = {
  coreFillAndStopProven: true,
  stoppedBeforeReview: true,
  totalReadStatus: "unresolved_advisory" as const,
};

function byId(
  items: ReturnType<typeof buildAvanzaBridgeReadinessChecklist>,
  id: string,
) {
  const item = items.find((candidate) => candidate.id === id);
  expect(item, `Checklist item ${id}`).toBeTruthy();
  return item!;
}

test.describe("Avanza bridge readiness checklist helper", () => {
  test("disabled or not configured input produces blocked and unknown rows", () => {
    const items = buildAvanzaBridgeReadinessChecklist({
      evidence: null,
      featureEnabled: false,
      milestone: null,
      refreshMetadata: refreshMetadataFixture({
        health: "unknown",
        preflight: "unknown",
        selfCheck: "unknown",
      }),
      status: statusFixture({
        status: "not_configured",
        bridgeAvailable: false,
        selfCheckAvailable: false,
        preflightReady: false,
        manualObservationReady: false,
        endpoints: {
          health: "not_checked",
          selfCheck: "not_checked",
          preflight: "not_checked",
        },
      }),
    });

    expect(byId(items, "read_only_feature_flag_enabled").status).toBe("blocked");
    expect(byId(items, "local_bridge_reachable").status).toBe("unknown");
    expect(byId(items, "health_endpoint_available").status).toBe("unknown");
    expect(byId(items, "avanza_page_observed").status).toBe("unknown");
    expect(byId(items, "total_read_unresolved_advisory").status).toBe(
      "advisory",
    );
  });

  test("preflight ready input produces ready rows where evidence supports it", () => {
    const items = buildAvanzaBridgeReadinessChecklist({
      evidence: evidenceFixture,
      featureEnabled: true,
      milestone: milestoneFixture,
      refreshMetadata: refreshMetadataFixture(),
      status: statusFixture(),
    });

    expect(byId(items, "read_only_feature_flag_enabled").status).toBe("ready");
    expect(byId(items, "local_bridge_reachable").status).toBe("ready");
    expect(byId(items, "health_endpoint_available").status).toBe("ready");
    expect(byId(items, "self_check_endpoint_available").status).toBe("ready");
    expect(byId(items, "avanza_page_observed").status).toBe("ready");
    expect(byId(items, "order_form_visible").status).toBe("ready");
    expect(byId(items, "account_verified").status).toBe("ready");
    expect(byId(items, "instrument_verified").status).toBe("ready");
    expect(byId(items, "buy_side_verified").status).toBe("ready");
    expect(byId(items, "advanced_limit_mode_verified").status).toBe("ready");
    expect(byId(items, "stop_before_review_boundary_documented").status).toBe(
      "ready",
    );

    const summary = summarizeAvanzaBridgeReadinessChecklist(items);
    expect(summary.status).toBe("ready_for_read_only_observation");
    expect(summary.severity).toBe("warning");
    expect(summary.label).toBe("Ready for read-only observation");
    expect(summary.shortCopy).toContain("Total-read remains advisory");
    expect(summary.advisory_count).toBe(1);
  });

  test("preflight blocked input produces blocked verification rows safely", () => {
    const items = buildAvanzaBridgeReadinessChecklist({
      evidence: {
        accountVerified: null,
        instrumentVerified: null,
        orderFormVisible: false,
        totalReadStatus: "unresolved_advisory",
      },
      featureEnabled: true,
      milestone: null,
      refreshMetadata: refreshMetadataFixture({
        preflight: "blocked",
      }),
      status: statusFixture({
        status: "preflight_blocked",
        preflightReady: false,
        manualObservationReady: false,
        endpoints: {
          health: "ok",
          selfCheck: "ok",
          preflight: "blocked",
        },
      }),
    });

    expect(byId(items, "local_bridge_reachable").status).toBe("ready");
    expect(byId(items, "avanza_page_observed").status).toBe("blocked");
    expect(byId(items, "order_form_visible").status).toBe("blocked");
    expect(byId(items, "account_verified").status).toBe("blocked");
    expect(byId(items, "instrument_verified").status).toBe("blocked");
    expect(byId(items, "buy_side_verified").status).toBe("blocked");
    expect(byId(items, "advanced_limit_mode_verified").status).toBe("blocked");

    const summary = summarizeAvanzaBridgeReadinessChecklist(items);
    expect(summary.status).toBe("blocked");
    expect(summary.severity).toBe("danger");
    expect(summary.blocked_count).toBeGreaterThan(0);
  });

  test("total-read remains advisory and never ready", () => {
    const items = buildAvanzaBridgeReadinessChecklist({
      evidence: {
        ...evidenceFixture,
        totalReadStatus: "verified",
      },
      featureEnabled: true,
      milestone: {
        ...milestoneFixture,
        totalReadStatus: "unresolved_advisory",
      },
      refreshMetadata: refreshMetadataFixture(),
      status: statusFixture(),
    });

    expect(byId(items, "total_read_unresolved_advisory").status).toBe(
      "advisory",
    );
    expect(byId(items, "total_read_unresolved_advisory").status).not.toBe(
      "ready",
    );

    const summary = summarizeAvanzaBridgeReadinessChecklist(items);
    expect(summary.advisory_count).toBe(1);
    expect(summary.ready_count).toBe(items.length - 1);
  });

  test("disabled/not configured summary is blocked or unknown as appropriate", () => {
    const items = buildAvanzaBridgeReadinessChecklist({
      evidence: null,
      featureEnabled: false,
      milestone: null,
      refreshMetadata: refreshMetadataFixture({
        health: "unknown",
        preflight: "unknown",
        selfCheck: "unknown",
      }),
      status: statusFixture({
        status: "not_configured",
        bridgeAvailable: false,
        selfCheckAvailable: false,
        preflightReady: false,
        manualObservationReady: false,
      }),
    });
    const summary = summarizeAvanzaBridgeReadinessChecklist(items);

    expect(summary.status).toBe("blocked");
    expect(summary.severity).toBe("danger");
    expect(summary.blocked_count).toBe(1);
    expect(summary.unknown_count).toBeGreaterThan(0);
  });

  test("only advisory rows summarize as advisory only", () => {
    const summary = summarizeAvanzaBridgeReadinessChecklist([
      {
        id: "total_read_unresolved_advisory",
        label: "Total-read unresolved/advisory",
        status: "advisory",
      },
    ]);

    expect(summary.status).toBe("advisory_only");
    expect(summary.severity).toBe("warning");
    expect(summary.ready_count).toBe(0);
    expect(summary.advisory_count).toBe(1);
  });

  test("helper source and output avoid sensitive browser/session details", () => {
    const source = readRepoFile("lib/avanza-bridge-readiness-checklist.ts");
    const items = buildAvanzaBridgeReadinessChecklist({
      evidence: evidenceFixture,
      featureEnabled: true,
      milestone: milestoneFixture,
      refreshMetadata: refreshMetadataFixture(),
      status: statusFixture(),
    });
    const serialized = JSON.stringify(items);

    expect(source).not.toMatch(
      /document\.cookie|localStorage|sessionStorage|BankID|credentials|raw DOM|raw page text/i,
    );
    expect(serialized).not.toMatch(
      /document\.cookie|localStorage|sessionStorage|BankID|credentials/i,
    );
  });
});
