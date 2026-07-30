---
course: llm-canon
lectureId: "2023"
title: "The Cache That Learned to Page"
deck: "PagedAttention and vLLM (2023) — the realization that a language model's memory can be managed like an operating system's, cutting key-value cache waste from most of the buffer to under four percent and multiplying serving throughput."
order: 27
readingTime: 11
tags: ["efficiency", "serving", "kv-cache", "systems", "throughput"]
concepts:
  - id: kv-cache
    term: KV Cache
    definition: "The stored keys and values for every past token, kept so each new token's attention need not recompute them; its size grows with sequence length and batch size and comes to dominate serving memory."
  - id: paged-attention
    term: PagedAttention
    definition: "Storing the KV cache in fixed-size, non-contiguous blocks addressed through a per-sequence block table, so attention can read keys and values scattered across GPU memory instead of from one contiguous buffer."
  - id: fragmentation
    term: Memory Fragmentation
    definition: "Wasted GPU memory from reserving a contiguous maximum-length buffer per request — internal fragmentation (reserved but unused) and external fragmentation (unusable gaps between allocations)."
  - id: block-table
    term: Block Table
    definition: "A per-sequence map from logical block index to physical block address — the exact analogue of an operating system's page table — that lets one sequence's cache live in scattered physical blocks."
  - id: copy-on-write
    term: Copy-on-Write Sharing
    definition: "Letting parallel samples or beam-search branches share the physical blocks of a common prefix by reference count, copying a block only when a branch first writes to it."
  - id: continuous-batching
    term: Continuous Batching
    definition: "Admitting and retiring requests at token granularity, so a finished sequence frees its memory immediately and a waiting one joins without stalling the whole batch."
---

By 2023 the large models were cheap enough to train, in relative terms, and
expensive enough to *serve* that the economics of running them had become a
discipline of its own. The surprise was where the money was going. A GPU asked to
generate text for many users at once was not starved of arithmetic — it was
starved of memory, and most of the memory it did have was being thrown away.
Production serving systems were leaving sixty to eighty percent of their
key-value cache idle, not through any bug but through the way they reserved it.
PagedAttention, the technique at the heart of the **vLLM** serving system, closed
that gap by reaching for one of the oldest ideas in systems programming: virtual
memory.

## The Waste Nobody Was Counting

Every transformer keeps a **KV cache**: for each token already processed, the
keys and values it produced at every layer are stored so that future tokens can
attend to them without recomputation. The cache is what makes autoregressive
decoding fast, and it is enormous. Its size scales as

$$
\text{cache} \;=\; 2 \cdot n_{\text{layers}} \cdot n_{\text{heads}} \cdot d_{\text{head}} \cdot L \cdot b
$$

— the factor of two for keys and values, multiplied across every layer and head,
every token of context length $L$, and every request in a batch $b$. At long
context it routinely exceeds the model weights themselves.

The trouble was not the cache's true size but how systems set it aside. Each
request was handed a single *contiguous* buffer sized to the longest output it
might ever produce. Three kinds of waste followed. **Internal fragmentation**:
the reserved space that most requests never use, because a typical answer is far
shorter than the maximum. **External fragmentation**: the unusable gaps left
between allocations of different sizes. And **no sharing**: when a prompt was
sampled several times in parallel, each sample received its own private copy of
the identical prefix. Measured utilization often sat between twenty and forty
percent — and because the number of requests a GPU can batch is capped by cache
memory, every wasted megabyte is throughput lost directly.

## Borrowing the Page Table

The fix is a near-literal transposition of how an operating system manages RAM.
Instead of one contiguous buffer, a sequence's cache is split into fixed-size
**blocks** — sixteen tokens each, say — and those blocks may live anywhere in GPU
memory. Only the final block of a sequence can be partially filled, so internal
waste is bounded by less than one block. A per-sequence **block table** then maps
each logical block index to a physical block address, exactly as a page table
maps virtual pages to physical frames. The attention kernel is rewritten to
gather keys and values through that indirection rather than to stride over one
flat array.

