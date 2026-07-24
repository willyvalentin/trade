import { expect, test } from "@playwright/test";
import { buildContinuousIntelligenceShadowCanaryScheduledExecutionRequest } from "../../lib/continuous-intelligence-shadow-canary-scheduled-admission";
import { buildContinuousIntelligenceShadowCanaryScheduledLiveShadowRequest, parseContinuousIntelligenceShadowCanaryScheduledLiveShadowRequest, resolveContinuousIntelligenceShadowCanaryScheduledExecutionGate, runContinuousIntelligenceShadowCanaryScheduledLiveShadowHarness } from "../../lib/continuous-intelligence-shadow-canary-scheduled-live-shadow";

function request() { const base = buildContinuousIntelligenceShadowCanaryScheduledExecutionRequest({ deployment_commit: "7eb1f42440d7555041f68697a2d05157f3a640f5", market_date: "2026-07-23", market_window: { start: "2026-07-23T14:30:00.000Z", end: "2026-07-23T15:00:00.000Z" }, requested_at: "2026-07-23T15:01:00.000Z" }); if (!base) throw new Error("request"); const live = buildContinuousIntelligenceShadowCanaryScheduledLiveShadowRequest(base); if (!live) throw new Error("live"); return live; }

test("Action 623 keeps live-shadow contract separate and gate-disabled by default", async () => {
  const live = request();
  expect(parseContinuousIntelligenceShadowCanaryScheduledLiveShadowRequest(live)).toEqual(live);
  expect(parseContinuousIntelligenceShadowCanaryScheduledLiveShadowRequest({ ...live, execution_mode: "dry_run" })).toBeNull();
  expect(resolveContinuousIntelligenceShadowCanaryScheduledExecutionGate(undefined)).toBe("scheduled_execution_disabled");
  expect(resolveContinuousIntelligenceShadowCanaryScheduledExecutionGate("unexpected")).toBe("scheduled_execution_configuration_unavailable");
  let admitted = 0;
  const result = await runContinuousIntelligenceShadowCanaryScheduledLiveShadowHarness({ request: live, authenticated: true, gate: "scheduled_execution_disabled", safety_ready: true, admission: async () => { admitted += 1; return "admitted"; }, shared_core: async () => "completed" });
  expect(result).toBe("scheduled_execution_disabled"); expect(admitted).toBe(0);
});

test("Action 623 admits exactly once before the injected shared core and maps terminal results", async () => {
  const live = request(); let admissions = 0; let cores = 0;
  const completed = await runContinuousIntelligenceShadowCanaryScheduledLiveShadowHarness({ request: live, authenticated: true, gate: "scheduled_execution_enabled", safety_ready: true, admission: async () => { admissions += 1; return "admitted"; }, shared_core: async () => { cores += 1; return "completed"; } });
  expect(completed).toBe("scheduled_execution_completed"); expect(admissions).toBe(1); expect(cores).toBe(1);
  const replay = await runContinuousIntelligenceShadowCanaryScheduledLiveShadowHarness({ request: live, authenticated: true, gate: "scheduled_execution_enabled", safety_ready: true, admission: async () => "already_terminal_idempotent", shared_core: async () => "completed" });
  expect(replay).toBe("scheduled_execution_already_completed");
  const provider = await runContinuousIntelligenceShadowCanaryScheduledLiveShadowHarness({ request: live, authenticated: true, gate: "scheduled_execution_enabled", safety_ready: true, admission: async () => "admitted", shared_core: async () => "provider_failure" });
  expect(provider).toBe("scheduled_execution_terminal_provider_failure");
});
