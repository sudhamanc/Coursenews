---
course: applications-of-ml
lectureId: L06
title: "Not What, But Where: The Hunt for Objects in an Image"
deck: "Classification says a photo contains a dog. Detection must draw the box around it — and around the three others, the bicycle, and the stop sign. The road from sliding windows to YOLO is a story about doing more while looking less."
order: 5
date: 2026-01-16
readingTime: 8
tags: ["object-detection", "yolo", "r-cnn", "bounding-boxes", "computer-vision"]
concepts:
  - id: object-detection
    term: Object Detection
    definition: "The task of locating and classifying multiple objects within a single image, reporting a bounding box and label for each rather than one verdict for the whole frame."
  - id: bounding-box
    term: Bounding Box
    definition: "An axis-aligned rectangle that localizes an object, typically encoded by its coordinates plus a confidence score."
  - id: r-cnn
    term: R-CNN Family
    definition: "A lineage of region-proposal detectors — R-CNN, Fast R-CNN, and Faster R-CNN — that progressively fold region generation and classification into a single trainable network."
  - id: anchor-box
    term: Anchor Box
    definition: "A predefined reference rectangle of a fixed scale and aspect ratio, tiled across the feature map, against which the network predicts offsets and an objectness score."
  - id: yolo
    term: YOLO (Single-Shot Detection)
    definition: "You Only Look Once divides the image into a grid and, in one network pass, predicts bounding boxes, class labels, and confidences for every cell."
  - id: non-max-suppression
    term: Non-Maximum Suppression
    definition: "A greedy cleanup step that keeps the highest-confidence box and discards overlapping duplicates whose IoU with it exceeds a threshold."
  - id: iou
    term: Intersection over Union
    definition: "An overlap metric equal to the area of intersection between a predicted and a ground-truth box divided by the area of their union."
  - id: mean-average-precision
    term: Mean Average Precision (mAP)
    definition: "The standard detection benchmark: the area under each class's precision–recall curve (Average Precision), averaged across all classes at a chosen IoU threshold."
---

Classification answers a narrow question — *what is this a picture of?* — and
answers it about the whole frame at once. But the world rarely arranges itself one
object to a photograph. A street scene holds pedestrians, cars, signs, and bicycles
simultaneously, each somewhere specific. **Object detection** is the task of finding
*multiple* things at *multiple* locations, and reporting not just their labels but
their coordinates.

## Beyond the Whole-Image Verdict

A convolutional network trained for classification collapses an entire image into a
single verdict. Detection demands more: for every object present, the model must
emit a **bounding box** — an axis-aligned rectangle localizing the object —
together with a class label and a confidence. The difficulty is that the *number*
of objects is unknown in advance, so the architecture cannot simply output a
fixed-length answer.

## The Brute-Force Era

The classical solution was the **sliding window**. Build an *image pyramid* — the
same image rescaled to several sizes — so that objects can be caught at different
scales, then slide a fixed window across every location at every scale, classifying
each crop. It works, but it is punishingly expensive: the number of windows
explodes, and the vast majority contain nothing at all.

## Regions with CNNs

**R-CNN** (2013) cut the waste by looking at *promising* regions rather than all of
them. Its pipeline has four stages: take the input image; generate about two
thousand **region proposals** using Selective Search; warp each region to a fixed
size and push it through a CNN to extract a feature vector; and finally classify
each region with an SVM, background included.

The bottleneck was obvious — two thousand CNN passes per image. **Fast R-CNN**, from
the same authors, fixed it by computing convolution *once*: region proposals are
projected onto the shared convolutional feature map instead of the raw pixels, so
features are extracted a single time and reused. **Faster R-CNN** removed the last
slow piece — Selective Search itself — by introducing a **Region Proposal Network**
that reads the feature map and predicts proposals directly. For the first time the
proposal step was *trainable*, folded into the same network as detection.

## The Reference Rectangles

