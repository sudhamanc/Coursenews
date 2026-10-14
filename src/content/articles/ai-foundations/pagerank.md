---
course: ai-foundations
lectureId: R1
title: "Importance as a Fixed Point: The PageRank Paper"
deck: "In 1998 four Stanford researchers proposed ranking every page on the Web by a single number computed from links alone — a page matters if pages that matter point to it. The definition is circular on purpose, its solution is an eigenvector, and the paper that introduced it is also, quietly, a study in best-first search."
order: 11
readingTime: 13
tags: ["pagerank", "graphs", "markov-chains", "eigenvectors", "search-engines"]
concepts:
  - id: pagerank
    term: PageRank
    definition: "A score for every page computed only from the link graph: a page has high rank if the sum of the ranks of the pages linking to it is high, with each page's rank divided evenly among its outgoing links."
  - id: backlinks
    term: Backlinks vs. Citation Counts
    definition: "Backlinks are a page's incoming links. Counting them treats every link equally; PageRank weights each one by the importance of the page it comes from, so one link from a major page can outweigh many from obscure ones."
  - id: rank-sink
    term: Rank Sink
    definition: "A cycle of pages with links into it but none out. Under the simplified definition, rank flows in and never leaves, so the cycle absorbs it all. The fix is a rank source that redistributes rank everywhere."
  - id: random-surfer
    term: The Random Surfer
    definition: "The probabilistic reading of PageRank: a surfer clicks random links and, now and then, gets bored and jumps to a page chosen from a distribution E. A page's PageRank is the long-run fraction of time the surfer spends on it."
  - id: rank-source-e
    term: The Rank Source E and Damping
    definition: "A vector over pages giving where the bored surfer jumps. The paper uses a uniform E with total weight 0.15 — the origin of the familiar damping factor 0.85, the probability of following a link rather than jumping."
  - id: power-iteration
    term: Power Iteration
    definition: "Computing PageRank by repeatedly applying the link matrix to a starting vector until it stops changing. The result is the dominant eigenvector; on 322 million links it converged in about 52 iterations."
  - id: personalized-pagerank
    term: Personalized PageRank
    definition: "PageRank with E concentrated on particular pages — say, one person's home page — so the ranking reflects importance from that viewpoint. The paper argued such rankings are far harder to manipulate than the uniform version."
  - id: rapid-mixing
    term: Expanders and Rapid Mixing
    definition: "A random walk mixes rapidly — converges to its limiting distribution in time logarithmic in the graph's size — exactly when the graph is an expander, or equivalently has a gap between its largest and second-largest eigenvalues."
---

In January 1998 the Web had roughly 150 million pages and 1.7 billion links, it was
doubling in under a year, and search engines were losing. Their pages ranged from
journals to someone's lunch menu, their users were often inexperienced, and their
ranking functions were under constant attack from pages engineered to game them.
"The PageRank Citation Ranking: Bringing Order to the Web," by Lawrence Page, Sergey
Brin, Rajeev Motwani and Terry Winograd, proposed to rank every page by a single
number computed from the link graph alone — and, almost in passing, to test it by
building a search engine called Google.

The paper is worth reading closely for three reasons. Its central definition is a
genuinely elegant piece of applied linear algebra. Its probabilistic reinterpretation
is one of the clearest introductions to Markov chains anywhere. And it contains a
small, striking experiment in **best-first search** that connects it directly to the
search material: an evaluation function that avoids the local maxima a simpler one
falls into.

**Source:** Page, L., Brin, S., Motwani, R., & Winograd, T. (1998), "The PageRank
Citation Ranking: Bringing Order to the Web," Stanford Digital Library Technologies
Project technical report.

## 1. Why the Web is not a citation index

The obvious move is to treat each link as an academic citation and count them. A page
like Yahoo's home page had tens of thousands of backlinks, and search engines already
used backlink counts to favor important pages. The paper's argument is that the Web
breaks the assumptions citation analysis rests on:

- **No quality control and no publishing cost.** Academic papers are reviewed. Web pages
  proliferate freely, and a simple program can create huge numbers of them, inflating
  citation counts artificially.
- **Adversarial pressure.** The Web contains competing profit-seeking ventures whose
  attention-getting strategies evolve in response to search algorithms. Any ranking
  that counts *replicable features of a page* is open to manipulation.
- **Enormous variance.** Papers are roughly comparable units of work. A web page might be
  an obscure archived question about an IBM machine or IBM's home page; a research
  article on phone use and driver attention, or an advertisement for a phone carrier.

A further observation sets up the whole approach: **the average quality of the pages a
user actually sees is higher than the average quality of pages.** Most pages are rarely
read. Whatever signal separates them is not in their text — it is in how the rest of
the Web treats them.

## 2. The definition: importance flows along links

The intuition is a single sentence: **a page has high rank if the sum of the ranks of
its backlinks is high.** That covers both a page with many backlinks and a page with a
few highly ranked ones. A single link from Yahoo's home page should count for more
than many links from obscure places.

Formally, let $F_u$ be the set of pages $u$ links to, $B_u$ the set of pages linking to
$u$, $N_u = |F_u|$ the number of outgoing links from $u$, and $c$ a normalizing factor.
The simplified ranking is

$$R(u) = c \sum_{v \in B_u} \frac{R(v)}{N_v}$$

Each page **splits its rank evenly among its outgoing links**, and each page's rank is
the total it receives. The definition is recursive — rank depends on rank — and that
circularity is the point. It is solved, not avoided: start with any assignment of
ranks, apply the equation repeatedly, and it converges.

The paper's own small example shows a steady state you can check by hand:

<figure>
<svg viewBox="0 0 840 300" role="img" aria-label="Left: three pages in steady state. A has rank 0.4 and links to B and C, sending 0.2 to each. B has rank 0.2 and links to C, sending 0.2. C has rank 0.4 and links to A, sending 0.4. Every page receives exactly its own rank. Right: two pages that link only to each other, fed by an outside page, form a rank sink that absorbs rank without returning it; a jump back to random pages with probability 0.15 drains it.">
  <defs>
    <marker id="arw-pr-flow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" class="dgm-fill"/>
    </marker>
  </defs>
  <text x="200" y="24" text-anchor="middle" font-size="12" font-weight="700">A STEADY STATE</text>
  <circle cx="90" cy="100" r="30" fill="none" stroke="currentColor" stroke-width="1.6"/>
  <text x="90" y="97" text-anchor="middle" font-size="12" font-weight="700">A</text>
  <text x="90" y="113" text-anchor="middle" font-size="10.5">0.4</text>
  <circle cx="320" cy="100" r="30" fill="none" stroke="currentColor" stroke-width="1.6"/>
  <text x="320" y="97" text-anchor="middle" font-size="12" font-weight="700">B</text>
  <text x="320" y="113" text-anchor="middle" font-size="10.5">0.2</text>
  <g class="dgm-accent">
    <circle cx="205" cy="225" r="30" class="dgm-soft" stroke="currentColor" stroke-width="1.8"/>
    <text x="205" y="222" text-anchor="middle" font-size="12" font-weight="700">C</text>
    <text x="205" y="238" text-anchor="middle" font-size="10.5" font-weight="700">0.4</text>
  </g>
  <line x1="122" y1="100" x2="286" y2="100" stroke="currentColor" stroke-width="1.4" marker-end="url(#arw-pr-flow)"/>
  <text x="204" y="92" text-anchor="middle" font-size="10.5">0.2</text>
  <line x1="112" y1="124" x2="181" y2="201" stroke="currentColor" stroke-width="1.4" marker-end="url(#arw-pr-flow)"/>
  <text x="168" y="156" text-anchor="middle" font-size="10.5">0.2</text>
  <line x1="298" y1="124" x2="229" y2="201" stroke="currentColor" stroke-width="1.4" marker-end="url(#arw-pr-flow)"/>
  <text x="244" y="156" text-anchor="middle" font-size="10.5">0.2</text>
  <path d="M176 236 Q 70 236 74 132" fill="none" stroke="currentColor" stroke-width="1.4" marker-end="url(#arw-pr-flow)"/>
  <text x="96" y="230" text-anchor="middle" font-size="10.5">0.4</text>
  <text x="200" y="286" text-anchor="middle" font-size="10.5" class="dgm-muted">each page gives away exactly what it receives</text>
  <line x1="420" y1="34" x2="420" y2="270" stroke="currentColor" stroke-width="1" stroke-dasharray="4 4" class="dgm-muted"/>
  <text x="630" y="24" text-anchor="middle" font-size="12" font-weight="700">A RANK SINK, AND THE FIX</text>
  <circle cx="490" cy="110" r="24" fill="none" stroke="currentColor" stroke-width="1.6"/>
  <text x="490" y="115" text-anchor="middle" font-size="11.5">X</text>
  <g class="dgm-accent">
    <circle cx="640" cy="110" r="24" class="dgm-soft" stroke="currentColor" stroke-width="1.8"/>
    <circle cx="760" cy="110" r="24" class="dgm-soft" stroke="currentColor" stroke-width="1.8"/>
    <text x="640" y="115" text-anchor="middle" font-size="11.5" font-weight="700">Y</text>
    <text x="760" y="115" text-anchor="middle" font-size="11.5" font-weight="700">Z</text>
    <path d="M660 96 Q 700 74 740 96" fill="none" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-pr-flow)"/>
    <path d="M740 124 Q 700 146 660 124" fill="none" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-pr-flow)"/>
    <text x="676" y="172" text-anchor="middle" font-size="10.5" font-weight="700">rank flows in, never out</text>
  </g>
  <line x1="516" y1="110" x2="612" y2="110" stroke="currentColor" stroke-width="1.4" marker-end="url(#arw-pr-flow)"/>
  <g class="dgm-accent-2">
    <rect x="470" y="200" width="320" height="56" fill="none" stroke="currentColor" stroke-width="1.6" stroke-dasharray="5 4"/>
    <text x="630" y="224" text-anchor="middle" font-size="11.5" font-weight="700">rank source E: with probability 0.15</text>
    <text x="630" y="243" text-anchor="middle" font-size="10.5">the surfer jumps to a page drawn from E instead</text>
  </g>
  <path d="M760 136 L760 196" fill="none" stroke="currentColor" stroke-width="1.2" stroke-dasharray="4 3" marker-end="url(#arw-pr-flow)"/>
</svg>
<figcaption><b>Rank as flow.</b> Left: the paper's three-page example, in which every page's incoming rank equals its own, so the assignment is a fixed point. Right: a closed loop traps rank indefinitely — the problem the rank source exists to solve.</figcaption>
</figure>

### The eigenvector

Put the same thing in matrix form. Let $A$ be the square matrix with
$A_{u,v} = 1/N_u$ if there is a link from $u$ to $v$, and $0$ otherwise. Treating $R$ as
a vector over pages, the definition says $R$ is a fixed point of the link matrix — the
paper writes it as $R = cAR$, so **$R$ is an eigenvector of $A$ with eigenvalue $c$**.
In fact we want the **dominant** eigenvector, which is what repeatedly applying the
matrix to almost any starting vector converges to.

A small notational caution for anyone implementing it from the paper: with $A$
indexed as above (rows are sources), the update that sums over *incoming* links is
$R = cA^{\top}R$. The intent is unambiguous; the transpose is just implicit.

## 3. Rank sinks, and the surfer who gets bored

The simplified definition has a flaw. Take two pages that link to each other and to
nothing else, and suppose some other page links to one of them. During iteration this
loop **accumulates rank but never distributes any** — it is a trap, which the paper
calls a **rank sink**.

The fix is a **rank source**. Let $E(u)$ be a vector over pages, and define PageRank
as an assignment $R'$ satisfying

$$R'(u) = c \sum_{v \in B_u} \frac{R'(v)}{N_v} + c\,E(u)$$

