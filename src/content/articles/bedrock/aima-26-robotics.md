---
course: bedrock
lectureId: AIMA 26
book: "Artificial Intelligence: A Modern Approach"
part: "VI · Communicating, Perceiving, and Acting"
title: "Where Every Assumption Gets Tested at Once"
deck: "A robot is the chapter where the book's abstractions meet friction, latency, and a world that does not pause while you compute. Chapter 26 is partial observability, continuous state, stochastic dynamics, and real-time constraints arriving together."
order: 26
chapter: 26
readingTime: 14
tags: ["robotics", "localization", "motion-planning", "control", "human-robot-interaction"]
concepts:
  - id: robot-problem
    term: What Robotics Is Solving
    definition: "Acting in a physical environment that is partially observable, stochastic, continuous, dynamic, and unforgiving of latency. It is the one domain where all the hard environment dimensions from Chapter 2 hold simultaneously."
  - id: configuration-space
    term: Configuration Space
    definition: "The space of the robot's degrees of freedom rather than of workspace positions. In C-space the robot becomes a point and obstacles become forbidden regions, which turns motion planning into geometric pathfinding."
  - id: localization-slam
    term: Localization and SLAM
    definition: "Estimating pose from sensor data given a map; SLAM does this while building the map, estimating both jointly. Particle filters and Rao-Blackwellized variants are the standard machinery — Chapter 14 applied to a moving body."
  - id: motion-planning
    term: Motion Planning
    definition: "Finding a collision-free path in configuration space. Cell decomposition, visibility graphs, potential fields (fast but prone to local minima), and sampling-based planners such as PRM and RRT, which trade completeness for scalability."
  - id: control-loop
    term: Control and Compliance
    definition: "Converting a plan into actuator commands. PID control corrects error from a reference trajectory; a controller's gain must balance responsiveness against oscillation; compliant control regulates force rather than position for contact tasks."
  - id: uncertainty-in-motion
    term: Planning Under Motion Uncertainty
    definition: "Actuators slip and sensors are noisy, so open-loop plans drift. Robust planning selects actions whose outcomes are acceptable across the uncertainty set, and information-gathering motions reduce pose uncertainty before precision is needed."
  - id: robot-learning
    term: Reinforcement Learning in Robotics
    definition: "Sample efficiency is the binding constraint because trials cost time, hardware, and safety. Sim-to-real transfer with domain randomization, learning from demonstration, and model-based methods are the standard responses."
  - id: human-robot-interaction
    term: Humans and Robots
    definition: "Sharing space with people requires predicting their behavior, making the robot's own intent legible, and recognizing that the robot's actions change what people do — so a predictive model of humans that ignores this feedback is wrong."
---

Chapter 26 is where the book's assumptions get audited. Every environment
dimension from Chapter 2 that other chapters relax one at a time holds
simultaneously in robotics: the world is partially observable, stochastic,
continuous in state and action and time, dynamic, and it does not wait while the
agent computes. Latency is not a performance concern but a correctness one,
because a plan computed for a state the world has already left is wrong.

## The Machine and the Space It Moves In

The hardware section covers sensors — lidar, cameras, tactile, proprioceptive —
and effectors, with the framing that every sensor measures something *other* than
what you want and every actuator does something slightly other than what you
commanded. Passive sensors observe; active sensors emit and measure the return.
Degrees of freedom are counted as the parameters needed to specify the robot's
configuration, and the chapter distinguishes **effective** DOF — what the robot
can independently control — from the workspace dimensions it wants to reach,
which is the source of holonomic versus nonholonomic constraints. A car can
occupy any position and heading, but it cannot move sideways.

**Configuration space** is the chapter's organizing abstraction and its most
transferable idea. Rather than reasoning about a shaped robot moving among
obstacles in the workspace, transform into the space of the robot's degrees of
freedom. In C-space the robot is a **point**, and obstacles become forbidden
regions whose shape encodes the robot's geometry. A hard geometric problem
becomes pathfinding for a point, which is Chapter 3's problem again — with the
complication that the space is continuous and the obstacle regions are expensive
to compute explicitly.

