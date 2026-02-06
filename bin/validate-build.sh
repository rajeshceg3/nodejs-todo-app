#!/bin/bash
set -e

echo "🔍 Starting Build Validation..."

echo "Linting Root..."
npm run lint

echo "🧪 Testing Backend..."
npm test

echo "🏗️ Building Frontend..."
npm run build:ui

echo "🐳 Verifying Docker Build..."
docker build . -t app-candidate:local

echo "✅ Build Validation Passed."
