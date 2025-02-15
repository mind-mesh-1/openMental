# Project Title
![Coverage JS/TS](https://img.shields.io/codecov/c/github/jzhao62/notebook-llm-copilot/main.svg)
![Build Status](https://github.com/jzhao62/notebook-llm-copilot/actions/workflows/test-coverage.yml/badge.svg)

## Overview

This project aims to parse documents into HTML format with proper attributes, storing these as metadata in llamaIndex for back-referencing.

## Milestones

### Milestone 1: HTML Parsing and Metadata Storage

- **Event Creation**: For each chunk, two events are generated: one for the start (opening tag) and one for the end (closing tag).
- **Event Sorting**: All events are sorted by their character position in the full text. When events share the same position, start events are prioritized over end events.
- **HTML Construction**: The code iterates over the full text and inserts the appropriate HTML tags at each event point.
  - When a start event is encountered, an opening `<span>` with `data-index` is inserted.
  - When an end event is reached, a closing `</span>` is inserted.

#### Resulting HTML Example

The final HTML string shows nested `<span>` elements for overlapping chunks. For example, if:
- Chunk 1 covers index 0–56,
- Chunk 2 covers index 40–100, and
- Chunk 3 covers index 90–140,

The resulting HTML will nest the spans appropriately:

```html
<span class="highlight" data-index="1">Lorem ipsum dolor sit amet, consectetur <span class="highlight" data-index="2">adipiscing elit. </span>Sed do eiusmod tempor incididunt <span class="highlight" data-index="3">ut labore</span> et dolore magna aliqua. Ut enim ad</span> minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
```

### Milestone 2: Agent Response Mockup and UI Interactions

- Mock up agent response and brainstorm on intuitive canvas UI interactions with CopilotKit.

### Milestone 3: Benchmarking

- Benchmark against Google LLM using different RAG strategies (hybrid search, knowledge graph, agent synthesis).

## POC and MVP

- **POC**: Demonstrate the ability to parse documents into HTML with metadata storage.
- **MVP**: Develop a functional UI with agent response capabilities and benchmark performance against existing solutions.
