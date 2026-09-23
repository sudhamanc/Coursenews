---
course: bedrock
lectureId: AIMA 24
book: "Artificial Intelligence: A Modern Approach"
part: "VI · Communicating, Perceiving, and Acting"
title: "Why Language Refuses to Be a Formal System"
deck: "Chapter 24 covers the classical account — n-grams, grammars, parsing — and is at its best explaining why each formalism breaks: ambiguity is not noise in natural language, it is a structural feature that no grammar eliminates."
order: 24
chapter: 24
readingTime: 13
tags: ["nlp", "grammar", "parsing", "ambiguity", "n-grams"]
concepts:
  - id: language-models
    term: N-Gram Language Models
    definition: "A probability distribution over word sequences, factored by a Markov assumption so that each word depends on the previous n−1. Simple, effective for local structure, and unable to capture dependencies beyond the window."
  - id: smoothing
    term: Smoothing and Backoff
    definition: "Unseen n-grams get zero probability, annihilating any sequence containing them. Laplace, Katz backoff, and interpolation redistribute mass to unseen events — which is Chapter 21's conjugate prior in applied form."
  - id: grammar-cfg
    term: Context-Free Grammars
    definition: "Rewrite rules generating hierarchical phrase structure, capturing the recursive constituent organization that a linear n-gram cannot express. Probabilistic CFGs attach probabilities to rules so parses can be ranked."
  - id: parsing-algorithms
    term: Chart Parsing and CYK
    definition: "Dynamic programming over spans that stores partial results, avoiding exponential re-derivation. CYK runs in O(n³|G|) for grammars in Chomsky normal form; probabilistic variants return the most likely parse."
  - id: ambiguity
    term: The Varieties of Ambiguity
    definition: "Lexical (word senses), syntactic (attachment, as in prepositional phrases), semantic (scope of quantifiers), and pragmatic (what the speaker meant). Ambiguity is pervasive and resolution requires knowledge beyond the sentence."
  - id: augmented-grammars
    term: Augmented Grammars
    definition: "Adding features and agreement constraints — number, case, gender, subcategorization — to non-terminals, so that a grammar enforces agreement without a combinatorial explosion of separate rules."
  - id: dependency-parsing
    term: Dependency Grammar
    definition: "Representing structure as directed head–dependent relations between words rather than as nested constituents. Often a better fit for free-word-order languages and a more direct route to predicate–argument structure."
  - id: nlp-tasks
    term: The Task Inventory
    definition: "Speech recognition, machine translation, information extraction, question answering, summarization, and sentiment analysis — the applications against which every representational choice is ultimately judged."
---

Chapter 24 is the classical natural language chapter, and reading it in the era
of large language models is an unusual experience: much of the machinery has been
displaced, while every difficulty it identifies remains exactly as described. The
chapter's lasting value is its account of *why language is hard*, which is
independent of the technique in fashion.

## Words in Sequence

A **language model** assigns probabilities to word sequences. The **n-gram**
model applies Chapter 14's Markov assumption to text: each word depends only on
the previous $n-1$.

$$P(w_1, \ldots, w_N) \approx \prod_{i=1}^{N} P(w_i \mid w_{i-n+1}, \ldots, w_{i-1})$$

Parameters are estimated by counting, and the counts are the problem.
**Zipf's law** guarantees a long tail: most possible n-grams are never observed,
so their probability is zero, and a zero anywhere annihilates the whole product.
**Smoothing** redistributes mass — Laplace add-one, Katz backoff to shorter
n-grams when longer ones are unseen, and interpolation across orders. The chapter
connects this correctly to Chapter 21: smoothing is a prior over parameters,
not an engineering hack.

Even smoothed, the fundamental limit is the window. An n-gram cannot represent a
dependency spanning more than $n$ words, and natural language is full of them —
subject–verb agreement across an intervening clause, a pronoun referring back
several sentences. The chapter states this limitation plainly, and it is
precisely the limitation that Chapter 25's architecture removes.

