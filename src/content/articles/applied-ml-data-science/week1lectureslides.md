---
course: applied-ml-data-science
lectureId: L01
title: "When the Data Writes the Program"
deck: "An opening survey of applied machine learning — the tasks it solves, the four ways a machine can learn, and the five-stage lifecycle that carries a project from question to deployed model."
order: 1
date: 2025-03-26
readingTime: 7
tags: ["machine-learning", "supervised-learning", "unsupervised-learning", "scikit-learn", "workflow"]
concepts:
  - id: machine-learning
    term: Machine Learning
    definition: "The study of algorithms that improve their performance at a task with experience; formally, a program learns from experience E with respect to task T and measure P if its performance at T, measured by P, improves with E."
  - id: learning-paradigms
    term: Learning Paradigms
    definition: "The four families of learning distinguished by feedback: supervised (labeled data), unsupervised (no labels), semi-supervised (partial labels), and reinforcement (rewards from an environment)."
  - id: instance-vs-model
    term: Instance-Based vs. Model-Based Learning
    definition: "A contrast between methods that memorize training examples and answer by analogy, and methods that distill data into parameters and discard the examples."
  - id: ml-lifecycle
    term: Machine Learning Lifecycle
    definition: "The end-to-end process of a project: define the problem, acquire and explore data, model the data, evaluate and interpret, then maintain in production."
  - id: estimator-api
    term: Scikit-Learn Estimator API
    definition: "A uniform interface in which estimators learn via fit(), transformers reshape data via transform()/fit_transform(), and predictors produce answers via predict()/score()."
  - id: generalization
    term: Generalization, Overfitting, and Underfitting
    definition: "The central challenge of learning: a model too simple underfits and misses the pattern, while a model too complex overfits and memorizes noise, failing on unseen data."
---

For most of computing's history, to program a machine was to dictate to it: spell
out every rule, every branch, every exception, and the computer would obey.
Machine learning inverts that contract. Instead of handing the computer a
procedure, we hand it examples and a goal and let it discover the procedure
itself. This opening lecture of Applied Machine Learning lays down the vocabulary
and the map — what learning means, the forms it takes, and the disciplined
workflow that separates a real model from a lucky guess.

## From Rules to Examples

Arthur Samuel, who in the 1950s built a checkers program that improved by playing
against itself, framed the field as giving "computers the ability to learn
without being explicitly programmed." Tom Mitchell later sharpened this into an
engineer's checklist: a program learns from experience $E$ with respect to a task
$T$ and a performance measure $P$ if its performance at $T$, as measured by $P$,
improves with $E$. A spam filter's task $T$ is labeling email; its measure $P$
might be classification accuracy; its experience $E$ is the corpus of messages
users have already marked. Every project in this course can be written as such a
triple $\langle T, P, E\rangle$.

Why bother? Traditional programming excels when we can specify the rules —
computing payroll, sorting a list. Machine learning earns its keep precisely when
we cannot: recognizing a face, reading a handwritten digit, flagging a fraudulent
transaction, personalizing a recommendation. These are tasks drowning in data and
exceptions, where the rules are easier to demonstrate than to articulate. The
Netflix Prize, which paid handsomely for a ten-percent improvement in movie
recommendations, and AlphaGo's mastery of a game with more board positions than
there are atoms in the observable universe, are the same idea at different scales.

## Four Ways a Machine Can Learn

The lecture divides learning into four **paradigms** by the kind of feedback
available.

**Supervised learning** is learning with an answer key: each training example
carries a label, and the model learns to map inputs to outputs. Its workhorses —
$k$-nearest neighbors, naïve Bayes, decision trees, random forests, linear and
logistic regression, support vector machines, and neural networks — recur
throughout the term.

**Unsupervised learning** has no labels; the model must find structure on its
own. This covers clustering (k-means, hierarchical), association-rule mining
(Apriori), dimensionality reduction for visualization (PCA, t-SNE), and anomaly
detection (one-class SVM).

