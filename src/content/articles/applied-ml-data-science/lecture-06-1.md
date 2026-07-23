---
course: applied-ml-data-science
lectureId: L06
title: "The Problem That Killed — and Revived — the Neuron"
deck: "A single perceptron cannot solve XOR, a limitation that stalled neural networks for years; stacking layers and training them with backpropagation is what finally set deep learning loose."
order: 6
date: 2025-03-24
readingTime: 9
tags: ["neural-networks", "perceptron", "backpropagation", "mlp", "deep-learning"]
concepts:
  - id: perceptron
    term: "Perceptron / Linear Threshold Unit"
    definition: "The simplest neural unit: a binary classifier that fires when a weighted sum of its inputs crosses a threshold, drawing only a linear decision boundary."
  - id: activation-function
    term: "Activation Functions"
    definition: "Nonlinear functions such as the sigmoid, tanh, and ReLU applied to a neuron's weighted sum, giving stacked layers the power to represent nonlinear relationships."
  - id: xor-problem
    term: "The XOR Problem"
    definition: "The observation that XOR is not linearly separable, so no single perceptron can compute it — resolved only by introducing a hidden layer."
  - id: mlp
    term: "Multi-Layer Perceptron"
    definition: "A feedforward network with one or more hidden layers of nonlinear neurons; a deep stack of such layers is a deep neural network."
  - id: backpropagation
    term: "Backpropagation"
    definition: "The training algorithm that computes gradients efficiently in a forward pass followed by a backward pass, propagating output error back through the layers to update every weight."
  - id: epoch-batch-iteration
    term: "Epochs, Batches & Iterations"
    definition: "The vocabulary of gradient-descent training: an epoch is one full pass over the data, a mini-batch is the number of examples per pass, and an iteration is one batch."
---

In 1969, two MIT researchers published a result that nearly killed neural
networks. A single perceptron, they proved, could not compute XOR — could not
learn a function a child grasps in seconds. Funding dried up, attention drifted,
and the field slid into a long winter. What eventually thawed it was not a
smarter neuron but a taller stack of them, trained by an algorithm for pushing
blame backward through the layers.

## A Machine Modeled on the Brain

An artificial neural network is a model loosely inspired by the webs of biological
neurons in the brain, and it is the engine at the core of deep learning. Its
history is a series of surges and stalls: McCulloch and Pitts sketched the first
architecture in 1943; Rosenblatt built the perceptron in 1957; Minsky and Papert
exposed its limits in 1969; Rumelhart, Hinton, and Williams popularized
backpropagation in 1986. Progress then waited on hardware and data — graphics
processors arrived for deep learning around 2009, and the 2010s brought the
datasets that powered breakthroughs in speech and image recognition.

## The Linear Threshold Unit

The perceptron is a binary classifier built on a linear threshold unit. It
computes a weighted sum of its inputs and fires only when that sum clears a
threshold:

$$
h_{\theta}(\mathbf{x}) =
\begin{cases}
0 & \text{if } \sum_j \theta_j x_j \le \text{threshold} \\
1 & \text{if } \sum_j \theta_j x_j > \text{threshold}.
\end{cases}
$$

