---
course: ai-foundations
lectureId: W7
title: "When Actions Disobey: Markov Decision Processes, Bellman, and the Value of a State"
deck: "Every search so far assumed that doing North moves you north. Drop that assumption — let the floor be slippery — and a plan is no longer good enough. You need an answer for every state you might be blown into, and a way to decide what a state is worth before you know what you will do there."
order: 7
readingTime: 22
tags: ["mdp", "bellman-equations", "value-iteration", "policy-iteration", "discounting", "q-values", "planning"]
concepts:
  - id: mdp
    term: Markov Decision Process (MDP)
    definition: "A non-deterministic search problem defined by states S, actions A, a transition function T(s, a, s′) = P(s′ | s, a), a reward function R(s, a, s′), a start state and possibly terminal states. The agent chooses actions; chance chooses outcomes."
  - id: markov-property
    term: Markov Property
    definition: "Given the present state, the future and the past are independent. For an MDP it means action outcomes depend only on the current state, never on the history of how the agent arrived there — exactly the assumption classical search made about successor functions."
  - id: policy
    term: Policy
    definition: "A mapping π : S → A giving an action for every state, rather than a sequence of actions from start to goal. An optimal policy π* maximizes expected utility. An explicit policy defines a reflex agent: look at the state, look up the action."
  - id: q-state
    term: Q-state
    definition: "The pair (s, a) — a state in which an action has been committed to but chance has not yet resolved the outcome. Q-states are the chance nodes of the MDP search tree, and the quantities attached to them make action selection trivial."
  - id: discount-factor
    term: Discount Factor
    definition: "A number 0 < γ ≤ 1 multiplied in once per level of lookahead, so a reward k steps away is worth γᵏ times its face value. It encodes a preference for sooner rewards, bounds otherwise infinite sums, and makes the algorithms converge."
  - id: optimal-value
    term: Optimal Value V*(s)
    definition: "The expected utility of starting in state s and acting optimally from then on. It is a property of the state and the MDP, not of any particular plan."
  - id: optimal-q-value
    term: Optimal Q-value Q*(s, a)
    definition: "The expected utility of taking action a from state s and acting optimally thereafter. Unlike V*, it names the first action, which is why a policy can be read straight off it."
  - id: bellman-equations
    term: Bellman Equations
    definition: "The one-step lookahead relationships that characterize optimal values: be optimal by taking the correct first action and then continuing to be optimal. V*(s) = maxₐ Σ over s′ of T(s, a, s′)·[R(s, a, s′) + γ V*(s′)]."
  - id: value-iteration
    term: Value Iteration
    definition: "Turn the Bellman equation into an update. Start from V₀(s) = 0 and apply one ply of expectimax search to every state per sweep, at cost O(|S|²|A|), until the values stop changing. It converges to the unique optimal values."
  - id: policy-extraction
    term: Policy Extraction
    definition: "Recovering the policy implied by a set of values. From V it needs a one-step lookahead through T and R; from Q it is just π(s) = argmaxₐ Q(s, a) — which is the standing argument for learning Q-values instead of values."
  - id: policy-evaluation
    term: Policy Evaluation
    definition: "Computing V^π, the utility of each state under a fixed and generally non-optimal policy π. With the policy fixed there is no max, so each sweep costs O(|S|²) — or the equations can be solved outright as a linear system."
  - id: policy-iteration
    term: Policy Iteration
    definition: "Alternate policy evaluation to convergence with policy improvement by one-step lookahead, until the policy stops changing. It computes the same optimal values as value iteration and often converges in far fewer iterations."
  - id: offline-planning
    term: Offline Planning
    definition: "Solving an MDP by computation alone, with the transition and reward functions known in advance. Its opposite is online learning, where the agent must act in the world to discover what the actions do — which is reinforcement learning."
---

Every search problem so far has rested on a quiet assumption: that actions do what they
are told. Move the blank tile left and it goes left. Drive from Arad to Sibiu and you
arrive in Sibiu. Under that assumption a solution is a **sequence of actions**, because
the agent can predict exactly where each one lands it.

