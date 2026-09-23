---
course: bedrock
lectureId: AIMA 4
book: "Artificial Intelligence: A Modern Approach"
part: "II · Problem-solving"
title: "When You Cannot See, Cannot Predict, and Cannot Start Over"
deck: "Chapter 4 removes the guarantees Chapter 3 depended on — the path stops mattering, actions stop being reliable, the world stops being visible, and the map stops existing — and shows what survives each amputation."
order: 4
chapter: 4
readingTime: 14
tags: ["local-search", "optimization", "belief-states", "online-search", "nondeterminism"]
concepts:
  - id: local-search
    term: Local Search
    definition: "Search that keeps only the current state (or a small population) and moves to neighbors, using constant memory and ignoring the path entirely. Appropriate when the goal state itself is the answer and how you got there is irrelevant."
  - id: hill-climbing-failures
    term: The Landscape Failure Modes
    definition: "Local maxima, ridges (sequences of local maxima where no single move improves), and plateaux or shoulders (flat regions where the gradient carries no information). Sideways moves, random restarts, and stochastic variants are the standard mitigations."
  - id: simulated-annealing
    term: Simulated Annealing
    definition: "Accept a worsening move of size ΔE with probability e^(ΔE/T), lowering the temperature T on a schedule. At high T it wanders freely; as T → 0 it becomes hill climbing. With a slow enough schedule it finds a global optimum with probability approaching one."
  - id: evolutionary-search
    term: Local Beam and Evolutionary Search
    definition: "Local beam search keeps k states and concentrates effort where progress appears; genetic algorithms add recombination of pairs, which is only advantageous when the representation makes substrings meaningful, schema-like building blocks."
  - id: continuous-search
    term: Search in Continuous Spaces
    definition: "Gradient ascent x ← x + α∇f(x), with step-size control via line search, and Newton–Raphson using the inverse Hessian for second-order steps. Constrained versions reduce to linear or convex programming, which are tractable special cases."
  - id: and-or-search
    term: AND–OR Search Trees
    definition: "For nondeterministic actions, the solution is not a path but a contingency plan: OR nodes are the agent's choices, AND nodes are the environment's possible outcomes, and a solution subtree must specify an action for every outcome that can occur."
  - id: belief-state
    term: Belief States
    definition: "The set of physical states the agent could currently be in. Search over belief states reduces a partially observable problem to a fully observable one in an exponentially larger space, where sensorless planning becomes coercion of the belief state toward a goal."
  - id: online-search
    term: Online Search and LRTA*
    definition: "Interleaving computation and action in an unknown environment, where the agent must act to learn. Competitive ratio compares its cost to the optimal offline cost; LRTA* stores and updates cost estimates so that repeated visits drive it out of local minima."
---

Chapter 3 bought its guarantees with four assumptions: the environment is known,
deterministic, fully observable, and the path is what you want. Chapter 4 takes
them away one at a time. It is the most heterogeneous chapter in the first half
of the book, and its organizing question is what remains recoverable as each
support is removed.

## Dropping the Path

Start with the mildest relaxation. In many problems — circuit layout, job-shop
scheduling, 8-queens, the configuration of a network — the goal state *is* the
answer, and the sequence of moves that produced it is of no interest. That
observation licenses **local search**: keep only the current state, move to a
neighbor, never store a frontier. Memory becomes constant, and problems with
astronomically large or continuous state spaces become approachable.

The framing is a **state-space landscape** with location as state and elevation as
objective value. Hill climbing — steepest ascent — is the simplest instance, and
the chapter is unsentimental about its failure modes. **Local maxima** stop it at
a peak lower than the global one. **Ridges** produce sequences of local maxima
where no single available move ascends, even though the ridge itself climbs.
**Plateaux** and shoulders are flat regions where the objective supplies no
gradient information at all, and where the fix — allowing a bounded number of
sideways moves — is the difference between solving a small fraction of 8-queens
instances and solving nearly all of them.

The variants address the same disease. Stochastic hill climbing samples among
uphill moves. First-choice generates successors until one improves, which is the
practical choice when the branching factor is huge. **Random-restart hill
climbing** simply retries from random initial states, and the chapter's
observation about it is one of the most useful in the book: if each trial
succeeds with probability $p$, the expected number of restarts is $1/p$, so even
a method that works one time in a thousand is viable if a trial is cheap.

**Simulated annealing** is the principled escape. Pick a random move; accept it
if it improves, and otherwise accept it with probability $e^{\Delta E / T}$,
where $\Delta E$ is the (negative) change in objective and $T$ is a temperature
lowered over time. At high temperature the search wanders almost freely; as $T
\to 0$ it degenerates to hill climbing. With a sufficiently slow schedule it
finds a global optimum with probability approaching 1 — a guarantee that is
asymptotic and, in practice, usually unattainable, but it explains why annealing
works as well as it does.

