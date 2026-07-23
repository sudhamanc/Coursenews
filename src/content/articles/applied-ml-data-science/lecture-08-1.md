---
course: applied-ml-data-science
lectureId: L08
title: "Fewer Axes, Sharper Vision"
deck: "Principal components collapse redundant features onto the directions that matter, discriminant analysis draws the class boundaries, and k-means hunts for structure no one labeled — a tour of learning shape from high-dimensional data."
order: 8
date: 2025-03-24
readingTime: 10
tags: ["pca", "dimensionality-reduction", "clustering", "k-means", "unsupervised"]
concepts:
  - id: pca
    term: Principal Component Analysis
    definition: "An unsupervised method that projects centered data onto orthogonal directions of maximum variance, reducing the number of features while preserving as much information as possible."
  - id: svd
    term: Singular Value Decomposition
    definition: "The factorization X = U S Vᵀ that PCA is computed from; the rows of Vᵀ are the principal directions and the singular values on S measure how much variance each direction captures."
  - id: lda
    term: Linear Discriminant Analysis
    definition: "A generative classifier that models each class as a Gaussian sharing a single covariance matrix, which yields straight-line decision boundaries and stable multi-class behavior."
  - id: qda
    term: Quadratic Discriminant Analysis
    definition: "A relative of LDA that gives every class its own covariance matrix, producing curved boundaries at the cost of estimating more parameters — favored when training data is plentiful."
  - id: k-means
    term: K-Means Clustering
    definition: "An algorithm that partitions data into k groups by alternately assigning each point to its nearest centroid and recomputing centroids as cluster means, minimizing the within-cluster squared distance called inertia."
  - id: k-means-plus-plus
    term: K-Means++ Initialization
    definition: "A smarter seeding scheme that spreads starting centroids apart by choosing each new seed with probability proportional to its squared distance from the nearest already-chosen center."
  - id: silhouette-score
    term: Silhouette Score
    definition: "A label-free measure of cluster quality; for each point s = (b − a) / max(a, b), where a is its mean intra-cluster distance and b its mean distance to the nearest other cluster, ranging from −1 to 1."
---

High-dimensional data is deceptively hostile. A dataset with hundreds of features
looks rich, but most of those features are correlated, noisy, or nearly constant,
and the sheer number of them makes models slow to train, prone to overfitting, and
impossible to plot. This lecture is about fighting back on two fronts: first by
**reducing** dimensions to the handful of directions that actually carry signal,
and then by **discovering** structure — class boundaries and natural groupings —
inside that leaner space.

## Principal Components: The Axes That Matter

**Principal Component Analysis** is the most widely used dimensionality-reduction
algorithm, and its instinct is simple: find the directions along which the data
varies most, and describe each point by its coordinates along those directions.
Formally, PCA seeks the projection that preserves the maximum amount of variance,
which is equivalent to minimizing the reconstruction error $\lVert X - X_{\text{proj}} \rVert$.
It is unsupervised — it never looks at labels — and it expects the data to be
**centered** first, with features scaled to comparable ranges so that one
large-valued column cannot dominate purely by its units.

