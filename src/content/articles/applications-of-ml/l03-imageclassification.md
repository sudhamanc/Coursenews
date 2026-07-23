---
course: applications-of-ml
lectureId: L03
title: "Teaching Machines to See, One Sliding Window at a Time"
deck: "How the convolution — a humble sliding dot product — retired a generation of hand-engineered image features and let networks learn for themselves what to look for."
order: 3
date: 2026-01-15
readingTime: 10
tags: ["image-classification", "cnn", "convolution", "pooling", "softmax"]
concepts:
  - id: image-representation
    term: Image Representation
    definition: "The encoding of a picture as a grid of numbers — a single matrix for binary or grayscale images, and three stacked channels for RGB color."
  - id: histogram-of-oriented-gradients
    term: Histogram of Oriented Gradients (HOG)
    definition: "A hand-engineered image feature that summarizes a region by the distribution of its edge orientations, representative of the pre-deep-learning era of vision."
  - id: cross-correlation
    term: Cross-Correlation
    definition: "The sliding dot product of a kernel over an image; computed at every valid location it produces a feature map. It is the operation most CNNs actually use in place of true convolution."
  - id: feature-map
    term: Feature Map
    definition: "The output matrix produced by sliding one kernel across an input, recording that filter's response at every position."
  - id: padding-and-stride
    term: Padding and Stride
    definition: "Two knobs that control a convolution's geometry: padding adds a border (often zeros) to preserve size, while stride sets how far the window jumps between evaluations."
  - id: pooling
    term: Pooling
    definition: "A downsampling step that summarizes each region of a feature map — typically by taking the maximum — shrinking the representation and granting some invariance to translation."
  - id: receptive-field
    term: Receptive Field
    definition: "The region of the original input that influences a given unit in a feature map; it grows as convolutional and pooling layers are stacked."
  - id: softmax-cross-entropy
    term: Softmax and Cross-Entropy
    definition: "The classification head: softmax turns a vector of scores into a probability distribution over classes, and cross-entropy measures the gap between that distribution and the true label."
---

For most of the history of computer vision, the hard part was not the learning — it was the *looking*. Engineers spent careers hand-crafting descriptions of what mattered in an image: the edges here, the gradients there, the textures that distinguished a face from a fencepost. The convolutional neural network swept that cottage industry aside with a single, almost embarrassingly simple operation. Slide a small grid of numbers across a picture, multiply and add, and repeat. From that sliding dot product, and from letting the numbers in the grid be *learned* rather than designed, came machines that see.

## Pictures as Numbers

Before a model can look, an image must become arithmetic. A **binary image** is a grid of ones and zeros; a **grayscale image** replaces those with intensities; and an **RGB image** stacks three such grids — one each for red, green, and blue. That stacking introduces a third dimension we call *depth*, and each of its matrices is a *channel*. A single color observation is therefore an array of shape $3 \times H \times W$, and a batch of $N$ of them lives in $\mathbb{R}^{N \times 3 \times H \times W}$. Everything that follows is arithmetic on these grids.

## Before Deep Learning: Hand-Drawn Features

The classical approach met this arithmetic with human ingenuity. A descriptor like the **Histogram of Oriented Gradients** would scan a region, measure the direction of its edges, and tally those directions into a histogram — a compact fingerprint of local shape. Such features powered the best systems of their day, but each was a manual invention, brittle and narrow. The field was waiting for something that could discover its own features.

## The Convolution: A Sliding Dot Product

That something is the convolution — or, to be precise about what CNNs actually compute, **cross-correlation**. Take a small $M \times M$ **kernel** $K$ and lay it over an equally sized patch of the image; the kernel's response is the 2D dot product of the two, $\sum_{i}\sum_{j} X_{i,j} K_{i,j}$. Now slide that window to every valid location and record each response. The equation for the response centered at position $(a,b)$ is

$$
F_{a,b} = \sum_{i=1}^{M}\sum_{j=1}^{M} X_{\,a+i-1,\;b+j-1}\; K_{i,j}
$$

and the grid of all such responses is the **feature map**. (True *convolution* first flips the kernel; because that flip buys the commutative property but nothing a CNN needs, most networks skip it and use cross-correlation directly.)

