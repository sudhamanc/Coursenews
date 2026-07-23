---
course: applied-ml-data-science
lectureId: L03
title: "When Accuracy Lies"
deck: "Regularization tames runaway models, logistic regression turns scores into probabilities, and a hard look at precision, recall, and data leakage explains why a 95-percent-accurate classifier can still be worthless."
order: 3
date: 2025-03-24
readingTime: 9
tags: ["regularization", "logistic-regression", "classification", "precision-recall", "data-leakage"]
concepts:
  - id: regularization
    term: Regularization
    definition: "Adding a penalty on parameter size to the cost function to control complexity; L2 (Ridge) shrinks weights, L1 (Lasso) drives some to zero for feature selection, and Elastic Net blends both."
  - id: logistic-regression
    term: Logistic Regression
    definition: "A classifier that passes a linear score through the sigmoid function to output a class probability, trained by minimizing the convex log-loss."
  - id: softmax-regression
    term: Softmax Regression
    definition: "The multinomial generalization of logistic regression that scores each of K classes and normalizes the scores into a probability distribution."
  - id: precision-recall
    term: Precision and Recall
    definition: "Precision is the fraction of predicted positives that are correct; recall (sensitivity) is the fraction of actual positives that are caught; the F1 score is their harmonic mean."
  - id: roc-auc
    term: ROC Curve and AUC
    definition: "A curve of true-positive rate against false-positive rate as the decision threshold sweeps, summarized by the area under the curve — 1.0 for a perfect ranker, 0.5 for chance."
  - id: multiclass-strategies
    term: Multiclass Strategies
    definition: "Turning binary classifiers into multiclass ones by training one detector per class (one-versus-rest) or one per pair of classes (one-versus-one)."
  - id: data-leakage
    term: Data Leakage
    definition: "When information about the target that would be unavailable at prediction time slips into training, producing inflated scores that collapse on real-world data."
---

A classifier that is right ninety-five percent of the time sounds like a triumph
— until you learn that nine of every ten images were never the target to begin
with, or that the model quietly saw the answer during training. This lecture is
about honesty: constraining models so they generalize, converting their raw
scores into calibrated probabilities, and — above all — measuring them with
metrics that cannot be gamed by an unbalanced dataset or sabotaged by leaked
information.

## Taming Complexity with a Penalty

Left unchecked, a flexible model will drive its coefficients to whatever extreme
fits the training noise. **Regularization** curbs this by adding a penalty on the
size of the parameters $\theta_j$ to the cost function, trading a little fit for a
lot of stability. It shines when many features each contribute a little, and it
fights overfitting by shrinking — or eliminating — coefficients.

**Ridge regression** adds an L2 penalty, the sum of squared weights:

$$
J(\theta) = \text{MSE}(\theta) + \alpha\,\tfrac{1}{2}\sum_{j=1}^{n}\theta_j^2 .
$$

**Lasso regression** adds an L1 penalty, the sum of absolute weights:

$$
J(\theta) = \text{MSE}(\theta) + \alpha\sum_{j=1}^{n}\lvert\theta_j\rvert .
$$

The geometric difference matters: L1 drives some weights exactly to zero, so
Lasso performs automatic feature selection, while L2 merely shrinks them.
**Elastic Net** blends the two with a mix ratio $r$ ($r = 0$ is pure Ridge,
$r = 1$ pure Lasso):

$$
J(\theta) = \text{MSE}(\theta)
          + r\alpha\sum_{j}\lvert\theta_j\rvert
          + \tfrac{1-r}{2}\,\alpha\sum_{j}\theta_j^2 .
$$

The tuning parameter $\alpha$ sets the strength: at $\alpha = 0$ the model reduces
to ordinary least squares; as $\alpha$ grows the weights collapse toward zero and
the model simplifies. Because the penalty is measured in the units of the
features, **regularized models demand scaled inputs**. A rule of thumb: a few
strong features favor Lasso or Elastic Net; many weak ones favor Ridge.

## From Lines to Probabilities

Regression predicts numbers; classification predicts membership. **Logistic
regression** bridges them by squashing a linear score through the logistic
(sigmoid) function:

$$
\hat{p} = \sigma(\theta^{\top} x), \qquad \sigma(t) = \frac{1}{1 + e^{-t}},
$$

turning any real number into a probability in $(0, 1)$. The **decision boundary**
falls where that probability crosses one-half — equivalently, where
$\theta^{\top} x = 0$. Training minimizes the log-loss:

$$
J(\theta) = -\frac{1}{m}\sum_{i=1}^{m}
\Big[\, y^{(i)}\log \hat{p}^{(i)} + (1 - y^{(i)})\log(1 - \hat{p}^{(i)}) \,\Big].
$$

This cost is convex, so gradient descent is guaranteed to reach the global
minimum. Logistic regression accepts the same L1, L2, and Elastic Net penalties
as its linear cousin, though scikit-learn parameterizes the strength as
$C = 1/\alpha$ — so a *smaller* $C$ means *heavier* regularization.