with $c$ maximized and $\|R'\|_1 = 1$. Because $E$ adds rank everywhere, $c$ must shrink
to balance the equation, so $E$ acts as a **decay factor**. In matrix form,
$R' = c(AR' + E)$, and since $\|R'\|_1 = 1$ this becomes
$R' = c(A + E \times \mathbf{1})R'$ — again an eigenvector, now of a matrix with no traps.

### The random surfer

The definition has a second, probabilistic reading, and it is the one that stuck. The
simplified PageRank is the **stationary distribution of a random walk** on the link
graph: a "random surfer" clicking links at random, with a page's rank equal to the
long-run fraction of time spent there. A real surfer caught in a small loop would not
stay forever — they would get bored and go somewhere else. $E$ models exactly that:
**now and then the surfer jumps to a page chosen according to $E$.**

In most experiments the paper uses a uniform $E$ with total weight
$\|E\|_1 = 0.15$. That is the origin of the familiar **damping factor of 0.85**: in the
form usually quoted today, for $N$ pages,

$$PR(u) = \frac{1-d}{N} + d \sum_{v \in B_u} \frac{PR(v)}{N_v}, \qquad d = 0.85$$

— follow a random outgoing link with probability 0.85, jump to a uniformly random page
with probability 0.15. The two forms are the same model up to normalization.

This is a **Markov chain**, and PageRank is its stationary distribution. The jump term
is what makes the chain irreducible and aperiodic — every page reachable from every
other — which is precisely the condition under which a unique stationary distribution
exists. The rank-sink patch and the probability theory turn out to be the same fix.

## 4. Computing it at Web scale

The computation, ignoring scale, is **power iteration**: start from almost any vector
$S$, repeatedly apply the matrix, renormalize by adding back the lost mass in the
direction of $E$, and stop when successive vectors differ by less than a tolerance:

```text
R₀ ← S
loop:
    R_{i+1} ← A R_i
    d       ← ‖R_i‖₁ − ‖R_{i+1}‖₁     # rank lost this step
    R_{i+1} ← R_{i+1} + d · E          # return it via the rank source
    δ       ← ‖R_{i+1} − R_i‖₁
while δ > ε
```

Three engineering details carry most of the insight.

**Dangling links.** Links to pages with no outgoing links — very often pages that simply
have not been crawled yet — have nowhere to send their rank. With 24 million pages
downloaded and 51 million URLs not yet fetched, there were a great many. The paper
removes them, computes PageRank on what remains, then adds them back and iterates as
many more times as it took to remove them. They do not directly affect other pages'
ranks, so the distortion is small.

**Disk, not memory.** URLs become integer IDs and the link database is sorted by source
page. Weights for 75 million URLs at four bytes each take 300 MB, and because the link
matrix is accessed in sorted order, it can stay on disk and be streamed linearly. Each
iteration took about **6 minutes** on a 1998 workstation; the whole process about five
hours. The paper notes that computing PageRank costs far less than building the
full-text index it sits beside.

**Convergence is fast.** On a database of 322 million links, PageRank converged to a
reasonable tolerance in about **52 iterations**; on half the data, about 45. The number
of iterations grows roughly with the **logarithm** of the graph's size.

### Why it converges so fast

The paper's explanation draws on the theory of random walks. A random walk on a graph
**mixes rapidly** — converges to its limiting distribution in time logarithmic in the
graph's size — exactly when the graph is an **expander**: every not-too-large set of
nodes has a neighborhood larger than it by some factor. Equivalently, there is a gap
between the largest and second-largest eigenvalues. Fast PageRank convergence is
evidence that **the Web is expander-like**.

A later result made this sharper: with damping $d$, the second eigenvalue of the
PageRank matrix is at most $d$ (Haveliwala and Kamvar, 2003). So the error shrinks by
roughly a factor of $d$ per iteration, and $0.85^{52} \approx 2 \times 10^{-4}$ — about
the order of tolerance the paper's 52 iterations suggest. The damping factor is not
only a modeling choice about bored surfers; it directly sets the convergence rate.

