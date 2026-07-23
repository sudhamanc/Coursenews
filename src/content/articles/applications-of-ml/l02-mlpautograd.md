---
course: applications-of-ml
lectureId: L02
title: "The Assembly Line of Thought"
deck: "How a straight line becomes a deep network — and how automatic differentiation lets PyTorch learn without a single gradient derived by hand."
order: 2
readingTime: 10
tags: ["mlp", "backpropagation", "autograd", "gradient-descent", "pytorch"]
concepts:
  - id: layer
    term: Layer
    definition: "The atomic building block of a modern architecture: a component that takes in data, performs a computation, and passes on the result. Networks are defined as stacks of layers."
  - id: multilayer-perceptron
    term: Multilayer Perceptron
    definition: "A network built from one or more hidden layers, each pairing a fully connected layer with a nonlinear activation, capable of approximating far more complex functions than a linear model."
  - id: activation-function
    term: Activation Function
    definition: "A nonlinearity such as the sigmoid, ReLU, or softmax inserted after a linear layer; without it, stacking layers would collapse back into a single linear map."
  - id: forward-propagation
    term: Forward Propagation
    definition: "The process of pushing an input through the computational graph, layer by layer, to produce a prediction."
  - id: backpropagation
    term: Backpropagation
    definition: "The reverse pass that applies the chain rule through the computational graph to compute the gradient of the loss with respect to every parameter."
  - id: automatic-differentiation
    term: Automatic Differentiation (Autograd)
    definition: "A framework capability that records every operation in a computational graph and computes exact gradients automatically, freeing the practitioner from deriving them by hand."
  - id: loss-function
    term: Loss Function
    definition: "A scalar measure of how wrong a prediction is — mean squared error, binary cross-entropy, or cross-entropy — whose gradient drives all learning."
  - id: gradient-descent
    term: Gradient Descent
    definition: "The optimization rule that repeatedly moves parameters a small step against the gradient of the loss; variants include SGD and the adaptive Adam optimizer."
---

Ask a modern machine-learning engineer to describe a model and they will not reach for a system of equations. They will describe an *assembly line*. Data enters at one end, passes through a sequence of stations that each transform it a little, and emerges at the other end as a prediction. Every station is a **layer**; the last one hands you the estimate $\hat{y}$. The genius of the arrangement is not any single station but the fact that the entire line can be tuned, end to end, by a process so mechanical that a computer can run it in reverse without ever being told the calculus by hand.

## Everything Is a Layer

A layer takes in data, does some computation, and outputs the result. That is the whole definition, and its flatness is the point. An *input layer* receives the raw features; *fully connected layers* mix them with learned weights; *activation layers* bend them through a nonlinearity. Because every layer speaks the same interface — data in, data out — they snap together like rail cars, and an architecture becomes nothing more than the list of cars in the train.

## From a Line to a Multilayer Perceptron

Start with the humblest model of all. Linear regression is a single fully connected layer: $\mathbf{x} \to \text{FC} \to \hat{y}$. Now bolt a logistic sigmoid activation onto the end and the same skeleton becomes logistic regression, squashing the output into a probability:

$$
\hat{y} = \frac{1}{1 + e^{-\mathbf{x}\cdot\mathbf{w}}}
$$

To capture functions more tangled than a line or a single curve, we add more cars. A typical network carries two sets of fully-connected-plus-activation pairs: the first forms a **hidden layer**, the second the **output layer**. Stack several hidden layers and you have a **multilayer perceptron**.

