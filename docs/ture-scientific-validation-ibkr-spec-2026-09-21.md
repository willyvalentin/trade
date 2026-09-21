# Ture – Scientific Validation, Autonomous Trading, Options & IBKR Execution Specification

## 1. Syfte

Nästa större utvecklingsfas för Ture ska flytta produkten från en motor som genererar intelligenta tradingbeslut till ett **mätbart, vetenskapligt validerat, självutvärderande och i framtiden automatiskt exekverbart trading-system**.

Ture ska utvecklas mot ett system som kontinuerligt kan:

- observera marknaden
- förstå rådande marknadsregim
- identifiera möjligheter
- uppskatta sannolikhet och expected value
- jämföra möjligheter mot varandra
- välja bästa instrument
- allokera kapital
- validera risk
- exekvera
- följa positioner
- hantera exits
- mäta execution quality
- utvärdera resultat
- jämföra alternativa beslut
- upptäcka när edge försämras
- skapa ett kontinuerligt research-underlag

Utvecklingen ska ske i fyra sammanhängande huvudspår:

1. **Scientific Validation & Autonomous Paper Trading**\
   Helt autonom intern paper trading med låtsaspengar där Ture kontinuerligt fattar, exekverar och utvärderar beslut utan mänsklig input.

2. **Research & Learning Infrastructure**\
   Market Replay, model/version registry, market regime classification, counterfactual testing, walk-forward testing, drift detection och full performance attribution.

3. **Instrument & Portfolio Optimization**\
   Ture ska avgöra både vilken möjlighet som är bäst och vilket instrument som bäst uttrycker signalen: aktie, call, put eller definierad optionsspread.

4. **IBKR-first Execution Architecture**\
   Interactive Brokers ska bli Tures primära broker. All framtida live execution ska primärt optimeras för IBKR och deras API. Avanza deprioriteras.

---

# 2. Långsiktig målbild

Tures slutliga besluts- och executionkedja ska utvecklas mot:

**Market Data**

→ Market State

→ Market Regime Classification

→ Candidate Discovery

→ Signal Engine

→ Forecast Distribution

→ Expected Value Analysis

→ Opportunity Ranking

→ Instrument Selection

→ Portfolio & Capital Allocation

→ Position Sizing

→ Event Risk Check

→ Risk Validation

→ Order Construction

→ Execution Optimization

→ IBKR Execution

→ Fill Verification

→ Position Monitoring

→ Dynamic Exit Management

→ Transaction Cost Analysis

→ Performance Attribution

→ Counterfactual Analysis

→ Drift Detection

→ Scientific Validation

→ Strategy Improvement

→ Repeat

Ture ska alltså utvecklas från:

> "Vilken aktie bör jag handla?"

till:

> "Vilka möjligheter existerar just nu, var finns statistiskt verifierbar edge, vilka möjligheter är bäst relativt varandra, vilket instrument uttrycker varje signal bäst, hur mycket kapital bör användas, hur ska ordern exekveras och hur ska positionen förvaltas?"

Samma kedja ska först kunna köras **helt autonomt i paper mode** innan riktigt kapital tillåts.

---

# 3. Grundprinciper

## Edge före aktivitet

Ture har inget krav på att generera trades.

Om inga möjligheter uppfyller Tures krav ska resultatet vara:

**NO TRADE**

Att avstå från marknaden är ett fullvärdigt tradingbeslut.

Ture ska optimeras för kvalitet, inte aktivitet.

---

## Evidence before capital

Ingen strategi, modell, setup eller optionsmetod ska få större kapitalallokering enbart för att den verkar logisk eller har fungerat i ett litet sample.

Kapital ska följa dokumenterad evidens.

---

## Paper before live

Ny tradinglogik ska först fungera i:

**Research**

→ **Internal Paper**

→ **IBKR Paper**

→ **Limited Live**

→ **Scaled Live**

Ingen genväg ska tas direkt från implementation till större riktigt kapital.

---

## Autonomous research by default

Tures researchmiljö ska inte kräva manuellt arbete från användaren.

När paper trading är aktiverat ska Ture själv:

- övervaka marknaden
- identifiera kandidater
- analysera setups
- generera signaler
- acceptera eller neka trades
- konstruera orders
- simulera execution
- hantera öppna positioner
- genomföra exits
- registrera resultat
- uppdatera statistik
- köra parallella experiment

Användarens roll i paper mode är **observatör**, inte operatör.

---

## Expected Value före win rate

Ture ska optimera för långsiktigt förväntningsvärde.

En strategi med:

**45% win rate**

kan vara bättre än en strategi med:

**70% win rate**

om vinnarna är tillräckligt större än förlorarna.

---

## Portfolio före enskild trade

En attraktiv trade får inte bedömas isolerat från resten av portföljen.

Ture ska förstå:

- korrelation
- sektor
- beta
- koncentration
- total exposure
- portfolio drawdown
- aktuellt riskutnyttjande

---

## Risk first

Maximal tillåten förlust ska definieras innan en order får exekveras.

Risk Engine ska kunna neka en trade även om Signal Engine vill ta den.

