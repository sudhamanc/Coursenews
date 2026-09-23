---
course: bedrock
lectureId: AIMA 19
book: "Artificial Intelligence: A Modern Approach"
part: "V · Machine Learning"
title: "Fitting the Signal and Not the Noise"
deck: "Chapter 19 states the problem every learning system faces — that agreeing with the data you have is not the objective — and then supplies the theory saying how much data buys how much confidence, and the engineering practice that most projects actually fail on."
order: 19
chapter: 19
readingTime: 15
tags: ["supervised-learning", "overfitting", "regularization", "ensembles", "pac-learning"]
concepts:
  - id: inductive-learning
    term: The Inductive Learning Problem
    definition: "Given examples of an unknown function f, return a hypothesis h approximating it. Success is measured on unseen data, so the goal is generalization rather than agreement with the training set."
  - id: bias-variance
    term: The Bias–Variance Trade-off
    definition: "Error decomposes into bias, from a hypothesis space too restricted to represent the truth, and variance, from sensitivity to the particular sample. Reducing one typically raises the other, and the optimum is a deliberate compromise."
  - id: ockham
    term: Ockham's Razor
    definition: "Prefer the simplest hypothesis consistent with the data. Justified because simpler hypothesis spaces are smaller, so a fit found within one is less likely to be coincidental — a statement about counting, not about elegance."
  - id: decision-trees
    term: Decision Trees and Information Gain
    definition: "Recursive partitioning that chooses the attribute maximizing information gain — the expected reduction in entropy. Greedy, interpretable, prone to overfitting, and controlled by pruning with a significance test."
  - id: model-selection
    term: Model Selection and Validation
    definition: "Choosing hyperparameters using held-out or cross-validated data, never the test set. The test set is consumed the moment it influences a decision, and k-fold cross-validation reuses data without leakage."
  - id: regularization
    term: Loss Functions and Regularization
    definition: "The optimization target is empirical loss plus a complexity penalty. L1 penalties drive weights to exactly zero and select features; L2 shrinks them smoothly. The choice of loss encodes what kind of error is unacceptable."
  - id: pac-learning
    term: PAC Learning
    definition: "Computational learning theory's guarantee: with sample size polynomial in 1/ε, 1/δ, and hypothesis-space complexity, a consistent learner is probably (1−δ) approximately (error ≤ ε) correct. It bounds sample complexity from hypothesis-space size alone."
  - id: ensembles
    term: Ensemble Methods
    definition: "Combining hypotheses to beat any single one. Bagging reduces variance by averaging models trained on resamples; boosting reduces bias by sequentially reweighting misclassified examples; random forests decorrelate trees by sampling features too."
---

The first thing Chapter 19 establishes is that the obvious objective is the wrong
one. A learning algorithm is given examples of an unknown function and returns a
hypothesis, and the temptation is to judge the hypothesis by how well it agrees
with the examples. But agreement with data already in hand is trivially
achievable — memorize it — and worthless. The target is **generalization**:
performance on inputs the learner has never seen.

Everything else in the chapter follows from taking that seriously.

## Why Generalization Is Not Automatic

The **bias–variance trade-off** is the formal statement of the difficulty. Error
decomposes into two sources. **Bias** is the error from a hypothesis space too
restricted to represent the truth — a linear model on a curved relationship is
wrong no matter how much data arrives. **Variance** is the error from sensitivity
to the particular sample — a flexible model fits the noise in this dataset, and
would fit different noise differently in another.

Reducing one generally increases the other, and the best model is a deliberate
compromise rather than the most powerful one available. This is the single
concept from the chapter most worth internalizing, because it explains why
adding capacity stops helping and starts hurting.

**Ockham's razor** — prefer the simplest hypothesis consistent with the data —
gets a justification here that is better than the usual appeal to elegance.
Simpler hypothesis spaces are *smaller*. A fit found inside a small space is less
likely to be coincidental than one found in a vast space, because there were
fewer chances to get lucky. That is a counting argument, and it is what the
learning theory later in the chapter formalizes.

