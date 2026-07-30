---
course: llm-canon
lectureId: "2020"
title: "The Curve That Priced Intelligence"
deck: "Scaling Laws for Neural Language Models (2020) — Kaplan and colleagues showed that model loss falls as a smooth power law in size, data, and compute, turning how good a model will be into arithmetic you can do before spending a dollar."
order: 5
readingTime: 11
tags: ["scaling", "power-law", "compute-optimal", "loss", "planning"]
concepts:
  - id: power-law-scaling
    term: Power-Law Scaling
    definition: "The finding that test loss falls as a power law in model size, dataset size, or compute — L ≈ (X_c / X)^α — smoothly across many orders of magnitude."
  - id: compute-optimal-allocation
    term: Compute-Optimal Allocation
    definition: "The prescription for how to split a fixed compute budget between model size and training tokens to minimize loss; Kaplan's version favored size and was later corrected."
  - id: sample-efficiency
    term: Sample Efficiency of Large Models
    definition: "The observation that larger models reach any given loss with fewer optimization steps and fewer training tokens than smaller ones."
  - id: irreducible-loss
    term: Irreducible Loss
    definition: "The floor a model's loss approaches — the intrinsic entropy of the data that no amount of scale can drive away."
  - id: architecture-second-order
    term: Architecture Is Second-Order
    definition: "The result that details like depth-versus-width, attention-head count, and feed-forward ratio matter far less to loss than total parameter count."
---

Everyone in deep learning knew that bigger models tended to be better. What nobody
could do, before 2020, was say by how much — precisely enough to plan a training
run before committing the money. Model building was a craft: pick a size, train
it, and find out afterward whether the bet paid off. A paper from OpenAI and Johns
Hopkins, *Scaling Laws for Neural Language Models*, replaced the guesswork with a
ruler. Across seven orders of magnitude, it found, a language model's loss falls as
a smooth power law in the three things you can actually buy — parameters, data, and
compute — and the curve is so regular that you can read a model's future
performance off a graph before you train it. Overnight, model quality stopped being
a research gamble and became a budgeting decision.

## From Craft to Capital

The problem was not that people doubted scale; it was that they could not price it.
Without a characterized relationship between resources and loss, every large run
was a leap of faith, and post-hoc rationalization stood in for planning. The paper's
ambition was to make the trade-offs quantitative enough that a lab could decide, in
advance, how large a model to build and how long to train it.

## The Shape of the Curve

The central result is **power-law scaling**. When one of the three resources —
non-embedding parameter count $N$, dataset size $D$, or compute $C$ — is the
binding constraint and the others are slack, test loss follows a clean power law:

$$
L(X) \approx \left(\frac{X_c}{X}\right)^{\alpha_X}
$$

The exponents are strikingly small — roughly 0.076 for parameters, 0.095 for data,
and 0.050 for compute — which is exactly why the returns feel glacial and yet are
almost eerily dependable. Beneath the whole trend sits an **irreducible loss**: the
entropy of language itself, the floor the curve bends toward and can never cross.

<figure>
<svg viewBox="0 0 620 350" role="img" aria-label="Scaling laws plot on log-log axes: test loss falls as a straight descending line against compute, a power law, and flattens toward an irreducible-loss floor drawn as a dashed horizontal asymptote.">
  <defs>
    <marker id="arw-scaling" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" class="dgm-fill"/>
    </marker>
  </defs>
  <line x1="100" y1="300" x2="100" y2="50" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-scaling)"/>
  <line x1="100" y1="300" x2="560" y2="300" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-scaling)"/>
  <line x1="130" y1="272" x2="560" y2="272" stroke="currentColor" stroke-width="1.3" stroke-dasharray="5 4" class="dgm-muted"/>
  <text x="300" y="290" text-anchor="middle" font-size="11" class="dgm-muted">irreducible loss L∞</text>
  <g class="dgm-accent">
    <line x1="130" y1="78" x2="540" y2="250" stroke="currentColor" stroke-width="2"/>
    <circle cx="170" cy="95" r="4" class="dgm-fill"/>
    <circle cx="260" cy="133" r="4" class="dgm-fill"/>
    <circle cx="360" cy="175" r="4" class="dgm-fill"/>
    <circle cx="460" cy="216" r="4" class="dgm-fill"/>
    <text x="410" y="118" text-anchor="middle" font-size="12.5">L ≈ (C_c / C)^α</text>
  </g>
  <text x="474" y="252" text-anchor="middle" font-size="10.5" class="dgm-muted">slope −α ≈ 0.05</text>
  <text x="330" y="333" text-anchor="middle" font-size="12">compute  C  (log scale)</text>
  <text x="44" y="175" text-anchor="middle" font-size="12" transform="rotate(-90 44 175)">test loss  (log scale)</text>
</svg>
<figcaption><b>A straight line on log-log paper.</b> Loss falls as a power law in compute — dependable enough to plan a run in advance — bottoming out only at the irreducible entropy of language itself.</figcaption>
</figure>

## What Doesn't Matter

Just as valuable is the negative result: **architecture is second-order**. Within
reasonable bounds, the choices researchers had agonized over — depth versus width,
how many attention heads, the feed-forward ratio — barely move the loss compared to
total parameter count. The practical instruction is bracing: stop tuning the shape
of the model and buy scale instead. It is an early, empirical statement of the
lesson that generic methods riding more compute tend to beat clever hand-designed
ones.

## Bigger, Then Stop Early

The most counterintuitive finding concerns the **sample efficiency of large
models**. Bigger models reach any target loss in fewer optimization steps and on
fewer tokens than smaller ones. So under a fixed compute budget, the loss-optimal
move is not to train a modest model to convergence — it is to train a very large
model and stop it well short. Working the math through, the paper derived a
**compute-optimal allocation** that poured most of a budget into parameters:

$$
N \propto C^{0.73}, \qquad D \propto C^{0.27}
$$

This is the recommendation that directly justified GPT-3's design a few months
later.

## Why It Matters

The deeper shift is institutional. Scaling laws converted model training from a
craft into capital allocation — a spreadsheet exercise in which loss is a function
of dollars — and every frontier lab's planning process descends from this paper.
It is the intellectual license for the entire industrialization of the field.

And yet the specific allocation was wrong, in an instructive way. The
learning-rate schedules used across the sweep did not adapt cleanly, and the
smallest-model regime was over-weighted in the fits; both errors tilted the
parameter-versus-token trade-off toward parameters. Two years later, Chinchilla's
re-analysis found the true ratio is closer to scaling model and data in equal
measure — which meant the field had spent those years building models that were too
large and too undertrained. It is one of the cleaner case studies in how a subtle
methodological error, wrapped in a compelling result, can propagate through an
entire industry before anyone catches it.

## Lineage

- **Builds on:** [GPT-2](/courses/llm-canon/gpt-2), whose observed log-linear trend this paper makes rigorous.
- **Leads to:** [GPT-3](/courses/llm-canon/gpt-3), the direct application of the allocation, and [Chinchilla](/courses/llm-canon/chinchilla), the correction to it.
