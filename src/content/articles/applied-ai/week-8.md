---
course: applied-ai
lectureId: W8
title: "The Scaffolding Around the Oracle"
deck: "Retrieval, deliberate reasoning, and a universal connector are quietly reshaping how large language models are made trustworthy — starting inside the hospital."
order: 8
readingTime: 11
tags: ["rag", "chain-of-thought", "self-consistency", "mcp", "llms"]
concepts:
  - id: conditional-generation
    term: Conditional Generation
    definition: "The core behavior of a language model: producing each token as a probability conditioned on the prompt, so changing the prompt changes what is likely to be said."
  - id: rag
    term: Retrieval-Augmented Generation
    definition: "A pipeline that retrieves relevant documents at query time and inserts them into the prompt, grounding generation in external, up-to-date sources."
  - id: self-consistency
    term: Self-Consistency
    definition: "Running the same prompt repeatedly and aggregating the answers — often by majority vote — to measure and improve the reliability of a model's response."
  - id: chain-of-thought
    term: Chain-of-Thought Prompting
    definition: "Prompting a model to emit intermediate reasoning steps before its final answer, which sharply improves performance on multi-step problems."
  - id: large-reasoning-models
    term: Large Reasoning Models
    definition: "Models trained with reinforcement learning to refine their own chain of thought, rewarding the reasoning process rather than only the final answer."
  - id: mcp
    term: Model Context Protocol
    definition: "An open standard — the 'USB-C port for AI' — that lets any model connect to external tools and data through a uniform client–server interface."
  - id: constrained-decoding
    term: Structured Output and Constrained Decoding
    definition: "Requiring model output to follow a fixed grammar such as XML, JSON, or YAML, which improves reliability at the cost of some latency and creativity."
---

In a study of electronic health records, a generative model's accuracy at
summarizing clinical notes jumped from 93.25% to 99.25% — and it did so without a
single change to the model's weights. The improvement came entirely from what was
placed *around* the model at the moment of the query. Strip that scaffolding away
and the same system reverted to confidently inventing plausible, wrong medical
facts. This lecture was a tour of that scaffolding: the techniques — retrieval,
repeated sampling, explicit reasoning, and standardized tool access — that make a
fixed language model behave as though it were smarter, better informed, and more
honest than it actually is on its own.

## The Prompt Is the Program

Everything here rests on one idea: a language model performs **conditional
generation**. Each token is drawn from a distribution conditioned on the prompt,

$$
p(y \mid \text{prompt}) = \prod_{t} p_\theta\big(y_t \mid y_{<t}, \text{prompt}\big),
$$

so the prompt is not a passive query — it is a control signal that reshapes the
probability landscape. This reframes a question the class kept asking: *why does
retrieval improve quality?* Because injecting relevant text into the prompt raises
the probability of semantically related words being selected next — the same
notion of contextual similarity that powers word embeddings. Change the
conditioning context and you change what the model is likely to say.

## Retrieval-Augmented Generation: Giving the Model a Library

**Retrieval-Augmented Generation (RAG)** operationalizes that insight with a
three-stage pipeline:

```text
Ingestion:  load documents -> split into chunks -> embed each chunk -> store in an index
Retrieval:  embed the user query -> fetch the top-K most similar chunks
Synthesis:  combine chunks + query -> place into the LLM prompt -> generate
```

<figure>
<svg viewBox="0 0 860 232" role="img" aria-label="Retrieval-augmented generation pipeline: a query retrieves the top matching chunks from a document index, which augment the prompt before the language model generates a grounded answer.">
  <defs>
    <marker id="arw-rag" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" class="dgm-fill"/>
    </marker>
  </defs>
  <rect x="12" y="52" width="118" height="66" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="71" y="82" text-anchor="middle" font-size="14" font-weight="700">Query</text>
  <text x="71" y="102" text-anchor="middle" font-size="10" class="dgm-muted">user question</text>
  <line x1="130" y1="85" x2="162" y2="85" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-rag)"/>
  <rect x="164" y="52" width="158" height="66" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="243" y="82" text-anchor="middle" font-size="14" font-weight="700">Retrieve</text>
  <text x="243" y="102" text-anchor="middle" font-size="10" class="dgm-muted">top-K chunks</text>
  <line x1="322" y1="85" x2="354" y2="85" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-rag)"/>
  <rect x="356" y="52" width="158" height="66" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="435" y="82" text-anchor="middle" font-size="14" font-weight="700">Augment</text>
  <text x="435" y="102" text-anchor="middle" font-size="10" class="dgm-muted">chunks + query → prompt</text>
  <line x1="514" y1="85" x2="546" y2="85" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-rag)"/>
  <g class="dgm-accent">
    <rect x="548" y="52" width="150" height="66" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <text x="623" y="82" text-anchor="middle" font-size="14" font-weight="700">Generate</text>
    <text x="623" y="102" text-anchor="middle" font-size="10">LLM</text>
  </g>
  <line x1="698" y1="85" x2="730" y2="85" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-rag)"/>
  <rect x="732" y="52" width="116" height="66" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="790" y="82" text-anchor="middle" font-size="14" font-weight="700">Answer</text>
  <text x="790" y="102" text-anchor="middle" font-size="10" class="dgm-muted">grounded</text>
  <rect x="164" y="166" width="158" height="52" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="243" y="188" text-anchor="middle" font-size="12" font-weight="700">Vector index</text>
  <text x="243" y="206" text-anchor="middle" font-size="10" class="dgm-muted">embedded chunks</text>
  <line x1="243" y1="166" x2="243" y2="120" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-rag)"/>
  <rect x="360" y="166" width="180" height="52" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="450" y="188" text-anchor="middle" font-size="11" font-weight="700">Ingest</text>
  <text x="450" y="206" text-anchor="middle" font-size="10" class="dgm-muted">docs → chunks → embed</text>
  <line x1="360" y1="192" x2="324" y2="192" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-rag)"/>
