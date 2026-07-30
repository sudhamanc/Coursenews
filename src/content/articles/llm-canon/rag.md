---
course: llm-canon
lectureId: "2020"
title: "The Open-Book Language Model"
deck: "Retrieval-Augmented Generation (2020) — the paper that gave a generator a searchable second memory, so its answers could be grounded in documents it could cite, correct, and swap out without ever retraining."
order: 32
readingTime: 11
tags: ["inference-compute", "retrieval", "rag", "grounding", "open-domain-qa"]
concepts:
  - id: parametric-nonparametric
    term: Parametric vs Non-Parametric Memory
    definition: "The split at the heart of RAG: knowledge baked into a model's weights (parametric) versus knowledge held in an external, searchable store of documents (non-parametric) that can be edited without retraining."
  - id: dense-retrieval
    term: Dense Passage Retrieval
    definition: "Encoding a query and candidate passages into vectors with separate BERT encoders and matching them by maximum inner-product search, so retrieval turns on meaning rather than keyword overlap."
  - id: rag-sequence-token
    term: RAG-Sequence vs RAG-Token
    definition: "Two ways to condition on retrieved documents — commit to one passage for the whole output, or let a different passage dominate at each generated token and marginalize per token."
  - id: marginalization
    term: Marginalization over Documents
    definition: "Treating the retrieved passage as a latent variable and summing the generator's output probability over the top-k passages, weighted by their retrieval scores, so no single document has to be labeled correct."
  - id: index-hot-swap
    term: Index Hot-Swapping
    definition: "Updating what a model knows by replacing the document index — with no gradient steps — so the same weights can answer from a newer or different corpus."
  - id: grounding
    term: Grounding and Attribution
    definition: "Anchoring a generated answer in specific retrieved passages, so claims can be traced to a source instead of emerging opaquely from the weights."
---

A trained language model keeps everything it knows in one place: its weights.
The arrangement is compact and almost impossible to audit. Knowledge stored this
way cannot be updated without retraining, cannot be traced to a source, and —
worst of all — cannot be told apart from knowledge the model does not actually
have. Ask about something outside its training and it answers anyway, fluently
and wrongly. In 2020 a team from Facebook AI Research, University College London,
and NYU proposed a structural remedy rather than a bigger model: give the network
a second memory it can look things up in. They called the design
**Retrieval-Augmented Generation**, and it became the template for nearly every
serious enterprise deployment of a language model since.

## Two Kinds of Memory

The core move is to split memory in two. The **parametric** memory is an ordinary
pretrained sequence-to-sequence model — the paper uses BART — holding the fluent,
general knowledge learned during pretraining. The **non-parametric** memory is an
external index: all of Wikipedia, chopped into roughly twenty-one million
hundred-word passages, each encoded as a vector and stored for fast search with
FAISS. The generator no longer has to remember every fact; it only has to know how
to *use* the facts a retriever hands it. Knowledge and the ability to reason over
knowledge become separable resources.

## Retrieval by Meaning, Not Keywords

The bridge between the two memories is **Dense Passage Retrieval**. Two separate
BERT encoders turn text into vectors — one for the incoming query, one for the
document passages — and a passage is relevant when its vector has a large inner
product with the query's. Because the match happens in a learned semantic space,
a question about "the capital of France" can retrieve a passage that never uses
the word *capital*. Retrieval reduces to maximum inner-product search over the
index, and the system keeps the top few passages, typically five to ten.

Those passages are then fed to the generator alongside the original prompt, and
the generator writes its answer conditioned on both. The whole path — query in,
grounded answer out — runs in a single forward sweep at inference time.

