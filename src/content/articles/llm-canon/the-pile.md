---
course: llm-canon
lectureId: "2020"
title: "Eight Hundred Gigabytes, Chosen on Purpose"
deck: "The Pile (2020) — EleutherAI's openly documented 825-gibibyte corpus that argued the composition of training data, not merely its volume, is a design lever as powerful as parameter count."
order: 7
readingTime: 11
tags: ["pretraining", "datasets", "open-source", "data-curation", "eleutherai"]
concepts:
  - id: data-mixture-weighting
    term: Data Mixture Weighting
    definition: "Assigning each source a sampling weight so some corpora are seen more often than others during training, making the proportions of the data an explicit, tunable design choice."
  - id: source-diversity
    term: Source Diversity
    definition: "The principle that spanning many distinct domains — academic, code, books, dialogue, formal text — improves generalization more than piling up undifferentiated web text of the same size."
  - id: effective-epochs
    term: Effective Epochs
    definition: "How many times a source is effectively repeated in one training pass, set by its mixture weight relative to its raw size; high-quality sources are deliberately epoched more than once."
  - id: corpus-documentation
    term: Corpus Documentation
    definition: "Publishing per-source provenance, licensing, size, and bias analysis alongside the data, so the corpus itself becomes an auditable research artifact rather than an opaque table."
  - id: open-pretraining-corpus
    term: Open Pretraining Corpus
    definition: "A large, freely available training set with a controlled, documented composition, letting independent researchers reproduce models and study what data produces what capability."
---

In 2020 the recipe for a large language model was becoming an open secret in
every respect but one. The architecture could be sketched on a napkin; the
training objective fit in a sentence. What no one outside a few labs could see
was the data. GPT-3 arrived with its corpus described in a small table and then
locked away, and the rest of the field made do with undifferentiated dumps of
web text. A loose collective of independent researchers called EleutherAI
decided that the corpus was the actual research object — the part worth building
in the open — and produced one. The Pile ran to 825 gibibytes, but its lasting
argument had nothing to do with heft. It was that what a model reads, and in what
proportion, is a decision as consequential as how many parameters it carries.

## The Data Was the Secret

A model is a lossy compression of its training set, yet the training set was the
one ingredient the leading labs would not share. GPT-3's paper named its sources
and even hinted at their sampling rates, but released none of the text, which
made faithful reproduction impossible and turned every question about behavior
into a guess. If you cannot see the data, you cannot ask which part of it taught
a model to write code, or reason about law, or answer a medical question — and
you certainly cannot rerun the experiment. Everyone not sitting on a private
corpus defaulted to raw Common Crawl, the web scraped and lightly filtered, on
the unspoken theory that more bytes were always better.

## Twenty-Two Sources, Chosen on Purpose

The Pile rejected that theory. Instead of maximizing raw size, its builders
assembled twenty-two sub-datasets picked to cover distinct territories of written
language. There was academic and technical writing (PubMed Central, arXiv, the
patent office, FreeLaw, philosophy papers), source code and its surrounding talk
(GitHub, Stack Exchange), long-form books (Books3, Project Gutenberg,
BookCorpus2), curated web text a cut above bulk crawl (Pile-CC, OpenWebText2),
unscripted dialogue (film subtitles, Ubuntu IRC logs, HackerNews, the Enron email
trove), and formal or structured material (DeepMind's mathematics problems, the
EuroParl parliamentary record, Wikipedia). The point of the list was breadth:
each source contributes a register the others lack.

## Weighting as a Design Knob

Diversity alone was only half the idea. The other half was that the proportions
were tunable, and the builders tuned them. Rather than sample every source in
proportion to its raw byte count — which would have let bulk web text drown out
the curated material — they assigned each source a mixture weight and let the
high-quality corpora be seen more than once.

