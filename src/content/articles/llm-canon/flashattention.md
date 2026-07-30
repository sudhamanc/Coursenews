---
course: llm-canon
lectureId: "2022"
title: "The Attention That Never Touched Main Memory"
deck: "FlashAttention (2022) — the realization that attention is bound by memory traffic, not arithmetic, and that keeping the computation on-chip makes exact attention several times faster with no approximation."
order: 25
readingTime: 11
tags: ["efficiency", "attention", "gpu", "systems", "long-context"]
concepts:
  - id: io-awareness
    term: IO-Awareness
    definition: "Optimizing an algorithm for the movement of data between memory tiers rather than for the number of arithmetic operations — the core idea behind FlashAttention."
  - id: memory-hierarchy
    term: HBM vs SRAM
    definition: "GPU high-bandwidth memory (HBM) is large but comparatively slow; on-chip SRAM is tiny but roughly an order of magnitude faster. Where data lives determines real speed."
  - id: tiling
    term: Tiling
    definition: "Splitting the queries, keys, and values into blocks sized to fit in SRAM, so the attention matrix is computed in on-chip fragments and never written to HBM in full."
  - id: online-softmax
    term: Online Softmax
    definition: "Computing softmax in a streaming fashion with a running maximum and running normalizer, so a tiled attention pass gives a result identical to the standard computation."
  - id: recomputation
    term: Recomputation
    definition: "Storing only the softmax statistics and recomputing attention blocks during the backward pass instead of saving the full matrix — trading extra arithmetic for far less memory traffic."
  - id: kernel-fusion
    term: Kernel Fusion
    definition: "Merging masking, softmax, dropout, and the two matrix multiplies into a single GPU kernel, eliminating round-trips to HBM between steps."
---

By 2022 the field had spent years trying to make attention cheaper by making it
*approximate* — sparse patterns, low-rank projections, kernel tricks. Most of
these reduced the arithmetic and yet delivered little or no real speedup, while
quietly costing accuracy. FlashAttention's contribution began with a diagnosis
that reframed the whole problem: everyone had been optimizing the wrong quantity.
Attention is not limited by how many floating-point operations it performs. It is
limited by how much data it moves.

## Optimizing the Wrong Number

A modern GPU can perform arithmetic far faster than it can read and write its
main memory. Standard attention computes the full $N \times N$ matrix of scores,
writes it to **high-bandwidth memory (HBM)**, reads it back to apply softmax,
writes it again, and reads it once more to multiply by the values. For a long
sequence that matrix is enormous, and every one of those round-trips crawls
along the slowest link in the system. The arithmetic is a rounding error; the
memory traffic is the bill.

## A Question of Where Data Lives

The key hardware fact is a memory hierarchy. HBM is large — tens of gigabytes —
but slow. On-chip **SRAM** is tiny — a few megabytes — but roughly an order of
magnitude faster. Being **IO-aware** means treating trips to HBM as the scarce
resource and doing as much as possible while data sits in SRAM. FlashAttention
restructures attention so that the giant score matrix is never written to HBM at
all.

## Tiling and the Online Softmax

The method is **tiling**. Split the queries, keys, and values into blocks small
enough to fit in SRAM. Load a block of keys and values, stream the query blocks
past them, and compute each fragment of the attention matrix entirely on-chip —
accumulating the output as you go, then discarding the fragment. The obstacle is
softmax, which normally needs the maximum and sum across an entire row before it
can normalize, and that is incompatible with processing a row in pieces. The
solution is the **online softmax**: keep a running maximum and a running
normalizer for each output row, and rescale the accumulated result whenever a new
block raises the maximum. The arithmetic is exactly equivalent to standard
softmax — this is not an approximation.

