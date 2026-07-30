---
course: llm-canon
lectureId: "2023"
title: "The Half of the GPU FlashAttention Left Idle"
deck: "FlashAttention-2 (2023) — the same exact attention algorithm rebuilt around how a GPU actually schedules work, roughly doubling throughput by keeping every core busy."
order: 26
readingTime: 11
tags: ["efficiency", "attention", "gpu", "systems", "parallelism"]
concepts:
  - id: work-partitioning
    term: "Work Partitioning"
    definition: "How a GPU kernel divides its computation across the chip's parallel units — thread blocks and the warps within them — which determines how much of the hardware stays busy."
  - id: sequence-length-parallelism
    term: "Sequence-Length Parallelism"
    definition: "Adding query blocks as a third axis of parallelism beyond batch and heads, so a single long sequence with a small batch still occupies every streaming multiprocessor."
  - id: non-matmul-flops
    term: "Non-Matmul FLOPs"
    definition: "Operations outside matrix multiplication, such as the softmax's exponentials and rescaling, which the GPU's Tensor Cores cannot accelerate and which therefore cost many times a matmul operation."
  - id: warp-partitioning
    term: "Warp Partitioning"
    definition: "Splitting queries rather than keys and values across the warps of a thread block, so each warp owns a complete slice of the output and needs no cross-warp synchronization."
  - id: mfu
    term: "Model FLOPs Utilization (MFU)"
    definition: "Achieved throughput as a fraction of the hardware's theoretical peak, measured across the whole training loop rather than a single kernel."
---

FlashAttention had already won the argument. By refusing to write the giant
attention matrix to the GPU's main memory and instead computing it in on-chip
fragments, it had turned exact attention into something several times faster and
linear in memory. But its author, Tri Dao, kept a number in view that spoiled the
victory: the kernel was reaching only a quarter to two-fifths of the GPU's
theoretical arithmetic throughput. A well-tuned matrix multiply on the same
hardware hits eighty to ninety percent. The algorithm was right. The machine was
still mostly idle. FlashAttention-2, in 2023, is the work of collecting that
abandoned headroom — not by changing what attention computes, but by changing how
the computation is scheduled onto the chip.

## The Gap Was Scheduling, Not Math

The distinction matters because it tells you where to look. FlashAttention's
memory behavior was already optimal; it moved close to the least possible data
between slow and fast memory, which was the whole point of its predecessor and the
thread it belongs to. What it did not do was keep every one of the GPU's
arithmetic units busy while that data was on chip. The remaining problem was
**work partitioning** — how the computation is spread across the chip's parallel
units — and three specific inefficiencies accounted for most of the gap, each
mapping to a concrete fact about the hardware.

## Three Fixes for Three Hardware Facts

The first fact is that a GPU has specialized **Tensor Cores** that execute matrix
multiplies far faster than its general units execute everything else. A
floating-point operation that is *not* a matrix multiply — the exponentials and
rescaling of the softmax bookkeeping — therefore costs many times what a matmul
operation costs. FlashAttention rescaled its running output at every block
boundary. FlashAttention-2 reworks the online softmax so the expensive rescaling
happens once, at the end of each row block, carrying un-normalized values and
their statistics through the accumulation and dividing only at the finish. Fewer
**non-matmul FLOPs**, more of the work handed to the Tensor Cores.

The second fact is that a GPU is a bank of many **streaming multiprocessors** that
all need something to do. FlashAttention parallelized across only the batch and
the heads — enough work to fill the chip when the batch is large, but increasingly
not the regime that mattered. Long-context inference runs small batches over very
long sequences, and there the cores starved. FlashAttention-2 adds a third axis of
parallelism over query blocks — **sequence-length parallelism** — so a single long
sequence, batch of one, still spreads across every multiprocessor.

