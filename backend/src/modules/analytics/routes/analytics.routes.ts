import { FastifyInstance } from 'fastify'
import { AnalyticsController } from '../controllers/analytics.controller'
import { authMiddleware } from '@/common/middleware/auth.middleware'

export default async function analyticsRoutes(fastify: FastifyInstance) {
    const controller = new AnalyticsController()

    fastify.addHook('onRequest', authMiddleware)

    /**
     * Get Dashboard Metrics
     * GET /api/analytics/dashboard
     */
    fastify.get('/dashboard', controller.getDashboardMetrics)

    /**
     * Get Sales Trends
     * GET /api/analytics/trends
     */
    fastify.get('/trends', controller.getSalesTrends)
}
