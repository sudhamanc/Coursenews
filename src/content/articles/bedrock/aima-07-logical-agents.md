---
course: bedrock
lectureId: AIMA 7
book: "Artificial Intelligence: A Modern Approach"
part: "III · Knowledge, Reasoning, and Planning"
title: "The Agent That Knows Things Rather Than Having Been Told What to Do"
deck: "Chapter 7 separates what an agent believes from how it computes, which is the point at which a system can combine facts it was never given together and draw a conclusion nobody anticipated — and the point at which soundness and completeness become things you have to prove."
order: 7
chapter: 7
readingTime: 14
tags: ["logic", "inference", "entailment", "sat", "propositional"]
concepts:
  - id: knowledge-based-agent
    term: The Knowledge-Based Agent
    definition: "An agent with a knowledge base of sentences and TELL/ASK operations on it. Its declarative construction — stating what is true and letting inference derive what to do — separates knowledge from control and lets new knowledge combine with old without reprogramming."
  - id: entailment
    term: Entailment
    definition: "KB ⊨ α holds when α is true in every model in which KB is true. It is a relation between sentences defined by semantics alone, entirely independent of any algorithm, which is what makes soundness and completeness meaningful properties."
  - id: soundness-completeness
    term: Soundness and Completeness
    definition: "An inference procedure is sound if everything it derives is entailed, and complete if it derives everything entailed. Soundness prevents false conclusions; completeness guarantees the truth is reachable."
  - id: model-checking
    term: Model Checking
    definition: "Deciding entailment by enumerating all models and checking that α holds in every one where KB does. Sound and complete, and O(2ⁿ) in the number of symbols — correct and infeasible, which motivates everything that follows."
  - id: resolution
    term: Resolution
    definition: "A single inference rule on clauses: from (A ∨ B) and (¬B ∨ C) infer (A ∨ C). Applied to a CNF knowledge base together with the negated query, it is refutation-complete — it derives the empty clause whenever the query is entailed."
  - id: horn-clauses
    term: Horn Clauses and Chaining
    definition: "Clauses with at most one positive literal. Restricting to them buys linear-time inference via forward or backward chaining, and gives the implication form that underlies logic programming and rule engines."
  - id: dpll-walksat
    term: DPLL and WalkSAT
    definition: "DPLL is backtracking search over models with early termination, pure-symbol and unit-clause propagation — the basis of modern complete SAT solvers with clause learning and restarts. WalkSAT is local search over complete assignments: fast, incomplete, and unable to prove unsatisfiability."
  - id: frame-problem
    term: The Frame Problem and Successor-State Axioms
    definition: "Specifying what does not change when an action occurs. Effect axioms alone leave unchanged facts undetermined; successor-state axioms — a fluent is true if an action made it true or it was true and nothing made it false — state effect and persistence together."
---

Everything before this chapter is an agent that computes. This chapter is an
agent that *knows*, and the difference is not stylistic. A search agent's
knowledge is welded into its successor function and its heuristic; you cannot
tell it a new fact. A knowledge-based agent has a **knowledge base** — a set of
sentences in a formal language — and two operations on it: `TELL` to add a
sentence and `ASK` to query what follows. The consequence is that it can combine
things it was told separately, at different times, for different reasons, and
derive something nobody put in.

## The Declarative Bet

The agent program is almost trivially short: perceive, TELL the knowledge base
the percept, ASK for an action, TELL it that the action was taken, execute.
Everything substantive happens inside inference.

This is the **declarative** approach to system building: state what is true and
let a general procedure derive what to do, as opposed to the **procedural**
approach of encoding behavior directly. The chapter's honest note is that real
systems blend the two — a purely declarative system can be hopelessly slow — but
the declarative core is what buys **flexibility**, since the same knowledge
serves goals it was never anticipated to serve.

The **wumpus world** is introduced as the worked example, and it is chosen
carefully. It is partially observable, the percepts are local and indirect
(breeze near a pit, stench near the wumpus), and the agent must *deduce* the
location of hazards it cannot see from the pattern of what it has smelled and
felt. A reflex agent cannot do this at all. The reasoning is genuinely
non-trivial and completely mechanical — which is precisely the chapter's claim.

## Entailment Is Not Inference

The central conceptual distinction is between two things that are easy to
conflate.

**Entailment** is semantic. A **model** is a possible assignment of truth values
to all symbols; $M(\alpha)$ is the set of models in which $\alpha$ is true.
Then

