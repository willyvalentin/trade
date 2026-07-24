# Manual Local-Dev Smoke Test Runbook for Login and Order Prep

Status: planning-only operator runbook for a future gated local-dev smoke test. This document does not activate runtime, does not run smoke scripts, and does not open any execution gate.

## 1. Syfte Och Scope

Syftet med ett framtida local-dev smoke test är att låta en mänsklig operator, efter separat approval, verifiera att login- och order-prep-kedjan kan granskas fram till en säker stoppunkt utan att skicka en order.

Ett framtida test får senare bevisa:

- Att login-scaffolden kan identifiera om användaren redan är i rätt manuellt initierade local-dev-läge.
- Att order-prep-scaffolden kan förbereda BUY/SELL-data fram till review/final confirmation.
- Att selected contract, agent plan och order fields matchar förväntad handoff-data.
- Att stop conditions fungerar innan final KÖP/SÄLJ eller annan submit-liknande handling.
- Att evidens kan dokumenteras redigerat och utan secrets.

Ett framtida test får inte bevisa eller göra:

- Ingen runtime activation.
- Ingen order submission.
- Ingen final KÖP/SÄLJ-click av agent.
- Ingen BankID automation.
- Ingen credential, cookie eller session-hantering.
- Ingen Supabase execution write.
- Ingen production readiness.

Detta är endast en mänsklig operator-runbook. Den här uppgiften aktiverar inte runtime, öppnar inte någon gate, importerar inte scripts och kör ingenting.

## 2. Förutsättningar

Följande checkpoints, runbooks och kontrakt måste vara klara innan någon framtida smoke-test-approval ens kan granskas:

- Headless execution data contract.
- Headless execution contract selector.
- Headless Avanza agent plan builder.
- Headless execution session state machine.
- Headless execution orchestration pipeline.
- Headless architecture checkpoint.
- Local-dev bridge contract.
- Local-dev bridge activation checklist.
- Disabled local-dev bridge runner skeleton.
- Model-only local-dev bridge dry-runner.
- Local-dev bridge readiness checkpoint.
- Manual local-dev invocation approval runbook.
- Disabled local-dev invocation adapter contract.
- Disabled invocation adapter payload validator.
- Invocation adapter design checkpoint.
- Sharp Semi Auto Execution phase checkpoint.

Alla runtime gates måste fortfarande vara locked:

- Invocation boundary.
- Local-dev bridge gate.
- Smoke runner invocation.
- Terminal script invocation.
- Browser automation.
- Credential access.
- Cookies/session.
- BankID automation.
- Order submission.
- Final KÖP/SÄLJ by agent.
- Supabase writes.
- Trade UI execution.
- API route activation.
- Production readiness.

Feature flags och env-flags måste vara disabled by default. En separat approval/gate krävs innan något faktiskt local-dev smoke test får köras. Approvalen måste uttryckligen täcka mode, scope, operator, reviewer, allowed scaffold, expected stop condition och evidence policy.

## 3. Login Smoke Scaffold Review

Innan login-scaffolden körs i en separat framtida gatead miljö ska en mänsklig reviewer granska scaffolden utan att köra den.

Reviewer ska kontrollera:

- Att credentials inte läses från repo, localStorage, env eller loggar.
- Att BankID inte automatiseras.
- Att cookies och sessioner inte exporteras, sparas eller serialiseras.
- Att eventuell browser/session endast är mänskligt initierad i separat gatead local-dev testmiljö.
- Att scaffolden stoppar om BankID, MFA, credential entry eller session transfer upptäcks.
- Att ingen app-runtime eller Trade UI-väg importerar smoke scripts.
- Att inga credentials, cookies, session tokens eller browser storage values hamnar i reports.

Login smoke får endast bli ett framtida manuellt local-dev-test efter separat approval. Om någon del av granskningen är oklar ska testet inte köras.

## 4. Order-Prep Smoke Scaffold Review

Order-prep-scaffolden får maximalt verifiera navigation och förberedelse fram till review/final confirmation. Den får inte passera den punkten.

Reviewer ska kontrollera:

- Den får inte klicka KÖP/SÄLJ.
- Den får inte submit:a order.
- Den får inte passera final confirmation.
- Den måste stoppa vid Avanza review/final confirmation state.
- Den måste ha uttryckliga stop conditions för BUY och SELL.
- Den måste verifiera att selected contract, agent plan och order fields matchar förväntad handoff-data.
- Den får inte mutera live trade state.
- Den får inte skriva Supabase execution records.
- Den får inte aktivera Trade UI execution eller API route activation.

Ett framtida order-prep smoke test ska betraktas som lyckat endast om det stoppar före submit och innan någon final KÖP/SÄLJ-handling kan utföras av agenten.

## 5. Env Flags Och Kommandon

Följande flaggtyper kan behövas senare, men de ska vara default false/locked:

- `LOCAL_DEV_ONLY=false`
- `SMOKE_TEST_ONLY=false`
- `BRIDGE_ENABLED=false`
- `INVOCATION_ENABLED=false`
- `BROWSER_ENABLED=false`
- `DRY_RUN=true`
- `NO_SUBMIT=true`
- `STOP_AT_REVIEW=true`

Inga faktiska secrets får dokumenteras. Inga personliga credential-namn, lösenord, tokens, sessioner, cookies eller service keys får förekomma i runbook eller result docs.

