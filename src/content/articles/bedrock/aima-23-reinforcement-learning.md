---
course: bedrock
lectureId: AIMA 23
book: "Artificial Intelligence: A Modern Approach"
part: "V · Machine Learning"
title: "Learning What to Do From a Number That Arrives Late"
deck: "Chapter 23 takes away the transition model and the reward function, leaving only experience and a scalar that shows up long after the action that earned it. Then it asks the question the fourth edition cares most about — where the reward came from, and who chose it."
order: 23
chapter: 23
readingTime: 14
tags: ["reinforcement-learning", "q-learning", "temporal-difference", "policy-gradient", "irl"]
concepts:
  - id: rl-problem
    term: The Reinforcement Learning Problem
    definition: "An MDP whose transition model and reward function are unknown. The agent must learn a policy from experience alone, facing credit assignment — which of many past actions earned a delayed reward — and exploration versus exploitation."
  - id: td-learning
    term: Temporal-Difference Learning
    definition: "Update U(s) ← U(s) + α[R(s) + γU(s′) − U(s)]. Learning from the difference between successive estimates, without waiting for an episode to end and without a model of the transitions."
  - id: model-based-vs-free
    term: Model-Based vs. Model-Free
    definition: "Model-based methods learn the transition and reward functions and then solve the MDP, using data efficiently but depending on model accuracy. Model-free methods learn values or policies directly, needing more experience but avoiding model bias."
  - id: q-learning
    term: Q-Learning
    definition: "Learning Q(s,a) directly via Q(s,a) ← Q(s,a) + α[R(s) + γ max_a′ Q(s′,a′) − Q(s,a)]. It is off-policy — it learns the optimal policy's values while following an exploratory one — and needs no transition model to act greedily."
  - id: exploration
    term: Exploration Strategies
    definition: "ε-greedy, optimistic initialization (unvisited states look attractive so they get tried), and upper-confidence-bound exploration bonuses. Convergence guarantees require visiting every state–action pair infinitely often."
  - id: function-approximation
    term: Generalization and the Deadly Triad
    definition: "Representing Q or U with a parameterized function to handle large state spaces. Combining function approximation, bootstrapping, and off-policy learning can diverge — mitigated by experience replay and target networks."
  - id: policy-search
    term: Policy Search and Actor–Critic
    definition: "Optimizing a parameterized policy directly by gradient ascent on expected return, using the REINFORCE estimator. Actor–critic methods use a learned value function as a baseline to reduce the variance of that estimate."
  - id: irl
    term: Inverse Reinforcement Learning
    definition: "Inferring the reward function from observed behavior rather than being given it. It addresses the fact that reward functions are hard to specify correctly, and it is the learning-theoretic form of the assistance game."
---

Chapter 16 gave the agent an MDP and asked it to compute an optimal policy.
Chapter 23 takes away the transition model and the reward function. The agent
knows only what it perceives and what it receives, and must work out what to do
from that alone.

Two difficulties define the field. **Credit assignment**: a reward arriving now
may be due to an action taken a hundred steps ago, and the agent must apportion
responsibility across that history. **Exploration versus exploitation**: acting
on current knowledge forgoes learning that might reveal something better, and the
trade-off is unavoidable because experience is the only source of information.

## Passive Learning: Evaluating a Fixed Policy

The simplest version fixes the policy and asks only for the utilities of states.

**Direct utility estimation** treats this as supervised learning: run episodes,
record the observed return from each state, average. It is unbiased, converges,
and is inefficient — because it ignores the fact that the utilities of successive
states are *related* by the Bellman equation, throwing away structure.

**Adaptive dynamic programming** exploits that structure by learning the
transition model from observed frequencies and solving the resulting MDP. It uses
data efficiently and costs a full solve.

**Temporal-difference learning** is the elegant middle, and the chapter's central
algorithm:

$$U(s) \leftarrow U(s) + \alpha\big[R(s) + \gamma U(s') - U(s)\big]$$

The bracketed quantity is the **TD error**: the difference between the current
estimate and a better estimate formed from the observed reward and the successor's
value. The update adjusts toward consistency.

The properties are what make it important. It needs **no model** — only observed
transitions. It updates **online**, per step, without waiting for an episode to
end. And it converges to the correct utilities with a decaying learning rate. The
chapter frames it as a crude approximation to ADP that requires none of the
machinery, which becomes the standard trade in practice.

## Active Learning: Finding the Policy

An active agent must also decide what to do, which forces exploration.

**Greedy** action selection with respect to current estimates fails
systematically: the agent finds a mediocre policy, stops exploring, and never
discovers better ones. The standard remedies are **$\varepsilon$-greedy**
(random with small probability), **optimistic initialization** (initialize values
high so unvisited states look attractive and get tried), and **exploration
bonuses** on an upper confidence bound. Theoretical convergence requires visiting
every state–action pair infinitely often — an assumption that is unattainable and
still the right guide.

**Q-learning** is the chapter's headline algorithm:

$$Q(s,a) \leftarrow Q(s,a) + \alpha\big[R(s) + \gamma \max_{a'} Q(s',a') - Q(s,a)\big]$$

Two properties matter enormously. Learning $Q$ rather than $U$ means the agent
can act greedily **without a transition model**, since choosing the best action
requires only comparing $Q$ values rather than projecting forward. And it is
**off-policy**: the $\max$ in the update means it learns the *optimal* policy's
values regardless of the (exploratory, suboptimal) policy actually generating the
experience. **SARSA** is the on-policy variant that uses the action actually
taken; the chapter's observation is that SARSA learns the value of what the agent
is really doing, which is more appropriate when exploration is genuinely risky.

<figure>
<svg viewBox="0 0 820 250" role="img" aria-label="The reinforcement learning loop: the agent takes an action, the environment returns a next state and a reward, and the temporal-difference error between successive value estimates drives the update.">
  <defs>
    <marker id="arw-aima23-rl" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" class="dgm-fill"/>
    </marker>
  </defs>
  <rect x="80" y="60" width="180" height="70" fill="none" stroke="currentColor" stroke-width="1.7"/>
  <text x="170" y="92" text-anchor="middle" font-size="13" font-weight="700">AGENT</text>
  <text x="170" y="114" text-anchor="middle" font-size="10.5" class="dgm-muted">holds Q(s,a)</text>
  <rect x="540" y="60" width="180" height="70" fill="none" stroke="currentColor" stroke-width="1.7"/>
  <text x="630" y="92" text-anchor="middle" font-size="13" font-weight="700">ENVIRONMENT</text>
  <text x="630" y="114" text-anchor="middle" font-size="10.5" class="dgm-muted">model unknown</text>
  <path d="M264 80 L534 80" fill="none" stroke="currentColor" stroke-width="1.6" marker-end="url(#arw-aima23-rl)"/>
  <text x="400" y="70" text-anchor="middle" font-size="11.5" font-weight="700">action a</text>
  <path d="M534 112 L264 112" fill="none" stroke="currentColor" stroke-width="1.6" marker-end="url(#arw-aima23-rl)"/>
  <text x="400" y="132" text-anchor="middle" font-size="11.5" font-weight="700">s′, reward R</text>
  <g class="dgm-accent">
    <rect x="230" y="168" width="340" height="56" class="dgm-soft" stroke="currentColor" stroke-width="1.7"/>
    <text x="400" y="192" text-anchor="middle" font-size="11.5" font-weight="700">TD error = R + γ max Q(s′,a′) − Q(s,a)</text>
    <text x="400" y="212" text-anchor="middle" font-size="10.5">the gap between what you expected and what you now expect</text>
  </g>
  <line x1="170" y1="134" x2="170" y2="196" stroke="currentColor" stroke-width="1.4"/>
  <line x1="170" y1="196" x2="226" y2="196" stroke="currentColor" stroke-width="1.4" marker-end="url(#arw-aima23-rl)"/>
  <text x="760" y="180" text-anchor="middle" font-size="10.5" class="dgm-muted">the reward may</text>
  <text x="760" y="196" text-anchor="middle" font-size="10.5" class="dgm-muted">be due to an action</text>
  <text x="760" y="212" text-anchor="middle" font-size="10.5" class="dgm-muted">100 steps ago</text>
</svg>
<figcaption><b>Learning from the gap.</b> No model, no labels — just the discrepancy between successive estimates of the same quantity, applied as a correction.</figcaption>
</figure>

## Scaling Up

Tabular methods require a table entry per state, which is impossible for
realistic problems — backgammon has around $10^{20}$ states, and continuous
spaces have infinitely many. **Function approximation** represents $Q$ or $U$ as
a parameterized function, and the update becomes a gradient step on the TD error.

The payoff is **generalization**: experience in one state informs estimates for
similar states, which is what makes learning feasible at all. The risk is
instability. The chapter notes the combination — function approximation,
bootstrapping (updating estimates from other estimates), and off-policy learning
— that can diverge; later literature calls it the deadly triad. The practical
mitigations are **experience replay** (store transitions and sample them
repeatedly, breaking temporal correlation) and **target networks** (hold the
bootstrap target fixed for a period, so the objective stops moving).

The chapter's historical anchor is **TD-Gammon**, which learned backgammon to
world-class strength through self-play with a neural network value function, and
which discovered opening strategies that contradicted accepted human theory. The
contemporary anchor is deep Q-networks on Atari, learning from raw pixels with
no game-specific engineering.

## Optimizing the Policy Directly

**Policy search** parameterizes the policy itself and performs gradient ascent on
expected return. Policies are made stochastic — a softmax over action
preferences — so that the objective is differentiable, since a deterministic
argmax has zero gradient almost everywhere.

The **REINFORCE** estimator uses sampled returns to estimate the gradient. It is
unbiased and has high variance, and the standard fix is a **baseline** subtracted
from the return. When the baseline is a learned value function, the result is an
**actor–critic** method: the actor is the policy, the critic is the value
estimate that reduces the variance of the actor's updates.

The chapter is even-handed about when policy search is preferable — continuous
action spaces, cases where a good policy is simpler to represent than a good
value function, and problems where stochastic policies are genuinely optimal.

**Apprenticeship learning** addresses the case where a human demonstrator is
available. Straight **imitation** (behavioral cloning) is supervised learning on
the demonstrator's actions, and its characteristic failure is distribution
shift: small errors take the agent to states the expert never visited, where it
has no guidance, and errors compound.

## Where the Reward Comes From

**Inverse reinforcement learning** is the section that matters most for the
book's argument. Rather than being given a reward function, infer it from
observed behavior.

The motivation is stated squarely: reward functions are *hard to specify
correctly*, and a misspecified reward produces confidently wrong behavior. The
chapter's examples of reward hacking — agents that maximize the stated objective
while violating every intention behind it — are the empirical evidence for
Chapter 1's argument, arriving at the end of the technical material rather than
in an ethics chapter.

IRL is also fundamentally **ill-posed**: many reward functions explain the same
behavior, including the trivial constant reward under which everything is
optimal. Practical methods need additional principles — maximum entropy,
feature-matching, or a prior over plausible rewards.

And IRL is the learning-theoretic face of Chapter 17's assistance games. There,
deference emerged from uncertainty about the objective; here, the machinery for
*reducing* that uncertainty from observed human behavior is developed. The two
sections are halves of the same proposal.

## Why It Matters

Reinforcement learning is the most complete realization of the book's thesis: an
agent that improves its behavior from experience alone, with no model and no
supervision, in pursuit of a performance measure. Chapters 2 and 16 defined the
target; this chapter reaches it.

The practical caution is worth stating as plainly as the chapter does. RL is
extremely sample-inefficient, notoriously sensitive to hyperparameters and random
seeds, and difficult to reproduce. It succeeds where interaction is cheap —
simulators, games, recommender systems with massive traffic — and struggles
where each trial costs money, time, or safety.

The deepest point is the one about reward. Every RL system optimizes a number
someone chose, and the chapter shows through worked examples that choosing that
number correctly is harder than optimizing it. That is the thesis the book opened
with, demonstrated rather than asserted, in the chapter where the optimization
machinery is most powerful.
