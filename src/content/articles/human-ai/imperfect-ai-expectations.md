---
course: human-ai
lectureId: R3
title: "Fifty Percent, Twice"
deck: "Two versions of the same assistant made exactly as many mistakes — and users rated one dramatically more accurate than the other. A CHI study on shaping expectations finds that what people judge is not accuracy but the cost of cleaning up after it."
order: 11
readingTime: 12
tags: ["expectations", "precision-recall", "onboarding", "acceptance", "recovery-cost"]
concepts:
  - id: expectation-confirmation
    term: Expectation Confirmation
    definition: "The model holding that satisfaction and acceptance track the gap between what a user expected and what they experienced. Negative disconfirmation — expecting more than the system delivers — drives dissatisfaction and abandonment even when performance is objectively fine."
  - id: accuracy-indicator
    term: Accuracy Indicator
    definition: "An onboarding element that states the system's expected accuracy directly — a gauge, a percentage, and a sentence — so the user's estimate starts near reality instead of near the marketing."
  - id: example-explanation
    term: Example-Based Explanation
    definition: "A pre-use table of representative inputs and the system's decisions on them, communicating how the system reasons, what cues it keys on, and — implicitly — that it will sometimes be wrong."
  - id: control-slider
    term: Control Slider
    definition: "A user-facing threshold control that trades false positives against false negatives. It both teaches the tradeoff and gives users a stake in the system's behavior, which makes its later mistakes easier to accept."
  - id: precision-recall
    term: Precision vs. Recall
    definition: "Two ways to spend the same error budget. High precision minimizes false positives and misses more; high recall catches more and raises false alarms. Overall accuracy can be identical under both."
  - id: recovery-cost
    term: Cost of Recovery
    definition: "The mental and physical work a user must do to repair a given error. The study's central claim is that the optimal precision–recall balance is largely a function of this cost, not of accuracy."
  - id: perceived-accuracy
    term: Perceived vs. Actual Accuracy
    definition: "What users believe about performance, which can diverge sharply from measurement. Two systems at 50% accuracy were perceived roughly 13 percentage points apart purely because of which errors they made."
---

Microsoft researchers built an email client that mimicked Outlook and gave it one
piece of artificial intelligence: a component that read messages and highlighted
sentences containing meeting requests. Then they built the component twice. Both
versions were 50% accurate. One made mostly false positives — highlighting
sentences that were not requests. The other made mostly false negatives — quietly
missing requests that were there. Four hundred people used one version or the
other. **The two systems performed identically and were not perceived as remotely
the same product.**

## The Problem With Expecting Anything

The framing comes from an old finding in marketing and a newer one in HCI:
satisfaction is not a function of quality but of the distance between quality and
expectation. Under the Expectation Confirmation Model, negative disconfirmation —
expecting more than you get — depresses both satisfaction and willingness to
continue. Earlier work established the link but mostly manipulated expectations
through deception: selectively negative reviews, distorted descriptions, deliberate
over- and under-statement. That is ethically awkward and, for software you will
keep using, futile — extended use reveals the truth.

Modern AI sharpens the problem. The underlying components are probabilistic and
almost never perfect, while users largely do not expect their applications to
behave inconsistently. The researchers measured the mismatch directly: before
using anything, people put the assistant's likely accuracy at about 75%. So the
team set the real thing to 50% — deliberately disappointing, in order to test
whether preparation could survive contact with a system that underperforms.

## Three Ways to Tell the Truth Early

The interventions follow from three established routes by which beliefs form:
external information, reasoning and understanding, and first-hand experience.

