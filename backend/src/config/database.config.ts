import { PrismaClient } from '@prisma/client'
import { logger } from './logger.config'

const prisma = new PrismaClient({
    log: [
        { level: 'query', emit: 'event' },
        { level: 'error', emit: 'stdout' },
        { level: 'warn', emit: 'stdout' },
    ],
})

// Log queries in development
if (process.env.NODE_ENV === 'development') {
    prisma.$on('query', (e: any) => {
        logger.debug({ query: e.query, params: e.params, duration: e.duration }, 'Database query')
    })
}

// Test connection
prisma.$connect()
    .then(() => logger.info('✅ Database connected'))
    .catch((err: any) => {
        logger.error('❌ Database connection failed:', err)
        process.exit(1)
    })

// Graceful shutdown
process.on('beforeExit', async () => {
    await prisma.$disconnect()
    logger.info('Database disconnected')
})

export { prisma }
