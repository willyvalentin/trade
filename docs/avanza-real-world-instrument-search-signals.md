# Avanza real-world instrument search signals

## Current status

The Avanza real-world instrument search signal pack models sanitized search and
instrument-navigation cues for the Sharp Semi Auto Execution Agent.

The signal pack is based on sanitized user-provided search screenshots. It is
fixture/model-only and is not wired into Trade UI or API routes.

## Modeled search flow

The search button exists top-right on Avanza pages. Search opens as a
right-side panel.

The future agent must type a ticker or instrument name in the search input,
wait for results, select the matching instrument, and land on the instrument
detail page.

The instrument page can be verified with the `Om depåbeviset` section and safe
fields such as `Marknadsplats`, `Kortnamn`, and `ISIN`.

KÖP/SÄLJ buttons are entry points to the order ticket. They are modeled only
and are not clicked in this phase.

## Safe screenshot vocabulary

- Sök
- Aktier
- Nokia ADR
- Nokia
- Köp
- Sälj
- Om depåbeviset
- Marknadsplats
- Kortnamn
- ISIN
- NYSE
- Depåbevis

## Safety guarantees

- Based on sanitized user-provided search screenshots.
- Fixture/model only.
- Search button recognized.
- Search panel recognized.
- Search input recognized.
- Search results recognized.
- Matching instrument recognized.
- Instrument detail page recognized.
- Instrument verification section recognized.
- BUY/SELL entry buttons recognized.
- No real search execution.
- No real Avanza navigation.
- No click.
- No order submission.
- No cookies/session.
- No BankID automation.
- No Trade UI wiring.
- No API route wiring.
- Final human confirmation required.
- Not production-ready.

## Relationship to order preparation

Instrument discovery/search now exists as a model before order ticket preparation.

The execution package flow is now: recommendation/position -> search instrument -> verify instrument -> locate KÖP/SÄLJ -> order ticket field/action contract -> review -> stop before final KÖP/SÄLJ.

This phase does not activate order behavior.
