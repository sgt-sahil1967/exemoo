# Exemoo: one container serves the landing page, phone pad, games and pairing.
# Build the games first (npm run build) so games/ holds their built files.
FROM node:22-alpine
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY server ./server
COPY public ./public
COPY games ./games
ENV NODE_ENV=production PORT=8080 TRUST_PROXY=1
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://127.0.0.1:8080/healthz || exit 1
CMD ["node", "server/index.js"]
