---
course: agents-and-autonomy
lectureId: "12F"
title: "Mostly Just Software: The Twelve-Factor Agent"
deck: "The agents that hold up in front of customers are ordinary programs with a model at the decision points. A 2025 field guide distills how to build them into twelve rules — the Twelve-Factor App, rewritten for language models."
order: 0
readingTime: 19
tags: ["agentic-ai", "agent-architecture", "context-engineering", "tool-calling", "human-in-the-loop", "llm-engineering"]
source:
  title: "12-Factor Agents: Principles for building reliable LLM applications"
  author: "Dex Horthy and contributors, HumanLayer"
  url: "https://github.com/humanlayer/12-factor-agents"
  license: "CC BY-SA 4.0"
  licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/"
concepts:
  - id: twelve-factor-agents
    term: 12-Factor Agents
    definition: "A set of engineering principles, modeled on Heroku's Twelve-Factor App, for building LLM-powered software reliable enough for production: put the model at the decision points, and keep prompts, context, state, and control flow in code you own."
  - id: structured-tool-call
    term: Tool Call as Structured Output
    definition: "Output, usually JSON matching a schema, in which a model names an action and its arguments. The model executes nothing; deterministic code decides whether, when, and how to act on it."
  - id: context-engineering
    term: Context Engineering
    definition: "Deliberately choosing and formatting everything a model sees on a given call (instructions, retrieved documents, history, tool results, errors, and memory) to get the best next output from a stateless model."
  - id: unified-state
    term: Unified State
    definition: "Keeping execution state (current step, waiting status, retry count) in the same event log as business state (what has happened), so that one serializable thread is the agent's only source of truth."
  - id: launch-pause-resume
    term: Launch / Pause / Resume
    definition: "Treating an agent like any program: start it with a simple API call, let it save itself and stop mid-task, and continue it later from an outside trigger such as a webhook."
  - id: human-contact-tool
    term: Human Contact as a Tool
    definition: "Modeling a question or approval request to a person as one more structured tool call, so the agent can pause, reach someone on any channel, and resume with the answer recorded as an event."
  - id: owned-control-flow
    term: Owned Control Flow
    definition: "Writing the agent loop yourself, so each kind of step can be run and looped, paused for a person, retried, summarized, or checked, and so execution can stop between choosing a tool and running it."
  - id: error-compaction
    term: Error Compaction
    definition: "Feeding a failed tool call back into the context as a short, useful description so the model can correct itself, with a retry limit after which control escalates to a person."
  - id: micro-agent
    term: Small, Focused Agent
    definition: "An agent scoped to one well-defined job of roughly three to twenty steps, embedded in a larger deterministic system, so its context stays short and its behavior reliable."
  - id: outer-loop-agent
    term: Outer-Loop Agent
    definition: "An agent started by an event such as a schedule, an alert, or an incoming email rather than by a chat message. It works on its own and contacts people only when it needs input or approval."
  - id: stateless-reducer
    term: Stateless Reducer
    definition: "The view of an agent as a pure function that folds a list of events into the next step. Given the same thread it makes the same decision, and it holds no hidden state of its own."
  - id: pre-fetch-context
    term: Pre-fetched Context
    definition: "Data fetched deterministically and placed in the context before the model asks for it, whenever the model would almost certainly ask, saving a round trip and a decision."
---

In 2011, Adam Wiggins, a co-founder of the cloud platform Heroku, published a
short manifesto called **The Twelve-Factor App**. It invented nothing. It wrote
down what Heroku's engineers had learned from watching hundreds of thousands of
applications run on their platform: keep configuration in the environment, treat
databases and queues as attachable resources, run the app as stateless processes
that start fast and shut down gracefully. Those twelve rules became a shared
vocabulary for cloud-native software and for the microservices that followed it.