**Character-level** models are noted as robust to morphology and out-of-vocabulary
words, which is the lineage of modern subword tokenization.

## Structure

Language is not a flat sequence; it is hierarchical, and the evidence is
recursion. A noun phrase can contain a relative clause containing another noun
phrase, indefinitely. **Context-free grammars** capture this with rewrite rules
generating phrase structure.

**Probabilistic CFGs** attach probabilities to rules, so that competing parses
can be ranked — necessary because, for any realistic grammar, a sentence has many
parses. The chapter notes the standard weakness: a PCFG's rule probabilities are
independent of the words involved, so it cannot use **lexical** information,
which is exactly what disambiguates most attachment decisions. **Lexicalized**
grammars condition rules on head words to fix this.

**Parsing** with dynamic programming is the algorithmic contribution. A naive
search re-derives the same sub-constituents exponentially many times; a **chart**
(or **CYK**) parser stores each span's analyses once, achieving
$O(n^3 \cdot |G|)$ for grammars in Chomsky normal form. The probabilistic variant
returns the most likely parse, and it is Chapter 14's Viterbi algorithm
generalized from sequences to trees.

**Dependency grammar** is presented as the alternative: rather than nested
constituents, directed **head–dependent** relations between words. It often suits
free-word-order languages better, it maps more directly onto predicate–argument
structure, and transition-based dependency parsers run in linear time — which is
why dependency parsing dominates practice.

## Ambiguity Is the Subject

The chapter's most durable section catalogues the ways a sentence can mean more
than one thing, and the taxonomy is worth holding onto.

**Lexical ambiguity**: a word has multiple senses. **Syntactic ambiguity**: the
same string has multiple structures — the canonical case being prepositional
phrase attachment, where "I saw the man with the telescope" is structurally
ambiguous, and the number of parses grows combinatorially with the number of
attachable phrases. **Semantic ambiguity**: structure is fixed but meaning is
not, as with quantifier scope, where "every student read a book" has two distinct
readings. **Pragmatic ambiguity**: the literal meaning is clear and the intended
meaning is not — "can you pass the salt" is a question about ability only in the
most useless reading.

<figure>
<svg viewBox="0 0 820 260" role="img" aria-label="One sentence with two parse trees: in the first, the prepositional phrase attaches to the verb, and in the second it attaches to the noun phrase, with both being grammatically valid.">
  <defs>
    <marker id="arw-aima24-amb" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" class="dgm-fill"/>
    </marker>
  </defs>
  <text x="410" y="26" text-anchor="middle" font-size="12.5" font-weight="700">"I saw the man with the telescope"</text>
  <text x="200" y="60" text-anchor="middle" font-size="11" font-weight="700">attach to the verb</text>
  <text x="200" y="78" text-anchor="middle" font-size="10" class="dgm-muted">the telescope is what I used</text>
  <text x="200" y="112" text-anchor="middle" font-size="11">VP</text>
  <line x1="194" y1="120" x2="140" y2="146" stroke="currentColor" stroke-width="1.3"/>
  <line x1="200" y1="120" x2="200" y2="146" stroke="currentColor" stroke-width="1.3"/>
  <line x1="206" y1="120" x2="270" y2="146" stroke="currentColor" stroke-width="1.3"/>
  <text x="134" y="162" text-anchor="middle" font-size="10">saw</text>
  <text x="200" y="162" text-anchor="middle" font-size="10">the man</text>
  <text x="276" y="162" text-anchor="middle" font-size="10">with…</text>
  <line x1="410" y1="50" x2="410" y2="212" stroke="currentColor" stroke-width="1" stroke-dasharray="4 4" class="dgm-muted"/>
  <g class="dgm-accent">
    <text x="620" y="60" text-anchor="middle" font-size="11" font-weight="700">attach to the noun</text>
    <text x="620" y="78" text-anchor="middle" font-size="10">the man was carrying it</text>
    <text x="620" y="112" text-anchor="middle" font-size="11">VP</text>
    <line x1="614" y1="120" x2="560" y2="146" stroke="currentColor" stroke-width="1.3"/>
    <line x1="626" y1="120" x2="668" y2="146" stroke="currentColor" stroke-width="1.3"/>
    <text x="554" y="162" text-anchor="middle" font-size="10">saw</text>
    <text x="674" y="162" text-anchor="middle" font-size="10">NP</text>
    <line x1="668" y1="170" x2="632" y2="190" stroke="currentColor" stroke-width="1.3"/>
    <line x1="680" y1="170" x2="716" y2="190" stroke="currentColor" stroke-width="1.3"/>
    <text x="626" y="204" text-anchor="middle" font-size="10">the man</text>
    <text x="722" y="204" text-anchor="middle" font-size="10">with…</text>
  </g>
  <text x="410" y="240" text-anchor="middle" font-size="11">both parses are grammatical — the grammar cannot choose between them</text>
  <text x="410" y="258" text-anchor="middle" font-size="10.5" class="dgm-muted">resolution needs knowledge about telescopes and seeing, not more syntax</text>
