---
course: llm-canon
lectureId: "2023"
title: "The Reasoning That Learned to Backtrack"
deck: "Tree of Thoughts (2023) — the method that turns chain-of-thought's single path into a search tree, with the model evaluating its own partial thoughts while a classical algorithm explores, prunes, and backtracks."
order: 35
readingTime: 11
tags: ["inference-compute", "reasoning", "search", "planning", "self-evaluation"]
concepts:
  - id: deliberate-search
    term: Deliberate Search over Thoughts
    definition: "Exploring many partial reasoning paths as a tree rather than committing to one linear chain, so the model can look ahead, compare options, and revise a bad choice."
  - id: thought-decomposition
    term: Thought Decomposition
    definition: "Defining what a single thought is for a task — an equation, a plan, a word — granular enough to generate diverse candidates yet substantial enough to evaluate."
  - id: self-evaluation
    term: Self-Evaluation as a Value Function
    definition: "Using the language model to judge its own partial states — scoring each as sure, maybe, or impossible, or voting among them — in place of a separately trained value network."
  - id: search-backtracking
    term: Search and Backtracking
    definition: "Applying classical breadth- or depth-first search over language states, pruning states the evaluator marks hopeless and backing up to try alternatives when a path fails."
  - id: system1-system2
    term: System 1 vs System 2
    definition: "The cognitive-science framing behind the method: chain-of-thought is fast, associative reasoning, while deliberate problem solving needs slow, search-based deliberation."
---

Chain-of-thought reasons the way you speak without thinking: one word after
another, left to right, each committed the instant it is uttered. That is fine when
the first idea is the right one. It is disastrous when a problem needs you to try a
possibility, discover three steps later that it fails, and go back. A left-to-right
generator has no *back*. There is no lookahead, no comparison of alternatives, no
mechanism to undo a wrong turn — the very operations that hard planning and search
problems demand. In 2023 a team from Princeton and Google DeepMind gave language
reasoning those operations by borrowing the oldest idea in artificial intelligence:
search over a tree.

## System 1, System 2

The framing they reached for comes from cognitive science. Chain-of-thought behaves
like **System 1** — fast, fluent, associative, the kind of thinking that produces an
answer without deliberation. Genuinely hard problems call for **System 2**: slow,
deliberate reasoning that entertains multiple options, weighs them, and abandons the
ones that do not pan out. **Tree of Thoughts** is an attempt to give a language model
a System 2 by wrapping its System 1 generation inside an explicit search process.

## Four Design Decisions

The framework is not a single trick but four choices, each of which must be made per
task.

First, **thought decomposition**: decide what one "thought" *is*. It has to be small
enough that the model can generate several genuinely different candidates, and large
enough that it can be judged. For the arithmetic puzzle Game of 24 a thought is one
equation; for creative writing it is a paragraph-level plan; for a crossword it is a
single word.

Second, the **thought generator**. Either *sample* several independent thoughts from
a chain-of-thought prompt — good when the space is rich, like prose plans, so samples
naturally differ — or *propose* several in one call, better when the space is narrow
and independent samples would just repeat each other.

Third, the **state evaluator**, and here is the conceptual heart of the paper: the
language model judges its own partial states, with no trained value network anywhere.
It runs in one of two modes. In *value* mode it scores each state on its own — for
Game of 24, labeling a set of remaining numbers "sure," "maybe," or "impossible" for
reaching 24. In *vote* mode it compares states against each other and picks the most
promising, which works better when absolute scoring is ill-defined, as in judging
which story opening is best.

Fourth, the **search algorithm**. Plain breadth-first search keeps the best handful
of states at each level; plain depth-first search plunges ahead, prunes any state the
evaluator marks impossible, and backtracks when it hits a dead end. The search itself
is textbook; the novelty is that both the moves and the evaluation of positions are
language-model calls.

