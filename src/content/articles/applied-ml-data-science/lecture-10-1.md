---
course: applied-ml-data-science
lectureId: L10
title: "When 70 Percent Should Mean 70 Percent"
deck: "A classifier can be accurate and still lie about its confidence. Calibration realigns predicted probabilities with reality — using reliability diagrams, the Brier score, Platt scaling, and isotonic regression."
order: 10
date: 2025-03-24
readingTime: 8
tags: ["calibration", "probability", "brier-score", "platt-scaling", "isotonic-regression"]
concepts:
  - id: calibration
    term: Calibration
    definition: "The process of adjusting a model's predicted probabilities so they match observed frequencies — among the cases a model calls 70% likely, about 70% should actually be positive."
  - id: reliability-diagram
    term: Reliability Diagram
    definition: "A calibration curve that bins predictions by their predicted probability and plots each bin's predicted probability against the actual fraction of positives; the 45-degree diagonal represents perfect calibration."
  - id: brier-score
    term: Brier Score
    definition: "The mean squared error between predicted probabilities and binary outcomes, BS = (1/n) Σ (p̂ᵢ − yᵢ)², a single number that rewards both correctness and honest confidence — lower is better."
  - id: platt-scaling
    term: Platt Scaling
    definition: "A parametric calibration method that fits a one-dimensional logistic regression (a sigmoid) mapping a classifier's raw scores to calibrated probabilities."
  - id: isotonic-regression
    term: Isotonic Regression
    definition: "A non-parametric calibration method that fits a monotonic, non-decreasing mapping from scores to probabilities — flexible enough for complex classifiers, but data-hungry and prone to overfit on small sets."
  - id: calibrated-classifier
    term: Calibration Workflow
    definition: "The train/validation/test procedure — as in scikit-learn's CalibratedClassifierCV with a prefit model — that learns the probability mapping on held-out validation data and evaluates it on a separate test set."
---

Ask a machine-learning model whether an email is spam and it can answer in two very
different currencies. It can hand back a label — *spam* or *not* — or it can hand back
a probability: *this is 80% likely to be spam*. The second is far more useful. A
probability supports richer interpretation, feeds cost-sensitive decisions, and lets a
model communicate its own uncertainty to the people relying on it. But there is a catch
that trips up even accurate models: the number a classifier prints is not always a
probability you can trust. A model that outputs 0.9 for a batch of emails should be
wrong about one in ten of them. When it is wrong far more or far less often than its
stated confidence implies, the model is **miscalibrated** — and calibration is the work
of fixing that.

## Probabilities, Not Just Labels

Many classifiers are simply not built to emit trustworthy probabilities. A model tuned
to separate classes cleanly may push its scores toward 0 and 1 to sharpen the decision
boundary, or a bagged ensemble may hedge toward the middle — either way, the raw score
is a *ranking* signal, not a calibrated probability backed by the data. Since not every
model produces probabilities that can be read at face value, the probabilities have to
be *calibrated* after the fact. The goal is precise: for every predicted probability
$p$, the true positive rate among cases assigned that value should also be $p$.

## The Reliability Diagram

The instrument that reveals miscalibration is the **reliability diagram**, also called
a calibration curve. The recipe is to sort predictions into bins by their predicted
probability, and then, within each bin, compare the average predicted probability to
the actual fraction of positive outcomes. Split the unit interval into three bins,
$[0, \tfrac{1}{3})$, $[\tfrac{1}{3}, \tfrac{2}{3})$, and $[\tfrac{2}{3}, 1]$, and each
bin is summarized at its midpoint — $0.16$, $0.5$, and $0.84$. Plot observed frequency
against predicted probability and a perfectly calibrated model traces the 45-degree
diagonal. A curve sagging below the line means the model is overconfident; a curve
bowing above means it is underconfident.

<figure>
<svg viewBox="0 0 380 360" role="img" aria-label="A reliability diagram plotting predicted probability against the observed fraction of positives, with the 45-degree diagonal for perfect calibration and a model curve sagging below it.">
  <defs>
    <marker id="arw-rel" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" class="dgm-fill"/>
    </marker>
  </defs>
  <rect x="70" y="60" width="240" height="240" fill="none" stroke="currentColor" stroke-width="1" class="dgm-muted"/>
  <line x1="70" y1="300" x2="332" y2="300" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-rel)"/>
  <line x1="70" y1="300" x2="70" y2="48" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-rel)"/>
  <text x="190" y="332" text-anchor="middle" font-size="12">predicted probability</text>
  <text x="90" y="40" text-anchor="middle" font-size="12">actual fraction</text>
  <g font-size="10" class="dgm-muted">
    <text x="70" y="316" text-anchor="middle">0</text>
    <text x="190" y="316" text-anchor="middle">0.5</text>
    <text x="310" y="316" text-anchor="middle">1</text>
    <text x="58" y="304" text-anchor="middle">0</text>
    <text x="52" y="184" text-anchor="middle">0.5</text>
    <text x="58" y="64" text-anchor="middle">1</text>
  </g>
  <g class="dgm-accent-2">
    <line x1="70" y1="300" x2="310" y2="60" stroke="currentColor" stroke-width="1.4" stroke-dasharray="6 4"/>
  </g>
  <text x="258" y="92" text-anchor="middle" font-size="10" class="dgm-accent-2">perfect: y = x</text>
  <g class="dgm-accent">
    <polyline points="94,288 142,257 190,209 238,168 286,113" fill="none" stroke="currentColor" stroke-width="1.8"/>
    <circle cx="94" cy="288" r="3.2" fill="currentColor"/>
    <circle cx="142" cy="257" r="3.2" fill="currentColor"/>
    <circle cx="190" cy="209" r="3.2" fill="currentColor"/>
    <circle cx="238" cy="168" r="3.2" fill="currentColor"/>
    <circle cx="286" cy="113" r="3.2" fill="currentColor"/>
  </g>
  <text x="300" y="132" text-anchor="middle" font-size="10" class="dgm-accent">model</text>
  <text x="214" y="252" text-anchor="middle" font-size="10" class="dgm-muted">below &#8594; overconfident</text>
