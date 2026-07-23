---
course: applications-of-ml
lectureId: L11
title: "Reward, Repeat: How Machines Learn to Act"
deck: "No labeled answers, only consequences — inside the framework of states, rewards, and value estimates that teaches an agent to win a game and, lately, to align a chatbot."
order: 10
date: 2026-02-24
readingTime: 12
tags: ["reinforcement-learning", "q-learning", "bellman", "dqn", "rlhf"]
concepts:
  - id: markov-decision-process
    term: Markov Decision Process
    definition: "The formal setting for reinforcement learning: an agent occupies a state, takes actions that move it to new states, and receives real-valued rewards, aiming to maximize expected reward over time."
  - id: discounted-return
    term: Discounted Return
    definition: "The quantity an agent actually maximizes — the sum of future rewards, each weighted by a discount factor raised to how far in the future it arrives, so nearer rewards count for more."
  - id: policy
    term: Policy
    definition: "A mapping from states to actions; deterministic policies name one action per state, while stochastic policies assign a probability to each action in each state."
  - id: action-value-function
    term: Action-Value Function (Q)
    definition: "The expected discounted return of taking a given action in a given state and acting well thereafter; stored explicitly in a Q-table with one row per state and one column per action."
  - id: bellman-equation
    term: Bellman Equation
    definition: "The recursive consistency condition linking the value of a state-action pair to the immediate reward plus the discounted value of the best next action, and the basis for the Q-learning update."
  - id: q-learning
    term: Q-Learning
    definition: "An iterative algorithm that starts from an arbitrary Q-table and repeatedly nudges each estimate toward its Bellman target using a temporal-difference update controlled by a learning rate."
  - id: deep-q-network
    term: Deep Q-Network (DQN)
    definition: "A neural network that replaces the Q-table by mapping a state to a Q-value for every action, trained toward a temporal-difference target produced by a periodically synced target network."
  - id: rlhf
    term: RL from Human Feedback
    definition: "Training a neural reward model from human preferences between pairs of model outputs, then using reinforcement learning to optimize a language model against that learned reward."
---

Every other model in this course learns from answers: here is an input, here is
the correct label, minimize the gap. Reinforcement learning throws that comfort
away. Its agent is set loose in a world with no answer key, only *consequences* —
it acts, the world changes, and now and then a number arrives to say whether
things are going well. From that thin signal the agent must infer an entire
strategy for behaving. It is the framework behind machines that learned to play
Atari from raw pixels and to master Go, and, more recently, the machinery used to
make large language models helpful. This lecture builds it from the ground up.

## An Agent, a World, and a Number

The setup has just three moving parts. A **state** $S$ is the configuration of the
environment as the agent perceives it; here we assume the states are discrete. An
**action** $A$ is one of the moves the agent can make to go from one state to
another. And a **reward** $R$ is the real-valued feedback delivered each time the
agent acts. Bundle these with transition dynamics and you have a **Markov decision
process**, the standard formalization of the problem:

$$
(\mathcal{S}, \mathcal{A}, P, R, \gamma), \qquad P(s' \mid s, a).
$$

The word *Markov* signals the key assumption: the next state depends only on the
current state and action, not on the entire history of how the agent got there.
The agent's mandate is simple to state and hard to satisfy — *act so as to
maximize expected reward*.

<figure>
<svg viewBox="0 0 600 156" role="img" aria-label="The reinforcement learning loop: the agent sends an action to the environment, and the environment returns a new state and a reward.">
  <defs>
    <marker id="arw-rl" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" class="dgm-fill"/>
    </marker>
  </defs>
  <rect x="48" y="52" width="176" height="80" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="136" y="88" text-anchor="middle" font-size="15" font-weight="700">Agent</text>
  <text x="136" y="110" text-anchor="middle" font-size="11" class="dgm-muted">learns policy π</text>
  <rect x="376" y="52" width="176" height="80" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="464" y="96" text-anchor="middle" font-size="15" font-weight="700">Environment</text>
  <text x="299" y="74" text-anchor="middle" font-size="12">action aₜ</text>
  <line x1="224" y1="84" x2="374" y2="84" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-rl)"/>
  <g class="dgm-accent">
    <line x1="374" y1="110" x2="226" y2="110" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-rl)"/>
    <text x="300" y="128" text-anchor="middle" font-size="12">state sₜ₊₁ · reward rₜ₊₁</text>
  </g>
