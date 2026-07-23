---
course: applications-of-ml
lectureId: L01
title: "A Traveler's Map of the Machine-Learning Frontier"
deck: "Before the deep dives begin, a survey of the whole territory — from the pixels of computer vision to the tokens of large language models, and the single gradient-powered engine that drives them all."
order: 1
date: 2026-01-08
readingTime: 9
tags: ["overview", "computer-vision", "generative-ai", "nlp", "deep-learning"]
concepts:
  - id: gradient-based-learning
    term: Gradient-Based Learning
    definition: "The unifying training paradigm of modern AI: adjust a model's parameters by repeatedly nudging them in the direction that most reduces a loss function. Every architecture in this course is trained this way."
  - id: computer-vision
    term: Computer Vision
    definition: "The application area concerned with teaching machines to interpret images, spanning hand-engineered features like HOG through deep convolutional networks."
  - id: convolutional-neural-network
    term: Convolutional Neural Network
    definition: "An image-oriented architecture that learns stacks of small filters, whose deepening layers drove the dramatic accuracy gains of the 2010s."
  - id: generative-adversarial-network
    term: Generative Adversarial Network
    definition: "A generative model framed as a game between a generator that fabricates data and a discriminator that tries to tell real from fake."
  - id: natural-language-processing
    term: Natural Language Processing
    definition: "The application area concerned with representing and modeling human language, from one-hot vectors and n-grams to Word2Vec and transformers."
  - id: large-language-model
    term: Large Language Model
    definition: "A transformer-based model of language trained at massive scale, adapted to new tasks through fine-tuning and lightweight adapters."
  - id: reinforcement-learning
    term: Reinforcement Learning
    definition: "A neighboring branch of machine learning in which an agent learns by interacting with an environment and maximizing a reward signal."
---

Every field has a moment before the real work begins — the unrolling of the map, the tracing of the routes, the naming of the mountain ranges you are about to cross. This is that moment. Before we open the engine of a neural network or watch a machine hallucinate a photograph that never existed, it is worth standing on the ridge and looking out over the whole country of applied machine learning: where its provinces lie, how they were settled, and what road connects them. The surprising answer to that last question is that a single road runs through all of it.

<figure>
<svg viewBox="0 0 860 320" role="img" aria-label="A central gradient-based-learning engine connects to four application areas: computer vision, generative models, sequence and language, and reinforcement learning.">
  <defs>
    <marker id="arw-map" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" class="dgm-fill"/>
    </marker>
  </defs>
  <g class="dgm-accent">
    <rect x="40" y="120" width="200" height="90" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <text x="140" y="158" text-anchor="middle" font-size="14" font-weight="700">Gradient-Based</text>
    <text x="140" y="178" text-anchor="middle" font-size="14" font-weight="700">Learning</text>
  </g>
  <text x="140" y="232" text-anchor="middle" font-size="11" class="dgm-muted">one shared engine</text>
  <line x1="242" y1="165" x2="552" y2="52" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-map)"/>
  <line x1="242" y1="165" x2="552" y2="124" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-map)"/>
  <line x1="242" y1="165" x2="552" y2="196" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-map)"/>
  <line x1="242" y1="165" x2="552" y2="268" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-map)"/>
  <rect x="560" y="24" width="270" height="56" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="695" y="49" text-anchor="middle" font-size="13" font-weight="700">Computer Vision</text>
  <text x="695" y="67" text-anchor="middle" font-size="10" class="dgm-muted">HOG → CNN → ImageNet</text>
  <rect x="560" y="96" width="270" height="56" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="695" y="121" text-anchor="middle" font-size="13" font-weight="700">Generative Models</text>
  <text x="695" y="139" text-anchor="middle" font-size="10" class="dgm-muted">GANs, U-Net, deepfakes</text>
  <rect x="560" y="168" width="270" height="56" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="695" y="193" text-anchor="middle" font-size="13" font-weight="700">Sequence &amp; Language</text>
  <text x="695" y="211" text-anchor="middle" font-size="10" class="dgm-muted">RNN → attention → LLMs</text>
  <rect x="560" y="240" width="270" height="56" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="695" y="265" text-anchor="middle" font-size="13" font-weight="700">Reinforcement Learning</text>
  <text x="695" y="283" text-anchor="middle" font-size="10" class="dgm-muted">agent · reward · RLHF</text>
