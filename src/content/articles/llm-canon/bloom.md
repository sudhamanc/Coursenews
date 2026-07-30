---
course: llm-canon
lectureId: "2022"
title: "The Model a Thousand People Built"
deck: "BLOOM (2022) — a 176-billion-parameter multilingual model assembled in the open by a thousand-person volunteer collaboration that treated data governance and licensing as first-class research."
order: 11
readingTime: 11
tags: ["pretraining", "multilingual", "open-science", "governance", "bigscience"]
concepts:
  - id: participatory-governance
    term: Participatory Governance
    definition: "Deciding how a model is built through open, documented working groups on data, modeling, evaluation, and ethics, so the process itself is public and debated rather than settled behind closed doors."
  - id: roots-corpus
    term: The ROOTS Corpus
    definition: "BLOOM's 1.6-terabyte training set spanning 46 natural languages and 13 programming languages, assembled with input from language communities on which sources belong for each language."
  - id: rail-license
    term: RAIL License
    definition: "A Responsible AI License that permits broad use while contractually prohibiting an enumerated list of harmful applications — an attempt at a middle path between fully open and closed release."
  - id: multilingual-pretraining
    term: Multilingual Pretraining
    definition: "Training a single model across many languages at once, deliberately including languages with no prior frontier-scale representation rather than treating English as the default."
  - id: public-compute-training
    term: Public-Compute Training
    definition: "Training a frontier-scale model on publicly funded research infrastructure — here, France's Jean Zay supercomputer — rather than on a corporation's private capital expenditure."
---

Nearly every large language model to that point had been built the same three
ways at once: by a small team behind closed doors, on a corpus assembled by
scraping first and asking questions later, and speaking English far better than
anything else. BLOOM was the deliberate opposite of all three. Across 2021 and
2022, more than a thousand researchers from over seventy countries, under the
banner of the BigScience workshop, built a 176-billion-parameter model in full
public view — and treated the questions of whose data, which languages, and under
what license not as logistics but as the research itself.

## Governance as a First-Class Problem

Where most large models are the product of a single team's private choices, BLOOM
was the product of a year-long open workshop. Public working groups deliberated
over data, modeling, evaluation, and ethics; the decisions and the arguments
behind them were documented as they were made. This **participatory governance**
was not window dressing around the engineering — it was the method, an assertion
that how a frontier model gets built is a research question deserving the same
rigor as the architecture.

## ROOTS: A Corpus Built With Consent

The clearest expression of that philosophy was the training set. **The ROOTS
corpus** runs to 1.6 terabytes across 46 natural languages and 13 programming
languages, and its sources were chosen with input from the communities whose
languages it contains. Deciding which texts are appropriate to include for a given
language, rather than simply taking whatever the web offered, was a deliberate
methodological choice — a corpus built with people, not merely about them.

