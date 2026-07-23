---
course: applied-ml-data-science
lectureId: L02
title: "Rolling Downhill Toward the Right Answer"
deck: "How linear regression, gradient descent, and the bias–variance bargain teach a model to fit the world without memorizing it — and how cross-validation keeps it honest."
order: 2
date: 2025-03-24
readingTime: 9
tags: ["linear-regression", "gradient-descent", "bias-variance", "cross-validation", "feature-scaling"]
concepts:
  - id: linear-regression
    term: Linear Regression
    definition: "A supervised model that predicts a target as a weighted sum of features, fitting the weights by minimizing the sum of squared errors between prediction and truth."
  - id: gradient-descent
    term: Gradient Descent
    definition: "An iterative optimization algorithm that minimizes a cost function by repeatedly stepping against its gradient, in batch, stochastic, or mini-batch form."
  - id: polynomial-regression
    term: Polynomial Regression
    definition: "An extension of linear regression that adds powers and products of the original features so a straight-line model can trace curved relationships."
  - id: bias-variance-tradeoff
    term: Bias–Variance Tradeoff
    definition: "The decomposition of expected error into squared bias, variance, and irreducible noise; reducing one term often raises the other, governing model complexity."
  - id: cross-validation
    term: Cross-Validation
    definition: "A resampling scheme that rotates through k folds of the training data — training on k−1 and validating on the held-out fold — to estimate performance with less luck-of-the-draw variance."
  - id: hyperparameter-search
    term: Hyperparameter Search
    definition: "Choosing the settings fixed before training by evaluating cross-validated performance over a grid (grid search) or over random samples (randomized search)."
  - id: feature-scaling
    term: Feature Scaling
    definition: "Rescaling features to comparable ranges — via standardization, min–max, robust, or normalizer methods — so gradient descent converges faster and distance-based methods behave sensibly."
---

Every supervised model begins with the same humble ambition: draw a function
through a cloud of points so that it predicts the next one well. This lecture
takes that ambition apart. It starts with the straight line of linear regression,
shows two ways to fit it, confronts the tension between a model that is too rigid
and one too eager, and ends with the plumbing — cross-validation, hyperparameter
search, and feature scaling — that keeps the whole enterprise honest.

## Fitting a Line to the World

Given observations $X = \{x_1, x_2, \dots, x_n\}$ and their labels
$Y = \{y_1, \dots, y_n\}$, **linear regression** proposes that the target is a
weighted sum of the features:

$$
\hat{y} = \theta_0 + \theta_1 x_1 + \theta_2 x_2 + \cdots + \theta_d x_d
        = \sum_{j=0}^{d}\theta_j x_j = h_\theta(x),
$$

where a dummy feature $x_0 = 1$ absorbs the intercept. Fitting the model means
choosing the parameter vector $\theta$ that makes the predictions closest to the
truth. "Closest" is measured by the sum of squared errors,

$$
\text{SSE}(X, h_\theta) = \sum_{i}\big(h_\theta(x^{(i)}) - y^{(i)}\big)^2,
$$

or its averaged cousin the mean squared error,
$J(\theta) = \tfrac{1}{m}\sum_i \big(h_\theta(x^{(i)}) - y^{(i)}\big)^2$, whose
square root — the RMSE — reports the error in the target's own units. There are
two ways to reach the minimizing $\theta$. The **closed form** sets the gradient
to zero and solves directly: no iteration, no learning rate, but slow when the
number of features grows large. The alternative is to walk downhill.

## Rolling Downhill

**Gradient descent** minimizes the cost function by repeated small steps. Start
$\theta$ at a random value; while not converged, compute the gradient of the cost
and step against it:

$$
\theta \leftarrow \theta - \eta\,\nabla_\theta J(\theta).
$$

The **learning rate** $\eta$ sets the step size. Too large and the descent
overshoots and diverges; too small and it crawls. A common compromise is a
learning schedule that shrinks the step over time, such as
$\eta(t) = t_0/(t + t_1)$.

