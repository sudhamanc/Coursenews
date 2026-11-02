---
course: ai-foundations
lectureId: W5
title: "Only the Summit Matters: Hill Climbing, Simulated Annealing, and Genetic Algorithms"
deck: "When the answer is a configuration rather than a route, there is no need to remember how you got anywhere. Keep one state, nudge it, keep the nudge if it helps — and then find ways around the hilltops that are not the highest."
order: 5
readingTime: 14
tags: ["local-search", "hill-climbing", "simulated-annealing", "genetic-algorithms", "optimization"]
concepts:
  - id: local-search
    term: Local Search
    definition: "Search that keeps a single complete configuration (or a few) and repeatedly moves to a neighbouring one, judged by an objective function. It ignores the path, uses almost no memory, and can return its best state whenever it is stopped."
  - id: objective-landscape
    term: State-Space Landscape
    definition: "The picture of local search as terrain: each state has a location and an elevation given by the objective function. Hill climbing looks for the highest peak (or, with a cost, the lowest valley) and is trapped by local maxima, plateaus, shoulders and ridges."
  - id: hill-climbing
    term: Hill Climbing
    definition: "Greedy local search: from the current state, move to the best neighbour; stop when no neighbour is better. Fast and memory-free, but it halts at the first local optimum it reaches."
  - id: random-restart
    term: Random-Restart Hill Climbing
    definition: "Run hill climbing repeatedly from random initial states and keep the best result. If one run succeeds with probability p, about 1/p runs are expected; the method is complete with probability approaching 1."
  - id: simulated-annealing
    term: Simulated Annealing
    definition: "Local search that picks a random neighbour, always accepts it if it is better, and accepts a worse one with probability e^(−Δ/T), where Δ is how much worse it is and the temperature T falls over time. Cooled slowly enough, it finds a global optimum with probability approaching 1."
  - id: local-beam-search
    term: Local Beam Search
    definition: "Keep k states instead of one. Each step generates all successors of all k and keeps the k best of the combined list, so search effort flows toward the states that are making progress."
  - id: genetic-algorithm
    term: Genetic Algorithm
    definition: "A population of k states encoded as strings. Each generation selects parents in proportion to a fitness function, combines pairs by crossover, and occasionally mutates the offspring; the best individual is returned when one is fit enough or time runs out."
---

Every search so far has produced a **path**. The route from Arad to Bucharest was the
answer; the sequence of moves in a game was the answer. But a large class of problems
does not care how you arrive. Place eight queens on a board so that none attacks
another; lay out a chip so the wires are short; build an airline's crew rota. The
finished configuration is the solution, and the order in which you assembled it is
nobody's business. For these problems there is a much cheaper idea: hold one complete
configuration, look at its neighbours, move to a better one, and repeat. This feature
follows that idea from its simplest form — hill climbing, which is fast and gets stuck —
through the tricks that unstick it: restarting, accepting bad moves on a cooling
schedule, running several searches that share information, and breeding solutions
together.

**Sources:** AIMA Chapter 4 (Sections 4.1–4.2)

## 1. When the path is irrelevant

In many optimization problems **the goal state itself is the solution**. Local search
algorithms exploit that:

- The state space is the set of **complete configurations**: every state is a candidate
  answer, perhaps a bad one.
- The task is to find a configuration that **satisfies the constraints** or scores best on
  an **objective function**.
- The algorithm keeps a single **current state** and tries to improve it, moving only to
  **neighbours** — states one small change away.

Two consequences follow. Local search uses **very little memory** — usually a constant
amount, since there is no frontier and no explored set — so it works in state spaces too
large, or even continuous and infinite, for systematic search. And it is an **anytime**
algorithm: stop it whenever you like and it hands back the best state it has. What it
gives up is system. It is **not systematic**: it may never visit some states, so it can
miss the answer, and it cannot prove that none exists.

### The running example: n-queens

Put $n$ queens on an $n \times n$ board so that **no two share a row, column or
diagonal**. The complete-state formulation puts one queen in each column, so a state is
just the row of each queen; a move shifts one queen up or down within its column. For
eight queens that is $8^8 \approx 16.8$ million states, and each has $8 \times 7 = 56$
neighbours.

The objective is a count of trouble. Let

$$h = \text{number of pairs of queens attacking each other, directly or indirectly}$$

