---
course: bedrock
lectureId: AIMA 15
book: "Artificial Intelligence: A Modern Approach"
part: "IV · Uncertain Knowledge and Reasoning"
title: "Six Axioms, and Then You Have No Choice but a Utility Function"
deck: "Chapter 15 completes the rational agent. Probability says what is likely; utility says what is wanted; and a theorem says that anyone whose preferences are merely coherent is already behaving as though maximizing an expected utility — whether they know it or not."
order: 15
chapter: 15
readingTime: 13
tags: ["utility", "decision-theory", "value-of-information", "risk", "preferences"]
concepts:
  - id: meu
    term: Maximum Expected Utility
    definition: "The principle that a rational agent chooses the action maximizing EU(a | e) = Σ_s P(Result(a) = s | a, e) U(s). It is the formal statement of 'do the right thing' that the whole book has been building toward."
  - id: von-neumann-morgenstern
    term: The Six Preference Axioms
    definition: "Orderability, transitivity, continuity, substitutability, monotonicity, and decomposability. Together they imply the existence of a utility function whose expectation the agent's preferences maximize — a representation theorem, not an assumption about psychology."
  - id: money-utility
    term: Utility Is Not Money
    definition: "Empirically, utility of wealth is roughly logarithmic, so the same monetary amount matters less as wealth rises. Curvature gives risk aversion; the certainty equivalent is the sure amount equal in utility to a gamble, and the insurance premium is the gap."
  - id: normative-vs-descriptive
    term: Normative vs. Descriptive
    definition: "Decision theory prescribes what a coherent agent should do; humans systematically deviate via the certainty effect, ambiguity aversion, framing, and anchoring. The axioms are not falsified by this — they define coherence rather than describe behavior."
  - id: multiattribute
    term: Multiattribute Utility
    definition: "When outcomes vary along several dimensions, strict dominance rarely applies but stochastic dominance often does. Preference independence conditions justify an additive value function, reducing an exponential elicitation problem to a linear one."
  - id: decision-network
    term: Decision Networks
    definition: "A Bayesian network augmented with rectangular decision nodes and a diamond utility node. Evaluation sets each decision value, propagates, computes expected utility, and returns the maximizing action."
  - id: voi
    term: The Value of Information
    definition: "The expected improvement in decision quality from observing a variable before deciding. It is never negative, it is zero when the information cannot change the action, and it is the formal justification for gathering evidence."
  - id: unknown-preferences
    term: Unknown Preferences and the Off-Switch
    definition: "When the utility function is uncertain rather than given, deference becomes rational: a machine uncertain about human preferences prefers to allow itself to be switched off, because the human's intervention is evidence about what is actually wanted."
---

Probability theory tells an agent what is likely. It does not tell it what to do,
because what to do depends on what it wants. Chapter 15 supplies the second half
and, in doing so, completes the definition of rationality the book opened with.

## The Principle

The **principle of maximum expected utility** states that a rational agent
chooses the action $a$ maximizing

