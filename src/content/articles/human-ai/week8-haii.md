---
course: human-ai
lectureId: W8
title: "What the Machine Decides You Are"
deck: "Week 8 moves privacy past the question of what data an organization holds to the harder one — what it concludes about you from data it was allowed to collect, and whether you have any standing to argue."
order: 8
readingTime: 14
tags: ["privacy", "inference", "surveillance", "accountability", "copyright"]
concepts:
  - id: inferred-privacy-harm
    term: Inferential Privacy Harm
    definition: "Injury that arises from what a system concludes about a person rather than from what that person disclosed. The damaging fact is manufactured by the model, so consenting to the underlying data does not consent to the conclusion."
  - id: algorithmic-physiognomy
    term: Algorithmic Physiognomy
    definition: "Systems that claim to read internal traits — criminality, orientation, attention, trustworthiness — from faces, voices, or behavior, reviving the logic of discredited pseudosciences under a statistical veneer."
  - id: predictive-aggregation
    term: Predictive Aggregation
    definition: "Combining behavioral and demographic data not to describe what someone has done but to forecast what they will do, then acting on the forecast in employment, credit, insurance, policing, or sentencing."
  - id: reasonable-inferences
    term: The Right to Reasonable Inferences
    definition: "Sandra Wachter's proposal that people need protection from unjustified conclusions drawn from lawfully held data — a right to know, contest, and correct what an algorithm claims to know, not merely a right to correct the inputs."
  - id: scraping-reuse-loop
    term: The Scraping and Reuse Loop
    definition: "Treating 'publicly available' as 'free to take', then repurposing the resulting datasets for uses their subjects never anticipated — web-scraped faces becoming law-enforcement tools, research corpora becoming military or commercial assets."
  - id: technical-insufficiency
    term: Why Technical Safeguards Fall Short
    definition: "Differential privacy, federated learning, and membership-inference audits protect data inside a model. None of them ask whether the system should exist, whether its premise is valid, or whether its outputs enable discrimination."
  - id: consent-illusion
    term: The Illusion of Choice
    definition: "Notice-and-consent assumes a person can read, understand, and decline. Continuous, ambient, unavoidable collection makes that assumption false, converting consent into a formality that transfers risk onto the individual."
  - id: accountability-pillars
    term: The Three Pillars of Corporate Accountability
    definition: "Explainability with human review, transparency with retrospective audit, and proactive risk assessment before deployment — shifting the burden of preventing harm from the individual to the organization that profits from the data."
  - id: computer-generated-authorship
    term: Computer-Generated Authorship
    definition: "The split between jurisdictions requiring identifiable human creative expression for copyright (US, EU) and those assigning authorship by statute to whoever made the arrangements necessary for the work (UK, India, Ireland, New Zealand)."
---

Decades ago, the story goes, the U.S. military trained a neural network to spot
camouflaged tanks. It worked beautifully on held-out images and then collapsed on a
fresh batch. The tank photographs, someone eventually realized, had been shot on
cloudy days and the empty landscapes on sunny ones. The network had learned the
weather. It is the perfect parable of a model that is right for the wrong reason,
and it has been retold in classrooms and keynotes for forty years. Week 8 tells it
and then asks the question that matters: **did it actually happen?** Nobody
repeating it has checked. We accept it because it delivers the lesson we already
wanted — which is, precisely, the failure mode the story is about.

That is the week's method in miniature. Hold the comfortable account up to the
light and ask what is actually established.

## The Risk Is No Longer the Data

A systematic review of 321 documented AI incidents found that in **92.8%** of them
the technology's capabilities or data appetite either created a new privacy risk or
sharpened an existing one. Privacy failures spread across four dimensions — data
collection, processing, dissemination, and physical intrusion — but the structural
change underneath is singular. Traditional privacy law protects information you
handed over. The damage now often begins with information you never disclosed,
because the system *manufactured* it.

Three families make the shift concrete. **Generative distortion** exploits your
likeness without touching your data at all: tools that reverse the blurring meant
to conceal intimate imagery, face-swapping applications used to place real people
into fabricated sexual content — the harassment of the streamer QTCinderella being
the canonical case — and voice cloning that puts fabricated statements in a public
figure's mouth, or raises the question of posthumous consent when a documentary
synthesizes the voice of Anthony Bourdain. Nothing private was breached. The harm
required no breach.

