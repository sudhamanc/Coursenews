---
course: llm-canon
lectureId: "2024"
title: "Compressing the Model's Short-Term Memory"
deck: "KV Cache Compression (2024) — with paging having removed the waste, the frontier turned to the cache's intrinsic size, and DeepSeek's Multi-head Latent Attention showed you could store one small latent per token and still beat full attention on quality."
order: 29
readingTime: 12
tags: ["efficiency", "kv-cache", "mla", "quantization", "long-context"]
concepts:
  - id: mla
    term: Multi-head Latent Attention (MLA)
    definition: "DeepSeek-V2's scheme that caches a single small latent vector per token instead of full per-head keys and values, up-projecting it back into keys and values only at attention time."
  - id: low-rank-kv
    term: Low-Rank KV Compression
    definition: "Learning a joint down-projection of the hidden state into a compact latent whose up-projection matrices can be absorbed into the query and output projections, so the full cache is never materialized during decoding."
  - id: decoupled-rope
    term: Decoupled RoPE
    definition: "Carrying rotary positional information on a small set of separate dimensions that bypass the low-rank compression, because rotary embeddings do not commute with the absorption trick."
  - id: attention-sink
    term: Attention Sink
    definition: "The first few tokens of a sequence, onto which a model dumps excess attention probability regardless of content; keeping them lets a sliding window stream indefinitely."
  - id: heavy-hitters
    term: Heavy Hitters
    definition: "The small set of tokens that receive the bulk of attention mass; eviction methods identify them by accumulated attention score and drop the rest under a memory budget."
  - id: kv-quantization
    term: KV Quantization
    definition: "Storing keys and values at low precision, quantizing keys per-channel and values per-token because their outlier structure differs, for two- to fourfold savings with no retraining."
  - id: prefix-caching
    term: Prefix Caching
    definition: "Hashing and sharing identical KV blocks across requests that share a prefix, so a repeated system prompt or chat history is encoded once rather than every turn."
---

Paging solved the wrong half of the problem — or rather, it solved one half so
completely that it exposed the other. Once vLLM had driven cache waste below four
percent, the remaining cost was not fragmentation but the sheer *size* of the
key-value cache itself, which grows linearly with context length and with batch
size and answers to no clever allocator. At long context the KV cache regularly
outweighs the model's own parameters; a single 128K-token request against a
conventional model can consume tens of gigabytes for cache alone. Because that
memory caps how many requests fit on a GPU, it caps throughput, and therefore
sets the price of every generated token. The years since have produced a whole
literature aimed at one question: how small can the cache get before the model
notices?

## The Problem Paging Left Behind

The cache exists because attention is retrospective — every new token attends to
the keys and values of all that came before, and storing them is what spares the
model from recomputing the entire history at each step. Its footprint is the
product of layers, heads, per-head dimension, sequence length, and batch. Three
of those terms are fixed by the architecture; the last two are exactly what
modern workloads inflate. Long documents, agentic tool loops, and reasoning
models that emit tens of thousands of thinking tokens all push $L$ and $b$ up at
once. Four broad families of technique have grown up to fight back — share heads,
compress dimensions, quantize, or evict — with a fifth, systems-level reuse,
layered on top.

## Sharing Heads: The Cheap First Cut

The oldest answer predates the crisis. **Multi-Query** and **Grouped-Query
Attention** simply give many query heads a single shared set of keys and values,
shrinking the cache by a constant factor. It is nearly free to adopt and needs no
new training recipe, which is why grouped-query attention remains the pragmatic
default across open models. But head sharing has a ceiling: it can divide the
cache by the number of heads folded together, and no further.

## Compressing to a Latent

The frontier answer goes underneath the heads. **Multi-head Latent Attention**,
introduced with DeepSeek-V2, stops caching keys and values at all. Instead it
learns a joint **down-projection** of each token's hidden state into a single
small latent vector, $c_{KV}$, and caches only that. At attention time a pair of
learned **up-projections** reconstruct the per-head keys and values from the
latent. The trick that makes it fast as well as small is algebraic: the
up-projection matrices can be folded into the query and output projections ahead
of time, so the decode path never has to materialize the full keys and values in
memory — it works directly against the compact latent.