<figure>
<svg viewBox="0 0 860 280" role="img" aria-label="PagedAttention stores a sequence's KV cache as fixed-size logical blocks that a per-sequence block table maps to non-contiguous physical blocks scattered across GPU memory, exactly like an operating system's virtual-memory page table.">
  <defs>
    <marker id="arw-vllm" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" class="dgm-fill"/>
    </marker>
  </defs>
  <text x="90" y="30" text-anchor="middle" font-size="12.5" font-weight="700">Logical KV blocks</text>
  <text x="90" y="46" text-anchor="middle" font-size="10.5" class="dgm-muted">one sequence</text>
  <rect x="30" y="62" width="120" height="30" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="90" y="82" text-anchor="middle" font-size="11">block 0</text>
  <rect x="30" y="96" width="120" height="30" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="90" y="116" text-anchor="middle" font-size="11">block 1</text>
  <rect x="30" y="130" width="120" height="30" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="90" y="150" text-anchor="middle" font-size="11">block 2</text>
  <rect x="30" y="164" width="120" height="30" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="90" y="184" text-anchor="middle" font-size="11">block 3</text>
  <line x1="150" y1="126" x2="246" y2="126" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-vllm)"/>
  <g class="dgm-accent">
    <rect x="250" y="58" width="156" height="140" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <text x="328" y="46" text-anchor="middle" font-size="12.5" font-weight="700">Block table</text>
    <text x="328" y="86" text-anchor="middle" font-size="11">0 &#8594; phys 4</text>
    <text x="328" y="110" text-anchor="middle" font-size="11">1 &#8594; phys 8</text>
    <text x="328" y="134" text-anchor="middle" font-size="11">2 &#8594; phys 1</text>
    <text x="328" y="158" text-anchor="middle" font-size="11">3 &#8594; phys 6</text>
    <text x="328" y="184" text-anchor="middle" font-size="10" class="dgm-muted">= page table</text>
  </g>
  <line x1="406" y1="126" x2="470" y2="126" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-vllm)"/>
  <text x="650" y="30" text-anchor="middle" font-size="12.5" font-weight="700">Physical GPU memory</text>
  <text x="650" y="46" text-anchor="middle" font-size="10.5" class="dgm-muted">non-contiguous blocks</text>
  <rect x="474" y="62" width="96" height="40" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="522" y="86" text-anchor="middle" font-size="10.5" class="dgm-muted">free</text>
  <rect x="576" y="62" width="96" height="40" class="dgm-soft" stroke="currentColor" stroke-width="1.5"/>
  <text x="624" y="82" text-anchor="middle" font-size="11">blk 2</text>
  <text x="624" y="96" text-anchor="middle" font-size="9.5" class="dgm-muted">phys 1</text>
  <rect x="678" y="62" width="96" height="40" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="726" y="86" text-anchor="middle" font-size="10.5" class="dgm-muted">other seq</text>
  <rect x="474" y="108" width="96" height="40" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="522" y="132" text-anchor="middle" font-size="10.5" class="dgm-muted">other seq</text>
  <rect x="576" y="108" width="96" height="40" class="dgm-soft" stroke="currentColor" stroke-width="1.5"/>
  <text x="624" y="128" text-anchor="middle" font-size="11">blk 0</text>
  <text x="624" y="142" text-anchor="middle" font-size="9.5" class="dgm-muted">phys 4</text>
  <rect x="678" y="108" width="96" height="40" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="726" y="132" text-anchor="middle" font-size="10.5" class="dgm-muted">free</text>
  <rect x="474" y="154" width="96" height="40" class="dgm-soft" stroke="currentColor" stroke-width="1.5"/>
  <text x="522" y="174" text-anchor="middle" font-size="11">blk 3</text>
  <text x="522" y="188" text-anchor="middle" font-size="9.5" class="dgm-muted">phys 6</text>
  <rect x="576" y="154" width="96" height="40" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="624" y="178" text-anchor="middle" font-size="10.5" class="dgm-muted">free</text>
  <rect x="678" y="154" width="96" height="40" class="dgm-soft" stroke="currentColor" stroke-width="1.5"/>
  <text x="726" y="174" text-anchor="middle" font-size="11">blk 1</text>
  <text x="726" y="188" text-anchor="middle" font-size="9.5" class="dgm-muted">phys 8</text>
</svg>
<figcaption><b>Paging the KV cache.</b> A sequence sees a tidy list of logical blocks; a per-sequence block table maps each to a physical block that can live anywhere in memory, so the cache needs no contiguous buffer and wastes almost nothing.</figcaption>
</figure>

## Sharing a Prefix Without Copying It

Once the cache is addressed through a table, sharing becomes trivial. When one
prompt is expanded into several parallel samples, or a beam search fans out into
competing branches, every branch begins with the same prefix — and that prefix
now exists as a set of physical blocks that the branches can simply *point to*.
The system reference-counts each block and applies **copy-on-write**: a shared
block is duplicated only at the moment a branch first writes into it. Beam search,
long the memory villain of decoding, becomes cheap. The same mechanism extends
across separate requests as **prefix caching** — a system prompt or a shared
conversation history is encoded once and reused, which is transformative for
agent loops that re-send the same instructions every turn.

## Keeping the GPU Full

The last gains come from scheduling. **Continuous batching** lets requests enter
and leave the running batch at the granularity of a single token, so a sequence
that finishes early releases its blocks at once and a waiting request takes its
place — no more idling until the slowest member of a fixed batch completes. Under
memory pressure, a scheduler can **preempt** a lower-priority sequence, evicting
its blocks to CPU memory or dropping them to be recomputed later, then restore it
when room frees up. Because a half-evicted sequence cannot make progress, this is
done all-or-nothing at sequence granularity — a policy lifted, again, straight
from operating-system swapping.

## Why It Matters

The numbers were decisive: cache waste fell below four percent, against the sixty
to eighty percent of prior systems, and throughput rose two- to fourfold at equal
latency versus the incumbents, with the largest gains on long sequences, big
models, and complex decoding. vLLM became the default open-source inference
server almost overnight, and paged KV cache is now table stakes in TensorRT-LLM,
SGLang, TGI, and the rest. The deeper lesson outlives the code: after years of
optimizing the model, the next large win came not from the network at all but
from applying a technique the operating-systems community had settled in the
1960s to the place where the memory was actually being spent.

Its limits point straight at what comes next. The block-table indirection costs a
little kernel efficiency against truly contiguous access, and block size is one
more knob to tune. More fundamentally, paging attacks *waste*, not the cache's
intrinsic *size* — at long enough context a perfectly packed cache is still
memory-bound. Squeezing that irreducible bulk is a different problem, and a
different paper.

## Lineage

- **Builds on:** [FlashAttention-2](/courses/llm-canon/flashattention-2), whose hardware-first framing it lifts from computation up to allocation, and [Multi-Query Attention](/courses/llm-canon/multi-query-attention), which first named the KV cache as the serving bottleneck.
- **Leads to:** [KV Cache Compression](/courses/llm-canon/kv-cache-compression), which attacks the cache's intrinsic size once paging has removed the waste, and [Test-Time Scaling](/courses/llm-canon/test-time-scaling), which the resulting throughput makes affordable.
