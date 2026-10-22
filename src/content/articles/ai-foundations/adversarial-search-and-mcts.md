---
course: ai-foundations
lectureId: W4
title: "When the Problem Plays Back: Minimax, Alpha-Beta, and Monte Carlo Tree Search"
deck: "Search assumes the world sits still while you plan. A game hands every other move to someone trying to beat you — and the algorithms that cope run from exhaustive pessimism, through pruning that never changes the answer, to random play steered by a gambler's arithmetic."
order: 4
readingTime: 21
tags: ["games", "minimax", "alpha-beta", "mcts", "bandits", "adversarial-search"]
concepts:
  - id: zero-sum-game
    term: Zero-Sum Game
    definition: "A game in which the players' utilities are exact opposites, so a single number describes every outcome: one player maximizes it and the other minimizes it. Pure competition, as opposed to general games where cooperation and indifference are possible."
  - id: minimax-value
    term: Minimax Value
    definition: "The best utility a player can guarantee from a state against an opponent who also plays optimally: the maximum over the children on MAX's turn, the minimum on MIN's, and the utility itself at a terminal state."
  - id: alpha-beta
    term: Alpha-Beta Pruning
    definition: "Minimax that skips branches which cannot affect the root's value. α is the best value MAX can already guarantee on the current path, β the best MIN can; once a node's value is known to fall outside (α, β), its remaining children are never examined."
  - id: move-ordering
    term: Move Ordering
    definition: "The order in which children are searched. Alpha-beta returns the same root value in any order, but with best moves first its cost falls from O(b^m) to O(b^(m/2)) — doubling the depth reachable in the same time."
  - id: evaluation-function
    term: Evaluation Function
    definition: "A fast estimate of a non-terminal position's minimax value, used to score the frontier of a depth-limited search. Typically a weighted linear sum of features such as material balance; the deeper it is applied, the less its errors matter."
  - id: monte-carlo-search
    term: Monte Carlo Search
    definition: "Estimating each move's value by playing many complete games from it with random moves and counting the wins. It needs no evaluation function, but treats every move equally and plays both sides badly."
  - id: mcts
    term: Monte Carlo Tree Search (MCTS)
    definition: "An anytime algorithm that grows a game tree one node per iteration — selection, expansion, simulation, backpropagation — keeping win and visit counts at each node so that sampling concentrates on the most promising lines."
  - id: multi-armed-bandit
    term: Multi-Armed Bandit
    definition: "The problem of spending a fixed budget of pulls across several slot machines with unknown payoffs so as to maximize total reward — the cleanest statement of the exploration–exploitation trade-off."
  - id: ucb1
    term: UCB1 and UCT
    definition: "UCB1 scores an arm as its average reward plus C·√(ln N / n_i), a bonus that shrinks as the arm is tried. UCT is MCTS that uses UCB1 to choose children; as iterations grow without bound, its values converge to minimax."
---

Every algorithm so far has assumed a world that holds still. The agent plans a route,
and the roads are where the map said they would be when it arrives. A game breaks that
assumption in the most direct way possible: after every move you make, someone else
moves, and they are trying to make you lose. A plan is no longer a sequence of actions
but a **strategy** — a reply ready for everything the opponent might do. This feature
follows how search adapts: minimax, which assumes the worst and is exact but
unaffordable; alpha-beta, which gets the same answer while ignoring most of the tree;
depth limits and evaluation functions, which give up exactness to play at all; and
Monte Carlo tree search, which replaces judgement with random games and a careful rule
for deciding which games to play.

**Sources:** AIMA Chapter 5 (Sections 5.1–5.4)

## 1. Where game-playing machines stand

The history is a ladder of branching factors.

- **Checkers.** The first computer player appeared in 1950. In 1994 the program
  **Chinook** took the world title when Marion Tinsley, champion for some forty years,
  withdrew from their match through illness; it played with a complete database of
  every endgame position with eight or fewer pieces. In 2007 checkers was **solved**:
  with perfect play by both sides it is a draw.
- **Chess.** In 1997 **Deep Blue** defeated world champion Garry Kasparov in a six-game
  match. It examined 200 million positions per second, used a very sophisticated
  evaluation function, and extended some lines of search as deep as 40 ply. Current
  programs are stronger still, if less historic.
- **Go.** With a branching factor above 300, Go resisted the methods that worked for
  chess for two decades. Classic programs leaned on pattern knowledge bases; the
  breakthrough came from randomized, **Monte Carlo** expansion. In 2016 **AlphaGo**
  defeated a top human champion using Monte Carlo tree search with a learned evaluation
  function (§9).
- **Pacman** and **poker** round out the field: one a real-time game against several
  adversaries, the other a game of hidden information and chance.

## 2. What kind of game is it?

Games differ along several axes, and the algorithm depends on where a game sits:

- **Deterministic or stochastic?**
- **One, two, or more players?**
- **Zero-sum?**
- **Perfect information** — can every player see the whole state?
- **Turn-based** or simultaneous?

| | Deterministic | Chance |
|---|---|---|
| **Perfect information** | chess, checkers, Go, Othello | backgammon, Monopoly |
| **Imperfect information** | battleship, blind tic-tac-toe | bridge, poker, Scrabble |

Whatever the game, the goal is an algorithm that computes a **strategy** (a policy):
something that recommends a move from every state.

### A formal game

One standard formalization of a deterministic game:

- **States** $S$, starting at $s_0$.
- **Players** $P = \{1, \dots, N\}$, usually taking turns.
- **Actions** $A$, which may depend on the player and the state.
- A **transition function** $S \times A \to S$.
- A **terminal test** $S \to \{\text{true}, \text{false}\}$.
- **Terminal utilities** $S \times P \to \mathbb{R}$: what each player scores at each end
  state.

A solution for a player is a **policy** $S \to A$.

### Zero-sum and general games

In a **zero-sum game** the agents have **opposite utilities**: whatever one gains, the
other loses. That allows a single value per outcome, which one player maximizes and the
other minimizes — pure, adversarial competition. In **general games** the agents have
**independent utilities**, and cooperation, indifference and competition are all
possible. Everything in this feature is about the zero-sum case.

### Search versus games

| | Search | Games |
|---|---|---|
| Adversary | None | Yes |
| Solution | A (heuristic) method for finding a goal — a path | A **strategy**: a move for every possible opponent reply |
| Evaluation function | Estimated cost from start to goal through a node | Estimated **goodness of a position** |
| Examples | Path planning, scheduling | Chess, checkers, Othello, backgammon |

## 3. Minimax: assume the opponent is as good as you

Start with a single agent. The **value of a state** is the best utility achievable
from it. At a terminal state that is just the utility; at a non-terminal state it is
the **maximum over the children**, because the agent will choose its best option. If
the best leaf anywhere below the root is worth 8, the root is worth 8, however many 0s
and 2s lie elsewhere, and the agent simply walks toward it.

