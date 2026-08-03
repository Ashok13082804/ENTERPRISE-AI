#!/usr/bin/env bash
echo "Stopping Enterprise AI Platform..."
[ -f /tmp/enterprise_ai_backend.pid ]  && kill $(cat /tmp/enterprise_ai_backend.pid)  2>/dev/null && echo "[✓] Backend stopped"
[ -f /tmp/enterprise_ai_frontend.pid ] && kill $(cat /tmp/enterprise_ai_frontend.pid) 2>/dev/null && echo "[✓] Frontend stopped"
pkill -f "uvicorn main:app" 2>/dev/null || true
pkill -f "vite" 2>/dev/null || true
echo "[✓] All services stopped"
