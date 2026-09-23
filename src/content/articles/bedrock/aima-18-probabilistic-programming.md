---
course: bedrock
lectureId: AIMA 18
book: "Artificial Intelligence: A Modern Approach"
part: "IV · Uncertain Knowledge and Reasoning"
title: "Probability Over Objects You Have Not Met Yet"
deck: "Bayesian networks need a fixed set of variables known in advance. Chapter 18 removes that — models where the number of objects is itself unknown, expressed as programs, with inference done by running them."
order: 18
chapter: 18
readingTime: 12
tags: ["probabilistic-programming", "relational-models", "open-universe", "data-association", "inference"]
concepts:
  - id: rpm
    term: Relational Probability Models
    definition: "Probability models defined over objects and relations rather than a fixed variable list, combining first-order representational power with probabilistic semantics. A template defines dependencies once and is instantiated over however many objects exist."
  - id: open-universe
    term: Open-Universe Probability Models
    definition: "Models where the number and identity of objects are themselves uncertain. They define distributions over possible worlds containing varying object sets, which closed-universe formalisms like Bayesian networks cannot express."
  - id: unique-names-closed-world
    term: The Closed-Universe Assumptions
    definition: "Standard probabilistic models assume unique names (distinct symbols denote distinct objects) and domain closure (only the named objects exist). Both fail whenever identity is what you are trying to infer."
  - id: data-association
    term: Data Association
    definition: "Deciding which observations correspond to which underlying object — the core problem in multi-target tracking, citation matching, and record linkage. Identity uncertainty makes this a probabilistic inference problem rather than a bookkeeping one."
  - id: programs-as-models
    term: Programs as Probability Models
    definition: "A probabilistic program is a program with random choices; its distribution is over its execution traces. Any program that terminates with probability one defines a proper distribution, however complex its control flow."
  - id: generative-semantics
    term: Generative Semantics
    definition: "The model is a procedure for generating data. Inference conditions that generative process on observed values and asks what latent choices could have produced them — inverting the program rather than running it forward."
  - id: pp-inference
    term: Inference in Probabilistic Programs
    definition: "Likelihood weighting and MCMC over execution traces, sequential Monte Carlo for temporal models, and variational or gradient-based methods where the model is differentiable. The inference engine is generic; the model is user code."
  - id: separation-of-concerns
    term: Model–Inference Separation
    definition: "Probabilistic programming's central engineering claim: write the model as a generative story and let a general-purpose engine handle inference, the same way a compiler handles code generation."
---

Everything in Part IV so far shares an assumption so basic it is easy to miss:
the set of random variables is fixed and known before inference begins. A
Bayesian network has a definite list of nodes. A hidden Markov model has a state
variable with a definite domain.

That assumption breaks on a large class of real problems. How many aircraft are
in the airspace? How many distinct authors are behind these citation records? How
many people are in this room? These are not questions *about* the variables —
they are questions about **how many variables there are**, and a formalism that
requires the answer in advance cannot express them.

## Adding Objects Back

**Relational probability models** are the first step, and they are the
probabilistic counterpart of Chapter 8's move from propositional to first-order
logic. Rather than enumerating variables, an RPM defines a **template**: a
dependency stated once, in terms of object types and relations, instantiated over
however many objects turn out to exist.

A book-recommendation model, for example, states that a rating depends on the
honesty of the reviewer and the quality of the book. That is one statement,
regardless of whether there are ten reviewers or a million. Given a specific set
of objects, the template **unrolls** into an ordinary Bayesian network, and the
usual inference machinery applies.

The gains are the familiar first-order ones: **compactness**, since the model
size is independent of the domain size; **parameter sharing**, since all
instances of a dependency share parameters and therefore pool statistical
strength; and **generalization** to new objects never seen during training.

The costs are equally familiar. The unrolled network can be enormous, and it is
frequently densely connected, because shared parameters couple everything.
**Lifted inference** — reasoning at the template level about groups of
indistinguishable objects rather than grounding out — is the response, and the
chapter treats it as promising rather than solved.

## When You Do Not Know What Exists

Relational models still assume a known set of objects. **Open-universe
probability models** drop that too, and the chapter is precise about which two
assumptions are being abandoned.

**Unique names**: distinct symbols denote distinct objects. **Domain closure**:
the only objects are the ones named. Both are standard in database and
probabilistic practice, and both are exactly wrong when identity is the thing
under question. If two citation records might refer to the same paper, unique
names begs the question. If a radar return might come from an aircraft not yet
tracked, domain closure forbids the correct answer.

An open-universe model instead defines a distribution over **possible worlds
containing different numbers of objects**, typically via a generative process
that first samples how many objects exist, then samples their properties, then
samples observations of them. Inference then reasons jointly about existence,
identity, and attributes.

**Data association** is the problem this makes tractable. In multi-target
tracking, each observation must be attributed to some object — or to noise, or to
a previously unknown object. The number of possible attributions grows
combinatorially, and the chapter's point is that the right treatment is not a
heuristic matching step bolted onto a tracker but joint probabilistic inference
over the association variables. The same structure underlies record linkage,
entity resolution, and citation matching.

