import { FastifyInstance } from 'fastify'
import { TenantsController } from '../controllers/tenants.controller'
import { authMiddleware } from '@/common/middleware/auth.middleware'

export default async function tenantsRoutes(fastify: FastifyInstance) {
    const controller = new TenantsController()

    // All routes are protected
    fastify.addHook('onRequest', authMiddleware)

    /**
     * Get Current Tenant Info
     * GET /api/tenants/me
     */
    fastify.get('/me', controller.getMe)

    /**
     * Create New Tenant (Store)
     * POST /api/tenants
     */
    fastify.post('/', controller.createTenant)

    /**
     * Update Tenant Info
     * PUT /api/tenants/:id
     */
    fastify.put('/:id', controller.updateTenant)
}
