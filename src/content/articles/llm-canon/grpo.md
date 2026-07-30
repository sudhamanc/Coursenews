---
course: llm-canon
lectureId: "2024"
title: "The Crowd Is the Critic"
deck: "GRPO (2024) — the DeepSeekMath algorithm that keeps reinforcement learning but throws away the value network, judging each answer against a group of its siblings, and the engine behind the open reasoning-model wave."
order: 18
readingTime: 11
tags: ["alignment", "grpo", "reinforcement-learning", "reasoning", "verifiable-rewards"]
concepts:
  - id: critic-free-rl
    term: Critic-Free Policy Optimization
    definition: "A reinforcement-learning method that drops the learned value network and estimates the baseline directly from a batch of sampled responses, halving the models kept in memory."
  - id: group-relative-advantage
    term: Group-Relative Advantage
    definition: "Scoring an answer by how far its reward sits above or below the mean of a group of answers to the same prompt, standardized by the group's spread."
  - id: verifiable-rewards
    term: Verifiable Rewards
    definition: "Reward signals from a rule-based checker — a math answer key, a unit test, a proof verifier — that are cheap, objective, and far harder to game than a learned reward model."
  - id: sequence-level-advantage
    term: Sequence-Level Advantage
    definition: "Assigning every token in a sampled response the same advantage value, which is what makes dropping the per-token critic tractable."
---

DPO had made reinforcement learning look obsolete. It matched RLHF's quality
without the sampling, the reward model, or the notorious instability, and for a
year the field's momentum ran hard toward offline preference methods. Then, in
early 2024, a paper ostensibly about mathematics — *DeepSeekMath* — quietly put
reinforcement learning back at the center of the frontier. Its contribution was an
algorithm called **Group Relative Policy Optimization**, and its argument was
subtle: on the problems that matter most for reasoning, offline preference tuning
hits a ceiling that only online exploration can break through. The trick was to
keep the reinforcement learning while cutting the single component that made it so
expensive.

## The Component That Refused to Leave

Read against the rest of Part IV, GRPO breaks the pattern. Every paper before it
removed something and stayed offline or supervised; GRPO deliberately keeps the
reinforcement-learning loop, because on tasks with **verifiable rewards** — math
with an answer key, code with a unit test, proofs with a checker — the loop earns
its keep. An offline method can only imitate the best answer in its dataset. Online
reinforcement learning can sample a genuinely new solution, run it past the
checker, and be rewarded for being *correct* rather than merely *preferred* — which
is the entire game for reasoning, where the right answer may lie outside any
preference set.

The obstacle was never the reinforcement learning itself but its accountant. PPO,
the algorithm InstructGPT used, needs a **value network**: a second model, usually
as large as the policy, trained to predict expected future reward so that
advantages can be computed against a sensible baseline. On a language-model backbone
this critic is notoriously hard to train well, and it doubles the memory bill. GRPO
asks whether that baseline could come from somewhere cheaper.

## The Group Is the Baseline

It can — from the group itself. For each prompt $q$, GRPO samples not one response
but a *group* of $G$ of them from the current policy (the paper used 64 per math
problem). A reward model or, better, a rule-based verifier scores each one. Then,
instead of asking a learned critic how good a response *should* have been, GRPO
simply asks how each response did *relative to its siblings*. The
**group-relative advantage** for output $i$ standardizes its reward against the
group's own mean and spread:

$$
\hat{A}_i = \frac{r_i - \operatorname{mean}(r_1,\dots,r_G)}{\operatorname{std}(r_1,\dots,r_G)}.
$$

An answer better than the group average gets a positive advantage and is
reinforced; a worse one is pushed down. No value network is required, because the
group *is* the baseline — this is **critic-free policy optimization**. The policy
is then updated with a familiar PPO-style clipped objective, but with a KL penalty
to a reference policy applied directly as a term rather than folded into the
reward:

$$
\mathcal{J}_{\text{GRPO}} = \mathbb{E}\!\left[\frac{1}{G}\sum_{i=1}^{G}\min\!\big(\rho_i\hat{A}_i,\ \operatorname{clip}(\rho_i,\,1-\varepsilon,\,1+\varepsilon)\hat{A}_i\big)\right] - \beta\,\mathbb{D}_{\text{KL}}\!\left(\pi_\theta\,\|\,\pi_{\text{ref}}\right),
$$

where $\rho_i = \pi_\theta(o_i\mid q)/\pi_{\theta_{\text{old}}}(o_i\mid q)$ is the
importance ratio. Every token in a sampled response shares that one
sequence-level number — the **sequence-level advantage** — and it is precisely this
simplification, refusing to assign per-token credit, that makes dropping the critic
tractable.

