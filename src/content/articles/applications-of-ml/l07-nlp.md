---
course: applications-of-ml
lectureId: L07
title: "The Company Words Keep"
deck: "Before machines could converse, they had to learn what a word means — and the surprising answer, sketched in 1954, was that meaning is little more than a matter of context."
order: 6
date: 2026-01-28
readingTime: 9
tags: ["nlp", "word2vec", "embeddings", "language-models", "rnn", "perplexity"]
concepts:
  - id: distributional-hypothesis
    term: Distributional Hypothesis
    definition: "The principle, due to Harris (1954), that words appearing in similar contexts tend to share meaning — the meaning of a word is given by the company it keeps."
  - id: n-gram-model
    term: N-Gram Language Model
    definition: "A probabilistic model that estimates the likelihood of a word from the previous n−1 words by counting sequences, made tractable by the Markov assumption of limited history."
  - id: word-embedding
    term: Word Embedding
    definition: "A dense numeric vector representing a word, learned so that words used in similar contexts receive similar vectors — unlike sparse, orthogonal one-hot encodings."
  - id: word2vec
    term: word2vec (Skip-Gram / CBOW)
    definition: "A 2013 framework that learns word embeddings by training a classifier to predict a word from its neighbors (CBOW) or its neighbors from the word (skip-gram)."
  - id: recurrent-network
    term: Recurrent Neural Network (RNN)
    definition: "A network with a feedback loop that carries a hidden state across time steps, letting earlier inputs influence the processing of later ones."
  - id: lstm
    term: Long Short-Term Memory (LSTM)
    definition: "A gated recurrent architecture that resists the vanishing and exploding gradients of plain RNNs, allowing information to persist over longer sequences."
  - id: perplexity
    term: Perplexity
    definition: "An intrinsic evaluation of a language model equal to the inverse probability of the test set normalized by its length; lower perplexity means less surprise."
---

In 1954 the linguist Zellig Harris proposed an idea so simple it sounds almost like
a refusal to answer: the meaning of a word is given by the company it keeps. Words
that turn up in the same contexts, he argued, tend to share meaning. This
**distributional hypothesis** is the philosophical bedrock on which the entire
edifice of modern natural language processing is built. If meaning lives in context,
then a machine that reads enough context can, in principle, learn meaning.

## Counting Our Way to Fluency

The earliest concrete goal was modest: compute the probability of a sentence. A
**language model** assigns a probability to a sequence of words
$P(W)=P(w_1,w_2,\dots,w_N)$ and — equivalently — predicts the next word given those
before it, $P(w_5\mid w_1,w_2,w_3,w_4)$. That second task is exactly what today's
large language models do.

The chain rule of probability decomposes the joint probability into a product of
conditionals:

$$
P(w_1,\dots,w_N)=\prod_{i=1}^{N}P(w_i\mid w_1,\dots,w_{i-1}).
$$

And each conditional can, naively, be estimated by counting:

$$
P(w_i\mid w_1,\dots,w_{i-1})=\frac{\mathrm{Count}(w_1,\dots,w_i)}{\mathrm{Count}(w_1,\dots,w_{i-1})}.
$$

## How Much History?

The catch is that long word sequences almost never recur verbatim in any corpus, so
those counts collapse to zero. The **Markov assumption** rescues the idea by
truncating memory: condition only on the previous $k$ words rather than the entire
past,

$$
P(w_1,\dots,w_N)\approx\prod_{i}P(w_i\mid w_{i-k},\dots,w_{i-1}).
$$

Choosing $k$ yields the family of **n-gram models** — a unigram uses no history
($p(w_i)$), a bigram one word
($p(w_i\mid w_{i-1})=\mathrm{Count}(w_{i-1}w_i)/\mathrm{Count}(w_{i-1})$), a trigram
two, and so on. Larger $n$ captures more context but demands exponentially more
data. That is the **curse of dimensionality** in stark form: modeling the joint
distribution of ten consecutive words over a vocabulary of $100{,}000$ implies up to
$(10^5)^{10}=10^{50}$ free parameters — hopeless to estimate.

## From Words to Numbers

