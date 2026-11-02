---
course: ai-foundations
lectureId: W6
title: "Open the Black Box: Constraint Satisfaction, Backtracking, and Arc Consistency"
deck: "Ordinary search treats a state as an opaque blob. Describe it instead as variables, domains and constraints, and a solver can see which choices are doomed before making them — turning four billion years of search into less than a second."
order: 6
readingTime: 19
tags: ["csp", "backtracking", "arc-consistency", "constraint-propagation", "min-conflicts", "search"]
concepts:
  - id: csp
    term: Constraint Satisfaction Problem (CSP)
    definition: "A search problem whose state is a set of variables Xᵢ, each taking a value from a domain Dᵢ, and whose goal test is a set of constraints on which combinations of values are allowed. A solution is a complete assignment that violates no constraint."
  - id: constraint-graph
    term: Constraint Graph
    definition: "For a binary CSP, the graph whose nodes are variables and whose arcs join variables that share a constraint. Its structure — separate components, trees, small cutsets — is what general-purpose solvers exploit."
  - id: backtracking-search
    term: Backtracking Search
    definition: "Depth-first search over partial assignments that assigns one variable per level in a fixed order and rejects any value that conflicts with the assignment so far, backing up when a variable has no legal value left."
  - id: forward-checking
    term: Forward Checking
    definition: "A filter: after each assignment, cross off the values in neighbouring unassigned variables' domains that conflict with it. A domain that becomes empty signals failure before the search reaches that variable."
  - id: arc-consistency
    term: Arc Consistency
    definition: "An arc X → Y is consistent if every value left in X has some value in Y that satisfies their constraint. Enforcing it (e.g. with AC-3) deletes unsupported values from the tail and rechecks the neighbours of any variable that loses a value."
  - id: mrv
    term: Minimum Remaining Values (MRV)
    definition: "The variable-ordering heuristic that branches next on the variable with the fewest legal values left — the most constrained variable — so that dead ends are discovered as high in the tree as possible."
  - id: lcv
    term: Least Constraining Value (LCV)
    definition: "The value-ordering heuristic that, for the chosen variable, tries first the value that rules out the fewest values in neighbouring variables, leaving the most room for the rest of the assignment to succeed."
  - id: cutset-conditioning
    term: Cutset Conditioning
    definition: "Choose a set of variables whose removal leaves the constraint graph a tree, try every assignment to them, and solve each remaining tree-structured CSP. With a cutset of size c the cost is O(d^c · (n−c) d²)."
  - id: min-conflicts
    term: Min-Conflicts
    definition: "Local search for CSPs: start from a complete assignment, repeatedly pick a conflicted variable at random and give it the value that violates the fewest constraints. It solves n-queens in near-constant time even for millions of queens."
---

Every search algorithm so far has been ignorant about one thing: the state. A state was
a black box — the search could generate its successors and ask whether it was a goal, but
could not look inside. That is general, and it is wasteful. Colour a map, fill a Sudoku,
timetable a university: in each, the state is a collection of choices and the goal is a
list of rules those choices must obey. Say so explicitly — **variables, domains,
constraints** — and the solver can reason about the rules directly. It can notice that a
half-finished map can never be completed and abandon it at once; choose the hardest
variable first; split a problem into pieces that never interact. This feature follows
constraint satisfaction from its definition, through the two ways of searching it — as
local search and as a tree — to the three ideas that make the tree search fast:
filtering, ordering and structure.

**Sources:** AIMA Chapter 6 (Sections 6.1–6.5)

## 1. What is search for?

The search problems so far rest on the same assumptions about the world: a **single
agent**, **deterministic** actions, a **fully observed** state and a **discrete** state
space. Within that world there are two quite different jobs.

- **Planning: sequences of actions.** The **path to the goal is the important thing**.
  Paths have costs and depths, and heuristics give problem-specific guidance. Route
  finding is planning.
- **Identification: assignments to variables.** The **goal itself is important, not the
  path**. In some formulations every path to a solution has the same depth. Eight queens
  is identification.

**Constraint satisfaction problems** are a framework specialized for identification.

## 2. Constraint satisfaction problems

In a **standard search problem**, the state is a black box — any data structure — the goal
test can be any function over states, and the successor function can be anything. A
**CSP** is a special subset of search problems in which:

- The **state** is defined by **variables** $X_1, \dots, X_n$, each taking values from a
  **domain** $D_i$ (sometimes the same $D$ for all $i$).
- The **goal test** is a set of **constraints** specifying the allowable combinations of
  values for subsets of the variables.

A **solution** is a **complete** assignment — every variable has a value — that is
**consistent**, violating no constraint. Because the problem has this shape, one can write
**general-purpose algorithms with more power than standard search**: they work for every
CSP and use the constraints themselves to prune.

### Example: map colouring

Colour the seven states and territories of Australia with three colours so that no two
neighbours match.

- **Variables:** WA, NT, Q, NSW, V, SA, T.
- **Domains:** $D = \{\text{red}, \text{green}, \text{blue}\}$.
- **Constraints:** adjacent regions must have different colours. A constraint can be
  written **implicitly**, as a rule — $\text{WA} \ne \text{NT}$ — or **explicitly**, as the
  list of allowed pairs — $(\text{WA}, \text{NT}) \in \{(\text{red}, \text{green}),
  (\text{red}, \text{blue}), \dots\}$.

One solution is $\{\text{WA}=\text{red}, \text{NT}=\text{green}, \text{Q}=\text{red},
\text{NSW}=\text{green}, \text{V}=\text{red}, \text{SA}=\text{blue},
\text{T}=\text{green}\}$.

### Constraint graphs

In a **binary CSP** each constraint relates at most two variables. Its **constraint graph**
has a node for each variable and an arc for each constraint.

