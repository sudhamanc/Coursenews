---
course: bedrock
lectureId: AIMA 17
book: "Artificial Intelligence: A Modern Approach"
part: "IV · Uncertain Knowledge and Reasoning"
title: "Optimal Against What, Exactly?"
deck: "Once another agent is optimizing too, 'the best action' stops being well defined until you say what they will do. Chapter 17 works through equilibrium, coalition, and voting — and then formalizes the assistance game the fourth edition has been pointing at since page one."
order: 17
chapter: 17
readingTime: 14
tags: ["game-theory", "nash-equilibrium", "social-choice", "mechanism-design", "assistance-games"]
concepts:
  - id: multiagent-properties
    term: Multiagent Environments
    definition: "Environments where other agents optimize their own objectives. Decisions must account for others' reasoning, including their reasoning about your reasoning, and outcomes depend on joint rather than individual action."
  - id: nash-equilibrium
    term: Dominant Strategies and Nash Equilibrium
    definition: "A dominant strategy is best regardless of others' choices. A Nash equilibrium is a profile in which no agent gains by unilaterally deviating. Every finite game has at least one in mixed strategies, and equilibria can be collectively worse than available alternatives."
  - id: prisoners-dilemma
    term: The Prisoner's Dilemma
    definition: "The canonical case where individually rational play produces a jointly worse outcome. Defection dominates, mutual defection is the unique equilibrium, and mutual cooperation is better for both — which is why repetition and commitment devices matter."
  - id: mixed-strategies
    term: Mixed Strategies and Maximin
    definition: "Randomizing over actions, which is necessary for equilibrium in games like matching pennies. For two-player zero-sum games the maximin value equals the minimax value, so the equilibrium is unique in value and computable by linear programming."
  - id: repeated-games
    term: Repeated Games
    definition: "Repetition enables strategies conditioned on history, so cooperation can be sustained by the threat of future punishment. With an indefinite horizon, cooperative equilibria exist that a one-shot game forbids."
  - id: cooperative-game-theory
    term: Coalitions and the Shapley Value
    definition: "When binding agreements are possible, the question becomes which coalitions form and how value is divided. The core is the set of stable divisions and may be empty; the Shapley value assigns each agent its average marginal contribution and always exists."
  - id: mechanism-design
    term: Mechanism Design and Strategy-Proofness
    definition: "Designing the rules so that self-interested agents, acting in their own interest, produce a desired outcome. The Vickrey second-price auction is strategy-proof: truthful bidding is dominant, so no counter-speculation is needed."
  - id: assistance-games
    term: Assistance Games
    definition: "A game in which the machine's payoff is the human's, but the machine does not know what that payoff is and must infer it from the human's behavior. Deference and the acceptance of correction emerge as optimal play rather than imposed constraints."
---

Every chapter so far has assumed the environment is indifferent. Chapter 6's
adversary was an exception, but a constrained one — zero-sum, so the opponent's
objective was fully determined by yours. This chapter removes that constraint, and
the concept of optimality has to be rebuilt.

The core difficulty is stated early: with another optimizer present, the best
action depends on what they will do, which depends on what they expect you to do,
which depends on what they think you expect them to do. There is no bottom to
this regress, and **equilibrium** is the mathematical device for cutting it.

## Non-Cooperative Games

A game is specified by players, strategies, and a payoff matrix over strategy
profiles. The solution concepts form a hierarchy.

A **dominant strategy** is best regardless of what others do. When one exists the
analysis is easy, and the **prisoner's dilemma** is the case where that easiness
is the problem: defection dominates for both players, so mutual defection is the
unique equilibrium, and both players do worse than under mutual cooperation which
was available the whole time. The chapter's framing is worth stating precisely:
this is not irrationality or a failure of the theory. Individually rational play
produces a collectively worse outcome, and no amount of cleverness within the
one-shot game escapes it. Escapes require changing the game — repetition,
enforceable contracts, reputation, or commitment devices.

A **Nash equilibrium** is a profile in which no player gains by unilaterally
deviating. Nash's theorem guarantees every finite game has at least one, possibly
in **mixed strategies** — randomized play. Matching pennies is the standard
demonstration that randomization is not a trick but a necessity: any deterministic
strategy is exploitable, and the equilibrium is to randomize uniformly.