— "indirectly" meaning that a pair on the same line counts even if another queen sits
between them. A solution has $h = 0$, and the search is trying to drive $h$ down. On four
queens the lecture shows a typical descent: a board with five attacking pairs, one queen
moves and three remain, another moves and one remains, and one more move reaches zero.

## 2. Hill climbing

The simplest local search is the obvious one:

- Start wherever.
- Repeat: move to the **best neighbouring state**.
- If no neighbour is better than the current state, **quit**.

```python
def hill_climb(state):
    while True:
        best = max(state.neighbours(), key=value)
        if value(best) <= value(state):
            return state            # no uphill move left
        state = best
```

"Hill climbing" is the maximizing name — climb toward higher value. With a cost such as
the queens' $h$, the same algorithm descends; it is sometimes called **greedy local
search**, because it takes the best immediate step and never looks further.

On eight queens, the lecture's starting board has $h = 17$. Writing each neighbour's $h$
in the square its queen would move to shows the choices: the best moves bring $h$ down
to 12, and there are eight of them, so the algorithm picks one at random. A handful of
steps later it can arrive at a board where **$h = 1$** — one attacking pair — and every
single move makes things worse. The algorithm stops there. It has found a **local
minimum**, not a solution.

### What is good and bad about it

The good is real. Hill climbing needs **almost no memory**, it is **fast** — each step is
one look at the neighbours — and it is **anytime**. On eight queens it reaches its
answer in a handful of steps.

The bad is that its answer depends on where it started. AIMA reports that from random
starts, steepest-ascent hill climbing **solves 8-queens only about 14% of the time**;
the other 86% it gets stuck, after an average of about four steps when it succeeds and
three when it fails.

### The landscape

The standard way to picture this is a **state-space landscape**: lay the states out along
an axis and plot the objective above them. Hill climbing is a climber in fog who can
only feel the slope underfoot.

<figure>
<svg viewBox="0 0 820 330" role="img" aria-label="A one-dimensional state-space landscape. The horizontal axis is the state space and the vertical axis is the objective function. From the left, the curve rises to a flat shoulder, then climbs to the tall global maximum, falls into a valley, rises to a lower local maximum, dips, and ends on a flat-topped local maximum. A current state sits on the slope below the local maximum, and an arrow shows hill climbing carrying it up to that local peak rather than to the global maximum.">
  <defs>
    <marker id="arw-w5-land" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" class="dgm-fill"/>
    </marker>
  </defs>
  <line x1="60" y1="280" x2="790" y2="280" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-w5-land)"/>
  <line x1="60" y1="280" x2="60" y2="30" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-w5-land)"/>
  <text x="70" y="30" font-size="12">objective function</text>
  <text x="780" y="302" text-anchor="end" font-size="12">state space</text>
  <path d="M70,250 C110,245 130,215 150,180 L175,150 L215,150 C230,150 235,110 250,70 C262,40 278,40 290,70 C305,110 315,235 360,250 C395,262 415,200 440,140 C452,115 468,115 480,140 C495,175 505,210 520,205 C535,200 540,175 560,172 L610,172 C625,172 630,200 660,235 C690,255 730,258 780,258" fill="none" stroke="currentColor" stroke-width="2"/>
  <g class="dgm-accent"><circle cx="270" cy="47" r="6" class="dgm-fill"/></g>
  <text x="285" y="38" font-size="12" font-weight="700">global maximum</text>
  <circle cx="460" cy="120" r="5" fill="none" stroke="currentColor" stroke-width="1.6"/>
  <text x="472" y="105" font-size="12">local maximum</text>
  <text x="585" y="160" text-anchor="middle" font-size="12">“flat” local maximum</text>
  <text x="195" y="140" text-anchor="middle" font-size="12">shoulder</text>
  <g class="dgm-accent-2">
    <circle cx="425" cy="178" r="6" class="dgm-fill"/>
    <path d="M430,168 C438,152 444,140 452,130" fill="none" stroke="currentColor" stroke-width="1.8" marker-end="url(#arw-w5-land)"/>
    <text x="400" y="215" text-anchor="middle" font-size="12" font-weight="700">current state</text>
  </g>
</svg>
<figcaption><b>A state-space landscape.</b> From the current state every uphill step leads to the local maximum, so hill climbing stops there; the global maximum is never seen. On the shoulder and the flat local maximum no neighbour is better, so the climber has nowhere to go.</figcaption>
</figure>

The terrain has several traps:

- **Local maxima** — peaks lower than the highest one. Every neighbour is worse, so the
  algorithm halts. The $h = 1$ eight-queens board is one (a local *minimum* of cost).
- **Plateaus** — flat regions. A **flat local maximum** has no way up; a **shoulder** has a
  way up further along, but a strict hill climber cannot tell which.
- **Ridges** — a sequence of local maxima that rises in a direction no single move
  follows, so each step sees only downhill.

One common patch for plateaus is to allow **sideways moves** — moves to an equally good
neighbour — up to some limit, so the climber can walk across a shoulder. AIMA reports
that allowing up to 100 consecutive sideways moves lifts 8-queens success from 14% to
94%, at the cost of more steps per run.

## 3. Variants of hill climbing

The lecture names three, and is candid about their value.

- **Stochastic hill climbing** chooses **at random among the uphill moves**, perhaps
  weighting steeper ones more heavily. It usually climbs more slowly than taking the
  steepest step, and on some landscapes finds better answers.
- **First-choice hill climbing** generates neighbours **at random until one is better**
  than the current state, and takes it. That is useful when a state has thousands of
  neighbours and evaluating all of them each step is the bottleneck — but it is still
  trapped by the same local maxima.
- **Random-restart hill climbing** — the one that matters — runs hill climbing from a
  **fresh random state** each time it gets stuck, and keeps the best result.

Random restart is the variant with a guarantee. If each run succeeds with probability
$p$, the number of runs until success is geometric, with expectation

$$\mathbb{E}[\text{runs}] = \frac{1}{p}.$$

For 8-queens without sideways moves, $p \approx 0.14$, so about **seven** runs — some
22 steps in all — find a solution. As the number of restarts grows, the probability of
having found the global optimum approaches 1, so random-restart hill climbing is
**complete with probability approaching 1**. The catch is $p$: on a landscape covered in
small peaks, a random start rarely lands in the basin of the highest one, and $1/p$ can
be astronomical.

## 4. Simulated annealing

Hill climbing never moves downhill, so it is incomplete. A purely random walk is
complete but absurdly slow. **Simulated annealing** blends the two.

The name comes from metallurgy. To remove crystal dislocations from metal, you **heat**
it so the atoms come unstuck from their positions, then **cool it slowly**, so they wander
and settle into configurations of lower energy. Cool it too fast and the defects freeze
in place.

The algorithmic version escapes local optima by **allowing some bad moves, but gradually
decreasing their probability**:

- At each step, pick a **random** neighbour, not the best one.
- If it is **better**, move to it.
- If it is **worse**, move to it anyway **with a probability** that depends on how much
  worse it is and on a parameter called the **temperature** $T$.
- **Higher temperatures allow more bad moves** than lower ones. **Annealing** is the
  gradual lowering of the temperature by a **schedule**.

For a minimization problem with energy (cost) $E$, write $\Delta E = E(\text{next}) -
E(\text{current})$ for how much worse the move is. A worsening move ($\Delta E > 0$) is
accepted with probability

$$P(\text{accept}) = e^{-\Delta E / T}.$$

```python
import itertools, math, random

def simulated_annealing(state, schedule):
    for t in itertools.count(1):
        T = schedule(t)
        if T == 0:
            return state
        nxt = random.choice(state.neighbours())
        delta = energy(nxt) - energy(state)      # > 0 means worse
        if delta < 0 or random.random() < math.exp(-delta / T):
            state = nxt
```

The deck uses the AIMA pseudocode, which writes $\Delta E \leftarrow
\text{VALUE}(\textit{current}) - \text{VALUE}(\textit{next})$, moves when $\Delta E > 0$,
and otherwise moves with probability $e^{-\Delta E/T}$. Read literally, those lines
disagree: in the "otherwise" branch $\Delta E \le 0$, so the exponent is non-negative and
the "probability" is at least 1 — every bad move would be taken. What is meant is the
version above: improvements are always taken, and a move that is worse by an amount
$|\Delta E|$ is taken with probability $e^{-|\Delta E|/T}$, which is always below 1.

### What the temperature does

The formula has two dials, and both behave sensibly:

| A move worse by $\Delta E = 2$ | $T = 10$ | $T = 1$ | $T = 0.1$ |
|---|---|---|---|
| $P(\text{accept}) = e^{-2/T}$ | $0.82$ | $0.14$ | $2 \times 10^{-9}$ |

