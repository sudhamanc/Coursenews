---
course: human-ai
lectureId: W5
title: "Information Architecture When the Architect Is an Algorithm"
deck: "Structure was once a designer's taxonomy you could inspect; when a recommender curates the feed, the blueprint turns personal and opaque — and findability becomes a question of human values."
order: 5
readingTime: 11
tags: ["information-architecture", "wireframing", "findability", "context-architecture", "algorithmic-curation", "responsible-ai"]
concepts:
  - id: information-architecture
    term: Information Architecture (IA)
    definition: "The practice of organizing, structuring, and labeling content so people can find what they need and understand where they are; the largely invisible structure beneath a product's navigation."
  - id: ia-vs-navigation
    term: Information Architecture vs. Navigation
    definition: "IA is the underlying organizational structure — categories, relationships, hierarchy — while navigation is the visible set of menus and links that exposes one view of it."
  - id: findability-discoverability
    term: Findability vs. Discoverability
    definition: "Findability is whether users can locate something they are actively seeking; discoverability is whether they can encounter something useful they did not know to look for."
  - id: information-scent
    term: Information Scent
    definition: "The cues a label or link gives about what lies behind it, letting users 'follow their noses' toward a goal; weak scent is behind most information-architecture failures."
  - id: ia-methods
    term: Card Sorting, Tree Testing, and Wireframes
    definition: "Methods that make an invisible structure testable before build: card sorting surfaces users' mental models, tree testing checks whether a bare hierarchy is findable, and wireframes are low-to-high-fidelity blueprints that fix content hierarchy and flow before visual design."
  - id: context-architecture
    term: Context Architecture
    definition: "Applying information-architecture principles to the information environment around an AI system — its prompts, history, system instructions and guardrails, retrieved (RAG) sources, tools, and long-term memory — deciding what the model receives, how it is labeled and prioritized, and what it must never do."
  - id: algorithmic-curation
    term: Algorithmic Curation and the Algorithmized Self
    definition: "When a recommender replaces a shared taxonomy with a personalized, opaque ranking, users know the structure only through perception — and begin to shape their behavior to the feed even as it shapes them."
  - id: fat-framework
    term: "Fairness, Accountability, Transparency (FAT)"
    definition: "A common checklist for ethical algorithmic systems; useful for auditing a mechanism, but — as satire like 'A Mulching Proposal' shows — insufficient on its own because it can certify a system whose very purpose is indefensible."
---

You only notice information architecture when it fails. When a product is well
organized you find the page, finish the task, and remember nothing about the
structure that carried you there; when it is badly organized you loop through the
same three menus and give up. **Information architecture** — IA — is the largely
invisible discipline of organizing, structuring, and labeling content so people
can find what they need and understand where they are. For three decades it has
been a designer's craft, practiced with sitemaps and taxonomies. This week asks
what becomes of that craft when the arranging is handed to an algorithm — and why
that hand-off turns a usability problem into a question of human values.

## The Iceberg Beneath the Menu

It is tempting to equate information architecture with the navigation bar, but the
two are different things. **Navigation** is the visible set of menus, links, and
buttons a person clicks; **information architecture** is the underlying structure
those controls expose — the categories, relationships, and hierarchy that exist
whether or not any menu is drawn. Navigation is the tip of the iceberg; the
architecture is the mass beneath the waterline. One structure can be surfaced
through many navigations — a top menu, a search box, a breadcrumb trail — and
getting the structure wrong cannot be papered over by restyling the menu.