<figure>
<svg viewBox="0 0 720 350" role="img" aria-label="A multilayer perceptron drawn as three columns of nodes: three inputs fully connected to a hidden layer of four units, then to a single output.">
  <line x1="137" y1="105" x2="343" y2="70" stroke="currentColor" stroke-width="1"/>
  <line x1="137" y1="105" x2="343" y2="140" stroke="currentColor" stroke-width="1"/>
  <line x1="137" y1="105" x2="343" y2="210" stroke="currentColor" stroke-width="1"/>
  <line x1="137" y1="105" x2="343" y2="280" stroke="currentColor" stroke-width="1"/>
  <line x1="137" y1="175" x2="343" y2="70" stroke="currentColor" stroke-width="1"/>
  <line x1="137" y1="175" x2="343" y2="140" stroke="currentColor" stroke-width="1"/>
  <line x1="137" y1="175" x2="343" y2="210" stroke="currentColor" stroke-width="1"/>
  <line x1="137" y1="175" x2="343" y2="280" stroke="currentColor" stroke-width="1"/>
  <line x1="137" y1="245" x2="343" y2="70" stroke="currentColor" stroke-width="1"/>
  <line x1="137" y1="245" x2="343" y2="140" stroke="currentColor" stroke-width="1"/>
  <line x1="137" y1="245" x2="343" y2="210" stroke="currentColor" stroke-width="1"/>
  <line x1="137" y1="245" x2="343" y2="280" stroke="currentColor" stroke-width="1"/>
  <line x1="377" y1="70" x2="583" y2="175" stroke="currentColor" stroke-width="1"/>
  <line x1="377" y1="140" x2="583" y2="175" stroke="currentColor" stroke-width="1"/>
  <line x1="377" y1="210" x2="583" y2="175" stroke="currentColor" stroke-width="1"/>
  <line x1="377" y1="280" x2="583" y2="175" stroke="currentColor" stroke-width="1"/>
  <g class="dgm-accent">
    <circle cx="360" cy="70" r="17" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <circle cx="360" cy="140" r="17" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <circle cx="360" cy="210" r="17" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <circle cx="360" cy="280" r="17" fill="none" stroke="currentColor" stroke-width="1.5"/>
  </g>
  <circle cx="120" cy="105" r="17" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <circle cx="120" cy="175" r="17" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <circle cx="120" cy="245" r="17" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="120" y="110" text-anchor="middle" font-size="12">x₁</text>
  <text x="120" y="180" text-anchor="middle" font-size="12">x₂</text>
  <text x="120" y="250" text-anchor="middle" font-size="12">x₃</text>
  <circle cx="600" cy="175" r="17" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="600" y="180" text-anchor="middle" font-size="13" font-weight="700">ŷ</text>
  <g class="dgm-muted">
    <text x="120" y="330" text-anchor="middle" font-size="12">Input layer</text>
    <text x="360" y="330" text-anchor="middle" font-size="12">Hidden layer</text>
    <text x="600" y="330" text-anchor="middle" font-size="12">Output layer</text>
  </g>
</svg>
<figcaption><b>A multilayer perceptron</b> Inputs feed a fully connected hidden layer (highlighted) whose activations feed the output — stack more hidden layers to deepen the network.</figcaption>
</figure>

With depth come design decisions. The width and final activation of the output layer are dictated by the task — a probability, a class, a real number. The width of a hidden layer is a hyperparameter you tune: larger means more capacity but a greater risk of overfitting; smaller means less capacity but steadier generalization. The hidden activation itself is usually chosen empirically. These are not settings the math hands you; they are choices the practitioner makes.

## The Forward Pass

To make a prediction, you run the line forward. In PyTorch this is disarmingly terse — `yhat = model(x)` — but underneath, the framework has built a **computational graph** from your layers and is pushing $\mathbf{x}$ through it, station by station. This is **forward propagation**: each layer consumes the previous layer's output and produces its own, until the final layer emits $\hat{y}$. The graph is not just bookkeeping; as we are about to see, it is the very structure that makes learning possible.

## Measuring Wrongness

Learning has to start with a number that says how badly the model is doing. That number comes from a **loss function**. Different tasks call for different losses: mean squared error for regression, binary cross-entropy (essentially log loss) for two-class problems, and cross-entropy for multiclass classification. In code the loss is an object you instantiate once and then call on a prediction and a target — `output = loss(yhat, y)` — and the value it returns is the single scalar the entire training process will try to shrink.

