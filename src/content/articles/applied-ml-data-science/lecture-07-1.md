---
course: applied-ml-data-science
lectureId: L07
title: "The Network That Learned to Slide Across an Image"
deck: "A fully-connected net drowns in a million pixels. The convolutional network wins by studying small tiles, reusing its weights everywhere, and throwing information away on purpose."
order: 7
date: 2025-03-24
readingTime: 8
tags: ["cnn", "convolution", "pooling", "computer-vision", "deep-learning"]
concepts:
  - id: convolution
    term: Convolution
    definition: "The core CNN operation: a small filter slides across an input volume and computes a weighted sum of the pixels it overlaps at each position, producing a feature map. Because the same weights are reused at every location, it detects a pattern wherever it appears while keeping the parameter count small."
  - id: filter-kernel
    term: Filter (Kernel)
    definition: "A small matrix of learned weights — typically 3×3, 5×5, or occasionally 11×11 — whose size defines the receptive field, the patch of input that a single output value depends on."
  - id: stride
    term: Stride
    definition: "The step size by which a filter moves across the input. A stride of 1 shifts one pixel at a time; larger strides skip positions and shrink the output."
  - id: padding
    term: Padding
    definition: "A border of zeros added around the input so filters can sit on edge pixels and the output can retain the input's spatial dimensions."
  - id: pooling
    term: Pooling
    definition: "A downsampling step that reduces the width and height of a feature map. Max pooling keeps the strongest activation in each window; average pooling keeps the mean."
  - id: relu
    term: ReLU Activation
    definition: "The rectified linear unit, f(x) = max(0, x), which zeros out negative values. Its constant positive-region gradient trains quickly and sidesteps the vanishing-gradient problem of sigmoid and tanh."
  - id: dropout
    term: Dropout
    definition: "A regularization technique that randomly deactivates a fraction of units during training, discouraging co-adaptation between neurons and reducing overfitting."
---

A single photograph can break an ordinary neural network. Take a modest
672 × 500 color image and flatten every pixel into one long vector, and you have
handed the first layer more than a million inputs — over a million values before
a single feature has been learned. Wire each of those to a fully-connected layer
and the weight count detonates. Worse, flattening destroys the very thing that
makes an image an image: the fact that neighboring pixels belong together. The
**convolutional neural network** was built to refuse that bargain. Instead of
connecting everything to everything, it slides a small window across the picture,
reuses the same handful of weights everywhere it goes, and assembles meaning from
the bottom up.

## The Tyranny of the Flattened Image

A dense network treats a picture as an unstructured list of numbers. A CNN keeps
it as a three-dimensional volume of width, height, and depth, $W \times H \times D$,
and processes it with layers that respect that geometry. A typical stack moves
through a **convolutional layer** that extracts local features, a **pooling
layer** that shrinks the volume, a **dropout layer** that regularizes, a
**flatten** step that finally unrolls the volume into a vector, and one or more
**fully-connected layers** that make the decision. The dense layers still appear
— but only at the end, after convolution has distilled a million raw pixels into
a compact, meaningful summary.

## Convolution: A Small Window, Reused Everywhere

At the heart of the architecture is the **filter**, or kernel — a small matrix of
weights, commonly $3 \times 3$ or $5 \times 5$, sometimes as large as
$11 \times 11$. The filter slides over the input, and at each stop it multiplies
its weights against the pixels it covers and sums the result into a single number.
Sweep it across the whole image and those numbers form a **feature map**. The
kernel's footprint is its *receptive field*: the region of input any one output
value can "see."

The decisive trick is **weight sharing**. The same filter is applied at every
position, so a kernel that has learned to detect a vertical edge detects that edge
anywhere in the frame, and the number of parameters depends on the filter's size,
not the image's. One small set of weights, reused thousands of times, replaces the
astronomical wiring of a dense layer.

## Stride and Padding: Controlling the Slide

