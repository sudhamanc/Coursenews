---
course: llm-canon
lectureId: "2019"
title: "When the Prompt Became the Program"
deck: "Language Models are Unsupervised Multitask Learners (2019) — the 1.5-billion-parameter model that did tasks it was never trained on, purely from how the prompt was phrased, and made scale the field's new frontier."
order: 4
readingTime: 11
tags: ["pretraining", "zero-shot", "prompting", "scale", "language-model"]
concepts:
  - id: zero-shot-transfer
    term: Zero-Shot Task Transfer
    definition: "Performing a task with no task-specific training and no worked examples, relying only on how the request is phrased in the input text."
  - id: lm-as-multitask
    term: Language Modeling as Multitask Learning
    definition: "The view that a language model trained on sufficiently varied text implicitly learns to perform any task demonstrated in that text — modeling p(output | input, task) rather than a single task."
  - id: webtext
    term: WebText
    definition: "GPT-2's training corpus, built by scraping outbound links from Reddit posts with at least three karma as a cheap proxy for human-judged quality."
  - id: byte-level-bpe
    term: Byte-Level BPE
    definition: "Byte-pair encoding applied over raw bytes, so the vocabulary can represent any string with no unknown tokens and no lossy preprocessing."
  - id: pre-norm
    term: Pre-Norm Transformer
    definition: "Placing layer normalization at the input of each sublayer rather than after it, a change that stabilizes the training of deep Transformers."
  - id: prompting
    term: Prompting
    definition: "Specifying a task by writing it into the model's input as text — cues like 'TL;DR:' or example pairs — instead of fine-tuning. The practice is born here."
---

GPT-1 and BERT agreed on one thing GPT-2 set out to deny: that after
pretraining, you still had to fine-tune. Both models needed a labeled dataset and
a gradient-descent run for every new task, and that per-task step capped how
general a language model could become. The hypothesis behind GPT-2 was almost
philosophical. If a model reads enough varied text, it will inevitably meet every
task demonstrated somewhere in natural language — translations printed beside
their originals, questions trailed by answers, articles followed by their
summaries. A model that has truly learned to predict such text must, in passing,
have learned to perform the tasks inside it. If so, fine-tuning is not a necessity
but a crutch. In 2019 OpenAI scaled its decoder to 1.5 billion parameters, fed it
a cleaner slice of the web, and found the crutch could be kicked away.

## The Fine-Tuning Bottleneck

Ordinary supervised learning fits a separate model of $p(\text{output} \mid
\text{input})$ for each task, one narrow specialist at a time. GPT-2 reframes the
whole enterprise as a single system that models

$$
p(\text{output} \mid \text{input}, \text{task})
$$

where the task is not a separate output head but part of the conditioning text
itself. Under this view, **language modeling is multitask learning** in disguise:
a model that predicts arbitrary text well enough has, of necessity, learned to
condition on an implied task. The trick is to make that latent competence
surface.

## A Cleaner Diet

Getting there took better data. Rather than train on undifferentiated Common
Crawl, the team built **WebText** by scraping the outbound links from Reddit posts
with at least three karma — a cheap, crowd-sourced filter for pages a human found
worth sharing. The result was about eight million documents and forty gigabytes of
text, with Wikipedia deliberately excluded so it could not contaminate downstream
evaluation. Tokenization moved to **byte-level BPE**, which operates over raw
bytes so the vocabulary can encode any string at all — no unknown tokens, no lossy
normalization, no preprocessing that quietly discards information.

## Small Engineering, Large Consequences

The architecture barely changed, but the tweaks mattered. Layer normalization
moved to the input of each sublayer — the **pre-norm** arrangement that stabilizes
very deep stacks — with an extra normalization after the final block. Residual
weights were scaled at initialization by $1/\sqrt{N}$ for $N$ layers, the context
window doubled to 1024 tokens, and four sizes were trained, topping out at the
headline 1.5 billion parameters. None of this is exotic; all of it is the quiet
plumbing that lets scale pay off.

