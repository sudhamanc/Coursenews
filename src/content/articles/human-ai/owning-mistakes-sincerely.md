---
course: human-ai
lectureId: R4
title: "No Apology Beats a Bad One"
deck: "When a voice assistant gets it wrong, the words it chooses next decide whether you use it again — and a CHI study finds that blaming the engineering team is worse for the product than saying nothing at all."
order: 12
readingTime: 11
tags: ["apology", "voice-assistants", "trust-repair", "blame", "error-mitigation"]
concepts:
  - id: error-mitigation
    term: Error Mitigation
    definition: "What a system does after a breakdown to repair the user's perception of it — distinct from error recovery, which fixes the task. Strategies include explanation, compensation, and apology; apologies matter most for long-term willingness to return."
  - id: apology-sincerity
    term: Sincerity of Apology
    definition: "Whether an apology is delivered seriously or casually. Serious, neutral phrasing reads as more genuine than humor; the casual register undercuts the acknowledgment even when the words admit fault."
  - id: blame-assignment
    term: Blame Assignment
    definition: "Whether the agent attributes the error internally (to itself) or externally (to an engineering team, an update, the environment, or the user). The choice interacts with how human-like the agent seems."
  - id: bad-apology-effect
    term: The Bad-Apology Effect
    definition: "An apology that shifts blame can leave users less willing to keep using a system than no apology at all — reversing the human-interaction finding that even superfluous apologies help."
  - id: anthropomorphism
    term: Anthropomorphism and Attribution
    definition: "The more human-like an agent seems, the more blame people assign to it and the more they expect it to own its mistakes; machine-like agents are treated more like tools, where external attribution can be tolerated."
  - id: recovery-strategies
    term: Recovery Strategy Categories
    definition: "Six documented ways conversational systems respond to breakdowns — confirmation, information, disclosure, social, solve, and ask. Apology belongs to the social category and is usually combined with others."
  - id: perceived-intelligence
    term: Perceived Intelligence and Likeability
    definition: "Standard measures of how competent, knowledgeable, responsible, and pleasant an agent seems. Both rose when the agent accepted blame and apologized seriously, showing that owning a mistake reads as competence rather than weakness."
---

The scenario is deliberately trivial. You ask a voice assistant to add a *bow* to
your shopping cart, and it adds an archery bow instead of a hair bow — a homonym
error, the kind of intent misrecognition every speech system produces daily. You
flag the mistake, the assistant tries again, and this time it gets it right. The
task is repaired. Nothing has been lost. **What thirty-seven people were then asked
to judge was the sentence the assistant said next — and those sentences produced
significantly different opinions of how intelligent, likeable, and worth keeping
the assistant was.**

## Why the Apology Is Its Own Design Problem

Speech systems fail for structural reasons: imperfect sensing, ambiguous language,
limited comprehension, similar-sounding words. Meanwhile expectations are inflated
by futuristic portrayals of what assistants can do, so even small failures land as
violations. Prior work on service breakdowns — between humans, and between humans
and robots — established that mitigation matters and that different strategies do
different jobs. Compensation restores immediate satisfaction; explanation clarifies;
but apology is what predicts the willingness to come back, because it enables an
emotional shift toward forgiveness rather than a transactional settlement.

Two variables were unresolved for voice. The first is sincerity. An apology has to
sound genuine to work, and there is evidence that people perceive machines as "not
having regret" at all — which raises the question of whether a machine can be
sincere in any sense a user will credit. The second is blame. Prior findings pull
in opposite directions depending on embodiment: for anthropomorphic, autonomous
agents, taking the blame repairs trust more effectively, while for machine-like
agents, attributing fault to external factors can protect the agent's image. Voice
assistants sit awkwardly between those poles — they speak in a recognizably human
register while being, visibly, a speaker on a shelf.

## The Design of the Study

Participants worked through a simulated online shopping task with five different
assistants, each presented as a beta product from a different team. Each ordered
five items; each made a homonym error on the second, third, or fourth. The recovery
itself was held constant — every agent said "Let's try that again" and then
correctly identified the item on the second attempt — so that the only thing varying
was the apology. Four conditions crossed two factors, plus a control that offered no
apology at all.

