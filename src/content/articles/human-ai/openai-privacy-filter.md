---
course: human-ai
lectureId: R6
title: "A Small Model That Knows What to Forget"
deck: "OpenAI's Privacy Filter is a 1.5-billion-parameter redactor that reads a document once, decides which spans are personal, and runs on your own machine — a precise answer to a narrow question, released the same year the field concluded that narrow answers are not enough."
order: 16
readingTime: 10
tags: ["privacy", "pii", "redaction", "open-weights", "privacy-by-design"]
concepts:
  - id: pii-redaction
    term: PII Detection and Redaction
    definition: "Finding personally identifiable information in unstructured text and masking it. Traditional tools match deterministic patterns such as phone and email formats, which handles narrow cases and misses anything whose sensitivity depends on context."
  - id: token-classification
    term: Bidirectional Token Classification
    definition: "Labeling every token of an input in a single forward pass rather than generating text one token at a time. The model starts from an autoregressive checkpoint and swaps the language-modeling head for a classification head over a fixed label set."
  - id: span-decoding
    term: Constrained Span Decoding
    definition: "Turning per-token labels into coherent spans using BIOES tags and a constrained Viterbi pass, so a masked region begins and ends on sensible boundaries instead of fragmenting mid-entity."
  - id: local-execution
    term: Local Execution
    definition: "Running the redactor on-device so unfiltered text never leaves the machine. This closes the gap in which data must be transmitted to a remote service in order to be de-identified — the moment it is most exposed."
  - id: privacy-taxonomy
    term: The Privacy Taxonomy
    definition: "Eight span categories the model predicts: private_person, private_address, private_email, private_phone, private_url, private_date, account_number, and secret — the last covering passwords and API keys."
  - id: operating-point
    term: Configurable Operating Point
    definition: "A tunable threshold trading recall against precision, letting a team decide whether over-redaction or missed identifiers is the cheaper error for their workflow — the precision–recall choice, exposed as a deployment control."
  - id: context-aware-detection
    term: Context-Aware Detection
    definition: "Deciding whether a name or number is sensitive from surrounding text rather than format alone, including distinguishing information that should be preserved because it is public from information that must be masked because it concerns a private individual."
---

The example in OpenAI's announcement is a piece of ordinary office correspondence: a
follow-up email to a colleague named Jordan, confirming a launch date, citing a
project file number, offering a phone number and an address to reply to. Run it
through **Privacy Filter** and it comes back with the name, the date, the account
number, the email, and the phone replaced by bracketed labels — while the subject
line, the business context, and the meaning survive intact. The interesting part is
the date. A launch date is not inherently private. *That* date, attached to those
people, was judged to be. **The model is making a contextual judgment, not matching
a pattern, and that distinction is the whole argument for building it.**

## What Was Wrong With Regular Expressions

Conventional PII tooling is deterministic. It knows the shape of a phone number and
the syntax of an email address, and within those narrow cases it is reliable and
cheap. It fails at everything whose sensitivity is situational: a name that matters
here and not there, an identifier in an unfamiliar format, a reference that is
private only because of the sentence around it. It also cannot make the distinction
that most often matters in practice — between information that should be preserved
because it concerns a public matter and information that must be removed because it
concerns a private individual.

Privacy Filter is built to make exactly that call, by pairing general language
understanding with a privacy-specific label set.

## One Pass, Eight Labels

Architecturally it is a departure from how most people now expect a language model
to work. Rather than generating an answer token by token, it is a **bidirectional
token classifier with span decoding**: it begins from an autoregressive pretrained
checkpoint, replaces the language-modeling head with a token-classification head
over a fixed taxonomy, and is post-trained with a supervised classification
objective. Every token is labeled in a single forward pass, and those labels are
then resolved into clean spans by a constrained Viterbi procedure over BIOES tags.

<figure>
<svg viewBox="0 0 840 250" role="img" aria-label="A pipeline: raw text enters a bidirectional encoder, every token is labelled in one forward pass, constrained span decoding groups labels into coherent spans, and masked text is produced — all on the local device.">
  <defs>
    <marker id="arw-pf-pipe" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" class="dgm-fill"/>
    </marker>
  </defs>
  <rect x="24" y="56" width="150" height="56" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="99" y="80" text-anchor="middle" font-size="11.5" font-weight="700">Unstructured text</text>
  <text x="99" y="98" text-anchor="middle" font-size="10.5" class="dgm-muted">up to 128k tokens</text>
  <line x1="174" y1="84" x2="212" y2="84" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-pf-pipe)"/>
  <g class="dgm-accent">
    <rect x="216" y="56" width="176" height="56" class="dgm-soft" stroke="currentColor" stroke-width="1.6"/>
    <text x="304" y="80" text-anchor="middle" font-size="11.5" font-weight="700">Token classifier</text>
    <text x="304" y="98" text-anchor="middle" font-size="10.5">every token, one pass</text>
  </g>
  <line x1="392" y1="84" x2="430" y2="84" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-pf-pipe)"/>
  <rect x="434" y="56" width="176" height="56" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="522" y="80" text-anchor="middle" font-size="11.5" font-weight="700">Span decoding</text>
  <text x="522" y="98" text-anchor="middle" font-size="10.5" class="dgm-muted">BIOES · constrained Viterbi</text>
  <line x1="610" y1="84" x2="648" y2="84" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-pf-pipe)"/>
  <rect x="652" y="56" width="164" height="56" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="734" y="80" text-anchor="middle" font-size="11.5" font-weight="700">Masked text</text>
  <text x="734" y="98" text-anchor="middle" font-size="10.5" class="dgm-muted">[PRIVATE_EMAIL]</text>
  <rect x="24" y="140" width="792" height="52" fill="none" stroke="currentColor" stroke-width="1.4" stroke-dasharray="6 4"/>
  <text x="420" y="162" text-anchor="middle" font-size="11.5" font-weight="700">all of it on the local device — 1.5B total parameters, 50M active</text>
  <text x="420" y="181" text-anchor="middle" font-size="10.5" class="dgm-muted">unfiltered text never has to be transmitted in order to be de-identified</text>
  <text x="420" y="222" text-anchor="middle" font-size="10.5" class="dgm-muted">a generative model would emit the redaction token by token; this one labels and stops</text>
