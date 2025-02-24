#!/bin/bash

# Install requirements without forcing pip upgrade and using cache
pip3 install -r ../requirements.txt

# Start FastAPI server
python3 -m uvicorn --chdir api index:app --reload