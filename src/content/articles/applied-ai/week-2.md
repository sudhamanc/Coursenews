---
course: applied-ai
lectureId: W2
title: "The Blueprint Behind Every AI Application"
deck: "Before a single model is trained, a working AI system needs a problem, a task, a method, and a reason to exist — and the rule-based logic of the 1980s still runs today's robots."
order: 2
readingTime: 12
tags: ["ai-applications", "expert-systems", "rule-based", "analytics", "decision-making"]
concepts:
  - id: ai-application-structure
    term: AI Application Structure
    definition: "The anatomy of an AI system: an application domain and its users, an AI method built with data and/or knowledge, and the value it delivers by solving a problem made of complex tasks."
  - id: complex-tasks
    term: Complex (Intelligent) Tasks
    definition: "The open-ended catalogue of tasks AI performs — classification, planning, translation, recommendation, diagnosis, and many more — increasingly chained into compound tasks by large language models."
  - id: data-vs-knowledge-methods
    term: Data-Oriented vs. Knowledge-Based Methods
    definition: "The two families of AI method: data-oriented methods that learn from data (decision trees, neural networks) and knowledge-based methods that encode expertise directly (rules, constraints, cases)."
  - id: three-analytics
    term: Descriptive, Predictive, Prescriptive Analytics
    definition: "Three levels of analysis — describing what happened, predicting a future trend, and prescribing a course of action in response to that prediction."
  - id: intelligence-design-choice
    term: The Intelligence–Design–Choice Model
    definition: "A model of decision-making in which intelligence gathers information about the problem, while design and choice — the essence of complex tasks — generate and select a solution that must then be implemented."
  - id: production-rules
    term: Production Rules
    definition: "Condition–action structures of the form IF condition THEN action, organized into rule sets and chained together to change the state of a problem toward a solution."
  - id: forward-backward-chaining
    term: Forward and Backward Chaining
    definition: "The two inference strategies of a rule engine: forward chaining reasons from known facts toward conclusions; backward chaining reasons from a hypothesis back to the facts that would prove it."
  - id: expert-systems
    term: Expert Systems
    definition: "Knowledge-based systems, prominent in the 1980s and still used in robotics and control, that pair a knowledge base and working memory with an inference engine to solve expert problems."
---

Ask a newcomer what it takes to build an artificial-intelligence application and
the answer usually names a model — a neural network, a large language model,
something that learns. The second lecture of Applied AI insists that the model is
almost the *last* thing to worry about. Long before a line of training code is
written, a successful application must know what problem it solves, for whom,
with what data or knowledge, and to what end. This is the anatomy lesson: the
skeleton on which every deployed AI system hangs.

## The Anatomy of an Application

An AI application lives inside an **application domain** and serves an
**organization of users**. At its core is an AI application system made of one or
more **AI methods**, built with **data, knowledge, or both**. It exists to
deliver **value** by solving a **problem** that entails one or more **complex
tasks**, and in doing so it produces **impacts**. An application, the lecture
notes, may or may not be deployed, but it usually has a name, an audience, a
value, and a problem at its heart.

<figure>
<svg viewBox="0 0 820 250" role="img" aria-label="Anatomy of an AI application: an AI method built from data and knowledge sits inside an application domain of users, solves a problem of complex tasks, and delivers value.">
  <defs>
    <marker id="arw-anat" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" class="dgm-fill"/>
    </marker>
  </defs>
  <rect x="20" y="50" width="350" height="170" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="195" y="76" text-anchor="middle" font-size="12" font-weight="700">Application Domain · Users</text>
  <rect x="55" y="95" width="290" height="100" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="200" y="120" text-anchor="middle" font-size="14" font-weight="700">AI Method</text>
  <rect x="80" y="138" width="110" height="42" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="135" y="164" text-anchor="middle" font-size="12">Data</text>
  <rect x="210" y="138" width="110" height="42" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="265" y="164" text-anchor="middle" font-size="12">Knowledge</text>
  <line x1="372" y1="140" x2="414" y2="140" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-anat)"/>
  <text x="393" y="130" text-anchor="middle" font-size="11" class="dgm-muted">solves</text>
  <rect x="418" y="95" width="160" height="90" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="498" y="132" text-anchor="middle" font-size="14" font-weight="700">Problem</text>
  <text x="498" y="154" text-anchor="middle" font-size="11" class="dgm-muted">complex tasks</text>
  <line x1="580" y1="140" x2="622" y2="140" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-anat)"/>
  <text x="601" y="130" text-anchor="middle" font-size="11" class="dgm-muted">delivers</text>
  <g class="dgm-accent">
    <rect x="626" y="95" width="170" height="90" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <text x="711" y="132" text-anchor="middle" font-size="14" font-weight="700">Value</text>
    <text x="711" y="154" text-anchor="middle" font-size="11">&amp; impacts</text>
  </g>
