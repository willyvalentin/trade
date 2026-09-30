# Provider-credit allocation execution plan

`scanner_provider_credit_allocation_plan_v1` remains the provider-free semantic
source for the current serial allocator and the breadth-first challenger. It
turns an ordered candidate denominator, exact daily/intraday refresh deficits,
a policy version and one positive total credit cap into a deterministic
allocation plan. Its schema and fingerprint remain unchanged so historical
shadow evidence can still be rebuilt exactly.

The baseline allocates daily and then intraday depth candidate by candidate.
The challenger first allocates at most one deficit per candidate, preferring
the prerequisite daily history, and only then allocates remaining second
deficits. Fresh cache is represented as no deficit and therefore costs no
planned credit.

Every valid plan retains the normalized candidate denominator, exact
allocations, funded-candidate count and unfunded-deficit count. A SHA-256
fingerprint binds those fields to the plan and policy versions. Strict readback
rebuilds the plan from its retained demands and rejects altered, missing or
extra data. Invalid policy, cap, ticker identity or contiguous index evidence
fails closed without a fingerprint.

The planner is inert. It cannot call a provider, reserve a credit, change
ranking or publication, lower a threshold or execute a broker action. The
existing allocation shadow now delegates its challenger projection to this
same planner, preventing a separate shadow-only implementation from drifting
away from future runtime semantics.

## Constraint-aware runtime execution

`scanner_provider_credit_allocation_execution_plan_v2` is the execution-only
extension. It takes the same frozen demand denominator and policy identity but
also retains the existing independent intraday-provider ceiling. A valid plan
therefore cannot allocate more than the total scanner cap or more intraday
requests than the already deployed intraday safety cap. Under the challenger,
an intraday-cap rejection does not waste remaining total capacity when a later
daily-history deficit can still be funded.

The scanner snapshots all daily and intraday cache demand before any cache
mutation, builds the plan once and preserves existing intraday cache data when
daily history is written. The plan is enforced only when the exact frozen
experiment runtime admission is `admitted`; default-off, manual and drifted
paths retain the pre-existing serial behavior. Every admitted attempt records
the normalized execution plan and an exact reconciliation against successful
provider-credit reservations. Missing or unexpected allocations remain visible
as divergence rather than being rewritten into a pass.

Both the execution plan and
`scanner_provider_credit_allocation_reconciliation_v1` are fingerprinted,
strictly reconstructed on readback and carried in active trace plus the
owner-bound observation-cycle receipt. Their authority remains inert: neither
can call a provider, reserve a credit, change ranking/publication, lower a
threshold or reach a broker.

This delivery does not activate the 2026-10-01 switchback. Exact-revision
activation preflight, environment readback and the bounded OPEN observations
remain separate acceptance. Recommendation quality also remains unproven until
comparable canonical outcomes pass the complete quality charter.