- **Worse moves are less likely** than mildly bad ones at the same temperature.
- **Bad moves become rarer as $T$ falls.** Early on the search wanders almost freely,
  crossing valleys between peaks; late on it behaves like hill climbing, polishing
  whatever basin it has settled in. When the schedule reaches $T = 0$, it stops.

The lecture's visualization is a ball on a rolling surface: with enough "heat" it can
hop out of a shallow dip that would trap a pure descent, and as it cools it comes to
rest in a deep one.

### Properties

- **One can prove** that if $T$ decreases **slowly enough**, simulated annealing finds a
  **global optimum with probability approaching 1**.
- "Slowly enough" can be very slow. In practice one uses a **temperature schedule that
  fits the time budget** — geometric cooling, $T_{t+1} = \alpha T_t$ with $\alpha$ just
  below 1, is common — and **settles for a sub-optimal solution**.
- It **works very well in practice**, and is widely used in **airline scheduling**, VLSI
  layout, and other large combinatorial problems.

## 5. Local beam search

Keeping one state in memory is the source of local search's thrift, and of its
fragility. **Local beam search** keeps $k$:

- Start with **$k$ randomly generated states**.
- At each iteration, generate **all the successors of all $k$ states**.
- If any one is a goal, stop; otherwise select the **$k$ best successors from the complete
  list** and repeat.

This is not the same as $k$ random restarts run side by side. Restarts are independent;
in beam search the $k$ states **compete for the same $k$ slots**. A state with excellent
successors may contribute several of the next $k$, while a state stuck on a poor hill
contributes none — so effort flows to wherever progress is being made. The weakness is
the mirror image: the $k$ states can quickly crowd onto one hill and the search loses
its diversity. **Stochastic beam search** answers that by choosing the $k$ successors at
random, with probability increasing in their value, rather than strictly the best.

## 6. Genetic algorithms

Stochastic beam search already looks like natural selection: a population, fitter
members more likely to have descendants. **Genetic algorithms** take the analogy one step
further and let successors come from **two** parents.

- States are **strings over a finite alphabet** — the "genes". For eight queens, a state
  is the row of each queen, so `24748552` means the queen in column 1 is on row 2, the
  queen in column 2 on row 4, and so on.
- Begin with **$k$ randomly generated states**, the **population**.
- Select individuals for the next generation according to a **fitness function**.
- Create new states with two operators:
  - **Crossover:** combine two parents to produce offspring.
  - **Mutation:** change an offspring at random, with some **low probability**.

### A generation, step by step

For eight queens the fitness is the **number of non-attacking pairs of queens**, which
ranges from 0 to $\binom{8}{2} = 8 \times 7 / 2 = 28$. A solution scores 28.