<figure>
<svg viewBox="0 0 640 250" role="img" aria-label="A perceptron: inputs are multiplied by weights and summed, then a threshold step function turns the weighted sum into a binary output of zero or one.">
  <defs>
    <marker id="arw-perc" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" class="dgm-fill"/>
    </marker>
  </defs>
  <line x1="88" y1="60" x2="299" y2="116" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-perc)"/>
  <line x1="88" y1="125" x2="295" y2="125" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-perc)"/>
  <line x1="88" y1="190" x2="299" y2="134" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-perc)"/>
  <text x="188" y="78" text-anchor="middle" font-size="12" class="dgm-muted">θ₀</text>
  <text x="185" y="116" text-anchor="middle" font-size="12" class="dgm-muted">θ₁</text>
  <text x="188" y="172" text-anchor="middle" font-size="12" class="dgm-muted">θ₂</text>
  <circle cx="70" cy="55" r="18" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="70" y="60" text-anchor="middle" font-size="12">1</text>
  <circle cx="70" cy="125" r="18" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="70" y="130" text-anchor="middle" font-size="13">x₁</text>
  <circle cx="70" cy="195" r="18" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="70" y="200" text-anchor="middle" font-size="13">x₂</text>
  <circle cx="330" cy="125" r="34" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="330" y="132" text-anchor="middle" font-size="20" font-weight="700">Σ</text>
  <line x1="364" y1="125" x2="426" y2="125" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-perc)"/>
  <text x="398" y="116" text-anchor="middle" font-size="12" class="dgm-muted">z</text>
  <g class="dgm-accent">
    <rect x="430" y="95" width="95" height="60" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <path d="M442,148 L470,148 L470,108 L508,108" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <text x="477" y="88" text-anchor="middle" font-size="11">step</text>
  </g>
  <line x1="525" y1="125" x2="566" y2="125" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-perc)"/>
  <circle cx="592" cy="125" r="22" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="592" y="131" text-anchor="middle" font-size="15" font-weight="700">ŷ</text>
  <text x="592" y="170" text-anchor="middle" font-size="11" class="dgm-muted">0 or 1</text>
</svg>
<figcaption><b>The linear threshold unit.</b> A perceptron weights its inputs, sums them, and fires a 1 only when the sum clears the threshold — a single straight-line decision boundary.</figcaption>
</figure>

A fully connected layer generalizes this to $h_{\Theta, b}(\mathbf{x}) = \phi(\mathbf{X}\Theta + \mathbf{b})$.
Training follows Hebb's rule — "cells that fire together wire together" — through
the perceptron learning rule, which nudges each weight toward reducing the error:

$$
\theta_{i,j}^{\text{(next)}} = \theta_{i,j} + \eta\,(y_j - \hat{y}_j)\,x_i.
$$

The catch is fundamental: its decision boundary is a straight line, so like every
linear classifier it cannot capture complex patterns.

## Building Logic Gates from a Single Neuron

Fitted with a sigmoid activation $g(z) = \frac{1}{1 + e^{-z}}$ and hand-chosen
weights, one neuron can implement Boolean logic. An AND gate is
$h_{\theta}(\mathbf{x}) = g(-30 + 20x_1 + 20x_2)$, which only clears zero when both
inputs are $1$; an OR gate uses a bias of $-10$; a NOT gate is $g(10 - 20x_1)$.
Each of these is a single line slicing through the unit square — and that is
exactly the limit.

## The Wall at XOR

XOR (and its complement XNOR) cannot be drawn with one line: no single hyperplane
separates its positive and negative cases. The escape is a hidden layer. Compute
two intermediate units — $a_1 = x_1 \text{ AND } x_2$ and
$a_2 = (\text{NOT } x_1) \text{ AND } (\text{NOT } x_2)$ — then feed them into an
OR gate, and the network computes XNOR. Two layers of simple neurons express what
one layer never could. Stack enough hidden layers and the result is a
multi-layer perceptron, or when the stack runs deep, a deep neural network.

<figure>
<svg viewBox="0 0 360 330" role="img" aria-label="The XOR problem plotted on the unit square: the two points where the inputs match belong to one class and the two where they differ to the other, so no single straight line can separate the classes.">
  <defs>
    <marker id="arw-xor" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" class="dgm-fill"/>
    </marker>
  </defs>
  <g class="dgm-muted">
    <line x1="70" y1="260" x2="326" y2="260" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-xor)"/>
    <line x1="70" y1="260" x2="70" y2="44" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-xor)"/>
    <text x="332" y="264" text-anchor="middle" font-size="12">x₁</text>
    <text x="70" y="34" text-anchor="middle" font-size="12">x₂</text>
    <text x="70" y="279" text-anchor="middle" font-size="11">0</text>
    <text x="300" y="279" text-anchor="middle" font-size="11">1</text>
    <text x="56" y="264" text-anchor="middle" font-size="11">0</text>
    <text x="56" y="64" text-anchor="middle" font-size="11">1</text>
  </g>
  <g class="dgm-accent">
    <line x1="50" y1="160" x2="322" y2="160" stroke="currentColor" stroke-width="1.5" stroke-dasharray="6 5"/>
    <line x1="176" y1="126" x2="194" y2="144" stroke="currentColor" stroke-width="2"/>
    <line x1="194" y1="126" x2="176" y2="144" stroke="currentColor" stroke-width="2"/>
  </g>
  <circle cx="70" cy="260" r="11" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <circle cx="300" cy="60" r="11" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <rect x="60" y="50" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <rect x="290" y="250" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="92" y="250" text-anchor="middle" font-size="11" class="dgm-muted">0</text>
  <text x="278" y="52" text-anchor="middle" font-size="11" class="dgm-muted">0</text>
  <text x="92" y="52" text-anchor="middle" font-size="11" class="dgm-muted">1</text>
  <text x="278" y="250" text-anchor="middle" font-size="11" class="dgm-muted">1</text>
  <circle cx="82" cy="305" r="6" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="128" y="309" text-anchor="middle" font-size="11" class="dgm-muted">XOR = 0</text>
  <rect x="214" y="299" width="12" height="12" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="268" y="309" text-anchor="middle" font-size="11" class="dgm-muted">XOR = 1</text>
