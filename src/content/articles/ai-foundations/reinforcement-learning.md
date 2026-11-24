---
course: ai-foundations
lectureId: W8
title: "Learning Without the Map: Temporal Difference, Q-Learning, and the Price of Finding Out"
deck: "An MDP you have been handed is a calculation. Take away the transition and reward functions and the same problem becomes an experiment you have to run in the world — where every piece of information costs real reward to acquire, and the only way to learn what an action does is to do it."
order: 8
readingTime: 23
tags: ["reinforcement-learning", "q-learning", "temporal-difference", "exploration", "function-approximation", "dqn"]
concepts:
  - id: reinforcement-learning
    term: Reinforcement Learning
    definition: "Learning to act from rewards observed by acting. The problem is still an MDP — states, actions, a policy to find — but the transition function T and reward function R are unknown, so all learning rests on observed samples of outcomes."
  - id: model-based-learning
    term: Model-Based Learning
    definition: "Learn an approximate MDP from experience — count the outcomes s′ of each (s, a) and normalize to estimate T, record the rewards seen to estimate R — then solve that learned model with value or policy iteration as if it were correct."
  - id: model-free-learning
    term: Model-Free Learning
    definition: "Estimate the quantities you actually need — values or q-values — directly from samples, never building a model of the dynamics. It works because samples arrive with the right frequencies, so averaging them implicitly performs the expectation."
  - id: passive-rl
    term: Passive Reinforcement Learning
    definition: "The simplified task of policy evaluation when T and R are unknown: a fixed policy is executed, the learner is along for the ride with no choice of action, and the goal is to learn the state values from experience."
  - id: direct-evaluation
    term: Direct Evaluation
    definition: "Average the observed returns from each state across episodes. It needs no model and converges to the correct values, but learns every state in isolation and so discards what the transitions reveal about how states are connected."
  - id: temporal-difference
    term: Temporal Difference Learning
    definition: "Update V(s) after every transition (s, a, s′, r) by moving it toward the sample r + γV(s′): V(s) ← (1 − α)V(s) + α[r + γV(s′)]. A running average that learns from every experience rather than waiting for an episode to end."
  - id: td-error
    term: TD Error
    definition: "The difference [r + γV(s′)] − V(s) between the sampled estimate and the current one. The update moves the value a fraction α along this error, which is why the method is called temporal difference."
  - id: q-learning
    term: Q-Learning
    definition: "Sample-based q-value iteration: on each sample (s, a, s′, r), update Q(s, a) ← (1 − α)Q(s, a) + α[r + γ·maxₐ′ Q(s′, a′)]. Learning q-values rather than values makes action selection model-free too."
  - id: off-policy
    term: Off-Policy Learning
    definition: "Learning the optimal policy's values while behaving according to some other, possibly poor, policy. Q-learning is off-policy because the max over a′ in its update refers to the best action available, not the action actually taken next."
  - id: epsilon-greedy
    term: ε-Greedy Exploration
    definition: "Act on the current policy with probability 1 − ε and act uniformly at random with probability ε. Simple and sufficient to guarantee coverage, but it keeps thrashing after learning is done unless ε is lowered over time."
  - id: exploration-function
    term: Exploration Function
    definition: "A rule that turns a value estimate u and a visit count n into an optimistic utility, e.g. f(u, n) = u + k/n. It explores regions whose badness is not yet established, stops exploring once it is, and propagates the bonus back to states leading to unknowns."
  - id: regret
    term: Regret
    definition: "The total cost of the mistakes made while learning — the gap between the reward actually collected and the reward an optimal agent would have collected. Minimizing it requires not just learning to be optimal, but optimally learning to be optimal."
  - id: approximate-q-learning
    term: Approximate Q-Learning
    definition: "Represent a state by a vector of features and write Q(s, a) = w₁f₁(s, a) + ⋯ + wₙfₙ(s, a). Experience is compressed into a few weights that generalize to unseen states, at the risk that states sharing features genuinely differ in value."
  - id: dqn
    term: Deep Q-Network (DQN)
    definition: "Q-learning with a neural network in place of the q-table, mapping a state to a q-value per action. It made raw-pixel control tractable where a table could not exist — Atari Breakout alone would need 256^(84 × 84 × 4) rows."
