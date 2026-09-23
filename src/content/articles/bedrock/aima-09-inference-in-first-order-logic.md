---
course: bedrock
lectureId: AIMA 9
book: "Artificial Intelligence: A Modern Approach"
part: "III · Knowledge, Reasoning, and Planning"
title: "Reasoning About Everything Without Enumerating It"
deck: "Chapter 9 makes first-order inference practical by refusing to instantiate quantified sentences. Unification matches patterns on demand, and three algorithms — forward chaining, backward chaining, and resolution — turn matching into proof."
order: 9
chapter: 9
readingTime: 13
tags: ["unification", "resolution", "chaining", "prolog", "theorem-proving"]
concepts:
  - id: propositionalization
    term: Propositionalization
    definition: "Reducing first-order inference to propositional inference by instantiating quantified sentences over all ground terms. Complete by Herbrand's theorem, but it generates irrelevant instances and does not terminate when the query is not entailed."
  - id: unification
    term: Unification
    definition: "Finding a substitution θ that makes two expressions identical. It is what lets inference match a general rule against specific facts on demand, and the most general unifier is unique up to variable renaming."
  - id: lifted-inference
    term: Lifted Inference Rules
    definition: "Generalized Modus Ponens applies a rule to facts in one step using a unifier, rather than first grounding out the rule. One lifted step replaces potentially astronomically many propositional ones."
  - id: forward-chaining
    term: Forward Chaining
    definition: "Repeatedly fire rules whose premises unify with known facts, adding conclusions until fixpoint. Sound and complete for definite clauses, data-driven, and the basis of production and deductive-database systems."
  - id: fc-optimizations
    term: Pattern Matching and Rete
    definition: "The cost of forward chaining is dominated by matching premises against the knowledge base, which is NP-hard in general. Incremental forward chaining considers only rules affected by newly added facts; the Rete network shares match state across rules."
  - id: backward-chaining
    term: Backward Chaining and Logic Programming
    definition: "Goal-driven depth-first proof search: to prove a goal, unify it with a rule's head and recursively prove the premises. It touches only relevant facts, uses space linear in proof size, and is incomplete on left-recursive programs."
  - id: fol-resolution
    term: First-Order Resolution
    definition: "Convert to CNF — including Skolemization to remove existentials — then resolve with unification. Refutation-complete for first-order logic: if a set of sentences is unsatisfiable, resolution derives the empty clause."
  - id: skolemization
    term: Skolemization
    definition: "Replacing an existentially quantified variable with a fresh constant, or — if it lies inside a universal quantifier — with a function of the universally quantified variables, preserving satisfiability while eliminating ∃."
---

The obvious way to do inference in first-order logic is to eliminate the
first-order part. Every universally quantified sentence can be instantiated with
every ground term, every existential replaced by a new constant, and the result
is a propositional knowledge base that Chapter 7's machinery handles.

**Herbrand's theorem** guarantees this is complete: if a first-order sentence is
entailed, some finite subset of instantiations entails it. The chapter's point is
that the guarantee is worthless in practice. Instantiating over a domain with
function symbols produces infinitely many ground terms — $\textit{Father}(John)$,
$\textit{Father}(\textit{Father}(John))$, and so on without end — so the
procedure enumerates depth by depth, and it *does not terminate* when the query
is not entailed. This is semidecidability made concrete. Worse, nearly all
generated instances are irrelevant.

The chapter's answer is to never instantiate at all.

## Unification

**Unification** takes two expressions and finds a substitution making them
identical: $\text{UNIFY}(p, q) = \theta$ where $p\theta = q\theta$. Matching
$\textit{Knows}(John, x)$ against $\textit{Knows}(John, Jane)$ yields
$\{x/Jane\}$; against $\textit{Knows}(y, Mother(y))$ it yields
$\{y/John,\, x/Mother(John)\}$.

