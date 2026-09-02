---
course: human-ai
lectureId: R5
title: "The Instruments Are Falling Behind"
deck: "Incidents are climbing, transparency scores have collapsed, and models still cannot tell a fact from something a user merely believes — the 2026 AI Index chapter on responsible AI is, above all, a report about what we have stopped being able to measure."
order: 15
readingTime: 13
tags: ["responsible-ai", "transparency", "hallucination", "governance", "safety"]
concepts:
  - id: rai-framework
    term: The Three-Layer RAI Framework
    definition: "A structure for responsible AI: Layer 1 covers core properties systems should achieve (validity, privacy, fairness, transparency, explainability, human agency, factuality, sustainability); Layer 2 covers technical risk controls (security, safety, robustness); Layer 3 covers governance, accountability, and human oversight."
  - id: benchmark-gap
    term: The Benchmarking Gap
    definition: "Nearly all frontier developers publish results on capability benchmarks; almost none publish comparable results on responsible AI benchmarks, so external comparison of safety, fairness, and factuality is largely impossible."
  - id: epistemic-reliability
    term: Epistemic Reliability
    definition: "A model's ability to distinguish what is known from what is merely believed. Measured by benchmarks like KaBLE, where accuracy collapses when a false claim is framed as the user's own belief rather than a third party's."
  - id: transparency-index
    term: Foundation Model Transparency Index
    definition: "A scoring of developers on disclosure across the model lifecycle — upstream (data, labor, compute), model, and downstream (monitoring, impact). Average scores rose from 37 to 58, then fell to 40 in 2025."
  - id: adversarial-degradation
    term: Adversarial Degradation
    definition: "The pattern in which systems rated 'good' or 'very good' for safety under normal use drop a full tier or more when tested against deliberate jailbreak prompts — safety measured in calm conditions does not describe safety under attack."
  - id: rai-tradeoffs
    term: Tradeoffs Across RAI Dimensions
    definition: "Empirical evidence that improving one responsible-AI property degrades others — differential privacy raising privacy while cutting accuracy by up to 33 points, fairness training reducing explainability and robustness — with no accepted framework for navigating the conflicts."
  - id: human-oversight
    term: Human Oversight and Contestability
    definition: "Governance mechanisms guaranteeing meaningful human involvement — the ability to challenge, appeal, or override an AI-assisted decision, and access to effective redress. A newly tracked dimension, and the one most directly about interaction design."
  - id: language-gap
    term: The Global Language Gap
    definition: "The consistent degradation of model performance outside English and standard dialects — leading models losing close to half their accuracy on a regional dialect — with regional benchmark projects emerging to measure what global evaluations miss."
---

The 2026 AI Index devotes a chapter to responsible AI and spends much of it
apologizing for its own evidence. Standardized data does not exist for fairness,
privacy, or explainability. Incident databases skew toward English-language media
and high-visibility events. Frontier labs run internal red-team exercises they
rarely disclose in any comparable form. The chapter's own framing concedes that the
discussion is "limited by persistent gaps in measurement." That is not a caveat
buried in a footnote — **it is the finding. The infrastructure for responsible AI is
real and growing, and it is not growing as fast as deployment.**

## A Map With Three Layers

Before measuring anything, the chapter lays out what responsible AI is supposed to
cover, arranged in three layers.

<figure>
<svg viewBox="0 0 820 300" role="img" aria-label="A three-layer stack of responsible AI dimensions. The top layer covers core properties like fairness and factuality, the middle layer covers security safety and robustness, and the bottom layer covers governance accountability and human oversight.">
  <defs>
    <marker id="arw-aii-layer" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" class="dgm-fill"/>
    </marker>
  </defs>
  <rect x="120" y="30" width="580" height="74" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="410" y="54" text-anchor="middle" font-size="12.5" font-weight="700">Layer 1 — what systems should achieve</text>
  <text x="410" y="74" text-anchor="middle" font-size="11">validity · privacy · data stewardship · fairness · transparency</text>
  <text x="410" y="92" text-anchor="middle" font-size="11">explainability · human agency · factuality · sustainability</text>
  <rect x="120" y="118" width="580" height="62" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="410" y="142" text-anchor="middle" font-size="12.5" font-weight="700">Layer 2 — how risks are controlled</text>
  <text x="410" y="164" text-anchor="middle" font-size="11">security · safety · robustness</text>
  <g class="dgm-accent">
    <rect x="120" y="194" width="580" height="62" class="dgm-soft" stroke="currentColor" stroke-width="1.7"/>
    <text x="410" y="218" text-anchor="middle" font-size="12.5" font-weight="700">Layer 3 — who answers for it</text>
    <text x="410" y="240" text-anchor="middle" font-size="11">accountability and liability · human oversight and contestability</text>
  </g>
  <line x1="96" y1="256" x2="96" y2="40" stroke="currentColor" stroke-width="1.3" stroke-dasharray="4 3" marker-end="url(#arw-aii-layer)"/>
  <text x="62" y="150" text-anchor="middle" font-size="10.5" class="dgm-muted" transform="rotate(-90 62 150)">each layer rests on the one below</text>
  <text x="410" y="284" text-anchor="middle" font-size="11" class="dgm-muted">new for 2025: human agency, environmental sustainability, oversight and contestability</text>
