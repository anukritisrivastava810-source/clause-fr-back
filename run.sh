#!/bin/bash
echo "Starting Backend and Frontend for Legal Document Simplifier..."

# Start Backend
cd backend
source venv/bin/activate
export PYTHONPATH=.
uvicorn main:app --reload --port 8080 &
BACKEND_PID=$!
cd ..

# Start Frontend
cd frontend
export PATH=/opt/homebrew/bin:$PATH
npm run dev &
FRONTEND_PID=$!
cd ..

echo "Backend running on http://localhost:8080"
echo "Frontend running on http://localhost:3000"

# Wait for processes, keep script alive
wait
kill $BACKEND_PID 2>/dev/null
kill $FRONTEND_PID 2>/dev/null
