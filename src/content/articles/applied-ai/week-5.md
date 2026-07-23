---
course: applied-ai
lectureId: W5
title: "Learning From Yes and No: The Two Machines That Generalize"
deck: "Decision trees ask questions and neural networks add up evidence — this lecture shows how both turn labeled examples into predictions, and how a single number called loss teaches a network to improve."
order: 5
readingTime: 8
tags: ["inductive-learning", "decision-trees", "neural-networks", "gradient-descent", "loss"]
concepts:
  - id: inductive-learning
    term: "Inductive Learning"
    definition: "Supervised learning of a concept from both positive and negative labeled examples; the labels are what make it supervised, and decision trees and neural networks are two ways to do it."
  - id: decision-tree
    term: "Decision Tree Induction"
    definition: "A method that repeatedly splits the data on the feature that best separates the classes, building a tree of yes/no questions whose leaves assign a label."
  - id: neural-network
    term: "Feedforward Neural Network"
    definition: "Layers of neurons connected by weighted links, where each neuron sums its weighted inputs, offsets them by a bias, and passes the result forward toward an output decision."
  - id: weights-bias
    term: "Weights and Bias"
    definition: "The learnable parameters of a network: weights scale each incoming signal, and the bias sets the threshold a neuron's weighted sum must clear before it activates."
  - id: loss-function
    term: "Loss Function"
    definition: "A single number measuring how far a network's predictions sit from the true labels, averaged over all training examples; minimizing it is the objective of learning."
  - id: gradient-descent
    term: "Gradient Descent"
    definition: "The optimization that nudges every weight and bias in the direction that most reduces the loss, using the gradient to decide how much each parameter should change."
---

There are two ways to teach a machine to tell a fraudster from an honest filer, or
an eight from a six. You can hand it a rulebook, or you can show it examples and let
it write the rulebook itself. This lecture is about the second path — **inductive
learning** — and the two workhorse methods that walk it: decision trees, which learn
by asking questions, and neural networks, which learn by weighing evidence. What
unites them is a dependence on labeled examples and a willingness to be told, over
and over, exactly how wrong they are.

## Learning a Concept From Yes and No

**Inductive learning** examines both positive and negative labeled instances to learn
a concept. The presence of labels is precisely what makes it *supervised*: each
example arrives tagged with the right answer, and the learner's job is to find a rule
that reproduces those answers and generalizes to new cases. The lecture frames
decision trees and neural networks as two approaches to this same task — one symbolic
and legible, the other numeric and distributed — and much of the intellectual payoff
comes from seeing them side by side.

## The Twenty Questions Machine

A **decision tree** learns by interrogation. Given a table of examples — each a
taxpayer described by whether they received a refund, their marital status, and their
taxable income, and labeled as to whether they cheated — the induction algorithm
looks for the single feature that best separates the classes, and splits on it.

The lecture works the example by hand. Refund turns out to correlate cleanly with the
label, so it becomes the first question: *Was there a refund?* Everyone who received
one falls into a pure group labeled "no cheat," and that branch is finished. Marital
status would have separated the data equally well, but the instructor deliberately
passes it over for the first split — it has three values, and numeric features are
undesirable at the top of the tree — choosing the cleaner binary cut instead. That
preference is a practical heuristic: simpler, lower-cardinality splits near the root
tend to yield shallower, more general trees.

The remaining, still-mixed group gets a second question — *Is marital status
"married"?* — which peels off another pure subset. What is left finally demands a
numeric threshold: *Is taxable income above 100K?* Above it, the examples are
cheaters; below, they are not. The tree is complete, a cascade of yes/no questions
ending in labels.

