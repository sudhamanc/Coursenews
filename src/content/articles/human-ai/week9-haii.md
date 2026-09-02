---
course: human-ai
lectureId: W9
title: "The Quarrel at the Root of the Machine"
deck: "Week 9 goes back seventy years to find that the field's central argument — build a machine that replaces us, or one that thinks alongside us — was framed by three men within a decade of each other, and that the third warned the first two they could not have both intelligence and obedience."
order: 9
readingTime: 14
tags: ["history", "symbiosis", "alignment", "darpa", "governance"]
concepts:
  - id: imitation-game
    term: The Imitation Game
    definition: "Turing's 1950 proposal to replace the unanswerable question of whether a machine thinks with an observable one: whether an interrogator can distinguish its responses from a human's. Intelligence is assessed from external behavior, not internal reasoning."
  - id: child-machine
    term: The Child-Machine
    definition: "Turing's suggestion to build a simple system that learns through education and experience rather than programming an adult mind directly — accepting that its teacher may remain largely ignorant of what is going on inside."
  - id: man-computer-symbiosis
    term: Man–Computer Symbiosis
    definition: "Licklider's 1960 model of a close partnership in which humans set goals, form hypotheses, and judge results while computers retrieve, calculate, simulate, and visualize. It rejects both the machine-as-tool and the human-as-spare-part."
  - id: subservience-dilemma
    term: The Subservience–Intelligence Dilemma
    definition: "Wiener's warning that complete subservience and complete intelligence do not go together: a system that learns and adapts will behave in ways its designers did not anticipate, so rising autonomy necessarily erodes complete control."
  - id: sorcerers-apprentice
    term: The Sorcerer's Apprentice Problem
    definition: "A machine executing stated instructions faithfully while missing the intention behind them, producing literal compliance and disastrous results — Wiener's 1960 framing of what the field now calls the alignment problem."
  - id: darpa-three-waves
    term: DARPA's Three Waves
    definition: "Handcrafted knowledge (expert rules, reliable but unable to learn), statistical learning (patterns from data, powerful at perception but brittle and opaque), and the proposed contextual adaptation (systems that model, explain, and generalize from few examples)."
  - id: foundation-models
    term: Foundation Models
    definition: "Systems trained at scale on broad data to predict patterns such as the next token, developing general representations that adapt to many downstream tasks — a shift within statistical learning that shows early third-wave characteristics."
  - id: intellectual-capital
    term: The Intellectual Capital Model
    definition: "Stu Card's observation that public research funding produced not just individual technologies but the communities and trained researchers that corporate labs later drew on — the part industry cannot replace on its own."
  - id: containment-problem
    term: The Containment Problem
    definition: "Suleyman's argument that as capable models become cheaper, smaller, and locally runnable, dangerous capabilities proliferate faster than institutions can build safeguards — and that treating governance as an arms race makes the outcome worse."
---

The pattern in Week 9 is that nearly every argument the field is now having in
public was already on paper by 1960. Alan Turing proposed that machines might
replicate human intellectual performance outright. J.C.R. Licklider proposed that
they should instead form a partnership with people, each contributing what it does
best. Norbert Wiener, watching both, warned that the ambition underneath them was
incoherent: you cannot build a machine that is genuinely intelligent and also
completely under your control. Seventy years later the field has produced systems
that are simultaneously an answer to Turing, a vindication of Licklider, and a
demonstration of Wiener's point.

## Before There Was a Field

The intellectual groundwork stretches back much further. Aristotle's syllogisms —
all humans are mortal, Socrates is human, therefore Socrates is mortal —
established that a conclusion could be derived mechanically from premises, the
conceptual seed of symbolic logic and rule-based systems. Pascal's Pascaline (1642)
mechanized addition and subtraction; Leibniz's Stepped Reckoner extended that to
multiplication and division, and Leibniz went further, imagining a formal calculus
in which disputes could be settled by computation. In the 1830s Babbage designed
the Analytical Engine, a general-purpose machine sequenced by punched cards, and
Ada Lovelace saw what he had partly missed — that the machine could manipulate
symbols rather than only numbers — and wrote an algorithm for it. Programmability
and general-purpose computation entered the record a century before there was
hardware to run them.

