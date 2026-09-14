# Use Node 20 with full build tools (not Alpine)
FROM node:20-bookworm-slim

# Install system dependencies for canvas and better-sqlite3
# -o Acquire::Check-Valid-Until=false is used to bypass expired Debian bullseye release file issues
RUN apt-get update -o Acquire::Check-Valid-Until=false && apt-get install -y \
    python3 \
    make \
    g++ \
    build-essential \
    libcairo2-dev \
    libpango1.0-dev \
    libjpeg-dev \
    libgif-dev \
    librsvg2-dev \
    libpixman-1-dev \
    && rm -rf /var/lib/apt/lists/*

# Create app directory
WORKDIR /app

# Create non-root user
RUN groupadd -r nodejs && useradd -r -g nodejs nodejs

# Copy package files
COPY package*.json ./

# Install dependencies (use npm install instead of ci for flexibility)
RUN npm install --only=production && \
    npm cache clean --force

# Copy application code
COPY --chown=nodejs:nodejs . .

# Create data directory for SQLite
RUN mkdir -p /app/data && chown -R nodejs:nodejs /app/data

# Switch to non-root user
USER nodejs

# Expose port (optional, for future web dashboard)
EXPOSE 3000

# Start the bot
CMD ["node", "index.js"]
