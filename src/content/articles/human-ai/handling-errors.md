---
course: human-ai
lectureId: R1
title: "Tolerate the Error, Never the Failure"
deck: "A designer's field guide to AI mistakes argues that the error message is not the afterthought at the edge of the product — it is where trust is either rebuilt or permanently spent."
order: 8
readingTime: 11
tags: ["error-handling", "ux-design", "trust", "feedback", "graceful-degradation"]
concepts:
  - id: error-failure-line
    term: The Error/Failure Line
    definition: "An error is an inconvenience the user can work around; a failure makes the system unusable or dangerous. Products should tolerate errors and never tolerate failures — and which one a mistake is depends on the stakes, not the error rate."
  - id: system-errors
    term: System Errors
    definition: "Mistakes rooted in the technology itself — data errors (mislabeled, incomplete, or missing training data), relevance errors (low-confidence or irrelevant output), model errors (an imprecise model or miscalibrated input weights), and invisible errors nobody notices."
  - id: user-errors
    term: User Errors
    definition: "Mistakes arising from the interaction: unexpected or incorrect input the system fails to interpret, and broken habits, where an adaptive interface moves or repurposes a control the user reaches for automatically."
  - id: user-perceived-errors
    term: User-Perceived Errors
    definition: "Output that is correct by the system's logic but wrong to the person — context errors from bad assumptions about preferences, and failstates where the system is simply not built to answer the request."
  - id: invisible-errors
    term: Invisible Errors and Happy Accidents
    definition: "Two error classes the interface never surfaces: background errors, wrong answers the user accepts as right and only stress-testing can catch; and happy accidents, low-confidence output that users find funny or useful."
  - id: graceful-failure
    term: Graceful Failure and Handoff
    definition: "Giving users a path forward when the AI fails — appropriate responses, explanation, feedback channels, disambiguation when uncertain, and returning control with enough context to take over safely."
  - id: disambiguation
    term: Disambiguation
    definition: "Offering several plausible options instead of one uncertain answer — N-best lists, 'did you mean', multiple suggestions. Effective in low-stakes settings and dangerous in high-stakes ones, where hesitation is itself a failure."
  - id: trust-recalibration
    term: Trust Recalibration
    definition: "Using the error moment to reset the user's mental model — acknowledging the mistake with humility, explaining what the system can and cannot do, and inviting the feedback that improves it."
---

The chapter that anchors this week opens not with a model but with a scam. A
student, hunting a laptop at half price, wires two hundred dollars to a stranger,
then a hundred more, then discovers the seller has deleted their account. He never
gets the money back. What he gets instead is a permanently revised policy about
strangers and large purchases. That is the shape of the argument: a mistake is not
merely a bad outcome, it is an event that rewrites how much someone is willing to
risk next time. **AI systems are probabilistic. They will be wrong. The only
variable a designer controls is what the being-wrong does to the relationship.**

## Humility Is a Feature

The chapter's central posture is that error handling is not damage control bolted
onto a finished product. Errors are part of the user experience, and designing for
them is a core UX problem — one that pays back, because a mistake is one of the
few moments a user is genuinely motivated to learn how the system works. People
forgive an AI that admits it is still learning; they do not forgive one that
carries itself as infallible and then fails. Humility is not decoration. It is the
mechanism that keeps a user's trust attached to what the system can actually do.

That reframing yields a working checklist: define what counts as an error versus a
failure; use feedback to discover errors you never anticipated; classify the error
by type; weigh the stakes; make sure the user knows something went wrong; never
blame them for it; write for understanding; and design a graceful path onward.

## The Line Between Inconvenience and Breakdown

Everything downstream depends on one distinction. A music service that returns
irrelevant results a fifth of the time is annoying — an **error**. An autonomous
car that crashes one time in five is a **failure**. The arithmetic is identical;
the verdict is not. Failure makes a system unusable or unsafe; error makes it
merely worse than it should be. So the rule is asymmetric: *tolerate errors, never
tolerate failures.* And the line moves with context. A typo in a message to a
colleague is nothing. The same dropped word in a medical dictation — "no symptoms
of hematoma" transcribed as "symptoms of hematoma" — inverts the meaning of a
patient record. Health, safety, finance, and socially sensitive settings are high
stakes; play, entertainment, and non-essential recommendations are not. Design the
response to the stakes, not to the error rate.

## Three Families of Mistake

The taxonomy separates faults in the machine from faults in the encounter.

