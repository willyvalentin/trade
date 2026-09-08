# CAT-00.12 — GitHub evidence-read operator decision

## Decision and product outcome

CAT-00.12 is the narrowly pre-authorized operator decision for the missing
CAT-00 GitHub evidence readback. It permits one disposable, dedicated,
fine-grained GitHub identity to collect the five redacted metadata observations
already shaped by CAT-00.10 and validated locally by CAT-00.11. Its sole
outcome is independently checkable CI and protected-branch evidence for a
*later* decision about one public SEC EDGAR read. It does not authorize that
SEC request, collection, persistence of source material, advisory use, runtime
binding, deployment, broker activity or production access.

The decision is `pre_authorized_pending_identity_verification`: no token has
been created or used, and no GitHub request has been made by this record.

## Exact allowed operation

After the CAT-00.10 plan and CAT-00.11 receipt validator pass locally from the
then-current protected `main`, the policy-bound automation operator may:

1. create one GitHub fine-grained personal access token named for CAT-00.12,
   restricted to the single repository `willyvalentin/trade`;
2. grant **only** `Actions: read`, `Administration: read` and the mandatory
   `Metadata: read` repository permissions, with no organization scope;
3. inject the token into one in-memory process only, never an environment file,
   shell history, repository file, log, test fixture or CI secret;
4. make exactly these five authenticated `GET` requests, once each and with no
   redirects, retries, pagination or substituted endpoint:

   ```text
   /repos/willyvalentin/trade/actions/runs/34123577717
   /repos/willyvalentin/trade/actions/runs/34127254656
   /repos/willyvalentin/trade/actions/runs/34130170282
   /repos/willyvalentin/trade/branches/main/protection
   /repos/willyvalentin/trade/rulesets
   ```

5. select only CAT-00.11's redacted metadata fields from successful responses,
   discard every raw response body before reporting, validate the resulting
   receipt locally, and revoke the token immediately whether the operation
   succeeds or fails.

The token expires at the earlier of its immediate revocation or 24 hours after
creation. A missing, expired, widened, ambiguous or non-fine-grained identity
cancels the operation before its first request. A non-200 response, response
shape mismatch, local validation failure, redirect, transport failure or any
attempted sixth request stops the operation with `not_verified` and no retry.

## Independent verification and containment

The operator must report only the five request paths, HTTP outcome, fixed
redacted metadata, CAT-00.11 local-validation disposition, and confirmed token
revocation. It must not retain or publish a raw API response, token, account
identity, header, ruleset body, workflow log or other unbounded GitHub data.

Independent verification consists of the existing CAT-00.10 and CAT-00.11
focused contract tests before the network boundary, the local CAT-00.11 result
after the five reads, and a separate confirmation that the disposable token was
revoked. The result remains evidence for the CAT-00 gate only; it does not
convert the development CI profile into release authority.

## Authority boundary

This decision permits no GitHub mutation: no workflow dispatch, rerun, branch
protection/ruleset change, pull-request change, merge, release, secret action
or repository-content write. It touches neither Netlify nor Supabase and has
no provider, model, deployment, broker, production or Ture application-runtime
authority.

The former broad local GitHub credential is explicitly excluded. CAT-00.12
uses the dedicated identity only for the five paths above and revokes it after
the one-shot evidence operation.

## Action brief

```text
action_or_decision_id: CAT-00.12
bounded_objective: Obtain one redacted, independently checkable GitHub CI and protection receipt using a disposable least-privileged identity
milestone_or_product_outcome: Preserve a bounded WhyMove primary-evidence investigation without opening an external collection or runtime path
threat_or_delivery_risk_reduced: A broad development credential, raw GitHub response or reusable token cannot silently widen the CAT-00 external gate
blocked_by: GitHub account verification and creation of the exact dedicated fine-grained identity
unblocks: Evidence-only completion or fail-closed closure of the CAT-00 GitHub readback gate; never the SEC request itself
authority_boundary: One in-memory, five-GET GitHub metadata operation with immediate token revocation; no writes or product/runtime authority
required_evidence: CAT-00.10/00.11 local validation, five minimized observations, local receipt result and token-revocation confirmation
focused_verification: CAT-00.10 and CAT-00.11 contract suites before the operation; CAT-00.11 validation after it
residual_risks: The receipt can show only current GitHub CI/protection facts and does not prove SEC content, release suitability or runtime safety
autonomous_governance_controller: Codex autonomous governance controller
delivery_automation: Codex delivery automation
independent_machine_verification: Existing CAT-00.10/00.11 validators plus one-shot token-revocation confirmation
decision_policy_version: cat-00.12-github-evidence-read-operator-v1
stop_go_or_closeout_trigger: Stop and revoke after the fifth GET or first mismatch; no retry and no SEC request follow automatically
rollback_or_containment: Revoke the disposable token immediately; retain only minimized receipt metadata when independently validated
```

## Next gate

If the one-shot operation is independently validated, update the canonical
ledger with its redacted receipt and reassess the remaining CAT-00 CI
re-hardening and SEC-specific operator gates. If it fails, record only the
bounded failure classification after token revocation and return to another
roadmap item; it must not be retried under this decision.
