---
course: ai-foundations
lectureId: W9
title: "The Function Nobody Wrote: Inductive Learning, Neurons, and Features You Did Not Design"
deck: "Every method in this course so far was handed a model and asked to compute with it. Learning inverts the arrangement: you are handed examples of a function's behaviour and asked to recover the function. The surprise is not that neural networks can fit such a function — it is that, past a certain depth, they stop needing you to tell them what to look at."
order: 9
readingTime: 24
tags: ["machine-learning", "inductive-learning", "neural-networks", "backpropagation", "gradient-descent", "deep-learning", "autoencoders", "curse-of-dimensionality"]
concepts:
  - id: machine-learning
    term: Machine Learning
    definition: "The study of algorithms that improve automatically through experience. Stated operationally, a program learns if its performance at task T, measured by P, improves with experience E — which forces all three to be named before any claim of learning can be checked."
  - id: inductive-learning
    term: Inductive Learning
    definition: "Inferring a general rule from specific examples. Given pairs ⟨x, f(x)⟩ drawn from an unknown target function f, find a hypothesis h such that h ≈ f — not only on the examples seen, but on the ones that have not arrived yet."
  - id: hypothesis-consistency
    term: Consistency
    definition: "A hypothesis is consistent if it agrees with the target function on every training example. Consistency is cheap and not the goal: infinitely many consistent hypotheses exist for any finite sample, and most of them generalize badly."
  - id: supervised-learning
    term: Supervised Learning
    definition: "Learning from examples whose correct answers are supplied, as in handwriting recognition or image classification. The label is what makes the error signal computable, and labels are the scarce resource."
  - id: unsupervised-learning
    term: Unsupervised Learning
    definition: "Learning structure from data with no answers attached — clustering observations into classes nobody named. It matters because almost all available data is unlabelled."
  - id: hebbian-learning
    term: Hebbian Learning
    definition: "If input neuron xᵢ repeatedly fires output neuron y, the synapse between them strengthens: wᵢ ← wᵢ + η·xᵢ·y. A local rule that needs no global error signal, and the ancestor of most weight-update rules since."
  - id: artificial-neuron
    term: Artificial Neuron
    definition: "A unit that multiplies each input by a weight, sums the products with a bias term, and passes the result through an activation function. Dendrites become the weights, the soma becomes the sum, the axon becomes the activation threshold."
  - id: activation-function
    term: Activation Function
    definition: "The nonlinearity applied to a unit's weighted sum. A step function fires above a threshold; the sigmoid 1/(1 + e⁻ˣ) smooths it so it can be differentiated; ReLU, max(0, x), is the simplest nonlinearity that works and is now the default."
  - id: bias-weight
    term: Bias Weight
    definition: "A constant input to a unit whose weight shifts the activation threshold left or right. Changing one bias is the whole difference between a unit that computes AND and the same unit computing OR."
  - id: perceptron-limit
    term: Linear Separability
    definition: "A single unit can only split its input space with a straight boundary, and so can a network of any depth whose activations are all linear. Nonlinear activations are what buy complex boundaries while leaving the data itself untouched."
  - id: backpropagation
    term: Backpropagation
    definition: "Training a multilayer network by running examples forward, measuring the error at the output, then using the chain rule to attribute that error to every weight at every layer and nudging each one against its share of the gradient."
  - id: gradient-descent
    term: Gradient Descent
    definition: "Minimize an error function J by repeatedly stepping opposite to its gradient — the gradient points uphill, so the negative gradient points down. Stochastic gradient descent takes one such step per training example rather than per full pass."
  - id: curse-of-dimensionality
    term: Curse of Dimensionality
    definition: "Covering a space to a fixed resolution costs a number of samples exponential in the number of dimensions: 10 samples in one dimension, 100 in two, 10^D in D. Real data therefore sits sparsely in its space, with every instance far from every other."
  - id: representation-learning
    term: Representation Learning
    definition: "Letting the model discover useful features instead of hand-designing them. Handcrafted features are expensive, usually both over-specified and incomplete, and have to be rebuilt for every new task and domain."
  - id: deep-learning
    term: Deep Learning
    definition: "Learning multiple levels of representation of increasing abstraction, where early layers find first-order features such as edges and later layers compose them into higher-order ones, with a supervised layer on top."
  - id: vanishing-gradient
    term: Diffusion of Gradient
    definition: "The error signal attenuates as it propagates back through a deep network, so early layers train slowly or not at all. It is made worse by the top layers solving the task passably on their own, which shrinks the error reaching the bottom before the bottom has learned anything."
  - id: greedy-layerwise-pretraining
    term: Greedy Layer-Wise Pre-Training
    definition: "Train the first layer unsupervised, freeze it, train the second on its outputs, and so on; then attach a supervised layer and finally unfreeze everything for fine-tuning. It gave early layers a reason to learn and let abundant unlabelled data do the work."
  - id: autoencoder
    term: Autoencoder
    definition: "A network trained to reproduce its own input through a bottleneck narrower than the input. Because the middle layer is too small to copy, it must keep whatever is most informative — which is what makes the encoder a feature extractor."
