---
course: ai-foundations
lectureId: W3
title: "Knowing Which Way Is Warmer: Heuristics and A*"
deck: "Uniform-cost search is optimal and blind. Give it an estimate of the distance remaining and it becomes A* — still optimal, far faster, and dependent on two properties of that estimate that are easy to state, easy to violate, and decide whether the answer is right."
order: 3
readingTime: 14
tags: ["search", "heuristics", "a-star", "admissibility", "consistency", "greedy-search"]
concepts:
  - id: heuristic
    term: Heuristic Function h(n)
    definition: "An estimate of the cost from state n to the nearest goal. It must be cheap to compute — an exact heuristic would require solving the problem — and its quality decides how much of the state space the search has to explore."
  - id: greedy-best-first
    term: Greedy Best-First Search
    definition: "Expands the node with the lowest h(n), ignoring the cost already paid. Often fast, but incomplete in infinite spaces (it can loop), O(b^m) in time and space, and not optimal — it heads straight for whatever looks closest."
  - id: a-star
    term: A* Search
    definition: "Expands the node with the lowest f(n) = g(n) + h(n): cost so far plus estimated cost to go. With an admissible heuristic it returns an optimal solution, and among algorithms using the same heuristic it expands the fewest nodes."
  - id: admissible
    term: Admissible Heuristic
    definition: "A heuristic that never overestimates: 0 ≤ h(n) ≤ h*(n) for every n, where h*(n) is the true cost to the nearest goal. Admissibility is what makes A* tree search optimal."
  - id: consistent
    term: Consistent Heuristic
    definition: "A heuristic satisfying h(n) ≤ c(n, a, n′) + h(n′) for every action — a triangle inequality. It makes f nondecreasing along every path, implies admissibility, and lets A* graph search expand each state once and still be optimal."
  - id: dequeue-goal-test
    term: Test the Goal on Removal
    definition: "A* must stop when a goal is taken off the priority queue, not when it is first put on. A goal can be enqueued via an expensive path before the cheap path to it has been explored."
  - id: relaxed-problem
    term: Heuristics from Relaxed Problems
    definition: "Remove constraints from a problem and the exact cost of the easier problem is an admissible heuristic for the original, because every real solution is also a solution to the relaxation. Misplaced tiles and Manhattan distance both come from relaxing the 8-puzzle."
  - id: dominance
    term: Heuristic Dominance
    definition: "If h₂(n) ≥ h₁(n) for all n and both are admissible, h₂ dominates h₁ and A* using it expands no more nodes. The pointwise maximum of admissible heuristics is admissible and dominates each of them."
  - id: graph-search
    term: Graph Search and Reopening
    definition: "Search that never expands the same state twice, using a closed set. With an admissible but inconsistent heuristic it can lock in a suboptimal path to a state; reopening closed states when a cheaper path appears restores optimality."
---

Uniform-cost search has every property you could ask of an uninformed algorithm: it is
complete, it is optimal, and it explores nothing more expensive than the answer. Its
one weakness is that it is blind. It spreads out evenly from the start, as willing to
explore away from the goal as toward it, because nothing tells it which direction the
goal is in. This feature adds that one missing piece — an estimate of how far is left
— and follows the consequences: an algorithm that is greedy and fast, then one that is
fast *and* optimal, and then the two properties of the estimate that decide whether
"optimal" is actually true.

**Sources:** AIMA Chapter 3 (Sections 3.5–3.6)

## 1. Recap, and a problem to carry through

A search problem has states, actions with costs, a successor function, a start state,
and a goal test. A search algorithm systematically builds a tree of plans and
**chooses an ordering of the fringe** — and every uninformed algorithm differs only in
that ordering:

| Fringe ordered by | Algorithm |
|---|---|
| Last in, first out | Depth-first search |
| First in, first out | Breadth-first search |
| Path cost $g(n)$ | Uniform-cost search |
| Increasing depth limits over DFS | Iterative deepening (usually the best uninformed choice) |