In the spring of 2025, Dex Horthy, founder of the startup HumanLayer, did the
same for software built on large language models. **12-Factor Agents** grew out
of a pattern he kept seeing in conversations with more than a hundred founders
and engineers trying to make their products agentic. Its central observation is
almost deflating: the "AI agents" that hold up in front of paying customers are
not very agentic at all. They are mostly ordinary, deterministic software, with a
language model placed at exactly the points where a judgment call is needed. The
twelve factors are the rules for building that kind of software on purpose.

## The Demo That Doesn't Ship

The popular picture of an agent is a loop. Give a model a prompt and a bag of
tools; let it pick a tool; run the tool; append the result to the conversation;
repeat until the model says it is done. Nobody has to write the workflow. The
model works out the path at run time, recovers from errors, and now and then
finds a route no engineer would have coded.

The guide's account of what happens next will be familiar to anyone who has
shipped one. A team decides to build an agent, picks a framework so it can move
fast, and quickly reaches 70 to 80 percent quality. Then it learns that 80
percent is not good enough for a feature customers depend on, and that the last
stretch needs control over exactly the parts the framework hid: the prompt, what
goes into the context, how one step leads to the next. The team reverse-engineers
the framework, and finally starts over.

The loop fails in a specific way. Every turn adds to the context window, and as
the context grows, models lose focus. They repeat failed approaches, drift from
the original instruction, and spin. Anyone who has watched a coding assistant
degrade over a long session, and opened a fresh chat to fix it, has seen this.
Somewhere past ten to twenty turns a naive loop becomes a mess the model cannot
dig itself out of. An agent that is right nine times in ten sounds impressive
until you remember that nobody would ship a web page that failed to load one
time in ten.

What the guide found working in production instead was the **micro-agent**: a
small agent loop embedded in a larger, mostly deterministic pipeline. Code merges
the change, builds it, and runs the tests. Then an agent takes over one short,
well-scoped job — planning a production deploy, say, asking a person to approve
each step, and adapting when the person replies "do the backend first." When the
agent reports done, deterministic code takes over again and runs the checks.

<figure>
<svg viewBox="0 0 640 320" role="img" aria-label="Two agent designs. Top: a model and a bag of tools in a loop, with the context growing every turn. Bottom: a pipeline of ordinary steps — build, run tests, verify and ship — with one small agent step inside it.">
  <defs>
    <marker id="arw-12f-loop" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" class="dgm-fill"/>
    </marker>
  </defs>
  <text x="20" y="24" font-size="14" font-weight="700">The demo: loop until done</text>
  <rect x="40" y="42" width="150" height="56" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="115" y="75" text-anchor="middle" font-size="16" font-weight="700">Model</text>
  <rect x="450" y="42" width="150" height="56" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="525" y="75" text-anchor="middle" font-size="16" font-weight="700">Bag of tools</text>
  <line x1="190" y1="60" x2="446" y2="60" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-12f-loop)"/>
  <text x="318" y="52" text-anchor="middle" font-size="14">pick a tool</text>
  <line x1="450" y1="82" x2="194" y2="82" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-12f-loop)"/>
  <text x="318" y="102" text-anchor="middle" font-size="14">append the result</text>
  <g class="dgm-accent-2">
    <text x="320" y="136" text-anchor="middle" font-size="14" font-style="italic">context grows every turn until the model loses the thread</text>
  </g>
  <g class="dgm-muted">
    <line x1="20" y1="158" x2="620" y2="158" stroke="currentColor" stroke-width="1" stroke-dasharray="4 4"/>
  </g>
  <text x="20" y="186" font-size="14" font-weight="700">What ships: ordinary code with one agent step</text>
  <rect x="20" y="204" width="132" height="60" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="86" y="239" text-anchor="middle" font-size="14">Build</text>
  <rect x="176" y="204" width="132" height="60" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="242" y="239" text-anchor="middle" font-size="14">Run tests</text>
  <g class="dgm-accent">
    <rect x="332" y="204" width="132" height="60" fill="none" stroke="currentColor" stroke-width="2.5"/>
    <text x="398" y="229" text-anchor="middle" font-size="14" font-weight="700">Agent step</text>
    <text x="398" y="249" text-anchor="middle" font-size="14">plan · ask · adapt</text>
  </g>
  <rect x="488" y="204" width="132" height="60" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="554" y="239" text-anchor="middle" font-size="14">Verify &amp; ship</text>
  <line x1="152" y1="234" x2="172" y2="234" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-12f-loop)"/>
  <line x1="308" y1="234" x2="328" y2="234" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-12f-loop)"/>
  <line x1="464" y1="234" x2="484" y2="234" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-12f-loop)"/>
  <g class="dgm-muted">
    <text x="320" y="300" text-anchor="middle" font-size="14">code owns the workflow; the model decides inside one small box</text>
  </g>
