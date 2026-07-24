# Ture Produktspecifikation

**Senast uppdaterad:** 2026-07-21
**Produktinriktning:** Continuous Market Intelligence
**Primär marknad:** USA-aktier, daytrading

## Produktdefinition

Ture är en kontinuerligt lärande marknadsintelligens, rekommendationsmotor och trading-agent för daytrading på USA-marknaden.

Ture ska inte primärt vara en scanner som kör ett fåtal avgränsade batchar. Ture ska fungera som ett kontinuerligt beslutsystem som övervakar marknaden, bygger ett levande minne av tickers, kandidater och setups, följer hur möjligheter utvecklas och identifierar de trades som har bäst riskjusterad sannolikhet att bli lönsamma.

Ture ska göra det tunga arbetet i bakgrunden. Användaren ska inte behöva leta efter kandidater eller analysera marknaden manuellt. Ture ska hitta kandidater, bedöma kvalitet, väga risk/reward, identifiera entry, stop och target, sätta confidence, förklara varför en trade är relevant och kontinuerligt ranka de bästa aktuella möjligheterna.

Recommendations ska kunna uppstå, uppgraderas, försvagas, invalidieras eller ersättas när evidensen förändras. Morning, Midday och Power Hour får användas som tidsmässiga labels, analysdimensioner och tekniska checkpoints, men de får inte vara produktgrindar som bestämmer när Ture får analysera, lära eller skapa en recommendation.

Ture ska inte kännas som ett brusigt analysverktyg. Det ska kännas som en tyst och intelligent co-pilot som arbetar under ytan. Systemet får samla mycket data och följa många kandidater, men användarens beslutsyta ska tydligt prioritera det viktigaste.

## Övergripande produktprincip

Ture ska vara enkelt på ytan och hyperintelligent under huven.

Användaren ska kunna lita på att Ture:

- övervakar marknaden kontinuerligt
- väljer rätt tickers att bevaka
- identifierar relevanta setups
- följer kandidater som levande objekt
- väljer bort, försvagar eller invalidierar svaga idéer
- rankar de bästa aktuella möjligheterna
- skapar recommendations när kvalitet faktiskt uppstår
- följer upp både publicerade och opublicerade idéer
- lär sig av tagna, avstådda, underkända och aldrig triggade trades
- förbättrar confidence, entries, stops, targets och tickerurval över tid
- producerar ett stabilt och auditerbart execution-ready-underlag
- skyddar användaren med tydliga riskregler

Ture ska minska behovet av manuell analys och manuell execution utan att tappa kontroll, transparens, dataintegritet eller riskdisciplin.

## Kontinuerlig intelligens är produktens kärna

Tures kärnloop är:

```text
market data
→ continuous universe monitoring
→ local feature and setup extraction
→ candidate memory
→ continuous quality scoring
→ recommendation state management
→ execution opportunity ranking
→ Execution Agent contract
→ outcome tracking
→ learning and calibration
→ förbättrad intelligence
↺
```

Ture ska arbeta under hela dygnet med sessionsanpassade workloads:

- **Premarket:** discovery, gap- och catalyst-observation, universe-prioritering och candidate formation.
- **Regular market:** live observation, candidate tracking, recommendation lifecycle, outcome evaluation och execution-critical monitoring.
- **After-hours:** outcome completion, post-market context, candidate closure och datakvalitetskontroll.
- **Overnight:** historical backfill, replay, feature computation, ticker memory, calibration och modellutvärdering.
- **Weekend/holiday:** lågprioriterad research, datakomplettering, governance review och backlogarbete.

Batchar får finnas som tekniska checkpoints för persistence, audit trail, providerbudget, sharding, snapshotgruppering, outcome evaluation, rapportering och diagnostik. Batchar får däremot inte:

- begränsa när recommendations får uppstå
- kräva ett bestämt antal recommendations
- blockera analys mellan tidigare tradingfönster
- vara den enda datakällan för learning

## Informationshierarki och centrala produktytor

Ture ska samla brett, ranka hårt och agera selektivt.

De centrala användarytorna är:

- **Top Opportunities** — de bästa aktuella möjligheterna, rankade relativt hela det observerade universumet.
- **Execution Ready** — recommendations som passerat det versionerade execution-kontraktet.
- **Developing Candidates** — kandidater som mognar men ännu inte är redo.
- **Candidate Stream** — bred kontinuerlig observation av kandidater och state changes.
- **Shadow/Research** — learning-only data som aldrig får framstå som live performance.
- **Learning/Statistics/Diagnostics** — transparens, calibration, provider health, model review och audit.

Det finns ingen fast kvot för antal recommendations. Om många högkvalitativa möjligheter uppstår får flera kvalificeras. Om inga möjligheter passerar quality gates ska Ture tydligt säga att marknaden saknar tillräckligt bra trades.

## Recommendation lifecycle och Candidate Memory

Kandidater ska vara levande objekt med stabil identity, snapshot-time data och auditerbar transition history.

Positiv lifecycle:

```text
observed
→ developing
→ qualified
→ recommendation
→ execution_candidate
→ execution_ready
```

Negativ eller avslutande lifecycle:

