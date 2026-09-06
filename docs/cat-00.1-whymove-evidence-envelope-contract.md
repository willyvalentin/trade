# CAT-00.1 WhyMove Evidence Envelope Contract

## Purpose

CAT-00.1 makes the current WhyMove governance testable with supplied local
fixtures. It validates only an explicit evidence envelope and returns a frozen,
default-deny description. It never fetches a source or changes Ture state.

## Envelope boundary

An envelope carries a fixed decision snapshot time and one or more evidence
records. Each record has an opaque evidence ID, a declared source role and
source ID, capture/effective times, an explicit snapshot-time availability bit,
a bounded direction and, for discovery leads, the IDs of supporting primary
evidence.

Permitted discovery roles are `massive_news` and `finnhub_company_news`.
Permitted primary-evidence roles are SEC EDGAR, issuer investor-relations or
press releases, FDA, Federal Reserve, BLS and BEA material. These literals are
classification labels only: they do not call, configure, activate or endorse a
provider.

## Default-deny admission

- Discovery-only material returns `not_admitted_missing_primary_evidence`.
- A discovery lead must name at least one primary-evidence record in the same
  envelope, otherwise it returns `not_admitted_unpaired_discovery_lead`.
- Evidence captured or effective after the fixed decision time, or explicitly
  unavailable at that time, returns `not_admitted_not_point_in_time_safe`.
- Conflicting positive and negative primary evidence returns
  `not_admitted_conflicting_primary_evidence`.
- Even a valid, paired, point-in-time-safe envelope returns
  `evidence_validated_not_admitted`: no caller can derive ranking,
  recommendation, promotion, risk, execution or canonical catalyst truth from
  this module.

## Input hardening

The validator accepts only plain own-data objects and dense own-data arrays.
Accessor-backed, sparse, unexpected-property and non-plain inputs are rejected
before semantic use. Result objects and arrays are fresh and frozen.

## Explicit exclusions

There is no network or provider call, credential/account/subscription/spend
activation, database or persistence operation, route, worker, scheduler,
model/agent invocation, scanner/ranking/recommendation/risk mutation, broker,
deployment or production behavior. This contract is not a runtime adapter and
does not reopen any Milestone B gate.