<figure>
<svg viewBox="0 0 840 260" role="img" aria-label="A comparison of closed-universe and open-universe models: the closed model fixes three objects in advance and assigns observations among them, while the open model treats the number of objects as a random variable that observations provide evidence about.">
  <defs>
    <marker id="arw-aima18-open" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" class="dgm-fill"/>
    </marker>
  </defs>
  <text x="200" y="28" text-anchor="middle" font-size="12" font-weight="700">CLOSED UNIVERSE</text>
  <rect x="50" y="46" width="300" height="40" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="200" y="62" text-anchor="middle" font-size="11">objects: {A, B, C}</text>
  <text x="200" y="78" text-anchor="middle" font-size="10" class="dgm-muted">fixed before inference starts</text>
  <circle cx="110" cy="132" r="15" fill="none" stroke="currentColor" stroke-width="1.4"/>
  <text x="110" y="137" text-anchor="middle" font-size="10">A</text>
  <circle cx="200" cy="132" r="15" fill="none" stroke="currentColor" stroke-width="1.4"/>
  <text x="200" y="137" text-anchor="middle" font-size="10">B</text>
  <circle cx="290" cy="132" r="15" fill="none" stroke="currentColor" stroke-width="1.4"/>
  <text x="290" y="137" text-anchor="middle" font-size="10">C</text>
  <text x="200" y="182" text-anchor="middle" font-size="10.5" class="dgm-muted">each observation must belong</text>
  <text x="200" y="198" text-anchor="middle" font-size="10.5" class="dgm-muted">to one of these three</text>
  <text x="200" y="224" text-anchor="middle" font-size="11" font-weight="700">cannot represent a fourth object</text>
  <line x1="420" y1="40" x2="420" y2="236" stroke="currentColor" stroke-width="1" stroke-dasharray="4 4" class="dgm-muted"/>
  <g class="dgm-accent">
    <text x="630" y="28" text-anchor="middle" font-size="12" font-weight="700">OPEN UNIVERSE</text>
    <rect x="480" y="46" width="300" height="40" class="dgm-soft" stroke="currentColor" stroke-width="1.7"/>
    <text x="630" y="62" text-anchor="middle" font-size="11">N ~ some distribution</text>
    <text x="630" y="78" text-anchor="middle" font-size="10">how many objects exist is itself inferred</text>
    <circle cx="530" cy="132" r="15" fill="none" stroke="currentColor" stroke-width="1.4"/>
    <circle cx="610" cy="132" r="15" fill="none" stroke="currentColor" stroke-width="1.4"/>
    <circle cx="690" cy="132" r="15" fill="none" stroke="currentColor" stroke-width="1.4"/>
    <circle cx="770" cy="132" r="15" fill="none" stroke="currentColor" stroke-width="1.6" stroke-dasharray="3 3"/>
    <text x="770" y="137" text-anchor="middle" font-size="10">?</text>
    <text x="630" y="182" text-anchor="middle" font-size="10.5">an observation may come from a</text>
    <text x="630" y="198" text-anchor="middle" font-size="10.5">previously unknown object</text>
    <text x="630" y="224" text-anchor="middle" font-size="11" font-weight="700">identity is something to infer</text>
  </g>
</svg>
<figcaption><b>The assumption that has to go.</b> When the question is "how many are there?", a formalism that requires the answer up front cannot be part of the solution.</figcaption>
</figure>

## Models Written as Programs

The chapter's final and most consequential section makes a simple observation
with large consequences: a **probabilistic program** is an ordinary program with
random choices in it, and it defines a probability distribution over its
execution traces.

This is more expressive than any graphical notation, because a program can have
loops whose iteration counts are random, recursion whose depth is random, and
control flow that creates new objects conditionally. Any program terminating with
probability one defines a proper distribution, however baroque its structure.

The semantics are **generative**: the model is a procedure for producing data.
Inference runs that procedure *backwards* — conditioning the generative process
on observed outputs and asking what latent random choices could have produced
them.

The inference methods are the ones from Chapter 13, applied to traces rather than
network nodes. **Likelihood weighting** runs the program forward, clamping
observed variables and accumulating weights. **MCMC over execution traces**
proposes modifications to the random choices and accepts or rejects — with the
technical complication that changing one choice can alter which subsequent
choices even exist, so the proposal machinery must handle traces of varying
structure. **Sequential Monte Carlo** suits temporal models. Where the model is
differentiable, **variational inference** and **Hamiltonian Monte Carlo** apply
gradient information and scale much better.

The engineering claim is a **separation of concerns**: the modeler writes a
generative story in a general-purpose language; a generic engine performs
inference. This is the same bargain as a compiler — describe the computation, let
the system figure out the execution — and it is, the chapter is candid, a
bargain that holds less reliably. Automated inference can be slow or fail to
converge in ways that require understanding the engine, which is the leaky
abstraction that has kept probabilistic programming a specialist tool rather than
a default.

## Why It Matters

This chapter closes Part IV by pointing at the synthesis the book has been
circling since Chapter 8: first-order expressiveness with probabilistic
semantics. Logic gave objects and relations without uncertainty; probability gave
uncertainty over a fixed variable list. Probabilistic programming gives both, and
the demonstration that this is achievable is worth more than the specific tools.

Practically, the ideas are in wider use than the label. Hierarchical Bayesian
models in the sciences are relational models; entity resolution systems are
solving open-universe data association whether or not they say so; modern
probabilistic programming systems handle real inferential workloads in
epidemiology, econometrics, and astronomy.

And the chapter offers a useful corrective to the current default. A large
learned model is an extraordinarily flexible function approximator with
essentially no structural commitments. A probabilistic program is the opposite:
an explicit, inspectable statement of how you believe the data was generated,
whose posterior is interpretable because the latent variables mean something you
named. When you have real structural knowledge — a physical process, a known
mechanism, a small dataset — encoding it directly usually beats learning it from
scratch, and this chapter is where the book says how.