<figure>
<svg viewBox="0 0 860 250" role="img" aria-label="Retrieval-augmented generation pipeline: a query drives a dense retriever that searches a document index and returns the top-k passages, which are concatenated with the original prompt and fed to a generator that produces a grounded answer.">
  <defs>
    <marker id="arw-rag" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" class="dgm-fill"/>
    </marker>
  </defs>
  <rect x="12" y="96" width="94" height="48" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="59" y="124" text-anchor="middle" font-size="13" font-weight="700">Query</text>
  <line x1="106" y1="120" x2="150" y2="120" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-rag)"/>
  <rect x="152" y="94" width="136" height="52" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="220" y="116" text-anchor="middle" font-size="13" font-weight="700">Retriever</text>
  <text x="220" y="134" text-anchor="middle" font-size="10.5" class="dgm-muted">dense bi-encoder</text>
  <line x1="206" y1="146" x2="206" y2="180" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-rag)"/>
  <line x1="234" y1="180" x2="234" y2="146" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-rag)"/>
  <rect x="150" y="182" width="140" height="50" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="220" y="203" text-anchor="middle" font-size="12" font-weight="700">Document index</text>
  <text x="220" y="221" text-anchor="middle" font-size="10.5" class="dgm-muted">21M passages · FAISS</text>
  <line x1="288" y1="120" x2="332" y2="120" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-rag)"/>
  <g class="dgm-accent">
    <rect x="334" y="94" width="150" height="52" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <text x="409" y="116" text-anchor="middle" font-size="12.5" font-weight="700">Top-k passages</text>
    <text x="409" y="134" text-anchor="middle" font-size="10.5">retrieved context</text>
  </g>
  <line x1="484" y1="120" x2="528" y2="120" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-rag)"/>
  <rect x="530" y="88" width="140" height="64" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="600" y="114" text-anchor="middle" font-size="13" font-weight="700">Generator</text>
  <text x="600" y="132" text-anchor="middle" font-size="10.5" class="dgm-muted">BART seq2seq</text>
  <line x1="670" y1="120" x2="712" y2="120" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-rag)"/>
  <rect x="714" y="94" width="134" height="52" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="781" y="115" text-anchor="middle" font-size="12" font-weight="700">Grounded answer</text>
  <text x="781" y="133" text-anchor="middle" font-size="10.5" class="dgm-muted">with citation</text>
  <path d="M59 96 L59 52 L600 52 L600 88" fill="none" stroke="currentColor" stroke-width="1.3" stroke-dasharray="4 3" marker-end="url(#arw-rag)"/>
  <text x="330" y="44" text-anchor="middle" font-size="10.5" class="dgm-muted">original prompt</text>
</svg>
<figcaption><b>The RAG pipeline.</b> A query drives a dense retriever over a document index; the top-k passages are concatenated with the original prompt and passed to the generator, which writes an answer grounded in what it retrieved.</figcaption>
</figure>

## One Document, or Many

The paper offers two ways to fold the retrieved passages into generation, and the
distinction still matters. **RAG-Sequence** commits to a single retrieved document
for the entire output, then marginalizes across documents at the level of the
whole sequence. **RAG-Token** is more flexible: it lets a different document
dominate at each generated token, marginalizing per token, which helps when an
answer stitches together facts from several sources. In both cases the retrieved
passage is treated as a latent variable and summed away:

$$
p(y \mid x) \;\approx\; \sum_{z \,\in\, \text{top-}k(x)} p_\eta(z \mid x)\; p_\theta(y \mid x, z)
$$

where $p_\eta$ is the retriever's score for passage $z$ and $p_\theta$ is the
generator's likelihood of the answer given that passage. RAG-Token simply moves
the sum inside the per-token product, so the choice of source can change word by
word.

## Training Without an Answer Key

The elegant part is the supervision. The query encoder and the generator are
fine-tuned **jointly**, using only the retrieval-marginalized generation loss — no
human ever labels which passage was the "right" one. The model learns which
documents help by whether conditioning on them makes the correct answer more
likely. The document encoder and its index are left frozen, a pragmatic
concession: re-encoding twenty-one million passages every few gradient steps would
be infeasible. And because the index is external, swapping it replaces the model's
knowledge outright — **index hot-swapping** — which the authors demonstrated by
switching between Wikipedia snapshots from different dates and watching the
answers update, with not a single weight touched.

## Why It Matters

RAG is now the dominant way organizations put private, current, or regulated
knowledge into a model's mouth without training it — the architecture behind
countless internal assistants and search products. It reframed factuality as an
engineering problem you can attack with a better index rather than a bigger model,
and it made **grounding and attribution** first-class: an answer can point at the
passage it came from. Worth noting is that the paper describes *jointly training*
retriever and generator, whereas what the industry now calls "RAG" is usually the
much simpler retrieve-then-prompt pattern around a frozen model — a descendant of
this work rather than the thing itself.

Its limits set up what comes next. Retrieval quality caps everything downstream: a
wrong passage yields a confident wrong answer, now dressed in a citation. The
frozen document encoder cannot adapt, fixed $k$ and fixed chunk sizes are blunt,
and single-shot retrieval cannot handle multi-hop questions where the second
search depends on what the first one found. Making retrieval an explicit,
repeatable decision inside the reasoning loop — rather than a one-time
preprocessing step — is exactly the gap the next paper closes.

## Lineage

- **Builds on:** [Attention Is All You Need](/courses/llm-canon/attention-is-all-you-need) for the seq2seq generator, and [BERT](/courses/llm-canon/bert) for the dense query and passage encoders that make semantic retrieval possible.
- **Leads to:** [ReAct](/courses/llm-canon/react), which turns retrieval from a fixed preprocessing step into an action the model chooses to take inside a reasoning loop.
