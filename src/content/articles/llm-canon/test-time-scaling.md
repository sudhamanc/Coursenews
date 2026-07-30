---
course: llm-canon
lectureId: "2024"
title: "The Second Scaling Law"
deck: "Test-Time Scaling (2024, anchored on s1 alongside OpenAI's o1 and DeepSeek-R1) — the finding that accuracy climbs predictably with the tokens a model is allowed to think, a scaling axis bought at inference rather than training."
order: 36
readingTime: 12
tags: ["inference-compute", "reasoning", "scaling", "test-time-compute", "budget-forcing"]
concepts:
  - id: test-time-scaling
    term: Test-Time Scaling
    definition: "Improving performance by spending more computation at inference — letting a model generate more reasoning tokens before answering — as a scaling axis independent of model size."
  - id: budget-forcing
    term: Budget Forcing
    definition: "A decoding-time control that caps thinking by force-stopping at a token budget, or extends it by suppressing the stop token and appending the word Wait to make the model reconsider."
  - id: sequential-parallel
    term: Sequential vs Parallel Scaling
    definition: "Two ways to spend inference compute — one long, self-correcting chain versus many independent samples voted together; s1 found sequential scaling wins at matched compute."
  - id: superficial-alignment
    term: Superficial Alignment Hypothesis
    definition: "The idea that a capability such as reasoning is already latent from pretraining and a tiny fine-tune merely activates it — which explains why a thousand examples suffice."
  - id: thinking-tokens
    term: Thinking Tokens
    definition: "The reasoning tokens a model emits before its final answer; their number is the dial that trades inference cost for accuracy."
---

For a decade the recipe for a better model was to make it bigger: more parameters,
more data, more training compute, with the loss falling along a predictable curve.
Then, in late 2024, OpenAI's o1 did something that broke the frame. It got better at
reasoning not by growing but by *thinking longer* — spending more computation at the
moment of answering — and it published a scaling curve to prove the effect was
smooth and real. What it did not publish was how. The open question hanging over the
field was stark: is this a second scaling law, or a proprietary trick? A small team
across Stanford, the University of Washington, and the Allen Institute answered it
with a model called **s1**, and the answer was that the mechanism is almost
embarrassingly simple.

## An Open Curve

o1 established the phenomenon and hid the method. That left two possibilities. Either
inference-time reasoning was an exotic capability that only enormous reinforcement-
learning runs could produce, or it was something a small lab could reproduce cheaply.
s1 was built to find out — and to do it in the open, with a released model, dataset,
and recipe.

## The s1 Recipe

The training set, **s1K**, is a thousand examples. It was distilled down from an
initial pool of fifty-nine thousand questions by insisting on the *intersection* of
three properties: **difficulty** (throw out anything a small model already answers
correctly), **diversity** (spread the survivors across fifty subject domains using a
taxonomy), and **quality** (drop malformed reasoning traces). The reasoning traces
themselves were distilled from a strong existing reasoning model. Ablations show that
selecting on any one criterion alone — random, diversity-only, or difficulty-only —
performs markedly worse; the intersection is what carries the result.

Then the training: twenty-six minutes on sixteen H100 GPUs, fine-tuning an
off-the-shelf Qwen2.5-32B-Instruct. That is the entire cost. The reason so little
works is the **superficial alignment hypothesis**, imported from the LIMA paper: the
reasoning ability was already present after pretraining on trillions of tokens, and a
tiny fine-tune does not *teach* it so much as *switch it on*.

## Budget Forcing

The second ingredient is a decoding-time control the authors call **budget forcing**,
and it is two operations of almost comic crudeness. To enforce an upper bound, *force
stop*: once the model exceeds its allotted thinking-token budget, append the
end-of-thinking delimiter and prompt for the final answer, making it commit. To push
it further, *force continue*: when the model tries to end its reasoning, suppress the
stop token and append a single word — **"Wait."** The model, seeing that word, tends
to re-examine its own work and catch its own mistakes.

