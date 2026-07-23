---
course: human-ai
lectureId: W1
title: "Mirror or Partner? The Opening Question of Human–AI Interaction"
deck: "A new field asks not what machines can do, but how people and intelligent systems should think, work, and decide together."
order: 1
readingTime: 6
tags: ["human-ai-interaction", "hci", "augmentation", "agency", "collaboration"]
concepts:
  - id: human-ai-interaction
    term: Human–AI Interaction (HAII)
    definition: "The study and design of how people and AI systems work together, spanning AI capabilities and agents, collaboration frameworks, explainability and trust, safety and privacy, and the research methods of human-computer interaction."
  - id: automation-vs-augmentation
    term: Automation vs. Augmentation
    definition: "Two competing goals for AI design: automation seeks to replace human labor, while augmentation seeks to expand human capability. Most design choices fall somewhere on the line between them."
  - id: human-agency
    term: Human Agency
    definition: "The degree to which people stay in control of outcomes when working with AI, taking on roles as decision-makers, supervisors, or collaborators rather than passive recipients of automated output."
  - id: mixed-initiative-systems
    term: Mixed-Initiative Systems
    definition: "Interfaces in which humans and AI share control of a task, each taking the lead when best suited, instead of the machine acting alone or the person doing all the work."
  - id: mirror-or-partner
    term: Mirror or Partner
    definition: "The framing that AI is at once a mirror of our past, trained on data and decisions already made, and a prediction engine that shapes the choices we make next."
---

For most of computing's history, the machine waited. It sat behind a menu or a
blinking prompt and did exactly — and only — what it was told. That machine is
disappearing. Today's artificial intelligence reasons through problems, drafts
prose, recommends decisions, and negotiates the multi-step workflows that once
belonged entirely to people. In the process it has quietly rewritten the central
question of software design. The old question was technical: *what can the system
compute?* The new question is human: *how should people and intelligent systems
think, work, and decide together?* That question is the whole subject of Human–AI
Interaction, and it is where this course opens.

## Five Pillars of a New Discipline

Human–AI Interaction (HAII) is the offspring of a much older field,
human-computer interaction, grown up in an age when the computer can talk back.
The course frames the discipline around five foundational areas. The first is the
**evolution of AI capabilities and agents** — the arc from simple automation
toward autonomous and semi-autonomous systems that can act on a user's behalf.
The second is **frameworks for human-AI collaboration**, the models that describe
how a partnership between person and machine can actually work. The third is
**explainability, trust, and error management**: whether a system can account for
itself, and what happens when it is wrong. The fourth is **safety, privacy, and
emerging risks** — the ethics, data concerns, and unintended consequences that
trail any powerful technology. The fifth is **HCI research methodology**, the
theories and methods that let designers study these interactions rigorously
rather than guessing.

Taken together, the pillars insist on a shift in emphasis. The point is not to
catalog what AI can do, but to design experiences that let humans and systems
work together effectively, responsibly, and transparently.

## Automation or Augmentation?

The first fork in the road is a choice of purpose. An AI system can be built to
**automate** — to take a task off human hands entirely — or to **augment** — to
expand what a person is capable of. Automation aims to replace human labor;
augmentation aims to amplify human capability.

The distinction sounds academic until you notice that it decides almost
everything downstream. A tool designed to replace a radiologist looks nothing
like one designed to make a radiologist sharper. Most real systems live somewhere
on the spectrum between the two poles, and where a design lands is a values
decision as much as a technical one. Choosing augmentation over automation is a
statement about what human work is for.

<figure>
<svg viewBox="0 0 780 180" role="img" aria-label="A horizontal axis running from automation, which replaces human labor, on the left to augmentation, which amplifies human capability, on the right; most real systems fall somewhere along the line between the two poles.">
  <defs>
    <marker id="arw-augaxis" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" class="dgm-fill"/>
    </marker>
  </defs>
  <line x1="70" y1="90" x2="710" y2="90" stroke="currentColor" stroke-width="1.5" marker-start="url(#arw-augaxis)" marker-end="url(#arw-augaxis)"/>
  <text x="120" y="62" text-anchor="middle" font-size="16" font-weight="700">Automate</text>
  <text x="120" y="82" text-anchor="middle" font-size="11" class="dgm-muted">replace human labor</text>
  <text x="660" y="62" text-anchor="middle" font-size="16" font-weight="700">Augment</text>
  <text x="660" y="82" text-anchor="middle" font-size="11" class="dgm-muted">amplify human capability</text>
  <g class="dgm-accent">
    <line x1="390" y1="76" x2="390" y2="104" stroke="currentColor" stroke-width="1.5"/>
    <circle cx="390" cy="90" r="5" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <text x="390" y="130" text-anchor="middle" font-size="12" font-weight="700">most real systems</text>
    <text x="390" y="147" text-anchor="middle" font-size="11">live along this line</text>
  </g>
</svg>
<figcaption><b>Automation vs. augmentation.</b> Every design lands somewhere between replacing human labor and amplifying human capability — a decision about values as much as engineering.</figcaption>
</figure>

## Who Holds the Initiative?

If AI is going to share our tasks, someone has to hold the initiative — and the
course is emphatic that it should often be the human. **Human agency** describes
the roles people can occupy alongside a machine: decision-maker, supervisor, or
collaborator. Each implies a different balance of control, and a different failure
mode when that balance is wrong.