<figure>
<svg viewBox="0 0 840 320" role="img" aria-label="A tree of AI error types with three branches: system errors containing data, relevance, model and invisible errors; user errors containing unexpected input and broken habits; and user-perceived errors containing context errors and failstates.">
  <defs>
    <marker id="arw-kore-tax" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" class="dgm-fill"/>
    </marker>
  </defs>
  <rect x="330" y="20" width="180" height="42" class="dgm-soft" stroke="currentColor" stroke-width="1.6"/>
  <text x="420" y="46" text-anchor="middle" font-size="13" font-weight="700">AI errors</text>
  <path d="M420 62 L420 82 L150 82 L150 106" fill="none" stroke="currentColor" stroke-width="1.4" marker-end="url(#arw-kore-tax)"/>
  <path d="M420 62 L420 106" fill="none" stroke="currentColor" stroke-width="1.4" marker-end="url(#arw-kore-tax)"/>
  <path d="M420 62 L420 82 L690 82 L690 106" fill="none" stroke="currentColor" stroke-width="1.4" marker-end="url(#arw-kore-tax)"/>
  <rect x="40" y="110" width="220" height="40" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="150" y="135" text-anchor="middle" font-size="12" font-weight="700">System errors</text>
  <text x="150" y="172" text-anchor="middle" font-size="11">Data errors</text>
  <text x="150" y="194" text-anchor="middle" font-size="11">Relevance errors</text>
  <text x="150" y="216" text-anchor="middle" font-size="11">Model errors</text>
  <g class="dgm-accent"><text x="150" y="238" text-anchor="middle" font-size="11">Invisible errors</text></g>
  <text x="150" y="272" text-anchor="middle" font-size="10.5" class="dgm-muted">the machine is wrong</text>
  <rect x="310" y="110" width="220" height="40" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="420" y="135" text-anchor="middle" font-size="12" font-weight="700">User errors</text>
  <text x="420" y="172" text-anchor="middle" font-size="11">Unexpected or</text>
  <text x="420" y="190" text-anchor="middle" font-size="11">incorrect input</text>
  <text x="420" y="216" text-anchor="middle" font-size="11">Breaking user habits</text>
  <text x="420" y="272" text-anchor="middle" font-size="10.5" class="dgm-muted">the interaction slips</text>
  <rect x="580" y="110" width="220" height="40" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="690" y="135" text-anchor="middle" font-size="12" font-weight="700">User-perceived</text>
  <text x="690" y="172" text-anchor="middle" font-size="11">Context errors</text>
  <text x="690" y="194" text-anchor="middle" font-size="11">Failstates</text>
  <text x="690" y="272" text-anchor="middle" font-size="10.5" class="dgm-muted">works as built, feels wrong</text>
  <line x1="40" y1="292" x2="800" y2="292" stroke="currentColor" stroke-width="1" stroke-dasharray="4 4" class="dgm-muted"/>
  <text x="420" y="312" text-anchor="middle" font-size="11" class="dgm-muted">every branch needs a different resolution — feedback, explanation, or restraint</text>
</svg>
<figcaption><b>A taxonomy of going wrong.</b> Only the left branch is a fault in the technology; the other two are faults in the encounter, and no amount of model accuracy fixes them.</figcaption>
</figure>

**System errors** come from the technology's own limits. *Data errors* are
upstream: mislabeled examples that confuse a golden retriever with a labrador;
incomplete data, so a health assistant fields heart questions but not kidney
stones; missing data, when a dog classifier is pointed at a person. *Relevance
errors* are the low-confidence answer that inspires no faith and the
high-confidence answer that has nothing to do with the request — a ride-hailing
app pitching holiday stays to someone travelling to a hospital. *Model errors*
arise when the architecture is imprecise or weighs inputs wrongly; the recurring
example is a viewer who liked one butter-chicken recipe and wanted more from that
creator, and instead receives an avalanche of butter chicken. Security flaws
belong here too: the stickers researchers placed on a stop sign so a vision system
read "speed limit 40." *Invisible errors* are the quiet ones — background errors,
wrong answers a confident system delivered and the user accepted, discoverable
only through stress testing; and **happy accidents**, where a technical failure
lands as a joke and users like it.

**User errors** need care with the word *user*. A person mistypes and expects
autocorrect that never comes. Or an adaptive interface repurposes the control they
reach for without looking — the button that was "next" is now a volume knob — and
the resulting mistake belongs to the design, not the person. The guidance is
blunt: do not break habits unnecessarily; give dynamic AI output its own territory
and keep search, settings, and close where they were; and if a habit must change,
offer the way back, as Twitter did when it let users return to a chronological
timeline.

**User-perceived errors** are the class unique to probabilistic systems. *Context
errors* happen when the system is working exactly as intended and the user
experiences it as broken — booking a flight quietly adds an event to the family
calendar; a service keeps promoting a performer the user has repeatedly disliked.
*Failstates* are honest incapacity: a voice assistant trained on English receives a
command in Hindi and has nothing to offer.

## The Anatomy of a Decent Failure

Against that taxonomy the chapter sets a short, unsentimental standard for what
happens next.