</svg>
<figcaption><b>The map of provinces</b> Every application area in the course is trained the same way — by descending the gradient of a loss — so one engine drives them all.</figcaption>
</figure>

## Three Courses, One Idea

This course sits in the middle of a trilogy. The first, a course in the *fundamentals*, is a breadth survey of traditional machine learning: objective functions, evaluation, generalization, and the classic algorithms that came before the deep-learning era. The third is a deep dive into *deep learning* itself — the inner machinery of forward and backward propagation, adaptive learning rates, and the modular building blocks of modern architectures.

We occupy the applications tier. Our job is to introduce **gradient-based learning**, then tour the places it has conquered: the common applications of machine learning, a closer look at generative AI, a survey of the landmark papers, and hands-on use and training of the architectures that define the state of the art. The through-line — the road that connects every province on the map — is that all of these systems learn the same way. They define a measure of how wrong they are and then descend its gradient, step by step, until the errors shrink. Vision, language, generation: different destinations, identical vehicle.

<figure>
<svg viewBox="0 0 820 175" role="img" aria-label="A three-stage course arc: fundamentals, then applications (the current course, highlighted), then deep learning.">
  <defs>
    <marker id="arw-arc" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" class="dgm-fill"/>
    </marker>
  </defs>
  <rect x="20" y="52" width="220" height="72" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="130" y="84" text-anchor="middle" font-size="14" font-weight="700">Fundamentals</text>
  <text x="130" y="104" text-anchor="middle" font-size="10" class="dgm-muted">classic ML, evaluation</text>
  <line x1="244" y1="88" x2="296" y2="88" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-arc)"/>
  <g class="dgm-accent">
    <rect x="300" y="52" width="220" height="72" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <text x="410" y="84" text-anchor="middle" font-size="14" font-weight="700">Applications</text>
    <text x="410" y="104" text-anchor="middle" font-size="10">you are here</text>
  </g>
  <line x1="524" y1="88" x2="576" y2="88" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-arc)"/>
  <rect x="580" y="52" width="220" height="72" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="690" y="84" text-anchor="middle" font-size="14" font-weight="700">Deep Learning</text>
  <text x="690" y="104" text-anchor="middle" font-size="10" class="dgm-muted">forward/back-prop internals</text>
</svg>
<figcaption><b>The three-course arc</b> This applications course sits between a breadth survey of the fundamentals and a deep dive into the internals of deep learning.</figcaption>
</figure>

## The Eye: Computer Vision

The oldest province is **computer vision**. It begins with something deceptively simple — how an image is even represented. A binary image is a grid of ones and zeros; a grayscale image, a grid of intensities; a color image, three stacked grids for red, green, and blue. Once a picture is just a matrix of numbers, it becomes something a model can compute over.

For decades the craft lay in *hand-designing* features that summarized those numbers — descriptors like the **Histogram of Oriented Gradients**, which characterized a region by the directions of its edges. Progress was real but slow. Then the **convolutional neural network** arrived and rewrote the ledger. Rather than hand-craft what to look for, a CNN *learns* its filters from data. The consequences were seismic. On the ImageNet benchmark, top-5 error fell from roughly 28% to 3.57% in a handful of years, a stretch often called the "revolution of depth": AlexNet (eight layers, 2012) cut error to about 16%; VGG (nineteen layers) and GoogleNet (twenty-two layers) pushed it near 7%; and ResNet, at a hundred and fifty-two layers, reached 3.57% in 2015. Depth, it turned out, was destiny.