---

The previous feature ended with a small, pointed failure. A two-armed bandit with known
payoffs is solved by arithmetic in one line. Replace one payoff probability with a
question mark and no amount of computation recovers it — the only way to learn what the
lever does is to **pull it and watch**.

That is the whole of reinforcement learning in miniature. The problem is still an MDP:
there are states, actions, a transition model, a reward function, and a policy to be
found. The new twist is that the agent **does not know $T$ or $R$**. It does not know
which states are good or what the actions do. It must actually try things out, in the
world, paying real reward for every piece of information it acquires.

**Sources:** AIMA Chapter 21 (Sections 21.1–21.4)

## 1. The setting

An agent sits in an environment. It takes **actions**; it observes a **state** and a
**reward**. Its utility is defined by the reward function, and it must learn to act so as
to **maximize expected rewards**. All learning is based on **observed samples of
outcomes**. The environment is assumed unknown and possibly stochastic.

<figure>
<svg viewBox="0 0 700 260" role="img" aria-label="The agent-environment interaction loop. A box labelled Agent sits on the left and a box labelled Environment on the right. An arrow from the agent to the environment is labelled Actions a. Two arrows return from the environment to the agent, labelled State s and Reward r. A caption notes that the transition and reward functions inside the environment are unknown to the agent.">
  <defs>
    <marker id="arw-w8-loop" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" class="dgm-fill"/>
    </marker>
  </defs>
  <rect x="60" y="88" width="180" height="84" rx="8" fill="none" stroke="currentColor" stroke-width="2"/>
  <text x="150" y="136" text-anchor="middle" font-size="16" font-weight="700">Agent</text>
  <rect x="460" y="88" width="180" height="84" rx="8" fill="none" stroke="currentColor" stroke-width="2"/>
  <text x="550" y="128" text-anchor="middle" font-size="16" font-weight="700">Environment</text>
  <text x="550" y="150" text-anchor="middle" font-size="11" font-style="italic">T and R: unknown</text>
  <g class="dgm-accent">
    <path d="M240,110 L455,110" fill="none" stroke="currentColor" stroke-width="2" marker-end="url(#arw-w8-loop)"/>
    <text x="348" y="100" text-anchor="middle" font-size="13" font-weight="700">actions a</text>
  </g>
  <path d="M460,142 L245,142" fill="none" stroke="currentColor" stroke-width="2" marker-end="url(#arw-w8-loop)"/>
  <text x="352" y="160" text-anchor="middle" font-size="13">state s</text>
  <path d="M460,172 C400,212 300,212 245,176" fill="none" stroke="currentColor" stroke-width="2" marker-end="url(#arw-w8-loop)"/>
  <text x="352" y="213" text-anchor="middle" font-size="13">reward r</text>
  <text x="350" y="48" text-anchor="middle" font-size="12">every loop yields one sample (s, a, s′, r) — the only evidence there is</text>
</svg>
<figcaption><b>The reinforcement learning loop.</b> The MDP has not gone away; it has moved inside the environment box where the agent cannot read it. Each turn of the loop returns a single sample, and every algorithm in this feature is a different way of squeezing value estimates out of a stream of them.</figcaption>
</figure>

The canonical demonstrations are physical. A Sony AIBO learns to walk from scratch, its
gait improving over roughly a thousand trials (Kohl and Stone, ICRA 2004). A simulated
snake learns **sidewinding**; a toddler robot learns balance; a crawler robot discovers a
gait nobody designed. More recently, rich-environment locomotion (Heess et al., 2017)
produced running, jumping and climbing behaviours that were never specified, only
rewarded.

What unites them is that nobody wrote down the dynamics. Nobody could.

### Offline versus online

The distinction from the previous feature is worth stating flatly.

| | **Offline (MDP planning)** | **Online (reinforcement learning)** |
|---|---|---|
| $T$ and $R$ | known in advance | unknown |
| How answers are obtained | by computation | by acting and observing |
| Cost of a mistake | none — nothing is played | real reward, lost permanently |
| Output | optimal policy | optimal policy, eventually |

Solving an MDP is a calculation performed in advance. Reinforcement learning is an
experiment that has to be run, and the experiment is expensive.

## 2. Model-based learning

