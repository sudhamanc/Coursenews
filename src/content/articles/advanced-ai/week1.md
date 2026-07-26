---
course: advanced-ai
lectureId: W1
title: "A Crowd of Minds: The Case Against the Monolith"
deck: "Advanced AI's opening lecture reframes the frontier as a contest between one giant model and a swarm of simple, arguing agents — and makes the case for the crowd."
order: 1
readingTime: 7
tags: ["agentic-ai", "swarm-intelligence", "multi-agent", "ensembles", "wisdom-of-crowds"]
concepts:
  - id: agentic-ai
    term: Agentic AI
    definition: "An approach that treats intelligence as the product of many autonomous agents that each sense, decide, and act, rather than a single monolithic model; the course adopts it as an open, deliberately loose organizing theme."
  - id: hebbian-learning
    term: Hebbian Learning
    definition: "The principle that a connection strengthens when one neuron repeatedly helps fire another — 'cells that fire together wire together' — the biological seed of the weight updates used throughout machine learning."
  - id: ensemble-learning
    term: Ensemble Learning
    definition: "Combining many limited models through bagging, boosting, or random forests into one stronger predictor; the lecture frames it as a rough, algorithmic version of the wisdom of crowds."
  - id: mixture-of-experts
    term: Mixture of Experts
    definition: "A hybrid of deep networks and ensembles in which specialized sub-models live inside a larger network and a router activates only the relevant expert for each input, as in Google's Switch Transformer."
  - id: wisdom-of-crowds
    term: Wisdom of Crowds
    definition: "The observation that a diverse group, aggregated competently, often out-predicts any single expert — diversity of knowledge mattering more than individual expertise."
  - id: swarm-intelligence
    term: Swarm Intelligence
    definition: "Collective problem-solving in which simple, individually unaware agents produce near-optimal group decisions, as in bee foraging, ant-colony optimization, and particle-swarm optimization."
  - id: woc-bots
    term: Wisdom-of-Crowds Bots (WoC-Bots)
    definition: "A multi-agent classifier of hundreds to thousands of small MLP agents that hold diverse features, trade trust and certainty through social interaction, and reach a confidence-rated verdict via a bee-inspired scout–watcher vote; its meta-swarm variant can absorb any external prediction, including a large language model's."
---

Most graduate courses on advanced artificial intelligence begin where the
textbooks do — with deeper networks, larger transformers, and more data. This
one begins with a heresy. After the housekeeping, the first real slide is
titled, flatly, *An Alternative Approach to Deep Learning*, and the semester's
organizing obsession turns out not to be a single model at all but a crowd of
them. The throughline is **agentic AI**: intelligence assembled from many
autonomous parts that each sense, decide, and act, then negotiate a collective
answer. The term is introduced and then, pointedly, left loose — defined but not
*well*-defined, the class told to pick its own path through it.

## The Brain Doesn't Grow New Neurons

The argument starts in neuroscience, with a warning that perhaps half of the
biological detail in any current textbook will be overturned within fifteen
years. What survives is the *mechanism* of learning. The adult brain holds a
roughly fixed population of neurons from age five to sixty, yet it learns
ceaselessly — so learning cannot mean growing new hardware. It must mean
**synaptic plasticity**: changing the strength of the connections between
neurons that already exist.

That reframing has a direct computational analogue. A single neuron behaves like
a tiny arithmetic unit. Its dendrites act as an input vector arriving from more
than a thousand neighbors, each signal effectively multiplied by a weight. The
soma sums those excitatory and inhibitory contributions. The axon samples the
total and, if it clears a threshold, fires a pulse onward. Multiply, sum,
threshold: the artificial neuron in every deep network is a caricature of
exactly this.

<figure>
<svg viewBox="0 0 780 240" role="img" aria-label="A biological neuron modeled as computation: weighted inputs from dendrites are summed in the soma and passed through a threshold at the axon to produce an output.">
  <defs>
    <marker id="arw-aaw1-neuron" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" class="dgm-fill"/>
    </marker>
  </defs>
  <text x="60" y="40" text-anchor="middle" font-size="12" class="dgm-muted">dendrites (inputs)</text>
  <circle cx="60" cy="70" r="16" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="60" y="75" text-anchor="middle" font-size="13">x₁</text>
  <circle cx="60" cy="130" r="16" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="60" y="135" text-anchor="middle" font-size="13">x₂</text>
  <circle cx="60" cy="196" r="16" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="60" y="201" text-anchor="middle" font-size="13">xₙ</text>
  <line x1="78" y1="74" x2="286" y2="116" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-aaw1-neuron)"/>
  <line x1="78" y1="130" x2="286" y2="130" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-aaw1-neuron)"/>
  <line x1="78" y1="192" x2="286" y2="144" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-aaw1-neuron)"/>
  <text x="172" y="86" text-anchor="middle" font-size="12" class="dgm-accent">w₁</text>
  <text x="176" y="120" text-anchor="middle" font-size="12" class="dgm-accent">w₂</text>
  <text x="172" y="178" text-anchor="middle" font-size="12" class="dgm-accent">wₙ</text>
  <g class="dgm-accent">
    <circle cx="330" cy="130" r="46" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <text x="330" y="138" text-anchor="middle" font-size="24" font-weight="700">Σ</text>
  </g>
  <text x="330" y="200" text-anchor="middle" font-size="11" class="dgm-muted">soma</text>
  <line x1="376" y1="130" x2="470" y2="130" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-aaw1-neuron)"/>
  <rect x="474" y="102" width="150" height="56" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="549" y="126" text-anchor="middle" font-size="13" font-weight="700">threshold</text>
  <text x="549" y="146" text-anchor="middle" font-size="11" class="dgm-muted">axon: fire if &gt; θ</text>
  <line x1="624" y1="130" x2="704" y2="130" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-aaw1-neuron)"/>
  <text x="742" y="126" text-anchor="middle" font-size="14" font-weight="700">y</text>
  <text x="742" y="146" text-anchor="middle" font-size="10" class="dgm-muted">spike</text>