A useful running example is the **pancake problem**: a stack of pancakes of different
sizes must be sorted, largest at the bottom, using a spatula that flips the top $k$
pancakes over in one move. The cost of a move is the number of pancakes flipped. On the
8-puzzle the contrast is just as plain: breadth-first and depth-first search both
generate tier upon tier of boards before reaching a goal three moves away, because
neither knows which of the four possible moves is pointed the right way.

## 2. Informed search

**Informed search** is the family of strategies that explore the state space using
knowledge about the problem — specifically a **heuristic**: for each state, an
**estimate of the cost to reach the nearest goal**.

The motivating picture is a robot on a grid. Told only that it has four possible
moves, it has no reason to prefer any of them. Told what its coordinates *mean* — where
it is, and where the goal is — it would obviously try first the move that points
toward the goal. If we have information about the problem, we should exploit it.

### What a heuristic is

Represent that information as an **evaluation function** $h$: given a state $s$,
$h(s)$ estimates how far $s$ is from the goal. For a robot moving on a grid, two
standard choices:

- **Euclidean distance** — the straight line, $\sqrt{\Delta x^2 + \Delta y^2}$.
- **Manhattan distance** — $|\Delta x| + |\Delta y|$, the distance when movement is
  restricted to the four compass directions.

From a cell 3 across and 1 up from the goal, the Euclidean estimate is $\sqrt{10} \approx 3.16$
and the Manhattan estimate is $4$.

A heuristic **must be computationally cheap**. The most accurate possible heuristic
is the true remaining cost, and computing that means solving the problem — so a
heuristic is always a trade between how much it costs to evaluate and how much
search it saves. Finding a good one makes an enormous difference in running time; it
is usually the difference between a search that finishes and one that does not.

For the pancake problem, a natural heuristic is **the size of the largest pancake still
out of place**. It is a better estimate than it looks: every pancake larger than that
one is already in place at the bottom, so its correct position is $k$-th from the top,
where $k$ is its size — and the final flip that puts it there must flip at least $k$
pancakes. The heuristic can never exceed the true remaining cost, which is the property
§5 shows we need.

## 3. Greedy best-first search

The simplest use of a heuristic: **always expand the node that looks closest to the
goal** — the one with the lowest $h(n)$. Implementations keep an **OPEN** list of nodes
awaiting expansion and a **CLOSED** list of those already expanded, so the search
space is treated as a graph rather than a tree.

In the common case greedy search is fast: it dives straight at the goal. In a bad case
it dives straight at the **wrong** goal, or into a dead end that merely *looks*
promising. Its worst case is a badly guided depth-first search.

| Property | Greedy best-first search |
|---|---|
| Complete? | **No.** It can loop. On the Romania map, travelling from Iasi to Fagaras by straight-line distance, Neamt looks closer to the goal than Vaslui — but Neamt is a dead end, so a tree search returns to Iasi, where Neamt again looks best, forever. **Complete in finite spaces with repeated-state checking** |
| Time | $O(b^m)$ — though a good heuristic usually does dramatically better |
| Space | $O(b^m)$ — it keeps every node in memory |
| Optimal? | **No** |

The reason it is not optimal is the important part: greedy search **ignores the cost
already paid**. It ranks a node by how close it seems, not by how expensive it was to
get there, so it can happily follow a long, costly path because each step looked like
progress.

## 4. A*: cost so far plus cost to go

**A\*** expands the node with the lowest

$$f(n) = g(n) + h(n)$$

where $g(n)$ is the **actual cost** from the start to $n$ and $h(n)$ is the
**estimated cost** from $n$ to the goal. So $f(n)$ estimates the cost of the cheapest
solution that passes through $n$.

The comparison with the other two is clean. Uniform-cost search orders by $g$ alone
— backward cost only. Greedy search orders by $h$ alone — forward estimate only. A*
combines the cost already paid with the estimated cost still to come, which is why it
gets both UCS's guarantees and greedy's direction. Like greedy search, it is
implemented with OPEN and CLOSED lists.

On a grid with the Manhattan heuristic, A* assigns each node an estimated total cost —
the start node is $g = 0, h = 3, f = 3$ — and always expands the lowest $f$ on OPEN.
Nodes pointing toward the goal keep $f$ low and get expanded; nodes pointing away
accumulate $g$ without reducing $h$, their $f$ rises, and they sit on OPEN unexpanded.

