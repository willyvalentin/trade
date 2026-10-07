# Ture: testkontrakt för OPEN-observationer

Detta är ett återanvändbart arbetskontrakt för marknadsberoende tester: scans,
forward shadow och senare paperflöden. Det är **inte** en ny roadmap, en
testkvot eller ett separat tillstånd att aktivera produktion, använda en ny
datakälla, migrera data eller lägga brokerorder. Aktiva avsnitt i
`AGENTS.md`, [master roadmap](./ture-master-roadmap.md),
[current-state ledger](./ture-current-state-ledger.md) och
[operating governance](./roadmap-operating-governance.md) styr uppgiftsval,
acceptance och auktorisation. Vid konflikt gäller de före detta kontrakt.

## 1. Före marknadssessionen — bygg färdigt i CLOSED

För varje vald OPEN-testserie, skriv ett kort testkort i den befintliga
ledgern **innan** resultatet är känt. Flera ordinarie observationer kan dela
samma frysta testkort; varje körning behöver då egen identitet och eget kvitto.
Ange:

- Roadmap-leverans, fråga/hypotes och vilket mätbart utfall som utgör pass,
  fail eller inconclusive. Kandidat eller affär får aldrig vara ett kvotkrav;
  ett spårbart `no_trade` kan vara ett korrekt utfall.
- Exakt kodrevision, miljö/deploy, data- och strategiversion, policy-/ranking-
  version, konfiguration och avsedd `America/New_York`-session. Verifiera
  börskalender, helgdagar och förkortade sessioner; använd inte fast svensk
  klocktid som sessionsregel.
- Källa, rättigheter, kända täckningsluckor, färskhetskrav och konkreta
  provider-/lagrings-/beräkningsgränser för just försöket. Tillåten retry,
  tidsfönster, samtidig körning och stopvillkor ska vara bestämda i förväg.
- Förväntad evidenskedja och readback: schemalagd leverans/trigger → faktisk
  datakälla och tidsstämplar → admission/kvalitetsgrind → beslut/avvisning →
  durable kvitto → autentiserad eller auktoritativ återläsning. Paperflöden
  lägger till intent, simulerad order/fill, risk, position och reconciliation.
- Vem eller vad som återställer tillfälliga flaggor, hur fel upptäcks och
  vilken separat åtgärd som krävs om försöket inte säkert kan återställas.

Reproducera kända fel med deterministiska tester. Täck relevanta gränsfall:
stale/saknad/partiell data, providerfel och timeout, rate-/credit-limit,
duplikat/retry, fel session eller deploy, ägarisolering, ofullständigt kvitto,
felaktig readback och säker återställning. Kör relevanta tester, lint,
typkontroll och build; prova lokalt flöde när beteendet påverkas. Märk
fixture-/replaybevis som CLOSED, aldrig som verklig OPEN-evidens.

### Testkedja och avgränsad serie

Före den berörda OPEN-observationen ska byggd runtime ha testats genom hela
kedjan till en isolerad databas och faktisk readback. Ersätt providern vid
yttergränsen; mocka inte bort interna steg som testet ska verifiera. Testa även
diagnostikens fältnamn/versioner, identitetskopplingar och behörigheter. Kända
produktionsfel ska ha reproducerbara CLOSED-regressioner. Dokumentera kvarvarande
miljöskillnader; fixture/replay ersätter inte marknadsevidens.

Om flera observationer behövs, frys dessutom maximalt antal försök, total
creditbudget, tak per körning, giltig session/sluttid och vad nästa observation
ska lära oss. Räkna även fel, retries och osäkra reservationer i budgetkontrollen.
Körningarna ska ha separata identiteter och inte överlappa. Budgetosäkerhet,
felbunden lineage eller överlapp stoppar serien; andra fel följer fördeklarerade
stop-/retryvillkor. Ändrad revision eller hypotes kräver ett nytt testkort och
ny readiness, inte sammanblandad evidens.

En sådan serie får aktiveras först när runtime kan upprätthålla gränserna och
automatiskt förfalla till säkert läge utan att en assistent måste vakna i tid.
Verifiera stopp, expiry och återställning i CLOSED före användning. Till dess
gäller befintliga one-shot-gränser och godkännanden oförändrat; dokumentet
aktiverar ingenting. Cleanup och verifierad readback krävs även efter expiry.

### Produktionslika förutsättningar och kapacitet

Återanvänd befintligt integrationstest och länka dess kvitto i testkortet.
Verifiera de gränser som det aktuella försöket faktiskt passerar:

| Gräns | CLOSED-bevis före berörd OPEN-observation |
| --- | --- |
| Behörigheter/schema | Samma relevanta roller, direkta tabellförbud, RPC- och defaultprivilegier som produktionen. Ett bredare fixture-grant får inte dölja en nekad läsning. |
| Byggd konsument | Faktisk schemalagd runtime, SDK, datalagring och resultatläsare, inklusive omstart, använder samma kontrakt och relevanta transport-/tidsgränser. |
| Indata och identitet | Kall/varm cache och förberedda källor där de används; originalplan, klockor och hela populationen följer med till utfall. Externa providers ersätts vid yttergränsen. |
| Fel och avslut | Relevant saknad/nekad källa, timeout eller avbruten förberedelse bevarar saknade medlemmar och kostnad. Ingen dold återköp/retry; stopp och cleanup fungerar. |