<figure>
<svg viewBox="0 0 860 344" role="img" aria-label="A decision tree for the tax-cheat example: it splits on refund, then marital status, then taxable income, ending in cheat or no-cheat leaves.">
  <defs>
    <marker id="arw-dt" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" class="dgm-fill"/>
    </marker>
  </defs>
  <rect x="354" y="16" width="150" height="40" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="429" y="41" text-anchor="middle" font-size="13" font-weight="700">Refund?</text>
  <line x1="429" y1="56" x2="130" y2="110" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-dt)"/>
  <text x="262" y="80" text-anchor="middle" font-size="11" class="dgm-muted">yes</text>
  <line x1="429" y1="56" x2="590" y2="108" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-dt)"/>
  <text x="522" y="80" text-anchor="middle" font-size="11" class="dgm-muted">no</text>
  <rect x="64" y="112" width="112" height="36" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="120" y="134" text-anchor="middle" font-size="12">No cheat</text>
  <rect x="520" y="110" width="150" height="40" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="595" y="135" text-anchor="middle" font-size="13" font-weight="700">Married?</text>
  <line x1="595" y1="150" x2="486" y2="206" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-dt)"/>
  <text x="522" y="176" text-anchor="middle" font-size="11" class="dgm-muted">yes</text>
  <line x1="595" y1="150" x2="725" y2="204" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-dt)"/>
  <text x="676" y="176" text-anchor="middle" font-size="11" class="dgm-muted">no</text>
  <rect x="420" y="208" width="112" height="36" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="476" y="230" text-anchor="middle" font-size="12">No cheat</text>
  <rect x="636" y="206" width="178" height="40" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="725" y="231" text-anchor="middle" font-size="12" font-weight="700">Income &gt; 100K?</text>
  <line x1="725" y1="246" x2="612" y2="300" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-dt)"/>
  <text x="652" y="272" text-anchor="middle" font-size="11" class="dgm-muted">yes</text>
  <line x1="725" y1="246" x2="756" y2="300" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-dt)"/>
  <text x="756" y="272" text-anchor="middle" font-size="11" class="dgm-muted">no</text>
  <g class="dgm-accent">
    <rect x="556" y="300" width="112" height="36" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <text x="612" y="322" text-anchor="middle" font-size="12" font-weight="700">Cheat</text>
  </g>
  <rect x="700" y="300" width="112" height="36" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="756" y="322" text-anchor="middle" font-size="12">No cheat</text>
</svg>
<figcaption><b>Decision-tree induction.</b> Each internal node splits on the feature that best purifies the data; following the yes/no answers from the root lands every example on a labeled leaf.</figcaption>
</figure>

The lecture is honest about the tree's blind spot: by lumping every unmarried person
together, it never distinguishes the divorced from the single, and a differently
built tree might. The principled version of "best separates the classes" is
**information gain**, the reduction in label entropy

$$
H(S) = -\sum_{c} p_c \log_2 p_c
$$

achieved by a split — the criterion the ID3 family of tree learners makes explicit —
but the intuition is exactly the one the hand-worked example builds: ask the question
that most purifies what remains.

## Neurons, Weights, and a Threshold

A **neural network** reaches the same kind of decision by a different road. The
lecture builds one to recognize crude handwritten digits represented as nine cells —
nine input **neurons**, some active ($1$) and some inactive ($0$). Those inputs
connect to a hidden neuron, and each connection carries a **weight**. The hidden
neuron's value is the sum of each input times its weight, offset by a **bias**:

$$
h = \sum_{i=1}^{9} a_i w_i - b.
$$

The bias acts as a threshold — the instructor's phrasing is that the neuron should not
activate "unless this sum is greater than 2," so $b = 2$. With the pattern for an
eight active and the given weights, the arithmetic runs

$$
h = (3 + 2 - 0.3 + 1) - 2 = 3.7.
$$

The same recipe carries forward to three output neurons, one per candidate digit,
each computing $y_j = a_h w_{2j} - b_j$. For this input the raw outputs come out as
$12.8$, $5.4$, and $8.1$, which, normalized to a distribution, become $0.49$, $0.21$,
and $0.31$. The largest points to digit "3." Feed the network the patterns for six or
eight, though, and — with these arbitrary starting weights — it points to the wrong
answers. The lecture's verdict is blunt: **this network needs to learn.**