## Turing's Wager

Turing's 1950 paper *Computing Machinery and Intelligence* made a move that is
still doing work in every product demo. Rather than define thinking, he replaced
the question with a test: if an interrogator conversing through text cannot
reliably tell machine from human, the machine is behaviorally equivalent within
that test. This shifted the evaluation of intelligence from internal mechanism to
external performance — which is exactly why a modern language model can be
convincing without understanding, and why transparency, trust, and accountability
remain unresolved. Successful imitation was defined as sufficient, and we have been
living with that definition ever since.

He also anticipated the shape of modern machine learning with the **child-machine**:
rather than programming an adult mind, build something simpler that learns through
education, feedback, reward, and punishment. Turing accepted the consequence
plainly — its teacher might remain "largely ignorant of quite what is going on
inside." The black box was not an accident of deep learning. It was in the original
proposal.

The paper's second half systematically dismantles objections to machine
intelligence: theological (thinking requires a soul), the "heads in the sand" appeal
(the consequences are too frightening to contemplate), the mathematical objection
from Gödel (formal systems have limits — but so do humans), the argument from
consciousness (which Turing showed collapses into solipsism, since we infer other
minds from behavior too), arguments from disability (machines will never be kind or
creative — an improper generalization from the machines of 1950), and Lady
Lovelace's objection that machines can only do what we tell them. To that last one
Turing gave the answer that has aged best: machines surprise their creators
constantly, because programmers cannot anticipate every consequence of their own
instructions.

## Licklider's Counter-Proposal

The 1956 Dartmouth workshop, where McCarthy coined *artificial intelligence*, set
the field's founding metaphor — the machine as a model of the human mind — and its
founding claim, that every feature of intelligence can in principle be described
precisely enough for a machine to simulate it. McCarthy's LISP (1958) became the
language of symbolic AI for three decades; Arthur Samuel's checkers program, which
beat him in 1962, showed a machine learning past its creator and gave the field the
term *machine learning*; Rosenblatt's perceptron opened the neural line of attack
that Minsky and Papert's 1969 critique would close for over a decade.

Licklider's 1960 *Man-Computer Symbiosis* went the other way. He described
symbiosis as the living together in intimate association of two dissimilar
organisms, and defined it against two alternatives he rejected: **mechanically
extended humans**, where the machine is a tool like a spade or a lens and the human
supplies all initiative, and **humanly extended machines**, where the human is
reduced to performing whatever the designers have not yet automated. His evidence
was personal and devastating — he audited his own working life and found that
roughly **85% of his "thinking" time went to getting into a position to think**:
searching, calculating, organizing, plotting. The division of labor follows
directly. Humans set goals, form hypotheses, define criteria, judge, and handle the
unexpected; computers retrieve, calculate, simulate, analyze, and visualize.