```text
developing → weakened → invalidated
qualified → expired
recommendation → superseded
execution_candidate → blocked_by_risk
execution_ready → invalidated eller expired
```

Varje transition ska kunna förklara:

- vad som ändrades
- vilka features eller datapunkter som drev ändringen
- vilken state kandidaten kom från och gick till
- reason codes och caution flags
- tidpunkt och datakvalitet
- om kandidaten ersattes av en bättre möjlighet

Stable identity är obligatoriskt. Ticker-symbolen ensam får inte användas som unik candidate identity.

## Lärande huvudflöde

Det viktigaste lärandeflödet är:

```text
continuous observation
→ market regime classification
→ sector/industry intelligence
→ dynamic universe prioritization
→ feature and setup extraction
→ candidate state updates
→ recommendation promotion or rejection
→ snapshot-time persistence
→ shadow/research samples
→ explicit horizon outcomes
→ recommendation-level deduplication
→ confidence calibration and model review
→ controlled engine adjustment candidates
→ förbättrad recommendation engine
```

Varje recommendation och utvald research observation ska sparas med vad Ture faktiskt visste vid beslutstidpunkten. Outcomes eller framtida candles får aldrig användas för att rekonstruera en historisk projection, score eller trade-plan.

Ture ska mäta om recommendations och kandidater var bra eller dåliga, varför de fungerade eller inte fungerade, om entry triggade, om target eller stop träffades först, hur långt priset gick i rätt eller fel riktning och om confidence var rätt kalibrerad.

Primär calibration ska ske på recommendation-nivå. När flera outcome horizons finns för samma recommendation används den längsta kompletta supported horizon enligt ordningen `60m > 30m > 15m`. Horizon-level metrics får användas diagnostiskt men ska inte trippelräkna samma confidence-beslut.

## No-trade intelligence

Ture ska inte bara vara bra på att hitta trades. Ture ska också vara bra på att säga nej.

Ett korrekt resultat kan vara:

- “No high-quality trades right now.”
- “Market is too choppy.”
- “Setups have weak follow-through.”
- “Current candidates are still developing.”

No-trade får aldrig bero på att ett artificiellt batchfönster är stängt. Det ska bero på faktisk setup-kvalitet, risk/reward, datakvalitet, marknadsregim eller riskbegränsningar.

## Relation till Execution Agent

Execution Agent utvecklas som ett separat tekniskt spår. Recommendation engine ansvarar för **vad** som är execution-ready och **varför**. Brokerintegration ansvarar för själva orderflödet.

Intelligence-motorn ska leverera ett stabilt, versionerat kontrakt med:

- candidate och recommendation identity
- lifecycle state
- quality score och confidence
- rank relativt andra aktuella möjligheter
- entry, stop, target och quantity/risk-underlag
- execution eligibility
- entry proximity och timing
- data quality och freshness
- reason codes och caution flags
- invalidation och expiry
- supersession
- authority- och riskrelevant metadata

Execution Agent får inte behöva tolka ostrukturerad UI-text för att avgöra om den bör agera.

Tures intelligens

Ture är byggd som en lärande rekommendationsmotor. Målet är att Ture över tid ska förstå:

- vilka setups som fungerar
- vilka setups som inte fungerar
- vilka tickers som är pålitliga
- vilka tickers som ger false positives
- vilka sektorer som är in play
- vilka market regimes som stödjer vissa strategier
- vilka entries som triggar
- vilka targets som är realistiska
- vilka stops som är för tighta eller för vida
- när en trade bör tas
- när en trade bör avstås
- när Ture inte har tillräckligt med data för att lita på sin slutsats

Ture blir inte bättre genom att gissa mer. Ture blir bättre genom att mäta.

Varje kontinuerlig observation, varje recommendation, varje research_only-sample och varje outcome blir en datapunkt. Över tid skapas ett växande facit över vad som faktiskt fungerar.


Research_only och lärande från gränsfall

Ture ska inte bara lära sig av synliga rekommendationer. Ture ska också spara vissa kandidater som inte nådde publiceringsgränsen som dolda research_only-samples.

Detta är viktigt eftersom det gör att Ture kan analysera kandidater som nästan blev rekommendationer.

Med research_only kan Ture svara på frågor som:

- Var filtret för hårt?
- Var filtret för snällt?
- Fanns det dolda kandidater som presterade bättre än de synliga?
- Vilka typer av underkända setups var faktiskt lovande?
- Vilka underkända setups var korrekt bortfiltrerade?

Om research_only-kandidater ofta presterar dåligt är det ett tecken på att publish-threshold fungerar.

Om vissa research_only-kandidater ofta presterar bra är det ett tecken på att den setup-typen, tickern, sektorn eller strategin kanske bör uppgraderas.

Om synliga experimental-kandidater presterar sämre än dolda research_only-kandidater kan ranking, confidence eller threshold behöva justeras.

Ture ska därför inte bara lära sig av vinnarna. Ture ska också lära sig av gränsfallen.


## Kontinuerlig datainsamling och learning via Twelve Data

