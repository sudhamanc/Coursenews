---
course: bedrock
lectureId: AIMA 14
book: "Artificial Intelligence: A Modern Approach"
part: "IV · Uncertain Knowledge and Reasoning"
title: "Keeping a Belief Alive Through Time"
deck: "Chapter 14 adds a clock. Two assumptions — that the present screens off the past, and that the dynamics do not change — turn an unbounded history into a fixed-size recursive update, and produce the filter running inside every tracker, decoder, and localizer."
order: 14
chapter: 14
readingTime: 14
tags: ["hmm", "kalman-filter", "filtering", "viterbi", "dbn"]
concepts:
  - id: markov-assumption
    term: The Markov Assumption
    definition: "The current state depends only on a bounded number of previous states — for a first-order process, only the immediately preceding one. It is what makes the model finite; when it is violated the remedy is to enlarge the state, not to look further back."
  - id: stationarity
    term: Stationarity
    definition: "The transition and sensor models do not change over time, so a single fixed pair of conditional distributions specifies the process for all time. Without it, every time step would need its own parameters."
  - id: filtering-prediction
    term: The Four Inference Tasks
    definition: "Filtering (belief about the present given evidence so far), prediction (about the future), smoothing (about the past given later evidence, which is strictly more accurate), and most likely explanation (the single best state sequence)."
  - id: recursive-estimation
    term: Recursive Filtering
    definition: "The update f₁:ₜ₊₁ = α · O₊₁ · Tᵀ · f₁:ₜ — project the current belief forward through the transition model, then reweight by the new observation's likelihood. Constant time and space per step regardless of how long the sequence runs."
  - id: forward-backward
    term: The Forward–Backward Algorithm
    definition: "Smoothing by combining a forward message from the past with a backward message from the future, giving posteriors over all states in O(t) time rather than O(t²) by recomputation."
  - id: viterbi
    term: The Viterbi Algorithm
    definition: "Most likely explanation computed by replacing the sum in filtering with a max and retaining backpointers. The most likely sequence is not generally the sequence of individually most likely states."
  - id: kalman-filter
    term: The Kalman Filter
    definition: "Exact filtering for linear-Gaussian systems. The posterior stays Gaussian forever, so the entire belief is a mean vector and covariance matrix, and the update is a matrix computation with a gain term balancing prediction against measurement."
  - id: dbn
    term: Dynamic Bayesian Networks
    definition: "A Bayesian network replicated across time slices, generalizing HMMs and Kalman filters by allowing factored state. Exact inference degrades because the state variables become fully coupled, so particle filtering is the standard approximation."
---

An agent that persists needs beliefs that persist. Chapter 13's networks describe
a static world; this chapter asks what happens when the state changes and the
evidence arrives in a stream.

The naive formulation is hopeless. If the state at time $t$ can depend on the
entire history, the model grows without bound and no fixed-size representation
suffices. Two assumptions rescue it, and almost everything in the chapter follows
from them.

## Two Assumptions

The **Markov assumption** states that the current state depends on only a
bounded number of previous states — for a first-order process,
$\mathbf{P}(\mathbf{X}_t \mid \mathbf{X}_{0:t-1}) = \mathbf{P}(\mathbf{X}_t \mid \mathbf{X}_{t-1})$.
The present screens off the past. The chapter's most useful remark about it is
the remedy when it fails: rather than conditioning on more history, **enlarge the
state** to include whatever the future actually depends on. A position-only state
violates the Markov property for a moving object; a position-and-velocity state
restores it. This move — absorbing history into the state variable — recurs
throughout the rest of the book.

The **sensor Markov assumption** adds that evidence depends only on the current
state:
$\mathbf{P}(\mathbf{E}_t \mid \mathbf{X}_{0:t}, \mathbf{E}_{0:t-1}) = \mathbf{P}(\mathbf{E}_t \mid \mathbf{X}_t)$.

**Stationarity** completes the picture: the transition and sensor models are the
same at every step. So the entire process is specified by a prior
$\mathbf{P}(\mathbf{X}_0)$, a transition model, and a sensor model — three
distributions covering all time.

## Four Questions

Given this, four inference tasks are defined, and keeping them distinct matters
because they have different algorithms and different accuracy.

**Filtering** computes $\mathbf{P}(\mathbf{X}_t \mid \mathbf{e}_{1:t})$: belief
about the present given everything observed so far. This is what an online agent
needs.

