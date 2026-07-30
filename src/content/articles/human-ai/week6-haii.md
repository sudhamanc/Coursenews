---
course: human-ai
lectureId: W6
title: "The Right to an Explanation"
deck: "Week 6 turns to Explainable AI — why a black box is not answerable, how local, cohort, and global explanations differ, and why 'being an explanation' is not a property of a statement but an interaction with a person who has to decide."
order: 6
readingTime: 12
tags: ["explainable-ai", "xai", "trust", "interpretability", "responsible-ai"]
concepts:
  - id: explainable-ai
    term: Explainable AI (XAI)
    definition: "The set of tools, processes, and methods that help people understand how a machine-learning system produced a result — turning an unexplained recommendation into insight about the factors that influenced it, so users can question, verify, or contest it."
  - id: transparent-opaque
    term: Transparent vs. Opaque Models
    definition: "A transparent (interpretable-by-design) model — a decision tree, linear model, or rule set — can be understood on its own; an opaque model such as a deep neural network shows inputs and outputs but hides the reasoning between them, requiring post-hoc explanation."
  - id: interpretability-explainability
    term: Interpretability, Explainability, Comprehensibility
    definition: "Interpretability is a passive property of a system; explainability is an active interface or procedure that makes it understandable to a person; comprehensibility is the model's ability to present its knowledge in human terms. The words are frequently interchanged."
  - id: explanation-granularity
    term: Local, Cohort, and Global Explanations
    definition: "Three scopes of explanation: local explains one prediction ('Why this decision?'), cohort explains behavior for a subgroup ('Does it treat people like me differently?'), and global explains the model overall ('How does it generally decide?')."
  - id: intrinsic-vs-posthoc
    term: Interpretable-by-Design vs. Post-hoc
    definition: "Two ways to produce an explanation: build a model whose logic is inherently understandable, or generate an explanation for a complex model after it is trained (for example SHAP, LIME, or a counterfactual)."
  - id: feature-attribution
    term: Feature Attribution
    definition: "Methods that show which inputs most influenced an output — SHAP, LIME, Grad-CAM, saliency maps, layer-wise relevance propagation. They reveal where a model focused, but not necessarily why those features mattered."
  - id: faithfulness-overtrust
    term: Faithfulness and Over-trust
    definition: "An explanation can be plausible without faithfully reflecting the model's actual computation; convincing explanations can breed unjustified confidence (over-trust), so explanations must themselves be evaluated for accuracy and usefulness."
  - id: evaluative-ai
    term: Evaluative AI
    definition: "A shift from an AI that recommends and then defends an answer to one that supplies evidence for and against a human's hypotheses, keeping final judgment — and a sense of control — with the person."
---

In 2013, Eric Loomis was sentenced partly on the strength of a number he was not
allowed to see. A proprietary tool called COMPAS scored his risk of reoffending,
and the court leaned on that score in handing down six years. Because the
algorithm was a trade secret, neither Loomis nor the judge could examine how it
reached its verdict. The Wisconsin Supreme Court let the score stand but wrapped
it in warnings — about its secrecy, its group-based predictions, its unvalidated
accuracy, its possible racial disparities. Which exposes the question at the
center of Week 6: if neither the defendant nor the judge can see how a number was
produced, can it be meaningfully challenged at all? **A warning about a black box
does not make the black box explainable.**

## What Explainability Is For

**Explainable AI** — XAI — is the set of tools, processes, and methods that help
people understand how a machine-learning system produced its result. It matters
most in high-stakes settings — healthcare, finance, employment, the courts —
where people need more than an answer. They need enough information to judge
whether the reasoning is trustworthy, fair, and appropriate; to spot errors and
bias; and to decide whether to accept the output at all. Explainability is what
lets a person interrogate a decision instead of merely receiving it.

## Transparent and Opaque

