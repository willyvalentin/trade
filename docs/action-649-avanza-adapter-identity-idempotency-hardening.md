# Action 649: Avanza Adapter Identity and Idempotency Hardening

## Contract

The pure `AvanzaAdapterExecutionIdentity` is derived from the Action 648
runtime identity context and a canonical order payload. It carries execution,
lifecycle, handoff, payload, broker-request, idempotency, and correlation IDs.
No adapter core generates time, UUIDs, random suffixes, or retry identities.

## Canonical Payload

The payload has an explicit schema version and normalizes ticker, side,
quantity, order type, limit and stop prices, position identity, execution mode,
authority scope, and UTC timestamp. Stable object construction and SHA-256
fingerprinting make equivalent values independent of input key insertion order.
Secrets and transient UI fields are excluded.

## Retry and Confirmation Rules

The same execution context plus payload produces the same idempotency key.
Changing ticker, side, quantity, price, order type, position, mode, or authority
scope produces a new payload fingerprint and idempotency key. Progress and
terminal confirmations must match execution, payload, request, correlation,
side, ticker, and authoritative quantity. Exact duplicate terminals are
idempotent; conflicts are retained as `needs_review` and cannot overwrite an
accepted result.

## Boundaries

Semi-automatic requests retain one identity from prepare through human
confirmation and never auto-submit. Automatic requests may be marked
submission-eligible only when matching automatic authority is supplied. This
module has no transport, browser, provider, database, or production write path.

Legacy local-dev/mock bridge builders retain their existing isolated defaults
and are not a production transport. Future production Avanza transport work
must consume this hardened request contract rather than those legacy builders.

## Inventory

The hardened production adapter boundary is
`lib/avanza-adapter-identity.ts`, used by the Action 647 replay. The existing
`avanza-agent-adapter`, `avanza-agent-bridge`, and `avanza-agent-runner` are
legacy preview/no-op surfaces with timestamp and generated-ID defaults; they
remain intentionally isolated and are not permitted to become a real transport
without first adopting this contract. Localhost bridge contracts and clients,
mock order/fill helpers, and development panels are local-dev/mock-only. The
handoff preview modal and record viewers are UI-only.