<figure>
<svg viewBox="0 0 820 244" role="img" aria-label="A ladder of graceful failure responses: indicate the error, avoid blaming the user, optimize for understanding, disambiguate when uncertain, and return control to the user, with stakes rising along the way.">
  <defs>
    <marker id="arw-kore-grace" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" class="dgm-fill"/>
    </marker>
  </defs>
  <rect x="26" y="64" width="142" height="58" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="97" y="88" text-anchor="middle" font-size="11.5" font-weight="700">Indicate</text>
  <text x="97" y="106" text-anchor="middle" font-size="10.5" class="dgm-muted">say it went wrong</text>
  <line x1="168" y1="93" x2="196" y2="93" stroke="currentColor" stroke-width="1.4" marker-end="url(#arw-kore-grace)"/>
  <rect x="200" y="64" width="142" height="58" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="271" y="88" text-anchor="middle" font-size="11.5" font-weight="700">Don't blame</text>
  <text x="271" y="106" text-anchor="middle" font-size="10.5" class="dgm-muted">no “illegal input”</text>
  <line x1="342" y1="93" x2="370" y2="93" stroke="currentColor" stroke-width="1.4" marker-end="url(#arw-kore-grace)"/>
  <rect x="374" y="64" width="142" height="58" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="445" y="88" text-anchor="middle" font-size="11.5" font-weight="700">Explain</text>
  <text x="445" y="106" text-anchor="middle" font-size="10.5" class="dgm-muted">plain words, not codes</text>
  <line x1="516" y1="93" x2="544" y2="93" stroke="currentColor" stroke-width="1.4" marker-end="url(#arw-kore-grace)"/>
  <rect x="548" y="64" width="142" height="58" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="619" y="88" text-anchor="middle" font-size="11.5" font-weight="700">Disambiguate</text>
  <text x="619" y="106" text-anchor="middle" font-size="10.5" class="dgm-muted">offer options</text>
  <line x1="690" y1="93" x2="718" y2="93" stroke="currentColor" stroke-width="1.4" marker-end="url(#arw-kore-grace)"/>
  <g class="dgm-accent">
    <rect x="722" y="64" width="76" height="58" class="dgm-soft" stroke="currentColor" stroke-width="1.6"/>
    <text x="760" y="88" text-anchor="middle" font-size="11.5" font-weight="700">Hand</text>
    <text x="760" y="105" text-anchor="middle" font-size="11.5" font-weight="700">off</text>
  </g>
  <line x1="26" y1="152" x2="798" y2="152" stroke="currentColor" stroke-width="1.3"/>
  <line x1="26" y1="146" x2="26" y2="158" stroke="currentColor" stroke-width="1.3"/>
  <line x1="798" y1="146" x2="798" y2="158" stroke="currentColor" stroke-width="1.3"/>
  <text x="120" y="176" text-anchor="middle" font-size="11">low stakes</text>
  <text x="120" y="194" text-anchor="middle" font-size="10.5" class="dgm-muted">disambiguation delights</text>
  <text x="690" y="176" text-anchor="middle" font-size="11">high stakes</text>
  <text x="690" y="194" text-anchor="middle" font-size="10.5" class="dgm-muted">hesitation is itself a failure</text>
  <text x="412" y="228" text-anchor="middle" font-size="11" class="dgm-muted">a car that offers the driver a menu instead of braking has already failed</text>
</svg>
<figcaption><b>The graceful-failure ladder.</b> Each rung is the right move somewhere on the stakes axis — and the same move is wrong at the other end of it.</figcaption>
</figure>

*Indicate that something went wrong*: the worst error message is the one that does
not exist, because a user who notices a mistake the system did not acknowledge
stops believing the system's silence anywhere else. *Do not blame the user* —
"Incorrect input" and "Illegal command" accuse; "We couldn't read that, could you
check and try again?" repairs. *Optimize for understanding*: "Cannot connect to the
internet right now — please try again later," never "Error 404." *Use the error as
an explanation*, since almost nobody reads documentation until they are in
trouble, which makes the failure moment the one reliable teaching slot in the whole
product. *Use it as a feedback channel*, because a system that asks for help
recalibrates its own mental model in the user's mind. *Disambiguate when
uncertain*: N-best lists, "did you mean," Siri asking whether you meant the
Faithless track or the Pink one. *Return control* — but honestly: an autonomous car
abruptly asking a passenger to take the wheel is not a handoff, it is an
abdication, and the handoff is only complete if the person receives situation
awareness, next steps, and the means to act. And finally, *assume intentional
abuse*: keep failure responses safe, boring, and unremarkable, because a
spectacular failure mode is an invitation, and an over-explained defense is a map.

## Why It Matters

The through-line is that error handling is trust engineering. Users are not
primarily asking *was the machine right*; they are asking *can I keep going
safely*, and the answer is written in what happens after the mistake. A system that
errs and does nothing loses more than the one that errs and explains. That is why
the same chapter that catalogues data pipelines ends on empathy: acknowledge the
mistake, communicate at the right register, offer a way forward, and let the person
correct you. It is also the practical bridge from this week's theory to a design
brief. Any project can specify the happy path. The measure of a finished design is
whether it specifies the other one — and whether, on the day it fails, the person
on the other side still has somewhere to go.
