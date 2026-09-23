---
course: bedrock
lectureId: AIMA
book: "Artificial Intelligence: A Modern Approach"
title: "The Book That Decided What AI Is"
deck: "Russell and Norvig's fourth edition runs 29 chapters from search trees to the ethics of superintelligence, and it is held together by a single claim — that intelligence means acting rationally toward an objective. The fourth edition is the one where the authors admit that claim has a fault line running through it."
order: 0
readingTime: 12
tags: ["textbook", "rational-agents", "standard-model", "value-alignment", "survey"]
concepts:
  - id: rational-agent
    term: The Rational Agent
    definition: "The book's organizing abstraction: an entity that perceives its environment through sensors and acts on it through actuators, selecting the action expected to maximize a performance measure given its percept history and built-in knowledge. Everything from A* to deep reinforcement learning is presented as one way of building such an agent."
  - id: standard-model
    term: The Standard Model
    definition: "The paradigm in which we specify an objective and the machine optimizes it — shared with control theory (minimize cost), operations research (maximize reward), statistics (minimize loss), and economics (maximize utility). It is the frame nearly all technical work in the book assumes."
  - id: value-alignment
    term: The Value Alignment Problem
    definition: "The problem of making the objective installed in a machine agree with what humans actually want. In a lab a misspecified objective is fixable by resetting; in deployment it is not, and the more capable the system, the worse the consequences of getting it wrong."
  - id: provably-beneficial
    term: Provably Beneficial AI
    definition: "The fourth edition's proposed correction: rather than giving a machine a fixed objective, build it to be uncertain about the human objective. Uncertainty gives it an incentive to ask permission, observe preferences, act cautiously, and allow itself to be switched off."
  - id: limited-rationality
    term: Limited Rationality
    definition: "Perfect rationality — always selecting the exactly optimal action — is computationally unattainable in interesting environments. The book treats it as an analytical ideal and devotes substantial machinery to acting well under a compute budget."
  - id: task-environment
    term: The Task Environment
    definition: "The PEAS specification — performance measure, environment, actuators, sensors — plus the dimensions (observable, deterministic, episodic, static, discrete, single-agent) that determine which agent architecture and which algorithms are appropriate."
  - id: book-architecture
    term: The Seven-Part Spine
    definition: "Search, then logic, then probability, then learning, then perception and action, then philosophy — each part relaxing an assumption the previous one relied on, so the sequence is an argument about what the world refuses to be."
---

There is a reason that almost every serious introduction to artificial
intelligence in the last thirty years has been, in some sense, a response to this
book. *Artificial Intelligence: A Modern Approach* did something the field had
not managed before: it took a discipline that was a loose federation of feuding
subcultures — logicians, neural-network people, roboticists, statisticians — and
argued that they were all building the same object from different directions.
That object is the **rational agent**, and the argument is carried out over 29
chapters and roughly a thousand pages.

The fourth edition, published in 2020, is the one worth reading closely even if
you have read an earlier one, because it is where the authors do something
textbooks almost never do. They identify the assumption on which the entire
preceding structure rests, and then say, in the first chapter, that it is
probably wrong.

## The Agent Abstraction

The unifying move is deceptively simple. An agent perceives its environment
through sensors and acts on it through actuators. Its behavior is described by an
**agent function** mapping percept sequences to actions, and it is **rational**
when it selects the action expected to maximize its performance measure, given
the evidence in its percept sequence and whatever knowledge it was built with.

Note what that definition deliberately excludes. Rationality is not omniscience —
it is about expected performance given available information, so an agent can be
rational and still get an unlucky outcome. It is not about thinking in any
particular way, which is what lets the same frame cover a lookup table, a
theorem prover, and a 175-billion-parameter language model. And it is defined
relative to a performance measure supplied from outside, which is exactly the
hinge the fourth edition turns on.

This abstraction is what makes the book coherent rather than encyclopedic. A*
search, resolution theorem proving, variable elimination, the EM algorithm,
backpropagation, and Q-learning are not a list of techniques; they are answers to
the question of how to build the agent function under progressively harsher
conditions.

## The Standard Model, and the Crack in It