En central del av Tures långsiktiga intelligens är att systemet ska samla kvalitativ och lärbar data under hela dygnet. Ture ska använda tillgänglig marknadsdata för att bygga en djupare förståelse för tickers, kandidater, setups, sektorer, marknadsregimer och intraday-beteenden över tid.

Twelve Data-kapaciteten ska styras av en central budgetorkestrerare. Livekritiska workloads ska prioriteras före background learning, samtidigt som ledig kapacitet används för rolling collection, shadow sampling, historical backfill, replay och ticker memory. Shared candle cache och lokal featureberäkning ska minska duplicerade provider-anrop.

Målet är att Ture ska arbeta kontinuerligt både när marknaden är öppen och stängd. Systemet ska kunna analysera tidigare tradingdagar, simulera historiska beslutstidpunkter och skapa tydligt märkta research-only outcomes. På så sätt kan Ture bygga mer kunskap än om learning enbart baseras på synliga live-recommendations.

### Historical Learning Backfill

Ture ska på sikt kunna hämta historisk intraday-data, exempelvis 5m- eller 15m-candles, för valda tickers och tidigare tradingdagar. Denna data kan användas för att rekonstruera tidigare marknadslägen och simulera hur Ture skulle ha analyserat aktien vid olika tidpunkter.

För varje historiskt tillfälle ska Ture endast få använda information som hade varit känd vid den tidpunkten. Om Ture exempelvis simulerar ett beslut klockan 10:15 ET får analysen bara använda candles och metadata fram till 10:15. Outcomes, såsom 15m, 30m och 60m framåt, får först användas efteråt för utvärdering. Detta är viktigt för att undvika lookahead bias.

Historical Learning Backfill ska kunna skapa synthetic research samples, men dessa ska tydligt skiljas från riktiga live-rekommendationer. De får inte blandas ihop med trades som faktiskt visades för användaren eller användes i live-beslut. De ska användas som research-only data för att förbättra Tures förståelse över tid.

### Nightly Research Jobs

När marknaden är stängd ska Ture kunna köra nattliga research-jobb. Dessa kan exempelvis:

- hämta historiska candles för utvalda tickers
- analysera tidigare sessionssegment, inklusive morning, midday och power hour som analytiska labels
- identifiera setups som skulle ha varit relevanta
- utvärdera entry, stop, target och follow-through
- bygga ticker profiles
- jämföra visible- och research-only candidates
- förbättra förståelsen för sector/industry behavior
- samla data för confidence calibration
- analysera marknadsregimer och setup-kvalitet

Dessa jobb ska vara budgetmedvetna och aldrig störa livekritiska workloads. Open-position monitoring, exit/stop-signaler, execution-ready monitoring, outcome completion och data recovery ska alltid kunna preempta bakgrundslearning.

### Intraday Shadow Sampling

Utöver historisk backfill ska Ture även kunna köra tyst continuous shadow sampling under marknadens öppettider. Dessa observationer ska inte automatiskt publiceras eller påverka ranking. Syftet är att följa hur candidates och setups utvecklas över hela tradingdagen.

Shadow sampling ska planeras dynamiskt utifrån providerbudget, session, universe layer och candidate priority. Ture kan spara observationer om momentum, VWAP, volume expansion, trend/chop, entry proximity, setup maturity och feature deltas. Senare kan observationerna utvärderas mot faktisk prisutveckling.

Detta gör att Ture kan lära sig av många fler marknadslägen utan att skapa brus i användargränssnittet.

### Ticker Memory

Ture ska över tid bygga ett minne för varje ticker. Detta minne ska inte bara baseras på enstaka trades, utan på många historiska och research-only observationer.

Ticker memory kan svara på frågor som:

- triggar entry ofta eller sällan för denna ticker?
- tenderar aktien att få bra follow-through efter entry?
- fungerar den bäst i morning, midday eller power hour?
- fungerar den bättre i trendande eller choppy marknad?
- är den mest användbar som visible candidate eller research-only candidate?
- är den för volatil, för svag eller för brusig för Tures strategi?
- verkar den passa vissa setup-familjer bättre än andra?

Ticker memory ska användas försiktigt och i början endast som advisory/readback. Det ska inte automatiskt påverka scanner universe, ranking eller publish thresholds förrän tillräckligt mycket data finns och Model Change Governance tillåter det.

### Local Indicator Computation

För att använda Twelve Data effektivt ska Ture i största möjliga mån hämta rå candle-data och sedan beräkna indikatorer lokalt. En candle request kan användas för många analyser.

Ture bör exempelvis kunna beräkna lokalt:

- VWAP
- ATR
- relative volume
- momentum
- opening range
- range expansion
- trend/chop
- gap behavior
- entry distance
- stop/target geometry
- follow-through
- best/worst R

Detta minskar onödiga API-anrop och gör att Twelve Data-planen används mer effektivt.

### Budgetmedveten användning

Ture ska maximera informationsvärde, inte rå requestvolym. Den centrala budgetplanen ska utgå från tillgänglig kapacitet, hård reserv, session, workload priority, cache coverage och provider health.

Prioritetsordningen ska vara:

1. Critical: open positions, stop/exit monitoring och execution-ready monitoring
2. High: outcomes, hot candidates, recommendation validation och data recovery
3. Normal: warm/broad universe, dynamic movers och continuous shadow sampling
4. Background: historical backfill, ticker memory, replay, feature recomputation och model review

Bakgrundsjobb ska kunna pausas eller degraderas när critical/high workloads behöver kapacitet, när provider health försämras eller när reservbudgeten hotas.

### Skillnad mellan live, research-only och historical synthetic data

Ture ska tydligt skilja på olika typer av learning-data:

- Live visible recommendations: rekommendationer som faktiskt visades för användaren.
- Research-only samples: kandidater som analyserades och sparades för learning men inte visades.
- Shadow samples: tysta observationer som gjordes utan att publiceras.
- Historical synthetic samples: simulerade historiska setups baserade på tidigare tradingdagar.

Alla dessa datatyper kan vara värdefulla, men de ska inte blandas ihop. Ture ska alltid veta vilken typ av sample en outcome kommer från och hur mycket vikt den bör ha i learning.

### Syfte

Syftet med den utökade Twelve Data-användningen är att göra Ture mer intelligent utan att göra användarens beslutsyta rörig. Datainsamlingen får vara bred, medan ranking och execution ska vara selektiv.

Ture ska kunna lära sig dygnet runt och tydligt presentera de bäst rankade, mest handlingsbara möjligheterna när de faktiskt uppstår.

Detta gör att Ture över tid kan bli bättre på:

- ticker selection
- setup selection
- confidence calibration
- entry timing
- target/stop calibration
- market regime awareness
- sector rotation
- no-trade decisions
- research-only comparison
- dynamic universe readiness

Den långsiktiga målbilden är att Ture använder marknadsdata kontinuerligt i bakgrunden för att bygga ett växande beslutsunderlag, medan användarupplevelsen förblir enkel, lugn och selektiv.


Market Regime Engine

Ture behöver förstå vilken typ av marknad det är innan den rekommenderar trades.

Samma setup fungerar inte lika bra i alla marknadslägen. En momentum breakout kan vara stark i en risk-on trend day men svag i en choppy marknad. En mean reversion-setup kan fungera i överreaktioner men vara farlig under stark trend.

Ture bör därför ha en Market Regime Engine som klassificerar dagens marknad.

Exempel på market regimes:

- risk_on
- risk_off
- trend_day
- choppy
- high_volatility
- low_volatility
- sector_rotation
- news_driven
- mixed
- unknown

Market regime ska påverka:

- vilka strategier som prioriteras
- vilka setups som de-rankas
- hur hög confidence Ture får sätta
- hur aggressiv entry-logiken får vara
- om no-trade är bättre än att publicera svaga rekommendationer

Om market regime är okänd ska Ture markera detta som en metadata gap och vara mer försiktig.


Sector och Industry Intelligence

Ture bör inte bara scanna en fast lista av aktier. En fast scanner-universe är en bra bas, men marknaden förändras från dag till dag. Olika sektorer, industrier och tickers blir mer eller mindre relevanta beroende på omvärldsläge, nyheter, momentum, volym, volatilitet, risk-on/risk-off-miljö och aktuell marknadsregim.

Därför bör Ture ha ett intelligent urvalssteg före setup-scannern.

Den långsiktiga pipelinen bör vara:

Market Regime Scanner
→ Sector/Industry Scanner
→ Ticker Universe Selector
→ Setup Scanner
→ Recommendation Engine

Industry scannern ska inte ersätta Tures långsiktiga core universe. Den ska fungera som ett prioriteringslager ovanpå den stabila tickerbasen.

Om semiconductors, banker, energi, healthcare eller crypto-relaterade aktier är in play ska Ture kunna upptäcka det och väga upp rätt tickergrupper. Om en sektor är svag, stillastående eller irrelevant den dagen ska Ture kunna väga ned den.

Exempel:

Om AI/semiconductors är starka kan Ture prioritera AMD, NVDA, SMCI, INTC och PLTR.

Om banker är i fokus kan Ture prioritera JPM, BAC, GS och MS.

Om energi är starkt kan Ture prioritera XOM, CVX och OXY.

Om crypto-relaterade aktier rör sig kan Ture prioritera COIN, MSTR och liknande tickers.

Om risk-off dominerar marknaden kan Ture minska aggressiva momentum setups och kräva högre kvalitet innan en rekommendation publiceras.

Ture ska alltså inte bara välja rätt setup. Ture ska först välja rätt marknadsområde att leta i.


Ticker Confidence, In-Play Detection och Ticker Memory

Ture ska kunna scanna både etablerade tickers med historisk outcome-data och nya tickers som plötsligt blir relevanta under en tradingdag.

En viktig princip är att Ture inte behöver ha lång historik på en ticker för att avgöra om den är värd att scanna just idag, men Ture behöver längre historik för att avgöra om tickern är pålitlig över tid.

Det ska därför finnas en tydlig skillnad mellan dagsaktuell relevans och långsiktig ticker-confidence.

One-day signal = scan-worthy.
Multi-day evidence = trust-worthy.