</svg>
<figcaption><b>Loop versus pipeline.</b> The demo agent (top) circles a bag of tools until its growing context overwhelms it. The production pattern (bottom) keeps the workflow in ordinary code and hands the model one small, bounded decision.</figcaption>
</figure>

## What an Agent Really Is

Strip away the framework vocabulary, the guide argues, and an agent is four
ordinary programming constructs:

1. **A prompt** that tells the model how to behave and which actions it may
   choose, and asks for the next step as structured output.
2. **A switch statement** that reads that output and decides what code to run.
3. **Accumulated context**: a record of the steps taken so far and their results.
4. **A loop** that feeds the record back to the model until it emits a terminal
   step such as "done."

Every one of those parts is code, and the twelve factors are about who owns each
part: you, or a framework you cannot see into. The guide is careful not to attack
frameworks or the people who build them. Its argument is narrower. The fastest
route to good AI features is usually to take small, modular ideas from agent
building and add them to software you already have, rather than rewrite the
product inside an agent framework. None of the factors requires the others, and
adopting one is worth it on its own.

A running example helps. Picture a support agent for an online store that
handles refund requests. It can look up an order, issue a refund (which moves
money, so a manager approves anything large), ask the customer or a manager a
question, and report back when it is finished.

## The Twelve at a Glance

| # | Factor | The rule in one line |
| --- | --- | --- |
| 1 | Natural language to tool calls | Turn a request into a structured action that code can execute. |
| 2 | Own your prompts | Keep prompts as versioned, testable code, not framework internals. |
| 3 | Own your context window | Decide exactly what the model sees, in whatever format works best. |
| 4 | Tools are just structured outputs | A "tool call" is JSON; your code chooses how to act on it. |
| 5 | Unify execution state and business state | Read where the agent is from the record of what happened. |
| 6 | Launch/pause/resume with simple APIs | Start, stop, and continue an agent like any other program. |
| 7 | Contact humans with tool calls | Asking a person is just another structured action. |
| 8 | Own your control flow | Write the loop, so you can pause, approve, retry, or summarize. |
| 9 | Compact errors into the context window | Feed failures back briefly, cap the retries, then escalate. |
| 10 | Small, focused agents | Scope each agent to a few steps inside a deterministic system. |
| 11 | Trigger from anywhere, meet users where they are | Start agents from events and from channels people already use. |
| 12 | Make your agent a stateless reducer | Treat the agent as a pure function from events to the next step. |
| 13 | Pre-fetch the context you might need | If the model will surely ask for it, fetch it first. |

The thirteenth is the guide's own honorable mention, filed as an appendix. The
twelve fall into four groups, and the rest of this feature takes them in order:
what goes into and out of the model (1–4), how an agent's state is kept and
resumed (5–6), who controls each step (7–9), and how agents fit into larger
systems (10–12).

## Part I · What Goes In and Out of the Model

### Factor 1 · Natural Language to Tool Calls