---

Every technique in this course so far has been handed its world. Search was given a
successor function; adversarial search was given the rules of the game; a constraint
problem arrived with its constraints written down; and an MDP, even an uncomfortable one,
came with a transition model and a reward function. The previous feature loosened exactly
one bolt — it took away $T$ and $R$ and made the agent discover them by acting.

This feature loosens the bolt all the way. There is a function. You do not know what it
is, you do not know how to compute it, and nobody is going to tell you. What you have is a
pile of examples of what it did. The task is to recover something close enough to it that
it keeps working on inputs you have never seen.

**Sources:** AIMA Chapter 18 (Sections 18.1–18.3, 18.7)

## 1. What "learning" is allowed to mean

The working definition is deliberately plain: machine learning is **the study of computer
algorithms that improve automatically through experience**. Stated carefully enough to
argue with, a program learns if it

- improves at task **T**,
- with respect to performance measure **P**,
- based on experience **E**.

Learning to play backgammon makes the triple concrete. $T$ is playing backgammon; $P$ is
the number of games won; $E$ is data about previously played games.

The reason to insist on all three is that a claim of learning is unfalsifiable without
them. "The system learns" says nothing; "win rate against a fixed opponent improves as
games are added to its training set" can be checked, and can fail. Keep the triple in
hand — most arguments about whether some system "really" learns turn out to be arguments
about an unstated $P$.

Several distinct things are then called learning:

| Family | What the examples look like | Typical task |
|---|---|---|
| **Supervised learning** | inputs with correct answers attached | recognize handwriting, classify images |
| **Unsupervised learning** | inputs with nothing attached | cluster observations into meaningful classes |
| **Reinforcement learning** | actions, states and rewards over time | the whole of the previous feature |
| **Learning from observation** | demonstrations by another agent | imitate a task a human can already do |

The third is already familiar. This feature is about the first, with the fourth and the
unlabelled data of the second returning at the end — because they turn out to be where the
hardest problem in deep learning was eventually solved.

## 2. Inductive learning: recovering a function from its behaviour

Strip the task to its simplest honest form.

- **Desired:** a target function $f$ that we want to learn. We do not know what it is or
  how to compute it.
- **Given:** examples, where an example is a pair $\langle x, f(x) \rangle$.
- **Problem:** find a hypothesis $h$ such that $h \approx f$.

This is **induction** — inferring the general from the specific — and unlike the deduction
that drove search and constraint propagation, it is not truth-preserving. No finite set of
examples entails a unique $f$.

The canonical picture is curve fitting. Plot the examples as points. Then draw a curve
through them: a straight line through two points; a parabola when a third arrives off the
line; a higher-order polynomial as more points appear; eventually a curve that visits every
single point exactly.

A hypothesis is **consistent** if it agrees with $f$ on all training examples. Note what
the curve-fitting sequence demonstrates: the wiggliest curve is the *most* consistent one,
and it is usually the worst. Consistency is free — a sufficiently flexible hypothesis class
can always achieve it — so consistency cannot be the objective. What you actually want is
performance on the examples that have not arrived yet, and nothing in the training set
tells you directly how to get it.

This is the whole of the bias–variance problem in one drawing, and every method in the rest
of this feature is a particular answer to it. A linear model answers it by assuming the
target is smooth. A kernel method answers it by assuming similar inputs have similar
outputs, with similarity fixed in advance. A neural network answers it by **learning the
similarity measure itself** — which is why the rest of the feature is about neural
networks.

## 3. The biological argument, and how far it goes

Neural networks arrived carrying a specific conviction: that reproducing intelligence
would require modelling the **architecture** of the brain, in contrast to the encoded
symbolic knowledge that expert systems represented at their best. The alternative programme
won funding for decades on the strength of that intuition alone.

The brain's raw numbers are worth having, if only for scale:

| Quantity | Order of magnitude |
|---|---|
| Neurons | $10^{11}$, in more than 20 types |
| Synapses | $10^{14}$ |
| Cycle time | 1–10 ms |
| Signal | noisy "spike trains" of electrical potential |

One more fact does real work in the argument. **Neural plasticity** — the change in the
brain's structure that represents new knowledge — has to be explained somehow, and the
number of neurons is relatively stable from roughly age 5 to age 60. If learning does not
add neurons, learning must be a change in the **strength of connections** between the
neurons already present. That is the licence for a model in which the only thing that ever
changes is a set of weights.

A single biological neuron then maps onto a computation with suspicious neatness:

- **Dendrites** act as the input vector, collecting from more than a thousand neighbouring
  neurons, and are able to perform something like multiplication by a weight.
- The **soma** acts as a summation function, aggregating excitatory ($+$) and inhibitory
  ($-$) signals.
