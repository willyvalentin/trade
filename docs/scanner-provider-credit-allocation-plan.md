# Provider-credit allocation execution plan

`scanner_provider_credit_allocation_plan_v1` is the provider-free semantic
source for the current serial allocator and the breadth-first challenger. It
turns an ordered candidate denominator, exact daily/intraday refresh deficits,
a policy version and one positive credit cap into a deterministic allocation
plan.

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

This delivery does not activate the 2026-10-01 switchback. Runtime selection,
provider execution, durable arm/plan/allocation receipts and exact-revision
activation/readback remain separate acceptance steps. Recommendation quality
also remains unproven until comparable canonical outcomes pass the complete
quality charter.