The most direct idea: if the trouble is a missing model, **learn the model**.

- **Step 1 — learn an empirical MDP.** Count outcomes $s'$ for each $(s,a)$ and normalize
  to estimate $\hat{T}(s,a,s')$. Record each reward you see to estimate $\hat{R}(s,a,s')$.
- **Step 2 — solve the learned MDP.** Run value iteration or policy iteration on
  $\hat{T}$ and $\hat{R}$ exactly as before, as if the estimates were correct.

Take a small grid of states A–E, a fixed policy, $\gamma = 1$, and four observed episodes:

| Episode | Transitions |
|---|---|
| 1 | B, east, C, −1 · C, east, D, −1 · D, exit, x, +10 |
| 2 | B, east, C, −1 · C, east, D, −1 · D, exit, x, +10 |
| 3 | E, north, C, −1 · C, east, D, −1 · D, exit, x, +10 |
| 4 | E, north, C, −1 · C, east, A, −1 · A, exit, x, −10 |

Counting gives the learned model directly. C was left eastward four times, landing in D on
three of them and A on the fourth:

$$\hat{T}(\text{B}, \text{east}, \text{C}) = 1.00, \qquad \hat{T}(\text{C}, \text{east}, \text{D}) = 0.75, \qquad \hat{T}(\text{C}, \text{east}, \text{A}) = 0.25,$$

with rewards $\hat{R}(\text{B},\text{east},\text{C}) = -1$,
$\hat{R}(\text{D},\text{exit},\text{x}) = +10$, $\hat{R}(\text{A},\text{exit},\text{x}) =
-10$, and so on. Feed that to value iteration and you have a policy.

Why does this work? **Because eventually you learn the right model.** The counts converge
to the true probabilities, and the solution of the learned MDP converges to the solution of
the real one.

### The expected-age analogy

The alternative is easiest to see outside RL entirely. Suppose you want the expected age
of undergraduates.

- If $P(A)$ is **known**, compute $\mathbb{E}[A] = \sum_a a \, P(a)$ and you are done.
- If $P(A)$ is unknown, one option is **model-based**: collect samples, estimate
  $\hat{P}(a)$ from the frequencies, then compute $\sum_a a \, \hat{P}(a)$.
- The other is **model-free**: collect samples $[a_1, \ldots, a_N]$ and just average them,
  $\mathbb{E}[A] \approx \frac{1}{N}\sum_i a_i$. No distribution is ever written down.

Why does the model-free version work? **Because samples appear with the right
frequencies.** The expectation is performed implicitly by the sampling process itself.

That single observation is the engine of everything that follows. If the samples arrive in
the right proportions, averaging them *is* taking the weighted average — even when the
weights are unknown and unknowable.

## 3. Passive RL: evaluating a policy you cannot model

Start with the simplified task, **policy evaluation**. A fixed policy $\pi(s)$ is given.
$T$ and $R$ are unknown. The goal is to learn the state values $V^\pi$.

The learner is **along for the ride**: no choice about which actions to take, just
executing the policy and learning from what happens. This is emphatically **not** offline
planning — the agent is taking actions in the world — but it is not choosing them either.

### Direct evaluation

The obvious method. Act according to $\pi$; every time you visit a state, write down
**what the sum of discounted rewards turned out to be** from that point on; average those
samples.

On the four episodes above, with $\gamma = 1$:

| State | Observed returns | Value |
|---|---|---|
| A | −10 | **−10** |
| B | 8, 8 | **+8** |
| C | 9, 9, 9, −11 | **+4** |
| D | 10, 10, 10 | **+10** |
| E | 8, −12 | **−2** |

What is good about this is real: it is **easy to understand**, it requires **no knowledge
of $T$ or $R$**, and it **eventually computes the correct average values** using nothing
but sample transitions.

What is bad about it is subtle and important. Look at B and E. Under this policy **both go
to C** — B east to C, E north to C — so whatever happens afterwards is drawn from the same
distribution. Their values should differ only by the one step that gets them there. Yet
direct evaluation reports $V(\text{B}) = +8$ and $V(\text{E}) = -2$, a gap of ten, purely
because E happened to be sampled on the unlucky episode.

**Direct evaluation wastes information about state connections.** Each state is learned
separately, as though the others did not exist, so it takes a long time to learn and the
estimates disagree with each other in ways the structure of the problem forbids.

