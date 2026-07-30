---
course: llm-canon
lectureId: "2021"
title: "One Base Model, a Thousand Personalities"
deck: "LoRA (2021) — Microsoft's trick of freezing the pretrained weights and learning a low-rank update beside them, cutting the trainable parameters ten-thousandfold and folding back in with zero inference cost."
order: 19
readingTime: 11
tags: ["adaptation", "fine-tuning", "peft", "low-rank", "parameter-efficient"]
concepts:
  - id: low-rank-adaptation
    term: "Low-Rank Adaptation"
    definition: "Freezing the pretrained weights and expressing the fine-tuning update as the product of two small matrices B and A of rank r, so only a fraction of a percent of the parameters are trained."
  - id: intrinsic-dimension
    term: "Intrinsic Dimensionality"
    definition: "The finding that adapting a large pretrained model to a downstream task lives in a very low-dimensional subspace, which motivates constraining the weight update itself to be low-rank."
  - id: rank-and-scaling
    term: "Rank and Scaling (r, alpha)"
    definition: "The two knobs of LoRA: the rank r sets how expressive the update can be, and the scaling factor alpha/r controls its magnitude relative to the frozen weights."
  - id: adapter-merging
    term: "Adapter Merging"
    definition: "Because the update is a plain linear term, W0 + BA can be computed once and folded into the weight matrix before deployment, so the adapter adds exactly zero latency."
  - id: peft
    term: "Parameter-Efficient Fine-Tuning (PEFT)"
    definition: "The family of methods that adapt a frozen base model by training only a small set of added parameters instead of a full copy of the weights."
---

Fine-tuning used to mean making a full copy. Take a pretrained model, adjust
every weight for the new task, and save the result — a second model the exact
size of the first. At a few hundred million parameters that is merely wasteful.
At a hundred and seventy-five billion it is absurd: a fresh 350-gigabyte
checkpoint for every task, every customer, every experiment, none of which can
share a GPU with the others. In 2021 a team at Microsoft proposed a way out that
now looks obvious in hindsight. Do not touch the pretrained weights at all. Learn
a small correction beside them.

## The Cost of a Full Copy

The problem full fine-tuning creates is not accuracy — it is logistics. Every
adapted model is a complete set of weights that must be stored, loaded, and
served independently, which makes per-task and per-customer customization
ruinous at scale. The field had two escape hatches before LoRA, and both charged
a tax. **Adapter layers** insert small trainable modules into the network, but
those modules sit in the forward path and add latency to every single inference.
**Prefix tuning** prepends trainable vectors to the input, but they consume part
of the context window that would otherwise hold the user's text. Cheaper to
train, yes — but you paid at inference time, forever.

## The Intrinsic-Dimension Wager

LoRA's premise came from an empirical observation about over-parameterized
models: adaptation to a task has a low **intrinsic dimension**. Earlier work had
shown you could fine-tune a model well while optimizing only a tiny,
randomly-chosen subspace of its parameters. If the *effect* of fine-tuning lives
in so few dimensions, the authors reasoned, then the *weight update* produced by
fine-tuning should itself be low-rank. That wager is the whole idea.

### A Correction of Low Rank

Concretely, for a pretrained weight matrix $W_0 \in \mathbb{R}^{d\times k}$, LoRA
constrains the update to a product of two thin matrices and leaves $W_0$
untouched:

$$
h = W_0\,x \;+\; \frac{\alpha}{r}\,B A\,x,
\qquad
B \in \mathbb{R}^{d\times r},\;\; A \in \mathbb{R}^{r\times k},\;\; r \ll \min(d,k)
$$

Only $A$ and $B$ receive gradients; $W_0$ is frozen. The **rank** $r$ is the
lever that sets how much the update can express, and the scaling $\alpha/r$
controls its size. Initialization matters: $A$ is drawn from a random Gaussian
and $B$ is set to zero, so $\Delta W = BA = 0$ at the first step and training
begins exactly at the pretrained model rather than jolting it. For a
12288-dimensional projection, a rank-8 update trains on the order of $2 \times 8
\times 12288$ numbers in place of $12288^2$ — a rounding error against the whole.