<figure>
<svg viewBox="0 0 860 300" role="img" aria-label="Twenty-two documented sources across six domains flow into a single weighted corpus; higher-quality sources are given larger sampling weights, drawn as thicker arrows, and the resulting 825-gibibyte mixture trains models that generalize better than same-size web scrapes.">
  <defs>
    <marker id="arw-the-pile" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" class="dgm-fill"/>
    </marker>
  </defs>
  <rect x="14" y="24" width="150" height="32" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="89" y="39" text-anchor="middle" font-size="12" font-weight="700">Academic</text>
  <text x="89" y="52" text-anchor="middle" font-size="9.5" class="dgm-muted">arXiv · PubMed · Law</text>
  <rect x="14" y="66" width="150" height="32" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="89" y="81" text-anchor="middle" font-size="12" font-weight="700">Code</text>
  <text x="89" y="94" text-anchor="middle" font-size="9.5" class="dgm-muted">GitHub · Stack Exchange</text>
  <rect x="14" y="108" width="150" height="32" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="89" y="123" text-anchor="middle" font-size="12" font-weight="700">Books</text>
  <text x="89" y="136" text-anchor="middle" font-size="9.5" class="dgm-muted">Books3 · Gutenberg</text>
  <rect x="14" y="150" width="150" height="32" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="89" y="165" text-anchor="middle" font-size="12" font-weight="700">Curated web</text>
  <text x="89" y="178" text-anchor="middle" font-size="9.5" class="dgm-muted">Pile-CC · OpenWebText2</text>
  <rect x="14" y="192" width="150" height="32" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="89" y="207" text-anchor="middle" font-size="12" font-weight="700">Dialogue</text>
  <text x="89" y="220" text-anchor="middle" font-size="9.5" class="dgm-muted">Subtitles · IRC · email</text>
  <rect x="14" y="234" width="150" height="32" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="89" y="249" text-anchor="middle" font-size="12" font-weight="700">Formal</text>
  <text x="89" y="262" text-anchor="middle" font-size="9.5" class="dgm-muted">Math · Wiki · EuroParl</text>
  <line x1="164" y1="40" x2="366" y2="112" stroke="currentColor" stroke-width="3" marker-end="url(#arw-the-pile)"/>
  <line x1="164" y1="82" x2="366" y2="128" stroke="currentColor" stroke-width="2.3" marker-end="url(#arw-the-pile)"/>
  <line x1="164" y1="124" x2="366" y2="144" stroke="currentColor" stroke-width="2.3" marker-end="url(#arw-the-pile)"/>
  <line x1="164" y1="166" x2="366" y2="158" stroke="currentColor" stroke-width="1.2" marker-end="url(#arw-the-pile)"/>
  <line x1="164" y1="208" x2="366" y2="174" stroke="currentColor" stroke-width="1.2" marker-end="url(#arw-the-pile)"/>
  <line x1="164" y1="250" x2="366" y2="190" stroke="currentColor" stroke-width="3" marker-end="url(#arw-the-pile)"/>
  <g class="dgm-accent">
    <rect x="372" y="92" width="196" height="116" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <text x="470" y="120" text-anchor="middle" font-size="13" font-weight="700">Weighted mixture</text>
    <text x="470" y="142" text-anchor="middle" font-size="10.5" class="dgm-muted">22 sources · 825 GiB</text>
    <text x="470" y="165" text-anchor="middle" font-size="11">rate &#8733; weight &#215; size</text>
    <text x="470" y="187" text-anchor="middle" font-size="9.5" class="dgm-muted">quality sources epoched more than once</text>
  </g>
  <line x1="568" y1="150" x2="624" y2="150" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-the-pile)"/>
  <rect x="628" y="118" width="210" height="64" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="733" y="145" text-anchor="middle" font-size="12.5" font-weight="700">Better generalization</text>
  <text x="733" y="165" text-anchor="middle" font-size="10.5" class="dgm-muted">at matched compute</text>
  <text x="89" y="288" text-anchor="middle" font-size="9.5" class="dgm-muted">arrow thickness = sampling weight</text>
</svg>
<figcaption><b>A curated mixture.</b> Twenty-two documented sources across six domains are sampled with deliberate weights — the trusted ones more than once — into a single 825-GiB corpus that generalizes better than a same-size web scrape.</figcaption>
</figure>

Concretely, if a training pass consumes $T$ tokens and source $i$ has weight
$w_i$ and size $\lvert D_i\rvert$, the number of times that source is effectively
repeated — its **effective epochs** — is

$$
e_i \;=\; \frac{w_i \, T}{\lvert D_i\rvert}.
$$

A small, trustworthy source like Wikipedia might be epoched two or three times
while the sprawling web component is seen less than once. Publishing those
weights, not merely the file list, is what turned the mixture into a
reproducible object.

## Documentation as a Deliverable

The Pile also shipped something the field had mostly treated as optional: a data
sheet. Every source came with its provenance, its license, its size, and an
explicit written analysis of the demographic and topical biases it introduced.
Treating **corpus documentation** as a first-class deliverable rather than an
afterthought was unusual in 2020, and it quietly became a norm — the expectation
that a serious corpus arrives with its own audit trail.

## Did the Recipe Work

It did, in the way that matters. Models trained on the Pile outperformed
equivalents trained on Common-Crawl-only or raw web data at matched compute —
including on domains not obviously present in the extra sources, a sign that
**source diversity** was acting less like memorized coverage and more like a
regularizer that sharpens general ability. Composition, the results said, is a
lever comparable to scale.

## Why It Matters

For years the Pile was simply the **open pretraining corpus**. GPT-Neo, GPT-J,
GPT-NeoX, Pythia, and a long tail of research models were trained on it, and it
remains the substrate for a large fraction of the "what does data do to a model"
literature, because it is one of the few large corpora whose composition is
controlled and written down. It made independent large-model research possible at
all, and it established mixture design as a discipline rather than a footnote.

Its limits are now part of its story. The Books3 component turned out to contain
pirated books and was removed under legal pressure in 2023, which invalidated the
original distribution and clouded the provenance of every model trained on the
earlier version — a cautionary tale about building public infrastructure on
unvetted text. The corpus is English-dominant, and at 825 gibibytes it is now
small: frontier runs are measured in tens of trillions of tokens. But the
practice it introduced — declare your sources, publish your weights, document
your biases — outlived the specific bytes.

## Lineage

- **Builds on:** [GPT-3](/courses/llm-canon/gpt-3), whose described-but-unreleased corpus left the gap the Pile set out to fill.
- **Leads to:** [BLOOM](/courses/llm-canon/bloom), which carried the documentation-and-governance norm into a multilingual corpus, and [LLaMA](/courses/llm-canon/llama), whose public-data-only pretraining inherited its philosophy.
