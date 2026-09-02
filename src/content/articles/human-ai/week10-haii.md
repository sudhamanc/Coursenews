---
course: human-ai
lectureId: W10
title: "The Autumn After the Hype"
deck: "The final week argues that the future of human–AI interaction will not be settled by what models can do, but by what people choose to delegate, preserve, question, and redesign — and that the discipline's job is to treat machine learning as a design material rather than a finished product to be wrapped in an interface."
order: 10
readingTime: 14
tags: ["human-centered-ai", "hci", "hype", "power", "design-material"]
concepts:
  - id: knowledge-to-learning
    term: From Knowledge-Based AI to Learned Models
    definition: "The 1980s attempt to hand-code expert knowledge failed because tacit human reasoning is embodied and socially situated rather than a sequence of deductions. Statistical learning replaced the rules, and traded formalization difficulty for opacity."
  - id: competing-hcai
    term: Competing Definitions of Human-Centered AI
    definition: "Stanford HAI frames it as humanistic enhancement, Wei Xu as an HCI-led design agenda, and Ben Shneiderman as high human control combined with high automation. Each definition privileges the discipline that authored it."
  - id: power-reallocation
    term: The Reallocation of Power
    definition: "Critical AI scholarship holds that fairness cannot be judged by performance metrics alone, because deployment redistributes power: developers choose the data, objectives, and acceptable risks, while the affected communities influence none of them."
  - id: extraction-incentive
    term: The Extraction Incentive
    definition: "Rushkoff's warning that even humane AI can be redirected toward capturing attention, harvesting data, shaping behavior, and maintaining dependency — so ethical design cannot hold when the surrounding economy rewards extraction."
  - id: hai-spectrum
    term: The Spectrum of Human–AI Relationships
    definition: "Human emulation (AI-led, replicating human perception or judgment), human-in-the-loop (people label, correct, and validate for a system that still leads), and collaborative teaming (hybrid intelligence with shared framing, judgment, and performance)."
  - id: ai-autumn
    term: The AI Autumn
    definition: "Not a winter — funding and use continue — but a cooling in which inflated claims about self-taught systems, full autonomy, and conversational parity fade, leaving the practical, narrower, human-centered applications that actually work."
  - id: retrofitting
    term: Retrofitting Human-Centeredness
    definition: "Building the model first and calling in UX afterwards to wrap it in an interface. It fails because it treats a probabilistic, uncertain system as a finished and reliable product whose behavior the interface merely presents."
  - id: ml-design-material
    term: Machine Learning as a Design Material
    definition: "Treating a model's uncertainty, failure modes, and data dependence as properties to design with — mixed-initiative control, visible confidence, narrow problem framing, invested data quality, and prototyped interaction."
  - id: intelligence-augmentation
    term: Intelligence Augmentation
    definition: "The Bush–Engelbart tradition of using computing to expand human capability rather than replicate it, which human-centered design returns to as the limits of general machine intelligence become clearer."
---

The course ends where it is hardest to end a course about technology: on the
question of what the technology is *for*. Week 10's answer is deliberately
uncomfortable for anyone hoping the models will settle it. The future of human–AI
interaction, the lecture argues, is not determined by what AI can do. It is
determined by what people choose to delegate, preserve, question, and redesign. Every
capability is an invitation to a decision, and the decision is ours.

## What the Rules Could Not Hold

The 1980s bet on hand-coded knowledge and logical rules, and it broke on a problem
HCI scholars had already named: tacit human knowledge resists formalization.
Reasoning is embodied, socially situated, and shaped through action rather than
executed as a chain of deductions, so the attempt to transcribe an expert's judgment
into if-then statements loses precisely the part that made it expertise. The
response was not better rules but a change of target — from automating human
reasoning to designing technology that supports human action in real contexts.

Machine learning then replaced most of those rules with statistical models,
accelerated by compute, data availability, and frameworks, and arriving in three
familiar arrangements: **supervised learning**, where humans label data and train,
test, tune, and validate; **unsupervised learning**, where models find structure in
unlabeled data; and **interactive machine learning**, where people iteratively guide
and correct the model. Deep learning then extended reach across images, speech, and
text — and introduced the cost that defines the rest of this course. Complex neural
networks are difficult to interpret, so determining *why* a model produced a result,
or which features drove it, becomes hard exactly when the stakes justify asking.
Deep learning remains excellent at statistical pattern recognition and short on
common sense, causal understanding, and contextual judgment. The field traded a
formalization problem for an opacity problem.

