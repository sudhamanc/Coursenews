---
course: bedrock
lectureId: AIMA 20
book: "Artificial Intelligence: A Modern Approach"
part: "V · Machine Learning"
title: "The Learner That Already Knows Something"
deck: "Chapter 19's learner starts from nothing every time. Chapter 20 asks what changes when it starts from what it already knows — and shows that prior knowledge does not merely speed learning up, it changes how many examples are needed at all."
order: 20
chapter: 20
readingTime: 12
tags: ["inductive-logic", "explanation-based-learning", "relevance", "prior-knowledge", "ilp"]
concepts:
  - id: logical-learning
    term: The Logical Formulation of Learning
    definition: "Learning as search for a hypothesis satisfying Hypothesis ∧ Descriptions ⊨ Classifications. Candidate elimination maintains the version space — the set of all hypotheses consistent with the examples so far — bounded by its most general and most specific members."
  - id: cumulative-learning
    term: Cumulative Learning
    definition: "Learning where prior knowledge participates in the inference rather than sitting alongside it, so each new concept makes the next one easier to acquire — as opposed to starting from a blank hypothesis space every time."
  - id: entailment-constraints
    term: The Three Entailment Constraints
    definition: "Inductive learning (Background ∧ Hypothesis ∧ Descriptions ⊨ Classifications), explanation-based learning (where the background alone already entails the classifications), and relevance-based learning (where background plus a relevance statement does)."
  - id: ebl
    term: Explanation-Based Learning
    definition: "Constructing an explanation of a single example from existing knowledge, then generalizing that explanation into a rule. It derives nothing logically new — it converts slow derivation into fast lookup, which is speedup learning rather than knowledge acquisition."
  - id: rbl
    term: Relevance-Based Learning
    definition: "Using functional dependencies — statements that one set of attributes determines another — to justify generalizing from very few examples. Determinations constrain the hypothesis space, and a smaller space means lower sample complexity."
  - id: ilp
    term: Inductive Logic Programming
    definition: "Learning first-order rules, including recursive ones, from examples and background knowledge. It can express relational concepts that attribute-value learners cannot, and it produces hypotheses stated in human-readable logic."
  - id: ilp-methods
    term: Top-Down and Inverse Resolution
    definition: "FOIL-style top-down search specializes a general rule by adding literals guided by an information gain measure; inverse resolution runs resolution backwards to construct hypotheses that would have entailed the observations, and can invent new predicates."
  - id: sample-complexity-reduction
    term: Why Knowledge Reduces Data Requirements
    definition: "Prior knowledge shrinks the hypothesis space. Since PAC bounds grow with the log of hypothesis-space size, a constrained space needs fewer examples — so knowledge and data are substitutes, not merely complements."
---

Chapter 19's learners are amnesiac. Each one begins with a hypothesis space and a
pile of examples, and nothing it learned yesterday helps today. Chapter 20 asks
what a learner that already knows things can do differently, and the answer is
sharper than "converge faster": prior knowledge changes **how many examples are
required**, sometimes reducing the requirement to one.

## Learning as Logical Search

The logical framing casts learning as finding a hypothesis satisfying

$$\textit{Hypothesis} \wedge \textit{Descriptions} \models \textit{Classifications}$$

The hypothesis, together with the examples' attribute descriptions, must entail
their labels.

The **current-best-hypothesis** approach maintains a single hypothesis and
repairs it as examples arrive: **generalize** on a false negative — an example
the hypothesis wrongly excludes — and **specialize** on a false positive. The
weakness is backtracking: a repair made early may prove wrong much later, with no
record of the alternatives.

**Candidate elimination** fixes that by maintaining the entire **version space**
— all hypotheses consistent with the data so far — represented compactly by two
boundaries: the most general consistent hypotheses ($G$) and the most specific
($S$). Each example shrinks the space from one side or the other. The algorithm
is elegant and its limits are honest: it has no noise tolerance whatsoever, since
a single mislabeled example collapses the version space to empty, and the
boundary sets can grow unmanageably.

The value of the formulation is conceptual. It makes explicit that learning is
constrained search through a hypothesis space, that the space's structure
determines what is learnable, and — once background knowledge enters the
entailment — that knowledge and data play the same role.

## Three Ways Knowledge Enters

The chapter's organizing move is to write down the entailment constraint for
three distinct kinds of knowledge-using learning.

**Inductive learning** with background knowledge:

$$\textit{Background} \wedge \textit{Hypothesis} \wedge \textit{Descriptions} \models \textit{Classifications}$$

**Explanation-based learning**, where the background *already* entails the
classifications:

$$\textit{Background} \models \textit{Classifications}$$

**Relevance-based learning**, where background plus a relevance statement does
the work.

The value of this taxonomy is that it separates learning that adds genuinely new
information from learning that reorganizes information already possessed — a
distinction that most discussions of learning blur.

## Explanation-Based Learning

**EBL** is the second case, and it is initially puzzling. If the background
knowledge already entails the classification, what is being learned?

The answer: not facts, but **speed**. The procedure is to construct an
explanation — a proof — of why a single training example has its label, using
existing knowledge, then generalize that proof by replacing constants with
variables, and store the generalized rule.

A system that knows the laws of arithmetic can derive that $1 \times X = X$, but
deriving it each time is slow. Having seen one instance, EBL constructs the proof,
generalizes it, and caches the rule. Nothing logically new has been acquired —
the rule was entailed all along — but a slow derivation has become a fast lookup.

This is **speedup learning**, and the chapter is careful about its economics.
Storing more rules means more time spent matching them against situations, so
indiscriminate caching *degrades* performance. The **utility problem** — deciding
which generalizations are worth retaining — is the central difficulty, and it is
a real one: an EBL system can learn itself into being slower than it started.

