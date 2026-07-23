---
course: applications-of-ml
lectureId: L10
title: "From Patches to Pictures: The Machinery That Learned to See and Dream"
deck: "Chop an image into squares, drown a photo in noise and teach a network to claw it back, then bolt on a few new weights — a tour of the generative models remaking computer vision."
order: 9
date: 2026-02-11
readingTime: 12
tags: ["vision-transformers", "diffusion", "vae", "adapters", "generative-models"]
concepts:
  - id: vision-transformer
    term: Vision Transformer (ViT)
    definition: "A transformer applied to images by splitting a picture into fixed-size patches, linearly projecting each into a patch embedding, adding positional encodings, and then processing the sequence exactly as a text transformer would."
  - id: autoencoder
    term: Autoencoder
    definition: "A network that encodes an input into a compact representation and decodes that representation back into the original, learning a useful bottleneck by trying to reconstruct what it was given."
  - id: denoising-autoencoder
    term: Denoising Autoencoder
    definition: "An autoencoder trained to map corrupted, noisy input to its clean version, forcing it to learn how to strip noise from data drawn from some underlying distribution."
  - id: variational-autoencoder
    term: Variational Autoencoder (VAE)
    definition: "An autoencoder that encodes each observation not as a single vector but as a probability distribution, outputting a mean and standard deviation from which a latent sample is drawn."
  - id: diffusion-model
    term: Diffusion Model
    definition: "A generative model that gradually destroys data with Gaussian noise over many steps and learns to reverse that process, so new samples can be produced by denoising pure noise."
  - id: adapters
    term: Adapters and LoRA
    definition: "Small trainable weight modules injected into a frozen pretrained network; low-rank adapters (LoRA) factor the added weights into two thin matrices to keep the number of new parameters tiny."
---

The transformer conquered language by learning to pay attention to every word at
once. This lecture follows that same machinery as it escapes text and turns to
images — and then keeps going, into a family of *generative* models that do not
merely classify what they see but learn to manufacture it. The arc runs from the
Vision Transformer, which teaches attention to read a photograph, through
autoencoders and their probabilistic cousins, to diffusion models that conjure
images out of static. It ends, fittingly, with adapters: the frugal trick for
teaching any of these pretrained giants a new skill without retraining it whole.

## Transformers Learn to See

The insight behind the **Vision Transformer** is that, just as in language, the
information that matters for a task lives at different locations in the input —
precisely the problem attention was built to solve. The only obstacle is that a
transformer consumes a *sequence of embeddings*, and an image is a grid of pixels.
The fix is disarmingly direct: divide the image into a set of fixed-size square
**patches**, push each patch through a linear projection to turn it into a vector
— its **patch embedding** — and add a positional encoding so the model knows where
each patch sat in the original grid. After that, *the rest is all the same*: the
identical stack of self-attention and feed-forward layers that processes words now
processes patches. Formally, a patch $x_i$ flattened to a vector becomes

$$
z_i = x_i E + e_i^{\text{pos}}, \qquad E \in \mathbb{R}^{(P^2 C) \times d},
$$

where $P$ is the patch side length, $C$ the number of color channels, $E$ the
learned projection, and $e_i^{\text{pos}}$ the positional signal. A photograph is
thereby reduced to a sentence of visual tokens.