<figure>
<svg viewBox="0 0 640 300" role="img" aria-label="A convex loss curve with a sequence of shrinking downhill steps converging to the global minimum, illustrating gradient descent.">
  <defs>
    <marker id="arw-gd" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" class="dgm-fill"/>
    </marker>
  </defs>
  <line x1="60" y1="250" x2="60" y2="40" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-gd)"/>
  <line x1="60" y1="250" x2="600" y2="250" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-gd)"/>
  <text x="72" y="34" text-anchor="middle" font-size="12">J(θ)</text>
  <text x="612" y="254" text-anchor="middle" font-size="12">θ</text>
  <path d="M90,55 Q345,415 600,55" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <g class="dgm-fill">
    <circle cx="140" cy="119" r="4"/>
    <circle cx="210" cy="185" r="4"/>
    <circle cx="270" cy="219" r="4"/>
    <circle cx="315" cy="232" r="4"/>
  </g>
  <line x1="146" y1="123" x2="204" y2="181" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-gd)"/>
  <line x1="215" y1="188" x2="265" y2="216" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-gd)"/>
  <line x1="276" y1="221" x2="309" y2="230" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-gd)"/>
  <line x1="321" y1="233" x2="339" y2="234" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-gd)"/>
  <text x="140" y="106" text-anchor="middle" font-size="11">start</text>
  <g class="dgm-accent">
    <circle cx="345" cy="235" r="5" class="dgm-fill"/>
    <text x="410" y="238" text-anchor="middle" font-size="11">minimum</text>
  </g>
</svg>
<figcaption><b>Gradient descent</b> Each step moves against the slope of the cost curve; the moves shrink as the gradient flattens, converging on the parameter value that minimizes J(θ).</figcaption>
</figure>

The variants differ in how much data each step consults. **Batch gradient
descent** uses the entire training set per step — stable but slow on large data.
**Stochastic gradient descent (SGD)** uses a single random instance at a time:
far faster and able to escape shallow traps, though its cost bounces rather than
gliding smoothly downhill. **Mini-batch gradient descent** splits the difference,
computing gradients on small random subsets and reaping a hardware speed-up.

```python
for epoch in range(n_epochs):
    for i in range(m):
        idx = np.random.randint(m)               # one random instance
        xi, yi = X_train[idx:idx+1], y_train[idx:idx+1]
        gradients = 2 * xi.T.dot(xi.dot(theta) - yi)
        eta = t0 / (epoch * m + i + t1)           # shrinking learning rate
        theta = theta - eta * gradients
```

SGD carries fine print: instances should be independent and identically
distributed, so shuffling the training set first is essential to stop any
ordering from biasing the walk.

## When Straight Lines Bend

Not every relationship is linear. **Polynomial regression** extends the same
machinery by adding powers and products of the original features — $x$, $x^2$,
$x^3$, and cross terms — then fitting a linear model in that enlarged space. A
degree-two expansion of a single feature turns $x$ into $(x, x^2)$; the model is
still *linear in its parameters* even as the curve it traces bends. The catch is
that higher degrees invite the very overfitting the next section confronts.

## The Bias–Variance Bargain

Increasing model complexity does not reliably improve prediction. The expected
error at a point decomposes into three pieces:

$$
\mathbb{E}\big[(\hat{f}(x) - y)^2\big]
= \underbrace{\big(\mathbb{E}[\hat{f}(x)] - f(x)\big)^2}_{\text{bias}^2}
+ \underbrace{\mathbb{E}\big[(\hat{f}(x) - \mathbb{E}[\hat{f}(x)])^2\big]}_{\text{variance}}
+ \sigma^2 .
$$

**Bias** is the error from wrong assumptions — the gap between the average model
and the truth; a too-simple model has high bias and underfits. **Variance** is
how much the fitted function swings as the training set changes; a too-complex
model has high variance and overfits. The last term, $\sigma^2$, is irreducible
noise no model can remove.