Now let the floor be slippery. The action North usually moves the agent north, but
sometimes it skids east or west. The sequence of actions is no longer an answer, because
after the first skid the agent is somewhere the plan never mentioned. What it needs
instead is an answer for **every state it might end up in** — and, to produce one, a way
of saying what a state is *worth* before deciding what to do there. That machinery is the
Markov decision process, and it is the bridge from classical search to reinforcement
learning.

**Sources:** AIMA Chapter 17 (Sections 17.1–17.3)

## 1. Non-deterministic search

The running example is **Grid World**, a maze-like problem that will be used for the rest
of this feature and the next.

- The agent lives in a grid; walls block its path.
- Movement is **noisy**: the action North takes the agent north **80%** of the time. The
  other 20% is split evenly — **10%** west and **10%** east.
- If the agent would be taken into a wall, it **stays put**.
- The agent receives a reward at every time step: a small **living reward** for each
  ordinary step, which may well be negative, and a **big reward at the end**, good or bad.
- The goal is to **maximize the sum of rewards**.

Noise changes the character of the problem completely. In the deterministic version of
the same grid, the solution is a route. In the stochastic version, a route is a fiction —
the agent is never certain where it will be after three steps, only how probable each
possibility is. This is why MDPs are described as **non-deterministic search problems**:
the search machinery survives, but what it searches for changes.

## 2. The MDP, formally

An **MDP** is defined by:

- A set of **states** $s \in S$.
- A set of **actions** $a \in A$.
- A **transition function** $T(s, a, s')$ — the probability that action $a$ from state $s$
  leads to state $s'$, that is $P(s' \mid s, a)$. It is also called the **model** or the
  **dynamics**.
