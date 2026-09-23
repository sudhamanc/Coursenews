---
course: bedrock
lectureId: AIMA 13
book: "Artificial Intelligence: A Modern Approach"
part: "IV · Uncertain Knowledge and Reasoning"
title: "Drawing the Dependencies and Getting the Distribution Free"
deck: "Chapter 13 is the payoff for Chapter 12's admission of defeat. Draw a graph of what directly influences what, and the exponential joint distribution collapses into a set of small local tables — with a precise criterion for reading independence off the picture."
order: 13
chapter: 13
readingTime: 14
tags: ["bayesian-networks", "d-separation", "variable-elimination", "mcmc", "causality"]
concepts:
  - id: bayes-net
    term: The Bayesian Network
    definition: "A directed acyclic graph whose nodes are random variables and whose edges denote direct influence, with a conditional probability table at each node given its parents. It specifies the full joint distribution as the product of those local terms."
  - id: chain-rule-factorization
    term: The Factorization
    definition: "P(x₁,…,xₙ) = Π P(xᵢ | parents(Xᵢ)). The network is a complete specification of the joint, and its size is exponential only in the maximum number of parents, not in the number of variables."
  - id: markov-blanket
    term: The Markov Blanket
    definition: "A node is conditionally independent of all other nodes given its parents, children, and children's other parents. This is the local independence statement that makes Gibbs sampling possible."
  - id: d-separation
    term: D-Separation
    definition: "A purely graphical criterion deciding whether X and Y are conditionally independent given evidence Z, by checking whether every path between them is blocked. The explaining-away pattern — a collider that becomes unblocked when observed — is the counterintuitive case."
  - id: variable-elimination
    term: Variable Elimination
    definition: "Exact inference that sums out variables one at a time, storing intermediate factors so that repeated sub-computations are done once. Complexity is exponential in the tree width of the network, not in the number of variables."
  - id: network-complexity
    term: Polytrees and Tree Width
    definition: "Inference in singly connected networks (polytrees) is linear in the network size. In multiply connected networks it is #P-hard in general, and clustering or cutset conditioning reduces it at cost exponential in the tree width."
  - id: approximate-inference
    term: Sampling Methods
    definition: "Direct sampling, rejection sampling, likelihood weighting (which fixes evidence and weights each sample by its likelihood), and Markov chain Monte Carlo such as Gibbs sampling, which resamples each variable from its Markov blanket."
  - id: causal-networks
    term: Causal Networks and the Do-Operator
    definition: "A network whose edges denote causation supports intervention queries P(Y | do(X)), computed by severing X's incoming edges. Conditioning tells you what to expect on observing X; intervening tells you the effect of setting it."
---

Chapter 12 ended with a problem: the full joint distribution answers every query
and cannot be written down. Chapter 13 solves it with an observation about the
structure of real domains — most variables are directly influenced by only a few
others — and a representation that exploits it.

## The Representation

A **Bayesian network** is a directed acyclic graph. Nodes are random variables;
an edge from $X$ to $Y$ means $X$ directly influences $Y$; and each node carries a
**conditional probability table** giving its distribution for each combination of
its parents' values.

The claim that makes this more than a diagram is that the network *is* the joint
distribution:

$$P(x_1, \ldots, x_n) = \prod_{i=1}^{n} P(x_i \mid \textit{parents}(X_i))$$

Nothing is lost. Any probability the full joint could have answered is recoverable
from the network. The saving is in size: a network where each node has at most
$k$ parents needs $O(n \cdot 2^k)$ numbers rather than $O(2^n)$. The chapter's
example of 10 variables going from 1,023 numbers to 20 understates the effect at
realistic scale — at 40 variables it is the difference between a trillion numbers
and a few hundred.

The chapter is careful that both the parameters and the *structure* carry
information. Choosing the wrong node ordering produces a network that is still
correct but far denser, requires more numbers, and looks nothing like the
domain's causal structure. Ordering causes before effects generally yields the
sparsest network, which is the first hint of the chapter's final section.

Efficient parameterizations further compress the tables. **Deterministic** nodes
are functions of their parents. **Noisy-OR** models the case of several
independent causes each of which can independently fail to produce the effect,
reducing $2^k$ parameters to $k$. **Hybrid networks** with both discrete and
continuous variables use conditional Gaussians and, for discrete children of
continuous parents, probit or logit models.

## Reading Independence Off the Picture

Two independence properties come with the structure. Locally, a node is
conditionally independent of its non-descendants given its parents. More
generally, a node is conditionally independent of everything else given its
**Markov blanket**: parents, children, and its children's other parents. That
last group is the one people forget, and the reason for it is the most
interesting phenomenon in the chapter.

