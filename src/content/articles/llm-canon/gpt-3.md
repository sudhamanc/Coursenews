---
course: llm-canon
lectureId: "2020"
title: "Show, Don't Train"
deck: "Language Models are Few-Shot Learners (2020) — at 175 billion parameters, GPT-3 learned new tasks from a handful of prompt examples with no weight updates, and turned prompting into an industry."
order: 6
readingTime: 11
tags: ["scaling", "in-context-learning", "few-shot", "prompting", "emergence"]
concepts:
  - id: in-context-learning
    term: In-Context Learning
    definition: "A model's ability to perform a task by conditioning on examples placed in its prompt, with no weight updates — the 'learning' happens during the forward pass."
  - id: few-shot-prompting
    term: Few-Shot Prompting
    definition: "Supplying a handful of input-output demonstrations — as opposed to one or none — in the prompt so the model infers the task at inference time."
  - id: emergent-capability
    term: Emergent Capability
    definition: "A skill that appears only past a certain scale and is largely absent in smaller models; in-context learning is the paper's central example."
  - id: forward-pass-meta-learning
    term: Meta-Learning in the Forward Pass
    definition: "The interpretation of in-context learning as the model adapting to a task within a single forward pass, rather than through gradient descent."
  - id: benchmark-contamination
    term: Benchmark Contamination
    definition: "Overlap between training data and evaluation sets that inflates reported scores; GPT-3 ran an explicit contamination study and disclosed that a bug left the removal incomplete."
---

Fine-tuning had a cost that scale alone could not pay down: every new task still
demanded thousands of labeled examples and produced a model good at exactly one
thing. Humans do not work that way. Show a person two or three examples of a
pattern, add a sentence of instruction, and they generalize. In 2020 OpenAI asked
whether scale by itself could buy that ability, and built a 175-billion-parameter
model to find out. The answer, reported in *Language Models are Few-Shot
Learners*, was startling: GPT-3 could perform a new task from a handful of
examples placed directly in its prompt, with not a single weight updated. The
demonstrations were not training data. They were context — read once, in the same
forward pass that produced the answer.

## The Generalization Gap

The bottleneck GPT-2 had exposed was still standing. Zero-shot prompting worked,
but it lagged supervised systems, and closing that gap seemed to mean going back
to per-task fine-tuning with all its labeled-data appetite. The wager of GPT-3 was
that the gap was not a wall but a slope — that with enough scale, a model would
learn to pick up a task from the examples in front of it, the way a person skims a
few solved problems before attempting the next.

## Learning in the Prompt

The capability that emerged is **in-context learning**, and it comes in three
settings that differ only in how much the prompt shows. Zero-shot gives an
instruction alone; one-shot adds a single worked example; **few-shot prompting**
packs in as many demonstrations as the context window holds, typically ten to a
hundred. In every case the model computes

$$
p\big(y \mid x_1, y_1, \ldots, x_k, y_k,\, x_{\text{query}}\big)
$$

conditioning on the $k$ demonstrations and the query with no gradient step
anywhere. This is why some describe it as **meta-learning in the forward pass**:
the adaptation that fine-tuning would normally accomplish with backpropagation is
instead performed, transiently, inside a single evaluation of the network.

