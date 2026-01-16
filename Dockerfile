# Stage 1: Build Angular Frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app/angular-ui
COPY angular-ui/package*.json ./
# Install dependencies with legacy-peer-deps as required by the project
RUN npm ci --legacy-peer-deps
COPY angular-ui/ .
RUN npm run build

# Stage 2: Setup Backend
FROM node:20-alpine AS backend-builder
WORKDIR /app
COPY package*.json ./
# Install only production dependencies
RUN npm ci --omit=dev

# Stage 3: Production Image
FROM node:20-alpine
ENV NODE_ENV=production
WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Copy backend dependencies
COPY --from=backend-builder /app/node_modules ./node_modules
COPY --from=backend-builder /app/package*.json ./

# Copy compiled frontend assets
# Note: index.js expects 'angular-ui/dist/angular-ui/browser'
COPY --from=frontend-builder /app/angular-ui/dist ./angular-ui/dist

# Copy backend source code
COPY index.js .
# Create a static directory if it exists, otherwise ignore (optional but good practice)
COPY static ./static

# Create a non-root user and switch to it
# Node image comes with a 'node' user
USER node

# Expose the port
EXPOSE 3000

# Start the application
CMD ["dumb-init", "node", "index.js"]
