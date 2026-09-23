---
course: bedrock
lectureId: AIMA 2
book: "Artificial Intelligence: A Modern Approach"
part: "I · Artificial Intelligence"
title: "The Machine as a Function From Percepts to Acts"
deck: "Chapter 2 builds the abstraction the rest of the book runs on: an agent is a function from percept histories to actions, rationality is a property of that function relative to a performance measure, and the shape of the environment decides which of four architectures you are allowed to use."
order: 2
chapter: 2
readingTime: 13
tags: ["agents", "rationality", "peas", "environments", "architecture"]
concepts:
  - id: agent-function
    term: Agent Function vs. Agent Program
    definition: "The agent function maps every possible percept sequence to an action — a mathematical object, usually infinite. The agent program is the finite implementation running on the architecture. The distinction separates what behavior is desired from how it is produced."
  - id: rationality-definition
    term: The Definition of Rationality
    definition: "For each percept sequence, a rational agent selects an action expected to maximize its performance measure, given the evidence in the sequence and whatever prior knowledge it has. Rationality is not omniscience, not clairvoyance, and not success — it is optimal use of available information."
  - id: peas
    term: PEAS
    definition: "Performance measure, Environment, Actuators, Sensors — the specification of a task environment that must be fixed before any agent design question is well posed."
  - id: environment-dimensions
    term: The Environment Dimensions
    definition: "Fully vs. partially observable, single- vs. multi-agent, deterministic vs. nondeterministic, episodic vs. sequential, static vs. dynamic, discrete vs. continuous, known vs. unknown. These jointly determine which algorithms in the book apply."
  - id: four-architectures
    term: The Four Agent Architectures
    definition: "Simple reflex (condition-action rules on the current percept), model-based reflex (plus internal state tracking the unobserved world), goal-based (plus a description of desirable states, enabling search and planning), and utility-based (plus a real-valued preference function permitting trade-offs)."
  - id: learning-agent
    term: The Learning Agent
    definition: "A decomposition into performance element (selects actions), critic (evaluates against a fixed external standard), learning element (improves the performance element), and problem generator (proposes exploratory actions that are suboptimal now but informative)."
  - id: representation-spectrum
    term: Atomic, Factored, Structured
    definition: "Three ways to represent a state: as an indivisible token, as a vector of attribute values, or as objects with relations. The choice sets a ceiling on what an agent can express and is the axis along which the book's parts are organized."
---

Chapter 2 is the load-bearing chapter of the book, and it is easy to underrate
because it contains no algorithm. What it contains is the vocabulary that makes
every later algorithm comparable to every other — a way of saying precisely what
an AI system is, what it would mean for it to be working, and which design
choices are forced by the world it operates in rather than chosen by its
designer.

## Function, Program, Architecture

An **agent** perceives its environment through sensors and acts through
actuators. Its behavior is captured by the **agent function**, mapping any
percept sequence to an action. This is a mathematical abstraction — typically an
infinite table, and for most interesting agents not something you could write
down. The **agent program** is the concrete finite implementation that runs on
some physical **architecture**, and the equation the chapter offers is that an
agent is the program plus the architecture.

The separation matters because it isolates two questions that are constantly
conflated in practice. What behavior *should* this system produce, considered as
a mapping from evidence to action? And what mechanism can produce that behavior
within a compute budget? A lookup table and a deep network can implement the same
agent function. They are the same agent in the first sense and wildly different
in the second.

## Rationality, Carefully Stated

The chapter's definition is exact and worth memorizing in its full form: for each
possible percept sequence, a rational agent selects an action expected to
maximize its **performance measure**, given the evidence provided by the percept
sequence and whatever prior knowledge the agent has.

Four things follow, and each rules out a common misreading.

Rationality is **not omniscience**. Omniscience means knowing the actual outcome;
rationality is about expected outcomes under available information. An agent that
crosses an empty street and is struck by a falling cargo door was not irrational.

Rationality is **not clairvoyance** — it cannot require anticipating what no
evidence indicates. Rationality is **not success**; it maximizes expected
performance, and expectation is compatible with a bad draw. And rationality
*does* require **information gathering** and **learning**: because the definition
is relative to the percept sequence, an agent that could have looked and did not
is irrational, and an agent that fails to improve from experience relies on prior
knowledge that may be incomplete or wrong. Autonomy, in the chapter's sense, is
the degree to which behavior is determined by the agent's own experience rather
than its designer's prior knowledge.

