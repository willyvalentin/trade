export type DiscardReviewStatus = "pending" | "reviewed" | "skipped" | "error";

export type DiscardOutcome =
  | "entry_not_triggered"
  | "target_hit"
  | "stop_hit"
  | "partial_move"
  | "sideways"
  | "unknown";

export type DiscardDecisionQuality =
  | "correct_discard"
  | "missed_winner"
  | "missed_opportunity"
  | "neutral"
  | "unknown";