</svg>
<figcaption><b>Ambiguity is not an edge case.</b> The grammar licenses both readings because both are legitimate English; deciding between them requires knowing what the world is like.</figcaption>
</figure>

The chapter's conclusion is the one that matters: **ambiguity cannot be
eliminated by a better grammar**, because the alternative readings are
genuinely grammatical. Resolution requires world knowledge, discourse context,
and speaker intent — information that is not in the sentence. That is why the
purely syntactic program could never have succeeded on its own, and it is why
systems that acquire broad world knowledge from data handle ambiguity better
without having a better theory of syntax.

## Making Grammars Usable

**Augmented grammars** add features to non-terminals — number, person, case,
gender, tense — with agreement constraints. Without them, a grammar enforcing
subject–verb agreement needs a separate rule for every feature combination, and
the rule count explodes. With them, one rule carries the constraint.

**Subcategorization** captures the fact that verbs demand particular complement
structures — "give" wants two objects, "sleep" wants none — and enforcing it
prunes a great many spurious parses.

The chapter is honest about the complications real language presents: idioms
whose meaning is not compositional, metaphor, ellipsis, disfluency in speech,
and the constant productive drift of usage. A grammar covering a corpus never
covers the next corpus.

## The Applications

The task inventory is the chapter's reminder that all this machinery is in
service of something. **Speech recognition** combines an acoustic model with a
language model — an HMM in the classical formulation, which is Chapter 14
applied. **Machine translation** progresses from word-for-word substitution
through phrase-based statistical systems with alignment models trained by EM.
**Information extraction** populates structured records from text. **Question
answering**, **summarization**, and **sentiment analysis** round out the set.

These are the tasks that judged every representational choice, and the chapter's
implicit argument is that the grammar formalisms were always instrumental — a
means to systems that do something, not a theory to be defended for its own
sake.

## Why It Matters

Read today, this chapter is a study in which problems were solved by changing the
method and which were not.

The methods have largely been displaced. N-grams gave way to neural language
models; explicit grammars and parsers are no longer the front end of most
systems. But the *phenomena* are unchanged. Ambiguity is still pervasive and
still requires world knowledge. Compositionality and long-range dependency are
still what a language model must capture. The tail of rare constructions still
dominates the error rate.

The chapter also supplies the vocabulary for talking precisely about what a
modern system is doing. When a model resolves a pronoun correctly, it is
resolving an ambiguity this chapter classified; when it produces a fluent
sentence with an incoherent quantifier scope, it is failing at a distinction this
chapter named. Knowing the classical account is what lets you describe a neural
system's failures in terms other than "it made something up."