<figure>
<svg viewBox="0 0 560 340" role="img" aria-label="PCA projection: an elongated cloud of points with the first principal component along the direction of greatest variance and the second orthogonal to it; one point is projected onto the first component.">
  <defs>
    <marker id="arw-pca" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" class="dgm-fill"/>
    </marker>
  </defs>
  <line x1="60" y1="300" x2="522" y2="300" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-pca)"/>
  <line x1="60" y1="300" x2="60" y2="58" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-pca)"/>
  <text x="516" y="320" text-anchor="middle" font-size="12">x₁</text>
  <text x="46" y="54" text-anchor="middle" font-size="12">x₂</text>
  <g class="dgm-fill">
    <circle cx="180" cy="248" r="3.6"/>
    <circle cx="205" cy="236" r="3.6"/>
    <circle cx="230" cy="218" r="3.6"/>
    <circle cx="255" cy="226" r="3.6"/>
    <circle cx="280" cy="205" r="3.6"/>
    <circle cx="300" cy="190" r="3.6"/>
    <circle cx="320" cy="200" r="3.6"/>
    <circle cx="345" cy="178" r="3.6"/>
    <circle cx="370" cy="168" r="3.6"/>
    <circle cx="395" cy="175" r="3.6"/>
    <circle cx="410" cy="152" r="3.6"/>
  </g>
  <g class="dgm-accent">
    <line x1="170" y1="255" x2="425" y2="138" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-pca)"/>
  </g>
  <text x="440" y="132" text-anchor="middle" font-size="12" class="dgm-accent">PC₁</text>
  <g class="dgm-accent-2">
    <line x1="270" y1="143" x2="320" y2="251" stroke="currentColor" stroke-width="1.5"/>
  </g>
  <text x="332" y="256" text-anchor="middle" font-size="12" class="dgm-accent-2">PC₂</text>
  <line x1="300" y1="240" x2="283" y2="203" stroke="currentColor" stroke-width="1.2" stroke-dasharray="4 3" class="dgm-muted"/>
  <g class="dgm-accent-2">
    <circle cx="300" cy="240" r="4" fill="currentColor"/>
  </g>
  <circle cx="283" cy="203" r="3.4" fill="none" stroke="currentColor" stroke-width="1.4"/>
  <text x="243" y="238" text-anchor="middle" font-size="10" class="dgm-muted">projection</text>
</svg>
<figcaption><b>Principal components.</b> PCA rotates the axes onto the directions of greatest variance — PC₁ captures the most spread, PC₂ the orthogonal remainder — and each point is described by its projection onto those axes.</figcaption>
</figure>

### The SVD Recipe

PCA is computed through the **Singular Value Decomposition** of the centered data
matrix:

$$
X = U S V^{\top}
$$

Here $V^{\top}$ holds the principal directions in its rows — each an eigenvector of
the covariance — and $S$ carries the singular values, whose squares are proportional
to the variance each direction explains. To reduce to $d$ dimensions, keep the top
$d$ rows of $V^{\top}$ and project:

```python
X_centered = X - X.mean(axis=0)
U, s, Vt = np.linalg.svd(X_centered)
W_d = Vt.T[:, :2]          # top two principal directions
X2D = X_centered.dot(W_d)  # project onto them
```

The projection and its approximate inverse are a matched pair,
$X_{\text{proj}} = X W_d$ and $X_{\text{recovered}} = X_{\text{proj}} W_d^{\top}$,
which is why PCA doubles as a compression scheme: store the small projection, then
reconstruct a close approximation on demand. Crucially, PCA performs feature
*extraction*, not feature *selection* — each principal component is a blend of all
original features, inspected through `pca.explained_variance_ratio_`, not a subset
of them.

## From Compression to Regularization

Trimming dimensions does more than save space. Because it strips away low-variance
noise, PCA can act as a **regularizer**: a logistic-regression pipeline that
overfits at a perfect training score and a lower test score often generalizes
*better* once its inputs are compressed to a few components. The number of
components is itself a hyperparameter — set it to an integer, or ask PCA to keep
enough components to retain, say, 90% of the variance with `PCA(n_components=0.90)`,
and tune it by cross-validation. Two variants extend the idea: **Incremental PCA**
fits in mini-batches when the data will not fit in memory, and **Kernel PCA** maps
inputs through a kernel (an RBF, for instance) before projecting, so it can unfold
structure that is not linearly separable.

## When Straight Lines Bend

PCA is linear, and some structure lives on a curved **manifold** that no straight
projection can flatten faithfully. For visualization, **t-SNE** (t-distributed
stochastic neighbor embedding) offers an alternative: it builds a two-dimensional
layout that keeps nearby points close and pushes distant points apart, emphasizing
local neighborhoods over global distances. The catch is that it is a visualization
tool, not a transformer — it produces a map of the training data but cannot embed
new points, so it never enters a prediction pipeline.