Some models are legible by construction. A decision tree, a linear or logistic
regression, a rule-based learner — you can trace how each input contributed to
the output. These are **transparent**. The trouble is that the most accurate
modern systems, especially deep neural networks and large tree ensembles, are
**opaque**: you can observe what goes in and what comes out, but not what
happened in between. One useful taxonomy asks whether a model is *simulatable*
(a person could step through it by hand), *decomposable* (each part has an
intuitive meaning), and *algorithmically transparent* (its training is well
understood) — criteria that deep networks fail on every count.

<figure>
<svg viewBox="0 0 820 260" role="img" aria-label="Left: a transparent model whose path from input to output can be traced. Right: an opaque black-box model whose input and output are visible but whose internal process needs a separate post-hoc explanation.">
  <defs>
    <marker id="arw-xai-box" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" class="dgm-fill"/>
    </marker>
  </defs>
  <text x="205" y="26" text-anchor="middle" font-size="13" font-weight="700">Transparent</text>
  <rect x="24" y="92" width="66" height="44" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="57" y="118" text-anchor="middle" font-size="12">Input</text>
  <line x1="90" y1="114" x2="128" y2="114" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-xai-box)"/>
  <rect x="132" y="70" width="146" height="92" class="dgm-soft" stroke="currentColor" stroke-width="1.5"/>
  <text x="205" y="104" text-anchor="middle" font-size="12" font-weight="700">Model</text>
  <text x="205" y="123" text-anchor="middle" font-size="10.5" class="dgm-muted">trace the path</text>
  <path d="M168 140 L190 150 L224 130" fill="none" stroke="currentColor" stroke-width="1.3"/>
  <line x1="278" y1="114" x2="316" y2="114" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-xai-box)"/>
  <rect x="320" y="92" width="66" height="44" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="353" y="118" text-anchor="middle" font-size="12">Output</text>
  <line x1="410" y1="34" x2="410" y2="236" stroke="currentColor" stroke-width="1" stroke-dasharray="3 4" class="dgm-muted"/>
  <text x="615" y="26" text-anchor="middle" font-size="13" font-weight="700">Opaque</text>
  <rect x="434" y="92" width="66" height="44" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="467" y="118" text-anchor="middle" font-size="12">Input</text>
  <line x1="500" y1="114" x2="538" y2="114" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-xai-box)"/>
  <g class="dgm-accent">
    <rect x="542" y="70" width="146" height="92" fill="none" stroke="currentColor" stroke-width="1.6"/>
    <text x="615" y="108" text-anchor="middle" font-size="12" font-weight="700">Black box</text>
    <text x="615" y="132" text-anchor="middle" font-size="15" font-weight="700">?</text>
  </g>
  <line x1="688" y1="114" x2="726" y2="114" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-xai-box)"/>
  <rect x="730" y="92" width="66" height="44" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="763" y="118" text-anchor="middle" font-size="12">Output</text>
  <rect x="542" y="198" width="146" height="42" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="615" y="216" text-anchor="middle" font-size="11">Post-hoc</text>
  <text x="615" y="231" text-anchor="middle" font-size="11">explanation</text>
  <line x1="615" y1="198" x2="615" y2="166" stroke="currentColor" stroke-width="1.3" stroke-dasharray="4 3" marker-end="url(#arw-xai-box)"/>
</svg>
<figcaption><b>Transparent vs. opaque.</b> A transparent model lets you follow inputs to an output; a black box shows only its ends, so understanding it takes a separate post-hoc explanation.</figcaption>
</figure>

The vocabulary here is slippery, and the lecture is careful about it.
*Interpretability* is a passive property a system either has or lacks;
*explainability* is an active interface or procedure that makes a system
understandable to a person; *comprehensibility* is the model's ability to render
its knowledge in human terms. In practice the three words are used almost
interchangeably — but the distinction between a property and an *interaction* is
the one that matters most this week.

## Whose Explanation? Local, Cohort, Global

