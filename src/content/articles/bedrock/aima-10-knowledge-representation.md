---
course: bedrock
lectureId: AIMA 10
book: "Artificial Intelligence: A Modern Approach"
part: "III · Knowledge, Reasoning, and Planning"
title: "What You Have to Decide Before You Can Say Anything"
deck: "Chapter 10 stops teaching notation and starts making commitments: what categories are, how substances differ from objects, what an event is, how to reason about what someone else believes, and how to hold a conclusion that new evidence is allowed to retract."
order: 10
chapter: 10
readingTime: 13
tags: ["ontology", "categories", "events", "description-logic", "default-reasoning"]
concepts:
  - id: upper-ontology
    term: Upper Ontology
    definition: "A general framework of categories and relations intended to sit above every specific domain, so that domain ontologies can interoperate. Its difficulty is that general-purpose reasoning requires unifying notions that specialists define incompatibly."
  - id: categories-inheritance
    term: Categories and Inheritance
    definition: "Categories organize knowledge by letting properties be asserted once at the most general applicable level and inherited by members. Represented either as predicates or — reified as objects — as members of a subclass taxonomy."
  - id: physical-composition
    term: Composition and Substances
    definition: "PartOf relations with transitivity, and the distinction between count nouns and mass nouns. Intrinsic properties (density, flavor) belong to the substance and survive division; extrinsic ones (weight, shape) belong to the object and do not."
  - id: events-fluents
    term: Event Calculus
    definition: "Reifying events and time points as objects so that assertions can quantify over them. Fluents are predicates that vary over time; Initiates, Terminates, Happens, and T relate events to intervals during which fluents hold."
  - id: mental-objects
    term: Mental Objects and Modal Logic
    definition: "Propositional attitudes such as believing and knowing are not truth-functional and break substitution of equals. Modal logic adds operators with possible-worlds semantics, where an agent knows P if P holds in every world it considers accessible."
  - id: description-logic
    term: Description Logics
    definition: "Languages designed so that subsumption — whether one category is a subset of another — and classification are decidable and usually tractable, deliberately trading expressive power for guaranteed termination."
  - id: default-reasoning
    term: Default Reasoning and Nonmonotonicity
    definition: "Conclusions drawn in the absence of contrary evidence, which later evidence may withdraw. Circumscription and default logic formalize it; unlike classical logic, adding a premise can remove a conclusion."
  - id: truth-maintenance
    term: Truth Maintenance Systems
    definition: "Machinery that records justifications for derived beliefs so that retracting a premise retracts exactly its dependents. JTMS tracks one justification per belief; ATMS maintains beliefs under all assumption sets at once."
---

Chapters 7 through 9 supply notation and inference procedures. Neither tells you
what to write. Chapter 10 is about the content of a knowledge base — the general
commitments that any broad domain requires, which recur whether the domain is
medicine or shopping or physics.

The chapter's premise is that these commitments are not arbitrary. Certain
distinctions — between things and stuff, between objects and the events they
participate in, between what is true and what an agent believes — turn out to be
forced by the requirements of representing anything general at all.

## The Ambition of an Upper Ontology

A **general-purpose ontology** organizes everything into a taxonomy of broad
categories — objects, substances, events, times, beliefs — so that specific
domains can attach beneath and interoperate.

The chapter is honest about the difficulty, and the diagnosis is worth keeping.
Special-purpose ontologies are coherent because the reasoner can rely on
simplifying assumptions the domain permits. A general one cannot, because
different specialists formalize the same notion incompatibly, and reconciling them
requires resolving disagreements that are not merely notational. Both large
hand-built ontologies and text-derived ones have produced usable results; neither
has produced the universal framework the ambition names. But the exercise
surfaces exactly which distinctions are unavoidable.

## Categories, and What Goes Wrong With Them

Categories are the organizing device, because they let a property be asserted
once at the most general level where it holds and inherited by everything below.
Two encodings are available: a category can be a **predicate**
($\textit{Basketball}(b)$) or a **reified object** ($b \in \textit{Basketballs}$,
$\textit{Basketballs} \subset \textit{Balls}$). Reification is what allows
assertions *about* the category itself — that it has a population, a typical
member, or a defining condition.

Beyond subclass and membership, the useful apparatus includes **disjointness**
(no shared members), **exhaustive decomposition** (the union covers the parent),
and **partition** (both at once). **Natural kinds** are the persistent
difficulty: no set of necessary and sufficient conditions picks out tomatoes, so
the chapter separates what is *definitional* from what is merely *typical* —
which is exactly what motivates the default reasoning later in the chapter.

