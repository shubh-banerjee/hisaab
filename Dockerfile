FROM node:20-slim

WORKDIR /app

# Copy only the manifest + lockfile first so Docker can cache the
# npm ci layer independently of application code changes.
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Now copy the rest of the app (.dockerignore keeps node_modules, .env,
# service-account JSON files, and .git out of the build context entirely).
COPY . .

# Cloud Run injects PORT at runtime and expects the container to listen on
# it — server.js already reads process.env.PORT (falls back to 8080 for
# local `docker run` without -e PORT=...). This ENV line is just the local/
# default value; Cloud Run overrides it automatically per revision.
ENV PORT=8080
EXPOSE 8080

# Same start command as local dev (`npm start` -> `node server.js`).
CMD ["npm", "start"]
