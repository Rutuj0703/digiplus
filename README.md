# DigiPlusAI - AI-Powered IT Service Desk

DigiPlusAI (formerly ResolveAI) is an intelligent, end-to-end IT Service Desk and Incident Management platform. It leverages Google Gemini's advanced generative capabilities and a robust Retrieval-Augmented Generation (RAG) pipeline to reduce ticket resolution times by providing instant categorization, historical context, and troubleshooting recommendations out of the box.

## Architecture Highlights
- **Frontend**: React, TypeScript, Vite, Tailwind CSS.
- **Backend API**: Node.js, Express, TypeScript.
- **Database**: PostgreSQL with `pgvector` for vector storage and semantic search.
- **ORM**: Prisma.
- **AI Integration**: Google Gemini API (`@google/genai` SDK) utilizing `gemini-3.5-flash` for high-speed generation and `gemini-embedding-2` for generating 768-dimensional embeddings.
- **Hybrid Search Engine**: Fuses exact keyword matches (PostgreSQL full-text search) and semantic vector similarity (pgvector cosine similarity) using **Reciprocal Rank Fusion (RRF)**.
- **Integrations**: Auto-creation of Jira tasks and linkage to GitHub Pull Requests/Actions.

---

## 🚀 How to Run the Project Locally

Follow these steps to set up the development environment, initialize the dataset, and launch the application.

### 1. Requirements
* [Node.js](https://nodejs.org/en/) (v22 or later recommended)
* [Docker Desktop](https://www.docker.com/products/docker-desktop/) (for a seamless PostgreSQL + pgvector instance)

### 2. Configure Environment Variables
In the `server` directory, create a `.env` file using the example below. (Never commit this file to version control!)

```env
# server/.env

# AI Architecture
GEMINI_API_KEY=your_gemini_api_key_here

# Database Configuration 
# (This matches the default provided in docker-compose.yml)
DATABASE_URL=postgresql://resolveai:password@127.0.0.1:5432/resolveai_db?schema=public
PORT=5000
CLIENT_URL=http://localhost:5173

# Jira Integration (Optional but recommended)
JIRA_BASE_URL=https://your-domain.atlassian.net
JIRA_EMAIL=your-email@example.com
JIRA_API_TOKEN=your_jira_api_token
JIRA_PROJECT_KEY=ASD

# GitHub Integration (Optional but recommended)
GITHUB_TOKEN=your_github_personal_access_token
GITHUB_OWNER=your_github_name
GITHUB_REPO=your_repo_name
```
*(Note: The application is resilient and will gracefully disable Jira and GitHub elements if these variables are empty.)*

### 3. Start the Vector Database
Launch the PostgreSQL engine with `pgvector` enabled via Docker Console or CLI at the root directory:
```bash
docker-compose up -d
```

### 4. Initialize Backend & Dataset
The database seeding uses a synthetically generated set of IT service tickets and categories representing a 500-person operation to give you a populated dashboard instantly.

Navigate to the `server` directory and execute the setup instructions:
```bash
cd server
npm install

# 1. Initialize DB structure and pgvector extension
node init_db.js

# 2. Generate the Prisma Client
npx prisma generate

# 3. Import historical ticket data (Categories, Agents, Incidents)
npx tsx src/seed.ts

# 4. Generate 768-d Gemini embeddings for the vector database 
#    to power the RRF hybrid search pipeline! (Requires GEMINI_API_KEY)
npx tsx src/seed_embeddings.ts
```

### 5. Start the Services
You need to run two terminal windows to host both the Backend API and Frontend application servers natively.

**Terminal 1 (Backend - Express API):**
```bash
cd server
npm run dev
```

**Terminal 2 (Frontend - React Vite Webapp):**
```bash
cd client
npm install
npm run dev
```

### 6. Explore DigiPlusAI
Navigate to `http://localhost:5173` in your browser. 

**Workflow Demo:**
1. Navigate to the **Create Incident** page.
2. Submit a real-world prompt (e.g. *Title: Production payments failing. Desc: API throwing 500 regression.*).
3. Open the newly created incident to observe Gemini **auto-categorizing** the ticket.
4. Click **Analyze with AI**. The pipeline seamlessly embeds your context, searches postgres keywords and vector footprints using **RRF**, and streams a customized resolution combining past organizational memory and general knowledge.
5. Optionally click **Create Jira** to post an integrated tracking issue.

---

## ☁️ Deployment Strategy
This project is configured natively to adapt to Vercel Deployments utilizing a unified root `vercel.json` config.
- The React GUI is published via static web builds (`@vercel/static-build`). 
- The Express API is mapped via rewrites to serverless execution endpoints using `@vercel/node` dynamically executing `server/src/index.ts`. 

Simply link the root directory to your favorite Vercel project configuration and ensure the Database + Environment Variable secrets map over.
