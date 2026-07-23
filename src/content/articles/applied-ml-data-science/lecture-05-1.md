---
course: applied-ml-data-science
lectureId: L05
title: "The Wisdom of a Thousand Trees"
deck: "A lone decision tree is easy to read and easy to fool; bagging, boosting, and a hard look at class imbalance turn a crowd of weak learners into a formidable predictor."
order: 5
date: 2025-03-24
readingTime: 9
tags: ["decision-trees", "ensembles", "boosting", "random-forest", "imbalanced-data"]
concepts:
  - id: decision-tree
    term: "Decision Tree"
    definition: "A model that predicts by descending a cascade of binary questions, splitting the feature space into axis-aligned regions and assigning each leaf a class or value."
  - id: gini-impurity
    term: "Gini Impurity"
    definition: "A measure of a node's class mixture, equal to one minus the sum of squared class proportions; the CART algorithm chooses splits that most reduce it."
  - id: bagging
    term: "Bagging & Random Forests"
    definition: "Ensemble methods that train many trees on bootstrap samples and average their votes; random forests additionally restrict each split to a random subset of features to decorrelate the trees."
  - id: boosting
    term: "Boosting"
    definition: "A sequential ensemble strategy in which each learner corrects its predecessor's errors, as in AdaBoost's instance reweighting and gradient boosting's fitting of residuals."
  - id: class-imbalance
    term: "Class Imbalance"
    definition: "A skewed distribution of labels that makes accuracy misleading and demands specialized metrics, thresholds, resampling, or class weighting."
  - id: smote
    term: "SMOTE"
    definition: "Synthetic Minority Oversampling Technique, which enlarges the minority class by interpolating new points along the lines connecting existing minority examples to their near neighbors."
---

A decision tree makes its reasoning embarrassingly easy to audit: it is nothing
but a cascade of yes-or-no questions, and any prediction can be traced back to
the questions that produced it. That transparency is also its weakness. Left to
grow unchecked, a tree memorizes its training data down to the last quirk. The
remedy this lecture builds toward is counterintuitive — stop trusting any single
tree, and start trusting crowds of them.

## Twenty Questions, Asked Optimally

Scikit-learn grows trees with the CART algorithm, which greedily hunts for the
single split — a feature $k$ and threshold $t_k$ — that produces the purest pair
of child nodes, then recurses. Purity is scored by Gini impurity,

$$
G_i = 1 - \sum_{k=1}^{n} p_{i,k}^{2},
$$

so a node holding $0$, $49$, and $5$ examples of three iris species scores
$1 - (0/54)^2 - (49/54)^2 - (5/54)^2 \approx 0.168$. Entropy,
$H_i = -\sum_k p_{i,k}\log_2 p_{i,k}$, is the alternative `criterion`. At each
step CART minimizes the size-weighted impurity of the two children,

$$
J(k, t_k) = \frac{m_{\text{left}}}{m}\,G_{\text{left}} + \frac{m_{\text{right}}}{m}\,G_{\text{right}}.
$$

Trees demand little preparation — no scaling or normalization — handle mixed
feature types, predict quickly, and remain interpretable in a way most models
are not.

<figure>
<svg viewBox="0 0 640 300" role="img" aria-label="A decision tree: a root node tests a feature against a threshold and branches yes or no into child nodes, recursing until each leaf assigns a class.">
  <defs>
    <marker id="arw-tree" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" class="dgm-fill"/>
    </marker>
  </defs>
  <line x1="320" y1="74" x2="188" y2="138" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-tree)"/>
  <line x1="320" y1="74" x2="447" y2="138" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-tree)"/>
  <line x1="180" y1="184" x2="108" y2="238" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-tree)"/>
  <line x1="180" y1="184" x2="252" y2="238" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-tree)"/>
  <text x="238" y="104" text-anchor="middle" font-size="11" class="dgm-muted">yes</text>
  <text x="398" y="104" text-anchor="middle" font-size="11" class="dgm-muted">no</text>
  <text x="126" y="210" text-anchor="middle" font-size="11" class="dgm-muted">yes</text>
  <text x="236" y="210" text-anchor="middle" font-size="11" class="dgm-muted">no</text>
  <g class="dgm-accent">
    <rect x="260" y="30" width="120" height="44" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <text x="320" y="57" text-anchor="middle" font-size="13" font-weight="700">x₁ &lt; t₁ ?</text>
  </g>
  <rect x="120" y="140" width="120" height="44" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="180" y="167" text-anchor="middle" font-size="13">x₂ &lt; t₂ ?</text>
  <rect x="400" y="140" width="110" height="44" stroke="currentColor" stroke-width="1.5" class="dgm-soft"/>
  <text x="455" y="167" text-anchor="middle" font-size="13">class −1</text>
  <rect x="45" y="240" width="110" height="44" stroke="currentColor" stroke-width="1.5" class="dgm-soft"/>
  <text x="100" y="267" text-anchor="middle" font-size="13">class +1</text>
  <rect x="205" y="240" width="110" height="44" stroke="currentColor" stroke-width="1.5" class="dgm-soft"/>
  <text x="260" y="267" text-anchor="middle" font-size="13">class −1</text>
