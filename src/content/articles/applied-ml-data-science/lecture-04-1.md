---
course: applied-ml-data-science
lectureId: L04
title: "The Widest Street in the Data"
deck: "Support vector machines carve the largest possible gap between classes — but neighbors, naïve probabilities, and ruthless feature pruning each stake their own claim on the classical classifier's toolkit."
order: 4
date: 2025-03-24
readingTime: 8
tags: ["svm", "knn", "naive-bayes", "feature-selection", "classification"]
concepts:
  - id: maximal-margin
    term: "Maximal-Margin Classifier"
    definition: "A support vector machine chooses the separating hyperplane that maximizes the margin — twice the distance from the boundary to the nearest training example — which is equivalent to minimizing the norm of the weight vector."
  - id: soft-margin
    term: "Soft Margin & Slack Variables"
    definition: "A relaxation of the hard-margin SVM that permits some misclassification via slack variables, trading margin width against violations through the penalty hyperparameter C."
  - id: kernel-trick
    term: "The Kernel Trick"
    definition: "A method for fitting nonlinear boundaries by implicitly computing dot products in a higher-dimensional feature space, using kernels such as the polynomial or Gaussian RBF without ever forming the coordinates explicitly."
  - id: k-nearest-neighbors
    term: "K-Nearest Neighbors"
    definition: "A lazy, instance-based classifier that labels a new point by the majority vote of its k closest stored examples under a chosen distance metric."
  - id: naive-bayes
    term: "Naïve Bayes"
    definition: "A probabilistic classifier that applies Bayes' rule under the simplifying assumption that features are conditionally independent given the class."
  - id: feature-selection
    term: "Feature Selection"
    definition: "The practice of reducing a model to an informative subset of features to curb overfitting and leakage, speed prediction, and improve interpretability."
---

Give a machine a scatter of labeled points and ask it to separate them, and you
have posed one of the oldest questions in pattern recognition. A dozen straight
lines might divide the two classes without a single mistake — so which line is
*best*? The answer a support vector machine gives is deceptively simple: the one
that leaves the widest street. That instinct — commit to the boldest, most
defensible boundary, and be honest about what the data can and cannot support —
runs through the whole classical classifier toolkit, from margins to neighbors
to naïve probabilities.

## The Widest Street Between Two Classes

For a linearly separable dataset, infinitely many hyperplanes will split the
classes cleanly. The support vector machine breaks the tie by asking which one
sits farthest from the data. Its decision function is linear,
$\mathbf{w}^{\top}\mathbf{x} + b$, and the closest positive and negative examples
— the *support vectors* — are pinned to the lines
$\mathbf{w}^{\top}\mathbf{x} + b = +1$ and $\mathbf{w}^{\top}\mathbf{x} + b = -1$.
The gap between those lines works out to $\tfrac{2}{\lVert\mathbf{w}\rVert}$, so
widening the margin is the same as shrinking the weight vector. The hard-margin
objective is therefore

$$
\min_{\mathbf{w}, b}\; \tfrac{1}{2}\lVert\mathbf{w}\rVert^{2}
\quad\text{subject to}\quad
y_i\!\left(\mathbf{w}^{\top}\mathbf{x}_i + b\right) \ge 1,\; i = 1,\dots,m.
$$

This pristine version only works when the classes truly separate, and a single
outlier can drag the whole boundary with it.

<figure>
<svg viewBox="0 0 620 330" role="img" aria-label="A support vector machine separating two classes of scattered points with a straight hyperplane; two parallel dashed margin lines form the widest street, and the closest point on each margin is circled as a support vector.">
  <defs>
    <marker id="arw-svm" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" class="dgm-fill"/>
    </marker>
  </defs>
  <polygon points="55,300 445,70 555,70 165,300" class="dgm-soft"/>
  <g class="dgm-muted">
    <line x1="40" y1="312" x2="600" y2="312" stroke="currentColor" stroke-width="1.5"/>
    <line x1="40" y1="312" x2="40" y2="30" stroke="currentColor" stroke-width="1.5"/>
  </g>
  <line x1="110" y1="300" x2="500" y2="70" stroke="currentColor" stroke-width="1.5"/>
  <text x="540" y="60" text-anchor="middle" font-size="12" class="dgm-muted">wᵀx + b = 0</text>
  <g class="dgm-accent">
    <line x1="55" y1="300" x2="445" y2="70" stroke="currentColor" stroke-width="1.5" stroke-dasharray="5 4"/>
    <line x1="165" y1="300" x2="555" y2="70" stroke="currentColor" stroke-width="1.5" stroke-dasharray="5 4"/>
  </g>
  <line x1="205" y1="212" x2="314" y2="212" stroke="currentColor" stroke-width="1.5" marker-start="url(#arw-svm)" marker-end="url(#arw-svm)"/>
  <text x="259" y="204" text-anchor="middle" font-size="11" class="dgm-muted">margin</text>
  <g>
    <rect x="104" y="144" width="12" height="12" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <rect x="144" y="104" width="12" height="12" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <rect x="224" y="114" width="12" height="12" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <rect x="89" y="229" width="12" height="12" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <rect x="169" y="169" width="12" height="12" fill="none" stroke="currentColor" stroke-width="1.5"/>
  </g>
  <g>
    <circle cx="330" cy="295" r="6" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <circle cx="420" cy="250" r="6" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <circle cx="470" cy="180" r="6" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <circle cx="390" cy="290" r="6" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <circle cx="300" cy="285" r="6" fill="none" stroke="currentColor" stroke-width="1.5"/>
  </g>
  <rect x="174" y="220" width="12" height="12" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <rect x="294" y="150" width="12" height="12" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <circle cx="250" cy="250" r="6" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <circle cx="360" cy="185" r="6" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <g class="dgm-accent">
    <circle cx="180" cy="226" r="11" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <circle cx="300" cy="156" r="11" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <circle cx="250" cy="250" r="11" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <circle cx="360" cy="185" r="11" fill="none" stroke="currentColor" stroke-width="1.5"/>
  </g>
  <g class="dgm-muted">
    <line x1="150" y1="209" x2="177" y2="224" stroke="currentColor" stroke-width="1"/>
    <text x="105" y="205" text-anchor="middle" font-size="11">support vectors</text>
  </g>