---

## Execution is part of alpha

Tures edge ska alltid mätas **efter**:

- spread
- slippage
- commissions
- missed fills
- liquidity effects

En strategi som endast är lönsam före executionkostnader betraktas inte som validerad.

---

## Full auditability

Varje beslut ska kunna återskapas i efterhand.

Ture ska kunna visa:

- vilken data som fanns
- vilken modellversion som användes
- vilket marknadsregime som identifierades
- vilken signal som genererades
- vilka alternativ som övervägdes
- varför traden accepterades eller nekades
- vilken order som skapades
- vilket resultat den fick
- vilka alternativa beslut som hade varit bättre eller sämre

---

# 4. Scientific Validation Layer

Scientific Validation Layer ska vara fundamentet för hela Tures framtida utveckling.

Syftet är att besvara:

> Har Ture faktisk alpha?

inte:

> Ser Tures rekommendationer intelligenta ut?

All research, paper trading, live trading och optionsutvärdering ska därför producera strukturerad mätdata.

---

# 5. Autonomous Paper Trading Service

Ture ska ha en kontinuerligt fungerande autonom paper trading-motor.

Den ska fungera även när:

- ingen användare är inloggad
- dashboarden inte är öppen
- frontend inte körs aktivt hos användaren

Under relevanta amerikanska marknadstider ska systemet automatiskt:

1. hämta aktuell data
2. klassificera marknadsläget
3. uppdatera kandidatuniversum
4. köra scanner
5. identifiera setups
6. generera signaler
7. beräkna sannolikheter
8. uppskatta EV
9. ranka möjligheter
10. genomföra risk checks
11. välja trades
12. konstruera orders
13. simulera execution
14. följa fills
15. öppna paper-positioner
16. monitorera positioner
17. reagera på exit-signaler
18. stänga positioner
19. attribuera resultat
20. uppdatera portfolio
21. uppdatera dashboard
22. lagra data för framtida research

Ingen mänsklig input ska krävas.

---

# 6. Autonomous Paper Portfolio

Paper trading ska ha ett eget virtuellt konto.

Det ska minst innehålla:

- starting capital
- available cash
- buying power
- realized P&L
- unrealized P&L
- total equity
- open positions
- closed positions
- gross exposure
- net exposure
- sector exposure
- current drawdown
- maximum drawdown

Exempel:

**Starting capital: $100,000**

Ture ska själv använda kapitalet enligt samma riskregler som senare kan användas live.

Det gör det möjligt att mäta **Ture som komplett trading-system**, inte bara enskilda trades.

---

# 7. Paper Trading Dashboard

All autonom paper trading ska vara synlig i dashboarden.

Dashboarden är ett **observability interface**, inte en förutsättning för att tradingmotorn ska fungera.

## Paper Account

Visa:

- total equity
- starting capital
- total return
- today's P&L
- realized P&L
- unrealized P&L
- available capital
- gross exposure
- net exposure
- current drawdown

## Current Activity

Visa:

- open positions
- pending simulated orders
- active signals
- senaste Ture-besluten
- rejected opportunities
- active exit monitoring

## Performance

Visa:

- equity curve
- daily returns
- weekly returns
- monthly returns
- maximum drawdown
- Sharpe
- Sortino
- profit factor
- expectancy
- win rate

## Research

Visa:

- performance per setup
- performance per regime
- performance per confidence
- performance per model version
- best/worst strategies
- sample size
- validation status

## System Status

Visa:

- paper engine running/stopped
- market data health
- last successful scan
- latest decision
- signals evaluated today
- trades taken today
- currently active strategy versions

---

# 8. Signal Registry

Varje signal som Ture överväger ska sparas som ett immutable research event.

Minst:

- timestamp
- ticker
- market regime
- setup
- direction
- reference price
- proposed entry
- proposed stop
- proposed target
- expected holding period
- proposed position size
- confidence
- expected probability
- expected EV
- feature snapshot
- market snapshot
- model versions
- strategy version
- accepted/rejected
- rejection reason

Även nekade signaler ska sparas där det är praktiskt möjligt.

Det gör det möjligt att senare undersöka:

> Var Tures filter faktiskt värdeskapande?

---

# 9. Model & Strategy Registry

Varje beslut ska kunna kopplas till exakt vilken version av Ture som skapade det.

Exempel:

**Candidate Picker:** 3.2.1\
**Signal Engine:** 4.7.2\
**Forecast Model:** 2.4.0\
**Risk Engine:** 1.9.1\
**Exit Engine:** 2.8.4\
**Regime Engine:** 1.3.0\
**Feature Schema:** 12\
**Strategy:** MomentumBreakout-v17

Registry ska möjliggöra:

- reproducerbara experiment
- version-to-version comparison
- rollback
- auditability
- performance per version

Ture ska kunna jämföra:

**MomentumBreakout-v16**

mot:

**MomentumBreakout-v17**

på samma data och samma marknadsperioder.

---

# 10. Market Replay Engine

Ture ska få en Market Replay Engine som kan återskapa historiska handelsdagar kronologiskt.

Exempel:

**Replay: September 18, 2026**

Systemet ska sedan uppleva dagen som om den sker live.

09:31\
Scanner körs.

09:47\
NVDA identifieras.

09:49\
Signal confirmed.

09:50\
Simulated order submitted.

09:51\
Filled.

10:42\
MOVE_STOP_TO_BE.

11:18\
TAKE_PARTIAL.

etc.

Ture får aldrig se information från framtiden.

Replay Engine ska använda samma kärnlogik som live-systemet.

---

# 11. Syfte med Market Replay

Market Replay ska göra det möjligt att snabbt utvärdera förändringar.

Exempel:

**Engine v23**

mot:

**Engine v24**

över:

**250 historiska tradingdagar**

Resultat kan jämföras efter:

- expectancy
- total R
- Sharpe
- drawdown
- trade count
- missed opportunities
- execution cost
- regime performance

Det gör utvecklingen betydligt snabbare än att vänta månader på ny forward-data.

---

# 12. Replay Integrity

Market Replay ska skyddas mot:

- future leakage
- future candles
- delayed indicators som råkar använda framtidsdata
- reviderad fundamentaldata
- hindsight labels
- framtida market breadth
- framtida closing prices

Alla features måste representera information som faktiskt fanns vid simulationstidpunkten.

---

# 13. Paper Execution Engine

Paper trading ska simulera verklig execution så realistiskt som möjligt.

Den ska modellera:

- bid/ask
- spread
- slippage
- order type
- execution delay
- partial fills
- liquidity
- commissions
- rejected orders
- unfilled orders
- stop execution
- target execution
- trailing exits
- end-of-day exits

Paper trading får inte anta:

**signal price = execution price**

---

# 14. Parallel Shadow Trading

När Ture hittar en kandidat ska flera strategier kunna testas samtidigt.

Exempel:

**NVDA LONG**

Production version:

- standard entry
- current stop
- current exit

Shadow strategies:

- aggressive entry
- conservative entry
- fixed stop
- ATR stop
- dynamic stop
- fixed target
- trailing target
- alternate sizing

Senare även:

- stock
- call
- call spread

Allt ska ske autonomt.

---

# 15. Counterfactual Engine

Counterfactual Engine ska formalisera analysen av:

> Vad hade hänt om Ture hade gjort något annat?

Efter varje signal kan Ture jämföra exempelvis:

### Entry

- immediate
- limit
- breakout confirmation
- pullback entry

### Stop

- 0.7 ATR
- 1.0 ATR
- 1.3 ATR
- dynamic stop

### Exit

- fixed target
- trailing
- model exit
- partial + runner

### Position Size

- 0.25R
- 0.5R
- 1R

### Instrument

- stock
- call
- put
- spread

Counterfactual testing ska inte ändra production-strategin automatiskt.

Det ska producera evidens för framtida versioner.

---

# 16. Performance Metrics

Scientific Validation Layer ska minst mäta:

## P&L

- Gross P&L
- Net P&L
- Realized P&L
- Unrealized P&L
- P&L after slippage
- P&L after commissions

## Return

- total return
- return per trade
- return per day
- return per month
- CAGR

## Risk

- maximum drawdown
- average drawdown
- drawdown duration
- downside deviation
- volatility
- VaR där relevant

## Risk Adjusted

- Sharpe
- Sortino
- Calmar

## Trade Quality

- win rate
- average winner
- average loser
- payoff ratio
- profit factor
- expectancy
- expected R
- realized R
- expectancy per setup

## Execution Quality

- signal price
- expected entry
- actual simulated/live entry
- spread cost
- slippage
- missed fills
- fill probability

## Trade Path

- MFE
- MAE
- time to MFE
- time to MAE
- holding duration

---

# 17. Performance Attribution

Ture ska kunna svara på:

> Var kommer vår alpha ifrån?

Performance ska kunna brytas ner efter:

- setup
- ticker
- sector
- industry
- market cap
- long/short
- confidence
- time of day
- weekday
- volatility regime
- trend regime
- breadth regime
- overall market regime
- holding duration
- entry model
- exit model
- stop methodology
- target methodology
- position sizing model
- model version
- strategy version

Exempel:

**Momentum Breakout**

1,842 trades\
Expectancy: +0.19R\
Profit Factor: 1.38\
Sharpe: 1.41

medan:

**Reversal**

1,106 trades\
Expectancy: -0.08R

---

# 18. Confidence Calibration

Confidence får inte bara vara ett UI-värde.

Ture ska mäta:

**Predicted probability**

mot:

**Observed outcome**

Exempel:

Trades med:

**80–90% confidence**

ska statistiskt vara bättre än:

**60–70% confidence**

Om så inte är fallet ska confidence-modellen kalibreras.

Systemet ska producera calibration curves och calibration error.

---

# 19. Market Regime Engine

Ture ska kontinuerligt klassificera den aktuella marknadsmiljön.

Regime Engine ska kunna analysera exempelvis:

- trend
- volatility
- breadth
- momentum
- liquidity
- market dispersion
- index structure
- risk appetite
- macro event risk

Exempel:

**MARKET REGIME**

Trend: Bullish\
Volatility: Elevated\
Breadth: Strong\
Momentum: Strong\
Liquidity: Normal\
Macro risk: Low

Classification:

**TRENDING BULL / HIGH VOL**

---

# 20. Regime-aware Strategies

Scientific Validation Layer ska mäta varje strategi efter regime.

Exempel:

**Momentum Breakout**

Trending Bull:

+0.31R expectancy

Sideways High Vol:

-0.14R expectancy

Ture ska då kunna använda strategin selektivt.

Det kan vara bättre att:

**stänga av en bra strategi i fel miljö**

än att försöka förändra själva strategin.

---

# 21. Event Risk Engine

Ture ska förstå schemalagda och relevanta events som kan förändra riskprofilen dramatiskt.

Minst:

- earnings
- FOMC
- Fed announcements
- CPI
- PPI
- jobs reports
- major company events
- ex-dividend
- splits
- trading halts
- options expiration
- andra relevanta makrohändelser

Exempel:

**NVDA LONG**

Confidence: 84%

Men:

**Earnings in 40 minutes**

Resultat:

**TRADE REJECTED – EVENT RISK**

Alternativt kan en framtida explicit earnings-strategi tillåta traden under separat riskmodell.

---

# 22. Out-of-Sample Validation

Modeller får inte utvärderas på samma data som användes för utveckling.

Ture ska skilja mellan:

## Training

Modellen utvecklas.

## Validation

Modellen väljs/tunas.

## Out-of-Sample Test

Modellen bedöms på data den inte påverkats av.

OOS-performance ska betraktas som betydligt viktigare än in-sample performance.

---

# 23. Walk-Forward Testing

Ture ska stödja walk-forward validation.

Exempel:

Train:

Jan–Mar

Test:

April

Sedan:

Train:

Feb–Apr

Test:

May

Sedan:

Train:

Mar–May

Test:

June

etc.

Syftet är att se om edge överlever när marknadsförhållanden förändras.

---

# 24. Leakage Protection

Scientific Validation Layer ska aktivt skydda mot:

- future data leakage
- survivorship bias
- look-ahead bias
- hindsight-adjusted features
- framtida closing prices
- reviderad data
- felaktig timestamp alignment

Varje datapunkt måste ha varit tillgänglig vid beslutstidpunkten.

---

# 25. Validation Gates

Ingen strategi ska flyttas från research/paper till live enbart för att resultatet är positivt.

Initiala validation gates bör inkludera:

- tillräckligt sample
- positiv OOS expectancy
- positiv expectancy efter kostnader
- stabil performance över flera perioder
- acceptabel drawdown
- fungerande confidence calibration
- flera marknadsregimer
- ingen enskild ticker som förklarar resultatet
- ingen enskild historisk period som dominerar resultatet

Ett initialt forskningsmål kan vara:

**5,000–10,000 tidsstämplade paper signals**

innan starka slutsatser dras om en generell strategi.

Exakt krav ska bero på strategi och varians.

---

# 26. Strategy Scorecards

Varje strategi ska få ett scorecard.

Exempel:

## Momentum Breakout v4

Trades: 7,214\
Net expectancy: +0.23R\
Profit Factor: 1.47\
Sharpe: 1.62\
Max Drawdown: -9.4R\
OOS Expectancy: +0.18R

### Regimes

Bull: Strong\
Neutral: Positive\
Bear: Weak

### Status

**VALIDATED**

Scorecards ska senare kunna styra både automation och kapitalallokering.

---

# 27. Drift Detection Engine

En strategi som fungerade tidigare kan sluta fungera.

Ture ska kontinuerligt mäta skillnaden mellan:

- historical baseline
- recent 500 trades
- recent 200 trades
- recent 100 trades

Exempel:

Historical expectancy:

**+0.28R**

Last 200:

**+0.04R**

Status:

**POSSIBLE STRATEGY DEGRADATION**

Om degradation fortsätter:

**PAUSE AUTO EXECUTION**

---

# 28. Drift Types

Ture ska kunna övervaka flera former av drift:

### Performance Drift

Expectancy försämras.

### Feature Drift

Input-data förändras jämfört med träningsperioden.

### Regime Drift

Marknaden befinner sig i miljöer strategin sällan sett.

### Execution Drift

Slippage/fills blir sämre.

### Calibration Drift

Confidence slutar korrelera med verkliga resultat.

---

# 29. Portfolio & Capital Allocation Engine

Ture ska inte bara besluta:

> Är denna trade bra?

utan även:

> Är denna trade den bästa användningen av vårt nuvarande riskkapital?

Exempel:

NVDA LONG: +0.30R EV\
AMD LONG: +0.27R\
AVGO LONG: +0.26R\
META LONG: +0.22R

Alla är attraktiva.

Men NVDA, AMD och AVGO är starkt korrelerade.

Ture kanske därför väljer:

**NVDA – TAKE**

**META – TAKE**

**AMD – SKIP: correlated exposure**

**AVGO – SKIP: semiconductor concentration**

---

# 30. Portfolio Risk

