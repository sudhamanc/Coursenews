---
course: llm-canon
lectureId: "2024"
title: "One Loss to Align Them All"
deck: "ORPO (2024) — the monolithic method from KAIST that folds preference alignment into supervised fine-tuning with a single odds-ratio penalty, deleting both the reference model and the separate preference stage."
order: 17
readingTime: 11
tags: ["alignment", "orpo", "odds-ratio", "single-stage", "preference-optimization"]
concepts:
  - id: odds-ratio-loss
    term: Odds-Ratio Loss
    definition: "A penalty built from the ratio of the odds of the chosen response to the odds of the rejected one, delivering a proportionally large push only when the rejected response is genuinely likely."
  - id: monolithic-alignment
    term: Monolithic Alignment
    definition: "Collapsing supervised fine-tuning and preference optimization into a single training stage governed by one combined loss, rather than running them one after another."
  - id: reference-free
    term: Reference-Free Optimization
    definition: "Measuring the preference contrast entirely within the model being trained, so no frozen reference copy needs to be held in memory."
  - id: sft-side-effect
    term: The SFT Side-Effect
    definition: "Plain supervised fine-tuning raises the probability of desirable responses but incidentally raises that of undesirable ones too, because they share surface features — the leak ORPO's penalty is designed to plug."
---

Every paper in this section has been an exercise in subtraction, and by 2024 the
stack had already grown remarkably lean. DPO had thrown out the reward model and
the reinforcement-learning loop, leaving preference alignment as a tidy
classification problem. But two components still stood. You needed a supervised
fine-tuning run first, to get a sensible starting checkpoint, and then a second
preference stage that carried a frozen reference model in memory throughout. ORPO,
from KAIST, looked at those two survivors and asked whether either was truly
load-bearing. Its answer — *Monolithic Preference Optimization without Reference
Model* — folds the whole thing into one stage with one model and one loss.

## The Two Stages That Refused to Merge

Even in its streamlined DPO form, alignment was a pipeline: fine-tune, then
prefer. That sequencing feels natural — teach the model to talk, then teach it
what to prefer — but it carries real cost. Two training runs mean two rounds of
data plumbing and bookkeeping, and holding a frozen reference alongside the
trainable policy roughly doubles the model memory during the preference phase.
ORPO's ambition is **monolithic alignment**: a single pass that does both jobs at
once, keeping no second copy of the model around.

## The Leak in Supervised Fine-Tuning

The insight that makes this possible is a diagnosis of what supervised fine-tuning
actually does. Train a model to imitate good responses and, as intended, the
probability it assigns to those responses climbs. But the paper points to a quiet
side effect — **the SFT side-effect**. Because a bad response and a good one often
share vocabulary, phrasing, and structure, raising the likelihood of the good
answer incidentally drags the likelihood of the stylistically similar bad answer
up with it. Ordinary fine-tuning has no mechanism to say *not like that*. ORPO's
wager is that a small, well-shaped penalty applied *during* fine-tuning — just
enough to hold the disfavored style down — is all the preference signal you need.

## One Loss, One Model

The recipe is a single objective with two terms:

$$
\mathcal{L}_{\text{ORPO}} = \mathcal{L}_{\text{SFT}} + \lambda\cdot\mathcal{L}_{\text{OR}}.
$$

The first term is the usual supervised negative log-likelihood on the chosen
response — the same loss that teaches the model to write well. The second is the
**odds-ratio loss**, the whole of the preference signal, weighted by $\lambda$. It
is built not on probabilities directly but on their *odds*,

$$
\textbf{odds}_\theta(y\mid x) = \frac{P_\theta(y\mid x)}{1 - P_\theta(y\mid x)},
$$

and it maximizes the log odds-ratio between the chosen and rejected responses:

$$
\mathcal{L}_{\text{OR}} = -\log\sigma\!\left(\log\frac{\textbf{odds}_\theta(y_w\mid x)}{\textbf{odds}_\theta(y_l\mid x)}\right).
$$

Because the supervised term is already present, there is no need for a prior
fine-tuned checkpoint to warm-start from — the model can begin from the base. And
because the contrast is measured entirely within the model's own odds, there is no
reference to compare against. This is **reference-free optimization**: one stage,
one set of weights.

### Why Odds, Not Likelihood

The choice of the *odds* ratio rather than the raw probability ratio is the
technical heart of the paper. DPO's contrast is effectively a probability ratio,
which is a sharp instrument: it pushes hard on the rejected response even when that
response was already unlikely, and the authors argue — with a gradient analysis
and ablations — that this over-penalization can destabilize generation. The odds
ratio is gentler. It grows steeply only when the rejected response is genuinely
probable and flattens out when it is not, so the penalty concentrates its force
exactly where a bad answer is actually tempting the model, and eases off
elsewhere.