- The **axon** samples the soma's electric potential and, if it is above a threshold, sends
  a pulse onward.

Donald Hebb supplied the learning rule to go with it: if neuron $x_i$ repeatedly triggers
neuron $y$, the synaptic knob connecting them grows. In a mathematical model,

$$w_i \leftarrow w_i + \eta \, x_i \, y,$$

where $\eta$ is a learning rate. Notice what this rule does *not* require: no target, no
error, no global signal. It is entirely local to two cells, and it remains the skeleton of
most weight-update rules in use.

What survives into practice is a short list of architectural characteristics — many simple
processing elements, many connections, simple messages, adaptive interaction — and that is
genuinely all that survives. The units below are not models of neurons in any sense a
neuroscientist would accept, and nothing in what follows depends on them being so. The
biology motivated the design; it does not justify it.

## 4. One unit, in full

An artificial neuron takes inputs — from the outside world or from other units — along
**weighted connections** corresponding to synaptic efficiency, applies a **threshold**, and
passes the weighted sum through an **activation function** to produce its output.

The simplest version has binary inputs and output, and a rule you can evaluate by hand:

$$\text{output} = \begin{cases} 1 & \text{if } w_0 I_0 + w_1 I_1 + w_b > 0 \\ 0 & \text{if } w_0 I_0 + w_1 I_1 + w_b \le 0 \end{cases}$$

<figure>
<svg viewBox="0 0 700 300" role="img" aria-label="Diagram of a single artificial neuron. Three input values 2.7, minus 8.6 and 0.002 enter on the left along arrows labelled with weights minus 0.06, minus 2.5 and 1.4. The arrows converge on a summation node labelled sigma, whose output 21.34 passes into a sigmoid activation node, which outputs approximately 1. A note beneath records that the sigmoid derivative at this point is about 5 times ten to the minus ten.">
  <defs>
    <marker id="arw-w9-neuron" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" class="dgm-fill"/>
    </marker>
  </defs>
  <text x="56" y="76" text-anchor="middle" font-size="15" font-weight="700">2.7</text>
  <text x="56" y="156" text-anchor="middle" font-size="15" font-weight="700">−8.6</text>
  <text x="56" y="236" text-anchor="middle" font-size="15" font-weight="700">0.002</text>
  <text x="56" y="44" text-anchor="middle" font-size="11" font-style="italic">inputs</text>
  <path d="M86,72 L292,140" fill="none" stroke="currentColor" stroke-width="1.6" marker-end="url(#arw-w9-neuron)"/>
  <path d="M90,152 L292,152" fill="none" stroke="currentColor" stroke-width="1.6" marker-end="url(#arw-w9-neuron)"/>
  <path d="M90,232 L292,164" fill="none" stroke="currentColor" stroke-width="1.6" marker-end="url(#arw-w9-neuron)"/>
  <g class="dgm-accent">
    <text x="172" y="92" text-anchor="middle" font-size="13" font-weight="700">−0.06</text>
    <text x="172" y="143" text-anchor="middle" font-size="13" font-weight="700">−2.5</text>
    <text x="172" y="216" text-anchor="middle" font-size="13" font-weight="700">1.4</text>
  </g>
  <text x="172" y="44" text-anchor="middle" font-size="11" font-style="italic">weights</text>
  <circle cx="330" cy="152" r="38" fill="none" stroke="currentColor" stroke-width="2"/>
  <text x="330" y="160" text-anchor="middle" font-size="22" font-weight="700">Σ</text>
  <text x="330" y="82" text-anchor="middle" font-size="11" font-style="italic">soma: sum</text>
  <path d="M370,152 L452,152" fill="none" stroke="currentColor" stroke-width="1.6" marker-end="url(#arw-w9-neuron)"/>
  <text x="411" y="142" text-anchor="middle" font-size="13" font-weight="700">21.34</text>
  <rect x="456" y="114" width="92" height="76" rx="8" fill="none" stroke="currentColor" stroke-width="2"/>
  <path d="M468,176 C492,176 496,128 536,128" fill="none" stroke="currentColor" stroke-width="2" class="dgm-accent"/>
  <text x="502" y="82" text-anchor="middle" font-size="11" font-style="italic">axon: activation</text>
  <path d="M552,152 L628,152" fill="none" stroke="currentColor" stroke-width="1.6" marker-end="url(#arw-w9-neuron)"/>
  <g class="dgm-accent">
    <text x="652" y="146" text-anchor="middle" font-size="15" font-weight="700">≈ 1</text>
  </g>
  <text x="652" y="166" text-anchor="middle" font-size="11" font-style="italic">output</text>
  <text x="350" y="272" text-anchor="middle" font-size="12">σ′(21.34) ≈ 5 × 10⁻¹⁰ — saturated, and therefore almost untrainable</text>
