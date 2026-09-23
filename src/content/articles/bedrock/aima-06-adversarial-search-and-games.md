---
course: bedrock
lectureId: AIMA 6
book: "Artificial Intelligence: A Modern Approach"
part: "II · Problem-solving"
title: "Planning Against Something That Is Planning Against You"
deck: "Chapter 6 adds an opponent, and the cost is immediate: you cannot choose a path, only a policy, and you must assume the other side will pick the branch you like least. Then it shows how alpha–beta halves the exponent and how Monte Carlo tree search abandons the evaluation function altogether."
order: 6
chapter: 6
readingTime: 14
tags: ["games", "minimax", "alpha-beta", "mcts", "evaluation-functions"]
concepts:
  - id: minimax-value
    term: The Minimax Value
    definition: "The utility of a state for MAX assuming both players play optimally to the end. Computed by backing up: MAX nodes take the maximum over children, MIN nodes the minimum, terminal nodes their utility."
  - id: alpha-beta
    term: Alpha–Beta Pruning
    definition: "Maintaining α (best value MAX can guarantee so far) and β (best MIN can guarantee) and cutting any branch that cannot affect the root value. It returns exactly the minimax value while, under perfect move ordering, examining O(b^(m/2)) nodes instead of O(b^m)."
  - id: eval-function
    term: The Evaluation Function
    definition: "A heuristic estimate of a state's expected utility, used at a cutoff depth in place of searching to termination. It must order states as true minimax would, agree with utility on terminal states, and be computable quickly."
  - id: cutoff-problems
    term: The Horizon Effect
    definition: "A depth-limited search pushes an unavoidable loss beyond its horizon with delaying moves, believing it has been averted. Quiescence search — extending only through volatile positions — is the standard mitigation."
  - id: mcts
    term: Monte Carlo Tree Search
    definition: "Estimate a state's value by averaging the outcomes of many simulated playouts rather than by applying a heuristic. Four phases repeat: selection, expansion, simulation, back-propagation."
  - id: ucb1
    term: UCB1 and the Selection Rule
    definition: "Select the child maximizing U(n)/N(n) + C√(log N(parent)/N(n)) — exploitation plus an exploration bonus that decays as a node is sampled. It makes MCTS's tree growth asymmetric, deepening in promising regions."
  - id: expectiminimax
    term: Expectiminimax
    definition: "For stochastic games, interleave chance nodes among MAX and MIN nodes and take the expectation over outcomes weighted by their probabilities. The evaluation function must now be a positive linear transform of expected utility, not merely order-preserving."
  - id: game-search-limits
    term: The Limitations
    definition: "Alpha–beta's root-level selectivity, the metareasoning problem of deciding what to examine, the failure to generalize across similar positions, and the fact that game-tree search presumes an opponent optimizing exactly what you assume they optimize."
---

Chapter 6 introduces the multi-agent case with one restriction that makes it
tractable: the environment is **zero-sum**. Whatever one side gains, the other
loses, which means the opponent's model is fully determined — they want exactly
what you do not. That is a strong assumption, and the chapter's closing section
is candid that dropping it (Chapter 17) changes everything. But within it, the
theory is unusually complete.

## The Value of a Position

For a two-player, zero-sum, perfect-information game, the game tree is defined by
an initial state, the legal moves in each state, a result function, a terminal
test, and a utility function on terminal states. The **minimax value** of a state
is what MAX can achieve against optimal play by MIN:

$$
\text{MINIMAX}(s) =
\begin{cases}
\text{UTILITY}(s) & \text{if } s \text{ is terminal} \\
\max_{a} \text{MINIMAX}(\text{RESULT}(s,a)) & \text{if } \text{TO-MOVE}(s) = \text{MAX} \\
\min_{a} \text{MINIMAX}(\text{RESULT}(s,a)) & \text{if } \text{TO-MOVE}(s) = \text{MIN}
\end{cases}
$$

The output is not a move sequence but a **strategy**: a specification of what to
do in every position that might arise, because the opponent's choices are theirs
to make. This is the same shift from path to contingent policy that Chapter 4
forced through nondeterminism, and here it is forced by an adversary instead.

Minimax is complete and optimal against an optimal opponent, and it is
$O(b^m)$ in time with $O(bm)$ space. For chess, with $b \approx 35$ and games
running 80 plies or more, the exponent is fatal. Everything after this is a
response to that.

The multiplayer extension replaces the scalar with a vector of utilities, one per
player, each maximizing their own component. The chapter observes that this
naturally produces alliances — and that in non-zero-sum multiplayer games,
alliances can be rational rather than merely social, which is the first crack in
the chapter's own framing.

## Alpha–Beta: The Exponent, Halved

The key observation is that you do not need a node's exact value if you can
establish it is irrelevant. Maintain $\alpha$, the best value MAX can guarantee
along the path so far, and $\beta$, the best MIN can guarantee. At a MIN node, if
its value drops to or below $\alpha$, MAX will never enter it, so its remaining
children need not be examined. Symmetrically at MAX nodes with $\beta$.

