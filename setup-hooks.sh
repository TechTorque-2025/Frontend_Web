#!/bin/bash

# Setup script for git hooks
# Run this script to configure git hooks for the project

echo "🔧 Setting up git hooks..."

# Make hooks executable
chmod +x .githooks/pre-commit .githooks/pre-push

# Configure git to use our hooks directory
git config core.hooksPath .githooks

echo "✅ Git hooks configured successfully!"
echo ""
echo "Hooks installed:"
echo "  📋 pre-commit: Runs 'npm run lint' before each commit"
echo "  🏗️  pre-push: Runs 'npm run build' before each push"
echo ""
echo "To disable hooks temporarily, use:"
echo "  git commit --no-verify    (skip pre-commit hook)"
echo "  git push --no-verify      (skip pre-push hook)"