</svg>
<figcaption><b>Anatomy of an application.</b> An AI method — built from data, knowledge, or both — lives inside a domain of users, solves a problem made of complex tasks, and exists to deliver value.</figcaption>
</figure>

Value itself is plural. Return on investment is one measure, but user value and
organizational value can diverge — a warehouse route planner, an autoclave
designer, an e-commerce recommender, and a dialogue system each create value of a
different shape, for a different beneficiary. Naming that value precisely is as
much a part of the engineering as choosing an algorithm.

## A Catalogue of Complex Tasks

What exactly does an AI method *do*? The lecture answers with a sprawling list of
**complex tasks**, also called intelligent tasks: classification, regression, and
clustering; planning, configuration, and design; speech recognition and
synthesis; object and image recognition, segmentation, and transfer; machine
translation, natural-language understanding and generation, summarization,
question-answering, named-entity recognition, and information extraction;
recommendation, diagnosis, prescription, control, and self-driving. The list is
not, and likely never will be, exhaustive — and modern large language models
increasingly chain several of these into *compound* tasks. Naming the task
precisely is the first act of engineering discipline: it constrains the method,
the data, and the metric all at once.

## Two Families of Method

Those methods fall into two broad families. **Data-oriented** methods learn
knowledge from data — decision trees, neural networks, statistical models.
**Knowledge- or content-based** methods encode human expertise directly through
rule-based reasoning, constraint satisfaction, or case-based reasoning. Natural
language sits astride the divide: data-oriented NLP uses neural probabilistic
language models, while knowledge-based NLP draws on grammar and vocabulary.

Underneath it all is a working definition of *knowledge* borrowed from
organizational theory: a contextual, justified belief that enables an agent —
human or machine — to take action. Knowledge, on this view, is not raw data; it
is what lets a decision be made.

## From Description to Prescription

Analytics comes in three ascending levels. **Descriptive** analytics reports what
happened; **predictive** analytics finds a trend in data and projects it forward;
**prescriptive** analytics goes further still, prescribing a course of action in
response to that prediction. These map onto a classic model of decision-making:
**intelligence** gathers the information points that describe the problem
(information meant for human consumption), while **design and choice** — the
generation and selection of a solution — are the true essence of complex tasks.
Crucially, a problem is only *solved* when a decision is implemented, whether by a
human, a business process, or a robot. The **analytics cycle** is the recipe that
lets domain experts who are not AI experts apply data-oriented methods with
existing libraries; learning to run that cycle, the lecture says, is the core of
data science.

<figure>
<svg viewBox="0 0 760 270" role="img" aria-label="Analytics as a rising ladder from descriptive to predictive to prescriptive, ending in an implemented decision.">
  <defs>
    <marker id="arw-anly" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" class="dgm-fill"/>
    </marker>
  </defs>
  <rect x="30" y="170" width="190" height="66" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="125" y="200" text-anchor="middle" font-size="14" font-weight="700">Descriptive</text>
  <text x="125" y="221" text-anchor="middle" font-size="11" class="dgm-muted">what happened?</text>
  <line x1="222" y1="188" x2="248" y2="160" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-anly)"/>
  <rect x="250" y="120" width="190" height="66" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="345" y="150" text-anchor="middle" font-size="14" font-weight="700">Predictive</text>
  <text x="345" y="171" text-anchor="middle" font-size="11" class="dgm-muted">what will happen?</text>
  <line x1="442" y1="138" x2="468" y2="110" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-anly)"/>
  <g class="dgm-accent">
    <rect x="470" y="70" width="190" height="66" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <text x="565" y="100" text-anchor="middle" font-size="14" font-weight="700">Prescriptive</text>
    <text x="565" y="121" text-anchor="middle" font-size="11">what to do?</text>
  </g>
  <line x1="565" y1="136" x2="565" y2="176" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-anly)"/>
  <rect x="470" y="180" width="190" height="50" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="565" y="210" text-anchor="middle" font-size="13">Implement decision</text>
  <text x="380" y="258" text-anchor="middle" font-size="11" class="dgm-muted">each level asks a harder question — a problem is solved only when the decision is acted on</text>
</svg>
<figcaption><b>From description to prescription.</b> Analytics ascends from reporting what happened, to predicting what will, to prescribing what to do — and the problem is solved only when that decision is implemented.</figcaption>
</figure>

## The Enduring Logic of Expert Systems

If the second wave belongs to data, this lecture makes a point of honoring the
knowledge-based tradition that preceded it. **Expert systems** were the buzzword
of the 1980s, most often built as rule-based reasoning — some with frames and
methods, a few even with neural networks. That methodology has not vanished; it
still equips today's rule-based agents, which remain common in robotics.