En ticker kan bli intressant efter en enda stark dagsignal. Om tickern visar hög relativ volym, stor gap up/down, tydlig nyhet eller catalyst, stark intraday-trend, stor range, bra likviditet, ren price action eller sektorstyrka, ska Ture kunna markera den som in play today.

Det betyder att tickern är värd att inkludera i dagens scan-universe, även om Ture ännu inte har mycket historisk data på den. Detta ska inte tolkas som att Ture har bevisad edge i tickern. Det betyder bara att tickern är tillräckligt aktiv och relevant för att undersökas.

För att Ture ska kunna säga att en ticker är långsiktigt pålitlig krävs däremot fler datapunkter över tid. En enda dag kan vara missvisande eftersom rörelsen kan bero på en unik nyhet, extrem volatilitet, ett ovanligt marknadsläge eller slumpmässig intraday-rörelse.

Ture ska därför bygga Ticker Memory / Ticker Profiles.

Varje tickerprofil bör innehålla:

- vanlig volatilitet
- bästa tradingfönster
- bästa setup-typer
- entry trigger rate
- target hit rate
- stop hit rate
- neither hit rate
- average best R
- average worst R
- false positive rate
- ticker confidence
- sector association
- bästa market regimes
- svagaste market regimes
- vanligaste failure modes

Ture bör använda en statusmodell för tickers:

1. New / In Play Today

Tickern har en stark dagsaktuell signal och är värd att scanna. Den kan ha hög dagsrelevans men låg historisk confidence. Den får delta i scan-processen, men resultat ska tolkas försiktigt.

2. Observed / Under Observation

Tickern har börjat samla outcome-data. Ture har sett flera setups och kan börja identifiera mönster, men sample size är fortfarande för låg för starka slutsatser. Den kan prioriteras om dagsläget stödjer det, men ska inte behandlas som bevisat stark.

3. Trusted / Proven Universe Member

Tickern har tillräckligt många historiska outcomes för att Ture ska kunna bedöma dess beteende mer pålitligt. Den kan få högre ticker-confidence om den konsekvent visar bra setup-kvalitet, bra follow-through, rimlig target/stop-profil och stabil outcome-performance.


Stable Core Universe + Dynamic Layer

Ture bör inte hoppa slumpmässigt mellan massor av tickers varje dag. Om systemet hela tiden byter universe blir historiken tunn, sample size svag och learning-datan mindre användbar.

Ture bör i stället följa ett stabilt kärnuniversum över lång tid. Det är där systemet bygger djup kunskap om hur olika tickers brukar röra sig, hur entries triggar, hur ofta target nås, hur volatiliteten beter sig, vilka setups som fungerar och vilka tickers som ger false positives.

Samtidigt ska Ture inte vara låst vid samma tickers om marknaden tydligt roterar.

Den bästa modellen är:

Stable Core Universe
+ Sector/Industry Rotation
+ Dynamic In-Play Tickers
= Smart Scanner Universe

Ture bör arbeta med flera kategorier av tickers:

Core tickers:
Tickers som Ture följer kontinuerligt över lång tid. Dessa bygger långsiktig outcome-historik och kan över tid bli trusted universe members.

Sector-priority tickers:
Tickers från sektorer eller industrier som är starka eller särskilt relevanta just idag.

Dynamic movers:
Tickers som plötsligt blir relevanta på grund av nyheter, gap, volym, catalyst eller stark price action.

Research-only tickers:
Tickers som är intressanta men ännu inte tillräckligt betrodda för att väga tungt i rekommendationsmotorn.

De-prioritized tickers:
Tickers som historiskt ger svag follow-through, många false positives, låg entry quality eller dålig target/stop-profil.

Ture bör inte använda hela scan-budgeten på nya tickers. Systemet bör fördela scan-kapaciteten mellan stabilitet och exploration.

En möjlig modell:

60–70 % Core Universe:
Tickers Ture följer långsiktigt och där systemet bygger djup outcome-historik.

20–30 % Sector/Industry Priority:
Tickers från sektorer eller industrier som är starka just idag.

10–20 % Exploration / Dynamic Movers:
Nya eller tillfälligt heta tickers som är in play men ännu har låg ticker-confidence.

Detta gör att Ture både kan bygga långsiktig kunskap och samtidigt vara adaptiv. Den missar inte nya möjligheter, men den blir heller inte impulsiv.


Daily Relevance vs Ticker Confidence

En central princip är skillnaden mellan daily relevance och ticker confidence.

Daily relevance betyder att tickern är intressant idag. Den kan ha hög volym, stor range, gap, nyheter, sector momentum eller annan dagsaktuell aktivitet.

Ticker confidence betyder att Ture har historiskt förtroende för tickern baserat på tidigare outcomes.

En ticker kan ha hög daily relevance men låg ticker confidence.

Exempel: en ny biotech-ticker gappar kraftigt på en nyhet. Den är värd att scanna idag, men Ture ska inte låtsas att den har historisk edge i tickern.

En annan ticker kan ha medium daily relevance men hög ticker confidence.

Exempel: AAPL eller MSFT kanske inte är dagens största mover, men Ture har lång historik och vet hur de brukar bete sig.

Det smarta är att väga ihop båda.