The design pattern that takes this seriously is the **mixed-initiative system**,
in which control passes back and forth between person and AI depending on who is
better positioned to act. Neither pole is ideal on its own: full automation strips
the human of agency and accountability, while making the person do everything
wastes the machine's speed and reach. The interesting designs live in between,
where the system proposes and the person disposes — or the reverse — as the moment
demands. It is a principle that will return, formalized, later in the course.

<figure>
<svg viewBox="0 0 620 300" role="img" aria-label="A mixed-initiative cycle drawn as a loop: the human hands off to the AI when the AI is better positioned, and the AI returns control to the human when judgment is needed.">
  <defs>
    <marker id="arw-mixinit" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" class="dgm-fill"/>
    </marker>
  </defs>
  <text x="310" y="30" text-anchor="middle" font-size="13" font-weight="700">Mixed-initiative: control shared, not surrendered</text>
  <rect x="205" y="56" width="210" height="66" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="310" y="86" text-anchor="middle" font-size="16" font-weight="700">Human</text>
  <text x="310" y="107" text-anchor="middle" font-size="11" class="dgm-muted">decision-maker · supervisor</text>
  <g class="dgm-accent">
    <rect x="205" y="196" width="210" height="66" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <text x="310" y="226" text-anchor="middle" font-size="16" font-weight="700">AI</text>
    <text x="310" y="247" text-anchor="middle" font-size="11">proposes · executes</text>
  </g>
  <path d="M250,122 C170,150 170,168 245,196" fill="none" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-mixinit)"/>
  <text x="120" y="150" text-anchor="middle" font-size="11">hands off</text>
  <text x="120" y="166" text-anchor="middle" font-size="11" class="dgm-muted">when AI fits</text>
  <path d="M370,196 C450,168 450,150 375,122" fill="none" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-mixinit)"/>
  <text x="500" y="150" text-anchor="middle" font-size="11">returns</text>
  <text x="500" y="166" text-anchor="middle" font-size="11" class="dgm-muted">when judgment is needed</text>
</svg>
<figcaption><b>Sharing the initiative.</b> Control passes back and forth so the human keeps agency and accountability without doing all the work.</figcaption>
</figure>

## Mirror and Prediction Engine

The lecture closes on a deceptively simple provocation: is AI a **mirror** or a
**partner**? The honest answer is that it is both, and understanding why is the
key to designing it responsibly. AI is a mirror because it is trained on the data,
behaviors, and decisions we have already made; it reflects our past back at us,
biases and all. But it is also a **prediction engine**, because the outputs it
generates shape the choices we make next — the next word we write, the next route
we drive, the next candidate we shortlist.

That dual nature is what makes the stakes so high. A system that merely reflected
the past would be a historical record. A system that only predicted the future
would be a forecast. AI does both at once, in a loop: it learns from what we did,
then influences what we do, which becomes the data it learns from next. Designers
are not bystanders to that loop. They shape it.

<figure>
<svg viewBox="0 0 780 260" role="img" aria-label="A closed loop in which AI learns from our past data and decisions, generates outputs that shape the choices we make next, and those choices become the new data it learns from.">
  <defs>
    <marker id="arw-mirror" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" class="dgm-fill"/>
    </marker>
  </defs>
  <rect x="30" y="70" width="170" height="80" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="115" y="104" text-anchor="middle" font-size="13" font-weight="700">Past data</text>
  <text x="115" y="124" text-anchor="middle" font-size="13" font-weight="700">&amp; decisions</text>
  <g class="dgm-accent">
    <rect x="305" y="62" width="170" height="96" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <text x="390" y="98" text-anchor="middle" font-size="15" font-weight="700">AI</text>
    <text x="390" y="120" text-anchor="middle" font-size="11">mirror +</text>
    <text x="390" y="136" text-anchor="middle" font-size="11">prediction engine</text>
  </g>
  <rect x="580" y="70" width="170" height="80" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="665" y="104" text-anchor="middle" font-size="13" font-weight="700">Choices we</text>
  <text x="665" y="124" text-anchor="middle" font-size="13" font-weight="700">make next</text>
  <line x1="200" y1="110" x2="303" y2="110" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-mirror)"/>
  <text x="251" y="98" text-anchor="middle" font-size="11">learns from</text>
  <line x1="475" y1="110" x2="578" y2="110" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-mirror)"/>
  <text x="527" y="98" text-anchor="middle" font-size="11">shapes</text>
  <path d="M665,150 L665,210 L115,210 L115,150" fill="none" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-mirror)"/>
  <text x="390" y="228" text-anchor="middle" font-size="11" class="dgm-muted">becomes the next data — designers shape this loop</text>
</svg>
<figcaption><b>Mirror and prediction engine.</b> AI reflects the past it was trained on and shapes the choices that generate tomorrow's data — a loop designers are never merely bystanders to.</figcaption>
</figure>

## Why It Matters

The decisions made about human-AI interaction today will shape how people think,
work, learn, and decide for years. That is precisely why the leverage point is the
*interaction*, not just the algorithm. A model's accuracy is meaningless if the
interface around it strips users of agency, hides its reasoning, or quietly nudges
them toward the machine's defaults.

The rest of the course builds the toolkit for acting on that responsibility —
prototyping and testing new interfaces, using methods such as speculative design
and usability testing, and learning to advocate for the fairness and accessibility
of the systems we help create. The first lesson is the orientation itself: to be
less interested in technology for its own sake, and more interested in how people
and technology work together.