$$EU(a \mid \mathbf{e}) = \sum_{s'} P(\textit{Result}(a) = s' \mid a, \mathbf{e}) \, U(s')$$

This is the formalization of "do the right thing" from Chapter 1. Each outcome's
utility is weighted by its probability, and the best action is the one with the
highest weighted sum.

Stated flatly, it invites the objection that it presumes too much — that no agent
has a real-valued utility over every outcome. The chapter's response is the most
intellectually satisfying argument in Part IV.

## The Representation Theorem

Do not assume a utility function. Assume only that the agent has *preferences*
over lotteries satisfying six constraints:

**Orderability** — for any two outcomes, the agent prefers one or is indifferent;
it cannot decline to have a preference. **Transitivity** — if $A \succ B$ and
$B \succ C$ then $A \succ C$. **Continuity** — if $A \succ B \succ C$, there is
some probability $p$ making a lottery between $A$ and $C$ exactly as good as $B$.
**Substitutability** — indifferent outcomes are interchangeable inside larger
lotteries. **Monotonicity** — if $A \succ B$, a lottery giving higher probability
to $A$ is preferred. **Decomposability** — compound lotteries can be flattened
into simple ones with multiplied probabilities.

The von Neumann–Morgenstern theorem: any preference relation satisfying these
axioms can be represented by a real-valued utility function, unique up to
positive affine transformation, such that the agent prefers $A$ to $B$ exactly
when $U(A) > U(B)$, and prefers the lottery with higher expected utility.

This is a **representation theorem**, and its logic deserves emphasis. It does
not claim agents have utility functions in their heads. It claims that an agent
whose preferences are merely coherent is *describable* as maximizing one, whether
or not any such quantity is represented anywhere. The force of the result is in
the converse: violate the axioms and you become exploitable. Intransitive
preferences permit a money pump — a cycle of trades you accept at every step that
returns you to where you started, poorer.

This is the same argumentative structure as Chapter 12's Dutch book, and together
they are the book's foundational case: coherent belief is probability, coherent
preference is utility, and their combination is expected utility maximization.
Not because it is convenient, but because the alternatives lose money on purpose.

## What Utility Functions Look Like

Utility is not money, and the difference is where the interesting behavior lives.

Empirically the utility of wealth is approximately **logarithmic**: the same
absolute gain matters less the more you already have. Curvature yields **risk
aversion** — preferring a sure $500 to a coin flip between $0 and $1000. The
**certainty equivalent** is the guaranteed amount that would be accepted in place
of a gamble, and the difference between a gamble's expected value and its
certainty equivalent is the **insurance premium**, which is how insurance can be
profitable while benefiting both parties: their utility curves differ.

Risk-seeking behavior appears in the convex region, notably for agents already
deep in losses — which the chapter notes is relevant to failing organizations
and gamblers behind on the night.

The **normative versus descriptive** discussion is handled without
condescension. Humans violate the axioms systematically: the **Allais paradox**
shows the certainty effect, **Ellsberg's** shows ambiguity aversion (preferring
known odds to unknown ones, which no utility function explains), and framing and
anchoring effects show that presentation changes stated preferences. The chapter's
position is that decision theory is **normative** — a theory of what coherence
requires — and that human deviation is a fact about humans, not a refutation.
It is also why a system designed to *elicit* preferences must be careful: the
numbers people give depend on how they are asked.

## Many Attributes

Real decisions vary along many dimensions — cost, time, risk, noise, disruption.

**Strict dominance** (better on every attribute) settles matters when it applies
and rarely applies. **Stochastic dominance** is the more useful relation: if the
cumulative distribution of one option lies everywhere below another's, it is
preferred for any monotonic utility function, and this can often be established
from qualitative structure alone without eliciting numbers.

When trade-offs are unavoidable, the elicitation problem is exponential — a
utility over $n$ attributes with $d$ values each has $d^n$ entries. Structure
rescues it. **Preference independence** between attributes, and its
multi-attribute generalization, justify an **additive value function**

$$V(x_1, \ldots, x_n) = \sum_i w_i V_i(x_i)$$

which requires only $n$ single-attribute functions and $n$ weights. The chapter is
clear that additivity is an approximation and that interaction effects are real,
while noting that additive models are usually close enough to rank options
correctly.

## Decision Networks

A **decision network** extends a Bayesian network with two node types: rectangular
**decision nodes** for the agent's choices, and a diamond **utility node** whose
parents are the attributes determining the outcome's value. Chance nodes remain
ovals.

Evaluation is mechanical: for each possible value of the decision node, set it,
propagate the evidence through the network, compute the expected utility at the
utility node, and return the action with the maximum. This is Chapter 13's
inference machinery plus one maximization, and it makes the design of a rational
decision procedure a modeling exercise rather than a programming one.

## What It Is Worth to Find Out

The **value of information** is, for an application-minded reader, the most
valuable section in the chapter.

The value of perfect information about a variable $E_j$ is the expected utility
of the best decision made after observing it, averaged over the possible
observations, minus the expected utility of the best decision made now:

$$VPI(E_j) = \Big(\sum_{e_{jk}} P(e_{jk} \mid \mathbf{e}) \, EU(\alpha_{e_{jk}} \mid \mathbf{e}, e_{jk})\Big) - EU(\alpha \mid \mathbf{e})$$

Three properties follow, and each is practically important. VPI is **never
negative** — information cannot hurt in expectation, though a particular
observation certainly can. It is **zero when the information cannot change the
decision**, which is the criterion that separates useful investigations from
expensive ones. And it is **not additive** — the value of two observations is
generally less than the sum of their individual values, because they overlap.