<figure>
<svg viewBox="0 0 800 345" role="img" aria-label="A navigation menu bar sits at the top as the visible view; below it the underlying information architecture is drawn as a tree of a root, categories, and pages, with an arrow showing the tree is surfaced as the navigation.">
  <defs>
    <marker id="arw-ia-nav" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" class="dgm-fill"/>
    </marker>
  </defs>
  <g class="dgm-accent">
    <text x="400" y="24" text-anchor="middle" font-size="12" font-weight="700">NAVIGATION — what the user sees</text>
    <rect x="180" y="40" width="440" height="40" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <line x1="290" y1="40" x2="290" y2="80" stroke="currentColor" stroke-width="1.5"/>
    <line x1="400" y1="40" x2="400" y2="80" stroke="currentColor" stroke-width="1.5"/>
    <line x1="510" y1="40" x2="510" y2="80" stroke="currentColor" stroke-width="1.5"/>
    <text x="235" y="65" text-anchor="middle" font-size="13">Home</text>
    <text x="345" y="65" text-anchor="middle" font-size="13">Guides</text>
    <text x="455" y="65" text-anchor="middle" font-size="13">Topics</text>
    <text x="565" y="65" text-anchor="middle" font-size="13">About</text>
  </g>
  <line x1="400" y1="150" x2="400" y2="84" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-ia-nav)"/>
  <text x="416" y="120" text-anchor="start" font-size="11" class="dgm-muted">surfaced as</text>
  <rect x="360" y="150" width="80" height="34" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="400" y="172" text-anchor="middle" font-size="13">Root</text>
  <line x1="400" y1="184" x2="250" y2="222" stroke="currentColor" stroke-width="1.5"/>
  <line x1="400" y1="184" x2="400" y2="222" stroke="currentColor" stroke-width="1.5"/>
  <line x1="400" y1="184" x2="550" y2="222" stroke="currentColor" stroke-width="1.5"/>
  <rect x="200" y="222" width="100" height="32" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="250" y="243" text-anchor="middle" font-size="12">Guides</text>
  <rect x="350" y="222" width="100" height="32" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="400" y="243" text-anchor="middle" font-size="12">Topics</text>
  <rect x="500" y="222" width="100" height="32" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="550" y="243" text-anchor="middle" font-size="12">About</text>
  <line x1="400" y1="254" x2="360" y2="292" stroke="currentColor" stroke-width="1.5"/>
  <line x1="400" y1="254" x2="440" y2="292" stroke="currentColor" stroke-width="1.5"/>
  <rect x="320" y="292" width="80" height="28" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="360" y="311" text-anchor="middle" font-size="11">Page</text>
  <rect x="405" y="292" width="80" height="28" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="445" y="311" text-anchor="middle" font-size="11">Page</text>
  <text x="400" y="339" text-anchor="middle" font-size="12" class="dgm-muted">INFORMATION ARCHITECTURE — the underlying structure</text>
</svg>
<figcaption><b>The iceberg beneath the menu.</b> Navigation is the visible view; the information architecture is the structure it exposes.</figcaption>
</figure>

Classic IA is built from four interlocking systems. **Organization** decides how
content is grouped — the taxonomy, whether by topic, task, or audience.
**Labeling** chooses the words that name those groups. **Navigation** sets how
people move between them. **Search** lets people query instead of browse. Good
architecture makes those four agree with how users already think.
IA is not only a digital concern. A museum groups fossils by era; a supermarket
gathers like products in one aisle; both are information environments people read
through language and category. That is the deeper claim of the discipline — we
experience products and services as *environments constructed out of words and
groupings* — and when those are structured well, the environment feels predictable
even when the information behind it is complex.
## Scent, and the Shape of a Hierarchy

Two goals sit at the center of IA. **Findability** is whether users can locate
something they are actively looking for; **discoverability** is whether they can
stumble onto something useful they did not know to seek. Both depend on
**information scent** — the idea, borrowed from foraging theory, that people
"follow their noses," judging from a label or link whether it leads toward their
goal. Weak scent — vague labels, clever-but-empty verbs, a lonely "Learn more" —
is behind most of the field's catalogued mistakes; strong scent lets users commit
to a path with confidence.

Structure also has a shape. A **flat** hierarchy is broad and shallow — many
choices at each level, few levels deep; a **deep** hierarchy is narrow and tall. A
tree with branching factor $b$ and depth $d$ reaches $b^{d}$ destinations at its
leaves, so breadth and depth trade off against each other. The popular
"three-click rule" — that nothing should sit more than three clicks away — is
simply false; users tolerate more clicks when each one carries good scent. And
when an item honestly belongs in two places, **polyhierarchy** — deliberately
cross-listing it — improves findability rather than forcing a false choice.

