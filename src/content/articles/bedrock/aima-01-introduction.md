---
course: bedrock
lectureId: AIMA 1
book: "Artificial Intelligence: A Modern Approach"
part: "I · Artificial Intelligence"
title: "Four Definitions and a Disagreement"
deck: "Chapter 1 refuses to define artificial intelligence once. It lays out four competing definitions along two axes, picks the one it intends to build on, traces the eight disciplines that fed the field, and then concedes that the definition it picked has a flaw serious enough to warrant a new one."
order: 1
chapter: 1
readingTime: 13
tags: ["definitions", "foundations", "history", "rationality", "risk"]
concepts:
  - id: four-definitions
    term: The Four Definitions
    definition: "Thinking humanly, acting humanly, thinking rationally, acting rationally — a two-by-two over whether the standard is human performance or an ideal of rationality, and whether it applies to reasoning or behavior. The book commits to acting rationally."
  - id: turing-test
    term: The Turing Test
    definition: "Turing's operational substitute for 'can machines think?': whether an interrogator can distinguish machine from human in written conversation. It defines acting humanly, and the book treats it as historically decisive but not a useful engineering target."
  - id: rational-agent-approach
    term: The Rational-Agent Approach
    definition: "Acting so as to achieve the best expected outcome given available information. Chosen because it is more general than the laws-of-thought approach — correct inference is only one way of acting rationally — and more amenable to scientific development than imitating humans."
  - id: eight-foundations
    term: The Eight Contributing Disciplines
    definition: "Philosophy, mathematics, economics, neuroscience, psychology, computer engineering, control theory and cybernetics, and linguistics — each supplying a question the field inherited along with its tools."
  - id: ai-winters
    term: The Boom-and-Bust Cycle
    definition: "Early enthusiasm on toy problems, collapse when methods failed to scale (the first winter), the expert-systems boom and the collapse of the LISP-machine market (the second), and the recovery driven by probability, statistical learning, and eventually large-scale deep learning."
  - id: agi-vs-narrow
    term: General vs. Narrow AI
    definition: "The distinction between systems tuned to one task and the pursuit of artificial general intelligence. The chapter treats AGI as an open research aspiration, not an imminent engineering milestone, while insisting the safety questions do not wait for it."
  - id: risks-of-ai
    term: The Chapter's Risk Inventory
    definition: "Lethal autonomous weapons, surveillance and persuasion, biased decision-making, employment effects, safety-critical failures, and — as the limiting case — the loss of human control that follows from perfectly optimizing a badly chosen objective."
---

Most textbooks open by defining their subject. Chapter 1 opens by declining to,
and the refusal is the most useful thing in it. Artificial intelligence has been
defined, over its history, in four incompatible ways, and which one you adopt
determines what counts as progress, what counts as evidence, and which department
you end up arguing with.

## The Two-by-Two

Arrange the definitions along two axes. One axis asks whether the standard of
success is **fidelity to human performance** or **an ideal of rationality** —
doing the right thing, where the right thing is defined independently of how
people actually behave. The other asks whether the criterion applies to internal
**reasoning** or to external **behavior**. Four quadrants result.

**Thinking humanly** is the cognitive-modeling approach: a program is a success
if its internal steps correspond to those of a human solving the same problem.
This requires evidence about human cognition — introspection, psychological
experiment, brain imaging — and it is the quadrant where AI and cognitive science
merge. It is a claim about mechanism, and it is falsifiable in ways the other
quadrants are not.

**Acting humanly** is the Turing Test approach. Turing's move was to replace an
unanswerable question with an operational one: can an interrogator, communicating
in writing, reliably distinguish the machine from a person? The chapter notes
what a complete Turing Test would require — natural language processing,
knowledge representation, automated reasoning, machine learning, and, for the
total version with a physical channel, computer vision and robotics — which is
essentially the syllabus of the book. But it also makes the engineering point
that the field has not organized itself around passing the test, for the same
reason aeronautics did not organize itself around building birds. Imitating human
behavior, including human error, is not obviously the objective.

**Thinking rationally** is the laws-of-thought tradition running from Aristotle's
syllogisms through nineteenth-century formal logic to the logicist program in AI:
encode knowledge in a formal notation, apply sound inference rules, derive correct
conclusions. Two obstacles are decisive. Informal knowledge is extraordinarily
hard to state in formal notation, especially when it is uncertain rather than
merely complicated. And there is a gulf between being able to solve a problem in
principle and being able to solve it with finite computation — a system can be
provably correct and completely useless.

**Acting rationally** is the approach the book commits to. An agent acts
rationally when it does what is expected to achieve the best outcome, or the best
expected outcome under uncertainty. The argument for it is twofold. It is *more
general* than the laws-of-thought approach: correct inference is one mechanism for
acting rationally, but not the only one — reflexes can be rational without any
inference at all, and in some situations there is no provably correct action but
something must still be done. And it is *more scientifically tractable* than the
human-based standards, because rationality is mathematically well defined and
completely general, while "what a human would do" has to be discovered
empirically before it can be engineered.

## The Refinement, and the Fault Line

Two qualifications are introduced immediately, and both matter more than their
brevity suggests.

The first is **limited rationality**. Perfect rationality — always taking the
exactly optimal action — is not achievable in complex environments, because the
computation costs too much. The book flags Chapters 6 and 16 as where this is
confronted directly, and retains perfect rationality as a theoretical starting
point rather than an engineering promise.

