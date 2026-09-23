---
course: bedrock
lectureId: AIMA 11
book: "Artificial Intelligence: A Modern Approach"
part: "III · Knowledge, Reasoning, and Planning"
title: "Heuristics You Do Not Have to Invent"
deck: "Chapter 11 is where representation pays search back. Because a planner can see the structure of its own actions, it can derive its heuristics automatically — and then hierarchy lets it plan over abstractions whose details it has not worked out yet."
order: 11
chapter: 11
readingTime: 14
tags: ["planning", "pddl", "heuristics", "htn", "scheduling"]
concepts:
  - id: pddl
    term: PDDL and Factored Representation
    definition: "States as conjunctions of ground fluents under a closed-world assumption; actions as schemas with preconditions and effects given as add and delete lists. Because actions are inspectable structures, algorithms can reason about the domain itself."
  - id: forward-backward-search
    term: Forward and Backward Search
    definition: "Forward (progression) search from the initial state suffers a large branching factor but has concrete states; backward (regression) search from the goal considers only relevant actions and works over sets of states described by partial assignments."
  - id: domain-independent-heuristics
    term: Domain-Independent Heuristics
    definition: "Relaxations derived automatically from the action schemas: ignore-preconditions, ignore-delete-lists (which makes the relaxed problem monotone and solvable greedily), and state abstraction by dropping fluents."
  - id: planning-graph
    term: Planning Graphs and GraphPlan
    definition: "A layered structure alternating state and action levels with mutual-exclusion links, built in polynomial time. The level at which a goal first appears non-mutex is an admissible heuristic, and GraphPlan extracts plans from it directly."
  - id: sat-planning
    term: Planning as Satisfiability
    definition: "Encode the initial state, successor-state axioms, and the goal at horizon T as a propositional formula and hand it to a SAT solver, letting decades of solver engineering do the search."
  - id: htn
    term: Hierarchical Task Networks
    definition: "High-level actions with refinements into lower-level sequences. Planning at the abstract level succeeds when a high-level action has at least one implementation reaching the goal, which is what permits commitment before details are settled."
  - id: nondeterministic-planning
    term: Planning in Nondeterministic Domains
    definition: "Sensorless planning over belief states, contingent planning with conditionals on observations, online replanning with execution monitoring, and the distinction between action monitoring, plan monitoring, and goal monitoring."
  - id: scheduling
    term: Time, Schedules, and Resources
    definition: "Separating what to do from when to do it. The critical path method computes earliest and latest start times in polynomial time; adding resource constraints makes the problem NP-hard, so planning and scheduling are usually decoupled."
---

Planning looks like search, and for two chapters the book has been treating it
that way. Chapter 11's argument is that the resemblance conceals an enormous
missed opportunity. A search algorithm is handed an opaque successor function; it
can call it, and that is all. A planner is given the actions as **structured
descriptions** — preconditions and effects, written down — and can therefore
inspect the domain and reason about it.

The immediate dividend is that heuristics, which Chapter 3 said were the whole
game and left you to invent yourself, can now be derived automatically.

## The Representation

**PDDL** — the Planning Domain Definition Language — represents a state as a
conjunction of ground, function-free **fluents**, under the **closed-world
assumption** that anything not mentioned is false. Actions are **schemas** with
variables, a precondition, and an effect; the effect's positive literals form the
**add list** and its negated literals the **delete list**. Applying an action to
a state deletes the delete list and adds the add list.

This solves the frame problem by construction: what is not in either list simply
persists. No frame axioms, no successor-state axioms — the persistence is in the
semantics of application rather than in the knowledge base. That is the whole
reason for adopting a restricted language rather than full first-order logic, and
it is the chapter's clearest instance of the recurring trade: give up
expressiveness, get an algorithm.

## Two Directions

**Forward (progression) search** starts at the initial state and applies
applicable actions. It works with concrete states, which makes it easy to
evaluate, but the branching factor is the number of applicable ground actions,
which in realistic domains is enormous. Without a good heuristic it is hopeless —
and the chapter's point is that it is not without one.

**Backward (regression) search** starts from the goal and works backward through
actions that achieve part of it. Its advantage is **relevance**: only actions
that contribute to the goal are considered, which in domains with many
irrelevant actions is a huge reduction. The complication is that its states are
*sets* of states described by partial assignments, and computing the predecessor
description requires care about which fluents the action determines and which it
merely does not disturb.

Backward search also permits **lifted** regression using unification — operating
on action schemas rather than ground instances, exactly as in Chapter 9.

## Heuristics for Free

