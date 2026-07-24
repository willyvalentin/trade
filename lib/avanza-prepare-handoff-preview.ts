export type AvanzaPrepareHandoffPreviewStatus =
  | "preview_only"
  | "not_enabled";

export type AvanzaPrepareHandoffPreviewModel = {
  advisoryNotes: readonly string[];
  ctaLabel: string;
  description: string;
  disabledReason: string;
  futureFlowSteps: readonly string[];
  safetyCopy: readonly string[];
  secondaryStatus: AvanzaPrepareHandoffPreviewStatus;
  status: AvanzaPrepareHandoffPreviewStatus;
  title: string;
};

export const avanzaPrepareHandoffPreviewModel: AvanzaPrepareHandoffPreviewModel =
  {
    advisoryNotes: [
      "Total-read remains unresolved/advisory.",
      "Read-only observation is not execution readiness.",
      "No order placement.",
    ],
    ctaLabel: "Prepare Avanza handoff",
    description:
      "Future semi-auto handoff shell. Total-read remains unresolved/advisory, and manual review is required in Avanza.",
    disabledReason:
      "Preview only. Not enabled until a future safe handoff flow is explicitly implemented.",
    futureFlowSteps: [
      "Ture validates the trade package.",
      "Ture checks read-only Avanza readiness.",
      "Ture prepares the order form.",
      "Ture stops before Granska köp.",
      "User manually reviews in Avanza.",
    ],
    safetyCopy: [
      "Ture will not click Granska köp",
      "Ture will not submit an order",
      "Manual review required in Avanza",
    ],
    secondaryStatus: "not_enabled",
    status: "preview_only",
    title: "Prepare Avanza handoff",
  };

export function formatAvanzaPrepareHandoffPreviewStatus(
  status: AvanzaPrepareHandoffPreviewStatus,
) {
  return status === "preview_only" ? "Preview only" : "Not enabled";
}
