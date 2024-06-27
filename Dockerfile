# Build Stage
FROM node:20.15.0-bookworm-slim AS build

ENV USER=node

WORKDIR /usr/src/app

# Install build dependencies
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        python3 \
    && rm -rf /var/lib/apt/lists/*

COPY package*.json ./

# Install all dependencies (including dev dependencies for build)
RUN npm install

COPY . .

RUN npm run build

# Production Stage
FROM node:20.15.0-bookworm-slim

ENV NODE_ENV production
USER ${USER}

WORKDIR /usr/src/app

# Copy built files from build stage
COPY --chown=${USER}:${USER} --from=build /usr/src/app/dist ./dist
COPY --chown=${USER}:${USER} --from=build /usr/src/app/node_modules ./node_modules
COPY --chown=${USER}:${USER} package*.json ./

CMD ["node", "dist/bot.js"]