**Algorithmic physiognomy** is the second, and the lecture is pointed about its
lineage: models claiming to read criminality or sexual orientation off a
photograph, classroom software inferring whether students are paying attention from
their faces, vocal-analysis products such as DeepScore scoring trustworthiness for
lenders and insurers. These are phrenology's claims with a confusion matrix
attached. **Predictive aggregation** is the third — an Argentine government model
that tried to forecast teenage pregnancy from names and addresses, the UK's
National Data Analytics Solution estimating who would commit or suffer serious
violence. Clicks, location, and eye movement become inputs to decisions about
employment, credit, insurance, and incarceration.

## The Gap Between a Hunch and a Profile

People have always drawn conclusions about each other. Sandra Wachter's argument is
that algorithmic inference differs in kind, not degree, and the difference is
whether you can argue back.

<figure>
<svg viewBox="0 0 840 300" role="img" aria-label="A comparison of analog and digital inference across five properties: source of information, explainability of the connection, whether it can be challenged, whether it persists after becoming outdated, and how widely it travels.">
  <defs>
    <marker id="arw-w8-inf" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" class="dgm-fill"/>
    </marker>
  </defs>
  <text x="250" y="30" text-anchor="middle" font-size="13" font-weight="700">Analog inference</text>
  <text x="250" y="48" text-anchor="middle" font-size="10.5" class="dgm-muted">a person forms a view of you</text>
  <g class="dgm-accent">
    <text x="640" y="30" text-anchor="middle" font-size="13" font-weight="700">Algorithmic inference</text>
    <text x="640" y="48" text-anchor="middle" font-size="10.5">a system forms a profile of you</text>
  </g>
  <line x1="445" y1="60" x2="445" y2="268" stroke="currentColor" stroke-width="1" stroke-dasharray="3 4" class="dgm-muted"/>
  <text x="60" y="86" font-size="10.5" class="dgm-muted">SOURCE</text>
  <text x="250" y="86" text-anchor="middle" font-size="11.5">what you chose to share</text>
  <text x="640" y="86" text-anchor="middle" font-size="11.5">what you left behind</text>
  <line x1="60" y1="98" x2="800" y2="98" stroke="currentColor" stroke-width="1" class="dgm-muted"/>
  <text x="60" y="126" font-size="10.5" class="dgm-muted">LOGIC</text>
  <text x="250" y="126" text-anchor="middle" font-size="11.5">usually explainable</text>
  <text x="640" y="126" text-anchor="middle" font-size="11.5">hidden or indirect</text>
  <line x1="60" y1="138" x2="800" y2="138" stroke="currentColor" stroke-width="1" class="dgm-muted"/>
  <text x="60" y="166" font-size="10.5" class="dgm-muted">RECOURSE</text>
  <text x="250" y="166" text-anchor="middle" font-size="11.5">answered in conversation</text>
  <text x="640" y="166" text-anchor="middle" font-size="11.5" font-weight="700">hard to inspect or correct</text>
  <line x1="60" y1="178" x2="800" y2="178" stroke="currentColor" stroke-width="1" class="dgm-muted"/>
  <text x="60" y="206" font-size="10.5" class="dgm-muted">DECAY</text>
  <text x="250" y="206" text-anchor="middle" font-size="11.5">shifts with new context</text>
  <text x="640" y="206" text-anchor="middle" font-size="11.5">persists once outdated</text>
  <line x1="60" y1="218" x2="800" y2="218" stroke="currentColor" stroke-width="1" class="dgm-muted"/>
  <text x="60" y="246" font-size="10.5" class="dgm-muted">REACH</text>
  <text x="250" y="246" text-anchor="middle" font-size="11.5">bounded by the encounter</text>
  <text x="640" y="246" text-anchor="middle" font-size="11.5">copied across institutions</text>
  <line x1="445" y1="276" x2="445" y2="292" stroke="currentColor" stroke-width="1.3" marker-end="url(#arw-w8-inf)"/>
  <text x="445" y="296" text-anchor="middle" font-size="10.5" class="dgm-muted">the asymmetry is agency, not accuracy</text>