## The Chain Rule, Running Backward

Here is the pivot on which all of deep learning turns. The loss $\mathcal{L}$ is a function of the output, which is a function of some intermediate value, which is a function of a parameter. To learn, we need the gradient of the loss with respect to each parameter — and the chain rule gives it to us as a product of local derivatives:

$$
\frac{\partial \mathcal{L}}{\partial \theta}
= \frac{\partial \mathcal{L}}{\partial \hat{y}}\,
  \frac{\partial \hat{y}}{\partial z}\,
  \frac{\partial z}{\partial \theta}
$$

**Backpropagation** is simply this rule applied all the way down a deep graph. Starting from the loss at the output and walking backward, each layer multiplies the gradient arriving from above by its own local derivative and passes the result to the layer below. One backward sweep computes the gradient with respect to *every* parameter in the network, no matter how many layers deep it sits.

<figure>
<svg viewBox="0 0 840 230" role="img" aria-label="A chain from input x through two layers to the prediction and the loss, with forward arrows left to right and backward gradient arrows right to left.">
  <defs>
    <marker id="arw-fwd" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" class="dgm-fill"/>
    </marker>
    <marker id="arw-bwd" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" class="dgm-fill dgm-accent"/>
    </marker>
  </defs>
  <text x="420" y="34" text-anchor="middle" font-size="12" class="dgm-muted">forward propagation →</text>
  <rect x="20" y="78" width="74" height="52" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="57" y="110" text-anchor="middle" font-size="15" font-weight="700">x</text>
  <rect x="140" y="70" width="130" height="68" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="205" y="100" text-anchor="middle" font-size="14" font-weight="700">Layer 1</text>
  <text x="205" y="118" text-anchor="middle" font-size="10" class="dgm-muted">FC + activation</text>
  <rect x="320" y="70" width="130" height="68" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="385" y="100" text-anchor="middle" font-size="14" font-weight="700">Layer 2</text>
  <text x="385" y="118" text-anchor="middle" font-size="10" class="dgm-muted">FC + activation</text>
  <rect x="500" y="78" width="74" height="52" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="537" y="110" text-anchor="middle" font-size="15" font-weight="700">ŷ</text>
  <g class="dgm-accent">
    <rect x="624" y="70" width="150" height="68" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <text x="699" y="100" text-anchor="middle" font-size="14" font-weight="700">Loss</text>
    <text x="699" y="118" text-anchor="middle" font-size="10">L(ŷ, y)</text>
  </g>
  <line x1="94" y1="92" x2="136" y2="92" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-fwd)"/>
  <line x1="270" y1="92" x2="316" y2="92" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-fwd)"/>
  <line x1="450" y1="92" x2="496" y2="92" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-fwd)"/>
  <line x1="574" y1="92" x2="620" y2="92" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-fwd)"/>
  <g class="dgm-accent">
    <line x1="620" y1="116" x2="574" y2="116" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-bwd)"/>
    <line x1="496" y1="116" x2="450" y2="116" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-bwd)"/>
    <line x1="316" y1="116" x2="270" y2="116" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-bwd)"/>
    <line x1="136" y1="116" x2="94" y2="116" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-bwd)"/>
  </g>
  <text x="420" y="196" text-anchor="middle" font-size="12" class="dgm-accent">← backpropagation (gradients)</text>
</svg>
<figcaption><b>Forward and backward</b> The forward pass turns x into a prediction and a loss; backpropagation sends gradients the other way, one local derivative at a time.</figcaption>
</figure>

## Autograd: Calculus Without the Calculus

For a network with millions of parameters, deriving those gradients by hand would be hopeless. This is where **automatic differentiation** earns its keep. As the forward pass runs, PyTorch records each operation into the computational graph along with the recipe for its local derivative. When you call `loss.backward()`, the framework replays that graph in reverse, chaining the local derivatives together exactly as the chain rule prescribes, and deposits a gradient beside every parameter. You wrote only the forward computation; the backward computation was assembled for free.