Varje ticker bör därför kunna få separata scores:

ticker_confidence_score:
Bygger på historisk outcome-data.

daily_relevance_score:
Bygger på dagens marknad, sektor, volym, gap, catalyst och momentum.

combined_scan_priority_score:
Väger ihop långsiktigt förtroende och dagsaktuell relevans.


Strategy / Setup Labeling

Varje rekommendation ska märkas med vilken strategi eller setup-familj den tillhör.

Exempel på setup-familjer:

- VWAP pullback
- Momentum breakout
- Opening range continuation
- Gap continuation
- Gap fade
- Trend day pullback
- Mean reversion after overreaction
- High relative volume continuation
- Power Hour continuation
- Large cap momentum
- High beta momentum
- News/catalyst momentum

Utan tydliga setup-labels kan Ture bara lära sig att en enskild rekommendation gick bra eller dåligt.

Med setup-labels kan Ture lära sig vilka strategier som fungerar, när de fungerar, på vilka tickers, i vilka sektorer och under vilka market regimes.

Detta är en absolut grundfunktion för Tures långsiktiga intelligens.


Strategy Portfolio

En mänsklig day trader väljer ofta en eller ett fåtal strategier och försöker hålla sig till dem. Det är rimligt, eftersom människans uppmärksamhet, disciplin och exekveringsförmåga är begränsad.

Ture har en annan möjlighet.

Ture kan över tid bygga en portfölj av strategier och mäta dem separat.

Varje strategi kan förstås som en egen specialist med egen historik och egna mätvärden.

Exempel:

VWAP Pullback Specialist:

- Hur ofta triggar entry?
- Hur ofta nås target?
- Hur ofta nås stop?
- Avg best R
- Avg worst R
- Bäst fungerande tickers
- Bästa tradingfönster
- Vanliga failure modes

Momentum Breakout får sin egen statistik. Gap Fade får sin egen. Opening Range Continuation får sin egen.

Ovanpå strategierna behöver Ture ett val-lager: en meta-selector.

Meta-selectorn svarar på frågan:

Givet marknaden just nu, vilken strategi ska Ture lita mest på?

Om marknaden trendade starkt från öppning kan Ture prioritera continuation och pullback.

Om många kandidater är extended kan Ture undvika aggressiva breakouts.

Om volymen är hög men follow-through historiskt svagt kan Ture sänka confidence.

Om Power Hour historiskt är svag för en viss setup kan Ture de-ranka den setupen i Power Hour.

Om VWAP pullbacks historiskt slår breakouts i dagens miljö kan Ture prioritera VWAP pullbacks.

Detta gör att Ture inte behöver vara låst till en enda strategi. Den kan ha flera specialiserade strategier och välja den som passar bäst för dagens marknad.


News / Catalyst Awareness

Ture bör kunna skilja mellan teknisk rörelse och catalyst-driven rörelse.

Exempel på catalysts:

- earnings
- FDA/news
- macro data
- analyst upgrade/downgrade
- sector news
- company-specific news
- crypto-driven move
- oil-driven move
- rates-driven move
- index-driven move

En rörelse med tydlig catalyst kan ha bättre follow-through än en slumpmässig teknisk spike. Samtidigt kan catalysts skapa extrem volatilitet och högre risk.

Ture bör därför kunna markera:

- catalyst_detected
- catalyst_type
- catalyst_confidence
- catalyst_risk
- news_driven_move
- technical_only_move

Catalyst awareness ska påverka confidence, riskbedömning, ticker relevance och setup quality.


Trade Quality Score / Setup Quality Decomposition

Ture bör inte bara sätta en total confidence. Den bör bryta ned trade-kvaliteten i flera komponenter.

Exempel:

- setup_quality
- entry_quality
- risk_reward_quality
- volume_quality
- trend_quality
- sector_support
- ticker_confidence
- market_regime_support
- catalyst_support
- data_quality

Detta gör Tures rekommendationer mer transparenta och lättare att förbättra.

I stället för att bara säga “confidence 74 %” ska Ture kunna visa varför:

Setupen är stark.
Entryn är okej men inte perfekt.
Sector support är hög.
Ticker confidence är medium.
Market regime stödjer strategin.
Risk/reward är acceptabel.
Data quality är god.

Detta gör att användaren kan förstå Tures resonemang utan att behöva analysera allt själv.


Confidence Calibration Engine

Original confidence är auktoritativt tills en versionerad governance-process uttryckligen godkänner annan påverkan. AI Projection, shadow experiments och advisory adjustments får inte påverka live ranking, recommendation promotion eller execution eligibility från små samples.

Alla intelligence-förändringar ska gå genom:

```text
observation → shadow → advisory → limited influence → production influence
```

Varje steg kräver versionerad hypotes, före/efter-mätning, recommendation-level deduplication, subgroup analysis, sample-quality gate, rollback plan och tydligt definierade no-effect boundaries.


Ture bör löpande mäta om confidence faktiskt stämmer.

Om rekommendationer med 80 % confidence inte presterar bättre än rekommendationer med 60 % confidence är confidence inte kalibrerad.

Ture ska därför jämföra expected quality med actual outcome.