<figure>
<svg viewBox="0 0 820 260" role="img" aria-label="A feedforward network: nine input cells feed one hidden neuron computing a weighted sum minus a bias, which feeds three output neurons whose largest score is the prediction.">
  <defs>
    <marker id="arw-nn" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" class="dgm-fill"/>
    </marker>
  </defs>
  <rect x="40" y="70" width="32" height="32" stroke="currentColor" stroke-width="1.5" class="dgm-soft"/>
  <rect x="76" y="70" width="32" height="32" stroke="currentColor" stroke-width="1.5" class="dgm-soft"/>
  <rect x="112" y="70" width="32" height="32" stroke="currentColor" stroke-width="1.5" class="dgm-soft"/>
  <rect x="40" y="106" width="32" height="32" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <rect x="76" y="106" width="32" height="32" stroke="currentColor" stroke-width="1.5" class="dgm-soft"/>
  <rect x="112" y="106" width="32" height="32" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <rect x="40" y="142" width="32" height="32" stroke="currentColor" stroke-width="1.5" class="dgm-soft"/>
  <rect x="76" y="142" width="32" height="32" stroke="currentColor" stroke-width="1.5" class="dgm-soft"/>
  <rect x="112" y="142" width="32" height="32" stroke="currentColor" stroke-width="1.5" class="dgm-soft"/>
  <text x="92" y="196" text-anchor="middle" font-size="11" class="dgm-muted">9 inputs aᵢ (0/1)</text>
  <line x1="72" y1="86" x2="358" y2="125" stroke="currentColor" stroke-width="1.5"/>
  <line x1="108" y1="86" x2="358" y2="125" stroke="currentColor" stroke-width="1.5"/>
  <line x1="144" y1="86" x2="358" y2="125" stroke="currentColor" stroke-width="1.5"/>
  <line x1="72" y1="122" x2="358" y2="125" stroke="currentColor" stroke-width="1.5"/>
  <line x1="108" y1="122" x2="358" y2="125" stroke="currentColor" stroke-width="1.5"/>
  <line x1="144" y1="122" x2="358" y2="125" stroke="currentColor" stroke-width="1.5"/>
  <line x1="72" y1="158" x2="358" y2="125" stroke="currentColor" stroke-width="1.5"/>
  <line x1="108" y1="158" x2="358" y2="125" stroke="currentColor" stroke-width="1.5"/>
  <line x1="144" y1="158" x2="358" y2="125" stroke="currentColor" stroke-width="1.5"/>
  <text x="250" y="98" text-anchor="middle" font-size="10" class="dgm-muted">weights wᵢ</text>
  <g class="dgm-accent">
    <circle cx="400" cy="125" r="42" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <text x="400" y="131" text-anchor="middle" font-size="18" font-weight="700">h</text>
  </g>
  <text x="400" y="205" text-anchor="middle" font-size="12">h = Σ aᵢwᵢ − b</text>
  <text x="400" y="224" text-anchor="middle" font-size="10" class="dgm-muted">bias b sets the threshold</text>
  <line x1="442" y1="125" x2="662" y2="56" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-nn)"/>
  <line x1="442" y1="125" x2="662" y2="125" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-nn)"/>
  <line x1="442" y1="125" x2="662" y2="194" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-nn)"/>
  <text x="556" y="100" text-anchor="middle" font-size="10" class="dgm-muted">w₂ⱼ</text>
  <circle cx="690" cy="55" r="26" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="690" y="60" text-anchor="middle" font-size="13">y₁</text>
  <circle cx="690" cy="125" r="26" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="690" y="130" text-anchor="middle" font-size="13">y₂</text>
  <circle cx="690" cy="195" r="26" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="690" y="200" text-anchor="middle" font-size="13">y₃</text>
  <text x="748" y="42" text-anchor="middle" font-size="9" class="dgm-muted">largest</text>
  <text x="752" y="60" text-anchor="middle" font-size="12" font-weight="700">0.49</text>
  <text x="752" y="130" text-anchor="middle" font-size="12">0.21</text>
  <text x="752" y="200" text-anchor="middle" font-size="12">0.31</text>
</svg>
<figcaption><b>A feedforward network.</b> Nine input cells feed a hidden neuron that computes a weighted sum offset by a bias, h = Σ aᵢwᵢ − b; three output neurons then produce a score distribution whose largest entry is the prediction.</figcaption>
</figure>