## Three Disciplines, Three Definitions

"Human-centered AI" has become common vocabulary and uncommon agreement, because
each definition reflects the discipline that produced it. **Stanford HAI** frames it
humanistically: AI should reflect the depth and complexity of human intelligence,
enhance human capability rather than replace people, and account for its broader
effects on individuals and society. **Wei Xu** builds on that but puts HCI
professionals at the center — ethically aligned design that promotes fairness and
avoids unnecessary human replacement, human-like intelligence that better reflects
human cognition, and human-factors design that keeps systems explainable,
understandable, useful, and usable. His prescription that HCI practitioners should
develop deep AI expertise draws the lecture's practical caveat: UX professionals
tend to be more effective collaborating closely with data scientists than trying to
become machine-learning experts themselves.

**Ben Shneiderman** defines HCAI as amplifying human performance through reliable,
safe, and trustworthy systems, and his framework is the most operational of the
three: combine high human control with high automation, identify the cases where
full human or full computer control is genuinely appropriate, and avoid excessive
reliance on either. The critique the lecture offers is worth holding onto — an
engineering orientation leaves less room to question how "good performance" was
defined in the first place. A design-centered view surfaces the tradeoffs that
metric hides: diagnostic accuracy bought at the price of physician deskilling, for
instance, or the creative possibilities that a purely performance frame never asks
about.

## Fairness Is a Question About Power

The systemic conflict arrives when these systems stop being mathematics and become
social infrastructure. Algorithmic opacity plus historical training data reproduces
structural inequality in the domains where it matters most. In **criminal justice and
child welfare**, systems informing bail, sentencing, recidivism, and screening carry
forward racial and socioeconomic disparities — and excluding protected
characteristics does not help, because models reconstruct them from ZIP code,
income, education, and employment history. In **healthcare**, models can identify
pathologies and read images while leaving clinicians unable to verify the reasoning,
and unrepresentative training data degrades performance for exactly the populations
already underserved; clinical AI research among vulnerable populations raises further
questions about consent, protection, and who shares in the benefit.

The critical-AI move is to insist that this cannot be evaluated as a performance
problem. Fairness metrics do not capture how a deployment **redistributes power**.
Developers and the organizations funding them choose the data, the objectives, and
the acceptable risks; the communities living with the results usually have no
influence over design or deployment. That asymmetry is the finding, and no
confusion matrix reports it.

Three forces keep it in place. **Efficiency over inclusion**: AI development sits
inside a system that rewards scale, speed, and automation, which conflicts directly
with the contextual understanding, data justice, and participation that ethical
practice requires. **Extraction**: Douglas Rushkoff's warning that even humane AI can
be turned toward capturing attention, collecting personal data, shaping behavior,
and sustaining financial dependency. **Erosion of autonomy**: systems that decide for
people under the banner of convenience and personalization, a paternalistic
automation that weakens self-efficacy and normalizes the surrender of privacy. The
conclusion is blunt — ethical AI cannot rest on responsible design alone when the
surrounding economic and political system rewards extraction, control, and growth.

Geopolitics compounds it. Competition between major powers pushes ethics, privacy,
and human rights behind national security and economic advantage; China has advanced
"cyber sovereignty" and exported surveillance technology while Western regulation
stays fragmented. Ethical values are not universal — cultures and governments weigh
privacy, autonomy, collective security, and state authority differently — and AI is
overwhelmingly built in the Global North, leaving much of the world underrepresented
in datasets, design decisions, and governance. No international body can impose
binding standards on sovereign states or multinational firms, so high-risk
development continues, including autonomous weapons and automated "disinformation"
detection that can as easily automate lethal decisions or suppress dissent.
Development is global; governance is not.

## The Spectrum, Not the Switch

