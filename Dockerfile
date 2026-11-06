# Exemoo: one container serves the landing page, phone pad, games and pairing.
#
# Stage 1 builds every game in games-src/ into games/ from the committed lockfiles (npm ci), so the
# image always matches the sources. Static games already in games/ (cricket, farm-dash, pad-test,
# rapids-row) are copied as-is. Stage 2 is the small runtime image: server + public + built games.
#
#   docker build -t exemoo .
#   docker run --rm -p 8080:8080 exemoo        # then open http://localhost:8080
#
# Phones need HTTPS for motion sensors: put the container behind a TLS proxy (Render, Fly, Caddy…).

FROM node:22-bookworm-slim AS games
WORKDIR /app
# The games import the SDK from public/sdk, so public/ is part of the build context.
COPY scripts/build-games.mjs scripts/
COPY public ./public
COPY games ./games
COPY games-src ./games-src
RUN node scripts/build-games.mjs --ci

FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production PORT=8080 TRUST_PROXY=1
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --no-audit --no-fund && npm cache clean --force
COPY server ./server
COPY public ./public
COPY --from=games /app/games ./games
USER node
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s CMD wget -qO- http://127.0.0.1:8080/healthz || exit 1
# node is PID 1 and handles SIGTERM itself (graceful drain, then exit).
CMD ["node", "server/index.js"]
