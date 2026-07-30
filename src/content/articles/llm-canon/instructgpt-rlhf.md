---
course: llm-canon
lectureId: "2022"
title: "Teaching a Model to Take Instructions"
deck: "InstructGPT (2022) — OpenAI's three-stage recipe of demonstrations, a reward model, and reinforcement learning that turned a text-continuation engine into an assistant, and let a 1.3B model beat the 175B one."
order: 13
readingTime: 11
tags: ["alignment", "rlhf", "reward-model", "ppo", "instruction-following"]
concepts:
  - id: rlhf
    term: RLHF
    definition: "Reinforcement Learning from Human Feedback: the three-stage pipeline of supervised fine-tuning, training a reward model on human preference rankings, and optimizing the policy against that reward with reinforcement learning."
  - id: sft
    term: Supervised Fine-Tuning (SFT)
    definition: "Fine-tuning a pretrained model on human-written demonstrations of the desired behavior — the first stage, which does most of the work but needs expensive labeled data."
  - id: reward-model
    term: Reward Model
    definition: "A model trained to predict human preference rankings between candidate responses, producing a scalar score for any prompt–response pair that stands in for a human judge."
  - id: ppo-kl
    term: PPO with KL Penalty
    definition: "Proximal Policy Optimization used to maximize the reward model's score, with a penalty on divergence from the reference model that stops the policy from drifting into text that games the reward."
  - id: reward-hacking
    term: Reward Hacking
    definition: "When a policy exploits flaws in the reward model to earn high scores without genuinely satisfying the intent — the failure mode the KL penalty is meant to contain."
  - id: alignment-tax
    term: Alignment Tax
    definition: "The regression on standard benchmarks that preference tuning can cause, mitigated here by mixing pretraining gradients back into the reinforcement-learning stage."
---

A pretrained language model does exactly one thing: it predicts likely next
tokens. Ask GPT-3 a question and it may, quite reasonably, respond with more
questions — because a list of questions is a plausible continuation of a
question. The model is not broken; it is optimizing the wrong objective. Its
training goal, next-token likelihood over internet text, has almost nothing to do
with the deployment goal, which is to be helpful, honest, and harmless. In 2022,
InstructGPT closed that gap, and in doing so quietly defined the entire assistant
category that ChatGPT would make famous months later.

## The Objective Mismatch

The insight is that raw capability is not the same as usable capability. GPT-3
already *contained* the knowledge to answer well; it simply had no incentive to
prefer an answer over a continuation. Fixing that meant changing the training
signal from "what text is likely" to "what response do people actually want,"
which requires getting human preferences into the loop. InstructGPT does this in
three stages that remain the reference architecture for alignment.

## Stage 1 — Demonstrations

First, **supervised fine-tuning**. Around forty trained contractors write model
answers to real prompts drawn from API traffic, and GPT-3 is fine-tuned on these
demonstrations. This alone moves the model a long way toward following
instructions. Its limitation is cost: every demonstration is a human writing a
full, high-quality answer by hand, which does not scale.

## Stage 2 — A Model of Human Preference

So the second stage replaces *writing* with *ranking*, which is far cheaper. For
a given prompt, the fine-tuned model samples several candidate responses, and
labelers rank them from best to worst. A separate **reward model** is trained to
reproduce those rankings, learning to output a scalar score for any
prompt–response pair. Ranking is used rather than absolute scoring because people
are far more consistent when comparing two answers than when assigning a number
to one.

## Stage 3 — Optimizing Against the Judge

The third stage turns that reward model into a training signal using
**Proximal Policy Optimization**. The fine-tuned model — now the *policy* —
generates responses, the reward model scores them, and PPO nudges the policy
toward higher-scoring behavior. Left unchecked, this optimization discovers that
the reward model is only an approximation and starts producing degenerate text
that games it — **reward hacking**. The fix is a penalty on the
Kullback–Leibler divergence between the policy and the original reference model,
which tethers the policy to fluent language while it chases reward. A variant
mixes the original pretraining gradient back in to counteract the
**alignment tax** — the tendency of preference tuning to erode performance on
standard benchmarks.

