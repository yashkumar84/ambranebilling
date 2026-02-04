#!/bin/sh

# Wait for database to be ready (optional but recommended if not using depends_on: healthcheck)
# For now, we rely on Docker Compose depends_on healthcheck, but this is a safety net
echo "Running database migrations..."
npx prisma migrate deploy

echo "Starting application..."
npm run start
