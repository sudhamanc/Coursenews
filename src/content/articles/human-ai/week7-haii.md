---
course: human-ai
lectureId: W7
title: "The Humble Machine"
deck: "Week 7 accepts what probabilistic systems guarantee — that they will be wrong — and asks the harder design question: what should a system do in the moment after it fails, when the user's task quietly becomes trust repair?"
order: 7
readingTime: 13
tags: ["errors", "trust", "failure", "bias", "recovery"]
concepts:
  - id: error-vs-bias
    term: Error vs. Bias
    definition: "An error is a single incorrect output caused by limits in the data, model, context, or input. Bias is a systematic pattern in which results go wrong consistently and disproportionately for particular people or groups."
  - id: errors-vs-failures
    term: Errors vs. Failures
    definition: "An error leaves the system usable but suboptimal — an irrelevant song recommendation. A failure makes it unusable, harmful, or dangerous. The same error rate can be trivial or catastrophic depending on the stakes."
  - id: error-sources
    term: Sources of Error
    definition: "Data errors (mislabeled, incomplete, or unrepresentative training data), model errors (confusing similar inputs or weighting them wrongly), and invisible errors that pass unnoticed because the system sounds confident."
  - id: user-perceived-error
    term: User-Perceived Error and Failstates
    definition: "An interaction can fail while the technology works as designed — the output conflicts with the user's mental model, the system misreads context, or it simply lacks the capability to answer at all."
  - id: context-window
    term: Context Window Limits
    definition: "A system that retains only a limited span of recent information loses earlier instructions, producing output that is locally plausible but globally inconsistent — the recipe that forgets its own main ingredient."
  - id: expectation-setting
    term: Expectation Setting
    definition: "Onboarding techniques — accuracy indicators, example-based explanations, and performance controls — that tell users what a system can and cannot do before they use it, so satisfaction is not destroyed by the gap between hype and reality."
  - id: recovery-cost
    term: Recovery Cost
    definition: "The effort a user must spend to undo or repair a given kind of mistake. It, more than raw accuracy, should decide whether a system is tuned toward false positives (recall) or false negatives (precision)."
  - id: error-recovery-heuristics
    term: Recognition, Diagnosis, Recovery
    definition: "The three obligations of a good error experience: make the failure visible, explain it in plain language, and offer an immediate way out — undo, retry, correct, or hand control back to the person."
  - id: humble-machine
    term: The Humble Machine
    definition: "A system designed to communicate uncertainty, acknowledge its limitations, accept responsibility when it is wrong, and treat user feedback as dialogue — so trust stays calibrated to actual capability."
---

Somewhere in a knitting circle, a pattern called "Tiny Baby Whales" produced
tentacles. The machine that wrote it had lost track of its own stitch counts
several rows earlier and kept confidently generating instructions that no longer
added up. The knitters did not throw the pattern away. They debugged it — read
around the impossible rows, invented the missing ones, and later admitted they
missed the strange asymmetries when they returned to well-behaved human designs.
That is one of two things a failing AI can produce. The other is a hiring tool
that ranks qualified women below comparable men, or a skin-cancer detector that
works less reliably on darker skin. **Week 7's argument is that the difference
between those outcomes is almost never the error rate. It is the context, and it
is the design of the moment after.**

## An Error Is a Result; Bias Is a Pattern

Begin with a distinction the lecture is precise about. An **error** is a single
incorrect output, traceable to limits in the data, the model, the context, or the
user's input; it may be isolated and unpredictable. **Bias** is a systematic
pattern that consistently advantages, disadvantages, or misrepresents certain
people or groups, and it usually originates upstream — in the training data, the
model's assumptions, or the deployment context. If a hiring system misranks one
qualified candidate, that is plausibly an error. If it repeatedly ranks qualified
women below comparably qualified men, that is bias. The line between them is
statistical, not moral: an error becomes evidence of bias when it recurs
consistently and disproportionately.

Severity is a second, independent axis. An **error** leaves a system usable but
suboptimal — a song recommendation you skip. A **failure** makes it unusable,
harmful, or dangerous. A 20% error rate in restaurant suggestions is an
annoyance; a 20% crash rate in an autonomous vehicle is a catastrophe. Identical
mistakes change character with their surroundings: a typo in a Slack message is
nothing, and a typo in a prescription can kill. Because AI systems are
probabilistic — they generate the *likely*, not the *certain* — no amount of
engineering removes the possibility of being wrong. What design controls is the
consequence.

## Where Things Break

