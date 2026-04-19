#!/bin/bash
echo "Starting Backend and Frontend for Legal Document Simplifier..."

# Start Backend
cd backend
source venv/bin/activate
export PYTHONPATH=.
uvicorn main:app --reload --port 8000 &
BACKEND_PID=$!
cd ..

# Start Frontend
cd frontend
export PATH=/opt/homebrew/bin:$PATH
npm run dev &
FRONTEND_PID=$!
cd ..

echo "Backend running on http://localhost:8000"
echo "Frontend running on http://localhost:3000"

# Wait for process exit, then kill both
wait -n
kill $BACKEND_PID
kill $FRONTEND_PID
