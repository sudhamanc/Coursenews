---
course: human-ai
lectureId: W3
title: "Frameworks for the Frontier: How Designers Map the Human–AI Partnership"
deck: "From an expected-utility equation to speculative fiction, a whole atlas of frameworks decides when machines should act, how much they should learn, and what futures we are building."
order: 3
readingTime: 8
tags: ["frameworks", "autonomy", "collaboration", "speculative-design", "governance"]
concepts:
  - id: expected-utility-framework
    term: Expected Utility Framework
    definition: "A decision model, rooted in Horvitz's mixed-initiative principles, for deciding whether an AI should act automatically or defer to the user by weighing the expected benefit of automation against the cost of interrupting the person."
  - id: interactive-task-learning
    term: Interactive Task Learning (ITL)
    definition: "An approach in which AI learns new tasks from people through natural interaction and demonstration rather than explicit pre-programming; its desiderata stress scalability, ease of teaching, and performance."
  - id: levels-of-autonomy
    term: Levels of AI Autonomy
    definition: "A scale classifying AI systems by how independently they operate, from no assistance at one end to full autonomy at the other, used to decide how much human oversight a task requires."
  - id: the-missing-middle
    term: The Missing Middle
    definition: "The symbiotic zone where humans and machines strengthen each other: people train, explain, and govern AI while AI augments human speed, scale, and insight, rather than one replacing the other."
  - id: cognitive-division-of-labor
    term: Cognitive Division of Labor
    definition: "A model for allocating work between humans and AI according to complementary strengths: machines for processing vast data, humans for interpreting ambiguity and meaning."
  - id: ai-fluency-framework
    term: AI Fluency Framework
    definition: "A tool-agnostic set of four competencies — Delegation, Description, Discernment, and Diligence — for collaborating with AI responsibly and effectively across disciplines."
  - id: speculative-design
    term: Speculative Design
    definition: "A design practice that uses fiction and imagined futures to explore complex 'wicked' problems, opening debate about alternative ways of living rather than predicting a single outcome."
  - id: wicked-problems
    term: Wicked Problems
    definition: "Social or cultural problems with many interdependent factors that make them difficult or impossible to solve definitively, and which speculative design uses to provoke discussion."
---

Ask a designer when an AI should act on its own and when it should stop and ask,
and you have posed one of the hardest questions in the field. Answer it by instinct
and you will be wrong often. Answer it with a **framework** — a structured model of
how humans and machines should share work — and you at least have a map. This week
hands out a whole atlas of them, ranging from a decision rule you can nearly write
as an equation to a design practice that trades entirely in fiction. None is *the*
answer; each is a lens for a different question.

## When Should the Machine Act?

The most quantitative of the lot is the **Expected Utility Framework**, which
descends from Horvitz's principles of mixed-initiative user interfaces. Its central
question is deceptively practical: should the AI act automatically, or involve the
user? The answer is to weigh the expected benefit of acting against the cost of
interrupting someone. Because the system is usually uncertain about what the user
is even trying to do, it reasons over the possible goals $g$ given the evidence $E$
it can observe:

$$
EU(a) = \sum_{g} p(g \mid E)\, u(a, g)
$$

Here $p(g \mid E)$ is the probability of a goal given the evidence, and $u(a, g)$
is the utility of taking action $a$ if that goal is the real one. The system should
automate only when the expected utility of acting exceeds that of waiting by more
than the cost of the interruption. The lesson is subtle: good automation is not
"act whenever you can," but "act when the math says the user is genuinely better
off."