## Knowing Where You Are

**Localization** estimates pose from sensor readings given a map, and it is
Chapter 14 applied to a body in space. The belief is a distribution over poses,
updated by a motion model (odometry, which drifts) and a sensor model (range
readings against the map).

The chapter walks through why the representation choice matters. A Kalman filter
is efficient and unimodal, and unimodality fails badly at the start of
localization, when the robot could be anywhere, or in a symmetric building where
several poses are equally consistent with the readings. **Monte Carlo
localization** with a particle filter handles both cases: it represents arbitrary
multimodal beliefs and concentrates particles as evidence accumulates.

**SLAM** — simultaneous localization and mapping — removes the map too,
estimating pose and map jointly. The circularity (a good map needs good poses and
vice versa) is broken by joint estimation, and **Rao-Blackwellized** particle
filters are the standard solution: sample the trajectory, solve the map
analytically given it. Graph-based formulations pose the whole problem as
nonlinear least squares over a pose graph, with **loop closure** — recognizing a
previously visited place — as the event that corrects accumulated drift.

## Getting There

**Motion planning** finds a collision-free path in configuration space.

**Cell decomposition** partitions free space into regions and searches the
adjacency graph. **Visibility graphs** connect obstacle vertices for polygonal
environments and yield shortest paths. **Potential fields** treat the goal as
attractive and obstacles as repulsive, which is fast and reactive and prone to
**local minima** — the robot stalls in a concave obstacle, which is Chapter 4's
hill-climbing failure in physical form.

**Sampling-based planners** are the practical answer in high dimensions.
**Probabilistic roadmaps** sample configurations, test them for collision,
connect nearby valid ones, and search the resulting graph — good for repeated
queries in a static environment. **Rapidly-exploring random trees** grow a tree
from the start toward random samples, biased to expand into unexplored regions,
and suit single-query problems with differential constraints. Both give up
completeness for **probabilistic completeness** — the probability of finding a
solution approaches one with enough samples — which is the trade that made
high-DOF planning feasible.

<figure>
<svg viewBox="0 0 820 250" role="img" aria-label="A workspace with a shaped robot navigating between two obstacles, transformed into configuration space where the robot becomes a single point and the obstacles grow by the robot's geometry.">
  <defs>
    <marker id="arw-aima26-cspace" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" class="dgm-fill"/>
    </marker>
  </defs>
  <text x="180" y="28" text-anchor="middle" font-size="12" font-weight="700">WORKSPACE</text>
  <rect x="50" y="46" width="260" height="150" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <rect x="96" y="76" width="54" height="44" class="dgm-fill"/>
  <rect x="206" y="128" width="54" height="44" class="dgm-fill"/>
  <g class="dgm-accent-2">
    <rect x="70" y="150" width="26" height="18" fill="none" stroke="currentColor" stroke-width="1.8"/>
    <text x="83" y="186" text-anchor="middle" font-size="9.5">robot</text>
  </g>
  <text x="180" y="218" text-anchor="middle" font-size="10.5" class="dgm-muted">a shaped body among obstacles</text>
  <text x="180" y="238" text-anchor="middle" font-size="10.5" class="dgm-muted">collision depends on orientation too</text>
  <line x1="336" y1="120" x2="392" y2="120" stroke="currentColor" stroke-width="1.6" marker-end="url(#arw-aima26-cspace)"/>
  <text x="364" y="108" text-anchor="middle" font-size="9.5" class="dgm-muted">transform</text>
  <g class="dgm-accent">
    <text x="600" y="28" text-anchor="middle" font-size="12" font-weight="700">CONFIGURATION SPACE</text>
  </g>
  <rect x="470" y="46" width="260" height="150" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <g class="dgm-accent">
    <rect x="504" y="66" width="80" height="66" class="dgm-soft" stroke="currentColor" stroke-width="1.6"/>
    <rect x="614" y="118" width="80" height="66" class="dgm-soft" stroke="currentColor" stroke-width="1.6"/>
    <circle cx="496" cy="162" r="5" class="dgm-fill"/>
    <text x="496" y="186" text-anchor="middle" font-size="9.5">a point</text>
  </g>
  <path d="M500 158 Q 570 146 600 108 Q 628 74 704 80" fill="none" stroke="currentColor" stroke-width="1.5" stroke-dasharray="4 3"/>
  <text x="600" y="218" text-anchor="middle" font-size="10.5" class="dgm-muted">obstacles grow by the robot's geometry</text>
  <text x="600" y="238" text-anchor="middle" font-size="10.5" class="dgm-muted">planning becomes pathfinding for a point</text>
