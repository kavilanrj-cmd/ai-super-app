# AI Super App - One Platform for Everything

<div align="center">

![AI Super App](https://img.shields.io/badge/AI-Super%20App-6366f1?style=for-the-badge&logo=openai&logoColor=white)
![Python 3.12](https://img.shields.io/badge/Python-3.12-3776AB?style=for-the-badge&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-14-000000?style=for-the-badge&logo=next.js&logoColor=white)
![CrewAI](https://img.shields.io/badge/CrewAI-FF6B35?style=for-the-badge&logo=ai&logoColor=white)
![LangChain](https://img.shields.io/badge/LangChain-1C3C3C?style=for-the-badge&logo=langchain&logoColor=white)

A comprehensive AI-powered platform featuring 11 specialized AI agents, real-time chat, resume analysis, career planning, document generation, job search, task management, an **AI App Builder** that generates and runs apps from natural language on your local machine (Ollama), and more.

</div>

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        NGINX (Port 80)                      │
├────────────────────────┬────────────────────────────────────┤
│   Frontend (Next.js)   │    Backend (FastAPI)               │
│   Port 3000            │    Port 8000                       │
│                        │                                    │
│   ┌──────────────┐     │    ┌──────────────────────────┐   │
│   │  UI Components│     │    │  API Routers            │   │
│   │  (Shadcn UI)  │     │    │  - Auth, Chat, Resume   │   │
│   │  Dark Theme   │     │    │  - Jobs, Tasks, Docs,   │   │
│   │  Glassmorphism│     │    │    Analytics, Admin     │   │
│   └──────────────┘     │    └──────────────────────────┘   │
│                        │                                    │
│   ┌──────────────┐     │    ┌──────────────────────────┐   │
│   │  React Query  │     │    │  Multi-Agent System      │   │
│   │  State Mgmt   │     │    │  (CrewAI + LangChain)    │   │
│   └──────────────┘     │    └──────────────────────────┘   │
│                        │                                    │
│   ┌──────────────┐     │    ┌──────────────────────────┐   │
│   │  Framer Motion│    │    │  Services Layer          │   │
│   │  Animations   │     │    │  - Chat, Resume, Docs   │   │
│   └──────────────┘     │    │  - OCR, Voice, RAG      │   │
│                        │    └──────────────────────────┘   │
│                        │                                    │
│   ┌──────────────┐     │    ┌──────────────────────────┐   │
│   │  Axios Client │    │    │  Database (SQLAlchemy)    │   │
│   │  API Layer    │     │    │  Vector Store (ChromaDB) │   │
│   └──────────────┘     │    │  Auth (JWT + OAuth)      │   │
│                        │    └──────────────────────────┘   │
└────────────────────────┴────────────────────────────────────┘
```

---

## ✨ Features

### 1. 🤖 AI Chat Assistant
- Streaming responses with real-time output
- Conversation memory and history
- Markdown rendering with code highlighting
- File upload and image understanding
- Voice input/output support

### 2. 📄 Resume Analyzer
- PDF resume upload and parsing
- ATS (Applicant Tracking System) scoring
- Missing skills identification
- Keyword analysis and optimization suggestions

### 3. 🎯 Career Assistant
- Personalized career roadmap generation
- Interview question preparation
- Salary prediction based on role, experience, and location
- Coding challenges and skill assessments

### 4. 💼 Job Finder
- AI-powered job search and filtering
- Job saving and bookmarking
- AI-based job recommendations
- Salary range insights

### 5. 📚 AI PDF Chat (RAG)
- Upload PDFs and ask questions
- RAG (Retrieval Augmented Generation) pipeline
- Source citation for answers
- Context-aware responses

### 6. 📝 Document Generator
- Professional resume generation
- Cover letter creation
- Statement of Purpose (SOP)
- Business emails and proposals
- Detailed reports

### 7. 💻 AI Coding Assistant
- Code explanation and documentation
- Bug detection and fixes
- Code generation from prompts
- Performance optimization
- Cross-language code conversion

### 8. 🎨 AI Image Generator
- Text-to-image description generation
- Style customization

### 9. 🔍 OCR (Optical Character Recognition)
- Text extraction from images
- Multi-language support

### 10. 🎤 Speech To Text
- Audio file transcription
- Real-time speech recognition

### 11. 🔊 Text To Speech
- Text-to-audio conversion
- Multi-language support

### 12. 📓 AI Notes
- Automated note generation
- Topic research and organization

### 13. 🧠 AI Mind Map
- Visual mind map generation
- Hierarchical topic structuring

### 14. 🔬 AI Research Assistant
- Deep topic research
- Source citation
- Comprehensive analysis

### 15. ✂️ AI Summarizer
- Text summarization
- Key point extraction
- Configurable length

### 16. 🌍 AI Translator
- Multi-language translation
- Context preservation
- Cultural nuance handling

### 17. ▶️ AI YouTube Summarizer
- Video content summarization
- Key insights extraction

### 18. 📋 AI Meeting Assistant
- Meeting transcript summarization
- Action item extraction

### 19. ✅ AI Task Manager
- AI-powered task generation
- Priority management
- Status tracking
- Goal-based task breakdown

### 20. 📅 Calendar
- Event scheduling
- Meeting management

### 21. 🔔 Notifications
- Real-time notifications
- Read/unread tracking

### 22. 📊 Analytics Dashboard
- Usage statistics
- Activity tracking
- Admin analytics

### 23. 🔐 Admin Panel
- User management
- System statistics
- Role-based access control

### 24. 👤 User Profile
- Account management
- Credit tracking

### 25. ⚙️ Settings
- Theme customization
- Notification preferences
- AI model selection

### 26. 🚀 AI App Builder (Local)
- Generate a full multi-file app from a single natural-language prompt
- Iterate on a project via chat until it matches your idea
- Build / repair cycle that auto-fixes npm errors (up to `APP_BUILDER_MAX_REPAIRS` rounds)
- Live preview server per project, with start / stop / restart controls
- File explorer + editor to inspect and tweak generated source
- Download the project as a ZIP, or duplicate / rename / delete projects
- Runs **100% locally** through Ollama (`qwen3:8b` default) — no API key required

---

## 🧠 Multi-Agent System

The platform features **11 specialized AI agents** powered by CrewAI and LangChain:

| Agent | Role | Expertise |
|-------|------|-----------|
| **Resume Agent** | Resume Analysis Specialist | ATS scoring, skill extraction, improvement suggestions |
| **Career Agent** | Career Development Advisor | Roadmaps, interview prep, salary predictions |
| **Research Agent** | Research Specialist | Academic research, literature review, data synthesis |
| **Coding Agent** | Code Expert | Code analysis, debugging, generation, optimization |
| **Medical Agent** | Healthcare Advisor | Medical information, health insights |
| **Finance Agent** | Financial Analyst | Personal finance, investment insights |
| **Translator Agent** | Language Translator | Multi-language translation, localization |
| **Summarizer Agent** | Content Summarizer | Text summarization, key points extraction |
| **Document Agent** | Document Creator | Resumes, cover letters, proposals, reports |
| **Vision Agent** | Visual Analyst | Image analysis, OCR, visual content description |
| **Planning Agent** | Planning Strategist | Task breakdown, project planning |

---

## 🧰 Tech Stack

What each technology is used for in this project.

### 🔧 Backend (FastAPI)

| Technology | Used for |
|-----------|----------|
| **FastAPI + Uvicorn** | REST API framework and ASGI server |
| **SQLAlchemy 2 (async) + Alembic** | ORM, database models and migrations |
| **Pydantic v2** | Request/response schemas & validation |
| **CrewAI + LangGraph + LangChain** | Multi-agent orchestration (11 specialized agents) |
| **Groq (qwen3 models)** | Primary LLM inference — chat, agents, career tools, documents, image describe, TTS |
| **Ollama (qwen3:8b)** | Local LLM for the AI App Builder (no API key, fully offline) |
| **ChromaDB + FAISS + sentence-transformers** | Vector store & embeddings for PDF Chat / RAG |
| **pdfplumber / PyPDF2** | PDF text extraction |
| **pytesseract + Pillow** | OCR (image → text) |
| **SpeechRecognition (Google)** | Speech-to-text |
| **Groq TTS (`canopylabs/orpheus`)** | Text-to-speech with WAV repair |
| **JSearch (RapidAPI) / Adzuna / Remotive** | Job search providers (with automatic fallback) |
| **JWT (python-jose) + bcrypt** | Authentication & password hashing |
| **authlib** | OAuth (Google / GitHub) social login |
| **slowapi** | Per-IP rate limiting |
| **SQLAdmin** | Admin panel for user/system management |
| **Celery + Redis** | Background jobs & caching (optional) |
| **Supabase / AWS S3 (boto3)** | Optional file storage backends |
| **asyncpg / aiosqlite** | Async DB drivers (PostgreSQL / SQLite) |
| **SQLAlchemy JSON columns** | Storing agent outputs, job SKUs, resume skills |
| **httpx** | Async HTTP client (Ollama, job APIs, Groq TTS) |

### 🎨 Frontend (Next.js)

| Technology | Used for |
|-----------|----------|
| **Next.js 14 (App Router) + React 18 + TypeScript** | Framework, routing, typing |
| **Tailwind CSS** | Styling (custom "Thesis Hub" neon dashboard theme) |
| **TanStack React Query** | Server state, caching, mutations |
| **Zustand** | Client-side store (auth, chats, notifications) |
| **Axios** | API client with automatic JWT refresh interceptor |
| **Framer Motion** | Animations (hero, cards, stat counters) |
| **Recharts** | Analytics charts |
| **react-dropzone** | File uploads |
| **react-markdown + rehype-highlight + remark-gfm** | Rendering AI chat markdown + code blocks |
| **lucide-react / date-fns / react-hot-toast** | Icons, dates, toasts |

---

## 🚀 Installation

### Prerequisites

- Python 3.12+
- Node.js 18+
- npm or yarn
- Git
- **Ollama** (only for the AI App Builder) — install from <https://ollama.com>, then pull the builder model:
  ```powershell
  ollama pull qwen3:8b
  ```

### Quick Start (Step-by-Step)

The app has two parts, each run in its own terminal: the **backend** (FastAPI
+ Python) and the **frontend** (Next.js). **Start the backend first.**

#### Backend — Terminal 1 (PowerShell)

```powershell
# 1. Navigate to the backend
cd "super-app/backend"

# 2. Activate the Python environment
venv\Scripts\Activate.ps1

# 3. Install dependencies (first time only)
pip install -r requirements.txt

# 4. Create the env config file (first time only)
Copy-Item ../.env.example .env
```

Open `.env` and set at least:

```env
DEBUG=True
DATABASE_URL=sqlite+aiosqlite:///./super_app.db   # SQLite for quick local start
SECRET_KEY=<a-long-random-string>
GROQ_API_KEY=<your-key>    # or OPENAI_API_KEY=sk-...
```

Optional — the **AI App Builder** runs on the local Ollama model you pulled above
(no key needed). Leave these defaults if using `qwen3:8b` at `localhost:11434`:

```env
APP_BUILDER_PROVIDER=ollama
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=qwen3:8b
```

If you did **not** install Ollama and want the App Builder to fall back to Groq
instead, add `APP_BUILDER_GROQ_FALLBACK=true`.

Then run migrations and start the server:

```powershell
# 5. Run database migrations
alembic upgrade head

# 6. Start the backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Backend runs at `http://localhost:8000` (API docs at `http://localhost:8000/docs`).
It seeds an admin account on first startup using `ADMIN_EMAIL` / `ADMIN_PASSWORD`
from `.env`.

#### Frontend — Terminal 2 (PowerShell)

```powershell
# 7. Navigate to the frontend
cd "super-app/frontend"

# 8. Install frontend dependencies (first time only)
npm install

# 9. Start the frontend dev server
npm run dev
```

Frontend runs at `http://localhost:3000`. Its `.env.local` already points the API
at `http://localhost:8000/api/v1`. If that port is taken, run:

```powershell
npm run dev -- -p 3001
```

#### Use the app

Open `http://localhost:3000` and log in with the seeded admin
(`ADMIN_EMAIL` / `ADMIN_PASSWORD` from your `.env`).

> **Tip:** Keep Terminal 1 (backend) running while Terminal 2 (frontend) is running.

### Environment Variables

Copy `.env.example` to `.env` and configure:

```env
# Required: At least one AI provider
GROQ_API_KEY=gsk_your_key_here
# or
OPENAI_API_KEY=sk_your_key_here

# Database (default: SQLite)
DATABASE_URL=sqlite+aiosqlite:///./super_app.db

# Security
SECRET_KEY=your-random-secret-key
```

### Deploy with Buildpacks (Northflank)

The backend is deployed as a standard Python buildpack service — Docker is
not required.

1. Create a new service in Northflank from this repository.
2. Set **Build type** to **Buildpack** and **Build context** to `backend`.
3. Use a buildpack stack that supports the included `Aptfile`
   (e.g. `paketobuildpacks/builder-jammy-full:latest`, or the Heroku Python
   buildpack with the `heroku-community/apt` buildpack added). The `Aptfile`
   installs the runtime system packages: `tesseract-ocr` (OCR) and `ffmpeg`
   (speech-to-text audio decoding).
4. The start command is read from the `Procfile`:
   `uvicorn app.main:app --host 0.0.0.0 --port $PORT`.
5. Set the required environment variables listed in the
   [Environment Variables](#environment-variables) section. `PORT` is provided
   automatically by Northflank.
6. Health check: `GET /health`.

---

## 📁 Project Structure

```
super-app/
├── backend/
│   ├── app/
│   │   ├── api/v1/           # API endpoints
│   │   │   ├── auth.py       # Authentication routes
│   │   │   ├── chat.py       # Chat routes
│   │   │   ├── resume.py     # Resume analysis routes
│   │   │   ├── documents.py  # Document generation routes
│   │   │   ├── jobs.py       # Job search routes
│   │   │   ├── tasks.py      # Task management routes
│   │   │   ├── app_builder.py# AI App Builder routes
│   │   │   ├── ai.py         # AI feature routes
│   │   │   ├── analytics.py  # Analytics routes
│   │   │   ├── admin.py      # Admin routes
│   │   │   └── upload.py     # File upload routes
│   │   ├── agents/           # Multi-agent system
│   │   │   ├── base_agent.py # Base agent class
│   │   │   ├── agents.py     # Agent definitions
│   │   │   └── coordinator.py# Agent coordinator
│   │   ├── core/             # Core configuration
│   │   │   ├── config.py     # App settings
│   │   │   ├── database.py   # Database setup
│   │   │   └── security.py   # Auth utilities
│   │   ├── models/           # SQLAlchemy models
│   │   ├── schemas/          # Pydantic schemas
│   │   ├── services/         # Business logic
│   │   │   └── app_builder_service.py  # App generation/build/preview engine
│   │   ├── middleware/       # Rate limiting
│   │   ├── llm/             # LLM provider
│   │   ├── vectorstore/     # Vector databases
│   │   ├── auth/            # OAuth handlers
│   │   ├── utils/           # Helper functions
│   │   └── main.py          # FastAPI application
│   ├── docker/             # Docker files (local development only)
│   │   ├── Dockerfile.backend
│   │   ├── Dockerfile.frontend
│   │   ├── Dockerfile.nginx
│   │   ├── nginx.conf
│   │   └── nginx-default.conf
│   ├── alembic/             # Database migrations
│   ├── uploads/             # File upload directory
│   ├── Aptfile              # System packages for buildpacks (tesseract, ffmpeg)
│   ├── Procfile             # Buildpack start command (uvicorn --port $PORT)
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── app/             # Next.js pages
│   │   │   ├── login/       # Login page
│   │   │   └── (dashboard)/ # Main app layout
│   │   │       ├── dashboard/  # Overview page
│   │   │       ├── chat/       # AI chat
│   │   │       ├── resume/     # Resume analyzer
│   │   │       ├── career/     # Career tools
│   │   │       ├── documents/  # Document generator
│   │   │       ├── jobs/       # Job finder
│   │   │       ├── tasks/      # Task manager
│   │   │       ├── analytics/  # Dashboard
│   │   │       ├── admin/      # Admin panel
│   │   │       ├── profile/    # User profile
│   │   │       └── settings/   # Settings
│   │   ├── components/      # UI components
│   │   │   ├── Sidebar.tsx  # Navigation sidebar
│   │   │   └── ui/          # Reusable components
│   │   ├── lib/             # Utilities
│   │   │   ├── api.ts       # API client
│   │   │   ├── hooks.ts     # React hooks
│   │   │   ├── store.ts     # Zustand store
│   │   │   └── utils.ts     # Helper functions
│   │   ├── types/           # TypeScript types
│   │   └── styles/          # Global styles
│   ├── package.json
│   └── next.config.js
├── docker-compose.yml       # Local development only
├── .env.example
└── README.md
```

---

## 📡 API Documentation

The API is available at `http://localhost:8000/docs` (Swagger UI) or `http://localhost:8000/redoc` (ReDoc).

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/register` | Register new user |
| POST | `/api/v1/auth/login` | Login |
| POST | `/api/v1/auth/refresh` | Refresh token |
| GET | `/api/v1/auth/me` | Get current user |

### Chat

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/chat/` | Create chat |
| GET | `/api/v1/chat/` | List user chats |
| GET | `/api/v1/chat/{id}/messages` | Get chat messages |
| POST | `/api/v1/chat/{id}/message` | Send message (streaming) |
| DELETE | `/api/v1/chat/{id}` | Delete chat |

### Resume

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/resume/analyze` | Upload & analyze resume |
| GET | `/api/v1/resume/history` | Get analysis history |
| DELETE | `/api/v1/resume/{id}` | Delete analysis |

### AI Features

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/ai/chat` | AI chat with agents |
| POST | `/api/v1/ai/summarize` | Summarize text |
| POST | `/api/v1/ai/translate` | Translate text |
| POST | `/api/v1/ai/research` | Research topic |
| POST | `/api/v1/ai/code/explain` | Explain code |
| POST | `/api/v1/ai/code/fix` | Fix code bugs |
| POST | `/api/v1/ai/code/generate` | Generate code |
| POST | `/api/v1/ai/code/optimize` | Optimize code |
| POST | `/api/v1/ai/career/roadmap` | Generate career roadmap |
| POST | `/api/v1/ai/career/interview` | Generate interview questions |
| POST | `/api/v1/ai/career/challenge` | Generate coding challenge |
| POST | `/api/v1/ai/career/salary` | Predict salary |
| POST | `/api/v1/ai/rag/query` | Query PDF documents |
| POST | `/api/v1/ai/notes` | Generate notes |
| POST | `/api/v1/ai/mindmap` | Generate mind map |
| POST | `/api/v1/ai/meeting/summarize` | Summarize meeting |
| POST | `/api/v1/ai/youtube/summarize` | Summarize YouTube |
| POST | `/api/v1/ai/ocr` | Extract text from image |
| POST | `/api/v1/ai/voice/stt` | Speech to text |
| POST | `/api/v1/ai/voice/tts` | Text to speech |

### AI App Builder

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/app-builder/status` | Ollama/provider status |
| GET | `/api/v1/app-builder/projects` | List user projects |
| POST | `/api/v1/app-builder/generate` | Generate an app from a prompt |
| POST | `/api/v1/app-builder/{id}/iterate` | Refine a project via chat |
| POST | `/api/v1/app-builder/{id}/build` | Install deps & build the app |
| GET | `/api/v1/app-builder/{id}/files` | List generated files |
| GET | `/api/v1/app-builder/{id}/file?path=` | Read a file |
| GET | `/api/v1/app-builder/{id}/download` | Download project as ZIP |
| POST | `/api/v1/app-builder/{id}/preview/start` | Start live preview server |
| POST | `/api/v1/app-builder/{id}/preview/stop` | Stop preview server |
| POST | `/api/v1/app-builder/{id}/preview/restart` | Restart preview server |
| POST | `/api/v1/app-builder/{id}/rename` | Rename project |
| POST | `/api/v1/app-builder/{id}/duplicate` | Duplicate project |
| POST | `/api/v1/app-builder/{id}/repair` | Auto-fix build errors |
| DELETE | `/api/v1/app-builder/{id}` | Delete project |

### Documents

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/documents/generate` | Generate document |
| GET | `/api/v1/documents/` | List documents |
| DELETE | `/api/v1/documents/{id}` | Delete document |

### Jobs

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/jobs/search` | Search jobs |
| GET | `/api/v1/jobs/saved` | Get saved jobs |
| POST | `/api/v1/jobs/{id}/save` | Save job |
| GET | `/api/v1/jobs/recommendations` | Get AI recommendations |

### Tasks

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/tasks/` | Create task |
| GET | `/api/v1/tasks/` | List tasks |
| POST | `/api/v1/tasks/{id}/status` | Update task status |
| POST | `/api/v1/tasks/generate-from-goal` | AI generate tasks |

### Analytics & Admin

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/analytics/dashboard` | User analytics |
| GET | `/api/v1/analytics/admin` | Admin analytics |
| GET | `/api/v1/admin/stats` | System statistics |
| GET | `/api/v1/admin/users` | List all users |

---

## 🛡️ Security

- **JWT Authentication** - Token-based authentication with access/refresh tokens
- **Password Hashing** - bcrypt password hashing
- **CORS** - Cross-Origin Resource Security
- **Rate Limiting** - Request rate limiting per IP
- **Input Validation** - Pydantic schema validation
- **Role-Based Access** - User/Admin/Premium roles

---

## 🚢 Deployment

### Buildpack (Northflank)

The backend deploys as a standard Python buildpack service — Docker is not
required for deployment.

```bash
# Northflank settings
#   Build type:   Buildpack
#   Build context: backend
#   Stack:        paketobuildpacks/builder-jammy-full:latest
#                 (or Heroku Python buildpack + heroku-community/apt)

# Aptfile installs the runtime system packages (tesseract-ocr, ffmpeg)
# Procfile provides the production start command:
#   web: uvicorn app.main:app --host 0.0.0.0 --port $PORT

# Local equivalent of the production start command
cd backend
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

Set the required environment variables (see [Environment Variables](#environment-variables)
above) in the Northflank service. `PORT` is set automatically by the platform.

### Production Checklist

1. Change `SECRET_KEY` to a strong random value
2. Use PostgreSQL instead of SQLite
3. Set `DEBUG=False`
4. Configure CORS origins properly
5. Set up proper SSL/TLS
6. Use environment variables for all secrets
7. Set up monitoring and logging

---

## 🖼️ Screenshots

> Dashboard Overview
> AI Chat Interface
> Resume Analyzer
> Career Tools
> Document Generator
> Job Finder
> Task Manager
> Admin Panel

---

## 🧪 Running Tests

```bash
# Backend tests
cd backend
pytest

# Frontend lint
cd frontend
npm run lint
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 🙏 Acknowledgments

- [CrewAI](https://crewai.com) for the multi-agent framework
- [LangChain](https://langchain.com) for LLM orchestration
- [FastAPI](https://fastapi.tiangolo.com) for the backend framework
- [Next.js](https://nextjs.org) for the frontend framework
- [Groq](https://groq.com) for high-speed inference
- [ChromaDB](https://www.trychroma.com) for vector storage
- [Ollama](https://ollama.com) for local, key-free inference (AI App Builder)

--