<figure>
<svg viewBox="0 0 620 300" role="img" aria-label="The logistic sigmoid curve mapping any real score to a probability between zero and one, crossing one-half at the decision boundary where the linear score is zero.">
  <defs>
    <marker id="arw-sig" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" class="dgm-fill"/>
    </marker>
  </defs>
  <line x1="40" y1="250" x2="600" y2="250" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-sig)"/>
  <line x1="312" y1="262" x2="312" y2="45" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-sig)"/>
  <text x="560" y="272" text-anchor="middle" font-size="12">t</text>
  <text x="312" y="36" text-anchor="middle" font-size="12">σ(t)</text>
  <text x="298" y="66" text-anchor="middle" font-size="10" class="dgm-muted">1</text>
  <text x="286" y="159" text-anchor="middle" font-size="10" class="dgm-muted">0.5</text>
  <text x="300" y="248" text-anchor="middle" font-size="10" class="dgm-muted">0</text>
  <line x1="60" y1="62" x2="560" y2="62" stroke="currentColor" stroke-width="1" stroke-dasharray="4 4" class="dgm-muted"/>
  <path d="M50,248 C305,248 320,62 575,62" fill="none" stroke="currentColor" stroke-width="2"/>
  <g class="dgm-accent">
    <line x1="60" y1="155" x2="560" y2="155" stroke="currentColor" stroke-width="1.5" stroke-dasharray="5 4"/>
    <circle cx="312" cy="155" r="5" class="dgm-fill"/>
    <text x="445" y="142" text-anchor="middle" font-size="11">decision boundary (p = 0.5)</text>
  </g>
  <text x="332" y="244" text-anchor="middle" font-size="10" class="dgm-muted">t = 0</text>
</svg>
<figcaption><b>The logistic function</b> The sigmoid squashes the linear score t into a probability in (0, 1); the predicted class flips where the curve crosses one-half, at t = 0.</figcaption>
</figure>

## Choosing Among Many

For more than two classes, **softmax (multinomial) regression** computes a score
$s_k(x) = \theta_k^{\top} x$ per class and normalizes them into a distribution:

$$
\hat{p}_k = \frac{e^{s_k(x)}}{\sum_{j=1}^{K} e^{s_j(x)}} .
$$

Alternatively, binary classifiers can be stacked into **multiclass strategies**.
*One-versus-rest* trains one detector per class — ten classifiers for the ten
MNIST digits — while *one-versus-one* trains a classifier for every pair,
forty-five for ten digits, each seeing only the data for its two classes.
Scikit-learn picks a sensible default but lets you force either scheme.

## Why Accuracy Lies

On the MNIST task of recognizing the digit five, a classifier that simply answers
"not five" every time scores about ninety-one percent accuracy — because only
about one image in ten *is* a five. Accuracy is a treacherous measure on skewed
datasets. The **confusion matrix**, which tabulates true and false positives and
negatives, is the honest starting point. From it come two sharper measures:

<figure>
<svg viewBox="0 0 500 312" role="img" aria-label="A two-by-two confusion matrix with predicted class across the top and actual class down the side, highlighting the true-positive cell.">
  <text x="290" y="30" text-anchor="middle" font-size="13" font-weight="700">Predicted</text>
  <text x="220" y="62" text-anchor="middle" font-size="11">Positive</text>
  <text x="360" y="62" text-anchor="middle" font-size="11">Negative</text>
  <text x="46" y="190" text-anchor="middle" font-size="13" font-weight="700" transform="rotate(-90 46 190)">Actual</text>
  <text x="112" y="140" text-anchor="middle" font-size="11">Positive</text>
  <text x="112" y="250" text-anchor="middle" font-size="11">Negative</text>
  <g class="dgm-accent">
    <rect x="150" y="80" width="140" height="110" class="dgm-soft" stroke="currentColor" stroke-width="1.5"/>
    <text x="220" y="130" text-anchor="middle" font-size="20" font-weight="700">TP</text>
    <text x="220" y="152" text-anchor="middle" font-size="10">true positive</text>
  </g>
  <rect x="290" y="80" width="140" height="110" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="360" y="130" text-anchor="middle" font-size="20" font-weight="700">FN</text>
  <text x="360" y="152" text-anchor="middle" font-size="10" class="dgm-muted">false negative</text>
  <rect x="150" y="190" width="140" height="110" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="220" y="240" text-anchor="middle" font-size="20" font-weight="700">FP</text>
  <text x="220" y="262" text-anchor="middle" font-size="10" class="dgm-muted">false positive</text>
  <rect x="290" y="190" width="140" height="110" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="360" y="240" text-anchor="middle" font-size="20" font-weight="700">TN</text>
  <text x="360" y="262" text-anchor="middle" font-size="10">true negative</text>
</svg>
<figcaption><b>The confusion matrix</b> Precision reads down the predicted-positive column (TP vs. FP); recall reads across the actual-positive row (TP vs. FN).</figcaption>
</figure>