</svg>
<figcaption><b>The widest street.</b> The support vector machine picks the boundary that maximizes the margin; only the circled support vectors touching the dashed margins decide where it sits.</figcaption>
</figure>

## When the Street Floods: Soft Margins

Vladimir Vapnik's 1993 fix was to let a few points misbehave. Each example gets a
slack variable $\zeta_i \ge 0$ measuring how far it intrudes into — or across —
the margin, and the objective pays for that indulgence:

$$
\min_{\mathbf{w}, b}\; \tfrac{1}{2}\lVert\mathbf{w}\rVert^{2} + C\sum_{i=1}^{m}\zeta_i
\quad\text{subject to}\quad
y_i\!\left(\mathbf{w}^{\top}\mathbf{x}_i + b\right) \ge 1 - \zeta_i.
$$

The hyperparameter `C` is the dial between a wide, forgiving street and a narrow,
strict one — a large `C` punishes violations hard and courts overfitting. The
same idea can be read as minimizing the *hinge loss*
$\ell_{\text{hinge}}\!\left(h(\mathbf{x})\right) = \max\!\left(0,\, 1 - y\cdot h(\mathbf{x})\right)$,
which charges nothing for points safely beyond the margin and a linear penalty
for the rest, as in `LinearSVC(C=1, loss="hinge")`.

## Bending the Boundary: The Kernel Trick

Real data rarely lines up so obligingly. One route is to manufacture nonlinear
features — `PolynomialFeatures(degree=3)` — but the elegant route is the kernel
trick, which computes the needed inner products in a high-dimensional space
without ever materializing the coordinates. A polynomial kernel,
`SVC(kernel="poly", degree=3, coef0=1, C=5)`, curves the boundary; the Gaussian
radial basis function,

$$
K(\mathbf{x}, \mathbf{x}') = \exp\!\left(-\gamma\,\lVert\mathbf{x} - \mathbf{x}'\rVert^{2}\right),
$$

wraps flexible bubbles around clusters. Here `gamma` sets each point's reach —
too high and the model overfits, memorizing islands around individual examples.
`C` and `gamma` are usually tuned together. Kernelized SVMs are versatile and
strong in both high and low dimensions, but they are hard to interpret, slow on
large samples, and sensitive to feature scaling. The same margin idea extends to
regression through `SVR`.

## Classification by a Committee of Neighbors

K-nearest neighbors abandons the search for a boundary altogether. It is a
*lazy*, instance-based method: store the training set, choose a distance metric,
pick $k$, and classify a new point by the majority vote of its $k$ closest
neighbors. The Minkowski distance unifies the common metrics,

$$
d(\mathbf{x}, \mathbf{y}) = \left(\sum_i \lvert x_i - y_i\rvert^{p}\right)^{1/p},
$$

collapsing to Manhattan distance at $p = 1$ and Euclidean at $p = 2$. The choice
of $k$ is a bias–variance dial: at $k = 1$ the boundary is a jagged Voronoi
tessellation with high variance; as $k$ grows the boundary smooths and bias
rises. Votes may be uniform or weighted by proximity ($w = 1/d$). Because the
method reasons purely by distance, features must be scaled — otherwise weight in
kilograms swamps height in meters. KNN trains instantly and can fit intricate
functions, but it is slow at query time and best reserved for problems with fewer
than roughly twenty features.

