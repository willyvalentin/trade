import { createContinuousIntelligenceShadowCanaryScheduledDryRunHandler } from "@/lib/server/continuous-intelligence-shadow-canary-scheduled-dry-run-handler";
import { buildContinuousIntelligenceShadowCanaryScheduledDryRunDependencies } from "@/lib/server/continuous-intelligence-shadow-canary-scheduled-dry-run-context";

export const dynamic = "force-dynamic";
export const maxDuration = 5;

const handler = createContinuousIntelligenceShadowCanaryScheduledDryRunHandler({
  expected_secret: () => process.env.AUTOMATION_SECRET,
  dependencies: buildContinuousIntelligenceShadowCanaryScheduledDryRunDependencies,
});

export async function POST(request: Request) {
  return handler(request);
}