<figure>
<svg viewBox="0 0 860 300" role="img" aria-label="Four open working groups on data, modeling, evaluation, and ethics feed the multilingual ROOTS corpus of 46 natural and 13 programming languages, which trains the 176-billion-parameter BLOOM model, released under a use-restricting RAIL license.">
  <defs>
    <marker id="arw-bloom" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" class="dgm-fill"/>
    </marker>
  </defs>
  <rect x="14" y="46" width="118" height="34" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="73" y="67" text-anchor="middle" font-size="11.5" font-weight="700">Data</text>
  <rect x="14" y="92" width="118" height="34" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="73" y="113" text-anchor="middle" font-size="11.5" font-weight="700">Modeling</text>
  <rect x="14" y="138" width="118" height="34" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="73" y="159" text-anchor="middle" font-size="11.5" font-weight="700">Evaluation</text>
  <rect x="14" y="184" width="118" height="34" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="73" y="205" text-anchor="middle" font-size="11.5" font-weight="700">Ethics</text>
  <text x="73" y="246" text-anchor="middle" font-size="9.5" class="dgm-muted">open working groups</text>
  <text x="73" y="260" text-anchor="middle" font-size="9.5" class="dgm-muted">1000+ people · 70+ countries</text>
  <line x1="132" y1="63" x2="206" y2="112" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-bloom)"/>
  <line x1="132" y1="109" x2="206" y2="128" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-bloom)"/>
  <line x1="132" y1="155" x2="206" y2="144" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-bloom)"/>
  <line x1="132" y1="201" x2="206" y2="160" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-bloom)"/>
  <g class="dgm-accent">
    <rect x="210" y="84" width="180" height="112" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <text x="300" y="112" text-anchor="middle" font-size="13" font-weight="700">ROOTS corpus</text>
    <text x="300" y="134" text-anchor="middle" font-size="10.5" class="dgm-muted">1.6 TB</text>
    <text x="300" y="156" text-anchor="middle" font-size="11">46 languages + 13 code</text>
    <text x="300" y="178" text-anchor="middle" font-size="10.5" class="dgm-muted">community-sourced</text>
  </g>
  <line x1="390" y1="140" x2="446" y2="140" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-bloom)"/>
  <rect x="450" y="104" width="160" height="72" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="530" y="130" text-anchor="middle" font-size="12.5" font-weight="700">BLOOM · 176B</text>
  <text x="530" y="150" text-anchor="middle" font-size="10.5" class="dgm-muted">ALiBi positions</text>
  <text x="530" y="166" text-anchor="middle" font-size="10.5" class="dgm-muted">embedding LayerNorm</text>
  <line x1="610" y1="140" x2="666" y2="140" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-bloom)"/>
  <rect x="670" y="104" width="176" height="72" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="758" y="130" text-anchor="middle" font-size="12.5" font-weight="700">RAIL license</text>
  <text x="758" y="150" text-anchor="middle" font-size="10.5" class="dgm-muted">open use, minus an</text>
  <text x="758" y="165" text-anchor="middle" font-size="10.5" class="dgm-muted">enumerated list of harms</text>
  <text x="530" y="252" text-anchor="middle" font-size="9.5" class="dgm-muted">trained on the public Jean Zay supercomputer</text>
</svg>
<figcaption><b>Open science, end to end.</b> Public working groups sourced the multilingual ROOTS corpus, which trained the 176-billion-parameter BLOOM, released under a use-restricting RAIL license — every stage documented and debated in the open.</figcaption>
</figure>

## Built to Extrapolate, Built in Public

The model itself was a 176-billion-parameter decoder. Two architectural choices
served stability and length: ALiBi positional embeddings, which bias attention by
distance instead of adding position vectors and so extrapolate more gracefully to
longer sequences, and an extra layer normalization on the embeddings to keep the
run stable at scale. The compute was as pointed a statement as the data: 384 A100
80GB GPUs on France's Jean Zay supercomputer over roughly three and a half months
— **public-compute training**, funded as public research infrastructure rather
than corporate capital.

## A License Between Open and Closed

Release raised a genuine dilemma: fully open weights can be misused, but locking
them away defeats the point of building in public. BLOOM's answer was the **RAIL
license** — Responsible AI License — which grants broad permission to use and
adapt the model while contractually forbidding a named list of harmful
applications. It was an explicit attempt to occupy the middle ground between
unconditional openness and closed release.

## What It Proved

On benchmarks, BLOOM was competitive in the many languages it covered and posted
real gains for languages that had never had frontier-scale representation through
**multilingual pretraining**. But the benchmark scores were secondary. The
durable result was that the entire pipeline — sourcing, training, evaluation,
release — could be reproduced, because all of it had been done in the open.

## Why It Matters

BLOOM is the clearest existence proof that a frontier-scale model can be built as
a public good rather than a private asset. Its vocabulary — participatory data
governance, documented provenance, responsible-use licensing — has become standard
in how policymakers and researchers now discuss how models ought to be made.

The limits are honest ones. At roughly 350 billion tokens for 176 billion
parameters, BLOOM was undertrained by Chinchilla's yardstick, and it trailed the
best contemporaries on English specifically. The RAIL license, for all its intent,
introduced enough legal uncertainty that many organizations simply avoided the
model. And the coordination cost of a thousand-person collaboration was
enormous — the process is admirable precisely because it is so hard to repeat.

## Lineage

- **Builds on:** [GPT-3](/courses/llm-canon/gpt-3) for the underlying recipe, [OPT](/courses/llm-canon/opt) for the open-weights precedent, and [The Pile](/courses/llm-canon/the-pile) for its documentation norms.
- **Leads to:** [LLaMA](/courses/llm-canon/llama), whose open weights ultimately spread further and faster than BLOOM's careful governance could.