With an opponent the levels alternate. Games become search with four ingredients — an
**initial state**, a **successor function** returning (move, state) pairs, a **terminal
test**, and a **utility function** — and the tree's levels belong alternately to the two
players. In a deterministic, zero-sum game (tic-tac-toe, chess, checkers) call them
**MAX**, who wants the result high, and **MIN**, who wants it low.

The **minimax value** of a node is the best utility achievable **against a rational,
optimal adversary**:

$$
\text{MINIMAX}(s) =
\begin{cases}
\text{UTILITY}(s) & \text{if } s \text{ is terminal} \\
\max_{a} \text{MINIMAX}(\text{RESULT}(s, a)) & \text{if MAX is to move} \\
\min_{a} \text{MINIMAX}(\text{RESULT}(s, a)) & \text{if MIN is to move}
\end{cases}
$$

The terminal values are part of the game; everything above them is computed. In the
two-ply tree whose MIN nodes see leaves $\{8, 2\}$ and $\{5, 6\}$, the MIN nodes are
worth 2 and 5, and MAX's root is worth 5.

The procedure is easiest to see on a bigger tree. On your move, back up the **maximum**
of your choices; on the opponent's move, back up the **minimum**; at the root, make the
move that produces the maximum.

<figure>
<svg viewBox="0 0 840 340" role="img" aria-label="A four-level game tree. Fifteen leaf utilities, 3, 1, 4, 1, 5, 9, plus infinity, 2, minus 2, minus 3, minus 5, minus infinity, 4, minus infinity, 5, are backed up. The MAX level above the leaves takes the maximum of its children: 3, 4, 9, plus infinity, 2, minus 2, minus 3, minus infinity, 4, 5. The MIN level takes the minimum: 3, 2, minus infinity, 4. The root, a MAX node, takes the maximum, 4, and the highlighted path shows the move that produces it.">
  <text x="14" y="50" font-size="11" font-weight="700" class="dgm-muted">MAX</text>
  <text x="14" y="130" font-size="11" font-weight="700" class="dgm-muted">MIN</text>
  <text x="14" y="210" font-size="11" font-weight="700" class="dgm-muted">MAX</text>
  <text x="14" y="290" font-size="11" font-weight="700" class="dgm-muted">LEAF</text>
  <line x1="480" y1="62" x2="220" y2="110" stroke="currentColor" stroke-width="1.2" class="dgm-muted"/>
  <line x1="220" y1="142" x2="120" y2="190" stroke="currentColor" stroke-width="1.2" class="dgm-muted"/>
  <line x1="220" y1="142" x2="220" y2="190" stroke="currentColor" stroke-width="1.2" class="dgm-muted"/>
  <line x1="220" y1="142" x2="320" y2="190" stroke="currentColor" stroke-width="1.2" class="dgm-muted"/>
  <line x1="480" y1="62" x2="420" y2="110" stroke="currentColor" stroke-width="1.2" class="dgm-muted"/>
  <line x1="420" y1="142" x2="395" y2="190" stroke="currentColor" stroke-width="1.2" class="dgm-muted"/>
  <line x1="420" y1="142" x2="445" y2="190" stroke="currentColor" stroke-width="1.2" class="dgm-muted"/>
  <line x1="480" y1="62" x2="570" y2="110" stroke="currentColor" stroke-width="1.2" class="dgm-muted"/>
  <line x1="570" y1="142" x2="495" y2="190" stroke="currentColor" stroke-width="1.2" class="dgm-muted"/>
  <line x1="570" y1="142" x2="570" y2="190" stroke="currentColor" stroke-width="1.2" class="dgm-muted"/>
  <line x1="570" y1="142" x2="645" y2="190" stroke="currentColor" stroke-width="1.2" class="dgm-muted"/>
  <g class="dgm-accent"><line x1="480" y1="62" x2="732.5" y2="110" stroke="currentColor" stroke-width="2.4"/></g>
  <g class="dgm-accent"><line x1="732.5" y1="142" x2="695" y2="190" stroke="currentColor" stroke-width="2.4"/></g>
  <line x1="732.5" y1="142" x2="770" y2="190" stroke="currentColor" stroke-width="1.2" class="dgm-muted"/>
  <line x1="120" y1="222" x2="95" y2="274" stroke="currentColor" stroke-width="1.2" class="dgm-muted"/>
  <line x1="120" y1="222" x2="145" y2="274" stroke="currentColor" stroke-width="1.2" class="dgm-muted"/>
  <line x1="220" y1="222" x2="195" y2="274" stroke="currentColor" stroke-width="1.2" class="dgm-muted"/>
  <line x1="220" y1="222" x2="245" y2="274" stroke="currentColor" stroke-width="1.2" class="dgm-muted"/>
  <line x1="320" y1="222" x2="295" y2="274" stroke="currentColor" stroke-width="1.2" class="dgm-muted"/>
  <line x1="320" y1="222" x2="345" y2="274" stroke="currentColor" stroke-width="1.2" class="dgm-muted"/>
  <line x1="395" y1="222" x2="395" y2="274" stroke="currentColor" stroke-width="1.2" class="dgm-muted"/>
  <line x1="445" y1="222" x2="445" y2="274" stroke="currentColor" stroke-width="1.2" class="dgm-muted"/>
  <line x1="495" y1="222" x2="495" y2="274" stroke="currentColor" stroke-width="1.2" class="dgm-muted"/>
  <line x1="570" y1="222" x2="545" y2="274" stroke="currentColor" stroke-width="1.2" class="dgm-muted"/>
  <line x1="570" y1="222" x2="595" y2="274" stroke="currentColor" stroke-width="1.2" class="dgm-muted"/>
  <line x1="645" y1="222" x2="645" y2="274" stroke="currentColor" stroke-width="1.2" class="dgm-muted"/>
  <g class="dgm-accent"><line x1="695" y1="222" x2="695" y2="274" stroke="currentColor" stroke-width="2.4"/></g>
  <line x1="770" y1="222" x2="745" y2="274" stroke="currentColor" stroke-width="1.2" class="dgm-muted"/>
  <line x1="770" y1="222" x2="795" y2="274" stroke="currentColor" stroke-width="1.2" class="dgm-muted"/>
  <g class="dgm-accent"><circle cx="480" cy="46" r="16" class="dgm-soft" stroke="currentColor" stroke-width="1.8"/><text x="480" y="50" text-anchor="middle" font-size="12" font-weight="700">4</text></g>
  <circle cx="220" cy="126" r="16" fill="none" stroke="currentColor" stroke-width="1.5"/><text x="220" y="130" text-anchor="middle" font-size="12" font-weight="700">3</text>
  <circle cx="420" cy="126" r="16" fill="none" stroke="currentColor" stroke-width="1.5"/><text x="420" y="130" text-anchor="middle" font-size="12" font-weight="700">2</text>
  <circle cx="570" cy="126" r="16" fill="none" stroke="currentColor" stroke-width="1.5"/><text x="570" y="130" text-anchor="middle" font-size="12" font-weight="700">−∞</text>
  <g class="dgm-accent"><circle cx="732.5" cy="126" r="16" class="dgm-soft" stroke="currentColor" stroke-width="1.8"/><text x="732.5" y="130" text-anchor="middle" font-size="12" font-weight="700">4</text></g>
  <circle cx="120" cy="206" r="16" fill="none" stroke="currentColor" stroke-width="1.5"/><text x="120" y="210" text-anchor="middle" font-size="12" font-weight="700">3</text>
  <circle cx="220" cy="206" r="16" fill="none" stroke="currentColor" stroke-width="1.5"/><text x="220" y="210" text-anchor="middle" font-size="12" font-weight="700">4</text>
  <circle cx="320" cy="206" r="16" fill="none" stroke="currentColor" stroke-width="1.5"/><text x="320" y="210" text-anchor="middle" font-size="12" font-weight="700">9</text>
  <circle cx="395" cy="206" r="16" fill="none" stroke="currentColor" stroke-width="1.5"/><text x="395" y="210" text-anchor="middle" font-size="12" font-weight="700">+∞</text>
  <circle cx="445" cy="206" r="16" fill="none" stroke="currentColor" stroke-width="1.5"/><text x="445" y="210" text-anchor="middle" font-size="12" font-weight="700">2</text>
  <circle cx="495" cy="206" r="16" fill="none" stroke="currentColor" stroke-width="1.5"/><text x="495" y="210" text-anchor="middle" font-size="12" font-weight="700">−2</text>
  <circle cx="570" cy="206" r="16" fill="none" stroke="currentColor" stroke-width="1.5"/><text x="570" y="210" text-anchor="middle" font-size="12" font-weight="700">−3</text>
  <circle cx="645" cy="206" r="16" fill="none" stroke="currentColor" stroke-width="1.5"/><text x="645" y="210" text-anchor="middle" font-size="12" font-weight="700">−∞</text>
  <g class="dgm-accent"><circle cx="695" cy="206" r="16" class="dgm-soft" stroke="currentColor" stroke-width="1.8"/><text x="695" y="210" text-anchor="middle" font-size="12" font-weight="700">4</text></g>
  <circle cx="770" cy="206" r="16" fill="none" stroke="currentColor" stroke-width="1.5"/><text x="770" y="210" text-anchor="middle" font-size="12" font-weight="700">5</text>
  <rect x="76" y="274" width="38" height="24" fill="none" stroke="currentColor" stroke-width="1.3"/><text x="95" y="290" text-anchor="middle" font-size="11.5">3</text>
  <rect x="126" y="274" width="38" height="24" fill="none" stroke="currentColor" stroke-width="1.3"/><text x="145" y="290" text-anchor="middle" font-size="11.5">1</text>
  <rect x="176" y="274" width="38" height="24" fill="none" stroke="currentColor" stroke-width="1.3"/><text x="195" y="290" text-anchor="middle" font-size="11.5">4</text>
  <rect x="226" y="274" width="38" height="24" fill="none" stroke="currentColor" stroke-width="1.3"/><text x="245" y="290" text-anchor="middle" font-size="11.5">1</text>
  <rect x="276" y="274" width="38" height="24" fill="none" stroke="currentColor" stroke-width="1.3"/><text x="295" y="290" text-anchor="middle" font-size="11.5">5</text>
  <rect x="326" y="274" width="38" height="24" fill="none" stroke="currentColor" stroke-width="1.3"/><text x="345" y="290" text-anchor="middle" font-size="11.5">9</text>
  <rect x="376" y="274" width="38" height="24" fill="none" stroke="currentColor" stroke-width="1.3"/><text x="395" y="290" text-anchor="middle" font-size="11.5">+∞</text>
  <rect x="426" y="274" width="38" height="24" fill="none" stroke="currentColor" stroke-width="1.3"/><text x="445" y="290" text-anchor="middle" font-size="11.5">2</text>
  <rect x="476" y="274" width="38" height="24" fill="none" stroke="currentColor" stroke-width="1.3"/><text x="495" y="290" text-anchor="middle" font-size="11.5">−2</text>
  <rect x="526" y="274" width="38" height="24" fill="none" stroke="currentColor" stroke-width="1.3"/><text x="545" y="290" text-anchor="middle" font-size="11.5">−3</text>
  <rect x="576" y="274" width="38" height="24" fill="none" stroke="currentColor" stroke-width="1.3"/><text x="595" y="290" text-anchor="middle" font-size="11.5">−5</text>
  <rect x="626" y="274" width="38" height="24" fill="none" stroke="currentColor" stroke-width="1.3"/><text x="645" y="290" text-anchor="middle" font-size="11.5">−∞</text>
  <g class="dgm-accent"><rect x="676" y="274" width="38" height="24" fill="none" stroke="currentColor" stroke-width="1.3"/><text x="695" y="290" text-anchor="middle" font-size="11.5">4</text></g>
  <rect x="726" y="274" width="38" height="24" fill="none" stroke="currentColor" stroke-width="1.3"/><text x="745" y="290" text-anchor="middle" font-size="11.5">−∞</text>
  <rect x="776" y="274" width="38" height="24" fill="none" stroke="currentColor" stroke-width="1.3"/><text x="795" y="290" text-anchor="middle" font-size="11.5">5</text>
  <text x="420" y="330" text-anchor="middle" font-size="10.5" class="dgm-muted">values flow upward: max on your move, min on the opponent’s</text>
