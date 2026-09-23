---
course: bedrock
lectureId: AIMA 16
book: "Artificial Intelligence: A Modern Approach"
part: "IV · Uncertain Knowledge and Reasoning"
title: "The Equation Underneath Reinforcement Learning"
deck: "Chapter 16 strings single decisions into sequences and arrives at the Bellman equation — the fixed-point condition that defines optimal behavior over time. Then it removes observability, and the belief state becomes the thing you plan in."
order: 16
chapter: 16
readingTime: 14
tags: ["mdp", "bellman", "value-iteration", "pomdp", "bandits"]
concepts:
  - id: mdp
    term: The Markov Decision Process
    definition: "States, actions, a transition model P(s′ | s, a), and a reward function R. The Markov property makes the current state a sufficient statistic, so the optimal behavior depends on where you are, not how you got there."
  - id: policy
    term: Policies and Discounting
    definition: "A policy maps states to actions; the optimal policy maximizes expected utility from every state. A discount factor γ < 1 keeps infinite-horizon sums finite and expresses a preference for sooner rewards."
  - id: bellman-equation
    term: The Bellman Equation
    definition: "U(s) = R(s) + γ max_a Σ_s′ P(s′ | s, a) U(s′). The utility of a state is its immediate reward plus the discounted expected utility of the best successor — n nonlinear equations in n unknowns, whose solution defines optimality."
  - id: value-iteration
    term: Value Iteration
    definition: "Repeatedly apply the Bellman update as an assignment until convergence. The update is a contraction with factor γ, so it converges to the unique fixed point from any starting estimate at a rate governed by γ."
  - id: policy-iteration
    term: Policy Iteration
    definition: "Alternate policy evaluation — solving the linear system for a fixed policy — with policy improvement, greedily updating actions. It terminates exactly, often in few iterations, since policies converge before values do."
  - id: bandits
    term: Bandit Problems and the Gittins Index
    definition: "The purest exploration–exploitation setting. The Gittins index reduces the n-armed problem to computing a value per arm independently; in the general case, upper-confidence-bound and Thompson sampling achieve logarithmic regret."
  - id: pomdp
    term: POMDPs and the Belief State
    definition: "With partial observability, the agent plans over belief states — probability distributions over physical states. The belief MDP is fully observable in a continuous space, and its optimal policy is a policy over beliefs, not over states."
  - id: pomdp-solving
    term: Solving POMDPs
    definition: "Value iteration over belief space using piecewise-linear convex value functions represented by alpha vectors; point-based methods approximate over sampled beliefs; and online POMDP agents use particle filtering with lookahead search."
---

Chapter 15's agent makes one decision and stops. This chapter makes a sequence of
them, in a world that responds, and the shift changes what "best" means: a good
action now may lead somewhere bad, and a costly action now may open a valuable
region. Optimality becomes a property of *policies* rather than of individual
choices.

## The Model