</svg>
<figcaption><b>Two kinds of being judged.</b> A human assumption can be met with an explanation; an algorithmic profile is formed without your knowledge, travels without your involvement, and outlives the facts that produced it.</figcaption>
</figure>

Hence the proposed **right to reasonable inferences** — protection not merely from
inaccurate inputs but from unjustified conclusions drawn from accurate ones, and
what Wachter frames as a right to *be seen well*. The central question the lecture
puts is deceptively plain: should you be able to know, challenge, and correct what
an algorithm claims to know about you?

## Scraped, Reused, Leaked

The scale problem runs alongside the inference problem. "Publicly available" has
become a synonym for "free to take": LAION-5B was found to contain private medical
imagery harvested from the open web; Clearview AI scraped billions of photographs
into a facial-recognition product for police; research corpora such as PIPA and
IBM's Diversity in Faces were reportedly repurposed for military and commercial
development. Ambient collection compounds it — Gaggle scanning students' documents
and email, Ring doorbells recording the neighbours, Amazon Halo inferring emotion
from a user's voice, recognition models identifying people through masks and
glasses.

And the pipeline itself leaks. The Lee Luda chatbot disclosed personal details it
had absorbed from unredacted conversations. Contractors labelling Roomba training
data leaked intimate images captured inside people's homes — a reminder that
somewhere in most systems there is a human being looking at the data, and that the
annotation layer is a privacy surface nobody puts on the architecture diagram.

## Why the Mathematics Does Not Rescue You

This is the week's sharpest technical claim, and it lands directly on the field's
favourite reassurances. Differential privacy and federated learning genuinely
reduce the risk of establishing whether a particular person's record sat in a
training set. Neither asks whether the system should have been built, whether its
premise is scientifically coherent, whether the data was gathered with meaningful
consent, or whether the outputs will be used to discriminate. **A physiognomic
"criminality" classifier could implement federated learning flawlessly and remain
an instrument of harm.** Retrospective tools such as Privacy Meter probe a trained
model for leakage, which by construction is after both collection and training.
Broad ethics checklists fold privacy into one box among many and only work if the
practitioner already knows what to look for — the exact knowledge that cannot be
assumed. Technical controls protect data *within* a model while leaving its
purpose, provenance, inferences, and deployment untouched.

## Consent Was Never the Answer

Notice-and-consent assumes a person who can read the policy, understand it, and
walk away. Set that against cookie walls, dense terms, collection embedded in
services you cannot forgo, and passive tracking you never see. Smart cities,
traffic sensors, connected vehicles, and instrumented workplaces gather
continuously and offer no exit. Consent obtained under those conditions is not a
decision; it is paperwork that moves liability onto the person with the least power
to refuse. The lecture's conclusion is that the burden has to move to the
organizations collecting and monetizing the data.

<figure>
<svg viewBox="0 0 840 280" role="img" aria-label="An accountability system with upfront safeguards on the left — risk assessments and transparency documentation — and post-deployment controls on the right — retrospective audits and explainability with human review — joined by a feedback loop.">
  <defs>
    <marker id="arw-w8-acc" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" class="dgm-fill"/>
    </marker>
  </defs>
  <text x="215" y="28" text-anchor="middle" font-size="12.5" font-weight="700">Before deployment</text>
  <text x="640" y="28" text-anchor="middle" font-size="12.5" font-weight="700">After launch</text>
  <rect x="40" y="46" width="350" height="62" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="215" y="70" text-anchor="middle" font-size="11.5" font-weight="700">Risk assessment</text>
  <text x="215" y="90" text-anchor="middle" font-size="10.5" class="dgm-muted">foreseeable harms, who is affected, mitigations</text>
  <rect x="40" y="120" width="350" height="62" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="215" y="144" text-anchor="middle" font-size="11.5" font-weight="700">Transparency</text>
  <text x="215" y="164" text-anchor="middle" font-size="10.5" class="dgm-muted">purpose, data sources, limits, ownership</text>
  <rect x="466" y="46" width="350" height="62" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="641" y="70" text-anchor="middle" font-size="11.5" font-weight="700">Retrospective audit</text>
  <text x="641" y="90" text-anchor="middle" font-size="10.5" class="dgm-muted">real outcomes, disparities, emerging risk</text>
  <g class="dgm-accent">
    <rect x="466" y="120" width="350" height="62" class="dgm-soft" stroke="currentColor" stroke-width="1.7"/>
    <text x="641" y="144" text-anchor="middle" font-size="11.5" font-weight="700">Explainability + human review</text>
    <text x="641" y="164" text-anchor="middle" font-size="10.5">understand, challenge, correct a decision</text>
  </g>
  <line x1="390" y1="77" x2="462" y2="77" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-w8-acc)"/>
  <line x1="390" y1="151" x2="462" y2="151" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-w8-acc)"/>
  <path d="M641 182 L641 218 L215 218 L215 184" fill="none" stroke="currentColor" stroke-width="1.4" stroke-dasharray="5 4" marker-end="url(#arw-w8-acc)"/>
  <text x="428" y="238" text-anchor="middle" font-size="11">what the audit finds becomes the next assessment's input</text>
  <text x="428" y="266" text-anchor="middle" font-size="10.5" class="dgm-muted">foresight without hindsight is a checkbox; hindsight without foresight is an apology</text>