The atomic move of agent building is translation. A customer writes, "I was
charged twice for order 1042, can I get one of those back?" The model's job is
not to reply in prose. It is to turn that sentence into a structured object that
names an action and its arguments:

```json
{
  "intent": "lookup_order",
  "order_id": "1042",
  "reason": "customer reports a duplicate charge"
}
```

From there, ordinary code takes over: it validates the object, calls the order
system, and decides what happens next. Turning loose language into a well-formed
action is the one thing language models do that no amount of conventional code
can, and the guide treats it as the base unit everything else is built from.
Notice what the factor leaves out. Nothing says the model must then run the tool,
read the result, and loop; that is a separate choice, taken up in Factor 8.

### Factor 2 · Own Your Prompts

Many frameworks let you declare an agent with a role, a goal, a personality, and
a list of tools, and they assemble the actual prompt for you. That is a fast way
to start with good prompt engineering and a slow way to reach production, because
the words that reach the model are hidden, and those words are the main
interface between your application and the model.

The factor says to treat prompts as first-class code: write them yourself, keep
them in version control, and review changes to them like any other change.
Owning the prompt brings the ordinary benefits of owning code. You can write
tests and evaluations for it, change it the day a failure shows up in
production, read exactly what the model was told when something goes wrong, and
try unconventional techniques, such as unusual uses of the system, user, and
assistant roles, that a framework's template would never let you express. The
guide's recurring refrain applies here first: nobody knows the best prompt in
advance, so you want the freedom to try everything.

### Factor 3 · Own Your Context Window

Language models are stateless functions. What comes out depends entirely on what
goes in, so at every step an agent's input reduces to one request: *here is what
has happened so far; what is the next step?* How you write the first half of
that sentence is what came to be called **context engineering**, a term that
caught on across the industry within a couple of months of the guide's
publication.

Context is everything the model sees: the instructions, documents retrieved from
a search index, the history of tool calls and their results, memory carried over
from related conversations, and the specification of what structured output to
produce. The standard way to send it is the chat-message format, a list of
system, user, assistant, and tool messages. That format works, but it is not
required, and it is not always the most efficient use of tokens or of the
model's attention.

Owning the context window means keeping your own representation of the agent's
history and choosing how to render it on each call. One approach the guide shows
packs the whole history into a single message of tagged events, each written
compactly:

```xml
<customer_message>
  from: maria@example.com
  text: I was charged twice for order 1042.
</customer_message>

<lookup_order_result>
  order: 1042 · 86.00 USD · delivered
  charges: 2 (one duplicate)
</lookup_order_result>

What is the next step?
```

The format is not the point; the freedom is. Owning the window lets you pack
more information into fewer tokens, present an error in the form most likely to
help the model recover (and remove it once resolved), keep sensitive data out of
the model's view entirely, and change the layout as you learn what your model
reads best.

