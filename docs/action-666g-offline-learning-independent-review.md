# Action 666G — Offline Learning Foundation Independent Review

## Decision

- `action_666g_learning_foundation_frozen: true`
- `action_666g_independent_review_approved: false`
- `action_666g_local_checkpoint_ready: false`
- blocker: 0
- major: 3
- minor: 3
- nit: 1

Approval and checkpoint readiness are false because three major findings remain
open. No Action 666F artifact was changed after the review began.

## Frozen scope

The review covers exactly the five paths in
`action-666g-offline-learning-foundation-freeze-manifest.json` at expected
base and observed HEAD
`c6e69fea3976e4ec0573b51b3494968c30401cbf`.

The canonical freeze algorithm is SHA-256 over sorted lines in the form
`<path>  <sha256>\n`. Before regression and after regression the aggregate
digest was:

`66a99bd4320266f40f8012b1ca142da9a04ecce9dfb5bcaae4566a07cbd7267d`

All evidence is synthetic contract evidence. It is not Ture performance and is
not publishable.

## Fresh regression

- Action 666F focused: 21/21 passed.
- Action 665A–E.1 and Action 666A–F: 122/122 passed.
- Action 664 foundation standard command: 163/163 passed.
- Action 664D disposable PostgreSQL matrix: 13/13 passed on the clean retry.
- TypeScript: passed.
- Scoped ESLint: passed.
- Golden and manifest JSON parsing/parity: passed.
- `git diff --check`: passed.
- Untracked whitespace checks: passed.
- Live-import, dependency, migration, environment and lockfile scope checks:
  passed.

The first standalone Action 664D matrix attempt encountered a transient local
PostgreSQL container socket-start failure before any scenario executed. A
fresh disposable retry passed all 13 scenarios. Both the Action 664 foundation
run and the successful matrix reported no production or external database
interaction.

## Review results

### 1. Leakage and point-in-time

Explicitly named outcome, future, post-decision, MFE, MAE and realized
features are rejected, and feature timestamps later than the decision/cutoff
fail closed. Diagnostic horizons are not read as features or additional
samples.

Major finding `666G-MAJOR-001` remains: the allowlist definitions and every
feature's source, availability and timestamp are caller-supplied under one
constant schema version. A future-derived feature can be renamed to a neutral
allowed name and supplied with a claimed decision-time timestamp. The engine
has no separate governed registry or capture evidence with which to disprove
that claim. Regime is accepted as an un-timestamped string, sector is omitted
from the training row, and provider validation does not bind immutable source
timestamps. Cohort/sample compatibility can likewise be made internally
consistent without checking a closed mapping.

### 2. Split contamination

The walk-forward order is deterministic and chronological by trading day.
Each training window fits preprocessing on training identities only. Complete
days stay together, canonical decision identities are disjoint, and the input
ordering does not affect splits.

Major finding `666G-MAJOR-002` remains: the split gate does not group or
cross-check scan identity, opportunity-set identity, evaluator input or
timestamped outcome intervals. Purge and embargo are caller-supplied trading
day counts rather than a derivation from actual outcome completion timestamps.
A repeated opportunity-set binding with different decision days can therefore
cross the train/test boundary without violating the current checks.

### 3. Dataset and cohort

One canonical identity produces at most one training row. Duplicate canonical
and quality identities fail closed. Days, tickers and regimes are counted as
unique values for minimum evidence, so duplicated labels cannot increase those
denominators. One request has one explicit cohort and sample type, and
diagnostic horizons do not affect dataset or model digests.

The semantic authenticity of the cohort and upstream quality evidence is part
of `666G-MAJOR-001` and `666G-MAJOR-003`; it is not independently anchored by
this engine.

### 4. Model mathematics

Both reference models use canonical feature order, fixed iterations, explicit
learning rate, explicit L2 regularization and seed-derived initialization.
Training-window population standardization is used for each split. The binary
label is target-before-stop, and the linear label subtracts the versioned
transaction cost in R. Label imbalance below the configured minima returns
`not_trainable`. Seed, hyperparameter and candidate-model contract changes
alter artifact and result digests. Ordinary fixture replay is byte-identical
and input-order independent.

Minor finding `666G-MINOR-001` remains: arbitrary finite inputs are accepted.
Extreme finite values can overflow a mean, variance or gradient and cause the
numeric rounding guard to throw, instead of producing a structured
`non_reproducible` result.

### 5. Attribution

Standardized coefficients and local standardized contributions are
mathematically additive on each model's linear scale. Ablation replaces one
feature with the split training baseline (standardized zero), not a value
learned from test data. Attribution is consistently marked predictive,
non-causal, shadow-only and forbidden from automatic promotion.

Minor finding `666G-MINOR-003` remains: logistic local contributions reconstruct
log-odds, but the output does not carry an explicit versioned `log_odds` scale
identifier. Nit `666G-NIT-001` records that correlated-feature coefficient and
ablation instability should be named explicitly, in addition to the existing
general confounding warning.

### 6. Digests and trust boundaries

Dataset, split, split-model, artifact, prediction, calibration, attribution,
shadow-binding, reproducibility and result payloads are content-addressed.
Result-only model or prediction tampering is rejected by deterministic rebuild.
No current live consumer imports the engine, and no provider, database,
persistence, migration or external AI boundary is present.

Major finding `666G-MAJOR-003` remains: rebuild uses the same caller-supplied
request as its source of truth. There is no externally trusted frozen dataset
manifest/root. A self-consistent change to input features, labels, lineage or
versions followed by recomputation of all digests will verify successfully.

Minor finding `666G-MINOR-002` records that default-off prevents trainer
execution but still clones the complete request. It therefore performs limited
input work rather than returning before all traversal.

## Findings

The authoritative structured finding and threat inventory is
`action-666g-offline-learning-threat-finding-matrix.json`.

| ID | Severity | Summary |
| --- | --- | --- |
| 666G-MAJOR-001 | major | Caller-self-attested feature and context provenance |
| 666G-MAJOR-002 | major | Missing scan/opportunity/outcome split-group isolation |
| 666G-MAJOR-003 | major | No trusted input anchor for deterministic rebuild |
| 666G-MINOR-001 | minor | Numeric extremes can escape structured statuses |
| 666G-MINOR-002 | minor | Disabled path still clones the request |
| 666G-MINOR-003 | minor | Logistic attribution scale is not explicitly log-odds |
| 666G-NIT-001 | nit | Correlated-feature caveat is not explicit |

## Required next action

Action 666H should remediate only these findings:

1. add a separately trusted feature/context capture registry and frozen
   training-input manifest/root;
2. bind complete scan/opportunity/evaluator/outcome-overlap groups into split
   construction and derive purge/embargo safety from timestamps;
3. verify the external input trust anchor before dataset construction and
   result rebuild;
4. return structured numerical failure diagnostics, make disabled mode return
   before request cloning, type logistic contributions as log-odds, and
   document correlated-feature instability.

After remediation, create a new freeze and perform a separate clean-room
re-review. No finding was corrected in Action 666G.