## Drawing the Boundary: Discriminant Analysis

Where PCA ignores labels, **discriminant analysis** puts them front and center. It
assumes each class $k$ generates its features from a Gaussian, $P(X = x \mid Y = k) = f_k(x)$,
and then inverts that assumption with Bayes' rule to score a new point:

$$
P(Y = k \mid X = x) = \frac{f_k(x)\,\pi_k}{\sum_{l} f_l(x)\,\pi_l}
$$

where $\pi_k$ is the prior probability of class $k$. The Gaussian density itself is

$$
f_k(x) = \frac{1}{(2\pi)^{n/2}\,|\Sigma|^{1/2}}\exp\!\left(-\tfrac{1}{2}(x - \mu_k)^{\top}\Sigma^{-1}(x - \mu_k)\right).
$$

The single modeling choice that splits the family in two is the covariance.
**Linear Discriminant Analysis** forces every class to share one covariance matrix
$\Sigma$; the quadratic terms cancel in the log-ratio between classes and the
boundary comes out straight. **Quadratic Discriminant Analysis** lets each class
keep its own $\Sigma_k$, so the boundary curves. The tradeoff is practical: LDA is
more stable and better suited to multi-class problems and small training sets,
while QDA's extra flexibility pays off only when there is enough data to estimate a
separate covariance per class.

## Finding Groups Without Labels

Sometimes there are no labels at all, only a suspicion that the data falls into
natural groups — for customer segmentation, anomaly detection, or as a preprocessing
step. **K-Means** is the classic answer. Pick $k$; scatter $k$ initial centroids;
then repeat two steps until the centroids stop moving: assign each point to its
nearest centroid, and move each centroid to the mean of the points assigned to it.

<figure>
<svg viewBox="0 0 560 340" role="img" aria-label="K-means clustering: points grouped into three clusters, each joined by lines to its centroid, with the three centroids marked as crosses.">
  <defs>
    <marker id="arw-kmeans" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" class="dgm-fill"/>
    </marker>
  </defs>
  <line x1="60" y1="300" x2="522" y2="300" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-kmeans)"/>
  <line x1="60" y1="300" x2="60" y2="58" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-kmeans)"/>
  <text x="516" y="320" text-anchor="middle" font-size="12">x₁</text>
  <text x="46" y="54" text-anchor="middle" font-size="12">x₂</text>
  <g class="dgm-muted">
    <line x1="130" y1="120" x2="147" y2="131" stroke="currentColor" stroke-width="1"/>
    <line x1="155" y1="110" x2="147" y2="131" stroke="currentColor" stroke-width="1"/>
    <line x1="145" y1="140" x2="147" y2="131" stroke="currentColor" stroke-width="1"/>
    <line x1="170" y1="130" x2="147" y2="131" stroke="currentColor" stroke-width="1"/>
    <line x1="135" y1="155" x2="147" y2="131" stroke="currentColor" stroke-width="1"/>
    <line x1="390" y1="140" x2="405" y2="162" stroke="currentColor" stroke-width="1"/>
    <line x1="415" y1="150" x2="405" y2="162" stroke="currentColor" stroke-width="1"/>
    <line x1="405" y1="175" x2="405" y2="162" stroke="currentColor" stroke-width="1"/>
    <line x1="430" y1="165" x2="405" y2="162" stroke="currentColor" stroke-width="1"/>
    <line x1="385" y1="180" x2="405" y2="162" stroke="currentColor" stroke-width="1"/>
    <line x1="250" y1="240" x2="269" y2="256" stroke="currentColor" stroke-width="1"/>
    <line x1="285" y1="245" x2="269" y2="256" stroke="currentColor" stroke-width="1"/>
    <line x1="265" y1="265" x2="269" y2="256" stroke="currentColor" stroke-width="1"/>
    <line x1="300" y1="258" x2="269" y2="256" stroke="currentColor" stroke-width="1"/>
    <line x1="245" y1="270" x2="269" y2="256" stroke="currentColor" stroke-width="1"/>
  </g>
  <g class="dgm-fill">
    <circle cx="130" cy="120" r="3.6"/>
    <circle cx="155" cy="110" r="3.6"/>
    <circle cx="145" cy="140" r="3.6"/>
    <circle cx="170" cy="130" r="3.6"/>
    <circle cx="135" cy="155" r="3.6"/>
    <circle cx="390" cy="140" r="3.6"/>
    <circle cx="415" cy="150" r="3.6"/>
    <circle cx="405" cy="175" r="3.6"/>
    <circle cx="430" cy="165" r="3.6"/>
    <circle cx="385" cy="180" r="3.6"/>
    <circle cx="250" cy="240" r="3.6"/>
    <circle cx="285" cy="245" r="3.6"/>
    <circle cx="265" cy="265" r="3.6"/>
    <circle cx="300" cy="258" r="3.6"/>
    <circle cx="245" cy="270" r="3.6"/>
  </g>
  <g class="dgm-accent">
    <line x1="138" y1="122" x2="156" y2="140" stroke="currentColor" stroke-width="2"/>
    <line x1="156" y1="122" x2="138" y2="140" stroke="currentColor" stroke-width="2"/>
    <line x1="396" y1="153" x2="414" y2="171" stroke="currentColor" stroke-width="2"/>
    <line x1="414" y1="153" x2="396" y2="171" stroke="currentColor" stroke-width="2"/>
    <line x1="260" y1="247" x2="278" y2="265" stroke="currentColor" stroke-width="2"/>
    <line x1="278" y1="247" x2="260" y2="265" stroke="currentColor" stroke-width="2"/>
  </g>
  <text x="147" y="98" text-anchor="middle" font-size="12" class="dgm-accent">μ₁</text>
  <text x="405" y="139" text-anchor="middle" font-size="12" class="dgm-accent">μ₂</text>
  <text x="269" y="285" text-anchor="middle" font-size="12" class="dgm-accent">μ₃</text>
  <text x="300" y="44" text-anchor="middle" font-size="11" class="dgm-muted">✕ centroid = mean of assigned points</text>
