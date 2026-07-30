---
course: llm-canon
lectureId: "2022"
title: "The Jump"
deck: "PaLM (2022) — Google's 540-billion-parameter model, trained across two TPU pods, delivered the era's strongest evidence that some abilities do not improve smoothly with scale but appear all at once."
order: 9
readingTime: 11
tags: ["scaling", "emergent-abilities", "architecture", "tpu", "google"]
concepts:
  - id: emergent-abilities
    term: Emergent Abilities
    definition: "Capabilities that stay near chance as a model grows and then improve sharply past some scale threshold, appearing discontinuous rather than following the smooth decline of pretraining loss."
  - id: swiglu
    term: SwiGLU
    definition: "A gated feed-forward activation that replaces ReLU with a Swish-gated linear unit, consistently improving quality at scale for a modest parameter cost; adopted by PaLM and most models after it."
  - id: parallel-block
    term: Parallel Transformer Block
    definition: "Computing the attention and feed-forward sublayers from the same normalized input and summing them, rather than stacking them sequentially — roughly fifteen percent faster training at large scale."
  - id: model-flops-utilization
    term: Model FLOPs Utilization
    definition: "The fraction of a hardware fleet's peak floating-point throughput a training run actually achieves; PaLM reached 46.2%, then the highest reported at its scale."
  - id: cross-pod-training
    term: Cross-Pod Training
    definition: "Training one dense model across multiple TPU pods that are not joined by a pod's internal high-bandwidth fabric, using data parallelism over the slower datacenter network between them."
---

Most of what scale buys is boring in the best way: loss goes down, a little more
compute at a time, along a curve so smooth you can extrapolate it for years.
PaLM, Google's 540-billion-parameter model, was most interesting for the places
that curve broke. Trained in 2022 across two of Google's TPU pods on a
then-record fleet of accelerators, it was not merely the largest dense model of
its moment. It was the clearest demonstration that certain capabilities stay near
chance as a model grows — through eight billion parameters, through sixty-two
billion — and then, past some threshold, snap into existence.

## Two Pods, One Model

The first problem PaLM solved was infrastructural. A TPU pod is a tightly
connected island of chips joined by a high-bandwidth fabric; two pods are joined
only by the ordinary datacenter network, which is far slower. Training a single
dense model that spans two of them means splitting the work so that the
communication that must cross the gap is the kind the slow link can tolerate.
Google's Pathways system handled it, wiring 6,144 TPU v4 chips into one run with
model parallelism inside each pod and data parallelism across the two. The result
was **cross-pod training** at 46.2% **model FLOPs utilization** — the fraction of
the hardware's peak throughput actually delivered,

$$
\text{MFU} \;=\; \frac{\text{observed throughput (FLOP/s)}}{\text{hardware peak (FLOP/s)}},
$$

then the highest figure reported at that scale.

## A Handful of Small, Cumulative Choices

PaLM's architecture is a catalog of individually minor refinements that together
became a template. It swapped ReLU for **SwiGLU**, a gated activation that pays a
little in parameters for a consistent quality gain. It used **Multi-Query
Attention** to make decoding cheaper, **RoPE** for its positional signal, shared
input and output embeddings, and — for stability at scale — no bias terms
anywhere. Its 256,000-token SentencePiece vocabulary was sized for multilingual
coverage.

The most structural change was the **parallel transformer block**. A standard
block runs attention and the feed-forward network in sequence,

$$
y \;=\; x + \text{MLP}\big(\text{LN}(x + \text{Attn}(\text{LN}(x)))\big),
$$

while PaLM computes both from the same normalized input and adds them,

$$
y \;=\; x + \text{Attn}(\text{LN}(x)) + \text{MLP}(\text{LN}(x)),
$$

which lets the two large matrix multiplies be fused and runs about fifteen
percent faster at scale.

## When the Curve Breaks

Trained on 780 billion tokens of filtered web, books, Wikipedia, conversation,
code, and multilingual text, PaLM's run was stabilized by a memorable trick: when
the loss spiked, the team rolled back roughly a hundred steps and skipped the
offending batches — evidence that spikes were interactions between specific data
and model state, not simply bad batches. The payoff was state-of-the-art
few-shot results on 28 of 29 English tasks and a score above the average human on
the BIG-bench suite. But the headline was different in kind. On several tasks,
performance was near-random at 8 billion and 62 billion parameters and then
jumped sharply at 540 billion — and paired with Chain-of-Thought prompting, PaLM
reached 58% on grade-school math word problems, a domain where models had been
useless.

