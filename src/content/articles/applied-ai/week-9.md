---
course: applied-ai
lectureId: W9
title: "Whose Values Should a Machine Hold?"
deck: "When there is no agreed-upon right answer, alignment splinters into three problems — universal ethics, pluralistic consensus, and the private preferences of a single decision-maker."
order: 9
readingTime: 11
tags: ["ai-alignment", "machine-ethics", "pluralism", "decision-making", "ethics"]
concepts:
  - id: ai-alignment
    term: AI Alignment
    definition: "The problem of making AI systems act in accordance with human values — which fractures immediately because humans do not agree on what those values are."
  - id: pluralistic-alignment
    term: Pluralistic Alignment
    definition: "Designing and evaluating AI to represent diverse human values through three framings: Overton (present all reasonable views), steerable (adjust to a chosen value system), and distributional (match a population's answers)."
  - id: decision-maker-alignment
    term: Decision-Maker Alignment
    definition: "Aligning an AI to the values and cognitive traits — such as risk tolerance — of one individual, and only when no objectively optimal decision is available."
  - id: machine-ethics
    term: Machine Ethics
    definition: "The attempt to encode moral reasoning into machines, complicated by the absence of any human consensus on how to tell right from wrong."
  - id: ethical-frameworks
    term: Competing Ethical Frameworks
    definition: "The rival moral theories a machine might implement — consequentialism (judge outcomes), deontology (follow duties), and virtue ethics (cultivate character)."
  - id: implementation-approaches
    term: Top-Down, Bottom-Up, and Hybrid
    definition: "The three ways to build a moral machine: encode rules in advance, learn behavior from data, or combine explicit constraints with learned mechanisms."
  - id: evaluating-moral-machines
    term: Evaluating Moral Machines
    definition: "The hard problem of judging ethical AI, approached by testing against benchmarks, formally proving compliance, or falling back on informal case studies."
---

Ask three people to buy health insurance for the coming year and you will get
three different answers — not because two of them are wrong, but because there is
no single right one. This lecture used exactly that scenario to open a difficult
subject: how do we align artificial intelligence with human values when humans
themselves cannot agree on what is good? The answer that emerged was not a single
target but a hierarchy of them. Alignment, it turns out, is really three problems
stacked on top of one another — universal ethics, the consensus of many, and the
preferences of one — and confusing them is a recipe for building systems that
satisfy no one.

## Three Scales of Alignment

The lecture drew the landscape as nested regions. At the broadest scale sits
**machine ethics** — the attempt to give machines universal moral principles. Around
it lies **AI alignment**, concerned with a pluralistic consensus of human values.
And at the finest grain sits **decision-maker alignment**, tuned to a single
person. The insight is that these are not competitors but *layers*: universal
principles set a non-negotiable floor ("do no harm"), pluralistic consensus adapts
to cultural and social context, and individual attributes personalize the last
mile. A system that treats every value as equally fixed — or equally flexible —
collapses under the contradictions. The design task is to declare, explicitly,
which values are fixed, which are flexible, and which are individual.

<figure>
<svg viewBox="0 0 620 288" role="img" aria-label="Three nested scales of alignment: machine ethics is the outermost universal layer, AI alignment sits inside it as pluralistic consensus, and decision-maker alignment is the innermost single-person layer.">
  <rect x="30" y="24" width="560" height="248" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="310" y="46" text-anchor="middle" font-size="14" font-weight="700">Machine ethics</text>
  <text x="310" y="64" text-anchor="middle" font-size="10" class="dgm-muted">universal principles · a fixed floor</text>
  <rect x="95" y="82" width="430" height="158" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="310" y="104" text-anchor="middle" font-size="14" font-weight="700">AI alignment</text>
  <text x="310" y="122" text-anchor="middle" font-size="10" class="dgm-muted">pluralistic consensus · flexible</text>
  <g class="dgm-accent">
    <rect x="196" y="140" width="228" height="82" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <text x="310" y="174" text-anchor="middle" font-size="13" font-weight="700">Decision-maker</text>
    <text x="310" y="194" text-anchor="middle" font-size="10">one person · individual traits</text>
  </g>
</svg>
<figcaption><b>Three scales of alignment</b> Universal principles set a non-negotiable floor, pluralistic consensus adapts to context, and decision-maker alignment personalizes the last mile — nested layers, not competitors.</figcaption>
</figure>

## Pluralism, Formalized