**Local beam search** keeps $k$ states and generates all their successors,
retaining the best $k$. The chapter is careful to distinguish this from $k$
parallel restarts: information passes between the threads, because successors are
selected from the pooled set, so effort migrates toward wherever progress is
being made. Its weakness is exactly that — concentration into a single region —
which stochastic beam search mitigates by sampling successors with probability
increasing in value.

**Genetic algorithms** extend beam search with sexual recombination: encode
states as strings, select parents with probability proportional to fitness,
crossover at a point, mutate occasionally. The chapter's assessment is notably
cool. Crossover only helps when the representation is such that contiguous
substrings correspond to meaningful, independently useful components — the schema
idea — and when it does not, a genetic algorithm is a needlessly complicated
random-restart hill climber. The lesson generalizes: the representation, not the
metaheuristic, carries the performance.

## Continuous Spaces

Real-world problems are frequently continuous, and the discrete machinery does
not transfer — the branching factor is infinite. The chapter's treatment is
brief and correct: use the gradient.

For an objective $f(\mathbf{x})$, steepest ascent is

$$\mathbf{x} \leftarrow \mathbf{x} + \alpha \nabla f(\mathbf{x})$$

with the step size $\alpha$ the practical difficulty — too small and convergence
crawls, too large and it oscillates. **Line search** adjusts it adaptively.
Second-order methods use the Hessian: the Newton–Raphson update

$$\mathbf{x} \leftarrow \mathbf{x} - \mathbf{H}_f^{-1}(\mathbf{x}) \nabla f(\mathbf{x})$$

converges far faster near an optimum, at the cost of forming and inverting an
$n \times n$ matrix, which is why large-scale practice uses quasi-Newton
approximations. Where the gradient is unavailable, **empirical gradients** —
finite differences — work at the cost of many evaluations.

The chapter also notes the constrained cases: **linear programming**, where
constraints and objective are linear, and the broader class of **convex
optimization**, both solvable in polynomial time and both worth recognizing
because a problem that can be cast into either is effectively solved. And local
maxima, ridges, and plateaux all have continuous analogues — the gradient does
not exempt you from the landscape.

## Dropping Determinism

When actions can have several outcomes, a solution can no longer be a sequence.
It must be a **contingency plan** that says what to do in each case that might
arise — which means the search tree acquires two kinds of node.

<figure>
<svg viewBox="0 0 820 300" role="img" aria-label="An AND-OR search tree: a square OR node where the agent chooses between two actions, each leading to a circular AND node where the environment selects among outcomes, with a solution subtree required to cover every branch of the AND nodes.">
  <defs>
    <marker id="arw-aima4-andor" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" class="dgm-fill"/>
    </marker>
  </defs>
  <rect x="370" y="26" width="80" height="34" fill="none" stroke="currentColor" stroke-width="1.6"/>
  <text x="410" y="48" text-anchor="middle" font-size="11.5" font-weight="700">OR</text>
  <text x="410" y="16" text-anchor="middle" font-size="10.5" class="dgm-muted">the agent chooses</text>
  <line x1="386" y1="60" x2="230" y2="96" stroke="currentColor" stroke-width="1.4" marker-end="url(#arw-aima4-andor)"/>
  <line x1="434" y1="60" x2="590" y2="96" stroke="currentColor" stroke-width="1.4" marker-end="url(#arw-aima4-andor)"/>
  <text x="286" y="80" text-anchor="middle" font-size="10.5" class="dgm-muted">action a</text>
  <text x="540" y="80" text-anchor="middle" font-size="10.5" class="dgm-muted">action b</text>
  <g class="dgm-accent">
    <circle cx="220" cy="118" r="20" class="dgm-soft" stroke="currentColor" stroke-width="1.6"/>
    <text x="220" y="123" text-anchor="middle" font-size="11" font-weight="700">AND</text>
  </g>
  <circle cx="600" cy="118" r="20" fill="none" stroke="currentColor" stroke-width="1.6"/>
  <text x="600" y="123" text-anchor="middle" font-size="11" font-weight="700">AND</text>
  <text x="220" y="160" text-anchor="middle" font-size="10.5" class="dgm-muted">the environment chooses</text>
  <line x1="206" y1="134" x2="120" y2="188" stroke="currentColor" stroke-width="1.4" marker-end="url(#arw-aima4-andor)"/>
  <line x1="234" y1="134" x2="320" y2="188" stroke="currentColor" stroke-width="1.4" marker-end="url(#arw-aima4-andor)"/>
  <line x1="586" y1="134" x2="500" y2="188" stroke="currentColor" stroke-width="1.4" marker-end="url(#arw-aima4-andor)"/>
  <line x1="614" y1="134" x2="700" y2="188" stroke="currentColor" stroke-width="1.4" marker-end="url(#arw-aima4-andor)"/>
  <rect x="80" y="192" width="80" height="30" fill="none" stroke="currentColor" stroke-width="1.4"/>
  <rect x="280" y="192" width="80" height="30" fill="none" stroke="currentColor" stroke-width="1.4"/>
  <rect x="460" y="192" width="80" height="30" fill="none" stroke="currentColor" stroke-width="1.4"/>
  <rect x="660" y="192" width="80" height="30" fill="none" stroke="currentColor" stroke-width="1.4"/>
  <text x="410" y="256" text-anchor="middle" font-size="11.5">a solution is a <tspan font-weight="700">subtree</tspan>: one branch at each OR node, <tspan font-weight="700">every</tspan> branch at each AND node</text>
  <text x="410" y="282" text-anchor="middle" font-size="10.5" class="dgm-muted">which is why the output is a plan with conditionals, not a sequence of actions</text>
