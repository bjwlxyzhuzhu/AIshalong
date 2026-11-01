FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY server/package.json server/package-lock.json ./
RUN npm ci --omit=dev --no-audit --no-fund && npm cache clean --force
COPY server/server.js ./
COPY dist/ ./public/
RUN mkdir -p /data \
 && test -s public/index.html && test -s public/education/index.html && test -s public/enterprise/index.html \
 && test -s public/government/index.html && test -s public/justice/index.html && test -s public/bank/index.html \
 && test -s public/justice/vendor/three.min.js && test -s public/admin/index.html \
 && test -s public/portal-assets/salon-qr.png && test -s public/portal-assets/skills.json \
 && test -s public/portal-assets/avatar-1.webp && test -s public/portal-assets/avatar-2.webp \
 && node --check server.js
ENV PORT=80 DATA_DIR=/data PUBLIC_DIR=/app/public
VOLUME ["/data"]
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 CMD wget --spider -q http://127.0.0.1/healthz || exit 1
CMD ["node", "server.js"]
