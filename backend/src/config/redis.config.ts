import Redis from 'ioredis'
import { config } from './env.config'
import { logger } from './logger.config'

const redis = new Redis(config.REDIS_URL, {
    retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000)
        return delay
    },
    maxRetriesPerRequest: 3,
})

redis.on('connect', () => logger.info('✅ Redis connected'))
redis.on('error', (err: any) => logger.error('❌ Redis error:', err))
redis.on('reconnecting', () => logger.warn('⚠️  Redis reconnecting...'))

// Graceful shutdown
process.on('beforeExit', async () => {
    await redis.quit()
    logger.info('Redis disconnected')
})

export { redis }
