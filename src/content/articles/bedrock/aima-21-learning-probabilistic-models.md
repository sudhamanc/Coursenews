---
course: bedrock
lectureId: AIMA 21
book: "Artificial Intelligence: A Modern Approach"
part: "V · Machine Learning"
title: "Learning Is Just Inference About Parameters"
deck: "Chapter 21 collapses the distinction between Part IV and Part V. If parameters are random variables, then learning is Bayesian updating — and the awkward case where the data is incomplete produces the EM algorithm, which bootstraps a model out of variables nobody ever observed."
order: 21
chapter: 21
readingTime: 13
tags: ["bayesian-learning", "maximum-likelihood", "em-algorithm", "priors", "mixture-models"]
concepts:
  - id: bayesian-learning
    term: Bayesian Learning
    definition: "Treat hypotheses as random variables and compute P(hᵢ | d) ∝ P(d | hᵢ) P(hᵢ). Predictions average over all hypotheses weighted by posterior probability, which is optimal and generally intractable."
  - id: map-ml
    term: MAP and Maximum Likelihood
    definition: "Approximations that commit to a single hypothesis. MAP maximizes P(d | h) P(h); maximum likelihood drops the prior and maximizes P(d | h) alone, which is MAP under a uniform prior and converges to the same answer with enough data."
  - id: mdl-connection
    term: The MDL Connection
    definition: "Maximizing P(d | h) P(h) is equivalent to minimizing −log P(d | h) − log P(h): the bits to encode the data given the hypothesis plus the bits to encode the hypothesis. Bayesian learning and minimum description length are the same objective in different units."
  - id: complete-data-learning
    term: Learning with Complete Data
    definition: "When every variable is observed in every example, maximum-likelihood parameter learning decomposes: each conditional probability table is estimated from its own counts independently, making it a counting exercise."
  - id: conjugate-priors
    term: Conjugate Priors and Smoothing
    definition: "A prior whose posterior stays in the same family — the Beta for a binomial parameter. Its hyperparameters act as virtual counts, which is exactly Laplace smoothing, and prevent a zero count from producing a zero probability."
  - id: naive-bayes-learning
    term: Learning Naive Bayes and Linear Gaussians
    definition: "Under the naive Bayes structure, learning reduces to counting class frequencies and per-class feature frequencies. For linear Gaussian models, maximizing likelihood is exactly least-squares regression."
  - id: em-algorithm
    term: The EM Algorithm
    definition: "For incomplete data: E-step computes expected values of hidden variables under current parameters; M-step maximizes likelihood as if those expectations were observed. Each iteration provably does not decrease likelihood, converging to a local optimum."
  - id: latent-variables
    term: Why Latent Variables Are Worth It
    definition: "A hidden cause can drastically reduce the number of parameters, since without it the observed variables must be connected directly to each other. Models with latent structure are smaller and often generalize better."
---

Part IV showed how to reason with a probabilistic model. Part V has been showing
how to learn from data. Chapter 21 observes that these are the same activity.

If the parameters of a model are treated as **random variables**, then learning
is just inference: compute the posterior over parameters given the data, exactly
as Chapter 13 computes a posterior over anything else. The chapter's framing is
that statistical learning is not a separate discipline with its own foundations —
it is Bayesian inference applied to a particular class of query.

## The Full Bayesian View

Given hypotheses $h_i$ and data $\mathbf{d}$,

$$P(h_i \mid \mathbf{d}) \propto P(\mathbf{d} \mid h_i) P(h_i)$$

and predictions average over all hypotheses weighted by their posteriors:

$$P(X \mid \mathbf{d}) = \sum_i P(X \mid h_i) P(h_i \mid \mathbf{d})$$

The chapter's candy-bag example — inferring the flavor ratio of a bag from the
candies drawn — makes the mechanics concrete, and shows the posterior
concentrating on the true hypothesis as evidence accumulates.