## Measuring How Wrong

Learning begins by quantifying failure. The **loss** is the gap between what the
network predicted and what it should have. For an input, the lecture squares the
difference on each output and sums:

$$
L = \sum_{j} (\hat{y}_j - y_j)^2.
$$

For the "3" example, whose target is $(1,0,0)$, that is
$(0.49-1)^2 + (0.21)^2 + (0.31)^2 \approx 0.40$. The six costs $0.62$; the eight, a
dismal $1.09$. Averaging across the three training instances gives

$$
\bar{L} = \tfrac{1}{3}\,(0.40 + 0.62 + 1.09) \approx 0.70.
$$

That single number is the output of the **loss function**, and its inputs are every
weight and bias in the network. Change them, and the average loss changes — the
lecture shows one set of weights scoring $0.70$, another $0.65$, another $0.53$.
Learning is nothing more than the search for the weights that drive this number down.

## Rolling Downhill

What makes that search tractable is the **gradient**. The gradient of the loss
function tells us how much to change each weight and bias to reduce the average loss,
and which parameters matter most in doing so. Geometrically it points uphill in the
landscape of loss; learning walks the opposite way, a step at a time:

$$
w \leftarrow w - \eta \, \frac{\partial \bar{L}}{\partial w},
$$

where $\eta$ is a small step size. Repeat this over the whole training set and the
weights settle into values that make the network's outputs line up with the labels —
the eight finally lighting up the "8" neuron, the six the "6." The decision tree found
its rule by splitting; the network finds its rule by descending.

<figure>
<svg viewBox="0 0 720 300" role="img" aria-label="Gradient descent: loss plotted against a weight forms a bowl, and repeated downhill steps move the weight toward the minimum loss.">
  <defs>
    <marker id="arw-gd" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" class="dgm-fill"/>
    </marker>
  </defs>
  <line x1="70" y1="30" x2="70" y2="252" stroke="currentColor" stroke-width="1.5" marker-start="url(#arw-gd)"/>
  <line x1="70" y1="252" x2="682" y2="252" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-gd)"/>
  <text x="58" y="44" text-anchor="end" font-size="12">loss L</text>
  <text x="660" y="272" text-anchor="middle" font-size="12">weight w</text>
  <path d="M110,70 C200,300 580,300 668,92" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="452" y="52" text-anchor="middle" font-size="13">w ← w − η ∂L/∂w</text>
  <text x="452" y="72" text-anchor="middle" font-size="10" class="dgm-muted">η = step size</text>
  <circle cx="162" cy="150" r="5" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <circle cx="238" cy="205" r="5" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <circle cx="308" cy="232" r="5" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <circle cx="372" cy="244" r="5" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <line x1="170" y1="156" x2="230" y2="199" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-gd)"/>
  <line x1="246" y1="210" x2="300" y2="227" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-gd)"/>
  <line x1="316" y1="235" x2="366" y2="242" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-gd)"/>
  <line x1="380" y1="245" x2="396" y2="247" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-gd)"/>
  <g class="dgm-accent">
    <circle cx="404" cy="248" r="7" class="dgm-fill"/>
    <text x="404" y="278" text-anchor="middle" font-size="11" font-weight="700">minimum</text>
  </g>
</svg>
<figcaption><b>Gradient descent.</b> Learning treats the loss as a landscape over the weights and repeatedly steps each weight downhill, w ← w − η ∂L/∂w, until it settles near the minimum.</figcaption>
</figure>

## Why It Matters

These two methods bracket the whole field. The decision tree is transparent — you can
read its logic as a flowchart and explain any verdict it reaches — but brittle at the
edges it never learned to distinguish. The neural network is opaque, its knowledge
smeared across a matrix of weights, yet it bends to fit patterns no handwritten rule
could anticipate. Crucially, the loss-and-gradient loop introduced here is the same
engine, scaled up by many orders of magnitude, that trains every deep network behind
modern vision and language systems. Master the idea that a model is just parameters,
a loss is just a number, and learning is just walking downhill, and the rest of deep
learning is elaboration on a theme.