</svg>
<figcaption><b>Reliability diagram.</b> Predictions are binned and plotted as predicted probability versus the actual positive rate; the dashed 45&#176; line is perfect calibration, and a curve sagging beneath it marks an overconfident model.</figcaption>
</figure>

```python
from sklearn.calibration import calibration_curve
prob_true, prob_pred = calibration_curve(y_test, test_probs, n_bins=5)
# prob_true: actual fraction of positives per bin
# prob_pred: mean predicted probability per bin
```

The bin count is itself a judgment call. Too few bins hide local distortions; too many
leave each bin with so few samples that the observed frequency becomes noisy. The
diagram is diagnostic, not decisive — it shows *where* a model lies about its confidence,
but it does not, on its own, give a single number to optimize.

## Scoring Honesty: The Brier Score

For that single number, calibration uses the **Brier score**, the mean squared error
between the predicted probability and the actual $0/1$ outcome:

$$
BS = \frac{1}{n}\sum_{i=1}^{n}\left(\hat{p}_i - y_i\right)^2
$$

If the truth is $y_i = 1$ and the model said $0.9$, it pays a small penalty of $0.01$;
if it confidently said $0.1$, it pays a heavy $0.81$. Because it squares the gap, the
Brier score punishes confident mistakes far more than tentative ones, rewarding a model
that is both correct *and* honest about how correct it is. Lower is better, and it makes
competing calibration methods directly comparable.

## Two Ways to Fix a Liar

Once miscalibration is measured, two standard methods repair it — both learning a
mapping from the classifier's raw scores to better probabilities.

**Platt scaling** is the parametric option. It fits a one-dimensional logistic
regression whose single input feature is the classifier's own prediction, squashing
scores through a sigmoid:

$$
\hat{q} = \sigma(a\,\hat{p} + b) = \frac{1}{1 + e^{-(a\hat{p} + b)}}
$$

With only two parameters, $a$ and $b$, it is stable and works well on small validation
sets, but its S-shaped form assumes the miscalibration follows that shape.

**Isotonic regression** is the non-parametric option. It fits any monotonic,
non-decreasing function from scores to probabilities — the order of predictions is
preserved, but their values are freely reshaped to match observed frequencies. That
flexibility lets it correct the more complex distortions of powerful classifiers, at
the price of needing more data; on a small validation set it will happily overfit.

## The Calibration Workflow

Calibration must be learned on data the base model did not train on, or it will simply
memorize the training set's optimism. The discipline is a clean three-way split: fit the
classifier on the training set, learn the probability mapping on a separate validation
set, and report the reliability diagram and Brier score on a held-out test set.
scikit-learn packages exactly this pattern for an already-trained ("prefit") model:

```python
rf = RandomForestClassifier().fit(X_train, y_train)

cal_sig = CalibratedClassifierCV(rf, cv="prefit", method="sigmoid")   # Platt
cal_sig.fit(X_val, y_val)

cal_iso = CalibratedClassifierCV(rf, cv="prefit", method="isotonic")  # isotonic
cal_iso.fit(X_val, y_val)

probs = cal_iso.predict_proba(X_test)[:, 1]
```

A random forest is a natural example: averaging many trees pulls its probabilities
toward the middle of the range, and a calibration step straightens the reliability curve
back onto the diagonal without touching the model's underlying accuracy.

## Why It Matters

Accuracy answers *whether* a model is right; calibration answers whether you can believe
*how sure* it says it is — and that second question is the one that matters wherever a
probability drives a decision. A medical triage model that says 30% must be right about
30% of the time, or clinicians will mis-weigh the risk. A fraud score, a credit
probability, a weather forecast: each is only as trustworthy as its calibration. The
methods are refreshingly simple — bin, score with Brier, and remap with Platt scaling or
isotonic regression — but they turn a model that merely ranks cases into one that speaks
in probabilities the world can actually act on.
