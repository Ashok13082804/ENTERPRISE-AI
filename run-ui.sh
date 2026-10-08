#!/usr/bin/env bash

# ==============================================================================
# Unified Enterprise AI Platform - Standalone UI/UX Demonstration Runner
# ==============================================================================
# This script starts the complete UI and UX alone (zero backend required).
# Perfect for Final Year Project vivas, presentations, evaluations, and demos.
# ==============================================================================

set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FRONTEND_DIR="$PROJECT_ROOT/frontend"

# Colors for terminal styling
CYAN='\033[0;36m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
PURPLE='\033[0;35m'
BOLD='\033[1m'
NC='\033[0m' # No Color

clear 2>/dev/null || true

echo -e "${PURPLE}======================================================================${NC}"
echo -e "${BOLD}${CYAN}   🚀 UNIFIED ENTERPRISE AI PLATFORM - STANDALONE UI/UX RUNNER       ${NC}"
echo -e "${PURPLE}======================================================================${NC}"
echo -e "${YELLOW}⭐ Mode: 100% Standalone UI/UX Demonstration (Offline Simulation Active)${NC}"
echo -e "${BLUE}ℹ️  No Python backend, Ollama server, Docker, or Database required!${NC}"
echo -e "${PURPLE}----------------------------------------------------------------------${NC}"

# Check for Node.js
if ! command -v node &> /dev/null; then
  echo -e "\n${YELLOW}❌ Node.js is not installed.${NC}"
  echo -e "Please install Node.js (v18 or higher) from https://nodejs.org and re-run this script."
  exit 1
fi

echo -e "  ${GREEN}✓${NC} Node.js detected: $(node -v)"
echo -e "  ${GREEN}✓${NC} NPM detected:     v$(npm -v)"

# Check and free port 3000 if occupied
echo -e "\n${CYAN}🔍 Checking Port 3000...${NC}"
PORT_PID=$(lsof -ti :3000 2>/dev/null || true)
if [ -n "$PORT_PID" ]; then
  echo -e "  ${YELLOW}⚠️  Port 3000 is currently occupied by process ${PORT_PID}. Freeing port...${NC}"
  kill -9 $PORT_PID 2>/dev/null || true
  sleep 1
  echo -e "  ${GREEN}✓${NC} Port 3000 freed successfully."
else
  echo -e "  ${GREEN}✓${NC} Port 3000 is available."
fi

# Change to frontend directory
cd "$FRONTEND_DIR"

# Install node dependencies if not present
if [ ! -d "node_modules" ]; then
  echo -e "\n${CYAN}📦 Installing frontend dependencies (one-time setup)...${NC}"
  npm install
  echo -e "  ${GREEN}✓${NC} Dependencies installed successfully."
fi

# Banner with quick presentation instructions
echo -e "\n${PURPLE}======================================================================${NC}"
echo -e "${BOLD}${GREEN}✅ READY FOR FINAL YEAR PROJECT PRESENTATION!${NC}"
echo -e "${PURPLE}======================================================================${NC}"
echo -e "${BOLD}🌐 Frontend URL:${NC}    ${CYAN}http://localhost:3000${NC}"
echo -e "${BOLD}🔑 1-Click Roles:${NC}    ${YELLOW}Admin · Manager · Employee · Guest${NC}"
echo -e "${BOLD}⚡ Instant Access:${NC}  Click '${PURPLE}Instant Demo Access${NC}' on the login screen!"
echo -e "${PURPLE}----------------------------------------------------------------------${NC}"
echo -e "${BLUE}Features Demonstrated:${NC}"
echo -e "  • Executive Dashboard (KPIs, Area Charts, Department Distribution)"
echo -e "  • AI Conversational Chat & Prompt Engineering"
echo -e "  • Offline RAG Knowledge Base & Document Intelligence"
echo -e "  • ML Studio (Clustering, Segmentation, Sales Forecasting, 100+ Problems)"
echo -e "  • Computer Vision AI (YOLO Object Detection, OCR, Face Scan)"
echo -e "  • Blockchain Digital Ledger & SHA-256 Certificate Verifier"
echo -e "  • Enterprise Modules (Healthcare, Banking, Smart City, Legal, etc.)"
echo -e "  • Academic AI Verses (MathVerse, CSVerse, PhysicsVerse, ChemVerse, etc.)"
echo -e "  • Smart Notes, Kanban Task Board & Security Logs"
echo -e "${PURPLE}======================================================================${NC}"
echo -e "Press ${YELLOW}Ctrl + C${NC} anytime to stop the server.\n"

# Open browser automatically after a short delay in the background
(
  sleep 2
  if command -v open &> /dev/null; then
    open "http://localhost:3000"
  elif command -v xdg-open &> /dev/null; then
    xdg-open "http://localhost:3000"
  fi
) &

# Start Vite dev server
npm run dev:ui
