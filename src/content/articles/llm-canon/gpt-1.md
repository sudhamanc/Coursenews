---
course: llm-canon
lectureId: "2018"
title: "Read the Library, Then Sit the Exam"
deck: "Improving Language Understanding by Generative Pre-Training (2018) — OpenAI's proof that one decoder-only Transformer, pretrained on plain text and then lightly fine-tuned, could beat purpose-built systems across a dozen language tasks."
order: 2
readingTime: 11
tags: ["pretraining", "transfer-learning", "language-model", "fine-tuning", "seminal"]
concepts:
  - id: generative-pretraining
    term: Generative Pre-Training
    definition: "Training a language model on large amounts of unlabeled text with a next-token prediction objective, so it learns general linguistic structure before any task-specific data is seen."
  - id: decoder-only-transformer
    term: Decoder-Only Transformer
    definition: "A Transformer that keeps only the decoder stack — masked self-attention plus feed-forward layers — making it a purely autoregressive next-token predictor with no encoder or cross-attention."
  - id: input-transformation
    term: Task-Specific Input Transformation
    definition: "Serializing structured task inputs — pairs, triples, multiple-choice options — into a single delimited token sequence so one architecture handles every task. The ancestor of prompt formatting."
  - id: auxiliary-lm-objective
    term: Auxiliary Language-Modeling Objective
    definition: "Keeping the language-modeling loss as a secondary term during fine-tuning, which the paper found improved generalization and sped up convergence."
  - id: full-fine-tuning
    term: Full Fine-Tuning
    definition: "Adapting a pretrained model to a task by updating all of its weights, not just a small output head — the transfer method GPT-1 established for NLP."
  - id: two-stage-recipe
    term: Two-Stage Recipe
    definition: "The pretrain-broadly-then-adapt-narrowly workflow GPT-1 introduced, which still describes the base-model half of every large language model."
---

By 2018 the economics of natural-language processing were upside down. The
labeled datasets models trained on were small, costly, and balkanized — one for
sentiment, another for entailment, a third for question answering — while the raw
text nobody had annotated was effectively infinite. Earlier transfer methods had
smuggled a sliver of that free text into supervised models as pretrained word
vectors or shallow features, but the deep machinery was always rebuilt from
scratch for each task. A four-author report from OpenAI,
*Improving Language Understanding by Generative Pre-Training*, proposed something
more audacious: pretrain one deep Transformer on a mountain of ordinary prose,
then adapt that same network — nearly whole — to each task in turn. The recipe it
introduced still describes the base-model half of every model in this collection.

## The Data Asymmetry

The gap the paper attacked was structural. Approaches like word2vec and ELMo had
proven that unlabeled text carried transferable signal, but they moved only
embeddings or a layer of features; nobody had successfully transferred an entire
deep language model into downstream tasks. The bet was that general linguistic
competence — grammar, world associations, the rhythm of argument — could be
learned once, cheaply, from unlabeled text, and then reused everywhere, leaving
each task to supply only a thin layer of specialization.

## Read the Library

The first stage is **generative pre-training**, and it is unsupervised. A
twelve-layer **decoder-only Transformer** of roughly 117 million parameters is
trained on BooksCorpus — about seven thousand unpublished books — with nothing
but a next-token objective. Formally, the model maximizes the likelihood of each
token given a window of those before it:

$$
L_1(\mathcal{U}) = \sum_i \log P\!\left(u_i \mid u_{i-k}, \ldots, u_{i-1};\, \Theta\right)
$$

The choice of long books over shuffled sentences was deliberate. Contiguous
passages force the model to track structure across paragraphs, teaching the
long-range dependencies that a bag of disconnected sentences never would.

## One Model, Many Shapes

The elegance is in what happens next. Rather than design a bespoke architecture
per task, GPT-1 uses **task-specific input transformations**: structured inputs
are flattened into a single delimited token stream that the pretrained model can
read as if it were ordinary text. Entailment becomes a premise, a delimiter, and
a hypothesis in one sequence. Similarity is scored in both orderings and summed,
since the relation is symmetric. Multiple choice becomes one sequence per option,
each scored and compared. This traversal-style serialization is the direct
ancestor of everything we now call prompt formatting.

## Sit the Exam