</svg>
<figcaption><b>Twenty questions.</b> Each internal node splits the data on one feature and threshold; following the yes/no answers down to a leaf yields the predicted class.</figcaption>
</figure>

## The Price of a Perfect Memory

Because a tree is nonparametric, it will happily grow until every leaf is pure,
overfitting spectacularly. Regularization means constraining growth: decrease
`max_depth`, raise the `min_*` parameters (`min_samples_split`,
`min_samples_leaf`), or lower the `max_*` parameters (`max_leaf_nodes`,
`max_features`). Two strategies fight overfitting directly. *Early stopping*
halts splitting once further division fails to improve validation performance.
*Post-pruning* grows the full tree, then removes nodes whose deletion improves
validation accuracy — generally the better choice, because it can keep a split
whose single feature looks useless in isolation but pays off in combination with
others. The same machinery does regression, with each leaf predicting the mean of
its examples.

## Why a Slightly Biased Coin Still Wins

The case for ensembles rests on a startling bit of arithmetic. Toss a coin
weighted to land heads just $51\%$ of the time, a thousand times, and ask for the
probability of a *majority* of heads:

$$
\sum_{k=501}^{1000}\binom{1000}{k}(0.51)^{k}(0.49)^{1000-k} \approx 0.747.
$$

A one-percent edge per toss becomes a three-in-four certainty in aggregate — the
wisdom of the crowd. A `VotingClassifier` exploits this by polling diverse models
such as logistic regression, a random forest, and an SVM. *Hard* voting takes the
majority label; *soft* voting averages predicted probabilities and usually edges
ahead. In the lecture's run the ensemble reached $91.2\%$, beating every member.

## Bagging, Forests, and Extra Randomness

Bagging — bootstrap aggregating — trains each estimator on a sample drawn *with*
replacement (drawing *without* replacement is called pasting). The examples left
out of a given bootstrap form a free validation set, reported as the `oob_score`.
Random forests add a second dose of randomness: each split considers only a
random subset of features, which decorrelates the trees and sharpens the
ensemble. Extremely randomized trees (Extra-Trees) go further still, choosing
split thresholds at random for faster training.

