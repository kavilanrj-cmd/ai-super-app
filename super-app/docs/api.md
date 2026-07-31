# API Documentation

The AI Super App API is available at `http://localhost:8000/api/v1`.
Interactive docs at `http://localhost:8000/docs` (Swagger) or `http://localhost:8000/redoc` (ReDoc).

## Authentication

All endpoints except `/auth/register` and `/auth/login` require JWT authentication.

Header: `Authorization: Bearer <access_token>`

### Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/auth/register` | Register new user |
| POST | `/auth/login` | Login |
| POST | `/auth/refresh` | Refresh token |
| GET | `/auth/me` | Get current user |

## Chat

| Method | Path | Description |
|--------|------|-------------|
| POST | `/chat/` | Create chat |
| GET | `/chat/` | List chats |
| GET | `/chat/{id}/messages` | Get messages |
| POST | `/chat/{id}/message` | Send message (streaming) |
| DELETE | `/chat/{id}` | Delete chat |

## Resume

| Method | Path | Description |
|--------|------|-------------|
| POST | `/resume/analyze` | Upload & analyze resume |
| GET | `/resume/history` | Get analysis history |
| DELETE | `/resume/{id}` | Delete analysis |

## AI Features

| Method | Path | Description |
|--------|------|-------------|
| POST | `/ai/chat` | AI chat with agents |
| POST | `/ai/summarize` | Summarize text |
| POST | `/ai/translate` | Translate text |
| POST | `/ai/research` | Research topic |
| POST | `/ai/code/explain` | Explain code |
| POST | `/ai/code/fix` | Fix code bugs |
| POST | `/ai/code/generate` | Generate code |
| POST | `/ai/code/optimize` | Optimize code |
| POST | `/ai/code/review` | Review code |
| POST | `/ai/code/bug-finder` | Find bugs in code |
| POST | `/ai/career/roadmap` | Generate career roadmap |
| POST | `/ai/career/interview` | Generate interview questions |
| POST | `/ai/career/salary` | Predict salary |
| POST | `/ai/image/generate` | Generate image description |
| POST | `/ai/image/describe` | Describe image |
| POST | `/ai/image/caption` | Caption image |
| POST | `/ai/ocr` | Extract text from image |
| POST | `/ai/voice/stt` | Speech to text |
| POST | `/ai/voice/tts` | Text to speech |
| POST | `/ai/rag/query` | Query RAG document |
| POST | `/ai/rag/process` | Process document for RAG |
| POST | `/ai/youtube/summarize` | Summarize YouTube video |
| POST | `/ai/notes` | Generate AI notes |
| POST | `/ai/mindmap` | Generate mind map |
| POST | `/ai/meeting/summarize` | Summarize meeting |
| POST | `/ai/writing/generate` | Generate writing content |
| POST | `/ai/email/generate` | Generate email |
| POST | `/ai/email/improve` | Improve email |
| POST | `/ai/cover-letter/generate` | Generate cover letter |
| POST | `/ai/interview/generate` | Generate interview prep |

## Documents

| Method | Path | Description |
|--------|------|-------------|
| POST | `/documents/generate` | Generate document |
| GET | `/documents/` | List documents |
| DELETE | `/documents/{id}` | Delete document |

## Jobs

| Method | Path | Description |
|--------|------|-------------|
| GET | `/jobs/search` | Search jobs |
| GET | `/jobs/saved` | Get saved jobs |
| POST | `/jobs/{id}/save` | Save job |
| GET | `/jobs/recommendations` | Get AI recommendations |

## Tasks

| Method | Path | Description |
|--------|------|-------------|
| POST | `/tasks/` | Create task |
| GET | `/tasks/` | List tasks |
| POST | `/tasks/{id}/status` | Update task status |
| POST | `/tasks/generate-from-goal` | AI generate tasks |

## Analytics & Admin

| Method | Path | Description |
|--------|------|-------------|
| GET | `/analytics/dashboard` | User analytics |
| GET | `/analytics/admin` | Admin analytics |
| GET | `/admin/stats` | System statistics |
| GET | `/admin/users` | List all users |

## Notifications

| Method | Path | Description |
|--------|------|-------------|
| GET | `/notifications/` | List notifications |
| POST | `/notifications/{id}/read` | Mark as read |

## Users

| Method | Path | Description |
|--------|------|-------------|
| GET | `/users/` | List all users (admin) |
| GET | `/users/{id}` | Get user |
| PUT | `/users/me` | Update profile |