</svg>
<figcaption><b>Minimax, bottom to top.</b> The MAX level takes 3 from {3, 1}, 9 from {5, 9}, and so on; MIN then takes 3, 2, −∞ and 4; the root takes 4. The highlighted path is the principal variation: the line both sides follow if both play perfectly. The +∞ under the second MIN node is irrelevant — MIN simply never allows it.</figcaption>
</figure>

Notice what the root's 4 means. The third branch contains a $+\infty$ and the first
contains a 9, but MAX cannot have them: MIN chooses at the level below and will steer
away. Minimax values are guarantees, not hopes.

### Minimax as code

Minimax is a pair of mutually recursive functions — a depth-first traversal of the game
tree:

```python
def minimax_decision(state):
    # MAX picks the action whose resulting state has the highest MIN-value
    return max(state.actions(), key=lambda a: min_value(state.result(a)))

def max_value(state):
    if state.is_terminal():
        return state.utility()
    v = float("-inf")
    for a in state.actions():
        v = max(v, min_value(state.result(a)))
    return v

def min_value(state):
    if state.is_terminal():
        return state.utility()
    v = float("inf")
    for a in state.actions():
        v = min(v, max_value(state.result(a)))
    return v
```

### What it costs

| Property | Minimax |
|---|---|
| Complete? | **Yes**, if the tree is finite |
| Optimal? | **Yes**, against an optimal opponent |
| Time | $O(b^m)$ |
| Space | $O(bm)$ — depth-first exploration |

