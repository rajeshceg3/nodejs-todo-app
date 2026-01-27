# Node.js To-Do List Application (Production Ready)

**CLASSIFICATION:** INTERNAL USE ONLY
**VERSION:** 1.0.0

A mission-critical To-Do List application built with a Node.js/Express backend and an advanced Angular frontend. Designed for reliability, security, and high-performance user operations.

## Architecture

- **Backend:** Node.js, Express (Security Hardened with Helmet, RateLimiting)
- **Database:** MongoDB (Dual-mode: Memory Server for Dev, Cloud URI for Prod)
- **Frontend:** Angular 20+ (Stripe-inspired UX, Optimistic UI, Mobile Optimized)
- **Logging:** Structured JSON logging via Winston
- **Testing:** Jest (Backend), Karma/Jasmine (Frontend)

## Project Structure

```
.
├── src/                # Backend Source Code
│   ├── config/         # Database & Logger Configuration
│   ├── controllers/    # Business Logic
│   ├── models/         # Data Models & Audit Logic
│   ├── routes/         # API Route Definitions
│   ├── tests/          # Integration Tests
│   ├── app.js          # Express Application Setup
│   └── server.js       # Entry Point
├── angular-ui/         # Frontend Source Code
├── logs/               # Application Logs
└── package.json        # Root Dependencies & Scripts
```

## Getting Started

### Prerequisites

- Node.js (v20+ recommended)
- npm

### Installation

1.  **Install Dependencies:**
    ```bash
    npm install
    ```
    *Note: This will verify root dependencies.*

### Operation

1.  **Start the System (Dev/Prod):**
    ```bash
    npm start
    ```
    This command performs the following sequence:
    - Builds the Angular UI (`npm run build:ui`)
    - Starts the Backend Server (`src/server.js`)
    - Access the application at: `http://localhost:3000`

2.  **Development Mode (Backend Watch):**
    ```bash
    npm run dev
    ```
    *Starts the backend with nodemon. Requires the UI to be built previously.*

## Testing Protocol

- **Backend Integration Tests:**
    ```bash
    npm test
    ```

## Features

- **Advanced Task Management:** Support for `!priority` (low, medium, high, critical), `#tags`, and `@YYYY-MM-DD` due dates.
- **Audit Logging:** Cryptographically linked audit logs for all mutations.
- **Mobile First:** Swipe-to-delete gestures and optimized touch targets.
- **Secure:** Full security headers and input validation.

## Deployment

The application is Docker-ready and supports standard CI/CD pipelines. See `DEPLOY.md` for details.