</svg>
<figcaption><b>The wall at XOR.</b> The matching-input cases (circles) and the differing-input cases (squares) sit on opposite diagonals, so no single straight line can separate them — only a hidden layer can.</figcaption>
</figure>

## Curved Decisions: Activation Functions

Hidden layers only add power if the activations are nonlinear. The sigmoid
saturates at its extremes; the hyperbolic tangent,
$\tanh(z) = \frac{2}{1 + e^{-2z}} - 1$, is centered on zero and ranges over
$[-1, 1]$, which speeds convergence; and the rectified linear unit,
$\text{ReLU}(z) = \max(0, z)$, is cheap to compute, differentiable everywhere
except the origin, and the usual default.

## Teaching the Stack: Backpropagation

Backpropagation is gradient descent with automatic differentiation, run in two
sweeps. The forward pass propagates activations layer by layer,
$\mathbf{z}^{(l)} = \Theta^{(l-1)}\mathbf{a}^{(l-1)}$ and
$\mathbf{a}^{(l)} = g(\mathbf{z}^{(l)})$. The network then measures its output
error, $\delta^{(L)} = \mathbf{a}^{(L)} - \mathbf{y}$, and pushes it backward:

$$
\delta^{(l)} = \left(\Theta^{(l)}\right)^{\top}\delta^{(l+1)} \odot g'\!\left(\mathbf{z}^{(l)}\right),
\quad l = L-1,\dots,2,
$$

using each layer's share of the blame to tweak its connection weights. The
training vocabulary is worth pinning down: an *epoch* is one full forward-and-
backward pass over the data, the *mini-batch size* is how many examples travel
together in a pass, and an *iteration* is a single batch. With $32{,}000$ examples
and a batch size of $1{,}000$, one epoch takes $32$ iterations.

