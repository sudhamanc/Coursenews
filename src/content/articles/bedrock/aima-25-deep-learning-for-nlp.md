---
course: bedrock
lectureId: AIMA 25
book: "Artificial Intelligence: A Modern Approach"
part: "VI · Communicating, Perceiving, and Acting"
title: "Learning the Representation Instead of Designing It"
deck: "Chapter 25 is the fourth edition's account of what replaced the grammars: embeddings that put meaning in a vector space, attention that connects any two positions in one step, and pretraining that turns a corpus into reusable prior knowledge."
order: 25
chapter: 25
readingTime: 14
tags: ["embeddings", "transformer", "attention", "pretraining", "transfer-learning"]
concepts:
  - id: word-embeddings
    term: Word Embeddings
    definition: "Dense vectors placing words in a continuous space where proximity reflects distributional similarity, learned from the distributional hypothesis that words in similar contexts have similar meanings. They generalize across words in a way discrete symbols cannot."
  - id: rnn-for-nlp
    term: Recurrent Models for Language
    definition: "Networks processing a sequence step by step while maintaining a hidden state, removing the n-gram window limit in principle. Bidirectional variants read both directions; vanishing gradients and strictly sequential computation remain the limits."
  - id: seq2seq
    term: Sequence-to-Sequence Models
    definition: "An encoder compresses the input into a representation and a decoder generates the output from it. The fixed-size bottleneck is the flaw that attention was introduced to fix."
  - id: attention
    term: Attention
    definition: "Computing a weighted combination of all positions, where the weights come from learned query–key compatibility. It gives every position direct access to every other in a single step, regardless of distance."
  - id: transformer
    term: The Transformer
    definition: "An architecture built from self-attention, multiple heads, position encodings, feedforward sublayers, residual connections, and layer normalization — dispensing with recurrence so that sequence computation parallelizes."
  - id: self-attention
    term: Self-Attention and Multiple Heads
    definition: "Each position attends to all positions in the same sequence, so representations are contextual. Multiple heads let different subspaces capture different relation types — syntactic, coreferential, semantic — in parallel."
  - id: pretraining
    term: Pretraining and Fine-Tuning
    definition: "Train on a large unlabeled corpus with a self-supervised objective, then adapt to a task with far fewer labels. Masked language modeling (BERT) and autoregressive prediction (GPT) are the two dominant objectives."
  - id: transfer-as-prior
    term: Transfer Learning as Acquired Prior Knowledge
    definition: "A pretrained model carries knowledge about language and the world into every downstream task, reducing the labeled data each one requires — Chapter 20's substitution of knowledge for data, with the knowledge obtained by learning rather than by being stated."
---

Chapter 24 described language as a formal system and explained why the
description keeps failing. Chapter 25 describes what worked instead, and the
organizing idea is a reversal: rather than designing a representation of
linguistic structure and fitting language into it, **learn the representation
from the data** and let the structure be whatever the model finds useful.

## Meaning as Position

The starting point is the inadequacy of discrete symbols. Treating each word as
an atom means every pair of distinct words is equally dissimilar: *cat* is as
unrelated to *dog* as to *bureaucracy*. A model that has seen "the cat slept" has
learned nothing applicable to "the dog slept."

**Word embeddings** place words as dense vectors in a continuous space, learned
from the **distributional hypothesis** — words appearing in similar contexts have
similar meanings. Proximity in the space reflects distributional similarity, so
generalization across words becomes automatic. The celebrated vector arithmetic
(*king* − *man* + *woman* ≈ *queen*) demonstrates that some relational structure
is captured; the chapter treats this as suggestive rather than as evidence of
deep semantic organization, which is the right level of enthusiasm.

The limitation of static embeddings is that a word gets one vector regardless of
context, so *bank* carries an average of its senses and fits neither. Contextual
representations fix this, and the fix is what the rest of the chapter builds.

## Sequences, and the Bottleneck

