# MCP Automatic Documentation Context Research

**Date:** 2025-11-13
**Mode:** Ultrathink + Perplexity Pro
**Query:** How to make AI know about docs in vector DB without explicit tool calls
**Status:** ✅ Complete

---

## Executive Summary

**Problem:** 25,000+ words of TaskMaster documentation requires explicit tool calls to access, breaking conversation flow.

**Solution:** Hybrid MCP architecture with **3-tier documentation access**:
1. **Tier 1 - Resources** (4K words): Core docs always in context - "ambient knowledge"
2. **Tier 2 - Prompts** (on-demand): Guided retrieval for deep topics - "thoughtful consultation"
3. **Tier 3 - Tools** (explicit): Comprehensive search for edge cases - "research mode"

**Expected Impact:**
- 80% of questions answered without tool calls (Tier 1)
- Complex queries resolved in 1 prompt invocation (Tier 2)
- Natural documentation experience - AI "just knows" essentials

**Implementation:** Custom MCP server with resources capability (~6 hours)

---

## Research Process

### Perplexity Research (3 Queries)

**Query 1:** "MCP Model Context Protocol automatic context injection patterns 2024 2025"

**Key Findings:**
- MCP provides three primitives: **resources**, **prompts**, **tools**
- Resources = structured data/documents as part of session context
- Bidirectional context loop for ongoing interaction
- Can surface documentation without explicit tool calls

**Query 2:** "vector database RAG automatic context retrieval for LLM conversational AI Claude Code MCP server architecture 2024"

**Key Findings:**
- Vector DB stores embeddings for semantic search
- MCP server interfaces with vector store
- Retrieves top-k chunks with provenance metadata
- Feeds into LLM prompt as grounded context

**Query 3:** "MCP resources capability prompt injection system messages documentation context 2024"

**Key Findings:**
- Server-provided resources embed docs directly in session
- Prompts nudge AI to consult bundled documentation
- Resources have metadata (version, source, freshness)
- Pattern: "knowledge base MCP server" with read-only resource interface

---

## The Real Problem

**User's Request:** "AI to know about docs in vector DB without needing to go to docs in project first"

**Translation:**
- Documentation should be **ambient** - present without friction
- AI should reference docs naturally, like consulting memory
- No `search_docs("how to deploy")` calls - just *knowing*

**Why it matters:**
- Current workflow: AI must explicitly search each time
- Ideal workflow: AI has documentation as working memory
- User experience: Documentation feels like AI's native knowledge

---

## WWSJD Analysis: Question the Premise

**Current assumption:** "We need to make docs searchable via MCP tools"

**Better question:** "How do we make documentation feel like the AI's native knowledge?"

**The insight:** MCP Resources aren't just data blobs - they're **ambient context**. Like how you don't actively "search" your own memory when writing code - you just know the patterns.

---

## Three Architectural Approaches

### Approach 1: MCP Resources (Embedded Documentation)

**Philosophy:** Documentation as session-level memory

**How it works:**
```typescript
// MCP Server provides resources
{
  "resources": [
    {
      "uri": "taskmaster://docs/deployment/replit",
      "name": "Replit Deployment Guide",
      "mimeType": "text/markdown",
      "content": "[Full deployment guide content]"
    }
  ]
}
```

**Pros:**
- ✅ True "ambient knowledge" - no tool calls
- ✅ Simple architecture
- ✅ Fast - no runtime latency
- ✅ Stateless

**Cons:**
- ❌ Context window limits (25K words may exceed budget)
- ❌ Static - all docs loaded upfront
- ❌ No semantic search

**Best for:** Small to medium documentation sets (<10K words)

---

### Approach 2: MCP Prompts + Lightweight Tools

**Philosophy:** Documentation as guided retrieval

**How it works:**
```typescript
// MCP Server provides prompts that reference docs
{
  "prompts": [
    {
      "name": "consult_deployment_docs",
      "description": "Get guidance on deployment questions",
      "arguments": [{ "name": "question" }]
    }
  ]
}

// Prompt template injects docs context
async function consultDeploymentDocs(question: string) {
  const relevantDocs = await vectorDB.search(question, { limit: 3 });
  return formatPromptWithDocs(relevantDocs, question);
}
```

