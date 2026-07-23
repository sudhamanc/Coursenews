---
course: applied-ai
lectureId: W1
title: "Describe, Learn, Explain: The Three Waves of Artificial Intelligence"
deck: "DARPA's three-wave history reframes AI's past and future — and explains why the newest systems must justify themselves before science and industry will trust them."
order: 1
readingTime: 9
tags: ["ai-history", "darpa", "three-waves", "explainability", "science-and-technology"]
concepts:
  - id: three-waves-of-ai
    term: The Three Waves of AI
    definition: "DARPA's framework describing AI's evolution through three eras — handcrafted knowledge that describes, statistical methods that learn, and contextual systems that explain."
  - id: first-wave
    term: First Wave (Handcrafted Knowledge)
    definition: "Rule-based, logic-driven systems whose behavior is explicitly programmed by humans; capable of reasoning within narrow domains but unable to learn or adapt from data."
  - id: second-wave
    term: Second Wave (Statistical Learning)
    definition: "Data-centric AI — chiefly machine learning, neural networks, and deep learning — that learns patterns from large datasets but often cannot explain its decisions."
  - id: third-wave
    term: Third Wave (Contextual Adaptation)
    definition: "AI that pairs learning with reasoning and transparency, producing systems that can explain and adapt while partnering with humans on decisions."
  - id: definition-of-ai
    term: Definition of AI
    definition: "The field dedicated to advancing algorithms that can perceive, reason, act, and react by executing complex, intelligent tasks — spanning both learning and knowledge-based methods."
  - id: science-technology-cycle
    term: Science & Technology (S&T) Cycle
    definition: "The loop in which funding supports research, research yields discoveries, and society benefits through products, services, and ideas — a data-rich arena for applied AI."
---

Artificial intelligence did not arrive in a single thunderclap of invention. It
came in waves — three of them, according to a now-influential framing from
DARPA, the U.S. Defense Advanced Research Projects Agency. Each wave solved a
problem the previous one could not, and each left behind a limitation that the
next was built to overcome. Understanding those waves is the fastest way to make
sense of a peculiar modern paradox: why a system can draft a flawless essay yet
still fail to say *why* it wrote what it did — and why that missing "why" is now
reshaping how AI enters the worlds of science and industry.

## What We Talk About When We Talk About AI

Before charting the waves, the lecture pauses on a deceptively hard question:
what is AI at all? Russell and Norvig, in their canonical textbook, famously
offer not one definition but several, each stressing a different facet —
thinking versus acting, human-like versus rational. The course adopts a working
synthesis: **AI is the field dedicated to advancing algorithms that can perceive,
reason, act, and react by executing complex tasks.** The phrase repays attention.
"Complex tasks" — also called *intelligent* or *complex reasoning* tasks — is
doing the heavy lifting, and the terms *AI techniques* and *AI methods* are used
interchangeably, spanning both machine learning and knowledge- or content-based
approaches. AI, in other words, is not a synonym for neural networks. It is a
broad field, and the three waves are its biography.

<figure>
<svg viewBox="0 0 820 200" role="img" aria-label="The three waves of AI as a left-to-right progression: the first wave describes, the second learns, the third explains.">
  <defs>
    <marker id="arw-waves" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" class="dgm-fill"/>
    </marker>
  </defs>
  <rect x="20" y="45" width="180" height="95" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="110" y="72" text-anchor="middle" font-size="12">First Wave</text>
  <text x="110" y="100" text-anchor="middle" font-size="20" font-weight="700">Describe</text>
  <text x="110" y="124" text-anchor="middle" font-size="11" class="dgm-muted">transparent · brittle</text>
  <line x1="204" y1="92" x2="316" y2="92" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-waves)"/>
  <rect x="320" y="45" width="180" height="95" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="410" y="72" text-anchor="middle" font-size="12">Second Wave</text>
  <text x="410" y="100" text-anchor="middle" font-size="20" font-weight="700">Learn</text>
  <text x="410" y="124" text-anchor="middle" font-size="11" class="dgm-muted">powerful · opaque</text>
  <line x1="504" y1="92" x2="616" y2="92" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-waves)"/>
  <g class="dgm-accent">
    <rect x="620" y="45" width="180" height="95" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <text x="710" y="72" text-anchor="middle" font-size="12">Third Wave</text>
    <text x="710" y="100" text-anchor="middle" font-size="20" font-weight="700">Explain</text>
    <text x="710" y="124" text-anchor="middle" font-size="11">adaptive · accountable</text>
  </g>
  <text x="410" y="176" text-anchor="middle" font-size="11" class="dgm-muted">each wave overcomes the limitation of the one before it</text>
</svg>
<figcaption><b>The three waves.</b> DARPA's arc runs from handcrafted rules that <em>describe</em>, to statistical models that <em>learn</em>, to contextual systems that <em>explain</em> — the third wave restoring the transparency the second gave up.</figcaption>
</figure>

## The First Wave: Machines That Describe

