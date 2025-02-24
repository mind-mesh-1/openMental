#!/bin/bash

# Install poetry using pip for faster installation
pip install poetry==1.7.1

# Configure poetry
poetry config virtualenvs.create false
poetry config installer.max-workers 4

# Install only production dependencies with parallel installation
POETRY_VIRTUALENVS_CREATE=false poetry install --no-root --no-dev --no-interaction --parallel