<figure>
<svg viewBox="0 0 780 260" role="img" aria-label="An expected-utility decision: from an uncertain goal the system compares the expected utility of acting against waiting plus the cost of interrupting, then either acts automatically or defers to the user.">
  <defs>
    <marker id="arw-eu" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" class="dgm-fill"/>
    </marker>
  </defs>
  <rect x="20" y="98" width="180" height="72" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="110" y="128" text-anchor="middle" font-size="13" font-weight="700">Uncertain goal</text>
  <text x="110" y="148" text-anchor="middle" font-size="11" class="dgm-muted">infer p(g | E) from evidence</text>
  <line x1="200" y1="134" x2="256" y2="134" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-eu)"/>
  <g class="dgm-accent">
    <rect x="260" y="92" width="230" height="84" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <text x="375" y="126" text-anchor="middle" font-size="14" font-weight="700">EU(act) vs EU(wait)</text>
    <text x="375" y="148" text-anchor="middle" font-size="11">weigh benefit − interruption cost</text>
  </g>
  <path d="M490,116 C525,98 536,92 558,84" fill="none" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-eu)"/>
  <path d="M490,152 C525,170 536,176 558,184" fill="none" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-eu)"/>
  <text x="516" y="96" text-anchor="middle" font-size="10" class="dgm-muted">benefit &gt; cost</text>
  <text x="520" y="176" text-anchor="middle" font-size="10" class="dgm-muted">otherwise</text>
  <rect x="562" y="56" width="196" height="56" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="660" y="82" text-anchor="middle" font-size="13" font-weight="700">Act automatically</text>
  <text x="660" y="100" text-anchor="middle" font-size="11" class="dgm-muted">user is better off</text>
  <rect x="562" y="160" width="196" height="56" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="660" y="186" text-anchor="middle" font-size="13" font-weight="700">Defer to the user</text>
  <text x="660" y="204" text-anchor="middle" font-size="11" class="dgm-muted">don't interrupt</text>
</svg>
<figcaption><b>When should the machine act?</b> Mixed-initiative systems automate only when the expected benefit of acting outweighs the cost of interrupting the person.</figcaption>
</figure>

## Teaching Machines by Showing Them

If the utility framework governs *when* an AI acts, **Interactive Task Learning
(ITL)** governs *how it learns*. Rather than developers pre-programming every task,
ITL lets humans teach an AI new tasks through natural interaction — including simple
demonstration, showing the system how a job is done. The framework's desiderata
describe what an effective ITL system needs: it must scale to many tasks, be easy
for ordinary people to teach, and actually perform. The quiet radicalism here is a
shift in the locus of programming, from the engineer to the end user.

## Ten Rungs of Autonomy

Not every system should be as independent as it can be. The **Levels of AI
Autonomy** frame arranges systems on a scale from Level 1, no AI assistance at all,
up to Level 10, full autonomy. The scale is a design instrument, not a leaderboard:
the goal is to choose the rung that matches the stakes. High autonomy suits
low-stakes, reversible tasks; consequential decisions demand a lower rung and a
firmer human presence. Autonomy, in other words, is something you calibrate, not
something you maximize.