$$KB \models \alpha \quad \text{iff} \quad M(KB) \subseteq M(\alpha)$$

— $\alpha$ is true in every world where $KB$ is. This is a relation between
sentences, defined by meaning, with no algorithm anywhere in it.

**Inference** is syntactic: $KB \vdash_i \alpha$ means procedure $i$ derives
$\alpha$ from $KB$ by manipulating symbols. The bridge between them is the pair
of properties that give the chapter its rigor. A procedure is **sound** if
everything it derives is entailed — it never invents a falsehood. It is
**complete** if it derives everything entailed — nothing true is out of reach.
Soundness is non-negotiable; completeness is frequently traded away for speed.

The naive procedure, **model checking**, enumerates all $2^n$ models and verifies
that $\alpha$ holds wherever $KB$ does. It is sound and complete and exponential.
The rest of the chapter is an argument about how to do better.

## Propositional Logic, Briskly

The syntax is atomic sentences (proposition symbols) combined with $\neg$,
$\wedge$, $\vee$, $\Rightarrow$, $\Leftrightarrow$; the semantics is the truth
table for each connective. The chapter pauses on material implication because it
is the standard stumbling block: $P \Rightarrow Q$ is true whenever $P$ is false,
regardless of any connection between $P$ and $Q$. It does not mean causation,
relevance, or explanation. It means exactly "not $P$, or $Q$."

The standard equivalences — De Morgan, distribution, contraposition, and
$(\alpha \Rightarrow \beta) \equiv (\neg\alpha \vee \beta)$ — are the rewriting
toolkit. Three notions link up: $\alpha \models \beta$ iff
$(\alpha \Rightarrow \beta)$ is **valid**, and iff $(\alpha \wedge \neg\beta)$ is
**unsatisfiable**. That last equivalence is the **refutation** principle, and it
is what makes proof by contradiction the standard mechanism.

## Proving Things Without Enumerating Worlds

Inference rules — modus ponens, and-elimination, and the equivalences applied as
rewrites — turn entailment into a search problem over proofs. The payoff is that
a proof can ignore irrelevant propositions entirely, where model checking must
enumerate over all of them. Proof length, not model count, becomes the cost.

**Resolution** is the chapter's main result. Convert everything to **conjunctive
normal form** (always possible), and apply the single rule: from
$(\ell_1 \vee \cdots \vee \ell_k)$ and $(m_1 \vee \cdots \vee m_n)$ where some
$\ell_i$ and $m_j$ are complementary, infer the disjunction of all remaining
literals. To decide $KB \models \alpha$, add $\neg\alpha$ and resolve until
either the **empty clause** appears — a contradiction, so $\alpha$ is entailed —
or no new clauses can be generated.

Resolution is **refutation-complete**: it will find the contradiction whenever
one exists. It is not complete in the sense of deriving all entailed sentences,
which is a distinction worth keeping straight.

**Horn clauses** — at most one positive literal — are the tractable fragment.
Written as implications, they support **forward chaining** (fire rules whose
premises are satisfied, derive new facts, repeat until fixpoint) and **backward
chaining** (work back from the goal to known facts). Both are sound and complete
for Horn knowledge bases and run in time linear in the size of the knowledge
base. Forward chaining is data-driven and derives everything derivable; backward
chaining is goal-driven and touches only relevant facts, which is usually much
less work. This is the computational basis of Prolog and of every production-rule
system.

## Fast Model Checking

Two families dominate practice.

**DPLL** is backtracking search over assignments with three accelerations. Early
termination stops as soon as a clause is satisfied or falsified. **Pure symbol**
heuristics assign symbols appearing with only one polarity. **Unit propagation**
assigns any symbol in a clause whose other literals are all false — which
cascades, and is by far the most important of the three. Modern solvers add
**clause learning** (on conflict, derive and store the no-good that caused it),
**random restarts**, and activity-based variable ordering. The chapter notes
these solvers routinely handle millions of variables, which is why SAT has become
a general-purpose target language for hardware verification and planning.

**WalkSAT** is local search over complete assignments: pick an unsatisfied clause
and flip one of its symbols, either greedily or at random. It is fast, and it is
**incomplete** in an asymmetric way that matters — on an unsatisfiable problem it
runs forever, and cannot distinguish "unsatisfiable" from "not found yet."

The chapter's discussion of the **satisfiability threshold** is one of its
elegant asides: for random 3-SAT, problems are easy when the clause-to-symbol
ratio is low (many solutions) or high (contradiction found quickly), and brutally
hard right at the critical ratio near 4.3 — the phase transition also visible in
Chapter 5's CSPs.

