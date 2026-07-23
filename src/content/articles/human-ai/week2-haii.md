---
course: human-ai
lectureId: W2
title: "35,000 Decisions a Day: The Cognitive Machinery Behind the Interface"
deck: "Before you can design for people, you have to know how they think — the mental models, shortcuts, and biases that quietly govern every click."
order: 2
readingTime: 8
tags: ["cognitive-psychology", "mental-models", "heuristics", "cognitive-bias", "ux-laws"]
concepts:
  - id: cognitive-psychology
    term: Cognitive Psychology
    definition: "The study of how people acquire, process, store, and use information, covering perception, attention, memory, learning, reasoning, decision-making, problem solving, and language."
  - id: mental-models
    term: Mental Models
    definition: "Internal representations of how something works that people use to predict and interpret the world; unique to each individual and shaped by experience and culture."
  - id: heuristics
    term: Heuristics
    definition: "Mental shortcuts, or rules of thumb, that reduce the complexity of judgment and choice, letting people decide quickly without exhaustive analysis."
  - id: laws-of-ux
    term: Laws of UX
    definition: "Cause-and-effect design principles drawn from psychology, including Hick's, Fitts's, Miller's Laws and the Doherty threshold, that predict how design choices affect human performance and perception."
  - id: cognitive-bias
    term: Cognitive Bias
    definition: "A systematic error in thinking that arises when heuristics misfire, producing predictable gaps between rational and actual behavior; often categorized as systemic, statistical, or human in origin."
  - id: cognitive-modeling
    term: Cognitive Modeling
    definition: "A multidisciplinary effort to replicate and simulate human cognitive processes such as problem solving, decision-making, learning, and memory, in order to understand and mirror how people respond to information."
  - id: tool-use-and-cognition
    term: Tool Use and Cognition
    definition: "The distinctly human capacity, rooted in the parietal lobe, to combine conceptual knowledge with acquired skill to wield tools, a lineage that runs from stone implements to the web to AI."
---

Adults make more than 35,000 decisions a day, and almost none of them feel like
decisions. We reach for the door handle, skim the headline, trust the first price
we see, and click the thing that looks clickable — all without deliberation. To
design for people, and especially to design the interfaces through which people
now meet artificial intelligence, you have to understand the machinery that makes
those 35,000 micro-choices possible. That machinery is the subject of **cognitive
psychology**, and this week turns it into a designer's toolkit.

## The Science of the Thinking User

Cognitive psychology is the study of how people think and process information —
how they acquire it, store it, retrieve it, and act on it. Its traditional
territory is broad: perception, attention, learning, memory, concept formation,
reasoning, judgment and decision-making, problem solving, and language processing.
Each names a mental process a designer implicitly leans on. **Perception** is how
users make sense of what their senses take in; **attention** is their ability to
focus on relevant signals while tuning out noise; **memory** spans facts,
procedures, and a famously limited working store.

<figure>
<svg viewBox="0 0 820 150" role="img" aria-label="A cognitive information-processing pipeline: perception feeds attention, which feeds a limited working memory of about seven items, supporting reasoning and decision-making that drives action.">
  <defs>
    <marker id="arw-cogpipe" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" class="dgm-fill"/>
    </marker>
  </defs>
  <text x="410" y="26" text-anchor="middle" font-size="12" class="dgm-muted">acquire → store → retrieve → act</text>
  <rect x="8" y="46" width="120" height="64" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="68" y="83" text-anchor="middle" font-size="13" font-weight="700">Perception</text>
  <rect x="168" y="46" width="120" height="64" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="228" y="83" text-anchor="middle" font-size="13" font-weight="700">Attention</text>
  <g class="dgm-accent">
    <rect x="328" y="46" width="150" height="64" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <text x="403" y="78" text-anchor="middle" font-size="13" font-weight="700">Working memory</text>
    <text x="403" y="96" text-anchor="middle" font-size="11">≈ 7 ± 2 items</text>
  </g>
  <rect x="518" y="46" width="150" height="64" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="593" y="78" text-anchor="middle" font-size="13" font-weight="700">Reasoning</text>
  <text x="593" y="96" text-anchor="middle" font-size="12">&amp; decision</text>
  <rect x="708" y="46" width="104" height="64" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="760" y="83" text-anchor="middle" font-size="13" font-weight="700">Action</text>
  <line x1="128" y1="78" x2="166" y2="78" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-cogpipe)"/>
  <line x1="288" y1="78" x2="326" y2="78" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-cogpipe)"/>
  <line x1="478" y1="78" x2="516" y2="78" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-cogpipe)"/>
  <line x1="668" y1="78" x2="706" y2="78" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-cogpipe)"/>