The lecture's taxonomy is worth holding onto because it separates failures of the
technology from failures of the interaction. On the system side: **data errors**,
where training material is mislabeled, incomplete, or unrepresentative — a
healthcare model trained on heart conditions that cannot recognize kidney stones;
**model errors**, where the system cannot distinguish similar inputs or weighs
them wrongly — you liked one recipe, so it floods you with butter chicken when
what you actually liked was the creator; and **invisible errors**, the most
dangerous class, which pass unnoticed precisely because the system answers with
confidence and the user has no reason to doubt it.

<figure>
<svg viewBox="0 0 840 300" role="img" aria-label="A pipeline from training data through model to output and then to the user, with system-side error types labelled on the early stages and interaction-side error types labelled at the user end.">
  <defs>
    <marker id="arw-w7-pipe" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" class="dgm-fill"/>
    </marker>
  </defs>
  <text x="200" y="30" text-anchor="middle" font-size="12.5" font-weight="700">System side</text>
  <text x="660" y="30" text-anchor="middle" font-size="12.5" font-weight="700">Interaction side</text>
  <rect x="30" y="52" width="120" height="48" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="90" y="81" text-anchor="middle" font-size="12">Data</text>
  <line x1="150" y1="76" x2="188" y2="76" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-w7-pipe)"/>
  <rect x="192" y="52" width="120" height="48" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="252" y="81" text-anchor="middle" font-size="12">Model</text>
  <line x1="312" y1="76" x2="350" y2="76" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-w7-pipe)"/>
  <rect x="354" y="52" width="120" height="48" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="414" y="81" text-anchor="middle" font-size="12">Output</text>
  <line x1="474" y1="76" x2="512" y2="76" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-w7-pipe)"/>
  <g class="dgm-accent">
    <rect x="516" y="52" width="144" height="48" class="dgm-soft" stroke="currentColor" stroke-width="1.6"/>
    <text x="588" y="81" text-anchor="middle" font-size="12" font-weight="700">Interpretation</text>
  </g>
  <line x1="660" y1="76" x2="698" y2="76" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-w7-pipe)"/>
  <rect x="702" y="52" width="112" height="48" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="758" y="81" text-anchor="middle" font-size="12">User</text>
  <line x1="90" y1="100" x2="90" y2="140" stroke="currentColor" stroke-width="1.2" stroke-dasharray="3 3"/>
  <text x="90" y="160" text-anchor="middle" font-size="11">Data errors</text>
  <text x="90" y="177" text-anchor="middle" font-size="10.5" class="dgm-muted">mislabeled,</text>
  <text x="90" y="192" text-anchor="middle" font-size="10.5" class="dgm-muted">unrepresentative</text>
  <line x1="252" y1="100" x2="252" y2="140" stroke="currentColor" stroke-width="1.2" stroke-dasharray="3 3"/>
  <text x="252" y="160" text-anchor="middle" font-size="11">Model errors</text>
  <text x="252" y="177" text-anchor="middle" font-size="10.5" class="dgm-muted">confuses or</text>
  <text x="252" y="192" text-anchor="middle" font-size="10.5" class="dgm-muted">misweights inputs</text>
  <line x1="414" y1="100" x2="414" y2="140" stroke="currentColor" stroke-width="1.2" stroke-dasharray="3 3"/>
  <text x="414" y="160" text-anchor="middle" font-size="11">Invisible errors</text>
  <text x="414" y="177" text-anchor="middle" font-size="10.5" class="dgm-muted">wrong, but stated</text>
  <text x="414" y="192" text-anchor="middle" font-size="10.5" class="dgm-muted">confidently</text>
  <line x1="588" y1="100" x2="588" y2="140" stroke="currentColor" stroke-width="1.2" stroke-dasharray="3 3"/>
  <text x="588" y="160" text-anchor="middle" font-size="11">User-perceived</text>
  <text x="588" y="177" text-anchor="middle" font-size="10.5" class="dgm-muted">works as designed,</text>
  <text x="588" y="192" text-anchor="middle" font-size="10.5" class="dgm-muted">feels wrong</text>
  <line x1="758" y1="100" x2="758" y2="140" stroke="currentColor" stroke-width="1.2" stroke-dasharray="3 3"/>
  <text x="758" y="160" text-anchor="middle" font-size="11">User errors</text>
  <text x="758" y="177" text-anchor="middle" font-size="10.5" class="dgm-muted">habit, changed</text>
  <text x="758" y="192" text-anchor="middle" font-size="10.5" class="dgm-muted">affordances</text>
  <rect x="30" y="226" width="784" height="46" fill="none" stroke="currentColor" stroke-width="1.4" stroke-dasharray="5 4"/>
  <text x="422" y="245" text-anchor="middle" font-size="11.5" font-weight="700">Context errors and failstates cut across the whole chain</text>
  <text x="422" y="263" text-anchor="middle" font-size="10.5" class="dgm-muted">wrong assumptions about the user's situation — or no capability to answer at all</text>