The Region Proposal Network leans on **anchor boxes**: a set of predefined reference
rectangles of assorted scales and aspect ratios, tiled across every location of the
feature map. Rather than conjure coordinates from nothing, the network predicts
*offsets* to these anchors and an objectness score for each — turning the open-ended
problem of "where are the boxes?" into the far easier one of "which anchors contain
something, and how should they be nudged?"

<figure>
<svg viewBox="0 0 620 320" role="img" aria-label="A feature-map grid with predefined anchor boxes of different scales and aspect ratios tiled at one grid cell, against which the network predicts offsets and an objectness score.">
  <defs>
    <marker id="arw-anchor" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" class="dgm-fill"/>
    </marker>
  </defs>
  <rect x="30" y="40" width="360" height="240" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <line x1="120" y1="40" x2="120" y2="280" stroke="currentColor" stroke-width="1"/>
  <line x1="210" y1="40" x2="210" y2="280" stroke="currentColor" stroke-width="1"/>
  <line x1="300" y1="40" x2="300" y2="280" stroke="currentColor" stroke-width="1"/>
  <line x1="30" y1="120" x2="390" y2="120" stroke="currentColor" stroke-width="1"/>
  <line x1="30" y1="200" x2="390" y2="200" stroke="currentColor" stroke-width="1"/>
  <text x="210" y="30" text-anchor="middle" font-size="11" class="dgm-muted">feature map (S × S cells)</text>
  <g class="dgm-accent">
    <rect x="205" y="130" width="100" height="60" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <rect x="225" y="110" width="60" height="100" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <rect x="215" y="125" width="80" height="70" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <circle cx="255" cy="160" r="3" class="dgm-fill"/>
  </g>
  <text x="255" y="304" text-anchor="middle" font-size="11" class="dgm-accent">anchors at one location</text>
  <line x1="310" y1="160" x2="420" y2="150" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-anchor)"/>
  <text x="512" y="122" text-anchor="middle" font-size="12" font-weight="700">predict</text>
  <text x="512" y="144" text-anchor="middle" font-size="11">offsets (Δx, Δy, Δw, Δh)</text>
  <text x="512" y="166" text-anchor="middle" font-size="11">+ objectness score</text>
</svg>
<figcaption><b>Anchor boxes.</b> Reference rectangles of several scales and aspect ratios are tiled at every cell; the network only predicts offsets to them plus an objectness score.</figcaption>
</figure>

## Looking Once

The R-CNN lineage still separates proposal from classification. **YOLO** — *You Only
Look Once* (2015) — fused them into a single pass. It divides the image into an
$S\times S$ grid; each cell predicts $B$ bounding boxes relative to its own
position, along with a class label and a probability. One network, evaluated once,
yields a tensor of shape $S\times S\times(5B+C)$ — five numbers per box (four
coordinates plus a confidence) and $C$ class scores per cell. The payoff is speed:
YOLO ran orders of magnitude faster than its contemporaries, fast enough for
real-time video.

## The Overlap Score

Whether a predicted box is "correct" is judged by **Intersection over Union**, the
ratio of the overlap between a predicted box and the ground-truth box to their
combined area:

$$
\mathrm{IoU}(B_p,B_{gt})=\frac{\operatorname{area}(B_p\cap B_{gt})}{\operatorname{area}(B_p\cup B_{gt})}.
$$

A detection is usually counted as a true positive when its IoU with a real object
clears a threshold such as $0.5$.

<figure>
<svg viewBox="0 0 720 250" role="img" aria-label="Two overlapping rectangles, a ground-truth box and a predicted box, with their intersection shaded; IoU equals the intersection area divided by the union area.">
  <rect x="60" y="55" width="190" height="140" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="110" y="46" text-anchor="middle" font-size="11">ground truth</text>
  <g class="dgm-accent">
    <rect x="170" y="100" width="190" height="120" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <text x="320" y="238" text-anchor="middle" font-size="11">predicted</text>
  </g>
  <rect x="170" y="100" width="80" height="95" class="dgm-soft"/>
  <text x="210" y="152" text-anchor="middle" font-size="13" font-weight="700">∩</text>
  <text x="450" y="118" text-anchor="middle" font-size="15">IoU =</text>
  <text x="585" y="104" text-anchor="middle" font-size="12">area(P ∩ G)</text>
  <line x1="512" y1="112" x2="658" y2="112" stroke="currentColor" stroke-width="1.5"/>
  <text x="585" y="132" text-anchor="middle" font-size="12">area(P ∪ G)</text>
