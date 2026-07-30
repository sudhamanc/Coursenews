---
course: llm-canon
lectureId: "2023"
title: "The Compromise Nearly Every Model Made"
deck: "Grouped-Query Attention (2023) — a tunable interpolation between multi-head and multi-query attention that keeps most of the quality for almost all of the decoding speed, and can be retrofitted onto models already trained."
order: 24
readingTime: 11
tags: ["efficiency", "attention", "kv-cache", "decoding", "open-models"]
concepts:
  - id: grouped-query-attention
    term: "Grouped-Query Attention"
    definition: "Dividing a model's query heads into G groups that each share one key/value head; G equal to the head count recovers multi-head attention and G of one recovers multi-query attention, so it interpolates between them."
  - id: uptraining
    term: "Uptraining"
    definition: "Converting an existing multi-head checkpoint into a new attention configuration by merging its key/value heads and continuing training for a small fraction of the original compute, instead of pretraining anew."
  - id: mean-pooling-merge
    term: "Mean-Pooling Merge"
    definition: "Building each group's shared key/value head by averaging the original heads it replaces, which recovers more quality than selecting one head or reinitializing from scratch."
  - id: tensor-parallel-alignment
    term: "Tensor-Parallel Alignment"
    definition: "Setting the group count equal to the number of accelerators the model is sharded across, so each device holds exactly one key/value head and never replicates the cache."
---

Multi-query attention had struck a bargain the field could not entirely accept.
By sharing a single key and value across every query head, it shrank the KV cache
— the dominant memory cost of generation — by the full head count, and made
decoding dramatically faster. It also gave up more quality than many teams were
willing to lose, and it could not be bolted onto the models they had already paid
to train. By 2023 there were dozens of expensive multi-head checkpoints in the
world and a serving-cost problem that multi-query attention solved too
aggressively. A group at Google Research proposed the obvious thing nobody had
bothered to formalize: stop treating it as a binary choice.

## A Dial, Not a Switch

Multi-head attention gives every one of its $H$ query heads a private key and
value head. Multi-query attention gives all $H$ of them one shared pair.
**Grouped-query attention** simply puts a knob between the two. Divide the query
heads into $G$ groups and give each group a single shared key and value head.
Setting $G = H$ recovers ordinary multi-head attention, one KV head per query
head. Setting $G = 1$ recovers multi-query attention, one KV head for everyone.
Every value in between is a legitimate design point, trading cache size against
quality along a smooth line. In practice, models settled around $G = 8$, which
keeps eight key/value heads — enough to preserve most of the attention diversity
— while cutting the cache by whatever ratio $H/G$ the head count allows.

<figure>
<svg viewBox="0 0 860 270" role="img" aria-label="A spectrum of three attention schemes: multi-head attention pairs four query heads with four key/value heads, grouped-query attention routes two groups of query heads into two shared key/value heads, and multi-query attention sends all four query heads into a single key/value head; a trade-off axis runs from more attention diversity to a smaller, faster cache.">
  <defs>
    <marker id="arw-gqa" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" class="dgm-fill"/>
    </marker>
  </defs>
  <text x="140" y="30" text-anchor="middle" font-size="13" font-weight="700">MHA</text>
  <rect x="77" y="50" width="24" height="20" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <rect x="111" y="50" width="24" height="20" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <rect x="145" y="50" width="24" height="20" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <rect x="179" y="50" width="24" height="20" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <line x1="89" y1="72" x2="89" y2="148" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-gqa)"/>
  <line x1="123" y1="72" x2="123" y2="148" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-gqa)"/>
  <line x1="157" y1="72" x2="157" y2="148" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-gqa)"/>
  <line x1="191" y1="72" x2="191" y2="148" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-gqa)"/>
  <rect x="77" y="150" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <rect x="111" y="150" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <rect x="145" y="150" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <rect x="179" y="150" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="140" y="194" text-anchor="middle" font-size="11" class="dgm-muted">4 KV heads · G = H</text>
  <g class="dgm-accent">
    <text x="430" y="30" text-anchor="middle" font-size="13" font-weight="700">GQA</text>
    <rect x="367" y="50" width="24" height="20" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <rect x="401" y="50" width="24" height="20" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <rect x="435" y="50" width="24" height="20" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <rect x="469" y="50" width="24" height="20" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <line x1="379" y1="72" x2="389" y2="148" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-gqa)"/>
    <line x1="413" y1="72" x2="403" y2="148" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-gqa)"/>
    <line x1="447" y1="72" x2="457" y2="148" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-gqa)"/>
    <line x1="481" y1="72" x2="471" y2="148" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-gqa)"/>
    <rect x="381" y="150" width="30" height="24" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <rect x="449" y="150" width="30" height="24" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <text x="430" y="194" text-anchor="middle" font-size="11">2 KV heads · groups</text>
  </g>
  <text x="720" y="30" text-anchor="middle" font-size="13" font-weight="700">MQA</text>
  <rect x="657" y="50" width="24" height="20" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <rect x="691" y="50" width="24" height="20" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <rect x="725" y="50" width="24" height="20" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <rect x="759" y="50" width="24" height="20" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <line x1="669" y1="72" x2="702" y2="148" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-gqa)"/>
  <line x1="703" y1="72" x2="714" y2="148" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-gqa)"/>
  <line x1="737" y1="72" x2="726" y2="148" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-gqa)"/>
  <line x1="771" y1="72" x2="738" y2="148" stroke="currentColor" stroke-width="1.5" marker-end="url(#arw-gqa)"/>
  <rect x="690" y="150" width="60" height="24" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="720" y="194" text-anchor="middle" font-size="11" class="dgm-muted">1 KV head · G = 1</text>
  <line x1="110" y1="232" x2="750" y2="232" stroke="currentColor" stroke-width="1.5" marker-start="url(#arw-gqa)" marker-end="url(#arw-gqa)"/>
  <text x="150" y="252" text-anchor="middle" font-size="11" class="dgm-muted">more diversity</text>
  <g class="dgm-accent"><text x="430" y="252" text-anchor="middle" font-size="11">practical default</text></g>
  <text x="712" y="252" text-anchor="middle" font-size="11" class="dgm-muted">smaller, faster cache</text>