<figure>
<svg viewBox="0 0 820 300" role="img" aria-label="Tree of Thoughts search: a root state branches into candidate thoughts that the model evaluates as sure, maybe, or impossible; impossible branches are pruned, the model backtracks from dead ends, and the promising path is expanded until it reaches the goal.">
  <defs>
    <marker id="arw-tot" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" class="dgm-fill"/>
    </marker>
  </defs>
  <text x="410" y="30" text-anchor="middle" font-size="10.5" class="dgm-muted">start state</text>
  <circle cx="410" cy="50" r="18" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <line x1="396" y1="62" x2="212" y2="136" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-tot)"/>
  <line x1="424" y1="62" x2="606" y2="136" stroke="currentColor" stroke-width="1.5" stroke-dasharray="4 3" class="dgm-muted" marker-end="url(#arw-tot)"/>
  <g class="dgm-accent">
    <line x1="410" y1="68" x2="410" y2="130" stroke="currentColor" stroke-width="1.8" marker-end="url(#arw-tot)"/>
  </g>
  <circle cx="200" cy="148" r="18" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="224" y="152" text-anchor="start" font-size="10.5" class="dgm-muted">maybe</text>
  <g class="dgm-accent">
    <circle cx="410" cy="148" r="18" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <text x="434" y="152" text-anchor="start" font-size="10.5">sure</text>
  </g>
  <circle cx="620" cy="148" r="18" fill="none" stroke="currentColor" stroke-width="1.5" class="dgm-muted"/>
  <text x="620" y="153" text-anchor="middle" font-size="14" class="dgm-accent">&#10007;</text>
  <text x="644" y="152" text-anchor="start" font-size="10.5" class="dgm-muted">impossible</text>
  <g class="dgm-accent">
    <line x1="400" y1="164" x2="360" y2="230" stroke="currentColor" stroke-width="1.8" marker-end="url(#arw-tot)"/>
  </g>
  <line x1="420" y1="164" x2="470" y2="230" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-tot)"/>
  <g class="dgm-accent">
    <circle cx="350" cy="248" r="18" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <circle cx="350" cy="248" r="23" fill="none" stroke="currentColor" stroke-width="1.2"/>
    <text x="350" y="288" text-anchor="middle" font-size="11">= 24 &#10003;</text>
  </g>
  <circle cx="470" cy="248" r="18" fill="none" stroke="currentColor" stroke-width="1.5" class="dgm-muted"/>
  <text x="470" y="253" text-anchor="middle" font-size="14" class="dgm-accent">&#10007;</text>
  <path d="M488 244 L520 210 L446 168" fill="none" stroke="currentColor" stroke-width="1.3" stroke-dasharray="4 3" marker-end="url(#arw-tot)"/>
  <text x="540" y="212" text-anchor="start" font-size="10.5" class="dgm-muted">backtrack</text>
</svg>
<figcaption><b>Search over partial thoughts.</b> The model expands candidate thoughts, evaluates each as sure, maybe, or impossible, prunes the hopeless branches, backtracks from dead ends, and drives the promising path through to the goal.</figcaption>
</figure>

## The Result That Made the Case

The headline came from Game of 24, where you must combine four numbers with
arithmetic to make 24. GPT-4 prompted with chain-of-thought solved 4% of the puzzles.
The same GPT-4 wrapped in Tree of Thoughts solved 74%. The framework also lifted
coherence on creative writing, judged by voting, and cracked five-by-five mini
crosswords, a task where backtracking is not a nicety but a necessity. The gap
between 4% and 74% is the difference between a model that guesses a path and one that
searches for it.

## Why It Matters

Tree of Thoughts named a third axis of inference-time compute. After *retrieval*
(bringing in outside knowledge, as RAG does) and *depth* (thinking longer in a line,
as chain-of-thought does), it added *breadth*: exploring alternatives through search.
Its deepest contribution is conceptual — the demonstration that a language model can
serve as **its own value function**, judging the promise of a partial solution. That
idea is the bridge to process reward models and to the search-and-verify machinery
inside modern reasoning systems.

The costs and the caveats are large, and honesty about them matters. Searching a tree
can take fifty to a hundred times the model calls of a single chain, a steep price for
a benchmark gain. The self-evaluator is least reliable exactly where problems are
hardest, because judging partial progress is itself hard. And the decomposition has to
be hand-designed for every task. Most telling of all, the field has largely moved past
explicit external trees: reinforcement-learning-trained reasoning models learn to
backtrack *within* a single linear generation, folding the search inside the weights.
That is a genuine negative result for the framework as machinery — even as the ideas it
introduced, self-evaluation and deliberate search, live on inside the systems that
replaced it.

## Lineage

- **Builds on:** [Chain-of-Thought](/courses/llm-canon/chain-of-thought), generalized from a single chain to a tree, and [ReAct](/courses/llm-canon/react), whose insight that intermediate states can be inspected and acted on it turns into search.
- **Leads to:** [Test-Time Scaling](/courses/llm-canon/test-time-scaling), where deliberate search and self-evaluation become part of how models spend compute at inference — though often folded into a single generation rather than an explicit tree.