<figure>
<svg viewBox="0 0 640 310" role="img" aria-label="On the left, the stored thread: five events — customer message, lookup order, lookup order result, issue refund, and a payments API timeout error. An arrow labeled render, your code, leads to the right: the context actually sent to the model, a short summary of the customer, the order, the failed refund, and the question what is the next step.">
  <defs>
    <marker id="arw-12f-render" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" class="dgm-fill"/>
    </marker>
  </defs>
  <text x="20" y="24" font-size="14" font-weight="700">The thread (stored)</text>
  <rect x="20" y="40" width="260" height="38" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="34" y="64" font-size="14">customer_message</text>
  <rect x="20" y="86" width="260" height="38" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="34" y="110" font-size="14">lookup_order</text>
  <rect x="20" y="132" width="260" height="38" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="34" y="156" font-size="14">lookup_order_result (2 KB)</text>
  <rect x="20" y="178" width="260" height="38" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="34" y="202" font-size="14">issue_refund · 86 USD</text>
  <g class="dgm-accent-2">
    <rect x="20" y="224" width="260" height="38" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <text x="34" y="248" font-size="14">error · payments API timeout</text>
  </g>
  <g class="dgm-muted">
    <text x="150" y="292" text-anchor="middle" font-size="14">retries used = errors in a row</text>
  </g>
  <line x1="290" y1="150" x2="356" y2="150" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-12f-render)"/>
  <text x="323" y="138" text-anchor="middle" font-size="14" font-weight="700">render</text>
  <g class="dgm-muted">
    <text x="323" y="172" text-anchor="middle" font-size="14">your code</text>
  </g>
  <text x="370" y="24" font-size="14" font-weight="700">The context (sent)</text>
  <rect x="370" y="40" width="250" height="222" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <g class="dgm-muted">
    <text x="384" y="66" font-size="14">Refunds agent. Rules: …</text>
  </g>
  <text x="384" y="96" font-size="14">Customer: charged twice</text>
  <text x="384" y="116" font-size="14">for order 1042.</text>
  <text x="384" y="146" font-size="14">Order 1042: 86 USD,</text>
  <text x="384" y="166" font-size="14">delivered, charged twice.</text>
  <text x="384" y="196" font-size="14">Refund failed: payments</text>
  <text x="384" y="216" font-size="14">API timed out (try 1 of 3).</text>
  <g class="dgm-accent">
    <text x="384" y="246" font-size="14" font-weight="700">What is the next step?</text>
  </g>
  <g class="dgm-muted">
    <text x="495" y="292" text-anchor="middle" font-size="14">compact, filtered, no secrets</text>
  </g>
</svg>
<figcaption><b>Store everything, send what helps.</b> The thread keeps every event in full, and the agent's status can be read straight off it. A renderer you write turns it into the context for the next call, compacting results, summarizing errors, and leaving out whatever the next decision does not need.</figcaption>
</figure>

### Factor 4 · Tools Are Just Structured Outputs

"Tool use" sounds as if the model reaches out and acts on the world. It does
not. A tool call is the model emitting JSON that matches a schema. Asking a model
to choose among `lookup_order`, `issue_refund`, and `request_human_input` is
asking it for one of three typed objects, each a small class with an `intent`
field and its arguments. Your code parses the object and decides what to do.

That separation is the factor. The model decides *what* should happen; your code
controls *how* it happens, and whether it happens at all. A model that "called"
`issue_refund` has refunded nothing. Code may run the refund at once, queue it
for approval, cap the amount, or ask a question first. Once a tool is understood
as data rather than as a function the model invokes, the next step no longer has
to be "run the matching function and return its result." It can be any behavior
you can write, which is what Factor 8 builds on.

## Part II · State and Lifecycle

### Factor 5 · Unify Execution State and Business State

Workflow systems traditionally keep two kinds of state apart. **Execution
state** is the machinery: the current step, the next step, whether the run is
waiting, how many retries it has used. **Business state** is the substance: the
messages, tool calls, and results so far. Agent frameworks often add a layer of
their own abstractions to track the machinery.

The guide suggests merging the two wherever you can. In most agents, execution
state is just metadata about what has happened, and can be read off the event
history. If the last event is an approval request with no reply, the agent is
waiting. If the last three events are errors, it has used three retries. Some
things genuinely cannot live in the thread (session tokens, credentials), and
those should be kept to a minimum.

The payoff is that one record does everything. The thread is the single source
of truth. It serializes and deserializes trivially. Debugging means reading one
history. A new kind of state is just a new event type. Resuming means loading
the thread; forking means copying part of it into a new one. And turning a run
into something a person can read, a Markdown log or a web view, is simple.

### Factor 6 · Launch/Pause/Resume with Simple APIs

