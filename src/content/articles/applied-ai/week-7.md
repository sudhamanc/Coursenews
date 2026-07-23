---
course: applied-ai
lectureId: W7
title: "The Long Road From Prediction to Preference"
deck: "One dense lecture traces how machines graduate from reconstructing missing movie ratings, to predicting the next word, to finally learning what people actually prefer."
order: 7
readingTime: 11
tags: ["autoencoders", "llms", "reinforcement-learning", "rlhf", "recommendation"]
concepts:
  - id: autorec
    term: Autoencoder Recommendation (AutoRec)
    definition: "A recommender that trains an autoencoder to reconstruct a partially observed vector of ratings, using the reconstructed values at the empty positions as predictions."
  - id: llm-training-pipeline
    term: The Three-Stage LLM Pipeline
    definition: "The sequence of pretraining, instruction tuning, and preference alignment that turns a raw next-word predictor into a helpful, instruction-following assistant."
  - id: cross-entropy
    term: Cross-Entropy Loss
    definition: "A measure of how far a model's predicted probability distribution sits from the true distribution; it is largest when the model is confidently wrong."
  - id: in-context-learning
    term: In-Context Learning
    definition: "Steering a model's behavior through instructions and examples placed in the prompt at inference time, without ever updating the model's weights."
  - id: reinforcement-learning
    term: Reinforcement Learning
    definition: "A framework for learning to make sequential decisions by trial and error, where an agent interacts with an environment to maximize cumulative reward."
  - id: reward-vs-value
    term: Reward Function vs. Value Function
    definition: "A reward function scores the immediate desirability of a state; a value function estimates the total reward expected from that state over the long run."
  - id: rlhf
    term: Reinforcement Learning from Human Feedback
    definition: "A technique that trains a reward model from human preference comparisons and then fine-tunes a policy to maximize that reward, aligning outputs with human judgment."
---

Most machine learning stories are told as if a model simply "learns from data,"
but that phrase hides the interesting part: *what, exactly, is the learning
signal?* This lecture answered that question three different ways in a single
sitting. It began with an autoencoder learning to fill in ratings it had never
seen, moved to a language model learning to predict the next word across the
open internet, and ended with a model learning something far more slippery — the
preferences of the humans reading its output. The through-line is a steady
migration of the training signal, from *reconstruct yourself* to *predict the
world* to *satisfy a person*.

## The Autoencoder That Learned to Recommend

Recommendation begins with a painfully sparse table: millions of users, millions
of items, and only a scattering of actual ratings. **AutoRec** attacks this with
an autoencoder. Take a single item — say, an iPad rated 4, 3, and 4 by three
users while two others never touched it. Feed that rating vector into an encoder
that squeezes it through a narrow bottleneck, then let a decoder expand it back
out. The network is trained so its output matches the input at the positions we
actually know, and the values it invents at the empty positions become its
recommendations.

<figure>
<svg viewBox="0 0 640 200" role="img" aria-label="AutoRec autoencoder: a partly observed rating vector is compressed to a small code and reconstructed, and the values invented at the empty positions become the recommendations.">
  <defs>
    <marker id="arw-autorec" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" class="dgm-fill"/>
    </marker>
  </defs>
  <text x="64" y="34" text-anchor="middle" font-size="12" class="dgm-muted">input r</text>
  <rect x="16" y="44" width="96" height="112" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="64" y="92" text-anchor="middle" font-size="15" font-weight="700">4, 3, 4,</text>
  <text x="64" y="122" text-anchor="middle" font-size="15" font-weight="700">?, ?</text>
  <line x1="114" y1="100" x2="150" y2="100" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-autorec)"/>
  <polygon points="156,48 256,80 256,120 156,152" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="200" y="104" text-anchor="middle" font-size="13" font-weight="700">Encoder</text>
  <g class="dgm-accent">
    <rect x="278" y="78" width="60" height="44" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <text x="308" y="106" text-anchor="middle" font-size="16" font-weight="700">z</text>
  </g>
  <text x="308" y="140" text-anchor="middle" font-size="10" class="dgm-muted">code</text>
  <polygon points="360,80 460,48 460,152 360,120" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="410" y="104" text-anchor="middle" font-size="13" font-weight="700">Decoder</text>
  <line x1="466" y1="100" x2="502" y2="100" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-autorec)"/>
  <text x="566" y="34" text-anchor="middle" font-size="12" class="dgm-muted">output r&#770;</text>
  <rect x="506" y="44" width="120" height="112" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="566" y="92" text-anchor="middle" font-size="15" font-weight="700">4, 3, 4,</text>
  <text x="566" y="122" text-anchor="middle" font-size="15" font-weight="700" class="dgm-accent">4.2, 3.1</text>