Framtida kommandon får bara dokumenteras som placeholders och får inte köras i denna uppgift. Exempel på framtida form:

```bash
# FUTURE PLACEHOLDER ONLY - DO NOT RUN IN THIS TASK
LOCAL_DEV_ONLY=true SMOKE_TEST_ONLY=true DRY_RUN=true NO_SUBMIT=true STOP_AT_REVIEW=true npm run avanza:login-smoke:local
```

```bash
# FUTURE PLACEHOLDER ONLY - DO NOT RUN IN THIS TASK
LOCAL_DEV_ONLY=true SMOKE_TEST_ONLY=true DRY_RUN=true NO_SUBMIT=true STOP_AT_REVIEW=true npm run avanza:order-prep-smoke:local
```

Ett framtida kommando måste vara safe-by-default, stoppa vid review, neka submit och kräva separat manuell approval innan det får köras.

## 6. Evidence Och Log Handling

Tillåten evidens:

- Redacted text logs.
- Screenshots endast om de inte innehåller persondata, kontodata, saldo, kontonummer, BankID, order-id eller credentials.
- Contract id, session id eller plan summary om de är safe och redigerade.
- Timestamp och test outcome.
- Gate state snapshot.
- Stop condition som nåddes.
- Human reviewer sign-off.

Följande får aldrig sparas:

- Credentials.
- BankID-data.
- Cookies.
- Session tokens.
- Avanza kontonummer eller kundnummer.
- Fullständiga personuppgifter.
- Order confirmation ids om känsliga.
- Screenshots med saldo, innehav, bankinformation eller persondata.
- Raw browser storage.
- Network dumps.
- Supabase service keys eller env secrets.

## 7. Redaction Policy

Redaction ska vara allowlist-baserad, inte dump-baserad.

Checklista:

- Ticker/order fields får normalt vara synliga om de är testdata.
- Quantity/price får bara sparas om det inte är live-sensitive eller tydligt kan markeras som testdata.
- Broker/account/person/session/auth-data ska redacteras.
- Screenshots ska hellre undvikas än kräva tung redaction.
- Logs ska byggas från explicit safe fields, inte från raw browser dumps.
- Any value som kan identifiera kund, konto, session, order, BankID eller credential ska redacteras.

## 8. Stop Conditions

Testet ska stoppas om något av följande inträffar:

- BankID prompt appears.
- Credential entry required.
- MFA required.
- Cookie/session export requested.
- Browser storage access detected.
- Avanza final KÖP/SÄLJ confirmation visible.
- Any submit/final action would be next.
- Any unexpected navigation to live order execution.
- Any attempt to write Supabase execution data.
- Any API route/bridge gate unexpectedly active.
- Any unredacted sensitive data appears in logs.
- Any uncertainty about whether the next step submits an order.

Om en stop condition nås ska operatorn avbryta testet, dokumentera stop condition och inte försöka fortsätta.

## 9. Verification Checklist

En framtida reviewer ska verifiera:

- Agenten klickade aldrig final KÖP/SÄLJ.
- Ordern submitades aldrig.
- Testet stoppade vid review/final confirmation.
- BankID hanterades manuellt eller testet stoppades.
- Inga credentials loggades.
- Inga cookies loggades.
- Inga sessioner loggades.
- Ingen Supabase write skedde.
- Ingen Trade UI execution aktiverades.
- Inga smoke scripts importerades i app runtime.
- Ingen API route aktiverades.
- Alla gates förblev locked efter test.

## 10. Resultatdokumentation

Ett framtida resultat ska dokumenteras med:

- Test name.
- Date/time.
- Operator.
- Reviewer.
- Mode: `login-smoke` eller `order-prep-smoke`.
- BUY/SELL scenario om relevant.
- Input contract/plan reference.
- Expected stop condition.
- Actual stop condition.
- Evidence artifacts.
- Redaction confirmation.
- Gate status before/after.
- Pass/fail/blocked result.
- Follow-up actions.
- Explicit final statement: no order submitted, no final KÖP/SÄLJ clicked.

Resultatet ska inte innehålla raw browser state, network dumps, credentials, sessions, cookies, BankID-data, account data eller Supabase secrets.

## 11. Out Of Scope

- Ingen runtime activation.
- Ingen browser automation execution.
- Ingen Avanza login automation.
- Ingen BankID automation.
- Ingen credential handling.
- Ingen cookie/session handling.
- Ingen order submission.
- Ingen final click.
- Ingen Supabase execution write.
- Ingen Trade UI integration.
- Ingen API route activation.
- Ingen production readiness.

## 12. Acceptance Criteria

Uppgift 335 är klar när:

- En tydlig docs-runbook finns.
- Den kan användas av en mänsklig operator inför framtida gated local-dev smoke test.
- Den beskriver login review, order-prep review, env/commands, evidence, redaction, stop conditions, verification och result documentation.
- Den öppnar inga gates.
- Den kör ingenting.
- Den ändrar inte Trade UI.
- Den importerar inga smoke scripts.
- Den introducerar ingen runtime path.
- Den bevarar Semi Auto safety invariants.

## Final Safety Statement

This runbook is planning-only. Runtime remains locked. Local-dev bridge/invocation boundary remains locked. Smoke scripts remain uninvoked. Trade UI remains unchanged. Final KÖP/SÄLJ remains human-only.