Agents are programs, and programs have a lifecycle people already expect: start
them, check on them, stop them, pick them back up. Users, applications,
pipelines, and other agents should be able to launch an agent with one simple
API call. The agent, or the deterministic code around it, should be able to pause
when it reaches something slow, such as a long-running job or a person who has
not replied. And an outside event, such as a webhook, should be able to resume it
from where it stopped, without any deep integration with whatever orchestrates
it. The original Twelve-Factor App made a similar demand of web processes under
the name *disposability*: start fast, stop cleanly, lose nothing.

The guide flags a gap in many orchestrators. They can pause between steps, but
not at the one point that matters most: the moment between the model *selecting*
a tool and the code *executing* it. That is where a person would review a refund
before the money moves. With Factor 5's single serializable thread, pausing there
is cheap. Save the thread and exit; no process has to sit in memory, waiting.

## Part III · Control

### Factor 7 · Contact Humans with Tool Calls

Every model response opens with a quietly high-stakes choice: prose or structured
data? A plain-text answer begins with an ordinary word, while a tool call begins
with a special token that opens a JSON object, so a great deal rides on that first
token. The guide suggests taking the choice away. Have the model *always* emit
structured output, and make "talk to a person" one of the structured options —
an intent such as `request_human_input` or `done_for_now`, offered alongside the
real tools.

A human-contact tool can carry exactly what a person needs to answer quickly:

```python
class RequestHumanInput(BaseModel):
    intent: Literal["request_human_input"]
    question: str   # "Refund the duplicate 86 USD charge on order 1042?"
    context: str    # why the agent is asking
    urgency: Literal["low", "medium", "high"]
    format: Literal["free_text", "yes_no", "multiple_choice"]
    choices: list[str] = []
```

When the agent emits one, code records the request in the thread, saves the
thread, notifies the right person by Slack, email, or text message, and stops.
When the answer arrives, typically through a webhook, code loads the thread,
appends the reply as an event, and asks the model for the next step.

This inverts the familiar chat pattern. In a chatbot, a person starts the
conversation and the model responds. Here an agent, perhaps started by a
schedule or an alert, starts the conversation itself when it needs someone. The
same structure extends to several people answering different questions and to
agents asking other agents, and combined with Factor 6 it makes long,
multi-party workflows durable.

<figure>
<svg viewBox="0 0 640 280" role="img" aria-label="A timeline across three lanes: model, your code, and human. The model chooses issue_refund. Your code saves the thread, asks for approval, and exits. Hours pass with no process running. A human approves in Slack. Your code resumes the thread and runs the refund.">
  <defs>
    <marker id="arw-12f-pause" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" class="dgm-fill"/>
    </marker>
  </defs>
  <g class="dgm-muted">
    <text x="20" y="65" font-size="14" font-weight="700">Model</text>
    <text x="20" y="155" font-size="14" font-weight="700">Your code</text>
    <text x="20" y="245" font-size="14" font-weight="700">Human</text>
    <line x1="20" y1="105" x2="620" y2="105" stroke="currentColor" stroke-width="1" stroke-dasharray="4 4"/>
    <line x1="20" y1="195" x2="620" y2="195" stroke="currentColor" stroke-width="1" stroke-dasharray="4 4"/>
  </g>
  <rect x="110" y="38" width="150" height="44" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="185" y="56" text-anchor="middle" font-size="14">chooses</text>
  <text x="185" y="74" text-anchor="middle" font-size="14" font-weight="700">issue_refund</text>
  <rect x="200" y="128" width="150" height="44" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="275" y="146" text-anchor="middle" font-size="14">saves thread,</text>
  <text x="275" y="164" text-anchor="middle" font-size="14">asks, exits</text>
  <g class="dgm-accent">
    <rect x="320" y="218" width="150" height="44" fill="none" stroke="currentColor" stroke-width="2.5"/>
    <text x="395" y="236" text-anchor="middle" font-size="14" font-weight="700">approves</text>
    <text x="395" y="254" text-anchor="middle" font-size="14">in Slack</text>
  </g>
  <rect x="470" y="128" width="150" height="44" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="545" y="146" text-anchor="middle" font-size="14">resumes, then</text>
  <text x="545" y="164" text-anchor="middle" font-size="14">runs the refund</text>
  <line x1="200" y1="82" x2="248" y2="124" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-12f-pause)"/>
  <line x1="300" y1="172" x2="358" y2="214" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-12f-pause)"/>
  <line x1="440" y1="218" x2="518" y2="176" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-12f-pause)"/>
  <g class="dgm-muted">
    <line x1="350" y1="150" x2="466" y2="150" stroke="currentColor" stroke-width="1.5" stroke-dasharray="3 5"/>
    <text x="408" y="142" text-anchor="middle" font-size="14">hours pass</text>
  </g>