The performance measure is designed **by us, externally**, and the chapter is
direct about the hazard: one should design it to reflect what is actually wanted
in the environment, not how one imagines the agent ought to behave. A vacuum
agent rewarded for dirt collected will dump dirt and re-collect it. This is
Chapter 1's value alignment problem appearing in miniature, one chapter later,
in a toy domain — and it is the reason the warning is credible. Reward hacking
is visible at the scale of a floor-cleaning robot.

## Specifying the Task Before Designing the Agent

**PEAS** — performance measure, environment, actuators, sensors — is the
chapter's insistence that no agent design question is well posed until the task
environment is pinned down. The automated-taxi example is the one that shows
why: the performance measure alone (safe, fast, legal, comfortable, profitable,
minimally polluting) is a multi-objective trade-off with no canonical
resolution.

The **dimensions** then classify environments in ways that determine which
machinery is applicable:

- **Fully vs. partially observable.** Do the sensors give access to all relevant state? Partial observability forces internal state, and is what separates Chapter 3 from Chapters 4 and 16.
- **Single- vs. multi-agent**, and if multi, competitive or cooperative. This is the boundary at which Chapters 6 and 17 apply.
- **Deterministic vs. nondeterministic.** Whether the next state is fixed by the current state and action. The chapter carefully distinguishes *nondeterministic* (outcomes listed, no probabilities) from *stochastic* (probabilities attached) — the distinction that separates AND-OR search in Chapter 4 from MDPs in Chapter 16.
- **Episodic vs. sequential.** Whether current actions affect future episodes.
- **Static vs. dynamic**, with *semidynamic* for cases where the world is fixed but the score depends on elapsed time.
- **Discrete vs. continuous**, applicable separately to state, time, percepts, and actions.
- **Known vs. unknown.** A property of the *agent's knowledge of the rules*, not of the environment — and explicitly not the same as observability. A known environment can be partially observable; an unknown one can be fully observable.

The hardest case — partially observable, multi-agent, nondeterministic,
sequential, dynamic, continuous, unknown — is, as the chapter notes, driving.

<figure>
<svg viewBox="0 0 860 300" role="img" aria-label="The four agent architectures as a nested sequence: simple reflex maps the current percept to an action; model-based adds internal state; goal-based adds a goal test enabling search; utility-based adds a utility function enabling trade-offs among competing outcomes.">
  <defs>
    <marker id="arw-aima2-arch" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" class="dgm-fill"/>
    </marker>
  </defs>
  <rect x="24" y="52" width="192" height="150" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="120" y="42" text-anchor="middle" font-size="12" font-weight="700">SIMPLE REFLEX</text>
  <text x="120" y="82" text-anchor="middle" font-size="11">percept now</text>
  <line x1="120" y1="92" x2="120" y2="116" stroke="currentColor" stroke-width="1.3" marker-end="url(#arw-aima2-arch)"/>
  <text x="120" y="134" text-anchor="middle" font-size="11">condition–action rule</text>
  <line x1="120" y1="144" x2="120" y2="168" stroke="currentColor" stroke-width="1.3" marker-end="url(#arw-aima2-arch)"/>
  <text x="120" y="186" text-anchor="middle" font-size="11">action</text>
  <rect x="232" y="52" width="192" height="150" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="328" y="42" text-anchor="middle" font-size="12" font-weight="700">MODEL-BASED</text>
  <text x="328" y="82" text-anchor="middle" font-size="11">percept now</text>
  <line x1="328" y1="92" x2="328" y2="116" stroke="currentColor" stroke-width="1.3" marker-end="url(#arw-aima2-arch)"/>
  <text x="328" y="128" text-anchor="middle" font-size="11" font-weight="700">internal state</text>
  <text x="328" y="146" text-anchor="middle" font-size="10" class="dgm-muted">how the world evolves</text>
  <line x1="328" y1="156" x2="328" y2="174" stroke="currentColor" stroke-width="1.3" marker-end="url(#arw-aima2-arch)"/>
  <text x="328" y="190" text-anchor="middle" font-size="11">action</text>
  <rect x="440" y="52" width="192" height="150" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="536" y="42" text-anchor="middle" font-size="12" font-weight="700">GOAL-BASED</text>
  <text x="536" y="82" text-anchor="middle" font-size="11">state + model</text>
  <line x1="536" y1="92" x2="536" y2="116" stroke="currentColor" stroke-width="1.3" marker-end="url(#arw-aima2-arch)"/>
  <text x="536" y="128" text-anchor="middle" font-size="11" font-weight="700">goal test</text>
  <text x="536" y="146" text-anchor="middle" font-size="10" class="dgm-muted">search and planning</text>
  <line x1="536" y1="156" x2="536" y2="174" stroke="currentColor" stroke-width="1.3" marker-end="url(#arw-aima2-arch)"/>
  <text x="536" y="190" text-anchor="middle" font-size="11">action</text>
  <g class="dgm-accent">
    <rect x="648" y="52" width="192" height="150" class="dgm-soft" stroke="currentColor" stroke-width="1.7"/>
    <text x="744" y="42" text-anchor="middle" font-size="12" font-weight="700">UTILITY-BASED</text>
    <text x="744" y="82" text-anchor="middle" font-size="11">state + model</text>
    <line x1="744" y1="92" x2="744" y2="116" stroke="currentColor" stroke-width="1.3" marker-end="url(#arw-aima2-arch)"/>
    <text x="744" y="128" text-anchor="middle" font-size="11" font-weight="700">utility function</text>
    <text x="744" y="146" text-anchor="middle" font-size="10">trades off conflicting goals</text>
    <line x1="744" y1="156" x2="744" y2="174" stroke="currentColor" stroke-width="1.3" marker-end="url(#arw-aima2-arch)"/>
    <text x="744" y="190" text-anchor="middle" font-size="11">action</text>
  </g>
  <text x="430" y="238" text-anchor="middle" font-size="11">each design adds exactly one thing the previous one could not represent</text>
  <text x="430" y="266" text-anchor="middle" font-size="10.5" class="dgm-muted">state for what cannot be seen · goals for what has not happened yet · utility for what cannot be satisfied at once</text>
  <text x="430" y="290" text-anchor="middle" font-size="10.5" class="dgm-muted">any of the four can be wrapped in a learning agent</text>
