---
course: llm-canon
lectureId: "2021"
title: "One Expert per Token"
deck: "Switch Transformer (2021) — Google's radical simplification of mixture-of-experts that routes each token to a single expert, letting parameter counts climb into the trillions while the compute spent on any one token stays flat."
order: 30
readingTime: 11
tags: ["architecture", "mixture-of-experts", "sparsity", "routing", "scaling"]
concepts:
  - id: moe
    term: Mixture of Experts (MoE)
    definition: "A layer of many parallel expert sub-networks in which a router sends each input to a small subset, so total parameters can grow without growing the computation spent on any single token."
  - id: switch-routing
    term: Top-1 (Switch) Routing
    definition: "Routing each token to exactly one expert, overturning the earlier belief that at least two were needed for a usable router gradient, and halving routing and communication cost."
  - id: conditional-computation
    term: Conditional Computation
    definition: "Decoupling parameter count from compute by activating only the parameters relevant to each input rather than running the whole network on every token."
  - id: expert-capacity
    term: Expert Capacity Factor
    definition: "The fixed buffer of token slots each expert receives; tokens routed to an already-full expert are dropped and skip the layer through the residual connection."
  - id: load-balancing
    term: Auxiliary Load-Balancing Loss
    definition: "A differentiable penalty that pushes routing toward a uniform distribution over experts, preventing the router from collapsing onto a favored few."
  - id: token-dropping
    term: Token Dropping
    definition: "Letting overflow tokens bypass an expert entirely once its capacity is exceeded — a silent quality cost traded for bounded, predictable memory."
---

Dense neural networks have a stubborn property: every parameter takes part in
every token's computation, so buying more capacity means paying more compute on
each and every word the model ever reads. For years that coupling looked like a
law of nature. The Switch Transformer broke it with a move so simple it had been
dismissed as impossible — give the network an enormous roster of parallel
sub-networks, and send each token to just *one* of them. Parameters soared toward
a trillion while the arithmetic per token barely moved.

## Breaking the Link Between Size and Cost

The idea behind the escape is **conditional computation**: activate only the
parameters relevant to a given input instead of the whole network. **Mixture of
Experts** is its cleanest expression. Replace a transformer's feed-forward
sublayer with many parallel copies — the *experts* — and put a small learned
*router* in front that decides which expert should handle each token. Total
capacity becomes the sum of all experts; compute per token becomes the cost of
only the ones actually used. The two quantities, once welded together, come apart.

Mixture of Experts was not new in 2021. The obstacle was an assumption inherited
from earlier work: that a router had to send each token to at least two experts,
because routing to a single one would give the router no gradient to learn from.
That top-$k$ requirement, with $k \ge 2$, dragged along extra cross-device
communication and implementation complexity, and it kept MoE a research curiosity
rather than a default.

## The Switch: One Expert per Token

The paper's central bet was that the assumption was simply wrong. Route each
token to exactly one expert — the "switch" — and the router still trains fine.
Top-1 routing halves the routing computation, cuts the volume of data shuffled
between devices, and shrinks the batch each expert must process. What had been
treated as the minimum viable design turned out to be unnecessary overhead.

The worry about vanishing gradients dissolves on inspection. The router emits a
softmax distribution over the experts and multiplies the chosen expert's output
by its routing probability; because that probability is a differentiable function
of the router's parameters, a learning signal still flows back even when only one
expert fires. A single scalar gate is enough to teach the router which expert it
ought to have preferred.