Two technicalities matter. **Standardizing apart** — renaming variables so two
expressions share none — prevents spurious failures when both happen to use $x$.
And the **occur check** refuses to bind $x$ to a term containing $x$, which
prevents constructing infinite terms; it costs quadratic time, and Prolog
famously omits it for speed, accepting unsoundness in rare cases.

The **most general unifier** is unique up to variable renaming, and is what
algorithms return: it commits to no more than the match requires, leaving the
result as general as possible.

Unification is the hinge of the whole chapter. It is what allows a general rule
to be applied to specific facts *without first grounding the rule out*.
**Generalized Modus Ponens** is the lifted rule: given atomic sentences $p_i'$
and a rule $(p_1 \wedge \cdots \wedge p_n) \Rightarrow q$ with a substitution
$\theta$ such that $p_i'\theta = p_i\theta$ for all $i$, infer $q\theta$. One
lifted step replaces however many propositional steps the grounding would have
required.

## Forward Chaining

For knowledge bases of **definite clauses** — disjunctions with exactly one
positive literal, equivalently implications with atomic conclusions — forward
chaining repeatedly applies Generalized Modus Ponens to derive new facts until
nothing new appears. It is sound and complete for this class, and it terminates
for **Datalog** knowledge bases (no function symbols), where the number of ground
facts is finite.

The chapter's analysis of the cost is the useful part. The expensive step is not
inference but **pattern matching** — finding all the ways a rule's premises can
be satisfied by current facts — which is a constraint satisfaction problem and
NP-hard in general. Three optimizations follow.

**Incremental forward chaining** observes that a fact derived at iteration $t$
must have used at least one fact new at $t-1$; only rules involving those need be
rechecked. The **Rete** network compiles the rules into a dataflow graph in which
partial matches are shared across rules and persist between cycles — the
algorithm underneath production systems like OPS-5 and the business-rule engines
descended from them. **Magic sets** rewrite the rules with goal-derived filter
predicates, so that a forward-chaining engine does only the work a backward
chainer would have — a hybrid that is the standard technique in deductive
databases.

## Backward Chaining

Backward chaining is the goal-directed dual: to prove a goal, find rules whose
head unifies with it and recursively prove their premises, composing
substitutions along the way. It is implemented as depth-first recursion, so its
space is linear in the proof size, and it touches only facts relevant to the
query.

Depth-first search brings the familiar defect: backward chaining is incomplete on
left-recursive programs, where it can loop forever, and it may repeat work on
subgoals it has already solved. The standard fix is **tabling** (memoization of
subgoals), which recovers completeness for Datalog and turns the procedure into
something closer to a dynamic program.

This is the execution model of **Prolog**, and the chapter is clear about where
Prolog departs from logic: the omitted occur check, the reliance on clause
ordering, the closed-world negation-as-failure, and the cut operator for
controlling backtracking. These make it a programming language rather than a
theorem prover, and the trade is deliberate.

## Resolution, Lifted

For full first-order logic — not just definite clauses — resolution generalizes
from Chapter 7. The conversion to CNF now has an extra step.

**Skolemization** removes existential quantifiers. $\exists x \; P(x)$ becomes
$P(C)$ for a fresh constant $C$. But an existential inside a universal cannot use
a constant: $\forall x \; \exists y \; \textit{Loves}(x,y)$ does not mean
everyone loves the *same* person. The existential variable becomes a **Skolem
function** of the enclosing universal variables:
$\forall x \; \textit{Loves}(x, F(x))$. Skolemization preserves satisfiability,
which is all a refutation procedure needs.

The **binary resolution** rule then applies with unification: two clauses with
complementary unifiable literals resolve to the disjunction of the remainder,
with the unifier applied. To prove $KB \models \alpha$, convert
$KB \wedge \neg\alpha$ to CNF and resolve until the empty clause appears.

First-order resolution is **refutation-complete**. The chapter's sketch of the
proof via Herbrand's theorem and the lifting lemma is worth reading once: the
lifting lemma says that any resolution proof obtainable on ground instances has a
corresponding lifted proof on the original clauses, which is what transfers
propositional completeness upward.

