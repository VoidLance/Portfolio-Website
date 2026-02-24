#!/bin/bash
# AI Agent: Check AI_AGENT_GUIDE.md for project instructions including changelog requirements
# Clean unnecessary files from dist before deployment

echo "Cleaning dist folder..."

# Remove all node_modules directories
find dist -type d -name "node_modules" -exec rm -rf {} + 2>/dev/null

# Remove .next directories (Next.js build artifacts)
find dist -type d -name ".next" -exec rm -rf {} + 2>/dev/null

# Remove source files that shouldn't be deployed
find dist -name "*.ts" -not -name "*.d.ts" -delete 2>/dev/null
find dist -name "*.tsx" -delete 2>/dev/null
find dist -name "tsconfig.json" -delete 2>/dev/null
find dist -name "package.json" -delete 2>/dev/null
find dist -name ".env" -delete 2>/dev/null
find dist -name ".env.local" -delete 2>/dev/null
find dist -name ".gitignore" -delete 2>/dev/null

echo "Dist folder cleaned!"
