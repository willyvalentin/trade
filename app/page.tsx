import { TradeApp } from "./trade-app";
import { buildProviderPlanProfile } from "@/lib/provider-plan-profile";
import { evaluateGrowMaxLearningMode } from "@/lib/grow-max-learning-mode";
import { getLearningAccelerationConfig } from "@/lib/learning-acceleration-mode";

export const dynamic = "force-dynamic";

export default function Home() {
  const providerPlanProfile = buildProviderPlanProfile();
  const growMaxLearningMode = evaluateGrowMaxLearningMode({
    providerPlanProfileMode: providerPlanProfile.effective_mode,
  });
  const learningAccelerationConfig = getLearningAccelerationConfig({
    growMaxLearningModeEnabled: growMaxLearningMode.grow_max_learning_mode,
  });

  return (
    <TradeApp learningAccelerationServerConfig={learningAccelerationConfig} />
  );
}
