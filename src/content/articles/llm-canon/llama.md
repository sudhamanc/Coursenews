---
course: llm-canon
lectureId: "2023"
title: "Small, Overfed, and Everywhere"
deck: "LLaMA (2023) — Meta's family of smaller models trained far past the compute-optimal point on public data alone, beating models ten times their size and igniting the open-model ecosystem."
order: 12
readingTime: 11
tags: ["pretraining", "open-weights", "inference-optimal", "efficiency", "meta"]
concepts:
  - id: inference-optimal-scaling
    term: Inference-Optimal Scaling
    definition: "Sizing a model for the cost that dominates its life — serving it billions of times — rather than for the compute to train it once, which favors a smaller model trained on far more data."
  - id: overtraining
    term: Overtraining
    definition: "Deliberately training a model on many more tokens than the Chinchilla-optimal point, accepting worse training-compute efficiency in exchange for a smaller, cheaper-to-serve model at a given quality."
  - id: rmsnorm
    term: RMSNorm
    definition: "Root-mean-square normalization, which rescales activations by their root-mean-square without subtracting the mean — cheaper than LayerNorm and used throughout LLaMA for pre-normalization."
  - id: public-data-only
    term: Public-Data-Only Pretraining
    definition: "Training exclusively on openly available corpora — no proprietary or licensed text — so that the result is, in principle, fully reproducible by anyone."
  - id: single-gpu-frontier
    term: Single-GPU Frontier Quality
    definition: "Delivering near-frontier capability from a model small enough to run on one consumer-class GPU, which is what made a broad open-model ecosystem practical."
---

Chinchilla had just taught the field to stop building models that were too big
for their data. LLaMA, from Meta in early 2023, took that lesson and then
deliberately broke its rule — in the other direction. Where Chinchilla asked how
to spend a training budget most efficiently, LLaMA asked a different question
entirely: a model is trained once and then served billions of times, so the cost
that actually matters over its lifetime is the cost of running it, not the cost
of making it. That reframing argued for taking a small model and training it far
past the point Chinchilla called optimal. The result was a family of modest-sized
models, trained on public data alone, that beat giants — and, once the weights
escaped, remade the field.

## Train Once, Serve Forever

Chinchilla minimizes the compute to train a model, which scales as $C \approx
6ND$ for $N$ parameters and $D$ tokens. But that is the wrong objective for a
model headed into production. Over a deployed model's life, inference cost
dominates, and a smaller model is cheaper at every single query. So the sensible
move is to accept a worse training-compute trade — spend more to train — in order
to end up with a smaller model of the same quality. This is **inference-optimal
scaling**, and its practical form is **overtraining**: push a small model far
past the Chinchilla point.

## Past the Optimal Point, on Purpose

LLaMA came in four sizes — 7, 13, 33, and 65 billion parameters — chosen so the
smaller ones fit on a single GPU. The token counts were the radical part. The 7-
and 13-billion models each saw a full trillion tokens; the 33- and 65-billion
models saw 1.4 trillion. Chinchilla's roughly twenty-tokens-per-parameter rule
would put a 7-billion model at about 140 billion tokens; LLaMA fed it seven times
that, and the loss was still falling.

<figure>
<svg viewBox="0 0 820 300" role="img" aria-label="Training loss versus tokens seen for a fixed-size model: the curve falls steeply then flattens but keeps descending; the Chinchilla-optimal stopping point sits early at about 140 billion tokens, while LLaMA continues to one trillion tokens, in a region where loss is still improving.">
  <defs>
    <marker id="arw-llama" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" class="dgm-fill"/>
    </marker>
  </defs>
  <line x1="74" y1="230" x2="762" y2="230" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-llama)"/>
  <line x1="74" y1="230" x2="74" y2="44" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-llama)"/>
  <text x="418" y="268" text-anchor="middle" font-size="12">Tokens seen  (fixed model size)</text>
  <text x="30" y="140" text-anchor="middle" font-size="12" transform="rotate(-90 30 140)">Loss</text>
  <path d="M104,78 C260,168 430,196 720,208" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <line x1="220" y1="230" x2="220" y2="150" stroke="currentColor" stroke-width="1.2" stroke-dasharray="4 3" class="dgm-muted"/>
  <circle cx="220" cy="150" r="4" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="220" y="140" text-anchor="middle" font-size="10.5" class="dgm-muted">Chinchilla-optimal</text>
  <text x="220" y="246" text-anchor="middle" font-size="10" class="dgm-muted">&#8776;140B tokens</text>
  <g class="dgm-accent">
    <line x1="620" y1="230" x2="620" y2="200" stroke="currentColor" stroke-width="1.2" stroke-dasharray="4 3"/>
    <circle cx="620" cy="201" r="4.5" class="dgm-fill"/>
    <path d="M250,153 C360,183 470,196 600,201" fill="none" stroke="currentColor" stroke-width="2" marker-end="url(#arw-llama)"/>
    <text x="424" y="176" text-anchor="middle" font-size="11" font-weight="700">loss still improving</text>
    <text x="620" y="190" text-anchor="middle" font-size="11" font-weight="700">LLaMA-7B: 1.0T tokens</text>
    <text x="620" y="246" text-anchor="middle" font-size="10">&#8776;143 tokens/param</text>
  </g>
  <text x="700" y="224" text-anchor="end" font-size="9.5" class="dgm-muted">&#8594; cheaper to serve for its whole life</text>