Not every stakeholder needs the same explanation. XAI is usually organized by
**granularity** — the scope of behavior being explained. A **local** explanation
justifies a single prediction: *Why was this loan denied?* A **cohort**
explanation describes behavior for a subgroup: *Does the model treat applicants
under thirty differently?* A **global** explanation characterizes the whole
system: *How does it generally decide?* The levels are complementary. A local
explanation can defend one decision while a cohort explanation reveals a
systematic disparity that no single case could show.

<figure>
<svg viewBox="0 0 820 250" role="img" aria-label="Three levels of explanation shown as widening scope: local highlights one prediction, cohort highlights a subgroup of predictions, and global covers the entire set of predictions.">
  <defs>
    <marker id="arw-xai-lvl" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" class="dgm-fill"/>
    </marker>
  </defs>
  <text x="130" y="30" text-anchor="middle" font-size="13" font-weight="700">Local</text>
  <rect x="24" y="42" width="212" height="118" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <circle cx="70" cy="72" r="7" fill="none" stroke="currentColor" stroke-width="1.3"/>
  <circle cx="118" cy="72" r="7" fill="none" stroke="currentColor" stroke-width="1.3"/>
  <circle cx="166" cy="72" r="7" fill="none" stroke="currentColor" stroke-width="1.3"/>
  <circle cx="70" cy="104" r="7" fill="none" stroke="currentColor" stroke-width="1.3"/>
  <circle cx="118" cy="104" r="8.5" class="dgm-accent dgm-fill"/>
  <circle cx="166" cy="104" r="7" fill="none" stroke="currentColor" stroke-width="1.3"/>
  <circle cx="70" cy="136" r="7" fill="none" stroke="currentColor" stroke-width="1.3"/>
  <circle cx="118" cy="136" r="7" fill="none" stroke="currentColor" stroke-width="1.3"/>
  <circle cx="166" cy="136" r="7" fill="none" stroke="currentColor" stroke-width="1.3"/>
  <text x="130" y="188" text-anchor="middle" font-size="10.5" class="dgm-muted">one prediction</text>
  <text x="130" y="206" text-anchor="middle" font-size="11">“Why this decision?”</text>
  <line x1="244" y1="101" x2="280" y2="101" stroke="currentColor" stroke-width="1.4" marker-end="url(#arw-xai-lvl)"/>
  <text x="410" y="30" text-anchor="middle" font-size="13" font-weight="700">Cohort</text>
  <rect x="304" y="42" width="212" height="118" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <rect x="330" y="92" width="160" height="26" rx="13" class="dgm-accent dgm-soft" stroke="currentColor" stroke-width="1.4"/>
  <circle cx="350" cy="72" r="7" fill="none" stroke="currentColor" stroke-width="1.3"/>
  <circle cx="398" cy="72" r="7" fill="none" stroke="currentColor" stroke-width="1.3"/>
  <circle cx="446" cy="72" r="7" fill="none" stroke="currentColor" stroke-width="1.3"/>
  <circle cx="350" cy="105" r="7" class="dgm-accent dgm-fill"/>
  <circle cx="398" cy="105" r="7" class="dgm-accent dgm-fill"/>
  <circle cx="446" cy="105" r="7" class="dgm-accent dgm-fill"/>
  <circle cx="350" cy="137" r="7" fill="none" stroke="currentColor" stroke-width="1.3"/>
  <circle cx="398" cy="137" r="7" fill="none" stroke="currentColor" stroke-width="1.3"/>
  <circle cx="446" cy="137" r="7" fill="none" stroke="currentColor" stroke-width="1.3"/>
  <text x="410" y="188" text-anchor="middle" font-size="10.5" class="dgm-muted">a subgroup</text>
  <text x="410" y="206" text-anchor="middle" font-size="11">“Different for my group?”</text>
  <line x1="524" y1="101" x2="560" y2="101" stroke="currentColor" stroke-width="1.4" marker-end="url(#arw-xai-lvl)"/>
  <text x="690" y="30" text-anchor="middle" font-size="13" font-weight="700">Global</text>
  <rect x="584" y="42" width="212" height="118" class="dgm-soft" stroke="currentColor" stroke-width="1.5"/>
  <circle cx="630" cy="72" r="7" class="dgm-accent dgm-fill"/>
  <circle cx="678" cy="72" r="7" class="dgm-accent dgm-fill"/>
  <circle cx="726" cy="72" r="7" class="dgm-accent dgm-fill"/>
  <circle cx="630" cy="105" r="7" class="dgm-accent dgm-fill"/>
  <circle cx="678" cy="105" r="7" class="dgm-accent dgm-fill"/>
  <circle cx="726" cy="105" r="7" class="dgm-accent dgm-fill"/>
  <circle cx="630" cy="137" r="7" class="dgm-accent dgm-fill"/>
  <circle cx="678" cy="137" r="7" class="dgm-accent dgm-fill"/>
  <circle cx="726" cy="137" r="7" class="dgm-accent dgm-fill"/>
  <text x="690" y="188" text-anchor="middle" font-size="10.5" class="dgm-muted">the whole model</text>
  <text x="690" y="206" text-anchor="middle" font-size="11">“How does it decide?”</text>