<figure>
<svg viewBox="0 0 840 244" role="img" aria-label="ORPO collapses a two-stage pipeline into one: instead of supervised fine-tuning followed by a preference stage with a frozen reference model, a single step minimizes the supervised loss on the chosen response plus a weighted odds-ratio penalty between chosen and rejected responses, producing the aligned model directly.">
  <defs>
    <marker id="arw-orpo" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" class="dgm-fill"/>
    </marker>
  </defs>
  <g class="dgm-muted">
    <text x="20" y="30" text-anchor="start" font-size="11" font-weight="700">TWO-STAGE (DPO)</text>
    <rect x="20" y="40" width="86" height="42" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <text x="63" y="66" text-anchor="middle" font-size="11.5">SFT</text>
    <line x1="106" y1="61" x2="146" y2="61" stroke="currentColor" stroke-width="1.4" marker-end="url(#arw-orpo)"/>
    <rect x="148" y="40" width="152" height="42" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <text x="224" y="59" text-anchor="middle" font-size="11">preference stage</text>
    <text x="224" y="74" text-anchor="middle" font-size="9.5">+ frozen reference</text>
    <line x1="300" y1="61" x2="340" y2="61" stroke="currentColor" stroke-width="1.4" marker-end="url(#arw-orpo)"/>
    <rect x="342" y="40" width="96" height="42" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <text x="390" y="66" text-anchor="middle" font-size="11">aligned</text>
  </g>
  <text x="20" y="138" text-anchor="start" font-size="11" font-weight="700" class="dgm-accent">ONE-STAGE (ORPO)</text>
  <rect x="20" y="150" width="86" height="64" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="63" y="187" text-anchor="middle" font-size="12" font-weight="700">Base</text>
  <line x1="106" y1="182" x2="150" y2="182" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-orpo)"/>
  <g class="dgm-accent">
    <rect x="152" y="148" width="324" height="68" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <text x="314" y="176" text-anchor="middle" font-size="12.5" font-weight="700">L_SFT(y_w) + &#955; · odds-ratio(y_w, y_l)</text>
    <text x="314" y="200" text-anchor="middle" font-size="10.5" class="dgm-muted">one model · no reference · no separate SFT</text>
  </g>
  <line x1="476" y1="182" x2="520" y2="182" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-orpo)"/>
  <rect x="522" y="150" width="120" height="64" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="582" y="182" text-anchor="middle" font-size="12" font-weight="700">Aligned</text>
  <text x="582" y="199" text-anchor="middle" font-size="10.5" class="dgm-muted">model</text>
</svg>
<figcaption><b>Collapsing the stack.</b> Where preference tuning needed a separate stage and a frozen reference, ORPO adds a single odds-ratio penalty to the supervised loss, aligning the base model in one pass through one model.</figcaption>
</figure>

## Half the Memory, Competitive Scores

Trained on the UltraFeedback preference set alone, across models from 125M up to
7B, ORPO held its own against pipelines several times more elaborate.
Mistral-ORPO reached 12.20% on AlpacaEval 2.0, 66.19% on IFEval's instruction-level
loose metric, and 7.32 on MT-Bench — numbers that outpaced several released 7B and
13B models built with multi-stage recipes. Because the frozen reference is gone,
the memory footprint drops by roughly half relative to DPO, which is the practical
headline for anyone fine-tuning on modest hardware.

## Why It Matters

ORPO is the cheapest credible point on the alignment cost curve. Read across all of
Part IV, it completes a remarkable compression: InstructGPT kept four models in
memory and ran reinforcement learning; ORPO keeps one model and runs a single
supervised loss with a preference term bolted on. For a small team with a
preference dataset and a single GPU, it removes both a training stage and an entire
model from the pipeline, making alignment nearly as cheap as ordinary fine-tuning.
It belongs to a broader family — alongside SimPO and KTO — pursuing the same goal
of simplifying the stack down to its irreducible core.

That core still has edges. ORPO is **offline**, bounded like DPO by whatever
distribution its preference data contains, and it cannot explore beyond it. The
weight $\lambda$ genuinely needs tuning, and the method is sensitive to it. The
reported wins are on chat and instruction-following benchmarks; the paper does not
establish parity on reasoning-heavy tasks, and independent reproductions comparing
it head-to-head with a well-tuned DPO have been mixed. It is the end of the
subtraction line for *offline* preference optimization — the point past which there
is little left to remove — which is precisely why the frontier moved elsewhere,
back toward reinforcement learning, for the problems this family cannot solve.

## Lineage

- **Builds on:** [DPO](/courses/llm-canon/dpo), whose reference-based contrast it replaces with an internal one, and [InstructGPT](/courses/llm-canon/instructgpt-rlhf), whose supervised stage it absorbs into the preference loss.
- **Leads to:** a terminal point — the cheapest credible rung on the alignment cost curve, and part of the broader "simplify the stack" family with SimPO and KTO.