Skriv kvarvarande relevanta miljöskillnader och deras konsekvens. Ett okänt
gränssnitt som behövs för acceptansen ger `no_go` tills det är verifierat;
det kräver inte en generell kontroll av alla orelaterade systemdelar.
Detta gäller tekniska drift-/kontraktsförutsättningar. Färsk marknadsfitness
och rekommendationskvalitet är fortfarande frågor för själva observationen;
de ska inte krävas bevisade innan experimentet får undersöka dem.

Visa också en kort kapacitetsberäkning för **hela** den fördeklarerade kedjan:
historik/förberedelse + benchmark/kontext + aktuella kandidatindata + mogna
utfall + fördeklarerad felmarginal. Ange färskhetsfönster, minut-/dagstak,
lagringsrättigheter, hosting/publicering och när utfallen kan bli tillgängliga.
Skilj reservationer, faktisk förbrukning och redan betald återanvändning.
Okänd kapacitet är inte tillgänglig kapacitet. Återanvänd befintliga uppgifter;
en ny betald kontroll eller datakälla följer sitt befintliga mandat.

Om upplägget inte ryms: välj en avgränsad genomförbarhets-/scopeåtgärd i ledgern
före fler hjälpfunktioner eller försök. En framtida ändrad population/kadens får
ett nytt prospektivt kontrakt; tidigare nämnare och kvalitetsgränser bevaras.

## 2. Go/no-go inför OPEN

Kontrollera det publicerade systemet, inte bara källkoden: rätt revision och
deploy, effektiv konfiguration, nödvändigt schema, schemaläggning/worker,
marknadssession, dataåtkomst, återstående kapacitet, claim/idempotency och
observerbar readback. Säkerställ att en äldre körning inte överlappar.
Frys kod, datakontrakt, strategi, experimentcharter och relevanta flaggor för
observationen. Saknas en nödvändig förutsättning: märk `no_go`, gör ingen
osäker körning och fortsätt med nästa oberoende CLOSED-leverans.

## 3. Under OPEN

Kör nästa *berättigade* förberedda observation när session och auktorisation
tillåter. Använd normal, avsedd schemaläggning; gå inte runt kontroller via
manuella routes. Flera observationer samma dag är tillåtna endast när de har
ett definierat syfte, ryms inom gällande tekniska gränser och varje försök
har separat identitet och kvitto. Upprepa inte blint ett saknat eller oklart
utfall och ändra inte kvalitetströsklar för att få fram en kandidat.

Vid kritiskt fel: stoppa eller isolera den berörda observationen, bevara dess
ofullständiga evidens och återställ enligt testkortet. En fix ger en ny
revision/experimentkandidat och kräver relevant omtestning; blanda inte dess
resultat med den frysta föregångarens.

## 4. Efteråt — klassificera ärligt

Håll tre frågor separata: fungerade körkedjan, var datan användbar för avsett
beslut, och finns jämförbar evidens för rekommendationskvalitet? Ett operationellt
pass får inte automatiskt uppgradera de andra två. Ett test ska kunna ge ett
hederligt negativt resultat; målet är användbar evidens, inte enbart gröna tester.

Återläs faktisk session, revision, data/cohort, tidsstämplar, beslut, avslag,
`no_trade`, kostnad/kapacitet, fel, retries och slutstatus. Klassificera
utfallet som `pass`, `fail`, `inconclusive` eller `missing_result` mot de
fördeklarerade kriterierna. En startad route, grön CI, en hög score eller en
enskild kandidat är inte bevis för fungerande end-to-end-beteende eller
förbättrad strategi. Ett komplett, attribuerbart `no_trade` kan däremot vara
ett lyckat funktionstest utan att visa alpha.

Jämför policy-/rankingändringar med den frysta baseline och dess datamängd;
håll held-out/walk-forward och forward shadow åtskilda. Rapportera även
misslyckade och inconclusive resultat, kostnader, osäkerhet och återstående
evidensgap. Uppdatera bara den befintliga ledgern med verifierade fakta och
välj nästa verkliga roadmap-leverans. Skriv en kort avslutning i den aktuella
leveranstavlan: observation, begränsning, beslut och exakt nästa åtgärd.
`evidence_incomplete` anger saknad dimension, ansvarig, avgränsad återhämtning
med budget/tidsfönster och granskningsdatum, eller ett uttryckligt stopp.
Ett missat marknadsfönster får inte automatiskt starta en kedja av nya kontroller.
För in användbara observationer, ursprungliga nämnare, total kostnad och
integrationsfel i governance-dokumentets fem veckomått. Ett komplett `no_trade`
kan vara användbart för driftfrågan; ett datafel räknas inte som kvalitetslärande.
Efter att dagens OPEN-arbete är klart fortsätter den valda CLOSED-utvecklingen
även om börsen fortfarande är öppen.

Skilj alltid mellan lokalt implementerat, lokalt testat, mergat/deployat på
exakt revision, miljöbeteendeverifierat och godkänt enligt roadmapens
acceptance evidence. Nya inköp, produktionsmigreringar, produktionsdeploys,
ändrad provider-/riskpolicy och brokerorder följer sina egna mandat; detta
kontrakt utvidgar dem inte.