Neural models promised an escape, but they need numbers, not letters. The naive
encoding is **one-hot**: a vector as long as the vocabulary — perhaps 500,000
dimensions — with a single $1$ marking the word. These vectors are hopelessly sparse
and, worse, mutually **orthogonal**: *monarch* and *king* are exactly as unrelated as
*monarch* and *toaster*. One-hot encoding has no notion of similarity at all.

The distributional hypothesis points to the fix. If a word's meaning comes from the
words that frequently appear near it — its context within a fixed window — then we
can learn a *dense* vector for each word, chosen so that words appearing in similar
contexts receive similar vectors. These are **word embeddings**.

<figure>
<svg viewBox="0 0 560 340" role="img" aria-label="A two-dimensional embedding space where words used in similar contexts, such as king, queen, and monarch, cluster together, while an unrelated word like toaster sits far away.">
  <defs>
    <marker id="arw-emb-ax" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" class="dgm-fill"/>
    </marker>
  </defs>
  <line x1="50" y1="300" x2="524" y2="300" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-emb-ax)"/>
  <line x1="50" y1="300" x2="50" y2="36" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-emb-ax)"/>
  <text x="290" y="326" text-anchor="middle" font-size="10" class="dgm-muted">embedding dimension 1</text>
  <g class="dgm-accent">
    <ellipse cx="410" cy="105" rx="62" ry="46" fill="none" stroke="currentColor" stroke-width="1.5" stroke-dasharray="5 4"/>
    <text x="410" y="50" text-anchor="middle" font-size="10">similar context → nearby</text>
  </g>
  <circle cx="385" cy="88" r="3.5" class="dgm-fill"/>
  <text x="385" y="80" text-anchor="middle" font-size="12">monarch</text>
  <circle cx="435" cy="96" r="3.5" class="dgm-fill"/>
  <text x="455" y="100" text-anchor="middle" font-size="12">king</text>
  <circle cx="410" cy="126" r="3.5" class="dgm-fill"/>
  <text x="410" y="144" text-anchor="middle" font-size="12">queen</text>
  <circle cx="250" cy="205" r="3.5" class="dgm-fill"/>
  <text x="250" y="197" text-anchor="middle" font-size="12">man</text>
  <circle cx="290" cy="180" r="3.5" class="dgm-fill"/>
  <text x="308" y="176" text-anchor="middle" font-size="12">woman</text>
  <circle cx="120" cy="255" r="3.5" class="dgm-fill"/>
  <text x="120" y="275" text-anchor="middle" font-size="12">toaster</text>
</svg>
<figcaption><b>The embedding space.</b> Words that share contexts land close together (king, queen, monarch), while an unrelated word such as <em>toaster</em> falls far away — the similarity one-hot vectors could never express.</figcaption>
</figure>

## The word2vec Bargain

**word2vec** (2013) is the framework that made embeddings practical. Its insight is
to treat the vector components themselves as weights to be learned, and to train a
classifier that predicts how likely one word is to appear near another. Two variants
exist: **skip-gram** predicts the surrounding context words from a center word,
while **CBOW** predicts the center word from its context. Skip-gram's objective uses
a softmax over the vocabulary,

$$
P(w_O\mid w_I)=\frac{\exp\!\big(u_{w_O}^{\top}v_{w_I}\big)}{\sum_{w\in V}\exp\!\big(u_{w}^{\top}v_{w_I}\big)},
$$

so that words predicting similar neighbors are pushed toward similar vectors.
Similarity between two learned embeddings is then read off by cosine similarity,

$$
\operatorname{sim}(u,v)=\frac{u^{\top}v}{\lVert u\rVert\,\lVert v\rVert},
$$

which is what lets the famous vector arithmetic — *king − man + woman ≈ queen* —
even make sense.

