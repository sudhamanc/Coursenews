---
course: ai-foundations
lectureId: W2
title: "Planning in Simulation: Search Problems and Uninformed Search"
deck: "A reflex agent reacts to how the world is; a planning agent asks how the world would be. Turning that question into an algorithm takes a precise problem formulation, a sharp distinction between a state space and a search tree, and a single loop whose behavior is decided entirely by which node it explores next."
order: 2
readingTime: 15
tags: ["search", "state-space", "bfs", "dfs", "uniform-cost", "iterative-deepening"]
concepts:
  - id: planning-agent
    term: Planning Agent
    definition: "An agent that asks 'what if' — it simulates the consequences of candidate action sequences using a model of how the world responds, and commits to one that reaches a goal. Contrast with a reflex agent, which acts on how the world is now."
  - id: search-problem
    term: Search Problem
    definition: "A state space, the actions available in each state, a transition model giving each action's result, a goal test, and a cost function. A solution is a sequence of actions (a plan) from the start state to a goal state."
  - id: state-space-graph
    term: State Space Graph vs. Search Tree
    definition: "The graph has one node per world configuration and an arc per action. The search tree has one node per plan, rooted at the start state. Every state appears once in the graph but can appear many — even infinitely many — times in the tree."
  - id: fringe
    term: Fringe (Frontier)
    definition: "The set of generated but not yet expanded nodes — the partial plans still under consideration. Every uninformed and informed search algorithm is the same loop over the fringe; only the order in which nodes leave it differs."
  - id: completeness-optimality
    term: Complete, Optimal, Time, Space
    definition: "The four yardsticks for a search algorithm: does it always find a solution when one exists, is the solution it finds the cheapest, how many nodes does it generate, and how many must it hold in memory at once."
  - id: bfs-dfs
    term: Breadth-First and Depth-First Search
    definition: "BFS expands the shallowest node first using a FIFO queue — complete, optimal for unit costs, exponential in memory. DFS expands the deepest node first using a LIFO stack — linear in memory, but neither complete nor optimal in general."
  - id: iterative-deepening
    term: Iterative Deepening
    definition: "Depth-first search run with depth limits 0, 1, 2, … until a solution appears. It keeps DFS's linear memory while gaining BFS's completeness and unit-cost optimality, and the repeated shallow work adds only a small constant factor."
  - id: uniform-cost
    term: Uniform-Cost Search
    definition: "Expands the node with the lowest path cost g(n), using a priority queue. Complete and optimal whenever every step costs at least some ε > 0, but it spreads out evenly in every direction because it knows nothing about where the goal is."
  - id: closed-set
    term: Repeated States and the Closed Set
    definition: "A record of states already expanded, checked before expanding again. Without it, cycles and alternative routes can turn a problem that is linear in the number of states into one that is exponential in the depth."
---

A reflex agent consults how the world *is* and acts. A planning agent consults how the
world *would be* — it takes a model of what its actions do, imagines sequences of
them, and commits only once one of those imagined sequences reaches a goal. The
imagining is search, and this feature works through its foundations: what makes
something a search problem, why the space of plans is so much larger than the space
of states, and how five classic algorithms that look different are really one
algorithm with a single decision changed.

**Sources:** AIMA Chapter 3 (Sections 3.1–3.4)

## 1. Two kinds of agent

A **reflex agent** chooses its action from the current percept, and possibly from some
memory or a model of the world's current state. What it never does is consider the
future consequences of what it is about to do.

Can a reflex agent be rational? Sometimes, yes. In an environment where the right
action really is determined by what is visible now — a well-designed thermostat, a
tile-sorting arm — a reflex agent can be optimal. It fails when the right move today
depends on what it leads to later: a reflex agent in a maze keeps choosing the step
that looks best locally and walks into a dead end.

A **planning agent** asks *what if*. It needs two things a reflex agent can do
without: a **model** of how the world evolves in response to its actions, and a
**goal test** that says when it is done. It then reasons about hypothesized
consequences rather than present appearances.

