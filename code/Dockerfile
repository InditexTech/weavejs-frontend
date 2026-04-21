# SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
#
# SPDX-License-Identifier: Apache-2.0

ARG GITHUB_SHA

FROM node:24 AS base

# Install dependencies step
FROM base AS deps

RUN apt-get update -y
RUN apt-get install -y bash g++ make python3
RUN apt-get install -y build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev libtool autoconf automake

WORKDIR /app
COPY package*.json ./
RUN npm pkg delete scripts.prepare
RUN npm ci

# Build step
FROM base AS builder

WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV GITHUB_SHA=$GITHUB_SHA
RUN npm run build:img

# Runtime image step
FROM base AS runner

RUN apt-get update -y
RUN apt-get install -y build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev libtool autoconf automake

WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 tts
RUN mkdir .output
RUN chown tts:nodejs .output
COPY --from=builder --chown=nextjs:nodejs /app/.env.production ./.env.production
COPY --from=builder --chown=nextjs:nodejs /app/.output ./.output
USER tts
EXPOSE 8080
ENV PORT=8080
CMD ["node", "--env-file=/app/.env.production", ".output/server/index.mjs"]