- A **reward function** $R(s, a, s')$ — sometimes written more coarsely as $R(s)$ or
  $R(s')$.
- A **start state**, and possibly a **terminal state**.

### What "Markov" means

"Markov" generally means that **given the present state, the future and the past are
independent**. For MDPs it has a specific and modest meaning: **action outcomes depend
only on the current state**, not on the history of how the agent got there.

This is not a new demand. It is exactly what classical search assumed when it let the
successor function depend only on the current state. The name honours Andrey Markov
(1856–1922), but the assumption has been in force all along; the MDP simply makes it
explicit because now there are probabilities riding on it.

The practical force of the assumption is that the state must be rich enough to carry
everything that matters. If the right action depends on something the state does not
record — how much fuel is left, whether a door was already opened — then the problem is
not Markov in that state representation, and the fix is to enlarge the state, not to
patch the algorithm.

## 3. From plans to policies

In deterministic single-agent search the output was an **optimal plan**: a sequence of
actions from start to goal. For an MDP the output is an **optimal policy**

$$\pi^* : S \to A,$$

a function giving an action for **each state**. Following it maximizes expected utility.
An explicit policy defines a **reflex agent** — observe the state, look up the action, act
— which is a striking end point for all this computation: the deliberation happens once,
offline, and what remains is a lookup table.

Adversarial search came close to this idea with the notion of a strategy, but it never
computed the whole thing; minimax computed the action for a **single state**, the one in
front of it. An MDP solution covers the entire state space.

### The living reward shapes the policy

The most instructive demonstration in the lecture is to hold Grid World fixed and vary
only the living reward $R(s)$ for non-terminal states. The optimal policy changes
qualitatively:

| Living reward | What the optimal policy does |
|---|---|
| $R(s) = -0.01$ | Dawdling is nearly free, so the policy takes the long way round, avoiding any risk of the bad terminal square |
| $R(s) = -0.03$ | A mild cost for existing; the policy still avoids the cliff edge but stops wandering |
| $R(s) = -0.4$ | Time now hurts, so the policy accepts risky shortcuts near the bad square |
| $R(s) = -2.0$ | Living is so painful that the policy heads for the nearest exit — including the bad one — just to end the episode |

The lesson is that **the reward function is the specification**. None of these policies is
a bug; each is the correct answer to the reward function it was given. A policy that looks
reckless or suicidal is usually a correct response to a reward function nobody examined
closely. This is the oldest and most reliable source of surprise in the whole field.

## 4. A second example: racing

A robot car wants to travel far, quickly. It has three states — **Cool**, **Warm** and
**Overheated** — and two actions, **Slow** and **Fast**. Going faster earns double reward
and risks the engine.

| State | Action | Outcomes | Reward |
|---|---|---|---|
| Cool | Slow | Cool with probability 1.0 | +1 |
| Cool | Fast | Cool 0.5, Warm 0.5 | +2 |
| Warm | Slow | Cool 0.5, Warm 0.5 | +1 |
| Warm | Fast | Overheated with probability 1.0 | −100 |
| Overheated | — | terminal | — |

The tension is immediate and legible. Fast pays twice as much per step, but from Warm it
destroys the car. Whether the optimal policy drives fast from Cool depends on how much
the future is worth — which is the subject of the next section.

## 5. The MDP search tree

Each MDP state projects an **expectimax-like search tree** that alternates two kinds of
node.

<figure>
<svg viewBox="0 0 760 360" role="img" aria-label="An MDP search tree. At the top a state node s, drawn as a triangle, branches on two actions. Each action leads to a q-state (s,a), drawn as a circle, which is a chance node. From one q-state, three outcome branches labelled with transition probabilities lead to successor states s prime, each annotated with the reward R(s,a,s prime).">
  <defs>
    <marker id="arw-w7-tree" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" class="dgm-fill"/>
    </marker>
  </defs>
  <path d="M380,24 L398,56 L362,56 z" class="dgm-fill"/>
  <text x="380" y="18" text-anchor="middle" font-size="13" font-weight="700">s</text>
  <text x="300" y="50" text-anchor="end" font-size="11">a state: the agent chooses</text>
  <line x1="372" y1="58" x2="250" y2="104" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-w7-tree)"/>
  <line x1="388" y1="58" x2="510" y2="104" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-w7-tree)"/>
  <text x="296" y="78" text-anchor="middle" font-size="12" font-style="italic">a</text>
  <text x="470" y="78" text-anchor="middle" font-size="12" font-style="italic">a′</text>
  <g class="dgm-accent">
    <circle cx="240" cy="116" r="13" class="dgm-fill"/>
  </g>
  <circle cx="520" cy="116" r="13" fill="none" stroke="currentColor" stroke-width="1.6"/>
  <text x="240" y="150" text-anchor="middle" font-size="13" font-weight="700">(s, a)</text>
  <text x="520" y="150" text-anchor="middle" font-size="13">(s, a′)</text>
  <text x="130" y="116" text-anchor="end" font-size="11">a q-state: chance chooses</text>
  <line x1="232" y1="128" x2="120" y2="214" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-w7-tree)"/>
  <line x1="240" y1="130" x2="240" y2="214" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-w7-tree)"/>
  <line x1="248" y1="128" x2="360" y2="214" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-w7-tree)"/>
  <text x="150" y="172" text-anchor="middle" font-size="11">T = 0.8</text>
  <text x="256" y="172" text-anchor="middle" font-size="11">0.1</text>
  <text x="330" y="172" text-anchor="middle" font-size="11">0.1</text>
  <path d="M120,222 L138,254 L102,254 z" fill="none" stroke="currentColor" stroke-width="1.6"/>
  <path d="M240,222 L258,254 L222,254 z" fill="none" stroke="currentColor" stroke-width="1.6"/>
  <path d="M360,222 L378,254 L342,254 z" fill="none" stroke="currentColor" stroke-width="1.6"/>
  <text x="120" y="274" text-anchor="middle" font-size="12">s′</text>
  <text x="240" y="274" text-anchor="middle" font-size="12">s′</text>
  <text x="360" y="274" text-anchor="middle" font-size="12">s′</text>
  <g class="dgm-accent-2">
    <text x="120" y="294" text-anchor="middle" font-size="11">R(s,a,s′)</text>
    <text x="240" y="294" text-anchor="middle" font-size="11">R(s,a,s′)</text>
    <text x="360" y="294" text-anchor="middle" font-size="11">R(s,a,s′)</text>
  </g>
  <text x="600" y="232" text-anchor="middle" font-size="11">…</text>
  <line x1="520" y1="130" x2="600" y2="214" stroke="currentColor" stroke-width="1.5" stroke-dasharray="4 4"/>
  <text x="380" y="336" text-anchor="middle" font-size="12">one transition = (s, a, s′), with probability T(s,a,s′) and reward R(s,a,s′)</text>
