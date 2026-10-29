# pstack in practice: 3 cases and 5 tips for working with agents

![pstack / 03: From ideas to evidence](../../assets/posts/pstack-03-x-cover.png)

## Quick summary

Three practical ways to use pstack: compare website prototypes before choosing a design, measure where an app is slow, and recover earlier decisions from code and chat history.

Five tips to try: use `/in-your-own-words` to check that the agent understands you, `/teach` to understand the tradeoffs, and `/technical-writing` with `/unslop` to write clearer documentation.

Use `/reflect` to review how the work went, and set clear acceptance criteria so you can tell when it’s done.

Agents are quick to start coding. But sometimes you need to work out whether a design makes sense, where an app is slow, or why you chose an approach in the first place.

In this final article in my pstack series, I’ll walk through three examples and five tips you can use in your next chat.

## Case 1: Try a few designs before choosing one

Suppose you ask an agent to design your portfolio homepage. You start tweaking the colors, fonts, and spacing, and after a few rounds, you’ve settled on the overall design too.

That first version is only one option. You could spend several rounds polishing it before noticing that your projects are hard to browse or important information is buried.

Ask the agent to build a few frontend prototypes with the same content.

One could use a large image to highlight a featured project. Another could organize projects into cards, while a third could read more like an article about your background and work.

Open them in a browser. Compare what visitors see first, how the content unfolds as they scroll, and how each version reads on a phone.

Once you’ve tried the pages, you’ll have something more specific to discuss than “make it cleaner.”

In [Part 2](https://x.com/poteto/status/2097732320606507506), Lauren describes this approach as “Measure a hundred times, cut once.” She points to the risks of accepting the agent’s first design or endlessly refining a plan without practical evidence.

Trying different approaches with parallel agents can give you options you wouldn’t find by repeatedly tweaking the first version.

```
/poteto-mode
Build three different frontend prototypes for my portfolio website, using the same introduction and project content.
Use the supplied content and local data first. Wait until I choose a design direction before connecting the backend and other features.
```

After trying the prototypes, tell the agent which layout and visual style you prefer. You can ask it to combine elements from different versions.

## Case 2: Find out what’s slowing the app down

“Make my app faster” gives the agent a goal, but little to go on. It might make a reasonable-looking optimization that does nothing for the delay users actually notice.

In [Part 1](https://x.com/poteto/status/2094457600259842065), Lauren demonstrates a process for improving initial load: collect a trace, identify opportunities, make changes, and check the effect.

A baseline is your measurement before making changes. Profiling measures what the program does as it runs.

A trace shows that work on a timeline, helping you see where the delay occurs.

If a screen takes too long to become usable, the delay might come from loading data, processing it, or updating the interface. Measure first to decide which part to investigate.

```
/poteto-mode
Improve the time from app launch until the main screen is interactive.
Collect a baseline trace first, identify the bottlenecks worth addressing, then make targeted changes. Repeat the before-and-after measurements under the same conditions, and use the project’s verification skill to confirm that the main interactions still work.
```

Pay attention to cache state and execution conditions. A second launch may already be faster because of caching.

Measure cold-cache and warm-cache runs separately. A cold-cache run starts without cached data; a warm-cache run can reuse data already stored.

Keep changes that measurably help. Revert changes that add complexity without improving performance.

## Case 3: Pick up where you left off in a new chat

Return to a half-finished project in a new chat a few days later, and you may have forgotten why you made earlier changes.

Some decisions are buried in another conversation or a commit message. Others are reflected in the code, with no explanation nearby.

An agent that sees only the current request may retry an abandoned approach or remove code that had a reason to exist.

Context recovery helps you find that earlier reasoning and check whether it still applies to the project.

pstack offers `/recall` to recover work context, `/how` to understand current behavior, and `/why` to investigate design decisions. Lauren discusses working across chats on a Cursor problem in [Part 2](https://x.com/poteto/status/2097732320606507506).

Suppose you’re building a tool that turns batches of articles into Instagram cards. If preview and export use separate processing paths, investigate why they were split.

The split might address a specific limitation, or it might be left over from an earlier stage of development. The code shows how things work now; the conversation and commit history may explain why.

```
/poteto-mode
Continue work on this card tool. First use /recall to recover accessible related conversations, then use /how and /why to understand how preview and export currently work and why they are separate.
Summarize decisions already made, approaches already tried, and unresolved questions, with supporting evidence.
```

Which conversations an agent can retrieve depends on its tools and access permissions. You can supply missing conversations separately.

Compare old records with the current code too. Later changes may have altered the assumptions behind an earlier decision.

## Five skills for your next chat

### 1. /in-your-own-words: check the agent’s understanding

When someone says “editing cards feels clunky,” they might mean slow responses or too many steps. An agent can do a thorough job and still miss the problem if it starts with the wrong interpretation.

That’s what intent alignment is for: checking that you and the agent are trying to solve the same problem.

Paste the original feedback and use `/in-your-own-words` to ask the agent to explain what it thinks you want and what’s getting in the way.

You can add: “Separate the observed symptoms from your guesses about the cause.” Let the agent establish what “clunky” means before treating it as a rendering problem.

That’s intent alignment. When reviewing the agent’s restatement, check whether it treats guesses as facts or overlooks constraints that matter to you.

### 2. /teach: understand the tradeoffs

To judge a proposed design, you need to understand how the code works, what alternatives exist, and what each choice costs.

`/teach` combines `/how` and `/why` to explain how the code works and why it was designed that way. This helps you build a mental model of the system.

Ask for an explanation grounded in the code and project history, with a clear distinction between documented reasons and the agent’s interpretation.

### 3. /technical-writing and /unslop: make documentation clearer

When instructions, design decisions, and parameter descriptions are mixed together, readers have to hunt for what they need.

`/technical-writing` uses Diátaxis to work out what kind of document you’re writing and how to organize it.

A tutorial helps a beginner learn by doing, while a how-to guide helps someone complete a specific task. A reference is for looking up details, and an explanation helps readers understand how or why something works.

Once the purpose is clear, check whether the steps, expected results, and explanations fit the reader’s needs.

`/unslop` cleans up the sentences: empty AI phrasing, repeated summaries, forced contrasts, and long sentences that are hard to follow. Keep the facts, qualifications, and technical details that readers need.

### 4. /reflect: review the collaboration and improve skills

When you finish a task, look back at what went well and which mistakes kept coming up. `/reflect` reviews the current conversation to find ways to improve decisions, tool use, and the approach to the work.

One question it asks: What information could the agent have retrieved itself, but kept asking you to provide?

It uses examples from the conversation to suggest changes to the skill that handles that part of the work.

`/reflect` proposes those changes for you to review before updating the skill. That way, future tasks can benefit from what you learned in this one.

### 5. Be clear about success, but leave room to choose how

If the goal is vague, it’s hard to tell when the work is done. But deciding every implementation detail upfront can rule out other good approaches.

Acceptance criteria spell out what the result needs to do for you to consider it finished.

Describe what you want to happen, which constraints the agent needs to respect, and how you’ll check the result. Then give it room to propose an implementation.
