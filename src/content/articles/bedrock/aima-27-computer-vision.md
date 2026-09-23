---
course: bedrock
lectureId: AIMA 27
book: "Artificial Intelligence: A Modern Approach"
part: "VI · Communicating, Perceiving, and Acting"
title: "Inverting a Projection That Threw Information Away"
deck: "Vision is inference, not measurement. A camera collapses three dimensions into two, and Chapter 27 is about recovering what the collapse discarded — using physics where it helps and learned priors where physics is not enough."
order: 27
chapter: 27
readingTime: 13
tags: ["vision", "image-formation", "features", "object-detection", "3d-reconstruction"]
concepts:
  - id: vision-as-inverse
    term: Vision as Inverse Graphics
    definition: "Image formation maps a 3D scene to a 2D array; vision inverts that map. The inverse is underdetermined — infinitely many scenes produce the same image — so perception requires priors about which scenes are plausible."
  - id: image-formation
    term: Image Formation
    definition: "Perspective projection through a pinhole or lens, where image position scales as the focal length over depth. Brightness depends jointly on illumination, surface reflectance, and geometry, which is why recovering any one of them alone is ambiguous."
  - id: simple-features
    term: Edges, Gradients, and Texture
    definition: "Edges from intensity gradients, typically via smoothing then differentiation, since differentiation amplifies noise. Optical flow gives apparent motion between frames; texture and gradient statistics give surface cues."
  - id: cnn-classification
    term: Classifying Images
    definition: "Convolutional networks learn a hierarchy from oriented edges through parts to objects, replacing hand-designed feature pipelines. The architecture's locality and translation-invariance priors are what make the learning tractable."
  - id: object-detection
    term: Detecting Objects
    definition: "Localizing as well as classifying, via region proposals with per-region classification, or single-stage detectors that predict boxes and classes directly. Non-maximum suppression resolves duplicate detections of the same object."
  - id: depth-cues
    term: Recovering the Third Dimension
    definition: "Binocular stereo from disparity between two views, structure from motion over a sequence, and monocular cues — shading, texture gradient, familiar size, occlusion, perspective — each individually ambiguous and jointly informative."
  - id: vision-applications
    term: Using Computer Vision
    definition: "Recognition, reconstruction, tracking, and navigation across medical imaging, autonomous driving, industrial inspection, and surveillance — where the ethical weight of the last category is flagged rather than deferred."
  - id: vision-brittleness
    term: Adversarial Examples and Distribution Shift
    definition: "Imperceptible perturbations can change a classification, and performance degrades under conditions absent from training. High benchmark accuracy does not establish that a system perceives the way its accuracy implies."
---

Chapter 27 opens with the observation that governs everything after it: a camera
performs a projection from three dimensions to two, and that projection **throws
information away**. Depth is lost. Occluded surfaces are lost. The separate
contributions of illumination, surface color, and geometry to a pixel's
brightness are conflated into a single number.

Vision is the attempt to invert this. Since the inverse is not unique —
infinitely many scenes project to any given image — vision cannot be measurement.
It is **inference**, and like all inference from insufficient evidence, it
requires priors about which explanations are plausible.

## The Physics

**Perspective projection** through a pinhole gives the basic relation: a point at
distance $Z$ with height $Y$ projects to image height $y = f Y / Z$, where $f$ is
the focal length. Size falls off with depth, parallel lines converge at vanishing
points, and — critically — **size and distance are confounded**. A small nearby
object and a large distant one produce identical images.

Real lenses add depth of field, aberration, and finite aperture, which introduce
blur that is both a nuisance and a depth cue.

The **photometry** is equally consequential. Pixel brightness depends on
illumination, surface reflectance, and surface orientation relative to light and
camera, all multiplied together. Recovering reflectance (what color is the
object) requires knowing illumination and geometry; recovering geometry requires
knowing reflectance and illumination. Each is ambiguous alone, and the chapter's
point is that this is why vision needs priors rather than merely better sensors.

## Classical Features

Before learned representations, vision was built on hand-designed features, and
the chapter covers them because the phenomena they were designed to capture are
real.

**Edges** are intensity discontinuities, found via gradients. The standard
pipeline smooths first and differentiates second, because differentiation
amplifies noise and an unsmoothed gradient is dominated by it. Edges arise from
several distinct physical causes — depth discontinuity, surface orientation
change, reflectance change, illumination boundary — and the image gives no
reliable way to distinguish them, which is a compact illustration of the
underdetermination.

**Optical flow** gives apparent motion between frames, useful for tracking,
segmentation by common motion, and estimating time-to-contact. **Texture**
statistics and texture gradients supply surface orientation cues. **Segmentation**
groups pixels into coherent regions by color, texture, or motion similarity.

## Learned Features

**Convolutional networks** displaced the hand-designed pipelines, and the
chapter's explanation of why is the architectural-prior argument from Chapter 22.
Images have local structure and translation invariance; convolution encodes both
directly, so the network does not have to discover them from data. A fully
connected network on images is not merely inefficient — it lacks the prior that
makes the problem learnable with available data.

What is learned is a hierarchy: early layers respond to oriented edges and color
opponency, middle layers to parts and textures, later layers to object-level
configurations. The chapter notes that the early learned filters resemble both
classical hand-designed detectors and the receptive fields found in visual
cortex, which is suggestive without being decisive.