<figure>
<svg viewBox="0 0 840 300" role="img" aria-label="One generation of a genetic algorithm on 8-queens, in five columns. Initial population: 24748552, 32752411, 24415124, 32543213. Fitness: 24, 23, 20, 11, giving selection probabilities 31, 29, 26 and 14 percent. Selection pairs 32752411 with 24748552, and 32752411 with 24415124. Crossover after the third digit gives 32748552 and 24752411; crossover after the fifth digit gives 32752124 and 24415411. Mutation changes one digit in three of the children: 32748152, 24752411 unchanged, 32252124, and 24415417.">
  <defs>
    <marker id="arw-w5-ga" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" class="dgm-fill"/>
    </marker>
  </defs>
  <g font-size="13" font-family="ui-monospace, SFMono-Regular, Menlo, monospace" text-anchor="middle">
    <rect x="20" y="40" width="110" height="30" fill="none" stroke="currentColor" stroke-width="1.3"/><text x="75" y="60">24748552</text>
    <rect x="20" y="90" width="110" height="30" fill="none" stroke="currentColor" stroke-width="1.3"/><text x="75" y="110">32752411</text>
    <rect x="20" y="140" width="110" height="30" fill="none" stroke="currentColor" stroke-width="1.3"/><text x="75" y="160">24415124</text>
    <rect x="20" y="190" width="110" height="30" fill="none" stroke="currentColor" stroke-width="1.3"/><text x="75" y="210">32543213</text>
    <rect x="320" y="40" width="110" height="30" class="dgm-soft" stroke="currentColor" stroke-width="1.3"/><text x="375" y="60">32752411</text>
    <rect x="320" y="90" width="110" height="30" fill="none" stroke="currentColor" stroke-width="1.3"/><text x="375" y="110">24748552</text>
    <rect x="320" y="140" width="110" height="30" class="dgm-soft" stroke="currentColor" stroke-width="1.3"/><text x="375" y="160">32752411</text>
    <rect x="320" y="190" width="110" height="30" fill="none" stroke="currentColor" stroke-width="1.3"/><text x="375" y="210">24415124</text>
    <rect x="500" y="40" width="110" height="30" fill="none" stroke="currentColor" stroke-width="1.3"/><text x="555" y="60"><tspan font-weight="700">327</tspan>48552</text>
    <rect x="500" y="90" width="110" height="30" fill="none" stroke="currentColor" stroke-width="1.3"/><text x="555" y="110">247<tspan font-weight="700">52411</tspan></text>
    <rect x="500" y="140" width="110" height="30" fill="none" stroke="currentColor" stroke-width="1.3"/><text x="555" y="160"><tspan font-weight="700">32752</tspan>124</text>
    <rect x="500" y="190" width="110" height="30" fill="none" stroke="currentColor" stroke-width="1.3"/><text x="555" y="210">24415<tspan font-weight="700">411</tspan></text>
    <rect x="690" y="40" width="110" height="30" fill="none" stroke="currentColor" stroke-width="1.3"/><text x="745" y="60">32748<tspan class="dgm-accent" font-weight="700">1</tspan>52</text>
    <rect x="690" y="90" width="110" height="30" fill="none" stroke="currentColor" stroke-width="1.3"/><text x="745" y="110">24752411</text>
    <rect x="690" y="140" width="110" height="30" fill="none" stroke="currentColor" stroke-width="1.3"/><text x="745" y="160">32<tspan class="dgm-accent" font-weight="700">2</tspan>52124</text>
    <rect x="690" y="190" width="110" height="30" fill="none" stroke="currentColor" stroke-width="1.3"/><text x="745" y="210">2441541<tspan class="dgm-accent" font-weight="700">7</tspan></text>
  </g>
  <g font-size="12" text-anchor="middle">
    <text x="200" y="60">24 · 31%</text>
    <text x="200" y="110">23 · 29%</text>
    <text x="200" y="160">20 · 26%</text>
    <text x="200" y="210">11 · 14%</text>
  </g>
  <g class="dgm-muted">
    <line x1="245" y1="105" x2="316" y2="57" stroke="currentColor" stroke-width="1.1" marker-end="url(#arw-w5-ga)"/>
    <line x1="245" y1="55" x2="316" y2="103" stroke="currentColor" stroke-width="1.1" marker-end="url(#arw-w5-ga)"/>
    <line x1="245" y1="110" x2="316" y2="153" stroke="currentColor" stroke-width="1.1" marker-end="url(#arw-w5-ga)"/>
    <line x1="245" y1="160" x2="316" y2="203" stroke="currentColor" stroke-width="1.1" marker-end="url(#arw-w5-ga)"/>
    <path d="M432,55 L460,80 L432,105 M460,80 L496,57 M460,80 L496,103" fill="none" stroke="currentColor" stroke-width="1.1"/>
    <path d="M432,155 L460,180 L432,205 M460,180 L496,157 M460,180 L496,203" fill="none" stroke="currentColor" stroke-width="1.1"/>
    <line x1="612" y1="55" x2="686" y2="55" stroke="currentColor" stroke-width="1.1" marker-end="url(#arw-w5-ga)"/>
    <line x1="612" y1="105" x2="686" y2="105" stroke="currentColor" stroke-width="1.1" marker-end="url(#arw-w5-ga)"/>
    <line x1="612" y1="155" x2="686" y2="155" stroke="currentColor" stroke-width="1.1" marker-end="url(#arw-w5-ga)"/>
    <line x1="612" y1="205" x2="686" y2="205" stroke="currentColor" stroke-width="1.1" marker-end="url(#arw-w5-ga)"/>
  </g>
  <g font-size="12" font-weight="700" text-anchor="middle">
    <text x="75" y="255">(a) population</text>
    <text x="200" y="255">(b) fitness</text>
    <text x="375" y="255">(c) selection</text>
    <text x="555" y="255">(d) crossover</text>
    <text x="745" y="255">(e) mutation</text>
  </g>
  <text x="420" y="288" text-anchor="middle" font-size="11" class="dgm-muted">bold digits came from the first parent of each pair · red digits were mutated</text>