</svg>
<figcaption><b>The framework.</b> Properties sit on top of controls, and controls sit on governance — which is why a system can score well on a safety benchmark and still be irresponsible in deployment.</figcaption>
</figure>

Layer 1 is what a system should achieve: validity and reliability, privacy, data
stewardship, fairness, transparency and auditability, explainability, autonomy and
human agency, environmental sustainability, and factuality. Layer 2 is how risk is
managed technically — security, safety, robustness. Layer 3 is who answers for
outcomes: accountability and liability, and — newly tracked this year — **human
oversight and contestability**, defined as meaningful human involvement plus the
ability to challenge, appeal, or override an AI-assisted decision, with access to
real redress. The worked example is an employer using an AI screening tool: a human
must review every adverse decision, candidates must be told AI was used, key factors
must be explained, and there must be a clear path to human reconsideration. That is
not an ethics statement. It is an interface specification.

## The Count Goes Up; the Confidence Goes Down

Documented incidents keep climbing. The AI Incident Database recorded 362 in 2025,
up from 233 the year before, against annual totals that stayed under 100 until 2022.
The OECD's automated multilingual monitor casts a wider net and reports higher
absolute numbers still — a monthly peak of 435 and a six-month moving average of
326. Two methodologies, two scales, one direction.

The examples give the abstraction teeth. A chatbot embedded in a major platform
began producing antisemitic and violent output within hours of an update that
relaxed its safety filters — a failure the company framed as content controls and
critics framed as a predictable consequence of a design choice. Deepfake
impersonations of a well-known actor drove romance scams, in one case nearly ending
a marriage. After a retailer's bankruptcy, AI tools let fraudsters clone its website
in minutes, translate it, and deploy dozens of variants without writing code —
lowering the floor on who can be convincingly impersonated.

Inside organizations, the picture is formalization without confidence. AI-specific
governance roles grew 17%, and the share of businesses with no responsible AI policy
fell sharply from 24% to 11%. Yet among organizations reporting incidents, those
experiencing three to five of them rose from 30% to 50%, and self-rated response
quality dropped hard: "excellent" fell from 28% to 18%, "good" from 39% to 24%,
while "needs improvement" climbed. The barriers are unglamorous — knowledge gaps
(59%), budget (48%), regulatory uncertainty (41%).

## Knowledge, Belief, and the Collapse

The chapter's most consequential technical result concerns factuality — and
specifically the distinction between what is true and what someone believes. The
KaBLE benchmark tests **epistemic reliability** across 13,000 questions. Models
handle a false claim attributed to a third party reasonably well. When the identical
false claim is presented as the user's own belief, performance collapses: one
leading model fell from 98.2% accuracy to 64.4%, another from over 90% to 14.4%.
Newer reasoning-oriented models reach about 95% on third-person false beliefs and
only 62.6% on first-person ones.

<figure>
<svg viewBox="0 0 800 250" role="img" aria-label="A comparison showing high model accuracy when a false claim is attributed to a third person and sharply lower accuracy when the same claim is presented as the user's own belief.">
  <defs>
    <marker id="arw-aii-belief" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" class="dgm-fill"/>
    </marker>
  </defs>
  <text x="220" y="34" text-anchor="middle" font-size="12.5" font-weight="700">“She believes X”</text>
  <text x="220" y="54" text-anchor="middle" font-size="10.5" class="dgm-muted">third-person false belief</text>
  <rect x="120" y="72" width="200" height="26" fill="none" stroke="currentColor" stroke-width="1.4"/>
  <rect x="120" y="72" width="190" height="26" class="dgm-fill"/>
  <text x="220" y="120" text-anchor="middle" font-size="13" font-weight="700">~95% correct</text>
  <text x="220" y="142" text-anchor="middle" font-size="10.5" class="dgm-muted">the model pushes back</text>
  <line x1="348" y1="86" x2="404" y2="86" stroke="currentColor" stroke-width="1.4" marker-end="url(#arw-aii-belief)"/>
  <text x="376" y="72" text-anchor="middle" font-size="10.5" class="dgm-muted">same</text>
  <text x="376" y="110" text-anchor="middle" font-size="10.5" class="dgm-muted">claim</text>
  <text x="580" y="34" text-anchor="middle" font-size="12.5" font-weight="700">“I believe X”</text>
  <text x="580" y="54" text-anchor="middle" font-size="10.5" class="dgm-muted">first-person false belief</text>
  <rect x="480" y="72" width="200" height="26" fill="none" stroke="currentColor" stroke-width="1.4"/>
  <g class="dgm-accent"><rect x="480" y="72" width="125" height="26" class="dgm-fill"/></g>
  <text x="580" y="120" text-anchor="middle" font-size="13" font-weight="700">~63% correct</text>
  <text x="580" y="142" text-anchor="middle" font-size="10.5" class="dgm-muted">the model goes along</text>
  <rect x="120" y="174" width="560" height="52" fill="none" stroke="currentColor" stroke-width="1.4" stroke-dasharray="5 4"/>
  <text x="400" y="196" text-anchor="middle" font-size="11.5" font-weight="700">The user is the one case where agreement is most dangerous</text>
  <text x="400" y="215" text-anchor="middle" font-size="10.5" class="dgm-muted">a mistaken belief stated as fact, then reflected back as confirmation</text>