Here $b$ is the branching factor and $m$ the maximum depth. Against a *suboptimal*
opponent, minimax is still safe — it never does worse than its guarantee — but it may
pass up chances a weaker opponent would have allowed.

The time column is the problem. Chess has $b \approx 35$ and $m \approx 100$ for a
reasonable game, so the full tree has about $35^{100} \approx 10^{154}$ nodes — against
roughly $10^{82}$ atoms in the observable universe. Even ten moves deep there are
$35^{10} \approx 2.8 \times 10^{15}$ positions. An exact solution is not merely slow; it
is physically out of reach.

### Try it

A MAX–MIN–MAX tree has leaves, left to right, **6, 5, 8, 7, 2, 1, 4, 3**. The bottom MAX
nodes are worth 6, 8, 2 and 4; the MIN nodes $\min(6, 8) = 6$ and $\min(2, 4) = 2$; the
root is worth **6**, and MAX should move **left**.

## 4. Alpha-beta: the same answer from a fraction of the tree

You do not need to look at every node to find the minimax value of the root. Some
branches provably cannot matter, and **alpha-beta pruning** skips them while returning
exactly the value minimax would.

It tracks two numbers along the current path:

- **α** — the highest value MAX can already guarantee at some choice point on the path
  (starts at $-\infty$).
- **β** — the lowest value MIN can already guarantee at some choice point on the path
  (starts at $+\infty$).

Whenever a node's value is certain to fall outside $(\alpha, \beta)$, the player who
would have to allow it will not, and the rest of that node's children can be skipped.

The classic example has a MAX root $A$ over three MIN nodes:

1. **$B$** sees 3, 12 and 8, and is worth 3. MAX now has a guaranteed 3: $\alpha = 3$.
2. **$C$**'s first leaf is 2, so $C$ is worth **at most** 2. MAX already has 3 and will
   never choose a move worth at most 2. $C$'s other two leaves are never generated —
   they could be $-10{,}000$ or $+10{,}000$ and the root would not change.
3. **$D$** sees 14 (worth at most 14), then 5 (at most 5), then 2: worth 2.
4. The root is $\max(3, \le 2, 2) = 3$.

<figure>
<svg viewBox="0 0 840 340" role="img" aria-label="Alpha-beta pruning on a two-ply tree. MAX node A has three MIN children. B sees leaves 3, 12 and 8 and is worth 3, so MAX is guaranteed at least 3. C sees a first leaf of 2, so C is worth at most 2, which MAX will never prefer to 3; its other two leaves are pruned. D sees 14, 5 and 2, its bound tightening from at most 14 to at most 5 to exactly 2. The root is worth 3.">
  <text x="14" y="56" font-size="11" font-weight="700" class="dgm-muted">MAX</text>
  <text x="14" y="154" font-size="11" font-weight="700" class="dgm-muted">MIN</text>
  <line x1="420" y1="65" x2="180" y2="137" stroke="currentColor" stroke-width="1.3"/>
  <line x1="180" y1="166" x2="100" y2="248" stroke="currentColor" stroke-width="1.3"/>
  <line x1="180" y1="166" x2="180" y2="248" stroke="currentColor" stroke-width="1.3"/>
  <line x1="180" y1="166" x2="260" y2="248" stroke="currentColor" stroke-width="1.3"/>
  <line x1="420" y1="65" x2="420" y2="137" stroke="currentColor" stroke-width="1.3"/>
  <line x1="420" y1="166" x2="340" y2="248" stroke="currentColor" stroke-width="1.3"/>
  <line x1="420" y1="166" x2="420" y2="248" stroke="currentColor" stroke-width="1.2" stroke-dasharray="4 4" class="dgm-muted"/>
  <line x1="420" y1="166" x2="500" y2="248" stroke="currentColor" stroke-width="1.2" stroke-dasharray="4 4" class="dgm-muted"/>
  <line x1="420" y1="65" x2="660" y2="137" stroke="currentColor" stroke-width="1.3"/>
  <line x1="660" y1="166" x2="580" y2="248" stroke="currentColor" stroke-width="1.3"/>
  <line x1="660" y1="166" x2="660" y2="248" stroke="currentColor" stroke-width="1.3"/>
  <line x1="660" y1="166" x2="740" y2="248" stroke="currentColor" stroke-width="1.3"/>
  <polygon points="420,36 402,65 438,65" fill="none" stroke="currentColor" stroke-width="1.6"/>
  <text x="420" y="59" text-anchor="middle" font-size="11" font-weight="700">A</text>
  <text x="450" y="57" font-size="13" font-weight="700">= 3</text>
  <text x="450" y="38" font-size="10.5" class="dgm-muted">≥ 3 after B</text>
  <polygon points="162,137 198,137 180,166" fill="none" stroke="currentColor" stroke-width="1.6"/><text x="180" y="149" text-anchor="middle" font-size="11" font-weight="700">B</text>
  <g class="dgm-accent"><polygon points="402,137 438,137 420,166" fill="none" stroke="currentColor" stroke-width="1.6"/><text x="420" y="149" text-anchor="middle" font-size="11" font-weight="700">C</text></g>
  <polygon points="642,137 678,137 660,166" fill="none" stroke="currentColor" stroke-width="1.6"/><text x="660" y="149" text-anchor="middle" font-size="11" font-weight="700">D</text>
  <text x="208" y="154" font-size="13" font-weight="700">= 3</text>
  <g class="dgm-accent"><text x="448" y="154" font-size="13" font-weight="700">≤ 2</text></g>
  <text x="688" y="144" font-size="10.5" class="dgm-muted">≤ 14 → ≤ 5 →</text>
  <text x="688" y="162" font-size="13" font-weight="700">= 2</text>
  <g class="dgm-accent-2"><text x="430" y="104" font-size="10.5" font-weight="700">α = 3 passed down</text></g>
  <rect x="80" y="248" width="40" height="28" fill="none" stroke="currentColor" stroke-width="1.3"/><text x="100" y="267" text-anchor="middle" font-size="13">3</text>
  <rect x="160" y="248" width="40" height="28" fill="none" stroke="currentColor" stroke-width="1.3"/><text x="180" y="267" text-anchor="middle" font-size="13">12</text>
  <rect x="240" y="248" width="40" height="28" fill="none" stroke="currentColor" stroke-width="1.3"/><text x="260" y="267" text-anchor="middle" font-size="13">8</text>
  <rect x="320" y="248" width="40" height="28" fill="none" stroke="currentColor" stroke-width="1.3"/><text x="340" y="267" text-anchor="middle" font-size="13">2</text>
  <g class="dgm-accent"><rect x="400" y="248" width="40" height="28" fill="none" stroke="currentColor" stroke-width="1.3" stroke-dasharray="4 4"/><text x="420" y="266" text-anchor="middle" font-size="12" font-weight="700">?</text></g>
  <g class="dgm-accent"><rect x="480" y="248" width="40" height="28" fill="none" stroke="currentColor" stroke-width="1.3" stroke-dasharray="4 4"/><text x="500" y="266" text-anchor="middle" font-size="12" font-weight="700">?</text></g>
  <rect x="560" y="248" width="40" height="28" fill="none" stroke="currentColor" stroke-width="1.3"/><text x="580" y="267" text-anchor="middle" font-size="13">14</text>
  <rect x="640" y="248" width="40" height="28" fill="none" stroke="currentColor" stroke-width="1.3"/><text x="660" y="267" text-anchor="middle" font-size="13">5</text>
  <rect x="720" y="248" width="40" height="28" fill="none" stroke="currentColor" stroke-width="1.3"/><text x="740" y="267" text-anchor="middle" font-size="13">2</text>
  <g class="dgm-accent"><text x="420" y="300" text-anchor="middle" font-size="10.5" font-weight="700">pruned: never generated</text></g>
  <text x="420" y="328" text-anchor="middle" font-size="10.5" class="dgm-muted">MAX already has 3 from B; C can offer at most 2, so nothing under C can change the root</text>