<figure>
<svg viewBox="0 0 740 300" role="img" aria-label="Bagging and random forests: one training set is resampled into several bootstrap samples, each trains its own decision tree, and the trees' votes are aggregated by majority into a single prediction.">
  <defs>
    <marker id="arw-forest" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" class="dgm-fill"/>
    </marker>
  </defs>
  <text x="235" y="24" text-anchor="middle" font-size="11" class="dgm-muted">bootstrap samples</text>
  <text x="415" y="20" text-anchor="middle" font-size="11" class="dgm-muted">decision trees</text>
  <line x1="120" y1="150" x2="170" y2="62" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-forest)"/>
  <line x1="120" y1="150" x2="170" y2="150" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-forest)"/>
  <line x1="120" y1="150" x2="170" y2="238" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-forest)"/>
  <line x1="295" y1="60" x2="355" y2="60" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-forest)"/>
  <line x1="295" y1="150" x2="355" y2="150" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-forest)"/>
  <line x1="295" y1="240" x2="355" y2="240" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-forest)"/>
  <line x1="470" y1="60" x2="516" y2="140" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-forest)"/>
  <line x1="470" y1="150" x2="516" y2="150" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-forest)"/>
  <line x1="470" y1="240" x2="516" y2="160" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-forest)"/>
  <line x1="650" y1="150" x2="694" y2="150" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-forest)"/>
  <rect x="20" y="120" width="100" height="60" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="70" y="145" text-anchor="middle" font-size="12" font-weight="700">training</text>
  <text x="70" y="162" text-anchor="middle" font-size="12" font-weight="700">set</text>
  <rect x="175" y="40" width="120" height="40" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="235" y="65" text-anchor="middle" font-size="12">sample 1</text>
  <rect x="175" y="130" width="120" height="40" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="235" y="155" text-anchor="middle" font-size="12">sample 2</text>
  <rect x="175" y="220" width="120" height="40" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="235" y="245" text-anchor="middle" font-size="12">sample 3</text>
  <g>
    <rect x="360" y="32" width="110" height="56" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <circle cx="415" cy="46" r="3" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <line x1="415" y1="49" x2="403" y2="61" stroke="currentColor" stroke-width="1.5"/>
    <line x1="415" y1="49" x2="427" y2="61" stroke="currentColor" stroke-width="1.5"/>
    <circle cx="403" cy="63" r="3" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <circle cx="427" cy="63" r="3" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <text x="415" y="82" text-anchor="middle" font-size="11">tree 1</text>
  </g>
  <g>
    <rect x="360" y="122" width="110" height="56" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <circle cx="415" cy="136" r="3" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <line x1="415" y1="139" x2="403" y2="151" stroke="currentColor" stroke-width="1.5"/>
    <line x1="415" y1="139" x2="427" y2="151" stroke="currentColor" stroke-width="1.5"/>
    <circle cx="403" cy="153" r="3" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <circle cx="427" cy="153" r="3" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <text x="415" y="172" text-anchor="middle" font-size="11">tree 2</text>
  </g>
  <g>
    <rect x="360" y="212" width="110" height="56" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <circle cx="415" cy="226" r="3" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <line x1="415" y1="229" x2="403" y2="241" stroke="currentColor" stroke-width="1.5"/>
    <line x1="415" y1="229" x2="427" y2="241" stroke="currentColor" stroke-width="1.5"/>
    <circle cx="403" cy="243" r="3" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <circle cx="427" cy="243" r="3" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <text x="415" y="262" text-anchor="middle" font-size="11">tree 3</text>
  </g>
  <g class="dgm-accent">
    <rect x="520" y="118" width="130" height="64" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <text x="585" y="145" text-anchor="middle" font-size="13" font-weight="700">majority</text>
    <text x="585" y="164" text-anchor="middle" font-size="13" font-weight="700">vote</text>
  </g>
  <text x="712" y="156" text-anchor="middle" font-size="16" font-weight="700">ŷ</text>
</svg>
<figcaption><b>Wisdom of the crowd.</b> Bagging resamples the data into many bootstrap sets, fits an independent tree on each, and combines their votes; a random forest also restricts each split to a random subset of features.</figcaption>
</figure>

## Learning from Your Own Mistakes: Boosting

Boosting abandons parallelism and builds the ensemble in sequence, each learner
repairing the last. AdaBoost reweights the training instances. Every example
starts with weight $w^{(i)} = 1/m$; after fitting predictor $j$ it computes the
weighted error rate

$$
r_j = \frac{\sum_{\hat{y}_j^{(i)} \neq y^{(i)}} w^{(i)}}{\sum_i w^{(i)}},
$$

assigns that predictor an influence
$\alpha_j = \eta \ln\!\frac{1 - r_j}{r_j}$, then up-weights the misclassified
points and renormalizes so the next learner focuses on the hard cases. Gradient
boosting takes a different tack, fitting each new tree to the *residual* errors of
the ensemble so far:

```python
clf1.fit(X, y)
y2 = y - clf1.predict(X)
clf2.fit(X, y2)
y3 = y2 - clf2.predict(X)
clf3.fit(X, y3)
y_pred = sum(clf.predict(X_new) for clf in (clf1, clf2, clf3))
```

