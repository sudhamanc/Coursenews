---
course: applied-ai
lectureId: W3
title: "The Mathematics of Taste: How Machines Learn What You Want Next"
deck: "From content filters to the singular value decomposition, recommender systems turn a mostly empty grid of ratings into a prediction of desire — and confront the hardest problem of all: the user they have never seen."
order: 3
readingTime: 11
tags: ["recommender-systems", "collaborative-filtering", "matrix-factorization", "svd", "cold-start"]
concepts:
  - id: recommender-systems
    term: Recommender Systems
    definition: "Software systems that suggest items or services to users on the premise that they may be of interest, creating value for both the sponsoring company and the end user."
  - id: content-based-filtering
    term: Content-Based Filtering
    definition: "A recommendation strategy that takes the features of items a user already likes and seeks other items sharing those features."
  - id: collaborative-filtering
    term: Collaborative Filtering
    definition: "A recommendation strategy that exploits relationships between users or between items, predicting a user's taste from the ratings of similar users or similar items."
  - id: case-based-recommender
    term: Case-Based Recommender
    definition: "A recommender that treats past items as solved cases and, given a new demand or set of preferences, retrieves the item whose features are most similar as the candidate solution."
  - id: matrix-factorization
    term: Matrix Factorization
    definition: "Approximating a large, sparse ratings matrix as the product of two smaller matrices of latent factors, which predicts missing ratings while reducing sparsity and dimensionality."
  - id: singular-value-decomposition
    term: Singular Value Decomposition (SVD)
    definition: "A factorization of a matrix into A = UΣVᵀ, where U and V relate the two entity types to latent factors and Σ holds the singular values that measure each factor's strength."
  - id: cold-start-problem
    term: Cold-Start Problem
    definition: "The difficulty of recommending items to a brand-new user, or recommending a brand-new item, when there are no ratings yet from which to reason."
---

Every time a streaming service cues up your next film, an online store nudges a
product into your cart, or a music app assembles a playlist that feels uncannily
right, a recommender system is at work. The third lecture of Applied AI treats
these systems not as marketing gimmicks but as one of the most commercially
important families of AI ever built — and shows that beneath the convenience lies
a surprisingly deep vein of mathematics, running from reasoning by analogy to the
factorization of enormous, mostly empty matrices.

## What a Recommender Actually Does

A **recommender system** is software that suggests items or services to a user on
the premise that they may be of interest. The value flows in two directions:
chiefly to the company that sponsors the system's development and maintenance,
through higher sales or contracted services, but also to users, who discover
things they would never otherwise have found.

## A Taxonomy of Recommenders

The lecture lays out a whole family of approaches. **Content-based** recommenders
take the features of items a user already likes and seek other items sharing
those features. **Collaborative filtering** (neighborhood-based) instead exploits
relationships between users or between items — an item–item scheme predicts your
taste for an item from your own ratings of *similar* items. **Demographic**
recommenders group users by traits assumed to predict shared preferences.
**Constraint-based** systems encode users and items as rules (a risk-averse
investor; a product that can only ship after purchase). **Case-based** systems
match item attributes against a user's stated preferences.
**Community- or social-based** systems assume friends and community members share
tastes. **Utility-based** systems fit a utility function from carefully designed
questions, capturing how a user trades quality against cost. And **hybrid**
recommenders combine two or more of these techniques.

## Reasoning by Precedent

The **case-based recommender** deserves a closer look, because it reframes
recommendation as memory. Standard case-based reasoning takes a new problem,
retrieves the most similar past problem, and reuses its solution as a candidate.
The extended view for recommendation casts items — products — in the role of
solved cases: a new demand, or a set of user preferences, retrieves the item
whose features are most similar, and that item becomes the candidate to meet the
demand. Recommendation, in this light, is simply the retrieval of the nearest
precedent.

## The Wisdom of Similar Users

Collaborative filtering is best seen through the lecture's worked example: a
table of users against movies, each cell a rating from 1 to 5, with many cells
left blank. The method recommends items to a user by leaning on the users who
have rated things similarly. But the table is mostly question marks — most users
have rated only a handful of the available titles — and that produces two
chronic headaches. The first is **data sparsity**: there is far more missing than
present. The second is the **cold-start problem**, in which a brand-new user or a
newly added item has no ratings at all from which to reason.