<figure>
<svg viewBox="0 0 800 230" role="img" aria-label="A ten-rung ladder of AI autonomy from Level 1, no AI assistance with full human control, to Level 10, full autonomy with minimal oversight; human oversight falls as AI autonomy rises, and the rung is chosen to match the stakes.">
  <defs>
    <marker id="arw-auton" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" class="dgm-fill"/>
    </marker>
  </defs>
  <text x="400" y="26" text-anchor="middle" font-size="13" font-weight="700">Levels of AI autonomy — calibrate to the stakes</text>
  <line x1="70" y1="52" x2="730" y2="52" stroke="currentColor" stroke-width="1.5" marker-start="url(#arw-auton)"/>
  <text x="400" y="46" text-anchor="middle" font-size="11" class="dgm-muted">more human oversight</text>
  <rect x="60" y="72" width="680" height="46" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <line x1="128" y1="72" x2="128" y2="118" stroke="currentColor" stroke-width="1"/>
  <line x1="196" y1="72" x2="196" y2="118" stroke="currentColor" stroke-width="1"/>
  <line x1="264" y1="72" x2="264" y2="118" stroke="currentColor" stroke-width="1"/>
  <line x1="332" y1="72" x2="332" y2="118" stroke="currentColor" stroke-width="1"/>
  <line x1="400" y1="72" x2="400" y2="118" stroke="currentColor" stroke-width="1"/>
  <line x1="468" y1="72" x2="468" y2="118" stroke="currentColor" stroke-width="1"/>
  <line x1="536" y1="72" x2="536" y2="118" stroke="currentColor" stroke-width="1"/>
  <line x1="604" y1="72" x2="604" y2="118" stroke="currentColor" stroke-width="1"/>
  <line x1="672" y1="72" x2="672" y2="118" stroke="currentColor" stroke-width="1"/>
  <text x="94" y="100" text-anchor="middle" font-size="12" font-weight="700">1</text>
  <text x="162" y="100" text-anchor="middle" font-size="12">2</text>
  <text x="230" y="100" text-anchor="middle" font-size="12">3</text>
  <text x="298" y="100" text-anchor="middle" font-size="12">4</text>
  <text x="366" y="100" text-anchor="middle" font-size="12">5</text>
  <text x="434" y="100" text-anchor="middle" font-size="12">6</text>
  <text x="502" y="100" text-anchor="middle" font-size="12">7</text>
  <text x="570" y="100" text-anchor="middle" font-size="12">8</text>
  <text x="638" y="100" text-anchor="middle" font-size="12">9</text>
  <g class="dgm-accent">
    <rect x="672" y="72" width="68" height="46" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <text x="706" y="100" text-anchor="middle" font-size="12" font-weight="700">10</text>
  </g>
  <line x1="70" y1="140" x2="730" y2="140" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-auton)"/>
  <text x="400" y="158" text-anchor="middle" font-size="11" class="dgm-muted">more AI autonomy</text>
  <text x="94" y="188" text-anchor="middle" font-size="11" font-weight="700">no AI assistance</text>
  <text x="706" y="188" text-anchor="middle" font-size="11" font-weight="700">full autonomy</text>
  <text x="94" y="205" text-anchor="middle" font-size="10" class="dgm-muted">human in control</text>
  <text x="706" y="205" text-anchor="middle" font-size="10" class="dgm-muted">minimal oversight</text>
</svg>
<figcaption><b>Ten rungs of autonomy.</b> The scale is a design instrument, not a leaderboard — high autonomy suits low-stakes, reversible tasks, while consequential decisions demand a lower rung.</figcaption>
</figure>

## The Missing Middle

Several frameworks reject the premise that AI's job is to replace people. **The
"Missing Middle"** names the symbiotic band that automation-versus-labor debates
tend to skip: a zone where humans train, explain, and govern AI while AI augments
human speed, scale, and insight. The **Cognitive Division of Labor** sharpens the
idea into an allocation rule — give machines the work they excel at, processing
vast data and spotting patterns, and give humans the work only they do well,
interpreting ambiguity, context, and meaning. Related models round out the picture:
the *Supermind* view of collective intelligence, in which humans and AI grow smarter
together, and *Roles for AI*, which casts a system as a tool, assistant, peer, or
manager depending on the task. All of them reframe collaboration as a partnership of
different competencies rather than a contest for the same job.