The 8-puzzle shows the same thing at small scale. From

```text
1 2 5        _ 1 2
3 4 _   →    3 4 5
6 7 8        6 7 8
```

with $h$ = the number of tiles out of place, the start has $h = 3$ (tiles 1, 2 and 5).
Moving the blank up puts the 5 in place ($g = 1, h = 2, f = 3$); moving it left puts
the 2 in place ($f = 2 + 1 = 3$); moving it left again reaches the goal ($f = 3 + 0 = 3$).
Every move off that path raises $f$ to at least 4, so A* walks the three-move solution
almost without detour — where breadth-first search generates every board within three
moves of the start.

### When to stop

**A\* must stop when it removes a goal from the queue, not when it first adds one.**

Take a start $S$ ($h = 3$) with two routes to the goal $G$: through $A$ (step costs 2
and 2, $h(A) = 2$) and through $B$ (step costs 2 and 3, $h(B) = 1$). A* first expands
$S$, putting $A$ ($f = 4$) and $B$ ($f = 3$) on the queue. It expands $B$, which puts $G$
on the queue at cost 5. Stopping there would return 5. Continuing, A* expands $A$
($f = 4$), which puts $G$ on the queue again at cost 4, and that is the copy that comes
off first. The optimal path is only guaranteed once a goal is the *cheapest thing left*.

## 5. Is A* optimal? Admissibility

Not automatically. Take $S$ with a direct arc to $G$ costing 5, and a route through
$A$ costing $1 + 3 = 4$. Set $h(S) = 7$, $h(A) = 6$, $h(G) = 0$. A* expands $S$, giving
$A$ an $f$ of $1 + 6 = 7$ and $G$ an $f$ of $5 + 0 = 5$. It removes $G$ first and returns
cost 5, missing the cost-4 route.

What went wrong is that the heuristic **overestimated**: it claimed $A$ was 6 from the
goal when it was really 3, so the good path looked worse than the bad one. The cure is
to require estimates that are never too high.

A heuristic is **admissible** if, for every node,

$$0 \le h(n) \le h^*(n)$$

where $h^*(n)$ is the true cost of the cheapest path from $n$ to a goal. An admissible
heuristic is **optimistic** — it underestimates the remaining cost, or gets it exactly
right.

**With an admissible heuristic, A\* tree search is optimal.** The proof sketch: suppose
a suboptimal goal $G_2$ is about to be removed while some node $n$ on the optimal path
is still on the queue. Admissibility gives $f(n) = g(n) + h(n) \le g(n) + h^*(n) = C^*$,
the optimal cost. But $f(G_2) = g(G_2) > C^*$ because $G_2$ is suboptimal and $h(G_2) = 0$.
So $f(n) < f(G_2)$, and $n$ would have been removed first. By induction, every node on
the optimal path comes off before $G_2$ can.

Coming up with admissible heuristics is most of what is involved in using A* in
practice.

### The intuition

The heuristic **biases the search toward the goal**. Uniform-cost search and BFS have
no bias: their frontier expands in rings around the start. A* pulls those rings out
toward the goal, so it explores a narrow band rather than a disc.