A **Markov decision process** consists of a set of states, a set of actions, a
transition model $P(s' \mid s, a)$, and a reward function $R(s)$ (or
$R(s, a, s')$). The Markov property — the next state depends only on the current
state and action — is what makes this tractable: the current state is a
**sufficient statistic** for the entire history.

A **policy** $\pi$ maps states to actions, and the optimal policy $\pi^*$
maximizes expected utility from every state. The chapter's observation that the
solution to a sequential problem is a policy rather than a plan is the same
structural point Chapters 4 and 6 made, arriving now with probabilities attached.

For infinite horizons, the sum of rewards must be made finite. **Discounting** is
the standard device:

$$U([s_0, s_1, s_2, \ldots]) = R(s_0) + \gamma R(s_1) + \gamma^2 R(s_2) + \cdots$$

With $0 \le \gamma < 1$ and bounded rewards, the sum converges. The chapter reads
$\gamma$ both as a preference for sooner rewards and as an interest rate, and
notes the alternatives — proper policies that guarantee reaching a terminal state,
or average reward per step.

The reward function deserves more attention than it usually gets, and the chapter
gives it some. A small negative reward per step makes the agent prefer short
paths; make it too negative and the agent takes dangerous shortcuts; make it
positive and the agent never terminates, because existing is profitable. This is
the value alignment problem in a four-by-three grid world, and the fact that it is
visible at that scale is the point.

## The Bellman Equation

The central result is the relation an optimal utility function must satisfy:

$$U(s) = R(s) + \gamma \max_{a} \sum_{s'} P(s' \mid s, a) \, U(s')$$

The utility of a state is its immediate reward plus the discounted expected
utility of the best action's successor. This is $n$ equations in $n$ unknowns,
nonlinear because of the $\max$, and its unique solution defines optimal
behavior. Given $U$, the optimal policy is greedy with respect to it:

$$\pi^*(s) = \arg\max_{a} \sum_{s'} P(s' \mid s, a) \, U(s')$$

**Value iteration** solves it by turning the equation into an assignment and
iterating to convergence. The convergence argument is the elegant part: the
Bellman update is a **contraction** in max-norm with factor $\gamma$, so
successive estimates get closer to the unique fixed point at a geometric rate,
from any initialization. The error bound gives a stopping criterion, and the
chapter notes the practically important fact that the *policy* usually converges
long before the *values* do — so an agent can act optimally while its utility
estimates are still visibly wrong.

**Policy iteration** exploits that directly, alternating two steps. **Policy
evaluation**: for a fixed policy, the $\max$ disappears and the Bellman equations
become linear, solvable exactly in $O(n^3)$ or approximately by a few sweeps.
**Policy improvement**: update each state's action greedily with respect to the
current values. Since there are finitely many policies and each iteration
strictly improves, it terminates — often in remarkably few iterations.
**Modified policy iteration** does a handful of evaluation sweeps instead of an
exact solve, and is usually the best of the three in practice. **Asynchronous**
variants update subsets of states, which permits concentrating effort on the
states that matter.

<figure>
<svg viewBox="0 0 820 260" role="img" aria-label="The Bellman backup shown as a one-step lookahead: from a state, each action leads to a distribution over successor states, and the value of the state is the immediate reward plus the discounted maximum over actions of the expected successor value.">
  <defs>
    <marker id="arw-aima16-bell" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" class="dgm-fill"/>
    </marker>
  </defs>
  <circle cx="90" cy="120" r="22" fill="none" stroke="currentColor" stroke-width="1.7"/>
  <text x="90" y="125" text-anchor="middle" font-size="12" font-weight="700">s</text>
  <text x="90" y="166" text-anchor="middle" font-size="10.5" class="dgm-muted">R(s)</text>
  <g class="dgm-accent">
    <line x1="113" y1="108" x2="228" y2="72" stroke="currentColor" stroke-width="1.8" marker-end="url(#arw-aima16-bell)"/>
    <text x="168" y="70" text-anchor="middle" font-size="10.5" font-weight="700">a₁</text>
  </g>
  <line x1="113" y1="134" x2="228" y2="172" stroke="currentColor" stroke-width="1.4" marker-end="url(#arw-aima16-bell)"/>
  <text x="168" y="178" text-anchor="middle" font-size="10.5" class="dgm-muted">a₂</text>
  <circle cx="246" cy="66" r="7" class="dgm-fill"/>
  <circle cx="246" cy="180" r="7" class="dgm-fill"/>
  <line x1="254" y1="60" x2="352" y2="34" stroke="currentColor" stroke-width="1.2" marker-end="url(#arw-aima16-bell)"/>
  <line x1="254" y1="72" x2="352" y2="98" stroke="currentColor" stroke-width="1.2" marker-end="url(#arw-aima16-bell)"/>
  <line x1="254" y1="174" x2="352" y2="148" stroke="currentColor" stroke-width="1.2" marker-end="url(#arw-aima16-bell)"/>
  <line x1="254" y1="186" x2="352" y2="212" stroke="currentColor" stroke-width="1.2" marker-end="url(#arw-aima16-bell)"/>
  <text x="300" y="30" text-anchor="middle" font-size="9.5" class="dgm-muted">P(s′|s,a)</text>
  <circle cx="374" cy="30" r="16" fill="none" stroke="currentColor" stroke-width="1.4"/>
  <text x="374" y="35" text-anchor="middle" font-size="10">s′</text>
  <circle cx="374" cy="102" r="16" fill="none" stroke="currentColor" stroke-width="1.4"/>
  <text x="374" y="107" text-anchor="middle" font-size="10">s′</text>
  <circle cx="374" cy="144" r="16" fill="none" stroke="currentColor" stroke-width="1.4"/>
  <text x="374" y="149" text-anchor="middle" font-size="10">s′</text>
  <circle cx="374" cy="216" r="16" fill="none" stroke="currentColor" stroke-width="1.4"/>
  <text x="374" y="221" text-anchor="middle" font-size="10">s′</text>
  <line x1="440" y1="120" x2="486" y2="120" stroke="currentColor" stroke-width="1.4" stroke-dasharray="4 3"/>
  <text x="640" y="104" text-anchor="middle" font-size="13" font-weight="700">U(s) = R(s) + γ max</text>
  <text x="640" y="132" text-anchor="middle" font-size="11.5">Σ P(s′ | s,a) U(s′)</text>
  <text x="640" y="170" text-anchor="middle" font-size="10.5" class="dgm-muted">the update is a contraction with factor γ,</text>
  <text x="640" y="188" text-anchor="middle" font-size="10.5" class="dgm-muted">so iterating it converges from anywhere</text>
</svg>
<figcaption><b>One step of lookahead, applied forever.</b> Value iteration is this backup repeated until the estimates stop moving; because the backup contracts, they always do.</figcaption>
</figure>

## Bandits

**Bandit problems** isolate the exploration–exploitation trade-off: $n$ arms,
each with an unknown reward distribution, and every pull is both a chance to earn
and a chance to learn.

The remarkable classical result is the **Gittins index**, which under certain
conditions reduces the problem to computing an index for each arm
*independently* and always pulling the highest — a coupled problem decomposed
into separable ones. For the general case, two practical families dominate.
**Upper confidence bound** methods select the arm maximizing an optimistic
estimate — empirical mean plus a confidence term that shrinks with pulls —
achieving regret logarithmic in the number of trials. **Thompson sampling**
maintains a posterior over each arm's parameters, samples from it, and plays the
sampled best; it is elegant, easy to implement, and empirically excellent.

The framing that transfers is **regret**: not "did I get the best outcome" but
"how much worse did I do than the best fixed choice in hindsight." That is the
right measure for any system learning while acting.

## When You Cannot See the State

A **POMDP** adds a sensor model $P(e \mid s)$ and removes the assumption that the
agent knows its state. This is a more serious change than it appears.

The agent's decisions must depend on its **belief state** $b$ — a probability
distribution over physical states — updated by filtering after each action and
observation. The key theorem: the optimal action depends only on the current
belief state, so the POMDP becomes a **belief MDP** that is fully observable, at
the cost of a continuous, high-dimensional state space.

That reduction is theoretically clean and computationally punishing. Exact value
iteration over belief space exploits the fact that the value function is
**piecewise linear and convex**, represented as a set of **alpha vectors** each
corresponding to a conditional plan; the Bellman backup generates new alpha
vectors and prunes dominated ones. The number of vectors grows explosively, so
exact methods handle only small problems.

Practical approaches are approximate. **Point-based value iteration** maintains
alpha vectors only for a sampled set of reachable beliefs, which scales far
better. **Online** POMDP agents maintain the belief with a particle filter and run
a lookahead search — often MCTS from Chapter 6 — over the belief-space tree,
which is the architecture behind most deployed systems.

The behavior POMDP solutions exhibit is worth noting because it is not
programmed: optimal policies naturally include **information-gathering actions**
taken purely to reduce uncertainty, with no immediate reward. The agent looks
before it leaps because looking has positive expected value, which is Chapter
15's VPI arising automatically from sequential optimization.

## Why It Matters

This chapter is the formal foundation of reinforcement learning, and the
relationship is precise: an MDP is the *problem*, and Chapter 23's algorithms are
what you do when you have an MDP whose transition and reward functions you do not
know. Every term in Q-learning, policy gradients, and actor-critic methods traces
directly to the Bellman equation here.

Two things are worth carrying away beyond the algorithms. The first is the reward
function as a design artifact: the chapter demonstrates, in a grid world small
enough to check by hand, that reward shaping determines behavior in ways that are
hard to anticipate — which is the concrete, reproducible version of the alignment
argument the book has been making since Chapter 1. The second is the belief state
as the proper object of planning under partial observability, which is the
unifying idea across Chapters 4, 14, and 16: when you cannot know the state,
plan in the space of distributions over it, and the machinery all goes through.