</svg>
<figcaption><b>One unit, with the lecture's own numbers.</b> The weighted sum is dominated by a single large product, and the sigmoid has long since flattened by the time it arrives. The output is correct and the gradient is gone — the same arithmetic that makes the unit work is what makes a deep stack of them hard to train, as §9 returns to.</figcaption>
</figure>

Two activation functions matter at this stage. A **step** or **threshold** function outputs
0 below its threshold and 1 above it. A **sigmoid**

$$f(x) = \frac{1}{1 + e^{-x}}$$

does the same thing smoothly, and changing the bias weight $w_b$ slides the threshold
location left or right. The resemblance to **logistic regression** is not a coincidence:
a single sigmoid unit *is* logistic regression, and a network is what you get by stacking
them and training the stack end to end.

Work the lecture's example through, because the numbers are instructive. Weights
$(-0.06, -2.5, 1.4)$, inputs $(2.7, -8.6, 0.002)$:

$$x = (-0.06 \times 2.7) + (-2.5 \times -8.6) + (1.4 \times 0.002) = -0.162 + 21.5 + 0.0028 = 21.34.$$

Then $f(21.34) = 1/(1 + e^{-21.34}) \approx 0.9999999995$.

Two things are worth extracting from that. First, one input dominated completely: the
middle product contributed $21.5$ of the total while the third contributed $0.0028$. A
unit's output is frequently decided by one or two of its inputs, and reading a weight
vector as though every entry mattered equally is a mistake. Second, the sigmoid is
**saturated**. Its derivative is $f(x)(1 - f(x)) \approx 5 \times 10^{-10}$, so an error
signal arriving at this unit would be multiplied by essentially zero. Hold onto that; it
is the obstacle that kept deep networks impractical for twenty years.

## 5. The same unit computes AND or OR, depending on one number

Take a unit with two binary inputs, both weights equal to 1, and a bias of $-1.5$. Compute
all four cases:

| $I_0$ | $I_1$ | Sum | Output |
|---|---|---|---|
| 0 | 0 | $0 + 0 - 1.5 = -1.5$ | 0 |
| 0 | 1 | $0 + 1 - 1.5 = -0.5$ | 0 |
| 1 | 1 | $1 + 1 - 1.5 = 0.5$ | **1** |
| 1 | 0 | $1 + 0 - 1.5 = -0.5$ | 0 |

The unit outputs 1 exactly when both inputs are 1. It is a **logical AND** — not
approximately, exactly.

Now change nothing except the bias, from $-1.5$ to $-0.5$:

| $I_0$ | $I_1$ | Sum | Output |
|---|---|---|---|
| 0 | 0 | $-0.5$ | 0 |
| 0 | 1 | $0.5$ | **1** |
| 1 | 1 | $1.5$ | **1** |
| 1 | 0 | $0.5$ | **1** |

Outputs $0, 1, 1, 1$: a **logical OR**.

This small exercise carries more than it looks. The unit did not change; its "program" is
one number, and that number was learnable in principle by Hebb's rule. Threshold logic
means a network of these units can implement arbitrary Boolean circuits, which is the
original argument that neural networks are a universal computational substrate rather than
a curve-fitting trick.

It also sets up the famous limitation. Each table above is separated by a straight line
drawn across the unit square. **XOR** is not — no line separates $\{(0,1),(1,0)\}$ from
$\{(0,0),(1,1)\}$ — and so no single unit computes it, at any choice of weights and bias.
That observation, published by Minsky and Papert in 1969, is substantially responsible for
the first collapse of funding for neural networks. The escape is layers, and layers only
help under a condition that §8 makes precise.

## 6. Training a multilayer network

Stack units into layers and you have a **multilayer perceptron**. The procedure for
training one is short to state:

- Start with a set of known examples — this is a supervised approach.
- Assign **random initial weights**.
- Run examples through and calculate the **mean-squared error**.
- **Propagate the error** backwards, making small changes to the weights at each level,
  using the **chain rule** to compute the gradient efficiently.
- Lather, rinse, repeat.

The engine underneath is **gradient descent**. Let $J(\theta_0, \theta_1)$ be a function
representing the error, and seek $\min_{\theta_0, \theta_1} J(\theta_0, \theta_1)$. The
outline is: start somewhere; keep changing the parameters so as to reduce $J$; hope to
arrive at a minimum.

The gradient $\nabla J$ at a point can be read as a vector pointing **uphill**. If $J$ is
an error, we want to go downhill, so we step **opposite** to the gradient:

$$\theta_j \leftarrow \theta_j - \eta \frac{\partial J}{\partial \theta_j}.$$

**Stochastic gradient descent** updates after every single training example rather than
after a full pass over the data. The gradient it uses is noisier, each step is far cheaper,
and the noise itself helps escape shallow local minima — which is why the stochastic
version is the one everybody actually runs.

It is worth seeing the loop with real numbers. Take a dataset of three fields and a binary
class:

| Field 1 | Field 2 | Field 3 | Class |
|---|---|---|---|
| 1.4 | 2.7 | 1.9 | 0 |
| 3.8 | 3.4 | 3.2 | 0 |
| 6.4 | 2.8 | 1.7 | 1 |
| 4.1 | 0.1 | 0.2 | 0 |

Initialize with random weights, then:

1. **Present a training pattern**: $(1.4, 2.7, 1.9)$.
2. **Feed it through** to get an output: $0.8$.
3. **Compare with the target**, which is $0$. The error is $0.8$.
4. **Adjust the weights** based on that error.
5. **Present the next pattern**: $(6.4, 2.8, 1.7)$.
6. Output $0.9$ against a target of $1$. The error is now $-0.1$.
7. Adjust again, and continue.

Repeat this thousands, maybe millions of times, each time taking a random training instance
and making slight weight adjustments. The algorithms for weight adjustment are designed so
that the changes reduce the error.

```python
def train_epoch(net, data, lr=0.01):
    for x, target in shuffled(data):
        output = net.forward(x)           # 2. feed forward
        error = output - target           # 3. compare with target
        grads = net.backward(error)       # chain rule, output layer back to input
        for p, g in zip(net.params, grads):
            p -= lr * g                   # 4. step against the gradient
    return net
```

Note the sign conventions in step 6: the second error is **negative**, because the output
undershot the target. The error is a signed quantity and its sign is what tells each weight
which way to move. An implementation that squares or absolutes it too early destroys
exactly the information the update needs.

## 7. Watching the boundary move

There is a second way to look at the same process, and it is the one worth carrying away.

Instead of tracking weights, draw the **decision boundary** the network currently
implements. At initialization, with random weights, the boundary sits in an arbitrary place
and cuts the data nonsensically. Present a training instance and adjust: the boundary
shifts a little. Present another: it shifts again. Repeated enough times, the boundary
settles into a shape that separates the classes.

Training is not the network memorizing examples. It is a surface in input space being
pushed around by examples until it stops being pushed hard in any direction. That reframing
explains several otherwise puzzling behaviours at once — why order matters, why a
late-arriving outlier can wreck a converged model, and why "it fits the training data"
tells you about the boundary's position on four points and nothing about its shape
elsewhere.

## 8. Why the nonlinearity is not optional

Now the condition promised in §5. Two statements, and the gap between them is the entire
reason activation functions exist:

- If $f(x)$ is **linear**, the network can only draw **straight** decision boundaries —
  *even if there are many layers of units*.
- Neural networks use **nonlinear** $f(x)$ so they can draw complex boundaries, while
  keeping the data itself unchanged.

The first claim is the one people find surprising, and it is a one-line proof: a
composition of linear maps is a linear map. Stack fifty linear layers and you have an
expensive way to compute a single matrix product. Depth buys nothing at all without a
nonlinearity between the layers — a fact that makes the choice of activation function
structural rather than cosmetic.

The second clause matters just as much and gets less attention. Kernel methods also produce
curved boundaries, but they do it by **transforming the data** into a space where a linear
boundary suffices. A neural network leaves the input alone and bends the boundary instead.
That is what allows the learned representation to be inspected, reused for other tasks, and
stacked — none of which a kernel's implicit feature space permits.

Which nonlinearity? The current default is **ReLU** — Rectified Linear Units,

$$f(x) = \max(0, x),$$

which is, as the lecture puts it, literally the simplest nonlinear function you can think
of. It is not smooth, it is not bounded, it is not biologically motivated, and it discards
half its input range. It wins because its gradient is exactly 1 wherever the unit is active,
so error signals pass through undiminished — directly addressing the saturation seen in
§4. A great deal of theory about which activation functions *ought* to work was quietly
retired by a function with a kink at the origin.

## 9. The curse of dimensionality

Before deep learning can be motivated, the problem it exists to address has to be sized
properly.

Suppose a single feature, discrete, with range $[0, 9]$. To have a sample at every possible
location you need **10 samples**. Complete coverage, no difficulty.

Add a second feature. The same coverage now requires $10^2 = 100$ samples. In general, $D$
features need $10^D$.

Real data makes that fatal. Classifying an image treats each pixel as a feature, so $D$ is
in the **millions**, and complete coverage would require $10^{\text{millions}}$ samples —
not expensive, *impossible*.

| Dimensions $D$ | Samples for full coverage |
|---|---|
| 1 | $10$ |
| 2 | $100$ |
| 3 | $1{,}000$ |
| 10 | $10^{10}$ |
| $10^6$ (a small image) | $10^{1{,}000{,}000}$ |

This is the **curse of dimensionality**: in higher-dimensional spaces you need
exponentially more samples for equivalent coverage. The consequences are concrete and
unpleasant. Any real dataset covers its space **sparsely**, and every instance is **far
apart** from every other. Methods that generalize **locally** — nearest neighbours above
all — require representative examples for all relevant variations, and in high dimensions
there is no such thing as a nearby example to generalize from.

The classical escapes are all forms of assuming your way out of the problem:

- **Manual feature design** — reduce $D$ by hand, using knowledge of the domain.
- **Assume a smooth target function**, as linear models do, so that distant points still
  constrain each other.
- **Kernel methods**, linear in terms of a kernel defined over data points, where the
  kernel encodes which inputs count as similar.

Dimensionality reduction belongs on the same list, with one caveat the lecture is careful
about: going from higher-dimensional data to lower is only useful if done **intelligently**,
without losing information that mattered.

And here is the sentence that sets up everything remaining: **neural networks parameterize
and learn a "similarity" kernel**. Rather than being told which inputs resemble each other,
they derive it from the data. The assumption does not disappear — it becomes a learned
object rather than a declared one.

## 10. Deep learning as a reply to feature engineering

The honest description of classical machine learning is uncomfortable. It works well
**because of human-designed representations and input features**. Given good features,
learning reduces to optimizing weights to best make a final prediction — the hard,
knowledge-intensive part having already been done by a person.

The case against that arrangement is practical:

- Handcrafting features is **time-consuming**.
- The features are usually **both over-specified and incomplete** — they encode
  distinctions that do not matter while missing ones that do.
- The work must be **redone for every task and every domain**.

**Representation learning** attempts to learn good features automatically.
**Deep learning** is the version of that idea which learns **multiple levels** of
representation, of increasing complexity and abstraction. The argument for it is short:
humans develop representations in order to learn and reason, so our computers should do the
same.

Mechanically, deep learning means training networks with **many** layers, as against
shallow nets of a couple, and letting the layers build an improved feature space:

- The first layer learns **first-order features** — edges, for instance.
- The second learns **higher-order features**: combinations of first-layer features,
  combinations of edges.
- Successive layers learn successively deeper representations.
- The **final layer's** features are fed into supervised layers.
- The **entire network** is then typically fine-tuned by supervised training end to end,
  starting from the weights already learned.

The results that made the case were concentrated on large datasets: object recognition
better than anything else available, speech recognition good enough to ship in Google voice
search, and most other perceptual tasks in vision and natural language.

## 11. The problem that nearly stopped it, and the trick that did not last

Deep networks did not work when people first tried the obvious thing. The reasons are
specific and worth knowing, because each one explains a piece of modern practice.

- **Early layers of an MLP do not get trained well.** The error signal **attenuates as it
  propagates** back towards the input — the **diffusion of gradient** problem, which §4
  showed arithmetically for a single saturated sigmoid. Multiply several such factors
  together and nothing survives the trip.
- Training is therefore **very slow**.
- It is **made worse by the top layers succeeding**. The top couple of layers can usually
  learn any task "pretty well" on their own, so the error drops quickly — and the error
  reaching the lower layers drops with it. The lower layers never get the opportunity to
  use their capacity; they settle for being a **random feature map**.
- There is **often not enough labelled data**, while unlabelled data is abundant.
- Deep networks suffer **more local-minima problems** than shallow ones during supervised
  training.

The third point is the subtle one and the most useful to internalize. The failure was not
that the gradient was weak in some abstract sense; it was that the network found a way to
be *adequate* before its early layers had learned anything, and adequacy removes the
pressure to improve. A system that optimizes a single global objective can starve its own
components.

The breakthrough was **unsupervised pre-training**, and the procedure was **greedy
layer-wise training**:

1. Train the first layer on your data **without labels**. There are no targets at this
   level, so labels do not help — which means the more abundant unlabelled data not in the
   training set can be used instead. This is **self-taught learning**.
2. **Freeze** the first layer's parameters and train the second layer, using the output of
   the first as its unsupervised input.
3. **Repeat** for as many layers as desired. This builds the set of robust features.
4. Use the final layer's outputs as inputs to a **supervised** layer or model, and train
   those last supervised layers with the early weights still frozen.
5. **Unfreeze everything** and fine-tune the full network with supervised training, starting
   from the pre-trained weights.

Each non-output layer is trained to be an **autoencoder**: forced to learn good features
that describe what came from the previous layer.