**Physical composition** uses $\textit{PartOf}$, made transitive and reflexive,
with composite objects whose structural relations among parts matter. And the
**substance** distinction is the one that most repays attention: mass nouns
behave differently from count nouns. Divide a pound of butter and each half is
still butter; divide a car and neither half is a car. The formal criterion is the
**intrinsic/extrinsic** split — intrinsic properties (density, flavor, color)
belong to the substance and survive division, extrinsic ones (weight, shape,
location) belong to the object and do not. A category defined solely by intrinsic
properties is a substance; one requiring extrinsic properties is a count noun.

## Events

Representing change requires reifying **events** as objects so that they can be
quantified over and described. The **event calculus** provides the apparatus:
$\textit{Happens}(e, i)$ that event $e$ occurs during interval $i$;
$\textit{Initiates}$ and $\textit{Terminates}$ relating events to the fluents
they turn on and off; and $T(f, t)$ that fluent $f$ holds at time $t$. Time
points and intervals become objects with a full set of relations — meets,
before, during, overlaps — and processes are distinguished from discrete events
by being homogeneous over their intervals, which is the temporal analogue of the
substance/object distinction.

**Fluents** — predicates whose truth varies with time — are the bridge back to
Chapter 7's successor-state axioms, now expressed in a framework where times and
events are first-class citizens rather than array indices.

## Believing Things About Believing

The hardest section concerns **propositional attitudes**: believes, knows, wants,
intends. The problem is that these break the substitution rule that classical
logic depends on.

If $\textit{Superman} = \textit{Clark}$, then anything true of Superman is true
of Clark — that is what equality means. But Lois can believe Superman can fly
without believing Clark can fly. If beliefs are relations between agents and
propositions denoted by terms, then substituting equals for equals inside a
belief produces falsehoods. **Referential transparency**, which classical logic
assumes everywhere, fails inside these contexts.

**Modal logic** is the response. Add operators — $\mathbf{K}_a \alpha$ for "agent
$a$ knows $\alpha$" — whose semantics is given by **possible worlds**: an agent
knows $\alpha$ if $\alpha$ is true in every world accessible from the actual one
given what the agent has observed. Accessibility relations encode what the agent
cannot distinguish. Different axioms on accessibility give different logics —
whether knowledge implies truth, whether agents know what they know, whether they
know what they do not know.

The chapter notes the consequence known as **logical omniscience**: standard
modal logic makes an agent's knowledge closed under entailment, so an agent
believing the axioms of arithmetic believes every theorem. Real agents are not
like this, and no fully satisfactory weakening exists — which is a fair summary
of the state of the art in modeling bounded reasoners.

## Buying Decidability Back

**Semantic networks** and **frames** were the historically important alternatives
to logic, drawn as graphs of nodes and labelled links with inheritance along
subclass edges. Their appeal was efficiency and legibility; their defect was
semantic vagueness about what a link meant. The chapter's assessment is that
they turned out to be notational variants of a restricted first-order fragment,
and that the productive response was to make the restriction principled.

**Description logics** are that response. Rather than asking whether a sentence
is entailed, they are designed around **subsumption** — is category $C$
necessarily a subset of category $D$? — and **classification** — where does an
individual belong in the taxonomy? The languages are constructed so that these
operations are decidable and usually tractable. The trade is explicit: give up
expressiveness, gain a guarantee of termination. This is the lineage behind OWL
and the Semantic Web stack, and the design philosophy — *choose the weakest
language that says what you need* — is the chapter's most transferable
engineering judgment.

## Conclusions That Can Be Withdrawn

Classical logic is **monotonic**: adding premises never removes a conclusion.
Common-sense reasoning is not. Birds fly; Opus is a bird; so Opus flies — until
you learn Opus is a penguin.

