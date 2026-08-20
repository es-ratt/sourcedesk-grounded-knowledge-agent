# SourceDesk

> A grounded AI knowledge-base chat application that answers from a curated source file and keeps the evidence visible.

**Live preview:** [Open SourceDesk](https://3000-iy4wf0vwcizxfe8xluovj-16334de8.us3.manus.computer)

## Repository metadata

| Field | Value |
|---|---|
| Recommended repository name | `sourcedesk-grounded-knowledge-agent` |
| Short description | `Evidence-first AI knowledge-base chat with server-side retrieval and inline citations.` |
| Project type | Full-stack React and TypeScript application |
| Assignment | FL-07 · General AI Fluency · Build checkpoint 1 |
| Primary connection | Server-side Markdown knowledge file |
| License suggestion | MIT, if you want to publish the repository publicly |

## Overview

SourceDesk is an evidence-first knowledge assistant. A user asks a question in the chat workspace, the server reads the connected Markdown handbook, retrieves the most relevant passages, and sends only those passages to the language model. The returned answer must contain inline citations such as `[S1]`. The server validates those citations against the passages retrieved for that specific request before the answer is shown as grounded.

The application is intentionally narrow. It proves the core end-to-end loop before expanding into uploads, multiple knowledge sources, persistent memory, web search, or production embedding infrastructure.

## Core workflow

```text
User question
     |
     v
Server-side handbook read
     |
     v
Hybrid retrieval: keywords + phrase matches + synonyms
     |
     v
Retrieved source passages only
     |
     v
Server-side LLM answer generation
     |
     v
Citation validation against retrieved IDs
     |
     v
Answer + evidence trail + session history
```

## Features

### Grounded chat

The main workspace uses a focused chat interface for asking questions about the connected handbook. Suggested prompts make the successful first run easy to reproduce, while the chat component renders the answer as Markdown.

### Live knowledge connection

The file `server/knowledge/sourcedesk-handbook.md` is bundled with the server and read at query time. The browser does not need to load the entire source file before a question is submitted.

### Hybrid retrieval

The retrieval layer normalizes the question and passage text, removes common stopwords, scores keyword overlap, rewards exact phrase matches, and expands a small set of source-aware synonyms. The highest-scoring passages are passed to the answer model.

This checkpoint uses a deterministic hybrid heuristic instead of a vector database or embedding service. That keeps the first build inspectable and lightweight while preserving a clear upgrade path.

### Citation enforcement

The answer model is instructed to cite substantive claims using existing passage IDs. The server then checks the generated answer for inline citations. An answer is accepted as grounded only when it contains at least one citation and every cited ID belongs to the retrieved passage set. Missing or fabricated citations trigger a safe fallback response.

### Evidence trail

The evidence trail displays the exact source excerpts used for the active answer. This makes the model’s evidence reviewable rather than asking the user to trust a citation label without context.

### Session history

The history panel records each question, final answer, citation IDs, and the relevant excerpt text for the active browser session. It is intentionally session-only in this MVP; no long-term conversation storage is claimed.

### Build log

The `/build-log` route documents the real build iterations, fixes, scope cuts, grounding contract, and raw capture sequence required for the FL-07 submission.

## Technology stack

| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript, Vite |
| Styling | Tailwind CSS 4, custom CSS tokens, DM Sans |
| UI components | Project-provided shadcn-style components |
| API layer | Express, tRPC 11 |
| AI integration | Server-side built-in LLM helper |
| Testing | Vitest |
| Authentication scaffold | Manus OAuth template integration |
| Data source | Bundled Markdown file |

## Project structure

```text
.
├── client/
│   ├── src/
│   │   ├── components/AIChatBox.tsx
│   │   ├── pages/Home.tsx
│   │   ├── pages/BuildLog.tsx
│   │   ├── App.tsx
│   │   └── index.css
├── server/
│   ├── knowledge/
│   │   ├── sourcedesk-handbook.md
│   │   ├── retrieval.ts
│   │   └── retrieval.test.ts
│   ├── routers.ts
│   ├── routers.test.ts
│   └── _core/
├── BUILD_LOG.md
├── todo.md
├── package.json
└── README.md
```

## Local development

### Requirements

Use Node.js 20 or newer and pnpm. The project also expects the platform-provided server environment variables for the built-in LLM helper and the application runtime.

### Install dependencies

```bash
pnpm install
```

### Start the development server

```bash
pnpm dev
```

The development server prints the local URL. Open that URL in a browser and use the suggested prompt `How does SourceDesk keep answers grounded?` to run the core loop.

### Type check

```bash
pnpm check
```

### Run tests

```bash
pnpm test
```

### Build for production

```bash
pnpm build
pnpm start
```

The production process must receive its port from the hosting runtime. Do not hardcode a deployment port in application code.

## Grounding and safety contract

The application follows four rules:

1. Retrieval happens before the model call.
2. Only the user question and retrieved source block are passed to the model.
3. The model must not answer from outside knowledge or invent unsupported claims.
4. The server validates inline citation IDs before returning the answer as grounded.

If retrieval returns no relevant passage, SourceDesk does not call the model. It returns a clear response explaining that the connected source cannot verify the request.

## Testing coverage

The current test suite covers source loading, relevant retrieval, synonym-aware retrieval, unsupported questions, valid citations, missing citations, fabricated citation IDs, the no-results procedure path, a valid grounded answer path, and invalid-citation fallback behavior.

Run the complete suite with:

```bash
pnpm check && pnpm test
```

## Raw run capture for FL-07

For the required unedited capture, begin on the workspace page. Ask:

```text
How does SourceDesk keep answers grounded?
```

Record the full sequence without editing: submit the request, wait for the answer, show the inline `[S#]` citations, and open the evidence trail and session history. The result should visibly show the complete loop from request to cited answer and exact source excerpts.

## Known MVP limits

This checkpoint intentionally supports one bundled Markdown handbook. It does not yet include user uploads, multiple knowledge files, external web search, streaming token output, persistent conversation storage, multi-user workspaces, or vector-embedding retrieval. These are future extensions, not hidden capabilities of the current build.

## Future improvements

A next iteration could add file ingestion with a document registry, chunk-level metadata, embedding-based semantic retrieval, source versioning, persistent conversation records, streaming responses, and an evaluation set that measures citation precision and grounded-answer coverage.

## GitHub push commands

Create an empty GitHub repository using the recommended name, then run these commands from the project root. Replace `YOUR_USERNAME` with the GitHub account or organization that owns the repository.

```bash
git init
git add .
git commit -m "Build SourceDesk grounded knowledge agent"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/sourcedesk-grounded-knowledge-agent.git
git push -u origin main
```

If the repository already has a remote named `origin`, use this instead:

```bash
git remote set-url origin https://github.com/YOUR_USERNAME/sourcedesk-grounded-knowledge-agent.git
git add .
git commit -m "Update SourceDesk README and project documentation"
git push -u origin main
```

For SSH-based GitHub authentication:

```bash
git remote add origin git@github.com:YOUR_USERNAME/sourcedesk-grounded-knowledge-agent.git
git branch -M main
git push -u origin main
```

## License

No license is declared in this repository yet. Add an MIT license if you want others to reuse the code under permissive terms.

## References

[1]: https://react.dev/ "React documentation"
[2]: https://trpc.io/docs "tRPC documentation"
[3]: https://vitest.dev/ "Vitest documentation"