<figure>
<svg viewBox="0 0 820 300" role="img" aria-label="Accuracy rising with thinking-token budget: a solid curve climbs to the model's unforced stopping point near fifty percent, and a highlighted dashed extension driven by budget forcing appends the word Wait to keep the model thinking, pushing accuracy higher toward fifty-seven percent before it saturates at a budget cap.">
  <defs>
    <marker id="arw-tts" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" class="dgm-fill"/>
    </marker>
  </defs>
  <line x1="96" y1="246" x2="96" y2="44" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-tts)"/>
  <line x1="96" y1="246" x2="748" y2="246" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-tts)"/>
  <text transform="rotate(-90 32 150)" x="32" y="150" text-anchor="middle" font-size="12">accuracy</text>
  <text x="410" y="278" text-anchor="middle" font-size="12">thinking-token budget</text>
  <line x1="96" y1="150" x2="520" y2="150" stroke="currentColor" stroke-width="1" stroke-dasharray="3 3" class="dgm-muted"/>
  <text x="86" y="154" text-anchor="end" font-size="10.5" class="dgm-muted">50%</text>
  <line x1="96" y1="104" x2="662" y2="104" stroke="currentColor" stroke-width="1" stroke-dasharray="3 3" class="dgm-muted"/>
  <text x="86" y="108" text-anchor="end" font-size="10.5" class="dgm-muted">57%</text>
  <path d="M116 216 C 240 152 380 150 520 150" fill="none" stroke="currentColor" stroke-width="1.8"/>
  <circle cx="520" cy="150" r="4" class="dgm-fill"/>
  <line x1="520" y1="150" x2="520" y2="246" stroke="currentColor" stroke-width="1" stroke-dasharray="3 3" class="dgm-muted"/>
  <text x="520" y="262" text-anchor="middle" font-size="10.5" class="dgm-muted">unforced stop</text>
  <g class="dgm-accent">
    <path d="M520 150 C 580 132 620 114 662 104" fill="none" stroke="currentColor" stroke-width="1.8" stroke-dasharray="5 3"/>
    <circle cx="662" cy="104" r="4" class="dgm-fill"/>
    <line x1="536" y1="146" x2="590" y2="126" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-tts)"/>
    <text x="600" y="120" text-anchor="start" font-size="10.5">append &#8216;Wait&#8217; &#8594; keep thinking</text>
  </g>
  <line x1="662" y1="104" x2="662" y2="246" stroke="currentColor" stroke-width="1" stroke-dasharray="3 3" class="dgm-muted"/>
  <text x="662" y="262" text-anchor="middle" font-size="10.5" class="dgm-muted">budget cap</text>
</svg>
<figcaption><b>A second scaling curve.</b> Accuracy rises with the thinking-token budget to the model's unforced ceiling; budget forcing then suppresses the stop token and appends "Wait," extending the curve past that ceiling until it saturates.</figcaption>
</figure>

## Sequential Beats Parallel

The most important empirical claim is about *how* to spend the extra compute. There
are two options: **sequential scaling**, forcing a single chain to run longer and
correct itself, or **parallel scaling**, sampling many independent chains and taking a
majority vote. At matched compute, s1 found sequential scaling wins — one long,
self-revising chain beats a committee of short ones. Budget forcing on the AIME24 math
competition lifted accuracy from 50% to 57%, pushing the model *past its own unforced
ceiling*. In an independent study, Snell and colleagues reported that for many
problems, optimally allocated test-time compute beats a model fourteen times larger.

## Why It Matters

This is a second scaling law, and it runs orthogonal to Chinchilla's. Chinchilla told
you how to trade parameters against training tokens; test-time scaling adds a third
knob — how long to think per question — that you turn *after* training, per query. The
consequence reshapes the industry's economics: inference, not training, becomes the
dominant cost center for frontier capability, which is precisely why the efficiency
literature — speculative decoding, paged attention, KV-cache tricks — suddenly matters
so much more. It also changes the product surface, turning "thinking budget" into a
dial the user can turn.

The limits are real and worth stating plainly. Budget forcing flattens out: suppress
the stop token too many times — the paper reports saturation around six forced
continuations — and the model loops rather than reasons. Because s1's traces are
distilled from a stronger teacher, the recipe shows how to *transfer* the capability
cheaply, not how to *create* it from scratch. And the whole approach lives in
verifiable domains — math and code, where an answer can be checked — with cost and
latency per query rising sharply and gains that are far from uniform across problem
types. Making the underlying training itself cheaper is the pressure that pushes the
story toward the optimizer.

## Lineage

- **Builds on:** [Chain-of-Thought](/courses/llm-canon/chain-of-thought) for thinking in tokens and [Tree of Thoughts](/courses/llm-canon/tree-of-thoughts) for search, [GRPO](/courses/llm-canon/grpo) for the reinforcement-learning route to the same behavior, and [Speculative Decoding](/courses/llm-canon/speculative-decoding) with [PagedAttention (vLLM)](/courses/llm-canon/paged-attention-vllm), which make long generations affordable.
- **Leads to:** [Muon](/courses/llm-canon/muon) and the renewed interest in optimizers that make the underlying training cheaper, as inference-heavy reasoning models raise the value of every saved training dollar.