The second stage is supervised **full fine-tuning**. A single linear output layer
is bolted on, and the entire network is trained on the target task's labeled data.
The one subtlety is that the pretraining objective does not vanish — it is kept
as an **auxiliary language-modeling objective**, blended into the loss:

$$
L_3(\mathcal{C}) = L_2(\mathcal{C}) + \lambda\, L_1(\mathcal{C})
$$

That extra term, the paper reported, both improved generalization and made
optimization converge faster. The whole adaptation is cheap relative to
pretraining — the expensive learning has already been paid for once, up front.

<figure>
<svg viewBox="0 0 820 250" role="img" aria-label="GPT-1 two-stage recipe: stage one pretrains a decoder-only Transformer on unlabeled text with next-token prediction, and the pretrained weights transfer to stage two, where the same network gains a linear head and is fine-tuned on a labeled task.">
  <defs>
    <marker id="arw-gpt1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" class="dgm-fill"/>
    </marker>
  </defs>
  <text x="155" y="22" text-anchor="middle" font-size="12" font-weight="700">Stage 1 · Pretrain</text>
  <text x="635" y="22" text-anchor="middle" font-size="12" font-weight="700">Stage 2 · Fine-tune</text>
  <rect x="55" y="36" width="200" height="48" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="155" y="65" text-anchor="middle" font-size="11.5">Unlabeled text · BooksCorpus</text>
  <line x1="155" y1="84" x2="155" y2="104" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-gpt1)"/>
  <rect x="55" y="106" width="200" height="66" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="155" y="132" text-anchor="middle" font-size="12" font-weight="700">Decoder-only Transformer</text>
  <text x="155" y="151" text-anchor="middle" font-size="10.5" class="dgm-muted">next-token prediction</text>
  <rect x="530" y="36" width="210" height="48" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="635" y="65" text-anchor="middle" font-size="11.5">Labeled task · delimited input</text>
  <line x1="635" y1="84" x2="635" y2="104" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-gpt1)"/>
  <g class="dgm-accent">
    <rect x="530" y="106" width="210" height="66" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <text x="635" y="132" text-anchor="middle" font-size="12" font-weight="700">same Transformer</text>
    <text x="635" y="151" text-anchor="middle" font-size="10.5">+ linear head</text>
  </g>
  <line x1="635" y1="172" x2="635" y2="192" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-gpt1)"/>
  <rect x="545" y="194" width="180" height="44" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="635" y="221" text-anchor="middle" font-size="12" font-weight="700">Task prediction</text>
  <line x1="255" y1="139" x2="528" y2="139" stroke="currentColor" stroke-width="1.3" stroke-dasharray="4 3" marker-end="url(#arw-gpt1)"/>
  <text x="392" y="129" text-anchor="middle" font-size="10.5" class="dgm-muted">transfer weights Θ</text>
</svg>
<figcaption><b>Pretrain, then adapt.</b> One decoder-only Transformer is trained on unlabeled text by next-token prediction; the same weights are carried into a light task-specific fine-tune that adds only a linear head.</figcaption>
</figure>

## Why It Matters

The payoff was decisive for its moment: new state of the art on nine of twelve
tasks, spanning commonsense reasoning, question answering, and textual
entailment. Just as telling, the model's zero-shot behavior improved steadily as
pretraining progressed, a hint that the unsupervised stage was already absorbing
task-relevant structure on its own — a thread GPT-2 would pull hard. The lasting
contribution is the **two-stage recipe** itself. Pretrain broadly on cheap text,
adapt narrowly with a little labeled data: that shape dominated NLP for the next
four years and still names the base-model half of every large language model.

Its limits, though, drew the map for what came next. GPT-1 still needed a
fine-tuning run and labeled examples for every task, so it never became a general
interface — the very thing later models chase. It was small by the standards that
arrived within a year. And its strictly left-to-right objective, ideal for
generation, is a genuine handicap on classification and span extraction, where a
word ought to see its whole neighborhood. That weakness was an open invitation,
and BERT accepted it within months.

## Lineage

- **Builds on:** [Attention Is All You Need](/courses/llm-canon/attention-is-all-you-need) — the Transformer decoder stack, stripped of its encoder and cross-attention.
- **Leads to:** [GPT-2](/courses/llm-canon/gpt-2), which asks whether the fine-tuning stage can be dropped entirely, and [BERT](/courses/llm-canon/bert), which argues the pretraining stage should be bidirectional.