**D-separation** is the general criterion, and it is purely graphical. $X$ and
$Y$ are conditionally independent given evidence set $Z$ if every undirected path
between them is **blocked**. A path is blocked at a node $n$ when:

- $n$ is a **chain** ($\rightarrow n \rightarrow$) or a **fork**
  ($\leftarrow n \rightarrow$) **and** $n \in Z$; or
- $n$ is a **collider** ($\rightarrow n \leftarrow$) **and** neither $n$ nor any
  descendant of $n$ is in $Z$.

The collider case reverses the usual intuition. Observing a variable normally
*creates* independence by blocking a path; observing a collider *destroys* it.
This is **explaining away**: two independent causes of a common effect become
dependent once the effect is observed. Learning your car will not start, then
learning the battery is fine, raises the probability of a fuel problem — even
though battery and fuel were independent before the failure was observed.

<figure>
<svg viewBox="0 0 840 290" role="img" aria-label="Three path patterns in a Bayesian network: a chain and a fork are blocked when the middle node is observed, while a collider is blocked when unobserved and becomes unblocked when the collider or its descendant is observed.">
  <defs>
    <marker id="arw-aima13-dsep" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" class="dgm-fill"/>
    </marker>
  </defs>
  <text x="140" y="28" text-anchor="middle" font-size="12" font-weight="700">CHAIN</text>
  <circle cx="60" cy="72" r="16" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="60" y="77" text-anchor="middle" font-size="11">X</text>
  <circle cx="140" cy="72" r="16" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="140" y="77" text-anchor="middle" font-size="11">M</text>
  <circle cx="220" cy="72" r="16" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="220" y="77" text-anchor="middle" font-size="11">Y</text>
  <line x1="77" y1="72" x2="122" y2="72" stroke="currentColor" stroke-width="1.4" marker-end="url(#arw-aima13-dsep)"/>
  <line x1="157" y1="72" x2="202" y2="72" stroke="currentColor" stroke-width="1.4" marker-end="url(#arw-aima13-dsep)"/>
  <text x="140" y="116" text-anchor="middle" font-size="10.5" class="dgm-muted">blocked when M observed</text>
  <text x="420" y="28" text-anchor="middle" font-size="12" font-weight="700">FORK</text>
  <circle cx="420" cy="48" r="16" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="420" y="53" text-anchor="middle" font-size="11">M</text>
  <circle cx="350" cy="106" r="16" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="350" y="111" text-anchor="middle" font-size="11">X</text>
  <circle cx="490" cy="106" r="16" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="490" y="111" text-anchor="middle" font-size="11">Y</text>
  <line x1="408" y1="60" x2="362" y2="94" stroke="currentColor" stroke-width="1.4" marker-end="url(#arw-aima13-dsep)"/>
  <line x1="432" y1="60" x2="478" y2="94" stroke="currentColor" stroke-width="1.4" marker-end="url(#arw-aima13-dsep)"/>
  <text x="420" y="146" text-anchor="middle" font-size="10.5" class="dgm-muted">blocked when M observed</text>
  <g class="dgm-accent">
    <text x="700" y="28" text-anchor="middle" font-size="12" font-weight="700">COLLIDER</text>
    <circle cx="630" cy="48" r="16" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <text x="630" y="53" text-anchor="middle" font-size="11">X</text>
    <circle cx="770" cy="48" r="16" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <text x="770" y="53" text-anchor="middle" font-size="11">Y</text>
    <circle cx="700" cy="106" r="16" class="dgm-soft" stroke="currentColor" stroke-width="1.8"/>
    <text x="700" y="111" text-anchor="middle" font-size="11">M</text>
    <line x1="642" y1="60" x2="688" y2="94" stroke="currentColor" stroke-width="1.4" marker-end="url(#arw-aima13-dsep)"/>
    <line x1="758" y1="60" x2="712" y2="94" stroke="currentColor" stroke-width="1.4" marker-end="url(#arw-aima13-dsep)"/>
    <text x="700" y="146" text-anchor="middle" font-size="10.5" font-weight="700">UNblocked when M observed</text>
  </g>
  <line x1="40" y1="176" x2="800" y2="176" stroke="currentColor" stroke-width="1" class="dgm-muted"/>
  <text x="420" y="206" text-anchor="middle" font-size="11.5">observing a node normally <tspan font-weight="700">creates</tspan> independence — at a collider it <tspan font-weight="700">destroys</tspan> it</text>
  <text x="420" y="232" text-anchor="middle" font-size="11">the car will not start; the battery is fine; therefore the fuel probably is not</text>
  <text x="420" y="256" text-anchor="middle" font-size="10.5" class="dgm-muted">battery and fuel were independent until their shared effect was observed</text>
  <text x="420" y="280" text-anchor="middle" font-size="10.5" class="dgm-muted">this is why a node's Markov blanket includes its children's other parents</text>