**Prediction** computes $\mathbf{P}(\mathbf{X}_{t+k} \mid \mathbf{e}_{1:t})$ for
$k > 0$, which is filtering followed by projection forward with no further
evidence. The chapter notes that the predicted distribution converges to the
process's **stationary distribution** as $k$ grows, after which prediction is
uninformative — there is a **mixing time** beyond which the future is
unpredictable regardless of how good the model is.

**Smoothing** computes $\mathbf{P}(\mathbf{X}_k \mid \mathbf{e}_{1:t})$ for
$k < t$ — a belief about the past, informed by evidence that arrived afterward.
It is strictly more accurate than filtering was at the time, which is why offline
analysis beats online tracking.

**Most likely explanation** computes
$\arg\max_{\mathbf{x}_{1:t}} P(\mathbf{x}_{1:t} \mid \mathbf{e}_{1:t})$: the
single best *sequence*. This is emphatically not the sequence of individually
most likely states, because the joint sequence must be internally consistent.

## The Recursive Update

Filtering has the form that makes the whole chapter practical: a **recursive
estimate** in which the new belief is computed from the previous belief and the
new observation alone, without revisiting the history.

$$\mathbf{f}_{1:t+1} = \alpha \, \mathbf{O}_{t+1} \mathbf{T}^{\top} \mathbf{f}_{1:t}$$

In words: take the current belief, push it through the transition model to get a
prediction, then reweight by the likelihood of the new observation and normalize.
Predict, then correct. Time and space per step are constant regardless of how
long the process has been running — which is what allows an agent to run
indefinitely.

**Smoothing** uses the forward–backward decomposition: the posterior at time $k$
is proportional to the forward message from the past times a **backward message**
$\mathbf{b}_{k+1:t}$ summarizing the future evidence. Computing all smoothed
estimates naively is $O(t^2)$; caching the forward messages and sweeping backward
once gives $O(t)$ time with $O(t)$ space, and a fixed-lag variant achieves
constant space when only a bounded delay is needed.

**Viterbi** computes the most likely explanation by the same recursion with the
sum replaced by a max and backpointers retained, so the best path can be recovered
at the end. It is linear in sequence length and one of the most widely deployed
dynamic programs in existence.

<figure>
<svg viewBox="0 0 840 250" role="img" aria-label="A hidden Markov model unrolled across three time slices, with hidden state nodes connected horizontally by the transition model and each emitting an evidence node below through the sensor model, and the filtering update shown as predict then correct.">
  <defs>
    <marker id="arw-aima14-hmm" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" class="dgm-fill"/>
    </marker>
  </defs>
  <circle cx="160" cy="70" r="24" fill="none" stroke="currentColor" stroke-width="1.6"/>
  <text x="160" y="75" text-anchor="middle" font-size="12">X<tspan font-size="9" dy="3">t-1</tspan></text>
  <circle cx="400" cy="70" r="24" fill="none" stroke="currentColor" stroke-width="1.6"/>
  <text x="400" y="75" text-anchor="middle" font-size="12">X<tspan font-size="9" dy="3">t</tspan></text>
  <circle cx="640" cy="70" r="24" fill="none" stroke="currentColor" stroke-width="1.6"/>
  <text x="640" y="75" text-anchor="middle" font-size="12">X<tspan font-size="9" dy="3">t+1</tspan></text>
  <line x1="185" y1="70" x2="374" y2="70" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-aima14-hmm)"/>
  <line x1="425" y1="70" x2="614" y2="70" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-aima14-hmm)"/>
  <text x="280" y="58" text-anchor="middle" font-size="10.5" class="dgm-muted">transition model</text>
  <text x="520" y="58" text-anchor="middle" font-size="10.5" class="dgm-muted">transition model</text>
  <rect x="136" y="150" width="48" height="34" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="160" y="172" text-anchor="middle" font-size="12">E<tspan font-size="9" dy="3">t-1</tspan></text>
  <rect x="376" y="150" width="48" height="34" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="400" y="172" text-anchor="middle" font-size="12">E<tspan font-size="9" dy="3">t</tspan></text>
  <g class="dgm-accent">
    <rect x="616" y="150" width="48" height="34" class="dgm-soft" stroke="currentColor" stroke-width="1.7"/>
    <text x="640" y="172" text-anchor="middle" font-size="12">E<tspan font-size="9" dy="3">t+1</tspan></text>
  </g>
  <line x1="160" y1="96" x2="160" y2="144" stroke="currentColor" stroke-width="1.4" marker-end="url(#arw-aima14-hmm)"/>
  <line x1="400" y1="96" x2="400" y2="144" stroke="currentColor" stroke-width="1.4" marker-end="url(#arw-aima14-hmm)"/>
  <line x1="640" y1="96" x2="640" y2="144" stroke="currentColor" stroke-width="1.4" marker-end="url(#arw-aima14-hmm)"/>
  <text x="700" y="120" font-size="10.5" class="dgm-muted">sensor model</text>
  <text x="420" y="218" text-anchor="middle" font-size="11.5"><tspan font-weight="700">predict</tspan> forward through the transition model, then <tspan font-weight="700">correct</tspan> by the new evidence</text>
  <text x="420" y="242" text-anchor="middle" font-size="10.5" class="dgm-muted">constant work per step, however long the process has run</text>
