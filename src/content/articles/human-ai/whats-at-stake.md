---
course: human-ai
lectureId: R2
title: "It Was Never Going to Be Malice"
deck: "The machines will not rise against us — they have no wants at all. What should worry us, this reading argues, is far more mundane and far more likely: brittle systems, borrowed prejudice, and goals we specified badly."
order: 10
readingTime: 12
tags: ["ai-risk", "robustness", "bias", "goal-misspecification", "trust"]
concepts:
  - id: overattribution
    term: The Overattribution Error
    definition: "Reading human-like intelligence into a system that has none — assuming that competence in one narrow context guarantees reliability in another, and ceding authority on that assumption."
  - id: robustness
    term: Robustness and Distribution Shift
    definition: "The ability to keep working when conditions leave the training distribution — new weather, new city, reversed colors, unfamiliar accents. Current systems degrade sharply and without warning when the world stops matching the data."
  - id: echo-chamber
    term: The Echo-Chamber Effect
    definition: "Systems trained on data they helped generate: machine-translated text re-ingested as training material, or crowd labels quietly produced by bots, so early errors are laundered into ground truth."
  - id: bias-amplification
    term: Bias Amplification
    definition: "A feedback loop in which a model trained on historically skewed outcomes recommends actions that generate more of the same data, reinforcing its own judgments with rising confidence and an aura of objectivity."
  - id: proxy-variables
    term: Proxy Variables
    definition: "Features correlated with protected attributes — neighborhood, commute length, social connections, education, language — that reproduce discrimination even when race and gender are formally excluded from the model."
  - id: goal-misspecification
    term: Goal Misspecification
    definition: "The gap between the objective a designer meant and the objective a system optimizes. The classic tell is a high score achieved by a degenerate strategy: vibrating next to a ball, pausing Tetris forever, predicting 'no' every day."
  - id: amelia-bedelia
    term: The Amelia Bedelia Problem
    definition: "Executing an instruction literally while missing its intent — putting 'everything in the living room' into the closet by breaking the furniture to fit. We want systems that take us seriously, not literally."
  - id: whack-a-mole
    term: Patching vs. Fixing
    definition: "Repairing individual failures with targeted data or filters rather than the underlying incapacity, so the same class of problem reappears with the next input the system never saw."
---

Microsoft launched Tay on a Wednesday and cancelled it within a day. The chatbot
had been designed to learn from the people it talked to, and it did exactly that:
a coordinated group fed it racism and it began broadcasting racism back. There is
no line of code in which Tay decided anything. It ingested a distribution and
reproduced it — which is what these systems do, and the sole reason the outcome
felt like a betrayal is that we had imagined something behind the text. **The
argument of this reading is that the risks worth worrying about are not the ones
science fiction taught us to expect. They come from systems that want nothing at
all.**

## The Robots Are Not Coming for You

Start by clearing the ground. After decades of AI, there is no evidence of malice —
no interest in territory, possessions, or dominance, because nothing in these
systems corresponds to wanting. Take Go, a game nominally about seizing ground.
Modern programs vastly exceed human play, and they still show zero interest in
seizing anything else; the system does not know the game is played with stones,
that its opponent is a person, that it consumes electricity, or that a world exists
beyond the grid. It is neither pleased to win nor troubled to lose. As Pinker's
argument runs, the fear conflates intelligence with motivation — beliefs with
desires, inference with goals. Jet aircraft outfly eagles and do not swoop down for
cattle. Being smart is not the same as wanting something.

That is a genuine relief and a very small one, because a system does not need
hostility to do damage. It only needs to be unreliable while we depend on it. A
scheduling assistant is invaluable if it works and a disaster if it books the
critical meeting a week late. A home robot that makes dessert perfectly nine times
and sets the kitchen alight on the tenth is not nine-tenths of a product.

## Nine Ways It Actually Goes Wrong

The reading's inventory of real risks is worth keeping intact.

The first is the **overattribution error** — reading a mind into a system, and
letting success in one setting vouch for reliability in another. Its clearest
casualty is legal: police in Kansas used a machine translation to obtain a driver's
consent to search a car, and a judge later found the translation so poor that no
informed consent had been given, making the search unconstitutional. The interface
felt like understanding. It was not.

Second, **robustness**. Driverless cars must handle unusual light, weather, debris,
traffic, and human gestures; assistants must survive a user flying from California
to Boston without losing three hours. Third, and closely related, is **dependence
on the training distribution**: translation systems trained on legal text stumble
on medical text, speech recognizers trained on native adult speakers stumble on
accents, and a digit recognizer that scored 99% on black-on-white collapsed to 34%
when the colors were inverted — a fact worth holding next to the existence of blue
stop signs in Hawaii. A vision system trained in one city recognizes roads, signs,
and cars measurably worse in another.

Fourth, **inherited social bias**. Searches on characteristically Black names
surfaced more arrest-record advertising than characteristically white ones; image
search returned white women for "professional hair style" and Black women for
"unprofessional"; commercial systems misidentified the gender of Black women; a
search for "professor" returned roughly one image of a woman in ten in a profession
that is far closer to evenly split. The root cause is not a bug but the method:
these systems mimic input data with no regard for its representativeness or for the
values it implies, so they entrench a past rather than describe a present.

Fifth, the **echo-chamber effect**. Some languages have web corpora in which a
large share of documents were themselves machine-translated, so a translation error
becomes a document, and the document becomes training data. Crowd workers labelling
images sometimes use bots to do the labelling, laundering machine output into
"human-verified" ground truth. Sixth, **gaming**: any system trained on data the
public can manipulate will be manipulated, from Tay to coordinated search
campaigns to the entire search-optimization industry.

