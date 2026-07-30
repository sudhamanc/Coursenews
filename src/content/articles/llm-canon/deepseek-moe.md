---
course: llm-canon
lectureId: "2024"
title: "Many Small Specialists and a Shared Generalist"
deck: "DeepSeekMoE (2024) — the mixture-of-experts redesign that slices each expert into fine-grained pieces and reserves a few always-on shared experts, sharpening specialization at identical compute and setting the template for the open frontier."
order: 31
readingTime: 11
tags: ["architecture", "mixture-of-experts", "sparsity", "specialization", "deepseek"]
concepts:
  - id: fine-grained-experts
    term: Fine-Grained Expert Segmentation
    definition: "Splitting each expert into m smaller experts of one-mth the size and activating mK of them, holding compute constant while multiplying the number of possible expert combinations."
  - id: shared-experts
    term: Shared Expert Isolation
    definition: "Reserving a few experts that every token passes through unconditionally to absorb common knowledge, freeing the routed experts to specialize."
  - id: knowledge-hybridity
    term: Knowledge Hybridity
    definition: "The failure of coarse mixtures where too few experts each must absorb many unrelated kinds of knowledge, so none of them truly specializes."
  - id: knowledge-redundancy
    term: Knowledge Redundancy
    definition: "The waste in coarse mixtures where every expert independently relearns the same common patterns, duplicating capacity across the layer."
  - id: expert-specialization
    term: Expert Specialization
    definition: "The degree to which each expert holds distinct, non-redundant knowledge — measured here by how sharply performance drops when the top routed experts are disabled."
  - id: compute-neutral
    term: Compute-Neutral Redesign
    definition: "An architectural change that leaves FLOPs and parameters per token unchanged, so any gain comes from structure rather than from spending more computation."
---

The Switch Transformer proved that mixture-of-experts could scale, but it left the
experts themselves largely unexamined: eight, or sixteen, big feed-forward
networks per layer, one of which handled each token. DeepSeekMoE's argument is
that this coarseness was quietly wasting most of the promise. With so few experts,
each is forced to be a generalist, and the layer squanders capacity relearning
the same basics in every one of them. The remedy is two changes that cost nothing
in compute and change what the experts become: cut them much finer, and set a few
of them permanently aside.

## Two Flaws in Coarse Experts

The paper names the diseases precisely. The first is **knowledge hybridity**:
when a layer has only eight or sixteen experts, any one of them must cover many
unrelated kinds of knowledge at once — code and poetry and arithmetic routed to
the same box — so no expert ever settles into a genuine specialty. The second is
**knowledge redundancy**: the common patterns every token needs, basic syntax,
formatting, high-frequency structure, get learned *independently* inside every
expert, because each must be able to handle a token on its own. A large share of
the layer's total capacity goes to storing the same background knowledge many
times over. Both flaws trace back to the same root cause — the experts are too
big and too few.

## Slicing the Experts Finer

The first change is **fine-grained expert segmentation**. Take each expert's
feed-forward network and split its hidden dimension by a factor $m$, producing
$mN$ experts that are each $1/m$ the size, and activate $mK$ of them instead of
$K$. The arithmetic is deliberately conserved: parameters and FLOPs per token are
exactly what they were. What changes is the *combinatorics* of routing. The number
of ways to choose the active experts explodes — from choosing, say, 2 of 16 to
choosing 8 of 64,

$$
\binom{16}{2} = 120 \quad\longrightarrow\quad \binom{64}{8} \approx 4.4 \times 10^{9}
$$

— roughly four orders of magnitude more routing configurations. Finer pieces mean
the router can compose a much more precise combination for each token, and the
knowledge decomposition becomes correspondingly sharper. None of this buys
capability by brute force: the same number of parameters activate, merely carved
into smaller, independently routable pieces the router can mix more freely.