Two knobs govern how the filter travels. **Stride** is the distance it jumps
between applications: a stride of 1 moves one pixel at a time and produces a dense,
full-resolution map, while a larger stride skips positions and downsamples as it
goes. **Padding** rings the input with zeros so the filter can be centered on edge
pixels rather than falling off the border; without it, every convolution quietly
erodes the map's size. The output dimension along each axis follows a single
formula:

$$
o = \left\lfloor \frac{n - f + 2p}{s} \right\rfloor + 1
$$

where $n$ is the input size, $f$ the filter size, $p$ the padding, and $s$ the
stride. Choose $p$ so that $o = n$ and you have "same" padding, which preserves
spatial resolution layer after layer.

<figure>
<svg viewBox="0 0 470 288" role="img" aria-label="Convolution with zero-padding and stride: a 3 by 3 filter slides across a zero-padded input grid, and each placement writes one value into the feature map.">
  <defs>
    <marker id="arw-conv" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" class="dgm-fill"/>
    </marker>
  </defs>
  <rect x="44" y="54" width="182" height="182" fill="none" stroke="currentColor" stroke-width="1" stroke-dasharray="4 4" class="dgm-muted"/>
  <text x="135" y="44" text-anchor="middle" font-size="11" class="dgm-muted">zero-padding</text>
  <g>
    <line x1="70" y1="80" x2="70" y2="210" stroke="currentColor" stroke-width="1.5"/>
    <line x1="96" y1="80" x2="96" y2="210" stroke="currentColor" stroke-width="1.5"/>
    <line x1="122" y1="80" x2="122" y2="210" stroke="currentColor" stroke-width="1.5"/>
    <line x1="148" y1="80" x2="148" y2="210" stroke="currentColor" stroke-width="1.5"/>
    <line x1="174" y1="80" x2="174" y2="210" stroke="currentColor" stroke-width="1.5"/>
    <line x1="200" y1="80" x2="200" y2="210" stroke="currentColor" stroke-width="1.5"/>
    <line x1="70" y1="80" x2="200" y2="80" stroke="currentColor" stroke-width="1.5"/>
    <line x1="70" y1="106" x2="200" y2="106" stroke="currentColor" stroke-width="1.5"/>
    <line x1="70" y1="132" x2="200" y2="132" stroke="currentColor" stroke-width="1.5"/>
    <line x1="70" y1="158" x2="200" y2="158" stroke="currentColor" stroke-width="1.5"/>
    <line x1="70" y1="184" x2="200" y2="184" stroke="currentColor" stroke-width="1.5"/>
    <line x1="70" y1="210" x2="200" y2="210" stroke="currentColor" stroke-width="1.5"/>
  </g>
  <rect x="96" y="80" width="78" height="78" fill="none" stroke="currentColor" stroke-width="1.2" stroke-dasharray="3 3" class="dgm-muted"/>
  <g class="dgm-accent">
    <rect x="70" y="80" width="78" height="78" fill="none" stroke="currentColor" stroke-width="1.5"/>
  </g>
  <line x1="109" y1="70" x2="135" y2="70" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-conv)"/>
  <text x="122" y="64" text-anchor="middle" font-size="10" class="dgm-muted">stride</text>
  <text x="135" y="256" text-anchor="middle" font-size="12">padded input</text>
  <line x1="234" y1="145" x2="300" y2="145" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-conv)"/>
  <text x="267" y="138" text-anchor="middle" font-size="11">convolve</text>
  <text x="267" y="160" text-anchor="middle" font-size="10" class="dgm-muted">∗ filter K</text>
  <g>
    <line x1="304" y1="80" x2="304" y2="210" stroke="currentColor" stroke-width="1.5"/>
    <line x1="330" y1="80" x2="330" y2="210" stroke="currentColor" stroke-width="1.5"/>
    <line x1="356" y1="80" x2="356" y2="210" stroke="currentColor" stroke-width="1.5"/>
    <line x1="382" y1="80" x2="382" y2="210" stroke="currentColor" stroke-width="1.5"/>
    <line x1="408" y1="80" x2="408" y2="210" stroke="currentColor" stroke-width="1.5"/>
    <line x1="434" y1="80" x2="434" y2="210" stroke="currentColor" stroke-width="1.5"/>
    <line x1="304" y1="80" x2="434" y2="80" stroke="currentColor" stroke-width="1.5"/>
    <line x1="304" y1="106" x2="434" y2="106" stroke="currentColor" stroke-width="1.5"/>
    <line x1="304" y1="132" x2="434" y2="132" stroke="currentColor" stroke-width="1.5"/>
    <line x1="304" y1="158" x2="434" y2="158" stroke="currentColor" stroke-width="1.5"/>
    <line x1="304" y1="184" x2="434" y2="184" stroke="currentColor" stroke-width="1.5"/>
    <line x1="304" y1="210" x2="434" y2="210" stroke="currentColor" stroke-width="1.5"/>
  </g>
  <g class="dgm-accent">
    <rect x="304" y="80" width="26" height="26" fill="none" stroke="currentColor" stroke-width="1.5"/>
  </g>
  <text x="369" y="256" text-anchor="middle" font-size="12">feature map</text>