</svg>
<figcaption><b>Where things break.</b> Errors are not one phenomenon: they enter at the data, at the model, at the moment of interpretation, and at the point of use — and a system can fail the user while working exactly as built.</figcaption>
</figure>

On the interaction side the technology may be blameless. **User errors** follow
from habit when an interface changes underneath someone — a "next" button
silently reassigned to volume control. **User-perceived errors** occur when the
system behaves as designed but the result violates the user's mental model.
**Context errors** come from confident wrong assumptions about the situation,
like an assistant adding a merely *possible* flight to the family calendar.
**Failstates** are the honest dead ends: an English-only voice assistant given a
command in Hindi cannot do anything but fail. And then there are **happy
accidents**, where a technical failure yields something useful or delightful.

## Forgetting the Recipe

One class of failure deserves separate billing because it is structural. Systems
that retain only a limited **context window** eventually push earlier details out
of view — and once the original instruction is gone, output remains locally
fluent while drifting globally incoherent. The lecture's example is a recipe
generator that started on "clam frosting," forgot its own subject partway through,
and continued adding unrelated ingredients with perfect confidence. The knitting
patterns fail the same way, one order harder: stitch counts on row forty depend on
decisions made on row four, so a long-range dependency lost early produces a
garment that cannot physically be knit. The lesson generalizes to any long task —
a system can be right sentence by sentence and wrong as a whole.

## The Gap Between Promise and Performance

Users do not judge an AI against a benchmark. They judge it against what they were
led to expect. When cultural portrayals and marketing inflate expectations, even
small errors read as betrayals, and trust — once lost — takes the product with it.
The intervention is unglamorous and happens before first use. **Accuracy
indicators** state expected performance as a percentage, confidence score, or
gauge. **Example-based explanations** show concretely what the system handles well
and where it struggles, building a usable mental model rather than a mythical one.
**Performance controls** — a slider governing how aggressively the system flags or
recommends — hand the user a share of the decision, and participation makes the
resulting mistakes markedly easier to forgive. Research on a meeting-detection
assistant found exactly this: holding the underlying accuracy fixed, what changed
acceptance was how the system framed itself beforehand.

## Which Mistake Would You Rather Fix?

That research also isolated the tradeoff at the heart of the week. A system tuned
for **high recall** catches more of what matters and produces more false
positives. One tuned for **high precision** produces fewer false alarms and misses
more. Neither is better in the abstract. What decides is **recovery cost** — the
work a user must do to repair each kind of mistake. In a scheduling assistant, a
wrongly highlighted sentence costs a glance to ignore; a missed meeting request
costs a careful reread of the whole email, and may not be discovered until it is
too late. Under those asymmetries, false positives are the cheaper failure. Change
the domain and the ordering inverts: in autonomous driving a false positive is
phantom emergency braking on a highway, and cheapness is not the word for it.

