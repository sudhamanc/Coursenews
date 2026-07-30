---
course: llm-canon
lectureId: "2022"
title: "Thinking Out Loud"
deck: "Chain-of-Thought Prompting (2022) — the discovery that simply showing a large model worked examples of step-by-step reasoning unlocks multi-step problems it otherwise fails completely, with no training at all."
order: 33
readingTime: 11
tags: ["inference-compute", "reasoning", "prompting", "emergence", "few-shot"]
concepts:
  - id: chain-of-thought
    term: Chain-of-Thought
    definition: "A prompting technique whose few-shot examples show intermediate reasoning steps, so the model generates its own step-by-step derivation before committing to a final answer."
  - id: intermediate-steps
    term: Intermediate Reasoning Steps
    definition: "The written-out sub-computations between question and answer that let a model decompose a multi-step problem instead of guessing the result in one shot."
  - id: serial-computation
    term: Serial Computation via Tokens
    definition: "Using generated tokens as external scratch memory, so a model can spend many forward passes on a single problem — buying depth of computation with output length."
  - id: emergent-ability
    term: Emergent Ability
    definition: "A capability absent in small models that appears relatively abruptly past a scale threshold; chain-of-thought helps only above roughly 100B parameters and can hurt below it."
  - id: self-consistency
    term: Self-Consistency
    definition: "Sampling many independent reasoning chains for the same question and taking the majority answer, which sharply improves accuracy over a single greedy chain."
---

By 2022 scale had produced language models that were dazzling at tasks you could
finish in one step and nearly useless at tasks that took several. A model that
could translate idioms and write passable code would reliably botch a grade-school
arithmetic word problem, because answering it meant tracking quantities across a
few sentences and doing the sums in order. Worse, the usual fix — make the model
bigger — did almost nothing here; the scaling curve on these problems was flat.
Then a team at Google Research found that the missing ingredient was not more
parameters or more training. It was permission to think out loud.

## The Flat Curve

Standard few-shot prompting gives a model a handful of solved examples, each a bare
`question → answer` pair, and then a new question. For single-step tasks this works
and improves with scale. For multi-step reasoning it stalls: bigger models were not
meaningfully better at arithmetic, symbolic manipulation, or multi-hop commonsense.
The problem was not that the knowledge was missing. It was that the format gave the
model no room to *use* it.

## A Change So Small It Looks Like Nothing

**Chain-of-thought prompting** alters exactly one thing. In each worked example,
the bare `question → answer` becomes `question → reasoning steps → answer` — the
solution is written out the way a patient teacher would show it, and then the model
imitates that format on the new question. Typically eight hand-written exemplars
are enough. There is no fine-tuning, no architecture change, no extra inference
machinery beyond letting the model generate a longer response. A word problem that
used to get a one-token guess now gets a paragraph that walks from the givens to
the result: *she starts with 5, buys 6 boxes of 3, so* $5 + 6 \times 3 = 23$ — and
the final number is far more often right.

## Why Tokens Buy Reasoning

The reason it works is almost mechanical. When a model emits a single answer token,
it has exactly one forward pass in which to compute everything. A hard problem may
simply need more sequential computation than one pass affords. Generating
intermediate steps lets the model **decompose** the problem and write partial
results into its own output, which then feed back in as context for the next step —
turning the token stream into scratch paper. In effect, the model buys extra serial
computation with length, using its own words as working memory it does not otherwise
have.