Practical provers need strategies, since the search space is enormous. **Unit
preference** prefers resolving with single-literal clauses, driving toward the
empty clause. The **set of support** restricts resolution to clauses descended
from the negated goal, keeping the proof goal-directed.
**Input resolution**, **subsumption** (discarding clauses more specific than
existing ones), and **indexing** for fast retrieval of unifiable clauses round
out the toolkit. **Equality** requires special handling — demodulation,
paramodulation, or built-in equational reasoning — because axiomatizing it
naively is ruinous.

<figure>
<svg viewBox="0 0 820 250" role="img" aria-label="Two routes from first-order knowledge to an answer: the propositionalization route grounds out all instances and then runs propositional inference, while the lifted route uses unification to match rules against facts directly.">
  <defs>
    <marker id="arw-aima9-lift" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" class="dgm-fill"/>
    </marker>
  </defs>
  <rect x="26" y="96" width="150" height="56" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="101" y="120" text-anchor="middle" font-size="11.5" font-weight="700">FOL knowledge</text>
  <text x="101" y="139" text-anchor="middle" font-size="10.5" class="dgm-muted">∀x King(x) ⇒ Person(x)</text>
  <rect x="286" y="26" width="230" height="62" fill="none" stroke="currentColor" stroke-width="1.5" stroke-dasharray="5 4"/>
  <text x="401" y="50" text-anchor="middle" font-size="11.5" font-weight="700">ground every instance</text>
  <text x="401" y="70" text-anchor="middle" font-size="10.5" class="dgm-muted">infinite with function symbols</text>
  <line x1="178" y1="112" x2="282" y2="66" stroke="currentColor" stroke-width="1.4" marker-end="url(#arw-aima9-lift)"/>
  <text x="222" y="80" text-anchor="middle" font-size="10" class="dgm-muted">propositionalize</text>
  <g class="dgm-accent">
    <rect x="286" y="160" width="230" height="62" class="dgm-soft" stroke="currentColor" stroke-width="1.7"/>
    <text x="401" y="184" text-anchor="middle" font-size="11.5" font-weight="700">unify on demand</text>
    <text x="401" y="204" text-anchor="middle" font-size="10.5">θ = {x/John} — one step</text>
    <line x1="178" y1="136" x2="282" y2="182" stroke="currentColor" stroke-width="1.6" marker-end="url(#arw-aima9-lift)"/>
  </g>
  <text x="222" y="178" text-anchor="middle" font-size="10" class="dgm-muted">lift</text>
  <rect x="620" y="96" width="172" height="56" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="706" y="128" text-anchor="middle" font-size="11.5" font-weight="700">Person(John)</text>
  <line x1="520" y1="62" x2="616" y2="108" stroke="currentColor" stroke-width="1.4" stroke-dasharray="5 4" marker-end="url(#arw-aima9-lift)"/>
  <line x1="520" y1="188" x2="616" y2="142" stroke="currentColor" stroke-width="1.6" marker-end="url(#arw-aima9-lift)"/>
</svg>
<figcaption><b>Why unification is the whole chapter.</b> Both routes reach the same conclusion; only one of them avoids enumerating a universe first.</figcaption>
</figure>

## Why It Matters

The engineering lesson generalizes well beyond logic: **match patterns on demand
rather than enumerating instances in advance**. That is what unification is, and
the same principle reappears in query optimization, in lazy evaluation, and in
any system that would otherwise materialize a combinatorial intermediate result.

The technology itself remains in service. Prolog's execution model is backward
chaining; Datalog with magic sets is how modern deductive databases and
program-analysis engines evaluate recursive queries; Rete is inside production
rule engines; and resolution provers have produced genuine mathematical results,
including settled open problems.

The chapter also marks a boundary. It describes, with proofs, the best that can be
done with certain knowledge — and every guarantee it offers evaporates the moment
a premise is merely probable. That is the transition into Part IV, and reading
Chapter 9 first is what makes clear how much is being given up, and why it was
worth giving up.
