#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════════════
# Unified Enterprise AI Platform — Startup Script
# ═══════════════════════════════════════════════════════════════════════════════
set -e

# ── Colors ────────────────────────────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; BLUE='\033[0;34m'
YELLOW='\033[1;33m'; CYAN='\033[0;36m'; BOLD='\033[1m'; NC='\033[0m'

# ── Banner ────────────────────────────────────────────────────────────────────
echo -e "${BOLD}${BLUE}"
cat << 'BANNER'
╔═══════════════════════════════════════════════════════════════╗
║           UNIFIED ENTERPRISE AI PLATFORM  v1.0               ║
║      All-in-One Intelligent Business Suite                    ║
╚═══════════════════════════════════════════════════════════════╝
BANNER
echo -e "${NC}"

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$PROJECT_ROOT/backend"
FRONTEND_DIR="$PROJECT_ROOT/frontend"

log()  { echo -e "${GREEN}[✓]${NC} $1"; }
warn() { echo -e "${YELLOW}[⚠]${NC} $1"; }
err()  { echo -e "${RED}[✗]${NC} $1"; }
info() { echo -e "${CYAN}[→]${NC} $1"; }

# ── Check Python ──────────────────────────────────────────────────────────────
info "Checking prerequisites..."
if ! command -v /opt/homebrew/bin/python3.11 &>/dev/null && ! command -v python3 &>/dev/null; then
  err "Python 3.9+ required. Install from https://python.org"
  exit 1
fi
PYTHON_BIN="/opt/homebrew/bin/python3.11"
if [ ! -f "$PYTHON_BIN" ]; then
  PYTHON_BIN="python3"
fi
PYTHON_VER=$($PYTHON_BIN -c "import sys; print(f'{sys.version_info.major}.{sys.version_info.minor}')")
log "Python $PYTHON_VER detected"

# ── Check Node ────────────────────────────────────────────────────────────────
if ! command -v node &>/dev/null; then
  err "Node.js 18+ required. Install from https://nodejs.org"
  exit 1
fi
log "Node.js $(node --version) detected"

# ── Check/Start Ollama ────────────────────────────────────────────────────────
echo ""
echo -e "${BOLD}[AI ENGINE]${NC}"
if command -v ollama &>/dev/null; then
  log "Ollama found"
  if ! curl -sf http://localhost:11434/api/tags &>/dev/null; then
    info "Starting Ollama server..."
    nohup ollama serve > /tmp/ollama.log 2>&1 &
    sleep 3
  fi
  log "Ollama serving at http://localhost:11434"

  # Pull default model if not present
  if ! ollama list 2>/dev/null | grep -q "llama3"; then
    warn "Llama3 not found. Run: ollama pull llama3"
    info "Available offline: ollama pull mistral | phi3 | gemma"
  else
    log "Llama3 model available ✓"
  fi
else
  warn "Ollama not installed. AI features will be unavailable."
  warn "Install: curl -fsSL https://ollama.ai/install.sh | sh"
fi

# ── Backend Setup ─────────────────────────────────────────────────────────────
echo ""
echo -e "${BOLD}[BACKEND — FastAPI]${NC}"
cd "$BACKEND_DIR"

# Recreate venv if python version mismatch
if [ -d ".venv" ]; then
  VENV_PYTHON_VER=$(.venv/bin/python -c "import sys; print(f'{sys.version_info.major}.{sys.version_info.minor}')" 2>/dev/null || echo "")
  TARGET_PYTHON_VER=$($PYTHON_BIN -c "import sys; print(f'{sys.version_info.major}.{sys.version_info.minor}')" 2>/dev/null || echo "")
  if [ "$VENV_PYTHON_VER" != "$TARGET_PYTHON_VER" ]; then
    info "Recreating virtual environment (version mismatch: $VENV_PYTHON_VER vs $TARGET_PYTHON_VER)..."
    rm -rf .venv
  fi
fi

# Create venv if not exists
if [ ! -d ".venv" ]; then
  info "Creating Python virtual environment..."
  $PYTHON_BIN -m venv .venv
  log "Virtual environment created"
fi

source .venv/bin/activate

# Install / upgrade dependencies
info "Installing Python dependencies..."
pip install --upgrade pip -q
pip install -r requirements.txt -q && log "Dependencies installed"

# Create directories
mkdir -p uploads/documents uploads/images uploads/csv logs data

# Copy .env if not exists
if [ ! -f ".env" ]; then
  cp .env.example .env 2>/dev/null || true
  warn ".env file not found. Creating defaults..."
  cat > .env << 'DOTENV'
