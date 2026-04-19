# Legal Document Simplifier

Welcome to the Legal Document Simplifier with Risk Surface Mapping! This project converts dense legal jargon into plain English, flags risky clauses using strict parametric rules combined with AI insights, and visualizes everything beautifully on a dashboard.

## 📁 Project Structure

The project is structured as a modern monorepo:

- `/backend`: A Python FastAPI backend.
  - Controls document extraction (`pdfplumber` / `python-docx`).
  - Merges parametric risk logic (`services/rule_engine.py`) with AI intelligence (`services/ai_service.py`).
  - Built on a local SQLite database that mirrors PostgreSQL structure so you can view past results easily.
- `/frontend`: A Next.js frontend built with React and TailwindCSS.
  - Contains a beautiful Drag-and-Drop file uploader.
  - Displays a comprehensive dashboard with Recharts Area Charts showing where risks occur in your document.

## 🚀 How to Run the Project

We have built a single file script to boot up both your Python Backend and Next.js Frontend servers simultaneously. To use your app, simply run this command:

```bash
cd /Users/anukritisrivastava/Desktop/TECHYYYYY/clause-fr-back
./run.sh
```

**What the `./run.sh` script does:**
1. It starts up the FastAPI backend on completely separate isolated virtual environments.
2. It starts up the Next.js frontend server.
3. Once running, you will be able to access the app at `http://localhost:3000`.

### Alternative: Running Manually

If you prefer to start them manually (or if you get errors running them together):

**1. Run the Backend (`http://localhost:8000`)**
```bash
cd backend
source venv/bin/activate
uvicorn main:app --reload --port 8000
```
*You can view your available API endpoints directly by visiting `http://localhost:8000/docs` in your browser!*

**2. Run the Frontend (`http://localhost:3000`)**
```bash
cd frontend
npm run dev
```

## 🔐 API Key Configuration

Your API key has already been added to `/backend/.env`. If you ever need to change it, open that file and update the `GEMINI_API_KEY`!