</svg>
<figcaption><b>Accountability as a loop.</b> Neither half is sufficient alone — assessments predict harms that audits then measure, and the measurements have to feed the next assessment.</figcaption>
</figure>

The three pillars are **explainability with human review** (meaningful information
about the factors behind a decision, reconsideration by a qualified person rather
than another automated system, and a real path to correction, scaled to the stakes);
**transparency with retrospective audit** (standardized disclosure of where AI is
used, documentation of limits and responsible parties, outcome audits over time, and
enough access for independent evaluation); and **proactive risk assessment**
proportionate to impact — a recommendation engine and a sentencing tool should not
face the same bar. The lecture is careful with the legal specifics: the GDPR
constrains certain solely automated decisions with significant effects but does not
guarantee a full technical explanation, and the Algorithmic Accountability Act
remains proposed, not law.

## When the Profile Becomes the Gate

Amazon's abandoned recruiting model is the case study because every failure in it is
governance, not mathematics. Trained on a decade of résumés from an overwhelmingly
male workforce, it penalized the word "women's," downgraded graduates of women's
colleges, and rewarded verbs more common in men's résumés. Gender was never an
input. The model rebuilt it from schools, zip codes, phrasing, and structure —
proxies engineers could suppress one at a time without any assurance that new ones
would not appear. Historical data had been accepted as a measure of merit,
similarity to current employees as a definition of qualification, and the burden of
noticing the discrimination fell on the applicants it excluded. **The system did not
remove human bias; it converted historical inequality into an apparently objective
score.**

## Owning the Output

The week closes on two ownership questions. In industry, machine learning turns
operational data into predictive maintenance and equipment-as-a-service, but value
accrues asymmetrically: the vendor sees the aggregate fleet while the operator who
generated the data gets a dashboard, which quietly converts a service contract into
long-term dependence. Locking data down preserves control and starves the model;
pooling it improves the model and surrenders control. The proposed "third way" —
keeping proprietary data in place, exchanging trained models or approved insights
rather than raw records, and recording provenance in auditable registries — is
promising and not automatically safe, since shared models can leak their training
data, carry bias across organizations, and blur liability. As the lecture notes,
a ledger can record a provenance claim; it cannot make the claim true.

On creative work, jurisdictions have split. The United States and the EU require
identifiable human creative contribution, so fully AI-generated output is not
copyrightable and prompting alone generally does not qualify — protection attaches
to human selection, arrangement, or modification. The UK, India, Ireland, and New
Zealand retain statutory provisions assigning authorship of computer-generated works
to whoever made the arrangements necessary to create them, a formula written long
before generative models and largely untested against them.

## Why It Matters

Week 6 argued that a black box must be answerable and Week 7 that failure is a
design surface. Week 8 supplies the thing both were circling: the object of
governance is not the data an organization holds but the conclusions it
manufactures and acts on. That reframes the design brief. It is not enough to ask
what your system stores. Ask what it *infers*, whether the person can see that
inference, whether they can contest it, how long it survives being wrong, and how
far it travels once it exists. And keep the tank story in view while you do —
because the most durable lesson of the week is that a conclusion which flatters our
expectations is the one we are least likely to audit.
