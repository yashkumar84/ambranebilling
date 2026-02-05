# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
# Install dependencies
# openssl and libc6-compat are required for Prisma on Alpine
RUN apk add --no-cache openssl libc6-compat
RUN npm install

# Copy source code
COPY . .

# Generate Prisma client and build
RUN npx prisma generate
RUN npm run build

# Production stage
FROM node:20-alpine

# Install production dependencies for Prisma
RUN apk add --no-cache openssl libc6-compat

WORKDIR /app

# Copy only what's needed for production
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/tsconfig.json ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY start.sh ./

# Make start.sh executable
RUN chmod +x start.sh

# Expose port
EXPOSE 3001

# Start the application using the script
CMD ["./start.sh"]