Two properties matter. Bayesian prediction is **optimal**: no other method does
better in expectation given the same prior. And it is generally **intractable**,
because the sum or integral over the hypothesis space is unmanageable for any
realistic model.

So approximations commit to a single hypothesis. **MAP** takes the maximizer of
$P(\mathbf{d} \mid h)P(h)$. **Maximum likelihood** drops the prior and maximizes
$P(\mathbf{d} \mid h)$, which is MAP under a uniform prior. The chapter is clear
about the trade: both ignore the *spread* of the posterior, so they are
overconfident when data is scarce, and both converge to the Bayesian answer as
data accumulates, because the likelihood eventually swamps the prior.

The **MDL connection** is worth pausing on. Taking logarithms, maximizing
$P(\mathbf{d} \mid h)P(h)$ is minimizing

$$-\log_2 P(\mathbf{d} \mid h) - \log_2 P(h)$$

which is the number of bits to encode the data given the hypothesis, plus the
bits to encode the hypothesis. Bayesian learning with a prior favoring simple
hypotheses **is** minimum description length, which **is** regularization from
Chapter 19. Three vocabularies, one objective — and the prior is where Ockham's
razor lives.

## When Everything Is Observed

With **complete data** — every variable's value present in every example —
maximum-likelihood learning is straightforward, and the reason is a decomposition
result.

The log-likelihood of a Bayesian network's data is a sum of terms, one per
conditional probability table, each depending only on its own parameters. So the
tables can be maximized **independently**, and each one's maximum-likelihood
estimate is simply the observed frequency. Learning becomes counting.

Three standard cases follow. Estimating a Bernoulli parameter gives the observed
proportion. Learning a **naive Bayes** classifier reduces to counting class
frequencies and per-class feature frequencies — which is why it trains in one
pass and remains a reasonable baseline. And for **linear Gaussian** models,
maximizing likelihood under Gaussian noise is *exactly* minimizing squared error,
which supplies the probabilistic justification for least squares that Chapter 19
used without deriving.

The **zero-count problem** is the practical wrinkle: an outcome never observed
gets probability zero, which then annihilates any product it appears in. The
principled fix comes from the prior. A **Beta** prior on a binomial parameter is
**conjugate** — the posterior is again Beta — and its hyperparameters behave
exactly like **virtual counts** observed before the data arrived. Laplace
smoothing, usually introduced as a hack, turns out to be Bayesian inference with
a particular prior.

## When Something Is Missing

The harder and more interesting case is **incomplete data**: variables that are
hidden, latent, or simply unrecorded. Now the likelihood does not decompose,
because the parameters are coupled through the unobserved values, and there is no
closed-form maximum.

The **EM algorithm** resolves the circularity. The difficulty is that knowing the
parameters would let you infer the hidden values, and knowing the hidden values
would let you estimate the parameters — and you have neither. EM alternates:

- **E-step**: given current parameters, compute the expected values (more
  precisely, the posterior distribution) of the hidden variables.
- **M-step**: maximize the likelihood as though those expectations were the
  observed data, yielding new parameters.

Iterate. The guarantee is that **each iteration does not decrease the
log-likelihood**, so the process converges — to a **local** optimum, which is the
essential caveat. EM is sensitive to initialization and it is standard practice to
run it from multiple starting points.

