---
course: applications-of-ml
lectureId: L08
title: "The Machines That Learned to Pay Attention"
deck: "How the transformer dismantled the recurrent bottleneck — and why one equation, attention, now underwrites nearly every large language model."
order: 7
date: 2026-02-04
readingTime: 11
tags: ["transformers", "attention", "encoder-decoder", "BERT", "nlp"]
concepts:
  - id: encoder-decoder
    term: Encoder–Decoder Architecture
    definition: "A two-stage design in which an encoder compresses an input sequence into contextualized representations and a decoder generates an output sequence from them — the backbone of machine translation and sequence-to-sequence learning."
  - id: attention
    term: Attention Mechanism
    definition: "A learned, weighted lookup that lets each position in a sequence draw information directly from every other position, replacing the fixed-size context vector of recurrent models."
  - id: self-attention
    term: Self-Attention
    definition: "Attention applied within a single sequence, where every token computes queries, keys, and values over the same set of tokens to build context-aware representations."
  - id: multi-head
    term: Multi-Head Attention
    definition: "Running several attention operations in parallel on projected subspaces so the model can attend to different relationships (syntax, coreference, position) simultaneously."
  - id: positional-encoding
    term: Positional Encoding
    definition: "Signals added to token embeddings that reintroduce word order, which pure attention would otherwise ignore because it is permutation-invariant."
  - id: bidirectional-encoder
    term: Bidirectional Encoder (BERT)
    definition: "An encoder-only transformer trained with masked-language modeling so each token is contextualized by words on both its left and right."
---

For two decades, teaching a machine to translate a sentence meant teaching it to
remember. Recurrent networks read a sentence one word at a time, folding each
new token into a single hidden state that was supposed to carry the meaning of
everything seen so far. It was an elegant idea with a fatal squeeze: by the time
a long sentence reached its final clause, the beginning had been compressed,
blurred, and half-forgotten. The transformer's central insight was to stop
remembering sequentially and start **looking everywhere at once**.

## From Translation to a General Blueprint

The story begins with machine translation. The classical recipe took bilingual
parallel texts, appended an end-of-sentence marker to each source sentence,
concatenated the target translation, and trained a language model over the
combined stream. To translate, the system treated the input as a prefix — the
*encoding* step — and then generated the translation token by token — the
*decoding* step.

Abstract away the translation task and you are left with the **encoder–decoder**
architecture that defines sequence-to-sequence learning. An encoder consumes an
input sequence $x_1, \dots, x_N$ and produces a sequence of contextualized
representations $h_1, \dots, h_N$. A **context vector** $c$ is computed as a
function of those representations and is meant to convey the essence of the input
to the decoder. The decoder accepts $c$ and generates hidden states
$h_1, \dots, h_M$, which are mapped to the output tokens $y_1, \dots, y_M$.

The weakness is that single vector $c$. Everything the decoder ever learns about
a fifty-word sentence has to pass through one fixed-width channel. That is the
bottleneck attention was invented to break.

<figure>
<svg viewBox="0 0 780 230" role="img" aria-label="Encoder-decoder architecture: an input sequence is encoded into a single context vector, which the decoder expands into an output sequence.">
  <defs>
    <marker id="arw-ed" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" class="dgm-fill"/>
    </marker>
  </defs>
  <rect x="8" y="78" width="120" height="74" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="68" y="108" text-anchor="middle" font-size="13" font-weight="700">Input</text>
  <text x="68" y="130" text-anchor="middle" font-size="13">x₁ … xₙ</text>
  <line x1="132" y1="115" x2="176" y2="115" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-ed)"/>
  <rect x="180" y="55" width="150" height="120" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="255" y="110" text-anchor="middle" font-size="15" font-weight="700">Encoder</text>
  <text x="255" y="132" text-anchor="middle" font-size="11" class="dgm-muted">h₁ … hₙ</text>
  <line x1="330" y1="115" x2="372" y2="115" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-ed)"/>
  <g class="dgm-accent">
    <rect x="376" y="90" width="70" height="50" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <text x="411" y="121" text-anchor="middle" font-size="16" font-weight="700">c</text>
  </g>
  <text x="411" y="162" text-anchor="middle" font-size="10" class="dgm-muted">context</text>
  <line x1="446" y1="115" x2="488" y2="115" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-ed)"/>
  <rect x="492" y="55" width="150" height="120" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="567" y="118" text-anchor="middle" font-size="15" font-weight="700">Decoder</text>
  <line x1="642" y1="115" x2="686" y2="115" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-ed)"/>
  <rect x="690" y="78" width="82" height="74" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="731" y="108" text-anchor="middle" font-size="13" font-weight="700">Output</text>
  <text x="731" y="130" text-anchor="middle" font-size="13">y₁ … yₘ</text>
</svg>
<figcaption><b>The encoder–decoder</b> The encoder turns the input into contextualized states; a single context vector <em>c</em> is the fixed-width bottleneck that attention was built to widen.</figcaption>
</figure>

## Attention: A Learned Lookup

Instead of forcing the decoder to rely on one summary vector, attention lets it
consult *all* of the encoder's representations at every step, weighting them by
relevance. Each output position asks a question — a **query** — and compares it
against a **key** for every input position; the resulting scores become weights
over the corresponding **values**.