<figure>
<svg viewBox="0 0 820 370" role="img" aria-label="The constraint graph for colouring Australia. Nodes WA, NT, Q, SA, NSW and V are joined by nine arcs: WA to NT and SA; NT to SA and Q; SA to Q, NSW and V; Q to NSW; NSW to V. South Australia touches five others. Tasmania, T, has no arcs and is boxed as an independent subproblem. Each node is labelled with its colour in the example solution: WA red, NT green, Q red, SA blue, NSW green, V red, T green. Beside the graph the CSP is summarised: variables WA, NT, Q, NSW, V, SA, T; domains red, green, blue; constraints adjacent regions differ.">
  <line x1="127.9" y1="141.1" x2="232.1" y2="88.9" stroke="currentColor" stroke-width="1.5"/>
  <line x1="129.3" y1="155.2" x2="240.7" y2="184.8" stroke="currentColor" stroke-width="1.5"/>
  <line x1="251.8" y1="99.9" x2="258.2" y2="170.1" stroke="currentColor" stroke-width="1.5"/>
  <line x1="269.6" y1="84.2" x2="370.4" y2="105.8" stroke="currentColor" stroke-width="1.5"/>
  <line x1="277.0" y1="179.5" x2="373.0" y2="120.5" stroke="currentColor" stroke-width="1.5"/>
  <line x1="280.0" y1="191.2" x2="400.0" y2="198.8" stroke="currentColor" stroke-width="1.5"/>
  <line x1="275.1" y1="203.2" x2="324.9" y2="246.8" stroke="currentColor" stroke-width="1.5"/>
  <line x1="396.3" y1="129.0" x2="413.7" y2="181.0" stroke="currentColor" stroke-width="1.5"/>
  <line x1="404.0" y1="212.0" x2="356.0" y2="248.0" stroke="currentColor" stroke-width="1.5"/>
  <circle cx="110" cy="150" r="20" fill="none" stroke="currentColor" stroke-width="1.5"/><text x="110" y="154" text-anchor="middle" font-size="12" font-weight="700">WA</text>
  <text x="74" y="150" text-anchor="end" font-size="11" class="dgm-muted">red</text>
  <circle cx="250" cy="80" r="20" fill="none" stroke="currentColor" stroke-width="1.5"/><text x="250" y="84" text-anchor="middle" font-size="12" font-weight="700">NT</text>
  <text x="250" y="52" text-anchor="middle" font-size="11" class="dgm-muted">green</text>
  <circle cx="390" cy="110" r="20" fill="none" stroke="currentColor" stroke-width="1.5"/><text x="390" y="114" text-anchor="middle" font-size="12" font-weight="700">Q</text>
  <text x="420" y="96" text-anchor="start" font-size="11" class="dgm-muted">red</text>
  <circle cx="260" cy="190" r="20" fill="none" stroke="currentColor" stroke-width="1.5"/><text x="260" y="194" text-anchor="middle" font-size="12" font-weight="700">SA</text>
  <text x="232" y="212" text-anchor="end" font-size="11" class="dgm-muted">blue</text>
  <circle cx="420" cy="200" r="20" fill="none" stroke="currentColor" stroke-width="1.5"/><text x="420" y="204" text-anchor="middle" font-size="11" font-weight="700">NSW</text>
  <text x="450" y="204" text-anchor="start" font-size="11" class="dgm-muted">green</text>
  <circle cx="340" cy="260" r="20" fill="none" stroke="currentColor" stroke-width="1.5"/><text x="340" y="264" text-anchor="middle" font-size="12" font-weight="700">V</text>
  <text x="310" y="276" text-anchor="end" font-size="11" class="dgm-muted">red</text>
  <circle cx="350" cy="330" r="20" fill="none" stroke="currentColor" stroke-width="1.5"/><text x="350" y="334" text-anchor="middle" font-size="12" font-weight="700">T</text>
  <text x="380" y="334" text-anchor="start" font-size="11" class="dgm-muted">green</text>
  <g class="dgm-accent-2"><rect x="300" y="300" width="130" height="58" rx="6" fill="none" stroke="currentColor" stroke-width="1.2" stroke-dasharray="4 3"/></g>
  <text x="440" y="326" font-size="11.5" class="dgm-accent-2">no arcs: an</text><text x="440" y="341" font-size="11.5" class="dgm-accent-2">independent subproblem</text>
  <g font-size="12"><text x="560" y="100" font-weight="700">Variables</text><text x="560" y="118">WA, NT, Q, NSW, V, SA, T</text><text x="560" y="152" font-weight="700">Domains</text><text x="560" y="170">{red, green, blue}</text><text x="560" y="204" font-weight="700">Constraints</text><text x="560" y="222">adjacent regions differ:</text><text x="560" y="240">one arc per pair, e.g. WA ≠ NT</text></g>
</svg>
<figcaption><b>Australia as a constraint graph.</b> Each arc is one "must differ" constraint; the small labels are the solution above. SA is the hub, touching five regions. T has no arcs at all, so it can be solved — trivially — on its own.</figcaption>
</figure>

**General-purpose CSP algorithms use the graph structure to speed up search.** Already
one thing is visible: Tasmania is connected to nothing, so it is an **independent
subproblem**. Section 8 makes that pay.

### Example: Sudoku

- **Variables:** each open square.
- **Domains:** $\{1, 2, \dots, 9\}$.
- **Constraints:** a **9-way alldiff** for each column, each row and each $3 \times 3$
  region — "alldiff" meaning all nine values in that group differ.

Alldiff is a **higher-order** constraint: it involves nine variables at once. It can be
broken into $\binom{9}{2} = 36$ binary $\ne$ constraints, which is why binary CSPs cover
more ground than they first appear to.

### Varieties of CSPs

- **Discrete variables, finite domains.** A domain of size $d$ gives $O(d^n)$ complete
  assignments. Boolean CSPs belong here, including **Boolean satisfiability**, which is
  **NP-complete** — so no CSP algorithm will be fast on every instance.
