# MO Bills

An AI-powered chatbot for querying and analyzing Missouri House of Representatives bills using RAG (Retrieval-Augmented Generation).

## Vision

This project aims to make Missouri legislative information accessible and queryable through natural language. Users will be able to ask questions about bills, sponsors, legislative actions, and more, with the AI agent providing informed responses based on comprehensive bill data.

## Current Status

🟢 **Phase 1: Data Ingestion & Storage** (Complete)

- ✅ Web scraper built and functional
- ✅ Comprehensive bill data extraction (sponsors, actions, hearings, PDFs)
- ✅ Legislator profile scraping (party, years served, active status)
- ✅ Session-based database architecture
- ✅ Direct insertion into PostgreSQL with pgvector

🟢 **Phase 2: Vectorization & RAG Setup** (Complete)

- ✅ Embeddings pipeline with LangChain SDK
- ✅ Smart chunking (section-based for legislative text, sentence-based for summaries)
- ✅ Document filtering (Introduced + most recent version, excludes fiscal notes)
- ✅ Rich metadata (session, sponsors, co-sponsors, committees)
- ✅ Vector storage with pgvector and similarity search function

🟢 **Phase 3: AI Agent Development** (Complete)

- ✅ LangGraph agent with 6 specialized tools
- ✅ Semantic search using vector embeddings
- ✅ Bill lookup, timeline, and hearing queries
- ✅ LangGraph Studio integration

## Architecture (Planned)

```
┌─────────────────┐
│  React Frontend │
└────────┬────────┘
         │
┌────────▼────────┐
│  FastAPI        │
│  Backend        │
└────────┬────────┘
         │
┌────────▼────────┐
│  LangGraph/     │
│  LangChain      │
│  Agent          │
└────────┬────────┘
         │
┌────────▼────────┐
│  PostgreSQL     │
│  (Supabase)     │
│  + pgvector     │
└─────────────────┘
```

## Technology Stack

**Current:**
- **Python 3.9+** - Data ingestion and embeddings
- **Playwright** - Web scraping and automation
- **UV** - Fast Python package management
- **Supabase** - PostgreSQL database with pgvector extension
- **LangGraph.js** - AI agent orchestration with RAG
- **OpenAI** - Embeddings (text-embedding-3-small) and LLM (GPT-4o)
- **Next.js 15** - Full-stack React framework with TypeScript
- **Tailwind CSS** - Styling

**Future:**
- Additional UI features and optimizations
- Deployment to production

## Project Roadmap

- [x] **Phase 1: Data Ingestion & Storage**
  - [x] Scrape bill metadata (sponsors, actions, hearings)
  - [x] Scrape legislator details (party, years served, active status)
  - [x] Download bill text PDFs
  - [x] Design session-based database schema
  - [x] Direct insertion of scraped data into Supabase

- [x] **Phase 2: Vectorization & RAG Setup**
  - [x] Generate embeddings for bill text and metadata
  - [x] Create vector indexes for similarity search
  - [x] Implement smart chunking strategies
  - [x] Add comprehensive metadata to embeddings

- [x] **Phase 3: AI Agent Development**
  - [x] Build LangChain/LangGraph agent
  - [x] Implement RAG pipeline
  - [x] Create tools for querying bill data

- [ ] **Phase 4: API Backend**
  - [ ] Build FastAPI application
  - [ ] Create REST endpoints for chat interactions
  - [ ] Implement authentication

- [ ] **Phase 5: Frontend**
  - [ ] Build React chat interface
  - [ ] Implement real-time messaging
  - [ ] Deploy to production

## Getting Started

### Prerequisites

