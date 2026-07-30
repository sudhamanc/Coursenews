---
course: llm-canon
lectureId: "2023"
title: "A Frontier Fine-Tune on a Single Card"
deck: "QLoRA (2023) — quantize the frozen base model to four bits, train LoRA adapters on top, and fine-tune a 65-billion-parameter model on one 48GB GPU with no measured loss in quality."
order: 20
readingTime: 11
tags: ["adaptation", "quantization", "qlora", "nf4", "fine-tuning"]
concepts:
  - id: nf4
    term: "4-bit NormalFloat (NF4)"
    definition: "A quantization data type that is information-theoretically optimal for zero-centered normal weights, using quantile bins that each hold an equal number of values instead of the uniform spacing that wastes bins on empty tails."
  - id: dequantize-compute
    term: "Quantize-Store, Dequantize-Compute"
    definition: "The weights live in memory as 4-bit NF4 and are dequantized to 16-bit only for each matrix multiply, then discarded; the LoRA adapters stay in 16-bit throughout and are the only weights that learn."
  - id: double-quantization
    term: "Double Quantization"
    definition: "Quantizing the block-wise quantization constants themselves, saving roughly 0.37 bits per parameter — about three gigabytes on a 65B model."
  - id: paged-optimizers
    term: "Paged Optimizers"
    definition: "Using NVIDIA unified memory to page optimizer state between GPU and CPU automatically, converting the out-of-memory crashes caused by gradient-checkpointing spikes into mere slowdowns."
  - id: lora-everywhere
    term: "LoRA on Every Layer"
    definition: "The correction to LoRA's own guidance that, to match full fine-tuning, adapters must be applied to all linear layers, not only the attention projections."
---

LoRA made fine-tuning cheap — almost. It shrank the trainable parameters
ten-thousandfold and slashed the optimizer's footprint, but it left one stubborn
cost untouched: the frozen base model still has to sit in memory while you train
against it. At sixteen bits per weight, a 65-billion-parameter model occupies
$65\text{B} \times 2\,\text{bytes} \approx 130\,\text{GB}$ before a single
gradient is computed — more than any single workstation GPU can hold. In 2023 a
group at the University of Washington closed that last gap by attacking the base
itself, and fine-tuned a 65B model on one 48GB card with, by their measurements,
no loss in quality.

## Where LoRA's Memory Still Went

The base weights were the whole bill. LoRA removed the optimizer states and
gradients from the ledger, and once those are gone the frozen model is what fills
the card. The obvious move — store it at four bits — had always failed, because
naïve four-bit quantization degrades the weights enough that you cannot
fine-tune *through* them: the adapters end up correcting quantization damage
instead of learning the task. QLoRA's contribution is a bundle of techniques that
make four-bit storage lossless enough to train on top of. Store the base at
$65\text{B}\times 0.5\,\text{bytes}\approx 33\,\text{GB}$, and it fits.

## Storing in Four Bits, Computing in Sixteen

The organizing principle is **quantize-store, dequantize-compute**. The base
weights are held in memory as compact four-bit numbers, but four-bit arithmetic
is not what runs the network. For each matrix multiply, the block of weights it
needs is dequantized back to sixteen-bit precision, used, and immediately
discarded — only the tiny active slice is ever in high precision at once. The
LoRA adapters, meanwhile, remain sixteen-bit throughout and carry all the
gradients. The frozen giant is storage; the small adapter is what learns.