</svg>
<figcaption><b>K-means.</b> Every point is assigned to its nearest centroid (thin spokes); each centroid (✕) then moves to the mean of its cluster, and the two steps repeat until the assignment stops changing.</figcaption>
</figure>

```python
from sklearn.cluster import KMeans
kmeans = KMeans(n_clusters=k, init='k-means++', n_init=10, random_state=42)
kmeans.fit(X)
kmeans.inertia_   # sum of squared distances to nearest centroid
```

The quantity being minimized is **inertia**, the total squared distance from points
to their centroids. Two questions haunt the method: where to start, and how many
clusters to use. Random starts can converge to poor solutions, so **K-Means++**
seeds centroids far apart by sampling each new center with probability proportional
to its squared distance from the nearest existing one. For choosing $k$, the *elbow
method* watches inertia fall and looks for the bend, while the more principled
**silhouette score**,

$$
s(i) = \frac{b(i) - a(i)}{\max\{a(i),\, b(i)\}} \in [-1, 1],
$$

compares each point's mean distance to its own cluster ($a$) against its distance to
the nearest rival cluster ($b$); scores near 1 mean tight, well-separated clusters.
For large datasets, **Mini-batch K-Means** trades a little accuracy for speed by
updating on random subsets. K-Means remains simple and fast, but it assumes clusters
are roughly round and equally sized — an assumption the next lecture sets out to
break.

## Why It Matters

Dimensionality reduction and clustering are the quiet workhorses that make the rest
of machine learning tractable. PCA turns unwieldy feature spaces into compact,
faster-to-train, less-overfit representations; discriminant analysis shows that a few
Gaussian assumptions can yield principled, probabilistic classifiers; and k-means
extracts structure from data no human ever annotated. Together they embody a central
skill of the applied practitioner — seeing the low-dimensional shape hiding inside
high-dimensional noise.
