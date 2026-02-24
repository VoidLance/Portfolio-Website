#!/bin/bash
# AI Agent: Check AI_AGENT_GUIDE.md for project instructions including changelog requirements
# Build script for React app
# Installs dependencies and builds the production-ready app

echo "Installing dependencies..."
npm install

echo "Building React app with Vite..."
npm run build

echo "Build complete! The dist/ folder contains your optimized site."
echo "Upload the contents of dist/ to your web server or Neocities account."