<figure>
<svg viewBox="0 0 560 340" role="img" aria-label="k-nearest-neighbors classification: a new query point at the center of a dashed circle that encloses its five closest stored examples — three from class A and two from class B — so the majority vote assigns class A.">
  <g class="dgm-muted">
    <circle cx="52" cy="44" r="6" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <text x="98" y="48" text-anchor="middle" font-size="11">class A</text>
    <rect x="46" y="64" width="12" height="12" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <text x="98" y="74" text-anchor="middle" font-size="11">class B</text>
  </g>
  <g class="dgm-muted">
    <line x1="280" y1="180" x2="250" y2="140" stroke="currentColor" stroke-width="1" stroke-dasharray="2 3"/>
    <line x1="280" y1="180" x2="330" y2="150" stroke="currentColor" stroke-width="1" stroke-dasharray="2 3"/>
    <line x1="280" y1="180" x2="300" y2="240" stroke="currentColor" stroke-width="1" stroke-dasharray="2 3"/>
    <line x1="280" y1="180" x2="220" y2="210" stroke="currentColor" stroke-width="1" stroke-dasharray="2 3"/>
    <line x1="280" y1="180" x2="350" y2="220" stroke="currentColor" stroke-width="1" stroke-dasharray="2 3"/>
  </g>
  <g class="dgm-accent">
    <circle cx="280" cy="180" r="90" fill="none" stroke="currentColor" stroke-width="1.5" stroke-dasharray="6 5"/>
    <text x="280" y="80" text-anchor="middle" font-size="12" font-weight="700">k = 5 → class A</text>
  </g>
  <g>
    <circle cx="120" cy="90" r="8" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <circle cx="150" cy="300" r="8" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <circle cx="430" cy="300" r="8" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <circle cx="470" cy="120" r="8" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <circle cx="200" cy="60" r="8" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <rect x="84" y="194" width="12" height="12" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <rect x="114" y="254" width="12" height="12" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <rect x="434" y="174" width="12" height="12" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <rect x="394" y="84" width="12" height="12" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <rect x="464" y="254" width="12" height="12" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <rect x="294" y="294" width="12" height="12" fill="none" stroke="currentColor" stroke-width="1.5"/>
  </g>
  <g>
    <circle cx="250" cy="140" r="8" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <circle cx="330" cy="150" r="8" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <circle cx="300" cy="240" r="8" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <rect x="214" y="204" width="12" height="12" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <rect x="344" y="214" width="12" height="12" fill="none" stroke="currentColor" stroke-width="1.5"/>
  </g>
  <g class="dgm-accent">
    <polygon points="280,166 294,180 280,194 266,180" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <text x="280" y="185" text-anchor="middle" font-size="13" font-weight="700">?</text>
  </g>
  <text x="280" y="216" text-anchor="middle" font-size="11" class="dgm-muted">new point</text>
</svg>
<figcaption><b>Vote of the neighbors.</b> k-nearest neighbors labels the new point by polling its k closest stored examples — here three class-A circles outvote two class-B squares inside the k = 5 circle.</figcaption>
</figure>

## A Naïve but Useful Bet

Naïve Bayes turns classification into probability. Bayes' rule relates the
posterior to the likelihood and prior,

$$
P(y \mid d) = \frac{P(d \mid y)\,P(y)}{P(d)},
$$

and the "naïve" leap is to assume the features are conditionally independent
given the class, so their likelihoods simply multiply. The variant depends on the
data: multinomial for word counts in document classification, Bernoulli for
boolean word-presence flags, and Gaussian for continuous features drawn from a
normal distribution. Raw counts risk assigning zero probability to any unseen
combination, so additive (Laplace) smoothing softens the estimate,

$$
\hat{P}(w_k \mid y) = \frac{N_{w_k, y} + \alpha}{N_y + \alpha\, M_d}.
$$

The independence assumption is rarely realistic, yet the classifier is fast,
thrives in high dimensions, and makes an excellent baseline.

## Cutting Features to the Bone

More features are not always better. Feature selection guards against overfitting
and data leakage, speeds prediction, and makes a model legible. The lecture
sorts the approaches three ways. *Unsupervised* selection drops constant or
near-zero-variance columns and prunes highly correlated ones, in the spirit of
PCA. *Univariate supervised* selection scores each feature against the target
with a statistical test — `f_regression`, `f_classif`, or `chi2` — and keeps the
best via `SelectKBest`, `SelectPercentile`, or `SelectFpr`. *Model-based*
selection lets a fitted estimator judge relevance: `SelectFromModel` reads a
model's `.coef_` or `.feature_importances_`, while `RFE` and `RFECV` recursively
eliminate the weakest, and sequential selection adds or removes features one at a
time.

```python
from sklearn.feature_selection import SelectKBest, f_classif
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.svm import SVC

pipe = Pipeline([
    ("scale", StandardScaler()),
    ("select", SelectKBest(k=2, score_func=f_classif)),
    ("svm", SVC()),
])
```

On the breast-cancer benchmark, trimming thirty features to a well-chosen handful
held cross-validated accuracy near $0.97$ — nearly the full-feature score — while
yielding a smaller, faster, more interpretable model.

## Why It Matters

None of these methods is a neural network, and that is precisely the point. When
data is scarce, when a stakeholder needs to see *why* a decision was made, or
when a project needs a credible baseline before anything fancier, the classical
toolkit still wins. The support vector machine's principled margin, KNN's
assumption-free locality, Naïve Bayes' probabilistic speed, and the discipline of
feature selection are not relics — they are the instincts that tell a practitioner
when a wide, honest street beats a deep, hungry model.