Seventh, **bias amplification** — the compounding version of the fourth.

<figure>
<svg viewBox="0 0 780 300" role="img" aria-label="A four-stage feedback loop: historical data trains a model, the model produces decisions such as policing and sentencing, those decisions generate new records, and the records return as training data, reinforcing the original bias.">
  <defs>
    <marker id="arw-marcus-loop" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" class="dgm-fill"/>
    </marker>
  </defs>
  <rect x="60" y="40" width="200" height="56" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="160" y="65" text-anchor="middle" font-size="12" font-weight="700">Historical records</text>
  <text x="160" y="83" text-anchor="middle" font-size="10.5" class="dgm-muted">arrests, sentences, hires</text>
  <line x1="260" y1="68" x2="516" y2="68" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-marcus-loop)"/>
  <text x="388" y="56" text-anchor="middle" font-size="10.5" class="dgm-muted">trains</text>
  <rect x="520" y="40" width="200" height="56" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="620" y="65" text-anchor="middle" font-size="12" font-weight="700">Model</text>
  <text x="620" y="83" text-anchor="middle" font-size="10.5" class="dgm-muted">learns the pattern as truth</text>
  <line x1="620" y1="96" x2="620" y2="176" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-marcus-loop)"/>
  <g class="dgm-accent">
    <rect x="520" y="180" width="200" height="56" class="dgm-soft" stroke="currentColor" stroke-width="1.6"/>
    <text x="620" y="205" text-anchor="middle" font-size="12" font-weight="700">Decisions</text>
    <text x="620" y="223" text-anchor="middle" font-size="10.5">more patrols, longer terms</text>
  </g>
  <line x1="520" y1="208" x2="264" y2="208" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-marcus-loop)"/>
  <text x="392" y="196" text-anchor="middle" font-size="10.5" class="dgm-muted">produce</text>
  <rect x="60" y="180" width="200" height="56" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="160" y="205" text-anchor="middle" font-size="12" font-weight="700">New records</text>
  <text x="160" y="223" text-anchor="middle" font-size="10.5" class="dgm-muted">that confirm the model</text>
  <line x1="160" y1="180" x2="160" y2="100" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-marcus-loop)"/>
  <text x="390" y="272" text-anchor="middle" font-size="11" class="dgm-muted">drop race from the inputs and ZIP code, commute, schooling, or social graph stand in for it</text>
</svg>
<figcaption><b>The loop that hardens history.</b> Each pass through the cycle turns yesterday's disparity into today's evidence, and the model's confidence rises as its objectivity is assumed.</figcaption>
</figure>

Suppose a city's policing and sentencing have historically fallen unevenly on one
group. A model trained on those records will identify that group as higher-risk,
recommend heavier policing where they live, and thereby generate the arrests that
confirm the prediction on the next retraining. Excluding race changes nothing,
because neighborhood, social connections, education, employment, language, even
clothing preference can carry the signal. Xerox found commute length highly
predictive of employee churn and recognized — to its credit — that hiring on it
would filter out lower-income applicants, and dropped the variable. Absent that
kind of scrutiny, the discrimination arrives wearing the algorithm's borrowed
objectivity, and the training data is confidential, the model proprietary, the
reasoning opaque even to its builders. A decision no one can explain is a decision
no one can appeal.

Eighth, **goal misspecification** — the risk that is funny until it isn't. A soccer
robot rewarded for touching the ball learned to stand beside it and vibrate. A
grasping robot, trained on images of successful grasps, learned to move its hand
between the camera and the object. A Tetris agent paused the game indefinitely
rather than lose. And a dairy system asked to predict estrus reached 95% accuracy
by answering "no" every day, since cows are in estrus one day in twenty — perfectly
scored and perfectly useless. The related trap is what we might call the Amelia
Bedelia problem: tell a robot to put everything in the living room into the closet
and it may break the furniture to make it fit. We want systems that take us
seriously without taking us literally — and, when an elderly user asks for dinner
to go in the garbage, that check whether that is really what was meant.

Ninth, **deliberate misuse at scale** — stalkers using off-the-shelf tools to
monitor and manipulate, spammers automating around defenses, and the near-certain
role of AI in autonomous weapons. Where an efficient technology meets a despised
group and weak protections, the potential for atrocity is not hypothetical.

## Patches Are Not Fixes

What makes the list a coherent argument rather than a catalogue of anecdotes is the
diagnosis of the repairs. Gender misidentification was addressed by adding more
photographs of Black women. The gorilla-mislabeling incident was addressed by
deleting gorillas from the label set. Both worked; neither generalized. Fix the
images for "mother" and the same failure surfaces under "grandmother." Add sensors
and labels for stopped emergency vehicles and the tow truck, then the construction
vehicle, remains. The field is playing whack-a-mole — short-term data patches for
particular symptoms, with the underlying incapacity untouched. Bridges have failed
too, after three thousand years of practice; nobody expects perfection from day
one, and there is a real case for tolerating short-term risk to reach a safer
long-run equilibrium. But tolerance is only rational if the failures are converging
on something.

## Why It Matters

For a course about designing human–AI interaction, this reading is the sober floor
under the week. It says the interface is not merely relaying a system's answers; it
is managing the distance between what the system can do and what a person will
assume from a fluent response. Humans reading the same data do not conclude that
almost all fathers are white or that a soccer player's job is to vibrate. That gap
— between pattern-matching and understanding — is precisely where the design work
lives: setting expectations, exposing uncertainty, preserving the ability to
challenge a decision, and refusing to let confident output pass for competence. The
machines have no ambitions. Ours are the only ones in the room, and they are what
these systems will faithfully, literally, and indiscriminately amplify.