</svg>
<figcaption><b>Learning from consequences</b> The agent acts; the environment answers with a new state and a scalar reward, and that highlighted feedback is the only signal the agent learns from.</figcaption>
</figure>

## The Tyranny of the Discount

"Maximize reward" needs sharpening, because rewards arrive strung out across time.
The agent maximizes the **discounted return**, the sum of all future rewards with
each future reward shrunk by a **discount factor** $\gamma$:

$$
G_t = \sum_{k=0}^{\infty} \gamma^{k} R_{t+k+1}, \qquad 0 \le \gamma \le 1.
$$

When $\gamma$ is near zero the agent is myopic, grabbing immediate reward; near one
it is patient, valuing distant payoffs almost as much as present ones. The
discount also keeps the sum finite over long horizons. Everything the agent
computes is ultimately an estimate of this quantity.

## Maps and Values

What the agent wants to learn is a **policy** — a mapping from states to actions. A
*deterministic* policy can be written as a table pairing each state with a single
action; a *stochastic* policy instead assigns a probability to each action in each
state. To choose a good policy, the agent estimates how good its situations are.
The **value function** $V^\pi(s) = \mathbb{E}_\pi[G_t \mid S_t = s]$ scores a state
under policy $\pi$, while the **action-value function**

$$
Q^\pi(s, a) = \mathbb{E}_\pi\!\left[G_t \mid S_t = s,\, A_t = a\right]
$$

scores a *state–action pair*: how much return to expect from taking action $a$ in
state $s$ and behaving well afterward. In the discrete world of this lecture these
$Q$ values live in a **Q-table**, one row per state, one column per action. Such a
table implicitly defines a policy — in each state, take the action with the
largest $Q$ value.

## The Bellman Bargain

How does the agent fill in that table without ever being told the right answers?
Through the **Bellman equation**, which expresses a consistency the true values
must obey: the value of acting now equals the immediate reward plus the discounted
value of acting best next.

$$
Q^{*}(s, a) = \mathbb{E}\!\left[R_{t+1} + \gamma \max_{a'} Q^{*}(S_{t+1}, a') \mid S_t = s,\, A_t = a\right].
$$

**Q-learning** turns this identity into an update rule. Start with an arbitrary
Q-table (all zeros will do). Each time the agent, in state $S_t$, takes action
$A_t$, lands in $S_{t+1}$, and observes reward $R_{t+1}$, nudge the estimate toward
its Bellman target:

$$
Q(S_t, A_t) \leftarrow (1 - \alpha)\, Q(S_t, A_t) + \alpha \left[ R_{t+1} + \gamma \max_{a'} Q(S_{t+1}, a') \right].
$$

Rearranged, the same rule exposes the **temporal-difference error** — the surprise
between prediction and target — that drives learning:

$$
Q(S_t, A_t) \leftarrow Q(S_t, A_t) + \alpha \underbrace{\left[ R_{t+1} + \gamma \max_{a'} Q(S_{t+1}, a') - Q(S_t, A_t) \right]}_{\text{TD error}}.
$$

Here $\alpha \in [0, 1]$ is the learning rate and $\gamma \in [0, 1]$ the discount.
Iterate this over enough experience and the table converges toward the optimal
values.

