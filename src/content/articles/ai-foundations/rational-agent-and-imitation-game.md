---
course: ai-foundations
lectureId: Foundations
title: "The Rational Agent and the Imitation Game"
deck: "The textbook's working definition of AI — an agent that acts to maximize its expected performance — read against Turing's 1950 paper, which traded “Can machines think?” for a behavioral test and then spent most of its pages dismantling the objections."
order: 1
readingTime: 38
tags: ["agents", "rationality", "task-environments", "turing-test", "foundations"]
concepts:
  - id: rational-agent
    term: Rational Agent
    definition: "One that selects, for each percept sequence, the action expected to maximize its performance measure, given the evidence in that sequence and its built-in knowledge. Rationality is not omniscience and not perfection."
  - id: agent-function-program
    term: Agent Function vs. Agent Program
    definition: "The agent function is the abstract mapping from percept sequences to actions — a specification. The agent program is the concrete, finite implementation that runs on an architecture. Agent = architecture + program."
  - id: peas
    term: PEAS
    definition: "Performance measure, Environment, Actuators, Sensors — the checklist for specifying a task environment before designing an agent for it."
  - id: environment-dimensions
    term: The Seven Environment Dimensions
    definition: "Fully vs. partially observable, single- vs. multiagent, deterministic vs. nondeterministic, episodic vs. sequential, static vs. dynamic, discrete vs. continuous, known vs. unknown. The classification determines which algorithm family applies."
  - id: agent-types
    term: The Five Agent Types
    definition: "Simple reflex, model-based reflex, goal-based, utility-based, and learning agents — in order of increasing generality, each adding machinery to the one before."
  - id: expected-utility
    term: Expected Utility
    definition: "The sum over possible outcomes of probability × utility. Under uncertainty, a rational agent chooses the action that maximizes it — the Maximum Expected Utility principle."
  - id: problem-formulation
    term: Well-Defined Problem
    definition: "Initial state, actions, transition model, goal test, and path cost. Under observable, discrete, known, deterministic assumptions the solution is an open-loop action sequence; relax any of them and it must become a policy."
  - id: imitation-game
    term: The Imitation Game
    definition: "Turing's replacement for “Can machines think?”: can a machine, communicating by teleprinter, lead an interrogator to misidentify it as often as a human would be misidentified?"
  - id: universal-machine
    term: Universal Machine
    definition: "A digital computer that, given adequate storage and speed and the right program, can mimic any discrete state machine — the result that lets Turing restrict the game to digital computers."
  - id: child-machine
    term: The Child Machine
    definition: "Turing's proposal to program a mostly blank child mind and educate it with reward, punishment, and symbolic instruction, rather than hand-programming an adult mind directly."
---

Artificial intelligence has no single agreed definition, and the standard textbook
settles the matter by choosing one: build agents that *act rationally*. This feature
works through that framing — agents, rationality, task environments, and the five
agent architectures — and then reads it against the paper that started the argument,
Alan Turing's 1950 "Computing Machinery and Intelligence."

**Sources:** AIMA Chapters 1–2; Turing, A. M. (1950), "Computing Machinery and Intelligence," *Mind* 59(236), 433–460

**Suggested reading order:** glossary below → Turing §1, §6, §7 (pp. 433–435, 442–447, 454–460) → the rest.

## Table of contents

