# Action 333: Historical Data Backfill Existing Coverage Audit

## Audit Status

- historical_backfill_existing_coverage_status: coverage_audit_ready
- branch: dev/safe-post-recovery-work
- rollback deploy protected: 6a501645908e4100088b7396
- clean base commit: 512a0c5

This is existing coverage audit only, not a new backfill implementation, not runtime implementation, not provider integration, not news integration, not Supabase persistence, not scanner mutation, not ranking mutation, not deploy readiness, and not main-push authorization.

## Important Correction

Historical/backfill/replay work is not starting from zero. Prior work must be preserved.

New work must be additive and gap-driven. Do not rebuild existing snapshot, candle persistence, replay, history, or statistics foundations unless an audit proves a concrete gap.

This audit exists to protect earlier work and identify the next useful missing pieces instead of creating parallel systems.

## Existing Known Coverage

| Capability | Coverage state | Audit note |
| --- | --- | --- |
| scan/window/tier recommendation generation | existing | Core recommendation generation and official-window concepts already exist. |
| recommendation snapshots | existing | Snapshot/readback work should be preserved and audited for completeness before extending. |
| historical candle storage | existing | Historical candle storage migration and readiness work exists; verify coverage before adding schema. |
| fetch-run audit/readback flow | existing | First tiny fetch-run audit and readback artifacts exist and should not be duplicated. |
| first tiny candle persistence verification | existing | First tiny candle persistence readback and verification work exists. |
| first tiny replay dry-run | existing | Replay dry-run foundations exist, with runtime execution still constrained. |
| signal package discovery | existing | Signal package discovery/readback artifacts exist. |
| static replay result model | existing | Static result model from the post-recovery package exists. |
| static replay simulation engine | existing | Static simulation engine exists for local/offline modeling. |
| static fixtures | existing | Static fixture pack exists and should be reused for local tests. |
| static summary evaluator | existing | Static summary evaluator exists for offline comparison. |
| static inspection report | existing | Static inspection report exists for human review. |
| local static preview | existing | Local static preview and verification path exists. |
| golden snapshots | existing | Golden markdown/JSON snapshots exist and must remain stable unless deliberately updated. |
| History/Statistics foundations | partial | Foundations exist but need an audit against intelligence-first data needs. |
| confidence calibration planning | existing | Metric planning exists but runtime threshold changes remain blocked. |
| quality gate planning | existing | Gate planning exists and should guide future audit coverage. |
| runtime replay route | blocked | Runtime replay route remains blocked after the Action 307/308 incident. |
| news/catalyst collection | needs audit | No runtime news/API collection is authorized by this audit. |
| sector/regime/relative-strength historical context | partial | Planning exists; schema and historical coverage still need gap-driven audit. |

## Intelligence Data Domains Coverage Matrix

| Action 332 domain | Existing coverage | Partial coverage | Missing coverage | Risk if missing | Next additive step |
| --- | --- | --- | --- | --- | --- |
| Intraday price/volume data | Historical candle storage and first tiny candle persistence verification exist. | Coverage depth, ticker breadth, and readback completeness still need audit. | Full multi-window historical coverage map. | Replay and setup analysis may rely on incomplete candles. | Historical coverage readback audit by ticker, interval, and date range. |
| Recommendation snapshot data | Recommendation snapshots and scan/window/tier systems exist. | Snapshot completeness across rejected candidates, tiers, windows, and metadata needs audit. | Explicit completeness scoring by field. | Learning may miss why a recommendation was accepted or rejected. | Recommendation Snapshot Completeness Audit. |
| Outcome data | Outcome/replay review models and replay dry-run foundations exist. | Alignment between live outcome rows, static replay results, and future historical replay needs audit. | Unified outcome dataset schema across live and replay paths. | Calibration metrics may compare incompatible outcome concepts. | Learning Outcome Dataset Design. |
| Sector / industry context | Sector/industry mapping has planning/foundation work. | Historical sector movement and peer-group context are not fully tied to replay samples. | Audited historical sector-relative coverage. | Ture may miss sector-supported or sector-opposed moves. | Sector/industry context schema draft. |
| Market regime context | Market regime labeling foundation exists. | Historical regime snapshots and index/breadth inputs need coverage audit. | Backfilled regime labels for replay windows. | Setups may be overvalued in bad regimes or undervalued in strong regimes. | Market regime snapshot schema draft. |
| Relative strength context | Relative-strength needs are defined in the readiness map. | Some index/sector comparisons may be derivable later from candles. | Explicit relative-strength feature rows. | Ture may confuse isolated spikes with leadership. | Relative strength feature schema draft. |
| Company news / catalyst context | Catalyst need is defined but runtime news integration remains blocked. | Static planning only; no news API calls are authorized. | News/catalyst schema, provider plan, freshness model, and retention policy. | Ture may treat catalyst-backed moves and random spikes the same. | News/catalyst context schema draft. |
| Calendar / event context | Calendar/event context is defined in the readiness map. | Macro/event tagging plan needs a static design. | Historical macro/event calendar joins. | Event-day behavior may be misread as normal setup behavior. | Calendar/event tagging plan. |
| Historical setup behavior | Replay/static summary foundations and confidence calibration planning exist. | Setup-family grouping and historical calibration datasets need alignment. | Validated setup behavior tables by window, sector, regime, and confidence bucket. | Confidence labels may stay descriptive instead of evidence-based. | Pattern Discovery and Confidence Calibration Roadmap. |
| Data quality / provenance | Fetch-run audit/readback and golden verification foundations exist. | Provider freshness, missing fields, and retention policy need cross-domain consistency. | Unified provenance model for candles, snapshots, outcomes, and context. | Poor source quality may be mistaken for market behavior. | Provider capacity/cost plan and provenance schema alignment. |