$$
\text{Precision} = \frac{TP}{TP + FP}, \qquad
\text{Recall} = \frac{TP}{TP + FN}.
$$

**Precision** asks how many of the flagged positives were real; **recall**
(sensitivity, the true-positive rate) asks how many of the real positives were
caught. Their harmonic mean, the **F1 score**,
$F_1 = 2\cdot\frac{\text{precision}\cdot\text{recall}}{\text{precision} + \text{recall}}$,
rewards a model only when both are high.

## Tuning the Threshold

Precision and recall are locked in tension. A classifier scores each instance and
compares it to a threshold; raising the threshold makes it pickier — precision
rises, recall falls — while lowering it does the reverse. Which way to lean is a
domain question: a search-suggestion engine prizes precision, while a tumor
detector or a child-safety filter prizes recall, because a missed positive is far
costlier than a false alarm.

Sweeping the threshold traces the **ROC curve**, a plot of the true-positive rate
against the false-positive rate, $\text{FPR} = \frac{FP}{FP + TN} = 1 -
\text{specificity}$. The **area under the curve (AUC)** distills the whole curve
into one number — 1.0 for a perfect ranker, 0.5 for a coin flip.

<figure>
<svg viewBox="0 0 440 384" role="img" aria-label="An ROC curve bowing toward the top-left corner above the diagonal chance line, with the area under the curve shaded to represent AUC.">
  <defs>
    <marker id="arw-roc" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" class="dgm-fill"/>
    </marker>
  </defs>
  <line x1="60" y1="330" x2="60" y2="50" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-roc)"/>
  <line x1="60" y1="330" x2="410" y2="330" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-roc)"/>
  <path d="M60,330 C95,150 185,80 360,70 L360,330 Z" class="dgm-soft"/>
  <line x1="60" y1="330" x2="360" y2="70" stroke="currentColor" stroke-width="1" stroke-dasharray="5 4" class="dgm-muted"/>
  <g class="dgm-accent">
    <path d="M60,330 C95,150 185,80 360,70" fill="none" stroke="currentColor" stroke-width="2"/>
    <text x="195" y="118" text-anchor="middle" font-size="12">ROC curve</text>
  </g>
  <text x="300" y="150" text-anchor="middle" font-size="10" class="dgm-muted">chance</text>
  <text x="235" y="285" text-anchor="middle" font-size="11" class="dgm-muted">AUC</text>
  <text x="210" y="366" text-anchor="middle" font-size="12">False Positive Rate</text>
  <text x="28" y="200" text-anchor="middle" font-size="12" transform="rotate(-90 28 200)">True Positive Rate</text>
  <text x="54" y="346" text-anchor="middle" font-size="10" class="dgm-muted">0</text>
  <text x="360" y="348" text-anchor="middle" font-size="10" class="dgm-muted">1</text>
  <text x="46" y="74" text-anchor="middle" font-size="10" class="dgm-muted">1</text>
</svg>
<figcaption><b>The ROC curve</b> Sweeping the threshold traces true-positive rate against false-positive rate; the more the curve bows above the diagonal, the larger the AUC and the better the ranker.</figcaption>
</figure>

```python
from sklearn.metrics import precision_score, recall_score, f1_score, roc_auc_score
precision_score(y_true, y_pred)
recall_score(y_true, y_pred)
f1_score(y_true, y_pred)
roc_auc_score(y_true, y_scores)   # ranking quality, threshold-free
```

## The Silent Saboteur

The most dangerous failure is not a low score but a suspiciously high one. **Data
leakage** occurs when information about the target sneaks into training that would
not be available at prediction time. Classic traps: including the label itself as
a feature, letting test data bleed into training, or engineering a feature from
the future — total session length when predicting whether a user will leave, an
account field when predicting whether one will be opened, a record of surgery
when predicting the very condition that surgery treated. Each is wildly
predictive in the lab and utterly useless in production.

Leakage is caught by suspicion and hygiene. Before modeling, exploratory analysis
should flag features suspiciously correlated with the target; during modeling,
features with outsized weights deserve scrutiny. The structural fix is to perform
every data-preparation step — scaling, encoding, feature selection, outlier
removal, dimensionality reduction — **inside each cross-validation fold** rather
than once on the full dataset, so the validation fold stays genuinely unseen. A
held-out test set, a timestamp cutoff for time-series data, and a final variable
audit are the last lines of defense.

## Why It Matters

Regularization, logistic regression, and the metrics of classification are the
everyday tools of applied machine learning, but the lecture's deeper lesson is
skepticism. A model's reported accuracy is only as trustworthy as the data
discipline behind it. Knowing that L1 selects features and L2 shrinks them, that
logistic regression's convex loss guarantees a clean optimum, that precision and
recall trade off along a threshold, and that a too-good score usually signals
leakage — this is what lets a practitioner tell a genuine result from a mirage.
