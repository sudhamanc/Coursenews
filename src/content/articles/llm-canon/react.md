---
course: llm-canon
lectureId: "2022"
title: "The Loop Behind Every Agent"
deck: "ReAct (2022) — the schema that interleaves reasoning with tool calls, letting a model think, act, observe the result, and think again, and that now underlies essentially every agent framework."
order: 34
readingTime: 11
tags: ["inference-compute", "agents", "tool-use", "reasoning", "grounding"]
concepts:
  - id: thought-action-observation
    term: Thought–Action–Observation Loop
    definition: "ReAct's core cycle: the model writes a free-form thought, emits an action from a small action space, reads the environment's observation, then reasons again — repeating until it finishes."
  - id: interleaving
    term: Interleaved Reasoning and Acting
    definition: "Alternating reasoning and tool use within a single trace, so that reasoning plans the next action and each observation, in turn, corrects the reasoning."
  - id: grounding-observation
    term: Grounding Through Observation
    definition: "Feeding real results from a tool or environment back into the context, which reins in the hallucination that closed-loop reasoning is prone to."
  - id: action-space
    term: Action Space
    definition: "The small set of task-specific operations a model may call — for knowledge tasks, search, lookup, and finish — kept deliberately minimal so the value comes from interleaving, not tool sophistication."
  - id: agent-trace
    term: Interpretable Agent Trace
    definition: "The readable record of thoughts, actions, and observations, which makes an agent's behavior legible: you can see where it went wrong and edit the thought."
---

Chain-of-thought taught models to reason, but it reasons in a sealed room. The
model spins out a beautiful line of argument with no way to check any of it against
the world, so when it needs a fact it does not have, it invents one — and an error
made in step two rides untouched all the way to the conclusion. The opposite kind
of system, an agent that only ever emits actions, has the reverse problem: it can
click and query and fetch, but it does not stop to plan, so it flails on anything
requiring a few steps of thought. In 2022 a team from Princeton and Google Research
noticed that these two failure modes are mirror images, and that the fix was to let
a single model do both — to **reason and act** in the same breath.

## Two Half-Solutions

Reasoning without acting hallucinates; acting without reasoning cannot plan. The
insight of **ReAct** — the name compresses *reason* and *act* — is that each
supplies exactly what the other lacks. Reasoning decides which action is worth
taking and how to interpret what comes back; acting injects real observations that
keep the reasoning honest. Neither is a component bolted onto the other. They are
interleaved into one continuous trace.

## The Loop

Concretely, the model is shown a few examples of a repeating three-beat pattern and
then continues it. A **Thought** is free-form reasoning about what to do next. An
**Action** is a single call drawn from a small, task-specific **action space**. An
**Observation** is whatever the environment returns, pasted back into the context
for the model to read. Then the cycle repeats — think, act, observe — until the
model emits a finishing action with its answer.

<figure>
<svg viewBox="0 0 820 300" role="img" aria-label="The ReAct loop: a thought leads to an action, the action calls a tool or environment, the environment returns an observation, and the observation grounds the next thought; the cycle repeats until the model emits a finish action with an answer.">
  <defs>
    <marker id="arw-react" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" class="dgm-fill"/>
    </marker>
  </defs>
  <rect x="40" y="48" width="160" height="60" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="120" y="80" text-anchor="middle" font-size="13" font-weight="700">Thought</text>
  <text x="120" y="98" text-anchor="middle" font-size="10.5" class="dgm-muted">plan next step</text>
  <line x1="200" y1="78" x2="264" y2="78" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-react)"/>
  <g class="dgm-accent">
    <rect x="266" y="48" width="150" height="60" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <text x="341" y="80" text-anchor="middle" font-size="13" font-weight="700">Action</text>
    <text x="341" y="98" text-anchor="middle" font-size="10.5" class="dgm-muted">search[entity]</text>
  </g>
  <line x1="416" y1="78" x2="520" y2="78" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-react)"/>
  <rect x="522" y="48" width="180" height="60" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="612" y="76" text-anchor="middle" font-size="12.5" font-weight="700">Tool / Environment</text>
  <text x="612" y="94" text-anchor="middle" font-size="10.5" class="dgm-muted">Wikipedia API</text>
  <line x1="612" y1="108" x2="612" y2="186" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-react)"/>
  <rect x="522" y="188" width="180" height="60" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="612" y="216" text-anchor="middle" font-size="12.5" font-weight="700">Observation</text>
  <text x="612" y="234" text-anchor="middle" font-size="10.5" class="dgm-muted">returned result</text>
  <rect x="266" y="188" width="150" height="60" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="341" y="216" text-anchor="middle" font-size="12.5" font-weight="700">Answer</text>
  <text x="341" y="234" text-anchor="middle" font-size="10.5" class="dgm-muted">finish[answer]</text>
  <path d="M341 108 L341 186" fill="none" stroke="currentColor" stroke-width="1.3" stroke-dasharray="4 3" marker-end="url(#arw-react)"/>
  <text x="352" y="150" text-anchor="start" font-size="10.5" class="dgm-muted">when done</text>
  <path d="M522 248 L522 266 L120 266 L120 110" fill="none" stroke="currentColor" stroke-width="1.3" stroke-dasharray="4 3" marker-end="url(#arw-react)"/>
  <text x="320" y="282" text-anchor="middle" font-size="10.5" class="dgm-muted">each observation grounds the next thought</text>
