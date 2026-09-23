---
course: bedrock
lectureId: AIMA 22
book: "Artificial Intelligence: A Modern Approach"
part: "V · Machine Learning"
title: "Composition, Gradients, and the Priors You Build Into the Wiring"
deck: "Chapter 22 explains why depth works, why the gradient can be computed at all, and — most usefully — why convolution and recurrence are not architectural details but assumptions about the structure of the data, encoded in the connections."
order: 22
chapter: 22
readingTime: 15
tags: ["deep-learning", "backpropagation", "convolution", "generalization", "rnn"]
concepts:
  - id: feedforward-networks
    term: Feedforward Networks and Depth
    definition: "Layered compositions of linear maps and nonlinearities. A single hidden layer is a universal approximator, but deep composition represents many useful functions with exponentially fewer units — depth is about efficiency, not possibility."
  - id: computation-graph
    term: Computation Graphs and Backpropagation
    definition: "Representing the network as a graph of primitive operations, so the chain rule can be applied mechanically in reverse. Backpropagation is reverse-mode automatic differentiation, computing all gradients at cost comparable to one forward pass."
  - id: activation-functions
    term: Activation Functions
    definition: "ReLU's constant gradient for positive inputs avoids the saturation that made sigmoids untrainable in deep stacks. The nonlinearity is what prevents the whole network from collapsing into a single linear map."
  - id: convolution
    term: Convolutional Networks
    definition: "Local receptive fields with shared weights, encoding translation invariance and locality directly into the architecture. Parameter sharing cuts the count enormously and constitutes prior knowledge about spatial structure."
  - id: optimization-practice
    term: Optimization in Practice
    definition: "Stochastic gradient descent with minibatches, momentum, and adaptive learning rates. Batch normalization stabilizes layer input distributions; careful initialization keeps activation and gradient scales usable at depth."
  - id: generalization-puzzle
    term: The Generalization Puzzle
    definition: "Networks with far more parameters than training examples generalize well, contradicting classical capacity arguments. Explanations appeal to implicit regularization by SGD, flat minima, and the low effective complexity of the functions actually found."
  - id: rnn-lstm
    term: Recurrent Networks
    definition: "Networks with cycles maintaining a hidden state across a sequence — a learned recursive state estimate. Vanishing and exploding gradients over long spans motivate gating mechanisms such as LSTM and GRU."
  - id: unsupervised-transfer
    term: Unsupervised and Transfer Learning
    definition: "Autoencoders, variational autoencoders, and GANs learn structure without labels. Pretraining on a large corpus then fine-tuning transfers learned representations — which functions as the prior knowledge of Chapter 20, acquired by learning rather than stated."
---

Chapter 22 is the 4th edition's substantial addition, and it is written from the
book's own perspective rather than as a survey of results. The organizing
question is not what deep networks achieve but *why the approach works when it
does* — which makes it more useful than most treatments, because the answers are
framed in terms of the concepts the previous twenty-one chapters established.

## Depth as Efficiency

A **feedforward network** composes layers, each applying a linear transformation
followed by a nonlinear activation:

$$\mathbf{h}^{(l)} = g\!\left(\mathbf{W}^{(l)} \mathbf{h}^{(l-1)} + \mathbf{b}^{(l)}\right)$$

The nonlinearity is essential rather than decorative: without it, a stack of
linear maps is a single linear map and depth buys nothing.

The universal approximation theorem says a single sufficiently wide hidden layer
can approximate any continuous function. The chapter's important qualification is
that this result explains very little. It says nothing about how many units are
needed, whether the parameters can be found by gradient descent, or whether the
result will generalize. **Depth** matters because many functions of practical
interest can be represented by a deep network with exponentially fewer units than
a shallow one requires — a statement about *efficiency of representation*, not
about what is possible in principle.

**ReLU**, $g(z) = \max(0, z)$, replaced the sigmoid for a specific reason: its
gradient is constant for positive inputs, so it does not saturate. Sigmoid units
have near-zero gradient over most of their range, and in a deep stack those
factors multiply toward zero, which is why deep networks were considered
untrainable before this and similar changes.

## Why the Gradient Is Computable

The **computation graph** framing is the chapter's cleanest contribution. Express
the network as a directed graph of primitive operations, and the chain rule
applies mechanically. **Backpropagation** is a reverse traversal: compute the
gradient of the loss with respect to each node's output, then use it to compute
the gradients with respect to that node's inputs and parameters.

The economically decisive fact is that this computes **all** the gradients at a
cost comparable to a single forward pass. Naive per-parameter numerical
differentiation would cost one forward pass *per parameter*, which for a model
with millions of parameters is the difference between feasible and absurd.

Framed properly, backpropagation is **reverse-mode automatic differentiation**,
and this generalization is what modern frameworks implement. It is not specific
to neural networks — any differentiable computation expressible as a graph can be
optimized this way, which is why the same machinery serves probabilistic
programming, physics simulation, and differentiable rendering.