**Recurrent networks** process a sequence step by step, maintaining a hidden
state. In principle this removes the n-gram window limit, since the state can
carry information arbitrarily far. In practice, vanishing gradients attenuate
long-range signal — which LSTM gating mitigates rather than solves — and the
strictly sequential computation forbids parallelism across positions, which
becomes the binding constraint at scale. **Bidirectional** RNNs read both
directions so each position's representation reflects both left and right
context.

**Sequence-to-sequence** models handle translation and similar tasks with an
encoder that compresses the input and a decoder that generates the output. The
flaw is structural and the chapter names it precisely: the entire source sentence
must pass through a **fixed-size vector**. Long sentences degrade, because the
bottleneck cannot widen.

## Attention

**Attention** removes the bottleneck by letting the decoder look back at all
encoder positions, weighted by relevance. For a query $\mathbf{q}$ and key–value
pairs, the standard form is

$$\text{Attention}(Q,K,V) = \text{softmax}\!\left(\frac{QK^{\top}}{\sqrt{d_k}}\right)V$$

The queries and keys produce compatibility scores; the softmax turns them into
weights; the output is the weighted combination of values. The scaling by
$\sqrt{d_k}$ keeps the dot products in a range where the softmax has usable
gradients.

The consequence worth stating carefully: **the path length between any two
positions becomes one step**. In a recurrent model, information from position 1
reaches position 100 by passing through 99 intermediate states, degrading at
each. With attention it is a single direct computation, so distance stops
mattering.

<figure>
<svg viewBox="0 0 840 260" role="img" aria-label="In a recurrent model information from the first position reaches the last by passing through every intermediate state, while with attention every position connects to every other position directly in one step.">
  <defs>
    <marker id="arw-aima25-attn" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" class="dgm-fill"/>
    </marker>
  </defs>
  <text x="200" y="28" text-anchor="middle" font-size="12" font-weight="700">RECURRENT</text>
  <circle cx="70" cy="80" r="14" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <circle cx="135" cy="80" r="14" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <circle cx="200" cy="80" r="14" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <circle cx="265" cy="80" r="14" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <circle cx="330" cy="80" r="14" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <line x1="85" y1="80" x2="119" y2="80" stroke="currentColor" stroke-width="1.4" marker-end="url(#arw-aima25-attn)"/>
  <line x1="150" y1="80" x2="184" y2="80" stroke="currentColor" stroke-width="1.4" marker-end="url(#arw-aima25-attn)"/>
  <line x1="215" y1="80" x2="249" y2="80" stroke="currentColor" stroke-width="1.4" marker-end="url(#arw-aima25-attn)"/>
  <line x1="280" y1="80" x2="314" y2="80" stroke="currentColor" stroke-width="1.4" marker-end="url(#arw-aima25-attn)"/>
  <text x="200" y="128" text-anchor="middle" font-size="10.5" class="dgm-muted">position 1 reaches position 5</text>
  <text x="200" y="146" text-anchor="middle" font-size="10.5" class="dgm-muted">through every state in between</text>
  <text x="200" y="176" text-anchor="middle" font-size="11" font-weight="700">path length grows with distance</text>
  <text x="200" y="198" text-anchor="middle" font-size="10.5" class="dgm-muted">signal attenuates · no parallelism</text>
  <line x1="420" y1="40" x2="420" y2="220" stroke="currentColor" stroke-width="1" stroke-dasharray="4 4" class="dgm-muted"/>
  <g class="dgm-accent">
    <text x="625" y="28" text-anchor="middle" font-size="12" font-weight="700">SELF-ATTENTION</text>
  </g>
  <circle cx="500" cy="80" r="14" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <circle cx="562" cy="80" r="14" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <circle cx="624" cy="80" r="14" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <circle cx="686" cy="80" r="14" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <circle cx="748" cy="80" r="14" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <g class="dgm-accent">
    <path d="M500 66 Q 624 16 748 66" fill="none" stroke="currentColor" stroke-width="1.7" marker-end="url(#arw-aima25-attn)"/>
    <path d="M500 66 Q 562 36 622 66" fill="none" stroke="currentColor" stroke-width="1.2"/>
    <path d="M500 66 Q 593 26 684 66" fill="none" stroke="currentColor" stroke-width="1.2"/>
    <path d="M500 94 Q 562 124 622 94" fill="none" stroke="currentColor" stroke-width="1.2"/>
    <path d="M562 94 Q 655 134 748 94" fill="none" stroke="currentColor" stroke-width="1.2"/>
  </g>
  <text x="625" y="146" text-anchor="middle" font-size="10.5">every position connects to every other</text>
  <text x="625" y="176" text-anchor="middle" font-size="11" font-weight="700">path length is always one</text>
  <text x="625" y="198" text-anchor="middle" font-size="10.5" class="dgm-muted">distance stops mattering · fully parallel</text>
  <text x="420" y="240" text-anchor="middle" font-size="10.5" class="dgm-muted">the cost is quadratic in sequence length — every pair is computed</text>
