# Missouri Bills AI Agent

LangGraph-based agent for querying Missouri legislative bills using RAG (Retrieval-Augmented Generation).

## Features

The agent provides the following capabilities:

1. **Semantic Search** - Find bills by topic or content using vector similarity
2. **Bill Lookup** - Get detailed information about specific bills
3. **Legislator Info** - Look up legislator details and sponsorships
4. **Bill Timeline** - View legislative history and actions
5. **Committee Hearings** - Find hearing information
6. **Metadata Filtering** - Search by year, sponsor, or committee

## Tools

### `search_bills_semantic(query, limit, filters)`
Search for bills using natural language queries.

**Examples:**
- "healthcare bills"
- "education funding reforms"
- "tax legislation in 2026"

### `get_bill_by_number(bill_number, session_year)`
Get detailed information about a specific bill.

**Examples:**
- "Tell me about HB1366"
- "What is HB2146"

### `get_legislator_info(name)`
Look up legislator information.

**Examples:**
- "Who is Rep. Smith?"
- "Tell me about Jane Doe"

### `get_bill_timeline(bill_number, session_year)`
View the legislative history for a bill.

**Examples:**
- "What happened to HB1366?"
- "Show timeline for HB2146"

### `get_committee_hearings(bill_number, committee_name)`
Find hearing information.

**Examples:**
- "When was HB1366 heard?"
- "What bills are in the Health Committee?"

### `search_bills_by_filters(session_year, sponsor_name, committee_name, limit)`
Search bills by metadata.

**Examples:**
- "Bills from 2026"
- "Bills sponsored by Jane Doe"
- "Bills in Health Committee"

## Usage

### Command Line

Run the agent from the command line:

```bash
uv run python -m agent.graph "What bills are about healthcare in 2026?"
```

### LangGraph Studio

1. Install [LangGraph Studio](https://github.com/langchain-ai/langgraph-studio)

2. Open this project in LangGraph Studio

3. The agent will be automatically loaded from `langgraph.json`

4. Interact with the agent through the Studio UI

### Python API

```python
from agent.graph import create_agent, run_agent

# Create agent
agent = create_agent()

# Run query
response = run_agent("What bills are about education?", agent=agent)
print(response)
```

## Example Queries

- "Find bills about healthcare in 2026"
- "What bills did Rep. Smith sponsor?"
- "Tell me about HB1366"
- "Show me the timeline for HB2146"
- "What bills were heard in the Health Committee?"
- "Find education bills from 2025"
- "Who sponsored HB1708?"

## Architecture

The agent uses a simple ReAct-style loop:

```
User Query → Agent (LLM with tools) → Tool Execution → Agent → Response
                   ↓                                    ↑
                   └────────────── Loop ────────────────┘
```

**Components:**
- **Agent Node**: GPT-4o decides which tools to call
- **Tools Node**: Executes tool calls
- **State**: Maintains conversation history

**Tools access:**
- Database queries via Supabase
- Vector search via pgvector
- Semantic embeddings via OpenAI

## Configuration

Requires environment variables in `.env`:
- `OPENAI_API_KEY` - For LLM and embeddings
- `SUPABASE_URL` - Database URL
- `SUPABASE_KEY` - Database API key
