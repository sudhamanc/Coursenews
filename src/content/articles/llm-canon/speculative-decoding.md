---
course: llm-canon
lectureId: "2022"
title: "Let the Small Model Do the Guessing"
deck: "Speculative Decoding (2022) — a small draft model proposes several tokens at once and the large model verifies them in a single pass, with a sampling rule that leaves its output distribution provably unchanged."
order: 28
readingTime: 11
tags: ["efficiency", "decoding", "inference", "sampling", "latency"]
concepts:
  - id: draft-model
    term: "Draft Model"
    definition: "A small, fast approximation model that proposes several candidate tokens ahead of the large target model."
  - id: parallel-verification
    term: "Parallel Verification"
    definition: "Scoring all drafted tokens in a single forward pass of the target model, which evaluates every position at once because the sequence is fixed rather than being sampled."
  - id: modified-rejection-sampling
    term: "Modified Rejection Sampling"
    definition: "The accept-or-resample rule that makes the accepted tokens provably identical in distribution to sampling from the target model directly, so the speedup costs no quality."
  - id: acceptance-rate
    term: "Acceptance Rate"
    definition: "The fraction of drafted tokens the target accepts; together with the draft-to-target cost ratio it sets the achievable speedup."
  - id: memory-bound-decoding
    term: "Memory-Bound Decoding"
    definition: "The condition in which each decode step is limited by loading the model's weights from memory rather than by computation, leaving arithmetic units idle — the slack speculative decoding exploits."
---

Autoregressive generation has a bottleneck that no amount of hardware can widen,
because it is made of dependencies rather than of work. Token $t+1$ cannot be
computed until token $t$ exists; the model must run forward once per token, in
strict sequence, and each of those runs loads the model's entire weight set out of
memory to produce a single word. On a large model the arithmetic units finish
almost instantly and then wait for the next weight load — the chip is mostly idle,
held back not by its compute but by the serial chain and the memory traffic
feeding it. In 2022 a Google Research team found a way to break the chain without
changing a single one of the model's outputs, and the trick reads like a
magician's: let a smaller, faster model guess what comes next, and use the big
model only to check the guesses.

## The Idle Machine

The setup is worth stating precisely, because it is the same diagnosis that runs
through this entire thread. A single decoding step of a large model is
**memory-bound**: its cost is dominated by streaming the weights, and the KV
cache, out of memory, and it performs very little arithmetic per byte it loads.
Crucially, the same weight load that produces one token's distribution could just
as easily score many positions at once — the arithmetic is nearly free once the
weights are on chip. The forward pass is run one token at a time only because of
the dependency, not because the hardware demands it. That spare capacity is the
opening.

## Draft, Then Verify

Speculative decoding exploits it in three moves. First, a small **draft model**
$q$ — a distilled version of the target, a smaller sibling, even a simple n-gram
model — generates a short run of $\gamma$ candidate tokens autoregressively. It is
cheap, so running it serially costs little. Second, the full **target model** $p$
takes the prefix plus all $\gamma$ drafted tokens and processes them in one forward
pass. Because the target is being asked to *score* a fixed sequence rather than to
*sample* the next token, every one of the $\gamma+1$ positions is evaluated
simultaneously — **parallel verification** on a single weight load.

