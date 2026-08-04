#!/usr/bin/env bash

# ==============================================================================
# Unified Enterprise AI Platform - Combined Startup Script
# ==============================================================================

# Exit on absolute failures
set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$PROJECT_ROOT/backend"
FRONTEND_DIR="$PROJECT_ROOT/frontend"

# Colors for pretty terminal output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${BLUE}======================================================================${NC}"
echo -e "${GREEN}🚀 Starting Unified Enterprise AI Platform Startup & Setup Wizard${NC}"
echo -e "${BLUE}======================================================================${NC}"

# Cleanup handler on exit (kill background processes)
cleanup() {
  echo -e "\n${YELLOW}🛑 Shutting down servers...${NC}"
  # Terminate all jobs started by this shell session
  trap - SIGINT SIGTERM EXIT
  kill $(jobs -p) 2>/dev/null || true
  echo -e "${GREEN}✅ Clean exit.${NC}"
}
trap cleanup SIGINT SIGTERM EXIT

# ─── System Checks ────────────────────────────────────────────────────────────
echo -e "\n${CYAN}[1/4] Checking System Prerequisites...${NC}"

# Check for Node.js
if ! command -v node &> /dev/null; then
  echo -e "${RED}❌ Node.js is not installed. Please install Node.js (v18+) and try again.${NC}"
  exit 1
fi
echo -e "  - Node.js version: $(node -v)"

# Check for Python 3
if ! command -v /opt/homebrew/bin/python3.11 &> /dev/null && ! command -v python3 &> /dev/null; then
  echo -e "${RED}❌ Python 3 is not installed. Please install Python 3.11+ and try again.${NC}"
  exit 1
fi
PYTHON_BIN="/opt/homebrew/bin/python3.11"
if [ ! -f "$PYTHON_BIN" ]; then
  PYTHON_BIN="python3"
fi
echo -e "  - Python version: $($PYTHON_BIN --version)"

# ─── Backend Setup ────────────────────────────────────────────────────────────
echo -e "\n${CYAN}[2/4] Setting Up Backend Virtual Environment...${NC}"
cd "$BACKEND_DIR"

# Recreate venv if python version mismatch
if [ -d "venv" ]; then
  VENV_PYTHON_VER=$(venv/bin/python -c "import sys; print(f'{sys.version_info.major}.{sys.version_info.minor}')" 2>/dev/null || echo "")
  TARGET_PYTHON_VER=$($PYTHON_BIN -c "import sys; print(f'{sys.version_info.major}.{sys.version_info.minor}')" 2>/dev/null || echo "")
  if [ "$VENV_PYTHON_VER" != "$TARGET_PYTHON_VER" ]; then
    echo -e "  - Recreating virtual environment (version mismatch: $VENV_PYTHON_VER vs $TARGET_PYTHON_VER)..."
    rm -rf venv
  fi
fi

if [ ! -d "venv" ]; then
  echo -e "  - Creating virtual environment..."
  $PYTHON_BIN -m venv venv
fi

echo -e "  - Activating virtual environment..."
source venv/bin/activate

echo -e "  - Checking/Installing Python dependencies..."
pip install --upgrade pip --quiet
pip install -r requirements.txt --quiet
pip install greenlet "bcrypt==4.0.1" --quiet
echo -e "  - ${GREEN}Backend dependencies configured!${NC}"

# ─── Frontend Setup ───────────────────────────────────────────────────────────
echo -e "\n${CYAN}[3/4] Setting Up Frontend Environment...${NC}"
cd "$FRONTEND_DIR"

if [ ! -d "node_modules" ]; then
  echo -e "  - Node modules missing. Running npm install (this may take a minute)..."
  npm install --quiet
else
  echo -e "  - Node modules found."
fi
echo -e "  - ${GREEN}Frontend dependencies configured!${NC}"

# ─── Start Services ───────────────────────────────────────────────────────────
echo -e "\n${CYAN}[4/4] Starting Platform Services...${NC}"

# Free up ports 8000 and 3000 if they are in use
PORT_8000_PID=$(lsof -t -i :8000 2>/dev/null || true)
if [ -n "$PORT_8000_PID" ]; then
  echo -e "  - Freeing port 8000 (killing process $PORT_8000_PID)..."
  kill -9 $PORT_8000_PID 2>/dev/null || true
fi

PORT_3000_PID=$(lsof -t -i :3000 2>/dev/null || true)
if [ -n "$PORT_3000_PID" ]; then
  echo -e "  - Freeing port 3000 (killing process $PORT_3000_PID)..."
  kill -9 $PORT_3000_PID 2>/dev/null || true
fi

# Start Backend
cd "$BACKEND_DIR"
source venv/bin/activate
echo -e "${BLUE}  - Launching FastAPI backend server on http://localhost:8000...${NC}"
python -m uvicorn main:app --host 0.0.0.0 --port 8000 > "$PROJECT_ROOT/backend.log" 2>&1 &
BACKEND_PID=$!

# Wait for backend to be fully initialized and accepting requests
echo -e "  - Waiting for FastAPI backend to be ready on http://127.0.0.1:8000..."
BACKEND_READY=0
for i in {1..30}; do
  if curl -sf http://127.0.0.1:8000/health >/dev/null 2>&1; then
    BACKEND_READY=1
    break
  fi
  if ! kill -0 $BACKEND_PID 2>/dev/null; then
    echo -e "${RED}❌ Backend process exited unexpectedly. Check backend.log for details:${NC}"
    tail -n 20 "$PROJECT_ROOT/backend.log"
    exit 1
  fi
  sleep 1
done

if [ $BACKEND_READY -eq 1 ]; then
  echo -e "  - ${GREEN}FastAPI Backend Running & Ready (PID: $BACKEND_PID)${NC}"
else
  echo -e "${RED}❌ Backend timed out waiting for server to respond. Check backend.log for details:${NC}"
  tail -n 20 "$PROJECT_ROOT/backend.log"
  exit 1
fi

# Start Frontend
cd "$FRONTEND_DIR"
echo -e "${BLUE}  - Launching Vite dev server on http://localhost:3000...${NC}"
npm run dev

# Keep script running
wait