</svg>
<figcaption><b>Intersection over union.</b> The shaded overlap between the predicted box and the ground truth, divided by the area their union covers, scores how well a detection lands.</figcaption>
</figure>

## Thinning the Herd

A single-shot detector like YOLO produces many overlapping boxes around the same
object. **Non-maximum suppression** prunes them:

```text
sort detections by confidence (high to low)
while boxes remain:
    keep the highest-scoring box B
    remove every remaining box whose IoU with B exceeds a threshold
```

What survives is one clean box per object instead of a redundant cluster.

<figure>
<svg viewBox="0 0 900 150" role="img" aria-label="Detection pipeline from left to right: image, CNN feature map, anchors and region proposals, classify plus box regression, non-maximum suppression, and final detections.">
  <defs>
    <marker id="arw-detpipe" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" class="dgm-fill"/>
    </marker>
  </defs>
  <rect x="12" y="46" width="104" height="58" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="64" y="80" text-anchor="middle" font-size="12">image</text>
  <line x1="118" y1="75" x2="146" y2="75" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-detpipe)"/>
  <rect x="150" y="46" width="118" height="58" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="209" y="72" text-anchor="middle" font-size="12">CNN</text>
  <text x="209" y="90" text-anchor="middle" font-size="11" class="dgm-muted">feature map</text>
  <line x1="270" y1="75" x2="298" y2="75" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-detpipe)"/>
  <rect x="302" y="46" width="128" height="58" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="366" y="72" text-anchor="middle" font-size="12">anchors /</text>
  <text x="366" y="90" text-anchor="middle" font-size="12">proposals</text>
  <line x1="432" y1="75" x2="460" y2="75" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-detpipe)"/>
  <rect x="464" y="46" width="140" height="58" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="534" y="72" text-anchor="middle" font-size="12">classify +</text>
  <text x="534" y="90" text-anchor="middle" font-size="12">box regress</text>
  <line x1="606" y1="75" x2="634" y2="75" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-detpipe)"/>
  <g class="dgm-accent">
    <rect x="638" y="46" width="92" height="58" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <text x="684" y="80" text-anchor="middle" font-size="13" font-weight="700">NMS</text>
  </g>
  <line x1="732" y1="75" x2="760" y2="75" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-detpipe)"/>
  <rect x="764" y="46" width="124" height="58" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="826" y="80" text-anchor="middle" font-size="12">detections</text>
</svg>
<figcaption><b>The detection pipeline.</b> Successive designs folded each hand-built stage into one network; non-maximum suppression is the final cleanup that removes duplicate boxes.</figcaption>
</figure>

## Grading a Detector

Overall quality is summarized by **mean Average Precision**. For each class,
sweeping the confidence threshold traces a precision–recall curve whose area is the
Average Precision, $\mathrm{AP}=\int_0^1 p(r)\,dr$; averaging over all classes gives

$$
\mathrm{mAP}=\frac{1}{\lvert \text{classes}\rvert}\sum_{c}\mathrm{AP}_c.
$$

It rewards detectors that are simultaneously precise and thorough across every
category, at the chosen IoU threshold.

## Why It Matters

The arc from sliding windows to YOLO is a study in doing more while looking less.
Each generation removed a hand-crafted bottleneck — first the exhaustive scan, then
the redundant convolutions, then Selective Search itself — until the entire
detector, proposals included, became one trainable network. Anchor boxes tamed the
open-ended geometry, IoU and mean Average Precision made progress measurable, and
non-maximum suppression cleaned up the output. Those ingredients now underpin the
perception stacks of autonomous vehicles, medical-imaging triage, and industrial
inspection — anywhere a machine must not only recognize the world but point to
exactly where each piece of it sits.