### Why not just run policy evaluation?

The fix seems obvious. The Bellman update for a fixed policy exploits exactly the
connections direct evaluation throws away:

$$V^\pi_{k+1}(s) \leftarrow \sum_{s'} T(s, \pi(s), s') \left[ R(s,\pi(s),s') + \gamma V^\pi_k(s') \right].$$

Each round replaces $V$ with a one-step-lookahead layer over $V$, and the connections
between states do all the work.

Unfortunately **we need $T$ and $R$ to compute it**. The sum is an average weighted by
transition probabilities we do not have.

So the key question becomes exact and answerable:

> **How do you take a weighted average without knowing the weights?**

The answer is the expected-age trick. Take **samples of outcomes $s'$ — by doing the
action** — and average them. Each sample is

$$\text{sample}_i = R(s, \pi(s), s_i') + \gamma V^\pi(s_i'),$$

and the average of enough samples approaches the expectation, because the outcomes arrive
with the right frequencies.

There is one catch, and it is physical rather than mathematical: **we cannot rewind time**
to collect sample after sample from the same state $s$. The agent gets one outcome per
visit and then it has moved on.

## 4. Temporal difference learning

The resolution is to stop trying to collect batches and instead **learn from every
experience**.

Update $V(s)$ **each time** a transition $(s, a, s', r)$ is experienced. Likely outcomes
$s'$ will simply contribute updates more often, which is the frequency-weighting doing its
job without anyone counting. The policy is still fixed; this is still evaluation.

The sample of $V(s)$ provided by one transition is

$$\text{sample} = r + \gamma V(s'),$$

and the update moves the current estimate toward it:

$$V(s) \leftarrow (1 - \alpha) V(s) + \alpha \left[ r + \gamma V(s') \right].$$

The same update, rearranged, explains the name:

$$V(s) \leftarrow V(s) + \alpha \underbrace{\left[ r + \gamma V(s') - V(s) \right]}_{\text{TD error}}.$$

The bracketed quantity is the **temporal difference** — the gap between what the next
state says this state is worth and what you currently believe — and the update walks a
fraction $\alpha$ of the way along it.

### Why a running average is the right shape

This is an **exponential moving average**, and its properties happen to be exactly what
learning needs. Expanding the recursion, a sample from $k$ updates ago carries weight
proportional to $\alpha(1-\alpha)^k$: **recent samples matter more**, and the method
**forgets about the past**.

Forgetting sounds like a defect and is in fact the point. The early estimates of
$V(s')$ were wrong, so the early samples computed from them were wrong too, and a method
that weighted all samples equally would be dragging those errors around forever. A
**decreasing learning rate** $\alpha$ gives converging averages: large steps while the
estimates are poor, small ones as they settle.

### A worked example

Take $\gamma = 1$, $\alpha = 0.5$, and five states A–E whose values start at $0, 0, 0, 8,
0$ — D already knows it is worth 8, the rest know nothing.

Observe **B, east, C, −2**. The sample is $r + \gamma V(\text{C}) = -2 + 0 = -2$, so

$$V(\text{B}) \leftarrow (1 - 0.5)(0) + 0.5(-2) = -1.$$

Values are now $0, -1, 0, 8, 0$.

Observe **C, east, D, −2**. The sample is $-2 + V(\text{D}) = -2 + 8 = 6$, so

$$V(\text{C}) \leftarrow (1-0.5)(0) + 0.5(6) = 3.$$

Values are now $0, -1, 3, 8, 0$.

Notice what just happened. D's knowledge moved into C after a single transition, with no
episode completed and no model consulted. Information flows backwards along the
transitions the agent actually takes — which is precisely the structure direct evaluation
was blind to.

```python
def td_update(V, s, r, s_next, alpha, gamma):
    sample = r + gamma * V[s_next]
    V[s] += alpha * (sample - V[s])     # move alpha of the way along the TD error
    return V
```

### Where TD value learning stops

TD is a **model-free way to do policy evaluation**, mimicking Bellman updates with running
sample averages. But if the goal is to turn those values into a **new, better policy**, it
is stuck — and for a reason already established. Policy extraction from $V$ needs a
one-step lookahead:

$$\pi(s) = \arg\max_a \sum_{s'} T(s,a,s')\left[R(s,a,s') + \gamma V(s')\right],$$

which requires the very $T$ and $R$ we do not have. Learning $V$ model-free and then
needing the model to use it is no help at all.

The fix is the lesson from the previous feature, now load-bearing:

> **Learn q-values, not values. That makes action selection model-free too.**

## 5. Active RL and Q-learning

**Active** (full) reinforcement learning drops the fixed policy. The agent does not know
$T$ or $R$, it **chooses the actions**, and the goal is the **optimal** policy and values.
The learner now makes choices, which introduces the fundamental trade-off of the whole
subject: **exploration versus exploitation**.

### From value iteration to q-value iteration

Recall value iteration: start with $V_0(s) = 0$, which is correct, and compute successive
depth-limited values. Q-values are more useful, so compute those instead. Start with
$Q_0(s,a) = 0$ and iterate:

$$Q_{k+1}(s,a) \leftarrow \sum_{s'} T(s,a,s') \left[ R(s,a,s') + \gamma \max_{a'} Q_k(s',a') \right].$$

This still needs the model — but it is now in a form where every ingredient except $T$ can
be read off a single sample.

### Q-learning

**Q-learning is sample-based q-value iteration.** Learn $Q(s,a)$ as you go:

- Receive a sample $(s, a, s', r)$.
- Your old estimate is $Q(s,a)$.
- Your new sample estimate is $\;r + \gamma \max_{a'} Q(s', a')$.
- Incorporate it into a running average:

$$Q(s,a) \leftarrow (1-\alpha) Q(s,a) + \alpha \left[ r + \gamma \max_{a'} Q(s',a') \right].$$

The procedure in full:

```python
def q_learning(env, alpha=0.5, gamma=0.9, epsilon=0.1, episodes=1000):
    Q = defaultdict(float)                       # 1. initialize, e.g. to 0
    for _ in range(episodes):
        s = env.reset()                          # 2. start state
        while not env.done:
            a = choose_action(Q, s, epsilon)     # 3. from the Q-table + exploration
            s_next, r = env.step(a)              # 4. act, observe
            sample = r + gamma * max(Q[s_next, a2] for a2 in env.actions(s_next))
            Q[s, a] += alpha * (sample - Q[s, a])  # 5. update
            s = s_next                           # 6. repeat
    return Q
```

The **q-table** is a matrix with one row per state and one column per action, holding
$Q(s,a)$ in each cell:

| State | right | … | up |
|---|---|---|---|
| $s_0$ | 0.4 | … | 0.1 |
| $s_1$ | 0.5 | … | 0.1 |
| $s_2$ | 0.3 | … | 0.05 |
| $s_n$ | 0.1 | … | 0.8 |

A q-table **defines a deterministic policy**: in each state, take the action with the
maximum q-value. Reading a policy out of the table is one $\arg\max$ per row, with no
model anywhere.

### The surprising property

> **Q-learning converges to the optimal policy — even if you are acting suboptimally.**

This is **off-policy** learning, and it is genuinely strange on first encounter. The agent
can wander, make bad choices, follow a terrible policy, and still converge on the values
of the *optimal* one. The reason sits in the update: the $\max_{a'}$ refers to the best
action available at $s'$, not the action the agent actually goes on to take. The behaviour
generates the samples; the target describes optimal play.

In the limit, **it does not matter how you select actions** — with caveats that are not
optional:

- You have to **explore enough**. States never visited have values never learned.
- You have to make the learning rate **small enough eventually** — but **not decrease it
  too quickly**, or learning stalls before the estimates are right.

## 6. Exploration versus exploitation

Something has to force exploration, since a greedy agent acting on an empty q-table will
latch onto the first thing that works.

### ε-greedy

The simplest scheme. At every time step, flip a coin: with small probability
$\varepsilon$, act **randomly**; with probability $1 - \varepsilon$, act on the **current
policy**.

It works, and its defect is obvious once stated: the agent **keeps thrashing around once
learning is done**. It explores at the same fixed rate forever, paying for information it
no longer needs. The standard patch is to **lower $\varepsilon$ over time**.

### Exploration functions

A better idea changes *when* to explore rather than *how often*. Explore regions whose
**badness is not yet established**, and eventually stop.

An **exploration function** takes a value estimate $u$ and a visit count $n$ and returns an
**optimistic utility**, for example

$$f(u, n) = u + \frac{k}{n}.$$

The regular Q-update takes the plain max over $Q(s',a')$; the modified update takes the
max over $f(Q(s',a'), N(s',a'))$ instead:

$$Q(s,a) \leftarrow (1-\alpha)Q(s,a) + \alpha \left[ r + \gamma \max_{a'} f\big(Q(s',a'),\, N(s',a')\big) \right].$$

Rarely-visited actions look better than they are, so the agent tries them; as $n$ grows the
bonus decays and the estimate reverts to the evidence.

The elegant part is what the propagation does. Because the bonus enters through the
Bellman update, it **flows back to states that merely lead to unknown states**, not just to
the unknowns themselves. The agent becomes curious about routes, not only destinations.

### Regret

Even if you learn the optimal policy, **you still make mistakes along the way**.

**Regret** measures their total cost: the difference between the reward actually collected
— including all the youthful suboptimality — and the reward an optimal agent would have
collected. Minimizing regret is a stricter goal than finding the optimum; it requires
**optimally learning to be optimal**.

The comparison that makes this concrete: random exploration and exploration functions
**both end up optimal**, but random exploration has **higher regret**, because it keeps
paying for random actions long after it has learned what they do. Two algorithms with the
same limit can have very different bills.

## 7. Generalizing across states

Basic Q-learning keeps a table of every q-value. In any realistic problem that is
hopeless, for two separate reasons: there are **too many states to visit** them all in
training, and **too many to hold** in memory.

The Pacman demonstration makes the failure vivid. Suppose experience teaches that one
particular board configuration is bad — a ghost adjacent, say. In naïve q-learning the
agent knows **nothing** about a board that differs only in the position of a wall across
the map, or even one that is a mirror image. Every state is learned from scratch, as an
opaque identifier.

What is needed is **generalization**: learn about a small number of training states, and
carry that experience to new, similar situations. This is the fundamental idea of machine
learning, arriving here on cue.

### Feature-based representations

Describe a state by a **vector of features** — functions from states to real numbers, often
0/1, that capture the properties that matter. For Pacman:

- distance to the closest ghost,
- distance to the closest dot,
- number of ghosts,
- $1 / (\text{dist to dot})^2$,
- is Pacman in a tunnel? (0/1),

and so on. A q-state $(s,a)$ can be described the same way, with features such as *does
this action move closer to food*.

### Linear value functions

With features in hand, write the q-function using a few weights:

$$Q(s,a) = w_1 f_1(s,a) + w_2 f_2(s,a) + \cdots + w_n f_n(s,a).$$

The **advantage** is that experience is summed up in a few powerful numbers, and those
numbers apply to states never seen. The **disadvantage** is the mirror image: states may
**share features but genuinely differ in value**, and no amount of data fixes a
representation that cannot tell them apart.

### Approximate Q-learning

The update adjusts the weights instead of a table entry. With

$$\text{difference} = \left[ r + \gamma \max_{a'} Q(s',a') \right] - Q(s,a),$$

the exact and approximate updates sit side by side:

$$Q(s,a) \leftarrow Q(s,a) + \alpha \cdot \text{difference} \qquad\text{(exact)}$$

$$w_i \leftarrow w_i + \alpha \cdot \text{difference} \cdot f_i(s,a) \qquad\text{(approximate)}$$

The interpretation is pleasingly direct: **adjust the weights of the active features**. If
something unexpectedly bad happens, blame the features that were switched on — and
thereafter avoid all states with those features. The feature's own value $f_i(s,a)$ scales
the blame, so features that were barely active take barely any.

## 8. When the table cannot exist: DQN

Push the state space far enough and the q-table stops being large and starts being
impossible. Take Atari Breakout with raw pixels as the state: $84 \times 84$ pixels, four
consecutive frames, 256 grey levels. The number of rows is

$$256^{84 \times 84 \times 4},$$

a number with more digits than the universe has atoms. There is no clever indexing scheme
that helps here.

**Deep Q-Network = Q-learning + neural network.** Replace the table with a network that
maps a state to a q-value **per action**:

| | Input | Output |
|---|---|---|
| **Q-table** | state, action | one q-value |
| **DQN** | state | one q-value for each of action 1 … action N |

The update is the same Q-learning update; the network supplies the generalization that the
hand-built features supplied in §7, learned rather than designed. Mnih et al., *Human-level
control through deep reinforcement learning* (Nature, 2015), trained a single architecture
to professional human level across most Atari games — from pixels, with no game-specific
engineering.

The same machinery, scaled, produced helicopter aerobatics (Ng), learned soccer play
(Bansal et al., 2017), and OpenAI's Dactyl hand trained with domain randomization. For a
map of the algorithm families that grew out of this — model-free versus model-based,
policy optimization versus q-learning — OpenAI's Spinning Up taxonomy is the standard
reference.

## Terms defined in one place

| Term | Definition |
|---|---|
| **Reinforcement learning** | Solving an MDP whose $T$ and $R$ are unknown, by acting and observing |
| **Sample** | One experienced transition $(s, a, s', r)$ — the only evidence available |
| **Offline vs online** | Computing with a known model vs acting to discover an unknown one |
| **Model-based learning** | Estimate $\hat{T}$ by counting and $\hat{R}$ by recording, then solve the learned MDP |
| **Model-free learning** | Estimate values directly from samples; never build a model |
| **Passive RL** | Policy evaluation with a fixed policy and no model |
| **Active RL** | The agent chooses actions and seeks the optimal policy |
| **Direct evaluation** | Average observed returns per state; correct but wastes state connections |
| **Temporal difference** | $V(s) \leftarrow (1-\alpha)V(s) + \alpha[r + \gamma V(s')]$, applied every transition |
| **TD error** | $[r + \gamma V(s')] - V(s)$, the gap the update walks along |
| **Learning rate $\alpha$** | The step size; decreasing it gives converging averages |
| **Exponential moving average** | Weights recent samples more, forgets early wrong ones |
| **Q-learning** | $Q(s,a) \leftarrow (1-\alpha)Q(s,a) + \alpha[r + \gamma \max_{a'} Q(s',a')]$ |
| **Q-table** | One row per state, one column per action; its $\arg\max$ is a policy |
| **Off-policy** | Learning optimal values while behaving by another policy |
| **ε-greedy** | Act randomly with probability $\varepsilon$, else greedily |
| **Exploration function** | $f(u,n) = u + k/n$; optimism that decays with visits and propagates backwards |
| **Regret** | Total cost of mistakes made while learning |
| **Feature vector** | Properties of a state as numbers, enabling generalization |
| **Approximate Q-learning** | $Q(s,a) = \sum_i w_i f_i(s,a)$; update weights of active features |
| **DQN** | A neural network in place of the q-table; state in, q-value per action out |

## What to interrogate, not just absorb

1. **"Converges in the limit" is a promise about a world with infinite patience.** Q-learning's
   guarantee requires visiting every state-action pair enough times and annealing $\alpha$
   neither too fast nor too slow. On a real robot, the limit is not reached; what you are
   actually relying on is that the approximation was good enough before the budget ran out.
2. **Regret, not optimality, is what the experiment costs.** Two methods that both reach the
   optimal policy can differ enormously in what they spend getting there. When a result
   reports final performance only, the learning curve — and the damage along it — has been
   quietly omitted.
3. **Off-policy learning is a licence, not a free pass.** Q-learning tolerates bad behaviour
   while learning, but only if that behaviour still covers the space. An agent exploring
   badly converges to confident values for the small region it bothered to visit.
4. **Features decide what the agent is able to distinguish.** Approximate Q-learning cannot
   tell apart two states with identical features, however different their true values. When
   a learned agent fails in one specific situation, suspect the representation before the
   algorithm.
5. **Direct evaluation's flaw is the general one.** B and E differed by ten because of one
   unlucky episode. Any method that estimates states in isolation inherits that variance;
   bootstrapping methods like TD trade it for bias by trusting their own current estimates.
6. **DQN moved the problem, it did not dissolve it.** A network generalizes across states
   the table could not hold, at the price of a function approximator inside a loop that
   assumes its own estimates are reliable. The convergence guarantees of tabular Q-learning
   do not carry over.