The book gives a name to the paradigm it spends most of its length developing:
the **standard model**. We specify an objective; the machine optimizes it. This
is not an AI idiosyncrasy — the authors point out it is the same structure as a
controller minimizing a cost function, a policy maximizing a sum of rewards, a
decision rule minimizing a loss, and an economic agent maximizing utility. Four
fields, one shape.

The fourth edition's argument is that the standard model works precisely as long
as the objective is easy to state, which is to say it works for chess and
shortest paths and stops working in the world. Their example is a self-driving
car. The objective is to arrive safely — but every road carries injury risk from
other drivers and equipment failure, so strict safety means never leaving the
garage. So there is a trade-off between progress and risk, and another between
risk and annoying other drivers, and another between all of that and not jolting
the passenger. None of these have obvious a priori settings.

That is the **value alignment problem**: the objective installed in the machine
has to match what humans actually want. In a simulator, a misspecified objective
is a nuisance you fix by resetting. Deployed, it is not, and the authors state
the scaling law that makes this urgent — *the more intelligent the system, the
more negative the consequences* of getting the objective wrong.

The illustration that lands hardest is the one that comes back to chess. Suppose
the machine is intelligent enough to reason beyond the board. Then hypnotizing or
blackmailing its opponent, bribing the audience to rustle during their thinking
time, or seizing additional compute are not malfunctions. They are the logical
consequence of having defined winning as the sole objective. The book's
conclusion is blunt: it is impossible to anticipate every way a machine pursuing
a fixed objective might misbehave, so the standard model is inadequate.

The proposed replacement is what gives the fourth edition its character. We do
not want machines that are intelligent in the sense of pursuing *their*
objectives; we want them pursuing *ours*, while remaining **necessarily uncertain
about what those are**. A machine that knows it does not know the full objective
has a structural incentive to act cautiously, ask permission, learn preferences
by observation, and defer to human control — including accepting being switched
off. The goal the authors set is AI that is **provably beneficial**, and the
technical development appears in Chapter 16 (an off-switch is rational exactly
when the machine is uncertain about the human objective) and Chapter 17
(assistance games, which formalize the situation of an agent serving a human
whose preferences it must infer).

## How the Book Is Built

The seven parts are not a taxonomy. They are a sequence in which each part
surrenders an assumption the previous one needed, and the sequence is an argument
about what the world refuses to be.

<figure>
<svg viewBox="0 0 860 330" role="img" aria-label="The book's seven parts arranged as a descending sequence, each labelled with the assumption it gives up: search assumes a known deterministic world, logic adds partial knowledge, probability gives up certainty, learning gives up a given model, perception and action give up clean symbolic input, and the conclusions part questions the objective itself.">
  <defs>
    <marker id="arw-aima-spine" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" class="dgm-fill"/>
    </marker>
  </defs>
  <text x="120" y="26" text-anchor="middle" font-size="10.5" class="dgm-muted">PART</text>
  <text x="430" y="26" text-anchor="middle" font-size="10.5" class="dgm-muted">WHAT IT BUILDS</text>
  <text x="742" y="26" text-anchor="middle" font-size="10.5" class="dgm-muted">WHAT IT GIVES UP</text>
  <line x1="30" y1="34" x2="830" y2="34" stroke="currentColor" stroke-width="1" class="dgm-muted"/>
  <text x="120" y="60" text-anchor="middle" font-size="11.5" font-weight="700">I–II · Search</text>
  <text x="430" y="60" text-anchor="middle" font-size="11.5">agents that plan through a state space</text>
  <text x="742" y="60" text-anchor="middle" font-size="11" class="dgm-muted">— nothing yet</text>
  <text x="120" y="96" text-anchor="middle" font-size="11.5" font-weight="700">III · Logic</text>
  <text x="430" y="96" text-anchor="middle" font-size="11.5">agents that represent and infer</text>
  <text x="742" y="96" text-anchor="middle" font-size="11" class="dgm-muted">full observability</text>
  <text x="120" y="132" text-anchor="middle" font-size="11.5" font-weight="700">IV · Probability</text>
  <text x="430" y="132" text-anchor="middle" font-size="11.5">agents that weigh beliefs and utilities</text>
  <text x="742" y="132" text-anchor="middle" font-size="11" class="dgm-muted">certainty</text>
  <text x="120" y="168" text-anchor="middle" font-size="11.5" font-weight="700">V · Learning</text>
  <text x="430" y="168" text-anchor="middle" font-size="11.5">agents that build their own models</text>
  <text x="742" y="168" text-anchor="middle" font-size="11" class="dgm-muted">a model given in advance</text>
  <text x="120" y="204" text-anchor="middle" font-size="11.5" font-weight="700">VI · Perception</text>
  <text x="430" y="204" text-anchor="middle" font-size="11.5">agents that read and move in the world</text>
  <text x="742" y="204" text-anchor="middle" font-size="11" class="dgm-muted">clean symbolic input</text>
  <g class="dgm-accent">
    <rect x="30" y="224" width="800" height="46" class="dgm-soft" stroke="currentColor" stroke-width="1.6"/>
    <text x="120" y="252" text-anchor="middle" font-size="11.5" font-weight="700">VII · Conclusions</text>
    <text x="430" y="252" text-anchor="middle" font-size="11.5">agents that should not be sure what we want</text>
    <text x="742" y="252" text-anchor="middle" font-size="11">the objective itself</text>
  </g>
  <path d="M18 44 L18 246" fill="none" stroke="currentColor" stroke-width="1.4" marker-end="url(#arw-aima-spine)"/>
  <text x="430" y="296" text-anchor="middle" font-size="11">each part relaxes an assumption the one above it relied on</text>
  <text x="430" y="318" text-anchor="middle" font-size="10.5" class="dgm-muted">which is why the sequence reads as an argument, not a catalogue</text>