</svg>
<figcaption><b>One dial from MHA to MQA.</b> The top squares are query heads; each fans into a shared key/value head. Grouped-query attention sits in the middle — a few key/value heads instead of one per query head or one for all.</figcaption>
</figure>

## Uptraining: The Part That Mattered in Practice

The interpolation is the tidy idea; the contribution that changed the industry is
more mundane and more useful. The paper showed how to **uptrain** an existing
multi-head model into a grouped-query one without paying for a fresh pretraining
run. Take a trained checkpoint. For each group, build its single shared key head
by **mean-pooling** the key heads it is replacing — averaging them, which the
authors found beats selecting one head or reinitializing — and do the same for the
values. Then continue pretraining for a small slice of the original budget, on the
order of five percent. Out comes a grouped-query model that decodes cheaply and
has recovered nearly all of the quality lost in the merge.

There is a systems reason $G$ is usually set to the number of accelerators the
model is sharded across. Tensor parallelism already splits the heads across
devices; this **tensor-parallel alignment** means each accelerator holds exactly
one key/value head and never has to replicate the cache across the interconnect.

## What It Cost, and Didn't

The results were the point of the exercise: quality close to full multi-head
attention, decoding speed close to multi-query, across summarization and
question-answering benchmarks, and an uptraining bill small enough to disappear
against the original training cost. The remaining quality gap to multi-head
attention is small but not zero, and uptraining recovers most — not all — of what
the merge gives up. The deeper limitation is asymptotic. Grouped-query attention
still shrinks the cache by a constant factor; the cache still grows linearly with
sequence length. For the hundred-thousand- and million-token contexts that
arrived shortly after, a constant-factor win is the wrong *shape* of solution,
which is where cache compression proper picks up.

## Why It Matters

Grouped-query attention is now the quiet default of the open-model era. Llama 2 at
70B, every size of Llama 3, Mistral, Qwen, and most of their peers ship it; if a
2026 model card says nothing about its attention scheme, it is almost certainly
using this one. Its success is a study in engineering pragmatism. It introduced no
new mathematics — it is multi-query attention with a parameter — and its most
cited feature is a recipe for reusing checkpoints you already have. In a thread
defined by the realization that attention is bound by memory traffic rather than
by arithmetic, grouped-query attention is the compromise that made that
realization cheap enough for everyone to adopt at once.

## Lineage

- **Builds on:** [Multi-Query Attention](/courses/llm-canon/multi-query-attention), generalized from a single shared head into tunable groups, and [Attention Is All You Need](/courses/llm-canon/attention-is-all-you-need), whose multi-head design sits at one end of the dial.
- **Leads to:** [LLaMA](/courses/llm-canon/llama), which made it the open-model default, and [KV Cache Compression](/courses/llm-canon/kv-cache-compression), which attacks the linear growth grouped-query attention leaves intact.