</svg>
<figcaption><b>The MDP search tree.</b> Triangles are states, where the agent picks the action that maximizes value. Circles are q-states — the action is committed but the outcome is not yet known — where value is an average weighted by the transition probabilities. Reward is collected on the transition itself.</figcaption>
</figure>

The vocabulary matters for everything that follows: $s$ is a **state**, $(s,a)$ is a
**q-state**, and $(s,a,s')$ is a **transition**, carrying probability $T(s,a,s')$ and
reward $R(s,a,s')$.

## 6. Utilities of sequences

Before any of this can be solved, one question has to be answered: what should the agent
prefer over **sequences of rewards**?

Two sub-questions do the work. **More or less?** — plainly more, so $[2,3,4]$ beats
$[1,2,2]$. And **now or later?** Given $[1,0,0]$ against $[0,0,1]$, the same total arrives
at different times. It is reasonable to prefer **sooner**.

### Discounting

The standard way to encode that preference is to let the value of rewards **decay
exponentially**. Each time the agent descends a level of the tree, the discount is
multiplied in once: a reward now is worth its face value, next step $\gamma$ times that,
two steps away $\gamma^2$ times.

The utility of a reward sequence becomes

$$U([r_0, r_1, r_2, \ldots]) = r_0 + \gamma r_1 + \gamma^2 r_2 + \cdots = \sum_{t=0}^{\infty} \gamma^t r_t.$$

With $\gamma = 0.5$, for example,

$$U([1,2,3]) = 1 \cdot 1 + 0.5 \cdot 2 + 0.25 \cdot 3 = 2.75,$$

while $U([3,2,1]) = 3 + 1 + 0.25 = 4.25$. So $U([1,2,3]) < U([3,2,1])$: the same three
numbers are worth more front-loaded.

There are two reasons to discount, and they are different in kind. The first is
**modelling**: sooner rewards probably do have higher utility, for the same reasons
interest rates exist. The second is **mathematical**: it keeps the sums finite and
**helps the algorithms converge**. A smaller $\gamma$ means a smaller effective horizon
and a shorter-term focus.

### A worked discounting quiz

Put five states in a row, $a$ through $e$. The actions are **East**, **West**, and
**Exit**, where Exit is available only in the two exit states $a$ and $e$; exiting from
$a$ pays **10** and from $e$ pays **1**. Transitions are deterministic.

Reaching an exit takes some number of moves $k$, after which Exit collects the reward, so
the value of heading for an exit worth $R$ from $k$ moves away is $\gamma^k R$.

- **For $\gamma = 1$**, nothing decays, so only the size of the prize matters: every state
  goes **West** toward the 10.
- **For $\gamma = 0.1$**, distance dominates. From $b$, West pays $0.1 \times 10 = 1$
  against East's $0.1^3 \times 1 = 0.001$; from $c$ it is $0.1^2 \times 10 = 0.1$ against
  $0.1^2 \times 1 = 0.01$. But from $d$, West pays $0.1^3 \times 10 = 0.01$ while East
  pays $0.1 \times 1 = 0.1$. So $b$ and $c$ go **West**, and $d$ goes **East** — the
  nearer, smaller prize wins.
- **For which $\gamma$ are West and East equally good at $d$?** Set the two values equal:

$$10\gamma^3 = \gamma \quad\Longrightarrow\quad 10\gamma^2 = 1 \quad\Longrightarrow\quad \gamma = \frac{1}{\sqrt{10}} \approx 0.316.$$

Below that the agent takes the near exit; above it, the far one. One parameter, quietly
chosen, decides which way the whole policy points.

## 7. Infinite utilities

If the game lasts forever, does the agent collect infinite reward — and if every policy
scores infinity, how can any be preferred? There are two standard answers.

**Finite horizon**, analogous to depth-limited search: terminate each episode after a
fixed $T$ steps. This bounds the sum but produces **nonstationary policies**, where $\pi$
depends on the time remaining. With two steps left, you make a dash; with two hundred, you
play it safe. The optimal action becomes a function of the clock as well as the state.

**Discounting** with $0 < \gamma < 1$ is the alternative, and it keeps the policy
stationary. If rewards are bounded by $R_{\max}$, the geometric series converges:

$$\left| \sum_{t=0}^{\infty} \gamma^t r_t \right| \le \frac{R_{\max}}{1 - \gamma}.$$

A third possibility is an **absorbing state** that the policy is guaranteed to reach
eventually, which makes the sum finite without either device.

## 8. Optimal quantities

Three quantities, defined once and used constantly:

- $V^*(s)$ — the **value (utility) of a state**: the expected utility of starting in $s$
  and **acting optimally** from then on.
- $Q^*(s,a)$ — the **value of a q-state**: the expected utility of having taken action $a$
  from $s$ and **acting optimally thereafter**.
- $\pi^*(s)$ — the **optimal policy**: the optimal action from state $s$.

Note what these are not. They are not properties of a plan; they are properties of the
**state** and the MDP. $V^*(s)$ says what the state is worth to an agent that will play
well, before anyone has named a single action.

In Grid World with noise 0.2, discount 0.9 and zero living reward, the V-values form a
smooth gradient flowing away from the good terminal square, while the Q-values resolve
each square into its four directional options — which is already a hint that Q-values
carry strictly more actionable information than V-values.

## 9. The Bellman equations

Here is the whole idea in two lines:

> **Step 1: take the correct first action.**
> **Step 2: keep being optimal.**

Written out, that recursion is the **Bellman equation**. The value of a state is the value
of the best action available in it:

$$V^*(s) = \max_a Q^*(s,a),$$

and the value of an action is the probability-weighted average, over everything chance
might do, of the reward collected plus the discounted value of where you land:

$$Q^*(s,a) = \sum_{s'} T(s,a,s') \left[ R(s,a,s') + \gamma V^*(s') \right].$$

Substituting one into the other gives the form worth memorizing:

$$V^*(s) = \max_a \sum_{s'} T(s,a,s') \left[ R(s,a,s') + \gamma V^*(s') \right].$$

These equations **characterize** the optimal values — they say what it means to be
optimal, as a self-consistency condition — but they do not by themselves say how to
compute anything. They are a definition with an algorithm hiding inside it.

## 10. Value iteration

The algorithm is what you get by reading the Bellman equation as an **assignment** rather
than an equality.

- Start with $V_0(s) = 0$ for all $s$: with no time steps left, the expected sum of
  rewards is zero, and this is **exactly right**, not an approximation.
- Given the vector of $V_k$ values, do **one ply of expectimax search** from every state:

$$V_{k+1}(s) \leftarrow \max_a \sum_{s'} T(s,a,s') \left[ R(s,a,s') + \gamma V_k(s') \right].$$

- Repeat until the values stop changing.

```python
def value_iteration(states, actions, T, R, gamma, epsilon=1e-6):
    V = {s: 0.0 for s in states}
    while True:
        new_V = {}
        for s in states:
            new_V[s] = max(
                sum(p * (R(s, a, s2) + gamma * V[s2]) for s2, p in T(s, a))
                for a in actions(s)
            ) if actions(s) else 0.0
        delta = max(abs(new_V[s] - V[s]) for s in states)
        V = new_V
        if delta < epsilon:          # converged to the unique optimum
            return V
```

Each iteration costs $O(|S|^2|A|)$ — for every state, for every action, sum over every
possible successor. The theorem is that it **converges to the unique optimal values**:
the approximations get refined toward $V^*$ regardless of where they started.

Two details deserve attention. The intermediate $V_k$ are not meaningless noise; they are
the **time-limited values**, the best the agent could do with exactly $k$ steps left. And
in practice the **policy converges long before the values do** — the numbers keep
creeping while the $\arg\max$ in every state has already settled, which is the opening
that policy iteration exploits.

### Value iteration on the racing car

Take $\gamma = 1$ and run it by hand. $V_0$ is zero everywhere.

| $k$ | Cool | Warm | Overheated |
|---|---|---|---|
| 0 | 0 | 0 | 0 |
| 1 | 2 | 1 | 0 |
| 2 | 3.5 | 2.5 | 0 |
| 3 | 5 | 4 | 0 |

At $k=1$ the agent acts as though the world ends next step, so it simply grabs the biggest
immediate reward: Fast from Cool pays $+2$, and from Warm the $-100$ makes Slow's $+1$ the
obvious choice. At $k=2$ the future starts to matter. From Cool, Slow is worth
$1 + V_1(\text{Cool}) = 3$, while Fast is worth $2 + 0.5 \cdot 2 + 0.5 \cdot 1 = 3.5$, so
Fast still wins. From Warm, Slow is worth $1 + 0.5 \cdot 2 + 0.5 \cdot 1 = 2.5$ against
Fast's $-100$. The pattern that emerges and holds is **Fast while Cool, Slow while Warm**
— and it is a policy, not a route.

In Grid World with noise 0.2 and $\gamma = 0.9$, the same sweeps show value spreading
outward from the terminal squares one ring per iteration, essentially settled by $k
\approx 12$ and visually identical at $k = 100$.

## 11. Policy extraction

Suppose the optimal values $V^*$ are in hand. **How should the agent act?**

It is not obvious. Values say what states are worth, not which action to take, so
recovering the policy requires a **one-step lookahead** back through the model:

$$\pi^*(s) = \arg\max_a \sum_{s'} T(s,a,s') \left[ R(s,a,s') + \gamma V^*(s') \right].$$

That needs $T$ and $R$ — the agent has to know the dynamics to use the values.

Now suppose instead the optimal **q-values** $Q^*$ are in hand. Then the answer is
trivial:

$$\pi^*(s) = \arg\max_a Q^*(s,a).$$

No model, no sum, no lookahead — just a maximum over a row of numbers.

> **The important lesson: actions are easier to select from q-values than from values.**

Keep this in view. It is the reason the next feature learns $Q$ rather than $V$: when the
dynamics are unknown, $V$ cannot be converted into behaviour at all, while $Q$ converts
for free.

## 12. Policy evaluation

A different question: not "what is the best policy?" but "how good is **this** policy?"

Fix some policy $\pi$, not necessarily optimal. The expectimax tree simplifies at once —
instead of maxing over all actions at each state, there is **only one action per state**,
the one $\pi$ dictates. The tree's value then depends on which policy was fixed.

Define $V^\pi(s)$ as the expected total discounted reward from starting in $s$ and
**following $\pi$**. It satisfies its own Bellman equation, with the max removed:

$$V^\pi(s) = \sum_{s'} T(s, \pi(s), s') \left[ R(s, \pi(s), s') + \gamma V^\pi(s') \right].$$

Two ways to solve it:

**Idea 1 — iterate.** Turn the equation into an update, exactly as value iteration did:

$$V^\pi_{k+1}(s) \leftarrow \sum_{s'} T(s, \pi(s), s') \left[ R(s, \pi(s), s') + \gamma V^\pi_k(s') \right].$$

Each sweep costs $O(|S|^2)$ rather than $O(|S|^2|A|)$, because there is no max over
actions — the saving is the whole factor of $|A|$.

**Idea 2 — solve it.** Without the maxes these are **linear** equations: $|S|$ unknowns,
$|S|$ equations. Hand them to any linear system solver and read off the answer directly.

The Grid World comparison makes the point concrete: evaluating "always go forward" and
"always go right" under the same dynamics yields two completely different value fields,
neither of them $V^*$, and both perfectly well defined.

## 13. Policy iteration

Policy evaluation plus policy extraction suggests an alternative route to the optimum.

1. **Policy evaluation.** For the current policy $\pi_i$, compute $V^{\pi_i}$ by running
   the fixed-policy updates to convergence. These are *not* optimal utilities — they are
   the honest value of the policy you have.
2. **Policy improvement.** Extract a new policy by one-step lookahead, using those
   converged-but-not-optimal values as the future:

$$\pi_{i+1}(s) = \arg\max_a \sum_{s'} T(s,a,s') \left[ R(s,a,s') + \gamma V^{\pi_i}(s') \right].$$

3. Repeat until the policy stops changing.

```python
def policy_iteration(states, actions, T, R, gamma):
    pi = {s: actions(s)[0] for s in states if actions(s)}
    while True:
        V = evaluate(pi, states, T, R, gamma)        # step 1: cheap sweeps, no max
        changed = False
        for s in states:
            if not actions(s):
                continue
            best = max(actions(s), key=lambda a:
                       sum(p * (R(s, a, s2) + gamma * V[s2]) for s2, p in T(s, a)))
            if best != pi[s]:
                pi[s], changed = best, True          # step 2: improve
        if not changed:
            return pi, V                             # policy stable: optimal
```

The result is **still optimal** — the policy this converges to is $\pi^*$ — and under
some conditions it converges **much faster** than value iteration.

### Comparing the two

Both algorithms compute the same thing: all the optimal values.

- In **value iteration**, every sweep updates the values and, implicitly, the policy. The
  policy is never stored; taking the max over actions recomputes it each time. Every sweep
  pays the full $O(|S|^2|A|)$.
- In **policy iteration**, several **cheap** passes update the utilities with the policy
  held fixed — each pass considers one action per state rather than all of them — and then
  **one expensive pass** picks a new policy. The new policy is better, or the algorithm is
  done.

The intuition for the speed-up is the observation from §10: the policy settles long before
the values do. Value iteration keeps paying for the max over actions in every sweep,
long after that max has stopped changing anything. Policy iteration stops paying.

## 14. Offline planning and the edge of the map

Everything in this feature is **offline planning**. You determine all quantities **through
computation**. You need to know the details of the MDP — $T$ and $R$ — in advance. And you
**do not actually play the game**.

The limits of that show up in a deliberately tiny MDP. The **double bandit** has two
states, Win and Lose, and two actions. Blue pays $1 with certainty. Red pays $2 with
probability 0.75 and $0 with probability 0.25. With no discount and 100 time steps, the
arithmetic is immediate: Blue is worth 100, Red is worth $100 \times (0.75 \times 2) =
150$. Play Red. No experience required; the answer is a calculation.

Then change the rules: Red's win chance is now **unknown**. Every entry in the transition
function that mattered has been replaced by a question mark. No amount of computation
recovers it. The only way to find out what Red pays is to **pull the lever and watch**.

That is not planning any more — it is **learning**, and specifically reinforcement
learning. The shift brings a set of problems that offline planning never had to face:

- **Exploration** — you have to try unknown actions to get information at all.
- **Exploitation** — eventually you have to use what you know and start cashing in.
- **Regret** — even learning intelligently, you make mistakes along the way, and they are
  paid for in real reward.
- **Sampling** — because outcomes are chancy, one observation means little; you have to
  try things repeatedly.
- **Difficulty** — learning can be far harder than solving an MDP you were handed.

The MDP machinery is not discarded when this happens. $V$, $Q$, the Bellman equations and
the policy all survive intact into reinforcement learning; what vanishes is the luxury of
knowing $T$ and $R$ before you start. Every algorithm in the next feature is an answer to
the same question: **how do you run these updates when you cannot see the weights you are
supposed to be averaging over?**

## Terms defined in one place

| Term | Definition |
|---|---|
| **MDP** | States, actions, transition function $T$, reward function $R$, start and terminal states |
| **Transition function** | $T(s,a,s') = P(s' \mid s,a)$ — the model, or dynamics |
| **Reward function** | $R(s,a,s')$, collected on the transition; sometimes written $R(s)$ |
| **Markov property** | Outcomes depend only on the current state, not the history |
| **Policy** | $\pi : S \to A$, an action for every state; defines a reflex agent |
| **Optimal policy** | $\pi^*$, the policy maximizing expected utility |
| **Living reward** | The per-step reward in non-terminal states; its size reshapes $\pi^*$ |
| **Q-state** | The pair $(s,a)$ — action committed, outcome unresolved |
| **Transition** | The triple $(s,a,s')$, carrying $T(s,a,s')$ and $R(s,a,s')$ |
| **Discount $\gamma$** | Multiplied in once per level; a reward $k$ steps away is worth $\gamma^k$ |
| **Finite horizon** | Stop after $T$ steps; yields nonstationary, clock-dependent policies |
| **$V^*(s)$** | Expected utility of starting in $s$ and acting optimally |
| **$Q^*(s,a)$** | Expected utility of taking $a$ in $s$, then acting optimally |
| **Bellman equations** | $V^*(s) = \max_a \sum_{s'} T[R + \gamma V^*(s')]$ |
| **Value iteration** | Bellman as an update from $V_0 = 0$; $O(\lvert S \rvert^2 \lvert A \rvert)$ per sweep |
| **Time-limited values** | $V_k$ — the best achievable with exactly $k$ steps remaining |
| **Policy extraction** | Reading $\pi$ off values: hard from $V$ (needs $T$, $R$), trivial from $Q$ |
| **Policy evaluation** | Computing $V^\pi$ for a fixed $\pi$; $O(\lvert S \rvert^2)$ per sweep, or a linear solve |
| **Policy iteration** | Evaluate to convergence, improve by lookahead, repeat |
| **Offline planning** | Solving a known MDP by computation, without acting |
| **Online learning** | Discovering $T$ and $R$ by acting — reinforcement learning |

## What to interrogate, not just absorb

1. **The reward function is the specification, and nobody reads it twice.** The Grid World
   sweep from $-0.01$ to $-2.0$ produces four defensible policies, including one that
   walks into the bad exit on purpose. When a trained agent behaves strangely, suspect the
   reward before the algorithm.
2. **$\gamma$ is a modelling assumption wearing a hyperparameter's clothes.** The quiz
   showed a single discount deciding whether the policy walks toward the big prize or the
   near one, with the switch at $1/\sqrt{10}$. Ask what horizon a reported $\gamma$
   implies, and whether anyone chose it for a reason.
3. **Markov is a claim about your state representation, not about the world.** If outcomes
   depend on anything the state does not record, the equations are still solvable and the
   answers are still wrong. Enlarging the state is the fix; a cleverer solver is not.
4. **Convergence of values is not convergence of behaviour.** The policy usually settles
   long before the numbers do. Reporting that value iteration "has not converged" may say
   nothing about whether the agent would act any differently.
5. **Q-values buy model-independence, and that is what you are paying for.** Carrying
   $|S||A|$ numbers instead of $|S|$ looks wasteful until the dynamics go missing — at
   which point $V$ cannot be turned into an action at all.
6. **Offline optimality is contingent on a model somebody supplied.** The double bandit is
   solvable in one line while $T$ is known and unsolvable by computation the moment it is
   not. Before trusting an optimal policy, ask where its transition probabilities came
   from and how they were estimated.