<figure>
<svg viewBox="0 0 820 270" role="img" aria-label="FlashAttention-1 parallelizes only over batch and heads, so at a small batch just a couple of the GPU's streaming multiprocessors are busy and the rest are idle; FlashAttention-2 adds parallelism over query blocks, filling every multiprocessor.">
  <defs>
    <marker id="arw-fa2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" class="dgm-fill"/>
    </marker>
  </defs>
  <text x="375" y="32" text-anchor="middle" font-size="13" font-weight="700">FlashAttention-1</text>
  <text x="375" y="50" text-anchor="middle" font-size="11" class="dgm-muted">parallelizes over batch &#215; heads</text>
  <rect x="40" y="62" width="100" height="44" class="dgm-soft" stroke="currentColor" stroke-width="1.5"/>
  <text x="90" y="89" text-anchor="middle" font-size="11">busy</text>
  <rect x="154" y="62" width="100" height="44" class="dgm-soft" stroke="currentColor" stroke-width="1.5"/>
  <text x="204" y="89" text-anchor="middle" font-size="11">busy</text>
  <rect x="268" y="62" width="100" height="44" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="318" y="89" text-anchor="middle" font-size="11" class="dgm-muted">idle</text>
  <rect x="382" y="62" width="100" height="44" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="432" y="89" text-anchor="middle" font-size="11" class="dgm-muted">idle</text>
  <rect x="496" y="62" width="100" height="44" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="546" y="89" text-anchor="middle" font-size="11" class="dgm-muted">idle</text>
  <rect x="610" y="62" width="100" height="44" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="660" y="89" text-anchor="middle" font-size="11" class="dgm-muted">idle</text>
  <text x="375" y="126" text-anchor="middle" font-size="11" class="dgm-muted">cores sit idle at small batch, long sequence</text>
  <line x1="375" y1="136" x2="375" y2="158" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-fa2)"/>
  <text x="560" y="152" text-anchor="middle" font-size="11" class="dgm-muted">add query-block parallelism</text>
  <text x="375" y="176" text-anchor="middle" font-size="13" font-weight="700">FlashAttention-2</text>
  <rect x="40" y="188" width="100" height="44" class="dgm-soft" stroke="currentColor" stroke-width="1.5"/>
  <text x="90" y="215" text-anchor="middle" font-size="11">q1</text>
  <rect x="154" y="188" width="100" height="44" class="dgm-soft" stroke="currentColor" stroke-width="1.5"/>
  <text x="204" y="215" text-anchor="middle" font-size="11">q2</text>
  <rect x="268" y="188" width="100" height="44" class="dgm-soft" stroke="currentColor" stroke-width="1.5"/>
  <text x="318" y="215" text-anchor="middle" font-size="11">q3</text>
  <rect x="382" y="188" width="100" height="44" class="dgm-soft" stroke="currentColor" stroke-width="1.5"/>
  <text x="432" y="215" text-anchor="middle" font-size="11">q4</text>
  <rect x="496" y="188" width="100" height="44" class="dgm-soft" stroke="currentColor" stroke-width="1.5"/>
  <text x="546" y="215" text-anchor="middle" font-size="11">q5</text>
  <rect x="610" y="188" width="100" height="44" class="dgm-soft" stroke="currentColor" stroke-width="1.5"/>
  <text x="660" y="215" text-anchor="middle" font-size="11">q6</text>
  <g class="dgm-accent"><text x="375" y="252" text-anchor="middle" font-size="11">every streaming multiprocessor stays busy</text></g>
</svg>
<figcaption><b>Filling the machine.</b> Each cell is a streaming multiprocessor. Parallelizing only over batch and heads leaves most idle on a long, thin workload; adding a query-block dimension keeps them all working.</figcaption>
</figure>

The third fact is about the warps inside a single thread block.
FlashAttention split the keys and values across warps, which forced every warp to
write partial results to shared memory and synchronize before combining them.
FlashAttention-2 flips the **warp partitioning**: it splits the queries instead,
so each warp owns a complete slice of the output and needs no cross-warp
communication to finish it. The shared-memory traffic and the synchronization
barriers largely vanish. A swap of the loop order — query blocks on the outside,
key and value blocks on the inside — is what makes both the sequence-length
parallelism and the warp split fall out naturally.

## The Numbers

The payoff was roughly a factor of two over the original, reaching fifty to
seventy-three percent of theoretical peak on an A100 — up to around 230 trillion
operations per second — and, end to end, about seventy-two percent **model FLOPs
utilization** on GPT-style training. That last figure is the one that matters,
because it is measured over the entire training loop, not just the attention
kernel: it means attention had stopped being the part of the model that wastes the
machine.

## Why It Matters

FlashAttention-2 is the clearest demonstration in this collection that on modern
accelerators the algorithm and the schedule are different problems, and that a
provably optimal algorithm can still leave half the hardware on the table. Its own
limitation is the flip side of its method: because the entire contribution is
scheduling tuned to one GPU architecture, it has to be redone for the next.
FlashAttention-3 repeats the exercise for Hopper, adding asynchronous warp
specialization and FP8 support. That treadmill — a new kernel per hardware
generation — is now simply the cost of doing business in this thread, and it is
why attention kernels are co-designed with each new chip rather than written once.
Every serving stack you can name runs on the descendants of this work.

## Lineage

- **Builds on:** [FlashAttention](/courses/llm-canon/flashattention), whose exact algorithm it keeps unchanged while rebuilding the implementation around the GPU's scheduler.
- **Leads to:** [PagedAttention (vLLM)](/courses/llm-canon/paged-attention-vllm), which carries the same hardware-first mindset up to memory allocation, and [KV Cache Compression](/courses/llm-canon/kv-cache-compression), which shrinks what those fast kernels must read.
