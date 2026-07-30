---
course: llm-canon
lectureId: "2018"
title: "The Case for Reading Both Ways"
deck: "BERT (2018) — Google's fill-in-the-blank encoder that let every word see the whole sentence at once and swept the language-understanding benchmarks that GPT-1 could reach only from the left."
order: 3
readingTime: 11
tags: ["pretraining", "bidirectional", "masked-language-modeling", "encoder", "nlp"]
concepts:
  - id: masked-language-modeling
    term: Masked Language Modeling
    definition: "A pretraining objective that hides a fraction of the tokens and trains the model to predict them from the surrounding words, which forces genuinely bidirectional representations."
  - id: bidirectional-context
    term: Bidirectional Context
    definition: "Representations that condition on words to both the left and the right of a position, in contrast to a strictly left-to-right language model."
  - id: cls-pooling
    term: "[CLS] Pooling"
    definition: "Using the final hidden state of a special [CLS] token prepended to the input as the aggregate representation of the whole sequence for classification."
  - id: segment-embeddings
    term: Segment Embeddings
    definition: "Learned embeddings added to tokens to mark which of two input sentences they belong to, letting the model reason about sentence pairs."
  - id: next-sentence-prediction
    term: Next Sentence Prediction
    definition: "A binary pretraining task predicting whether one sentence actually follows another; later work showed it contributes little and it is often dropped."
  - id: masking-split
    term: The 80/10/10 Split
    definition: "Of the tokens chosen for masking, 80% become [MASK], 10% a random token, and 10% are left unchanged — a trick to avoid a train/test mismatch, since [MASK] never appears at fine-tuning time."
---

GPT-1 had shown that a single pretrained Transformer could be adapted to task
after task, but it carried a quiet structural compromise. Because it read
strictly left to right, the representation it built for any word could draw only
on the words before it — never the ones after. For generation that is exactly
right; you cannot condition on tokens you have not yet produced. For
understanding, it is a self-inflicted wound. Deciding whether a word is a verb or
a noun, extracting an answer span, classifying a sentence — all of these are
easier when a word can see its entire neighborhood. In late 2018 a team at Google
proposed an encoder that let every token look both directions at once, and it
rewrote the leaderboard for language understanding almost overnight. Its name was
BERT.

## The One-Directional Handicap

The obstacle is subtle, and it is why nobody had simply flipped a switch to make
language models bidirectional. If every token could attend to every other,
including the ones that come after it, then predicting the next word becomes
trivial — through the stacked layers, a token can effectively see itself. GPT
sidesteps the problem by only ever looking left, which is safe but throws away
half the context. BERT needed an objective that could use both sides without
letting the answer leak in.

## Fill in the Blank

The solution is **masked language modeling**. Randomly select fifteen percent of
the tokens, hide them, and train the model to recover the originals from
everything left visible on both sides:

$$
\mathcal{L}_{\text{MLM}} = -\sum_{i \in \mathcal{M}} \log P\!\left(x_i \mid x_{\setminus \mathcal{M}}\right)
$$

The crucial detail is the conditioning set $x_{\setminus \mathcal{M}}$: it spans
the words to the left *and* the right of each masked position, which is exactly
the **bidirectional context** GPT-1 could not use. Because the masked word is
removed from the input, it cannot see itself, and the leakage problem dissolves.

There is one more wrinkle, and it is a clever one. Of the tokens selected for
masking, only 80 percent are actually replaced with a `[MASK]` symbol; 10 percent
are swapped for a random token, and 10 percent are left untouched. This
**80/10/10 split** exists because `[MASK]` never appears when the model is later
fine-tuned on real tasks. Training purely on masked slots would teach the model
to expect a symbol it will never see again, so BERT is forced to keep honest,
useful representations for ordinary and even corrupted tokens too.

