# 🌐 Netlify Deployment Guide — Enterprise AI Platform

This guide explains how to host the **Enterprise AI Platform** on **Netlify**.

The project is fully pre-configured for Netlify with:
- **`netlify.toml`** (Both root and `frontend/` directory)
- **`public/_redirects`** (Ensures React Router client-side routes like `/chat`, `/rag`, `/ml` work on refresh without 404 errors)
- **Standalone Interactive Mode** (All 35+ modules, AI simulations, demo roles, charts, and games function 100% in the cloud without requiring a local Python server)
- **Optional Live Backend Integration** (Easily connect to a hosted FastAPI instance via environment variables)

---

## 🚀 Method 1: Deploy with Netlify + GitHub (Recommended)

This is the standard continuous deployment method:

1. **Push your code to GitHub / GitLab / Bitbucket**:
   ```bash
   git add .
   git commit -m "Configure Netlify deployment"
   git push origin main
   ```

2. **Log into Netlify**:
   - Go to [https://app.netlify.com](https://app.netlify.com).
   - Click **"Add new site"** → **"Import an existing project"**.
   - Choose **GitHub** and select your repository.

3. **Configure Build Settings** (Netlify will auto-detect these from `netlify.toml`):
   - **Base directory**: `frontend` (or leave empty if using root `netlify.toml`)
   - **Build command**: `npm run build`
   - **Publish directory**: `frontend/dist` (or `dist` if base is `frontend`)

4. Click **Deploy Site**.
   Netlify will build your site in ~30 seconds and provide a live URL (e.g., `https://your-app.netlify.app`).

---

## ⚡ Method 2: Instant 1-Minute Drag & Drop (Netlify Drop)

You can deploy the pre-built files instantly without Git or command line:

1. Build the production bundle locally:
   ```bash
   cd frontend
   npm run build
   ```

2. Open [https://app.netlify.com/drop](https://app.netlify.com/drop) in your browser.
3. Drag and drop the **`frontend/dist`** folder into the Netlify upload zone.
4. Your site is live immediately!

---

## 💻 Method 3: Deploy via Netlify CLI

If you prefer deploying directly from your terminal:

1. **Build the frontend**:
   ```bash
   cd frontend
   npm run build
   ```

2. **Run Netlify deploy**:
   ```bash
   # Log in to your Netlify account (one-time)
   npx netlify login

   # Deploy to production
   npm run deploy:netlify
   # (or: npx netlify deploy --prod --dir=dist)
   ```

---

## ⚙️ Environment Variables (Optional)

In your Netlify Dashboard (**Site configuration** → **Environment variables**):

| Variable | Description | Default |
| :--- | :--- | :--- |
| `VITE_API_URL` | Live backend API URL (e.g. `https://my-backend.onrender.com/api/v1`). If empty, the app runs in **Standalone Interactive Demo Mode**. | `/api/v1` |
| `VITE_DEFAULT_THEME` | Default UI theme (`dark` or `light`). | `dark` |

---

## 🛡️ How Standalone Demo Mode Works on Netlify

When hosted statically on Netlify without an external Python server:
1. **Instant 1-Click Login**: Evaluators and professors can click the glowing **"✨ Instant Demo Access (Launch ADMIN UI)"** button or choose any role (Admin, Manager, Employee, Guest) to immediately enter with full privileges.
2. **Interactive Mock Engine**: Every module (RAG search, ML problem templates, computer vision bounding boxes, blockchain explorer, smart notes, chat models) resolves realistic mock responses with authentic micro-delays.
3. **No 404 on Refresh**: The `_redirects` rule (`/* /index.html 200`) ensures that navigating or refreshing deep URLs (e.g., `/blockchain`, `/mlverse`) routes directly through the single-page application router.