Against that backdrop the lecture offers the framework most likely to survive
contact with real design work. The human–AI relationship is not a binary between
automated and manual. It is a spectrum defined by who holds agency, how decisions
get made, and where control sits.

<figure>
<svg viewBox="0 0 860 312" role="img" aria-label="A spectrum of human-AI relationships from AI-led human emulation on the left, through human-in-the-loop in the middle, to collaborative teaming on the right, with bars showing human agency rising and AI-led decision-making falling across the range.">
  <defs>
    <marker id="arw-w10-spec" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" class="dgm-fill"/>
    </marker>
  </defs>
  <rect x="24" y="34" width="252" height="112" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="150" y="58" text-anchor="middle" font-size="12.5" font-weight="700">HUMAN EMULATION</text>
  <text x="150" y="77" text-anchor="middle" font-size="11" class="dgm-muted">AI-led</text>
  <text x="150" y="100" text-anchor="middle" font-size="10.5">replicates perception, cognition,</text>
  <text x="150" y="117" text-anchor="middle" font-size="10.5">or judgment to automate the task</text>
  <text x="150" y="137" text-anchor="middle" font-size="10.5" class="dgm-muted">the person is outside the loop</text>
  <rect x="304" y="34" width="252" height="112" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="430" y="58" text-anchor="middle" font-size="12.5" font-weight="700">HUMAN-IN-THE-LOOP</text>
  <text x="430" y="77" text-anchor="middle" font-size="11" class="dgm-muted">human-supported AI</text>
  <text x="430" y="100" text-anchor="middle" font-size="10.5">people label, correct, validate,</text>
  <text x="430" y="117" text-anchor="middle" font-size="10.5">and feed the pipeline</text>
  <text x="430" y="137" text-anchor="middle" font-size="10.5" class="dgm-muted">still AI-led; the role is predefined</text>
  <g class="dgm-accent">
    <rect x="584" y="34" width="252" height="112" class="dgm-soft" stroke="currentColor" stroke-width="1.7"/>
    <text x="710" y="58" text-anchor="middle" font-size="12.5" font-weight="700">COLLABORATIVE TEAMING</text>
    <text x="710" y="77" text-anchor="middle" font-size="11">hybrid intelligence</text>
    <text x="710" y="100" text-anchor="middle" font-size="10.5">humans frame, question, judge;</text>
    <text x="710" y="117" text-anchor="middle" font-size="10.5">AI scales pattern and workload</text>
    <text x="710" y="137" text-anchor="middle" font-size="10.5">complementary, mutual, shared</text>
  </g>
  <line x1="24" y1="184" x2="836" y2="184" stroke="currentColor" stroke-width="1.4" marker-end="url(#arw-w10-spec)"/>
  <text x="24" y="206" font-size="10.5" class="dgm-muted">HUMAN AGENCY</text>
  <rect x="150" y="220" width="14" height="18" class="dgm-fill" stroke="none"/>
  <rect x="430" y="220" width="14" height="38" class="dgm-fill" stroke="none"/>
  <rect x="710" y="220" width="14" height="66" class="dgm-fill" stroke="none"/>
  <text x="157" y="252" text-anchor="middle" font-size="10" class="dgm-muted">low</text>
  <text x="437" y="272" text-anchor="middle" font-size="10" class="dgm-muted">bounded</text>
  <text x="717" y="298" text-anchor="middle" font-size="10">shared</text>
  <text x="430" y="170" text-anchor="middle" font-size="10.5" class="dgm-muted">the design choice is where on this line your system sits — and whether you said so out loud</text>
</svg>
<figcaption><b>Three relationships, not two states.</b> Human-in-the-loop is often mistaken for partnership, but it keeps the system AI-led and confines people to tasks the pipeline defines; collaborative teaming is the only point on the line where humans still frame the problem.</figcaption>
</figure>

**Human emulation** puts AI in the lead — imitating human vision to detect plant
disease, grading student work, automating emergency decisions — with human agency
correspondingly limited. **Human-in-the-loop** systems have people supporting the
pipeline by labeling, correcting classifications, validating predictions, and giving
feedback; the input improves the model, but the system remains AI-led and the human
role stays inside boundaries someone else drew. In regulated fields such as
healthcare, continuous learning may even be restricted, since approved models must
stay stable and predictable. **Collaborative teaming** is the one that balances
control with automation: humans frame problems, ask creative questions, apply
contextual judgment, and spot bias, while AI processes scale and reduces cognitive
load — people as participants rather than passive monitors.