<figure>
<svg viewBox="0 0 820 240" role="img" aria-label="A comparison of monotonic and nonmonotonic reasoning: in the monotonic case the set of conclusions only grows as premises are added, while in the nonmonotonic case adding the premise that Opus is a penguin removes the earlier conclusion that Opus flies.">
  <defs>
    <marker id="arw-aima10-mono" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" class="dgm-fill"/>
    </marker>
  </defs>
  <text x="200" y="28" text-anchor="middle" font-size="12" font-weight="700">MONOTONIC (classical)</text>
  <rect x="60" y="48" width="120" height="44" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="120" y="75" text-anchor="middle" font-size="10.5">conclusions</text>
  <line x1="184" y1="70" x2="218" y2="70" stroke="currentColor" stroke-width="1.4" marker-end="url(#arw-aima10-mono)"/>
  <rect x="222" y="40" width="140" height="60" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="292" y="66" text-anchor="middle" font-size="10.5">conclusions</text>
  <text x="292" y="84" text-anchor="middle" font-size="10.5" class="dgm-muted">+ more</text>
  <text x="200" y="124" text-anchor="middle" font-size="10.5" class="dgm-muted">adding a premise only ever adds</text>
  <g class="dgm-accent">
    <text x="610" y="28" text-anchor="middle" font-size="12" font-weight="700">NONMONOTONIC (default)</text>
  </g>
  <rect x="470" y="48" width="140" height="44" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="540" y="68" text-anchor="middle" font-size="10.5">Bird(Opus)</text>
  <text x="540" y="85" text-anchor="middle" font-size="10.5" font-weight="700">⊢ Flies(Opus)</text>
  <line x1="616" y1="70" x2="650" y2="70" stroke="currentColor" stroke-width="1.4" marker-end="url(#arw-aima10-mono)"/>
  <text x="694" y="56" text-anchor="middle" font-size="10" class="dgm-muted">+ Penguin(Opus)</text>
  <g class="dgm-accent">
    <rect x="654" y="62" width="140" height="44" class="dgm-soft" stroke="currentColor" stroke-width="1.7"/>
    <text x="724" y="82" text-anchor="middle" font-size="10.5">Bird(Opus)</text>
    <text x="724" y="99" text-anchor="middle" font-size="10.5" font-weight="700">⊬ Flies(Opus)</text>
  </g>
  <text x="620" y="136" text-anchor="middle" font-size="10.5" class="dgm-muted">adding a premise <tspan font-style="italic">removed</tspan> a conclusion</text>
  <line x1="40" y1="164" x2="790" y2="164" stroke="currentColor" stroke-width="1" class="dgm-muted"/>
  <text x="410" y="192" text-anchor="middle" font-size="11.5">so a system must record <tspan font-weight="700">why</tspan> it believes something</text>
  <text x="410" y="216" text-anchor="middle" font-size="10.5" class="dgm-muted">— which is what a truth maintenance system stores, and what makes retraction surgical rather than total</text>
</svg>
<figcaption><b>The property classical logic cannot give up.</b> Default reasoning is useful precisely because it is nonmonotonic, and nonmonotonicity is what forces dependency tracking.</figcaption>
</figure>

Two formalizations are presented. **Circumscription** minimizes the extension of
abnormality predicates: birds fly unless abnormal, and we assume as few
abnormalities as consistency permits. **Default logic** uses rules of the form
"if $P$, and it is consistent to assume $Q$, then conclude $Q$." Both face the
problem of **multiple extensions** — the Nixon diamond, where a Quaker-pacifist
default and a Republican-hawk default both apply and the theory cannot choose —
and the chapter is clear that priority schemes are patches rather than solutions.

**Truth maintenance systems** are the operational consequence. If a conclusion
may be retracted, a system must know what depended on it. A **JTMS** annotates
each belief with a justification, so retracting a premise retracts exactly its
dependents and no more, and a belief with an independent second justification
survives. An **ATMS** goes further and represents what would follow under *every*
set of assumptions simultaneously, which supports fast hypothetical reasoning at
the cost of maintaining many contexts. Both also enable explanation: the
justification structure is a record of why the system believes what it does.

## Why It Matters

This chapter is the most dated in the book and its problems are the least
resolved, which is exactly why it is worth reading now.

Every knowledge graph, product catalog, medical coding system, and schema.org
annotation is an instance of this chapter's problems, usually solved by
rediscovery. The substance/object distinction decides whether your schema can
represent a recipe. The event-reification question decides whether your log can
answer "what happened while the deployment was running." The
description-logic bargain — weaken the language until inference terminates — is
the correct instinct for anyone designing a schema with an inference layer on
top.

And the nonmonotonicity material has aged into unexpected relevance. Systems that
draw plausible conclusions which later evidence should retract are now the norm
rather than the exception, and most of them have no dependency structure at all:
they cannot say why they concluded something, so they cannot cleanly withdraw it
when a premise fails. Truth maintenance is a fifty-year-old answer to a problem
that most current architectures have not yet acknowledged having.