<figure>
<svg viewBox="0 0 820 250" role="img" aria-label="BERT masked language modeling: one token in a sentence is replaced by a mask, a bidirectional Transformer encoder reads every other token on both the left and the right, and predicts the hidden word.">
  <defs>
    <marker id="arw-bert" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" class="dgm-fill"/>
    </marker>
  </defs>
  <g class="dgm-accent">
    <rect x="242" y="34" width="140" height="42" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <text x="312" y="60" text-anchor="middle" font-size="12.5" font-weight="700">predict → sat</text>
  </g>
  <line x1="312" y1="108" x2="312" y2="80" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-bert)"/>
  <rect x="20" y="110" width="710" height="46" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="375" y="138" text-anchor="middle" font-size="13" font-weight="700">Bidirectional Transformer encoder</text>
  <line x1="72" y1="182" x2="72" y2="158" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-bert)"/>
  <line x1="192" y1="182" x2="192" y2="158" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-bert)"/>
  <line x1="312" y1="182" x2="312" y2="158" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-bert)"/>
  <line x1="432" y1="182" x2="432" y2="158" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-bert)"/>
  <line x1="552" y1="182" x2="552" y2="158" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-bert)"/>
  <line x1="672" y1="182" x2="672" y2="158" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-bert)"/>
  <rect x="20" y="182" width="104" height="40" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="72" y="207" text-anchor="middle" font-size="12">The</text>
  <rect x="140" y="182" width="104" height="40" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="192" y="207" text-anchor="middle" font-size="12">cat</text>
  <g class="dgm-accent">
    <rect x="260" y="182" width="104" height="40" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <text x="312" y="207" text-anchor="middle" font-size="12" font-weight="700">[MASK]</text>
  </g>
  <rect x="380" y="182" width="104" height="40" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="432" y="207" text-anchor="middle" font-size="12">on</text>
  <rect x="500" y="182" width="104" height="40" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="552" y="207" text-anchor="middle" font-size="12">the</text>
  <rect x="620" y="182" width="104" height="40" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="672" y="207" text-anchor="middle" font-size="12">mat</text>
  <text x="150" y="240" text-anchor="middle" font-size="10.5" class="dgm-muted">← left context</text>
  <text x="594" y="240" text-anchor="middle" font-size="10.5" class="dgm-muted">right context →</text>
</svg>
<figcaption><b>Filling the blank from both sides.</b> A masked token is predicted by an encoder that reads every remaining word to its left and its right at once — the bidirectional context GPT-1's left-to-right objective could not touch.</figcaption>
</figure>

## The Sentence-Pair Bet

BERT pairs its masked objective with a second, **next sentence prediction**: given
two sentences, decide whether the second genuinely follows the first. The
intention was to teach the inter-sentence relationships that question answering
and entailment lean on. It was a reasonable bet that did not fully pay off —
later work, notably RoBERTa, found that dropping this task changed little. An
early reminder that not every auxiliary objective earns its place.

## Built to Compare

The input representation stacks three signals: token embeddings, **segment
embeddings** that mark which of two sentences a token belongs to, and learned
position embeddings. A special `[CLS]` token sits at the front, and its final
hidden state — **[CLS] pooling** — serves as the summary vector for
classification. Two sizes were released: BERT-Base at twelve layers and 110
million parameters, sized deliberately to match GPT-1 for a clean comparison, and
BERT-Large at twenty-four layers and 340 million. Both trained on BooksCorpus plus
English Wikipedia, roughly 3.3 billion words. Fine-tuning adds one output layer
and runs for just a few epochs — trivial next to the pretraining bill.

## Why It Matters

The numbers ended the argument for a while. BERT posted a GLUE score of 80.5, a
SQuAD v1.1 F1 of 93.2 that edged past human performance on that benchmark, and new
state of the art across eleven tasks. For years afterward it defined production
NLP — search ranking, classification, entity extraction — and encoder models of
its lineage remain the right tool for embeddings and retrieval, which is why
BERT-family encoders still sit inside most retrieval-augmented systems today.

Its limits are the mirror image of its strengths. BERT cannot generate; the fill-
in-the-blank objective builds understanding, not text. It also never escapes the
need to fine-tune per task, so it never becomes the single general interface the
GPT line was quietly circling. And the masked objective is sample-inefficient —
only the fifteen percent of tokens that are hidden produce a learning signal on
each pass, so a great deal of computation buys comparatively little gradient. The
field's center of gravity would drift back toward the decoder, but BERT settled,
permanently, that understanding wants to read both ways.

## Lineage

- **Builds on:** [Attention Is All You Need](/courses/llm-canon/attention-is-all-you-need) — the Transformer encoder — and [GPT-1](/courses/llm-canon/gpt-1)'s pretrain-then-finetune structure, run in the opposite direction.
- **Leads to:** [RAG](/courses/llm-canon/rag), whose dense retrievers are built from encoders of exactly this kind.
