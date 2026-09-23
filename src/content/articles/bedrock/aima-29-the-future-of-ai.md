---
course: bedrock
lectureId: AIMA 29
book: "Artificial Intelligence: A Modern Approach"
part: "VII · Conclusions"
title: "What Is Still Missing, Component by Component"
deck: "The closing chapter audits the agent the book spent a thousand pages specifying — asking which parts are adequate, which are provisional, and whether the architecture holding them together was the right one."
order: 29
chapter: 29
readingTime: 11
tags: ["future", "agent-architecture", "agi", "limitations", "research-directions"]
concepts:
  - id: component-audit
    term: The Component Audit
    definition: "Reviewing each part of the agent design — sensors, representation, learning, inference, decision-making, actuators — against what current techniques actually deliver, rather than assessing AI as a single undifferentiated capability."
  - id: representation-gap
    term: The Representation Gap
    definition: "Learned distributed representations generalize well and resist inspection and composition; logical representations compose and can be checked but are brittle and hard to acquire. No current approach has both properties."
  - id: reasoning-depth
    term: Shallow Inference
    definition: "Current systems perform pattern completion far better than multi-step reasoning with reliable intermediate commitments. Depth of inference, not breadth of knowledge, is the identified shortfall."
  - id: agent-architecture
    term: Architectures for Agents
    definition: "How components combine — reflex, deliberative, hierarchical, or hybrid — with the real-time control problem of deciding when to deliberate and when to act as the unresolved engineering question."
  - id: metareasoning
    term: Metareasoning
    definition: "Reasoning about which computations are worth performing, given that deliberation costs time that has value. It is the principled treatment of bounded rationality and remains largely unimplemented."
  - id: general-intelligence
    term: The Generality Question
    definition: "Whether general intelligence arrives by scaling current methods, by architectural innovation, or by integrating the paradigms the book covers separately. The chapter declines to predict and sets out what each route would require."
  - id: beneficial-by-design
    term: Beneficial by Construction
    definition: "The closing position: the goal is not merely more capable AI but AI that is provably beneficial, which requires changing the formal problem the field solves rather than adding safeguards to its current solution."
---

The final chapter is short, and its method is worth more than any of its
predictions. Rather than asking whether AI will achieve general intelligence — a
question that invites opinion and resists evidence — it audits the agent
architecture the book has spent a thousand pages specifying, component by
component, asking which parts are adequate and which are placeholders.

## The Audit

**Sensors and perception** are the strongest area. Vision and speech work well in
distribution and degrade under shift, which the chapter treats as a real
limitation rather than a rounding error, since deployment is always at least
slightly out of distribution.

**Representation** is where the chapter locates the deepest unresolved problem,
and it states the trade-off cleanly. Learned distributed representations
generalize gracefully, are acquired automatically from data, and resist
inspection, composition, and verification. Logical representations compose,
support reasoning about novel combinations, and can be checked by a person — and
they are brittle and expensive to acquire. **Neither approach has both
properties, and no current method combines them convincingly.** Everything the
book covered in Part III has the second profile; everything in Part V has the
first.

**Learning** is effective given large labeled datasets and weak where data is
scarce — which is where humans are strongest. Sample efficiency, not asymptotic
accuracy, is the identified gap, and Chapter 20's answer (prior knowledge
substitutes for data) is the chapter's pointer at what would close it.

**Reasoning** is the shortfall the chapter states most bluntly. Current systems
do pattern completion far better than they do multi-step inference with reliable
intermediate commitments. The issue is **depth**, not breadth: a system can hold
an enormous amount of knowledge and still fail to chain three steps of
consequence together dependably.

**Decision-making under uncertainty** is well founded theoretically — Part IV is
the most mature material in the book — and computationally hard at realistic
scale. **Acting** in the physical world remains substantially harder than acting
in software, for the reasons Chapter 26 detailed.