<figure>
<svg viewBox="0 0 820 260" role="img" aria-label="LoRA: the frozen pretrained matrix W-zero runs in parallel with a low-rank path that projects the input down to rank r through matrix A and back up through matrix B; the two outputs are summed, and at inference W-zero plus B-A is merged into one matrix.">
  <defs>
    <marker id="arw-lora" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" class="dgm-fill"/>
    </marker>
  </defs>
  <text x="40" y="130" text-anchor="middle" font-size="14" font-weight="700">x</text>
  <line x1="52" y1="126" x2="150" y2="72" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-lora)"/>
  <line x1="52" y1="132" x2="150" y2="182" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-lora)"/>
  <g class="dgm-muted">
    <rect x="152" y="44" width="190" height="56" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <text x="247" y="68" text-anchor="middle" font-size="13" font-weight="700">W₀  (frozen)</text>
    <text x="247" y="86" text-anchor="middle" font-size="10.5">d × k · pretrained</text>
  </g>
  <g class="dgm-accent">
    <rect x="152" y="158" width="78" height="48" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <text x="191" y="180" text-anchor="middle" font-size="12" font-weight="700">A</text>
    <text x="191" y="196" text-anchor="middle" font-size="10">r × k</text>
    <line x1="230" y1="182" x2="270" y2="182" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-lora)"/>
    <text x="250" y="172" text-anchor="middle" font-size="10">rank r</text>
    <rect x="272" y="158" width="78" height="48" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <text x="311" y="180" text-anchor="middle" font-size="12" font-weight="700">B</text>
    <text x="311" y="196" text-anchor="middle" font-size="10">d × r</text>
  </g>
  <line x1="342" y1="80" x2="471" y2="124" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-lora)"/>
  <line x1="350" y1="182" x2="430" y2="182" stroke="currentColor" stroke-width="1.5"/>
  <text x="392" y="172" text-anchor="middle" font-size="10">scale α/r</text>
  <line x1="430" y1="182" x2="471" y2="142" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-lora)"/>
  <circle cx="486" cy="132" r="16" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="486" y="137" text-anchor="middle" font-size="15" font-weight="700">+</text>
  <line x1="502" y1="132" x2="560" y2="132" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-lora)"/>
  <rect x="562" y="104" width="210" height="56" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="667" y="128" text-anchor="middle" font-size="12.5" font-weight="700">h = W₀x + BAx</text>
  <text x="667" y="146" text-anchor="middle" font-size="10.5" class="dgm-muted">only A, B get gradients</text>
  <text x="410" y="238" text-anchor="middle" font-size="11" class="dgm-muted">at inference, fold in:  W = W₀ + BA  —  zero added latency</text>
</svg>
<figcaption><b>The low-rank side path.</b> The frozen matrix W₀ and a trainable bottleneck B·A run in parallel and sum; only A and B learn, and at deployment they fold into the weights for no added latency.</figcaption>
</figure>

## Merging Away the Overhead

Here is the detail that made LoRA win over adapters. Because $\Delta W = BA$ is a
plain linear term added to $W_0$, you can compute $W = W_0 + BA$ once and store it
as a single matrix before deployment. The adapted model is then
indistinguishable from an ordinarily fine-tuned one, with **zero** extra
operations at inference — no inserted modules, no latency penalty. Their
ablations also answered *where* to spend a fixed parameter budget: adapting the
attention query and value projections gave the best return, and spreading a small
rank across more matrices beat concentrating a larger rank in fewer.

## What It Bought

On GPT-3 175B, LoRA trained roughly ten thousand times fewer parameters than full
fine-tuning and cut training-time GPU memory about threefold, while matching or
beating full fine-tuning on the tasks tested. The practical consequence is a
change of scale in storage: a per-task checkpoint drops from hundreds of
gigabytes to tens of megabytes — small enough to email, to version, to keep
thousands of on hand.

## Why It Matters

Those tens of megabytes rewired how models are shipped. Serving a thousand LoRAs
against one shared, resident base model is now a standard multi-tenant pattern,
and hot-swapping a customer's adapter in and out of a running server is a product
feature across the industry. Customization stopped being a fork of the model and
became a small file layered on top of it.

The limits are the flip side of the premise. A low-rank update genuinely caps
capacity: LoRA trails full fine-tuning when a task demands substantial *new
knowledge* rather than behavioral steering, and the right rank remains an
empirical guess. Most consequential of all, LoRA shrinks the *trainable* memory
but does nothing about the memory required to *hold* the frozen base — the base
still sits there in full sixteen-bit precision, which is the real wall on
consumer hardware. That unaddressed cost is precisely the opening the next paper
walks through.

## Lineage

- **Builds on:** [GPT-3](/courses/llm-canon/gpt-3), the model whose sheer size made per-task full copies unmanageable, and [LLaMA](/courses/llm-canon/llama), the open base that most LoRAs are trained against.
- **Leads to:** [QLoRA](/courses/llm-canon/qlora), which quantizes that frozen base to four bits so the whole thing fits on a single GPU.
