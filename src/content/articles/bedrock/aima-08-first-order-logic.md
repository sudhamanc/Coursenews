---
course: bedrock
lectureId: AIMA 8
book: "Artificial Intelligence: A Modern Approach"
part: "III · Knowledge, Reasoning, and Planning"
title: "A Language With Objects In It"
deck: "Propositional logic cannot say 'all kings are persons' without writing one sentence per king. Chapter 8 adds objects, relations, and quantifiers — buying the ability to state general laws, at a price the next chapter has to pay."
order: 8
chapter: 8
readingTime: 12
tags: ["first-order-logic", "quantifiers", "ontology", "knowledge-engineering", "semantics"]
concepts:
  - id: ontological-commitment
    term: Ontological and Epistemological Commitment
    definition: "What a language assumes exists (facts; or objects, relations, and functions) and what states of knowledge it permits (true/false/unknown; or degrees of belief). The pair classifies every representation language in the book."
  - id: fol-syntax
    term: Terms, Atoms, and Quantifiers
    definition: "Constants, variables, and function applications form terms denoting objects; predicates applied to terms form atomic sentences; ∀ and ∃ bind variables over the domain of objects."
  - id: fol-semantics
    term: Models and Interpretations
    definition: "A model supplies a non-empty domain of objects and an interpretation mapping constants to objects, predicates to relations, and function symbols to functions. Truth of a sentence is defined relative to that structure."
  - id: quantifier-pairing
    term: The Connective Each Quantifier Takes
    definition: "∀ almost always pairs with ⇒ and ∃ with ∧. Using ∧ with ∀ asserts that everything in the universe has the property; using ⇒ with ∃ is trivially satisfied by any object failing the antecedent."
  - id: equality
    term: Equality and Unique-Names
    definition: "The = symbol asserts that two terms refer to the same object, which is what makes it possible to say two things are distinct. Without a unique-names assumption, distinct constants may denote the same object."
  - id: assertions-queries
    term: TELL, ASK, and ASKVARS
    definition: "Assertions add sentences to the knowledge base; queries ask what is entailed; a query with free variables returns a substitution — the binding list that makes it true — rather than merely yes or no."
  - id: knowledge-engineering
    term: The Knowledge-Engineering Process
    definition: "Identify the task, assemble the relevant knowledge, decide on a vocabulary, encode general axioms of the domain, encode the specific problem instance, pose queries, and debug — where most errors are missing axioms or overly strong ones."
  - id: expressiveness-cost
    term: The Cost of Expressiveness
    definition: "First-order logic is semidecidable: entailment can be confirmed when it holds, but no procedure is guaranteed to terminate when it does not. Expressive power is paid for with decidability."
---

The argument for first-order logic can be made in a single comparison. To say in
propositional logic that all kings are persons, you need one sentence per king,
and you need to know in advance who the kings are. The knowledge cannot be stated
as a law; it can only be enumerated as a list of instances. That is not a
notational inconvenience. It means the language cannot express generalization,
which is most of what knowledge is.

## Two Commitments

The chapter opens with a classification that is worth more than its two
paragraphs suggest. Every representation language makes two commitments.

Its **ontological commitment** is what it assumes the world contains.
Propositional logic assumes facts that hold or do not. First-order logic assumes
**objects** with **relations** among them and **functions** on them. Temporal
logic adds times; higher-order logic admits relations and functions as objects in
their own right.

Its **epistemological commitment** is what states of knowledge it permits. Logic
allows exactly three — true, false, unknown. Probability theory allows a
continuum of degrees of belief in $[0,1]$. Fuzzy logic makes a different move,
permitting degrees of *truth* rather than degrees of belief, which is a
frequently confused distinction: a fuzzy proposition is partly true, a
probabilistic one is definitely true or false and you are unsure which.

This two-axis classification places every language in the book, and it explains
why Part IV is a genuine departure rather than an elaboration: it changes the
epistemological commitment while keeping the ontological one.

## The Language

**Terms** denote objects: constants ($\textit{John}$), variables ($x$), and
function applications ($\textit{LeftLeg}(\textit{John})$) — where a function
symbol denotes a total function returning an object, not a procedure.

**Atomic sentences** are predicates applied to terms:
$\textit{Brother}(\textit{Richard}, \textit{John})$. Complex sentences use the
propositional connectives. **Quantifiers** bind variables:
$\forall x \; \alpha$ asserts $\alpha$ for every object,
$\exists x \; \alpha$ for at least one.

