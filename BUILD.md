# 🏗️ Build System & Developer Contract

This document defines the strict build and validation process for this repository. All changes must adhere to this contract before being pushed.

## 📋 Prerequisites

*   **Node.js**: v20.x (Enforced via `.nvmrc` and `engines`)
*   **Docker**: Required for container verification.

To ensure you are on the correct Node version:
```bash
nvm use
```

## 🚀 Quick Start

### 1. Deterministic Setup
Install all dependencies (Root + Frontend) in a clean, reproducible state.
**Do not use `npm install` directly if you want to be safe.**

```bash
npm run setup
```
*   Uses `npm ci` to respect lockfiles.
*   Handles `angular-ui` dependency complexity automatically.

### 2. Local Validation (The "Works on My Machine" Check)
Before pushing, run the full validation suite. This mirrors the CI pipeline.

```bash
npm run validate
```
This runs:
1.  **Linting**: Static code analysis.
2.  **Backend Tests**: Unit & Integration checks.
3.  **Frontend Build**: Verifies the UI compiles.
4.  **Docker Build**: Verifies the application containerizes correctly.

### 3. Running Locally
To start the backend and build the UI:

```bash
npm start
```
*   Server: `http://localhost:3000`

## ⚙️ CI/CD Pipeline

The repository uses GitHub Actions (`.github/workflows/build.yml`) to enforce quality on every Push and Pull Request to `main`.

**Pipeline Stages:**
1.  **Compliance**: Dependency Audit (Critical level) & Linting.
2.  **Backend Verification**: Unit & Integration tests.
3.  **Frontend Verification**: Headless Chrome tests & Production Build.
4.  **Packaging**: Docker Image Build & Artifact Archival.

**Artifacts Produced:**
*   `frontend-dist`: Zip of the compiled Angular application.
*   `docker-image`: Tarball of the production Docker image.

## 🐳 Docker
The `Dockerfile` is a multi-stage build designed for production.
*   **Stage 1**: Build Frontend (from source).
*   **Stage 2**: Setup Backend (production deps only).
*   **Stage 3**: Final Alpine image (minimal footprint).

To build manually:
```bash
docker build . -t app:latest
```

## ⚠️ Common Issues
*   **"Peer Dependency" Errors**: Always use `npm run setup` which handles legacy peer deps for Angular.
*   **Build Failure**: Check `npm run validate` output. The CI is strict.