<figure>
<svg viewBox="0 0 840 250" role="img" aria-label="The three-stage RLHF pipeline: supervised fine-tuning produces a policy, ranked samples train a reward model, and PPO optimizes the policy against the reward model with a KL penalty back to the reference.">
  <defs>
    <marker id="arw-rlhf" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" class="dgm-fill"/>
    </marker>
  </defs>
  <rect x="12" y="70" width="150" height="88" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="87" y="98" text-anchor="middle" font-size="13" font-weight="700">1 · SFT</text>
  <text x="87" y="120" text-anchor="middle" font-size="10.5" class="dgm-muted">human</text>
  <text x="87" y="135" text-anchor="middle" font-size="10.5" class="dgm-muted">demonstrations</text>
  <line x1="162" y1="114" x2="208" y2="114" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-rlhf)"/>
  <rect x="210" y="70" width="160" height="88" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="290" y="98" text-anchor="middle" font-size="13" font-weight="700">2 · Reward Model</text>
  <text x="290" y="120" text-anchor="middle" font-size="10.5" class="dgm-muted">ranked samples</text>
  <text x="290" y="135" text-anchor="middle" font-size="10.5" class="dgm-muted">&#8594; scalar reward</text>
  <line x1="370" y1="114" x2="416" y2="114" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-rlhf)"/>
  <g class="dgm-accent">
    <rect x="418" y="70" width="164" height="88" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <text x="500" y="98" text-anchor="middle" font-size="13" font-weight="700">3 · PPO</text>
    <text x="500" y="120" text-anchor="middle" font-size="10.5" class="dgm-muted">maximize reward</text>
    <text x="500" y="135" text-anchor="middle" font-size="10.5" class="dgm-muted">policy update</text>
  </g>
  <line x1="582" y1="114" x2="628" y2="114" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-rlhf)"/>
  <rect x="630" y="82" width="150" height="64" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="705" y="110" text-anchor="middle" font-size="12.5" font-weight="700">Aligned model</text>
  <text x="705" y="128" text-anchor="middle" font-size="10.5" class="dgm-muted">assistant</text>
  <path d="M500 158 C 500 205, 290 205, 290 160" fill="none" stroke="currentColor" stroke-width="1.3" stroke-dasharray="4 3" marker-end="url(#arw-rlhf)"/>
  <text x="395" y="200" text-anchor="middle" font-size="10.5" class="dgm-muted">KL penalty &#8594; reference</text>
</svg>
<figcaption><b>The RLHF pipeline.</b> Demonstrations fine-tune a policy; ranked samples train a reward model; PPO optimizes the policy against it, held near the reference model by a KL penalty.</figcaption>
</figure>

## Why It Matters

Human evaluators preferred the 1.3-billion-parameter InstructGPT to the
175-billion-parameter GPT-3 — roughly a hundredfold fewer parameters, judged
better. That single result reframed the field's central problem from *capability*
to *controllability*. It is not enough to build a model that knows things; you
have to make it want to be useful. ChatGPT is this paper productized, and every
assistant since inherits its three-stage shape.

The costs are real and set up the rest of the alignment story. PPO keeps four
models in memory at once — policy, reference, reward, and value — making it
expensive and famously finicky to tune. The reward model is a proxy that can be
gamed, and "aligned to whom?" is left undertheorized when forty contractors,
screened by one company, define the target. Each of those weaknesses becomes a
research program: Constitutional AI removes most human labels, and Direct
Preference Optimization removes the reward model and the reinforcement-learning
loop entirely.

## Lineage

- **Builds on:** [GPT-3](/courses/llm-canon/gpt-3) as the base model to be aligned.
- **Leads to:** [Constitutional AI](/courses/llm-canon/constitutional-ai) (replace human labels with AI feedback), [Self-Instruct](/courses/llm-canon/self-instruct) (remove the human demonstrations), and [DPO](/courses/llm-canon/dpo) (remove the reward model and the reinforcement-learning loop).
