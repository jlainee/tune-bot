# Build Stage
FROM node:18 AS build

WORKDIR /usr/src/app

# Install build dependencies
RUN apt-get update \
    && apt-get install -y python3

COPY package*.json ./

# Install all dependencies (including dev dependencies for build)
RUN npm install

COPY . .

RUN npm run build

# Production Stage
FROM node:18

# Set working directory inside the production container
WORKDIR /usr/src/app

# Copy built files from build stage
COPY --from=build /usr/src/app/dist ./dist
COPY --from=build /usr/src/app/node_modules ./node_modules
COPY package*.json ./

CMD ["npm", "start"]