<figure>
<svg viewBox="0 0 820 300" role="img" aria-label="A two-by-two matrix crossing serious versus casual apology with accepting versus shifting blame. The serious plus accept quadrant is highlighted as most preferred; the shift-blame column is marked as rated below offering no apology at all.">
  <defs>
    <marker id="arw-mah-mtx" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" class="dgm-fill"/>
    </marker>
  </defs>
  <text x="300" y="38" text-anchor="middle" font-size="12.5" font-weight="700">Accepts the blame</text>
  <text x="596" y="38" text-anchor="middle" font-size="12.5" font-weight="700">Shifts the blame</text>
  <text x="36" y="118" text-anchor="middle" font-size="12.5" font-weight="700" transform="rotate(-90 36 118)">Serious</text>
  <text x="36" y="238" text-anchor="middle" font-size="12.5" font-weight="700" transform="rotate(-90 36 238)">Casual</text>
  <g class="dgm-accent">
    <rect x="152" y="54" width="296" height="118" class="dgm-soft" stroke="currentColor" stroke-width="1.8"/>
    <text x="300" y="86" text-anchor="middle" font-size="11.5" font-weight="700">“I'm sorry for the inconvenience.</text>
    <text x="300" y="104" text-anchor="middle" font-size="11.5" font-weight="700">I have difficulty distinguishing</text>
    <text x="300" y="122" text-anchor="middle" font-size="11.5" font-weight="700">between homonyms.”</text>
    <text x="300" y="150" text-anchor="middle" font-size="11">most intelligent · most likeable</text>
  </g>
  <rect x="448" y="54" width="296" height="118" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="596" y="86" text-anchor="middle" font-size="11.5">“The engineering team must have</text>
  <text x="596" y="104" text-anchor="middle" font-size="11.5">made an error in the system</text>
  <text x="596" y="122" text-anchor="middle" font-size="11.5">update last night.”</text>
  <text x="596" y="150" text-anchor="middle" font-size="11" class="dgm-muted">rated below saying nothing</text>
  <rect x="152" y="172" width="296" height="98" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="300" y="204" text-anchor="middle" font-size="11.5">“Sorry for the mishap. English</text>
  <text x="300" y="222" text-anchor="middle" font-size="11.5">isn't natural for agents…”</text>
  <text x="300" y="250" text-anchor="middle" font-size="11" class="dgm-muted">owns it, but undercuts it</text>
  <rect x="448" y="172" width="296" height="98" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="596" y="204" text-anchor="middle" font-size="11.5">“Embarrassing… sometimes I don't</text>
  <text x="596" y="222" text-anchor="middle" font-size="11.5">know what they're doing.”</text>
  <text x="596" y="250" text-anchor="middle" font-size="11" class="dgm-muted">lowest recovery satisfaction</text>
  <line x1="128" y1="284" x2="176" y2="284" stroke="currentColor" stroke-width="1.3" marker-end="url(#arw-mah-mtx)"/>
  <text x="300" y="288" text-anchor="middle" font-size="10.5" class="dgm-muted">both dimensions have to be right</text>
</svg>
<figcaption><b>Four ways to say sorry.</b> Sincerity and blame are not interchangeable levers — getting either one wrong drags the agent below the version that apologized not at all.</figcaption>
</figure>

The serious-and-accepting agent said: *"I am sorry for the inconvenience. I confused
the items because there are multiple items for this keyword. From time to time, I
have difficulty distinguishing between homonyms."* The casual-and-shifting agent
said: *"Sorry for the mishap. The engineering team must have made an error in the
system last night... Embarrassing. Sometimes I don't know what they're doing behind
my back."* Participants rated each agent on service-recovery satisfaction, perceived
intelligence, likeability, and willingness to use it in future.

## What People Actually Preferred

The manipulation check confirmed the blame factor read as intended, and the results
were consistent across measures. The agent that apologized seriously and accepted
the blame was rated **more intelligent** than the agent that apologized seriously
but deflected, than the one that accepted blame casually, and than the one that did
both badly. It was rated **more likeable** than every other agent, including the
control that offered no apology at all. And it produced significantly higher
**service-recovery satisfaction** than the casual, blame-shifting version.

The striking result is the one about the future. On willingness to keep using the
assistant, participants preferred the **control** — the agent that simply said
"Let's try that again" and offered nothing — over the agent that apologized
seriously while blaming the engineering team. This inverts the human-to-human
finding that even a superfluous apology builds trust by signalling empathy. Here, an
apology that performs contrition while routing responsibility elsewhere reads as
evasion, and evasion costs more than silence. A bad apology is not a weak version of
a good one. It is a different act, with the opposite sign.

