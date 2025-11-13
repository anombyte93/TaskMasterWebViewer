# TaskMaster Documentation MCP Server Design

**Problem:** 25,000+ words of documentation across 35+ files is difficult to search and retrieve contextually.

**Solution:** Vector database + MCP server for semantic search and RAG-based question answering.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│ Claude Code (MCP Client)                                │
│                                                          │
│  User Query: "How do I deploy to Replit?"               │
│         ↓                                                │
│  MCP Tool: search_taskmaster_docs()                     │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│ TaskMaster Docs MCP Server                              │
│                                                          │
│  1. Receive query                                       │
│  2. Generate embedding (OpenAI/local)                   │
│  3. Search vector DB                                    │
│  4. Retrieve top-k relevant chunks                      │
│  5. Optional: LLM synthesis of answer                   │
│  6. Return results with file paths                      │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│ Vector Database (Chroma/LanceDB/In-Memory)             │
│                                                          │
│  Collection: taskmaster_docs                            │
│  ├── User Guide chunks (embeddings)                     │
│  ├── API Reference chunks (embeddings)                  │
│  ├── Deployment Guides chunks (embeddings)              │
│  ├── Research Reports chunks (embeddings)               │
│  └── Testing Documentation chunks (embeddings)          │
│                                                          │
│  Metadata: file_path, section, category, date          │
└─────────────────────────────────────────────────────────┘
```

---

## Features

### 1. Semantic Search
```typescript
// Query: "How do I configure environment variables for Replit?"
// Returns: Relevant sections from replit-setup.md with context

const results = await mcp.search_taskmaster_docs({
  query: "configure environment variables Replit",
  limit: 5,
  category: "deployment" // optional filter
});
```

### 2. Question Answering (RAG)
```typescript
// Query: "What are the required environment variables?"
// Returns: Synthesized answer + source citations

const answer = await mcp.ask_taskmaster_docs({
  question: "What are the required environment variables?",
  mode: "synthesis" // vs "retrieval"
});

// Response:
// "The required environment variables are:
//  - PROJECT_ROOT: Path to project root (required)
//  - PORT: Server port (default: 5000)
//  - NODE_ENV: Environment (default: production)
//
//  Sources:
//  - docs/deployment/environment-variables.md:45-67
//  - docs/deployment/replit-setup.md:112-125"
```

### 3. Context-Aware Retrieval
```typescript
// Filters by category, date, file type
const results = await mcp.search_taskmaster_docs({
  query: "deployment troubleshooting",
  filters: {
    category: "deployment",
    file_type: "guide",
    modified_after: "2025-11-01"
  }
});
```

---

## Implementation Options

### Option 1: Standalone MCP Server (Recommended)

**Pros:**
- Project-specific, optimized for TaskMaster docs
- Full control over chunking strategy
- Can include custom metadata (task IDs, subtask IDs)
- Easy to extend with TaskMaster-specific features

**Tech Stack:**
```
Language: TypeScript/Node.js
Vector DB: LanceDB (embedded, no server needed)
Embeddings: OpenAI text-embedding-3-small (or local Transformers.js)
MCP SDK: @modelcontextprotocol/sdk
```

**File Structure:**
```
packages/taskmaster-docs-mcp/
├── src/
│   ├── index.ts              # MCP server entry point
│   ├── vectordb.ts           # LanceDB wrapper
│   ├── embeddings.ts         # Embedding generation
│   ├── chunker.ts            # Markdown chunking
│   ├── indexer.ts            # Document indexing
│   └── tools/
│       ├── search.ts         # Semantic search tool
│       ├── ask.ts            # RAG question answering
│       └── list.ts           # List available docs
├── data/
│   └── lance/                # LanceDB storage
├── package.json
└── tsconfig.json
```

### Option 2: Extend Existing System-Knowledge MCP

**Pros:**
- Already integrated in user's setup
- Unified search across all documentation
- No additional MCP server to configure

**Cons:**
- Less control over TaskMaster-specific features
- May not support RAG synthesis
- Shared namespace with other system knowledge

**Implementation:**
```bash
# Index TaskMaster docs into system-knowledge
cd /home/anombyte/Projects/in-progress/system-knowledge-vectordb
npm run index -- --path=/path/to/TaskMasterWebIntegration/docs
```

---

## Proposed Implementation: Option 1

### Step 1: Create MCP Server Package

```bash
cd /home/anombyte/Projects/in-progress/TaskMasterWebIntegration
mkdir -p packages/taskmaster-docs-mcp
cd packages/taskmaster-docs-mcp
npm init -y
```

### Step 2: Install Dependencies

```json
{
  "name": "taskmaster-docs-mcp",
  "version": "1.0.0",
  "main": "dist/index.js",
  "scripts": {
    "build": "tsc",
    "dev": "tsx watch src/index.ts",
    "index": "tsx src/indexer.ts"
  },
  "dependencies": {
    "@modelcontextprotocol/sdk": "^0.5.0",
    "vectordb": "^0.4.0",
    "openai": "^4.20.0",
    "marked": "^11.0.0",
    "gray-matter": "^4.0.3"
  },
  "devDependencies": {
    "typescript": "^5.3.0",
    "tsx": "^4.7.0",
    "@types/node": "^20.10.0"
  }
}
```

### Step 3: Core Implementation

**`src/index.ts`** - MCP Server:
```typescript
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { VectorDB } from "./vectordb.js";
import { searchTool, askTool, listTool } from "./tools/index.js";