</svg>
<figcaption><b>Overtraining on purpose.</b> Chinchilla marks the training-optimal stop at roughly twenty tokens per parameter; LLaMA-7B trains an order of magnitude past it, where loss is still falling, buying a smaller model that is cheaper to serve for its entire deployed life.</figcaption>
</figure>

Put in the same units, LLaMA-7B saw about 143 tokens per parameter against
Chinchilla's twenty — an order of magnitude into the region Chinchilla would call
wasteful, chosen precisely because the waste is in training compute, which you pay
once, and the saving is in inference, which you pay forever.

## Public Data, Nothing Licensed

Every token came from openly available corpora: deduplicated and
quality-classified Common Crawl, C4, GitHub, Wikipedia in twenty languages,
Project Gutenberg and Books3, arXiv's LaTeX sources, and Stack Exchange. No
proprietary or licensed text was used, deliberately — **public-data-only
pretraining** was a design goal, so that the result would be reproducible in
principle by anyone with the compute.

## A Lean Architecture

LLaMA's design is a tightened distillation of PaLM's. It pre-normalizes each
sublayer with **RMSNorm**, which rescales by the root mean square of the
activations and skips LayerNorm's mean subtraction,

$$
\text{RMSNorm}(x)_i \;=\; \frac{x_i}{\sqrt{\tfrac{1}{d}\sum_{j=1}^{d} x_j^{2}}}\; g_i,
$$

uses the SwiGLU activation and RoPE positions, optimizes with AdamW under a cosine
schedule, and relies on an efficient causal-attention implementation that never
computes or stores the masked-out positions. Careful engineering — activation
checkpointing with hand-written backward passes, and overlapping activation
computation with cross-GPU communication — kept the run fast.

## Results

The numbers made the argument concrete. LLaMA-13B outperformed the
175-billion-parameter GPT-3 on most benchmarks while running on a single
consumer-class GPU, and LLaMA-65B was competitive with PaLM-540B and Chinchilla-70B
— trained in about 21 days on 2,048 A100s. **Single-GPU frontier quality** was no
longer a contradiction.

## Why It Matters

LLaMA created the open-model ecosystem more or less by accident. The weights,
released for research only, leaked within a week, and almost everything that
followed grew from that seed: Alpaca and Vicuna, llama.cpp and the quantization
toolchain, the entire low-rank fine-tuning economy, and eventually independent
model families like Mistral, Qwen, and DeepSeek. Llama 2 and 3 later made the
open release intentional. A large share of the adaptation and inference work in
this collection exists only because LLaMA finally gave people capable weights to
build on.

Its limits are the flip side of its influence. LLaMA shipped only base models,
with no instruction tuning, so it was unusable as an assistant without a second
stage. The research-only license was ignored almost immediately — a governance
failure regardless of how one judges the outcome — and the Books3 data created
downstream legal exposure, the same liability that haunted the Pile. And, like
almost everything before it, LLaMA remained English-dominant.

## Lineage

- **Builds on:** [Chinchilla](/courses/llm-canon/chinchilla), whose scaling analysis it deliberately exceeds; [PaLM](/courses/llm-canon/palm), whose architecture it distills; [RoPE](/courses/llm-canon/rope) for positions; and [The Pile](/courses/llm-canon/the-pile) for its public-data philosophy.
- **Leads to:** [LoRA](/courses/llm-canon/lora) and [QLoRA](/courses/llm-canon/qlora), which became mainstream once there was a model worth adapting; [Grouped-Query Attention](/courses/llm-canon/grouped-query-attention), which arrives in Llama 2; and [Muon](/courses/llm-canon/muon).
