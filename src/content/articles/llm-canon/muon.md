---
course: llm-canon
lectureId: "2024"
title: "The First Serious Challenge to Adam"
deck: "Muon (2024) — an optimizer that orthogonalizes the momentum update of a Transformer's weight matrices, roughly doubling token efficiency over AdamW and reopening optimizer design as a live research question."
order: 37
readingTime: 11
tags: ["architecture", "optimizer", "training", "newton-schulz", "moe"]
concepts:
  - id: orthogonalized-momentum
    term: Orthogonalized Momentum
    definition: "Muon's core step: replace the momentum update matrix with its nearest orthogonal matrix before applying it, equalizing update magnitude across all singular directions."
  - id: newton-schulz
    term: Newton–Schulz Iteration
    definition: "A short, fixed sequence of matrix multiplications — typically five, in bfloat16 — that approximates a matrix's orthogonal polar factor without an expensive exact SVD."
  - id: polar-factor
    term: Polar Factor (UVᵀ)
    definition: "The orthogonal part of a matrix's polar decomposition — conceptually UVᵀ from the SVD M = UΣVᵀ — which keeps the update's directions while discarding its singular values."
  - id: update-conditioning
    term: Update Conditioning
    definition: "By orthogonalizing, the update matrix is given condition number 1, so directions that Adam's per-parameter scaling would starve receive proportionate signal."
  - id: rms-matching
    term: Update RMS Matching
    definition: "A scaling fix that makes Muon's update magnitudes match what AdamW would produce, so existing learning rates and hyperparameters transfer to Muon."
  - id: qk-clip
    term: QK-Clip
    definition: "A stability fix that rescales the query and key weight matrices when a monitored attention logit exceeds a threshold, attacking exploding logits at their spectral-norm root."
---

Almost everything in this collection is a change to what a model *is* — its
architecture, its data, its objective. This last entry changes how a model is
*trained*, and it is the one paper here that is not really a paper. Since 2015 the
default optimizer for deep learning has been Adam, and its weight-decayed variant
AdamW; "use AdamW" has been the complete, unquestioned answer for the better part of
a decade. **Muon** is the first method to seriously threaten that default, and it
arrived not through peer review but through a blog post and a NanoGPT speedrun
record — a provenance worth flagging up front, because its real credibility comes
from something unusual: production adoption at trillion-parameter scale.

## Adam's Blind Spot

Adam treats a weight matrix as a loose bag of independent scalars. It keeps a running
estimate of each parameter's gradient magnitude and rescales that parameter on its
own, ignoring the fact that the parameters are arranged in a matrix with structure.
For a Transformer's two-dimensional hidden weights, that structure turns out to
matter enormously. Empirically, the momentum matrices for those weights are nearly
low-rank with very high condition numbers: a few singular directions dominate the
update while the rest of the parameter space receives almost no signal. Adam, blind
to the matrix, faithfully starves the neglected directions.

## Orthogonalize the Update

Muon's fix is one idea. Compute the ordinary SGD-with-momentum update matrix $M$ as
usual, then, before applying it, replace it with its **nearest orthogonal matrix**.
Conceptually, take the singular value decomposition $M = U\Sigma V^{\top}$, throw
away the singular *values* in $\Sigma$, and keep only the directions:

$$
M \;=\; U\Sigma V^{\top} \quad\longrightarrow\quad \text{update} \;=\; UV^{\top}
$$

Discarding $\Sigma$ equalizes the magnitude of the update across every singular
direction. Directions Adam would have effectively ignored now get their proportionate
share, and the **condition number** of the update becomes 1 by construction. The
update stops being dominated by a handful of directions and starts using the whole
matrix.

<figure>
<svg viewBox="0 0 860 210" role="img" aria-label="Muon's update: the momentum matrix has a skewed spectrum in which a few singular values dominate; a short Newton-Schulz iteration approximates its orthogonal polar factor UV-transpose, producing an update whose singular values are all equalized to one, which is then applied to the weight.">
  <defs>
    <marker id="arw-muon" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" class="dgm-fill"/>
    </marker>
  </defs>
  <rect x="14" y="52" width="182" height="118" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="105" y="76" text-anchor="middle" font-size="13" font-weight="700">Momentum M</text>
  <text x="105" y="94" text-anchor="middle" font-size="10.5" class="dgm-muted">skewed spectrum</text>
  <rect x="48" y="112" width="20" height="42" class="dgm-soft" stroke="currentColor" stroke-width="1"/>
  <rect x="90" y="126" width="20" height="28" class="dgm-soft" stroke="currentColor" stroke-width="1"/>
  <rect x="132" y="140" width="20" height="14" class="dgm-soft" stroke="currentColor" stroke-width="1"/>
  <text x="105" y="166" text-anchor="middle" font-size="10" class="dgm-muted">few σ dominate</text>
  <line x1="196" y1="111" x2="240" y2="111" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-muon)"/>
  <g class="dgm-accent">
    <rect x="242" y="74" width="180" height="74" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <text x="332" y="100" text-anchor="middle" font-size="12.5" font-weight="700">Newton–Schulz</text>
    <text x="332" y="118" text-anchor="middle" font-size="10.5" class="dgm-muted">5 matmul iters · bf16</text>
    <text x="332" y="136" text-anchor="middle" font-size="10.5" class="dgm-muted">&#8776; polar factor</text>
  </g>
  <line x1="422" y1="111" x2="466" y2="111" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-muon)"/>
  <rect x="468" y="52" width="190" height="118" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="563" y="76" text-anchor="middle" font-size="13" font-weight="700">Orthogonalized</text>
  <text x="563" y="94" text-anchor="middle" font-size="10.5" class="dgm-muted">&#8776; UV&#x22a4;</text>
  <rect x="504" y="120" width="20" height="34" class="dgm-soft" stroke="currentColor" stroke-width="1"/>
  <rect x="546" y="120" width="20" height="34" class="dgm-soft" stroke="currentColor" stroke-width="1"/>
  <rect x="588" y="120" width="20" height="34" class="dgm-soft" stroke="currentColor" stroke-width="1"/>
  <text x="563" y="166" text-anchor="middle" font-size="10" class="dgm-muted">σ → 1 · cond = 1</text>
  <line x1="658" y1="111" x2="702" y2="111" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-muon)"/>
  <rect x="704" y="80" width="144" height="62" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="776" y="106" text-anchor="middle" font-size="12" font-weight="700">Weight update</text>
  <text x="776" y="126" text-anchor="middle" font-size="10.5" class="dgm-muted">W &#8592; W &#8722; η·UV&#x22a4;</text>