Two distinctions inside planning matter later:

- **Optimal vs. complete planning.** A complete planner guarantees *a* solution if one
  exists; an optimal one guarantees the *cheapest*. The algorithms below differ on
  exactly these two guarantees.
- **Planning vs. replanning.** A planner can compute a whole plan and execute it, or
  plan a little, act, observe, and plan again. Replanning trades optimality for
  responsiveness, and is how most deployed systems cope with a model that is wrong.

## 2. What counts as a problem

In computing, a problem is a question that requires an answer, and problems come in
families: **decision** problems (is there a solution?), **search** problems (find
one), **counting** problems (how many are there?), and **optimization** problems
(find the best one).

For many specific problems we already have a specialized procedure — the quadratic
formula solves a quadratic exactly, and is useless for anything else. The ambition of
problem solving in AI runs the other way: find **general procedures that solve general
classes of problems**. Humans seem to manage this; whether any single algorithm can
handle every computationally solvable problem efficiently is the field's version of
the question.

Search is the first answer, and it is far more general than it looks. Proving a
theorem, solving a physics problem, finding a route across a city, playing a
single-player game, and diagnosing why a car will not start can all be formulated as
search. (Multi-player games need an adversary in the model and get their own
treatment.)

## 3. Formulating a search problem

Solving a problem by search happens in two steps: **formulate** it, then **find a
solution** — a specific sequence of actions. Formulation means specifying five things:

- **States and the initial state** — the configurations of the problem, and which one
  you start in.
- **Actions** — a function returning the finite set of actions executable in a given
  state.
- **Transition model** (successor function) — given a state and an action, the
  resulting state.
- **Goal test** — a function deciding whether a state is a solution.
- **Cost function** — a numeric cost for a sequence of actions; sometimes all that
  matters is reaching the goal at all.

A **solution** is a plan: a sequence of actions transforming the start state into a
goal state.

Five formulations, side by side:

| Problem | States | Initial state | Actions | Goal | Cost |
|---|---|---|---|---|---|
| **Maze** | Robot's `(x, y)` plus facing direction `d` | `(0, 0, down)` | Advance, turn left, turn right | Any state `(9, 4, *)` | 1 per action |
| **Vacuum world** | Robot position, dirt in A?, dirt in B? | `(A, no, yes)` | Left, Right, Suck, NoOp | Both squares clean | Per action |
| **Wolf, goat, cabbage** | Location of each of the three (left bank, boat, right bank) and of the boat | All on the left | Move boat; load or unload each passenger — never leaving wolf with goat or goat with cabbage | All on the right | 1 per action |
| **Route-finding (Romania)** | Cities | Arad | Drive to an adjacent city | Is the city Bucharest? | Road distance |
| **8-puzzle** | Board as a vector of nine cells | e.g. `(8, _, 6, 5, 4, 7, 2, 3, 1)` | Move the blank up, down, left, right | `(_, 1, 2, 3, 4, 5, 6, 7, 8)` | 1 per move |

Two choices in that table are easy to miss. The maze state includes the robot's
**facing direction**, because "advance" means different things depending on it —
leave it out and the transition model is no longer a function of the state. And the
river puzzle bakes its safety rule into the **actions** rather than the goal: unsafe
configurations are simply never generated, which shrinks the space before search
begins.

## 4. How big is the space?

The crudest algorithm imaginable is to enumerate every possible action sequence —
`[left]`, `[right]`, `[advance]`, `[left, left]`, `[left, right]`, … — and try each
until one works. Every real algorithm improves on that by exploring the **state
space**: the set of states reachable from the initial state by some sequence of
actions. Different problem-solving methods are, at bottom, different strategies for
exploring it.

A first measure of a problem's difficulty is the size of that space:

- **Maze:** a 5 × 10 grid with 4 facing directions is $5 \times 10 \times 4 = 200$
  states. Trivial.
- **Wolf, goat, cabbage:** three passengers with three locations each, and a boat with
  two, gives at most $3^3 \times 2 = 54$ states — fewer once the safety rule prunes the
  illegal ones.