</svg>
<figcaption><b>Retrieval-augmented generation</b> The query pulls the top-K chunks from a prebuilt vector index; those chunks augment the prompt, and only then does the model generate a grounded answer.</figcaption>
</figure>

Retrieval typically ranks chunks by cosine similarity between query and document
embeddings,

$$
\text{sim}(\mathbf{q}, \mathbf{d}) = \frac{\mathbf{q} \cdot \mathbf{d}}{\lVert \mathbf{q}\rVert\,\lVert \mathbf{d}\rVert},
$$

so generation is now conditioned on both the question and a retrieved set,
$p(y \mid q, \mathcal{D})$. The benefits are substantial: RAG sidesteps a model's
outdated training data, adapts a general model to a specialized domain without the
expense of fine-tuning, counterbalances catastrophic forgetting, and can lower
hallucination rates. That is precisely what the clinical study exploited — and why
its numbers collapsed once retrieval was removed.

But RAG is no free lunch. Retrieval failures inject their own hallucinations;
even with good retrieval, a model may misread or simply ignore the supplied
context; there is real computational overhead; and long, complex dialogues strain
the approach. Designers must also choose similarity thresholds that rarely
generalize cleanly. RAG grounds the model — it does not make it reason.

## Asking Twice: Self-Consistency

If a model's output is a *sample* from a distribution, then a single answer is a
single draw. **Self-consistency** treats that fact as an opportunity: run the same
prompt several times and aggregate. For a classification task, take the majority
vote across $m$ samples,

$$
\hat{y} = \arg\max_{c} \sum_{i=1}^{m} \mathbf{1}\big[y_i = c\big],
$$

and read the spread as a confidence estimate. For binary decisions, a neat variant
is to craft an *opposite* prompt and check how often the desired class survives
both framings. The frequency with which particular tokens recur across samples
becomes a signal in its own right.

<figure>
<svg viewBox="0 0 720 210" role="img" aria-label="Self-consistency: one prompt is sampled several times and the repeated answers are combined by majority vote into a final answer.">
  <defs>
    <marker id="arw-selfcons" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" class="dgm-fill"/>
    </marker>
  </defs>
  <rect x="14" y="78" width="120" height="56" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="74" y="104" text-anchor="middle" font-size="14" font-weight="700">Prompt</text>
  <text x="74" y="122" text-anchor="middle" font-size="10" class="dgm-muted">sampled ×m</text>
  <rect x="204" y="22" width="150" height="40" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="279" y="47" text-anchor="middle" font-size="12">run 1 → A</text>
  <rect x="204" y="86" width="150" height="40" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="279" y="111" text-anchor="middle" font-size="12">run 2 → A</text>
  <rect x="204" y="150" width="150" height="40" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="279" y="175" text-anchor="middle" font-size="12">run 3 → B</text>
  <line x1="134" y1="100" x2="202" y2="46" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-selfcons)"/>
  <line x1="134" y1="106" x2="202" y2="106" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-selfcons)"/>
  <line x1="134" y1="112" x2="202" y2="170" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-selfcons)"/>
  <line x1="354" y1="42" x2="426" y2="100" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-selfcons)"/>
  <line x1="354" y1="106" x2="426" y2="106" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-selfcons)"/>
  <line x1="354" y1="170" x2="426" y2="112" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-selfcons)"/>
  <rect x="428" y="78" width="140" height="56" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="498" y="104" text-anchor="middle" font-size="13" font-weight="700">Majority vote</text>
  <text x="498" y="122" text-anchor="middle" font-size="10" class="dgm-muted">count answers</text>
  <line x1="568" y1="106" x2="612" y2="106" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-selfcons)"/>
  <g class="dgm-accent">
    <rect x="616" y="82" width="90" height="48" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <text x="661" y="112" text-anchor="middle" font-size="15" font-weight="700">ŷ = A</text>
  </g>
</svg>
<figcaption><b>Self-consistency</b> Sampling the same prompt several times and taking the majority answer turns a single noisy draw into a more reliable result — and the spread is itself a confidence estimate.</figcaption>
</figure>

## Thinking Out Loud: Chain-of-Thought and the Reasoning Models