What does it actually mean to align to *many* people at once? Sorensen and
colleagues offer three concrete framings of **pluralistic alignment**. *Overton
pluralism* asks the model to present the full range of reasonable viewpoints
rather than picking one. *Steerable pluralism* asks that the model be adjustable —
able to adopt a particular value system on request. *Distributional pluralism*
asks the model's answers to match the answer distribution of a specific
population, which can be framed as minimizing the divergence

$$
\min_{\theta}\; \mathrm{KL}\!\big(p_{\text{pop}}(y \mid x) \,\Vert\, p_\theta(y \mid x)\big).
$$

Each framing is legitimate; each implies a different training target and a
different notion of success. "Universal" alignment, by contrast, seeks one answer
for everyone — and the lecture was frank that this default usually collapses into
the preferences of whoever labeled the data.

## The Person in the Loop: Decision-Maker Alignment

**Decision-maker alignment (DMA)** is the sharpest departure from general
alignment, and it applies only under a specific condition: when no optimal
decision is reachable. In a clean, rational environment with an obvious best
choice, every agent — human or algorithm — would pick it, and there would be
nothing to align to. It is precisely under uncertainty, time pressure, and limited
resources that people fall back on **cognitive attributes** such as risk tolerance,
and their choices diverge.

The lecture made this concrete with three synthetic actors choosing a health plan,
distinguished by a risk-aversion parameter $A$. *Aleks* is maximally risk-averse
($A = 1$) and buys the plan that hedges against the worst case; *Chad* is
risk-neutral ($A = 0$) and buys the cheapest, betting he will need little care;
*Brie* sits between them ($A = 0.5$) and picks the middle option. A standard way to
read that parameter is a risk-adjusted utility,

$$
U(x) = \mathbb{E}[x] - \tfrac{A}{2}\,\mathrm{Var}(x),
$$

where a larger $A$ penalizes uncertainty more heavily. DMA asks an algorithm to
learn and match *that* trait, not some population average — which is why it is more
personalized than any other layer, and why it differs from general alignment's aim
at broad societal norms.

## No Agreed-Upon Good

Underneath all of this sits the uncomfortable core: **the ethics problem**. There
is no human consensus on right and wrong, and the major moral frameworks pull in
different directions. *Consequentialism* judges an action by its outcomes and tries
to maximize aggregate utility — roughly $\max \sum_i u_i$ — but measuring and
summing utility across people is notoriously hard. *Deontology* follows fixed rules
or duties, yet rules conflict and cannot anticipate every case. *Virtue ethics*
focuses on character and human flourishing — Aristotle's *eudaimonia* — while
cultural and normative practice supplies yet another standard. Every framework is
principled; every one breaks down somewhere when applied to a real decision.

<figure>
<svg viewBox="0 0 760 214" role="img" aria-label="Competing ethical frameworks: one action is judged three different ways — by its outcomes, by fixed duties, and by character.">
  <defs>
    <marker id="arw-ethmap" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" class="dgm-fill"/>
    </marker>
  </defs>
  <g class="dgm-accent">
    <rect x="24" y="80" width="126" height="56" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <text x="87" y="106" text-anchor="middle" font-size="14" font-weight="700">One action</text>
    <text x="87" y="124" text-anchor="middle" font-size="10">which lens?</text>
  </g>
  <line x1="150" y1="104" x2="356" y2="46" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-ethmap)"/>
  <line x1="150" y1="108" x2="356" y2="108" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-ethmap)"/>
  <line x1="150" y1="112" x2="356" y2="170" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-ethmap)"/>
  <rect x="360" y="22" width="378" height="48" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="549" y="42" text-anchor="middle" font-size="13" font-weight="700">Consequentialism</text>
  <text x="549" y="60" text-anchor="middle" font-size="10" class="dgm-muted">judge the outcomes · maximize utility</text>
  <rect x="360" y="84" width="378" height="48" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="549" y="104" text-anchor="middle" font-size="13" font-weight="700">Deontology</text>
  <text x="549" y="122" text-anchor="middle" font-size="10" class="dgm-muted">follow fixed duties &amp; rules</text>
  <rect x="360" y="146" width="378" height="48" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="549" y="166" text-anchor="middle" font-size="13" font-weight="700">Virtue ethics</text>
  <text x="549" y="184" text-anchor="middle" font-size="10" class="dgm-muted">cultivate character · eudaimonia</text>
</svg>
<figcaption><b>Competing ethical frameworks</b> Consequentialism weighs outcomes, deontology follows duties, and virtue ethics cultivates character — each principled, each breaking down somewhere on a real decision.</figcaption>
</figure>