## Tasks Without Training

The payoff shows up in **zero-shot task transfer**. Pose a task as plain text and
let the model continue it. Append `TL;DR:` after an article and the continuation
is a summary. Supply a few example pairs and the model translates. No gradients
are computed, no weights touched — the task is selected entirely by how the input
is phrased.

<figure>
<svg viewBox="0 0 820 240" role="img" aria-label="GPT-2 zero-shot prompting: a document followed by a short cue such as TL;DR is fed as plain text to a frozen language model, which produces a summary as its next-token continuation with no fine-tuning.">
  <defs>
    <marker id="arw-gpt2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" class="dgm-fill"/>
    </marker>
  </defs>
  <rect x="20" y="44" width="320" height="150" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="180" y="64" text-anchor="middle" font-size="12" font-weight="700">Prompt · text only</text>
  <rect x="36" y="78" width="288" height="40" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="180" y="103" text-anchor="middle" font-size="11">Long article text …</text>
  <g class="dgm-accent">
    <rect x="36" y="128" width="150" height="36" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <text x="111" y="151" text-anchor="middle" font-size="12.5" font-weight="700">TL;DR:</text>
  </g>
  <text x="266" y="150" text-anchor="middle" font-size="10" class="dgm-muted">task = summarize</text>
  <line x1="340" y1="120" x2="388" y2="120" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-gpt2)"/>
  <rect x="392" y="84" width="200" height="72" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="492" y="116" text-anchor="middle" font-size="13" font-weight="700">Language model</text>
  <text x="492" y="136" text-anchor="middle" font-size="10.5" class="dgm-muted">1.5B params · frozen</text>
  <line x1="592" y1="120" x2="640" y2="120" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-gpt2)"/>
  <rect x="644" y="84" width="158" height="72" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="723" y="116" text-anchor="middle" font-size="12.5" font-weight="700">Summary</text>
  <text x="723" y="136" text-anchor="middle" font-size="10.5" class="dgm-muted">as continuation</text>
  <text x="492" y="180" text-anchor="middle" font-size="10.5" class="dgm-muted">no fine-tuning · no gradients</text>
</svg>
<figcaption><b>The prompt selects the task.</b> A document plus a bare cue such as TL;DR: is read as ordinary text by a frozen model, which answers by simply continuing it — no task-specific training involved.</figcaption>
</figure>

Zero-shot, GPT-2 set state of the art on seven of eight language-modeling
datasets, some by wide margins. More consequential than any single score was the
trend: performance rose log-linearly with model size across every task tested —
the empirical seed that the scaling-laws paper would soon formalize. And the
largest model was still underfitting WebText, a broad hint that more scale would
buy more capability. The release itself made history for a different reason:
OpenAI initially withheld the full model over misuse concerns, opening the modern
debate about staged release and capability risk.

## Why It Matters

This is where **prompting** is born and where the field's attention pivots from
architecture to scale. The idea that you program a model by describing your task
in its input — rather than by collecting labels and running fine-tuning — is the
conceptual hinge on which everything after it turns. GPT-2 made the case that a
single general model, steered by text, could stand in for a menagerie of
specialists.

Its limits were honest and pointed. Zero-shot numbers, striking as they were,
still trailed dedicated supervised systems on most tasks; the model was a
generalist, not yet a champion. And "just scale it" was the right instinct
without being an answer — the paper could not say how far the trend would hold, or
how to spend a fixed budget between parameters and data. That precise gap is what
Kaplan and colleagues set out to close next.

## Lineage

- **Builds on:** [GPT-1](/courses/llm-canon/gpt-1) — the same recipe, unchanged in principle, pushed on scale and data quality.
- **Leads to:** [Scaling Laws](/courses/llm-canon/scaling-laws), which turns the log-linear trend into a formula, and [GPT-3](/courses/llm-canon/gpt-3), which drives it two orders of magnitude further.