<figure>
<svg viewBox="0 0 860 320" role="img" aria-label="Three positions on the human-machine relationship arranged as a triangle: Turing's replication vision, Licklider's partnership vision, and Wiener's warning that intelligence and obedience are incompatible, with modern generative AI sitting in the middle.">
  <defs>
    <marker id="arw-w9-tri" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" class="dgm-fill"/>
    </marker>
  </defs>
  <rect x="30" y="34" width="250" height="96" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="155" y="58" text-anchor="middle" font-size="13" font-weight="700">TURING · 1950</text>
  <text x="155" y="80" text-anchor="middle" font-size="11.5">the machine replicates us</text>
  <text x="155" y="99" text-anchor="middle" font-size="10.5" class="dgm-muted">judge it by behavior, not mechanism</text>
  <text x="155" y="118" text-anchor="middle" font-size="10.5" class="dgm-muted">a child-machine that learns</text>
  <rect x="580" y="34" width="250" height="96" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="705" y="58" text-anchor="middle" font-size="13" font-weight="700">LICKLIDER · 1960</text>
  <text x="705" y="80" text-anchor="middle" font-size="11.5">the machine partners with us</text>
  <text x="705" y="99" text-anchor="middle" font-size="10.5" class="dgm-muted">humans set goals and judge</text>
  <text x="705" y="118" text-anchor="middle" font-size="10.5" class="dgm-muted">computers retrieve and compute</text>
  <g class="dgm-accent">
    <rect x="305" y="212" width="250" height="90" class="dgm-soft" stroke="currentColor" stroke-width="1.7"/>
    <text x="430" y="236" text-anchor="middle" font-size="13" font-weight="700">WIENER · 1960</text>
    <text x="430" y="258" text-anchor="middle" font-size="11.5">you cannot have both</text>
    <text x="430" y="277" text-anchor="middle" font-size="10.5">complete subservience and</text>
    <text x="430" y="294" text-anchor="middle" font-size="10.5">complete intelligence</text>
  </g>
  <rect x="330" y="60" width="200" height="60" fill="none" stroke="currentColor" stroke-width="1.3" stroke-dasharray="4 3"/>
  <text x="430" y="84" text-anchor="middle" font-size="11.5" font-weight="700">generative AI</text>
  <text x="430" y="104" text-anchor="middle" font-size="10.5" class="dgm-muted">mimicry in training, symbiosis in use</text>
  <line x1="282" y1="88" x2="326" y2="88" stroke="currentColor" stroke-width="1.4" marker-end="url(#arw-w9-tri)"/>
  <line x1="578" y1="88" x2="534" y2="88" stroke="currentColor" stroke-width="1.4" marker-end="url(#arw-w9-tri)"/>
  <line x1="430" y1="124" x2="430" y2="206" stroke="currentColor" stroke-width="1.4" stroke-dasharray="5 4" marker-end="url(#arw-w9-tri)"/>
  <text x="155" y="164" text-anchor="middle" font-size="10.5" class="dgm-muted">learns the statistics of human output</text>
  <text x="705" y="164" text-anchor="middle" font-size="10.5" class="dgm-muted">works best with a human in the frame</text>
  <text x="430" y="192" text-anchor="middle" font-size="10.5" class="dgm-muted">and inherits the unresolved question</text>
</svg>
<figcaption><b>The three positions.</b> Modern systems are trained by mimicry and used symbiotically, which means they sit between Turing and Licklider — and squarely inside the tension Wiener identified.</figcaption>
</figure>

Mustafa Suleyman's *personal intelligence* — an individualized companion acting as
a chief of staff who is "in your corner" — is the same argument in contemporary
dress: expand a person's capacity rather than substitute for it.

## Wiener's Objection

Wiener's 1960 paper is the one that refuses to let either vision rest. "Complete
subservience and complete intelligence do not go together." A system that learns
from experience and adapts its strategy will, by construction, sometimes do things
its designers did not foresee; the more capable it becomes, the harder complete
control is to maintain. His illustration is the Sorcerer's Apprentice and the
Monkey's Paw — the request granted exactly as stated, with catastrophic fidelity to
the letter and none to the intent. That is the alignment problem, named in 1960 and
still open: how do you keep an autonomous system's behavior consistent with human
goals and values that cannot be fully specified in advance?

The synthesis the lecture arrives at is that generative AI is not a resolution but
a hybrid. **Mimicry in training** — models learn statistical patterns from vast
collections of human output and generate by predicting likely continuations.
**Symbiosis in use** — they work best when people frame the goal, supply context,
evaluate results, and refine. As these systems move from prompt-response tools to
agents that plan and act over many steps, the question stops being how capable they
can be and becomes how much agency they should have, and what human oversight can
still mean at machine speed.

## Three Waves, and Where We Actually Are

