---
course: applied-ai
lectureId: W4
title: "Charting the Solution Space: How AI Turns a Problem Into a Search"
deck: "Before a machine can solve anything it must first draw a map — this lecture traces the path from state-space search to constraint satisfaction and the recommenders they quietly power."
order: 4
readingTime: 7
tags: ["search", "state-space", "constraint-satisfaction", "recommenders", "problem-solving"]
concepts:
  - id: well-ill-structured
    term: "Well- vs Ill-Structured Problems"
    definition: "A well-structured problem has clearly defined states, operators, and goals (chess, route planning); an ill-structured one has fuzzy states and soft criteria (diagnosis, real-estate appraisal) that resist direct search."
  - id: state-space-model
    term: "State Space Model"
    definition: "A formulation that represents a problem as an initial state, operators that move between states, a goal test, and a path cost — turning problem-solving into a walk through a graph of states."
  - id: search-strategies
    term: "Search Strategies"
    definition: "Systematic procedures for exploring a state space, split into uninformed methods (breadth-first, depth-first, iterative deepening) that use no domain knowledge and informed methods (best-first, A*) guided by a heuristic."
  - id: constraint-satisfaction
    term: "Constraint Satisfaction Problem"
    definition: "A problem cast as variables with candidate values plus constraints they must jointly respect; a solution is any complete assignment that violates no constraint."
  - id: constraint-based-recommender
    term: "Constraint-Based Recommender"
    definition: "A knowledge-based recommender that encodes customer and product variables plus constraints, filter conditions, and product rules, then returns items satisfying the user's elicited requirements."
  - id: case-based-reasoning
    term: "Case-Based Reasoning"
    definition: "A problem-solving method that retrieves the most similar past problem–solution pair and adapts its solution to a new problem, forming the backbone of similarity-based recommenders."
---

For a computer, the hardest part of solving a problem is often recognizing that
it *has* one. A human real-estate agent glances at a block of houses and intuits
a price; a doctor hears a cluster of symptoms and begins forming a diagnosis. A
machine can do neither until someone has recast the situation into something it
can manipulate: states, moves, and a definition of success. This lecture is about
that translation — the unglamorous but decisive act of **problem formulation** —
and the two great families of technique it unlocks: search and constraint
satisfaction.

## When a Problem Is a Problem a Computer Can Solve

Not every problem yields to the same treatment. The lecture draws a sharp line
between **well-structured** and **ill-structured** problems. Chess is
well-structured: sixteen pieces, each with a precisely defined way to move, and an
unambiguous notion of winning. Planning a route from one address to another is
well-structured too — the roads, the rules, and the destination are all explicit.

Contrast that with a patient who arrives with vague symptoms, where tests may be
needed before a diagnosis can even be named, or a real-estate appraisal that leans
on nearby houses of differing size and features. These are **ill-structured**: the
states are fuzzy, the criteria are soft, and the values are anything but crisp. The
distinction matters because the machinery of search demands structure. If you
cannot say what a state is, how you move between states, and how you recognize the
goal, you cannot search.

## The State Space: Drawing the Map

The **state space model** is the formalism that supplies that structure. To use it,
four things must be nameable: the problem must be well-structured, you must be able
to recognize when it is solved (the **goal**), you must be able to characterize the
**states** of the solution space, and you must know the **operators** that move you
from one state to another.

Cast this way, a problem becomes a graph. Nodes are states; edges are legal moves.
The lecture is careful about vocabulary: a **graph** is a set of nodes connected by
edges in which several paths may converge on the same node, while a **tree** is the
special case in which exactly one path reaches each node, usually drawn hanging from
a root.

The classic illustration is the missionaries-and-cannibals puzzle, formulated in
four strokes:

- **Initial state** $(3,3,1)$ — three missionaries and three cannibals on the right
  bank, with the boat.
- **Operators** — the five legal boat-loads: two cannibals, two missionaries, one of
  each, a lone cannibal, or a lone missionary.
- **Goal test** — the state $(0,0,0)$, everyone safely across.
- **Path cost** — the number of river crossings.

With those four elements the puzzle is no longer a riddle; it is a graph waiting to
be traversed. That is the whole point of building the representation: it
communicates the initial state, the goal state, the allowable moves, and the path
cost in a form an algorithm can consume.