## Decision Trees

Decision trees are the chapter's first concrete learner, chosen because every
step is inspectable. Learning proceeds greedily: at each node, choose the
attribute that best splits the remaining examples, and recurse.

"Best" is defined by **information gain**. The entropy of a set of examples with
class probabilities $p_i$ is

$$H = -\sum_i p_i \log_2 p_i$$

and the gain from an attribute is the entropy before the split minus the weighted
average entropy of the resulting subsets — the expected reduction in uncertainty
about the class. The chapter notes the standard correction: raw information gain
favors high-cardinality attributes, since splitting on a unique identifier
produces pure subsets and explains nothing, so a gain *ratio* normalizes for the
number of branches.

Left to itself the tree grows until every leaf is pure, which is overfitting by
construction. **Pruning** removes splits that fail a statistical significance
test — where the observed improvement is consistent with what chance would
produce. The chapter's preference for pruning a grown tree over stopping early is
well-founded: an attribute that looks useless alone may be valuable in
combination with another, and early stopping never discovers that.

Trees handle missing values, mixed attribute types, and multiclass problems
naturally, and they are readable, which is why they persist despite being
outperformed.

## Doing It Properly

The **model selection** section describes the discipline that separates real
evaluation from self-deception, and its central rule is stated plainly: any data
used to make a decision about the model is no longer test data.

The proper structure is a **training set** for fitting parameters, a
**validation set** for choosing hyperparameters and model class, and a **test
set** touched once, at the end. **k-fold cross-validation** reuses data
efficiently by rotating which fold is held out, with leave-one-out as the
extreme. The warning about **peeking** is emphatic and deserves to be: a test set
consulted repeatedly during development has been optimized against, and the
number it reports is no longer an estimate of generalization.

The chapter also separates **error rate** from **loss**, and the distinction
matters more in deployment than in benchmarks. Misclassifications are not
interchangeable — classifying legitimate mail as spam costs more than the
reverse — so the optimization target should be the expected loss under a loss
function reflecting actual costs. The standard choices ($L_1$, $L_2$, 0/1) are
conveniences, not neutral defaults.

**Regularization** makes the complexity penalty explicit:

$$\textit{Cost}(h) = \textit{EmpiricalLoss}(h) + \lambda \cdot \textit{Complexity}(h)$$

$L_1$ penalties drive weights to exactly zero, performing feature selection;
$L_2$ shrinks them smoothly. The chapter connects this to the **minimum
description length** principle: minimizing the bits needed to describe the
hypothesis *plus* the bits to describe the data given the hypothesis is
regularization derived from information theory.

## How Much Data Is Enough

Computational learning theory turns the counting argument into a bound. The
**PAC** framework asks: how many examples guarantee that a hypothesis consistent
with them is *probably* (with probability $1-\delta$) *approximately correct*
(error at most $\epsilon$)?

For a finite hypothesis space $\mathcal{H}$,

$$N \ge \frac{1}{\epsilon}\left(\ln\frac{1}{\delta} + \ln|\mathcal{H}|\right)$$

The structure of this result is what matters. Sample complexity grows with the
*logarithm* of the hypothesis space size, so even enormous spaces are learnable
with reasonable data — but it grows, so unrestricted spaces are not learnable at
all. This is the **no free lunch** situation made quantitative: learning requires
a restricted hypothesis space, which is to say an inductive bias, and the bias is
what makes generalization possible rather than what compromises it. **VC
dimension** extends the analysis to infinite hypothesis spaces by measuring
capacity as the largest set of points the space can shatter.

## Linear Models

**Linear regression** minimizes squared error, has a closed-form solution, and is
usually fit by gradient descent at scale. The chapter presents the update rule
and connects it back to Chapter 4's continuous optimization, which is the right
framing — learning *is* optimization, and the landscape pathologies from that
chapter apply.