Capital Allocation Engine ska minst förstå:

- ticker concentration
- sector concentration
- industry concentration
- long exposure
- short exposure
- gross exposure
- net exposure
- beta exposure
- realized correlation
- volatility
- current drawdown
- open risk
- available risk budget

---

# 31. Dynamic Capital Allocation

Kapital ska senare kunna fördelas dynamiskt.

Exempel:

Available risk budget:

**$1,000**

Ture kan välja:

NVDA:

$420 risk

META:

$330 risk

XOM:

$250 risk

Allocation ska kunna baseras på:

- expected value
- confidence calibration
- volatility
- correlation
- strategy quality
- regime fit
- portfolio state

---

# 32. Instrument & Trade Expression Engine

När equity-signalerna har tillräcklig evidens ska Ture kunna avgöra:

> Vilket instrument ger bäst risk/reward och expected value för just denna signal?

Ture ska inte anta:

**bullish signal = köp aktien**

Flera expressions ska jämföras.

---

# 33. Instrumentuniversum

Initialt:

- Stock
- Long Call
- Long Put

Senare:

- Bull Call Spread
- Bear Put Spread

Ytterligare strategier ska kräva separat validering.

Initialt ska komplexa positioner med obegränsad risk undvikas.

Naked short options ska inte ingå i den initiala implementationen.

---

# 34. Forecast Distribution

För options räcker inte en riktning.

Ture måste uppskatta en sannolikhetsfördelning.

Exempel:

## NVDA – 4 Hour Forecast

10th percentile:

-1.2%

25th percentile:

-0.3%

Median:

+0.9%

Expected:

+1.6%

75th percentile:

+2.8%

90th percentile:

+4.4%

Forecast Distribution används för att simulera instrumentspecifika utfall.

---

# 35. Options Data

Options Engine behöver minst:

- underlying price
- strike
- expiry
- DTE
- bid
- ask
- spread
- volume
- open interest
- implied volatility
- delta
- gamma
- theta
- vega

Senare:

- IV surface
- volatility skew
- term structure
- historical IV percentile
- realized volatility
- event volatility

---

# 36. Option Simulation

Varje relevant optionskontrakt ska kunna simuleras över forecast distribution.

Beräkna:

- expected return
- expected P&L
- probability of profit
- probability of large loss
- probability of maximum loss
- downside distribution
- expected R
- liquidity cost
- theta cost
- IV sensitivity

---

# 37. Best Trade Expression

Exempel:

## Signal

NVDA LONG

Confidence:

86%

Expected Move:

+2.4%

## Alternatives

Stock:

Expected R: +0.19

Call:

Expected R: +0.31

Call Spread:

Expected R: +0.38

## Decision

**BEST EXPRESSION: CALL SPREAD**

Risk budget:

$500

Maximum loss:

$500

Expected value:

+$190

---

# 38. Options Shadow Testing

Innan options får användas live ska varje relevant equity-signal automatiskt kunna generera parallella optionssimulationer.

Ingen användarinput krävs.

Exempel:

Equity:

+1.4R

ATM Call:

+2.7R

0.40 Delta Call:

+3.1R

Call Spread:

+2.4R

Ture ska även registrera de situationer där options underpresterar aktien.

---

# 39. Options Performance Attribution

Optionsresultat ska analyseras efter:

- DTE
- delta
- moneyness
- IV percentile
- spread
- liquidity
- underlying volatility
- setup
- confidence
- holding duration
- entry timing
- regime
- event proximity

Ture kan därmed hitta regler som:

> Momentum Breakout + Low IV + 7–21 DTE → calls outperform stock.

eller:

> High IV Event Regime → stock outperforms long calls.

---

# 40. Execution Quality / Transaction Cost Analysis

När IBKR används ska varje fill jämföras mot Tures ursprungliga beslut.

Exempel:

Signal price:

$188.12

Order submitted:

$188.15

Fill:

$188.28

Spread cost:

$0.04

Slippage:

$0.09

Ture ska mäta:

**Alpha before execution**

mot:

**Alpha after execution**

---

# 41. TCA Metrics

Transaction Cost Analysis ska minst mäta:

- signal-to-order delay
- order-to-fill delay
- arrival price
- execution price
- spread paid
- slippage
- market impact där relevant
- missed fills
- cancellation rate
- partial fill rate

---

# 42. Execution Optimization

Med tillräckligt data ska Ture kunna lära sig:

- när market order är acceptabel
- när limit order är bättre
- hur länge Ture bör vänta
- optimal limit-offset
- vilka aktier som är för illikvida
- när en signal förstörs av execution delay

Execution ska därmed utvecklas till en egen optimeringsmodell.

---

# 43. IBKR-first Strategy

Interactive Brokers ska bli Tures primära broker.

Avanza läggs tills vidare åt sidan i utvecklingsprioriteringen.

Brokerlagret ska fortfarande abstraheras för framtida flexibilitet.

Men:

**alla nya executionfunktioner ska först byggas och valideras mot IBKR.**

---

# 44. Broker Architecture

Ture ska använda ett generellt:

`BrokerAdapter`

med funktioner som exempelvis:

- connect
- authenticate
- getAccount
- getBuyingPower
- getPositions
- getOpenOrders
- placeOrder
- modifyOrder
- cancelOrder
- getExecutions
- subscribeOrderUpdates
- subscribePositionUpdates

Första fullständiga implementation:

`IBKRBrokerAdapter`

---

# 45. Separation mellan Decision och Execution

Tures intelligens ska ligga utanför brokerlagret.

## Ture decides

- ticker
- direction
- instrument
- quantity
- maximum entry
- stop
- target
- risk
- exit conditions

## IBKR adapter executes

- resolve contract
- translate order
- submit
- acknowledge
- monitor fills
- modify
- cancel
- report execution

Samma decision-output ska kunna skickas till:

- Internal Paper
- IBKR Paper
- IBKR Live

utan förändringar i tradinglogiken.

---

# 46. Execution Service

Brokerexecution ska köras som separat backend-service.

Ansvar:

- IBKR connectivity
- authentication/session
- persistent connection
- order transmission
- execution events
- reconciliation
- reconnect handling
- broker state synchronization

Frontend ska inte bära ansvar för faktisk execution.

---

# 47. Order Lifecycle

Orders ska följa definierad state machine.

Exempel:

`CREATED`

→ `RISK_VALIDATED`

→ `READY`

→ `SUBMITTING`

→ `SUBMITTED`

→ `ACKNOWLEDGED`

→ `PARTIALLY_FILLED`

→ `FILLED`

Alternativt:

`REJECTED`

`CANCELLED`

`EXPIRED`

Varje transition loggas.

Samma lifecycle ska så långt möjligt användas i paper och live.

---

# 48. Idempotency

Ingen order ska kunna skickas dubbelt på grund av:

- timeout
- retry
- reconnect
- frontend refresh
- duplicate event

Alla execution requests ska ha unika idempotency identifiers.

---

# 49. Order Reconciliation

IBKR ska vara source of truth för verkliga positioner.

Ture ska kontinuerligt jämföra:

**Ture State**

mot:

**IBKR State**

och upptäcka:

- unknown position
- missing position
- incorrect quantity
- orphaned stop
- orphaned target
- unknown order

Vid kritisk mismatch stoppas automation.

---

# 50. Risk Gate före varje order

Ingen live-order får skickas utan separat risk validation.

Kontroller ska minst inkludera:

- maximum risk per trade
- maximum position size
- daily loss limit
- max open positions
- correlated exposure
- sector exposure
- available buying power
- allowed instruments
- allowed trading hours
- stale market data
- broker connectivity
- event risk
- portfolio drawdown
- strategy validation status

Samma Risk Engine ska kunna användas i paper.

---

# 51. One-click IBKR Execution

Första live-fasen:

**Ture recommends**

→ **Human approves**

→ **IBKR executes**

Exempel:

NVDA LONG\
42 shares\
Limit $186.42\
Stop $184.91\
Target $190.80\
Maximum risk $63

**EXECUTE**

Efter klicket hanterar Ture orderläggningen.

Paper trading ska däremot redan vara helt autonomt.

---

# 52. Automated Exit Management

Ture ska kunna:

- flytta stop
- cancel/replace
- take partial
- take profit
- move stop to breakeven
- trail stop
- close position
- emergency exit

Paper mode ska göra detta autonomt.

Live automation introduceras gradvis.

---

# 53. Full Auto Execution

Senare ska hela liveflödet kunna vara autonomt:

Signal

→ Validation

→ Portfolio Check

→ Event Check

→ Instrument Selection

→ Sizing

→ Risk

→ Order

→ Fill

→ Monitoring

→ Exit

Full auto ska bara aktiveras för strategier som passerat validation gates.

---

# 54. Automation Permissions

Live automation ska kunna konfigureras per:

- strategy
- setup
- instrument
- ticker universe
- confidence
- regime
- risk level

Exempel:

Momentum Breakout:

**AUTO**

Reversal:

**PAPER ONLY**

Options:

**APPROVAL REQUIRED**

---

# 55. Kill Switch

Ture ska ha:

**STOP AUTOMATION**

som förhindrar nya live entries.

Separat:

**CLOSE ALL**

för att stänga Ture-kontrollerade live-positioner när möjligt.

Kill Switch ska kunna triggas automatiskt av:

- daily loss limit
- broker outage
- stale/corrupted data
- abnormal slippage
- reconciliation failure
- extreme market event
- internal failure
- severe strategy drift

---

# 56. Paper / Live Separation

Miljöerna ska separeras hårt.

## Research

Historiska experiment.

## Internal Autonomous Paper

Realtime marknadsdata + simulerat kapital + helt autonom Ture-execution.

## IBKR Paper

Broker-integrerad paper execution.

## Limited Live

Litet riktigt kapital.

## Full Live

Validerat kapital.

Det ska vara omöjligt att oavsiktligt skicka en riktig order från Research eller Paper.

---

# 57. Internal Paper vs IBKR Paper

## Internal Paper

Tures scientific laboratory.

