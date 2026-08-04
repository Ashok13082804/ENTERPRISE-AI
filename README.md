
./start.sh



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

bash
# Run the combined startup script from the project root
./run.sh

bash
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