<figure>
<svg viewBox="0 0 820 240" role="img" aria-label="Two decision situations: when the options are far apart in expected utility, learning a variable rarely changes the choice and information is worth little; when the options are nearly tied, the same information often flips the decision and is worth a great deal.">
  <defs>
    <marker id="arw-aima15-voi" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" class="dgm-fill"/>
    </marker>
  </defs>
  <text x="200" y="28" text-anchor="middle" font-size="12" font-weight="700">OPTIONS FAR APART</text>
  <line x1="60" y1="130" x2="340" y2="130" stroke="currentColor" stroke-width="1.3"/>
  <rect x="86" y="96" width="46" height="34" class="dgm-fill"/>
  <text x="109" y="150" text-anchor="middle" font-size="10.5">A</text>
  <rect x="252" y="56" width="46" height="74" class="dgm-fill"/>
  <text x="275" y="150" text-anchor="middle" font-size="10.5">B</text>
  <text x="200" y="176" text-anchor="middle" font-size="10.5" class="dgm-muted">evidence rarely flips the ranking</text>
  <text x="200" y="198" text-anchor="middle" font-size="11.5" font-weight="700">VPI ≈ 0</text>
  <text x="200" y="222" text-anchor="middle" font-size="10.5" class="dgm-muted">do not pay for the test</text>
  <g class="dgm-accent">
    <text x="620" y="28" text-anchor="middle" font-size="12" font-weight="700">OPTIONS NEARLY TIED</text>
    <line x1="480" y1="130" x2="760" y2="130" stroke="currentColor" stroke-width="1.3"/>
    <rect x="506" y="68" width="46" height="62" class="dgm-fill"/>
    <text x="529" y="150" text-anchor="middle" font-size="10.5">A</text>
    <rect x="672" y="62" width="46" height="68" class="dgm-fill"/>
    <text x="695" y="150" text-anchor="middle" font-size="10.5">B</text>
    <text x="620" y="176" text-anchor="middle" font-size="10.5">evidence often flips the ranking</text>
    <text x="620" y="198" text-anchor="middle" font-size="11.5" font-weight="700">VPI is large</text>
    <text x="620" y="222" text-anchor="middle" font-size="10.5">the test is worth buying</text>
  </g>
  <line x1="352" y1="130" x2="468" y2="130" stroke="currentColor" stroke-width="1.2" stroke-dasharray="4 3"/>
</svg>
<figcaption><b>What information is worth.</b> The value of an observation has nothing to do with how interesting it is and everything to do with whether it could change what you do.</figcaption>
</figure>

A **myopic** information-gathering agent repeatedly computes VPI for each
available observation, takes the one with the best value-minus-cost, and stops
when none is worth its price. It is not optimal — it ignores the value of
combinations — and it is a sensible default.

## When You Do Not Know What Is Wanted

The final section is where the fourth edition's thesis reaches its technical
form. Everything above assumes $U$ is given. Suppose instead the agent is
**uncertain about the human's utility function** and holds a distribution over
possible utilities.

The consequence is that **deference becomes rational**. In the off-switch
analysis, a machine that is uncertain about human preferences prefers to allow
itself to be switched off, because a human reaching for the switch is *evidence*
about what is actually wanted — evidence the machine should want to incorporate.
A machine certain of its objective has the opposite incentive: it will resist
being switched off, since being switched off scores badly against the objective
it is certain of.

The uncertainty is not a defect to be engineered away. It is the thing generating
the safe behavior, and Chapter 17's assistance games formalize it.

## Why It Matters

This chapter completes the rational agent and is the precise point where the
book's thesis becomes load-bearing. Utility functions are everywhere in deployed
systems under other names — loss functions, reward models, ranking objectives,
engagement metrics — and each is a claim about what is wanted, usually made by
whoever had to ship something.

The two most useful exports are VPI and the off-switch argument. VPI gives a
principled answer to whether an experiment, a test, or an additional data source
is worth its cost: only if it could change the decision. And the off-switch
analysis shows that corrigibility is not a constraint bolted onto an optimizing
agent but a *consequence* of building the objective correctly — which is why it
belongs in a chapter on decision theory rather than in an ethics appendix.
