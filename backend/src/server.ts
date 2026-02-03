import { app } from './app'
import { config } from './config/env.config'
import { logger } from './config/logger.config'

const start = async () => {
    try {
        await app.listen({
            port: config.PORT,
            host: config.HOST,
        })

        logger.info(`🚀 Server running on http://${config.HOST}:${config.PORT}`)
        logger.info(`📚 API Docs: http://${config.HOST}:${config.PORT}/docs`)
        logger.info(`🏥 Health Check: http://${config.HOST}:${config.PORT}/health`)
    } catch (err) {
        logger.error('Error starting server:', err)
        process.exit(1)
    }
}

// Graceful shutdown
const gracefulShutdown = async (signal: string) => {
    logger.info(`${signal} received, closing server gracefully...`)
    await app.close()
    process.exit(0)
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
process.on('SIGINT', () => gracefulShutdown('SIGINT'))

start()