const db = new VectorDB("./data/lance");

const server = new Server(
  {
    name: "taskmaster-docs-mcp",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Register tools
server.setRequestHandler("tools/list", async () => ({
  tools: [
    {
      name: "search_taskmaster_docs",
      description: "Semantic search across TaskMaster documentation",
      inputSchema: {
        type: "object",
        properties: {
          query: { type: "string", description: "Search query" },
          limit: { type: "number", default: 5 },
          category: {
            type: "string",
            enum: ["user-guide", "api", "deployment", "research", "testing"]
          }
        },
        required: ["query"]
      }
    },
    {
      name: "ask_taskmaster_docs",
      description: "Ask a question and get a synthesized answer with citations",
      inputSchema: {
        type: "object",
        properties: {
          question: { type: "string", description: "Question to answer" },
          mode: {
            type: "string",
            enum: ["retrieval", "synthesis"],
            default: "synthesis"
          }
        },
        required: ["question"]
      }
    }
  ]
}));

server.setRequestHandler("tools/call", async (request) => {
  switch (request.params.name) {
    case "search_taskmaster_docs":
      return searchTool(db, request.params.arguments);
    case "ask_taskmaster_docs":
      return askTool(db, request.params.arguments);
    default:
      throw new Error(`Unknown tool: ${request.params.name}`);
  }
});

const transport = new StdioServerTransport();
await server.connect(transport);
```

**`src/vectordb.ts`** - Vector Database Wrapper:
```typescript
import * as vectordb from "vectordb";

export class VectorDB {
  private db: vectordb.Connection;
  private table: vectordb.Table;

  constructor(private dbPath: string) {}

  async init() {
    this.db = await vectordb.connect(this.dbPath);

    try {
      this.table = await this.db.openTable("taskmaster_docs");
    } catch {
      // Create table if doesn't exist
      await this.createTable();
    }
  }

  async createTable() {
    const schema = {
      id: "string",
      content: "string",
      embedding: "vector(1536)", // OpenAI text-embedding-3-small
      file_path: "string",
      section: "string",
      category: "string",
      created_at: "string"
    };

    this.table = await this.db.createTable("taskmaster_docs", []);
  }

  async search(query: string, embedding: number[], limit: number = 5, filter?: any) {
    return this.table
      .search(embedding)
      .limit(limit)
      .filter(filter)
      .execute();
  }

  async add(documents: any[]) {
    return this.table.add(documents);
  }
}
```

**`src/embeddings.ts`** - Embedding Generation:
```typescript
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function generateEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: text
  });

  return response.data[0].embedding;
}

export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  const response = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: texts
  });

  return response.data.map(d => d.embedding);
}
```

**`src/chunker.ts`** - Markdown Chunking:
```typescript
import { marked } from "marked";
import matter from "gray-matter";

export interface Chunk {
  content: string;
  section: string;
  metadata: Record<string, any>;
}

export function chunkMarkdown(content: string, maxChunkSize = 1000): Chunk[] {
  const { data: frontmatter, content: markdown } = matter(content);

  const tokens = marked.lexer(markdown);
  const chunks: Chunk[] = [];
  let currentChunk = "";
  let currentSection = "Introduction";

  for (const token of tokens) {
    if (token.type === "heading" && token.depth <= 2) {
      // Start new chunk at major headings
      if (currentChunk.length > 0) {
        chunks.push({
          content: currentChunk,
          section: currentSection,
          metadata: frontmatter
        });
      }
      currentSection = token.text;
      currentChunk = `# ${token.text}\n\n`;
    } else {
      const tokenText = token.raw;

      if (currentChunk.length + tokenText.length > maxChunkSize) {
        // Chunk too large, split here
        chunks.push({
          content: currentChunk,
          section: currentSection,
          metadata: frontmatter
        });
        currentChunk = tokenText;
      } else {
        currentChunk += tokenText;
      }
    }
  }

  // Add final chunk
  if (currentChunk.length > 0) {
    chunks.push({
      content: currentChunk,
      section: currentSection,
      metadata: frontmatter
    });
  }

  return chunks;
}
```

**`src/indexer.ts`** - Document Indexing:
```typescript
import fs from "fs/promises";
import path from "path";
import { VectorDB } from "./vectordb.js";
import { chunkMarkdown } from "./chunker.js";
import { generateEmbeddings } from "./embeddings.js";

