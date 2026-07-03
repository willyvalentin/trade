import { TradeApp } from "./trade-app";
import { AvanzaReadOnlyReadinessBadge } from "@/components/execution/AvanzaReadOnlyReadinessBadge";
import { tradeExecutionReadOnlySummaryFixture } from "@/lib/avanza-read-only-readiness-fixture";
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
    <>
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
      <TradeApp learningAccelerationServerConfig={learningAccelerationConfig} />
    </>
  );
}