<figure>
<svg viewBox="0 0 820 290" role="img" aria-label="A state-space search tree: the initial state at the root branches through operators into successor states, and one path reaches a goal state.">
  <defs>
    <marker id="arw-ss" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" class="dgm-fill"/>
    </marker>
  </defs>
  <text x="410" y="16" text-anchor="middle" font-size="10" class="dgm-muted">initial state</text>
  <circle cx="410" cy="52" r="30" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="410" y="57" text-anchor="middle" font-size="13" font-weight="700">3,3,1</text>
  <line x1="410" y1="82" x2="158" y2="128" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-ss)"/>
  <line x1="410" y1="82" x2="410" y2="126" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-ss)"/>
  <line x1="410" y1="82" x2="662" y2="128" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-ss)"/>
  <text x="545" y="110" text-anchor="middle" font-size="10" class="dgm-muted">operators</text>
  <circle cx="150" cy="155" r="27" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="150" y="160" text-anchor="middle" font-size="12">3,2,0</text>
  <circle cx="410" cy="155" r="27" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="410" y="160" text-anchor="middle" font-size="12">3,1,0</text>
  <circle cx="670" cy="155" r="27" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="670" y="160" text-anchor="middle" font-size="12">2,2,0</text>
  <line x1="670" y1="182" x2="670" y2="230" stroke="currentColor" stroke-width="1.5" stroke-dasharray="5 5" marker-end="url(#arw-ss)"/>
  <text x="694" y="212" text-anchor="start" font-size="10" class="dgm-muted">many moves</text>
  <g class="dgm-accent">
    <circle cx="670" cy="258" r="27" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <text x="670" y="263" text-anchor="middle" font-size="13" font-weight="700">0,0,0</text>
  </g>
  <text x="588" y="262" text-anchor="end" font-size="10" class="dgm-muted">goal test</text>
</svg>
<figcaption><b>State-space search.</b> Each node is a state and each edge a legal operator; search walks this tree from the initial state until it reaches a state that passes the goal test.</figcaption>
</figure>

## Strategies for the Search

Once the map exists, the question becomes how to walk it. The lecture surveys two
families. **Uninformed** strategies explore blindly, using no knowledge beyond the
graph itself: breadth-first search, uniform-cost search, depth-first search,
depth-limited search, iterative deepening, and bidirectional search. They differ in
the order they expand nodes and in their appetite for memory, but none has any sense
of which direction is *promising*.

**Informed**, or heuristic, strategies do. Best-first search and **A\*** consult a
heuristic — an estimate of how far a state sits from the goal — to prioritize the
frontier. A\* famously combines the cost already paid with the cost still estimated,

$$
f(n) = g(n) + h(n),
$$

<figure>
<svg viewBox="0 0 780 180" role="img" aria-label="A-star evaluation: the cost g of n already paid from the start to node n, plus the heuristic estimate h of n of the remaining cost to the goal.">
  <defs>
    <marker id="arw-astar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" class="dgm-fill"/>
    </marker>
  </defs>
  <text x="390" y="28" text-anchor="middle" font-size="15">f(n) = g(n) + h(n)</text>
  <circle cx="80" cy="98" r="26" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="80" y="102" text-anchor="middle" font-size="12">start</text>
  <line x1="106" y1="98" x2="358" y2="98" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-astar)"/>
  <text x="233" y="84" text-anchor="middle" font-size="11">g(n): cost so far</text>
  <g class="dgm-accent">
    <circle cx="392" cy="98" r="28" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <text x="392" y="104" text-anchor="middle" font-size="16" font-weight="700">n</text>
  </g>
  <text x="392" y="150" text-anchor="middle" font-size="10" class="dgm-muted">frontier node</text>
  <line x1="420" y1="98" x2="672" y2="98" stroke="currentColor" stroke-width="1.5" stroke-dasharray="5 5" marker-end="url(#arw-astar)"/>
  <text x="546" y="84" text-anchor="middle" font-size="11" class="dgm-muted">h(n): estimate to goal</text>
  <circle cx="710" cy="98" r="28" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <circle cx="710" cy="98" r="21" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="710" y="102" text-anchor="middle" font-size="11">goal</text>
</svg>
<figcaption><b>Informed search.</b> A* ranks each frontier node n by f(n) = g(n) + h(n): the exact cost already paid plus a heuristic estimate of the cost still to come.</figcaption>
</figure>

where $g(n)$ is the path cost from the start to node $n$ and $h(n)$ is the heuristic
estimate of the remaining distance. Hill-climbing and simulated annealing round out
the family, trading completeness for speed by following the local gradient of an
evaluation function. The three-step recipe the lecture prescribes is disarmingly
simple: **formulate** the problem with the state space model, **define** the search
space, then **select** an algorithm to find the solution.

## When Operators Give Way to Constraints

Search treats problem-solving as a sequence of *moves*. But many real problems are
better described not by moves but by *conditions that must hold*. This is the leap to
the **constraint satisfaction problem** (CSP). Instead of operators that transform a
state, a CSP has variables that take on values, and the states are simply assignments
to those variables. Formally a CSP is a triple $\langle X, D, C \rangle$: variables
$X$, their candidate domains $D$, and constraints $C$ that any valid assignment must
respect.