DARPA's framework organizes the technical history by how systems represent
knowledge. The **first wave**, handcrafted knowledge, encodes expert rules: reliable
logical reasoning inside narrow domains such as tax preparation and logistics, but
no capacity to learn, adapt, or handle uncertainty. The **second wave**, statistical
learning, learns patterns from data and transformed perception — speech recognition,
image classification, translation — while lacking contextual understanding, failing
unpredictably despite high aggregate accuracy, and remaining open to adversarial
manipulation (imperceptible perturbations turning a panda into a gibbon) and
maladaptation (Microsoft's Tay, corrupted within a day). The **third wave**,
contextual adaptation, is a proposal rather than a description: systems that build
explanatory models, transfer knowledge across situations, and learn from few
examples — first-wave reasoning fused with second-wave learning.

<figure>
<svg viewBox="0 0 860 250" role="img" aria-label="DARPA's three waves shown left to right: handcrafted knowledge, statistical learning, and the proposed contextual adaptation, with foundation models positioned as a bridge between the second and third.">
  <defs>
    <marker id="arw-w9-wave" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" class="dgm-fill"/>
    </marker>
  </defs>
  <rect x="24" y="40" width="240" height="104" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="144" y="64" text-anchor="middle" font-size="12.5" font-weight="700">FIRST WAVE</text>
  <text x="144" y="84" text-anchor="middle" font-size="11.5">handcrafted knowledge</text>
  <text x="144" y="106" text-anchor="middle" font-size="10.5" class="dgm-muted">reasons reliably in narrow domains</text>
  <text x="144" y="126" text-anchor="middle" font-size="10.5" class="dgm-muted">cannot learn or handle novelty</text>
  <rect x="310" y="40" width="240" height="104" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="430" y="64" text-anchor="middle" font-size="12.5" font-weight="700">SECOND WAVE</text>
  <text x="430" y="84" text-anchor="middle" font-size="11.5">statistical learning</text>
  <text x="430" y="106" text-anchor="middle" font-size="10.5" class="dgm-muted">perceives; classifies; translates</text>
  <text x="430" y="126" text-anchor="middle" font-size="10.5" class="dgm-muted">brittle, opaque, adversarially fragile</text>
  <g class="dgm-accent-2">
    <rect x="596" y="40" width="240" height="104" fill="none" stroke="currentColor" stroke-width="1.5" stroke-dasharray="5 4"/>
    <text x="716" y="64" text-anchor="middle" font-size="12.5" font-weight="700">THIRD WAVE</text>
    <text x="716" y="84" text-anchor="middle" font-size="11.5">contextual adaptation</text>
    <text x="716" y="106" text-anchor="middle" font-size="10.5">explains, generalizes, learns from few</text>
    <text x="716" y="126" text-anchor="middle" font-size="10.5">proposed — not yet achieved</text>
  </g>
  <line x1="266" y1="92" x2="306" y2="92" stroke="currentColor" stroke-width="1.4" marker-end="url(#arw-w9-wave)"/>
  <line x1="552" y1="92" x2="592" y2="92" stroke="currentColor" stroke-width="1.4" marker-end="url(#arw-w9-wave)"/>
  <g class="dgm-accent">
    <rect x="390" y="176" width="330" height="52" class="dgm-soft" stroke="currentColor" stroke-width="1.7"/>
    <text x="555" y="198" text-anchor="middle" font-size="11.5" font-weight="700">foundation models</text>
    <text x="555" y="217" text-anchor="middle" font-size="10.5">second-wave machinery showing early third-wave behavior</text>
  </g>
  <path d="M470 144 L470 172" fill="none" stroke="currentColor" stroke-width="1.3" marker-end="url(#arw-w9-wave)"/>
  <path d="M690 144 L690 172" fill="none" stroke="currentColor" stroke-width="1.3" stroke-dasharray="4 3" marker-end="url(#arw-w9-wave)"/>
</svg>
<figcaption><b>Where the current generation sits.</b> Foundation models are second-wave statistical machinery that has begun to display the adaptability the third wave was meant to deliver — which is why the wave boundary is now contested rather than clean.</figcaption>
</figure>

Foundation models are the reason that boundary is blurred. Trained at scale to
predict patterns such as the next token, they develop representations adaptable to
many tasks rather than the one they were built for, and as scale increased —
GPT-2 to GPT-3 being the lecture's example — capabilities appeared that nobody
explicitly programmed. Natural language became the interface, so directing a
computer no longer required programming it.

Licklider's prerequisites map onto this almost line by line. He wanted **time-sharing**
so expensive computation could be distributed dynamically; we built cloud GPU
infrastructure. He wanted **memory organized for retrieval by pattern rather than
sequential search**; we built embeddings and vector databases that retrieve by
semantic similarity. He wanted a **desk-surface display and control** intuitive
enough to draw and write with; we built conversational and multimodal interfaces.
He asked for a lightning calculator, a mnemonic wizard, and a precise draftsman.
That is a fair description of what shipped.

## The Risks the History Predicts

Four concerns follow. **The democratization of danger**: as models become smaller,
cheaper, and locally runnable, the expertise required for cyber, chemical, or
biological harm falls, and decentralized access makes monitoring impractical. The
problem is not that powerful AI exists but that capability spreads faster than
safeguards. **Societal and democratic disruption**: cheap synthetic media erodes
shared truth faster than corrections travel, and unlike earlier automation — which
displaced tasks while creating new categories of work — AI extends into cognitive
roles broadly enough that even augmented human labor may be uneconomic, with
consequences for education, employment, taxation, and distribution. **The
mathematical limits**: systems that are "statistically impressive but individually
unreliable" find correlation without understanding, fail confidently in ways that
look irrational, and can be manipulated or corrupted. **And the alignment problem**,
which is Wiener's warning restated with a larger budget.

## Who Paid for This

The final section makes an argument that is easy to miss and hard to unsee: almost
nothing in modern computing was created by industry alone. Sutherland's Sketchpad
(1963, Air Force and NSF) demonstrated direct manipulation; ARPA-funded Pygmalion
research gave computing the *icon*; Engelbart's team at SRI built the mouse with
ARPA, NASA, and Air Force support; university work by Alan Kay and others shaped
the window systems Xerox PARC commercialized; publicly funded hypertext research
fed the Web that Berners-Lee built at CERN, with Mosaic emerging from the
University of Illinois; toolkits such as CMU's Garnet and Amulet, and an interface
builder developed at the publicly funded INRIA before it reached NeXT, made
graphical interfaces buildable at all.

Stu Card's point is that the funding produced more than artifacts — it produced
**intellectual capital**: the research communities and trained people that Xerox,
IBM, and AT&T later drew on. Brad Myers's warning follows: industry cannot replace
that role, and without sustained support for foundational academic work, fewer
researchers are trained and fewer long-horizon ideas ever get the chance to become
transformative. DARPA, founded in 1958 after Sputnik to prevent and produce
strategic surprise, institutionalized the model — seedlings for speculative ideas,
explorations for emerging opportunities, and prize challenges that attract
unconventional entrants — aiming to move a technology "from disbelief to mere
doubt." The Grand Challenges are the proof: in 2004 no vehicle finished the ~142-mile
desert course and the best managed 7.3 miles; in 2005, five vehicles completed a
132-mile route. One year, and a field went from failure to feasibility.

Governance is now the harder problem, shaped by a triad — a handful of frontier
companies controlling the infrastructure, open-source communities distributing
capability outside centralized safeguards, and nation-states responsible for safety
and regulation. Suleyman argues for precautionary governance and points to the EU AI
Act as risk-based regulation done proactively, but his sharper claim concerns the
arms race itself: assuming your competitor will be reckless gives you a reason to
weaken your own safeguards, which produces exactly the race to the bottom everyone
claims to fear. The framing is self-fulfilling.

## Why It Matters

Week 8 asked what a system infers about you. Week 9 asks who decided the system
should exist in that form at all, and finds that the decision was made in an
argument that never concluded. That matters practically, because the choice is
still live in every product. When you design an AI feature, you are choosing a
position: Turing's, if the goal is to perform the task so well the human becomes
unnecessary; Licklider's, if the goal is to give a person back the 85% of their time
spent getting ready to think. Wiener's contribution is the constraint on both — the
more autonomy you grant, the less your oversight is worth, and the gap between what
you asked for and what you meant is where the harm lives. The history is not
background. It is the design space, and it has been mapped for sixty years.
