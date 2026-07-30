---
course: llm-canon
lectureId: "2021"
title: "The Bias That Reads Past Its Training"
deck: "ALiBi (2021) — 'Train Short, Test Long': delete the position embeddings and instead subtract a linear, per-head penalty from the attention scores, letting a model trained on short sequences run on far longer ones."
order: 22
readingTime: 10
tags: ["efficiency", "position-embeddings", "alibi", "length-extrapolation", "attention"]
concepts:
  - id: linear-bias
    term: "Attention with Linear Biases (ALiBi)"
    definition: "Subtracting a penalty proportional to the distance between two tokens directly from their pre-softmax attention score, in place of any position embedding."
  - id: length-extrapolation
    term: "Length Extrapolation"
    definition: "The ability to run a model on sequences longer than any it saw in training without a collapse in quality — treated by ALiBi as a first-class design goal."
  - id: head-slopes
    term: "Head-Specific Slopes"
    definition: "A fixed penalty slope assigned to each attention head from a geometric sequence, so steep-slope heads become strongly local while shallow-slope heads keep a long-range view."
  - id: recency-bias
    term: "Recency Inductive Bias"
    definition: "The built-in preference for nearby tokens that ALiBi bakes into the geometry of attention, since the penalty grows with distance."
  - id: no-position-embeddings
    term: "Position-Embedding-Free Transformer"
    definition: "A transformer that adds no positional signal to its inputs at all, deriving all sense of order from the distance penalty applied inside attention."
---

Every language model has a length it was trained at, and for years that length
was also a wall. Feed a model sequences longer than it saw in training and its
quality falls off a cliff — the position signals it learned simply have no
meaning out past the edge of its experience. Retraining at a longer length is
possible but quadratically expensive. In 2021 a team from the University of
Washington, Facebook AI, and the Allen Institute asked whether length
extrapolation could instead come for free, and answered with almost nothing at
all: delete the position embeddings and subtract a straight line.

## When Longer Breaks the Model

The failure is specific and severe. A model trained on 1024-token contexts,
evaluated on 2048, does not gracefully degrade — it breaks, because its learned
or sinusoidal position representations were never defined that far out. The only
established fix was to train at the longer length, and since attention cost grows
with the square of sequence length, doing so is punishingly expensive. The
question the paper poses is sharp: can a model trained short be tested long
without paying either price?

## A Penalty, Not an Embedding

ALiBi's answer removes positional information from the input entirely — there are
no position embeddings anywhere. Instead, just before the softmax, it adds a
static bias to each attention score that grows with the distance between the two
tokens. For a query at position $i$ attending to a key at position $j$:

$$
\text{softmax}\!\left( \frac{q_i^{\top} k_j}{\sqrt{d}} \;-\; m\,\lvert i-j\rvert \right)
$$

The penalty $-m\lvert i-j\rvert$ is fixed, precomputed once, learned by nothing.
Nearby tokens are barely penalized; distant ones are pushed down hard. Order is
never *represented* — it is *enforced*, as a gradient of preference sloping away
from the present token.

### Slopes That Split the Heads

The single subtlety is the slope $m$, which is not shared. Each attention head
gets its own value drawn from a geometric sequence — for eight heads, the set
$\{\tfrac12, \tfrac14, \dots, \tfrac1{256}\}$. A head with a steep slope is
punished so quickly for looking far that it becomes strongly local, attending
almost entirely to recent tokens; a head with a shallow slope barely feels the
penalty and retains a long-range view. By construction, the head set spans a
whole spectrum of receptive fields, from myopic to panoramic.