- **8-puzzle:** nine cells holding eight tiles and a blank can be arranged in
  $9! = 362{,}880$ ways. Only half of them — 181,440 — are actually reachable from any
  given start: a parity argument shows the other half can never be reached by sliding
  tiles. A formulation can overstate its own state space by a factor of two without
  anyone noticing.
- **Chess:** estimates of the number of legal positions run from around $10^{43}$ to
  $10^{50}$. Exhaustive search is not a strategy.

### World state vs. search state

The **world state** includes every detail of the environment. A **search state** keeps
only the details the problem needs — and choosing those details is abstraction, which
is the single biggest lever on whether search is feasible.

Take a Pac-Man board with 120 agent positions, 30 food pellets, two ghosts with 12
possible positions each, and four facing directions:

| What you are counting | Size |
|---|---|
| World states | $120 \times 2^{30} \times 12^2 \times 4$ — astronomically many |
| Search states for **pathing** (get from A to B) | $120$ — only the position matters |
| Search states for **eat all the dots** | $120 \times 2^{30}$ — position plus one boolean per pellet |

Same board, three problems, state spaces differing by twelve orders of magnitude.
Change the problem to "eat all the dots while keeping the ghosts permanently scared"
and the state must also carry which power pellets remain and how much scared time is
left — the problem decides the state, not the board.

### Search runs on models

The agent never tries all these plans in the real world. Search is planning **in
simulation**, over a model of the world — and so a search is only ever as good as its
model. A perfect algorithm over a wrong transition model returns a perfect plan for
the wrong world.

## 5. State space graphs and search trees

A **state space graph** is the mathematical picture of a search problem: nodes are
(abstracted) world configurations, arcs are actions, and the goal test picks out a set
of goal nodes. In a state space graph **each state occurs exactly once**. It is a
useful idea and almost never something you build — for most problems it does not fit
in memory.

A **search tree** is what algorithms actually grow. Its root is the start state, its
children are successors, and — the crucial point — each node corresponds to a **plan**,
the path from the root that reaches that state. Nodes *show* states but *are* plans.

The difference in size can be total. A four-state graph with a cycle produces an
infinite search tree:

<figure>
<svg viewBox="0 0 840 290" role="img" aria-label="On the left, a four-state graph with start S, states a and b that point to each other, and goal G. On the right, the search tree grown from S: the a-b cycle makes a and b reappear at every level, so the tree never ends.">
  <defs>
    <marker id="arw-w2-tree" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" class="dgm-fill"/>
    </marker>
  </defs>
  <text x="180" y="26" text-anchor="middle" font-size="12" font-weight="700">STATE SPACE GRAPH</text>
  <text x="180" y="44" text-anchor="middle" font-size="10.5" class="dgm-muted">four states, each appears once</text>
  <circle cx="60" cy="150" r="20" fill="none" stroke="currentColor" stroke-width="1.6"/>
  <text x="60" y="155" text-anchor="middle" font-size="12" font-weight="700">S</text>
  <circle cx="180" cy="90" r="20" fill="none" stroke="currentColor" stroke-width="1.6"/>
  <text x="180" y="95" text-anchor="middle" font-size="12">a</text>
  <circle cx="180" cy="210" r="20" fill="none" stroke="currentColor" stroke-width="1.6"/>
  <text x="180" y="215" text-anchor="middle" font-size="12">b</text>
  <circle cx="300" cy="150" r="20" class="dgm-soft" stroke="currentColor" stroke-width="1.6"/>
  <text x="300" y="155" text-anchor="middle" font-size="12" font-weight="700">G</text>
  <line x1="78" y1="140" x2="160" y2="99" stroke="currentColor" stroke-width="1.4" marker-end="url(#arw-w2-tree)"/>
  <line x1="78" y1="160" x2="160" y2="201" stroke="currentColor" stroke-width="1.4" marker-end="url(#arw-w2-tree)"/>
  <line x1="198" y1="99" x2="280" y2="140" stroke="currentColor" stroke-width="1.4" marker-end="url(#arw-w2-tree)"/>
  <line x1="198" y1="201" x2="280" y2="160" stroke="currentColor" stroke-width="1.4" marker-end="url(#arw-w2-tree)"/>
  <g class="dgm-accent">
    <path d="M172 110 Q 156 150 172 190" fill="none" stroke="currentColor" stroke-width="1.6" marker-end="url(#arw-w2-tree)"/>
    <path d="M188 190 Q 204 150 188 110" fill="none" stroke="currentColor" stroke-width="1.6" marker-end="url(#arw-w2-tree)"/>
    <text x="232" y="154" text-anchor="middle" font-size="10.5" font-weight="700">cycle</text>
  </g>
  <line x1="370" y1="20" x2="370" y2="270" stroke="currentColor" stroke-width="1" stroke-dasharray="4 4" class="dgm-muted"/>
  <text x="615" y="26" text-anchor="middle" font-size="12" font-weight="700">SEARCH TREE FROM S</text>
  <text x="615" y="44" text-anchor="middle" font-size="10.5" class="dgm-muted">each node is a plan — and the plans never run out</text>
  <text x="615" y="74" text-anchor="middle" font-size="12" font-weight="700">S</text>
  <line x1="605" y1="80" x2="530" y2="106" stroke="currentColor" stroke-width="1.2"/>
  <line x1="625" y1="80" x2="700" y2="106" stroke="currentColor" stroke-width="1.2"/>
  <text x="525" y="120" text-anchor="middle" font-size="12">a</text>
  <text x="705" y="120" text-anchor="middle" font-size="12">b</text>
  <line x1="518" y1="126" x2="478" y2="152" stroke="currentColor" stroke-width="1.2"/>
  <line x1="532" y1="126" x2="572" y2="152" stroke="currentColor" stroke-width="1.2"/>
  <line x1="698" y1="126" x2="658" y2="152" stroke="currentColor" stroke-width="1.2"/>
  <line x1="712" y1="126" x2="752" y2="152" stroke="currentColor" stroke-width="1.2"/>
  <text x="475" y="166" text-anchor="middle" font-size="12">b</text>
  <text x="575" y="166" text-anchor="middle" font-size="12" font-weight="700">G</text>
  <text x="655" y="166" text-anchor="middle" font-size="12">a</text>
  <text x="755" y="166" text-anchor="middle" font-size="12" font-weight="700">G</text>
  <line x1="468" y1="172" x2="440" y2="198" stroke="currentColor" stroke-width="1.2"/>
  <line x1="482" y1="172" x2="510" y2="198" stroke="currentColor" stroke-width="1.2"/>
  <line x1="648" y1="172" x2="620" y2="198" stroke="currentColor" stroke-width="1.2"/>
  <line x1="662" y1="172" x2="690" y2="198" stroke="currentColor" stroke-width="1.2"/>
  <text x="437" y="212" text-anchor="middle" font-size="12">a</text>
  <text x="513" y="212" text-anchor="middle" font-size="12" font-weight="700">G</text>
  <text x="617" y="212" text-anchor="middle" font-size="12">b</text>
  <text x="693" y="212" text-anchor="middle" font-size="12" font-weight="700">G</text>
  <g class="dgm-accent">
    <text x="437" y="238" text-anchor="middle" font-size="13" font-weight="700">⋮</text>
    <text x="617" y="238" text-anchor="middle" font-size="13" font-weight="700">⋮</text>
  </g>
  <text x="615" y="270" text-anchor="middle" font-size="10.5" class="dgm-muted">a and b reappear at every level: the same states, ever-longer plans</text>
</svg>
<figcaption><b>Four states, infinitely many plans.</b> The graph is finite; the tree of plans through it is not, and most of it is repeated structure. That repetition is what the closed set in §11 exists to cut off.</figcaption>
</figure>