<figure>
<svg viewBox="0 0 760 300" role="img" aria-label="Two word2vec architectures: skip-gram predicts the surrounding context words from a center word, while CBOW predicts the center word from its surrounding context.">
  <defs>
    <marker id="arw-w2v" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" class="dgm-fill"/>
    </marker>
  </defs>
  <text x="180" y="24" text-anchor="middle" font-size="13" font-weight="700">Skip-gram</text>
  <text x="180" y="42" text-anchor="middle" font-size="10" class="dgm-muted">center → context</text>
  <g class="dgm-accent">
    <rect x="40" y="120" width="70" height="46" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <text x="75" y="148" text-anchor="middle" font-size="13" font-weight="700">wₜ</text>
  </g>
  <rect x="210" y="56" width="86" height="34" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="253" y="78" text-anchor="middle" font-size="12">wₜ₋₂</text>
  <rect x="210" y="104" width="86" height="34" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="253" y="126" text-anchor="middle" font-size="12">wₜ₋₁</text>
  <rect x="210" y="152" width="86" height="34" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="253" y="174" text-anchor="middle" font-size="12">wₜ₊₁</text>
  <rect x="210" y="200" width="86" height="34" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="253" y="222" text-anchor="middle" font-size="12">wₜ₊₂</text>
  <line x1="112" y1="140" x2="208" y2="75" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-w2v)"/>
  <line x1="112" y1="142" x2="208" y2="121" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-w2v)"/>
  <line x1="112" y1="146" x2="208" y2="169" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-w2v)"/>
  <line x1="112" y1="148" x2="208" y2="215" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-w2v)"/>
  <text x="580" y="24" text-anchor="middle" font-size="13" font-weight="700">CBOW</text>
  <text x="580" y="42" text-anchor="middle" font-size="10" class="dgm-muted">context → center</text>
  <rect x="440" y="56" width="86" height="34" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="483" y="78" text-anchor="middle" font-size="12">wₜ₋₂</text>
  <rect x="440" y="104" width="86" height="34" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="483" y="126" text-anchor="middle" font-size="12">wₜ₋₁</text>
  <rect x="440" y="152" width="86" height="34" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="483" y="174" text-anchor="middle" font-size="12">wₜ₊₁</text>
  <rect x="440" y="200" width="86" height="34" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="483" y="222" text-anchor="middle" font-size="12">wₜ₊₂</text>
  <g class="dgm-accent">
    <rect x="650" y="120" width="70" height="46" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <text x="685" y="148" text-anchor="middle" font-size="13" font-weight="700">wₜ</text>
  </g>
  <line x1="528" y1="73" x2="648" y2="138" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-w2v)"/>
  <line x1="528" y1="121" x2="648" y2="140" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-w2v)"/>
  <line x1="528" y1="169" x2="648" y2="144" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-w2v)"/>
  <line x1="528" y1="217" x2="648" y2="146" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-w2v)"/>
</svg>
<figcaption><b>Skip-gram and CBOW.</b> word2vec learns embeddings either by predicting the context from a center word (skip-gram) or the center word from its context (CBOW).</figcaption>
</figure>

## Networks with a Memory

Good word vectors are only the input; something must read them in order. Before
transformers, the standard was the **recurrent neural network**, which threads a
feedback loop through time so that what happens at step $t+2$ can be influenced by
step $t+1$. An RNN carries a hidden state forward, transformed by learned weight
matrices at its input, recurrence, and output stages.

