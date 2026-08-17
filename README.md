# AI SQL Analyst - AI-Powered Database Analytics Application

AI SQL Analyst is an AI-powered database analytics application that lets users ask questions about relational databases in natural language, safely generates and executes SQL SELECT queries, explains raw dataset findings in business language, and renders dynamic visualizations.

---

## 🎨 Theme & Aesthetic
Styled in an elegant **Warm Linen Beige & Chestnut/Espresso Brown** color palette.

---

## 🌐 Netlify Deployment Guide (Step-by-Step)

### Option 1: Automatic Deployment via GitHub & Netlify Dashboard (Recommended)

1. **Push your code to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit of AI SQL Analyst"
   git push origin main
   ```

2. **Connect to Netlify**:
   - Log in to your [Netlify Dashboard](https://app.netlify.com).
   - Click **Add new site** ➔ **Import an existing project**.
   - Select **GitHub** and pick the `ai-sql-analyst` repository.

3. **Verify Build Settings** (Netlify will auto-detect from `netlify.toml`):
   - **Base directory**: `frontend`
   - **Build command**: `npm install && npm run build`
   - **Publish directory**: `frontend/dist`

4. Click **Deploy Site**!

---

### Option 2: Netlify CLI Deployment (Direct Command Line)

From the `frontend` directory:

```bash
cd frontend
npm run build
npx netlify deploy --prod --dir=dist
```

---

## ⚡ Additional Deployment Options

### Docker & Docker Compose
```bash
docker-compose up -d --build
```
- **Frontend App**: `http://localhost/` (Port 80)
- **Backend API**: `http://localhost:8000`

### Render.com Blueprint
Push repo with `render.yaml` to deploy Python FastAPI backend & React frontend automatically.

---

## 🔒 Security Guardrails
- Enforces strict read-only execution.
- Blocks dangerous operations (`INSERT`, `UPDATE`, `DELETE`, `DROP`, `ALTER`, `TRUNCATE`, `GRANT`, `REVOKE`) and script injections.