</svg>
<figcaption><b>Convolution, padding &amp; stride.</b> The 3×3 filter (highlighted) slides across the zero-padded input; the stride sets how far it hops, and each placement writes one cell of the feature map — with "same" padding the map keeps the input's size.</figcaption>
</figure>

## Keeping the Signal Nonlinear: ReLU

Convolution is linear, and a stack of linear operations is still just one linear
operation. The nonlinearity comes from the **ReLU** activation applied after each
convolution:

$$
\text{ReLU}(x) = \max(0, x)
$$

It simply clamps negative responses to zero. Its derivative is trivial,

$$
\text{ReLU}'(x) = \begin{cases} 0 & x < 0 \\ 1 & x \ge 0 \end{cases}
$$

and that flat, constant gradient over the positive region is exactly why deep
networks converge quickly with ReLU. Contrast the sigmoid and tanh functions,
whose gradients flatten toward zero for large positive or negative inputs — there,
a big change in $x$ barely moves the output, so the learning signal decays as it
propagates backward. That decay is the **vanishing-gradient problem**, and ReLU's
simple, cheap kink largely avoids it.

## Pooling: The Art of Forgetting

After features are detected, a CNN deliberately discards resolution.
**Pooling** slides a window across a feature map and collapses each window to one
number. **Max pooling** keeps the largest value, on the assumption that the visual
features worth remembering fire strongly; it preserves the presence and rough
location of a feature while dropping exact pixel positions. **Average pooling**
instead outputs the mean of the window. Either way the map gets smaller, later
layers do less work, and the representation gains a useful tolerance to small
shifts in the input.

