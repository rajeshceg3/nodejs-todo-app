# DEVSECOPS DEPLOYMENT BRIEF: NODE-STARTER

**Date:** 2026-01-16
**Classification:** INTERNAL USE ONLY
**Subject:** Repository Reconnaissance, Risk Assessment, and Deployment Pipeline Design

---

## 📌 A. Repository Intelligence Summary

**Target:** `node-starter` (Monorepo-style Node.js + Angular)

**Forensic Analysis:**
*   **Architecture:** Hybrid monolithic application. Backend (Express.js) serves a compiled Angular frontend.
*   **Runtime:** Node.js (v20+ recommended).
*   **Database:** `mongodb-memory-server` utilized for all data storage. **Ephemeral.**
*   **Build System:** `npm`-based. Root build triggers nested `angular-ui` build.
*   **Dependencies:**
    *   **Root:** Standard Express stack. `nodemon` was improperly listed as a production dependency (remediated).
    *   **Frontend:** Angular (v20-next/alpha). High instability. Requires `--legacy-peer-deps`.
*   **Security Posture:** Minimal. No helmet/cors headers. Unsanitized inputs. No authentication.

**Operational Context:**
The application is designed for rapid prototyping (StackBlitz origin likely) but is being positioned for production deployment on Render. It lacks persistence and robustness required for mission-critical operations.

---

## 🚨 B. Critical Risks & Findings

### 1. Data Persistence (CRITICAL)
*   **Finding:** Application uses `mongodb-memory-server` for "production" database.
*   **Impact:** **TOTAL DATA LOSS** upon every deployment, restart, or crash.
*   **Remediation:** Must migrate to a managed MongoDB Atlas instance or similar persistent store immediately.

### 2. Supply Chain Fragility (HIGH)
*   **Finding:** Frontend dependencies (`@angular/*`) are on bleeding-edge/unstable versions (`20.0.0-next.0`).
*   **Impact:** `npm audit fix` breaks the build due to incompatible peer dependencies. Build reproducibility is low.
*   **Remediation:** Downgrade to stable Angular LTS (v17/18) or strictly pin all dependencies (lockfile preserved).

### 3. CI/CD Security Theater (HIGH)
*   **Finding:** Previous pipeline ran `npm audit || echo ...`, suppressing critical vulnerability alerts.
*   **Impact:** False sense of security. Known high-severity CVEs were being ignored.
*   **Remediation:** Pipeline updated to fail on Critical vulnerabilities (strict mode).

### 4. Dependency Bloat (MEDIUM)
*   **Finding:** `mongodb-memory-server` is a massive development dependency (~600MB+) included in production `dependencies`.
*   **Impact:** Slow deployments, large Docker images, increased attack surface.
*   **Remediation:** Move to `devDependencies` once persistent DB is implemented.

---

## 🧠 C. Deployment Strategy Decision

**Selected Target:** **Render (Containerized)**

**Decision Matrix:**
*   **Why Render?** Existing alignment with project documentation (`DEPLOY.md`), ease of use, and cost-effectiveness for this scale.
*   **Why Containerized (Docker)?**
    *   **Isolation:** The fragile Angular build environment requires specific Node versions and legacy flags. Docker encapsulates this mess.
    *   **Reproducibility:** "It works on my machine" is eliminated. The pipeline verifies the exact image that runs in production.
    *   **Portability:** If Render costs increase, the container can be moved to Fly.io, AWS App Runner, or DigitalOcean with zero code changes.

**Rejected Alternatives:**
*   *Static Hosting (S3/Netlify):* Rejected because the backend API is required to run the application (SOTL/Audit logic).
*   *Serverless (Lambda):* Rejected due to cold start latency affecting the in-memory database (which would reset on every invocation - catastrophic).

---

## 🧾 D. GitHub Actions Workflow (Production-Ready)

See `.github/workflows/deploy.yml` in the repository.
**Key Capabilities:**
1.  **Strict Security Gate:** Fails on Critical CVEs.
2.  **Container Verification:** Builds Docker image to ensure deployability.
3.  **Optimization:** Aggressive caching of `node_modules` (Root + Angular).
4.  **Zero-Trust:** Least privilege permissions (`contents: read`).

---

## 🛠 E. Hardening & Future Improvements

**Immediate Actions (Phase 1):**
1.  **Migrate DB:** Replace `mongodb-memory-server` with `mongoose` connecting to `process.env.MONGO_URI`.
2.  **Stabilize Frontend:** Refactor `angular-ui` to use stable Angular versions.
3.  **Secure Headers:** Install `helmet` and `cors` in `index.js`.

**Strategic Evolution (Phase 2):**
1.  **Testing:** Implement backend unit tests (currently 0% coverage).
2.  **Observability:** Add structured logging (Winston/Pino) and health check endpoints.
3.  **Auto-Rollback:** Implement blue/green deployment strategy via Render or K8s.

---
**Signed:** Jules, Elite DevSecOps Architect