For **two-player zero-sum** games the situation is clean. The **maximin** value
(the best you can guarantee) equals the **minimax** value, so the equilibrium is
unique in value, it can be computed by linear programming, and there is no
coordination problem. This is the theoretical backing for Chapter 6, and the
chapter is explicit that this niceness does not survive the departure from
zero-sum.

Outside it, three difficulties arise. **Multiple equilibria** create a selection
problem — which one do the players coordinate on? — with refinements like Pareto
dominance and focal points offering partial answers. Equilibria can be
**Pareto-suboptimal**, as in the prisoner's dilemma. And computing a Nash
equilibrium in general games is **PPAD-complete**, which is strong evidence that
no efficient general algorithm exists.

**Repeated games** change the analysis substantially. With history-dependent
strategies and an indefinite horizon, cooperation becomes sustainable by the
threat of future punishment, and a large family of cooperative equilibria appears
that the one-shot game forbids. A known finite horizon destroys this by backward
induction from the last round — which is an unusually clean demonstration that
what agents *know about the structure* changes the outcome as much as the payoffs
do.

## Cooperative Games

When binding agreements are possible, the questions become which **coalitions**
form and how the value they create is divided.

The **core** is the set of divisions no sub-coalition can improve on by breaking
away. It is the natural stability concept, and it may be **empty** — there are
games where every proposed division can be undercut by some group, so no stable
arrangement exists at all.

The **Shapley value** takes a different approach, assigning each agent its
average **marginal contribution** across all orders in which the coalition could
have formed. It always exists, it is unique under a short list of fairness
axioms, and it is the standard answer to attribution problems. It is also
expensive to compute exactly — exponentially many orderings — which is why
sampling approximations are used, and why the same idea appears in Chapter 19's
feature-attribution methods under the name SHAP.

## Collective Decisions

Social choice theory asks how to aggregate individual preferences into a
collective one, and its central results are impossibility theorems.

**Arrow's theorem**: no voting rule over three or more alternatives can
simultaneously satisfy unrestricted domain, Pareto efficiency, independence of
irrelevant alternatives, and non-dictatorship. **Gibbard–Satterthwaite**: every
non-trivial voting rule is manipulable — there are situations where a voter does
better by misreporting preferences. These are not defects of particular schemes
to be fixed by a better design. They are proofs that no design satisfies all the
properties we want.

The chapter surveys the practical rules — plurality, Borda count, instant-runoff,
approval, Condorcet methods — with their characteristic pathologies, and notes
that the choice among them is a choice about which failure mode to accept.

**Mechanism design** inverts the problem: instead of analyzing a given game,
design the rules so that self-interested play produces the outcome you want. The
showpiece is the **Vickrey second-price auction**, where the winner pays the
second-highest bid. Truthful bidding is a dominant strategy — bidding above your
value risks overpaying, bidding below only risks losing a profitable item — so
the mechanism is **strategy-proof** and requires no counter-speculation from
bidders. The **VCG mechanism** generalizes this to achieve efficient allocation
in a wide class of problems, and the chapter also covers the **tragedy of the
commons** and how pricing externalities restores efficient outcomes.

## Assistance Games

The final section is where the fourth edition's thesis becomes a formal object,
and it is the reason this chapter is essential rather than optional.

An **assistance game** — historically presented as a cooperative inverse
reinforcement learning problem — has two players, a human and a machine. The
machine's payoff **is** the human's payoff. But the machine does not know what
that payoff function is; it has only a prior over possibilities, which it updates
by observing the human's behavior.