## Top-Down, Bottom-Up, or Both

Given a framework, how do you build the machine? The lecture laid out three
**implementation approaches**. *Top-down* systems encode rules agreed before
construction — Asimov's laws are the archetype — but rules are rigid, they
conflict, and any required agreement leaves someone out. *Bottom-up* systems are
data-driven, learning moral patterns from human behavior, often via reinforcement
learning — but then *whose* values are learned, and what happens when values change?
*Hybrid* systems combine explicit constraints with learned mechanisms, at the cost
of great complexity and the need to decide, per action and per domain, which mode
governs. The *Trimorphic Taxonomy* of Tolmeijer and colleagues organizes exactly
this space — asking which ethical theory is used, which methodology (top-down,
bottom-up, or hybrid), and which kind of AI system — and concludes that machine
ethics is advancing but still far from a robust artificial moral agent.

<figure>
<svg viewBox="0 0 760 244" role="img" aria-label="Three ways to build a moral machine: top-down encodes rules first, bottom-up learns behavior from data, and hybrid combines explicit constraints with learned mechanisms.">
  <defs>
    <marker id="arw-ethimpl" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" class="dgm-fill"/>
    </marker>
  </defs>
  <text x="125" y="28" text-anchor="middle" font-size="13" font-weight="700">Top-down</text>
  <rect x="40" y="44" width="170" height="46" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="125" y="72" text-anchor="middle" font-size="12">Rules &amp; duties</text>
  <line x1="125" y1="90" x2="125" y2="168" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-ethimpl)"/>
  <rect x="40" y="172" width="170" height="46" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="125" y="200" text-anchor="middle" font-size="12">Behavior</text>
  <text x="380" y="28" text-anchor="middle" font-size="13" font-weight="700">Bottom-up</text>
  <rect x="295" y="44" width="170" height="46" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="380" y="72" text-anchor="middle" font-size="12">Learned morals</text>
  <line x1="380" y1="172" x2="380" y2="92" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-ethimpl)"/>
  <rect x="295" y="172" width="170" height="46" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="380" y="200" text-anchor="middle" font-size="12">Behavior data</text>
  <text x="635" y="28" text-anchor="middle" font-size="13" font-weight="700">Hybrid</text>
  <rect x="560" y="40" width="150" height="40" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="635" y="65" text-anchor="middle" font-size="11">Constraints</text>
  <line x1="635" y1="80" x2="635" y2="104" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-ethimpl)"/>
  <g class="dgm-accent">
    <rect x="560" y="108" width="150" height="40" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <text x="635" y="133" text-anchor="middle" font-size="12" font-weight="700">Behavior</text>
  </g>
  <line x1="635" y1="188" x2="635" y2="152" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-ethimpl)"/>
  <rect x="560" y="188" width="150" height="40" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="635" y="213" text-anchor="middle" font-size="11">Learning</text>
</svg>
<figcaption><b>Building a moral machine</b> Top-down encodes rules before construction, bottom-up learns morals from behavior, and hybrid fuses explicit constraints with learned mechanisms.</figcaption>
</figure>

## Judging the Moral Machine

Even a well-built moral machine must be evaluated, and here the ground gives way.
There is no measurable "ground truth" for morality the way there is for physical
quantities. The survey the class read outlines three families of methods. *Test*
compares decisions against a benchmark of correct behavior — but benchmarks drawn
from non-experts inherit cultural bias, experts disagree, and laws miss everyday
morality. *Prove* verifies compliance formally, through model checkers or logical
proof, valid only relative to premises someone had to choose. *Informal* evaluation
falls back on illustrative case studies or mere "face validity," judging results
"reasonable" without a clear standard for what that means. Each method buys some
confidence and quietly imports its own assumptions.

## Why It Matters

The temptation in AI ethics is to search for the one correct value system and
install it. This lecture's quiet argument is that no such system exists, and that
pretending otherwise is itself a failure mode — it smuggles the labelers' values in
under the banner of universality. The more honest architecture is layered: fixed
constraints where we truly agree, pluralistic representation where reasonable
people differ, and personalization where only the individual's own judgment can
decide. That design is harder to build and harder to evaluate, but it matches the
shape of the problem. As these systems move into hospitals, courts, and insurance
markets, the decisive question is shifting from *can the model choose?* to *whose
values did it choose by?* — and making that choice visible, rather than hidden, may
be the most important safeguard of all.