</svg>
<figcaption><b>Planning against an environment that gets a move.</b> The agent picks one child at an OR node; the environment picks at an AND node, so the plan has to cover all of them.</figcaption>
</figure>

**OR nodes** are the agent's choice points; **AND nodes** are the environment's.
A solution is a subtree choosing one branch at each OR node and containing
*every* branch at each AND node, with a goal at every leaf. Executed, such a plan
has the structure of nested conditionals.

The **cyclic** case is where the treatment gets interesting. Some problems have
no acyclic solution but do have a plan that succeeds eventually — keep trying the
action until it works. These correspond to plans with loops, and they are
solutions only under the assumption that the nondeterminism is not adversarial:
that repeated attempts will eventually produce the desired outcome rather than
being systematically frustrated. The chapter flags this assumption explicitly,
and it is the one that separates this material from Chapter 6's games.

## Dropping Observability

If the agent cannot see the state, it can still reason about the set of states it
might be in — its **belief state**. The move is a reduction: search in belief
space is fully observable, because the agent always knows its own belief state,
so the standard algorithms apply. The price is that the belief space over $N$
physical states has $2^N$ elements.

The **sensorless** (conformant) case is the purest version. With no percepts at
all, the agent starts in the belief state of all possible initial states and must
find an action sequence that drives that set into the goal regardless of which
member is true. The striking property is that actions can *shrink* a belief
state — moving right against a wall collapses several possible positions into
one, so the agent **coerces** the world into a known configuration without ever
observing it.

With partial sensing, each action is followed by a **percept** that partitions
the predicted belief state into the subsets consistent with each possible
observation — so the problem is again AND–OR, with percepts supplying the AND
branching. The chapter's practical note is that incremental belief-state search,
which finds a solution for one member of the belief state and then checks it
against the rest, usually beats constructing the full belief states, because most
candidate plans fail on the second or third member and can be abandoned early.

## Dropping the Map

Finally, the agent may not know the environment at all. **Online search**
interleaves computation, action, and observation — necessary in genuinely unknown
territory, where the only way to learn the transition model is to act.

The evaluation standard is the **competitive ratio**: the cost the online agent
actually incurs against the cost of the optimal path it would have taken with a
map. The ratio can be unbounded in the worst case — dead ends can be arbitrarily
costly, and no algorithm can avoid them without prior knowledge. Irreversible
actions can leave an agent in a state from which no goal is reachable, which is
why the theoretical results generally assume a safely explorable space.

Online depth-first search works when actions are reversible, because backtracking
requires physically retracing steps. Hill climbing cannot restart randomly — the
agent is *somewhere*, not everywhere — so the adaptation is **LRTA\***
(learning real-time A*), which stores a cost estimate for each visited state and
updates it from neighbors. A state that proves disappointing has its estimate
raised, which makes the agent less willing to return, and the flat or misleading
regions gradually acquire accurate gradients. The estimate is optimistic at
first, so unexplored states look attractive — a built-in exploration incentive.
The mechanism is a direct ancestor of the temporal-difference methods in Chapter
23.

## Why It Matters

This chapter is where the book's neat guarantees end, and it is more
representative of deployed systems than Chapter 3. Almost nothing real is
deterministic and fully observable with a known model.

The three ideas that recur hardest later are: the **belief state** as the object
of reasoning when the world is hidden, which returns as the probability
distribution in filtering (Chapter 14) and POMDPs (Chapter 16); the
**contingency plan** rather than the action sequence as the unit of output, which
becomes the policy; and **local search under an objective**, which — in its
continuous, gradient-following form — is the entire computational substrate of
Part V. When you run gradient descent on a loss surface and worry about local
minima, plateaux, learning-rate schedules, and restarts, you are working inside
this chapter.
