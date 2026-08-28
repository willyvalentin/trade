const contractVersion =
  "action_666gm_provider_free_accessibility_announcement_metadata_v1" as const;
const noExecutionAuthority =
  "advisory_accessibility_metadata_no_execution_authority" as const;

export type Action666gmAccessibilityAnnouncementMetadataResult = Readonly<{
  contract_version: typeof contractVersion;
  projection_state: "projected" | "rejected";
  authority: typeof noExecutionAuthority;
  accessibility_announcement_key: string | null;
  rejection_code:
    | "invalid_input_shape"
    | "unsupported_presentation_key"
    | null;
  runtime_wired: false;
  side_effects_performed: false;
}>;

const announcementKeys: Readonly<Record<string, string>> = Object.freeze({
  exit_full_hard_stop: "exit_full_hard_stop_announcement",
  exit_full_invalidation: "exit_full_invalidation_announcement",
  exit_full_session_close: "exit_full_session_close_announcement",
  exit_full_final_target: "exit_full_final_target_announcement",
  exit_partial_first_target_partial:
    "exit_partial_first_target_partial_announcement",
  move_stop_profit_protection_stop_move:
    "move_stop_profit_protection_stop_move_announcement",
  hold_hold: "hold_hold_announcement",
});

function rejectedResult(
  rejectionCode: Exclude<
    Action666gmAccessibilityAnnouncementMetadataResult["rejection_code"],
    null
  >,
): Action666gmAccessibilityAnnouncementMetadataResult {
  return Object.freeze({
    contract_version: contractVersion,
    projection_state: "rejected",
    authority: noExecutionAuthority,
    accessibility_announcement_key: null,
    rejection_code: rejectionCode,
    runtime_wired: false,
    side_effects_performed: false,
  });
}

function readOwnDescriptors(candidate: object) {
  try {
    return {
      names: Object.getOwnPropertyNames(candidate),
      symbols: Object.getOwnPropertySymbols(candidate),
      descriptors: Object.getOwnPropertyDescriptors(candidate),
    };
  } catch {
    return null;
  }
}

function closedPresentationKey(input: unknown): string | null {
  if (!input || typeof input !== "object" || Array.isArray(input)) return null;

  const own = readOwnDescriptors(input);
  if (!own) return null;
  if (
    own.names.length !== 1 ||
    own.symbols.length !== 0 ||
    own.names[0] !== "presentation_key"
  ) {
    return null;
  }

  const key = own.descriptors.presentation_key;
  if (!key || !("value" in key) || typeof key.value !== "string") {
    return null;
  }

  return key.value;
}

/**
 * Projects one of the seven closed presentation keys into fixed accessibility
 * metadata. It performs no evaluation, I/O, rendering or runtime wiring.
 */
export function projectAction666gmAccessibilityAnnouncementMetadata(
  input: unknown,
): Action666gmAccessibilityAnnouncementMetadataResult {
  const presentationKey = closedPresentationKey(input);
  if (presentationKey === null) return rejectedResult("invalid_input_shape");

  const announcementKey = announcementKeys[presentationKey];
  if (!announcementKey) return rejectedResult("unsupported_presentation_key");

  return Object.freeze({
    contract_version: contractVersion,
    projection_state: "projected",
    authority: noExecutionAuthority,
    accessibility_announcement_key: announcementKey,
    rejection_code: null,
    runtime_wired: false,
    side_effects_performed: false,
  });
}
