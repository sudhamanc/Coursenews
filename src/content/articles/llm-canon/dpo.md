---
course: llm-canon
lectureId: "2023"
title: "Your Language Model Was the Reward Model All Along"
deck: "Direct Preference Optimization (2023) — the Stanford result showing RLHF's optimum has a closed form, so preference tuning collapses into a single classification loss with no reward model and no reinforcement learning."
order: 16
readingTime: 11
tags: ["alignment", "dpo", "preference-optimization", "offline-rl", "bradley-terry"]
concepts:
  - id: implicit-reward-model
    term: Implicit Reward Model
    definition: "The insight that a policy trained under a KL-constrained reward objective already encodes the reward as a log-ratio to a reference, so the language model itself plays the role of the reward model — hence the paper's subtitle."
  - id: bradley-terry
    term: Bradley–Terry Model
    definition: "A statistical model of pairwise preference in which the probability that one item beats another is the logistic function of the difference between their latent scores."
  - id: kl-constrained-optimum
    term: KL-Constrained Optimum
    definition: "The known analytic solution to reward maximization with a KL penalty: the optimal policy is the reference distribution reweighted by the exponentiated reward."
  - id: partition-cancellation
    term: Partition-Function Cancellation
    definition: "Because the intractable normalizer depends only on the prompt, it appears identically in the chosen and rejected terms of a preference pair and cancels — the trick that makes DPO tractable."
  - id: offline-preference-optimization
    term: Offline Preference Optimization
    definition: "Training only on a fixed dataset of preference pairs without sampling new responses during optimization, trading the ability to explore for stability and low cost."
---

For a year and a half, aligning a language model to human preference meant
signing up for a famously miserable engineering project. You trained a separate
reward model, then ran Proximal Policy Optimization with a policy, a frozen
reference, and a value network all resident in memory at once, generating samples
on the fly, babysitting hyperparameters that would detonate the run if you looked
at them wrong. In 2023 a Stanford team asked whether all of that apparatus was
actually necessary — and answered, with a short derivation, that it was not.
*Direct Preference Optimization: Your Language Model is Secretly a Reward Model*
showed that the entire reinforcement-learning stage could be replaced by a single
line of loss.

## The Machinery Was the Problem

Part IV reads as one long subtraction, each paper removing a component from
InstructGPT's stack. DPO makes the boldest cut yet: it deletes the reward model
*and* the reinforcement-learning loop together. What it keeps is modest — a
supervised starting checkpoint and a frozen reference model — and everything else
that made RLHF forbidding simply evaporates. The claim sounds too strong until you
follow the algebra, at which point it becomes almost obvious in hindsight.

## A Closed Form Hiding in Plain Sight

Start with the objective RLHF was always optimizing: maximize a reward while
staying close, in Kullback–Leibler divergence, to a reference policy. That problem
has a textbook solution — the **KL-constrained optimum** — and it is not
approximate. For reward $r(x,y)$ and reference $\pi_{\text{ref}}$, the optimal
policy is

$$
\pi_r(y\mid x) = \frac{1}{Z(x)}\,\pi_{\text{ref}}(y\mid x)\,\exp\!\left(\tfrac{1}{\beta}\,r(x,y)\right),
$$

the reference distribution tilted toward high reward, with $\beta$ setting how
hard it tilts and $Z(x)$ the partition function that renormalizes it. The
partition function is the villain of ordinary RLHF: computing $Z(x)$ means summing
over every possible response, which is hopeless, and that intractability is
exactly why people reach for reinforcement learning in the first place.

DPO's move is to run the equation *backwards*. Rather than solve for the policy
given the reward, solve for the reward given the policy:

$$
r(x,y) = \beta\,\log\frac{\pi_r(y\mid x)}{\pi_{\text{ref}}(y\mid x)} + \beta\,\log Z(x).
$$

Read that literally and it says something startling: any policy defines an
**implicit reward model**. The reward is just $\beta$ times the log-ratio of the
policy to the reference, plus a term that depends only on the prompt. The language
model *is* the reward model.

## The Normalizer That Cancels

The last obstacle is that lonely $\log Z(x)$ term, still intractable. Here the
preference structure rescues the derivation. Human preference data comes in pairs
— a chosen response $y_w$ and a rejected one $y_l$ for the same prompt — and the
standard **Bradley–Terry model** says the probability of preferring one to the
other depends only on the *difference* of their rewards. Substitute the expression
above into that difference and the magic happens: $Z(x)$ depends solely on the
prompt $x$, so it appears identically in both terms and **cancels**. The
impossible normalizer is gone. What remains is a plain binary-cross-entropy loss
over preference pairs:

$$
\mathcal{L}_{\text{DPO}} = -\,\mathbb{E}_{(x,\,y_w,\,y_l)}\!\left[\log\sigma\!\left(\beta\log\frac{\pi_\theta(y_w\mid x)}{\pi_{\text{ref}}(y_w\mid x)} - \beta\log\frac{\pi_\theta(y_l\mid x)}{\pi_{\text{ref}}(y_l\mid x)}\right)\right].
$$

