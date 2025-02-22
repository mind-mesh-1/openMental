#!/bin/bash

# Force update pip and install requirements
pip3 install --upgrade pip
pip3 install --no-cache-dir -r ../requirements.txt

# Start FastAPI server
python3 -m uvicorn --chdir api index:app --reload