**Semi-supervised learning** splits the difference, exploiting a small pool of
labeled data alongside a large unlabeled one. **Reinforcement learning** is
different in kind: an agent takes actions in an environment and learns from
periodic rewards rather than from a fixed dataset.

<figure>
<svg viewBox="0 0 760 262" role="img" aria-label="Two panels contrasting supervised learning, where labeled points are separated by a learned decision boundary, with unsupervised learning, where unlabeled points are grouped into discovered clusters.">
  <text x="185" y="24" text-anchor="middle" font-size="15" font-weight="700">Supervised</text>
  <rect x="10" y="38" width="350" height="198" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <g class="dgm-fill">
    <circle cx="60" cy="195" r="5"/>
    <circle cx="88" cy="210" r="5"/>
    <circle cx="72" cy="178" r="5"/>
    <circle cx="104" cy="200" r="5"/>
    <circle cx="58" cy="222" r="5"/>
    <circle cx="92" cy="188" r="5"/>
  </g>
  <circle cx="255" cy="92" r="5" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <circle cx="288" cy="78" r="5" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <circle cx="308" cy="112" r="5" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <circle cx="268" cy="128" r="5" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <circle cx="300" cy="142" r="5" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <circle cx="330" cy="100" r="5" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <g class="dgm-accent">
    <line x1="40" y1="66" x2="345" y2="230" stroke="currentColor" stroke-width="1.5"/>
    <text x="205" y="120" text-anchor="middle" font-size="10">decision boundary</text>
  </g>
  <text x="185" y="252" text-anchor="middle" font-size="11" class="dgm-muted">labeled data — learn a boundary</text>
  <text x="575" y="24" text-anchor="middle" font-size="15" font-weight="700">Unsupervised</text>
  <rect x="400" y="38" width="350" height="198" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <circle cx="455" cy="190" r="5" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <circle cx="478" cy="205" r="5" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <circle cx="462" cy="172" r="5" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <circle cx="492" cy="196" r="5" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <circle cx="448" cy="214" r="5" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <circle cx="640" cy="96" r="5" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <circle cx="666" cy="110" r="5" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <circle cx="650" cy="82" r="5" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <circle cx="682" cy="120" r="5" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <circle cx="692" cy="94" r="5" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <g class="dgm-accent">
    <ellipse cx="467" cy="192" rx="46" ry="36" fill="none" stroke="currentColor" stroke-width="1.5" stroke-dasharray="5 4"/>
    <ellipse cx="666" cy="100" rx="46" ry="34" fill="none" stroke="currentColor" stroke-width="1.5" stroke-dasharray="5 4"/>
  </g>
  <text x="575" y="252" text-anchor="middle" font-size="11" class="dgm-muted">unlabeled data — find the clusters</text>
</svg>
<figcaption><b>Supervised vs. unsupervised</b> With labels, the model learns a boundary between known classes; without them, it must discover the grouping structure on its own.</figcaption>
</figure>

## Memorizers and Model-Builders

Cutting across those paradigms is a second distinction. **Instance-based**
methods, like nearest neighbors, essentially memorize the training set and answer
new questions by analogy to the closest stored examples. **Model-based** methods
instead distill the data into a compact set of parameters — the slope of a line,
the weights of a network — and then discard the raw examples. The trade is memory
and flexibility against generalization and speed.

## The Life Cycle of a Model

A model is not the project; it is one stage of it. The lecture presents machine
learning as a five-part **lifecycle**:

1. **Define the project** — What problem are we solving? What is the evaluation
   criterion, and what baseline must we beat?
2. **Acquire and explore data** — collect appropriate data, clean it, perform
   exploratory analysis, and engineer features.
3. **Model the data** — build candidate models, select variables, tune
   hyperparameters.
4. **Evaluate and interpret** — does performance clear the baseline, and can we
   explain the model's behavior?
5. **Maintain** — monitor performance in production and decide how often to
   retrain.