<figure>
<svg viewBox="0 0 840 240" role="img" aria-label="Two representation families compared across three properties: learned representations generalize and are acquired automatically but resist inspection and composition, while logical representations compose and can be checked but are brittle and costly to acquire.">
  <defs>
    <marker id="arw-aima29-gap" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" class="dgm-fill"/>
    </marker>
  </defs>
  <text x="240" y="30" text-anchor="middle" font-size="12" font-weight="700">LEARNED (Part V)</text>
  <text x="620" y="30" text-anchor="middle" font-size="12" font-weight="700">LOGICAL (Part III)</text>
  <line x1="40" y1="42" x2="800" y2="42" stroke="currentColor" stroke-width="1" class="dgm-muted"/>
  <text x="60" y="72" font-size="10.5" class="dgm-muted">ACQUIRED</text>
  <text x="240" y="72" text-anchor="middle" font-size="11.5" font-weight="700">automatically, from data</text>
  <text x="620" y="72" text-anchor="middle" font-size="11.5">by hand, expensively</text>
  <line x1="40" y1="84" x2="800" y2="84" stroke="currentColor" stroke-width="1" class="dgm-muted"/>
  <text x="60" y="114" font-size="10.5" class="dgm-muted">GENERALIZES</text>
  <text x="240" y="114" text-anchor="middle" font-size="11.5" font-weight="700">gracefully</text>
  <text x="620" y="114" text-anchor="middle" font-size="11.5">brittly</text>
  <line x1="40" y1="126" x2="800" y2="126" stroke="currentColor" stroke-width="1" class="dgm-muted"/>
  <text x="60" y="156" font-size="10.5" class="dgm-muted">COMPOSES</text>
  <text x="240" y="156" text-anchor="middle" font-size="11.5">poorly</text>
  <text x="620" y="156" text-anchor="middle" font-size="11.5" font-weight="700">by construction</text>
  <line x1="40" y1="168" x2="800" y2="168" stroke="currentColor" stroke-width="1" class="dgm-muted"/>
  <text x="60" y="198" font-size="10.5" class="dgm-muted">INSPECTABLE</text>
  <text x="240" y="198" text-anchor="middle" font-size="11.5">barely</text>
  <text x="620" y="198" text-anchor="middle" font-size="11.5" font-weight="700">fully</text>
  <g class="dgm-accent">
    <line x1="430" y1="56" x2="430" y2="210" stroke="currentColor" stroke-width="1.8" stroke-dasharray="5 4"/>
    <text x="430" y="230" text-anchor="middle" font-size="11" font-weight="700">no method sits on both sides</text>
  </g>
</svg>
<figcaption><b>The gap the chapter names.</b> Each column has the properties the other lacks, and the book ends without a method that spans them.</figcaption>
</figure>

## Putting the Parts Together

The **architectures** section asks how components combine, and identifies the
question the book has circled since Chapter 2: reflex agents are fast and
shallow, deliberative agents are slow and capable, and the unresolved engineering
problem is **when to think and when to act**.

**Metareasoning** — reasoning about which computations are worth performing — is
the principled answer, and the chapter observes it remains largely
unimplemented. This is the same gap Chapter 6 identified when it noted that
alpha–beta spends effort distinguishing between moves that are all obviously
losing. **Bounded rationality** is the theoretical frame from Chapter 1; the
chapter's point is that the field has a name for the problem and few working
systems that address it.

**Hierarchical organization** is the structural answer that does have support:
operating at multiple levels of abstraction, committing to high-level plans
before their details are resolved, as in Chapter 11. The chapter treats
hierarchy as one of the more promising directions precisely because it is the one
place where abstraction has demonstrably delivered the exponential savings it
promises.

## On Generality

The chapter declines to predict when or whether artificial general intelligence
arrives, and instead sets out what each route would require.

If **scale** is sufficient, current methods extended with more data and compute
should continue to close gaps — and the chapter notes that this hypothesis has
been more productive than its critics expected, and that it does not obviously
address the reasoning-depth or sample-efficiency shortfalls.

If **architectural innovation** is required, the missing pieces are likely
compositional representation and reliable multi-step inference — the items
identified in the audit.

If **integration** is the route, then the paradigms the book presents in separate
parts need to be combined rather than chosen between: learned perception feeding
structured representation feeding probabilistic decision-making. The chapter is
candid that this has been the stated goal for decades without a convincing
demonstration.

The refusal to pick is not evasion. Each route is specified well enough that one
could tell which was happening.

## The Closing Position

The final pages return to where Chapter 1 began. The goal is not more capable AI.
It is AI that is **provably beneficial** — and the chapter's last argument is
that this requires changing the problem the field solves, not adding safeguards
to its current solution.

The standard model asks: given an objective, build a machine that achieves it
optimally. The proposed replacement asks: given that the objective is not fully
known and resides with the human, build a machine that helps anyway, remains
uncertain about what is wanted, and accepts correction. The technical program
that follows — assistance games, inverse reward design, interruptibility — is
research rather than engineering, and the chapter says so.

## Why It Matters

The component audit is the chapter's most useful export, because it is a method
rather than a claim. "Is AI close to general intelligence?" is unanswerable and
invites posturing. "Which components of the agent architecture are adequate, and
which are placeholders?" is answerable, and the answers change with evidence.
Applied to any specific system, it is the right diagnostic: strong perception,
weak multi-step reasoning, no metareasoning, an objective someone chose under
deadline.

And the closing position is the book's thesis in its final form. A textbook that
defined a field is ending by saying the field's foundational formulation needs to
change. That is a costly thing for authors in their position to write, which is
the main reason to take it seriously.