<figure>
<svg viewBox="0 0 620 340" role="img" aria-label="A multilayer perceptron with a two-node input layer plus a bias, a three-node hidden layer, and a single output node, fully connected; a forward pass runs left to right and backpropagation sends error right to left.">
  <defs>
    <marker id="arw-mlp" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" class="dgm-fill"/>
    </marker>
  </defs>
  <g class="dgm-muted">
    <line x1="95" y1="95" x2="310" y2="80" stroke="currentColor" stroke-width="1"/>
    <line x1="95" y1="95" x2="310" y2="175" stroke="currentColor" stroke-width="1"/>
    <line x1="95" y1="95" x2="310" y2="270" stroke="currentColor" stroke-width="1"/>
    <line x1="95" y1="180" x2="310" y2="80" stroke="currentColor" stroke-width="1"/>
    <line x1="95" y1="180" x2="310" y2="175" stroke="currentColor" stroke-width="1"/>
    <line x1="95" y1="180" x2="310" y2="270" stroke="currentColor" stroke-width="1"/>
    <line x1="95" y1="265" x2="310" y2="80" stroke="currentColor" stroke-width="1"/>
    <line x1="95" y1="265" x2="310" y2="175" stroke="currentColor" stroke-width="1"/>
    <line x1="95" y1="265" x2="310" y2="270" stroke="currentColor" stroke-width="1"/>
    <line x1="310" y1="80" x2="525" y2="180" stroke="currentColor" stroke-width="1"/>
    <line x1="310" y1="175" x2="525" y2="180" stroke="currentColor" stroke-width="1"/>
    <line x1="310" y1="270" x2="525" y2="180" stroke="currentColor" stroke-width="1"/>
  </g>
  <circle cx="95" cy="95" r="18" fill="var(--paper-2)" stroke="currentColor" stroke-width="1.5"/>
  <text x="95" y="100" text-anchor="middle" font-size="13">x₁</text>
  <circle cx="95" cy="180" r="18" fill="var(--paper-2)" stroke="currentColor" stroke-width="1.5"/>
  <text x="95" y="185" text-anchor="middle" font-size="13">x₂</text>
  <circle cx="95" cy="265" r="18" fill="var(--paper-2)" stroke="currentColor" stroke-width="1.5"/>
  <text x="95" y="270" text-anchor="middle" font-size="12">1</text>
  <circle cx="310" cy="80" r="18" fill="var(--paper-2)" stroke="currentColor" stroke-width="1.5"/>
  <circle cx="310" cy="175" r="18" fill="var(--paper-2)" stroke="currentColor" stroke-width="1.5"/>
  <circle cx="310" cy="270" r="18" fill="var(--paper-2)" stroke="currentColor" stroke-width="1.5"/>
  <circle cx="525" cy="180" r="20" fill="var(--paper-2)" stroke="currentColor" stroke-width="1.5"/>
  <text x="525" y="186" text-anchor="middle" font-size="15" font-weight="700">ŷ</text>
  <text x="95" y="308" text-anchor="middle" font-size="11" class="dgm-muted">input</text>
  <text x="310" y="308" text-anchor="middle" font-size="11" class="dgm-muted">hidden</text>
  <text x="525" y="308" text-anchor="middle" font-size="11" class="dgm-muted">output</text>
  <line x1="140" y1="32" x2="486" y2="32" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-mlp)"/>
  <text x="313" y="24" text-anchor="middle" font-size="11" class="dgm-accent-2">forward pass</text>
  <line x1="486" y1="322" x2="140" y2="322" stroke="currentColor" stroke-width="1.5" stroke-dasharray="6 5" marker-end="url(#arw-mlp)"/>
  <text x="313" y="336" text-anchor="middle" font-size="11" class="dgm-accent">backpropagate error</text>
</svg>
<figcaption><b>Stacking the neurons.</b> A hidden layer between input and output lets the network bend decision boundaries; training runs a forward pass, then backpropagates the output error to update every weight.</figcaption>
</figure>

## From Blackboard to Code

Scikit-learn packages all of this into `MLPClassifier` and `MLPRegressor`. The
knobs that matter: `hidden_layer_sizes` sets depth and width; `activation`
switches between `relu` and `tanh`; `alpha` controls the L2 penalty that fights
overfitting; and `solver` chooses the optimizer — `adam` by default (scale your
data to zero mean and unit variance), `lbfgs` robust but slow on larger models,
and `sgd` the deep-learning workhorse with many knobs of its own. Rounding it out
are `max_iter` and `early_stopping`.

```python
from sklearn.neural_network import MLPClassifier

mlp = MLPClassifier(
    hidden_layer_sizes=(10, 10),
    activation="relu",
    alpha=1e-4,
).fit(X_train, y_train)
```

Neural networks capture complex features and thrive on large, homogeneous data
where every feature carries similar meaning. But they train slowly enough to want
GPUs, overfit readily, and demand careful preprocessing — and when features are
wildly heterogeneous, tree-based models often do better.

## Why It Matters

Everything downstream — convolutional networks for vision, recurrent networks for
sequences, the transformers behind today's language models — is this same
machinery scaled up and specialized. The arc from a single thresholded neuron, to
the XOR wall, to a hidden layer trained by backpropagation is the origin story of
deep learning in miniature. Understand why one neuron fails and why a second layer
rescues it, and the towering architectures that followed stop looking like magic
and start looking like engineering.