The general algorithm the lecture lays out is a loop of assign-and-check: start from
initial (or random) values, expand the set of possible values, let the variables
change, and test whether the current assignment is **consistent** — does it violate
any constraint? If not, continue; then test whether it is **complete** — are all
variables assigned consistently? When an assignment is both consistent and complete,
the goal is reached. The solver is not looking for a shortest path; it is looking for
any set of values that offends no constraint.

<figure>
<svg viewBox="0 0 760 220" role="img" aria-label="A constraint-satisfaction loop: assign values, test consistency, test completeness, and either return a solution or revise the assignment and recheck.">
  <defs>
    <marker id="arw-csp" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" class="dgm-fill"/>
    </marker>
  </defs>
  <rect x="18" y="40" width="150" height="58" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="93" y="65" text-anchor="middle" font-size="12">Assign /</text>
  <text x="93" y="83" text-anchor="middle" font-size="12">change values</text>
  <rect x="232" y="40" width="140" height="58" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="302" y="74" text-anchor="middle" font-size="13">Consistent?</text>
  <rect x="430" y="40" width="140" height="58" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="500" y="74" text-anchor="middle" font-size="13">Complete?</text>
  <g class="dgm-accent">
    <rect x="628" y="40" width="115" height="58" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <text x="685" y="74" text-anchor="middle" font-size="13" font-weight="700">Solution</text>
  </g>
  <line x1="168" y1="69" x2="230" y2="69" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-csp)"/>
  <line x1="372" y1="69" x2="428" y2="69" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-csp)"/>
  <text x="400" y="60" text-anchor="middle" font-size="10" class="dgm-muted">yes</text>
  <line x1="570" y1="69" x2="626" y2="69" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-csp)"/>
  <text x="598" y="60" text-anchor="middle" font-size="10" class="dgm-muted">yes</text>
  <path d="M302,98 L302,160 L108,160 L108,98" fill="none" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-csp)"/>
  <text x="316" y="120" text-anchor="start" font-size="10" class="dgm-muted">no</text>
  <path d="M500,98 L500,195 L78,195 L78,98" fill="none" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-csp)"/>
  <text x="514" y="120" text-anchor="start" font-size="10" class="dgm-muted">no</text>
  <text x="300" y="188" text-anchor="middle" font-size="10" class="dgm-muted">not yet &#8212; revise &amp; recheck</text>
</svg>
<figcaption><b>Constraint satisfaction.</b> A solver assigns values and tests consistency, then completeness, revising until the assignment breaks no constraint and covers every variable.</figcaption>
</figure>

## Recommenders That Reason

Where this becomes tangible is in **knowledge-based recommenders**, and specifically
the **constraint-based recommender**. Here the knowledge base is built from two sets
of variables and three sets of constraints. The variables describe the **customer**
(level of expertise as expert, average, or beginner; willingness to take risk as low,
medium, or high) and the **product** (its name, its risk level, its investment
horizon). The constraints come in three flavors: hard **constraints** that couple
customer and product ("if the customer's risk tolerance is high, the duration cannot
be short-term"), **filter conditions** that translate customer needs into product
queries ("if the duration is long-term, the minimum investment period is at least
six"), and **product constraints** that govern products internally ("if the product
is a savings account, the expected return rate is fixed").

This is the same reasoning as a CSP, dressed for commerce. Its cousin is **case-based
reasoning**, which the lecture frames as the recommender's other engine: rather than
reason from constraints, retrieve the most similar past problem and adapt its stored
solution — matching a new buyer to the item whose features best fit their
preferences. The lecture is candid about the trade-offs. Constraints are easy to
elicit in dialogue, transparent, and naturally explainable, and a feasible
recommendation can always be considered correct. But the knowledge is expensive to
acquire and maintain, multiple feasible solutions may demand a second method to break
ties, and people's cognitive attributes remain stubbornly hard to capture. Those
tensions — cold-start, data sparsity, scalability, diversity, privacy, and
explainability — are the standing challenges of every recommender system.

## Why It Matters

It is tempting to think of modern AI as a story of ever-larger neural networks, but
this lecture is a reminder that the field's oldest idea still runs underneath
everything: to solve a problem, first represent it. State-space search and constraint
satisfaction are not relics. They are the reasoning layer that turns a vague human
want — a safe investment, a movie for tonight, a viable configuration — into
something a machine can systematically explore. Long before a system can recommend,
diagnose, or plan, someone has to draw the map. Everything else is a walk across it.