<figure>
<svg viewBox="0 0 760 300" role="img" aria-label="On the left, a flat hierarchy where one root branches directly to five pages. On the right, a deep hierarchy where a root branches through two intermediate levels before reaching pages.">
  <text x="190" y="28" text-anchor="middle" font-size="12" font-weight="700">FLAT — broad and shallow</text>
  <rect x="150" y="46" width="80" height="30" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="190" y="66" text-anchor="middle" font-size="12">Root</text>
  <line x1="190" y1="76" x2="70" y2="150" stroke="currentColor" stroke-width="1.5"/>
  <line x1="190" y1="76" x2="130" y2="150" stroke="currentColor" stroke-width="1.5"/>
  <line x1="190" y1="76" x2="190" y2="150" stroke="currentColor" stroke-width="1.5"/>
  <line x1="190" y1="76" x2="250" y2="150" stroke="currentColor" stroke-width="1.5"/>
  <line x1="190" y1="76" x2="310" y2="150" stroke="currentColor" stroke-width="1.5"/>
  <rect x="50" y="150" width="40" height="26" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <rect x="110" y="150" width="40" height="26" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <rect x="170" y="150" width="40" height="26" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <rect x="230" y="150" width="40" height="26" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <rect x="290" y="150" width="40" height="26" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="190" y="214" text-anchor="middle" font-size="11" class="dgm-muted">fewer clicks · harder to scan</text>
  <line x1="380" y1="20" x2="380" y2="280" stroke="currentColor" stroke-width="1" class="dgm-muted"/>
  <text x="570" y="28" text-anchor="middle" font-size="12" font-weight="700">DEEP — narrow and tall</text>
  <rect x="535" y="44" width="70" height="28" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="570" y="63" text-anchor="middle" font-size="12">Root</text>
  <line x1="570" y1="72" x2="510" y2="112" stroke="currentColor" stroke-width="1.5"/>
  <line x1="570" y1="72" x2="630" y2="112" stroke="currentColor" stroke-width="1.5"/>
  <rect x="480" y="112" width="60" height="26" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <rect x="600" y="112" width="60" height="26" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <line x1="510" y1="138" x2="475" y2="180" stroke="currentColor" stroke-width="1.5"/>
  <line x1="510" y1="138" x2="545" y2="180" stroke="currentColor" stroke-width="1.5"/>
  <line x1="630" y1="138" x2="595" y2="180" stroke="currentColor" stroke-width="1.5"/>
  <line x1="630" y1="138" x2="665" y2="180" stroke="currentColor" stroke-width="1.5"/>
  <rect x="450" y="180" width="50" height="24" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <rect x="520" y="180" width="50" height="24" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <rect x="570" y="180" width="50" height="24" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <rect x="640" y="180" width="50" height="24" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <line x1="475" y1="204" x2="475" y2="244" stroke="currentColor" stroke-width="1.5"/>
  <line x1="665" y1="204" x2="665" y2="244" stroke="currentColor" stroke-width="1.5"/>
  <rect x="450" y="244" width="50" height="24" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <rect x="640" y="244" width="50" height="24" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="570" y="286" text-anchor="middle" font-size="11" class="dgm-muted">more clicks · needs strong scent</text>
</svg>
<figcaption><b>Breadth versus depth.</b> A flat tree puts everything within reach but crowds each level; a deep tree keeps levels tidy but demands strong scent at every step.</figcaption>
</figure>

## Testing a Structure You Cannot See

Because architecture is invisible until someone gets lost, IA has its own research
methods. In **card sorting**, participants group labeled cards into categories
that make sense to them — an open sort lets them name the groups, a closed sort
supplies the names. Aggregated across users and drawn as a dendrogram, the results
expose the audience's shared **mental model**: the categories they expect before a
designer imposes any. **Tree testing** runs the experiment in reverse — users are
given a bare, unstyled hierarchy and a set of tasks, and their success reveals
whether the structure itself is findable, independent of visual polish. The
throughline is humility: the right architecture matches the user's mental model,
not the org chart.

