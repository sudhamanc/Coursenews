---
course: human-ai
lectureId: W4
title: "Designing for a System That Won't Sit Still"
deck: "AI turns the machine itself into a moving target, so responsible design leans on wizards behind curtains, ethics up front, and the old discipline of design thinking."
order: 4
readingTime: 7
tags: ["responsible-ai", "design-thinking", "prototyping", "ethics", "explainability"]
concepts:
  - id: human-centered-design
    term: Human-Centered Design (HCD)
    definition: "An iterative design approach that begins by understanding real users — their goals, tasks, and contexts — and replaces assumptions with evidence gathered before significant development begins."
  - id: capability-uncertainty
    term: Capability Uncertainty
    definition: "The difficulty of knowing in advance what an AI system can reliably do, because performance depends on data quality and models may drift or improve after deployment."
  - id: output-complexity
    term: Output Complexity
    definition: "The challenge that AI can produce a wide range of valid responses that vary across users and contexts, making its behavior hard to predict or prototype with static mockups."
  - id: wizard-of-oz
    term: Wizard of Oz Prototyping
    definition: "A method in which a human secretly performs the AI's work while users believe they are interacting with a real system, revealing expectations and behavior before the technology is built."
  - id: explainability-and-trust
    term: Explainability and Trust
    definition: "The design challenge of communicating an AI's capabilities, limits, and confidence, and recovering gracefully from errors, so users can calibrate their trust in an often opaque 'black box.'"
  - id: responsible-ai
    term: Responsible AI
    definition: "A practice that weighs fairness, transparency, accountability, and societal impact alongside technical performance, addressing bias in data, intellectual property, and unintended consequences."
  - id: design-thinking
    term: Design Thinking
    definition: "A human-centered, iterative problem-solving process — Empathize, Define, Ideate, Prototype, Test, Implement — that starts from human needs rather than from technology."
---

Traditional software keeps its promises. Give it the same input twice and it
returns the same output twice; its behavior is a fixed function you can wireframe,
mock up, and test. Artificial intelligence keeps no such promise. It is
probabilistic, adaptive, and only as predictable as the data it was trained on —
which means the designer's job now includes designing for a system that won't sit
still. This week is about how to do that responsibly.

## Two Kinds of Uncertainty

Designing for people was never easy. Humans are variable, driven by goals,
emotions, environment, and culture; two people can use the same product in opposite
ways while each feels perfectly logical. **Human-centered design (HCD)** exists to
tame that first uncertainty by replacing assumptions with evidence — observing real
users at real tasks, asking about their goals and frustrations, testing concepts
with representative users, and refining before serious development begins. The
payoff is catching problems early, when they are cheap to fix.

AI introduces a second uncertainty: the system itself. Unlike deterministic
software, an AI model is probabilistic, and that produces two distinct challenges.
The first is **capability uncertainty** — it is genuinely hard to know what an AI
can reliably do, because performance hinges on data, teams explore inside a "funnel
of possibility" before feasibility is clear, and models can drift after launch, so
evaluation becomes continuous rather than a one-time gate. The second is **output
complexity** — the system can generate a wide range of valid responses that shift
across users and contexts. Put formally, where classical software computes a fixed
$f(x)$, an AI effectively samples from a distribution $p(y \mid x)$. That single
fact is why a static mockup can never fully capture an AI experience.

<figure>
<svg viewBox="0 0 800 250" role="img" aria-label="A comparison: classical software maps an input through a fixed function to a single output, while an AI model samples from a probability distribution, producing a range of valid outputs from the same input.">
  <defs>
    <marker id="arw-prob" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" class="dgm-fill"/>
    </marker>
  </defs>
  <text x="200" y="34" text-anchor="middle" font-size="13" font-weight="700">Classical software</text>
  <text x="200" y="52" text-anchor="middle" font-size="11" class="dgm-muted">same input → same output</text>
  <rect x="26" y="96" width="56" height="46" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="54" y="124" text-anchor="middle" font-size="14" font-weight="700">x</text>
  <line x1="82" y1="119" x2="118" y2="119" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-prob)"/>
  <rect x="122" y="93" width="92" height="52" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="168" y="124" text-anchor="middle" font-size="15" font-weight="700">f(x)</text>
  <line x1="214" y1="119" x2="250" y2="119" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-prob)"/>
  <rect x="254" y="93" width="110" height="52" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="309" y="116" text-anchor="middle" font-size="13" font-weight="700">one output</text>
  <text x="309" y="134" text-anchor="middle" font-size="11" class="dgm-muted">predictable</text>
  <line x1="406" y1="28" x2="406" y2="214" stroke="currentColor" stroke-width="1" class="dgm-muted"/>
  <text x="606" y="34" text-anchor="middle" font-size="13" font-weight="700">Probabilistic AI</text>
  <text x="606" y="52" text-anchor="middle" font-size="11" class="dgm-muted">same input → many valid outputs</text>
  <rect x="436" y="96" width="56" height="46" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="464" y="124" text-anchor="middle" font-size="14" font-weight="700">x</text>
  <line x1="492" y1="119" x2="528" y2="119" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-prob)"/>
  <g class="dgm-accent">
    <rect x="532" y="93" width="104" height="52" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <text x="584" y="124" text-anchor="middle" font-size="14" font-weight="700">p(y | x)</text>
  </g>
  <line x1="636" y1="112" x2="694" y2="74" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-prob)"/>
  <line x1="636" y1="119" x2="694" y2="119" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-prob)"/>
  <line x1="636" y1="126" x2="694" y2="164" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-prob)"/>
  <rect x="698" y="56" width="76" height="36" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="736" y="79" text-anchor="middle" font-size="12">y₁</text>
  <rect x="698" y="101" width="76" height="36" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="736" y="124" text-anchor="middle" font-size="12">y₂</text>
  <rect x="698" y="146" width="76" height="36" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="736" y="169" text-anchor="middle" font-size="12">y₃</text>