This is the chapter's centerpiece. Chapter 3 established that relaxing a problem
gives an admissible heuristic. What was missing was a way to relax
*automatically*. PDDL supplies it, because the relaxations can be defined as
syntactic operations on the action schemas.

**Ignore-preconditions** deletes all preconditions, so every action is always
applicable and the heuristic is roughly the number of unsatisfied goal fluents
(with care about actions achieving several at once).

**Ignore-delete-lists** is the most productive. Remove every negative effect, and
progress becomes monotone — nothing ever becomes false — so the relaxed problem
can be solved greedily in polynomial time, and its solution length is an
admissible heuristic for the original. This single relaxation underlies most
modern planners.

**State abstraction** drops fluents entirely, mapping many ground states onto
one, with the relaxed cost as the heuristic. **Decomposition** splits the goal
into subgoals; summing their costs is admissible only if the subproblems are
genuinely independent, and taking the maximum is admissible always.

## The Planning Graph

**Planning graphs** give a tighter heuristic and an algorithm at once. The graph
alternates **state levels** (literals possibly true after $k$ steps) and
**action levels** (actions possibly executable), with **persistence actions**
carrying literals forward.

The essential machinery is **mutual exclusion**. Two actions are mutex if one
deletes a precondition or effect of the other (interference), if their effects
contradict (inconsistent effects), or if their preconditions are mutex
(competing needs). Two literals are mutex if one is the negation of the other, or
if every pair of actions achieving them is mutex.

The graph is built in polynomial time and **levels off**. Its use as a heuristic
is exact: the level at which a goal literal first appears — and, for conjunctive
goals, the level at which all goal literals appear non-mutex — is an admissible
estimate of the steps required. If a goal literal never appears, the problem is
provably unsolvable, which planning graphs can establish cheaply.

**GraphPlan** goes further and extracts a plan directly, alternating graph
expansion with a backward solution-extraction search constrained by the mutex
relations.

<figure>
<svg viewBox="0 0 840 250" role="img" aria-label="A planning graph with alternating state and action levels: literals at level zero feed actions at level zero, producing literals at level one, with mutual exclusion links drawn between incompatible pairs.">
  <defs>
    <marker id="arw-aima11-pg" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" class="dgm-fill"/>
    </marker>
  </defs>
  <text x="90" y="28" text-anchor="middle" font-size="11.5" font-weight="700">S₀</text>
  <text x="300" y="28" text-anchor="middle" font-size="11.5" font-weight="700">A₀</text>
  <text x="510" y="28" text-anchor="middle" font-size="11.5" font-weight="700">S₁</text>
  <text x="720" y="28" text-anchor="middle" font-size="11.5" font-weight="700">A₁</text>
  <text x="90" y="46" text-anchor="middle" font-size="10" class="dgm-muted">literals</text>
  <text x="300" y="46" text-anchor="middle" font-size="10" class="dgm-muted">actions</text>
  <text x="510" y="46" text-anchor="middle" font-size="10" class="dgm-muted">literals</text>
  <text x="720" y="46" text-anchor="middle" font-size="10" class="dgm-muted">actions</text>
  <rect x="40" y="68" width="100" height="26" fill="none" stroke="currentColor" stroke-width="1.4"/>
  <text x="90" y="86" text-anchor="middle" font-size="10.5">P</text>
  <rect x="40" y="128" width="100" height="26" fill="none" stroke="currentColor" stroke-width="1.4"/>
  <text x="90" y="146" text-anchor="middle" font-size="10.5">¬Q</text>
  <rect x="250" y="68" width="100" height="26" fill="none" stroke="currentColor" stroke-width="1.4"/>
  <text x="300" y="86" text-anchor="middle" font-size="10.5">act A</text>
  <rect x="250" y="128" width="100" height="26" fill="none" stroke="currentColor" stroke-width="1.4"/>
  <text x="300" y="146" text-anchor="middle" font-size="10.5">act B</text>
  <rect x="460" y="68" width="100" height="26" fill="none" stroke="currentColor" stroke-width="1.4"/>
  <text x="510" y="86" text-anchor="middle" font-size="10.5">Q</text>
  <rect x="460" y="128" width="100" height="26" fill="none" stroke="currentColor" stroke-width="1.4"/>
  <text x="510" y="146" text-anchor="middle" font-size="10.5">R</text>
  <rect x="670" y="98" width="100" height="26" fill="none" stroke="currentColor" stroke-width="1.4" stroke-dasharray="4 3"/>
  <text x="720" y="116" text-anchor="middle" font-size="10.5">…</text>
  <line x1="142" y1="81" x2="246" y2="81" stroke="currentColor" stroke-width="1.3" marker-end="url(#arw-aima11-pg)"/>
  <line x1="142" y1="141" x2="246" y2="141" stroke="currentColor" stroke-width="1.3" marker-end="url(#arw-aima11-pg)"/>
  <line x1="352" y1="81" x2="456" y2="81" stroke="currentColor" stroke-width="1.3" marker-end="url(#arw-aima11-pg)"/>
  <line x1="352" y1="141" x2="456" y2="141" stroke="currentColor" stroke-width="1.3" marker-end="url(#arw-aima11-pg)"/>
  <line x1="562" y1="111" x2="666" y2="111" stroke="currentColor" stroke-width="1.3" stroke-dasharray="4 3" marker-end="url(#arw-aima11-pg)"/>
  <g class="dgm-accent">
    <path d="M300 96 L300 126" fill="none" stroke="currentColor" stroke-width="1.8"/>
    <text x="316" y="115" font-size="10" font-weight="700">mutex</text>
  </g>
  <text x="420" y="196" text-anchor="middle" font-size="11.5">the level where every goal literal first appears <tspan font-weight="700">non-mutex</tspan></text>
  <text x="420" y="218" text-anchor="middle" font-size="11.5">is an admissible estimate of the steps required</text>
  <text x="420" y="240" text-anchor="middle" font-size="10.5" class="dgm-muted">and a literal that never appears proves the problem unsolvable</text>
