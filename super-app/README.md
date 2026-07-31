# AI Super App - One Platform for Everything

<div align="center">

![AI Super App](https://img.shields.io/badge/AI-Super%20App-6366f1?style=for-the-badge&logo=openai&logoColor=white)
![Python 3.12](https://img.shields.io/badge/Python-3.12-3776AB?style=for-the-badge&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-14-000000?style=for-the-badge&logo=next.js&logoColor=white)
![CrewAI](https://img.shields.io/badge/CrewAI-FF6B35?style=for-the-badge&logo=ai&logoColor=white)
![LangChain](https://img.shields.io/badge/LangChain-1C3C3C?style=for-the-badge&logo=langchain&logoColor=white)

A comprehensive AI-powered platform featuring 11 specialized AI agents, real-time chat, resume analysis, career planning, document generation, job search, task management, and more.

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

## 🚀 Installation

### Prerequisites

- Python 3.12+
- Node.js 18+
- npm or yarn
- Git

### Quick Start

```bash
# Clone the repository
git clone <repository-url>
cd super-app

# Backend Setup
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Set up environment
cp ../.env.example .env
# Edit .env with your API keys

# Run the backend
uvicorn app.main:app --reload --port 8000

# Frontend Setup (in another terminal)
cd ../frontend
npm install
npm run dev
```

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

### Docker Setup

```bash
# Build and run all services
docker-compose up --build

# Run in background
docker-compose up -d

# Stop all services
docker-compose down
```

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
│   │   ├── middleware/       # Rate limiting
│   │   ├── llm/             # LLM provider
│   │   ├── vectorstore/     # Vector databases
│   │   ├── auth/            # OAuth handlers
│   │   ├── utils/           # Helper functions
│   │   └── main.py          # FastAPI application
│   ├── alembic/             # Database migrations
│   ├── uploads/             # File upload directory
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
├── docker/
│   ├── Dockerfile.backend
│   ├── Dockerfile.frontend
│   ├── Dockerfile.nginx
│   ├── nginx.conf
│   └── nginx-default.conf
├── docker-compose.yml
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
| POST | `/api/v1/ai/career/salary` | Predict salary |
| POST | `/api/v1/ai/rag/query` | Query PDF documents |
| POST | `/api/v1/ai/notes` | Generate notes |
| POST | `/api/v1/ai/mindmap` | Generate mind map |
| POST | `/api/v1/ai/meeting/summarize` | Summarize meeting |
| POST | `/api/v1/ai/youtube/summarize` | Summarize YouTube |
| POST | `/api/v1/ai/ocr` | Extract text from image |
| POST | `/api/v1/ai/voice/stt` | Speech to text |
| POST | `/api/v1/ai/voice/tts` | Text to speech |

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

### Docker (Recommended)

```bash
docker-compose up -d --build
```

### Manual Deployment

```bash
# Backend
cd backend
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker -b 0.0.0.0:8000

# Frontend
cd frontend
npm run build
npm start
```

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

## 📄 License

MIT License - see LICENSE file for details.

---

## 🙏 Acknowledgments

- [CrewAI](https://crewai.com) for the multi-agent framework
- [LangChain](https://langchain.com) for LLM orchestration
- [FastAPI](https://fastapi.tiangolo.com) for the backend framework
- [Next.js](https://nextjs.org) for the frontend framework
- [Groq](https://groq.com) for high-speed inference
- [ChromaDB](https://www.trychroma.com) for vector storage

---

<div align="center">
  <strong>Built with ❤️ using Python, Next.js, CrewAI, and LangChain</strong>
</div>