<figure>
<svg viewBox="0 0 820 320" role="img" aria-label="Two curves against model scale on a log axis: a grey curve for broad benchmarks rises smoothly with size, while a red curve for an emergent task stays near random through 8 billion and 62 billion parameters and then jumps sharply at 540 billion parameters.">
  <defs>
    <marker id="arw-palm" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" class="dgm-fill"/>
    </marker>
  </defs>
  <line x1="78" y1="250" x2="762" y2="250" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-palm)"/>
  <line x1="78" y1="250" x2="78" y2="42" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-palm)"/>
  <text x="420" y="292" text-anchor="middle" font-size="12">Model scale  (log parameters)</text>
  <text x="30" y="150" text-anchor="middle" font-size="12" transform="rotate(-90 30 150)">Capability</text>
  <line x1="200" y1="246" x2="200" y2="254" stroke="currentColor" stroke-width="1.5"/>
  <line x1="430" y1="246" x2="430" y2="254" stroke="currentColor" stroke-width="1.5"/>
  <line x1="660" y1="246" x2="660" y2="254" stroke="currentColor" stroke-width="1.5"/>
  <text x="200" y="270" text-anchor="middle" font-size="10.5" class="dgm-muted">8B</text>
  <text x="430" y="270" text-anchor="middle" font-size="10.5" class="dgm-muted">62B</text>
  <text x="660" y="270" text-anchor="middle" font-size="10.5" class="dgm-muted">540B</text>
  <line x1="660" y1="250" x2="660" y2="80" stroke="currentColor" stroke-width="1.2" stroke-dasharray="4 3" class="dgm-muted"/>
  <path d="M120,226 C300,205 500,175 700,120" fill="none" stroke="currentColor" stroke-width="1.5" class="dgm-muted"/>
  <text x="700" y="110" text-anchor="end" font-size="10" class="dgm-muted">smooth benchmarks</text>
  <g class="dgm-accent">
    <path d="M150,224 L430,220 L500,214 L590,150 L660,82" fill="none" stroke="currentColor" stroke-width="2" marker-end="url(#arw-palm)"/>
    <circle cx="200" cy="223" r="3.5" class="dgm-fill"/>
    <circle cx="430" cy="220" r="3.5" class="dgm-fill"/>
    <circle cx="660" cy="82" r="4.5" class="dgm-fill"/>
    <text x="300" y="210" text-anchor="middle" font-size="10.5">near-random</text>
    <text x="596" y="120" text-anchor="middle" font-size="11.5" font-weight="700">emergence</text>
    <text x="654" y="70" text-anchor="end" font-size="10.5" font-weight="700">emergent task</text>
  </g>
</svg>
<figcaption><b>Discontinuous scaling.</b> Broad benchmarks improve smoothly with size (grey), but some tasks stay near chance through 8B and 62B parameters and then jump sharply at 540B (red) — the pattern PaLM made famous.</figcaption>
</figure>

## The Caveat That Followed

The **emergent abilities** framing became one of the most cited — and most
contested — claims of the period. Later work argued that the discontinuity can be
an artifact of the metric rather than the model: a task scored by exact match is
all-or-nothing, so a capability that is in fact improving smoothly underneath can
look like a sudden jump when you only count fully correct answers. Whether
emergence is a property of models or of our yardsticks remains genuinely open. It
does not diminish PaLM's demonstration; it sharpens the question.

## Why It Matters

PaLM is the strongest single piece of evidence that scaling buys qualitatively
new behavior, not merely lower perplexity — the empirical backbone of the
argument that you cannot always predict a large model's abilities from a small
one's. Just as important, its architecture became the blueprint. SwiGLU, RoPE, no
biases, pre-normalization, parallel blocks: LLaMA and nearly everything after it
inherited the recipe.

Its limits were equally instructive. At 540 billion dense parameters PaLM is
extraordinarily expensive to serve, which became a central argument for sparse
mixture-of-experts models. And at 780 billion tokens for 540 billion parameters —
roughly 1.4 tokens per parameter — it was badly undertrained by the standard
Chinchilla published just a month later. It proved that scale unlocks new
abilities, and, almost simultaneously, that the field did not yet know how to
spend that scale efficiently.

## Lineage

- **Builds on:** [GPT-3](/courses/llm-canon/gpt-3), whose scale-and-prompt approach PaLM pushed further with an efficiency-tuned architecture.
- **Leads to:** [Chain-of-Thought](/courses/llm-canon/chain-of-thought), whose headline results run on PaLM, and the architectural line of [RoPE](/courses/llm-canon/rope) and [Multi-Query Attention](/courses/llm-canon/multi-query-attention) it helped popularize.