const DOCS_ROOT = path.join(__dirname, "../../docs");

async function indexDocs() {
  const db = new VectorDB("./data/lance");
  await db.init();

  const categories = ["user-guide", "api", "deployment", "research"];
  const allDocuments = [];

  for (const category of categories) {
    const categoryPath = path.join(DOCS_ROOT, category);
    const files = await fs.readdir(categoryPath);

    for (const file of files) {
      if (!file.endsWith(".md")) continue;

      const filePath = path.join(categoryPath, file);
      const content = await fs.readFile(filePath, "utf-8");
      const chunks = chunkMarkdown(content);

      for (let i = 0; i < chunks.length; i++) {
        allDocuments.push({
          id: `${category}/${file}#${i}`,
          content: chunks[i].content,
          file_path: filePath,
          section: chunks[i].section,
          category: category,
          created_at: new Date().toISOString()
        });
      }
    }
  }

  // Generate embeddings in batches
  const batchSize = 100;
  for (let i = 0; i < allDocuments.length; i += batchSize) {
    const batch = allDocuments.slice(i, i + batchSize);
    const contents = batch.map(doc => doc.content);
    const embeddings = await generateEmbeddings(contents);

    batch.forEach((doc, idx) => {
      doc.embedding = embeddings[idx];
    });

    await db.add(batch);
    console.log(`Indexed ${i + batch.length}/${allDocuments.length} documents`);
  }

  console.log("✅ Indexing complete!");
}

indexDocs().catch(console.error);
```

**`src/tools/search.ts`** - Search Tool:
```typescript
import { VectorDB } from "../vectordb.js";
import { generateEmbedding } from "../embeddings.js";

export async function searchTool(db: VectorDB, args: any) {
  const { query, limit = 5, category } = args;

  const embedding = await generateEmbedding(query);

  const filter = category ? { category } : undefined;
  const results = await db.search(query, embedding, limit, filter);

  return {
    content: [
      {
        type: "text",
        text: JSON.stringify({
          query,
          results: results.map((r: any) => ({
            content: r.content,
            file_path: r.file_path,
            section: r.section,
            score: r.score
          }))
        }, null, 2)
      }
    ]
  };
}
```

### Step 4: Configure in `.mcp.json`

```json
{
  "mcpServers": {
    "taskmaster-docs": {
      "command": "node",
      "args": [
        "./packages/taskmaster-docs-mcp/dist/index.js"
      ],
      "env": {
        "OPENAI_API_KEY": "${OPENAI_API_KEY}"
      }
    }
  }
}
```

### Step 5: Index Documentation

```bash
cd packages/taskmaster-docs-mcp
npm run build
npm run index
```

### Step 6: Use in Claude Code

```typescript
// Semantic search
const results = await mcp.search_taskmaster_docs({
  query: "How do I deploy to Replit?",
  category: "deployment"
});

// Question answering
const answer = await mcp.ask_taskmaster_docs({
  question: "What environment variables are required for Replit deployment?",
  mode: "synthesis"
});
```

---

## Alternative: Quick Implementation with Existing System

If you want to use the existing `system-knowledge` MCP server immediately:

```bash
# Index TaskMaster docs
cd /home/anombyte/Projects/in-progress/system-knowledge-vectordb

# Index all documentation
npm run index -- \
  --path=/home/anombyte/Projects/in-progress/TaskMasterWebIntegration/docs \
  --category=taskmaster \
  --type=documentation

# Now searchable via:
mcp__system-knowledge__search_knowledge({
  query: "Replit deployment environment variables",
  filter_category: "documentation"
})
```

---

## Recommendation

**Short-term (today):** Use existing `system-knowledge` MCP to index docs immediately

**Medium-term (next week):** Build dedicated TaskMaster docs MCP server with:
- Better TaskMaster-specific features (task ID linking)
- RAG-based question answering
- Custom chunking for API docs
- Integration with TaskMaster CLI

**Long-term:** Extend to index:
- Code comments and docstrings
- Git commit messages
- Issue tracker history
- Task execution logs

---

## Estimated Effort

**Quick solution (system-knowledge):** 10 minutes
**Custom MCP server:** 4-6 hours
**Full RAG with synthesis:** 8-10 hours

---

**Next Steps:**

1. Choose approach (system-knowledge vs custom MCP)
2. Index existing documentation
3. Test semantic search queries
4. Add to development workflow
5. Consider making this Task 18 or a Phase 3 enhancement