## Architecture as Prior Knowledge

This is the chapter's most valuable idea, and the one that connects Part V back
to Chapter 20.

A fully connected layer on a 1000×1000 image has a billion weights per unit, and
it treats every pixel pair as equally likely to be related — it has no notion
that adjacent pixels are more relevant to each other than distant ones.
**Convolutional networks** encode two assumptions directly into the wiring:
**locality** (a unit sees only a small receptive field) and **translation
invariance** (the same weights are applied at every position, because a feature
worth detecting in one place is worth detecting in another).

<figure>
<svg viewBox="0 0 840 260" role="img" aria-label="A fully connected layer connecting every input to every unit, compared with a convolutional layer where each unit sees a small local window and all units share the same weights.">
  <defs>
    <marker id="arw-aima22-conv" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" class="dgm-fill"/>
    </marker>
  </defs>
  <text x="195" y="26" text-anchor="middle" font-size="12" font-weight="700">FULLY CONNECTED</text>
  <circle cx="80" cy="70" r="7" fill="none" stroke="currentColor" stroke-width="1.3"/>
  <circle cx="137" cy="70" r="7" fill="none" stroke="currentColor" stroke-width="1.3"/>
  <circle cx="194" cy="70" r="7" fill="none" stroke="currentColor" stroke-width="1.3"/>
  <circle cx="251" cy="70" r="7" fill="none" stroke="currentColor" stroke-width="1.3"/>
  <circle cx="308" cy="70" r="7" fill="none" stroke="currentColor" stroke-width="1.3"/>
  <circle cx="137" cy="150" r="9" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <circle cx="251" cy="150" r="9" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <line x1="80" y1="78" x2="133" y2="142" stroke="currentColor" stroke-width="0.8"/>
  <line x1="137" y1="78" x2="137" y2="140" stroke="currentColor" stroke-width="0.8"/>
  <line x1="194" y1="78" x2="142" y2="142" stroke="currentColor" stroke-width="0.8"/>
  <line x1="251" y1="78" x2="145" y2="144" stroke="currentColor" stroke-width="0.8"/>
  <line x1="308" y1="78" x2="147" y2="145" stroke="currentColor" stroke-width="0.8"/>
  <line x1="80" y1="78" x2="243" y2="145" stroke="currentColor" stroke-width="0.8"/>
  <line x1="137" y1="78" x2="245" y2="144" stroke="currentColor" stroke-width="0.8"/>
  <line x1="194" y1="78" x2="248" y2="142" stroke="currentColor" stroke-width="0.8"/>
  <line x1="251" y1="78" x2="251" y2="140" stroke="currentColor" stroke-width="0.8"/>
  <line x1="308" y1="78" x2="256" y2="142" stroke="currentColor" stroke-width="0.8"/>
  <text x="195" y="192" text-anchor="middle" font-size="10.5" class="dgm-muted">every input reaches every unit</text>
  <text x="195" y="212" text-anchor="middle" font-size="10.5" class="dgm-muted">every weight independent</text>
  <text x="195" y="238" text-anchor="middle" font-size="11" font-weight="700">no assumption about structure</text>
  <line x1="420" y1="40" x2="420" y2="244" stroke="currentColor" stroke-width="1" stroke-dasharray="4 4" class="dgm-muted"/>
  <g class="dgm-accent">
    <text x="625" y="26" text-anchor="middle" font-size="12" font-weight="700">CONVOLUTIONAL</text>
  </g>
  <circle cx="510" cy="70" r="7" fill="none" stroke="currentColor" stroke-width="1.3"/>
  <circle cx="567" cy="70" r="7" fill="none" stroke="currentColor" stroke-width="1.3"/>
  <circle cx="624" cy="70" r="7" fill="none" stroke="currentColor" stroke-width="1.3"/>
  <circle cx="681" cy="70" r="7" fill="none" stroke="currentColor" stroke-width="1.3"/>
  <circle cx="738" cy="70" r="7" fill="none" stroke="currentColor" stroke-width="1.3"/>
  <g class="dgm-accent">
    <circle cx="567" cy="150" r="9" class="dgm-soft" stroke="currentColor" stroke-width="1.7"/>
    <circle cx="681" cy="150" r="9" class="dgm-soft" stroke="currentColor" stroke-width="1.7"/>
    <line x1="510" y1="78" x2="561" y2="142" stroke="currentColor" stroke-width="1.6"/>
    <line x1="567" y1="78" x2="567" y2="140" stroke="currentColor" stroke-width="1.6"/>
    <line x1="624" y1="78" x2="573" y2="142" stroke="currentColor" stroke-width="1.6"/>
    <line x1="624" y1="78" x2="675" y2="142" stroke="currentColor" stroke-width="1.6"/>
    <line x1="681" y1="78" x2="681" y2="140" stroke="currentColor" stroke-width="1.6"/>
    <line x1="738" y1="78" x2="687" y2="142" stroke="currentColor" stroke-width="1.6"/>
    <text x="625" y="192" text-anchor="middle" font-size="10.5">each unit sees a local window</text>
    <text x="625" y="212" text-anchor="middle" font-size="10.5">both units share the same weights</text>
    <text x="625" y="238" text-anchor="middle" font-size="11" font-weight="700">locality and translation invariance, built in</text>
  </g>