Confidence calibration ska kunna ske per:

- strategi
- setup-typ
- ticker
- sektor
- tradingfönster
- market regime
- tier
- entry type

Ture ska på sikt kunna säga:

“Min confidence på den här typen av setup har historiskt varit för hög.”
“Jag sänker confidence tills mer data stödjer den.”
“Den här setupen är low confidence trots att den tekniskt ser stark ut, eftersom liknande cases haft svag follow-through.”

Confidence är centralt för användarens tillit. Den måste vara mätbar, kalibrerad och förbättras över tid.


Entry Timing Engine

Ture behöver ett separat lager för exakt entry-timing.

Dagens rekommendation kan vara rätt i riktning men fel i entry. Därför ska Ture kunna jämföra olika entry-varianter.

Exempel:

- market reference entry
- pullback entry
- breakout confirmation
- first candle close
- softer entry
- VWAP touch
- opening range break
- retest entry

Ture ska mäta:

- hur ofta entry triggar
- hur ofta entry missas
- hur ofta entry triggar men saknar follow-through
- om entry är för aggressiv
- om entry är för defensiv
- om en mjukare entry hade gett bättre R
- om confirmation entry hade minskat false positives

Entry-logiken är central eftersom mycket edge kan försvinna om Ture har rätt idé men fel timing.


Target / Stop Calibration

Ture bör lära sig om targets och stops är realistiska.

En setup kan ha rätt riktning men fel plan. Om target ofta ligger för långt bort eller stop ofta är för tight ska Ture inte kasta bort hela setupen. Den ska förbättra planlogiken.

Ture bör kunna upptäcka:

- target_too_far
- target_too_close
- stop_too_tight
- stop_too_wide
- poor R/R despite good direction
- price usually reaches 0.5R but not 1R
- setup works with smaller target
- setup fails because stop placement is unrealistic

Ture ska mäta best R, worst R, target hit rate, stop hit rate och neither hit rate för att förbättra entry/stop/target över tid.


Position Management Intelligence

När en trade väl är live bör Ture inte bara vänta passivt på target eller stop.

Ture bör kunna övervaka positionen och föreslå eller genomföra logiska management actions.

Exempel:

- hold
- close early
- take partial
- move stop to breakeven
- tighten stop
- let winner run
- exit before close
- close because momentum fades
- close because target almost reached but reversal risk increases
- close because stop nearly hit and setup invalidated
- EOD safety close

Detta är viktigt eftersom mycket edge inte bara ligger i entry, utan i hur positionen hanteras efter entry.

Position management ska alltid vara kopplat till riskregler och execution mode.


Execution

Execution är en central del av Tures långsiktiga produkt. Ture ska inte bara kunna rekommendera trades, utan även agera som en agent som kan förbereda och utföra KÖP/SÄLJ-flöden utifrån rekommendationer, användarens inställningar och definierade riskregler.

Execution kan ske i två lägen.

Semi-automatiskt läge:

Användaren väljer eller godkänner en rekommendation. Ture förbereder orderflödet, fyller i relevanta parametrar som ticker, ordertyp, position size, entry, stop och target, men användaren gör den sista bekräftelsen innan ordern skickas.

Automatiskt läge:

Ture kan, efter uttryckligt godkännande från användaren och inom fördefinierade riskramar, själv utföra KÖP/SÄLJ baserat på rekommendationer som uppfyller tillräckligt hög confidence, risk/reward och övriga säkerhetskriterier.

I detta läge fungerar Ture som en autonom trading-agent, men endast inom de gränser som användaren har satt upp.

Automatisk execution ska alltid vara styrd av tydliga säkerhetslager:

- maxrisk per trade
- maxrisk per dag
- max antal trades per fönster
- stop-loss-krav
- tillåtna marknader
- tillåtna ordertyper
- confidence-trösklar
- trusted ticker krav
- trusted setup krav
- kill switch
- full loggning av alla beslut och åtgärder

Användaren ska alltid kunna se varför en trade togs, vilka regler som triggades och hur utfallet blev.


Execution Quality / Slippage Tracking

När Ture börjar användas med Avanza-flödet bör Ture mäta execution quality.

En rekommendation kan vara bra men execution kan försämra resultatet.

Ture bör mäta:

- planned entry vs actual entry
- slippage
- delay from signal to prepared order
- delay from prepared order to manual confirmation
- missed entries
- partial fills
- actual P/L vs planned R
- actual risk vs planned risk
- manual confirmation delay
- broker confirmation timestamp
- exit quality
- planned exit vs actual exit

Detta gör att Ture kan skilja mellan:

“Setupen var dålig.”

och:

“Setupen var bra, men execution blev dålig.”

Det är avgörande när Ture på sikt ska förbättra både rekommendationer och execution-agenten.


Personal Risk Profile

Ture bör ha ett lager för användarens personliga riskprofil.

Samma setup kan vara rätt för en aggressiv användare men fel för en defensiv användare.

Riskprofilen kan innehålla:

- max risk per trade
- max daily loss
- max antal trades per dag
- max antal trades per fönster
- preferred number of trades
- aggressive / balanced / conservative mode
- avoid high beta
- avoid low-confidence tickers
- avoid low-confidence setups
- semi-auto only
- automatic allowed only for trusted setups
- automatic allowed only for trusted tickers
- no trades after certain time
- forced EOD close
- minimum confidence threshold
- minimum data quality threshold

Ture ska kunna anpassa output efter användarens riskprofil utan att bli odisciplinerad.


Explainability Layer

Varje rekommendation bör kunna förklara sig enkelt.

Inte bara:

“Buy AMD.”

Utan:

“AMD är relevant eftersom semiconductors är starka idag, volymen är över normalnivå, priset håller över VWAP, setupen liknar tidigare momentum continuation-cases och risk/reward är acceptabel.”

Explainability bör inkludera:

- varför tickern scannades
- varför sektorn är relevant
- vilken setup som identifierades
- varför entry är vald
- varför stop är placerad där
- varför target är realistisk
- vad som kan gå fel
- vilken confidence Ture har
- vilka datapunkter som stödjer idén
- vilka caution flags som finns

Användaren ska kunna lita på Ture utan att behöva analysera allt själv.


Daily Learning Review

Daily Learning Review är ett read-only analyslager som sammanfattar vad Ture lärde sig under dagen.

Det kan visa:

- senaste utvärderade checkpoint eller observation cycle
- antal evaluated outcomes
- synliga vs research_only outcomes
- entry triggered rate
- entry not triggered rate
- target hit rate
- stop hit rate
- neither hit rate
- average best R
- average worst R
- top tickers
- weak tickers
- setup-grupper
- entry type-grupper
- window-grupper
- tier-grupper
- engine adjustment candidates
- confidence label: low / medium / high

Daily Learning Review gör att Ture inte bara samlar data, utan börjar göra datan användbar.

Det säger i praktiken:

Det här verkar fungera.
Det här verkar svagt.
Det här bör vi undersöka.
Det här är för tidigt att agera på.
Det här har tillräckligt med sample size för att börja påverka motorn.


Model Change Governance

När Ture börjar lära sig och föreslå förbättringar behöver den versionshantering och governance för motorförändringar.

Ture ska inte ändra sig okontrollerat. Varje förbättring bör vara mätbar, spårbar och möjlig att backa.

Exempel på versionsspårning:

- Scoring v1.4
- Target calibration v1.1
- Entry timing model v2
- Sector weighting on/off
- Ticker confidence weighting v1
- Market regime model v1
- Strategy selector v1

Varje motorförändring bör ha:

- syfte
- hypotes
- före/efter-mätning
- sample size
- confidence label
- rollout status
- rollback option
- påverkan på ranking
- påverkan på visible recommendations
- påverkan på research_only
- påverkan på execution eligibility

Detta gör att Ture kan förbättras utan att bli instabil eller överoptimerad.


Ture ska inte ändra sig för snabbt

En viktig del av intelligensen är återhållsamhet.

Ture ska inte börja ändra hela rekommendationsmotorn efter några få trades. Det skulle riskera överoptimering.

Därför bör Ture arbeta med confidence labels:

Low confidence:
Intressant observation, men för lite data.

Medium confidence:
Återkommande mönster som bör granskas.

High confidence:
Starkt mönster som kan börja påverka scoring eller ranking.

Rätt väg är:

Samla data.
Sammanfatta data.
Identifiera mönster.
Föreslå justeringar.
Validera över fler unika recommendations, tradingdagar, tickers och marknadsregimer.
Implementera små, kontrollerade motorförbättringar.
Mäta före/efter.


Slutvision

Ture ska över tid bli en lärande trading co-pilot som kan säga:

“Den här setupen är inte bara tekniskt intressant. Den liknar setups som historiskt fungerat i just den här typen av marknad, i just den här sektorn, på just den här typen av ticker, med just den här typen av entry.”

Ture ska bygga intelligens genom att kombinera:

- scanner
- market regime engine
- sector/industry intelligence
- ticker confidence
- ticker memory
- stable core universe
- dynamic in-play detection
- setup labeling
- strategy portfolio
- strategy specialists
- meta-selector
- research_only learning
- outcome tracking
- confidence calibration
- entry timing engine
- target/stop calibration
- position management intelligence
- execution agent
- execution quality tracking
- personal risk profile
- explainability layer
- Daily Learning Review
- model change governance

Den långsiktiga riktningen är:

- färre men bättre rekommendationer
- mer träffsäkra entries
- mer realistiska targets
- bättre stop-logik
- bättre position management
- bättre tickerurval
- bättre sector intelligence
- bättre strategiurval
- bättre confidence
- bättre execution
- mer anpassning till market regime
- tydligare lärande från varje tradingdag

Ture ska samla data brett, men agera selektivt.

Ture ska kunna upptäcka nya möjligheter snabbt, men bara lita på dem långsamt.

Ture ska inte jaga trades. Ture ska hitta kvalitet.

Det gör Ture till mer än en daytrading-app. Det gör Ture till en intelligent, lärande trading co-pilot och agent som gradvis kan bli mer selektiv, mer träffsäker, mer disciplinerad och mer användbar över tid.
