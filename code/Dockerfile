FROM node:20 as base

# Install dependencies step
FROM base AS deps

# Need to add this in local for CA in order to make the install of dependencies work
ENV NODE_EXTRA_CA_CERTS=/app/cert.pem

RUN apt-get update -y
RUN apt-get install -y bash g++ make python3
RUN apt-get install -y build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev libtool autoconf automake

WORKDIR /app
# Need to add this in local for CA in order to make the install of dependencies work
COPY cert.pem ./
COPY package*.json ./
RUN npm pkg delete scripts.prepare
RUN npm ci

# Build step
FROM base AS builder

WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Runtime image
FROM base AS runner

RUN apt-get update -y
RUN apt-get install -y build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev libtool autoconf automake

WORKDIR /app
ENV NODE_ENV production
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
RUN mkdir .next
RUN chown nextjs:nodejs .next
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
USER nextjs
EXPOSE 8080
ENV PORT 8080
CMD ["node", "server.js"]