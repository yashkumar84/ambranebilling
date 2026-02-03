import { FastifyInstance } from 'fastify'
import { TenantsController } from '../controllers/tenants.controller'
import { authMiddleware } from '@/common/middleware/auth.middleware'

export default async function tenantsRoutes(fastify: FastifyInstance) {
    const controller = new TenantsController()

    // Create a new tenant (onboarding)
    // POST /api/tenants
    fastify.post('/', {
        preHandler: [authMiddleware]
    }, controller.createTenant)
}
