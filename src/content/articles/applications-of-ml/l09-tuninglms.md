---
course: applications-of-ml
lectureId: L09
title: "Bending Giants: The Many Ways to Make a Language Model Your Own"
deck: "From swapping a single layer to whispering examples into a prompt, the spectrum of techniques that turn one pretrained colossus into a thousand specialists."
order: 8
date: 2026-02-09
readingTime: 11
tags: ["fine-tuning", "transfer-learning", "lora", "prompting", "llms"]
concepts:
  - id: transfer-learning
    term: Transfer Learning
    definition: "Reusing the representations a model learned on one task as the starting point for another, rather than training from scratch — typically by keeping the pretrained body and attaching a new task-specific head."
  - id: feature-extraction
    term: Feature Extraction
    definition: "A transfer-learning strategy that freezes the pretrained network and trains only a newly attached output layer, treating the frozen model as a fixed feature generator."
  - id: fine-tuning
    term: Fine-Tuning
    definition: "Continuing to train some or all of a pretrained model's weights on task data through repeated gradient updates, adapting the whole network rather than only a new head."
  - id: in-context-learning
    term: In-Context Learning
    definition: "Steering a frozen model purely through the prompt — a task description and zero, one, or a few worked examples — with no gradient updates performed at all."
  - id: parameter-efficient-fine-tuning
    term: Parameter-Efficient Fine-Tuning
    definition: "A family of methods, including adapters and LoRA, that adapt a large model by training a tiny set of added or low-rank weights while the original parameters stay frozen."
  - id: instruction-tuning
    term: Instruction Tuning
    definition: "Fine-tuning a model on many tasks phrased as natural-language instructions so it learns to follow directions it has never seen, sharpening its zero-shot behavior."
---

A modern language model arrives at the end of pretraining as a spectacularly
capable generalist and a frustrating amateur at everything specific. It has read
a library's worth of text and absorbed the deep structure of language, yet it has
never seen your legal contracts, your support tickets, or your particular idea of
a helpful answer. The question that organizes this lecture is deceptively simple:
given one enormous pretrained model, how do you make it *yours*? The answer is not
a single technique but a spectrum — running from surgery on the network's weights
to a single example murmured inside a prompt — and choosing the right point on
that spectrum has become one of the most consequential decisions in applied
machine learning.

## Four Paradigms, One Trajectory

The lecture frames roughly twenty-four years of natural-language processing as
four successive paradigms, each shifting where human effort is spent. In the era
of **feature engineering** (before 2013), fully supervised models such as
conditional random fields dominated, and the work was manually specifying how to
extract features from text. **Architecture engineering** (2013–2018) moved effort
into designing neural networks — choosing, say, an LSTM over a CNN for text
classification — while word embeddings did the feature work automatically. Then
came **objective engineering** (2018 onward): pretrain a large model, then
fine-tune it, with careful attention to the training objective, as BERT
exemplified. Finally, **prompt engineering** (2019 onward) flipped the recipe to
*pre-train, prompt, predict*, modeling tasks almost entirely through a frozen
model like GPT-3 and investing effort in prompt design. Across the arc, the
pretrained language model steadily absorbs responsibility — first initializing the
input signal, then extracting high-level features, finally handling prediction
itself.

## Standing on Borrowed Shoulders

**Transfer learning** is the hinge on which the middle two paradigms turn. Rather
than train a network from scratch, you take the representation learned by a model
trained on a different, data-rich task, lop off its final layer, and replace it
with a new head suited to your problem. The intuition is that the lower layers
have already learned broadly useful structure — syntax, semantics, world
regularities — that need not be relearned. What remains is to teach the model the
last mile of your specific task.

### Feature Extraction vs. Fine-Tuning

That last mile can be walked two ways, and the distinction matters. In **feature
extraction**, you *freeze* the pretrained body and train only the new head. The
giant network becomes a fixed function that turns raw text into rich vectors, and
a small classifier learns on top. It is cheap, fast, and resistant to
overfitting on small datasets. **Fine-tuning** is more ambitious: instead of
replacing and freezing, you keep continuing to train the model's own weights
through repeated gradient updates on a large corpus of task examples. A
translation model, for instance, is nudged by example after example — *sea otter
&rArr; loutre de mer*, *peppermint &rArr; menthe poivrée* — each pair producing a
gradient step. Fine-tuning can reach higher accuracy because the whole network
reshapes itself to the task, but it is costly and can overfit when data is
scarce. Feature extraction trades ceiling for safety; fine-tuning trades safety
for ceiling.