<figure>
<svg viewBox="0 0 800 250" role="img" aria-label="The missing middle: between human-only work and machine-only work lies a collaborative band where humans train, explain, and govern the AI while the AI augments human speed, scale, and insight.">
  <defs>
    <marker id="arw-middle" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" class="dgm-fill"/>
    </marker>
  </defs>
  <text x="400" y="28" text-anchor="middle" font-size="13" font-weight="700">The missing middle</text>
  <rect x="20" y="66" width="150" height="120" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="95" y="118" text-anchor="middle" font-size="14" font-weight="700">Humans</text>
  <text x="95" y="140" text-anchor="middle" font-size="11" class="dgm-muted">ambiguity,</text>
  <text x="95" y="156" text-anchor="middle" font-size="11" class="dgm-muted">context, meaning</text>
  <rect x="630" y="66" width="150" height="120" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="705" y="118" text-anchor="middle" font-size="14" font-weight="700">Machines</text>
  <text x="705" y="140" text-anchor="middle" font-size="11" class="dgm-muted">vast data,</text>
  <text x="705" y="156" text-anchor="middle" font-size="11" class="dgm-muted">scale, patterns</text>
  <line x1="170" y1="126" x2="196" y2="126" stroke="currentColor" stroke-width="1.5"/>
  <line x1="604" y1="126" x2="630" y2="126" stroke="currentColor" stroke-width="1.5"/>
  <g class="dgm-accent">
    <rect x="196" y="66" width="408" height="120" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <text x="400" y="92" text-anchor="middle" font-size="13" font-weight="700">symbiotic zone</text>
  </g>
  <text x="400" y="118" text-anchor="middle" font-size="11">humans train · explain · govern</text>
  <line x1="250" y1="130" x2="550" y2="130" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-middle)"/>
  <line x1="550" y1="152" x2="250" y2="152" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-middle)"/>
  <text x="400" y="176" text-anchor="middle" font-size="11">AI augments speed · scale · insight</text>
  <text x="400" y="212" text-anchor="middle" font-size="11" class="dgm-muted">a partnership of complementary strengths, not a contest for the same job</text>
</svg>
<figcaption><b>The missing middle.</b> Between human-only and machine-only work sits the symbiotic band where each strengthens the other — the zone the replace-the-worker debate skips.</figcaption>
</figure>

## The Four D's of AI Fluency

Where the other frameworks describe systems, the **AI Fluency Framework** describes
*people*. It defines four tool-agnostic competencies — the four D's — that stay
valuable no matter which product is in fashion. **Delegation** is knowing what to
hand to the AI and what to keep. **Description** is communicating intent clearly
enough for the system to act on. **Discernment** is critically evaluating what comes
back rather than trusting it. **Diligence** is using AI responsibly and ethically.
Because the framework trains transferable judgment rather than prompt tricks, it
ages well as the technology churns beneath it.

## Governing the Machine

A designer's atlas would be dangerously incomplete without governance, and the week
supplies it. The **NIST AI Risk Management Framework** offers a structured way to
identify and manage risk across a system's life. A **sociotechnical perspective**
locates bias not in algorithms alone but in the interplay of technology, people,
organizations, and society, and sorts it into systemic, statistical, and human
sources. The **Three Lines of Defense** separate the roles of builders, risk
managers, and auditors so oversight stays independent, while **Effective Challenge**
insists that qualified experts be empowered to question important decisions. Most
sobering is the lens of *extractivism* — the reminder, drawn from the *Anatomy of an
AI System* dissection of a voice assistant, that a simple spoken command conceals
enormous environmental, labor, and data costs. Set against all this, Peter
Morville's **UX Honeycomb** keeps the experience itself honest: to succeed, a product
must be useful, usable, desirable, findable, accessible, credible, and valuable.

## Designing the Not-Yet

The atlas ends by looking forward. **Speculative design** addresses big societal
issues through design, thriving on imagination to open new perspectives on **wicked
problems** — problems so tangled in interdependent factors that they resist any
clean solution. Speculative design is explicitly fiction, but it is fiction used as
a framework: it does not predict one future, it stages debate about alternative ways
of being. Its raw material is **signals** — small innovations, behaviors,
technologies, or social shifts that hint at larger trends. By collecting signals in
the present, designers imagine plausible futures and surface opportunities and risks
before those futures arrive.

## Why It Matters

No single framework is the answer, and treating one as universal is its own kind of
error. Expected utility tells you *when* to act; ITL, *how* to learn; the autonomy
scale, *how far* to trust; the missing middle, *who* does what; AI fluency, *how* to
stay competent; governance, *how* to stay accountable; and speculative design,
*where* it all might lead. The real skill the week is building is neither memorizing
these models nor ranking them, but knowing which lens to pick up for the problem in
front of you.