<figure>
<svg viewBox="0 0 780 300" role="img" aria-label="A three-by-three kernel window highlighted over a four-by-four input grid maps by a dot product to one highlighted cell of the two-by-two feature map.">
  <defs>
    <marker id="arw-conv" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" class="dgm-fill"/>
    </marker>
  </defs>
  <text x="136" y="46" text-anchor="middle" font-size="12" class="dgm-muted">Input X · 4×4</text>
  <rect x="40" y="60" width="192" height="192" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <line x1="88" y1="60" x2="88" y2="252" stroke="currentColor" stroke-width="1"/>
  <line x1="136" y1="60" x2="136" y2="252" stroke="currentColor" stroke-width="1"/>
  <line x1="184" y1="60" x2="184" y2="252" stroke="currentColor" stroke-width="1"/>
  <line x1="40" y1="108" x2="232" y2="108" stroke="currentColor" stroke-width="1"/>
  <line x1="40" y1="156" x2="232" y2="156" stroke="currentColor" stroke-width="1"/>
  <line x1="40" y1="204" x2="232" y2="204" stroke="currentColor" stroke-width="1"/>
  <g class="dgm-accent">
    <rect x="40" y="60" width="144" height="144" class="dgm-soft" stroke="currentColor" stroke-width="2"/>
  </g>
  <text x="64" y="89" text-anchor="middle" font-size="14">1</text>
  <text x="112" y="89" text-anchor="middle" font-size="14">2</text>
  <text x="160" y="89" text-anchor="middle" font-size="14">3</text>
  <text x="208" y="89" text-anchor="middle" font-size="14">4</text>
  <text x="64" y="137" text-anchor="middle" font-size="14">2</text>
  <text x="112" y="137" text-anchor="middle" font-size="14">2</text>
  <text x="160" y="137" text-anchor="middle" font-size="14">3</text>
  <text x="208" y="137" text-anchor="middle" font-size="14">2</text>
  <text x="64" y="185" text-anchor="middle" font-size="14">1</text>
  <text x="112" y="185" text-anchor="middle" font-size="14">3</text>
  <text x="160" y="185" text-anchor="middle" font-size="14">3</text>
  <text x="208" y="185" text-anchor="middle" font-size="14">3</text>
  <text x="64" y="233" text-anchor="middle" font-size="14">4</text>
  <text x="112" y="233" text-anchor="middle" font-size="14">4</text>
  <text x="160" y="233" text-anchor="middle" font-size="14">4</text>
  <text x="208" y="233" text-anchor="middle" font-size="14">4</text>
  <text x="136" y="276" text-anchor="middle" font-size="11" class="dgm-muted">3×3 kernel K slides over X</text>
  <line x1="240" y1="128" x2="556" y2="120" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-conv)"/>
  <text x="400" y="110" text-anchor="middle" font-size="11" class="dgm-muted">dot product → one value</text>
  <text x="400" y="146" text-anchor="middle" font-size="10" class="dgm-muted">slide to every position</text>
  <text x="616" y="74" text-anchor="middle" font-size="12" class="dgm-muted">Feature map F · 2×2</text>
  <rect x="560" y="90" width="112" height="112" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <line x1="616" y1="90" x2="616" y2="202" stroke="currentColor" stroke-width="1"/>
  <line x1="560" y1="146" x2="672" y2="146" stroke="currentColor" stroke-width="1"/>
  <g class="dgm-accent">
    <rect x="560" y="90" width="56" height="56" class="dgm-soft" stroke="currentColor" stroke-width="2"/>
    <text x="588" y="123" text-anchor="middle" font-size="15" font-weight="700">50</text>
  </g>
  <text x="644" y="123" text-anchor="middle" font-size="15">57</text>
  <text x="588" y="179" text-anchor="middle" font-size="15">60</text>
  <text x="644" y="179" text-anchor="middle" font-size="15">63</text>
</svg>
<figcaption><b>The convolution</b> The 3×3 kernel takes a dot product with the shaded input window to produce one feature-map entry (here 50), then slides to every position.</figcaption>
</figure>

A worked example makes the mechanics concrete. With a $4 \times 4$ input and a $3 \times 3$ kernel,

$$
X=\begin{bmatrix}1&2&3&4\\2&2&3&2\\1&3&3&3\\4&4&4&4\end{bmatrix},\quad
K=\begin{bmatrix}1&2&3\\2&2&3\\1&3&3\end{bmatrix}
\;\Longrightarrow\;
F = K \star X = \begin{bmatrix}50&57\\60&63\end{bmatrix}
$$

The top-left entry, for instance, is the dot product of $K$ with the top-left $3\times3$ block of $X$: $1{+}4{+}9 + 4{+}4{+}9 + 1{+}9{+}9 = 50$.

### Padding, Stride, and the Shape of the Output

Notice the output shrank. A kernel can only be centered where it has enough neighbors, so an $H \times W$ image convolved with an $M \times M$ kernel yields a feature map of size $(H-M+1)\times(W-M+1)$. If you want to preserve the original dimensions you can **pad** the border, usually with zeros — at the cost of introducing "fake" data around the edges. The **stride** is the complementary knob: instead of shifting the window one pixel at a time, you can leap several, trading spatial resolution for speed and a smaller map.

### Seeing in Color and in Depth

Real inputs are rarely a single channel. For an RGB image — or for the many feature maps handed up by a previous layer — the kernel gains matching depth, becoming a $C \times M \times M$ filter that is *not* slid along the channel axis but summed across it:

$$
F_{a,b} = \sum_{l=1}^{C}\sum_{i=1}^{M}\sum_{j=1}^{M} X_{\,l,\;a+i-1,\;b+j-1}\; K_{\,l,i,j}
$$

Each filter thus collapses all input channels into one output feature map, and a layer learns many filters at once — one output channel per filter.

## Pooling: The Art of Summarizing

