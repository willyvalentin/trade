import "server-only";

import {
  buildScannerProviderCreditAllocationCrossSeriesEvidence,
  providerCreditAllocationSeriesSourceFromReadback,
  SCANNER_PROVIDER_CREDIT_ALLOCATION_CROSS_SERIES_CONTRACT,
} from "@/lib/scanner-provider-credit-allocation-cross-series-evidence";
import { readObservationSeriesEvidenceBySeriesId } from "@/lib/server/observation-series-evidence-readback";

export async function readScannerProviderCreditAllocationCrossSeriesEvidence(
  ownerUserId: string,
) {
  const readbacks = await Promise.all(
    SCANNER_PROVIDER_CREDIT_ALLOCATION_CROSS_SERIES_CONTRACT.eligible_series.map(
      ({ series_id }) =>
        readObservationSeriesEvidenceBySeriesId({ ownerUserId, seriesId: series_id }),
    ),
  );
  const sources = readbacks.flatMap((readback) => {
    const source = providerCreditAllocationSeriesSourceFromReadback(readback);
    return source ? [source] : [];
  });
  return buildScannerProviderCreditAllocationCrossSeriesEvidence(sources);
}