</svg>
<figcaption><b>The pause that makes high-stakes tools safe.</b> The model chooses a refund; code saves the thread and exits before anything runs. When a manager approves, possibly hours later, a webhook resumes the thread and code performs the refund.</figcaption>
</figure>

### Factor 8 · Own Your Control Flow

If the loop is yours, every kind of step can behave differently. In the refund
agent, three intents get three treatments:

```python
while True:
    step = llm.next_step(render(thread))
    thread.append(step)

    if step.intent == "lookup_order":          # cheap and safe: run it, keep going
        thread.append(result(orders.get(step.order_id)))
        continue

    if step.intent == "request_human_input":   # someone must answer: save and stop
        save(thread); notify(step); break

    if step.intent == "issue_refund":          # moves money: stop for approval
        save(thread); request_approval(step); break
```

The same control lets you insert whatever a production system needs between the
model's choice and its effect: summarizing or caching tool results, having a
second model check structured output (the "LLM-as-judge" pattern), compacting
the context as it grows, logging, tracing and metrics, client-side rate limiting,
and durable "wait for this event" sleeps.

The guide is blunt about the alternative. Without a way to interrupt between
choosing a tool and running it, a team has three bad options. It can hold the
task in memory while it waits, and start over from scratch if the process dies.
It can restrict the agent to harmless work like research and summaries. Or it
can give the agent real power and hope for the best.

### Factor 9 · Compact Errors into the Context Window

One genuine strength of agents is self-repair. When a tool call fails, a capable
model can often read the error and fix its next attempt: a malformed ID, a
missing field, a date range it got backwards. This is the most portable of the
twelve factors, and teams that adopt nothing else can still use it. Catch the
error, add a short, useful description of it to the thread, and let the model
try again.

```python
try:
    thread.append(result(run(step)))
    consecutive_errors = 0
except ToolError as err:
    consecutive_errors += 1
    thread.append(Event("error", summarize(err)))   # brief, not a raw stack trace
    if consecutive_errors >= 3:
        escalate_to_human(thread); break
```

Two cautions keep self-repair from turning into a spin. First, cap the attempts.
Around three consecutive failures is a sensible point to stop and hand the
problem to a person, whether the model asks for help or code takes over. Second,
remember that you own the context. You need not replay the raw error at all: you
can rewrite it, collapse earlier failed attempts into one line, or drop resolved
errors entirely. The strongest defense against spinning, though, is the next
factor.

## Part IV · The Shape of the Whole

### Factor 10 · Small, Focused Agents

Big tasks take many steps, many steps make long contexts, and long contexts are
where models lose their way. So instead of one agent that does everything, build
agents that each do one thing well, scoped to roughly three to ten steps and
twenty at the outside, and make them components of a larger system that is
mostly deterministic code. Small agents have short contexts and clear
responsibilities, give the model fewer ways to get lost, and are easier to test
and debug.

The obvious objection is that models keep improving. Once one can handle a
hundred-step workflow, won't all this be unnecessary? The guide's answer is no,
for a reason anyone who has refactored a large codebase will recognize. Small
agents deliver reliable results now, and their scope can grow one well-tested
step at a time as models become dependable over longer contexts. The guide
quotes a member of the team behind Google's NotebookLM: the most magical results
come from building right at the edge of what the model can do. Find that edge,
stay just inside it, and widen the agent's scope only as fast as quality allows.

