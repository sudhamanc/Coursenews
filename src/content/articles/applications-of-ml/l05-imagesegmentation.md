---
course: applications-of-ml
lectureId: L05
title: "Where One Thing Ends and Another Begins"
deck: "Image segmentation asks a deceptively simple question of every pixel — what are you part of? — and the answers run from graph theory to the U-shaped network now powering generative AI."
order: 4
date: 2026-01-16
readingTime: 8
tags: ["segmentation", "u-net", "computer-vision", "cnn", "iou"]
concepts:
  - id: semantic-segmentation
    term: Semantic Segmentation
    definition: "Labeling every pixel in an image with a class such as road or sky, without distinguishing between separate object instances of the same class."
  - id: instance-segmentation
    term: Instance Segmentation
    definition: "A finer task than semantic segmentation that assigns each individual object its own mask, so two overlapping cars remain countably distinct."
  - id: graph-based-segmentation
    term: Graph-Based Segmentation (Felzenszwalb)
    definition: "A 2004 method that models the image as a weighted graph and greedily merges regions whenever the edge weight joining them is no larger than their internal variation."
  - id: selective-search
    term: Selective Search
    definition: "A procedure that starts from an over-segmentation and recursively merges the two most similar regions, producing a hierarchy of candidate object regions."
  - id: u-net
    term: U-Net & Fully Convolutional Networks
    definition: "A symmetric encoder–decoder built entirely of convolutions that downsamples to capture context and upsamples to recover resolution, with skip connections carrying encoder features across."
  - id: transposed-convolution
    term: Transposed Convolution
    definition: "A learnable upsampling operation, also called up-convolution or deconvolution, that increases spatial resolution using a kernel trained by backpropagation."
  - id: iou-dice
    term: IoU & Dice
    definition: "Overlap metrics that score a predicted mask against ground truth by comparing their intersection to their union (IoU) or to their combined size (Dice)."
---

Long before any neural network labeled a photograph, the human visual system had
already solved a harder problem: it carved the world into *things*. Segmentation
— the partitioning of an image into semantically related regions — appears to be
one of the earliest stages of biological vision, and for machines it is frequently
the decisive step. In aerial image interpretation, medical scans, and self-driving
perception, the operative question is rarely "what is in this picture?" but
"**which pixels belong to what?**"

## Two Ways to Carve an Image

Not all cuts are alike. **Semantic segmentation** assigns every pixel a class label
— *road*, *sky*, *tumor* — yet is blind to identity: two pedestrians who overlap
dissolve into a single undifferentiated *person* blob. **Instance segmentation**
goes further, giving each individual object its own mask so that two cars, or two
cells, remain countably distinct. The lecture builds from classical region-finding,
which knows nothing of class labels at all, toward the encoder–decoder networks
that make dense, per-pixel prediction practical.

<figure>
<svg viewBox="0 0 760 250" role="img" aria-label="Semantic segmentation labels every pixel with a class, so two overlapping people merge into one region, while instance segmentation gives each person its own separate mask.">
  <text x="200" y="28" text-anchor="middle" font-size="14" font-weight="700">Semantic</text>
  <rect x="20" y="42" width="360" height="176" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <ellipse cx="165" cy="150" rx="78" ry="58" class="dgm-soft"/>
  <ellipse cx="245" cy="150" rx="78" ry="58" class="dgm-soft"/>
  <text x="205" y="122" text-anchor="middle" font-size="14" font-weight="700">person</text>
  <text x="200" y="202" text-anchor="middle" font-size="10" class="dgm-muted">one label · one blob</text>
  <text x="580" y="28" text-anchor="middle" font-size="14" font-weight="700">Instance</text>
  <rect x="400" y="42" width="340" height="176" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <ellipse cx="540" cy="150" rx="76" ry="56" class="dgm-soft" stroke="currentColor" stroke-width="1.5"/>
  <g class="dgm-accent">
    <ellipse cx="620" cy="150" rx="76" ry="56" class="dgm-soft" stroke="currentColor" stroke-width="1.5"/>
    <text x="662" y="200" text-anchor="middle" font-size="12" font-weight="700">person 2</text>
  </g>
  <text x="498" y="118" text-anchor="middle" font-size="12" font-weight="700">person 1</text>
  <text x="560" y="210" text-anchor="middle" font-size="10" class="dgm-muted">separate masks · countable</text>