<figure>
<svg viewBox="0 0 820 192" role="img" aria-label="The five-stage machine-learning lifecycle as a left-to-right pipeline of boxes — define, acquire and explore, model, evaluate and interpret, maintain — with a feedback arrow looping from maintenance back to data acquisition.">
  <defs>
    <marker id="arw-life" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" class="dgm-fill"/>
    </marker>
  </defs>
  <rect x="8" y="30" width="145" height="66" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="80" y="68" text-anchor="middle" font-size="13" font-weight="700">1. Define</text>
  <line x1="153" y1="63" x2="168" y2="63" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-life)"/>
  <rect x="170" y="30" width="145" height="66" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="242" y="57" text-anchor="middle" font-size="13" font-weight="700">2. Acquire</text>
  <text x="242" y="76" text-anchor="middle" font-size="12">&amp; explore</text>
  <line x1="315" y1="63" x2="330" y2="63" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-life)"/>
  <rect x="332" y="30" width="145" height="66" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="404" y="68" text-anchor="middle" font-size="13" font-weight="700">3. Model</text>
  <line x1="477" y1="63" x2="492" y2="63" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-life)"/>
  <rect x="494" y="30" width="145" height="66" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="566" y="57" text-anchor="middle" font-size="13" font-weight="700">4. Evaluate</text>
  <text x="566" y="76" text-anchor="middle" font-size="12">&amp; interpret</text>
  <line x1="639" y1="63" x2="654" y2="63" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-life)"/>
  <rect x="656" y="30" width="145" height="66" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="728" y="68" text-anchor="middle" font-size="13" font-weight="700">5. Maintain</text>
  <g class="dgm-accent">
    <path d="M728,96 C728,152 242,152 242,98" fill="none" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-life)"/>
    <text x="485" y="146" text-anchor="middle" font-size="11">monitor in production &amp; retrain</text>
  </g>
</svg>
<figcaption><b>The machine-learning lifecycle</b> A project flows from problem definition through data, modeling, and evaluation to maintenance — which loops back as production monitoring triggers retraining.</figcaption>
</figure>

The sequence matters because an error early on — a leaky feature, a biased
sample — quietly poisons everything downstream, yielding insights that are
misleading or worthless.

## The Grammar of Scikit-Learn

Applied work in this course runs on Python's scikit-learn, whose design is
remarkably consistent. Every object is an **estimator**: it learns parameters
from data through a `fit()` method, with any choices you make in advance held as
*hyperparameters*. Objects that clean or reshape data are **transformers**,
exposing `transform()` and the fused `fit_transform()`. Objects that make
predictions are **predictors**, offering `predict()` and a `score()` to grade
themselves. Learned parameters are exposed with a trailing underscore — `coef_`,
`intercept_` — to set them apart from the hyperparameters you supply.

```python
from sklearn.linear_model import LinearRegression
model = LinearRegression()   # an estimator
model.fit(X_train, y_train)  # learn parameters from data
model.coef_                  # learned parameter (trailing underscore)
model.predict(X_new)         # a predictor produces answers
```

This uniformity means that swapping one algorithm for another is often a one-line
change — the reason the course can range across a dozen algorithms without
rewriting the scaffolding each time.

## Too Simple, Too Complex

The recurring hazard of the whole enterprise is **generalization**. A model that
is too simple **underfits** — it cannot capture the real pattern. A model that is
too complex **overfits** — it memorizes noise and stumbles on data it has never
seen. The lecture flags the usual culprits: too little data, poor-quality or
non-representative samples, careless feature engineering. The defense, previewed
here and developed in later lectures, is to hold data back: split off a test set,
and use cross-validation on the training data to choose hyperparameters honestly
before a single final evaluation.

## Why It Matters

This first lecture is a map, not a destination, but the map is the point. Machine
learning is less a bag of algorithms than a disciplined process for turning data
into decisions — one that can mislead as easily as it can illuminate when the
workflow is sloppy. Fixing the vocabulary early (task, measure, experience;
supervised versus unsupervised; instance- versus model-based), internalizing the
lifecycle, and learning the grammar of the tools are what make the rest of the
course — regression, regularization, evaluation, deep learning — legible rather
than magical. Everything that follows is a variation on one theme: given data and
a goal, find the function that generalizes.
