import {
  RecommendationDetailsPill,
  RecommendationDetailsTextCard,
} from "@/components/recommendations/RecommendationDetailsModal";
import { recommendationDetailsValue } from "@/components/recommendations/recommendation-details-display-helpers";
import type { RecommendationDetailsTone } from "@/components/recommendations/recommendation-details-display-helpers";

export type LiveDayTradeEodSafetyPanelProps = {
  acknowledged: boolean;
  acknowledgeLabel: string;
  label: string;
  message: string;
  onAcknowledge: () => void;
  tone: RecommendationDetailsTone;
};

export function LiveDayTradeEodSafetyPanel({
  acknowledged,
  acknowledgeLabel,
  label,
  message,
  onAcknowledge,
  tone,
}: LiveDayTradeEodSafetyPanelProps) {
  return (
    <RecommendationDetailsTextCard
      label="EOD Manual Review Required"
      pill={<RecommendationDetailsPill label={label} tone={tone} />}
    >
      <p>{recommendationDetailsValue(message)}</p>
      {!acknowledged && (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onAcknowledge();
          }}
          className="trade-live-details-ack-button"
        >
          {acknowledgeLabel}
        </button>
      )}
    </RecommendationDetailsTextCard>
  );
}