**Pros:**
- ✅ Semantic search - finds relevant docs automatically
- ✅ Context-efficient - only retrieves what's needed
- ✅ Scales to large documentation sets
- ✅ Dynamic - can update docs without restart

**Cons:**
- ❌ Still requires explicit invocation
- ❌ AI must know *when* to consult docs
- ❌ Two-step process

**Best for:** Large documentation sets with targeted queries

---

### Approach 3: Hybrid - Resources + Prompts + Tools ⭐ RECOMMENDED

**Philosophy:** Documentation as tiered knowledge system

**The Elegant Solution:**

> "Documentation should be like a craftsman's workshop. Essential tools on the pegboard (Resources). Reference manuals on the shelf (Prompts). Archives in the back room (Tools)."

**Tiered Access Pattern:**

```
┌─────────────────────────────────────────────────┐
│ Tier 1: Core Docs (Resources) - 4K words       │
│ ├─ Quick Start Guide (always in context)        │
│ ├─ API Summary (always in context)              │
│ └─ Common Patterns (always in context)          │
│                                                  │
│ AI has ambient knowledge of essentials          │
└─────────────────────────────────────────────────┘
         ↓ When AI needs specific details
┌─────────────────────────────────────────────────┐
│ Tier 2: Guided Retrieval (Prompts)              │
│ deployment_guide, api_reference, troubleshooting│
│                                                  │
│ Fetches 3 relevant chunks from vector DB        │
│ Returns formatted context + question            │
└─────────────────────────────────────────────────┘
         ↓ When AI needs comprehensive search
┌─────────────────────────────────────────────────┐
│ Tier 3: Explicit Search (Tools)                 │
│ search_taskmaster_docs                          │
│                                                  │
│ Returns 10 chunks across all categories         │
└─────────────────────────────────────────────────┘
```

**Pros:**
- ✅✅✅ **Elegant** - Right level of detail at right time
- ✅ Context-efficient - Core docs always available
- ✅ Scales - Deep docs retrieved on-demand
- ✅ Natural UX - AI "just knows" essentials
- ✅ Flexible - AI chooses tier automatically

**Cons:**
- ⚠️ Requires thoughtful doc curation
- ⚠️ More complex server implementation
- ⚠️ Need to maintain doc hierarchy

**Best for:** Production systems with large, evolving docs (THIS IS US)

---

## Implementation Design

### 1. Core Documentation as Resources (Tier 1)

**What goes in Tier 1:**
- Quick Start Guide (1-2K words)
- API Summary (500 words - key endpoints)
- Common Workflows (1K words)
- Troubleshooting Quick Reference (500 words)

**Total: ~4K words** (well within context budget)

**Why these:**
- Used in 80% of conversations
- Foundational knowledge
- Changes infrequently
- Enables AI to self-serve common questions

**Implementation:**
```typescript
// packages/taskmaster-docs-mcp/src/resources.ts

export function loadCoreResources() {
  return [
    {
      uri: "taskmaster://docs/quickstart",
      name: "Quick Start Guide",
      description: "Essential getting started guide",
      content: fs.readFileSync("./core-docs/quickstart.md", "utf-8")
    },
    {
      uri: "taskmaster://docs/api-summary",
      name: "API Quick Reference",
      description: "Core API endpoints and schemas",
      content: generateAPISummary()
    },
    {
      uri: "taskmaster://docs/common-workflows",
      name: "Common Workflows",
      description: "Frequently used patterns",
      content: fs.readFileSync("./core-docs/workflows.md", "utf-8")
    },
    {
      uri: "taskmaster://docs/troubleshooting-quick",
      name: "Quick Troubleshooting",
      description: "Common issues and solutions",
      content: generateQuickTroubleshooting()
    }
  ];
}
```

---

### 2. Structured Prompts for Deep Dives (Tier 2)