<figure>
<svg viewBox="0 0 720 232" role="img" aria-label="Two ways to adapt a pretrained model: feature extraction freezes the body and trains only a new head, while fine-tuning updates the entire network.">
  <defs>
    <marker id="arw-ft" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" class="dgm-fill"/>
    </marker>
  </defs>
  <text x="347" y="32" text-anchor="middle" font-size="14" font-weight="700">Feature extraction</text>
  <rect x="40" y="48" width="64" height="52" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="72" y="78" text-anchor="middle" font-size="12">input</text>
  <rect x="140" y="48" width="250" height="52" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="265" y="72" text-anchor="middle" font-size="13" font-weight="700">Pretrained body</text>
  <text x="265" y="90" text-anchor="middle" font-size="11" class="dgm-muted">frozen — no updates</text>
  <g class="dgm-accent">
    <rect x="430" y="48" width="120" height="52" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <text x="490" y="72" text-anchor="middle" font-size="13" font-weight="700">New head</text>
    <text x="490" y="90" text-anchor="middle" font-size="11">trained</text>
  </g>
  <rect x="590" y="48" width="64" height="52" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="622" y="78" text-anchor="middle" font-size="12">output</text>
  <line x1="104" y1="74" x2="138" y2="74" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-ft)"/>
  <line x1="390" y1="74" x2="428" y2="74" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-ft)"/>
  <line x1="550" y1="74" x2="588" y2="74" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-ft)"/>
  <text x="347" y="146" text-anchor="middle" font-size="14" font-weight="700">Fine-tuning</text>
  <rect x="40" y="162" width="64" height="52" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="72" y="192" text-anchor="middle" font-size="12">input</text>
  <g class="dgm-accent">
    <rect x="140" y="162" width="250" height="52" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <text x="265" y="186" text-anchor="middle" font-size="13" font-weight="700">Pretrained body</text>
    <text x="265" y="204" text-anchor="middle" font-size="11">all weights updated</text>
    <rect x="430" y="162" width="120" height="52" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <text x="490" y="186" text-anchor="middle" font-size="13" font-weight="700">New head</text>
    <text x="490" y="204" text-anchor="middle" font-size="11">trained</text>
  </g>
  <rect x="590" y="162" width="64" height="52" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="622" y="192" text-anchor="middle" font-size="12">output</text>
  <line x1="104" y1="188" x2="138" y2="188" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-ft)"/>
  <line x1="390" y1="188" x2="428" y2="188" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-ft)"/>
  <line x1="550" y1="188" x2="588" y2="188" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-ft)"/>
</svg>
<figcaption><b>Two ways to adapt</b> Feature extraction freezes the pretrained body and trains only a small new head; fine-tuning lets gradients reshape every layer for a higher ceiling at higher cost.</figcaption>
</figure>

## Learning Without Updating a Single Weight

The most radical option performs **no gradient updates at all**. In *shot
learning*, the model is simply *shown* what to do inside its prompt: a task
description followed by a handful of input/output examples, all prepended to the
real query. In **few-shot** prompting the model sees several worked examples; in
**one-shot** it sees exactly one, plus an optional description; in **zero-shot**
it sees only a natural-language description and must generalize cold.

```text
Translate English to French:   <- task description
sea otter => loutre de mer      <- example 1
peppermint => menthe poivrée    <- example 2
cheese =>                        <- the actual query
```

This is **in-context learning**: the model infers the pattern on the fly, its
weights untouched. The lecture's most important empirical note is that this
ability scales — *larger models make dramatically better use of in-context
information*, so the same prompt that baffles a small model can steer a large one
with precision. Prompting is the cheapest adaptation of all, requiring neither
training infrastructure nor labeled corpora, only a well-designed context.

## The Frugal Middle Ground

Between frozen prompting and full fine-tuning lies **parameter-efficient
fine-tuning** (PEFT), which asks: why retrain billions of weights when a tiny
fraction will do? **Adapters** inject small trainable modules into a frozen
network, learning new behavior alongside — not on top of — what is already there.
**Low-Rank Adaptation (LoRA)** sharpens the idea. Rather than update a weight
matrix $W \in \mathbb{R}^{p \times q}$ directly, LoRA freezes it and learns a
low-rank correction, so the effective weight becomes