- **Discrete variables, infinite domains** — integers, strings. In job scheduling the
  variables are each job's start and end times. **Linear** constraints are solvable;
  **nonlinear** ones are **undecidable** in general.
- **Continuous variables.** Start and end times for Hubble Space Telescope observations
  are the classic case; **linear constraints are solvable in polynomial time** by linear
  programming.

### Varieties of constraints

- **Unary** constraints involve one variable, e.g. $\text{SA} \ne \text{green}$. They are
  equivalent to shrinking the domain, and can be applied once before search.
- **Binary** constraints involve pairs, e.g. $\text{SA} \ne \text{WA}$.
- **Higher-order** constraints involve three or more variables, like alldiff.
- **Preferences**, or **soft constraints** — "red is better than green" — are usually
  represented as a cost for each assignment, turning the problem into **constrained
  optimization**. The course sets these aside until Bayes' nets.

### Real-world CSPs

**Assignment** (who teaches what class), **timetabling** (which class is offered when and
where), **hardware configuration**, **transportation** and **factory scheduling**,
**circuit layout**, **fault diagnosis**, and many more. Many real problems also involve
real-valued variables.

## 3. Solving CSPs as local search

The previous lecture's methods apply directly. Local search works with **complete**
states — every variable assigned — so to use it on a CSP:

- Start from an assignment that has **unsatisfied constraints**.
- Operators **reassign variable values**.
- There is **no fringe** — no frontier of alternatives saved for later.

The standard algorithm is **min-conflicts**. While the assignment is not a solution:

- **Variable selection:** pick **any conflicted variable at random**.
- **Value selection:** give it the value that **violates the fewest constraints**.

That is hill climbing with $h(n) = $ the total number of violated constraints.

### Example: four queens

- **States:** four queens, one per column: $4^4 = 256$ states.
- **Operators:** move a queen within its column.
- **Goal test:** no attacks.
- **Evaluation:** $c(n) = $ the number of attacking pairs.

In the lecture's run, a board with five attacking pairs becomes one with two after a
single min-conflicts move, and one with none after another.

### How well it works

Remarkably well. **From a random initial state, min-conflicts solves n-queens in almost
constant time for arbitrary $n$ with high probability** — including $n = 10{,}000{,}000$.
The same appears true of **randomly generated CSPs in general, except in a narrow range of
the ratio**

$$R = \frac{\text{number of constraints}}{\text{number of variables}}.$$

Plot solve time against $R$ and the curve is flat almost everywhere, with a sharp spike at
a **critical ratio**. Well below it, problems are loosely constrained and solutions are
plentiful; well above it, the constraints pin the answer down (or rule one out) quickly.
The hard instances sit at the boundary between the two — a phase transition, and the
place to look if you want to stress-test a solver.

## 4. Solving CSPs as standard search

The systematic alternative builds an assignment one variable at a time.

- **States** are **partial assignments** — the values assigned so far.
- **Initial state:** the empty assignment, $\{\}$.
- **Successor function:** assign a value to an unassigned variable.
- **Goal test:** the assignment is complete and satisfies every constraint.

From the empty map, the first level of the tree colours WA red, green or blue; the next
level colours another region, and so on.

### What would BFS do? What would DFS do?

**Breadth-first search** is the worst possible choice. **Every solution appears at depth
$n$** — exactly one level per variable — so BFS would generate every partial assignment
at every shallower depth before it could see a single complete one.

**Depth-first search** at least dives straight to depth $n$. But naïve DFS assigns
everything and only then checks the constraints: if WA and NT are both red at the top of
the tree, it will happily colour all five other regions in every possible way before
discovering the problem.

### How big is the tree?

This formulation is the same for **all CSPs**, which is good. Its size is not. At depth
$l$, any of the $n - l$ unassigned variables can take any of $d$ values, so the branching
factor is

$$b = (n - l)\,d,$$

and the tree has $n!\,d^n$ leaves — even though there are only $d^n$ distinct complete
assignments. The $n!$ comes entirely from assigning the same values in different orders.

## 5. Backtracking search

**Backtracking search** is the basic uninformed algorithm for CSPs. It is depth-first
search with two improvements.

- **Idea 1: one variable at a time.** Variable assignments are **commutative**:
  [WA = red then NT = green] reaches the same state as [NT = green then WA = red]. So
  **fix an ordering** and consider assignments to only **one variable at each level**. The
  branching factor drops to $d$ and the leaves to $d^n$ — the $n!$ is gone.
- **Idea 2: check constraints as you go.** Consider only values that **do not conflict
  with previous assignments**. This may take some computation, and it amounts to an
  **incremental goal test**: a branch dies the moment it breaks a rule.

The name is not the best, but it has stuck: **backtracking = DFS + variable ordering +
fail-on-violation**.

On Australia, the search colours WA red; tries NT red, rejects it, takes NT green; then
tries Q, whose red, green and blue are checked against what is already assigned. If a
variable runs out of legal values, the search **backs up** to the most recent choice and
tries its next value.

```python
def backtracking_search(csp):
    return recursive_backtracking({}, csp)

def recursive_backtracking(assignment, csp):
    if len(assignment) == len(csp.variables):
        return assignment
    var = select_unassigned_variable(csp, assignment)
    for value in order_domain_values(var, assignment, csp):
        if csp.consistent(var, value, assignment):
            assignment[var] = value
            result = recursive_backtracking(assignment, csp)
            if result is not None:
                return result
            del assignment[var]
    return None                          # failure: back up
```

**What are the choice points?** Two function calls in that code: `select_unassigned_variable`
(which variable next?) and `order_domain_values` (which value first?). Together with the
consistency check, they are where all the improvements of the next three sections go.

