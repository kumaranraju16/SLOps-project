# SLOps — SLM-Native IT Operations Assistant 🚀

SLOps is an intelligent, agentic IT Operations and infrastructure administration assistant powered by LangGraph, LangChain, Groq AI (`qwen/qwen3.8-27b`), PostgreSQL 17 with `pgvector`, and a React/TypeScript/Vite frontend.

---

## 🏗️ Architecture Overview

- **Frontend**: React 18 + TypeScript + Vite + TailwindCSS
  - ChatGPT-style rich Markdown message rendering (with code blocks & 1-click copy).
  - Human-in-the-Loop approval workflows for sensitive IT commands.
  - Knowledge Base file management & RAG document chunk inspector.
  - Infrastructure Credentials Vault with live SSH connectivity testing.
- **Backend**: FastAPI + LangGraph + LangChain
  - StateGraph agent checkpointer backed by local PostgreSQL (`agent_db`).
  - Native asynchronous event loops configured for Windows environments.
  - RAG vector search powered by local PostgreSQL 17 + `pgvector`.
  - Zero-cost Groq Cloud LLM integration.
- **Database**: PostgreSQL 17 (`localhost:5432`)
  - `app_db`: Manages documents, document chunks, credentials, and conversations.
  - `agent_db`: LangGraph AsyncPostgresSaver checkpointer for resilient state persistence.

---

## ⚡ Quick Start (1-Click Run)

### Prerequisites
- Windows OS
- Node.js (v18+)
- Python (v3.12+)
- PostgreSQL 17 (with `pgvector` extension installed)

### Starting the Project
Simply double-click:
```bat
START_EVERYTHING.bat
```
This launcher automatically:
1. Starts the FastAPI backend on `http://127.0.0.1:8000`
2. Starts the Vite dev server on `http://localhost:5173`
3. Opens your default web browser to `http://localhost:5173`

### Stopping the Project
Close both terminal windows or run:
```bat
STOP_EVERYTHING.bat
```

---

## 🛠️ Manual Execution

### Backend
```powershell
cd "slops backend"
.\.venv\Scripts\python.exe run_server.py
```

### Frontend
```powershell
cd "slops frontend"
npm install
npm run dev
```

---

## 🔒 Security Note
Environment variables and sensitive API keys are kept strictly local in `.env` and are excluded from source control. Refer to `slops backend/.env.example` for required configuration variables.