</svg>
<figcaption><b>Three levels of granularity.</b> The same system explained at widening scope — one prediction, a subgroup, or the model as a whole — each answering a different person's question.</figcaption>
</figure>

## What Counts as an Explanation

Here the course makes its most human-centered move. Borrow Aristotle's four
causes and ask a child *why she was late to class*: because atoms carried her
there at a finite speed; because of traffic and physics; because she could not
decide what to wear; or because she has a date afterward and lost track of time.
All four are true. Only one is the explanation the asker wanted. An explanation
is assembled *for a purpose*, and its shape depends on the **register** of the
language, the communicative goal — teaching a concept versus persuading a
behavior versus correcting a misunderstanding — the hearer's mental model, and
even their emotional state. As the researcher Robert Hoffman put it, *the
property of "being an explanation" is not a property of statements; it is an
interaction. What counts as an explanation depends on what the user needs, what
they already know, and especially their goals.* That reframing — explanation as
interaction, not artifact — is the thesis of the week.

## A Map of the Methods

The techniques sort along two dimensions. **Scope** asks whether an explanation
covers one decision or the whole model; **timing** asks whether the model is
understandable by design or an explanation is generated *after* training.

<figure>
<svg viewBox="0 0 780 336" role="img" aria-label="A two-by-two matrix of explanation methods. Columns are interpretable-by-design versus post-hoc; rows are global versus local scope. Cells list example methods, with local post-hoc explanations highlighted as the most common case.">
  <defs>
    <marker id="arw-xai-mtx" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" class="dgm-fill"/>
    </marker>
  </defs>
  <text x="313" y="42" text-anchor="middle" font-size="12.5" font-weight="700">Interpretable by design</text>
  <text x="611" y="42" text-anchor="middle" font-size="12.5" font-weight="700">Post-hoc</text>
  <text x="34" y="126" text-anchor="middle" font-size="12.5" font-weight="700" transform="rotate(-90 34 126)">Global</text>
  <text x="34" y="252" text-anchor="middle" font-size="12.5" font-weight="700" transform="rotate(-90 34 252)">Local</text>
  <rect x="162" y="58" width="302" height="118" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="313" y="104" text-anchor="middle" font-size="11.5">Logic understandable by itself</text>
  <text x="313" y="126" text-anchor="middle" font-size="11" class="dgm-muted">decision trees, linear &amp; rule-based models</text>
  <rect x="464" y="58" width="302" height="118" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="615" y="104" text-anchor="middle" font-size="11.5">Approximate a complex model</text>
  <text x="615" y="126" text-anchor="middle" font-size="11" class="dgm-muted">surrogate models, global feature importance</text>
  <rect x="162" y="184" width="302" height="118" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="313" y="230" text-anchor="middle" font-size="11.5">Trace one decision</text>
  <text x="313" y="252" text-anchor="middle" font-size="11" class="dgm-muted">follow the path through the tree</text>
  <g class="dgm-accent">
    <rect x="464" y="184" width="302" height="118" class="dgm-soft" stroke="currentColor" stroke-width="1.7"/>
    <text x="615" y="230" text-anchor="middle" font-size="11.5" font-weight="700">Explain one prediction</text>
    <text x="615" y="252" text-anchor="middle" font-size="11">SHAP, LIME, counterfactuals, heatmaps</text>
  </g>
  <line x1="150" y1="326" x2="230" y2="326" stroke="currentColor" stroke-width="1.3" marker-end="url(#arw-xai-mtx)"/>
  <text x="330" y="329" text-anchor="middle" font-size="10.5" class="dgm-muted">how the explanation is produced</text>
