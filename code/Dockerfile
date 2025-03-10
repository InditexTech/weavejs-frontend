FROM node:20-alpine as base

# Install dependencies step
FROM base AS deps

RUN sed -i 's/https/http/' /etc/apk/repositories
RUN apk add --no-cache bash g++ make python3
RUN apk add --no-cache build-base cairo-dev cairo cairo-tools pango pango-dev jpeg-dev zlib-dev freetype-dev lcms2-dev openjpeg-dev tiff-dev tk-dev tcl-dev

WORKDIR /app
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

RUN sed -i 's/https/http/' /etc/apk/repositories
RUN apk add --no-cache libjpeg libpng cairo pango

WORKDIR /app
ENV NODE_ENV production
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
COPY --from=builder /app/public ./public
RUN mkdir .next
RUN chown nextjs:nodejs .next
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
USER nextjs
EXPOSE 8080
ENV PORT 8080
CMD ["node", "server.js"]