<figure>
<svg viewBox="0 0 780 260" role="img" aria-label="A recurrent network unrolled across three time steps: at each step an input feeds a hidden state that produces an output, and each hidden state passes forward to the next step.">
  <defs>
    <marker id="arw-rnn" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" class="dgm-fill"/>
    </marker>
    <marker id="arw-rnn-rec" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" class="dgm-fill dgm-accent"/>
    </marker>
  </defs>
  <rect x="70" y="190" width="60" height="40" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="100" y="215" text-anchor="middle" font-size="12">x₁</text>
  <rect x="70" y="108" width="60" height="46" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="100" y="136" text-anchor="middle" font-size="13" font-weight="700">h₁</text>
  <rect x="70" y="30" width="60" height="40" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="100" y="55" text-anchor="middle" font-size="12">y₁</text>
  <line x1="100" y1="190" x2="100" y2="156" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-rnn)"/>
  <line x1="100" y1="108" x2="100" y2="72" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-rnn)"/>
  <rect x="260" y="190" width="60" height="40" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="290" y="215" text-anchor="middle" font-size="12">x₂</text>
  <rect x="260" y="108" width="60" height="46" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="290" y="136" text-anchor="middle" font-size="13" font-weight="700">h₂</text>
  <rect x="260" y="30" width="60" height="40" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="290" y="55" text-anchor="middle" font-size="12">y₂</text>
  <line x1="290" y1="190" x2="290" y2="156" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-rnn)"/>
  <line x1="290" y1="108" x2="290" y2="72" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-rnn)"/>
  <rect x="450" y="190" width="60" height="40" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="480" y="215" text-anchor="middle" font-size="12">x₃</text>
  <rect x="450" y="108" width="60" height="46" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="480" y="136" text-anchor="middle" font-size="13" font-weight="700">h₃</text>
  <rect x="450" y="30" width="60" height="40" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="480" y="55" text-anchor="middle" font-size="12">y₃</text>
  <line x1="480" y1="190" x2="480" y2="156" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-rnn)"/>
  <line x1="480" y1="108" x2="480" y2="72" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-rnn)"/>
  <g class="dgm-accent">
    <line x1="130" y1="131" x2="258" y2="131" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-rnn-rec)"/>
    <line x1="320" y1="131" x2="448" y2="131" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-rnn-rec)"/>
    <line x1="510" y1="131" x2="600" y2="131" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-rnn-rec)"/>
    <text x="655" y="138" text-anchor="middle" font-size="20" font-weight="700">…</text>
  </g>
  <text x="100" y="250" text-anchor="middle" font-size="10" class="dgm-muted">t = 1</text>
  <text x="290" y="250" text-anchor="middle" font-size="10" class="dgm-muted">t = 2</text>
  <text x="480" y="250" text-anchor="middle" font-size="10" class="dgm-muted">t = 3</text>
</svg>
<figcaption><b>An RNN unrolled in time.</b> Each step turns an input xₜ into a hidden state hₜ and an output yₜ; the accent arrows carry the hidden state forward, so earlier inputs shape later steps.</figcaption>
</figure>

But vanilla RNNs struggle: as gradients propagate back through many steps they tend
to vanish or explode, stalling learning or destabilizing it. The **long short-term
memory** network (LSTM) became the workhorse of the early 2010s precisely because
its gated cell state is far more resilient to those gradient pathologies, letting it
hold information over longer spans. Even so, an LSTM still ingests one token at a
time and strains to relate words separated by long distances — the limitation that
transformers would later erase.

## The Measure of Surprise

How do we know a language model is any good? **Extrinsic** evaluation asks humans to
judge, which is accurate but slow and costly. **Intrinsic** evaluation instead asks
how probable the model finds held-out text, and its standard measure is
**perplexity** — the inverse probability of the test set, normalized by length:

$$
\mathrm{PP}(W)=P(w_1,\dots,w_N)^{-\frac{1}{N}}=\sqrt[N]{\frac{1}{P(w_1,\dots,w_N)}}.
$$

Applying the chain rule turns it into a per-word quantity,

$$
\mathrm{PP}(W)=\sqrt[N]{\prod_{i=1}^{N}\frac{1}{P(w_i\mid w_1,\dots,w_{i-1})}},
$$

and the punchline is that *minimizing perplexity is the same as maximizing
probability*. The intuition is memorable: if a model assigns each of ten equally
likely words a probability of $\tfrac{1}{10}$, its perplexity is exactly $10$ — as
if it were choosing uniformly among ten options at every step. Lower perplexity
means less surprise.

## Why It Matters

This lecture traces the first act of a twenty-four-year drama that runs from 1999's
n-grams to GPT-4. Its throughline is a single migration: from *counting* word
sequences to *learning* their representations. The distributional hypothesis
supplied the philosophy, word2vec turned it into geometry, and recurrent networks
gave sequences a memory — while perplexity kept everyone honest about progress. Each
idea also exposed a ceiling: sparse counts starved for data, and recurrence choked
on distance. Those very limits set the stage for the mechanism that would follow —
attention — and the transformer architecture that now defines the field.