Early language models stumbled on anything requiring several steps. The fix was
disarmingly simple: prompt the model to write its intermediate steps into a
"scratchpad" before answering. **Chain-of-thought (CoT) prompting** made complex
reasoning *emerge* in sufficiently large models — the first demonstrations needed
only eight step-by-step exemplars in the prompt, structured as
$\langle \text{input}, \text{chain of thought}, \text{output} \rangle$.

<figure>
<svg viewBox="0 0 700 200" role="img" aria-label="Chain-of-thought prompting: a direct prompt jumps straight to an answer, while a chain-of-thought prompt emits intermediate reasoning steps before answering.">
  <defs>
    <marker id="arw-cot" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" class="dgm-fill"/>
    </marker>
  </defs>
  <text x="120" y="26" text-anchor="middle" font-size="11" class="dgm-muted">Direct</text>
  <rect x="70" y="34" width="94" height="42" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="117" y="60" text-anchor="middle" font-size="13" font-weight="700">Question</text>
  <line x1="164" y1="55" x2="236" y2="55" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-cot)"/>
  <rect x="240" y="34" width="110" height="42" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="295" y="60" text-anchor="middle" font-size="13">Answer</text>
  <text x="470" y="60" text-anchor="middle" font-size="11" class="dgm-muted">often wrong on multi-step tasks</text>
  <text x="120" y="116" text-anchor="middle" font-size="11" class="dgm-muted">Chain-of-thought</text>
  <rect x="18" y="124" width="90" height="42" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="63" y="150" text-anchor="middle" font-size="12" font-weight="700">Question</text>
  <line x1="108" y1="145" x2="140" y2="145" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-cot)"/>
  <rect x="142" y="124" width="86" height="42" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="185" y="150" text-anchor="middle" font-size="11">step 1</text>
  <line x1="228" y1="145" x2="256" y2="145" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-cot)"/>
  <rect x="258" y="124" width="86" height="42" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="301" y="150" text-anchor="middle" font-size="11">step 2</text>
  <line x1="344" y1="145" x2="372" y2="145" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-cot)"/>
  <rect x="374" y="124" width="86" height="42" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="417" y="150" text-anchor="middle" font-size="11">step 3</text>
  <line x1="460" y1="145" x2="488" y2="145" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-cot)"/>
  <g class="dgm-accent">
    <rect x="490" y="124" width="110" height="42" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <text x="545" y="150" text-anchor="middle" font-size="13" font-weight="700">Answer ✓</text>
  </g>
</svg>
<figcaption><b>Chain-of-thought</b> Prompting the model to write intermediate steps into a scratchpad before answering sharply improves accuracy on problems that need several reasoning hops.</figcaption>
</figure>

**Large Reasoning Models (LRMs)** internalize the trick. When it launched, the o1
model used a chain of thought to attack problems and, crucially, learned *through
reinforcement learning* to refine that chain — rewarding the reasoning process,
not just the final answer. Yet the class did not present this as a triumph. Apple's
*The Illusion of Thinking* compared LRMs and standard models at equal inference
compute and found a more sobering pattern: on low-complexity tasks, ordinary models
with short reasoning can match or beat LRMs; on medium complexity, the extra
"thinking" earns its keep; and on high complexity, *both collapse*. LRMs also
stumble at exact algorithmic computation and can reason inconsistently. More
deliberation is not the same as more reliability.

## The USB-C Port for AI

The final technique addresses a different limitation: a model, however capable,
knows nothing of your calendar, your database, or today's news. Before the **Model
Context Protocol (MCP)**, wiring an LLM to each external tool meant a bespoke
integration for every tool–model pair. MCP aims to be the "USB-C port for AI" — an
open standard that fixes a two-way communication format so any client can talk to
any tool. Its architecture is deliberately lopsided toward the **server** side:
servers expose data and tools (databases, search engines, workflows) in a uniform
way, while **clients** — the AI applications — connect and consume them, freed to
focus on generating useful responses. The result is a step toward genuinely
*agentic* systems that can act in the world.

Seen together, these tools answer the same complaint from three directions. A
language model is limited by what it can reason over: RAG connects it to real-world
*data*, decision-maker alignment grounds it in individual *values*, and MCP
connects it to *tools*. A closing note on format reinforced the theme — prompting
with structured output (XML, JSON, YAML) and **constrained decoding** measurably
improves quality, trading a little latency and creativity for reliability.

## Why It Matters

None of these methods touch the underlying model, and that is exactly the point.
Retraining a frontier model is slow and ruinously expensive; the scaffolding
around it is cheap, fast, and auditable. In a hospital, that distinction is not
academic — a retrieved, cited medical note is defensible in a way that a model's
internal recall never can be. Yet the same lecture kept sounding a note of caution:
these techniques are, in one student's phrase, "band-aids" over foundation models
that still hallucinate and still cannot reliably reason. They make today's systems
usable in high-stakes settings. Whether they are a bridge to more capable
architectures, or a permanent exoskeleton the models will always need, is the open
question underneath all of it.