<figure>
<svg viewBox="0 0 860 264" role="img" aria-label="GRPO samples a group of G responses to one prompt, scores each with a verifier or reward, standardizes each reward against the group's mean and standard deviation to form a group-relative advantage, and updates the policy with a clipped, KL-regularized objective — with no separate value network.">
  <defs>
    <marker id="arw-grpo" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" class="dgm-fill"/>
    </marker>
  </defs>
  <rect x="14" y="104" width="96" height="56" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="62" y="130" text-anchor="middle" font-size="13" font-weight="700">Prompt q</text>
  <text x="62" y="148" text-anchor="middle" font-size="10.5" class="dgm-muted">policy &#960;&#952;</text>
  <rect x="150" y="24" width="214" height="220" fill="none" stroke="currentColor" stroke-width="1.3" stroke-dasharray="3 3"/>
  <text x="257" y="18" text-anchor="middle" font-size="11" font-weight="700" class="dgm-muted">sample G outputs</text>
  <rect x="166" y="36" width="182" height="34" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="257" y="57" text-anchor="middle" font-size="11">o&#8321; &#8594; r&#8321;</text>
  <rect x="166" y="80" width="182" height="34" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="257" y="101" text-anchor="middle" font-size="11">o&#8322; &#8594; r&#8322;</text>
  <text x="257" y="138" text-anchor="middle" font-size="16">&#8942;</text>
  <rect x="166" y="156" width="182" height="34" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="257" y="177" text-anchor="middle" font-size="11">o_G &#8594; r_G</text>
  <line x1="110" y1="120" x2="160" y2="66" stroke="currentColor" stroke-width="1.4" marker-end="url(#arw-grpo)"/>
  <line x1="110" y1="140" x2="160" y2="173" stroke="currentColor" stroke-width="1.4" marker-end="url(#arw-grpo)"/>
  <line x1="364" y1="100" x2="406" y2="100" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-grpo)"/>
  <rect x="408" y="74" width="152" height="52" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="484" y="98" text-anchor="middle" font-size="11.5" font-weight="700">group baseline</text>
  <text x="484" y="116" text-anchor="middle" font-size="10.5" class="dgm-muted">mean &#956; · std &#963;</text>
  <line x1="484" y1="126" x2="484" y2="150" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-grpo)"/>
  <g class="dgm-accent">
    <rect x="402" y="152" width="164" height="52" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <text x="484" y="176" text-anchor="middle" font-size="12" font-weight="700">A&#7522; = (r&#7522; &#8722; &#956;) / &#963;</text>
    <text x="484" y="194" text-anchor="middle" font-size="10" class="dgm-muted">group-relative advantage</text>
  </g>
  <line x1="566" y1="178" x2="610" y2="178" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-grpo)"/>
  <rect x="612" y="150" width="234" height="56" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="729" y="174" text-anchor="middle" font-size="11.5" font-weight="700">clipped update + KL to &#960;ref</text>
  <text x="729" y="192" text-anchor="middle" font-size="10.5" class="dgm-muted">policy &#960;&#952;</text>
  <g class="dgm-muted">
    <rect x="612" y="72" width="234" height="52" fill="none" stroke="currentColor" stroke-width="1.5" stroke-dasharray="5 4"/>
    <line x1="612" y1="72" x2="846" y2="124" stroke="currentColor" stroke-width="1.1"/>
    <line x1="846" y1="72" x2="612" y2="124" stroke="currentColor" stroke-width="1.1"/>
    <text x="729" y="102" text-anchor="middle" font-size="11.5" font-weight="700">value network removed</text>
  </g>
</svg>
<figcaption><b>The group is the baseline.</b> GRPO samples a group of answers to one prompt, standardizes each reward against the group's mean and spread to get an advantage, and updates the policy with a clipped, KL-regularized objective — deleting the value network PPO required.</figcaption>
</figure>

## Half the Paper Is the Data

The algorithm gets the acclaim, but DeepSeekMath's results lean just as heavily on
a corpus. The team mined roughly 120 billion tokens of mathematics from Common
Crawl using an iterative, classifier-based pipeline seeded from a small, curated
high-quality set — each round training a better filter and pulling in more
relevant text. It is a useful corrective to the algorithm-first reading of the
paper: GRPO supplied the training signal, but the corpus did much of the actual
work of making a 7B model good at math.

## The Result That Reopened RL

DeepSeekMath-7B posted competitive scores on the MATH benchmark with no external
tools and no answer-voting, outperforming open models many times its size and
closing on contemporary proprietary systems — all at a memory cost well below
PPO's at equal scale. The deeper significance arrived with what came next: GRPO is
the algorithm behind DeepSeek-R1 and the open reasoning-model wave that followed.
It reopened reinforcement learning as *the* frontier method precisely because
reinforcement learning plus a verifier can push a model past the distribution of
its preference data — the one thing offline methods structurally cannot do.

## Why It Matters

GRPO closes the arc of Part IV with a twist. The section had been a steady
subtraction — reward model gone, reinforcement learning gone, reference model gone
— trending toward ever-cheaper offline methods. GRPO subtracts the value network
but pointedly *keeps* the reinforcement learning, because that loop is what unlocks
reasoning. The lesson is that not every component was dead weight: the trick was
identifying which one to remove and which one to defend.

The method leans on its own assumptions. It needs a reliable reward signal, so it
shines where correctness is checkable and struggles on open-ended generation.
Sampling $G$ responses per prompt is expensive at generation time even if training
is cheaper than PPO's. And the standard formulation carries known biases — toward
length, and toward easy problems via the standard-deviation normalization — that
have spawned a stream of corrective variants such as Dr. GRPO, DAPO, and GSPO, with
the theory arriving well after the adoption. None of that has slowed it: GRPO is
now the default recipe for turning a capable base model into a reasoner.

## Lineage

- **Builds on:** [InstructGPT](/courses/llm-canon/instructgpt-rlhf), whose PPO it simplifies; [DPO](/courses/llm-canon/dpo), whose efficiency goal it answers differently; and [Constitutional AI](/courses/llm-canon/constitutional-ai), whose use of a model-generated training signal it inherits.
- **Leads to:** [Test-Time Scaling](/courses/llm-canon/test-time-scaling) and the reasoning-model line it launched, and [DeepSeekMoE](/courses/llm-canon/deepseek-moe), the architecture it was paired with inside DeepSeek's systems.
