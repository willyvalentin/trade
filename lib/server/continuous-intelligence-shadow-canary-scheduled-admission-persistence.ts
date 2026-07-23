import "server-only";

import {
  buildContinuousIntelligenceShadowCanaryScheduledLifecycleIdentity,
  mapContinuousIntelligenceShadowCanaryScheduledClaimAdmission,
  type ContinuousIntelligenceShadowCanaryScheduledClaimAdmissionResult,
  type ContinuousIntelligenceShadowCanaryScheduledExecutionRequest,
} from "@/lib/continuous-intelligence-shadow-canary-scheduled-admission";
import { claimContinuousIntelligenceShadowCanaryDailyCapacity } from "@/lib/server/continuous-intelligence-shadow-canary-claim-persistence";

/**
 * This is the scheduled adapter over the existing Action 574 claim RPC. It
 * owns no capacity calculation and deliberately does not begin an attempt.
 */
export async function admitContinuousIntelligenceShadowCanaryScheduledOccurrence(
  request: ContinuousIntelligenceShadowCanaryScheduledExecutionRequest,
): Promise<ContinuousIntelligenceShadowCanaryScheduledClaimAdmissionResult> {
  const lifecycleIdentity = buildContinuousIntelligenceShadowCanaryScheduledLifecycleIdentity(request);
  if (!lifecycleIdentity) {
    return mapContinuousIntelligenceShadowCanaryScheduledClaimAdmission(null, null);
  }
  const claim = await claimContinuousIntelligenceShadowCanaryDailyCapacity({
    claim_id: lifecycleIdentity.claim_id,
    execution_id: lifecycleIdentity.execution_id,
    request_fingerprint: lifecycleIdentity.request_fingerprint,
    utc_day: lifecycleIdentity.utc_day,
    estimated_credits: 1,
  });
  return mapContinuousIntelligenceShadowCanaryScheduledClaimAdmission(lifecycleIdentity, claim);
}
