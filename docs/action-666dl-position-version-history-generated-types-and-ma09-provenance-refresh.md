# Action 666DL — Generated Types and MA09 Provenance Refresh

## Bounded objective

Action 666DL refreshes only the repository's generated TypeScript output after
the separately authorized production schema application. It is a
source-delivery candidate: it does not apply SQL, backfill data, create runtime
behavior, change access controls, configure a provider, publish a deployment
or authorize execution activity.

## Privacy-preserving refresh

One operator-authorized, project-scoped read-only type-generation response was
accepted only after its envelope was exactly `{"types": string}` and the
in-memory structural classifier accepted the response. The raw response and
all extracted response content are deliberately not archived as evidence.

The accepted bytes were compared in memory with the repository output and are
represented outside that output only by their SHA-256 and Git blob hashes.
This keeps the provenance receipt reviewable without retaining provider
content.

## Historical preservation

The prior MA09 V2 package remains immutable historical evidence. Its oracle
verifies the archived V2 provider types against their own frozen SHA-256 and
Git blob hash rather than treating a later current type file as historical
bytes. Action 666DL supplies the current-output hash binding and does not
alter any V2 receipt.

## Delivery boundary

MA09 becomes current only after independent review, ordinary protected merge
and successful exact-main CI. The next Milestone B work remains separately
gated; this action grants no database, runtime or production-release
authority.