<figure>
<svg viewBox="0 0 820 260" role="img" aria-label="Three expectation-setting techniques shown side by side: an accuracy gauge communicating expected performance, an example table showing how the system decides, and a slider letting the user trade false positives against false negatives.">
  <defs>
    <marker id="arw-koc-tech" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" class="dgm-fill"/>
    </marker>
  </defs>
  <rect x="24" y="34" width="240" height="150" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="144" y="58" text-anchor="middle" font-size="12.5" font-weight="700">Accuracy Indicator</text>
  <path d="M96 138 A48 48 0 0 1 192 138" fill="none" stroke="currentColor" stroke-width="6" class="dgm-muted"/>
  <path d="M96 138 A48 48 0 0 1 144 90" fill="none" stroke="currentColor" stroke-width="6" class="dgm-accent"/>
  <text x="144" y="132" text-anchor="middle" font-size="15" font-weight="700">50%</text>
  <text x="144" y="164" text-anchor="middle" font-size="10.5" class="dgm-muted">external information</text>
  <rect x="290" y="34" width="240" height="150" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="410" y="58" text-anchor="middle" font-size="12.5" font-weight="700">Example Explanation</text>
  <line x1="312" y1="76" x2="508" y2="76" stroke="currentColor" stroke-width="1.2"/>
  <text x="330" y="96" font-size="10.5">“Meet Friday 3:30?”</text>
  <text x="492" y="96" text-anchor="end" font-size="10.5" class="dgm-accent">request</text>
  <line x1="312" y1="106" x2="508" y2="106" stroke="currentColor" stroke-width="1"/>
  <text x="330" y="126" font-size="10.5">“Can we discuss?”</text>
  <text x="492" y="126" text-anchor="end" font-size="10.5" class="dgm-muted">not a request</text>
  <line x1="312" y1="136" x2="508" y2="136" stroke="currentColor" stroke-width="1"/>
  <text x="330" y="156" font-size="10.5">“Thanks for the help”</text>
  <text x="492" y="156" text-anchor="end" font-size="10.5" class="dgm-muted">not a request</text>
  <text x="410" y="176" text-anchor="middle" font-size="10.5" class="dgm-muted">reasoning and understanding</text>
  <rect x="556" y="34" width="240" height="150" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="676" y="58" text-anchor="middle" font-size="12.5" font-weight="700">Control Slider</text>
  <line x1="586" y1="110" x2="766" y2="110" stroke="currentColor" stroke-width="1.6"/>
  <line x1="586" y1="102" x2="586" y2="118" stroke="currentColor" stroke-width="1.4"/>
  <line x1="766" y1="102" x2="766" y2="118" stroke="currentColor" stroke-width="1.4"/>
  <circle cx="676" cy="110" r="9" class="dgm-accent dgm-fill"/>
  <text x="596" y="136" font-size="10" class="dgm-muted">fewer detections</text>
  <text x="756" y="136" text-anchor="end" font-size="10" class="dgm-muted">more detections</text>
  <text x="596" y="150" font-size="10" class="dgm-muted">(misses more)</text>
  <text x="756" y="150" text-anchor="end" font-size="10" class="dgm-muted">(false alarms)</text>
  <text x="676" y="176" text-anchor="middle" font-size="10.5" class="dgm-muted">first-hand experience</text>
  <line x1="410" y1="196" x2="410" y2="220" stroke="currentColor" stroke-width="1.4" marker-end="url(#arw-koc-tech)"/>
  <text x="410" y="242" text-anchor="middle" font-size="11.5">average time spent reading all this: 15 seconds</text>
</svg>
<figcaption><b>Fifteen seconds of onboarding.</b> Each technique targets a different route by which expectations form — and all three are light enough that users actually look at them.</figcaption>
</figure>

The **Accuracy Indicator** simply says what the system can do: a half-filled gauge,
the number, and a sentence clarifying that it refers to the share of meeting
requests detected correctly. The **Example-Based Explanation** shows four sample
sentences ordered from unambiguous request to clearly not, with the system's
decision and confidence beside each — teaching that the system reads sentence by
sentence, keys on time and invitation phrases, and (visibly, in the third row) gets
things wrong. The **Control Slider** hands over the decision threshold, labelled at
one end "fewer detections — some requests might be missed" and at the other "more
detections — more non-requests might be suggested."

The first study, with 150 participants, confirmed each did its job. People who saw
the Accuracy Indicator estimated accuracy significantly lower — that is, closer to
the true 50% — than those who did not. The Explanation significantly raised
reported understanding. The Slider significantly raised the sense of control, and
87% of participants moved it from its default. One incidental finding is worth
noting: the Accuracy Indicator slightly *reduced* the feeling of control. Being
told a number is not the same as having a hand on the dial.

## The Result Nobody Predicted

The second study put 400 participants through an actual task — handling twenty
emails with the assistant's help — and tested the hypothesis that practitioners
generally hold: that a system avoiding false positives will feel more accurate and
be better accepted, because its mistakes are less visible.

The opposite happened. The high-recall version — the one making eight false
positives to the high-precision version's two — was rated significantly higher on
perceived accuracy, a gap of roughly 13 percentage points on a system that was in
both cases exactly 50% accurate. It was also significantly more accepted, about half
a point on a seven-point scale. Pre-exposure expectations were balanced across
groups, so the difference is not a sampling artifact. The hypothesis was rejected in
the direction opposite to the one predicted.

