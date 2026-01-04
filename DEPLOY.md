# Deployment Instructions

This project is a Node.js + Angular application. The best platform for "easy and fast" deployment with this structure (Monorepo-style, backend serving frontend) is **Render**.

## Why Render?
- **Simplicity:** It detects Node.js apps and builds them automatically.
- **Cost:** Free tier available for web services.
- **Integrated:** GitHub auto-deploy is built-in (though we can control it via CI if desired, or let Render watch the repo and only deploy when CI passes if we use "Pre-deploy Command" checks, but Render's native "Auto-Deploy" is simplest).

## Step-by-Step Deployment on Render

1. **Create an Account:** Go to [render.com](https://render.com) and sign up.
2. **New Web Service:**
   - Click "New +" -> "Web Service".
   - Connect your GitHub repository.
3. **Configure the Service:**
   - **Name:** `your-app-name`
   - **Runtime:** `Node`
   - **Build Command:** `npm install && cd angular-ui && npm install --legacy-peer-deps && cd .. && npm run build:ui`
     - *Note: We need to install dependencies for both root and angular-ui, then build the UI.*
   - **Start Command:** `npm start`
   - **Environment Variables:**
     - Add `NODE_VERSION` if needed (e.g., `18`).
     - (Optional) `MONGO_URI` if you switch to a real MongoDB in the future (currently uses in-memory DB).
4. **Deploy:** Click "Create Web Service". Render will clone, build, and start the app.

## CI/CD Integration

The provided GitHub Actions workflow (`.github/workflows/deploy.yml`) runs tests on every push.

To ensure deployment only happens after tests pass:
1. In Render Dashboard -> Settings -> **Auto Deploy**: Turn it **No**.
2. Create a **Deploy Hook** in Render Settings (scroll down to "Deploy Hook").
3. Copy the Deploy Hook URL.
4. Go to GitHub Repo -> Settings -> Secrets and variables -> Actions.
5. Add a New Repository Secret named `RENDER_DEPLOY_HOOK_URL` with the value you copied.

Now, when you push to `main`:
1. GitHub Actions will run tests.
2. If tests pass, it will hit the Render Deploy Hook.
3. Render will pull the latest code and deploy it.