<figure>
<svg viewBox="0 0 840 270" role="img" aria-label="A comparison of the standard model, where a fixed objective is installed in the machine, and an assistance game, where the objective remains with the human and the machine holds a distribution over possible objectives updated by observing behavior.">
  <defs>
    <marker id="arw-aima17-assist" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" class="dgm-fill"/>
    </marker>
  </defs>
  <text x="200" y="28" text-anchor="middle" font-size="12" font-weight="700">STANDARD MODEL</text>
  <rect x="50" y="46" width="130" height="44" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="115" y="72" text-anchor="middle" font-size="11">human</text>
  <rect x="222" y="46" width="130" height="44" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="287" y="66" text-anchor="middle" font-size="11">machine</text>
  <text x="287" y="82" text-anchor="middle" font-size="10" class="dgm-muted">objective: fixed</text>
  <line x1="182" y1="68" x2="218" y2="68" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-aima17-assist)"/>
  <text x="200" y="112" text-anchor="middle" font-size="10" class="dgm-muted">objective installed once</text>
  <text x="200" y="146" text-anchor="middle" font-size="11">certain of its goal, the machine</text>
  <text x="200" y="166" text-anchor="middle" font-size="11" font-weight="700">resists being switched off</text>
  <text x="200" y="188" text-anchor="middle" font-size="10.5" class="dgm-muted">shutdown scores badly against</text>
  <text x="200" y="204" text-anchor="middle" font-size="10.5" class="dgm-muted">the objective it is sure of</text>
  <line x1="420" y1="40" x2="420" y2="230" stroke="currentColor" stroke-width="1" stroke-dasharray="4 4" class="dgm-muted"/>
  <g class="dgm-accent">
    <text x="630" y="28" text-anchor="middle" font-size="12" font-weight="700">ASSISTANCE GAME</text>
    <rect x="480" y="46" width="130" height="44" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <text x="545" y="66" text-anchor="middle" font-size="11">human</text>
    <text x="545" y="82" text-anchor="middle" font-size="10">holds the objective</text>
    <rect x="652" y="46" width="130" height="44" class="dgm-soft" stroke="currentColor" stroke-width="1.7"/>
    <text x="717" y="66" text-anchor="middle" font-size="11">machine</text>
    <text x="717" y="82" text-anchor="middle" font-size="10">P(objective)</text>
    <line x1="612" y1="60" x2="648" y2="60" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-aima17-assist)"/>
    <line x1="648" y1="80" x2="612" y2="80" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-aima17-assist)"/>
    <text x="630" y="112" text-anchor="middle" font-size="10">behavior is evidence · the machine asks</text>
    <text x="630" y="146" text-anchor="middle" font-size="11">uncertain of its goal, the machine</text>
    <text x="630" y="166" text-anchor="middle" font-size="11" font-weight="700">accepts being switched off</text>
    <text x="630" y="188" text-anchor="middle" font-size="10.5">the human's intervention is information</text>
    <text x="630" y="204" text-anchor="middle" font-size="10.5">about what was actually wanted</text>
  </g>
  <text x="420" y="252" text-anchor="middle" font-size="11">the safe behavior is not a constraint added to the objective — it is <tspan font-weight="700">implied by the uncertainty</tspan></text>
</svg>
<figcaption><b>Where the fourth edition's argument becomes mathematics.</b> Deference is not a rule imposed on the agent; it is the equilibrium behavior of an agent that knows it does not know what is wanted.</figcaption>
</figure>

Three consequences follow, and all of them are derived rather than stipulated.

The machine has an incentive to **ask** rather than assume, because reducing
uncertainty about the objective has positive expected value. It has an incentive
to **defer**, allowing the human to intervene, since intervention is informative.
And in the off-switch game, the machine **permits itself to be switched off**
precisely because it is uncertain: a human reaching for the switch is evidence
that the machine's current course is wrong. A machine *certain* of its objective
has the opposite incentive and will resist.

The chapter is clear about the difficulties. Humans are not perfectly rational
demonstrators, so inferring preferences from behavior requires a model of human
imperfection. Preferences change over time, including in response to the
machine's own influence. And multiple humans have conflicting preferences, which
is where this section connects back to social choice — and to the impossibility
theorems, which do not go away because the aggregator is a machine.

## Why It Matters

This chapter is where the book's technical content and its ethical argument
finally meet, and neither is an appendix to the other.

The game-theoretic material is directly applicable: auction and pricing design,
resource allocation, multi-agent coordination, the analysis of why a market or
platform produces outcomes nobody chose. The impossibility results are worth
knowing simply as a defense against proposals to fix preference aggregation with
a cleverer rule.

But the assistance-game framing is the chapter's real contribution to the
curriculum. It converts "build AI that respects human autonomy" from an
exhortation into a specification with a solution concept. And it identifies
precisely where the danger sits in the standard architecture: an agent
maximizing a fixed, confidently-held objective is *structurally* incentivized to
prevent interference with that objective. Uncertainty about the goal is what
makes corrigibility rational — which means the fix is in how the objective is
represented, not in what is added on top of it.
