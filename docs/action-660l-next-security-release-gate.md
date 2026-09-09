# Action 660L — Next.js security release gate

## Decision

Action 660L is a source-only security release candidate. Its original
candidate upgraded `next` and `eslint-config-next` from `16.2.6` to `16.3.1`,
refreshed the exact npm lock graph to zero audit findings, corrected six stale
proxy-contract expectations and added one full-Ready/main audit-and-build gate
to the existing provider-free foundation shard. The current follow-on patch
advances `next` and `eslint-config-next` from `16.3.1` to `16.3.4`, refreshes
the exact npm lock graph again, retains that same fail-closed gate, and gives
Netlify's build process an explicit 4 GB V8 heap for its build-time TypeScript
check.

This action does not authorize merge, production deployment, provider-account
configuration, database mutation, broker execution or runtime activation.
Production remains at the last verified deploy until a later explicit operator
approval names the exact delivered main commit and authorizes deployment.

## Frozen authority boundary

- Protected pre-delivery `main` is
  `6ef40e52eb7139e1e8c238f8a1d44385c0d1cf8a` with tree
  `2f4d282dd3fc867d96b5dac2dcdcc59c50d6f8a7`.
- Exact-main CI run `32372291563` completed successfully for that commit.
- Last verified production remains commit
  `f463644ddeb7f49fa8b80924d9103ea8970ccae4`, Netlify deploy
  `6a7b9e45ceb7e100087c55fa`.
- Automatic Netlify deploy previews are non-production evidence only.
- `production_deployment_authorized:false`.

## Security observation and remediation

The pre-candidate graph used Next.js `16.2.6`, `sharp` `0.34.5`, `postcss`
`8.5.14` and `nanoid` `3.3.12`. A full production-dependency audit reported
four high-severity findings. The application uses `proxy.ts` for its
authentication boundary, so the published Next.js middleware/proxy bypass
advisory `GHSA-6gpp-xcg3-4w24` is release-blocking even though no i18n routing,
Server Actions or rewrites were found in the repository.

The original candidate graph pinned Next.js and `eslint-config-next` to
`16.3.1` and resolved `sharp` `0.35.3`, `postcss` `8.5.23` and `nanoid`
`3.3.18`. The current follow-on graph pins Next.js and `eslint-config-next` to
`16.3.4`, resolves `sharp` `0.35.4` and `js-yaml` `4.3.2`, and retains the
same `postcss` and `nanoid` versions. The installed full audit reports zero
vulnerabilities. The production build completes with all 33 static pages
generated; TypeScript passes and lint reports zero errors with the eight
pre-existing warnings.

## Netlify build-memory boundary

The first preview for the `16.3.4` follow-on compiled successfully but its
build-time TypeScript check exhausted Netlify's default approximately 2 GB V8
heap. `netlify.toml` therefore runs the existing `npm run build` command with
an inline `NODE_OPTIONS=--max-old-space-size=4096` V8 limit. This is committed
build configuration rather than a dashboard secret or deploy-environment
value, preserves the underlying Next.js command, and has no provider-account,
database, broker or production-data effect. A later preview must independently
prove the resulting build; this source change alone makes no deployment claim.

## Proxy-contract reconciliation

The same focused proxy/auth suite produced 21 passes and six failures on both
Next.js `16.2.6` and the uncorrected `16.3.1` candidate. The failures were
therefore stale expectations rather than an upgrade regression. The corrected
contract preserves the current fail-closed runtime semantics:

- only the exact canonical public API paths and the documented automation or
  historical-backfill prefixes bypass application-session authentication;
- ordinary API routes, non-canonical trailing-slash variants and undeclared
  diagnostic variants return the authenticated boundary response;
- `proxy.ts` may import only Next server primitives plus the closed
  application-session and mutation-origin guards;
- rejected requests expose neither authentication nor automation secrets and
  execute no trading or persistence side effect.

The corrected focused matrix passes 17/17 without changing `proxy.ts`.

## Cost-bounded CI integration

Action 660L keeps the Action 660K workflow scheduling model unchanged.
Draft pushes still run only the quick non-protected path, while the protected
`provider-free-verification` check remains fail-closed. When a PR becomes
Ready, after every later Ready push and on every `main` push, the full
foundation shard now runs exactly one `npm audit --audit-level=high --no-fund`
and exactly one `npm run build` before the existing provider-free matrices.
The three focused proxy/auth tests and this Action 660L oracle are registered
exactly once in the executable Action 660J plan.

## Delivery condition

This candidate may become release-eligible only after all of the following:

1. exact package, lock, test, CI-plan and evidence bytes are frozen;
2. quick Draft CI behaves according to Action 660K and cannot authorize merge;
3. exact-head full six-shard CI succeeds after Ready;
4. independent read-only review reports no findings on the exact head;
5. the operator explicitly approves that exact PR and head for ordinary merge;
6. the reviewed tree reaches protected `main` without unexpected delta;
7. exact-main full six-shard CI succeeds.

Production deployment remains a separate later decision. A successful merge,
audit, build, preview or exact-main CI run does not itself authorize production.