## Descending the Gradient

Gradients point uphill, toward greater loss, so to improve we step the other way. That is **gradient descent**, captured in one line:

$$
\theta \leftarrow \theta - \eta\,\nabla_{\theta}\mathcal{L}
$$

The learning rate $\eta$ sets the size of each step. Plain stochastic gradient descent (`torch.optim.SGD`) applies this rule directly. More sophisticated optimizers like **Adam** (Adaptive Moments) adjust the step per parameter and help the search slip past saddle points that would stall vanilla SGD. An optimizer needs only the list of parameters to update — `model.parameters()` — and a learning rate.

Put the pieces together and the training loop is startlingly short:

```python
optimizer = torch.optim.SGD(model.parameters(), lr=learning_rate)
for t in range(max_epochs):
    yhat = model(X)          # forward propagation
    loss = loss_fn(yhat, Y)  # measure wrongness
    loss.backward()          # autograd fills in every gradient
    optimizer.step()         # theta <- theta - eta * grad
    optimizer.zero_grad()    # reset accumulated gradients
```

That final `zero_grad()` matters: PyTorch *accumulates* gradients by default, so without a reset each iteration would add to the last one's leftovers and corrupt the update.

<figure>
<svg viewBox="0 0 720 300" role="img" aria-label="The gradient-descent training loop as a cycle: forward pass, compute loss, backpropagate, update parameters, then repeat.">
  <defs>
    <marker id="arw-loop" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" class="dgm-fill"/>
    </marker>
  </defs>
  <rect x="60" y="40" width="180" height="64" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="150" y="68" text-anchor="middle" font-size="13" font-weight="700">Forward pass</text>
  <text x="150" y="88" text-anchor="middle" font-size="10" class="dgm-muted">ŷ = model(x)</text>
  <rect x="480" y="40" width="180" height="64" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="570" y="68" text-anchor="middle" font-size="13" font-weight="700">Compute loss</text>
  <text x="570" y="88" text-anchor="middle" font-size="10" class="dgm-muted">L(ŷ, y)</text>
  <rect x="480" y="196" width="180" height="64" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="570" y="224" text-anchor="middle" font-size="13" font-weight="700">Backpropagate</text>
  <text x="570" y="244" text-anchor="middle" font-size="10" class="dgm-muted">loss.backward()</text>
  <g class="dgm-accent">
    <rect x="60" y="196" width="180" height="64" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <text x="150" y="220" text-anchor="middle" font-size="13" font-weight="700">Update θ</text>
    <text x="150" y="240" text-anchor="middle" font-size="11">θ ← θ - η∇L</text>
  </g>
  <line x1="240" y1="72" x2="476" y2="72" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-loop)"/>
  <line x1="570" y1="104" x2="570" y2="192" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-loop)"/>
  <line x1="476" y1="228" x2="244" y2="228" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-loop)"/>
  <line x1="150" y1="196" x2="150" y2="108" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-loop)"/>
  <text x="360" y="146" text-anchor="middle" font-size="12" class="dgm-muted">repeat every</text>
  <text x="360" y="164" text-anchor="middle" font-size="12" class="dgm-muted">epoch</text>
</svg>
<figcaption><b>The training loop</b> One iteration: run forward, score the loss, backpropagate the gradients, then step the parameters downhill — repeated until the loss stops falling.</figcaption>
</figure>

## Why It Matters

The multilayer perceptron is the plainest deep network there is, but it already contains the whole grammar of the field. Layers compose into a graph; a forward pass turns inputs into predictions; a loss scores them; backpropagation runs the chain rule in reverse to find the gradients; and gradient descent nudges the parameters downhill. Everything more glamorous — convolutional networks, transformers, diffusion models — is a richer choice of layers bolted onto this exact skeleton. Learn to read the assembly line, and you can read them all.