</svg>
<figcaption><b>The architecture is the prior.</b> Weight sharing is not merely a parameter-count optimization — it is the claim that position does not change what a feature means, asserted in the wiring rather than learned from data.</figcaption>
</figure>

The chapter's framing is exactly right: this is **prior knowledge about the
domain, expressed structurally**. It is Chapter 20's argument that knowledge
reduces sample complexity, applied through architecture rather than through
logical statements. The same reading applies to recurrence (the assumption that
the same update rule applies at every time step) and to attention (the assumption
that relevance between elements should be computed rather than fixed by
position).

**Pooling** provides local invariance and reduces resolution; **residual
connections** allow gradients to skip layers, which is what made very deep
networks trainable.

## Making It Train

The practical section is candid that deep learning is an empirical discipline.
**Stochastic gradient descent** on minibatches is standard, trading gradient
accuracy for far more updates per unit of computation — and the resulting noise
appears to help escape poor regions. **Momentum** accumulates a velocity across
steps; adaptive methods such as **Adam** maintain per-parameter learning rates.

**Initialization** matters because activation and gradient magnitudes compound
across layers: initialize too small and the signal dies, too large and it
explodes. **Batch normalization** stabilizes the distribution of each layer's
inputs, which permits higher learning rates and reduces sensitivity to
initialization. **Gradient clipping** handles exploding gradients, particularly in
recurrent models.

The chapter also observes that the loss surface of a large network is not the
pathological landscape one might fear: most critical points in high dimensions are
saddle points rather than local minima, and the many minima that exist tend to
have similar values — which partially explains why SGD works as well as it does.

## The Generalization Puzzle

The chapter is admirably honest here. Classical learning theory says a model with
more parameters than training examples should overfit catastrophically. Deep
networks routinely have orders of magnitude more parameters than examples and
generalize well. The classical capacity bounds are not merely loose — they are
vacuous in this regime.

Candidate explanations are surveyed rather than asserted. **Implicit
regularization**: SGD does not find an arbitrary minimizer, it finds a particular
one, biased toward simpler functions. **Flat minima**: solutions in wide basins
are less sensitive to perturbation and generalize better than sharp ones.
**Effective capacity**: the functions actually found occupy a far smaller
complexity class than the parameter count suggests.

Explicit regularization remains standard anyway — **dropout**, weight decay, data
augmentation, early stopping. The chapter's willingness to say that the
theoretical account is incomplete is a mark of quality; this remains an open
question.

## Sequences and Structure Without Labels

**Recurrent networks** maintain a hidden state across a sequence, updated at each
step by a shared function. The chapter's framing is the useful one: an RNN is a
**learned recursive state estimate**, the neural counterpart of Chapter 14's
filter, with the transition and sensor models learned rather than specified.

Training by backpropagation through time exposes the vanishing and exploding
gradient problem: gradients multiplied through many steps shrink or grow
geometrically, so long-range dependencies are hard to learn. **LSTM** and **GRU**
gating mechanisms provide paths along which gradients flow with less attenuation,
which is what made sequence learning practical before attention displaced
recurrence entirely in Chapter 25.

**Unsupervised and transfer learning** close the chapter. **Autoencoders**
compress and reconstruct, learning a representation in the bottleneck;
**variational autoencoders** make the latent space a proper probability
distribution, connecting to Chapter 21; **GANs** train a generator against a
discriminator. And **pretraining then fine-tuning** — learn representations from
a large unlabeled corpus, adapt to a specific task with far fewer labels — is the
paradigm that now dominates. The chapter's framing is that pretraining is prior
knowledge *acquired by learning rather than stated by a person*, which is
Chapter 20's thesis arrived at from the opposite direction.

## Why It Matters

Three ideas from this chapter are worth more than the architectures.

Backpropagation as **reverse-mode automatic differentiation** is the enabling
computational fact, and understanding it as a general technique rather than a
neural-network trick is what lets you see where else it applies.

**Architecture as prior knowledge** is the conceptual key. Choosing an
architecture is choosing assumptions about the data's structure, and the right
question when selecting one is what invariance or relational structure you are
asserting — not how many layers to use.

And the **generalization puzzle** is worth carrying as a piece of intellectual
honesty. The most economically consequential technology in the field is not
theoretically well understood, its practitioners know this, and the standard
textbook says so plainly. That is the correct posture, and it is a useful
corrective to claims of understanding made elsewhere.
