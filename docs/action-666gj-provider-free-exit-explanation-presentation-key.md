# Action 666GJ — Provider-free exit-explanation presentation keys

## Bounded objective

Implement the finite provider-free advisory presentation-key projection selected
by Action 666GI. The projection accepts only the existing closed
`decision_status`, `decision_reason` and `decision_priority` tuple, and returns
one fixed source literal for each of the seven accepted classifications.

## Contract

| Field | Record |
| --- | --- |
| `action_id` | `ACTION_666GJ` |
| `input_boundary` | Exactly three own data fields: `decision_status`, `decision_reason` and safe-integer `decision_priority`. |
| `accepted_domain` | The seven tuples already accepted by Action 666GA. |
| `output_boundary` | One fixed advisory `presentation_key`, or an explicit rejection with null payload. |
| `authority_boundary` | Source-only, provider-free and runtime-unwired. The module does not import or invoke the exit evaluator. |
| `side_effect_boundary` | No data/provider/secret/network read, persistence, writer, route, UI, deployment, broker or execution action. |
| `rejection_boundary` | Malformed or expanded input rejects as `invalid_input_shape`; an exact unknown tuple rejects as `unsupported_decision_classification`. |
| `next_action` | `ACTION_666GK` may independently review static key-table containment only. |

## Fixed key vocabulary

| Status | Reason | Priority | Key |
| --- | --- | ---: | --- |
| `exit_full` | `hard_stop` | 1 | `exit_full_hard_stop` |
| `exit_full` | `invalidation` | 2 | `exit_full_invalidation` |
| `exit_full` | `session_close` | 3 | `exit_full_session_close` |
| `exit_full` | `final_target` | 4 | `exit_full_final_target` |
| `exit_partial` | `first_target_partial` | 5 | `exit_partial_first_target_partial` |
| `move_stop` | `profit_protection_stop_move` | 6 | `move_stop_profit_protection_stop_move` |
| `hold` | `hold` | 7 | `hold_hold` |

The keys are static semantic identifiers, not executable commands. They contain
no user, account, position, recommendation, price, quantity, timestamp,
credential, policy, provider or broker data. The module has no caller or
runtime integration; a presentation, route or evaluator call remains a
separate admission decision.