<figure>
<svg viewBox="0 0 640 320" role="img" aria-label="Error versus model complexity: squared bias falls, variance rises, and their sum forms a U-shaped total-error curve whose minimum marks the best model complexity.">
  <defs>
    <marker id="arw-bv" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" class="dgm-fill"/>
    </marker>
  </defs>
  <line x1="60" y1="270" x2="60" y2="40" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-bv)"/>
  <line x1="60" y1="270" x2="600" y2="270" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-bv)"/>
  <text x="74" y="34" text-anchor="middle" font-size="12">error</text>
  <g class="dgm-muted">
    <path d="M70,80 Q250,255 590,255" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <text x="118" y="72" text-anchor="middle" font-size="11">bias²</text>
  </g>
  <g class="dgm-accent-2">
    <path d="M70,258 Q380,255 590,80" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <text x="556" y="72" text-anchor="middle" font-size="11">variance</text>
  </g>
  <path d="M75,85 Q332,235 590,85" fill="none" stroke="currentColor" stroke-width="2"/>
  <text x="300" y="72" text-anchor="middle" font-size="11">total error</text>
  <g class="dgm-accent">
    <line x1="332" y1="160" x2="332" y2="270" stroke="currentColor" stroke-width="1.5" stroke-dasharray="5 4"/>
    <circle cx="332" cy="160" r="4" class="dgm-fill"/>
    <text x="332" y="150" text-anchor="middle" font-size="11">best fit</text>
  </g>
  <text x="120" y="300" text-anchor="middle" font-size="11" class="dgm-muted">underfit</text>
  <text x="330" y="300" text-anchor="middle" font-size="11" class="dgm-muted">model complexity</text>
  <text x="545" y="300" text-anchor="middle" font-size="11" class="dgm-muted">overfit</text>
</svg>
<figcaption><b>The bias–variance tradeoff</b> As complexity grows, squared bias falls while variance climbs; total error bottoms out at the complexity that balances the two.</figcaption>
</figure>

The tell-tale sign of overfitting is a model whose training error keeps dropping
while its validation error climbs. The lecture's diagnostic recipe: if you cannot
even fit the training data (high bias), reach for a more powerful model, better
features, or less regularization; if you fit training data but fail on validation
(high variance), simplify the model, gather more data, or add regularization.
**Learning curves** — plots of error against training-set size — make the
diagnosis visual.

## Keeping Score Honestly

A single train/test split can flatter or punish a model by luck of the draw.
**Cross-validation** averages that luck away: k-fold splits the training data
into $k$ parts, trains on $k-1$ and validates on the held-out fold, then rotates.

<figure>
<svg viewBox="0 0 720 344" role="img" aria-label="The dataset is split into a large training set and a held-out test set; the training set is then divided into five folds, each of which serves once as the validation fold during cross-validation.">
  <defs>
    <marker id="arw-cv" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" class="dgm-fill"/>
    </marker>
  </defs>
  <text x="360" y="26" text-anchor="middle" font-size="13" font-weight="700">Full dataset</text>
  <rect x="40" y="42" width="500" height="46" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="290" y="70" text-anchor="middle" font-size="13">Training set</text>
  <g class="dgm-accent">
    <rect x="540" y="42" width="140" height="46" class="dgm-soft" stroke="currentColor" stroke-width="1.5"/>
    <text x="610" y="66" text-anchor="middle" font-size="13">Test</text>
    <text x="610" y="82" text-anchor="middle" font-size="9">held out</text>
  </g>
  <line x1="290" y1="88" x2="290" y2="120" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-cv)"/>
  <text x="250" y="138" text-anchor="middle" font-size="12" font-weight="700">Cross-validation (k = 5)</text>
  <g class="dgm-accent-2">
    <rect x="470" y="127" width="20" height="13" class="dgm-soft" stroke="currentColor" stroke-width="1.5"/>
    <text x="540" y="138" text-anchor="middle" font-size="10">validation</text>
  </g>
  <rect x="600" y="127" width="20" height="13" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="650" y="138" text-anchor="middle" font-size="10">train</text>
  <g class="dgm-accent-2">
    <rect x="40" y="150" width="100" height="24" class="dgm-soft" stroke="currentColor" stroke-width="1.5"/>
    <text x="90" y="167" text-anchor="middle" font-size="11">val</text>
  </g>
  <rect x="140" y="150" width="100" height="24" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <rect x="240" y="150" width="100" height="24" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <rect x="340" y="150" width="100" height="24" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <rect x="440" y="150" width="100" height="24" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <rect x="40" y="182" width="100" height="24" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <g class="dgm-accent-2">
    <rect x="140" y="182" width="100" height="24" class="dgm-soft" stroke="currentColor" stroke-width="1.5"/>
    <text x="190" y="199" text-anchor="middle" font-size="11">val</text>
  </g>
  <rect x="240" y="182" width="100" height="24" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <rect x="340" y="182" width="100" height="24" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <rect x="440" y="182" width="100" height="24" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <rect x="40" y="214" width="100" height="24" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <rect x="140" y="214" width="100" height="24" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <g class="dgm-accent-2">
    <rect x="240" y="214" width="100" height="24" class="dgm-soft" stroke="currentColor" stroke-width="1.5"/>
    <text x="290" y="231" text-anchor="middle" font-size="11">val</text>
  </g>
  <rect x="340" y="214" width="100" height="24" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <rect x="440" y="214" width="100" height="24" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <rect x="40" y="246" width="100" height="24" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <rect x="140" y="246" width="100" height="24" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <rect x="240" y="246" width="100" height="24" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <g class="dgm-accent-2">
    <rect x="340" y="246" width="100" height="24" class="dgm-soft" stroke="currentColor" stroke-width="1.5"/>
    <text x="390" y="263" text-anchor="middle" font-size="11">val</text>
  </g>
  <rect x="440" y="246" width="100" height="24" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <rect x="40" y="278" width="100" height="24" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <rect x="140" y="278" width="100" height="24" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <rect x="240" y="278" width="100" height="24" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <rect x="340" y="278" width="100" height="24" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <g class="dgm-accent-2">
    <rect x="440" y="278" width="100" height="24" class="dgm-soft" stroke="currentColor" stroke-width="1.5"/>
    <text x="490" y="295" text-anchor="middle" font-size="11">val</text>
  </g>
  <text x="290" y="326" text-anchor="middle" font-size="11" class="dgm-muted">each fold is the validation set exactly once</text>
