---
course: llm-canon
lectureId: "2022"
title: "The Notebook They Published Too"
deck: "OPT (2022) — Meta released a GPT-3-scale model not just as open weights but with a candid daily logbook of every crash, divergence, and restart across a months-long training run."
order: 10
readingTime: 11
tags: ["pretraining", "open-weights", "reproducibility", "training", "meta"]
concepts:
  - id: open-weights-research
    term: Open Weights for Research
    definition: "Releasing a model's trained parameters, code, and a suite of sizes so scientists outside a few well-funded labs can study, probe, and build on a frontier-scale system directly."
  - id: training-logbook
    term: Training Logbook
    definition: "A public, dated record of what went wrong during a large training run — hardware failures, loss divergences, and the mitigations attempted — treated as a research deliverable in its own right."
  - id: loss-divergence-recovery
    term: Loss-Divergence Recovery
    definition: "The practical craft of rescuing a run that has begun to diverge: lowering the learning rate, resetting optimizer state, changing gradient clipping, or moving to a different set of nodes."
  - id: reproducibility-gap
    term: Reproducibility Gap
    definition: "The distance between a model that is replicable in principle, because its design is published, and one that is reproducible in practice, because the knowledge to train it stably is shared."
  - id: carbon-accounting
    term: Carbon Accounting
    definition: "Reporting the energy use and estimated carbon emissions of a training run, making environmental cost a visible, comparable figure rather than an unstated externality."
---

Every published account of training a giant language model describes a success.
The paper reports the final loss, the benchmark scores, the clever configuration
— and says almost nothing about the three-in-the-morning crashes, the runs that
slid into nonsense, the dozens of manual restarts that any months-long training
actually demands. That silence is a kind of secrecy. In 2022 Meta's OPT broke it,
releasing not only a GPT-3-scale model's weights but a running logbook of
everything that went wrong while making it.

## Replicable in Theory, Not in Practice

GPT-3 was public enough to reimplement and yet, for almost everyone,
unreproducible — because the hard-won knowledge of how a 175-billion-parameter
run behaves over months lived as folklore inside a handful of labs. Published
papers describe the run that worked; they do not describe the thirty-five that had
to be restarted first. The distance between "here is the architecture" and "here
is how to actually train it without it falling apart" is the **reproducibility
gap**, and closing it was OPT's real purpose.

## A Suite, Not a Monolith

OPT was released as **open weights for research**: eight models from 125 million
to 175 billion parameters, so researchers could study how behavior scales without
owning frontier compute, with the 175-billion flagship available under a
non-commercial license. It was trained on 992 A100 80GB GPUs using fully sharded
data parallelism together with Megatron-style tensor parallelism, at roughly one
seventh the estimated carbon footprint of GPT-3 — a figure Meta reported openly,
making **carbon accounting** part of the deliverable rather than an unmentioned
externality.

## The Logbook

The genuinely novel artifact was the logbook. Alongside the weights, Meta
published a dated, candid diary of the run: the hardware that failed, the loss
that diverged, and every mitigation the team reached for — dropping the learning
rate, resetting the optimizer state, swapping in a fresh set of nodes, adjusting
gradient clipping. Around thirty-five manual restarts over the run. Read it and
you watch a frontier training wobble, stall, and get nursed back to health — the
craft of **loss-divergence recovery** written down in real time. The record makes
plain what the polished papers omit: that a run this size is not launched and left
alone but babysat around the clock, and that many of the interventions were
judgment calls made under pressure rather than principled recipes.