Structure also gets drawn before it gets built. A **wireframe** is a low-fidelity
blueprint — simple boxes and placeholders — that fixes the content hierarchy,
information architecture, and user flow before any visual design begins, climbing
from rough low-fidelity sketches through mid-fidelity layouts to high-fidelity
screens as the idea firms up. Wireframing early tests navigation and task flows,
aligns a team on functionality, and catches usability problems while they are still
cheap to fix — the discipline of settling *how the experience works before how it
looks*.

## Context Architecture: Arranging What the AI Knows

The same discipline now reaches inside the machine. **Context architecture** applies
information-architecture principles to the information environment surrounding an AI
system — deciding what the model receives, how it is organized, and how that shapes
its behavior. The context ecosystem is a structure in its own right: the user's
prompt and conversation history, the system instructions and guardrails, retrieved
knowledge and RAG sources, the available tools and APIs, stored preferences and
long-term memory, and the current system state. Arranging it raises the familiar IA
questions in new clothing — what belongs in the context at all, how concepts should
be labeled and categorized, which sources deserve greater authority, what the system
should remember or forget, and what it must *never* do. And as in classic IA, more
is not better: irrelevant or poorly structured context adds cost, introduces
retrieval noise, and produces inconsistent answers. Context *engineering* builds the
plumbing; context *architecture* gives that information structure, meaning, and
boundaries.

## When the Architect Is an Algorithm

Everything so far assumes a designed, inspectable structure — a map every visitor
shares and an analyst can audit. Recommender-driven products break that assumption.
TikTok's "For You" feed, and its kin, replace the shared taxonomy with a learned,
personalized ranking: instead of browsing one hierarchy, each person is served a
stream sampled from a per-user distribution $p(\text{item}\mid\text{you})$. The
blueprint is no longer public; it is private, dynamic, and effectively opaque — a
"black box" users can know only through its outputs.

<figure>
<svg viewBox="0 0 800 320" role="img" aria-label="On the left, a shared taxonomy tree that three users all navigate. On the right, a personalized ranking box labeled p of item given you feeds three different ordered feeds, one per user.">
  <defs>
    <marker id="arw-feed" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" class="dgm-fill"/>
    </marker>
  </defs>
  <text x="195" y="26" text-anchor="middle" font-size="12" font-weight="700">SHARED TAXONOMY</text>
  <rect x="160" y="42" width="70" height="28" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="195" y="61" text-anchor="middle" font-size="12">Root</text>
  <line x1="195" y1="70" x2="110" y2="108" stroke="currentColor" stroke-width="1.5"/>
  <line x1="195" y1="70" x2="195" y2="108" stroke="currentColor" stroke-width="1.5"/>
  <line x1="195" y1="70" x2="280" y2="108" stroke="currentColor" stroke-width="1.5"/>
  <rect x="80" y="108" width="60" height="26" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <rect x="165" y="108" width="60" height="26" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <rect x="250" y="108" width="60" height="26" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <circle cx="120" cy="250" r="12" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <circle cx="195" cy="250" r="12" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <circle cx="270" cy="250" r="12" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <line x1="120" y1="238" x2="180" y2="72" stroke="currentColor" stroke-width="1" stroke-dasharray="4 4" class="dgm-muted"/>
  <line x1="195" y1="238" x2="195" y2="72" stroke="currentColor" stroke-width="1" stroke-dasharray="4 4" class="dgm-muted"/>
  <line x1="270" y1="238" x2="210" y2="72" stroke="currentColor" stroke-width="1" stroke-dasharray="4 4" class="dgm-muted"/>
  <text x="195" y="292" text-anchor="middle" font-size="11" class="dgm-muted">one map, everyone shares it</text>
  <line x1="400" y1="20" x2="400" y2="300" stroke="currentColor" stroke-width="1" class="dgm-muted"/>
  <g class="dgm-accent">
    <text x="600" y="26" text-anchor="middle" font-size="12" font-weight="700">PERSONALIZED FEED</text>
    <rect x="512" y="42" width="176" height="40" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <text x="600" y="67" text-anchor="middle" font-size="14" font-weight="700">p(item | you)</text>
    <line x1="600" y1="82" x2="490" y2="128" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-feed)"/>
    <line x1="600" y1="82" x2="600" y2="128" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-feed)"/>
    <line x1="600" y1="82" x2="710" y2="128" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-feed)"/>
  </g>
  <circle cx="470" cy="140" r="10" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <circle cx="600" cy="140" r="10" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <circle cx="730" cy="140" r="10" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <rect x="446" y="160" width="48" height="20" class="dgm-soft" stroke="currentColor" stroke-width="1.3"/>
  <rect x="446" y="182" width="48" height="20" fill="none" stroke="currentColor" stroke-width="1.3"/>
  <rect x="446" y="204" width="48" height="20" fill="none" stroke="currentColor" stroke-width="1.3"/>
  <rect x="576" y="160" width="48" height="20" fill="none" stroke="currentColor" stroke-width="1.3"/>
  <rect x="576" y="182" width="48" height="20" class="dgm-soft" stroke="currentColor" stroke-width="1.3"/>
  <rect x="576" y="204" width="48" height="20" fill="none" stroke="currentColor" stroke-width="1.3"/>
  <rect x="706" y="160" width="48" height="20" fill="none" stroke="currentColor" stroke-width="1.3"/>
  <rect x="706" y="182" width="48" height="20" fill="none" stroke="currentColor" stroke-width="1.3"/>
  <rect x="706" y="204" width="48" height="20" class="dgm-soft" stroke="currentColor" stroke-width="1.3"/>
  <text x="600" y="292" text-anchor="middle" font-size="11" class="dgm-muted">a different order for each user</text>
