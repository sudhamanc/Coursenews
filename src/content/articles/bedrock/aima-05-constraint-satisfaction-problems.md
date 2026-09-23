---
course: bedrock
lectureId: AIMA 5
book: "Artificial Intelligence: A Modern Approach"
part: "II · Problem-solving"
title: "The Payoff for Admitting What a State Is Made Of"
deck: "Chapter 5 cracks open the atomic state of Chapter 3 into variables and values, and collects the dividend: a solver can now prove a branch is doomed before exploring it, recognize that a problem decomposes, and exploit structure a path-finder could not see."
order: 5
chapter: 5
readingTime: 13
tags: ["csp", "constraint-propagation", "arc-consistency", "backtracking", "tree-width"]
concepts:
  - id: csp-definition
    term: The CSP Formulation
    definition: "A set of variables X, a domain of allowed values for each, and constraints specifying allowable combinations. A state is a partial assignment; a solution is a complete, consistent one. The goal test is decomposed into constraints rather than being a black box."
  - id: consistency-levels
    term: Node, Arc, Path, and k-Consistency
    definition: "A hierarchy of local consistency guarantees. Arc consistency — for every value of X there exists a compatible value of Y for each constraint — is the workhorse, enforced by AC-3 in O(cd³) time."
  - id: ac3
    term: Constraint Propagation
    definition: "Inference that uses constraints to shrink domains before or during search. Propagation can solve a problem outright, prove it unsolvable, or merely reduce branching — and every value it eliminates is a subtree search never enters."
  - id: backtracking-heuristics
    term: The Ordering Heuristics
    definition: "Minimum-remaining-values (choose the most constrained variable, failing fast), degree heuristic as a tie-break, and least-constraining-value (choose the value ruling out fewest options for neighbors, since only one value need succeed)."
  - id: forward-checking-mac
    term: Forward Checking and MAC
    definition: "Forward checking prunes the domains of neighbors of a just-assigned variable; maintaining arc consistency runs full propagation from that variable after each assignment, detecting failures earlier at greater cost per node."
  - id: backjumping
    term: Conflict-Directed Backjumping
    definition: "On failure, jump to the most recent variable in the conflict set rather than chronologically backtracking, and propagate conflict sets so that the search learns which combinations are jointly impossible — the ancestor of clause learning in SAT solvers."
  - id: min-conflicts
    term: Min-Conflicts Local Search
    definition: "Repair-based search: start with a complete assignment, repeatedly reassign a conflicted variable to the value minimizing conflicts. Remarkably effective on large, loosely constrained problems and nearly independent of problem size for n-queens."
  - id: problem-structure
    term: Structure and Tree Width
    definition: "Independent subproblems can be solved separately; tree-structured CSPs are solvable in O(nd²) by directional arc consistency on a topological order. Cutset conditioning and tree decomposition extend this, with cost exponential in the tree width."
---

Chapter 3 treated a state as an atom: two states are identical or they are not,
and there is nothing further to say about one. Chapter 5 is the demonstration of
how much that costs. If a state is instead a set of **variables** with assigned
**values**, subject to **constraints**, then a solver can do something a
path-finder fundamentally cannot — look at a partial assignment and *prove* that
no completion of it can work, before generating a single successor.

## The Formulation

A constraint satisfaction problem consists of variables $X_1, \ldots, X_n$, a
**domain** $D_i$ of permitted values for each, and constraints, each specifying a
scope of variables and a relation on their allowable combinations. A state is an
assignment to some subset; it is **consistent** if it violates no constraint, and
a **solution** is a complete consistent assignment.

The essential structural gain is that the goal test is no longer opaque. It is
decomposed into constraints, and each constraint is a lens through which the
solver can reason about the future. Map colouring, 8-queens, cryptarithmetic,
timetabling, and hardware configuration are all naturally expressed this way.

The chapter distinguishes constraint types by arity — unary, binary, and
higher-order **global** constraints such as `Alldiff` — and notes that any
finite-domain constraint can be reduced to binary ones, though at the cost of
losing the specialized propagation algorithms that make global constraints
valuable in practice. It also separates **absolute** constraints, whose violation
rules out a solution, from **preferences**, which turn the problem into a
constrained optimization.

## Inference Before Search