Alpha–beta returns **exactly** the minimax value — it is an exact optimization,
not an approximation. Its benefit depends entirely on **move ordering**. With
perfect ordering it examines $O(b^{m/2})$ nodes, which is to say it *doubles the
searchable depth* for a fixed budget. With random ordering it is about
$O(b^{3m/4})$. Practical orderings — try captures first, try the killer move that
caused a cutoff at the same depth elsewhere, use iterative deepening so the
previous iteration's best move is tried first — get close to the ideal.

The supporting machinery is where real strength comes from. **Transposition
tables** cache values for positions reachable by multiple move orders, which in
chess is a large fraction and can effectively double depth again. **Forward
pruning** — beam search on the most plausible moves, late move reductions,
null-move heuristics — abandons the exactness guarantee for further depth, and is
universal in strong programs.

## Cutting Off, and Paying For It

Since search to termination is impossible, replace the terminal test with a
**cutoff test** and the utility with an **evaluation function** estimating
expected utility from that position.

A good evaluation function must order terminal states as utility does, be fast
enough that the depth lost to computing it is repaid, and — for nonterminal
states — correlate strongly with actual chances of winning. The classical form is
a weighted linear combination of features, $\sum_i w_i f_i(s)$, such as material
counts in chess. The chapter is careful that this assumes feature independence,
which is false — a bishop's value depends on the pawn structure — and that this
motivates nonlinear combinations, which is precisely where learned evaluation
functions enter.

Two pathologies follow from cutting off. The **horizon effect** is the serious
one: a program facing unavoidable loss will play pointless delaying moves that
push the loss just past its search horizon, and conclude the loss has been
avoided. The mitigation is **quiescence search** — extend the search through
"volatile" positions such as pending captures until a quiet position is reached,
so evaluation is only applied where it is trustworthy. **Singular extensions**
similarly deepen lines with one clearly best move.

## Monte Carlo Tree Search

The alternative paradigm gives up on the evaluation function entirely. Where do
you get a heuristic for Go, where material has no meaning and the branching
factor is around 250? You do not — you **simulate**.

The value of a state is estimated by the average utility over many **playouts**
from it to termination. Four phases repeat:

```
loop:
  SELECT   descend the tree by the selection policy until a leaf
  EXPAND   add one (or more) children of that leaf
  SIMULATE play out to termination by the playout policy
  BACKPROP update win counts and visit counts up the path
```

The selection policy is what makes this work rather than merely sample. **UCB1**
selects the child maximizing

$$\frac{U(n)}{N(n)} + C\sqrt{\frac{\log N(\text{PARENT}(n))}{N(n)}}$$

— the exploitation term is the node's average utility, and the exploration term
grows with the parent's visit count and shrinks as the node itself is sampled, so
under-explored nodes are eventually tried while good nodes get most of the
budget. $C$ tunes the balance, and $\sqrt{2}$ is theoretically motivated.

<figure>
<svg viewBox="0 0 840 260" role="img" aria-label="The four phases of Monte Carlo tree search shown left to right: selection descending an asymmetric tree, expansion adding a new leaf, simulation playing out to a terminal result, and back-propagation updating statistics up the path.">
  <defs>
    <marker id="arw-aima6-mcts" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" class="dgm-fill"/>
    </marker>
  </defs>
  <text x="105" y="26" text-anchor="middle" font-size="11.5" font-weight="700">1 · SELECT</text>
  <text x="315" y="26" text-anchor="middle" font-size="11.5" font-weight="700">2 · EXPAND</text>
  <text x="525" y="26" text-anchor="middle" font-size="11.5" font-weight="700">3 · SIMULATE</text>
  <text x="735" y="26" text-anchor="middle" font-size="11.5" font-weight="700">4 · BACK-PROP</text>
  <circle cx="105" cy="58" r="8" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <circle cx="72" cy="108" r="8" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <circle cx="138" cy="108" r="8" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <circle cx="160" cy="158" r="8" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <line x1="100" y1="66" x2="77" y2="100" stroke="currentColor" stroke-width="1.2"/>
  <g class="dgm-accent">
    <line x1="110" y1="66" x2="133" y2="100" stroke="currentColor" stroke-width="2"/>
    <line x1="143" y1="116" x2="155" y2="150" stroke="currentColor" stroke-width="2"/>
  </g>
  <text x="105" y="196" text-anchor="middle" font-size="10.5" class="dgm-muted">follow UCB1 down</text>
  <circle cx="315" cy="58" r="8" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <circle cx="282" cy="108" r="8" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <circle cx="348" cy="108" r="8" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <circle cx="370" cy="158" r="8" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <line x1="310" y1="66" x2="287" y2="100" stroke="currentColor" stroke-width="1.2"/>
  <line x1="320" y1="66" x2="343" y2="100" stroke="currentColor" stroke-width="1.2"/>
  <line x1="353" y1="116" x2="365" y2="150" stroke="currentColor" stroke-width="1.2"/>
  <g class="dgm-accent">
    <circle cx="398" cy="200" r="8" class="dgm-soft" stroke="currentColor" stroke-width="1.8"/>
    <line x1="376" y1="166" x2="392" y2="192" stroke="currentColor" stroke-width="1.8"/>
  </g>
  <text x="330" y="232" text-anchor="middle" font-size="10.5" class="dgm-muted">add one new node</text>
  <circle cx="525" cy="58" r="8" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <circle cx="580" cy="158" r="8" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <line x1="530" y1="66" x2="575" y2="150" stroke="currentColor" stroke-width="1.2"/>
  <path d="M586 166 Q 620 196 600 226" fill="none" stroke="currentColor" stroke-width="1.5" stroke-dasharray="4 3" marker-end="url(#arw-aima6-mcts)"/>
  <text x="530" y="200" text-anchor="middle" font-size="10.5" class="dgm-muted">random playout</text>
  <text x="596" y="246" text-anchor="middle" font-size="11" font-weight="700">WIN</text>
  <circle cx="735" cy="58" r="8" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <circle cx="768" cy="108" r="8" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <circle cx="790" cy="158" r="8" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <g class="dgm-accent">
    <path d="M790 150 L772 118" fill="none" stroke="currentColor" stroke-width="1.8" marker-end="url(#arw-aima6-mcts)"/>
    <path d="M764 100 L740 68" fill="none" stroke="currentColor" stroke-width="1.8" marker-end="url(#arw-aima6-mcts)"/>
  </g>
  <text x="742" y="196" text-anchor="middle" font-size="10.5" class="dgm-muted">update U(n) and N(n)</text>
  <text x="742" y="212" text-anchor="middle" font-size="10.5" class="dgm-muted">along the path</text>