</svg>
<figcaption><b>From map to stream.</b> A taxonomy is one structure everyone can inspect; a recommender samples a private, per-user ranking, so no two people see the same architecture.</figcaption>
</figure>

That opacity has consequences the readings document. Because users cannot see the
structure, they build **algorithmic literacy** out of perception and **folk
theories** — intuitive stories about why the feed shows what it shows. Researchers
describe an "identity strainer," in which curation quietly suppresses or amplifies
content tied to race, body, or LGBTQ identity, and an **algorithmized self**, in
which people begin to shape their behavior to the feed even as the feed shapes them.
Discoverability stops being a property of a map; it becomes whatever the model
decides to surface.

## Structure Is Never Value-Neutral

Even a hand-drawn taxonomy encodes values — what gets grouped, what earns a
prominent label, whose mental model wins. When an algorithm arranges information at
scale and personalizes it per person, those value choices become both more powerful
and harder to see, which is why "human values for AI" belongs in the same
conversation as sitemaps.

The readings press the point from two directions. Keyes and colleagues'
deliberately grotesque satire, *A Mulching Proposal*, runs a monstrous system
through the **Fairness, Accountability, and Transparency (FAT)** checklist and
dutifully "improves" its scores — demonstrating that a procedural checklist can
certify a system whose very purpose is indefensible. Auditing the mechanism is a
*reformist* fix that never asks whether the thing should exist at all. From the
practitioner's side, Varanasi and Goyal's interview study of Responsible AI teams
finds the work "currently hodgepodge": abstract values like justice are hard to
measure and get deprioritized against metrics that are easy to quantify, and teams
cope with **value levers** — small, low-cost activities that force a values
conversation into the workflow, much as card sorting forces users' mental models
into a design.

## Why It Matters

Whether the arranger is a designer or a model, information architecture decides what
people can find, understand, and — increasingly — become. The classic discipline
still supplies the fundamentals: organize around real mental models, label with
honest scent, balance breadth against depth, and test the structure rather than
trusting it — instincts that now extend inward, to the context we hand an AI: what
it is given, how it is labeled, and what it is allowed to do. The algorithmic era
adds two duties on top. Keep the structure
legible, so people retain some literacy about why they see what they see; and
interrogate the values the structure encodes, because when the architecture curates
identity as readily as it curates articles, findability is no longer only a
usability metric — it is an ethical one.