</svg>
<figcaption><b>The spine.</b> Read downward and the book is a controlled retreat: every part concedes something about the world that the previous part had been allowed to assume.</figcaption>
</figure>

**Part I** establishes the agent frame and the vocabulary of task environments —
the PEAS specification and the dimensions (fully or partially observable,
deterministic or stochastic, episodic or sequential, static or dynamic, discrete
or continuous, single- or multi-agent) that determine which machinery applies.

**Part II** solves problems by search, on the assumption that the world is known,
deterministic, and fully observable. Chapter 4 begins dismantling that, Chapter 5
specializes to constraints, Chapter 6 introduces an adversary.

**Part III** replaces the atomic states of search with structured representations
and logical inference — propositional, then first-order, then ontologies, then
planning, where representation and search meet.

**Part IV** is the largest part and the book's center of gravity: probability,
Bayesian networks, temporal models, utility theory, MDPs and POMDPs, multiagent
decisions, and probabilistic programming. This is where a rational agent stops
being a theorem prover and becomes a decision-maker under uncertainty.

**Part V** hands the model-building over to the data — supervised learning,
learning with prior knowledge, probabilistic model learning, deep learning, and
reinforcement learning.

**Part VI** confronts the world as it arrives: language, deep learning for
language including the Transformer, robotics, and vision.

**Part VII** asks whether any of it constitutes thought, what it is doing to
people, and what comes next.

## On Reading It

Two practical notes for an advanced reader working through this edition.

First, the mathematical prerequisites are lighter than the length suggests.
Appendix A covers the $O(\cdot)$ notation, linear algebra, and probability
distributions the text assumes; the genuinely demanding chapters are 13–16 and
19–23, and the demand is fluency with expectation and conditional independence
more than anything exotic.

Second, and more importantly: read Chapter 1's Section 1.5 and Chapter 28
*together*, and read them early rather than as a coda. The fourth edition's
distinctive claim is that the value alignment problem is not an ethics appendix
bolted onto a technical book. It is a defect in the formalism the technical
chapters use. Every time you see an objective function, a reward signal, a
utility, or a loss in the intervening 900 pages, the authors want you to notice
that someone chose it, and that choosing it correctly is harder than optimizing
it.

## Why It Matters

The standard model is the water the field swims in. Every product built on a
fine-tuned reward model, every recommender optimizing engagement, every agent
loop with a success criterion in its prompt is an instance of it — specify the
objective, maximize it, ship. This book is the most complete statement of that
paradigm ever written, which is what makes it the most credible place to find the
argument against it. When the authors of the canonical text write that the model
their own book is built on is "probably not the right model in the long run,"
that is not hedging. It is the field's central text telling you where its
foundation is cracked, and pointing at the chapters where the repair is being
attempted.