<figure>
<svg viewBox="0 0 720 230" role="img" aria-label="The Q-learning update: the temporal-difference error between the current estimate and the Bellman target nudges the Q-value toward the target by a fraction alpha.">
  <defs>
    <marker id="arw-ql" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" class="dgm-fill"/>
    </marker>
  </defs>
  <rect x="30" y="44" width="160" height="64" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="110" y="72" text-anchor="middle" font-size="15" font-weight="700">Q(sₜ, aₜ)</text>
  <text x="110" y="92" text-anchor="middle" font-size="11" class="dgm-muted">current estimate</text>
  <g class="dgm-accent">
    <rect x="430" y="44" width="262" height="64" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <text x="561" y="72" text-anchor="middle" font-size="13" font-weight="700">rₜ₊₁ + γ · max Q(sₜ₊₁, a')</text>
    <text x="561" y="92" text-anchor="middle" font-size="11" class="dgm-muted">Bellman target</text>
  </g>
  <text x="310" y="64" text-anchor="middle" font-size="12">TD error δ</text>
  <line x1="192" y1="76" x2="428" y2="76" stroke="currentColor" stroke-width="1.5" marker-start="url(#arw-ql)" marker-end="url(#arw-ql)"/>
  <text x="300" y="94" text-anchor="middle" font-size="10" class="dgm-muted">target - estimate</text>
  <line x1="400" y1="84" x2="400" y2="148" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-ql)"/>
  <rect x="140" y="150" width="440" height="62" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="360" y="180" text-anchor="middle" font-size="14" font-weight="700">Q(sₜ, aₜ) ← Q(sₜ, aₜ) + α δ</text>
  <text x="360" y="200" text-anchor="middle" font-size="11" class="dgm-muted">nudge the estimate a fraction α toward the target</text>
</svg>
<figcaption><b>The temporal-difference update</b> Q-learning drives each estimate toward its Bellman target — immediate reward plus the discounted value of the best next action — by a step of size <em>α</em>.</figcaption>
</figure>

## Explore or Exploit

A subtle trap lurks in "take the action with the largest $Q$ value": an agent that
always exploits its current best guess never discovers whether a neglected action
is secretly better. The classic remedy is an **$\epsilon$-greedy** policy during
learning. Given some $0 \le \epsilon \le 1$, the agent acts randomly with
probability $\epsilon$ and greedily — taking the maximum-$Q$ action — with
probability $1 - \epsilon$. Early on, high exploration seeds the table with
experience; later, shrinking $\epsilon$ lets hard-won knowledge take over.

## When the Table Explodes

Tabular Q-learning has a fatal ceiling: it *cannot generalize*. Because it stores
every state independently, two nearly identical situations teach it nothing about
each other, and any realistic problem has far too many states to visit — let alone
store. The escape is to describe a state by a **vector of features** (distance to
the nearest hazard, whether a path is open) and let a function generalize across
similar states. Pushed to its conclusion, this yields the **Deep Q-Network**.
Rather than take a state *and* an action and return one value, a DQN takes a state
and outputs a $Q$ value for *every* action at once. It is trained toward a
temporal-difference target,

$$
y_t = R_{t+1} + \gamma \max_{a'} Q(S_{t+1}, a';\, \theta^{-}), \qquad J(\theta) = \left( y_t - Q(S_t, A_t;\, \theta) \right)^2,
$$

by gradient descent on the loss $J(\theta)$. For stability the method keeps *two*
copies of the network: a main network $\theta$ that is continuously updated and a
**target network** $\theta^{-}$ that supplies the target and is only periodically
overwritten with the main weights every $C$ steps, so the agent is not forever
chasing a target that shifts as fast as it learns.

## From Games to Chatbots

The lecture's final turn is why any of this appears in a language course.
Reinforcement learning now aligns large language models through **RL from human
feedback**. First, humans are shown pairs of model outputs and asked which they
prefer; those judgments train a neural network to *predict* human preference — a
learned reward function via ordinary supervised learning. Then reinforcement
learning optimizes the language model to score well under that reward, typically
with **policy-gradient** methods that push up the probability of high-reward
behavior, following $\nabla_\theta J(\theta) = \mathbb{E}_{\pi_\theta}\!\left[
\nabla_\theta \log \pi_\theta(a \mid s)\, Q^{\pi}(s, a) \right]$. The reward is no
longer a game score but a proxy for human taste.

## Why It Matters

Reinforcement learning matters because so many real problems have no answer key —
only outcomes that unfold over time. Its vocabulary of states, actions, rewards,
policies, and values is general enough to describe a robot crossing a room, a
program playing a game, and an assistant deciding how to answer you. The same
Bellman logic that fills a tiny Q-table scales, through deep networks, to
pixel-level game play, and the same idea of maximizing a learned reward now shapes
the behavior of the largest language models in use. Learning from consequences,
rather than from labeled correct answers, is what lets a machine improve at a task
nobody knows how to specify in advance — which is precisely the frontier where the
hardest and most valuable problems live.