**Prompt: `deployment_guide`**
```typescript
{
  name: "deployment_guide",
  description: "Get detailed deployment guidance",
  arguments: [
    { name: "platform", description: "replit | docker | railway | vercel" },
    { name: "question", description: "Specific deployment question" }
  ]
}

// Implementation
async function deploymentGuide(platform: string, question: string) {
  const query = `${platform} deployment ${question}`;
  const docs = await vectorDB.search(query, {
    category: "deployment",
    limit: 3
  });

  return {
    role: "user",
    content: `
      📚 TaskMaster Deployment Documentation
      Platform: ${platform}

      ${docs.map((d, i) => `
        ## ${d.section} (${d.file_path})
        ${d.content}
      `).join('\n\n---\n\n')}

      Question: ${question}

      Based on these docs, provide a complete answer with:
      1. Step-by-step guidance
      2. Code examples from docs
      3. Common pitfalls to avoid
    `
  };
}
```

**Prompt: `api_reference`**
- Get detailed API documentation for specific endpoints
- Fetches from api/ category in vector DB

**Prompt: `troubleshooting`**
- Get help with specific errors or issues
- Semantic search across troubleshooting docs

---

### 3. Search Tool for Comprehensive Queries (Tier 3)

Keep existing `search_taskmaster_docs` tool for:
- Cross-cutting searches ("find all authentication references")
- Research mode ("what are all deployment options?")
- User-initiated explicit searches

---

## MCP Server Architecture

```typescript
// packages/taskmaster-docs-mcp/src/index.ts

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { VectorDB } from "./vectordb.js";
import { loadCoreResources } from "./resources.js";

const db = new VectorDB("./data/lance");
const coreResources = loadCoreResources();

const server = new Server({
  name: "taskmaster-docs",
  version: "2.0.0"
}, {
  capabilities: {
    resources: {},  // ← Enable resources capability
    prompts: {},
    tools: {}
  }
});

// Tier 1: Resources
server.setRequestHandler("resources/list", async () => ({
  resources: coreResources.map(r => ({
    uri: r.uri,
    name: r.name,
    mimeType: "text/markdown",
    description: r.description
  }))
}));

server.setRequestHandler("resources/read", async (request) => {
  const resource = coreResources.find(r => r.uri === request.params.uri);
  return {
    contents: [{
      uri: resource.uri,
      mimeType: "text/markdown",
      text: resource.content
    }]
  };
});

// Tier 2: Prompts
server.setRequestHandler("prompts/list", async () => ({
  prompts: [
    {
      name: "deployment_guide",
      description: "Get detailed deployment guidance",
      arguments: [
        { name: "platform", required: true },
        { name: "question", required: false }
      ]
    },
    {
      name: "api_reference",
      description: "Get API documentation",
      arguments: [{ name: "endpoint", required: true }]
    },
    {
      name: "troubleshooting",
      description: "Get troubleshooting help",
      arguments: [{ name: "error", required: true }]
    }
  ]
}));

server.setRequestHandler("prompts/get", async (request) => {
  const { name, arguments: args } = request.params;

  switch (name) {
    case "deployment_guide":
      return await generateDeploymentPrompt(db, args);
    case "api_reference":
      return await generateAPIPrompt(db, args);
    case "troubleshooting":
      return await generateTroubleshootingPrompt(db, args);
  }
});

// Tier 3: Tools
server.setRequestHandler("tools/call", async (request) => {
  if (request.params.name === "search_taskmaster_docs") {
    return await searchTool(db, request.params.arguments);
  }
});
```

---

## The Philosophy: Making Documentation Feel Native

**Bad UX (Current - Tier 3 Only):**
```
User: "How do I deploy to Replit?"
AI: "Let me search the docs..."
AI: *calls search_docs tool*
AI: "According to the deployment documentation..."
```

**Good UX (Tier 2 - Prompts):**
```
User: "How do I deploy to Replit?"
AI: *invokes deployment_guide prompt naturally*
AI: "Here's how to deploy to Replit:
     1. Push code to GitHub
     2. Import to Replit
     3. Set PROJECT_ROOT environment variable

     [Feels like native knowledge]"
```

**Great UX (Tier 1 - Resources):**
```
User: "How do I deploy to Replit?"
AI: "Here's how to deploy to Replit:
     [AI already has Quick Start + Common Workflows]
     [Answers immediately without any tool/prompt call]
     [Feels like AI just 'knows' this]"
```

---

## Implementation Plan

### Phase 1: Quick Solution (Today - 30 minutes)

Use existing system-knowledge MCP:

```bash
cd /home/anombyte/Projects/in-progress/system-knowledge-vectordb

npm run index -- \
  --path=/home/anombyte/Projects/in-progress/TaskMasterWebIntegration/docs \
  --category=taskmaster \
  --type=documentation
```

**Benefit:** Immediate searchability
**Limitation:** Tier 3 only (still requires tool calls)

---

### Phase 2: Custom MCP with Resources (Next Week - 6 hours)

**Hour 1-2: Core Setup**
- Create package structure: `packages/taskmaster-docs-mcp/`
- Setup LanceDB + OpenAI embeddings
- Index all 35+ documentation files
- Generate vector embeddings

**Hour 3-4: Resources + Prompts**
- Curate core docs (4K words total)
  - Extract Quick Start from user-guide/README.md
  - Generate API Summary from api/README.md
  - Compile Common Workflows
  - Create Quick Troubleshooting reference
- Implement resources handler
- Create 3 structured prompts (deployment, api, troubleshooting)
- Test resource loading

**Hour 5-6: Integration + Testing**
- Configure in `.mcp.json`
- Test in Claude Code session
- Validate ambient knowledge (resources)
- Validate guided retrieval (prompts)
- Document usage patterns
- Create contribution guide

---

### Phase 3: Enhancements (Future)

**Smart Context Selection:**
```typescript
// Dynamically choose core docs based on session
async function selectCoreResources(sessionContext: SessionContext) {
  if (sessionContext.currentTask?.includes("deployment")) {
    return [...essentialDocs, deploymentQuickRef];
  } else if (sessionContext.currentTask?.includes("API")) {
    return [...essentialDocs, apiExtendedRef];
  }
  return essentialDocs;
}
```

**Resource Versioning:**
```typescript
{
  uri: "taskmaster://docs/api-summary?v=2025-11-13",
  metadata: {
    version: "2025-11-13",
    lastModified: "2025-11-13T10:30:00Z",
    checksum: "sha256:..."
  }
}
```

**Usage Analytics:**
```typescript
// Track which docs consulted most
logResourceAccess(uri, sessionId, timestamp);

// Optimize core docs based on patterns
// If deployment_guide invoked 50 times, promote to resources
```

---

## Success Metrics

**Tier 1 (Resources) Success:**
- 80% of common questions answered without tool calls
- AI references docs naturally in explanations
- Context budget <5K words per session

**Tier 2 (Prompts) Success:**
- Deployment questions answered in 1 prompt invocation
- API reference lookups complete in <2 seconds
- Answers include doc citations automatically

**Tier 3 (Tools) Success:**
- Cross-cutting searches return <10 relevant chunks
- Search precision >90% (relevant results)
- Fallback for edge cases Tier 1/2 can't handle

---

## Security & Governance

**Read-Only by Default:**
- Resources immutable during session
- Documentation server cannot modify code
- Separation: docs server ≠ project server

**Documentation Freshness:**
- Resources loaded at session start
- Prompts fetch latest from vector DB
- Rebuild vector DB when docs change

**Access Control:**
- Public docs: Available to all MCP clients
- Private docs: Require authentication token
- Sensitive info: Never in resources

---

## Next Steps

**Immediate (Today):**
1. Index TaskMaster docs in system-knowledge MCP
2. Test searchability
3. Validate Tier 3 functionality

**This Week:**
1. Curate core documentation (4K words)
2. Build custom MCP server with resources
3. Implement deployment_guide prompt
4. Test in real Claude Code session

**Next Week:**
1. Add api_reference and troubleshooting prompts
2. Implement usage analytics
3. Create contribution guide for updating docs
4. Consider making this Task 18 or Phase 3 enhancement

---

## The Vision

> "Documentation shouldn't be a separate step. It should be as natural as a craftsman reaching for the right tool without looking. Core knowledge always at hand (Resources). Detailed guidance a thought away (Prompts). Complete archives accessible when needed (Tools)."

**This is what makes the AI's relationship with documentation feel insanely great.**

---

**Generated by:** Claude Code (Ultrathink Mode)
**Research Phase:** Perplexity Pro (3 queries)
**Analysis Phase:** Ultrathink (Opus)
**Total Time:** ~25 minutes research + analysis
**Status:** ✅ Ready for implementation