</svg>
<figcaption><b>Orthogonalizing the update.</b> The momentum matrix, dominated by a few singular directions, is passed through a short Newton–Schulz iteration that keeps its directions but flattens its singular values to one, and the resulting orthogonal update is applied to the weight.</figcaption>
</figure>

## Newton–Schulz, Not SVD

An exact SVD at every step would be far too expensive to run inside a training loop.
Muon sidesteps it with a short, fixed sequence of **Newton–Schulz iterations** —
typically five — that approximate the orthogonal polar factor directly. The iteration
is matrix-multiplication only, runs happily in bfloat16, and costs a small fraction of
each step. The technique is scoped deliberately: it applies only to the
two-dimensional hidden weights. Embeddings, the output head, biases, and normalization
scales keep using AdamW, because their gradient geometry is different and
orthogonalization does not apply. As a bonus, Muon stores a single momentum buffer
where Adam keeps two moment estimates — roughly half the optimizer-state memory.

## Making It Scale

Getting Muon to work on real large language models took two rounds of engineering.
The Moonlight report added three things: **weight decay**; **update RMS matching**,
which rescales Muon's updates so their root-mean-square magnitude matches what AdamW
would produce — the trick that lets you carry over an existing AdamW learning rate and
hyperparameters intact; and a **Distributed Muon** that shards optimizer state across
data-parallel groups in the ZeRO-1 style. Then, at trillion-parameter scale, Muon runs
hit exploding attention logits more often than AdamW runs did. Off-the-shelf remedies
did not fit — logit soft-capping acts too late, and QK-Norm is incompatible with the
MLA attention these models use — so Kimi K2 introduced **QK-Clip**, which rescales the
query and key weight matrices directly whenever a monitored logit crosses a threshold,
attacking the root cause (the spectral norms of $W_q$ and $W_k$) rather than the
symptom.

## Why It Matters

Two things make Muon significant. First, if the token-efficiency claim holds broadly,
it is a direct multiplier on every training budget in the industry — the cheapest
imaginable improvement, since it changes no architecture and no data. Moonlight
reported roughly twice the computational efficiency of AdamW at matched performance,
and Kimi K2 — a one-trillion-parameter mixture-of-experts with thirty-two billion
active parameters — pretrained on 15.5 trillion tokens with MuonClip and reported *zero
loss spikes* across the entire run, a remarkable claim at that scale. Second, and
maybe more importantly, Muon reopened optimizer design as a live research area after a
decade in which the question was considered closed.

The cautions deserve equal weight, and the unusual provenance is the first of them.
The original is a blog post, not a peer-reviewed paper; the evidence is strong but its
*shape* differs from everything else in this collection, so production adoption should
be read as the primary signal. The reported gains come largely from the labs that
adopted Muon, which is not independent evaluation, and their AdamW baselines may not be
equally tuned. The instability at scale is real and required a dedicated fix. Muon does
not touch embeddings or output heads, so a hybrid optimizer setup is mandatory — more
moving parts, not fewer. And the theory for *why* orthogonalization helps this much
remains thin relative to the empirical claims.

## Lineage

- **Builds on:** the training stacks of [LLaMA](/courses/llm-canon/llama)-lineage and [DeepSeekMoE](/courses/llm-canon/deepseek-moe)-lineage models — modern mixture-of-experts Transformers are where Muon was validated — and the inference-heavy economics of [Test-Time Scaling](/courses/llm-canon/test-time-scaling), which raises the value of every training dollar saved.
- **Leads to:** a terminal node in this collection — but not a dead end. Muon reopened optimizer design as a live research area, with variants, theoretical analyses of why orthogonalization works, and extensions to the very parameters it currently excludes now under active study.