</svg>
<figcaption><b>Two ways to carve.</b> Semantic segmentation merges overlapping people into a single <em>person</em> region; instance segmentation keeps each one a distinct, countable mask.</figcaption>
</figure>

## An Image as a Graph

The first serious algorithm on the table is Felzenszwalb's *efficient graph-based
segmentation* (2004). Its trick is to treat the image not as a grid of colors but
as a weighted, undirected graph $G=(V,E)$, where vertices are pixels and each edge
carries a weight measuring how *dissimilar* its two endpoints are.

Two constructions are offered. A **grid graph** connects each pixel to its eight
neighbors, with weight equal to the absolute intensity difference
$w(v_i,v_j)=\lvert I(v_i)-I(v_j)\rvert$; for color images the algorithm runs once
per channel and merges two pixels only if they land in the same component in all
three. A **nearest-neighbor graph** instead embeds each pixel as a point
$(x,y,r,g,b)$ and sets edge weights to the Euclidean distance between those vectors,
connecting each pixel to roughly its ten closest neighbors.

Segmentation then hinges on two measurements. The **internal difference** of a
component, $\mathrm{Int}(C)$, is the largest edge weight in that region's minimum
spanning tree — a gauge of how ragged the region already is inside. A size-aware
threshold $\tau(C)=k/\lvert C\rvert$ tempers this, where the parameter $k$ sets
granularity and small regions are granted more benefit of the doubt. Together they
define the **minimum internal difference** between two components:

$$
\mathrm{MInt}(C_1,C_2)=\min\!\big(\mathrm{Int}(C_1)+\tau(C_1),\ \mathrm{Int}(C_2)+\tau(C_2)\big)
$$

The algorithm is greedy and fast:

```text
sort edges by non-decreasing weight
each pixel starts as its own component
for each edge q = (v_i, v_j) in order:
    if component(v_i) != component(v_j)
       and w(q) <= MInt(C_i, C_j):
        merge the two components
```

A boundary survives exactly where the difference *between* two regions exceeds the
variation *within* them.

## From Regions to a Hierarchy

**Selective Search** takes that initial over-segmentation and does the opposite of
splitting: it recursively merges the two most similar regions until a single region
remains, emitting every intermediate grouping along the way. The result is a
*hierarchy* of candidate regions at many scales — the very supply of object
proposals that region-based detectors will consume in the next lecture.

## The U-Turn Network

When the goal is a prediction for *every pixel* — a class or a segment — the
dominant architecture is the **U-Net**, named for the shape of its data flow. It is
a fully convolutional encoder–decoder. The contracting path **downsamples** through
convolution and max-pooling, distilling *what* is present while discarding *where*;
the expanding path **upsamples** back to the original resolution, reconstructing
spatial precision. Two bookkeeping facts recur: convolution tends to halve
resolution while doubling the channel count, and up-convolution does the reverse,
doubling resolution while halving channels.

## The Skip That Saves Detail

A pure encoder–decoder would blur its own boundaries, having thrown away fine detail
on the way down. The U-Net's remedy is the **skip connection**: during
reconstruction, cropped feature maps from the downsampling side are *concatenated*
as extra channels onto the matching upsampling stage. Much like residual
connections, these reunite low-frequency semantics with high-frequency edges,
letting the network capture both coarse context and sharp outlines at once.