</svg>
<figcaption><b>The thinking user, as a pipeline.</b> Every interface is routed through perception, attention, and a sharply limited working memory before it ever becomes a decision.</figcaption>
</figure>

Underneath sits biology. The brain's four lobes divide the labor: the **frontal**
lobe handles executive functions — planning, reasoning, emotional regulation; the
**parietal** lobe integrates sensory information such as touch, temperature, and
pressure; the **temporal** lobe processes hearing, language, and the formation of
memories; and the **occipital** lobe houses the visual cortex. Designers rarely
think in lobes, but every interface is ultimately routed through them.

## Tool-Users by Design

One lobe earns special attention. The parietal lobe links attention to advanced
motor planning, and that pairing is what makes humans such prolific tool-users —
a capability that sets us apart from other tool-using animals. Wielding a tool
well requires two things at once: **conceptual knowledge** of what the tool is for
and the **acquired skill** to use it. Tools, in turn, have driven human evolution,
reshaping hunting and cooperation, communication and social complexity, and our
capacity for memory and foresight. The World Wide Web is simply a recent,
dynamic, multifunctional entry in that lineage — and AI is framed here as the next
step. The crucial caveat: humans remain the creators who must supply the intent
and judgment. The tool extends us; it does not replace the hand that guides it.

## The User's Private Theory

A **mental model** is the cognitive framework a person uses to make sense of, and
navigate, an experience. Everyone carries them — they begin forming in infancy —
and they are intensely personal, assembled from individual experience and cultural
influence. They are also predictive: a user expects that clicking a shopping-cart
icon will show the cart, because that is how most websites behave. Good design
respects the model the user already holds; fighting it guarantees confusion.

## The Laws of UX

Heuristics are the shortcuts people use to cut the complexity of judgment and
choice — think of the automatic route you take home. The so-called **laws of UX**
formalize the predictable ways design meets those shortcuts, several of them
precise enough to write down.

- **Jakob's Law:** users spend most of their time on *other* sites, so they expect
  yours to work the same way — a direct appeal to existing mental models.
- **Hick's Law:** decision time grows with the number and complexity of options.
  Roughly, $T = b\,\log_2(n + 1)$, so doubling the choices adds a fixed increment
  of delay, not a doubling of it.
- **Fitts's Law:** the time to acquire a target depends on its distance and size,
  $T = a + b\,\log_2\!\left(1 + \frac{D}{W}\right)$ — closer, bigger targets are
  faster to hit.
- **Miller's Law:** working memory holds only about $7 \pm 2$ items, an argument
  for chunking information rather than dumping it.
- **Doherty Threshold:** keep system response under about 400 milliseconds and the
  interaction stays fluid — even, the research warned, addictive.
- **Tesler's Law** (the conservation of complexity): every process has an
  irreducible amount of complexity; the only question is whether the system
  absorbs it or the user does.

Others — the **Peak-End Rule**, the **Aesthetic-Usability Effect**, the **Von
Restorff (isolation) effect** — round out the set. All share one premise: whether
or not a designer acknowledges them, these cause-and-effect relationships shape
how effective an experience feels.

<figure>
<svg viewBox="0 0 720 180" role="img" aria-label="Tesler's Law shown as a fixed-width bar of irreducible complexity divided between the share absorbed by the system and the share borne by the user; only the position of the divider can change.">
  <defs>
    <marker id="arw-tesler" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" class="dgm-fill"/>
    </marker>
  </defs>
  <text x="360" y="30" text-anchor="middle" font-size="13" font-weight="700">Conservation of complexity</text>
  <rect x="60" y="66" width="600" height="52" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <g class="dgm-accent">
    <line x1="360" y1="52" x2="360" y2="132" stroke="currentColor" stroke-width="1.5"/>
    <text x="360" y="46" text-anchor="middle" font-size="11">the only movable line</text>
  </g>
  <text x="210" y="97" text-anchor="middle" font-size="12" font-weight="700">absorbed by the system</text>
  <text x="510" y="97" text-anchor="middle" font-size="12" font-weight="700">borne by the user</text>
  <line x1="120" y1="150" x2="600" y2="150" stroke="currentColor" stroke-width="1.5" marker-start="url(#arw-tesler)" marker-end="url(#arw-tesler)"/>
  <text x="360" y="170" text-anchor="middle" font-size="11" class="dgm-muted">total complexity is fixed — it can be shifted, not removed</text>