</svg>
<figcaption><b>The neuron as computation.</b> Dendrites multiply inputs by weights, the soma sums the excitatory and inhibitory signals, and the axon fires only past a threshold — the template for the artificial neuron.</figcaption>
</figure>

Learning, then, is weight adjustment, and the oldest rule for it is **Hebbian
learning**: if input neuron $x_i$ repeatedly helps fire output neuron $y$, the
synapse between them should grow. In a single line,

$$
w_i \leftarrow w_i + \eta\,x_i\,y,
$$

where $\eta$ is a learning rate. It is almost embarrassingly simple, yet this
correlational nudge — strengthen what co-fires — is the ancestor of a great many
modern learning algorithms.

## Why Not Just One Big Model?

If a lone neuron is the atom, the field's default molecule has become the very
large network. The lecture's counter-move is to ask what you gain by refusing to
pour all your faith into one. The first answer is **ensemble learning**. Rather
than train a single classifier, train many limited ones and combine their votes:
**bagging**, as in random forests, whose "random" trees are only loosely so; or
**boosting** — AdaBoost, XGBoost — which grows models in sequence so each fixes
its predecessor's mistakes. Ensembles earn their keep precisely where deep
learning struggles: limited data, poorly curated data, or a compute budget
better spent on many small models than one giant one. The lecture is blunt about
the family resemblance — an ensemble is a crude, algorithmic version of the
wisdom of crowds.

Deep learning has quietly adopted the same trick. **Mixture of experts** embeds a
set of specialized sub-networks inside one larger model and learns a *router*
that activates only the relevant expert for each input. Google's Switch
Transformer is the canonical case: a model with enormous nominal capacity that
nonetheless does modest work per token, because most of it stays dark on any
given pass. Ensembles, in other words, have crept inside the monolith.

## The Wisdom of Crowds

Push the idea past algorithms and you reach the social phenomenon that names it.
The **wisdom of crowds** holds that a diverse group, aggregated competently,
routinely beats any single expert. The operative word is *diversity*: a crowd of
clones is merely one opinion shouted louder, whereas a crowd with independent,
partial views lets individual errors cancel. Prediction markets — the stock
market being the largest — exploit this, but they are notoriously hard to
simulate, because they assume knowledgeable participants, and manufacturing
thousands of genuinely knowledgeable software agents is a years-long ask.
Platforms such as Unanimous AI take the opposite route, wiring real people
together so they can "swarm" toward a shared forecast, with striking results in
business and betting markets.

## What the Bees Know

Nature solved the aggregation problem long ago, and its solution is **swarm
intelligence**: individually clueless agents that, collectively, decide almost
optimally and consistently. A foraging honeybee has no concept of the hive's
economics, yet colonies exploit the best available food source more than
ninety-five percent of the time. Computer science has borrowed the pattern
repeatedly. **Ant-colony optimization** lays down virtual pheromone to solve
routing problems such as the traveling salesperson, and — unlike simulated
annealing — keeps updating in real time when the map changes underfoot: reroute a
delivery truck mid-route and the colony simply adapts. **Particle-swarm
optimization**, modeled on flocking, has each candidate solution remember its own
best position while watching the swarm's global best, balancing exploration
against exploitation. Because these methods search in parallel and lean on both
local and global memory, they thrive exactly where gradient descent and hill
climbing fail: noisy, nonlinear, non-differentiable landscapes.

## Building a Swarm of Classifiers

The course's own research turns these instincts into a working classifier:
**Wisdom-of-Crowds Bots**, or WoC-Bots. Hundreds to thousands of deliberately
simple agents each train a small multilayer perceptron — two to ten input
features, one to three hidden layers — on a slice of the problem. Diversity is
engineered in: every agent shares a few highly correlated "anchor" features and
is dealt the rest at random, so no two agents see quite the same world.