The transformer expresses this as scaled dot-product attention:

$$
\text{Attention}(Q, K, V) = \text{softmax}\!\left(\frac{QK^{\top}}{\sqrt{d_k}}\right) V
$$

Here $Q$, $K$, and $V$ are matrices of queries, keys, and values obtained by
projecting the inputs through learned weight matrices. The dot product
$QK^{\top}$ measures compatibility between every query and every key; dividing by
$\sqrt{d_k}$ keeps those scores from growing so large that the softmax saturates;
and the softmax turns them into a probability distribution that mixes the values.
The result is a context vector computed *per position*, not once for the whole
sentence.

<figure>
<svg viewBox="0 0 820 210" role="img" aria-label="Scaled dot-product attention pipeline: queries and keys are multiplied, scaled, passed through a softmax, and used to weight the values.">
  <defs>
    <marker id="arw-at" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" class="dgm-fill"/>
    </marker>
  </defs>
  <rect x="10" y="28" width="56" height="38" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="38" y="52" text-anchor="middle" font-size="15" font-weight="700">Q</text>
  <rect x="10" y="104" width="56" height="38" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="38" y="128" text-anchor="middle" font-size="15" font-weight="700">K</text>
  <rect x="120" y="66" width="96" height="40" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="168" y="91" text-anchor="middle" font-size="14">QKᵀ</text>
  <line x1="66" y1="47" x2="118" y2="78" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-at)"/>
  <line x1="66" y1="123" x2="118" y2="94" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-at)"/>
  <rect x="250" y="66" width="96" height="40" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="298" y="91" text-anchor="middle" font-size="13">scale</text>
  <line x1="216" y1="86" x2="248" y2="86" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-at)"/>
  <g class="dgm-accent">
    <rect x="380" y="66" width="96" height="40" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <text x="428" y="91" text-anchor="middle" font-size="13" font-weight="700">softmax</text>
  </g>
  <line x1="346" y1="86" x2="378" y2="86" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-at)"/>
  <rect x="510" y="66" width="110" height="40" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="565" y="91" text-anchor="middle" font-size="13">weights × V</text>
  <line x1="476" y1="86" x2="508" y2="86" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-at)"/>
  <rect x="510" y="150" width="56" height="38" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="538" y="174" text-anchor="middle" font-size="15" font-weight="700">V</text>
  <line x1="565" y1="150" x2="565" y2="108" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-at)"/>
  <line x1="620" y1="86" x2="664" y2="86" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-at)"/>
  <text x="732" y="82" text-anchor="middle" font-size="12" font-weight="700">Attention</text>
  <text x="732" y="99" text-anchor="middle" font-size="12">output</text>
</svg>
<figcaption><b>Scaled dot-product attention</b> Query–key products become scaled scores; a softmax turns them into weights that blend the values into a per-position context.</figcaption>
</figure>

## Self-Attention and the Death of Recurrence

The pivotal move in *Attention Is All You Need* was to apply attention **within**
a single sequence — **self-attention** — and then to throw out recurrence
entirely. Every token generates its own query, key, and value and attends to
every other token, including itself. A pronoun can look directly at its
antecedent twenty words back; a verb can find its subject regardless of distance.

Because there is no left-to-right recursion, every position is computed in
parallel. This is why transformers train so efficiently on modern hardware: the
sequential dependency that throttled recurrent networks is simply gone.

## Many Heads Are Better Than One

A single attention operation can only express one notion of relevance at a time.
**Multi-head attention** runs several attention operations in parallel, each on a
lower-dimensional projection of the inputs:

$$
\text{head}_i = \text{Attention}(QW_i^Q,\; KW_i^K,\; VW_i^V)
$$

The heads are concatenated and projected back to the model dimension. One head
may track syntactic dependencies, another may resolve coreference, another may
simply attend to neighboring words. The model discovers this division of labor on
its own during training.

## Restoring Word Order

Self-attention has a curious blind spot: it is **permutation-invariant**. Shuffle
the input tokens and the raw attention computation produces the same set of
outputs, merely reordered — it has no built-in sense of sequence. Transformers
repair this with **positional encodings** added to the token embeddings, giving
the model a signal for *where* each token sits. Order, discarded by attention, is
handed back explicitly.

## Reading in Both Directions

The final act of the lecture is the **bidirectional encoder**, embodied by BERT.
A decoder-style language model is inherently left-to-right: it predicts the next
word and must not peek at the future. But many tasks — classification, question
answering, named-entity recognition — benefit from seeing the *whole* sentence.

BERT keeps only the encoder stack and trains it with **masked-language modeling**:
random tokens are hidden and the model must reconstruct them from both their left
and right context. The payoff is a representation of each word that is informed by
everything around it, which can then be fine-tuned for a downstream task with a
small task-specific head.

## Why It Matters

The arc from n-grams to GPT-4 spans roughly twenty-four years, but the
discontinuity is sharp and recent. Once attention replaced recurrence, sequence
models became parallelizable, scalable, and — crucially — hungry for data in a way
that rewarded ever-larger training runs. Every contemporary large language model,
every bidirectional encoder, every diffusion text conditioner traces its lineage
to the same compact equation. The machines did not learn to remember better; they
learned to pay attention.
