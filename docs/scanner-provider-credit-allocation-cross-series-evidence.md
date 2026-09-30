# Provider-credit allocation cross-series evidence

`scanner_provider_credit_allocation_cross_series_evidence_v1` is the fail-closed
read model for the two already observed 2026-09-30 allocation-shadow series. It
does not run a scan or change the scanner. Its only product decision is whether
the retained retrospective evidence is coherent enough to justify designing a
new, separately predeclared and reversible live-allocation experiment.

## Frozen retrospective contract

`scanner_provider_credit_allocation_cross_series_contract_v1` accepts only:

- `observation_series_fa9f47b6a24fc3db`, `[16:15Z, 16:45Z)`;
- `observation_series_15f795345822f5f6`, `[17:00Z, 17:30Z)`;
- trading date `2026-09-30` and deployed commit
  `fdadb7c7b163af115642838d353a48ebeb5cefff`;
- baseline `serial_shared_provider_budget_v1` and challenger
  `candidate_breadth_first_provider_budget_v1`;
- one common six-credit cap and at least two observed shadow cycles; and
- all cycles from both series. A non-observed cycle stays in the denominator;
  it is never silently discarded to make the evidence pass.

The contract is explicitly `retrospective_design_support_only` because it was
written after these observations existed. It therefore cannot be represented
as prospective confirmation and cannot authorize a policy promotion.

## Classification

Exact matching evidence may produce
`consistent_retrospective_breadth_improvement_projected`. Missing one required
series remains `insufficient_evidence`. Revision, window, cap, policy, lineage,
publication or duplicate-series drift is `invalid`.

The observed retained denominator is four cycles: two observed and two
non-observed. The observed shadows project an aggregate `+6` candidates
receiving a first-pass provider credit and `-4` late-index candidates left
wholly unfunded, which is the sum of two separate `+3` / `-2` shadows. This is a
data-fitness proxy only. It does not establish fully rankable coverage,
calibration, expectancy, recommendation quality or alpha.

## Runtime boundary

The authenticated GET route
`/api/app/provider-credit-allocation-cross-series-evidence` rebuilds the result
from owner-bound durable series evidence and returns `Cache-Control: no-store`.
There is no mutation method. The read model cannot schedule work, call a
provider, reserve a credit, change live allocation, alter ranking or
publication, lower a threshold, publish a candidate or contact a broker.

An available result can only select the next design step:
`prepare_predeclared_reversible_live_allocation_experiment`. That future
experiment must freeze its forward population, slot assignment, provider
budget, rollback and decision-changing coverage/outcome metrics before it is
run.