The same holds at scale. In the 8-puzzle, the root's children are the boards
reachable in one move, its grandchildren those reachable in two, and if the problem
has a solution, it is one of the branches. Search strategies are different ways of
walking those branches.

## 6. General tree search

Searching with a tree means expanding potential plans (tree nodes), maintaining a
**fringe** — also called the frontier — of partial plans under consideration, and
trying to expand as few nodes as possible. Three ideas organize every algorithm:

- **Fringe** — the generated-but-unexpanded nodes.
- **Expansion** — removing a node from the fringe and generating its children.
- **Exploration strategy** — the rule for *which* fringe node to expand next.

The main question of the whole subject is that third one.

### The yardsticks

Every strategy is judged on four properties:

- **Complete** — guaranteed to find a solution if one exists?
- **Optimal** — guaranteed to find the least-cost solution?
- **Time complexity** — how many nodes are generated?
- **Space complexity** — how many nodes must be held at once?

Complexity is stated in three quantities: the **branching factor** $b$ (successors per
node), the **maximum depth** $m$ of the tree (possibly infinite), and the depth of the
shallowest solution, written $d$ (or $s$). A uniform tree to depth $m$ contains

$$1 + b + b^2 + \cdots + b^m = O(b^m)$$

nodes, which is the number to beat.

## 7. Depth-first search

**Strategy:** expand the deepest unexpanded node first. **Implementation:** the fringe
is a LIFO stack.

| Property | Depth-first search |
|---|---|
| Complete? | **No.** It can follow an infinite branch forever, or loop around a cycle. Checking for repeated states along the current path makes it complete in *finite* spaces |
| Time | $O(b^m)$ — terrible when $m$ is much larger than $d$, but if solutions are dense it can be far faster than breadth-first |
| Space | $O(bm)$ — **linear**, its great virtue: it stores one path plus the unexpanded siblings along it |
| Optimal? | **No.** It returns the leftmost solution it stumbles into, not the cheapest |

## 8. Breadth-first search

**Strategy:** expand the shallowest unexpanded node first. **Implementation:** the
fringe is a FIFO queue. It processes the tree tier by tier, so it touches every node
above the shallowest solution.

| Property | Breadth-first search |
|---|---|
| Complete? | **Yes**, provided $b$ is finite — the shallowest solution has finite depth, so BFS reaches it |
| Time | $O(b^d)$ |
| Space | $O(b^d)$ — the fringe holds roughly the entire last tier |
| Optimal? | **Only if every action costs the same.** BFS minimizes the number of actions, not their total cost |

The exact exponent depends on **when the goal test runs**. Testing a node when it is
*generated* gives $O(b^d)$; testing only when it is *expanded* means generating the
whole next tier first, and the bound becomes $O(b^{d+1})$. It is a one-line change
with a factor-of-$b$ consequence.

Memory, not time, is what kills breadth-first search. A machine generating nodes at
100 MB per second fills **8.64 TB in a day**. An overnight run is tolerable; running
out of memory halfway through is not.

**When does each win?** BFS wins when solutions are shallow, or when the tree has
infinite or very deep branches that would trap DFS. DFS wins when memory is the
binding constraint, or when solutions are plentiful and deep, so diving down any
branch finds one quickly.

## 9. Iterative deepening

The idea is to buy DFS's memory with BFS's guarantees. Run depth-first search with a
depth limit of 0. If that finds nothing, run it again with a limit of 1, then 2, then
3, and so on:

```text
function ITERATIVE-DEEPENING-SEARCH(problem):
    for depth = 0, 1, 2, ...:
        result = DEPTH-LIMITED-SEARCH(problem, depth)
        if result != cutoff:
            return result
```

Isn't re-expanding the shallow levels over and over wasteful? Much less than it
appears, because in a tree with branching factor $b$ **most of the nodes are in the
bottom level**. Nodes at depth 1 are generated $d$ times, at depth 2 $d-1$ times, and
so on:

$$(d+1)b^0 + d\,b^1 + (d-1)\,b^2 + \cdots + b^d = O(b^d)$$