The chapter's central move is that constraints support **inference**, not just
testing. **Constraint propagation** shrinks domains by removing values that
cannot participate in any solution, and the levels form a hierarchy.

**Node consistency** satisfies unary constraints. **Arc consistency** is the
workhorse: $X_i$ is arc-consistent with respect to $X_j$ when, for every value in
$D_i$, there is some value in $D_j$ satisfying the binary constraint between
them. Enforcing it means deleting values with no support. The **AC-3** algorithm
maintains a queue of arcs, revises domains, and re-queues the arcs pointing at any
variable whose domain shrank, running in $O(cd^3)$ for $c$ binary constraints and
domain size $d$.

**Path consistency** strengthens this to pairs of variables with respect to a
third, and **$k$-consistency** generalizes to any $k-1$ variables and one more.
Strong $k$-consistency for $k = n$ would permit backtrack-free construction — and
the chapter is candid that achieving it is exponential, which is why arc
consistency is where the practical return peaks. Specialized propagators for
global constraints do better: `Alldiff` over $m$ variables with fewer than $m$
distinct values in their combined domains is immediately inconsistent, and
bounds propagation on numeric resource constraints tightens intervals without
enumerating values.

Propagation can do three things: solve the problem, prove it unsolvable, or
reduce branching. All three are wins, because every eliminated value is a subtree
that search will never enter.

## Backtracking, Improved

The base algorithm assigns one variable at a time, checks consistency, and backs
up on failure. Because assignment is commutative — the same set of assignments
reached in any order is the same state — only one variable need be considered at
each level, which reduces the search space from $n!d^n$ to $d^n$.

The improvements are all about *which* variable and *which* value.

**Minimum-remaining-values** picks the variable with the fewest legal values
left. The logic is fail-first: if a variable has no legal values, detect it now
rather than after exploring an unrelated subtree. The **degree heuristic** —
choose the variable involved in the most constraints on unassigned variables — is
the standard tie-breaker, and a good opening choice when all domains are still
full.

**Least-constraining-value** goes the other way for value choice: prefer the
value that rules out the fewest options for neighboring variables. The asymmetry
is deliberate and worth internalizing — we need *all* variables assigned, so
failing fast on variables is good; we need only *one* value per variable to work,
so preserving flexibility on values is good.

**Forward checking** prunes the domains of unassigned neighbors after each
assignment. **MAC** — maintaining arc consistency — runs full propagation
starting from the arcs into the newly assigned variable, catching failures
forward checking misses at somewhat greater cost per node, and is usually the
better trade.

**Conflict-directed backjumping** attacks the other half. When a variable fails,
chronological backtracking undoes the most recent assignment, which may be
entirely irrelevant to the failure. Backjumping instead maintains a **conflict
set** — the assignments responsible for eliminating values — and jumps to the
most recent variable in it. Propagating conflict sets backward lets the search
learn which *combinations* are jointly impossible; recording these as **no-goods**
is the direct ancestor of clause learning in modern SAT solvers, which is the
single technique most responsible for their practical power.

## Local Search on Complete Assignments

The alternative paradigm starts with a complete but inconsistent assignment and
repairs it. **Min-conflicts** selects a conflicted variable and reassigns it to
the value minimizing the number of violated constraints.

The empirical result the chapter highlights is genuinely surprising:
min-conflicts solves the million-queens problem in about fifty steps, and its
runtime is roughly independent of problem size. The explanation is that n-queens
has solutions densely distributed through the space. Performance depends on the
**constrainedness** ratio of constraints to variables — problems near the phase
transition between under- and over-constrained are hard for everything, and
loosely constrained problems are where local search excels. Plateau escape via
tabu lists or constraint weighting (raising the weight of persistently violated
constraints, which reshapes the landscape) rounds out the toolkit. The approach
also adapts gracefully to *online* settings, where a schedule must be repaired
after a disruption rather than rebuilt.

## What the Graph Shape Buys You

The final section is the most theoretically satisfying, and the ideas propagate
well beyond CSPs.

If the constraint graph splits into **independent components**, each is solved
separately, converting $d^n$ into something linear in the number of components —
an exponential saving.

If the constraint graph is a **tree**, the problem is solvable in $O(nd^2)$.
Order the variables topologically from a root, enforce arc consistency backward
from the leaves once, then assign forward; no backtracking is ever required.