</svg>
<figcaption><b>One generation for 8-queens.</b> Fitness decides how often each string is picked — the weakest, 32543213, is not picked at all and the strongest is picked twice. Pairs swap tails at a random cut point, and a few genes mutate.</figcaption>
</figure>

1. **Population.** Four random boards: `24748552`, `32752411`, `24415124`,
   `32543213`.
2. **Fitness.** They score 24, 23, 20 and 11. Selection probability is proportional to
   fitness, out of a total of $24 + 23 + 20 + 11 = 78$: $24/78 = 31\%$, $23/78 = 29\%$,
   $20/78 = 26\%$ and $11/78 = 14\%$.
3. **Selection.** Four parents are drawn with those probabilities. In this draw
   `32752411` is chosen twice, `24748552` and `24415124` once each, and `32543213` not at
   all; the parents are paired off.
4. **Crossover.** Each pair chooses a random **cut point** and swaps the pieces. The first
   pair cuts after position 3, giving `327|48552` and `247|52411`; the second cuts after
   position 5, giving `32752|124` and `24415|411`.
5. **Mutation.** Each gene of each child changes at random with a small independent
   probability. Here three children are hit: `32748552` → `32748152`, `32752124` →
   `32252124`, and `24415411` → `24415417`.

On the board, crossover means **taking the left columns from one parent and the right
columns from the other**. If the first parent has the left three queens well placed and
the second has the right five well placed, the child can inherit both good halves — a
combination neither single-parent move could reach in one step.

### The algorithm

```python
def genetic_algorithm(population, fitness, p_mutate=0.05):
    while not good_enough(population) and not out_of_time():
        weights = [fitness(x) for x in population]
        next_gen = []
        for _ in range(len(population)):
            p1, p2 = random.choices(population, weights, k=2)
            child = reproduce(p1, p2)
            if random.random() < p_mutate:
                child = mutate(child)
            next_gen.append(child)
        population = next_gen
    return max(population, key=fitness)

def reproduce(p1, p2):
    c = random.randint(1, len(p1))      # cut point
    return p1[:c] + p2[c:]
```

This is the deck's AIMA version, in which each pair produces one child (the figure
shows the variant where a pair yields both complements). It stops when **some
individual is fit enough, or enough time has elapsed**, and returns the fittest.

### Why crossover can help — and when it cannot

Crossover pays off when **contiguous blocks of the string mean something on their own**.
In 8-queens a block of adjacent digits is a placement of adjacent columns, and a good
block stays good wherever it lands. Early on, when the population is diverse, crossover
takes big steps across the space; as the population converges, parents look alike and
the steps shrink, much as simulated annealing's do. If the encoding scatters related
genes across the string, crossover mostly breaks good solutions apart and a genetic
algorithm is little better than random restarts with extra bookkeeping. Choosing the
representation is most of the work.

## 7. Exercise: three airports for Romania

The lecture's exercise moves local search into **continuous** space. Using the familiar
map of Romania, place **three airports** so that the cities are, on the whole, close to
one:

- **State:** the airport coordinates $\mathbf{x} = (x_1, y_1, x_2, y_2, x_3, y_3)$ — six
  real numbers.
- **Cities:** fixed locations $c_1, \dots, c_n$, with $c = (x_c, y_c)$.
- $C_a$ is the set of cities whose **nearest airport is $a$**.
- **Objective:** minimize the total squared distance from each city to its nearest
  airport,

$$f(\mathbf{x}) = \sum_{a=1}^{3} \; \sum_{c \in C_a} \left[(x_a - x_c)^2 + (y_a - y_c)^2\right].$$

The deck stops at the formulation. Two standard ways to search it, from AIMA §4.2:

- **Discretize.** Allow each coordinate to move by $\pm\delta$, giving 12 neighbours per
  state, and run hill climbing or simulated annealing exactly as on a discrete problem.
- **Follow the gradient.** Holding the assignment of cities to airports fixed, the
  partial derivative for airport $a$ is
  $$\frac{\partial f}{\partial x_a} = 2 \sum_{c \in C_a} (x_a - x_c),$$
  and likewise for $y_a$. Steepest descent updates $\mathbf{x} \leftarrow \mathbf{x} -
  \alpha \nabla f(\mathbf{x})$ with a small step size $\alpha$.