<figure>
<svg viewBox="0 0 500 252" role="img" aria-label="Max pooling: a 4 by 4 feature map is divided into 2 by 2 windows, and each window is replaced by its maximum value, producing a 2 by 2 output.">
  <defs>
    <marker id="arw-pool" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" class="dgm-fill"/>
    </marker>
  </defs>
  <g>
    <line x1="60" y1="50" x2="60" y2="210" stroke="currentColor" stroke-width="1.5"/>
    <line x1="100" y1="50" x2="100" y2="210" stroke="currentColor" stroke-width="1.5"/>
    <line x1="140" y1="50" x2="140" y2="210" stroke="currentColor" stroke-width="1.5"/>
    <line x1="180" y1="50" x2="180" y2="210" stroke="currentColor" stroke-width="1.5"/>
    <line x1="220" y1="50" x2="220" y2="210" stroke="currentColor" stroke-width="1.5"/>
    <line x1="60" y1="50" x2="220" y2="50" stroke="currentColor" stroke-width="1.5"/>
    <line x1="60" y1="90" x2="220" y2="90" stroke="currentColor" stroke-width="1.5"/>
    <line x1="60" y1="130" x2="220" y2="130" stroke="currentColor" stroke-width="1.5"/>
    <line x1="60" y1="170" x2="220" y2="170" stroke="currentColor" stroke-width="1.5"/>
    <line x1="60" y1="210" x2="220" y2="210" stroke="currentColor" stroke-width="1.5"/>
  </g>
  <line x1="140" y1="50" x2="140" y2="210" stroke="currentColor" stroke-width="2.4"/>
  <line x1="60" y1="130" x2="220" y2="130" stroke="currentColor" stroke-width="2.4"/>
  <g class="dgm-accent">
    <rect x="60" y="50" width="80" height="80" fill="none" stroke="currentColor" stroke-width="2"/>
  </g>
  <g font-size="13">
    <text x="80" y="75" text-anchor="middle">1</text>
    <text x="120" y="75" text-anchor="middle">3</text>
    <text x="160" y="75" text-anchor="middle">2</text>
    <text x="200" y="75" text-anchor="middle">1</text>
    <text x="80" y="115" text-anchor="middle">2</text>
    <text x="120" y="115" text-anchor="middle">8</text>
    <text x="160" y="115" text-anchor="middle">0</text>
    <text x="200" y="115" text-anchor="middle">4</text>
    <text x="80" y="155" text-anchor="middle">5</text>
    <text x="120" y="155" text-anchor="middle">6</text>
    <text x="160" y="155" text-anchor="middle">7</text>
    <text x="200" y="155" text-anchor="middle">2</text>
    <text x="80" y="195" text-anchor="middle">1</text>
    <text x="120" y="195" text-anchor="middle">2</text>
    <text x="160" y="195" text-anchor="middle">3</text>
    <text x="200" y="195" text-anchor="middle">9</text>
  </g>
  <line x1="232" y1="130" x2="348" y2="130" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-pool)"/>
  <text x="290" y="122" text-anchor="middle" font-size="11">2×2 max pool</text>
  <text x="290" y="148" text-anchor="middle" font-size="10" class="dgm-muted">stride 2</text>
  <g>
    <line x1="360" y1="90" x2="360" y2="170" stroke="currentColor" stroke-width="1.5"/>
    <line x1="400" y1="90" x2="400" y2="170" stroke="currentColor" stroke-width="1.5"/>
    <line x1="440" y1="90" x2="440" y2="170" stroke="currentColor" stroke-width="1.5"/>
    <line x1="360" y1="90" x2="440" y2="90" stroke="currentColor" stroke-width="1.5"/>
    <line x1="360" y1="130" x2="440" y2="130" stroke="currentColor" stroke-width="1.5"/>
    <line x1="360" y1="170" x2="440" y2="170" stroke="currentColor" stroke-width="1.5"/>
  </g>
  <g class="dgm-accent">
    <rect x="360" y="90" width="40" height="40" fill="none" stroke="currentColor" stroke-width="2"/>
  </g>
  <g font-size="14">
    <text x="380" y="115" text-anchor="middle">8</text>
    <text x="420" y="115" text-anchor="middle">4</text>
    <text x="380" y="155" text-anchor="middle">6</text>
    <text x="420" y="155" text-anchor="middle">9</text>
  </g>
  <text x="140" y="234" text-anchor="middle" font-size="12">feature map (4×4)</text>
  <text x="400" y="196" text-anchor="middle" font-size="12">pooled (2×2)</text>
</svg>
<figcaption><b>Max pooling.</b> Each 2×2 window of the feature map is collapsed to its largest activation, halving width and height while keeping the strongest feature in every region.</figcaption>
</figure>

## Dropout: Training by Sabotage

Deep vision models have enough capacity to memorize their training set. **Dropout**
fights that by randomly switching off a fraction of units on each training pass, so
no neuron can rely on any particular partner being present. The network is forced
to spread its knowledge redundantly, which acts as a powerful regularizer at
essentially no cost at inference time, when dropout is turned off.