**Object detection** adds localization. **Two-stage** detectors propose candidate
regions and classify each; **single-stage** detectors predict boxes and class
scores directly in one pass, trading some accuracy for speed. **Non-maximum
suppression** collapses multiple overlapping detections of the same object.
**Semantic segmentation** labels every pixel; **instance segmentation**
additionally separates individual objects of the same class.

<figure>
<svg viewBox="0 0 820 250" role="img" aria-label="A three-dimensional scene projecting through a pinhole onto a two-dimensional image plane, with an arrow showing that inverting the projection is underdetermined because a small near object and a large far object produce the same image.">
  <defs>
    <marker id="arw-aima27-proj" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" class="dgm-fill"/>
    </marker>
  </defs>
  <circle cx="400" cy="112" r="5" class="dgm-fill"/>
  <text x="400" y="94" text-anchor="middle" font-size="10" class="dgm-muted">pinhole</text>
  <line x1="340" y1="52" x2="340" y2="176" stroke="currentColor" stroke-width="1.6"/>
  <text x="318" y="196" text-anchor="middle" font-size="10" class="dgm-muted">image plane</text>
  <g class="dgm-accent-2">
    <rect x="520" y="86" width="22" height="30" fill="none" stroke="currentColor" stroke-width="1.7"/>
    <text x="531" y="76" text-anchor="middle" font-size="9.5">near, small</text>
    <line x1="520" y1="86" x2="405" y2="109" stroke="currentColor" stroke-width="1.2"/>
    <line x1="520" y1="116" x2="405" y2="115" stroke="currentColor" stroke-width="1.2"/>
  </g>
  <g class="dgm-accent">
    <rect x="690" y="66" width="44" height="60" fill="none" stroke="currentColor" stroke-width="1.7"/>
    <text x="712" y="56" text-anchor="middle" font-size="9.5">far, large</text>
    <line x1="690" y1="66" x2="405" y2="109" stroke="currentColor" stroke-width="1.2" stroke-dasharray="4 3"/>
    <line x1="690" y1="126" x2="405" y2="115" stroke="currentColor" stroke-width="1.2" stroke-dasharray="4 3"/>
  </g>
  <line x1="395" y1="109" x2="344" y2="120" stroke="currentColor" stroke-width="2"/>
  <line x1="395" y1="115" x2="344" y2="134" stroke="currentColor" stroke-width="2"/>
  <rect x="332" y="118" width="14" height="18" class="dgm-fill"/>
  <text x="410" y="222" text-anchor="middle" font-size="11.5">both objects produce the <tspan font-weight="700">same image</tspan></text>
  <text x="410" y="244" text-anchor="middle" font-size="10.5" class="dgm-muted">so choosing between them is inference from priors, not measurement</text>
</svg>
<figcaption><b>Why vision cannot be measurement.</b> The projection is many-to-one, so inverting it requires something beyond the image — knowledge about which scenes are plausible.</figcaption>
</figure>

## Getting Depth Back

**Binocular stereo** exploits **disparity**: a point's displacement between two
views is inversely proportional to its depth. Given calibration, depth is
straightforward geometry — and the **correspondence problem**, matching the same
scene point across views, is the hard part, failing on textureless regions where
there is nothing to match and on repeated patterns where everything matches.

**Structure from motion** generalizes this across a sequence from a moving
camera, recovering both scene structure and camera trajectory — the same joint
estimation as SLAM in Chapter 26.

**Monocular cues** are what a single image still affords: shading (which requires
assumptions about illumination), texture gradients, familiar size, occlusion
ordering, and linear perspective. Each is individually ambiguous, which is why
they are combined — and why depth from a single image is inherently a prior-driven
inference rather than a measurement.

## Using It

The applications section covers recognition, reconstruction, tracking, and
navigation, across medical imaging, autonomous driving, industrial inspection,
agriculture, and surveillance.

The chapter's treatment of **failure modes** is what makes it worth reading
alongside benchmark results. **Adversarial examples** — imperceptible
perturbations that flip a classification — demonstrate that the learned decision
boundary does not align with human perception in the way accuracy figures imply.
**Distribution shift** degrades performance under conditions absent from
training: weather, lighting, viewpoint, demographic composition. And documented
**disparities in accuracy across skin tones** in face analysis are cited
directly, as is the ethical weight of surveillance applications. The chapter does
not defer this to Chapter 28, which is the right call.

## Why It Matters

Vision is the clearest case in the book of the **inverse-problem** structure:
observations underdetermine the world, so perception requires priors, and the
quality of a perceptual system is the quality of its priors as much as the
quality of its sensors. That framing applies to any estimation problem where
observations are incomplete — which is most of them.

It is also where the book's architectural-prior argument is most visible.
Convolution works because the prior it encodes is true of images. The same
architecture on data without spatial locality gains nothing, which is the test
of whether an architectural choice is a genuine prior or a habit.

And the brittleness material supplies the correct posture toward benchmark
numbers. A system with high accuracy on a test set drawn from the same
distribution as its training data has demonstrated something narrower than
perception. The chapter says so in the chapter where the numbers are most
impressive, which is the right place to say it.