<figure>
<svg viewBox="0 0 860 300" role="img" aria-label="A DeepSeekMoE layer: a router selects a few of many small fine-grained experts for each token, while a small set of shared experts processes every token unconditionally; the outputs are summed to form the result.">
  <defs>
    <marker id="arw-dsmoe" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" class="dgm-fill"/>
    </marker>
  </defs>
  <rect x="20" y="130" width="92" height="44" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="66" y="157" text-anchor="middle" font-size="12" font-weight="700">token x</text>
  <line x1="112" y1="152" x2="136" y2="152" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-dsmoe)"/>
  <g class="dgm-accent">
    <rect x="138" y="124" width="100" height="56" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <text x="188" y="150" text-anchor="middle" font-size="12" font-weight="700">router</text>
    <text x="188" y="167" text-anchor="middle" font-size="10" class="dgm-muted">picks mK</text>
  </g>
  <text x="440" y="34" text-anchor="middle" font-size="12" font-weight="700">fine-grained routed experts</text>
  <text x="440" y="50" text-anchor="middle" font-size="10.5" class="dgm-muted">mN small experts · activate mK</text>
  <g class="dgm-muted">
    <rect x="320" y="60" width="46" height="32" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <rect x="424" y="60" width="46" height="32" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <rect x="476" y="60" width="46" height="32" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <rect x="320" y="98" width="46" height="32" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <rect x="372" y="98" width="46" height="32" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <rect x="476" y="98" width="46" height="32" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <rect x="528" y="98" width="46" height="32" fill="none" stroke="currentColor" stroke-width="1.5"/>
  </g>
  <g class="dgm-accent">
    <rect x="372" y="60" width="46" height="32" class="dgm-soft" stroke="currentColor" stroke-width="1.5"/>
    <rect x="528" y="60" width="46" height="32" class="dgm-soft" stroke="currentColor" stroke-width="1.5"/>
    <rect x="424" y="98" width="46" height="32" class="dgm-soft" stroke="currentColor" stroke-width="1.5"/>
    <path d="M238,140 L316,80" fill="none" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-dsmoe)"/>
  </g>
  <g class="dgm-accent">
    <rect x="320" y="196" width="254" height="44" class="dgm-soft" stroke="currentColor" stroke-width="1.5"/>
    <text x="447" y="214" text-anchor="middle" font-size="11.5" font-weight="700">shared experts</text>
    <text x="447" y="230" text-anchor="middle" font-size="10" class="dgm-muted">every token · always on</text>
  </g>
  <path d="M66,174 C 66,232 200,236 316,220" fill="none" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-dsmoe)"/>
  <text x="150" y="262" text-anchor="middle" font-size="10" class="dgm-muted">unconditional</text>
  <circle cx="648" cy="140" r="24" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="648" y="146" text-anchor="middle" font-size="16" font-weight="700">&#931;</text>
  <path d="M574,86 L620,128" fill="none" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-dsmoe)"/>
  <path d="M574,214 L620,154" fill="none" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-dsmoe)"/>
  <line x1="672" y1="140" x2="716" y2="140" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-dsmoe)"/>
  <rect x="718" y="118" width="110" height="44" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="773" y="145" text-anchor="middle" font-size="12" font-weight="700">output</text>
</svg>
<figcaption><b>Fine-grained plus shared.</b> The router composes each token from a few of many small experts, while a handful of shared experts handle every token unconditionally; summing the two lets the routed experts specialize instead of each relearning the basics.</figcaption>
</figure>

## A Shared Generalist

The second change is **shared expert isolation**. A small number of experts are
designated as *shared* — every token passes through them unconditionally,
regardless of what the router decides — and the count of routed experts is reduced
to keep the total compute per token fixed. In practice only one or two experts are
shared, a small standing overhead set against a large recovered capacity. These
shared experts become the home for exactly the common knowledge that was
previously duplicated everywhere. Once
the basics live in one guaranteed place, the routed experts no longer have to
carry them, and they are free to specialize on the distinctive material the router
sends their way. The two mechanisms are orthogonal — one multiplies routing
precision, the other removes redundancy — and both are compute-neutral by
construction.

## Proving It Specializes

The validation is unusually disciplined. The team began at two billion parameters,
a scale small enough for exhaustive ablation, established that each mechanism helps
on its own, and only then scaled up. They also tested the specialization claim
directly rather than by assertion: disabling the top routed experts degrades
DeepSeekMoE far more sharply than it degrades a comparable GShard-style model —
exactly the signature you would expect if its experts are less redundant and each
is carrying knowledge the others do not. The results held. At two billion
parameters the model approached the quality ceiling of a conventional mixture with
one and a half times its expert parameters; DeepSeekMoE-16B, trained on two
trillion tokens, matched LLaMA2-7B while spending roughly forty percent of the
computation, and the design scaled on to 145 billion.

## Why It Matters

DeepSeekMoE is the modern mixture-of-experts template. DeepSeek-V2 and V3, Kimi K2
with its 384 experts and eight active plus shared, and most new large sparse
architectures adopt fine-grained experts with a shared component. The trend line
points one way — ever more experts at ever lower activation ratios, only a few
percent of the parameters firing per token — and DeepSeekMoE is where it begins.
Paired with Multi-head Latent Attention, this expert design is the architecture
behind much of the 2024–2026 open frontier — the first credible open answer to the
closed laboratories' scaling.

The costs are the mirror image of the gains. Many small experts mean more routing
decisions and more scattered communication, so some of the efficiency is eaten
back by system complexity. Load balancing across hundreds of experts is harder,
not easier, and later DeepSeek work abandoned the auxiliary balancing loss for a
bias-based scheme, having found that the auxiliary loss itself degrades quality.
And, as with every mixture, the total memory footprint still scales with the total
parameter count, no matter how few experts fire per token — which is exactly why
the same lab's work on compressing the key-value cache became the other half of
its architecture.

## Lineage

- **Builds on:** [Switch Transformer](/courses/llm-canon/switch-transformer), whose routing framework it re-parameterizes for granularity, and [GRPO](/courses/llm-canon/grpo), the reinforcement-learning method from the same lab that its model series is trained with.
- **Leads to:** [KV Cache Compression](/courses/llm-canon/kv-cache-compression), with which it forms the DeepSeek-V2/V3 architecture, and [Muon](/courses/llm-canon/muon), the optimizer that pushes the same MoE line further.