At its foundation are **production rules** organized into rule sets:
condition–action structures that change the state of the world.

```text
IF   room:temperature > 72
AND  thermostat:setting = 72
THEN thermostat:state = ON
```

Chains of such rules solve a problem one inference at a time. A complete expert
system couples a **knowledge base** (often frames and methods), a **working
memory** of short-term facts, and an **inference engine** — the agenda that
decides which rule to fire — with interfaces for the user, for explanation, and
for knowledge acquisition.

<figure>
<svg viewBox="0 0 820 285" role="img" aria-label="Expert system inference: an inference engine fires knowledge-base rules over working-memory facts, chaining forward from facts to conclusions and backward from a goal to the facts that prove it.">
  <defs>
    <marker id="arw-exp" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" class="dgm-fill"/>
    </marker>
  </defs>
  <rect x="310" y="20" width="200" height="52" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="410" y="43" text-anchor="middle" font-size="13" font-weight="700">Knowledge Base</text>
  <text x="410" y="61" text-anchor="middle" font-size="11" class="dgm-muted">IF–THEN rules</text>
  <line x1="410" y1="72" x2="410" y2="121" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-exp)"/>
  <text x="440" y="101" text-anchor="middle" font-size="11" class="dgm-muted">fires</text>
  <g class="dgm-accent">
    <rect x="310" y="125" width="200" height="74" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <text x="410" y="158" text-anchor="middle" font-size="14" font-weight="700">Inference Engine</text>
    <text x="410" y="178" text-anchor="middle" font-size="11">selects which rule fires</text>
  </g>
  <rect x="40" y="132" width="170" height="60" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="125" y="158" text-anchor="middle" font-size="13" font-weight="700">Facts</text>
  <text x="125" y="178" text-anchor="middle" font-size="11" class="dgm-muted">working memory</text>
  <rect x="610" y="132" width="170" height="60" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="695" y="158" text-anchor="middle" font-size="13" font-weight="700">Conclusions</text>
  <text x="695" y="178" text-anchor="middle" font-size="11" class="dgm-muted">goal · answer</text>
  <line x1="212" y1="162" x2="306" y2="162" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-exp)"/>
  <line x1="514" y1="162" x2="606" y2="162" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-exp)"/>
  <text x="259" y="150" text-anchor="middle" font-size="11">forward chaining</text>
  <path d="M690,192 C 560,256 260,256 132,192" fill="none" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-exp)"/>
  <text x="410" y="266" text-anchor="middle" font-size="11">backward chaining: goal → facts</text>
</svg>
<figcaption><b>Inside an expert system.</b> The inference engine fires knowledge-base rules over working-memory facts — chaining forward from facts to conclusions, or backward from a goal to the facts that would prove it.</figcaption>
</figure>

Two inference strategies define the field. **Forward chaining** reasons from
known facts toward conclusions, which suits problems where all the information is
already in hand and many solutions may be composed; its rule-selection strategies
resemble those of search algorithms. **Backward chaining** reasons from a
hypothesis back to the facts that would prove it — efficient when there are only
a few possible outcomes, and able to begin before every fact is known, asking for
missing values as it goes. Frame-based reasoning adds structured objects with
slots, and a fired rule's effect is expressed as additions to and deletions from
the world state:

```text
Effect of set(AC, on):
  delete classroom:AC = off
  add    classroom:AC = on
```

Frame-based control systems of exactly this kind remain typical in industrial
temperature control.

## Knowing When to Reach for Rules

When *should* an engineer choose rule-based reasoning? The lecture offers a set
of tests: Is there a cheaper or more certain mathematical solution? Is the domain
well bounded or fuzzy? Is the necessary domain knowledge available, could it
instead be learned from data, and is it permanent? It closes with a builder's
checklist that has aged remarkably well — choose problems with a solid business
case, minimize disruption to existing workflows, identify the right knowledge and
data, select suitable representations and reasoning strategies, define test cases
and performance metrics, add safeguards and opt-out capabilities, and test with
real data from the operating environment.

## Why It Matters

In an era of trillion-parameter models, it is tempting to treat every problem as
a nail for the deep-learning hammer. This lecture is a corrective. An
application's success is decided by the *fit* among problem, task, method, data,
and value — not by the glamour of the algorithm. The rule-based systems of the
1980s still steer robots and regulate factories precisely because someone matched
a bounded, well-understood problem to a transparent, maintainable method. The
same discipline — name the task, weigh the value, choose the method that fits —
is what separates an AI application that ships and earns trust from a demo that
dazzles once and disappears.
