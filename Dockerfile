# base node image
FROM node:21-bullseye-slim as base

# Install openssl for Prisma
RUN apt-get update && apt-get install -y openssl

# Install all node_modules, including dev dependencies
FROM base as deps

RUN mkdir /app
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install --production=false && npm update chokidar
RUN mkdir /.npm && chown -R 1004000000:0 "/.npm"

# Setup production node_modules
FROM base as production-deps

ENV NODE_ENV production

RUN mkdir /app
WORKDIR /app

COPY --from=deps /app/node_modules /app/node_modules
ADD package.json package-lock.json ./
RUN npm prune --production

# Build the app
FROM base as build

RUN mkdir /app
WORKDIR /app

COPY --from=deps /app/node_modules /app/node_modules

ADD prisma .
RUN npx prisma generate

ADD . .
RUN chmod -R 775 prisma
RUN npm run build

# Finally, build the production image with minimal footprint
FROM base

ENV NODE_ENV production

RUN mkdir /app
WORKDIR /app

COPY --from=production-deps /app/node_modules /app/node_modules
COPY --from=build /app/node_modules/.prisma /app/node_modules/.prisma
COPY --from=build /app/build /app/build
COPY --from=build /app/public /app/public
ADD . .
RUN chmod -R 775 prisma

# Container exposes port 3000
EXPOSE 3000

CMD ["npm", "run", "start"]