For $b = 10$ and $d = 5$, with the solution at the far right of the bottom level:

| Algorithm | Nodes generated |
|---|---|
| Iterative deepening | $50 + 400 + 3{,}000 + 20{,}000 + 100{,}000 = 123{,}450$ |
| BFS, goal test on expansion | $10 + 100 + 1{,}000 + 10{,}000 + 100{,}000 + 999{,}990 = 1{,}111{,}100$ |
| BFS, goal test on generation | $10 + 100 + 1{,}000 + 10{,}000 + 100{,}000 = 111{,}110$ |

Iterative deepening beats the expand-time BFS by a factor of nine, because it never
generates the children of the depth-$d$ nodes. Against the smarter generate-time BFS
it costs about 11% more — the price of linear memory.

| Property | Iterative deepening |
|---|---|
| Complete? | **Yes** |
| Time | $O(b^d)$ |
| Space | $O(bd)$ — linear |
| Optimal? | **Yes, if every step costs 1.** It can be modified to grow cost limits instead of depth limits |

When the state space is large and the solution depth unknown, iterative deepening is
usually the uninformed method of choice.

## 10. Uniform-cost search

Breadth-first search finds the path with the fewest *actions*, which is not the same
as the cheapest path when actions cost different amounts. **Uniform-cost search**
fixes that.

**Strategy:** expand the cheapest node first — the one with the lowest path cost
$g(n)$. **Implementation:** the fringe is a priority queue keyed on cumulative cost.
With all step costs equal, UCS is exactly BFS; in general it is Dijkstra's algorithm,
stopped at the goal.

UCS explores in **cost contours**: every node cheaper than the best solution gets
expanded before that solution is returned. If the optimal solution costs $C^*$ and
every action costs at least $\varepsilon > 0$, the "effective depth" of the search is
about $C^*/\varepsilon$:

| Property | Uniform-cost search |
|---|---|
| Complete? | **Yes**, if the best solution has finite cost and every step costs at least some $\varepsilon > 0$ |
| Time | $O\!\left(b^{\lceil C^*/\varepsilon \rceil}\right)$ — exponential in the effective depth |
| Space | $O\!\left(b^{\lceil C^*/\varepsilon \rceil}\right)$ |
| Optimal? | **Yes** — nodes are expanded in increasing order of $g(n)$, so the first goal dequeued is the cheapest |

The $\varepsilon$ condition is not decoration. Allow zero-cost actions and UCS can loop
forever along a free cycle; allow arbitrarily small positive costs and the effective
depth is unbounded.

The good news is that UCS is complete and optimal. The bad news is that it **explores
options in every direction**. It has no information about where the goal is, so its
contours spread out like a ripple — as much effort on the side facing away from the
goal as on the side facing it. Fixing that is the subject of informed search.

## 11. Repeated states

**Failure to detect repeated states can turn a linear problem into an exponential
one.** In a grid, the number of distinct paths to a cell grows exponentially with
distance even though the number of cells grows only linearly; a tree search that
treats every path as new pays for all of them. The cure is a **closed set** of states
already expanded:

```python
def breadth_first_search(start, is_goal, successors):
    frontier = deque([start])         # OPEN: generated, not yet expanded
    parent = {start: None}            # every state ever generated
    closed = set()                    # CLOSED: expanded
    while frontier:
        state = frontier.popleft()
        if is_goal(state):
            return path_to(state, parent)
        closed.add(state)
        for child in successors(state):
            if child not in closed and child not in parent:
                parent[child] = state
                frontier.append(child)
    return None
```

Two implementation points matter more than they look. First, skipping states already
seen is what prevents infinite loops — without it, the river puzzle shuttles the goat
back and forth forever. Second, **the closed "list" should never be a list**. A list
makes each membership check linear in its length; a hash set makes it constant, and
on any non-trivial problem that is the difference between a search that finishes and
one that does not.

## 12. One loop, five algorithms