<figure>
<svg viewBox="0 0 820 280" role="img" aria-label="Two panels comparing a high-recall system, which produces extra false positives that are cheap to dismiss, with a high-precision system, which misses a real item that is expensive to recover.">
  <defs>
    <marker id="arw-w7-pr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" class="dgm-fill"/>
    </marker>
  </defs>
  <text x="205" y="28" text-anchor="middle" font-size="13" font-weight="700">High recall</text>
  <text x="205" y="46" text-anchor="middle" font-size="10.5" class="dgm-muted">catches more, flags too much</text>
  <rect x="40" y="60" width="330" height="130" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <rect x="62" y="80" width="286" height="20" class="dgm-soft" stroke="currentColor" stroke-width="1.2"/>
  <text x="205" y="95" text-anchor="middle" font-size="10.5">real meeting request — caught</text>
  <g class="dgm-accent">
    <rect x="62" y="110" width="286" height="20" class="dgm-soft" stroke="currentColor" stroke-width="1.2"/>
    <text x="205" y="125" text-anchor="middle" font-size="10.5">false positive — flagged anyway</text>
    <rect x="62" y="140" width="286" height="20" class="dgm-soft" stroke="currentColor" stroke-width="1.2"/>
    <text x="205" y="155" text-anchor="middle" font-size="10.5">false positive — flagged anyway</text>
  </g>
  <text x="205" y="180" text-anchor="middle" font-size="10.5" class="dgm-muted">nothing missed</text>
  <line x1="205" y1="192" x2="205" y2="216" stroke="currentColor" stroke-width="1.4" marker-end="url(#arw-w7-pr)"/>
  <text x="205" y="238" text-anchor="middle" font-size="11.5" font-weight="700">Recovery: glance and ignore</text>
  <rect x="112" y="250" width="186" height="14" fill="none" stroke="currentColor" stroke-width="1.2"/>
  <rect x="112" y="250" width="56" height="14" class="dgm-fill"/>
  <text x="410" y="150" text-anchor="middle" font-size="11" class="dgm-muted">vs</text>
  <text x="615" y="28" text-anchor="middle" font-size="13" font-weight="700">High precision</text>
  <text x="615" y="46" text-anchor="middle" font-size="10.5" class="dgm-muted">flags less, misses more</text>
  <rect x="450" y="60" width="330" height="130" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <rect x="472" y="80" width="286" height="20" class="dgm-soft" stroke="currentColor" stroke-width="1.2"/>
  <text x="615" y="95" text-anchor="middle" font-size="10.5">real meeting request — caught</text>
  <g class="dgm-accent">
    <rect x="472" y="110" width="286" height="20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-dasharray="4 3"/>
    <text x="615" y="125" text-anchor="middle" font-size="10.5">real request — missed entirely</text>
  </g>
  <rect x="472" y="140" width="286" height="20" fill="none" stroke="currentColor" stroke-width="1.2"/>
  <text x="615" y="155" text-anchor="middle" font-size="10.5" class="dgm-muted">nothing flagged</text>
  <text x="615" y="180" text-anchor="middle" font-size="10.5" class="dgm-muted">no false alarms</text>
  <line x1="615" y1="192" x2="615" y2="216" stroke="currentColor" stroke-width="1.4" marker-end="url(#arw-w7-pr)"/>
  <text x="615" y="238" text-anchor="middle" font-size="11.5" font-weight="700">Recovery: reread everything</text>
  <rect x="522" y="250" width="186" height="14" class="dgm-fill"/>
  <rect x="708" y="250" width="0" height="14" fill="none" stroke="currentColor" stroke-width="1.2"/>
</svg>
<figcaption><b>The cost of being wrong, both ways.</b> Two systems can share an accuracy number and feel entirely different, because what users actually pay is the effort of recovering from whichever error the tuning favors.</figcaption>
</figure>

## Recognition, Diagnosis, Recovery

When a system fails, the user's task changes. They are no longer trying to
schedule the meeting or find the song; they are managing the consequences of the
failure, and the interface is now a trust-repair instrument whether it was
designed as one or not. Classical usability heuristics give the three obligations.
**Recognition**: make the failure visible and legible — an error with no message
leaves a person stranded and blaming themselves. **Diagnosis**: say what happened
in human language, not a code. **Recovery**: provide an immediate way forward —
remove the bad filter, undo, retry, correct the input, or return control to the
person.

<figure>
<svg viewBox="0 0 820 210" role="img" aria-label="A three-step error recovery chain: recognition answering what happened, diagnosis answering why, and recovery answering what now, feeding back into the user's original task.">
  <defs>
    <marker id="arw-w7-rec" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" class="dgm-fill"/>
    </marker>
  </defs>
  <g class="dgm-accent">
    <rect x="30" y="60" width="120" height="52" class="dgm-soft" stroke="currentColor" stroke-width="1.6"/>
    <text x="90" y="83" text-anchor="middle" font-size="12" font-weight="700">Failure</text>
    <text x="90" y="100" text-anchor="middle" font-size="10.5">occurs</text>
  </g>
  <line x1="150" y1="86" x2="192" y2="86" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-w7-rec)"/>
  <rect x="196" y="60" width="152" height="52" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="272" y="82" text-anchor="middle" font-size="12" font-weight="700">Recognition</text>
  <text x="272" y="100" text-anchor="middle" font-size="10.5" class="dgm-muted">“what happened?”</text>
  <line x1="348" y1="86" x2="390" y2="86" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-w7-rec)"/>
  <rect x="394" y="60" width="152" height="52" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="470" y="82" text-anchor="middle" font-size="12" font-weight="700">Diagnosis</text>
  <text x="470" y="100" text-anchor="middle" font-size="10.5" class="dgm-muted">“why did it?”</text>
  <line x1="546" y1="86" x2="588" y2="86" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-w7-rec)"/>
  <rect x="592" y="60" width="152" height="52" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="668" y="82" text-anchor="middle" font-size="12" font-weight="700">Recovery</text>
  <text x="668" y="100" text-anchor="middle" font-size="10.5" class="dgm-muted">“what can I do?”</text>
  <path d="M668 112 L668 158 L272 158 L272 116" fill="none" stroke="currentColor" stroke-width="1.4" stroke-dasharray="5 4" marker-end="url(#arw-w7-rec)"/>
  <text x="470" y="176" text-anchor="middle" font-size="11">back to the task — with trust intact or repaired</text>
  <text x="470" y="34" text-anchor="middle" font-size="11" class="dgm-muted">skip any step and the user is left managing the failure alone</text>
