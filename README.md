# Milestone 1: parse the document into HTML format with proper attribute, store these are meta data in llamaIndex, so can back reference 


- Event Creation:For each chunk, two events are generated: one for the start (opening tag) and one for the end (closing tag).
Event Sorting:
All events are sorted by their character position in the full text. When events share the same position, start events are prioritized over end events.
HTML Construction:
The code iterates over the full text and inserts the appropriate HTML tags at each event point.
When a start event is encountered, an opening <span> with data-index is inserted.
When an end event is reached, a closing </span> is inserted.
Resulting HTML:
The final HTML string shows nested <span> elements for overlapping chunks. For example, if:

- Chunk 1 covers index 0–56,
- Chunk 2 covers index 40–100, and
- Chunk 3 covers index 90–140,
the resulting HTML will nest the spans appropriately so that:

The outer span (for chunk 1) wraps text from index 0 to 56 and continues after chunk 2,
The inner spans (for chunks 2 and 3) are nested according to their overlapping regions.
A sample compact output might look like:

```
<span class="highlight" data-index="1">Lorem ipsum dolor sit amet, consectetur <span class="highlight" data-index="2">adipiscing elit. </span>Sed do eiusmod tempor incididunt <span class="highlight" data-index="3">ut labore</span> et dolore magna aliqua. Ut enim ad</span> minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
```


# Milestone 2: mock up agent response, brainstorm on intuitive canvas UI interactions with CopilotKit 
# Milestone 3: benchmark against googleLLM, using different RAG strategies (hybrid search, knowledge graph, agent synthesis)



# Milestone 2: mock up agent response, brainstorm on intuitive canvas UI interactions with CopilotKit 
# Milestone 3: benchmark against googleLLM, using different RAG strategies (hybrid search, knowledge graph, agent synthesis)