<figure>
<svg viewBox="0 0 780 224" role="img" aria-label="Vision Transformer patch embedding: an image is split into patches, each patch is flattened and linearly projected, a positional encoding is added, and the resulting token sequence is fed to a transformer.">
  <defs>
    <marker id="arw-vit" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" class="dgm-fill"/>
    </marker>
  </defs>
  <rect x="24" y="64" width="104" height="104" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <line x1="58.7" y1="64" x2="58.7" y2="168" stroke="currentColor" stroke-width="1.5"/>
  <line x1="93.3" y1="64" x2="93.3" y2="168" stroke="currentColor" stroke-width="1.5"/>
  <line x1="24" y1="98.7" x2="128" y2="98.7" stroke="currentColor" stroke-width="1.5"/>
  <line x1="24" y1="133.3" x2="128" y2="133.3" stroke="currentColor" stroke-width="1.5"/>
  <g class="dgm-accent">
    <rect x="24" y="64" width="34.7" height="34.7" class="dgm-soft" stroke="currentColor" stroke-width="1.5"/>
  </g>
  <text x="76" y="188" text-anchor="middle" font-size="12">image</text>
  <text x="150" y="104" text-anchor="middle" font-size="11" class="dgm-muted">xᵢ</text>
  <line x1="130" y1="116" x2="172" y2="116" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-vit)"/>
  <rect x="176" y="92" width="86" height="48" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="219" y="112" text-anchor="middle" font-size="14" font-weight="700">× E</text>
  <text x="219" y="130" text-anchor="middle" font-size="10" class="dgm-muted">projection</text>
  <line x1="262" y1="116" x2="300" y2="116" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-vit)"/>
  <circle cx="326" cy="116" r="19" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="326" y="122" text-anchor="middle" font-size="17" font-weight="700">+</text>
  <rect x="292" y="176" width="68" height="30" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="326" y="196" text-anchor="middle" font-size="11">position</text>
  <line x1="326" y1="176" x2="326" y2="137" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-vit)"/>
  <line x1="345" y1="116" x2="388" y2="116" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-vit)"/>
  <rect x="392" y="94" width="28" height="44" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <rect x="424" y="94" width="28" height="44" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <rect x="456" y="94" width="28" height="44" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="504" y="122" text-anchor="middle" font-size="15">…</text>
  <text x="452" y="170" text-anchor="middle" font-size="11" class="dgm-muted">tokens z₁ … zₙ</text>
  <line x1="518" y1="116" x2="552" y2="116" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-vit)"/>
  <rect x="556" y="86" width="200" height="60" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="656" y="112" text-anchor="middle" font-size="14" font-weight="700">Transformer encoder</text>
  <text x="656" y="130" text-anchor="middle" font-size="10" class="dgm-muted">self-attention · MLP</text>
</svg>
<figcaption><b>Reading an image as a sentence</b> Each patch is flattened, projected by <em>E</em>, and given a positional code; the resulting tokens flow into the same transformer that processes words.</figcaption>
</figure>

## Squeeze, Then Rebuild

The generative half of the lecture is built on a humbler idea. An **autoencoder**
learns to *encode* an input into some new, usually compressed representation and
then *decode* that representation back into the original data. What happens inside
the encoder and decoder is task dependent, but the overarching goal is
reconstruction: by forcing information through a narrow bottleneck and demanding
the output match the input, the network is pressured to keep only what matters.

A small twist yields something surprisingly powerful. Feed the network *noisy*
data as input while asking it to reproduce the *clean* version as target, and you
have a **denoising autoencoder**. To succeed, it must learn how to remove noise
from inputs that follow some underlying — possibly unknown — distribution. That
single idea, learning to undo corruption, is the seed from which diffusion models
grow.

## From Points to Distributions

A **variational autoencoder** takes the next conceptual step. Where a traditional
autoencoder encodes an observation as a fixed feature vector, a VAE encodes it as
a *probability distribution*. Given a latent space of size $K$, the encoder emits
two vectors,

$$
\boldsymbol{\mu},\, \boldsymbol{\sigma} \in \mathbb{R}^{1 \times K},
$$

interpreted as the means and standard deviations of a distribution over the latent
space. The actual latent representation is then *sampled* from that distribution
during the forward pass — in practice via the reparameterization
$z = \boldsymbol{\mu} + \boldsymbol{\sigma} \odot \epsilon$ with
$\epsilon \sim \mathcal{N}(0, I)$, which keeps the sampling differentiable. By
learning distributions rather than points, the VAE turns its latent space into
something you can draw *new* samples from, making it a genuine generative model
rather than a mere compressor.

## Teaching a Network to Un-Destroy

**Diffusion models** industrialize the denoising idea into a striking two-phase
recipe. In training, a *forward process* gradually diffuses a data point with
random Gaussian noise, step by step, until the original is entirely destroyed.
Each step adds a little noise:

$$
q(x_t \mid x_{t-1}) = \mathcal{N}\!\left(x_t;\, \sqrt{1 - \beta_t}\, x_{t-1},\; \beta_t I\right),
$$

where the schedule $\beta_t$ controls how much noise enters at step $t$. A
convenient consequence is that you can jump straight to any step in closed form,
$x_t = \sqrt{\bar\alpha_t}\, x_0 + \sqrt{1 - \bar\alpha_t}\, \epsilon$ with
$\alpha_t = 1 - \beta_t$ and $\bar\alpha_t = \prod_{s=1}^{t} \alpha_s$. The model's
real job is to learn the **reverse process** — to undo one step of noising —

$$
p_\theta(x_{t-1} \mid x_t) = \mathcal{N}\!\left(x_{t-1};\, \mu_\theta(x_t, t),\, \Sigma_\theta(x_t, t)\right).
$$

In the DDPM formulation this reduces to a remarkably simple training target: at a
random step, predict the noise that was added, minimizing