</svg>
<figcaption><b>The thought–action–observation loop.</b> Reasoning chooses an action, the action queries a tool or environment, the observation returns and grounds the next thought; the loop repeats until the model finishes with an answer.</figcaption>
</figure>

## What the Thoughts Are For

The actions themselves are deliberately spare. For knowledge tasks the entire
repertoire is `search[entity]`, `lookup[string]`, and `finish[answer]` against a
Wikipedia API. The point was never tool sophistication; it was the interleaving.
The heavy lifting happens in the thoughts, which do work no single action could:
they decompose a goal into sub-goals, pull the relevant fact out of a noisy
observation, keep a running tally of progress, and handle exceptions — *that search
returned nothing, let me rephrase it* — while supplying commonsense the environment
never states. Thoughts change nothing in the world; they only shape the next
action. That division is what makes the trace both effective and legible.

## Grounding, and Knowing When to Fall Back

Tested on the multi-hop question benchmark HotpotQA and the fact-verification set
FEVER, ReAct sharply cut hallucination and error propagation relative to
chain-of-thought, and human raters judged its traces more trustworthy precisely
because they could follow them. The more consequential experiments were ALFWorld, a
text-based household simulator, and WebShop, a web-navigation and purchasing
environment. On both, ReAct beat imitation-learning and reinforcement-learning
baselines by wide margins using only one or two in-context examples — against
methods trained on thousands of episodes. That is the result that made this a paper
about *agents* rather than about question answering. The authors also found the best
strategy was a hybrid: run ReAct, and when it fails to reach an answer within its
step budget, fall back to plain chain-of-thought with self-consistency.

## Why It Matters

ReAct is the schema underneath essentially every agent framework built since. The
tool-use and function-calling APIs, the multi-step "agentic" products of 2025 and
2026, the orchestration libraries — nearly all of them implement some version of the
thought–action–observation loop. Just as important, it made agent behavior
**legible**: because the reasoning is written down interleaved with the actions, a
developer can read the trace, find the exact step where things went sideways, and
intervene. Grounding turned reasoning from a closed monologue into a conversation
with the world.

Its weaknesses are the ones inherent to a greedy line. The trajectory has no
backtracking, so one bad early action can commit the whole run to a dead end. The
context grows with every observation, and long tasks eventually overflow the window.
Performance leans heavily on the quality of the exemplars and the design of the
action space, and with no built-in notion of cost the loop can churn expensively.
Searching over trajectories instead of walking a single one is the natural next move.

## Lineage

- **Builds on:** [Chain-of-Thought](/courses/llm-canon/chain-of-thought) for the reasoning half, and [RAG](/courses/llm-canon/rag) for the retrieval half — recast from a fixed preprocessing step into an action the model decides to take.
- **Leads to:** [Tree of Thoughts](/courses/llm-canon/tree-of-thoughts), which searches over the trace instead of following one linear path, and the broader move toward [Test-Time Scaling](/courses/llm-canon/test-time-scaling).
