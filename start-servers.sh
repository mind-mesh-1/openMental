#!/bin/bash

# Install Python dependencies
cd server
pip install -r requirements.txt

# Start FastAPI server in the background
cd app
python3 -m uvicorn main:app --host 0.0.0.0 --port 50564 > ../fastapi.log 2>&1 &
cd ../..

# Install Node.js dependencies and start Next.js
pnpm install
pnpm dev