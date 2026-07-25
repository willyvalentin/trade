# Action 652I — Production Configuration Preparation and Safe Runtime Proof

Status: local preparation only. No production configuration, deployment,
migration, Git, provider, or broker mutation occurred.

## Decisions

- Canonical production origin: `https://trade.valentinlabs.com`
- Netlify default origin: `https://trade-vl.netlify.app`
- Deploy previews and branch deploys must not use production application
  authentication or authenticated mutations.
- Local development uses developer-local credentials and same-origin requests.
- The temporary client-IP proof is disabled by default and is returned only
  after a successful canonical-production login.

## Environment scope

Current read-only metadata shows that the application password, automation
secret, provider keys, and service-role credential reach preview or branch
contexts. Values were not read or recorded.

| Variable class | Production | Deploy preview | Branch deploy | Local development |
| --- | --- | --- | --- | --- |
| `TURE_APPLICATION_ORIGIN` | Required, canonical value, Functions scope | Absent | Absent | Optional; request-local origin |
| `TRADE_APP_PASSWORD` | Production-only, Functions scope | Absent | Absent | `.env.local` only |
| Supabase service role | Production-only, Functions scope | Absent | Absent | Explicit isolated local project only |
| `AUTOMATION_SECRET` | Production-only, Functions scope | Absent | Absent | `.env.local` only |
| Provider/API credentials | Production-only, Functions scope | Absent | Absent | Explicit developer-local values only |
| `TURE_LOGIN_RUNTIME_PROOF_ENABLED` | Temporary, production-only, Functions scope | Absent | Absent | Absent |

Preview testing that later requires mutations must use separately provisioned,
non-production credentials and an explicitly reviewed preview-origin contract.
Production values must never be copied into that contract.

## Origin configuration

The approved future change is:

```text
TURE_APPLICATION_ORIGIN=https://trade.valentinlabs.com
context=production
scope=functions
```

An environment change requires a fresh production deploy before runtime
verification. Readback must report only configured, production context present,
Functions scope present, and preview/branch contexts absent. It must not print
the value.

Rollback removes the variable from the production Functions scope and deploys
again. Login and authenticated mutations then fail closed until a valid
canonical value is restored.

The application now explicitly rejects login and authenticated mutations in
known Netlify deploy-preview and branch-deploy contexts. Production login also
requires the request URL to match the configured canonical origin.

## Default-domain redirect

`netlify.toml` owns the host redirect because it is deployment configuration and
must be reviewed with the application revision:

```toml
[[redirects]]
  from = "https://trade-vl.netlify.app/*"
  to = "https://trade.valentinlabs.com/:splat"
  status = 301
  force = true
```

The exact source host prevents preview aliases from matching. `:splat`
preserves the path, and Netlify carries an incoming query string when the
destination does not replace it. The canonical host does not match the source,
so the rule cannot redirect to itself.

Rollback removes this one rule and redeploys. It does not alter domain
ownership or DNS.

## Deployment assertion

`TURE_CONTINUOUS_INTELLIGENCE_DEPLOYMENT_COMMIT` is an environment-backed
assertion. `COMMIT_REF` or `NETLIFY_COMMIT_REF` is the platform identity.
Runtime resolution correctly reports an explicit configuration conflict when
the two differ.

For the currently published revision, an approved operator would set the
assertion to the exact published commit and trigger a fresh Git-based production
deploy. Readback must report only:

- assertion configured;
- assertion canonical;
- platform identity present;
- assertion matches platform;
- no identity value returned.

Before deploying merged Action 652, the assertion must instead be updated to
that new exact merge commit. Rolling back a deployment requires reconciling the
assertion to the rollback commit; Netlify environment values otherwise remain
attached to the site rather than the historical deploy.

## Temporary client-IP proof

No suitable existing diagnostic exists. The prepared proof therefore uses the
successful login response and is gated by all of:

- valid application password;
- shared limiter admission and successful finalization;
- production runtime;
- canonical production request origin;
- explicit `TURE_LOGIN_RUNTIME_PROOF_ENABLED=true`.

It returns only:

- contract version;
- trusted header present: boolean;
- parsed trusted identity valid: boolean;
- runtime type;
- explicit facts that no header or identity value was returned.

It ignores `X-Forwarded-For`, logs nothing, and is unavailable in preview and
branch contexts. The operator must not supply the trusted header manually.

After one successful proof:

1. clear the proof flag and redeploy;
2. confirm the response no longer includes proof metadata;
3. remove the temporary proof code and tests in the immediate follow-up;
4. deploy that removal before Action 650 containment.

Failure to observe both booleans as true blocks rollout. It does not authorize
an invalid-password probe or weakening the limiter.

## Operator runbook

| Gate | Operation | Classification | Validation | Stop/recovery |
| --- | --- | --- | --- | --- |
| 1 | Restrict all production credentials to production Functions scope | Environment mutation | Metadata-only scope readback | Stop if any preview/branch exposure remains; restore approved configuration snapshot |
| 1 | Configure `TURE_APPLICATION_ORIGIN` | Environment mutation | Configured, production-only, Functions-scoped | Stop if scope differs; remove and redeploy |
| 1 | Reconcile deployment assertion | Environment mutation | Redacted exact-match readiness | Stop on conflict; restore matching published commit |
| 1 | Review and merge the host redirect with Action 652 | Git mutation | Static redirect tests | Stop on another redirect or middleware conflict |
| 1 | Publish configuration/code | Deployment mutation | Production deploy ready and exact commit | Roll back only to a configuration-compatible revision |
| 2 | Merge PR #46 | Git mutation | Reviewed merge commit inventory | Stop on scope drift |
| 2 | Apply `20260724001500`, then `20260724001600` | Database mutation | Migration history, RPC permissions, zero sensitive rows | Stop on any unexpected pending migration; forward-fix only |
| 2 | Deploy Action 652 | Deployment mutation | Login, origin, protected pages/APIs, scheduled flows | Stop on login protection unavailable or unexpected authorization |
| 2 | Enable proof flag for one successful operator login | Environment and deployment mutation | Boolean-only proof is present and valid | Disable flag immediately; no retry with invalid credentials |
| 2 | Disable proof and deploy its removal | Environment, Git, and deployment mutation | Proof absent; login unchanged | Stop before containment if proof remains reachable |
| 3 | Merge PR #44 and apply `20260724002000` | Git and database mutation | All 19 direct-role denials and server workflows | Do not roll back to anonymous browser ownership |
| 4 | Run combined independent review and production readback | Read-only | No unresolved security finding | Keep Action 643 blocked |

Every mutation above requires separate explicit production authorization. None
is executed by Action 652I.

## Delivery blockers

- Production and preview credential scopes must be separated.
- `TURE_APPLICATION_ORIGIN` must be configured and deployed.
- The default-domain redirect must be reviewed and deployed.
- The assertion must match the exact deployment revision.
- The temporary trusted-IP proof must pass and then be removed.
- PR #46 and PR #44 require a fresh combined independent review afterward.