</svg>
<figcaption><b>Pruning on the textbook tree.</b> Two of nine leaves are never generated. Note the order dependence: had D's 2 come first, D's other two leaves would have been pruned too.</figcaption>
</figure>

### Alpha-beta as code

The implementation is minimax with two extra parameters and one early return in each
function:

```python
def max_value(state, alpha, beta):
    if state.is_terminal():
        return state.utility()
    v = float("-inf")
    for a in state.actions():
        v = max(v, min_value(state.result(a), alpha, beta))
        if v >= beta:              # MIN above already has something no worse than this
            return v               # prune the remaining children
        alpha = max(alpha, v)
    return v

def min_value(state, alpha, beta):
    if state.is_terminal():
        return state.utility()
    v = float("inf")
    for a in state.actions():
        v = min(v, max_value(state.result(a), alpha, beta))
        if v <= alpha:             # MAX above already has something no worse than this
            return v
        beta = min(beta, v)
    return v
```

Here α is MAX's best option on the path to the root and β is MIN's.

### What pruning does and does not change

- **The root's value is unaffected.** Alpha-beta computes exactly the minimax value.
- **Intermediate values may be wrong** — and that includes the **children of the
  root**. A pruned node returns a *bound*, not its true value. Take a MAX root over two
  MIN nodes: the left sees a single leaf 10; the right sees 10 and then 0. After the
  left child, $\alpha = 10$. The right child's first leaf gives $v = 10 \le \alpha$, so it
  returns 10 without looking at the 0. Both children now report 10, but the right one is
  really worth 0. A naive implementation that searches each root child and then picks
  the best reported value can choose the wrong move. The fix is to select at the root
  with the running α, replacing the best move only on a *strictly* better value, so a
  child that returned a bound never displaces the move that earned it.
- **Move ordering matters enormously.** Searching the best moves first makes cutoffs
  happen earlier. With **perfect ordering**, time drops from $O(b^m)$ to
  $O(b^{m/2})$ — the effective branching factor becomes $\sqrt{b}$, which **doubles the
  depth** searchable in the same time. Full search of chess is still hopeless.
- **It is metareasoning** — computing about what to compute. Alpha-beta spends effort
  only where the answer could still change.

### Try it again

Redo the 6, 5, 8, 7, 2, 1, 4, 3 tree with alpha-beta, left to right. The first bottom MAX
node sees 6 and 5: worth 6, so the MIN node above has $\beta = 6$. The second MAX node
sees 8, which already beats $\beta = 6$ — MIN will never let MAX reach it — so the **7 is
pruned**. The left MIN node is worth 6, and the root has $\alpha = 6$. On the right, the
first MAX node sees 2 and 1, worth 2, so the right MIN node is worth at most 2, below
$\alpha = 6$: the whole last MAX node, **4 and 3, is pruned**. Three of eight leaves are
skipped, and the root is still 6.

## 5. Resource limits: stop early and guess

In realistic games, even alpha-beta cannot search to the leaves. The standard response
is **depth-limited search**: search to a fixed depth, and replace terminal utilities
with an **evaluation function** that scores the non-terminal positions found there.

The arithmetic of a time budget: with 100 seconds per move and 10,000 nodes explored per
second, a program can check about **1 million nodes per move**. With $b \approx 35$ and
good ordering, alpha-beta's $b^{m/2}$ reaches about **depth 8** ($35^4 \approx 1.5$
million) — a decent chess program.

Three consequences:

- **The guarantee of optimal play is gone.** Values are now only as good as the
  evaluation at the frontier.
- **More plies make a big difference.** Each extra level of lookahead lets the search
  see tactics that would otherwise be hidden beyond its horizon.
- **Use iterative deepening** to get an **anytime algorithm**: search to depth 1, then 2,
  then 3, and so on, always holding the best move from the last completed depth. When
  the clock runs out, play it. Each iteration also supplies move ordering for the next,
  which is what makes the repetition nearly free.

### Evaluation functions

An evaluation function scores a non-terminal position. The **ideal** one returns the
position's actual minimax value — which would make search unnecessary. In practice it
is typically a **weighted linear sum of features**:

$$\text{Eval}(s) = w_1 f_1(s) + w_2 f_2(s) + \dots + w_n f_n(s)$$

with, for example, $f_1(s)$ = (number of white queens − number of black queens). The
familiar chess material values make a first evaluation function: pawn 10, knight 30,
bishop 30, rook 50, queen 90, king 900, counted positive for one side and negative for
the other. Positional features — king safety, pawn structure, mobility — sharpen it.
For Pacman, the features might be the distance to the nearest food, the number of food
pellets left, and the distance to the nearest ghost.

**Depth matters more than polish.** Evaluation functions are always imperfect, but the
deeper in the tree one is buried, the less its imperfection matters: errors at the
frontier get averaged and filtered by the max and min operations above them. This is an
important instance of a general trade-off — **complexity of features versus complexity
of computation**. A richer evaluation is slower and buys less depth; a cruder one is fast
and buys more. Strong programs are tuned along that line.

## 6. Go, and why minimax stalls there

Go is played on a 19×19 board. The branching factor **starts at 361** and decreases by
roughly one with each move. Compare chess:

| Game | Branching factor | Alpha-beta to depth 8 ($b^{8/2}$) | |
|---|---|---|---|
| Chess | ≈ 35 | $35^4 \approx 1.5$ million nodes | Feasible |
| Go | ≈ 300 | $300^4 \approx 8$ billion nodes | Difficult |

And that is with *perfect* ordering, which requires knowing the good moves already —
and with an evaluation function, which for Go is notoriously hard to write: material
counting means little in a game where the value of a stone depends on the whole board.

## 7. Monte Carlo: answers by sampling

**Monte Carlo methods** are algorithms that rely on **random sampling** to approximate
answers. The textbook illustration is integration. Asked to compute

$$A = \int_1^3 f(x)\,dx,$$

you could integrate symbolically by hand (automatic symbolic integration is not a solved
problem in general), or use a numerical scheme such as Simpson's rule. Or:

- Repeat $N$ times: pick a random $x$ uniformly between 1 and 3 and evaluate $f(x)$.
- Average the results and multiply by the width of the interval, $3 - 1 = 2$.

$$A \approx \frac{3 - 1}{N} \sum_{i=1}^{N} f(x_i)$$

The larger $N$, the better the approximation; the error shrinks like $1/\sqrt{N}$
regardless of how complicated $f$ is. (One caveat worth knowing: the method estimates
an integral that exists. The lecture's example integrand, $\sin(x)/(1 - x^2)$, has a
pole at $x = 1$ and its integral over $[1, 3]$ diverges, so no amount of sampling would
settle on an answer. The sampling recipe is the point, not that function.)

### Monte Carlo search

Applied to games, the idea replaces evaluation with experiment. Minimax opens the
complete tree up to a fixed depth and applies an evaluation function to the leaves.
**Monte Carlo search** instead runs, for each possible move at the root, a fixed number
of **complete random games** to the end, and needs no utility estimate at all (though it
can use one):

- For each possible move:
  - Repeat $n$ times: play a game to the end, selecting moves at random.
  - Count the percentage of wins.
- Select the move with the highest percentage of wins.

| Property | Monte Carlo search |
|---|---|
| Complete? | **No** |
| Optimal? | **No** |
| Time | $d \cdot n$ per candidate move — $n$ playouts of length up to $d$ |
| Memory | $b$ — one tally per root move |

It works much better than minimax for large games, but it has real problems: it spends
as many playouts on obviously bad moves as on good ones, and because both sides play at
random it measures how a move fares between two random players — not against an opponent
who will find the refutation.

## 8. Monte Carlo tree search

**MCTS** fixes both problems by growing a tree. The upper part of the search is an
explicit tree; below it, complete games are played out at random. Each tree node keeps a
count **w/t**: of the $t$ games played through this state in the current search, $w$ were
won.

Each iteration does four things:

1. **Selection.** Starting at the root, use the counts to choose a path down the tree to
   a node that still has unexplored children.
2. **Expansion.** Add **one** new node to the tree.
3. **Simulation.** From the new node, play a complete game at random to the end. This is
   a **playout** (or rollout).
4. **Backpropagation.** Update the win and visit counts on every node from the new one
   back up to the root.

The tree makes sure every relevant action is explored, which greatly alleviates the
randomness that affects plain Monte Carlo methods. The playouts serve to **estimate the
utility function**; they can be purely random or use an **opponent model**, if one is
available.

```text
MCTS(state, player):
    tree = new Node(state, player)
    repeat until the computation budget is exhausted:
        node = treePolicy(tree)                 # selection
        if node.isTerminal: child = node
        else: child = node.nextChild()          # expansion
        R = playout(child)                      # simulation
        child.propagateReward(R)                # backpropagation
    return tree.bestChild()
```

### Which child to explore: ε-greedy

The tree policy faces a dilemma. It should spend most of its time on **good children** —
there is no point wasting playouts on bad ones — but some time on **bad children** too,
because evaluation is stochastic and a child that looks bad may simply have been
unlucky.

The simplest compromise is **ε-greedy**: with probability $1 - \varepsilon$, choose the
current best child; with probability $\varepsilon$, choose one at random.

"Best" itself needs care. Suppose a root at 60/100 has children at **55/85**, 1/10 and
**4/5**. The last wins 80% of the time, but on only five samples; the first wins about
65%, on 85. The first is the **safer** choice — the other cannot be trusted as good until
it has been sampled more. Win rates mean little without the number of trials behind
them.

ε-greedy has a structural weakness. With children at A: 40/100, B: 39/100 and C:
2/100, it explores B and C with **exactly the same probability**, though B is clearly
almost as good as A and C clearly is not. And long after one child is plainly best, it
keeps spending a fraction $\varepsilon$ of every budget on the bad ones.

### The bandit problem

The cleaner way to think about this is the **multi-armed bandit**. You walk into a
casino and see a row of slot machines ("one-armed bandits"). You have no idea which gives
the best chance of winning, and you have 100 tokens. How do you maximize your expected
winnings? In game-tree terms: you have a collection of moves and only enough CPU time to
sample each a few times — how do you spread that time to find the best one?

**ε-greedy as a bandit strategy:** with a small ε (say 0.1), keep each arm's average
earnings so far (earnings divided by coins spent). Before each coin, find the best arm;
with probability $1 - \varepsilon$ play it, otherwise play a random one.

Take three arms with expected rewards **A: \$2, B: \$1, C: \$0.10** per coin. Once ε-greedy
has identified A, it still spends 10% of its coins at random, a third of them on each
arm, so its earnings per coin level off at

$$0.9 \times 2 + 0.1 \times \tfrac{2 + 1 + 0.1}{3} \approx \$1.90$$

— permanently short of the \$2 available, and never improving.

### UCB1: optimism with a shrinking excuse

**Upper Confidence Bounds (UCB1)** balances exploration and exploitation better. It plays
the arm $i$ with the highest

$$\text{UCB1}_i = v_i + C \sqrt{\frac{\ln N}{n_i}}$$

where $v_i$ is the arm's average reward so far, $n_i$ the coins put into that arm, $N$
the coins spent in total, and $C$ a constant. The first term is **high for arms we believe
are good**. The second is **high for arms we have not explored much**, and it shrinks as an
arm is tried, but grows slowly (logarithmically) for arms left alone, so none is
abandoned forever. On the three-arm example, UCB1's earnings per coin climb toward the
full \$2: it **spends fewer and fewer coins on suboptimal arms over time**, where
ε-greedy spends a fixed fraction forever.

### UCT: UCB1 in the tree

**UCT** (UCB applied to trees) is MCTS with UCB1 as the selection rule. For a node $n$
with $U(n)$ wins in $N(n)$ visits,

$$\text{UCB1}(n) = \frac{U(n)}{N(n)} + C \sqrt{\frac{\ln N(\text{Parent}(n))}{N(n)}}$$

Repeat until out of time:

- **Selection:** recursively apply UCB1 to choose a path down to a leaf node $n$.
- **Expansion:** add a new child $c$ to $n$.
- **Simulation:** run a rollout from $c$.
- **Backpropagation:** update the $U$ and $N$ counts from $c$ back up to the root.

Then **choose the action leading to the child with the highest $N$**.