<figure>
<svg viewBox="0 0 800 250" role="img" aria-label="The EM algorithm as a loop: current parameters produce expected values for the hidden variables in the E-step, and those expected values produce new parameters in the M-step, with likelihood guaranteed not to decrease each cycle.">
  <defs>
    <marker id="arw-aima21-em" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" class="dgm-fill"/>
    </marker>
  </defs>
  <rect x="80" y="76" width="200" height="66" fill="none" stroke="currentColor" stroke-width="1.6"/>
  <text x="180" y="102" text-anchor="middle" font-size="12" font-weight="700">parameters θ</text>
  <text x="180" y="124" text-anchor="middle" font-size="10.5" class="dgm-muted">a guess, initially arbitrary</text>
  <g class="dgm-accent">
    <rect x="520" y="76" width="200" height="66" class="dgm-soft" stroke="currentColor" stroke-width="1.7"/>
    <text x="620" y="102" text-anchor="middle" font-size="12" font-weight="700">hidden values</text>
    <text x="620" y="124" text-anchor="middle" font-size="10.5">expected under θ</text>
  </g>
  <path d="M286 96 Q 400 56 514 96" fill="none" stroke="currentColor" stroke-width="1.7" marker-end="url(#arw-aima21-em)"/>
  <text x="400" y="56" text-anchor="middle" font-size="11.5" font-weight="700">E-step</text>
  <text x="400" y="40" text-anchor="middle" font-size="10" class="dgm-muted">infer what you cannot see</text>
  <path d="M514 124 Q 400 166 286 124" fill="none" stroke="currentColor" stroke-width="1.7" marker-end="url(#arw-aima21-em)"/>
  <text x="400" y="176" text-anchor="middle" font-size="11.5" font-weight="700">M-step</text>
  <text x="400" y="192" text-anchor="middle" font-size="10" class="dgm-muted">re-estimate as if you had seen it</text>
  <text x="400" y="224" text-anchor="middle" font-size="11">each cycle provably does not decrease the likelihood</text>
  <text x="400" y="244" text-anchor="middle" font-size="10.5" class="dgm-muted">— so it converges, though only to a local optimum</text>
</svg>
<figcaption><b>Breaking the circle.</b> Neither the parameters nor the hidden values are known; EM alternates between assuming one to estimate the other, and the likelihood never goes down.</figcaption>
</figure>

Three instances are worked. **Mixture of Gaussians**: the hidden variable is
which component generated each point; the E-step computes soft cluster
assignments and the M-step re-estimates each component's mean, covariance, and
weight. This is soft $k$-means, and the comparison illuminates both — $k$-means
is EM with hard assignments and spherical equal-variance components.

**Bayesian networks with hidden variables**: the E-step computes expected counts
for the unobserved configurations by inference, and the M-step sets the tables to
normalized expected counts.

**Hidden Markov models**: EM here is the **Baum–Welch** algorithm, where the
E-step is Chapter 14's forward–backward smoothing and the M-step re-estimates
transition and sensor models from expected counts. A model of a hidden process
is learned from observations of the process alone, which is a striking thing to
be able to do.

The chapter also addresses **why latent variables are worth the trouble**. A
hidden common cause can dramatically reduce parameter count: with a latent cause,
$n$ observed variables need $O(n)$ parameters; without it, they must be connected
directly to each other and the count explodes. Latent-variable models are smaller
and frequently generalize better — the same argument Chapter 13 made for network
structure, now applied to variables nobody observed.

**Structure learning** closes the chapter: searching over network topologies,
scored by likelihood with a complexity penalty (BIC, or a Bayesian marginal
likelihood). The chapter is appropriately cautious, noting that the search space
is super-exponential and that a learned structure is a statement about
conditional independence, not about causation — which is the caveat Chapter 13's
final section made precise.

## Why It Matters

This chapter supplies the unifying view of learning that makes the rest of the
field legible. Maximum likelihood, least squares, cross-entropy loss, weight
decay, and Laplace smoothing all turn out to be the same activity viewed through
different notation: maximizing a posterior over parameters, with the prior doing
the regularizing.

EM is the specific export with the longest reach. It is the standard method for
mixture models and HMMs, it underlies the classical statistical machine
translation alignment models, and its logic — alternate between inferring what
you cannot see and re-fitting as if you had seen it — recurs in self-training,
pseudo-labeling, and expectation-propagation methods.

And the chapter's framing is the antidote to a common confusion. A trained model
is a point estimate. The posterior it approximates has a *width*, and that width
is the model's uncertainty about its own parameters. Systems that report
confident predictions from a point estimate trained on limited data are
discarding exactly the quantity that would have told them not to be confident.
