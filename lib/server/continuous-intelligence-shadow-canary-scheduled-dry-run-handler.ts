import {
  evaluateContinuousIntelligenceShadowCanaryScheduledDryRun,
  evaluateContinuousIntelligenceShadowCanaryScheduledDryRunAuthentication,
  parseContinuousIntelligenceShadowCanaryScheduledDryRunRequest,
  type ScheduledDryRunDependencies,
} from "@/lib/continuous-intelligence-shadow-canary-scheduled-dry-run";

export function createContinuousIntelligenceShadowCanaryScheduledDryRunHandler(input: {
  expected_secret: () => string | undefined;
  dependencies: (request: NonNullable<ReturnType<typeof parseContinuousIntelligenceShadowCanaryScheduledDryRunRequest>>) => Promise<ScheduledDryRunDependencies | null>;
}) {
  return async (request: Request) => {
    const authentication = evaluateContinuousIntelligenceShadowCanaryScheduledDryRunAuthentication(input.expected_secret(), request.headers.get("x-automation-secret"));
    if (authentication !== "scheduler_auth_ready") {
      const evidence = evaluateContinuousIntelligenceShadowCanaryScheduledDryRun({ authentication, request: null, dependencies: null });
      return Response.json({ result: authentication === "scheduler_auth_configuration_unavailable" ? "scheduled_dry_run_unavailable" : "scheduled_dry_run_unauthorized", evidence }, { status: authentication === "scheduler_auth_configuration_unavailable" ? 503 : 401, headers: { "Cache-Control": "no-store" } });
    }
    let parsed = null;
    try { parsed = parseContinuousIntelligenceShadowCanaryScheduledDryRunRequest(JSON.parse(await request.text())); } catch { /* fail closed below */ }
    if (!parsed) {
      const evidence = evaluateContinuousIntelligenceShadowCanaryScheduledDryRun({ authentication, request: null, dependencies: null });
      return Response.json({ result: "scheduled_dry_run_invalid_request", evidence }, { status: 400, headers: { "Cache-Control": "no-store" } });
    }
    const dependencies = await input.dependencies(parsed);
    const evidence = evaluateContinuousIntelligenceShadowCanaryScheduledDryRun({ authentication, request: parsed, dependencies });
    const result = evidence.hypothetical_admission_eligible
      ? "scheduled_dry_run_ready_before_execution"
      : evidence.first_blocker === "deployment_identity_mismatch"
        ? "scheduled_dry_run_deployment_mismatch"
        : evidence.first_blocker === "deployment_configuration_conflict"
          ? "scheduled_dry_run_deployment_configuration_conflict"
          : evidence.first_blocker === "deployment_configuration_malformed" ||
              evidence.first_blocker === "deployment_platform_identity_conflict" ||
              evidence.first_blocker === "deployment_platform_identity_malformed"
            ? "scheduled_dry_run_deployment_identity_unavailable"
        : evidence.first_blocker === "unavailable"
          ? "scheduled_dry_run_unavailable"
          : "scheduled_dry_run_blocked";
    return Response.json({ result, evidence }, { status: result === "scheduled_dry_run_ready_before_execution" ? 200 : result === "scheduled_dry_run_unavailable" ? 503 : 409, headers: { "Cache-Control": "no-store" } });
  };
}