</svg>
<figcaption><b>AutoRec</b> An autoencoder squeezes a partly observed rating vector through a narrow code and reconstructs it; the values it invents at the empty positions become its recommendations.</figcaption>
</figure>

Formally, for an item's rating vector $\mathbf{r}$ the model reconstructs

$$
h(\mathbf{r};\theta) = f\!\big(W \cdot g(V\mathbf{r} + \boldsymbol{\mu}) + \mathbf{b}\big),
$$

and training minimizes reconstruction error **only over observed ratings**,

$$
\min_{\theta}\; \sum_{i}\big\lVert \mathbf{r}^{(i)} - h(\mathbf{r}^{(i)};\theta)\big\rVert_{\mathcal{O}}^{2}
\;+\; \tfrac{\lambda}{2}\big(\lVert W\rVert_F^2 + \lVert V\rVert_F^2\big).
$$

The subscript $\mathcal{O}$ matters enormously: users with no rating are excluded
from backpropagation, so the missing entries never pollute the gradient. There
are two flavors — **I-AutoRec**, which builds one autoencoder per item, and
**U-AutoRec**, which does the same per user — but the machinery is identical. The
lesson is quiet but deep: the learning signal here is the input itself.

## Teaching a Model to Speak, Then to Listen

Large language models rest on the **distributional hypothesis** — "the meaning of
a word is given by the company it keeps." Words that appear in similar contexts
get similar vector representations, which is why arithmetic over embeddings can
capture analogy and sentiment. But a raw language model is not yet an assistant.
Getting there takes three stages.

<figure>
<svg viewBox="0 0 780 210" role="img" aria-label="Three-stage LLM pipeline: pretraining on raw text, supervised instruction tuning, then reinforcement learning from human feedback, each supplying a different learning signal.">
  <defs>
    <marker id="arw-llmpipe" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" class="dgm-fill"/>
    </marker>
  </defs>
  <text x="386" y="30" text-anchor="middle" font-size="12" class="dgm-muted">raw predictor  →  helpful, aligned assistant</text>
  <rect x="14" y="60" width="224" height="86" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="126" y="92" text-anchor="middle" font-size="14" font-weight="700">1 · Pretraining</text>
  <text x="126" y="116" text-anchor="middle" font-size="11" class="dgm-muted">next-token · cross-entropy</text>
  <text x="126" y="176" text-anchor="middle" font-size="11">signal: the corpus</text>
  <line x1="238" y1="103" x2="270" y2="103" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-llmpipe)"/>
  <rect x="274" y="60" width="224" height="86" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="386" y="92" text-anchor="middle" font-size="14" font-weight="700">2 · Instruction Tuning</text>
  <text x="386" y="116" text-anchor="middle" font-size="11" class="dgm-muted">SFT · instruction–response</text>
  <text x="386" y="176" text-anchor="middle" font-size="11">signal: demonstrations</text>
  <line x1="498" y1="103" x2="530" y2="103" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-llmpipe)"/>
  <g class="dgm-accent">
    <rect x="534" y="60" width="224" height="86" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <text x="646" y="92" text-anchor="middle" font-size="14" font-weight="700">3 · Preference Alignment</text>
    <text x="646" y="116" text-anchor="middle" font-size="11">RLHF · reward model</text>
  </g>
  <text x="646" y="176" text-anchor="middle" font-size="11">signal: human preference</text>
</svg>
<figcaption><b>The three-stage pipeline</b> Pretraining learns from the corpus, instruction tuning from demonstrations, and RLHF from human preference — each stage moves the learning signal closer to a person.</figcaption>
</figure>

**Pretraining** is self-supervised: the model reads enormous text corpora and
repeatedly predicts the next token, updating weights to minimize **cross-entropy
loss**. For a full sequence that objective is

$$
\mathcal{L} = -\sum_{t} \log p_\theta\big(x_t \mid x_{<t}\big).
$$

Cross-entropy punishes confident errors hardest. Consider a three-way choice —
cat, dog, bird — where the truth is "cat." A confident, correct prediction of
$0.9$ costs only $-\log 0.9 \approx 0.11$, while a confident *wrong* prediction
that assigns cat just $0.1$ costs $-\log 0.1 \approx 2.30$. That asymmetry is the
engine of learning — but it also explains **hallucination**: the objective
rewards text that is *predictable and coherent*, never text that is *true*.

**Instruction tuning** (supervised fine-tuning) then trains the model on curated
instruction–response pairs. The difference is stark. Asked to "Translate to
French: Hello, how are you?", a base model rambles about France being a Romance
language; an instruction-tuned model simply answers *"Bonjour, comment
allez-vous?"* Finally, **preference alignment** maximizes helpfulness and
minimizes harm — the stage that teaches a model to refuse a request for
explosives rather than comply.