After convolution comes **pooling**, which is essentially downsampling. Slide a $Q \times Q$ window across a feature map and replace each region with a single summary value: **max pooling** keeps the largest activation, while **L2 pooling** takes the square root of the sum of squares. With a stride $S$, a $D \times E$ map pools down to size $\left(\frac{D-Q}{S}+1\right)\times\left(\frac{E-Q}{S}+1\right)$. Pooling makes the representation smaller and more manageable, operates on each channel independently, and — by reporting *that* a feature appeared rather than exactly where — grants the network a useful invariance to small translations.

## Widening the View: Receptive Fields

Any single unit deep in a network looks at only a small patch through its own kernel — but that patch was itself computed from a patch of the layer below, which came from a still-larger patch below that. The region of the original image that ultimately influences a unit is its **receptive field**, and it widens with every convolution and pooling step. This is why depth matters: early layers, with tiny receptive fields, detect edges and textures; later layers, seeing through a much wider window, assemble those primitives into eyes, wheels, and whole objects.

## From Feature Maps to a Verdict

The convolutional stack is a feature extractor; something still has to render a decision. So the final feature maps are **flattened** into a vector and fed to an ordinary fully connected classifier. Its raw scores, or logits, are passed through a **softmax** to become a probability distribution over the classes,

$$
p_k = \frac{e^{z_k}}{\sum_{j} e^{z_j}},
$$

and training minimizes the **cross-entropy** between that distribution and the true label, $\mathcal{L} = -\sum_k y_k \log p_k$. In PyTorch the whole pipeline is a short stack of `nn.Conv2d`, `nn.MaxPool2d`, and `nn.Flatten` layers feeding a linear head.

<figure>
<svg viewBox="0 0 900 200" role="img" aria-label="A convolutional pipeline: image, convolution, pooling (stacked and repeated), flatten, fully connected layer, softmax, producing class probabilities.">
  <defs>
    <marker id="arw-pipe" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" class="dgm-fill"/>
    </marker>
  </defs>
  <rect x="16" y="50" width="92" height="70" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="62" y="82" text-anchor="middle" font-size="13" font-weight="700">Image</text>
  <text x="62" y="100" text-anchor="middle" font-size="10" class="dgm-muted">3×H×W</text>
  <rect x="136" y="50" width="104" height="70" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="188" y="82" text-anchor="middle" font-size="13" font-weight="700">Conv</text>
  <text x="188" y="100" text-anchor="middle" font-size="10" class="dgm-muted">learned filters</text>
  <rect x="268" y="50" width="104" height="70" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="320" y="82" text-anchor="middle" font-size="13" font-weight="700">Pool</text>
  <text x="320" y="100" text-anchor="middle" font-size="10" class="dgm-muted">max / L2</text>
  <rect x="400" y="50" width="104" height="70" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="452" y="82" text-anchor="middle" font-size="13" font-weight="700">Flatten</text>
  <text x="452" y="100" text-anchor="middle" font-size="10" class="dgm-muted">→ vector</text>
  <rect x="532" y="50" width="92" height="70" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="578" y="82" text-anchor="middle" font-size="13" font-weight="700">FC</text>
  <text x="578" y="100" text-anchor="middle" font-size="10" class="dgm-muted">linear head</text>
  <g class="dgm-accent">
    <rect x="652" y="50" width="116" height="70" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <text x="710" y="82" text-anchor="middle" font-size="13" font-weight="700">Softmax</text>
    <text x="710" y="100" text-anchor="middle" font-size="10">probabilities</text>
  </g>
  <line x1="108" y1="85" x2="132" y2="85" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-pipe)"/>
  <line x1="240" y1="85" x2="264" y2="85" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-pipe)"/>
  <line x1="372" y1="85" x2="396" y2="85" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-pipe)"/>
  <line x1="504" y1="85" x2="528" y2="85" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-pipe)"/>
  <line x1="624" y1="85" x2="648" y2="85" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-pipe)"/>
  <line x1="768" y1="85" x2="812" y2="85" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-pipe)"/>
  <text x="852" y="81" text-anchor="middle" font-size="11" font-weight="700">class</text>
  <text x="852" y="97" text-anchor="middle" font-size="11" font-weight="700">probs</text>
  <text x="254" y="150" text-anchor="middle" font-size="10" class="dgm-muted">conv + pool repeat ×N</text>
</svg>
<figcaption><b>The CNN pipeline</b> Convolution and pooling stack up as a feature extractor; the maps are flattened into a vector and a softmax head turns the scores into class probabilities.</figcaption>
</figure>

## Why It Matters

The convolution is one of those rare ideas that is at once trivial to state and transformative in effect. By tying weights across every position, it lets a network learn a feature *once* and apply it everywhere, slashing the parameters needed and building in the assumption that a cat is a cat wherever it appears in the frame. Stack these layers, widen the receptive field, and cap the whole thing with a softmax, and hand-engineered descriptors like HOG become history. The machine no longer needs to be told what to look for; given enough labeled pictures and a gradient to follow, it works that out for itself.