<figure>
<svg viewBox="0 0 840 470" role="img" aria-label="One iteration of Monte Carlo tree search on a small tree whose nodes are labelled wins over visits. Selection follows UCB1 from the root, 4 of 8, to a child at 2 of 4, then 1 of 3, then a leaf at 1 of 1. Expansion adds a new child at 0 of 0. Simulation plays a random game from it to the end, which blue wins. Backpropagation adds a visit to every node on the path and a win to the nodes where blue made the move, so the counts become 4 of 9, 3 of 5, 1 of 4, 2 of 2 and 0 of 1.">
  <defs>
    <marker id="arw-w4-mcts" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" class="dgm-fill"/>
    </marker>
  </defs>
  <g class="dgm-accent-2"><line x1="300" y1="59" x2="150" y2="121" stroke="currentColor" stroke-width="2.6"/></g>
  <line x1="300" y1="59" x2="360" y2="121" stroke="currentColor" stroke-width="1.2" class="dgm-muted"/>
  <line x1="300" y1="59" x2="480" y2="121" stroke="currentColor" stroke-width="1.2" class="dgm-muted"/>
  <line x1="150" y1="139" x2="90" y2="201" stroke="currentColor" stroke-width="1.2" class="dgm-muted"/>
  <g class="dgm-accent-2"><line x1="150" y1="139" x2="210" y2="201" stroke="currentColor" stroke-width="2.6"/></g>
  <line x1="360" y1="139" x2="330" y2="201" stroke="currentColor" stroke-width="1.2" class="dgm-muted"/>
  <line x1="360" y1="139" x2="400" y2="201" stroke="currentColor" stroke-width="1.2" class="dgm-muted"/>
  <line x1="210" y1="219" x2="160" y2="281" stroke="currentColor" stroke-width="1.2" class="dgm-muted"/>
  <g class="dgm-accent-2"><line x1="210" y1="219" x2="260" y2="281" stroke="currentColor" stroke-width="2.6"/></g>
  <g class="dgm-accent"><line x1="260" y1="299" x2="260" y2="356" stroke="currentColor" stroke-width="1.8" stroke-dasharray="5 3"/></g>
  <circle cx="300" cy="50" r="9" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="314" y="54" font-size="11.5" font-weight="700">4/8 → 4/9</text>
  <circle cx="150" cy="130" r="9" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="164" y="134" font-size="11.5" font-weight="700">2/4 → 3/5</text>
  <circle cx="360" cy="130" r="9" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="374" y="134" font-size="11.5">1/3</text>
  <circle cx="480" cy="130" r="9" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="494" y="134" font-size="11.5">0/1</text>
  <circle cx="90" cy="210" r="9" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="104" y="214" font-size="11.5">0/1</text>
  <circle cx="210" cy="210" r="9" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="224" y="214" font-size="11.5" font-weight="700">1/3 → 1/4</text>
  <circle cx="330" cy="210" r="9" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="344" y="214" font-size="11.5">0/1</text>
  <circle cx="400" cy="210" r="9" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="414" y="214" font-size="11.5">1/1</text>
  <circle cx="160" cy="290" r="9" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="174" y="294" font-size="11.5">0/1</text>
  <circle cx="260" cy="290" r="9" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="274" y="294" font-size="11.5" font-weight="700">1/1 → 2/2</text>
  <g class="dgm-accent"><circle cx="260" cy="365" r="9" class="dgm-soft" stroke="currentColor" stroke-width="1.8"/></g>
  <text x="274" y="369" font-size="11.5" font-weight="700">0/0 → 0/1</text>
  <g class="dgm-accent"><path d="M260,376 C250,388 270,396 260,408 C250,420 270,428 260,440" fill="none" stroke="currentColor" stroke-width="1.6" stroke-dasharray="3 3" marker-end="url(#arw-w4-mcts)"/></g>
  <text x="276" y="446" font-size="11" font-weight="700">random playout → blue wins</text>
  <text x="14" y="54" font-size="10.5" class="dgm-muted">blue to move</text>
  <text x="14" y="134" font-size="10.5" class="dgm-muted">red to move</text>
  <line x1="560" y1="30" x2="560" y2="450" stroke="currentColor" stroke-width="1" stroke-dasharray="4 4" class="dgm-muted"/>
  <g class="dgm-accent-2"><text x="580" y="64" font-size="12" font-weight="700">1. Selection</text></g>
  <text x="580" y="82" font-size="11">UCB1 at each level picks</text>
  <text x="580" y="98" font-size="11">2/4, then 1/3, then 1/1</text>
  <g class="dgm-accent"><text x="580" y="148" font-size="12" font-weight="700">2. Expansion</text></g>
  <text x="580" y="166" font-size="11">add one new child</text>
  <text x="580" y="182" font-size="11">to the leaf reached (0/0)</text>
  <text x="580" y="232" font-size="12" font-weight="700">3. Simulation</text>
  <text x="580" y="250" font-size="11">play random moves from</text>
  <text x="580" y="266" font-size="11">the new node to the end</text>
  <text x="580" y="316" font-size="12" font-weight="700">4. Backpropagation</text>
  <text x="580" y="334" font-size="11">+1 visit on every node of</text>
  <text x="580" y="350" font-size="11">the path; +1 win on nodes</text>
  <text x="580" y="366" font-size="11">where blue made the move</text>
</svg>
<figcaption><b>One UCT iteration.</b> Selection descends by UCB1 (blue), expansion adds one node (red), a random playout finishes the game, and backpropagation updates the path. Each node's wins are counted for the player who made the move into it — the player choosing among those children — which is why the 1/3 node gains a visit but not a win when blue wins.</figcaption>
</figure>

Two details in that picture are worth working through.

**Whose wins?** Each node's $U$ counts wins for the player who **moved into** it, because
that is the player who will be comparing it with its siblings. Blue is to move at the
root, so the root's children count blue wins; their children count red wins; and so on.
When the playout ends in a blue win, every node on the path gains a visit, but only the
nodes blue moved into — the 2/4 node, the 1/1 node — gain a win.

**The constant $C$ is a real decision.** At the root before this iteration ($N = 8$),
UCB1 with $C = 0.5$ scores the children $0.50 + 0.36 = 0.86$ for 2/4, $0.33 + 0.42 = 0.75$
for 1/3, and $0 + 0.72 = 0.72$ for 0/1, so selection goes left; one level down it prefers
1/3 (0.67) to 0/1 (0.59), and below that 1/1 (1.52) to 0/1 (0.52) — exactly the path
shown. With the textbook choice $C = \sqrt{2}$ the once-tried 0/1 child scores
$0 + 1.41\sqrt{\ln 8} \approx 2.04$ and wins the root comparison instead. A large $C$
explores; a small one exploits. Programs tune it, and it interacts with how rewards are
scaled.

In code, with the perspective bookkeeping made explicit:

```python
import math, random

class Node:
    def __init__(self, state, parent=None, move=None):
        self.state, self.parent, self.move = state, parent, move
        self.children = []
        self.untried = list(state.legal_moves())
        self.wins = 0.0       # wins for the player who made `move`
        self.visits = 0

    def ucb1(self, c):
        return (self.wins / self.visits
                + c * math.sqrt(math.log(self.parent.visits) / self.visits))

def uct(root_state, iterations, c=1.4):
    root = Node(root_state)
    for _ in range(iterations):
        node = root
        while not node.untried and node.children:              # 1. selection
            node = max(node.children, key=lambda n: n.ucb1(c))
        if node.untried:                                       # 2. expansion
            move = node.untried.pop(random.randrange(len(node.untried)))
            node.children.append(Node(node.state.play(move), node, move))
            node = node.children[-1]
        state = node.state                                     # 3. simulation
        while not state.is_terminal():
            state = state.play(random.choice(state.legal_moves()))
        while node is not None:                                # 4. backpropagation
            node.visits += 1
            if node.parent and state.winner() == node.parent.state.to_move():
                node.wins += 1
            node = node.parent
    return max(root.children, key=lambda n: n.visits).move     # most-visited child
```