Operationally it could hardly be simpler. Push up the policy's log-probability of
the chosen response and push down the log-probability of the rejected one, each
measured as a ratio to the frozen reference, with $\beta$ governing how aggressive
the update is. One forward pass through the policy, one through the reference, no
sampling, no reward model, no reinforcement learning.

<figure>
<svg viewBox="0 0 840 250" role="img" aria-label="Direct Preference Optimization: a prompt with a chosen and a rejected response trains the policy to raise the log-probability ratio of the chosen response and lower it for the rejected one, both measured against a frozen reference model, while the separate reward model and reinforcement-learning loop are deleted.">
  <defs>
    <marker id="arw-dpo" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" class="dgm-fill"/>
    </marker>
  </defs>
  <rect x="16" y="98" width="104" height="54" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="68" y="122" text-anchor="middle" font-size="13" font-weight="700">Prompt x</text>
  <text x="68" y="140" text-anchor="middle" font-size="10.5" class="dgm-muted">+ pair</text>
  <line x1="120" y1="112" x2="166" y2="78" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-dpo)"/>
  <line x1="120" y1="138" x2="166" y2="172" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-dpo)"/>
  <g class="dgm-accent">
    <rect x="168" y="44" width="212" height="52" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <text x="274" y="66" text-anchor="middle" font-size="12.5" font-weight="700">chosen y_w &#8593;</text>
    <text x="274" y="85" text-anchor="middle" font-size="10.5" class="dgm-muted">raise &#946; log &#960;&#952; / &#960;ref</text>
  </g>
  <rect x="168" y="156" width="212" height="52" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="274" y="178" text-anchor="middle" font-size="12.5" font-weight="700">rejected y_l &#8595;</text>
  <text x="274" y="197" text-anchor="middle" font-size="10.5" class="dgm-muted">lower &#946; log &#960;&#952; / &#960;ref</text>
  <line x1="274" y1="96" x2="274" y2="156" stroke="currentColor" stroke-width="1.2" stroke-dasharray="4 3"/>
  <text x="274" y="129" text-anchor="middle" font-size="10" class="dgm-muted">frozen &#960;ref</text>
  <g class="dgm-muted">
    <rect x="474" y="90" width="182" height="70" fill="none" stroke="currentColor" stroke-width="1.5" stroke-dasharray="5 4"/>
    <line x1="474" y1="90" x2="656" y2="160" stroke="currentColor" stroke-width="1.1"/>
    <line x1="656" y1="90" x2="474" y2="160" stroke="currentColor" stroke-width="1.1"/>
    <text x="565" y="119" text-anchor="middle" font-size="12" font-weight="700">reward model</text>
    <text x="565" y="139" text-anchor="middle" font-size="11">+ RL loop</text>
  </g>
  <text x="565" y="182" text-anchor="middle" font-size="10.5" class="dgm-muted">deleted</text>
</svg>
<figcaption><b>Preference without a reward model.</b> DPO trains the policy to push the chosen response above the rejected one — each scored as a log-ratio to a frozen reference — so the explicit reward model and the reinforcement-learning loop can be removed entirely.</figcaption>
</figure>

## Cheaper, Steadier, Everywhere

On sentiment control, summarization, and single-turn dialogue, DPO matched or beat
PPO-based RLHF while being dramatically more stable and far cheaper to run, with
essentially no knob to tune beyond $\beta$. That combination — comparable quality,
a fraction of the complexity — made it spread almost instantly. Within months
**offline preference optimization** was the default post-training method for
open-weight models, and DPO became the reference point against which every later
alignment method is now measured.

## Why It Matters

DPO democratized alignment. It turned preference tuning from a project requiring an
RL specialist and a cluster into something anyone with a GPU and a preference
dataset could do in an afternoon, and in doing so it collapsed the practical gap
between frontier labs and everyone else. It also delivered a genuinely surprising
theoretical result — that RLHF's reinforcement learning was, in a precise sense,
solving a problem with a closed-form answer — which reshaped how the field thinks
about what preference tuning actually is.

Its limits are the flip side of its virtues. Being offline, DPO only ever sees the
distribution baked into its preference dataset; it cannot explore, cannot discover
a better response than the ones it was shown. It has a documented failure mode of
driving down the likelihood of the chosen *and* the rejected response at once,
merely widening the gap between them, and it is sensitive to the quality of the
supervised checkpoint used as reference. Most consequentially, on hard tasks with
*verifiable* rewards — math, code, formal proofs — online reinforcement learning
still wins, because a checker can reward a genuinely novel correct answer that no
preference dataset contained. That is the opening the next paper walks through, and
the reason reinforcement learning did not actually die here.

## Lineage

- **Builds on:** [InstructGPT](/courses/llm-canon/instructgpt-rlhf), whose KL-constrained objective DPO solves analytically instead of by reinforcement learning.
- **Leads to:** [ORPO](/courses/llm-canon/orpo), which deletes even the reference model and the separate supervised stage, and [GRPO](/courses/llm-canon/grpo), which brings reinforcement learning back for the verifiable-reward tasks DPO cannot reach.