<figure>
<svg viewBox="0 0 540 320" role="img" aria-label="A sparse user-by-movie ratings matrix: most cells are unknown, and one brand-new user's row is entirely empty, illustrating sparsity and the cold-start problem.">
  <text x="245" y="24" text-anchor="middle" font-size="12" class="dgm-muted">movies</text>
  <text x="105" y="42" text-anchor="middle" font-size="12">M1</text>
  <text x="175" y="42" text-anchor="middle" font-size="12">M2</text>
  <text x="245" y="42" text-anchor="middle" font-size="12">M3</text>
  <text x="315" y="42" text-anchor="middle" font-size="12">M4</text>
  <text x="385" y="42" text-anchor="middle" font-size="12">M5</text>
  <text x="40" y="76" text-anchor="middle" font-size="12">U1</text>
  <text x="40" y="120" text-anchor="middle" font-size="12">U2</text>
  <text x="40" y="164" text-anchor="middle" font-size="12">U3</text>
  <text x="40" y="208" text-anchor="middle" font-size="12">U4</text>
  <line x1="70" y1="50" x2="70" y2="270" stroke="currentColor" stroke-width="1.5"/>
  <line x1="140" y1="50" x2="140" y2="270" stroke="currentColor" stroke-width="1.5"/>
  <line x1="210" y1="50" x2="210" y2="270" stroke="currentColor" stroke-width="1.5"/>
  <line x1="280" y1="50" x2="280" y2="270" stroke="currentColor" stroke-width="1.5"/>
  <line x1="350" y1="50" x2="350" y2="270" stroke="currentColor" stroke-width="1.5"/>
  <line x1="420" y1="50" x2="420" y2="270" stroke="currentColor" stroke-width="1.5"/>
  <line x1="70" y1="50" x2="420" y2="50" stroke="currentColor" stroke-width="1.5"/>
  <line x1="70" y1="94" x2="420" y2="94" stroke="currentColor" stroke-width="1.5"/>
  <line x1="70" y1="138" x2="420" y2="138" stroke="currentColor" stroke-width="1.5"/>
  <line x1="70" y1="182" x2="420" y2="182" stroke="currentColor" stroke-width="1.5"/>
  <line x1="70" y1="226" x2="420" y2="226" stroke="currentColor" stroke-width="1.5"/>
  <line x1="70" y1="270" x2="420" y2="270" stroke="currentColor" stroke-width="1.5"/>
  <text x="105" y="77" text-anchor="middle" font-size="13">5</text>
  <text x="245" y="77" text-anchor="middle" font-size="13">4</text>
  <text x="385" y="77" text-anchor="middle" font-size="13">3</text>
  <text x="175" y="77" text-anchor="middle" font-size="13" class="dgm-muted">?</text>
  <text x="315" y="77" text-anchor="middle" font-size="13" class="dgm-muted">?</text>
  <text x="175" y="121" text-anchor="middle" font-size="13">3</text>
  <text x="385" y="121" text-anchor="middle" font-size="13">4</text>
  <text x="105" y="121" text-anchor="middle" font-size="13" class="dgm-muted">?</text>
  <text x="245" y="121" text-anchor="middle" font-size="13" class="dgm-muted">?</text>
  <text x="315" y="121" text-anchor="middle" font-size="13" class="dgm-muted">?</text>
  <text x="105" y="165" text-anchor="middle" font-size="13">4</text>
  <text x="315" y="165" text-anchor="middle" font-size="13">5</text>
  <text x="175" y="165" text-anchor="middle" font-size="13" class="dgm-muted">?</text>
  <text x="245" y="165" text-anchor="middle" font-size="13" class="dgm-muted">?</text>
  <text x="385" y="165" text-anchor="middle" font-size="13" class="dgm-muted">?</text>
  <text x="175" y="209" text-anchor="middle" font-size="13">2</text>
  <text x="245" y="209" text-anchor="middle" font-size="13">5</text>
  <text x="105" y="209" text-anchor="middle" font-size="13" class="dgm-muted">?</text>
  <text x="315" y="209" text-anchor="middle" font-size="13" class="dgm-muted">?</text>
  <text x="385" y="209" text-anchor="middle" font-size="13" class="dgm-muted">?</text>
  <g class="dgm-accent">
    <rect x="70" y="226" width="350" height="44" class="dgm-soft" stroke="currentColor" stroke-width="1.5"/>
    <text x="40" y="252" text-anchor="middle" font-size="12" font-weight="700">U5</text>
    <text x="105" y="253" text-anchor="middle" font-size="13">?</text>
    <text x="175" y="253" text-anchor="middle" font-size="13">?</text>
    <text x="245" y="253" text-anchor="middle" font-size="13">?</text>
    <text x="315" y="253" text-anchor="middle" font-size="13">?</text>
    <text x="385" y="253" text-anchor="middle" font-size="13">?</text>
    <text x="485" y="253" text-anchor="middle" font-size="12" font-weight="700">cold start</text>
  </g>
  <text x="245" y="298" text-anchor="middle" font-size="11" class="dgm-muted">? = no rating yet — most of the grid is empty (sparse)</text>
</svg>
<figcaption><b>The sparse ratings grid.</b> Users rate only a few of many titles, so most cells are unknown; a brand-new user (U5) has no ratings at all — the cold-start problem.</figcaption>
</figure>

## Factoring Taste