Layered on top is **in-context learning**: zero-shot and few-shot prompting, and
the hidden system prompt prepended to every conversation. None of it updates a
single weight; the behavior lives entirely in the prompt.

## Learning by Trial and Reward

**Reinforcement learning** replaces the labeled dataset with an environment. An
agent observes a **state**, chooses an **action** from a known action space, and
receives a **reward**; its goal is to maximize cumulative reward,

$$
G_t = \sum_{k=0}^{\infty} \gamma^k\, r_{t+k+1}.
$$

The agent's behavior is governed by a **policy** $\pi(a \mid s)$ — expressible as
rules, probabilities, or a table of expected rewards. The core routine is a loop:

```text
observe state s
select action a via policy   # balance exploration vs. exploitation
execute a, receive reward r
store experience (s, a, r, s')
update policy to increase future reward
```

<figure>
<svg viewBox="0 0 620 200" role="img" aria-label="The reinforcement-learning loop: an agent sends an action to the environment, which returns the next state and a reward.">
  <defs>
    <marker id="arw-rlloop" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" class="dgm-fill"/>
    </marker>
  </defs>
  <rect x="40" y="58" width="164" height="92" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="122" y="98" text-anchor="middle" font-size="16" font-weight="700">Agent</text>
  <text x="122" y="122" text-anchor="middle" font-size="11" class="dgm-muted">policy π(a | s)</text>
  <rect x="416" y="58" width="164" height="92" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="498" y="110" text-anchor="middle" font-size="16" font-weight="700">Environment</text>
  <text x="310" y="72" text-anchor="middle" font-size="12">action aₜ</text>
  <line x1="208" y1="84" x2="412" y2="84" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-rlloop)"/>
  <g class="dgm-accent">
    <line x1="412" y1="124" x2="208" y2="124" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-rlloop)"/>
    <text x="310" y="144" text-anchor="middle" font-size="12">state sₜ₊₁ · reward rₜ₊₁</text>
  </g>
</svg>
<figcaption><b>The agent–environment loop</b> The agent acts on the environment; the environment returns the next state and a reward, and that reward — not any labeled answer — is the learning signal.</figcaption>
</figure>

That loop surfaces two distinctions the lecture stressed. First, the
**exploration–exploitation dilemma**: an agent must exploit actions known to pay
off while still trying unfamiliar ones that might pay off more. Second, and
subtler, the gap between a **reward function** and a **value function**. A reward
says what is good *right now*; a value estimates what is good *in the long run*,

$$
v_\pi(s) = \mathbb{E}_\pi\big[G_t \mid S_t = s\big].
$$

In the word game Semantle, a guess's similarity score is its immediate reward,
but proximity to the hidden answer — how close you are to winning — is its value.
"We need highest value, not highest reward." A special, single-step case is the
**contextual bandit** used for recommendation: observe a context, pick an action,
observe an immediate click or purchase, update — no assumption that today's action
changes tomorrow's world.

## When the Reward Comes Last

What happens when the environment hands you no reward at all? That is the puzzle
**reinforcement learning from human feedback (RLHF)** solves, illustrated through
the task of summarization. First, collect human comparisons between pairs of
summaries for the same post. Train a **reward model** to predict which summary
people prefer — the standard formalization scores each candidate and sets

$$
P(y_1 \succ y_2) = \sigma\big(r_\phi(y_1) - r_\phi(y_2)\big).
$$

Then fine-tune the summarizer as a policy — with Proximal Policy Optimization —
to maximize that learned reward. Here the policy's "action" is choosing the next
token, and the reward arrives only after the *entire* summary is generated. That
is the delayed-reward structure of classic RL hiding inside a text task: early
tokens receive no immediate signal, and their contribution is judged only once the
sequence is complete — a genuine credit-assignment problem. The payoff, the paper
found, is summaries better aligned with human values than those produced by
supervised objectives or automatic metrics alone.

## Why It Matters

Read together, the three parts tell one story about where intelligence comes from
in these systems. An autoencoder learns from the structure of its own input; a
pretrained language model learns from the statistics of human text; an aligned
model learns from human judgment itself. Each step moves the training signal
closer to a person — and each step introduces a new risk, from the sparsity that
haunts recommenders, to the hallucinations baked into next-word prediction, to the
uncomfortable question of *whose* preferences a reward model actually encodes. The
machinery is now good enough that the hardest problems are no longer mathematical
but human: deciding what "good" means, and who gets to define it.