## 5. Ranking search results

PageRank is a ranking of every page *regardless of query*, so using it for search means
combining it with something that *is* about the query.

**Title search.** A deliberately simple engine searched only the titles of 16 million
pages and sorted matches by PageRank. It worked remarkably well: a query for
"University" returned a list of top universities, where a contemporary engine returned
random-looking pages that happened to match. The paper's explanation is precise —
**the title match ensures precision; PageRank ensures quality.** For broad queries,
recall barely matters, because there are far more matching pages than anyone will read.

**Rank merging.** For specific queries, where recall matters, traditional relevance
scores over the full text must be combined with PageRank. Google combined standard
information-retrieval measures, term proximity, **anchor text** (the text of links
pointing to a page), and PageRank. The authors call rank merging very difficult, and
offer no formula for it.

PageRank's benefit is greatest for **underspecified queries**. A search for "Stanford
University" on a conventional engine might return any page mentioning Stanford; with
PageRank, the university's home page comes first.

### The common case

The paper names a design goal that explains much of what followed: **handle the common
case well.** A user searching "wolverine," half-remembering that the University of
Michigan's student administration system was called something with a wolverine in it,
got "Wolverine Access" as the first result — because every student used it, so a random
searcher was likely looking for it. Nothing in that page's HTML said so; the evidence
was entirely in how other pages linked to it. And it could not have been self-declared:
page authors cannot be trusted to rate their own importance.

The paper is careful to distinguish this from a different task — finding the page with
the most information *about* wolverines — and argues a general engine should serve both.
It also observes that PageRank captures a kind of **collaborative trust**: a news story
linked from a major newspaper's home page inherits rank, and plausibly credibility,
from that link.

## 6. Personalized PageRank

$E$ was introduced to fix rank sinks, and turns out to be the most powerful parameter in
the model. A uniform $E$ is the egalitarian choice — every page gets some value simply because it
exists — but it overrates pages with many internal links, such as copyright notices,
disclaimers, and heavily interlinked mailing-list archives.

The other extreme puts all of $E$ on a **single page**. The paper tried two: the Netscape
home page, modeling a novice whose browser opened there, and the home page of the
computer scientist John McCarthy. In both, the mailing-list problem disappeared, the
chosen page came out on top followed by its immediate links, and the rankings diverged
in exactly the expected ways:

| Page | McCarthy's view | Netscape's view |
|---|---|---|
| John Mitchell (Stanford CS Theory Group) | 100.00% | 93.89% |
| Stanford CS home page | 100.00% | 99.83% |
| University of Toronto CS Department | 99.99% | 99.09% |

(Percentiles, which compress large differences at the top of the range.) A query for
"Mitchell" under McCarthy's $E$ returned John Mitchell, a colleague, first — among the
many Mitchells on the Web. The paper proposes this as the basis for **personal search
engines** seeded from a user's bookmarks or home page.

### Manipulation

The paper makes a strong claim: personalized PageRank is **"virtually immune to
manipulation"** by commercial interests, because to rank highly a page must persuade
an important page — or a great many unimportant ones — to link to it. The worst case it
envisions is buying links on important sites, which it judges self-limiting because links on important sites cost money. It concedes that a compromise $E$ over the root pages of all web servers
would be open to anyone creating many servers that point at one site.

## 7. Beyond search, and a lesson in best-first search

**Estimating traffic.** Since PageRank models a random surfer, it should resemble real
usage. Comparing it against several months of national proxy-cache logs showed broad
agreement with instructive gaps — including sites with heavy traffic and low PageRank,
pages people visit but do not want to link to. The difference between the two signals
is information in its own right.

**Predicting backlinks — best-first search in disguise.** This is the experiment that
connects the paper to search algorithms. A crawler starts from a single URL and must
decide **which page to fetch next**, aiming to fetch pages in order of importance — here
measured as their true citation count, which is only knowable once everything has been
crawled. That is a **best-first search** over the Web graph with an evaluation function
computed from incomplete information.