The breakthrough is **matrix factorization**. Factorization writes a number as a
product of factors; matrix factorization writes one matrix as the product of two
smaller ones. The idea is to approximate the giant, sparse ratings matrix $R$ as

$$
R \approx P\,Q^{\top}
$$

where $P$ maps each user to a short vector of latent factors and $Q$ maps each
item into the same factor space. A predicted rating is then just a dot product:

$$
\hat{r}_{ui} = \mathbf{p}_u^{\top}\mathbf{q}_i
$$

The latent factors might loosely correspond to genre, mood, or era — but the
model discovers them from the ratings alone, without being told what they mean.
The compression is dramatic: in the lecture's example, a matrix of roughly
2,000,000 entries is represented by two matrices holding about 300,000 between
them. Factorization thus solves three problems at once — it predicts the missing
values, it reduces sparsity, and it reduces dimensionality.

<figure>
<svg viewBox="0 0 720 250" role="img" aria-label="Matrix factorization: a large users-by-items ratings matrix R is approximated by a tall user-factor matrix P times a wide item-factor matrix Q-transpose.">
  <text x="115" y="40" text-anchor="middle" font-size="11" class="dgm-muted">items</text>
  <text x="26" y="130" text-anchor="middle" font-size="11" class="dgm-muted" transform="rotate(-90 26 130)">users</text>
  <rect x="45" y="55" width="150" height="150" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="120" y="138" text-anchor="middle" font-size="26" font-weight="700">R</text>
  <text x="120" y="228" text-anchor="middle" font-size="11" class="dgm-muted">≈ 2,000,000 values</text>
  <text x="225" y="138" text-anchor="middle" font-size="24">≈</text>
  <text x="285" y="40" text-anchor="middle" font-size="11" class="dgm-muted">k</text>
  <rect x="258" y="55" width="54" height="150" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="285" y="138" text-anchor="middle" font-size="20" font-weight="700">P</text>
  <text x="345" y="138" text-anchor="middle" font-size="20">×</text>
  <text x="453" y="80" text-anchor="middle" font-size="11" class="dgm-muted">items</text>
  <text x="368" y="118" text-anchor="middle" font-size="11" class="dgm-muted" transform="rotate(-90 368 118)">k</text>
  <rect x="378" y="88" width="150" height="56" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="453" y="124" text-anchor="middle" font-size="20" font-weight="700">Qᵀ</text>
  <text x="393" y="228" text-anchor="middle" font-size="11" class="dgm-accent">≈ 300,000 values — latent factors (k ≪ users, items)</text>
</svg>
<figcaption><b>Factoring the ratings matrix.</b> The giant, sparse matrix <em>R</em> is approximated by two thin factor matrices — a user matrix <em>P</em> and an item matrix <em>Q</em> — whose product fills in every missing rating from far fewer numbers.</figcaption>
</figure>

## The Singular Value Decomposition

One classical route to those factors is the **singular value decomposition**. Any
real matrix $A$ can be written

$$
A = U\,\Sigma\,V^{\top}
$$

If $A$ holds items against users, then $U$ relates one entity — say items — to a
set of $r$ latent factors, $V$ relates the other — users — to the same factors,
and $\Sigma$ is a diagonal matrix whose entries, the **singular values** (the
square roots of the eigenvalues of $A^{\top}A$), measure the strength of each
factor. Keeping only the largest few singular values yields the best low-rank
approximation of $A$ — precisely the compressed, denoised picture of taste a
recommender wants.

## Learning the Factors

SVD is not the only path. The same factorization can be cast as **supervised
learning** and solved with a neural network: initialize $P$ and $Q$, predict each
*known* rating as a dot product, and adjust the factors by gradient descent to
minimize the error on the ratings that actually exist. The network never sees the
missing cells during training; it simply learns factors that reconstruct the
observed ratings, then uses those same factors to fill in the blanks.

## The Problems That Won't Go Away

The lecture ends with a sober inventory of open challenges: the cold-start
problem; scalability across huge numbers of users and items; data sparsity;
diversity, so the system does not merely echo the most popular items;
personalization to individual history; privacy and security, including the duty
to avoid biased or discriminatory recommendations; explainability, the ability to
say *why* an item was suggested; and evaluation, the choice of appropriate
metrics for measuring success.

## Why It Matters

Recommender systems are where abstract linear algebra meets billion-dollar
business models. The move from content-based filtering to matrix factorization
was, in miniature, the same move the whole field made across its three waves:
from hand-specified features to latent structure learned from data. Yet the
lecture's closing list of challenges — cold start, sparsity, privacy, and above
all explainability — is a reminder that the mathematics is the easy part. A
recommendation that cannot justify itself, or that quietly encodes bias, can
erode the very trust that makes the system valuable. Factoring a matrix, it
turns out, is simpler than earning a user's confidence.
