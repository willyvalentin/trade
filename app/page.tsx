import { TradeApp } from "./trade-app";
import { buildProviderPlanProfile } from "@/lib/provider-plan-profile";
import { evaluateGrowMaxLearningMode } from "@/lib/grow-max-learning-mode";
import { getLearningAccelerationConfig } from "@/lib/learning-acceleration-mode";
import {
  historicalCandleStorageReadbackToDetection,
  readHistoricalCandleStorageSchema,
} from "@/lib/historical-candle-storage-readback";

export const dynamic = "force-dynamic";

export default async function Home() {
  const providerPlanProfile = buildProviderPlanProfile();
  const growMaxLearningMode = evaluateGrowMaxLearningMode({
    providerPlanProfileMode: providerPlanProfile.effective_mode,
  });
  const learningAccelerationConfig = getLearningAccelerationConfig({
    growMaxLearningModeEnabled: growMaxLearningMode.grow_max_learning_mode,
  });
  const historicalCandleStorageReadback =
    await readHistoricalCandleStorageSchema();
  const historicalCandleStorageDetection =
    historicalCandleStorageReadbackToDetection(historicalCandleStorageReadback);

  return (
    <TradeApp
      learningAccelerationServerConfig={learningAccelerationConfig}
      historicalCandleStorageDetection={historicalCandleStorageDetection}
    />
  );
}
