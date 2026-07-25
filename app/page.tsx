import { TradeApp } from "./trade-app";
import { AvanzaReadOnlyReadinessBadge } from "@/components/execution/AvanzaReadOnlyReadinessBadge";
import { tradeExecutionReadOnlySummaryFixture } from "@/lib/avanza-read-only-readiness-fixture";
import { connection } from "next/server";
import { buildProviderPlanProfile } from "@/lib/provider-plan-profile";
import { evaluateGrowMaxLearningMode } from "@/lib/grow-max-learning-mode";
import { getLearningAccelerationConfig } from "@/lib/learning-acceleration-mode";
import {
  historicalCandleStorageReadbackToDetection,
  readHistoricalCandleStorageSchema,
} from "@/lib/historical-candle-storage-readback";
import { requireApplicationPageSession } from "@/lib/server/application-session";

export const dynamic = "force-dynamic";

export default async function Home() {
  await requireApplicationPageSession();
  const providerPlanProfile = buildProviderPlanProfile();
  const growMaxLearningMode = evaluateGrowMaxLearningMode({
    providerPlanProfileMode: providerPlanProfile.effective_mode,
  });
  const learningAccelerationConfig = getLearningAccelerationConfig({
    growMaxLearningModeEnabled: growMaxLearningMode.grow_max_learning_mode,
  });
  await connection();
  const historicalCandleStorageReadback =
    await readHistoricalCandleStorageSchema();
  const historicalCandleStorageDetection =
    historicalCandleStorageReadbackToDetection(historicalCandleStorageReadback);

  return (
    <>
      <div data-deploy-marker="action_307f_deploy_marker" hidden>
        action_307f_deploy_marker
      </div>
      <section
        aria-label="Read-only observation context"
        className="mx-auto w-full max-w-7xl px-4 pt-4 sm:px-6 lg:px-8"
      >
        <div className="max-w-xl">
          <AvanzaReadOnlyReadinessBadge
            summary={tradeExecutionReadOnlySummaryFixture}
          />
        </div>
      </section>
      <TradeApp
        learningAccelerationServerConfig={learningAccelerationConfig}
        historicalCandleStorageDetection={historicalCandleStorageDetection}
      />
    </>
  );
}