</svg>
<figcaption><b>Value without a heuristic.</b> MCTS replaces "how good does this position look?" with "how often does it win when played out?" — which is why it works in domains where nobody can write an evaluation function.</figcaption>
</figure>

The properties are complementary to alpha–beta's. MCTS grows the tree
**asymmetrically**, concentrating depth where it matters, and it is **anytime** —
interruptible with a usable answer. It needs no evaluation function, which is the
whole point for Go. It can be combined with learning, where a trained network
supplies both the playout policy and a value estimate, which is the AlphaGo
architecture. Its weakness is the mirror image: because it averages, a single
devastating refutation buried in one line may be sampled too rarely to register —
exactly the situation where alpha–beta's exhaustive-within-the-window search
excels. The chapter's judgment is that alpha–beta dominates where a good
evaluation function exists and the branching factor is moderate, and MCTS where
neither holds.

## Chance and Concealment

**Stochastic games** add chance nodes, and **expectiminimax** takes the
probability-weighted expectation over their children. The important consequence
is about evaluation functions: for deterministic games the evaluation need only
*order* states correctly, since only comparisons matter. Once expectations are
taken, the *magnitudes* matter, so the evaluation function must be a positive
linear transformation of the expected utility. Getting this wrong produces
systematically bad play in backgammon-like games even with a "correct" ordering.
The complexity also worsens to $O(b^m n^m)$ for $n$ chance outcomes, which is why
sampling replaces exhaustive expectation in practice.

**Partially observable games** cover Kriegspiel and card games. For card games,
**averaging over clairvoyance** — sample deals, solve each with perfect
information, and pick the move that scores best on average — is the standard
approximation. The chapter is precise about why it is wrong: it assumes the game
will become fully observable after the current move, so it never values
information-gathering or deception. A correct treatment needs belief states over
the opponent's cards, which is Chapter 17's territory.

## The Limitations

The closing section is unusually self-critical for a textbook. Alpha–beta is
selective about which *paths* to explore but computes exact values at the root,
spending effort distinguishing between moves that are all clearly losing. Good
play would require **metareasoning** — reasoning about which computations are
worth performing — which the algorithms lack. The search has no notion of
generalization: it evaluates positions one at a time with no transfer of insight
between similar ones, whereas human players reason with abstract concepts
("opposite-colored bishops draw") that summarize enormous classes of positions.

And the deepest limitation is the one the whole chapter is built on: minimax
assumes the opponent is optimizing exactly the objective you assume. Against a
suboptimal opponent, minimax is not the best response; against an opponent with
different goals, it is a category error.

## Why It Matters

Two ideas from this chapter are load-bearing far outside games.

**Alpha–beta** is the canonical demonstration that exact computation can be made
dramatically cheaper by proving that some results cannot matter — bound and
prune, without approximation. **MCTS** is the more consequential export: it is
the reason modern game-playing systems dominate, and its combination with learned
policy and value networks is the template now applied to program synthesis,
theorem proving, and multi-step reasoning in language models. When a system
samples many candidate continuations, scores them, and concentrates its budget on
the promising ones, it is running this chapter's second algorithm.
