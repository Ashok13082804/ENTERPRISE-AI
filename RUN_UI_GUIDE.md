# 🚀 Running the UI & UX Alone (Standalone Final Year Project Mode)

This guide shows you how to run the **entire frontend UI and UX alone** without starting Python, Ollama, PyTorch, Docker, or any database. All 35+ pages, AI chat simulations, interactive charts, ML algorithms, blockchain explorer, and enterprise modules operate seamlessly in **Standalone Mode**.

---

## ⚡ Quick Start (1 Command)

From the project root directory, run:

```bash
./run-ui.sh
```

*That's it!* The script will:
1. Check for Node.js.
2. Free up port 3000 if occupied.
3. Install dependencies automatically if missing.
4. Launch the UI server at `http://localhost:3000`.
5. Open your default web browser automatically.

---

## 💻 Manual Alternative Commands

If you prefer running manual commands directly:

```bash
# 1. Navigate to the frontend directory
cd frontend

# 2. Install dependencies (if not already installed)
npm install

# 3. Start the UI development server
npm run dev
```

Then open your browser at **[http://localhost:3000](http://localhost:3000)**.

---

## 🔑 1-Click Login & Demo Roles

On the login screen (`http://localhost:3000/login`), you have two instant ways to enter:

### Option A: Instant 1-Click Demo Button (Recommended for Presentations)
- Click the glowing purple button: **`✨ Instant Demo Access (Launch ADMIN UI)`**.
- You will immediately enter the platform as **Dr. Sarah Connor (Executive AI Directorate)** with full administrator privileges!

### Option B: Quick Role Selector
Click on any of the 4 demo role cards to test different user profiles:
- **Admin**: `admin@enterprise.ai` (Password: `Admin@123`)
- **Manager**: `manager@enterprise.ai` (Password: `Manager@123`)
- **Employee**: `employee@enterprise.ai` (Password: `Employee@123`)
- **Guest**: `guest@enterprise.ai` (Password: `Guest@123`)

Then click **Sign In Securely** (or click the instant demo button).

---

## 🧭 Viva & Evaluation Walkthrough Guide

Here is a recommended sequence to showcase the project to evaluators and professors:

| Sequence | Module | Path | What to Highlight |
| :--- | :--- | :--- | :--- |
| **1** | **Executive Dashboard** | `/` | Real-time KPI cards, weekly AI query area charts, local model usage distribution (Llama 3, Mistral, DeepSeek-R1), and department breakdown. |
| **2** | **AI Conversational Studio** | `/chat` | Conversational interface with markdown rendering, syntax-highlighted code blocks, prompt suggestion chips, and model switching. |
| **3** | **RAG Knowledge Base** | `/rag` & `/documents` | Offline document intelligence, vector chunk embeddings, similarity scoring, and private document Q&A without cloud egress. |
| **4** | **ML Studio & MLVerse** | `/ml` & `/mlverse` | Customer segmentation, demand forecasting, K-Means clustering with 100+ categorized machine learning problem templates. |
| **5** | **Computer Vision AI** | `/vision` | OpenCV / YOLO simulation with bounding boxes for object detection, text OCR, and facial detection. |
| **6** | **Blockchain Digital Ledger** | `/blockchain` | Verifiable block explorer, SHA-256 cryptographic hashes, and tamper-evident certificate issuance and verification. |
| **7** | **Healthcare AI** | `/healthcare` | Electronic health records (EHR), AI symptom differential diagnosis, patient appointment calendar, and drug interaction checker. |
| **8** | **Banking & Fraud AI** | `/banking` | Financial transaction fraud risk scoring, anomaly detection, and automated compliance auditing. |
| **9** | **Academic AI Verses** | `/mathverse`, `/csverse`, etc. | Interactive problem-solving assistants for Mathematics, Computer Science, Physics, and Chemistry. |
| **10** | **Smart Notes & Tasks** | `/notes`, `/tasks` | Rich note editor with AI summarization, flashcards generator, and Kanban workflow management. |

---

## ⚙️ Technical Architecture of Standalone Mode

- **Mock Simulation Engine**: Located at `frontend/src/api/mockEngine.ts`.
- **Axios Interceptor**: Automatically captures all outgoing network requests (both `/api/v1/...` and `http://localhost:8000/...`).
- **Zero Network Lag**: Requests resolve in 80ms, generating realistic micro-animations and loading states without server timeouts.
- **Fail-Safe Fallback**: Any dynamic action (creating records, deleting items, updating status) returns a valid 200 OK simulated response, preventing blank screens or unhandled errors.

---

## 🛠️ Troubleshooting

- **Port 3000 in use?**
  Run `./run-ui.sh` (it automatically frees port 3000), or run:
  ```bash
  lsof -ti :3000 | xargs kill -9
  ```
- **Node version requirement:**
  Node.js v18 or higher is recommended. Check with `node -v`.