</svg>
<figcaption><b>Explaining away.</b> The collider rule is the one that catches people out, and it is the reason conditioning on a common effect can introduce a dependency that was not there before.</figcaption>
</figure>

## Exact Inference

The query is $\mathbf{P}(X \mid \mathbf{e})$, computed by summing the joint over
the hidden variables. **Enumeration** does this directly and recomputes the same
subexpressions repeatedly.

**Variable elimination** fixes that by working right to left, summing out one
variable at a time and storing each intermediate result as a **factor** — a
multidimensional array over the variables it still mentions. Factors are
multiplied via pointwise product and reduced via summing out. Variables
irrelevant to the query — those not ancestors of the query or evidence
variables — can be dropped entirely before starting.

The complexity result is the important one. For **polytrees** (singly connected
networks, at most one undirected path between any two nodes), both time and space
are linear in the network size. For **multiply connected** networks, exact
inference is **#P-hard** — at least as hard as counting satisfying assignments,
so worse than NP-complete. The governing parameter is the **tree width** of the
network's moralized graph, and the cost is exponential in it. The elimination
*ordering* determines the tree width achieved, and finding the optimal ordering
is itself NP-hard, so heuristics such as min-fill and min-degree are standard.

Two exact methods handle multiply connected networks. **Clustering** (the
junction tree algorithm) merges nodes into clusters until the network is a tree,
then runs polytree inference on the result. **Cutset conditioning** instantiates
a set of variables whose removal leaves a polytree and sums over the assignments.
Both reproduce Chapter 5's structural results, which is not coincidence — the
same tree-width parameter governs both.

## Approximate Inference

When exact inference is infeasible, sample.

**Direct sampling** generates full assignments in topological order, each
variable sampled from its conditional given the already-sampled parents.
**Rejection sampling** discards samples inconsistent with the evidence, which is
correct and catastrophically wasteful when the evidence is unlikely — and the
evidence is usually unlikely, since it is a conjunction of specific observations.

**Likelihood weighting** fixes this by never generating inconsistent samples:
evidence variables are clamped to their observed values, non-evidence variables
sampled as usual, and each sample carries a **weight** equal to the product of
the likelihoods of the evidence given its parents. All samples count, weighted.
Its weakness is that when evidence appears late in the topological order, most of
the sampling is done without regard to it and the weights become highly skewed.

**Markov chain Monte Carlo** takes a different approach: wander through the state
space, generating each sample by modifying the previous one. **Gibbs sampling**
resamples one non-evidence variable at a time from its distribution given its
**Markov blanket** — which is why that concept was introduced earlier. The chain
converges to the true posterior, and estimates are formed from the visited
states. The chapter is appropriately careful about the caveats: convergence is
asymptotic, the **mixing time** can be long, the initial **burn-in** samples must
be discarded, and diagnosing convergence is genuinely difficult. The
Metropolis–Hastings generalization allows arbitrary proposal distributions with
an acceptance rule that preserves the stationary distribution.

## Causation

The final section makes a distinction that is easy to miss and impossible to
unsee afterward. A Bayesian network encodes a joint distribution; many different
networks encode the same distribution. A **causal network** is one whose edges
are claimed to be causal, and it supports a query type that ordinary conditioning
cannot answer.

$P(Y \mid X = x)$ asks what to expect about $Y$ upon *observing* $X = x$.
$P(Y \mid do(X = x))$ asks what happens if we *set* $X = x$. These differ
whenever a common cause exists. The **do-operator** is computed by severing $X$'s
incoming edges — the intervention overrides whatever normally determines $X$ —
and then performing ordinary inference in the mutilated network.

The **back-door criterion** identifies a set of variables whose adjustment
suffices to estimate the causal effect from observational data. The chapter's
practical upshot is that if your network's structure is merely predictive, it
cannot answer questions about interventions — and questions about interventions
are exactly what decision-making requires.

## Why It Matters

Bayesian networks are the cleanest demonstration in the book of the theme running
through Chapters 5, 11, and 13: **structure is what makes computation feasible**.
The same insight — conditional independence, read off a graph — reappears as the
Markov assumption in Chapter 14, as the factored representation in Chapter 16,
and as the architectural priors of convolutional and attention-based networks in
Chapter 22, which are assumptions about which variables directly influence which.

The causal material is the part that has grown most in importance. Modern
predictive systems are extremely good at $P(Y \mid X)$ and are routinely deployed
to answer questions of the form $P(Y \mid do(X))$ — will this intervention help,
will this policy change the outcome — which they are not built to answer. The
do-operator is the notation that makes the gap explicit, and this chapter is
where it enters the canonical curriculum.
