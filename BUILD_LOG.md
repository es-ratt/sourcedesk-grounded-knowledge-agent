# FL-07 Build Log — SourceDesk

## Core job
SourceDesk answers one question at a time using only retrieved passages from `server/knowledge/sourcedesk-handbook.md`. The answer includes inline `[S#]` citations, while the workspace exposes the exact cited excerpts in the evidence trail.

## Iteration record

| Pass | What happened | Change | Result |
|---|---|---|---|
| 01 | The initial concept was too broad for a reliable checkpoint. | Narrowed the loop to question → retrieve → grounded answer → inspect evidence. | The MVP has one clear success path. |
| 02 | The first design did not yet have a live data connection. | Added a server-side Markdown handbook and read it at query time. | The agent now uses a real bundled source on every run. |
| 03 | Citation IDs alone were not reviewable. | Added exact source excerpts, an evidence trail, and session history. | A reviewer can inspect why an answer was produced. |
| 04 | The broader spec implied capabilities not needed for Checkpoint 1. | Cut uploads, multi-source search, web browsing, streaming, persistent memory, and production embeddings. | Scope is smaller but the end-to-end loop is demonstrable. |

## What broke and what changed

The first retrieval implementation counted common words such as “the” and “what,” which could make unrelated passages appear relevant. I added stopword filtering and synonym-aware matching. A test also exposed that the heading used for the handbook was being treated as a passage, so the parser was corrected to assign IDs only to real `##` sections. The test suite now covers source loading, relevant retrieval, synonym matching, and unsupported questions.

## Grounding contract

The server retrieves passages before calling the language model. The model receives the user question and only the retrieved source block. Its system instruction requires it to avoid outside knowledge, state when the source is insufficient, and cite substantive claims with existing source IDs. If retrieval returns no passages, the server returns a not-found response without calling the model.

## Deliberate cuts

This checkpoint does not include user uploads, multiple knowledge files, web search, streaming output, persistent database-backed conversation history, or embedding-based semantic search. “Semantic-style” retrieval is represented by normalized keyword overlap, phrase matching, and a small synonym map; true vector embeddings are deferred until the single-source contract is stable.

## Raw run capture

Start on the workspace page. Ask: “How does SourceDesk keep answers grounded?” Wait for the answer, confirm the inline citations, and open the evidence trail and session history. Record the entire flow without pauses, edits, or overlays. The expected visible loop is request → retrieved answer → inline citations → exact excerpts.