<figure>
<svg viewBox="0 0 800 240" role="img" aria-label="A ranking of five conditions by willingness to keep using the assistant: serious plus accepting highest, then casual plus accepting, then no apology, then casual plus shifting, with serious plus shifting rated below the no-apology control.">
  <defs>
    <marker id="arw-mah-rank" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" class="dgm-fill"/>
    </marker>
  </defs>
  <line x1="150" y1="40" x2="150" y2="196" stroke="currentColor" stroke-width="1.4"/>
  <line x1="150" y1="196" x2="756" y2="196" stroke="currentColor" stroke-width="1.4"/>
  <text x="86" y="46" text-anchor="middle" font-size="11" font-weight="700">better</text>
  <text x="86" y="192" text-anchor="middle" font-size="11" font-weight="700">worse</text>
  <line x1="112" y1="56" x2="112" y2="180" stroke="currentColor" stroke-width="1.2" stroke-dasharray="4 3" marker-end="url(#arw-mah-rank)"/>
  <g class="dgm-accent">
    <rect x="182" y="52" width="118" height="144" class="dgm-soft" stroke="currentColor" stroke-width="1.6"/>
    <text x="241" y="74" text-anchor="middle" font-size="11" font-weight="700">Serious +</text>
    <text x="241" y="90" text-anchor="middle" font-size="11" font-weight="700">accept</text>
  </g>
  <rect x="316" y="86" width="118" height="110" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="375" y="108" text-anchor="middle" font-size="11">Casual +</text>
  <text x="375" y="124" text-anchor="middle" font-size="11">accept</text>
  <rect x="450" y="104" width="118" height="92" fill="none" stroke="currentColor" stroke-width="1.5" stroke-dasharray="5 4"/>
  <text x="509" y="126" text-anchor="middle" font-size="11" font-weight="700">No apology</text>
  <text x="509" y="142" text-anchor="middle" font-size="10.5" class="dgm-muted">(control)</text>
  <rect x="584" y="126" width="118" height="70" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="643" y="148" text-anchor="middle" font-size="11">Shifts the</text>
  <text x="643" y="164" text-anchor="middle" font-size="11">blame</text>
  <text x="452" y="228" text-anchor="middle" font-size="11" class="dgm-muted">deflecting responsibility fell below offering nothing at all</text>
</svg>
<figcaption><b>Willingness to use it again.</b> The dashed control is the floor a mitigation strategy must clear — and the blame-shifting apologies did not clear it.</figcaption>
</figure>

## Sincerity Is a Register, Not a Sentiment

It is worth being precise about what "sincerity" means operationally here. Nobody
claims the assistant feels remorse. What was manipulated was tone: a serious,
neutral apology versus a humorous one leaning on the *ones-and-zeros* joke. Prior
work on smart speakers had already found neutral apologies perceived as more sincere
than humorous ones, and this study replicates that pattern and extends it. The
practical reading is that sincerity in a machine is a communicative register the
designer chooses, not an inner state the machine possesses — and that the register
is legible to users, who penalize a joke offered in place of an acknowledgment.

The authors are careful about limits. This was a low-fidelity simulation with no
real money at stake, no time pressure, and a single session; the error was
competence-based, minor, and successfully recovered. Whether a sincere apology
supports *long-term* repair is untested. So is the interaction with embodiment,
gendered voice — all agents used a female-gendered voice, matching the industry
default and its own critiques — and error severity. And they leave three open
questions that are really design questions: *when* an agent should apologize (low
severity errors may warrant none), *what for*, and *how*, given that the correct
blame attribution shifts with how human-like the agent appears.

## Why It Matters

For a week built around designing the moment after failure, this study supplies the
sentence-level evidence. Recovery mechanics — retry, N-best lists, handoff — restore
the task. The apology governs whether the person comes back. Two components have to
be right at once: the agent must own the mistake, and it must sound like it means
it. Get either wrong and you land below the baseline of saying nothing, which means
the cheerful deflection that feels like good PR — *there was a system update, the
team is looking into it* — is measurably worse for the product than an unadorned
"let's try again." Owning a failure does not make a system look weaker. In this
data, it made it look smarter.