<figure>
<svg viewBox="0 0 820 340" role="img" aria-label="ImageNet top-5 error falling as network depth grows, from about 28 percent for hand-crafted features to 3.57 percent for a 152-layer ResNet.">
  <defs>
    <marker id="arw-depth" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" class="dgm-fill dgm-accent"/>
    </marker>
  </defs>
  <g class="dgm-muted">
    <line x1="70" y1="26" x2="70" y2="290" stroke="currentColor" stroke-width="1.5"/>
    <line x1="70" y1="290" x2="782" y2="290" stroke="currentColor" stroke-width="1.5"/>
    <text x="74" y="18" text-anchor="middle" font-size="11">top-5 error</text>
    <text x="426" y="322" text-anchor="middle" font-size="11">deeper networks, later years →</text>
    <text x="150" y="101" text-anchor="middle" font-size="10">hand-crafted</text>
    <text x="300" y="159" text-anchor="middle" font-size="10">AlexNet · 8L</text>
    <text x="470" y="231" text-anchor="middle" font-size="10">VGG · GoogleNet</text>
    <text x="470" y="245" text-anchor="middle" font-size="10">19–22 layers</text>
    <text x="660" y="279" text-anchor="middle" font-size="10">ResNet · 152L</text>
  </g>
  <g class="dgm-accent">
    <line x1="150" y1="80" x2="300" y2="138" stroke="currentColor" stroke-width="1.5"/>
    <line x1="300" y1="138" x2="470" y2="210" stroke="currentColor" stroke-width="1.5"/>
    <line x1="470" y1="210" x2="660" y2="255" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-depth)"/>
    <circle cx="150" cy="80" r="4" class="dgm-fill"/>
    <circle cx="300" cy="138" r="4" class="dgm-fill"/>
    <circle cx="470" cy="210" r="4" class="dgm-fill"/>
    <text x="150" y="68" text-anchor="middle" font-size="12" font-weight="700">28%</text>
    <text x="300" y="126" text-anchor="middle" font-size="12" font-weight="700">16%</text>
    <text x="470" y="198" text-anchor="middle" font-size="12" font-weight="700">≈7%</text>
    <text x="660" y="243" text-anchor="middle" font-size="13" font-weight="700">3.57%</text>
  </g>
</svg>
<figcaption><b>The revolution of depth</b> As networks grew from AlexNet's eight layers to ResNet's 152, ImageNet top-5 error collapsed from roughly 28% to 3.57%.</figcaption>
</figure>

## The Imagination: Generative Models

If vision taught machines to *recognize*, generative modeling taught them to *create*. The signature idea is the **generative adversarial network**, best understood as a game between two players. A generator tries to fabricate realistic-looking data; a discriminator tries to distinguish the real training examples from the generator's fakes. As each improves, it forces the other to improve, and the counterfeits grow uncannily convincing.

Generation has other engines too. U-Net architectures power tasks like image super-resolution, sharpening blurred inputs into crisp detail. The same generative fluency underwrites deepfakes — synthesized faces and voices that raise as many ethical questions as technical ones. Creation, once the exclusive province of authorship, became something a loss function could optimize.

## Memory, Sequence, and the Tongue

Language and time-series data introduced a new demand: **sequence**. Early sequence models — recurrent neural networks, and their gated descendants the GRU and the LSTM — read one element at a time, carrying a running memory forward. They were the workhorses of translation and speech before a better idea displaced them.

That better idea grew out of **natural language processing**, a province with its own long history of representation. Words were first encoded as *one-hot vectors* — a single 1 in a sea of 0s — then as *bags of words*, *n-grams*, and finally learned embeddings like *Word2Vec* that placed words with similar meanings near one another in space. The breakthrough came when **attention and transformers** let a model weigh every word against every other word at once, discarding the sequential bottleneck of recurrence. Scaled up, the same architecture became the **large language model**, and the same attention machinery even returned to vision as the visual transformer.

## The Frontier: Adapters, Control, and Reward

At the frontier, the question is no longer only how to *train* these giants but how to *steer* them. A family of **adapters** now bends pretrained models to new purposes without retraining them wholesale: LoRA (Low-Rank Adaptation) fine-tunes a language model cheaply; IP-Adapter conditions image generation on a reference; Sora extends generation to video; and ControlNet grants precise, controllable guidance over what a generator produces.

Beyond this course's core provinces lies another major territory on the wider map — **reinforcement learning**, where an agent learns not from labeled examples but by acting in an environment and chasing a reward. It is the paradigm behind game-playing systems and an increasingly important ingredient in aligning large models to human preferences. We will keep it in view even as we focus our expedition on vision, generation, and language.

## Why It Matters

The temptation, surveying so many architectures, is to see a bewildering zoo of unrelated tricks. The truth is the opposite. A convolutional classifier, an adversarial generator, and a hundred-billion-parameter language model are, underneath, the same kind of machine: a differentiable function whose parameters are tuned by descending the gradient of a loss. Master that one idea and every province on this map becomes reachable by the same road. The rest of the term is simply the journey — learning, application by application, how far that single engine can carry us.