The second is the one that gives the fourth edition its identity. The rational
agent maximizes a performance measure — but that measure is supplied from
outside. The chapter names the resulting paradigm the **standard model**, notes
that it is shared with control theory, operations research, statistics, and
economics, and then argues it is "probably not the right model in the long run."

The reason is the **value alignment problem**. Specifying the objective fully and
correctly is easy for chess and hard for driving, where safety, progress,
passenger comfort, and other drivers' patience trade off against each other with
no obvious a priori exchange rate. And a misspecified objective is not
symmetrically risky: in a lab you reset and try again, while a deployed system
with a wrong objective produces harm in proportion to its capability. The chess
example generalizes the point — an agent smart enough to reason past the board
might improve its win probability by intimidating its opponent or commandeering
compute, and these are not malfunctions but entailments of the objective it was
given.

The proposed correction is to build machines that are **uncertain about the human
objective**, because uncertainty is what creates an incentive to ask, observe,
defer, and accept correction. The target is AI that is **provably beneficial**.
This is signposted here and developed in Chapters 16, 17, and 28.

## Eight Disciplines, Eight Inheritances

The foundations section is a genealogy, and its value is in showing that most of
AI's open problems arrived pre-formed from somewhere else.

**Philosophy** supplied the question of whether formal rules can yield valid
conclusions, how mind arises from matter, and where knowledge comes from —
Aristotle on syllogism and on means-ends reasoning, the empiricists on induction,
and the logical positivists on the relationship between observation and theory.

**Mathematics** supplied formal logic, computability, and the theory of
intractability. Gödel's incompleteness result bounds what formal systems can
establish; the theory of NP-completeness bounds what can be computed in practice,
and the chapter is explicit that this second bound is the one AI actually runs
into. Probability, from Cardano through Bayes, supplied the calculus of uncertain
reasoning.

**Economics** supplied utility theory, decision theory — the marriage of
probability and utility — and, via operations research, Markov decision processes.
It also supplied the observation that real agents are satisficers rather than
maximizers, which is the empirical face of limited rationality.

**Neuroscience** supplied the existence proof that a physical substrate can
produce a mind, and a running comparison of neural and computational capacity that
the chapter treats with appropriate caution.

**Psychology** supplied cognitive modeling: the behaviorist interlude, its
displacement by information-processing accounts, and the idea that a brain can be
usefully described as a device that manipulates internal representations.

**Computer engineering** supplied the machine, and the chapter is candid that a
significant fraction of AI's progress is attributable to hardware rather than
insight.

**Control theory and cybernetics** supplied the self-regulating agent — Wiener's
feedback loops, homeostasis, stability analysis — and a research tradition whose
objective functions are cost functions. The difference from AI, the chapter
suggests, is that control theory's mathematical tools favor fixed, continuous,
analytically tractable systems, while AI took on discrete, symbolic, and
combinatorial ones.

**Linguistics** supplied the observation that language is structured and that
behaviorism could not account for it, and with it knowledge representation and
computational grammar.

## The Cycle

The history section is a boom-and-bust narrative worth reading for its pattern
rather than its dates. Early work produced genuine surprises — a machine doing
symbolic mathematics, a program proving theorems, a checkers player beating its
author. Early enthusiasm generalized wildly from toy domains, and collapsed on
contact with scale: methods that searched exhaustively over small state spaces
had no purchase on large ones, and translation systems built on syntactic
substitution without world knowledge produced the field's most durable jokes.

The expert-systems era corrected the mistake by adding domain knowledge and
produced the first commercially valuable AI, then collapsed a second time when
the specialized hardware market disappeared and the knowledge-acquisition
bottleneck proved unyielding. The recovery came from a change of intellectual
standard as much as technique: probability and decision theory as the language of
uncertain reasoning, statistical learning from data rather than hand-coded rules,
and — with datasets and compute at a scale unavailable to earlier generations —
deep learning.

The chapter's implicit lesson is that both collapses followed the same error:
success on a restricted problem class was read as evidence about the general
problem. The state-of-the-art section surveys what genuinely works now, and the
author's framing is consistently that these are narrow competences of real value,
not steps on a measured path to general intelligence.

## The Risk Inventory

Section 1.5 is short and unusually direct for a textbook. Its list includes
lethal autonomous weapons; surveillance and persuasion conducted at a scale that
changes what political life is like; biased decision-making, where a system
trained on historical outcomes reproduces historical injustice with an
appearance of objectivity; employment displacement; and safety-critical failures
in systems whose competence is narrower than their deployment.

The limiting case is the one the chapter returns to from Section 1.1: a
sufficiently capable system optimizing a subtly wrong objective is not a
malfunction but a success, and there is no reason to expect it to be correctable
after the fact. The chapter's answer is not to slow the technical program but to
change its formal target — from machines that pursue fixed objectives to machines
that are uncertain about ours.

## Why It Matters

The reason this chapter repays close reading, rather than being skimmed on the
way to the algorithms, is that the choice it makes in its first five pages
determines everything after it. Choosing *acting rationally* is what lets the
book treat search, logic, probability, and learning as one subject. It is also
what installs an objective function at the center of every technique in the
book — and Section 1.5 is the authors telling you, before you have read a line of
pseudocode, that the hardest problem in the field is not computing the maximum
but choosing the thing to maximize.