$$
\mathcal{L} = \mathbb{E}_{t, x_0, \epsilon}\!\left[\left\lVert \epsilon - \epsilon_\theta(x_t, t) \right\rVert^2\right].
$$

To *generate*, you start from pure noise and run the learned reverse process
repeatedly, denoising your way to a clean, novel observation. Destruction is
trivial; learning to reverse it is where the magic lives.

<figure>
<svg viewBox="0 0 780 230" role="img" aria-label="Diffusion as a Markov chain: a forward process adds Gaussian noise to data step by step until it is pure noise, and a learned reverse process denoises back to a clean sample.">
  <defs>
    <marker id="arw-diff" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" class="dgm-fill"/>
    </marker>
  </defs>
  <text x="390" y="26" text-anchor="middle" font-size="12">forward process: add noise  q(xₜ | xₜ₋₁)</text>
  <rect x="43" y="78" width="54" height="56" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <rect x="193" y="78" width="54" height="56" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <rect x="513" y="78" width="54" height="56" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <rect x="673" y="78" width="54" height="56" class="dgm-soft" stroke="currentColor" stroke-width="1.5"/>
  <text x="380" y="112" text-anchor="middle" font-size="18">…</text>
  <text x="70" y="152" text-anchor="middle" font-size="13" font-weight="700">x<tspan dy="4" font-size="9">0</tspan></text>
  <text x="70" y="168" text-anchor="middle" font-size="10" class="dgm-muted">clean data</text>
  <text x="220" y="152" text-anchor="middle" font-size="13" font-weight="700">x<tspan dy="4" font-size="9">1</tspan></text>
  <text x="540" y="152" text-anchor="middle" font-size="13" font-weight="700">x<tspan dy="4" font-size="9">T-1</tspan></text>
  <text x="700" y="152" text-anchor="middle" font-size="13" font-weight="700">x<tspan dy="4" font-size="9">T</tspan></text>
  <text x="700" y="168" text-anchor="middle" font-size="10" class="dgm-muted">pure noise</text>
  <path d="M97 84 Q145 54 191 84" fill="none" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-diff)"/>
  <path d="M247 82 Q380 50 511 82" fill="none" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-diff)"/>
  <path d="M567 84 Q620 54 671 84" fill="none" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-diff)"/>
  <g class="dgm-accent">
    <path d="M673 130 Q620 160 569 130" fill="none" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-diff)"/>
    <path d="M513 132 Q380 166 249 132" fill="none" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-diff)"/>
    <path d="M193 130 Q145 160 99 130" fill="none" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-diff)"/>
    <text x="390" y="214" text-anchor="middle" font-size="12">reverse process: learned denoising  pθ(xₜ₋₁ | xₜ)</text>
  </g>
</svg>
<figcaption><b>Noise, then back again</b> The forward chain corrupts data into noise with a fixed schedule; the model learns only the highlighted reverse steps, which turn pure noise into new samples.</figcaption>
</figure>

## Bolting On New Skills

The lecture closes by returning to adaptation. Transfer learning, seen earlier,
removed the end of a pretrained network and replaced it with a new trainable
piece, optionally freezing the rest. **Adapters** generalize this: instead of only
swapping the head, they *inject* additional trainable weights into the network to
work *alongside* what was already learned, leaving the pretrained weights frozen.

**Low-Rank Adapters (LoRA)** make those injected weights cheap. Suppose an adapter
must map $p$ features to $q$ features. A single fully connected layer would need
$pq$ weights. LoRA instead factors the transformation through a thin inner
dimension $m < p, q$, using two matrices $A \in \mathbb{R}^{p \times m}$ and
$B \in \mathbb{R}^{m \times q}$, so the frozen weight $W$ gains a low-rank update:

$$
W' = W + AB, \qquad \text{trainable parameters} = pm + mq \;\ll\; pq.
$$

One frozen backbone can then host many small adapters, each a different
specialization, swapped in and out at will.

## Why It Matters

These models rhyme with one another. The Vision Transformer shows that attention
is not a language trick but a general way to route information; autoencoders,
denoisers, VAEs, and diffusion form a ladder in which each rung — reconstruct,
denoise, distribute, iterate — builds directly on the last. Diffusion in
particular now underwrites the image and video generators reshaping media, and it
is nothing more than a denoising autoencoder taught to work in many small steps.
Adapters and LoRA, meanwhile, are what make deploying these giants practical: a
single pretrained model, frozen once, can be nudged toward countless tasks for a
sliver of the cost. The lesson is that a few reusable ideas — patch it, encode it,
corrupt it and learn the way back, then adapt it cheaply — compose into the
machinery behind machines that both see and dream.