Optimerat för:

- hög experimentvolym
- shadow strategies
- parallel execution
- counterfactuals
- optionssimulation
- full attribution
- snabb iteration

## IBKR Paper

Tures execution rehearsal.

Optimerat för:

- broker contract resolution
- order submission
- acknowledgement
- modification
- cancellation
- fills
- position sync
- reconnect
- execution lifecycle

---

# 58. Autonomous IBKR Paper

Efter Internal Paper ska Ture kunna köra samma signaler genom IBKR Paper autonomt.

Målet är:

Ture

→ Signal

→ Risk

→ Order

→ IBKR Paper

→ Fill

→ Position

→ Exit

→ Reconciliation

utan mänsklig input.

---

# 59. Live Capital Ramp

När en strategi får gå live ska kapital ökas gradvis.

Exempel:

## Stage 1

Minimal capital.

## Stage 2

Ökad allocation efter fungerande live execution.

## Stage 3

Normal allocation.

## Stage 4

Scaled allocation.

---

# 60. Live vs Paper Drift

Ture ska kontinuerligt jämföra:

- paper slippage vs live
- paper fills vs live
- paper expectancy vs live
- paper drawdown vs live
- paper execution latency vs live

Om skillnaden blir för stor ska Ture minska risk eller pausa strategin.

---

# 61. Continuous Autonomous Research Dataset

Paper trading ska inte betraktas som en temporär utvecklingsfunktion.

Den ska fortsätta permanent även efter live launch.

Varje handelsdag ska systemet skapa ny data om:

- accepted signals
- rejected signals
- fills
- trade paths
- exits
- counterfactual outcomes
- market regimes
- strategy performance
- options alternatives
- execution quality
- model performance

Detta blir Tures viktigaste interna research dataset.

---

# 62. Roadmap Sequence

## Phase A — Finish Current Ture Engine

Slutför befintlig kärnmotor.

Nuvarande motor ska bli stabil innan större nya system introduceras.

---

## Phase B — Model & Decision Infrastructure

Bygg:

- Signal Registry
- Model Registry
- Strategy Registry
- immutable decision snapshots
- feature snapshots
- version tracking
- research event schema

**Milestone:**

Varje Ture-beslut ska kunna reproduceras och kopplas till exakt kod/model/strategy-version.

---

## Phase C — Autonomous Scientific Validation Foundation

Bygg:

- autonomous paper service
- autonomous scanning
- autonomous trade selection
- simulated execution
- virtual portfolio
- position monitoring
- exit handling
- slippage model
- P&L attribution
- performance database

**Milestone:**

Ture ska kunna genomföra en hel tradingdag autonomt utan mänsklig input.

---

## Phase D — Paper & Research Dashboard

Implementera:

- account equity
- open positions
- trades
- equity curve
- expectancy
- profit factor
- Sharpe
- drawdown
- attribution
- confidence calibration
- MFE/MAE
- model comparison
- engine status

Dashboarden ska endast visa vad motorn gör.

Den ska inte behöva vara öppen.

---

## Phase E — Market Replay Engine

Implementera:

- chronological historical playback
- point-in-time data access
- replayable scanner
- replayable signal engine
- replayable portfolio
- strict anti-leakage controls

**Milestone:**

En gammal tradingdag ska kunna köras genom samma motor som används i realtime.

---

## Phase F — Walk-Forward & OOS Framework

Implementera:

- training/validation/test separation
- walk-forward analysis
- leakage protection
- experiment versioning
- strategy scorecards
- statistical validation gates

---

## Phase G — Market Regime Engine

Implementera:

- trend regime
- volatility regime
- breadth
- momentum
- liquidity
- macro/event risk

Integrera regime med:

- signal validation
- performance attribution
- strategy activation

---

## Phase H — Counterfactual & Shadow Research

Implementera:

- alternative entries
- alternative stops
- alternative exits
- sizing alternatives
- ignored-signal tracking
- strategy shadowing

Systemet ska samla denna data autonomt.

---

## Phase I — Portfolio & Capital Allocation Engine

Implementera:

- opportunity ranking
- correlation
- sector exposure
- gross/net exposure
- beta
- concentration
- portfolio risk budget
- dynamic sizing

---

## Phase J — Drift & Health Monitoring

Implementera:

- performance drift
- model drift
- feature drift
- regime drift
- execution drift
- confidence drift

Ture ska kunna flagga och senare automatiskt pausa degraderade strategier.

---

## Phase K — Event Risk Engine

Implementera:

- earnings calendar
- economic events
- FOMC/Fed
- CPI/jobs
- splits
- ex-dividend
- halts
- options expiration

Risk Engine ska kunna använda dessa events för trade rejection och sizing.

---

## Phase L — IBKR Foundation

Bygg:

- IBKRBrokerAdapter
- execution service
- authentication lifecycle
- account sync
- position sync
- order lifecycle
- execution events
- reconciliation
- idempotency

---

## Phase M — Autonomous IBKR Paper Execution

Koppla Ture till IBKR Paper.

Validera:

- autonomous signal → order
- fill
- stop
- target
- modify
- cancel
- exit
- reconnect
- reconciliation

