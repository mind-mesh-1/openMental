#!/bin/bash

# Install poetry
curl -sSL https://install.python-poetry.org | python3 -

# Add poetry to PATH
export PATH="/root/.local/bin:$PATH"

# Configure poetry
poetry config virtualenvs.create false

# Install dependencies
poetry install --no-root --no-dev