</svg>
<figcaption><b>Label, then resolve.</b> Classification in a single pass is what makes the model fast enough for high-throughput pipelines; span decoding is what stops a masked entity from fragmenting halfway through.</figcaption>
</figure>

That design buys four properties that matter in production: it is fast, because
there is one forward pass rather than a generation loop; it is context-aware,
because the language prior survives the conversion; it handles up to **128,000
tokens** of context; and its operating point is configurable, so a team can trade
recall against precision to suit the workflow. The released model has **1.5 billion
total parameters with 50 million active**.

It predicts eight categories — `private_person`, `private_address`,
`private_email`, `private_phone`, `private_url`, `private_date`, `account_number`,
and `secret`. The last two are the pragmatic ones: `account_number` spans banking
and credit-card identifiers, and `secret` covers passwords and API keys, which
makes the model useful against the very ordinary disaster of a credential pasted
into a log.

## The Numbers, With Their Asterisk

On the PII-Masking-300k benchmark the model reports an F1 of **96%** (94.04%
precision, 98.04% recall). On a corrected version of the same benchmark — corrected
because OpenAI identified annotation errors in it during evaluation — F1 rises to
**97.43%** (96.79% precision, 98.08% recall). It is worth pausing on a vendor
grading itself against a benchmark it also amended; the reasoning is disclosed, but
a claim of state-of-the-art performance "when corrected for annotation issues we
identified" is a claim that rests on the identifier's own judgment.

The adaptation result is the more useful one for practitioners. Fine-tuning on a
small amount of in-domain data moved F1 from **54% to 96%** on a domain-adaptation
benchmark, approaching saturation. Read that in both directions: the model adapts
cheaply, *and* out-of-the-box performance on an unfamiliar domain can start near a
coin flip. Whichever way you read it, the conclusion is the same — measure it on
your own data before trusting it.

## Where Local Execution Actually Helps

The most consequential design decision is not the architecture but the size.
Because the model is small enough to run on-device, text can be redacted **before**
it goes anywhere. Every remote de-identification service has the same structural
flaw: to have your data cleaned, you must first transmit it dirty. Closing that gap
eliminates an entire exposure surface rather than mitigating it, and it is the
clearest instance in the whole release of privacy achieved by architecture instead
of by policy. It is released under Apache 2.0, on Hugging Face and GitHub, with a
model card documenting the taxonomy, decoding controls, intended uses, and
limitations.

## What It Does Not Claim

The limitations section is unusually direct, and reading it beside the Week 8
lecture is the point of assigning it. Privacy Filter is "not an anonymization tool,
a compliance certification, or a substitute for policy review in high-stakes
settings." Its behavior reflects the taxonomy it was trained on, so organizations
wanting different masking policies need in-domain evaluation or fine-tuning.
Performance varies across languages, scripts, naming conventions, and unfamiliar
domains. It can miss uncommon identifiers, and it can over- or under-redact when
context is thin — short strings being the hard case, since context is what the model
runs on. In legal, medical, and financial workflows, human review remains necessary.

## Why It Matters

Set this next to the week's central argument and the fit is exact — including where
it stops. The lecture's sharpest technical claim is that differential privacy,
federated learning, and audit tooling protect data *inside* a system while leaving
its purpose, its collection practices, its inferences, and its deployment
untouched. Privacy Filter belongs to that same category. It is a genuinely good
instance of it: a real capability improvement over pattern matching, given away
under a permissive licence, with an architecture that removes rather than manages a
risk. And it still cannot tell you whether the pipeline it is protecting should
exist, whether the text was collected with meaningful consent, or whether the model
downstream will infer from redacted text the very things the redaction removed.

OpenAI states the goal as models that "learn about the world, not about private
individuals." That is a statement about training data, and this tool serves it well.
Week 8's argument is that the harms which matter most now are downstream of
training — in what a deployed system concludes about a person and what institutions
do with that conclusion. A redactor is a necessary instrument. The distance between
necessary and sufficient is the week's entire syllabus.
