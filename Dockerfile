# BASE
FROM node:20.15.0-bookworm-slim AS base

ENV USER=node

WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        python3 \
        build-essential \
        ca-certificates \
        ffmpeg \
    && update-ca-certificates \
    && rm -rf /var/lib/apt/lists/*

COPY package*.json ./

RUN npm ci

COPY . .

# DEV
FROM base as dev

WORKDIR /app

COPY --from=base /app/node_modules ./node_modules
ENV NODE_ENV development
CMD ["npm", "run", "dev"]

# BUILD
FROM base as build
RUN npm run build

# PROD
FROM node:20.15.0-bookworm-slim as prod

ENV NODE_ENV production
USER ${USER}

WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        python3 \
        build-essential \
        ca-certificates \
        ffmpeg \
    && update-ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Copy built files from build stage
COPY --chown=${USER}:${USER} --from=build /app/dist ./dist
COPY --chown=${USER}:${USER} --from=build /app/node_modules ./node_modules
COPY --chown=${USER}:${USER} package*.json ./

CMD ["node", "dist/index.js"]