</svg>
<figcaption><b>What attention bought.</b> Constant path length between positions, and computation that parallelizes — which is what made training at scale practical.</figcaption>
</figure>

## The Transformer

The **Transformer** takes the step of removing recurrence entirely, keeping only
attention. Its components each address a specific requirement.

**Self-attention** has each position attend to all positions *in the same
sequence*, so every token's representation is contextual — computed with
knowledge of the entire sentence rather than a fixed window.

**Multi-head attention** runs several attention operations in parallel over
different learned subspaces, so different heads can specialize in different
relation types. Analyses find heads that track syntactic dependencies, others
that follow coreference; the chapter reports this without overclaiming that the
heads are interpretable in general.

**Positional encoding** is required because attention is permutation-invariant —
it computes over a set, not a sequence — so order information must be injected
explicitly.

**Residual connections** and **layer normalization** are what make deep stacks
trainable, as in Chapter 22. Position-wise **feedforward** sublayers add
nonlinear capacity between attention layers.

The cost is quadratic in sequence length, since every pair of positions is
scored. The chapter notes this as the architecture's main scaling limitation.

## Pretraining

The final conceptual move is **self-supervised pretraining**: train on a large
unlabeled corpus using an objective derived from the text itself, then adapt to
specific tasks.

Two objectives dominate. **Masked language modeling** (BERT) hides tokens and
predicts them from bidirectional context, producing representations good for
understanding tasks. **Autoregressive modeling** (GPT) predicts the next token
from the left context, producing models that generate.

The chapter's framing of why this matters is the one that connects back across
the book. Labeled data is scarce and expensive; unlabeled text is abundant.
Pretraining converts abundance into capability, and a pretrained model brings
knowledge about language — and, incidentally, about the world — into every
downstream task, so each task needs far fewer labels.

That is **Chapter 20's thesis arriving from the other direction**. Knowledge
substitutes for data because it shrinks the hypothesis space; pretraining
acquires that knowledge by learning rather than by having a person state it. The
fourth edition is explicit about the connection, and it is the most illuminating
sentence in the chapter.

The **state of the art** section describes rapid capability growth with scale and
the emergence of few-shot and zero-shot behavior. The chapter's caution is
measured and has aged well: these systems lack grounding, have no reliable model
of truth, reproduce biases present in their training corpora, and their fluency
substantially outruns their reliability.

## Why It Matters

This chapter is the most direct link between the book and current practice, and
its value is in supplying the *reasons* rather than the architectures.

Attention exists because of the seq2seq bottleneck. The Transformer removed
recurrence because sequential computation would not parallelize. Pretraining
exists because labels are scarce and text is not. Each design decision solved a
specific identified problem, and knowing which problem is what lets you reason
about what a different architecture would or would not fix.

The chapter also positions these systems correctly within the book's frame. A
language model is a learned function from context to a distribution over next
tokens — a component, in Chapter 2's terms, not an agent. It has no goals, no
utility function, and no model of its own effects on the world. Everything Part IV
said about decision-making under uncertainty remains necessary for building an
agent around such a component, and the fourth edition's argument about objectives
applies with full force to whatever objective the surrounding system is given.