</svg>
<figcaption><b>The method matrix.</b> Scope (local vs. global) says what is explained; timing (interpretable-by-design vs. post-hoc) says how — with local post-hoc tools like SHAP and LIME the most common quadrant.</figcaption>
</figure>

Within that map, several families recur. **Feature-attribution** methods —
SHAP, LIME, Grad-CAM, saliency maps, layer-wise relevance propagation — highlight
the inputs that most influenced an output. They are quick and visual, but they
show *where* a model looked, not *why* it mattered, and a persuasive heatmap can
look valid even for an unreliable model. **Example-based** methods explain by
analogy: prototypes surface similar training cases, and counterfactuals name the
smallest change that flips the result — *"if your income were $5,000 higher, the
loan would be approved."* **Concept- and part-based** methods (TCAV, concept
bottleneck models, ProtoPNet) explain in human terms — *"striped feathers," "a
long beak"* — because that mirrors how experts actually teach. Cutting across all
of these, **model-agnostic** methods like LIME and SHAP treat the model as a
black box and perturb its inputs, while **model-specific** methods like
Integrated Gradients and DeepLIFT read a particular architecture's own gradients
and activations.

## Explanation Is a UX Problem

A technically accurate explanation can still fail if a person cannot understand
or act on it. So the design principles are human ones: match the user's mental
model, make the explanation actionable, communicate uncertainty honestly, support
contestability, preserve the user's control, and avoid false precision — more
detail is not more truth. The failure modes are human too. **Over-trust** grows
when a convincing explanation reinforces automation and confirmation bias, even
as the AI is wrong; *knowledge shields* let users rationalize away what they do
not want to see. And there is the problem of **faithfulness**: an explanation can
be plausible without being an accurate account of the model's computation. An
LLM that narrates *why* it answered is producing a story, which may or may not
match the reasoning that produced the answer. Because of this, explanations must
themselves be evaluated — technically, for validity, and from the user's side,
for understandability, satisfaction, utility, and appropriately calibrated trust.

## From Explaining to Evaluating

The frontier of the field reframes the whole interaction. Traditional XAI asks
the system to recommend an answer and then defend it. **Evaluative AI** inverts
that: the human proposes possible interpretations, the AI marshals evidence for
and against each, and final judgment stays with the person. Alongside it sit *AI
as a teacher* — explanations that build a user's own skill — and *participatory
design*, in which explanations are built with users and adapted to their goals,
expertise, and context. The aim is not to make the model visible for its own sake
but to keep the human thinking, deciding, and in charge.

## Why It Matters

Explanation is increasingly a legal requirement, not a courtesy. The Equal Credit
Opportunity Act already forces lenders to issue an "adverse action notice"
spelling out why an application was rejected; the draft EU AI Act demands that
users of high-risk systems be able to interpret and appropriately use their
output. Return to Loomis. The deepest problem was never that COMPAS was
necessarily wrong — it was that the score was *unanswerable*, and a right you
cannot exercise is not a right. Week 6's lesson, and the reason it follows Week
5's reckoning with fairness, is that explainability is where a black box becomes
accountable. The measure of an explanation is not how sophisticated it looks, but
whether the person on the other side can understand it, question it, and act.