</svg>
<figcaption><b>Tesler's Law.</b> Every process has an irreducible complexity; design only decides how much the system absorbs and how much it leaves to the user.</figcaption>
</figure>

## When Shortcuts Betray Us

Heuristics are efficient, but efficiency has a price. A **cognitive bias** is the
systematic error that results when a shortcut misfires — the gap between how a
rational actor would behave and how a heuristic-driven human actually does.
Psychologists note these biases often serve an adaptive purpose, letting us decide
fast; they simply mislead in the wrong context. A sociotechnical view sorts them
into three sources: **systemic** bias rooted in institutional and historical
inequities, **statistical** bias from unrepresentative data or models that flatten
context into numbers, and **human** bias — the unconscious shortcuts developers
and users carry into the AI lifecycle. Familiar culprits include confirmation
bias, the overconfidence effect, the availability heuristic, and, at the
interface, automation and anchoring bias. The recommended defenses are
organizational: human-in-the-loop oversight, deliberate bias audits, and a culture
of *effective challenge* that questions design decisions rigorously.

<figure>
<svg viewBox="0 0 760 300" role="img" aria-label="Three sources of bias — systemic, statistical, and human — converge into a cognitive bias, which is a heuristic that misfired, and which organizations counter with human-in-the-loop oversight, bias audits, and effective challenge.">
  <defs>
    <marker id="arw-bias" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" class="dgm-fill"/>
    </marker>
  </defs>
  <text x="380" y="24" text-anchor="middle" font-size="13" font-weight="700">Where bias comes from</text>
  <rect x="40" y="42" width="190" height="54" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="135" y="70" text-anchor="middle" font-size="13" font-weight="700">Systemic</text>
  <text x="135" y="87" text-anchor="middle" font-size="11" class="dgm-muted">institutions &amp; history</text>
  <rect x="285" y="42" width="190" height="54" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="380" y="70" text-anchor="middle" font-size="13" font-weight="700">Statistical</text>
  <text x="380" y="87" text-anchor="middle" font-size="11" class="dgm-muted">unrepresentative data</text>
  <rect x="530" y="42" width="190" height="54" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="625" y="70" text-anchor="middle" font-size="13" font-weight="700">Human</text>
  <text x="625" y="87" text-anchor="middle" font-size="11" class="dgm-muted">unconscious shortcuts</text>
  <line x1="150" y1="96" x2="330" y2="148" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-bias)"/>
  <line x1="380" y1="96" x2="380" y2="148" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-bias)"/>
  <line x1="610" y1="96" x2="430" y2="148" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-bias)"/>
  <g class="dgm-accent">
    <rect x="250" y="150" width="260" height="62" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <text x="380" y="180" text-anchor="middle" font-size="15" font-weight="700">Cognitive bias</text>
    <text x="380" y="199" text-anchor="middle" font-size="11">a heuristic that misfired</text>
  </g>
  <line x1="380" y1="212" x2="380" y2="242" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-bias)"/>
  <rect x="130" y="244" width="500" height="48" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="380" y="266" text-anchor="middle" font-size="12" font-weight="700">Defenses</text>
  <text x="380" y="283" text-anchor="middle" font-size="11">human-in-the-loop · bias audits · effective challenge</text>
</svg>
<figcaption><b>When shortcuts betray us.</b> A bias is a heuristic that misfired; sorting its systemic, statistical, and human sources is the first step to designing defenses against it.</figcaption>
</figure>

## Modeling the Mind

The week's final idea turns the lens around. **Cognitive modeling** is the
multidisciplinary attempt to replicate and simulate human cognitive processes —
problem solving, decision-making, learning, memory — in order to understand how
people perceive, interpret, and respond. It is also, quietly, a description of
what much of modern AI is trying to do. Recognizing where such models faithfully
mirror human cognition, and where they distort it, is exactly the judgment a
designer of AI systems needs.

## Why It Matters

Every AI interface lands in a mind already running on mental models, heuristics,
and biases. Ignore that machinery and even a brilliant model will be misread,
mistrusted, or misused. Understand it and you can design interfaces that fit how
people actually think — and guard against the biases, human and statistical alike,
that steer 35,000 decisions a day. The practical residue of the science is a set
of questions any designer can ask of an AI product: who is this for, what mental
model does its interface assume, and where might bias quietly creep in?