- Python 3.9 or higher
- [UV](https://github.com/astral-sh/uv) package manager (for ingestion)
- Node.js 18+ and npm (for Next.js app)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/nathanortbals/mo-bills.git
cd mo-bills
```

2. **Install Python dependencies** (for scraping/embeddings):
```bash
cd ingestion
uv sync
uv run playwright install chromium
```

3. **Install Next.js dependencies** (for app):
```bash
cd ../app
npm install
```

4. **Configure environment variables**:

Create `.env` file in `ingestion/` directory:
```bash
SUPABASE_URL=your-project-url
SUPABASE_KEY=your-api-key
OPENAI_API_KEY=your-openai-api-key
```

Create `.env.local` file in `app/` directory:
```bash
SUPABASE_URL=your-project-url
SUPABASE_KEY=your-api-key
OPENAI_API_KEY=your-openai-api-key
```

### Usage

#### Single Session

The scraping process follows a 2-step workflow:

**Step 1: Scrape Legislators**
```bash
uv run python ingestion/legislators/scrape_mo_legislators.py --year 2023
```

**Step 2: Scrape Bills**
```bash
uv run python ingestion/bills/scrape_mo_house_bills.py --year 2023
```

#### All Sessions (2026-2000)

To scrape all sessions at once:
```bash
uv run python ingestion/scrape_all_sessions.py
```

This will process sessions from 2026 back to 2000. The script is idempotent and can be safely interrupted and resumed.

**Step 3: Generate Embeddings**

After scraping bills, generate vector embeddings for semantic search.

For a single session:
```bash
uv run python -m ingestion.embeddings.embeddings_pipeline --year 2026 --session-code R
```

Options:
- `--year`: Legislative year (required)
- `--session-code`: Session code - R (Regular), S1 (First Special), S2 (Second Special)
- `--limit`: Optional limit on number of bills to process

For all sessions at once:
```bash
uv run python ingestion/generate_all_embeddings.py
```

The pipeline will:
- Extract text from bill PDFs in Supabase Storage
- Filter to "Introduced" + most recent version (excludes fiscal notes)
- Chunk using section-based or sentence-based strategies
- Generate embeddings via OpenAI text-embedding-3-small
- Store with comprehensive metadata (sponsors, committees, session info)

#### Using the Next.js App

After generating embeddings, you can interact with the AI agent through the Next.js web application:

1. Start the Next.js development server:
   ```bash
   cd app
   npm run dev
   ```

2. Open your browser to `http://localhost:3000`

3. Start asking questions through the chat interface:
   - "What bills are about healthcare in 2026?"
   - "Tell me about HB 1366"
   - "Show me the timeline for HB 2146"
   - "What bills did Rep. Smith sponsor?"

**Available Agent Tools:**
The AI agent has access to 6 specialized tools:
- `search_bills_semantic` - Find bills by topic using vector search
- `get_bill_by_number` - Get detailed information about a specific bill
- `get_legislator_info` - Look up legislator details
- `get_bill_timeline` - View legislative history and actions
- `get_committee_hearings` - Find hearing information
- `search_bills_by_year` - Search bills by session year

**API Endpoint:**
You can also interact with the agent programmatically via the API:
```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What bills are about education funding?"}'
```

For detailed usage instructions and options, see:
- [Legislator Scraper Documentation](ingestion/legislators/README.md)
- [Bill Scraper Documentation](ingestion/bills/README.md)

## Documentation

- **[Database Schema](DATABASE_SCHEMA.md)** - Complete schema documentation with table definitions, relationships, and example queries
- **[Claude Code Guidance](CLAUDE.md)** - Development guidance for working with this codebase
- **[Legislator Scraper](ingestion/legislators/README.md)** - Scraper usage, options, and data sources
- **[Bill Scraper](ingestion/bills/README.md)** - Scraper usage, options, and data sources

## Project Structure

```
mo-bills/
├── app/                            # Next.js application
│   ├── app/                        # Next.js app directory
│   │   ├── api/chat/              # Chat API endpoint
│   │   └── ...                    # Pages and components
│   ├── lib/
│   │   ├── agent/                 # TypeScript agent implementation
│   │   │   ├── graph.ts          # LangGraph agent
│   │   │   └── tools.ts          # Agent tools
│   │   └── db.ts                 # Database utilities
│   ├── package.json              # Node.js dependencies
│   └── .env.local                # Environment variables (gitignored)
├── ingestion/                     # Python data ingestion
│   ├── bills/                    # Bill scraper
│   ├── legislators/              # Legislator scraper
│   ├── embeddings/               # Embeddings pipeline
│   │   ├── chunking.py          # Text chunking strategies
│   │   └── embeddings_pipeline.py # Main embeddings pipeline
│   ├── scrape_all_sessions.py   # Batch scraper for all sessions
│   ├── generate_all_embeddings.py # Batch embeddings generator
│   ├── db_utils.py              # Shared database utilities
│   ├── pyproject.toml           # Python dependencies
│   ├── uv.lock                  # UV lockfile
│   └── .venv/                   # Python virtual environment
├── database/
│   └── migrations/              # Database migrations
├── bill_pdfs/                   # Downloaded PDFs (gitignored)
├── DATABASE_SCHEMA.md           # Database documentation
├── CLAUDE.md                    # Claude Code guidance
└── README.md                    # This file
```

## Contributing

This is a personal project, but suggestions and feedback are welcome! Feel free to open an issue or submit a pull request.

## License

MIT License - See LICENSE file for details

## Contact

Nathan Ortbals - nathan.ortbals@gmail.com

Project Link: https://github.com/nathanortbals/mo-bills