The connection worth drawing is to memoization and to the compilation of
declarative specifications into procedures. EBL is what happens when a system
notices it has done this reasoning before.

## Relevance-Based Learning

**RBL** uses **determinations**: functional dependencies stating that one set of
attributes determines another. Knowing that nationality determines language, a
single example — one Brazilian speaking Portuguese — licenses the general
conclusion about Brazilians. Without that knowledge, one example is worthless.

The formal significance is the connection to Chapter 19's theory. A determination
**restricts the hypothesis space** to hypotheses consistent with it, and PAC
sample complexity grows with the log of hypothesis space size. So a determination
*provably* reduces the number of examples needed.

This is the chapter's most important theoretical point, and it deserves stating
plainly: **prior knowledge and training data are substitutes**. Knowledge that
constrains the hypothesis space buys the same thing more examples would have
bought. This is why domain expertise remains valuable in a data-rich era, and why
architectural priors — convolution's translation invariance, attention's
relational structure — matter in Chapter 22.

<figure>
<svg viewBox="0 0 820 240" role="img" aria-label="Two hypothesis spaces: a large unconstrained space requiring many examples to identify the target, and a smaller space constrained by prior knowledge in which few examples suffice.">
  <defs>
    <marker id="arw-aima20-space" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" class="dgm-fill"/>
    </marker>
  </defs>
  <text x="190" y="28" text-anchor="middle" font-size="12" font-weight="700">NO PRIOR KNOWLEDGE</text>
  <ellipse cx="190" cy="108" rx="140" ry="62" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="190" y="96" text-anchor="middle" font-size="10.5" class="dgm-muted">hypothesis space</text>
  <circle cx="232" cy="128" r="6" class="dgm-fill"/>
  <text x="252" y="132" font-size="10" class="dgm-muted">target</text>
  <text x="190" y="198" text-anchor="middle" font-size="11">N grows with log |H|</text>
  <text x="190" y="222" text-anchor="middle" font-size="11" font-weight="700">many examples needed</text>
  <line x1="352" y1="106" x2="404" y2="106" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-aima20-space)"/>
  <text x="378" y="94" text-anchor="middle" font-size="9.5" class="dgm-muted">add a</text>
  <text x="378" y="128" text-anchor="middle" font-size="9.5" class="dgm-muted">determination</text>
  <text x="620" y="28" text-anchor="middle" font-size="12" font-weight="700">WITH PRIOR KNOWLEDGE</text>
  <ellipse cx="620" cy="108" rx="140" ry="62" fill="none" stroke="currentColor" stroke-width="1.3" stroke-dasharray="4 4" class="dgm-muted"/>
  <g class="dgm-accent">
    <ellipse cx="632" cy="116" rx="52" ry="30" class="dgm-soft" stroke="currentColor" stroke-width="1.8"/>
    <circle cx="646" cy="124" r="6" class="dgm-fill"/>
    <text x="620" y="198" text-anchor="middle" font-size="11">knowledge shrinks |H|</text>
    <text x="620" y="222" text-anchor="middle" font-size="11" font-weight="700">few examples suffice</text>
  </g>
</svg>
<figcaption><b>Why knowledge substitutes for data.</b> Sample complexity is driven by the size of the space you are searching, so anything that rules out hypotheses in advance is worth some number of training examples.</figcaption>
</figure>

## Inductive Logic Programming

**ILP** is the chapter's most ambitious contribution: learning **first-order**
rules — including recursive ones — from examples plus background knowledge.

The expressive gain over attribute-value learning is real. A decision tree
learner sees each example as a flat feature vector and literally cannot represent
"$X$ is an ancestor of $Y$ if $X$ is a parent of $Z$ and $Z$ is an ancestor of
$Y$," because the concept is relational and recursive. ILP learns exactly such
rules, and the output is human-readable logic — a genuinely interpretable
hypothesis rather than a post-hoc explanation of one.

Two method families are presented. **Top-down** approaches like FOIL start from a
maximally general clause and add literals to specialize it, guided by an
information-gain measure adapted to the first-order setting, covering positive
examples while excluding negatives. **Inverse resolution** runs Chapter 9's
resolution backwards: given the observations, construct clauses that would have
entailed them. Its most remarkable capability is **predicate invention** —
generating a new predicate not present in the vocabulary because the hypothesis
requires an intermediate concept. A system that names something nobody told it
about is doing something that deserves the word discovery.

ILP has produced publishable results in molecular biology and protein structure
prediction, where the relational structure is intrinsic and the readability of
the learned rules is what makes them scientifically useful.

The limitation is search cost. The first-order hypothesis space is vast, and ILP
systems need strong language bias and background knowledge to be tractable —
which is the chapter's theme reappearing as its own constraint.

## Why It Matters

This chapter is the least fashionable in Part V and contains its most durable
argument. The dominant paradigm learns everything from data and encodes almost no
prior knowledge, which works when data is abundant and fails precisely where it
is not — rare diseases, novel materials, low-resource languages, expensive
experiments.

The chapter's theoretical result is the one to keep: knowledge shrinks the
hypothesis space, and a smaller hypothesis space provably needs fewer examples.
That is why architectural inductive bias works, why pretraining functions as
prior knowledge for downstream tasks, and why encoding a known physical
constraint into a model beats hoping it will be learned.

The ILP material is also the book's clearest example of learning that produces an
**inspectable** hypothesis. A learned first-order rule can be read, checked
against domain knowledge, argued with, and corrected. That property has become
scarce, and the reasons this line of work is difficult are worth understanding
before concluding it was abandoned for good reasons.