<figure>
<svg viewBox="0 0 860 280" role="img" aria-label="A small draft model proposes four tokens one after another; the large target model verifies all four in a single parallel forward pass; the first two are accepted, the third is rejected and resampled, and the fourth is discarded.">
  <defs>
    <marker id="arw-spec" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" class="dgm-fill"/>
    </marker>
  </defs>
  <text x="375" y="24" text-anchor="middle" font-size="12" font-weight="700">1 · Draft model q proposes &#947; tokens serially</text>
  <rect x="121" y="44" width="58" height="28" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="150" y="63" text-anchor="middle" font-size="12">x1</text>
  <rect x="271" y="44" width="58" height="28" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="300" y="63" text-anchor="middle" font-size="12">x2</text>
  <rect x="421" y="44" width="58" height="28" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="450" y="63" text-anchor="middle" font-size="12">x3</text>
  <rect x="571" y="44" width="58" height="28" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="600" y="63" text-anchor="middle" font-size="12">x4</text>
  <line x1="179" y1="58" x2="271" y2="58" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-spec)"/>
  <line x1="329" y1="58" x2="421" y2="58" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-spec)"/>
  <line x1="479" y1="58" x2="571" y2="58" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-spec)"/>
  <line x1="150" y1="72" x2="150" y2="108" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-spec)"/>
  <line x1="300" y1="72" x2="300" y2="108" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-spec)"/>
  <line x1="450" y1="72" x2="450" y2="108" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-spec)"/>
  <line x1="600" y1="72" x2="600" y2="108" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-spec)"/>
  <g class="dgm-accent">
    <rect x="110" y="110" width="530" height="46" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <text x="375" y="138" text-anchor="middle" font-size="12">2 · Target p verifies all &#947; tokens in one parallel pass</text>
  </g>
  <line x1="150" y1="156" x2="150" y2="176" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-spec)"/>
  <line x1="300" y1="156" x2="300" y2="176" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-spec)"/>
  <line x1="450" y1="156" x2="450" y2="176" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-spec)"/>
  <line x1="600" y1="156" x2="600" y2="176" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-spec)"/>
  <text x="150" y="192" text-anchor="middle" font-size="11">accept</text>
  <text x="300" y="192" text-anchor="middle" font-size="11">accept</text>
  <g class="dgm-accent"><text x="450" y="192" text-anchor="middle" font-size="11">reject</text></g>
  <text x="600" y="192" text-anchor="middle" font-size="11" class="dgm-muted">discard</text>
  <text x="450" y="208" text-anchor="middle" font-size="11" class="dgm-muted">resample x3&#8242; from p</text>
  <rect x="110" y="228" width="530" height="34" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="375" y="250" text-anchor="middle" font-size="12">output: x1 · x2 · x3&#8242;   (+1 free token if all accepted)</text>
</svg>
<figcaption><b>Guess, then check in bulk.</b> The draft model spends cheap serial steps proposing tokens; the target checks them all in one pass and accepts a prefix, resampling at the first disagreement.</figcaption>
</figure>

The third move is the one that makes the method honest. A naive scheme would keep
the drafted tokens whenever they looked plausible, which would subtly change the
model's output distribution. Instead the paper uses a **modified rejection
sampling** rule. For each drafted token $x$, accept it with probability
$\min\!\left(1, \frac{p(x)}{q(x)}\right)$. If it is rejected, discard it and every
token after it, and resample that position from the normalized residual
distribution proportional to $\max\!\left(0,\, p(x) - q(x)\right)$. The paper
proves that tokens produced this way are distributed *exactly* as if they had been
sampled from the target model directly. There is a small bonus baked in: if all
$\gamma$ drafts are accepted, the target's own prediction at the final position
comes free from the same pass, so a fully-accepted round yields $\gamma+1$ tokens.

## A Speedup You Don't Pay for in Quality

On translation and summarization with T5 and other models, this produced a
two-to-three-times wall-clock speedup with output distributions provably
unchanged — no retraining of the target, no architecture change, nothing lost. The
size of the win is governed by two numbers: the **acceptance rate** $\alpha$, or
how often the draft agrees with the target, and the cost ratio between the two
models. A well-matched draft that the target usually accepts turns many serial
steps into one; a poorly matched draft is rejected constantly and can end up
slower than plain decoding, because the verification passes become pure overhead.
Larger $\gamma$ helps when acceptance is high and hurts when it is low.

## The Limits of Guessing

The method's dependence on a good draft is its main fragility. You have to find or
train a small model that mimics the large one closely, which is not free, and you
have to keep both in memory. The gains also erode at large batch sizes: batching
many requests together already gives the GPU enough parallel work to be
compute-bound, so the idle capacity speculation feeds on disappears. And greedy,
non-sampling decoding needs its own variant of the acceptance rule.

## Why It Matters

Speculative decoding established the template for *lossless* inference
acceleration — the principle that "faster" need not mean "worse," which had not
been obvious. It spawned a whole family that removes the separate draft model:
Medusa attaches extra prediction heads to the target, EAGLE drafts in feature
space, lookahead decoding runs a Jacobi iteration, and prompt-lookup drafting
exploits tasks that copy heavily from their input. Its importance has only grown
with the rise of reasoning models, which must emit tens of thousands of thinking
tokens to answer a single question; when the length of a generation becomes the
product, the per-token cost of that generation is the business, and speculative
decoding is one of the few ways to cut it without touching the model's answers. It
is the same lesson as the rest of this thread, seen from the decoding side: the
hardware had compute to spare and was starved of a way to use it.

## Lineage

- **Builds on:** [Attention Is All You Need](/courses/llm-canon/attention-is-all-you-need), whose autoregressive decoder creates the serial bottleneck this method routes around.
- **Leads to:** [Test-Time Scaling](/courses/llm-canon/test-time-scaling), whose long reasoning generations depend on exactly this kind of cheap, lossless token throughput.