<figure>
<svg viewBox="0 0 760 220" role="img" aria-label="Boosting builds learners in sequence: each learner is trained, its misclassified examples are up-weighted, and the next learner focuses on them; the weighted vote of all learners forms the final model.">
  <defs>
    <marker id="arw-boost" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" class="dgm-fill"/>
    </marker>
  </defs>
  <line x1="180" y1="83" x2="268" y2="83" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-boost)"/>
  <line x1="390" y1="83" x2="478" y2="83" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-boost)"/>
  <line x1="600" y1="83" x2="658" y2="83" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-boost)"/>
  <text x="224" y="74" text-anchor="middle" font-size="10" class="dgm-muted">re-weight</text>
  <text x="434" y="74" text-anchor="middle" font-size="10" class="dgm-muted">re-weight</text>
  <text x="629" y="74" text-anchor="middle" font-size="10" class="dgm-muted">combine</text>
  <line x1="120" y1="108" x2="120" y2="136" stroke="currentColor" stroke-width="1" class="dgm-muted"/>
  <line x1="330" y1="108" x2="330" y2="136" stroke="currentColor" stroke-width="1" class="dgm-muted"/>
  <line x1="540" y1="108" x2="540" y2="136" stroke="currentColor" stroke-width="1" class="dgm-muted"/>
  <rect x="60" y="58" width="120" height="50" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="120" y="88" text-anchor="middle" font-size="13" font-weight="700">learner 1</text>
  <rect x="270" y="58" width="120" height="50" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="330" y="88" text-anchor="middle" font-size="13" font-weight="700">learner 2</text>
  <rect x="480" y="58" width="120" height="50" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="540" y="88" text-anchor="middle" font-size="13" font-weight="700">learner 3</text>
  <g>
    <circle cx="90" cy="150" r="3" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <circle cx="105" cy="150" r="3" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <circle cx="120" cy="150" r="3" fill="none" stroke="currentColor" stroke-width="1.5"/>
  </g>
  <g class="dgm-accent">
    <circle cx="135" cy="150" r="4" class="dgm-fill"/>
    <circle cx="150" cy="150" r="4" class="dgm-fill"/>
  </g>
  <g>
    <circle cx="315" cy="150" r="3" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <circle cx="330" cy="150" r="3" fill="none" stroke="currentColor" stroke-width="1.5"/>
  </g>
  <g class="dgm-accent">
    <circle cx="300" cy="150" r="4" class="dgm-fill"/>
    <circle cx="345" cy="150" r="6" class="dgm-fill"/>
    <circle cx="360" cy="150" r="6" class="dgm-fill"/>
  </g>
  <g>
    <circle cx="510" cy="150" r="3" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <circle cx="525" cy="150" r="3" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <circle cx="540" cy="150" r="3" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <circle cx="570" cy="150" r="3" fill="none" stroke="currentColor" stroke-width="1.5"/>
  </g>
  <g class="dgm-accent">
    <circle cx="555" cy="150" r="5" class="dgm-fill"/>
  </g>
  <g class="dgm-accent">
    <rect x="660" y="58" width="80" height="50" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <text x="700" y="80" text-anchor="middle" font-size="12" font-weight="700">Σ αⱼhⱼ</text>
    <text x="700" y="97" text-anchor="middle" font-size="9">weighted vote</text>
  </g>
  <text x="700" y="128" text-anchor="middle" font-size="10" class="dgm-muted">final model</text>
  <g class="dgm-accent"><circle cx="235" cy="190" r="5" class="dgm-fill"/></g>
  <text x="368" y="194" text-anchor="middle" font-size="10" class="dgm-muted">up-weighted (misclassified) examples grow each round</text>
</svg>
<figcaption><b>Learning from mistakes.</b> Boosting trains learners in sequence, up-weighting the examples each one gets wrong so the next focuses on the hard cases; a weighted vote combines them.</figcaption>
</figure>

A small learning rate scales down each tree's contribution — shrinkage — and
generalizes better at the cost of needing more trees; setting `subsample` below
one gives stochastic gradient boosting. Early stopping via `staged_predict` or
`warm_start` halts once validation error stops falling.

## When the Classes Don't Share Equally

Fraud, spam, and intrusion detection share a trap: one class dwarfs the other.
Accuracy becomes a liar — with $90\%$ non-spam, a model that predicts "non-spam"
every time scores $90\%$ and detects nothing. The `DummyClassifier` with
`strategy='most_frequent'` makes that baseline explicit as a sanity check. Better
metrics include `balanced_accuracy_score` and a deliberate averaging strategy:
`macro` weights every class equally (favoring the rare one), while `weighted` and
`micro` lean toward the larger class. Remedies range from moving the decision
threshold, to downsampling the majority (fast, but discards data) or upsampling
the minority (no loss, but risks overfitting duplicates), to setting
`class_weight='balanced'`, which weights each class inversely to its frequency,
$\frac{n_{\text{samples}}}{n_{\text{classes}}\cdot \text{bincount}(y)}$, without
enlarging the dataset. Ensemble resamplers such as `BalancedBaggingClassifier`
and `BalancedRandomForestClassifier` bake balance into every tree. Most elegant
is SMOTE, which does not merely copy minority points but *synthesizes* new ones,
interpolating along the line connecting each minority example to a random near
neighbor.

## Why It Matters

Ensembles of trees quietly dominate real-world tabular machine learning — the
libraries change, from scikit-learn's forests to XGBoost, but the recipe holds. A
single tree still earns its keep when a human must read the logic; a forest or a
boosted ensemble takes over when accuracy is the currency. And because production
data is almost never balanced, knowing how to weight, resample, and re-score for
skew is not an afterthought — it is the difference between a model that looks good
and one that works.
