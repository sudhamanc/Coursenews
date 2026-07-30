---
course: llm-canon
lectureId: "2022"
title: "The Models Were Too Big"
deck: "Training Compute-Optimal Large Language Models (2022) — DeepMind's Chinchilla showed the GPT-3 generation was oversized and starved of data, and that for a fixed compute budget, parameters and tokens should grow in step."
order: 8
readingTime: 11
tags: ["scaling", "compute-optimal", "scaling-laws", "training", "deepmind"]
concepts:
  - id: compute-optimal-scaling
    term: Compute-Optimal Scaling
    definition: "Allocating a fixed training budget so that final loss is minimized — which, for transformers, means growing parameters and training tokens together rather than pouring compute into size alone."
  - id: isoflop-analysis
    term: IsoFLOP Analysis
    definition: "Fixing a compute budget, sweeping model sizes trained to use exactly that budget, and reading off the size that minimizes loss; the minima across budgets trace the optimal frontier."
  - id: tokens-per-parameter
    term: Tokens per Parameter
    definition: "The ratio of training tokens to model parameters; Chinchilla found roughly twenty tokens per parameter to be compute-optimal, far more data per weight than the GPT-3 generation used."
  - id: parametric-loss-law
    term: Parametric Loss Law
    definition: "The fitted surface L(N, D) = E + A/Nᵅ + B/Dᵝ describing loss as a function of parameters N and tokens D, which can be minimized analytically under a compute constraint."
  - id: training-inference-optimal
    term: Training vs Inference Optimal
    definition: "Chinchilla optimizes the compute to train a model once; a model served billions of times is instead best made smaller and trained past the Chinchilla point to cut serving cost."
---

For two years the largest language models were built on a single, confidently
held belief: given more compute, spend it on parameters. The 2020 scaling laws
out of OpenAI had said so, and the industry obliged with a procession of
ever-larger models — GPT-3 at 175 billion parameters, Gopher at 280,
Megatron-Turing at 530 — each trained on a few hundred billion tokens. In 2022 a
team at DeepMind reran the experiment with more care and reported that the entire
generation had been built wrong. The giants were not too powerful; they were too
big for the amount of data they had seen. Trained correctly, a model a quarter of
the size could beat all of them.

## The Belief That Bigger Was the Point

The earlier scaling study had concluded that, of the two ways to spend compute,
parameters mattered far more than data — so the field poured its budgets into
size. But that study contained a quiet methodological flaw. Its learning-rate
schedule did not match the number of tokens each model actually trained on, which
systematically distorted the loss of the shorter runs and made parameters look
more valuable than they were. Nobody had rerun the sweep carefully, with the
cosine schedule length set to each run's true token count.

## Three Roads to One Answer

Chinchilla's authors did, and they did it three independent ways — which is what
makes the result convincing, because all three converge on the same number.

The first fixes each model size and varies the token budget, then reads the
optimal point off the resulting loss envelope. The second is **IsoFLOP
analysis**: fix a compute budget, sweep model sizes trained to consume exactly
that budget, and find the size that bottoms out the loss. The third fits a
**parametric loss law** to every run and minimizes it analytically. Across more
than four hundred models spanning 70 million to 16 billion parameters and 5
billion to 500 billion tokens, the answer held.