The domain cases show what the spectrum costs when it is chosen carelessly. In
**radiology**, high image accuracy is not the same as good performance once false
positives, healthcare costs, patient outcomes, and clinician deskilling are counted;
practitioners need enough AI literacy and clear protocols to retain meaningful
control. In **aviation and autonomous vehicles**, the failure mode is the handover:
people are poorly suited to passively monitoring automation and then assuming
control instantly in an emergency, and driving demands social judgment,
improvisation, and care for passengers that no perception stack supplies. In
**creative writing**, writers want a partner, not a replacement — a system that
respects their intentions and stylistic boundaries, reveals patterns and biases,
generates alternatives, and leaves the interpreting to them.

## Winter, Autumn, and What Actually Shipped

The lecture is pointed about the gap between marketing and engineering. Earlier AI
winters followed inflated promises resting on thin capability; the current moment
looks more like an **AI autumn**, where the exaggerated claims cool while the
practical, human-centered applications keep working. Four claims illustrate the gap:
"self-taught" systems still depend on humans to design environments, gather data, and
structure learning; fully autonomous vehicles were predicted for 2020 and did not
arrive; assistants such as Alexa recognize commands without conducting genuine
conversation; and AI still lacks common sense, causal reasoning, and reliable
transfer across domains. Modern AI is better understood as statistical pattern
recognition than general intelligence — deep learning remains, in the lecture's
borrowed phrase, greedy, brittle, opaque, and shallow. Those limits surface hardest
where human behavior is unpredictable, which is why a vehicle that performs well
under controlled conditions still struggles with the improvisation and social
judgment that ordinary driving requires. When a system ignores situated human
context, technical performance stops predicting practical success.

## Designing With the Material, Not Around It

The constructive half of the argument returns to **intelligence augmentation** — the
Bush and Engelbart tradition of expanding human capability rather than replicating
it — and names the anti-pattern that keeps HCI at the wrong end of the process.
**Retrofitting human-centeredness** is the practice of building the model first and
calling designers in afterwards to wrap it in an interface. It fails because it
treats a probabilistic, uncertain system as a finished and reliable product, when
the uncertainty is the thing that most needs designing for.