DATABASE_URL=sqlite+aiosqlite:///./data/enterprise_ai.db
SECRET_KEY=enterprise-ai-super-secret-key-change-in-production-32chars
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
REFRESH_TOKEN_EXPIRE_DAYS=30
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_DEFAULT_MODEL=llama3
CHROMA_PERSIST_DIR=./data/chroma_db
UPLOAD_DIR=./uploads
MAX_UPLOAD_SIZE_MB=50
ENVIRONMENT=development
CORS_ORIGINS=["http://localhost:3000","http://127.0.0.1:3000"]
DOTENV
  log ".env created with defaults"
fi

# Free up ports 8000 and 3000 if they are in use
info "Ensuring ports 8000 and 3000 are clear..."
PORT_8000_PID=$(lsof -t -i :8000 2>/dev/null || true)
if [ -n "$PORT_8000_PID" ]; then
  kill -9 $PORT_8000_PID 2>/dev/null || true
fi
PORT_3000_PID=$(lsof -t -i :3000 2>/dev/null || true)
if [ -n "$PORT_3000_PID" ]; then
  kill -9 $PORT_3000_PID 2>/dev/null || true
fi

# Start backend
info "Starting FastAPI backend on port 8000..."
nohup python3 -m uvicorn main:app \
  --host 0.0.0.0 \
  --port 8000 \
  --reload \
  --log-level info > /tmp/backend.log 2>&1 &
BACKEND_PID=$!
echo $BACKEND_PID > /tmp/enterprise_ai_backend.pid

# Wait for backend
for i in {1..15}; do
  if curl -sf http://localhost:8000/health &>/dev/null; then
    log "Backend running → http://localhost:8000"
    log "API Docs     → http://localhost:8000/api/docs"
    break
  fi
  sleep 1
  if [ $i -eq 15 ]; then
    err "Backend failed to start. Check /tmp/backend.log"
    cat /tmp/backend.log | tail -20
    exit 1
  fi
done

# ── Frontend Setup ────────────────────────────────────────────────────────────
echo ""
echo -e "${BOLD}[FRONTEND — React/Vite]${NC}"
cd "$FRONTEND_DIR"

if [ ! -d "node_modules" ]; then
  info "Installing Node.js dependencies (first run — may take 2-3 min)..."
  npm install --legacy-peer-deps
  log "Frontend dependencies installed"
else
  log "node_modules found"
fi

info "Starting React dev server on port 3000..."
nohup npm run dev > /tmp/frontend.log 2>&1 &
FRONTEND_PID=$!
echo $FRONTEND_PID > /tmp/enterprise_ai_frontend.pid

sleep 3

# ── Done ──────────────────────────────────────────────────────────────────────
echo ""
echo -e "${BOLD}${GREEN}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BOLD}${GREEN}║          🚀 PLATFORM IS RUNNING!                       ║${NC}"
echo -e "${BOLD}${GREEN}╠════════════════════════════════════════════════════════╣${NC}"
echo -e "${GREEN}║  🌐 Frontend     →  http://localhost:3000              ║${NC}"
echo -e "${GREEN}║  ⚡ Backend API  →  http://localhost:8000              ║${NC}"
echo -e "${GREEN}║  📚 API Docs     →  http://localhost:8000/api/docs     ║${NC}"
echo -e "${GREEN}║  🤖 Ollama       →  http://localhost:11434             ║${NC}"
echo -e "${GREEN}╠════════════════════════════════════════════════════════╣${NC}"
echo -e "${GREEN}║  DEMO CREDENTIALS:                                      ║${NC}"
echo -e "${GREEN}║    admin@enterprise.ai   / Admin@123    (Admin)        ║${NC}"
echo -e "${GREEN}║    manager@enterprise.ai / Manager@123  (Manager)      ║${NC}"
echo -e "${GREEN}║    employee@enterprise.ai/ Employee@123 (Employee)     ║${NC}"
echo -e "${GREEN}║    guest@enterprise.ai   / Guest@123    (Guest)        ║${NC}"
echo -e "${GREEN}╠════════════════════════════════════════════════════════╣${NC}"
echo -e "${YELLOW}║  📋 Logs: /tmp/backend.log  /tmp/frontend.log          ║${NC}"
echo -e "${YELLOW}║  🛑 Stop: ./stop.sh                                    ║${NC}"
echo -e "${BOLD}${GREEN}╚════════════════════════════════════════════════════════╝${NC}"

# Open browser
sleep 2
if command -v open &>/dev/null; then
  open http://localhost:3000
elif command -v xdg-open &>/dev/null; then
  xdg-open http://localhost:3000
fi

# Trap Ctrl+C
cleanup() {
  echo -e "\n${YELLOW}Shutting down...${NC}"
  kill $BACKEND_PID 2>/dev/null || true
  kill $FRONTEND_PID 2>/dev/null || true
  exit 0
}
trap cleanup INT TERM

wait