The lecture ran each variant in CMU's interactive
[CSP backtracking demo](https://www.cs.cmu.edu/~15281/demos/csp_backtracking/): naïve DFS,
plain backtracking, then backtracking with forward checking, with arc consistency, and
finally with arc consistency and MRV ordering — each visibly faster than the last.

## 6. Improving backtracking

General-purpose ideas give **huge** gains in speed, and they come in three kinds:

- **Filtering:** can we detect inevitable failure early?
- **Ordering:** which variable should be assigned next, and in what order should its
  values be tried?
- **Structure:** can we exploit the shape of the problem?

### Filtering: forward checking

**Filtering** keeps track of the **remaining domain of every unassigned variable** and
crosses off bad options. The simplest filter is **forward checking**: whenever a variable
is assigned, **cross off the values that would violate a constraint with it** in its
neighbours' domains.

| Step | WA | NT | Q | NSW | V | SA |
|---|---|---|---|---|---|---|
| Start | R G B | R G B | R G B | R G B | R G B | R G B |
| WA = red | **R** | G B | R G B | R G B | R G B | G B |
| Q = green | **R** | B | **G** | R B | R G B | B |

Assigning WA = red removes red from its neighbours NT and SA. Assigning Q = green removes
green from NT, SA and NSW. If any domain ever becomes **empty**, the current branch is
dead and the search backtracks immediately, without waiting to reach that variable.

### Filtering: constraint propagation

Look at the last row. NT can only be blue; SA can only be blue; **NT and SA are
neighbours, so they cannot both be blue**. The branch is already doomed — and forward
checking has not noticed, because it only propagates information **from assigned to
unassigned variables**. It never compares two unassigned variables with each other.

**Constraint propagation** fixes that by reasoning **from constraint to constraint**.

#### Consistency of a single arc

An arc $X \rightarrow Y$ is **consistent** if and only if **for every value $x$ in the
tail $X$ there is some value $y$ in the head $Y$** that could be assigned without violating
the constraint between them. Making an arc consistent means **deleting from the tail**
every value that has no support in the head.

With WA = red, the arc NT → WA asks: does each of NT's values have a partner in WA's
domain $\{\text{red}\}$? Green and blue do; red does not, so red is deleted from NT. That
is exactly what forward checking did. **Forward checking is enforcing consistency of the
arcs that point to each new assignment** — and nothing more.

#### Arc consistency of an entire CSP

The stronger filter makes **all** arcs consistent. Start from the same position (WA =
red, Q = green) and work through the arcs:

1. **SA → NSW.** SA's only value, blue, is supported by NSW = red. Consistent.
2. **NSW → SA.** NSW = red is fine against SA = blue; NSW = blue has no support, since SA
   can only be blue. **Delete blue from NSW**, which is now $\{\text{red}\}$.
3. NSW lost a value, so **arcs pointing into NSW must be rechecked.** **V → NSW:** V = red
   has no support, since NSW can only be red. **Delete red from V**, now $\{\text{green},
   \text{blue}\}$.
4. **SA → NT.** SA = blue needs NT ≠ blue, but NT is only blue. **Delete blue from SA.**
   SA's domain is **empty** — failure, detected before either NT or SA has been assigned.

Three lessons from the trace:

- **If $X$ loses a value, the neighbours of $X$ need to be rechecked.** A deletion can
  remove the support some other variable was relying on.
- **Arc consistency detects failure earlier than forward checking.**
- It can be run **as a preprocessor** before search, or **after each assignment** inside
  it (the latter is called *maintaining arc consistency*, MAC).

The downside is cost: every assignment now triggers a round of propagation, and on
easy problems that work may outweigh the search it saves.

#### AC-3

The standard algorithm keeps a queue of arcs:

```python
def ac3(csp):
    queue = deque(csp.arcs())                  # every (Xi, Xj), both directions
    while queue:
        xi, xj = queue.popleft()
        if remove_inconsistent_values(csp, xi, xj):
            if not csp.domains[xi]:
                return False                   # an empty domain: no solution
            for xk in csp.neighbours(xi) - {xj}:
                queue.append((xk, xi))
    return True

def remove_inconsistent_values(csp, xi, xj):
    removed = False
    for x in list(csp.domains[xi]):
        if not any(csp.allowed(xi, x, xj, y) for y in csp.domains[xj]):
            csp.domains[xi].remove(x)          # delete from the tail
            removed = True
    return removed
```

**Runtime: $O(n^2 d^3)$**, which can be reduced to $O(n^2 d^2)$. The reasoning: a binary
CSP has at most $O(n^2)$ arcs; an arc $(X_k, X_i)$ is put back on the queue only when $X_i$
loses a value, which happens at most $d$ times; and each check of an arc compares up to
$d \times d$ pairs. That is $O(n^2) \cdot d \cdot d^2$. Smarter bookkeeping (AC-4,
AC-2001) avoids re-examining pairs and reaches $O(n^2 d^2)$.

**But detecting all possible future problems is NP-hard.** Why? A filter that caught
*every* doomed assignment would, applied to the empty assignment, say whether the CSP has
a solution at all — and since CSPs include Boolean satisfiability and graph colouring,
that question is NP-complete. Arc consistency is fast precisely because it is
incomplete.

#### Limitations of arc consistency

After enforcing arc consistency, a CSP **can have one solution left, multiple solutions
left, or no solutions left — and not know it**. Two triangles show the extremes.

- One variable is $\{\text{red}\}$ and its two neighbours are each $\{\text{green},
  \text{blue}\}$, all three mutually "different". Every arc is consistent, and there are
  two solutions.
- Three mutually "different" variables, each $\{\text{red}, \text{blue}\}$. Every arc is
  consistent too — for any value at one end there is a different value at the other — yet
  there is **no solution**: two colours cannot colour a triangle. Arc consistency looks at
  one constraint at a time and cannot see a contradiction that needs three.

So **arc consistency still runs inside a backtracking search**. It prunes; it does not
solve.

### Ordering: minimum remaining values

**Variable ordering** answers "which variable do I branch on next?" The **minimum
remaining values (MRV)** heuristic says: choose the variable with the **fewest legal
values left** in its domain. It is also called the **most constrained variable**
heuristic, and it is a **"fail-fast"** ordering.

On Australia, after WA = red and NT = green, SA has only blue left and Q has two values;
MRV picks SA. (At the very start every domain is the same size; a common tie-breaker, the
*degree heuristic*, picks the variable involved in the most constraints — SA again, with
five.)

**Why min rather than max?** Every variable must eventually be assigned, so a variable
that is going to fail will fail sooner or later. If it fails near the top of the tree,
the search loses little; if it is left until the bottom, the search may explore a huge
subtree underneath a choice that was hopeless all along. And a variable with one legal
value is forced anyway: assigning it adds no branching at all.

### Ordering: least constraining value

**Value ordering** answers "in what order do I try values for this variable?" The **least
constraining value (LCV)** heuristic says: given the variable, try first the value that
**rules out the fewest values in the remaining variables**.

With WA = red and NT = green, suppose the search turns to Q. **Q = red allows 1 value for
SA** (blue); **Q = blue allows 0 values** for SA. LCV tries red first.

**Why least rather than most?** The asymmetry with MRV is deliberate. Only *one* value of
this variable needs to work, so try first the one most likely to leave a solution
possible. (If there is no solution, every value must be tried anyway and the order does
not matter.) The price is computation: to count how many neighbour values each candidate
prunes, LCV may have to **simulate forward checking — or rerun filtering — for every
candidate value**.

### Using MRV and LCV together

Typical backtracking search uses **MRV to pick which variable** to assign next, then
**LCV to pick which value** to try first. They attack different costs: **MRV mainly
reduces the depth reached before failure**, exposing dead ends early; **LCV mainly reduces
the effective branching factor**, making it more likely that the first value tried leads
to a solution.

## 7. Structure

### Independent subproblems

The extreme case is a problem that falls apart. **Tasmania and the mainland do not
interact**, and in general **independent subproblems are the connected components of the
constraint graph**, which are cheap to find.

Suppose $n$ variables split into subproblems of only $c$ variables each. Solving each
costs at most $d^c$, and there are $n/c$ of them, so the worst case is

$$O\!\left(\frac{n}{c}\, d^c\right),$$

**linear in $n$**. With $n = 80$ Boolean variables ($d = 2$) split into pieces of $c = 20$:

| | Work | At 10 million nodes per second |
|---|---|---|
| One problem | $2^{80} \approx 1.2 \times 10^{24}$ | about **4 billion years** |
| Four independent pieces | $4 \times 2^{20} \approx 4.2 \times 10^{6}$ | about **0.4 seconds** |

### Nearly tree-structured CSPs

Perfect independence is rare, but trees are the next best thing. A CSP whose constraint
graph is a **tree** can be solved without any backtracking in $O(n d^2)$ time: order the
variables from a root outward, make each arc from parent to child consistent working up
from the leaves, then assign values from the root down — every choice is guaranteed to
leave its children a legal value. (This is the $d^2$ in the formula below.)

Australia is not a tree, but it is close: **remove SA** and what is left — WA–NT–Q–NSW–V,
plus the lonely T — is one.

- **Conditioning:** instantiate a variable and prune its neighbours' domains accordingly.
- **Cutset conditioning:** instantiate, **in all possible ways**, a set of variables — a
  **cutset** — such that the remaining constraint graph is a tree.

The procedure has four steps:

1. **Choose a cutset** — here $\{\text{SA}\}$.
2. **Instantiate the cutset** all possible ways: SA = blue, SA = red, SA = green.
3. **Compute the residual CSP** for each, removing SA's colour from its neighbours'
   domains.
4. **Solve the residual CSPs**, which are tree-structured. Any one solution, together with
   its cutset values, solves the original problem.

<figure>
<svg viewBox="0 0 860 340" role="img" aria-label="Cutset conditioning on Australia. On the left, the full constraint graph with SA highlighted, and the five arcs from SA to WA, NT, Q, NSW and V highlighted as the ones that will go. An arrow points right to the residual graph once SA is assigned and removed: WA joined to NT, NT to Q, Q to NSW, NSW to V, with T alone — a tree.">
  <defs>
    <marker id="arw-w6-cut" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" class="dgm-fill"/>
    </marker>
  </defs>
  <line x1="107.9" y1="101.1" x2="212.1" y2="48.9" stroke="currentColor" stroke-width="1.5"/>
  <g class="dgm-accent"><line x1="109.3" y1="115.2" x2="220.7" y2="144.8" stroke="currentColor" stroke-width="1.6"/></g>
  <g class="dgm-accent"><line x1="231.8" y1="59.9" x2="238.2" y2="130.1" stroke="currentColor" stroke-width="1.6"/></g>
  <line x1="249.6" y1="44.2" x2="350.4" y2="65.8" stroke="currentColor" stroke-width="1.5"/>
  <g class="dgm-accent"><line x1="257.0" y1="139.5" x2="353.0" y2="80.5" stroke="currentColor" stroke-width="1.6"/></g>
  <g class="dgm-accent"><line x1="260.0" y1="151.2" x2="380.0" y2="158.8" stroke="currentColor" stroke-width="1.6"/></g>
  <g class="dgm-accent"><line x1="255.1" y1="163.2" x2="304.9" y2="206.8" stroke="currentColor" stroke-width="1.6"/></g>
  <line x1="376.3" y1="89.0" x2="393.7" y2="141.0" stroke="currentColor" stroke-width="1.5"/>
  <line x1="384.0" y1="172.0" x2="336.0" y2="208.0" stroke="currentColor" stroke-width="1.5"/>
  <circle cx="90" cy="110" r="20" fill="none" stroke="currentColor" stroke-width="1.5"/><text x="90" y="114" text-anchor="middle" font-size="12" font-weight="700">WA</text>
  <circle cx="230" cy="40" r="20" fill="none" stroke="currentColor" stroke-width="1.5"/><text x="230" y="44" text-anchor="middle" font-size="12" font-weight="700">NT</text>
  <circle cx="370" cy="70" r="20" fill="none" stroke="currentColor" stroke-width="1.5"/><text x="370" y="74" text-anchor="middle" font-size="12" font-weight="700">Q</text>
  <g class="dgm-accent"><circle cx="240" cy="150" r="20" class="dgm-soft" stroke="currentColor" stroke-width="1.9"/><text x="240" y="154" text-anchor="middle" font-size="12" font-weight="700">SA</text></g>
  <circle cx="400" cy="160" r="20" fill="none" stroke="currentColor" stroke-width="1.5"/><text x="400" y="164" text-anchor="middle" font-size="11" font-weight="700">NSW</text>
  <circle cx="320" cy="220" r="20" fill="none" stroke="currentColor" stroke-width="1.5"/><text x="320" y="224" text-anchor="middle" font-size="12" font-weight="700">V</text>
  <circle cx="330" cy="290" r="20" fill="none" stroke="currentColor" stroke-width="1.5"/><text x="330" y="294" text-anchor="middle" font-size="12" font-weight="700">T</text>
  <g class="dgm-accent-2"><line x1="527.9" y1="101.1" x2="632.1" y2="48.9" stroke="currentColor" stroke-width="2.2"/></g>
  <g class="dgm-accent-2"><line x1="669.6" y1="44.2" x2="770.4" y2="65.8" stroke="currentColor" stroke-width="2.2"/></g>
  <g class="dgm-accent-2"><line x1="796.3" y1="89.0" x2="813.7" y2="141.0" stroke="currentColor" stroke-width="2.2"/></g>
  <g class="dgm-accent-2"><line x1="804.0" y1="172.0" x2="756.0" y2="208.0" stroke="currentColor" stroke-width="2.2"/></g>
  <circle cx="510" cy="110" r="20" fill="none" stroke="currentColor" stroke-width="1.5"/><text x="510" y="114" text-anchor="middle" font-size="12" font-weight="700">WA</text>
  <circle cx="650" cy="40" r="20" fill="none" stroke="currentColor" stroke-width="1.5"/><text x="650" y="44" text-anchor="middle" font-size="12" font-weight="700">NT</text>
  <circle cx="790" cy="70" r="20" fill="none" stroke="currentColor" stroke-width="1.5"/><text x="790" y="74" text-anchor="middle" font-size="12" font-weight="700">Q</text>
  <circle cx="820" cy="160" r="20" fill="none" stroke="currentColor" stroke-width="1.5"/><text x="820" y="164" text-anchor="middle" font-size="11" font-weight="700">NSW</text>
  <circle cx="740" cy="220" r="20" fill="none" stroke="currentColor" stroke-width="1.5"/><text x="740" y="224" text-anchor="middle" font-size="12" font-weight="700">V</text>
  <circle cx="750" cy="290" r="20" fill="none" stroke="currentColor" stroke-width="1.5"/><text x="750" y="294" text-anchor="middle" font-size="12" font-weight="700">T</text>
  <line x1="440" y1="150" x2="480" y2="150" stroke="currentColor" stroke-width="2" marker-end="url(#arw-w6-cut)"/>
  <text x="250" y="330" text-anchor="middle" font-size="12" font-weight="700" class="dgm-accent">cutset {SA}: try SA = red, green, blue</text>
  <text x="670" y="330" text-anchor="middle" font-size="12" font-weight="700" class="dgm-accent-2">residual CSP: a tree, solved in O(nd²)</text>
</svg>
<figcaption><b>Cutset conditioning.</b> Fixing SA's colour removes its five arcs and prunes that colour from its neighbours. What remains is a chain (and an isolated T), so each of the three residual problems is solved without backtracking.</figcaption>
</figure>

With a cutset of size $c$ there are $d^c$ ways to instantiate it, each leaving a tree of
$n - c$ variables solvable in $O((n - c) d^2)$:

$$O\!\left(d^c \,(n - c)\, d^2\right),$$

**very fast for small $c$**. Finding the *smallest* cutset is itself NP-hard, but good
approximate cutsets are easy to find.

### Exercise: find the smallest cutset

The lecture's exercise gives a 13-variable graph, A through M. Its edges are
G–H, H–I, I–J, J–K, G–F, F–E, E–D, D–C, K–L, L–M along the outside, and two hubs: **A**,
joined to G, H, I, F, B, E, D and C; and **B**, joined to A, I, J, K, L and M.

<figure>
<svg viewBox="0 0 820 320" role="img" aria-label="The exercise graph laid out in a grid: G, H, I, J, K on the top row; F, A, B, L in the middle; E, D, C, M at the bottom. A and B are highlighted as the cutset. Every edge touching A or B is drawn dashed. The remaining edges, drawn bold, form a single path: C, D, E, F, G, H, I, J, K, L, M.">
  <g class="dgm-muted"><line x1="84.1" y1="74.1" x2="155.9" y2="145.9" stroke="currentColor" stroke-width="1.1" stroke-dasharray="4 3"/></g>
  <g class="dgm-muted"><line x1="170.0" y1="80.0" x2="170.0" y2="140.0" stroke="currentColor" stroke-width="1.1" stroke-dasharray="4 3"/></g>
  <g class="dgm-muted"><line x1="255.9" y1="74.1" x2="184.1" y2="145.9" stroke="currentColor" stroke-width="1.1" stroke-dasharray="4 3"/></g>
  <g class="dgm-muted"><line x1="90.0" y1="160.0" x2="150.0" y2="160.0" stroke="currentColor" stroke-width="1.1" stroke-dasharray="4 3"/></g>
  <g class="dgm-muted"><line x1="190.0" y1="160.0" x2="250.0" y2="160.0" stroke="currentColor" stroke-width="1.1" stroke-dasharray="4 3"/></g>
  <g class="dgm-muted"><line x1="155.9" y1="174.1" x2="84.1" y2="245.9" stroke="currentColor" stroke-width="1.1" stroke-dasharray="4 3"/></g>
  <g class="dgm-muted"><line x1="170.0" y1="180.0" x2="170.0" y2="240.0" stroke="currentColor" stroke-width="1.1" stroke-dasharray="4 3"/></g>
  <g class="dgm-muted"><line x1="184.1" y1="174.1" x2="255.9" y2="245.9" stroke="currentColor" stroke-width="1.1" stroke-dasharray="4 3"/></g>
  <g class="dgm-muted"><line x1="270.0" y1="80.0" x2="270.0" y2="140.0" stroke="currentColor" stroke-width="1.1" stroke-dasharray="4 3"/></g>
  <g class="dgm-muted"><line x1="355.9" y1="74.1" x2="284.1" y2="145.9" stroke="currentColor" stroke-width="1.1" stroke-dasharray="4 3"/></g>
  <g class="dgm-muted"><line x1="452.1" y1="68.9" x2="287.9" y2="151.1" stroke="currentColor" stroke-width="1.1" stroke-dasharray="4 3"/></g>
  <g class="dgm-muted"><line x1="450.0" y1="160.0" x2="290.0" y2="160.0" stroke="currentColor" stroke-width="1.1" stroke-dasharray="4 3"/></g>
  <g class="dgm-muted"><line x1="452.1" y1="251.1" x2="287.9" y2="168.9" stroke="currentColor" stroke-width="1.1" stroke-dasharray="4 3"/></g>
  <g class="dgm-accent-2"><line x1="90.0" y1="60.0" x2="150.0" y2="60.0" stroke="currentColor" stroke-width="2.4"/></g>
  <g class="dgm-accent-2"><line x1="190.0" y1="60.0" x2="250.0" y2="60.0" stroke="currentColor" stroke-width="2.4"/></g>
  <g class="dgm-accent-2"><line x1="290.0" y1="60.0" x2="350.0" y2="60.0" stroke="currentColor" stroke-width="2.4"/></g>
  <g class="dgm-accent-2"><line x1="390.0" y1="60.0" x2="450.0" y2="60.0" stroke="currentColor" stroke-width="2.4"/></g>
  <g class="dgm-accent-2"><line x1="70.0" y1="80.0" x2="70.0" y2="140.0" stroke="currentColor" stroke-width="2.4"/></g>
  <g class="dgm-accent-2"><line x1="70.0" y1="180.0" x2="70.0" y2="240.0" stroke="currentColor" stroke-width="2.4"/></g>
  <g class="dgm-accent-2"><line x1="90.0" y1="260.0" x2="150.0" y2="260.0" stroke="currentColor" stroke-width="2.4"/></g>
  <g class="dgm-accent-2"><line x1="190.0" y1="260.0" x2="250.0" y2="260.0" stroke="currentColor" stroke-width="2.4"/></g>
  <g class="dgm-accent-2"><line x1="470.0" y1="80.0" x2="470.0" y2="140.0" stroke="currentColor" stroke-width="2.4"/></g>
  <g class="dgm-accent-2"><line x1="470.0" y1="180.0" x2="470.0" y2="240.0" stroke="currentColor" stroke-width="2.4"/></g>
  <circle cx="70" cy="60" r="20" fill="none" stroke="currentColor" stroke-width="1.5"/><text x="70" y="64" text-anchor="middle" font-size="12" font-weight="700">G</text>
  <circle cx="170" cy="60" r="20" fill="none" stroke="currentColor" stroke-width="1.5"/><text x="170" y="64" text-anchor="middle" font-size="12" font-weight="700">H</text>
  <circle cx="270" cy="60" r="20" fill="none" stroke="currentColor" stroke-width="1.5"/><text x="270" y="64" text-anchor="middle" font-size="12" font-weight="700">I</text>
  <circle cx="370" cy="60" r="20" fill="none" stroke="currentColor" stroke-width="1.5"/><text x="370" y="64" text-anchor="middle" font-size="12" font-weight="700">J</text>
  <circle cx="470" cy="60" r="20" fill="none" stroke="currentColor" stroke-width="1.5"/><text x="470" y="64" text-anchor="middle" font-size="12" font-weight="700">K</text>
  <circle cx="70" cy="160" r="20" fill="none" stroke="currentColor" stroke-width="1.5"/><text x="70" y="164" text-anchor="middle" font-size="12" font-weight="700">F</text>
  <g class="dgm-accent"><circle cx="170" cy="160" r="20" class="dgm-soft" stroke="currentColor" stroke-width="1.9"/><text x="170" y="164" text-anchor="middle" font-size="12" font-weight="700">A</text></g>
  <g class="dgm-accent"><circle cx="270" cy="160" r="20" class="dgm-soft" stroke="currentColor" stroke-width="1.9"/><text x="270" y="164" text-anchor="middle" font-size="12" font-weight="700">B</text></g>
  <circle cx="470" cy="160" r="20" fill="none" stroke="currentColor" stroke-width="1.5"/><text x="470" y="164" text-anchor="middle" font-size="12" font-weight="700">L</text>
  <circle cx="70" cy="260" r="20" fill="none" stroke="currentColor" stroke-width="1.5"/><text x="70" y="264" text-anchor="middle" font-size="12" font-weight="700">E</text>
  <circle cx="170" cy="260" r="20" fill="none" stroke="currentColor" stroke-width="1.5"/><text x="170" y="264" text-anchor="middle" font-size="12" font-weight="700">D</text>
  <circle cx="270" cy="260" r="20" fill="none" stroke="currentColor" stroke-width="1.5"/><text x="270" y="264" text-anchor="middle" font-size="12" font-weight="700">C</text>
  <circle cx="470" cy="260" r="20" fill="none" stroke="currentColor" stroke-width="1.5"/><text x="470" y="264" text-anchor="middle" font-size="12" font-weight="700">M</text>
  <g font-size="12">
    <text x="560" y="70" font-weight="700" class="dgm-accent">cutset {A, B}</text>
    <text x="560" y="92">dashed: arcs removed with A and B</text>
    <text x="560" y="132" font-weight="700" class="dgm-accent-2">what remains is a path</text>
    <text x="560" y="154">C – D – E – F – G – H – I – J – K – L – M</text>
    <text x="560" y="194" font-weight="700">why not one variable?</text>
    <text x="560" y="216">remove A: triangle B–I–J survives</text>
    <text x="560" y="238">remove B: triangle G–F–A survives</text>
  </g>
</svg>
<figcaption><b>The smallest cutset is {A, B}.</b> Removing the two hubs leaves eleven variables in a single chain. No single variable will do, because the graph contains two triangles that share no vertex.</figcaption>
</figure>

The answer is **$\{A, B\}$**. Removing A and B deletes every edge that touches them, and
the ten edges left form one path, **C–D–E–F–G–H–I–J–K–L–M** — a tree. Nothing smaller
works: the triangle B–I–J and the triangle G–F–A share no vertex, so any cutset must
contain at least one variable from each. With $d = 3$, solving this problem by cutset
conditioning costs on the order of $3^2 \times 11 \times 3^2 = 891$ basic steps, against $3^{13}
\approx 1.6$ million complete assignments.

## Summary

- **CSPs are a special kind of search problem**: states are **partial assignments** of
  values to variables, and the goal test is defined by **constraints**. Exposing that
  structure lets general-purpose algorithms prune.
- The **constraint graph** shows which variables interact; a **binary CSP** has one arc
  per constraint.
- **Min-conflicts** — local search on complete assignments — is **often effective in
  practice**, solving even ten-million-queen problems almost instantly; hard random
  instances cluster around a **critical ratio** of constraints to variables.
- As standard search, the naïve tree has $n!\,d^n$ leaves. **Backtracking search** — one
  variable per level, constraints checked as you go — is the **basic solution**.
- **Speed-ups:**
  - **Filtering:** **forward checking** crosses off values that conflict with each new
    assignment; **arc consistency** (AC-3, $O(n^2 d^3)$) propagates deletions between
    unassigned variables and fails earlier, but cannot detect every dead end.
  - **Ordering:** **MRV** chooses the most constrained variable (fail fast); **LCV** tries
    the least constraining value first.
  - **Structure:** **independent subproblems** make cost linear in $n$; trees are solved in
    $O(nd^2)$; **cutset conditioning** costs $O(d^c (n - c) d^2)$.

## Terms defined in one place

| Term | Definition |
|---|---|
| **Planning vs. identification** | Searching for a path vs. searching for an assignment |
| **CSP** | Variables $X_i$, domains $D_i$, constraints on allowed combinations |
| **Assignment** | Values for some (partial) or all (complete) variables |
| **Consistent** | Violating no constraint |
| **Solution** | A complete, consistent assignment |
| **Unary / binary / higher-order constraint** | Involving one, two, or three or more variables |
| **Alldiff** | All variables in the group take different values |
| **Soft constraint (preference)** | A cost on assignments; gives constrained optimization |
| **Constraint graph** | Nodes are variables, arcs are binary constraints |
| **Min-conflicts** | Reassign a random conflicted variable to its least-conflicting value |
| **Critical ratio** | The constraints-to-variables ratio where random CSPs are hardest |
| **Backtracking search** | DFS + fixed variable ordering + fail-on-violation |
| **Filtering** | Tracking unassigned variables' domains and crossing off bad values |
| **Forward checking** | Prune neighbours' domains after each assignment |
| **Constraint propagation** | Reasoning from constraint to constraint |
| **Arc consistency** | Every value in the tail has support in the head; delete from the tail |
| **AC-3** | Queue-based arc-consistency algorithm, $O(n^2 d^3)$ |
| **MRV** | Branch on the variable with the fewest legal values left |
| **Degree heuristic** | Tie-breaker: the variable in the most constraints |
| **LCV** | Try the value that rules out the fewest neighbour values first |
| **Independent subproblem** | A connected component of the constraint graph |
| **Conditioning** | Instantiate a variable and prune its neighbours |
| **Cutset** | Variables whose removal leaves the constraint graph a tree |
| **Cutset conditioning** | Try all cutset assignments, solve each residual tree; $O(d^c (n-c) d^2)$ |

## What to interrogate, not just absorb

1. **Who wrote the constraints?** A CSP solver finds an assignment that satisfies the
   rules it was given. A timetable that is "valid" but puts a lecturer on two campuses an
   hour apart is a modelling failure, not a solver bug — and the solver cannot tell.
2. **Is it really hard, or just this formulation?** The same problem can have a tangled
   constraint graph under one choice of variables and a near-tree under another. Before
   buying a faster solver, try a different model.
3. **Filtering costs time too.** Arc consistency after every assignment can make a solver
   slower on easy instances. Any speed claim should say which instances it was measured
   on — and whether they sit near the critical ratio.
4. **Heuristics change the time, not the answer set.** MRV and LCV decide how quickly a
   solution is found, never whether one exists. When a solver reports "no solution", ask
   whether it searched systematically — min-conflicts cannot prove that.
5. **Hard constraints or preferences?** Real requirements are often soft. Encoding a
   preference as a hard constraint can make a problem falsely unsolvable; encoding a hard
   rule as a preference can make it falsely solved.