<figure>
<svg viewBox="0 0 820 320" role="img" aria-label="IsoFLOP curves: for each fixed compute budget, training loss traces a U-shape as model size varies, with a distinct minimum; the minima of successive budgets move up and to the right, tracing the compute-optimal frontier along which parameters and tokens grow together.">
  <defs>
    <marker id="arw-chinchilla" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" class="dgm-fill"/>
    </marker>
  </defs>
  <line x1="72" y1="250" x2="762" y2="250" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-chinchilla)"/>
  <line x1="72" y1="250" x2="72" y2="42" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-chinchilla)"/>
  <text x="420" y="282" text-anchor="middle" font-size="12">Model size N  (log-scale parameters)</text>
  <text x="26" y="150" text-anchor="middle" font-size="12" transform="rotate(-90 26 150)">Training loss</text>
  <path d="M130,100 Q225,200 330,100" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <path d="M240,86 Q365,196 490,96" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <path d="M420,74 Q560,190 700,88" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="352" y="103" text-anchor="start" font-size="10" class="dgm-muted">6&#215;10&#178;&#185;</text>
  <text x="504" y="98" text-anchor="start" font-size="10" class="dgm-muted">10&#178;&#178;</text>
  <text x="706" y="90" text-anchor="start" font-size="10" class="dgm-muted">6&#215;10&#178;&#178;</text>
  <g class="dgm-accent">
    <circle cx="227" cy="150" r="4" class="dgm-fill"/>
    <circle cx="365" cy="143" r="4" class="dgm-fill"/>
    <circle cx="560" cy="135" r="4" class="dgm-fill"/>
    <path d="M227,150 L365,143 L560,135 L648,131" fill="none" stroke="currentColor" stroke-width="1.5" stroke-dasharray="5 3" marker-end="url(#arw-chinchilla)"/>
    <text x="470" y="118" text-anchor="middle" font-size="11.5" font-weight="700">compute-optimal frontier</text>
  </g>
  <text x="470" y="304" text-anchor="middle" font-size="10" class="dgm-muted">each curve = one FLOP budget · its minimum gives the optimal N (and hence D)</text>
</svg>
<figcaption><b>IsoFLOP curves.</b> For each fixed compute budget, loss traces a U in model size; the minima (red) march up and to the right, so optimal parameters and tokens both grow with compute — about twenty tokens per parameter.</figcaption>
</figure>

The crucial arithmetic is simple. Training compute scales as

$$
C \;\approx\; 6\,N\,D,
$$

for $N$ parameters and $D$ tokens, while loss follows the fitted surface

$$
L(N, D) \;=\; E \;+\; \frac{A}{N^{\alpha}} \;+\; \frac{B}{D^{\beta}}.
$$

Minimizing $L$ subject to the constraint $C = 6ND$ gives optimal settings that
each scale as roughly the square root of the budget, $N_{\text{opt}} \propto
C^{0.5}$ and $D_{\text{opt}} \propto C^{0.5}$. Because both grow at the same rate,
their ratio stays fixed — and that ratio comes out near twenty.

## Twenty Tokens to the Parameter

That single number is the paper's headline: about twenty training **tokens per
parameter** is compute-optimal. By that yardstick the whole GPT-3 generation was
starved — GPT-3 saw closer to two tokens per parameter, an order of magnitude
short. To prove the point, the authors reallocated a fixed budget: instead of
DeepMind's 280-billion-parameter Gopher, they trained a 70-billion-parameter
model, named Chinchilla, on 1.4 trillion tokens, for the same total compute.

## The Confirmation

Chinchilla, at one quarter of Gopher's size, beat it across the board — and also
outperformed GPT-3, Jurassic-1, and the 530-billion-parameter Megatron-Turing,
posting 67.5% on the MMLU knowledge benchmark. A model that small beating models
that large was startling, and the corollary was immediately practical: it is also
four times cheaper to serve.

## Why It Matters

This is arguably the single most consequential correction in the field's short
history. It redirected billions of dollars of compute overnight, reframed the
competitive bottleneck from raw scale to the acquisition of high-quality data,
and made smaller-but-better-trained models the default. Every training budget
planned after 2022 was planned against the Chinchilla ratio.

Its limits point directly at what came next. Chinchilla optimizes **training**
compute only. If you intend to serve a model billions of times, the total cost is
dominated by inference, and the right move is a smaller model trained far past the
Chinchilla point — the **training- versus inference-optimal** distinction that
LLaMA made its thesis. The analysis also assumes data is abundant; at frontier
scale, high-quality tokens have themselves become the binding constraint, pushing
the field back toward careful repetition, synthetic data, and multi-epoch
training.

## Lineage

- **Builds on:** [Scaling Laws](/courses/llm-canon/scaling-laws), rerun with matched schedules, and [GPT-3](/courses/llm-canon/gpt-3), the oversized model it corrected.
- **Leads to:** [LLaMA](/courses/llm-canon/llama), which accepts Chinchilla's analysis and then deliberately overtrains past it because serving cost dominates a model's life.
