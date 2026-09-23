---
course: bedrock
lectureId: AIMA 3
book: "Artificial Intelligence: A Modern Approach"
part: "II · Problem-solving"
title: "Every Plan Is a Path Through a Graph You Cannot Afford to Draw"
deck: "Chapter 3 reduces goal-directed behavior to pathfinding in a state space, proves which strategies are complete and which are optimal, and then shows that the whole enterprise lives or dies on one thing — the quality of the heuristic estimating how far you still have to go."
order: 3
chapter: 3
readingTime: 15
tags: ["search", "a-star", "heuristics", "admissibility", "complexity"]
concepts:
  - id: problem-formulation
    term: Problem Formulation
    definition: "The five-part specification: initial state, actions available in each state, transition model, goal test, and action cost function. A path's cost is the sum of its action costs; a solution is a path from initial state to goal, optimal if no cheaper path exists."
  - id: search-tree-vs-graph
    term: Search Tree vs. State Space
    definition: "The state space is the graph of distinct world configurations; the search tree is the structure of paths explored through it. One state can appear at many tree nodes, which is why redundant-path handling — a reached table or explored set — is what keeps search tractable on graphs with cycles."
  - id: best-first-search
    term: Best-First Search
    definition: "The template all the strategies instantiate: maintain a frontier as a priority queue ordered by an evaluation function f(n), expand the minimum, and handle repeated states. Choosing f gives breadth-first, uniform-cost, greedy, or A*."
  - id: uninformed-strategies
    term: The Uninformed Strategies
    definition: "Breadth-first (f = depth; complete and optimal for uniform costs), uniform-cost or Dijkstra (f = g; optimal for non-negative costs), depth-first (linear memory, neither complete nor optimal), iterative deepening (BFS guarantees at DFS memory), and bidirectional search."
  - id: a-star
    term: A* and Admissibility
    definition: "Best-first search with f(n) = g(n) + h(n). A* is cost-optimal if h is admissible — never overestimating the true remaining cost — and its graph-search form is optimal if h is consistent, satisfying the triangle inequality h(n) ≤ c(n,a,n′) + h(n′)."
  - id: heuristic-quality
    term: Effective Branching Factor and Dominance
    definition: "The measure of a heuristic's practical value: the branching factor b* of a uniform tree that would contain the same number of expanded nodes. If h₂(n) ≥ h₁(n) everywhere and both are admissible, h₂ dominates and expands no more nodes than h₁."
  - id: relaxed-problems
    term: Heuristics from Relaxed Problems
    definition: "Dropping constraints from a problem yields a relaxed version whose exact solution cost is an admissible heuristic for the original — since any real solution also solves the relaxation. This is the principled source of heuristics like misplaced tiles and Manhattan distance."
  - id: memory-bounded
    term: Memory-Bounded Variants
    definition: "A*'s fatal flaw is space, not time. IDA*, recursive best-first search (RBFS), and SMA* recover linear or bounded memory at the cost of re-expanding nodes; weighted A* trades a bounded factor of optimality for large speedups."
---

The premise of Chapter 3 is a reduction. Suppose an agent's environment is fully
observable, deterministic, discrete, and known, and suppose its goal is
achievable by some sequence of actions. Then deciding what to do is *exactly* the
problem of finding a path in a graph whose vertices are world states and whose
edges are actions. Every goal-directed behavior in this setting is pathfinding,
and the question becomes which pathfinding algorithm, under which guarantees, at
what cost.

The catch, which the chapter never lets you forget, is that the graph is far too
large to build. The 8-puzzle has about $1.8 \times 10^5$ reachable states, which
is nothing; the 15-puzzle has around $10^{13}$; Rubik's cube has $10^{19}$. The
algorithms are all, in one way or another, techniques for visiting a vanishingly
small fraction of a graph while still finding a good path through it.

## The Five-Part Problem

