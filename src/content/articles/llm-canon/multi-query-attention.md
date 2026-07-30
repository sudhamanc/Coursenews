---
course: llm-canon
lectureId: "2019"
title: "The Cache Was the Bottleneck All Along"
deck: "Multi-Query Attention (2019) — Noam Shazeer's one-line change that shares a single key and value head across every query head, shrinking the KV cache that makes autoregressive decoding a memory-bandwidth problem."
order: 23
readingTime: 10
tags: ["efficiency", "attention", "kv-cache", "decoding", "gpu"]
concepts:
  - id: kv-cache
    term: "KV Cache"
    definition: "The keys and values already computed for earlier tokens, stored so each new token can attend to the past without recomputation; it is the dominant memory cost of autoregressive serving."
  - id: arithmetic-intensity
    term: "Arithmetic Intensity"
    definition: "The number of arithmetic operations performed per byte moved from memory; a low value means a workload is limited by memory bandwidth rather than by compute."
  - id: head-sharing
    term: "Head Sharing"
    definition: "Projecting keys and values to a single head that all query heads share, instead of one key/value head per query head, cutting the cache by the head count."
  - id: bandwidth-bound-decoding
    term: "Bandwidth-Bound Decoding"
    definition: "The regime of autoregressive generation, where each step moves far more memory than it does arithmetic and is therefore capped by memory bandwidth, leaving the compute units idle."
---

A transformer that has finished training still has to be *run*, and running it —
emitting text one token at a time — obeys an economics almost opposite to the one
that governed its training. Training pushes whole sequences through the network at
once, saturating the arithmetic units a modern GPU is built to show off.
Generation does the reverse. It produces a single token per step, and to produce
that one token the model must reread everything it has already said. In 2019, a
terse single-author paper from Google titled *Fast Transformer Decoding: One
Write-Head Is All You Need* stared at that reread and noticed something the rest
of the field would take three more years to fully absorb: the slow part of
generation is not the arithmetic. It is the memory.

## The Cost Nobody Was Measuring

To generate token by token without redoing all its work, a transformer keeps a
**KV cache** — the keys and values it has already computed for every earlier
position, stored so each new token can attend to the past without recomputing it.
The cache is a genuine bargain in compute. It is also, quietly, the most expensive
object in the system. Every decoding step must stream the entire cache out of the
GPU's main memory, perform a small amount of arithmetic against it, and write one
token back. The useful measure here is **arithmetic intensity** — the number of
floating-point operations performed per byte moved. Training has high intensity
and lives comfortably on the compute-bound side of the hardware. Incremental
decoding has miserably low intensity: it moves a great deal of memory to do very
little math, which pins it against the memory-bandwidth limit and leaves the
arithmetic units idle. This is **bandwidth-bound decoding**, and once you see it
you cannot unsee it.

Standard multi-head attention makes the problem worse than it needs to be. It
stores a separate key vector and value vector for every attention head at every
position. With $h$ heads, the cache — and therefore the traffic — is $h$ times
larger than the actual attention computation requires.

## One Write-Head Is All You Need

Shazeer's fix is almost insultingly small. Keep all $h$ query heads exactly as
they are; they are cheap and they carry the model's expressive power. But project
the keys and values to a *single* head, and broadcast that one key and value
across every query head when computing attention. In the code it is a change of
tensor shapes on two projections. In the memory system it is transformative:
through this **head sharing**, the KV cache shrinks by a factor of $h$.