<figure>
<svg viewBox="0 0 860 280" role="img" aria-label="QLoRA: the base model is stored in four-bit NormalFloat and frozen; for each matrix multiply it is dequantized to sixteen-bit, used, and discarded; sixteen-bit LoRA adapters are added on top and are the only weights that receive gradients; a paged optimizer moves optimizer state between GPU and CPU to survive memory spikes.">
  <defs>
    <marker id="arw-qlora" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" class="dgm-fill"/>
    </marker>
  </defs>
  <g class="dgm-muted">
    <rect x="14" y="60" width="176" height="120" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <text x="102" y="82" text-anchor="middle" font-size="12" font-weight="700">Stored in 4-bit</text>
    <rect x="34" y="96" width="136" height="34" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <text x="102" y="117" text-anchor="middle" font-size="11">NF4 base W · frozen</text>
    <rect x="34" y="138" width="136" height="30" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <text x="102" y="157" text-anchor="middle" font-size="9.5">double-quantized constants</text>
  </g>
  <line x1="190" y1="120" x2="268" y2="120" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-qlora)"/>
  <text x="229" y="110" text-anchor="middle" font-size="10">dequant to bf16</text>
  <rect x="270" y="86" width="150" height="70" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="345" y="114" text-anchor="middle" font-size="12" font-weight="700">matmul in bf16</text>
  <text x="345" y="133" text-anchor="middle" font-size="9.5" class="dgm-muted">W dequantized just-in-time</text>
  <g class="dgm-accent">
    <rect x="270" y="184" width="150" height="52" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <text x="345" y="206" text-anchor="middle" font-size="12" font-weight="700">LoRA A·B (16-bit)</text>
    <text x="345" y="223" text-anchor="middle" font-size="9.5">only these get gradients</text>
  </g>
  <line x1="345" y1="184" x2="345" y2="158" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-qlora)"/>
  <line x1="420" y1="120" x2="486" y2="120" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-qlora)"/>
  <circle cx="502" cy="120" r="15" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="502" y="125" text-anchor="middle" font-size="14" font-weight="700">+</text>
  <line x1="420" y1="210" x2="502" y2="136" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-qlora)"/>
  <line x1="517" y1="120" x2="566" y2="120" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-qlora)"/>
  <rect x="568" y="96" width="140" height="48" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="638" y="124" text-anchor="middle" font-size="12" font-weight="700">output h</text>
  <rect x="568" y="184" width="278" height="52" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="707" y="206" text-anchor="middle" font-size="11.5" font-weight="700">Paged optimizer state</text>
  <text x="707" y="223" text-anchor="middle" font-size="9.5" class="dgm-muted">GPU to CPU on memory spikes</text>
  <line x1="420" y1="210" x2="566" y2="210" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-qlora)"/>
  <text x="493" y="202" text-anchor="middle" font-size="9" class="dgm-muted">adapter grads</text>
</svg>
<figcaption><b>Store in four bits, compute in sixteen.</b> The frozen NF4 base is dequantized just in time for each matmul; only the 16-bit LoRA adapters learn, while a paged optimizer spills state to CPU to survive memory spikes.</figcaption>
</figure>

### NF4 — a Data Type Shaped Like the Weights

Why four-bit works here is **NF4**, a data type engineered for the specific
distribution of neural-network weights. Pretrained weights are approximately
zero-centered and normally distributed, and uniform integer quantization wastes
precious bins on the sparsely-populated tails. NF4 is quantile-based instead:
each of its sixteen levels is placed so it holds roughly an equal number of
values, which is information-theoretically optimal for a normal distribution.
Empirically it beats both int4 and fp4 at the same bit width.

### Double Quantization

Block-wise quantization stores a scaling constant for each block of weights, and
at small block sizes those constants become a non-trivial cost of their own. So
QLoRA quantizes the quantization constants too — **double quantization** — for
another roughly 0.37 bits per parameter, about three gigabytes reclaimed on a 65B
model.

### Paged Optimizers

The last failure mode is a spike, not a steady cost. Gradient checkpointing
produces sudden memory surges on long sequences that trigger out-of-memory
crashes. **Paged optimizers** borrow the operating system's oldest trick: using
NVIDIA unified memory, optimizer state is paged between GPU and CPU automatically,
the way an OS pages RAM to disk. It is slow when it fires, but it turns a crash
into a slowdown. One more correction rounds out the recipe — to actually match
full fine-tuning, the adapters must be applied to **every** linear layer, not
just the attention projections that the original LoRA paper favored.

## What It Bought

The headline is the hardware. Fine-tuning a 65B model, which previously needed
more than 780GB of GPU memory, now runs on a single 48GB card. The
proof-of-concept, Guanaco-65B, was trained on the OASST1 dataset in twenty-four
hours on one GPU and reached 99.3% of ChatGPT's score on the Vicuna benchmark. As
a side finding that aged better than the benchmark itself, the authors documented
that for instruction tuning, data *quality* dominates data *quantity*.

## Why It Matters

QLoRA collapsed the cost of adapting a frontier-class open model from a
datacenter to a workstation, and the overwhelming majority of open fine-tunes
since 2023 use some version of this recipe. It democratized customization in a
way that a downloadable base model alone did not.

The costs are honest ones. Dequantizing on every matmul makes each training step
slower than sixteen-bit LoRA. Quality parity was shown on instruction-following,
not on reasoning-heavy or long-context work. And the base stays four-bit at
inference unless you merge the adapter and re-quantize, which introduces error of
its own. It is also worth remembering that the Vicuna-benchmark and
GPT-4-as-judge numbers of this era are now understood to track real capability
only weakly — the method outlived the yardstick used to validate it. The deeper
legacy is the toolkit: the same quantization ideas soon migrated from training
memory to the inference-time cost that dominates serving.

## Lineage

- **Builds on:** [LoRA](/courses/llm-canon/lora) for the adapters, [LLaMA](/courses/llm-canon/llama) as the open model worth adapting, and [Self-Instruct](/courses/llm-canon/self-instruct), whose data lineage feeds the Guanaco training set.
- **Leads to:** [KV Cache Compression](/courses/llm-canon/kv-cache-compression), where the same quantize-store discipline is pushed into inference-time memory.