Step back and the pattern is the point. Every algorithm above is the **same loop** —
take a node off the fringe, test it, expand it — differing only in the order nodes
leave the fringe. Conceptually every fringe is a priority queue; for DFS and BFS you
can skip the $O(\log n)$ overhead of a real priority queue and use a stack or a plain
queue instead.

<figure>
<svg viewBox="0 0 840 280" role="img" aria-label="A single search loop — take the next node off the fringe, test it, expand it — shown beside the five fringe disciplines that turn it into different algorithms: a stack gives depth-first search, a FIFO queue gives breadth-first search, a priority queue on path cost gives uniform-cost search, a priority queue on the heuristic gives greedy search, and a priority queue on path cost plus heuristic gives A star.">
  <defs>
    <marker id="arw-w2-queue" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" class="dgm-fill"/>
    </marker>
  </defs>
  <text x="170" y="26" text-anchor="middle" font-size="12" font-weight="700">THE ONE LOOP</text>
  <rect x="40" y="44" width="260" height="44" rx="5" fill="none" stroke="currentColor" stroke-width="1.6"/>
  <text x="170" y="71" text-anchor="middle" font-size="11.5">take the next node off the fringe</text>
  <rect x="40" y="120" width="260" height="44" rx="5" fill="none" stroke="currentColor" stroke-width="1.6"/>
  <text x="170" y="147" text-anchor="middle" font-size="11.5">goal test — stop if it passes</text>
  <rect x="40" y="196" width="260" height="44" rx="5" fill="none" stroke="currentColor" stroke-width="1.6"/>
  <text x="170" y="223" text-anchor="middle" font-size="11.5">expand — add successors to the fringe</text>
  <line x1="170" y1="88" x2="170" y2="116" stroke="currentColor" stroke-width="1.4" marker-end="url(#arw-w2-queue)"/>
  <line x1="170" y1="164" x2="170" y2="192" stroke="currentColor" stroke-width="1.4" marker-end="url(#arw-w2-queue)"/>
  <path d="M40 218 L22 218 L22 66 L36 66" fill="none" stroke="currentColor" stroke-width="1.4" marker-end="url(#arw-w2-queue)"/>
  <g class="dgm-accent">
    <line x1="300" y1="66" x2="352" y2="66" stroke="currentColor" stroke-width="1.6" stroke-dasharray="5 4"/>
    <text x="590" y="26" text-anchor="middle" font-size="12" font-weight="700">THE ONLY THING THAT CHANGES</text>
  </g>
  <text x="370" y="70" font-size="11.5" font-weight="700">stack (LIFO)</text>
  <line x1="560" y1="66" x2="592" y2="66" stroke="currentColor" stroke-width="1.2" marker-end="url(#arw-w2-queue)"/>
  <text x="600" y="70" font-size="11.5">depth-first search</text>
  <text x="370" y="110" font-size="11.5" font-weight="700">queue (FIFO)</text>
  <line x1="560" y1="106" x2="592" y2="106" stroke="currentColor" stroke-width="1.2" marker-end="url(#arw-w2-queue)"/>
  <text x="600" y="110" font-size="11.5">breadth-first search</text>
  <text x="370" y="150" font-size="11.5" font-weight="700">priority on g(n)</text>
  <line x1="560" y1="146" x2="592" y2="146" stroke="currentColor" stroke-width="1.2" marker-end="url(#arw-w2-queue)"/>
  <text x="600" y="150" font-size="11.5">uniform-cost search</text>
  <line x1="360" y1="172" x2="820" y2="172" stroke="currentColor" stroke-width="1" stroke-dasharray="3 4" class="dgm-muted"/>
  <g class="dgm-accent-2">
    <text x="370" y="200" font-size="11.5" font-weight="700">priority on h(n)</text>
    <line x1="560" y1="196" x2="592" y2="196" stroke="currentColor" stroke-width="1.2" marker-end="url(#arw-w2-queue)"/>
    <text x="600" y="200" font-size="11.5">greedy best-first</text>
    <text x="370" y="240" font-size="11.5" font-weight="700">priority on g(n) + h(n)</text>
    <line x1="560" y1="236" x2="592" y2="236" stroke="currentColor" stroke-width="1.2" marker-end="url(#arw-w2-queue)"/>
    <text x="600" y="240" font-size="11.5">A*</text>
  </g>
  <text x="590" y="270" text-anchor="middle" font-size="10.5" class="dgm-muted">below the line: informed search, where h(n) estimates the distance to the goal</text>