A **model** consists of a non-empty **domain** of objects and an
**interpretation** mapping constants to domain objects, predicate symbols to
relations over the domain, and function symbols to functions. Truth is defined
relative to that structure. Two features of the standard semantics often surprise
newcomers: there is no requirement that distinct constants denote distinct
objects (hence the need for an explicit unique-names assumption or $\neq$
assertions), and the domain may be infinite, which is where semidecidability
comes from.

The chapter's most practically valuable paragraph is the one about which
connective goes with which quantifier. With $\forall$, use $\Rightarrow$:

$$\forall x \; \textit{King}(x) \Rightarrow \textit{Person}(x)$$

Using $\wedge$ instead asserts that *everything in the universe* is a king and a
person. With $\exists$, use $\wedge$:

$$\exists x \; \textit{Crown}(x) \wedge \textit{OnHead}(x, \textit{John})$$

Using $\Rightarrow$ instead yields a sentence satisfied by any object that simply
fails to be a crown — which is vacuously true and says nothing. These two
mistakes account for a large share of beginner errors, and both produce sentences
that are well-formed and wrong.

Nested quantifiers require care about order: $\forall x \exists y \; \textit{Loves}(x,y)$
says everyone loves someone (possibly different people), while
$\exists y \forall x \; \textit{Loves}(x,y)$ says someone is loved by everyone.
The duality $\forall x \; \neg P \equiv \neg \exists x \; P$ and
$\neg \forall x \; P \equiv \exists x \; \neg P$ is De Morgan's law extended to
quantifiers.

**Equality** deserves separate mention because it is what lets you say two things
are different. $\textit{Father}(\textit{John}) = \textit{Henry}$ asserts
co-reference; $\neq$ asserts distinctness, and without it a knowledge base cannot
rule out that two constants name the same object.

## Using It

The interface is `TELL` for assertions and `ASK` for queries, with the
refinement that a query containing free variables should return a
**substitution** — the binding that makes it true — rather than a bare yes. Ask
who John's brothers are and you want the list, not confirmation that brothers
exist.

The chapter works two domains. The **kinship** domain shows how definitions
(one-sentence biconditionals defining a predicate in terms of others) differ from
mere axioms, and how theorems follow. The **wumpus world** is revisited, and the
comparison with Chapter 7 is the point: percepts now carry time and content as
arguments, and one quantified sentence replaces what propositional logic needed a
separate instance for at every square and every time step. What was
$O(\text{squares} \times \text{times})$ sentences becomes $O(1)$.

The **electronic circuits** domain is the best worked example of the chapter's
methodology, because it forces every representational decision into the open —
whether to model gates as objects, how to name terminals, whether signal values
are objects or predicates.

## Doing It Deliberately

The **knowledge-engineering process** is stated as seven steps: identify the
questions the knowledge base must answer; assemble the relevant knowledge;
decide on a vocabulary of predicates, functions, and constants; encode general
axioms about the domain; encode the specific problem instance; pose queries and
read off answers; and debug.

Two observations from this section are worth carrying into any modeling work.
The vocabulary decision — the **ontology** — is the hardest step and the one that
determines whether the axioms come out clean or tortured, and it is very
difficult to revise late. And debugging a knowledge base has a characteristic
signature: missing axioms produce queries that fail to return an answer that
obviously should follow, while overly strong axioms produce answers that are
confidently wrong. The first failure mode is loud and the second is quiet, which
is why the chapter recommends testing for both.

## Why It Matters

First-order logic is the reference point against which every other
representation in AI is measured, and the reason is that we know exactly what it
can and cannot do. It can express any relational structure. It cannot express
uncertainty, and it is **semidecidable**: if $KB \models \alpha$, a complete
procedure will eventually confirm it, but if $KB \not\models \alpha$, no
procedure is guaranteed to halt and say so. Expressiveness is bought with
decidability, and Chapter 9 is the bill arriving.

The influence is broader than logic programming. Database query languages are
essentially a decidable fragment; the Semantic Web's RDF and OWL are deliberately
restricted fragments chosen for tractable inference; the object-relation
distinction is the intellectual ancestor of the knowledge graphs that ground
modern retrieval systems. And the sharpest contemporary use of this chapter is
diagnostic: when a language model produces a fluent assertion about objects and
their relations, first-order logic is the notation in which you can write down
precisely what it would have to be committed to for that assertion to be true —
and then check.