$$
W' = W + BA, \qquad B \in \mathbb{R}^{p \times r},\; A \in \mathbb{R}^{r \times q},\; r \ll \min(p, q).
$$

The full matrix holds $pq$ parameters; the low-rank update holds only $pr + rq$.
With a rank $r$ of, say, eight, that can be a thousandfold reduction in trainable
weights — cheap enough to fine-tune a massive model on a single GPU and to store a
different tiny adapter for every task while sharing one frozen backbone.

<figure>
<svg viewBox="0 0 720 250" role="img" aria-label="Low-rank adaptation: a frozen weight matrix W runs in parallel with a small trainable low-rank branch B times A, and the two outputs are summed.">
  <defs>
    <marker id="arw-lora" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" class="dgm-fill"/>
    </marker>
  </defs>
  <rect x="24" y="106" width="80" height="46" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="64" y="134" text-anchor="middle" font-size="12">input h</text>
  <rect x="210" y="38" width="170" height="54" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="295" y="62" text-anchor="middle" font-size="15" font-weight="700">W</text>
  <text x="295" y="80" text-anchor="middle" font-size="11" class="dgm-muted">frozen · p × q</text>
  <g class="dgm-accent">
    <rect x="196" y="170" width="80" height="46" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <text x="236" y="192" text-anchor="middle" font-size="13" font-weight="700">A</text>
    <text x="236" y="208" text-anchor="middle" font-size="10">r × q</text>
    <rect x="316" y="170" width="80" height="46" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <text x="356" y="192" text-anchor="middle" font-size="13" font-weight="700">B</text>
    <text x="356" y="208" text-anchor="middle" font-size="10">p × r</text>
  </g>
  <text x="296" y="238" text-anchor="middle" font-size="11" class="dgm-muted">trainable low-rank update · r ≪ p, q</text>
  <circle cx="500" cy="129" r="20" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="500" y="136" text-anchor="middle" font-size="18" font-weight="700">+</text>
  <rect x="576" y="106" width="118" height="46" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="635" y="129" text-anchor="middle" font-size="12" font-weight="700">output h'</text>
  <text x="635" y="145" text-anchor="middle" font-size="10" class="dgm-muted">W' = W + BA</text>
  <line x1="104" y1="120" x2="208" y2="70" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-lora)"/>
  <line x1="104" y1="138" x2="194" y2="188" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-lora)"/>
  <line x1="276" y1="193" x2="314" y2="193" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-lora)"/>
  <line x1="380" y1="70" x2="482" y2="119" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-lora)"/>
  <line x1="396" y1="190" x2="484" y2="140" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-lora)"/>
  <line x1="520" y1="129" x2="574" y2="129" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-lora)"/>
</svg>
<figcaption><b>Low-rank adaptation</b> The frozen weight <em>W</em> keeps its pretrained knowledge while a thin trainable branch <em>BA</em> learns the task; only <em>B</em> and <em>A</em> receive gradients.</figcaption>
</figure>

## Teaching a Model to Take Instructions

One more form of fine-tuning deserves its own name because it changed how we talk
to models. **Instruction tuning** fine-tunes a pretrained model on a broad mixture
of tasks, each *reformatted as a natural-language instruction* paired with its
desired response. The model does not merely learn those tasks; it learns the
meta-skill of *following instructions*, which transfers to instructions it has
never encountered. Instruction tuning is the bridge between the fine-tuning and
prompting paradigms: it uses gradient-based training to make zero-shot prompting
work far better, which is much of why today's assistants respond usefully to a
plain-English request.

## Why It Matters

The through-line of this lecture is that adaptation is a spectrum, not a switch.
At one end, full fine-tuning rewrites the whole network for maximum performance
and maximum cost; at the other, a zero-shot prompt reshapes behavior for the price
of a sentence. In between sit feature extraction, adapters, LoRA, and instruction
tuning, each offering a different trade among accuracy, compute, data hunger, and
the luxury of keeping one shared model. That spectrum is what makes the age of
open pretrained models — the LLaMA lineage and its kin — economically real: a
single frozen giant can be splintered into countless specialists, each conjured
by a small adapter or a clever prompt. Knowing *which* lever to pull, and how
hard, is now the core craft of putting language models to work.