<figure>
<svg viewBox="0 0 840 270" role="img" aria-label="Two panels with a start and a goal. On the left, uniform-cost search expands in concentric circles centred on the start, covering as much area behind the start as toward the goal. On the right, A star expands in ellipses stretched from the start toward the goal, covering a narrow band.">
  <text x="210" y="24" text-anchor="middle" font-size="12" font-weight="700">UNIFORM-COST · no bias</text>
  <circle cx="110" cy="140" r="35" fill="none" stroke="currentColor" stroke-width="1.3" class="dgm-muted"/>
  <circle cx="110" cy="140" r="70" fill="none" stroke="currentColor" stroke-width="1.3" class="dgm-muted"/>
  <circle cx="110" cy="140" r="105" fill="none" stroke="currentColor" stroke-width="1.3" class="dgm-muted"/>
  <circle cx="110" cy="140" r="6" class="dgm-fill"/>
  <text x="110" y="128" text-anchor="middle" font-size="10.5" font-weight="700">start</text>
  <g class="dgm-accent">
    <circle cx="330" cy="140" r="7" class="dgm-fill"/>
    <text x="330" y="126" text-anchor="middle" font-size="10.5" font-weight="700">goal</text>
  </g>
  <text x="210" y="262" text-anchor="middle" font-size="10.5" class="dgm-muted">rings of equal g(n): half the effort faces away from the goal</text>
  <line x1="420" y1="34" x2="420" y2="246" stroke="currentColor" stroke-width="1" stroke-dasharray="4 4" class="dgm-muted"/>
  <text x="630" y="24" text-anchor="middle" font-size="12" font-weight="700">A* · biased toward the goal</text>
  <g class="dgm-accent-2">
    <ellipse cx="548" cy="140" rx="46" ry="30" fill="none" stroke="currentColor" stroke-width="1.3"/>
    <ellipse cx="592" cy="140" rx="92" ry="42" fill="none" stroke="currentColor" stroke-width="1.3"/>
    <ellipse cx="636" cy="140" rx="128" ry="52" fill="none" stroke="currentColor" stroke-width="1.3"/>
  </g>
  <circle cx="520" cy="140" r="6" class="dgm-fill"/>
  <line x1="520" y1="148" x2="520" y2="204" stroke="currentColor" stroke-width="1" stroke-dasharray="3 3" class="dgm-muted"/>
  <text x="520" y="218" text-anchor="middle" font-size="10.5" font-weight="700">start</text>
  <g class="dgm-accent">
    <circle cx="740" cy="140" r="7" class="dgm-fill"/>
    <text x="740" y="126" text-anchor="middle" font-size="10.5" font-weight="700">goal</text>
  </g>
  <text x="630" y="262" text-anchor="middle" font-size="10.5" class="dgm-muted">contours of equal f = g + h: stretched along the line to the goal</text>
</svg>
<figcaption><b>The same search, with and without a sense of direction.</b> UCS is A* with h = 0. The better the heuristic, the more the contours elongate toward the goal — and a perfect heuristic would expand only the optimal path.</figcaption>
</figure>

## 6. Consistency, and why graph search needs it

Real implementations do not expand the same state twice — they keep a **closed set**
and skip any state already expanded. That is **graph search**, and it saves an
enormous amount of work. It also introduces a trap: a closed state is never revisited,
so if graph search reaches a state by an expensive path first, it locks that path in
— even if a cheaper one turns up later.

With a merely admissible heuristic, that can happen:

<figure>
<svg viewBox="0 0 840 300" role="img" aria-label="A state space graph: S connects to A and B at cost 1 each; A connects to C at cost 1; B connects to C at cost 2; C connects to G at cost 3. Heuristic values: S 2, A 4, B 1, C 1, G 0. Beside it, the order A star graph search expands nodes: S, then B, then C via B at cost 3, which closes C; when A is expanded later, its cheaper path to C is discarded, and the search returns G at cost 6 instead of the optimal 5.">
  <defs>
    <marker id="arw-w3-gone" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" class="dgm-fill"/>
    </marker>
  </defs>
  <text x="190" y="24" text-anchor="middle" font-size="12" font-weight="700">GRAPH (h shown in each state)</text>
  <circle cx="60" cy="150" r="22" fill="none" stroke="currentColor" stroke-width="1.6"/>
  <text x="60" y="148" text-anchor="middle" font-size="12" font-weight="700">S</text>
  <text x="60" y="163" text-anchor="middle" font-size="9.5" class="dgm-muted">h=2</text>
  <g class="dgm-accent">
    <circle cx="170" cy="80" r="22" class="dgm-soft" stroke="currentColor" stroke-width="1.8"/>
    <text x="170" y="78" text-anchor="middle" font-size="12" font-weight="700">A</text>
    <text x="170" y="93" text-anchor="middle" font-size="9.5" font-weight="700">h=4</text>
  </g>
  <circle cx="170" cy="220" r="22" fill="none" stroke="currentColor" stroke-width="1.6"/>
  <text x="170" y="218" text-anchor="middle" font-size="12" font-weight="700">B</text>
  <text x="170" y="233" text-anchor="middle" font-size="9.5" class="dgm-muted">h=1</text>
  <circle cx="270" cy="150" r="22" fill="none" stroke="currentColor" stroke-width="1.6"/>
  <text x="270" y="148" text-anchor="middle" font-size="12" font-weight="700">C</text>
  <text x="270" y="163" text-anchor="middle" font-size="9.5" class="dgm-muted">h=1</text>
  <circle cx="350" cy="250" r="22" fill="none" stroke="currentColor" stroke-width="1.6"/>
  <text x="350" y="248" text-anchor="middle" font-size="12" font-weight="700">G</text>
  <text x="350" y="263" text-anchor="middle" font-size="9.5" class="dgm-muted">h=0</text>
  <line x1="79" y1="139" x2="150" y2="94" stroke="currentColor" stroke-width="1.4" marker-end="url(#arw-w3-gone)"/>
  <text x="103" y="108" text-anchor="middle" font-size="10.5">1</text>
  <line x1="79" y1="161" x2="150" y2="206" stroke="currentColor" stroke-width="1.4" marker-end="url(#arw-w3-gone)"/>
  <text x="103" y="198" text-anchor="middle" font-size="10.5">1</text>
  <line x1="189" y1="92" x2="251" y2="136" stroke="currentColor" stroke-width="1.4" marker-end="url(#arw-w3-gone)"/>
  <text x="228" y="105" text-anchor="middle" font-size="10.5">1</text>
  <line x1="189" y1="208" x2="251" y2="164" stroke="currentColor" stroke-width="1.4" marker-end="url(#arw-w3-gone)"/>
  <text x="228" y="200" text-anchor="middle" font-size="10.5">2</text>
  <line x1="283" y1="168" x2="337" y2="231" stroke="currentColor" stroke-width="1.4" marker-end="url(#arw-w3-gone)"/>
  <text x="322" y="192" text-anchor="middle" font-size="10.5">3</text>
  <text x="190" y="290" text-anchor="middle" font-size="10.5" class="dgm-muted">optimal path S→A→C→G costs 5</text>
  <line x1="410" y1="34" x2="410" y2="276" stroke="currentColor" stroke-width="1" stroke-dasharray="4 4" class="dgm-muted"/>
  <text x="625" y="24" text-anchor="middle" font-size="12" font-weight="700">A* GRAPH SEARCH, IN ORDER</text>
  <text x="440" y="60" font-size="11.5">1. expand S (0 + 2)</text>
  <text x="440" y="86" font-size="11.5">2. expand B (1 + 1) — cheapest f on the queue</text>
  <text x="440" y="112" font-size="11.5">3. expand C via B (3 + 1) — <tspan font-weight="700">C is now closed</tspan></text>
  <g class="dgm-accent">
    <text x="440" y="138" font-size="11.5" font-weight="700">4. expand A (1 + 4): C via A costs only 2 —</text>
    <text x="458" y="156" font-size="11.5" font-weight="700">but C is closed, so it is skipped</text>
  </g>
  <text x="440" y="182" font-size="11.5">5. remove G (6 + 0) and return it</text>
  <g class="dgm-accent">
    <rect x="436" y="200" width="380" height="58" class="dgm-soft" stroke="currentColor" stroke-width="1.6"/>
    <text x="626" y="223" text-anchor="middle" font-size="11.5" font-weight="700">returns cost 6, not 5</text>
    <text x="626" y="243" text-anchor="middle" font-size="10.5">h(A) = 4 &gt; cost(A→C) + h(C) = 2: admissible, not consistent</text>
  </g>
</svg>
<figcaption><b>A* graph search gone wrong.</b> Every estimate is admissible — h(A) = 4 is exactly A's true distance — but the drop from 4 to 1 across a cost-1 arc makes A look worse than it is at the moment C is first reached. The cheap path to C arrives too late.</figcaption>
</figure>

The repair is a stronger condition. A heuristic is **consistent** (or monotone) if for
every node $n$ and every successor $n'$ reached by action $a$,

$$h(n) \le c(n, a, n') + h(n')$$