<figure>
<svg viewBox="0 0 840 300" role="img" aria-label="A training-loss curve descends over a months-long run but is punctuated by three sharp spikes, each annotated as a restart, a node swap, and a learning-rate drop; below, three boxes labeled weights, code, and logbook are released together and point to the outcome that large-scale training is made legible.">
  <defs>
    <marker id="arw-opt" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" class="dgm-fill"/>
    </marker>
  </defs>
  <text x="300" y="30" text-anchor="middle" font-size="12" font-weight="700">Training loss over a months-long run</text>
  <line x1="58" y1="170" x2="576" y2="170" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-opt)"/>
  <line x1="58" y1="170" x2="58" y2="44" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-opt)"/>
  <text x="30" y="110" text-anchor="middle" font-size="11" transform="rotate(-90 30 110)">loss</text>
  <text x="300" y="190" text-anchor="middle" font-size="10.5" class="dgm-muted">training steps</text>
  <polyline points="66,66 150,100 172,60 176,108 250,120 280,80 284,126 370,136 400,102 404,144 500,150 556,158" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <g class="dgm-accent">
    <circle cx="172" cy="60" r="4" class="dgm-fill"/>
    <circle cx="280" cy="80" r="4" class="dgm-fill"/>
    <circle cx="400" cy="102" r="4" class="dgm-fill"/>
    <text x="172" y="50" text-anchor="middle" font-size="10.5" font-weight="700">1</text>
    <text x="280" y="70" text-anchor="middle" font-size="10.5" font-weight="700">2</text>
    <text x="400" y="92" text-anchor="middle" font-size="10.5" font-weight="700">3</text>
  </g>
  <text x="604" y="58" text-anchor="start" font-size="11" font-weight="700">Logbook</text>
  <g class="dgm-accent">
    <circle cx="610" cy="80" r="3.5" class="dgm-fill"/>
    <circle cx="610" cy="102" r="3.5" class="dgm-fill"/>
    <circle cx="610" cy="124" r="3.5" class="dgm-fill"/>
  </g>
  <text x="624" y="84" text-anchor="start" font-size="10.5">1 &#183; restart from checkpoint</text>
  <text x="624" y="106" text-anchor="start" font-size="10.5">2 &#183; swap to fresh nodes</text>
  <text x="624" y="128" text-anchor="start" font-size="10.5">3 &#183; learning-rate &#8595;</text>
  <text x="604" y="152" text-anchor="start" font-size="10" class="dgm-muted">&#8776; 35 manual restarts in all</text>
  <rect x="90" y="224" width="120" height="46" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="150" y="252" text-anchor="middle" font-size="12" font-weight="700">Weights</text>
  <rect x="230" y="224" width="120" height="46" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="290" y="252" text-anchor="middle" font-size="12" font-weight="700">Code</text>
  <g class="dgm-accent">
    <rect x="370" y="224" width="140" height="46" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <text x="440" y="252" text-anchor="middle" font-size="12" font-weight="700">Logbook</text>
  </g>
  <line x1="512" y1="247" x2="574" y2="247" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-opt)"/>
  <rect x="578" y="224" width="248" height="46" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="702" y="245" text-anchor="middle" font-size="11.5" font-weight="700">Large-scale training</text>
  <text x="702" y="261" text-anchor="middle" font-size="11.5" font-weight="700">made legible</text>
</svg>
<figcaption><b>The logbook as artifact.</b> OPT published its loss curve with every spike and recovery annotated — roughly thirty-five restarts — and shipped weights, code, and that diary together, making a frontier-scale run legible.</figcaption>
</figure>

## What the Benchmarks Did and Didn't Show

On standard benchmarks, OPT-175B landed roughly where GPT-3 did at matched size,
though in day-to-day use its generations lagged — a gap that traced mostly to
weaker training data than the closed competitors could draw on. But the benchmark
table was never the point. The contribution was epistemic: making a frontier-scale
run legible to the large majority of researchers who would never have the compute
to attempt one. The eight-model suite mattered here too — with checkpoints from
125 million to 175 billion parameters in hand, researchers could study how a
behavior emerges across scale rather than inferring it from a single point, which
turned OPT into a workbench for interpretability as much as a model to deploy.

## Why It Matters

OPT changed the norm for what a serious model release includes. After it, "open"
increasingly meant weights plus code plus an honest account of the process, and
its logbook remains one of the most useful documents in the field for anyone
planning a large run — a rare look at what actually happens between the first step
and the final checkpoint.

Its limits were real. The model's practical quality trailed GPT-3, its restrictive
license blunted real-world adoption, and the weaker data that explained most of
the quality gap was itself a consequence of doing everything with openly available
sources. OPT did not win on capability. It won on candor, and it made openness —
including the unflattering parts — a legitimate way to do frontier research.

## Lineage

- **Builds on:** [GPT-3](/courses/llm-canon/gpt-3), whose configuration OPT replicated in the open.
- **Leads to:** [BLOOM](/courses/llm-canon/bloom), which pushed the open process further into governance and multiple languages, and [LLaMA](/courses/llm-canon/llama), whose open weights reshaped the field.