</svg>
<figcaption><b>Why a mockup can't hold it.</b> Deterministic software returns one output for an input; an AI samples a distribution, so the same prompt can yield many valid responses.</figcaption>
</figure>

## Wizards Behind the Curtain

Because realistic AI prototypes are expensive — demanding data, training, and
infrastructure — and because static artifacts cannot represent adaptive behavior,
teams learn to fake the intelligence first. The best-known method is **Wizard of
Oz**, in which a human secretly performs the AI's work while users believe the
system is real; it surfaces expectations and mental models before a line of the
model is built. Its cousins fill out the kit. In **Humans as AI**, a person
manually does the reasoning the system would eventually automate, testing whether
the task is even feasible and the data intelligible. **Heuristic systems** use
simple rule-based logic to approximate AI behavior deterministically.
**Input/output samples** put realistic example responses in front of users to judge
usefulness. And **desirability tests** — painted-door or fake-door concepts —
measure whether anyone wants a feature before it is built. The common thread is to
validate that an experience is useful, usable, and valuable before spending on the
model underneath it.

<figure>
<svg viewBox="0 0 760 240" role="img" aria-label="Wizard of Oz prototyping: a user interacts with an interface they believe is AI, but behind a curtain a hidden human performs the AI's work and sends responses back.">
  <defs>
    <marker id="arw-woz" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" class="dgm-fill"/>
    </marker>
  </defs>
  <text x="235" y="34" text-anchor="middle" font-size="12" class="dgm-muted">user believes: a real AI</text>
  <rect x="26" y="92" width="150" height="72" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="101" y="132" text-anchor="middle" font-size="14" font-weight="700">User</text>
  <rect x="250" y="92" width="170" height="72" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="335" y="124" text-anchor="middle" font-size="13" font-weight="700">Interface</text>
  <text x="335" y="142" text-anchor="middle" font-size="11" class="dgm-muted">looks like AI</text>
  <line x1="176" y1="112" x2="248" y2="112" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-woz)"/>
  <text x="212" y="104" text-anchor="middle" font-size="10" class="dgm-muted">asks</text>
  <line x1="248" y1="144" x2="176" y2="144" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-woz)"/>
  <text x="212" y="160" text-anchor="middle" font-size="10" class="dgm-muted">reply</text>
  <g class="dgm-accent">
    <line x1="470" y1="44" x2="470" y2="196" stroke="currentColor" stroke-width="1.5" stroke-dasharray="5 5"/>
    <text x="470" y="212" text-anchor="middle" font-size="11">the curtain</text>
  </g>
  <g class="dgm-accent">
    <rect x="520" y="92" width="214" height="72" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <text x="627" y="124" text-anchor="middle" font-size="14" font-weight="700">Hidden human</text>
    <text x="627" y="143" text-anchor="middle" font-size="11">performs the AI's work</text>
  </g>
  <line x1="420" y1="112" x2="518" y2="112" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-woz)"/>
  <line x1="518" y1="144" x2="420" y2="144" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-woz)"/>
  <text x="627" y="34" text-anchor="middle" font-size="12" class="dgm-muted">reality: a person responds</text>
</svg>
<figcaption><b>Wizard of Oz.</b> Users interact with what looks like a working AI while a hidden human supplies the answers — surfacing expectations before the model exists.</figcaption>
</figure>

## The Black Box Problem

Even a capable model can fail its users if they cannot understand it.
**Explainability and trust** address the reality that many models are opaque "black
boxes": a user sees a recommendation but not the reasoning behind it. Responsible
design communicates the system's capabilities, limitations, and confidence levels,
and sets realistic expectations for probabilistic behavior. Crucially, it
anticipates failure. Because an AI *will* be wrong sometimes, the recovery
experience is part of the design — how the system signals uncertainty, lets users
correct it, and preserves trust when it errs. This is the logic behind the
well-known guidelines for human-AI interaction and the NLP-focused playbooks that
catalog common failure modes so teams can prototype graceful recovery in advance.