<figure>
<svg viewBox="0 0 820 300" role="img" aria-label="GPT-3 few-shot in-context learning: a single prompt holds a task line and several input-output demonstration pairs followed by a query, read in one forward pass by a frozen 175-billion-parameter model that outputs the answer with no weight updates.">
  <defs>
    <marker id="arw-gpt3" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" class="dgm-fill"/>
    </marker>
  </defs>
  <rect x="20" y="30" width="430" height="248" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="235" y="52" text-anchor="middle" font-size="12" font-weight="700">Prompt — one forward pass</text>
  <rect x="38" y="64" width="394" height="30" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="235" y="84" text-anchor="middle" font-size="11">Task: translate  EN → FR</text>
  <rect x="38" y="100" width="394" height="30" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="235" y="120" text-anchor="middle" font-size="11">sea otter → loutre de mer</text>
  <rect x="38" y="136" width="394" height="30" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="235" y="156" text-anchor="middle" font-size="11">cheese → fromage</text>
  <text x="235" y="186" text-anchor="middle" font-size="16">⋮</text>
  <g class="dgm-accent">
    <rect x="38" y="196" width="394" height="34" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <text x="235" y="218" text-anchor="middle" font-size="12" font-weight="700">plush giraffe → ?</text>
  </g>
  <text x="235" y="256" text-anchor="middle" font-size="10.5" class="dgm-muted">k demonstrations, in context</text>
  <line x1="450" y1="154" x2="496" y2="154" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-gpt3)"/>
  <rect x="500" y="118" width="150" height="72" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="575" y="150" text-anchor="middle" font-size="13.5" font-weight="700">GPT-3</text>
  <text x="575" y="170" text-anchor="middle" font-size="10.5" class="dgm-muted">175B · frozen</text>
  <line x1="650" y1="154" x2="696" y2="154" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-gpt3)"/>
  <rect x="700" y="118" width="104" height="72" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="752" y="148" text-anchor="middle" font-size="12">girafe</text>
  <text x="752" y="166" text-anchor="middle" font-size="12">en peluche</text>
  <text x="575" y="212" text-anchor="middle" font-size="10.5" class="dgm-muted">no weight updates</text>
</svg>
<figcaption><b>Learning that happens in the prompt.</b> A task line and several demonstrations precede the query; the frozen model reads them all in one pass and answers, with no gradient step anywhere.</figcaption>
</figure>

## The Machinery of Scale

Reaching that behavior took brute size. GPT-3 is 175 billion parameters — 96
layers, a model dimension of 12,288, and 96 attention heads of 128 dimensions
each, over a 2,048-token context. To keep such long sequences affordable, it
alternates dense and locally banded sparse attention layers, a trick borrowed from
the Sparse Transformer. Its roughly 300 billion training tokens were drawn from
filtered Common Crawl, WebText2, two book corpora, and Wikipedia, with the
higher-quality sources deliberately oversampled rather than sampled in proportion
to their raw size. Eight models from 125 million to 175 billion parameters were
trained together, so the scaling behavior could be charted cleanly rather than
inferred.

## An Emergent Skill

The most important curve in the paper is not that performance rose with scale, but
that few-shot performance rose *faster* than zero-shot. The gap between showing
the model examples and merely instructing it widened as the model grew — which
means in-context learning is itself an **emergent capability**, something the
smallest models essentially lack and the largest suddenly possess. The
consequences were vivid: human raters could barely distinguish GPT-3's synthetic
news articles from genuine ones. The authors also did something that would become
too rare afterward — they ran an explicit study of **benchmark contamination**,
train-test overlap that can inflate scores, and reported candidly that a bug had
prevented its complete removal.

## Why It Matters

GPT-3 is the commercial inflection point of the whole story. The hosted API,
prompting as a professional discipline, and the entire application layer that grew
on top of it all date from this model. The abstraction it sold — describe your
task, show a few examples, get a result — is the one the industry still runs on.
It proved that scale purchases not just lower loss but qualitatively new behavior,
and that a single frozen model, steered by its prompt, could stand in for an
unbounded set of specialists.

Its limits, though, are precisely the agenda for what follows. By Chinchilla's
later accounting it was undertrained by roughly a factor of ten, a direct
inheritance of the scaling-laws error. It was weak on natural-language inference
and word-in-context tasks. And, decisively, it did not follow instructions: it
continued text rather than answering, which is exactly the gap InstructGPT was
built to close. Bias, toxicity, and hallucination are all documented in the paper
without solutions, and the model is not open in any sense — an absence that The
Pile, OPT, and BLOOM would race to fill.

## Lineage

- **Builds on:** [GPT-2](/courses/llm-canon/gpt-2)'s zero-shot findings and [Scaling Laws](/courses/llm-canon/scaling-laws)' compute-optimal allocation — error and all.
- **Leads to:** [The Pile](/courses/llm-canon/the-pile) and [OPT](/courses/llm-canon/opt) (open replication of the data and the model), [PaLM](/courses/llm-canon/palm) (scaling further), [InstructGPT](/courses/llm-canon/instructgpt-rlhf) (making it usable), and [Chain-of-Thought](/courses/llm-canon/chain-of-thought) (a prompting technique only this scale unlocks).