</svg>
<figcaption><b>Five algorithms, one decision.</b> Swap the fringe and the same loop becomes a different algorithm with different guarantees. The two rows below the line add a heuristic — the subject of the next feature.</figcaption>
</figure>

That observation has a practical form: you can write one search implementation that
takes the queuing discipline as a parameter. The algorithms differ only in their
priority function, so their guarantees are properties of that function — which is
exactly how the next step, informed search, should be read.

## Summary

- Problem formulation means abstracting away real-world detail until the state space is
  small enough to explore. The abstraction usually matters more than the algorithm.
- The uninformed searches differ only in the order they explore the tree.
- Iterative deepening uses linear space and not much more time than the others, which
  is why it is the default when the solution depth is unknown.
- Uniform-cost search is optimal for arbitrary positive costs, but spreads blindly in
  every direction.

## Terms defined in one place

| Term | Definition |
|---|---|
| **Reflex agent** | Chooses actions from the current percept (and perhaps memory), without considering consequences |
| **Planning agent** | Simulates the consequences of candidate actions with a model and a goal test before acting |
| **Search problem** | States, actions, transition model, goal test, cost function |
| **Solution / plan** | A sequence of actions from the start state to a goal state |
| **State space** | All states reachable from the initial state by some action sequence |
| **World state vs. search state** | Every detail of the environment vs. only the details the problem needs |
| **State space graph** | Graph with one node per state and one arc per action; each state appears once |
| **Search tree** | Tree of plans rooted at the start state; a state can appear many times |
| **Fringe (frontier)** | Generated but not-yet-expanded nodes |
| **Expansion** | Removing a node from the fringe and generating its successors |
| **Branching factor b** | Number of successors per node |
| **Depth d (or s)** | Depth of the shallowest solution |
| **Maximum depth m** | Length of the longest path in the tree; may be infinite |
| **Complete** | Guaranteed to find a solution if one exists |
| **Optimal** | Guaranteed to find the least-cost solution |
| **Depth-first search** | Expands the deepest node; LIFO stack; linear memory |
| **Breadth-first search** | Expands the shallowest node; FIFO queue; optimal for unit costs |
| **Depth-limited search** | DFS that treats nodes at a given depth as leaves |
| **Iterative deepening** | Depth-limited search with limits 0, 1, 2, …; BFS's guarantees at DFS's memory |
| **Uniform-cost search** | Expands the lowest-g(n) node; priority queue; optimal for costs ≥ ε |
| **g(n)** | Path cost from the start to node n |
| **Closed set** | States already expanded, checked to avoid re-expansion; should be a hash set |

## What to interrogate, not just absorb

1. **The formulation is the solution.** The same Pac-Man board gives state spaces of
   120 and $120 \times 2^{30}$ depending on the question asked. When a search is
   intractable, the first suspect is the state representation, not the algorithm.
2. **"Optimal" is relative to the model.** UCS is provably optimal with respect to the
   cost function you wrote down. If driving time was the real objective and you
   modelled distance, the guarantee holds and the route is still wrong.
3. **Where does the goal test run?** Generation versus expansion changes BFS by a factor
   of $b$, and — as the next feature shows — it changes whether A* is optimal at all.
4. **Space or time?** The complexity tables make DFS and BFS look comparable in time.
   In practice the memory column decides which one you can actually run.
5. **Uninformed is a strong word.** None of these algorithms knows which direction the
   goal lies in. Any domain knowledge you have — even a rough estimate of the remaining
   distance — is going unused, and that is the opening for heuristics.