Then they argue. In each pairwise interaction an agent weighs how much to yield
by how certain it already is and how much it trusts its partner. Loosely, a
listener's *acceptance* is $1-\lvert\text{certainty}\rvert$, a speaker's
*influence* is its confidence scaled by that acceptance and its trust, and the
listener nudges its own certainty by that influence, tempered by the speaker's
track record — flipping the sign when the two disagree on the class. Belief,
trust, and performance history circulate through the population like gossip.

<figure>
<svg viewBox="0 0 820 250" role="img" aria-label="The WoC-Bots pipeline: many simple agents form independent beliefs, interact to update trust and certainty, are aggregated by a bee-inspired scout and watcher vote, and yield a confidence-rated prediction; external models can plug in as a meta-swarm.">
  <defs>
    <marker id="arw-aaw1-swarm" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" class="dgm-fill"/>
    </marker>
  </defs>
  <circle cx="58" cy="70" r="12" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <circle cx="95" cy="58" r="12" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <circle cx="120" cy="92" r="12" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <circle cx="70" cy="108" r="12" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <circle cx="105" cy="128" r="12" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <circle cx="55" cy="150" r="12" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="88" y="185" text-anchor="middle" font-size="12" font-weight="700">MLP agents</text>
  <text x="88" y="202" text-anchor="middle" font-size="11" class="dgm-muted">simple, diverse</text>
  <line x1="140" y1="105" x2="196" y2="105" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-aaw1-swarm)"/>
  <rect x="200" y="72" width="150" height="66" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="275" y="100" text-anchor="middle" font-size="13" font-weight="700">interaction</text>
  <text x="275" y="119" text-anchor="middle" font-size="11" class="dgm-muted">trust · certainty</text>
  <line x1="350" y1="105" x2="406" y2="105" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-aaw1-swarm)"/>
  <g class="dgm-accent">
    <rect x="410" y="72" width="160" height="66" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <text x="490" y="100" text-anchor="middle" font-size="13" font-weight="700">swarm vote</text>
    <text x="490" y="119" text-anchor="middle" font-size="11">scouts · watchers</text>
  </g>
  <line x1="570" y1="105" x2="626" y2="105" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-aaw1-swarm)"/>
  <rect x="630" y="72" width="160" height="66" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="710" y="100" text-anchor="middle" font-size="13" font-weight="700">prediction</text>
  <text x="710" y="119" text-anchor="middle" font-size="11" class="dgm-muted">confidence tiers</text>
  <rect x="410" y="196" width="160" height="42" stroke="currentColor" stroke-width="1.5" class="dgm-soft"/>
  <text x="490" y="214" text-anchor="middle" font-size="12">LLM / 3rd-party</text>
  <text x="490" y="230" text-anchor="middle" font-size="11" class="dgm-muted">plug-in belief</text>
  <line x1="490" y1="196" x2="490" y2="140" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-aaw1-swarm)"/>
</svg>
<figcaption><b>The swarm as classifier.</b> Simple, knowledge-diverse agents interact to update trust and certainty, then a bee-inspired scout–watcher vote yields a confidence-rated verdict; the meta-swarm can absorb an LLM or any outside model as just another voice.</figcaption>
</figure>

Aggregation borrows the bee's waggle dance. A fraction of agents become
**scouts** that advertise a prediction; the rest become **watchers**, assigned to
scouts by roulette-wheel selection, each casting a vote and free — within
limits — to defect to a better-performing scout. Iterate this and the system
reads off a *confidence tier* — very high, high, medium, or low — from how large a
majority forms and how quickly. Those tiers are informative rather than
cosmetic: on a breast-cancer dataset the highest-agreement predictions were
essentially perfect, while the low-confidence tail dragged the average down —
exactly the calibration you would want from an honest crowd.

Two properties lift the design above novelty. The first is **incremental feature
addition**. Because knowledge lives in the agents, a new feature arrives as a
batch of new agents mixing that feature with the shared anchors, and *no existing
agent is retrained* — yet accuracy barely differs from a full retrain. The
second is the **meta-swarm**: an agent's core belief need not come from an MLP at
all. It can be another algorithm's output, a partner institution's private
model, or a large language model's read on the data — each becomes one more voice
in the vote. That is what lets a swarm respect privacy across, say, hospitals
that share only predictions, never patient records, feature lists, or methods.
Benchmarked against deep networks, random forests, XGBoost, AdaBoost, and
logistic regression on problems from cancer metastasis to box-office success to
airline-passenger satisfaction, the swarm holds its own.

## Why It Matters

The opening lecture is really a map, and it deliberately points away from the
field's center of gravity. Where most of AI is consolidating intelligence into
single, ever-larger models, this course insists the frontier also runs the other
way — toward many small, diverse, autonomous agents whose intelligence is
*emergent* rather than engineered. That agentic stance is more than aesthetic. It
buys graceful behavior under incomplete data, distribution across cheap hardware,
updates without retraining, model-agnostic aggregation, and privacy by
construction — precisely the places a monolith turns brittle. Whether the future
belongs to the giant model, the crowd, or some negotiated peace between them is
left, like the definition of agentic AI itself, as the semester's open question.