### Factor 11 · Trigger from Anywhere, Meet Users Where They Are

Once an agent can be launched with a simple API (Factor 6) and can reach people
through a tool (Factor 7), it no longer needs to live in a chat window. Let people
start it from Slack, email, text message, or whatever channel they already use,
and let it answer in the same place. It starts to feel less like an app you visit
and more like a digital coworker.

The bigger shift is that the trigger need not be a person at all. An
**outer-loop agent** is started by an event: a schedule, a monitoring alert, an
incoming invoice. It may work for five, twenty, or ninety minutes on its own,
contacting a person only at a critical point, to ask a question, get feedback, or
get approval. Being able to bring the right person in quickly is also what makes
it acceptable to give agents higher-stakes tools, such as sending email outside
the company or changing production data, with an audit trail of who approved
what.

### Factor 12 · Make Your Agent a Stateless Reducer

The last factor is less a new rule than a description of where the first eleven
lead. Think of the agent as a **reducer**, the idea behind `reduce` in
JavaScript and `foldl` in functional languages: a function that takes the state
so far plus one new event and returns the new state, keeping nothing of its own
between calls. If $s_t$ is the thread after $t$ events and $f$ is the whole
pipeline of rendering the context, calling the model, and parsing its output,
then

$$
s_{t+1} = s_t \oplus e_t, \qquad a_t = f(s_t),
$$

where $\oplus$ appends an event to the thread and $a_t$ is the next step. Run to
completion, an agent is a fold over its own history:

$$
s_n = \operatorname{foldl}\left(\oplus,\; s_0,\; [\,e_0, e_1, \dots, e_{n-1}\,]\right).
$$

That is unified state, owned context, and owned control flow in a single line.
Because every piece of state lives in the thread and none in the agent, any run
can be paused, saved, replayed, forked, inspected, or moved to another machine.
The guide files this factor, with some humor, as "mostly just for fun." It is
also the clearest echo of the original Twelve-Factor App, whose sixth factor
told developers to run applications as stateless processes and keep anything
that must persist in a backing service.

## The Thirteenth Factor

The guide closes with a bonus rule: **pre-fetch the context you might need**. If
the model will almost certainly call a tool, such as looking up the order a
customer just named, do not spend a model round trip waiting for it to decide
to. Call the tool deterministically up front and put the result in the context,
either as data in the prompt or as a recorded call-and-result pair in the thread,
and drop that tool from the menu. The model then spends its effort on the hard
part: deciding what the data means. It is context engineering once more. If you
already know what the model needs, give it.

## Why It Matters

The Twelve-Factor App lasted because it described properties rather than
products, and every new platform inherited them. The agent factors make the same
bet. None depends on a particular model, framework, or vendor, and none promises
that a better model will make engineering unnecessary. What they describe is
where the model belongs in a system: at the points of judgment, fed carefully
built context, producing structured decisions that ordinary code validates,
executes, pauses, and records.

That framing also tells a team where to start. It does not have to rebuild its
product as an agent. It can apply Factor 1 to one form, Factor 9 to one flaky
integration, Factor 7 to one approval that currently happens over email, and
bring in the rest as an agent's scope grows. The reliability comes from the
software around the model, and that software belongs to the team that writes it.

The same principles run through the rest of this desk. The human-in-the-loop
autonomy that makes enterprise agents governable in
[The Software That Stopped Waiting for Orders](/sections/agents-and-autonomy/agentic-ai-enterprise)
is Factors 7 and 8 at organizational scale, and the case for many small,
cooperating agents over a single monolith in
[A Crowd of Minds](/sections/agents-and-autonomy/swarm-intelligence) is Factor
10 seen from another angle.