</svg>
<figcaption><b>Train/test split &amp; k-fold cross-validation</b> The test set is held out entirely; the training set rotates through k folds so every fold serves once for validation and k−1 times for training.</figcaption>
</figure>

```python
from sklearn.model_selection import cross_val_score
scores = cross_val_score(model, X_train, y_train,
                         scoring="neg_mean_squared_error", cv=10)
```

Reporting the mean and standard deviation of the scores conveys not just how good
a model is but how stable — a high average with a wild spread is not to be
trusted.

## Searching the Dial

Hyperparameters — the knobs set before training — are chosen by **hyperparameter
search** over cross-validated performance. **Grid search** tries every
combination in a specified grid; **randomized search** samples combinations at
random, a better bet when the grid is large.

```python
from sklearn.model_selection import GridSearchCV
param_grid = [{'n_estimators': [3, 10, 30], 'max_features': [2, 4, 6, 8]}]
grid = GridSearchCV(forest, param_grid, cv=5,
                    scoring='neg_mean_squared_error')
grid.fit(X_train, y_train)
grid.best_params_
```

Only after the winner is chosen does it meet the test set — and that set is
**transformed, never fit**, so no information leaks backward from test to model.

## Putting Features on Equal Footing

Gradient descent converges faster, and distance-based methods behave sensibly,
only when features share a scale. The lecture surveys four **feature scaling**
methods. **Standardization** centers each feature and divides by its spread,
$x' = \frac{x - \text{mean}(x)}{\text{std}(x)}$, producing zero mean and unit
variance. **Min–max scaling** squeezes values into $[0,1]$ via
$x' = \frac{x - \min(x)}{\max(x) - \min(x)}$ but is sensitive to outliers. The
**robust scaler** swaps in the interquartile range,
$x' = \frac{x - Q_1(x)}{Q_3(x) - Q_1(x)}$, shrugging off outliers. The
**normalizer** rescales each instance to unit length,
$x' = \frac{x}{\sqrt{x_1^2 + x_2^2 + \cdots + x_k^2}}$.

## Why It Matters

This lecture is the mechanical heart of applied machine learning. Gradient
descent, in its batch, stochastic, and mini-batch forms, is the same engine that
trains deep neural networks with billions of parameters; the bias–variance
decomposition is the lens through which every modeling decision is judged; and
cross-validation with disciplined hyperparameter search is what separates a
number you can trust from one you merely hope for. Master the humble line and the
descent that fits it, and much of the rest of the course is elaboration.
