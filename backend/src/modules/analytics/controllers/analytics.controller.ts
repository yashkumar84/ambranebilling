import { FastifyReply, FastifyRequest } from 'fastify'
import { AnalyticsService } from '../services/analytics.service'
import { ApiResponse } from '@/common/dtos/response.dto'

export class AnalyticsController {
    private analyticsService: AnalyticsService

    constructor() {
        this.analyticsService = new AnalyticsService()
    }

    getDashboardMetrics = async (request: FastifyRequest, reply: FastifyReply) => {
        const tenantId = (request as any).user?.tenantId

        if (!tenantId && !(request as any).user?.isSuperAdmin) {
            return reply.code(403).send(ApiResponse.error('Tenant context required'))
        }

        try {
            const metrics = await this.analyticsService.getDashboardMetrics(tenantId)
            return reply.send(ApiResponse.success(metrics))
        } catch (error: any) {
            return reply.code(500).send(ApiResponse.error(error.message))
        }
    }

    getSalesTrends = async (request: FastifyRequest, reply: FastifyReply) => {
        const tenantId = (request as any).user?.tenantId
        const { days = 7 } = request.query as { days?: number }

        try {
            const trends = await this.analyticsService.getSalesTrends(tenantId, Number(days))
            return reply.send(ApiResponse.success(trends))
        } catch (error: any) {
            return reply.code(500).send(ApiResponse.error(error.message))
        }
    }
}
