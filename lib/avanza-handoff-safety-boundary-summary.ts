export type AvanzaHandoffSafetyBoundaryStatus = "enforced" | "advisory";

export type AvanzaHandoffSafetyBoundary = {
  detail: string;
  id: string;
  label: string;
  status: AvanzaHandoffSafetyBoundaryStatus;
};

export type AvanzaHandoffSafetyBoundarySummary = {
  boundaries: AvanzaHandoffSafetyBoundary[];
  label: string;
};

export const avanzaHandoffSafetyBoundarySummary: AvanzaHandoffSafetyBoundarySummary =
  {
    boundaries: [
      {
        detail: "The package card is a display-only preview.",
        id: "preview_only",
        label: "Preview only",
        status: "enforced",
      },
      {
        detail: "The prepare handoff control remains disabled.",
        id: "disabled_control",
        label: "Disabled control",
        status: "enforced",
      },
      {
        detail: "Trade UI uses static fixture data, not live recommendation state.",
        id: "no_live_recommendation_wiring",
        label: "No live recommendation wiring",
        status: "enforced",
      },
      {
        detail: "Trade UI does not call the local bridge.",
        id: "no_trade_ui_bridge_call",
        label: "No bridge call from Trade UI",
        status: "enforced",
      },
      {
        detail: "Trade UI does not fetch localhost.",
        id: "no_trade_ui_localhost_fetch",
        label: "No localhost fetch from Trade UI",
        status: "enforced",
      },
      {
        detail: "No automatic or recurring status checks run from this card.",
        id: "no_polling",
        label: "No polling",
        status: "enforced",
      },
      {
        detail: "The live invocation phrase is not present in UI code.",
        id: "no_trigger_phrase",
        label: "No trigger phrase",
        status: "enforced",
      },
      {
        detail: "The card has no live runner or fill endpoint wiring.",
        id: "no_runner_fill_endpoint",
        label: "No runner/fill endpoint",
        status: "enforced",
      },
      {
        detail: "Ture will not click Granska kop from this UI.",
        id: "no_granska_kop_click",
        label: "No click on Granska kop",
        status: "enforced",
      },
      {
        detail: "No review modal is opened from this UI.",
        id: "no_review_modal",
        label: "No review modal",
        status: "enforced",
      },
      {
        detail: "No final confirmation action is available.",
        id: "no_final_confirmation",
        label: "No final confirmation",
        status: "enforced",
      },
      {
        detail: "No submit action is available.",
        id: "no_submit",
        label: "No submit",
        status: "enforced",
      },
      {
        detail: "No order can be placed from this preview.",
        id: "no_order_placement",
        label: "No order placement",
        status: "enforced",
      },
      {
        detail:
          "No credentials, session, BankID, cookies, or storage handling is added.",
        id: "no_credentials_session_bankid_cookies_storage",
        label: "No credentials/session/BankID/cookies/storage handling",
        status: "enforced",
      },
      {
        detail: "No Supabase execution record is written from this preview.",
        id: "no_supabase_execution_write",
        label: "No Supabase execution write",
        status: "enforced",
      },
      {
        detail: "Actual order total detection remains unresolved and advisory.",
        id: "total_read_unresolved_advisory",
        label: "Total-read unresolved/advisory",
        status: "advisory",
      },
    ],
    label: "Safety boundaries",
  };