Two evaluation functions were compared: the number of citations seen *so far*, and
PageRank computed over the partial crawl. **PageRank was the better predictor of
citation count than citation count itself.** The paper's explanation is in search
terms: counting citations **gets stuck in local maxima** — it burrows into a local
cluster such as the Stanford CS pages, whose dense internal links make them look
important — while PageRank quickly notices that the Stanford home page matters and
spreads out from it, producing an efficient, broad search. It is the same lesson as
greedy best-first search's failures: a myopic evaluation function leads the search into
a locally attractive region it is slow to leave.

**Navigation.** A proxy annotated every link on a page with a bar showing its PageRank,
so a user could judge a link before following it. It made broken links obvious — a
professor's mistyped URL stood out because its rank was conspicuously low.

## 8. What the paper got right, and what it underestimated

The conclusion states the ambition plainly: condense every page on the Web into a
single number derived only from its position in the link graph. The core insight has
lasted — **use information external to the page, its backlinks, as a kind of peer
review, and weight each reviewer by its own standing.** The same recursive idea now
ranks nodes in citation networks, protein interactions, social graphs and road
networks, and the random-surfer formulation is a standard first example of a Markov
chain's stationary distribution.

The manipulation claim aged least well. Link farms, paid links and comment spam became
an industry precisely because PageRank made links valuable, and search engines spent
years building defenses and adding hundreds of other signals. The paper's own reasoning
anticipated the weakness — persuade enough unimportant pages to link to you — while
underestimating how cheaply those pages could be manufactured.

## Terms defined in one place

| Term | Definition |
|---|---|
| **Forward link (outedge)** | A link from a page to another page |
| **Backlink (inedge)** | A link into a page from another page |
| **PageRank** | A page's score: the sum of its backlinks' ranks, each divided by that page's number of outgoing links |
| **Rank sink** | A cycle with links in but none out, which absorbs rank under the simplified definition |
| **Rank source E** | A vector over pages that injects rank everywhere; the surfer's jump distribution |
| **Damping factor d** | Probability of following a link rather than jumping; 0.85 corresponds to the paper's ‖E‖₁ = 0.15 |
| **Random surfer** | The walk whose stationary distribution is PageRank |
| **Stationary distribution** | The long-run probability of being at each state of a Markov chain |
| **Dominant eigenvector** | The eigenvector of the largest eigenvalue; what power iteration converges to |
| **Power iteration** | Repeatedly applying a matrix to a vector until it stops changing |
| **Dangling link** | A link to a page with no outgoing links, often one not yet crawled |
| **Expander graph** | A graph in which every not-too-large node set has a proportionally larger neighborhood |
| **Rapid mixing** | Convergence of a random walk in time logarithmic in the graph's size |
| **Personalized PageRank** | PageRank with E concentrated on chosen pages, ranking from that viewpoint |
| **Anchor text** | The visible text of a link, used as a description of the page it points to |
| **Rank merging** | Combining query-dependent relevance scores with query-independent PageRank |

## What to interrogate, not just absorb

1. **Importance is not relevance.** PageRank says nothing about whether a page answers
   the query. The paper is explicit that title matching supplies the precision; what is
   left implicit is how much of Google's early quality came from anchor text and the
   merging function rather than from PageRank itself.
2. **Why 0.15?** The jump weight is a modeling choice with consequences: it sets how much
   rank pages get merely for existing, how resistant the ranking is to sinks, and — as
   §4 shows — how fast the computation converges. The paper offers no derivation.
3. **Popularity feeds on itself.** Highly ranked pages are found more, linked more, and
   ranked higher still. A ranking built on links rewards incumbency; ask what that does
   to new pages and minority viewpoints.
4. **"Virtually immune to manipulation."** Trace the argument in §6 and identify which
   assumption about the cost of creating pages turned out to be false.
5. **The crawler result generalizes.** An evaluation function computed from global
   structure beat one computed from local counts, even on the local counts' own
   measure. Where else in search does a heuristic fail because it is too local — and
   what would the PageRank-style fix look like there?