## The Ethics You Can't Bolt On

Because AI learns from human data and decisions, it can inherit, amplify, or even
introduce harm — which makes **Responsible AI** a design concern, not a compliance
afterthought. Four fault lines recur. **Bias in training data** means historical or
societal bias gets baked in and reproduced as gender, racial, geographic, or
cultural skew, often invisible in early prototypes and emerging only after
deployment. **Intellectual property and attribution** grow fraught when generative
models imitate living creators' styles, raising questions of copyright, plagiarism,
and fair compensation. **Unintended consequences** appear when real-world behavior
diverges from the lab, disproportionately harming groups underrepresented in the
data. And **accountability and fairness** are shared across designers, engineers,
data scientists, and organizations — while fairness itself is partly a matter of
*perception*, since users must find decisions understandable and equitable. The
prescribed practices are continuous, not final: diverse and representative datasets,
testing with diverse users, ethical reviews and consequence scanning, transparency
by design, and monitoring for bias and drift after launch.

## Old Discipline, New Target

The antidote to all this uncertainty turns out to be a familiar one. **Design
thinking** is a human-centered problem-solving process built on empathy, creativity,
experimentation, and iteration. Its six phases — **Empathize, Define, Ideate,
Prototype, Test, Implement** — are explicitly non-linear; teams loop back through
them as they learn. The framework reframes the opening question from "what should we
build?" to "what problem are we solving for people?" And AI can assist at every
phase without displacing the human running it: summarizing interviews while
empathizing, clustering findings while defining, generating concepts while ideating,
drafting wireframes while prototyping, analyzing usability data while testing, and
personalizing or optimizing at implementation. The discipline is old; only the
moving target is new.

<figure>
<svg viewBox="0 0 820 220" role="img" aria-label="The six phases of design thinking — Empathize, Define, Ideate, Prototype, Test, Implement — arranged in sequence with a dashed return loop showing the process is non-linear and teams iterate back through earlier phases.">
  <defs>
    <marker id="arw-dt" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" class="dgm-fill"/>
    </marker>
  </defs>
  <text x="410" y="28" text-anchor="middle" font-size="13" font-weight="700">Design thinking — human need first, and non-linear</text>
  <rect x="12" y="66" width="118" height="52" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="71" y="97" text-anchor="middle" font-size="12" font-weight="700">Empathize</text>
  <rect x="146" y="66" width="104" height="52" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="198" y="97" text-anchor="middle" font-size="12" font-weight="700">Define</text>
  <rect x="266" y="66" width="104" height="52" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="318" y="97" text-anchor="middle" font-size="12" font-weight="700">Ideate</text>
  <rect x="386" y="66" width="112" height="52" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="442" y="97" text-anchor="middle" font-size="12" font-weight="700">Prototype</text>
  <rect x="514" y="66" width="104" height="52" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="566" y="97" text-anchor="middle" font-size="12" font-weight="700">Test</text>
  <g class="dgm-accent">
    <rect x="634" y="66" width="118" height="52" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <text x="693" y="97" text-anchor="middle" font-size="12" font-weight="700">Implement</text>
  </g>
  <line x1="130" y1="92" x2="144" y2="92" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-dt)"/>
  <line x1="250" y1="92" x2="264" y2="92" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-dt)"/>
  <line x1="370" y1="92" x2="384" y2="92" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-dt)"/>
  <line x1="498" y1="92" x2="512" y2="92" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-dt)"/>
  <line x1="618" y1="92" x2="632" y2="92" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-dt)"/>
  <path d="M693,118 C693,170 71,170 71,120" fill="none" stroke="currentColor" stroke-width="1.5" stroke-dasharray="5 5" marker-end="url(#arw-dt)"/>
  <text x="382" y="192" text-anchor="middle" font-size="11" class="dgm-muted">iterate — loop back to any earlier phase as you learn</text>
</svg>
<figcaption><b>Design thinking.</b> Six phases from empathy to implementation, explicitly non-linear — teams loop back as they learn, reframing the question from "what can we build?" to "what problem are we solving?"</figcaption>
</figure>

## Why It Matters

The shift from deterministic software to probabilistic AI does not retire
human-centered design — it makes it indispensable. When you cannot fully predict
what a system will do, you lean harder on evidence, on cheap prototypes that fake
the intelligence before you build it, on transparency that lets users calibrate
their trust, and on ethics practiced throughout rather than audited at the end.
Design thinking supplies the loop, responsible AI supplies the conscience, and
Wizard of Oz and its cousins supply a way to learn before committing. Designing for
a system that won't sit still is the defining craft of human-AI interaction.