**Linear classification** uses a decision boundary; the perceptron rule converges
if the data is linearly separable and oscillates if it is not. **Logistic
regression** replaces the hard threshold with the logistic function

$$\sigma(z) = \frac{1}{1 + e^{-z}}$$

producing calibrated probabilities and a differentiable, well-behaved objective —
which is why it is the classifier of choice when the output must be a probability
rather than a label.

## Nonparametric and Ensemble Methods

**Nonparametric** models let the hypothesis grow with the data. **k-nearest
neighbors** classifies by local vote, and the chapter's treatment of the **curse
of dimensionality** is the essential part: in high dimensions, all points are
approximately equidistant, so "nearest" stops meaning anything and local methods
degrade. **Kernel methods** and **support vector machines** find the
maximum-margin separator, use only the **support vectors** that define it, and
apply the **kernel trick** to operate in a high-dimensional implicit feature
space without ever forming the coordinates.

**Ensembles** are the chapter's most reliable practical result.

<figure>
<svg viewBox="0 0 840 250" role="img" aria-label="Bagging trains models in parallel on resampled datasets and averages them to reduce variance, while boosting trains models sequentially with each one reweighting the examples the previous one got wrong, reducing bias.">
  <defs>
    <marker id="arw-aima19-ens" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" class="dgm-fill"/>
    </marker>
  </defs>
  <text x="200" y="26" text-anchor="middle" font-size="12" font-weight="700">BAGGING · parallel</text>
  <rect x="40" y="46" width="70" height="30" fill="none" stroke="currentColor" stroke-width="1.4"/>
  <text x="75" y="66" text-anchor="middle" font-size="10">data</text>
  <rect x="160" y="42" width="60" height="26" fill="none" stroke="currentColor" stroke-width="1.4"/>
  <rect x="160" y="76" width="60" height="26" fill="none" stroke="currentColor" stroke-width="1.4"/>
  <rect x="160" y="110" width="60" height="26" fill="none" stroke="currentColor" stroke-width="1.4"/>
  <line x1="112" y1="60" x2="156" y2="54" stroke="currentColor" stroke-width="1.2" marker-end="url(#arw-aima19-ens)"/>
  <line x1="112" y1="62" x2="156" y2="88" stroke="currentColor" stroke-width="1.2" marker-end="url(#arw-aima19-ens)"/>
  <line x1="112" y1="64" x2="156" y2="122" stroke="currentColor" stroke-width="1.2" marker-end="url(#arw-aima19-ens)"/>
  <text x="190" y="152" text-anchor="middle" font-size="9.5" class="dgm-muted">resamples</text>
  <g class="dgm-accent-2">
    <rect x="266" y="62" width="76" height="52" fill="none" stroke="currentColor" stroke-width="1.6"/>
    <text x="304" y="84" text-anchor="middle" font-size="10.5" font-weight="700">average</text>
    <text x="304" y="102" text-anchor="middle" font-size="10">↓ variance</text>
  </g>
  <line x1="224" y1="55" x2="262" y2="76" stroke="currentColor" stroke-width="1.2" marker-end="url(#arw-aima19-ens)"/>
  <line x1="224" y1="89" x2="262" y2="89" stroke="currentColor" stroke-width="1.2" marker-end="url(#arw-aima19-ens)"/>
  <line x1="224" y1="123" x2="262" y2="102" stroke="currentColor" stroke-width="1.2" marker-end="url(#arw-aima19-ens)"/>
  <text x="200" y="196" text-anchor="middle" font-size="10.5" class="dgm-muted">models never see each other</text>
  <text x="200" y="216" text-anchor="middle" font-size="10.5" class="dgm-muted">random forests also sample features</text>
  <line x1="420" y1="34" x2="420" y2="226" stroke="currentColor" stroke-width="1" stroke-dasharray="4 4" class="dgm-muted"/>
  <g class="dgm-accent">
    <text x="630" y="26" text-anchor="middle" font-size="12" font-weight="700">BOOSTING · sequential</text>
  </g>
  <rect x="470" y="62" width="76" height="40" fill="none" stroke="currentColor" stroke-width="1.4"/>
  <text x="508" y="86" text-anchor="middle" font-size="10">h₁</text>
  <rect x="592" y="62" width="76" height="40" fill="none" stroke="currentColor" stroke-width="1.4"/>
  <text x="630" y="86" text-anchor="middle" font-size="10">h₂</text>
  <rect x="714" y="62" width="76" height="40" fill="none" stroke="currentColor" stroke-width="1.4"/>
  <text x="752" y="86" text-anchor="middle" font-size="10">h₃</text>
  <g class="dgm-accent">
    <line x1="550" y1="82" x2="588" y2="82" stroke="currentColor" stroke-width="1.7" marker-end="url(#arw-aima19-ens)"/>
    <line x1="672" y1="82" x2="710" y2="82" stroke="currentColor" stroke-width="1.7" marker-end="url(#arw-aima19-ens)"/>
  </g>
  <text x="569" y="124" text-anchor="middle" font-size="9.5" class="dgm-muted">reweight</text>
  <text x="691" y="124" text-anchor="middle" font-size="9.5" class="dgm-muted">reweight</text>
  <text x="630" y="164" text-anchor="middle" font-size="10.5" class="dgm-muted">each model concentrates on what the</text>
  <text x="630" y="182" text-anchor="middle" font-size="10.5" class="dgm-muted">previous one got wrong</text>
  <text x="630" y="206" text-anchor="middle" font-size="10.5" font-weight="700">↓ bias</text>
  <text x="630" y="228" text-anchor="middle" font-size="10" class="dgm-muted">weak learners suffice, and test error often</text>
  <text x="630" y="244" text-anchor="middle" font-size="10" class="dgm-muted">keeps falling after training error hits zero</text>