---

## Phase N — Transaction Cost Analysis

Implementera:

- arrival price
- spread
- slippage
- latency
- missed fills
- partial fills
- execution attribution

Bygg datagrund för framtida execution optimization.

---

## Phase O — One-click Live IBKR

Första riktiga live-fasen.

Användaren godkänner varje entry.

Ture sköter därefter execution och position lifecycle.

---

## Phase P — Controlled Auto Execution

Automatisera live endast för validerade strategier.

Inkludera:

- risk limits
- permissions
- capital ramp
- drift controls
- kill switch

---

## Phase Q — Options Research Infrastructure

Implementera:

- option chains
- strikes
- expirations
- Greeks
- IV
- liquidity
- pricing
- simulation

---

## Phase R — Autonomous Options Shadow Engine

Varje relevant equity-signal ska automatiskt testa:

- stock
- call
- put
- definierade spreads

utan riktigt kapital.

---

## Phase S — Instrument Selection Engine

Ture ska välja:

**BEST TRADE EXPRESSION**

baserat på:

- forecast distribution
- expected value
- downside
- IV
- liquidity
- theta
- risk budget
- portfolio state

---

## Phase T — Options via IBKR

Första fas:

**APPROVAL REQUIRED**

Senare:

**AUTO**

för separat validerade optionsstrategier.

---

## Phase U — Execution Optimization

När tillräckligt live-data finns ska Ture optimera:

- order type
- limit offset
- timing
- patience
- position size vs liquidity

Execution ska behandlas som ett eget alpha-bevarande problem.

---

# 63. Definition of Success

Denna utvecklingsfas är framgångsrik när Ture kan:

1. Driva realtime paper trading kontinuerligt utan mänsklig input.

2. Själv upptäcka, välja, exekvera, monitorera och avsluta trades.

3. Visa allt resultat automatiskt i dashboarden.

4. Fungera när ingen användare är inloggad.

5. Återskapa historiska tradingdagar genom Market Replay.

6. Koppla varje beslut till exakt model/strategy-version.

7. Mäta expectancy efter realistiska tradingkostnader.

8. Visa var alpha kommer ifrån.

9. Visa vilka marknadsregimer strategier fungerar i.

10. Testa alternativa beslut parallellt.

11. Identifiera när en tidigare edge försämras.

12. Hantera portfolio- och korrelationsrisk.

13. Allokera kapital mellan samtidiga möjligheter.

14. Ta hänsyn till earnings och andra event risks.

15. Exekvera trades genom IBKR.

16. Reconcile Tures state mot IBKR.

17. Mäta faktisk execution quality.

18. Gradvis gå från one-click till full automation.

19. Simulera options parallellt med equities.

20. Avgöra vilket instrument som bäst uttrycker en signal.

21. Använda paper, replay och shadow experiments för kontinuerlig research även efter live launch.

---

# 64. Slutlig produktvision

Ture ska inte definieras som:

> **en AI som rekommenderar aktier.**

Ture ska utvecklas till:

> **En autonom, systematisk trading- och researchmotor som kontinuerligt identifierar, validerar, konstruerar, exekverar och utvärderar trades utifrån statistiskt verifierad edge, marknadsregim, portfolioförhållanden och strikt riskkontroll.**

Ture ska kunna förstå:

**När ska vi handla?**

**Vad ska vi handla?**

**Vilket instrument ska vi använda?**

**Hur stor risk ska vi ta?**

**Vilka andra positioner påverkar beslutet?**

**Hur ska ordern exekveras?**

**När ska vi lämna positionen?**

**Hur mycket av vår förväntade alpha överlevde execution?**

**Hade ett annat beslut varit bättre?**

**Fungerar strategin fortfarande?**

Scientific Validation Layer ska vara det permanenta fundamentet.

Market Replay ska göra utvecklingen reproducerbar.

Regime Engine ska avgöra när olika strategier bör användas.

Counterfactual Engine ska hjälpa Ture förstå alternativa beslut.

Portfolio Engine ska avgöra hur begränsat kapital bäst används.

Drift Detection ska skydda mot strategier vars edge försvinner.

Options Engine ska välja bättre trade expressions när detta är statistiskt motiverat.

IBKR ska bli den primära vägen från Tures beslut till verklig execution.

Den långsiktiga kedjan blir därför:

**OBSERVE**

→ **UNDERSTAND**

→ **DISCOVER**

→ **FORECAST**

→ **RANK**

→ **CONSTRUCT**

→ **ALLOCATE**

→ **VALIDATE**

→ **EXECUTE**

→ **MANAGE**

→ **MEASURE**

→ **COMPARE**

→ **LEARN**

→ **ADAPT**

→ **REPEAT**

Tures paper-system ska bevisa edge autonomt.

Market Replay ska accelerera forskningen.

Scientific Validation ska avgöra vad som förtjänar riktigt kapital.

Portfolio Engine ska avgöra hur kapitalet används.

IBKR ska exekvera besluten.

Och live automation ska endast följa den evidens som Ture själv byggt upp.