<figure>
<svg viewBox="0 0 820 280" role="img" aria-label="A Switch Transformer layer: a token enters a router that selects exactly one expert feed-forward network from many; only the chosen expert runs, so the parameter count grows with the number of experts while the compute per token stays constant.">
  <defs>
    <marker id="arw-switch" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" class="dgm-fill"/>
    </marker>
  </defs>
  <rect x="24" y="120" width="96" height="44" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="72" y="147" text-anchor="middle" font-size="12" font-weight="700">token x</text>
  <line x1="120" y1="142" x2="166" y2="142" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-switch)"/>
  <g class="dgm-accent">
    <rect x="168" y="112" width="118" height="60" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <text x="227" y="138" text-anchor="middle" font-size="12.5" font-weight="700">router</text>
    <text x="227" y="156" text-anchor="middle" font-size="10" class="dgm-muted">softmax &#8594; argmax</text>
  </g>
  <g class="dgm-muted">
    <rect x="420" y="40" width="150" height="40" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <text x="495" y="65" text-anchor="middle" font-size="11.5">Expert 1</text>
    <path d="M286,138 L414,64" fill="none" stroke="currentColor" stroke-width="1.2" stroke-dasharray="4 3" marker-end="url(#arw-switch)"/>
    <rect x="420" y="184" width="150" height="40" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <text x="495" y="209" text-anchor="middle" font-size="11.5">Expert 3</text>
    <path d="M286,150 L414,204" fill="none" stroke="currentColor" stroke-width="1.2" stroke-dasharray="4 3" marker-end="url(#arw-switch)"/>
    <rect x="420" y="232" width="150" height="40" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <text x="495" y="257" text-anchor="middle" font-size="11.5">Expert N</text>
    <path d="M286,156 L414,252" fill="none" stroke="currentColor" stroke-width="1.2" stroke-dasharray="4 3" marker-end="url(#arw-switch)"/>
  </g>
  <g class="dgm-accent">
    <rect x="420" y="112" width="150" height="40" class="dgm-soft" stroke="currentColor" stroke-width="1.5"/>
    <text x="495" y="137" text-anchor="middle" font-size="11.5" font-weight="700">Expert 2</text>
    <path d="M286,142 L414,132" fill="none" stroke="currentColor" stroke-width="1.6" marker-end="url(#arw-switch)"/>
  </g>
  <line x1="570" y1="132" x2="646" y2="132" stroke="currentColor" stroke-width="1.6" marker-end="url(#arw-switch)"/>
  <rect x="648" y="110" width="110" height="44" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="703" y="137" text-anchor="middle" font-size="12" font-weight="700">output</text>
  <text x="410" y="20" text-anchor="middle" font-size="10.5" class="dgm-muted">one expert active per token &#8594; constant FLOPs, growing parameters</text>
</svg>
<figcaption><b>The switch.</b> A router scores the experts and activates exactly one; the rest stay dark, so adding experts multiplies capacity without adding compute to any single token.</figcaption>
</figure>

## Making Sparsity Trainable

The elegance of top-1 routing is paid for with a handful of engineering fixes,
each addressing a way sparse models misbehave. Because experts run on separate
devices with fixed-size buffers, each is given an **expert capacity** — a slot
count equal to the batch's tokens divided by the number of experts, times a
tunable **capacity factor**. Tokens that arrive at an already-full expert are
**dropped**: they skip the layer and pass through on the residual connection. A
larger capacity factor wastes memory on padding; a smaller one drops more tokens.
Because the experts are spread across accelerators through **expert parallelism**,
every routing decision sets off an all-to-all exchange that ships each token to
wherever its expert lives and ships the result back — and it is that
communication, not the arithmetic, that top-1 routing is really economizing.

Left alone, a router tends to collapse, funneling most tokens to a few favored
experts and starving the rest. An **auxiliary load-balancing loss** counters this
with a differentiable term, minimized when tokens spread evenly across experts,
added to the training objective. Two more details proved essential in practice.
Full low-precision training diverged, so the router's math is done in float32
locally — cast its input up, route, cast back down — keeping communication cheap
while making the router's exponentials numerically stable. And because sparse
models overfit readily when fine-tuned on small datasets, the experts get a
smaller initialization scale and far heavier dropout than the shared layers. A
final option, distillation, compresses a trained sparse teacher back into a dense
student that keeps roughly a third of the quality gain — a hedge for deployments
that cannot afford to hold the full expert bank in memory.

## Why It Matters

The scale was the headline — up to 1.6 trillion parameters, the largest model of
its day — but the efficiency was the substance: roughly a sevenfold pretraining
speedup over a comparable dense baseline at equal compute per token, with
consistent gains across a hundred-plus languages. More lasting than any single
number, Switch made mixture-of-experts practical and mainstream. It turned total
parameter count and inference cost into *independent variables*, and that
separation is the economic foundation under nearly every frontier system that
followed — Mixtral, DeepSeek-V3, Kimi K2, and, by strong external inference, the
major closed models.

The design's costs became the next agenda. A model's memory footprint is still
its *total* parameter count, so serving a sparse trillion-parameter model needs
roughly the hardware of a dense one even though the compute is cheap. Load
balancing stays fragile; token dropping is a quiet tax on quality; fine-tuning
overfits; and at scale the cost of shuffling tokens between experts comes to
dominate, making topology-aware placement unavoidable. Each of those cracks is
where the next generation of MoE research went to work.

## Lineage

- **Builds on:** [Attention Is All You Need](/courses/llm-canon/attention-is-all-you-need), whose feed-forward sublayer it replaces with a bank of routed experts.
- **Leads to:** [DeepSeekMoE](/courses/llm-canon/deepseek-moe), which reworks the expert granularity to chase the specialization that coarse experts leave on the table.