<figure>
<svg viewBox="0 0 820 380" role="img" aria-label="A U-Net: a contracting encoder path downsamples on the left, a bottleneck sits at the bottom, and an expanding decoder path upsamples on the right, with skip connections concatenating encoder features across to the decoder.">
  <defs>
    <marker id="arw-unet" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" class="dgm-fill"/>
    </marker>
    <marker id="arw-unet-skip" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" class="dgm-fill dgm-accent"/>
    </marker>
  </defs>
  <text x="410" y="22" text-anchor="middle" font-size="11" font-weight="700" class="dgm-accent">skip connections (concatenate)</text>
  <line x1="110" y1="18" x2="110" y2="42" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-unet)"/>
  <rect x="64" y="44" width="92" height="58" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="110" y="68" text-anchor="middle" font-size="11">H×W</text>
  <text x="110" y="86" text-anchor="middle" font-size="11" class="dgm-muted">C</text>
  <rect x="104" y="134" width="92" height="48" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="150" y="155" text-anchor="middle" font-size="11">H/2</text>
  <text x="150" y="171" text-anchor="middle" font-size="11" class="dgm-muted">2C</text>
  <rect x="144" y="214" width="92" height="40" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="190" y="238" text-anchor="middle" font-size="11">H/4 · 4C</text>
  <rect x="334" y="292" width="152" height="44" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="410" y="312" text-anchor="middle" font-size="12" font-weight="700">bottleneck</text>
  <text x="410" y="328" text-anchor="middle" font-size="10" class="dgm-muted">H/8 · 8C</text>
  <rect x="584" y="214" width="92" height="40" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="630" y="238" text-anchor="middle" font-size="11">H/4 · 4C</text>
  <rect x="624" y="134" width="92" height="48" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="670" y="155" text-anchor="middle" font-size="11">H/2</text>
  <text x="670" y="171" text-anchor="middle" font-size="11" class="dgm-muted">2C</text>
  <rect x="664" y="44" width="92" height="58" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="710" y="68" text-anchor="middle" font-size="11">H×W</text>
  <text x="710" y="86" text-anchor="middle" font-size="10" class="dgm-muted">mask</text>
  <line x1="710" y1="42" x2="710" y2="18" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-unet)"/>
  <line x1="110" y1="102" x2="150" y2="132" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-unet)"/>
  <line x1="150" y1="182" x2="190" y2="212" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-unet)"/>
  <line x1="190" y1="254" x2="332" y2="306" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-unet)"/>
  <line x1="488" y1="306" x2="630" y2="256" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-unet)"/>
  <line x1="630" y1="212" x2="670" y2="184" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-unet)"/>
  <line x1="670" y1="132" x2="710" y2="104" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-unet)"/>
  <g class="dgm-accent">
    <line x1="156" y1="73" x2="662" y2="73" stroke="currentColor" stroke-width="1.5" stroke-dasharray="5 4" marker-end="url(#arw-unet-skip)"/>
    <line x1="196" y1="158" x2="622" y2="158" stroke="currentColor" stroke-width="1.5" stroke-dasharray="5 4" marker-end="url(#arw-unet-skip)"/>
    <line x1="236" y1="234" x2="582" y2="234" stroke="currentColor" stroke-width="1.5" stroke-dasharray="5 4" marker-end="url(#arw-unet-skip)"/>
  </g>
  <text x="150" y="360" text-anchor="middle" font-size="10" class="dgm-muted">contracting · downsample</text>
  <text x="670" y="360" text-anchor="middle" font-size="10" class="dgm-muted">expanding · upsample</text>
</svg>
<figcaption><b>The U-Net.</b> The encoder downsamples to capture context and the decoder upsamples to restore resolution; dashed skip connections concatenate encoder features onto the decoder so fine detail survives.</figcaption>
</figure>

## Learning to Enlarge

But how does a network *grow* an image? Simple **upsampling** (unpooling) offers
fixed recipes — nearest-neighbor copying, bilinear interpolation, or the sparse
"bed of nails." The more powerful option is **transposed convolution** (also called
up-convolution or deconvolution), which turns enlargement into a *learned*
operation: by padding and convolving, it increases resolution with a kernel trained
by backpropagation. Training a U-Net therefore requires pixel-level labels and the
ability to backpropagate through these new layers — upsampling behaves like the
inverse of the max-pool's routing, and de-convolution like the inverse of
convolution.

## Scoring the Cut

A segmentation is only as good as its agreement with ground truth, and two overlap
metrics dominate. **Intersection over Union** measures the shared area against the
combined area,

$$
\mathrm{IoU}=\frac{\lvert P\cap G\rvert}{\lvert P\cup G\rvert},
$$

while the **Dice coefficient** weights the intersection more generously,

$$
\mathrm{Dice}=\frac{2\lvert P\cap G\rvert}{\lvert P\rvert+\lvert G\rvert}.
$$

Both live on $[0,1]$; both reward masks that land squarely on the object and punish
those that spill over or fall short.

## Why It Matters

Segmentation is where computer vision stops describing pictures and starts
*understanding scenes*. The graph-based methods reveal how far careful classical
reasoning can go with nothing but pixel similarities; Selective Search shows how
those regions feed detection; and the U-Net demonstrates the modern lesson that
resolution lost to pooling can be *learned* back through transposed convolution and
skip connections. That same U-shaped blueprint now sits at the heart of diffusion
models that generate images from noise — proof that a good idea about carving pixels
apart can, years later, help stitch entirely new ones together.
