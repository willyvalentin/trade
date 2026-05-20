# Avanza Browser-Agent Prototype Plan

## Product Principle

Trade is a semi-automatic co-pilot, not an autonomous trading bot.

The future browser-agent may:

- read the Trade execution payload
- open or navigate to Avanza in a browser session
- fill order fields from the payload
- prepare the order form
- stop before final confirmation

The future browser-agent must not:

- click the final KOP/SALJ confirmation
- submit orders
- bypass manual confirmation
- trade if the payload is expired
- trade if `do_not_submit_order = true`
- continue past `requires_manual_confirmation = true`
- invent missing trade details
- modify ticker, shares, price, side, or validity beyond the payload
- continue if the Avanza UI differs from the expected safe state

Trade should expose only a safe, prepare-only payload. Trade should never expose broker credentials, session tokens, or automation authority to submit an order.

## Payload Source

The agent should read the payload from the ADD TRADE modal DOM block:

```html
<div
  id="trade-execution-payload-json"
  data-agent-readable="true"
  data-payload-id="..."
  data-ticker="..."
  data-broker-hint="AVANZA"
  data-order-intent="prepare_only"
>
  { ...json payload... }
</div>
```

Expected payload fields:

- `payload_id`
- `payload_version`
- `expires_at`
- `payload_fingerprint`
- `ticker`
- `market`
- `broker_hint`
- `direction`
- `order_intent`
- `requires_manual_confirmation`
- `do_not_submit_order`
- `broker_execution_mode`
- `order_type`
- `time_in_force`
- `shares`
- `limit_price`
- `stop_loss`
- `target_price`
- `setup_type`
- `validation_status`
- `intraday_confirmation`
- `broker_cost_estimate`

The agent should display or log the payload fingerprint before interacting with Avanza so the user can confirm that the visible payload and copied/consumed payload match.

## Agent Preflight Checklist

Before doing anything in Avanza, the future agent must verify:

- payload exists
- payload parses as JSON
- `payload.broker_hint === "AVANZA"`
- `payload.order_intent === "prepare_only"`
- `payload.requires_manual_confirmation === true`
- `payload.do_not_submit_order === true`
- payload is not expired
- payload direction is supported
- payload shares > 0
- payload limit price > 0
- payload ticker exists
- validation status is `valid` or `warning`, not `blocked`
- payload fingerprint is shown or logged
- user is already logged into Avanza, or user logs in manually

If any preflight check fails, the agent must stop, report why, and must not fill the Avanza order form.

## Intended Preparation Flow

1. User opens Trade and validates ADD TRADE.
2. User clicks MARK READY FOR AGENT.
3. Agent reads the DOM payload.
4. Agent verifies the full preflight checklist.
5. Agent navigates to Avanza or uses an existing logged-in Avanza tab.
6. Agent searches for or selects the ticker.
7. Agent verifies instrument name, ticker, market, and currency.
8. Agent fills order side: buy for long.
9. Agent fills quantity from `shares`.
10. Agent fills limit price from `limit_price`.
11. Agent selects day validity if available.
12. Agent stops before final confirmation.
13. Agent reports: "Order form prepared. Manual confirmation required."
14. User manually reviews and clicks final KOP/SALJ in Avanza if everything is correct.
15. User returns to Trade and enters actual fill details.
16. User creates the Live Day Trade after broker confirmation.

These steps are intentionally high-level because the Avanza UI can change. A future prototype must prefer stopping over guessing.

## Hard Stop Conditions

The future agent must immediately stop if:

- the final confirmation button is visible and would be clicked by the next action
- Avanza shows unexpected warnings
- ticker or instrument cannot be verified
- price differs from the payload
- quantity differs from the payload
- market or currency differs unexpectedly
- order preview shows unexpected fees or costs
- buying power is insufficient
- payload expires during the flow
- user is not logged in
- login or 2FA is required
- Avanza page layout is unknown
- any uncertainty exists

Stopping is the safe behavior. The agent should report the reason and never submit an order.

## Agent Completion Text

When the order form has been prepared and the agent has stopped before final confirmation, the agent should output exactly:

> Avanza order form is prepared. Please manually verify ticker, quantity, limit price, estimated fees, buying power, stop/target plan, and then click the final confirmation yourself if everything is correct.

When the agent stops before preparing the order, it should output:

> I stopped before preparing the order because: [reason]. No broker order was submitted.

## Future Technical Architecture Options

Possible implementation paths, none implemented yet:

- external local browser-agent process that reads the Trade DOM payload
- Playwright-based local prototype
- browser-use style agent
- OS/browser-control agent
- extension-based approach

Architecture constraints:

- Trade remains the source of the execution payload, not broker credentials.
- The agent consumes prepare-only order details.
- Avanza login, 2FA, and final confirmation remain manual.
- The agent must not store broker credentials.
- The agent must not add hidden broker-side permissions.
- The agent must not submit an order in any phase.

## Recommended Future Phases

Phase 1: Manual copy payload plus user fills Avanza manually.

Phase 2: Agent reads DOM payload and prepares the Avanza form in a local browser, then stops before confirmation.

Phase 3: Agent reports prepared state back to Trade. User still manually confirms Avanza.

Phase 4: Execution feedback loop compares payload vs actual fill, slippage, costs, and setup type performance.

There is no phase where the agent submits the final order automatically.

## Later Trade UI TODOs

- Add an "Open Agent Instructions" link or button near disabled Prepare Avanza Order.
- Add a payload handoff status panel.
- Add a manual "Agent prepared order" checkbox.
- Add a broker warning capture field.
- Add a screenshot/reference note field.
- Add persistent agent handoff event in Supabase if needed.
