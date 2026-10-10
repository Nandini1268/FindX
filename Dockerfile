# Base Image: Node.js 20 on Debian Bookworm
FROM node:20-bookworm-slim

# Install GCC compiler and build essentials
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    g++ \
    make \
    python3 \
    sqlite3 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy backend package manifest
COPY backend/package*.json ./

# Install dependencies
RUN npm install --build-from-source=sqlite3

# Copy backend source
COPY backend/ .

# Compile C hash search engine
RUN gcc -o c_engine/hash_search c_engine/hash_search.c -Wall && chmod +x c_engine/hash_search

ENV NODE_ENV=production
ENV PORT=5000

EXPOSE 5000

CMD ["node", "src/server.js"]
