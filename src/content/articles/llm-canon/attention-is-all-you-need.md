---
course: llm-canon
lectureId: "2017"
title: "All You Need Is Attention"
deck: "The 2017 paper that threw out recurrence, kept only attention, and — almost as a side effect — poured the foundation every large language model still stands on."
order: 1
readingTime: 11
tags: ["transformers", "attention", "architecture", "self-attention", "seminal"]
concepts:
  - id: self-attention
    term: Self-Attention
    definition: "Attention applied within a single sequence: every token forms a query, key, and value over the same set of tokens, so each position can draw information directly from every other position in one step."
  - id: scaled-dot-product
    term: Scaled Dot-Product Attention
    definition: "The core operation softmax(QKᵀ/√dₖ)V, in which query–key dot products become weights over the values; the √dₖ divisor stops large dimensions from saturating the softmax."
  - id: multi-head
    term: Multi-Head Attention
    definition: "Several attention operations run in parallel on lower-dimensional projections, then concatenated and projected again, so different heads can capture different relationships."
  - id: causal-masking
    term: Causal Masking
    definition: "Masking future positions in the decoder so a token can only attend to earlier tokens — the single detail that makes the autoregressive, decoder-only GPT family possible."
  - id: positional-encoding
    term: Positional Encoding
    definition: "Signals added to token embeddings that reintroduce word order, which pure attention would otherwise ignore because it is permutation-invariant."
---

For two decades, sequence modeling meant memory. Recurrent networks read a
sentence one token at a time, folding everything seen so far into a single
hidden state that was then asked to carry the meaning of the whole. The design
was elegant and structurally doomed: the serial dependency wasted the parallel
hardware it ran on, and by the time a long sentence reached its final clause the
beginning had been compressed to a blur. In 2017 a team at Google proposed
something almost impudent in its simplicity — throw out recurrence and
convolution entirely, and keep only **attention**. The paper's title was a
provocation, *Attention Is All You Need*, and it turned out to be right.

## From Remembering to Looking

Attention had already been bolted onto recurrent translators as a helper: a way
for the decoder to glance back at the encoder's states instead of relying on one
summary vector. The paper's move was to make attention the *entire* model. Every
layer is built from two sublayers — an attention operation and a small
position-wise feed-forward network — each wrapped in a residual connection and
layer normalization. Stack six of these on the encoder side, six on the decoder
side, and that is the architecture.

Because nothing is recurrent, every position in a sequence is processed at once.
The path length between any two tokens — the number of steps a signal must
travel to connect them — drops from linear in the distance to constant. That is
the property that lets a transformer learn long-range dependencies that
recurrent models could only approximate.

## A Learned Lookup, Scaled

The workhorse is **scaled dot-product attention**. Each token is projected into
three vectors: a **query**, a **key**, and a **value**. A query is compared
against every key by dot product; the scores are normalized into weights; and
those weights mix the values. Written over whole matrices:

$$
\text{Attention}(Q, K, V) = \text{softmax}\!\left(\frac{QK^{\top}}{\sqrt{d_k}}\right) V
$$

The one non-obvious term is the divisor $\sqrt{d_k}$. As the key dimension grows,
raw dot products grow with it, pushing the softmax into regions where its
gradient nearly vanishes. Dividing by $\sqrt{d_k}$ keeps the scores in a sane
range so the model keeps learning. When a token attends to *its own* sequence,
this is **self-attention**, and it is the mechanism by which each word becomes
contextualized by every other word.

## Many Heads Are Better Than One

A single attention operation can only express one pattern of relationships at a
time. So the transformer runs several in parallel — **multi-head attention** —
each on its own lower-dimensional projection of the input. One head might track
subject–verb agreement, another coreference, another sheer proximity. Their
outputs are concatenated and passed through a final linear projection. The base
model uses eight heads over a 512-dimensional representation, giving each head
64 dimensions to work with.

