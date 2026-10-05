# Use official Node.js LTS lightweight Alpine image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Set production environment
ENV NODE_ENV=production
ENV PORT=3000

# Copy package descriptors first to leverage Docker layer caching
COPY package*.json ./

# Install only production dependencies
RUN npm ci --omit=dev

# Copy application source code
COPY src/ ./src/
COPY public/ ./public/

# Switch to non-root user for security best practices
USER node

# Expose server port
EXPOSE 3000

# Health check probe for Docker / Kubernetes container orchestrators
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

# Start application
CMD ["node", "src/server.js"]