<figure>
<svg viewBox="0 0 840 250" role="img" aria-label="FlashAttention tiling: blocks of queries, keys and values stream from slow HBM into fast on-chip SRAM, where the attention scores are computed and accumulated; only the output is written back, so the full N-by-N matrix never touches HBM.">
  <defs>
    <marker id="arw-fa" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" class="dgm-fill"/>
    </marker>
  </defs>
  <rect x="14" y="44" width="196" height="180" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="112" y="66" text-anchor="middle" font-size="13" font-weight="700">HBM</text>
  <text x="112" y="82" text-anchor="middle" font-size="10.5" class="dgm-muted">large · slow</text>
  <rect x="38" y="98" width="80" height="26" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="78" y="115" text-anchor="middle" font-size="11">Q blocks</text>
  <rect x="38" y="134" width="80" height="26" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="78" y="151" text-anchor="middle" font-size="11">K blocks</text>
  <rect x="38" y="170" width="80" height="26" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="78" y="187" text-anchor="middle" font-size="11">V blocks</text>
  <line x1="120" y1="111" x2="296" y2="112" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-fa)"/>
  <line x1="120" y1="147" x2="296" y2="140" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-fa)"/>
  <line x1="120" y1="183" x2="296" y2="168" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-fa)"/>
  <g class="dgm-accent">
    <rect x="300" y="70" width="238" height="126" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <text x="419" y="92" text-anchor="middle" font-size="13" font-weight="700">SRAM · small, fast</text>
    <text x="419" y="118" text-anchor="middle" font-size="11">Sᵢⱼ = QᵢKⱼ&#x22a4;  (on-chip)</text>
    <text x="419" y="140" text-anchor="middle" font-size="11">online softmax → rescale</text>
    <text x="419" y="162" text-anchor="middle" font-size="11">Oᵢ += Pᵢⱼ Vⱼ  (accumulate)</text>
    <text x="419" y="184" text-anchor="middle" font-size="10.5" class="dgm-muted">N×N scores never leave SRAM</text>
  </g>
  <line x1="538" y1="120" x2="612" y2="120" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-fa)"/>
  <rect x="616" y="92" width="200" height="60" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="716" y="118" text-anchor="middle" font-size="12.5" font-weight="700">Output O → HBM</text>
  <text x="716" y="136" text-anchor="middle" font-size="10.5" class="dgm-muted">the only write-back</text>
</svg>
<figcaption><b>Tiling attention on-chip.</b> Blocks stream from slow HBM into fast SRAM, where scores are computed and accumulated with a running softmax; only the output is written back, so the quadratic matrix never touches main memory.</figcaption>
</figure>

## Paying Arithmetic to Save Traffic

The backward pass applies the same philosophy through **recomputation**. Instead
of storing the full attention matrix for use in the gradient — which would defeat
the entire point — FlashAttention keeps only the compact softmax statistics and
recomputes the needed attention blocks on the fly. It performs more arithmetic
than a naïve implementation, and is faster anyway, because arithmetic is cheap
and memory traffic is not. Folding masking, softmax, dropout, and both matrix
multiplies into a single fused kernel — **kernel fusion** — removes the last of
the intermediate round-trips.

## Why It Matters

The payoff was a several-times end-to-end speedup on real training runs, with
memory that grows linearly rather than quadratically in sequence length —
suddenly making long contexts affordable. FlashAttention is now a default inside
PyTorch and every serious training and inference stack. Just as important, it
reset the research agenda: after it, approximate attention largely stopped being
a live area, because the *exact* version had become fast enough. The lesson
generalizes beyond attention — on modern accelerators, the algorithm that moves
the least data usually wins, even if it computes the most.

Its one structural limitation is that the win comes from hand-written kernels
tuned to a specific GPU, so each new hardware generation needs a rewrite — which
is exactly what FlashAttention-2 and -3 went on to deliver.

## Lineage

- **Builds on:** [Attention Is All You Need](/courses/llm-canon/attention-is-all-you-need), reorganized around the memory hierarchy rather than the math.
- **Leads to:** [FlashAttention-2](/courses/llm-canon/flashattention-2) (better GPU scheduling) and [PagedAttention / vLLM](/courses/llm-canon/paged-attention-vllm), which applies the same hardware-first mindset to memory allocation at serving time.