## Agents in Time, and the Frame Problem

The final section builds an actual wumpus agent, and immediately hits the problem
that dominates logical approaches to action.

Propositions become **fluents** indexed by time: $L^1_{1,2}$ for "in square (1,2)
at time 1." Percepts are asserted with their time stamps. The difficulty is
stating what an action *does not* change. **Effect axioms** say what becomes
true; they leave everything else undetermined, so after moving, the agent cannot
prove it still has its arrow. Writing explicit **frame axioms** for every
fluent-action pair is $O(mn)$ and unmanageable.

The solution is the **successor-state axiom**, one per fluent, of the form:

> $F^{t+1}$ is true if and only if some action at $t$ made it true, or it was
> true at $t$ and no action made it false.

This states effects and persistence in a single sentence, and its size is
proportional to the number of ways the fluent can change rather than the number
of actions in the domain.

<figure>
<svg viewBox="0 0 820 230" role="img" aria-label="A comparison of effect axioms, which describe only what an action changes and leave other fluents undetermined, against successor-state axioms, which state in one sentence that a fluent holds if an action made it true or it held before and nothing unmade it.">
  <defs>
    <marker id="arw-aima7-frame" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" class="dgm-fill"/>
    </marker>
  </defs>
  <rect x="26" y="34" width="356" height="130" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="204" y="58" text-anchor="middle" font-size="12" font-weight="700">EFFECT AXIOMS ALONE</text>
  <text x="204" y="84" text-anchor="middle" font-size="11">"moving to (1,2) makes Location(1,2) true"</text>
  <text x="204" y="112" text-anchor="middle" font-size="11" class="dgm-muted">says nothing about the arrow,</text>
  <text x="204" y="130" text-anchor="middle" font-size="11" class="dgm-muted">the gold, or the wumpus</text>
  <text x="204" y="152" text-anchor="middle" font-size="11" font-weight="700">→ everything else undetermined</text>
  <g class="dgm-accent">
    <rect x="438" y="34" width="356" height="130" class="dgm-soft" stroke="currentColor" stroke-width="1.7"/>
    <text x="616" y="58" text-anchor="middle" font-size="12" font-weight="700">SUCCESSOR-STATE AXIOM</text>
    <text x="616" y="86" text-anchor="middle" font-size="11.5" font-weight="700">F at t+1  ⟺</text>
    <text x="616" y="110" text-anchor="middle" font-size="11">an action at t made F true</text>
    <text x="616" y="130" text-anchor="middle" font-size="11">OR  F held at t and nothing unmade it</text>
    <text x="616" y="152" text-anchor="middle" font-size="11" font-weight="700">→ effect and persistence in one sentence</text>
  </g>
  <line x1="386" y1="99" x2="432" y2="99" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-aima7-frame)"/>
  <text x="410" y="200" text-anchor="middle" font-size="11">one axiom per <tspan font-style="italic">fluent</tspan>, not per fluent–action pair</text>
  <text x="410" y="222" text-anchor="middle" font-size="10.5" class="dgm-muted">which is what makes the representation scale</text>
</svg>
<figcaption><b>The frame problem, solved by restating it.</b> The trick is to define each fluent's next value completely, so persistence stops being a separate thing that must be asserted.</figcaption>
</figure>

With these in place, planning reduces to satisfiability: assert the initial
state, the successor-state axioms for $T$ steps, and the goal at time $T$, then
hand it to a SAT solver. Any satisfying assignment names the actions. **SATPlan**
is the chapter's demonstration that the machinery is not merely philosophical —
though it requires a fixed horizon, and the encoding grows with it.

## Why It Matters

The knowledge-based architecture is the road not taken by the current
mainstream, and understanding it precisely is what lets you see what the
mainstream gave up. A logical agent can explain its conclusion as a proof, can
absorb a single new fact and immediately revise everything downstream of it, and
can be *proved* never to assert a falsehood given true premises. A learned model
offers none of the three.

What broke the approach was never the logic. It was the brittleness of requiring
everything to be certain and correctly stated, which is what Part IV replaces
with probability. But the technology did not vanish — it became the SAT and SMT
solvers underneath hardware verification, program analysis, and type checking,
and the chapter's unit propagation and clause learning are the reason those tools
work at industrial scale. Meanwhile the entailment/inference distinction remains
the sharpest tool available for asking what any reasoning system — including a
neural one — is actually guaranteeing.