## Historical Backfill Coverage Windows

| Window | Currently supported | Data source exists | Persistence exists | Replay/outcome reconstruction exists | Next audit/build step |
| --- | --- | --- | --- | --- | --- |
| last 5 trading days | partial | partial | existing for first tiny candle path | partial static replay/dry-run foundations | Audit current stored candle coverage and snapshot availability. |
| last 20 trading days | needs audit | partial | historical candle storage exists, coverage unknown | needs audit | Define ticker/date coverage report before fetching anything. |
| last 60 trading days | needs audit | partial | persistence foundation exists, coverage unknown | needs audit | Estimate provider budget and replay fixture needs. |
| last 120 trading days | needs audit | partial | persistence foundation exists, coverage unknown | missing | Add provider capacity/cost plan before runtime collection. |
| last 252 trading days | missing | partial | schema foundation may support it, coverage unknown | missing | Design conservative phased backfill with audit gates. |
| multi-year later | missing | needs audit | schema should be reviewed before scaling | missing | Defer until shorter windows prove storage, cost, and learning value. |

## Do-Not-Duplicate Rules

- do not recreate historical candle tables if existing table is valid
- do not recreate recommendation snapshot models if existing snapshot flow is valid
- do not create duplicate replay result models
- do not create duplicate outcome concepts
- do not create duplicate History/Statistics concepts
- do not create parallel scanner/ranking paths
- prefer extending existing helpers/docs over new parallel architecture

## Gap-Driven Next Build Candidates

- historical coverage readback audit
- recommendation snapshot completeness audit
- outcome dataset schema alignment
- sector/industry context schema draft
- market regime snapshot schema draft
- relative strength feature schema draft
- news/catalyst context schema draft
- calendar/event tagging plan
- provider capacity/cost plan
- safe runtime ping-only rollout checklist

## Runtime/Blocking Status

- runtime route work remains blocked
- provider calls remain blocked
- news API calls remain blocked
- Supabase writes remain blocked
- scanner/ranking mutation remains blocked
- confidence threshold mutation remains blocked
- deploy remains blocked
- main push remains blocked

This audit does not authorize deploys, main pushes, runtime route changes, provider calls, news API calls, Supabase reads, Supabase writes, candle persistence, news persistence, raw response persistence, fetch-run persistence, synthetic outcome persistence, replay execution, scanner mutations, ranking mutations, confidence threshold changes, visible recommendation changes, outcome persistence changes, Learning Acceleration changes, Add Trade changes, broker changes, execution changes, or risk changes.

## Recommended Next Actions

- Action 334: Recommendation Snapshot Completeness Audit
- Action 335: Learning Outcome Dataset Design
- Action 336: Intelligence Context Schema Draft
- Action 337: Pattern Discovery and Confidence Calibration Roadmap
- Action 338: Runtime Ping-Only Rollout Checklist
- Action 339: Historical Backfill Cost and Provider Capacity Plan