<figure>
<svg viewBox="0 0 860 230" role="img" aria-label="Standard prompting versus chain-of-thought: the standard path maps a question straight to a direct answer and often fails, while the chain-of-thought path emits several intermediate reasoning steps before the answer and succeeds on multi-step problems.">
  <defs>
    <marker id="arw-cot" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" class="dgm-fill"/>
    </marker>
  </defs>
  <text x="120" y="30" text-anchor="middle" font-size="11.5" class="dgm-muted">Standard prompting</text>
  <g class="dgm-muted">
    <rect x="14" y="44" width="90" height="44" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <text x="59" y="71" text-anchor="middle" font-size="12">Question</text>
    <line x1="104" y1="66" x2="150" y2="66" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-cot)"/>
    <rect x="152" y="44" width="150" height="44" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <text x="227" y="71" text-anchor="middle" font-size="12">direct answer</text>
    <line x1="302" y1="66" x2="346" y2="66" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-cot)"/>
    <text x="352" y="71" text-anchor="start" font-size="13">&#10007; ~18%</text>
  </g>
  <text x="120" y="132" text-anchor="middle" font-size="11.5" class="dgm-accent">Chain-of-thought</text>
  <g class="dgm-accent">
    <rect x="14" y="146" width="80" height="44" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <text x="54" y="173" text-anchor="middle" font-size="12">Question</text>
    <line x1="94" y1="168" x2="126" y2="168" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-cot)"/>
    <rect x="128" y="146" width="120" height="44" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <text x="188" y="172" text-anchor="middle" font-size="11">reasoning step</text>
    <line x1="248" y1="168" x2="268" y2="168" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-cot)"/>
    <rect x="270" y="146" width="120" height="44" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <text x="330" y="172" text-anchor="middle" font-size="11">reasoning step</text>
    <line x1="390" y1="168" x2="410" y2="168" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-cot)"/>
    <rect x="412" y="146" width="120" height="44" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <text x="472" y="172" text-anchor="middle" font-size="11">reasoning step</text>
    <line x1="532" y1="168" x2="552" y2="168" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-cot)"/>
    <rect x="554" y="146" width="104" height="44" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <text x="606" y="172" text-anchor="middle" font-size="12" font-weight="700">answer</text>
    <line x1="658" y1="168" x2="700" y2="168" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-cot)"/>
    <text x="706" y="173" text-anchor="start" font-size="13">&#10003; ~57%</text>
  </g>
</svg>
<figcaption><b>Two paths through the same model.</b> Standard prompting jumps straight to an answer and stalls on multi-step problems; chain-of-thought writes out intermediate steps first, and accuracy on tasks like GSM8K jumps from roughly 18% to 57%.</figcaption>
</figure>

## The Threshold

The effect has a sharp dependence on scale, and this is the paper's most striking
finding. Below roughly ten billion parameters, chain-of-thought prompting actually
*hurts* — small models produce reasoning that is fluent, confident, and wrong,
which drags them below their own direct-answer baseline. The gains appear only
around a hundred billion parameters, and when they appear they arrive suddenly
rather than gradually. This is a textbook **emergent ability**: a capability that
is essentially invisible at small scale and then switches on. On GSM8K, a benchmark
of grade-school math word problems, PaLM 540B with eight chain-of-thought exemplars
reached 56.9%, beating the previous best — a fine-tuned GPT-3 paired with a
specially trained answer verifier. Standard prompting on the very same model scored
around 18%.

## Many Chains Are Better Than One

A single chain can go wrong at any step, and once it does there is no recovery. The
companion idea, **self-consistency**, exploits the fact that there are many valid
routes to a correct answer but comparatively few routes to any particular wrong
one. Sample a whole population of independent chains, read off each one's final
answer, and take the majority vote. On PaLM 540B this pushed GSM8K from 56.9% to
74.4% — a large gain purchased entirely at inference time, with no change to the
model.

## Why It Matters

Chain-of-thought established that **inference-time computation is a capability lever
in its own right**, independent of training. It showed that a frontier model often
already contains the ability to solve a hard problem and merely needs to be given
room to work — a realization that redirected an enormous amount of subsequent
research. Every reasoning model that followed, from OpenAI's o1 to DeepSeek-R1, is a
descendant of this observation, with one crucial change: the reasoning behavior has
been moved out of the prompt and baked into the weights through reinforcement
learning, so the model produces long chains on its own.

The limits are equally consequential. A chain is not a faithful trace of the model's
actual computation — it can reach the right answer through invalid reasoning, or
sound rigorous while being wrong — so chains make poor explanations. Exemplars had
to be written by hand for each task, and every extra token costs latency. Above all,
a chain is a single line committed to left-to-right: an error early on propagates
with no mechanism to notice or undo it. Giving reasoning a way to branch, evaluate,
and backtrack is the problem the next paper takes up.

## Lineage

- **Builds on:** [GPT-3](/courses/llm-canon/gpt-3) for the in-context learning that makes few-shot prompting possible, and [PaLM](/courses/llm-canon/palm), whose scale is what let the effect emerge.
- **Leads to:** [Tree of Thoughts](/courses/llm-canon/tree-of-thoughts) (add search over thoughts), [ReAct](/courses/llm-canon/react) (add actions between thoughts), and [Test-Time Scaling](/courses/llm-canon/test-time-scaling), which turns thinking in tokens into a second scaling axis.