### What MCTS gives you

- After a fixed number of iterations $K$, or when the time allotted runs out, MCTS
  selects the action with the **highest win ratio** or, more robustly, the **highest
  visit count**. Visits are the safer signal for the reason in the 55/85-versus-4/5
  example: a high ratio on few samples is weak evidence, and UCB1 only keeps visiting a
  child heavily if it keeps looking good.
- MCTS **does not explore the whole game tree**. It samples it, spending more time on the
  moves that look more promising — an asymmetric tree that grows deepest along the
  lines that matter.
- It is an **anytime algorithm**: stop it whenever, and it has an answer.
- It needs **no evaluation function**: the playouts supply one.
- As $K \to \infty$, the values UCT assigns to each action **converge to those computed by
  minimax**.

MCTS is the standard algorithm for modern Go programs — AlphaGo, MoGo, CrazyStone,
Valkyria, Pachi, Fuego, The Many Faces of Go, Zen — with UCT deciding the
explore-versus-exploit question. Variants run in card games (Prismata) and in strategy
games, including the campaign AI of *Total War: Rome II*.

## 9. AlphaGo: MCTS with learned intuition

Google DeepMind's **AlphaGo** defeated Lee Sedol in 2016 and Ke Jie, then the world's
top-ranked player, in May 2017. It integrated MCTS with **deep convolutional neural
networks**, trained to predict the probability of each move and the expected value of a
board, and used those networks to guide the search. Four networks did the work:

| Network | What it is | How good |
|---|---|---|
| $p_\sigma$ — SL policy | Trained by **supervised learning** on 30 million positions from the KGS Go server to predict expert moves | 57% accuracy on expert moves |
| $p_\pi$ — rollout policy | A much simpler, faster version of $p_\sigma$, cheap enough to run inside playouts | 24.2% accuracy |
| $p_\rho$ — RL policy | Starts from $p_\sigma$ and improves by **self-play** (reinforcement learning) | Wins 80% against $p_\sigma$; 85% against Pachi, an MCTS program running 100,000 rollouts per move |
| $v$ — value network | Predicts the **winner** from a position; trained on 30 million positions from self-play by $p_\rho$ | Almost as accurate as rollouts, with 15,000 times less computation |

Read against §8, each network replaces a weak part of plain MCTS. The policy network
replaces uniform choice in selection with a **prior over promising moves**, which cuts
Go's 300-way branching to the handful worth considering. The rollout policy makes
playouts resemble real play instead of random flailing. The value network does what
Go's evaluation function never could: it scores a position directly. AlphaGo evaluated
each new leaf with a mixture of the value network and a fast rollout — learned intuition
and sampled experience, combined by the tree.

## Summary

- Games turn plans into **strategies**. In deterministic, zero-sum games, **minimax**
  computes the best utility guaranteed against an optimal opponent, in $O(b^m)$ time.
- **Alpha-beta** returns the same root value while pruning branches that cannot matter;
  with perfect move ordering it costs $O(b^{m/2})$ and doubles the reachable depth. Root
  children may carry bounds, not true values.
- Real games need **depth limits** and **evaluation functions**, usually a weighted sum of
  features; optimality is lost, depth matters most, and **iterative deepening** makes the
  search anytime.
- Where branching or evaluation defeats minimax, **Monte Carlo** methods sample whole
  games. **MCTS** grows a tree through selection, expansion, simulation and
  backpropagation, and **UCT** uses **UCB1** — the bandit rule — to balance exploring
  uncertain moves with exploiting good ones.
- **AlphaGo** combined MCTS with learned policy and value networks.

Local search — improving a single configuration rather than building a tree of them —
comes next.

## Terms defined in one place

| Term | Definition |
|---|---|
| **Strategy (policy)** | A move for every state the player might face, S → A |
| **Zero-sum game** | Utilities are opposite; one value, maximized by one player and minimized by the other |
| **Perfect information** | Every player can see the whole state |
| **MAX / MIN** | The maximizing and minimizing players of a two-player zero-sum game |
| **Ply** | One move by one player; a level of the game tree |
| **Minimax value** | Best utility guaranteed against an optimal opponent |
| **Principal variation** | The line of play when both sides follow their minimax choices |
| **α** | Best value MAX can already guarantee on the current path |
| **β** | Best value MIN can already guarantee on the current path |
| **Alpha-beta pruning** | Minimax that skips branches outside (α, β); same root value |
| **Move ordering** | Order children are searched in; perfect ordering gives O(b^(m/2)) |
| **Metareasoning** | Computing about what to compute |
| **Depth-limited search** | Search to a fixed depth and score the frontier with an evaluation function |
| **Evaluation function** | Fast estimate of a position's minimax value, e.g. Σ wᵢ fᵢ(s) |
| **Anytime algorithm** | One that can be stopped at any point and still return its best answer so far |
| **Monte Carlo method** | Approximation by random sampling |
| **Playout (rollout)** | A game played to the end from a node, usually with random moves |
| **MCTS** | Selection, expansion, simulation, backpropagation, repeated |
| **ε-greedy** | Exploit the best option with probability 1 − ε, explore at random with probability ε |
| **Multi-armed bandit** | Allocating trials among options with unknown payoffs to maximize total reward |
| **UCB1** | Pick the arm maximizing vᵢ + C√(ln N / nᵢ) |
| **UCT** | MCTS using UCB1 for selection; converges to minimax |

## What to interrogate, not just absorb

1. **"Optimal" assumes an optimal opponent.** Minimax is the right answer against perfect
   play and a safe one against anything else — but against a predictably weak opponent, a
   model of that opponent can win more. What does your system know about who it is
   playing?
2. **Pruning returns bounds.** Alpha-beta's root value is exact; its other values are not.
   Any code that reads a value off a pruned subtree — for move selection, for logging,
   for a transposition table — must know which it has.
3. **Where does the evaluation function come from?** Hand-tuned weights encode a human's
   theory of the game. AlphaGo's lesson is that a learned value function can see what no
   feature list captures; the price is data, compute, and opacity.
4. **Random playouts measure the wrong game.** A move that wins most random games may lose
   to the one reply a real opponent will find. MCTS's tree corrects for this only as fast
   as it grows — check how much of the decision rests on playouts and how much on tree.
5. **The constant is not a detail.** UCB1's $C$ decides whether the search explores or
   commits, and the right value depends on how rewards are scaled. If a reported MCTS
   result does not say what $C$ was, it is not reproducible.