</svg>
<figcaption><b>A heuristic you build rather than invent.</b> The graph is polynomial to construct, and the level numbers read off it are lower bounds on plan length.</figcaption>
</figure>

**Planning as satisfiability** is the other classical translation: encode the
initial state, successor-state axioms for $T$ steps, action exclusion, and the
goal, then call a SAT solver. The appeal is leverage — decades of solver
engineering apply directly — and the limitation is the fixed horizon.

## Hierarchy

**Hierarchical task networks** address the depth problem. Real plans are
thousands of primitive actions long, and searching at that granularity is
hopeless. HTN planning introduces **high-level actions** with **refinements**
into sequences of lower-level actions, and plans at the abstract level.

The key semantic question is what it means for an abstract plan to be correct.
The chapter's answer: a high-level plan achieves the goal if *at least one* of
its implementations does — the **downward refinement property**. If a planner can
establish that, it may commit to the abstract plan and work out the details
later, which is what makes hierarchical planning exponentially cheaper. The
alternative reading — that *every* implementation must work — supports planning
without any further search but is far harder to guarantee.

Reasoning about which abstract plans are viable requires describing the
**reachable set** of a high-level action: the states it could produce. Optimistic
and pessimistic approximations bracket it, and a plan whose pessimistic
description already reaches the goal can be committed to immediately.

## When the World Does Not Cooperate

Four responses to nondeterminism are surveyed, and their relationships matter
more than their details.

**Sensorless planning** operates on belief states, as in Chapter 4.
**Contingent planning** includes conditional branches on observations.
**Online replanning** plans, executes, monitors, and repairs — and the chapter
argues this is usually the right architecture, because full contingent plans
cover exponentially many cases that will never arise.

Monitoring comes in three grades. **Action monitoring** checks preconditions
before each step. **Plan monitoring** checks that the remaining plan is still
viable, catching failures earlier. **Goal monitoring** checks whether a better
goal is now available. The chapter's observation that replanning agents can
appear to exhibit sophisticated behavior through a loop of *plan, act, notice
failure, repair* is a fair description of how most deployed autonomous systems
actually work.

## Time and Resources

The final section separates **planning** (what to do) from **scheduling** (when,
with what). Given a partial-order plan with action durations, the **critical path
method** computes earliest and latest start times in polynomial time; the
critical path is the one with zero slack, and it determines the makespan.

Add **resource constraints** — limited machines, tools, people — and the problem
becomes NP-hard. The chapter's practical note is that the standard industrial
approach decouples the two: plan first, schedule second, and iterate if
scheduling fails. It is not optimal, and it is tractable.

## Why It Matters

The intellectual payoff is the demonstration that **representation enables
automation of what was previously craft**. Chapter 3 said heuristics were
everything and left them to human ingenuity; Chapter 11 derives them from the
domain description, because the domain description is something a program can
read. That pattern — expose structure, then exploit it automatically — is the
strongest argument the logical half of the book makes.

Practically, the hierarchical and replanning material is the closer of the two
halves to current practice. An agent that decomposes a goal into sub-tasks, acts,
observes that a step failed, and repairs its plan is running Chapter 11's
architecture, whatever it is implemented with. And the chapter's warning
transfers intact: the hard part is not generating the plan, it is knowing that
your model of the actions' preconditions and effects is wrong, and monitoring for
the moment it matters.
