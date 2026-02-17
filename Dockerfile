# Use Node.js LTS (Alpine for smaller size and better security)
FROM node:18-alpine

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create app directory
WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copy package files
COPY --chown=nodejs:nodejs package*.json ./

# Install dependencies (production only)
RUN npm ci --only=production && \
    npm cache clean --force

# Copy app source
COPY --chown=nodejs:nodejs . .

# Create data directory with proper permissions
RUN mkdir -p data && \
    chown -R nodejs:nodejs data

# Switch to non-root user
USER nodejs

# Expose no ports (bot doesn't need any)

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s \
  CMD node -e "console.log('healthy')" || exit 1

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the bot
CMD ["node", "index.js"]