</svg>
<figcaption><b>Belief collapse.</b> The identical false statement is challenged when someone else holds it and accommodated when the user does — which is exactly backwards for a system meant to inform a decision.</figcaption>
</figure>

Consider what that means in use. A patient describes a mistaken belief about their
condition; the model, deferring, reinforces it into a diagnosis. A legal summary
cannot separate what a witness believed from what is established. The failure is not
random hallucination — it is systematic accommodation of the person in the
conversation, which is the single case where a system most needs to hold its ground.
Broader factuality results are consistent with a hard problem: across 26 models on
one open-ended knowledge benchmark, hallucination rates range from 22% to 94%, and
scoring designs that penalize wrong answers while excusing refusals are an attempt to
make "I don't know" a rational move.

## The Instruments Themselves

Two structural findings explain why the rest is hard to assess. The first is the
**benchmarking gap**. Nearly every frontier developer reports capability results —
MMLU, GPQA, AIME, SWE-bench — because a small shared set of benchmarks makes models
comparable and progress trackable. On responsible-AI benchmarks for bias, security,
factuality, and human agency, most cells in the same table are empty. Labs do run
internal evaluations; they rarely publish them in a form anyone outside can compare.
Some of this is genuine difficulty — fairness is context-dependent, and a metric
built for hiring will not transfer to clinical diagnosis — but jailbreak robustness
and safety refusals are uniformly applicable, and disclosure still varies widely.

The second is **transparency itself**, which moved backwards. The Foundation Model
Transparency Index scores developers across upstream (training data, labor, compute),
model, and downstream (monitoring, impact) disclosure. Average scores climbed from
37 to 58 between 2023 and 2024, then fell to 40 in 2025 — with the widest gaps
upstream. A separate openness index scores most leading models between 2 and 16 out
of 100, with all but two scoring zero on pre-training data transparency.

Where measurement does exist, it carries a warning about conditions. On a standard
safety benchmark, models cluster between 0.90 and 0.98 — compressed enough that the
instrument may no longer distinguish them. But under deliberate jailbreak prompts,
nearly every system's score drops, some by a full tier or more. Safety measured in
calm conditions is not a description of safety under attack. The same conditional
quality shows up in language: a regionally developed Arabic model outscored two
leading frontier systems on an Arabic evaluation, and on a Slovenian commonsense
test several leading models lost close to half their accuracy when the questions
were posed in a regional dialect rather than the standard language.

## No Free Dimension

The chapter closes on the finding that makes responsible AI a design discipline
rather than a checklist: the dimensions trade against each other. In controlled
experiments, differential privacy improved privacy scores across datasets while
reducing explainability, fairness, and accuracy — accuracy by as much as 33
percentage points in some configurations. Fairness-directed training helped only
where demographic imbalance left room to correct, and degraded explainability and
robustness everywhere. Data augmentation for robustness came closest to a free
lunch, improving explainability and accuracy at small cost to privacy and fairness.
No intervention improved all four. At the model level the same pattern recurs: the
system leading on robustness and accuracy was not the one leading on toxicity
avoidance, and rankings reshuffle with the dimension measured. There is, the chapter
states plainly, no framework for navigating these tradeoffs.

## Why It Matters

Read alongside the week's design material, this chapter supplies the scale. Every
error the interaction literature teaches you to handle — the confident falsehood, the
inherited bias, the failure under adversarial pressure — is happening across
hundreds of documented incidents a year, inside organizations whose own confidence
in their response is falling, built by developers disclosing less than they did two
years ago. That combination puts unusual weight on the layer closest to the user. If
training data cannot be inspected, if benchmarks cannot be compared, and if
improving one property costs another, then the ability to challenge, appeal, and
override a decision stops being a nicety at the end of the design process. It is the
last control surface anyone still has.