<figure>
<svg viewBox="0 0 820 250" role="img" aria-label="A tree-structured constraint graph with a root and branching children, showing a backward arc-consistency sweep from leaves to root followed by a forward assignment pass from root to leaves, with no backtracking.">
  <defs>
    <marker id="arw-aima5-tree" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" class="dgm-fill"/>
    </marker>
  </defs>
  <circle cx="410" cy="48" r="18" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="410" y="53" text-anchor="middle" font-size="11">A</text>
  <circle cx="280" cy="126" r="18" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="280" y="131" text-anchor="middle" font-size="11">B</text>
  <circle cx="540" cy="126" r="18" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="540" y="131" text-anchor="middle" font-size="11">C</text>
  <circle cx="200" cy="200" r="18" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="200" y="205" text-anchor="middle" font-size="11">D</text>
  <circle cx="360" cy="200" r="18" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="360" y="205" text-anchor="middle" font-size="11">E</text>
  <circle cx="620" cy="200" r="18" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="620" y="205" text-anchor="middle" font-size="11">F</text>
  <line x1="396" y1="60" x2="294" y2="114" stroke="currentColor" stroke-width="1.4"/>
  <line x1="424" y1="60" x2="526" y2="114" stroke="currentColor" stroke-width="1.4"/>
  <line x1="268" y1="139" x2="212" y2="188" stroke="currentColor" stroke-width="1.4"/>
  <line x1="292" y1="139" x2="348" y2="188" stroke="currentColor" stroke-width="1.4"/>
  <line x1="552" y1="139" x2="608" y2="188" stroke="currentColor" stroke-width="1.4"/>
  <g class="dgm-accent">
    <path d="M110 208 Q 60 130 110 56" fill="none" stroke="currentColor" stroke-width="1.6" marker-end="url(#arw-aima5-tree)"/>
    <text x="64" y="132" text-anchor="middle" font-size="10.5" font-weight="700">1</text>
  </g>
  <text x="112" y="230" text-anchor="middle" font-size="10.5" class="dgm-muted">make arc-consistent</text>
  <text x="112" y="246" text-anchor="middle" font-size="10.5" class="dgm-muted">leaves → root</text>
  <g class="dgm-accent-2">
    <path d="M712 56 Q 762 130 712 208" fill="none" stroke="currentColor" stroke-width="1.6" marker-end="url(#arw-aima5-tree)"/>
    <text x="758" y="132" text-anchor="middle" font-size="10.5" font-weight="700">2</text>
  </g>
  <text x="706" y="230" text-anchor="middle" font-size="10.5" class="dgm-muted">assign</text>
  <text x="706" y="246" text-anchor="middle" font-size="10.5" class="dgm-muted">root → leaves</text>
</svg>
<figcaption><b>Why trees are easy.</b> One backward consistency sweep guarantees that every value surviving in a parent's domain extends to its whole subtree — so the forward pass never has to undo a choice.</figcaption>
</figure>

For graphs that are nearly trees, two reductions apply. **Cutset conditioning**
finds a small set $S$ whose removal leaves a tree, enumerates assignments to $S$,
and solves the remaining tree for each — cost $O(d^c \cdot (n-c)d^2)$ for cutset
size $c$. **Tree decomposition** groups variables into overlapping subproblems
arranged in a tree, solves each, and reconciles them; the cost is exponential in
the **tree width**, one less than the largest subproblem size. Finding the
minimum tree width is NP-hard, but good heuristic decompositions are often
available — and tree width turns out to be the governing parameter for exact
inference in Bayesian networks in Chapter 13, which is not a coincidence.

**Value symmetry** is the last lever: when a problem has interchangeable values,
adding symmetry-breaking constraints can cut the search space by a factorial
factor.

## Why It Matters

The strategic lesson is the one stated at the top: representing structure lets
you reason about the future instead of merely enumerating it. That is the same
argument the book makes for logic over search in Part III, and for Bayesian
networks over joint distributions in Part IV. CSPs are where it is demonstrated
most cleanly, because the gain is measurable and the mechanism — domain
pruning — is easy to see.

Practically, the chapter describes the architecture of every industrial
constraint and SAT solver in use: propagate to fixpoint, choose the most
constrained variable, and on failure learn a no-good and backjump. That loop
solves scheduling, verification, and configuration problems with millions of
variables, and it exists because someone declined to treat a state as an atom.