<figure>
<svg viewBox="0 0 860 240" role="img" aria-label="Multi-head attention: queries, keys and values are projected into several heads, each computing scaled dot-product attention in parallel; the heads are concatenated and linearly projected to form the output.">
  <defs>
    <marker id="arw-mha" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" class="dgm-fill"/>
    </marker>
  </defs>
  <rect x="10" y="70" width="98" height="100" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="59" y="108" text-anchor="middle" font-size="14" font-weight="700">Q · K · V</text>
  <text x="59" y="130" text-anchor="middle" font-size="10.5" class="dgm-muted">projections</text>
  <line x1="108" y1="96" x2="176" y2="72" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-mha)"/>
  <line x1="108" y1="120" x2="176" y2="120" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-mha)"/>
  <line x1="108" y1="144" x2="176" y2="176" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-mha)"/>
  <g class="dgm-accent">
    <rect x="180" y="54" width="252" height="34" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <text x="306" y="76" text-anchor="middle" font-size="12">head 1 · softmax(QK&#x22a4;/&#x221a;d&#x2096;)V</text>
  </g>
  <rect x="180" y="103" width="252" height="34" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="306" y="125" text-anchor="middle" font-size="12">head 2</text>
  <text x="306" y="152" text-anchor="middle" font-size="17">&#8942;</text>
  <rect x="180" y="162" width="252" height="34" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="306" y="184" text-anchor="middle" font-size="12">head h</text>
  <line x1="432" y1="71" x2="486" y2="108" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-mha)"/>
  <line x1="432" y1="120" x2="486" y2="120" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-mha)"/>
  <line x1="432" y1="179" x2="486" y2="132" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-mha)"/>
  <rect x="490" y="80" width="74" height="80" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="527" y="124" text-anchor="middle" font-size="13" font-weight="700">Concat</text>
  <line x1="564" y1="120" x2="608" y2="120" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-mha)"/>
  <rect x="612" y="92" width="96" height="56" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="660" y="116" text-anchor="middle" font-size="13" font-weight="700">Linear</text>
  <text x="660" y="135" text-anchor="middle" font-size="11" class="dgm-muted">W&#x1d3c;</text>
  <line x1="708" y1="120" x2="750" y2="120" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-mha)"/>
  <rect x="754" y="92" width="98" height="56" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="803" y="115" text-anchor="middle" font-size="12" font-weight="700">Output</text>
  <text x="803" y="134" text-anchor="middle" font-size="10.5" class="dgm-muted">contextualized</text>
</svg>
<figcaption><b>Multi-head attention.</b> The same queries, keys, and values are split across several heads that attend in parallel; their results are concatenated and projected back into one contextualized representation.</figcaption>
</figure>

## Order Without Recurrence

Attention has no inherent sense of sequence — shuffle the tokens and the math is
unchanged. To restore word order, the transformer adds a **positional encoding**
to each input embedding: fixed sine and cosine waves of varying frequency that
give every position a distinct, learnable-to-read signature. The decoder adds
one more constraint, **causal masking**, which hides every future position
during training so a token can never attend to words it has not yet produced.
That single mask is what makes purely generative, decoder-only models — the
entire GPT line — possible.

## Why It Matters

The results were strong for their day: new state-of-the-art translation scores at
a fraction of the training cost. But the translation numbers are a footnote now.
The lasting contribution was the block itself. Nearly a decade later the core is
essentially unchanged; what moved is peripheral — where the normalization sits,
which activation the feed-forward network uses, how positions are encoded, how
keys and values are shared. Every model in this collection is a modification, a
scaling exercise, or an efficiency fix applied to this one design. The paper did
not just win a benchmark; it defined the substrate.

Its limits set the agenda for everything downstream. Attention is quadratic in
sequence length, in both time and memory — the constraint that later spawns
FlashAttention, PagedAttention, and the whole KV-cache literature. Its sinusoidal
positions extrapolate poorly, which RoPE and ALiBi were invented to fix. The
transformer's genius was to trade a memory bottleneck for a compute-and-memory
one that hardware could actually attack.

## Lineage

- **Builds on:** the starting point of this collection — the first sequence model with no recurrence at all.
- **Leads to:** [GPT-1](/courses/llm-canon/gpt-1) and [BERT](/courses/llm-canon/bert) (keep the decoder; keep the encoder), plus the efficiency line of [RoPE](/courses/llm-canon/rope), [ALiBi](/courses/llm-canon/alibi), [Multi-Query Attention](/courses/llm-canon/multi-query-attention), [FlashAttention](/courses/llm-canon/flashattention), [Switch Transformer](/courses/llm-canon/switch-transformer), [RAG](/courses/llm-canon/rag), and [Speculative Decoding](/courses/llm-canon/speculative-decoding).