</svg>
<figcaption><b>Two ways to combine, attacking different halves of the error.</b> Bagging averages away variance; boosting chips away at bias by making each model specialize in the previous one's failures.</figcaption>
</figure>

**Bagging** trains models on bootstrap resamples and averages, reducing variance.
**Random forests** add feature subsampling at each split to decorrelate the
trees, which makes the averaging more effective. **Boosting** — AdaBoost and its
gradient-boosted descendants — trains models sequentially, reweighting
misclassified examples so each learner focuses on the previous one's failures,
reducing bias. The chapter notes the striking empirical observation that boosting
test error often continues to fall after training error reaches zero, explained
by continuing increases in the classification margin.

**Stacking** trains a meta-model on base models' outputs. And the theoretical
result underneath all of it — that a **weak learner** only slightly better than
chance can be boosted to arbitrary accuracy — is one of the more surprising
results in learning theory.

## Building Systems

The final section is the one most often skipped and most often needed. Its claims
are that problem formulation and data quality dominate algorithm choice; that
data cleaning, outlier detection, and dealing with missing values consume most of
the effort; that feature engineering often matters more than model class; that
one should establish a baseline before anything sophisticated; and that
deployment introduces **distribution shift**, so a model must be monitored rather
than merely shipped.

The chapter is also explicit that the training data encodes historical bias,
that an accurate model of a biased process faithfully reproduces the bias, and
that this is not fixable by improving accuracy.

## Why It Matters

This chapter contains the concepts that make the rest of machine learning
intelligible. Bias–variance explains why bigger is not always better;
regularization is how capacity is controlled; validation discipline is what
separates a real result from a reported one; and PAC learning explains why
inductive bias is necessary rather than regrettable.

Every one of these transfers directly to deep learning, where the vocabulary
changes and the concepts do not. And the chapter's closing advice is the part
most likely to determine whether a project succeeds: the failures that matter are
usually in the data and the problem framing, not in the choice of estimator.