<figure>
<svg viewBox="0 0 860 250" role="img" aria-label="Multi-head attention gives each query head its own key/value head, so the KV cache holds as many heads as the model; multi-query attention keeps the query heads but shares a single key/value head across all of them, shrinking the cache by the head count.">
  <defs>
    <marker id="arw-mqa" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" class="dgm-fill"/>
    </marker>
  </defs>
  <text x="148" y="26" text-anchor="middle" font-size="13" font-weight="700">Multi-Head Attention</text>
  <rect x="18" y="46" width="50" height="26" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="43" y="63" text-anchor="middle" font-size="11">Q1</text>
  <rect x="88" y="46" width="50" height="26" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="113" y="63" text-anchor="middle" font-size="11">Q2</text>
  <rect x="158" y="46" width="50" height="26" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="183" y="63" text-anchor="middle" font-size="11">Q3</text>
  <rect x="228" y="46" width="50" height="26" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="253" y="63" text-anchor="middle" font-size="11">Q4</text>
  <line x1="43" y1="74" x2="43" y2="162" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-mqa)"/>
  <line x1="113" y1="74" x2="113" y2="162" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-mqa)"/>
  <line x1="183" y1="74" x2="183" y2="162" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-mqa)"/>
  <line x1="253" y1="74" x2="253" y2="162" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-mqa)"/>
  <rect x="18" y="166" width="50" height="26" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="43" y="183" text-anchor="middle" font-size="11">KV</text>
  <rect x="88" y="166" width="50" height="26" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="113" y="183" text-anchor="middle" font-size="11">KV</text>
  <rect x="158" y="166" width="50" height="26" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="183" y="183" text-anchor="middle" font-size="11">KV</text>
  <rect x="228" y="166" width="50" height="26" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="253" y="183" text-anchor="middle" font-size="11">KV</text>
  <text x="148" y="216" text-anchor="middle" font-size="11.5" class="dgm-muted">KV cache: h heads</text>
  <line x1="430" y1="40" x2="430" y2="200" stroke="currentColor" stroke-width="1" stroke-dasharray="4 4" class="dgm-muted"/>
  <text x="605" y="26" text-anchor="middle" font-size="13" font-weight="700">Multi-Query Attention</text>
  <rect x="475" y="46" width="50" height="26" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="500" y="63" text-anchor="middle" font-size="11">Q1</text>
  <rect x="545" y="46" width="50" height="26" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="570" y="63" text-anchor="middle" font-size="11">Q2</text>
  <rect x="615" y="46" width="50" height="26" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="640" y="63" text-anchor="middle" font-size="11">Q3</text>
  <rect x="685" y="46" width="50" height="26" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="710" y="63" text-anchor="middle" font-size="11">Q4</text>
  <line x1="500" y1="74" x2="560" y2="162" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-mqa)"/>
  <line x1="570" y1="74" x2="588" y2="162" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-mqa)"/>
  <line x1="640" y1="74" x2="622" y2="162" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-mqa)"/>
  <line x1="710" y1="74" x2="650" y2="162" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-mqa)"/>
  <g class="dgm-accent">
    <rect x="540" y="166" width="130" height="26" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <text x="605" y="183" text-anchor="middle" font-size="11">shared KV</text>
    <text x="605" y="216" text-anchor="middle" font-size="11.5">KV cache: 1 head</text>
  </g>
</svg>
<figcaption><b>One key for every question.</b> Multi-head attention pairs each query head with its own key/value head; multi-query attention keeps all the query heads but collapses the key/value side to one shared head, cutting the cache by the head count.</figcaption>
</figure>

The size of the cache is not subtle. For a model with $L$ layers, $h$ heads, head
dimension $d_h$, and a sequence of length $n$, multi-head attention must store

$$
2 \, L \, n \, h \, d_h \quad \text{values}
$$

— two tensors, keys and values, at every layer and position. **Multi-query
attention** replaces the $h$ with a $1$:

$$
2 \, L \, n \, d_h .
$$

Because decoding was bandwidth-bound, cutting the bytes by $h$ raises the
arithmetic intensity by roughly the same factor and lifts the operation off the
memory roofline. Training cost barely moves — training is compute-bound over the
whole sequence, so it never felt the cache in the first place. The entire benefit
lands exactly where it was needed, at incremental decoding time.

## What the Sharing Bought

On the tasks Shazeer measured, incremental decoding sped up by close to an order
of magnitude, at a modest cost in quality. That trade was attractive enough that
multi-query attention was adopted wholesale by some of the largest models that
followed — PaLM, Falcon, StarCoder — wherever fast generation mattered more than
the last fraction of accuracy.

## The Price of a Single Keyholder

The quality cost is real, not cosmetic. Collapsing every head's keys and values
into one removes the model's ability to attend along many different relational
patterns at once, which is the whole reason multi-head attention existed. On tasks
that lean on diverse attention, the degradation shows. Training can also become
less stable at scale, and there is no cheap path from an existing multi-head
checkpoint to a multi-query one — the projections are structurally different, so
adopting the scheme generally meant pretraining from scratch. That last
inconvenience is precisely what the next paper set out to remove.

## Why It Matters

Multi-query attention is a small architectural note with an outsized place in this
collection, because it was the first paper to name the thing correctly. The cost
of serving a large language model is not a compute problem; it is a
memory-bandwidth problem, and the KV cache is the memory. Everything in the
serving track that follows — grouped-query attention, paged caches, latent-space
compression, quantized caches — is a further move in the game this paper opened.
It is a fitting authorship note that the same person designed multi-head attention
in the original transformer and then, two years later, showed which parts of it
the hardware could not afford. The lesson is the one that recurs across this whole
thread: on modern accelerators, the winning algorithm is usually the one that
moves the least data.

## Lineage

- **Builds on:** [Attention Is All You Need](/courses/llm-canon/attention-is-all-you-need), keeping multi-head attention on the query side and discarding it on the key and value side.
- **Leads to:** [Grouped-Query Attention](/courses/llm-canon/grouped-query-attention), which softens the trade-off; [PaLM](/courses/llm-canon/palm), an early large adopter; and [KV Cache Compression](/courses/llm-canon/kv-cache-compression), which compresses the cache rather than sharing it.
