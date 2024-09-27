FROM node:22.9-slim

RUN node --version && npm --version
RUN npm install -g pnpm
RUN pnpm --version
RUN pnpm config set store-dir /$HOME/pnpm/.pnpm-store

WORKDIR /app