</svg>
<figcaption><b>The structure every temporal model shares.</b> HMMs, Kalman filters, and DBNs differ in what the state variable is and how the distributions are represented — not in this diagram.</figcaption>
</figure>

## Hidden Markov Models

An **HMM** is the special case where the state is a single discrete variable, so
the transition model is a matrix $\mathbf{T}$ and the sensor model a diagonal
matrix $\mathbf{O}_t$ of observation likelihoods. This turns all four algorithms
into matrix operations, and permits an elegant constant-space smoothing algorithm
that runs the forward recursion backward using $\mathbf{T}^{-1}$ when the
transition matrix is invertible.

The chapter's application is **localization**: a robot that knows the map but not
its position maintains a distribution over locations, updated by motion and
sensor readings. The belief starts uniform and concentrates as evidence
accumulates — which is Chapter 4's belief state with numbers attached, and a good
illustration of why probability improves on set-based reasoning.

## The Kalman Filter

For continuous state with **linear** dynamics and **Gaussian** noise, the
posterior has a remarkable property: it stays Gaussian forever. A Gaussian pushed
through a linear transformation is Gaussian; a Gaussian multiplied by a Gaussian
likelihood is Gaussian. So the infinite-dimensional belief over a continuous
space is represented exactly by a mean vector $\boldsymbol{\mu}_t$ and covariance
matrix $\boldsymbol{\Sigma}_t$, and filtering becomes a fixed matrix computation.

The update has the same predict-correct shape, with the **Kalman gain**
determining how much to trust the new measurement relative to the prediction:
when sensor noise is large the gain is small and the filter relies on its model;
when the model is uncertain the gain is large and the measurement dominates.

The limitations are exactly the assumptions. Real systems are nonlinear, so the
**extended Kalman filter** linearizes around the current estimate — which works
when the local linearization is a good approximation over the relevant scale and
fails when it is not. And unimodality is a hard constraint: a Gaussian cannot
represent "the object went left or right around the obstacle," so a
**switching Kalman filter** or a particle method is required for genuinely
multimodal beliefs.

## Dynamic Bayesian Networks

A **DBN** replicates a Bayesian network across time slices, allowing the state to
be **factored** into many variables with sparse dependencies. HMMs and Kalman
filters are both special cases — an HMM is a DBN with one state variable, a
Kalman filter a DBN with continuous linear-Gaussian variables.

The representational gain is large: a system with 20 Boolean state variables is
an HMM with $2^{20}$ states requiring a $2^{20} \times 2^{20}$ transition matrix,
or a DBN with 20 nodes and a few parents each. But exact inference degrades
badly, because even when the slice structure is sparse, the state variables
become fully coupled in the filtering distribution after a few steps, and the
tree width grows.

So approximation is standard, and the method is **particle filtering**: represent
the belief by a population of weighted samples, propagate each through the
transition model, weight by the observation likelihood, and **resample** in
proportion to weight so that computational effort concentrates in high-probability
regions. It handles nonlinearity and multimodality naturally, and its failure
mode — **particle depletion**, where diversity collapses and the filter becomes
overconfident — is the thing to monitor. **Rao-Blackwellized** particle filters
sample some variables and solve the rest exactly, which is the standard approach
in robot SLAM.

## Why It Matters

This chapter is one of the highest-density practical payoffs in the book. The
forward algorithm and Viterbi are in every speech recognizer, every part-of-speech
tagger, and the decoder of every sequence model; the Kalman filter is in
navigation, tracking, sensor fusion, and control loops throughout engineering;
particle filters are the backbone of robot localization.

The transferable idea is the **recursive state estimate**: maintain a fixed-size
summary of everything relevant from the past, update it with each observation,
and never store the history. That is what a filter is, and it is also what the
hidden state of a recurrent network is trying to be — which is why Chapter 22's
discussion of why RNNs struggle to retain information over long spans reads as a
commentary on this chapter's assumptions.