— a triangle inequality: the estimate from $n$ can be no more than the cost of one step
plus the estimate from where that step lands. In the example, $h(A) = 4$ but
$c(A, C) + h(C) = 2$, so the heuristic is admissible but not consistent.

Consistency makes $f$ **nondecreasing along every path**:

$$f(n') = g(n') + h(n') = g(n) + c(n, a, n') + h(n') \ge g(n) + h(n) = f(n)$$

So the first time A* expands any state, it has already found the cheapest path to it,
and closing it is safe. Three consequences, stated precisely because they are often
blurred together:

- **Consistent ⇒ admissible** (for any heuristic with $h = 0$ at goals). The converse
  fails, as the example shows.
- **Admissible** is enough for **tree search** to be optimal, and for graph search too if
  it **reopens** a closed state whenever a cheaper path to it is found.
- **Consistent** lets **graph search without reopening** be optimal, and guarantees each
  state is expanded at most once — which is where most of the efficiency comes from.

Most admissible heuristics that arise naturally, including the ones in the next section,
are also consistent. Reopening is the safety net for the ones that are not.

## 7. Designing heuristics

### Relax the problem

The most reliable source of admissible heuristics is the **relaxed problem**: remove
constraints so that new actions become available, then use the exact cost of solving
the easier problem. Every solution to the original problem is also a solution to the
relaxation, so the relaxed cost can never exceed the real one — admissibility comes
free. And because exact relaxed costs obey the triangle inequality, they are
consistent too.

**Wolf (or fox), goat, cabbage**, with cost = number of boat trips:

- **Heuristic 1:** the number of items still on the left bank. Each trip carries at most
  one item across, so at least that many trips are needed.
- **Heuristic 2:** sharpen it. With $k$ items on the left and the boat on the left, every
  crossing to the right carries at most one item, and between any two such crossings the
  boat must come back — so at least $2k - 1$ trips. If the boat is on the right with
  items still on the left, one more trip is needed to fetch it: $2k$. (At the goal,
  $k = 0$, the estimate should be 0.)

Both relax away the real difficulty — the rule about what can be left alone together —
and that is exactly why both are guaranteed never to overestimate.

**The 8-puzzle**, with cost = number of moves:

- **Heuristic 1: misplaced tiles.** Relax "a tile moves to an adjacent blank square" to
  "a tile can jump anywhere". Then each misplaced tile needs exactly one move.
- **Heuristic 2: total Manhattan distance** of each tile from its target square. Relax it
  to "a tile can move to any adjacent square, occupied or not". Then each tile needs
  exactly its Manhattan distance in moves.

### Dominance

If $h_2(n) \ge h_1(n)$ for every $n$, and both are admissible, $h_2$ **dominates** $h_1$
and is better for search: A* with $h_2$ never expands more nodes. Manhattan distance
dominates misplaced tiles — every misplaced tile is at least one square from home, and
usually more.

Given any admissible heuristics $h_a$ and $h_b$, their pointwise maximum

$$h(n) = \max\big(h_a(n),\, h_b(n)\big)$$

is also admissible, and dominates both. So there is never a reason to choose between
two admissible heuristics when you can afford to compute both.

### When to break the rules

**Inadmissible heuristics are often useful too.** Overestimating by a controlled
amount makes the search far more aggressive. Weighted A*, which orders by
$g(n) + w \cdot h(n)$ with $w > 1$, is guaranteed to return a solution costing at most
$w$ times the optimum, and is frequently orders of magnitude faster. Large-scale route
planners routinely make this trade: a route within a few percent of optimal, delivered
instantly, beats an optimal route delivered late.

## 8. A* as code

The textbook loop, with the details that are easy to get wrong made explicit:

```python
def a_star(start, is_goal, successors, h):
    g = {start: 0}                       # best known cost to reach each state
    parent = {start: None}
    frontier = [(h(start), start)]       # priority queue ordered by f = g + h
    closed = set()
    while frontier:
        f, state = heappop(frontier)
        if state in closed:              # stale entry: a cheaper copy was already expanded
            continue
        if is_goal(state):               # goal test on REMOVAL, not insertion
            return path_to(state, parent), g[state]
        closed.add(state)
        for child, step_cost in successors(state):
            new_g = g[state] + step_cost
            if new_g < g.get(child, float("inf")):
                g[child] = new_g         # cheaper path found: record it
                parent[child] = state
                closed.discard(child)    # reopen — only ever triggers if h is inconsistent
                heappush(frontier, (new_g + h(child), child))
    return None
```

It differs from breadth-first search in exactly three places: the fringe is a priority
queue on $f$ rather than a FIFO queue; each node carries a cost $g$, accumulated from
real step costs; and a child already seen is not simply skipped — if the new path to it
is cheaper, its record is updated. Simplified versions that skip every child already on
OPEN or CLOSED, or that add 1 per step regardless of the actual cost, are correct only
for unit costs and consistent heuristics.

## 9. Where A* is used

A* turns up wherever a problem can be phrased as finding a cheapest path through a
graph too large to enumerate:

- **Video games** — unit pathfinding, the canonical application; game agents also run A*
  over abstract planning states, not just maps.
- **Routing** — road, rail, network packets.
- **Resource planning** and scheduling.
- **Robot motion planning**, in discretized configuration spaces.
- **Language** — parsing, machine translation, and speech recognition, where decoders
  search for the most probable sequence of words and A*-style best-first search with an
  admissible estimate of the remaining cost is a standard technique.

## Summary

- A* combines backward cost $g$ and an estimate of forward cost $h$, and expands the
  lowest $f = g + h$.
- It is optimal with an **admissible** heuristic for tree search, and with a
  **consistent** one for graph search without reopening.
- Stop on **removing** a goal from the queue, never on adding one.
- Heuristic design is the real work, and relaxed problems are the standard tool.

## Terms defined in one place

| Term | Definition |
|---|---|
| **Informed search** | Search that uses problem-specific knowledge, in the form of a heuristic, to order the fringe |
| **Heuristic h(n)** | Estimated cost from n to the nearest goal; must be cheap to compute |
| **h\*(n)** | The true cost of the cheapest path from n to a goal |
| **Euclidean distance** | Straight-line distance; admissible for movement in any direction |
| **Manhattan distance** | Sum of horizontal and vertical offsets; admissible for four-way grid movement |
| **Greedy best-first search** | Expands the lowest h(n); fast, incomplete, not optimal |
| **A\*** | Expands the lowest f(n) = g(n) + h(n) |
| **f(n)** | Estimated cost of the cheapest solution through n |
| **OPEN / CLOSED** | Nodes awaiting expansion / states already expanded |
| **Admissible** | Never overestimates: 0 ≤ h(n) ≤ h\*(n) |
| **Consistent (monotone)** | h(n) ≤ c(n, a, n′) + h(n′) for every action; implies admissible |
| **Reopening** | Returning a closed state to OPEN when a cheaper path to it is found |
| **Relaxed problem** | The original problem with constraints removed; its exact cost is an admissible heuristic |
| **Dominance** | h₂ ≥ h₁ everywhere, both admissible; h₂ expands no more nodes |
| **Weighted A\*** | Orders by g + w·h with w > 1; at most w times the optimal cost |

## What to interrogate, not just absorb

1. **Admissible is not the same as good.** $h = 0$ is admissible — it turns A* back into
   uniform-cost search. The guarantee is about correctness; speed comes from how close
   $h$ gets to $h^*$ without crossing it.
2. **Where is the heuristic's cost?** A heuristic that halves the nodes expanded but
   takes ten times as long to evaluate makes the search slower. Measure time, not node
   counts.
3. **Consistency failures hide.** The cost-6 answer in §6 comes from a heuristic that
   is admissible everywhere. A test suite that only checks admissibility will not catch
   it — check the triangle inequality on every arc, or reopen.
4. **Optimal or good enough?** Production systems often discard the optimality
   guarantee on purpose. Ask what bound on suboptimality you actually need before
   paying for a guarantee you do not.
5. **The memory column still applies.** A* keeps every generated node, so on hard
   problems it runs out of memory long before time — the motivation for memory-bounded
   variants such as IDA\*, which applies iterative deepening to the $f$ value.