<figure>
<svg viewBox="0 0 820 260" role="img" aria-label="ALiBi adds a penalty to each attention score that grows linearly with the distance between two tokens; each attention head uses a different slope drawn from a geometric sequence, so steep-slope heads attend locally while shallow-slope heads keep a long-range view.">
  <defs>
    <marker id="arw-alibi" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" class="dgm-fill"/>
    </marker>
  </defs>
  <line x1="120" y1="56" x2="120" y2="216" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-alibi)"/>
  <line x1="120" y1="56" x2="474" y2="56" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-alibi)"/>
  <text x="300" y="44" text-anchor="middle" font-size="11" class="dgm-muted">token distance |i − j|</text>
  <text x="150" y="212" text-anchor="middle" font-size="11" class="dgm-muted">penalty</text>
  <line x1="120" y1="56" x2="470" y2="104" stroke="currentColor" stroke-width="1.5" class="dgm-muted"/>
  <text x="486" y="106" text-anchor="start" font-size="10.5" class="dgm-muted">shallow: stays global</text>
  <line x1="120" y1="56" x2="470" y2="150" stroke="currentColor" stroke-width="1.5" class="dgm-muted"/>
  <g class="dgm-accent">
    <line x1="120" y1="56" x2="300" y2="204" stroke="currentColor" stroke-width="1.5"/>
    <text x="312" y="206" text-anchor="start" font-size="10.5">steep: becomes local</text>
  </g>
  <rect x="520" y="150" width="286" height="88" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="663" y="172" text-anchor="middle" font-size="11" font-weight="700">No position embeddings</text>
  <text x="663" y="192" text-anchor="middle" font-size="10.5">subtract  m · |i − j|  from each score,</text>
  <text x="663" y="208" text-anchor="middle" font-size="10.5">before the softmax — fixed, no learning</text>
  <text x="663" y="228" text-anchor="middle" font-size="10.5" class="dgm-accent">slopes 1/2, 1/4, … , 1/256 per head</text>
</svg>
<figcaption><b>A linear penalty by distance.</b> Each head subtracts a straight-line penalty from its attention scores; a steep per-head slope makes a head strongly local, a shallow one keeps it global.</figcaption>
</figure>

### A Recency Prior, Baked In

The right way to read ALiBi is as a **recency inductive bias** written directly
into the attention geometry. Where RoPE encodes position and lets the model learn
what to do with it, ALiBi simply declares that closer is more relevant and bakes
that declaration into a fixed, parameter-free bias matrix that can be computed
once and reused. It is an opinion about language expressed as arithmetic.

## What It Bought

The headline result is clean. A model trained on 1024-token sequences and
evaluated at 2048 matched the perplexity of a sinusoidal-embedding model that had
been *trained* at 2048 — while training 11% faster and using 11% less memory, and
extrapolating well beyond that point. Free length, and cheaper training besides.

## Why It Matters

ALiBi's lasting contribution was as much conceptual as technical: it reframed
length extrapolation as a first-class objective a designer could target, and gave
the cleanest existence proof that it is achievable at all. The idea shipped in
BLOOM, MPT, BaiChuan, and the Falcon family, and its intellectual descendants —
the sliding-window attention and "attention sink" ideas behind StreamingLLM and
Mistral — carry the recency intuition forward into how long-context serving
manages its cache.

Yet ALiBi lost the adoption race to RoPE, and the reasons are instructive. RoPE
delivers better in-distribution quality, and ALiBi's hard recency prior has a
sharp edge: a model can extrapolate its *perplexity* to long inputs while still
failing needle-in-a-haystack retrieval at distance, because the penalty it
imposes on far-away tokens is exactly what genuine long-range recall needs to
overcome. And the geometric slope schedule, for all that it works, is a heuristic
with no principled derivation. ALiBi won the argument that extrapolation is
possible and lost the argument about how best to achieve it — a productive kind
of defeat.

## Lineage

- **Builds on:** [Attention Is All You Need](/courses/llm-canon/attention-is-all-you-need), whose positional problem ALiBi answers by removal rather than by a better encoding.
- **Leads to:** [BLOOM](/courses/llm-canon/bloom), the open multilingual model that adopted it.