<figure>
<svg viewBox="0 0 560 278" role="img" aria-label="Dropout: in a small network some hidden units are randomly switched off, so their incoming and outgoing connections vanish for that training pass.">
  <defs>
    <marker id="arw-drop" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" class="dgm-fill"/>
    </marker>
  </defs>
  <g class="dgm-muted">
    <line x1="80" y1="90" x2="280" y2="70" stroke="currentColor" stroke-width="1"/>
    <line x1="80" y1="90" x2="280" y2="170" stroke="currentColor" stroke-width="1"/>
    <line x1="80" y1="150" x2="280" y2="70" stroke="currentColor" stroke-width="1"/>
    <line x1="80" y1="150" x2="280" y2="170" stroke="currentColor" stroke-width="1"/>
    <line x1="80" y1="210" x2="280" y2="70" stroke="currentColor" stroke-width="1"/>
    <line x1="80" y1="210" x2="280" y2="170" stroke="currentColor" stroke-width="1"/>
    <line x1="280" y1="70" x2="480" y2="120" stroke="currentColor" stroke-width="1"/>
    <line x1="280" y1="70" x2="480" y2="170" stroke="currentColor" stroke-width="1"/>
    <line x1="280" y1="170" x2="480" y2="120" stroke="currentColor" stroke-width="1"/>
    <line x1="280" y1="170" x2="480" y2="170" stroke="currentColor" stroke-width="1"/>
  </g>
  <g>
    <circle cx="80" cy="90" r="13" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <circle cx="80" cy="150" r="13" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <circle cx="80" cy="210" r="13" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <circle cx="280" cy="70" r="13" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <circle cx="280" cy="170" r="13" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <circle cx="480" cy="120" r="13" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <circle cx="480" cy="170" r="13" fill="none" stroke="currentColor" stroke-width="1.5"/>
  </g>
  <g class="dgm-accent">
    <circle cx="280" cy="120" r="13" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <line x1="271" y1="111" x2="289" y2="129" stroke="currentColor" stroke-width="1.5"/>
    <line x1="289" y1="111" x2="271" y2="129" stroke="currentColor" stroke-width="1.5"/>
    <circle cx="280" cy="220" r="13" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <line x1="271" y1="211" x2="289" y2="229" stroke="currentColor" stroke-width="1.5"/>
    <line x1="289" y1="211" x2="271" y2="229" stroke="currentColor" stroke-width="1.5"/>
  </g>
  <line x1="360" y1="120" x2="298" y2="120" stroke="currentColor" stroke-width="1.2" marker-end="url(#arw-drop)"/>
  <text x="405" y="124" text-anchor="middle" font-size="11" class="dgm-accent">randomly dropped</text>
  <text x="80" y="244" text-anchor="middle" font-size="11">input</text>
  <text x="280" y="258" text-anchor="middle" font-size="11">hidden — 50% dropped</text>
  <text x="480" y="200" text-anchor="middle" font-size="11">output</text>
</svg>
<figcaption><b>Dropout.</b> On each training pass a random subset of hidden units is switched off (crossed) along with all their connections, forcing the surviving units to learn robust, non-co-adapted features.</figcaption>
</figure>

## Assembling the Stack

Put the pieces together and a working image classifier is only a few lines:

```python
cnn_model = keras.models.Sequential([
    keras.layers.Conv2D(64, 7, activation='relu', padding='same',
                        input_shape=[28, 28, 1]),
    keras.layers.MaxPooling2D(pool_size=2),
    keras.layers.Conv2D(128, 3, activation='relu', padding='same'),
    keras.layers.MaxPooling2D(pool_size=2),
    keras.layers.Flatten(),
    keras.layers.Dense(128, activation='relu'),
    keras.layers.Dropout(0.5),
    keras.layers.Dense(10, activation='softmax'),
])
```

The parameter economy is easy to verify. That first layer applies 64 filters, each
$7 \times 7$ over a single input channel, plus one bias apiece:

$$
(7 \times 7 \times 1 + 1) \times 64 = 3200
$$

Three thousand weights, not three million — and they are reused across the entire
image.

## Why It Matters

The CNN's three commitments — look locally, share weights, and downsample without
mercy — are what turned image recognition from an intractable parameter explosion
into a routine engineering task. Every convolutional layer is a bet that meaning is
built from local patterns combined across scales, and it is a bet that has paid off
across medical imaging, autonomous driving, and the vision backbones that still feed
today's multimodal systems. The lesson is quietly radical: sometimes the way to
understand more is to connect less and forget on purpose.
