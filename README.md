# 🚀 Unified Enterprise AI Platform

> **All-in-One Intelligent Business Suite** — 100% Offline, Local AI, Production-Ready

[![FastAPI](https://img.shields.io/badge/FastAPI-0.111-green)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18.3-blue)](https://react.dev)
[![Ollama](https://img.shields.io/badge/Ollama-Local_AI-purple)](https://ollama.ai)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)

---

## ✨ Platform Overview

This is a **Final Year Project** showcasing enterprise-grade software architecture combining:

| Domain | Technologies |
|--------|-------------|
| **AI / LLM** | Ollama (Llama3, Mistral, Phi-3, Gemma, DeepSeek) |
| **RAG** | ChromaDB + LangChain + local embeddings |
| **Machine Learning** | scikit-learn, XGBoost, statsmodels |
| **Computer Vision** | OpenCV, EasyOCR, Tesseract |
| **NLP Suite** | LLM-powered writing, translation, sentiment |
| **Blockchain** | Local PoW blockchain with certificates |
| **Backend** | FastAPI, SQLAlchemy, SQLite, JWT, bcrypt |
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, Framer Motion |
| **Security** | AES-256, JWT, Rate Limiting, RBAC, Audit Logs |
| **DevOps** | Docker, Docker Compose, shell scripts |

---

## 🏗️ Architecture

```
FInal_Year/
├── backend/                    # FastAPI Python Backend
│   ├── main.py                 # App factory, lifespan, routes
│   ├── requirements.txt        # 50+ production dependencies
│   └── app/
│       ├── core/               # Config, DB, Security
│       ├── models/             # SQLAlchemy ORM models
│       ├── api/routes/         # 16 API route modules
│       ├── ai/                 # Ollama client, RAG, Writing
│       ├── middleware/         # Security headers, logging, rate limit
│       ├── repositories/       # Data access layer
│       └── utils/              # Seeder, helpers
├── frontend/                   # React + Vite Frontend
│   ├── src/
│   │   ├── pages/              # 15 enterprise pages
│   │   ├── components/         # Layout, shared components
│   │   ├── api/                # Axios client with all endpoints
│   │   └── store/              # Zustand auth state
│   └── index.html
├── start.sh                    # 🚀 One-command launcher
├── stop.sh                     # 🛑 Graceful shutdown
└── docker-compose.yml          # Production deployment
```

---

## ⚡ Quick Start (One Command)

```bash
# Clone and start
cd FInal_Year
./start.sh
```

The script automatically:
1. ✅ Checks Python 3.9+ and Node.js 18+
2. ✅ Creates Python virtual environment
3. ✅ Installs all backend dependencies
4. ✅ Initializes SQLite database + seeds demo data
5. ✅ Installs frontend npm packages
6. ✅ Starts Ollama (if installed)
7. ✅ Launches FastAPI on port 8000
8. ✅ Launches React on port 3000
9. ✅ Opens browser automatically

---

## 🔑 Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| **Admin** | admin@enterprise.ai | Admin@123 |
| **Manager** | manager@enterprise.ai | Manager@123 |
| **Employee** | employee@enterprise.ai | Employee@123 |
| **Guest** | guest@enterprise.ai | Guest@123 |

---

## 🤖 AI Setup (Ollama)

```bash
# Install Ollama
curl -fsSL https://ollama.ai/install.sh | sh

# Pull models (any of these)
ollama pull llama3       # Best quality
ollama pull mistral      # Fast, good quality
ollama pull phi3         # Lightweight
ollama pull gemma        # Google's model
ollama pull deepseek-r1  # Reasoning model

# Start Ollama server
ollama serve
```

---

## 📡 API Endpoints

| Module | Prefix | Endpoints |
|--------|--------|-----------|
| Authentication | `/api/v1/auth` | login, register, refresh, logout |
| AI Chat | `/api/v1/chat` | sessions, messages, stream, models |
| RAG Knowledge | `/api/v1/rag` | upload, query, collections |
| Documents | `/api/v1/documents` | upload, list, download, delete |
| Analytics | `/api/v1/analytics` | dashboard, AI usage, ML performance |
| Machine Learning | `/api/v1/ml` | segmentation, forecast, anomaly |
| Vision AI | `/api/v1/vision` | OCR, face detect, object detect, QR |
| Blockchain | `/api/v1/blockchain` | chain, certificates, verify |
| NLP Suite | `/api/v1/nlp` | email, summary, code, SQL, translate |
| Projects | `/api/v1/projects` | CRUD, status management |
| Tasks | `/api/v1/tasks` | CRUD, Kanban board |
| Notifications | `/api/v1/notifications` | list, mark read, create |
| Search | `/api/v1/search` | global search |
| Users | `/api/v1/users` | profile, list, login history |

**Interactive Docs:** http://localhost:8000/docs  
**ReDoc:** http://localhost:8000/redoc

---

## 🖥️ Platform Pages

| Page | Path | Description |
|------|------|-------------|
| 🏠 Dashboard | `/` | KPI cards, charts, analytics |
| 💬 AI Chat | `/chat` | Multi-session LLM chat with RAG mode |
| 📚 RAG Knowledge | `/rag` | Document upload + semantic Q&A |
| 📄 Documents | `/documents` | File management with integrity hash |
| 📊 Analytics | `/analytics` | Real-time charts & business intelligence |
| 🧠 ML Studio | `/ml` | Customer segmentation, forecasting |
| 👁️ Vision AI | `/vision` | OCR, face detect, QR, classify |
| ⛓️ Blockchain | `/blockchain` | Chain viewer, certificates, verify |
| ✍️ NLP Suite | `/nlp` | Email, summary, code, SQL, translate |
| 📁 Projects | `/projects` | Project management with status |
| ✅ Tasks | `/tasks` | Kanban board |
| 👥 Users | `/users` | User management table |
| 🔐 Security | `/security` | Security status dashboard |
| 🔔 Notifications | `/notifications` | Notification center |
| ⚙️ Settings | `/settings` | Profile, appearance, preferences |

## ⚡ Quick Start (Setup & Run Everything)

You can set up dependencies, environment, and start both the frontend and backend servers concurrently using the single root startup script:

```bash
# Run the combined startup script from the project root
./run.sh
```

- **Frontend Interface**: [http://localhost:3000](http://localhost:3000)
- **Backend API Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)

---

## 🐳 Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose up --build -d

# Frontend:  http://localhost:80
# Backend:   http://localhost:8000
```

---

## 🔐 Security Features

- **JWT Authentication** — HS256 signed access tokens (24h) + refresh tokens (30d)
- **bcrypt Password Hashing** — 12 rounds
- **AES-256 Encryption** — Fernet symmetric encryption for sensitive data
- **RBAC** — Role-Based Access Control (admin > manager > employee > guest)
- **Account Lockout** — 5 failed attempts → 30 min lock
- **Rate Limiting** — 100 req/min per IP
- **Security Headers** — X-XSS-Protection, X-Frame-Options, CSP, HSTS
- **Audit Logging** — All actions recorded with IP, timestamp, user
- **Input Validation** — Pydantic v2 strict validation on all endpoints

---

## 🛠️ Development

```bash
# Backend only
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000

# Frontend only
cd frontend
npm install
npm run dev

# Tests (backend)
cd backend
pytest tests/ -v

# Build frontend
cd frontend
npm run build
```

---

## 📦 Key Technologies

### Backend
- **FastAPI** 0.111 — async REST API framework
- **SQLAlchemy** 2.0 — async ORM with SQLite
- **ChromaDB** — local vector database for RAG
- **LangChain** — LLM orchestration
- **scikit-learn** — ML models
- **OpenCV** — computer vision
- **EasyOCR** — optical character recognition
- **Loguru** — structured logging

### Frontend
- **React 18** — UI framework
- **TypeScript** — type safety
- **Vite** — build tool
- **Tailwind CSS** — utility CSS
- **Framer Motion** — animations
- **TanStack Query** — server state management
- **Zustand** — client state management
- **Recharts** — data visualization
- **React Dropzone** — file upload

---

## 📊 Database Schema

```
users           → auth, profile, RBAC
documents       → uploaded files with text/hash
chat_sessions   → LLM conversation threads
chat_messages   → individual messages
projects        → enterprise projects
tasks           → Kanban tasks
notifications   → system notifications
analytics_events → event tracking
audit_logs      → security audit trail
blockchain_records → immutable ledger
```

---

## 🎓 Final Year Project — Key Achievements

| Criterion | Implementation |
|-----------|----------------|
| AI/ML | 6+ models: LLM, K-Means, GBM, Isolation Forest |
| NLP | 9 writing tools powered by local LLMs |
| Computer Vision | OCR, Face, Object, QR detection |
| RAG | Upload → Chunk → Embed → Retrieve → Generate |
| Blockchain | Local PoW with certificate issuance |
| Security | JWT + AES + bcrypt + RBAC + audit |
| Architecture | MVC + Repository + Middleware patterns |
| UI/UX | Glassmorphism + animations + dark theme |
| DevOps | Docker + Docker Compose + shell scripts |
| Offline | 100% local — zero cloud API dependencies |

---

*Built with ❤️ as a Final Year Project — Powered entirely by local AI*