<figure>
<svg viewBox="0 0 820 250" role="img" aria-label="Two confusion matrices for the same fifty percent accurate system. The high recall version has eight false positives and two false negatives; the high precision version has two false positives and eight false negatives. The high recall version was perceived as more accurate.">
  <defs>
    <marker id="arw-koc-mtx" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" class="dgm-fill"/>
    </marker>
  </defs>
  <text x="200" y="26" text-anchor="middle" font-size="13" font-weight="700">High recall</text>
  <rect x="112" y="44" width="88" height="52" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="156" y="68" text-anchor="middle" font-size="10.5" class="dgm-muted">true pos.</text>
  <text x="156" y="86" text-anchor="middle" font-size="13" font-weight="700">5</text>
  <g class="dgm-accent">
    <rect x="200" y="44" width="88" height="52" class="dgm-soft" stroke="currentColor" stroke-width="1.6"/>
    <text x="244" y="68" text-anchor="middle" font-size="10.5">false pos.</text>
    <text x="244" y="86" text-anchor="middle" font-size="13" font-weight="700">8</text>
  </g>
  <rect x="112" y="96" width="88" height="52" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="156" y="120" text-anchor="middle" font-size="10.5" class="dgm-muted">false neg.</text>
  <text x="156" y="138" text-anchor="middle" font-size="13" font-weight="700">2</text>
  <rect x="200" y="96" width="88" height="52" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="244" y="120" text-anchor="middle" font-size="10.5" class="dgm-muted">true neg.</text>
  <text x="244" y="138" text-anchor="middle" font-size="13" font-weight="700">5</text>
  <text x="200" y="174" text-anchor="middle" font-size="11">accuracy 50%</text>
  <text x="200" y="194" text-anchor="middle" font-size="11" font-weight="700">perceived higher</text>
  <text x="200" y="214" text-anchor="middle" font-size="10.5" class="dgm-muted">recovery: ignore a highlight</text>
  <text x="410" y="100" text-anchor="middle" font-size="11" class="dgm-muted">vs</text>
  <text x="620" y="26" text-anchor="middle" font-size="13" font-weight="700">High precision</text>
  <rect x="532" y="44" width="88" height="52" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="576" y="68" text-anchor="middle" font-size="10.5" class="dgm-muted">true pos.</text>
  <text x="576" y="86" text-anchor="middle" font-size="13" font-weight="700">5</text>
  <rect x="620" y="44" width="88" height="52" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="664" y="68" text-anchor="middle" font-size="10.5" class="dgm-muted">false pos.</text>
  <text x="664" y="86" text-anchor="middle" font-size="13" font-weight="700">2</text>
  <g class="dgm-accent">
    <rect x="532" y="96" width="88" height="52" class="dgm-soft" stroke="currentColor" stroke-width="1.6"/>
    <text x="576" y="120" text-anchor="middle" font-size="10.5">false neg.</text>
    <text x="576" y="138" text-anchor="middle" font-size="13" font-weight="700">8</text>
  </g>
  <rect x="620" y="96" width="88" height="52" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="664" y="120" text-anchor="middle" font-size="10.5" class="dgm-muted">true neg.</text>
  <text x="664" y="138" text-anchor="middle" font-size="13" font-weight="700">5</text>
  <text x="620" y="174" text-anchor="middle" font-size="11">accuracy 50%</text>
  <text x="620" y="194" text-anchor="middle" font-size="11" font-weight="700">perceived lower</text>
  <text x="620" y="214" text-anchor="middle" font-size="10.5" class="dgm-muted">recovery: reread the email</text>
  <line x1="330" y1="192" x2="500" y2="192" stroke="currentColor" stroke-width="1.3" stroke-dasharray="4 3" marker-end="url(#arw-koc-mtx)"/>
  <text x="415" y="238" text-anchor="middle" font-size="10.5" class="dgm-muted">same accuracy, ~13 points apart in perceived accuracy</text>
</svg>
<figcaption><b>The same 50%, spent differently.</b> Shifting errors from the false-negative cell to the false-positive cell left measured accuracy untouched and moved user judgment substantially.</figcaption>
</figure>

The authors' explanation is recovery cost. Ignoring a wrong highlight costs a
glance; the user reads the sentence, decides it is not a request, and moves on. The
mental load is small and the physical load is nil. A missed request costs the user
a careful reread of the message plus manually entering a meeting's time and date —
and may not be noticed at all until it is too late. Under those asymmetries, the
system that "makes more mistakes" is the one that feels more helpful, because the
mistakes it makes are the cheap kind.

## Preparation Works Where Disappointment Lives

The expectation-setting techniques raised satisfaction and acceptance — but only in
the high-precision version, the one users experienced as falling short. In the
high-recall version, where the system roughly met expectations, the interventions
made no measurable difference. That is not a weakness in the result; it is evidence
that the mechanism is what the authors claim. Preparing users for imperfection
helps precisely when imperfection would otherwise disappoint them, and is
redundant when it would not. Among individual techniques in the high-precision
version, the Control Slider had a significant positive effect on acceptance and the
Accuracy Indicator a weaker one, while the Explanation alone did not reach
significance. Notably, none of it changed objective performance: task accuracy and
completion time were the same with or without preparation. What changed was
whether people wanted to keep using the thing.

All of this cost about fifteen seconds of attention, against roughly five and a
half minutes on the task — which is the practical point. These are not intelligible-AI
interfaces demanding that users study an algorithm. They are lightweight, algorithm
agnostic, and survive the fact that people skip tutorials.

## Why It Matters

The study makes two claims that generalize past the inbox. The first is that
expectations can be shaped honestly — no deception, no priming, just stating the
accuracy, showing the reasoning, and offering the dial — and that doing so measurably
protects acceptance of a system that will disappoint. The second is sharper: the
right precision–recall balance is not a modelling decision to be settled by an
F-score. It is a design decision that depends on what each kind of error costs the
person cleaning it up. The authors are careful about scope — this is a passive,
assistive, low-risk system where the user makes the final call, and their finding
generalizes to that class, from reply suggestions to autocomplete. In genuinely
critical systems — cancer screening, threat detection — the relevant analysis is the
severity of consequences rather than the workload of recovery. But the underlying
instruction is the same everywhere: before tuning the threshold, work out which
mistake your user can most easily survive.
