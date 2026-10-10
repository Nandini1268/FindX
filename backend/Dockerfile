# Base Image: Node.js 20 on Debian Bookworm (includes compatible GLIBC)
FROM node:20-bookworm-slim

# Install GCC compiler, Make, Python 3 for native C compilation and sqlite3 build
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    g++ \
    make \
    python3 \
    sqlite3 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package manifest
COPY package*.json ./

# Install npm dependencies and build sqlite3 natively
RUN npm install --build-from-source=sqlite3

# Copy application source
COPY . .

# Compile C hash table search engine
RUN gcc -o c_engine/hash_search c_engine/hash_search.c -Wall && chmod +x c_engine/hash_search

# Environment variables
ENV NODE_ENV=production
ENV PORT=5000

EXPOSE 5000

# Start Express server bound to 0.0.0.0
CMD ["node", "src/server.js"]