</svg>
<figcaption><b>The three obligations.</b> A useful error experience tells the user what happened, why it happened, and what they can do next — anything less converts a recoverable mistake into abandonment.</figcaption>
</figure>

Around that chain sits a posture the lecture calls the **humble machine**: a
system that states its limitations, signals when it is uncertain, admits it can be
wrong and may improve, and treats corrections as dialogue rather than telemetry —
thumbs, edits, overrides that visibly change something. Humility is not
self-deprecation; it is the mechanism by which trust stays attached to actual
capability.

## The Anatomy of an Apology

Because people anthropomorphize conversational systems, the *manner* of the
apology matters measurably. Studies of erroneous voice agents find that an agent
which openly accepts blame and apologizes sincerely — *"I'm sorry. I had
difficulty distinguishing between those words."* — is rated more intelligent, more
likeable, and more effective at repairing the breakdown than one which deflects
toward an engineering team, an update, or the user. A jokey apology undercuts
serious consequences. And a bad apology is worse than silence: users proved more
willing to continue with a system that said nothing than with one that
conspicuously dodged responsibility. Blame-shifting does not merely fail to
repair trust; it spends more of it.

## When Errors Become Injustice

Charm has a boundary, and beyond it the same mechanics produce harm at scale. AI
learns patterns without judging whether those patterns reflect current values, so
historically skewed data yields image results in which "professor" is
overwhelmingly male — and, in higher-stakes systems, hiring tools abandoned for
disadvantaging women, diagnostic models that underperform on darker skin,
allocation systems in criminal justice and public benefits. Removing protected
attributes does not fix it, because **hidden proxies** — ZIP code, income,
education, social graph — reconstruct them. Meanwhile the ability to audit any of
this is receding: the Foundation Model Transparency Index recorded average scores
falling from 58 to 40 in 2025, with little disclosed about training data,
evaluation, or post-deployment impact. Safety that holds under normal use also
bends under **adversarial** pressure — jailbreak prompts, stickers and patches
that flip an image classifier, coordinated gaming of public ranking systems. And
**hallucination** persists alongside a subtler pathology: models that will push
back on a false claim attributed to a third party become more willing to accept
the same claim when the user asserts it as their own belief. Confidently stated,
socially agreeable, and wrong is the hardest output for any user to catch.

## The Creative Side of Failure

Then there is the other branch. A robot asking to be let into a secure dorm
succeeded 19% of the time; recast as a *cookie delivery robot*, with actual
cookies, it got in 76% of the time — no more sophisticated, just more charming,
which is a finding about persuasion as much as delight. Janelle Shane's
nonsensical AI-generated ice cream flavors and pickup lines land better than
competent imitations of human ones. Artists exploit contextual confusion
deliberately: orange sheep read as flowers, goats in trees as birds, and Tom
White's abstract prints are meaningless to us and confidently a "cabbage" to a
classifier. The knitters treated broken patterns as puzzles and co-created
something no human would have designed. None of this is an argument against fixing
errors. It is an argument that in low-stakes, creative contexts, imperfection is
material — and that charm must never be asked to do the work of recovery in a
system where being wrong hurts someone.

## Why It Matters

Weeks 5 and 6 established that AI systems must be fair and answerable. Week 7
supplies the part that survives contact with reality: they will still be wrong,
and the failure is the design surface. That reframes the deliverable. A concept is
not finished when the happy path works; it is finished when you can say what the
system does when it is uncertain, how the user notices, how they override it, who
is harmed if no one catches it, and who is accountable for reviewing it. Those are
precisely the questions the peer review asks of the final projects — *what could
this misunderstand, who could it harm, can the user challenge it, how does it
recover* — and they are not a critique checklist. They are the specification.