</svg>
<figcaption><b>The transform that makes planning tractable.</b> Move the robot's shape into the obstacles, and what remains is a search problem Chapter 3 already solved.</figcaption>
</figure>

## Executing

A path is not motion. **Control** converts a planned trajectory into actuator
commands in the presence of dynamics, friction, and disturbance. **PID control**
corrects proportionally to current error, its integral, and its derivative, and
the chapter's treatment of **gain** is the intuitive core: too low and the robot
tracks sluggishly, too high and it oscillates or goes unstable.

**Compliant control** regulates force rather than position, which is essential
for contact tasks — inserting a peg, wiping a surface, shaking a hand. Commanding
position against a rigid constraint produces enormous forces; commanding force
degrades gracefully. **Potential-field control** and reactive schemes close the
loop faster than replanning can.

**Planning under uncertainty** acknowledges that actuators slip and sensors lie,
so open-loop execution drifts. Robust methods select actions whose outcomes are
acceptable across the whole uncertainty set, and **information-gathering
motions** — touching a known surface to re-register position before a precision
operation — reduce uncertainty deliberately. This is Chapter 15's value of
information in physical form, and it is the same behavior POMDP solutions
generate.

## Learning on Hardware

**Reinforcement learning in robotics** faces one binding constraint: sample
efficiency. Chapter 23's algorithms assume cheap experience, and on hardware each
trial costs wall-clock time, wear, and sometimes a broken robot.

The responses are **sim-to-real transfer** with domain randomization —
train in simulation across randomized physics parameters so the policy is robust
to the reality gap; **learning from demonstration**, where a human provides the
initial policy; and **model-based** methods that extract more value per sample by
learning the dynamics. The chapter is realistic that none of these has made
end-to-end RL on physical robots routine.

## Sharing Space With People

The **humans and robots** section is where this chapter connects to the book's
larger argument.

A robot operating around people must **predict human behavior**, which requires a
model of people as agents with their own objectives. It must be **legible** —
moving in ways that make its intentions apparent, which is sometimes a different
trajectory from the most efficient one. And the chapter makes the observation
that reframes the problem: the robot's actions **change** what people do. A model
that predicts human behavior as though the robot were not there is wrong, because
people react to the robot. Prediction and planning are coupled, which is exactly
Chapter 17's multiagent setting arriving in physical space.

This is also where assistance games land concretely. A robot that must infer what
a person wants from their behavior, while its own behavior influences theirs, is
the assistance game with real actuators.

## Why It Matters

Robotics is the field's reality check. A language model's errors are text; a
robot's errors are physical, immediate, and occasionally dangerous, and the world
supplies no undo. That forces a discipline about uncertainty and failure that
software-only domains can defer.

Three exports are worth carrying. **Configuration space** is the general lesson
that the right coordinate transform can turn an intractable problem into a
familiar one. **Sampling-based planning** is the demonstration that abandoning
completeness for probabilistic completeness is often the correct engineering
trade in high dimensions. And the **prediction–action coupling** in human–robot
interaction is a general truth about deployed systems: any system whose outputs
influence the behavior it is predicting cannot treat that behavior as
exogenous — which is as true of a recommender as of a robot.