<figure>
<svg viewBox="0 0 860 270" role="img" aria-label="Multi-head Latent Attention caches only a small latent vector per token, produced by a learned down-projection of the hidden state; per-head keys and values are reconstructed by an up-projection at attention time, while a separate decoupled-RoPE channel carries position around the compression.">
  <defs>
    <marker id="arw-mla" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" class="dgm-fill"/>
    </marker>
  </defs>
  <rect x="20" y="96" width="104" height="48" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="72" y="118" text-anchor="middle" font-size="12" font-weight="700">hidden hₜ</text>
  <text x="72" y="134" text-anchor="middle" font-size="10" class="dgm-muted">one token</text>
  <line x1="124" y1="120" x2="168" y2="120" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-mla)"/>
  <rect x="170" y="96" width="120" height="48" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="230" y="116" text-anchor="middle" font-size="11.5">down-project</text>
  <text x="230" y="132" text-anchor="middle" font-size="10" class="dgm-muted">W&#8202;DKV</text>
  <line x1="290" y1="120" x2="334" y2="120" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-mla)"/>
  <g class="dgm-accent">
    <rect x="336" y="96" width="104" height="48" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <text x="388" y="116" text-anchor="middle" font-size="12" font-weight="700">latent c&#8202;KV</text>
    <text x="388" y="132" text-anchor="middle" font-size="10">small</text>
  </g>
  <line x1="388" y1="144" x2="388" y2="180" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-mla)"/>
  <rect x="300" y="182" width="176" height="42" class="dgm-soft" stroke="currentColor" stroke-width="1.5"/>
  <text x="388" y="200" text-anchor="middle" font-size="11" font-weight="700">KV cache</text>
  <text x="388" y="215" text-anchor="middle" font-size="10" class="dgm-muted">one latent / token</text>
  <line x1="440" y1="120" x2="484" y2="120" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-mla)"/>
  <rect x="486" y="96" width="120" height="48" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="546" y="116" text-anchor="middle" font-size="11.5">up-project</text>
  <text x="546" y="132" text-anchor="middle" font-size="10" class="dgm-muted">absorbed into Q, O</text>
  <line x1="606" y1="120" x2="650" y2="120" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-mla)"/>
  <rect x="652" y="92" width="126" height="56" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="715" y="114" text-anchor="middle" font-size="11.5" font-weight="700">per-head K, V</text>
  <text x="715" y="132" text-anchor="middle" font-size="10" class="dgm-muted">&#8594; attention</text>
  <g class="dgm-muted">
    <rect x="170" y="34" width="240" height="34" fill="none" stroke="currentColor" stroke-width="1.3" stroke-dasharray="4 3"/>
    <text x="290" y="55" text-anchor="middle" font-size="10.5">decoupled RoPE — position, bypasses compression</text>
    <path d="M72,96 L72,51 L170,51" fill="none" stroke="currentColor" stroke-width="1.3" stroke-dasharray="4 3"/>
    <path d="M410,51 L715,51 L715,88" fill="none" stroke="currentColor" stroke-width="1.3" stroke-dasharray="4 3" marker-end="url(#arw-mla)"/>
  </g>
</svg>
<figcaption><b>One latent per token.</b> MLA caches only a small down-projected latent; per-head keys and values are rebuilt by an up-projection folded into the query and output weights, while rotary position rides a separate decoupled channel around the compression.</figcaption>
</figure>

There is one genuinely awkward detail, and it is the most important in the
design. Rotary position embeddings — **RoPE** — rotate keys and queries by an
angle that depends on position, and that rotation does *not* commute with the
low-rank absorption trick. DeepSeek's fix is **decoupled RoPE**: a small set of
separate dimensions, a few extra query components plus one shared key component,
carry the positional signal and bypass the compression entirely. It is the least
obvious part of the architecture and the reason MLA cannot be bolted onto an
existing model. The payoff is large — a cache in the range of a few percent to
roughly fourteen percent of standard multi-head attention, and, remarkably,
*better* quality rather than worse. DeepSeek-V3 reports on the order of seventy
kilobytes per token against two to three hundred for grouped-query models of a
comparable class.

## Quantizing and Evicting

Two families work on any existing checkpoint. **Quantization** stores keys and
values at INT8, FP8, or lower; the insight from work like KIVI is that keys
should be quantized *per-channel* and values *per-token*, because their outlier
structure differs. INT8 is near-lossless for a clean halving, and two-bit caches
are reachable with per-group scaling and a small full-precision residual window.
**Eviction** simply refuses to keep everything. H2O observes that attention
concentrates on a few **heavy hitters** and drops the rest under a budget.
StreamingLLM discovered the strange fact that a model dumps surplus attention onto
the first few tokens regardless of their content — **attention sinks** — so
keeping those few plus a recent window lets a model stream indefinitely without
fine-tuning. SnapKV compresses at prompt-ingest time, using the tail of the
prompt to decide which earlier positions matter.

## Reuse Across Requests

The fifth family is pure systems. **Prefix caching** in vLLM and SGLang hashes KV
blocks and shares them across any requests that begin with the same tokens. In
multi-turn chat and agent loops — where a long system prompt and the growing
history are re-sent on every single turn — encoding that prefix once instead of
repeatedly is an enormous saving, and it composes with every compression method
above.

## Why It Matters

This is where inference economics is decided. Long context, agentic loops, and
reasoning models all multiply cache pressure at the same time, and MLA-class
compression is often the difference between a serving cost that pencils out and
one that does not. MLA is the clearest single win — smaller *and* better — and
now anchors a line of frontier architectures; StreamingLLM's attention-sink
finding quietly changed how the field understands what those first tokens are
even for; quantization delivers its two-to-four times on any checkpoint already
in production.

The catch is that the best tool is the least portable. MLA must be pretrained
from scratch — you cannot cheaply convert a grouped-query checkpoint to it, which
is precisely why grouped-query attention persists — and its decoupled-RoPE
handling is genuinely fiddly. Eviction methods gamble that a discarded token will
not turn out to matter, and aggregate benchmarks can hide a catastrophic
single-retrieval failure behind a healthy average. Even MLA's fast decode path is
tuned to particular ratios of compute to bandwidth and is not equally good on all
hardware. Compression buys the frontier its context window; it does not make the
trade-offs disappear.

## Lineage

- **Builds on:** [Multi-Query Attention](/courses/llm-canon/multi-query-attention) and [Grouped-Query Attention](/courses/llm-canon/grouped-query-attention) (head sharing), [RoPE](/courses/llm-canon/rope) (which it must work around), [PagedAttention (vLLM)](/courses/llm-canon/paged-attention-vllm) (which manages whatever cache you produce), and [QLoRA](/courses/llm-canon/qlora) (whose quantization technique it borrows).
- **Leads to:** [DeepSeekMoE](/courses/llm-canon/deepseek-moe), with which MLA forms the DeepSeek-V2/V3 architecture, and [Test-Time Scaling](/courses/llm-canon/test-time-scaling), whose long generations it makes affordable.