<figure>
<svg viewBox="0 0 860 260" role="img" aria-label="Two development paths compared: retrofitted human-centeredness, where a model is built then handed to UX for an interface, and machine learning as a design material, where problem framing, data quality, and interaction prototyping run alongside model development in a loop.">
  <defs>
    <marker id="arw-w10-mat" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" class="dgm-fill"/>
    </marker>
  </defs>
  <text x="34" y="30" font-size="11" class="dgm-muted">RETROFIT</text>
  <rect x="150" y="14" width="164" height="46" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="232" y="42" text-anchor="middle" font-size="11.5">build the model</text>
  <rect x="360" y="14" width="164" height="46" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="442" y="42" text-anchor="middle" font-size="11.5">wrap an interface</text>
  <rect x="570" y="14" width="234" height="46" fill="none" stroke="currentColor" stroke-width="1.3" stroke-dasharray="4 3"/>
  <text x="687" y="35" text-anchor="middle" font-size="11" class="dgm-muted">uncertainty arrives as a surprise</text>
  <text x="687" y="52" text-anchor="middle" font-size="11" class="dgm-muted">to the user, not a designed property</text>
  <line x1="316" y1="37" x2="356" y2="37" stroke="currentColor" stroke-width="1.4" marker-end="url(#arw-w10-mat)"/>
  <line x1="526" y1="37" x2="566" y2="37" stroke="currentColor" stroke-width="1.4" marker-end="url(#arw-w10-mat)"/>
  <line x1="24" y1="86" x2="836" y2="86" stroke="currentColor" stroke-width="1" class="dgm-muted"/>
  <g class="dgm-accent">
    <text x="34" y="116" font-size="11">DESIGN MATERIAL</text>
    <rect x="150" y="100" width="152" height="50" class="dgm-soft" stroke="currentColor" stroke-width="1.6"/>
    <text x="226" y="121" text-anchor="middle" font-size="11.5" font-weight="700">frame the problem</text>
    <text x="226" y="139" text-anchor="middle" font-size="10.5">narrow, socially meaningful</text>
    <rect x="330" y="100" width="152" height="50" class="dgm-soft" stroke="currentColor" stroke-width="1.6"/>
    <text x="406" y="121" text-anchor="middle" font-size="11.5" font-weight="700">invest in data</text>
    <text x="406" y="139" text-anchor="middle" font-size="10.5">collect, label, maintain</text>
    <rect x="510" y="100" width="152" height="50" class="dgm-soft" stroke="currentColor" stroke-width="1.6"/>
    <text x="586" y="121" text-anchor="middle" font-size="11.5" font-weight="700">show uncertainty</text>
    <text x="586" y="139" text-anchor="middle" font-size="10.5">confidence and gaps, visibly</text>
    <rect x="690" y="100" width="152" height="50" class="dgm-soft" stroke="currentColor" stroke-width="1.6"/>
    <text x="766" y="121" text-anchor="middle" font-size="11.5" font-weight="700">prototype the interaction</text>
    <text x="766" y="139" text-anchor="middle" font-size="10.5">interpret, correct, recover</text>
  </g>
  <line x1="304" y1="125" x2="326" y2="125" stroke="currentColor" stroke-width="1.4" marker-end="url(#arw-w10-mat)"/>
  <line x1="484" y1="125" x2="506" y2="125" stroke="currentColor" stroke-width="1.4" marker-end="url(#arw-w10-mat)"/>
  <line x1="664" y1="125" x2="686" y2="125" stroke="currentColor" stroke-width="1.4" marker-end="url(#arw-w10-mat)"/>
  <path d="M766 152 L766 190 L226 190 L226 154" fill="none" stroke="currentColor" stroke-width="1.4" stroke-dasharray="5 4" marker-end="url(#arw-w10-mat)"/>
  <text x="496" y="212" text-anchor="middle" font-size="11">what people do with the prototype re-frames the problem</text>
  <text x="496" y="238" text-anchor="middle" font-size="10.5" class="dgm-muted">running a model is no longer the differentiator — knowing which problem to point it at is</text>
</svg>
<figcaption><b>Where the interaction work belongs.</b> Retrofitting hands designers a finished artifact and asks them to conceal its uncertainty; treating ML as a design material makes uncertainty, data quality, and recovery first-class inputs from the start.</figcaption>
</figure>

The five practices follow from that. **Design for uncertainty** with mixed-initiative
interaction that negotiates control, communicates confidence, and supports recovery
from error. **Make uncertainty visible** so users know when data is incomplete or the
system is unsure. **Frame the right problems** — narrow, socially meaningful ones
matched to what the technology actually does. **Prioritize data quality**, because
collection, labeling, and maintenance shape behavior more directly than architecture
does. **Prototype the interaction**, testing how people interpret, use, correct, and
collaborate with the system rather than only how the model scores. As model tooling
commoditizes, running a model stops being the differentiator; identifying a
meaningful human problem, designing the interaction, and validating that the result
genuinely helps is where the remaining value sits.

## Why It Matters

Ten weeks built toward a single reframing. Week 2 established that people bring
cognitive expectations to systems that do not share them; Weeks 3 and 4 gave the
frameworks and the prototyping methods; Week 5 asked whose values were encoded;
Week 6 demanded that a black box be answerable; Week 7 treated failure as a design
surface; Week 8 moved the object of governance from stored data to manufactured
inference; Week 9 showed that the argument between replacement and partnership has
been running since 1960. Week 10 closes it by refusing to treat the outcome as a
forecast. The systems will keep improving, and improvement answers none of the
questions that matter: which decisions stay human, what the system does when it is
unsure, who is harmed when it is confidently wrong, and whether the people affected
had any say in its design. The lecture's closing question is the whole course
compressed to one line — *what kind of human–AI relationship do you want to help
create?* — and it is addressed to designers because they are among the few people in
the room whose job description includes answering it.
