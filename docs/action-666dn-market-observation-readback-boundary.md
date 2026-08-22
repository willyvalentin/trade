# Action 666DN — Market-observation readback boundary

Status: source-only candidate. This Action defines a pure, canonical freshness
assessment over an opaque Action 666DM market-observation provenance value and
two declared canonical timestamps. It implements no provider adapter, route,
worker, queue, database read or write, provider configuration, deployment,
broker operation or runtime wiring.

## Boundary

The only accepted input is one canonical JSON string containing a canonical
Action 666DM provenance string, a monitor-observed instant and a
decision-requested instant. The nested provenance is revalidated rather than
accepted by reference. No raw provider payload, endpoint, request, response,
account, connection or credential material is accepted or retained.

The assessment mirrors the current Action 655G chronology: market data cannot
be after the monitor observation, the monitor observation cannot be after the
decision request, and either observation is stale at an age of five seconds or
more. Its result is a deterministic opaque identity and either a refusal code
or `freshness_satisfied`.

## Authority limit

Even a `freshness_satisfied` result grants no runtime authority. It cannot
create a monitor observation, provide a current price, enable Action 655G,
call a provider or broker, or perform any database or deployment operation.
The five-second profile is a hash-bound source compatibility statement for the
current 655G evaluator, not a future policy registry or provider SLA.

## Next gate

A future adapter requires separate authorization and review for the provider
readback boundary, source-specific freshness behavior, sanitized current-price
construction, runtime integration and operational ownership. That future work
must retain the no raw provider payload and no credential material boundary.