Setting that derivative to zero gives a closed form: each airport should sit at the
**centroid of the cities it serves**. But moving an airport can change which cities are
nearest to it, which changes $C_a$, which moves the centroid again. Alternating the two
steps — assign each city to its nearest airport, move each airport to the centroid of
its cities — is exactly **k-means clustering**. It never increases $f$, so it always
converges, and it is still local search: where it ends depends on where the airports
started. In the lecture's figure, one airport lands among the western cities
around Arad and Timisoara, one in the north-east between Neamt, Iasi and Vaslui, and one
near Bucharest serving the south.

## Summary

- When **the goal is the solution and the path is irrelevant**, local search keeps one
  complete configuration and improves it. It uses **very little memory**, works in huge
  or continuous spaces, and is **anytime** — but it is **not systematic**.
- **Hill climbing** moves to the best neighbour until none is better. It is fast and
  greedy, and it stops at **local maxima**, **plateaus**, **shoulders** and **ridges**;
  from random starts it solves 8-queens about 14% of the time.
- **Random-restart hill climbing** is complete with probability approaching 1, with about
  $1/p$ runs expected; stochastic and first-choice variants change how a move is picked.
- **Simulated annealing** accepts worse moves with probability $e^{-\Delta E/T}$, lowering
  $T$ on a schedule; slow enough cooling finds a global optimum with probability
  approaching 1, and practical schedules trade that for speed.
- **Local beam search** keeps $k$ states that compete for $k$ places; **genetic
  algorithms** add **fitness-proportional selection**, **crossover** and **mutation**.
- In **continuous** spaces, the same ideas run on a discretized neighbourhood or on the
  **gradient** — and the airport problem turns out to be k-means.

Constraint satisfaction — where the structure of the constraints themselves can be
searched and reasoned over — comes next, and local search returns there as the
min-conflicts heuristic.

## Terms defined in one place

| Term | Definition |
|---|---|
| **Local search** | Improve one complete configuration by moving to neighbours; ignore the path |
| **Complete-state formulation** | Every state is a full candidate solution, e.g. one queen per column |
| **Neighbour** | A state one small change away, e.g. one queen moved within its column |
| **Objective function** | The quantity being maximized (value) or minimized (cost, energy, $h$) |
| **Anytime algorithm** | Can be stopped at any point and return its best answer so far |
| **State-space landscape** | States as locations, objective as elevation |
| **Local maximum** | A peak lower than the global maximum; no neighbour is better |
| **Plateau / shoulder** | A flat region; a shoulder has a way up further along |
| **Ridge** | Rising local maxima that no single move can follow |
| **Hill climbing** | Move to the best neighbour; stop when none is better |
| **Sideways move** | A move to an equally good neighbour, to cross plateaus |
| **Stochastic hill climbing** | Pick randomly among uphill moves |
| **First-choice hill climbing** | Generate random neighbours until one is better |
| **Random-restart hill climbing** | Restart from random states; about $1/p$ runs expected |
| **Simulated annealing** | Accept worse moves with probability $e^{-\Delta E/T}$; lower $T$ over time |
| **Temperature schedule** | How $T$ falls with time, e.g. $T_{t+1} = \alpha T_t$ |
| **Local beam search** | Keep the $k$ best of all successors of $k$ states |
| **Stochastic beam search** | Choose the $k$ successors at random, weighted by value |
| **Genetic algorithm** | Selection, crossover and mutation over a population of strings |
| **Fitness function** | The objective a genetic algorithm selects on |
| **Crossover** | Combine two parents at a cut point |
| **Mutation** | Randomly change a gene with low probability |

## What to interrogate, not just absorb

1. **"Found nothing" means nothing.** Local search cannot prove that a solution does not
   exist; it can only fail to find one. If a configuration *must* be ruled out, a
   systematic method has to do it.
2. **The neighbourhood is a design choice.** Which states count as neighbours decides
   which states are local optima. A move set that seems natural can make the landscape
   rugged; a richer one can smooth it, at the price of more evaluations per step.
3. **What did the schedule cost?** Simulated annealing's guarantee needs impractically
   slow cooling. Any reported result rests on a schedule someone tuned — ask how, and on
   which instances.
4. **Is the encoding friendly to crossover?** A genetic algorithm is only as good as the
   claim that adjacent genes form meaningful blocks. Without that, compare it honestly
   against random restarts given the same budget.
5. **Report the distribution, not the best run.** Stochastic search gives a different
   answer every time. A single good result says little; the spread over many seeds says
   how reliable the method is.