DARPA labels the first wave with a single verb: **describe**. These were
rule-based systems and logic-driven methods, in which engineers explicitly
programmed the rules and algorithms meant to simulate aspects of learning and
intelligence. Because a human authored every rule, a first-wave system could
reason capably within a narrow, well-defined domain — and it was transparent
almost by construction, since its logic could be read off the page.

Its limitation was equally fundamental: it was not data-driven, and it could not
adapt or learn from new information. Interestingly, the lecture observes that the
*ideas* for large language models were already present in this era; what was
missing was the data and the compute to make them learn. The first wave could
describe the world, but only in the words a human had already given it.

## The Second Wave: Machines That Learn

Then the world changed. The **second wave** is data-centric AI — machine
learning, and above all neural networks and deep learning. Rather than being told
the rules, these systems infer them from vast quantities of data. The good news,
as the lecture puts it bluntly, is that never before were AI agents so accurate
and so powerful.

The bad news is a discomfort that now defines the field: humans are uneasy about
*not* making decisions and *not* understanding the decisions an AI system makes
on their behalf. The very move that bought accuracy — learning a tangle of
statistical patterns instead of following legible rules — cost the field its
transparency. The second wave learns brilliantly, but it struggles to explain
itself.

## The Third Wave: Machines That Explain

The **third wave** is DARPA's answer to that discomfort: contextual adaptation
paired with transparency. Its ambition is competent automated decision agents
that can not only act but also justify their reasoning. The relationship it
imagines is a partnership: AI processes enormous volumes of data and proposes
recommendations, while humans review those recommendations and take the final
action. For that partnership to work, the AI must be transparent and able to
explain why it reached a conclusion. Human and machine become collaborators in
decision-making rather than a person and an oracle.

## AI Enters the Science-and-Technology Cycle

The lecture grounds this arc in a concrete arena: the **science and technology
cycle**. In its simplest telling, government funds research, scientists and
engineers make discoveries, and people benefit through useful products,
services, and ideas — money in, knowledge out, value returned. It is a cycle
unusually rich in data and full of users actively seeking solutions, which makes
it fertile ground for third-wave AI.
<figure>
<svg viewBox="0 0 680 300" role="img" aria-label="The science and technology cycle as a loop: funding supports research, research yields discoveries, discoveries benefit society, and returned value renews the funding.">
  <defs>
    <marker id="arw-st" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" class="dgm-fill"/>
    </marker>
  </defs>
  <rect x="95" y="40" width="150" height="60" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="170" y="76" text-anchor="middle" font-size="14" font-weight="700">Funding</text>
  <rect x="435" y="40" width="150" height="60" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="510" y="76" text-anchor="middle" font-size="14" font-weight="700">Research</text>
  <rect x="435" y="200" width="150" height="60" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="510" y="236" text-anchor="middle" font-size="14" font-weight="700">Discoveries</text>
  <rect x="95" y="200" width="150" height="60" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="170" y="228" text-anchor="middle" font-size="14" font-weight="700">Society</text>
  <text x="170" y="247" text-anchor="middle" font-size="11" class="dgm-muted">products · services</text>
  <line x1="245" y1="70" x2="431" y2="70" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-st)"/>
  <text x="338" y="60" text-anchor="middle" font-size="11" class="dgm-muted">funds</text>
  <line x1="510" y1="100" x2="510" y2="196" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-st)"/>
  <text x="548" y="153" text-anchor="middle" font-size="11" class="dgm-muted">yields</text>
  <line x1="431" y1="230" x2="249" y2="230" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-st)"/>
  <text x="340" y="220" text-anchor="middle" font-size="11" class="dgm-muted">benefits</text>
  <line x1="170" y1="200" x2="170" y2="104" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-st)"/>
  <text x="132" y="153" text-anchor="middle" font-size="11" class="dgm-accent">value returned</text>
</svg>
<figcaption><b>The S&amp;T cycle.</b> Money funds research, research yields discoveries, discoveries benefit society, and the returned value renews the funding — a data-rich loop the third wave aims to make transparent.</figcaption>
</figure>
Consider literature reviews, which sit at the starting point of nearly all
research. An explainable system that surfaces the *right* prior work — and shows
*why* each study is relevant — could cut duplicated effort, save researchers'
time, and build trust in a way an opaque black box never could. The same
transparent, competent agents could sharpen budgeting, program design,
curriculum development, and impact prediction. Organizations that hold
proprietary scientific data and forge alliances with academia and government are
positioned to turn the S&T cycle into something more transparent, efficient, and
user-centered — but only if the AI at its heart can be understood.

## Why It Matters

The three-wave story is not merely history; it is a map of trade-offs.
First-wave systems were transparent but brittle. Second-wave systems are powerful
but opaque. The third wave's wager is that we can keep the power while restoring
the transparency — that a machine can be both accurate *and* accountable. That
wager matters most exactly where the stakes are highest. In the
science-and-technology cycle, a recommendation that cannot explain itself is a
recommendation few researchers, funders, or regulators will act on. The machines
of the first wave could describe. The second wave taught them to learn. The third
asks them to explain — and only then earns the right to be trusted.