<figure>
<svg viewBox="0 0 700 300" role="img" aria-label="Diagram of an autoencoder. Five input nodes labelled X1 to X5 on the left connect through weights W to a narrow bottleneck of two hidden nodes in the middle, which then connect through the transpose of W to five output nodes on the right labelled x1-hat to x5-hat. The left half is labelled encoder and the right half decoder, the bottleneck is annotated as much smaller than the input dimension, and a bracket beneath indicates that the reconstruction is compared against the original input.">
  <defs>
    <marker id="arw-w9-ae" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" class="dgm-fill"/>
    </marker>
  </defs>
  <g font-size="12">
    <circle cx="96" cy="56" r="15" fill="none" stroke="currentColor" stroke-width="1.6"/><text x="96" y="61" text-anchor="middle">X₁</text>
    <circle cx="96" cy="104" r="15" fill="none" stroke="currentColor" stroke-width="1.6"/><text x="96" y="109" text-anchor="middle">X₂</text>
    <circle cx="96" cy="152" r="15" fill="none" stroke="currentColor" stroke-width="1.6"/><text x="96" y="157" text-anchor="middle">X₃</text>
    <circle cx="96" cy="200" r="15" fill="none" stroke="currentColor" stroke-width="1.6"/><text x="96" y="205" text-anchor="middle">X₄</text>
    <circle cx="96" cy="248" r="15" fill="none" stroke="currentColor" stroke-width="1.6"/><text x="96" y="253" text-anchor="middle">X₅</text>
  </g>
  <g class="dgm-accent">
    <circle cx="350" cy="128" r="16" fill="none" stroke="currentColor" stroke-width="2"/>
    <circle cx="350" cy="176" r="16" fill="none" stroke="currentColor" stroke-width="2"/>
  </g>
  <g font-size="12">
    <circle cx="604" cy="56" r="15" fill="none" stroke="currentColor" stroke-width="1.6"/><text x="604" y="61" text-anchor="middle">x̂₁</text>
    <circle cx="604" cy="104" r="15" fill="none" stroke="currentColor" stroke-width="1.6"/><text x="604" y="109" text-anchor="middle">x̂₂</text>
    <circle cx="604" cy="152" r="15" fill="none" stroke="currentColor" stroke-width="1.6"/><text x="604" y="157" text-anchor="middle">x̂₃</text>
    <circle cx="604" cy="200" r="15" fill="none" stroke="currentColor" stroke-width="1.6"/><text x="604" y="205" text-anchor="middle">x̂₄</text>
    <circle cx="604" cy="248" r="15" fill="none" stroke="currentColor" stroke-width="1.6"/><text x="604" y="253" text-anchor="middle">x̂₅</text>
  </g>
  <g stroke="currentColor" stroke-width="0.9" opacity="0.5" fill="none">
    <path d="M112,56 L334,124"/><path d="M112,104 L334,124"/><path d="M112,152 L334,126"/><path d="M112,200 L334,130"/><path d="M112,248 L334,134"/>
    <path d="M112,56 L334,170"/><path d="M112,104 L334,172"/><path d="M112,152 L334,176"/><path d="M112,200 L334,178"/><path d="M112,248 L334,180"/>
    <path d="M366,124 L588,56"/><path d="M366,124 L588,104"/><path d="M366,126 L588,152"/><path d="M366,130 L588,200"/><path d="M366,134 L588,248"/>
    <path d="M366,170 L588,56"/><path d="M366,172 L588,104"/><path d="M366,176 L588,152"/><path d="M366,178 L588,200"/><path d="M366,180 L588,248"/>
  </g>
  <text x="216" y="26" text-anchor="middle" font-size="12" font-weight="700">encoder — W</text>
  <text x="488" y="26" text-anchor="middle" font-size="12" font-weight="700">decoder — Wᵀ</text>
  <g class="dgm-accent">
    <text x="350" y="222" text-anchor="middle" font-size="11" font-weight="700">≪ dim</text>
  </g>
  <path d="M96,278 L604,278" fill="none" stroke="currentColor" stroke-width="1.4" opacity="0.6" marker-start="url(#arw-w9-ae)" marker-end="url(#arw-w9-ae)"/>
  <text x="350" y="294" text-anchor="middle" font-size="12">loss compares x̂ against the original x — no labels anywhere</text>
</svg>
<figcaption><b>The autoencoder's bottleneck is the whole mechanism.</b> Reconstructing the input would be trivial if the middle layer were wide enough to copy it. Making it narrower than the input forces a choice about what to keep, and that forced choice is the feature extractor. The decoder is discarded afterwards.</figcaption>
</figure>

The autoencoder is worth stating cleanly because it is the cleverest idea in the lecture. It
is a network whose target output **is its own input**, passed through a hidden layer whose
dimension is much smaller than the input's. Encoder on the way in, decoder on the way out,
with the decoder's weights often simply $W^\top$ — the encoder's, transposed. The loss
compares the reconstruction with the original.

Since the target is the input, **no labels are required anywhere**, which is what let
unlabelled data train the early layers. And since the bottleneck is too narrow to pass the
input through unchanged, the layer has no option but to keep whatever is most informative.
Supervision was manufactured out of the data's own structure — the same move that later
produced word embeddings, masked language modelling, and essentially all modern
pre-training.

One honest postscript. Greedy layer-wise pre-training mattered enormously around 2006–2012
and is **largely not used today**. ReLU activations, better initialization schemes, batch
normalization, residual connections and far more data made it possible to train deep
networks end to end from random weights. The specific trick was superseded; the idea behind
it — learn representations from unlabelled data, then adapt to the labelled task — became
the dominant paradigm in the field. It is worth separating the two, because a reader who
learns only the trick will think this section is history, and a reader who learns only the
idea will not know why anyone ever froze a layer.