A search problem is defined by an **initial state**, a set of **actions**
applicable in each state, a **transition model** giving the state that results
from an action, a **goal test**, and an **action cost function**
$c(s,a,s')$. The cost of a path is the sum of its action costs; an **optimal
solution** is a lowest-cost path from the initial state to a goal.

The chapter's methodological point in the "Example Problems" section is about
**abstraction**. The route-finding formulation of a road trip discards the
weather, the radio, and the scenery. An abstraction is *valid* if every abstract
solution can be elaborated into a real one, and *useful* if executing each
abstract action is easier than solving the original problem. Choosing a good
abstraction is not preparatory work before the AI starts — it is most of the
engineering.

## The Template, and What Hangs On It

Nearly every algorithm in the chapter is an instance of one loop. Keep a
**frontier** of nodes whose successors have not been generated, repeatedly remove
a node according to an **evaluation function** $f(n)$, test it for the goal, and
expand it. What varies is $f$, and what the algorithm does about states it has
already seen.

That second point deserves emphasis because it is where implementations fail. The
search *tree* is not the state *space*. A state reachable by several paths
appears at several nodes, and on a graph with cycles a naive tree search can run
forever exploring paths that revisit the same states. The remedies — a `reached`
table mapping states to the best node found for them, or an `explored` set — are
what make graph search terminate. The chapter is precise about the trade-off:
remembering states costs memory proportional to the number of distinct states
reached, which is often the binding constraint.

Four properties evaluate any strategy. **Completeness**: does it find a solution
when one exists? **Cost optimality**: is the solution found guaranteed
lowest-cost? **Time complexity** and **space complexity**, usually in terms of
branching factor $b$, depth of the shallowest solution $d$, and maximum path
length $m$.

## The Uninformed Family

**Breadth-first search** expands the shallowest node first. It is complete, and
cost-optimal when every action costs the same. Its time and space are both
$O(b^d)$ — and the chapter's insistence that the *space* is the real problem is
the most practically important claim in the section. Exponential time on a modern
machine is an overnight run; exponential memory is a crash.

**Uniform-cost search** (Dijkstra's algorithm) orders the frontier by $g(n)$, the
cost so far. It is optimal for any non-negative action costs, because it expands
nodes in order of increasing path cost.

**Depth-first search** expands the deepest node first. Its virtue is memory:
$O(bm)$ for tree search, or $O(m)$ in a backtracking variant that generates one
successor at a time and mutates a single state description. It is neither
complete (on infinite or cyclic spaces) nor optimal. **Depth-limited search**
imposes a cutoff $\ell$, restoring termination at the cost of incompleteness when
$\ell < d$.

**Iterative deepening** runs depth-limited search with increasing limits. It is
the chapter's quietly elegant result: the repeated work is negligible, because
the nodes at the deepest level dominate the count, so IDS achieves breadth-first
search's completeness and optimality guarantees at depth-first search's $O(bd)$
memory. When the state space is large and the solution depth unknown, this is
usually the uninformed method of choice.

**Bidirectional search** grows frontiers from both start and goal, meeting in the
middle, replacing $O(b^d)$ with roughly $O(b^{d/2})$ — an enormous saving when it
applies, which requires a tractable predecessor function and a single or easily
enumerated goal state.

## Informed Search: A*

The informed strategies add a **heuristic function** $h(n)$: an estimate of the
cheapest path cost from $n$ to a goal.

**Greedy best-first search** uses $f(n) = h(n)$. It is often fast and is neither
complete nor optimal — it follows whatever looks locally promising and can be
led far astray.

**A\*** uses

$$f(n) = g(n) + h(n)$$

— cost incurred plus cost estimated to remain — and it is the chapter's central
result. A* is cost-optimal provided $h$ is **admissible**: it never overestimates
the true remaining cost. The intuition is that $f(n)$ is then a lower bound on
the cost of any solution through $n$, so A* cannot commit to a suboptimal goal
while a cheaper possibility remains on the frontier with smaller $f$.

For the graph-search version, admissibility is not quite enough; the stronger
condition is **consistency** (monotonicity):

$$h(n) \le c(n,a,n') + h(n')$$

a triangle inequality on the heuristic. Consistency implies admissibility, and
under it $f$ is nondecreasing along any path, so the first time A* expands a node
it has already found the optimal path to it — which is what lets you discard
later, worse paths safely. Nearly every admissible heuristic that arises
naturally is also consistent.

A* is additionally **optimally efficient** among algorithms using the same
heuristic: no other algorithm guaranteed to find optimal solutions with $h$ will
expand fewer nodes (modulo tie-breaking). That is as strong a guarantee as the
chapter offers anywhere.

<figure>
<svg viewBox="0 0 800 280" role="img" aria-label="A diagram showing a node n with g of n as the measured cost from the start and h of n as the estimated cost to the goal, with contours of equal f value shown as nested curves elongating toward the goal as the heuristic improves.">
  <defs>
    <marker id="arw-aima3-astar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" class="dgm-fill"/>
    </marker>
  </defs>
  <circle cx="90" cy="150" r="7" class="dgm-fill"/>
  <text x="90" y="180" text-anchor="middle" font-size="11.5" font-weight="700">start</text>
  <circle cx="370" cy="150" r="7" class="dgm-fill"/>
  <text x="370" y="180" text-anchor="middle" font-size="11.5" font-weight="700">n</text>
  <circle cx="700" cy="150" r="7" class="dgm-fill"/>
  <text x="700" y="180" text-anchor="middle" font-size="11.5" font-weight="700">goal</text>
  <path d="M97 150 Q 200 108 363 150" fill="none" stroke="currentColor" stroke-width="1.6" marker-end="url(#arw-aima3-astar)"/>
  <text x="228" y="98" text-anchor="middle" font-size="12" font-weight="700">g(n)</text>
  <text x="228" y="116" text-anchor="middle" font-size="10.5" class="dgm-muted">measured — cost actually incurred</text>
  <g class="dgm-accent">
    <path d="M377 150 Q 530 108 693 150" fill="none" stroke="currentColor" stroke-width="1.6" stroke-dasharray="6 4" marker-end="url(#arw-aima3-astar)"/>
    <text x="535" y="98" text-anchor="middle" font-size="12" font-weight="700">h(n)</text>
    <text x="535" y="116" text-anchor="middle" font-size="10.5">estimated — must never overestimate</text>
  </g>
  <text x="395" y="228" text-anchor="middle" font-size="13" font-weight="700">f(n) = g(n) + h(n)</text>
  <text x="395" y="252" text-anchor="middle" font-size="11">admissible h keeps f a lower bound on any solution through n</text>
  <text x="395" y="272" text-anchor="middle" font-size="10.5" class="dgm-muted">so A* cannot settle for a costlier goal while a cheaper one is still on the frontier</text>
</svg>
<figcaption><b>Why A* is optimal.</b> Admissibility makes <i>f</i> a lower bound rather than a guess, which converts a greedy ordering into a proof.</figcaption>
</figure>

A*'s practical problem is space: it keeps every generated node, and on hard
problems it exhausts memory long before time. Hence the memory-bounded family.
**IDA\*** applies iterative deepening to the $f$-cost. **Recursive best-first
search** uses linear space and tracks the best alternative $f$-value along the
way, re-expanding subtrees when it backtracks. **SMA\*** uses all available
memory and drops the worst leaf when full. All of them trade repeated computation
for space. **Weighted A\*** with $f = g + W \cdot h$, $W > 1$, gives up strict
optimality for a solution guaranteed within a factor $W$ of optimal, and is often
dramatically faster — the pragmatic default in real systems.

## Where Heuristics Come From

The final section is the chapter's answer to the obvious question, and it is more
systematic than most readers expect.

For the 8-puzzle, $h_1$ counts **misplaced tiles** and $h_2$ sums the
**Manhattan distances** of tiles from their goal positions. Both are admissible;
$h_2$ is uniformly at least as large. Quality is measured by the **effective
branching factor** $b^*$ — the branching factor of a uniform tree of depth $d$
containing the same number of nodes A* expanded — and a good heuristic drives
$b^*$ toward 1.

The **dominance** result formalizes the comparison: if $h_2(n) \ge h_1(n)$ for
all $n$ and both are admissible, then A* with $h_2$ never expands more nodes than
A* with $h_1$. Bigger admissible heuristics are strictly better, so the goal is
the largest estimate you can justify without exceeding the true cost.

Three principled sources follow. **Relaxed problems**: remove constraints, and
the exact cost of the relaxed problem is an admissible heuristic for the
original, because every real solution is also a relaxed solution. Allow a tile to
move anywhere and you get $h_1$; allow it to move to any adjacent square
regardless of occupancy and you get $h_2$. **Pattern databases** store exact
solution costs for subproblems — the cost of getting some subset of tiles home —
precomputed by backward search from the goal; disjoint pattern databases, which
count only the moves of the tiles in each subset, can be added while remaining
admissible. And **learning from experience**: solve many instances, use state
features as inputs, and fit a predictor of remaining cost, accepting that the
result is usually not admissible.

## Why It Matters

Two things from this chapter survive contact with everything that comes after.

The first is the analytic frame: completeness, optimality, time, space — applied
to any procedure that explores alternatives. It recurs in game tree search,
constraint solving, planning, and the decoding strategies used in modern
sequence models, where beam search is a memory-bounded best-first search under a
different name.

The second is the lesson about heuristics, which is the chapter's real subject.
The algorithms are a small, closed, fully understood set. The leverage is
entirely in $h$ — in how much problem-specific structure you can compress into a
lower bound on remaining cost. Relaxation and pattern databases are the general
recipes for manufacturing that structure, and they are what separates a search
that terminates from one that does not.