- [Part 0 — Acronyms expanded](#part-0--acronyms-expanded)
- [Part 1 — Agents and rationality (AIMA Ch. 1–2)](#part-1--agents-and-rationality-aima-chapters-1-and-2)
  - [1. What "Artificial Intelligence" means](#1-what-artificial-intelligence-means-four-competing-definitions)
  - [2. Agent, sensor, actuator, agent function](#2-agent-sensor-actuator-and-the-agent-function)
  - [3. Rationality](#3-rationality)
  - [4. Task environments — PEAS and seven dimensions](#4-task-environments--peas-and-the-seven-dimensions)
  - [5. Types of agents](#5-types-of-agents)
  - [6. Representation levels](#6-representation-levels)
  - [7. Problem-solving](#7-problem-solving)
- [Part 2 — Turing (1950)](#part-2--turing-1950-computing-machinery-and-intelligence)
  - [§1 The Imitation Game](#1-the-imitation-game)
  - [§2 Critique of the New Problem](#2-critique-of-the-new-problem)
  - [§3 The Machines Concerned in the Game](#3-the-machines-concerned-in-the-game)
  - [§4 Digital Computers](#4-digital-computers)
  - [§5 Universality of Digital Computers](#5-universality-of-digital-computers)
  - [§6 Contrary Views — prediction and nine objections](#6-contrary-views--the-prediction-and-the-nine-objections)
  - [§7 Learning Machines](#7-learning-machines)
- [Terms defined in one place](#terms-defined-in-one-place)
- [What to interrogate](#what-to-interrogate-not-just-absorb)

## Part 0 — Acronyms expanded

| Acronym | Expansion | Note |
|---|---|---|
| **AI** | Artificial Intelligence | — |
| **AIMA** | *Artificial Intelligence: A Modern Approach* | The Russell & Norvig textbook, 4th edition. Universally abbreviated this way in textbooks and papers |
| **PEAS** | **P**erformance measure, **E**nvironment, **A**ctuators, **S**ensors | Checklist for specifying a task before designing an agent |
| **CSP** | Constraint Satisfaction Problem | Search over variable assignments that must satisfy a set of constraints |
| **MDP** | Markov Decision Process | Sequential decision-making when action outcomes are probabilistic |
| **RL** | Reinforcement Learning | Learning a policy from reward signals rather than labeled examples |
| **BFS / DFS** | Breadth-First Search / Depth-First Search | The two basic uninformed search strategies |
| **A\*** | "A-star" — not an acronym; the name of an informed search algorithm (Hart, Nilsson, Raphael, 1968) | — |
| **IDA\*** | Iterative-Deepening A-star | A\* run with a rising cost cutoff, trading repeated work for far less memory |
| **GA / GP** | Genetic Algorithm / Genetic Programming | Population-based search inspired by natural selection |
| **MCTS** | Monte Carlo Tree Search | Game-tree search guided by randomized playouts |
| **HMM** | Hidden Markov Model | Referenced in AIMA Ch. 2 as an atomic-representation technique |
| **ESP** | Extra-Sensory Perception | Turing §6, objection 9 |
| **LLM** | Large Language Model | — |
| **NLP** | Natural Language Processing | One of the capabilities a Turing test requires |

## Part 1 — Agents and rationality (AIMA Chapters 1 and 2)

### 1. What "Artificial Intelligence" means: four competing definitions

AIMA opens by splitting historical definitions along two axes — *thinking vs. acting*, and *human-like vs. rational*.

| | Human-centered | Rationality-centered |
|---|---|---|
| **Thinking** | **Cognitive modeling** — build systems whose internal reasoning steps match human reasoning steps; validated against psychology experiments and introspection | **Laws of thought** — formal logic; derive correct conclusions from correct premises |
| **Acting** | **Turing test approach** — behave indistinguishably from a human | **Rational agent approach** — act to achieve the best expected outcome |

**Rational** here is a technical term: choosing the action that maximizes the expected value of a stated objective, given available information. Not a synonym for "sensible" or "logical."

The textbook commits to **acting rationally**. The reasoning:

- *Thinking humanly* requires a validated theory of human cognition, which does not exist in sufficient detail.
- *Thinking rationally* — pure deductive logic — breaks down under uncertainty (premises are rarely certain enough to deduce from) and under computational limits (the deduction may be intractable).
- *Acting humanly* imports human quirks, fatigue, arithmetic slowness, and bias as design targets. Aircraft engineering texts do not define their goal as machines that fly so like pigeons they fool other pigeons.
- *Acting rationally* is mathematically well-defined and general enough to cover every subfield.

Passing a full Turing test would require at minimum: Natural Language Processing (understanding and generating human language), **knowledge representation** (storing what the system knows in a form it can reason over), **automated reasoning** (drawing new conclusions from stored knowledge), and **machine learning** (improving from experience and generalizing). The **total Turing test** adds **computer vision** (interpreting images) and **robotics** (manipulating physical objects), so the interrogator can pass objects through a hatch.

**Weakness to flag:** rationality as defined is *unbounded* — it assumes the optimal action can be computed. In practice the optimal action is often uncomputable in the time available. AIMA later shifts toward **bounded optimality**: behaving as well as possible given fixed computational resources. This tension resurfaces in Markov decision processes and reinforcement learning.

### 2. Agent, sensor, actuator, and the agent function

An **agent** is anything that perceives its environment through **sensors** and acts upon that environment through **actuators**.

**Sensor** — any component supplying the agent with information about the state of the world. Camera, microphone, thermometer, keyboard input, a network socket returning an application programming interface response, a software function reading a file.

**Actuator** — any component that lets the agent *change* the world, or change its own relationship to the world. The word comes from control engineering: the part of a machine that converts a control signal into a physical effect.

Concrete actuators by agent type:

| Agent | Actuators |
|---|---|
| Vacuum robot | Wheel motors, brush motor, suction fan, dust-bin release |
| Automated taxi | Steering column, accelerator, brake, turn signals, horn, passenger display, speaker |
| Robotic arm | Servo motors at each joint, gripper open/close |
| Software agent (spam filter) | Writing a label to a message, moving a message to a folder, sending a notification |
| Chess program | Emitting a move to the game engine |

Two points that are easy to miss:

1. **Actuators need not be physical.** A software agent's actuators are its output channels — writing to a database, sending a message, printing to screen. "Actuator" is a role in the agent architecture, not a claim about hardware. AIMA calls software agents **softbots** for this reason.
2. **A display is an actuator, not a sensor.** Direction of information flow decides: world → agent is a sensor; agent → world is an actuator. A touchscreen is both, in two separate roles.

The related term **effector** is sometimes used interchangeably. Strictly, the effector does the work (the gripper) and the actuator drives it (the motor). AIMA does not enforce the distinction.

Core vocabulary built on this:

- **Percept** — the agent's input at one instant. A single sensor reading, or a bundle of simultaneous readings.
- **Percept sequence** — the complete history of everything the agent has ever perceived. Written `P*`. This is the *only* thing an action choice can depend on, since it is all the agent has.
- **Agent function** — the abstract mapping `f: P* → A` from percept sequences to actions, where `A` is the set of available actions. Usually infinite; tabulate it only for toy problems.
- **Agent program** — the concrete finite implementation producing the same behavior. This is what gets engineered.
- **Architecture** — the computing device with its sensors and actuators, on which the program runs.

The relationship:

```text
agent = architecture + program
```

Keep the function/program distinction straight. A useful check for any described property: does it belong to the function (*what* should be done — a specification) or the program (*how* it is computed — an implementation)?

### 3. Rationality

Formal definition from AIMA:

> For each possible percept sequence, a rational agent selects an action expected to maximize its performance measure, given the evidence provided by the percept sequence and whatever built-in knowledge the agent has.

**Performance measure** — an externally imposed criterion evaluating the sequence of environment states the agent brings about. *Externally imposed* matters: the agent does not grade its own homework.

Four dependencies. Any argument that an agent is or is not rational must name all four:

1. The performance measure defining success.
2. The agent's prior knowledge of the environment.
3. The actions the agent can perform.
4. The agent's percept sequence to date.

Distinctions worth keeping sharp:

**Rationality is not omniscience.** An **omniscient** agent knows actual outcomes in advance — impossible. Rationality maximizes *expected* performance given available information. Crossing a street after looking both ways is rational even if a cargo door falls from a passing airliner and flattens you.

**Rationality is not perfection.** Rationality maximizes expected outcome; perfection maximizes actual outcome. Grading on actual outcomes is hindsight, and would make rational design impossible.

**Rationality requires information gathering.** Actions taken to improve future percepts — looking both ways, running a diagnostic, asking a clarifying question — are part of rational behavior, not a separate category. **Exploration** is the same idea in a learning context.

**Rationality requires learning** when the environment is initially unknown. An agent relying entirely on designer-supplied knowledge, never updating, lacks **autonomy** — the property of an agent whose behavior is determined by its own experience rather than solely by built-in assumptions. A fully autonomous system is usually given initial knowledge and then learns; starting from zero means acting randomly until enough experience accumulates, which is often fatal.

**Performance measure design rule:** specify the measure over states of the *environment*, not over the agent's *behavior*. A vacuum agent scored on "amount of dirt collected" learns to dump collected dirt and re-vacuum it. Scored on "floor is clean at each time step," it does not. Same failure mode later called reward hacking or specification gaming.

### 4. Task environments — PEAS and the seven dimensions

Before designing any agent, specify the **task environment** using **PEAS**:

- **P**erformance measure — the criterion for success
- **E**nvironment — what the agent operates in
- **A**ctuators — how it acts
- **S**ensors — how it perceives

Worked example, automated taxi:

| PEAS component | Content |
|---|---|
| Performance measure | Safe arrival, legal compliance, trip time, fuel cost, passenger comfort, profit |
| Environment | Roads, other traffic, police, pedestrians, customers, weather |
| Actuators | Steering, accelerator, brake, turn signal, horn, display screen, speaker |
| Sensors | Cameras, radar, speedometer, Global Positioning System receiver, engine sensors, accelerometer, microphone, keyboard for passenger input |

Then classify the environment along seven dimensions. This classification determines which algorithm family applies — the practical payoff of Chapter 2.

| Dimension | Definition | Consequence for design |
|---|---|---|
| **Fully vs. partially observable** | Do sensors give access to the complete state relevant to the choice of action, at each moment? | Partial observability forces internal state — a **belief state**, the agent's representation of what the world *might* currently be. **Unobservable** is the extreme: no sensors at all |
| **Single-agent vs. multiagent** | Is another entity present whose performance measure depends on this agent's behavior? | **Competitive** multiagent (chess) → adversarial search. **Cooperative** (taxis avoiding collisions) makes communication and randomized behavior rational |
| **Deterministic vs. nondeterministic** | Is the next state completely determined by the current state and the action? | **Nondeterministic** = multiple possible outcomes, no probabilities. **Stochastic** = outcomes carry explicit probabilities → MDPs. An environment can be deterministic in principle but effectively stochastic because the agent cannot observe enough to predict it |
| **Episodic vs. sequential** | Is experience divided into independent atomic episodes, or do current actions affect all future decisions? | Episodic (classifying parts on a line) needs no lookahead. **Sequential** (chess, driving) does |
| **Static vs. dynamic** | Can the environment change while the agent deliberates? | Dynamic imposes real-time deadlines and makes "doing nothing" a decision. **Semidynamic** = environment static but the agent's *score* changes with time (chess with a clock) |
| **Discrete vs. continuous** | Applies separately to state, time, percepts, and actions | Continuous rules out enumerating states. Driving is continuous in state and time; camera input is technically discrete but treated as continuous |
| **Known vs. unknown** | Does the agent know the rules — outcomes or outcome probabilities of all actions? | **Orthogonal to observability.** Known but partially observable: solitaire. Unknown but fully observable: a new video game where you see the whole screen but not what the buttons do |

Hardest configuration: partially observable, multiagent, stochastic, sequential, dynamic, continuous, unknown. That is driving in traffic.

### 5. Types of agents

Five agent-program structures, in order of increasing generality. Each subsumes the previous.

<figure>
<svg viewBox="0 0 600 404" role="img" aria-label="A vertical ladder of five agent types, each adding machinery to the one above: simple reflex agents use condition-action rules on the current percept only; model-based reflex agents add internal state, a transition model, and a sensor model; goal-based agents add an explicit goal and search for an action sequence; utility-based agents replace the binary goal with a utility function; learning agents wrap any of the above and improve from experience.">
  <defs>
    <marker id="arw-agentladder" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" class="dgm-fill"/>
    </marker>
  </defs>
  <rect x="60" y="4" width="480" height="60" rx="6" class="dgm-soft" stroke="currentColor" stroke-width="1.5"/>
  <text x="300" y="30" text-anchor="middle" font-size="16" font-weight="700">Simple reflex</text>
  <text x="300" y="51" text-anchor="middle" font-size="14" class="dgm-muted">condition-action rules on the current percept only</text>
  <line x1="300" y1="64" x2="300" y2="84" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-agentladder)"/>
  <rect x="60" y="86" width="480" height="60" rx="6" class="dgm-soft" stroke="currentColor" stroke-width="1.5"/>
  <text x="300" y="112" text-anchor="middle" font-size="16" font-weight="700">Model-based reflex</text>
  <text x="300" y="133" text-anchor="middle" font-size="14" class="dgm-muted">adds internal state + transition model + sensor model</text>
  <line x1="300" y1="146" x2="300" y2="166" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-agentladder)"/>
  <rect x="60" y="168" width="480" height="60" rx="6" class="dgm-soft" stroke="currentColor" stroke-width="1.5"/>
  <text x="300" y="194" text-anchor="middle" font-size="16" font-weight="700">Goal-based</text>
  <text x="300" y="215" text-anchor="middle" font-size="14" class="dgm-muted">adds an explicit goal; searches for an action sequence</text>
  <line x1="300" y1="228" x2="300" y2="248" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-agentladder)"/>
  <rect x="60" y="250" width="480" height="60" rx="6" class="dgm-soft" stroke="currentColor" stroke-width="1.5"/>
  <text x="300" y="276" text-anchor="middle" font-size="16" font-weight="700">Utility-based</text>
  <text x="300" y="297" text-anchor="middle" font-size="14" class="dgm-muted">replaces the binary goal with a utility function</text>
  <line x1="300" y1="310" x2="300" y2="330" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-agentladder)"/>
  <g class="dgm-accent">
    <rect x="60" y="332" width="480" height="60" rx="6" class="dgm-soft" stroke="currentColor" stroke-width="1.5" stroke-dasharray="6 4"/>
    <text x="300" y="358" text-anchor="middle" font-size="16" font-weight="700">Learning agent</text>
    <text x="300" y="379" text-anchor="middle" font-size="14">wraps any of the above; improves from experience</text>
  </g>
</svg>
<figcaption><b>Five agent programs, in order of generality.</b> Each rung adds machinery to the one above it. The learning agent, dashed, is a wrapper rather than a rung: its performance element can be any of the other four.</figcaption>
</figure>

#### Simple reflex agent

Acts only on the *current* percept, ignoring all history, via **condition-action rules** (also *if-then rules* or *production rules*): `if condition then action`. Example: `if car-in-front-is-braking then initiate-braking`.

Minimal memory, very fast, easy to implement. Fails whenever the correct action depends on history the current percept does not reveal. In partially observable environments it falls into infinite loops — a vacuum agent sensing only its current square, with no location sensor, oscillates forever. **Randomization** (choosing among actions by coin flip) escapes such loops, but it is a patch rather than a fix, and a randomized agent is usually worse than a deliberating one.

#### Model-based reflex agent

Maintains **internal state**: a representation of the parts of the world the sensors cannot currently see. Updating it requires two pieces of knowledge:

- **Transition model** — how the world evolves independently of the agent, and how the agent's own actions change it. ("An overtaking car will be closer next instant." "Turning the wheel right moves the car right.")
- **Sensor model** — how the state of the world maps onto percepts. ("A bright rectangular region in the camera image means the car ahead is braking.")

Together these constitute the agent's **model of the world**. This is the minimum machinery for handling partial observability. The internal state is a best guess, not certainty.

#### Goal-based agent

Knowing the current state is not enough — at an intersection, the taxi's action depends on where the passenger is going. The agent holds an explicit **goal**: a description of desirable world states. It considers what the world would look like after candidate action sequences and picks one reaching a goal.

This is where **search** and **planning** enter. Goal-based agents are less efficient than reflex agents but far more **flexible**: change the goal and behavior changes automatically without rewriting rules. A reflex agent's braking rule must be rewritten by hand if the objective changes; a goal-based agent's knowledge is explicit and updatable.

#### Utility-based agent

Goals are binary — achieved or not. They cannot express *degrees* of desirability, and cannot arbitrate between conflicting objectives (fast vs. safe vs. cheap).

**Utility function** — a mapping from a state, or sequence of states, to a real number expressing desirability. It is an internalization of the external performance measure. When the two agree, a utility-maximizing agent is rational by the external standard.

Under uncertainty the agent cannot know which state an action produces, so it computes **expected utility**: the sum, over all possible outcomes, of each outcome's probability multiplied by its utility. A rational agent chooses the action with the highest expected utility — the **Maximum Expected Utility** principle. This is the bridge to AIMA Ch. 5.1–5.2 (uncertainty and utilities) and Ch. 17 (MDPs).

#### Learning agent

Four components:

- **Performance element** — the agent proper, taking percepts and selecting actions. Can be any of the four structures above.
- **Learning element** — modifies the performance element using feedback.
- **Critic** — evaluates behavior against a *fixed external performance standard* and reports how well it is doing. Necessary because the percept stream carries no notion of success: a chess program sees a checkmate percept, and only the standard tells it checkmate is bad.
- **Problem generator** — suggests exploratory actions, suboptimal in the short run but informative. Without it the agent keeps exploiting what it knows and never discovers better options.

This four-part structure reappears intact in reinforcement learning: the critic becomes the reward signal, the problem generator becomes the exploration policy (e.g. ε-greedy action selection).

### 6. Representation levels

How states are encoded inside the agent, least to most expressive:

- **Atomic** — a state is an indivisible black box with no internal structure. Two states are identical or not; nothing more. Sufficient for uninformed search, HMMs, MDPs.
- **Factored** — a state is a fixed set of **variables** (attributes), each with a value. Two states can share some values and differ in others. Enables CSPs, propositional logic, Bayesian networks, most machine learning.
- **Structured** — a state contains **objects** with properties, plus **relations** between them ("the truck is inside the parking lot and its rear door is open"). Required for first-order logic, relational learning, natural language understanding.

Higher expressiveness gives more compact descriptions of complex worlds, at higher reasoning cost. A related axis is **localist** representation (one variable per concept — readable, sparse) vs. **distributed** representation (a concept spread across many values — noise-robust, what neural networks use).

### 7. Problem-solving

This is the *stance*; the search algorithms that carry it out are a subject of their own. The **problem-solving agent** cycle:

1. **Goal formulation** — adopt a goal. Valuable because it *prunes*: the goal partitions world states into goal and non-goal, and everything not bearing on it can be ignored.
2. **Problem formulation** — decide the state representation and action granularity. Choosing "drive from city A to city B" over "turn the wheel 3 degrees" is **abstraction**, and it is a design act. This choice is the single largest source of tractability differences between two attacks on the same problem.
3. **Search** — simulate action sequences internally, without acting, until one reaching the goal is found. Output is a **solution**: an action sequence.
4. **Execution** — carry out the sequence.

A **well-defined problem** has five components:

- **Initial state** — where the agent starts.
- **Actions** — the set applicable in each state, `ACTIONS(s)`.
- **Transition model** — `RESULT(s, a)`, the state produced by doing `a` in `s`. Initial state + actions + transition model define the **state space**, usually drawn as a graph whose nodes are states and edges are actions.
- **Goal test** — whether a given state is a goal.
- **Path cost** — a numeric cost for a sequence of actions, additive over **step costs**.

This formulation assumes the environment is **observable, discrete, known, and deterministic**. Under those assumptions the agent can plan the whole sequence in advance and execute it blind — **open-loop** control, where "loop" means the feedback loop from sensors back into decision-making, and *open* means that loop is unused during execution.

Relax any assumption and the solution must become a **policy** — a mapping from states (or belief states) to actions, so the agent can respond to whatever actually happens. That is **closed-loop** control, and it is exactly what Ch. 17 (MDPs) and Ch. 22 (RL) build.

## Part 2 — Turing (1950), "Computing Machinery and Intelligence"

*Mind*, New Series, Vol. 59, No. 236, pp. 433–460. *Mind* is a British academic philosophy journal, which is why the paper argues in philosophical rather than engineering register.

**Structure:** replace an unanswerable question with an operational one (§1–§2) → define the class of machines allowed (§3–§5) → state a prediction and demolish nine objections (§6) → propose a construction path (§7).

### §1 The Imitation Game

Turing rejects "Can machines think?" outright. Answering it by examining how "machine" and "think" are ordinarily used would make the answer a matter for a **Gallup poll** — an opinion survey, named after the polling organization founded by George Gallup — which he calls absurd. He substitutes a question expressed in relatively unambiguous words.

The game as originally stated involves **three humans**: a man (A), a woman (B), and an **interrogator** (C) of either sex. C sits in a separate room and must determine which of two labeled participants, X and Y, is the man and which is the woman. A's object is to cause C to identify wrongly; B's best strategy is truthful answers — though asserting she is the woman gains her nothing, since A can say the same.

Communication runs by **teleprinter** — a 1950s electromechanical device transmitting typed text over a wire and printing it at the far end, ancestor of the computer terminal. Turing specifies it so tone of voice gives nothing away.

The substituted question: **what happens when a machine takes the part of A?** Does the interrogator misidentify as often as in the man/woman version?

> **Interpretive dispute worth knowing.** Whether the machine imitates a *woman* (competing against B under the original rules) or simply a *human* (the standard modern reading, and the version Turing uses in §5 when he writes of the machine playing the part of A with B taken by a man). Turing's later restatements support human-imitation, but the §1 text is genuinely ambiguous, and the secondary literature (Genova; Sterrett) has argued both readings produce different tests. Do not assume the textbook's cleaned-up version is what the paper says.

### §2 Critique of the New Problem

Chief advantage claimed: the setup draws a sharp line between **physical** and **intellectual** capacity. No engineer claims to produce material indistinguishable from human skin, and even if one could, dressing a thinking machine in artificial flesh would add nothing. So the conditions prevent the interrogator from seeing, touching, or hearing the competitors.

Specimen exchange, worth reading closely:

```text
Q: Please write me a sonnet on the subject of the Forth Bridge.
A: Count me out on this one. I never could write poetry.
Q: Add 34957 to 70764
A: (Pause about 30 seconds and then give as answer) 105621.
Q: Do you play chess?
A: Yes.
```

The **Forth Bridge** is a large railway bridge over the Firth of Forth in Scotland — a deliberately unpoetic subject. The arithmetic is wrong: 34957 + 70764 = 105721, not 105621. Turing is illustrating deliberate imperfection, which he returns to under "machines cannot make mistakes." Whether this particular error is intentional or a typesetting slip is a standing minor controversy.

The chess reply uses **descriptive notation**, the English chess notation standard before algebraic notation replaced it. "K at K1" means the king on the king's own first square; "R-R8 mate" means rook to the eighth rank of the rook's file, delivering checkmate.

Two objections he raises against himself here:

- *The odds are weighted against the machine.* A man imitating a machine would fail badly — given away at once by slowness and inaccuracy in arithmetic. He concedes the objection is very strong, but notes that success under unfair odds would still settle the matter.
- *Imitating a man may not be the machine's best strategy.* Possible, but he thinks the effect is small and explicitly declines to develop a game theory of it.

### §3 The Machines Concerned in the Game

Three constraints, deliberately awkward to satisfy simultaneously:

1. Permit every kind of engineering technique.
2. Allow machines whose manner of operation their own constructors cannot satisfactorily describe, because the method used was largely experimental.
3. Exclude humans born in the usual manner.

He notes that requiring the engineering team to be all of one sex fails as a criterion for (3), since rearing a complete individual from a single skin cell would be a biological feat, not a case of constructing a thinking machine.

Resolution: **restrict the game to digital computers.** He acknowledges this looks drastic and spends §4–§5 arguing it is not.

### §4 Digital Computers

A digital computer is defined by intent: to carry out any operation a **human computer** could do. In 1950 "computer" still primarily meant *a person employed to perform calculations* — working from a printed book of rules, with unlimited paper, no authority to deviate. Turing's whole analogy depends on that older sense.

Three parts:

| Part | Role | Human-computer correspondent |
|---|---|---|
| **Store** | Memory | The clerk's paper — both working sheets and the printed book of rules; also the clerk's own memory for work done in the head |
| **Executive unit** | Carries out individual operations | The act of calculating. Varies by machine: some do "multiply 3540675445 by 7076345687" as one operation; others only "write down 0" |
| **Control** | Ensures instructions are obeyed correctly and in the right order | The clerk's discipline in following the book |

The book of rules becomes the **table of instructions** held in the store. Key points:

- Instructions are encoded numerically. Turing's example: `6809430217`, a 10-digit packet where 17 names the operation ("add") and 6809 and 4302 name the two storage positions.
- **Conditional and unconditional jumps** make loops possible — "now obey the instruction stored in position 5606," or "if position 4505 contains 0 obey next the instruction stored in 6707, otherwise continue straight on." Their importance: a sequence of operations can repeat until a condition is met, obeying the *same* instructions each time rather than fresh ones. His domestic analogy — rather than reminding Tommy each morning to check the cobbler for her shoes, Mother posts a notice in the hall telling him to check, and to destroy the notice once he has them.
- **Programming** = constructing instruction tables. To programme a machine to carry out operation A means putting the appropriate instruction table into it.
- A **digital computer with a random element** takes instructions such as "throw the die and put the resulting number into store 1000." Such a machine is sometimes described as having free will; Turing declines the phrase. Externally, randomness is indistinguishable from choices driven by the digits of π.
- Machines with unbounded memory he calls **infinitive capacity computers** — theoretical interest only, since only a finite part can ever have been used.
- **Charles Babbage's Analytical Engine** (planned 1828–1839, never completed) already had all the essential ideas but was purely mechanical, using wheels and cards. Turing uses this to kill a superstition: people attach importance to modern computers being electrical and the nervous system being electrical. But Babbage's machine was not electrical, and all digital computers are equivalent, so electricity cannot be of theoretical importance. Electricity appears wherever fast signalling matters, that is all. In the nervous system, chemical phenomena are at least as important as electrical; in some computers of the day, storage was **acoustic** (delay lines using sound pulses in mercury tubes). For real similarities, look for **mathematical analogies of function**.

### §5 Universality of Digital Computers

Digital computers belong to the class of **discrete state machines** — machines moving by sudden jumps from one definite state to another, with states sufficiently distinct that confusion between them can be ignored.

Turing is careful: strictly there are no such machines, since everything really moves continuously. It is a productive fiction, like treating a light switch as definitely on or off while ignoring intermediate positions.

His worked example: a wheel clicking through 120° once a second, stoppable by an external lever, with a lamp lighting in one wheel position. Three internal states `q1 q2 q3`, one input signal `i0` or `i1` (lever position), fully specified by a state-transition table plus an output table.

**On determinism.** Given the table and initial state, all future states are predictable. This resembles Laplace's view that the complete state of the universe at one moment determines all future states. But Turing's version is *nearer to practicability*, precisely because the universe amplifies tiny errors — displacing a single electron by a billionth of a centimetre might decide whether a man is killed by an avalanche a year later — whereas discrete state machines by construction do not exhibit that sensitivity.

**On scale.** The Manchester machine had roughly 2^165,000 states, about 10^50,000. **Storage capacity** is defined as the logarithm to base two of the number of states — ≈165,000 for the Manchester machine, about 1.6 for the three-state wheel machine (log₂3 ≈ 1.585). Capacities add when machines are combined. A human computer with 100 sheets of paper, 50 lines each, 30 digits per line has 10^150,000 states, about three Manchester machines' worth.

**The universality result:** given adequate storage capacity and sufficient speed, and reprogrammed afresh for each target, a digital computer can be made to **mimic the behaviour of any discrete state machine**. Machines with this property are **universal machines**. Consequence: considerations of speed aside, it is unnecessary to design new machines for new computing processes; one suitably programmed digital computer does all of them, and all digital computers are in a sense equivalent.

This licenses the §3 restriction. The question reduces to: fix attention on one particular digital computer C — is it true that by giving C adequate storage, increasing its speed, and providing an appropriate programme, C can be made to play satisfactorily the part of A in the imitation game, the part of B being taken by a man?

### §6 Contrary Views — the prediction and the nine objections

#### The prediction, stated precisely

Frequently misquoted. What Turing actually claims:

- In about fifty years — so around the year 2000 — it will be possible to programme computers with a **storage capacity of about 10⁹** to play the imitation game so well that an average interrogator will have **no more than a 70 percent chance** of making the right identification after **five minutes** of questioning.
- The original question, "Can machines think?", he believes **too meaningless to deserve discussion**.
- Nevertheless, by the end of the century the use of words and general educated opinion will have altered enough that one can speak of machines thinking without expecting contradiction.

He defends stating unproved conjectures: the popular view that scientists proceed inexorably from well-established fact to well-established fact, never influenced by unproved conjecture, is quite mistaken. Provided it is clear which claims are proved and which conjectured, no harm results, and conjectures suggest useful lines of research.

#### The nine objections

| # | Objection | Turing's reply |
|---|---|---|
| 1 | **Theological** — thinking is a function of man's immortal soul; God gave souls to humans, not to animals or machines, so no machine can think | Replies inside theological terms rather than dismissing them. The argument implies a serious restriction on God's omnipotence: God could confer a soul on an elephant given a suitably improved brain, and the same form of argument covers machines. Constructing such machines is no more usurping His power of creating souls than procreation is — in either case we provide mansions for the souls He creates. Adds that theological arguments have a poor record: in Galileo's time, scripture (Joshua x.13, Psalm cv.5) was held to refute the **Copernican theory**, the heliocentric model of the solar system |
| 2 | **"Heads in the sand"** — the consequences of machines thinking would be too dreadful; let us hope and believe they cannot | Not substantial enough to require refutation. Consolation would be more appropriate — perhaps sought in the **transmigration of souls**, the doctrine that a soul passes into another body after death. Notes the argument is strongest among intellectual people, who value thinking most highly and therefore rest human superiority on it |
| 3 | **Mathematical** — results in mathematical logic (Gödel's incompleteness theorem, plus results of Church, Kleene, Rosser, and Turing himself) show discrete-state machines have limitations: rigged to answer imitation-game questions, there will be questions a given machine answers wrongly or fails to answer at all | It is *established* that any particular machine has limits, but only *stated*, never proved, that no such limitations apply to the human intellect. Also: humans give wrong answers often enough that being pleased at machine fallibility is unearned; and any triumph is over one machine, never over all machines simultaneously. There might be men cleverer than any given machine, but then other machines cleverer again |
| 4 | **Argument from consciousness** — Professor Jefferson's **Lister Oration** for 1949 (a prestigious annual lecture to the Royal College of Surgeons): not until a machine writes a sonnet *because of thoughts and emotions felt*, and knows that it wrote it, would machine equal brain | Pushed to its extreme this is **solipsism** — the position that one can only know one's own mind, so the only way to know a man thinks is to be that man. It may be the most logical view but it makes communication of ideas difficult; the usual course is the polite convention that everyone thinks. Offers the ***viva voce*** dialogue — *viva voce* being an oral examination, used in practice to tell real understanding from material learnt parrot fashion. The exchange covers whether "a spring day" would do as well as "a summer's day" in Shakespeare's sonnet (it wouldn't scan), and whether **Mr. Pickwick** — the genial protagonist of Dickens's *The Pickwick Papers* — reminds one of Christmas. Answers that sustained would not be described as an easy contrivance. Concedes genuine mystery about consciousness, and a paradox in trying to localize it, but denies it must be solved before this paper's question can be answered |
| 5 | **Arguments from various disabilities** — "you can make machines do all that, but you will never make one do X," where X is: be kind, resourceful, beautiful, friendly, have initiative, have a sense of humour, tell right from wrong, make mistakes, fall in love, enjoy strawberries and cream, make someone fall in love with it, learn from experience, use words properly, be the subject of its own thought, have as much diversity of behaviour as a man, do something really new | Mostly unsupported **scientific induction** — generalizing from observed instances — applied to a lifetime of seeing small, ugly, single-purpose machines. Treats two specifically. On **mistakes**: distinguish *errors of functioning* (mechanical or electrical faults causing behavior the machine was not designed for — abstract machines are by definition incapable of these) from *errors of conclusion* (attaching meaning to output, then finding a false proposition). Machines plainly commit the second kind, and a machine playing the imitation game would *deliberately* introduce arithmetic mistakes to avoid being unmasked by deadly accuracy. On **self-reference**: a machine solving `x² − 40x − 11 = 0` has that equation as its subject matter; it can help make up its own programmes and predict the effects of alterations to its own structure — possibilities of the near future, not Utopian dreams. On **diversity of behaviour**: just another way of saying limited storage capacity |
| 6 | **Lady Lovelace's objection** — Ada Lovelace, in her 1842 translator's notes on the Analytical Engine, wrote that it has no pretensions to *originate* anything and can do *whatever we know how to order it* to perform | Quotes **D. R. Hartree**'s 1949 gloss (*Calculating Instruments and Machines*): this does not imply it is impossible to build equipment that thinks for itself, only that machines of Lovelace's time did not appear to have the property. Turing agrees, and adds: Lovelace did not assert the machines *lacked* the property, only that available evidence did not encourage her to believe they had it. Since the Analytical Engine was a universal digital computer, with adequate storage and speed it could mimic any discrete-state machine that did have it. Against the variant "a machine can never take us by surprise": machines surprise him with great frequency, largely because he does insufficient calculation to predict them, and does what calculation he does hurriedly and taking risks. The counter-rebuttal — that surprise reflects a creative mental act in the observer — applies equally whether the surprise originates from a man, a book, or a machine |
| 7 | **Continuity in the nervous system** — the nervous system is not a discrete-state machine; a small error in the size of a nervous impulse hitting a neuron may make a large difference to the outgoing impulse, so a discrete system cannot mimic it | True but useless to the interrogator, who cannot exploit the difference under the game's conditions. Demonstrates with a genuinely continuous machine: a **differential analyser**, a mechanical analog computer of the 1930s–40s that solved differential equations using rotating discs and wheels rather than discrete steps. Asked for π (about 3.1416), it might reasonably answer 3·12, 3·13, 3·14, 3·15, or 3·16 with some spread of probabilities. A digital computer cannot predict the analyser's exact output but can easily give the right *sort* of answer, so the interrogator would find them very difficult to tell apart |
| 8 | **Informality of behaviour** — no finite set of rules describes what a man should do in every conceivable circumstance (what if a red and a green traffic light both show, through a fault?). Therefore men are not machines | The **undistributed middle** is glaring. (An undistributed middle is a formal fallacy: from "all machines follow rules of conduct" and "men do not follow rules of conduct," concluding "men are not machines" works only if the middle term is used exhaustively, which it isn't.) He separates **rules of conduct** — precepts one can act on and be conscious of, "stop if you see red lights" — from **laws of behaviour** — laws of nature applied to a man's body, "if you pinch him he will squeak." Being governed by laws of behaviour implies being some sort of machine, and conversely; but the absence of complete *rules of conduct* proves nothing about *laws of behaviour*. Further, no program of scientific observation could ever license the conclusion that we have searched enough and no such laws exist. Empirical support: he set up a 1000-unit programme on the Manchester computer that replies to any sixteen-figure number with another within two seconds, and defies anyone to learn enough from its replies to predict its answers to untried values |
| 9 | **Extra-Sensory Perception** — telepathy (mind-to-mind transfer), clairvoyance (perceiving distant events), precognition (perceiving the future), and psycho-kinesis (influencing matter by mind) | Turing treats this as **quite a strong argument** and states that the statistical evidence, at least for telepathy, is overwhelming. Constructs the scenario: play the game with a telepathically gifted human witness and a digital computer, and let the interrogator ask what suit the card in his right hand belongs to. The man scores 130 correct out of 400 cards, the machine guesses at random and gets about 104, so the interrogator identifies correctly. Even giving the machine a random number generator does not save it, since the generator would itself be subject to the interrogator's psycho-kinesis. Proposed remedy: put the competitors in a telepathy-proof room |

> **Flag this hard.** Objection 9 is the paper's clearest failure, and Turing does not hedge it — he calls the evidence overwhelming and the argument strong. He was almost certainly responding to S. G. Soal's card-guessing experiments, later shown to involve data manipulation. Summaries of this paper routinely skip §6(9). It is the most interesting section precisely because it shows a first-rate mind holding a fixed methodological standard (the imitation game) as more reliable than his own judgment about which phenomena are real — and getting the second thing badly wrong while keeping the first thing sound.

### §7 Learning Machines

Opens with a concession: the reader will have anticipated that he has no very convincing arguments of a positive nature — if he had, he would not have taken such pains attacking contrary views.

#### Two analogies for creative thought

**Atomic pile** — an early term for a nuclear reactor, so called because the first one was literally a stacked pile of graphite blocks and uranium. Below **critical size**, an injected neutron causes a disturbance that dies away; above it, the disturbance grows until the pile is destroyed. An injected *idea* corresponds to the neutron. Most human minds are **sub-critical**: an idea presented gives rise on average to less than one idea in reply. A smallish proportion are **super-critical**: one idea generates a whole theory of secondary, tertiary, and more remote ideas. Animal minds are very definitely sub-critical. Question: can a machine be made super-critical?

**Skin of an onion** — strip off each function of the mind explicable in purely mechanical terms, on the grounds that it is not the *real* mind. Under it you find another such skin, and so on. Either you never reach the real mind, or you reach a skin with nothing in it — in which case the whole mind is mechanical.

He labels both explicitly as not convincing arguments, but recitations tending to produce belief.

#### The engineering estimate

Estimates of the brain's storage capacity range from 10¹⁰ to 10¹⁵ **binary digits** (the term "bit," a contraction of *binary digit*, was coined by Tukey in 1947 and was not yet universal). Turing inclines to the lower values, believing only a small fraction is used for higher thinking and most is retention of visual impressions. He doubts more than 10⁹ is needed to play the imitation game satisfactorily — noting for scale that the 11th edition of the *Encyclopaedia Britannica* holds about 2 × 10⁹, and that 10⁷ would already be practicable with 1950 techniques.

Speed is not the bottleneck: parts of modern machines functioning as analogues of nerve cells work about a thousand times faster, providing a margin of safety.

The bottleneck is programming labor. At his own rate of about a thousand digits of programme per day, sixty workers steadily through fifty years might accomplish the job, if nothing went into the waste-paper basket. **"Some more expeditious method seems desirable."** That sentence sets up the entire learning proposal.

#### The child machine

Rather than programming an adult mind directly, program a *child's* mind and subject it to education. Three components of an adult mind: (a) the initial state at birth, (b) the education it has undergone, (c) other experience not describable as education.

The child-brain is like a note-book fresh from the stationers: rather little mechanism, and lots of blank sheets. The hope is that so little mechanism is present that it can be easily programmed.

This divides the problem into the **child-programme** and the **education process**, mapped onto evolution:

```text
Structure of the child machine  =  Hereditary material
Changes to the structure        =  Mutations
Natural selection               =  Judgment of the experimenter
```

The process should beat evolution, because survival of the fittest is slow, and the experimenter — unlike nature — is not restricted to random mutations and can trace a cause of weakness back to the mutation that would fix it.

Teaching cannot be identical to a child's: the machine has no legs, so it cannot be asked to fill the **coal scuttle** (a metal bucket for carrying coal to a fireplace — an ordinary household chore in 1950 Britain); possibly no eyes. Sending it to school would invite excessive mockery. But limbs and eyes need not worry us: the example of **Helen Keller** — deaf and blind from infancy, educated through tactile finger-spelling — shows education can occur provided communication runs in both directions by *some* means.

#### Teaching mechanics

Punishment reduces the probability that events shortly preceding it are repeated; reward increases the probability of repetition. These definitions do not presuppose any feelings on the part of the machine. Turing ran such experiments himself with mixed results — the teaching method was too unorthodox for the experiment to count as successful.

Reward and punishment alone form a very low-bandwidth channel: information reaching the pupil cannot exceed the total number of reward and punishment signals applied. Learning to recite **"Casabianca"** — Felicia Hemans's 1826 poem, the one beginning "The boy stood on the burning deck," memorized by generations of British schoolchildren — purely by a Twenty Questions technique with every NO taking the form of a blow would leave the child very sore indeed. So **unemotional channels** of communication are necessary: teaching the machine, by rewards and punishments, to obey orders given in a symbolic language, then issuing orders through that language.

Alternatively, build in a complete system of logical inference. The store would then hold definitions and propositions of varying status: well-established facts, conjectures, mathematically proved theorems, statements given by authority, and expressions with the logical form of propositions but no belief-value. Certain propositions are **imperatives** — commands firing automatically the moment they are classed as well-established. "Teacher says 'Do your homework now'" combined with "Everything that teacher says is true" leads to the homework actually getting started.

The processes of inference need not satisfy exacting logicians — there might be no hierarchy of types, and type fallacies need not follow, any more than we are bound to fall over unfenced cliffs. Imperatives can also be given inside the system to keep it safe, e.g. "do not use a class unless it is a subclass of one mentioned by teacher."

The most important imperatives are those regulating **which rule to apply next**, since at each stage a logical system permits a very large number of alternative steps. These choices make the difference between a brilliant and a **footling** reasoner — *footling* being British slang for trivial or time-wasting — not the difference between a sound and a fallacious one. Example propositions leading to such imperatives: "When Socrates is mentioned, use the **syllogism in Barbara**" (the classical first-figure syllogism: all M are P, all S are M, therefore all S are P — the "all men are mortal / Socrates is a man" pattern); or "if one method has been proved quicker than another, do not use the slower method." Some come from authority; others the machine produces itself by scientific induction.

#### The paradox of learning machines

How can the rules of operation change, if the rules must completely describe how the machine reacts whatever its history — that is, if they are time-invariant?

Resolution: the rules that get changed during learning are of a rather less pretentious kind, claiming only an ephemeral validity. Turing draws the parallel to the **Constitution of the United States** — a fixed higher-order framework under which ordinary laws are continually amended.

Two consequences he flags:

1. The teacher will often be very largely ignorant of what is going on inside, while still able to predict the pupil's behavior to some extent. This is in clear contrast with ordinary computation, where the goal is a clear mental picture of the machine's state at every moment.
2. **Human fallibility is imported naturally**, without special coaching, because processes that are learnt do not produce a hundred percent certainty of result — if they did, they could not be unlearnt.

#### Random element in learning

Illustration: find a number between 50 and 200 equal to the square of the sum of its digits. Systematic search starts at 51 and works up; random search picks numbers until one works. Random needs no bookkeeping of tried values but may repeat one — unimportant if several solutions exist. Systematic risks an enormous solution-free block in the region searched first.

Learning is a search for a form of behaviour satisfying the teacher, and since satisfactory solutions are probably numerous, **the random method seems better than the systematic**. Evolution uses it — and there the systematic method is not even possible, since one could not keep track of all genetic combinations already tried.

#### Closing

Which intellectual fields to start with? One camp says a very abstract activity like chess. Another says buy the machine the best sense organs money can buy, then teach it to understand and speak English, following the normal teaching of a child, pointing things out and naming them. Turing does not know which is right and thinks **both approaches should be tried**.

Final sentence: we can see only a short distance ahead, but plenty there needs doing.

#### Bibliography items worth recognizing

- **Samuel Butler, *Erewhon* (1865), Chapters 23–25, "The Book of the Machines"** — a satirical novel whose machine chapters argue machines might evolve consciousness. Turing citing fiction alongside Gödel and Church is deliberate.
- **Alonzo Church (1936)**, "An Unsolvable Problem of Elementary Number Theory" — the Church side of the Church–Turing thesis.
- **Kurt Gödel (1931)**, the incompleteness paper (German title translates as "On Formally Undecidable Propositions of *Principia Mathematica* and Related Systems, I").
- **A. M. Turing (1937)**, "On Computable Numbers, with an Application to the **Entscheidungsproblem**" — *Entscheidungsproblem* is German for "decision problem," Hilbert's challenge to find an algorithm deciding the truth of any mathematical statement. Turing proved none exists, and invented the Turing machine to do it. This is the paper §6(3) refers to as "the latter result."

## Terms defined in one place

| Term | Definition |
|---|---|
| **Actuator** | Component through which an agent acts on its environment — motor, brake, display, or a software output channel such as writing to a database |
| **Sensor** | Component through which an agent perceives its environment |
| **Percept** | The agent's sensory input at a single instant |
| **Percept sequence** | The complete history of an agent's percepts; the only basis available for choosing an action |
| **Agent function** | Abstract mapping from percept sequences to actions; a specification |
| **Agent program** | Concrete finite implementation of the agent function |
| **Architecture** | The physical or computational platform, with sensors and actuators, on which the agent program runs |
| **Performance measure** | Externally imposed criterion evaluating the sequence of environment states the agent produces |
| **Rational agent** | One selecting, for each percept sequence, the action expected to maximize the performance measure given its evidence and built-in knowledge |
| **Omniscience** | Knowing the actual outcome of actions in advance; impossible, and not required for rationality |
| **Autonomy** | The extent to which an agent's behavior is determined by its own experience rather than by the designer's prior knowledge |
| **Condition-action rule** | `if condition then action`; the sole mechanism of a simple reflex agent |
| **Internal state / belief state** | The agent's stored representation of world aspects not currently observable |
| **Transition model** | Knowledge of how the world evolves on its own and how the agent's actions change it |
| **Sensor model** | Knowledge of how world states produce percepts |
| **Utility function** | Mapping from states to real numbers expressing relative desirability |
| **Expected utility** | Sum over possible outcomes of (probability × utility); the quantity a rational agent maximizes under uncertainty |
| **Critic** | Component of a learning agent that judges behavior against a fixed external standard and supplies feedback |
| **Problem generator** | Component of a learning agent that proposes exploratory, short-term-suboptimal actions for their informational value |
| **Semidynamic** | Environment that does not change during deliberation, but where the agent's score does — chess with a clock |
| **Open-loop / closed-loop** | Executing a precomputed plan without consulting sensors / continuously feeding sensor input back into action selection |
| **Policy** | Mapping from states or belief states to actions; the form a solution must take when the environment is not deterministic and fully observable |
| **Abstraction** | Choosing the granularity of states and actions during problem formulation |
| **State space** | Graph of all reachable states, with actions as edges; defined by initial state + actions + transition model |
| **Discrete state machine** | Machine moving in sudden jumps between definite states, describable by a finite transition table |
| **Storage capacity (Turing's sense)** | Logarithm to base two of the number of states a machine can occupy |
| **Universal machine** | A machine that, with adequate storage and speed and the right program, can mimic any discrete state machine |
| **Human computer** | A person employed to carry out calculations by fixed rules — the 1950 primary sense of "computer" |
| **Teleprinter** | Electromechanical device transmitting typed text over a wire; used in the imitation game to remove voice cues |
| **Viva voce** | Oral examination, used to distinguish real understanding from rote memorization |
| **Differential analyser** | Mechanical analog computer solving differential equations; Turing's example of a genuinely continuous machine |
| **Errors of functioning vs. errors of conclusion** | Mechanical or electrical faults vs. producing a false proposition; only the second is available to an abstract machine |
| **Solipsism** | The position that only one's own mind can be known to exist |
| **Undistributed middle** | Formal fallacy where the shared term of two premises is not used exhaustively, so the conclusion does not follow |
| **Rules of conduct vs. laws of behaviour** | Precepts one can consciously act on vs. natural laws governing the body; Turing's key distinction in objection 8 |
| **Scientific induction** | Generalizing from observed instances to a general rule; Turing's diagnosis of the "various disabilities" objection |
| **Atomic pile** | Early term for a nuclear reactor; Turing's analogy for whether a mind is sub-critical or super-critical to injected ideas |
| **Entscheidungsproblem** | German, "decision problem": Hilbert's challenge for an algorithm deciding mathematical truth. Proved impossible by Church and Turing independently |

## What to interrogate, not just absorb

Five contested points, useful as starting angles rather than answers:

1. **Behaviorism.** The test measures indistinguishability of output, not understanding. Searle's Chinese Room (1980) and Block's lookup-table "Blockhead" argue a system could pass while having no mental states at all. Turing anticipates the shape of this in §6(4) but answers with a dilemma (accept the test or accept solipsism) rather than a positive account of what thinking is.
2. **The prediction's scorecard.** 10⁹ bits of storage arrived decades ahead of schedule. Five-minute, 70-percent misidentification was arguably achieved by ELIZA-style pattern matching long before anything resembling competence, which suggests the metric partly measures interrogator credulity.
3. **§6(9), Extra-Sensory Perception.** The strongest evidence in the paper that an operational criterion does not protect a thinker from bad priors about which phenomena exist.
4. **Imitation game ambiguity.** Gender-imitation vs. human-imitation readings produce measurably different tests.
5. **Child machine vs. modern machine learning.** The §7 proposal — a mostly blank initial structure, behavior shaped by reward and punishment signals, a random element preferred over systematic search, a teacher ignorant of the internals, and learning that imports fallibility as a side effect — describes gradient-based learning fairly closely at the structural level. Worth asking what Turing got right about the *shape* of the solution while getting the timeline and the specific mechanism wrong.