Where this ends up, if you follow it a few years further: **generative adversarial
networks**, where a network trained to produce data competes with one trained to detect
fakes, and the familiar demonstration is a website serving endless photographs of people
who do not exist. The arithmetic that produces them is the arithmetic in §4.

## Terms defined in one place

| Term | Definition |
|---|---|
| **Machine learning** | Algorithms that improve automatically through experience |
| **T, P, E** | Task, performance measure, experience — all three needed to make a learning claim checkable |
| **Inductive learning** | Infer general concepts from specific examples |
| **Target function $f$** | The unknown function the examples were generated by |
| **Hypothesis $h$** | The candidate function the learner constructs; the goal is $h \approx f$ |
| **Consistent** | Agrees with $f$ on every training example — necessary, far from sufficient |
| **Supervised learning** | Learning from examples with correct answers attached |
| **Unsupervised learning** | Finding structure in data with no answers attached |
| **Hebbian learning** | $w_i \leftarrow w_i + \eta x_i y$; strengthen a connection that fires together |
| **Neural plasticity** | Learning as change in connection strength, not neuron count |
| **Artificial neuron** | Weighted sum of inputs plus a bias, through an activation function |
| **Bias weight $w_b$** | Shifts the activation threshold; one number separates AND from OR |
| **Step function** | Outputs 0 or 1 according to a threshold |
| **Sigmoid** | $1/(1 + e^{-x})$; a differentiable step, and exactly logistic regression |
| **ReLU** | $\max(0, x)$; the simplest working nonlinearity, gradient 1 when active |
| **Saturation** | A unit in an activation's flat region, where the gradient is effectively zero |
| **MLP** | Multilayer perceptron: units arranged in layers, trained end to end |
| **Backpropagation** | Attribute output error to every weight via the chain rule |
| **Gradient descent** | Step opposite to $\nabla J$ to reduce the error $J$ |
| **Stochastic gradient descent** | One update per training example rather than per pass |
| **Decision boundary** | The surface a network's current weights draw through input space |
| **Linear separability** | Classes a straight boundary can divide; XOR is not one |
| **Curse of dimensionality** | $10^D$ samples for fixed coverage in $D$ dimensions |
| **Representation learning** | Learn the features instead of designing them |
| **Deep learning** | Learn multiple levels of representation of increasing abstraction |
| **Diffusion of gradient** | Error attenuating on its way back, starving early layers |
| **Greedy layer-wise training** | Pre-train layers one at a time unsupervised, then fine-tune |
| **Autoencoder** | Reconstruct the input through a narrow bottleneck; no labels needed |
| **Self-taught learning** | Using unlabelled data outside the training set to learn features |
| **GAN** | A generator trained against a discriminator that detects its fakes |

## What to interrogate, not just absorb

1. **Consistency with the training data is the weakest possible evidence.** The curve-fitting
   sequence ends with a curve through every point, and that curve is the worst hypothesis in
   the set. Whenever a result is reported as fitting the data, the question is what was held
   back and how the model did on it — because a sufficiently flexible model fits anything,
   including the noise.
2. **The biological story is motivation, not justification.** Dendrites multiply, somas sum,
   axons threshold — the analogy is tidy and does no work. Units are not neurons, weights are
   not synapses, and backpropagation has no plausible biological implementation at all. When
   a claim about neural networks leans on how brains work, it is leaning on nothing.
3. **Depth without nonlinearity is a rounding error.** Fifty linear layers compose into one
   linear map. This is worth checking explicitly, because architecture diagrams happily show
   depth that buys no expressiveness, and the activation function is the load-bearing part
   the diagram usually omits.
4. **Saturation is where the arithmetic and the engineering meet.** The lecture's own example
   produces a sum of 21.34, at which the sigmoid's derivative is around $5 \times 10^{-10}$.
   That single number, raised to the power of the number of layers, is why deep networks did
   not train — and why a function as crude as ReLU displaced a generation of carefully
   designed alternatives.
5. **The curse of dimensionality is never actually beaten, only renegotiated.** Every method
   on the list — manual features, smoothness, kernels, learned representations — buys
   tractability by assuming something about the function. Deep learning's assumption is that
   useful structure is hierarchical and compositional. That holds remarkably well for images
   and language. It is an assumption nonetheless, and when a deep model fails strangely on
   some domain, suspect it first.
6. **A global objective can starve its own parts.** Early layers stopped learning because the
   top layers were already good enough to shrink the error. That failure mode is not special
   to neural networks; any system optimizing one aggregate number can let a component rot
   while the number looks fine. It is the single most transferable idea in this feature.
7. **Separate the trick from the idea when a method is declared obsolete.** Greedy layer-wise
   pre-training is no longer standard practice, and the principle it demonstrated —
   representations learned from unlabelled data, then adapted — now underwrites essentially
   every large model in use. Dismissing the one because the other was superseded is how
   people end up re-deriving pre-training from scratch.
