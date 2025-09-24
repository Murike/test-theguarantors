FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
run npm ci
COPY . .
RUN npm run build:bundle

FROM node:18-alpine AS runner
WORKDIR /app
COPY --from=builder /app/dist/main.js ./
EXPOSE 3000
CMD ["node", "main.js"]