</svg>
<figcaption><b>Four architectures, three additions.</b> The progression is not about sophistication for its own sake — each step buys the ability to represent something the previous design was structurally unable to express.</figcaption>
</figure>

## Four Ways to Build the Program

**Simple reflex agents** apply condition-action rules to the current percept.
They are small and fast, and they work only in fully observable environments;
in partially observable ones they are prone to infinite loops, which randomization
can sometimes escape.

**Model-based reflex agents** maintain internal state, updated using a
**transition model** (how the world evolves, including in response to the agent's
actions) and a **sensor model** (how world state produces percepts). This is the
minimum architecture for partial observability, and the chapter is careful that
the internal state is a *best guess*, frequently uncertain.

**Goal-based agents** add an explicit representation of desirable situations.
This is what makes search (Chapters 3–5) and planning (Chapter 11) possible, and
its advantage is flexibility rather than performance: change the goal and the
behavior changes, where a reflex agent would need its rules rewritten.

**Utility-based agents** replace the binary goal test with a real-valued
**utility function** over states, which is what lets an agent handle conflicting
goals and uncertain outcomes. Under uncertainty the agent maximizes *expected*
utility, and the chapter is candid that this rational-agent ideal is
computationally out of reach in general — which is why so much of the book is
about approximating it.

## The Learning Agent

Any of the four can be embedded in a learning agent, decomposed into four
components. The **performance element** is what we previously called the whole
agent: it selects actions. The **critic** evaluates behavior against a fixed
external performance standard, and it must be external, because an agent that
could revise its own standard would simply lower it. The **learning element**
improves the performance element using the critic's feedback. The **problem
generator** proposes exploratory actions that are suboptimal in the short run but
informative — the chapter's framing of the exploration-exploitation trade-off,
long before Chapter 16 formalizes it.

## How the State Is Represented

The last section introduces the axis along which the book's parts are actually
ordered. In an **atomic** representation, a state is an indivisible black box —
all that matters is whether two states are identical. This is what search
(Chapter 3) and Markov chains operate on. In a **factored** representation, a
state is a vector of attribute values, which lets algorithms reason about
individual variables: CSPs, propositional logic, Bayesian networks, and most of
machine learning live here. In a **structured** representation, the world is
objects with relations among them, which is what first-order logic, knowledge
representation, and relational probability models require.

Expressiveness increases along this axis, and so does the cost of reasoning. A
more expressive language can capture concisely what a less expressive one cannot
capture at all — but the concision is paid for in inference difficulty. Much of
the book's engineering judgment consists of choosing the least expressive
representation that can state the problem.

## Why It Matters

Before this chapter, "AI system" is a marketing term. After it, it is a
specification with four slots you must fill and seven dimensions you must
classify, and the classification tells you which half of the book you are in.
The practical discipline it imposes is worth carrying into any applied work:
write the PEAS description first, classify the environment honestly — especially
*partially observable* and *unknown*, which teams routinely pretend away — and
only then ask which architecture is warranted. Most failed AI products are
failures of this chapter rather than of the algorithms that follow it, because
they deployed a reflex agent into a sequential, partially observable world and
were surprised when it looped.
